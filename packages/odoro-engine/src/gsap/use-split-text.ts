/**
 * Text splitting for animation.
 *
 * ## The accessibility trap, and it is a serious one
 *
 * Splitting a paragraph into one tag per character destroys three things at
 * once: some screen reader and browser combinations then announce the text
 * **letter by letter**, mouse selection fragments, and copy-paste returns a
 * string of pieces.
 *
 * The remedy fits in two attributes, and it belongs to the engine, not to the
 * caller: the container carries the original text in `aria-label`, and the
 * fragments are marked `aria-hidden`. The screen reader then reads a sentence,
 * not an alphabet.
 *
 * ## Under reduced motion, nothing is split at all
 *
 * Splitting in order to animate nothing would amount to paying the whole
 * accessibility cost for no benefit. The text therefore stays intact.
 *
 * ## Re-splitting on resize
 *
 * A per-line split depends on the available width. Without re-splitting, the
 * animated "lines" stop matching the displayed lines as soon as the window
 * changes — and the result is stranger than no animation at all. Re-splitting
 * therefore only happens for that mode.
 *
 * @module
 */

import { type RefObject, useEffect, useRef, useState } from 'react'

import { motionPolicy } from '../core/motion-policy.js'
import { loadSplitText } from './setup.js'

/** Granularity of the split. */
export type SplitBy = 'chars' | 'words' | 'lines'

/** Options of {@link useSplitText}. */
export interface SplitTextOptions {
  /** Granularity. @defaultValue 'chars' */
  by?: SplitBy | readonly SplitBy[]
  /**
   * Re-splits on resize. No effect outside the `lines` mode, where the split
   * does not depend on the width.
   *
   * @defaultValue true
   */
  resplitOnResize?: boolean
  /** Debounce delay of the resize, in milliseconds. @defaultValue 150 */
  debounce?: number
}

/** What {@link useSplitText} returns. */
export interface SplitTextHandle<T extends Element> {
  /** Ref to set on the element containing the text. */
  readonly ref: RefObject<T | null>
  /** Fragments produced, empty as long as the split has not happened. */
  readonly parts: readonly Element[]
  /** `true` once the split has been performed. */
  readonly ready: boolean
}

/** Normalises the requested granularity to the shape the plugin expects. */
function toTypes(by: SplitBy | readonly SplitBy[]): string {
  return (Array.isArray(by) ? by : [by]).join(',')
}

/**
 * Splits the text of an element into animatable fragments.
 *
 * The original DOM is entirely restored on unmount: a text left split would
 * break selection and copy-paste long after the disappearance of the animation
 * that justified it.
 *
 * @example
 * const { ref, parts, ready } = useSplitText<HTMLHeadingElement>({ by: 'chars' })
 *
 * useEffect(() => {
 *   if (!ready) return
 *   gsap.from(parts, { y: 20, opacity: 0, stagger: 0.02 })
 * }, [ready, parts])
 *
 * return <h1 ref={ref}>A revealed heading</h1>
 */
export function useSplitText<T extends Element = HTMLElement>(
  options: SplitTextOptions = {},
): SplitTextHandle<T> {
  const { by = 'chars', resplitOnResize = true, debounce = 150 } = options

  const ref = useRef<T | null>(null)
  const [parts, setParts] = useState<readonly Element[]>([])
  const [ready, setReady] = useState(false)

  const types = toTypes(by)
  const watchesWidth = resplitOnResize && types.includes('lines')

  useEffect(() => {
    const element = ref.current
    if (element === null) return

    // Neutralised: the text stays as it is, and the caller will see `ready`
    // stay false — and will therefore animate nothing.
    if (motionPolicy.state.reduced) return

    let split: SplitText | undefined
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    let observer: ResizeObserver | undefined

    /** Original text, read again before every split. */
    const label = element.textContent ?? ''
    const hadLabel = element.hasAttribute('aria-label')

    const apply = (SplitTextClass: typeof SplitText): void => {
      split?.revert()
      // The split only makes sense on an HTML element; the generic constraint
      // stays `Element` so as not to hinder the caller.
      split = new SplitTextClass(element as unknown as HTMLElement, { type: types })

      const produced: Element[] = [
        ...(split.chars ?? []),
        ...(types.includes('chars') ? [] : (split.words ?? [])),
        ...(types.includes('chars') || types.includes('words')
          ? []
          : (split.lines ?? [])),
      ]

      // The screen reader must read a sentence, not an alphabet.
      element.setAttribute('aria-label', label)
      for (const part of produced) part.setAttribute('aria-hidden', 'true')

      setParts(produced)
      setReady(true)
    }

    void loadSplitText().then((SplitTextClass) => {
      if (SplitTextClass === null || cancelled || ref.current === null) return

      apply(SplitTextClass)

      if (!watchesWidth || typeof ResizeObserver === 'undefined') return

      let width = element.getBoundingClientRect().width
      observer = new ResizeObserver((entries) => {
        const next = entries[0]?.contentRect.width
        // Only the width changes the split into lines: ignoring height
        // variations avoids a re-split on every animation.
        if (next === undefined || Math.abs(next - width) < 1) return
        width = next

        clearTimeout(timer)
        timer = setTimeout(() => {
          if (!cancelled && ref.current !== null) apply(SplitTextClass)
        }, debounce)
      })
      observer.observe(element)
    })

    return () => {
      cancelled = true
      clearTimeout(timer)
      observer?.disconnect()
      // The restoration must happen even if the component is unmounted before
      // the plugin has finished loading.
      split?.revert()
      if (!hadLabel) element.removeAttribute('aria-label')
      setParts([])
      setReady(false)
    }
  }, [types, watchesWidth, debounce])

  return { ref, parts, ready }
}
