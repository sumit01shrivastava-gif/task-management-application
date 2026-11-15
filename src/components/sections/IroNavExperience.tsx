import { lazy, Suspense, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { experience, ironav } from '../../content/site';
import { createRig } from '../../three/rig/rig';
import { buildExperienceTimeline, PIN_VIEWPORTS, STAGES, stageProgress, TIMELINE_LENGTH } from '../../three/config/timeline';
import { useInView, usePrefersReducedMotion, useQualityTier } from '../../hooks/useQualityTier';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { scrollToTarget } from '../../hooks/useSmoothScroll';
import { webglAvailable } from '../../three/webgl';
import { ANNOTATIONS } from '../../three/scene/annotationSpecs';
import { Arrow } from '../ui/Icons';
import { ENQUIRY_EVENT } from './ContactSection';
import { RENDER_STILL } from './HeroSection';

gsap.registerPlugin(ScrollTrigger);

const ExperienceCanvas = lazy(() => import('../../three/ExperienceCanvas'));

const STAGE_SHORT = ['Platform', 'Rotation', 'Exploded view', 'IroNav', 'Conceptual internals', 'Reassembly'];

/**
 * Section 02 — the pinned, scroll-scrubbed 3D drone disassembly.
 * Layout + captions live here; all 3D logic lives in `src/three`.
 */
export function IroNavExperience() {
  const reduced = usePrefersReducedMotion();
  const tier = useQualityTier();
  const narrow = useMediaQuery('(max-width: 860px)');
  const rig = useMemo(() => createRig(), []);
  const [gl] = useState(() => webglAvailable());

  const section = useRef<HTMLElement>(null);
  const captions = useRef<HTMLDivElement[]>([]);
  const fill = useRef<HTMLDivElement>(null);
  const readAz = useRef<HTMLSpanElement>(null);
  const readEl = useRef<HTMLSpanElement>(null);
  const readEx = useRef<HTMLSpanElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const stRef = useRef<ScrollTrigger | null>(null);
  const [activeStage, setActiveStage] = useState(0);
  const labels = useRef<(HTMLElement | null)[]>([]);

  // Lazy-mount the 3D canvas shortly before the section is reached.
  const near = useInView(section, '120% 0px');
  const onScreen = useInView(section, '0px');
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    if (near) setMounted(true);
  }, [near]);

  useLayoutEffect(() => {
    const el = section.current;
    if (!el) return;
    const ctx = gsap.context(() => {
      const tl = buildExperienceTimeline(rig, captions.current, fill.current);
      tlRef.current = tl;
      if (reduced) {
        tl.progress(stageProgress(0));
        return;
      }
      stRef.current = ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: () => `+=${window.innerHeight * (narrow ? PIN_VIEWPORTS.mobile : PIN_VIEWPORTS.desktop)}`,
        pin: true,
        pinSpacing: true,
        scrub: narrow ? 0.6 : 0.9,
        animation: tl,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          const t = self.progress * TIMELINE_LENGTH;
          let idx = 0;
          STAGES.forEach((s, i) => t >= s.start && (idx = i));
          setActiveStage((prev) => (prev === idx ? prev : idx));
        },
      });
    }, el);
    return () => {
      stRef.current = null;
      tlRef.current = null;
      ctx.revert();
    };
  }, [rig, reduced, narrow]);

  // Technical readout (reads rig values, no React renders).
  useEffect(() => {
    if (!onScreen) return;
    const tick = () => {
      const az = ((((rig.yaw * 180) / Math.PI) % 360) + 360) % 360;
      const el = (Math.atan2(rig.camY - rig.tgtY, Math.hypot(rig.camX - rig.tgtX, rig.camZ - rig.tgtZ)) * 180) / Math.PI;
      if (readAz.current) readAz.current.textContent = `${az.toFixed(0).padStart(3, '0')}°`;
      if (readEl.current) readEl.current.textContent = `${el.toFixed(0).padStart(2, '0')}°`;
      if (readEx.current) readEx.current.textContent = `${Math.round(rig.explode * 100)}%`;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [onScreen, rig]);

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
  const offsetX = narrow ? 0 : -0.13;
  const offsetY = narrow ? 0.16 : 0;

  return (
    <section ref={section} id="experience" className={`xp ${reduced ? 'xp--reduced' : ''}`} aria-label="Interactive IroNav platform experience">
      <div className="xp__pin">
        <div className="xp__canvas">
          {gl ? (
            mounted && (
              <Suspense
                fallback={
                  <div className="xp__fallback">
                    <span className="xp__loader">
                      <i /> Loading 3D model
                    </span>
                  </div>
                }
              >
                <ExperienceCanvas rig={rig} tier={tier} active={onScreen} still={reduced} offsetX={offsetX} offsetY={offsetY} fov={narrow ? 44 : 32} labels={labels} />
              </Suspense>
            )
          ) : (
            <div className="xp__fallback">
              <img src={RENDER_STILL} alt="Conceptual render of the IroNav-integrated multirotor aircraft" style={{ maxWidth: '70%' }} />
            </div>
          )}
        </div>
        <div className="xp__vignette" />

        <div className="xp__labels" aria-hidden>
          {ANNOTATIONS.map((a, i) => (
            <div key={i} className="annot-pos" ref={(el) => void (labels.current[i] = el)}>
              <div className={`annot annot--${a.align ?? 'right'}`}>
                <span className="annot__title">{a.title}</span>
                {a.sub && <span className="annot__sub">{a.sub}</span>}
              </div>
            </div>
          ))}
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
            <span>Stage {String(activeStage + 1).padStart(2, '0')} / 06</span>
            <span>{STAGE_SHORT[activeStage]}</span>
          </div>
          <div className="xp__note">{experience.modelNote}</div>
        </div>

        <div className="xp__captions">
          {/* 01 */}
          <div className="caption" ref={setCaption(0)}>
            <div className="caption__index">
              <b>{s[0].index}</b> {s[0].kicker}
            </div>
            <h2>{s[0].title}</h2>
            <p>{s[0].body}</p>
          </div>
          {/* 02 */}
          <div className="caption" ref={setCaption(1)}>
            <div className="caption__index">
              <b>{s[1].index}</b> {s[1].kicker}
            </div>
            <h2>{s[1].title}</h2>
            <p>{s[1].body}</p>
          </div>
          {/* 03 */}
          <div className="caption" ref={setCaption(2)}>
            <div className="caption__index">
              <b>{s[2].index}</b> {s[2].kicker}
            </div>
            <h2>{s[2].title}</h2>
            <p>{s[2].body}</p>
          </div>
          {/* 04 IroNav */}
          <div className="caption caption--ironav" ref={setCaption(3)}>
            <div className="caption__index">
              <b>{s[3].index}</b> {s[3].kicker}
            </div>
            <h2>{ironav.name}</h2>
            <p>{ironav.tagline}</p>
            <p className="caption__dev">{ironav.developer}</p>
            <div className="caption__actions">
              <a className="btn btn--blue" href="#ironav">
                Explore IroNav <Arrow />
              </a>
            </div>
          </div>
          {/* 05 Conceptual internals */}
          <div className="caption" ref={setCaption(4)}>
            <div className="caption__index">
              <b>{s[4].index}</b> {s[4].kicker}
            </div>
            <h2>{s[4].title}</h2>
            <p>{s[4].body}</p>
            <p className="caption__disclaimer" role="note">
              {experience.disclaimer}
            </p>
          </div>
          {/* 06 Reassembly */}
          <div className="caption" ref={setCaption(5)}>
            <div className="caption__index">
              <b>{s[5].index}</b> {s[5].kicker}
            </div>
            <h2>{s[5].title}</h2>
            <p>{s[5].body}</p>
            <div className="caption__actions">
              <a className="btn btn--primary" href="#contact" onClick={() => window.dispatchEvent(new CustomEvent(ENQUIRY_EVENT, { detail: 'briefing' }))}>
                Request a Technical Briefing <Arrow />
              </a>
            </div>
          </div>
        </div>

        <nav className="hud" aria-label="Experience stages">
          <div className="hud__rail">
            <div className="hud__fill" ref={fill} />
          </div>
          <ol className="hud__stages">
            {STAGE_SHORT.map((label, i) => (
              <li key={label}>
                <button className={i === activeStage ? 'is-active' : ''} onClick={() => goToStage(i)} aria-current={i === activeStage ? 'step' : undefined}>
                  <b>{String(i + 1).padStart(2, '0')}</b>
                  <span>{label}</span>
                </button>
              </li>
            ))}
          </ol>
        </nav>

        <div className="hud__readout" aria-hidden>
          <span>Azimuth</span>
          <span ref={readAz}>000°</span>
          <span>Elevation</span>
          <span ref={readEl}>00°</span>
          <span>Separation</span>
          <span ref={readEx}>0%</span>
        </div>

        {reduced && (
          <div className="xp__steps" role="group" aria-label="Choose a view">
            {STAGE_SHORT.map((label, i) => (
              <button key={label} className={`chip ${i === activeStage ? 'is-active' : ''}`} onClick={() => goToStage(i)}>
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
