/**
 * The site footer — the page's bookend.
 *
 * The wordmark is printed large, so the fixed copy the hero pinned to the top
 * of the window has no reason to stay: the panel tells the chrome store when
 * it is on screen and the header steps aside (see `site-chrome/`).
 *
 * 📖 Docs: obsidian/frontend/sections.md
 */

import { useRef } from "react";

import { useFooterWatch } from "@/components/common/site-chrome";
import { hoverTiming, focusRing } from "@/components/ui/action-link";
import { SegmentedText } from "@/components/ui/segmented-text";

import type { FooterContent } from "./footer.types";

const linkClass = `jo-font-ui jo-text-body jo-leading-copy jo-text-foreground-accent-strong jo-hover-text-foreground-accent o-transition-colors ${hoverTiming} ${focusRing}`;

export interface SiteFooterProps {
  content: FooterContent;
}

export const SiteFooter = ({ content }: SiteFooterProps) => {
  const panelRef = useRef<HTMLElement>(null);
  useFooterWatch(panelRef);

  return (
    <footer
      ref={panelRef}
      className="jo-border-line jo-px-page jo-pt-stack jo-pb-page o-border-t"
    >
      <p
        className="jo-font-display jo-text-foreground-accent text-trim jo-text-12vw jo-leading-0-85 jo-max-md-text-24vw"
        aria-label="Odoro"
      >
        <SegmentedText segments={content.wordmark} />
      </p>

      <div className="jo-mt-stack o-grid o-grid-cols-12 jo-gap-x-lg jo-gap-y-xl">
        <nav
          aria-label="Pied de page"
          className="o-col-span-7 o-grid o-grid-cols-3 jo-gap-lg jo-max-lg-col-span-12 jo-max-md-grid-cols-1 jo-max-md-gap-xl"
        >
          {content.columns.map((column) => (
            <div key={column.title}>
              <h3 className="jo-font-ui jo-text-caption jo-leading-caption jo-text-foreground-accent-muted text-trim o-uppercase jo-tracking-0-14em">
                {column.title}
              </h3>
              <ul className="jo-mt-lg o-flex o-flex-col jo-gap-sm">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <a href={link.href} className={linkClass}>
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="o-col-span-4 jo-col-start-9 jo-max-lg-col-span-12 jo-max-lg-col-start-1">
          <p className="jo-text-lead jo-leading-lead jo-text-foreground-accent-soft jo-font-ui">
            {content.tagline}
          </p>
          <ul className="jo-mt-lg o-flex o-flex-wrap jo-gap-lg">
            {content.social.map((link) => (
              <li key={link.label}>
                <a
                  href={link.href}
                  className={`jo-font-ui jo-text-caption jo-leading-caption jo-text-foreground-accent-muted jo-hover-text-foreground-accent o-uppercase jo-tracking-0-12em o-transition-colors ${hoverTiming} ${focusRing}`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="jo-bg-line jo-mt-stack o-h-px" aria-hidden />
      <p className="jo-font-ui jo-text-caption jo-leading-caption jo-text-foreground-accent-muted text-trim jo-mt-lg">
        {content.legal}
      </p>
    </footer>
  );
};
