/**
 * Navigation history abstraction.
 *
 * Two implementations: `createBrowserHistory` (on top of the browser History
 * API) and `createMemoryHistory` (tests and server-side rendering). Both
 * expose the same subscription interface, compatible with
 * `useSyncExternalStore`.
 *
 * @module
 */

import { createPath, parsePath, resolvePath } from './path.js'
import type { Location, NavigateOptions, To } from './types.js'

/** Nature of the last navigation. */
export type NavigationType = 'PUSH' | 'REPLACE' | 'POP'

/** Observable snapshot of the history. */
export interface HistorySnapshot {
  /** Current location. */
  readonly location: Location
  /** How this location was reached. */
  readonly navigationType: NavigationType
}

/** Interface shared by the history implementations. */
export interface RouterHistory {
  /** Current snapshot. The reference only changes on navigation. */
  getSnapshot(): HistorySnapshot
  /**
   * Subscribes a listener to the changes. Returns the unsubscribe function.
   */
  subscribe(listener: () => void): () => void
  /** Pushes a new history entry. */
  push(to: To, options?: NavigateOptions): void
  /** Replaces the current entry. */
  replace(to: To, options?: NavigateOptions): void
  /** Moves the cursor inside the history stack. */
  go(delta: number): void
  /** Turns a target into an absolute URL within the application. */
  createHref(to: To): string
  /** Scroll position stored for a given entry key. */
  getScroll(key: string): number | undefined
  /** Stores a scroll position for an entry key. */
  setScroll(key: string, position: number): void
}

/** Key counter, enough to identify the entries of one session. */
let keyCounter = 0

function createKey(): string {
  keyCounter += 1
  return `${Date.now().toString(36)}-${keyCounter.toString(36)}`
}

/** Converts a navigation target into a string, resolved against `from`. */
function toHref(to: To, from: string): string {
  if (typeof to === 'string') return createPath(resolvePath(to, from))
  return createPath({
    pathname: to.pathname ? resolvePath(to.pathname, from).pathname : from,
    search: to.search ?? '',
    hash: to.hash ?? '',
  })
}

function createLocation(href: string, state: unknown, key: string): Location {
  const { pathname, search, hash } = parsePath(href)
  return { pathname, search, hash, state, key }
}

/** Shape of the `history.state` handled by the router. */
interface HistoryState {
  /** User state passed to `navigate(to, { state })`. */
  usr: unknown
  /** Key of the entry, stable when going back. */
  key: string
}

function isHistoryState(value: unknown): value is HistoryState {
  return typeof value === 'object' && value !== null && 'key' in value
}

/**
 * Base shared by both implementations: handling of the subscribers, of the
 * snapshot and of the scroll positions.
 */
function createHistoryCore(initial: HistorySnapshot): {
  snapshot: HistorySnapshot
  base: Pick<RouterHistory, 'getSnapshot' | 'subscribe' | 'getScroll' | 'setScroll'>
  emit: (next: HistorySnapshot) => void
} {
  const listeners = new Set<() => void>()
  const scrollPositions = new Map<string, number>()
  let snapshot = initial

  return {
    get snapshot() {
      return snapshot
    },
    base: {
      getSnapshot: () => snapshot,
      subscribe(listener) {
        listeners.add(listener)
        return () => listeners.delete(listener)
      },
      getScroll: (key) => scrollPositions.get(key),
      setScroll(key, position) {
        scrollPositions.set(key, position)
      },
    },
    emit(next) {
      snapshot = next
      for (const listener of listeners) listener()
    },
  }
}

/**
 * History backed by the browser History API.
 *
 * Disables the automatic restoration of the browser
 * (`history.scrollRestoration = 'manual'`): the router restores the position
 * itself after the new route has rendered, which the browser cannot do
 * correctly with content rendered in JavaScript.
 *
 * @example
 * const history = createBrowserHistory()
 * history.push('/about')
 */
export function createBrowserHistory(): RouterHistory {
  const globalHistory = window.history
  const globalLocation = window.location

  const existing = isHistoryState(globalHistory.state) ? globalHistory.state : undefined
  const key = existing?.key ?? createKey()
  if (existing === undefined) {
    globalHistory.replaceState({ usr: null, key } satisfies HistoryState, '')
  }

  if ('scrollRestoration' in globalHistory) {
    globalHistory.scrollRestoration = 'manual'
  }

  const core = createHistoryCore({
    location: createLocation(
      `${globalLocation.pathname}${globalLocation.search}${globalLocation.hash}`,
      existing?.usr ?? null,
      key,
    ),
    navigationType: 'POP',
  })

  window.addEventListener('popstate', () => {
    const state = isHistoryState(globalHistory.state) ? globalHistory.state : undefined
    core.emit({
      location: createLocation(
        `${globalLocation.pathname}${globalLocation.search}${globalLocation.hash}`,
        state?.usr ?? null,
        state?.key ?? createKey(),
      ),
      navigationType: 'POP',
    })
  })

  const navigate = (
    to: To,
    options: NavigateOptions | undefined,
    replace: boolean,
  ): void => {
    const href = toHref(to, core.snapshot.location.pathname)
    const nextKey = createKey()
    const state: HistoryState = { usr: options?.state ?? null, key: nextKey }

    // The position of the entry being left is stored before the DOM changes.
    core.base.setScroll(core.snapshot.location.key, window.scrollY)

    if (replace) globalHistory.replaceState(state, '', href)
    else globalHistory.pushState(state, '', href)

    core.emit({
      location: createLocation(href, state.usr, nextKey),
      navigationType: replace ? 'REPLACE' : 'PUSH',
    })
  }

  return {
    ...core.base,
    push: (to, options) => navigate(to, options, false),
    replace: (to, options) => navigate(to, options, true),
    go: (delta) => globalHistory.go(delta),
    createHref: (to) => toHref(to, core.snapshot.location.pathname),
  }
}

/**
 * In-memory history, with no DOM dependency.
 *
 * @param initialEntries Initial stack of URLs. The last one is the current
 *   entry.
 *
 * @example
 * const history = createMemoryHistory(['/users/42'])
 * history.getSnapshot().location.pathname // '/users/42'
 */
export function createMemoryHistory(
  initialEntries: readonly string[] = ['/'],
): RouterHistory {
  const entries: Location[] = (initialEntries.length > 0 ? initialEntries : ['/']).map(
    (entry) => createLocation(entry, null, createKey()),
  )
  let index = entries.length - 1

  // `index` is bounded by construction: `entries` holds at least one entry.
  const current = (): Location => entries[index] as Location

  const core = createHistoryCore({ location: current(), navigationType: 'POP' })

  const navigate = (
    to: To,
    options: NavigateOptions | undefined,
    replace: boolean,
  ): void => {
    const href = toHref(to, current().pathname)
    const location = createLocation(href, options?.state ?? null, createKey())
    if (replace) entries[index] = location
    else {
      entries.splice(index + 1, entries.length, location)
      index = entries.length - 1
    }
    core.emit({ location, navigationType: replace ? 'REPLACE' : 'PUSH' })
  }

  return {
    ...core.base,
    push: (to, options) => navigate(to, options, false),
    replace: (to, options) => navigate(to, options, true),
    go(delta) {
      const next = Math.min(Math.max(index + delta, 0), entries.length - 1)
      if (next === index) return
      index = next
      core.emit({ location: current(), navigationType: 'POP' })
    },
    createHref: (to) => toHref(to, current().pathname),
  }
}
