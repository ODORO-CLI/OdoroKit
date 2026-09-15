/**
 * Ring that concludes: an arc spins during the wait, closes into a full
 * circle when the answer comes, and the mark of the outcome is drawn inside.
 *
 * ## The ring does not jump back to zero, it stops where it is
 *
 * The problem with a stateful loader is the join. The arc has been spinning
 * for several seconds; at the moment of the answer it sits at some arbitrary
 * angle, and replacing its rotation by another animation would snap it back
 * at once to its starting point — a jolt that gives the machinery away.
 *
 * The rotation is therefore never replaced: it is **paused**. Both
 * animations live side by side in the same list, and
 * `animation-play-state` applies to each of them separately — the rotation
 * freezes at the angle it had, the closing starts. The ring comes to a halt
 * where it stood, then fills in.
 *
 * The closing is not a fade: it is the dash itself lengthening, from its
 * quarter turn to the full turn. The circle declares a length of a hundred,
 * so "a quarter" is written twenty-six, and "everything" a hundred. The wait
 * and the outcome are the same stroke, at two lengths.
 *
 * The mark is only drawn afterwards, once the ring is closed: the container
 * first, then the contents. That is what sets this loader apart from a
 * check that draws itself alone — here the constant figure is the ring, and
 * the check is only its conclusion.
 *
 * ## A status that speaks
 *
 * The element carries `role="status"`: the offscreen label changes with the
 * state, and the change is announced without stealing focus. A shape and a
 * color are not read out loud; a label is. The drawing is removed from the
 * accessibility tree.
 *
 * Under reduced motion, the arc is set still during the wait, and the ring
 * closed with its mark drawn when the answer comes: the end state of each
 * state.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-spinner-to-check'

/** The check, inscribed in the ring. */
const CHECK = 'M 32 51 L 45 64 L 69 38'

/** The cross, two strokes of a single path: the drawing chains them. */
const CROSS = 'M 37 37 L 63 63 M 63 37 L 37 63'

/** Share of the turn covered by the arc during the wait, in per cent. */
const ARC = 26

/** The possible states of the component. */
export type SpinnerToCheckState = 'loading' | 'success' | 'error'

/** Sets the ring, its closing and the mark, once per document. */
function ensureSpinnerToCheckRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-stc]{display:inline-block;line-height:0}',
    '[data-o-stc] svg{display:block}',
    '[data-o-stc-ring]{',
    'transform-box:view-box;transform-origin:50px 50px;',
    `stroke-dasharray:${String(ARC)} ${String(100 - ARC)};`,
    '}',
    '[data-o-stc-mark]{stroke-dasharray:100 100;stroke-dashoffset:100}',
    '[data-o-stc="loading"] [data-o-stc-ring]{',
    'animation:o-stc-spin var(--o-stc-speed) linear infinite;',
    '}',
    // The rotation stays first in the list: it is therefore not restarted,
    // only paused at the current angle, while the closing starts alongside
    // it.
    '[data-o-stc="success"] [data-o-stc-ring],',
    '[data-o-stc="error"] [data-o-stc-ring]{',
    'animation:o-stc-spin var(--o-stc-speed) linear infinite,',
    'o-stc-close calc(var(--o-stc-speed) * 0.45) cubic-bezier(0.4,0,0.2,1) forwards;',
    'animation-play-state:paused,running;',
    '}',
    // The mark waits for the ring to be closed: the container first.
    '[data-o-stc="success"] [data-o-stc-mark],',
    '[data-o-stc="error"] [data-o-stc-mark]{',
    'animation:o-stc-draw calc(var(--o-stc-speed) * 0.4) cubic-bezier(0.65,0,0.35,1)',
    'calc(var(--o-stc-speed) * 0.42) forwards;',
    '}',
    '@keyframes o-stc-spin{to{transform:rotate(360deg)}}',
    `@keyframes o-stc-close{from{stroke-dasharray:${String(ARC)} ${String(100 - ARC)}}to{stroke-dasharray:100 0}}`,
    '@keyframes o-stc-draw{to{stroke-dashoffset:0}}',
    // Arc set still during the wait, ring closed and mark drawn afterwards.
    //
    // The selectors here are as precise as those of the states: a media
    // query adds no specificity, and a shorter rule would lose against
    // `[data-o-stc="loading"] [data-o-stc-ring]` — the ring would keep
    // turning under reduced motion.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-stc] [data-o-stc-ring]{animation:none;transform:none}',
    '[data-o-stc] [data-o-stc-mark]{animation:none}',
    '[data-o-stc="success"] [data-o-stc-ring],',
    '[data-o-stc="error"] [data-o-stc-ring]{stroke-dasharray:100 0}',
    '[data-o-stc="success"] [data-o-stc-mark],',
    '[data-o-stc="error"] [data-o-stc-mark]{stroke-dashoffset:0}',
    '}',
  ].join('')
  document.head.append(style)
}

/** The component's own props. */
export interface SpinnerToCheckOwnProps {
  /** Side of the drawing, in pixels. @defaultValue 56 */
  size?: number
  /** Thickness of the ring and the mark, in pixels. @defaultValue 6 */
  thickness?: number
  /** Duration of one turn of the arc, in milliseconds. @defaultValue 1000 */
  speed?: number
  /** State of the operation. @defaultValue 'loading' */
  state?: SpinnerToCheckState
  /** Color of the ring and the mark. @defaultValue the text color */
  color?: string
  /** Label announced during the wait. @defaultValue 'Loading' */
  label?: string
  /** Label announced on success. @defaultValue 'Done' */
  successLabel?: string
  /** Label announced on failure. @defaultValue 'Failed' */
  errorLabel?: string
}

/** All props. */
export type SpinnerToCheckProps = Customisable<SpinnerToCheckOwnProps, 'span'>

/**
 * Signals a wait, then its outcome, with a ring that closes.
 *
 * @example
 * <SpinnerToCheck state={pending ? 'loading' : 'success'} />
 *
 * @example
 * // A refusal, bigger, in an alert hue.
 * <SpinnerToCheck state="error" size={80} color="var(--o-palette-red-500)" />
 */
export function SpinnerToCheck({
  size = 56,
  thickness = 6,
  speed = 1000,
  state = 'loading',
  color = 'currentColor',
  label = 'Loading',
  successLabel = 'Done',
  errorLabel = 'Failed',
  ...rest
}: SpinnerToCheckProps): ReactElement {
  ensureSpinnerToCheckRule()

  const { className, style } = mergePresentation({}, rest)

  // The drawing lives in a view of 100 units: the thickness asked for in
  // pixels is converted so the stroke keeps its measure at any size.
  const stroke = Math.min((thickness / size) * 100, 16)

  // The radius leaves room for the stroke: without that margin, the ring
  // would be clipped by the edge of the view at large thicknesses.
  const radius = 50 - stroke / 2 - 2

  const mark = state === 'error' ? CROSS : CHECK

  const spoken =
    state === 'success' ? successLabel : state === 'error' ? errorLabel : label

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-stc-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-stc={state}
      role="status"
    >
      <span className="o-sr-only">{spoken}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        {/* The track under the arc: without it, an isolated quarter turn
            does not read as a ring. */}
        <circle
          cx={50}
          cy={50}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeOpacity={0.18}
        />
        <circle
          data-o-stc-ring=""
          cx={50}
          cy={50}
          r={radius}
          pathLength={100}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <path
          data-o-stc-mark=""
          // The key forces React to mount a fresh path when the figure
          // changes: the drawing starts over instead of continuing from the
          // old one, which would show a half-drawn cross.
          key={state === 'error' ? 'cross' : 'check'}
          d={mark}
          pathLength={100}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke * 0.9}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}
