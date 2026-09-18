import { useEffect, useState } from "react";
import { animated } from "@react-spring/web";

import { Spring } from "@/components/animation/springs/spring";
import { AnimatedHeading } from "@/components/animation/animated-heading";
import { AnimatedText } from "@/components/animation/animated-text";
import { useSections } from "@/hooks/sections/use-sections";
import { useSceneFade } from "@/hooks/sections/use-scene-fade";
import { useHeroLayout } from "@/hooks/use-hero-scale";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { screens } from "@/lib/scene/screens";
import { easeReveal } from "@/utils/animation/easing";
import type { ServiceItem, ServicesContent } from "@/data/mocks/home";

/**
 * Services — the getLayers redesign of the second slide (Figma node 668:1825).
 *
 * Same recipe as the hero: a fixed 1440×800 composition rendered at literal
 * design pixels and scaled as one unit by `useHeroLayout`, so the mockup's
 * proportions hold at every viewport. The live scene continues behind it — the
 * particle burst the mockup mocks up as a still.
 *
 * On the frame: the two-line masthead (mirror-image gradients, reusing the hero
 * tokens), a four-cell feature grid — two left-aligned cells at the left edge,
 * two right-aligned at the right — each footed by a hairline that fades toward
 * the centre, and a centred line of copy at the foot. The entrance latches the
 * first time the slide goes active (`mode="once"`) and `useSceneFade` drifts the
 * whole thing out as it leaves, matching every other section.
 *
 * The nav is the shared fixed `HeroNav`; this section deliberately omits its own.
 */

const REVEAL = { duration: 1400, easing: easeReveal } as const;

/** Design-pixel top of each feature row (Figma y=367, y=478). */
const ROW_TOP = [367, 478] as const;

export interface ServicesProps {
  content: ServicesContent;
}

interface FeatureProps {
  item: ServiceItem;
  top: number;
  align: "left" | "right";
  rule: string;
  enabled: boolean;
  delayIn: number;
}

const Feature = ({ item, top, align, rule, enabled, delayIn }: FeatureProps) => (
  <Spring
    tag="div"
    enabled={enabled}
    mode="once"
    from={{ opacity: 0, y: 24, filter: "blur(8px)" }}
    to={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    delayIn={delayIn}
    config={REVEAL}
    style={{ top }}
    className={
      align === "left"
        ? "o-absolute hl-left-50px hl-w-400px"
        : "o-absolute hl-left-990px hl-w-400px"
    }
  >
    <div
      className={`o-flex o-flex-col hl-gap-12px ${align === "right" ? "o-items-end o-text-right" : "o-items-start o-text-left"}`}
    >
      <p className="hl-font-mulish hl-text-32px hl-leading-none o-font-light hl-text-foreground">
        {item.title}
      </p>
      <p className="hl-font-mulish hl-text-16px hl-leading-1-2 o-font-normal hl-text-foreground">
        {item.caption}
      </p>
    </div>
    <div
      aria-hidden="true"
      className="hl-mt-16px o-h-px o-w-full"
      style={{ backgroundImage: `var(${rule})` }}
    />
  </Spring>
);

/** Mobile order interleaves the two columns so the visual rows are preserved. */
const mobileFeatures = (content: ServicesContent): ServiceItem[] =>
  [content.left[0], content.right[0], content.left[1], content.right[1]].filter(
    (item): item is ServiceItem => Boolean(item),
  );

export const Services = ({ content }: ServicesProps) => {
  const active = useSections((state) => state.active);
  const isMobile = useIsMobile();
  const fade = useSceneFade(screens.SITEMAP);
  /* `width` fit: the frame spans the full viewport width, so the grid's 50px
     side inset stays proportional to the mockup on every screen. */
  const { scale } = useHeroLayout("width");

  /* Latch the entrance the first time the slide goes active; never replays. */
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    if (active === screens.SITEMAP) setRevealed(true);
  }, [active]);

  return (
    <section
      id="sitemap"
      aria-labelledby="services-heading"
      className="o-relative o-h-svh o-w-full"
    >
      {/* Pinned to the viewport: the composition fades in place rather than
          scrolling away. `pointer-events` follow the active slide. */}
      <animated.div
        style={{
          opacity: fade.opacity,
          pointerEvents: active === screens.SITEMAP ? "auto" : "none",
        }}
        className="o-fixed o-inset-0 o-overflow-hidden"
      >
        {isMobile ? (
          <div className="o-flex o-h-full o-w-full o-flex-col o-items-center o-justify-center hl-gap-24px hl-px-24px hl-pt-96px hl-pb-32px">
            <AnimatedHeading
              tag="h2"
              id="services-heading"
              enabled={revealed}
              baseDelay={120}
              stagger={34}
              className="o-m-0 o-w-full o-text-center hl-font-mulish hl-text-clamp-24px-6-4vw-44px hl-leading-1-06 o-font-light"
              lines={[
                { text: content.titleTop, opaque: "left" },
                { text: content.titleBottom, opaque: "right" },
              ]}
            />

            <div className="o-flex o-w-full hl-max-w-420px o-flex-col hl-gap-18px">
              {mobileFeatures(content).map((item, i) => (
                <Spring
                  key={item.title}
                  tag="div"
                  enabled={revealed}
                  mode="once"
                  from={{ opacity: 0, y: 20, filter: "blur(8px)" }}
                  to={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  delayIn={220 + i * 80}
                  config={REVEAL}
                  className="o-flex o-flex-col hl-gap-4px"
                >
                  <p className="hl-font-mulish hl-text-22px hl-leading-none o-font-light hl-text-foreground">
                    {item.title}
                  </p>
                  <p className="hl-font-mulish hl-text-15px hl-leading-1-3 o-font-normal hl-text-foreground-80">
                    {item.caption}
                  </p>
                  <div
                    aria-hidden="true"
                    className="hl-mt-10px o-h-px o-w-full"
                    style={{ backgroundImage: "var(--gradient-service-rule)" }}
                  />
                </Spring>
              ))}
            </div>

            <AnimatedText
              enabled={revealed}
              delayIn={620}
              className="o-m-0 hl-max-w-420px hl-font-mulish hl-text-14px hl-leading-1-4 o-font-normal hl-text-foreground-85"
            >
              {content.footnote}
            </AnimatedText>
          </div>
        ) : (
          <div
            className="o-absolute o-top-1/2 o-left-1/2 hl-h-800px hl-w-1440px"
            style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
          >
            {/* Masthead — per-letter cascade from the bright ends. */}
            <AnimatedHeading
              tag="h2"
              id="services-heading"
              enabled={revealed}
              baseDelay={120}
              className="o-absolute hl-top-100px hl-left-389px o-m-0 hl-w-663px o-text-center hl-font-mulish hl-text-56px hl-leading-none o-font-light"
              lines={[
                { text: content.titleTop, opaque: "left" },
                { text: content.titleBottom, opaque: "right" },
              ]}
            />

            {/* Feature grid — two left cells, two right cells. */}
            {content.left.map((item, i) => (
              <Feature
                key={item.title}
                item={item}
                top={ROW_TOP[i]}
                align="left"
                rule="--gradient-service-rule"
                enabled={revealed}
                delayIn={260 + i * 90}
              />
            ))}
            {content.right.map((item, i) => (
              <Feature
                key={item.title}
                item={item}
                top={ROW_TOP[i]}
                align="right"
                rule="--gradient-service-rule-alt"
                enabled={revealed}
                delayIn={300 + i * 90}
              />
            ))}

            {/* Footnote — word-by-word fly-up. */}
            <AnimatedText
              enabled={revealed}
              delayIn={520}
              className="o-absolute hl-top-712px hl-left-509px o-m-0 hl-w-423px o-text-center hl-font-mulish hl-text-16px hl-leading-1-2 o-font-normal hl-text-foreground"
            >
              {content.footnote}
            </AnimatedText>
          </div>
        )}
      </animated.div>
    </section>
  );
};
