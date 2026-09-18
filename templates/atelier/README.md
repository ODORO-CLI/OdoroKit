# Atelier — ODORO, un label de mode

One-page site for **ODORO**, a Paris clothing label — a pinned studio film with
copy travelling over it, a manifesto, a six-piece collection, a 3D lookbook
carousel, a WebGL closing screen, and a footer on the brand's one accent.

![ODORO — the hero film's first frame](public/assets/hero/odoro-hero-poster.jpg)

## Ce qui a changé au passage sur notre moteur

Le gabarit arrive d'ailleurs. Le design n'a pas bougé : à 390, 768, 1280 et
1440 px, la hauteur du `main` et les 510 nœuds qu'il contient concordent avec
l'original, et les deux socles concordent sur quinze balises et vingt
propriétés. Il reste deux à trois écarts de 0,6 à 2,5 px sur des surcouches en
position absolue — elles ne participent pas au flux, et la hauteur de la page
est identique au centième de pixel près. Le plancher de bruit, mesuré en
comparant l'original à lui-même, est de zéro : ces écarts sont donc réels,
petits, et localisés.

| | |
|---|---|
| Le cadre | Il n'y en a plus. `index.html` + `src/main.tsx` + `src/App.tsx` remplacent `layout.tsx` et `page.tsx`. |
| La vue | Elle était `async` — un composant serveur. React ne rend pas une fonction asynchrone côté navigateur : il lève, et la page reste blanche. `HomeView` est donc synchrone, et lit la chaîne d'agent au premier rendu. |
| Le chargement différé | the framework's dynamic import → `React.lazy` + `<Suspense>`, pour la scène de cubes. |
| Les classes utilitaires | Réécrites vers les nôtres (`o-*`) ou, quand notre générateur ne les produit pas, vers des règles `at-*` dérivées du bloc de jetons de `src/styles.css`. Aucune valeur n'a changé. |
| Les dégradés | L'autre moteur assemblait un dégradé en classes indépendantes qui se parlent par des variables. Le protocole est repris tel quel, sous notre préfixe. |
| Les images | Le composant image de l'autre cadre cède la place à `<img>`. |
| Les polices | Liées dans la feuille au lieu du `layout`. Voir `src/assets/fonts/LICENCES.md`. |
| L'origine publique | Elle était lue dans l'environnement ; elle est posée en clair dans `src/lib/site.ts`. |

**Trois homonymes.** `font-sans`, `font-serif` et `ease-entrance` existent des
deux côtés et ne désignent pas la même chose. Le gabarit les lie dans un bloc
`@theme inline`, qui substitue la valeur dans les **utilitaires** sans émettre
la variable : `var(--font-sans)` dans une règle d'auteur ne résout rien — le
corps de la page est en pile système, des deux côtés — mais la classe
`font-sans`, elle, vit et vaut la Mulish. Elles sont rendues au gabarit sous
`at-*`.

## Démarrer

```sh
npm install
npm run dev      # http://localhost:3500
npm run build
npm run preview
```


> **Template, not a shop.** There is no cart, no checkout and no payment
> provider — product cards are anchors. See [What is not here](#what-is-not-here).

---

## Stack

| Layer | Choice |
|-------|--------|
| Framework | the framework (App Router, Turbopack) · React 19 · TypeScript |
| Styling | the utility generator, configured entirely in `src/app/globals.css` (no the generator's config) |
| Motion | `@react-spring/web` + `spring-text-engine` — **spring-based only**, no CSS keyframes, no framer-motion |
| Scroll | Lenis smooth scroll + a Zustand store |
| 3D | `three` + `cannon-es`, plain (no R3F), lazy-loaded |
| Fonts | Melodrama Light (local, committed) · Instrument Serif · Mulish |

Built on Textura's [`next16-claude-starter`](https://github.com/textura-agency/next16-claude-starter).

## Quick start

Requires **Node ≥ 20.19** (24 LTS recommended — see `.nvmrc`).

```bash
npm ci                  # exact tree from package-lock.json
cp .env.example .env    # every value has a safe fallback
npm run dev             # http://localhost:3000
```

> **Use npm.** `package-lock.json` is the only lockfile and describes the tree
> this site was built and verified against. Adding a `yarn.lock` back would let
> Vercel pick Yarn and resolve a different tree.

> **Don't keep the repo in an iCloud-synced folder** (`~/Desktop`,
> `~/Documents` with Desktop & Documents sync on). Every file open is proxied
> through the file provider, and Node tooling opens thousands: the dev server,
> `tsc` and `eslint` hang for minutes. `~/Developer` or anywhere outside the
> sync root is fine.

| Script | What it does |
|--------|--------------|
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |
| `bash .claude/scripts/verify.sh` | Mechanical check of the project's hard rules |

## The page, in order

One route (`/`) delegating to one view, `src/views/home.tsx`. Each section is
built to a named layout skeleton from the [GetLayers](https://www.getlayers.ai)
library under a single committed Style — the full record is `getlayers.json`.

| # | Section | Files |
|---|---------|-------|
| 0 | **Curtain** — wordmark resolving letter by letter, counter gated on the film's first frame | `components/common/preloader/` |
| 1 | **Hero film** — 1080p studio film pinned for three viewports, scroll parallax, `ODORO` bleeding past the gutters | `components/common/hero/hero-film.tsx`, `hero-stage.tsx` |
| 2–3 | **Chapters** — two corner-loaded blocks travelling over the film, mirrored | `components/common/hero/chapter.tsx` |
| 4 | **Manifesto** — one passage at display size on a narrowed measure | `components/common/manifesto/` |
| 5 | **Collection** — six 4:5 plates under a split heading row | `components/common/collection/` |
| 6 | **Lookbook** — infinite concave 3D ring (drag, arrows, dots, tap-to-focus) | `components/common/lookbook/` |
| 7 | **Atelier** — closing call over a weightless swarm of chrome cubes you can shove and throw | `components/common/closing/`, `lib/scene/onyx-cubes.ts` |
| 8 | **Footer** — on the accent plane | `components/common/footer/` |

The header and the floating pill are one component, `components/common/chrome/`,
reading the scroll once per frame on the shared ticker.

## Changing things

| To change… | Edit |
|------------|------|
| **Copy, prices, product and look lists** | `src/data/mocks/home.ts` — the only place content lives |
| **Colour, type, spacing, radii** | `src/app/globals.css` — three tiers: `--raw-*` primitives → semantic roles → `@theme` bindings. Never a hex in a component |
| **Scene look** | `src/lib/scene/onyx-cubes.config.ts` (the CONFIG). Colours come from `--foreground` / `--accent` at runtime — never edit the shader to recolour |
| **Lookbook geometry** | `src/lib/lookbook/spotlight.config.ts` |
| **Curtain timing** | `src/lib/preloader/preloader.config.ts` |
| **SEO, share card, brand name** | `src/lib/site.ts` |

House rules that are enforced, not optional: spring-based motion only, design
tokens only, routes delegate to views, Server Components by default, no `any`.
They are in `AGENTS.md` and checked by `.claude/scripts/verify.sh`.

## Media

Everything under `public/assets/` is **placeholder media generated with AI**
(Higgsfield — Seedance 2.5 for the film, Soul 2.0 for the stills) so the layout
could be judged against real-looking images rather than grey boxes:

- `hero/` — the studio film, H.264 (`.mp4`) + VP9 (`.webm`) + a poster frame
- `collection/` — six product plates
- `lookbook/` — seven silhouettes

**Replace these with the real shoot before launch**, and check the generator's
terms for commercial use if you keep any of them. Drop new files at the same
paths and nothing in the code changes; the paths are listed in
`src/data/mocks/home.ts`.

## Deploy

```bash
npx vercel          # preview
npx vercel --prod   # production
```

Set **`NEXT_PUBLIC_SITE_URL`** (the public origin, no trailing slash) in
Project Settings → Environment Variables. Without it, canonical URLs, Open
Graph tags, `robots.txt`, `sitemap.xml` and the JSON-LD all point at
`localhost:3000`.

Also before launch: replace `public/open-graph.png` and the favicons (still the
starter's), and add the `/privacy-policy` route the footer links imply.

## What is not here

- **No commerce** — no cart, checkout, payment provider or product API.
- **No CMS or database.** Content is typed constants in `src/data/mocks/`.
  Playbooks for adding Payload + Supabase are in the vault.
- **No cookie banner.** The starter ships one (`components/common/Cookie/`) but
  it is not mounted: the page sets no analytics or marketing cookies, and its
  copy is English. Re-add it in `src/app/layout.tsx` — and translate it — when
  a tracker arrives.
- **No tests.**

## Documentation

`obsidian/` is the project's second brain — architecture, conventions, the
animation system, and the decision log explaining *why* each rule exists. Open
that folder in [Obsidian](https://obsidian.md), or start at
[`obsidian/README.md`](obsidian/README.md). The decisions behind this build are
ADR-0024 → ADR-0027 in [`obsidian/meta/decisions-log.md`](obsidian/meta/decisions-log.md).

## Licence

The project code is **UNLICENSED** — private, all rights reserved.
`LICENSE.md` is the upstream starter's public-domain dedication and covers the
boilerplate it contributed, not ODORO's brand content or the generated media.
