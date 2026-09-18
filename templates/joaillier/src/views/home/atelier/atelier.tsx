/**
 * Atelier — GetLayers composition `artist-cta`.
 *
 * A full-viewport tonal inversion: the ground flips to the palette's silver —
 * the ONE lighter surface on the page — and a narrow copy column (eyebrow,
 * heading, body, one button) sits vertically centred against a portrait plate
 * five columns wide on the right, with a whole empty column between them.
 *
 * The section earns its height by being the only inverted band in a long dark
 * page: the arrest comes from the ground change, not from the layout, so the
 * layout stays deliberately plain. The type is night on silver rather than
 * cream — the palette's `ink` at a contrast the silver can carry.
 *
 * 📖 Docs: obsidian/frontend/sections.md
 */

import TextEngine from "spring-text-engine";

import { Inview } from "@/components/animation/springs/in-view";
import { ActionLink } from "@/components/ui/action-link";
import { Eyebrow } from "@/components/ui/eyebrow";
import { LINE_REVEAL, RISE, SETTLE } from "@/lib/motion/reveals";

import type { AtelierContent } from "./atelier.types";

export interface AtelierProps {
  content: AtelierContent;
}

export const Atelier = ({ content }: AtelierProps) => (
  <section
    id="atelier"
    aria-labelledby="atelier-heading"
    className="jo-bg-surface-band jo-text-foreground-ink min-h-viewport jo-px-page jo-py-stack o-grid o-content-center"
  >
    <div className="o-grid o-grid-cols-12 o-items-center jo-gap-x-lg jo-gap-y-stack">
      <div className="o-col-span-6 jo-max-w-34rem jo-max-lg-col-span-12">
        <Eyebrow tone="ink">{content.eyebrow}</Eyebrow>

        <TextEngine
          tag="h2"
          id="atelier-heading"
          mode="once"
          className="jo-text-headline jo-leading-headline jo-text-foreground-ink jo-font-display jo-mt-xl jo-max-md-text-40px jo-max-md-leading-40px"
          {...LINE_REVEAL}
        >
          {content.heading}
        </TextEngine>

        <Inview
          tag="p"
          mode="once"
          delayIn={220}
          className="jo-text-lead jo-leading-lead jo-text-foreground-ink-muted jo-font-ui jo-mt-lg"
          {...RISE}
        >
          {content.body}
        </Inview>

        <Inview tag="p" mode="once" delayIn={380} className="jo-mt-xl" {...RISE}>
          <ActionLink href={content.cta.href} variant="pill-ink">
            {content.cta.label}
          </ActionLink>
        </Inview>
      </div>

      {/* Starts at column 8, so one column stays empty between copy and plate. */}
      <div className="o-col-span-5 jo-col-start-8 jo-max-lg-col-span-12 jo-max-lg-col-start-1">
        <Inview
          tag="figure"
          mode="once"
          className="jo-rounded-media o-relative jo-aspect-3-4 o-overflow-hidden"
          {...SETTLE}
        >
          <img
            src={content.image.src}
            alt={content.image.alt}
            className="o-absolute o-inset-0 o-h-full o-w-full o-object-cover"
          />
        </Inview>
      </div>
    </div>
  </section>
);
