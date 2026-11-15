import gsap from 'gsap';
import { GROUPS } from './config';
import type { ExplodeState } from './state';

/**
 * Scroll choreography (abstract timeline units; ScrollTrigger maps the whole
 * timeline onto the pinned scroll distance).
 */
export const STAGES = [
  { id: 'original', label: 'Original product', start: 0, end: 1.2 },
  { id: 'highlight', label: 'Components', start: 1.2, end: 3.8 },
  { id: 'separate', label: 'Separation', start: 3.8, end: 6.2 },
  { id: 'ironav', label: 'IroNav', start: 6.2, end: 8.4 },
  { id: 'reassemble', label: 'Reassembly', start: 8.4, end: 10.8 },
] as const;

export const TIMELINE_LENGTH = STAGES[STAGES.length - 1].end;

/** Pinned scroll distance in viewport heights. */
export const PIN_VIEWPORTS = { desktop: 5.2, mobile: 4.4 };

export function buildTimeline(state: ExplodeState, captions: HTMLElement[], hudFill?: HTMLElement | null) {
  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });
  const ease = 'power2.inOut';

  // 02 — highlight each visible component group in turn
  const h = STAGES[1].start;
  GROUPS.forEach((g, i) => {
    const at = h + 0.15 + i * 0.26;
    tl.to(state.hl, { [g.id]: 1, duration: 0.28, ease: 'power1.out' }, at);
    tl.to(state.hl, { [g.id]: 0.2, duration: 0.28, ease: 'power1.in' }, at + 0.4);
  });
  // after the last group has settled, clear every outline
  tl.to(state.hl, { propellers: 0, motors: 0, arms: 0, frame: 0, gear: 0, electronics: 0, cables: 0, ironav: 0, duration: 0.25 }, STAGES[1].end + 0.02);

  // 03 — separation along each component's axis
  const s = STAGES[2].start;
  tl.to(state, { sep: 1, duration: 1.8, ease: 'power1.inOut' }, s + 0.1);
  tl.to(state, { labels: 1, duration: 0.3 }, s + 1.7);

  // 04 — IroNav module comes forward, others recede
  const m = STAGES[3].start;
  tl.to(state, { labels: 0, duration: 0.25 }, m);
  tl.to(state, { focus: 1, dim: 1, duration: 1.0, ease }, m + 0.1);
  tl.to(state, { notes: 1, duration: 0.3 }, m + 1.05);

  // 05 — reassembly: module returns, every layer back to its exact origin
  const r = STAGES[4].start;
  tl.to(state, { notes: 0, duration: 0.25 }, r);
  tl.to(state, { focus: 0, duration: 0.8, ease }, r + 0.15);
  tl.to(state, { dim: 0, duration: 0.8, ease }, r + 0.5);
  tl.to(state, { sep: 0, duration: 1.3, ease: 'power2.inOut' }, r + 0.7);

  // captions
  captions.forEach((el, i) => {
    const st = STAGES[i];
    if (!el || !st) return;
    if (i === 0) gsap.set(el, { autoAlpha: 1, y: 0 });
    else tl.fromTo(el, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.35, ease: 'power2.out' }, st.start + 0.1);
    if (i < STAGES.length - 1) tl.to(el, { autoAlpha: 0, y: -20, duration: 0.3, ease: 'power2.in' }, st.end - 0.3);
  });

  if (hudFill) tl.fromTo(hudFill, { scaleY: 0 }, { scaleY: 1, duration: TIMELINE_LENGTH }, 0);
  tl.set({}, {}, TIMELINE_LENGTH);
  return tl;
}

/** Normalised progress at which a stage is fully presented. */
export const stageProgress = (i: number) => {
  const st = STAGES[i];
  const at = i === 0 ? 0.6 : i === STAGES.length - 1 ? TIMELINE_LENGTH : st.start + (st.end - st.start) * 0.75;
  return at / TIMELINE_LENGTH;
};
