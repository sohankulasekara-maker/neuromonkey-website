"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { prefersReducedMotion } from "@/lib/lenis-store";

/**
 * Decides whether the page gets the WebGL scene at all, and loads it late.
 *
 * - Three.js is split into its own chunk (ssr: false) and only fetched once
 *   the browser is idle, so the first paint and the headline are never held up.
 * - Reduced-motion visitors, and browsers without WebGL, get a still glow
 *   in the same place instead.
 */

const ImmersiveScene = dynamic(() => import("./ImmersiveScene"), { ssr: false });

const LOW_POWER_QUERY = "(max-width: 767px), (pointer: coarse)";
const IDLE_TIMEOUT_MS = 1500;

type Mode = "pending" | "webgl" | "static";

function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2") ?? canvas.getContext("webgl");
    /* Hand the test context straight back: browsers cap live contexts. */
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    return context !== null;
  } catch {
    return false;
  }
}

/** The no-WebGL / reduced-motion stand-in: a soft brand glow beside the hero. */
function StaticGlow() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 -z-[5] h-[100svh] overflow-hidden">
      <div className="absolute right-[-20%] top-[18%] h-[60vmin] w-[60vmin] rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(120,80,255,0.45),rgba(166,0,200,0.25)_45%,transparent_70%)] blur-2xl md:right-[14%] md:top-[20%]" />
    </div>
  );
}

export default function ImmersiveLayer() {
  const [mode, setMode] = useState<Mode>("pending");
  const [isLowPower, setIsLowPower] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion() || !hasWebGL()) {
      setMode("static");
      return;
    }
    setIsLowPower(window.matchMedia(LOW_POWER_QUERY).matches);
    const start = () => setMode("webgl");
    if ("requestIdleCallback" in window) {
      const id = window.requestIdleCallback(start, { timeout: IDLE_TIMEOUT_MS });
      return () => window.cancelIdleCallback(id);
    }
    const id = setTimeout(start, 300);
    return () => clearTimeout(id);
  }, []);

  if (mode === "static") return <StaticGlow />;
  if (mode === "webgl") return <ImmersiveScene isLowPower={isLowPower} />;
  return null;
}
