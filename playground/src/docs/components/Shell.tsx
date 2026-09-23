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
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { Icon, type IconData } from '@odoro-cli/icons'
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
} from '@odoro-cli/icons/outline'
import { Github, Npm } from '@odoro-cli/icons/brands'
import { Link, useLocation } from '@odoro-cli/libs/router'
import { useScrollProgress } from '@odoro-cli/libs/motion'

import { DEPOT, NPM } from '../liens.js'
import { DOC_SECTIONS, type DocPage, type DocSection, sectionPages } from '../registry.js'
import { Pagination } from './Pagination.jsx'
import { SearchDialog } from './SearchDialog.jsx'
import { ThemeToggle } from './ThemeToggle.jsx'

/**
 * Hauteur de la barre fixe : 3.5rem, la hauteur d une barre d outil.
 *
 * Exportee parce que tout ce qui colle en dessous doit partir de la : une barre
 * collee a zero passerait sous celle-ci et disparaitrait.
 *
 * Elle valait 5rem du temps des gelules, qui avaient besoin d air autour
 * d elles. Une barre pleine n en a pas besoin : elle porte sa propre limite,
 * et cinquante-six pixels suffisent a un champ et a des liens.
 */
export const HEADER_OFFSET = '3.5rem'

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
 * facon honnete de savoir s'il tient : le premier consommateur de `@odoro-cli/icons`
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

/**
 * La cle de la table d icones : le titre sans ses accents ni sa casse.
 *
 * La table etait indexee sur le titre exact. Le jour ou « Demarrage » a pris
 * son accent, la categorie est tombee sur le rond par defaut sans que rien ne
 * le signale. Normaliser la cle rend la table insensible a l orthographe.
 */
function cleDIcone(titre: string): string {
  return titre.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
}

/** La table, indexee sur la cle normalisee. */
const ICONES_PAR_CLE: Readonly<Record<string, IconData>> = Object.fromEntries(
  Object.entries(SECTION_ICONS).map(([titre, icone]) => [cleDIcone(titre), icone]),
)

/** Icone d'une categorie, ou un rond pour celle qu'on aurait oubliee. */
function SectionIcon({ title }: { title: string }): ReactElement {
  // 1.8 plutot que le 2 du jeu : a quinze pixels, le trait nominal empate les
  // traces les plus denses.
  return (
    <Icon icon={ICONES_PAR_CLE[cleDIcone(title)] ?? Circle} size={15} strokeWidth={1.8} />
  )
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

/**
 * Une page de la colonne.
 *
 * La page courante porte un aplat discret et son encre passe au noir plein.
 * C est la convention d un menu d application : on lit la ligne ouverte a sa
 * surface, pas a un signe pose a cote d elle.
 */
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
      data-actif={active ? '' : undefined}
      className={`db-item o-block o-px-2.5 o-py-1.5 o-text-sm o-no-underline ${
        active
          ? 'o-text-zinc-950 dark:o-text-zinc-50'
          : 'o-text-zinc-600 dark:o-text-zinc-400 hover:o-text-zinc-950 dark:hover:o-text-zinc-50'
      }`}
    >
      {/* La tige d accent a disparu avec les gelules : une ligne ouverte se
          signale ici par un aplat, comme une entree de menu d application.
          Un filet vertical plus un aplat, ce serait dire deux fois la meme
          chose, et la seconde fois moins bien. */}
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
        className="o-flex o-w-full o-cursor-pointer o-items-center o-gap-3 o-py-2.5 o-text-left o-transition-opacity hover:o-opacity-70"
      >
        <span className="o-inline-flex o-shrink-0 o-items-center o-justify-center o-text-brand-600 dark:o-text-brand-400">
          <SectionIcon title={section.title} />
        </span>
        <span className="o-truncate o-font-mono o-text-xs o-font-semibold o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
          {section.title}
        </span>
        {/* Le filet qui prolonge la rubrique jusqu au bord. */}
        <span aria-hidden="true" className="db-filet o-h-px o-flex-1" />
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
          <div
            className="o-flex o-flex-col o-pb-2 o-pt-1"
            style={{ marginLeft: '0.45rem' }}
          >
            {(section.pages ?? []).map((page) => (
              <ItemLink key={page.path} page={page} onNavigate={onNavigate} />
            ))}

            {(section.groups ?? []).map((group) => (
              <div key={group.title} className="o-flex o-flex-col">
                <p className="o-m-0 o-flex o-items-center o-gap-3 o-pb-2 o-pl-5 o-pt-5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                  {group.title}
                  <span aria-hidden="true" className="db-filet o-h-px o-flex-1" />
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
/**
 * Les routes qui se passent de la colonne laterale.
 *
 * Une vitrine et une bibliotheque ne sont pas de la documentation : leur
 * visiteur ne cherche pas une page precise dans une arborescence, il regarde ce
 * qu'on lui montre. Leur imposer deux cent cinquante pixels de sommaire
 * reviendrait a lui demander de choisir avant d'avoir vu.
 *
 * La barre superieure, elle, reste : c'est par elle qu'on repart.
 */
const SANS_COLONNE: readonly string[] = ['/', '/templates']

/** Cette route se passe-t-elle de la colonne de navigation ? */
function sansColonne(pathname: string): boolean {
  return SANS_COLONNE.some((p) => pathname === p || pathname.startsWith(`${p}/`))
}

/**
 * Cette route touche-t-elle les bords ?
 *
 * Se passer de la colonne et se passer de marges sont deux choses. La vitrine
 * et la page d accueil posent elles-memes leurs marges, section par section, et
 * leur en-tete doit toucher le bord. La galerie des templates, elle, reste une
 * page de documentation : sans colonne, mais dans la meme gouttiere que les
 * autres, faute de quoi son titre commence au ras de la fenetre.
 */
function pleineLargeur(pathname: string): boolean {
  return pathname === '/' || pathname.startsWith('/templates/')
}

/**
 * Les six entrees de la barre.
 *
 * ## Ce qui est en francais, et ce qui ne l est pas
 *
 * Les **routes** sont en anglais — `/docs/components`, `/docs/engine` — parce
 * qu une adresse se cite, se partage et se lit dans du code. Les **libelles**
 * sont en francais, parce qu ils s adressent au lecteur, et que le reste du
 * site l est.
 *
 * Deux d entre eux disent mieux que leur mot d origine : « Documentation »
 * plutot que « Guide », qui ne disait pas ce qu on y trouve, et « Animations »
 * plutot que « Motions », un pluriel qui n existait nulle part ailleurs — ni
 * dans le module, ni dans l import, ni dans la documentation.
 *
 * « Templates » reste tel quel : c est le nom de cette section partout sur le
 * site, et le mot est entre dans le francais du metier.
 */
const TOP_LINKS: readonly { label: string; to: string; prefixes: readonly string[] }[] = [
  {
    label: 'Documentation',
    to: '/docs/installation',
    prefixes: ['/docs/installation', '/docs/styles', '/docs/router'],
  },
  { label: 'Composants', to: '/docs/components/button', prefixes: ['/docs/components'] },
  { label: 'Animations', to: '/docs/motion', prefixes: ['/docs/motion'] },
  { label: 'Moteur', to: '/docs/engine', prefixes: ['/docs/engine'] },
  { label: 'Registre', to: '/docs/registry', prefixes: ['/docs/registry'] },
  { label: 'Templates', to: '/templates', prefixes: ['/templates'] },
]

/**
 * Le logo : un anneau a l'angle vif, trace en `currentColor`.
 *
 * Vectoriel plutot qu'image : il prend la couleur qu'on lui donne, reste net
 * a toute taille, et ne pese rien. Le trace reprend le fichier `icons/03-angle-vif`.
 */
export function LogoMark({
  className,
  style,
}: {
  className?: string
  style?: CSSProperties
}): ReactElement {
  return (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      className={className}
      style={style}
    >
      <path
        d="M20.25 20.25H50a29.75 29.75 0 1 1-29.75 29.75Z"
        stroke="currentColor"
        strokeWidth="10.5"
        strokeLinejoin="miter"
      />
    </svg>
  )
}

/**
 * Les surfaces de la barre, que les utilitaires ne savent pas decrire.
 *
 * Le systeme decline les echelles de noir et de blanc, mais pas leurs
 * variantes `dark:` des echelles alpha. Les surfaces viennent donc des jetons
 * `--o-chrome-*` de `marque.css`, qui suivent le theme choisi sur le site, et
 * la barre garde un seul jeu de classes.
 */
const FEUILLE_BARRE = [
  /* La barre : une surface a elle, qui ne suit pas le theme du document. */
  '.db-barre{background-color:var(--o-chrome-barre);',
  'border-bottom:1px solid var(--o-chrome-barre-filet);',
  'color:var(--o-chrome-barre-encre)}',
  '.db-barre-lien{color:var(--o-chrome-barre-encre);border-radius:0.5rem;',
  'transition:background-color 120ms,color 120ms}',
  '.db-barre-lien:hover{background-color:var(--o-chrome-barre-actif);',
  'color:var(--o-chrome-barre-encre-forte)}',
  '.db-barre-lien[data-actif]{background-color:var(--o-chrome-barre-actif);',
  'color:var(--o-chrome-barre-encre-forte)}',
  '.db-barre-champ{background-color:var(--o-chrome-barre-champ);',
  'border:1px solid transparent;color:var(--o-chrome-barre-encre);',
  'transition:border-color 120ms,background-color 120ms}',
  '.db-barre-champ:hover{border-color:var(--o-chrome-barre-filet)}',
  '.db-barre-champ:focus-visible{outline:2px solid var(--o-palette-brand-400);',
  'outline-offset:1px}',

  /* La page : un fond gris sur lequel les cartes se detachent seules. */
  '.db-fond{background-color:var(--o-chrome-fond)}',
  '.db-carte{background-color:var(--o-chrome-carte);',
  'border:1px solid var(--o-chrome-filet);border-radius:0.75rem}',

  /* La colonne : des lignes denses, une limite a droite. */
  '.db-colonne{border-right:1px solid var(--o-chrome-filet);',
  'background-color:var(--o-chrome-colonne)}',
  '.db-item{border-radius:0.5rem;transition:background-color 120ms,color 120ms}',
  '.db-item:hover{background-color:var(--o-chrome-tenu)}',
  '.db-item[data-actif]{background-color:var(--o-chrome-actif);font-weight:600}',

  /* Ce que d autres feuilles continuent de nommer. */
  '.db-gelule{background-color:var(--o-chrome-carte);',
  'border-color:var(--o-chrome-filet)}',
  '.db-actif{background-color:var(--o-chrome-actif)}',
  '.db-filet{background-color:var(--o-chrome-filet-colonne)}',
].join('')

/** Pose la feuille de la barre, une fois par document. */
function useFeuilleBarre(): void {
  useEffect(() => {
    const id = 'o-docs-barre'
    if (document.getElementById(id) !== null) return
    const style = document.createElement('style')
    style.id = id
    style.textContent = FEUILLE_BARRE
    document.head.append(style)
  }, [])
}

/**
 * Le fond d une gelule de la barre.
 *
 * La barre elle-meme ne peint rien : ce sont les gelules qui portent la
 * surface, posees sur ce qu il y a derriere. Sur la page d accueil, c est la
 * scene ; ailleurs, la page. Les deux suivent desormais le theme du site, y
 * compris l accueil : la gelule n a donc plus de forme imposee.
 */
const GELULE = 'db-barre-champ'

/**
 * L encre ordinaire d une gelule, et celle du survol.
 *
 * Chaque couleur est redite en `dark:`. La feuille pose
 * `:root[data-theme="dark"] :where(a){color:brand}`, de specificite (0,2,0) :
 * une classe seule vaut (0,1,0) et perd, et tous les liens de la barre
 * viraient a la couleur de marque des que le theme passait en nuit.
 */
const ENCRE_GELULE = ''

/**
 * Les deux liens hors du site : le depot et le registre npm.
 *
 * ## Pourquoi ils flottent en bas a droite
 *
 * Dans la barre, ils disputaient la largeur a la recherche, qui se comprimait
 * au point de couper son raccourci en deux lignes. Ce sont par ailleurs des
 * liens de second plan : on les cherche une fois, on ne les longe pas en
 * lisant. Le coin bas droit les tient a portee sans les mettre sur le chemin.
 *
 * Ils passent **sous** le voile du menu mobile et sous le rideau de la page
 * d accueil, tous deux au niveau `overlay` : un lien qui affleurerait par
 * dessus un ecran de chargement se lirait comme une erreur d empilement.
 *
 * Leur trace est rendu en `currentColor`. Les chartes de marque interdisent
 * generalement de reteindre un logo, mais elles admettent le monochrome, qui
 * est l usage courant d une barre d actions.
 *
 * `rel="noreferrer"` accompagne `target="_blank"` : sans lui, la page ouverte
 * recoit une poignee sur celle-ci.
 */
function LiensExternes(): ReactElement {
  const gelule =
    `o-inline-flex o-size-12 o-shrink-0 o-items-center o-justify-center o-rounded-full ` +
    `o-border-w-1 o-shadow-lg o-no-underline o-transition-colors ${GELULE} ${ENCRE_GELULE}`
  return (
    <div className="o-fixed o-bottom-6 o-right-6 o-z-sticky o-flex o-items-center o-gap-3">
      <a
        href={DEPOT}
        target="_blank"
        rel="noreferrer"
        aria-label="Le depot sur GitHub"
        title="GitHub"
        className={gelule}
      >
        <Icon icon={Github} size={18} />
      </a>
      <a
        href={NPM}
        target="_blank"
        rel="noreferrer"
        aria-label="Les paquets sur npm"
        title="npm"
        className={gelule}
      >
        <Icon icon={Npm} size={22} />
      </a>
    </div>
  )
}

/** Marque : le sigle et le nom, dans leur propre gelule. */
function Brand(): ReactElement {
  return (
    <Link
      to="/"
      className="db-barre-lien o-inline-flex o-h-8 o-shrink-0 o-items-center o-gap-2 o-px-2 o-no-underline"
    >
      <LogoMark className="o-size-5 o-text-brand-400" />
      <span
        className="o-text-sm o-font-bold o-tracking-wide"
        style={{ color: 'var(--o-chrome-barre-encre-forte)' }}
      >
        ODORO
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
      data-actif={active ? '' : undefined}
      className={`db-barre-lien o-px-2.5 o-py-1.5 o-text-sm o-no-underline ${
        active ? 'o-font-medium' : ''
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
      className="o-absolute o-bottom-0 o-left-0 o-bg-gradient-to-r o-from-brand-700 o-to-brand-300 dark:o-from-brand-500 dark:o-to-brand-200"
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
  useFeuilleBarre()
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const { pathname } = useLocation()
  const large = pleineLargeur(pathname)
  const colonneCachee = sansColonne(pathname)

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

  // La recherche se replie sur son icone sous 1536 px.
  //
  // La barre entiere — marque, navigation, recherche, theme, gelule pleine —
  // demande 1468 px pour tenir. En dessous, elle debordait : et comme
  // l en-tete est en position fixe, un debordement ne fait pas defiler, il
  // coupe. La recherche et le selecteur de theme sortaient simplement de
  // l ecran sur tout portable. Replier la legende et le raccourci rend deux
  // cents pixels ; sous 1280, les onglets passent dans le panneau lateral,
  // qui porte les memes sections — rien n est perdu, tout est deplace.
  const searchButton = useMemo(
    () => (
      <button
        type="button"
        onClick={() => setSearchOpen(true)}
        aria-label="Rechercher dans la documentation"
        className={`o-inline-flex o-h-8 o-shrink-0 o-cursor-pointer o-items-center o-gap-2 o-rounded-lg o-px-3 o-text-sm lg:o-w-96 ${GELULE} ${ENCRE_GELULE}`}
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
        <span className="o-hidden lg:o-block lg:o-flex-1 lg:o-text-left">
          Rechercher dans la documentation
        </span>
        <kbd
          className="o-hidden lg:o-inline-block o-shrink-0 o-whitespace-nowrap o-rounded-sm o-px-1.5 o-py-0.5 o-font-mono o-text-xs"
          style={{ backgroundColor: 'var(--o-chrome-barre-actif)' }}
        >
          Ctrl K
        </kbd>
      </button>
    ),
    [],
  )

  return (
    <div className="db-fond o-min-h-screen o-text-zinc-900 dark:o-text-zinc-50">
      {/* La barre ne peint rien elle-meme : ce sont les gelules qui portent la
          surface, posees sur ce qu il y a derriere — la scene sur la page
          d accueil, la page ailleurs. C est ce qui la fait flotter. */}
      {/* La barre porte sa propre surface, sombre dans les deux themes : c est
          le chrome de l outil, pas une surface du document. Plus de fondu a
          poser sous elle — une barre pleine n a rien a laisser transparaitre,
          et c est precisement ce qu on lui demande. */}
      <header className="db-barre o-fixed o-top-0 o-inset-x-0 o-z-sticky">
        <div className="o-relative o-flex o-h-14 o-items-center o-gap-2 o-px-3 md:o-px-4">
          <button
            type="button"
            aria-label={menuOpen ? 'Fermer la navigation' : 'Ouvrir la navigation'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="xl:o-hidden db-barre-lien o-inline-flex o-size-8 o-shrink-0 o-cursor-pointer o-items-center o-justify-center"
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

          {/* La navigation n a plus de gelule : sur une barre pleine, un
              contenant dans le contenant se lit comme un debut de hierarchie
              qui n existe pas. Les liens portent leur propre etat. */}
          <nav
            aria-label="Navigation principale"
            className="o-hidden xl:o-flex o-items-center o-gap-0.5"
          >
            {TOP_LINKS.map((link) => (
              <TopLink key={link.to} {...link} />
            ))}
          </nav>

          {/* La recherche au centre, comme dans une console : c est elle qu on
              vise, pas les liens. Deux entretoises souples la tiennent la. */}
          <div className="o-flex-1" />
          {searchButton}
          <div className="o-flex-1" />

          <ThemeToggle />

          <Link
            to="/docs/installation"
            className="max-sm:o-hidden o-inline-flex o-h-8 o-shrink-0 o-items-center o-rounded-lg o-px-3.5 o-text-sm o-font-medium o-no-underline focus:o-ring"
            // La regle d ancre de la feuille et la variante `dark:` ont la
            // meme specificite : c est l ordre du fichier qui tranche, et il
            // ne joue pas en notre faveur. Le style en ligne, lui, est sur.
            // La barre est sombre dans les deux themes : le bouton ne peut
            // pas lire `--o-chrome-cta-*`, qui suit le theme du document et le
            // rendrait noir sur noir en clair.
            style={{ backgroundColor: '#ffffff', color: '#1a1a1a' }}
          >
            Démarrer
          </Link>

          <ReadingProgress />
        </div>
      </header>

      {/* Les pages sans colonne prennent toute la largeur : leurs sections
          posent elles-memes leurs marges, et un hero doit toucher les bords. */}
      <div className="o-flex" style={{ paddingTop: HEADER_OFFSET }}>
        {/* La colonne porte sa propre surface et sa limite a droite. Elle ne
            flotte plus sur la page : elle la borde, comme la navigation d une
            application borde sa zone de travail. */}
        {!colonneCachee && (
          <aside
            className="db-colonne max-lg:o-hidden o-sticky o-w-60 o-shrink-0 o-overflow-y-auto o-scrollbar dark:o-scrollbar-dark o-px-3 o-py-4"
            style={{ top: HEADER_OFFSET, height: `calc(100dvh - ${HEADER_OFFSET})` }}
          >
            <SideNav />
          </aside>
        )}

        {/* La couleur de bordure est posee sans condition d'ecran : elle est
            sans effet tant que `lg:o-border-l` n'a pas donne d'epaisseur. */}
        <main
          className={[
            'o-flex-1 o-min-w-0 o-view-transition-page',
            // Hors vitrine, le contenu prend une mesure et se centre : une
            // colonne de texte qui court d un bord a l autre d un grand ecran
            // ne se lit pas, et une console ne le fait jamais.
            large ? '' : 'o-mx-auto o-w-full o-max-w-6xl o-px-5 md:o-px-8',
            // Une vitrine, comme la page d accueil, fait sa propre place :
            // son en-tete doit toucher la barre.
            pathname === '/' || pathname.startsWith('/templates/') ? 'o-py-0' : 'o-py-8',
            // Le filet de separation n'a de sens qu'a cote de la colonne.
            // Le filet de separation a disparu : la colonne est faite de
            // gelules posees sur la page, et une ligne verticale la
            // recloisonnait en tiroir.
            colonneCachee || large ? '' : 'lg:o-px-10',
          ].join(' ')}
        >
          {/* Sur une console, ce qui se lit est pose sur une carte, et le
              gris autour n est pas un fond : c est ce qui fait exister la
              carte. Les pages pleine largeur — vitrine, galerie, projet — y
              echappent : elles posent elles-memes leurs surfaces. */}
          {large || colonneCachee ? (
            children
          ) : (
            <div className="db-carte o-px-6 o-py-8 md:o-px-10 md:o-py-10">{children}</div>
          )}
          {colonneCachee ? null : <Pagination />}
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

      <LiensExternes />

      <SearchDialog open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  )
}
