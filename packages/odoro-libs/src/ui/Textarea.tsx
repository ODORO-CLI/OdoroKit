/**
 * Multiline text area with label, hint and error message.
 *
 * @module
 */

import {
  type CSSProperties,
  type InputEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  type TextareaHTMLAttributes,
  useCallback,
  useId,
} from 'react'

import { cx } from '../styles/cx.js'
import { inputClasses } from './Input.jsx'

/**
 * Vertical padding per size. The text area does not inherit the centering of
 * an `<input>` with a fixed height: the vertical breathing comes from padding.
 */
const SIZE_PADDING: Readonly<Record<'sm' | 'md' | 'lg', string>> = {
  sm: 'o-py-1',
  md: 'o-py-2',
  lg: 'o-py-3',
}

/**
 * Minimum height per size. The base stylesheet does not expose `o-min-h-*`
 * utilities with a fixed value: the constraint goes through the inline style.
 */
const SIZE_MIN_HEIGHT: Readonly<Record<'sm' | 'md' | 'lg', string>> = {
  sm: '4rem',
  md: '5.5rem',
  lg: '7rem',
}

/** Properties of {@link Textarea}. */
export interface TextareaProps extends Omit<
  TextareaHTMLAttributes<HTMLTextAreaElement>,
  'className'
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
   * Fits the height to the content on every keystroke. The minimum height of
   * the chosen size stays the floor.
   *
   * @defaultValue false
   */
  autoResize?: boolean
  /** Additional classes applied to the `<textarea>` element. */
  className?: string
  /** Additional classes applied to the container. */
  wrapperClassName?: string
  /** Ref to the native element. */
  ref?: Ref<HTMLTextAreaElement>
}

/**
 * Multiline text area.
 *
 * Reuses the styling of {@link Input} (through `inputClasses`), but replaces
 * the fixed height of the sizes by a minimum height: a long text must be able
 * to grow, through the resize handle or through `autoResize`.
 *
 * @example
 * <Textarea
 *   label="Message"
 *   hint="Markdown accepted."
 *   autoResize
 * />
 */
export function Textarea({
  label,
  hideLabel = false,
  hint,
  error,
  size = 'md',
  autoResize = false,
  className,
  wrapperClassName,
  id,
  ref,
  style,
  onInput,
  ...rest
}: TextareaProps): ReactElement {
  const generatedId = useId()
  const textareaId = id ?? generatedId
  const hintId = `${textareaId}-hint`
  const errorId = `${textareaId}-error`
  const invalid = error !== undefined && error !== null && error !== false

  const handleInput = useCallback(
    (event: InputEvent<HTMLTextAreaElement>) => {
      if (autoResize) {
        const node = event.currentTarget
        // Go back to 'auto' before measuring: without this, scrollHeight never
        // comes back down when text is deleted.
        node.style.height = 'auto'
        node.style.height = `${node.scrollHeight}px`
      }
      onInput?.(event)
    },
    [autoResize, onInput],
  )

  // `inputClasses` applies a fixed height (o-h-*) that the order of the classes
  // in the attribute cannot reliably override: the inline style settles the
  // cascade in a deterministic way.
  const sizeStyle: CSSProperties = {
    height: 'auto',
    minHeight: SIZE_MIN_HEIGHT[size],
  }

  return (
    <div className={cx('o-flex o-flex-col o-gap-1', wrapperClassName)}>
      <label
        htmlFor={textareaId}
        className={cx(
          'o-text-sm o-font-medium o-text-zinc-900 dark:o-text-zinc-50',
          hideLabel && 'o-sr-only',
        )}
      >
        {label}
      </label>

      <textarea
        {...rest}
        id={textareaId}
        ref={ref}
        style={{ ...sizeStyle, ...style }}
        onInput={handleInput}
        className={cx(
          inputClasses({ size, invalid: invalid ? 'true' : 'false' }),
          SIZE_PADDING[size],
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
