"use client";

import { useRef } from "react";

/**
 * A card with a soft glow that follows the pointer. The glow itself is drawn
 * in CSS (.spotlight-card); this only feeds it the pointer position.
 */
export default function SpotlightCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  const onMove = (event: React.PointerEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${event.clientX - rect.left}px`);
    el.style.setProperty("--my", `${event.clientY - rect.top}px`);
  };

  return (
    <div ref={ref} onPointerMove={onMove} className={`spotlight-card ${className}`}>
      {children}
    </div>
  );
}
