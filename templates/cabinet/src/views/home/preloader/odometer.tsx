import { animated, to, type SpringValue } from "@react-spring/web";
import { useMemo } from "react";

import { Spring } from "@/components/animation/springs/spring";
import { PRELOADER_FADE } from "@/lib/springs/presets";

export interface OdometerProps {
  /** The counter's clock, 0–1 over ~2.8 s. */
  t: SpringValue<number>;
  /** Share of the frame sequence actually decoded, 0–1. */
  loaded: SpringValue<number>;
  exiting: boolean;
}

const STEPS = Array.from({ length: 101 }, (_, value) => value);
const BLANK = " ";

/** Hundreds, tens, ones — each a strip of 101 cells that rolls as one. */
const COLUMNS = [
  (value: number) => (value < 100 ? BLANK : "1"),
  (value: number) => (value < 10 ? BLANK : String(Math.floor((value % 100) / 10))),
  (value: number) => String(value % 10),
] as const;

/** The exit runs right to left: the % first, the hundreds last. */
const EXIT_STAGGER_MS = 50;
const EXIT_FROM = { opacity: 1, x: 0 };
const EXIT_TO = { opacity: 0, x: -40 };

/**
 * The rolling percentage that travels from the left edge to the right while the
 * sequence loads. It shows the SMALLER of the clock and the real load — the
 * source ran a fixed 2.8 s counter and then sat at 100% while frames were still
 * arriving; this one cannot claim more than has loaded.
 */
export const Odometer = ({ t, loaded, exiting }: OdometerProps) => {
  const s = useMemo(() => {
    const count = to([t, loaded], (clock: number, done: number) =>
      Math.min(clock, done) * 100,
    );
    return {
      // `left: n%` + `translateX(-n%)` walks the counter edge to edge without
      // measuring it: 0 → flush left, 100 → flush right.
      travel: {
        left: count.to((value) => `${value}%`),
        transform: count.to((value) => `translateX(-${value}%)`),
      },
      // One cell is 0.9em — one line of `leading-hero`.
      roll: count.to((value) => `translateY(-${value * 0.9}em)`),
    };
  }, [t, loaded]);

  return (
    <div className="o-absolute cb-inset-x-10 o-bottom-10 cb-h-0-9em cb-font-display o-font-medium cb-text-display-phone o-tabular-nums cb-leading-hero cb-tracking-display cb-sm-text-display-tablet cb-lg-text-display cb-max-md-inset-x-6">
      <animated.div className="o-absolute o-bottom-0 o-flex cb-h-0-9em o-overflow-hidden" style={s.travel}>
        {COLUMNS.map((digit, index) => (
          <Spring
            key={index}
            tag="span"
            enabled={exiting}
            from={EXIT_FROM}
            to={EXIT_TO}
            delayIn={(COLUMNS.length - index) * EXIT_STAGGER_MS}
            config={PRELOADER_FADE}
            className="o-flex"
          >
            <animated.span className="o-flex o-flex-col o-text-center" style={{ transform: s.roll }}>
              {STEPS.map((step) => (
                <span key={step} className="o-block cb-h-0-9em">
                  {digit(step)}
                </span>
              ))}
            </animated.span>
          </Spring>
        ))}
        <Spring
          tag="span"
          enabled={exiting}
          from={EXIT_FROM}
          to={EXIT_TO}
          config={PRELOADER_FADE}
          className="o-ml-1 o-block cb-h-0-9em"
        >
          %
        </Spring>
      </animated.div>
    </div>
  );
};
