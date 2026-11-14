"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

/**
 * Scroll-driven "fall into place, then move out" (14 Nov 2026).
 *
 * The element's journey across the screen drives it: it starts displaced
 * (`from`), lands in its real position, holds, then leaves (`to`). Scrolling
 * back up plays it in reverse. Progress 0 is the element's top touching the
 * bottom of the screen; 1 is its bottom leaving the top.
 */

export interface Pose {
  x?: number;
  y?: number;
  rotate?: number;
  scale?: number;
}

interface FallProps {
  children: React.ReactNode;
  className?: string;
  /** Where it comes from. Defaults to rising 90px. */
  from?: Pose;
  /** Where it leaves to. Pass `false` to stay put once landed. */
  to?: Pose | false;
  /** Lands later, as a share of the journey. Use for staggering siblings. */
  delay?: number;
}

/** Journey points: start, landed, starts leaving, gone. */
const LAND_AT = 0.3;
const LEAVE_AT = 0.78;
const START_AT = 0.02;
const SPRING = { stiffness: 140, damping: 24, mass: 0.4 };

const DEFAULT_FROM: Pose = { y: 90 };
const DEFAULT_TO: Pose = { y: -70 };

export default function Fall({ children, className = "", from = DEFAULT_FROM, to = DEFAULT_TO, delay = 0 }: FallProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isReduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const progress = useSpring(scrollYProgress, SPRING);

  const landAt = Math.min(LAND_AT + delay, 0.5);
  const startAt = Math.min(START_AT + delay, landAt - 0.05);
  const out = to === false ? {} : to;
  const stops = [startAt, landAt, LEAVE_AT, 1];
  const leaves = to !== false;

  const x = useTransform(progress, stops, [from.x ?? 0, 0, 0, out.x ?? 0]);
  const y = useTransform(progress, stops, [from.y ?? 0, 0, 0, out.y ?? 0]);
  const rotate = useTransform(progress, stops, [from.rotate ?? 0, 0, 0, out.rotate ?? 0]);
  const scale = useTransform(progress, stops, [from.scale ?? 1, 1, 1, out.scale ?? 1]);
  const opacity = useTransform(progress, stops, [0, 1, 1, leaves ? 0 : 1]);

  if (isReduced) return <div className={className}>{children}</div>;

  /* The outer div is what gets measured, so moving the inner one never
     feeds back into its own progress. */
  return (
    <div ref={ref} className={className}>
      <motion.div className="h-full will-change-transform" style={{ x, y, rotate, scale, opacity }}>
        {children}
      </motion.div>
    </div>
  );
}
