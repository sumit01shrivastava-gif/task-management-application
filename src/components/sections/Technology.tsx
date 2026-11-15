import { TECH, LINKS } from '../../content/ironav';
import { AircraftDiagram } from '../ui/Diagrams';
import { LoopVideo } from '../ui/LoopVideo';
import { External } from '../ui/Icons';


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
            return (
              <article className={`pillar reveal ${p.video ? 'pillar--film' : ''}`} key={p.id}>
                {p.video ? (
                  <figure className="pillar__film">
                    <LoopVideo base="/media/footage/" name={p.video.desktop} mobileName={p.video.mobile} aspect="16 / 9" mobileAspect="3 / 4" label={p.video.label} />
                    <figcaption>
                      <span>{p.video.caption}</span>
                      <span className="pillar__credit">
                        Footage:{' '}
                        <a href={p.video.credit.href} target="_blank" rel="noopener noreferrer">
                          “{p.video.credit.title}”
                        </a>{' '}
                        by {p.video.credit.author},{' '}
                        <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noopener noreferrer">
                          CC BY 3.0
                        </a>
                        . Trimmed, reframed, graded and composited.
                      </span>
                    </figcaption>
                  </figure>
                ) : (
                  <div className="pillar__visual">
                    <AircraftDiagram />
                  </div>
                )}
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
