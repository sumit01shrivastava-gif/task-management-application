import { useLayoutEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { LINKS, PRODUCT } from '../../content/ironav';
import { usePrefersReducedMotion } from '../../hooks/useMotion';
import { External } from '../ui/Icons';

gsap.registerPlugin(ScrollTrigger);

/**
 * 03 — The product. The IroNav module as photographed, with a restrained
 * scroll-linked 2.5D turn (an honest alternative to a 360° view, which would
 * need multi-angle photography or CAD), the key differentiators and the
 * specification sheet as published by Globaz Technologies.
 */
export function Product() {
  const reduced = usePrefersReducedMotion();
  const stage = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = stage.current;
    if (!el || reduced) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { '--ry': -14, '--rx': 6, '--sweep': -40 },
        { '--ry': 14, '--rx': -4, '--sweep': 140, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.6 } },
      );
    }, el);
    return () => ctx.revert();
  }, [reduced]);

  return (
    <section className="prod" id="product" aria-labelledby="prod-h">
      <div className="wrap prod__grid">
        <div className="prod__intro">
          <div className="chapter reveal">
            <span className="chapter__n">{PRODUCT.index}</span>
            <span className="label">{PRODUCT.label}</span>
          </div>
          <h2 id="prod-h" className="h-section reveal">
            {PRODUCT.headline}
          </h2>
          <ul className="prod__points reveal">
            {PRODUCT.points.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </div>
        <figure className="prod__view reveal">
          <div className="prod__stage" ref={stage}>
            <img src="/media/ironav-layers/ironav-module.webp" width={221} height={159} alt="IroNav module, from the original product photograph" loading="lazy" decoding="async" />
            <span className="prod__sweep" aria-hidden />
          </div>
          <figcaption className="label">{PRODUCT.viewNote}</figcaption>
        </figure>
      </div>

      <div className="spec">
        <div className="wrap spec__grid">
          <header>
            <span className="label">Technical specification</span>
            <h3 className="spec__h">IroNav</h3>
            <p>{PRODUCT.specSource}</p>
            <div className="spec__links">
              <a className="link" href={LINKS.productPage} target="_blank" rel="noopener noreferrer">
                Globaz product page <External />
              </a>
              <a className="link" href={LINKS.infinidome} target="_blank" rel="noopener noreferrer">
                infiniDome overview <External />
              </a>
            </div>
          </header>
          <dl className="spec__table">
            {PRODUCT.specs.map((s) => (
              <div key={s.k}>
                <dt>{s.k}</dt>
                <dd>{s.v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </section>
  );
}
