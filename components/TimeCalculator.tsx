"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import Fall from "./Fall";
import { whatsappLink } from "@/lib/contact";

/**
 * "How much time are you burning?" (14 Nov 2026). Three sliders, one answer:
 * hours handed back each year. It only multiplies what the visitor enters, so
 * every figure on screen is theirs, including the share they think is automatable.
 */
const WEEKS_PER_YEAR = 48;
const HOURS_PER_WORK_WEEK = 40;

interface SliderProps {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix: string;
  onChange: (value: number) => void;
}

function Slider({ id, label, value, min, max, step = 1, suffix, onChange }: SliderProps) {
  const fill = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-sm text-white/70">{label}</label>
        <output htmlFor={id} className="font-code shrink-0 text-lg font-bold text-white">
          {value}
          <span className="ml-1 text-xs font-normal text-white/50">{suffix}</span>
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="range-input"
        style={{ "--fill": `${fill}%` } as React.CSSProperties}
      />
    </div>
  );
}

export default function TimeCalculator() {
  const [people, setPeople] = useState(5);
  const [hours, setHours] = useState(8);
  const [share, setShare] = useState(60);

  const hoursPerYear = Math.round(people * hours * WEEKS_PER_YEAR * (share / 100));
  const workWeeks = Math.round(hoursPerYear / HOURS_PER_WORK_WEEK);
  const message = `Hi NeuroMonkey, I ran your calculator: ${people} people, ${hours} hours a week each on repetitive work. If ${share}% were automated that is about ${hoursPerYear.toLocaleString("en-US")} hours a year. Can we talk?`;

  return (
    <section id="calculator" className="relative border-t border-white/10 py-24">
      <div className="mx-auto max-w-6xl px-8 md:px-16">
        <Fall from={{ x: -120, rotate: -3 }} to={{ x: -80 }}>
          <h2 className="mb-4 text-[2.5rem] font-bold leading-[0.92] tracking-[-0.02em] md:text-[4rem]">
            How much time<br />are you burning?
          </h2>
          <p className="mb-14 max-w-md text-sm text-white/60">Move the sliders. The answer is your own numbers, multiplied out.</p>
        </Fall>

        <div className="grid gap-8 md:grid-cols-2 md:gap-12">
          <Fall from={{ x: -140, rotate: -4 }} to={{ y: -60 }}>
            <div className="space-y-9 rounded-xl border border-white/10 bg-black/80 p-6 md:p-9">
              <Slider id="calc-people" label="People doing repetitive work" value={people} min={1} max={50} suffix={people === 1 ? "person" : "people"} onChange={setPeople} />
              <Slider id="calc-hours" label="Hours a week each one spends on it" value={hours} min={1} max={30} suffix="hrs" onChange={setHours} />
              <Slider id="calc-share" label="How much of it could be automated" value={share} min={10} max={90} step={5} suffix="%" onChange={setShare} />
            </div>
          </Fall>

          <Fall from={{ x: 140, rotate: 4 }} to={{ y: -60 }} delay={0.04}>
            <div className="gradient-border flex h-full flex-col justify-between rounded-xl p-6 md:p-9">
              <div aria-live="polite">
                <p className="font-code text-[11px] uppercase tracking-[0.3em] text-white/50">Time you get back</p>
                <p className="mt-4 text-[3.5rem] font-bold leading-none tracking-[-0.03em] md:text-[5.5rem]">
                  <span className="gradient-text-bright tabular-nums">{hoursPerYear.toLocaleString("en-US")}</span>
                </p>
                <p className="mt-2 text-lg text-white/80">hours every year</p>
                <p className="mt-4 text-sm leading-relaxed text-white/50">
                  That is about <strong className="text-white">{workWeeks.toLocaleString("en-US")} full working weeks</strong>. Worked out as{" "}
                  {people} × {hours} hours × {WEEKS_PER_YEAR} weeks × {share}%.
                </p>
              </div>
              <a
                href={whatsappLink(message)}
                target="_blank"
                rel="noopener noreferrer"
                className="group mt-8 flex items-center justify-between bg-white px-6 py-4 text-sm font-semibold text-black transition-colors hover:bg-white/90"
              >
                Send us these numbers on WhatsApp
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-2" />
              </a>
            </div>
          </Fall>
        </div>
      </div>
    </section>
  );
}
