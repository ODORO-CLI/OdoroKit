/**
 * Segment ring: fixed segments that light up one by one.
 *
 * ## Nothing moves, everything lights up
 *
 * The segments do not travel: they are fixed arcs, evenly spaced, and only
 * their opacity changes. Each plays the same animation — light up at once,
 * hold, fade slowly — with a negative delay proportional to its place on the
 * turn. The eye sees a front advancing segment by segment, followed by a
 * trail that fades. It is the movement of a dial counter, not that of a
 * needle.
 *
 * The lighting is instant and the fading slow, by design: the opposite —
 * rising slowly, cutting sharply — would read as a blink.
 *
 * No JavaScript after the first render: one opacity animation per segment,
 * held by the compositor.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the
 * wait is information, not decoration. The drawing itself is removed from the
 * accessibility tree.
 *
 * Under reduced motion, every segment stays lit: a segmented ring still reads
 * as a loader, only the movement stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-segment-ring'

/** Sets the lighting of the segments, once per document. */
function ensureSegmentRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-segment-ring]{display:inline-block;line-height:0}',
    '[data-o-segment-ring] svg{display:block}',
    '[data-o-segment]{',
    'animation:o-segment-ring-light var(--o-seg-speed) linear infinite;',
    'animation-delay:var(--o-seg-delay);',
    '}',
    // Full at once, out slowly: the front is sharp, the trail soft.
    '@keyframes o-segment-ring-light{',
    '0%,20%{opacity:1}',
    '70%,100%{opacity:0.18}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-segment]{animation:none;opacity:1}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Props specific to the component. */
export interface SegmentRingOwnProps {
  /** Diameter of the ring, in pixels. @defaultValue 48 */
  size?: number
  /** Thickness of the segments, in pixels. @defaultValue 5 */
  thickness?: number
  /** Number of segments around the turn. @defaultValue 8 */
  segments?: number
  /** Time for the front to go round, in milliseconds. @defaultValue 1200 */
  speed?: number
  /** Colour of the segments. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All props. */
export type SegmentRingProps = Customisable<SegmentRingOwnProps, 'span'>

/**
 * Signals a wait with segments that light up in sequence.
 *
 * @example
 * <SegmentRing />
 *
 * @example
 * // Twelve thin segments, in the brand hue.
 * <SegmentRing segments={12} thickness={3} color="var(--o-palette-brand-500)" />
 */
export function SegmentRing({
  size = 48,
  thickness = 5,
  segments = 8,
  speed = 1200,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: SegmentRingProps): ReactElement {
  ensureSegmentRule()

  const { className, style } = mergePresentation({}, rest)

  // The drawing lives in a 100-unit view: the thickness asked for in pixels
  // is converted so that the stroke keeps its measure at any size.
  const stroke = Math.min((thickness / size) * 100, 25)
  const radius = 50 - stroke / 2
  const circumference = 2 * Math.PI * radius

  const count = Math.max(1, Math.round(segments))
  const period = circumference / count
  // Round caps eat half a thickness on each side: the painted share is
  // reduced by as much so that the gap stays visible.
  const painted = Math.max(period * 0.62 - stroke, period * 0.25)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-seg-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-segment-ring=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        {Array.from({ length: count }, (_, index) => (
          <circle
            key={index}
            data-o-segment=""
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeDasharray={`${String(painted)} ${String(circumference)}`}
            transform={`rotate(${String((index * 360) / count - 90 + (stroke * 180) / (Math.PI * radius * 2))} 50 50)`}
            style={
              {
                // The delay climbs along the turn, in the negative: the front
                // advances clockwise and the sequence is complete from the
                // very first frame.
                '--o-seg-delay': `${String(Math.round((-speed * (count - index)) / count))}ms`,
              } as CSSProperties
            }
          />
        ))}
      </svg>
    </span>
  )
}
