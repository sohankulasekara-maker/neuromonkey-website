"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { createMorphShape, displace } from "./morph";
import { damp, MAX_DELTA, type SceneState } from "./sceneState";

/**
 * Act 3: a dark, oil-slick form that rises in with the contact section and
 * floats beside it. Near-black metal with a thin-film coat, so it shows only
 * shifting blue-purple-green edges against the black page.
 */

const DETAIL_DESKTOP = { radial: 64, tubular: 220 };
const DETAIL_MOBILE = { radial: 32, tubular: 110 };
const RISE = 0.35;

function layout(width: number, height: number) {
  const isPortrait = width / height < 0.8;
  if (isPortrait) return { x: width * 0.32, offsetY: height * 0.33, size: width * 0.18 };
  return { x: width * 0.09, offsetY: height * 0.08, size: Math.min(height * 0.2, width * 0.12) };
}

export default function IridescentForm({ state }: { state: SceneState }) {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const viewport = useThree((s) => s.viewport);
  const motion = useRef({ time: 0, x: 0, y: 0 });

  const shape = useMemo(() => {
    const detail = state.isLowPower ? DETAIL_MOBILE : DETAIL_DESKTOP;
    return createMorphShape(new THREE.TorusGeometry(1, 0.42, detail.radial, detail.tubular));
  }, [state.isLowPower]);

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, MAX_DELTA);
    const { contactOpacity, contactCenterY } = state.stage;
    if (!group.current || !mesh.current) return;
    const isVisible = contactOpacity > 0.002;
    group.current.visible = isVisible;
    if (!isVisible) return;

    const m = motion.current;
    m.time += delta;
    const { width, height } = viewport.getCurrentViewport();
    const { x, offsetY, size } = layout(width, height);

    /* Pinned to the contact section, so it scrolls with it, plus a slow bob. */
    const sectionY = (contactCenterY * height) / 2;
    const bob = Math.sin(m.time * 0.8) * size * 0.08;
    group.current.position.set(x, sectionY + offsetY + bob - (1 - contactOpacity) * size * RISE * 4, 0);
    group.current.scale.setScalar(size * (0.7 + 0.3 * contactOpacity));

    displace(shape, { time: m.time * 0.18, amplitude: 0.16, frequency: 1.3 });

    m.x = damp(m.x, state.pointer.y * 0.5, 2, delta);
    m.y = damp(m.y, state.pointer.x * 0.7, 2, delta);
    mesh.current.rotation.set(0.9 + m.x + m.time * 0.07, m.y + m.time * 0.13, m.time * 0.04);
  });

  return (
    <group ref={group} visible={false}>
      <mesh ref={mesh} geometry={shape.geometry}>
        <meshPhysicalMaterial
          color="#0b0418"
          metalness={0.85}
          roughness={0.16}
          iridescence={1}
          iridescenceIOR={1.7}
          iridescenceThicknessMinimum={180}
          iridescenceThicknessMaximum={820}
          clearcoat={1}
          clearcoatRoughness={0.08}
          envMapIntensity={2.2}
        />
      </mesh>
    </group>
  );
}
