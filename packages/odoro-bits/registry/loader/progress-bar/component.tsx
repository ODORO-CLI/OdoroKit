/**
 * Progress bar: a bar in the flow, with its label and its value, filled by a
 * real progression or crossed by a segment that breathes when nothing is
 * measurable.
 *
 * ## A bar in the page, not a thread on the edge
 *
 * `top-loader` is a thread stuck to the edge of its container, with no
 * visible track and no text: it says "the page is working". This bar here
 * takes its place in the flow, shows its track, and names what it measures —
 * an upload, an install — with its value in figures. It says "here is where
 * this task stands".
 *
 * ## Two modes, two honesties
 *
 * The determinate mode receives `value` and shows it as it is: the bar is a
 * complete `role="progressbar"`, value included, and the fill is a transform
 * scale — never a width, which would force a layout pass at every step.
 *
 * The `indeterminate` mode claims to measure nothing: a segment crosses the
 * track, stretching in the middle and tightening at the edges, in a loop,
 * and the `progressbar` is declared **without** a value — that is how the
 * specification describes an unknown progression. The displayed value
 * becomes three dots: an invented percentage would be the classic lie of
 * loading bars.
 *
 * The visible label and the announced label are the same text: what the eye
 * reads and what the screen reader hears must not diverge.
 *
 * Under reduced motion, the value jumps without a transition and the
 * indeterminate segment becomes a full, dimmed track — present, still.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-progress-bar'

/** Sets the track, the fill and the segment, once per document. */
function ensureProgressBarRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // As a block: the bar takes the width of its parent, like a field.
    '[data-o-progress-bar]{',
    'display:flex;flex-direction:column;gap:0.45em;',
    'font-size:0.875rem;line-height:1.2;',
    '}',
    '[data-o-pbar-head]{display:flex;justify-content:space-between;gap:1em}',
    '[data-o-pbar-value]{font-variant-numeric:tabular-nums;opacity:0.6}',
    '[data-o-pbar-track]{',
    'position:relative;display:block;overflow:hidden;',
    'height:var(--o-pbar-height);border-radius:var(--o-pbar-height);',
    'background:color-mix(in oklab,var(--o-pbar-color) 15%,transparent);',
    '}',
    '[data-o-pbar-fill]{',
    'position:absolute;inset:0;border-radius:inherit;',
    'background:var(--o-pbar-color);transform-origin:left;',
    'transition:transform var(--o-duration-base) var(--o-ease-standard);',
    '}',
    // The segment breathes: narrow at the edges, wide in the middle of the
    // track, and it starts again from the left on each pass.
    '[data-o-pbar-indeterminate] [data-o-pbar-fill]{',
    'width:35%;transition:none;',
    'animation:o-progress-bar-run var(--o-pbar-speed) cubic-bezier(0.4,0,0.2,1) infinite;',
    '}',
    '@keyframes o-progress-bar-run{',
    '0%{transform:translateX(-100%) scaleX(0.5)}',
    '50%{transform:translateX(110%) scaleX(1.4)}',
    '100%{transform:translateX(300%) scaleX(0.5)}',
    '}',
    // A full, dimmed track: the wait is still said, without movement.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-pbar-fill]{transition:none}',
    '[data-o-pbar-indeterminate] [data-o-pbar-fill]{animation:none;width:100%;opacity:0.5;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** The component's own props. */
export interface ProgressBarOwnProps {
  /** Progression, from 0 to 100. Ignored in indeterminate mode. @defaultValue 42 */
  value?: number
  /** Segment without a value, when nothing is measurable. @defaultValue false */
  indeterminate?: boolean
  /** Show the label and the value above the track. @defaultValue true */
  showLabel?: boolean
  /** Thickness of the track, in pixels. @defaultValue 6 */
  height?: number
  /** Duration of one pass of the indeterminate segment, in milliseconds. @defaultValue 1600 */
  speed?: number
  /** Color of the fill. @defaultValue the text color */
  color?: string
  /** Label displayed and announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All props. */
export type ProgressBarProps = Customisable<ProgressBarOwnProps, 'span'>

/**
 * Progress bar in the flow, determinate or indeterminate.
 *
 * @example
 * // Real progression, labelled.
 * <ProgressBar label="Envoi" value={sent / total * 100} />
 *
 * @example
 * // A wait without measure, without a label, in the brand hue.
 * <ProgressBar indeterminate showLabel={false} color="var(--o-palette-brand-500)" />
 */
export function ProgressBar({
  value = 42,
  indeterminate = false,
  showLabel = true,
  height = 6,
  speed = 1600,
  color = 'currentColor',
  label = 'Loading',
  ...rest
}: ProgressBarProps): ReactElement {
  ensureProgressBarRule()

  const clamped = Math.min(100, Math.max(0, value))

  const { className, style } = mergePresentation({}, rest)

  const hostStyle = {
    ...style,
    '--o-pbar-height': `${String(height)}px`,
    '--o-pbar-speed': `${String(speed)}ms`,
    '--o-pbar-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={hostStyle}
      data-o-progress-bar=""
      data-o-pbar-indeterminate={indeterminate ? '' : undefined}
      role="progressbar"
      aria-label={label}
      // A progressbar without aria-valuenow is indeterminate: it is the
      // normative way of saying "I am moving, but I do not know by how much".
      aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : 100}
      aria-valuenow={indeterminate ? undefined : Math.round(clamped)}
    >
      {showLabel ? (
        // The visible text duplicates the label of the role: it is removed
        // from the tree so as not to be announced twice.
        <span aria-hidden data-o-pbar-head="">
          <span>{label}</span>
          <span data-o-pbar-value="">
            {indeterminate ? '...' : `${String(Math.round(clamped))}\u00a0%`}
          </span>
        </span>
      ) : null}
      <span aria-hidden data-o-pbar-track="">
        <span
          data-o-pbar-fill=""
          style={
            indeterminate ? undefined : { transform: `scaleX(${String(clamped / 100)})` }
          }
        />
      </span>
    </span>
  )
}
