/**
 * Tabs with a sliding indicator.
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
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

import { usePrefersReducedMotion } from '../shared/motionPreference.js'
import { motionDuration, motionEasing } from '../motion/tokens.js'
import { cx } from '../styles/cx.js'

/** One tab. */
export interface TabItem {
  /** Unique identifier of the tab. */
  readonly id: string
  /** Displayed label. */
  readonly label: ReactNode
  /** Content of the associated panel. */
  readonly content: ReactNode
  /** Makes the tab impossible to activate. */
  readonly disabled?: boolean
}

/** Properties of {@link Tabs}. */
export interface TabsProps {
  /** Tabs, in display order. */
  items: readonly TabItem[]
  /** Active tab in controlled mode. */
  value?: string
  /** Initial active tab in uncontrolled mode. @defaultValue the first one */
  defaultValue?: string
  /** Called on a tab change. */
  onValueChange?: (id: string) => void
  /** Accessible label of the tab bar. */
  label: string
  /** Additional classes for the container. */
  className?: string
}

/** Index of the next active tab, skipping the disabled tabs. */
function nextEnabled(items: readonly TabItem[], from: number, direction: 1 | -1): number {
  const count = items.length
  for (let step = 1; step <= count; step += 1) {
    const index = (from + direction * step + count * count) % count
    if (items[index]?.disabled !== true) return index
  }
  return from
}

/**
 * Accessible tabs.
 *
 * The keyboard navigation follows the ARIA pattern: arrows to change tab,
 * Home and End to go to the ends, a single tab in the tabbing order. The
 * indicator is animated by the engine of the browser, from the measured
 * position — never by a transition on `left` and `width`, which would
 * trigger a recomposition on every frame.
 *
 * @example
 * <Tabs
 *   label="Sections of the project"
 *   items={[
 *     { id: 'overview', label: 'Overview', content: <Overview /> },
 *     { id: 'settings', label: 'Settings', content: <Settings /> },
 *   ]}
 * />
 */
export function Tabs({
  items,
  value,
  defaultValue,
  onValueChange,
  label,
  className,
}: TabsProps): ReactElement {
  const baseId = useId()
  const [internal, setInternal] = useState(() => defaultValue ?? items[0]?.id ?? '')
  const active = value ?? internal

  const listRef = useRef<HTMLDivElement | null>(null)
  const indicatorRef = useRef<HTMLSpanElement | null>(null)
  const previousRect = useRef<{ left: number; width: number } | null>(null)
  const reduced = usePrefersReducedMotion()

  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === active),
  )

  const select = useCallback(
    (id: string) => {
      if (value === undefined) setInternal(id)
      onValueChange?.(id)
    },
    [onValueChange, value],
  )

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      const moves: Readonly<Record<string, number | undefined>> = {
        ArrowRight: nextEnabled(items, activeIndex, 1),
        ArrowLeft: nextEnabled(items, activeIndex, -1),
        Home: nextEnabled(items, -1, 1),
        End: nextEnabled(items, items.length, -1),
      }

      const target = moves[event.key]
      if (target === undefined) return

      event.preventDefault()
      const item = items[target]
      if (item === undefined) return
      select(item.id)
      listRef.current
        ?.querySelectorAll<HTMLButtonElement>('[role="tab"]')
        [target]?.focus()
    },
    [activeIndex, items, select],
  )

  // The indicator is placed by transform, then animated from its previous
  // position: a single composited property, no recomposition.
  useLayoutEffect(() => {
    const list = listRef.current
    const indicator = indicatorRef.current
    if (list === null || indicator === null) return

    const tab = list.querySelectorAll<HTMLElement>('[role="tab"]')[activeIndex]
    if (tab === undefined) return

    const left = tab.offsetLeft
    const width = tab.offsetWidth
    indicator.style.width = `${width}px`
    indicator.style.transform = `translateX(${left}px)`

    const previous = previousRect.current
    previousRect.current = { left, width }

    if (previous === null || reduced || typeof indicator.animate !== 'function') return
    if (previous.left === left && previous.width === width) return

    indicator.animate(
      [
        {
          transform: `translateX(${previous.left}px)`,
          width: `${previous.width}px`,
        },
        { transform: `translateX(${left}px)`, width: `${width}px` },
      ],
      { duration: motionDuration.fast, easing: motionEasing.standard },
    )
  }, [activeIndex, reduced, items])

  // A list whose tabs change invalidates the memorized position.
  useEffect(() => {
    previousRect.current = null
  }, [items])

  return (
    <div className={cx('o-flex o-flex-col o-gap-4', className)}>
      <div
        ref={listRef}
        role="tablist"
        aria-label={label}
        onKeyDown={handleKeyDown}
        className="o-relative o-flex o-gap-1 o-border-b o-border-zinc-200 dark:o-border-zinc-800"
      >
        {items.map((item, index) => {
          const selected = index === activeIndex
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`${baseId}-tab-${item.id}`}
              aria-controls={`${baseId}-panel-${item.id}`}
              aria-selected={selected}
              aria-disabled={item.disabled || undefined}
              tabIndex={selected ? 0 : -1}
              onClick={() => {
                if (item.disabled !== true) select(item.id)
              }}
              className={cx(
                'o-px-3 o-py-2 o-text-sm o-font-medium o-transition o-rounded-t-sm',
                selected
                  ? 'o-text-brand-600 dark:o-text-brand-400'
                  : 'o-text-zinc-500 dark:o-text-zinc-400 hover:o-text-zinc-900 dark:hover:o-text-zinc-50',
                item.disabled === true
                  ? 'o-opacity-50 o-cursor-not-allowed'
                  : 'o-cursor-pointer',
              )}
            >
              {item.label}
            </button>
          )
        })}
        <span
          ref={indicatorRef}
          aria-hidden="true"
          className="o-absolute o-bottom-0 o-left-0 o-h-0.5 o-bg-brand-600 dark:o-bg-brand-400"
        />
      </div>

      {items.map((item, index) => (
        <div
          key={item.id}
          role="tabpanel"
          id={`${baseId}-panel-${item.id}`}
          aria-labelledby={`${baseId}-tab-${item.id}`}
          hidden={index !== activeIndex}
          tabIndex={0}
        >
          {index === activeIndex ? item.content : null}
        </div>
      ))}
    </div>
  )
}
