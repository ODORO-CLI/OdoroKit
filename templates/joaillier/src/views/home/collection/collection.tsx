/**
 * Collection — GetLayers composition `vexon-showcase`.
 *
 * The heading row splits 4|8: a small label alone in the left four columns, a
 * large statement with its supporting paragraph in the right eight. Under it,
 * an evenly spaced row of three tall (4:5) image cards, each with corner
 * brackets, an index tag and a title-over-caption footer. The 4|8 imbalance
 * resolves into a perfectly even card row — order after emphasis.
 *
 * 📖 Docs: obsidian/frontend/sections.md
 */

import TextEngine from "spring-text-engine";

import { Inview } from "@/components/animation/springs/in-view";
import { Eyebrow } from "@/components/ui/eyebrow";
import { LINE_REVEAL, RISE } from "@/lib/motion/reveals";

import { CollectionCard } from "./collection-card";
import type { CollectionContent } from "./collection.types";

/** Between one card's arrival and the next, in ms. */
const CARD_STAGGER = 130;

export interface CollectionProps {
  content: CollectionContent;
}

export const Collection = ({ content }: CollectionProps) => (
  <section
    id="collection"
    aria-labelledby="collection-heading"
    className="jo-px-page jo-py-section jo-max-md-py-stack"
  >
    <div className="o-grid o-grid-cols-12 jo-gap-x-lg jo-gap-y-lg">
      <div className="o-col-span-4 jo-max-lg-col-span-12">
        <Eyebrow rule={false}>{content.eyebrow}</Eyebrow>
      </div>

      <div className="o-col-span-8 jo-max-lg-col-span-12">
        <TextEngine
          tag="h2"
          id="collection-heading"
          mode="once"
          className="jo-text-headline jo-leading-headline jo-text-foreground-accent jo-font-display jo-max-md-text-40px jo-max-md-leading-40px"
          {...LINE_REVEAL}
        >
          {content.headline}
        </TextEngine>

        <Inview
          tag="p"
          mode="once"
          delayIn={240}
          className="jo-text-lead jo-leading-lead jo-text-foreground-accent-soft jo-font-ui jo-mt-lg jo-max-w-36rem"
          {...RISE}
        >
          {content.body}
        </Inview>
      </div>
    </div>

    <ul
      className="jo-mt-stack o-grid o-grid-cols-3 jo-gap-lg jo-max-lg-grid-cols-1 jo-max-lg-gap-xl"
      aria-label={content.eyebrow}
    >
      {content.items.map((item, index) => (
        <CollectionCard
          key={item.id}
          item={item}
          cta={content.cta}
          delay={index * CARD_STAGGER}
        />
      ))}
    </ul>
  </section>
);
