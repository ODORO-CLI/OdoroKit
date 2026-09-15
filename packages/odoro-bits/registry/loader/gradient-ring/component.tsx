/**
 * Gradient ring: a conic gradient masked into a ring, rotating.
 *
 * ## A gradient, a mask, a rotation
 *
 * The disc carries a conic gradient that goes from transparent to the full
 * color over a complete turn. A radial mask keeps only the outer crown: the
 * disc becomes a ring whose intensity grows over the whole turn, with no
 * crisp head or tail. That is what sets it apart from an arc on a track:
 * here nothing is cut out, the color fades out continuously.
 *
 * The gradient ends on a seam — full color at 360 degrees, transparent at 0
 * degrees. A round dot the thickness of the ring is placed on that seam: it
 * becomes the head of the movement and rounds off an end of gradient which,
 * on its own, would be cut with a razor.
 *
 * The mask is a radial gradient whose color does not matter, only its
 * opacity: `currentColor` stands in for solid there, without introducing a
 * color value that would belong to no theme.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the
 * wait is information, not decoration. The ring itself is removed from the
 * accessibility tree.
 *
 * Under reduced motion, the ring stays head up: a ring that fades out over
 * its turn still reads as a loader, only the movement stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-gradient-ring'

/** Sets the ring, its mask and its rotation, once per document. */
function ensureGradientRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const mask =
    'radial-gradient(farthest-side, transparent calc(100% - var(--o-grad-thickness)), currentColor calc(100% - var(--o-grad-thickness) + 0.5px))'

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-gradient-ring]{position:relative;display:inline-block;line-height:0}',
    '[data-o-grad-disc]{',
    'position:absolute;inset:0;border-radius:50%;',
    'background:conic-gradient(from 0deg, transparent, var(--o-grad-color));',
    `-webkit-mask:${mask};mask:${mask};`,
    'animation:o-gradient-ring-spin var(--o-grad-speed) linear infinite;',
    '}',
    // The head: a round dot on the seam of the gradient.
    '[data-o-grad-disc]::after{',
    'content:"";position:absolute;top:0;left:50%;',
    'width:var(--o-grad-thickness);height:var(--o-grad-thickness);',
    'border-radius:50%;background:var(--o-grad-color);',
    'transform:translateX(-50%);',
    '}',
    '@keyframes o-gradient-ring-spin{from{transform:rotate(0turn)}to{transform:rotate(1turn)}}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-grad-disc]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** The component's own props. */
export interface GradientRingOwnProps {
  /** Diameter of the ring, in pixels. @defaultValue 48 */
  size?: number
  /** Thickness of the ring, in pixels. @defaultValue 6 */
  thickness?: number
  /** Duration of one turn, in milliseconds. @defaultValue 1000 */
  speed?: number
  /** Color of the head. @defaultValue the text color */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All props. */
export type GradientRingProps = Customisable<GradientRingOwnProps, 'span'>

/**
 * Signals a wait with a ring that fades out over its turn.
 *
 * @example
 * <GradientRing />
 *
 * @example
 * // Bigger, slower, in the brand hue.
 * <GradientRing size={80} thickness={10} speed={1800} color="var(--o-palette-brand-500)" />
 */
export function GradientRing({
  size = 48,
  thickness = 6,
  speed = 1000,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: GradientRingProps): ReactElement {
  ensureGradientRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    // A thickness beyond the radius would close the ring into a disc.
    '--o-grad-thickness': `${String(Math.min(thickness, size / 2))}px`,
    '--o-grad-speed': `${String(speed)}ms`,
    '--o-grad-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-gradient-ring=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-grad-disc="" />
    </span>
  )
}
