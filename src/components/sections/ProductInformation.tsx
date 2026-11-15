import { useEffect, useState } from 'react';
import { hero, productInfo } from '../../content/site';
import { External, PillarIcon } from '../ui/Icons';
import { PRODUCT_PHOTO } from './HeroSection';

const RENDERS = [
  { id: 'assembled', label: 'Assembled', src: '/media/render-assembled.png', alt: 'Conceptual render of the assembled IroNav-integrated multirotor' },
  { id: 'exploded', label: 'Exploded', src: '/media/render-exploded.png', alt: 'Conceptual exploded-view render of the multirotor assemblies' },
  { id: 'module', label: 'Module', src: '/media/render-module.png', alt: 'Conceptual render of the IroNav module exterior' },
];

/** Section 03 — Understanding IroNav. */
export function ProductInformation() {
  const [photo, setPhoto] = useState(false);
  useEffect(() => {
    const i = new Image();
    i.onload = () => setPhoto(true);
    i.src = PRODUCT_PHOTO;
  }, []);
  const views = photo ? [{ id: 'photo', label: 'Photo', src: PRODUCT_PHOTO, alt: 'Multirotor aircraft with integrated IroNav module' }, ...RENDERS] : RENDERS;
  const [view, setView] = useState(0);
  const current = views[Math.min(view, views.length - 1)];

  return (
    <section className="section info" id="ironav" aria-labelledby="info-title">
      <div className="wrap">
        <div className="section-head reveal">
          <div>
            <span className="kicker">{productInfo.kicker}</span>
            <h2 id="info-title" className="h2">
              {productInfo.headline}
            </h2>
          </div>
          <p className="lead">{productInfo.intro}</p>
        </div>

        <div className="info__layout">
          <figure className="info__media reveal" style={{ margin: 0 }}>
            <div className="grid-bg" />
            <div className="info__tabs" role="tablist" aria-label="Product imagery">
              {views.map((v, i) => (
                <button key={v.id} role="tab" aria-selected={current.id === v.id} className={`chip ${current.id === v.id ? 'is-active' : ''}`} onClick={() => setView(i)}>
                  {v.label}
                </button>
              ))}
            </div>
            {views.map((v) => (
              <img
                key={v.id}
                src={v.src}
                alt={v.alt}
                loading="lazy"
                style={{ opacity: current.id === v.id ? 1 : 0, transition: 'opacity .8s cubic-bezier(.22,1,.36,1)' }}
                aria-hidden={current.id !== v.id}
              />
            ))}
            <figcaption className="info__caption">
              <span>{current.id === 'photo' ? 'Product photograph' : 'Conceptual 3D render'}</span>
              <span>IroNav / infiniDome</span>
            </figcaption>
          </figure>

          <div>
            <div className="pillars">
              {productInfo.pillars.map((p) => (
                <article className="pillar reveal" key={p.id}>
                  <div className="pillar__icon">
                    <PillarIcon id={p.id} />
                  </div>
                  <div>
                    <h3 className="h3">{p.title}</h3>
                    <p className="body">{p.body}</p>
                  </div>
                </article>
              ))}
            </div>
            <div className="evidence reveal">
              <h3 className="h3">{productInfo.evidence.title}</h3>
              <p className="body">{productInfo.evidence.body}</p>
              <a className="link-arrow" href={productInfo.evidence.cta.href} target="_blank" rel="noopener noreferrer">
                {productInfo.evidence.cta.label} <External />
              </a>
            </div>
          </div>
        </div>

        <div className="proofline reveal">
          {hero.facts.map((f) => (
            <div key={f.k}>
              <div className="fact__k">{f.k}</div>
              <div className="fact__v" style={{ fontSize: 20, fontWeight: 540, letterSpacing: '-0.01em' }}>
                {f.v}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
