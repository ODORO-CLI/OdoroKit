/**
 * Content shape for the editions — GetLayers composition `lumora-portfolio`:
 * a centred outlined eyebrow chip and a centred display heading above a
 * two-up grid of tall cards, each a frame with a meta row pinned to its top
 * edge and a title at its foot.
 *
 * 📖 Docs: obsidian/frontend/sections.md
 */

import type { MediaImage } from "@/types/media";

export interface EditionCard {
  id: string;
  /** The meta row — "N°01 — PROFIL". */
  meta: string;
  title: string;
  image: MediaImage;
}

export interface EditionsContent {
  eyebrow: string;
  heading: string;
  cards: EditionCard[];
}
