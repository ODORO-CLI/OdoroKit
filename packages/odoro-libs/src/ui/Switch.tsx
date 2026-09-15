/**
 * Two-state toggle.
 *
 * @module
 */

import {
  type ButtonHTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type Ref,
  useCallback,
  useId,
  useState,
} from 'react'

import { cx, variants } from '../styles/cx.js'

/**
 * Track classes, exposed to compose a bespoke toggle without duplicating the
 * variant table.
 */
export const switchClasses = variants({
  base: cx(
    'o-inline-flex o-items-center o-shrink-0',
    'o-rounded-full o-p-0.5 o-transition',
  ),
  variants: {
    size: {
      sm: 'o-h-4 o-w-7',
      md: 'o-h-5 o-w-9',
      lg: 'o-h-6 o-w-12',
    },
    checked: {
      true: 'o-bg-brand-600 dark:o-bg-brand-400',
      false: 'o-bg-zinc-100 dark:o-bg-zinc-950',
    },
  },
  defaults: { size: 'md', checked: 'false' },
})

/** Thumb size per track size. */
const THUMB_SIZE: Readonly<Record<'sm' | 'md' | 'lg', string>> = {
  sm: 'o-h-3 o-w-3',
  md: 'o-h-4 o-w-4',
  lg: 'o-h-5 o-w-5',
}

/**
 * Thumb travel per size: track width minus thumb and padding, so that it
 * stops flush with the opposite edge.
 */
const THUMB_TRAVEL: Readonly<Record<'sm' | 'md' | 'lg', string>> = {
  sm: 'o-translate-x-3',
  md: 'o-translate-x-4',
  lg: 'o-translate-x-6',
}

/** Properties of {@link Switch}. */
export interface SwitchProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'className' | 'defaultChecked' | 'role' | 'aria-checked'
> {
  /** Label of the toggle, rendered next to it and clickable. Required. */
  label: ReactNode
  /** Complement displayed under the label. */
  description?: ReactNode
  /** State in controlled mode. */
  checked?: boolean
  /** Initial state in uncontrolled mode. @defaultValue false */
  defaultChecked?: boolean
  /** Called with the new state on every toggle. */
  onCheckedChange?: (checked: boolean) => void
  /** Size. @defaultValue 'md' */
  size?: 'sm' | 'md' | 'lg'
  /** Additional classes applied to the track. */
  className?: string
  /** Additional classes applied to the container. */
  wrapperClassName?: string
  /** Ref to the native element. */
  ref?: Ref<HTMLButtonElement>
}

/**
 * Toggle.
 *
 * A `<button role="switch">` rather than a checkbox: the effect is immediate,
 * with no notion of a form to submit. The state is carried by `aria-checked`,
 * the toggle answers to a click as well as to Space or Enter (native to the
 * button). The thumb slides by transform: a composited property, no
 * recomposition.
 *
 * @example
 * <Switch
 *   label="Notifications"
 *   description="Receive an email on every comment."
 *   defaultChecked
 *   onCheckedChange={setEnabled}
 * />
 */
export function Switch({
  label,
  description,
  checked,
  defaultChecked = false,
  onCheckedChange,
  size = 'md',
  className,
  wrapperClassName,
  id,
  ref,
  disabled = false,
  onClick,
  ...rest
}: SwitchProps): ReactElement {
  const generatedId = useId()
  const switchId = id ?? generatedId
  const descriptionId = `${switchId}-description`

  const [internal, setInternal] = useState(defaultChecked)
  const isChecked = checked ?? internal

  const handleClick = useCallback(
    (event: MouseEvent<HTMLButtonElement>) => {
      const next = !isChecked
      if (checked === undefined) setInternal(next)
      onCheckedChange?.(next)
      onClick?.(event)
    },
    [checked, isChecked, onCheckedChange, onClick],
  )

  return (
    <div className={cx('o-flex o-items-start o-gap-2', wrapperClassName)}>
      <button
        {...rest}
        id={switchId}
        ref={ref}
        type="button"
        role="switch"
        aria-checked={isChecked}
        aria-describedby={description !== undefined ? descriptionId : undefined}
        disabled={disabled}
        onClick={handleClick}
        className={cx(
          switchClasses({ size, checked: isChecked ? 'true' : 'false' }),
          disabled ? 'o-opacity-50 o-cursor-not-allowed' : 'o-cursor-pointer',
          className,
        )}
      >
        <span
          aria-hidden="true"
          className={cx(
            'o-block o-rounded-full o-bg-white dark:o-bg-zinc-900 o-shadow-sm o-transition-transform',
            THUMB_SIZE[size],
            isChecked ? THUMB_TRAVEL[size] : 'o-translate-x-0',
          )}
        />
      </button>

      <div className="o-flex o-flex-col o-gap-0.5">
        <label
          htmlFor={switchId}
          className={cx(
            'o-text-sm o-font-medium o-text-zinc-900 dark:o-text-zinc-50 o-select-none',
            disabled ? 'o-cursor-not-allowed' : 'o-cursor-pointer',
          )}
        >
          {label}
        </label>
        {description !== undefined ? (
          <p
            id={descriptionId}
            className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400"
          >
            {description}
          </p>
        ) : null}
      </div>
    </div>
  )
}
