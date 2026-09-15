/**
 * Scanned grid: a grid that a bright bar travels across, and which fades
 * out cell by cell behind it.
 *
 * ## The principle
 *
 * The grid is read in the shader; the bar travels one axis of the frame at
 * constant speed, with a margin on each side so as to leave the frame
 * before reappearing. Every cell it has crossed fades at its own rate, from
 * an intensity of its own: that is what sets it apart from a plain gradient
 * that slides.
 *
 * What sets this entry apart from `scanlines`: there are no cathode lines,
 * no grain, no vignette — only a grid, and a bar that lights its cells. And
 * from `grid-lines`: that one drifts in CSS; here nothing drifts,
 * everything is scanned.
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

import { GRID_SCAN_FRAGMENT } from './grid-scan.shader.js'

/** What the escape hatch receives. */
export interface GridScanControls {
  /** Colours actually handed to the shader. */
  readonly colours: readonly ShaderColour[]
  /** Reason for the refusal, if there is one. */
  readonly refused: string | undefined
}

/** Properties specific to this component. */
export interface GridScanOwnProps {
  /** Number of cells across the height. Capped at sixty by the shader. @defaultValue 14 */
  cells?: number
  /** Speed of the bar. @defaultValue 1 */
  speed?: number
  /** Length of the trail, in cells. @defaultValue 3 */
  trail?: number
  /** The bar travels the width rather than the height. @defaultValue false */
  vertical?: boolean
  /** Tokens whose colours are read. */
  colors?: readonly string[]
  /** Fallback classes. */
  fallback?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<GridScanControls>
}

/** Every property. */
export type GridScanProps = Customisable<GridScanOwnProps>

/** Tokens used by default: the background, the lines, the bar. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-theme-line', '--o-palette-cyan-400'] as const

/** Default fallback: a frozen hue, in the same tones. */
const DEFAULT_FALLBACK = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Scanned grid.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <GridScan className="o-absolute o-inset-0" />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function GridScan({
  cells = 14,
  speed = 1,
  trail = 3,
  vertical = false,
  colors = DEFAULT_TOKENS,
  fallback = DEFAULT_FALLBACK,
  onReady,
  ...rest
}: GridScanProps): ReactElement {
  const { ref, setHost, ready, refused, colours } = useTokenShader<HTMLDivElement>({
    fragment: GRID_SCAN_FRAGMENT,
    colors,
    uniforms: {
      uCells: cells,
      uSpeed: speed,
      uTrail: trail,
      uVertical: vertical ? 1 : 0,
    },
    name: 'grid-scan',
    // A tight grid at reduced pixel density shimmers along its lines: at
    // low quality, the cells widen.
    degrade: (quality) => ({
      uCells: quality === 'low' ? Math.min(cells, 10) : cells,
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
