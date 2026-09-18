import { create } from "zustand";

/**
 * The handover between the preloader and the page underneath it.
 *
 * Two booleans travelling in opposite directions, and they are deliberately
 * **not** one:
 *
 * - `filmReady` is the page telling the preloader it may finish. The hero film
 *   sets it once its first frame is decoded and drawable.
 * - `released` is the preloader telling the page it may begin. It is set
 *   part-way through the curtain's exit, so the hero's entrance plays *through*
 *   the departing curtain rather than into an empty screen after it.
 *
 * A store rather than props because the two ends are in different subtrees:
 * the curtain is a sibling of the whole page, and the thing it waits for is a
 * leaf inside the hero. Same reason the scroll store exists.
 */
export interface UsePreloader {
  /** The film has a drawn frame — or gave up; the curtain may finish. */
  filmReady: boolean;
  markFilmReady: () => void;
  /** The curtain is leaving; entrances may play. */
  released: boolean;
  release: () => void;
}

export const usePreloader = create<UsePreloader>((set) => ({
  filmReady: false,
  markFilmReady: () => set({ filmReady: true }),
  released: false,
  release: () => set({ released: true }),
}));
