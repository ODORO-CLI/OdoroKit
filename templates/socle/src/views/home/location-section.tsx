import TextEngine from "spring-text-engine";

import { Inview } from "@/components/animation/springs/in-view";
import { CtaButton } from "@/components/ui/cta-button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ParallaxLayer, ParallaxMedia } from "@/components/ui/parallax-media";
import { PixelRevealImage } from "@/components/ui/pixel-reveal-image";
import { WORD_GAP_EM, fadeUpShort, revealConfig, revealConfigSnappy } from "@/lib/springs/reveal";
import type { HomeContent } from "@/data/mocks/home";

/** Figma 3421 → 4379 of frame "Concept 3" (1469:1302). */
export interface LocationSectionProps {
  content: HomeContent["location"];
}

export const LocationSection = ({ content }: LocationSectionProps) => (
  <section
    id="location"
    aria-labelledby="location-heading"
    className="o-relative o-flex o-w-full o-flex-col o-items-center o-overflow-hidden o-px-5 o-py-24 sn-lg-block sn-lg-h-239-5 sn-lg-px-0 sn-lg-py-0"
  >
    <ParallaxMedia src={content.image.src} alt={content.image.alt} sizes="100vw" />

    {/* Painted in by the cursor, over the photograph but under the copy. Wrapped
        in the same `ParallaxLayer` the photograph uses, so the two drift as one
        rather than sliding against each other. */}
    <ParallaxLayer className="o-pointer-events-none">
      <PixelRevealImage
        src={content.reveal.src}
        label={content.reveal.label}
        className="o-absolute o-inset-0 o-size-full"
      />
    </ParallaxLayer>

    <Inview
      mode="once"
      from={fadeUpShort.from}
      to={fadeUpShort.to}
      config={revealConfigSnappy}
      className="o-z-10 o-flex o-justify-center sn-lg-absolute sn-lg-inset-x-0 sn-lg-top-25"
    >
      <Eyebrow label={content.eyebrow} className="sn-text-lead sn-text-on-media" />
    </Inview>

    <div className="o-z-10 o-mt-6 o-w-full sn-lg-absolute sn-lg-left-20-5 sn-lg-top-39 sn-lg-mt-0 sn-lg-w-319-25">
      <TextEngine
        tag="h2"
        id="location-heading"
        mode="once"
        className="text-trim-body o-mx-auto sn-max-w-160 o-justify-center o-text-center sn-text-body o-font-light sn-leading-body sn-text-on-media sn-lg-max-w-none sn-lg-text-title"
        wordIn={{ opacity: 1, y: 0 }}
        wordOut={{ opacity: 0, y: 28 }}
        wordStagger={18}
        wordConfig={revealConfig}
        columnGap={WORD_GAP_EM}
      >
        {content.body}
      </TextEngine>
    </div>

    <Inview
      mode="once"
      from={fadeUpShort.from}
      to={fadeUpShort.to}
      config={revealConfigSnappy}
      className="o-z-10 o-mt-10 sn-lg-absolute sn-lg-left-152 sn-lg-top-202-5 sn-lg-mt-0 sn-lg-w-56"
    >
      <CtaButton label={content.cta.label} href={content.cta.href} className="o-w-full" />
    </Inview>
  </section>
);
