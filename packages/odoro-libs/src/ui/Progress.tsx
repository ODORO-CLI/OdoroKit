/**
 * Progress bar.
 *
 * @module
 */

import { type HTMLAttributes, type ReactElement } from 'react'

import { cx } from '../styles/cx.js'

/** Fill color per tone. */
const TONE_CLASSES: Readonly<
  Record<'primary' | 'success' | 'warning' | 'danger', string>
> = {
  primary: 'o-bg-brand-600 dark:o-bg-brand-400',
  success: 'o-bg-emerald-600 dark:o-bg-emerald-400',
  warning: 'o-bg-amber-600 dark:o-bg-amber-400',
  danger: 'o-bg-red-600 dark:o-bg-red-400',
}

/** Track height per size. */
const SIZE_CLASSES: Readonly<Record<'sm' | 'md' | 'lg', string>> = {
  sm: 'o-h-1',
  md: 'o-h-2',
  lg: 'o-h-3',
}

/** Properties of {@link Progress}. */
export interface ProgressProps extends Omit<HTMLAttributes<HTMLDivElement>, 'className'> {
  /** Current value, clamped between 0 and `max`. @defaultValue 0 */
  value?: number
  /** Maximum value. @defaultValue 100 */
  max?: number
  /**
   * Unknown progress: a partial bar loops across and `aria-valuenow` is
   * omitted, as ARIA requires for an indeterminate state.
   *
   * @defaultValue false
   */
  indeterminate?: boolean
  /** Color tone of the fill. @defaultValue 'primary' */
  tone?: 'primary' | 'success' | 'warning' | 'danger'
  /** Size (track height). @defaultValue 'md' */
  size?: 'sm' | 'md' | 'lg'
  /** Accessible label of the bar. */
  label?: string
  /**
   * Displays the percentage to the right of the track. No effect in
   * indeterminate mode: there is nothing to put a number on.
   *
   * @defaultValue false
   */
  showValue?: boolean
  /** Additional classes. */
  className?: string
}

/**
 * Progress bar.
 *
 * The fill is sized by a percentage `width`: the utility stylesheet cannot
 * cover a continuum of widths.
 *
 * @example
 * <Progress value={done} max={total} label="File import" showValue />
 */
export function Progress({
  value = 0,
  max = 100,
  indeterminate = false,
  tone = 'primary',
  size = 'md',
  label,
  showValue = false,
  className,
  ...rest
}: ProgressProps): ReactElement {
  const bounded = Math.min(Math.max(value, 0), max)
  const percent = max > 0 ? (bounded / max) * 100 : 0

  return (
    <div {...rest} className={cx('o-flex o-items-center o-gap-3', className)}>
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={indeterminate ? undefined : bounded}
        className={cx(
          'o-flex-1 o-bg-zinc-100 dark:o-bg-zinc-950 o-rounded-full o-overflow-hidden',
          SIZE_CLASSES[size],
        )}
      >
        <div
          className={cx(
            'o-h-full o-rounded-full',
            TONE_CLASSES[tone],
            indeterminate && 'o-animate-indeterminate',
          )}
          style={{ width: indeterminate ? '25%' : `${percent}%` }}
        />
      </div>
      {showValue && !indeterminate ? (
        <span className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400 o-tabular-nums o-shrink-0">
          {Math.round(percent)}%
        </span>
      ) : null}
    </div>
  )
}
