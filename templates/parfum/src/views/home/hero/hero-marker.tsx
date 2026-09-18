import { Spring } from "@/components/animation/springs/spring";
import { ScrambleText } from "@/components/ui/scramble-text";

import { HERO_REVEAL } from "./hero.motion";
import type { HeroMarkerContent } from "./hero.types";

export interface HeroMarkerProps extends HeroMarkerContent {
  /** `start` pins to the left margin, `end` mirrors the block to the right. */
  align: "start" | "end";
}

const BRACKET = "/assets/hero/hero-bracket.svg";

const GEOMETRY = {
  start: {
    block: "o-items-start pf-lg-left-10 pf-lg-w-39",
    line: "o-text-left",
    cornerTop: "",
    cornerBottom: "pf--scale-y-100",
  },
  end: {
    block: "o-items-end pf-lg-right-10 pf-lg-w-46-25",
    line: "o-text-right",
    cornerTop: "pf--scale-x-100",
    cornerBottom: "pf--scale-100",
  },
} as const;

/**
 * Bracketed edge statement (Figma 902:333 / 902:337).
 *
 * The frame mirrors one block onto the right edge, so the corner glyph is a
 * single asset flipped per position rather than four separate exports.
 */
export const HeroMarker = ({ align, lines }: HeroMarkerProps) => {
  const geometry = GEOMETRY[align];

  return (
    <div
      className={`o-flex o-flex-1 o-flex-col o-gap-4 pf-text-hero-content pf-lg-absolute pf-lg-top-1-2 pf-lg-z-10 pf-lg-flex-none pf-lg-translate-y-1-2 pf-lg-gap-6 ${geometry.block}`}
    >
      <Spring
        tag="div"
        mode="once"
        from={{ opacity: 0 }}
        to={{ opacity: 1 }}
        delayIn={120}
        className={`o-size-2 pf-sm-size-2-75 ${geometry.cornerTop}`}
      >
        <img
          src={BRACKET}
          alt=""
          width={11}
          height={11}
          priority
          aria-hidden
        />
      </Spring>

      <p
        className={`o-w-full pf-text-hero-chip pf-leading-hero-display pf-sm-text-hero-body pf-md-text-hero-lede pf-lg-text-hero-body ${geometry.line}`}
      >
        {lines.map((line, index) => (
          <ScrambleText
            key={line}
            className="o-block"
            revealDelay={HERO_REVEAL.marker + index * HERO_REVEAL.markerStep}
          >
            {line}
          </ScrambleText>
        ))}
      </p>

      <Spring
        tag="div"
        mode="once"
        from={{ opacity: 0 }}
        to={{ opacity: 1 }}
        delayIn={120}
        className={`o-size-2 pf-sm-size-2-75 ${geometry.cornerBottom}`}
      >
        <img
          src={BRACKET}
          alt=""
          width={11}
          height={11}
          priority
          aria-hidden
        />
      </Spring>
    </div>
  );
};
