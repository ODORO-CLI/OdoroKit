/**
 * Ring of dots: fixed dots in a circle, the highlight turns from one to the
 * next.
 *
 * ## The dots do not move, the highlight does
 *
 * Each dot is placed at its spot on the ring and never moves again: its only
 * life is its opacity, which falls linearly from full to pale over one cycle.
 * A negative delay per dot, proportional to its spot, offsets the cycles: the
 * brightest dot is always followed by a trail of ever paler dots, and that
 * trail turns. It is the loader of operating systems for twenty years, and it
 * is recognised before it has even turned.
 *
 * The placement is done by a rotation around the centre of the ring, not by
 * computed coordinates: the origin of the transform is moved to the centre,
 * and each dot has nothing but an angle. No trigonometry, and the ring stays
 * exact at every size.
 *
 * No JavaScript after the first render: one opacity animation per dot, held
 * by the compositor.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the
 * wait is information, not decoration. The dots themselves are removed from
 * the accessibility tree.
 *
 * Under reduced motion, all the dots stay full: a ring of dots still reads as
 * a loader, only the movement stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-ring-dots'

/** Applies the dots and their fade, once per document. */
function ensureRingDotsRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-ring-dots]{position:relative;display:inline-block;line-height:0}',
    // The dot is placed at the top, then turns around the centre of the ring:
    // the origin of its transform is brought back to that centre.
    '[data-o-ring-dot]{',
    'position:absolute;top:0;left:50%;',
    'width:var(--o-rd-dot);height:var(--o-rd-dot);',
    'margin-left:calc(var(--o-rd-dot) / -2);',
    'border-radius:50%;background:var(--o-rd-color);',
    'transform-origin:50% calc(var(--o-rd-size) / 2);',
    'transform:rotate(var(--o-rd-angle));',
    'animation:o-ring-dots-fade var(--o-rd-speed) linear infinite;',
    'animation-delay:var(--o-rd-delay);',
    '}',
    '@keyframes o-ring-dots-fade{from{opacity:1}to{opacity:0.15}}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-ring-dot]{animation:none;opacity:1}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface RingDotsOwnProps {
  /** Diameter of the ring, in pixels. @defaultValue 40 */
  size?: number
  /** Diameter of one dot, in pixels. @defaultValue 6 */
  dot?: number
  /** Number of dots on the ring. @defaultValue 8 */
  count?: number
  /** Time for the highlight to go around, in milliseconds. @defaultValue 1000 */
  speed?: number
  /** Colour of the dots. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the properties. */
export type RingDotsProps = Customisable<RingDotsOwnProps, 'span'>

/**
 * Signals a wait with a highlight turning on a ring of dots.
 *
 * @example
 * <RingDots />
 *
 * @example
 * // Twelve fine dots, in the brand hue.
 * <RingDots count={12} dot={4} color="var(--o-palette-brand-500)" />
 */
export function RingDots({
  size = 40,
  dot = 6,
  count = 8,
  speed = 1000,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: RingDotsProps): ReactElement {
  ensureRingDotsRule()

  const { className, style } = mergePresentation({}, rest)

  const total = Math.max(1, Math.round(count))

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    '--o-rd-size': `${String(size)}px`,
    '--o-rd-dot': `${String(Math.min(dot, size / 2))}px`,
    '--o-rd-speed': `${String(speed)}ms`,
    '--o-rd-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-ring-dots=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      {Array.from({ length: total }, (_, index) => (
        <span
          key={index}
          aria-hidden
          data-o-ring-dot=""
          style={
            {
              '--o-rd-angle': `${String((index * 360) / total)}deg`,
              // The delay climbs back along the turn, negatively: the
              // highlight moves clockwise and the trail is complete from the
              // very first frame.
              '--o-rd-delay': `${String(Math.round((-speed * (total - index)) / total))}ms`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  )
}
