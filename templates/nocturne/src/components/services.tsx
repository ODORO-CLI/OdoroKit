import { useEffect, useRef, useState } from "react";

import { SERVICES, SERVICES_INTRO } from "@/data/content";
import { Reveal } from "@/components/reveal";

/* Four rows, each a verb and its object. A ruled list rather than a card grid:
   this Style has no fills and no shadows, so four boxes would be four outlines
   fighting each other. Hairlines that take up no space do the separating. */
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
      className="nc-bg-deep nc-px-max-1-25rem-3vw nc-py-clamp-5rem-12vh-9rem"
    >
      <div className="o-mx-auto nc-max-w-110rem">
        <header className="nc-max-w-46rem">
          <Reveal as="p" className="label o-block nc-text-ink-muted" text={SERVICES_INTRO.eyebrow} show={inView} stagger={30} />
          <Reveal
            as="h2"
            className="display o-mt-6 nc-text-clamp-2rem-4vw-3-6rem"
            text={SERVICES_INTRO.title}
            show={inView}
            stagger={70}
            delay={140}
          />
        </header>

        <ul className="nc-mt-clamp-3rem-7vh-5rem">
          {SERVICES.map((s, i) => (
            <li
              key={s.n}
              style={{
                opacity: inView ? 1 : 0,
                transition: `opacity 800ms var(--raw-ease) ${260 + i * 120}ms`,
              }}
            >
              <span className="hairline o-block" />
              <div className="o-grid o-grid-cols-1 o-gap-4 o-py-9 nc-md-grid-cols-5rem-1fr-1-1fr md:o-gap-10">
                <p className="label o-pt-2 nc-text-ink-muted">{s.n}</p>
                <h3 className="display nc-text-clamp-1-4rem-2-2vw-2rem">{s.title}</h3>
                <p className="nc-max-w-52ch nc-text-0-95rem o-leading-relaxed nc-text-ink-muted">{s.body}</p>
              </div>
            </li>
          ))}
          <li>
            <span className="hairline o-block" />
          </li>
        </ul>
      </div>
    </section>
  );
}
