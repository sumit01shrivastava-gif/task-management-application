import { brahmastra, links } from '../../content/site';
import { Arrow, Emblem } from '../ui/Icons';

/**
 * Section 06 — Brahmastra (associated second business).
 * Visually distinct bronze treatment. Makes no product or capability claims:
 * populate `brahmastra.points` / `brahmastra.image` in content/site.ts with
 * approved brand material.
 */
export function BrahmastraSection() {
  const mail = `mailto:${links.email}?subject=${encodeURIComponent(brahmastra.cta.subject)}`;
  return (
    <section className="section brahmastra" id="brahmastra" aria-labelledby="bm-title">
      <Emblem />
      <div className="wrap brahmastra__layout">
        <div className="reveal">
          <span className="kicker">{brahmastra.kicker}</span>
          <h2 id="bm-title" className="brahmastra__word">
            {brahmastra.name}
          </h2>
        </div>
        <div className="brahmastra__panel reveal">
          {brahmastra.image && <img src={brahmastra.image} alt={`${brahmastra.name}`} style={{ marginBottom: 24 }} />}
          <p className="statement">{brahmastra.statement}</p>
          <p className="body">{brahmastra.body}</p>
          {brahmastra.points.length > 0 && (
            <ul>
              {brahmastra.points.map((p) => (
                <li key={p}>{p}</li>
              ))}
            </ul>
          )}
          <a className="btn btn--bronze" href={mail}>
            {brahmastra.cta.label} <Arrow />
          </a>
        </div>
      </div>
    </section>
  );
}
