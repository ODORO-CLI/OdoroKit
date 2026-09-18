// 📖 Docs: obsidian/frontend/components/common.md

/**
 * The closing screen — the `ai-studio-cta` skeleton over the Onyx Cubes scene.
 *
 * A left-aligned, vertically centred stack — an oversized two-line heading
 * with the second line dimmed, a short line, a pill — against an open right
 * half where the swarm hangs. The copy is `pointer-events-none` so the cubes
 * behind it take the cursor; only the pill takes it back.
 *
 * The heading resolves letter by letter and the copy rises a beat behind it
 * from one `--stage-reveal`, written by `<Inview>` as the screen enters —
 * `mode="once"`, because a screen that un-resolved on the way back up would
 * read as a glitch.
 */

import { Inview } from "@/components/animation/springs/in-view";
import { Magnetic } from "@/components/common/magnetic/magnetic";
import { StageReveal } from "@/components/common/reveal/stage-reveal";
import { stageRise } from "@/components/common/reveal/stage-rise";
import { LazyOnyxCubes } from "@/components/common/scene/lazy-onyx-cubes";
import { revealConfig } from "@/lib/reveal/reveal.config";

const [, bodyAt, pillAt, noteAt] = revealConfig.copyStagger;

export interface ClosingContent {
  heading: { lead: string; trail: string };
  body: string;
  note: string;
  cta: { label: string; href: string };
}

export const ClosingStage = ({ content }: { content: ClosingContent }) => (
  <section
    id="atelier"
    aria-labelledby="atelier-title"
    className="o-relative at-h-lvh o-w-full o-overflow-hidden at-bg-background"
  >
    {/* The studio wash the swarm hangs in — the page's own ground, so the
        canvas can stay transparent and the ink beside it stays ink. */}
    <div
      aria-hidden="true"
      className="o-absolute o-inset-0 at-bg-linear-to-b at-from-background at-to-surface-raised"
    />
    <LazyOnyxCubes className="o-absolute o-inset-0" />

    <Inview
      tag="div"
      mode="once"
      from={{ "--stage-reveal": 0 }}
      to={{ "--stage-reveal": 1 }}
      config={revealConfig.entrance}
      className="o-pointer-events-none o-relative o-z-10 o-flex o-h-full o-flex-col o-justify-center at-px-frame-gutter at-stacked-justify-end at-stacked-pb-10lvh"
    >
      <h2
        id="atelier-title"
        className="at-font-display at-text-7vw at-leading-0-95 at-tracking-0-025em at-text-foreground at-stacked-text-13vw"
      >
        <StageReveal tag="span" unit="letter" className="o-block">
          {content.heading.lead}
        </StageReveal>
        <StageReveal
          tag="span"
          unit="letter"
          className="o-block at-text-foreground-40"
        >
          {content.heading.trail}
        </StageReveal>
      </h2>
      <p
        className="at-mt-2vw at-max-w-34ch at-font-sans at-text-frame-body at-leading-1-5 at-text-foreground-muted at-stacked-mt-6"
        style={stageRise(bodyAt)}
      >
        {content.body}
      </p>
      <a
        href={content.cta.href}
        className="o-pointer-events-auto at-mt-2-4vw o-inline-flex at-h-frame-control o-w-fit o-items-center o-justify-center o-rounded-full at-bg-accent at-px-max-24px-2-8vw at-font-serif at-text-frame-nav at-leading-none at-text-accent-foreground o-transition-opacity at-duration-var-duration-fast at-ease-entrance hover:o-opacity-90 at-stacked-mt-6"
        style={stageRise(pillAt)}
      >
        <Magnetic className="o-block o-will-change-transform">
          {content.cta.label}
        </Magnetic>
      </a>
      <p
        className="at-mt-1-6vw at-font-sans at-text-frame-caption o-uppercase at-tracking-0-2em at-text-foreground-muted-70 at-stacked-mt-5"
        style={stageRise(noteAt)}
      >
        {content.note}
      </p>
    </Inview>
  </section>
);
