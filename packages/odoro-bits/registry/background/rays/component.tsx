/**
 * Rays: radial crepuscular rays from an adjustable point.
 *
 * ## The principle
 *
 * The intensity is a 1D noise of the angle around the focus — three sines at
 * integer, non-multiple frequencies, periodic over the turn — sculpted by a
 * power and faded out by an exponential of the distance. Slow phases make the
 * shimmer. Distinct from the beams: radial from a point, not parallel oblique
 * rays.
 *
 * ## What this component delegates
 *
 * It carries only what sets it apart: its shader, its settings and its fallback.
 * Reading the tokens, converting them to floats and re-reading them when the
 * theme changes all come from the engine — copying that here would leave as many
 * versions to maintain as there are backgrounds.
 *
 * The fallback is not a precaution: it is shown while the backend loads, when
 * WebGL is missing, when the arbiter refuses the surface — it grants only one per
 * backend — and under reduced motion.
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

import { RAYS_FRAGMENT } from './rays.shader.js'

/** What the escape hatch receives. */
export interface RaysControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface RaysOwnProps {
  /** Horizontal position of the focus, as a fraction of the frame. @defaultValue 0.5 */
  x?: number
  /** Vertical position of the focus, as a fraction of the frame. @defaultValue 0.75 */
  y?: number
  /** Number of rays around the turn. @defaultValue 12 */
  count?: number
  /** Softness of the rays. Low, they are thin and hard. @defaultValue 0.5 */
  softness?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<RaysControls>
}

/** All props. */
export type RaysProps = Customisable<RaysOwnProps>

/** Tokens used by default: the gloom, the rays, the focus. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-orange-500',
  '--o-palette-amber-200',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-orange-950 o-to-zinc-50 dark:o-to-stone-950'

/**
 * Rays.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Rays className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Rays({
  x = 0.5,
  y = 0.75,
  count = 12,
  softness = 0.5,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: RaysProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: RAYS_FRAGMENT,
    colors,
    uniforms: { uX: x, uY: y, uCount: count, uSoftness: softness, uDetail: 3 },
    name: 'rays',
    // The number of rays costs nothing — it is a frequency, not a loop. It is
    // the harmonics of the angular noise that weigh, so they are the ones that
    // are bounded.
    degrade: (quality) => ({
      uDetail: quality === 'low' ? 1 : 3,
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
