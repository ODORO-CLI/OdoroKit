import { useState } from "react";
import { animated, useSpring } from "@react-spring/web";

import { LogoMark } from "@/components/ui/logo-mark";
import { Spring } from "@/components/animation/springs/spring";
import { Hover } from "@/components/animation/springs/hover";
import { useSections } from "@/hooks/sections/use-sections";
import { useHeroLayout } from "@/hooks/use-hero-scale";
import { useIsMobile } from "@/hooks/use-is-mobile";
import { scrollToSection } from "@/utils/scroll-to-section";
import { screens } from "@/lib/scene/screens";
import { easeReveal } from "@/utils/animation/easing";
import type { HeroNavContent } from "@/data/mocks/home";

/**
 * Fixed top navigation for the getLayers hero redesign (Figma node 666:1817).
 *
 * Two layouts share one component:
 *  - **Desktop** (`≥ hero-md`): three frosted pills — logo, link row, gradient
 *    CTA — laid out at their literal design pixels and scaled as one by the
 *    shared `useHeroLayout` factor, so the bar keeps the mockup's proportions.
 *    Each pill gets a spring hover (`<Hover>`, auto-off on touch).
 *  - **Mobile** (`< hero-md`): the pills don't scale down to nothing — the bar
 *    reflows to a logo + a burger that opens a frosted sheet of stacked links
 *    and the CTA.
 *
 * The scaling wrapper and the fixed/centring wrapper are separate elements: a
 * transform on the scaling node would otherwise become the containing block for
 * the fixed one and break the pin.
 */

const NAV_REVEAL = { duration: 1000, easing: easeReveal } as const;
const HOVER = { tension: 320, friction: 22 } as const;

const PILL =
  "hl-rounded-32px o-border-w-1 hl-border-color-var-hero-glass-border hl-bg-var-hero-glass hl-backdrop-blur-8px";

export interface HeroNavProps {
  content: HeroNavContent;
}

export const HeroNav = ({ content }: HeroNavProps) => {
  const isMobile = useIsMobile();
  return isMobile ? (
    <HeroNavMobile content={content} />
  ) : (
    <HeroNavDesktop content={content} />
  );
};

/* ------------------------------------------------------------------ desktop */

const HeroNavDesktop = ({ content }: HeroNavProps) => {
  const isLoaded = useSections((state) => state.isLoaded);
  const { scale, navTop } = useHeroLayout();

  return (
    <nav
      aria-label="Navigation principale"
      className="o-fixed o-left-1/2 hl-z-120 hl-translate-x-1-2"
      style={{ top: navTop }}
    >
      <div style={{ transform: `scale(${scale})`, transformOrigin: "top center" }}>
        <div className="o-flex o-items-center o-gap-1">
          {/* Logo pill — scrolls back to the top, so a real button. */}
          <Spring
            tag="div"
            enabled={isLoaded}
            from={{ opacity: 0, y: -10, filter: "blur(6px)" }}
            to={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            delayIn={120}
            config={NAV_REVEAL}
          >
            <Hover tag="div" from={{ scale: 1 }} to={{ scale: 1.04 }} config={HOVER}>
              <button
                type="button"
                onClick={() => scrollToSection(screens.HERO)}
                aria-label={content.wordmark}
                className={`o-flex hl-h-43px o-items-center hl-px-24px hl-py-12px ${PILL}`}
              >
                <LogoMark className="hl-size-19px hl-text-accent-500" />
                <span className="hl-ml-8px hl-font-mulish hl-text-18px hl-leading-none o-font-normal o-lowercase hl-tracking-0-01em hl-text-accent-500">
                  {content.wordmark}
                </span>
              </button>
            </Hover>
          </Spring>

          {/* Link row. */}
          <Spring
            tag="div"
            enabled={isLoaded}
            from={{ opacity: 0, y: -10, filter: "blur(6px)" }}
            to={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            delayIn={220}
            config={NAV_REVEAL}
            className={`o-flex o-items-center hl-px-32px hl-py-12px ${PILL}`}
          >
            <ul className="o-flex o-items-center hl-gap-32px hl-font-mulish hl-text-16px hl-leading-1-2 o-font-normal hl-text-foreground">
              {content.links.map((link) => (
                <Hover
                  tag="li"
                  key={link.label}
                  from={{ opacity: 0.68, y: 0 }}
                  to={{ opacity: 1, y: -1 }}
                  config={HOVER}
                >
                  <button
                    type="button"
                    onClick={() => scrollToSection(link.target)}
                    className="o-whitespace-nowrap"
                  >
                    {link.label}
                  </button>
                </Hover>
              ))}
            </ul>
          </Spring>

          {/* Gradient CTA. */}
          <Spring
            tag="div"
            enabled={isLoaded}
            from={{ opacity: 0, y: -10, filter: "blur(6px)" }}
            to={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            delayIn={320}
            config={NAV_REVEAL}
          >
            <Hover tag="div" from={{ scale: 1 }} to={{ scale: 1.04 }} config={HOVER}>
              <button
                type="button"
                onClick={() => scrollToSection(content.ctaTarget)}
                className="o-flex o-items-center hl-gap-8px hl-rounded-50px hl-px-28px hl-py-12px"
                style={{ backgroundImage: "var(--gradient-hero-cta)" }}
              >
                <span className="hl-font-mulish hl-text-16px hl-leading-1-2 o-font-normal o-whitespace-nowrap hl-text-foreground">
                  {content.ctaLabel}
                </span>
                <span
                  aria-hidden="true"
                  className="hl-size-3px o-shrink-0 o-rounded-full hl-bg-foreground"
                />
              </button>
            </Hover>
          </Spring>
        </div>
      </div>
    </nav>
  );
};

/* ------------------------------------------------------------------- mobile */

const HeroNavMobile = ({ content }: HeroNavProps) => {
  const isLoaded = useSections((state) => state.isLoaded);
  const [open, setOpen] = useState(false);

  /* Burger → X, and the sheet's reveal, both driven by `open`. */
  const t = useSpring({ t: open ? 1 : 0, config: { tension: 320, friction: 26 } });
  const sheet = useSpring({
    opacity: open ? 1 : 0,
    y: open ? 0 : -12,
    config: { tension: 260, friction: 30 },
  });

  const go = (target: string) => {
    setOpen(false);
    scrollToSection(target);
  };

  return (
    <nav
      aria-label="Navigation principale"
      className="o-fixed o-inset-x-0 o-top-0 hl-z-120 hl-px-16px hl-pt-16px"
    >
      <Spring
        tag="div"
        enabled={isLoaded}
        from={{ opacity: 0, y: -10, filter: "blur(6px)" }}
        to={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        delayIn={120}
        config={NAV_REVEAL}
        className="o-relative o-flex o-items-center o-justify-between"
      >
        {/* Logo pill. */}
        <button
          type="button"
          onClick={() => go(screens.HERO)}
          aria-label={content.wordmark}
          className={`o-flex hl-h-44px o-items-center hl-px-20px ${PILL}`}
        >
          <LogoMark className="hl-size-18px hl-text-accent-500" />
          <span className="hl-ml-8px hl-font-mulish hl-text-17px hl-leading-none o-font-normal o-lowercase hl-tracking-0-01em hl-text-accent-500">
            {content.wordmark}
          </span>
        </button>

        {/* Burger toggle. */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={open}
          className={`o-relative o-flex hl-size-44px o-items-center o-justify-center ${PILL} o-rounded-full`}
        >
          <span className="o-relative o-block hl-size-18px">
            <animated.span
              className="o-absolute o-left-0 o-block hl-h-1-5px o-w-full o-rounded-full hl-bg-foreground"
              style={{
                top: 4,
                transformOrigin: "center",
                transform: t.t.to(
                  (v) => `translateY(${v * 4}px) rotate(${v * 45}deg)`,
                ),
              }}
            />
            <animated.span
              className="o-absolute o-top-1/2 o-left-0 o-block hl-h-1-5px o-w-full hl-translate-y-1-2 o-rounded-full hl-bg-foreground"
              style={{ opacity: t.t.to((v) => 1 - v) }}
            />
            <animated.span
              className="o-absolute o-left-0 o-block hl-h-1-5px o-w-full o-rounded-full hl-bg-foreground"
              style={{
                bottom: 4,
                transformOrigin: "center",
                transform: t.t.to(
                  (v) => `translateY(${-v * 4}px) rotate(${-v * 45}deg)`,
                ),
              }}
            />
          </span>
        </button>

        {/* Sheet — stacked links + CTA. */}
        {open && (
          <animated.div
            style={{
              opacity: sheet.opacity,
              transform: sheet.y.to((v) => `translateY(${v}px)`),
            }}
            className={`o-absolute hl-top-calc-100-+10px o-right-0 o-flex hl-w-220px o-flex-col hl-gap-6px hl-p-10px ${PILL} hl-!rounded-24px`}
          >
            {content.links.map((link) => (
              <button
                key={link.label}
                type="button"
                onClick={() => go(link.target)}
                className="hl-rounded-16px hl-px-16px hl-py-12px o-text-left hl-font-mulish hl-text-16px hl-leading-none o-font-normal hl-text-foreground hl-active-bg-foreground-10"
              >
                {link.label}
              </button>
            ))}
            <button
              type="button"
              onClick={() => go(content.ctaTarget)}
              className="hl-mt-2px o-flex o-items-center o-justify-center hl-gap-8px hl-rounded-50px hl-px-20px hl-py-13px"
              style={{ backgroundImage: "var(--gradient-hero-cta)" }}
            >
              <span className="hl-font-mulish hl-text-16px hl-leading-none o-font-normal o-whitespace-nowrap hl-text-foreground">
                {content.ctaLabel}
              </span>
              <span
                aria-hidden="true"
                className="hl-size-3px o-shrink-0 o-rounded-full hl-bg-foreground"
              />
            </button>
          </animated.div>
        )}
      </Spring>
    </nav>
  );
};
