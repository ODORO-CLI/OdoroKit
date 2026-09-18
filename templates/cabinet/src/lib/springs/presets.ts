// 📖 Docs: obsidian/frontend/utils.md (lib/) · obsidian/frontend/text-engine.md

import { easings, type SpringConfig } from "@react-spring/web";

/**
 * Motion presets for the Keld Studio page — every timing the source wrote as a
 * CSS transition or a hand-rolled rAF lerp, re-expressed as spring configs.
 */

type SpringValues = Record<string, string | number>;

// ── Letter reveals (spring-text-engine) ────────────────────────────────────
// In/Out pairs keep matching value types — `x` numeric, `y` percentage
// strings, `filter` strings — or react-spring throws "Cannot animate between
// _AnimatedString and _AnimatedValue".

export interface LetterReveal {
  letterIn: SpringValues;
  letterOut: SpringValues;
}

/** Slide in from the left out of a blur — the hero words and ECHO®. */
export const SLIDE_BLUR: LetterReveal = {
  letterIn: { opacity: 1, x: 0, filter: "blur(0px)" },
  letterOut: { opacity: 0, x: -40, filter: "blur(12px)" },
};

/** Rise from under the line's clip out of a blur — labels, headings, quote. */
export const RISE_BLUR: LetterReveal = {
  letterIn: { opacity: 1, y: "0%", filter: "blur(0px)" },
  letterOut: { opacity: 0, y: "105%", filter: "blur(12px)" },
};

/**
 * A do-nothing word layer. TextEngine only renders — and therefore only clips —
 * a wrap layer whose `In` target is non-empty, so a letter that rises from
 * under its line needs this to have a line to rise from under.
 */
export const CLIP_LAYER: SpringValues = { opacity: 1 };

/** The source's `cubic-bezier(0.16, 1, 0.3, 1)` is easeOutExpo exactly. */
const settle = (duration: number): SpringConfig => ({
  duration,
  easing: easings.easeOutExpo,
});

/** Time-based reveals: per-letter stagger (ms) and per-letter spring. */
export const REVEAL_TIMING = {
  label: { stagger: 35, config: settle(1500) },
  cta: { stagger: 12, config: settle(800) },
  quote: { stagger: 7, config: settle(1600) },
} as const;

export type RevealTiming = keyof typeof REVEAL_TIMING;

/** Block one's entrance after the preloader: letters start across half of
 *  1.5s and each takes the other half — the source's intro curve. */
export const HERO_INTRO = {
  span: 750,
  config: { duration: 750, easing: easings.easeOutQuart } satisfies SpringConfig,
} as const;

/**
 * Scroll-triggered letters (`mode="progress" type="toggle"`): each springs in
 * as the scroll passes its threshold (`progress > i/n`), and back out on the
 * way up. Not `type="interpolate"` — that mode puts letter 0 fully in at
 * progress 0, so a word shows its first letters before its entrance starts.
 */
export const SCROLL_LETTER: SpringConfig = { tension: 170, friction: 26 };

// ── Scroll followers ──────────────────────────────────────────────────────
/**
 * The scene timeline trails the scroll. The source lerped 5% per frame on top
 * of Lenis — "cinematic inertia", a ~0.3 s time constant. An overdamped spring
 * gives the same trail without the lerp's frame-rate dependence.
 */
export const TIMELINE_FOLLOW: SpringConfig = { tension: 90, friction: 26 };

/** The footer reveal lerped 8% per frame — a touch quicker than the scene. */
export const FOOTER_FOLLOW: SpringConfig = { tension: 140, friction: 30 };

/** The PLAY badge lerped 12% per frame toward the cursor. */
export const BADGE_FOLLOW: SpringConfig = { tension: 300, friction: 40 };

// ── One-shot springs ──────────────────────────────────────────────────────
/** Stats count up over 2.2 s with a quintic settle. */
export const COUNT_UP: SpringConfig = {
  duration: 2200,
  easing: easings.easeOutQuint,
};

/** The preloader counter: ~2.8 s, quartic ease-out. */
export const PRELOADER_COUNT: SpringConfig = {
  duration: 2800,
  easing: easings.easeOutQuart,
};

/** The source's `cubic-bezier(0.77, 0, 0.175, 1)` — easeInOutQuart. */
export const PRELOADER_WIPE: SpringConfig = {
  duration: 1200,
  easing: easings.easeInOutQuart,
};
export const PRELOADER_FADE: SpringConfig = {
  duration: 800,
  easing: easings.easeInOutQuart,
};
/** The progress rule collapses on `cubic-bezier(0.85, 0, 0.15, 1)`. */
export const PRELOADER_RULE: SpringConfig = {
  duration: 800,
  easing: easings.easeInOutQuint,
};

/** Scene grid lines fade in once the preloader lifts. */
export const GRID_INTRO: SpringConfig = {
  duration: 800,
  easing: easings.easeInQuad,
};

/** The dock steps aside for the footer on the source's hover curve. */
export const DOCK_TOGGLE: SpringConfig = {
  duration: 350,
  easing: easings.easeOutQuart,
};

/** Portrait zoom on hover. */
export const PORTRAIT_HOVER: SpringConfig = {
  duration: 600,
  easing: easings.easeOutQuad,
};
