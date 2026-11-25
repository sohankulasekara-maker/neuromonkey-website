import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { SimplexNoise } from "three/examples/jsm/math/SimplexNoise.js";

/**
 * A shape that breathes. Every vertex is pushed in or out along its own
 * direction by 3D noise, so the surface ripples like liquid glass. Runs on the
 * CPU so it works with any material, including MeshTransmissionMaterial.
 */
export interface MorphShape {
  geometry: THREE.BufferGeometry;
  /** Undisplaced positions and their outward directions, for re-displacing each frame. */
  base: Float32Array;
  normals: Float32Array;
}

/** Strips uvs and normals so seams weld shut, then stores the rest pose. */
export function createMorphShape(source: THREE.BufferGeometry): MorphShape {
  const clean = source.clone();
  clean.deleteAttribute("uv");
  clean.deleteAttribute("normal");
  const geometry = mergeVertices(clean);
  geometry.computeVertexNormals();
  source.dispose();
  clean.dispose();
  return {
    geometry,
    base: (geometry.attributes.position.array as Float32Array).slice(),
    normals: (geometry.attributes.normal.array as Float32Array).slice(),
  };
}

export interface MorphParams {
  time: number;
  /** How far the surface moves, in object units. */
  amplitude: number;
  /** How busy the ripples are. */
  frequency: number;
}

const noise = new SimplexNoise();

export function displace(shape: MorphShape, { time, amplitude, frequency }: MorphParams): void {
  const positions = shape.geometry.attributes.position.array as Float32Array;
  const { base, normals } = shape;
  for (let i = 0; i < base.length; i += 3) {
    const x = base[i];
    const y = base[i + 1];
    const z = base[i + 2];
    const n = noise.noise4d(x * frequency, y * frequency, z * frequency, time);
    const offset = n * amplitude;
    positions[i] = x + normals[i] * offset;
    positions[i + 1] = y + normals[i + 1] * offset;
    positions[i + 2] = z + normals[i + 2] * offset;
  }
  shape.geometry.attributes.position.needsUpdate = true;
  shape.geometry.computeVertexNormals();
}
