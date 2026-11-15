import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../../hooks/useMotion';
import { useMediaQuery } from '../../hooks/useMediaQuery';

interface Props {
  name: string;
  /** CSS aspect-ratio, e.g. "16 / 9". */
  aspect: string;
  label: string;
  base?: string;
  className?: string;
  /** Optional dedicated portrait version for phones (≤ 860px). */
  mobileName?: string;
  mobileAspect?: string;
}

/**
 * Muted, inline, looping clip that only loads near the viewport and only
 * plays while visible. Falls back to its poster (reduced motion, errors,
 * or browsers that refuse autoplay).
 */
export function LoopVideo({ name: deskName, aspect: deskAspect, label, base = '/media/derived/clips/', className = '', mobileName, mobileAspect }: Props) {
  const narrow = useMediaQuery('(max-width: 860px)');
  const name = narrow && mobileName ? mobileName : deskName;
  const aspect = narrow && mobileName ? mobileAspect ?? deskAspect : deskAspect;
  const ref = useRef<HTMLVideoElement>(null);
  const wrap = useRef<HTMLDivElement>(null);
  const reduced = usePrefersReducedMotion();
  const [near, setNear] = useState(false);
  const [failed, setFailed] = useState(false);
  const poster = `${base}${name}-poster.webp`;

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) setNear(true);
        const v = ref.current;
        if (!v || reduced) return;
        if (e.isIntersecting && e.intersectionRatio > 0.15) v.play().catch(() => undefined);
        else v.pause();
      },
      { rootMargin: '300px 0px', threshold: [0, 0.15, 0.5] },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);

  return (
    <div ref={wrap} className={`loop ${className}`} style={{ aspectRatio: aspect }}>
      {failed || reduced ? (
        <img src={poster} alt={label} loading="lazy" />
      ) : (
        <video
          key={name}
          ref={ref}
          muted
          loop
          playsInline
          preload={near ? 'auto' : 'none'}
          poster={near ? poster : undefined}
          aria-label={label}
          onError={() => setFailed(true)}
          disablePictureInPicture
        >
          {near && <source src={`${base}${name}.mp4`} type="video/mp4" />}
          {near && <source src={`${base}${name}.webm`} type="video/webm" onError={() => setFailed(true)} />}
        </video>
      )}
    </div>
  );
}
