import { useEffect, useState } from "react";
import { animated } from "@react-spring/web";

import { Spring } from "@/components/animation/springs/spring";
import { AnimatedHeading } from "@/components/animation/animated-heading";
import { AnimatedText } from "@/components/animation/animated-text";
import { ContactForm } from "@/views/home/sections/contact-form";
import { useSections } from "@/hooks/sections/use-sections";
import { useSceneFade } from "@/hooks/sections/use-scene-fade";
import { useHeroLayout } from "@/hooks/use-hero-scale";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { screens } from "@/lib/scene/screens";
import { easeReveal } from "@/utils/animation/easing";
import type { LogoSceneContent } from "@/data/mocks/home";

/**
 * Logo scene — the fourth slide, where the particle mark assembles.
 *
 * The mark itself lives on the main WebGL scene (`three/objects/logo-mark.ts`,
 * driven by `Controller`), assembling in the centre. This slide frames it with
 * the hero composition (masthead + subtitle + contact form). Desktop lays those
 * on the scaled 1440×800 frame; below `hero-md` it reflows to a vertical stack
 * that pins the heading to the top and the subtitle/form to the foot, leaving the
 * assembling mark clear in the middle.
 *
 * The entrance latches the first time the slide goes active (`revealed`), and
 * `useSceneFade` drifts the whole composition out as it leaves.
 */

const REVEAL = { duration: 1400, easing: easeReveal } as const;

export interface LogoParticlesProps {
  content: LogoSceneContent;
}

export const LogoParticles = ({ content }: LogoParticlesProps) => {
  const active = useSections((state) => state.active);
  const isLoaded = useSections((state) => state.isLoaded);
  const isMobile = useIsMobile();
  const fade = useSceneFade(screens.IMPACT);
  const { scale } = useHeroLayout();

  /* Latch the entrance the first time the slide goes active; never replays. */
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    if (active === screens.IMPACT) setRevealed(true);
  }, [active]);

  return (
    <section
      id="impact"
      aria-label={`${content.titleTop} ${content.titleBottom}`}
      className="o-relative o-h-svh o-w-full"
    >
      {/* Pinned to the viewport: fades in place. Held hidden until the scene has
          loaded so it never bleeds through the preloader. */}
      <animated.div
        style={{
          opacity: isLoaded ? fade.opacity : 0,
          pointerEvents: active === screens.IMPACT ? "auto" : "none",
        }}
        className="o-fixed o-inset-0 o-overflow-hidden"
      >
        {isMobile ? (
          <div className="o-flex o-h-full o-w-full o-flex-col o-justify-between hl-px-20px hl-pt-100px hl-pb-36px">
            <AnimatedHeading
              tag="h2"
              id="impact-heading"
              enabled={revealed}
              baseDelay={150}
              stagger={34}
              className="o-m-0 o-w-full o-text-center hl-font-mulish hl-text-clamp-24px-6-4vw-44px hl-leading-1-06 o-font-light"
              lines={[
                { text: content.titleTop, opaque: "left" },
                { text: content.titleBottom, opaque: "right" },
              ]}
            />

            <div className="o-flex o-flex-col o-items-center hl-gap-18px">
              <AnimatedText
                enabled={revealed}
                delayIn={520}
                className="o-m-0 hl-max-w-400px hl-font-mulish hl-text-15px hl-leading-1-35 o-font-normal hl-text-foreground"
              >
                {content.subtitle}
              </AnimatedText>

              <Spring
                tag="div"
                enabled={revealed}
                from={{ opacity: 0, y: 24, filter: "blur(8px)" }}
                to={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                delayIn={720}
                config={REVEAL}
                className="o-w-full hl-max-w-420px"
              >
                <ContactForm form={content.form} layout="stack" />
              </Spring>
            </div>
          </div>
        ) : (
          <div
            className="o-absolute o-top-1/2 o-left-1/2 hl-h-800px hl-w-1440px"
            style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
          >
            {/* Masthead — per-letter cascade from the bright ends, as in the hero. */}
            <AnimatedHeading
              tag="h2"
              id="impact-heading"
              enabled={revealed}
              baseDelay={150}
              className="o-absolute hl-top-100px hl-left-389px o-m-0 hl-w-663px o-text-center hl-font-mulish hl-text-56px hl-leading-none o-font-light"
              lines={[
                { text: content.titleTop, opaque: "left" },
                { text: content.titleBottom, opaque: "right" },
              ]}
            />

            {/* Subtitle — word-by-word fly-up, above the form as in the hero. */}
            <AnimatedText
              enabled={revealed}
              delayIn={520}
              className="o-absolute hl-top-633px hl-left-518px o-m-0 hl-w-405px hl-font-mulish hl-text-16px hl-leading-1-2 o-font-normal hl-text-foreground"
            >
              {content.subtitle}
            </AnimatedText>

            {/* Frosted contact-form pill — the hero's, carried onto the payoff. */}
            <Spring
              tag="div"
              enabled={revealed}
              from={{ opacity: 0, y: 24, filter: "blur(8px)" }}
              to={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              delayIn={720}
              config={REVEAL}
              className="o-absolute hl-top-703px hl-left-409px hl-w-623px"
            >
              <ContactForm form={content.form} layout="row" />
            </Spring>
          </div>
        )}
      </animated.div>
    </section>
  );
};
