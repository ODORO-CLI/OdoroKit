import { Link, Outlet, Route, Router, Routes, useLocation } from 'odoro-libs/router'

import { Composants } from './routes/Composants.jsx'
import { Mouvement } from './routes/Mouvement.jsx'
import { Palette } from './routes/Palette.jsx'
import { Routage } from './routes/Routage.jsx'

/** Sections du bac a sable. */
const SECTIONS = [
  { to: '/', label: 'Composants' },
  { to: '/mouvement', label: 'Mouvement' },
  { to: '/palette', label: 'Palette' },
  { to: '/routage/42', label: 'Routage' },
]

/** Enveloppe commune : navigation et zone de contenu. */
function Layout() {
  const { pathname } = useLocation()

  return (
    <div className="o-flex o-flex-col o-gap-0">
      <header className="o-flex o-items-center o-gap-4 o-px-6 o-py-4 o-border-b o-border-border">
        <span className="o-font-semibold o-text-primary">odoro-libs</span>
        <nav className="o-flex o-gap-3">
          {SECTIONS.map((section) => (
            <Link
              key={section.to}
              to={section.to}
              className={
                pathname === section.to
                  ? 'o-text-fg o-font-medium o-no-underline'
                  : 'o-text-fg-muted o-no-underline hover:o-text-fg o-transition'
              }
            >
              {section.label}
            </Link>
          ))}
        </nav>
      </header>
      <main className="o-view-transition-page o-mx-auto o-w-full o-max-w-4xl o-px-6 o-py-10">
        <Outlet />
      </main>
    </div>
  )
}

/** Racine du bac a sable. */
export function App() {
  return (
    <Router>
      <Routes fallback={<p className="o-text-fg-muted">Chargement...</p>}>
        <Route path="/" element={<Layout />}>
          <Route index element={<Composants />} />
          <Route path="mouvement" element={<Mouvement />} />
          <Route path="palette" element={<Palette />} />
          <Route path="routage/:id" element={<Routage />} />
          <Route path="*" element={<p>Route inconnue.</p>} />
        </Route>
      </Routes>
    </Router>
  )
}
