/**
 * Hands: a clock whose minute hand advances in jerks, and whose hour hand
 * takes one notch on every turn of the minute hand.
 *
 * ## A hand that jumps, then quivers
 *
 * A mechanical hand does not glide: it jumps by one notch, slightly
 * overshoots, and settles. The jump is a `steps` animation, twelve per turn,
 * on an outer group; the quiver is a second animation, on an inner group,
 * lasting exactly one notch: it starts from a slight overshoot and comes back
 * to zero in `ease-out`. The two synchronise on their own, since the first
 * jumps at the end of every period of the second. A single animation could
 * not do both: `steps` knows nothing of overshoot, and a continuous curve
 * knows nothing of the jump.
 *
 * The hour hand advances by one notch — a twelfth of a turn — every time the
 * minute hand loops once: that is the ratio of a clock, and that is what
 * makes it read as a clock rather than as two spokes turning. The twelve
 * marks of the dial are computed once when the module loads.
 *
 * Three animations on SVG groups, held by the compositor, no JavaScript after
 * the first render.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the
 * wait is information, not decoration. The dial is removed from the
 * accessibility tree.
 *
 * Under reduced motion, both hands sit at noon, still: the figure still reads
 * as a clock, only time stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-clock-hands'

/** Notches per turn of the minute hand. */
const TICKS = 12

/** One mark of the dial: a stroke, longer at the quarters. */
interface Mark {
  readonly x1: number
  readonly y1: number
  readonly x2: number
  readonly y2: number
  readonly major: boolean
}

/** The twelve marks, from the outer radius inwards. */
const MARKS: readonly Mark[] = Array.from({ length: TICKS }, (_, index) => {
  const angle = (2 * Math.PI * index) / TICKS - Math.PI / 2
  const major = index % 3 === 0
  const outer = 41
  const inner = major ? 34 : 37.5
  return {
    x1: Number((50 + outer * Math.cos(angle)).toFixed(2)),
    y1: Number((50 + outer * Math.sin(angle)).toFixed(2)),
    x2: Number((50 + inner * Math.cos(angle)).toFixed(2)),
    y2: Number((50 + inner * Math.sin(angle)).toFixed(2)),
    major,
  }
})

/** Applies the dial, the jumps and the quiver, once per document. */
function ensureClockRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-clock-hands]{display:inline-block;line-height:0}',
    '[data-o-clock-hands] svg{display:block}',
    '[data-o-clock-hand],[data-o-clock-settle]{',
    'transform-box:view-box;transform-origin:50px 50px;',
    '}',
    // Twelve jumps per turn, at the end of each notch.
    '[data-o-clock-hand="minute"]{',
    `animation:o-clock-hands-turn var(--o-clock-speed) steps(${String(TICKS)},end) infinite;`,
    '}',
    // One notch per turn of the minute hand: twelve times slower.
    '[data-o-clock-hand="hour"]{',
    `animation:o-clock-hands-turn calc(var(--o-clock-speed) * ${String(TICKS)}) steps(${String(TICKS)},end) infinite;`,
    '}',
    // The quiver lasts one notch: it restarts on every jump.
    '[data-o-clock-settle]{',
    `animation:o-clock-hands-settle calc(var(--o-clock-speed) / ${String(TICKS)}) ease-out infinite;`,
    '}',
    '@keyframes o-clock-hands-turn{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}',
    // Overshoot, slight return, rest: the mechanism settles.
    '@keyframes o-clock-hands-settle{',
    '0%{transform:rotate(4deg)}',
    '35%{transform:rotate(-1.2deg)}',
    '60%,100%{transform:rotate(0deg)}',
    '}',
    // Noon, still: the figure is stated, without time passing.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-clock-hand],[data-o-clock-settle]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface ClockHandsOwnProps {
  /** Diameter of the dial, in pixels. @defaultValue 48 */
  size?: number
  /** Duration of one turn of the minute hand, in milliseconds. @defaultValue 3000 */
  speed?: number
  /** Colour of the dial and of the hands. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the properties. */
export type ClockHandsProps = Customisable<ClockHandsOwnProps, 'span'>

/**
 * Signals a wait with a clock whose hands advance notch by notch.
 *
 * @example
 * <ClockHands />
 *
 * @example
 * // Bigger, slower, in the brand hue.
 * <ClockHands size={80} speed={6000} color="var(--o-palette-brand-500)" />
 */
export function ClockHands({
  size = 48,
  speed = 3000,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: ClockHandsProps): ReactElement {
  ensureClockRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-clock-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-clock-hands=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <circle
          cx={50}
          cy={50}
          r={46}
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
        />
        {MARKS.map((mark, index) => (
          <line
            key={index}
            x1={mark.x1}
            y1={mark.y1}
            x2={mark.x2}
            y2={mark.y2}
            stroke="currentColor"
            strokeWidth={mark.major ? 3 : 2}
            strokeLinecap="round"
            strokeOpacity={mark.major ? 1 : 0.5}
          />
        ))}
        <g data-o-clock-hand="hour">
          <line
            x1={50}
            y1={54}
            x2={50}
            y2={30}
            stroke="currentColor"
            strokeWidth={5}
            strokeLinecap="round"
          />
        </g>
        <g data-o-clock-hand="minute">
          <g data-o-clock-settle="">
            <line
              x1={50}
              y1={56}
              x2={50}
              y2={17}
              stroke="currentColor"
              strokeWidth={3.5}
              strokeLinecap="round"
            />
          </g>
        </g>
        <circle cx={50} cy={50} r={4} fill="currentColor" />
      </svg>
    </span>
  )
}
