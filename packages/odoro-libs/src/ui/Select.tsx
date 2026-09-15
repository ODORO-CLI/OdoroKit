/**
 * Native dropdown list styled like a text field.
 *
 * @module
 */

import {
  type ReactElement,
  type ReactNode,
  type Ref,
  type SelectHTMLAttributes,
  useId,
} from 'react'

import { cx } from '../styles/cx.js'
import { inputClasses } from './Input.jsx'

/** One option of {@link Select}. */
export interface SelectOption {
  /** Submitted value. */
  readonly value: string
  /** Displayed label. */
  readonly label: string
  /** Makes the option unselectable. */
  readonly disabled?: boolean
}

/** Properties of {@link Select}. */
export interface SelectProps extends Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'className' | 'size'
> {
  /** Field label. Required: a field without a label is unusable. */
  label: ReactNode
  /** Visually hides the label without removing it from the accessibility tree. */
  hideLabel?: boolean
  /** Hint text displayed under the field. */
  hint?: ReactNode
  /**
   * Error message. Its presence puts the field in an invalid state and
   * replaces the hint in the announced description.
   */
  error?: ReactNode
  /** Size. @defaultValue 'md' */
  size?: 'sm' | 'md' | 'lg'
  /**
   * Options to display. In their absence, the `children` (`<option>`,
   * `<optgroup>`) are rendered as they are.
   */
  options?: readonly SelectOption[]
  /**
   * Text displayed as long as no value is chosen, rendered as an empty and
   * disabled option: it cannot be selected again afterwards.
   */
  placeholder?: string
  /** Additional classes applied to the `<select>` element. */
  className?: string
  /** Additional classes applied to the container. */
  wrapperClassName?: string
  /** Ref to the native element. */
  ref?: Ref<HTMLSelectElement>
}

/** Decorative chevron. The native one is hidden by `o-appearance-none`. */
function Chevron(): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * Dropdown list.
 *
 * Relies on the native `<select>`: the option panel keeps the behavior of the
 * system (keyboard, touch, screen readers). Only the closed box is styled,
 * with the chevron redrawn on top.
 *
 * @example
 * <Select
 *   label="Country"
 *   placeholder="Choose a country"
 *   options={[
 *     { value: 'fr', label: 'France' },
 *     { value: 'be', label: 'Belgium' },
 *   ]}
 * />
 */
export function Select({
  label,
  hideLabel = false,
  hint,
  error,
  size = 'md',
  options,
  placeholder,
  className,
  wrapperClassName,
  id,
  ref,
  disabled = false,
  children,
  ...rest
}: SelectProps): ReactElement {
  const generatedId = useId()
  const selectId = id ?? generatedId
  const hintId = `${selectId}-hint`
  const errorId = `${selectId}-error`
  const invalid = error !== undefined && error !== null && error !== false

  // Without an initial value, the native element would keep the first real
  // option: the placeholder would never appear. The empty value makes it
  // effective, without touching the controlled mode nor a provided defaultValue.
  const defaultValue =
    placeholder !== undefined &&
    rest.value === undefined &&
    rest.defaultValue === undefined
      ? ''
      : rest.defaultValue

  return (
    <div className={cx('o-flex o-flex-col o-gap-1', wrapperClassName)}>
      <label
        htmlFor={selectId}
        className={cx(
          'o-text-sm o-font-medium o-text-zinc-900 dark:o-text-zinc-50',
          hideLabel && 'o-sr-only',
        )}
      >
        {label}
      </label>

      <div className="o-relative">
        <select
          {...rest}
          defaultValue={defaultValue}
          id={selectId}
          ref={ref}
          disabled={disabled}
          className={cx(
            inputClasses({ size, invalid: invalid ? 'true' : 'false' }),
            'o-pr-8',
            disabled ? 'o-opacity-50 o-cursor-not-allowed' : 'o-cursor-pointer',
            className,
          )}
          aria-invalid={invalid || undefined}
          aria-describedby={
            cx(invalid && errorId, !invalid && hint !== undefined && hintId) || undefined
          }
        >
          {placeholder !== undefined ? (
            <option value="" disabled>
              {placeholder}
            </option>
          ) : null}
          {options !== undefined
            ? options.map((option) => (
                <option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </option>
              ))
            : children}
        </select>

        <span
          aria-hidden="true"
          className="o-pointer-events-none o-absolute o-inset-y-0 o-right-3 o-flex o-items-center o-text-zinc-500 dark:o-text-zinc-400"
        >
          <Chevron />
        </span>
      </div>

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
