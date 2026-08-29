/**
 * Coquille du site de documentation : barre superieure fixe en verre depoli,
 * navigation laterale collante, panneau mobile et palette de recherche.
 *
 * @module
 */

import { type ReactElement, type ReactNode, useEffect, useState } from 'react'
import { Link, useLocation } from 'odoro-libs/router'

import { DOC_SECTIONS, type DocPage } from '../registry.js'
import { SearchDialog } from './SearchDialog.jsx'
import { ThemeToggle } from './ThemeToggle.jsx'

/** Hauteur de la barre superieure : 4rem, partagee par les calages `top`. */
const HEADER_OFFSET = '4rem'

/** Logo Odoro, en degrade de la teinte de marque vers l'accent. */
function Logo(): ReactElement {
  return (
    <Link
      to="/"
      className="o-inline-flex o-items-baseline o-gap-1 o-no-underline o-shrink-0"
    >
      <span className="o-text-xl o-font-extrabold o-tracking-tight o-text-gradient o-bg-gradient-to-r o-from-brand-600 dark:o-from-brand-400 o-to-fuchsia-600 dark:o-to-fuchsia-400">
        Odoro
      </span>
      <span className="o-text-xs o-font-mono o-text-zinc-400 dark:o-text-zinc-500">
        docs
      </span>
    </Link>
  )
}

/** Un lien de navigation, actif ou non. */
function NavLink({
  page,
  onNavigate,
}: {
  page: DocPage
  onNavigate?: () => void
}): ReactElement {
  const { pathname } = useLocation()
  const active = pathname === page.path

  return (
    <Link
      to={page.path}
      aria-current={active ? 'page' : undefined}
      onClick={onNavigate}
      className={`o-rounded-md o-px-3 o-py-1.5 o-text-sm o-no-underline o-transition-colors ${
        active
          ? 'o-bg-brand-50 dark:o-bg-brand-950 o-text-brand-600 dark:o-text-brand-400 o-font-medium'
          : 'o-text-zinc-500 dark:o-text-zinc-400 hover:o-text-zinc-900 dark:hover:o-text-zinc-50 hover:o-bg-zinc-50 dark:hover:o-bg-zinc-800'
      }`}
    >
      {page.title}
    </Link>
  )
}

/**
 * Liens de navigation, sections et sous-groupes.
 *
 * Les sous-groupes portent un titre plus discret que les sections : deux
 * niveaux de reperes dans une colonne etroite ne se distinguent que si le
 * second s'efface nettement devant le premier.
 */
function SectionLinks({ onNavigate }: { onNavigate?: () => void }): ReactElement {
  return (
    <nav aria-label="Documentation" className="o-flex o-flex-col o-gap-6">
      {DOC_SECTIONS.map((section) => (
        <div key={section.title} className="o-flex o-flex-col o-gap-1">
          <p className="o-text-xs o-font-semibold o-uppercase o-tracking-wider o-text-zinc-400 dark:o-text-zinc-500 o-px-3 o-mb-1">
            {section.title}
          </p>

          {(section.pages ?? []).map((page) => (
            <NavLink key={page.path} page={page} onNavigate={onNavigate} />
          ))}

          {(section.groups ?? []).map((group) => (
            <div
              key={group.title}
              className="o-flex o-flex-col o-gap-1 o-mt-2 first:o-mt-0"
            >
              <p className="o-px-3 o-text-xs o-font-medium o-text-zinc-400 dark:o-text-zinc-600 o-opacity-80">
                {group.title}
              </p>
              {group.pages.map((page) => (
                <NavLink key={page.path} page={page} onNavigate={onNavigate} />
              ))}
            </div>
          ))}
        </div>
      ))}
    </nav>
  )
}

/** Coquille commune a toutes les pages. */
export function Shell({ children }: { children?: ReactNode }): ReactElement {
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()

  // Ctrl+K / Cmd+K ouvre la recherche depuis n'importe ou.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent): void => {
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setSearchOpen((open) => !open)
      }
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [])

  // Changer de page ferme le panneau mobile et remonte en haut.
  useEffect(() => {
    setMenuOpen(false)
    window.scrollTo({ top: 0 })
  }, [pathname])

  return (
    <div className="o-min-h-screen o-bg-white dark:o-bg-zinc-950 o-text-zinc-900 dark:o-text-zinc-50">
      <header className="o-fixed o-top-0 o-inset-x-0 o-z-sticky o-glass dark:o-glass-dark o-border-b o-border-zinc-200 dark:o-border-zinc-800">
        <div className="o-mx-auto o-max-w-7xl o-h-16 o-flex o-items-center o-gap-4 o-px-4 md:o-px-6">
          <button
            type="button"
            aria-label={menuOpen ? 'Fermer la navigation' : 'Ouvrir la navigation'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="lg:o-hidden o-inline-flex o-items-center o-justify-center o-size-9 o-rounded-md o-text-zinc-500 dark:o-text-zinc-400 hover:o-text-zinc-900 dark:hover:o-text-zinc-50 hover:o-bg-zinc-50 dark:hover:o-bg-zinc-800 o-transition-colors o-cursor-pointer"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
              focusable="false"
            >
              {menuOpen ? (
                <path d="M6 6l12 12M18 6L6 18" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
          </button>

          <Logo />

          <div className="o-flex-1" />

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="o-inline-flex o-items-center o-gap-2 o-h-9 o-rounded-md o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-900 o-px-3 o-text-sm o-text-zinc-400 dark:o-text-zinc-500 hover:o-border-zinc-300 dark:hover:o-border-zinc-700 o-transition-colors o-cursor-pointer"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
              focusable="false"
            >
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <span className="max-md:o-hidden">Rechercher...</span>
            <kbd className="max-md:o-hidden o-text-xs o-font-mono o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-rounded-sm o-px-1.5 o-py-0.5 o-bg-zinc-100 dark:o-bg-zinc-950">
              Ctrl K
            </kbd>
          </button>

          <ThemeToggle />
        </div>
      </header>

      <div
        className="o-mx-auto o-max-w-7xl o-flex o-px-4 md:o-px-6"
        style={{ paddingTop: HEADER_OFFSET }}
      >
        <aside
          className="max-lg:o-hidden o-sticky o-w-64 o-shrink-0 o-overflow-y-auto o-py-8 o-pr-6 o-border-r o-border-zinc-100 dark:o-border-zinc-900"
          style={{ top: HEADER_OFFSET, height: `calc(100dvh - ${HEADER_OFFSET})` }}
        >
          <SectionLinks />
        </aside>

        <main className="o-flex-1 o-min-w-0 o-py-10 lg:o-pl-10 o-view-transition-page">
          {children}
        </main>
      </div>

      {menuOpen ? (
        <div
          className="lg:o-hidden o-fixed o-inset-0 o-z-overlay"
          style={{ paddingTop: HEADER_OFFSET }}
        >
          <div
            className="o-absolute o-inset-0 o-bg-black-45 dark:o-bg-black-65"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="o-relative o-h-full o-w-72 o-max-w-full o-bg-white dark:o-bg-zinc-900 o-shadow-xl o-overflow-y-auto o-p-4 o-animate-slide-in-left o-animate-duration-fast">
            <SectionLinks onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      ) : null}

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
