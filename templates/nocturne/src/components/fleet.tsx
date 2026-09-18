import { useEffect, useRef, useState } from "react";

import { FLEET, FLEET_INTRO } from "@/data/content";
import { Reveal } from "@/components/reveal";
import { Action } from "@/components/hero-chrome";

/* ══════════════════════════════════════════════════════════════════════════
   La flotte.

   Six cards, and the copy gets out of the way: power, sprint, price per day,
   deposit. Someone booking a 2 400 €/jour car reads a spec sheet, not an
   adjective — so the card IS the spec sheet, laid out as a readout with
   hairlines between the rows and nothing filled.
   ══════════════════════════════════════════════════════════════════════════ */

export function Fleet() {
  const host = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => e.isIntersecting && setInView(true), {
      threshold: 0.12,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section
      ref={host}
      id="flotte"
      className="nc-bg-cover nc-px-max-1-25rem-3vw nc-py-clamp-5rem-12vh-9rem"
    >
      <div className="o-mx-auto nc-max-w-110rem">
        <header className="nc-max-w-46rem">
          <Reveal as="p" className="label o-block nc-text-ink-muted" text={FLEET_INTRO.eyebrow} show={inView} stagger={30} />
          <Reveal
            as="h2"
            className="display o-mt-6 nc-text-clamp-2rem-4vw-3-6rem"
            text={FLEET_INTRO.title}
            show={inView}
            stagger={70}
            delay={140}
          />
          <Reveal
            as="p"
            className="o-mt-6 nc-max-w-54ch nc-text-0-95rem o-leading-relaxed nc-text-ink-muted"
            text={FLEET_INTRO.body}
            show={inView}
            stagger={20}
            delay={140 + FLEET_INTRO.title.split(" ").length * 70 + 90}
          />
        </header>

        <ul className="nc-mt-clamp-3rem-7vh-5rem o-grid o-gap-x-6 o-gap-y-12 sm:o-grid-cols-2 lg:o-grid-cols-3">
          {FLEET.map((c, i) => (
            <li
              key={c.ref}
              className="group"
              style={{
                opacity: inView ? 1 : 0,
                filter: inView ? "blur(0px)" : "blur(10px)",
                transition: `opacity 240ms linear ${280 + i * 80}ms, filter 900ms var(--raw-ease) ${280 + i * 80}ms`,
              }}
            >
              <div className="o-relative o-overflow-hidden nc-bg-deep">
                <img
                  src={c.image}
                  alt={c.name}
                  className="nc-aspect-3-2 o-w-full o-object-cover o-transition-transform nc-duration-1200ms nc-ease-var-raw-ease nc-group-hover-scale-1-03"
                  loading="lazy"
                  decoding="async"
                />
                <span className="label o-absolute nc-left-5 nc-top-5 nc-text-ink-muted">{c.ref}</span>
              </div>

              <h3 className="display o-mt-6 nc-text-1-3rem">{c.name}</h3>

              <dl className="o-mt-5 nc-text-0-8rem">
                <Row k="Puissance" v={c.power} />
                <Row k="0 à 100 km/h" v={c.sprint} />
                <Row k="Caution" v={c.deposit} />
              </dl>

              <div className="o-mt-6 o-flex o-items-end o-justify-between o-gap-4">
                <p className="display nc-text-1-6rem">
                  {c.price}
                  <span className="label o-ml-2 o-align-middle nc-text-ink-muted">/ jour</span>
                </p>
                <Action label="Réserver" href="#contact" />
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* A spec row, closed by a hairline that takes up no space of its own — so
   adding or removing a row never shifts the card's rhythm. */
function Row({ k, v }: { k: string; v: string }) {
  return (
    <>
      <span className="hairline o-block" />
      <div className="o-flex o-items-baseline o-justify-between o-gap-4 o-py-2.5">
        <dt className="nc-text-ink-subtle">{k}</dt>
        <dd className="nc-text-ink">{v}</dd>
      </div>
    </>
  );
}
