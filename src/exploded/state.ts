import { GROUPS, manifest, type GroupId } from './config';

/**
 * Animation state for the photographic exploded view. GSAP tweens these
 * scalars (scrubbed by ScrollTrigger); the canvas renderer reads them.
 *
 * Every layer has its own separation progress, so components can detach one at
 * a time in a dedicated scroll interval and stay in their exploded positions
 * while later components separate.
 */
export interface ExplodeState {
  /** Per-layer separation: 0 = in its original position, 1 = exploded position. */
  p: Record<string, number>;
  /** Per-group outline highlight (0–1). */
  hl: Record<GroupId, number>;
  /** Per-group callout label opacity (0–1). */
  lab: Record<GroupId, number>;
  /** Dims (and defocuses) every layer except the IroNav module. */
  dim: number;
  /** 0 = module in its exploded slot, 1 = brought to the camera and enlarged. */
  focus: number;
  /** Module annotations. */
  notes: number;
  /** Virtual camera: centre in image px and zoom (× fit scale). */
  cam: { x: number; y: number; z: number };
  /** Specular light sweep across the aircraft: position (0–1) and strength. */
  sweep: number;
  sweepA: number;
}

const groupRecord = () => Object.fromEntries(GROUPS.map((g) => [g.id, 0])) as Record<GroupId, number>;

export const createState = (cam: { x: number; y: number; z: number }): ExplodeState => ({
  p: Object.fromEntries(manifest.layers.map((l) => [l.id, 0])),
  hl: groupRecord(),
  lab: groupRecord(),
  dim: 0,
  focus: 0,
  notes: 0,
  cam: { ...cam },
  sweep: 0,
  sweepA: 0,
});

// Iterate known layer ids only: GSAP attaches its own cache property to tweened objects.
const LAYER_IDS = manifest.layers.map((l) => l.id);

/** True only when every layer, focus and dimming are exactly at rest. */
export const isAssembled = (s: ExplodeState) => s.focus === 0 && s.dim === 0 && LAYER_IDS.every((id) => s.p[id] === 0);

/** Number of layers currently more than half-way to their exploded position. */
export const detachedCount = (s: ExplodeState) => LAYER_IDS.filter((id) => s.p[id] > 0.5).length;

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const easeInOut = (v: number) => {
  const t = clamp01(v);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
