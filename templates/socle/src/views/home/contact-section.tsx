import TextEngine from "spring-text-engine";

import { Inview } from "@/components/animation/springs/in-view";
import { CtaButton } from "@/components/ui/cta-button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ParallaxMedia } from "@/components/ui/parallax-media";
import { TextField } from "@/components/ui/text-field";
import { WORD_GAP_EM, fadeUp, fadeUpShort, revealConfig, revealConfigSnappy } from "@/lib/springs/reveal";
import type { HomeContent } from "@/data/mocks/home";

/** Figma 6073 → 7199 of frame "Concept 3" (1469:1302). */
export interface ContactSectionProps {
  content: HomeContent["contact"];
}

export const ContactSection = ({ content }: ContactSectionProps) => (
  <section
    id="contact"
    aria-labelledby="contact-heading"
    className="o-relative o-flex o-w-full o-flex-col o-items-center o-overflow-hidden o-px-5 o-py-24 sn-lg-block sn-lg-h-281-5 sn-lg-px-0 sn-lg-py-0"
  >
    <ParallaxMedia src={content.image.src} alt={content.image.alt} sizes="100vw" />

    <Inview
      mode="once"
      from={fadeUpShort.from}
      to={fadeUpShort.to}
      config={revealConfigSnappy}
      className="o-z-10 o-flex o-justify-center sn-lg-absolute sn-lg-inset-x-0 sn-lg-top-22-5"
    >
      <Eyebrow label={content.eyebrow} className="sn-text-body sn-text-on-media" />
    </Inview>

    <h2
      id="contact-heading"
      className="o-z-10 o-mt-6 o-w-full o-text-center sn-text-title o-font-light sn-leading-flat sn-text-on-media-muted sn-lg-absolute sn-lg-left-64-5 sn-lg-top-34-5 sn-lg-mt-0 sn-lg-w-231 sn-lg-text-display"
    >
      {/* Plain below the breakpoint so it can wrap; animated from `lg:` up —
          see the note in hero-section.tsx. */}
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
        >
          {content.headingLead}
          <span className="sn-text-on-media">{content.headingRest}</span>
        </TextEngine>
      </span>
    </h2>

    <Inview
      mode="once"
      from={fadeUp.from}
      to={fadeUp.to}
      config={revealConfig}
      className="o-z-10 o-mt-12 o-w-full sn-rounded-card sn-bg-surface-panel o-p-6 sn-backdrop-blur-panel sn-lg-absolute sn-lg-left-10 sn-lg-top-187-5 sn-lg-mt-0 sn-lg-h-86 sn-lg-w-340 sn-lg-p-7-5"
    >
      <div className="o-flex o-h-full o-flex-col o-items-start o-gap-10 sn-lg-gap-25">
        <p className="text-trim-body o-w-full sn-text-body o-font-light sn-leading-body sn-text-foreground sn-lg-w-254-25 sn-lg-text-title">
          {content.body}
        </p>

        <form action="/api/contact" method="post" className="o-flex o-w-full o-flex-col sn-gap-7-5 sn-lg-w-325">
          <div className="o-flex o-w-full o-flex-col o-items-stretch o-gap-6 sn-tablet-flex-row sn-tablet-items-center sn-lg-flex-row sn-lg-items-center sn-lg-gap-7-5">
            {content.fields.map((field) => (
              <TextField
                key={field.name}
                name={field.name}
                label={field.label}
                type={field.type}
                autoComplete={field.autoComplete}
              />
            ))}
          </div>

          <CtaButton label={content.submitLabel} className="o-w-full" />
        </form>
      </div>
    </Inview>
  </section>
);
