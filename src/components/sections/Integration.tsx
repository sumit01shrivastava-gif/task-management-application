import { INTEGRATION } from '../../content/ironav';

/** 06 — Integration in India: a four-step programme path. */
export function Integration() {
  return (
    <section className="integ" id="integration" aria-labelledby="integ-h">
      <div className="wrap">
        <div className="chapter reveal">
          <span className="chapter__n">{INTEGRATION.index}</span>
          <span className="label">{INTEGRATION.label}</span>
        </div>
        <div className="integ__head">
          <h2 id="integ-h" className="h-section reveal">
            {INTEGRATION.headline}
          </h2>
          <p className="lede reveal">{INTEGRATION.intro}</p>
        </div>
        <ol className="integ__steps">
          {INTEGRATION.steps.map((s, i) => (
            <li key={s.n} className="reveal" style={{ transitionDelay: `${i * 0.08}s` }}>
              <span className="integ__n">{s.n}</span>
              <i aria-hidden />
              <b>{s.title}</b>
              <p>{s.body}</p>
            </li>
          ))}
        </ol>
        <div className="integ__foot reveal">
          <p>{INTEGRATION.procurement}</p>
          <p className="label">{INTEGRATION.caveat}</p>
        </div>
      </div>
    </section>
  );
}
