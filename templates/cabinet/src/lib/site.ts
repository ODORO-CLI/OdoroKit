/**
 * Site-wide configuration — the single source of truth for SEO.
 *
 * Consumed by the metadata generator, `robots.ts`, `sitemap.ts`, and the
 * JSON-LD structured-data helper.
 */

export const siteConfig = {
  name: "Cabinet Odoro",
  /** Default document title — the brand plus the page's own h1. */
  title: "Cabinet Odoro — Avocats à Paris",
  description:
    "Cabinet d'avocats fondé en 1987. Droit des affaires, contentieux, droit pénal, droit de la famille et droit immobilier : conseil avec conviction, défense sans compromis.",
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
  /** No handle is known for the firm; empty omits the Twitter site/creator tags. */
  twitterHandle: "",
  author: "Cabinet Odoro",
  /** Browser theme-color (address bar / PWA). */
  themeColor: "#0a0908",
  /** Contact facts for the LegalService JSON-LD node (placeholder data). */
  telephone: "+33 1 42 60 00 00",
  email: "contact@cabinet-odoro.fr",
  address: {
    streetAddress: "12, place Vendôme",
    postalCode: "75001",
    addressLocality: "Paris",
    addressCountry: "FR",
  },
} as const;
