import gsap from 'gsap';
import type { Rig } from '../rig/rig';

/**
 * Scroll choreography.
 *
 * Times are abstract timeline units; ScrollTrigger maps the whole timeline onto
 * the pinned scroll distance, so changing a number here re-times the film
 * without touching any component.
 */
export const STAGES = [
  { id: 'reveal', start: 0, end: 1.6 },
  { id: 'orbit', start: 1.6, end: 4.6 },
  { id: 'explode', start: 4.6, end: 6.8 },
  { id: 'ironav', start: 6.8, end: 8.6 },
  { id: 'internals', start: 8.6, end: 10.6 },
  { id: 'reassemble', start: 10.6, end: 13 },
] as const;

export const TIMELINE_LENGTH = STAGES[STAGES.length - 1].end;

/** Scroll distance of the pinned section, in viewport heights. */
export const PIN_VIEWPORTS = { desktop: 5.6, mobile: 4.6 };

type Pose = { cam: [number, number, number]; tgt: [number, number, number] };

export const CAMERA_POSES: Record<string, Pose> = {
  far: { cam: [7.2, 3.6, 9.6], tgt: [0, 0.1, 0] },
  hero: { cam: [4.7, 1.9, 5.9], tgt: [0, 0.08, 0] },
  side: { cam: [6.4, 1.2, 0.6], tgt: [0, 0.05, 0] },
  top: { cam: [0.7, 10.2, 1.9], tgt: [0, 0, 0] },
  wide: { cam: [7.2, 3.9, 9.8], tgt: [0, 0.45, 0] },
  module: { cam: [1.55, 0.95, 5.3], tgt: [0, 1.17, 2.0] },
  internals: { cam: [2.1, 2.2, 6.6], tgt: [0, 1.2, 2.0] },
};

const pose = (name: keyof typeof CAMERA_POSES) => {
  const p = CAMERA_POSES[name];
  return { camX: p.cam[0], camY: p.cam[1], camZ: p.cam[2], tgtX: p.tgt[0], tgtY: p.tgt[1], tgtZ: p.tgt[2] };
};

/**
 * Builds the master timeline. `overlays` are the stage caption elements in
 * stage order (matched by index with STAGES).
 */
export function buildExperienceTimeline(rig: Rig, overlays: HTMLElement[], hudFill?: HTMLElement | null) {
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
  const ease = 'power2.inOut';

  // ── 01 Reveal: dolly in to the three-quarter front perspective ──────────
  tl.to(rig, { ...pose('hero'), yaw: -0.35, duration: 1.2, ease: 'power3.out' }, 0);
  tl.to(rig, { labelsPlatform: 1, duration: 0.4 }, 0.7);

  // ── 02 Orbit: front → side → rear → top → front ─────────────────────────
  const o = STAGES[1].start;
  tl.to(rig, { labelsPlatform: 0, duration: 0.3 }, o);
  tl.to(rig, { yaw: -0.35 + Math.PI * 0.5, ...pose('side'), duration: 0.8, ease }, o + 0.05);
  tl.to(rig, { yaw: -0.35 + Math.PI, duration: 0.7, ease }, o + 0.85);
  tl.to(rig, { ...pose('hero'), duration: 0.7, ease }, o + 0.85);
  tl.to(rig, { yaw: -0.35 + Math.PI * 1.5, ...pose('top'), duration: 0.75, ease }, o + 1.55);
  tl.to(rig, { yaw: -0.35 + Math.PI * 2, ...pose('hero'), duration: 0.7, ease }, o + 2.3);

  // ── 03 Exploded view ────────────────────────────────────────────────────
  const e = STAGES[2].start;
  tl.to(rig, { ...pose('wide'), duration: 1.2, ease }, e);
  tl.to(rig, { explode: 1, duration: 1.6, ease: 'power1.inOut' }, e + 0.1);
  tl.to(rig, { guides: 1, duration: 0.6 }, e + 0.3);
  tl.to(rig, { labelsExploded: 1, duration: 0.4 }, e + 1.4);

  // ── 04 IroNav module reveal ─────────────────────────────────────────────
  const m = STAGES[3].start;
  tl.to(rig, { labelsExploded: 0, guides: 0.25, duration: 0.3 }, m);
  tl.to(rig, { focus: 1, dim: 1, glow: 1, yaw: Math.PI * 2, duration: 1.0, ease }, m + 0.1);
  tl.to(rig, { ...pose('module'), duration: 1.0, ease }, m + 0.1);
  tl.to(rig, { labelsIroNav: 1, duration: 0.35 }, m + 1.0);

  // ── 05 Conceptual internals ─────────────────────────────────────────────
  const n = STAGES[4].start;
  tl.to(rig, { labelsIroNav: 0, duration: 0.3 }, n);
  tl.to(rig, { internals: 1, duration: 1.0, ease }, n + 0.15);
  tl.to(rig, { ...pose('internals'), duration: 1.0, ease }, n + 0.15);
  tl.to(rig, { labelsInternals: 1, duration: 0.35 }, n + 1.05);

  // ── 06 Reassembly ───────────────────────────────────────────────────────
  const r = STAGES[5].start;
  tl.to(rig, { labelsInternals: 0, duration: 0.25 }, r);
  tl.to(rig, { internals: 0, duration: 0.6, ease }, r + 0.1);
  tl.to(rig, { focus: 0, glow: 0.25, duration: 0.7, ease }, r + 0.5);
  tl.to(rig, { explode: 0, guides: 0, dim: 0, duration: 1.1, ease: 'power2.inOut' }, r + 0.9);
  tl.to(rig, { ...pose('hero'), yaw: -0.35 + Math.PI * 2, duration: 1.4, ease }, r + 0.6);
  tl.to(rig, { glow: 0, duration: 0.3 }, r + 2.0);

  // ── Caption overlays ────────────────────────────────────────────────────
  overlays.forEach((el, i) => {
    const s = STAGES[i];
    if (!el || !s) return;
    const len = s.end - s.start;
    const inAt = i === 0 ? 0.55 : s.start + 0.12;
    tl.fromTo(el, { autoAlpha: 0, y: 28 }, { autoAlpha: 1, y: 0, duration: Math.min(0.4, len * 0.2), ease: 'power2.out' }, inAt);
    if (i < STAGES.length - 1) {
      tl.to(el, { autoAlpha: 0, y: -22, duration: Math.min(0.3, len * 0.15), ease: 'power2.in' }, s.end - 0.3);
    }
  });

  if (hudFill) tl.fromTo(hudFill, { scaleY: 0 }, { scaleY: 1, duration: TIMELINE_LENGTH, ease: 'none' }, 0);

  // Pad to the declared length so the final stage holds.
  tl.set({}, {}, TIMELINE_LENGTH);
  return tl;
}

/** Normalised scroll progress at which a stage's content is fully presented. */
export const stageProgress = (index: number) => {
  const s = STAGES[index];
  const at = index === 0 ? 1.5 : index === STAGES.length - 1 ? TIMELINE_LENGTH : s.start + (s.end - s.start) * 0.72;
  return at / TIMELINE_LENGTH;
};
