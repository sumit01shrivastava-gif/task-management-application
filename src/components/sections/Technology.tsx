import { TECH, LINKS } from '../../content/ironav';
import { AircraftDiagram, GnssDiagram, VisualNavDiagram } from '../ui/Diagrams';
import { External } from '../ui/Icons';

const DIAGRAMS = { visual: VisualNavDiagram, gnss: GnssDiagram, uas: AircraftDiagram } as const;

/** 05 — Technology: sticky editorial headline, three illustrated principles. */
export function Technology() {
  return (
    <section className="tech" id="technology" aria-labelledby="tech-h">
      <div className="wrap tech__grid">
        <div className="tech__aside">
          <div className="tech__sticky">
            <div className="chapter reveal">
              <span className="chapter__n">{TECH.index}</span>
              <span className="label">{TECH.label}</span>
            </div>
            <h2 id="tech-h" className="h2 tech__h reveal">
              {TECH.headline.map((l) => (
                <span key={l}>{l}</span>
              ))}
            </h2>
            <p className="lede reveal">{TECH.intro}</p>
            <a className="link reveal" href={LINKS.infinidome} target="_blank" rel="noopener noreferrer">
              infiniDome’s published overview <External />
            </a>
          </div>
        </div>
        <div className="tech__list">
          {TECH.pillars.map((p) => {
            const D = DIAGRAMS[p.id as keyof typeof DIAGRAMS];
            return (
              <article className="pillar reveal" key={p.id}>
                <div className="pillar__visual">
                  <D />
                </div>
                <div className="pillar__text">
                  <span className="pillar__n">{p.n}</span>
                  <h3 className="h3">{p.title}</h3>
                  <p>{p.body}</p>
                </div>
              </article>
            );
          })}
          <p className="tech__foot label">{TECH.footnote}</p>
        </div>
      </div>
    </section>
  );
}
