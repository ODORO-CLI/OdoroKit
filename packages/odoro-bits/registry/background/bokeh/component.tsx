/**
 * Bokeh: multi-depth blurred discs drifting sideways.
 *
 * ## The principle
 *
 * Three layers of discs, one per hashed cell: the closer the layer, the
 * larger, blurrier and slower its discs — the rendering of a lens, which
 * blurs what lies outside the plane of focus. The edge of each disc is a
 * smoothstep whose width is the blur setting.
 *
 * ## What this component delegates
 *
 * It carries only what sets it apart: its shader, its settings and its fallback.
 * Reading the tokens, converting them to floats and re-reading them when the
 * theme changes all come from the engine — copying them here would leave as
 * many versions to maintain as there are backgrounds.
 *
 * The fallback is not a precaution: it is shown while the backend loads, when
 * WebGL is missing, when the arbiter refuses the surface — it grants only one
 * per backend — and under reduced motion.
 *
 * @module
 */

import {
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro-cli/engine'
import { type ReactElement } from 'react'

import { BOKEH_FRAGMENT } from './bokeh.shader.js'

/** What the escape hatch receives. */
export interface BokehControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface BokehOwnProps {
  /** Lateral drift speed. @defaultValue 0.3 */
  speed?: number
  /** Number of cells across the shorter side. @defaultValue 6 */
  density?: number
  /** Width of the discs' blurred edge. @defaultValue 0.5 */
  blur?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<BokehControls>
}

/** Every property. */
export type BokehProps = Customisable<BokehOwnProps>

/** Tokens used by default: the darkness, then the two warm hues. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-amber-400',
  '--o-palette-rose-400',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-stone-950 o-to-zinc-100 dark:o-to-stone-900'

/**
 * Bokeh.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Bokeh className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Bokeh({
  speed = 0.3,
  density = 6,
  blur = 0.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: BokehProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: BOKEH_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uDensity: density, uBlur: blur },
    name: 'bokeh',
    // Three layers of nine cells each: a wider mesh makes fewer overlapping
    // discs, so it is the setting that weighs, and therefore the one that is
    // bounded.
    degrade: (quality) => ({
      uDensity: quality === 'low' ? Math.min(density, 4) : density,
    }),
  })

  useOnReady(onReady, ready ? { colours, refused } : null, ref.current)

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

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
      {ready && refused === undefined ? null : (
        <div className={`o-absolute o-inset-0 ${fallback}`} />
      )}
    </div>
  )
}
