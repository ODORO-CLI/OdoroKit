# @odoro-cli/engine

The Odoro motion engine: one frame loop, an arbiter for WebGL surfaces, a motion
policy, and a shader library.

```sh
npm i @odoro-cli/engine
```

## One loop, and one only

Every animation shares a single `requestAnimationFrame` loop, ordered by
priority: input first, layout next, rendering last — so the frame is drawn from
the final state, never from a half-updated one.

```ts
import { clock, CLOCK_PRIORITY } from '@odoro-cli/engine'

const stop = clock.subscribe(() => draw(), { priority: CLOCK_PRIORITY.render })
```

## Surfaces are granted, not taken

A browser caps the number of live WebGL contexts and silently drops the oldest
past that point. Surfaces are therefore requested from an arbiter, which may
refuse — no WebGL, too many contexts open, a device that would not keep up.

**A refusal is a value, not an exception.** You render your fallback and the
page holds.

```tsx
const { ref, ready, refused } = useShaderSurface({
  fragment: AURORA_FRAGMENT,
  uniforms,
  name: 'background',
})
```

## Reduced motion is honoured by default

Under `prefers-reduced-motion`, an animation that carries only movement is not
mounted at all — the graphics card does not light up for a visitor who asked for
calm. Read it with `useMotionState()`.

## Shaders read your tokens

Colours come from the palette, not from the shader source. A light/dark switch
re-reads them, and changing `--o-palette-brand-500` repaints the effect without
touching any GLSL.

Some thirty fragment shaders ship with the package — `AURORA_FRAGMENT`,
`MESH_FRAGMENT`, `SILK_FRAGMENT`, `PLASMA_FRAGMENT` and the rest.

## Dependencies

`gsap` for the timeline layer, plus `three` and `ogl` for the graphics backends.
The last two are **loaded on demand**: a page that never opens a 3D scene never
downloads them.

GSAP is used under Webflow's no-charge licence. Its notices are kept intact and
it is declared as an explicit dependency — it is never inlined or vendored.

## Links

- Documentation — <https://odoro.dev/docs>
- Source — <https://github.com/ODORO-CLI/OdoroKit>

## Licence

UNLICENSED. Copyright (c) BouBouw. See `LICENSE`.
