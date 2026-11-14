"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";

/**
 * A band of huge words that slides sideways as the page scrolls. `reverse`
 * sends it the other way; `outline` is the big band with no ribbon behind it, its words filled with the brand gradient.
 */
const REPEATS = 8;
const TRAVEL_PERCENT = 22;

export default function ScrollMarquee({
  words,
  reverse = false,
  outline = false,
  tilt = 0,
}: {
  words: string[];
  reverse?: boolean;
  outline?: boolean;
  tilt?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isReduced = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 26, mass: 0.4 });
  const range = reverse ? [`-${TRAVEL_PERCENT}%`, "0%"] : ["0%", `-${TRAVEL_PERCENT}%`];
  const x = useTransform(smooth, [0, 1], range);

  const line = Array.from({ length: REPEATS }, () => words).flat();

  return (
    <div ref={ref} aria-hidden="true" className={`relative overflow-hidden ${outline ? "py-6 md:py-10" : "py-5 md:py-7"}`}>
      <div
        className={outline ? "" : "bg-gradient-to-r from-[#0000C8] to-[#A600C8]"}
        style={{ transform: `rotate(${tilt}deg) scale(1.04)` }}
      >
        <motion.div className={`flex w-max items-center gap-8 whitespace-nowrap md:gap-12 ${outline ? "py-4 md:py-6" : "py-2 md:py-2.5"}`} style={isReduced ? undefined : { x }}>
          {line.map((word, i) => (
            <span key={`${word}-${i}`} className="flex items-center gap-8 md:gap-12">
              <span className={`font-bold uppercase leading-none ${outline ? "text-brand-fill text-[2.6rem] tracking-[-0.02em] md:text-[6rem]" : "text-base tracking-[0.04em] text-white md:text-2xl"}`}>
                {word}
              </span>
              <span className={`font-code ${outline ? "text-xl text-[#A600C8] md:text-4xl" : "text-sm text-white/70 md:text-lg"}`}>✦</span>
            </span>
          ))}
        </motion.div>
      </div>
    </div>
  );
}
