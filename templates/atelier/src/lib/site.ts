/**
 * Site-wide configuration — the single source of truth for SEO.
 *
 * Consumed by the metadata generator, `robots.ts`, `sitemap.ts`, and the
 * JSON-LD structured-data helper.
 */

export const siteConfig = {
  name: "ODORO",
  /**
   * The one sentence, and it is the hero's own: search results and share
   * cards get the same promise the first screen makes.
   */
  description:
    "ODORO — le vêtement comme une présence. Blazers, chemises, pantalons et cuirs coupés à Paris en petites séries. Collection 01.",
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
  twitterHandle: "@odoro",
  author: "ODORO",
  /** Browser theme-color — the accent, the colour of the opening curtain. */
  themeColor: "#0051ff",
} as const;
