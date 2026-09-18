// 📖 Docs: obsidian/frontend/components/common.md
/**
 * A chapter travelling over the film — the `negantropy` corner-loaded
 * skeleton, mirrored chapter to chapter.
 *
 * The heading anchors to the bottom of one side across seven columns; a
 * bracketed index, a short rule and the body start higher on the other side in
 * four. Alternating the anchor side is what keeps the long scroll from feeling
 * static: the eye crosses the frame once per chapter.
 *
 * Type resolves through `spring-text-engine`, once, as the chapter enters the
 * viewport — the heading letter by letter, the body word by word — because
 * this layer scrolls and has movement for the engine to measure. On a portrait
 * window the two columns stack: index, body, then the heading.
 */

import { easings } from "@react-spring/web";
import TextEngine from "spring-text-engine";

import type { ChapterSide } from "@/data/mocks/home";

export interface ChapterProps {
  index: string;
  meta: string;
  heading: string;
  body: string;
  side: ChapterSide;
  /** Which viewport of the runway this chapter occupies, counting the first screen as 0. */
  screen: number;
}

export const Chapter = ({
  index,
  meta,
  heading,
  body,
  side,
  screen,
}: ChapterProps) => {
  const left = side === "left";

  return (
    <article
      className="o-pointer-events-none o-absolute o-inset-x-0 at-h-lvh"
      style={{ top: `${screen * 100}lvh` }}
    >
      {/* The foot clears the floating pill, which sits on the gutter below. */}
      <div className="o-grid o-h-full o-grid-cols-12 o-items-end at-gap-x-2vw at-px-frame-gutter at-pb-calc-var-frame-gutter-var-frame-control-4lvh at-stacked-flex at-stacked-flex-col at-stacked-items-start at-stacked-justify-end at-stacked-gap-6">
        <div
          className={`o-row-start-1 o-flex o-flex-col at-gap-1vw o-self-end at-pb-9vw at-stacked-order-1 at-stacked-items-start at-stacked-self-start at-stacked-gap-3 at-stacked-pb-0 at-stacked-text-left ${
            left
              ? "o-col-span-4 at-col-start-9 o-items-end o-text-right"
              : "o-col-span-4 o-col-start-1 o-items-start o-text-left"
          }`}
        >
          <p className="o-flex o-items-center o-gap-3 at-font-sans at-text-frame-caption o-uppercase at-tracking-0-24em at-text-foreground-muted-80">
            <span>( {index} )</span>
            <span aria-hidden="true" className="o-h-px at-w-3vw at-bg-line-30" />
            <span>{meta}</span>
          </p>
          <TextEngine
            tag="p"
            mode="once"
            className={`at-max-w-30ch at-font-sans at-text-frame-body at-leading-1-5 at-text-foreground-muted ${
              left ? "o-justify-end o-text-right at-stacked-justify-start at-stacked-text-left" : "o-justify-start o-text-left"
            }`}
            wordIn={{ y: 0, opacity: 1 }}
            wordOut={{ y: 18, opacity: 0 }}
            wordStagger={22}
            wordConfig={{ duration: 700, easing: easings.easeOutQuart }}
            delayIn={260}
          >
            {body}
          </TextEngine>
        </div>

        <TextEngine
          tag="h2"
          mode="once"
          overflow
          className={`o-row-start-1 at-font-display at-text-5-6vw at-leading-display at-tracking-0-02em at-text-foreground at-stacked-order-2 at-stacked-justify-start at-stacked-text-left at-stacked-text-11vw ${
            left
              ? "o-col-span-8 o-col-start-1 o-justify-start o-text-left"
              : "o-col-span-8 o-col-start-5 o-justify-end o-text-right"
          }`}
          // The clip box needs the leading floor; the design wants tighter. The
          // wrap layer gets the room and the layout takes it back.
          wrapWordClassName="at-py-0-15em at--my-0-15em"
          letterIn={{ y: 0, opacity: 1 }}
          letterOut={{ y: 44, opacity: 0 }}
          letterStagger={26}
          letterConfig={{ duration: 900, easing: easings.easeOutCubic }}
        >
          {heading}
        </TextEngine>
      </div>
    </article>
  );
};
