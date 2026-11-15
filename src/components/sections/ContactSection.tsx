import { useEffect, useState, type FormEvent } from 'react';
import { contact, links } from '../../content/site';
import { Arrow, External } from '../ui/Icons';

export const ENQUIRY_EVENT = 'globaz:enquiry';

/**
 * Section 07 — Contact & enquiry.
 * No backend is assumed: submitting composes an email to the published Globaz
 * address with the selected enquiry type, and the existing Globaz contact page
 * is offered as the alternative channel.
 */
export function ContactSection() {
  const [type, setType] = useState(contact.enquiries[0].id);
  const [status, setStatus] = useState('');

  useEffect(() => {
    const on = (e: Event) => {
      const id = (e as CustomEvent).detail as string;
      if (contact.enquiries.some((q) => q.id === id)) setType(id);
    };
    window.addEventListener(ENQUIRY_EVENT, on);
    return () => window.removeEventListener(ENQUIRY_EVENT, on);
  }, []);

  const selected = contact.enquiries.find((q) => q.id === type)!;

  const submit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    if (!form.reportValidity()) return;
    const d = new FormData(form);
    const body = [
      `Enquiry type: ${selected.title}`,
      `Name: ${d.get('name')}`,
      `Organisation: ${d.get('organisation') || '—'}`,
      `Email: ${d.get('email')}`,
      '',
      String(d.get('message') || ''),
    ].join('\n');
    window.location.href = `mailto:${links.email}?subject=${encodeURIComponent(selected.subject)}&body=${encodeURIComponent(body)}`;
    setStatus('Your email application should now open with the enquiry prepared. If it does not, write to ' + links.email + '.');
  };

  return (
    <section className="section contact" id="contact" aria-labelledby="ct-title">
      <div className="wrap">
        <div className="section-head reveal">
          <div>
            <span className="kicker">{contact.kicker}</span>
            <h2 id="ct-title" className="h2">
              {contact.headline}
            </h2>
          </div>
          <p className="lead">{contact.intro}</p>
        </div>

        <div className="contact__layout">
          <div className="reveal">
            <div className="enquiry-list" role="radiogroup" aria-label="Enquiry type">
              {contact.enquiries.map((q, i) => (
                <button key={q.id} type="button" role="radio" aria-checked={type === q.id} className={`enquiry ${type === q.id ? 'is-active' : ''}`} onClick={() => setType(q.id)}>
                  <span className="enquiry__num">{String(i + 1).padStart(2, '0')}</span>
                  <span>
                    <h3>{q.title}</h3>
                    <p>{q.body}</p>
                  </span>
                  <span className="enquiry__mark" aria-hidden />
                </button>
              ))}
            </div>
            <div className="contact__details">
              <a className="email" href={`mailto:${links.email}`}>
                {links.email}
              </a>
              <div>
                {contact.offices.map((o) => (
                  <p className="body" key={o}>
                    {o}
                  </p>
                ))}
              </div>
              <a className="link-arrow" href={links.contact} target="_blank" rel="noopener noreferrer">
                Globaz contact page <External />
              </a>
            </div>
          </div>

          <form className="form reveal" onSubmit={submit} noValidate={false}>
            <div className="field">
              <label htmlFor="f-type">Enquiry</label>
              <select id="f-type" name="type" value={type} onChange={(e) => setType(e.target.value)}>
                {contact.enquiries.map((q) => (
                  <option key={q.id} value={q.id}>
                    {q.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="form__row">
              <div className="field">
                <label htmlFor="f-name">Name</label>
                <input id="f-name" name="name" autoComplete="name" required />
              </div>
              <div className="field">
                <label htmlFor="f-org">Organisation</label>
                <input id="f-org" name="organisation" autoComplete="organization" />
              </div>
            </div>
            <div className="field">
              <label htmlFor="f-email">Email</label>
              <input id="f-email" name="email" type="email" autoComplete="email" required />
            </div>
            <div className="field">
              <label htmlFor="f-msg">Brief summary</label>
              <textarea id="f-msg" name="message" required placeholder="A short, non-sensitive description of your platform or requirement." />
            </div>
            <p className="form__note">Please share non-sensitive information only. The team can arrange the appropriate channel for programme and technical details.</p>
            <div className="form__actions">
              <button className="btn btn--primary" type="submit">
                {selected.title} <Arrow />
              </button>
            </div>
            <p className="form__status" role="status" aria-live="polite">
              {status}
            </p>
          </form>
        </div>
      </div>
    </section>
  );
}
