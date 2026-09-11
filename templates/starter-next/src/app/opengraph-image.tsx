import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/site";

/**
 * Share card, generated from the brand mark and `siteConfig` so the title,
 * description and logo can never drift from the page's own metadata.
 *
 * 1200 × 630 is the size every scraper expects; `generate-page-metadata.ts`
 * declares the same numbers.
 */
export const alt = `${siteConfig.name} — ${siteConfig.description}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          // The hero's sky ramp, flattened to two stops.
          backgroundImage: "linear-gradient(160deg, #1a506d 0%, #6f9fb5 100%)",
          color: "#ffffff",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <svg width="49" height="49" viewBox="0 0 100 100" fill="none">
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M0 0H50A50 50 0 1 1 0 50Z M15 15H50A35 35 0 1 1 15 50Z"
            fill="#f97316"
          />
        </svg>
          <div style={{ fontSize: 34, letterSpacing: 6, textTransform: "uppercase" }}>
            {siteConfig.name}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ fontSize: 76, lineHeight: 1.05, maxWidth: 900 }}>
            Where the road ends and the quiet begins
          </div>
          <div style={{ fontSize: 30, lineHeight: 1.35, maxWidth: 820, opacity: 0.85 }}>
            {siteConfig.description}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
