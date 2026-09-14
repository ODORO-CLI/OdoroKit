import { Link, Outlet, Route, Router, Routes, useLocation } from '@odoro-cli/libs/router'
import type { ReactElement } from 'react'

import { Marque } from '@/composants/Marque'
import { About } from '@/routes/About'
import { Home } from '@/routes/Home'
import { NotFound } from '@/routes/NotFound'

/** Les entrees de la navigation. */
const LIENS = [
  { to: '/', label: 'Accueil' },
  { to: '/a-propos', label: 'A propos' },
]

/**
 * La barre de navigation.
 *
 * Elle flotte sur le fond plutot que de le couper : un filet clair et un flou
 * d'arriere-plan suffisent a la detacher, et la nappe de couleur continue de
 * passer dessous.
 */
function Nav(): ReactElement {
  const { pathname } = useLocation()

  return (
    <nav className="o-sticky o-top-0 o-z-20 o-border-b o-border-zinc-200/70 dark:o-border-zinc-800/70 o-bg-white/70 dark:o-bg-zinc-950/70 o-backdrop-blur">
      <div className="o-mx-auto o-flex o-w-full o-max-w-5xl o-items-center o-gap-6 o-px-6 o-py-4">
        <Link to="/" className="o-no-underline o-text-zinc-900 dark:o-text-zinc-50">
          <Marque />
        </Link>

        <div className="o-flex o-items-center o-gap-5 o-text-sm">
          {LIENS.map((lien) => (
            <Link
              key={lien.to}
              to={lien.to}
              className={
                pathname === lien.to
                  ? 'o-font-medium o-text-zinc-900 dark:o-text-zinc-50 o-no-underline'
                  : 'o-text-zinc-500 dark:o-text-zinc-400 o-no-underline hover:o-text-zinc-900 dark:hover:o-text-zinc-50 o-transition'
              }
            >
              {lien.label}
            </Link>
          ))}
        </div>

        <a
          href="https://odoro.dev"
          target="_blank"
          rel="noreferrer"
          className="o-ml-auto o-text-sm o-text-zinc-500 dark:o-text-zinc-400 o-no-underline hover:o-text-brand-500"
        >
          odoro.dev
        </a>
      </div>
    </nav>
  )
}

/** L'enveloppe commune a toutes les pages. */
function Layout(): ReactElement {
  return (
    <div className="app-shell">
      <Nav />
      {/* `relative` porte le fond decoratif, qui se place en absolu dedans. */}
      <main className="o-relative o-view-transition-page">
        <Outlet />
      </main>
      <footer className="o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-px-6 o-py-8">
        <div className="o-mx-auto o-flex o-w-full o-max-w-5xl o-items-center o-justify-between o-gap-4 o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
          <Marque />
          <span>Construit avec Odoro.</span>
        </div>
      </footer>
    </div>
  )
}

/** Racine de l'application. */
export function App(): ReactElement {
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
