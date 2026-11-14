"use client";

import { useRef, useState } from "react";
import { useMotionValueEvent, useScroll, type MotionValue } from "framer-motion";
import { scrollToY } from "@/lib/lenis-store";

/**
 * A pinned scene that scrolling steps through (14 Nov 2026).
 *
 * The section is taller than the screen and its content sticks, so the scroll
 * distance drives which step is showing. Returns the section ref, a 0-1
 * progress value, the current step, and a way to jump to a step.
 */
export interface PinnedSteps {
  ref: React.RefObject<HTMLElement | null>;
  progress: MotionValue<number>;
  active: number;
  /** +1 when the last change went forward, -1 when it went back. */
  direction: number;
  goTo: (step: number) => void;
}

export function usePinnedSteps(count: number): PinnedSteps {
  const ref = useRef<HTMLElement>(null);
  const [state, setState] = useState({ active: 0, direction: 1 });
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });

  useMotionValueEvent(scrollYProgress, "change", (value) => {
    const next = Math.min(count - 1, Math.max(0, Math.floor(value * count)));
    setState((current) => (current.active === next ? current : { active: next, direction: next > current.active ? 1 : -1 }));
  });

  const goTo = (step: number) => {
    const el = ref.current;
    if (!el) return;
    const travel = el.offsetHeight - window.innerHeight;
    const top = el.getBoundingClientRect().top + window.scrollY;
    scrollToY(top + ((step + 0.5) / count) * travel);
  };

  return { ref, progress: scrollYProgress, active: state.active, direction: state.direction, goTo };
}

/** Section height: one screen, plus this much scroll per step. */
export function pinnedHeight(count: number, vhPerStep: number): string {
  return `calc(100svh + ${count * vhPerStep}vh)`;
}
