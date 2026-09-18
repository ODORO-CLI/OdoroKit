import { useEffect, useRef, useState } from "react";

import { PIECES, PIECES_INTRO } from "@/data/content";
import { Reveal } from "@/components/reveal";

/* ══════════════════════════════════════════════════════════════════════════
   La collection.

   Six cards, and the copy gets out of the way: metal, weight, price. Someone
   spending four thousand euros on a ring reads a spec, not an adjective — so
   the card IS the spec, and the price carries the display face because it is
   the line that decides.

   Each card arrives out of 0.75rem of blur rather than a fade: in this Style
   the blur IS the arrival, and it is the only depth cue on a page that has no
   shadows at all.
   ══════════════════════════════════════════════════════════════════════════ */

export function Pieces() {
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
      id="pieces"
      className="bg-ground or-gouttiere or-py-section"
    >
      <div className="o-mx-auto or-cadre">
        <header className="or-mw-46">
          <Reveal as="p" className="label o-block text-ink-muted" text={PIECES_INTRO.eyebrow} show={inView} stagger={30} />
          <Reveal
            as="h2"
            className="display o-mt-6 or-fs-t2b"
            text={PIECES_INTRO.title}
            show={inView}
            stagger={75}
            delay={140}
          />
          <Reveal
            as="p"
            className="o-mt-6 or-mw-52ch or-fs-95 o-leading-relaxed text-ink-muted"
            text={PIECES_INTRO.body}
            show={inView}
            stagger={22}
            delay={140 + PIECES_INTRO.title.split(" ").length * 75 + 90}
          />
        </header>

        <ul className="or-mt-bloc o-grid o-gap-x-6 o-gap-y-14 sm:o-grid-cols-2 lg:o-grid-cols-3">
          {PIECES.map((p, i) => (
            <li
              key={p.ref}
              className="group"
              style={{
                opacity: inView ? 1 : 0,
                filter: inView ? "blur(0rem)" : "blur(0.75rem)",
                transition: `opacity 260ms linear ${300 + i * 90}ms, filter 900ms var(--raw-ease) ${300 + i * 90}ms`,
              }}
            >
              <div className="o-relative o-overflow-hidden o-rounded-lg bg-ground-alt">
                <img
                  src={p.image}
                  alt={`${p.name}, ${p.material}`}
                  className="o-aspect-square o-w-full o-object-cover o-transition-transform or-duree-1200 or-ease or-zoom-cible"
                  loading="lazy"
                  decoding="async"
                />
                <span className="label o-absolute or-gauche-5 or-haut-5 text-ink-muted">{p.ref}</span>
              </div>

              <div className="o-mt-6 o-flex o-items-start o-justify-between o-gap-6 o-border-t border-line o-pt-5">
                <div>
                  <h3 className="display or-fs-140">{p.name}</h3>
                  <p className="o-mt-2 or-fs-85 text-ink-muted">{p.material}</p>
                  <p className="or-fs-85 text-ink-muted">{p.weight}</p>
                </div>
                <p className="display o-shrink-0 or-fs-140">{p.price}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
