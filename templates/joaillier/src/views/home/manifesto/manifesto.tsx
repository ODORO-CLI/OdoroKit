/**
 * Manifesto — GetLayers composition `artist-statement`.
 *
 * One held-back band: an eyebrow, then a single passage set at display size in
 * the display face across a measure narrower than the sections either side,
 * closed by a short italic signature. There is no heading — the paragraph is
 * doing a headline's job, and the only typographic move is scale.
 *
 * It is a pause beat between the hero's assembly and the collection's cards,
 * and it works because nothing competes: no image, no rule, no button.
 *
 * 📖 Docs: obsidian/frontend/sections.md
 */

import TextEngine from "spring-text-engine";

import { Inview } from "@/components/animation/springs/in-view";
import { Eyebrow } from "@/components/ui/eyebrow";
import { RISE, WORD_REVEAL } from "@/lib/motion/reveals";

import type { ManifestoContent } from "./manifesto.types";

export interface ManifestoProps {
  content: ManifestoContent;
}

export const Manifesto = ({ content }: ManifestoProps) => (
  <section
    id="maison"
    aria-label={content.eyebrow}
    className="jo-px-page jo-py-section jo-max-md-py-stack"
  >
    <div className="o-grid o-grid-cols-12 jo-gap-x-lg">
      {/* Indented from the page's full width: the narrowed measure IS the
          composition. Six columns from the third, so the measure ends before
          the fixed nav's column (62.125rem) and the two never overlap while
          the passage is at the top of the window. Below the desktop base it
          takes the whole width. */}
      <div className="o-col-span-6 o-col-start-3 jo-max-lg-col-span-12 jo-max-lg-col-start-1">
        <Eyebrow>{content.eyebrow}</Eyebrow>

        <TextEngine
          tag="p"
          mode="once"
          rootMargin="-12% 0px"
          className="jo-text-statement jo-leading-statement jo-text-foreground-accent jo-font-display jo-mt-xl jo-max-md-text-28px jo-max-md-leading-36px"
          {...WORD_REVEAL}
        >
          {content.passage}
        </TextEngine>

        <Inview
          tag="p"
          mode="once"
          delayIn={320}
          className="jo-text-title jo-leading-heading jo-text-foreground-silver jo-font-display jo-mt-xl o-italic jo-max-md-text-20px jo-max-md-leading-26px"
          {...RISE}
        >
          {content.signature}
        </Inview>
      </div>
    </div>
  </section>
);
