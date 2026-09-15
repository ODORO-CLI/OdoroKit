/**
 * Dual ring: two rings with two opposite arcs each, turning against each other.
 *
 * ## Two arcs per ring, and not just one
 *
 * Each ring paints two opposite sides of its border — top and bottom for the
 * outer one, left and right for the inner one — and turns at the same speed as
 * the other, but in the other direction. Twofold symmetry changes everything
 * compared with a single arc: the four arcs cross twice per turn, always at the
 * same places, and it is that regular crossing — not the speed — which gives
 * the impression of a mechanism.
 *
 * The same speed is deliberate: at different speeds the crossings would drift,
 * and the figure would lose its rhythm.
 *
 * Two animations declared once, held by the compositor. No JavaScript after the
 * first render.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: waiting
 * is information, not decoration. The rings themselves are removed from the
 * accessibility tree.
 *
 * Under reduced motion, the arcs stay in a cross — two at the top and bottom,
 * two at the left and right: the figure still reads as a loader, only the
 * movement stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-dual-ring'

/** Sets up the two rings and their rotations, once per document. */
function ensureDualRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-dual-ring]{position:relative;display:inline-block;line-height:0}',
    '[data-o-dual-outer],[data-o-dual-inner]{',
    'position:absolute;box-sizing:border-box;border-radius:50%;',
    'border:var(--o-dual-thickness) solid transparent;',
    'animation:o-dual-ring-spin var(--o-dual-speed) linear infinite;',
    '}',
    '[data-o-dual-outer]{',
    'inset:0;',
    'border-top-color:var(--o-dual-color);border-bottom-color:var(--o-dual-color);',
    '}',
    // The inner ring leaves a gap of one thickness between the two strokes:
    // touching, the arcs would no longer be told apart at the crossing.
    '[data-o-dual-inner]{',
    'inset:calc(var(--o-dual-thickness) * 2);',
    'border-left-color:var(--o-dual-color);border-right-color:var(--o-dual-color);',
    'opacity:0.7;animation-direction:reverse;',
    '}',
    '@keyframes o-dual-ring-spin{from{transform:rotate(0turn)}to{transform:rotate(1turn)}}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-dual-outer],[data-o-dual-inner]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Props of the component itself. */
export interface DualRingOwnProps {
  /** Diameter of the outer ring, in pixels. @defaultValue 48 */
  size?: number
  /** Thickness of the strokes, in pixels. @defaultValue 3 */
  thickness?: number
  /** Duration of one turn, in milliseconds. @defaultValue 1200 */
  speed?: number
  /** Colour of the arcs. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the props. */
export type DualRingProps = Customisable<DualRingOwnProps, 'span'>

/**
 * Signals a wait through two rings crossing in rhythm.
 *
 * @example
 * <DualRing />
 *
 * @example
 * // Bigger, slower, in the brand hue.
 * <DualRing size={80} thickness={5} speed={2000} color="var(--o-palette-brand-500)" />
 */
export function DualRing({
  size = 48,
  thickness = 3,
  speed = 1200,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: DualRingProps): ReactElement {
  ensureDualRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    // Two strokes and a gap have to fit inside the radius.
    '--o-dual-thickness': `${String(Math.min(thickness, size / 6))}px`,
    '--o-dual-speed': `${String(speed)}ms`,
    '--o-dual-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-dual-ring=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-dual-outer="" />
      <span aria-hidden data-o-dual-inner="" />
    </span>
  )
}
