/**
 * Newton's cradle: five suspended balls, the left one strikes, the right one
 * flies off, and back again.
 *
 * ## Two balls move, three never move
 *
 * The real object imposes it: in a Newton's cradle, only the end balls swing,
 * the others pass the shock along without flinching. The component honours
 * that — two animations, not five — and it is also what makes it credible: a
 * cradle where everything moved would no longer be a cradle.
 *
 * The cycle is a sequence, not a symmetric oscillation. The left ball falls
 * while accelerating and stops dead against its neighbours; at that precise
 * instant the right ball leaves, slows at the top, falls back. The curves are
 * set keyframe by keyframe: `ease-in` for a fall, `ease-out` for a rise. A
 * global `ease-in-out` would make the balls float, and the shock — what makes
 * the whole interest of the figure — would no longer happen.
 *
 * Each ball hangs from a thread, and turns around the anchor point: the
 * rotation is that of the whole thread, the ball follows.
 *
 * ## A status, not a drawing
 *
 * The element carries `role="status"` and a label for screen readers: the
 * wait is information, not decoration. The cradle is removed from the
 * accessibility tree.
 *
 * Under reduced motion, the five balls hang in line, at rest: that is the
 * state the cradle returns to on every shock, and the figure is still
 * recognisable.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-newton-cradle'

/** Applies the cradle and its two swings, once per document. */
function ensureCradleRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // The container leaves margin on each side: at thirty-eight degrees, a
    // thread four balls long swings out by about two and a half balls, and the
    // raised ball must not bite into its neighbours on the page.
    '[data-o-newton-cradle]{',
    'position:relative;display:inline-flex;align-items:flex-start;',
    'padding:0 calc(var(--o-cradle-size) * 2.5);',
    'border-top:2px solid var(--o-cradle-color);',
    '}',
    // A thread and its ball turn together, around the anchor point.
    '[data-o-newton-arm]{',
    'display:flex;flex-direction:column;align-items:center;',
    'width:var(--o-cradle-size);transform-origin:50% 0;',
    'animation-duration:var(--o-cradle-speed);animation-iteration-count:infinite;',
    '}',
    '[data-o-newton-arm="left"]{animation-name:o-newton-cradle-left}',
    '[data-o-newton-arm="right"]{animation-name:o-newton-cradle-right}',
    '[data-o-newton-thread]{',
    'width:1px;height:calc(var(--o-cradle-size) * 3);',
    'background:var(--o-cradle-color);opacity:0.5;',
    '}',
    '[data-o-newton-ball]{',
    'width:var(--o-cradle-size);height:var(--o-cradle-size);',
    'border-radius:50%;background:var(--o-cradle-color);',
    '}',
    // Left: already raised at the start, it falls (ease-in), waits for the
    // shock to come back, and rises again (ease-out) to start over.
    '@keyframes o-newton-cradle-left{',
    '0%{transform:rotate(38deg);animation-timing-function:ease-in}',
    '25%,75%{transform:rotate(0deg);animation-timing-function:ease-out}',
    '100%{transform:rotate(38deg)}',
    '}',
    // Right: still until the shock, it leaves (ease-out), peaks, and falls
    // back (ease-in) onto its neighbours.
    '@keyframes o-newton-cradle-right{',
    '0%,25%{transform:rotate(0deg);animation-timing-function:ease-out}',
    '50%{transform:rotate(-38deg);animation-timing-function:ease-in}',
    '75%,100%{transform:rotate(0deg)}',
    '}',
    // Five balls in line: the cradle at rest, recognisable.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-newton-arm]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface NewtonCradleOwnProps {
  /** Diameter of one ball, in pixels. @defaultValue 10 */
  size?: number
  /** Duration of one complete round trip, in milliseconds. @defaultValue 1400 */
  speed?: number
  /** Colour of the balls, the threads and the bar. @defaultValue the text colour */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the properties. */
export type NewtonCradleProps = Customisable<NewtonCradleOwnProps, 'span'>

/** Role of each arm: only the ends swing. */
const ARMS = ['left', 'still', 'still', 'still', 'right'] as const

/**
 * Signals a wait with a Newton's cradle.
 *
 * @example
 * <NewtonCradle />
 *
 * @example
 * // Larger, slower, in the brand hue.
 * <NewtonCradle size={14} speed={2000} color="var(--o-palette-brand-500)" />
 */
export function NewtonCradle({
  size = 10,
  speed = 1400,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: NewtonCradleProps): ReactElement {
  ensureCradleRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-cradle-size': `${String(size)}px`,
    '--o-cradle-speed': `${String(speed)}ms`,
    '--o-cradle-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-newton-cradle=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      {ARMS.map((arm, index) => (
        <span key={index} aria-hidden data-o-newton-arm={arm}>
          <span data-o-newton-thread="" />
          <span data-o-newton-ball="" />
        </span>
      ))}
    </span>
  )
}
