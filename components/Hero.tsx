"use client";

import Image from "next/image";
import { motion, useMotionValue, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { ArrowDown, ArrowRight } from "lucide-react";
import ConsoleFeed from "./ConsoleFeed";
import Magnetic from "./Magnetic";
import { MaskedWord } from "./KineticText";

/**
 * Hero (rebuilt 14 Nov 2026). Each word drops into place on load. Scrolling
 * pulls the three lines apart in different directions, and the neural field
 * behind them reacts to the pointer.
 */

/** Each line: its words, which word is highlighted, and where it exits to. */
/* 23 Nov 2026: the headline names both halves of the business, websites and
   automation. It read "We automate the stuff your team shouldn't be doing
   manually." */
const LINES = [
  { words: ["We", "build", "websites"], exitX: -260 },
  { words: ["and", "automate", "the", "work"], exitX: 260 },
  { words: ["your", "team", "shouldn't", "do."], highlight: "shouldn't", exitX: -180 },
];

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

  /* The portrait leans a little away from the pointer. */
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);

  const onPointerMove = (event: React.PointerEvent<HTMLElement>) => {
    if (event.pointerType !== "mouse" || isReduced) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - rect.left) / rect.width - 0.5) * -PARALLAX_PX * 2);
    pointerY.set(((event.clientY - rect.top) / rect.height - 0.5) * -PARALLAX_PX);
  };

  let wordIndex = 0;

  return (
    <section onPointerMove={onPointerMove} className="relative flex min-h-[100svh] items-start overflow-hidden pt-32 md:items-center md:pt-0">
      {/* Yakira: bottom right. On phones her width is capped by the screen height
          (36.5svh wide is 50svh tall), so she sits under the text, never behind it. */}
      <motion.div
        className="pointer-events-none absolute bottom-0 right-[-4%] w-[min(96%,440px,36.5svh)] md:right-[5%] md:w-[46%] md:max-w-[620px]"
      >
        <div>
          {/* 26 Nov 2026 (immersive-3d): a transparent cutout, so the WebGL glass
              form glows behind her. The old photo had a black box, hidden with
              an edge-fade mask. */}
          <Image src="/yakira-hero-cutout.webp" alt="Yakira, NeuroMonkey AI" width={864} height={1184} className="h-auto w-full" priority />
        </div>
      </motion.div>

      <div className="relative z-10 w-full px-8 md:px-16 md:pl-[12%]">
        {/* 23 Nov 2026: names the two things we sell, above the headline. The
            scroll fade sits on the outer element and the entrance on the inner
            one: both on one element would write into the shared fade value and
            blank the headline. */}
        <motion.p
          className="font-code mb-5 text-[11px] uppercase tracking-[0.3em] text-white/70 md:text-xs"
          style={isReduced ? undefined : { opacity: fade }}
        >
          <motion.span
            className="inline-block"
            initial={isReduced ? false : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
          >
            Web Development <span className="text-[#C45CFF]">+</span> AI Automation
          </motion.span>
        </motion.p>
        <h1 className="max-w-3xl text-[clamp(1.55rem,7vw,2.6rem)] font-bold leading-[1] tracking-[-0.02em] text-white md:text-[3rem] lg:text-[4rem] lg:leading-[0.95]">
          {LINES.map((line, lineIndex) => (
            <motion.span key={line.words.join(" ")} className="block whitespace-nowrap" style={isReduced ? undefined : { x: lineX[lineIndex], opacity: fade }}>
              {line.words.map((word) => {
                const index = wordIndex;
                wordIndex += 1;
                return (
                  /* 26 Nov 2026 (immersive-3d): words rise out of a mask, one
                     after another. They used to drop in from above with a tilt. */
                  <MaskedWord key={word} index={index} onLoad delay={0.2} stagger={WORD_STAGGER_S} className={`mr-[0.25em] ${word === line.highlight ? "gradient-text" : ""}`}>
                    {word}
                  </MaskedWord>
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
