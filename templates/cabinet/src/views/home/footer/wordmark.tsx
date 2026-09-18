import { animated, type SpringValue } from "@react-spring/web";
import { Fragment, useMemo } from "react";

import { wordmarkShift } from "@/utils/timeline/footer";

export interface WordmarkProps {
  text: string;
  /** Footer reveal progress, 0–1. */
  f: SpringValue<number>;
  /** Phones scroll the footer normally — no reveal, so no rise. */
  still: boolean;
}

/**
 * The giant "Odoro" seated on the footer's bottom edge. Its letters rise
 * as the footer is uncovered, in two voices (see `utils/timeline/footer.ts`).
 *
 * The one letter animation here that is not TextEngine: its letters follow two
 * different progress windows by parity, which TextEngine's single stagger
 * cannot express (ADR-0024). The word itself is read once from the `sr-only` copy.
 */
export const Wordmark = ({ text, f, still }: WordmarkProps) => {
  const words = text.split(" ");
  const longest = Math.max(...words.map((word) => word.length));
  const shifts = useMemo(
    () =>
      Array.from({ length: longest }, (_, index) =>
        f.to((value) => wordmarkShift(value, index)),
      ),
    [f, longest],
  );

  return (
    <p className="o-relative cb-z-5 o-flex o-w-full o-justify-center max-md:o-mt-16 md:o-h-full md:o-items-end">
      <span className="o-sr-only">{text}</span>
      <span
        aria-hidden
        className="o-text-center cb-font-display o-font-medium cb-text-wordmark-phone cb-leading-wordmark cb-tracking-display cb-md-translate-y-wordmark-drop md:o-whitespace-nowrap cb-md-text-wordmark"
      >
        {words.map((word, wordIndex) => (
          <Fragment key={word}>
            {wordIndex > 0 && " "}
            <span className="o-inline-block o-whitespace-nowrap">
              {[...word].map((letter, index) => (
                <animated.span
                  key={index}
                  className="o-inline-block"
                  style={still ? undefined : { transform: shifts[index] }}
                >
                  {letter}
                </animated.span>
              ))}
            </span>
          </Fragment>
        ))}
      </span>
    </p>
  );
};
