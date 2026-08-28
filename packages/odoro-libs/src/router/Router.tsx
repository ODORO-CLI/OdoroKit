/**
 * Composant racine du routeur.
 *
 * Il possede l'historique, publie l'emplacement courant, orchestre les View
 * Transitions et restaure la position de defilement.
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
import { preloadRoutes } from './lazy.js'
import { createPath, resolvePath } from './path.js'
import type { NavigateOptions, RouteObject, To } from './types.js'
import {
  prefersReducedMotion,
  runViewTransition,
  supportsViewTransitions,
} from './viewTransition.js'

/** Proprietes de {@link Router}. */
export interface RouterProps {
  /** Arbre de l'application. */
  children: ReactNode
  /**
   * Historique a utiliser. Par defaut, l'historique du navigateur — ou un
   * historique en memoire lorsque `window` n'existe pas (rendu serveur).
   */
  history?: RouterHistory
  /**
   * Active les View Transitions pour toutes les navigations. Chaque `<Link>`
   * ou appel a `navigate` peut deroger a ce reglage.
   *
   * @defaultValue true
   */
  viewTransition?: boolean
}

/**
 * Enregistre en continu la position de defilement de l'entree d'historique
 * courante, afin de pouvoir la restaurer au retour arriere.
 *
 * L'ecriture est amortie par `requestAnimationFrame` : au plus une par frame.
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
 * Applique la politique de defilement apres chaque navigation : restauration
 * au retour arriere, ancre si l'URL en contient une, haut de page sinon.
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
    // La politique ne depend que de l'entree atteinte : `key` suffit a
    // l'identifier, le reste est lu au moment de l'application.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])
}

/**
 * Fournit le contexte de navigation a l'application.
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

      // Le DOM doit avoir change quand le callback de la transition rend la
      // main : `flushSync` force React a commiter de facon synchrone, et le
      // prechargement garantit qu'aucun composant ne suspendra pendant ce
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
