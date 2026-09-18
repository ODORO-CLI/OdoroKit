// 📖 Docs: obsidian/frontend/components/ui.md

import TextEngine from "spring-text-engine";

import {
  CLIP_LAYER,
  REVEAL_TIMING,
  RISE_BLUR,
  type RevealTiming,
} from "@/lib/springs/presets";

export interface RevealLinesProps {
  tag: "p" | "h2" | "h3";
  /** Forced lines — the source set these as one `<span>` per line. */
  lines: readonly string[];
  /** The reveal plays while true and resets instantly when it drops. */
  active: boolean;
  timing: RevealTiming;
  /** Rise from under the line's clip (labels, headings) or float up freely (quote). */
  clip?: boolean;
  /** Shifts the in-view test, e.g. `0px 0px -15% 0px` to wait until 85% down. */
  rootMargin?: string;
  id?: string;
  className?: string;
  /**
   * Classes for each line's TextEngine container. It is a flex row, so
   * alignment is `justify-*` here — `text-center` on the tag alone does nothing.
   */
  engineClassName?: string;
}

/**
 * Letter-by-letter rise for multi-line copy, one TextEngine per forced line
 * with the stagger carried across lines — the source indexed its letters
 * continuously, so line two starts where line one's last letter left off.
 *
 * Screen readers and crawlers get the plain sentence once, from the `sr-only`
 * copy; the split letters are hidden from them.
 */
export const RevealLines = ({
  tag: Tag,
  lines,
  active,
  timing,
  clip = true,
  rootMargin,
  id,
  className = "",
  engineClassName = "",
}: RevealLinesProps) => {
  const { stagger, config } = REVEAL_TIMING[timing];
  const delays = lines.map((_, index) =>
    lines.slice(0, index).reduce((sum, line) => sum + line.length * stagger, 0),
  );

  return (
    <Tag id={id} className={className}>
      <span className="o-sr-only">{lines.join(" ")}</span>
      <span aria-hidden className="o-flex o-flex-col">
        {lines.map((line, index) => (
          <TextEngine
            key={line}
            tag="span"
            mode="always"
            enabled={active}
            rootMargin={rootMargin}
            seo={false}
            overflow={clip}
            letterIn={RISE_BLUR.letterIn}
            letterOut={RISE_BLUR.letterOut}
            wrapWordIn={clip ? CLIP_LAYER : {}}
            wrapWordOut={clip ? CLIP_LAYER : {}}
            letterStagger={stagger}
            letterConfig={config}
            delayIn={delays[index]}
            columnGap={0.28}
            className={`cb-leading-display ${engineClassName}`}
            // The source's soft floor: a little room under the clip, faded out.
            wrapWordClassName={clip ? "cb--mb-3-5 o-pb-4 cb-mask-b-from-45" : undefined}
          >
            {line}
          </TextEngine>
        ))}
      </span>
    </Tag>
  );
};
