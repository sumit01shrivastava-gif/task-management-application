/**
 * The animation rig: a plain mutable object of scalar channels.
 *
 * GSAP tweens these values (scrubbed by ScrollTrigger); the R3F scene reads
 * them every frame. Nothing in React state changes during scroll, so scrolling
 * never triggers React re-renders.
 */
export interface Rig {
  /** Camera position & look-at target (world). */
  camX: number;
  camY: number;
  camZ: number;
  tgtX: number;
  tgtY: number;
  tgtZ: number;
  /** Airframe orientation (radians). */
  yaw: number;
  pitch: number;
  roll: number;
  /** 0 → assembled, 1 → fully exploded. */
  explode: number;
  /** 0 → IroNav in exploded slot, 1 → presented to camera. */
  focus: number;
  /** 0 → IroNav enclosure closed, 1 → conceptual internals exploded. */
  internals: number;
  /** Non-IroNav parts dimming during the module reveal. */
  dim: number;
  /** Annotation layers (0-1 opacity). */
  labelsPlatform: number;
  labelsExploded: number;
  labelsIroNav: number;
  labelsInternals: number;
  /** IroNav highlight glow strength. */
  glow: number;
  /** Assembly guide lines visibility. */
  guides: number;
}

export const createRig = (): Rig => ({
  camX: 7.2,
  camY: 3.6,
  camZ: 9.6,
  tgtX: 0,
  tgtY: 0.1,
  tgtZ: 0,
  yaw: -0.35,
  pitch: 0,
  roll: 0,
  explode: 0,
  focus: 0,
  internals: 0,
  dim: 0,
  labelsPlatform: 0,
  labelsExploded: 0,
  labelsIroNav: 0,
  labelsInternals: 0,
  glow: 0,
  guides: 0,
});

/** Static rig for the hero visual and reduced-motion still frames. */
export const heroRig = (): Rig => ({ ...createRig(), camX: 5.9, camY: 2.2, camZ: 7.5, tgtY: 0.1, yaw: -0.35 });

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const smooth = (v: number) => {
  const t = clamp01(v);
  return t * t * (3 - 2 * t);
};
export const easeInOut = (v: number) => {
  const t = clamp01(v);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
/** Local progress of a staggered sub-animation inside a 0-1 channel. */
export const stagger = (v: number, delay: number, span = 0.65) => easeInOut((v - delay) / span);
