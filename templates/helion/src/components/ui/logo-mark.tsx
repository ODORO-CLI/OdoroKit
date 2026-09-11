// 📖 Docs: obsidian/frontend/components/common.md

import { MARK_SVG_PATH, MARK_SVG_VIEWBOX } from "@/lib/brand/odoro-mark";

/**
 * ODORO's brand mark — a ring whose top-left quadrant is a square corner.
 *
 * Drawn from the single geometric definition in `lib/brand/odoro-mark.ts`, so it
 * is the same shape the WebGL scene assembles out of particles at the end of the
 * page. Pure SVG in `currentColor`: give it `text-accent-500` for the brand
 * orange, or leave it to inherit.
 *
 * Decorative: it never carries the name. The wordmark beside it is the accessible
 * label, so this is `aria-hidden` and the mark is invisible to a screen reader —
 * announcing it would just read the brand twice.
 */

export interface LogoMarkProps {
  /** Tailwind size classes. Defaults to the header's 28px. */
  className?: string;
}

export const LogoMark = ({ className = "size-7" }: LogoMarkProps) => (
  <svg
    aria-hidden="true"
    focusable="false"
    viewBox={MARK_SVG_VIEWBOX}
    className={`inline-block shrink-0 ${className}`}
  >
    <path d={MARK_SVG_PATH} fill="currentColor" fillRule="evenodd" />
  </svg>
);
