/**
 * Site-wide configuration — the single source of truth for SEO.
 *
 * Consumed by the metadata generator, `robots.ts`, `sitemap.ts`, and the
 * JSON-LD structured-data helper.
 *
 * ODORO's domain name and social handles are NOT decided yet (cadrage §11) — the
 * `url` fallback and the handle below are holding values, not a promise.
 */
import { publicEnv } from "@/env";

export const siteConfig = {
  name: "ODORO",
  /**
   * The default `<title>` — the promise, not just the name. Pages set their own
   * title and it slots into the `%s — ODORO` template (see the metadata
   * generator); this is what shows on the home route and as the OG title.
   */
  title: "ODORO — Décris ton application, elle se construit",
  description:
    "Décris ton application dans un chat, en français, et repars avec une vraie application web qui fonctionne. Quatre rôles IA en chaîne — Architecte, Codeur, Relecteur, Réparateur — au lieu d'un modèle unique.",
  /**
   * Public origin, no trailing slash. Drives canonical URLs, OG tags, the
   * sitemap, and JSON-LD. Set `NEXT_PUBLIC_SITE_URL` in production.
   */
  url: publicEnv.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  /** Default Open Graph / Twitter share image (path under `public/`). */
  ogImage: "/open-graph.png",
  /** Holding value — no handle exists yet. */
  twitterHandle: "@odoro",
  author: "ODORO",
  /**
   * Copyright, in one place. Read by the JSON-LD `WebSite` node and by the
   * footer's baseline line — they used to state it independently, and an
   * independently-stated year is a year that goes stale in exactly one of them.
   */
  copyrightYear: 2026,
  copyrightHolder: "ODORO",
  /**
   * Browser theme-color. It must actually be `--background`: it paints the iOS
   * status bar and the Android toolbar, and a neutral near-black beside a warm
   * near-black page reads as a seam at the top of the screen.
   */
  themeColor: "#050608",
} as const;
