import { ArrowRight } from "lucide-react";
import Fall from "./Fall";
import Magnetic from "./Magnetic";
import { EMAIL, PHONE_DISPLAY, PHONE_TEL, whatsappLink } from "@/lib/contact";

const SECONDARY = "group flex items-center justify-between border border-white/10 bg-black/80 px-8 py-5 text-sm text-white/60 transition-colors hover:border-white/30 hover:text-white";

/** The page ends here, so these land and stay: there is no scroll left to carry them out. */
export default function CTA() {
  return (
    <section id="contact" className="border-t border-white/10 py-24">
      <div className="mx-auto grid max-w-6xl items-end gap-12 px-8 md:grid-cols-2 md:gap-16 md:px-16">
        <Fall from={{ x: -120, rotate: -3 }} to={false}>
          <h2 className="mb-4 text-[2.5rem] font-bold leading-[0.92] tracking-[-0.02em] md:text-[4rem]">
            Let&apos;s talk about what&apos;s slowing you down.
          </h2>
          <p className="text-sm text-white/60">If we can&apos;t help, we&apos;ll tell you. We&apos;d rather say no than waste your time.</p>
        </Fall>

        <div className="space-y-3">
          <Fall from={{ x: 140 }} to={false}>
            <Magnetic>
              <a href={whatsappLink()} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between bg-white px-8 py-5 text-sm font-semibold text-black transition-colors hover:bg-white/90">
                <span>WhatsApp us. Fastest way.</span>
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-2" />
              </a>
            </Magnetic>
          </Fall>
          <Fall from={{ x: 140 }} to={false} delay={0.03}>
            <a href={`mailto:${EMAIL}`} className={SECONDARY}>
              <span>{EMAIL}</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-2" />
            </a>
          </Fall>
          <Fall from={{ x: 140 }} to={false} delay={0.06}>
            <a href={`tel:${PHONE_TEL}`} className={SECONDARY}>
              <span>{PHONE_DISPLAY}</span>
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-2" />
            </a>
          </Fall>
        </div>
      </div>
    </section>
  );
}
