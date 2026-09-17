import { useEffect, useRef, useState } from "react";

import { PENTHOUSES, PENTHOUSES_INTRO } from "@/data/content";
import { Reveal } from "@/components/reveal";

/* ══════════════════════════════════════════════════════════════════════════
   Penthouses.

   Three listings, and the copy gets out of the way: floor, surface, outside
   space, rooms, price. A buyer at this level reads a spec sheet, not an
   adjective — so the card IS a spec sheet, with the price given the display
   face because it is the line that decides.

   The posters are frames lifted from the film itself, so the section cannot
   drift from the footage above it.
   ══════════════════════════════════════════════════════════════════════════ */

export function Penthouses() {
  const host = useRef<HTMLElement>(null);
  const [inView, setInView] = useState(false);

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
    <section
      ref={host}
      id="penthouses"
      className="o-border-t border-line-faint bg-ground al-gouttiere al-py-section"
    >
      <div className="o-mx-auto al-cadre">
        <header className="al-mw-46">
          <Reveal as="p" className="label o-block" text={PENTHOUSES_INTRO.eyebrow} show={inView} stagger={30} />
          <Reveal
            as="h2"
            className="display o-mt-6 al-fs-t2"
            text={PENTHOUSES_INTRO.title}
            show={inView}
            stagger={75}
            delay={140}
          />
          <Reveal
            as="p"
            className="o-mt-6 al-mw-52ch al-fs-95 o-leading-relaxed text-ink-muted"
            text={PENTHOUSES_INTRO.body}
            show={inView}
            stagger={22}
            delay={140 + PENTHOUSES_INTRO.title.split(" ").length * 75 + 90}
          />
        </header>

        <ul className="al-mt-bloc o-grid o-gap-6 md:o-grid-cols-3">
          {PENTHOUSES.map((p, i) => (
            <li
              key={p.ref}
              className="group o-overflow-hidden al-pilule o-border-w-1 border-line"
              style={{
                opacity: inView ? 1 : 0,
                transform: inView ? "none" : "translateY(1.25rem)",
                transition: `opacity 900ms var(--raw-ease) ${340 + i * 110}ms, transform 900ms var(--raw-ease) ${340 + i * 110}ms`,
              }}
            >
              <div className="o-relative al-ratio-45 o-overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.poster}
                  alt={`${p.name}, ${p.floor}`}
                  className="o-h-full o-w-full o-object-cover o-transition-transform al-duree-1200 al-ease al-zoom-cible"
                  loading="lazy"
                  decoding="async"
                />
                <div
                  className="o-pointer-events-none o-absolute o-inset-0"
                  style={{
                    background:
                      "linear-gradient(to bottom, transparent 42%, var(--scrim-bottom) 100%)",
                  }}
                />
                <p className="label o-absolute o-left-6 o-top-6">{p.ref}</p>
                <p className="label o-absolute o-right-6 o-top-6 text-ink-muted">{p.status}</p>
              </div>

              <div className="o-p-7">
                <h3 className="display al-fs-150">{p.name}</h3>
                <p className="label o-mt-2">{p.floor}</p>

                <dl className="o-mt-6 o-space-y-2 o-border-t border-line o-pt-5 al-fs-90">
                  <Row k="Surface" v={p.surface} />
                  <Row k="Extérieur" v={p.outside} />
                  <Row k="Chambres" v={p.rooms} />
                </dl>

                <p className="display o-mt-6 al-fs-175">{p.price}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="o-flex o-items-baseline o-justify-between o-gap-4">
      <dt className="text-ink-subtle">{k}</dt>
      <dd className="text-ink">{v}</dd>
    </div>
  );
}
