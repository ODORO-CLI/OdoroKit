/**
 * Progress of an element, or of a page, through the viewport.
 *
 * ## Why this hook rather than ScrollTrigger
 *
 * The engine already knows how to follow scrolling, but through GSAP and its
 * `ScrollTrigger` plugin — thirty more kilobytes, and a plugin to register,
 * for a subtraction between two rectangles. The price is justified when one
 * pins a section or synchronises a whole timeline; it is not when one simply
 * wants to know "where is this element at".
 *
 * This hook does that subtraction, and nothing else.
 *
 * ## Why the measurement goes through the clock, and not a `scroll` listener
 *
 * One listener per element looks cheaper — it only works while scrolling. In
 * practice it is the opposite. Scroll events arrive more often than a frame on
 * touch drivers, and each one triggers a rectangle read: we measure several
 * times for the same displayed frame. Ten watched elements make ten listeners
 * that all wake up on every wheel notch.
 *
 * By going through the clock, the measurement happens **once per frame**,
 * whatever the number of elements, and at `layout` priority: every layout read
 * of the frame is grouped before the writes, which avoids the round trip where
 * one reads, writes, and reads back a computation the browser has just thrown
 * away.
 *
 * ## Why a ref and a subscription, rather than state
 *
 * The value changes on every frame throughout a whole scroll. Returning it as
 * state means sixty React renders a second to move a rectangle the compositor
 * animates on its own.
 *
 * `progress.current` is therefore the exact value, read inside the loop by
 * those who are already there. `subscribe` exists for the other, real need:
 * displaying a percentage in figures, crossing a step. It only publishes at
 * the steps — see {@link STEPS} — because a display rounded to the percent has
 * no use for a hundredth of a decimal.
 *
 * ## A single axis
 *
 * The vertical one. Horizontal scrolling is measured differently — it is the
 * position of a container, not the crossing of a viewport — and claiming to
 * cover both with the same options would give a hook where half the settings
 * never apply.
 *
 * @module
 */

import { CLOCK_PRIORITY, clock, motionPolicy } from '@odoro-cli/engine'
import { useCallback, useEffect, useMemo, useRef, type RefObject } from 'react'

/**
 * What the run from 0 to 1 covers.
 *
 * - `through` — 0 when the top of the element touches the bottom of the
 *   viewport, 1 when its bottom touches the top of it. This is the run of a
 *   reveal: the element enters, passes, leaves.
 * - `anchored` — 0 when the top of the element reaches the top of the viewport,
 *   1 when its bottom reaches the bottom of it. This is the run of a tall
 *   section walked from the inside: a timeline, a story in steps.
 */
export type ScrollRange = 'through' | 'anchored'

/** What to do under reduced motion. */
export type ScrollReduced = 'final' | 'follow'

/** Options of `useScrollProgress`. */
export interface ScrollProgressOptions {
  /**
   * Measured element. Without it, the progress of the document — or of the
   * container — is what gets returned.
   */
  target?: HTMLElement | null
  /**
   * Container that scrolls, when it is not the window: a panel, a dialog. It
   * defines the viewport the element sits in.
   */
  scroller?: HTMLElement | null
  /** What the run covers. @defaultValue 'through' */
  range?: ScrollRange
  /**
   * Under reduced motion, `final` publishes 1 once and for all and measures
   * nothing more: a text revealed by progress has to be read, not frozen at
   * its initial state. `follow` measures anyway, for the cases where the value
   * is the content — a reading bar says where one is at, it is not an
   * animation.
   *
   * @defaultValue 'final'
   */
  reduced?: ScrollReduced
  /** Name displayed in the diagnostics panel. */
  name?: string
}

/** What the hook returns. */
export interface ScrollProgressHandle {
  /** Current progress, from 0 to 1. To be read inside the loop. */
  readonly progress: RefObject<number>
  /**
   * Subscribes to the steps of the progress. A new subscriber receives the
   * current value straight away — without that it would sit at zero until the
   * first movement, which is wrong as soon as one lands mid-page.
   *
   * @returns What is needed to unsubscribe.
   */
  subscribe(listener: (value: number) => void): () => void
}

/**
 * Number of publication steps.
 *
 * A hundred: finer than what a percentage displays, and two orders of
 * magnitude below the number of frames of a complete scroll.
 */
const STEPS = 100

/**
 * Follows the progress of an element, or of the page, through the viewport.
 *
 * @example
 * // A reveal: the value is read inside the loop, without a React render.
 * const [cible, setCible] = useState<HTMLElement | null>(null)
 * const { progress } = useScrollProgress({ target: cible })
 *
 * @example
 * // A displayed percentage: the subscription, capped to the steps.
 * const { subscribe } = useScrollProgress()
 * const [part, setPart] = useState(0)
 * useEffect(() => subscribe(setPart), [subscribe])
 */
export function useScrollProgress(
  options: ScrollProgressOptions = {},
): ScrollProgressHandle {
  const {
    target = null,
    scroller = null,
    range = 'through',
    reduced = 'final',
    name = 'scroll-progress',
  } = options

  const progress = useRef(0)
  const published = useRef(-1)
  const listeners = useRef<Set<(value: number) => void>>(new Set())

  const subscribe = useCallback((listener: (value: number) => void): (() => void) => {
    listeners.current.add(listener)
    listener(progress.current)
    return () => {
      listeners.current.delete(listener)
    }
  }, [])

  useEffect(() => {
    const write = (value: number): void => {
      const bounded = value < 0 ? 0 : value > 1 ? 1 : value
      progress.current = bounded

      const step = Math.round(bounded * STEPS)
      if (step === published.current) return
      published.current = step
      // A copy: a subscriber removing itself from its own notification is the
      // common case of a step that must only be crossed once.
      for (const listener of [...listeners.current]) listener(bounded)
    }

    // See the options: under reduced motion, the final state, not the initial.
    if (reduced === 'final' && motionPolicy.state.reduced) {
      write(1)
      return
    }

    const measure = (): number => {
      if (target === null) {
        if (scroller !== null) {
          const travel = scroller.scrollHeight - scroller.clientHeight
          return travel <= 0 ? 0 : scroller.scrollTop / travel
        }
        const root = document.documentElement
        const travel = root.scrollHeight - window.innerHeight
        return travel <= 0 ? 0 : window.scrollY / travel
      }

      const field =
        scroller === null
          ? { top: 0, height: window.innerHeight }
          : {
              top: scroller.getBoundingClientRect().top,
              height: scroller.clientHeight,
            }

      const rect = target.getBoundingClientRect()
      const top = rect.top - field.top

      if (range === 'anchored') {
        const travel = rect.height - field.height
        // An element shorter than the viewport is not walked from the inside:
        // the run is nil, and the answer binary.
        if (travel <= 0) return top <= 0 ? 1 : 0
        return -top / travel
      }

      const travel = field.height + rect.height
      return travel <= 0 ? 0 : (field.height - top) / travel
    }

    const subscription = clock.subscribe(
      () => {
        write(measure())
      },
      // `layout` priority: the layout reads of the whole frame group up here,
      // before anyone writes.
      { priority: CLOCK_PRIORITY.layout, name },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [target, scroller, range, reduced, name])

  return useMemo(() => ({ progress, subscribe }), [subscribe])
}
