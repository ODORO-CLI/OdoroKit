import TextEngine from "spring-text-engine";

import { Spring } from "@/components/animation/springs/spring";
import { CtaButton } from "@/components/ui/cta-button";
import { ParallaxMedia } from "@/components/ui/parallax-media";
import { SplitWordmark } from "@/components/ui/split-wordmark";
import { HERO_DELAY } from "@/lib/springs/preloader-timing";
import { WORD_GAP_EM, fade, revealConfig } from "@/lib/springs/reveal";
import type { HomeContent } from "@/data/mocks/home";

/**
 * Hero — Figma 0 → 1514 of frame "Concept 3" (1469:1302).
 *
 * Three stacked layers, bottom to top: the sky ramp ("image 643", 1469:1300),
 * the oversized wordmark, then the cut-out house PNG which the wordmark passes
 * behind. Copy sits above all three.
 */
export interface HeroSectionProps {
  content: HomeContent["hero"];
}

export const HeroSection = ({ content }: HeroSectionProps) => (
  <section
    id="hero"
    aria-labelledby="hero-heading"
    // Mobile-first: a stacked, self-sizing hero. Every desktop rule below is
    // the original one moved behind `lg:`, so the 1440 composition is untouched.
    className="o-relative o-flex sn-min-h-100svh o-w-full o-flex-col o-items-center o-overflow-hidden sn-bg-image-var-backdrop-hero o-px-5 o-pb-40 o-pt-28 sn-lg-block sn-lg-h-378-5 sn-lg-px-0 sn-lg-pb-0 sn-lg-pt-0"
  >
    {/* A plain box, not a Spring: the entrance now lives on the letters, and
        animating the wrapper as well would compound the two into a double
        move. Hidden below the breakpoint — at phone width the wordmark is far
        wider than the viewport, so it reads as stray fragments, not a word. */}
    <div className="o-pointer-events-none o-absolute o-hidden o-text-center sn-lg-block sn-lg--left-28-5 sn-lg-top-111-75 sn-lg-w-417-25">
      {/* Alternating letters climb at different rates on scroll. The gradient
          goes on each letter, not the wrapper — a transformed child composites
          separately and would fall straight out of a wrapper-level
          `background-clip: text` mask, rendering nothing. */}
      <SplitWordmark
        text={content.wordmark}
        // `font-display` is the variable cut: browsers apply
        // `font-optical-sizing: auto` by default, so at this size `opsz` lands
        // on the axis maximum and the strokes thin out to match Figma. The
        // static 24 pt Thin cannot do this — see obsidian/frontend/design-system.md.
        className="text-trim-flat o-block o-whitespace-nowrap sn-font-display sn-text-wordmark o-font-thin sn-leading-flat"
        letterClassName="sn-bg-image-var-wordmark-fill sn-bg-clip-text o-text-transparent"
        entranceDelay={HERO_DELAY.wordmark}
      />
    </div>

    {/* The hero is on screen before any scrolling, so it must open on the exact
        Figma framing: `top top` puts progress at 0 on load, and anchor="start"
        makes that the neutral position rather than one end of the travel. */}
    <ParallaxMedia
      src={content.image.src}
      alt={content.image.alt}
      sizes="100vw"
      priority
      start="top top"
      end="bottom top"
      anchor="start-raised"
    />

    <h1
      id="hero-heading"
      className="o-relative o-z-20 o-w-full o-text-center sn-text-title o-font-light sn-leading-flat sn-text-on-media-muted sn-lg-absolute sn-lg-left-78-75 sn-lg-top-38-5 sn-lg-w-202-5 sn-lg-text-display"
    >
      {/* TextEngine positions its split children absolutely, so they never take
          part in flex wrapping — a heading that fits at 1440 simply runs off a
          narrow screen, and no CSS reaches it. Below the breakpoint the same
          words are rendered as ordinary text, which wraps; the animated version
          takes over from `lg:` up. One `<h1>`, two renderings. */}
      <span className="text-trim-flat sn-lg-hidden">
        {content.headingLead}
        <span className="sn-text-on-media">{content.headingRest}</span>
      </span>

      <span className="o-hidden sn-lg-contents">
        <TextEngine
          tag="span"
          mode="once"
          className="text-trim-flat o-justify-center o-text-center sn-leading-flat"
          wordIn={{ opacity: 1, y: 0 }}
          wordOut={{ opacity: 0, y: 40 }}
          wordStagger={45}
          wordConfig={revealConfig}
          columnGap={WORD_GAP_EM}
          delayIn={HERO_DELAY.heading}
        >
          {content.headingLead}
          <span className="sn-text-on-media">{content.headingRest}</span>
        </TextEngine>
      </span>
    </h1>

    <Spring
      tag="p"
      mode="once"
      from={fade.from}
      to={fade.to}
      config={revealConfig}
      delayIn={HERO_DELAY.subtitle}
      className="o-relative o-z-20 o-mt-6 o-w-full sn-max-w-152 o-text-center sn-text-body sn-leading-body sn-text-on-media sn-lg-max-w-none sn-lg-absolute sn-lg-left-113-75 sn-lg-top-84-75 sn-lg-mt-0 sn-lg-w-132-5 sn-lg-text-lead"
    >
      {content.subtitle}
    </Spring>

    <Spring
      mode="once"
      from={{ opacity: 0, y: 16 }}
      to={{ opacity: 1, y: 0 }}
      config={revealConfig}
      delayIn={HERO_DELAY.cta}
      className="o-relative o-z-20 o-mt-8 sn-lg-absolute sn-lg-left-154-25 sn-lg-top-106-75 sn-lg-mt-0 sn-lg-w-51-5"
    >
      <CtaButton label={content.cta.label} href={content.cta.href} className="o-w-full" />
    </Spring>

    <Spring
      tag="p"
      mode="once"
      from={fade.from}
      to={fade.to}
      config={revealConfig}
      delayIn={HERO_DELAY.caption}
      className="o-absolute sn-inset-x-5 o-bottom-12 o-z-20 o-text-center sn-text-body sn-leading-body sn-text-on-media sn-lg-inset-x-auto sn-lg-bottom-auto sn-lg-left-126-5 sn-lg-top-341-5 sn-lg-w-107 sn-lg-text-lead"
    >
      {content.caption[0]}
      <br />
      {content.caption[1]}
    </Spring>
  </section>
);
