/**
 * Keyboard navigation of a list: arrows, Home, End.
 *
 * ## Why this is not a detail added afterwards
 *
 * A list of options made of clickable `div`s is unreachable by keyboard. The
 * reflex is then to make every item focusable — and one ends up with a list of
 * twenty tab stops, all of which must be crossed to reach the next button.
 * Both faults are common and the second is the worse one, because it looks
 * fixed.
 *
 * The right shape is called the **roving tabindex**: the whole list is a
 * single tab stop, and the arrows move focus inside it. That is what a listbox,
 * a menu, a set of tabs all do — and that is what this hook sets up, without
 * deciding anything about the appearance.
 *
 * ## Why focus is moved, and not just the index
 *
 * A purely visual active index leaves the browser focus behind: a screen
 * reader keeps announcing the first item while one is looking at the fifth.
 * Moving the real focus keeps the announcement, the browser highlight and the
 * visual output on the same element.
 *
 * ## What the hook does not decide
 *
 * The role. A listbox, a menu and a set of tabs share the same navigation and
 * have three different ARIA roles; confusing them would produce a false
 * announcement. The role, the selection and the appearance are left to the
 * caller.
 *
 * @module
 */

import { useCallback, useRef, useState, type KeyboardEvent } from 'react'

/** Direction of the list. */
export type ListOrientation = 'vertical' | 'horizontal'

/** Options of `useKeyboardList`. */
export interface KeyboardListOptions {
  /** Number of items. */
  count: number
  /** Direction of the list. @defaultValue 'vertical' */
  orientation?: ListOrientation
  /**
   * Start over at the beginning after the last item.
   *
   * True for a menu, where one is looking for an entry. False for a list where
   * position matters — a set of steps, an ordered choice — because the silent
   * return to the start reads there as an unexplained jump.
   *
   * @defaultValue true
   */
  wrap?: boolean
  /** Active item on mount. @defaultValue 0 */
  initial?: number
  /** Called on Enter or Space, with the active index. */
  onSelect?: (index: number) => void
}

/** To apply on the list container. */
export interface KeyboardListProps {
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void
  'aria-orientation': 'vertical' | 'horizontal'
}

/** To apply on every item. */
export interface KeyboardItemProps {
  ref: (node: HTMLElement | null) => void
  tabIndex: number
  onFocus: () => void
  'data-active': '' | undefined
}

/** What the hook returns. */
export interface KeyboardListResult {
  /** Active index. Is -1 when the list is empty. */
  readonly active: number
  /** Moves the active item, and focus along with it. */
  go(index: number): void
  /** To spread on the container. */
  readonly listProps: KeyboardListProps
  /** To spread on the item at the given index. */
  itemProps(index: number): KeyboardItemProps
}

/**
 * Sets up the keyboard navigation of a list.
 *
 * @example
 * const liste = useKeyboardList({ count: options.length, onSelect: choisir })
 *
 * <ul role="listbox" {...liste.listProps}>
 *   {options.map((option, index) => (
 *     <li key={option} role="option" aria-selected={index === liste.active}
 *         {...liste.itemProps(index)}>
 *       {option}
 *     </li>
 *   ))}
 * </ul>
 */
export function useKeyboardList(options: KeyboardListOptions): KeyboardListResult {
  const { count, orientation = 'vertical', wrap = true, initial = 0, onSelect } = options

  const [raw, setRaw] = useState(initial)

  // The list can shrink between two renders — a filter tightening up. Clamping
  // here rather than in an effect avoids the frame where the index points at
  // an item that no longer exists.
  const active = count === 0 ? -1 : Math.min(Math.max(raw, 0), count - 1)

  const nodes = useRef(new Map<number, HTMLElement>())
  const setters = useRef(new Map<number, (node: HTMLElement | null) => void>())

  const go = useCallback((index: number): void => {
    setRaw(index)
    // See the header: the real focus follows, otherwise the announcement and
    // the output drift apart.
    nodes.current.get(index)?.focus()
  }, [])

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>): void => {
      if (count === 0) return

      const forward = orientation === 'vertical' ? 'ArrowDown' : 'ArrowRight'
      const backward = orientation === 'vertical' ? 'ArrowUp' : 'ArrowLeft'

      const step = (direction: number): void => {
        const wanted = active + direction
        const bounded = wrap
          ? (wanted + count) % count
          : Math.min(Math.max(wanted, 0), count - 1)
        go(bounded)
      }

      switch (event.key) {
        case forward:
          // Without this, the page scrolls under the list while one walks it.
          event.preventDefault()
          step(1)
          return
        case backward:
          event.preventDefault()
          step(-1)
          return
        case 'Home':
          event.preventDefault()
          go(0)
          return
        case 'End':
          event.preventDefault()
          go(count - 1)
          return
        case 'Enter':
        case ' ':
          if (onSelect === undefined) return
          event.preventDefault()
          onSelect(active)
          return
        default:
          // The other keys are not ours: the arrows of the other axis must keep
          // scrolling the page.
          return
      }
    },
    [count, orientation, wrap, active, go, onSelect],
  )

  const itemProps = useCallback(
    (index: number): KeyboardItemProps => {
      let setter = setters.current.get(index)
      if (setter === undefined) {
        // One setter per index, kept from one render to the next: a function
        // built on every render would detach then reattach the ref, and so lose
        // the node for the length of a frame.
        setter = (node: HTMLElement | null): void => {
          if (node === null) nodes.current.delete(index)
          else nodes.current.set(index, node)
        }
        setters.current.set(index, setter)
      }

      return {
        ref: setter,
        // The roving tabindex: a single tab stop for the list.
        tabIndex: index === active ? 0 : -1,
        // A click or an incoming tab moves focus without going through the
        // arrows: the index has to follow, otherwise the two diverge.
        onFocus: () => setRaw(index),
        'data-active': index === active ? '' : undefined,
      }
    },
    [active],
  )

  return {
    active,
    go,
    listProps: {
      onKeyDown,
      'aria-orientation': orientation === 'vertical' ? 'vertical' : 'horizontal',
    },
    itemProps,
  }
}
