/**
 * The hero film — its entrance, and how it moves under the scroll.
 *
 * 📖 Docs: obsidian/frontend/components/common.md
 */
export const filmConfig = {
  /**
   * The film's entrance: it is held this much larger than the frame while
   * the curtain is up and settles to 1 as the curtain leaves — a real arrival,
   * not a fade. The scroll's own scale multiplies on top of it.
   */
  entranceScale: 1.08,
  entrance: { tension: 40, friction: 26, clamp: true },

  /**
   * Parallax over the pinned section, 0–1 of its scroll: how far the film
   * zooms in, and how far it drifts upward (in % of its own height) while the
   * chapters travel over it. The drift is what makes the film read as a plate
   * behind the copy rather than a wallpaper under it.
   */
  scrollScale: 0.16,
  scrollDrift: 10,

  /**
   * The porcelain scrim that gathers over the film as the chapters pass, so
   * the second chapter sits on a paler plate and the manifesto lands on the
   * page's own ground. Starts at `from` of the scroll, reaches `max` at the end.
   */
  scrim: { from: 0.12, max: 0.62 },
} as const;
