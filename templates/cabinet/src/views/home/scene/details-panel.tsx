import { animated, type SpringValue } from "@react-spring/web";
import { useMemo } from "react";

import type { DetailsContent } from "@/data/mocks/home";
import type { SceneFlags } from "@/utils/timeline/scene";
import {
  PHASE,
  detailsClip,
  interiorScale,
  starTint,
  starTransform,
} from "@/utils/timeline/scene";

import { Showreel } from "./showreel";
import { StatCounter } from "./stat-counter";
import { ZoomOverlays } from "./zoom-overlays";

export interface DetailsPanelProps {
  content: DetailsContent;
  p: SpringValue<number>;
  flags: Pick<SceneFlags, "details" | "showreel" | "zoom">;
}

const STAR_PATH =
  "M0 12C6 12 12 6 12 0C12 6 18 12 24 12C18 12 12 18 12 24C12 18 6 12 0 12Z";

/**
 * Interior two — unmasked bottom-up over ECHO. Stats hold the corners around a
 * hairline cross; then the centre star warps out to fill the screen and the
 * showreel is uncovered on top of it.
 */
export const DetailsPanel = ({ content, p, flags }: DetailsPanelProps) => {
  const s = useMemo(
    () => ({
      clip: p.to(detailsClip),
      image: p.to(interiorScale(PHASE.details)),
      star: p.to(starTransform),
      tint: p.to(starTint),
    }),
    [p],
  );

  return (
    <animated.div
      className="o-absolute o-inset-0 o-z-20 o-overflow-hidden"
      style={{ clipPath: s.clip }}
    >
      <animated.div className="o-absolute o-inset-0" style={{ transform: s.image }}>
        <img
          src={content.image.src}
          alt={content.image.alt}
          className="o-absolute o-inset-0 o-h-full o-w-full o-object-cover"
        />
      </animated.div>

      <div aria-hidden className="o-pointer-events-none o-absolute o-inset-0 cb-z-22">
        <span className="o-absolute o-inset-x-0 o-top-1/2 o-h-px cb-bg-foreground-18" />
        <span className="o-absolute o-inset-y-0 o-left-1/2 o-w-px cb-bg-foreground-18" />
      </div>

      <h2 className="o-absolute o-left-10 o-top-10 cb-z-25 o-flex o-flex-col cb-font-display o-font-medium cb-text-title-phone cb-leading-display cb-tracking-title cb-sm-text-title">
        {content.title.map((line) => (
          <span key={line}>{line}</span>
        ))}
      </h2>

      <dl className="o-contents">
        {content.stats.map((stat) => (
          <StatCounter key={stat.label} stat={stat} active={flags.details} />
        ))}
      </dl>

      <ZoomOverlays content={content} p={p} active={flags.zoom} />

      <animated.div
        aria-hidden
        className="o-pointer-events-none o-absolute o-left-1/2 o-top-1/2 o-z-30 o-aspect-square cb-w-star cb--translate-1-2"
        style={{ transform: s.star }}
      >
        {/* Cream star, with a deep-oxblood copy fading in over it as it warps.
            Compositing at opacity t is the linear sRGB mix of the two, so the
            blend matches the source while both colours stay tokens. */}
        <svg viewBox="0 0 24 24" className="o-size-full" focusable={false}>
          <path d={STAR_PATH} className="cb-fill-foreground" />
          <animated.path
            d={STAR_PATH}
            className="cb-fill-surface-warp"
            style={{ opacity: s.tint }}
          />
        </svg>
      </animated.div>

      <Showreel content={content.showreel} p={p} active={flags.showreel} />
    </animated.div>
  );
};
