import { useEffect, useRef, useState } from "react";

import { SERVICES, SERVICES_INTRO } from "@/data/content";
import { Reveal } from "@/components/reveal";

/* ══════════════════════════════════════════════════════════════════════════
   Services — four rows, each one a verb and its object.

   A ruled list rather than a card grid: cards would put four equal boxes on a
   page whose whole argument is that there is no filler here. Hairlines do the
   separating, and the number carries the column the rules already draw.
   ══════════════════════════════════════════════════════════════════════════ */

export function Services() {
  const host = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => e.isIntersecting && setInView(true),
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={host}
      id="services"
      className="o-border-t border-line-faint bg-ground-deep al-gouttiere al-py-section"
    >
      <div className="o-mx-auto al-cadre">
        <header className="al-mw-46">
          <Reveal as="p" className="label o-block" text={SERVICES_INTRO.eyebrow} show={inView} stagger={30} />
          <Reveal
            as="h2"
            className="display o-mt-6 al-fs-t2"
            text={SERVICES_INTRO.title}
            show={inView}
            stagger={75}
            delay={140}
          />
        </header>

        <ul className="al-mt-bloc">
          {SERVICES.map((s, i) => (
            <li
              key={s.n}
              className="o-grid o-grid-cols-1 o-gap-4 o-border-t border-line o-py-9 al-cols-penthouse md:o-gap-10"
              style={{
                opacity: inView ? 1 : 0,
                transition: `opacity 800ms var(--raw-ease) ${260 + i * 130}ms`,
              }}
            >
              <p className="label o-pt-2">{s.n}</p>
              <h3 className="display al-fs-t4">{s.title}</h3>
              <p className="al-mw-52ch al-fs-95 o-leading-relaxed text-ink-muted">
                {s.body}
              </p>
            </li>
          ))}
          <li className="o-border-t border-line" />
        </ul>
      </div>
    </section>
  );
}
