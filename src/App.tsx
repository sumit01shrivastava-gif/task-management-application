import { useEffect } from 'react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HeroSection } from './components/sections/HeroSection';
import { IroNavExperience } from './components/sections/IroNavExperience';
import { ProductInformation } from './components/sections/ProductInformation';
import { IntegrationSection } from './components/sections/IntegrationSection';
import { ProductPortfolio } from './components/sections/ProductPortfolio';
import { BrahmastraSection } from './components/sections/BrahmastraSection';
import { ContactSection } from './components/sections/ContactSection';
import { useHashLinks, useReveal, useSmoothScroll } from './hooks/useSmoothScroll';
import { usePrefersReducedMotion } from './hooks/useMotion';

export default function App() {
  const reduced = usePrefersReducedMotion();
  const coarse = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
  useSmoothScroll(!reduced && !coarse);
  useHashLinks();
  useReveal();

  useEffect(() => {
    // Recalculate pin positions once fonts and late images settle.
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
      <Header />
      <main id="main">
        <HeroSection />
        <IroNavExperience />
        <ProductInformation />
        <IntegrationSection />
        <ProductPortfolio />
        <BrahmastraSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
