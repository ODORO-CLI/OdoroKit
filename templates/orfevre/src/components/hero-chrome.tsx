import { BRAND, HERO, NAV } from "@/data/content";
import { Reveal } from "@/components/reveal";
import { scrollTo } from "@/lib/scroll";

/* ══════════════════════════════════════════════════════════════════════════
   The hero chrome, laid on the first chapter of the campaign film.

   The composition is the one the brief's references use: full-bleed image,
   wordmark top-left, a short nav top-right, and the headline standing in the
   bottom-left corner with one action beneath it. Nothing in the middle — the
   frame belongs to the subject.

   The headline dims its OWN first clause to 50% and lets the second land. That
   is the committed Style's signature move, and it is what turns two flat
   sentences into one sentence with a point.
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
        <nav className="o-flex o-items-center o-justify-between or-gouttiere o-py-7">
          <span className="display or-fs-115 or-track-30">{BRAND}</span>

          <ul className="o-hidden o-items-center o-gap-9 md:o-flex">
            {NAV.map((n) => (
              <li key={n.href}>
                <a
                  href={n.href}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollTo(n.href);
                  }}
                  className="label text-ink o-transition-opacity or-duree-vive hover:o-opacity-50"
                >
                  {n.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* ── the corner: headline, then the one action ─────────────────────── */}
      <div className="or-gouttiere or-pb-bas">
        <h1 className="display or-fs-t1">
          {/* The first clause recedes… */}
          <Reveal
            as="span"
            className="o-block text-ink-muted"
            text={HERO.lineOne}
            show={on}
            stagger={80}
            delay={260}
          />
          {/* …so the second one lands. */}
          <Reveal
            as="span"
            className="o-block"
            text={HERO.lineTwo}
            show={on}
            stagger={80}
            delay={260 + HERO.lineOne.split(" ").length * 80 + 60}
          />
        </h1>

        <div
          className="o-pointer-events-auto o-mt-9"
          style={{ opacity: on ? 1 : 0, transition: "opacity 800ms var(--raw-ease) 1100ms" }}
        >
          <ActionPill label={HERO.action.label} href={HERO.action.href} />
        </div>
      </div>
    </div>
  );
}

/* ── the one action in the system ──────────────────────────────────────────
   A black pill, 48px tall, with a white arrow tile inside it. It is the only
   pure-black surface on the page and the only thing the reader is ever asked
   to press. Its hover is three things at once — a 1px lift, the arrow
   crossing, and a sheen sweeping the width. */
export function ActionPill({
  label,
  href,
  onClick,
  type,
}: {
  label: string;
  href?: string;
  onClick?: () => void;
  type?: "submit";
}) {
  const inner = (
    <>
      <span className="o-relative o-z-10">{label}</span>
      <span className="o-relative o-z-10 o-grid o-h-10 o-w-10 o-shrink-0 o-place-items-center o-overflow-hidden o-rounded-full bg-ground">
        <span className="o-block o-transition-transform or-duree or-ease or-sort-cible or-monte-cible">
          <Arrow />
        </span>
        <span className="o-absolute or-tx-neg-5 or-ty-5 o-transition-transform or-duree or-ease or-entre-cible or-pose-cible">
          <Arrow />
        </span>
      </span>
      {/* the sheen */}
      <span className="o-pointer-events-none o-absolute o-inset-0 or-tx-neg-plein or-oblique or-lueur o-transition-transform or-duree-lente or-ease or-traverse-cible" />
    </>
  );

  const cls =
    "group o-relative o-inline-flex o-h-12 o-items-center o-gap-5 o-overflow-hidden o-rounded-full or-fond-action o-py-1 o-pl-7 o-pr-1 or-fs-85 o-font-medium or-encre-action o-transition-transform or-duree hover:-translate-y-px";

  if (type === "submit") {
    return (
      <button type="submit" className={cls} onClick={onClick}>
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
    >
      {inner}
    </a>
  );
}

function Arrow() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <path d="M2 12 12 2M5 2h7v7" stroke="currentColor" strokeWidth="1.4" className="text-ink" />
    </svg>
  );
}
