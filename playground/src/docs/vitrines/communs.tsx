/**
 * Les pieces communes des vitrines.
 *
 * ## Pourquoi elles vivent ici
 *
 * Les vitrines recentes partagent un vocabulaire : une barre en pilule qui
 * flotte, un intitule de section numerote, un rail de chiffres colle a un bord,
 * un nom pose en filigrane derriere le titre. Ce vocabulaire n est pas une
 * decoration : c est ce qui fait qu une page se lit comme un site recent plutot
 * que comme une fiche de documentation.
 *
 * Le recopier dans chaque vitrine avait deux couts. Le premier est la
 * duplication — trente lignes identiques par fichier. Le second est pire : les
 * copies derivent. Une vitrine finissait avec un gris trop pale dans sa barre,
 * une autre avec un intitule sans numero, et l ensemble cessait d avoir l air
 * dessine par la meme main.
 *
 * ## Ce que ces pieces ne font pas
 *
 * Elles ne decident pas de la **composition**. Chaque vitrine choisit ou tombe
 * son heros, ce qui occupe le centre, ce qui se colle aux bords. Ces pieces-ci
 * ne fournissent que la matiere : une barre, un intitule, un rail. C est la
 * difference entre un gabarit — qui rendrait toutes les vitrines semblables —
 * et une trousse.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import { type IconData } from '@odoro-cli/icons'
import { Marquee } from '@/odoro/effect/Marquee.jsx'
import { type CSSProperties, type ReactElement, type ReactNode } from 'react'

import { encre, encreSurSombre } from './palettes.js'

/**
 * La nuit d une bande.
 *
 * Certaines sections sont sombres dans les deux themes : un heros qui porte une
 * scene lumineuse, une carte de restaurant, un pied de page. Redeclarer les
 * variables du theme sur l element plutot que d y poser des classes en dur
 * laisse les pieces du registre s y adapter seules — un bouton de la
 * bibliotheque pose la-dedans se peint en sombre sans qu on le lui dise.
 *
 * @param famille Le neutre employe. `zinc` par defaut ; `stone` pour une page
 *   chaude, `slate` pour une page froide.
 *
 * @example
 * <header style={nuit('stone')}>…</header>
 */
export function nuit(
  famille: 'zinc' | 'stone' | 'slate' | 'neutral' = 'zinc',
): CSSProperties {
  return {
    colorScheme: 'dark',
    backgroundColor: 'var(--o-theme-bg)',
    color: 'var(--o-theme-fg)',
    '--o-theme-bg': `var(--o-palette-${famille}-950)`,
    '--o-theme-surface': `var(--o-palette-${famille}-900)`,
    '--o-theme-fg': `var(--o-palette-${famille}-50)`,
    '--o-theme-muted': `var(--o-palette-${famille}-400)`,
    '--o-theme-line': `var(--o-palette-${famille}-800)`,
  } as CSSProperties
}

/**
 * Le bouton principal : une gelule pleine.
 *
 * Les classes seules ; le fond et l encre viennent de {@link aplat}, pose en
 * style, parce qu eux dependent de la couleur choisie dans la barre.
 */
export const GELULE =
  'o-inline-flex o-items-center o-gap-2 o-rounded-full o-px-6 o-py-3 o-text-sm o-font-semibold o-no-underline o-transition-opacity hover:o-opacity-85 focus:o-ring'

/** Le bouton secondaire, sur une bande sombre : borde, transparent. */
export const GELULE_SUR_NUIT =
  'o-inline-flex o-items-center o-gap-2 o-rounded-full o-border-w-1 o-px-6 o-py-3 o-text-sm o-font-semibold o-no-underline o-transition-colors focus:o-ring'

/** Le bouton secondaire, sur une bande claire. */
export const GELULE_CLAIRE =
  'o-inline-flex o-items-center o-gap-2 o-rounded-full o-border-w-1 o-border-zinc-300 dark:o-border-zinc-700 o-px-6 o-py-3 o-text-sm o-font-semibold o-no-underline hover:o-bg-zinc-100 dark:hover:o-bg-zinc-900 o-transition-colors focus:o-ring'

/**
 * La barre en pilule, posee au-dessus du contenu.
 *
 * Elle flotte plutot que de coller au bord : c est ce qui la distingue d un
 * bandeau de documentation, et c est devenu le signe d un site recent. Sur une
 * bande sombre elle se pose en `absolute` par-dessus la scene ; sur une page
 * claire, `sticky` lui va mieux, parce qu il n y a rien a laisser voir dessous.
 *
 * @param marque Le nom affiche a gauche.
 * @param icone Le pictogramme de la marque.
 * @param liens Les rubriques, en couples cible / libelle.
 * @param sombre Vrai quand la barre est posee sur une bande toujours sombre.
 * @param collante Vrai pour une barre qui suit le defilement au lieu de flotter
 *   au-dessus d un heros.
 *
 * @example
 * <BarrePilule marque="Cytea" icone={Dna} liens={NAVIGATION} sombre />
 */
export function BarrePilule({
  marque,
  icone,
  liens,
  sombre = false,
  collante = false,
  mono = false,
}: {
  readonly marque: string
  readonly icone: IconData
  readonly liens: readonly (readonly [string, string])[]
  readonly sombre?: boolean
  readonly collante?: boolean
  readonly mono?: boolean
}): ReactElement {
  const cadre = collante
    ? 'o-sticky o-top-0 o-z-30 o-flex o-justify-center o-px-4 o-pt-6'
    : 'o-absolute o-inset-x-0 o-top-0 o-z-30 o-flex o-justify-center o-px-4 o-pt-6'

  return (
    <div className={cadre}>
      <div
        className={`o-flex o-max-w-full o-items-center o-gap-1 o-overflow-x-auto o-rounded-full o-border-w-1 o-px-2 o-py-2 o-backdrop-blur-lg ${
          sombre ? 'o-border-zinc-700' : 'o-border-zinc-200 dark:o-border-zinc-800'
        }`}
        style={{
          backgroundColor: sombre
            ? 'color-mix(in oklab, var(--o-palette-zinc-950) 58%, transparent)'
            : 'color-mix(in oklab, var(--o-theme-bg) 78%, transparent)',
        }}
      >
        <span
          className={`o-flex o-shrink-0 o-items-center o-gap-2 o-px-3 o-text-sm o-font-bold o-tracking-tight ${
            mono ? 'o-font-mono' : ''
          } ${sombre ? 'o-text-zinc-50 dark:o-text-zinc-50' : ''}`}
        >
          <Icon
            icon={icone}
            size={17}
            style={{ color: sombre ? encreSurSombre() : encre() }}
            aria-hidden="true"
          />
          {marque}
        </span>
        <span
          className={`max-md:o-hidden o-h-5 o-w-px o-shrink-0 ${
            sombre ? 'o-bg-zinc-700' : 'o-bg-zinc-200 dark:o-bg-zinc-800'
          }`}
          aria-hidden="true"
        />
        <nav aria-label="Rubriques" className="o-flex o-items-center o-gap-1">
          {liens.map(([cible, mot]) => (
            <a
              key={cible}
              href={cible}
              className={`o-shrink-0 o-rounded-full o-px-3 o-py-1.5 o-text-sm o-no-underline o-transition-colors focus:o-ring ${
                sombre
                  ? 'o-text-zinc-300 dark:o-text-zinc-300 hover:o-bg-zinc-800 hover:o-text-zinc-50 dark:hover:o-text-zinc-50'
                  : 'o-text-zinc-600 dark:o-text-zinc-300 hover:o-bg-zinc-100 dark:hover:o-bg-zinc-800'
              }`}
            >
              {mot}
            </a>
          ))}
        </nav>
      </div>
    </div>
  )
}

/**
 * Le nom pose en filigrane, derriere le contenu.
 *
 * Il n est pas la pour etre lu — il est souvent coupe aux deux bords — mais
 * pour donner une echelle et remplir le vide qu une scene laisse. Il est cache
 * aux technologies d assistance : le nom est deja dans la barre et dans le
 * pied, et l entendre trois fois n apporte rien.
 *
 * @param taille Hauteur de la casse, en pourcentage de la largeur de vue.
 * @param opacite Part de l encre du theme conservee, en pourcentage.
 */
export function Filigrane({
  children,
  taille = 26,
  opacite = 8,
  className = 'o-absolute o-inset-x-0 o-bottom-24 o-z-0',
}: {
  readonly children: ReactNode
  readonly taille?: number
  readonly opacite?: number
  readonly className?: string
}): ReactElement {
  return (
    <span
      aria-hidden="true"
      className={`o-pointer-events-none o-select-none o-whitespace-nowrap o-text-center o-font-bold o-leading-tight o-tracking-tighter ${className}`}
      style={{
        fontSize: `min(${String(taille)}vw, 380px)`,
        color: `color-mix(in oklab, var(--o-theme-fg) ${String(opacite)}%, transparent)`,
      }}
    >
      {children}
    </span>
  )
}

/**
 * L intitule d une section : un numero, une rubrique, un titre.
 *
 * Le numero n est pas un ornement : il dit au lecteur combien de sections il
 * lui reste, ce qu aucune barre de defilement ne dit vraiment.
 *
 * @param sombre Vrai quand l intitule est pose sur une bande toujours sombre.
 * @param serif Vrai pour un titre en serif — les vitrines de mode, de
 *   joaillerie et de galerie s en servent.
 */
export function Ouverture({
  numero,
  rubrique,
  titre,
  chapeau,
  sombre = false,
  serif = false,
  mono = false,
}: {
  readonly numero: string
  readonly rubrique: string
  readonly titre: ReactNode
  readonly chapeau?: string
  readonly sombre?: boolean
  readonly serif?: boolean
  readonly mono?: boolean
}): ReactElement {
  return (
    <div className="o-max-w-2xl">
      <p
        className={`o-flex o-items-center o-gap-3 o-text-xs o-uppercase o-tracking-widest ${
          mono ? 'o-font-mono' : ''
        }`}
      >
        <span
          className="o-tabular-nums"
          style={{ color: sombre ? encreSurSombre() : encre() }}
        >
          {numero}
        </span>
        <span
          className={
            sombre
              ? 'o-text-zinc-400 dark:o-text-zinc-400'
              : 'o-text-zinc-500 dark:o-text-zinc-400'
          }
        >
          {rubrique}
        </span>
      </p>
      <h2
        className={`o-mt-4 o-text-balance md:o-text-5xl ${
          serif
            ? 'o-font-serif o-text-3xl o-font-normal o-tracking-tight'
            : 'o-text-3xl o-font-semibold o-tracking-tighter'
        }`}
      >
        {titre}
      </h2>
      {chapeau !== undefined && (
        <p
          className={`o-mt-4 o-text-base o-leading-relaxed ${
            sombre
              ? 'o-text-zinc-300 dark:o-text-zinc-300'
              : 'o-text-zinc-600 dark:o-text-zinc-400'
          }`}
        >
          {chapeau}
        </p>
      )}
    </div>
  )
}

/** Un chiffre du rail, avec ce qu il compte. */
export interface Chiffre {
  readonly valeur: string
  readonly quoi: string
  readonly icone?: IconData
}

/**
 * Le rail de chiffres, colle au bas d un heros.
 *
 * C est la reponse au « et concretement ? » avant le premier defilement. Les
 * cases sont separees par un filet d un pixel obtenu par l ecart de la grille
 * sur un fond de couleur — un `border` par case donnerait des filets doubles.
 *
 * @param sombre Vrai quand le rail est pose sur une bande toujours sombre.
 */
export function RailChiffres({
  chiffres,
  sombre = false,
  mono = false,
  className = '',
}: {
  readonly chiffres: readonly Chiffre[]
  readonly sombre?: boolean
  readonly mono?: boolean
  readonly className?: string
}): ReactElement {
  return (
    <dl
      className={`o-m-0 o-grid o-gap-px o-overflow-hidden o-rounded-2xl o-border-w-1 sm:o-grid-cols-2 lg:o-grid-cols-4 ${
        sombre ? 'o-border-zinc-800' : 'o-border-zinc-200 dark:o-border-zinc-800'
      } ${className}`}
      style={{ backgroundColor: 'var(--o-theme-line)' }}
    >
      {chiffres.map((chiffre) => (
        <div
          key={chiffre.quoi}
          className="o-px-5 o-py-4"
          style={{
            backgroundColor: sombre
              ? 'color-mix(in oklab, var(--o-theme-bg) 84%, transparent)'
              : 'var(--o-theme-bg)',
          }}
        >
          <dt
            className={`o-flex o-items-baseline o-gap-2 o-text-2xl o-font-semibold o-tabular-nums o-tracking-tight ${
              mono ? 'o-font-mono' : ''
            }`}
            style={{ color: sombre ? encreSurSombre() : encre() }}
          >
            {chiffre.icone !== undefined && (
              <Icon icon={chiffre.icone} size={15} aria-hidden="true" />
            )}
            {chiffre.valeur}
          </dt>
          <dd
            className={`o-m-0 o-mt-1 o-text-xs o-uppercase o-tracking-wider ${
              sombre
                ? 'o-text-zinc-400 dark:o-text-zinc-400'
                : 'o-text-zinc-500 dark:o-text-zinc-400'
            }`}
          >
            {chiffre.quoi}
          </dd>
        </div>
      ))}
    </dl>
  )
}

/**
 * Le bandeau defilant des mentions.
 *
 * Employe partout pour la meme chose : poser sept a neuf preuves courtes sans
 * y consacrer une section. Le gris est celui du systeme — la nuance 400 sur du
 * blanc tombe a 2,6 de contraste, ce qui a deja ete corrige une fois.
 */
export function BandeauMentions({
  mentions,
  separateur = '/',
  vitesse = 66,
  mono = false,
}: {
  readonly mentions: readonly string[]
  readonly separateur?: string
  readonly vitesse?: number
  readonly mono?: boolean
}): ReactElement {
  return (
    <div className="o-border-t o-border-b o-border-zinc-200 dark:o-border-zinc-800 o-py-5">
      <Marquee speed={vitesse} fade={12}>
        {mentions.map((mot) => (
          <span
            key={mot}
            className={`o-flex o-shrink-0 o-items-center o-gap-3 o-px-8 o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400 ${
              mono ? 'o-font-mono' : ''
            }`}
          >
            {mot}
            <span aria-hidden="true" style={{ color: encre() }}>
              {separateur}
            </span>
          </span>
        ))}
      </Marquee>
    </div>
  )
}

/**
 * Le voile pose sur une scene, pour que le texte tienne dessus.
 *
 * Jamais un gris uniforme : un degre qui part du bord ou se tient le texte et
 * s efface la ou la scene doit se voir. C est la difference entre une image de
 * fond assombrie et une mise en page.
 *
 * @param sens `gauche` pour un texte a gauche, `bas` pour un texte en pied,
 *   `haut-bas` pour un titre en haut et un rail en bas.
 */
export function Voile({
  sens = 'gauche',
  famille = 'zinc',
}: {
  readonly sens?: 'gauche' | 'bas' | 'haut-bas' | 'centre'
  readonly famille?: 'zinc' | 'stone' | 'slate' | 'neutral'
}): ReactElement {
  const fond = `var(--o-palette-${famille}-950)`
  const doux = `color-mix(in oklab, var(--o-palette-${famille}-950) 66%, transparent)`
  const degrades: Readonly<Record<string, string>> = {
    gauche: `linear-gradient(to right, ${fond} 3%, ${doux} 48%, transparent 82%)`,
    bas: `linear-gradient(to bottom, transparent 30%, ${doux} 66%, ${fond} 94%)`,
    'haut-bas': `linear-gradient(to bottom, ${fond} 2%, transparent 32%, transparent 58%, ${fond} 92%)`,
    centre: `radial-gradient(ellipse at 50% 50%, ${fond} 0%, ${doux} 52%, transparent 78%)`,
  }
  return (
    <div
      className="o-absolute o-inset-0 o-z-0 o-pointer-events-none"
      style={{ background: degrades[sens] ?? degrades['gauche'] }}
      aria-hidden="true"
    />
  )
}
