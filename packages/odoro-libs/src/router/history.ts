/**
 * Abstraction d'historique de navigation.
 *
 * Deux implementations : `createBrowserHistory` (au-dessus de l'API History du
 * navigateur) et `createMemoryHistory` (tests et rendu serveur). Les deux
 * exposent la meme interface d'abonnement, compatible `useSyncExternalStore`.
 *
 * @module
 */

import { createPath, parsePath, resolvePath } from './path.js'
import type { Location, NavigateOptions, To } from './types.js'

/** Nature de la derniere navigation. */
export type NavigationType = 'PUSH' | 'REPLACE' | 'POP'

/** Instantane observable de l'historique. */
export interface HistorySnapshot {
  /** Emplacement courant. */
  readonly location: Location
  /** Comment cet emplacement a ete atteint. */
  readonly navigationType: NavigationType
}

/** Interface commune aux implementations d'historique. */
export interface RouterHistory {
  /** Instantane courant. La reference ne change qu'a la navigation. */
  getSnapshot(): HistorySnapshot
  /**
   * Abonne un ecouteur aux changements. Retourne la fonction de desabonnement.
   */
  subscribe(listener: () => void): () => void
  /** Empile une nouvelle entree d'historique. */
  push(to: To, options?: NavigateOptions): void
  /** Remplace l'entree courante. */
  replace(to: To, options?: NavigateOptions): void
  /** Deplace le curseur dans la pile d'historique. */
  go(delta: number): void
  /** Transforme une cible en URL absolue au sein de l'application. */
  createHref(to: To): string
  /** Position de defilement memorisee pour une cle d'entree donnee. */
  getScroll(key: string): number | undefined
  /** Memorise une position de defilement pour une cle d'entree. */
  setScroll(key: string, position: number): void
}

/** Compteur de cles, suffisant pour identifier les entrees d'une session. */
let keyCounter = 0

function createKey(): string {
  keyCounter += 1
  return `${Date.now().toString(36)}-${keyCounter.toString(36)}`
}

/** Convertit une cible de navigation en chaine, resolue contre `from`. */
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

/** Forme du `history.state` gere par le routeur. */
interface HistoryState {
  /** Etat utilisateur passe a `navigate(to, { state })`. */
  usr: unknown
  /** Cle de l'entree, stable au retour arriere. */
  key: string
}

function isHistoryState(value: unknown): value is HistoryState {
  return typeof value === 'object' && value !== null && 'key' in value
}

/**
 * Socle commun aux deux implementations : gestion des abonnes, de l'instantane
 * et des positions de defilement.
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
 * Historique adosse a l'API History du navigateur.
 *
 * Desactive la restauration automatique du navigateur
 * (`history.scrollRestoration = 'manual'`) : le routeur restaure lui-meme la
 * position apres le rendu de la nouvelle route, ce que le navigateur ne peut
 * pas faire correctement avec du contenu rendu en JavaScript.
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

    // La position de l'entree quittee est memorisee avant que le DOM ne change.
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
 * Historique en memoire, sans dependance au DOM.
 *
 * @param initialEntries Pile initiale d'URL. La derniere est l'entree courante.
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

  // `index` est borne par construction : `entries` contient au moins une entree.
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
