/**
 * Dropdown action menu.
 *
 * Follows the APG "menu button" pattern: the trigger carries
 * `aria-haspopup="menu"` and `aria-expanded`, the panel is a `role="menu"`
 * navigable with the arrows with a roving tabIndex — a single item in the
 * tabbing order, the real focus follows the keyboard selection.
 *
 * @module
 */

import {
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'

import { usePresence } from '../motion/usePresence.js'
import { cx } from '../styles/cx.js'
import { buttonClasses } from './Button.jsx'

/** One action of the menu. */
export interface DropdownMenuAction {
  /** Unique identifier of the action. */
  readonly id: string
  /** Displayed label. */
  readonly label: ReactNode
  /** Decorative icon placed before the label. */
  readonly icon?: ReactNode
  /** Keyboard shortcut displayed on the right. Purely indicative. */
  readonly shortcut?: string
  /** Makes the action impossible to activate. */
  readonly disabled?: boolean
  /** Flags a destructive action. */
  readonly danger?: boolean
  /** Called on selection. */
  readonly onSelect?: () => void
}

/** A visual separator between groups of actions. */
export interface DropdownMenuSeparator {
  readonly type: 'separator'
}

/** One entry of the menu: action or separator. */
export type DropdownMenuItem = DropdownMenuAction | DropdownMenuSeparator

/** Properties of {@link DropdownMenu}. */
export interface DropdownMenuProps {
  /** Content of the trigger button. */
  label: ReactNode
  /** Entries of the menu, in display order. */
  items: readonly DropdownMenuItem[]
  /** Visual register of the trigger. @defaultValue 'secondary' */
  tone?: 'primary' | 'secondary' | 'ghost' | 'danger'
  /** Additional classes for the container. */
  className?: string
}

/** Tells a separator apart from an action. */
function isSeparator(item: DropdownMenuItem): item is DropdownMenuSeparator {
  return 'type' in item && item.type === 'separator'
}

/**
 * Index of the next activatable action, looping around and skipping the
 * separators and the disabled actions.
 */
function nextEnabled(
  items: readonly DropdownMenuItem[],
  from: number,
  direction: 1 | -1,
): number {
  const count = items.length
  for (let step = 1; step <= count; step += 1) {
    const index = (from + direction * step + count * count) % count
    const item = items[index]
    if (item !== undefined && !isSeparator(item) && item.disabled !== true) return index
  }
  return from
}

/**
 * Accessible action menu.
 *
 * @example
 * <DropdownMenu
 *   label="Actions"
 *   items={[
 *     { id: 'rename', label: 'Rename', onSelect: rename },
 *     { type: 'separator' },
 *     { id: 'delete', label: 'Delete', danger: true, onSelect: remove },
 *   ]}
 * />
 */
export function DropdownMenu({
  label,
  items,
  tone = 'secondary',
  className,
}: DropdownMenuProps): ReactElement {
  const menuId = useId()
  const [isOpen, setIsOpen] = useState(false)
  const [activeIndex, setActiveIndex] = useState(0)

  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([])

  const { ref, isMounted } = usePresence<HTMLDivElement>(isOpen, {
    enter: { opacity: 0, transform: 'translateY(0.25rem) scale(0.98)' },
    duration: 'fast',
    initial: true,
  })

  const openAt = useCallback(
    (index: number) => {
      setActiveIndex(nextEnabled(items, index, 1))
      setIsOpen(true)
    },
    [items],
  )

  const close = useCallback((restoreFocus: boolean) => {
    if (restoreFocus) triggerRef.current?.focus()
    setIsOpen(false)
  }, [])

  const select = useCallback(
    (item: DropdownMenuAction) => {
      if (item.disabled === true) return
      item.onSelect?.()
      close(true)
    },
    [close],
  )

  // The real focus follows the active item: it is the one screen readers
  // announce, the roving tabIndex is not enough.
  useEffect(() => {
    if (isOpen && isMounted) itemRefs.current[activeIndex]?.focus()
  }, [activeIndex, isMounted, isOpen])

  useEffect(() => {
    if (!isOpen) return
    const handlePointerDown = (event: PointerEvent) => {
      if (wrapperRef.current?.contains(event.target as Node) === true) return
      close(false)
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [close, isOpen])

  const handleTriggerKeyDown = useCallback(
    (event: KeyboardEvent<HTMLButtonElement>) => {
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        openAt(-1)
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        setActiveIndex(nextEnabled(items, items.length, -1))
        setIsOpen(true)
      }
    },
    [items, openAt],
  )

  const handleMenuKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        close(true)
        return
      }
      // Tab leaves the menu: we close it without keeping the focus.
      if (event.key === 'Tab') {
        close(false)
        return
      }

      const moves: Readonly<Record<string, number | undefined>> = {
        ArrowDown: nextEnabled(items, activeIndex, 1),
        ArrowUp: nextEnabled(items, activeIndex, -1),
        Home: nextEnabled(items, -1, 1),
        End: nextEnabled(items, items.length, -1),
      }
      const target = moves[event.key]
      if (target === undefined) return
      event.preventDefault()
      setActiveIndex(target)
    },
    [activeIndex, close, items],
  )

  return (
    <div ref={wrapperRef} className={cx('o-relative o-inline-block', className)}>
      <button
        ref={triggerRef}
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-controls={isMounted ? menuId : undefined}
        onClick={() => {
          if (isOpen) close(false)
          else openAt(-1)
        }}
        onKeyDown={handleTriggerKeyDown}
        className={cx(buttonClasses({ tone }), 'o-cursor-pointer')}
      >
        {label}
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          aria-hidden="true"
          focusable="false"
          className={cx('o-shrink-0 o-transition-transform', isOpen && 'o-rotate-180')}
        >
          <path
            d="M6 9l6 6 6-6"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>
      {isMounted ? (
        <div
          ref={ref}
          role="menu"
          id={menuId}
          aria-label={typeof label === 'string' ? label : undefined}
          onKeyDown={handleMenuKeyDown}
          className={cx(
            'o-absolute o-top-full o-mt-2 o-left-0 o-z-overlay o-w-56',
            'o-bg-white dark:o-bg-zinc-800 o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800',
            'o-rounded-md o-shadow-lg o-p-1',
          )}
        >
          {items.map((item, index) =>
            isSeparator(item) ? (
              <div
                // A separator has no identifier: its position is enough.
                key={`separator-${index}`}
                role="separator"
                className="o-my-1 o-h-px o-bg-zinc-200 dark:o-bg-zinc-800"
              />
            ) : (
              <button
                key={item.id}
                ref={(node) => {
                  itemRefs.current[index] = node
                }}
                type="button"
                role="menuitem"
                aria-disabled={item.disabled || undefined}
                tabIndex={index === activeIndex ? 0 : -1}
                onClick={() => select(item)}
                className={cx(
                  'o-flex o-w-full o-items-center o-gap-2 o-rounded-sm',
                  'o-px-2 o-py-1.5 o-text-sm o-text-left o-transition',
                  item.danger === true
                    ? 'o-text-red-600 dark:o-text-red-400'
                    : 'o-text-zinc-900 dark:o-text-zinc-50',
                  item.disabled === true
                    ? 'o-opacity-50 o-cursor-not-allowed'
                    : 'o-cursor-pointer hover:o-bg-zinc-50 dark:hover:o-bg-zinc-800 focus:o-bg-zinc-50 dark:focus:o-bg-zinc-800',
                )}
              >
                {item.icon === undefined ? null : (
                  <span aria-hidden="true" className="o-shrink-0">
                    {item.icon}
                  </span>
                )}
                <span className="o-flex-1">{item.label}</span>
                {item.shortcut === undefined ? null : (
                  <span className="o-ml-auto o-text-zinc-400 dark:o-text-zinc-500 o-text-xs">
                    {item.shortcut}
                  </span>
                )}
              </button>
            ),
          )}
        </div>
      ) : null}
    </div>
  )
}
