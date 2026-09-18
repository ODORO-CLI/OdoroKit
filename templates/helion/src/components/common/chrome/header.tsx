import { useRef } from "react";

import { LogoMark } from "@/components/ui/logo-mark";
import { Spring } from "@/components/animation/springs/spring";
import { Hover } from "@/components/animation/springs/hover";
import { useSections } from "@/hooks/sections/use-sections";
import { scrollToSection } from "@/utils/scroll-to-section";
import { screens } from "@/lib/scene/screens";
import { cubicBezier } from "@/utils/animation/easing";
import type { HeaderContent } from "@/data/mocks/home";

/**
 * Header — the fixed brand band over the scene.
 *
 * The original hid the whole bar until the WebGL preloader finished
 * (`.controller.-not-loaded .header { opacity: 0 }`, `transition: opacity 1s`);
 * here that one-second fade is a `<Spring>` off `isLoaded`. Its `--nav` modifier
 * — which revealed the "Chapters" jump once the reader had scrolled past the
 * hero — becomes `showNav` driving another `<Spring>` rather than a CSS class.
 *
 * Every hover in the SCSS crossfaded a token-derived colour (border / bg /
 * shadow), which react-spring can't interpolate, so each is a stacked overlay
 * whose opacity springs — the same trick the hero CTA uses.
 */

/** CSS `ease` — the SCSS default on every hover transition. */
const EASE = cubicBezier(0.25, 0.1, 0.25, 1);
/** CSS `o-ease-in` — the `--nav` reveal's transform curve. */
const EASE_IN = cubicBezier(0.42, 0, 1, 1);
/** The burger bars' `cubic-bezier(.4,0,.2,1)` morph curve. */
const EASE_BURGER = cubicBezier(0.4, 0, 0.2, 1);

const NAV_REVEAL = { duration: 300, easing: EASE_IN } as const;
const HOVER = { duration: 300, easing: EASE } as const;
const GLOW = { duration: 350, easing: EASE } as const;
const BURGER = { duration: 300, easing: EASE_BURGER } as const;

export interface HeaderProps {
  content: HeaderContent;
}

export const Header = ({ content }: HeaderProps) => {
  const active = useSections((state) => state.active);
  const isLoaded = useSections((state) => state.isLoaded);
  const isMenuOpen = useSections((state) => state.isMenuOpen);
  const setIsMenuOpen = useSections((state) => state.setIsMenuOpen);

  const navRef = useRef<HTMLButtonElement>(null);
  const ctaRef = useRef<HTMLElement>(null);
  const burgerRef = useRef<HTMLButtonElement>(null);

  // The original derived `--nav` from `active`: the jump-to-chapters control
  // only exists once the reader is past the intro but not yet at the sitemap.
  const showNav =
    active !== screens.NONE &&
    active !== screens.HERO &&
    active !== screens.SITEMAP;

  return (
    <Spring
      tag="header"
      enabled={isLoaded}
      from={{ opacity: 0 }}
      to={{ opacity: 1 }}
      config={{ duration: 1000 }}
      className="o-fixed o-top-0 o-left-0 hl-z-120 o-w-full hl-pt-calc-2-8125rem-env-safe-area-inset-top-0px hl-max-pad-sm-pt-calc-1-875rem-env-safe-area-inset-top-0px hl-max-menu-pt-calc-1-375rem-env-safe-area-inset-top-0px hl-max-hero-xs-pt-calc-1-125rem-env-safe-area-inset-top-0px"
    >
      <div className="page-gutter o-flex o-w-full o-items-center o-justify-between">
        {/* Logo — scrolls back to the top rather than navigating, so a real
            <button>, not a link. */}
        <button
          type="button"
          onClick={() => scrollToSection(screens.HERO)}
          className="o-flex o-items-center"
        >
          <LogoMark className="o-size-7 hl-max-menu-size-2-125rem hl-max-hero-xs-size-1-875rem" />
          <span className="hl-ml-0-875rem o-font-sans o-text-base hl-leading-none o-font-semibold hl-tracking-0-3em hl-text-foreground o-uppercase hl-max-menu-text-1-0625rem hl-max-menu-tracking-0-34em hl-max-hero-xs-ml-3 hl-max-hero-xs-text-0-9375rem hl-max-hero-xs-tracking-0-32em">
            {content.wordmark}
          </span>
        </button>

        {/* Primary nav — hidden below the burger breakpoint. */}
        <nav
          aria-label={content.navLabel}
          className="o-flex o-grow o-items-center o-justify-between hl-px-5-125rem hl-max-1151px--px-10 hl-max-pad-sm-px-1-875rem hl-max-menu-hidden"
        >
          <Spring
            tag="div"
            enabled={showNav}
            from={{ opacity: 0, y: 15 }}
            to={{ opacity: 1, y: 0 }}
            config={NAV_REVEAL}
          >
            <button
              ref={navRef}
              type="button"
              onClick={() => scrollToSection(screens.SITEMAP)}
              className="hl-font-lato o-text-base hl-leading-1-19 o-font-bold o-whitespace-nowrap hl-text-foreground"
            >
              <Hover
                tag="span"
                trigger={navRef}
                from={{ y: 0, opacity: 1 }}
                to={{ y: -4, opacity: 0.5 }}
                config={HOVER}
                className="o-inline-block"
              >
                {content.navLabel}
              </Hover>
            </button>
          </Spring>
        </nav>

        {/* Live-demo CTA — decorative pill echoing the hero button. */}
        <Hover
          tag="button"
          ref={ctaRef}
          from={{ y: 0 }}
          to={{ y: -1 }}
          config={HOVER}
          className="o-relative o-inline-flex o-items-center hl-gap-0-625rem o-rounded-full o-border-w-1 hl-border-accent-500-45 hl-bg-accent-500-6 hl-px-1-375rem hl-py-0-6875rem o-font-sans hl-text-0-6875rem-none o-font-semibold hl-tracking-0-22em o-whitespace-nowrap hl-text-foreground o-uppercase hl-shadow-cta hl-max-menu-hidden"
        >
          <Hover
            tag="span"
            trigger={ctaRef}
            from={{ opacity: 0 }}
            to={{ opacity: 1 }}
            config={HOVER}
            aria-hidden="true"
            className="o-pointer-events-none o-absolute o-inset-0 o-rounded-full o-border-w-1 hl-border-accent-500 hl-bg-accent-500-14 hl-shadow-cta-hover"
          />
          <span className="o-relative">{content.ctaLabel}</span>
          <Hover
            tag="span"
            trigger={ctaRef}
            from={{ x: 0, y: -1 }}
            to={{ x: 4, y: -1 }}
            config={HOVER}
            aria-hidden="true"
            className="o-relative hl-text-0-875rem hl-text-accent-300"
          >
            →
          </Hover>
        </Hover>

        {/* Burger — shown only below the breakpoint; morphs into an X on open. */}
        <button
          ref={burgerRef}
          type="button"
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="o-relative o-hidden o-size-11 o-shrink-0 o-rounded-full o-border-w-1 hl-border-accent-500-35 hl-bg-accent-500-6 hl-shadow-cta hl-max-menu-block hl-max-hero-xs-size-10"
        >
          {/* Hover brighten + blurred halo. */}
          <Hover
            tag="span"
            trigger={burgerRef}
            from={{ opacity: 0 }}
            to={{ opacity: 1 }}
            config={HOVER}
            aria-hidden="true"
            className="o-pointer-events-none o-absolute o-inset-0 o-rounded-full o-border-w-1 hl-border-accent-500-85 hl-bg-accent-500-12"
          />
          <Hover
            tag="span"
            trigger={burgerRef}
            from={{ opacity: 0 }}
            to={{ opacity: 1 }}
            config={GLOW}
            aria-hidden="true"
            className="o-pointer-events-none o-absolute hl-inset-1px hl-z-10 o-rounded-full hl-bg-image-var-gradient-burger-glow hl-blur-4px"
          />
          {/* Open-state brighten (the SCSS `--menu-active` pill tint). */}
          <Spring
            tag="span"
            enabled={isMenuOpen}
            from={{ opacity: 0 }}
            to={{ opacity: 1 }}
            config={BURGER}
            aria-hidden="true"
            className="o-pointer-events-none o-absolute o-inset-0 o-rounded-full o-border-w-1 hl-border-accent-500-85 hl-bg-accent-500-14"
          />

          {/* Three bars. Each is centred on the pill (`o-left-1/2` + margin for x,
              a −0.75px y nudge for vertical centring) and springs to the X. */}
          <Spring
            tag="span"
            enabled={isMenuOpen}
            from={{ y: -6.75, rotate: 0 }}
            to={{ y: -0.75, rotate: -45 }}
            config={BURGER}
            aria-hidden="true"
            className="o-absolute o-top-1/2 o-left-1/2 hl-ml-0-5625rem o-block hl-h-1-5px hl-w-1-125rem hl-rounded-2px hl-bg-accent-300 hl-max-hero-xs--ml-0-5rem hl-max-hero-xs-w-1rem"
          >
            <Spring
              tag="span"
              enabled={isMenuOpen}
              from={{ opacity: 0 }}
              to={{ opacity: 1 }}
              config={BURGER}
              className="o-absolute o-inset-0 hl-rounded-2px hl-bg-foreground"
            />
          </Spring>
          <Spring
            tag="span"
            enabled={isMenuOpen}
            from={{ y: -0.75, scaleX: 1, opacity: 1 }}
            to={{ y: -0.75, scaleX: 0, opacity: 0 }}
            config={BURGER}
            aria-hidden="true"
            className="o-absolute o-top-1/2 o-left-1/2 hl-ml-0-375rem o-block hl-h-1-5px hl-w-0-75rem hl-rounded-2px hl-bg-accent-300 hl-max-hero-xs--ml-0-3125rem hl-max-hero-xs-w-0-625rem"
          />
          <Spring
            tag="span"
            enabled={isMenuOpen}
            from={{ y: 5.25, rotate: 0 }}
            to={{ y: -0.75, rotate: 45 }}
            config={BURGER}
            aria-hidden="true"
            className="o-absolute o-top-1/2 o-left-1/2 hl-ml-0-5625rem o-block hl-h-1-5px hl-w-1-125rem hl-rounded-2px hl-bg-accent-300 hl-max-hero-xs--ml-0-5rem hl-max-hero-xs-w-1rem"
          >
            <Spring
              tag="span"
              enabled={isMenuOpen}
              from={{ opacity: 0 }}
              to={{ opacity: 1 }}
              config={BURGER}
              className="o-absolute o-inset-0 hl-rounded-2px hl-bg-foreground"
            />
          </Spring>
        </button>
      </div>
    </Spring>
  );
};
