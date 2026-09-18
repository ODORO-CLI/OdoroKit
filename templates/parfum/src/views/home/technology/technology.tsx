import { Fragment } from "react";
import type { CSSProperties } from "react";

import { Inview } from "@/components/animation/springs/in-view";
import { NearViewport } from "@/components/common/near-viewport";
import { ScrambleText } from "@/components/ui/scramble-text";

import { TechnologyReel } from "./technology-reel";
import { TechnologyStack } from "./technology-stack";
import { regionHeight } from "./technology.motion";
import type { TechnologyContent } from "./technology.types";

export interface TechnologyProps {
  content: TechnologyContent;
}

const HEADING_ID = "technology-heading";

/**
 * Technology section — Figma file WINXFW2nTM7zYwd5dGgm1T, nodes 1748:1155 and
 * 1924:2259 / 2285 / 2311 / 2337, the fourth block of the concept.
 *
 * A Server Component; the scroll-driven part is a client leaf.
 *
 * **Five frames, one composition.** The frames are states, not sections: the
 * heading, standfirst and stack are identical in all five and only the card
 * moves. So the section is one pinned stage and the region is tall enough to
 * contain the walk — one viewport for the stage plus 0.7 per remaining layer,
 * which is what `regionHeight` computes. The stage sticks for exactly the
 * difference, so the card reaches the last layer as the region ends.
 *
 * As with the other blocks, **the frame's header is not rebuilt** — each Figma
 * frame is a standalone artboard carrying it; the page has one banner.
 *
 * Below `lg` there is no pinning and no walk: the stack sits in the flow and
 * all five specifications follow it as a plain stack of cards. Pinning a
 * viewport-tall stage on a phone and asking for three screens of scrolling to
 * read five short paragraphs is a worse reading of the same content.
 */
export const Technology = ({ content }: TechnologyProps) => (
  <section
    aria-labelledby={HEADING_ID}
    // **Measured in frames, not in viewports.** The stage the walk pins is one
    // frame tall, so the region that contains it has to be counted in the same
    // unit — with `100lvh` the region outran the walk on any screen that is not
    // 1.8:1 and left dead scroll at the end of it. Measured, the run of empty
    // lattice between this screen and the FAQ was 34% of a screen at 1280 and
    // 57% at 1024, against 22% at 1440.
    //
    // The region has to be tall enough to contain the walk; the stage inside
    // sticks for exactly the difference. Expressed as a custom property so the
    // number lives with the motion constants rather than in a class string.
    className="o-relative o-w-full pf-font-mono pf-text-hero-content pf-lg-h-calc-var-technology-region-50rem"
    style={
      {
        "--technology-region": regionHeight(content.layers.length),
      } as CSSProperties
    }
  >
    <div className="o-flex o-flex-col o-gap-10 o-px-5 o-py-16 pf-lg-sticky pf-lg-top-0 pf-lg-block pf-lg-h-200 pf-lg-gap-0 pf-lg-px-0 pf-lg-py-0">
      {/* The box fills the pinned stage rather than being centred in it, and for
          the same reason the hero's does: **everything here hangs off the top**
          — the headline, the walking card, the closing note — so there is no
          pair to drift and no reason to hold a margin above the headline. On a
          screen taller than the frame the slack falls to the bottom of a stage
          that is pinned to the viewport, where nothing is looking. Centring it
          instead pushed the headline down and opened a visibly wider gap where
          the collections screen hands over: measured 28% of a screen at 1280
          against 22% at 1440. */}
      <div className="max-lg:o-contents pf-lg-absolute pf-lg-inset-0">
        {/* Heading and lede are one group below the frame. In the frame they sit
            at opposite ends of the screen — top-left and bottom-left, with the
            stack between them — and that reads as composition. In flow the same
            arrangement put the whole card list between a heading and the
            sentence that introduces it. `pf-lg-contents` dissolves this wrapper at
            the frame breakpoint, so both keep their own frame coordinates. */}
        <div className="o-flex o-flex-col o-gap-4 pf-lg-contents">
          <Inview
            tag="h2"
            id={HEADING_ID}
            mode="once"
            from={{ opacity: 0, y: 20 }}
            to={{ opacity: 1, y: 0 }}
            // The lines are **inline** with a `<br>`, not flex items. `text-box:
            // trim-both` trims a block container's own first and last line boxes,
            // and a flex parent has no text of its own to trim — the declaration is
            // simply inert there, which put every line 10px low against the frame.
            className="pf-text-hero-display-compact pf-leading-hero-headline pf-tracking-hero-display pf-text-hero-content pf--text-box-trim-both-cap-alphabetic pf-sm-text-hero-display-tablet pf-lg-text-hero-display pf-lg-absolute pf-lg-top-34 pf-lg-left-10 pf-lg-z-10 pf-lg-w-91-75"
          >
            {content.heading.map((line, index) => (
              <Fragment key={line}>
                {index > 0 ? <br aria-hidden /> : null}
                <ScrambleText revealInView tieProse>
                  {line}
                </ScrambleText>
              </Fragment>
            ))}
          </Inview>
          <Inview
            tag="p"
            mode="once"
            from={{ opacity: 0 }}
            to={{ opacity: 1 }}
            delayIn={120}
            className="pf-text-hero-body pf-leading-hero-prose pf-text-hero-content-muted o-uppercase pf-max-sm-prose-even pf-sm-text-hero-lede pf-lg-absolute pf-lg-top-162-5 pf-lg-left-10 pf-lg-z-10 pf-lg-w-91-75"
          >
            {/* **One paragraph below the frame, three lines in it.** The frame
              sets this note as three measured lines against a 367-unit column,
              and those breaks are part of its composition. In flow they are
              breaks against nothing: the first line ended a third of the way
              across and left a hole the eye reads as a missing word. Hidden,
              the `br` stops breaking and the sentences run on and wrap where
              the column actually ends. */}
            {content.lede.map((line, index) => (
              <Fragment key={line}>
                {index > 0 ? (
                  <>
                    <br aria-hidden className="max-lg:o-hidden" />{" "}
                  </>
                ) : null}
                <ScrambleText
                  tieProse
                  revealInView
                  revealDelay={140 + index * 60}
                >
                  {line}
                </ScrambleText>
              </Fragment>
            ))}
          </Inview>
        </div>

        {/* **The stack is a clip now, and its motion is the scroll scrub** — so
            the reveal that used to wrap this box is gone, and the box is centred
            with auto margins rather than `pf--translate-x-1-2`.

            Both went for a `mix-blend-mode` that turned out not to work in this
            section at all: the stage above is pinned with `position: sticky`,
            which creates a stacking context, and a blend can only reach the
            backdrop inside one. The clip's black ground is keyed at export
            instead — the frames and the poster both carry a real alpha channel,
            and nothing on this stage runs a filter at runtime (ADR-0046, as
            amended by ADR-0049). Keeping the reveal and the translate
            out is still right — the scrub is the motion, and a transform here
            would isolate whatever a later pass tries.

            Four fifths of the column below the frame, centred. `o-object-contain`
            means the artwork was never cropped at full width — it simply ran
            edge to edge, and an exploded stack needs ground around it to read
            as one object rather than as a pattern. */}
        <div className="o-relative o-mx-auto o-aspect-square o-w-4/5 pf-sm-aspect-4-3 pf-lg-absolute pf-lg-top-34 pf-lg-inset-x-0 pf-lg-aspect-auto pf-lg-h-154-75 pf-lg-w-166-25">
          {/* Twelve megabytes, seven screens from the top of the page: built
              when the section is near, like the FAQ's product. */}
          <NearViewport className="o-size-full" lead={1}>
            <TechnologyReel
              content={content.stack}
              className="o-size-full o-object-contain"
            />
          </NearViewport>
        </div>

        {/* The walk, and the five cards it steps through. Absolute against this
            stage, so it needs the stage to be the positioned ancestor. */}
        <div className="o-hidden pf-lg-block">
          <TechnologyStack layers={content.layers} />
        </div>

        {/* Below the frame breakpoint the same five specifications are simply a
            stack in the flow — see the note on the section. */}
        <ol className="o-grid o-grid-cols-1 o-gap-3 sm:o-grid-cols-2 pf-sm-li-last-child-col-span-2 pf-lg-hidden">
          {content.layers.map((layer, index) => (
            <Inview
              tag="li"
              key={layer.index}
              mode="once"
              from={{ opacity: 0, y: 16 }}
              to={{ opacity: 1, y: 0 }}
              delayIn={index * 80}
              // Stretched by the card, so a row's marks share one line — see
              // `details-feature.tsx`.
              className="hero-lattice-panel o-flex o-items-start o-gap-6 o-border-w-1 pf-border-hero-rule o-p-4"
            >
              <div className="o-flex o-flex-col o-items-start o-justify-between o-self-stretch">
                {/* Flush with the mark's left edge — see
                    `details-feature.tsx`. */}
                <span
                  aria-hidden
                  className="pf-text-hero-body pf-leading-hero-display pf-text-hero-content-faint"
                >
                  {layer.index}
                </span>
                <img
                  src={layer.icon.src}
                  alt={layer.icon.alt}
                  width={layer.icon.width}
                  height={layer.icon.height}
                  aria-hidden
                  // **The icon carries the difference between itself and the number.**
                  // Both sit in the same left column, both flush left, and the
                  // gutter a reader sees is to the ink, not to the box: the
                  // number is 19.5 wide and the mark 32, so the mark stood 24
                  // from the copy while the number stood 36.5. The margin puts
                  // them on one line. At `lg` the column's gutter is twice as
                  // wide and the frame's own alignment stands.
                  className="o-size-8 o-shrink-0 pf-mb-calc-var-text-hero-body-0-155 max-lg:o-mr-3"
                />
              </div>
              <div className="o-flex o-min-w-px o-flex-1 o-flex-col o-gap-3">
                <h3 className="pf-text-hero-body pf-leading-hero-display pf-text-hero-content">
                  <ScrambleText tieProse revealInView revealDelay={index * 80}>
                    {layer.title}
                  </ScrambleText>
                </h3>
                <p className="pf-text-hero-body pf-leading-hero-prose pf-text-hero-content-muted o-uppercase pf-max-sm-prose-even pf-max-lg-max-w-42ch">
                  <ScrambleText
                    tieProse
                    revealInView
                    revealDelay={index * 80 + 60}
                  >
                    {layer.body}
                  </ScrambleText>
                </p>
              </div>
            </Inview>
          ))}
        </ol>
      </div>
    </div>
  </section>
);
