/**
 * The page's reveal vocabulary, in one place so every section agrees.
 *
 * Two arrivals, both doing the same three things at once — rise, unblur, fade
 * in — because a line that only moves reads as mechanical and one that only
 * fades reads as arriving from nowhere. Neither clips: a blurred reveal under
 * `overflow: hidden` has its halo sheared off at the line box, which is the
 * whole effect gone. So there is no `overflow` here and no leading floor to
 * respect — the display faces can keep their tight absolute leading.
 *
 * Opacity lands early on the curve (easeOutCubic) so type is solid while still
 * travelling and de-blurring — that, not the travel, is what reads as expensive.
 *
 * Numbers are from the reveal-choreography house rules (line 90–140ms stagger
 * over 900–1100ms; word 20–85ms over 520–900ms).
 *
 * 📖 Docs: obsidian/frontend/sections.md
 */

import { easings } from "@react-spring/web";

/** A heading: line by line. */
export const LINE_REVEAL = {
  lineIn: { y: 0, opacity: 1, filter: "blur(0px)" },
  lineOut: { y: 36, opacity: 0, filter: "blur(12px)" },
  lineStagger: 120,
  lineConfig: { duration: 1000, easing: easings.easeOutCubic },
} as const;

/** Copy promoted to display size — the manifesto: word by word. */
export const WORD_REVEAL = {
  wordIn: { y: 0, opacity: 1, filter: "blur(0px)" },
  wordOut: { y: 24, opacity: 0, filter: "blur(10px)" },
  wordStagger: 38,
  wordConfig: { duration: 900, easing: easings.easeOutCubic },
} as const;

/** A block that is not text — a paragraph, a card, a button: rises into place. */
export const RISE = {
  from: { opacity: 0, y: 24 },
  to: { opacity: 1, y: 0 },
  config: { tension: 90, friction: 26 },
} as const;

/** A photograph: settles from a slight enlargement, so it reads as focused. */
export const SETTLE = {
  from: { opacity: 0, scale: 1.06 },
  to: { opacity: 1, scale: 1 },
  config: { tension: 70, friction: 28 },
} as const;
