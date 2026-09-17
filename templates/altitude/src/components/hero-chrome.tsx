import { BRAND, HERO, HERO_STATS, NAV } from "@/data/content";
import { Reveal } from "@/components/reveal";
import { scrollTo } from "@/lib/scroll";

/* ══════════════════════════════════════════════════════════════════════════
   The hero chrome, laid on the first leg of the film.

   Composition: getlayers `altitude-hero` — one full-bleed media frame ruled
   into thirds, a hairline masthead capping the top, a translucent stat rail
   closing the base, and exactly two short centred objects in the band between
   them. The restraint is the point: the contrast comes from the empty field,
   not from a size jump.

   It is not a separate section. It sits ON the film's first chapter and leaves
   when the second one arrives, so the page never cuts from a hero to a video —
   the camera simply carries on.
   ══════════════════════════════════════════════════════════════════════════ */

export function HeroChrome({ ready, show }: { ready: boolean; show: boolean }) {
  const on = ready && show;

  return (
    <div
      className="o-absolute o-inset-0 o-flex o-flex-col o-justify-between"
      /* Once the film has carried the reader into the first chapter, the hero
         is still painted at zero opacity over the frame — so it is made inert
         rather than left as a set of invisible tab stops over a moving film. */
      inert={!show}
      style={{
        opacity: show ? 1 : 0,
        transition: "opacity 520ms var(--raw-ease)",
      }}
    >
      {/* ── masthead ─────────────────────────────────────────────────────── */}
      <header
        className="o-pointer-events-auto o-border-b border-line-faint"
        style={{
          opacity: ready ? 1 : 0,
          transition: "opacity 900ms var(--raw-ease) 120ms",
        }}
      >
        <nav className="o-mx-auto o-flex o-h-16 al-cadre o-items-center o-justify-between al-gouttiere">
          <ul className="o-hidden o-gap-8 md:o-flex">
            {NAV.slice(0, 2).map((n) => (
              <li key={n.href}>
                <a
                  href={n.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo(n.href);
                  }}
                  className="label o-transition-colors al-duree-vive hover:text-ink"
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>

          <span className="display al-fs-105 al-track-34 text-ink">
            {BRAND}
          </span>

          <ul className="o-hidden o-gap-8 md:o-flex">
            {NAV.slice(2).map((n) => (
              <li key={n.href}>
                <a
                  href={n.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo(n.href);
                  }}
                  className="label o-transition-colors al-duree-vive hover:text-ink"
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* ── the band: two short centred objects, nothing else ────────────── */}
      <div className="o-flex o-flex-col o-items-center o-px-6 o-text-center">
        <h1 className="display al-fs-t1">
          <Reveal
            as="span"
            className="o-block"
            text={HERO.lineOne}
            show={on}
            stagger={75}
            delay={260}
          />
          {/* The second line is dimmed so the first one lands. */}
          <Reveal
            as="span"
            className="o-block text-ink-muted"
            text={HERO.lineTwo}
            show={on}
            stagger={75}
            delay={260 + HERO.lineOne.split(" ").length * 75 + 60}
          />
        </h1>

        <form
          className="glass o-pointer-events-auto o-mt-10 o-flex o-w-full al-mw-34 o-items-center o-gap-1 al-pilule o-border-w-1 border-line o-p-1.5"
          style={{
            opacity: on ? 1 : 0,
            transition: "opacity 800ms var(--raw-ease) 1100ms",
          }}
          onSubmit={(e) => {
            e.preventDefault();
            scrollTo("#penthouses");
          }}
        >
          <input
            aria-label={HERO.form.quartier}
            placeholder={HERO.form.quartier}
            className="o-min-w-0 o-flex-1 o-bg-transparent o-px-5 o-py-2.5 al-fs-90 text-ink o-outline-none placeholder:text-ink-subtle"
          />
          <span className="o-h-6 o-w-px bg-line" />
          <input
            aria-label={HERO.form.budget}
            placeholder={HERO.form.budget}
            className="o-min-w-0 o-flex-1 o-bg-transparent o-px-5 o-py-2.5 al-fs-90 text-ink o-outline-none placeholder:text-ink-subtle"
          />
          <button
            type="submit"
            className="o-shrink-0 al-pilule o-px-6 o-py-2.5 al-fs-85 o-font-medium o-transition-transform al-duree hover:-translate-y-px"
            style={{ background: "var(--action)", color: "var(--action-ink)" }}
          >
            {HERO.form.action}
          </button>
        </form>
      </div>

      {/* ── base rail ────────────────────────────────────────────────────────
          Composition `altitude-stats`: equal fractional flanks around an auto
          centre, so a longer figure steals from its own flank and never pushes
          the pitch off the page's axis. */}
      <div
        className="glass o-pointer-events-auto o-border-t border-line"
        style={{
          opacity: ready ? 1 : 0,
          transition: "opacity 900ms var(--raw-ease) 900ms",
        }}
      >
        <div className="o-mx-auto o-grid al-cadre o-grid-cols-2 o-items-start o-gap-6 al-gouttiere o-py-6 al-cols-trois">
          <div className="o-order-2 md:o-order-1">
            <p className="display al-fs-160 text-ink">{HERO_STATS.left.figure}</p>
            <p className="label o-mt-1">{HERO_STATS.left.label}</p>
          </div>

          <div className="o-order-1 o-col-span-2 o-text-center md:o-order-2 md:o-col-span-1">
            <p className="display al-fs-160 text-ink">{HERO_STATS.title}</p>
            <span className="o-my-2 o-block text-ink-subtle">·</span>
            <p className="o-mx-auto al-mw-34ch al-fs-85 o-leading-relaxed text-ink-muted">
              {HERO_STATS.pitch}
            </p>
          </div>

          <div className="o-order-3 o-text-right">
            <p className="display al-fs-160 text-ink">{HERO_STATS.right.figure}</p>
            <p className="label o-mt-1">{HERO_STATS.right.label}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
