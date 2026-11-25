"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { MeshTransmissionMaterial } from "@react-three/drei";
import { createMorphShape, displace } from "./morph";
import { damp, MAX_DELTA, type SceneState } from "./sceneState";

/**
 * Act 1 and 2: a liquid-glass form beside the hero headline. It refracts the
 * glowing orbs that circle behind it, leans toward the pointer, and as the
 * page scrolls it travels left, shrinks and ripples harder before fading out.
 */

const DETAIL_DESKTOP = 40;
const DETAIL_MOBILE = 20;
/** Glass radius as a share of the Services wheel's radius (orbs reach about 1.35x this). */
const WHEEL_FILL = 0.5;
/* Orbs are brighter than 1 so bloom picks them up. */
const ORB_BLUE = new THREE.Color("#2b2bff").multiplyScalar(5);
const ORB_PURPLE = new THREE.Color("#c020ff").multiplyScalar(5);
const RING_COLOR = new THREE.Color("#6a2bff").multiplyScalar(1.1);
const ORBS = [
  { color: ORB_BLUE, radius: 1.2, speed: 0.35, phase: 0, size: 0.15 },
  { color: ORB_PURPLE, radius: 1.3, speed: -0.28, phase: 2.1, size: 0.2 },
  { color: ORB_PURPLE, radius: 1.1, speed: 0.5, phase: 4.2, size: 0.09 },
  { color: ORB_BLUE, radius: 1.35, speed: -0.2, phase: 5.3, size: 0.12 },
];

interface Layout {
  x: number;
  y: number;
  size: number;
}

/** Where the form sits at the top of the page, in world units. */
function heroLayout(width: number, height: number): Layout {
  const isPortrait = width / height < 0.8;
  /* Behind Yakira's shoulders (her cutout is layered on top of the canvas),
     big enough that the glass and its orbs glow out around her. */
  if (isPortrait) return { x: width * 0.12, y: -height * 0.2, size: width * 0.34 };
  return { x: width * 0.27, y: height * 0.04, size: Math.min(height * 0.22, width * 0.15) };
}

/** Where scrolling carries it: beside the Services wheel, where it fades. */
function travelLayout(width: number, height: number, wheel: SceneState["stage"]["wheel"]): Layout {
  /* Desktop: centred in the Services wheel, following it as it scrolls in.
     Sized so the glass and its orbs stay inside the ring. */
  if (wheel) return { x: (wheel.x * width) / 2, y: (wheel.y * height) / 2, size: wheel.radius * height * WHEEL_FILL };
  const isPortrait = width / height < 0.8;
  /* Phones have no wheel: the empty space under the service text. */
  if (isPortrait) return { x: -width * 0.25, y: -height * 0.36, size: width * 0.16 };
  return { x: -width * 0.36, y: -height * 0.2, size: Math.min(height * 0.12, width * 0.08) };
}

export default function GlassForm({ state }: { state: SceneState }) {
  const group = useRef<THREE.Group>(null);
  const mesh = useRef<THREE.Mesh>(null);
  const orbs = useRef<THREE.Group>(null);
  const viewport = useThree((s) => s.viewport);
  const spin = useRef({ x: 0, y: 0, time: 0 });

  const shape = useMemo(
    () => createMorphShape(new THREE.IcosahedronGeometry(1, state.isLowPower ? DETAIL_MOBILE : DETAIL_DESKTOP)),
    [state.isLowPower],
  );

  useFrame((_, rawDelta) => {
    const delta = Math.min(rawDelta, MAX_DELTA);
    const { heroProgress, heroOpacity } = state.stage;
    const isVisible = heroOpacity > 0.002;
    if (!group.current || !mesh.current || !orbs.current) return;
    /* An invisible material makes MeshTransmissionMaterial skip its extra render pass. */
    (mesh.current.material as THREE.Material).visible = isVisible;
    group.current.visible = isVisible;
    if (!isVisible) return;

    const { width, height } = viewport.getCurrentViewport();
    const from = heroLayout(width, height);
    const to = travelLayout(width, height, state.stage.wheel);
    const t = heroProgress * heroProgress * (3 - 2 * heroProgress);
    const early = Math.sqrt(t);
    const s = spin.current;
    s.time += delta;

    /* Travel: position and size blend from the hero pose to the travel pose. */
    group.current.position.set(
      THREE.MathUtils.lerp(from.x, to.x, early),
      THREE.MathUtils.lerp(from.y, to.y, t),
      0,
    );
    /* Shrinks early in the journey, so it is small by the time it crosses the stats. */
    const size = THREE.MathUtils.lerp(from.size, to.size, early) * (0.85 + 0.15 * heroOpacity);
    group.current.scale.setScalar(size);

    /* Morph: calm at the top, rippling hard mid-travel. */
    displace(shape, {
      time: s.time * 0.22,
      amplitude: 0.1 + 0.18 * Math.sin(t * Math.PI) + 0.05 * t,
      frequency: 1.05 + 0.9 * t,
    });

    /* Lean toward the pointer, and keep turning slowly. */
    s.x = damp(s.x, state.pointer.y * 0.45, 3, delta);
    s.y = damp(s.y, state.pointer.x * 0.6, 3, delta);
    mesh.current.rotation.set(s.x + s.time * 0.05, s.y + s.time * 0.09 + t * 2.4, t * 0.6);

    orbs.current.children.forEach((orb, i) => {
      const { radius, speed, phase } = ORBS[i];
      const angle = s.time * speed + phase;
      orb.position.set(Math.cos(angle) * radius, Math.sin(angle * 1.3) * 0.55, -0.7 + Math.sin(angle) * 0.35);
    });
  });

  const lowPower = state.isLowPower;

  return (
    <group ref={group}>
      <mesh ref={mesh} geometry={shape.geometry}>
        <MeshTransmissionMaterial
          samples={lowPower ? 3 : 6}
          resolution={lowPower ? 256 : 768}
          transmission={1}
          thickness={1.4}
          roughness={0.04}
          ior={1.35}
          chromaticAberration={lowPower ? 0.25 : 0.55}
          anisotropicBlur={0.15}
          distortion={0.35}
          distortionScale={0.4}
          temporalDistortion={0.08}
          color="#d9d4ff"
          attenuationColor="#7a3cff"
          attenuationDistance={2.4}
          clearcoat={1}
          clearcoatRoughness={0.05}
          envMapIntensity={1.4}
          backside={!lowPower}
          backsideThickness={0.6}
        />
      </mesh>

      {/* Glowing orbs circling behind the glass: what it bends and blooms. */}
      <group ref={orbs}>
        {ORBS.map(({ color, size }, i) => (
          <mesh key={i} scale={size}>
            <sphereGeometry args={[1, 24, 24]} />
            <meshBasicMaterial color={color} toneMapped={false} />
          </mesh>
        ))}
      </group>
      <mesh position={[0, 0, -0.9]} rotation={[Math.PI * 0.42, 0, 0]}>
        <torusGeometry args={[1.05, 0.01, 12, 160]} />
        <meshBasicMaterial color={RING_COLOR} toneMapped={false} />
      </mesh>
    </group>
  );
}
