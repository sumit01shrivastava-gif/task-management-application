import { INTRO } from '../../content/ironav';
import { manifest } from '../../exploded/config';

const mod = manifest.layers.find((l) => l.id === 'ironav-module')!;
const W = manifest.width;
const H = manifest.height;

/**
 * 02 — Overview. The aircraft as a line trace of the photograph, with only the
 * IroNav module left in full colour, exactly where it sits on the airframe.
 */
export function Intro() {
  return (
    <section className="intro" id="overview" aria-labelledby="intro-h">
      <div className="wrap">
        <header className="chapter reveal">
          <span className="chapter__n">{INTRO.index}</span>
          <span className="label">{INTRO.label}</span>
        </header>

        <div className="intro__grid">
          <h2 id="intro-h" className="statement reveal">
            {INTRO.statement}
          </h2>
          <div className="intro__body reveal">
            {INTRO.body.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </div>
      </div>

      <figure className="trace reveal" aria-label="Line trace of the aircraft with the IroNav module shown in full colour">
        <div className="trace__stage" style={{ aspectRatio: `${W} / ${H}` }}>
          <img className="trace__art" src="/media/derived/lineart.png" width={W} height={H} alt="" loading="lazy" />
          <img
            className="trace__module"
            src="/media/ironav-layers/ironav-module.webp"
            width={mod.w}
            height={mod.h}
            alt="IroNav module, from the original photograph"
            loading="lazy"
            style={{ left: `${(mod.x / W) * 100}%`, top: `${(mod.y / H) * 100}%`, width: `${(mod.w / W) * 100}%` }}
          />
          <span className="trace__call" style={{ left: `${((mod.x + mod.w) / W) * 100}%`, top: `${((mod.y + mod.h * 0.35) / H) * 100}%` }}>
            <i />
            <b>IroNav</b>
            <span className="label">Beneath the central assembly</span>
          </span>
        </div>
        <figcaption className="wrap trace__cap label">
          <span>Fig. 02</span> Line trace derived from the original photograph · module shown as photographed
        </figcaption>
      </figure>

      <div className="wrap">
        <dl className="facts reveal">
          {INTRO.facts.map((f) => (
            <div key={f.k}>
              <dt className="label">{f.k}</dt>
              <dd>{f.v}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
