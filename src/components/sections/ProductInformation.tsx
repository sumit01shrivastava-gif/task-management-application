import { useState } from 'react';
import { hero, productInfo } from '../../content/site';
import { External, PillarIcon } from '../ui/Icons';

const VIEWS = [
  { id: 'aircraft', label: 'Aircraft', src: '/media/ironav-original.png', alt: 'Multirotor aircraft with integrated IroNav module (original photograph)', caption: 'Original product photograph' },
  { id: 'module', label: 'IroNav module', src: '/media/ironav-layers/ironav-module.webp', alt: 'IroNav module, isolated from the original photograph', caption: 'Module layer from the original photograph' },
];

/** Section 03 — Understanding IroNav. */
export function ProductInformation() {
  const views = VIEWS;
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
              <span>{current.caption}</span>
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
