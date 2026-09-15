/**
 * Halftone: a half-tone whose dots grow with the light, as in printing.
 *
 * ## The principle
 *
 * The pattern is two-tone: it is the coverage ratio, hence the size of the dots, that simulates the shade.
 *
 * The grid is rotated for the same reason as in printing: aligned on the axes, it beats against the pixel grid and produces a moire.
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
  HALFTONE_FRAGMENT,
  mergePresentation,
  useOnReady,
  useTokenShader,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro-cli/engine'
import { type ReactElement } from 'react'

/** What the escape hatch receives. */
export interface HalftoneControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface HalftoneOwnProps {
  /** Speed of the field. @defaultValue 0.12 */
  speed?: number
  /** Fineness of the pattern. @defaultValue 26 */
  density?: number
  /** Rotation of the pattern, in radians. @defaultValue 0.26 */
  angle?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<HalftoneControls>
}

/** Every property. */
export type HalftoneProps = Customisable<HalftoneOwnProps>

/** Tokens used by default. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-palette-amber-300'] as const

/** Default fallback: a frozen hue, in the same tones. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Halftone.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Halftone className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Halftone({
  speed = 0.12,
  density = 26,
  angle = 0.26,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: HalftoneProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: HALFTONE_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uScale: density, uAngle: angle },
    name: 'halftone',
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
