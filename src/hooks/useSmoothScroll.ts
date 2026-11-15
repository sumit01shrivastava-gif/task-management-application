import { useEffect } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let lenis: Lenis | null = null;

/** Smooth scroll for wheel input, synced with GSAP ScrollTrigger. Touch stays native. */
export function useSmoothScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    lenis = new Lenis({ lerp: 0.09, smoothWheel: true, syncTouch: false, wheelMultiplier: 0.9 });
    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis?.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis?.destroy();
      lenis = null;
    };
  }, [enabled]);
}

/** Scroll to an element or absolute Y, honouring the fixed header. */
export function scrollToTarget(target: string | number, immediate = false) {
  const header = 0;
  if (typeof target === 'number') {
    if (lenis) lenis.scrollTo(target, { immediate, duration: 1.6 });
    else window.scrollTo({ top: target, behavior: immediate ? 'auto' : 'smooth' });
    return;
  }
  const el = document.querySelector(target) as HTMLElement | null;
  if (!el) return;
  const y = el.getBoundingClientRect().top + window.scrollY - header;
  if (lenis) lenis.scrollTo(y, { immediate, duration: 1.8 });
  else window.scrollTo({ top: y, behavior: immediate ? 'auto' : 'smooth' });
}

/** Intercepts in-page hash links so they use smooth scrolling. */
export function useHashLinks() {
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const a = (e.target as HTMLElement).closest('a[href^="#"]') as HTMLAnchorElement | null;
      if (!a) return;
      const hash = a.getAttribute('href')!;
      if (hash === '#' || hash.length < 2) return;
      if (!document.querySelector(hash)) return;
      e.preventDefault();
      scrollToTarget(hash);
      history.replaceState(null, '', hash);
    };
    document.addEventListener('click', onClick);
    return () => document.removeEventListener('click', onClick);
  }, []);
}

/** Adds `.is-in` to `.reveal` elements as they enter the viewport. */
export function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add('is-in');
            io.unobserve(e.target);
          }
        }),
      { rootMargin: '0px 0px -10% 0px', threshold: 0.05 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}
