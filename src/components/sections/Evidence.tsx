import { EVIDENCE } from '../../content/ironav';
import { Arrow, External } from '../ui/Icons';

/** 07 — Technical information & evidence, set like a specification sheet. */
export function Evidence() {
  return (
    <section className="evid" id="evidence" aria-labelledby="evid-h">
      <div className="wrap evid__grid">
        <header>
          <div className="chapter reveal">
            <span className="chapter__n">{EVIDENCE.index}</span>
            <span className="label">{EVIDENCE.label}</span>
          </div>
          <h2 id="evid-h" className="h2 reveal">
            {EVIDENCE.title}
          </h2>
          <p className="lede reveal">{EVIDENCE.intro}</p>
        </header>
        <ol className="sheet-list">
          {EVIDENCE.rows.map((r) => (
            <li key={r.n} className="reveal">
              <a href={r.href} {...(r.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                <span className="sheet-list__n">{r.n}</span>
                <span className="sheet-list__t">{r.title}</span>
                <span className="sheet-list__b">{r.body}</span>
                <span className="sheet-list__a">
                  {r.action} {r.external ? <External /> : <Arrow size={12} />}
                </span>
              </a>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
