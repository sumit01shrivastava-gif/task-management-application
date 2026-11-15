import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import gsap from 'gsap';
import { hero, ironav } from '../../content/site';
import { Arrow } from '../ui/Icons';
import { heroRig } from '../../three/rig/rig';
import { useInView, usePrefersReducedMotion, useQualityTier } from '../../hooks/useQualityTier';
import { webglAvailable } from '../../three/webgl';
import { useMediaQuery } from '../../hooks/useMediaQuery';

const ExperienceCanvas = lazy(() => import('../../three/ExperienceCanvas'));

/** Client photograph slot. When present it is used as the hero visual. */
export const PRODUCT_PHOTO = '/media/IMG_5771.png';
/** Pre-rendered still of the conceptual 3D model (no-WebGL fallback & supporting imagery). */
export const RENDER_STILL = '/media/render-assembled.png';

function useImage(src: string) {
  const [state, setState] = useState<'loading' | 'ok' | 'missing'>('loading');
  useEffect(() => {
    const img = new Image();
    img.onload = () => setState(img.naturalWidth > 0 ? 'ok' : 'missing');
    img.onerror = () => setState('missing');
    img.src = src;
  }, [src]);
  return state;
}

function HeroVisual() {
  const photo = useImage(PRODUCT_PHOTO);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, '0px');
  const tier = useQualityTier();
  const reduced = usePrefersReducedMotion();
  const narrow = useMediaQuery('(max-width: 860px)');
  const rig = useMemo(() => heroRig(), []);
  const [gl] = useState(() => webglAvailable());

  useEffect(() => {
    if (reduced) return;
    const t = gsap.to(rig, { yaw: rig.yaw + 0.55, duration: 9, ease: 'sine.inOut', yoyo: true, repeat: -1 });
    return () => {
      t.kill();
    };
  }, [rig, reduced]);

  return (
    <div className="hero__visual" ref={ref}>
      <div className="grid-bg" />
      <div className="hero__glow" />
      {photo === 'ok' && <img className="hero__image" src={PRODUCT_PHOTO} alt="Multirotor uncrewed aircraft with an integrated IroNav module" />}
      {photo === 'missing' &&
        (gl ? (
          <div className="hero__canvas">
            <Suspense fallback={null}>
              <ExperienceCanvas rig={rig} tier={tier === 'high' ? 'medium' : tier} active={inView} still={reduced} annotations={false} offsetX={narrow ? 0 : -0.25} offsetY={narrow ? 0.02 : 0.02} fov={narrow ? 36 : 33} />
            </Suspense>
          </div>
        ) : (
          <img className="hero__image" src={RENDER_STILL} alt="Conceptual render of the IroNav-integrated multirotor aircraft" />
        ))}
    </div>
  );
}

export function HeroSection() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <HeroVisual />
      <div className="hero__tag" aria-hidden>
        {ironav.platformLabel}
        <br />
        Conceptual 3D model
      </div>
      <div className="wrap hero__content">
        <span className="kicker">{hero.kicker}</span>
        <h1 id="hero-title" className="display">
          {hero.headline.map((l) => (
            <span className="line" key={l}>
              <span>{l}</span>
            </span>
          ))}
        </h1>
        <p className="lead">{hero.body}</p>
        <div className="hero__actions">
          <a className="btn btn--primary" href={hero.primary.href}>
            {hero.primary.label} <Arrow />
          </a>
          <a className="btn" href={hero.secondary.href}>
            {hero.secondary.label} <Arrow />
          </a>
        </div>
      </div>
      <div className="hero__facts">
        <div className="wrap">
          {hero.facts.map((f) => (
            <div key={f.k}>
              <div className="fact__k">{f.k}</div>
              <div className="fact__v">{f.v}</div>
            </div>
          ))}
          <a className="scroll-cue" href="#experience" aria-label="Scroll to the IroNav experience">
            <i /> Scroll
          </a>
        </div>
      </div>
    </section>
  );
}
