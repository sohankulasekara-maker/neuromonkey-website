import { computeStage, type Stage } from "@/lib/immersive-stage";

/**
 * Live values the 3D objects read every frame. Kept outside React so moving
 * the mouse or scrolling never re-renders anything.
 */
export interface SceneState {
  stage: Stage;
  /** Pointer position, -1 to 1 on both axes (up is positive). */
  pointer: { x: number; y: number };
  /** Phones and tablets: fewer samples, fewer vertices, lower resolution. */
  isLowPower: boolean;
}

export function createSceneState(isLowPower: boolean): SceneState {
  return {
    stage: computeStage({ scrollY: 0, viewportWidth: 1, viewportHeight: 1, heroEnd: 1, servicesTravel: 1, wheel: null, process: null, contactTop: null, contactHeight: 0 }),
    pointer: { x: 0, y: 0 },
    isLowPower,
  };
}

/** Frame-rate independent easing toward a target. */
export function damp(current: number, target: number, lambda: number, delta: number): number {
  return current + (target - current) * (1 - Math.exp(-lambda * delta));
}

/** Longest step the animation may take, so a paused scene resumes smoothly. */
export const MAX_DELTA = 1 / 20;
