import gsap from 'gsap';
import { CAMERA, GROUPS, type Mode } from './config';
import type { ExplodeState } from './state';

/**
 * Scroll choreography in abstract timeline units. ScrollTrigger maps the whole
 * timeline onto the pinned scroll distance, so scrolling up reverses it exactly.
 */
export const STAGES = [
  { id: 'original', label: 'Aircraft', start: 0, end: 1.3 },
  { id: 'highlight', label: 'Assemblies', start: 1.3, end: 3.7 },
  { id: 'separate', label: 'Separation', start: 3.7, end: 5.1 },
  { id: 'exploded', label: 'Exploded', start: 5.1, end: 6.6 },
  { id: 'ironav', label: 'IroNav', start: 6.6, end: 8.7 },
  { id: 'reassemble', label: 'Reassembly', start: 8.7, end: 11 },
] as const;

export const TIMELINE_LENGTH = STAGES[STAGES.length - 1].end;

/** Pinned scroll distance in viewport heights. */
export const PIN_VIEWPORTS = { desktop: 6, mobile: 5.2 };

export function buildTimeline(state: ExplodeState, mode: Mode, captions: HTMLElement[], progressEl?: HTMLElement | null) {
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
  const ease = 'power2.inOut';
  const cam = CAMERA[mode];
  const camTo = (k: { x: number; y: number; z: number }, at: number, duration: number, e = ease) => tl.to(state.cam, { ...k, duration, ease: e }, at);

  // 01 — the aircraft, as photographed: a slow push-in
  camTo(mode === 'mobile' ? cam.original : { ...cam.original, z: 1.03 }, 0, 1.3, 'sine.inOut');

  // 02 — assemblies traced one by one; light sweeps across the airframe
  const h = STAGES[1].start;
  if (mode === 'mobile') {
    const m = CAMERA.mobile;
    camTo(m.highlight, h, 1.1);
    camTo(m.highlight2, h + 1.1, 1.2);
  } else {
    camTo(cam.highlight, h, 2.4, 'sine.inOut');
  }
  tl.fromTo(state, { sweep: 0 }, { sweep: 1, duration: 2.2, ease: 'power1.inOut' }, h + 0.05);
  tl.to(state, { sweepA: 1, duration: 0.3 }, h + 0.05);
  tl.to(state, { sweepA: 0, duration: 0.3 }, h + 1.95);
  GROUPS.forEach((g, i) => {
    const at = h + 0.15 + i * 0.26;
    tl.to(state.hl, { [g.id]: 1, duration: 0.28, ease: 'power1.out' }, at);
    tl.to(state.hl, { [g.id]: 0.2, duration: 0.28, ease: 'power1.in' }, at + 0.4);
  });
  tl.to(state.hl, { propellers: 0, motors: 0, arms: 0, frame: 0, gear: 0, electronics: 0, cables: 0, ironav: 0, duration: 0.25 }, STAGES[1].end + 0.02);

  // 03 — controlled separation
  const s = STAGES[2].start;
  camTo(cam.separate, s, 1.4);
  tl.to(state, { sep: 0.55, duration: 1.3, ease: 'power1.inOut' }, s + 0.1);

  // 04 — fully exploded composition
  const e = STAGES[3].start;
  camTo(cam.exploded, e, 1.2);
  tl.to(state, { sep: 1, duration: 1.0, ease: 'power2.out' }, e);
  tl.to(state, { labels: 1, duration: 0.3 }, e + 0.9);

  // 05 — IroNav module comes forward; everything else recedes out of focus
  const m = STAGES[4].start;
  tl.to(state, { labels: 0, duration: 0.25 }, m);
  camTo(cam.ironav, m + 0.1, 1.0);
  tl.to(state, { focus: 1, dim: 1, duration: 1.0, ease }, m + 0.1);
  tl.to(state, { notes: 1, duration: 0.3 }, m + 1.15);

  // 06 — reassembly: every layer, and the camera, back to the opening frame
  const r = STAGES[5].start;
  tl.to(state, { notes: 0, duration: 0.25 }, r);
  tl.to(state, { focus: 0, duration: 0.8, ease }, r + 0.15);
  tl.to(state, { dim: 0, duration: 0.8, ease }, r + 0.45);
  tl.to(state, { sep: 0, duration: 1.3, ease: 'power2.inOut' }, r + 0.6);
  camTo(cam.original, r + 0.4, 1.6);

  // editorial captions
  captions.forEach((el, i) => {
    const st = STAGES[i];
    if (!el || !st) return;
    if (i === 0) gsap.set(el, { autoAlpha: 1, y: 0 });
    else tl.fromTo(el, { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' }, st.start + 0.1);
    if (i < STAGES.length - 1) tl.to(el, { autoAlpha: 0, y: -24, duration: 0.3, ease: 'power2.in' }, st.end - 0.3);
  });

  if (progressEl) tl.fromTo(progressEl, { scaleX: 0 }, { scaleX: 1, duration: TIMELINE_LENGTH }, 0);
  tl.set({}, {}, TIMELINE_LENGTH);
  return tl;
}

/** Normalised progress at which a stage is fully presented. */
export const stageProgress = (i: number) => {
  const st = STAGES[i];
  const at = i === 0 ? 0.4 : i === STAGES.length - 1 ? TIMELINE_LENGTH : st.start + (st.end - st.start) * 0.75;
  return at / TIMELINE_LENGTH;
};
