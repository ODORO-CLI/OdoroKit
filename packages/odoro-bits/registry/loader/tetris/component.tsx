/**
 * Tetris: three pieces fall notch by notch into a well four cells wide,
 * complete three rows that blink, and the well empties.
 *
 * ## A piece is a group, not four cells
 *
 * The cells of a piece are placed at their final position in the well, and
 * it is the whole group that is translated above the edge then brought back
 * notch by notch by `steps()`: one cell at a time, with no interpolation.
 * The continuous fall of a smooth animation would not read as a Tetris; the
 * jerk does. The well clips whatever sticks out, so a piece only exists
 * visually from the moment it enters.
 *
 * Three pieces — an L, a J and a square — are enough to fill exactly three
 * rows over four columns: twelve cells, with no hole. The full rows blink
 * once then clear, as in the game, and the loop starts again.
 *
 * Every piece knows its window within the cycle, through an animation of
 * its own written once in the stylesheet: the order of the falls and the
 * shared clearing demand it.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the
 * wait is information, not decoration. The well and its pieces are removed
 * from the accessibility tree.
 *
 * Under reduced motion, the well stays filled: the figure still reads, only
 * the fall and the clearing stop.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-tetris'

/** Side of the well, in cells. */
const WELL = 4

/**
 * The pieces, in order of fall, as lists of cells `[column, row]` where row
 * zero is at the top of the well.
 *
 * An L on the left, a J on the right, and the square comes to fill the
 * middle: the three bottom rows are full, with no hole.
 */
const PIECES: readonly (readonly (readonly [number, number])[])[] = [
  [
    [0, 1],
    [0, 2],
    [0, 3],
    [1, 3],
  ],
  [
    [3, 1],
    [3, 2],
    [3, 3],
    [2, 3],
  ],
  [
    [1, 1],
    [2, 1],
    [1, 2],
    [2, 2],
  ],
]

/** Share of the cycle between two starts of a fall, in per cent. */
const STEP = 22

/** Duration of a fall, in per cent of the cycle. */
const DROP = 18

/** Moment when the full rows start to blink, in per cent. */
const CLEAR_AT = 84

/** Applies the well, the cells and the falls, once per document. */
function ensureTetrisRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // The well: a dimmed square that clips whatever falls in from above.
    '[data-o-tetris]{',
    'position:relative;display:inline-block;overflow:hidden;',
    `width:calc(var(--o-tetris-size) * ${String(WELL)});height:calc(var(--o-tetris-size) * ${String(WELL)});`,
    'border-radius:calc(var(--o-tetris-size) / 4);',
    'background:color-mix(in oklab,var(--o-tetris-color) 12%,transparent);',
    '}',
    '[data-o-tetris-piece]{',
    'position:absolute;inset:0;',
    'animation-duration:var(--o-tetris-speed);animation-iteration-count:infinite;',
    '}',
    // A transparent border clipped by the background: the seam between two
    // cells, with no color and no computation.
    '[data-o-tetris-cell]{',
    'position:absolute;width:var(--o-tetris-size);height:var(--o-tetris-size);',
    'box-sizing:border-box;border:1px solid transparent;background-clip:padding-box;',
    'background-color:var(--o-tetris-color);',
    'left:calc(var(--o-tetris-size) * var(--o-tetris-col));',
    'top:calc(var(--o-tetris-size) * var(--o-tetris-row));',
    '}',
    ...PIECES.map((_, piece) => {
      const start = piece * STEP
      const end = start + DROP
      return [
        `[data-o-tetris-piece="${String(piece)}"]{animation-name:o-tetris-${String(piece)}}`,
        `@keyframes o-tetris-${String(piece)}{`,
        // Four notches from the edge to the final position, one at a time.
        `0%,${String(start)}%{transform:translateY(calc(var(--o-tetris-size) * ${String(-WELL)}));opacity:1;animation-timing-function:steps(${String(WELL)},end)}`,
        `${String(end)}%,${String(CLEAR_AT)}%{transform:none;opacity:1}`,
        `${String(CLEAR_AT + 4)}%{opacity:0.3}`,
        `${String(CLEAR_AT + 8)}%{opacity:1}`,
        `${String(CLEAR_AT + 13)}%,100%{transform:none;opacity:0}`,
        '}',
      ].join('')
    }),
    // A filled well: the figure is stated, with no fall.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-tetris-piece]{animation:none;transform:none;opacity:1}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface TetrisOwnProps {
  /** Side of a cell, in pixels. @defaultValue 8 */
  size?: number
  /** Duration of a full cycle, in milliseconds. @defaultValue 2600 */
  speed?: number
  /** Color of the pieces. @defaultValue the text color */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the properties. */
export type TetrisProps = Customisable<TetrisOwnProps, 'span'>

/**
 * Signals a wait with pieces falling into a well.
 *
 * @example
 * <Tetris />
 *
 * @example
 * // Bigger, slower, in the brand hue.
 * <Tetris size={12} speed={3600} color="var(--o-palette-brand-500)" />
 */
export function Tetris({
  size = 8,
  speed = 2600,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: TetrisProps): ReactElement {
  ensureTetrisRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-tetris-size': `${String(size)}px`,
    '--o-tetris-speed': `${String(speed)}ms`,
    '--o-tetris-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-tetris=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      {PIECES.map((cells, piece) => (
        <span key={piece} aria-hidden data-o-tetris-piece={String(piece)}>
          {cells.map(([col, row]) => (
            <span
              key={`${String(col)}-${String(row)}`}
              data-o-tetris-cell=""
              style={
                {
                  '--o-tetris-col': String(col),
                  '--o-tetris-row': String(row),
                } as CSSProperties
              }
            />
          ))}
        </span>
      ))}
    </span>
  )
}
