import { animated, type SpringValue } from "@react-spring/web";
import { useMemo, type RefObject } from "react";
import TextEngine from "spring-text-engine";

import { RevealLines } from "@/components/ui/reveal-lines";
import type { EchoContent } from "@/data/mocks/home";
import { SCROLL_LETTER, SLIDE_BLUR } from "@/lib/springs/presets";
import { PHASE, echoTransform, interiorScale } from "@/utils/timeline/scene";

export interface EchoPanelProps {
  content: EchoContent;
  p: SpringValue<number>;
  leadActive: boolean;
  footActive: boolean;
  /** Phase marker the ECHO letters scrub against. */
  trigger: RefObject<HTMLElement>;
}

const LABEL_TYPE =
  "cb-text-title-phone o-uppercase cb-tracking-title cb-text-foreground-95 cb-sm-text-title";

/**
 * Interior one — slides up over the dimming sequence with a frosted panel
 * carrying the Expertises showcase: the practice areas as hairline rows.
 */
export const EchoPanel = ({ content, p, leadActive, footActive, trigger }: EchoPanelProps) => {
  const s = useMemo(
    () => ({
      layer: p.to(echoTransform),
      image: p.to(interiorScale(PHASE.echo)),
    }),
    [p],
  );

  return (
    <animated.div
      className="o-absolute o-inset-0 o-z-10 o-overflow-hidden"
      style={{ transform: s.layer }}
    >
      <animated.div className="o-absolute o-inset-0" style={{ transform: s.image }}>
        <img
          src={content.image.src}
          alt={content.image.alt}
          className="o-absolute o-inset-0 o-h-full o-w-full o-object-cover"
        />
      </animated.div>

      <article
        aria-labelledby="echo-title"
        className="o-absolute o-inset-y-0 o-left-0 cb-z-15 o-flex o-w-1/2 o-flex-col o-justify-between o-border-r cb-border-foreground-8 cb-bg-surface-glass-raised-45 o-px-14 o-py-14 o-backdrop-blur-2xl max-md:o-w-full max-md:o-px-8 max-md:o-pb-32 max-md:o-pt-12"
      >
        <RevealLines tag="p" lines={content.eyebrow} active={leadActive} timing="label" className={LABEL_TYPE} />

        <div className="o-mt-10 o-flex o-grow o-flex-col o-justify-center">
          <h2
            id="echo-title"
            className="o-mb-6 o-flex o-items-start o-whitespace-nowrap cb-font-display o-font-medium cb-text-display-phone cb-leading-hero cb-tracking-display cb-sm-text-display-panel"
          >
            <span className="o-sr-only">{`${content.title}${content.mark}`}</span>
            <span aria-hidden>
              <TextEngine
                tag="span"
                mode="progress"
                type="toggle"
                trigger={trigger}
                start="top top"
                end="bottom bottom"
                seo={false}
                {...SLIDE_BLUR}
                letterConfig={SCROLL_LETTER}
              >
                {content.title}
              </TextEngine>
            </span>
            {content.mark && (
              <sup aria-hidden className="o-ml-1 cb-mt-0-12em cb-text-0-35em cb-leading-none">
                {content.mark}
              </sup>
            )}
          </h2>
          <p className="cb-max-w-85 cb-text-body-phone cb-leading-copy cb-tracking-copy cb-text-foreground-70 cb-sm-text-body cb-max-md-max-w-none">
            {content.description}
          </p>
        </div>

        <footer className="o-mt-8 o-flex o-flex-col o-gap-6">
          <ul className="o-flex o-flex-col o-border-t cb-border-foreground-15">
            {content.practices.map((practice, index) => (
              <li
                key={practice}
                className="o-flex o-items-baseline o-justify-between o-gap-4 o-border-b cb-border-foreground-15 o-py-2.5 cb-text-body-phone cb-leading-copy cb-tracking-copy cb-sm-text-body"
              >
                <span>{practice}</span>
                <span aria-hidden className="cb-text-caption o-tabular-nums cb-text-foreground-45">
                  {String(index + 1).padStart(2, "0")}
                </span>
              </li>
            ))}
          </ul>
          <RevealLines tag="p" lines={content.footer} active={footActive} timing="label" className={LABEL_TYPE} />
        </footer>
      </article>
    </animated.div>
  );
};
