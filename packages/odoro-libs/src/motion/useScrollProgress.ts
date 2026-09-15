/**
 * Scroll progress, normalized between 0 and 1.
 *
 * ## The only loop of the library, and it is yieldable
 *
 * A scroll progress is read **per frame**, not per event: a
 * browser emits dozens of scroll events per second, and
 * measuring on each of them recomputes the layout as many times.
 *
 * This is the only thing in `@odoro-cli/libs/motion` that opens a loop — all
 * the rest goes through the Web Animations API, driven by the compositor. It
 * therefore goes through `onFrame`, the yieldable scheduler of
 * `@odoro-cli/libs/motion-policy`: when `@odoro-cli/engine` is present, it
 * installs it on its ticker and there is only one loop left on the page.
 *
 * @module
 */

import { type RefObject, useEffect, useRef, useState } from 'react'

import { onFrame } from '../motion-policy/index.js'

/** Options of {@link useScrollProgress}. */
export interface ScrollProgressOptions {
  /**
   * Number of decimals kept. Every value change triggers a
   * render: rounding avoids re-rendering on every scrolled pixel.
   *
   * @defaultValue 3
   */
  precision?: number
}

/** Rounds a progress to the requested precision, clamped between 0 and 1. */
function clamp(value: number, precision: number): number {
  const factor = 10 ** precision
  return Math.round(Math.min(1, Math.max(0, value)) * factor) / factor
}

/**
 * Progress of the page scroll: 0 at the top, 1 all the way down.
 *
 * The measurement is coalesced on the frame: several scroll events
 * within the same frame trigger only one read and at most one render. It
 * goes through the yieldable scheduler, not through a hard-coded `requestAnimationFrame`.
 *
 * @example
 * const progress = useScrollProgress()
 * <div className="o-fixed o-top-0 o-left-0 o-h-1 o-bg-brand-600 dark:o-bg-brand-400" style={{ width: `${progress * 100}%` }} />
 */
export function useScrollProgress(options: ScrollProgressOptions = {}): number {
  const { precision = 3 } = options
  const [progress, setProgress] = useState(0)
  const cancel = useRef<(() => void) | undefined>(undefined)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const measure = (): void => {
      cancel.current = undefined
      const root = document.documentElement
      const max = root.scrollHeight - root.clientHeight
      setProgress(max <= 0 ? 0 : clamp(root.scrollTop / max, precision))
    }

    // Coalescing: several events within the same frame trigger
    // only one read, and at most one render.
    const schedule = (): void => {
      if (cancel.current !== undefined) return
      cancel.current = onFrame(measure)
    }

    measure()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      cancel.current?.()
      cancel.current = undefined
    }
  }, [precision])

  return progress
}

/**
 * Progress of the viewport crossing an element: 0 when its top
 * reaches the bottom of the screen, 1 when its bottom leaves the top of the screen.
 *
 * @example
 * const [ref, progress] = useElementScrollProgress<HTMLElement>()
 */
export function useElementScrollProgress<T extends HTMLElement = HTMLElement>(
  options: ScrollProgressOptions = {},
): [RefObject<T | null>, number] {
  const { precision = 3 } = options
  const ref = useRef<T | null>(null)
  const [progress, setProgress] = useState(0)
  const cancel = useRef<(() => void) | undefined>(undefined)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const measure = (): void => {
      cancel.current = undefined
      const element = ref.current
      if (element === null) return
      const rect = element.getBoundingClientRect()
      const viewport = window.innerHeight
      const total = rect.height + viewport
      setProgress(total <= 0 ? 0 : clamp((viewport - rect.top) / total, precision))
    }

    const schedule = (): void => {
      if (cancel.current !== undefined) return
      cancel.current = onFrame(measure)
    }

    measure()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      cancel.current?.()
      cancel.current = undefined
    }
  }, [precision])

  return [ref, progress]
}
