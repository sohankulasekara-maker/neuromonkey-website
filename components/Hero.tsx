"use client";

import Image from "next/image";
import { motion, useMotionValue, useReducedMotion, useScroll, useSpring, useTransform } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import ConsoleFeed from "./ConsoleFeed";
import Magnetic from "./Magnetic";

/**
 * Hero (rebuilt 14 Nov 2026). Each word drops into place on load. Scrolling
 * pulls the three lines apart in different directions, and the neural field
 * behind them reacts to the pointer.
 */

/** Each line: its words, which word is highlighted, and where it exits to. */
const LINES = [
  { words: ["We", "automate", "the", "stuff"], exitX: -260 },
  { words: ["your", "team", "shouldn't", "be"], highlight: "shouldn't", exitX: 260 },
  { words: ["doing", "manually."], exitX: -180 },
];

/** A fixed tilt per word, so the drop looks hand-thrown but never changes between renders. */
const TILTS = [-14, 9, -6, 12, 7, -11, 15, -8, 10, -13];
const SCROLL_RANGE = 700;
const WORD_STAGGER_S = 0.07;
const PARALLAX_PX = 18;

export default function Hero() {
  const isReduced = useReducedMotion();
  const { scrollY } = useScroll();
  const fade = useTransform(scrollY, [0, SCROLL_RANGE * 0.8], [1, 0]);
  const lineX = [
    useTransform(scrollY, [0, SCROLL_RANGE], [0, LINES[0].exitX]),
    useTransform(scrollY, [0, SCROLL_RANGE], [0, LINES[1].exitX]),
    useTransform(scrollY, [0, SCROLL_RANGE], [0, LINES[2].exitX]),
  ];
  const extrasY = useTransform(scrollY, [0, SCROLL_RANGE], [0, 160]);
  const imageY = useTransform(scrollY, [0, SCROLL_RANGE], [0, 110]);
  const imageScale = useTransform(scrollY, [0, SCROLL_RANGE], [1, 1.08]);

  /* The portrait leans a little away from the pointer. */
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const leanX = useSpring(pointerX, { stiffness: 60, damping: 18 });
  const leanY = useSpring(pointerY, { stiffness: 60, damping: 18 });

  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse" || isReduced) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - rect.left) / rect.width - 0.5) * -PARALLAX_PX * 2);
    pointerY.set(((event.clientY - rect.top) / rect.height - 0.5) * -PARALLAX_PX);
  };

  let wordIndex = 0;

  return (
    <section onPointerMove={onPointerMove} className="relative flex min-h-[100svh] items-start overflow-hidden pt-32 md:items-center md:pt-0">
      {/* Yakira: bottom right. On phones she sits under the text, never behind it. */}
      <motion.div
        className="pointer-events-none absolute bottom-0 right-[-6%] w-[96%] max-w-[440px] md:right-[5%] md:w-[46%] md:max-w-[620px]"
        style={isReduced ? undefined : { y: imageY, scale: imageScale, opacity: fade }}
      >
        <motion.div style={{ x: leanX, y: leanY }}>
          <Image src="/yakira-hero.png" alt="Yakira, NeuroMonkey AI" width={864} height={1184} className="h-auto w-full [mask-image:linear-gradient(to_right,transparent,#000_16%,#000_90%,transparent)] [-webkit-mask-image:linear-gradient(to_right,transparent,#000_16%,#000_90%,transparent)]" priority />
        </motion.div>
      </motion.div>

      <div className="relative z-10 w-full px-8 md:px-16 md:pl-[12%]">
        <h1 className="max-w-3xl text-[clamp(1.55rem,7vw,2.6rem)] font-bold leading-[1] tracking-[-0.02em] text-white md:text-[3rem] lg:text-[4rem] lg:leading-[0.95]">
          {LINES.map((line, lineIndex) => (
            <motion.span key={line.words.join(" ")} className="block whitespace-nowrap" style={isReduced ? undefined : { x: lineX[lineIndex], opacity: fade }}>
              {line.words.map((word) => {
                const index = wordIndex;
                wordIndex += 1;
                return (
                  <motion.span
                    key={word}
                    className={`mr-[0.25em] inline-block ${word === line.highlight ? "gradient-text" : ""}`}
                    initial={isReduced ? false : { y: -140, rotate: TILTS[index % TILTS.length], opacity: 0 }}
                    animate={{ y: 0, rotate: 0, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 190, damping: 15, delay: 0.15 + index * WORD_STAGGER_S }}
                  >
                    {word}
                  </motion.span>
                );
              })}
            </motion.span>
          ))}
        </h1>

        <motion.div
          style={isReduced ? undefined : { y: extrasY, opacity: fade }}
          initial={isReduced ? false : { opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1 }}
        >
          <div className="mt-8 flex flex-wrap items-center gap-3 md:mt-10">
            <Magnetic>
              <a href="#contact" className="group flex items-center gap-3 bg-white px-6 py-3.5 text-sm font-semibold text-black transition-colors hover:bg-white/90">
                Start a project
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </a>
            </Magnetic>
            <Magnetic>
              <a href="#services" className="group flex items-center gap-3 border border-white/20 px-6 py-3.5 text-sm text-white/80 transition-colors hover:border-white/50 hover:text-white">
                See what we do
                <ArrowDown size={16} className="transition-transform group-hover:translate-y-1" />
              </a>
            </Magnetic>
          </div>

          <div className="mt-10 hidden md:block">
            <ConsoleFeed />
          </div>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-px bg-white/10" />
    </section>
  );
}
