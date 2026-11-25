"use client";

import { useCallback, useEffect, useState } from "react";
import { scrollToY } from "@/lib/lenis-store";

/**
 * Section progress dots on the right edge, plus keyboard travel: the up and
 * down arrows jump to the previous or next section. Arrow keys are left alone
 * whenever focus is in something that uses them (sliders, tabs, fields).
 * Desktop only: on a phone the dots would sit on top of the content.
 */

const SECTIONS = [
  { id: "top", label: "Home" },
  { id: "services", label: "Services" },
  { id: "process", label: "How we work" },
  { id: "capabilities", label: "Capabilities" },
  { id: "team", label: "Team" },
  { id: "calculator", label: "Time calculator" },
  { id: "testimonials", label: "Testimonials" },
  { id: "contact", label: "Contact" },
];

/** A section counts as current once its top passes this share of the screen. */
const ACTIVE_LINE = 0.4;
/** Matches the scroll-margin in globals.css, so headings clear the navbar. */
const NAV_OFFSET_PX = 96;
const ARROW_KEYS_OWNED_BY = "input, textarea, select, [contenteditable='true'], [role='tab'], [role='tablist'], [role='slider'], [role='dialog']";

function sectionTop(id: string): number | null {
  if (id === "top") return 0;
  const el = document.getElementById(id);
  if (!el) return null;
  return el.getBoundingClientRect().top + window.scrollY - NAV_OFFSET_PX;
}

function currentIndex(): number {
  const line = window.scrollY + window.innerHeight * ACTIVE_LINE;
  let active = 0;
  SECTIONS.forEach(({ id }, i) => {
    const top = sectionTop(id);
    if (top !== null && top + NAV_OFFSET_PX <= line) active = i;
  });
  return active;
}

export default function SectionDots() {
  const [active, setActive] = useState(0);

  const goTo = useCallback((index: number) => {
    const target = SECTIONS[Math.max(0, Math.min(SECTIONS.length - 1, index))];
    const top = sectionTop(target.id);
    if (top !== null) scrollToY(Math.max(0, top));
  }, []);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      setActive(currentIndex());
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey || event.defaultPrevented) return;
      if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
      const focused = event.target as HTMLElement | null;
      if (focused?.closest(ARROW_KEYS_OWNED_BY)) return;
      if (document.body.style.overflow === "hidden") return; // the menu is open
      event.preventDefault();
      goTo(currentIndex() + (event.key === "ArrowDown" ? 1 : -1));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goTo]);

  return (
    <nav aria-label="Sections" className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 md:block">
      <ol className="flex flex-col items-end gap-1">
        {SECTIONS.map(({ id, label }, i) => {
          const isActive = i === active;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => goTo(i)}
                aria-label={label}
                aria-current={isActive ? "location" : undefined}
                className="group flex h-6 items-center gap-3"
              >
                <span className={`font-code text-[10px] uppercase tracking-[0.25em] text-white/70 transition-opacity duration-300 ${isActive ? "opacity-0 group-hover:opacity-100" : "opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100"}`}>
                  {label}
                </span>
                <span
                  className={`block rounded-full transition-all duration-500 ${
                    isActive ? "h-5 w-[5px] bg-gradient-to-b from-[#5B6CFF] to-[#D05CFF]" : "h-[5px] w-[5px] bg-white/30 group-hover:bg-white/70"
                  }`}
                />
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
