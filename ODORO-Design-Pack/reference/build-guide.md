# ODORO — Build Guide

You are building an immersive, design-led website using the ODORO library.
Read this fully before you write any UI.

## The five nouns

There are exactly five kinds of asset. These words appear in tool names, in
metadata, and here. There are no synonyms — if you find yourself saying
"component" or "block" or "theme", stop and use the right word.

- **Style** — a token set + type + treatment. The coherence unit.
- **Section** — a single-purpose interactive screen (carousel, FAQ). A re-skinnable
  building block you add to a page.
- **Scene** — a 3D scene. Embeddable, tinted through params.
- **Background** — a video. Atomic.
- **Template** — a full landing page (sometimes a hero only): a real project with
  scenes already embedded and tuned. The immersive unit. You re-skin it, you don't
  reassemble it — rewrite its tokenFile to the committed Style, tint its scene, swap
  copy. Pull its files on demand with `getlayers_source`; never load the whole tree.
  **What you get back depends on the target:** a `starter`/`next` target on a Next
  template returns the real tree (edit `build.editPoints`); `react`/`other`, or any
  target on a vite/static template, returns the portable single-HTML master.
  **Don't know their stack? OMIT `target`.** On a Next-stack template that returns
  `needs: 'target'` — the two options, in user-facing words, to put to them — instead
  of the wrong deliverable. It spends no quota, so asking is free and guessing isn't.
  (If there's a project to look at, read it first: a `next.config.*` or a `next`
  dependency answers the question without asking.)
  **Either way, the heavy media is never in your context — you download it.**
  - **Fast path — `downloadProject`.** The tree payload carries a signed link to the
    WHOLE project as one `.zip`: every source file plus `public/` media already inside
    (so skip `mediaAssets` entirely), `HOW_TO_USE.md`, and an `obsidian/` vault
    documenting that project's own architecture, design system and component
    conventions — read it before re-skinning. It extracts to ONE top-level folder named
    for the template, so unzip NEXT TO the project and move what you want; never copy
    its `.claude/settings.json`, `.cursorrules` or `.gitignore` over an existing
    project's. Install afterwards — node_modules is not shipped.
    **Capped at 3 different templates per day** — the zip is the fast lane for a
    template the user has committed to, not a way to browse. Re-taking one you already
    took today is free. If `downloadProjectUnavailable` appears instead, nothing is
    lost: take it the per-file way, which is the same code fetched as you go. Only go
    file-by-file anyway when the user wants a *piece* of the template.
  - On the **tree**: `build.mediaAssets` lists the runtime binaries the page loads
    (`.glb`, `.mp4`, point clouds, textures) as `{file, bytes, download}`, with a
    ready-to-run `build.mediaDownload` block. Do this FIRST, before editing anything.
    Save each to the same tree-relative `file` path, e.g. `public/assets/hero/eye.mp4`,
    so the existing code finds it unchanged, then check each file is `bytes` long —
    an expired link writes a short error page under a `.mp4` name and the only later
    symptom is a blank canvas. Links last ~1 h; re-materialize for a fresh set.
    `getlayers_source` will NOT return these — it hands back the same link instead.
  - On the **portable**: media is referenced at
    `https://storage.getlayers.ai/templates/<id>/…`. Download those and repoint the
    markup.

  This step is not optional and it is not a detail: a template whose model or clip
  is missing renders blank. Don't substitute your own asset, and don't hotlink our
  buckets in production.

## The three layers

Every Section and Scene splits into three layers, and your permission differs
per layer:

- **Composition** — how it's arranged. Usually yours to adjust.
- **Motion** — the animation / interaction mechanic. Usually NOT yours. You
  *call* it; you don't rewrite it.
- **Skin** — tokens, colour, type, spacing, copy, imagery. Always yours.

Every asset declares its own `contract` (`mutable` / `preserve`). Obey it. The
failure it prevents is specific and common: an agent re-skins a section, quietly
"tidies" the animation timing, and ships something that no longer feels designed.

## The one insight that makes mixing work

Two sections from different origins clash **only in the skin layer.** Their
composition and motion are fully portable.

So page coherence does **not** come from sections sharing a source. It comes from
them sharing **one Style, applied at assembly time.** Pull section A, pull section
B, paint both with the committed Style's tokens → they cohere despite different
origins.

This is why the Style is committed **once, early, and never drifts.** It is the
single most important decision in the build. Get it from the user explicitly.

## Colour on a 3D Scene is a parameter, never code

A Scene exposes its entire art-direction surface as `CONFIG` — typically 20–50
named knobs, colours as `#rrggbb`. `materialize` hands you a `tint` map that
resolves the committed Style's palette onto that scene's own colour keys.

**Apply the tint to CONFIG. Never edit the shader to recolour.** Shaders are not
re-tintable by editing — you will produce garbage. If a colour you want isn't in
CONFIG, it isn't available. Say so; don't go hunting in the GLSL.

Note also: params marked `structural: true` rebuild geometry. Most scenes need a
reload for those; only a few rebuild live.

## Every page is compositions + a Style + assets

This is the model. A **composition** is a section's layout skeleton (an abstract
wireframe: where headline, media, model, buttons, nav sit; their relative sizes;
the white space) — no fonts, colours, copy, or assets. The **Style** is the skin.
The **assets** are the organs. A template is just a fixed set of compositions with
a style and assets already chosen.

So there are two ways to build, and compositions are central to both:

- **Extending a template** — materialize it and re-skin. Each section reports its
  `composition` and `recomposeOptions`. To *restructure* a section (not just
  recolour it), swap its composition for another of the same role and rebuild that
  section to the new skeleton, keeping the Style and content. That is how a user
  changes a hero from one layout to another without leaving the template.
- **Building a section from scratch** — call `getlayers_compositions` (by role)
  FIRST, pick a skeleton, and pour the committed Style + chosen assets into its
  slots. Honour its type scale, spacing, and balance. Combine skeletons down the
  page for rhythm (`pairsWith`). NEVER default to a generic centered stack — that
  is the single most common failure.

## Re-dressing: palettes and fonts

Two reference catalogues (like compositions, they ship no source) let you
**re-dress** any asset — swap its colour or its type without touching composition
or motion:

- **Palettes** (`getlayers_palettes`) — portable colour ramps. Each resolves the
  same four roles a Style does (background / primary / secondary / accent), so it
  drops straight into the tint pipeline. Pass a palette's id as `paletteId` to
  `getlayers_materialize` and the scene comes back tinted to it *instead of* the
  Style — while the committed Style still owns tokens and type. Use this to make a
  pulled scene match the site, or to shift one section to a new mood. Most are
  dark. On the DOM: background→`od-bg`, primary→`od-ink`, secondary→
  `od-bg-alt`/`od-surface`, accent→`od-accent`; use the palette's `ink` for body.
- **Fonts** (`getlayers_fonts`) — curated web typefaces, each with the exact CSS
  `stack` to write into a `od-font-*` token, the `importUrl` to load it (Google
  Fonts, or Fontshare for General Sans), weights, and a personality note. Pass a
  font's id as `fontId` to `getlayers_materialize`, or pick display + body for a
  fresh build (see each font's `pairsWith`). A high-contrast serif display
  (Cormorant, Libre Caslon, Baskervville) is HEADLINE-ONLY — always give it a
  sturdy sans for body.

The rule that still holds: **one palette per surface, one type system per site.**
Re-dressing swaps the ramp or the face; it does not license two of either fighting
on one screen.

## The loop

For every build, in order:

1. **Interview.** First ask for as much detail as the user will give — purpose,
   audience, mood, and any references (for a 3D scene, explicitly ask for picture/
   video references). If they skip or stay vague, drive the axes as questions;
   `dimensionality` and `tone` are load-bearing — never assume them.
2. **Environment.** Establish the target. Recommend the starter; accept a refusal.
3. **Plan.** `getlayers_plan` → present Styles → **the user picks.** You do not
   pick the Style for them.
4. **Commit.** Write the choice to `getlayers.json`.
5. **Build, section by section.** Before each: re-read `getlayers.json`. After
   each: write back what you placed.

Step 5's read/write is not bureaucracy. Without it you will build section 1 in
one style and drift by section 4, because you'll have forgotten what you chose.

## How the page comes alive — read `revealChoreography`

`getlayers_start` returns a `revealChoreography` doc alongside this one. It is the
**default** for every build, not an upgrade: an immersive loader, content gated until
it completes, text and images and scroll revealing in sequence rather than simply
appearing, and any 3D scene entering with a real entrance instead of a fade.

Read it before you write the page shell, because two of its rules change your
structure rather than decorating it — the gate flips at the *start* of the curtain's
exit (so content animates in **through** the departing curtain), and everything is
mounted already-hidden rather than withheld from paint. Retrofitting either one is
much harder than building with it.

Loaders are Sections (`role: "loader"`) — browse and swap them like anything else.

Simplify it when the user asks, or when the page is a dashboard or app shell someone
opens many times a day. An immersive loader is a first-impression instrument.

## What you must not do

- Do not invent a Style. If nothing matches, say so and let the user adjust.
- Do not clone an asset wholesale into an unrelated design. Re-skin it.

**Using something as a reference.** The user can name ANY asset — a template, a
section, a scene, a background — as a reference for what to build ("make this
section like <template>"). Pull it with `getlayers_source` (or read its card),
study its composition / technique / CONFIG, then apply that to the target. Cross-type
is fine: a template can be the reference for a single section.

- Do not rewrite a `preserve` layer.
- Do not materialize speculatively. Browse is free; materialize is not.
