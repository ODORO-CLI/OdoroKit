/**
 * Acid squares: nested squares that turn out of step, in acid colours.
 *
 * ## Why the colours are raw
 *
 * The effect lives off the contrast between two alternating hues: close
 * shades would give a grey moire. The default tokens are therefore taken
 * far from one another on the hue circle, and far from the background.
 *
 * ## What this component delegates
 *
 * It carries only what sets it apart: its shader, its settings and its
 * fallback. Reading the tokens, turning them into floats and reading them
 * again when the theme changes all come from the engine.
 *
 * The fallback is not a precaution: it is shown while the backend loads,
 * when WebGL is missing, when the arbiter refuses the surface and under
 * reduced motion.
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

import { ACID_SQUARES_FRAGMENT } from './acid-squares.shader.js'

/** What the escape hatch receives. */
export interface AcidSquaresControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props belonging to the component itself. */
export interface AcidSquaresOwnProps {
  /** Rotation speed of the outermost square. @defaultValue 0.25 */
  speed?: number
  /** Number of nested squares per cell. @defaultValue 7 */
  rings?: number
  /** Number of cells over the height. @defaultValue 2 */
  density?: number
  /** Angular offset between two neighbouring squares, in radians. @defaultValue 0.12 */
  twist?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Classes of the fallback. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<AcidSquaresControls>
}

/** All the props. */
export type AcidSquaresProps = Customisable<AcidSquaresOwnProps>

/** Tokens used by default: the background, then the two alternating hues. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-lime-400',
  '--o-palette-fuchsia-500',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_FALLBACK =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-via-lime-200 dark:o-via-lime-900 o-to-fuchsia-100 dark:o-to-fuchsia-950'

/**
 * Nested squares at low quality.
 *
 * Each square is one rotation and one distance per fragment: this is the
 * only cost lever, and it does not need to be a prop in order to be
 * stepped down.
 */
const LOW_RINGS = 4

/**
 * Acid squares.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <AcidSquares className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function AcidSquares({
  speed = 0.25,
  rings = 7,
  density = 2,
  twist = 0.12,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: AcidSquaresProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: ACID_SQUARES_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uRings: rings, uDensity: density, uTwist: twist },
    name: 'acid-squares',
    degrade: (quality) => ({
      uRings: quality === 'low' ? Math.min(rings, LOW_RINGS) : rings,
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
