import { animated, type SpringValue } from "@react-spring/web";
import { useMemo } from "react";

import { RevealLines } from "@/components/ui/reveal-lines";
import type { DetailsContent } from "@/data/mocks/home";
import {
  overlayAsideTransform,
  overlayLeadTransform,
  overlayOpacity,
  overlayVisibility,
} from "@/utils/timeline/scene";

export interface ZoomOverlaysProps {
  content: Pick<DetailsContent, "zoomTitle" | "address" | "showroom">;
  p: SpringValue<number>;
  active: boolean;
}

/**
 * The copy that frames the showreel: fades in as it is uncovered, then parts
 * outward as it zooms. Too wide to survive a phone, so hidden below `md` — as
 * in the source. `visibility` follows opacity so hidden links leave the tab order.
 */
export const ZoomOverlays = ({ content, p, active }: ZoomOverlaysProps) => {
  const s = useMemo(
    () => ({
      opacity: p.to(overlayOpacity),
      visibility: p.to(overlayVisibility),
      lead: p.to(overlayLeadTransform),
      aside: p.to(overlayAsideTransform),
    }),
    [p],
  );

  return (
    <>
      <animated.div
        className="o-absolute o-left-10 o-top-1/2 cb-z-45 cb-w-overlay-lead max-md:o-hidden"
        style={{ opacity: s.opacity, visibility: s.visibility, transform: s.lead }}
      >
        <RevealLines
          tag="h3"
          lines={content.zoomTitle}
          active={active}
          timing="label"
          className="cb-font-display o-font-medium cb-text-headline-phone cb-leading-heading cb-tracking-title cb-sm-text-headline"
        />
      </animated.div>

      <animated.div
        className="o-absolute o-right-10 o-top-1/2 cb-z-45 o-flex cb-w-overlay-aside o-flex-col o-items-end max-md:o-hidden"
        style={{ opacity: s.opacity, visibility: s.visibility, transform: s.aside }}
      >
        <address className="o-flex o-flex-col o-items-end o-gap-2 o-text-right cb-text-body o-not-italic cb-leading-copy cb-tracking-copy cb-text-foreground-70">
          <span className="o-uppercase">{content.address.label}</span>
          <span>
            {content.address.lines.map((line) => (
              <span key={line} className="o-block">
                {line}
              </span>
            ))}
          </span>
        </address>
      </animated.div>

      <animated.a
        href={content.showroom.href}
        target="_blank"
        rel="noopener"
        className="group o-absolute cb-inset-x-10 o-top-10 cb-z-45 o-flex o-items-center o-gap-3 o-border-t cb-border-foreground-22 o-pt-4 cb-text-body o-uppercase cb-tracking-copy cb-transition-color-border-color-translate cb-duration-var-duration-normal cb-ease-glide cb-hover-translate-y-0-5 cb-hover-border-foreground-85 cb-hover-text-foreground-85 cb-focus-visible-outline-1 cb-focus-visible-outline-offset-4 cb-focus-visible-outline-foreground max-md:o-hidden"
        style={{ opacity: s.opacity, visibility: s.visibility }}
      >
        <span
          aria-hidden
          className="o-inline-block cb-leading-none cb-transition-rotate cb-duration-var-duration-normal cb-ease-glide cb-group-hover-rotate-90"
        >
          ✦
        </span>
        {content.showroom.label}
      </animated.a>
    </>
  );
};
