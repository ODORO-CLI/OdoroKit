/**
 * Pill tabs: a background slides under the active tab.
 *
 * ## The pill is measured, never guessed
 *
 * Position and width come from `offsetLeft` and `offsetWidth` on the real
 * button, after render: the pill hugs the actual text, whatever the font, the
 * language or the size. A width computed in fractions — one fifth for five
 * tabs — would lie from the first long label onwards.
 *
 * The placement is written first, the animation then starts from the stored
 * previous position: if the user clicks during the trip, the departure is
 * where the pill logically is, with no teleporting.
 *
 * ## A single tab in the tab order
 *
 * This is the roving tabindex pattern: Tab enters the group, the arrows move
 * around inside it. Putting every tab in the tab order would force the user to
 * cross the whole bar to leave it.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
} from 'react'

/** A tab. */
export interface PillTabItem {
  /** Id, unique within the bar. */
  readonly id: string
  /** Displayed label. */
  readonly label: string
}

/** Props specific to the component. */
export interface PillTabsOwnProps {
  /** The tabs, in display order. */
  items: readonly PillTabItem[]
  /** Id of the active tab, in controlled mode. */
  value?: string
  /** Active tab on mount, in uncontrolled mode. */
  defaultValue?: string
  /** Called when the user changes tab. */
  onValueChange?: (id: string) => void
  /** Size of the tabs. @defaultValue 'md' */
  size?: 'sm' | 'md'
  /** Name of the group for screen readers. @defaultValue 'Tabs' */
  label?: string
}

/** All props. */
export type PillTabsProps = Customisable<PillTabsOwnProps>

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-pill-tabs'

/** Applies the bar and its pill, once per document. */
function ensurePillRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-pill-tabs]{',
    'position:relative;display:inline-flex;align-items:center;gap:2px;',
    'border-radius:999px;padding:4px;',
    'border:1px solid color-mix(in oklch,currentColor 15%,transparent);',
    '}',
    '[data-o-pill-tabs] [role="tab"]{',
    'position:relative;z-index:1;border:0;background:none;cursor:pointer;',
    'border-radius:999px;font:inherit;color:inherit;white-space:nowrap;',
    'opacity:0.65;transition:color var(--o-duration-base) linear,opacity var(--o-duration-base) linear;',
    '}',
    '[data-o-pill-tabs] [role="tab"][aria-selected="true"]{',
    'color:var(--o-pill-ink);opacity:1;',
    '}',
    '[data-o-pill-indicator]{',
    'position:absolute;inset-block:4px;left:0;z-index:0;',
    'border-radius:999px;background:var(--o-pill-fill);',
    '}',
  ].join('')
  document.head.append(style)
}

/** Padding of the two sizes, in system classes. */
const SIZES = {
  sm: 'o-px-3 o-py-2 o-text-xs o-font-medium',
  md: 'o-px-4 o-py-2 o-text-sm o-font-medium',
} as const

/**
 * Tab bar whose pill slides under the active tab.
 *
 * @example
 * <PillTabs
 *   items={[
 *     { id: 'day', label: 'Day' },
 *     { id: 'week', label: 'Week' },
 *   ]}
 *   defaultValue="day"
 * />
 *
 * @example
 * // Controlled mode: the page decides.
 * <PillTabs items={views} value={view} onValueChange={setView} size="sm" />
 */
export function PillTabs({
  items,
  value,
  defaultValue,
  onValueChange,
  size = 'md',
  label = 'Tabs',
  ...rest
}: PillTabsProps): ReactElement {
  const { reduced } = useMotionState()
  const listRef = useRef<HTMLDivElement | null>(null)
  const indicatorRef = useRef<HTMLSpanElement | null>(null)
  const previousRect = useRef<{ left: number; width: number } | null>(null)
  const [internal, setInternal] = useState(defaultValue ?? items[0]?.id ?? '')
  ensurePillRules()

  const active = value ?? internal
  const activeIndex = Math.max(
    0,
    items.findIndex((item) => item.id === active),
  )

  const select = (id: string): void => {
    if (value === undefined) setInternal(id)
    onValueChange?.(id)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const last = items.length - 1
    const moves: Readonly<Record<string, number | undefined>> = {
      ArrowRight: activeIndex >= last ? 0 : activeIndex + 1,
      ArrowLeft: activeIndex <= 0 ? last : activeIndex - 1,
      Home: 0,
      End: last,
    }

    const target = moves[event.key]
    if (target === undefined) return

    event.preventDefault()
    const item = items[target]
    if (item === undefined) return
    select(item.id)
    listRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[target]?.focus()
  }

  // Immediate placement, then animation from the previous position: see the
  // module header.
  useLayoutEffect(() => {
    const list = listRef.current
    const indicator = indicatorRef.current
    if (list === null || indicator === null) return

    const tab = list.querySelectorAll<HTMLElement>('[role="tab"]')[activeIndex]
    if (tab === undefined) return

    const left = tab.offsetLeft
    const width = tab.offsetWidth
    indicator.style.width = `${String(width)}px`
    indicator.style.transform = `translateX(${String(left)}px)`

    const previous = previousRect.current
    previousRect.current = { left, width }

    if (previous === null || reduced || typeof indicator.animate !== 'function') return
    if (previous.left === left && previous.width === width) return

    indicator.animate(
      [
        {
          transform: `translateX(${String(previous.left)}px)`,
          width: `${String(previous.width)}px`,
        },
        { transform: `translateX(${String(left)}px)`, width: `${String(width)}px` },
      ],
      { duration: 220, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
    )
  }, [activeIndex, reduced, items])

  // A bar whose tabs change invalidates the stored position.
  useLayoutEffect(() => {
    previousRect.current = null
  }, [items])

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={listRef}
      role="tablist"
      aria-label={label}
      onKeyDown={onKeyDown}
      data-o-pill-tabs=""
      className={className}
      style={
        {
          // Default values, so **before** the caller's style: written after,
          // they made the pill impossible to re-tint, and the ink of the
          // active tab stayed light whatever the palette — white on white for
          // half of the hues.
          '--o-pill-fill': 'var(--o-palette-brand-600)',
          '--o-pill-ink': 'var(--o-palette-zinc-50)',
          ...style,
        } as CSSProperties
      }
    >
      {items.map((item, index) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={index === activeIndex}
          tabIndex={index === activeIndex ? 0 : -1}
          className={SIZES[size]}
          onClick={() => {
            select(item.id)
          }}
        >
          {item.label}
        </button>
      ))}
      <span ref={indicatorRef} aria-hidden="true" data-o-pill-indicator="" />
    </div>
  )
}
