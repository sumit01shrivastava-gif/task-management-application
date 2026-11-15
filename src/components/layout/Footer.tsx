import { CLOSING, LINKS } from '../../content/ironav';

/** Closing statement and corporate attribution. */
export function Footer() {
  return (
    <footer className="foot">
      <div className="wrap">
        <p className="foot__statement reveal">{CLOSING.statement}</p>
        <div className="foot__grid">
          <img className="foot__logo" src="/media/brand/globaz-logo.png" width={247} height={47} alt="Globaz Technologies" loading="lazy" />
          {CLOSING.offices.map((o) => (
            <div key={o.k}>
              <span className="label">{o.k}</span>
              <p>{o.v}</p>
            </div>
          ))}
          <div>
            <span className="label">Web</span>
            <p>
              <a href={LINKS.globaz} target="_blank" rel="noopener noreferrer">
                globaztechnologies.com
              </a>
            </p>
          </div>
        </div>
        <div className="foot__base">
          <span>© {new Date().getFullYear()} Globaz Technologies Private Limited</span>
          <span>{CLOSING.footnote}</span>
        </div>
      </div>
    </footer>
  );
}
