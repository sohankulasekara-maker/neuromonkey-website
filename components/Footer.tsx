import Image from "next/image";
import { EMAIL, LOCATION, PHONE_DISPLAY, PHONE_TEL } from "@/lib/contact";

const SERVICES = ["Web Development", "Sales Automation", "Chatbots", "Social Media", "App Development", "Analytics", "Custom AI"];
/* Tall enough to tap comfortably on a phone. */
const LINK = "block py-2.5 text-[11px] text-white/60 transition-colors hover:text-white md:py-1";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/60">
      <div className="mx-auto max-w-6xl px-8 py-12 md:px-16">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Image src="/logo.png" alt="NeuroMonkey AI" width={80} height={80} className="mb-4 h-20 w-20 object-contain" />
            <p className="max-w-xs text-[11px] leading-relaxed text-white/60">
              Web Development and AI Automation for Modern Businesses. We build websites and AI systems that save time, reduce costs, and scale your operations.
            </p>
          </div>

          <div>
            <p className="font-code mb-4 text-[10px] uppercase tracking-[0.3em] text-white/50">Services</p>
            <div>
              {SERVICES.map((service) => (
                <a key={service} href="#services" className={LINK}>{service}</a>
              ))}
            </div>
          </div>

          <div>
            <p className="font-code mb-4 text-[10px] uppercase tracking-[0.3em] text-white/50">Contact</p>
            <div>
              <a href={`mailto:${EMAIL}`} className={LINK}>{EMAIL}</a>
              <a href={`tel:${PHONE_TEL}`} className={LINK}>{PHONE_DISPLAY}</a>
              <p className="py-2.5 text-[11px] text-white/60 md:py-1">{LOCATION}</p>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-white/5 pt-6">
          <p className="text-[10px] text-white/40">&copy; 2026 NeuroMonkey AI</p>
        </div>
      </div>
    </footer>
  );
}
