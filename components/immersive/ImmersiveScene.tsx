"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { Bloom, EffectComposer } from "@react-three/postprocessing";
import { computeStage, readStageInput } from "@/lib/immersive-stage";
import { subscribeFrame } from "@/lib/lenis-store";
import GlassForm from "./GlassForm";
import IridescentForm from "./IridescentForm";
import { createSceneState, damp, MAX_DELTA, type SceneState } from "./sceneState";

/**
 * The page's WebGL layer: one fixed, full-screen canvas behind the content.
 *
 * It does not run its own loop. Lenis's frame (lib/lenis-store emitFrame)
 * drives it, so the 3D moves in the same frame as the smooth scroll. When
 * neither form is on screen, or the tab is hidden, it simply stops drawing.
 */

const CAMERA_Z = 7;
const DOLLY = 1.1;
const PARALLAX = { x: 0.35, y: 0.22 };

/** Runs the scene from the Lenis clock and fades the layer between acts. */
function FrameDriver({ state, layer }: { state: SceneState; layer: React.RefObject<HTMLDivElement | null> }) {
  const advance = useThree((s) => s.advance);

  useEffect(() => {
    let wasActive = true;
    return subscribeFrame((timeMs) => {
      state.stage = computeStage(readStageInput());
      const { heroOpacity, contactOpacity, isActive } = state.stage;
      const el = layer.current;
      if (el) {
        el.style.opacity = String(Math.max(heroOpacity, contactOpacity));
        if (isActive !== wasActive) el.style.visibility = isActive ? "visible" : "hidden";
      }
      wasActive = isActive;
      if (isActive && !document.hidden) advance(timeMs / 1000);
    });
  }, [advance, layer, state]);

  return null;
}

/** Camera eases toward the pointer (depth parallax) and dollies in on scroll. */
function CameraRig({ state }: { state: SceneState }) {
  useFrame(({ camera }, rawDelta) => {
    const delta = Math.min(rawDelta, MAX_DELTA);
    const { pointer, stage } = state;
    camera.position.x = damp(camera.position.x, pointer.x * PARALLAX.x, 2.5, delta);
    camera.position.y = damp(camera.position.y, pointer.y * PARALLAX.y, 2.5, delta);
    camera.position.z = CAMERA_Z - stage.heroProgress * DOLLY;
    camera.lookAt(0, 0, 0);
  });
  return null;
}

/** Studio light built from brand-coloured panels: no HDR download needed. */
function BrandEnvironment() {
  return (
    <Environment resolution={256} frames={1}>
      <Lightformer form="rect" intensity={2.5} color="#ffffff" position={[0, 5, -2]} scale={[10, 1.2, 1]} />
      <Lightformer form="rect" intensity={5} color="#1a1aff" position={[-5, 1, 1]} rotation-y={Math.PI / 2} scale={[6, 3, 1]} />
      <Lightformer form="rect" intensity={5} color="#b000e6" position={[5, -1, 1]} rotation-y={-Math.PI / 2} scale={[6, 3, 1]} />
      <Lightformer form="ring" intensity={3} color="#7c4dff" position={[0, 0, 6]} scale={3} />
      <Lightformer form="rect" intensity={1.5} color="#3a3aff" position={[0, -5, 0]} rotation-x={-Math.PI / 2} scale={[8, 2, 1]} />
    </Environment>
  );
}

export default function ImmersiveScene({ isLowPower }: { isLowPower: boolean }) {
  const layer = useRef<HTMLDivElement>(null);
  const state = useMemo(() => createSceneState(isLowPower), [isLowPower]);

  useEffect(() => {
    const onPointer = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      state.pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      state.pointer.y = 1 - (event.clientY / window.innerHeight) * 2;
    };
    window.addEventListener("pointermove", onPointer, { passive: true });
    return () => window.removeEventListener("pointermove", onPointer);
  }, [state]);

  return (
    /* Screen blend: the black clear colour drops out, so the star field
       behind still shows and the forms read as light on top of it. */
    <div ref={layer} aria-hidden="true" className="pointer-events-none fixed inset-0 -z-[5] mix-blend-screen" style={{ opacity: 0 }}>
      <Canvas
        frameloop="never"
        dpr={isLowPower ? [1, 1.25] : [1, 1.75]}
        camera={{ position: [0, 0, CAMERA_Z], fov: 35, near: 0.1, far: 50 }}
        gl={{ antialias: false, alpha: false, powerPreference: "high-performance", stencil: false }}
      >
        <color attach="background" args={["#000000"]} />
        <FrameDriver state={state} layer={layer} />
        <CameraRig state={state} />
        <BrandEnvironment />
        <GlassForm state={state} />
        <IridescentForm state={state} />
        <EffectComposer multisampling={isLowPower ? 0 : 4}>
          <Bloom mipmapBlur intensity={isLowPower ? 0.7 : 1.05} luminanceThreshold={0.85} luminanceSmoothing={0.2} radius={0.75} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
