import { useEffect, useState } from "react";
import { animated } from "@react-spring/web";

import { Spring } from "@/components/animation/springs/spring";
import { SitemapButton } from "@/components/ui/sitemap-button";
import { useSceneFade } from "@/hooks/sections/use-scene-fade";
import { useSections } from "@/hooks/sections/use-sections";
import { useWindowWidth } from "@/hooks/use-window-size";
import { screens } from "@/lib/scene/screens";
import { springsConfig } from "@/lib/springs/config";
import { scrollToSection } from "@/utils/scroll-to-section";
import { easeOutQuartic } from "@/utils/animation/easing";
import type { SitemapContent } from "@/data/mocks/home";

/**
 * Sitemap — the chapter list arranged as a "o-ring around the core": the UI frames
 * the plume, which climbs the middle of the viewport as the slide arrives.
 *
 * The section is a full-height, three-row stack (`o-justify-between`): a header
 * block latches top-left, the chapter list spans the middle, the CTA sits at the
 * bottom-centre. The middle is a 3-column grid whose CENTRE column is left empty
 * — that hole is where the column of smoke climbs. Chapters 01–03 go in the left
 * column, 04–05 in the right, mirrored (see `SitemapButton`) and offset down one
 * row so the two halves interlock rather than mirror as a symmetric block. It is
 * still one `<ol>`; grid placement (`col-start` / `row-start`) splits it visually
 * so the reading order stays 01→05.
 *
 * Below **991px** (`pad-sm`) it collapses to a single left-aligned column —
 * header, all five rows un-mirrored in order, then the CTA — with the scene
 * behind it. It used to collapse at 768px, which left the whole tablet range
 * broken: the three columns held, but the centre column has an 18rem floor, so
 * the two chapter columns were squeezed to roughly 200px each and every title
 * wrapped. A ledger whose rows wrap is not a ledger.
 *
 * The entrance latch matches the original: it plays once, the first time the
 * slide goes active, and never replays. Springs express the staggered sequence
 * declaratively via `delayIn`; the ramp is `easeOutQuartic` over `duration`.
 *
 * On touch the reveal is opacity-only — the per-frame transform read as laggy
 * and blurry — so `rise` collapses to 0 below `mobileWidth`.
 */

/** The original's `duration: 650` per element. */
const REVEAL_DURATION = 650;
/** Upward travel, in px, on desktop. Touch devices fade only. */
const RISE = 36;

/** Delays, in ms, from the reveal queue. */
const DELAY = {
  eyebrow: 0,
  heading: 60,
  ledger: 150,
  cta: 470,
} as const;

/** Per-row entrance stagger, in ms. */
const ROW_STAGGER = 60;

const REVEAL = { duration: REVEAL_DURATION, easing: easeOutQuartic } as const;

/**
 * Grid placement per chapter, indexed by position in the flattened list. Static
 * literals so the generator can see them. Chapters 01–03 fill the left column (rows
 * 1–3); 04–05 fill the right column but start at row 2, so the right half is
 * offset down by one row and the two columns interlock around the trunk. On
 * mobile every row resets to auto flow (`max-pad-sm:col-start-auto row-start-auto`)
 * and the single column reads 01→05 in DOM order.
 */
const PLACEMENT = [
  "o-col-start-1 o-row-start-1",
  "o-col-start-1 o-row-start-2",
  "o-col-start-1 o-row-start-3",
  "o-col-start-3 o-row-start-2",
  "o-col-start-3 o-row-start-3",
] as const;

export interface SitemapProps {
  content: SitemapContent;
}

export const Sitemap = ({ content }: SitemapProps) => {
  const active = useSections((state) => state.active);
  const width = useWindowWidth();
  const isMobile = width > 0 && width <= springsConfig.mobileWidth;
  const fade = useSceneFade(screens.SITEMAP);

  /* Latch: the entrance plays the first time the slide goes active and never
   * replays, matching the original's `hasRevealed` ref. */
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    if (active === screens.SITEMAP) setRevealed(true);
  }, [active]);

  const rise = isMobile ? 0 : RISE;
  const from = { opacity: 0, y: rise };
  const to = { opacity: 1, y: 0 };

  /* The `content.rows` grouping (1 / 2 / 2) is only meaningful to the old
   * constellation; the ledger is one ordered list, so flatten it. */
  const chapters = content.rows.flat();

  return (
    <section
      id="sitemap"
      aria-labelledby="sitemap-heading"
      /* `static` overrides the sticky rule the other slides rely on — the
       * Sitemap scrolls with the page. `o-overflow-hidden` + the 100vh clamp stop
       * mid-animation overflow from growing the document. */
      /* `o-h-screen` (not just `o-min-h-screen`) gives the inner `o-h-full` a definite
         parent to resolve against — without it the wrapper collapses to content
         height and nothing vertically centres. */
      className="o-static o-h-screen o-max-h-screen o-min-h-screen o-w-full o-overflow-hidden hl-max-pad-sm-h-auto hl-max-pad-sm-max-h-none hl-max-pad-sm-min-h-screen hl-max-pad-sm-overflow-visible hl-max-pad-sm-pt-30 hl-max-pad-sm-pb-14 hl-max-376px--pt-25 hl-max-376px--pb-10 hl-max-360px--pt-22-5"
    >
      <animated.div
        style={fade}
        /* Three rows spread top → bottom: header, list, CTA. Top padding clears
           the fixed header. On mobile it un-spreads to a left-aligned stack. */
        className="page-gutter o-flex o-h-full o-w-full o-flex-col o-justify-between o-pt-28 o-pb-12 hl-max-pad-sm-h-auto hl-max-pad-sm-justify-start hl-max-pad-sm-gap-y-8 hl-max-pad-sm-pt-0 hl-max-pad-sm-pb-0"
      >
        {/* Row 1 — header, top-left, hugging the left edge. */}
        <div className="hl-max-w-18ch hl-max-pad-sm-max-w-none">
          <Spring
            tag="p"
            enabled={revealed}
            mode="once"
            from={from}
            to={to}
            delayIn={DELAY.eyebrow}
            config={REVEAL}
            className="o-mb-4 o-font-sans hl-text-0-6875rem-none o-font-medium hl-tracking-0-34em hl-text-accent-500-85 o-uppercase"
          >
            {content.eyebrow}
          </Spring>

          <Spring
            tag="h2"
            id="sitemap-heading"
            enabled={revealed}
            mode="once"
            from={from}
            to={to}
            delayIn={DELAY.heading}
            config={REVEAL}
            className="hl-font-lato hl-text-1-75rem-1-3 hl-tracking-0-01em hl-text-foreground-92 hl-max-h-717-text-2xl hl-max-pad-sm-text-2xl hl-max-hero-xs-text-xl"
          >
            {content.heading}
          </Spring>
        </div>

        {/* Row 2 — the chapter list. One `<ol>` laid out as a 3-column grid; the
            centre column is empty (the tree's hole). Rows split via grid
            placement, so the reading order stays 01→05. */}
        <ol className="o-grid o-w-full hl-grid-cols-minmax-0-1fr-_minmax-22rem-34rem-_minmax-0-1fr o-gap-x-12 hl-max-hero-lg-grid-cols-minmax-0-1fr-_minmax-18rem-30rem-_minmax-0-1fr hl-max-hero-lg-gap-x-8 hl-max-pad-sm-grid-cols-1 hl-max-pad-sm-gap-x-0">
          {chapters.map((chapter, index) => {
            const isRight = index >= 3;

            return (
              <Spring
                key={chapter.target}
                tag="li"
                enabled={revealed}
                mode="once"
                from={from}
                to={to}
                delayIn={DELAY.ledger + index * ROW_STAGGER}
                config={REVEAL}
                className={`${PLACEMENT[index]} hl-max-pad-sm-col-start-auto hl-max-pad-sm-row-start-auto o-border-t hl-border-accent-500-14 hl-first-border-t-0`}
              >
                <SitemapButton
                  number={chapter.number}
                  title={chapter.title}
                  subtitle={chapter.subtitle}
                  align={isRight ? "right" : "left"}
                  onClick={() => scrollToSection(chapter.target)}
                />
              </Spring>
            );
          })}
        </ol>

        {/* Row 3 — CTA, centred horizontally at the bottom (left on mobile). */}
        <Spring
          tag="div"
          enabled={revealed}
          mode="once"
          from={from}
          to={to}
          delayIn={DELAY.cta}
          config={REVEAL}
          className="o-flex o-justify-center hl-max-pad-sm-justify-start"
        >
          <button
            type="button"
            onClick={() => scrollToSection(screens.SOCIAL)}
            className="o-cursor-pointer o-rounded-full o-border-w-1 hl-border-accent-500-50 hl-bg-accent-500-8 hl-px-6-5 o-py-3.5 o-font-sans hl-text-xs-none o-font-semibold hl-tracking-0-22em hl-text-foreground o-uppercase hl-shadow-cta"
          >
            {content.ctaLabel}
          </button>
        </Spring>
      </animated.div>
    </section>
  );
};
