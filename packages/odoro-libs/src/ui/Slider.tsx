/**
 * Slider for a numeric value over a range.
 *
 * @module
 */

import {
  type ChangeEvent,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
  useCallback,
  useId,
  useState,
} from 'react'

import { cx } from '../styles/cx.js'

/** Properties of {@link Slider}. */
export interface SliderProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'className' | 'size' | 'type' | 'value' | 'defaultValue' | 'min' | 'max' | 'step'
> {
  /** Label of the slider. Required: a field without a label is unusable. */
  label: ReactNode
  /** Visually hides the label without removing it from the accessibility tree. */
  hideLabel?: boolean
  /** Hint text displayed under the slider. */
  hint?: ReactNode
  /**
   * Error message. Its presence puts the slider in an invalid state and
   * replaces the hint in the announced description.
   */
  error?: ReactNode
  /** Lower bound. @defaultValue 0 */
  min?: number
  /** Upper bound. @defaultValue 100 */
  max?: number
  /** Increment step. @defaultValue 1 */
  step?: number
  /** Value in controlled mode. */
  value?: number
  /** Initial value in uncontrolled mode. @defaultValue the middle of the range */
  defaultValue?: number
  /**
   * Displays the current value to the right of the label. In tabular figures:
   * the width does not jitter during the drag.
   *
   * @defaultValue false
   */
  showValue?: boolean
  /** Formats the value displayed by `showValue`. @defaultValue String */
  formatValue?: (value: number) => string
  /** Additional classes applied to the `<input>` element. */
  className?: string
  /** Additional classes applied to the container. */
  wrapperClassName?: string
  /** Ref to the native element. */
  ref?: Ref<HTMLInputElement>
}

/**
 * Value slider.
 *
 * Relies on the native `type="range"` input: keyboard, touch and screen
 * readers are handled by the browser; the color comes from `accent-color`
 * through `o-accent-brand-600 dark:o-accent-brand-400` (or the danger register on error).
 *
 * @example
 * <Slider
 *   label="Volume"
 *   min={0}
 *   max={100}
 *   showValue
 *   formatValue={(value) => `${value} %`}
 * />
 */
export function Slider({
  label,
  hideLabel = false,
  hint,
  error,
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue,
  showValue = false,
  formatValue,
  className,
  wrapperClassName,
  id,
  ref,
  disabled = false,
  onChange,
  ...rest
}: SliderProps): ReactElement {
  const generatedId = useId()
  const sliderId = id ?? generatedId
  const hintId = `${sliderId}-hint`
  const errorId = `${sliderId}-error`
  const invalid = error !== undefined && error !== null && error !== false

  // Same initial value as the native element without an attribute: the middle
  // of the range.
  const [internal, setInternal] = useState(defaultValue ?? (min + max) / 2)
  const current = value ?? internal

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (value === undefined) setInternal(Number(event.target.value))
      onChange?.(event)
    },
    [onChange, value],
  )

  return (
    <div className={cx('o-flex o-flex-col o-gap-1', wrapperClassName)}>
      <div className="o-flex o-items-center o-justify-between o-gap-2">
        <label
          htmlFor={sliderId}
          className={cx(
            'o-text-sm o-font-medium o-text-zinc-900 dark:o-text-zinc-50',
            hideLabel && 'o-sr-only',
          )}
        >
          {label}
        </label>
        {showValue ? (
          <span
            aria-hidden="true"
            className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400 o-tabular-nums"
          >
            {formatValue !== undefined ? formatValue(current) : String(current)}
          </span>
        ) : null}
      </div>

      <input
        {...rest}
        id={sliderId}
        ref={ref}
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        onChange={handleChange}
        disabled={disabled}
        className={cx(
          'o-w-full',
          invalid
            ? 'o-accent-red-600 dark:o-accent-red-400'
            : 'o-accent-brand-600 dark:o-accent-brand-400',
          disabled ? 'o-opacity-50 o-cursor-not-allowed' : 'o-cursor-pointer',
          className,
        )}
        aria-invalid={invalid || undefined}
        aria-describedby={
          cx(invalid && errorId, !invalid && hint !== undefined && hintId) || undefined
        }
      />

      {invalid ? (
        <p
          id={errorId}
          role="alert"
          className="o-text-sm o-text-red-600 dark:o-text-red-400"
        >
          {error}
        </p>
      ) : hint !== undefined ? (
        <p id={hintId} className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
          {hint}
        </p>
      ) : null}
    </div>
  )
}
