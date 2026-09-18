import { useEffect, useRef, useState } from "react";

import { BRAND, CONTACT, FOOTER } from "@/data/content";
import { Action } from "@/components/hero-chrome";
import { Reveal } from "@/components/reveal";

/* The closing block and the footer. No panel: this Style has no page surface,
   so the form is underlined fields on the ground itself, and the one filled
   element on the screen is the action. */
export function Contact() {
  const host = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setInView(true), {
      threshold: 0.2,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <footer
      ref={host}
      id="contact"
      className="nc-bg-cover nc-px-max-1-25rem-3vw o-pb-10 nc-pt-clamp-5rem-12vh-9rem"
    >
      <div className="o-mx-auto nc-max-w-110rem">
        <span className="hairline o-block" />

        <div className="o-grid nc-gap-clamp-3rem-6vw-6rem nc-pt-clamp-3rem-7vh-5rem nc-lg-grid-cols-1-1fr-1fr">
          <div>
            <Reveal as="p" className="label o-block nc-text-ink-muted" text={CONTACT.eyebrow} show={inView} stagger={30} />
            <Reveal
              as="h2"
              className="display o-mt-6 nc-text-clamp-2rem-4-2vw-3-8rem"
              text={CONTACT.title}
              show={inView}
              stagger={70}
              delay={140}
            />
            <Reveal
              as="p"
              className="o-mt-6 nc-max-w-46ch nc-text-0-95rem o-leading-relaxed nc-text-ink-muted"
              text={CONTACT.body}
              show={inView}
              stagger={20}
              delay={140 + CONTACT.title.split(" ").length * 70 + 90}
            />
          </div>

          <form
            className="o-self-end"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <div className="o-space-y-7">
              {Object.entries(CONTACT.fields).map(([key, label]) => (
                <div key={key}>
                  <input
                    required
                    type={key === "phone" ? "tel" : "text"}
                    aria-label={label}
                    placeholder={label}
                    className="o-w-full o-bg-transparent o-pb-3 nc-text-1rem o-outline-none nc-placeholder-text-ink-subtle"
                  />
                  <span className="hairline o-block" />
                </div>
              ))}
            </div>

            <div className="o-mt-9">
              <Action type="submit" label={sent ? "Demande envoyée" : CONTACT.action} primary />
            </div>
            <p className="label o-mt-5 nc-text-ink-muted">{CONTACT.note}</p>
          </form>
        </div>

        <div className="nc-mt-clamp-4rem-10vh-7rem">
          <span className="hairline o-block" />
          <div className="o-grid o-gap-10 o-pt-10 nc-md-grid-cols-1-4fr-repeat-3-1fr">
            <div>
              <p className="display nc-text-1-05rem nc-leading-none">{BRAND}</p>
              <address className="o-mt-5 o-space-y-1 nc-text-0-85rem o-not-italic o-leading-relaxed nc-text-ink-muted">
                <p>{FOOTER.address}</p>
                <p>{FOOTER.hours}</p>
                <p>
                  <a href={`tel:${FOOTER.phone.replace(/\s/g, "")}`} className="nc-hover-text-ink">
                    {FOOTER.phone}
                  </a>
                </p>
                <p>
                  <a href={`mailto:${FOOTER.email}`} className="nc-hover-text-ink">
                    {FOOTER.email}
                  </a>
                </p>
              </address>
            </div>

            {FOOTER.columns.map((col) => (
              <div key={col.title}>
                <p className="label nc-text-ink-muted">{col.title}</p>
                <ul className="o-mt-5 o-space-y-2 nc-text-0-85rem nc-text-ink-muted">
                  {col.links.map((l) => (
                    <li key={l}>
                      <a href="#" className="o-transition-colors nc-duration-var-duration-fast nc-hover-text-ink">
                        {l}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <p className="label o-mt-12 nc-text-ink-subtle">{FOOTER.legal}</p>
      </div>
    </footer>
  );
}
