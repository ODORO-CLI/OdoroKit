import { animated } from "@react-spring/web";

import { Spring } from "@/components/animation/springs/spring";
import { AnimatedHeading } from "@/components/animation/animated-heading";
import { AnimatedText } from "@/components/animation/animated-text";
import { ContactForm } from "@/views/home/sections/contact-form";
import { HeroIcon } from "@/views/home/sections/hero-icon";
import { useSections } from "@/hooks/sections/use-sections";
import { useSceneFade } from "@/hooks/sections/use-scene-fade";
import { useHeroLayout } from "@/hooks/use-hero-scale";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { screens } from "@/lib/scene/screens";
import { easeReveal } from "@/utils/animation/easing";
import type { HeroContent } from "@/data/mocks/home";

/**
 * Hero — the getLayers redesign (Figma node 665:1694).
 *
 * Desktop is a single fixed 1440×800 composition rendered at literal design
 * pixels and scaled as one unit by `useHeroLayout`, so the mockup's proportions
 * hold at every wide viewport. Below `hero-md` it reflows (`useIsMobile`) into a
 * centred vertical stack — the same four pieces (masthead, twin-triangle mark,
 * subtitle, contact form) sized for a phone rather than shrunk to nothing.
 *
 * Both layouts fade in on the preloader's `isLoaded` via staggered `<Spring>`s
 * and drift out on `useSceneFade`; the live vortex shows through behind them. The
 * fixed nav is a separate component (`HeroNav`).
 */

/** Matches the preloader's pause before unhiding the hero. */
const REVEAL_BASE_DELAY = 150;
const REVEAL = { duration: 1400, easing: easeReveal } as const;

const delay = (ms: number) => REVEAL_BASE_DELAY + ms;

export interface HeroProps {
  content: HeroContent;
}

export const Hero = ({ content }: HeroProps) => {
  const isMobile = useIsMobile();
  return isMobile ? (
    <HeroMobile content={content} />
  ) : (
    <HeroDesktop content={content} />
  );
};

/* ------------------------------------------------------------------ desktop */

const HeroDesktop = ({ content }: HeroProps) => {
  const isLoaded = useSections((state) => state.isLoaded);
  const active = useSections((state) => state.active);
  const fade = useSceneFade(screens.HERO);
  const { scale } = useHeroLayout();

  return (
    <section
      id="hero"
      aria-label={`${content.titleTop} ${content.titleBottom}`}
      className="o-relative o-h-svh o-w-full"
    >
      {/* Pinned to the viewport: the composition fades in place as the slide
          leaves. `pointer-events` follow the active slide. */}
      <animated.div
        style={{
          opacity: fade.opacity,
          pointerEvents: active === screens.HERO ? "auto" : "none",
        }}
        className="o-fixed o-inset-0 o-overflow-hidden"
      >
        {/* The 1440×800 design frame, centred and uniformly scaled. */}
        <div
          className="o-absolute o-top-1/2 o-left-1/2 hl-h-800px hl-w-1440px"
          style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
        >
          {/* Masthead — one h1, two lines, per-letter cascade from the bright ends. */}
          <AnimatedHeading
            tag="h1"
            enabled={isLoaded}
            baseDelay={delay(150)}
            className="o-absolute hl-top-100px hl-left-389px o-m-0 hl-w-663px o-text-center hl-font-mulish hl-text-56px hl-leading-none o-font-light"
            lines={[
              { text: content.titleTop, opaque: "left" },
              { text: content.titleBottom, opaque: "right" },
            ]}
          />

          {/* The ODORO emblem, ringed by a hairline white circle, over a soft
              black disc that lifts it off the bright particle field. */}
          <Spring
            tag="div"
            enabled={isLoaded}
            from={{ opacity: 0, scale: 0.82, filter: "blur(10px)" }}
            to={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            delayIn={delay(300)}
            config={REVEAL}
            className="o-absolute hl-top-360px hl-left-658-46px hl-h-124-97px hl-w-123-86px"
          >
            <span
              aria-hidden="true"
              className="o-pointer-events-none o-absolute o-top-1/2 o-left-1/2 hl-size-210px hl-translate-x-1-2 hl-translate-y-1-2 o-rounded-full hl-bg-black-60 o-blur-2xl"
            />
            <span
              aria-hidden="true"
              className="o-pointer-events-none o-absolute o-top-1/2 o-left-1/2 hl-size-285px hl-translate-x-1-2 hl-translate-y-1-2 o-rounded-full o-border-w-1 hl-border-color-var-hero-glass-border"
            />
            <HeroIcon className="o-relative o-size-full" />
          </Spring>

          {/* Subtitle — word-by-word fly-up. */}
          <AnimatedText
            enabled={isLoaded}
            delayIn={delay(500)}
            className="o-absolute hl-top-633px hl-left-518px o-m-0 hl-w-405px hl-font-mulish hl-text-16px hl-leading-1-2 o-font-normal hl-text-foreground"
          >
            {content.subtitle}
          </AnimatedText>

          {/* Frosted contact-form pill. */}
          <Spring
            tag="div"
            enabled={isLoaded}
            from={{ opacity: 0, y: 24, filter: "blur(8px)" }}
            to={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            delayIn={delay(650)}
            config={REVEAL}
            className="o-absolute hl-top-703px hl-left-409px hl-w-623px"
          >
            <ContactForm form={content.form} layout="row" />
          </Spring>
        </div>
      </animated.div>
    </section>
  );
};

/* ------------------------------------------------------------------- mobile */

const HeroMobile = ({ content }: HeroProps) => {
  const isLoaded = useSections((state) => state.isLoaded);
  const active = useSections((state) => state.active);
  const fade = useSceneFade(screens.HERO);

  return (
    <section
      id="hero"
      aria-label={`${content.titleTop} ${content.titleBottom}`}
      className="o-relative o-h-svh o-w-full"
    >
      <animated.div
        style={{
          opacity: fade.opacity,
          pointerEvents: active === screens.HERO ? "auto" : "none",
        }}
        className="o-fixed o-inset-0 o-overflow-hidden"
      >
        <div className="o-flex o-h-full o-w-full o-flex-col o-items-center o-justify-center hl-gap-22px hl-px-20px hl-pt-92px hl-pb-28px">
          <AnimatedHeading
            tag="h1"
            enabled={isLoaded}
            baseDelay={delay(150)}
            stagger={34}
            className="o-m-0 o-w-full o-text-center hl-font-mulish hl-text-clamp-24px-6-4vw-44px hl-leading-1-06 o-font-light"
            lines={[
              { text: content.titleTop, opaque: "left" },
              { text: content.titleBottom, opaque: "right" },
            ]}
          />

          <Spring
            tag="div"
            enabled={isLoaded}
            from={{ opacity: 0, scale: 0.82, filter: "blur(10px)" }}
            to={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
            delayIn={delay(300)}
            config={REVEAL}
            className="o-relative hl-my-6px hl-size-92px"
          >
            <span
              aria-hidden="true"
              className="o-pointer-events-none o-absolute o-top-1/2 o-left-1/2 hl-size-150px hl-translate-x-1-2 hl-translate-y-1-2 o-rounded-full hl-bg-black-60 o-blur-xl"
            />
            <span
              aria-hidden="true"
              className="o-pointer-events-none o-absolute o-top-1/2 o-left-1/2 hl-size-188px hl-translate-x-1-2 hl-translate-y-1-2 o-rounded-full o-border-w-1 hl-border-color-var-hero-glass-border"
            />
            <HeroIcon className="o-relative o-size-full" />
          </Spring>

          <AnimatedText
            enabled={isLoaded}
            delayIn={delay(500)}
            className="o-m-0 hl-max-w-400px hl-font-mulish hl-text-15px hl-leading-1-35 o-font-normal hl-text-foreground"
          >
            {content.subtitle}
          </AnimatedText>

          <Spring
            tag="div"
            enabled={isLoaded}
            from={{ opacity: 0, y: 24, filter: "blur(8px)" }}
            to={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            delayIn={delay(650)}
            config={REVEAL}
            className="o-w-full hl-max-w-420px"
          >
            <ContactForm form={content.form} layout="stack" />
          </Spring>
        </div>
      </animated.div>
    </section>
  );
};
