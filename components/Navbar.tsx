"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { EMAIL, LOCATION, PHONE_DISPLAY } from "@/lib/contact";
import { lockScroll } from "@/lib/lenis-store";

const LINKS = [
  { href: "#services", label: "Services" },
  { href: "#process", label: "How We Work" },
  { href: "#team", label: "Team" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#contact", label: "Contact" },
];

const SCROLLED_AFTER_PX = 50;

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [current, setCurrent] = useState("");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > SCROLLED_AFTER_PX);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* Which section is on screen, so the menu can mark it. */
  useEffect(() => {
    const sections = LINKS.map(({ href }) => document.getElementById(href.slice(1))).filter((el): el is HTMLElement => el !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) if (entry.isIntersecting) setCurrent(`#${entry.target.id}`);
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  /* Menu open: freeze the page behind it, and let Escape close it. */
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    lockScroll(open);
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
      lockScroll(false);
    };
  }, [open]);

  return (
    <>
      <header className={`fixed left-0 right-0 top-0 z-50 transition-all duration-500 ${scrolled ? "bg-black/90 backdrop-blur-md" : "bg-transparent"}`}>
        <div className="flex h-[70px] w-full items-center justify-between px-8 md:px-16">
          <a href="/" aria-label="NeuroMonkey AI, home">
            <Image src="/logo.png" alt="NeuroMonkey AI" width={72} height={72} className="h-[72px] w-[72px] object-contain" priority />
          </a>

          <button
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="site-menu"
            className="group flex h-11 items-center gap-3 text-white/60 transition-colors hover:text-white"
          >
            <span className="font-code hidden text-[11px] uppercase tracking-[0.3em] md:inline">Menu</span>
            <span className="flex w-6 flex-col gap-1.5">
              <span className="h-px bg-current" />
              <span className="ml-auto h-px w-4 bg-current transition-all duration-300 group-hover:w-6" />
            </span>
          </button>
        </div>
      </header>

      {/* Side panel */}
      <div
        id="site-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Menu"
        inert={!open}
        data-lenis-prevent
        className={`fixed inset-0 z-[100] transition-all duration-500 ${open ? "visible" : "invisible"}`}
      >
        <div className={`absolute inset-0 bg-black/80 transition-opacity duration-500 ${open ? "opacity-100" : "opacity-0"}`} onClick={() => setOpen(false)} />

        <div className={`absolute bottom-0 right-0 top-0 flex w-full flex-col border-l border-white/10 bg-black transition-transform duration-500 ease-out md:w-[480px] ${open ? "translate-x-0" : "translate-x-full"}`}>
          <div className="flex h-[70px] items-center justify-end px-8 md:px-12">
            <button type="button" onClick={() => setOpen(false)} className="font-code h-11 text-[11px] uppercase tracking-[0.3em] text-white/60 transition-colors hover:text-white">
              Close
            </button>
          </div>

          <nav className="flex flex-1 flex-col justify-center gap-2 px-8 md:px-12">
            {LINKS.map(({ href, label }, i) => (
              <a
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                aria-current={current === href ? "location" : undefined}
                className={`group flex items-baseline gap-4 py-2 text-4xl font-bold transition-all duration-500 hover:translate-x-2 hover:text-white md:text-5xl ${
                  current === href ? "text-white" : "text-white/25"
                } ${open ? "translate-x-0 opacity-100" : "translate-x-10 opacity-0"}`}
                style={{ transitionDelay: open ? `${120 + i * 70}ms` : "0ms" }}
              >
                <span className="font-code text-xs font-normal text-[#C45CFF]">0{i + 1}</span>
                {label}
              </a>
            ))}
          </nav>

          <div className="space-y-3 px-8 pb-8 md:px-12">
            <div className="mb-6 h-px bg-white/10" />
            <p className="text-[11px] text-white/50">{EMAIL}</p>
            <p className="text-[11px] text-white/50">{PHONE_DISPLAY}</p>
            <p className="text-[11px] text-white/50">{LOCATION}</p>
          </div>
        </div>
      </div>
    </>
  );
}
