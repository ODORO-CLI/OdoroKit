import { HERO_FACTS } from "@/data/content";

/* A thin band of four facts between the campaign film and the collection.
   It is the first thing the reader meets after the film, and it answers the
   only four questions a jewellery buyer has before looking at a price. */
export function FactsRail() {
  return (
    <section className="border-y border-line bg-ground">
      <dl className="o-mx-auto o-grid or-cadre o-grid-cols-2 md:o-grid-cols-4">
        {HERO_FACTS.map((f, i) => (
          <div
            key={f.label}
            className={[
              "or-gouttiere o-py-9",
              i > 0 && "md:o-border-l md:border-line",
              i === 1 && "o-border-l border-line md:o-border-l",
              i === 2 && "o-border-t border-line md:border-t-0",
              i === 3 && "o-border-l o-border-t border-line md:border-t-0",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <dt className="display or-fs-t4b">{f.value}</dt>
            <dd className="label o-mt-2 text-ink-muted">{f.label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
