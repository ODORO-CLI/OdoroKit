---
tags: [meta, changelog]
updated: 2026-09-15
---

# Changelog

Chronological log of notable changes to **this project**. Newest first.
Human-curated — not a mirror of `git log`.

Log a change here when it would surprise someone returning in six months: a new
dependency, a new route or section, a convention bent, a bug whose cause is worth
remembering. Routine commits do not need an entry.

For *why* the conventions are what they are, see [[decisions-log]].

---

## Baseline — built from `next16-claude-starter` v0.1.0

What the starter ships, so the first project entry has something to diff against:

| Area | What is there |
|------|---------------|
| Framework | the framework App Router · React 19 · TypeScript · Yarn · Node ≥ 20.19 |
| Styling | the utility generator, CSS-only config, three-tier design tokens ([[design-system]]) |
| Motion | Vendored spring engine + `spring-text-engine`, shared rAF ticker, reduced-motion ([[animation-system]]) |
| Layout | Adaptive scaling grid — root font-size tracks the viewport ([[design-system]]) |
| Scroll | Lenis smooth scroll + Zustand scroll store ([[smooth-scroll]]) |
| Server | `app/api` route handlers, zod-validated env, `{ data }`/`{ error }` envelope ([[api-architecture]]) |
| SEO | Metadata generator, `robots.ts`, `sitemap.ts`, JSON-LD ([[seo-metadata]]) |
| Agent harness | 8 commands, 7 path-scoped rules, 11 skills, 4 subagents, `verify.sh` ([[agent-harness]]) |
| Not included | CMS, database, auth, payments, i18n, tests — added per project ([[backend/README]]) |

The home view (`src/views/home.tsx`, route `/`) ships empty on purpose — start
there ([[new-page]]).

<!-- Log this project's changes below, newest first, under a `## YYYY-MM-DD` heading. -->

## 2026-09-15 — Cabinet Odoro: the House template re-skinned, with a generated frame sequence

The Keld Studio page became the **Cabinet Odoro** landing page (a Paris law
firm; every name, figure and address is placeholder). Composition and motion
are untouched — this is a skin + content + media pass, per the template's
contract (`mutable: skin`, `preserve: motion, composition`). The GetLayers
choices are recorded in `getlayers.json` at the repo root.

**Brand, copy, language.** `src/data/mocks/home.ts` rewritten in French.
`<html lang="fr">`, Open Graph locale `fr_FR`. The JSON-LD organisation node
is now `["Organization", "LegalService"]` with `telephone`, `email` and a
`PostalAddress` read from new `siteConfig` fields. Anchors renamed:
`#echo` → `#expertises`, `#details` → `#cabinet` (`SCENE_ANCHOR`).

**Type.** Instrument Sans is gone. Cormorant (400/500/600 + italic, display
only) and Inter Tight (labels, nav, copy) load through the framework's font loader;
`--font-display` is bound in `@theme` and every display element carries
`font-display` (hero words, Expertises title, stats, odometer, quote, footer
CTA, zoom title, wordmark). Display tracking loosened from −0.04em to −0.02em
— Cormorant is not a grotesk. Uppercase dropped from the serif lines; kept on
the sans labels.

**Palette.** GetLayers Style *Wanderlust* re-tinted with the *Noir Vermillion*
palette: warm near-black ground `#0a0908`, cream ink `#f7eedf`, one sand
section `#e8c99a` (the palette's secondary, under the testimonials), and one
burgundy accent `#8e1617` — the ✦ marks, the reviews' muted ink, and the star's
final colour (cream → burgundy instead of white → sage). New Tier-2 roles:
`--accent`, `--accent-glow`, `--background-media`. Footer ground under the
photograph is `--raw-color-burgundy-950`.

**Hero sequence.** The 210-frame glass-house render is replaced by a 10 s,
24 fps, 1920×1080 clip generated with **Seedance 2.5** on Higgsfield
(job `531f1994-f863-4ff7-8942-8563f3714446`; prompt: a single continuous
constant-speed dolly through a mahogany law library at night, no cuts, no
people). Tiers are now desktop **240** × 1920×1080 (13 MB, q72) and mobile
**120** × 1280×720 taking every other frame (3.7 MB, q70) — `FRAME_TIERS`
updated. See ADR-0026 for why the footage is scrubbed rather than played.

This machine's ffmpeg 9 has no `libwebp` encoder, so the encode is ffmpeg
raw frames piped into Pillow (a throwaway venv, not a project dependency):

```sh
# desktop: every frame at 1920×1080, q72 · mobile: every other frame at 1280×720, q70
ffmpeg -i clip.mp4 -vf "scale=1920:1080:flags=lanczos" -fps_mode vfr -frames:v 240 -f rawvideo -pix_fmt rgb24 - \
  | python encode.py   # Image.frombytes('RGB',(w,h),buf).save(f'{i:03d}.webp','WEBP',quality=72,method=4)
ffmpeg -i clip.mp4 -vf "select='not(mod(n\,2))',scale=1280:720:flags=lanczos" -fps_mode vfr -frames:v 120 -f rawvideo -pix_fmt rgb24 - \
  | python encode.py   # quality=70
```

**Plates and media.** `footer-bg.webp` is the clip's frame 0 (the burgundy
curtain), `interior-details.webp` its last frame (the lamp and the scales),
`showreel-poster.webp` the mid frame. The showreel is the same clip re-encoded
to H.264 720p (`libx264 -crf 23`, faststart, 1.9 MB) because the Seedance
master is HEVC, which Firefox does not decode. `interior-echo.webp` (the
boardroom) and the two testimonial portraits were generated with Higgsfield
`gpt_image_2_5` (1 credit each) and converted to WebP; the founder portrait and
the Keld showreel are removed.

**Sections.** The Expertises panel lists the five practice areas as hairline
rows (`EchoContent.practices`) where the three line icons were; the `®`
superscript is now optional (`mark: ""` renders nothing). The footer gained an
`<address>` block (`FooterContent.details`) in the third grid column. The
dock's `LogoMark` is redrawn as a pair of scales. Two testimonials, so the
pager's arrows are live.

**Tooling.** Installed with **npm** (no yarn on this machine) — a
`package-lock.json` now sits beside `yarn.lock`. The dev server ran on port
3100 during QA because 3000 was taken.

**QA pass (headless Chrome, 1440×900 and 390×844, a normal UA so the frames
load).** Four fixes from the screenshots: "Expertises" broke onto two lines at
190px in the half panel — a `--raw-font-size-display-panel` (120px) token and
`whitespace-nowrap` hold it on one; the serif digits sat on their labels —
stat gap 3 → 6 and the value now renders `toLocaleString("fr-FR")` ("1 200");
the star's full-screen finale in the rationed burgundy accent was loud — the
star now ends on `--surface-warp` (deep oxblood `burgundy-950`), a role of its
own, so `--foreground-inverse-muted` stays the reviews' ink; the cookie banner
and preferences modal were English — translated. `open-graph.png` is a
1200×630 crop of frame 150 and the OG image dimensions in
`generate-page-metadata.ts` now match. `tsc --noEmit` and `eslint .` are clean.

**Environment note.** This project folder is on `~/Desktop`, which iCloud
Drive syncs with "Optimize Mac Storage": within the hour, `node_modules/` had
been evicted to dataless files and every Node read stalled ~2 s, so the dev server,
`next build` and `eslint` sat at 0 % CPU forever. `node_modules` and `.next`
are now symlinks to `node_modules.nosync/` and `.next.nosync/` (iCloud ignores
`*.nosync`; both gitignored). Order matters: `npm install` replaces a symlinked
`node_modules` with a real directory ("Removing non-directory"), so install
first, then `mv node_modules node_modules.nosync && ln -s node_modules.nosync
node_modules`. With 6.5 GB free on the disk iCloud evicted the whole tree
again within the hour, and `brctl download` stalled, so the media were
regenerated locally from the source clip and the small files hydrated with a
parallel `cat`. Move the project out of iCloud, or turn Optimize Mac Storage
off, before serious work. Because the real directory is now
`node_modules.nosync/`, `tsconfig.json` `exclude` and the ESLint
`globalIgnores` list both name it (and `.next.nosync/`) — without that, `tsc`
type-checked Babel's own `src/*.ts` and ESLint linted the dependency tree.

**Git.** Initial commit on `main` (563 files; `*.nosync/` ignored). The `gh`
token on this machine is a fine-grained PAT without `createRepository`, so the
GitHub repository has to be created by hand; SSH auth to github.com works and
the remote is pre-set to `git@github.com:MalikosDM/TemplateLandingOdoro3.git`.

**Left as shipped by the template.** Favicons and the PWA manifest still carry
the House mark; the cookie banner links to `/privacy-policy`, which has no
route yet; the contact links go to `#contact` / a `mailto:`.

## 2026-09-14 — Follow-up: hydration mismatch, text popping in, footer LCP

Three bugs reported on the rebuild, each measured before and after with a
headless-Chromium probe against the dev server and a production build.

**Hydration mismatch** ("some attributes of the server rendered HTML didn't
match"). The star's fill was a scrubbed `color-mix(in srgb,
var(--foreground-inverse-muted) N%, var(--foreground))`. react-spring's string
interpolator resolved the `var()` on the client and truncated the string to
`color-mix(in srgb, rgba(100, 108, 97, 1)`. That was a mismatch *and* an invalid
fill. The star is now a white path under a sage copy whose opacity scrubs 0 → 1
(`starTint` replaces `starFill`). Compositing at opacity *t* is the same linear
sRGB mix. After: no mismatch on desktop or phone.

**Text appearing "half instant, then animating"** at the start of the scroll —
blocks two and three. Two causes, compounding:
1. The blocks were `visibility`-gated on the timeline spring `p`, which trails
   the raw scroll, while their letters run on the raw scroll. By the time the
   gate opened, the letters were part-way in.
2. The letters used TextEngine `type="interpolate"`, which puts letter 0 fully
   in at progress 0. Before the scroll reached the word, "Precision" already
   read `1.00 0.78 0.56 0.33 0.11 0 …` — hidden only by that gate.

Now the blocks hide only once they have fully left (`HERO_GONE_AT`), and blocks
two and three plus the ECHO® title use `type="toggle"` (strict `progress > i/n`)
with `SCROLL_LETTER`, renamed from `SCRUB_LETTER`. Measured after: every letter
is 0.00 until its own window, then comes in in order (0.14 → first two of each
word, 0.16 → six, 0.18 → all). Through a smooth Lenis scroll, the first letter
starts at 0.02 and the largest single-frame jump is 0.046.

**Footer photo picked as the LCP element.** On desktop the reveal footer sits
fixed and fully covered behind the page from the first paint. The browser
still painted it and scored its photo as LCP. It is now `md:invisible` until the
spacer starts uncovering it (`progress > 0`); phones are unaffected.

Also, from the vault pass: the unused `StarShape` icon was removed, and stale
"home view ships empty" / Onest / "demo view" wording was corrected across the
vault and `.claude/rules/routing-views.md`. Reasoning is appended to
[[decisions-log]] ADR-0024.

## 2026-09-14 — Keld Studio rebuilt from `getlayers-house`

**The static `getlayers-house` site is rebuilt on this starter.** The source
(github.com/textura-agency/getlayers-house, one commit) was `index.html` +
`style.css` + a 1,100-line `script.js` driving everything from one hand-rolled
rAF loop with CSS transitions. It is now one route, `/`, whose Server Component
view (`src/views/home.tsx`) composes client leaves from `src/views/home/`:

| Section | What it is |
|---|---|
| `preloader/` | Brand label, progress rule, rolling odometer; lifts when the ~2.8 s clock has run **and** every frame has settled, then four columns wipe away |
| `scene/` | The pinned 1400vh track: frame-sequence canvas, three statement blocks, the ECHO® glass panel, and the details layer (stats, star warp, showreel zoom) — all on one scroll spring ([[decisions-log]] ADR-0024) |
| `reviews/` | Client stories — sand section, grayscale portrait, letter-rise quote |
| `footer/` | Fixed reveal footer uncovered by a same-height spacer; CTA, nav, the two-voice "Keld Studio" wordmark |
| `dock/` | The floating glass bar; steps aside when the footer starts to show |

Copy is verbatim from the source, in `src/data/mocks/home.ts`; alt text was
written from the images. No dependencies were added.

**Media re-encoded** ([[decisions-log]] ADR-0025). The source shipped 1.4 GB:

| Asset | Source | Shipped |
|---|---|---|
| Frame sequence | 210 × 2560×1440 PNG, ~1.3 GB | desktop 210 × 1920×1080 WebP (q72) **14 MB**; mobile 105 × 1280×720 WebP (q70, every other frame) **3.3 MB** |
| Showreel | 4096×2160 H.264, 17 Mbps, 78 MB | 1600×844 H.264 CRF 27, no audio, faststart, **4.4 MB** + WebP poster |
| Footer photo | 2752×1536 PNG, 6.5 MB | 2560-wide WebP, 332 KB |
| Interiors, portrait | JPG / PNG | WebP, 65–106 KB |

```sh
# frames — S = source Sequence/, D = public/assets/scene/sequence
seq 0 209 | xargs -P 8 -I{} sh -c 'cwebp -q 72 -m 5 -resize 1920 0 "$S/$((1000+{})).png" -o "$D/desktop/$(printf %03d {}).webp"'
seq 0 104 | xargs -P 8 -I{} sh -c 'cwebp -q 70 -m 5 -resize 1280 0 "$S/$((1000+{}*2)).png" -o "$D/mobile/$(printf %03d {}).webp"'
# showreel
ffmpeg -i showreel.mp4 -an -vf scale=1600:-2:flags=lanczos -c:v libx264 -preset medium -crf 27 -pix_fmt yuv420p -movflags +faststart showreel.mp4
```

Not carried over: `house 3.png`, `Frame 1321315767.png` and `star.svg`
(referenced nowhere), the CDN `lenis.min.js` (the npm Lenis already runs), and
the Outfit / Plus Jakarta Sans fonts (loaded, never visible). Instrument Sans
replaces Onest.

**Conventions set for this project.** Keld Studio palette, roles and type
scale in `globals.css`; single theme, no dark override. The adaptive grid drops
its 1920 band — the design is authored at 1440 and scales up above it, as in
the other 1440-authored projects. See [[design-system]].

**Deliberate departures from the source** — each visible, each chosen:
- Hero blocks leave as a whole (slide left into a blur), not letter by letter
  in reverse; letter *entrances* are still TextEngine. ADR-0024.
- The preloader counter shows the smaller of clock and real load — the source
  sat at 100% while frames were still arriving.
- The reviews pager counts the data ("01 / 01"); the source hard-coded
  "01 / 05" over one story with dead arrows.
- The dock's menu button opens the section links (it opened nothing).
- "Get a quote" points at `#contact`; "Showroom" opens the address in Maps.

**Harness fixes** (`.claude/scripts/verify.sh`):
- The `duration-fast / duration-normal` FAIL matched inside
  `duration-[var(--duration-normal)]` — the very form the design system
  prescribes — so every token-timed transition failed it. It now ignores the
  `--` custom-property form, and also covers `duration-slow`.
- The `"use client" on a view` WARN grepped all of `src/views/`, flagging the
  feature leaves that live next to the view. It now checks `src/views/*.tsx`.

**QA** — production build, `next start`, headless Chromium with a normal UA
(the page skips frames for HeadlessChrome — ADR-0025):

| | Desktop 1440×900 | Phone 390×844 |
|---|---|---|
| Curtain lifts (local server) | 5.1 s | 4.8 s |
| Frame requests | 210 | 105 |
| `<h1>` / `<main>` | 1 / 1 | 1 / 1 |
| Horizontal overflow | none | none |
| Footer `#echo` link lands | exactly on the phase end | 178 px past it (1.5% of travel, still inside ECHO) — not chased |

`/` prerenders static (`○`). `verify.sh` 0 FAIL; the three WARNs left are
starter code (`siteConfig.themeColor`, Cookie px values, the contact route's
`console.log`).

**Open — needs the owner** `#todo`:
- The footer's **Contact** button has no real destination (`#contact`
  placeholder) — the source's was `#`. It needs an email, a form, or a page.
- The testimonial praises "Fluid Glass" and signs "Founder, Name Architects" —
  both template placeholders in the source copy. There is one story only.
- `/privacy-policy` (linked from the cookie banner) does not exist — its
  prefetch is the one 404 in the console. Pre-existing starter gap.
- `open-graph.png` is still the starter's; no Twitter handle is known, so the
  tags are omitted.

**Runtime note.** `.nvmrc` pins Node 24.16.0; a shell on the machine default
(20.17) fails Yarn's `engines` check. Run `nvm use` first.

## 2026-09-08

**`optimize-3d-scene` skill — resize no longer switched off on touch.** §13 of
the skill (and `patterns.md` §5 / §14) told agents to attach *no* `resize`
listener on the mobile tier, to dodge the iOS URL bar. That also removed the
only path that could react to a breakpoint drag, a rotation or DevTools
emulation being turned off, so a scene loaded as a phone kept its phone
framebuffer, frame budget, parked pointer and hidden desktop passes on a desktop
viewport and rendered skewed. The skill now listens on every tier, ignores
height-only changes on a coarse pointer, and re-reads the tier on a width
change or a pointer-media-query flip, with a `retune()` that re-applies DPR,
budget, visibility, draw range and pointer binding without compiling a program.
§2 and §11 of `SKILL.md` and the [[optimize-3d-scene]] workflow note were
updated to match; §14 gained a tier-switch round-trip check. Reasoning in
[[decisions-log]] ADR-0023. Measured on the project that surfaced it: phone
390×844 / 3 draws ↔ desktop 2160×1350 / 4 draws, program count unchanged.
