"use client";

import { useEffect, useState } from "react";
import { prefersReducedMotion } from "@/lib/lenis-store";

/**
 * A small terminal that types out the kind of jobs our automations do.
 * It is an illustration, and says so in its title bar.
 */
const LINES = [
  { agent: "chip", text: "new lead scored 92/100, follow-up sent" },
  { agent: "halo", text: "answered a WhatsApp question at 03:12" },
  { agent: "buzz", text: "3 posts scheduled for the week" },
  { agent: "digits", text: "monthly report ready, cash flow flagged" },
  { agent: "buddy", text: "leave request approved and logged" },
  { agent: "chip", text: "meeting booked for Thursday 10:00" },
];

const AGENT_COLOURS: Record<string, string> = {
  buzz: "#5B8CFF",
  chip: "#4ADE80",
  digits: "#F87171",
  buddy: "#FBBF24",
  halo: "#D06BFF",
};

const VISIBLE_LINES = 3;
const TYPE_MS = 26;
const HOLD_MS = 1400;

export default function ConsoleFeed() {
  const [index, setIndex] = useState(0);
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion()) {
      setTyped(LINES[index].text.length);
      return;
    }
    const full = LINES[index].text.length;
    const isDone = typed >= full;
    const timer = setTimeout(
      () => {
        if (isDone) {
          setIndex((current) => (current + 1) % LINES.length);
          setTyped(0);
        } else {
          setTyped((current) => current + 1);
        }
      },
      isDone ? HOLD_MS : TYPE_MS,
    );
    return () => clearTimeout(timer);
  }, [index, typed]);

  const history = Array.from({ length: VISIBLE_LINES - 1 }, (_, i) => {
    const offset = VISIBLE_LINES - 1 - i;
    return LINES[(index - offset + LINES.length * 2) % LINES.length];
  });
  const current = LINES[index];

  return (
    <div className="font-code w-full max-w-md overflow-hidden rounded-lg border border-white/10 bg-black/70 text-[11px] backdrop-blur-sm md:text-xs" aria-hidden="true">
      <div className="flex items-center gap-1.5 border-b border-white/10 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="h-2 w-2 rounded-full bg-white/20" />
        <span className="ml-2 text-white/40">automation.log (demo)</span>
        <span className="ml-auto flex items-center gap-1.5 text-white/40">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[#4ADE80]" />
          live
        </span>
      </div>
      <div className="space-y-1.5 px-3 py-3">
        {history.map((line, i) => (
          <p key={`${line.agent}-${line.text}`} className="truncate text-white/35" style={{ opacity: 0.45 + i * 0.25 }}>
            <span style={{ color: AGENT_COLOURS[line.agent] }}>{line.agent}</span> ✓ {line.text}
          </p>
        ))}
        <p className="truncate text-white/90">
          <span style={{ color: AGENT_COLOURS[current.agent] }}>{current.agent}</span> › {current.text.slice(0, typed)}
          <span className="ml-0.5 inline-block h-3 w-1.5 translate-y-0.5 animate-pulse bg-white/80" />
        </p>
      </div>
    </div>
  );
}
