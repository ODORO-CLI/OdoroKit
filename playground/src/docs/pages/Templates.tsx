/**
 * La bibliotheque de templates.
 *
 * ## Deux choses portent ce nom, et elles ne se ressemblent pas
 *
 * Une **vitrine** est une page d atterrissage entiere, jouable ici meme : on
 * l ouvre, on la parcourt, on lit son code. Un **socle** est ce que la CLI
 * echafaude : un projet vide mais cable. La page montre les deux, dans cet
 * ordre, parce que le visiteur veut d abord voir a quoi cela ressemble.
 *
 * ## Une galerie qui se fouille
 *
 * Quarante et une vitrines ne se parcourent plus d un regard : la page est
 * batie comme une place de marche. Une **recherche** qui lit le nom, le metier,
 * le resume et les pieces ; un **volet de filtres** colle a gauche — secteur,
 * ton (sombre quel que soit le theme, ou fidele au theme), presence d une scene — qui se cumulent ; un **tri** ; et le compte des
 * resultats, toujours visible. Sous 1024 px le volet se replie derriere
 * un bouton, et le champ de recherche n existe qu une fois dans la page.
 *
 * ## Pourquoi la grille ne se revele pas a l entree dans le champ
 *
 * Une grille de resultats qui apparait en cascade parait cassee quand elle
 * change sous un filtre : les cartes deja vues rejoueraient leur entree. Les
 * cartes sont donc rendues telles quelles ; seul l apercu bouge, au survol.
 *
 * ## Pourquoi les apercus ne sont pas vivants
 *
 * Quarante et une pages montees en meme temps demanderaient autant de contextes
 * graphiques, alors que l arbitre en accorde deux. Chaque carte montre donc sa
 * capture, qui defile au survol, et la page complete se joue quand on l ouvre.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import { ArrowRight, ArrowUpRight, LayoutGrid, Search, Server, X } from '@odoro-cli/icons/filaire'
import { Reveal } from '@odoro-cli/libs/motion'
import { Link } from '@odoro-cli/libs/router'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type SyntheticEvent,
} from 'react'

import { CodeBlock } from '../components/CodeBlock.jsx'
import { PageHeader } from '../components/DocBlocks.jsx'
import { TEMPLATES, scaffoldCommand, type Template } from '../templates.js'
import {
  TEMPLATES as PROJETS,
  type TemplateEntry,
} from '../templates.generated.js'
import { SECTEURS, VITRINES, type Vitrine, type VitrineSecteur } from '../vitrines/index.js'

/* ============================ L apercu ================================= */

/** Identifiant de la feuille de l apercu. */
const STYLE_APERCU = 'o-apercu-vitrine'

/**
 * La feuille de l apercu.
 *
 * Deux choses sont hors de portee des utilitaires : faire reagir une image au
 * survol de la carte qui la contient — le systeme n a pas de variante de
 * groupe — et choisir laquelle des deux captures montrer selon le theme. La
 * capture est plus haute que sa fenetre : c est `object-position` qui passe
 * du haut au bas, et la course s ajuste seule a chaque image.
 */
const CSS_APERCU = [
  '[data-o-apercu]{position:relative;overflow:hidden}',
  '[data-o-apercu] img{position:absolute;inset:0;width:100%;height:100%;',
  'object-fit:cover;object-position:50% 0%;',
  'transition:object-position 900ms cubic-bezier(0.22,1,0.36,1),transform 700ms cubic-bezier(0.22,1,0.36,1)}',
  '[data-o-carte]:hover [data-o-apercu] img,',
  '[data-o-carte]:focus-visible [data-o-apercu] img{',
  'object-position:50% 100%;transition-duration:7000ms,700ms;',
  'transition-timing-function:cubic-bezier(0.4,0,0.25,1)}',
  '[data-o-apercu] [data-apercu="sombre"]{opacity:0}',
  ':root[data-theme="dark"] [data-o-apercu] [data-apercu="clair"]{opacity:0}',
  ':root[data-theme="dark"] [data-o-apercu] [data-apercu="sombre"]{opacity:1}',
  '@media (prefers-color-scheme:dark){',
  ':root:not([data-theme="light"]) [data-o-apercu] [data-apercu="clair"]{opacity:0}',
  ':root:not([data-theme="light"]) [data-o-apercu] [data-apercu="sombre"]{opacity:1}}',
  '[data-o-carte]:hover [data-o-ouvrir]{opacity:1;transform:none}',
  '@media (prefers-reduced-motion:reduce){[data-o-apercu] img{transition:none}',
  '[data-o-carte]:hover [data-o-apercu] img,',
  '[data-o-carte]:focus-visible [data-o-apercu] img{object-position:50% 0%}}',
].join('')

/** Pose la feuille une seule fois. */
function useFeuilleApercu(): void {
  useEffect(() => {
    if (document.getElementById(STYLE_APERCU) !== null) return
    const style = document.createElement('style')
    style.id = STYLE_APERCU
    style.textContent = CSS_APERCU
    document.head.append(style)
  }, [])
}

/* ============================ Ce qu on sait d une vitrine ============== */

/** Le ton d une vitrine : sombre quel que soit le theme, ou fidele au theme. */
function ton(v: Vitrine): 'sombre' | 'theme' {
  return v.ton
}

/** Vrai si la vitrine annonce une scene de fond parmi ses pieces. */
function aUneScene(v: Vitrine): boolean {
  return v.pieces.some((p) => p.startsWith('background/') || p.startsWith('hero/'))
}

/** Le texte dans lequel la recherche lit. */
function corpus(v: Vitrine): string {
  return [v.titre, v.metier, v.resume, v.slug, ...v.pieces].join(' ').toLowerCase()
}

/** Les tris proposes. */
const TRIS = [
  ['registre', 'Ordre du registre'],
  ['recentes', 'Les plus recentes'],
  ['nom', 'Nom, A a Z'],
  ['secteur', 'Par secteur'],
] as const
type Tri = (typeof TRIS)[number][0]

/* ============================ Les cartes =============================== */

/** L apercu d une vitrine : sa capture, qui defile au survol. */
function Apercu({ vitrine }: { readonly vitrine: Vitrine }): ReactElement {
  const cacher = (evenement: SyntheticEvent<HTMLImageElement>): void => {
    evenement.currentTarget.style.display = 'none'
  }
  return (
    <div data-o-apercu="" className={`o-relative o-h-60 o-overflow-hidden ${vitrine.apercu}`} aria-hidden="true">
      {(['clair', 'sombre'] as const).map((theme) => (
        <img
          key={theme}
          data-apercu={theme}
          src={`/vitrines/${vitrine.slug}-${theme === 'clair' ? 'light' : 'dark'}.jpg`}
          alt=""
          loading="lazy"
          decoding="async"
          onError={cacher}
        />
      ))}
      {/* Le ton et la scene, en pastilles de verre sur la capture. */}
      <span className="o-absolute o-left-3 o-top-3 o-flex o-gap-1.5">
        <span className="o-rounded-full o-border-w-1 o-border-white-20 o-bg-black-60 o-px-2 o-py-0.5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-white o-backdrop-blur-md">
          {ton(vitrine) === 'sombre' ? 'Sombre' : 'Adaptatif'}
        </span>
        {aUneScene(vitrine) && (
          <span className="o-rounded-full o-border-w-1 o-border-white-20 o-bg-black-60 o-px-2 o-py-0.5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-white o-backdrop-blur-md">
            Scene
          </span>
        )}
      </span>
      <span className="o-absolute o-bottom-3 o-left-3 o-flex o-gap-1.5">
        {vitrine.palette.map((token) => (
          <span
            key={token}
            className="o-size-4 o-rounded-full o-border-w-1"
            style={{ backgroundColor: `var(${token})`, borderColor: 'color-mix(in oklab, white 55%, transparent)' }}
          />
        ))}
      </span>
      <span
        data-o-ouvrir=""
        className="o-absolute o-bottom-3 o-right-3 o-inline-flex o-size-9 o-items-center o-justify-center o-rounded-full o-bg-white o-text-zinc-950 o-opacity-0 o-shadow-lg o-transition-all"
        style={{ transform: 'translateY(6px)' }}
      >
        <Icon icon={ArrowUpRight} size={16} />
      </span>
    </div>
  )
}

/** Une carte de vitrine. */
function CarteVitrine({ vitrine, rang }: { readonly vitrine: Vitrine; readonly rang: number }): ReactElement {
  const secteur = SECTEURS.find(([cle]) => cle === vitrine.secteur)?.[1] ?? vitrine.secteur
  const pieces = vitrine.pieces.slice(0, 3)
  const reste = vitrine.pieces.length - pieces.length
  return (
    <Link
      to={`/templates/${vitrine.slug}`}
      data-o-carte=""
      aria-label={`${vitrine.titre} — ${vitrine.metier}`}
      className="o-flex o-flex-col o-overflow-hidden o-rounded-2xl o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-900 o-no-underline o-text-zinc-900 dark:o-text-zinc-50 o-transition-colors hover:o-border-zinc-400 dark:hover:o-border-zinc-600 focus:o-ring"
    >
      <Apercu vitrine={vitrine} />
      <div className="o-flex o-flex-1 o-flex-col o-gap-2 o-p-5">
        <p className="o-m-0 o-flex o-items-center o-justify-between o-gap-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
          <span>{vitrine.metier}</span>
          <span className="o-tabular-nums">{String(rang + 1).padStart(2, '0')}</span>
        </p>
        <h3 className="o-m-0 o-text-xl o-font-semibold o-tracking-tight">{vitrine.titre}</h3>
        <p className="o-m-0 o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">{vitrine.resume}</p>
        <div className="o-mt-auto o-flex o-flex-wrap o-items-center o-gap-1.5 o-pt-3">
          <span className="o-rounded-full o-border-w-1 o-border-zinc-200 dark:o-border-zinc-700 o-px-2 o-py-0.5 o-text-xs o-text-zinc-600 dark:o-text-zinc-300">
            {secteur}
          </span>
          {pieces.map((piece) => (
            <span key={piece} className="o-rounded-full o-bg-zinc-100 dark:o-bg-zinc-800 o-px-2 o-py-0.5 o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
              {piece.split('/')[1]}
            </span>
          ))}
          {reste > 0 && <span className="o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400">+{reste}</span>}
        </div>
      </div>
    </Link>
  )
}

/**
 * Une carte de projet livre.
 *
 * Ces projets-la ne sont ni des vitrines ni des socles : ce sont des sites
 * entiers, avec leur pile propre — Next, three.js — livres dans `templates/`.
 * Ils portent donc leur pile et leur licence, que ni l une ni l autre des deux
 * autres familles n a besoin d annoncer.
 */
function CarteProjet({ projet }: { readonly projet: TemplateEntry }): ReactElement {
  return (
    <article className="o-flex o-flex-col o-overflow-hidden o-rounded-xl o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-900">
      {/* L apercu vit sous `apercus-templates/` et non `templates/` : ce
          dernier est l espace de routage des vitrines, et un dossier reel a
          cette adresse masquait la page d index derriere un 403 de nginx. */}
      <img
        src={`/apercus-templates/${projet.name}.jpg`}
        alt=""
        loading="lazy"
        decoding="async"
        className="o-h-44 o-w-full o-object-cover"
        onError={(e) => {
          e.currentTarget.style.display = 'none'
        }}
      />

      <div className="o-flex o-flex-col o-gap-3 o-p-6">
      <div className="o-flex o-items-baseline o-justify-between o-gap-3">
        <h3 className="o-m-0 o-text-lg o-font-semibold o-tracking-tight">{projet.title}</h3>
        <span className="o-shrink-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
          {projet.kind === 'site' ? 'Site' : projet.kind === 'starter' ? 'Socle' : 'Bibliotheque'}
        </span>
      </div>

      <p className="o-m-0 o-text-sm o-text-zinc-600 dark:o-text-zinc-400">{projet.description}</p>

      <ul className="o-m-0 o-flex o-flex-wrap o-gap-1.5 o-list-none o-p-0">
        {projet.stack.map((x) => (
          <li key={x} className="o-rounded-md o-bg-zinc-100 dark:o-bg-zinc-800 o-px-2 o-py-1 o-text-xs">
            {x}
          </li>
        ))}
      </ul>

      {projet.install !== undefined && (
        <div className="o-mt-auto o-pt-1">
          <CodeBlock lang="sh" code={projet.install} />
        </div>
      )}

      <p className="o-m-0 o-text-xs o-text-zinc-400">Licence {projet.licence}</p>
      </div>
    </article>
  )
}

/** Une carte de socle echafaudable. */
function CarteSocle({ template }: { readonly template: Template }): ReactElement {
  const livre = template.status === 'disponible'
  return (
    <article
      className={[
        'o-flex o-min-w-0 o-flex-col o-gap-3 o-rounded-2xl o-border-w-1 o-p-6',
        livre ? 'o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-900' : 'o-border-dashed o-border-zinc-300 dark:o-border-zinc-700',
      ].join(' ')}
    >
      <div className="o-flex o-items-center o-gap-2">
        <Icon icon={template.slug.includes('server') ? Server : LayoutGrid} size={20} className="o-text-brand-600 dark:o-text-brand-400" />
        <h3 className="o-m-0 o-text-lg o-font-semibold o-tracking-tight">{template.title}</h3>
        {!livre && <span className="o-rounded-full o-border-w-1 o-px-2 o-py-0.5 o-text-xs o-opacity-70">a venir</span>}
      </div>
      <p className="o-m-0 o-text-sm o-text-zinc-600 dark:o-text-zinc-400">{template.description}</p>
      <ul className="o-m-0 o-flex o-list-none o-flex-wrap o-gap-1.5 o-p-0">
        {template.includes.map((x) => (
          <li key={x} className="o-rounded-md o-bg-zinc-100 dark:o-bg-zinc-800 o-px-2 o-py-1 o-text-xs">{x}</li>
        ))}
      </ul>
      <div className="o-mt-auto o-min-w-0 o-pt-2">
        {livre ? <CodeBlock lang="sh" code={scaffoldCommand(template)} /> : <p className="o-m-0 o-text-sm o-italic o-text-zinc-500 dark:o-text-zinc-400">Ce socle n est pas encore livre — la commande ne fonctionnerait pas.</p>}
      </div>
    </article>
  )
}

/* ============================ Le volet de filtres ====================== */

/** Une case a cocher de filtre, avec son compte. */
function Case({
  coche,
  onChange,
  children,
  compte,
}: {
  readonly coche: boolean
  readonly onChange: () => void
  readonly children: string
  readonly compte: number
}): ReactElement {
  return (
    <label className="o-flex o-cursor-pointer o-items-center o-gap-2.5 o-py-1.5 o-text-sm">
      <input type="checkbox" checked={coche} onChange={onChange} className="o-size-4 o-accent-brand-500 focus:o-ring" />
      <span className={`o-grow ${coche ? 'o-text-zinc-950 dark:o-text-zinc-50' : 'o-text-zinc-600 dark:o-text-zinc-400'}`}>{children}</span>
      <span className="o-font-mono o-text-xs o-tabular-nums o-text-zinc-500 dark:o-text-zinc-400">{compte}</span>
    </label>
  )
}

/** Un groupe du volet. */
function Groupe({ titre, children }: { readonly titre: string; readonly children: ReactElement | ReactElement[] }): ReactElement {
  return (
    <fieldset className="o-m-0 o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-p-0 o-pt-4">
      <legend className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">{titre}</legend>
      <div className="o-mt-1 o-flex o-flex-col">{children}</div>
    </fieldset>
  )
}

/** L etat des filtres. */
interface Filtres {
  readonly recherche: string
  readonly secteurs: readonly VitrineSecteur[]
  readonly tons: readonly ('sombre' | 'theme')[]
  readonly scene: 'toutes' | 'avec' | 'sans'
  readonly tri: Tri
}

const VIDE: Filtres = { recherche: '', secteurs: [], tons: [], scene: 'toutes', tri: 'registre' }

/** Bascule une valeur dans une liste. */
function basculer<T>(liste: readonly T[], valeur: T): readonly T[] {
  return liste.includes(valeur) ? liste.filter((x) => x !== valeur) : [...liste, valeur]
}

/* ============================ La page ================================== */

/** La bibliotheque de templates. */
export function Templates(): ReactElement {
  useFeuilleApercu()
  const [filtres, setFiltres] = useState<Filtres>(VIDE)
  const [ouvert, setOuvert] = useState(false)
  const champ = useRef<HTMLInputElement>(null)

  // « / » va a la recherche, comme sur la plupart des places de marche.
  useEffect(() => {
    const surTouche = (e: KeyboardEvent): void => {
      const cible = e.target
      if (e.key === '/' && !(cible instanceof HTMLInputElement || cible instanceof HTMLTextAreaElement)) {
        e.preventDefault()
        champ.current?.focus()
      }
    }
    window.addEventListener('keydown', surTouche)
    return () => {
      window.removeEventListener('keydown', surTouche)
    }
  }, [])

  const visibles = useMemo(() => {
    const mots = filtres.recherche.trim().toLowerCase().split(/\s+/).filter(Boolean)
    let liste = VITRINES.filter((v) => {
      if (filtres.secteurs.length > 0 && !filtres.secteurs.includes(v.secteur)) return false
      if (filtres.tons.length > 0 && !filtres.tons.includes(ton(v))) return false
      if (filtres.scene === 'avec' && !aUneScene(v)) return false
      if (filtres.scene === 'sans' && aUneScene(v)) return false
      if (mots.length > 0) {
        const texte = corpus(v)
        if (!mots.every((m) => texte.includes(m))) return false
      }
      return true
    })
    if (filtres.tri === 'nom') liste = [...liste].sort((a, b) => a.titre.localeCompare(b.titre, 'fr'))
    if (filtres.tri === 'secteur') liste = [...liste].sort((a, b) => a.secteur.localeCompare(b.secteur, 'fr') || a.titre.localeCompare(b.titre, 'fr'))
    if (filtres.tri === 'recentes') liste = [...liste].reverse()
    return liste
  }, [filtres])

  const actifs = filtres.secteurs.length + filtres.tons.length + (filtres.scene === 'toutes' ? 0 : 1) + (filtres.recherche.trim() === '' ? 0 : 1)
  const compteSecteur = (cle: VitrineSecteur): number => VITRINES.filter((v) => v.secteur === cle).length
  const compteTon = (t: 'sombre' | 'theme'): number => VITRINES.filter((v) => ton(v) === t).length
  const compteScene = (avec: boolean): number => VITRINES.filter((v) => aUneScene(v) === avec).length

  const volet = (
    <div className="o-flex o-flex-col o-gap-4">
      <label className="o-relative o-block">
        <span className="o-sr-only">Rechercher une vitrine</span>
        <Icon icon={Search} size={16} className="o-pointer-events-none o-absolute o-left-3 o-top-1/2 o-text-zinc-400" style={{ transform: 'translateY(-50%)' }} />
        <input
          ref={champ}
          type="search"
          value={filtres.recherche}
          onChange={(e) => {
            setFiltres((f) => ({ ...f, recherche: e.target.value }))
          }}
          placeholder="Rechercher — un metier, une piece, un nom"
          className="o-w-full o-rounded-xl o-border-w-1 o-border-zinc-200 dark:o-border-zinc-700 o-bg-white dark:o-bg-zinc-900 o-py-2.5 o-pl-9 o-pr-10 o-text-sm o-text-zinc-900 dark:o-text-zinc-50 focus:o-ring"
        />
        <kbd className="o-pointer-events-none o-absolute o-right-3 o-top-1/2 o-rounded-md o-border-w-1 o-border-zinc-200 dark:o-border-zinc-700 o-px-1.5 o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400" style={{ transform: 'translateY(-50%)' }}>/</kbd>
      </label>

      <Groupe titre="Secteur">
        {SECTEURS.map(([cle, libelle]) => (
          <Case key={cle} coche={filtres.secteurs.includes(cle)} compte={compteSecteur(cle)} onChange={() => { setFiltres((f) => ({ ...f, secteurs: basculer(f.secteurs, cle) })) }}>
            {libelle}
          </Case>
        ))}
      </Groupe>

      <Groupe titre="Ton">
        {(['sombre', 'theme'] as const).map((t) => (
          <Case key={t} coche={filtres.tons.includes(t)} compte={compteTon(t)} onChange={() => { setFiltres((f) => ({ ...f, tons: basculer(f.tons, t) })) }}>
            {t === 'sombre' ? 'Toujours sombre' : 'Suit le theme'}
          </Case>
        ))}
      </Groupe>

      <Groupe titre="Scene">
        {(
          [
            ['toutes', 'Toutes', VITRINES.length],
            ['avec', 'Avec une scene de fond', compteScene(true)],
            ['sans', 'Sans scene', compteScene(false)],
          ] as const
        ).map(([valeur, libelle, compte]) => (
          <label key={valeur} className="o-flex o-cursor-pointer o-items-center o-gap-2.5 o-py-1.5 o-text-sm">
            <input type="radio" name="scene" value={valeur} checked={filtres.scene === valeur} onChange={() => { setFiltres((f) => ({ ...f, scene: valeur })) }} className="o-size-4 o-accent-brand-500 focus:o-ring" />
            <span className={`o-grow ${filtres.scene === valeur ? 'o-text-zinc-950 dark:o-text-zinc-50' : 'o-text-zinc-600 dark:o-text-zinc-400'}`}>{libelle}</span>
            <span className="o-font-mono o-text-xs o-tabular-nums o-text-zinc-500 dark:o-text-zinc-400">{compte}</span>
          </label>
        ))}
      </Groupe>

      {actifs > 0 && (
        <button
          type="button"
          onClick={() => {
            setFiltres(VIDE)
          }}
          className="o-inline-flex o-items-center o-gap-2 o-self-start o-rounded-full o-border-w-1 o-border-zinc-200 dark:o-border-zinc-700 o-px-3 o-py-1.5 o-text-sm o-text-zinc-700 dark:o-text-zinc-300 o-transition-colors hover:o-bg-zinc-100 dark:hover:o-bg-zinc-800 focus:o-ring"
        >
          <Icon icon={X} size={14} />
          Effacer les filtres ({actifs})
        </button>
      )}
    </div>
  )

  return (
    <>
      <PageHeader
        module="templates"
        title="Templates"
        lead={`${String(VITRINES.length)} pages d atterrissage completes, chacune d un metier different, batie avec les pieces du registre. Ouvrez-en une : c est le site, pas une capture.`}
      />

      <div className="o-grid o-gap-8 lg:o-grid-cols-12 lg:o-gap-10">
        {/* Le volet : colle sur grand ecran, replie sous 1024 px. */}
        <aside className="lg:o-col-span-3">
          <button
            type="button"
            aria-expanded={ouvert}
            aria-controls="volet-filtres"
            onClick={() => {
              setOuvert((o) => !o)
            }}
            className="o-flex o-w-full o-items-center o-justify-between o-rounded-2xl o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-900 o-px-4 o-py-3 o-text-sm o-font-medium o-text-zinc-900 dark:o-text-zinc-50 focus:o-ring lg:o-hidden"
          >
            <span>Filtres{actifs > 0 ? ` (${String(actifs)})` : ''}</span>
            <Icon icon={ouvert ? X : Search} size={16} aria-hidden="true" />
          </button>
          <div id="volet-filtres" className={`${ouvert ? 'o-mt-4 o-block' : 'o-hidden'} lg:o-sticky lg:o-mt-0 lg:o-block`} style={{ top: 117 }}>
            {volet}
          </div>
        </aside>

        <section className="o-min-w-0 lg:o-col-span-9" aria-live="polite">
          <div className="o-mb-5 o-flex o-flex-wrap o-items-center o-justify-between o-gap-3">
            <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
              {visibles.length === VITRINES.length ? `${String(VITRINES.length)} vitrines` : `${String(visibles.length)} sur ${String(VITRINES.length)}`}
            </p>
            <label className="o-flex o-items-center o-gap-2 o-text-sm">
              <span className="o-text-zinc-500 dark:o-text-zinc-400">Trier</span>
              <select
                value={filtres.tri}
                onChange={(e) => {
                  setFiltres((f) => ({ ...f, tri: e.target.value as Tri }))
                }}
                className="o-rounded-lg o-border-w-1 o-border-zinc-200 dark:o-border-zinc-700 o-bg-white dark:o-bg-zinc-900 o-px-2.5 o-py-1.5 o-text-sm o-text-zinc-900 dark:o-text-zinc-50 focus:o-ring"
              >
                {TRIS.map(([valeur, libelle]) => (
                  <option key={valeur} value={valeur}>{libelle}</option>
                ))}
              </select>
            </label>
          </div>

          {visibles.length === 0 ? (
            <div className="o-rounded-2xl o-border-w-1 o-border-dashed o-border-zinc-300 dark:o-border-zinc-700 o-px-6 o-py-16 o-text-center">
              <p className="o-m-0 o-text-lg o-font-medium">Aucune vitrine ne repond a ces filtres.</p>
              <p className="o-m-0 o-mt-2 o-text-sm o-text-zinc-500 dark:o-text-zinc-400">Essayez un mot plus court, ou retirez un filtre.</p>
              <button type="button" onClick={() => { setFiltres(VIDE) }} className="o-mt-5 o-inline-flex o-items-center o-gap-2 o-rounded-full o-border-w-1 o-border-zinc-300 dark:o-border-zinc-700 o-px-4 o-py-2 o-text-sm focus:o-ring">
                <Icon icon={X} size={14} /> Effacer les filtres
              </button>
            </div>
          ) : (
            <div className="o-grid o-gap-5 md:o-grid-cols-2 2xl:o-grid-cols-3">
              {visibles.map((v, rang) => (
                <CarteVitrine key={v.slug} vitrine={v} rang={rang} />
              ))}
            </div>
          )}
        </section>
      </div>

      <Reveal>
        <div className="o-mt-16 o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-pt-10">
          <h2 className="o-m-0 o-text-xl o-font-bold o-tracking-tight">Projets livres</h2>
          <p className="o-mt-2 o-max-w-prose o-text-sm o-text-zinc-600 dark:o-text-zinc-400">
            Des sites entiers, avec leur pile propre, livres dans{' '}
            <code className="o-font-mono o-text-xs">templates/</code>. On les clone
            et on les fait tourner — ce ne sont ni des apercus ni des projets vides.
          </p>
          <div className="o-mt-5 o-grid o-gap-4 md:o-grid-cols-2 xl:o-grid-cols-3">
            {PROJETS.map((projet) => (
              <CarteProjet key={projet.name} projet={projet} />
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal>
        <div className="o-mt-16 o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-pt-10">
          <h2 className="o-m-0 o-text-xl o-font-bold o-tracking-tight">Socles echafaudables</h2>
          <p className="o-mt-2 o-max-w-prose o-text-sm o-text-zinc-600 dark:o-text-zinc-400">
            Une vitrine se lit ; un socle s installe. Ces deux-la sortent un projet vide mais cable, ou reposer les pieces du{' '}
            <Link to="/docs/registre" className="lien">registre</Link>.
          </p>
          <div className="o-mt-5 o-grid o-gap-4 md:o-grid-cols-2">
            {TEMPLATES.map((t) => (
              <CarteSocle key={t.slug} template={t} />
            ))}
          </div>
          <p className="o-mt-6 o-flex o-items-center o-gap-2 o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
            <Icon icon={ArrowRight} size={14} />
            Chaque vitrine se retinte depuis sa barre, une fois ouverte.
          </p>
        </div>
      </Reveal>
    </>
  )
}
