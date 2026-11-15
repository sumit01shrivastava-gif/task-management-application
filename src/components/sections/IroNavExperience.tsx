import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { experience, ironav } from '../../content/site';
import { GROUPS, MODULE_NOTES, manifest } from '../../exploded/config';
import { createState } from '../../exploded/state';
import { PhotoExplodeRenderer, type LabelPos } from '../../exploded/renderer';
import { buildTimeline, PIN_VIEWPORTS, STAGES, stageProgress, TIMELINE_LENGTH } from '../../exploded/timeline';
import { useInView, usePrefersReducedMotion } from '../../hooks/useMotion';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { scrollToTarget } from '../../hooks/useSmoothScroll';
import { Arrow } from '../ui/Icons';
import { ENQUIRY_EVENT } from './ContactSection';

gsap.registerPlugin(ScrollTrigger);

/**
 * Section 02 — scroll-controlled exploded view of the ORIGINAL photograph.
 * Each component is a layer cut from the photo (see scripts/segment_layers.py).
 */
export function IroNavExperience() {
  const reduced = usePrefersReducedMotion();
  const narrow = useMediaQuery('(max-width: 860px)');
  const state = useMemo(() => createState(), []);

  const section = useRef<HTMLElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const renderer = useRef<PhotoExplodeRenderer | null>(null);
  const captions = useRef<HTMLDivElement[]>([]);
  const groupEls = useRef<(HTMLDivElement | null)[]>([]);
  const noteEls = useRef<(HTMLDivElement | null)[]>([]);
  const fill = useRef<HTMLDivElement>(null);
  const readSep = useRef<HTMLSpanElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const stRef = useRef<ScrollTrigger | null>(null);
  const [activeStage, setActiveStage] = useState(0);
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  const near = useInView(section, '150% 0px');
  const onScreen = useInView(section, '0px');

  // Lazy-load the layers shortly before the section is reached.
  useEffect(() => {
    if (!near || renderer.current || !canvas.current) return;
    const r = new PhotoExplodeRenderer(canvas.current);
    renderer.current = r;
    if (import.meta.env.DEV) (window as unknown as { __ironav: unknown }).__ironav = { state, renderer: r };
    r.load().then(
      () => setLoaded(true),
      () => setFailed(true),
    );
  }, [near, state]);

  // Size the canvas to the stage.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const r = renderer.current;
      if (!r) return;
      r.resize(el.clientWidth, el.clientHeight, narrow ? 'mobile' : 'desktop');
      r.draw(state);
    });
    ro.observe(el);
    renderer.current?.resize(el.clientWidth, el.clientHeight, narrow ? 'mobile' : 'desktop');
    return () => ro.disconnect();
  }, [narrow, loaded, state]);

  // Render loop while on screen.
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
        const x = left ? Math.max(p.x, cw + 12) : Math.min(p.x, w - cw - 12);
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`;
      });
    const tick = () => {
      const r = renderer.current;
      if (!r) return;
      r.draw(state);
      const w = stage.current?.clientWidth ?? 0;
      place(groupEls.current, r.groupLabels, w);
      place(noteEls.current, r.noteLabels, w);
      if (readSep.current) readSep.current.textContent = `${Math.round(state.sep * 100)}%`;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [onScreen, loaded, state]);

  // Scroll-scrubbed master timeline.
  useLayoutEffect(() => {
    const el = section.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const tl = buildTimeline(state, captions.current, fill.current);
      tlRef.current = tl;
      if (reduced) {
        tl.progress(0);
        return;
      }
      stRef.current = ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: () => `+=${window.innerHeight * (narrow ? PIN_VIEWPORTS.mobile : PIN_VIEWPORTS.desktop)}`,
        pin: true,
        scrub: narrow ? 0.6 : 0.9,
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
  }, [state, reduced, narrow]);

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
  const s = experience.stages;

  return (
    <section ref={section} id="experience" className={`xp ${reduced ? 'xp--reduced' : ''}`} aria-label="Interactive IroNav exploded view of the product photograph">
      <div className="xp__pin">
        <div className="xp__canvas" ref={stage}>
          <canvas ref={canvas} className="xp__photo" role="img" aria-label="Original photograph of the IroNav-integrated multirotor, separating into its visible components" />
          {!loaded && !failed && (
            <div className="xp__fallback">
              <span className="xp__loader">
                <i /> Loading photograph layers
              </span>
            </div>
          )}
          {failed && (
            <div className="xp__fallback">
              <img src="/media/ironav-original.png" alt="IroNav-integrated multirotor aircraft" style={{ maxWidth: '72%' }} />
            </div>
          )}
        </div>
        <div className="xp__vignette" />

        <div className="xp__labels" aria-hidden>
          {GROUPS.map((g, i) => {
            const align = g.labelOffset[0] < 0 ? 'left' : 'right';
            return (
              <div key={g.id} className="annot-pos" data-align={align} ref={(el) => void (groupEls.current[i] = el)}>
                <div className={`annot annot--${align}`}>
                  <span className="annot__title">{g.title}</span>
                  <span className="annot__sub">{g.sub}</span>
                </div>
              </div>
            );
          })}
          {MODULE_NOTES.map((n, i) => {
            const align = n.offset[0] < 0 ? 'left' : 'right';
            return (
              <div key={n.title} className="annot-pos" data-align={align} ref={(el) => void (noteEls.current[i] = el)}>
                <div className={`annot annot--${align}`}>
                  <span className="annot__title">{n.title}</span>
                  <span className="annot__sub">{n.sub}</span>
                </div>
              </div>
            );
          })}
        </div>

        <div className="xp__frame" aria-hidden>
          <i className="xp__corner xp__corner--tl" />
          <i className="xp__corner xp__corner--tr" />
          <i className="xp__corner xp__corner--bl" />
          <i className="xp__corner xp__corner--br" />
          <div className="xp__meta">
            <span>
              <b>IroNav</b> / Integrated platform
            </span>
            <span>Stage {String(activeStage + 1).padStart(2, '0')} / 05</span>
            <span>{STAGES[activeStage].label}</span>
          </div>
          <div className="xp__note">{experience.modelNote}</div>
        </div>

        <div className="xp__captions">
          {s.map((st, i) => (
            <div key={st.id} className={`caption ${st.id === 'ironav' ? 'caption--ironav' : ''}`} ref={setCaption(i)}>
              <div className="caption__index">
                <b>{st.index}</b> {st.kicker}
              </div>
              {st.id === 'ironav' ? (
                <>
                  <h2>{ironav.name}</h2>
                  <p>{ironav.tagline}.</p>
                  <p className="caption__dev">{ironav.developer}</p>
                  <div className="caption__actions">
                    <a className="btn btn--blue" href="#ironav">
                      Explore IroNav <Arrow />
                    </a>
                  </div>
                </>
              ) : (
                <>
                  <h2>{st.title}</h2>
                  <p>{st.body}</p>
                  {st.id === 'reassemble' && (
                    <div className="caption__actions">
                      <a className="btn btn--primary" href="#contact" onClick={() => window.dispatchEvent(new CustomEvent(ENQUIRY_EVENT, { detail: 'briefing' }))}>
                        Request a Technical Briefing <Arrow />
                      </a>
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>

        <nav className="hud" aria-label="Experience stages">
          <div className="hud__rail">
            <div className="hud__fill" ref={fill} />
          </div>
          <ol className="hud__stages">
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

        <div className="hud__readout" aria-hidden>
          <span>Source</span>
          <span>Original photo</span>
          <span>Layers</span>
          <span>{manifest.layers.length}</span>
          <span>Separation</span>
          <span ref={readSep}>0%</span>
        </div>

        {reduced && (
          <div className="xp__steps" role="group" aria-label="Choose a view">
            {STAGES.map((st, i) => (
              <button key={st.id} className={`chip ${i === activeStage ? 'is-active' : ''}`} onClick={() => goToStage(i)}>
                {st.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
