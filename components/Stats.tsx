"use client";

import { useEffect, useRef, useState } from "react";
import Fall from "./Fall";
import { prefersReducedMotion } from "@/lib/lenis-store";

/** `count` is the number that counts up; prefix and suffix stay fixed around it. */
const STATS = [
  { count: 50, suffix: "+", label: "Automations" },
  { count: 98, suffix: "%", label: "Satisfaction" },
  { count: 3, suffix: "x", label: "Avg ROI" },
  { count: 4, prefix: "2-", suffix: " wks", label: "Delivery" },
];

const COUNT_MS = 1400;

function CountUp({ target }: { target: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (prefersReducedMotion()) {
      setValue(target);
      return;
    }
    let frame = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const startedAt = performance.now();
        const tick = (now: number) => {
          /* The first frame's timestamp can be a hair before startedAt, so clamp at 0. */
          const t = Math.min(1, Math.max(0, (now - startedAt) / COUNT_MS));
          setValue(Math.round(target * (1 - Math.pow(1 - t, 3))));
          if (t < 1) frame = requestAnimationFrame(tick);
        };
        frame = requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [target]);

  return <span ref={ref} className="tabular-nums">{value}</span>;
}

export default function Stats() {
  return (
    <section className="py-16">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-8 md:flex-row md:items-center md:justify-between md:px-16">
        <Fall from={{ x: -80 }} to={{ x: -60 }}>
          <p className="font-code text-[11px] uppercase tracking-[0.3em] text-white/50">Since 2024</p>
        </Fall>
        <div className="grid grid-cols-2 gap-x-12 gap-y-8 sm:flex sm:gap-14">
          {STATS.map(({ count, prefix = "", suffix, label }, i) => (
            <Fall key={label} from={{ y: -90, rotate: i % 2 ? 8 : -8 }} to={{ y: 60 }} delay={i * 0.04}>
              <p className="text-3xl font-bold text-white md:text-4xl">
                {prefix}
                <CountUp target={count} />
                {suffix}
              </p>
              <p className="font-code mt-1 text-[10px] uppercase tracking-wider text-white/50">{label}</p>
            </Fall>
          ))}
        </div>
      </div>
    </section>
  );
}
