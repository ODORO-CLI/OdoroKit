/**
 * One scroll chapter over the film — a full viewport with its content sunk
 * into the bottom band of a 12-column grid.
 *
 * `left` is `negantropy-entropy`: the heading anchors bottom-left across seven
 * columns while the bracketed meta and a short right-aligned body start at the
 * heading's top line in the narrow right column. `right` is its mirror
 * (`negantropy-choice`). `center` breaks the corner-loaded rhythm on purpose —
 * `negantropy-persist` — so the closing beat reads as arrival and the CTA gets
 * the whole axis.
 *
 * 📖 Docs: obsidian/frontend/sections.md
 */

import TextEngine from "spring-text-engine";

import { Inview } from "@/components/animation/springs/in-view";
import { ActionLink } from "@/components/ui/action-link";
import { LINE_REVEAL, RISE } from "@/lib/motion/reveals";

import type { ChapterAlign, FilmChapter as FilmChapterContent } from "./film.types";

/**
 * Column placement per alignment. Literal strings, for the generator's scanner.
 * Below the desktop base the two columns stack: meta first, heading under it.
 */
const LAYOUT: Record<
  Exclude<ChapterAlign, "center">,
  { heading: string; line: string; meta: string }
> = {
  left: {
    heading: "o-col-span-7 max-lg:o-order-2 jo-max-lg-col-span-12",
    line: "o-justify-start o-text-left",
    meta: "o-col-span-4 jo-col-start-9 o-items-end o-text-right jo-max-lg-order-1 jo-max-lg-col-span-12 jo-max-lg-col-start-1 jo-max-lg-items-start jo-max-lg-text-left",
  },
  right: {
    heading: "o-col-span-7 o-col-start-6 o-order-2 jo-max-lg-col-span-12 jo-max-lg-col-start-1",
    line: "o-justify-end o-text-right max-lg:o-justify-start jo-max-lg-text-left",
    meta: "o-col-span-4 o-order-1 o-items-start o-text-left jo-max-lg-col-span-12",
  },
};

const headingType =
  "jo-text-headline jo-leading-headline jo-text-foreground-accent jo-font-display jo-max-md-text-40px jo-max-md-leading-40px";

/** Between one heading line's arrival and the next, in ms. */
const LINE_DELAY = 140;

export interface FilmChapterProps {
  chapter: FilmChapterContent;
}

const metaClass =
  "jo-font-ui jo-text-caption jo-leading-caption jo-text-foreground-accent-muted text-trim o-flex o-items-center jo-gap-md o-uppercase jo-tracking-0-14em";

const Meta = ({
  chapter,
  className,
}: {
  chapter: FilmChapterContent;
  className: string;
}) => (
  <div className={`o-flex o-flex-col ${className}`}>
    <Inview tag="p" mode="once" className={metaClass} {...RISE}>
      <span>{chapter.numeral}</span>
      <span aria-hidden className="jo-bg-line-strong o-block o-h-px jo-w-2rem" />
      <span>{chapter.label}</span>
    </Inview>
    <Inview
      tag="p"
      mode="once"
      delayIn={120}
      className="jo-text-lead jo-leading-lead jo-text-foreground-accent-strong jo-font-ui jo-mt-lg jo-max-w-22rem"
      {...RISE}
    >
      {chapter.body}
    </Inview>
  </div>
);

const Heading = ({
  chapter,
  className,
  lineClassName,
}: {
  chapter: FilmChapterContent;
  /** The heading's own box — grid placement. */
  className: string;
  /** Each line's alignment: a TextEngine container is a flex row, so it
   *  needs `justify-*` as well as `text-*`. */
  lineClassName: string;
}) => (
  <h3 className={`${headingType} ${className}`}>
    {/* One engine per designed line; the second continues the first's delay
        so the two still read as one sweep. */}
    {chapter.heading.map((line, index) => (
      <TextEngine
        key={line}
        tag="span"
        mode="once"
        delayIn={index * LINE_DELAY}
        className={`o-block ${lineClassName}`}
        {...LINE_REVEAL}
      >
        {line}
      </TextEngine>
    ))}
  </h3>
);

export const FilmChapter = ({ chapter }: FilmChapterProps) => {
  if (chapter.align === "center") {
    return (
      <div className="min-h-viewport jo-px-page jo-pb-stack jo-pt-section o-flex o-flex-col o-items-center o-justify-center o-text-center jo-max-md-pb-page">
        <Inview tag="p" mode="once" className={metaClass} {...RISE}>
          <span>{chapter.numeral}</span>
          <span aria-hidden className="jo-bg-line-strong o-block o-h-px jo-w-2rem" />
          <span>{chapter.label}</span>
        </Inview>

        <Heading
          chapter={chapter}
          className="jo-mt-xl jo-max-w-44rem"
          lineClassName="o-justify-center o-text-center"
        />

        <Inview
          tag="p"
          mode="once"
          delayIn={200}
          className="jo-text-lead jo-leading-lead jo-text-foreground-accent-strong jo-font-ui jo-mt-lg jo-max-w-28rem"
          {...RISE}
        >
          {chapter.body}
        </Inview>

        {chapter.cta ? (
          <Inview tag="p" mode="once" delayIn={360} className="jo-mt-xl" {...RISE}>
            <ActionLink href={chapter.cta.href} variant="pill">
              {chapter.cta.label}
            </ActionLink>
          </Inview>
        ) : null}
      </div>
    );
  }

  const layout = LAYOUT[chapter.align];

  return (
    <div className="min-h-viewport jo-px-page jo-pb-stack jo-pt-section o-grid o-grid-cols-12 o-content-end jo-gap-x-lg jo-gap-y-xl jo-max-md-pb-page">
      <Meta chapter={chapter} className={layout.meta} />
      <Heading
        chapter={chapter}
        className={layout.heading}
        lineClassName={layout.line}
      />
    </div>
  );
};
