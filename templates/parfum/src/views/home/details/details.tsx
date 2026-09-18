import { Inview } from "@/components/animation/springs/in-view";
import { FrameButton } from "@/components/ui/frame-button";

import { DetailsFeature } from "./details-feature";
import { DetailsIntro } from "./details-intro";
import { DETAILS_REVEAL } from "./details.motion";
import type { DetailsContent } from "./details.types";

export interface DetailsProps {
  content: DetailsContent;
}

const HEADING_ID = "details-heading";

/**
 * Details section — Figma file WINXFW2nTM7zYwd5dGgm1T, node 1748:1102
 * (1440×800), the second block of the concept.
 *
 * A Server Component; every animated piece is a client leaf.
 *
 * **The frame's header is not rebuilt here.** Node 1748:1102 draws the logo,
 * nav and cart at the same coordinates the hero frame does, because each Figma
 * frame is a standalone artboard and has to carry them. On the page they are
 * one banner at the top, already rendered by `views/home`. Building them again
 * would put a second `<header>` and a duplicate nav in the document.
 *
 * **The product is not rendered here.** It is the hero's 3D model, travelling
 * down from the first screen — one canvas for both, owned by `ProductStage`. The
 * frame's own photograph of the jacket has been deleted; the model is framed to
 * land exactly where that picture sat (`DETAILS_HEIGHT`/`DETAILS_DROP` in
 * `hero-scene.tsx`). Below `lg` there is no product on this screen at all.
 *
 * Same anchoring rule as the hero: from `lg` the frame's coordinates apply and
 * each piece is pinned to the edge the frame pins it to — headline and rows to
 * the top, the button to the bottom — so a taller viewport opens the gaps
 * rather than stretching or cropping a composition that has content in three
 * corners. Below `lg` it is ordinary flow (ADR-0029): statement,
 * specifications, action.
 */
export const Details = ({ content }: DetailsProps) => (
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
      <DetailsIntro
        id={HEADING_ID}
        heading={content.heading}
        lede={content.lede}
      />

      {/* Two up below the frame, with the last one across both — five cards in a
          single column ran the block twice as long as it needed to be, and the
          copy in each is short enough to take half the width. At `lg` the grid
          dissolves back into the frame's own column. */}
      {/* `o-right-10` rather than the frame's x of 983: 983 + 417 = 1400, which
          is the 40-unit margin, and the margin is the part that holds once the
          canvas is wider than 1440 units. */}
      <ol className="o-grid o-grid-cols-1 o-gap-3 sm:o-grid-cols-2 pf-sm-li-last-child-col-span-2 pf-lg-absolute pf-lg-top-30-5 pf-lg-right-10 pf-lg-z-10 pf-lg-flex pf-lg-w-104-25 pf-lg-flex-col">
        {content.features.map((feature, index) => (
          <DetailsFeature key={feature.index} order={index} {...feature} />
        ))}
      </ol>

      <Inview
        tag="div"
        mode="once"
        from={{ opacity: 0, y: 12 }}
        to={{ opacity: 1, y: 0 }}
        delayIn={DETAILS_REVEAL.cta}
        className="o-flex o-justify-center pf-lg-absolute pf-lg-bottom-10 pf-lg-left-10 pf-lg-z-10 pf-lg-justify-start"
      >
        <FrameButton
          label={content.cta.label}
          href={content.cta.href}
          revealInView
          revealDelay={DETAILS_REVEAL.cta}
        />
      </Inview>
    </div>
  </section>
);
