/**
 * Content shape for the collection — GetLayers composition `vexon-showcase`:
 * a 4|8 heading row (label left, statement + paragraph right) over an even
 * row of three tall image cards, each with an index tag and a title-over-
 * caption footer.
 *
 * 📖 Docs: obsidian/frontend/sections.md
 */

import type { MediaImage } from "@/types/media";

export interface CollectionItem {
  id: string;
  /** Printed in the card's top-left corner — "01", "02", "03". */
  index: string;
  name: string;
  description: string;
  /** Already formatted for display — "1 890 €". */
  price: string;
  href: string;
  image: MediaImage;
}

export interface CollectionContent {
  eyebrow: string;
  headline: string;
  body: string;
  items: CollectionItem[];
  /** The label every card's link carries. */
  cta: string;
}
