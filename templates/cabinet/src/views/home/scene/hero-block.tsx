import { animated, type SpringValue } from "@react-spring/web";
import { useMemo, type RefObject } from "react";
import TextEngine from "spring-text-engine";

import type { HeroBlockContent, HeroSlot } from "@/data/mocks/home";
import { HERO_INTRO, SCROLL_LETTER, SLIDE_BLUR } from "@/lib/springs/presets";
import {
  PHASE,
  exitFilter,
  exitOpacity,
  exitTransform,
  heroDescriptionOpacity,
  heroThreeOpacity,
  heroVisibility,
} from "@/utils/timeline/scene";

export interface HeroBlockProps {
  block: HeroBlockContent;
  index: 0 | 1 | 2;
  /** L'horloge amortie de la scene — ne sert ici qu'au bloc trois, qui s'assombrit avec le canevas. */
  p: SpringValue<number>;
  /** La molette brute, la meme horloge que les lettres. Visibilite, sortie, description. */
  heroClock: SpringValue<number>;
  /** Block one plays its entrance once the preloader lifts. */
  introReady: boolean;
  /** Blocks two and three scrub their letters against a phase marker. */
  trigger?: RefObject<HTMLElement>;
}

/**
 * Word positions. They go on a wrapper, never on the TextEngine itself: the
 * engine writes `position: relative` inline on its container, which beats an
 * `absolute` class and turns these offsets into nudges. Phones drop the top
 * words below the quote link and lift the bottom ones clear of the copy.
 */
const SLOT: Record<HeroSlot, string> = {
  "top-left": "o-left-10 o-top-10 max-md:o-left-6 max-md:o-top-24",
  "top-right": "o-right-10 o-top-10 max-md:o-right-6 max-md:o-top-24",
  "center-left": "o-left-10 o-top-1/2 cb--translate-y-1-2 max-md:o-left-6",
  "center-right": "o-right-10 o-top-1/2 cb--translate-y-1-2 max-md:o-right-6",
  center: "o-left-1/2 o-top-1/2 cb--translate-1-2",
  "bottom-left": "o-bottom-10 o-left-10 cb-max-md-bottom-52 max-md:o-left-6",
  "bottom-right": "o-bottom-10 o-right-10 cb-max-md-bottom-52 max-md:o-right-6",
};

const EXIT = [PHASE.heroOneExit, PHASE.heroTwoExit, null] as const;

const WORD_TYPE =
  "cb-font-display o-font-medium cb-text-display-phone cb-leading-hero cb-tracking-display cb-sm-text-display-tablet cb-lg-text-display";

/**
 * One of the three statement blocks over the frame sequence. Letters enter
 * through TextEngine; the block leaves as a whole, sliding left into a blur on
 * the shared timeline.
 */
export const HeroBlock = ({ block, index, p, heroClock, introReady, trigger }: HeroBlockProps) => {
  const exit = EXIT[index];
  const s = useMemo(
    () => ({
      visibility: heroClock.to(heroVisibility(index)),
      opacity: index === 2 ? p.to(heroThreeOpacity) : 1,
      description: heroClock.to(heroDescriptionOpacity[index]),
      exit: exit
        ? {
            opacity: heroClock.to(exitOpacity(exit)),
            transform: heroClock.to(exitTransform(exit)),
            filter: heroClock.to(exitFilter(exit)),
          }
        : undefined,
    }),
    [p, heroClock, index, exit],
  );
  const Heading = index === 0 ? "h1" : "h2";

  return (
    <animated.div
      className="o-pointer-events-none o-absolute o-inset-0 cb-z-5"
      style={{ visibility: s.visibility, opacity: s.opacity }}
    >
      <Heading className="o-absolute o-inset-0">
        <span className="o-sr-only">{block.words.map((word) => word.text).join(" ")}</span>
        <animated.span aria-hidden className="o-absolute o-inset-0" style={s.exit}>
          {block.words.map((word) => (
            <span key={word.text} className={`o-absolute ${SLOT[word.slot]}`}>
              {index === 0 ? (
                <TextEngine
                  tag="span"
                  mode="once"
                  enabled={introReady}
                  seo={false}
                  {...SLIDE_BLUR}
                  letterStagger={HERO_INTRO.span / word.text.length}
                  letterConfig={HERO_INTRO.config}
                  className={WORD_TYPE}
                >
                  {word.text}
                </TextEngine>
              ) : (
                // `toggle`, not `interpolate`: see SCROLL_LETTER — every
                // letter is out at progress 0, so nothing shows early.
                <TextEngine
                  tag="span"
                  mode="progress"
                  type="toggle"
                  trigger={trigger}
                  start="top top"
                  end="bottom bottom"
                  seo={false}
                  {...SLIDE_BLUR}
                  letterConfig={SCROLL_LETTER}
                  className={WORD_TYPE}
                >
                  {word.text}
                </TextEngine>
              )}
            </span>
          ))}
        </animated.span>
      </Heading>

      <animated.p
        className={`o-absolute o-bottom-10 o-w-80 cb-text-body-phone cb-leading-copy cb-tracking-copy cb-text-foreground-70 cb-sm-text-body cb-max-md-inset-x-6 cb-max-md-bottom-28 max-md:o-w-auto ${
          block.descriptionSide === "right"
            ? "o-right-10 o-text-right max-md:o-text-left"
            : "o-left-10 o-text-left"
        }`}
        style={{ opacity: s.description }}
      >
        {block.description}
      </animated.p>
    </animated.div>
  );
};
