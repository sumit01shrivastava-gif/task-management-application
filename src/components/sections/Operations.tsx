import { OPERATIONS } from '../../content/ironav';
import { LoopVideo } from '../ui/LoopVideo';

/** 05 — Operational applications: published use cases, then two full-bleed films. */
export function Operations() {
  return (
    <section className="ops" id="operations" aria-labelledby="ops-h">
      <div className="wrap ops__head">
        <div className="chapter reveal">
          <span className="chapter__n">{OPERATIONS.index}</span>
          <span className="label">{OPERATIONS.label}</span>
        </div>
        <h2 id="ops-h" className="h-section reveal">
          {OPERATIONS.headline}
        </h2>
        <ol className="ops__uses reveal">
          {OPERATIONS.uses.map((u, i) => (
            <li key={u.title}>
              <span className="ops__n">{String(i + 1).padStart(2, '0')}</span>
              <b>{u.title}</b>
              <p>{u.body}</p>
            </li>
          ))}
        </ol>
      </div>

      {OPERATIONS.films.map((f, i) => (
        <figure className={`wrap film ${i % 2 ? 'film--flip' : ''} reveal`} key={f.id}>
          <div className="film__frame">
            <LoopVideo base="/media/footage/" name={`${f.id}-desktop`} mobileName={`${f.id}-mobile`} aspect="16 / 9" mobileAspect="16 / 9" label={f.label} />
          </div>
          <figcaption className="film__cap">
            <div>
              <span className="label">{f.k}</span>
              <b>{f.title}</b>
            </div>
            <p>{f.body}</p>
            <p className="film__fine">
              {f.disclaimer} Footage:{' '}
              <a href={f.credit.href} target="_blank" rel="noopener noreferrer">
                “{f.credit.title}”
              </a>{' '}
              by {f.credit.author},{' '}
              <a href={f.credit.licenceHref} target="_blank" rel="noopener noreferrer">
                {f.credit.licence}
              </a>
              . {f.credit.changes}
            </p>
          </figcaption>
        </figure>
      ))}
    </section>
  );
}
