/**
 * The lookbook ring — GetLayers section `carousel-spotlight`, its CONFIG.
 *
 * The engine (a preserve-3d ring driven by one `--rot`, cards on it via
 * `rotateY(--a) translateZ(-r)`, snap-to-card settling guarded so a static
 * scene stops mutating transforms) is the section's **preserved** motion
 * layer. These numbers art-direct it; they do not rewrite it.
 *
 * 📖 Docs: obsidian/frontend/components/common.md
 */
export const spotlightConfig = {
  /** Total cards around the ring; the looks cycle to fill it. */
  slots: 14,
  /** Multiplier on the responsive card width. */
  cardScale: 1,
  /** Card height / width. */
  cardRatio: 1.36,
  /** Ring radius as a multiple of card width. */
  radiusK: 3,
  /** 0 = flat row, 1 = deep concave (viewer at the ring's centre). */
  arcDepth: 0.7,
  /** Perspective strength; lower is punchier. */
  perspective: 1,
  /** The responsive card width: a share of the stage, between two bounds (px). */
  cardWidth: { share: 0.17, min: 150, max: 238 },

  /** Idle rotation in deg/frame. 0 → snap-to-card settling instead of drift. */
  autoSpin: 0,
  /** Degrees of ring rotation per pixel dragged. */
  drag: 0.16,
  /** Inertia decay after release. */
  damp: 0.94,
  /** How much of the remaining distance the snap closes per frame. */
  snap: 0.14,
  /** Below this velocity the ring is considered at rest and snaps. */
  restVelocity: 0.05,
  /** A press that travels less than this is a tap, and taps focus a card. */
  tapSlop: 6,
} as const;
