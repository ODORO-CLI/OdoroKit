# Job: plan the site

You receive a client brief. Produce the site plan: the brief normalised onto the design axes, the one Style, and the ordered sections with their compositions and content. Every later call builds from this plan, so the decisions you make here are the ones the site will live with.

The library is provided below this job description:

- `styles` — 46 style directions: each description and its vibes say how a look treats ground, type, colour and motion;
- `palettes` — colour ramps resolving four roles (background, primary, secondary, accent) plus a legible `ink`;
- `fonts` — typefaces with their roles, mood, `pairsWith` and usage notes;
- `compositions` — the index of layout skeletons: id, role, archetype, summary, density, balance, `pairsWith`.

## How to decide

**1. Normalise the brief onto the axes.** Pick values for `dimensionality` (`flat` or `depth`), `mood` (one or two of `luxe`, `technical`, `organic`, `playful`, `brutal`, `calm`), `tone` (`dark` or `light`), `motionEnergy` (`still`, `subtle`, `lively`, `intense`) and `density` (`sparse`, `balanced`, `dense`). `tone` and `mood` shape everything else, so when the brief doesn't settle them, choose what the sector and audience suggest and record it in `assumptions`. If something essential is missing — what the business is, or its name — put a short question in `questions` and still deliver a complete plan built on your best assumption.

**2. Choose the Style.** Read the style directions and choose by feel: a wrong tag never rules a direction out, and a matching tag never rules one in. Then resolve it into concrete tokens:

- **Palette:** one whose `tone` matches the brief. Map background → `od-bg`, primary → `od-ink` (use the palette's `ink` if primary is not legible as body text), accent → `od-accent`, and derive the rest:
  - `od-bg-alt`, `od-surface`, `od-surface-raised`: the background stepped 2–4%, 4–7% and 8–11% toward the ink;
  - `od-ink-muted` and `od-ink-subtle`: the ink mixed about 65% and 42% toward the background;
  - `od-line`: the ink at about 12% over the background, as an opaque hex;
  - `od-accent-ink`: whichever of `od-bg` or `od-ink` reaches 4.5:1 on the accent;
  - `od-glow`: the accent lifted about 20% in lightness.
- **Fonts:** a display face and a body face whose moods fit, using `pairsWith`; one family for both is fine. Display serifs (Cormorant, Libre Caslon Display, Baskervville) are headline-only and always need a sans for body. List only the weights you will use.
- **The rest:** radius from the mood (`0` to `0.25rem` for luxe, brutal or technical; `0.75rem` to `1.5rem` for playful or organic), display tracking from the face (`-0.03em` to `-0.01em` for most displays, `0` for wide display serifs), durations `150ms` / `320ms` / `900ms`, and ease `cubic-bezier(0.22, 1, 0.36, 1)` unless the direction says otherwise.

**3. Outline the page.** Choose sections by role for the site type — for a landing page, usually 5 to 9: a hero first, a closing call to action or contact before the footer, and in between the roles the business actually needs (editorial statement, features or services, gallery, stats, process, testimonials only when the brief supplies them). For each section, choose a composition whose `role` matches, then check it against its neighbours:

- density alternates, and no three dense sections run in a row;
- each section's motion stays within one step of the brief's `motionEnergy`;
- `pairsWith` is a strong hint for what follows what;
- vary the anchoring from one section to the next (left, right, bottom, centred), as a composition family does when it alternates sides.

Set `gate: true` on the hero only. Set `loader: true` for marketing and landing sites; `false` for apps, dashboards and tools.

**4. Write the content.** For every section, write the real copy its composition's slots need, in the brief's language: headline, lead, body, list items, labels and call-to-action text. Follow the copy rules of the doctrine — concrete, no filler, and visible placeholders instead of invented facts.

## Output

Return only the JSON object defined by the `site-plan` schema.
