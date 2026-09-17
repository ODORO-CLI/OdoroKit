import TextEngine from "spring-text-engine";

import { Inview } from "@/components/animation/springs/in-view";
import { CounterValue } from "@/components/ui/counter-value";
import { Eyebrow } from "@/components/ui/eyebrow";
import { WORD_GAP_EM, fadeUp, fadeUpShort, revealConfig, revealConfigSnappy } from "@/lib/springs/reveal";
import type { HomeContent } from "@/data/mocks/home";

/** Figma 2849 → 3421 of frame "Concept 3" (1469:1302). */
export interface NumbersSectionProps {
  content: HomeContent["numbers"];
}

export const NumbersSection = ({ content }: NumbersSectionProps) => (
  <section id="numbers" aria-labelledby="numbers-heading" className="o-relative o-w-full o-px-5 o-py-20 sn-lg-h-143 sn-lg-px-0 sn-lg-py-0">
    <Inview
      mode="once"
      from={fadeUpShort.from}
      to={fadeUpShort.to}
      config={revealConfigSnappy}
      className="o-flex o-justify-center sn-lg-absolute sn-lg-inset-x-0 sn-lg-top-25"
    >
      <Eyebrow label={content.eyebrow} className="sn-text-lead sn-text-foreground" />
    </Inview>

    <div className="o-mt-6 sn-lg-absolute sn-lg-left-92-5 sn-lg-top-39 sn-lg-mt-0 sn-lg-w-175-25">
      <TextEngine
        tag="h2"
        id="numbers-heading"
        mode="once"
        className="text-trim-body o-justify-center o-text-center sn-text-lead o-font-light sn-leading-body sn-text-foreground lg:text-engine-nowrap sn-lg-whitespace-nowrap sn-lg-text-title"
        wordIn={{ opacity: 1, y: 0 }}
        wordOut={{ opacity: 0, y: 28 }}
        wordStagger={35}
        wordConfig={revealConfig}
        columnGap={WORD_GAP_EM}
      >
        {content.heading}
      </TextEngine>
    </div>

    <Inview
      tag="p"
      mode="once"
      from={fadeUpShort.from}
      to={fadeUpShort.to}
      config={revealConfigSnappy}
      delayIn={120}
      className="text-trim-body o-mt-5 o-text-center sn-text-body o-font-light sn-leading-body sn-text-foreground sn-lg-absolute sn-lg-left-132-75 sn-lg-top-57-5 sn-lg-mt-0 sn-lg-w-94-75"
    >
      {content.subtitle}
    </Inview>

    {/* Three stats side by side from tablet up — 834 px fits them comfortably,
        and stacked they read as three unrelated facts. */}
    <dl className="o-mt-12 o-flex o-flex-col o-items-center o-gap-10 sn-tablet-flex-row sn-tablet-items-start sn-tablet-justify-center sn-tablet-gap-6 sn-lg-absolute sn-lg-left-27-5 sn-lg-top-81 sn-lg-mt-0 sn-lg-w-305 sn-lg-flex-row sn-lg-gap-2-5">
      {content.stats.map((stat, index) => (
        <Inview
          key={stat.id}
          mode="once"
          from={fadeUp.from}
          to={fadeUp.to}
          config={revealConfig}
          delayIn={index * 110}
          className="o-flex o-w-full o-shrink-0 o-flex-col o-items-center o-gap-4 o-text-center sn-lg-w-100 sn-lg-gap-6"
        >
          <CounterValue
            tag="dt"
            value={stat.value}
            className="text-trim-body o-w-full sn-text-display o-font-light sn-leading-body sn-text-foreground"
          />
          <dd className="o-w-full sn-text-lead sn-leading-body sn-text-foreground">{stat.label}</dd>
        </Inview>
      ))}
    </dl>
  </section>
);
