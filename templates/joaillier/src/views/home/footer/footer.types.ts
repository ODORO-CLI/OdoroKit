/**
 * Content shape for the site footer.
 *
 * 📖 Docs: obsidian/frontend/sections.md
 */

import type { TitleSegment } from "@/types/typography";

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface FooterContent {
  /** The wordmark, printed large — the fixed chrome stands down over it. */
  wordmark: TitleSegment[];
  columns: FooterColumn[];
  tagline: string;
  social: FooterLink[];
  legal: string;
}
