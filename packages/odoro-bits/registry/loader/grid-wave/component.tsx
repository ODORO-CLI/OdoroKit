/**
 * Grid wave: sixteen dots lift and grow along a diagonal, a wave crossing the
 * square.
 *
 * ## Seven fronts for sixteen dots
 *
 * In a four by four square, the dots on one anti-diagonal — those whose row
 * plus column sum is equal — form a front. There are seven of them, from the
 * top left corner to the bottom right corner. The delay of a dot is that of
 * its front: the wave advances one front at a time, at an angle, and not dot
 * by dot. That is what sets it apart from `grid-fade`, whose ripple starts
 * from the centre and does not travel.
 *
 * The wave lifts the dots as much as it grows them: a plain change of scale
 * would read as a flicker, the rise gives relief, a crest going by.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the
 * wait is information, not decoration. The dots are removed from the
 * accessibility tree.
 *
 * Under reduced motion, the grid stays flat, all the dots at their rest size:
 * it still reads as a loader, only the wave stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-grid-wave'

/** Side of the grid, in dots. */
const SIDE = 4

/** Number of diagonal fronts: the possible row plus column sums. */
const FRONTS = SIDE * 2 - 1

/** Applies the grid and its wave, once per document. */
function ensureGridWaveRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // A little margin at the top: the crest rises into it without overflowing.
    '[data-o-grid-wave]{',
    'display:inline-grid;grid-template-columns:repeat(4,var(--o-gwave-size));',
    'gap:var(--o-gwave-size);padding-top:var(--o-gwave-size);',
    '}',
    '[data-o-grid-wave-dot]{',
    'width:var(--o-gwave-size);height:var(--o-gwave-size);',
    'border-radius:50%;background:var(--o-gwave-color);',
    'animation:o-grid-wave-crest var(--o-gwave-speed) ease-in-out infinite;',
    'animation-delay:var(--o-gwave-delay);',
    '}',
    // The crest is short: a dot is only lifted for a third of the cycle, the
    // rest of the time it waits flat for the wave to come back.
    '@keyframes o-grid-wave-crest{',
    '0%,30%,100%{transform:translate3d(0,0,0) scale(1);opacity:0.45}',
    '15%{transform:translate3d(0,calc(var(--o-gwave-size) * -0.8),0) scale(1.5);opacity:1}',
    '}',
    // A flat, full grid: it still says "waiting", with no wave.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-grid-wave-dot]{animation:none;transform:none;opacity:1}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface GridWaveOwnProps {
  /** Diameter of one dot at rest, in pixels. @defaultValue 6 */
  size?: number
  /** Duration of one complete pass of the wave, in milliseconds. @defaultValue 1400 */
  speed?: number
  /** Colour of the dots. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the properties. */
export type GridWaveProps = Customisable<GridWaveOwnProps, 'span'>

/**
 * Signals a wait with a diagonal wave over a grid of dots.
 *
 * @example
 * <GridWave />
 *
 * @example
 * // Larger, slower, in the brand hue.
 * <GridWave size={10} speed={2000} color="var(--o-palette-brand-500)" />
 */
export function GridWave({
  size = 6,
  speed = 1400,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: GridWaveProps): ReactElement {
  ensureGridWaveRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-gwave-size': `${String(size)}px`,
    '--o-gwave-speed': `${String(speed)}ms`,
    '--o-gwave-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-grid-wave=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      {Array.from({ length: SIDE * SIDE }, (_, index) => {
        const front = Math.floor(index / SIDE) + (index % SIDE)
        return (
          <span
            key={index}
            aria-hidden
            data-o-grid-wave-dot=""
            style={
              {
                // The first front is the furthest ahead, the last starts from
                // zero: the wave goes from the top left corner to the bottom
                // right corner, negatively so it is already under way on the
                // first frame.
                '--o-gwave-delay': `${String(Math.round((-speed * (FRONTS - 1 - front)) / FRONTS))}ms`,
              } as CSSProperties
            }
          />
        )
      })}
    </span>
  )
}
