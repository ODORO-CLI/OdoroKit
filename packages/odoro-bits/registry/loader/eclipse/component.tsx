/**
 * Eclipse: a solid disc hollows itself out until nothing is left but a ring
 * of light, whose halo flares up, then closes again.
 *
 * ## A single circle, not two
 *
 * The naive occultation consists in laying a second disc over the first —
 * but that disc would have to be the color of the background, which the
 * component does not know and has no business knowing. The visible shape is
 * therefore built directly: a ring is a stroked circle, whose radius and
 * thickness move together in such a way that the outer edge never changes.
 * At maximum thickness, the stroke meets itself at the center and the ring
 * is a solid disc; at minimum thickness, nothing is left but a thread.
 * Nothing is masked, nothing is stacked, and the background stays what it
 * is.
 *
 * This is the only figure in the set whose movement goes inwards: the hole
 * opens at the center instead of something escaping from it.
 *
 * ## The halo states the moment
 *
 * Two blurred circles surround the ring, one tight and sharp, the other
 * wide and held. Their opacity only rises at the moment the thread is at
 * its thinnest: that is what gives the instant a peak, instead of an even
 * breathing. The blur is a filter applied to each; at this size it bears on
 * a few hundred pixels.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the
 * wait is information, not decoration. The drawing is removed from the
 * accessibility tree.
 *
 * Under reduced motion, the ring stays open and the halo lit: that is the
 * instant the figure is telling, frozen.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-eclipse'

/** Outer radius of the figure, in view box units. */
const OUTER = 34

/** Thickness of the thread left at maximum opening. */
const THIN = 4

/** Applies the ring, its opening and its halo, once per document. */
function ensureEclipseRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const disc = `${String(OUTER / 2)}px`
  const ring = `${String(OUTER - THIN / 2)}px`

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-eclipse]{display:inline-block;line-height:0}',
    '[data-o-eclipse] svg{display:block}',
    '[data-o-eclipse-disc]{',
    'animation:o-eclipse-open var(--o-eclipse-speed) ease-in-out infinite;',
    '}',
    // Radius and thickness move together: their sum, the outer edge, stays
    // constant from one end to the other.
    '@keyframes o-eclipse-open{',
    `0%,6%{r:${disc};stroke-width:${String(OUTER)}px}`,
    `46%,54%{r:${ring};stroke-width:${String(THIN)}px}`,
    `94%,100%{r:${disc};stroke-width:${String(OUTER)}px}`,
    '}',
    '[data-o-eclipse-halo]{',
    'filter:blur(var(--o-eclipse-blur));',
    'animation:o-eclipse-flare var(--o-eclipse-speed) ease-in-out infinite;',
    '}',
    '@keyframes o-eclipse-flare{',
    '0%,6%{opacity:0}',
    '46%,54%{opacity:var(--o-eclipse-peak)}',
    '94%,100%{opacity:0}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    `[data-o-eclipse-disc]{animation:none;r:${ring};stroke-width:${String(THIN)}px}`,
    '[data-o-eclipse-halo]{animation:none;opacity:var(--o-eclipse-peak)}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface EclipseOwnProps {
  /** Side of the drawing area, in pixels. @defaultValue 64 */
  size?: number
  /** Duration of a complete eclipse, in milliseconds. @defaultValue 3000 */
  speed?: number
  /** Color of the ring and of the halo. @defaultValue the text color */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the properties. */
export type EclipseProps = Customisable<EclipseOwnProps, 'span'>

/**
 * Signals a wait with a disc that hollows itself into a ring of light.
 *
 * @example
 * <Eclipse />
 *
 * @example
 * // Bigger, slower, in the brand hue.
 * <Eclipse size={96} speed={4500} color="var(--o-palette-brand-500)" />
 */
export function Eclipse({
  size = 64,
  speed = 3000,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: EclipseProps): ReactElement {
  ensureEclipseRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-eclipse-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-eclipse=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <circle
          data-o-eclipse-halo=""
          cx="50"
          cy="50"
          r={OUTER + 8}
          fill="none"
          stroke="currentColor"
          strokeWidth={12}
          style={
            { '--o-eclipse-blur': '7px', '--o-eclipse-peak': '0.28' } as CSSProperties
          }
        />
        <circle
          data-o-eclipse-halo=""
          cx="50"
          cy="50"
          r={OUTER}
          fill="none"
          stroke="currentColor"
          strokeWidth={5}
          style={
            { '--o-eclipse-blur': '3px', '--o-eclipse-peak': '0.85' } as CSSProperties
          }
        />
        <circle
          data-o-eclipse-disc=""
          cx="50"
          cy="50"
          r={OUTER / 2}
          fill="none"
          stroke="currentColor"
          strokeWidth={OUTER}
        />
      </svg>
    </span>
  )
}
