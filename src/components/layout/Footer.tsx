import { ENQUIRY, LINKS } from '../../content/ironav';
import { Brand } from '../ui/Icons';

export function Footer() {
  return (
    <footer className="foot">
      <div className="wrap foot__grid">
        <Brand />
        <p>
          IroNav is developed by infiniDome. Globaz Technologies handles integration enquiries, platform evaluation and support discussions in India.
        </p>
        <p className="foot__meta">
          {ENQUIRY.offices}
          <br />
          <a href={`mailto:${LINKS.email}`}>{LINKS.email}</a>
        </p>
      </div>
      <div className="wrap foot__base">
        <span>© {new Date().getFullYear()} Globaz Technologies</span>
        <span>All product imagery: the original IroNav-integrated aircraft photograph.</span>
        <a href="#top">Back to top ↑</a>
      </div>
    </footer>
  );
}
