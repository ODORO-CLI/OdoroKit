// 📖 Docs: obsidian/frontend/utils.md

/** A window on a 0–1 progress axis. */
export type Range = readonly [start: number, end: number];

export const clamp01 = (value: number): number =>
  Math.min(1, Math.max(0, value));

/** Local 0–1 progress of `p` through `range` — 0 before it, 1 after it. */
export const span = (p: number, [start, end]: Range): number =>
  clamp01((p - start) / (end - start));

/** Sine in-out, `(1 − cos πt) / 2` — the source's easing for scrubbed phases. */
export const easeInOutSine = (t: number): number =>
  (1 - Math.cos(t * Math.PI)) / 2;

/** Sine out, `sin(πt / 2)` — the footer wordmark's settle. */
export const easeOutSine = (t: number): number => Math.sin((t * Math.PI) / 2);
