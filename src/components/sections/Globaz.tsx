import { GLOBAZ } from '../../content/ironav';

/** 01 — Globaz Technologies: the company behind the presentation. */
export function Globaz() {
  return (
    <section className="gz" id="globaz" aria-labelledby="gz-h">
      <div className="wrap gz__grid">
        <div className="gz__text">
          <div className="chapter reveal">
            <span className="chapter__n">{GLOBAZ.index}</span>
            <span className="label">{GLOBAZ.label}</span>
          </div>
          <h2 id="gz-h" className="h-section reveal">
            {GLOBAZ.headline}
          </h2>
          <div className="gz__body reveal">
            {GLOBAZ.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
          <dl className="gz__creds reveal">
            {GLOBAZ.credentials.map((c) => (
              <div key={c.k}>
                <dt>{c.v}</dt>
                <dd>{c.k}</dd>
              </div>
            ))}
          </dl>
        </div>
        <figure className="gz__figure reveal">
          <img src="/media/brand/globaz-facility.webp" alt="Globaz Technologies building" width={900} height={880} loading="lazy" decoding="async" />
          <figcaption className="label">{GLOBAZ.facilityCaption}</figcaption>
        </figure>
      </div>
      <div className="wrap gz__vertical reveal">
        <span className="label">{GLOBAZ.vertical.title}</span>
        <ul>
          {GLOBAZ.vertical.items.map((it) => (
            <li key={it} className={it === 'IroNav' ? 'is-current' : ''}>
              {it}
            </li>
          ))}
        </ul>
        <p>{GLOBAZ.partnership}</p>
      </div>
    </section>
  );
}
