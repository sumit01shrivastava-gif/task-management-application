import { useState } from 'react';
import { INTEGRATION } from '../../content/ironav';
import { manifest } from '../../exploded/config';

const W = manifest.width;
const H = manifest.height;
const mod = manifest.layers.find((l) => l.id === 'ironav-module')!;
const frame = { x: 420, y: 176, w: 410, h: 110 };
const pct = (v: number, of: number) => `${(v / of) * 100}%`;

/** Pins for the aircraft-compatibility view, placed on the photographed airframe. */
const PINS = [
  { t: 'Airframe interfaces', x: frame.x + 40, y: frame.y + 60, dx: -1 },
  { t: 'Sensor placement', x: mod.x + mod.w * 0.4, y: mod.y + mod.h * 0.5, dx: -1 },
  { t: 'Size', x: mod.x + mod.w, y: mod.y + 6, dx: 1 },
  { t: 'Weight', x: mod.x + mod.w * 0.5, y: mod.y + mod.h, dx: 1 },
  { t: 'Power requirements', x: 640, y: 150, dx: 1 },
];

/** 06 — Platform integration: three considerations, each with its own view of the aircraft. */
export function Integration() {
  const [active, setActive] = useState(0);
  const item = INTEGRATION.items[active];
  return (
    <section className="integ" id="integration" aria-labelledby="integ-h">
      <div className="wrap">
        <header className="integ__head">
          <div className="chapter reveal">
            <span className="chapter__n">{INTEGRATION.index}</span>
            <span className="label">{INTEGRATION.label}</span>
          </div>
          <h2 id="integ-h" className="h2 reveal">
            {INTEGRATION.title}
          </h2>
          <p className="lede reveal">{INTEGRATION.intro}</p>
        </header>

        <div className="integ__body">
          <div className="integ__tabs reveal" role="tablist" aria-label="Integration considerations">
            {INTEGRATION.items.map((it, i) => (
              <button
                key={it.id}
                role="tab"
                id={`tab-${it.id}`}
                aria-selected={i === active}
                aria-controls="integ-panel"
                className={`integ__tab ${i === active ? 'is-active' : ''}`}
                onClick={() => setActive(i)}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown' || e.key === 'ArrowRight') setActive((active + 1) % 3);
                  if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') setActive((active + 2) % 3);
                }}
              >
                <span className="integ__n">{it.n}</span>
                <span className="integ__t">{it.title}</span>
                <span className="integ__d">{it.body}</span>
              </button>
            ))}
          </div>

          <div className="integ__panel reveal" id="integ-panel" role="tabpanel" aria-labelledby={`tab-${item.id}`} data-view={item.id}>
            <div className="integ__visual" style={{ aspectRatio: `${W} / ${H}` }}>
              <img className="integ__art" src="/media/derived/lineart.png" alt="" width={W} height={H} loading="lazy" />
              <img
                className="integ__module"
                src="/media/ironav-layers/ironav-module.webp"
                alt="IroNav module, from the original photograph"
                loading="lazy"
                style={{ left: pct(mod.x, W), top: pct(mod.y, H), width: pct(mod.w, W) }}
              />

              {/* mission: overhead signal paths, some disrupted (illustrative) */}
              <svg className="iv iv--mission" viewBox={`0 0 ${W} ${H}`} aria-hidden>
                {[180, 580, 980].map((x, i) => (
                  <g key={x}>
                    <rect x={x - 14} y={-6} width="28" height="18" className="iv__sat" />
                    <line x1={x} y1={14} x2={mod.x + mod.w / 2} y2={mod.y} className={i === 1 ? 'iv__sig' : 'iv__sig iv__sig--cut'} />
                  </g>
                ))}
                <path d={`M40 ${H * 0.18} Q ${W / 2} ${-H * 0.15} ${W - 40} ${H * 0.18}`} className="iv__dome" />
              </svg>

              {/* aircraft: considerations pinned to the airframe */}
              <div className="iv iv--aircraft">
                {PINS.map((p) => (
                  <span key={p.t} className={`pin ${p.dx < 0 ? 'pin--l' : ''}`} style={{ left: pct(p.x, W), top: pct(p.y, H) }}>
                    <i />
                    <b>{p.t}</b>
                  </span>
                ))}
              </div>

              {/* india: integration → evaluation → support scope */}
              <ol className="iv iv--india">
                {INTEGRATION.items[2].points.map((p, i) => (
                  <li key={p}>
                    <span>{String(i + 1).padStart(2, '0')}</span>
                    {p}
                  </li>
                ))}
              </ol>
            </div>
            <div className="integ__caption">
              <ul>
                {item.points.map((p) => (
                  <li key={p}>{p}</li>
                ))}
              </ul>
              <p className="label">{INTEGRATION.caveat}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
