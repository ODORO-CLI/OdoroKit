/**
 * Envelope: the flap opens, the letter comes out, goes back down, and the flap
 * closes again.
 *
 * ## A flap flips over, it does not fold in two
 *
 * The flap does not need perspective to open. Seen head-on, a flap tipping
 * around its hinge is nothing other than the same triangle flipped around that
 * line: a vertical mirror whose origin sits on the hinge. `scaleY(-1)` does
 * exactly that, and going from one to minus one gives the opening movement —
 * the triangle flattens onto the hinge halfway through, like a flap seen
 * edge-on. A rotation in three dimensions would cost a compositing layer for
 * the same result.
 *
 * The letter does not come out of nowhere: it is clipped on the line of the
 * hinge, and slides upwards from behind that clip. Nothing hides it — there is
 * simply nothing to see below. The clip is applied to a group separate from
 * the one that moves: on the same one, it would follow the movement, and the
 * letter would always be cut at the same point of itself.
 *
 * The letter is painted in the surface colour of the theme, that of a sheet
 * laid on the page: it is what makes it pass in front of the open flap instead
 * of blending into it.
 *
 * Two CSS animations on SVG elements, held by the compositor, no JavaScript
 * after the first render.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: waiting
 * is information, not decoration. The drawing is removed from the
 * accessibility tree.
 *
 * Under reduced motion, the envelope is open and the letter out: of all the
 * moments of the cycle, that is the one that says what the figure does.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { useId, type CSSProperties, type ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-envelope'

/** Height of the hinge, in a view of 100 units. */
const HINGE = 34

/** Travel of the letter, in view units. */
const RISE = 32

/** The body of the envelope. */
const BODY = 'M 12 34 L 88 34 L 88 84 Q 88 88 84 88 L 16 88 Q 12 88 12 84 Z'

/** The flap, closed: a triangle pointing downwards. */
const FLAP = 'M 12 34 L 50 62 L 88 34'

/** Sets up the envelope, its flap and its letter, once per document. */
function ensureEnvelopeRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-envelope]{display:inline-block;line-height:0}',
    '[data-o-envelope] svg{display:block}',
    '[data-o-envelope-flap],[data-o-envelope-letter]{',
    'transform-box:view-box;',
    'animation-duration:var(--o-envelope-speed);animation-iteration-count:infinite;',
    '}',
    `[data-o-envelope-flap]{transform-origin:50px ${String(HINGE)}px;animation-name:o-envelope-flap}`,
    '[data-o-envelope-letter]{transform-origin:50px 50px;animation-name:o-envelope-letter}',
    // The flap tips around its hinge: from one to minus one, passing through
    // zero, where it is seen edge-on.
    '@keyframes o-envelope-flap{',
    '0%{transform:scaleY(1);animation-timing-function:ease-in-out}',
    '18%,82%{transform:scaleY(-1);animation-timing-function:ease-in-out}',
    '100%{transform:scaleY(1)}',
    '}',
    // The letter waits for the flap to be open, rises in one go, holds, then
    // goes back down before the flap closes over it.
    '@keyframes o-envelope-letter{',
    '0%,18%{transform:translateY(0);animation-timing-function:cubic-bezier(0.2,0.8,0.3,1)}',
    `38%,62%{transform:translateY(-${String(RISE)}px);animation-timing-function:ease-in}`,
    '82%,100%{transform:translateY(0)}',
    '}',
    // Envelope open, letter out: the moment that tells the whole cycle.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-envelope-flap]{animation:none;transform:scaleY(-1)}',
    `[data-o-envelope-letter]{animation:none;transform:translateY(-${String(RISE)}px)}`,
    '}',
  ].join('')
  document.head.append(style)
}

/** Props of the component itself. */
export interface EnvelopeOwnProps {
  /** Side of the drawing, in pixels. @defaultValue 64 */
  size?: number
  /** Duration of a complete cycle, in milliseconds. @defaultValue 2600 */
  speed?: number
  /** Colour of the envelope strokes. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the props. */
export type EnvelopeProps = Customisable<EnvelopeOwnProps, 'span'>

/**
 * Signals a wait through an envelope opening and delivering its letter.
 *
 * @example
 * <Envelope />
 *
 * @example
 * // Bigger, slower, in the brand hue.
 * <Envelope size={96} speed={3600} color="var(--o-palette-brand-500)" />
 */
export function Envelope({
  size = 64,
  speed = 2600,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: EnvelopeProps): ReactElement {
  ensureEnvelopeRule()

  // The clip is referenced by identifier in the document: two envelopes on the
  // same page must not share the same one.
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const mouth = `o-envelope-mouth-${id}`

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-envelope-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-envelope=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <defs>
          <clipPath id={mouth}>
            {/* Everything above the hinge: the letter is only visible once it
                is out. */}
            <rect x={0} y={0} width={100} height={HINGE} />
          </clipPath>
        </defs>
        <path
          d={BODY}
          fill="none"
          stroke="currentColor"
          strokeWidth={4}
          strokeLinejoin="round"
        />
        <path
          data-o-envelope-flap=""
          d={FLAP}
          fill="none"
          stroke="currentColor"
          strokeWidth={4}
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <g clipPath={`url(#${mouth})`}>
          <g data-o-envelope-letter="">
            {/* The letter is narrower than the flap: its two slanted edges stay
                visible on either side, otherwise the opening would pass
                entirely behind the sheet. */}
            <rect
              x={30}
              y={HINGE}
              width={40}
              height={44}
              rx={3}
              fill="var(--o-theme-surface)"
              stroke="currentColor"
              strokeWidth={4}
            />
            <line x1={38} y1={44} x2={62} y2={44} stroke="currentColor" strokeWidth={4} />
            <line x1={38} y1={54} x2={62} y2={54} stroke="currentColor" strokeWidth={4} />
          </g>
        </g>
      </svg>
    </span>
  )
}
