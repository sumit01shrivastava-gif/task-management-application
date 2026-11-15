import { integration, partners } from '../../content/site';
import { Arrow, IntegrationArt } from '../ui/Icons';
import { ENQUIRY_EVENT } from './ContactSection';

/** Section 04 — Platform integration. */
export function IntegrationSection() {
  return (
    <section className="section integration" id="integration" aria-labelledby="int-title">
      <div className="wrap">
        <div className="section-head reveal">
          <div>
            <span className="kicker">{integration.kicker}</span>
            <h2 id="int-title" className="h2">
              {integration.headline}
            </h2>
          </div>
          <div>
            <p className="lead">{integration.intro}</p>
            <a
              className="link-arrow"
              style={{ marginTop: 26 }}
              href="#contact"
              onClick={() => window.dispatchEvent(new CustomEvent(ENQUIRY_EVENT, { detail: 'integration' }))}
            >
              Discuss Platform Integration <Arrow />
            </a>
          </div>
        </div>

        <div className="int-cards">
          {integration.cards.map((c, i) => (
            <article className="int-card reveal" key={c.title} style={{ transitionDelay: `${i * 0.08}s` }}>
              <span className="int-card__index">{c.index}</span>
              <div className="int-card__art">
                <IntegrationArt icon={c.icon} />
              </div>
              <h3 className="h3">{c.title}</h3>
              <p className="body">{c.body}</p>
            </article>
          ))}
        </div>

        <div className="capabilities">
          {integration.capabilities.map((c) => (
            <div className="capability reveal" key={c.title}>
              <h4>{c.title}</h4>
              <p className="body">{c.body}</p>
            </div>
          ))}
        </div>

        <div className="partners reveal" aria-label="OEM partners">
          <span className="partners__label">OEM partners</span>
          {partners.map((p) => (
            <span className="partners__name" key={p}>
              {p}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
