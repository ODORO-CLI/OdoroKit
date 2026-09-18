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
import {
  ArrowRight,
  ArrowUpRight,
  ChevronLeft,
  LayoutGrid,
  Search,
  Server,
  SlidersHorizontal,
  X,
} from '@odoro-cli/icons/outline'
import { Reveal } from '@odoro-cli/libs/motion'
import { Link } from '@odoro-cli/libs/router'
import { SelectMenu } from '@odoro-cli/libs/ui'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type SyntheticEvent,
} from 'react'

import { TEMPLATES, type Template } from '../templates.js'
import { TEMPLATES as PROJETS, type TemplateEntry } from '../templates.generated.js'
import {
  SECTEURS,
  VITRINES,
  type Vitrine,
  type VitrineSecteur,
} from '../vitrines/index.js'

/* ============================ L apercu ================================= */

/** Identifiant de la feuille de l apercu. */
const STYLE_APERCU = 'o-vitrine-apercu'

/**
 * Les surfaces de la galerie.
 *
 * Le systeme ne decline pas ses echelles de noir et de blanc en `dark:` : les
 * surfaces viennent des jetons `--o-chrome-*`, qui basculent avec le theme du
 * site. Le filet, la tige et le verre reprennent le vocabulaire de la colonne
 * de la documentation.
 */
const FEUILLE_GALERIE = [
  '.tp-filet{background-color:var(--o-chrome-filet)}',
  '.tp-tige{background-image:linear-gradient(180deg,',
  'color-mix(in oklab,var(--o-palette-brand-500) 15%,transparent),',
  'var(--o-palette-brand-500) 48%,',
  'color-mix(in oklab,var(--o-palette-brand-500) 15%,transparent))}',
  '.tp-ligne:hover .tp-filet{background-color:var(--o-chrome-filet-survol)}',
  '.tp-verre{background-color:var(--o-chrome-verre);',
  'border-color:var(--o-chrome-filet)}',
  '.tp-touche{border-color:var(--o-chrome-filet-net)}',
  '.tp-carte{background-color:var(--o-chrome-carte);',
  'border-color:var(--o-chrome-filet-doux);',
  'transition:border-color 220ms,background-color 220ms}',
  '.tp-carte:hover{border-color:color-mix(in oklab,var(--o-palette-brand-500) 55%,transparent);',
  'background-color:var(--o-chrome-carte-survol)}',
].join('')

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
    style.textContent = CSS_APERCU + FEUILLE_GALERIE
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

/* ============================ Les trois familles ======================= */

/**
 * Une entree de la bibliotheque, quelle que soit sa famille.
 *
 * Les trois ne se ressemblent pas : une vitrine est une page qu on ouvre ici
 * meme, un projet livre est un site entier qu on clone, un socle est une
 * commande qui echafaude. Elles partagent pourtant ce qu il faut pour etre
 * cherchees et triees ensemble — un nom, un resume, un texte ou lire.
 */
type Famille = 'vitrine' | 'projet' | 'socle'

interface Entree {
  readonly famille: Famille
  readonly cle: string
  readonly titre: string
  readonly corpus: string
  readonly vitrine?: Vitrine
  readonly projet?: TemplateEntry
  readonly socle?: Template
}

const FAMILLES = [
  ['vitrine', 'Vitrines'],
  ['projet', 'Projets livrés'],
  ['socle', 'Socles'],
] as const

/**
 * La bibliotheque entiere, dans l ordre ou elle se presente : les vitrines,
 * puis les projets livres, puis les socles.
 */
const BIBLIOTHEQUE: readonly Entree[] = [
  ...VITRINES.map(
    (v): Entree => ({
      famille: 'vitrine',
      cle: `vitrine:${v.slug}`,
      titre: v.titre,
      corpus: corpus(v),
      vitrine: v,
    }),
  ),
  ...PROJETS.map(
    (p): Entree => ({
      famille: 'projet',
      cle: `projet:${p.name}`,
      titre: p.title,
      corpus: [p.title, p.name, p.description, ...(p.tags ?? []), ...p.stack]
        .join(' ')
        .toLowerCase(),
      projet: p,
    }),
  ),
  ...TEMPLATES.map(
    (t): Entree => ({
      famille: 'socle',
      cle: `socle:${t.slug}`,
      titre: t.title,
      corpus: [t.title, t.slug, t.description, ...t.includes, t.audience ?? '']
        .join(' ')
        .toLowerCase(),
      socle: t,
    }),
  ),
]

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
    <div
      data-o-apercu=""
      className={`o-relative o-h-60 o-overflow-hidden ${vitrine.apercu}`}
      aria-hidden="true"
    >
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
            Scène
          </span>
        )}
      </span>
      <span className="o-absolute o-bottom-3 o-left-3 o-flex o-gap-1.5">
        {vitrine.palette.map((token) => (
          <span
            key={token}
            className="o-size-4 o-rounded-full o-border-w-1"
            style={{
              backgroundColor: `var(${token})`,
              borderColor: 'color-mix(in oklab, white 55%, transparent)',
            }}
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
function CarteVitrine({
  vitrine,
  rang,
}: {
  readonly vitrine: Vitrine
  readonly rang: number
}): ReactElement {
  const secteur =
    SECTEURS.find(([cle]) => cle === vitrine.secteur)?.[1] ?? vitrine.secteur
  const pieces = vitrine.pieces.slice(0, 3)
  const reste = vitrine.pieces.length - pieces.length
  return (
    <Link
      to={`/templates/${vitrine.slug}`}
      data-o-carte=""
      aria-label={`${vitrine.titre} — ${vitrine.metier}`}
      className="tp-carte o-flex o-flex-col o-overflow-hidden o-rounded-2xl o-border-w-1 o-no-underline o-text-zinc-900 dark:o-text-zinc-50 o-transition-colors focus:o-ring"
    >
      <Apercu vitrine={vitrine} />
      <div className="o-flex o-flex-1 o-flex-col o-gap-2 o-p-5">
        <p className="o-m-0 o-flex o-items-center o-justify-between o-gap-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
          <span>{vitrine.metier}</span>
          <span className="o-tabular-nums">{String(rang + 1).padStart(2, '0')}</span>
        </p>
        <h3
          className="o-m-0 o-text-2xl o-font-light o-tracking-tight"
          style={{ fontFamily: 'var(--o-font-sans)' }}
        >
          {vitrine.titre}
        </h3>
        <p className="o-m-0 o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
          {vitrine.resume}
        </p>
        <div className="o-mt-auto o-flex o-flex-wrap o-items-center o-gap-1.5 o-pt-3">
          <span className="tp-touche o-rounded-full o-border-w-1 o-px-2.5 o-py-0.5 o-text-xs o-text-zinc-600 dark:o-text-zinc-300">
            {secteur}
          </span>
          {pieces.map((piece) => (
            <span
              key={piece}
              className="o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400"
            >
              {piece.split('/')[1]}
            </span>
          ))}
          {reste > 0 && (
            <span className="o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
              +{reste}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

/** Une carte de socle echafaudable. */
/**
 * Une carte de projet livré.
 *
 * Elle est celle d une vitrine, et c est voulu : dans une grille ou les trois
 * familles se cotoient, une carte qui se dessine autrement se lit comme une
 * autre sorte d objet. Toute la carte est un lien, la capture porte ses
 * pastilles, et le bas porte la pile plutot que le secteur.
 *
 * L archive et le depot n y sont plus. Une carte entierement cliquable ne peut
 * pas contenir d autres liens — deux ancres imbriquees ne sont pas du HTML —
 * et ces deux sorties vivent dans le bandeau de la page du projet, ou l on
 * arrive d un clic.
 *
 * L aperçu vit sous `apercus-templates/` et non `templates/` : ce dernier est
 * l espace de routage des vitrines, et un dossier reel a cette adresse masquait
 * la page d index derriere un 403 de nginx.
 */
function CarteProjet({
  projet,
  rang,
}: {
  readonly projet: TemplateEntry
  readonly rang: number
}): ReactElement {
  const pile = projet.stack.slice(0, 3)
  const reste = projet.stack.length - pile.length
  const genre =
    projet.kind === 'site' ? 'Site' : projet.kind === 'starter' ? 'Socle' : 'Bibliothèque'

  return (
    <Link
      to={`/templates/projet/${projet.name}`}
      data-o-carte=""
      aria-label={`${projet.title} — projet livré`}
      className="tp-carte o-flex o-flex-col o-overflow-hidden o-rounded-2xl o-border-w-1 o-no-underline o-text-zinc-900 dark:o-text-zinc-50 o-transition-colors focus:o-ring"
    >
      <div className="o-relative o-h-60 o-overflow-hidden" aria-hidden="true">
        <img
          src={`/apercus-templates/${projet.name}.jpg`}
          alt=""
          loading="lazy"
          decoding="async"
          className="o-h-full o-w-full o-object-cover"
          onError={(evenement) => {
            evenement.currentTarget.style.display = 'none'
          }}
        />
        {/* Les memes pastilles de verre qu une vitrine, sur ce qui distingue
            un projet : il se clone, et il porte parfois une scene. */}
        <span className="o-absolute o-left-3 o-top-3 o-flex o-gap-1.5">
          <span className="o-rounded-full o-border-w-1 o-border-white-20 o-bg-black-60 o-px-2 o-py-0.5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-white o-backdrop-blur-md">
            Projet livré
          </span>
          {projet.stack.some((x) => /three|webgl|cannon/i.test(x)) && (
            <span className="o-rounded-full o-border-w-1 o-border-white-20 o-bg-black-60 o-px-2 o-py-0.5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-white o-backdrop-blur-md">
              Scène
            </span>
          )}
        </span>
      </div>

      <div className="o-flex o-flex-1 o-flex-col o-gap-2 o-p-5">
        <p className="o-m-0 o-flex o-items-center o-justify-between o-gap-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
          <span>{genre}</span>
          <span className="o-tabular-nums">{String(rang + 1).padStart(2, '0')}</span>
        </p>
        <h3
          className="o-m-0 o-text-2xl o-font-light o-tracking-tight"
          style={{ fontFamily: 'var(--o-font-sans)' }}
        >
          {projet.title}
        </h3>
        <p className="o-m-0 o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
          {projet.description}
        </p>
        <div className="o-mt-auto o-flex o-flex-wrap o-items-center o-gap-1.5 o-pt-3">
          <span className="tp-touche o-rounded-full o-border-w-1 o-px-2.5 o-py-0.5 o-text-xs o-text-zinc-600 dark:o-text-zinc-300">
            {pile[0] ?? 'Odoro'}
          </span>
          {pile.slice(1).map((x) => (
            <span
              key={x}
              className="o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400"
            >
              {x}
            </span>
          ))}
          {reste > 0 && (
            <span className="o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
              +{reste}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}

function CarteSocle({ template }: { readonly template: Template }): ReactElement {
  const livre = template.status === 'disponible'
  return (
    <article
      className={[
        'o-flex o-min-w-0 o-flex-col o-gap-3 o-rounded-2xl o-border-w-1 o-p-6',
        livre
          ? 'o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-900'
          : 'o-border-dashed o-border-zinc-300 dark:o-border-zinc-700',
      ].join(' ')}
    >
      <div className="o-flex o-items-center o-gap-2">
        <Icon
          icon={template.slug.includes('server') ? Server : LayoutGrid}
          size={20}
          className="o-text-brand-600 dark:o-text-brand-400"
        />
        <h3 className="o-m-0 o-text-lg o-font-semibold o-tracking-tight">
          {template.title}
        </h3>
        {!livre && (
          <span className="o-rounded-full o-border-w-1 o-px-2 o-py-0.5 o-text-xs o-opacity-70">
            à venir
          </span>
        )}
      </div>
      <p className="o-m-0 o-text-sm o-text-zinc-600 dark:o-text-zinc-400">
        {template.description}
      </p>
      <ul className="o-m-0 o-flex o-list-none o-flex-wrap o-gap-1.5 o-p-0">
        {template.includes.map((x) => (
          <li
            key={x}
            className="o-rounded-md o-bg-zinc-100 dark:o-bg-zinc-800 o-px-2 o-py-1 o-text-xs"
          >
            {x}
          </li>
        ))}
      </ul>
      {/* La commande d echafaudage n est plus dans la carte : elle est la meme
          a un mot pres pour les deux socles, et un bloc de code ne ressemble
          plus aux cartes qui l entourent. Elle reste a un clic — la page du
          moteur la donne, avec le drapeau que ce socle demande. */}
      {livre ? (
        <p className="o-m-0 o-mt-auto o-pt-2 o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
          Échafaudé par le moteur, avec le drapeau{' '}
          <code className="o-font-mono o-text-xs">{template.slug}</code> —{' '}
          <Link to="/docs/engine" className="lien">
            la commande
          </Link>
          .
        </p>
      ) : (
        <p className="o-m-0 o-mt-auto o-pt-2 o-text-sm o-italic o-text-zinc-500 dark:o-text-zinc-400">
          Ce socle n’est pas encore livre — la commande ne fonctionnerait pas.
        </p>
      )}
    </article>
  )
}

/* ============================ Le volet de filtres ====================== */

/**
 * Une gelule de filtre, avec son compte.
 *
 * C est la meme forme que les liens de la barre : une gelule qui s allume.
 * Le controle reste une vraie case a cocher, rendue invisible — le clavier,
 * le lecteur d ecran et le groupe de champs continuent de fonctionner, ce
 * qu un bouton n aurait pas donne gratuitement.
 */
function Case({
  coche,
  onChange,
  children,
  compte,
  rond = false,
  nom,
}: {
  readonly coche: boolean
  readonly onChange: () => void
  readonly children: string
  readonly compte: number
  /** Vrai pour un choix unique : le controle est alors un bouton radio. */
  readonly rond?: boolean
  readonly nom?: string
}): ReactElement {
  return (
    <label
      className={`tp-ligne o-relative o-flex o-cursor-pointer o-items-center o-gap-2.5 o-py-1.5 o-pl-5 o-text-sm o-transition-colors ${
        coche
          ? 'o-font-medium o-text-brand-600 dark:o-text-brand-300'
          : 'o-text-zinc-600 dark:o-text-zinc-300 hover:o-text-zinc-950 dark:hover:o-text-zinc-50'
      }`}
    >
      {/* La tige : le filet au repos, le degrade d accent quand le filtre est
          retenu — le meme vocabulaire que la colonne de la documentation. */}
      <span
        aria-hidden="true"
        className={`o-absolute o-inset-y-0 o-left-0 o-w-px ${coche ? 'tp-tige' : 'tp-filet'}`}
      />
      <input
        type={rond ? 'radio' : 'checkbox'}
        {...(nom === undefined ? {} : { name: nom })}
        checked={coche}
        onChange={onChange}
        className="o-sr-only"
      />
      {/* Le temoin : un rond plein pour un choix unique, un carre pour un
          choix multiple. Il remplace la case du navigateur, qui ne se laisse
          pas mettre a la forme du reste. */}
      <span
        aria-hidden="true"
        className={`o-inline-flex o-size-3.5 o-shrink-0 o-items-center o-justify-center o-border-w-1 ${rond ? 'o-rounded-full' : 'o-rounded-sm'} ${
          coche
            ? 'o-border-brand-500 o-bg-brand-500'
            : 'o-border-zinc-300 dark:o-border-zinc-700'
        }`}
      >
        {coche && (
          <span
            className={`o-block o-bg-white ${rond ? 'o-size-1.5 o-rounded-full' : 'o-size-1.5 o-rounded-sm'}`}
          />
        )}
      </span>
      <span className="o-grow">{children}</span>
      <span className="o-font-mono o-text-xs o-tabular-nums o-text-zinc-500 dark:o-text-zinc-400">
        {compte}
      </span>
    </label>
  )
}

/** Un groupe du volet : un intitule en mono, et ses gelules. */
function Groupe({
  titre,
  children,
}: {
  readonly titre: string
  readonly children: ReactElement | ReactElement[]
}): ReactElement {
  return (
    <fieldset className="o-m-0 o-w-full o-p-0 o-pt-6" style={{ border: 0 }}>
      <legend className="o-flex o-w-full o-items-center o-gap-3 o-pb-2 o-pl-5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
        {titre}
        <span aria-hidden="true" className="tp-filet o-h-px o-flex-1" />
      </legend>
      <div className="o-flex o-flex-col">{children}</div>
    </fieldset>
  )
}

/** Cle de persistance du volet replie. */
const CLE_VOLET = 'odoro-templates-volet'

/** Le volet etait-il replie a la derniere visite ? */
function voletReplie(): boolean {
  try {
    return localStorage.getItem(CLE_VOLET) === '1'
  } catch {
    return false
  }
}

/** L etat des filtres. */
interface Filtres {
  readonly recherche: string
  readonly familles: readonly Famille[]
  readonly secteurs: readonly VitrineSecteur[]
  readonly tons: readonly ('sombre' | 'theme')[]
  readonly scene: 'toutes' | 'avec' | 'sans'
  readonly tri: Tri
}

const VIDE: Filtres = {
  recherche: '',
  familles: [],
  secteurs: [],
  tons: [],
  scene: 'toutes',
  tri: 'registre',
}

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
  const [replie, setReplie] = useState(() => voletReplie())

  // Le choix survit a la visite : on ne replie pas un volet deux fois.
  useEffect(() => {
    try {
      localStorage.setItem(CLE_VOLET, replie ? '1' : '0')
    } catch {
      // Stockage indisponible : le choix vivra le temps de la session.
    }
  }, [replie])
  const champ = useRef<HTMLInputElement>(null)

  // « / » va a la recherche, comme sur la plupart des places de marche.
  useEffect(() => {
    const surTouche = (e: KeyboardEvent): void => {
      const cible = e.target
      if (
        e.key === '/' &&
        !(cible instanceof HTMLInputElement || cible instanceof HTMLTextAreaElement)
      ) {
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

    /*
     * Un filtre propre aux vitrines — secteur, ton, scene — ne s applique
     * qu a elles. Mais il ne peut pas non plus laisser passer les deux autres
     * familles comme si de rien n etait : demander « les vitrines sombres »
     * pour se voir repondre par trois socles n aurait aucun sens. Un tel filtre
     * retire donc les autres familles.
     */
    const propreAuxVitrines =
      filtres.secteurs.length > 0 || filtres.tons.length > 0 || filtres.scene !== 'toutes'

    let liste = BIBLIOTHEQUE.filter((e) => {
      if (filtres.familles.length > 0 && !filtres.familles.includes(e.famille))
        return false
      if (propreAuxVitrines && e.famille !== 'vitrine') return false

      const v = e.vitrine
      if (v !== undefined) {
        if (filtres.secteurs.length > 0 && !filtres.secteurs.includes(v.secteur))
          return false
        if (filtres.tons.length > 0 && !filtres.tons.includes(ton(v))) return false
        if (filtres.scene === 'avec' && !aUneScene(v)) return false
        if (filtres.scene === 'sans' && aUneScene(v)) return false
      }

      if (mots.length > 0 && !mots.every((m) => e.corpus.includes(m))) return false
      return true
    })

    if (filtres.tri === 'nom')
      liste = [...liste].sort((a, b) => a.titre.localeCompare(b.titre, 'fr'))
    if (filtres.tri === 'secteur')
      liste = [...liste].sort(
        (a, b) =>
          (a.vitrine?.secteur ?? '').localeCompare(b.vitrine?.secteur ?? '', 'fr') ||
          a.titre.localeCompare(b.titre, 'fr'),
      )
    if (filtres.tri === 'recentes') liste = [...liste].reverse()
    return liste
  }, [filtres])

  const actifs =
    filtres.familles.length +
    filtres.secteurs.length +
    filtres.tons.length +
    (filtres.scene === 'toutes' ? 0 : 1) +
    (filtres.recherche.trim() === '' ? 0 : 1)
  const compteFamille = (f: Famille): number =>
    BIBLIOTHEQUE.filter((e) => e.famille === f).length
  const compteSecteur = (cle: VitrineSecteur): number =>
    VITRINES.filter((v) => v.secteur === cle).length
  const compteTon = (t: 'sombre' | 'theme'): number =>
    VITRINES.filter((v) => ton(v) === t).length
  const compteScene = (avec: boolean): number =>
    VITRINES.filter((v) => aUneScene(v) === avec).length

  const volet = (
    <div className="o-flex o-flex-col o-gap-4">
      <label className="o-relative o-block">
        <span className="o-sr-only">Rechercher une vitrine</span>
        <Icon
          icon={Search}
          size={16}
          className="o-pointer-events-none o-absolute o-left-4 o-top-1/2 o-text-zinc-400"
          style={{ transform: 'translateY(-50%)' }}
        />
        <input
          ref={champ}
          type="search"
          value={filtres.recherche}
          onChange={(e) => {
            setFiltres((f) => ({ ...f, recherche: e.target.value }))
          }}
          placeholder="Rechercher — un metier, une piece, un nom"
          className="tp-verre o-w-full o-rounded-full o-border-w-1 o-py-3 o-pl-10 o-pr-10 o-text-sm o-text-zinc-900 dark:o-text-zinc-50 focus:o-ring"
        />
        <kbd
          className="tp-touche o-pointer-events-none o-absolute o-right-3 o-top-1/2 o-rounded-full o-border-w-1 o-px-2 o-py-0.5 o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400"
          style={{ transform: 'translateY(-50%)' }}
        >
          /
        </kbd>
      </label>

      {/* La famille passe en premier : c est elle qui dit de quoi on parle, et
          les trois autres groupes ne concernent que les vitrines. */}
      <Groupe titre="Famille">
        {FAMILLES.map(([cle, libelle]) => (
          <Case
            key={cle}
            coche={filtres.familles.includes(cle)}
            compte={compteFamille(cle)}
            onChange={() => {
              setFiltres((f) => ({ ...f, familles: basculer(f.familles, cle) }))
            }}
          >
            {libelle}
          </Case>
        ))}
      </Groupe>

      <Groupe titre="Secteur">
        {SECTEURS.map(([cle, libelle]) => (
          <Case
            key={cle}
            coche={filtres.secteurs.includes(cle)}
            compte={compteSecteur(cle)}
            onChange={() => {
              setFiltres((f) => ({ ...f, secteurs: basculer(f.secteurs, cle) }))
            }}
          >
            {libelle}
          </Case>
        ))}
      </Groupe>

      <Groupe titre="Ton">
        {(['sombre', 'theme'] as const).map((t) => (
          <Case
            key={t}
            coche={filtres.tons.includes(t)}
            compte={compteTon(t)}
            onChange={() => {
              setFiltres((f) => ({ ...f, tons: basculer(f.tons, t) }))
            }}
          >
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
          <Case
            key={valeur}
            rond
            nom="scene"
            coche={filtres.scene === valeur}
            compte={compte}
            onChange={() => {
              setFiltres((f) => ({ ...f, scene: valeur }))
            }}
          >
            {libelle}
          </Case>
        ))}
      </Groupe>

      {actifs > 0 && (
        <button
          type="button"
          onClick={() => {
            setFiltres(VIDE)
          }}
          className="tp-verre o-mt-6 o-inline-flex o-items-center o-gap-2 o-self-start o-rounded-full o-border-w-1 o-px-4 o-py-2 o-text-sm o-text-zinc-700 dark:o-text-zinc-300 o-transition-opacity hover:o-opacity-70 focus:o-ring"
        >
          <Icon icon={X} size={14} />
          Effacer les filtres ({actifs})
        </button>
      )}
    </div>
  )

  return (
    <>
      {/* L en-tete reprend la composition de la page d accueil : une rubrique
          en mono prolongee d un filet, puis le titre d affichage en graisse
          legere — et non le titre gras des pages de documentation. */}
      <header className="o-mb-14 o-flex o-flex-col o-gap-5 o-pb-10">
        <p className="o-m-0 o-flex o-items-center o-gap-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
          <span className="o-text-brand-600 dark:o-text-brand-300">(00)</span>
          Templates
          <span aria-hidden="true" className="tp-filet o-h-px o-flex-1" />
        </p>
        <h1
          className="o-m-0 o-max-w-3xl o-text-balance o-font-light o-tracking-tight"
          style={{ fontSize: 'clamp(2.25rem, 5vw, 4rem)', lineHeight: 1.02 }}
        >
          La bibliothèque, ouverte.
        </h1>
        <p className="o-m-0 o-max-w-prose o-text-pretty o-text-lg o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-300">
          {VITRINES.length} pages d’atterrissage complètes, chacune d’un metier
          different, baties avec les pieces du registre : ouvrez-en une, c’est le site
          et pas une capture. Puis {PROJETS.length} projets livrés — des sites entiers,
          qu’on clone et qu’on fait tourner — et {TEMPLATES.length} socles, qui
          échafaudent un projet vide mais câblé.
        </p>
      </header>

      <div className="o-grid o-gap-8 lg:o-grid-cols-12 lg:o-gap-10">
        {/* Le volet : colle sur grand ecran, et repliable — sous 1024 px
            derriere son bouton, au-dessus par la chevronne de son en-tete.
            Replie, il rend ses trois colonnes a la grille. */}
        <aside className={replie ? 'lg:o-hidden' : 'lg:o-col-span-3'}>
          <button
            type="button"
            aria-expanded={ouvert}
            aria-controls="volet-filtres"
            onClick={() => {
              setOuvert((o) => !o)
            }}
            className="tp-verre o-flex o-w-full o-items-center o-justify-between o-rounded-full o-border-w-1 o-px-5 o-py-3 o-text-sm o-font-medium o-text-zinc-900 dark:o-text-zinc-50 focus:o-ring lg:o-hidden"
          >
            <span>Filtres{actifs > 0 ? ` (${String(actifs)})` : ''}</span>
            <Icon icon={ouvert ? X : Search} size={16} aria-hidden="true" />
          </button>
          <div
            id="volet-filtres"
            className={`${ouvert ? 'o-mt-4 o-block' : 'o-hidden'} ${replie ? '' : 'lg:o-sticky lg:o-mt-0 lg:o-block'}`}
            style={{ top: 96 }}
          >
            {/* L en-tete du volet, sur grand ecran seulement : le petit ecran
                a deja son bouton au-dessus. */}
            <div className="max-lg:o-hidden o-flex o-items-center o-gap-3 o-pb-1">
              <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                Filtres
              </span>
              <span aria-hidden="true" className="tp-filet o-h-px o-flex-1" />
              <button
                type="button"
                onClick={() => {
                  setReplie(true)
                }}
                aria-expanded
                aria-controls="volet-filtres"
                title="Replier les filtres"
                className="o-inline-flex o-size-7 o-cursor-pointer o-items-center o-justify-center o-rounded-full o-text-zinc-500 dark:o-text-zinc-400 o-transition-colors hover:o-text-zinc-950 dark:hover:o-text-zinc-50 focus:o-ring"
              >
                <span className="o-sr-only">Replier les filtres</span>
                <Icon icon={ChevronLeft} size={16} aria-hidden="true" />
              </button>
            </div>
            {volet}
          </div>
        </aside>

        <section
          className={`o-min-w-0 ${replie ? 'lg:o-col-span-12' : 'lg:o-col-span-9'}`}
          aria-live="polite"
        >
          <div className="o-mb-5 o-flex o-flex-wrap o-items-center o-justify-between o-gap-3">
            <div className="o-flex o-items-center o-gap-4">
              {/* Il ne parait que le volet replie : sinon, le volet porte sa
                  propre chevronne. */}
              {replie && (
                <button
                  type="button"
                  onClick={() => {
                    setReplie(false)
                  }}
                  aria-expanded={false}
                  aria-controls="volet-filtres"
                  className="tp-verre max-lg:o-hidden o-inline-flex o-cursor-pointer o-items-center o-gap-2 o-rounded-full o-border-w-1 o-px-4 o-py-2 o-text-sm o-text-zinc-700 dark:o-text-zinc-300 o-transition-opacity hover:o-opacity-70 focus:o-ring"
                >
                  <Icon icon={SlidersHorizontal} size={15} aria-hidden="true" />
                  Filtres
                  {actifs > 0 && (
                    <span className="o-font-mono o-text-xs o-tabular-nums o-text-brand-600 dark:o-text-brand-300">
                      {actifs}
                    </span>
                  )}
                </button>
              )}
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                {visibles.length === BIBLIOTHEQUE.length
                  ? `${String(BIBLIOTHEQUE.length)} entrées`
                  : `${String(visibles.length)} sur ${String(BIBLIOTHEQUE.length)}`}
              </p>
            </div>
            {/* La liste deroulante est celle de la librairie, pas celle du
                navigateur : un menu natif se peint par le systeme, garde ses
                coins carres et son surlignage bleu, et jurait avec le reste. */}
            <div className="o-flex o-items-center o-gap-3 o-text-sm">
              <span
                id="tri-des-vitrines"
                className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400"
              >
                Trier
              </span>
              <SelectMenu
                className="o-w-56"
                options={TRIS.map(([valeur, libelle]) => ({
                  value: valeur,
                  label: libelle,
                }))}
                value={filtres.tri}
                onValueChange={(valeur) => {
                  setFiltres((f) => ({ ...f, tri: valeur as Tri }))
                }}
              />
            </div>
          </div>

          {visibles.length === 0 ? (
            <div className="tp-verre o-rounded-2xl o-border-w-1 o-px-6 o-py-20 o-text-center">
              <p className="o-m-0 o-text-lg o-font-medium">
                Rien ne répond a ces filtres.
              </p>
              <p className="o-m-0 o-mt-2 o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
                Essayez un mot plus court, ou retirez un filtre.
              </p>
              <button
                type="button"
                onClick={() => {
                  setFiltres(VIDE)
                }}
                className="o-mt-5 o-inline-flex o-items-center o-gap-2 o-rounded-full o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-px-5 o-py-2.5 o-text-sm focus:o-ring"
              >
                <Icon icon={X} size={14} /> Effacer les filtres
              </button>
            </div>
          ) : (
            <div className="o-grid o-gap-5 md:o-grid-cols-2 2xl:o-grid-cols-3">
              {visibles.map((entree, rang) =>
                entree.vitrine !== undefined ? (
                  <CarteVitrine
                    key={entree.cle}
                    vitrine={entree.vitrine}
                    rang={rang}
                  />
                ) : entree.projet !== undefined ? (
                  <CarteProjet key={entree.cle} projet={entree.projet} rang={rang} />
                ) : entree.socle !== undefined ? (
                  <CarteSocle key={entree.cle} template={entree.socle} />
                ) : null,
              )}
            </div>
          )}
        </section>
      </div>

      <Reveal>
        <p className="o-mt-16 o-flex o-items-center o-gap-2 o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-pt-10 o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
          <Icon icon={ArrowRight} size={14} />
          Chaque vitrine se retinte depuis sa barre, une fois ouverte. Un projet
          livré se clone ; un socle s&rsquo;échafaude.
        </p>
      </Reveal>

    </>
  )
}
