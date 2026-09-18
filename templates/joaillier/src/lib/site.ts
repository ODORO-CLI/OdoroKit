/**
 * Site-wide configuration — the single source of truth for SEO.
 *
 * Consumed by the metadata generator, `robots.ts`, `sitemap.ts`, and the
 * JSON-LD structured-data helper.
 */

export const siteConfig = {
  name: "ODORO",
  description:
    "Maison de joaillerie parisienne. Or 18 carats et argent 925, pièces fondues et gravées à la main, cent exemplaires par édition.",
  /**
   * Public origin, no trailing slash. Drives canonical URLs, OG tags and
   * JSON-LD.
   *
   * L original le lisait dans une variable d environnement, injectee a la
   * construction par l autre cadre. Il n y a plus de cadre : l origine se pose
   * ici, en toutes lettres, et c est la seule ligne a changer au deploiement.
   */
  url: "http://localhost:3000",
  /** Default Open Graph / Twitter share image (path under `public/`). */
  ogImage: "/open-graph.png",
  twitterHandle: "@maisonodoro",
  author: "Maison Odoro",
  /** Browser theme-color (address bar / PWA) — the page's night ground. */
  themeColor: "#03060f",
} as const;
