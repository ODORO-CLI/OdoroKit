/**
 * Shape grid: a circle, a square or a triangle per cell, each turning at its
 * own speed.
 *
 * ## What sets it apart from the dot rasters
 *
 * The dot matrix and the spot grid lay down an identical dot per cell and
 * animate the whole raster. Here, every cell carries a different shape,
 * oriented and paced on its own: it is a collection, not a raster.
 *
 * ## What this component delegates
 *
 * It carries only what sets it apart: its shader, its settings and its
 * fallback. Reading the tokens, converting them to floats and re-reading them
 * when the theme changes all come from the engine.
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

import { SHAPE_GRID_FRAGMENT } from './shape-grid.shader.js'

/** What the escape hatch receives. */
export interface ShapeGridControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface ShapeGridOwnProps {
  /** Average rotation speed. @defaultValue 0.4 */
  speed?: number
  /** Number of cells across the height. @defaultValue 9 */
  density?: number
  /** Radius of the shapes, as a fraction of the cell. @defaultValue 0.28 */
  size?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<ShapeGridControls>
}

/** All props. */
export type ShapeGridProps = Customisable<ShapeGridOwnProps>

/** Tokens used by default: the background, then the two hues of the shapes. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-500',
  '--o-palette-sky-400',
] as const

/** Default fallback: a frozen tint, in the same tones. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Shape grid.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <ShapeGrid className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function ShapeGrid({
  speed = 0.4,
  density = 9,
  size = 0.28,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: ShapeGridProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: SHAPE_GRID_FRAGMENT,
    colors,
    uniforms: { uSpeed: speed, uDensity: density, uSize: size },
    name: 'shape-grid',
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
