import { Link, Outlet, Route, Router, Routes, useLocation } from '@odoro/libs/router'

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
    <nav className="o-flex o-items-center o-gap-4 o-px-6 o-py-4 o-border-b o-border-zinc-200 dark:o-border-zinc-800">
      <span className="o-font-semibold o-text-brand-600 dark:o-text-brand-400">
        Odoro
      </span>
      {links.map((link) => (
        <Link
          key={link.to}
          to={link.to}
          className={
            pathname === link.to
              ? 'o-text-zinc-900 dark:o-text-zinc-50 o-font-medium o-no-underline'
              : 'o-text-zinc-500 dark:o-text-zinc-400 o-no-underline hover:o-text-zinc-900 dark:hover:o-text-zinc-50 o-transition'
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
      <footer className="o-px-6 o-py-6 o-text-sm o-text-zinc-500 dark:o-text-zinc-400 o-border-t o-border-zinc-200 dark:o-border-zinc-800">
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
