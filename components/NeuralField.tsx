"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/lenis-store";

/**
 * The "neuro" in NeuroMonkey: drifting nodes joined by faint lines. Nodes near
 * the pointer light up and link to it. Pauses when off screen or in a hidden
 * tab, and draws a single still frame for reduced-motion visitors.
 */
const LINK_DISTANCE = 130;
const POINTER_DISTANCE = 190;
const NODE_AREA = 16000; // one node per this many square pixels
const MAX_NODES = 110;
const SPEED = 0.22;

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export default function NeuralField({ className = "" }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    let width = 0;
    let height = 0;
    let nodes: Node[] = [];
    let frame = 0;
    let isVisible = true;
    const pointer = { x: -9999, y: -9999 };
    const isReduced = prefersReducedMotion();

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = rect.width;
      height = rect.height;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(MAX_NODES, Math.round((width * height) / NODE_AREA));
      nodes = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED,
      }));
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      for (const node of nodes) {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;
      }
      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j += 1) {
          const b = nodes[j];
          const distance = Math.hypot(a.x - b.x, a.y - b.y);
          if (distance > LINK_DISTANCE) continue;
          ctx.strokeStyle = `rgba(120, 70, 255, ${0.16 * (1 - distance / LINK_DISTANCE)})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.stroke();
        }
        const toPointer = Math.hypot(a.x - pointer.x, a.y - pointer.y);
        const glow = toPointer < POINTER_DISTANCE ? 1 - toPointer / POINTER_DISTANCE : 0;
        if (glow > 0) {
          ctx.strokeStyle = `rgba(200, 90, 255, ${0.55 * glow})`;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(pointer.x, pointer.y);
          ctx.stroke();
        }
        ctx.fillStyle = `rgba(${150 + 90 * glow}, ${110 + 60 * glow}, 255, ${0.35 + 0.65 * glow})`;
        ctx.beginPath();
        ctx.arc(a.x, a.y, 1.3 + 1.7 * glow, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = () => {
      draw();
      frame = requestAnimationFrame(loop);
    };
    const start = () => {
      if (frame || isReduced || !isVisible || document.hidden) return;
      frame = requestAnimationFrame(loop);
    };
    const stop = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
    };

    const onPointer = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
    };
    const onVisibility = () => (document.hidden ? stop() : start());
    const onResize = () => {
      resize();
      if (isReduced) draw();
    };

    const observer = new IntersectionObserver(([entry]) => {
      isVisible = entry.isIntersecting;
      if (isVisible) start();
      else stop();
    });

    resize();
    draw();
    observer.observe(canvas);
    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("resize", onResize);
    document.addEventListener("visibilitychange", onVisibility);
    start();

    return () => {
      stop();
      observer.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={`pointer-events-none h-full w-full ${className}`} />;
}
