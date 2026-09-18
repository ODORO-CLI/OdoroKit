/**
 * Content shape for the film — three scroll chapters over one persistent
 * full-bleed clip. GetLayers compositions `negantropy-entropy` (heading
 * bottom-left, meta + body high right), `negantropy-choice` (the mirror) and
 * `negantropy-persist` (the centred resolution with the CTA).
 *
 * 📖 Docs: obsidian/frontend/sections.md
 */

import type { MediaVideo } from "@/types/media";

export type ChapterAlign = "left" | "right" | "center";

export interface FilmChapter {
  id: string;
  /** The bracketed numeral — "( I )". */
  numeral: string;
  /** The small-caps meta beside it — "L'OR". */
  label: string;
  /** Heading lines, each its own line box. */
  heading: string[];
  body: string;
  /** Which corner the heading anchors to; `center` is the closing beat. */
  align: ChapterAlign;
  cta?: { label: string; href: string };
}

export interface FilmContent {
  ariaLabel: string;
  video: MediaVideo;
  chapters: FilmChapter[];
}
