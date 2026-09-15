/**
 * Isometric tile: cubes seen in isometry, whose cells each light up at
 * their own rhythm.
 *
 * ## What sets it apart from the honeycomb
 *
 * The same hexagonal grid, but the hexagon is cut into three faces with
 * three shades: the tiling gains relief, and the lighting lights a whole
 * cube, faces included. The cells pulse; here, nothing moves, cubes light up
 * and go out.
 *
 * ## What this component delegates
 *
 * It carries only what sets it apart: its shader, its settings and its fallback.
 * Reading the tokens, converting them to floats and re-reading them when the
 * theme changes all come from the engine.
 *
 * The fallback is not a precaution: it is shown while the backend loads, when
 * WebGL is missing, when the arbiter refuses the surface and under reduced
 * motion.
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

import { ISOMETRIC_GRID_FRAGMENT } from './isometric-grid.shader.js'

/** What the escape hatch receives. */
export interface IsometricGridControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface IsometricGridOwnProps {
  /** Speed of the lighting. @defaultValue 0.5 */
  speed?: number
  /** Number of cubes over the height. @defaultValue 7 */
  density?: number
  /** Share of the cubes lit at any given moment. @defaultValue 0.25 */
  lit?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<IsometricGridControls>
}

/** Every property. */
export type IsometricGridProps = Customisable<IsometricGridOwnProps>

/** Tokens used by default: the background, the face shading, the lighting. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-theme-fg', '--o-palette-brand-500'] as const

/** Default fallback: a frozen hue, in the same tones. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Isometric tile.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <IsometricGrid className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function IsometricGrid({
  speed = 0.5,
  density = 7,
  lit = 0.25,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: IsometricGridProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: ISOMETRIC_GRID_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uDensity: density, uLit: lit },
    name: 'isometric-grid',
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
