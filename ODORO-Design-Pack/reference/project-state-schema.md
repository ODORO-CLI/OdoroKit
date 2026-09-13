# `getlayers.json` — the project state

Lives in the user's repo root. **Typed, not prose.** Prose drifts and bloats over
a long build; a schema stays queryable and lets every MCP call be primed exactly.

Read it before every section you build. Write to it after every section you place.

```jsonc
{
  "version": 1,

  // What the user asked for, normalised onto the axes. Set once, after the interview.
  "brief": {
    "dimensionality": ["3d"],
    "mood": ["luxe"],
    "tone": ["dark"],
    "motionEnergy": ["subtle"],
    "density": ["sparse"]
  },

  // The committed Style. THE load-bearing decision. Set once; changing it means
  // re-skinning everything already placed.
  "styleId": "obsidian-luxe",

  // Resolved token values — the Style's, plus any user overrides. This is what
  // every section is painted with. Canonical --gl-* names only.
  "tokens": {
    "od-bg": "#0a0a0c",
    "od-ink": "#f4f4f5",
    "od-accent": "#c9a227"
  },

  "activeTemplateId": "obsidian-luxe-agency",

  // Everything built so far, in page order.
  "placed": [
    {
      "sectionId": "hero-mirror-hall",
      "slot": 0,
      "sceneId": "aether-flux",
      // Any CONFIG overrides applied to the scene in THIS placement.
      "sceneParams": { "silverWarm": "#c9a227", "flowSpeed": 0.18 }
    },
    { "sectionId": "showcase-equator", "slot": 1 }
  ],

  // The only place freeform notes are allowed.
  "notes": "Client rejected the first gold; second pass is cooler and less brassy."
}
```

## Why this exists

The failure it prevents: you build section 1 in one style, and by section 4 you've
forgotten what you chose and the page quietly stops cohering. The user won't be
able to name what's wrong — it'll just feel like a template.

Server = the space of good design decisions (the menu).
Client = the record of what this project already ordered.

Neither does the job alone.
