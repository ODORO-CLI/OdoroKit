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
  // jsdom n'implemente pas le defilement : le routeur l'appelle a chaque
  // navigation, on le neutralise pour garder les tests silencieux.
  vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined)
})

/** Monte un arbre dans un `<Router>` adosse a un historique en memoire. */
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

describe('rendu des routes', () => {
  it('rend la route index de la racine', () => {
    renderAt(appRoutes, '/')
    expect(screen.getByRole('heading', { name: 'Accueil' })).toBeDefined()
  })

  it('rend le layout parent autour de la route fille', () => {
    renderAt(appRoutes, '/about')
    expect(screen.getByRole('navigation')).toBeDefined()
    expect(screen.getByRole('heading', { name: 'A propos' })).toBeDefined()
  })

  it('expose les parametres de route', () => {
    renderAt(appRoutes, '/users/42')
    expect(screen.getByText('Utilisateur 42')).toBeDefined()
  })

  it('rend une route catch-all imbriquee', () => {
    renderAt(appRoutes, '/docs/guide/intro')
    expect(screen.getByRole('heading', { name: 'Docs' })).toBeDefined()
  })

  it('rend la page 404 par defaut quand rien ne correspond', () => {
    renderAt(appRoutes, '/inconnu')
    expect(screen.getByRole('alert').textContent).toContain('404')
  })

  it('accepte une page 404 personnalisee', () => {
    renderAt(
      <Routes notFound={<p>Perdu</p>}>
        <Route path="/" element={<h1>Accueil</h1>} />
      </Routes>,
      '/inconnu',
    )
    expect(screen.getByText('Perdu')).toBeDefined()
  })

  it('rend un layout sans element de facon transparente', () => {
    renderAt(
      <Routes>
        <Route path="/">
          <Route index element={<p>Contenu</p>} />
        </Route>
      </Routes>,
    )
    expect(screen.getByText('Contenu')).toBeDefined()
  })

  it('traverse un fragment dans la declaration des routes', () => {
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

describe('navigation par Link', () => {
  it('navigue sans rechargement au clic', async () => {
    const { history } = renderAt(appRoutes, '/')
    screen.getByRole('link', { name: 'Profil' }).click()
    await waitFor(() => expect(screen.getByText('Utilisateur 42')).toBeDefined())
    expect(history.getSnapshot().location.pathname).toBe('/users/42')
  })

  it('produit un href reel', () => {
    renderAt(appRoutes, '/')
    expect(screen.getByRole('link', { name: 'Profil' }).getAttribute('href')).toBe(
      '/users/42',
    )
  })

  it('laisse le navigateur gerer un clic avec modificateur', () => {
    const { history } = renderAt(appRoutes, '/')
    const link = screen.getByRole('link', { name: 'Profil' })
    link.dispatchEvent(new MouseEvent('click', { bubbles: true, metaKey: true }))
    expect(history.getSnapshot().location.pathname).toBe('/')
  })

  it('laisse le navigateur gerer un lien avec target', () => {
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

describe('navigation programmatique', () => {
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

  it('empile une entree avec push', async () => {
    const { history } = renderAt(routes, '/')
    screen.getByRole('button', { name: 'Aller' }).click()
    await waitFor(() => expect(history.getSnapshot().location.pathname).toBe('/about'))
    expect(history.getSnapshot().navigationType).toBe('PUSH')
  })

  it('remplace l entree courante avec replace', async () => {
    const { history } = renderAt(routes, '/')
    screen.getByRole('button', { name: 'Remplacer' }).click()
    await waitFor(() => expect(history.getSnapshot().navigationType).toBe('REPLACE'))
  })

  it('revient en arriere avec un delta negatif', async () => {
    const { history } = renderAt(routes, '/')
    screen.getByRole('button', { name: 'Aller' }).click()
    await waitFor(() => expect(history.getSnapshot().location.pathname).toBe('/about'))

    screen.getByRole('button', { name: 'Retour' }).click()
    await waitFor(() => expect(history.getSnapshot().location.pathname).toBe('/'))
    expect(history.getSnapshot().navigationType).toBe('POP')
  })
})

describe('hooks', () => {
  it('useLocation expose pathname, search et hash', () => {
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

  it('useSearchParams lit et met a jour la chaine de requete', async () => {
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

  it('echoue avec un message explicite hors du Router', () => {
    function Orphan(): ReactElement {
      useLocation()
      return <p>jamais</p>
    }
    expect(() => render(<Orphan />)).toThrow(/<Router>/)
  })
})

describe('chargement paresseux', () => {
  it('affiche le fallback puis la page', async () => {
    const loader = vi.fn(() => Promise.resolve({ default: () => <h1>Chargee</h1> }))

    renderAt(
      <Routes fallback={<p>Chargement</p>}>
        <Route path="/" element={<p>Accueil</p>} />
        <Route path="/late" lazy={loader} />
      </Routes>,
      '/late',
    )

    expect(screen.getByText('Chargement')).toBeDefined()
    await waitFor(() =>
      expect(screen.getByRole('heading', { name: 'Chargee' })).toBeDefined(),
    )
    // Le module n'est demande qu'une fois, meme sous StrictMode.
    expect(loader).toHaveBeenCalledTimes(1)
  })
})

describe('Route hors contexte', () => {
  it('echoue si un Route est rendu directement', () => {
    expect(() => render(<Route path="/" />)).toThrow(/<Routes>/)
  })
})
