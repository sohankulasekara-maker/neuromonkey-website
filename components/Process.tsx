"use client";

import { motion, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { Ear, Hammer, LifeBuoy, Map as MapIcon, type LucideIcon } from "lucide-react";
import StepContent from "./StepContent";
import { pinnedHeight, usePinnedSteps } from "./usePinnedSteps";

/**
 * How it works, as a pinned scene (rebuilt 14 Nov 2026). Scrolling turns the
 * orbit so each step arrives at the top in turn, and its explanation swaps in
 * beside it. Clicking a step jumps to it.
 */
const STEPS: { title: string; label: string; content: string; icon: LucideIcon }[] = [
  {
    title: "We listen first",
    label: "Discovery",
    content: "A 30-minute call where we shut up and you talk. What's broken? What takes too long? What do you wish just happened automatically?",
    icon: Ear,
  },
  {
    title: "We map it out",
    label: "Planning",
    content: "You get a document. Not a 50-page deck. A clear plan: what we'll build, how long it takes, what it costs. No surprises.",
    icon: MapIcon,
  },
  {
    title: "We build it fast",
    label: "Build",
    content: "Weekly demos. Every Friday you see what's new. If something's off, we fix it Monday. Not next quarter.",
    icon: Hammer,
  },
  {
    title: "We stick around",
    label: "Support",
    content: "Launch isn't the end. We monitor, tweak, and improve. Your automation gets smarter over time because we're watching the data.",
    icon: LifeBuoy,
  },
];

const COUNT = STEPS.length;
const VH_PER_STEP = 55;
const STEP_DEG = 360 / COUNT;
/** The current step sits at 12 o'clock. */
const TOP_DEG = -90;

export default function Process() {
  const { ref, progress, active, direction, goTo } = usePinnedSteps(COUNT);
  const isReduced = useReducedMotion();
  const smooth = useSpring(progress, { stiffness: 110, damping: 24, mass: 0.4 });
  const turn = useTransform(smooth, (value) => TOP_DEG - (Math.min(COUNT - 0.5, value * COUNT) - 0.5) * STEP_DEG);
  const counterTurn = useTransform(turn, (value) => -value);
  const staticTurn = TOP_DEG - active * STEP_DEG;
  const step = STEPS[active];

  return (
    <section id="process" ref={ref} className="relative border-t border-white/10" style={{ height: pinnedHeight(COUNT, VH_PER_STEP) }}>
      <div className="sticky top-0 flex h-[100svh] items-start overflow-hidden pt-24 md:items-center md:pt-0">
        <div className="mx-auto grid w-full max-w-6xl items-center gap-6 px-8 md:grid-cols-2 md:gap-10 md:px-16">
          <div>
            <h2 className="text-[2.2rem] font-bold leading-[0.92] tracking-[-0.02em] md:text-[4rem]">
              How it works.<br />Four steps.
            </h2>

            <StepContent stepKey={active} direction={direction} className="mt-5 min-h-[150px] md:mt-10 md:min-h-[190px]">
              <p className="font-code text-[11px] uppercase tracking-[0.3em] text-white/60">
                <span className="text-[#C45CFF]">Step 0{active + 1}</span> · {step.label}
              </p>
              <h3 className="mt-3 text-xl font-bold text-white md:text-3xl">{step.title}</h3>
              <p className="mt-3 max-w-md text-sm leading-relaxed text-white/60 md:text-base">{step.content}</p>
            </StepContent>
          </div>

          {/* The orbit */}
          <div className="relative mx-auto aspect-square w-[min(300px,72vw,34svh)] md:w-[min(420px,38vw,60svh)]">
            <div className="absolute inset-0 rounded-full border border-white/10" />
            <div className="absolute inset-[18%] rounded-full border border-dashed border-white/[0.07]" />

            {/* Core */}
            <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-gradient-to-br from-[#0000C8] via-[#5300C8] to-[#A600C8]">
              <div className="absolute h-20 w-20 animate-ping rounded-full border border-white/20 opacity-70" />
              <span className="font-code relative text-sm font-bold text-white">0{active + 1}</span>
            </div>

            <motion.div className="absolute inset-0" style={{ rotate: isReduced ? staticTurn : turn }}>
              {STEPS.map(({ title, icon: Icon }, i) => {
                const angle = (i * STEP_DEG * Math.PI) / 180;
                const isActive = i === active;
                return (
                  <div key={title} className="absolute" style={{ left: `${50 + 50 * Math.cos(angle)}%`, top: `${50 + 50 * Math.sin(angle)}%` }}>
                    <motion.div style={{ rotate: isReduced ? -staticTurn : counterTurn }} className="-translate-x-1/2 -translate-y-1/2">
                      <button
                        type="button"
                        onClick={() => goTo(i)}
                        aria-label={`Step ${i + 1}: ${title}`}
                        aria-current={isActive ? "step" : undefined}
                        className={`relative flex items-center justify-center rounded-full border-2 transition-all duration-500 ${
                          isActive
                            ? "h-16 w-16 border-white bg-white text-black shadow-[0_0_45px_rgba(166,0,200,0.7)]"
                            : "h-11 w-11 border-white/40 bg-black text-white hover:border-white"
                        }`}
                      >
                        <Icon size={isActive ? 22 : 16} />
                      </button>
                      <span
                        className={`font-code pointer-events-none absolute left-1/2 top-full mt-2 -translate-x-1/2 whitespace-nowrap text-[10px] uppercase tracking-wider transition-colors duration-500 ${
                          isActive ? "text-white" : "hidden text-white/40 md:block"
                        }`}
                      >
                        {title}
                      </span>
                    </motion.div>
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
