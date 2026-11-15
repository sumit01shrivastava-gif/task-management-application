import gsap from 'gsap';
import { CAMERA, CLOSEUP, GROUPS, SEQUENCE, stageCentroid, type Mode } from './config';
import type { ExplodeState } from './state';

/**
 * Sequential disassembly choreography.
 *
 * Every stage owns one unit of timeline (= one dedicated scroll interval):
 * ~70% of it is the transition, the rest is a hold so the visitor can read it.
 * ScrollTrigger scrubs the timeline, so scrolling back plays it exactly in reverse.
 */
export const STAGE_LEN = 1;
const MOVE = 0.7; // portion of a stage spent moving; the remainder holds

export const STAGES = SEQUENCE.map((s, i) => ({ id: s.id, label: s.label, start: i * STAGE_LEN, end: (i + 1) * STAGE_LEN }));
export const TIMELINE_LENGTH = STAGES.length * STAGE_LEN;

/** Pinned scroll distance in viewport heights — roughly one scroll "page" per stage. */
export const PIN_VIEWPORTS = { desktop: 6.5, mobile: 6 };

/** Normalised progress at which each stage's transition has finished (its hold point). */
export const stageProgress = (i: number) => {
  if (i === 0) return 0;
  if (i === STAGES.length - 1) return 1;
  return (STAGES[i].start + MOVE + (1 - MOVE) * 0.5) / TIMELINE_LENGTH;
};

/** Hold points used for scroll snapping, so one scroll gesture settles on one stage. */
export const SNAP_POINTS = STAGES.map((_, i) => stageProgress(i));

export function buildTimeline(state: ExplodeState, mode: Mode, captions: HTMLElement[], progressEl?: HTMLElement | null) {
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
  const cam = CAMERA[mode];
  const camTo = (k: { x: number; y: number; z: number }, at: number, duration = MOVE, ease = 'power2.inOut') =>
    tl.to(state.cam, { x: k.x, y: k.y, z: k.z, duration, ease }, at);
  const groupOff = Object.fromEntries(GROUPS.map((g) => [g.id, 0]));

  SEQUENCE.forEach((stage, i) => {
    const s = i * STAGE_LEN;

    if (stage.id === 'original') {
      // a slow push-in and a single light sweep across the photographed aircraft
      camTo({ ...cam.original, z: cam.original.z * 1.03 }, s, STAGE_LEN, 'sine.inOut');
      tl.fromTo(state, { sweep: 0 }, { sweep: 1, duration: 0.8, ease: 'power1.inOut' }, s + 0.1);
      tl.to(state, { sweepA: 1, duration: 0.15 }, s + 0.1);
      tl.to(state, { sweepA: 0, duration: 0.15 }, s + 0.75);
      return;
    }

    if (stage.group && stage.layers.length) {
      const g = stage.group;
      const zoom = CLOSEUP[stage.id];
      if (zoom) {
        // frame the group as it detaches, then a close-up where it comes to rest
        camTo(cam[stage.id], s, MOVE * 0.55);
        const c = stageCentroid(stage.id, mode);
        const base = cam[stage.id];
        // close-up keeps some of the airframe in shot: blend towards the group's centre
        const mix = mode === 'mobile' ? 0.45 : 0.6;
        camTo({ x: base.x + (c.x - base.x) * mix, y: base.y + (c.y - base.y) * mix, z: base.z * zoom }, s + MOVE * 0.55, 0.38, 'power2.inOut');
      } else {
        camTo(cam[stage.id], s);
      }
      // identify the group, then detach its layers one after another
      tl.to(state.hl, { [g]: 1, duration: 0.12, ease: 'power1.out' }, s);
      tl.to(state.lab, { [g]: 1, duration: 0.15 }, s + 0.05);
      const n = stage.layers.length;
      const each = stage.id === 'ironav' ? 0.3 : Math.min(0.42, MOVE / Math.max(1, n * 0.6));
      const gap = n > 1 ? (MOVE - each) / (n - 1) : 0;
      stage.layers.forEach((id, k) => {
        tl.to(state.p, { [id]: 1, duration: each, ease: 'power3.inOut' }, s + 0.04 + k * gap);
      });
      tl.to(state.hl, { [g]: 0, duration: 0.2, ease: 'power1.in' }, s + MOVE);

      if (stage.id === 'ironav') {
        // the module comes forward to the camera; everything else recedes out of focus
        tl.to(state, { focus: 1, dim: 1, duration: 0.4, ease: 'power2.inOut' }, s + 0.3);
        tl.to(state, { notes: 1, duration: 0.12 }, s + 0.68);
      }
      tl.to(state.lab, { [g]: 0, duration: 0.12 }, s + STAGE_LEN - 0.12);
      return;
    }

    if (stage.id === 'exploded') {
      // the module settles back into the layout; every component is labelled
      tl.to(state, { notes: 0, duration: 0.1 }, s);
      tl.to(state, { focus: 0, dim: 0, duration: 0.45, ease: 'power2.inOut' }, s + 0.05);
      camTo(cam.exploded, s + 0.05, 0.55);
      const show = mode === 'mobile' ? { ironav: 1 } : Object.fromEntries(GROUPS.map((g) => [g.id, 1]));
      tl.to(state.lab, { ...show, duration: 0.2 }, s + 0.45);
      tl.to(state.lab, { ...groupOff, duration: 0.1 }, s + STAGE_LEN - 0.1);
      return;
    }

    if (stage.id === 'reassemble') {
      // components return in reverse order to their exact original coordinates
      const back = [...SEQUENCE].reverse().filter((x) => x.layers.length);
      const span = MOVE + 0.1;
      back.forEach((st, k) => {
        tl.to(state.p, { ...Object.fromEntries(st.layers.map((id) => [id, 0])), duration: 0.24, ease: 'power3.inOut' }, s + 0.02 + (k * (span - 0.24)) / (back.length - 1));
      });
      camTo(cam.original, s + 0.05, span);
    }
  });

  // editorial captions — one per stage
  captions.forEach((el, i) => {
    const st = STAGES[i];
    if (!el || !st) return;
    if (i === 0) gsap.set(el, { autoAlpha: 1, y: 0 });
    else tl.fromTo(el, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.14, ease: 'power2.out' }, st.start + 0.04);
    if (i < STAGES.length - 1) tl.to(el, { autoAlpha: 0, y: -20, duration: 0.12, ease: 'power2.in' }, st.end - 0.12);
  });

  if (progressEl) tl.fromTo(progressEl, { scaleX: 0 }, { scaleX: 1, duration: TIMELINE_LENGTH }, 0);
  tl.set({}, {}, TIMELINE_LENGTH);
  return tl;
}
