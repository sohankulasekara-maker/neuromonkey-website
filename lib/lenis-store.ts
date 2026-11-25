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

/* One clock for the page. SmoothScroll calls emitFrame after Lenis has moved
   the page, so anything that listens (the WebGL scene) draws with the scroll
   position of this exact frame and never lags a frame behind it. */
type FrameListener = (timeMs: number) => void;
const frameListeners = new Set<FrameListener>();

export function subscribeFrame(listener: FrameListener): () => void {
  frameListeners.add(listener);
  return () => {
    frameListeners.delete(listener);
  };
}

export function emitFrame(timeMs: number): void {
  frameListeners.forEach((listener) => listener(timeMs));
}
