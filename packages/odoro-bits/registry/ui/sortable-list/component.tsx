/**
 * A list reordered with the mouse as well as with the keyboard, no dependency.
 *
 * ## The keyboard is not a catch-up
 *
 * A reordering by drag alone closes the list to whoever has no mouse, and
 * there is no way to simulate a drag on a keyboard. The handle therefore
 * carries a second mode, explicit: Space grabs, the arrows move, Space drops,
 * Escape puts back. Each step is written in a `role="status"` region — without
 * it, the order changes with nothing saying so.
 *
 * ## The drag reorders nothing before the drop
 *
 * During the travel, the real order does not move: only translations are
 * written on the elements. The grabbed row follows the pointer, the rows
 * crossed step back by one notch — a notch worth the height of the grabbed
 * row, whatever their own. Reordering on every crossing would cost a React
 * render per pixel travelled, and would move the node under the pointer in the
 * middle of its own gesture.
 *
 * ## The heights are measured on the grab
 *
 * A list whose rows have different heights stays right: the target is decided
 * by comparing the travel with the sum of the heights crossed, not with a
 * multiple of an assumed height.
 *
 * ## The keyboard move slides all the same
 *
 * The order really changes, so the nodes move: a CSS transition would see
 * nothing. The positions from before are recorded, and each row is animated
 * from its offset — the FLIP technique, in a few lines. Under reduced motion,
 * nothing is animated: the order is simply the new one.
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
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
} from 'react'

/** One row of the list. */
export interface SortableItem {
  /** Identifier, unique in the list. */
  readonly id: string
  /** Displayed label, and read out in the announcements. */
  readonly label: string
  /** Detail displayed muted. */
  readonly hint?: string
}

/** Properties specific to the component. */
export interface SortableListOwnProps {
  /** The rows, indexed by identifier. */
  items: readonly SortableItem[]
  /** Name of the list for screen readers. */
  label: string
  /** Order of the identifiers, in controlled mode. */
  value?: readonly string[]
  /** Order on mount, in uncontrolled mode. By default, that of `items`. */
  defaultValue?: readonly string[]
  /** Called with the new order, on every completed move. */
  onChange?: (order: readonly string[]) => void
  /** Neutralises the list. @defaultValue false */
  disabled?: boolean
}

/** All properties. */
export type SortableListProps = Customisable<SortableListOwnProps>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-sortable-list'

/** Applies the rows, the handle and the lifted state, once per document. */
function ensureSortRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-sort] ol{display:flex;flex-direction:column;gap:6px;margin:0;padding:0;list-style:none}',
    '[data-o-sort][data-o-sort-disabled]{opacity:0.5;pointer-events:none}',
    '[data-o-sort-row]{',
    'display:flex;align-items:center;gap:0.6rem;padding:0.55rem 0.8rem;',
    'border-radius:0.7rem;border:1px solid var(--o-theme-line);background:var(--o-theme-surface);',
    'transition:transform var(--o-duration-base) var(--o-ease-standard),',
    'box-shadow var(--o-duration-base) linear,border-color var(--o-duration-base) linear;',
    '}',
    // The grabbed row is lifted: it follows the pointer, hence no transition.
    '[data-o-sort-row][data-o-sort-lift]{',
    'transition:box-shadow var(--o-duration-base) linear;position:relative;z-index:1;',
    'border-color:var(--o-sort-accent);',
    'box-shadow:0 8px 20px color-mix(in oklab,currentColor 18%,transparent);',
    '}',
    '[data-o-sort-handle]{',
    'display:inline-grid;place-items:center;flex:none;width:1.6em;height:1.6em;',
    'border:0;border-radius:0.4rem;background:transparent;color:inherit;',
    'cursor:grab;opacity:0.5;touch-action:none;',
    'transition:opacity var(--o-duration-fast) linear,background-color var(--o-duration-fast) linear;',
    '}',
    '[data-o-sort-handle]:is(:hover,:focus-visible){opacity:1;',
    'background:color-mix(in oklab,currentColor 10%,transparent)}',
    '[data-o-sort-handle]:focus-visible{outline:2px solid var(--o-sort-accent);outline-offset:1px}',
    '[data-o-sort-handle][aria-pressed="true"]{opacity:1;cursor:grabbing;',
    'background:color-mix(in oklab,var(--o-sort-accent) 20%,transparent)}',
    '[data-o-sort-label]{flex:1 1 auto;min-width:0}',
    '[data-o-sort-hint]{opacity:0.55;font-size:0.875em;white-space:nowrap}',
    '[data-o-sort-live]{margin:0.6rem 0 0;font-size:0.8125em;opacity:0.7;min-height:1.4em}',
    '@media (prefers-reduced-motion:reduce){[data-o-sort-row]{transition:none}}',
  ].join('')
  document.head.append(style)
}

/** Moves an element from one position to another, without mutating the source. */
function move(order: readonly string[], from: number, to: number): readonly string[] {
  const next = [...order]
  const [taken] = next.splice(from, 1)
  if (taken === undefined) return order
  next.splice(to, 0, taken)
  return next
}

/**
 * Reorderable list, with the mouse and with the keyboard.
 *
 * @example
 * <SortableList
 *   label="Order of the steps"
 *   items={[
 *     { id: 'brief', label: 'Brief' },
 *     { id: 'mockup', label: 'Mockup' },
 *     { id: 'testing', label: 'Testing' },
 *   ]}
 * />
 *
 * @example
 * // Controlled mode: the order lives in the page.
 * <SortableList label="Columns" items={columns} value={order} onChange={setOrder} />
 */
export function SortableList({
  items,
  label,
  value,
  defaultValue,
  onChange,
  disabled = false,
  ...rest
}: SortableListProps): ReactElement {
  const { reduced } = useMotionState()
  const listRef = useRef<HTMLOListElement | null>(null)
  const [internal, setInternal] = useState<readonly string[]>(
    () => defaultValue ?? items.map((item) => item.id),
  )
  const [grabbed, setGrabbed] = useState<string | null>(null)
  const [dragging, setDragging] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  ensureSortRules()

  const order = value ?? internal
  // A row absent from `items` has disappeared from the page: we do not render
  // it, and a new row is placed at the end rather than lost.
  const known = new Map(items.map((item) => [item.id, item]))
  const rows = [
    ...order.filter((id) => known.has(id)),
    ...items.filter((item) => !order.includes(item.id)).map((item) => item.id),
  ]

  /**
   * The order of the rows, as a single string.
   *
   * This is what the animation compares: two renders whose rows are in the
   * same order must replay nothing, even if the array is a new one.
   */
  const orderKey = rows.join(',')

  /** Positions from before, for the FLIP animation; null during a drag. */
  const before = useRef<Map<string, number> | null>(null)
  /**
   * Handle to refocus after a move.
   *
   * Moving a node in the document takes the focus away from it: without this
   * relay, the first arrow would lose the handle being held.
   */
  const keepFocus = useRef<string | null>(null)

  const rowElements = (): HTMLLIElement[] =>
    Array.from(
      listRef.current?.querySelectorAll<HTMLLIElement>('[data-o-sort-row]') ?? [],
    )

  const commit = (next: readonly string[]): void => {
    if (value === undefined) setInternal(next)
    onChange?.(next)
  }

  const say = (id: string, at: number, verb: string): void => {
    const item = known.get(id)
    setMessage(
      `${item?.label ?? id} ${verb}, position ${String(at + 1)} of ${String(rows.length)}.`,
    )
  }

  // FLIP: the positions recorded before the render serve as a starting point.
  // This is also where the moved handle finds its focus again.
  useLayoutEffect(() => {
    const back = keepFocus.current
    keepFocus.current = null
    if (back !== null) {
      listRef.current
        ?.querySelector<HTMLButtonElement>(
          `[data-o-sort-id="${back}"] [data-o-sort-handle]`,
        )
        ?.focus()
    }

    const previous = before.current
    before.current = null
    if (previous === null || reduced) return

    for (const element of rowElements()) {
      const id = element.dataset['oSortId']
      const from = id === undefined ? undefined : previous.get(id)
      if (from === undefined || typeof element.animate !== 'function') continue
      const delta = from - element.getBoundingClientRect().top
      if (Math.abs(delta) < 1) continue
      element.animate(
        [{ transform: `translateY(${String(delta)}px)` }, { transform: 'none' }],
        { duration: 220, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
      )
    }
    // Named rather than written in the array: an expression there is opaque to
    // the checker, which can then no longer say whether the list is right. The
    // comparison does bear on the content of the rows, not on the identity of
    // the array — which is what we want, and it is now verifiable.
  }, [orderKey, reduced])

  /** Records the current positions, so that the next render replays them. */
  const snapshot = (): void => {
    before.current = new Map(
      rowElements().map((element) => [
        element.dataset['oSortId'] ?? '',
        element.getBoundingClientRect().top,
      ]),
    )
  }

  // --- Drag ------------------------------------------------------------------

  const onPointerDown = (
    id: string,
    event: ReactPointerEvent<HTMLButtonElement>,
  ): void => {
    if (disabled || event.button !== 0) return
    const elements = rowElements()
    const from = rows.indexOf(id)
    const held = elements[from]
    if (held === undefined || elements.length < 2) return

    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    event.currentTarget.focus()
    setGrabbed(null)
    setDragging(id)

    // The step of a row, gap included: it is by that much that the crossed rows
    // step back, and it is worth that of the grabbed row, not their own.
    const rects = elements.map((element) => element.getBoundingClientRect())
    const first = rects[0]
    const second = rects[1]
    const gap =
      first === undefined || second === undefined
        ? 0
        : second.top - first.top - first.height
    const steps = rects.map((rect) => rect.height + gap)
    const heldStep = steps[from] ?? 0
    const startY = event.clientY
    let target = from

    const place = (dy: number): void => {
      // Target: the last row whose half we have crossed.
      let next = from
      let travelled = 0
      if (dy > 0) {
        for (let index = from + 1; index < steps.length; index += 1) {
          const step = steps[index] ?? 0
          if (dy <= travelled + step / 2) break
          travelled += step
          next = index
        }
      } else {
        for (let index = from - 1; index >= 0; index -= 1) {
          const step = steps[index] ?? 0
          if (-dy <= travelled + step / 2) break
          travelled += step
          next = index
        }
      }
      target = next

      for (const [index, element] of elements.entries()) {
        if (index === from) {
          element.style.transform = `translateY(${String(dy)}px)`
        } else if (next > from && index > from && index <= next) {
          element.style.transform = `translateY(${String(-heldStep)}px)`
        } else if (next < from && index >= next && index < from) {
          element.style.transform = `translateY(${String(heldStep)}px)`
        } else {
          element.style.transform = ''
        }
      }
    }

    const onMove = (moveEvent: PointerEvent): void => {
      place(moveEvent.clientY - startY)
    }

    const finish = (): void => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', finish)
      window.removeEventListener('pointercancel', finish)
      for (const element of elements) element.style.transform = ''
      setDragging(null)
      if (target === from) return
      // The rows are already in place on screen: replaying the FLIP would make
      // them go back only to set off again.
      before.current = null
      commit(move(rows, from, target))
      say(id, target, 'moved')
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerup', finish)
    window.addEventListener('pointercancel', finish)
  }

  // --- Keyboard --------------------------------------------------------------

  const restore = useRef<readonly string[] | null>(null)

  const onHandleKeyDown = (id: string, event: KeyboardEvent<HTMLButtonElement>): void => {
    const at = rows.indexOf(id)
    if (at < 0) return

    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      if (grabbed === id) {
        setGrabbed(null)
        restore.current = null
        say(id, at, 'dropped')
      } else {
        setGrabbed(id)
        restore.current = rows
        setMessage(
          `${known.get(id)?.label ?? id} grabbed, position ${String(at + 1)} of ${String(rows.length)}. The arrows move, Space drops.`,
        )
      }
      return
    }

    if (event.key === 'Escape' && grabbed === id) {
      event.preventDefault()
      const initial = restore.current
      setGrabbed(null)
      restore.current = null
      if (initial !== null) {
        snapshot()
        keepFocus.current = id
        commit(initial)
      }
      setMessage('Move cancelled.')
      return
    }

    if (grabbed !== id) return
    const to =
      event.key === 'ArrowUp' ? at - 1 : event.key === 'ArrowDown' ? at + 1 : null
    if (to === null) return
    event.preventDefault()
    if (to < 0 || to >= rows.length) return
    snapshot()
    keepFocus.current = id
    commit(move(rows, at, to))
    say(id, to, 'moved')
  }

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      role="group"
      aria-label={label}
      data-o-sort=""
      data-o-sort-disabled={disabled ? '' : undefined}
      className={className}
      style={
        { '--o-sort-accent': 'var(--o-palette-brand-500)', ...style } as CSSProperties
      }
    >
      <ol ref={listRef}>
        {rows.map((id) => {
          const item = known.get(id)
          if (item === undefined) return null
          const held = grabbed === id || dragging === id
          return (
            <li
              key={id}
              data-o-sort-row=""
              data-o-sort-id={id}
              data-o-sort-lift={held ? '' : undefined}
            >
              <button
                type="button"
                data-o-sort-handle=""
                aria-label={`Move ${item.label}`}
                aria-pressed={grabbed === id}
                disabled={disabled}
                onPointerDown={(event) => {
                  onPointerDown(id, event)
                }}
                onKeyDown={(event) => {
                  onHandleKeyDown(id, event)
                }}
                onBlur={() => {
                  // A move takes the focus away for the time of one render: it
                  // is not a give-up, and the handle comes back just after.
                  if (keepFocus.current === null && grabbed === id) setGrabbed(null)
                }}
              >
                <svg
                  viewBox="0 0 16 16"
                  width="14"
                  height="14"
                  aria-hidden="true"
                  fill="currentColor"
                >
                  <circle cx="6" cy="4" r="1.3" />
                  <circle cx="10" cy="4" r="1.3" />
                  <circle cx="6" cy="8" r="1.3" />
                  <circle cx="10" cy="8" r="1.3" />
                  <circle cx="6" cy="12" r="1.3" />
                  <circle cx="10" cy="12" r="1.3" />
                </svg>
              </button>
              <span data-o-sort-label="">{item.label}</span>
              {item.hint !== undefined && <span data-o-sort-hint="">{item.hint}</span>}
            </li>
          )
        })}
      </ol>
      <p role="status" data-o-sort-live="">
        {message}
      </p>
    </div>
  )
}
