/**
 * Hourglass: the sand flows from the top to the bottom, then the hourglass
 * flips over and it all starts again.
 *
 * ## The sand flows at a constant rate, the flip does not
 *
 * That is the property which makes an hourglass a measuring instrument: the
 * flow through the neck does not depend on the height of sand above it. The
 * fall of the level is therefore linear, and the pile at the bottom rises at
 * the same rate. The flip, on the other hand, is a hand gesture: it starts
 * gently, speeds up, and settles — `ease-in-out`, over a half turn.
 *
 * The sand is clipped by the inner shape of each bulb: it is a `clipPath`, and
 * the two sand shapes merely slide behind it. The pile at the bottom has a
 * peak, like sand falling from a point; the sand at the top has a hollow in
 * the middle, like sand draining through a hole. They are the same shape,
 * turned by a half turn — which makes the end of the cycle, the hourglass
 * flipped with its pile on top, exactly the starting frame. The loop closes
 * without a jump.
 *
 * Four animations on SVG elements, held by the compositor, no JavaScript after
 * the first render.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: waiting
 * is information, not decoration. The hourglass is removed from the
 * accessibility tree.
 *
 * Under reduced motion, the sand is entirely at the bottom: that is the state
 * an hourglass ends in, and the figure is still recognisable.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { useId, type CSSProperties, type ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-hourglass'

/** Outline of the glass, the two bulbs and the neck. */
const GLASS =
  'M 28 10 L 72 10 L 72 22 Q 72 40 53 49 L 53 51 Q 72 60 72 78 L 72 90 L 28 90 L 28 78 Q 28 60 47 51 L 47 49 Q 28 40 28 22 Z'

/** Inside of the top bulb: where the sand can be seen. */
const TOP_BULB = 'M 30 12 L 70 12 L 70 22 Q 70 39 52 48.5 L 48 48.5 Q 30 39 30 22 Z'

/** Inside of the bottom bulb. */
const BOTTOM_BULB =
  'M 48 51.5 L 52 51.5 Q 70 61 70 78 L 70 88 L 30 88 L 30 78 Q 30 61 48 51.5 Z'

/** The pile at the bottom, with a peak. */
const MOUND = 'M 30 90 L 30 76 Q 42 70 50 60 Q 58 70 70 76 L 70 90 Z'

/** The sand at the top: the same pile, turned by a half turn, and so hollowed. */
const HOLLOW = 'M 70 10 L 70 24 Q 58 30 50 40 Q 42 30 30 24 L 30 10 Z'

/**
 * Travel of the sand, in view units.
 *
 * Enough for the sand at the top to leave its bulb entirely, and for the pile
 * at the bottom to start entirely below its own.
 */
const TRAVEL = 40

/** Sets up the hourglass, the sand and the flip, once per document. */
function ensureHourglassRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-hourglass]{display:inline-block;line-height:0}',
    '[data-o-hourglass] svg{display:block}',
    '[data-o-hourglass-body],[data-o-hourglass-sand],[data-o-hourglass-stream]{',
    'transform-box:view-box;transform-origin:50px 50px;',
    'animation-duration:var(--o-hourglass-speed);animation-iteration-count:infinite;',
    '}',
    '[data-o-hourglass-body]{animation-name:o-hourglass-flip}',
    // At rest, the sand is at the bottom: the top has slid out of its bulb,
    // the pile has risen into its own.
    `[data-o-hourglass-sand="top"]{transform:translateY(${String(TRAVEL)}px);animation-name:o-hourglass-drain}`,
    '[data-o-hourglass-sand="bottom"]{transform:translateY(0);animation-name:o-hourglass-fill}',
    '[data-o-hourglass-stream]{opacity:0;animation-name:o-hourglass-stream}',
    // A constant flow: the level falls linearly until empty, then waits for
    // the flip.
    '@keyframes o-hourglass-drain{',
    '0%{transform:translateY(0);animation-timing-function:linear}',
    `72%,100%{transform:translateY(${String(TRAVEL)}px)}`,
    '}',
    '@keyframes o-hourglass-fill{',
    `0%{transform:translateY(${String(TRAVEL)}px);animation-timing-function:linear}`,
    '72%,100%{transform:translateY(0)}',
    '}',
    // The thread of sand is a dashed line whose pattern travels downwards:
    // those are the grains falling. It goes out when the top is empty.
    '@keyframes o-hourglass-stream{',
    '0%{stroke-dashoffset:0;opacity:1;animation-timing-function:linear}',
    '70%{stroke-dashoffset:-72px;opacity:1}',
    '74%,100%{stroke-dashoffset:-72px;opacity:0}',
    '}',
    // A hand gesture: a half turn that starts gently and settles. The flipped
    // hourglass, pile on top, is the starting frame.
    '@keyframes o-hourglass-flip{',
    '0%,78%{transform:rotate(0deg);animation-timing-function:ease-in-out}',
    '96%,100%{transform:rotate(180deg)}',
    '}',
    // All the sand at the bottom, hourglass upright: the figure is stated,
    // run through.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-hourglass-body],[data-o-hourglass-sand],[data-o-hourglass-stream]{animation:none}',
    '[data-o-hourglass-body]{transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Props of the component itself. */
export interface HourglassOwnProps {
  /** Height of the hourglass, in pixels. @defaultValue 48 */
  size?: number
  /** Duration of one cycle, flow and flip included, in milliseconds. @defaultValue 3000 */
  speed?: number
  /** Colour of the glass and of the sand. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the props. */
export type HourglassProps = Customisable<HourglassOwnProps, 'span'>

/**
 * Signals a wait through an hourglass running through and flipping over.
 *
 * @example
 * <Hourglass />
 *
 * @example
 * // Bigger, slower, in the brand hue.
 * <Hourglass size={80} speed={5000} color="var(--o-palette-brand-500)" />
 */
export function Hourglass({
  size = 48,
  speed = 3000,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: HourglassProps): ReactElement {
  ensureHourglassRule()

  // The clips are referenced by identifier in the document: two hourglasses on
  // the same page must not share the same one.
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const topClip = `o-hourglass-top-${id}`
  const bottomClip = `o-hourglass-bottom-${id}`

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-hourglass-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-hourglass=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <defs>
          <clipPath id={topClip}>
            <path d={TOP_BULB} />
          </clipPath>
          <clipPath id={bottomClip}>
            <path d={BOTTOM_BULB} />
          </clipPath>
        </defs>
        <g data-o-hourglass-body="">
          <rect x={22} y={4} width={56} height={6} rx={2} fill="currentColor" />
          <rect x={22} y={90} width={56} height={6} rx={2} fill="currentColor" />
          <g clipPath={`url(#${topClip})`}>
            <path
              data-o-hourglass-sand="top"
              d={HOLLOW}
              fill="currentColor"
              fillOpacity={0.8}
            />
          </g>
          <g clipPath={`url(#${bottomClip})`}>
            <path
              data-o-hourglass-sand="bottom"
              d={MOUND}
              fill="currentColor"
              fillOpacity={0.8}
            />
          </g>
          <line
            data-o-hourglass-stream=""
            x1={50}
            y1={49}
            x2={50}
            y2={86}
            stroke="currentColor"
            strokeWidth={2}
            strokeDasharray="1.5 2.5"
            strokeOpacity={0.8}
          />
          <path
            d={GLASS}
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </span>
  )
}
