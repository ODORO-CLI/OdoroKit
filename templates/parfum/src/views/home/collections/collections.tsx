import { Inview } from "@/components/animation/springs/in-view";
import { FrameButton } from "@/components/ui/frame-button";
import { ScrambleText } from "@/components/ui/scramble-text";

import { CollectionsCard } from "./collections-card";
import { COLLECTIONS_REVEAL } from "./collections.motion";
import type { CollectionsContent } from "./collections.types";

export interface CollectionsProps {
  content: CollectionsContent;
}

const HEADING_ID = "collections-heading";

/**
 * Collections section — Figma file WINXFW2nTM7zYwd5dGgm1T, node 1748:1152
 * (1440×800), the third block of the concept.
 *
 * A Server Component; every animated piece is a client leaf.
 *
 * As with the details screen, **the frame's header is not rebuilt** — each Figma
 * frame is a standalone artboard and has to carry the banner; the page has one,
 * already rendered by `views/home`.
 *
 * The four cards are a flex row rather than four absolute boxes: the frame puts
 * them at x 40, 383, 726 and 1069 at 331 wide, which is exactly `pf-inset-x-10`
 * with three 12-unit gaps and equal shares (4×331 + 3×12 = 1360 = 1440 − 80).
 * Expressing it as the row it is means the arithmetic cannot drift, and it is
 * also what lets the same markup become a two-column grid on a tablet and a
 * stack on a phone.
 *
 * The headline is the same 70px setting as the details screen, cap-height
 * trimmed — see `details-intro.tsx` for why that trim is load-bearing.
 */
export const Collections = ({ content }: CollectionsProps) => (
  <section
    aria-labelledby={HEADING_ID}
    className="o-relative o-flex o-w-full o-flex-col o-gap-10 o-px-5 o-py-16 pf-font-mono pf-text-hero-content pf-lg-block pf-lg-h-200 pf-lg-gap-0 pf-lg-px-0 pf-lg-py-0"
  >
    {/* **The frame's own 800-unit box, centred in the screen.** The section is a
        viewport tall; the composition is not, and the two are only equal on a
        1.8:1 screen. Positioning the children against the *section* let all the
        leftover height fall below them — 89px of it at 1280×800 — and split the
        composition in half, because anything anchored to the top scaled with the
        frame and anything anchored to the bottom did not. Anchoring them here
        keeps every frame coordinate exact and leaves the slack where it belongs:
        half above, half below.

        `pf--mt-100` rather than `pf--translate-y-1-2` — a transform would make this a
        containing block for `background-attachment: fixed`, and the lattice
        panels inside would fall out of step with the page behind them.

        `max-lg:o-contents` so that below the frame this box is not in the layout
        at all and the flow column is exactly what it was. */}
    <div className="max-lg:o-contents pf-lg-absolute pf-lg-inset-x-0 pf-lg-top-1-2 pf-lg-mt-100 pf-lg-h-200">
      {/* Heading and lede are one group below the frame — they belong to each
          other, and the section's own 40-unit rhythm between them read as two
          unrelated blocks. `pf-lg-contents` dissolves the wrapper at the frame
          breakpoint so both go back to their own frame coordinates. */}
      <div className="o-flex o-flex-col o-gap-4 pf-lg-contents">
        <Inview
          tag="h2"
          id={HEADING_ID}
          mode="once"
          from={{ opacity: 0, y: 20 }}
          to={{ opacity: 1, y: 0 }}
          className="pf-text-hero-display-compact pf-leading-hero-headline pf-tracking-hero-display pf-text-hero-content pf--text-box-trim-both-cap-alphabetic pf-sm-text-hero-display-tablet pf-lg-text-hero-display pf-lg-absolute pf-lg-top-32-5 pf-lg-left-10 pf-lg-z-10"
        >
          <ScrambleText
            tieProse
            revealInView
            revealDelay={COLLECTIONS_REVEAL.heading}
          >
            {content.heading}
          </ScrambleText>
        </Inview>

        <Inview
          tag="p"
          mode="once"
          from={{ opacity: 0 }}
          to={{ opacity: 1 }}
          delayIn={COLLECTIONS_REVEAL.lede}
          // Measured from the right edge — the frame puts this at x 1069 at
          // 285 wide, which leaves 86 units of margin, and that gap is what the
          // composition is: a lede tucked under the row's right-hand end.
          className="pf-max-w-36ch pf-text-hero-body pf-leading-hero-prose pf-text-hero-content-muted o-uppercase pf-max-sm-prose-even pf-sm-text-hero-lede pf-lg-absolute pf-lg-top-30-5 pf-lg-right-21-5 pf-lg-z-10 pf-lg-w-71-25 pf-lg-max-w-none"
        >
          <ScrambleText
            tieProse
            revealInView
            revealDelay={COLLECTIONS_REVEAL.lede}
          >
            {content.lede}
          </ScrambleText>
        </Inview>
      </div>

      <ol className="o-grid o-grid-cols-1 o-gap-3 sm:o-grid-cols-2 pf-lg-absolute pf-lg-inset-x-10 pf-lg-top-57 pf-lg-z-10 pf-lg-flex">
        {content.products.map((product, index) => (
          <CollectionsCard key={product.index} order={index} {...product} />
        ))}
      </ol>

      <Inview
        tag="div"
        mode="once"
        from={{ opacity: 0, y: 12 }}
        to={{ opacity: 1, y: 0 }}
        delayIn={COLLECTIONS_REVEAL.cta}
        className="o-flex o-justify-center pf-lg-absolute pf-lg-bottom-10 pf-lg-left-1-2 pf-lg-z-10 pf-lg-translate-x-1-2"
      >
        <FrameButton
          label={content.cta.label}
          href={content.cta.href}
          revealInView
          revealDelay={COLLECTIONS_REVEAL.cta}
        />
      </Inview>
    </div>
  </section>
);
