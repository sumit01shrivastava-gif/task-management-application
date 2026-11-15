import { ENQUIRY, LINKS, mailto } from '../../content/ironav';
import { Arrow, External, Mail } from '../ui/Icons';

/** 08 — Final enquiry. */
export function Enquiry() {
  return (
    <section className="enq" id="enquiry" aria-labelledby="enq-h">
      <div className="enq__bg" aria-hidden>
        <img src="/media/ironav-original.png" alt="" width={1161} height={558} loading="lazy" />
      </div>
      <div className="wrap">
        <div className="chapter reveal">
          <span className="chapter__n">{ENQUIRY.index}</span>
          <span className="label">{ENQUIRY.label}</span>
        </div>
        <h2 id="enq-h" className="enq__h reveal">
          {ENQUIRY.title}
        </h2>
        <p className="lede enq__lede reveal">{ENQUIRY.body}</p>

        <div className="paths">
          {ENQUIRY.paths.map((p) => (
            <a key={p.n} className="path reveal" href={mailto(p.subject)}>
              <span className="path__n">{p.n}</span>
              <span className="path__t">{p.title}</span>
              <span className="path__b">{p.body}</span>
              <span className="path__a">
                Email Globaz <Arrow size={12} />
              </span>
            </a>
          ))}
        </div>

        <div className="enq__contact reveal">
          <a className="enq__mail" href={`mailto:${LINKS.email}`}>
            <Mail size={18} /> {LINKS.email}
          </a>
          <a className="link" href={LINKS.contactPage} target="_blank" rel="noopener noreferrer">
            Globaz contact page <External />
          </a>
          <p className="label">{ENQUIRY.note}</p>
        </div>
      </div>
    </section>
  );
}
