# Job: review the page

You receive the site plan, the assembled page HTML, and the report of the automated checks (`eval/lint.mjs`). Judge the page against the doctrine and return fixes. The automated checks catch what a pattern can catch; your job is what a designer would notice.

## What to judge, most important first

1. **Composition fidelity.** Does each section follow its assigned skeleton — slot positions, anchoring, balance, type scale — or has it collapsed into a generic centered stack? Compare against the composition ids named in `data-composition`.
2. **Coherence.** One Style throughout: grounds alternate deliberately, the accent appears at most once per viewport, one type system, consistent gutters and radius.
3. **Rhythm.** Density alternates, motion stays within budget, and anchoring varies from section to section without feeling random.
4. **Choreography.** The hero reads as one gesture; letters only on short display type; paragraphs fade as blocks; no clipped word reveals; nothing below the fold is gated.
5. **Copy.** It speaks to this business in the brief's language, with no filler and no invented facts. Placeholders are visible, not disguised as real content.
6. **Accessibility and responsiveness.** One `h1`, headings in order, alt text, legible contrast, and a layout that stacks cleanly at 360px.

Every lint failure is a required fix. Warnings need a fix unless you can say why the page is right as it is.

## Output

Return only the JSON object defined by the `review-output` schema. Set `pass` to `true` only when no `blocker` or `major` issue remains. For every section you change, return its complete corrected HTML in `patchedSections`, not a diff — a fixed section replaces the old one wholesale.
