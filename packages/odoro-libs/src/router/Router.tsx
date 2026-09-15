/**
 * Root component of the router.
 *
 * It owns the history, publishes the current location, orchestrates the View
 * Transitions and restores the scroll position.
 *
 * @module
 */

import {
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react'
import { flushSync } from 'react-dom'

import {
  LocationContext,
  type NavigateFunction,
  NavigationContext,
  type NavigationContextValue,
} from './context.js'
import {
  type RouterHistory,
  createBrowserHistory,
  createMemoryHistory,
} from './history.js'
import { emitNavigation } from './navigation.js'
import { preloadRoutes } from './lazy.js'
import { createPath, resolvePath } from './path.js'
import type { NavigateOptions, RouteObject, To } from './types.js'
import {
  prefersReducedMotion,
  runViewTransition,
  supportsViewTransitions,
} from './viewTransition.js'

/** Props of {@link Router}. */
export interface RouterProps {
  /** Tree of the application. */
  children: ReactNode
  /**
   * History to use. By default, the browser history — or an in-memory history
   * when `window` does not exist (server-side rendering).
   */
  history?: RouterHistory
  /**
   * Enables the View Transitions for every navigation. Each `<Link>` or call
   * to `navigate` may depart from this setting.
   *
   * @defaultValue true
   */
  viewTransition?: boolean
}

/**
 * Continuously records the scroll position of the current history entry, so
 * that it can be restored when going back.
 *
 * The write is amortized by `requestAnimationFrame`: at most one per frame.
 */
function useScrollTracking(history: RouterHistory, key: string): void {
  const keyRef = useRef(key)
  keyRef.current = key

  useEffect(() => {
    if (typeof window === 'undefined') return

    let frame = 0
    const onScroll = (): void => {
      if (frame !== 0) return
      frame = window.requestAnimationFrame(() => {
        frame = 0
        history.setScroll(keyRef.current, window.scrollY)
      })
    }

    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      if (frame !== 0) window.cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
    }
  }, [history])
}

/**
 * Applies the scroll policy after every navigation: restoration when going
 * back, anchor when the URL holds one, top of the page otherwise.
 */
function useScrollPolicy(
  history: RouterHistory,
  key: string,
  hash: string,
  isPop: boolean,
  suppressed: { current: boolean },
): void {
  useLayoutEffect(() => {
    if (suppressed.current) {
      suppressed.current = false
      return
    }
    if (typeof window === 'undefined') return

    if (isPop) {
      const saved = history.getScroll(key)
      if (saved !== undefined) {
        window.scrollTo(0, saved)
        return
      }
    }

    if (hash !== '') {
      const id = hash.slice(1)
      const target = id === '' ? null : document.getElementById(decodeURIComponent(id))
      if (target !== null) {
        target.scrollIntoView()
        return
      }
    }

    window.scrollTo(0, 0)
    // The policy only depends on the entry that was reached: `key` is enough
    // to identify it, the rest is read at the moment it is applied.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
}

/**
 * Provides the navigation context to the application.
 *
 * @example
 * <Router>
 *   <Routes>
 *     <Route path="/" element={<Home />} />
 *   </Routes>
 * </Router>
 */
export function Router({
  children,
  history: providedHistory,
  viewTransition = true,
}: RouterProps): ReactElement {
  const historyRef = useRef<RouterHistory | null>(providedHistory ?? null)
  historyRef.current ??=
    typeof window === 'undefined' ? createMemoryHistory() : createBrowserHistory()
  const history = historyRef.current

  const snapshot = useSyncExternalStore(
    history.subscribe,
    history.getSnapshot,
    history.getSnapshot,
  )
  const { location, navigationType } = snapshot

  const routesRef = useRef<readonly RouteObject[] | null>(null)
  const suppressScrollRef = useRef(false)
  const pathnameRef = useRef(location.pathname)
  pathnameRef.current = location.pathname

  const navigate = useCallback<NavigateFunction>(
    (to: To | number, options?: NavigateOptions) => {
      if (typeof to === 'number') {
        history.go(to)
        return
      }

      suppressScrollRef.current = options?.preventScrollReset === true

      const commit = (): void => {
        if (options?.replace === true) history.replace(to, options)
        else history.push(to, options)
      }

      const enabled = options?.viewTransition ?? viewTransition
      if (!enabled || !supportsViewTransitions() || prefersReducedMotion()) {
        commit()
        return
      }

      // The DOM must have changed when the callback of the transition hands
      // control back: `flushSync` forces React to commit synchronously, and
      // the preloading guarantees that no component will suspend during that
      // commit.
      const start = (): void => runViewTransition(() => flushSync(commit))

      const href = typeof to === 'string' ? to : createPath(to)
      const target = resolvePath(href, pathnameRef.current).pathname
      const routes = routesRef.current
      const pending = routes === null ? null : preloadRoutes(routes, target)

      if (pending === null) start()
      else void pending.then(start, start)
    },
    [history, viewTransition],
  )

  const navigationValue = useMemo<NavigationContextValue>(
    () => ({ history, navigate, routesRef, viewTransition }),
    [history, navigate, viewTransition],
  )

  // `before`: the history has changed, the new page has not rendered yet.
  // The subscription goes through the history and not through the render, so
  // as to cover a click, a `navigate` and a browser back the same way — the
  // latter never goes through `navigate`.
  useEffect(
    () =>
      history.subscribe(() => {
        const to = history.getSnapshot().location.pathname
        const from = pathnameRef.current
        if (to !== from) emitNavigation({ phase: 'before', from, to })
      }),
    [history],
  )

  // `after`: the new page has rendered. A passive effect runs after the
  // paint, which is the first instant where a measurement makes sense.
  const announced = useRef<string | null>(null)
  useEffect(() => {
    const to = location.pathname
    const from = announced.current
    announced.current = to
    if (from !== null && from !== to) emitNavigation({ phase: 'after', from, to })
  }, [location.pathname])

  useScrollTracking(history, location.key)
  useScrollPolicy(
    history,
    location.key,
    location.hash,
    navigationType === 'POP',
    suppressScrollRef,
  )

  return (
    <NavigationContext.Provider value={navigationValue}>
      <LocationContext.Provider value={location}>{children}</LocationContext.Provider>
    </NavigationContext.Provider>
  )
}
