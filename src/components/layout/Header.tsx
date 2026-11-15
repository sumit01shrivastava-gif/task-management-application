import { useEffect, useState } from 'react';
import { nav } from '../../content/site';
import { Arrow, BrandMark } from '../ui/Icons';

export const FILTER_EVENT = 'globaz:portfolio-filter';

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 24);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [open]);

  const onNav = (item: (typeof nav)[number]) => {
    setOpen(false);
    if ('filter' in item && item.filter) window.dispatchEvent(new CustomEvent(FILTER_EVENT, { detail: item.filter }));
    else if (item.href === '#systems') window.dispatchEvent(new CustomEvent(FILTER_EVENT, { detail: 'all' }));
  };

  const links = nav.map((item) => (
    <a
      key={item.label}
      href={item.href}
      onClick={() => onNav(item)}
      {...('external' in item && item.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
    >
      {item.label}
    </a>
  ));

  return (
    <>
      <header className={`header ${scrolled || open ? 'is-scrolled' : ''}`}>
        <div className="wrap header__inner">
          <a href="#top" className="brand" aria-label="Globaz Technologies — home">
            <BrandMark />
            <span>
              <span className="brand__name">GLOBAZ</span>
              <span className="brand__sub">TECHNOLOGIES</span>
            </span>
          </a>
          <nav className="nav" aria-label="Main navigation">
            {links}
          </nav>
          <div className="header__cta">
            <a className="btn btn--sm" href="#contact">
              Discuss a Requirement <Arrow size={12} />
            </a>
            <button className="menu-btn" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen((v) => !v)}>
              <span />
              <span />
            </button>
          </div>
        </div>
      </header>
      <nav id="mobile-nav" className={`mobile-nav ${open ? 'is-open' : ''}`} aria-label="Mobile navigation" aria-hidden={!open}>
        {links}
        <a className="btn btn--primary" href="#contact" onClick={() => setOpen(false)}>
          Discuss a Requirement <Arrow size={12} />
        </a>
      </nav>
    </>
  );
}
