import { animated, useSpring } from "@react-spring/web";

import { markPath } from "@/lib/brand/odoro-mark";

/**
 * The ODORO emblem at the centre of the hero.
 *
 * Two layers, one geometric source (`lib/brand/odoro-mark.ts`):
 *  - the mark itself — the ring with the square corner — held STILL, because its
 *    orientation is its identity (a turning corner reads as a spinner);
 *  - a thin 270° orbit around it that runs clockwise on a steady linear loop, so
 *    the emblem stays a live object the way Helion's twin triangles were.
 *
 * Motion is a `@react-spring/web` loop (hard rule #1: no CSS keyframes); a linear
 * easing keeps the revolution perfectly steady, and `<ReducedMotion>` freezes it
 * through react-spring's global skip flag. Colours are the brand tokens
 * (`--brand-orange` → `--brand-peach`), so a palette move recolours it for free.
 * The gradient stops set `stop-color` through `style`, not the attribute — a
 * `var()` in an SVG presentation attribute is ignored by some engines.
 */

/** The 140-unit box the emblem is drawn in: mark of diameter 100, orbit at r 64. */
const BOX = 140;
const MARK = 100;
const INSET = (BOX - MARK) / 2;
const ORBIT_R = 64;
/** Orbit stroke width, in box units. */
const ORBIT_W = 1.5;
/** Three quarters of the orbit drawn, one quarter open — the mark's own sweep. */
const ORBIT_DASH = `${2 * Math.PI * ORBIT_R * 0.75} ${2 * Math.PI * ORBIT_R}`;

/** The mark, in a 100-unit box (translated to the centre of the emblem). */
const MARK_PATH = markPath(MARK);

/** One revolution of the orbit, in ms. */
const ORBIT_PERIOD = 14000;

/** Linear, looping 0 → 360° — a steady clockwise spin. */
const spin = (duration: number) => ({
  from: { rotate: 0 },
  to: { rotate: 360 },
  loop: true,
  config: { duration, easing: (t: number) => t },
});

const STOP_A = { stopColor: "var(--brand-orange)" } as const;
const STOP_B = { stopColor: "var(--brand-peach)" } as const;

export interface HeroIconProps {
  className?: string;
}

export const HeroIcon = ({ className }: HeroIconProps) => {
  const orbit = useSpring(spin(ORBIT_PERIOD));

  return (
    <div className={className}>
      {/* The orbit — a thin arc, spinning. */}
      <animated.svg
        viewBox={`0 0 ${BOX} ${BOX}`}
        fill="none"
        aria-hidden="true"
        className="o-absolute o-inset-0 o-size-full"
        style={{
          transformOrigin: "center",
          transform: orbit.rotate.to((r) => `rotate(${r}deg)`),
        }}
      >
        <circle
          cx={BOX / 2}
          cy={BOX / 2}
          r={ORBIT_R}
          stroke="url(#hero-icon-orbit)"
          strokeWidth={ORBIT_W}
          strokeLinecap="round"
          strokeDasharray={ORBIT_DASH}
          opacity={0.55}
        />
        <defs>
          <linearGradient
            id="hero-icon-orbit"
            x1="0"
            y1="0"
            x2={BOX}
            y2={BOX * 0.4}
            gradientUnits="userSpaceOnUse"
          >
            <stop style={STOP_A} />
            <stop offset="1" style={STOP_B} />
          </linearGradient>
        </defs>
      </animated.svg>

      {/* The mark — still. */}
      <svg
        viewBox={`0 0 ${BOX} ${BOX}`}
        fill="none"
        aria-hidden="true"
        className="o-absolute o-inset-0 o-size-full"
      >
        <g transform={`translate(${INSET} ${INSET})`}>
          <path d={MARK_PATH} fill="url(#hero-icon-mark)" fillRule="evenodd" />
        </g>
        <defs>
          <linearGradient
            id="hero-icon-mark"
            x1="0"
            y1="0"
            x2={BOX}
            y2={BOX * 0.4}
            gradientUnits="userSpaceOnUse"
          >
            <stop style={STOP_A} />
            <stop offset="1" style={STOP_B} />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
