import { HERO } from '../../content/ironav';
import { Arrow } from '../ui/Icons';

const PHOTO = '/media/ironav-original.png';
const TICKER = ['Visual navigation', 'GNSS interference protection', 'Uncrewed aircraft', 'Developed by infiniDome', 'India integration — Globaz Technologies'];

/** 01 — Cinematic hero: editorial type over the original photograph. */
export function Hero() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-h">
      <div className="hero__atmos" aria-hidden>
        <i className="hero__horizon" />
        <i className="hero__glow" />
      </div>

      <div className="hero__head">
        <p className="label hero__cat">{HERO.category}</p>
        <h1 id="hero-h" className="hero__h">
          {HERO.headline.map((l, i) => (
            <span className="hero__line" key={l} style={{ ['--i' as string]: i }}>
              <span>{l}</span>
            </span>
          ))}
        </h1>
      </div>

      <figure className="hero__product">
        <div className="hero__float">
          <img src={PHOTO} width={1161} height={558} alt="Multirotor uncrewed aircraft with an integrated IroNav module" fetchPriority="high" decoding="async" />
          <span className="hero__sheen" aria-hidden style={{ WebkitMaskImage: `url(${PHOTO})`, maskImage: `url(${PHOTO})` }} />
        </div>
        <figcaption className="label hero__figcap">
          <span>Fig. 01</span> IroNav-integrated multirotor — original photograph
        </figcaption>
      </figure>

      <div className="hero__foot">
        <div className="hero__copy">
          <p className="hero__sub">{HERO.sub}</p>
          <ul className="hero__ids">
            <li>
              <span className="label">Developer</span>
              {HERO.developer}
            </li>
            <li>
              <span className="label">India</span>
              {HERO.india}
            </li>
          </ul>
        </div>
        <div className="hero__ctas">
          <a className="btn btn--light" href="#overview">
            {HERO.primary} <Arrow />
          </a>
          <a className="btn btn--ghost" href="#enquiry">
            {HERO.secondary} <Arrow />
          </a>
        </div>
      </div>

      <div className="ticker" aria-hidden>
        <div className="ticker__track">
          {[...TICKER, ...TICKER, ...TICKER].map((t, i) => (
            <span key={i}>{t}</span>
          ))}
        </div>
      </div>
    </section>
  );
}
