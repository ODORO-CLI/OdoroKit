/**
 * Size and position of an element, read again whenever they change.
 *
 * ## Why an observer, and not a loop
 *
 * Measuring inside the render loop would give an always-correct value, at the
 * cost of a layout read on every frame — for a number that, on an ordinary
 * page, does not move for minutes. The browser knows how to say when it has
 * changed: `ResizeObserver` only wakes up on a real box change, and it sees
 * what a `resize` listener does not — a neighbouring column opening, a font
 * arriving, content growing.
 *
 * ## Why React state here, when elsewhere it is a ref
 *
 * Because the value is used to **decide**, not to animate. One measures to
 * choose a number of columns, size a canvas, place a panel: all things that go
 * through a render anyway. The number of renders is the number of real
 * changes, that is to say almost none.
 *
 * That is the difference with the pointer or with scrolling, which change on
 * every frame and therefore have no business in state.
 *
 * ## Rounding is not cosmetic
 *
 * A width in percent comes to 341.328125 pixels, and the slightest reflow
 * makes it wobble by a hundredth. Without rounding, each of those wobbles
 * triggers a render — and if that render changes the layout, the observer
 * wakes up again. That is how one gets the loop the browser reports as
 * "ResizeObserver loop completed with undelivered notifications".
 *
 * ## What this hook does not do
 *
 * The position is the one from the last reading, in viewport coordinates. It
 * does not follow scrolling: following it would require a measurement per
 * frame, that is to say exactly what this hook avoids. For an element that
 * moves while one scrolls, scroll progress is the right tool.
 *
 * @module
 */

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'

/** Box that was read, in pixels, in viewport coordinates. */
export interface Box {
  readonly width: number
  readonly height: number
  readonly top: number
  readonly left: number
}

/** Options of `useMeasure`. */
export interface MeasureOptions {
  /**
   * Round to the pixel.
   *
   * See the header: without rounding, a fractional width makes the measurement
   * wobble and triggers renders for nothing. Only turn it off for a canvas,
   * where the sub-pixel shows.
   *
   * @defaultValue true
   */
  round?: boolean
}

/** What the hook returns. */
export interface MeasureResult<T extends Element> {
  /** To apply on the element to measure. */
  readonly ref: RefObject<T | null>
  /** Last box that was read. Zeroed as long as nothing has been measured. */
  readonly box: Box
  /** `true` as soon as a first measurement has happened. */
  readonly ready: boolean
  /**
   * Forces a reading.
   *
   * Needed after a change the observer does not see: an element that was just
   * moved without being resized.
   */
  measure(): void
}

/** Box before any measurement. */
const EMPTY: Box = { width: 0, height: 0, top: 0, left: 0 }

/** Two identical boxes have no reason to trigger a render. */
function sameBox(a: Box, b: Box): boolean {
  return (
    a.width === b.width && a.height === b.height && a.top === b.top && a.left === b.left
  )
}

/**
 * Measures an element, and measures it again when it changes.
 *
 * @example
 * const { ref, box, ready } = useMeasure<HTMLDivElement>()
 * return (
 *   <div ref={ref}>
 *     {ready ? <Toile largeur={box.width} hauteur={box.height} /> : null}
 *   </div>
 * )
 */
export function useMeasure<T extends Element>(
  options: MeasureOptions = {},
): MeasureResult<T> {
  const { round = true } = options

  const ref = useRef<T | null>(null)
  const [state, setState] = useState<{ box: Box; ready: boolean }>({
    box: EMPTY,
    ready: false,
  })

  const measure = useCallback((): void => {
    const target = ref.current
    if (target === null) return

    const rect = target.getBoundingClientRect()
    const adjust = (value: number): number => (round ? Math.round(value) : value)
    const reading: Box = {
      width: adjust(rect.width),
      height: adjust(rect.height),
      top: adjust(rect.top),
      left: adjust(rect.left),
    }

    setState((previous) =>
      previous.ready && sameBox(previous.box, reading)
        ? previous
        : { box: reading, ready: true },
    )
  }, [round])

  useEffect(() => {
    const target = ref.current
    if (target === null) return

    measure()

    // The window on top of the element: an element of fixed size changes
    // position when the window shrinks, and the observer does not see it.
    window.addEventListener('resize', measure, { passive: true })

    if (typeof ResizeObserver === 'undefined') {
      // Without an observer, the initial measurement and the window resize are
      // better than nothing: that is the older behaviour, not a breakage.
      return () => {
        window.removeEventListener('resize', measure)
      }
    }

    const observer = new ResizeObserver(() => {
      // We measure again through `getBoundingClientRect` rather than reading
      // the entry: that one gives a size, never a position in the window.
      measure()
    })
    observer.observe(target)

    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [measure])

  return { ref, box: state.box, ready: state.ready, measure }
}
