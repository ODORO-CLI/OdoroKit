import { Link, Outlet, Route, Router, Routes, useLocation } from 'odoro-libs/router'

import { About } from '@/routes/About'
import { Home } from '@/routes/Home'
import { NotFound } from '@/routes/NotFound'

/** Barre de navigation, avec mise en valeur de la route courante. */
function Nav() {
  const { pathname } = useLocation()

  const links = [
    { to: '/', label: 'Accueil' },
    { to: '/a-propos', label: 'A propos' },
  ]

  return (
    <nav className="o-flex o-items-center o-gap-4 o-px-6 o-py-4 o-border-b o-border-border">
      <span className="o-font-semibold o-text-primary">Odoro</span>
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className={
            pathname === link.to
              ? 'o-text-fg o-font-medium o-no-underline'
              : 'o-text-fg-muted o-no-underline hover:o-text-fg o-transition'
          }
        >
          {link.label}
        </Link>
      ))}
    </nav>
  )
}

/** Enveloppe commune a toutes les pages. */
function Layout() {
  return (
    <div className="app-shell">
      <Nav />
      <main className="o-view-transition-page o-mx-auto o-w-full o-max-w-3xl o-px-6 o-py-12">
        <Outlet />
      </main>
      <footer className="o-px-6 o-py-6 o-text-sm o-text-fg-muted o-border-t o-border-border">
        Construit avec Odoro.
      </footer>
    </div>
  )
}

/** Racine de l'application. */
export function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="a-propos" element={<About />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Router>
  )
}
