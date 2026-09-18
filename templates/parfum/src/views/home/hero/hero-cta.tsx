import { Spring } from "@/components/animation/springs/spring";
import { FrameButton } from "@/components/ui/frame-button";

import { HERO_REVEAL } from "./hero.motion";
import type { HeroLink } from "./hero.types";

export type HeroCtaProps = HeroLink;

/**
 * Primary call to action (Figma 902:320).
 *
 * The button itself is `FrameButton` — the details section draws the identical
 * control, so the box and its hover live there and this file owns only where
 * the frame pins it.
 */
export const HeroCta = ({ label, href }: HeroCtaProps) => (
  // The wrapper owns the centring transform; the spring writes its own
  // `transform`, which would otherwise overwrite it.
  <div className="o-flex o-justify-center pf-lg-absolute pf-lg-bottom-10 pf-lg-left-1-2 pf-lg-block pf-lg-translate-x-1-2 pf-lg-justify-start pf-lg-z-10">
    <Spring
      tag="div"
      mode="once"
      from={{ opacity: 0, y: 12 }}
      to={{ opacity: 1, y: 0 }}
      delayIn={240}
    >
      <FrameButton label={label} href={href} revealDelay={HERO_REVEAL.cta} />
    </Spring>
  </div>
);
