/**
 * Coquille du site de documentation.
 *
 * La barre superieure porte l'identite, la navigation de premier niveau, la
 * recherche et le theme — soulignee d'un fil de progression de lecture. La
 * colonne laterale est une arborescence a deux niveaux : des categories
 * repliables, et leurs pages accrochees a une ligne de guidage dont le
 * segment actif prend la couleur de la marque.
 *
 * @module
 */

import {
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Icon, type IconData } from '@odoro/icons'
import {
  Anchor,
  Circle,
  Cpu,
  Image as ImageIcon,
  LayoutGrid,
  LayoutTemplate,
  Layers,
  Package,
  Rocket,
  Route,
  Shapes,
  Sparkles,
  Type,
  Wand,
  Waves,
  Zap,
} from '@odoro/icons/filaire'
import { Link, useLocation } from '@odoro/libs/router'
import { useScrollProgress } from '@odoro/libs/motion'

import { DOC_SECTIONS, type DocPage, type DocSection, sectionPages } from '../registry.js'
import { SearchDialog } from './SearchDialog.jsx'
import { ThemeToggle } from './ThemeToggle.jsx'

/** Hauteur de la barre superieure : 4rem, partagee par les calages `top`. */
const HEADER_OFFSET = '4rem'

/** Cle de persistance de l'etat replie/deplie des categories. */
const ASIDE_STORAGE_KEY = 'odoro-docs-aside'

/* -------------------------------------------------------------------------- */
/* Icones                                                                     */
/* -------------------------------------------------------------------------- */

/**
 * Icone de chaque categorie de la colonne laterale.
 *
 * Ces traces etaient ecrits a la main, un `<svg>` par categorie, dans un
 * `switch` de quatre-vingts lignes. Chaque nouvelle section du registre — et
 * il s'en est ajoute cinq — tombait sur le cas par defaut : un rond.
 *
 * Le site emploie desormais son propre module d'icones. C'est aussi la seule
 * facon honnete de savoir s'il tient : le premier consommateur de `@odoro/icons`
 * doit etre nous.
 */
const SECTION_ICONS: Readonly<Record<string, IconData>> = {
  Demarrage: Rocket,
  Fondations: Layers,
  Routeur: Route,
  Composants: LayoutGrid,
  Icones: Shapes,
  Backgrounds: Waves,
  Heros: Sparkles,
  'Text Animations': Type,
  Effets: Wand,
  Images: ImageIcon,
  Sections: LayoutTemplate,
  Hooks: Anchor,
  Motions: Zap,
  Moteur: Cpu,
  Registre: Package,
}

/** Icone d'une categorie, ou un rond pour celle qu'on aurait oubliee. */
function SectionIcon({ title }: { title: string }): ReactElement {
  // 1.8 plutot que le 2 du jeu : a quinze pixels, le trait nominal empate les
  // traces les plus denses.
  return <Icon icon={SECTION_ICONS[title] ?? Circle} size={15} strokeWidth={1.8} />
}

/* -------------------------------------------------------------------------- */
/* Colonne laterale                                                           */
/* -------------------------------------------------------------------------- */

/** Etat replie/deplie memorise, ou tout ouvert par defaut. */
function storedOpenSections(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(ASIDE_STORAGE_KEY)
    if (raw !== null) return JSON.parse(raw) as Record<string, boolean>
  } catch {
    // Stockage indisponible : l'etat vivra le temps de la session.
  }
  return {}
}

/** Une page de la colonne, accrochee a la ligne de guidage. */
function ItemLink({
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
      className={`o-block o-border-l o-pl-3 o-py-1.5 o-text-sm o-no-underline o-rounded-r-md o-transition-colors ${
        active
          ? 'o-border-brand-600 dark:o-border-brand-400 o-bg-brand-50 dark:o-bg-brand-950 o-text-brand-600 dark:o-text-brand-400 o-font-medium'
          : 'o-border-zinc-200 dark:o-border-zinc-800 o-text-zinc-500 dark:o-text-zinc-400 hover:o-text-zinc-900 dark:hover:o-text-zinc-50 hover:o-border-zinc-400 dark:hover:o-border-zinc-600 hover:o-bg-zinc-50 dark:hover:o-bg-zinc-900'
      }`}
    >
      {page.title}
    </Link>
  )
}

/** Une categorie repliable : en-tete a icone, pages et sous-groupes. */
function SectionBlock({
  section,
  open,
  onToggle,
  onNavigate,
}: {
  section: DocSection
  open: boolean
  onToggle: () => void
  onNavigate?: () => void
}): ReactElement {
  const regionId = `aside-${section.title.replace(/\s+/g, '-').toLowerCase()}`

  return (
    <div>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={regionId}
        onClick={onToggle}
        className="o-w-full o-flex o-items-center o-gap-2 o-rounded-md o-px-2 o-py-1.5 o-text-sm o-font-semibold o-text-zinc-900 dark:o-text-zinc-50 hover:o-bg-zinc-50 dark:hover:o-bg-zinc-900 o-transition-colors o-cursor-pointer"
      >
        <span className="o-inline-flex o-items-center o-justify-center o-size-6 o-rounded-md o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-900 o-text-zinc-500 dark:o-text-zinc-400 o-shrink-0">
          <SectionIcon title={section.title} />
        </span>
        <span className="o-flex-1 o-text-left o-truncate">{section.title}</span>
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          focusable="false"
          className={`o-shrink-0 o-text-zinc-400 dark:o-text-zinc-600 o-transition-transform ${open ? 'o-rotate-90' : ''}`}
        >
          <path d="m9 18 6-6-6-6" />
        </svg>
      </button>

      {/* Repli anime par grille : 0fr -> 1fr interpole la hauteur reelle,
          sans mesure JavaScript. `inert` retire les liens caches du parcours
          clavier, que `overflow:hidden` seul laisserait accessibles. */}
      <div
        id={regionId}
        inert={!open}
        style={{
          display: 'grid',
          gridTemplateRows: open ? '1fr' : '0fr',
          transition: 'grid-template-rows 240ms cubic-bezier(0.2, 0, 0, 1)',
        }}
      >
        <div className="o-overflow-hidden" style={{ minHeight: 0 }}>
          <div className="o-flex o-flex-col o-py-1" style={{ marginLeft: '0.9rem' }}>
            {(section.pages ?? []).map((page) => (
              <ItemLink key={page.path} page={page} onNavigate={onNavigate} />
            ))}

            {(section.groups ?? []).map((group) => (
              <div key={group.title} className="o-flex o-flex-col">
                <p className="o-border-l o-border-zinc-200 dark:o-border-zinc-800 o-pl-3 o-pt-3 o-pb-1 o-text-xs o-font-semibold o-uppercase o-tracking-wider o-text-zinc-400 dark:o-text-zinc-500">
                  {group.title}
                </p>
                {group.pages.map((page) => (
                  <ItemLink key={page.path} page={page} onNavigate={onNavigate} />
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

/** Arborescence complete de la colonne laterale. */
function SideNav({ onNavigate }: { onNavigate?: () => void }): ReactElement {
  const { pathname } = useLocation()
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() =>
    storedOpenSections(),
  )

  // La categorie de la page courante s'ouvre d'elle-meme : arriver par un
  // lien direct ou la recherche ne doit jamais laisser la page active cachee.
  useEffect(() => {
    const current = DOC_SECTIONS.find((section) =>
      sectionPages(section).some((page) => page.path === pathname),
    )
    if (current === undefined) return
    setOpenSections((state) =>
      state[current.title] === false ? { ...state, [current.title]: true } : state,
    )
  }, [pathname])

  const toggle = useCallback((title: string) => {
    setOpenSections((state) => {
      const next = { ...state, [title]: !(state[title] ?? true) }
      try {
        localStorage.setItem(ASIDE_STORAGE_KEY, JSON.stringify(next))
      } catch {
        // Stockage indisponible : l'etat vivra le temps de la session.
      }
      return next
    })
  }, [])

  return (
    <nav aria-label="Documentation" className="o-flex o-flex-col o-gap-1">
      {DOC_SECTIONS.map((section) => (
        <SectionBlock
          key={section.title}
          section={section}
          open={openSections[section.title] ?? true}
          onToggle={() => toggle(section.title)}
          onNavigate={onNavigate}
        />
      ))}
    </nav>
  )
}

/* -------------------------------------------------------------------------- */
/* Barre superieure                                                           */
/* -------------------------------------------------------------------------- */

/** Entrees de premier niveau de la barre. */
const TOP_LINKS: readonly { label: string; to: string; prefixes: readonly string[] }[] = [
  {
    label: 'Guide',
    to: '/docs/installation',
    prefixes: ['/docs/installation', '/docs/styles', '/docs/router'],
  },
  { label: 'Composants', to: '/docs/composants/button', prefixes: ['/docs/composants'] },
  { label: 'Motions', to: '/docs/motion', prefixes: ['/docs/motion'] },
  { label: 'Moteur', to: '/docs/moteur', prefixes: ['/docs/moteur'] },
  { label: 'Registre', to: '/docs/registre', prefixes: ['/docs/registre'] },
]

/** Marque : pastille en degrade, nom, millésime de version. */
function Brand(): ReactElement {
  return (
    <Link
      to="/"
      className="o-inline-flex o-items-center o-gap-2 o-no-underline o-shrink-0"
    >
      <span className="o-inline-flex o-items-center o-justify-center o-size-7 o-rounded-lg o-bg-gradient-to-br o-from-brand-600 o-to-fuchsia-600 o-text-white o-text-sm o-font-extrabold o-shadow-xs">
        O
      </span>
      <span className="o-text-base o-font-bold o-tracking-tight o-text-zinc-900 dark:o-text-zinc-50">
        Odoro
      </span>
      <span className="max-md:o-hidden o-text-xs o-font-mono o-text-zinc-400 dark:o-text-zinc-500 o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-rounded-full o-px-1.5 o-py-0.5">
        v0
      </span>
    </Link>
  )
}

/** Lien de premier niveau, actif des qu'un de ses prefixes couvre la route. */
function TopLink({
  label,
  to,
  prefixes,
}: {
  label: string
  to: string
  prefixes: readonly string[]
}): ReactElement {
  const { pathname } = useLocation()
  const active = prefixes.some((prefix) => pathname.startsWith(prefix))

  return (
    <Link
      to={to}
      aria-current={active ? 'true' : undefined}
      className={`o-rounded-full o-px-3 o-py-1.5 o-text-sm o-no-underline o-transition-colors ${
        active
          ? 'o-bg-zinc-100 dark:o-bg-zinc-800 o-text-zinc-900 dark:o-text-zinc-50 o-font-medium'
          : 'o-text-zinc-500 dark:o-text-zinc-400 hover:o-text-zinc-900 dark:hover:o-text-zinc-50'
      }`}
    >
      {label}
    </Link>
  )
}

/** Fil de progression de lecture, au ras du bord inferieur de la barre. */
function ReadingProgress(): ReactElement {
  const progress = useScrollProgress()

  return (
    <span
      aria-hidden="true"
      className="o-absolute o-bottom-0 o-left-0 o-bg-gradient-to-r o-from-brand-600 o-to-fuchsia-600 dark:o-from-brand-400 dark:o-to-fuchsia-400"
      style={{
        height: '2px',
        width: `${progress * 100}%`,
        opacity: progress === 0 ? 0 : 1,
        transition: 'opacity 200ms',
      }}
    />
  )
}

/* -------------------------------------------------------------------------- */
/* Coquille                                                                   */
/* -------------------------------------------------------------------------- */

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

  const searchButton = useMemo(
    () => (
      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        aria-label="Rechercher dans la documentation"
        className="o-inline-flex o-items-center o-gap-2 o-h-9 md:o-w-56 o-rounded-lg o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-zinc-50 dark:o-bg-zinc-900 max-md:o-px-2 md:o-px-3 o-text-sm o-text-zinc-400 dark:o-text-zinc-500 hover:o-border-zinc-300 dark:hover:o-border-zinc-700 hover:o-bg-white dark:hover:o-bg-zinc-800 o-transition-colors o-cursor-pointer"
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
          className="o-shrink-0"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <span className="max-md:o-hidden o-flex-1 o-text-left">Rechercher...</span>
        <kbd className="max-md:o-hidden o-text-xs o-font-mono o-text-zinc-400 dark:o-text-zinc-500 o-border-w-1 o-border-zinc-200 dark:o-border-zinc-700 o-rounded-sm o-px-1.5 o-py-0.5 o-bg-white dark:o-bg-zinc-950">
          Ctrl K
        </kbd>
      </button>
    ),
    [],
  )

  return (
    <div className="o-min-h-screen o-bg-white dark:o-bg-zinc-950 o-text-zinc-900 dark:o-text-zinc-50">
      <header className="o-fixed o-top-0 o-inset-x-0 o-z-sticky o-glass dark:o-glass-dark o-border-b o-border-zinc-200 dark:o-border-zinc-800">
        <div className="o-relative o-mx-auto o-max-w-7xl o-h-16 o-flex o-items-center o-gap-3 o-px-4 md:o-px-6">
          <button
            type="button"
            aria-label={menuOpen ? 'Fermer la navigation' : 'Ouvrir la navigation'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="lg:o-hidden o-inline-flex o-items-center o-justify-center o-size-9 o-rounded-md o-text-zinc-500 dark:o-text-zinc-400 hover:o-text-zinc-900 dark:hover:o-text-zinc-50 hover:o-bg-zinc-100 dark:hover:o-bg-zinc-800 o-transition-colors o-cursor-pointer"
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

          <Brand />

          <nav
            aria-label="Navigation principale"
            className="max-lg:o-hidden o-flex o-items-center o-gap-1 o-ml-4"
          >
            {TOP_LINKS.map((link) => (
              <TopLink key={link.to} {...link} />
            ))}
          </nav>

          <div className="o-flex-1" />

          {searchButton}

          <span
            aria-hidden="true"
            className="max-md:o-hidden o-h-5 o-border-l o-border-zinc-200 dark:o-border-zinc-800"
          />

          <ThemeToggle />

          <ReadingProgress />
        </div>
      </header>

      <div
        className="o-mx-auto o-max-w-7xl o-flex o-px-4 md:o-px-6"
        style={{ paddingTop: HEADER_OFFSET }}
      >
        <aside
          className="max-lg:o-hidden o-sticky o-w-64 o-shrink-0 o-overflow-y-auto o-scrollbar dark:o-scrollbar-dark o-py-6 o-pr-4"
          style={{ top: HEADER_OFFSET, height: `calc(100dvh - ${HEADER_OFFSET})` }}
        >
          <SideNav />
        </aside>

        {/* La couleur de bordure est posee sans condition d'ecran : elle est
            sans effet tant que `lg:o-border-l` n'a pas donne d'epaisseur. */}
        <main className="o-flex-1 o-min-w-0 o-py-10 lg:o-pl-10 lg:o-border-l o-border-zinc-100 dark:o-border-zinc-900 o-view-transition-page">
          {children}
        </main>
      </div>

      {menuOpen ? (
        <div
          className="lg:o-hidden o-fixed o-inset-0 o-z-overlay"
          style={{ paddingTop: HEADER_OFFSET }}
        >
          <div
            className="o-absolute o-inset-0 o-bg-black-45"
            onClick={() => setMenuOpen(false)}
            aria-hidden="true"
          />
          <div className="o-relative o-h-full o-w-72 o-max-w-full o-bg-white dark:o-bg-zinc-950 o-shadow-xl o-overflow-y-auto o-scrollbar dark:o-scrollbar-dark o-p-3 o-animate-slide-in-left o-animate-duration-fast">
            <SideNav onNavigate={() => setMenuOpen(false)} />
          </div>
        </div>
      ) : null}

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
