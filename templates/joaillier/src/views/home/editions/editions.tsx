/**
 * Editions — GetLayers composition `lumora-portfolio`.
 *
 * A centred outlined eyebrow chip and a centred display heading sit above a
 * two-up grid of tall cards; each card is a frame in its own right — a meta row
 * pinned to its top edge, a ghosted mark, and the title at its foot over the
 * photograph.
 *
 * 📖 Docs: obsidian/frontend/sections.md
 */

import TextEngine from "spring-text-engine";

import { Inview } from "@/components/animation/springs/in-view";
import { LINE_REVEAL, RISE } from "@/lib/motion/reveals";

import type { EditionsContent } from "./editions.types";

/** Between one card's arrival and the next, in ms. */
const CARD_STAGGER = 160;

export interface EditionsProps {
  content: EditionsContent;
}

export const Editions = ({ content }: EditionsProps) => (
  <section
    id="editions"
    aria-labelledby="editions-heading"
    className="jo-px-page jo-py-section jo-max-md-py-stack"
  >
    <div className="o-flex o-flex-col o-items-center o-text-center">
      <Inview
        tag="p"
        mode="once"
        className="jo-font-ui jo-text-caption jo-leading-caption jo-text-foreground-accent-muted jo-border-line jo-rounded-pill o-inline-flex o-border-w-1 jo-px-md jo-py-sm o-uppercase jo-tracking-0-14em"
        {...RISE}
      >
        {content.eyebrow}
      </Inview>

      <TextEngine
        tag="h2"
        id="editions-heading"
        mode="once"
        className="jo-text-headline jo-leading-headline jo-text-foreground-accent jo-font-display jo-mt-lg jo-max-w-40rem o-justify-center o-text-center jo-max-md-text-40px jo-max-md-leading-40px"
        {...LINE_REVEAL}
      >
        {content.heading}
      </TextEngine>
    </div>

    <ul className="jo-mt-stack o-grid o-grid-cols-2 jo-gap-lg jo-max-md-grid-cols-1 jo-max-md-gap-xl">
      {content.cards.map((card, index) => (
        <Inview
          key={card.id}
          tag="li"
          mode="once"
          delayIn={index * CARD_STAGGER}
          className="o-relative"
          {...RISE}
        >
          <figure className="jo-rounded-media jo-border-line jo-bg-surface-card o-relative o-overflow-hidden o-border-w-1">
            <div className="o-relative jo-aspect-3-4">
              <img
                src={card.image.src}
                alt={card.image.alt}
                className="o-absolute o-inset-0 o-h-full o-w-full o-object-cover"
              />
              <span
                aria-hidden
                className="jo-from-scrim-panel o-pointer-events-none o-absolute o-inset-x-0 o-bottom-0 jo-h-2-5 jo-bg-linear-to-t o-to-transparent"
              />
            </div>

            <figcaption className="o-pointer-events-none o-absolute o-inset-0 o-flex o-flex-col o-justify-between jo-p-xl">
              <span className="jo-font-ui jo-text-caption jo-leading-caption jo-text-foreground-accent-strong text-trim o-flex o-items-start o-justify-between o-uppercase jo-tracking-0-12em">
                <span>{card.meta}</span>
                {/* The ghosted mark — the wordmark's initial, in the italic cut. */}
                <span
                  aria-hidden
                  className="jo-font-display jo-text-display jo-leading-title jo-text-foreground-accent-20 jo--mt-0-35em o-italic o-normal-case"
                >
                  O
                </span>
              </span>
              <span className="jo-font-display jo-text-title jo-leading-heading jo-text-foreground-accent">
                {card.title}
              </span>
            </figcaption>
          </figure>
        </Inview>
      ))}
    </ul>
  </section>
);
