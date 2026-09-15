/**
 * Text field with label, hint and error message.
 *
 * @module
 */

import {
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
  useId,
} from 'react'

import { cx, variants } from '../styles/cx.js'

/** Field classes, exposed to style a `<textarea>` or a `<select>`. */
export const inputClasses = variants({
  base: cx(
    'o-w-full o-rounded-md o-border-w-1 o-bg-white dark:o-bg-zinc-900 o-text-zinc-900 dark:o-text-zinc-50 o-transition',
    'o-appearance-none',
  ),
  variants: {
    size: {
      sm: 'o-h-8 o-px-2 o-text-sm',
      md: 'o-h-10 o-px-3 o-text-base',
      lg: 'o-h-12 o-px-4 o-text-lg',
    },
    invalid: {
      true: 'o-border-red-200 dark:o-border-red-800',
      false:
        'o-border-zinc-200 dark:o-border-zinc-800 hover:o-border-zinc-300 dark:hover:o-border-zinc-700',
    },
  },
  defaults: { size: 'md', invalid: 'false' },
})

/** Properties of {@link Input}. */
export interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
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
  /** Additional classes applied to the `<input>` element. */
  className?: string
  /** Additional classes applied to the container. */
  wrapperClassName?: string
  /** Ref to the native element. */
  ref?: Ref<HTMLInputElement>
}

/**
 * Text field.
 *
 * The label, the hint and the error are wired to the field through `id` /
 * `aria-describedby`: nothing to wire on the caller side. The error message is
 * announced as soon as it appears thanks to `role="alert"`.
 *
 * @example
 * <Input
 *   label="Email address"
 *   type="email"
 *   hint="We will never share it."
 *   error={errors.email}
 * />
 */
export function Input({
  label,
  hideLabel = false,
  hint,
  error,
  size = 'md',
  className,
  wrapperClassName,
  id,
  ref,
  ...rest
}: InputProps): ReactElement {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const hintId = `${inputId}-hint`
  const errorId = `${inputId}-error`
  const invalid = error !== undefined && error !== null && error !== false

  return (
    <div className={cx('o-flex o-flex-col o-gap-1', wrapperClassName)}>
      <label
        htmlFor={inputId}
        className={cx(
          'o-text-sm o-font-medium o-text-zinc-900 dark:o-text-zinc-50',
          hideLabel && 'o-sr-only',
        )}
      >
        {label}
      </label>

      <input
        {...rest}
        id={inputId}
        ref={ref}
        className={cx(
          inputClasses({ size, invalid: invalid ? 'true' : 'false' }),
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
