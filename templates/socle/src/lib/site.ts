/**
 * Site-wide configuration — the single source of truth for SEO.
 *
 * Consumed by the metadata generator, `robots.ts`, `sitemap.ts`, and the
 * JSON-LD structured-data helper. Update the placeholder values per project.
 */
export const siteConfig = {
  name: "ODORO",
  description:
    "La maison du Belvédère, 214 m², 4 chambres, terrain de 1 800 m². 1 340 000 € honoraires inclus. Agence ODORO, 140 biens vendus.",
  /**
   * Public origin, no trailing slash. Drives canonical URLs, OG tags, the
   * sitemap, and JSON-LD. Set `NEXT_PUBLIC_SITE_URL` in production.
   */
  url: import.meta.env.ODORO_SITE_URL ?? "http://localhost:3000",
  /**
   * Default Open Graph / Twitter share image.
   *
   * Generated at `src/app/opengraph-image.tsx` from the brand mark and the
   * values in this file, so the card cannot drift from the page's metadata.
   * Next serves it at this route and wires it into `<meta>` automatically; the
   * path is kept here because the metadata generator takes it as a parameter.
   */
  ogImage: "/opengraph-image",
  twitterHandle: "@odoro",
  author: "ODORO",
  /** Browser theme-color (address bar / PWA) — the hero sky, not black. */
  themeColor: "#1a506d",
} as const;
