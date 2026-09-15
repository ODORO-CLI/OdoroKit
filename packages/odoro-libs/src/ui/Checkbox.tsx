/**
 * Checkbox drawn on top of the native input.
 *
 * @module
 */

import {
  type ChangeEvent,
  type FocusEvent,
  type InputHTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'

import { cx } from '../styles/cx.js'

/** Properties of {@link Checkbox}. */
export interface CheckboxProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'className' | 'type' | 'size' | 'children'
> {
  /** Label of the box. Required: a box without a label is unusable. */
  label: ReactNode
  /** Complement displayed under the label. */
  description?: ReactNode
  /**
   * Intermediate state ("some items checked"). Purely visual and ARIA: it
   * does not change the submitted value, and a click goes back through the
   * native checked / unchecked cycle.
   *
   * @defaultValue false
   */
  indeterminate?: boolean
  /** Additional classes applied to the drawn box. */
  className?: string
  /** Additional classes applied to the container. */
  wrapperClassName?: string
  /** Ref to the native element. */
  ref?: Ref<HTMLInputElement>
}

/**
 * Checkbox.
 *
 * The native input stays in the page (hidden by `o-sr-only`): keyboard,
 * forms and screen readers go through it; the visible box is only an
 * `aria-hidden` drawing. No utility selector targets "the neighboring input
 * has the focus": the focus ring is therefore applied by the React state, fed
 * by the `onFocus` / `onBlur` of the input.
 *
 * @example
 * <Checkbox
 *   label="Remember me"
 *   description="The session stays open for 30 days."
 *   defaultChecked
 * />
 */
export function Checkbox({
  label,
  description,
  indeterminate = false,
  className,
  wrapperClassName,
  id,
  ref,
  checked,
  defaultChecked,
  onChange,
  onFocus,
  onBlur,
  disabled = false,
  ...rest
}: CheckboxProps): ReactElement {
  const generatedId = useId()
  const inputId = id ?? generatedId
  const descriptionId = `${inputId}-description`

  // The internal state follows the input in uncontrolled mode; the `checked`
  // prop wins as soon as it is provided.
  const [internal, setInternal] = useState(defaultChecked ?? false)
  const isChecked = checked ?? internal
  const [focused, setFocused] = useState(false)

  const innerRef = useRef<HTMLInputElement | null>(null)

  // `indeterminate` does not exist as an HTML attribute: only the DOM carries it.
  useEffect(() => {
    if (innerRef.current !== null) innerRef.current.indeterminate = indeterminate
  }, [indeterminate])

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      // A browser does not deliver a click to a disabled input, but a
      // programmatic click (tests, `element.click()`) goes through: the guard
      // makes the disabled state reliable in both cases.
      if (disabled) return
      if (checked === undefined) setInternal(event.target.checked)
      onChange?.(event)
    },
    [checked, disabled, onChange],
  )

  const handleFocus = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      setFocused(true)
      onFocus?.(event)
    },
    [onFocus],
  )

  const handleBlur = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      setFocused(false)
      onBlur?.(event)
    },
    [onBlur],
  )

  const filled = isChecked || indeterminate

  return (
    <div className={cx('o-flex o-flex-col o-gap-1', wrapperClassName)}>
      <label
        htmlFor={inputId}
        className={cx(
          'o-inline-flex o-items-center o-gap-2 o-select-none',
          disabled ? 'o-opacity-50 o-cursor-not-allowed' : 'o-cursor-pointer',
        )}
      >
        <input
          {...rest}
          id={inputId}
          ref={(node) => {
            innerRef.current = node
            if (typeof ref === 'function') ref(node)
            else if (ref) ref.current = node
          }}
          type="checkbox"
          className="o-sr-only"
          checked={isChecked}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={disabled}
          aria-describedby={description !== undefined ? descriptionId : undefined}
        />

        <span
          aria-hidden="true"
          className={cx(
            'o-inline-flex o-items-center o-justify-center o-shrink-0',
            'o-h-4 o-w-4 o-rounded-sm o-border-w-1 o-transition',
            filled
              ? 'o-bg-brand-600 dark:o-bg-brand-400 o-border-brand-600 dark:o-border-brand-400 o-text-white dark:o-text-zinc-950'
              : 'o-bg-white dark:o-bg-zinc-900 o-border-zinc-300 dark:o-border-zinc-700',
            focused && 'o-ring',
            className,
          )}
        >
          {indeterminate ? (
            <svg width="10" height="10" viewBox="0 0 24 24" focusable="false">
              <path
                d="M5 12h14"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </svg>
          ) : isChecked ? (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" focusable="false">
              <path
                d="M4 12l6 6L20 6"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          ) : null}
        </span>

        <span className="o-text-sm o-font-medium o-text-zinc-900 dark:o-text-zinc-50">
          {label}
        </span>
      </label>

      {description !== undefined ? (
        <p
          id={descriptionId}
          className="o-pl-6 o-text-sm o-text-zinc-500 dark:o-text-zinc-400"
        >
          {description}
        </p>
      ) : null}
    </div>
  )
}
