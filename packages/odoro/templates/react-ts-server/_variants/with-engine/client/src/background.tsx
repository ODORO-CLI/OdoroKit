/**
 * The decorative background, as a WebGL surface.
 *
 * This version replaces the static gradient because the engine was picked at
 * creation. The rest of the page is unchanged: it places `<Background />` and
 * does not know what is behind it.
 *
 * ## What the engine brings that a gradient cannot
 *
 * **An arbiter.** The surface is asked of the engine manager, which refuses it
 * if the browser has no WebGL, if too many contexts are already open, or if
 * the device would not keep up. The refusal is a value, not an exception: the
 * gradient is shown instead, and the page holds.
 *
 * **Reduced motion.** Under that preference nothing is mounted: the background
 * brought only its motion, and the graphics card has no business waking up for
 * a visitor who asked for calm.
 *
 * **The theme colours.** The hues are read from the tokens, not written into
 * the shader. A light / dark switch re-reads them, and changing
 * `--o-palette-brand-500` repaints the background without touching this file.
 *
 * ## Why inline styles
 *
 * This file is laid down whatever the rest: a project that unticked the
 * libraries has no `o-*` classes, and a missing class paints nothing — the
 * background would then be zero pixels tall, with nothing to report it. So the
 * few placement rules are written where they are safe.
 *
 * @module
 */

import {
  AURORA_FRAGMENT,
  readTokenColour,
  useMotionState,
  useShaderSurface,
  type ShaderColour,
} from '@odoro-cli/engine'
import { useEffect, useMemo, useState, type ReactElement } from 'react'

/** The tokens read to tint the glow. */
const HUES = ['--o-palette-brand-500', '--o-palette-brand-300', '--o-theme-bg'] as const

/** The gradient served while the surface is not there — or forever. */
function Gradient(): ReactElement {
  return (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.28,
        filter: 'blur(64px)',
        background:
          'radial-gradient(60% 60% at 50% 0%, var(--o-palette-brand-500, #3b82f6), transparent)',
      }}
    />
  )
}

/** An animated glow behind the top of the page. */
export function Background(): ReactElement {
  const { quality, reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [hues, setHues] = useState<readonly ShaderColour[]>([])

  // Re-read when the host appears and when the theme switches — the latter
  // goes through the motion policy, which is renewed on every state.
  useEffect(() => {
    if (host === null) return
    setHues(HUES.map((token) => readTokenColour(token, host)))
  }, [host, reduced, quality])

  const uniforms = useMemo(() => {
    const [a, b, c] = hues
    if (a === undefined || b === undefined || c === undefined) return undefined
    // The theme background dominates, the brand is only a reflection: these
    // three colours go into a mix, and two brand hues out of three would give
    // a full-page glow rather than a halo.
    return { uColorA: c, uColorB: c, uColorC: a, uSpeed: 0.1, uScale: 1.4, uOctaves: 3 }
  }, [hues])

  const { ref, ready, refused } = useShaderSurface<HTMLDivElement>({
    fragment: AURORA_FRAGMENT,
    uniforms: uniforms ?? {},
    name: 'home-background',
  })

  const fallback = !ready || refused !== undefined || uniforms === undefined

  return (
    <div
      aria-hidden="true"
      ref={(element) => {
        setHost(element)
        ref.current = element
      }}
      style={{
        position: 'absolute',
        insetInline: 0,
        top: 0,
        height: '42rem',
        overflow: 'hidden',
        pointerEvents: 'none',
        // A decorative background is noticed when you look for it, not before.
        // At full strength the glow comes in front of the title it is supposed
        // to carry; at a fifth, it underlines it.
        opacity: 0.2,
        // The bottom dissolves into the page: a surface that stops dead draws
        // a horizontal line that nothing justifies.
        maskImage: 'linear-gradient(to bottom, black 45%, transparent)',
        WebkitMaskImage: 'linear-gradient(to bottom, black 45%, transparent)',
      }}
    >
      {fallback ? <Gradient /> : null}
    </div>
  )
}
