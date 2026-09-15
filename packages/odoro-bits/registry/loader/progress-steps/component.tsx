/**
 * Progress steps: numbered steps linked by a rail. The progress fills the
 * rail and ticks off the steps already passed; with nothing to measure, a
 * highlight runs along the rail.
 *
 * ## A continuous value, discrete steps
 *
 * The rail receives `value` continuously and shows it through a transform
 * scale, never a width. The steps are spread at equal distance along the
 * rail, and each one ticks off when the value has passed its position: the
 * first step that has not is the current step, and it pulses. The component
 * therefore never asks "which step are we on" — it derives it from the same
 * value as the rail, and the two cannot contradict each other.
 *
 * ## Two modes, two kinds of honesty
 *
 * The determinate mode is a complete `role="progressbar"`, value included.
 * The `indeterminate` mode claims to measure nothing: no step is ticked
 * off, a highlight runs along the rail, and the `progressbar` is declared
 * **without** a value — that is how the specification describes an unknown
 * progress.
 *
 * ## The background of the steps
 *
 * A step still to pass is an empty circle set on the rail: so that the rail
 * does not run through it, it needs an opaque background, taken from the
 * theme. The number of a step already passed is written in that same
 * background, over the solid color: that is what keeps it legible in both
 * themes.
 *
 * Under reduced motion, the value jumps with no transition, the current
 * step does not pulse, and the indeterminate highlight becomes a full,
 * dimmed bar.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-progress-steps'

/** Applies the rail, the steps and their states, once per document. */
function ensureProgressStepsRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // As a block: the steps spread themselves over the width of the parent.
    '[data-o-progress-steps]{',
    'position:relative;display:flex;align-items:center;justify-content:space-between;',
    'font-size:calc(var(--o-psteps-size) * 0.42);font-weight:600;line-height:1;',
    'font-variant-numeric:tabular-nums;',
    '}',
    // The rail runs from center to center of the outermost steps.
    '[data-o-psteps-rail]{',
    'position:absolute;top:50%;left:calc(var(--o-psteps-size) / 2);right:calc(var(--o-psteps-size) / 2);',
    'height:2px;margin-top:-1px;overflow:hidden;',
    'background:color-mix(in oklab,var(--o-psteps-color) 20%,transparent);',
    '}',
    '[data-o-psteps-fill]{',
    'position:absolute;inset:0;background:var(--o-psteps-color);transform-origin:left;',
    'transition:transform var(--o-duration-base) var(--o-ease-standard);',
    '}',
    '[data-o-psteps-indeterminate] [data-o-psteps-fill]{',
    'width:30%;transition:none;',
    'animation:o-progress-steps-run var(--o-psteps-speed) ease-in-out infinite;',
    '}',
    '@keyframes o-progress-steps-run{',
    'from{transform:translateX(-100%)}',
    'to{transform:translateX(340%)}',
    '}',
    '[data-o-psteps-step]{',
    'position:relative;display:inline-flex;align-items:center;justify-content:center;',
    'box-sizing:border-box;width:var(--o-psteps-size);height:var(--o-psteps-size);',
    'border-radius:50%;border:2px solid color-mix(in oklab,var(--o-psteps-color) 30%,transparent);',
    'background:var(--o-theme-bg);color:var(--o-psteps-color);',
    'transition:background-color var(--o-duration-base) var(--o-ease-standard),',
    'border-color var(--o-duration-base) var(--o-ease-standard);',
    '}',
    // The number is an element of its own: if the circle itself took the
    // background color, a `currentColor` received as the color would resolve
    // to it and the solid circle would vanish into the background.
    '[data-o-psteps-num]{transition:color var(--o-duration-base) var(--o-ease-standard)}',
    '[data-o-psteps-step="done"]{',
    'background:var(--o-psteps-color);border-color:var(--o-psteps-color);',
    '}',
    '[data-o-psteps-step="done"] [data-o-psteps-num]{color:var(--o-theme-bg)}',
    '[data-o-psteps-step="current"]{',
    'border-color:var(--o-psteps-color);',
    'animation:o-progress-steps-pulse var(--o-psteps-speed) ease-out infinite;',
    '}',
    // A halo that moves away and fades out: the current step breathes.
    '@keyframes o-progress-steps-pulse{',
    '0%{box-shadow:0 0 0 0 color-mix(in oklab,var(--o-psteps-color) 45%,transparent)}',
    '100%{box-shadow:0 0 0 calc(var(--o-psteps-size) * 0.4) transparent}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-psteps-fill],[data-o-psteps-step],[data-o-psteps-num]{transition:none}',
    '[data-o-psteps-step="current"]{animation:none}',
    '[data-o-psteps-indeterminate] [data-o-psteps-fill]{animation:none;width:100%;opacity:0.5;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** State of a step, derived from the value. */
type StepState = 'done' | 'current' | 'todo'

/** Properties specific to the component. */
export interface ProgressStepsOwnProps {
  /** Progress, from 0 to 100. Ignored in indeterminate mode. @defaultValue 40 */
  value?: number
  /** Highlight with no value, when nothing is measurable. @defaultValue false */
  indeterminate?: boolean
  /** Number of steps, spread at equal distance. @defaultValue 4 */
  steps?: number
  /** Diameter of a step, in pixels. @defaultValue 28 */
  size?: number
  /** Period of the pulse and of the highlight, in milliseconds. @defaultValue 1600 */
  speed?: number
  /** Color of the steps passed and of the rail. @defaultValue the text color */
  color?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the properties. */
export type ProgressStepsProps = Customisable<ProgressStepsOwnProps, 'span'>

/**
 * Numbered steps on a progress rail.
 *
 * @example
 * // Three steps, the second one current.
 * <ProgressSteps steps={3} value={50} />
 *
 * @example
 * // A wait with nothing to measure, in the brand hue.
 * <ProgressSteps indeterminate color="var(--o-palette-brand-500)" />
 */
export function ProgressSteps({
  value = 40,
  indeterminate = false,
  steps = 4,
  size = 28,
  speed = 1600,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: ProgressStepsProps): ReactElement {
  ensureProgressStepsRule()

  const clamped = Math.min(100, Math.max(0, value))
  const count = Math.max(2, Math.round(steps))

  // A step is passed when the value has gone beyond its position; the first
  // one that has not is the current one. At a hundred, everything is passed.
  let currentFound = false
  const states: StepState[] = Array.from({ length: count }, (_, index) => {
    if (indeterminate) return 'todo'
    const position = (index / (count - 1)) * 100
    if (clamped >= 100 || position < clamped) return 'done'
    if (!currentFound) {
      currentFound = true
      return 'current'
    }
    return 'todo'
  })

  const { className, style } = mergePresentation({}, rest)

  const hostStyle = {
    ...style,
    '--o-psteps-size': `${String(size)}px`,
    '--o-psteps-speed': `${String(speed)}ms`,
    '--o-psteps-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={hostStyle}
      data-o-progress-steps=""
      data-o-psteps-indeterminate={indeterminate ? '' : undefined}
      role="progressbar"
      aria-label={label}
      // A progressbar with no aria-valuenow is indeterminate: that is the
      // normative way of saying "I am moving, but I do not know by how much".
      aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : 100}
      aria-valuenow={indeterminate ? undefined : Math.round(clamped)}
    >
      <span aria-hidden data-o-psteps-rail="">
        <span
          data-o-psteps-fill=""
          style={
            indeterminate ? undefined : { transform: `scaleX(${String(clamped / 100)})` }
          }
        />
      </span>
      {states.map((state, index) => (
        <span key={index} aria-hidden data-o-psteps-step={state}>
          <span data-o-psteps-num="">{index + 1}</span>
        </span>
      ))}
    </span>
  )
}
