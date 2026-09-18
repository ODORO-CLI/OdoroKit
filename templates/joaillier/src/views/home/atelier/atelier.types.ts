/**
 * Content shape for the atelier band — GetLayers composition `artist-cta`:
 * a full-viewport tonal inversion (the page's ONE lighter surface, the
 * palette's silver) holding a narrow copy column beside a portrait plate.
 *
 * 📖 Docs: obsidian/frontend/sections.md
 */

import type { MediaImage } from "@/types/media";

export interface AtelierContent {
  eyebrow: string;
  heading: string;
  body: string;
  cta: { label: string; href: string };
  image: MediaImage;
}
