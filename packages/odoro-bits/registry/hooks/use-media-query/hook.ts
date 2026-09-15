/**
 * Answer of a media query, followed over time.
 *
 * ## Why not a width measurement
 *
 * The common way — a `resize` listener that stores `window.innerWidth` in
 * state — is wrong on three counts. It triggers a React render on every notch
 * of the resize, where the answer only changes once over the whole trip. It
 * ignores everything that is not a width: orientation, coarse pointer, reduced
 * motion, dark mode. And it duplicates the stylesheet breakpoints into the
 * JavaScript, where they will diverge from the very first touch-up.
 *
 * `matchMedia` answers the same question as the CSS, with the same grammar,
 * and only warns when the answer flips.
 *
 * ## Why `useSyncExternalStore`
 *
 * Because the source is external to React and can change **between** the
 * render and the effect that would subscribe. A `useState` plus `useEffect`
 * leaves that window open: one paints a mobile layout on a wide screen, then
 * corrects it on the next frame. React knows how to close that window,
 * provided the source is declared to it as it really is.
 *
 * That is also what makes the hook safe during server rendering: the third
 * function says what to answer when there is no window, rather than letting
 * `matchMedia` throw in the middle of the render.
 *
 * ## Why the lists are cached
 *
 * `getSnapshot` is called several times per render. Building a
 * `MediaQueryList` on every call would create as many objects, and above all
 * the subscription would be on a different list from the one being queried.
 * One list per query, kept for the lifetime of the page: the browser shares
 * them anyway.
 *
 * @module
 */

import { useCallback, useSyncExternalStore } from 'react'

/** Options of `useMediaQuery`. */
export interface MediaQueryOptions {
  /**
   * Answer returned where `matchMedia` does not exist: server rendering, old
   * browser, test environment.
   *
   * The default is `false`, which amounts to saying "the query does not
   * apply". That is the careful choice as long as queries are written
   * additively — `(min-width: 60rem)` describes what is added on a large
   * screen — and it has to be flipped for a query written subtractively.
   *
   * @defaultValue false
   */
  serverValue?: boolean
}

/** Shared lists, one per query. */
const lists = new Map<string, MediaQueryList>()

/** List of a query, or `null` when the browser cannot answer. */
function listFor(query: string): MediaQueryList | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return null
  }
  const known = lists.get(query)
  if (known !== undefined) return known
  const created = window.matchMedia(query)
  lists.set(query, created)
  return created
}

/**
 * Says whether a media query applies, and says it again when that changes.
 *
 * @param query Query, in the CSS grammar.
 *
 * @example
 * const large = useMediaQuery('(min-width: 60rem)')
 * return large ? <Colonnes /> : <Pile />
 *
 * @example
 * // A query written subtractively: the server fallback has to be flipped.
 * const grossier = useMediaQuery('(pointer: coarse)', { serverValue: true })
 */
export function useMediaQuery(query: string, options: MediaQueryOptions = {}): boolean {
  const { serverValue = false } = options

  const subscribe = useCallback(
    (notify: () => void): (() => void) => {
      const target = listFor(query)
      if (target === null) return () => undefined

      // `addEventListener` on a media query list is recent on the browser
      // timescale; the older form stays the only one available on the Safari
      // versions still in circulation.
      if (typeof target.addEventListener === 'function') {
        target.addEventListener('change', notify)
        return () => {
          target.removeEventListener('change', notify)
        }
      }

      target.addListener(notify)
      return () => {
        target.removeListener(notify)
      }
    },
    [query],
  )

  const read = useCallback(
    (): boolean => listFor(query)?.matches ?? serverValue,
    [query, serverValue],
  )
  const readServer = useCallback((): boolean => serverValue, [serverValue])

  return useSyncExternalStore(subscribe, read, readServer)
}
