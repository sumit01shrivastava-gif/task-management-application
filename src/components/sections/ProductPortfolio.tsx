import { useEffect, useState } from 'react';
import { links, portfolio, type Domain } from '../../content/site';
import { Arrow, External, SystemGlyph } from '../ui/Icons';
import { FILTER_EVENT } from '../layout/Header';

/** Section 05 — Explore other systems (interactive, filterable). */
export function ProductPortfolio() {
  const [filter, setFilter] = useState<'all' | Domain>('all');

  useEffect(() => {
    const on = (e: Event) => setFilter((e as CustomEvent).detail);
    window.addEventListener(FILTER_EVENT, on);
    return () => window.removeEventListener(FILTER_EVENT, on);
  }, []);

  return (
    <section className="section portfolio" id="systems" aria-labelledby="pf-title">
      <div className="wrap">
        <div className="section-head reveal">
          <div>
            <span className="kicker">{portfolio.kicker}</span>
            <h2 id="pf-title" className="h2">
              {portfolio.headline}
            </h2>
          </div>
          <p className="lead">{portfolio.intro}</p>
        </div>

        <div className="portfolio__filters" role="group" aria-label="Filter systems by domain">
          {portfolio.filters.map((f) => (
            <button key={f.id} className={`chip ${filter === f.id ? 'is-active' : ''}`} aria-pressed={filter === f.id} onClick={() => setFilter(f.id)}>
              {f.label}
            </button>
          ))}
        </div>

        <div className="portfolio__grid">
          {portfolio.items.map((item) => {
            const match = filter === 'all' || item.domains.includes(filter);
            const external = item.href.startsWith('http');
            return (
              <article key={item.name} className={`sys ${item.name === 'IroNav' ? 'sys--feature' : ''} ${match ? '' : 'is-dim'}`} aria-hidden={!match}>
                <span className="sys__group">{item.group}</span>
                <div className="sys__glyph">
                  <SystemGlyph glyph={item.glyph} />
                </div>
                <h3>{item.name}</h3>
                <p>{item.summary ?? 'Details and availability on the Globaz Technologies website.'}</p>
                {item.oem && <span className="sys__oem">OEM · {item.oem}</span>}
                <a className="sys__link" href={item.href} tabIndex={match ? 0 : -1} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                  {external ? 'View system' : 'Explore IroNav'} {external ? <External /> : <Arrow size={12} />}
                </a>
              </article>
            );
          })}
        </div>

        <div className="portfolio__all">
          <span className="body">Line glyphs are illustrative. Official imagery and details are on each system page.</span>
          <a className="link-arrow" href={links.allProducts} target="_blank" rel="noopener noreferrer">
            View the current catalogue <External />
          </a>
        </div>
      </div>
    </section>
  );
}
