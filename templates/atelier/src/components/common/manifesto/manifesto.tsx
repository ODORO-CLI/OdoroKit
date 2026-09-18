// 📖 Docs: obsidian/frontend/components/common.md
/**
 * The manifesto — the `artist-statement` skeleton.
 *
 * One held-back band: a small-caps eyebrow with a lead rule, a single passage
 * promoted to display size across a measure narrower than every section
 * around it, and a short italic signature. No heading, no image, no button —
 * a deliberate pause between the film and the collection.
 *
 * The passage resolves word by word through `spring-text-engine` as it enters
 * the viewport; the signature rises a beat behind it.
 */

import { easings } from "@react-spring/web";
import TextEngine from "spring-text-engine";

import { Inview } from "@/components/animation/springs/in-view";

export interface ManifestoContent {
  eyebrow: string;
  passage: string;
  signature: string;
}

export const Manifesto = ({ content }: { content: ManifestoContent }) => (
  <section
    id="manifeste"
    aria-labelledby="manifeste-title"
    className="o-relative at-bg-background at-px-frame-gutter at-py-16lvh at-stacked-py-14lvh"
  >
    <div className="at-ml-8-3vw at-max-w-64vw at-stacked-ml-0 at-stacked-max-w-none">
      <h2
        id="manifeste-title"
        className="o-flex o-items-center o-gap-4 at-font-sans at-text-frame-caption o-uppercase at-tracking-0-24em at-text-foreground-muted-80"
      >
        <span aria-hidden="true" className="o-h-px at-w-3vw at-bg-line-30" />
        {content.eyebrow}
      </h2>
      <TextEngine
        tag="p"
        mode="once"
        className="at-mt-3vw at-font-serif at-text-3-4vw at-leading-1-22 at-tracking-0-01em at-text-foreground at-stacked-mt-8 at-stacked-text-7-6vw"
        wordIn={{ y: 0, opacity: 1 }}
        wordOut={{ y: 30, opacity: 0 }}
        wordStagger={24}
        wordConfig={{ duration: 800, easing: easings.easeOutQuart }}
      >
        {content.passage}
      </TextEngine>
      <Inview
        tag="p"
        mode="once"
        from={{ opacity: 0, y: 16 }}
        to={{ opacity: 1, y: 0 }}
        delayIn={700}
        config={{ tension: 60, friction: 22, clamp: true }}
        className="at-mt-3vw at-font-serif at-text-frame-lead o-italic at-leading-none at-text-foreground-muted at-stacked-mt-8"
      >
        {content.signature}
      </Inview>
    </div>
  </section>
);
