/**
 * The opening curtain — the wordmark and a counter on the accent, and when
 * it leaves.
 *
 * 📖 Docs: obsidian/frontend/components/common.md
 */
export const preloaderConfig = {
  /**
   * The least time the curtain stays, in ms.
   *
   * A **floor**, never a ceiling. On a warm cache the film reports in before
   * the wordmark has resolved even once, and what the reader would get is a
   * flash of blue. Long enough here for the letters to land and one breath.
   */
  minShow: 1600,

  /**
   * The most time the curtain may hold the page, in ms.
   *
   * The counter is honest — it parks short of 100 until the film has a frame
   * — but a stalled network must never trap the visitor behind it. Past this
   * the curtain finishes anyway and the film arrives whenever it arrives.
   */
  maxWait: 7000,

  /**
   * How far the counter creeps before the film has reported in, 0–1.
   *
   * Short of 1 on purpose. A counter that reaches a hundred and then waits
   * has told the reader a lie it then has to hold; one that sits at ninety-two
   * is merely still working. What actually ends this is `filmReady`.
   */
  hold: 0.92,

  /** Filling to `hold`. Slow, and clamped so it never counts back. */
  fill: { tension: 26, friction: 34, clamp: true },

  /** …and closing the rest once the film is ready. Slow enough to follow. */
  finish: { tension: 110, friction: 30, clamp: true },

  /** The curtain leaving upward. */
  exit: { tension: 140, friction: 32, clamp: true },

  /**
   * How far up its own height the curtain is when the page may begin, 0–1.
   *
   * Not 1. Released at the half, the hero is already rising under the
   * curtain's trailing edge, and the screen is never empty. The curtain still
   * finishes its travel; only the signal moves.
   */
  releaseAt: 0.5,
} as const;
