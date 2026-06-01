import { SplineScene } from "@/components/ui/splite";
import RevealOnScroll from "./RevealOnScroll";

export default function Capabilities() {
  return (
    <section id="capabilities" className="relative bg-black border-t border-white/10 overflow-hidden">
      {/* Text — aligned to the same container as the rest of the site */}
      <div className="relative z-10 max-w-6xl mx-auto px-8 md:px-16 md:pointer-events-none">
        <RevealOnScroll>
          <div className="pt-20 pb-6 md:py-0 md:h-[600px] flex flex-col justify-center max-w-md">
            <h2 className="text-[2.5rem] md:text-[4rem] font-bold leading-[0.92] tracking-[-0.02em] text-white">
              Our interactive<br />capabilities.
            </h2>
            <p className="mt-6 text-sm md:text-base text-white/60 leading-relaxed">
              Drag it, spin it, poke at it. This is the kind of living, responsive
              experience we build into your products. Automation that feels less
              like software and more like something alive.
            </p>
          </div>
        </RevealOnScroll>
      </div>

      {/* Spline — stacked below on mobile, full-bleed right half on desktop.
          Left edge feathered (md only) so the glow blends into black. */}
      <div className="relative z-0 h-[52vh] min-h-[340px] w-full pb-12 md:absolute md:inset-y-0 md:right-0 md:h-auto md:min-h-0 md:w-1/2 md:pb-0 md:[mask-image:linear-gradient(to_right,transparent,#000_28%)] md:[-webkit-mask-image:linear-gradient(to_right,transparent,#000_28%)]">
        <SplineScene
          scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
          className="w-full h-full"
          transparent
          lightIntensity={1}
        />
      </div>
    </section>
  );
}
