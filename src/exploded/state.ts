import type { GroupId } from './config';

/**
 * Animation state for the photographic exploded view. GSAP tweens these
 * scalars (scrubbed by ScrollTrigger); the canvas renderer reads them.
 */
export interface ExplodeState {
  /** 0 = assembled (original photograph), 1 = fully separated. */
  sep: number;
  /** Per-group outline highlight (0-1). */
  hl: Record<GroupId, number>;
  /** Group callout labels during highlight / separation. */
  labels: number;
  /** Dims every layer except the IroNav module. */
  dim: number;
  /** 0 = module in its exploded slot, 1 = centred and enlarged. */
  focus: number;
  /** Module annotations. */
  notes: number;
}

export const createState = (): ExplodeState => ({
  sep: 0,
  hl: { propellers: 0, motors: 0, arms: 0, frame: 0, gear: 0, electronics: 0, cables: 0, ironav: 0 },
  labels: 0,
  dim: 0,
  focus: 0,
  notes: 0,
});

export const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
export const easeInOut = (v: number) => {
  const t = clamp01(v);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
};
/** Staggered local progress for a group inside the 0-1 separation channel. */
export const staggered = (v: number, delay: number, span = 0.68) => easeInOut((v - delay) / span);
