/**
 * Grid fade: nine dots go out and come back on in concentric waves, from
 * the center toward the corners.
 *
 * ## Three rings, not nine delays
 *
 * In a three by three square, each dot sits at one of three distances from
 * the center: the center itself, the four side midpoints, the four corners.
 * The delay of each dot is the delay of its ring, not of its position: the
 * wave leaves the center and reaches the corners last, like a pebble in
 * water. A delay per position, from left to right, would make a reading —
 * that is the subject of `grid-wave`, not of this one.
 *
 * The delays are negative, and it is the center that has the most lead: the
 * wave is already on its way at the first frame, with no dot left waiting.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the
 * wait is information, not decoration. The dots are removed from the
 * accessibility tree.
 *
 * Under reduced motion, the nine dots stay full: the grid still reads as a
 * loader, only the wave stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-grid-fade'

/** Sets the grid and its fade, once per document. */
function ensureGridFadeRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-grid-fade]{',
    'display:inline-grid;grid-template-columns:repeat(3,var(--o-gfade-size));',
    'gap:calc(var(--o-gfade-size) * 0.6);',
    '}',
    '[data-o-grid-fade-dot]{',
    'width:var(--o-gfade-size);height:var(--o-gfade-size);',
    'border-radius:50%;background:var(--o-gfade-color);',
    'animation:o-grid-fade-pulse var(--o-gfade-speed) ease-in-out infinite;',
    'animation-delay:var(--o-gfade-delay);',
    '}',
    '@keyframes o-grid-fade-pulse{',
    '0%,100%{opacity:1;transform:scale(1)}',
    '50%{opacity:0.15;transform:scale(0.6)}',
    '}',
    // Nine full dots: the grid still says "wait", without the wave.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-grid-fade-dot]{animation:none;opacity:1;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** The component's own props. */
export interface GridFadeOwnProps {
  /** Diameter of one dot, in pixels. @defaultValue 8 */
  size?: number
  /** Duration of one complete cycle, in milliseconds. @defaultValue 1200 */
  speed?: number
  /** Color of the dots. @defaultValue the text color */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All props. */
export type GridFadeProps = Customisable<GridFadeOwnProps, 'span'>

/**
 * Distance in rings from the center of a three by three square.
 *
 * The center is zero, the side midpoints one, the corners two: it is the
 * Chebyshev distance, the one where a diagonal costs as much as a step.
 */
function ring(index: number): number {
  const row = Math.floor(index / 3) - 1
  const col = (index % 3) - 1
  return Math.max(Math.abs(row), Math.abs(col))
}

/**
 * Signals a wait with a grid of dots in concentric waves.
 *
 * @example
 * <GridFade />
 *
 * @example
 * // Bigger, slower, in the brand hue.
 * <GridFade size={12} speed={1800} color="var(--o-palette-brand-500)" />
 */
export function GridFade({
  size = 8,
  speed = 1200,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: GridFadeProps): ReactElement {
  ensureGridFadeRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-gfade-size': `${String(size)}px`,
    '--o-gfade-speed': `${String(speed)}ms`,
    '--o-gfade-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-grid-fade=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      {Array.from({ length: 9 }, (_, index) => (
        <span
          key={index}
          aria-hidden
          data-o-grid-fade-dot=""
          style={
            {
              // The center has two quarters of a cycle of lead over the
              // corners: the wave starts in the middle, negative so as to be
              // already on its way.
              '--o-gfade-delay': `${String(Math.round((-speed * (2 - ring(index))) / 4))}ms`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  )
}
