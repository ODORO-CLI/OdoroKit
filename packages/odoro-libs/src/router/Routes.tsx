/**
 * Declaration of the routes in JSX and resolution of the current path.
 *
 * @module
 */

import {
  Children,
  Fragment,
  type ReactElement,
  type ReactNode,
  Suspense,
  isValidElement,
  useContext,
  useLayoutEffect,
  useMemo,
} from 'react'

import { NavigationContext } from './context.js'
import { matchRoutes } from './matchRoutes.js'
import { RenderMatches } from './render.jsx'
import { Route, type RouteProps } from './Route.js'
import type { RouteObject } from './types.js'
import { useLocation } from './hooks.js'

/**
 * Converts a tree of `<Route>` elements into route objects.
 *
 * Children that are not `<Route>` are ignored: this allows inserting JSX
 * comments or conditional fragments without breaking the declaration.
 *
 * @example
 * createRoutesFromChildren(
 *   <Route path="/" element={<Home />} />,
 * ) // [{ path: '/', element: <Home /> }]
 */
export function createRoutesFromChildren(children: ReactNode): RouteObject[] {
  const routes: RouteObject[] = []

  Children.forEach(children, (child) => {
    if (!isValidElement(child)) return

    // A fragment is traversed transparently.
    if (child.type === Fragment) {
      const props = child.props as { children?: ReactNode }
      routes.push(...createRoutesFromChildren(props.children))
      return
    }

    if (child.type !== Route) return

    const props = child.props as RouteProps
    const route: RouteObject = {}
    if (props.path !== undefined) route.path = props.path
    if (props.index !== undefined) route.index = props.index
    if (props.element !== undefined) route.element = props.element
    if (props.lazy !== undefined) route.lazy = props.lazy
    if (props.children !== undefined) {
      route.children = createRoutesFromChildren(props.children)
    }

    routes.push(route)
  })

  return routes
}

/** Minimal 404 page, used when no route matches. */
function DefaultNotFound(): ReactElement {
  return (
    <main role="alert" style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ margin: 0, fontSize: '1.5rem' }}>404</h1>
      <p style={{ marginTop: '0.5rem' }}>This page does not exist.</p>
    </main>
  )
}

/** Props of {@link Routes}. */
export interface RoutesProps {
  /** `<Route>` elements describing the tree. */
  children: ReactNode
  /**
   * Content rendered when no route matches. A `path="*"` route declared
   * explicitly takes priority over this value.
   */
  notFound?: ReactNode
  /** Suspense fallback while a lazy route is loading. */
  fallback?: ReactNode
}

/**
 * Resolves the current path against the declared route tree and renders the
 * matching chain.
 *
 * @example
 * <Routes fallback={<Spinner />}>
 *   <Route path="/" element={<Layout />}>
 *     <Route index element={<Home />} />
 *     <Route path="about" lazy={() => import('./About')} />
 *   </Route>
 * </Routes>
 */
export function Routes({
  children,
  notFound,
  fallback = null,
}: RoutesProps): ReactElement {
  const location = useLocation()
  const navigation = useContext(NavigationContext)
  const routes = useMemo(() => createRoutesFromChildren(children), [children])

  // Publishes the tree so that `navigate` can preload the lazy routes before
  // starting a View Transition.
  const routesRef = navigation?.routesRef
  useLayoutEffect(() => {
    if (routesRef === undefined) return
    routesRef.current = routes
    return () => {
      if (routesRef.current === routes) routesRef.current = null
    }
  }, [routesRef, routes])

  const matches = useMemo(
    () => matchRoutes(routes, location.pathname),
    [routes, location.pathname],
  )

  if (matches === null) return <>{notFound ?? <DefaultNotFound />}</>

  return (
    <Suspense fallback={fallback}>
      <RenderMatches matches={matches} depth={0} />
    </Suspense>
  )
}
