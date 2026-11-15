import { useEffect, useState } from 'react';
import { NAV } from '../../content/ironav';
import { Arrow, Brand } from '../ui/Icons';

/** Minimal product bar: brand, chapter index (with active state), one action. */
export function TopBar() {
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string>('');

  useEffect(() => {
    const on = () => setSolid(window.scrollY > 40);
    on();
    window.addEventListener('scroll', on, { passive: true });
    return () => window.removeEventListener('scroll', on);
  }, []);

  useEffect(() => {
    const els = NAV.map((n) => document.getElementById(n.id)).filter(Boolean) as HTMLElement[];
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('menu-open', open);
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', esc);
    return () => window.removeEventListener('keydown', esc);
  }, [open]);

  return (
    <>
      <header className={`bar ${solid || open ? 'is-solid' : ''}`}>
        <a href="#top" className="bar__brand" aria-label="Globaz Technologies — IroNav, back to top">
          <Brand />
        </a>
        <nav className="bar__nav" aria-label="Chapters">
          <span className="bar__product">IroNav</span>
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} className={active === n.id ? 'is-active' : ''} aria-current={active === n.id ? 'location' : undefined}>
              <b>{n.n}</b>
              {n.label}
            </a>
          ))}
        </nav>
        <a className="bar__cta" href="#enquiry">
          Discuss integration <Arrow size={12} />
        </a>
        <button className="bar__menu" aria-label={open ? 'Close menu' : 'Open menu'} aria-expanded={open} aria-controls="sheet" onClick={() => setOpen((v) => !v)}>
          <span />
          <span />
        </button>
      </header>
      <div id="sheet" className={`sheet ${open ? 'is-open' : ''}`} aria-hidden={!open}>
        <nav aria-label="Chapters">
          {NAV.map((n) => (
            <a key={n.id} href={`#${n.id}`} onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
              <b>{n.n}</b>
              {n.label}
            </a>
          ))}
        </nav>
        <a className="btn btn--amber" href="#enquiry" onClick={() => setOpen(false)} tabIndex={open ? 0 : -1}>
          Discuss Platform Integration <Arrow />
        </a>
      </div>
    </>
  );
}
