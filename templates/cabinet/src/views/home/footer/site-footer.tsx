import { useSpring } from "@react-spring/web";
import { useRef, useState, type RefObject } from "react";

import { ProgressTrigger } from "@/components/animation/springs/progress-trigger";
import { ArrowLink } from "@/components/ui/arrow-link";
import { GridLines } from "@/components/ui/grid-lines";
import { RevealLines } from "@/components/ui/reveal-lines";
import type { FooterContent } from "@/data/mocks/home";
import { useWindowWidth } from "@/hooks/use-window-size";
import { FOOTER_FOLLOW } from "@/lib/springs/presets";
import { FOOTER_CTA_AT } from "@/utils/timeline/footer";

import { Wordmark } from "./wordmark";

export interface SiteFooterProps {
  content: FooterContent;
}

/** Below `md` the footer is an ordinary block — the source's own switch. */
const STACK_BELOW = 768;

/**
 * The reveal footer. On desktop it is fixed behind the page, and a transparent
 * spacer the same height (`h-footer-reveal`, one token for both) scrolls past
 * to uncover it — the spacer's progress drives the CTA and the wordmark.
 */
export const SiteFooter = ({ content }: SiteFooterProps) => {
  const spacerRef = useRef<HTMLDivElement>(null);
  const [{ f }, api] = useSpring(() => ({ f: 0, config: FOOTER_FOLLOW }));
  const [ctaActive, setCtaActive] = useState(false);
  const ctaRef = useRef(false);
  // Until the spacer starts uncovering it, the desktop footer sits fully
  // covered behind the page. Hidden, the browser neither paints a full-screen
  // photo under the scene nor picks that photo as the LCP element.
  const [revealed, setRevealed] = useState(false);
  const revealedRef = useRef(false);
  const width = useWindowWidth();
  const stacked = width > 0 && width < STACK_BELOW;

  return (
    <>
      <div ref={spacerRef} aria-hidden className="o-hidden cb-h-footer-reveal md:o-block" />
      <ProgressTrigger
        tag="span"
        trigger={spacerRef as RefObject<HTMLElement>}
        start="top bottom"
        end="bottom bottom"
        frameInterval={0}
        className="o-hidden"
        onChange={({ progress }) => {
          api.start({ f: progress });
          const shown = progress > 0;
          if (shown !== revealedRef.current) {
            revealedRef.current = shown;
            setRevealed(shown);
          }
          const next = progress >= FOOTER_CTA_AT;
          if (next !== ctaRef.current) {
            ctaRef.current = next;
            setCtaActive(next);
          }
        }}
      />

      <footer className={`${revealed ? "" : "md:o-invisible"} o-z-10 o-flex o-overflow-hidden cb-bg-surface-footer cb-text-foreground max-md:o-relative max-md:o-flex-col max-md:o-items-center max-md:o-px-6 max-md:o-pt-20 md:o-fixed md:o-inset-x-0 md:o-bottom-0 cb-md-h-footer-reveal`}>
        <img
          src={content.background.src}
          alt={content.background.alt}
          className="o-absolute o-inset-0 o-h-full o-w-full o-object-cover"
        />
        <div aria-hidden className="o-absolute o-inset-0 cb-bg-surface-footer-20" />
        <GridLines className="cb-z-2 cb-max-md-inset-x-6" />

        <div className="o-relative cb-z-15 o-flex o-flex-col o-items-center o-gap-10 md:o-absolute cb-md-inset-x-8 md:o-top-10 md:o-grid md:o-grid-cols-4 md:o-items-start">
          <div className="o-flex o-flex-col o-items-center o-gap-8 md:o-col-span-2 cb-md-max-w-126 md:o-items-start md:o-pl-5">
            <RevealLines
              tag="h2"
              lines={content.cta}
              active={stacked || ctaActive}
              timing="cta"
              className="cb-font-display o-font-medium cb-text-headline-phone cb-leading-heading cb-tracking-title cb-sm-text-headline"
              engineClassName="o-justify-center o-text-center md:o-justify-start md:o-text-left"
            />
            <ArrowLink href={content.contact.href} label={content.contact.label} variant="glass" />
          </div>

          <address className="o-flex o-flex-col o-items-center o-gap-2 o-text-center cb-text-body o-not-italic cb-leading-copy cb-tracking-copy cb-text-foreground-70 md:o-col-start-3 md:o-items-start md:o-pl-5 md:o-text-left">
            {content.details.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </address>

          <nav aria-label={content.navLabel} className="md:o-col-start-4 md:o-pl-5">
            <ul className="o-flex o-flex-wrap o-justify-center o-gap-6 md:o-flex-col cb-md-gap-4-5">
              {content.links.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="o-inline-block cb-text-lead o-font-medium o-uppercase cb-tracking-copy cb-transition-opacity-translate cb-duration-var-duration-normal cb-ease-glide hover:o-translate-x-1 hover:o-opacity-70 cb-focus-visible-outline-1 cb-focus-visible-outline-offset-4 cb-focus-visible-outline-foreground"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <Wordmark text={content.wordmark} f={f} still={stacked} />
      </footer>

      {/* `#contact` lands at the very end of the page: the footer fully
          uncovered on desktop, scrolled into view on a phone. */}
      <span id="contact" aria-hidden className="o-block o-h-px" />
    </>
  );
};
