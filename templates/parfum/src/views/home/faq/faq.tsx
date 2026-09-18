import type { CSSProperties } from "react";

import { Inview } from "@/components/animation/springs/in-view";
import { ScrambleText } from "@/components/ui/scramble-text";

import { FaqStage } from "./faq-stage";

import type { FaqContent } from "./faq.types";

export interface FaqProps {
  content: FaqContent;
}

const HEADING_ID = "faq-heading";

/** First row's delay; the rest follow at this interval. */
const ROW_DELAY = 80;
const ROW_STEP = 90;

/**
 * FAQ section — Figma file WINXFW2nTM7zYwd5dGgm1T, node 1748:1158, the fifth
 * block of the concept.
 *
 * A Server Component; every animated piece is a client leaf.
 *
 * **A description list, not a stack of cards.** Five questions and their answers
 * is exactly what `dl`/`dt`/`dd` is for, and it is what makes the section
 * eligible for FAQ structured data later. The consequence is a strict content
 * model — inside a `dl` a row wrapper may hold only `dt` and `dd` — so the
 * frame's vertical rule between the two columns is drawn as a **border on the
 * answer** rather than as an element of its own, with the frame's 32-unit gap
 * split either side of it.
 *
 * The row height comes from the frame's rule, which is 112 units tall against
 * 80 units of copy. With the rule now a border there is nothing to drive that
 * height, so it is set explicitly — and only from `lg`, because below the frame
 * breakpoint the answers wrap to more lines and a fixed height would clip them.
 *
 * As with the other blocks, **the frame's header is not rebuilt** — each Figma
 * frame is a standalone artboard carrying it; the page has one banner.
 */
export const Faq = ({ content }: FaqProps) => (
  <section
    aria-labelledby={HEADING_ID}
    data-product-region
    className="o-relative o-flex o-w-full o-flex-col o-gap-10 o-overflow-hidden o-px-5 o-py-16 pf-font-mono pf-text-hero-content pf-lg-block pf-lg-h-200 pf-lg-gap-0 pf-lg-px-0 pf-lg-py-0"
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
      {/* The frame runs the product off the bottom-left, mirrored — the same
          photograph the details frame used, flipped so the jacket faces into the
          page. The inner percentages are its crop, verbatim. */}
      <FaqStage subject={content.subject} />

      <Inview
        tag="h2"
        id={HEADING_ID}
        mode="once"
        from={{ opacity: 0, y: 20 }}
        to={{ opacity: 1, y: 0 }}
        className="pf-text-hero-display-compact pf-leading-hero-headline pf-tracking-hero-display pf-text-hero-content pf--text-box-trim-both-cap-alphabetic pf-sm-text-hero-display-tablet pf-lg-text-hero-display pf-lg-absolute pf-lg-top-34 pf-lg-left-10 pf-lg-z-10 pf-lg-w-64-5"
      >
        <ScrambleText revealInView tieProse>
          {content.heading}
        </ScrambleText>
      </Inview>

      {/* Right margin, not the frame's x of 726: 726 + 674 = 1400. See the
          note on the canvas in `views/home`. */}
      <dl className="o-flex o-flex-col o-gap-3 pf-lg-absolute pf-lg-top-34 pf-lg-right-10 pf-lg-z-10 pf-lg-w-168-5">
        {content.entries.map((entry, index) => (
          <Inview
            tag="div"
            key={entry.index}
            mode="once"
            from={{ opacity: 0, y: 16 }}
            to={{ opacity: 1, y: 0 }}
            delayIn={ROW_DELAY + index * ROW_STEP}
            className="hero-lattice-panel o-flex o-flex-col o-gap-4 o-border-w-1 pf-border-hero-rule o-p-4 pf-lg-h-28-5 pf-lg-flex-row pf-lg-items-center pf-lg-gap-0 pf-lg-px-4 pf-lg-py-0"
          >
            {/* **Reversed below the frame, not reordered in the DOM.** The frame puts
                the index under the question because the two sit in a column beside
                the answer; read top to bottom on a narrow screen that is index-last,
                which is backwards — the number introduces the row. The markup keeps
                question first, where a reader needs it, and the column flips. */}
            <dt className="o-flex o-shrink-0 o-flex-col-reverse o-gap-4 pf-lg-flex-col pf-lg-w-48-75 pf-lg-justify-center pf-lg-gap-8">
              {/* **The frame's measured width, and only there.** Each
                  question carries the width the frame wraps it to — 175 units
                  by default — and that width is a fact about a 1440 screen
                  where the question sits in a 195-unit column beside its
                  answer. Below the frame the row is the full width of the
                  card and there is nothing to wrap around, so the same cap
                  broke a question that fits comfortably on one line into
                  three. Carried as a variable, applied at `lg`. */}
              <span
                className="o-block pf-text-hero-body pf-leading-hero-display pf-text-hero-content pf-max-sm-prose-even pf-lg-max-w-var-faq-question"
                style={
                  {
                    "--faq-question": `${(entry.questionWidth ?? 175) / 16}rem`,
                  } as CSSProperties
                }
              >
                {/* No binding here, deliberately: this is a heading, and the
                    balancer below the frame can only even the two lines if it
                    is free to break between "OR" and what follows it. Ties are
                    for prose, where a hanging preposition has a line of running
                    text under it rather than the end of the question. */}
                <ScrambleText
                  revealInView
                  revealDelay={ROW_DELAY + index * ROW_STEP}
                >
                  {entry.question}
                </ScrambleText>
              </span>
              <span
                aria-hidden
                className="pf-text-hero-body pf-leading-hero-display o-whitespace-nowrap pf-text-hero-content-faint"
              >
                {entry.index}
              </span>
            </dt>

            {/* The frame's vertical rule, drawn as this cell's own left border so
                the description list's content model stays intact. */}
            {/* Full row height, not the copy's 80 — the border *is* the frame's
                rule, and the rule runs the whole way down. The copy is centred
                inside it, which is where the frame's own 80-unit block sits. */}
            {/* **Top-aligned, not centred, and the padding is measured.** The
                frame centres the answer in its own 112-unit box while the
                question sits in a `o-justify-center` column beside it, so their
                first lines never met — the answer began 0.77rem above the
                question at every width, 1440 included. Aligning to the top and
                padding by the measured difference puts the two first lines on
                one line. In rem so it holds at every scale. */}
            <dd className="o-min-w-px pf-text-hero-body pf-leading-hero-prose pf-text-hero-content-muted o-uppercase pf-max-sm-prose-even pf-lg-ml-8 pf-lg-flex pf-lg-h-28 pf-lg-flex-1 pf-lg-items-start pf-lg-border-l pf-lg-border-hero-rule pf-lg-pt-0-92rem pf-lg-pl-8">
              <ScrambleText
                tieProse
                revealInView
                revealDelay={ROW_DELAY + index * ROW_STEP + 60}
              >
                {entry.answer}
              </ScrambleText>
            </dd>
          </Inview>
        ))}
      </dl>
    </div>
  </section>
);
