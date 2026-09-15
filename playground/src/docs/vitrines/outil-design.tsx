/**
 * Calque — outil de design.
 *
 * ## La reference : Rescale (Framer)
 *
 * Une nappe pastel qui derive, une mosaique de tuiles inegales, une gelule
 * bordee dans le titre, et un produit montre en perspective. Rescale vend un
 * logiciel comme on vend un objet ; ici l objet est une affiche, et la page
 * la fabrique devant vous.
 *
 * ## Le mecanisme : la pile de calques
 *
 * Huit calques composent une affiche dessinee. On les montre, on les cache, on
 * change leur opacite, **et on change leur ordre** — et l affiche se recompose
 * a chaque fois. Monter la trame de demi-teinte au-dessus du titre efface le
 * titre ; descendre l aplat sous le papier le fait disparaitre. C est
 * exactement ce que fait une pile de calques, et c est ce que la page montre
 * plutot que de le raconter.
 *
 * Tout se fait au clavier : les interrupteurs sont des boutons, l opacite est
 * un champ de plage, et l ordre se change par deux boutons plutot que par un
 * glisser-deposer, qui n a jamais eu d equivalent au clavier.
 *
 * ## Aucune photographie
 *
 * L affiche, la maquette du logiciel, l anneau, le damier du pied : tout est
 * dessine. Un outil de design qui illustre son produit par une banque
 * d images se decrit lui-meme.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import { ArrowRight, ChevronDown, ChevronUp, Eye, EyeOff } from '@odoro-cli/icons/outline'
import { Reveal } from '@odoro-cli/libs/motion'
import { useMemo, useState, type ReactElement } from 'react'

import { BentoGrid } from '@/odoro/section/BentoGrid.jsx'
import { ContainerScroll } from '@/odoro/section/ContainerScroll.jsx'
import { StrokeText } from '@/odoro/text/StrokeText.jsx'
import { ProgressRing } from '@/odoro/ui/ProgressRing.jsx'

import { nuit } from './communs.jsx'
import { accent, accentDoux, encre, encreSurSombre } from './palettes.js'
import {
  Actions,
  affiche as corps,
  BarreGelule,
  CHROME,
  Encadre,
  Etiquette,
  Indice,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
} from './marche.jsx'
import { Nappe } from './scene.jsx'

/* ============================ Les calques ============================== */

/** La nature d un calque : elle decide de son pictogramme et de son libelle. */
type Nature = 'fond' | 'forme' | 'trame' | 'texte' | 'reperes'

/** Un calque de l affiche. */
interface Calque {
  readonly cle: string
  readonly nom: string
  readonly nature: Nature
  readonly visible: boolean
  /** De 0 a 100. */
  readonly opacite: number
}

const DEPART: readonly Calque[] = [
  { cle: 'papier', nom: 'Papier', nature: 'fond', visible: true, opacite: 100 },
  {
    cle: 'grille',
    nom: 'Grille de composition',
    nature: 'reperes',
    visible: true,
    opacite: 60,
  },
  { cle: 'aplat', nom: 'Aplat', nature: 'forme', visible: true, opacite: 100 },
  { cle: 'arche', nom: 'Arche', nature: 'forme', visible: true, opacite: 100 },
  {
    cle: 'trame',
    nom: 'Trame de demi-teinte',
    nature: 'trame',
    visible: true,
    opacite: 55,
  },
  { cle: 'titre', nom: 'Titre', nature: 'texte', visible: true, opacite: 100 },
  { cle: 'legende', nom: 'Legende', nature: 'texte', visible: true, opacite: 100 },
  {
    cle: 'coupe',
    nom: 'Traits de coupe',
    nature: 'reperes',
    visible: true,
    opacite: 100,
  },
]

/**
 * Un rang ecrit a la francaise.
 *
 * `toLocaleString` pose une espace insecable etroite que certaines polices ne
 * dessinent pas : l espace est ecrite a la main pour que le nombre se lise
 * partout de la meme facon.
 */
function rangEcrit(valeur: number): string {
  return String(valeur).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

/** Le libelle de la nature, en mono, dans la pile. */
const NATURES: Readonly<Record<Nature, string>> = {
  fond: 'Fond',
  forme: 'Forme',
  trame: 'Trame',
  texte: 'Texte',
  reperes: 'Reperes',
}

/* ============================ L affiche ================================ */

/**
 * L affiche, composee des calques visibles, dans leur ordre.
 *
 * Les identifiants des motifs portent un prefixe : l affiche est rendue deux
 * fois sur la page — en petit dans la maquette, en grand dans le mecanisme —
 * et deux `<pattern id="trame">` dans le meme document, ce sont deux affiches
 * qui partagent le meme motif par accident.
 */
function Affiche({
  calques,
  prefixe,
}: {
  readonly calques: readonly Calque[]
  readonly prefixe: string
}): ReactElement {
  const id = (nom: string): string => `o-od-${prefixe}-${nom}`

  const dessiner = (calque: Calque): ReactElement | null => {
    switch (calque.cle) {
      case 'papier':
        return (
          <g key={calque.cle} opacity={calque.opacite / 100}>
            <rect width="560" height="700" fill={accentDoux(100, 72)} />
            <rect width="560" height="700" fill={`url(#${id('grain')})`} />
          </g>
        )
      case 'grille':
        return (
          <g
            key={calque.cle}
            opacity={calque.opacite / 100}
            stroke={accentDoux(700, 24)}
            strokeWidth="1"
          >
            {Array.from({ length: 11 }, (_, rang) => (
              <path key={`v${String(rang)}`} d={`M${String(40 + rang * 48)} 0 V700`} />
            ))}
            {Array.from({ length: 13 }, (_, rang) => (
              <path key={`h${String(rang)}`} d={`M0 ${String(40 + rang * 50)} H560`} />
            ))}
          </g>
        )
      case 'aplat':
        return (
          <g key={calque.cle} opacity={calque.opacite / 100}>
            <path
              d="M56 236c0-92 74-124 172-124s188 26 232 108c44 82 24 190-44 240s-196 62-266 14-94-146-94-238Z"
              fill={accent(400)}
            />
          </g>
        )
      case 'arche':
        return (
          <g key={calque.cle} opacity={calque.opacite / 100}>
            <path d="M172 520V300a108 108 0 0 1 216 0v220Z" fill={accentDoux(800, 78)} />
            <path d="M232 520V308a48 48 0 0 1 96 0v212Z" fill={accentDoux(200, 60)} />
          </g>
        )
      case 'trame':
        return (
          <g key={calque.cle} opacity={calque.opacite / 100}>
            <rect y="112" width="560" height="408" fill={`url(#${id('trame')})`} />
          </g>
        )
      case 'titre':
        return (
          <g key={calque.cle} opacity={calque.opacite / 100}>
            <text
              x="40"
              y="622"
              fontSize="92"
              fill={accentDoux(900, 88)}
              style={{
                fontFamily: 'var(--o-vitrine-affichage)',
                fontWeight: 800,
                letterSpacing: '-0.05em',
              }}
            >
              CALQUE
            </text>
          </g>
        )
      case 'legende':
        return (
          <g key={calque.cle} opacity={calque.opacite / 100}>
            <text
              x="40"
              y="80"
              fontSize="17"
              fill={accentDoux(900, 80)}
              style={{
                fontFamily: 'var(--o-font-mono)',
                textTransform: 'uppercase',
                letterSpacing: '0.24em',
              }}
            >
              Biennale du signe
            </text>
            <text
              x="40"
              y="662"
              fontSize="16"
              fill={accentDoux(900, 70)}
              style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.14em' }}
            >
              12 mars — 4 mai 2026 · Halle Nord
            </text>
          </g>
        )
      case 'coupe':
        return (
          <g
            key={calque.cle}
            opacity={calque.opacite / 100}
            stroke={accentDoux(900, 70)}
            strokeWidth="1.5"
          >
            <path d="M0 22h22M22 0v22M538 22h22M538 0v22M0 678h22M22 678v22M538 678h22M538 678v22" />
            <circle cx="280" cy="12" r="6" fill="none" />
            <path d="M272 12h16M280 4v16" />
          </g>
        )
      default:
        return null
    }
  }

  return (
    <svg
      viewBox="0 0 560 700"
      className="o-h-auto o-w-full"
      role="img"
      aria-label={`Affiche composee de ${String(calques.filter((c) => c.visible).length)} calques visibles sur ${String(calques.length)}`}
    >
      <defs>
        <pattern id={id('grain')} width="7" height="7" patternUnits="userSpaceOnUse">
          <circle cx="1.5" cy="1.5" r="0.8" fill={accentDoux(700, 12)} />
        </pattern>
        <pattern id={id('trame')} width="16" height="16" patternUnits="userSpaceOnUse">
          <circle cx="8" cy="8" r="3.4" fill={accentDoux(900, 62)} />
        </pattern>
      </defs>
      <rect width="560" height="700" fill="var(--o-theme-bg)" />
      {calques.filter((calque) => calque.visible).map(dessiner)}
    </svg>
  )
}

/* ============================ La maquette ============================== */

/** La fenetre du logiciel, dessinee : rail d outils, toile, pile de calques. */
function Maquette({ calques }: { readonly calques: readonly Calque[] }): ReactElement {
  return (
    <div
      className="o-grid o-overflow-hidden o-rounded-xl"
      style={{
        gridTemplateColumns: '56px 1fr 200px',
        backgroundColor: accentDoux(300, 16),
      }}
      aria-hidden="true"
    >
      {/* Le rail d outils. */}
      <div
        className="o-flex o-flex-col o-items-center o-gap-4 o-py-5"
        style={{ backgroundColor: accentDoux(400, 24) }}
      >
        {[
          'M4 16 12 4l8 12H4Z',
          'M4 4h16v16H4z',
          'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z',
          'M4 20 20 4M4 4l16 16',
          'M3 12h18M12 3v18',
        ].map((d, rang) => (
          <svg
            key={rang}
            viewBox="0 0 24 24"
            className="o-size-5"
            fill="none"
            stroke={accentDoux(900, 60)}
            strokeWidth="1.6"
          >
            <path d={d} />
          </svg>
        ))}
      </div>

      {/* La toile. */}
      <div className="o-flex o-items-center o-justify-center o-p-6">
        <div className="o-w-full o-max-w-2xs o-shadow-lg">
          <Affiche calques={calques} prefixe="maquette" />
        </div>
      </div>

      {/* La pile, telle que le logiciel la montre. */}
      <div
        className="o-flex o-flex-col o-gap-2 o-p-4"
        style={{ backgroundColor: accentDoux(300, 24), color: 'var(--o-theme-fg)' }}
      >
        <span
          className="o-block o-font-mono o-text-xs o-uppercase o-tracking-widest"
          style={{ color: encre() }}
        >
          Calques
        </span>
        {[...calques].reverse().map((calque) => (
          <span
            key={calque.cle}
            className="o-flex o-items-center o-gap-2 o-rounded-md o-px-2 o-py-1.5 o-text-xs"
            style={{
              backgroundColor: calque.visible ? accentDoux(200, 14) : 'transparent',
              opacity: calque.visible ? 1 : 0.45,
            }}
          >
            <span
              className="o-block o-size-2 o-shrink-0 o-rounded-full"
              style={{ backgroundColor: accent(500) }}
            />
            <span className="o-truncate">{calque.nom}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

/* ============================ La pile ================================== */

/** Une rangee de la pile : l oeil, le nom, l opacite, et l ordre. */
function Rangee({
  calque,
  rang,
  total,
  surOeil,
  surOpacite,
  surOrdre,
}: {
  readonly calque: Calque
  /** Rang dans la pile affichee, de haut en bas. */
  readonly rang: number
  readonly total: number
  readonly surOeil: () => void
  readonly surOpacite: (valeur: number) => void
  readonly surOrdre: (sens: -1 | 1) => void
}): ReactElement {
  return (
    <li
      className="o-grid o-items-center o-gap-3 o-border-b o-border-zinc-200 dark:o-border-zinc-800 o-py-3"
      style={{ gridTemplateColumns: 'auto 1fr auto auto' }}
    >
      <button
        type="button"
        aria-pressed={calque.visible}
        aria-label={`${calque.visible ? 'Cacher' : 'Montrer'} le calque ${calque.nom}`}
        onClick={surOeil}
        className="o-inline-flex o-size-9 o-cursor-pointer o-items-center o-justify-center o-rounded-lg o-border-w-1 o-transition-colors focus:o-ring"
        style={
          calque.visible
            ? {
                backgroundColor: encre(),
                borderColor: encre(),
                color: 'var(--o-theme-bg)',
              }
            : { borderColor: accentDoux(700, 34), color: 'inherit' }
        }
      >
        <Icon icon={calque.visible ? Eye : EyeOff} size={16} aria-hidden="true" />
      </button>

      <span className="o-min-w-0">
        <span
          className={`o-block o-truncate o-text-sm o-font-semibold ${calque.visible ? 'o-text-zinc-950 dark:o-text-zinc-50' : 'o-text-zinc-400 dark:o-text-zinc-500'}`}
        >
          {calque.nom}
        </span>
        <span className="o-block o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
          {NATURES[calque.nature]} · {String(calque.opacite)} %
        </span>
      </span>

      <label className="o-flex o-items-center o-gap-2">
        <span className="o-sr-only">Opacite du calque {calque.nom}</span>
        <input
          type="range"
          min={0}
          max={100}
          step={5}
          value={calque.opacite}
          disabled={!calque.visible}
          onChange={(evenement) => {
            surOpacite(Number(evenement.target.value))
          }}
          className="o-w-24 o-accent-brand-500 focus:o-ring"
        />
      </label>

      <span className="o-flex o-gap-1">
        <button
          type="button"
          aria-label={`Monter le calque ${calque.nom}`}
          disabled={rang === 0}
          onClick={() => {
            surOrdre(1)
          }}
          className="o-inline-flex o-size-8 o-cursor-pointer o-items-center o-justify-center o-rounded-lg o-border-w-1 o-border-zinc-300 dark:o-border-zinc-700 o-transition-colors hover:o-bg-zinc-100 dark:hover:o-bg-zinc-900 disabled:o-opacity-30 focus:o-ring"
        >
          <Icon icon={ChevronUp} size={15} aria-hidden="true" />
        </button>
        <button
          type="button"
          aria-label={`Descendre le calque ${calque.nom}`}
          disabled={rang === total - 1}
          onClick={() => {
            surOrdre(-1)
          }}
          className="o-inline-flex o-size-8 o-cursor-pointer o-items-center o-justify-center o-rounded-lg o-border-w-1 o-border-zinc-300 dark:o-border-zinc-700 o-transition-colors hover:o-bg-zinc-100 dark:hover:o-bg-zinc-900 disabled:o-opacity-30 focus:o-ring"
        >
          <Icon icon={ChevronDown} size={15} aria-hidden="true" />
        </button>
      </span>
    </li>
  )
}

/* ============================ La mosaique ============================== */

const TUILES = [
  {
    id: 'calques',
    title: 'Des calques, pas des groupes de groupes',
    body: 'Huit niveaux au plus, et un avertissement au neuvieme. Une pile qu on ne peut plus lire n est plus une pile.',
    cols: 2,
    rows: 2,
    featured: true,
    media: (
      <svg
        viewBox="0 0 260 170"
        className="o-h-auto o-w-full"
        role="img"
        aria-label="Huit calques empiles en perspective, le neuvieme barre"
      >
        {Array.from({ length: 9 }, (_, rang) => {
          const y = 14 + rang * 14
          const dernier = rang === 8
          return (
            <g key={rang} opacity={dernier ? 0.45 : 1}>
              <path
                d={`M40 ${String(y + 16)} L130 ${String(y)} L220 ${String(y + 16)} L130 ${String(y + 32)} Z`}
                fill={dernier ? 'none' : accentDoux(300, 30 + rang * 6)}
                stroke={accentDoux(800, 48)}
                strokeWidth="1.2"
                strokeDasharray={dernier ? '5 5' : undefined}
              />
              {dernier && (
                <path
                  d={`M92 ${String(y + 30)} L168 ${String(y + 2)}`}
                  stroke={accentDoux(900, 70)}
                  strokeWidth="2"
                />
              )}
            </g>
          )
        })}
      </svg>
    ),
  },
  {
    id: 'fichier',
    title: 'Un fichier, un dossier',
    body: 'Le format est un dossier de fichiers texte et d images. Il se lit sans nous, et il se versionne.',
    cols: 2,
  },
  {
    id: 'hors-ligne',
    title: 'Hors ligne par defaut',
    body: 'Le reseau sert au partage, jamais a l edition.',
  },
  {
    id: 'export',
    title: 'Export en SVG, PDF, PNG',
    body: 'Et le SVG sort avec les noms de calques.',
  },
  {
    id: 'clavier',
    title: 'Tout au clavier',
    body: 'Cent onze raccourcis, tous remappables, et la liste tient sur une feuille A4 imprimable depuis le logiciel.',
    cols: 2,
  },
  {
    id: 'prix',
    title: 'Achat unique, 89 €',
    body: 'Une version majeure par an, achetee si elle vous interesse. Aucun abonnement, aucun compte obligatoire.',
    cols: 2,
  },
]

/* ============================ Le pied en damier ======================== */

const DAMIER: readonly (readonly [string, string])[] = [
  ['#pile', 'La pile de calques'],
  ['#produit', 'Le logiciel'],
  ['#mosaique', 'Ce qu il fait'],
  ['#anneau', 'Les performances'],
  ['#attente', 'La liste d attente'],
  ['#pile', 'Le format de fichier'],
  ['#pile', 'Les raccourcis'],
  ['#pile', 'Notes de version'],
  ['#produit', 'Telechargements'],
  ['#produit', 'Forum'],
  ['#attente', 'Nous ecrire'],
  ['#attente', 'Mentions legales'],
]

/* ============================ La page ================================== */

const NAVIGATION = [
  ['#produit', 'Le logiciel'],
  ['#pile', 'La pile'],
  ['#mosaique', 'Ce qu il fait'],
] as const

export default function Page(): ReactElement {
  const polices = usePolices('bricolage')
  const [calques, setCalques] = useState<readonly Calque[]>(DEPART)
  const [adresse, setAdresse] = useState('')
  const [inscrit, setInscrit] = useState(false)

  /** La pile se lit de haut en bas ; le dessin se peint de bas en haut. */
  const pile = useMemo(() => [...calques].reverse(), [calques])

  const modifier = (cle: string, suite: (calque: Calque) => Calque): void => {
    setCalques((precedents) =>
      precedents.map((calque) => (calque.cle === cle ? suite(calque) : calque)),
    )
  }

  const deplacer = (cle: string, sens: -1 | 1): void => {
    setCalques((precedents) => {
      const rang = precedents.findIndex((calque) => calque.cle === cle)
      const vise = rang + sens
      if (rang < 0 || vise < 0 || vise >= precedents.length) return precedents
      const suivants = [...precedents]
      const pris = suivants[rang]
      const echange = suivants[vise]
      if (pris === undefined || echange === undefined) return precedents
      suivants[rang] = echange
      suivants[vise] = pris
      return suivants
    })
  }

  const visibles = calques.filter((calque) => calque.visible).length
  const rangAttente = 1284

  return (
    <Porte forme="zoom" marque="Calque" sombre={false}>
      <div
        className="o-relative o-bg-white dark:o-bg-zinc-950 o-text-zinc-800 dark:o-text-zinc-200"
        style={polices}
      >
        {/* La nappe pastel derive derriere toute la page : F-css, sans canevas. */}
        <div aria-hidden="true" className="o-pointer-events-none o-fixed o-inset-0 o-z-0">
          <Nappe
            couleurs={[
              accentDoux(300, 62),
              accentDoux(500, 34),
              'color-mix(in oklab, var(--o-vitrine-seconde) 36%, transparent)',
            ]}
            opacite={0.3}
          />
        </div>

        <div className="o-relative o-z-10">
          <BarreGelule
            marque="Calque"
            liens={NAVIGATION}
            action={['#attente', 'Liste d attente']}
            sombre={false}
          />

          {/* ================= L ouverture ============================== */}
          <header
            className="o-relative o-isolate o-flex o-flex-col o-justify-center o-px-6 o-pb-20 o-pt-36 md:o-px-10"
            style={{ minHeight: `calc(100vh - ${String(CHROME)}px)` }}
          >
            <div className="o-mx-auto o-w-full o-max-w-6xl o-text-center">
              <Surgit>
                <Etiquette sombre={false}>
                  Editeur vectoriel — macOS, Windows, Linux
                </Etiquette>
              </Surgit>
              <TitreVague
                delai={140}
                className="o-m-0 o-mt-8 o-text-zinc-950 dark:o-text-zinc-50"
                style={{
                  ...corps('xl', 300),
                  fontSize: 'clamp(3rem, 12vw, 10.5rem)',
                  lineHeight: 0.86,
                }}
              >
                Calque
              </TitreVague>
              <Surgit
                delai={420}
                as="p"
                className="o-m-0 o-mt-6 o-text-zinc-950 dark:o-text-zinc-50"
                style={{
                  ...corps('m', 300),
                  fontSize: 'clamp(1.15rem, 2.6vw, 2.25rem)',
                  lineHeight: 1.1,
                }}
              >
                <StrokeText
                  strokeWidth={1.6}
                  duration={1100}
                  contour={accentDoux(600, 70)}
                  remplissage={encre()}
                >
                  Huit calques
                </StrokeText>{' '}
                <Encadre>au plus</Encadre>, et rien qui se cache.
              </Surgit>
              <Surgit
                delai={600}
                as="p"
                className="o-mx-auto o-m-0 o-mt-8 o-max-w-xl o-text-lg o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400"
              >
                Un editeur vectoriel qui tient dans quarante mega-octets, ouvre un fichier
                en une seconde, et ecrit dans un format que vous pouvez lire sans lui.
              </Surgit>
              <Surgit delai={740} className="o-mt-10 o-flex o-justify-center">
                <Actions
                  pleine={[
                    '#pile',
                    <>
                      Manipuler la pile{' '}
                      <Icon icon={ArrowRight} size={15} aria-hidden="true" />
                    </>,
                  ]}
                  fantome={['#attente', 'Entrer dans la liste']}
                  sombre={false}
                />
              </Surgit>
            </div>
          </header>

          <main>
            {/* ================= M-perspective : le produit se redresse === */}
            <section id="produit" className="o-scroll-mt-24 o-px-6 md:o-px-10">
              <div className="o-mx-auto o-max-w-6xl">
                <ContainerScroll
                  label="Le logiciel, vu de face"
                  rotation={24}
                  scale={0.84}
                  title="Trois panneaux, et rien d autre."
                  subtitle="Le rail d outils a gauche, la toile au milieu, la pile a droite. Aucun menu ne s ouvre par-dessus la toile."
                >
                  <Maquette calques={calques} />
                </ContainerScroll>
              </div>
            </section>

            {/* ================= Le mecanisme : la pile de calques ======== */}
            <section
              id="pile"
              className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
            >
              <div className="o-mx-auto o-max-w-6xl">
                <Reveal>
                  <Indice rang="01" sombre={false}>
                    La pile
                  </Indice>
                </Reveal>
                <Reveal delay={80}>
                  <h2
                    className="o-m-0 o-mt-6 o-max-w-3xl o-text-zinc-950 dark:o-text-zinc-50"
                    style={{
                      ...corps('m', 300),
                      fontSize: 'clamp(1.85rem, 4vw, 3.5rem)',
                      lineHeight: 1,
                    }}
                  >
                    Montez la trame au-dessus du titre : le titre disparait.
                  </h2>
                </Reveal>

                <div className="o-mt-14 o-grid o-items-start o-gap-12 lg:o-grid-cols-12">
                  <div className="lg:o-col-span-5">
                    <div className="o-mx-auto o-w-full o-max-w-sm o-shadow-xl">
                      <Affiche calques={calques} prefixe="grand" />
                    </div>
                    <p
                      className="o-m-0 o-mt-6 o-text-center o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400"
                      aria-live="polite"
                    >
                      {visibles} calque{visibles > 1 ? 's' : ''} visible
                      {visibles > 1 ? 's' : ''} sur {calques.length}
                    </p>
                  </div>

                  <div className="lg:o-col-span-7">
                    <div className="o-flex o-items-baseline o-justify-between o-gap-4 o-border-b o-border-zinc-300 dark:o-border-zinc-700 o-pb-3">
                      <p
                        className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                        style={{ color: encre() }}
                      >
                        Calques — du dessus vers le dessous
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setCalques(DEPART)
                        }}
                        className="o-cursor-pointer o-border-w-0 o-bg-transparent o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400 o-underline o-transition-colors hover:o-text-zinc-950 dark:hover:o-text-zinc-50 focus:o-ring"
                      >
                        Tout remettre
                      </button>
                    </div>
                    <ul className="o-m-0 o-list-none o-p-0">
                      {pile.map((calque, rang) => (
                        <Rangee
                          key={calque.cle}
                          calque={calque}
                          rang={rang}
                          total={pile.length}
                          surOeil={() => {
                            modifier(calque.cle, (c) => ({ ...c, visible: !c.visible }))
                          }}
                          surOpacite={(valeur) => {
                            modifier(calque.cle, (c) => ({ ...c, opacite: valeur }))
                          }}
                          surOrdre={(sens) => {
                            deplacer(calque.cle, sens)
                          }}
                        />
                      ))}
                    </ul>
                    <p className="o-m-0 o-mt-6 o-max-w-xl o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                      L ordre se change par les deux fleches plutot que par un
                      glisser-deposer : un deplacement qui n existe qu a la souris n
                      existe pas pour tout le monde.
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* ================= La mosaique de Rescale ================== */}
            <section
              id="mosaique"
              className="o-scroll-mt-24 o-px-6 o-pb-24 md:o-px-10 md:o-pb-32"
            >
              <div className="o-mx-auto o-max-w-6xl">
                <Reveal>
                  <Indice rang="02" sombre={false}>
                    Ce qu il fait
                  </Indice>
                </Reveal>
                <Reveal delay={80}>
                  <h2
                    className="o-m-0 o-mb-12 o-mt-6 o-max-w-2xl o-text-zinc-950 dark:o-text-zinc-50"
                    style={{
                      ...corps('m', 300),
                      fontSize: 'clamp(1.85rem, 4vw, 3.5rem)',
                      lineHeight: 1,
                    }}
                  >
                    Six decisions, et tout le reste en decoule.
                  </h2>
                </Reveal>
                <BentoGrid
                  items={TUILES}
                  columns={4}
                  rowHeight={168}
                  label="Les six decisions de conception"
                />
              </div>
            </section>

            {/* ================= C19 : un seul pourcentage, en anneau ===== */}
            <section
              id="anneau"
              className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
              style={nuit('zinc')}
            >
              <div className="o-mx-auto o-flex o-max-w-4xl o-flex-wrap o-items-center o-gap-10 md:o-gap-14">
                <ProgressRing
                  value={94}
                  size={208}
                  thickness={12}
                  label="Part des fichiers ouverts en moins de deux secondes"
                />
                <div className="o-min-w-0 o-w-full md:o-w-auto md:o-flex-1">
                  <p
                    className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                    style={{ color: encreSurSombre() }}
                  >
                    Le seul chiffre de cette page
                  </p>
                  <p
                    className="o-m-0 o-mt-6 o-max-w-xl o-text-zinc-50"
                    style={{
                      ...corps('m', 300),
                      fontSize: 'clamp(1.4rem, 3vw, 2.5rem)',
                      lineHeight: 1.12,
                    }}
                  >
                    Sur les mille fichiers de la bibliotheque publique,
                    quatre-vingt-quatorze pour cent s ouvrent en moins de deux secondes —
                    sur un portable de 2019.
                  </p>
                  <p className="o-m-0 o-mt-6 o-max-w-lg o-text-sm o-leading-relaxed o-text-zinc-400">
                    Les soixante restants sont des affiches de plus de quatre cents
                    objets. Nous les gardons dans la suite de tests : ce sont elles qui
                    disent ou est la limite.
                  </p>
                </div>
              </div>
            </section>

            {/* ================= A27 : la liste d attente numerotee ======= */}
            <section
              id="attente"
              className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
            >
              <div className="o-mx-auto o-max-w-3xl">
                <Reveal>
                  <Indice rang="03" sombre={false}>
                    La liste d attente
                  </Indice>
                </Reveal>
                <Reveal delay={80}>
                  <h2
                    className="o-m-0 o-mt-6 o-text-zinc-950 dark:o-text-zinc-50"
                    style={{
                      ...corps('m', 300),
                      fontSize: 'clamp(1.85rem, 4vw, 3.5rem)',
                      lineHeight: 1,
                    }}
                  >
                    Vous seriez le{' '}
                    <span className="o-tabular-nums" style={{ color: encre() }}>
                      {rangEcrit(rangAttente + 1)}
                    </span>
                    e.
                  </h2>
                </Reveal>

                {/* La file, dessinee : mille deux cent quatre-vingt-quatre points. */}
                <div aria-hidden="true" className="o-mt-10 o-flex o-flex-wrap o-gap-1">
                  {Array.from({ length: 86 }, (_, rang) => (
                    <span
                      key={rang}
                      className="o-block o-size-2 o-rounded-full"
                      style={{
                        backgroundColor: rang === 85 ? encre() : accentDoux(500, 34),
                      }}
                    />
                  ))}
                </div>
                <p className="o-m-0 o-mt-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                  Un point pour quinze personnes · le dernier point, c est vous
                </p>

                <form
                  className="o-mt-10"
                  onSubmit={(evenement) => {
                    evenement.preventDefault()
                    setInscrit(adresse.trim().length > 0)
                  }}
                >
                  <label
                    htmlFor="calque-adresse"
                    className="o-block o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400"
                  >
                    Votre adresse
                  </label>
                  <div className="o-mt-4 o-flex o-flex-wrap o-items-center o-gap-3">
                    <input
                      id="calque-adresse"
                      type="email"
                      required
                      value={adresse}
                      onChange={(evenement) => {
                        setAdresse(evenement.target.value)
                        setInscrit(false)
                      }}
                      placeholder="vous@studio.fr"
                      className="o-min-w-0 o-grow o-rounded-full o-border-w-1 o-border-zinc-300 dark:o-border-zinc-700 o-bg-transparent o-px-5 o-py-3 o-text-base focus:o-ring"
                    />
                    <button
                      type="submit"
                      className="o-inline-flex o-shrink-0 o-cursor-pointer o-items-center o-gap-2 o-rounded-full o-border-w-0 o-px-6 o-py-3 o-text-sm o-font-semibold o-transition-opacity hover:o-opacity-85 focus:o-ring"
                      style={{ backgroundColor: encre(), color: 'var(--o-theme-bg)' }}
                    >
                      Prendre ma place
                    </button>
                  </div>
                  <p
                    className="o-m-0 o-mt-5 o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400"
                    aria-live="polite"
                  >
                    {inscrit
                      ? `C est note : vous etes le ${rangEcrit(rangAttente + 1)}e. La version 1.0 sort en avril ; les trois mille premiers rangs l ont en mars, et l achat reste a 89 €.`
                      : 'Mille deux cent quatre-vingt-quatre personnes attendent la version 1.0. La liste sert a repartir les acces de la version de mars, et a rien d autre.'}
                  </p>
                </form>
              </div>
            </section>
          </main>

          {/* ================= Le pied en damier ======================== */}
          <footer className="o-px-6 o-py-16 md:o-px-10" style={nuit('zinc')}>
            <div className="o-mx-auto o-max-w-6xl">
              <p
                className="o-m-0 o-text-zinc-50"
                style={{
                  ...corps('m', 300),
                  fontSize: 'clamp(1.75rem, 6vw, 4.5rem)',
                  lineHeight: 0.92,
                }}
              >
                Calque
              </p>

              {/*
                P31 : les liens tiennent dans les cases claires du damier, les
                cases sombres restent vides. Le filet d un pixel vient de
                l ecart de la grille sur un fond plein.
              */}
              <nav aria-label="Plan du site" className="o-mt-10">
                <ul
                  className="o-m-0 o-grid o-list-none o-gap-px o-overflow-hidden o-rounded-2xl o-p-0 sm:o-grid-cols-4 lg:o-grid-cols-6"
                  style={{ backgroundColor: accentDoux(700, 40) }}
                >
                  {DAMIER.map(([cible, mot], rang) => {
                    // Six colonnes : sans le decalage d une rangee sur deux,
                    // les cases claires s alignent en colonnes et le damier
                    // devient un rayage.
                    const clair = (rang + Math.floor(rang / 6)) % 2 === 0
                    return (
                      <li key={`${cible}-${mot}`}>
                        <a
                          href={cible}
                          className="o-flex o-h-24 o-items-end o-p-4 o-text-sm o-font-medium o-no-underline o-transition-opacity hover:o-opacity-80 focus:o-ring"
                          style={
                            clair
                              ? {
                                  backgroundColor: accent(400),
                                  color: 'var(--o-palette-zinc-950)',
                                }
                              : {
                                  backgroundColor: 'var(--o-palette-zinc-900)',
                                  color: 'var(--o-palette-zinc-100)',
                                }
                          }
                        >
                          {mot}
                        </a>
                      </li>
                    )
                  })}
                </ul>
              </nav>

              <p className="o-m-0 o-mt-10 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400">
                Calque est edite par Trame SARL, 14 quai Saint-Vincent, 69001 Lyon ·
                version 0.9.4, publiee le 2 septembre 2026 · © 2026 · Accessibilite :
                partiellement conforme
              </p>
            </div>
          </footer>
        </div>
      </div>
    </Porte>
  )
}
