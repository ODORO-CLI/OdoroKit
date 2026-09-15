/**
 * Swept block: a single waiting surface, crossed by an oblique highlight.
 *
 * ## A primitive, not a mockup
 *
 * The skeletons of this set draw a recognisable shape — a paragraph, a
 * card, a table. This one draws nothing: it is the bare block, the one you
 * lay down yourself at the dimensions of the expected content. It takes the
 * width of its parent and the height you give it, and that is all it
 * promises.
 *
 * ## The highlight is in the background, not above it
 *
 * The band is not a layer laid over the block: it is the background of the
 * block itself, an image two and a half times as wide as its box, of which
 * only the **position** moves. Not one element more, no composition to
 * stack — and above all, the band follows the rounded corners without
 * having to restate the radius.
 *
 * The obliquity is adjustable and is a hundred and ten degrees by default:
 * a vertical band reads as a cursor, and a cursor promises a position
 * within a progress. Tilted, it becomes a highlight on a surface again.
 *
 * `pulse-block` treats the same surface differently: it has no band at all,
 * it breathes. A highlight says "something is going through" and gives a
 * reading direction; a pulse only says "not yet".
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label; the block is removed
 * from the accessibility tree. Under reduced motion, the background loses
 * its band and keeps its full value: the surface stays visible, it does not
 * fade away.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-shimmer-block'

/** Applies the block and its highlight, once per document. */
function ensureShimmerBlockRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-shb]{display:block;width:100%}',
    '[data-o-shb-face]{',
    'display:block;width:100%;height:var(--o-shb-height);',
    'border-radius:var(--o-shb-radius);',
    // The tone of the block: the line gives the density, the surface lightens it.
    'background-color:color-mix(in oklab,var(--o-theme-line) 72%,var(--o-theme-surface));',
    // The band is the background, not a layer: it therefore follows the radius.
    'background-image:linear-gradient(var(--o-shb-angle),transparent 0 calc(50% - var(--o-shb-band)),color-mix(in oklab,var(--o-theme-surface) 85%,transparent) 50%,transparent calc(50% + var(--o-shb-band)) 100%);',
    'background-size:250% 100%;background-repeat:no-repeat;',
    'background-position:150% 0;',
    'animation:o-shb-sweep var(--o-shb-speed) linear infinite;',
    '}',
    '@keyframes o-shb-sweep{from{background-position:150% 0}to{background-position:-50% 0}}',
    // With no band, at full value: the space is still held.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-shb-face]{animation:none;background-image:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface ShimmerBlockOwnProps {
  /** Height of the block, in pixels. @defaultValue 96 */
  height?: number
  /** Radius of the corners, in pixels. @defaultValue 12 */
  radius?: number
  /** Obliquity of the band, in degrees. @defaultValue 110 */
  angle?: number
  /** Half-width of the band, as a percentage of the background image. @defaultValue 14 */
  band?: number
  /** Duration of one pass of the band, in milliseconds. @defaultValue 1800 */
  speed?: number
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the properties. */
export type ShimmerBlockProps = Customisable<ShimmerBlockOwnProps, 'div'>

/**
 * Reserves a surface and crosses it with a highlight.
 *
 * @example
 * <ShimmerBlock height={140} />
 *
 * @example
 * // A wide, almost horizontal band, slow.
 * <ShimmerBlock height={64} angle={80} band={24} speed={2600} />
 */
export function ShimmerBlock({
  height = 96,
  radius = 12,
  angle = 110,
  band = 14,
  speed = 1800,
  label = 'Loading',
  ...rest
}: ShimmerBlockProps): ReactElement {
  ensureShimmerBlockRule()

  const { className, style } = mergePresentation({}, rest)

  const hostStyle = {
    ...style,
    '--o-shb-height': `${String(height)}px`,
    '--o-shb-radius': `${String(radius)}px`,
    '--o-shb-angle': `${String(angle)}deg`,
    '--o-shb-band': `${String(Math.max(1, band))}%`,
    '--o-shb-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <div {...rest} className={className} style={hostStyle} data-o-shb="" role="status">
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-shb-face="" />
    </div>
  )
}
