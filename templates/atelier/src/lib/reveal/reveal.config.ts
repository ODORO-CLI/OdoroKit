/**
 * How type and blocks resolve out of a layer's reveal.
 *
 * One custom property, `--stage-reveal`, is written by a spring on the layer;
 * everything under it works out its own share in CSS — see `<StageReveal>`
 * and `stageRise`. These are the numbers that shape that share.
 *
 * 📖 Docs: obsidian/frontend/components/common.md
 */
export const revealConfig = {
  /**
   * How much of the reveal the scrambled letter order is spread across, 0–1.
   * At 0.6 the last letter starts when the reveal is 60% through and every
   * letter takes the remaining 40% to land — a sweep, not a pop.
   */
  spread: 0.6,

  /** The reveal itself, 0 → 1. Slow, clamped: type must never overshoot. */
  entrance: { tension: 62, friction: 30, clamp: true },

  /**
   * Where on the reveal each block of copy begins to arrive, in reading order,
   * and how much of the reveal it spends arriving.
   */
  copyStagger: [0.12, 0.26, 0.38, 0.48] as const,
  copySpan: 0.45,
} as const;
