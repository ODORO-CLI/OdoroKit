/**
 * Spinning ring: a single short arc running on a dimmed track.
 *
 * ## A track and an arc on the same element
 *
 * Two borders, a single element. The track is the whole border, painted at low
 * opacity on all four sides; the arc is the top side, repainted at full
 * colour. The compositor spins the whole thing: the track is symmetrical, so
 * the only thing seen moving is the arc. No JavaScript after the first render,
 * and nothing to synchronise since there is only one animation.
 *
 * The track is not an ornament: without it, a lone arc floats and the eye does
 * not know where the centre is. With it, the figure is a complete circle one
 * portion of which lights up — that is what one recognises as "it is loading"
 * even before the first turn.
 *
 * ## The thickness changes the character
 *
 * At two pixels it is a discreet hairline inside a button; at eight, a piece
 * of interface in its own right at the centre of an empty page. That is why
 * the thickness is a setting and not a constant derived from the size.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: waiting
 * is information, not decoration. The ring itself is removed from the
 * accessibility tree.
 *
 * Under reduced motion, the arc stays at the top of the track: the figure
 * still reads as a loader, only the movement stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-ring-spinner'

/** Sets up the ring and its rotation, once per document. */
function ensureRingRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-ring-spinner]{display:inline-block;line-height:0}',
    '[data-o-ring-arc]{',
    'display:block;box-sizing:border-box;',
    'width:var(--o-ring-size);height:var(--o-ring-size);',
    'border-radius:50%;',
    'border:var(--o-ring-thickness) solid color-mix(in oklab, var(--o-ring-color) 18%, transparent);',
    'border-top-color:var(--o-ring-color);',
    'animation:o-ring-spinner-spin var(--o-ring-speed) linear infinite;',
    '}',
    '@keyframes o-ring-spinner-spin{from{transform:rotate(0turn)}to{transform:rotate(1turn)}}',
    // The arc stops at the top: that is the position the eye expects of a
    // loader at rest.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-ring-arc]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Props of the component itself. */
export interface RingSpinnerOwnProps {
  /** Diameter of the ring, in pixels. @defaultValue 40 */
  size?: number
  /** Thickness of the stroke, in pixels. @defaultValue 4 */
  thickness?: number
  /** Duration of one turn, in milliseconds. @defaultValue 900 */
  speed?: number
  /** Colour of the arc. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the props. */
export type RingSpinnerProps = Customisable<RingSpinnerOwnProps, 'span'>

/**
 * Signals a wait through an arc running along a track.
 *
 * @example
 * <RingSpinner />
 *
 * @example
 * // A thin hairline, in the brand hue, for a button.
 * <RingSpinner size={16} thickness={2} color="var(--o-palette-brand-500)" />
 */
export function RingSpinner({
  size = 40,
  thickness = 4,
  speed = 900,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: RingSpinnerProps): ReactElement {
  ensureRingRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-ring-size': `${String(size)}px`,
    // Two strokes have to fit inside the diameter: beyond that, the ring would
    // fill up and the arc would disappear.
    '--o-ring-thickness': `${String(Math.min(thickness, size / 2))}px`,
    '--o-ring-speed': `${String(speed)}ms`,
    '--o-ring-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-ring-spinner=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-ring-arc="" />
    </span>
  )
}
