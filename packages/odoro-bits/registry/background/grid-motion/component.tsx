/**
 * Sliding rows: rounded tiles that scroll by rows, in alternating
 * directions, each at its own speed.
 *
 * ## The principle
 *
 * Nothing moves: every row reads its abscissa offset by time, with a
 * direction and a speed of its own. Two neighbouring rows never stay
 * aligned, and the pattern reads as a conveyor rather than as a
 * chequerboard. A few tiles carry the accent and breathe.
 *
 * What sets this entry apart from `mosaic` and from `checker`: here the
 * cells are not fixed, they scroll; and from `stripes`: these are separate
 * tiles, not continuous bands.
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

import { GRID_MOTION_FRAGMENT } from './grid-motion.shader.js'

/** What the escape hatch receives. */
export interface GridMotionControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface GridMotionOwnProps {
  /** Number of rows across the height. Capped at forty by the shader. @defaultValue 8 */
  rows?: number
  /** Sliding speed. @defaultValue 0.6 */
  speed?: number
  /** Space between tiles, as a fraction of a row. @defaultValue 0.12 */
  gap?: number
  /** Share of accented tiles, between zero and one. @defaultValue 0.12 */
  accent?: number
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<GridMotionControls>
}

/** Every property. */
export type GridMotionProps = Customisable<GridMotionOwnProps>

/** Tokens used by default: the background, the tiles, the accented tiles. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-theme-line',
  '--o-palette-brand-500',
] as const

/** Default fallback: a frozen hue, in the same tones. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Sliding rows.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <GridMotion className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function GridMotion({
  rows = 8,
  speed = 0.6,
  gap = 0.12,
  accent = 0.12,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: GridMotionProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: GRID_MOTION_FRAGMENT,
    colors,
    uniforms: { uRows: rows, uSpeed: speed, uGap: gap, uAccent: accent },
    name: 'grid-motion',
    // Small scrolling tiles shimmer on their corners at reduced pixel
    // density: at low quality, the rows widen.
    degrade: (quality) => ({
      uRows: quality === 'low' ? Math.min(rows, 6) : rows,
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
