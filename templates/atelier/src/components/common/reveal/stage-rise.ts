// 📖 Docs: obsidian/frontend/components/common.md

/**
 * A block of copy rising into place from its layer's reveal.
 *
 * The block-level counterpart to `<StageReveal>`: where that resolves a line
 * word by word, this brings a whole block up — opacity and a short lift — and
 * each block on a screen takes its start at a different point of the reveal,
 * which is the stagger. Same mechanism, same custom property: `--stage-reveal`
 * is written once per frame by the layer above, and everything under it works
 * out its own share in CSS.
 *
 * `clamp()` rather than relying on `opacity`'s own clamping, because the same
 * share drives the lift, and `transform` does not clamp anything. The lift's
 * length is a token, `--stage-rise`, so the whole page rises by one measure.
 */

import type { CSSProperties } from "react";

import { revealConfig } from "@/lib/reveal/reveal.config";

/**
 * @param at where on the reveal (0–1) this block begins to arrive
 * @param span how much of the reveal it spends arriving
 */
export const stageRise = (
  at: number,
  span: number = revealConfig.copySpan,
): CSSProperties => {
  const share = `clamp(0, calc((var(--stage-reveal, 1) - ${at.toFixed(
    3,
  )}) / ${span.toFixed(3)}), 1)`;
  return {
    opacity: share,
    transform: `translateY(calc((1 - ${share}) * var(--stage-rise)))`,
  };
};
