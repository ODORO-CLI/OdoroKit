/**
 * Maze: diagonals drawing themselves and redrawing themselves.
 *
 * ## Why a front, and not a cross-fade
 *
 * A maze that changes all at once is not seen changing; a cross-fade between
 * two mazes shows two superimposed drawings, neither of them legible. The
 * front, on the other hand, only ever touches one diagonal of cells at a time:
 * the drawing stays legible everywhere, and the eye follows the head that
 * traces it.
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

import { MAZE_FRAGMENT } from './maze.shader.js'

/** What the escape hatch receives. */
export interface MazeControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Props specific to this component. */
export interface MazeOwnProps {
  /** Duration of a complete drawing, in seconds. @defaultValue 6 */
  period?: number
  /** Number of cells across the height. @defaultValue 14 */
  density?: number
  /** Thickness of the strokes, as a fraction of the cell. @defaultValue 0.1 */
  thickness?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<MazeControls>
}

/** All props. */
export type MazeProps = Customisable<MazeOwnProps>

/** Tokens used by default: the background, the strokes, the head. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-theme-fg', '--o-palette-brand-500'] as const

/** Default fallback: a frozen tint, in the same tones. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Maze.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Maze className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Maze({
  period = 6,
  density = 14,
  thickness = 0.1,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: MazeProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: MAZE_FRAGMENT,
    colors,
    uniforms: { uPeriod: period, uDensity: density, uThickness: thickness },
    name: 'maze',
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
