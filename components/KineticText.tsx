"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Kinetic type: each word rises out of its own mask, one after another.
 * The mask is a clipped box around the word, so the word appears to come up
 * through the line it sits on.
 */

const EASE = [0.16, 1, 0.3, 1] as const;
const DURATION_S = 0.9;
const DEFAULT_STAGGER_S = 0.06;
/* Room below the baseline so descenders (g, y, p) are not clipped. */
const MASK = "inline-block overflow-hidden pb-[0.2em] -mb-[0.2em] align-bottom";

interface MaskedWordProps {
  children: React.ReactNode;
  /** Position in the reveal order. */
  index: number;
  className?: string;
  /** Start on page load rather than when scrolled into view. */
  onLoad?: boolean;
  delay?: number;
  stagger?: number;
}

export function MaskedWord({ children, index, className = "", onLoad = false, delay = 0, stagger = DEFAULT_STAGGER_S }: MaskedWordProps) {
  const isReduced = useReducedMotion();
  const variants = {
    hidden: { y: "115%", rotate: 7 },
    shown: { y: "0%", rotate: 0, transition: { duration: DURATION_S, ease: EASE, delay: delay + index * stagger } },
  };
  /* The mask is what gets watched: the word inside starts clipped out of
     it, so watching the word itself would never see it come into view. */
  const trigger = onLoad ? { animate: "shown" } : { whileInView: "shown", viewport: { once: true, amount: "some" as const } };

  return (
    <motion.span className={MASK} initial={isReduced ? false : "hidden"} {...trigger}>
      <motion.span className={`inline-block origin-bottom-left ${className}`} variants={variants}>
        {children}
      </motion.span>
    </motion.span>
  );
}

interface KineticTextProps {
  /** Lines of the heading; each becomes its own block. */
  lines: string[];
  /** A word to fill with the brand gradient. */
  highlight?: string;
  onLoad?: boolean;
  delay?: number;
}

/** Splits lines into masked words. Screen readers get the plain sentence. */
export default function KineticText({ lines, highlight, onLoad = false, delay = 0 }: KineticTextProps) {
  let index = 0;
  return (
    <>
      <span className="sr-only">{lines.join(" ")}</span>
      <span aria-hidden="true">
        {lines.map((line) => (
          <span key={line} className="block">
            {line.split(" ").map((word, i) => {
              const order = index;
              index += 1;
              return (
                <span key={`${word}-${i}`}>
                  <MaskedWord index={order} onLoad={onLoad} delay={delay} className={word === highlight ? "gradient-text" : ""}>
                    {word}
                  </MaskedWord>{" "}
                </span>
              );
            })}
          </span>
        ))}
      </span>
    </>
  );
}
