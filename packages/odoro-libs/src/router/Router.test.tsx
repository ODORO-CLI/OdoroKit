import { render, screen, waitFor } from '@testing-library/react'
import { StrictMode, type ReactElement } from 'react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Link } from './Link.jsx'
import { Outlet } from './Outlet.jsx'
import { Route } from './Route.jsx'
import { Router } from './Router.jsx'
import { Routes } from './Routes.jsx'
import { createMemoryHistory, type RouterHistory } from './history.js'
import { useLocation, useNavigate, useParams, useSearchParams } from './hooks.js'

beforeEach(() => {
  // jsdom does not implement scrolling: the router calls it on every
  // navigation, we neutralize it to keep the tests silent.
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
})

/** Mounts a tree in a `<Router>` backed by an in-memory history. */
function renderAt(ui: ReactElement, path = '/'): { history: RouterHistory } {
  const history = createMemoryHistory([path])
  render(
    <StrictMode>
      <Router history={history}>{ui}</Router>
    </StrictMode>,
  )
  return { history }
}

function Layout(): ReactElement {
  return (
    <div>
      <nav>
        <Link to="/">Accueil</Link>
        <Link to="/users/42">Profil</Link>
      </nav>
      <Outlet />
    </div>
  )
}

function UserDetail(): ReactElement {
  const { id } = useParams()
  return <p>Utilisateur {id}</p>
}

const appRoutes = (
  <Routes>
    <Route path="/" element={<Layout />}>
      <Route index element={<h1>Accueil</h1>} />
      <Route path="about" element={<h1>A propos</h1>} />
      <Route path="users/:id" element={<UserDetail />} />
      <Route path="docs/*" element={<h1>Docs</h1>} />
    </Route>
  </Routes>
)

describe('rendering of the routes', () => {
  it('renders the index route of the root', () => {
    renderAt(appRoutes, '/')
    expect(screen.getByRole('heading', { name: 'Accueil' })).toBeDefined()
  })

  it('renders the parent layout around the child route', () => {
    renderAt(appRoutes, '/about')
    expect(screen.getByRole('navigation')).toBeDefined()
    expect(screen.getByRole('heading', { name: 'A propos' })).toBeDefined()
  })

  it('exposes the route parameters', () => {
    renderAt(appRoutes, '/users/42')
    expect(screen.getByText('Utilisateur 42')).toBeDefined()
  })

  it('renders a nested catch-all route', () => {
    renderAt(appRoutes, '/docs/guide/intro')
    expect(screen.getByRole('heading', { name: 'Docs' })).toBeDefined()
  })

  it('renders the default 404 page when nothing matches', () => {
    renderAt(appRoutes, '/inconnu')
    expect(screen.getByRole('alert').textContent).toContain('404')
  })

  it('accepts a custom 404 page', () => {
    renderAt(
      <Routes notFound={<p>Perdu</p>}>
        <Route path="/" element={<h1>Accueil</h1>} />
      </Routes>,
      '/inconnu',
    )
    expect(screen.getByText('Perdu')).toBeDefined()
  })

  it('renders a layout without an element transparently', () => {
    renderAt(
      <Routes>
        <Route path="/">
          <Route index element={<p>Contenu</p>} />
        </Route>
      </Routes>,
    )
    expect(screen.getByText('Contenu')).toBeDefined()
  })

  it('traverses a fragment in the route declaration', () => {
    renderAt(
      <Routes>
        <>
          <Route path="/" element={<p>Racine</p>} />
        </>
      </Routes>,
    )
    expect(screen.getByText('Racine')).toBeDefined()
  })
})

describe('navigation through Link', () => {
  it('navigates without a reload on click', async () => {
    const { history } = renderAt(appRoutes, '/')
    screen.getByRole('link', { name: 'Profil' }).click()
    await waitFor(() => expect(screen.getByText('Utilisateur 42')).toBeDefined())
    expect(history.getSnapshot().location.pathname).toBe('/users/42')
  })

  it('produces a real href', () => {
    renderAt(appRoutes, '/')
    expect(screen.getByRole('link', { name: 'Profil' }).getAttribute('href')).toBe(
      '/users/42',
    )
  })

  it('lets the browser handle a click with a modifier', () => {
    const { history } = renderAt(appRoutes, '/')
    const link = screen.getByRole('link', { name: 'Profil' })
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, metaKey: true }))
    expect(history.getSnapshot().location.pathname).toBe('/')
  })

  it('lets the browser handle a link with a target', () => {
    const { history } = renderAt(
      <Routes>
        <Route
          path="/"
          element={
            <Link to="/about" target="_blank">
              Externe
            </Link>
          }
        />
        <Route path="/about" element={<p>A propos</p>} />
      </Routes>,
    )
    screen.getByRole('link', { name: 'Externe' }).click()
    expect(history.getSnapshot().location.pathname).toBe('/')
  })
})

describe('programmatic navigation', () => {
  function Controls(): ReactElement {
    const navigate = useNavigate()
    return (
      <div>
        <button onClick={() => navigate('/about')}>Aller</button>
        <button onClick={() => navigate('/about', { replace: true })}>Remplacer</button>
        <button onClick={() => navigate(-1)}>Retour</button>
      </div>
    )
  }

  const routes = (
    <Routes>
      <Route path="/" element={<Controls />} />
      <Route path="/about" element={<Controls />} />
    </Routes>
  )

  it('pushes an entry with push', async () => {
    const { history } = renderAt(routes, '/')
    screen.getByRole('button', { name: 'Aller' }).click()
    await waitFor(() => expect(history.getSnapshot().location.pathname).toBe('/about'))
    expect(history.getSnapshot().navigationType).toBe('PUSH')
  })

  it('replaces the current entry with replace', async () => {
    const { history } = renderAt(routes, '/')
    screen.getByRole('button', { name: 'Remplacer' }).click()
    await waitFor(() => expect(history.getSnapshot().navigationType).toBe('REPLACE'))
  })

  it('goes back with a negative delta', async () => {
    const { history } = renderAt(routes, '/')
    screen.getByRole('button', { name: 'Aller' }).click()
    await waitFor(() => expect(history.getSnapshot().location.pathname).toBe('/about'))

    screen.getByRole('button', { name: 'Retour' }).click()
    await waitFor(() => expect(history.getSnapshot().location.pathname).toBe('/'))
    expect(history.getSnapshot().navigationType).toBe('POP')
  })
})

describe('hooks', () => {
  it('useLocation exposes pathname, search and hash', () => {
    function Probe(): ReactElement {
      const location = useLocation()
      return <p>{`${location.pathname}|${location.search}|${location.hash}`}</p>
    }
    renderAt(
      <Routes>
        <Route path="/blog" element={<Probe />} />
      </Routes>,
      '/blog?page=2#top',
    )
    expect(screen.getByText('/blog|?page=2|#top')).toBeDefined()
  })

  it('useSearchParams reads and updates the query string', async () => {
    function Filters(): ReactElement {
      const [params, setParams] = useSearchParams()
      return (
        <button onClick={() => setParams({ page: '2' })}>
          page={params.get('page') ?? '1'}
        </button>
      )
    }
    const { history } = renderAt(
      <Routes>
        <Route path="/blog" element={<Filters />} />
      </Routes>,
      '/blog',
    )

    expect(screen.getByRole('button', { name: 'page=1' })).toBeDefined()
    screen.getByRole('button').click()
    await waitFor(() => expect(history.getSnapshot().location.search).toBe('?page=2'))
    expect(screen.getByRole('button', { name: 'page=2' })).toBeDefined()
  })

  it('fails with an explicit message outside of the Router', () => {
    function Orphan(): ReactElement {
      useLocation()
      return <p>jamais</p>
    }
    expect(() => render(<Orphan />)).toThrow(/<Router>/)
  })
})

describe('lazy loading', () => {
  it('shows the fallback then the page', async () => {
    const loader = vi.fn(() => Promise.resolve({ default: () => <h1>Chargee</h1> }))

    renderAt(
      <Routes fallback={<p>Loading</p>}>
        <Route path="/" element={<p>Accueil</p>} />
        <Route path="/late" lazy={loader} />
      </Routes>,
      '/late',
    )

    expect(screen.getByText('Loading')).toBeDefined()
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Chargee' })).toBeDefined(),
    )
    // The module is only requested once, even under StrictMode.
    expect(loader).toHaveBeenCalledTimes(1)
  })
})

describe('Route outside of its context', () => {
  it('fails when a Route is rendered directly', () => {
    expect(() => render(<Route path="/" />)).toThrow(/<Routes>/)
  })
})
