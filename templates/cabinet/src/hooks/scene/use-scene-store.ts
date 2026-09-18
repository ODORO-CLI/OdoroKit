// 📖 Docs: obsidian/frontend/hooks.md

import { create } from "zustand";

/**
 * The few facts the page's separate client leaves have to agree on. Nothing
 * per-frame lives here — scroll-driven values stay on springs.
 */
export interface SceneStore {
  /** Share of the frame sequence decoded, 0–1. The preloader waits on it. */
  framesProgress: number;
  setFramesProgress: (value: number) => void;
  /** The preloader has lifted far enough for the hero to play its entrance. */
  introReady: boolean;
  setIntroReady: (value: boolean) => void;
  /** The footer is being uncovered, so the floating dock steps aside. */
  dockHidden: boolean;
  setDockHidden: (value: boolean) => void;
}

export const useSceneStore = create<SceneStore>((set) => ({
  framesProgress: 0,
  setFramesProgress: (framesProgress) => set({ framesProgress }),
  introReady: false,
  setIntroReady: (introReady) => set({ introReady }),
  dockHidden: false,
  setDockHidden: (dockHidden) => set({ dockHidden }),
}));
