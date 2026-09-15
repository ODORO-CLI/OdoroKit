/**
 * Fires when the element enters the viewport, once.
 *
 * ## Why this hook rather than ScrollTrigger
 *
 * The engine already knows how to watch scrolling, but through GSAP — and GSAP
 * then lands in the project of whoever installs a simple heading animation.
 * `IntersectionObserver` has been in the browser for years, costs nothing, and
 * answers exactly the question being asked: "is it visible?".
 *
 * What does require GSAP is the *scrub* — an animation whose progress follows
 * the scroll position to the pixel. This hook makes no claim to do that.
 *
 * ## It opens when in doubt, it never closes
 *
 * Without `IntersectionObserver` — an old browser, a test environment, a
 * server render hydrated oddly — the hook returns `inView: true` **immediately**.
 *
 * The opposite default would be the worst possible one: an animation that
 * never starts leaves the text in its initial state, which is to say often
 * invisible. An effect that does not play is barely noticed; a missing heading
 * is noticed straight away, and too late.
 *
 * ## Once, by default
 *
 * A heading that replays its animation every time one scrolls back up draws
 * attention to itself at a moment when one was looking for something else. The
 * observer therefore detaches after the first pass, which also frees its cost.
 *
 * @module
 */

import { useEffect, useRef, useState, type RefObject } from 'react'

/** Settings of the observation. */
export interface UseInViewOptions {
  /**
   * Detach after the first pass.
   *
   * @defaultValue true
   */
  once?: boolean
  /**
   * Visible share that fires, from 0 to 1.
   *
   * @defaultValue 0.3
   */
  amount?: number
  /**
   * Margin around the observation area, `rootMargin` syntax.
   *
   * A negative bottom margin delays the trigger until the element has entered
   * decisively.
   */
  margin?: string
  /**
   * Do not observe at all: the hook returns `inView: true` from mount onwards.
   *
   * This is how a component exposes a trigger "on mount" without writing two
   * code paths.
   *
   * @defaultValue false
   */
  immediate?: boolean
}

/** What the hook returns. */
export interface UseInViewResult<T extends Element> {
  /** To apply on the element to observe. */
  readonly ref: RefObject<T | null>
  /** True as soon as the element has been seen. */
  readonly inView: boolean
}

/**
 * Observes an element and says when it has been seen.
 *
 * @example
 * const { ref, inView } = useInView<HTMLDivElement>()
 * return <div ref={ref} data-anime={inView ? '' : undefined} />
 *
 * @example
 * // Trigger on mount: no observer is created.
 * const { ref, inView } = useInView<HTMLSpanElement>({ immediate: true })
 */
export function useInView<T extends Element>(
  options: UseInViewOptions = {},
): UseInViewResult<T> {
  const { once = true, amount = 0.3, margin, immediate = false } = options

  const ref = useRef<T | null>(null)
  const [inView, setVu] = useState(immediate)

  useEffect(() => {
    if (immediate) {
      setVu(true)
      return
    }

    const target = ref.current
    if (target === null) return

    // See the header: when in doubt, we show. An effect that does not play is
    // barely noticed, a missing heading is noticed straight away.
    if (typeof IntersectionObserver === 'undefined') {
      setVu(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setVu(true)
            if (once) observer.disconnect()
          } else if (!once) {
            setVu(false)
          }
        }
      },
      {
        // `threshold` rejects a value outside [0, 1] by throwing: we clamp it
        // rather than let a typo break the page.
        threshold: Math.min(1, Math.max(0, amount)),
        ...(margin === undefined ? {} : { rootMargin: margin }),
      },
    )

    observer.observe(target)

    return () => {
      observer.disconnect()
    }
  }, [once, amount, margin, immediate])

  return { ref, inView }
}
