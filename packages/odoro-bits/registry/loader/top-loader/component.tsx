/**
 * Loading bar: a thin line at the top of its container, driven by a real
 * progress or swept while waiting.
 *
 * ## Two modes, two kinds of honesty
 *
 * The determinate mode receives `progress` and shows it as it is: the bar is
 * a complete `role="progressbar"`, value included, and its width is a
 * transform scale — never a width, which would force a layout at every
 * advance.
 *
 * The `indeterminate` mode claims to measure nothing: a segment sweeps the
 * bar in a loop, and the `progressbar` is declared **without** a value —
 * that is exactly how the specification describes an unknown progress.
 * Showing a made-up percentage would be the classic lie of loading bars.
 *
 * ## Pinned to its container, or to the screen
 *
 * By default the bar sits at the top of the first positioned ancestor — a
 * panel, a card, a preview frame. `fixed` anchors it to the window, for the
 * global navigation bar of an application.
 *
 * Under reduced motion, the indeterminate sweep becomes a full, dimmed bar —
 * present, motionless — and the determinate progress jumps with no
 * transition.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-top-loader'

/** Applies the bar and its sweep, once per document. */
function ensureTopLoaderRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-top-loader]{overflow:hidden;pointer-events:none}',
    '[data-o-top-bar]{',
    'height:100%;width:100%;transform-origin:left;',
    'background:linear-gradient(90deg,var(--o-tl-from),var(--o-tl-to));',
    'transition:transform var(--o-duration-base) var(--o-ease-standard);',
    '}',
    // The sweep: a shorter segment crosses the bar in a loop.
    '[data-o-top-indeterminate] [data-o-top-bar]{',
    'width:40%;transition:none;',
    'animation:o-top-loader-sweep 1200ms ease-in-out infinite;',
    '}',
    '@keyframes o-top-loader-sweep{',
    'from{transform:translate3d(-100%,0,0)}',
    'to{transform:translate3d(350%,0,0)}',
    '}',
    // A full, dimmed bar: the wait is still stated, with no movement.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-top-bar]{transition:none}',
    '[data-o-top-indeterminate] [data-o-top-bar]{animation:none;width:100%;opacity:0.5;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Properties specific to the component. */
export interface TopLoaderOwnProps {
  /** Progress, from 0 to 100. Ignored in indeterminate mode. @defaultValue 0 */
  progress?: number
  /** Sweep with no value, when nothing is measurable. @defaultValue false */
  indeterminate?: boolean
  /** Thickness of the bar, in pixels. @defaultValue 3 */
  height?: number
  /** Anchor to the window rather than to the container. @defaultValue false */
  fixed?: boolean
  /** Start of the gradient. @defaultValue the brand hue */
  from?: string
  /** End of the gradient. @defaultValue a sky blue */
  to?: string
  /** Label announced to screen readers. @defaultValue 'Loading' */
  label?: string
}

/** All the properties. */
export type TopLoaderProps = Customisable<TopLoaderOwnProps>

/**
 * Loading bar at the top of its container.
 *
 * @example
 * // Real progress, in a positioned container.
 * <div className="o-relative">
 *   <TopLoader progress={sent / total * 100} />
 *   …
 * </div>
 *
 * @example
 * // A wait with nothing to measure, anchored to the window.
 * <TopLoader indeterminate fixed />
 */
export function TopLoader({
  progress = 0,
  indeterminate = false,
  height = 3,
  fixed = false,
  from = 'var(--o-palette-brand-500)',
  to = 'var(--o-palette-sky-400)',
  label = 'Loading',
  ...rest
}: TopLoaderProps): ReactElement {
  ensureTopLoaderRule()

  const value = Math.min(100, Math.max(0, progress))

  const { className, style } = mergePresentation(
    {
      className: fixed
        ? 'o-fixed o-top-0 o-left-0 o-right-0 o-z-50'
        : 'o-absolute o-top-0 o-left-0 o-right-0',
    },
    rest,
  )

  const hostStyle = {
    ...style,
    height: `${String(height)}px`,
    '--o-tl-from': from,
    '--o-tl-to': to,
  } as CSSProperties

  return (
    <div
      {...rest}
      className={className}
      style={hostStyle}
      data-o-top-loader=""
      data-o-top-indeterminate={indeterminate ? '' : undefined}
      role="progressbar"
      aria-label={label}
      // A progressbar with no aria-valuenow is indeterminate: that is the
      // normative way of saying "I am moving, but I do not know by how much".
      aria-valuemin={indeterminate ? undefined : 0}
      aria-valuemax={indeterminate ? undefined : 100}
      aria-valuenow={indeterminate ? undefined : Math.round(value)}
    >
      <div
        aria-hidden
        data-o-top-bar=""
        style={
          indeterminate ? undefined : { transform: `scaleX(${String(value / 100)})` }
        }
      />
    </div>
  )
}
