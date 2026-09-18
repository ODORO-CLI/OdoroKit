/**
 * Content shape for the hero section.
 *
 * 📖 Docs: obsidian/frontend/hero.md
 */

import type { TitleSegment } from "@/types/typography";

export interface HeroLink {
  label: string;
  href: string;
}

export interface HeroContent {
  /** Accessible name of the section — the phrase the two display blocks spell. */
  ariaLabel: string;
  /** Wordmark, top-left. Segmented for the italic/roman alternation. */
  wordmark: TitleSegment[];
  /** Primary navigation, top-right column. */
  nav: HeroLink[];
  /** Call to action in the top-right corner. */
  cta: HeroLink;
  /** Display block that opens from the left of the window. */
  titleStart: TitleSegment[];
  /** Display lines that open from the right of the window. */
  titleEnd: TitleSegment[][];
  /** Caption row directly above the centre window. */
  cardCaptionTop: string[];
  /** Caption row directly below the centre window. */
  cardCaptionBottom: string[];
  /** Heading of the collection list, bottom-right. */
  collectionsLabel: string;
  /** The collection's families, under the heading. */
  collections: HeroLink[];
  /** Finish switcher, bottom-left. `active` is rendered at full opacity. */
  viewModes: { label: string; active: boolean }[];
  media: {
    /**
     * The footage the section opens on. `alt` labels the element rather than
     * replacing it — a video has no `alt`, so it goes on `aria-label`.
     */
    video: { src: string; alt: string; width: number; height: number };
    /**
     * The clip's last frame at full resolution, dissolved over the video the
     * moment the footage stops (`STILL_MS`). No `alt`, no size: it is the same
     * shot the `<video>` already names, so it is decorative and fills the
     * footage's box rather than carrying a size of its own.
     */
    still: { src: string };
    /** The photograph used by both edge thumbnails. */
    thumbnail: { src: string; alt: string; width: number; height: number };
  };
}
