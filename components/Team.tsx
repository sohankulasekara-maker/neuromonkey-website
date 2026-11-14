"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import Fall from "./Fall";
import StepContent from "./StepContent";
import { whatsappLink } from "@/lib/contact";
import { prefersReducedMotion } from "@/lib/lenis-store";

/**
 * Meet the agents, as a character-select screen (rebuilt 14 Nov 2026). The
 * five drop in from above as the section scrolls into view. Pick one (click,
 * tap, or arrow keys) to see what it does. Until someone picks, it cycles.
 */
const TEAM = [
  {
    name: "Buzz",
    role: "Marketing & Social Media",
    image: "/team/buzz.png",
    colour: "#3B82F6",
    line: "Today's reel is posted. Three more are queued for the week.",
    tasks: ["Writes and designs your posts", "Schedules Instagram, Facebook, LinkedIn and TikTok", "You approve, Buzz publishes"],
  },
  {
    name: "Chip",
    role: "Sales",
    image: "/team/chip.png",
    colour: "#22C55E",
    line: "Two meetings booked while you were at lunch.",
    tasks: ["Scores every new lead", "Writes and sends the follow-ups", "Books meetings into your calendar"],
  },
  {
    name: "Digits",
    role: "Finance",
    image: "/team/digits.png",
    colour: "#EF4444",
    line: "Cash flow looks tight on the 24th. Want the breakdown?",
    tasks: ["Real-time reports", "Tracks every expense", "Predicts cash flow before month end"],
  },
  {
    name: "Buddy",
    role: "HR",
    image: "/team/buddy.png",
    colour: "#F59E0B",
    line: "Leave request approved and logged. The team calendar is updated.",
    tasks: ["Answers staff questions any time", "Keeps leave and onboarding moving", "Handles the paperwork nobody wants"],
  },
  {
    name: "Halo",
    role: "Customer Care",
    image: "/team/halo.png",
    colour: "#A855F7",
    line: "Answered 41 customer questions overnight. None needed a human.",
    tasks: ["Replies on WhatsApp, your website and Instagram", "Trained on your real conversations", "Awake at 3am so you are not"],
  },
];

const CYCLE_MS = 3800;
/** Each agent drops from a slightly different height and tilt. */
const DROPS = [
  { y: -260, rotate: -16 },
  { y: -340, rotate: 12 },
  { y: -220, rotate: -8 },
  { y: -320, rotate: 14 },
  { y: -280, rotate: -12 },
];

export default function Team() {
  const [state, setState] = useState({ active: 0, direction: 1 });
  const [hasChosen, setHasChosen] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const isOnScreen = useRef(false);

  const select = (index: number) => {
    const next = (index + TEAM.length) % TEAM.length;
    setState((current) => ({ active: next, direction: next >= current.active ? 1 : -1 }));
  };

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(([entry]) => {
      isOnScreen.current = entry.isIntersecting;
    }, { threshold: 0.3 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (hasChosen || prefersReducedMotion()) return;
    const timer = setInterval(() => {
      if (!isOnScreen.current || document.hidden) return;
      setState((current) => ({ active: (current.active + 1) % TEAM.length, direction: 1 }));
    }, CYCLE_MS);
    return () => clearInterval(timer);
  }, [hasChosen]);

  const choose = (index: number) => {
    setHasChosen(true);
    select(index);
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    choose(state.active + (event.key === "ArrowRight" ? 1 : -1));
  };

  const agent = TEAM[state.active];

  return (
    <section id="team" ref={sectionRef} className="relative overflow-hidden border-t border-white/10 py-24">
      {/* The floor glows in the chosen agent's colour */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-[38%] h-[420px] w-[820px] max-w-[130vw] -translate-x-1/2 rounded-full opacity-25 blur-[130px] transition-colors duration-700"
        style={{ backgroundColor: agent.colour }}
      />

      <div className="relative mx-auto max-w-6xl px-8 md:px-16">
        <Fall from={{ y: 70, scale: 0.94 }} to={{ y: -50 }}>
          <p className="font-code mb-4 text-center text-[11px] uppercase tracking-[0.3em] text-white/50">Select your agent</p>
          <h2 className="mb-4 text-center text-[2.5rem] font-bold leading-[0.92] tracking-[-0.02em] md:text-[4rem]">Meet Our AI Agents.</h2>
          <p className="mx-auto mb-12 max-w-md text-center text-sm text-white/50">
            Each one is trained for a specific department. Together, they run your business while you sleep.
          </p>
        </Fall>

        <div role="tablist" aria-label="AI agents" onKeyDown={onKeyDown} className="flex items-end justify-center gap-1 sm:gap-6 md:gap-10">
          {TEAM.map(({ name, role, image, colour }, i) => {
            const isActive = i === state.active;
            return (
              <Fall key={name} from={DROPS[i]} to={{ y: 120, rotate: -DROPS[i].rotate / 2 }} delay={i * 0.035} className="w-1/5 max-w-[150px]">
                <button
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-controls="agent-panel"
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => choose(i)}
                  className="group flex w-full flex-col items-center outline-none"
                >
                  <div
                    className={`relative aspect-[3/4] w-full transition-all duration-500 ease-out ${
                      isActive ? "-translate-y-3 scale-110" : "scale-90 opacity-45 grayscale-[0.6] group-hover:opacity-80 group-hover:grayscale-0"
                    }`}
                  >
                    <Image src={image} alt={`${name}, ${role}`} fill sizes="(min-width: 768px) 150px, 20vw" className="object-contain object-bottom" />
                  </div>
                  {/* Landing pad */}
                  <span
                    aria-hidden="true"
                    className="mt-1 h-1.5 w-3/4 rounded-full transition-all duration-500"
                    style={{ backgroundColor: isActive ? colour : "rgba(255,255,255,0.12)", boxShadow: isActive ? `0 0 24px 4px ${colour}` : "none" }}
                  />
                  <span className={`mt-3 text-xs font-bold transition-colors md:text-sm ${isActive ? "text-white" : "text-white/40 group-hover:text-white/80"} group-focus-visible:underline`}>
                    {name}
                  </span>
                </button>
              </Fall>
            );
          })}
        </div>

        <Fall from={{ y: 90 }} to={false} className="mx-auto mt-12 max-w-3xl">
          <div id="agent-panel" role="tabpanel" className="gradient-border overflow-hidden rounded-xl bg-black/70 p-6 backdrop-blur-sm md:p-9">
            <StepContent stepKey={agent.name} direction={state.direction} className="min-h-[300px] sm:min-h-[230px]">
              <div className="grid gap-6 sm:grid-cols-[1.1fr_1fr] sm:gap-10">
                <div>
                  <p className="font-code text-[11px] uppercase tracking-[0.3em]" style={{ color: agent.colour }}>
                    Agent 0{state.active + 1} / 0{TEAM.length} · {agent.role}
                  </p>
                  <h3 className="mt-2 text-4xl font-bold tracking-[-0.02em] text-white md:text-5xl">{agent.name}</h3>
                  <p className="font-code mt-5 rounded-lg rounded-bl-sm border border-white/10 bg-white/[0.04] px-4 py-3 text-xs leading-relaxed text-white/80">
                    &ldquo;{agent.line}&rdquo;
                  </p>
                  <p className="mt-2 text-[10px] text-white/30">Example message</p>
                </div>
                <div className="flex flex-col justify-between gap-6">
                  <ul className="space-y-3">
                    {agent.tasks.map((task) => (
                      <li key={task} className="flex gap-3 text-sm leading-snug text-white/70">
                        <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: agent.colour }} />
                        {task}
                      </li>
                    ))}
                  </ul>
                  <a
                    href={whatsappLink(`Hi NeuroMonkey, I'd like to put ${agent.name} (${agent.role}) to work in my business.`)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center justify-between bg-white px-5 py-3.5 text-sm font-semibold text-black transition-colors hover:bg-white/90"
                  >
                    Put {agent.name} to work
                    <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                  </a>
                </div>
              </div>
            </StepContent>
          </div>
        </Fall>
      </div>
    </section>
  );
}
