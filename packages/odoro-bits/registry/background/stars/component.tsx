/**
 * Stars: a scattering at three depths, drifting in parallax.
 *
 * ## The principle
 *
 * One star per cell of a grid, its position drawn from the cell identifier: no list is ever walked.
 *
 * The twinkle is a sine whose phase belongs to each star, never a draw per frame — that would produce nothing but noise.
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
  STARS_FRAGMENT,
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro-cli/engine'
import { type ReactElement } from 'react'

/** What the escape hatch receives. */
export interface StarsControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface StarsOwnProps {
  /** Speed of the drift. @defaultValue 0.5 */
  speed?: number
  /** Density of the scattering. @defaultValue 24 */
  density?: number
  /** Strength of the twinkle. @defaultValue 0.6 */
  twinkle?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<StarsControls>
}

/** All props. */
export type StarsProps = Customisable<StarsOwnProps>

/** Tokens used by default. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-theme-fg'] as const

/** Default fallback: a frozen tint, in the same tones. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Stars.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Stars className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Stars({
  speed = 0.5,
  density = 24,
  twinkle = 0.6,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: StarsProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: STARS_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: density, uTwinkle: twinkle },
    name: 'stars',
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
