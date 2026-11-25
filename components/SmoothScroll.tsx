"use client";

import { useEffect } from "react";
import Lenis from "lenis";
import { emitFrame, prefersReducedMotion, setLenis } from "@/lib/lenis-store";

/** Height of the fixed navbar, so a section heading never hides under it. */
const NAV_OFFSET = 0; // globals.css already gives every section a scroll-margin for the navbar

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const isReduced = prefersReducedMotion();
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: !isReduced,
    });
    setLenis(lenis);

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      emitFrame(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);

    /* One listener on the document, so links added later (menu, cards) work
       too. A bare "#" is not a section and must not reach querySelector. */
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
      const hash = anchor?.getAttribute("href") ?? "";
      if (hash.length < 2) return;
      const target = document.getElementById(hash.slice(1));
      if (!target) return;
      event.preventDefault();
      history.replaceState(null, "", hash);
      /* Wait two frames: a link inside the menu closes it first, and the page
         only unlocks once that has rendered. */
      requestAnimationFrame(() =>
        requestAnimationFrame(() => {
          lenis.start();
          lenis.scrollTo(target, { offset: NAV_OFFSET, immediate: isReduced, force: true });
        }),
      );
    };
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(frame);
      setLenis(null);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
