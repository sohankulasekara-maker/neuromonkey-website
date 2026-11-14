"use client";

import { useRef } from "react";
import { prefersReducedMotion } from "@/lib/lenis-store";

/** How far, as a share of the pointer offset, the child is pulled. */
const PULL = 0.25;

/** Wraps a button or link so it leans toward the pointer (mouse only). */
export default function Magnetic({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el || event.pointerType !== "mouse" || prefersReducedMotion()) return;
    const rect = el.getBoundingClientRect();
    const x = (event.clientX - (rect.left + rect.width / 2)) * PULL;
    const y = (event.clientY - (rect.top + rect.height / 2)) * PULL;
    el.style.transform = `translate(${x}px, ${y}px)`;
  };

  const onLeave = () => {
    if (ref.current) ref.current.style.transform = "";
  };

  return (
    <div ref={ref} onPointerMove={onMove} onPointerLeave={onLeave} className={`transition-transform duration-300 ease-out ${className}`}>
      {children}
    </div>
  );
}
