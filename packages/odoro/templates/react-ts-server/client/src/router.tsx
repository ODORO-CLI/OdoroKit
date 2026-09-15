/**
 * The router of the project.
 *
 * ## Why it lives alone, in its own file
 *
 * This is the only place that names the routing dependency. Switching routers,
 * adding a route, putting one behind authentication: it all reads here, and
 * `App.tsx` needs to know nothing beyond the line that imports it.
 *
 * ## Why the pages are passed in, and not imported
 *
 * This file could import the pages from `App.tsx`. The two modules would then
 * import each other: that works, but evaluation order becomes a question
 * nobody wants to answer the day something runs at module load.
 *
 * So the pages arrive as properties. The dependency only goes one way —
 * `App.tsx` knows the router, the router only knows React — and the route
 * table stays readable at a glance.
 *
 * @module
 */

import {
  Outlet,
  Route,
  // Aliased: the component exported below is the one the application sees, and
  // it takes the name `Router`.
  Router as RouterProvider,
  Routes,
  createMemoryHistory,
} from '@odoro-cli/libs/router'
import type { ReactElement, ReactNode } from 'react'

export { Link, useLocation } from '@odoro-cli/libs/router'

/** The pages the router places. */
export interface RouterProps {
  /** The common shell: navigation, content, footer. */
  readonly shell: (content: ReactNode) => ReactElement
  /** The home page. */
  readonly home: ReactElement
  /** The "About" page. */
  readonly about: ReactElement
  /** What shows when no route matches. */
  readonly notFound: ReactElement
  /**
   * The address to render, when there is no address bar.
   *
   * That is the case while prerendering: the page is made on the build
   * machine, where `window` does not exist and nothing says which route is
   * being asked for. The in-memory history takes over then.
   *
   * In the browser it stays absent and the router reads the real address.
   */
  readonly url?: string
}

/**
 * The route table.
 *
 * @example
 * <Router
 *   shell={(content) => <Shell>{content}</Shell>}
 *   home={<Home />}
 *   about={<About />}
 *   notFound={<NotFound />}
 * />
 */
export function Router({
  shell,
  home,
  about,
  notFound,
  url,
}: RouterProps): ReactElement {
  return (
    <RouterProvider
      history={url === undefined ? undefined : createMemoryHistory([url])}
    >
      <Routes>
        {/* `Outlet` marks the place where the current page renders: that is
            what keeps the navigation and the footer from being remounted on
            every route change. */}
        <Route path="/" element={shell(<Outlet />)}>
          <Route index element={home} />
          <Route path="about" element={about} />
          <Route path="*" element={notFound} />
        </Route>
      </Routes>
    </RouterProvider>
  )
}
