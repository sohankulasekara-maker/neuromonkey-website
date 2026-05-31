"use client";

import { Ear, Map as MapIcon, Hammer, LifeBuoy } from "lucide-react";
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline";

const timelineData = [
  {
    id: 1,
    title: "We listen first",
    date: "STEP 01",
    content:
      "A 30-minute call where we shut up and you talk. What's broken? What takes too long? What do you wish just happened automatically?",
    category: "Discovery",
    icon: Ear,
    relatedIds: [2],
    status: "completed" as const,
    energy: 100,
  },
  {
    id: 2,
    title: "We map it out",
    date: "STEP 02",
    content:
      "You get a document. Not a 50-page deck. A clear plan: what we'll build, how long it takes, what it costs. No surprises.",
    category: "Planning",
    icon: MapIcon,
    relatedIds: [1, 3],
    status: "completed" as const,
    energy: 80,
  },
  {
    id: 3,
    title: "We build it fast",
    date: "STEP 03",
    content:
      "Weekly demos. Every Friday you see what's new. If something's off, we fix it Monday. Not next quarter.",
    category: "Build",
    icon: Hammer,
    relatedIds: [2, 4],
    status: "in-progress" as const,
    energy: 60,
  },
  {
    id: 4,
    title: "We stick around",
    date: "STEP 04",
    content:
      "Launch isn't the end. We monitor, tweak, and improve. Your automation gets smarter over time because we're watching the data.",
    category: "Support",
    icon: LifeBuoy,
    relatedIds: [3],
    status: "pending" as const,
    energy: 40,
  },
];

export default function Process() {
  return (
    <section id="process" className="relative border-t border-white/10 bg-black overflow-hidden">
      {/* Orbital timeline — right side */}
      <div className="absolute inset-0 md:left-[40%]">
        <RadialOrbitalTimeline timelineData={timelineData} />
      </div>

      {/* Heading — aligned to the same container as the rest of the site */}
      <div className="relative z-20 max-w-6xl mx-auto px-8 md:px-16 pointer-events-none">
        <div className="min-h-screen flex flex-col justify-center max-w-md">
          <h2 className="text-[2.5rem] md:text-[4rem] font-bold leading-[0.92] tracking-[-0.02em]">
            How it works.<br />Four steps.
          </h2>
          <p className="mt-6 text-sm md:text-base text-white/60 leading-relaxed">
            No mystery, no jargon. From the first call to long after launch,
            here&apos;s exactly how we take you from chaos to control.
          </p>
        </div>
      </div>
    </section>
  );
}
