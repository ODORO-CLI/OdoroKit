/**
 * Beating heart: a heart swells twice in a row, rests, and lets a wave
 * leave with every beat.
 *
 * ## One beat is really two
 *
 * A heart does not pulse like a lamp. Every beat is a pair — the "lub-dub"
 * of a stethoscope —: one decided contraction, a shorter second one, then a
 * rest that lasts longer than the two together. Those are the proportions
 * set here, keyframe by keyframe: two swells in `ease-out` — abrupt on
 * departure, damped on arrival, like a contraction — and two returns in
 * `ease-in`, then nothing at all until the end of the cycle. A regular
 * pulse in `ease-in-out` would give a balloon that breathes, not a heart.
 *
 * The wave is a second heart in stroke, which leaves at the size of the
 * first at the moment of the contraction and widens as it fades. It serves
 * to read the beat from afar, when the swell itself is too small to be
 * seen.
 *
 * Two animations on SVG elements, held by the compositor, no JavaScript
 * after the first render.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the
 * wait is information, not decoration. The heart is removed from the
 * accessibility tree.
 *
 * Under reduced motion, the heart is solid, at its resting size, with no
 * wave: the figure still reads, only the beat stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-heartbeat'

/** The heart, two lobes and a tip, centered on the view box. */
const HEART =
  'M 50 86 C 22 64, 8 48, 8 32 C 8 19, 19 10, 30 10 C 39 10, 47 16, 50 25 C 53 16, 61 10, 70 10 C 81 10, 92 19, 92 32 C 92 48, 78 64, 50 86 Z'

/** Applies the heart, its double beat and its wave, once per document. */
function ensureHeartRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-heartbeat]{display:inline-block;line-height:0}',
    '[data-o-heartbeat] svg{display:block;overflow:visible}',
    '[data-o-heart],[data-o-heart-wave]{',
    'transform-box:view-box;transform-origin:50px 50px;',
    'animation-duration:var(--o-heart-speed);animation-iteration-count:infinite;',
    '}',
    '[data-o-heart]{animation-name:o-heartbeat-beat}',
    '[data-o-heart-wave]{opacity:0;animation-name:o-heartbeat-wave}',
    // Two contractions, the second one shorter, then the rest.
    '@keyframes o-heartbeat-beat{',
    '0%{transform:scale(1);animation-timing-function:ease-out}',
    '10%{transform:scale(1.16);animation-timing-function:ease-in}',
    '22%{transform:scale(1);animation-timing-function:ease-out}',
    '32%{transform:scale(1.1);animation-timing-function:ease-in}',
    '46%,100%{transform:scale(1)}',
    '}',
    // The wave leaves with the first contraction and fades as it widens.
    '@keyframes o-heartbeat-wave{',
    '0%,4%{transform:scale(1);opacity:0;animation-timing-function:ease-out}',
    '10%{transform:scale(1.12);opacity:0.55;animation-timing-function:ease-out}',
    '62%,100%{transform:scale(1.7);opacity:0}',
    '}',
    // A solid heart at its resting size: the figure is stated, without beating.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-heart],[data-o-heart-wave]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface HeartbeatOwnProps {
  /** Width of the heart, in pixels. @defaultValue 40 */
  size?: number
  /** Duration of a cycle, double beat and rest included, in milliseconds. @defaultValue 1200 */
  speed?: number
  /** Color of the heart and of the wave. @defaultValue the text color */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the properties. */
export type HeartbeatProps = Customisable<HeartbeatOwnProps, 'span'>

/**
 * Signals a wait with a beating heart.
 *
 * @example
 * <Heartbeat />
 *
 * @example
 * // Bigger, calmer, in the brand hue.
 * <Heartbeat size={64} speed={1800} color="var(--o-palette-brand-500)" />
 */
export function Heartbeat({
  size = 40,
  speed = 1200,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: HeartbeatProps): ReactElement {
  ensureHeartRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-heart-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-heartbeat=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <path
          data-o-heart-wave=""
          d={HEART}
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinejoin="round"
        />
        <path data-o-heart="" d={HEART} fill="currentColor" />
      </svg>
    </span>
  )
}
