import { useEffect, useRef, useState } from "react";

import { BRAND, CONTACT, FOOTER } from "@/data/content";
import { ActionPill } from "@/components/hero-chrome";
import { Reveal } from "@/components/reveal";

/* The closing panel and the footer. The form sits on the Style's one heavy
   glass — white at 85% over a 37.5px blur — and carries the page's single
   action. Underlined fields whose labels are their own placeholders. */
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
      className="o-border-t border-line bg-ground or-gouttiere o-pb-10 or-pt-section"
    >
      <div className="o-mx-auto or-cadre">
        <div className="o-grid or-gap-grand or-cols-contact">
          <div>
            <Reveal as="p" className="label o-block text-ink-muted" text={CONTACT.eyebrow} show={inView} stagger={30} />
            <Reveal
              as="h2"
              className="display o-mt-6 or-fs-t2c"
              text={CONTACT.title}
              show={inView}
              stagger={75}
              delay={140}
            />
            <Reveal
              as="p"
              className="o-mt-6 or-mw-44ch or-fs-95 o-leading-relaxed text-ink-muted"
              text={CONTACT.body}
              show={inView}
              stagger={22}
              delay={140 + CONTACT.title.split(" ").length * 75 + 90}
            />
          </div>

          <form
            className="panel o-self-end o-rounded-lg o-border-w-1 border-line o-p-8"
            onSubmit={(e) => {
              e.preventDefault();
              setSent(true);
            }}
          >
            <div className="o-space-y-7">
              {Object.entries(CONTACT.fields).map(([key, label]) => (
                <input
                  key={key}
                  required
                  type={key === "email" ? "email" : "text"}
                  aria-label={label}
                  placeholder={label}
                  className="o-w-full o-border-b border-line o-bg-transparent o-pb-3 or-fs-100 o-outline-none o-transition-colors or-duree placeholder:text-ink-faint focus:border-ink"
                />
              ))}
            </div>

            <div className="o-mt-9">
              <ActionPill type="submit" label={sent ? "Demande envoyée" : CONTACT.action} />
            </div>
            <p className="label o-mt-5 text-ink-muted">{CONTACT.note}</p>
          </form>
        </div>

        <div className="or-mt-grand o-grid o-gap-10 o-border-t border-line o-pt-10 or-cols-quatre">
          <div>
            <p className="display or-fs-115 or-track-30">{BRAND}</p>
            <address className="o-mt-5 o-space-y-1 or-fs-875 o-not-italic o-leading-relaxed text-ink-muted">
              <p>{FOOTER.address}</p>
              <p>{FOOTER.hours}</p>
              <p>
                <a href={`tel:${FOOTER.phone.replace(/\s/g, "")}`} className="hover:text-ink">
                  {FOOTER.phone}
                </a>
              </p>
              <p>
                <a href={`mailto:${FOOTER.email}`} className="hover:text-ink">
                  {FOOTER.email}
                </a>
              </p>
            </address>
          </div>

          {FOOTER.columns.map((col) => (
            <div key={col.title}>
              <p className="label text-ink-muted">{col.title}</p>
              <ul className="o-mt-5 o-space-y-2 or-fs-875 text-ink-muted">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="o-transition-colors or-duree-vive hover:text-ink">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="label o-mt-12 text-ink-faint">{FOOTER.legal}</p>
      </div>
    </footer>
  );
}
