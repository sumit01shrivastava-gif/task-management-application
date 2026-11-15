import { FILM } from '../../content/ironav';
import { LoopVideo } from '../ui/LoopVideo';

/**
 * Optional authorised film. Drop an approved clip at
 * public/media/film/ironav-film.{mp4,webm} with ironav-film-poster.jpg and set
 * this to 'ironav-film' to lead the reel with it. Until then the reel uses
 * motion studies built from the original photograph.
 */
const AUTHORISED_FILM: string | null = null;

/** 04 — Motion studies: an editorial reel of short loops. */
export function Film() {
  const [lead, ...rest] = FILM.clips;
  return (
    <section className="film" id="motion" aria-labelledby="film-h">
      <div className="wrap">
        <header className="film__head">
          <div className="chapter reveal">
            <span className="chapter__n">{FILM.index}</span>
            <span className="label">{FILM.label}</span>
          </div>
          <h2 id="film-h" className="h2 reveal">
            {FILM.title}
          </h2>
          <p className="lede reveal">{FILM.intro}</p>
        </header>

        <div className="reel">
          <figure className="reel__lead reveal">
            {AUTHORISED_FILM ? (
              <LoopVideo name={AUTHORISED_FILM} base="/media/film/" aspect="16 / 9" label="IroNav film" />
            ) : (
              <LoopVideo name={lead.id} aspect={lead.aspect} label={lead.caption} />
            )}
            <figcaption>
              <span className="label">Study {lead.n}</span>
              <b>{lead.title}</b>
              <span>{lead.caption}</span>
            </figcaption>
          </figure>
          {rest.map((c) => (
            <figure key={c.id} className="reel__side reveal">
              <LoopVideo name={c.id} aspect={c.aspect} label={c.caption} />
              <figcaption>
                <span className="label">Study {c.n}</span>
                <b>{c.title}</b>
                <span>{c.caption}</span>
              </figcaption>
            </figure>
          ))}
        </div>
        <p className="film__note label">{FILM.note}</p>
      </div>
    </section>
  );
}
