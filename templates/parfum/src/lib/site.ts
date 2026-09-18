/**
 * Site-wide configuration — the single source of truth for SEO.
 *
 * Consumed by the metadata generator, `robots.ts`, `sitemap.ts`, and the
 * JSON-LD structured-data helper. Update the placeholder values per project.
 */

export const siteConfig = {
  /**
   * The brand as the site itself spells it — the footer's copyright line and
   * the header logotype both read ODORO.
   */
  name: "ODORO",
  /**
   * Drawn from the site's own copy: the collections standfirst says what the
   * range is, the materials screen says what it is made of.
   */
  description:
    "ODORO, maison de parfum. Des extraits techniques pensés pour la chimie de la peau : tête stabilisée, coeur d'ambre chaud, concentration à 22 %.",
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
  /**
   * **Not set on purpose.** Inventing a handle risks pointing the card's
   * attribution at a stranger's account; fill this in with the real one.
   */
  twitterHandle: undefined as string | undefined,
  author: "ODORO",
  /**
   * Browser theme-color (address bar / PWA). The page ground, so the chrome
   * meets the paper rather than a black bar over a cream site — this is the
   * literal behind `--hero-surface` in Tier 1 of `globals.css`, and the two
   * have to be changed together.
   */
  themeColor: "#e3d3bd",
} as const;
