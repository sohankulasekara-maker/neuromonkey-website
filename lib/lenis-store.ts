import type Lenis from "lenis";

/**
 * One shared handle on the smooth-scroll instance, so the menu can lock the
 * page and links can scroll to a section without reaching for a global.
 */
let instance: Lenis | null = null;

export function setLenis(lenis: Lenis | null): void {
  instance = lenis;
}

export function lockScroll(isLocked: boolean): void {
  if (!instance) return;
  if (isLocked) instance.stop();
  else instance.start();
}

export function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Smooth-scroll to a vertical position (falls back to the browser's own). */
export function scrollToY(top: number): void {
  if (instance) instance.scrollTo(top, { immediate: prefersReducedMotion(), force: true });
  else window.scrollTo({ top });
}
