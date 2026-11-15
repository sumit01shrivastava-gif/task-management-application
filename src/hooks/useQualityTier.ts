import { useEffect, useState } from 'react';

export type QualityTier = 'high' | 'medium' | 'low';

/** Desktop → high, tablet → medium, phone / low-power → low. */
export function detectTier(): QualityTier {
  if (typeof window === 'undefined') return 'medium';
  const w = window.innerWidth;
  const coarse = window.matchMedia('(pointer: coarse)').matches;
  const cores = navigator.hardwareConcurrency || 4;
  const mem = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  if (w < 768 || mem <= 3 || cores <= 3) return 'low';
  if (coarse || w < 1200 || cores <= 6) return 'medium';
  return 'high';
}

export const tierSettings = {
  high: { dpr: [1, 2] as [number, number], segments: 1, shadows: true, annotations: true },
  medium: { dpr: [1, 1.5] as [number, number], segments: 0.7, shadows: true, annotations: true },
  low: { dpr: [1, 1.25] as [number, number], segments: 0.45, shadows: false, annotations: true },
};

export function useQualityTier() {
  const [tier, setTier] = useState<QualityTier>(() => detectTier());
  useEffect(() => {
    let t: number | undefined;
    const onResize = () => {
      window.clearTimeout(t);
      t = window.setTimeout(() => setTier(detectTier()), 300);
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      window.clearTimeout(t);
    };
  }, []);
  return tier;
}

export function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const on = () => setReduced(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return reduced;
}

export function useInView<T extends Element>(ref: React.RefObject<T | null>, rootMargin = '200px') {
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { rootMargin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, rootMargin]);
  return inView;
}
