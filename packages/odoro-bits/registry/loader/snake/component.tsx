/**
 * Snake: four segments walk a four by four grid in a zigzag, without ever
 * crossing themselves.
 *
 * ## Nothing moves, each cell lights up in turn
 *
 * Moving a snake from cell to cell would require following its head in
 * JavaScript, or one position animation per segment. Here the cells are fixed,
 * and each one plays the same animation: lit for a quarter of the cycle, unlit
 * for the rest. Only its phase changes, according to its rank along the path.
 * Four consecutive cells are therefore lit at any moment — that is the snake,
 * and it advances without anything moving.
 *
 * The path is a zigzag, one row one way, the next the other: it is the only
 * walk of a grid where the next cell always touches the previous one, and so
 * the only one where the snake stays in one piece. A reading walk — line
 * breaks included — would cut it in two at the end of every row.
 *
 * The segments are squares, not dots: a snake is made of cells that touch, and
 * a circle leaves gaps between the segments.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: waiting
 * is information, not decoration. The grid is removed from the accessibility
 * tree.
 *
 * Under reduced motion, the snake rests on the first four cells of the path,
 * the grid dimmed behind it: the figure still reads as a loader, only the walk
 * stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-snake'

/** Side of the grid, in cells. */
const SIDE = 4

/** Number of cells, and so of steps in a walk. */
const CELLS = SIDE * SIDE

/** Length of the snake, in cells. */
const LENGTH = 4

/** Sets up the grid and the lighting of the cells, once per document. */
function ensureSnakeRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-snake]{',
    'display:inline-grid;grid-template-columns:repeat(4,var(--o-snake-size));',
    'gap:calc(var(--o-snake-size) * 0.35);',
    '}',
    '[data-o-snake-cell]{',
    'width:var(--o-snake-size);height:var(--o-snake-size);',
    'border-radius:calc(var(--o-snake-size) * 0.2);',
    'background:var(--o-snake-color);',
    'animation:o-snake-pass var(--o-snake-speed) steps(1,end) infinite;',
    'animation-delay:var(--o-snake-delay);',
    '}',
    // A cell stays lit for a quarter of the cycle — the length of the snake
    // over sixteen cells — then goes out at once: `steps` avoids any fade, a
    // snake does not dim away.
    '@keyframes o-snake-pass{',
    '0%{opacity:1}',
    '25%,100%{opacity:0.12}',
    '}',
    // The snake resting on its first four cells: the figure still reads,
    // without the walk.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-snake-cell]{animation:none;opacity:0.12}',
    '[data-o-snake-cell="rest"]{opacity:1}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Props of the component itself. */
export interface SnakeOwnProps {
  /** Side of a segment, in pixels. @defaultValue 7 */
  size?: number
  /** Duration of a complete walk of the grid, in milliseconds. @defaultValue 1600 */
  speed?: number
  /** Colour of the segments. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the props. */
export type SnakeProps = Customisable<SnakeOwnProps, 'span'>

/**
 * Rank of a cell along the zigzag path.
 *
 * Even rows read from left to right, odd ones from right to left: the cell
 * following the last of a row is the one just below it.
 */
function rank(index: number): number {
  const row = Math.floor(index / SIDE)
  const col = index % SIDE
  return row * SIDE + (row % 2 === 0 ? col : SIDE - 1 - col)
}

/**
 * Signals a wait through a snake walking a grid.
 *
 * @example
 * <Snake />
 *
 * @example
 * // Bigger, slower, in the brand hue.
 * <Snake size={12} speed={2400} color="var(--o-palette-brand-500)" />
 */
export function Snake({
  size = 7,
  speed = 1600,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: SnakeProps): ReactElement {
  ensureSnakeRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-snake-size': `${String(size)}px`,
    '--o-snake-speed': `${String(speed)}ms`,
    '--o-snake-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-snake=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      {Array.from({ length: CELLS }, (_, index) => {
        const step = rank(index)
        return (
          <span
            key={index}
            aria-hidden
            data-o-snake-cell={step < LENGTH ? 'rest' : ''}
            style={
              {
                // The first cell of the path has the biggest head start, the
                // last one starts from zero: the head advances by one rank per
                // step, negative so that the snake is whole on the first frame.
                '--o-snake-delay': `${String(Math.round((-speed * (CELLS - 1 - step)) / CELLS))}ms`,
              } as CSSProperties
            }
          />
        )
      })}
    </span>
  )
}
