# Job: build one section

You receive the site plan, the entry for one section, the full composition skeleton assigned to it, and the roles of the sections before and after it. Produce that section's HTML.

## Inputs, below this job description

- `plan.brief` and `plan.style` — the axes and the resolved Style. The tokens are already written as CSS variables and Tailwind utilities; you only use the utility names from the doctrine.
- `section` — id, role, `compositionId`, density, motion, gate flag, and the content to place.
- `composition` — the skeleton: `layout` (container, grid system, split, alignment), `slots` (each element's position, size and weight), `type` (scale, display size, display-to-body ratio, tracking), `space` (density, padding, whitespace), `balance` (focal point and weight), `wireframe`.
- `neighbours` — the previous and next sections' roles, compositions and grounds, so edges and backgrounds read as a sequence.
- `media` — image URLs with descriptions, if any.

## How to build it

1. **Read the composition before writing any markup.** Map every slot to a real element and put it exactly where the slot says — column span, anchoring, order — at the size and weight it names. Keep the balance: an asymmetric skeleton stays asymmetric, and a bottom-anchored cluster sits at the bottom of the section.
2. **Match the type contract:** the display size, the display-to-body ratio and the tracking. Oversized display type uses `clamp()` arbitrary values sized so the longest word never overflows at 360px.
3. **Match the space contract:** section padding, gutters, the whitespace it describes. Side gutters must match every other section.
4. **Choose the ground:** `bg-bg` or `bg-bg-alt`, whichever contrasts with the neighbour that touches this section, unless the plan says otherwise.
5. **Declare the choreography** with the attributes from the doctrine. In the hero (`gate: true`), put `data-od-gate` on the `section` and sequence the reveals as one gesture. Elsewhere, reveal on entry with modest delays.
6. **Make it responsive:** at 360px the section stacks in reading order and nothing overflows; from `md` it takes the composition's desktop layout.
7. **Images:** use the provided media with meaningful `alt`. Without media, keep the slot and render an `<img>` whose `src` is empty and whose `data-od-placeholder` describes the image to source (for example `data-od-placeholder="Façade en béton au coucher du soleil, 16:9"`), inside a box with the right aspect ratio. Icons are inline SVG, stroked with `currentColor`.

## Constraints

- **The root element** is `<section data-od-section="{section.id}" data-composition="{section.compositionId}">`, with the section's `id` attribute and an `aria-label` when it has no visible heading. The site footer may use `<footer>` with the same data attributes.
- **Colour, type and radius** only through the token utilities.
- **No `<script>` and no `<style>`,** no inline `style` other than CSS custom properties, and no `animate-*` classes.
- **Exactly one `h1` on the page,** and it lives in the hero. Every other section starts at `h2`.
- **Don't restyle the site header or the loader** unless this section is one of them.

## Output

Return only the JSON object defined by the `section-output` schema. In `notes`, list any placeholder you had to leave and any slot you could not fill from the plan's content.
