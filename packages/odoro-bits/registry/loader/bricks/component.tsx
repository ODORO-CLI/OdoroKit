/**
 * Bricks: ten bricks are laid one by one, row by row and staggered, until
 * they form a wall that fades out and is built again.
 *
 * ## The stagger is a row offset, not a per-brick computation
 *
 * A wall is recognized by its offset joints. Rather than positioning each
 * brick, the middle row counts one brick more and shifts half a brick to the
 * left; the container clips whatever sticks out on either side. Three rows
 * in normal flow, a single offset, and the pattern is there.
 *
 * ## One window per brick
 *
 * The laying has an order — the bottom first, from left to right — and an
 * end: the wall holds for a moment, then fades out in one block. Each brick
 * therefore knows its window in the cycle, through an animation of its own
 * written once into the stylesheet. A brick arrives from a little above its
 * place, in `ease-out`: it settles, it does not pop in.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the
 * wait is information, not decoration. The bricks are removed from the
 * accessibility tree.
 *
 * Under reduced motion, the wall stays complete: the figure still reads,
 * only the laying stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-bricks'

/** Number of bricks per row, from the bottom up. */
const ROWS: readonly number[] = [3, 4, 3]

/** Total number of bricks. */
const COUNT = ROWS.reduce((sum, row) => sum + row, 0)

/** Width of one brick, in brick heights. */
const RATIO = 2.2

/** Joint between two bricks, in brick heights. */
const JOINT = 0.25

/** Share of the cycle between two layings, in per cent. */
const STEP = 7.5

/** Duration of one laying, in per cent of the cycle. */
const SETTLE = 6

/** Moment when the complete wall starts to fade out, in per cent. */
const CLEAR_AT = 86

/** Sets the wall and the window of each brick, once per document. */
function ensureBricksRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // Width of three bricks and two joints: the offset row overflows and gets
    // clipped, and that is what draws the half bricks at the edges.
    '[data-o-bricks]{',
    'display:inline-flex;flex-direction:column-reverse;overflow:hidden;',
    `gap:calc(var(--o-bricks-size) * ${String(JOINT)});`,
    `width:calc(var(--o-bricks-size) * ${String(3 * RATIO + 2 * JOINT)});`,
    '}',
    '[data-o-bricks-row]{',
    `display:flex;gap:calc(var(--o-bricks-size) * ${String(JOINT)});flex:none;`,
    '}',
    `[data-o-bricks-row="offset"]{margin-left:calc(var(--o-bricks-size) * ${String(-(RATIO + JOINT) / 2)})}`,
    '[data-o-brick]{',
    `flex:none;width:calc(var(--o-bricks-size) * ${String(RATIO)});height:var(--o-bricks-size);`,
    'border-radius:calc(var(--o-bricks-size) / 6);background:var(--o-bricks-color);',
    'animation-duration:var(--o-bricks-speed);animation-iteration-count:infinite;',
    '}',
    ...Array.from({ length: COUNT }, (_, brick) => {
      const start = brick * STEP
      const end = start + SETTLE
      return [
        `[data-o-brick="${String(brick)}"]{animation-name:o-bricks-${String(brick)}}`,
        `@keyframes o-bricks-${String(brick)}{`,
        `0%,${String(start)}%{opacity:0;transform:translateY(-60%);animation-timing-function:ease-out}`,
        `${String(end)}%,${String(CLEAR_AT)}%{opacity:1;transform:none}`,
        `${String(CLEAR_AT + 8)}%,100%{opacity:0;transform:none}`,
        '}',
      ].join('')
    }),
    // A complete wall: the figure is said, without the laying.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-brick]{animation:none;opacity:1;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** The component's own props. */
export interface BricksOwnProps {
  /** Height of one brick, in pixels. @defaultValue 6 */
  size?: number
  /** Duration of one complete cycle, in milliseconds. @defaultValue 2400 */
  speed?: number
  /** Color of the bricks. @defaultValue the text color */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All props. */
export type BricksProps = Customisable<BricksOwnProps, 'span'>

/**
 * Signals a wait with a brick wall that builds itself and fades out.
 *
 * @example
 * <Bricks />
 *
 * @example
 * // Bigger, slower, in the brand hue.
 * <Bricks size={10} speed={3600} color="var(--o-palette-brand-500)" />
 */
export function Bricks({
  size = 6,
  speed = 2400,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: BricksProps): ReactElement {
  ensureBricksRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-bricks-size': `${String(size)}px`,
    '--o-bricks-speed': `${String(speed)}ms`,
    '--o-bricks-color': color,
  } as CSSProperties

  // The laying order follows the DOM order: the first row in the DOM is at
  // the bottom, thanks to the reversed column.
  let laid = 0

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-bricks=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      {ROWS.map((count, row) => (
        <span key={row} aria-hidden data-o-bricks-row={row % 2 === 1 ? 'offset' : ''}>
          {Array.from({ length: count }, () => {
            const brick = laid
            laid += 1
            return <span key={brick} data-o-brick={String(brick)} />
          })}
        </span>
      ))}
    </span>
  )
}
