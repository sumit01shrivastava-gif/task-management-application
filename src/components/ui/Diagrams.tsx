/**
 * Illustrative technical diagrams (SVG + CSS animation). They express the
 * published positioning only — they do not describe IroNav's internal operation.
 */
import { manifest } from '../../exploded/config';

const mod = manifest.layers.find((l) => l.id === 'ironav-module')!;
const W = manifest.width;
const H = manifest.height;

/** Visual navigation: a downward view frustum over terrain with tracked reference points. */
export function VisualNavDiagram() {
  const pts = [
    [70, 250], [130, 228], [190, 262], [250, 236], [310, 258], [96, 300], [168, 292], [236, 304], [292, 296], [350, 284],
  ];
  return (
    <svg className="dgm" viewBox="0 0 420 340" role="img" aria-label="Illustration: a downward view over terrain with tracked visual reference points">
      <defs>
        <linearGradient id="vn-fr" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#9fb6ff" stopOpacity=".28" />
          <stop offset="1" stopColor="#9fb6ff" stopOpacity="0" />
        </linearGradient>
      </defs>
      {/* terrain grid in perspective */}
      {Array.from({ length: 9 }, (_, i) => (
        <line key={`h${i}`} x1={20 - i * 4} x2={400 + i * 4} y1={210 + i * i * 1.9} y2={210 + i * i * 1.9} className="dgm__grid" />
      ))}
      {Array.from({ length: 11 }, (_, i) => (
        <line key={`v${i}`} x1={210 + (i - 5) * 22} y1={210} x2={210 + (i - 5) * 62} y2={340} className="dgm__grid" />
      ))}
      {/* frustum from the aircraft */}
      <path d="M210 70 L60 320 L360 320 Z" fill="url(#vn-fr)" />
      <path d="M210 70 L60 320 M210 70 L360 320" className="dgm__line" />
      <rect x="196" y="56" width="28" height="16" className="dgm__node" />
      {pts.map(([x, y], i) => (
        <g key={i} className="dgm__pt" style={{ animationDelay: `${(i * 0.37) % 3}s` }}>
          <rect x={x - 5} y={y - 5} width="10" height="10" />
          <line x1={210} y1={72} x2={x} y2={y} />
        </g>
      ))}
      <text x="20" y="28" className="dgm__tag">VISUAL REFERENCE — ILLUSTRATIVE</text>
    </svg>
  );
}

/** GNSS interference: satellite signals with interference, aircraft holding its reference. */
export function GnssDiagram() {
  const sats = [
    [70, 60],
    [210, 34],
    [350, 60],
  ];
  return (
    <svg className="dgm" viewBox="0 0 420 340" role="img" aria-label="Illustration: satellite signals disturbed by interference around an uncrewed aircraft">
      {sats.map(([x, y], i) => (
        <g key={i}>
          <rect x={x - 9} y={y - 6} width="18" height="12" className="dgm__node" />
          <line x1={x - 22} y1={y} x2={x + 22} y2={y} className="dgm__line" />
          <line x1={x} y1={y + 8} x2={210} y2={238} className="dgm__signal" style={{ animationDelay: `${i * 0.5}s` }} />
        </g>
      ))}
      {/* interference */}
      {[0, 1, 2].map((i) => (
        <path
          key={i}
          d={`M${30 + i * 8} ${150 + i * 22} q 18 -14 36 0 t 36 0 t 36 0 t 36 0 t 36 0 t 36 0 t 36 0 t 36 0 t 36 0 t 36 0`}
          className="dgm__noise"
          style={{ animationDelay: `${i * 0.6}s` }}
        />
      ))}
      <circle cx="210" cy="244" r="46" className="dgm__shield" />
      <circle cx="210" cy="244" r="64" className="dgm__shield dgm__shield--2" />
      <path d="M190 244 h40 M210 232 v24" className="dgm__line" />
      <rect x="198" y="236" width="24" height="16" className="dgm__node dgm__node--accent" />
      <text x="20" y="320" className="dgm__tag">GNSS INTERFERENCE — ILLUSTRATIVE</text>
    </svg>
  );
}

/** Uncrewed aircraft: the photographed aircraft as a line trace, the module marked. */
export function AircraftDiagram() {
  const pad = 14;
  return (
    <div className="dgm dgm--photo" role="img" aria-label="Line trace of the photographed aircraft with the IroNav module marked">
      <div className="dgm__frame">
      <img src="/media/derived/lineart.png" alt="" width={W} height={H} loading="lazy" />
      <span
        className="dgm__mark"
        style={{
          left: `${((mod.x - pad) / W) * 100}%`,
          top: `${((mod.y - pad) / H) * 100}%`,
          width: `${((mod.w + pad * 2) / W) * 100}%`,
          height: `${((mod.h + pad * 2) / H) * 100}%`,
        }}
      >
        <i>IroNav</i>
      </span>
      </div>
      <span className="dgm__tag dgm__tag--html">TRACED FROM THE ORIGINAL PHOTOGRAPH</span>
    </div>
  );
}
