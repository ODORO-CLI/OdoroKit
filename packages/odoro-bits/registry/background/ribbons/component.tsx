/**
 * Ribbons: staged sinusoidal bands, undulating as they cross.
 *
 * ## The principle
 *
 * Each ribbon is a sinusoid with its own phase; its light is an exponential of the vertical distance to its axis.
 *
 * The ribbons sum together: their crossings brighten by themselves, with no test at all.
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

import { RIBBONS_FRAGMENT } from './ribbons.shader.js'

/** What the escape hatch receives. */
export interface RibbonsControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface RibbonsOwnProps {
  /** Speed of the undulation. @defaultValue 0.4 */
  speed?: number
  /** Number of ribbons. @defaultValue 5 */
  count?: number
  /** Height of the undulation, as a fraction of the frame. @defaultValue 0.08 */
  amplitude?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<RibbonsControls>
}

/** All props. */
export type RibbonsProps = Customisable<RibbonsOwnProps>

/** Tokens used by default: the background, then the two hues of the ribbons. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-teal-400',
  '--o-palette-sky-300',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-zinc-950 o-to-zinc-50 dark:o-to-sky-950'

/**
 * Ribbons.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Ribbons className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Ribbons({
  speed = 0.4,
  count = 5,
  amplitude = 0.08,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: RibbonsProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: RIBBONS_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uCount: count, uAmplitude: amplitude },
    name: 'ribbons',
    // Each ribbon adds three sines and two exponentials per fragment: it is
    // the setting that weighs, so it is the one that is bounded.
    degrade: (quality) => ({
      uCount: quality === 'low' ? Math.min(count, 4) : count,
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
