/**
 * Rich dropdown list, with search.
 *
 * ## Why it does not replace `Select`
 *
 * `Select` styles a native `<select>`. It therefore inherits for free the
 * menu of the system, the keyboard typing, the behavior on mobile, and it
 * cannot desynchronize from a form. It is the right default choice, and it
 * will stay so.
 *
 * This component exists for what the native one does not allow: rich
 * options — an icon, a description, a status — and a search when the list
 * goes beyond a dozen entries. The price is that everything has to be
 * rebuilt, and that is precisely what most implementations half forget.
 *
 * ## What is rebuilt
 *
 * The `combobox` pattern of ARIA, entirely. The field carries the role and
 * the open state; the list carries its own; the active option is designated
 * by `aria-activedescendant` rather than by the focus, because the focus has
 * to stay in the field so that the typing keeps reaching it.
 *
 * The arrows move the active option, `Enter` chooses it, `Escape` closes,
 * `Home` and `End` jump to the ends. The list scrolls to keep the active
 * option visible — without which the keyboard would move a selection that
 * cannot be seen.
 *
 * ## What is left to the native element
 *
 * The value is carried by an `<input type="hidden">`. An ordinary form
 * therefore submits it without knowing that the field is not a `<select>`.
 *
 * @module
 */

import {
  useEffect,
  useId,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'

import { cx } from '../styles/cx.js'

/** One option of the list. */
export interface SelectMenuOption {
  /** Submitted value. */
  readonly value: string
  /** Label displayed and searched. */
  readonly label: string
  /** Complement displayed under the label. */
  readonly description?: string
  /** Decorative element displayed on the left. */
  readonly icon?: ReactNode
  /** Option present but not selectable. */
  readonly disabled?: boolean
}

/** Properties of {@link SelectMenu}. */
export interface SelectMenuProps {
  /** Offered options. */
  options: readonly SelectMenuOption[]
  /** Chosen value. */
  value?: string | null
  /** Called when the value changes. */
  onValueChange?: (value: string) => void
  /** Name of the field, for the form submission. */
  name?: string
  /** Label of the field. */
  label?: ReactNode
  /** Text displayed when nothing is chosen. @defaultValue 'Choose…' */
  placeholder?: string
  /** Displays a search field. @defaultValue false */
  searchable?: boolean
  /** Text displayed when the search returns nothing. @defaultValue 'No result' */
  emptyLabel?: string
  /** Disables the field. */
  disabled?: boolean
  /** Error message. Its presence marks the field as invalid. */
  error?: string
  /** Additional classes. */
  className?: string
}

/**
 * Rich dropdown list.
 *
 * @example
 * <SelectMenu
 *   label="Environment"
 *   searchable
 *   options={[
 *     { value: 'prod', label: 'Production', description: 'Real traffic' },
 *     { value: 'staging', label: 'Staging' },
 *   ]}
 *   value={env}
 *   onValueChange={setEnv}
 * />
 */
export function SelectMenu({
  options,
  value = null,
  onValueChange,
  name,
  label,
  placeholder = 'Choose…',
  searchable = false,
  emptyLabel = 'No result',
  disabled = false,
  error,
  className,
}: SelectMenuProps): ReactElement {
  const id = useId()
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [active, setActive] = useState(0)

  const root = useRef<HTMLDivElement | null>(null)
  const list = useRef<HTMLUListElement | null>(null)
  const field = useRef<HTMLButtonElement | null>(null)
  const search = useRef<HTMLInputElement | null>(null)

  const shown = options.filter((option) =>
    searchable && query !== ''
      ? option.label.toLowerCase().includes(query.toLowerCase())
      : true,
  )
  const chosen = options.find((option) => option.value === value)

  // Closing on an outside click. `pointerdown` rather than `click`: closing on
  // the release would leave the menu open for the whole duration of a drag
  // started elsewhere.
  useEffect(() => {
    if (!open) return

    const onDown = (event: PointerEvent): void => {
      if (!root.current?.contains(event.target as Node)) setOpen(false)
    }
    document.addEventListener('pointerdown', onDown)
    return () => document.removeEventListener('pointerdown', onDown)
  }, [open])

  // The search field takes the focus on opening; otherwise it stays on the
  // trigger, where the arrows keep arriving.
  useEffect(() => {
    if (open && searchable) search.current?.focus()
    if (!open) setQuery('')
  }, [open, searchable])

  // The active option has to stay visible: the keyboard would otherwise move
  // a selection out of the field of view.
  useEffect(() => {
    if (!open) return
    const element = list.current?.querySelector(`[data-index="${String(active)}"]`)
    element?.scrollIntoView({ block: 'nearest' })
  }, [open, active])

  /** Keeps an option, closes, and gives the focus back to the trigger. */
  const choose = (option: SelectMenuOption): void => {
    if (option.disabled === true) return
    onValueChange?.(option.value)
    setOpen(false)
    field.current?.focus()
  }

  /** Moves the active option, skipping the disabled options. */
  const move = (direction: 1 | -1): void => {
    if (shown.length === 0) return
    let next = active

    for (let step = 0; step < shown.length; step += 1) {
      next = (next + direction + shown.length) % shown.length
      if (shown[next]?.disabled !== true) break
    }
    setActive(next)
  }

  const onKeyDown = (event: React.KeyboardEvent): void => {
    if (
      !open &&
      (event.key === 'ArrowDown' || event.key === 'Enter' || event.key === ' ')
    ) {
      event.preventDefault()
      setOpen(true)
      setActive(
        Math.max(
          0,
          shown.findIndex((option) => option.value === value),
        ),
      )
      return
    }
    if (!open) return

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        move(1)
        break
      case 'ArrowUp':
        event.preventDefault()
        move(-1)
        break
      case 'Home':
        event.preventDefault()
        setActive(0)
        break
      case 'End':
        event.preventDefault()
        setActive(shown.length - 1)
        break
      case 'Enter': {
        event.preventDefault()
        const option = shown[active]
        if (option !== undefined) choose(option)
        break
      }
      case 'Escape':
        event.preventDefault()
        setOpen(false)
        field.current?.focus()
        break
      case 'Tab':
        setOpen(false)
        break
      default:
        break
    }
  }

  const invalid = error !== undefined && error !== ''

  return (
    <div ref={root} className={cx('o-flex o-flex-col o-gap-1.5', className)}>
      {label === undefined ? null : (
        <label
          htmlFor={`${id}-field`}
          className="o-text-sm o-font-medium o-text-zinc-900 dark:o-text-zinc-50"
        >
          {label}
        </label>
      )}

      {name === undefined ? null : (
        <input type="hidden" name={name} value={value ?? ''} />
      )}

      <button
        ref={field}
        id={`${id}-field`}
        type="button"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-haspopup="listbox"
        aria-activedescendant={
          open && shown[active] !== undefined
            ? `${id}-option-${String(active)}`
            : undefined
        }
        aria-invalid={invalid || undefined}
        aria-describedby={invalid ? `${id}-error` : undefined}
        disabled={disabled}
        onClick={() => setOpen(!open)}
        onKeyDown={onKeyDown}
        className={cx(
          'o-flex o-h-10 o-w-full o-items-center o-justify-between o-gap-2 o-rounded-md o-border-w-1 o-px-3 o-text-left o-text-base o-transition-colors',
          'o-bg-white dark:o-bg-zinc-950 o-text-zinc-900 dark:o-text-zinc-50',
          'focus:o-ring disabled:o-opacity-50 disabled:o-cursor-default',
          invalid
            ? 'o-border-red-500 dark:o-border-red-400'
            : 'o-border-zinc-200 dark:o-border-zinc-800 hover:o-border-zinc-300 dark:hover:o-border-zinc-700',
        )}
      >
        <span className="o-flex o-min-w-0 o-items-center o-gap-2">
          {chosen?.icon}
          <span
            className={cx(
              'o-truncate',
              chosen === undefined && 'o-text-zinc-400 dark:o-text-zinc-500',
            )}
          >
            {chosen?.label ?? placeholder}
          </span>
        </span>
        <span aria-hidden className="o-text-zinc-400 dark:o-text-zinc-500">
          ▾
        </span>
      </button>

      {open ? (
        <div className="o-relative">
          <div className="o-absolute o-z-dropdown o-mt-1 o-w-full o-rounded-md o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-900 o-shadow-lg">
            {searchable ? (
              <div className="o-border-b o-border-zinc-100 dark:o-border-zinc-800 o-p-2">
                <input
                  ref={search}
                  type="text"
                  value={query}
                  placeholder="Search…"
                  aria-label="Search the list"
                  onChange={(event) => {
                    setQuery(event.target.value)
                    setActive(0)
                  }}
                  onKeyDown={onKeyDown}
                  className="o-h-8 o-w-full o-rounded-sm o-bg-transparent o-px-2 o-text-sm o-text-zinc-900 dark:o-text-zinc-50 focus:o-ring"
                />
              </div>
            ) : null}

            <ul
              ref={list}
              id={`${id}-list`}
              role="listbox"
              aria-label={typeof label === 'string' ? label : 'Options'}
              className="o-max-h-64 o-overflow-y-auto o-scrollbar dark:o-scrollbar-dark o-p-1"
            >
              {shown.length === 0 ? (
                <li className="o-px-3 o-py-2 o-text-sm o-text-zinc-400 dark:o-text-zinc-500">
                  {emptyLabel}
                </li>
              ) : (
                shown.map((option, index) => (
                  <li
                    key={option.value}
                    id={`${id}-option-${String(index)}`}
                    data-index={index}
                    role="option"
                    aria-selected={option.value === value}
                    aria-disabled={option.disabled === true || undefined}
                    onPointerEnter={() => setActive(index)}
                    onClick={() => choose(option)}
                    className={cx(
                      'o-flex o-cursor-pointer o-items-start o-gap-2 o-rounded-sm o-px-3 o-py-2 o-text-sm',
                      option.disabled === true && 'o-opacity-40 o-cursor-default',
                      index === active &&
                        option.disabled !== true &&
                        'o-bg-zinc-100 dark:o-bg-zinc-800',
                    )}
                  >
                    {option.icon === undefined ? null : (
                      <span className="o-mt-0.5 o-shrink-0">{option.icon}</span>
                    )}
                    <span className="o-flex o-min-w-0 o-flex-col">
                      <span className="o-text-zinc-900 dark:o-text-zinc-50">
                        {option.label}
                      </span>
                      {option.description === undefined ? null : (
                        <span className="o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
                          {option.description}
                        </span>
                      )}
                    </span>
                    {option.value === value ? (
                      <span
                        aria-hidden
                        className="o-ml-auto o-text-brand-600 dark:o-text-brand-400"
                      >
                        ✓
                      </span>
                    ) : null}
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      ) : null}

      {invalid ? (
        <p id={`${id}-error`} className="o-text-sm o-text-red-600 dark:o-text-red-400">
          {error}
        </p>
      ) : null}
    </div>
  )
}
