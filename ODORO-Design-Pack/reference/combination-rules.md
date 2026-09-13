# Combination rules

What actually goes with what. These are the judgments that make the difference
between "a site built from parts" and "a site."

## Hard rules

- **One Style per site.** Never two. If a section can't be re-skinned into the
  committed Style, it's the wrong section — swap the section, not the Style.
- **`tone` never mixes — for Scenes and Backgrounds.** Their contrast is baked
  (shader constants, video), so a dark one re-skinned light turns to mud. Sections
  and Styles are different: a section's tone is just which tokens shipped, and
  repainting it to the committed Style across tone is the whole point. So a dark
  Style freely adopts a light-shipped Section; it does not adopt a light Scene.
- **One Scene above the fold. At most.** Two WebGL contexts competing for the
  first paint is the fastest way to make an expensive site feel cheap.
- **A Scene and a Background never occupy the same slot.** Pick one.

## Cost

Scenes are tagged `light` / `medium` / `heavy`.

- `heavy` above the fold is a bad trade — it delays the first meaningful paint.
  Put heavy scenes further down, and lazy-mount them.
- More than ~2 scenes on a page is almost always wrong. The rest should be
  Backgrounds or flat sections.

## Motion energy

`motionEnergy` is a page-level budget, not a per-section property. If the brief
says `subtle`, one `intense` section doesn't read as a highlight — it reads as a
mistake. Keep placed sections within one step of the brief's energy.

The exception, and it's the good one: a single `intense` moment inside an
otherwise `still` page **is** the design, when it lands on the hero and nowhere
else.

## Density and rhythm

Don't stack three `dense` sections. Alternate. `sparse → dense → sparse` reads
as rhythm; `dense → dense → dense` reads as a spreadsheet.

## Palettes (re-tinting)

- **One palette per surface.** A palette is a single hue set for a whole scene or
  section. Two palettes on one screen is the colour-layer version of two Styles on
  one site — don't. Re-tint a section to a *different* palette than its neighbour
  only for a deliberate mood break, and keep the accent family related.
- **`tone` doesn't flip — same as scenes.** A dark palette on a light-baked scene,
  or vice versa, muddies it. Re-tint within tone; the palette catalogue is mostly
  dark for exactly this reason.
- **The accent is rationed.** Every palette resolves an `accent` role — it's the
  one hot hue, not a fill. If a section reads as loud after re-tinting, the accent
  is doing too much work.
- **Palette overrides the Style for colour only.** `paletteId` re-tints; the
  committed Style still owns tokens, radius, motion, and type. Don't let a re-tint
  quietly become a second Style.

## Fonts (re-typing)

- **One type system per site.** At most a display face + a body face (+ mono if
  needed). A third family almost always reads as indecision.
- **Display-contrast serifs are headline-only.** Cormorant, Libre Caslon Display,
  and Baskervville fall apart as body text — pair each with a sturdy sans (their
  `pairsWith`). Single-weight faces build hierarchy with SIZE, not weight.
- **Match the mood, then the pairing.** Pick the face whose `mood` fits the brief,
  then let `pairsWith` choose its partner. A luxe serif display over a neutral
  sans body (e.g. Cormorant + Work Sans) is the reliable editorial move.
- **Load only the weights you use.** Every extra weight is bytes on the critical
  path. Prefer the variable fonts when you need a wide range.

## Seeding a Template from a real project

A Template is just a Style plus an ordered Section list. The fastest honest way
to get good ones is to lift them from projects that already cohere — the section
order in a shipped project *is* a proven recipe.

But: sections inside one project were tuned together. Lifting the *order* is
safe. Lifting the *sections* into a different Style needs each one re-skinned,
and that's what the contract is for.
