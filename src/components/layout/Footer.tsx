import { contact, links, portfolio } from '../../content/site';
import { BrandMark } from '../ui/Icons';

const ext = { target: '_blank', rel: 'noopener noreferrer' } as const;

export function Footer() {
  const nav = portfolio.items.filter((i) => i.domains.includes('navigation'));
  const platforms = portfolio.items.filter((i) => i.group === 'Platforms & defence systems');
  const autonomy = portfolio.items.filter((i) => i.group === 'Autonomy');
  return (
    <footer className="footer">
      <div className="wrap">
        <div className="footer__top">
          <div className="footer__brand">
            <a href="#top" className="brand" aria-label="Back to top">
              <BrandMark />
              <span>
                <span className="brand__name">GLOBAZ</span>
                <span className="brand__sub">TECHNOLOGIES</span>
              </span>
            </a>
            <p>{contact.offices.join(' · ')}</p>
            <p>
              <a href={`mailto:${links.email}`}>{links.email}</a>
            </p>
          </div>
          <div>
            <h4>Navigation & connectivity</h4>
            <ul>
              {nav.map((i) => (
                <li key={i.name}>
                  <a href={i.href} {...(i.href.startsWith('http') ? ext : {})}>
                    {i.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Platforms & defence</h4>
            <ul>
              {platforms.map((i) => (
                <li key={i.name}>
                  <a href={i.href} {...ext}>
                    {i.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Autonomy</h4>
            <ul>
              {autonomy.map((i) => (
                <li key={i.name}>
                  <a href={i.href} {...ext}>
                    {i.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li>
                <a href={links.about} {...ext}>
                  About Globaz
                </a>
              </li>
              <li>
                <a href={links.news} {...ext}>
                  News & Media
                </a>
              </li>
              <li>
                <a href={links.careers} {...ext}>
                  Careers
                </a>
              </li>
              <li>
                <a href={links.contact} {...ext}>
                  Contact
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="footer__bottom">
          <span>© {new Date().getFullYear()} Globaz Technologies. IroNav is developed by infiniDome. 3D visualisation is conceptual.</span>
          <nav aria-label="Footer">
            <a href={links.allProducts} {...ext}>
              All systems
            </a>
            <a href="#contact">Discuss a requirement</a>
            <a href="#top">Back to top ↑</a>
          </nav>
        </div>
      </div>
    </footer>
  );
}
