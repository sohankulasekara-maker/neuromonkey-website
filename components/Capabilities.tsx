import { SplineScene } from "@/components/ui/splite";
import Fall from "./Fall";

export default function Capabilities() {
  return (
    <section id="capabilities" className="relative overflow-hidden border-t border-white/10">
      {/* Text — aligned to the same container as the rest of the site */}
      <div className="relative z-10 mx-auto max-w-6xl px-8 md:pointer-events-none md:px-16">
        <div className="flex max-w-md flex-col justify-center pb-6 pt-20 md:h-[600px] md:py-0">
          <Fall from={{ x: -140, rotate: -4 }} to={{ x: -100, rotate: 3 }}>
            <h2 className="text-[2.5rem] font-bold leading-[0.92] tracking-[-0.02em] text-white md:text-[4rem]">
              Interactive capabilities<br />with AI.
            </h2>
          </Fall>
          <Fall from={{ x: -100 }} to={{ x: -70 }} delay={0.05}>
            <p className="mt-6 text-sm leading-relaxed text-white/60 md:text-base">
              Drag it, spin it, poke at it. This is the kind of living, responsive
              experience we build into your products. Automation that feels less
              like software and more like something alive.
            </p>
          </Fall>
        </div>
      </div>

      {/* Spline — stacked below on mobile, full-bleed right half on desktop.
          No space under it on phones: with a gap below, the robot's legs ended
          in mid-air and it looked like it was flying. Now they meet the line.
          Left edge feathered (md only) so the glow blends into black. */}
      <div className="relative z-0 h-[52vh] min-h-[340px] w-full md:absolute md:inset-y-0 md:right-0 md:h-auto md:min-h-0 md:w-1/2 md:[mask-image:linear-gradient(to_right,transparent,#000_28%)] md:[-webkit-mask-image:linear-gradient(to_right,transparent,#000_28%)]">
        <SplineScene scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode" className="h-full w-full" transparent lightIntensity={1} />
      </div>
    </section>
  );
}
