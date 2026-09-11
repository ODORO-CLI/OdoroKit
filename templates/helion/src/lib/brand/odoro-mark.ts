// 📖 Docs: obsidian/frontend/design-system.md (brand) · decisions-log.md ADR-0045
//
// The ODORO mark, as NUMBERS rather than as a picture.
//
// The mark is a ring whose top-left quadrant is replaced by a right angle: a 270°
// circular arc closed by two straight edges meeting at a square corner. Because that
// is pure geometry it is authored here as a construction and never as a raster, so
// the 2D icon (`<LogoMark>`), the hero emblem (`<HeroIcon>`) and the particle mark
// the WebGL scene assembles (`three/objects/logo-mark.ts`) are the SAME shape by
// definition and cannot drift apart. It stays crisp at any size and ships as zero
// bytes of binary.
//
// This module MUST stay free of `three` and of React — it is imported by Server
// Components and by the scene alike.

/**
 * Inner radius as a fraction of the outer radius — i.e. how thick the ring is.
 * Measured off the supplied artwork: a 72px stroke on a 242px outer radius.
 */
export const MARK_INNER_RATIO = 0.7;

/**
 * One ring of the mark, as an SVG sub-path (y-DOWN, per SVG convention), for a
 * ring of radius `r` centred on (`cx`, `cy`).
 *
 * Square corner at (cx−r, cy−r) → top edge right to the top of the circle → a
 * single 270° arc (`large-arc-flag=1`, `sweep-flag=1` = clockwise on screen) round
 * to the left of the circle → `Z` closes the left edge back up to the corner.
 */
export const markRing = (cx: number, cy: number, r: number): string =>
  `M${cx - r} ${cy - r}H${cx}A${r} ${r} 0 1 1 ${cx - r} ${cy}Z`;

/**
 * The complete mark — outer ring + inner ring — filling a square box of side
 * `size`. **Requires `fill-rule="evenodd"`**: the second sub-path is the hole, not
 * a second shape.
 */
export const markPath = (size: number): string => {
  const r = size / 2;
  return `${markRing(r, r, r)} ${markRing(r, r, r * MARK_INNER_RATIO)}`;
};

/** Viewbox the icon path is authored in — 24×24, matching the icon set. */
export const MARK_SVG_VIEWBOX = "0 0 24 24";

/** The 24×24 icon path. */
export const MARK_SVG_PATH = markPath(24);
