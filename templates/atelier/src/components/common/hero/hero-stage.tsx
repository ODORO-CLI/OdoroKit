// 📖 Docs: obsidian/frontend/components/common.md

/**
 * The first screen over the film — the `loopstack-hero` skeleton.
 *
 * A short line and one pill pressed to the top of the frame, the film owning
 * everything behind, and the wordmark set large enough to bleed out past both
 * gutters along the bottom edge. Three things and a great deal of film.
 *
 * Every block arrives from the layer's `--stage-reveal` (see `stageRise` and
 * `<StageReveal>`): the line word by word, the name letter by letter, the pill
 * and the meta rising a beat behind. Nothing here animates itself.
 */

import { Magnetic } from "@/components/common/magnetic/magnetic";
import { StageReveal } from "@/components/common/reveal/stage-reveal";
import { stageRise } from "@/components/common/reveal/stage-rise";
import { revealConfig } from "@/lib/reveal/reveal.config";

const [lineAt, pillAt, metaAt, nameAt] = revealConfig.copyStagger;

export interface HeroStageContent {
  eyebrow: string;
  headline: string;
  cta: { label: string; href: string };
  wordmark: string;
  meta: { left: string; right: string };
}

export const HeroStage = ({ content }: { content: HeroStageContent }) => (
  <div className="o-pointer-events-none o-absolute o-inset-x-0 o-top-0 o-flex at-h-lvh o-flex-col o-justify-between at-px-frame-gutter at-pt-max-96px-8vw at-stacked-pt-max-112px-24lvh">
    <div className="o-flex o-flex-col o-items-center at-gap-1-2vw o-text-center at-stacked-gap-4">
      <p
        className="at-font-sans at-text-frame-caption o-uppercase at-tracking-0-24em at-text-foreground-muted-80"
        style={stageRise(lineAt)}
      >
        {content.eyebrow}
      </p>
      <StageReveal
        tag="p"
        className="at-max-w-26ch at-font-serif at-text-frame-lead at-leading-1-15 at-text-foreground"
        style={stageRise(lineAt)}
      >
        {content.headline}
      </StageReveal>
      <a
        href={content.cta.href}
        className="o-pointer-events-auto at-mt-0-8vw o-inline-flex at-h-frame-control o-items-center o-justify-center o-rounded-full at-bg-accent at-px-max-24px-2-8vw at-font-serif at-text-frame-nav at-leading-none at-text-accent-foreground o-transition-opacity at-duration-var-duration-fast at-ease-entrance hover:o-opacity-90 at-stacked-mt-2"
        style={stageRise(pillAt)}
      >
        {/* The plate holds still and the label leans — see `<Magnetic>`. */}
        <Magnetic className="o-block o-will-change-transform">
          {content.cta.label}
        </Magnetic>
      </a>
    </div>

    <div className="o-relative">
      <div
        className="o-flex o-items-end o-justify-between at-font-sans at-text-frame-caption o-uppercase at-tracking-0-24em at-text-foreground-muted-80"
        style={stageRise(metaAt)}
      >
        <p>{content.meta.left}</p>
        <p aria-hidden="true">{content.meta.right} ↓</p>
      </div>
      {/* The page's one h1: the name, set past the gutters and cropped by the
          foot of the screen so it reads as a plate the film stands on. */}
      <StageReveal
        tag="h1"
        id="hero-title"
        unit="letter"
        className="at--mb-0-16em at--mx-frame-gutter o-whitespace-nowrap o-text-center at-font-display at-text-27vw at-leading-0-82 at-tracking-0-035em at-text-foreground"
        style={stageRise(nameAt, 0.4)}
      >
        {content.wordmark}
      </StageReveal>
    </div>
  </div>
);
