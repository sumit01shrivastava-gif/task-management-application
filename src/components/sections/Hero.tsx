import { HERO } from '../../content/ironav';

/** Hero: the IroNav-integrated platform as photographed, with the product statement. */
export function Hero() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-h">
      <div className="hero__atmos" aria-hidden />
      <div className="wrap hero__grid">
        <div className="hero__copy">
          <p className="hero__cat">{HERO.category}</p>
          <h1 id="hero-h" className="hero__h">
            {HERO.headline.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </h1>
          <p className="hero__sub">{HERO.sub}</p>
          <dl className="hero__attr">
            {HERO.attribution.map((a) => (
              <div key={a.k}>
                <dt>{a.k}</dt>
                <dd>{a.v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <figure className="hero__product">
          <picture>
            <source type="image/webp" srcSet="/media/derived/hero-800.webp 800w, /media/derived/hero-1161.webp 1161w" sizes="(max-width: 860px) 130vw, 58vw" />
            <img src="/media/ironav-original.png" width={1161} height={558} alt="Multirotor uncrewed aircraft with an integrated IroNav module" fetchPriority="high" decoding="async" />
          </picture>
          <figcaption className="label">{HERO.figure}</figcaption>
        </figure>
      </div>
      <a className="hero__cue label" href="#anatomy">
        Scroll <i aria-hidden />
      </a>
    </section>
  );
}
