import { hero, ironav } from '../../content/site';
import { Arrow } from '../ui/Icons';

/** The original product photograph (transparent background), used unmodified. */
export const PRODUCT_PHOTO = '/media/ironav-original.png';

export function HeroSection() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero__visual">
        <div className="grid-bg" />
        <div className="hero__glow" />
        <img className="hero__image" src={PRODUCT_PHOTO} width={1161} height={558} alt="Multirotor uncrewed aircraft with an integrated IroNav module" fetchPriority="high" />
      </div>
      <div className="hero__tag" aria-hidden>
        {ironav.platformLabel}
        <br />
        Original product photograph
      </div>
      <div className="wrap hero__content">
        <span className="kicker">{hero.kicker}</span>
        <h1 id="hero-title" className="display">
          {hero.headline.map((l) => (
            <span className="line" key={l}>
              <span>{l}</span>
            </span>
          ))}
        </h1>
        <p className="lead">{hero.body}</p>
        <div className="hero__actions">
          <a className="btn btn--primary" href={hero.primary.href}>
            {hero.primary.label} <Arrow />
          </a>
          <a className="btn" href={hero.secondary.href}>
            {hero.secondary.label} <Arrow />
          </a>
        </div>
      </div>
      <div className="hero__facts">
        <div className="wrap">
          {hero.facts.map((f) => (
            <div key={f.k}>
              <div className="fact__k">{f.k}</div>
              <div className="fact__v">{f.v}</div>
            </div>
          ))}
          <a className="scroll-cue" href="#experience" aria-label="Scroll to the IroNav experience">
            <i /> Scroll
          </a>
        </div>
      </div>
    </section>
  );
}
