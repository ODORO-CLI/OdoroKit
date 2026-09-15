/**
 * Bouncing dots: three dots leap one after the other.
 *
 * ## A jump, not an oscillation
 *
 * A round trip in `ease-in-out` gives a float — the dot slows at the top and
 * at the bottom in the same way, as if hung from a spring. A jump does not
 * look like that: the dot leaves fast, slows at the peak, then falls back
 * accelerating and stops dead on the floor. The curves are therefore set
 * keyframe by keyframe — `ease-out` on the way up, `ease-in` on the way down —
 * and the dot stays on the floor for a third of the cycle: it is that pause
 * that makes one read a bounce rather than a wave.
 *
 * The three dots offset their start by a sixth of a cycle, as a negative
 * delay: the sequence is complete on the first frame, with no dot waiting for
 * its turn.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the
 * wait is information, not decoration. The dots are removed from the
 * accessibility tree.
 *
 * Under reduced motion, the three dots rest on their floor line: the figure
 * still reads as a loader, only the jump stops.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-bouncing-dots'

/** Applies the dots and their jump, once per document. */
function ensureBounceRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // The container reserves the height of the jump: the dot rises into it,
    // the layout does not move.
    '[data-o-bouncing-dots]{',
    'display:inline-flex;align-items:flex-end;',
    'gap:calc(var(--o-bdots-size) * 0.5);',
    'height:calc(var(--o-bdots-size) * 2.6);',
    '}',
    '[data-o-bouncing-dot]{',
    'width:var(--o-bdots-size);height:var(--o-bdots-size);',
    'border-radius:50%;background:var(--o-bdots-color);',
    'animation:o-bouncing-dots-jump var(--o-bdots-speed) infinite;',
    'animation-delay:var(--o-bdots-delay);',
    '}',
    // Rise while decelerating, fall while accelerating, then a beat on the floor.
    '@keyframes o-bouncing-dots-jump{',
    '0%{transform:translate3d(0,0,0);animation-timing-function:ease-out}',
    '33%{transform:translate3d(0,calc(var(--o-bdots-size) * -1.6),0);animation-timing-function:ease-in}',
    '66%,100%{transform:translate3d(0,0,0)}',
    '}',
    // Three dots on the floor: the figure still says "waiting", with no jump.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-bouncing-dot]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface BouncingDotsOwnProps {
  /** Diameter of one dot, in pixels. @defaultValue 10 */
  size?: number
  /** Duration of one complete jump, in milliseconds. @defaultValue 800 */
  speed?: number
  /** Colour of the dots. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the properties. */
export type BouncingDotsProps = Customisable<BouncingDotsOwnProps, 'span'>

/**
 * Signals a wait with three dots jumping in turn.
 *
 * @example
 * <BouncingDots />
 *
 * @example
 * // Larger, slower, in the brand hue.
 * <BouncingDots size={14} speed={1200} color="var(--o-palette-brand-500)" />
 */
export function BouncingDots({
  size = 10,
  speed = 800,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: BouncingDotsProps): ReactElement {
  ensureBounceRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-bdots-size': `${String(size)}px`,
    '--o-bdots-speed': `${String(speed)}ms`,
    '--o-bdots-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-bouncing-dots=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          aria-hidden
          data-o-bouncing-dot=""
          style={
            {
              // A sixth of a cycle apart, negatively: the sequence is complete
              // from the very first frame.
              '--o-bdots-delay': `${String(Math.round((-speed * dot) / 6))}ms`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  )
}
