/**
 * Chasing dots: a head and its trail turn in single file on a circle.
 *
 * ## One rotation, four dots set in place
 *
 * Turning four dots separately would take four animations synchronised to
 * the degree — and the slightest drift would knock them out of line. Here a
 * single element turns: the plate. The dots are set on it once, each at its
 * angle, and never move again. The chase is an effect of placement, not of
 * movement.
 *
 * The dots decrease in size and in opacity from the head to the tail: it is
 * that gradient which gives a direction of travel. Four identical dots would
 * turn without one knowing which one leads.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the
 * wait is information, not decoration. The plate and its dots are removed
 * from the accessibility tree.
 *
 * Under reduced motion, the plate stops: the file — a head and its trail —
 * still reads as a loader, only the turn stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-chasing-dots'

/** Sets the plate and its dots, once per document. */
function ensureChaseRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-chasing-dots]{',
    'position:relative;display:inline-block;',
    'width:var(--o-chase-size);height:var(--o-chase-size);',
    '}',
    '[data-o-chasing-plate]{',
    'position:absolute;inset:0;',
    'animation:o-chasing-dots-spin var(--o-chase-speed) linear infinite;',
    '}',
    // Each dot starts at the centre, turns to its angle, then moves out to
    // the edge: the radius comes from the translation, not from a
    // computation.
    '[data-o-chasing-dot]{',
    'position:absolute;top:50%;left:50%;',
    'width:var(--o-chase-dot);height:var(--o-chase-dot);',
    'margin:calc(var(--o-chase-dot) / -2);',
    'border-radius:50%;background:var(--o-chase-color);',
    'opacity:var(--o-chase-opacity);',
    'transform:rotate(var(--o-chase-angle)) translate3d(0,calc(var(--o-chase-size) / -2 + var(--o-chase-dot) / 2),0);',
    '}',
    '@keyframes o-chasing-dots-spin{from{transform:rotate(0turn)}to{transform:rotate(1turn)}}',
    // The still file remains a head and its trail: the figure still reads as
    // a loader.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-chasing-plate]{animation:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Props specific to the component. */
export interface ChasingDotsOwnProps {
  /** Diameter of the circle travelled, in pixels. @defaultValue 40 */
  size?: number
  /** Duration of one complete turn, in milliseconds. @defaultValue 1000 */
  speed?: number
  /** Colour of the dots. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All props. */
export type ChasingDotsProps = Customisable<ChasingDotsOwnProps, 'span'>

/**
 * Signals a wait with a file of dots that turns.
 *
 * @example
 * <ChasingDots />
 *
 * @example
 * // Bigger, slower, in the brand hue.
 * <ChasingDots size={64} speed={1600} color="var(--o-palette-brand-500)" />
 */
export function ChasingDots({
  size = 40,
  speed = 1000,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: ChasingDotsProps): ReactElement {
  ensureChaseRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-chase-size': `${String(size)}px`,
    '--o-chase-speed': `${String(speed)}ms`,
    '--o-chase-color': color,
  } as CSSProperties

  // The head first, then three dots ever smaller and paler, each thirty
  // degrees behind the previous one. The diameter of the head is a fifth of
  // the circle: enough for the trail not to overlap itself.
  const dots = [0, 1, 2, 3].map((index) => ({
    angle: `${String(-index * 30)}deg`,
    diameter: Math.max(2, Math.round((size / 5) * (1 - index * 0.2))),
    opacity: 1 - index * 0.22,
  }))

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-chasing-dots=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-chasing-plate="">
        {dots.map((dot, index) => (
          <span
            key={index}
            data-o-chasing-dot=""
            style={
              {
                '--o-chase-angle': dot.angle,
                '--o-chase-dot': `${String(dot.diameter)}px`,
                '--o-chase-opacity': String(dot.opacity),
              } as CSSProperties
            }
          />
        ))}
      </span>
    </span>
  )
}
