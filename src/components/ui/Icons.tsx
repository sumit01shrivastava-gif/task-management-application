import type { PortfolioItem } from '../../content/site';

export const Arrow = ({ size = 14 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M1 8h13M9 3l5 5-5 5" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

export const External = ({ size = 12 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden>
    <path d="M5 3h8v8M13 3L3 13" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

export const BrandMark = () => (
  <svg className="brand__mark" viewBox="0 0 32 32" fill="none" aria-hidden>
    <circle cx="16" cy="16" r="10.5" stroke="#c3c8ce" strokeWidth="1.4" />
    <circle cx="16" cy="16" r="3" fill="#3d8bff" />
    <path d="M16 1.5v7M16 23.5v7M1.5 16h7M23.5 16h7" stroke="#c3c8ce" strokeWidth="1.4" />
  </svg>
);

const S = { stroke: 'currentColor', strokeWidth: 1.2, fill: 'none' } as const;
const A = { stroke: '#3d8bff', strokeWidth: 1.2, fill: 'none' } as const;

/** Pillar illustrations for "Understanding IroNav" — abstract, non-technical. */
export function PillarIcon({ id }: { id: string }) {
  switch (id) {
    case 'visual':
      return (
        <svg viewBox="0 0 48 48" aria-hidden>
          <path d="M24 6v8" {...S} />
          <rect x="18" y="14" width="12" height="7" {...S} />
          <path d="M20 21l-12 21h32L28 21" {...A} strokeDasharray="2 2" />
          <path d="M8 42h32M13 34h22M17 27h14" {...S} opacity=".5" />
        </svg>
      );
    case 'gnss':
      return (
        <svg viewBox="0 0 48 48" aria-hidden>
          <path d="M24 42c-9-4-14-10-14-20V11l14-5 14 5v11c0 10-5 16-14 20z" {...S} />
          <path d="M17 22a10 10 0 0114 0M20 26a5 5 0 018 0" {...A} />
          <circle cx="24" cy="30" r="1.6" fill="#3d8bff" />
        </svg>
      );
    case 'uas':
      return (
        <svg viewBox="0 0 48 48" aria-hidden>
          <circle cx="11" cy="13" r="6" {...S} />
          <circle cx="37" cy="13" r="6" {...S} />
          <circle cx="11" cy="35" r="6" {...S} />
          <circle cx="37" cy="35" r="6" {...S} />
          <path d="M15 17l6 5M33 17l-6 5M15 31l6-5M33 31l-6-5" {...S} />
          <rect x="20" y="20" width="8" height="8" {...A} />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 48 48" aria-hidden>
          <rect x="6" y="8" width="16" height="12" {...S} />
          <rect x="26" y="28" width="16" height="12" {...S} />
          <path d="M22 14h8v14" {...A} />
          <circle cx="30" cy="28" r="1.6" fill="#3d8bff" />
          <path d="M6 32h12M6 36h8M30 12h12M34 16h8" {...S} opacity=".5" />
        </svg>
      );
  }
}

/** Integration card artwork. */
export function IntegrationArt({ icon }: { icon: 'mission' | 'aircraft' | 'integration' }) {
  if (icon === 'mission')
    return (
      <svg viewBox="0 0 220 180" aria-hidden>
        <circle cx="110" cy="90" r="70" {...S} opacity=".35" />
        <circle cx="110" cy="90" r="46" {...S} opacity=".55" />
        <circle cx="110" cy="90" r="22" {...S} />
        <path d="M110 10v30M110 140v30M30 90h30M160 90h30" {...S} opacity=".5" />
        <path d="M110 90L160 52" {...A} />
        <circle cx="110" cy="90" r="3" fill="#3d8bff" />
        <path d="M60 135c20-12 32-3 50-20s26-34 52-38" {...A} strokeDasharray="3 4" />
        <path d="M150 34l18 6-6 18" {...S} opacity=".6" />
      </svg>
    );
  if (icon === 'aircraft')
    return (
      <svg viewBox="0 0 220 180" aria-hidden>
        <rect x="88" y="72" width="44" height="36" {...S} />
        <path d="M88 76L46 44M132 76l42-32M88 104l-42 32M132 104l42 32" {...S} />
        <ellipse cx="46" cy="44" rx="24" ry="6" {...S} opacity=".6" />
        <ellipse cx="174" cy="44" rx="24" ry="6" {...S} opacity=".6" />
        <ellipse cx="46" cy="136" rx="24" ry="6" {...S} opacity=".6" />
        <ellipse cx="174" cy="136" rx="24" ry="6" {...S} opacity=".6" />
        <rect x="98" y="116" width="24" height="12" {...A} />
        <path d="M110 108v8" {...A} />
        <path d="M70 160h80M70 156v8M150 156v8" {...S} opacity=".45" />
        <path d="M196 72v36M192 72h8M192 108h8" {...S} opacity=".45" />
      </svg>
    );
  return (
    <svg viewBox="0 0 220 180" aria-hidden>
      <rect x="20" y="40" width="64" height="44" {...S} />
      <rect x="136" y="40" width="64" height="44" {...S} />
      <rect x="78" y="112" width="64" height="44" {...A} />
      <path d="M52 84v20h58v8M168 84v20h-58" {...S} opacity=".7" />
      <path d="M32 54h40M32 62h28M148 54h40M148 62h28" {...S} opacity=".45" />
      <path d="M92 130h36M92 138h24" {...A} opacity=".7" />
      <circle cx="110" cy="104" r="3" fill="#3d8bff" />
    </svg>
  );
}

/** Abstract line glyphs for the portfolio (no product depiction is implied). */
export function SystemGlyph({ glyph }: { glyph: PortfolioItem['glyph'] }) {
  const common = { viewBox: '0 0 88 88', 'aria-hidden': true } as const;
  switch (glyph) {
    case 'nav':
      return (
        <svg {...common}>
          <circle cx="44" cy="44" r="30" {...S} />
          <path d="M44 14v10M44 64v10M14 44h10M64 44h10" {...S} />
          <path d="M44 30l8 22-8-5-8 5z" {...A} />
        </svg>
      );
    case 'shield':
      return (
        <svg {...common}>
          <path d="M44 76c-14-6-22-16-22-32V24l22-8 22 8v20c0 16-8 26-22 32z" {...S} />
          <path d="M32 44h24M44 32v24" {...A} />
        </svg>
      );
    case 'link':
      return (
        <svg {...common}>
          <circle cx="24" cy="56" r="6" {...S} />
          <circle cx="64" cy="56" r="6" {...S} />
          <circle cx="44" cy="22" r="6" {...A} />
          <path d="M28 51l12-24M60 51L48 27M30 56h28" {...S} />
        </svg>
      );
    case 'mortar':
      return (
        <svg {...common}>
          <rect x="16" y="58" width="56" height="12" {...S} />
          <path d="M36 58l18-38 8 4-14 34" {...S} />
          <path d="M60 20l8-8" {...A} />
        </svg>
      );
    case 'solar':
      return (
        <svg {...common}>
          <path d="M12 52h64l-8 10H20z" {...S} />
          <path d="M22 40h44l-4 8H26z" {...A} />
          <path d="M30 40l2 8M44 40v8M58 40l-2 8" {...A} />
          <path d="M8 70c8-4 14 4 22 0s14-4 22 0 14 4 22 0" {...S} opacity=".6" />
        </svg>
      );
    case 'wave':
      return (
        <svg {...common}>
          <path d="M14 36c10-8 20 8 30 0s20-8 30 0M14 50c10-8 20 8 30 0s20-8 30 0" {...S} />
          <rect x="28" y="62" width="32" height="8" {...A} />
        </svg>
      );
    case 'sun':
      return (
        <svg {...common}>
          <circle cx="44" cy="44" r="12" {...A} />
          {Array.from({ length: 8 }, (_, i) => {
            const a = (i * Math.PI) / 4;
            return <path key={i} d={`M${44 + Math.cos(a) * 20} ${44 + Math.sin(a) * 20}L${44 + Math.cos(a) * 30} ${44 + Math.sin(a) * 30}`} {...S} />;
          })}
        </svg>
      );
    case 'aura':
      return (
        <svg {...common}>
          <circle cx="44" cy="44" r="8" {...A} />
          <circle cx="44" cy="44" r="18" {...S} opacity=".8" />
          <circle cx="44" cy="44" r="28" {...S} opacity=".5" />
          <circle cx="44" cy="44" r="36" {...S} opacity=".25" />
        </svg>
      );
    case 'pilot':
      return (
        <svg {...common}>
          <path d="M14 62L44 18l30 44" {...S} />
          <path d="M26 62h36" {...S} />
          <circle cx="44" cy="46" r="6" {...A} />
        </svg>
      );
    case 'land':
      return (
        <svg {...common}>
          <path d="M16 66h56" {...S} />
          <rect x="30" y="54" width="28" height="12" {...A} />
          <path d="M44 16v28M36 36l8 8 8-8" {...S} />
        </svg>
      );
    case 'hover':
      return (
        <svg {...common}>
          <ellipse cx="44" cy="30" rx="26" ry="6" {...S} />
          <path d="M44 36v10" {...S} />
          <rect x="34" y="46" width="20" height="10" {...A} />
          <path d="M24 70h40" {...S} strokeDasharray="3 3" />
        </svg>
      );
  }
}

/** Decorative emblem for the Brahmastra section (abstract geometry only). */
export const Emblem = () => (
  <svg className="brahmastra__emblem" viewBox="0 0 200 200" fill="none" aria-hidden>
    <circle cx="100" cy="100" r="96" stroke="currentColor" />
    <circle cx="100" cy="100" r="70" stroke="currentColor" />
    <circle cx="100" cy="100" r="44" stroke="currentColor" />
    <path d="M100 4v192M4 100h192M32 32l136 136M168 32L32 168" stroke="currentColor" />
  </svg>
);
