/**
 * Observation of an element entering the viewport.
 *
 * @module
 */

import { type RefObject, useEffect, useRef, useState } from 'react'

/** Options of {@link useInView}. */
export interface InViewOptions {
  /**
   * Proportion of the element that must be visible to consider it entered.
   * @defaultValue 0
   */
  threshold?: number
  /** Margin applied to the observation viewport. @defaultValue '0px' */
  rootMargin?: string
  /**
   * Freezes the value at `true` after the first entry: the observation stops,
   * the element never becomes "out of view" again.
   *
   * @defaultValue false
   */
  once?: boolean
}

/**
 * Tells whether an element is visible in the viewport.
 *
 * Without `IntersectionObserver` — server rendering, old browser — the element
 * is deemed visible: content conditioned on visibility must never
 * stay hidden for want of an API.
 *
 * @example
 * const [ref, inView] = useInView<HTMLElement>({ threshold: 0.4, once: true })
 *
 * return <section ref={ref} className={inView? 'o-animate-fade-in-up': 'o-invisible'} />
 */
export function useInView<T extends Element = HTMLElement>(
  options: InViewOptions = {},
): [RefObject<T | null>, boolean] {
  const { threshold = 0, rootMargin = '0px', once = false } = options
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (element === null) return

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true)
            if (once) observer.disconnect()
          } else if (!once) {
            setInView(false)
          }
        }
      },
      { threshold, rootMargin },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold, rootMargin, once])

  return [ref, inView]
}
