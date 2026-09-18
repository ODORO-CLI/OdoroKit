import { useRef } from "react";

import { Hover } from "@/components/animation/springs/hover";
import { scrollToSection } from "@/utils/scroll-to-section";
import { screens } from "@/lib/scene/screens";
import { cubicBezier } from "@/utils/animation/easing";
import type { FooterContent, NavItem, SocialLink } from "@/data/mocks/home";

/**
 * Footer — the normal-flow base beneath the last slide.
 *
 * The original had no entrance animation (it lives outside the scene), so this
 * is pure layout plus hovers. Every SCSS hover animated a token colour —
 * link `rgba(#fff,.6)` → `#fff`, the CTA border/bg warm — so links spring their
 * own opacity (resting 0.6 reads as `foreground/60`) and the CTA's colour
 * crossfade is a stacked overlay, matching the hero pattern. Anchors carry
 * `href` natively, so the `<a>`/`<button>` is the real element and the `<Hover>`
 * wraps its label (spring props can't pass `href`/`type`).
 */

/** CSS `ease` — the SCSS default on every hover. */
const EASE = cubicBezier(0.25, 0.1, 0.25, 1);
const HOVER = { duration: 300, easing: EASE } as const;
/** The links' quicker `.25s` colour fade. */
const LINK = { duration: 250, easing: EASE } as const;

const FooterNavLink = ({ item }: { item: NavItem }) => {
  const ref = useRef<HTMLButtonElement>(null);

  return (
    <li>
      <button
        ref={ref}
        type="button"
        onClick={() => scrollToSection(item.target)}
        className="o-inline-flex o-items-center max-md:o-min-h-11"
      >
        <Hover
          tag="span"
          trigger={ref}
          from={{ opacity: 0.6 }}
          to={{ opacity: 1 }}
          config={LINK}
          className="o-font-sans hl-text-0-875rem hl-leading-none hl-tracking-0-02em hl-text-foreground"
        >
          {item.label}
        </Hover>
      </button>
    </li>
  );
};

const FooterSocialLink = ({ item }: { item: SocialLink }) => {
  const ref = useRef<HTMLAnchorElement>(null);

  return (
    <li>
      <a
        ref={ref}
        href={item.href}
        rel="noopener"
        className="o-inline-flex o-items-center max-md:o-min-h-11"
      >
        <Hover
          tag="span"
          trigger={ref}
          from={{ opacity: 0.6 }}
          to={{ opacity: 1 }}
          config={LINK}
          className="o-font-sans hl-text-0-75rem hl-leading-none hl-tracking-0-12em hl-text-foreground o-uppercase"
        >
          {item.label}
        </Hover>
      </a>
    </li>
  );
};

export interface FooterProps {
  content: FooterContent;
}

export const Footer = ({ content }: FooterProps) => {
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const topRef = useRef<HTMLButtonElement>(null);

  return (
    <footer
      id="footer"
      /* Top margin and padding are tightened so the closing plate reads as one
         continuous panel with Impact above it (the old `60vh` gap left it
         floating far below). The gradient wash still eases it in from the
         `--background` the faded scene leaves behind. */
      className="o-relative hl-z-2 hl-mt-16vh o-w-full hl-bg-image-var-gradient-footer hl-pt-4rem o-pb-14 hl-max-hero-md-mt-10vh hl-max-hero-md-pt-3-25rem hl-max-hero-md-pb-11"
    >
      {/* Hairline top rule fading out toward the edges. */}
      <span
        aria-hidden="true"
        className="o-absolute o-top-0 o-left-1/2 o-h-px hl-w-min-100-var-container-max hl-translate-x-1-2 hl-bg-image-var-gradient-footer-rule"
      />

      <div className="page-gutter o-flex o-w-full o-flex-col">
        {/* Top band — wordmark + tagline, CTA on the right. */}
        <div className="o-flex o-items-end o-justify-between o-gap-10 hl-pb-3-375rem hl-max-hero-md-flex-col hl-max-hero-md-items-start hl-max-hero-md-gap-1-875rem hl-max-hero-md-pb-10">
          <div>
            <p className="o-m-0 hl-font-lato hl-text-clamp-2-875rem-7vw-5-75rem-0-9 hl-tracking-0-04em hl-text-foreground">
              {content.wordmark}
            </p>
            <p className="hl-mt-1-125rem hl-max-w-34ch o-font-sans hl-text-0-9375rem-1-6 hl-text-foreground-56">
              {content.tagline}
            </p>
          </div>

          <a
            ref={ctaRef}
            href={content.ctaHref}
            className="o-relative o-inline-flex o-shrink-0 o-items-center o-gap-3 hl-rounded-6-25rem o-border-w-1 hl-border-foreground-18 hl-px-1-625rem hl-py-0-9375rem o-font-sans hl-text-0-875rem hl-leading-none o-font-medium hl-tracking-0-04em hl-text-foreground"
          >
            <Hover
              tag="span"
              trigger={ctaRef}
              from={{ opacity: 0 }}
              to={{ opacity: 1 }}
              config={HOVER}
              aria-hidden="true"
              className="o-pointer-events-none o-absolute o-inset-0 hl-rounded-6-25rem o-border-w-1 hl-border-accent-500-55 hl-bg-accent-500-8"
            />
            <span className="o-relative">{content.ctaLabel}</span>
            <Hover
              tag="span"
              trigger={ctaRef}
              from={{ x: 0 }}
              to={{ x: 4 }}
              config={HOVER}
              aria-hidden="true"
              className="o-relative hl-text-0-875rem hl-text-accent-500-95"
            >
              →
            </Hover>
          </a>
        </div>

        {/* Nav band — primary links left, social right; hairline-ruled top and
            bottom in the accent tone to rhyme with the Impact ledger rules. */}
        <nav
          aria-label="Footer"
          className="o-flex o-items-center o-justify-between o-gap-6 o-border-t o-border-b hl-border-accent-500-12 o-py-7 hl-max-hero-md-flex-col hl-max-hero-md-items-start hl-max-hero-md-gap-1-375rem"
        >
          <ul className="o-flex o-flex-wrap o-items-center o-gap-7 hl-max-hero-xs-gap-5">
            {content.nav.map((item) => (
              <FooterNavLink key={item.label} item={item} />
            ))}
          </ul>
          <ul className="o-flex o-flex-wrap o-items-center o-gap-7 hl-max-hero-xs-gap-5">
            {content.social.map((item) => (
              <FooterSocialLink key={item.label} item={item} />
            ))}
          </ul>
        </nav>

        {/* Baseline — copyright + back-to-top. */}
        <div className="o-flex o-items-center o-justify-between hl-gap-1-125rem hl-pt-1-875rem hl-max-hero-xs-flex-col hl-max-hero-xs-items-start hl-max-hero-xs-gap-4">
          <p className="o-m-0 o-font-sans hl-text-0-75rem-1-5 hl-tracking-0-04em hl-text-foreground-38">
            {content.copy}
          </p>
          <button
            ref={topRef}
            type="button"
            onClick={() => scrollToSection(screens.HERO)}
            className="o-inline-flex o-items-center hl-text-foreground max-md:o-min-h-11"
          >
            <Hover
              tag="span"
              trigger={topRef}
              from={{ opacity: 0.6 }}
              to={{ opacity: 1 }}
              config={LINK}
              className="o-inline-flex o-items-center o-gap-2 o-font-sans hl-text-0-75rem hl-leading-none o-font-medium hl-tracking-0-14em o-uppercase"
            >
              Back to top
              <Hover
                tag="span"
                trigger={topRef}
                from={{ y: 0 }}
                to={{ y: -3 }}
                config={HOVER}
                aria-hidden="true"
              >
                ↑
              </Hover>
            </Hover>
          </button>
        </div>
      </div>
    </footer>
  );
};
