import { useEffect, useRef, useState } from "react";

import { SERVICES, SERVICES_INTRO } from "@/data/content";
import { Reveal } from "@/components/reveal";

/* Four rows, each a verb and its object. A ruled list rather than a card grid:
   this page has no shadows and four boxes would be four grey rectangles on a
   white ground. Hairlines do the separating. */
export function Services() {
  const host = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setInView(true), {
      threshold: 0.15,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={host}
      id="services"
      className="o-border-t border-line bg-ground or-gouttiere or-py-section"
    >
      <div className="o-mx-auto or-cadre">
        <header className="or-mw-46">
          <Reveal as="p" className="label o-block text-ink-muted" text={SERVICES_INTRO.eyebrow} show={inView} stagger={30} />
          <Reveal
            as="h2"
            className="display o-mt-6 or-fs-t2b"
            text={SERVICES_INTRO.title}
            show={inView}
            stagger={75}
            delay={140}
          />
        </header>

        <ul className="or-mt-bloc">
          {SERVICES.map((s, i) => (
            <li
              key={s.n}
              className="o-grid o-grid-cols-1 o-gap-4 o-border-t border-line o-py-9 or-cols-service md:o-gap-10"
              style={{
                opacity: inView ? 1 : 0,
                transition: `opacity 800ms var(--raw-ease) ${260 + i * 130}ms`,
              }}
            >
              <p className="label o-pt-2 text-ink-muted">{s.n}</p>
              <h3 className="display or-fs-t4">{s.title}</h3>
              <p className="or-mw-52ch or-fs-95 o-leading-relaxed text-ink-muted">{s.body}</p>
            </li>
          ))}
          <li className="o-border-t border-line" />
        </ul>
      </div>
    </section>
  );
}
