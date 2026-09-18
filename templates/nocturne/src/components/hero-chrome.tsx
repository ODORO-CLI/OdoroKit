import { BRAND, HERO, HERO_ASSURANCES, HERO_STATUS, NAV } from "@/data/content";
import { Reveal } from "@/components/reveal";
import { scrollTo } from "@/lib/scroll";

/* ══════════════════════════════════════════════════════════════════════════
   The hero chrome, laid on the first chapter of the fleet film.

   Composition: the Style's own single-screen hero — brand mark and tagline
   top-left, a short nav top-right, the one display moment bottom-left over a
   mono-weight lead, two square actions, a hairline-bracketed assurance row,
   and a frosted status card pinned bottom-right. Everything is drawn IN white
   line and white type directly on the footage; nothing sits on a card except
   that one card.
   ══════════════════════════════════════════════════════════════════════════ */

export function HeroChrome({ ready, show }: { ready: boolean; show: boolean }) {
  const on = ready && show;

  return (
    <div
      className="o-absolute o-inset-0 o-flex o-flex-col o-justify-between"
      /* Once the film has carried the reader past the first chapter, the hero
         is still painted at zero opacity over the frame — so it is made inert
         rather than left as invisible tab stops over a moving film. */
      inert={!show}
      style={{ opacity: show ? 1 : 0, transition: "opacity 520ms var(--raw-ease)" }}
    >
      {/* ── masthead ─────────────────────────────────────────────────────── */}
      <header
        className="o-pointer-events-auto"
        style={{ opacity: ready ? 1 : 0, transition: "opacity 900ms var(--raw-ease) 120ms" }}
      >
        <nav className="o-flex o-items-start o-justify-between nc-px-max-1-25rem-3vw o-py-6">
          <div>
            <p className="display nc-text-1-05rem nc-leading-none">{BRAND}</p>
            <span className="hairline o-my-2 o-block o-w-10" />
            <p className="label nc-text-ink-muted">Location d&apos;exception · Paris</p>
          </div>

          <ul className="o-hidden o-items-center o-gap-8 md:o-flex">
            {NAV.map((n) => (
              <li key={n.href}>
                <a
                  href={n.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo(n.href);
                  }}
                  className="label o-transition-opacity nc-duration-var-duration-fast hover:o-opacity-50"
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* ── the corner ───────────────────────────────────────────────────── */}
      <div className="o-flex o-items-end o-justify-between o-gap-8 nc-px-max-1-25rem-3vw nc-pb-max-1-5rem-4vh">
        <div className="nc-max-w-46rem">
          <Reveal as="p" className="label o-mb-6 o-block nc-text-ink-muted" text={HERO.eyebrow} show={on} stagger={30} delay={180} />

          <h1 className="display nc-text-clamp-2-4rem-6-6vw-5-6rem">
            <Reveal as="span" className="o-block" text={HERO.lineOne} show={on} stagger={70} delay={300} />
            <Reveal
              as="span"
              className="o-block"
              text={HERO.lineTwo}
              show={on}
              stagger={70}
              delay={300 + HERO.lineOne.split(" ").length * 70 + 60}
            />
          </h1>

          <Reveal
            as="p"
            className="o-mt-7 nc-max-w-44ch nc-text-0-95rem o-leading-relaxed nc-text-ink-muted"
            text={HERO.lead}
            show={on}
            stagger={18}
            delay={820}
          />

          <div
            className="o-pointer-events-auto o-mt-9 o-flex o-flex-wrap o-items-center o-gap-3"
            style={{ opacity: on ? 1 : 0, transition: "opacity 800ms var(--raw-ease) 1100ms" }}
          >
            <Action label={HERO.action.label} href={HERO.action.href} primary />
            <Action label="Nous appeler" href="#contact" />
          </div>

          {/* The assurance row: three claims bracketed by hairlines that take
              up no space of their own. */}
          <ul
            className="o-mt-9 o-flex o-flex-wrap o-gap-x-8 o-gap-y-3"
            style={{ opacity: on ? 1 : 0, transition: "opacity 800ms var(--raw-ease) 1280ms" }}
          >
            {HERO_ASSURANCES.map((a) => (
              <li key={a} className="label nc-text-ink-muted">
                <span className="hairline o-mb-3 o-block o-w-8" />
                {a}
              </li>
            ))}
          </ul>
        </div>

        {/* ── the status card: the Style's frosted readout, doing the one job
            a rental page actually has — saying what is free right now. ──── */}
        <aside
          className="glass o-hidden nc-w-15rem o-shrink-0 o-p-6 lg:o-block"
          style={{ opacity: on ? 1 : 0, transition: "opacity 900ms var(--raw-ease) 1400ms" }}
        >
          <div className="o-flex o-items-center o-gap-2">
            <span className="o-block o-h-1.5 o-w-1.5 o-animate-pulse nc-bg-ink" />
            <p className="label nc-text-ink-muted">{HERO_STATUS.label}</p>
          </div>
          <p className="display o-mt-5 nc-text-3rem nc-leading-none">{HERO_STATUS.value}</p>
          <p className="label o-mt-2 nc-text-ink-muted">{HERO_STATUS.unit}</p>
          <span className="hairline o-my-5 o-block" />
          <dl className="o-space-y-2 nc-text-0-8rem">
            {HERO_STATUS.rows.map((r) => (
              <div key={r.k} className="o-flex o-justify-between o-gap-4">
                <dt className="nc-text-ink-subtle">{r.k}</dt>
                <dd>{r.v}</dd>
              </div>
            ))}
          </dl>
        </aside>
      </div>
    </div>
  );
}

/* ── the action ────────────────────────────────────────────────────────────
   The action surface and the ink over media are BOTH white, so the primary
   button's hover cannot be a colour swap — it is a wipe. The label inverts
   through `mix-blend-difference`, and the button isolates itself, or the blend
   would reach the film behind it. */
export function Action({
  label,
  href,
  primary,
  type,
}: {
  label: string;
  href?: string;
  primary?: boolean;
  type?: "submit";
}) {
  const cls = [
    "group o-relative o-inline-flex o-h-12 o-items-center o-overflow-hidden o-px-7 nc-text-0-78rem o-font-medium o-uppercase nc-tracking-0-08em",
    primary ? "nc-text-ink" : "nc-text-ink nc-outline nc-outline-1 nc--outline-offset-1 nc-outline-rule",
  ].join(" ");

  const inner = (
    <>
      {primary && (
        <>
          <span className="o-absolute o-inset-0 nc-bg-var-surface-action" />
          <span className="o-absolute o-inset-0 o-origin-left nc-scale-x-0 nc-bg-var-surface-action-hover o-transition-transform nc-duration-var-duration nc-ease-var-raw-ease nc-group-hover-scale-x-100" />
        </>
      )}
      <span className={primary ? "o-relative o-mix-blend-difference" : "o-relative"}>{label}</span>
    </>
  );

  const style = primary ? { isolation: "o-isolate" as const } : undefined;

  if (type === "submit") {
    return (
      <button type="submit" className={cls} style={style}>
        {inner}
      </button>
    );
  }

  return (
    <a
      href={href}
      onClick={(e) => {
        if (!href?.startsWith("#")) return;
        e.preventDefault();
        scrollTo(href);
      }}
      className={cls}
      style={style}
    >
      {inner}
    </a>
  );
}
