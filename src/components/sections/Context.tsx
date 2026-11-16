import { useLayoutEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { CONTEXT } from '../../content/ironav';
import { usePrefersReducedMotion } from '../../hooks/useMotion';

gsap.registerPlugin(ScrollTrigger);

/** Flight track along the installation's service road (plate px, 1920×1080). */
const TRACK = 'M1720 1090 C 1560 930, 1420 760, 1300 640 S 1060 400, 960 280 S 890 160, 880 120';
/** Real visual features in the plate used as navigation references. */
const FEATURES: [number, number][] = [
  [1148, 622], [1200, 772], [1035, 438], [780, 615], [723, 232], [1418, 112], [1230, 225], [450, 385], [1500, 560], [640, 820],
];
const SATS: [number, number][] = [
  [380, -40], [1000, -60], [1640, -30],
];
const JAMMER: [number, number] = [1390, 300];

/**
 * 02 — Operational context. One aerial plate of a real installation; the three
 * published operating principles are drawn over it and scrubbed by scroll:
 * protected GNSS → GNSS denied → map-free visual navigation.
 */
export function Context() {
  const reduced = usePrefersReducedMotion();
  const section = useRef<HTMLElement>(null);
  const svg = useRef<SVGSVGElement>(null);
  const [active, setActive] = useState(0);

  useLayoutEffect(() => {
    const el = section.current;
    const root = svg.current;
    if (!el || !root) return;
    const track = root.querySelector<SVGPathElement>('.cx-track')!;
    const craft = root.querySelector<SVGGElement>('.cx-craft')!;
    const links = [...root.querySelectorAll<SVGLineElement>('.cx-link')];
    const foot = root.querySelector<SVGPolygonElement>('.cx-foot')!;
    const feats = [...root.querySelectorAll<SVGGElement>('.cx-feat')];
    const trail = root.querySelector<SVGPathElement>('.cx-trail')!;
    const len = track.getTotalLength();
    trail.style.strokeDasharray = `${len}`;
    const lift = root.querySelector<SVGGElement>('.cx-lift')!;
    const st = { t: 0, prot: 1, jam: 0, vis: 0 };

    const draw = () => {
      const p = track.getPointAtLength(len * (0.1 + st.t * 0.55));
      const q = track.getPointAtLength(Math.min(len, len * (0.1 + st.t * 0.55) + 30));
      const ang = (Math.atan2(q.y - p.y, q.x - p.x) * 180) / Math.PI + 90;
      craft.setAttribute('transform', `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)})`);
      // keep the (scaled) aircraft fully inside the frame near the top of the plate
      const ps = parseFloat(getComputedStyle(root).getPropertyValue('--plane-s')) || 1;
      lift.setAttribute('transform', `translate(0 ${(-Math.min(230, p.y - 96 * ps - 12)).toFixed(1)})`);
      trail.style.strokeDashoffset = `${len - len * (0.1 + st.t * 0.55)}`;
      links.forEach((l, i) => {
        l.setAttribute('x2', p.x.toFixed(1));
        l.setAttribute('y2', (p.y - 280).toFixed(1));
        l.style.opacity = String(Math.max(0.12, st.prot * (1 - st.jam * 0.85)) * (i === 1 ? 1 : 0.85));
        l.classList.toggle('is-cut', st.jam > 0.5);
      });
      // camera footprint: a perspective trapezoid on the ground ahead of the craft
      const w = 230, d = 330;
      const a = (ang * Math.PI) / 180;
      const fx = Math.sin(a), fy = -Math.cos(a), rx = Math.cos(a), ry = Math.sin(a);
      const pts = [
        [p.x + rx * 40, p.y + ry * 40], [p.x - rx * 40, p.y - ry * 40],
        [p.x - rx * w + fx * d, p.y - ry * w + fy * d], [p.x + rx * w + fx * d, p.y + ry * w + fy * d],
      ];
      foot.setAttribute('points', pts.map((v) => v.map((n) => n.toFixed(1)).join(',')).join(' '));
      foot.style.opacity = String(st.vis * 0.9);
      feats.forEach((g, i) => {
        const [x, y] = FEATURES[i];
        const dist = Math.hypot(x - (p.x + fx * d * 0.5), y - (p.y + fy * d * 0.5));
        g.style.opacity = String(st.vis * Math.max(0, Math.min(1, (560 - dist) / 180)));
      });
      root.style.setProperty('--prot', String(st.prot));
      root.style.setProperty('--jam', String(st.jam));
    };

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' }, onUpdate: draw });
      tl.to(st, { t: 1, duration: 3 }, 0);
      tl.to(st, { jam: 1, duration: 0.35, ease: 'power2.out' }, 0.95);
      tl.to(st, { prot: 0.15, duration: 0.35 }, 1.0);
      tl.to(st, { vis: 1, duration: 0.4, ease: 'power2.out' }, 1.95);
      draw();
      if (reduced) {
        tl.progress(0.85);
        setActive(2);
        return;
      }
      // native sticky pin (see .ctx / .ctx__sticky): scrub across the section's scroll length
      ScrollTrigger.create({
        trigger: el,
        start: 'top top',
        end: 'bottom bottom',
        scrub: 0.8,
        animation: tl,
        invalidateOnRefresh: true,
        // measured after the Architecture pin above it, which is rebuilt when the layout mode settles
        refreshPriority: -1,
        onUpdate: (self) => {
          const i = self.progress < 0.33 ? 0 : self.progress < 0.64 ? 1 : 2;
          setActive((v) => (v === i ? v : i));
        },
      });
    }, el);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={section} className={`ctx ${reduced ? 'ctx--still' : ''}`} id="context" aria-labelledby="ctx-h">
      <div className="ctx__sticky">
      <div className="ctx__media">
        <picture>
          <source media="(max-width: 860px)" srcSet="/media/derived/context-plate-960.webp" />
          <img src="/media/derived/context-plate.webp" alt="Aerial view of a fenced military storage installation" width={1920} height={1080} loading="lazy" decoding="async" />
        </picture>
        <svg ref={svg} className="ctx__svg" viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" aria-hidden>
          <defs>
            <radialGradient id="cx-jam">
              <stop offset="0" stopColor="#f2a93b" stopOpacity=".35" />
              <stop offset="1" stopColor="#f2a93b" stopOpacity="0" />
            </radialGradient>
          </defs>
          <path className="cx-track" d={TRACK} />
          <path className="cx-trail" d={TRACK} />
          {SATS.map(([x, y], i) => (
            <line key={i} className="cx-link" x1={x} y1={y} x2={x} y2={y} />
          ))}
          <g className="cx-jammer" transform={`translate(${JAMMER[0]} ${JAMMER[1]})`}>
            <circle r="420" fill="url(#cx-jam)" />
            {[90, 170, 250, 330].map((r) => (
              <circle key={r} className="cx-wave" r={r} />
            ))}
            <rect x="-9" y="-9" width="18" height="18" />
          </g>
          <polygon className="cx-foot" points="0,0 0,0 0,0 0,0" />
          {FEATURES.map(([x, y], i) => (
            <g key={i} className="cx-feat" transform={`translate(${x} ${y})`}>
              <rect x="-22" y="-22" width="44" height="44" />
              <path d="M-30 0h-14M30 0h14M0 -30v-14M0 30v14" />
            </g>
          ))}
          <g className="cx-craft">
            {/* ground position: soft shadow of the aircraft on the terrain */}
            <ellipse className="cx-shadow" rx="120" ry="34" />
            <line className="cx-alt" x1="0" y1="0" x2="0" y2="-150" />
            {/* the IroNav-integrated aircraft (original product photograph) at altitude */}
            <g className="cx-lift" transform="translate(0 -230)"><g className="cx-plane">
              <circle className="cx-null" r="190" />
              <circle className="cx-null cx-null--2" r="250" />
              <image href="/media/derived/hero-800.webp" x="-200" y="-96" width="400" height="192" />
            </g></g>
          </g>
        </svg>
        <div className="ctx__shade" />
      </div>

      <div className="ctx__panel wrap">
        <header>
          <div className="chapter">
            <span className="chapter__n">{CONTEXT.index}</span>
            <span className="label">{CONTEXT.label}</span>
          </div>
          <h2 id="ctx-h" className="h-section">
            {CONTEXT.headline}
          </h2>
          <p className="lede">{CONTEXT.intro}</p>
        </header>
        <ol className="ctx__states">
          {CONTEXT.states.map((s, i) => (
            <li key={s.id} className={i === active ? 'is-active' : ''}>
              <span className="label">{s.k}</span>
              <b>{s.title}</b>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
        <p className="ctx__note label">{CONTEXT.note}</p>
      </div>
      </div>
    </section>
  );
}
