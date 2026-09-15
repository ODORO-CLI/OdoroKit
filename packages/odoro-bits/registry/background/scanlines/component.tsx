/**
 * Scanlines: a cathode-ray screen, its rolling bar and its grain.
 *
 * ## The principle
 *
 * Everything fits into periodic functions of the vertical axis alone: a sine for the lines, a fractional part offset by time for the bar.
 *
 * The grain is replayed in time steps, never per frame — one draw per frame flickers instead of granulating.
 *
 * ## What this component delegates
 *
 * It carries only what sets it apart: its shader, its settings and its
 * fallback. Reading the tokens, converting them to floats and re-reading them
 * when the theme changes all come from the engine — copying that here would
 * leave as many versions to maintain as there are backgrounds.
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

import { SCANLINES_FRAGMENT } from './scanlines.shader.js'

/** What the escape hatch receives. */
export interface ScanlinesControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface ScanlinesOwnProps {
  /** Speed of the rolling bar. @defaultValue 0.5 */
  speed?: number
  /** Number of lines across the height. @defaultValue 90 */
  lines?: number
  /** Share of the animated grain. @defaultValue 0.4 */
  flicker?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<ScanlinesControls>
}

/** All props. */
export type ScanlinesProps = Customisable<ScanlinesOwnProps>

/** Tokens used by default: the tube, the phosphor, the bar. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-green-400',
  '--o-palette-emerald-200',
] as const

/** Default fallback: a frozen tint, in the same tones. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Scanlines.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Scanlines className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Scanlines({
  speed = 0.5,
  lines = 90,
  flicker = 0.4,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: ScanlinesProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: SCANLINES_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uLines: lines, uFlicker: flicker },
    name: 'scanlines',
    // The grain is the only value recomputed at every time step: on a screen
    // whose density has been capped, it is also what swarms the most. It is
    // therefore the bounded setting.
    degrade: (quality) => ({
      uFlicker: quality === 'low' ? Math.min(flicker, 0.15) : flicker,
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
