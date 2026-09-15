/**
 * Animated background: fractal noise with domain warping.
 *
 * ## The colours come from the palette
 *
 * This is the difference between a background that belongs to the project
 * and one that is merely set beside it. A background whose colours are
 * hard-coded stands alone of its kind the day the house style changes, and
 * the shader then has to be reopened to fix three vectors in it.
 *
 * The conversion is not free: the palette is in OKLCH, a shader wants three
 * floats, and no browser API bridges the gap. The engine takes care of it —
 * that is what `readTokenColour` exists to do.
 *
 * The colours are read again when the theme changes. A background frozen in
 * light in the middle of a page turned dark would be the same flaw, one
 * notch further on.
 *
 * ## The fallback is not a precaution
 *
 * It is half of the component. It is shown while the backend loads, when
 * WebGL is missing, when the arbiter refuses the surface — it grants only
 * one per backend — and under reduced motion, where an animated background
 * brings nothing beyond its movement.
 *
 * @module
 */

import {
  AURORA_FRAGMENT,
  mergePresentation,
  readTokenColour,
  useMotionState,
  useOnReady,
  useShaderSurface,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro-cli/engine'
import { useEffect, useMemo, useState, type ReactElement } from 'react'

/** What the escape hatch receives. */
export interface AuroraControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props belonging to the component itself. */
export interface AuroraOwnProps {
  /** Drift speed of the pattern. @defaultValue 0.12 */
  speed?: number
  /** Scale of the noise. Higher means finer. @defaultValue 2.4 */
  scale?: number
  /** Number of octaves. @defaultValue 4 */
  octaves?: number
  /** Tokens whose colours are read. */
  colors?: readonly [string, string, string]
  /** Classes of the fallback. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<AuroraControls>
}

/** All the props. */
export type AuroraProps = Customisable<AuroraOwnProps>

/** Tokens used by default. */
const DEFAULT_TOKENS = [
  '--o-palette-brand-600',
  '--o-palette-fuchsia-600',
  '--o-theme-fg',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-brand-600 dark:o-from-brand-400 o-to-fuchsia-600 dark:o-to-fuchsia-400'

/**
 * Number of octaves at low quality.
 *
 * Every octave is one more noise evaluation per pixel. Halving their number
 * is the most profitable setting there is: the pattern stays recognisable
 * where the frame rate, for its part, doubles.
 */
const LOW_OCTAVES = 2

/**
 * Full-frame animated background.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Aurora className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 *
 * @example
 * // The colours follow the palette: three tokens, not three values.
 * <Aurora colors={['--o-palette-red-600', '--o-palette-amber-600', '--o-theme-surface']} />
 */
export function Aurora({
  speed = 0.12,
  scale = 2.4,
  octaves = 4,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: AuroraProps): ReactElement {
  const { quality, reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)

  // The colours are read again when the host changes, when the requested
  // tokens change, and when the theme flips — that last case goes through
  // the motion policy, which is renewed on every state change.
  const [colours, setColours] = useState<readonly ShaderColour[]>([])

  useEffect(() => {
    if (host === null) return
    setColours(colors.map((token) => readTokenColour(token, host)))
  }, [host, colors, reduced, quality])

  const uniforms = useMemo(() => {
    const [a, b, c] = colours
    if (a === undefined || b === undefined || c === undefined) return undefined

    return {
      uColorA: a,
      uColorB: b,
      uColorC: c,
      uSpeed: speed,
      uScale: scale,
      uOctaves: quality === 'low' ? LOW_OCTAVES : octaves,
    }
  }, [colours, speed, scale, octaves, quality])

  const { ref, ready, refused } = useShaderSurface<HTMLDivElement>({
    fragment: AURORA_FRAGMENT,
    // The shader is only mounted once the colours have been read: building
    // it with empty uniforms would show a black image before the first
    // correction, which the fallback already covers better.
    uniforms: uniforms ?? {},
    name: 'aurora',
  })

  useOnReady(onReady, ready ? { colours, refused } : null, host)

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  const showFallback = !ready || refused !== undefined || uniforms === undefined

  return (
    <div
      {...rest}
      ref={(element) => {
        setHost(element)
        ref.current = element
      }}
      className={className}
      style={style}
      aria-hidden
    >
      {showFallback ? <div className={`o-absolute o-inset-0 ${fallback}`} /> : null}
    </div>
  )
}
