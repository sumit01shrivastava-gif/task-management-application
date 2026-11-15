import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ANATOMY } from '../../content/ironav';
import { CAMERA, GROUPS, MODULE_NOTES, manifest, type Mode } from '../../exploded/config';
import { createState } from '../../exploded/state';
import { PhotoExplodeRenderer, type LabelPos } from '../../exploded/renderer';
import { buildTimeline, PIN_VIEWPORTS, STAGES, stageProgress, TIMELINE_LENGTH } from '../../exploded/timeline';
import { useInView, usePrefersReducedMotion } from '../../hooks/useMotion';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { scrollToTarget } from '../../hooks/useSmoothScroll';
import { Arrow } from '../ui/Icons';

gsap.registerPlugin(ScrollTrigger);

/**
 * 03 — Anatomy. Scroll-scrubbed exploded view of the ORIGINAL photograph,
 * filmed with a virtual camera. Layers: scripts/segment_layers.py.
 */
export function Anatomy() {
  const reduced = usePrefersReducedMotion();
  const narrow = useMediaQuery('(max-width: 860px)');
  const mode: Mode = narrow ? 'mobile' : 'desktop';
  const state = useMemo(() => createState(CAMERA[mode].original), [mode]);

  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const renderer = useRef<PhotoExplodeRenderer | null>(null);
  const captions = useRef<HTMLDivElement[]>([]);
  const groupEls = useRef<(HTMLDivElement | null)[]>([]);
  const noteEls = useRef<(HTMLDivElement | null)[]>([]);
  const progress = useRef<HTMLDivElement>(null);
  const readSep = useRef<HTMLSpanElement>(null);
  const readZoom = useRef<HTMLSpanElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const stRef = useRef<ScrollTrigger | null>(null);
  const [activeStage, setActiveStage] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const near = useInView(section, '150% 0px');
  const onScreen = useInView(section, '0px');

  useEffect(() => {
    if (!near || renderer.current || !canvas.current) return;
    const r = new PhotoExplodeRenderer(canvas.current);
    renderer.current = r;
    r.load().then(
      () => {
        setLoaded(true);
        // depth sprites only where they are used (desktop), after the essentials
        if (!window.matchMedia('(max-width: 860px)').matches) void r.loadEffects();
      },
      () => setFailed(true),
    );
  }, [near]);

  // read-only handle for automated verification (dev builds, or ?verify)
  useEffect(() => {
    if (import.meta.env.DEV || location.search.includes('verify')) (window as unknown as { __ironav: unknown }).__ironav = { state, renderer: renderer.current };
  }, [state, loaded]);

  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const fit = () => {
      const r = renderer.current;
      if (!r) return;
      r.resize(el.clientWidth, el.clientHeight, mode);
      r.draw(state);
    };
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    fit();
    return () => ro.disconnect();
  }, [mode, loaded, state]);

  useEffect(() => {
    if (!onScreen || !loaded) return;
    const place = (els: (HTMLDivElement | null)[], pos: LabelPos[], w: number) =>
      pos.forEach((p, i) => {
        const el = els[i];
        if (!el) return;
        const vis = p.a > 0.01;
        el.style.opacity = vis ? String(p.a) : '0';
        el.style.visibility = vis ? 'visible' : 'hidden';
        if (!vis) return;
        const cw = (el.firstElementChild as HTMLElement | null)?.offsetWidth ?? 0;
        const left = el.dataset.align === 'left';
        const x = left ? Math.max(p.x, cw + 26) : Math.min(p.x, w - cw - 26);
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`;
      });
    const tick = () => {
      const r = renderer.current;
      const el = stage.current;
      if (!r || !el) return;
      r.draw(state);
      place(groupEls.current, r.groupLabels, el.clientWidth);
      place(noteEls.current, r.noteLabels, el.clientWidth);
      el.style.setProperty('--vx', `${r.view.x.toFixed(1)}px`);
      el.style.setProperty('--vy', `${r.view.y.toFixed(1)}px`);
      el.style.setProperty('--vs', r.view.s.toFixed(3));
      if (readSep.current) readSep.current.textContent = `${Math.round(state.sep * 100)}%`;
      if (readZoom.current) readZoom.current.textContent = `${state.cam.z.toFixed(2)}×`;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [onScreen, loaded, state]);

  useLayoutEffect(() => {
    const el = section.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const tl = buildTimeline(state, mode, captions.current, progress.current);
      tlRef.current = tl;
      if (reduced) {
        tl.progress(0);
        return;
      }
      stRef.current = ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: () => `+=${window.innerHeight * PIN_VIEWPORTS[mode]}`,
        pin: true,
        scrub: mode === 'mobile' ? 0.6 : 1,
        animation: tl,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const t = self.progress * TIMELINE_LENGTH;
          let idx = 0;
          STAGES.forEach((s, i) => t >= s.start && (idx = i));
          setActiveStage((p) => (p === idx ? p : idx));
        },
      });
    }, el);
    return () => {
      stRef.current = null;
      tlRef.current = null;
      ctx.revert();
    };
  }, [state, reduced, mode]);

  const goToStage = (i: number) => {
    const tl = tlRef.current;
    if (!tl) return;
    if (reduced || !stRef.current) {
      tl.progress(stageProgress(i));
      setActiveStage(i);
      return;
    }
    const st = stRef.current;
    scrollToTarget(st.start + (st.end - st.start) * stageProgress(i));
  };

  const setCaption = (i: number) => (node: HTMLDivElement | null) => {
    if (node) captions.current[i] = node;
  };

  return (
    <section ref={section} id="anatomy" className={`anat ${reduced ? 'anat--reduced' : ''}`} aria-label="Anatomy: scroll-controlled exploded view of the original product photograph">
      <div className="anat__pin">
        <div className="anat__stage" ref={stage}>
          <div className="anat__floor" aria-hidden />
          <div className="anat__spot" aria-hidden />
          <canvas ref={canvas} className="anat__canvas" role="img" aria-label="The original photograph of the IroNav-integrated aircraft, separating into its visible components" />
          {!loaded && !failed && (
            <div className="anat__loading label">
              <i /> Loading photographic layers
            </div>
          )}
          {failed && <img className="anat__fallback" src="/media/ironav-original.png" alt="IroNav-integrated multirotor aircraft" />}

          <div className="anat__labels" aria-hidden>
            {GROUPS.map((g, i) => {
              const align = g.labelOffset[0] < 0 ? 'left' : 'right';
              return (
                <div key={g.id} className="callout-pos" data-align={align} ref={(el) => void (groupEls.current[i] = el)}>
                  <div className={`callout callout--${align}`}>
                    <b>{g.title}</b>
                    <span>{g.sub}</span>
                  </div>
                </div>
              );
            })}
            {MODULE_NOTES.map((n, i) => {
              const align = n.offset[0] < 0 ? 'left' : 'right';
              return (
                <div key={n.title} className="callout-pos" data-align={align} ref={(el) => void (noteEls.current[i] = el)}>
                  <div className={`callout callout--${align}`}>
                    <b>{n.title}</b>
                    <span>{n.sub}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <header className="anat__chapter">
          <span className="chapter__n">{ANATOMY.index}</span>
          <span className="label">{ANATOMY.label}</span>
        </header>

        <div className="anat__captions">
          {ANATOMY.stages.map((st, i) => (
            <div key={st.id} className={`cap ${st.id === 'ironav' ? 'cap--ironav' : ''}`} ref={setCaption(i)}>
              <span className="cap__n" aria-hidden>
                {String(i + 1).padStart(2, '0')}
              </span>
              <p className="label cap__k">{st.kicker}</p>
              <h2 className="cap__t">{st.title}</h2>
              <p className="cap__b">{st.body}</p>
              {st.id === 'ironav' && (
                <>
                  <p className="cap__dev">{ANATOMY.moduleLine}</p>
                  <a className="btn btn--amber" href="#technology">
                    Explore IroNav <Arrow />
                  </a>
                </>
              )}
              {st.id === 'reassemble' && (
                <a className="btn btn--light" href="#enquiry">
                  Discuss Platform Integration <Arrow />
                </a>
              )}
            </div>
          ))}
        </div>

        <nav className="anat__nav" aria-label="Anatomy stages">
          <ol>
            {STAGES.map((st, i) => (
              <li key={st.id}>
                <button className={i === activeStage ? 'is-active' : ''} onClick={() => goToStage(i)} aria-current={i === activeStage ? 'step' : undefined}>
                  <b>{String(i + 1).padStart(2, '0')}</b>
                  <span>{st.label}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <div className="anat__readout label" aria-hidden>
          <span>Source</span>
          <span>Original photograph</span>
          <span>Layers</span>
          <span>{manifest.layers.length}</span>
          <span>Separation</span>
          <span ref={readSep}>0%</span>
          <span>Camera</span>
          <span ref={readZoom}>1.00×</span>
        </div>

        <p className="anat__note label">{ANATOMY.note}</p>
        <div className="anat__progress" aria-hidden>
          <i ref={progress} />
        </div>
      </div>
    </section>
  );
}
