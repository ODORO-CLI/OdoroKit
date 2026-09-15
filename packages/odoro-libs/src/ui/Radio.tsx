/**
 * Group of radio buttons drawn on top of the native inputs.
 *
 * @module
 */

import { type ReactElement, type ReactNode, useCallback, useId, useState } from 'react'

import { cx } from '../styles/cx.js'

/** One choice of {@link RadioGroup}. */
export interface RadioItem {
  /** Submitted value. */
  readonly value: string
  /** Displayed label. */
  readonly label: ReactNode
  /** Complement displayed under the label. */
  readonly description?: ReactNode
  /** Makes the choice unselectable. */
  readonly disabled?: boolean
}

/** Properties of {@link RadioGroup}. */
export interface RadioGroupProps {
  /** Label of the group, rendered as a `<legend>`. Required. */
  label: ReactNode
  /** Choices, in display order. */
  items: readonly RadioItem[]
  /** Selected value in controlled mode. */
  value?: string
  /** Initial value in uncontrolled mode. */
  defaultValue?: string
  /** Called with the new value on every selection. */
  onValueChange?: (value: string) => void
  /** Stacking direction of the choices. @defaultValue 'vertical' */
  orientation?: 'vertical' | 'horizontal'
  /** Additional classes applied to the `<fieldset>`. */
  className?: string
}

/**
 * Group of radio buttons.
 *
 * The `<fieldset>` and its `<legend>` give the group name to screen readers;
 * the native inputs (hidden by `o-sr-only`) carry the keyboard navigation of
 * the group (arrows, a single tab stop). The shared `name` is generated: two
 * groups on the same page never steal each other's selection.
 * As for the checkbox, the focus ring of the dot is applied by the React
 * state, for want of a utility selector targeting the neighboring input.
 *
 * @example
 * <RadioGroup
 *   label="Visibility"
 *   defaultValue="private"
 *   items={[
 *     { value: 'private', label: 'Private', description: 'Only you can access it.' },
 *     { value: 'public', label: 'Public' },
 *   ]}
 * />
 */
export function RadioGroup({
  label,
  items,
  value,
  defaultValue,
  onValueChange,
  orientation = 'vertical',
  className,
}: RadioGroupProps): ReactElement {
  const name = useId()
  const [internal, setInternal] = useState<string | undefined>(defaultValue)
  const selected = value ?? internal
  const [focusedValue, setFocusedValue] = useState<string | null>(null)

  const select = useCallback(
    (next: string, itemDisabled: boolean) => {
      // A browser does not deliver a click to a disabled input, but a
      // programmatic click (tests, `element.click()`) goes through: the guard
      // makes the disabled state reliable in both cases.
      if (itemDisabled) return
      if (value === undefined) setInternal(next)
      onValueChange?.(next)
    },
    [onValueChange, value],
  )

  return (
    // The browser gives the fieldset a border and margins: reset to zero so
    // that it stays invisible in the layout.
    <fieldset className={cx('o-m-0 o-border-w-0 o-p-0', className)}>
      <legend className="o-p-0 o-text-sm o-font-medium o-text-zinc-900 dark:o-text-zinc-50">
        {label}
      </legend>

      <div
        className={cx(
          'o-mt-0.5 o-flex',
          orientation === 'horizontal'
            ? 'o-flex-row o-flex-wrap o-gap-4'
            : 'o-flex-col o-gap-2',
        )}
      >
        {items.map((item) => {
          const itemId = `${name}-${item.value}`
          const descriptionId = `${itemId}-description`
          const isSelected = selected === item.value
          const itemDisabled = item.disabled === true

          return (
            <div key={item.value} className="o-flex o-flex-col o-gap-1">
              <label
                htmlFor={itemId}
                className={cx(
                  'o-inline-flex o-items-center o-gap-2 o-select-none',
                  itemDisabled ? 'o-opacity-50 o-cursor-not-allowed' : 'o-cursor-pointer',
                )}
              >
                <input
                  id={itemId}
                  type="radio"
                  name={name}
                  value={item.value}
                  className="o-sr-only"
                  checked={isSelected}
                  onChange={() => select(item.value, itemDisabled)}
                  onFocus={() => setFocusedValue(item.value)}
                  onBlur={() => setFocusedValue(null)}
                  disabled={itemDisabled}
                  aria-describedby={
                    item.description !== undefined ? descriptionId : undefined
                  }
                />

                <span
                  aria-hidden="true"
                  className={cx(
                    'o-inline-flex o-items-center o-justify-center o-shrink-0',
                    'o-h-4 o-w-4 o-rounded-full o-border-w-1 o-transition',
                    isSelected
                      ? 'o-bg-brand-600 dark:o-bg-brand-400 o-border-brand-600 dark:o-border-brand-400'
                      : 'o-bg-white dark:o-bg-zinc-900 o-border-zinc-300 dark:o-border-zinc-700',
                    focusedValue === item.value && 'o-ring',
                  )}
                >
                  {isSelected ? (
                    <span className="o-h-1.5 o-w-1.5 o-rounded-full o-bg-white dark:o-bg-zinc-950" />
                  ) : null}
                </span>

                <span className="o-text-sm o-font-medium o-text-zinc-900 dark:o-text-zinc-50">
                  {item.label}
                </span>
              </label>

              {item.description !== undefined ? (
                <p
                  id={descriptionId}
                  className="o-pl-6 o-text-sm o-text-zinc-500 dark:o-text-zinc-400"
                >
                  {item.description}
                </p>
              ) : null}
            </div>
          )
        })}
      </div>
    </fieldset>
  )
}
