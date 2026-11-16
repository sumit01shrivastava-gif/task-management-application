import { useEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TopBar } from './components/layout/TopBar';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/sections/Hero';
import { Globaz } from './components/sections/Globaz';
import { Context } from './components/sections/Context';
import { Product } from './components/sections/Product';
import { Anatomy } from './components/sections/Anatomy';
import { Operations } from './components/sections/Operations';
import { Integration } from './components/sections/Integration';
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
        <Anatomy />
        <Context />
        <Product />
        <Operations />
        <Integration />
        <Globaz />
      </main>
      <Footer />
    </>
  );
}
