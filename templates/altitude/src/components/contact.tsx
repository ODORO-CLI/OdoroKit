import { useEffect, useRef, useState } from "react";

import { BRAND, CONTACT, FOOTER } from "@/data/content";
import { Reveal } from "@/components/reveal";

/* ══════════════════════════════════════════════════════════════════════════
   Contact and footer.

   The one place on the page that carries colour: the sand→steel gradient, on
   the submit button, with black type on it. It appears exactly once — that is
   the Style's rule and it is what makes the button read as the only action
   worth taking.
   ══════════════════════════════════════════════════════════════════════════ */

export function Contact() {
  const host = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setInView(true),
      { threshold: 0.2 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <footer
      ref={host}
      id="contact"
      className="o-border-t border-line-faint bg-ground al-gouttiere o-pb-10 al-pt-section"
    >
      <div className="o-mx-auto al-cadre">
        <div className="o-grid al-gap-grand al-cols-contact">
          {/* ── the invitation ─────────────────────────────────────────── */}
          <div>
            <Reveal as="p" className="label o-block" text={CONTACT.eyebrow} show={inView} stagger={30} />
            <Reveal
              as="h2"
              className="display o-mt-6 al-fs-t2b"
              text={CONTACT.title}
              show={inView}
              stagger={75}
              delay={140}
            />
            <Reveal
              as="p"
              className="o-mt-6 al-mw-42ch al-fs-95 o-leading-relaxed text-ink-muted"
              text={CONTACT.body}
              show={inView}
              stagger={22}
              delay={140 + CONTACT.title.split(" ").length * 75 + 90}
            />
          </div>

          {/* ── the form: three underlined fields, labels as placeholders ── */}
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
                    type={key === "email" ? "email" : "text"}
                    aria-label={label}
                    placeholder={label}
                    className="o-w-full o-border-b border-line o-bg-transparent o-pb-3 al-fs-100 text-ink o-outline-none o-transition-colors al-duree placeholder:text-ink-subtle focus:border-ink"
                  />
                </div>
              ))}
            </div>

            <button
              type="submit"
              className="o-mt-10 o-h-14 o-w-full al-pilule al-fs-95 o-font-medium o-transition-transform al-duree hover:-translate-y-px"
              style={{ background: "var(--action)", color: "var(--action-ink)" }}
            >
              {sent ? "Demande envoyée" : CONTACT.action}
            </button>

            <p className="label o-mt-4">{CONTACT.note}</p>
          </form>
        </div>

        {/* ── the rail ─────────────────────────────────────────────────── */}
        <div className="al-mt-grand o-grid o-gap-10 o-border-t border-line o-pt-10 al-cols-services">
          <div>
            <p className="display al-fs-105 al-track-34">{BRAND}</p>
            <address className="o-mt-5 o-space-y-1 al-fs-875 o-not-italic o-leading-relaxed text-ink-muted">
              <p>{FOOTER.address}</p>
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
              <p className="label">{col.title}</p>
              <ul className="o-mt-5 o-space-y-2 al-fs-875 text-ink-muted">
                {col.links.map((l) => (
                  <li key={l}>
                    <a href="#" className="o-transition-colors al-duree-vive hover:text-ink">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <p className="label o-mt-12">{FOOTER.legal}</p>
      </div>
    </footer>
  );
}
