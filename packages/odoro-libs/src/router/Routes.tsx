/**
 * Declaration des routes en JSX et resolution du chemin courant.
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
 * Convertit un arbre d'elements `<Route>` en objets de route.
 *
 * Les enfants qui ne sont pas des `<Route>` sont ignores : cela permet
 * d'inserer des commentaires JSX ou des fragments conditionnels sans casser la
 * declaration.
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

    // Un fragment est traverse de facon transparente.
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

/** Page 404 minimale, utilisee quand aucune route ne correspond. */
function DefaultNotFound(): ReactElement {
  return (
    <main role="alert" style={{ padding: '2rem', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ margin: 0, fontSize: '1.5rem' }}>404</h1>
      <p style={{ marginTop: '0.5rem' }}>Cette page n&rsquo;existe pas.</p>
    </main>
  )
}

/** Proprietes de {@link Routes}. */
export interface RoutesProps {
  /** Elements `<Route>` decrivant l'arbre. */
  children: ReactNode
  /**
   * Contenu rendu lorsqu'aucune route ne correspond. Une route `path="*"`
   * declaree explicitement a la priorite sur cette valeur.
   */
  notFound?: ReactNode
  /** Fallback de Suspense pendant le chargement d'une route paresseuse. */
  fallback?: ReactNode
}

/**
 * Resout le chemin courant contre l'arbre de routes declare et rend la chaine
 * correspondante.
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

  // Publie l'arbre pour que `navigate` puisse precharger les routes
  // paresseuses avant de declencher une View Transition.
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
