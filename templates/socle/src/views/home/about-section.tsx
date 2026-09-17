import TextEngine from "spring-text-engine";

import { Inview } from "@/components/animation/springs/in-view";
import { CtaButton } from "@/components/ui/cta-button";
import { DragSequenceVideo } from "@/components/ui/drag-sequence-video";
import { Eyebrow } from "@/components/ui/eyebrow";
import { HighlightGlyph } from "@/components/ui/icons/highlight-glyph";
import { ParallaxMedia } from "@/components/ui/parallax-media";
import { QuoteGlyph } from "@/components/ui/icons/quote-glyph";
import { WORD_GAP_EM, fade, fadeUp, fadeUpShort, revealConfig, revealConfigSnappy } from "@/lib/springs/reveal";
import type { HighlightItem, HomeContent } from "@/data/mocks/home";

/** Figma 1514 → 2849 of frame "Concept 3" (1469:1302). */
export interface AboutSectionProps {
  content: HomeContent["about"];
}

/**
 * Figma draws the two tiles at slightly different sizes — 72 px with the ring
 * (1484:1761) and 67 px with the triangle (1484:1762) — and pads them so both
 * captions still start on the same line. Kept as-is.
 */
const Highlight = ({ item, className }: { item: HighlightItem; className?: string }) => (
  <div className={`o-flex o-flex-col o-items-start ${className ?? ""}`}>
    {item.glyph === "circle" ? (
      <span className="o-relative sn-size-18 o-shrink-0 sn-rounded-card sn-bg-surface-muted">
        <HighlightGlyph name="circle" className="o-absolute o-inset-0 o-size-full sn-text-foreground" />
      </span>
    ) : (
      <span className="o-relative sn-size-16-75 o-shrink-0 sn-rounded-card sn-bg-surface-muted">
        <HighlightGlyph name="triangle" className="o-absolute o-left-3 o-top-3 sn-w-10-75 sn-text-foreground" />
      </span>
    )}

    <p
      className={`o-w-full sn-text-lead sn-leading-body sn-text-foreground ${
        item.glyph === "circle" ? "o-mt-8" : "sn-mt-9-25"
      }`}
    >
      {item.title}
    </p>
    <p className="text-trim-body o-mt-4 o-w-full sn-text-body o-font-light sn-leading-body sn-text-foreground">
      {item.description}
    </p>
  </div>
);

export const AboutSection = ({ content }: AboutSectionProps) => (
  <section id="about" aria-labelledby="about-heading" className="o-relative o-w-full o-px-5 o-py-20 sn-lg-h-333-75 sn-lg-px-0 sn-lg-py-0">
    <Inview
      mode="once"
      from={fadeUpShort.from}
      to={fadeUpShort.to}
      config={revealConfigSnappy}
      className="sn-lg-absolute sn-lg-left-10 sn-lg-top-25 sn-lg-w-41-5"
    >
      <Eyebrow label={content.eyebrow} className="sn-text-lead sn-text-foreground" />
    </Inview>

    <div className="o-mt-6 sn-lg-absolute sn-lg-left-152-75 sn-lg-top-25 sn-lg-mt-0 sn-lg-w-197-25">
      <TextEngine
        tag="h2"
        id="about-heading"
        mode="once"
        className="text-trim-body sn-text-title o-font-light sn-leading-body sn-text-foreground"
        wordIn={{ opacity: 1, y: 0 }}
        wordOut={{ opacity: 0, y: 28 }}
        wordStagger={22}
        wordConfig={revealConfig}
        columnGap={WORD_GAP_EM}
      >
        {content.body}
      </TextEngine>
    </div>

    <Inview
      mode="once"
      from={fade.from}
      to={fade.to}
      config={revealConfig}
      className="o-mt-10 o-h-px o-w-full sn-bg-border-subtle sn-lg-absolute sn-lg-left-10 sn-lg-top-89-5 sn-lg-mt-0 sn-lg-w-340"
    />

    <Inview
      mode="once"
      from={fadeUp.from}
      to={fadeUp.to}
      config={revealConfig}
      className="o-mt-10 sn-lg-absolute sn-lg-left-10 sn-lg-top-104-5 sn-lg-mt-0 sn-lg-w-70-5"
    >
      <Highlight item={content.highlights[0]} />
    </Inview>

    <Inview
      mode="once"
      from={fadeUp.from}
      to={fadeUp.to}
      config={revealConfig}
      delayIn={90}
      className="o-mt-10 sn-lg-absolute sn-lg-left-152-75 sn-lg-top-104-5 sn-lg-mt-0 sn-lg-w-58-75"
    >
      <Highlight item={content.highlights[1]} />
    </Inview>

    <Inview
      mode="once"
      from={fadeUpShort.from}
      to={fadeUpShort.to}
      config={revealConfigSnappy}
      className="o-mt-10 sn-lg-absolute sn-lg-left-267 sn-lg-top-135-5 sn-lg-mt-0 sn-lg-w-83"
    >
      <CtaButton label={content.cta.label} href={content.cta.href} className="o-w-full" />
    </Inview>

    <Inview
      tag="figure"
      mode="once"
      from={fade.from}
      to={fade.to}
      config={revealConfig}
      className="o-relative o-mt-10 sn-aspect-561-683 o-w-full sn-lg-absolute sn-lg-left-10 sn-lg-top-163 sn-lg-mt-0 sn-lg-aspect-auto sn-lg-h-170-75 sn-lg-w-140-25"
    >
      <ParallaxMedia
        src={content.image.src}
        alt={content.image.alt}
        sizes="39vw"
        className="sn-rounded-card"
      />

      {/* Figma "Rectangle 1991424012" (1505:1816) — inset 30 px from the
          photograph's left and bottom edges. */}
      <figcaption className="o-absolute sn-inset-x-4 o-bottom-4 sn-rounded-button sn-bg-action-secondary o-p-5 sn-lg-inset-x-auto sn-lg-bottom-7-5 sn-lg-left-7-5 sn-lg-h-32-5 sn-lg-w-125-5 sn-lg-p-7-5">
        {/* Figma draws this block at 282 px, which only fits its old two-word
            placeholder. Widened to clear the glyph instead, so a real sentence
            still sits on one line. */}
        <blockquote className="o-w-full sn-lg-w-90">
          <p className="sn-text-lead sn-leading-body sn-text-foreground">{content.quote.text}</p>
          <p className="text-trim-body o-mt-4 sn-text-body o-font-light sn-leading-body sn-text-foreground">
            {content.quote.attribution}
          </p>
        </blockquote>
        {/* 18.656 × 14.272 px in Figma, rounded to whole pixels (19 × 14):
            the spacing scale only emits multiples of 0.25, and anything else
            silently compiles to nothing (see design-system.md). Both axes must
            be set — an inline SVG given only a width falls back to the default
            150 px height instead of honouring its viewBox ratio. */}
        <QuoteGlyph className="o-absolute sn-right-7-5 sn-top-7-5 o-h-3.5 sn-w-4-75 sn-text-foreground" />
      </figcaption>
    </Inview>

    {/* Figma "Rectangle 1991424011" (1476:1513) was an empty grey plate; it now
        holds the drag-to-rotate turntable. */}
    <Inview
      mode="once"
      from={fade.from}
      to={fade.to}
      config={revealConfig}
      delayIn={90}
      className="o-relative o-mt-4 sn-aspect-789-683 o-w-full sn-lg-absolute sn-lg-left-152-75 sn-lg-top-163 sn-lg-mt-0 sn-lg-aspect-auto sn-lg-h-170-75 sn-lg-w-197-25"
    >
      <DragSequenceVideo
        src={content.video.src}
        label={content.video.label}
        scrubber
        className="o-size-full sn-rounded-card"
      />
    </Inview>
  </section>
);
