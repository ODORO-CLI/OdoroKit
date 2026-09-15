/**
 * Pulsing block: a surface in waiting whose tone breathes, without a band and
 * without ever becoming transparent.
 *
 * ## The tone breathes, not the opacity
 *
 * The common way of making a skeleton pulse is to vary its opacity. It has a
 * flaw one only sees once the component is in place: at the trough of the
 * pulse, the block lets through whatever is behind it — a background image,
 * another card, a gradient. The stand-in then starts showing something other
 * than itself, and the wait becomes a flicker.
 *
 * Here it is the **tone** that varies: the block stays opaque from start to
 * finish, and only its mix of line and surface moves closer to the surface.
 * `depth` says by how much. The cost is one repaint per frame on a single
 * element — no recomputed layout, no extra layer to compose.
 *
 * ## What it says, and what the sheen says
 *
 * `shimmer-block` crosses the same surface with a band: it gives a direction
 * of reading, something is arriving from the left. The pulse gives none; it
 * says "not yet", and nothing else. It is the right choice when several
 * blocks are waiting together with no order between them, or when one more
 * band, next to a real loading, would make two competing movements.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label; the block is removed from
 * the accessibility tree. Under reduced motion, it freezes at its full value:
 * the surface stays visible, it does not fade away.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-pulse-block'

/** Share of line in the full tone of the block, as a percentage. */
const FULL_MIX = 72

/** Sets the block and its breathing, once per document. */
function ensurePulseBlockRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-pbk]{display:block;width:100%}',
    '[data-o-pbk-face]{',
    'display:block;width:100%;height:var(--o-pbk-height);',
    'border-radius:var(--o-pbk-radius);',
    'background-color:color-mix(in oklab,var(--o-theme-line) var(--o-pbk-full),var(--o-theme-surface));',
    'animation:o-pbk-breathe var(--o-pbk-speed) ease-in-out infinite;',
    '}',
    // The trough moves closer to the surface without ever crossing it: the
    // block stays opaque, and never shows what is behind it.
    '@keyframes o-pbk-breathe{',
    '0%,100%{background-color:color-mix(in oklab,var(--o-theme-line) var(--o-pbk-full),var(--o-theme-surface))}',
    '50%{background-color:color-mix(in oklab,var(--o-theme-line) var(--o-pbk-low),var(--o-theme-surface))}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-pbk-face]{animation:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Props specific to the component. */
export interface PulseBlockOwnProps {
  /** Height of the block, in pixels. @defaultValue 96 */
  height?: number
  /** Corner radius, in pixels. @defaultValue 12 */
  radius?: number
  /** Amplitude of the breathing, from 0 (still) to 1 (all the way to the surface). @defaultValue 0.55 */
  depth?: number
  /** Duration of one cycle, in milliseconds. @defaultValue 1400 */
  speed?: number
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All props. */
export type PulseBlockProps = Customisable<PulseBlockOwnProps, 'div'>

/**
 * Reserves a surface and makes it breathe.
 *
 * @example
 * <PulseBlock height={140} />
 *
 * @example
 * // A breathing barely perceptible, slow.
 * <PulseBlock height={48} depth={0.25} speed={2400} />
 */
export function PulseBlock({
  height = 96,
  radius = 12,
  depth = 0.55,
  speed = 1400,
  label = 'Loading',
  ...rest
}: PulseBlockProps): ReactElement {
  ensurePulseBlockRule()

  const amount = Math.min(1, Math.max(0, depth))

  const { className, style } = mergePresentation({}, rest)

  const hostStyle = {
    ...style,
    '--o-pbk-height': `${String(height)}px`,
    '--o-pbk-radius': `${String(radius)}px`,
    '--o-pbk-full': `${String(FULL_MIX)}%`,
    // The trough is computed here rather than in CSS: `color-mix` accepts a
    // variable for its percentage, but not one expression more.
    '--o-pbk-low': `${String(Math.round(FULL_MIX * (1 - amount)))}%`,
    '--o-pbk-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <div {...rest} className={className} style={hostStyle} data-o-pbk="" role="status">
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-pbk-face="" />
    </div>
  )
}
