"use client";

import { motion, useReducedMotion, useSpring, useTransform } from "framer-motion";
import { ArrowRight } from "lucide-react";
import StepContent from "./StepContent";
import { pinnedHeight, usePinnedSteps } from "./usePinnedSteps";
import { whatsappLink } from "@/lib/contact";

/**
 * Services as a pinned scene (rebuilt 14 Nov 2026). The page holds still
 * while scrolling turns a wheel of six numbered stops; each stop brings its
 * service in and sends the last one out.
 */
/* 23 Nov 2026: web development leads the list. The site sells two things,
   websites and AI automation, and both are named in the hero. */
const SERVICES = [
  { title: "Websites that bring in bookings and sales", description: "Booking sites, online stores and brand sites, built in custom code with Next.js. Not WordPress templates. Fast on a phone, and yours to own.", tag: "Web Development" },
  { title: "Your sales team closes more, does less", description: "We build AI that scores leads, writes follow-ups, and books meetings. Your reps just show up and close.", tag: "Sales Automation" },
  { title: "Customers get answers at 3am", description: "Custom chatbots on WhatsApp, your website, or Instagram. They sound human because we train them on your actual conversations.", tag: "Chatbots" },
  { title: "Social media that runs itself", description: "Content generated, scheduled, and posted. We handle Instagram, Facebook, LinkedIn, and TikTok. You approve, we publish.", tag: "Social Media" },
  { title: "Apps that load fast", description: "Mobile and web apps built with React Native and Next.js. Actual custom code that performs.", tag: "App Development" },
  { title: "Dashboards your accountant will love", description: "Real-time reports, expense tracking, cash flow predictions. No more end-of-month surprises.", tag: "Data & Analytics" },
  { title: "Something weird and specific? We build that too.", description: "Invoice scanner that reads Sinhala? Inventory system that talks to WhatsApp? If you can explain it, we can automate it.", tag: "Custom AI" },
];

const COUNT = SERVICES.length;
const VH_PER_STEP = 55;
/** Degrees between two stops on the wheel. */
const STEP_DEG = 26;
const WHEEL_SIZE = 460;
/** Height of the wheel's window, and so where the current stop sits (its middle). */
const WHEEL_WINDOW = 400;

const pad = (n: number) => String(n).padStart(2, "0");

export default function Services() {
  const { ref, progress, active, direction, goTo } = usePinnedSteps(COUNT);
  const isReduced = useReducedMotion();
  const smooth = useSpring(progress, { stiffness: 120, damping: 26, mass: 0.4 });
  /* The wheel turns so the current stop sits at 3 o'clock. */
  const turn = useTransform(smooth, (value) => -(Math.min(COUNT - 0.5, value * COUNT) - 0.5) * STEP_DEG);
  const counterTurn = useTransform(turn, (value) => -value);
  const barScale = useTransform(smooth, [0, 1], [0, 1]);
  const service = SERVICES[active];

  return (
    <section id="services" ref={ref} className="relative" style={{ height: pinnedHeight(COUNT, VH_PER_STEP) }}>
      <div className="sticky top-0 flex h-[100svh] flex-col justify-center overflow-hidden">
        {/* Huge ghost number behind everything */}
        <div aria-hidden="true" className="pointer-events-none absolute -right-6 bottom-[-4rem] select-none text-[38vw] font-bold leading-none text-white/[0.035] md:text-[26vw]">
          {pad(active + 1)}
        </div>

        <div className="relative mx-auto grid w-full max-w-6xl gap-8 px-8 md:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] md:gap-10 md:px-16">
          <div>
            <h2 className="text-[2.2rem] font-bold leading-[0.92] tracking-[-0.02em] md:text-[4rem]">
              Here&apos;s what we<br />actually do.
            </h2>

            {/* Wheel: laptop and up */}
            <div className="relative mt-6 hidden md:block" style={{ height: WHEEL_WINDOW }} aria-hidden="true">
              <motion.div
                data-immersive-anchor="services-wheel"
                className="absolute rounded-full border border-white/10"
                style={{ width: WHEEL_SIZE, height: WHEEL_SIZE, left: -WHEEL_SIZE * 0.62, top: WHEEL_WINDOW / 2 - WHEEL_SIZE / 2, rotate: isReduced ? -(active * STEP_DEG) : turn }}
              >
                {SERVICES.map(({ tag }, i) => {
                  const angle = (i * STEP_DEG * Math.PI) / 180;
                  const isActive = i === active;
                  return (
                    <div
                      key={tag}
                      className="absolute"
                      style={{ left: `${50 + 50 * Math.cos(angle)}%`, top: `${50 + 50 * Math.sin(angle)}%` }}
                    >
                      <motion.button
                        type="button"
                        tabIndex={-1}
                        onClick={() => goTo(i)}
                        style={{ rotate: isReduced ? active * STEP_DEG : counterTurn }}
                        className={`font-code flex -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-xs transition-all duration-500 ${
                          isActive
                            ? "h-16 w-16 border-transparent bg-gradient-to-br from-[#0000C8] to-[#A600C8] text-base text-white shadow-[0_0_40px_rgba(166,0,200,0.55)]"
                            : "h-9 w-9 border-white/25 bg-black text-white/50 hover:border-white/60 hover:text-white"
                        } ${Math.abs(i - active) > 2 ? "opacity-0" : "opacity-100"}`}
                      >
                        {pad(i + 1)}
                      </motion.button>
                    </div>
                  );
                })}
              </motion.div>
              {/* Connector from the current stop to the text */}
              <div className="absolute h-px w-[calc(100%-250px)] bg-gradient-to-r from-[#A600C8] to-transparent" style={{ left: WHEEL_SIZE * 0.38 + 44, top: WHEEL_WINDOW / 2 }} />
            </div>

            {/* Step buttons: phones, and the keyboard route on every size */}
            <div className="mt-6 flex gap-2 md:sr-only" role="tablist" aria-label="Services">
              {SERVICES.map(({ tag }, i) => (
                <button
                  key={tag}
                  type="button"
                  role="tab"
                  aria-selected={i === active}
                  aria-label={tag}
                  onClick={() => goTo(i)}
                  className={`font-code flex h-9 flex-1 items-center justify-center rounded-full border text-[11px] transition-all duration-300 ${
                    i === active ? "border-transparent bg-gradient-to-br from-[#0000C8] to-[#A600C8] text-white" : "border-white/20 text-white/50"
                  }`}
                >
                  {pad(i + 1)}
                </button>
              ))}
            </div>
          </div>

          <StepContent stepKey={active} direction={direction} className="min-h-[300px] md:mt-[150px] md:flex md:min-h-[400px] md:items-center">
            <div>
              <p className="font-code mb-5 text-[11px] uppercase tracking-[0.3em] text-white/60">
                <span className="text-[#C45CFF]">{pad(active + 1)}</span> / {pad(COUNT)} · {service.tag}
              </p>
              <h3 className="text-[1.75rem] font-bold leading-[1.05] tracking-[-0.01em] text-white md:text-[2.75rem]">{service.title}</h3>
              <p className="mt-5 max-w-md text-sm leading-relaxed text-white/60 md:text-base">{service.description}</p>
              <a
                href={whatsappLink(`Hi NeuroMonkey, I'd like to know more about ${service.tag}.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-5 inline-flex items-center gap-2 border-b border-white/30 py-2.5 text-sm text-white/80 transition-colors hover:border-white hover:text-white"
              >
                Ask about this
                <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
              </a>
            </div>
          </StepContent>
        </div>

        {/* Scene progress */}
        <div aria-hidden="true" className="absolute inset-x-8 bottom-8 h-px bg-white/10 md:inset-x-16">
          <motion.div className="h-full origin-left bg-gradient-to-r from-[#0000C8] to-[#A600C8]" style={{ scaleX: barScale }} />
        </div>
      </div>
    </section>
  );
}
