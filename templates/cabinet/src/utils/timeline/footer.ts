// 📖 Docs: obsidian/frontend/utils.md

/**
 * The footer reveal — a port of the source's footer-sentinel logic. `f` runs
 * 0 → 1 while the reveal spacer scrolls through the bottom of the viewport,
 * uncovering the fixed footer behind the reviews section.
 */

import { clamp01, easeOutSine } from "@/utils/timeline/range";

/** The CTA letters start once a fifth of the footer is uncovered. */
export const FOOTER_CTA_AT = 0.2;

/**
 * The wordmark rises in two voices: even letters (1-based, within their word)
 * start early, staggered, and travel less; odd letters start together, later,
 * and travel further. The interleave is what reads as a ripple.
 */
const EVEN = { step: 0.02, start: 0, end: 0.48, shiftRem: 5.625 } as const;
const ODD = { start: 0.12, end: 0.72, shiftRem: 8.75 } as const;

export const wordmarkShift = (f: number, indexInWord: number): string => {
  const even = (indexInWord + 1) % 2 === 0;
  const start = even ? EVEN.start + indexInWord * EVEN.step : ODD.start;
  const end = even ? EVEN.end + indexInWord * EVEN.step : ODD.end;
  const settle = easeOutSine(clamp01((f - start) / (end - start)));
  const shift = (1 - settle) * (even ? EVEN.shiftRem : ODD.shiftRem);
  return `translate3d(0, ${shift}rem, 0)`;
};
