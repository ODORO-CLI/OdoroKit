/**
 * Success tick: the tick draws itself on a loop during the wait, settles for
 * good on success, and gives way to a cross on failure.
 *
 * ## The same gesture, from beginning to end
 *
 * Most loaders with states change figure the moment the answer arrives: a
 * spinning ring, then a tick. This one never changes figure — it is the same
 * tick that sketches itself during the wait and that stops fading away when
 * the answer comes. The user therefore sees, from the very first second, what
 * they are waiting for.
 *
 * The stroke is a dash as long as the path, moved by its offset: the tick
 * draws itself from the bottom point upwards, in the order a hand would trace
 * it. The path declares a length of one hundred, which makes the keyframes
 * independent of its real length — and the cross, which is two strokes of a
 * single path, draws itself with exactly the same keyframes.
 *
 * During the wait, the tick traces itself, holds, then fades out and starts
 * again: a sketch, never an assertion. On the answer, the animation becomes a
 * single run and freezes on its last frame — that is the only difference
 * between "maybe" and "yes".
 *
 * The disc behind the stroke only appears on the answer: it gives the result
 * a weight the wait does not have.
 *
 * ## A status that speaks
 *
 * The element carries `role="status"`: the offscreen label changes with the
 * state, and the change is announced without stealing focus. It is the only
 * channel through which a screen reader learns that the operation succeeded —
 * a colour and a shape are not read out loud. The drawing itself is removed
 * from the accessibility tree.
 *
 * Under reduced motion, the mark is fully traced in every state, disc
 * included: that is the final state, the one that informs.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-checkmark-success'

/** The tick, from the bottom point upwards. */
const CHECK = 'M 26 52 L 43 69 L 76 32'

/** The cross, two strokes of a single path: the trace chains them. */
const CROSS = 'M 34 34 L 66 66 M 66 34 L 34 66'

/** Possible states of the component. */
export type CheckmarkState = 'loading' | 'success' | 'error'

/** Sets the mark, its trace and its states, once per document. */
function ensureCheckmarkRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-checkmark]{display:inline-block;line-height:0}',
    '[data-o-checkmark] svg{display:block}',
    '[data-o-checkmark-mark]{stroke-dasharray:100 100;stroke-dashoffset:100}',
    '[data-o-checkmark-halo]{opacity:0;transform-box:view-box;transform-origin:50px 50px}',
    '[data-o-checkmark-shake]{transform-box:view-box;transform-origin:50px 50px}',
    // Waiting: the tick sketches itself endlessly.
    '[data-o-checkmark="loading"] [data-o-checkmark-mark]{',
    'animation:o-checkmark-loop var(--o-check-speed) infinite;',
    '}',
    // Answer: a single trace, frozen on its last frame.
    '[data-o-checkmark="success"] [data-o-checkmark-mark],',
    '[data-o-checkmark="error"] [data-o-checkmark-mark]{',
    'animation:o-checkmark-draw var(--o-check-speed) cubic-bezier(0.65,0,0.35,1) forwards;',
    '}',
    '[data-o-checkmark="success"] [data-o-checkmark-halo],',
    '[data-o-checkmark="error"] [data-o-checkmark-halo]{',
    'animation:o-checkmark-pop var(--o-check-speed) cubic-bezier(0.34,1.56,0.64,1) forwards;',
    '}',
    // A refusal shakes its head: two short back-and-forths, after the trace,
    // never during.
    '[data-o-checkmark="error"] [data-o-checkmark-shake]{',
    'animation:o-checkmark-shake calc(var(--o-check-speed) * 0.5) ease-in-out calc(var(--o-check-speed) * 0.7) 1;',
    '}',
    '@keyframes o-checkmark-loop{',
    '0%{stroke-dashoffset:100;opacity:1;animation-timing-function:cubic-bezier(0.65,0,0.35,1)}',
    '46%,72%{stroke-dashoffset:0;opacity:1;animation-timing-function:ease-in}',
    '100%{stroke-dashoffset:0;opacity:0}',
    '}',
    '@keyframes o-checkmark-draw{to{stroke-dashoffset:0}}',
    '@keyframes o-checkmark-pop{',
    '0%{opacity:0;transform:scale(0.6)}',
    '100%{opacity:1;transform:scale(1)}',
    '}',
    '@keyframes o-checkmark-shake{',
    '0%,100%{transform:translateX(0)}',
    '25%{transform:translateX(-5px)}',
    '60%{transform:translateX(5px)}',
    '85%{transform:translateX(-2px)}',
    '}',
    // Mark fully traced, disc laid down where needed: the final state.
    //
    // The selectors here are as precise as those of the states: a media query
    // adds no specificity, and a shorter rule would lose against
    // `[data-o-checkmark="loading"] [data-o-checkmark-mark]` — the
    // animation would keep running under reduced motion.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-checkmark] [data-o-checkmark-mark]{animation:none;stroke-dashoffset:0;opacity:1}',
    '[data-o-checkmark] [data-o-checkmark-shake]{animation:none;transform:none}',
    '[data-o-checkmark] [data-o-checkmark-halo]{animation:none;transform:none}',
    '[data-o-checkmark="success"] [data-o-checkmark-halo],',
    '[data-o-checkmark="error"] [data-o-checkmark-halo]{opacity:1}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface CheckmarkSuccessOwnProps {
  /** Side of the drawing, in pixels. @defaultValue 56 */
  size?: number
  /** Stroke thickness, in pixels. @defaultValue 6 */
  thickness?: number
  /** Duration of one trace, in milliseconds. @defaultValue 900 */
  speed?: number
  /** State of the operation. @defaultValue 'loading' */
  state?: CheckmarkState
  /** Colour of the mark. @defaultValue the text colour */
  color?: string
  /** Label announced during the wait. @defaultValue 'Loading' */
  label?: string
  /** Label announced on success. @defaultValue 'Done' */
  successLabel?: string
  /** Label announced on failure. @defaultValue 'Failed' */
  errorLabel?: string
}

/** All the properties. */
export type CheckmarkSuccessProps = Customisable<CheckmarkSuccessOwnProps, 'span'>

/**
 * Signals a wait and then its outcome with a tick that draws itself.
 *
 * @example
 * <CheckmarkSuccess state={pending ? 'loading' : 'success'} />
 *
 * @example
 * // A refusal, bigger, in an alert hue.
 * <CheckmarkSuccess state="error" size={80} color="var(--o-palette-red-500)" />
 */
export function CheckmarkSuccess({
  size = 56,
  thickness = 6,
  speed = 900,
  state = 'loading',
  color = 'currentColor',
  label = 'Loading',
  successLabel = 'Done',
  errorLabel = 'Failed',
  ...rest
}: CheckmarkSuccessProps): ReactElement {
  ensureCheckmarkRule()

  const { className, style } = mergePresentation({}, rest)

  // The drawing lives in a view of 100 units: the thickness asked for in
  // pixels is converted so that the stroke keeps its measure at any size.
  const stroke = Math.min((thickness / size) * 100, 20)

  // The cross does not share the tick: it is the opposite of success, not a
  // variant of it. The trace, on the other hand, is exactly the same.
  const mark = state === 'error' ? CROSS : CHECK

  const spoken =
    state === 'success' ? successLabel : state === 'error' ? errorLabel : label

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-check-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-checkmark={state}
      role="status"
    >
      <span className="o-sr-only">{spoken}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <g data-o-checkmark-shake="">
          <circle
            data-o-checkmark-halo=""
            cx={50}
            cy={50}
            r={46}
            fill="currentColor"
            fillOpacity={0.12}
          />
          <path
            data-o-checkmark-mark=""
            // The key forces React to mount a fresh path when the figure
            // changes: the animation starts over instead of carrying on from
            // the old one, which would show a half-traced cross.
            key={state === 'error' ? 'cross' : 'check'}
            d={mark}
            pathLength={100}
            fill="none"
            stroke="currentColor"
            strokeWidth={stroke}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </span>
  )
}
