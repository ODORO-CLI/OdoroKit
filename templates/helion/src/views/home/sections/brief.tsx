import { animated } from "@react-spring/web";
import TextEngine from "spring-text-engine";

import { Inview } from "@/components/animation/springs/in-view";
import { useSceneFade } from "@/hooks/sections/use-scene-fade";
import { screens } from "@/lib/scene/screens";
import { cubicBezier } from "@/utils/animation/easing";
import type { BriefContent } from "@/data/mocks/home";

/**
 * Brief — "01 · Roadmap", three engagement phases read as a **timeline rail**:
 * a single hairline runs down the left of the content column and each phase is a
 * station on it — a decorative marker sits on the rail, its content left-aligned
 * to the right. No alternation; the rail is what connects the stations.
 *
 * The original faded each block in once via an IntersectionObserver that added
 * `.-in`, then staggered a stage's children with SCSS `transition-delay`. Here
 * every block is an `<Inview mode="once">`, which observes its own element, and
 * the per-child stagger is reproduced as `delayIn`. The heading is genuine
 * word-by-word text motion, so it goes through `TextEngine` (its words carried a
 * `--i` custom-property stagger the observer could not express).
 *
 * Unlike Hero, this slide does not stay pinned: the section is `position: static`
 * (`views/home.tsx` gives the `<Slide>` `sticky={false}`) so the stations scroll
 * past naturally across the 2.5-viewport slide that lends the terrain its travel.
 */

/** SCSS `$briefEase` — `cubic-bezier(0.22, 1, 0.36, 1)`, not the Hero reveal curve. */
const briefEase = cubicBezier(0.22, 1, 0.36, 1);
/** Every original reveal ran at `transition: ... .7s`. */
const REVEAL = { duration: 700, easing: briefEase } as const;

/** `.brief__kicker { transition-delay: 140ms }`. */
const KICKER_DELAY = 140;
/** Heading words: `calc(var(--i) * 55ms + 240ms)`. */
const WORD_BASE_DELAY = 240;
const WORD_STAGGER = 55;
/** Body waits on the heading: `calc(var(--wc) * 55ms + 340ms)`. */
const BODY_BASE_DELAY = 340;

export interface BriefProps {
  content: BriefContent;
}

export const Brief = ({ content }: BriefProps) => {
  const fade = useSceneFade(screens.ROADMAP);

  return (
    <section
      id="brief"
      aria-label={content.chapter}
      /* `static` opts out of the sticky pin the other slides use — Brief's
         stations flow naturally through its 2.5-viewport slide. The inter-slide
         gap lives on the `<Slide>` anchor, not here. */
      className="o-relative o-static o-flex o-min-h-screen o-w-full o-flex-col o-items-start hl-pt-16vh hl-pb-6vh hl-max-hero-xs-pt-12vh hl-max-hero-xs-pb-8vh"
    >
      <animated.div
        style={fade}
        className="page-gutter o-flex o-w-full hl-max-w-53rem o-flex-col"
      >
        {/* The rail: one hairline down the left of the whole content column.
            Markers sit on it (`li` left edge), content is padded off it. */}
        <div className="o-relative o-w-full o-border-l hl-border-accent-500-20">
          {/* Chapter label — the head of the rail, above the first station. */}
          <Inview
            tag="p"
            mode="once"
            from={{ opacity: 0, y: 20 }}
            to={{ opacity: 1, y: 0 }}
            config={REVEAL}
            className="o-m-0 hl-pl-3-25rem o-font-sans hl-text-0-6875rem-none o-font-medium hl-tracking-0-34em hl-text-accent-500-85 o-uppercase hl-max-md-pl-2-25rem hl-max-hero-xs-pl-1-75rem hl-max-hero-xs-text-0-625rem hl-max-hero-xs-tracking-0-3em"
          >
            {content.chapter}
          </Inview>

          <ol className="hl-mt-10vh o-flex o-flex-col hl-gap-34vh hl-max-md-gap-26vh">
            {content.phases.map((phase) => {
              const wordCount = phase.heading.split(" ").length;

              return (
                <li
                  key={phase.num}
                  className="o-relative hl-pl-3-25rem hl-max-md-pl-2-25rem hl-max-hero-xs-pl-1-75rem"
                >
                  {/* Station marker — a small ringed dot sitting on the rail.
                      Purely decorative, so it leaves the reading order. */}
                  <span
                    aria-hidden="true"
                    className="o-absolute hl-top-3-25rem o-left-0 hl-size-0-4375rem hl-translate-x-1-2 o-rounded-full hl-bg-accent-500-80 hl-ring-1 hl-anneau-accent hl-max-hero-md-top-2-5rem hl-max-hero-xs-top-2rem"
                  />

                  <article className="o-relative o-flex o-flex-col hl-pt-3rem hl-max-hero-md-pt-2-25rem hl-max-hero-xs-pt-1-75rem">
                    {/* Ghosted numeral — a large, low-alpha index sitting behind
                        the kicker. Decorative, hidden from the reading order. */}
                    <Inview
                      tag="span"
                      mode="once"
                      from={{ opacity: 0, y: 22 }}
                      to={{ opacity: 1, y: 0 }}
                      config={REVEAL}
                      aria-hidden="true"
                      className="o-pointer-events-none o-absolute o-top-0 o-left-0 o-block hl-font-lato hl-text-7rem-0-8 o-font-normal hl-tracking-0-02em hl-text-accent-500-15 o-select-none hl-max-hero-md-text-5rem hl-max-hero-xs-text-3-5rem"
                    >
                      {phase.num}
                    </Inview>

                    <Inview
                      tag="p"
                      mode="once"
                      from={{ opacity: 0, y: 22 }}
                      to={{ opacity: 1, y: 0 }}
                      delayIn={KICKER_DELAY}
                      config={REVEAL}
                      className="o-relative hl-mb-1-125rem o-font-sans hl-text-xs-none o-font-semibold hl-tracking-0-34em hl-text-accent-500 o-uppercase hl-max-hero-xs-text-0-6875rem hl-max-hero-xs-tracking-0-3em"
                    >
                      {phase.kicker}
                    </Inview>

                    {/* Word-by-word lift — `y` stays numeric (px) in both states
                        so the spring never crosses value types. */}
                    <TextEngine
                      tag="h2"
                      mode="once"
                      wordIn={{ y: 0, opacity: 1 }}
                      wordOut={{ y: 22, opacity: 0 }}
                      wordStagger={WORD_STAGGER}
                      delayIn={WORD_BASE_DELAY}
                      wordConfig={REVEAL}
                      className="o-relative o-m-0 o-max-w-full hl-font-lato hl-text-2-875rem-1-18 o-font-normal hl-tracking-0-005em o-text-balance hl-text-foreground hl-max-hero-md-text-2rem hl-max-hero-md-leading-1-2 hl-max-hero-xs-text-1-625rem"
                    >
                      {phase.heading}
                    </TextEngine>

                    <Inview
                      tag="p"
                      mode="once"
                      from={{ opacity: 0, y: 22 }}
                      to={{ opacity: 1, y: 0 }}
                      delayIn={wordCount * WORD_STAGGER + BODY_BASE_DELAY}
                      config={REVEAL}
                      className="o-relative hl-mt-1-5rem hl-max-w-54ch o-font-sans hl-fs-base-17 o-font-normal hl-text-foreground-72 hl-max-hero-md-text-sm hl-max-hero-xs-text-0-84375rem hl-max-hero-xs-leading-1-65"
                    >
                      {phase.body}
                    </Inview>
                  </article>
                </li>
              );
            })}
          </ol>
        </div>
      </animated.div>
    </section>
  );
};
