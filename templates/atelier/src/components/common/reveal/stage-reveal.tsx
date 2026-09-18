// 📖 Docs: obsidian/frontend/components/common.md

/**
 * Type that resolves unit by unit, in the DOM, from its layer's own reveal.
 *
 * **It animates nothing itself.** Every unit's opacity is a `calc()` over one
 * custom property, `--stage-reveal`, which the layer above it writes as it
 * arrives (a `<Spring>` or `<Inview>` with `from={{ "--stage-reveal": 0 }}`).
 * One number in, and each unit works out its own share of it: no second clock,
 * no per-frame JavaScript per word, and it survives a re-render because it is
 * only ever CSS.
 *
 * The order is scrambled by a fixed hash, so a line resolves unpredictably but
 * *identically* on every arrival: a heading that came back differently the
 * second time would read as a glitch, not as a flourish.
 *
 * Why this is not `spring-text-engine`: the wordmark sits on the opening
 * curtain and on a pinned film, where the engine's scroll-driven modes have no
 * movement to measure, and the only mode that takes an external value is
 * `manual`, which is a hard rule against. Everything that scrolls uses the
 * engine.
 */

import type { CSSProperties, ElementType } from "react";

import { revealConfig } from "@/lib/reveal/reveal.config";

/** A unit's place in the scrambled order, 0-1. */
const shuffledSeed = (index: number): number => {
  const hash = Math.sin(index * 127.1 + 311.7) * 43758.5453;
  return hash - Math.floor(hash);
};

/** Split into words (keeping their spaces attached) or into letters. */
const splitUnits = (text: string, unit: "word" | "letter"): string[] =>
  unit === "word" ? text.split(/(?<=\s)/) : [...text];

export interface StageRevealProps {
  children: string;
  /** What resolves at a time. Display type takes letters, copy takes words. */
  unit?: "word" | "letter";
  /**
   * What a unit is worth before the reveal reaches it, 0–1. Zero is type that
   * is not there yet; a floor is type that is there and not yet inked in.
   */
  floor?: number;
  tag?: ElementType;
  id?: string;
  className?: string;
  /** For the block's own rise — see `stageRise`. */
  style?: CSSProperties;
}

export const StageReveal = ({
  children,
  unit = "word",
  floor = 0,
  tag: Tag = "span",
  id,
  className,
  style,
}: StageRevealProps) => {
  const units = splitUnits(children, unit);
  const { spread } = revealConfig;
  const own = Math.max(0.0001, 1 - spread);

  return (
    <Tag id={id} className={className} style={style}>
      {/* The real string, for assistive technology and for a crawler. */}
      <span className="o-sr-only">{children}</span>
      <span aria-hidden="true">
        {units.map((piece, index) => (
          <span
            key={`${index}-${piece}`}
            className="o-inline-block o-whitespace-pre"
            style={{
              opacity: `max(${floor}, calc((var(--stage-reveal, 1) - ${(
                shuffledSeed(index) * spread
              ).toFixed(4)}) / ${own.toFixed(4)}))`,
            }}
          >
            {piece}
          </span>
        ))}
      </span>
    </Tag>
  );
};
