import { useEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TopBar } from './components/layout/TopBar';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/sections/Hero';
import { Intro } from './components/sections/Intro';
import { Anatomy } from './components/sections/Anatomy';
import { Film } from './components/sections/Film';
import { Technology } from './components/sections/Technology';
import { Integration } from './components/sections/Integration';
import { Evidence } from './components/sections/Evidence';
import { Enquiry } from './components/sections/Enquiry';
import { useHashLinks, useReveal, useSmoothScroll } from './hooks/useSmoothScroll';
import { usePrefersReducedMotion } from './hooks/useMotion';

export default function App() {
  const reduced = usePrefersReducedMotion();
  const coarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  useSmoothScroll(!reduced && !coarse);
  useHashLinks();
  useReveal();

  useEffect(() => {
    const refresh = () => ScrollTrigger.refresh();
    document.fonts?.ready.then(refresh);
    window.addEventListener('load', refresh);
    return () => window.removeEventListener('load', refresh);
  }, []);

  return (
    <>
      <a className="skip" href="#main">
        Skip to content
      </a>
      <TopBar />
      <main id="main">
        <Hero />
        <Intro />
        <Anatomy />
        <Film />
        <Technology />
        <Integration />
        <Evidence />
        <Enquiry />
      </main>
      <Footer />
    </>
  );
}
