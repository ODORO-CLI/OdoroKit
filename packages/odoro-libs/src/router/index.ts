/**
 * Routeur client d'Odoro.
 *
 * @example
 * import { Router, Routes, Route, Link, Outlet } from 'odoro-libs/router'
 *
 * <Router>
 *   <Routes>
 *     <Route path="/" element={<Layout />}>
 *       <Route index element={<Home />} />
 *       <Route path="users/:id" element={<User />} />
 *       <Route path="*" element={<NotFound />} />
 *     </Route>
 *   </Routes>
 * </Router>
 *
 * @module
 */

export { Link, type LinkProps } from './Link.jsx'
export { Outlet } from './Outlet.jsx'
export { Route, type RouteProps } from './Route.jsx'
export { Router, type RouterProps } from './Router.jsx'
export { Routes, type RoutesProps, createRoutesFromChildren } from './Routes.jsx'

export {
  useLocation,
  useMatches,
  useNavigate,
  useParams,
  useSearchParams,
  type SearchParamsInit,
  type SetSearchParams,
} from './hooks.js'

export type { NavigateFunction } from './context.js'

export {
  createBrowserHistory,
  createMemoryHistory,
  type HistorySnapshot,
  type NavigationType,
  type RouterHistory,
} from './history.js'

export { matchRoutes } from './matchRoutes.js'
export {
  CATCH_ALL_PARAM,
  compilePattern,
  comparePatternSpecificity,
  matchPattern,
  type CompiledPattern,
  type PathMatch,
  type SegmentKind,
} from './matcher.js'
export {
  createPath,
  joinPaths,
  normalizePathname,
  parsePath,
  resolvePath,
  type ParsedPath,
} from './path.js'

export { prefersReducedMotion, supportsViewTransitions } from './viewTransition.js'

export type {
  Location,
  NavigateOptions,
  RouteLazyLoader,
  RouteMatch,
  RouteObject,
  RouteParams,
  To,
} from './types.js'
