import { animated, useSpring } from "@react-spring/web";

import type { StatContent } from "@/data/mocks/home";
import { COUNT_UP } from "@/lib/springs/presets";

export interface StatCounterProps {
  stat: StatContent;
  /** Counts up while true; drops back to zero at once when it clears. */
  active: boolean;
}

/** Phones: the top stat drops under the section title, and the two bottom
 *  stats sit above the dock with room to wrap their labels. */
const SLOT: Record<StatContent["slot"], string> = {
  "top-right": "o-right-10 o-top-10 o-items-end o-text-right max-md:o-right-6 cb-max-md-top-36",
  "bottom-left": "o-bottom-10 o-left-10 o-items-start cb-max-md-bottom-32 max-md:o-left-6",
  "bottom-right": "o-bottom-10 o-right-10 o-items-end o-text-right cb-max-md-bottom-32 max-md:o-right-6",
};

/** French digit grouping — "1 200", with a narrow no-break space. */
const format = (value: number) => value.toLocaleString("fr-FR");

/** Blur and drop fall away as the number lands — the source's "spinning drum". */
const DRUM_BLUR_REM = 0.5;
const DRUM_DROP_REM = 1.25;

/**
 * One corner stat. The spoken value is the real one, always; the animated
 * digits are presentation and hidden from assistive tech and crawlers.
 */
export const StatCounter = ({ stat, active }: StatCounterProps) => {
  const { n } = useSpring({
    n: active ? stat.value : 0,
    config: COUNT_UP,
    immediate: !active,
  });
  const rest = (value: number) => 1 - value / stat.value;

  return (
    <div className={`o-absolute cb-z-25 o-flex o-flex-col-reverse o-gap-6 cb-max-md-max-w-42 max-md:o-gap-3 ${SLOT[stat.slot]}`}>
      <dt className="cb-text-body-phone o-uppercase cb-leading-copy cb-tracking-copy cb-text-foreground-70 cb-sm-text-body">
        {stat.label}
      </dt>
      <dd className="cb-font-display o-font-medium cb-text-stat-phone o-tabular-nums cb-leading-hero cb-tracking-display cb-md-text-display-tablet cb-lg-text-display">
        <span className="o-sr-only">{format(stat.value)}</span>
        <animated.span
          aria-hidden
          className="o-inline-block"
          style={{
            filter: n.to((value) => `blur(${rest(value) * DRUM_BLUR_REM}rem)`),
            transform: n.to((value) => `translate3d(0, ${rest(value) * DRUM_DROP_REM}rem, 0)`),
          }}
        >
          {n.to((value) => format(Math.floor(value)))}
        </animated.span>
      </dd>
    </div>
  );
};
