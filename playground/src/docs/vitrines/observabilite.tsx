/**
 * Vigie — l observabilite.
 *
 * ## Le parti pris : un incident, en entier, au lieu d une grille de fonctions
 *
 * Les pages d observabilite montrent toutes la meme chose : quatre captures de
 * tableaux de bord et une liste de connecteurs. Celle-ci montre **un incident**
 * — un vrai, minute par minute, du deploiement a la cause confirmee — et laisse
 * le visiteur le traverser. Tout ce qu on aurait mis dans une grille est dedans :
 * les sondes, les seuils, l astreinte, le trace, le retour arriere.
 *
 * ## Le mecanisme : l incident
 *
 * Quarante-huit minutes, quatre signaux, seize ecritures au journal. Les
 * signaux ne sont pas des courbes decoratives : ils sont decrits par des
 * **points de passage ecrits a la main**, et la page interpole lineairement
 * entre eux — ce qu une console fait aussi quand elle dessine une serie plus
 * fine que sa resolution. A chaque minute, la page calcule les valeurs, compare
 * aux seuils, decide de la phase, et n affiche du journal que ce qui est deja
 * arrive.
 *
 * ## Le mouvement
 *
 * Sa signature est **M-epingle** : la scene reste collee pendant cinq ecrans, et
 * c est le defilement qui fait avancer l horloge de l incident. Un curseur
 * reprend la main pour qui veut revenir en arriere — et c est lui, seul, qui
 * fait marcher la page sous mouvement reduit.
 *
 * ## Les chiffres
 *
 * Aucune barre de compteurs : la forme de cette page est une **carte de chaleur
 * en cases**, posee sur la bande claire qui coupe la page sombre. Trente jours,
 * huit services, et la colonne du 8 avril qui s allume d un bout a l autre.
 *
 * @module
 */

import { Icon, type IconData } from '@odoro-cli/icons'
import { Activity, ArrowRight, Bell, Gauge, Layers, Radar, Terminal, TriangleAlert } from '@odoro-cli/icons/filaire'
import { useMemo, useState, type CSSProperties, type ReactElement, type ReactNode } from 'react'

import { Hologram } from '@/odoro/background/Hologram.jsx'
import { Timeline } from '@/odoro/section/Timeline.jsx'
import { ScrollFloat } from '@/odoro/text/ScrollFloat.jsx'
import { SegmentedControl } from '@/odoro/ui/SegmentedControl.jsx'
import { useInView } from '@/odoro/hooks/useInView'

import { nuit } from './communs.jsx'
import { accent, accentDoux, encreSurSombre } from './palettes.js'
import { affiche, BarreFilet, Coin, Etiquette, Grain, Porte, Surgit, TitreVague, usePolices } from './marche.jsx'
import { Epingle } from './scene.jsx'

/* ------------------------------------------------------------------------ */
/*                               Les encres                                 */
/* ------------------------------------------------------------------------ */

/** Le filet de la page sombre. */
const FILET = 'color-mix(in oklab, #ffffff 14%, transparent)'

/** Le filet de la bande claire. */
const FILET_JOUR = 'color-mix(in oklab, #000000 14%, transparent)'

/** L encre d accent, sur une page sombre dans les deux themes. */
const ENCRE = encreSurSombre()

/** L encre d une valeur au-dela de son seuil. */
const ALARME = 'var(--o-palette-rose-400)'

/**
 * Le jour d une bande.
 *
 * Le pendant de `nuit()` : une bande claire au milieu d une page sombre dans
 * les deux themes. Les variables du theme sont redeclarees plutot que des
 * classes posees en dur.
 */
const JOUR = {
  colorScheme: 'light',
  backgroundColor: 'var(--o-theme-bg)',
  color: 'var(--o-theme-fg)',
  '--o-theme-bg': 'var(--o-palette-zinc-50)',
  '--o-theme-surface': 'var(--o-palette-zinc-100)',
  '--o-theme-fg': 'var(--o-palette-zinc-950)',
  '--o-theme-muted': 'var(--o-palette-zinc-600)',
  '--o-theme-line': 'var(--o-palette-zinc-300)',
} as CSSProperties

/** Les rubriques de la barre. */
const LIENS = [
  ['#incident', 'L incident'],
  ['#trace', 'Le trace'],
  ['#chaleur', 'Quatre-vingt-dix jours'],
  ['#retention', 'Ce qu on garde'],
] as const

/* ------------------------------------------------------------------------ */
/*                     L incident : les signaux et le journal               */
/* ------------------------------------------------------------------------ */

/** Le nombre de minutes que dure l incident, journal compris. */
const MINUTES = 48

/** Un signal surveille. */
interface Signal {
  readonly cle: string
  readonly nom: string
  readonly unite: string
  readonly icone: IconData
  /** Le seuil au-dela duquel la sonde passe en alerte. */
  readonly seuil: number
  /** Le haut de l echelle du trace. */
  readonly haut: number
  /** Points de passage : minute, valeur. La page interpole entre eux. */
  readonly passages: readonly (readonly [number, number])[]
  /** Ce que le signal mesure, en une phrase. */
  readonly quoi: string
}

/**
 * Les quatre signaux de l incident.
 *
 * Ecrire quarante-huit valeurs par signal serait illisible et personne ne les
 * relirait. Ce sont donc des **points de passage** — ceux qu on note vraiment
 * sur un tableau blanc pendant un incident — et la page interpole lineairement
 * entre eux, exactement comme une console qui trace une serie plus fine que sa
 * resolution.
 */
const SIGNAUX: readonly Signal[] = [
  {
    cle: 'latence',
    nom: 'Latence p99',
    unite: 'ms',
    icone: Gauge,
    seuil: 800,
    haut: 5000,
    quoi: 'Le temps qu attend le centieme le plus malchanceux des appelants.',
    passages: [
      [0, 180],
      [6, 192],
      [8, 240],
      [10, 520],
      [12, 1400],
      [15, 3100],
      [18, 4200],
      [22, 4600],
      [26, 4400],
      [30, 2100],
      [33, 700],
      [36, 260],
      [40, 190],
      [47, 178],
    ],
  },
  {
    cle: 'erreurs',
    nom: 'Taux d erreur',
    unite: '%',
    icone: TriangleAlert,
    seuil: 1,
    haut: 14,
    quoi: 'La part des appels qui rendent une erreur du serveur.',
    passages: [
      [0, 0.1],
      [10, 0.2],
      [13, 1.4],
      [16, 6.8],
      [20, 11.2],
      [24, 12.4],
      [28, 9.6],
      [31, 3.1],
      [34, 0.6],
      [38, 0.15],
      [47, 0.1],
    ],
  },
  {
    cle: 'file',
    nom: 'File d attente',
    unite: 'k messages',
    icone: Layers,
    seuil: 5,
    haut: 42,
    quoi: 'Ce qui attend d etre traite, et qui grossit tant que rien ne sort.',
    passages: [
      [0, 0.4],
      [12, 0.6],
      [16, 4.2],
      [20, 18],
      [24, 31],
      [28, 38],
      [31, 34],
      [34, 19],
      [38, 5.2],
      [42, 0.9],
      [47, 0.4],
    ],
  },
  {
    cle: 'pool',
    nom: 'Pool de connexions',
    unite: '%',
    icone: Activity,
    seuil: 85,
    haut: 105,
    quoi: 'La part des connexions a la base deja prises. A cent, plus rien ne passe.',
    passages: [
      [0, 22],
      [8, 26],
      [11, 58],
      [14, 92],
      [18, 100],
      [26, 100],
      [30, 74],
      [33, 38],
      [37, 24],
      [47, 22],
    ],
  },
]

/** La valeur d un signal a une minute, interpolee entre ses points de passage. */
function valeurA(signal: Signal, minute: number): number {
  const points = signal.passages
  const premier = points[0]
  if (premier === undefined) return 0
  if (minute <= premier[0]) return premier[1]
  for (let i = 1; i < points.length; i += 1) {
    const avant = points[i - 1]
    const apres = points[i]
    if (avant === undefined || apres === undefined) continue
    if (minute <= apres[0]) {
      const course = apres[0] - avant[0]
      const part = course === 0 ? 0 : (minute - avant[0]) / course
      return avant[1] + (apres[1] - avant[1]) * part
    }
  }
  return points[points.length - 1]?.[1] ?? 0
}

/** La nature d une ecriture du journal. */
type Nature = 'deploiement' | 'sonde' | 'alerte' | 'humain' | 'action'

/** Une ecriture du journal d incident. */
interface Ecriture {
  readonly minute: number
  readonly nature: Nature
  readonly texte: string
}

/** Les seize ecritures du journal, de la mise en ligne au rapport. */
const JOURNAL: readonly Ecriture[] = [
  { minute: 0, nature: 'deploiement', texte: 'Mise en ligne 8f21c du service de facturation, par la chaine habituelle.' },
  { minute: 7, nature: 'sonde', texte: 'Premier avertissement : le pool de connexions passe 58 %, sans alerte.' },
  { minute: 11, nature: 'alerte', texte: 'Alerte : la latence p99 depasse 800 ms depuis deux minutes.' },
  { minute: 13, nature: 'humain', texte: 'Astreinte reveillee. Lea Nardi accuse reception en quatre-vingt-dix secondes.' },
  { minute: 16, nature: 'alerte', texte: 'Alerte : le taux d erreur depasse 1 %.' },
  { minute: 18, nature: 'sonde', texte: 'Le pool de connexions est sature : 100 %, plus une seule libre.' },
  { minute: 21, nature: 'humain', texte: 'Hypothese posee : la reconciliation ne relache pas sa connexion.' },
  { minute: 24, nature: 'humain', texte: 'Le trace d une requete lente remonte 4,2 s dans un seul appel.' },
  { minute: 27, nature: 'humain', texte: 'Decision : retour a la version 7e04a, sans chercher plus loin pour l instant.' },
  { minute: 29, nature: 'action', texte: 'Retour arriere lance sur les douze instances.' },
  { minute: 31, nature: 'sonde', texte: 'Le pool redescend sous 85 %. Les premieres requetes repassent.' },
  { minute: 34, nature: 'sonde', texte: 'Le taux d erreur repasse sous 1 %.' },
  { minute: 36, nature: 'sonde', texte: 'La latence p99 repasse sous 800 ms.' },
  { minute: 38, nature: 'sonde', texte: 'La file se resorbe sous cinq mille messages.' },
  { minute: 41, nature: 'humain', texte: 'Fin d incident declaree. Trente minutes depuis la premiere alerte.' },
  { minute: 47, nature: 'humain', texte: 'Rapport ecrit : une connexion par requete, jamais relachee. Correctif en revue.' },
]

/** Une phase de l incident. */
const PHASES: readonly { readonly depuis: number; readonly nom: string; readonly note: string }[] = [
  { depuis: 0, nom: 'Rien ne parait', note: 'La version est en ligne depuis sept minutes. Une sonde s agite, personne ne le sait encore.' },
  { depuis: 11, nom: 'La detection', note: 'La premiere alerte part. Onze minutes ont passe : c est le delai qu on cherche a reduire, et le seul qui depende de l outil.' },
  { depuis: 18, nom: 'Le diagnostic', note: 'Trois signaux sont au rouge en meme temps. L ordre dans lequel ils sont montes dit lequel est la cause.' },
  { depuis: 27, nom: 'La mitigation', note: 'On retablit d abord, on comprend ensuite. Le retour arriere passe avant le correctif.' },
  { depuis: 37, nom: 'Le retablissement', note: 'Les courbes redescendent dans l ordre inverse de leur montee. La file est la derniere a se vider.' },
]

/** La phase en cours, a la minute donnee. */
function phaseA(minute: number): (typeof PHASES)[number] {
  let courante = PHASES[0] as (typeof PHASES)[number]
  for (const phase of PHASES) if (minute >= phase.depuis) courante = phase
  return courante
}

/** L heure de l horloge, a la minute donnee. L incident commence a 14:15. */
function heure(minute: number): string {
  const total = 14 * 60 + 15 + minute
  return `${String(Math.floor(total / 60)).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`
}

/** Une valeur de signal, ecrite avec le bon nombre de decimales. */
function ecrit(signal: Signal, valeur: number): string {
  if (signal.cle === 'erreurs') return valeur.toFixed(1).replace('.', ',')
  if (signal.cle === 'file') return valeur.toFixed(1).replace('.', ',')
  return String(Math.round(valeur))
}

/** La teinte d une ecriture, selon sa nature. */
function teinteDe(nature: Nature): string {
  if (nature === 'alerte') return ALARME
  if (nature === 'humain') return ENCRE
  return 'var(--o-palette-zinc-400)'
}

/* ------------------------------------------------------------------------ */
/*                         Le trace des signaux                             */
/* ------------------------------------------------------------------------ */

/** Le chemin d un signal, trace jusqu a la minute courante. */
function chemin(signal: Signal, minute: number, large: number, haut: number, gauche: number, sommet: number): string {
  const points: string[] = []
  for (let m = 0; m <= Math.max(0, minute); m += 1) {
    const x = gauche + (m / (MINUTES - 1)) * large
    const y = sommet + (1 - Math.min(valeurA(signal, m), signal.haut) / signal.haut) * haut
    points.push(`${m === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`)
  }
  return points.join(' ')
}

/** Le grand trace du signal choisi, avec son seuil et la minute courante. */
function Trace({ signal, minute }: { readonly signal: Signal; readonly minute: number }): ReactElement {
  const gris: CSSProperties = { color: 'var(--o-palette-zinc-500)' }
  const gauche = 58
  const large = 872
  const sommet = 22
  const haut = 214
  const ySeuil = sommet + (1 - signal.seuil / signal.haut) * haut
  const xCourant = gauche + (minute / (MINUTES - 1)) * large
  const valeur = valeurA(signal, minute)
  const yCourant = sommet + (1 - Math.min(valeur, signal.haut) / signal.haut) * haut
  const alarme = valeur > signal.seuil

  return (
    <svg viewBox="0 0 960 282" role="img" aria-label={`${signal.nom} : ${ecrit(signal, valeur)} ${signal.unite} a la minute ${String(minute)}`} className="o-w-full">
      {/* Le seuil, et le nom de ce qu il garde. */}
      <line x1={gauche} y1={ySeuil} x2={gauche + large} y2={ySeuil} stroke={ALARME} strokeWidth="1" strokeDasharray="5 5" opacity="0.8" />
      <text x={gauche + 6} y={ySeuil - 7} className="o-font-mono" fontSize="10" fill={ALARME}>
        seuil {ecrit(signal, signal.seuil)} {signal.unite}
      </text>

      {/* Le sol, et les minutes. */}
      <line x1={gauche} y1={sommet + haut} x2={gauche + large} y2={sommet + haut} stroke="currentColor" strokeWidth="1" opacity="0.4" style={gris} />
      {[0, 6, 12, 18, 24, 30, 36, 42, 47].map((m) => (
        <text
          key={m}
          x={gauche + (m / (MINUTES - 1)) * large}
          y={sommet + haut + 18}
          textAnchor="middle"
          className="o-font-mono"
          fontSize="10"
          fill="currentColor"
          style={gris}
        >
          T+{m}
        </text>
      ))}
      <text x={gauche - 10} y={sommet + 6} textAnchor="end" className="o-font-mono" fontSize="10" fill="currentColor" style={gris}>
        {ecrit(signal, signal.haut)}
      </text>
      <text x={gauche - 10} y={sommet + haut + 4} textAnchor="end" className="o-font-mono" fontSize="10" fill="currentColor" style={gris}>
        0
      </text>

      {/* Le trace, jusqu a la minute courante, et rien au-dela. */}
      <path d={chemin(signal, minute, large, haut, gauche, sommet)} fill="none" stroke={ENCRE} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
      <line x1={xCourant} y1={sommet - 8} x2={xCourant} y2={sommet + haut} stroke="currentColor" strokeWidth="1" opacity="0.5" style={gris} />
      <circle cx={xCourant} cy={yCourant} r="5" fill={alarme ? ALARME : ENCRE} />
      <text
        x={gauche + large}
        y={sommet + 14}
        textAnchor="end"
        className="o-font-mono o-tabular-nums"
        fontSize="17"
        fill={alarme ? ALARME : ENCRE}
      >
        {ecrit(signal, valeur)} {signal.unite}
      </text>
      <text x={gauche} y="272" className="o-font-mono" fontSize="10.5" fill="currentColor" style={gris}>
        {signal.quoi}
      </text>
    </svg>
  )
}

/** Un petit trace de signal, dans la colonne de gauche. */
function Miniature({ signal, minute }: { readonly signal: Signal; readonly minute: number }): ReactElement {
  const valeur = valeurA(signal, minute)
  const alarme = valeur > signal.seuil
  return (
    <svg viewBox="0 0 130 34" aria-hidden="true" style={{ width: 130, height: 34 }}>
      <line
        x1="0"
        y1={4 + (1 - signal.seuil / signal.haut) * 26}
        x2="130"
        y2={4 + (1 - signal.seuil / signal.haut) * 26}
        stroke={ALARME}
        strokeWidth="0.8"
        strokeDasharray="3 4"
        opacity="0.7"
      />
      <path d={chemin(signal, minute, 130, 26, 0, 4)} fill="none" stroke={alarme ? ALARME : ENCRE} strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

/* ------------------------------------------------------------------------ */
/*                        Le HUD de l incident                              */
/* ------------------------------------------------------------------------ */

/** La scene epinglee : l horloge, les signaux, le journal. */
function Hud({
  minute,
  choisi,
  surChoix,
  manuel,
  surManuel,
}: {
  readonly minute: number
  readonly choisi: string
  readonly surChoix: (cle: string) => void
  readonly manuel: number | null
  readonly surManuel: (minute: number | null) => void
}): ReactElement {
  const signal = SIGNAUX.find((s) => s.cle === choisi) ?? SIGNAUX[0]
  const phase = phaseA(minute)
  const passees = JOURNAL.filter((e) => e.minute <= minute)
  const dernieres = passees.slice(-6).reverse()
  const alertes = SIGNAUX.filter((s) => valeurA(s, minute) > s.seuil)

  if (signal === undefined) return <></>

  return (
    <div className="o-flex o-h-full o-flex-col o-px-6 o-py-6 md:o-px-8">
      {/* ----- L horloge, la phase, l etat ------------------------------- */}
      <div className="o-flex o-flex-wrap o-items-baseline o-gap-x-6 o-gap-y-2 o-border-b o-pb-4" style={{ borderColor: FILET }}>
        <p className="o-m-0 o-font-mono o-tabular-nums o-tracking-tight" style={{ fontSize: 'clamp(1.5rem, 2.6vw, 2.25rem)', color: ENCRE }}>
          T+{String(minute).padStart(2, '0')}
        </p>
        <p className="o-m-0 o-font-mono o-text-sm o-tabular-nums o-text-zinc-400">{heure(minute)}</p>
        <p className="o-m-0 o-text-lg o-font-semibold o-tracking-tight o-text-zinc-50">{phase.nom}</p>
        <p className="o-m-0 o-ml-auto o-flex o-items-center o-gap-2 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: alertes.length > 0 ? ALARME : 'var(--o-palette-emerald-400)' }}>
          <Icon icon={Bell} size={13} aria-hidden="true" />
          {alertes.length === 0 ? 'aucune alerte' : `${String(alertes.length)} alerte${alertes.length > 1 ? 's' : ''}`}
        </p>
      </div>

      <div className="o-mt-5 o-grid o-min-h-0 o-grow o-gap-6 lg:o-grid-cols-12">
        {/* ----- Les quatre signaux ------------------------------------- */}
        <div className="o-min-w-0 lg:o-col-span-4">
          <ul className="o-m-0 o-list-none o-p-0">
            {SIGNAUX.map((s) => {
              const valeur = valeurA(s, minute)
              const alarme = valeur > s.seuil
              const actif = s.cle === choisi
              return (
                <li key={s.cle} className="o-border-b" style={{ borderColor: FILET }}>
                  <button
                    type="button"
                    aria-pressed={actif}
                    onClick={() => {
                      surChoix(s.cle)
                    }}
                    className="o-flex o-w-full o-cursor-pointer o-items-center o-gap-4 o-bg-transparent o-px-0 o-py-3 o-text-left o-transition-opacity hover:o-opacity-80 focus:o-ring"
                    style={{ border: 'none', opacity: actif ? 1 : 0.62 }}
                  >
                    <span className="o-min-w-0 o-grow">
                      <span className="o-flex o-items-center o-gap-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                        <Icon icon={s.icone} size={12} aria-hidden="true" />
                        {s.nom}
                      </span>
                      <span className="o-mt-1 o-block o-font-mono o-text-xl o-tabular-nums o-tracking-tight" style={{ color: alarme ? ALARME : ENCRE }}>
                        {ecrit(s, valeur)}
                        <span className="o-ml-1 o-text-xs o-text-zinc-400">{s.unite}</span>
                      </span>
                    </span>
                    <Miniature signal={s} minute={minute} />
                  </button>
                </li>
              )
            })}
          </ul>

          <p className="o-m-0 o-mt-4 o-text-xs o-leading-relaxed o-text-zinc-400">{phase.note}</p>
        </div>

        {/* ----- Le grand trace, et le journal --------------------------- */}
        <div className="o-flex o-min-w-0 o-flex-col lg:o-col-span-8">
          <div className="o-flex o-flex-wrap o-items-center o-gap-3">
            <SegmentedControl
              label="Le signal trace en grand"
              options={SIGNAUX.map((s) => ({ value: s.cle, label: s.nom }))}
              value={choisi}
              onChange={surChoix}
            />
            <div className="o-ml-auto o-flex o-items-center o-gap-3">
              <label htmlFor="incident-minute" className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                Minute
              </label>
              <input
                id="incident-minute"
                type="range"
                min={0}
                max={MINUTES - 1}
                step={1}
                value={minute}
                onChange={(evenement) => {
                  surManuel(Number(evenement.target.value))
                }}
                className="o-cursor-pointer focus:o-ring"
                style={{ accentColor: accent(400), width: 160 }}
              />
              {manuel !== null && (
                <button
                  type="button"
                  onClick={() => {
                    surManuel(null)
                  }}
                  className="o-cursor-pointer o-bg-transparent o-px-0 o-font-mono o-text-xs o-underline o-text-zinc-400 hover:o-text-zinc-100 focus:o-ring"
                  style={{ border: 'none' }}
                >
                  rendre la main au defilement
                </button>
              )}
            </div>
          </div>

          <div className="o-mt-3 o-min-h-0">
            <Trace signal={signal} minute={minute} />
          </div>

          <div className="o-mt-3 o-min-h-0 o-border-t o-pt-3" style={{ borderColor: FILET }}>
            <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
              Journal — {passees.length} ecriture{passees.length > 1 ? 's' : ''} sur {JOURNAL.length}
            </p>
            <ol className="o-m-0 o-mt-2 o-list-none o-p-0">
              {dernieres.map((ecriture) => (
                <li key={ecriture.minute} className="o-grid o-grid-cols-12 o-items-baseline o-gap-3 o-py-1">
                  <span className="o-col-span-3 o-font-mono o-text-xs o-tabular-nums sm:o-col-span-2" style={{ color: teinteDe(ecriture.nature) }}>
                    T+{String(ecriture.minute).padStart(2, '0')}
                  </span>
                  <span className="o-col-span-9 o-text-xs o-leading-relaxed o-text-zinc-300 sm:o-col-span-10">{ecriture.texte}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>
    </div>
  )
}

/** L incident, epingle : c est le defilement qui fait tourner l horloge. */
function Incident(): ReactElement {
  const [choisi, setChoisi] = useState('latence')
  const [manuel, setManuel] = useState<number | null>(null)

  return (
    <Epingle ecrans={5} actes={MINUTES}>
      {(acte) => (
        <Hud minute={manuel ?? acte} choisi={choisi} surChoix={setChoisi} manuel={manuel} surManuel={setManuel} />
      )}
    </Epingle>
  )
}

/* ------------------------------------------------------------------------ */
/*                       Figure 01 — le trace d une requete                 */
/* ------------------------------------------------------------------------ */

/** Un segment du trace, avec sa profondeur, son debut et sa duree. */
const SEGMENTS: readonly {
  readonly nom: string
  readonly niveau: number
  readonly debut: number
  readonly duree: number
  readonly coupable?: boolean
}[] = [
  { nom: 'POST /factures/reconcilier', niveau: 0, debut: 0, duree: 4210 },
  { nom: 'authentification', niveau: 1, debut: 4, duree: 12 },
  { nom: 'lecture du client', niveau: 1, debut: 18, duree: 18 },
  { nom: 'acquisition d une connexion', niveau: 1, debut: 38, duree: 3940, coupable: true },
  { nom: 'requete SQL', niveau: 2, debut: 3980, duree: 214 },
  { nom: 'calcul de la taxe', niveau: 1, debut: 4194, duree: 9 },
  { nom: 'ecriture du journal', niveau: 1, debut: 4200, duree: 7 },
]

/**
 * Figure 01 — une requete, ouverte.
 *
 * C est la piece qui manque a toutes les pages du genre : pas un tableau de
 * durees, mais la **cascade** — et le fait que le segment coupable ne calcule
 * rien. Il attend. Trois secondes et neuf dixiemes passees a demander une
 * connexion qu un autre appel garde depuis le deploiement.
 */
function FigureTrace(): ReactElement {
  const { ref, vu } = useInView<SVGSVGElement>({ amount: 0.3 })
  const gris: CSSProperties = { color: 'var(--o-palette-zinc-500)' }
  const gauche = 330
  const large = 600
  const total = 4210
  return (
    <svg ref={ref} viewBox="0 0 1000 250" aria-hidden="true" className="o-w-full" style={{ minWidth: 720 }}>
      <text x="20" y="22" className="o-font-mono" fontSize="10.5" fill="currentColor" style={gris}>
        une requete, prise au hasard a T+24 — 4 210 ms de bout en bout
      </text>

      {SEGMENTS.map((segment, rang) => {
        const y = 48 + rang * 26
        const x = gauche + (segment.debut / total) * large
        const w = Math.max(2, (segment.duree / total) * large)
        return (
          <g key={segment.nom}>
            <text x={20 + segment.niveau * 16} y={y + 9} fontSize="12" fill="currentColor" style={segment.coupable === true ? { color: ENCRE } : undefined}>
              {segment.nom}
            </text>
            <rect
              x={x}
              y={y}
              width={w}
              height="13"
              rx="2.5"
              fill={segment.coupable === true ? ALARME : ENCRE}
              opacity={segment.coupable === true ? 0.95 : 0.45}
              style={{
                transformBox: 'fill-box',
                transformOrigin: 'left center',
                transform: vu ? 'scaleX(1)' : 'scaleX(0)',
                transition: `transform 700ms cubic-bezier(0.16, 1, 0.3, 1) ${String(rang * 110)}ms`,
              }}
            />
            <text
              x={x + w + 8}
              y={y + 11}
              className="o-font-mono o-tabular-nums"
              fontSize="10.5"
              fill="currentColor"
              style={segment.coupable === true ? { color: ALARME } : gris}
            >
              {segment.duree} ms
            </text>
          </g>
        )
      })}

      {/* L echelle de temps, sous la cascade. */}
      <line x1={gauche} y1="240" x2={gauche + large} y2="240" stroke="currentColor" strokeWidth="1" opacity="0.4" style={gris} />
      {[0, 1000, 2000, 3000, 4000].map((ms) => (
        <g key={ms}>
          <line x1={gauche + (ms / total) * large} y1="236" x2={gauche + (ms / total) * large} y2="240" stroke="currentColor" strokeWidth="1" opacity="0.6" style={gris} />
          <text x={gauche + (ms / total) * large} y="234" textAnchor="middle" className="o-font-mono" fontSize="10" fill="currentColor" style={gris}>
            {ms / 1000} s
          </text>
        </g>
      ))}
    </svg>
  )
}

/* ------------------------------------------------------------------------ */
/*                    C18 — la carte de chaleur en cases                    */
/* ------------------------------------------------------------------------ */

/** Le nombre de jours portes par la carte. */
const JOURS = 30

/** Les minutes degradees, par service et par jour du mois. Le reste est a zero. */
const CHALEUR: readonly { readonly service: string; readonly jours: Readonly<Record<number, number>> }[] = [
  { service: 'Passerelle', jours: { 8: 30, 23: 12, 27: 5 } },
  { service: 'Facturation', jours: { 2: 6, 8: 30, 19: 4 } },
  { service: 'Paiements', jours: { 8: 22, 14: 9 } },
  { service: 'Notifications', jours: { 5: 2, 8: 26 } },
  { service: 'Recherche', jours: { 8: 12, 23: 41, 24: 7 } },
  { service: 'Fichiers', jours: { 11: 18 } },
  { service: 'Catalogue', jours: { 21: 3 } },
  { service: 'Authentification', jours: {} },
]

/** Les cinq degres de la carte : ce que vaut une case. */
const DEGRES: readonly { readonly depuis: number; readonly part: number; readonly mot: string }[] = [
  { depuis: 0, part: 0, mot: 'rien' },
  { depuis: 1, part: 0.25, mot: '1 a 5 min' },
  { depuis: 6, part: 0.45, mot: '6 a 15 min' },
  { depuis: 16, part: 0.7, mot: '16 a 30 min' },
  { depuis: 31, part: 1, mot: 'plus de 30 min' },
]

/** Le degre d une case. */
function degreDe(minutes: number): (typeof DEGRES)[number] {
  let trouve = DEGRES[0] as (typeof DEGRES)[number]
  for (const degre of DEGRES) if (minutes >= degre.depuis) trouve = degre
  return trouve
}

/** La carte de chaleur : trente jours, huit services. */
function Chaleur(): ReactElement {
  const { ref, vu } = useInView<HTMLDivElement>({ amount: 0.2 })
  const total = useMemo(
    () => CHALEUR.reduce((somme, ligne) => somme + Object.values(ligne.jours).reduce((s, v) => s + v, 0), 0),
    [],
  )

  return (
    <div ref={ref}>
      <div className="o-overflow-x-auto o-pb-2" style={{ overflowY: 'hidden' }}>
        <table className="o-text-left o-text-sm" style={{ minWidth: 1040, borderCollapse: 'collapse' }}>
          <caption className="o-sr-only">
            Minutes de service degrade, par service et par jour, sur les trente jours d avril 2026
          </caption>
          <thead>
            <tr>
              <th scope="col" className="o-px-2 o-py-1 o-text-left o-font-mono o-text-xs o-font-normal o-uppercase o-tracking-widest o-text-zinc-600">
                Service
              </th>
              {Array.from({ length: JOURS }, (_, place) => place + 1).map((jour) => (
                <th
                  key={jour}
                  scope="col"
                  className="o-px-0 o-py-1 o-text-center o-font-mono o-text-xs o-font-normal o-tabular-nums"
                  style={{ width: 30, color: jour === 8 ? 'var(--o-theme-fg)' : 'var(--o-theme-muted)' }}
                >
                  {jour % 2 === 0 ? jour : ''}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {CHALEUR.map((ligne, rang) => (
              <tr key={ligne.service}>
                <th scope="row" className="o-whitespace-nowrap o-px-2 o-py-1 o-text-left o-text-xs o-font-normal">
                  {ligne.service}
                </th>
                {Array.from({ length: JOURS }, (_, place) => place + 1).map((jour) => {
                  const minutes = ligne.jours[jour] ?? 0
                  const degre = degreDe(minutes)
                  return (
                    <td key={jour} className="o-p-0" style={{ width: 30 }}>
                      <span
                        title={`${ligne.service}, ${String(jour)} avril — ${minutes === 0 ? 'aucune degradation' : `${String(minutes)} min degradees`}`}
                        className="o-block"
                        style={{
                          height: 28,
                          margin: 2,
                          borderRadius: 3,
                          border: `1px solid ${FILET_JOUR}`,
                          backgroundColor: degre.part === 0 ? 'transparent' : accentDoux(600, Math.round(degre.part * 100)),
                          opacity: vu ? 1 : 0,
                          transition: `opacity 420ms ease ${String(rang * 60 + jour * 10)}ms`,
                        }}
                      />
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="o-mt-6 o-flex o-flex-wrap o-items-center o-gap-x-6 o-gap-y-3 o-border-t o-pt-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600" style={{ borderColor: FILET_JOUR }}>
        {DEGRES.map((degre) => (
          <span key={degre.mot} className="o-inline-flex o-items-center o-gap-2">
            <span
              aria-hidden="true"
              className="o-block"
              style={{
                width: 16,
                height: 16,
                borderRadius: 3,
                border: `1px solid ${FILET_JOUR}`,
                backgroundColor: degre.part === 0 ? 'transparent' : accentDoux(600, Math.round(degre.part * 100)),
              }}
            />
            {degre.mot}
          </span>
        ))}
        <span className="o-ml-auto o-normal-case o-tracking-normal">
          {total} minutes degradees sur le mois, toutes lignes confondues.
        </span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------------ */
/*                                 La page                                  */
/* ------------------------------------------------------------------------ */

/** Un intitule de section. */
function Titre({ indice, id, children }: { readonly indice: string; readonly id: string; readonly children: ReactNode }): ReactElement {
  return (
    <>
      <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: ENCRE }}>
        {indice}
      </p>
      <h2 id={id} className="o-m-0 o-mt-5 o-text-balance o-text-zinc-50" style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 3.2vw, 3.25rem)' }}>
        {children}
      </h2>
    </>
  )
}

/** La vitrine. */
export default function Page(): ReactElement {
  const polices = usePolices('onest')

  return (
    <Porte forme="compteur" marque="Vigie">
      <div className="o-text-zinc-100" style={{ ...polices, ...nuit('zinc') }}>
        <BarreFilet marque="Vigie" liens={LIENS} action={['#essai', 'Poser une sonde']} sombre />

        <main>
          {/* =============== L ouverture : l hologramme et le HUD ========== */}
          <section id="sommet" aria-label="Ouverture" className="o-relative o-isolate o-overflow-hidden o-px-6 o-pb-24 o-pt-20 md:o-px-8 md:o-pb-32 md:o-pt-28">
            <div aria-hidden="true" className="o-absolute o-inset-0 o-z-0">
              <Hologram
                className="o-absolute o-inset-0"
                meridians={14}
                parallels={8}
                rpm={3}
                flicker={0.35}
                colors={['--o-palette-zinc-950', '--o-vitrine-400', '--o-palette-zinc-200']}
                poster="o-bg-zinc-950"
              />
              <div
                className="o-absolute o-inset-0"
                style={{
                  background:
                    'linear-gradient(to right, color-mix(in oklab, var(--o-palette-zinc-950) 94%, transparent) 0%, color-mix(in oklab, var(--o-palette-zinc-950) 86%, transparent) 46%, color-mix(in oklab, var(--o-palette-zinc-950) 42%, transparent) 72%, transparent 100%)',
                }}
              />
              <div className="o-absolute o-inset-x-0 o-bottom-0 o-h-40" style={{ background: 'linear-gradient(to bottom, transparent, var(--o-palette-zinc-950))' }} />
            </div>
            <Grain opacite={0.06} />

            <div className="o-relative o-z-20 o-mx-auto o-max-w-7xl">
              <Surgit delai={40}>
                <Etiquette sombre>Vigie 5 — traces, mesures, journaux</Etiquette>
              </Surgit>

              <TitreVague delai={140} cadence={68} className="o-mt-8 o-max-w-4xl o-text-zinc-50" style={affiche('l', 300)}>
                Onze minutes avant de savoir.
              </TitreVague>

              <div className="o-mt-10 o-grid o-gap-8 o-border-t o-pt-8 md:o-grid-cols-12" style={{ borderColor: FILET }}>
                <Surgit delai={440} as="p" className="o-m-0 o-text-base o-leading-relaxed o-text-zinc-400 md:o-col-span-5">
                  C est le delai qu il a fallu, le 8 avril, pour qu une alerte parte. Tout le reste de cette page est cet incident-la, minute par minute — et ce que Vigie y a montre.
                </Surgit>
                <Surgit delai={520} as="p" className="o-m-0 o-font-mono o-text-xs o-leading-relaxed o-uppercase o-tracking-widest o-text-zinc-400 md:o-col-span-3">
                  Quatre signaux
                  <br />
                  Seize ecritures
                  <br />
                  Trente minutes de retablissement
                </Surgit>
                <Surgit delai={600} className="md:o-col-span-4">
                  <a
                    href="#incident"
                    className="o-inline-flex o-items-center o-gap-3 o-rounded-full o-px-6 o-py-3 o-text-sm o-font-semibold o-no-underline o-transition-opacity hover:o-opacity-85 focus:o-ring"
                    style={{ backgroundColor: accent(400), color: 'var(--o-palette-zinc-950)' }}
                  >
                    <Icon icon={Radar} size={15} aria-hidden="true" />
                    Traverser l incident
                  </a>
                </Surgit>
              </div>
            </div>

            <Coin position="bg" sombre>
              Incident 2026-041
              <br />
              Mercredi 8 avril, 14:15
            </Coin>
            <Coin position="bd" sombre>
              Sur site ou heberge
              <br />
              Aucune donnee ne quitte votre reseau
            </Coin>
          </section>

          {/* =============== Le ruban des sondes =========================== */}
          <div className="o-border-t o-border-b o-px-6 o-py-4 md:o-px-8" style={{ borderColor: FILET }}>
            <ul className="o-m-0 o-mx-auto o-flex o-max-w-7xl o-list-none o-flex-wrap o-items-center o-gap-x-9 o-gap-y-3 o-p-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
              {SIGNAUX.map((signal) => (
                <li key={signal.cle} className="o-inline-flex o-items-center o-gap-2">
                  <Icon icon={signal.icone} size={13} style={{ color: ENCRE }} aria-hidden="true" />
                  {signal.nom}
                </li>
              ))}
              <li className="o-ml-auto o-normal-case o-tracking-normal">Un seuil par signal, ecrit par vous, relu tous les trimestres.</li>
            </ul>
          </div>

          {/* =============== (01) L incident, epingle ======================= */}
          <section id="incident" aria-labelledby="incident-titre" className="o-scroll-mt-24 o-px-6 o-pb-4 o-pt-20 md:o-px-8 md:o-pt-28">
            <div className="o-mx-auto o-max-w-7xl">
              <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
                <div className="md:o-col-span-7">
                  <Titre indice="(01) — L incident" id="incident-titre">
                    Quarante-huit minutes, une minute a la fois.
                  </Titre>
                </div>
                <p className="o-m-0 o-max-w-sm o-text-sm o-leading-relaxed o-text-zinc-400 md:o-col-span-5">
                  La scene reste collee pendant cinq ecrans : c est le defilement qui fait tourner l horloge. Le curseur reprend la main pour revenir en arriere.
                </p>
              </div>
            </div>
          </section>
          <Incident />

          {/* =============== Figure 01 : le trace d une requete ============= */}
          <section id="trace" aria-labelledby="trace-titre" className="o-scroll-mt-24 o-border-t o-px-6 o-py-24 md:o-px-8 md:o-py-32" style={{ borderColor: FILET }}>
            <div className="o-mx-auto o-grid o-max-w-7xl o-gap-10 lg:o-grid-cols-12">
              <div className="lg:o-col-span-3">
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: ENCRE }}>
                  Figure 01
                </p>
                <h2 id="trace-titre" className="o-m-0 o-mt-5 o-text-balance o-text-zinc-50" style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 3.2vw, 3.25rem)' }}>
                  Le segment qui ne calcule rien.
                </h2>
                <p className="o-mt-5 o-text-sm o-leading-relaxed o-text-zinc-400">
                  A la vingt-quatrieme minute, Lea ouvre une requete au hasard. Sur quatre secondes et deux dixiemes, la base n en prend que deux cent quatorze millisecondes.
                </p>
                <p className="o-mt-4 o-text-sm o-leading-relaxed o-text-zinc-400">
                  Le reste est une attente : la requete demande une connexion, et toutes sont prises. C est la, et nulle part ailleurs, que l incident se lit.
                </p>
              </div>

              <figure className="o-m-0 o-min-w-0 lg:o-col-span-9">
                <div className="o-overflow-x-auto o-pb-2" style={{ overflowY: 'hidden' }}>
                  <FigureTrace />
                </div>
                <ol className="o-sr-only">
                  {SEGMENTS.map((segment) => (
                    <li key={segment.nom}>
                      {segment.nom} — {segment.duree} millisecondes, a partir de {segment.debut}.
                    </li>
                  ))}
                </ol>
                <figcaption className="o-mt-6 o-border-t o-pt-4 o-font-mono o-text-xs o-leading-relaxed o-text-zinc-400" style={{ borderColor: FILET }}>
                  Figure 01 — la cascade d une requete prise a T+24. Le segment en rouge n execute rien : il attend une connexion libre.
                </figcaption>
              </figure>
            </div>
          </section>

          {/* =============== La coupe claire : la carte de chaleur (C18) ====
              La page est sombre : la coupe est donc une bande claire, et rien
              dedans que les deux cent quarante cases du mois. */}
          <section id="chaleur" aria-labelledby="chaleur-titre" className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-8 md:o-py-32" style={JOUR}>
            <div className="o-mx-auto o-max-w-7xl">
              <div className="o-grid o-gap-10 lg:o-grid-cols-12 lg:o-items-end">
                <div className="lg:o-col-span-6">
                  <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600">Avril 2026</p>
                  <h2 id="chaleur-titre" className="o-m-0 o-mt-5 o-text-balance o-text-zinc-950" style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 3.2vw, 3.25rem)' }}>
                    Une colonne qui traverse tout le mois.
                  </h2>
                </div>
                <p className="o-m-0 o-max-w-md o-text-sm o-leading-relaxed o-text-zinc-600 lg:o-col-span-6">
                  Deux cent quarante cases, une par service et par jour. Les incidents isoles se voient ; celui du 8 avril se lit autrement — il descend la colonne entiere, et c est ce qui dit qu il venait de la passerelle, pas d un service.
                </p>
              </div>

              <div className="o-mt-12">
                <Chaleur />
              </div>
            </div>
          </section>

          {/* =============== (02) Ce qu on garde ============================ */}
          <section id="retention" aria-labelledby="retention-titre" className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-8 md:o-py-32">
            <div className="o-mx-auto o-grid o-max-w-7xl o-gap-12 lg:o-grid-cols-12">
              <div className="o-min-w-0 lg:o-col-span-5">
                <Titre indice="(02) — Ce qu on garde" id="retention-titre">
                  Tout, puis moins, puis presque rien.
                </Titre>
                <p className="o-mt-6 o-text-base o-leading-relaxed o-text-zinc-400">
                  Garder chaque trace treize mois couterait plus cher que le service qu elles observent. Vigie degrade donc la finesse avec l age, et le dit — c est la seule chose qu on ne peut pas rattraper apres coup.
                </p>
                <p className="o-mt-4 o-text-base o-leading-relaxed o-text-zinc-400">
                  Une exception : les traces d une periode declaree en incident ne sont jamais degradees. Elles restent entieres cinq ans, parce qu un rapport se relit longtemps apres.
                </p>
              </div>

              <div className="o-min-w-0 lg:o-col-span-7">
                <Timeline
                  label="Les paliers de retention"
                  events={[
                    { date: 'Heure en cours', title: 'Tout, a la seconde', body: 'Chaque trace, chaque mesure, chaque ligne de journal. C est la fenetre dans laquelle on travaille pendant un incident.' },
                    { date: 'Sept jours', title: 'Les traces echantillonnees', body: 'Une trace sur cent est gardee entiere ; les autres se reduisent a leur duree et a leur resultat. Les mesures restent a la minute.' },
                    { date: 'Treize mois', title: 'Les mesures a l heure', body: 'De quoi comparer un mardi de mars a celui de l an dernier. Les journaux sont partis, sauf ceux marques.' },
                    { date: 'Cinq ans', title: 'Les periodes d incident, entieres', body: 'Rien n est degrade dans une fenetre declaree en incident : traces, mesures et journaux restent au grain d origine.' },
                  ]}
                />
              </div>
            </div>
          </section>

          {/* =============== Un ecran, une phrase =========================== */}
          <section aria-labelledby="phrase-titre" className="o-border-t o-px-6 o-py-32 md:o-px-8 md:o-py-44" style={{ borderColor: FILET }}>
            <div className="o-mx-auto o-grid o-max-w-7xl o-gap-10 md:o-grid-cols-12">
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 md:o-col-span-3">
                Le principe
              </p>
              <div className="md:o-col-span-9">
                <h2 id="phrase-titre" className="o-sr-only">
                  Le principe de Vigie
                </h2>
                <ScrollFloat
                  as="p"
                  lift={22}
                  course={0.5}
                  className="o-m-0 o-max-w-4xl o-text-balance o-text-zinc-50"
                  style={{ ...affiche('m', 300), fontSize: 'clamp(1.6rem, 3.2vw, 3.5rem)', lineHeight: 1.12 }}
                >
                  Un tableau de bord ne sert a rien pendant un incident. Ce qui sert, c est de pouvoir poser une question qui n avait pas ete prevue.
                </ScrollFloat>
              </div>
            </div>
          </section>

          {/* =============== A16 : la commande, en une ligne ================ */}
          <section id="essai" aria-labelledby="essai-titre" className="o-scroll-mt-24 o-border-t o-px-6 o-py-24 md:o-px-8 md:o-py-32" style={{ borderColor: FILET }}>
            <div className="o-mx-auto o-max-w-3xl">
              <h2 id="essai-titre" className="o-m-0 o-text-balance o-text-zinc-50" style={{ ...affiche('m', 300), fontSize: 'clamp(2rem, 4.4vw, 3.5rem)' }}>
                Posez une sonde, et regardez une semaine.
              </h2>
              <p className="o-mt-5 o-max-w-xl o-text-sm o-leading-relaxed o-text-zinc-400">
                Un agent, une ligne de configuration, et les quatre signaux de cette page sur vos propres services. Rien a decider avant d avoir vu vos courbes.
              </p>

              <form
                className="o-mt-10 o-flex o-items-center o-rounded-lg"
                style={{ border: `1px solid ${FILET}`, backgroundColor: 'color-mix(in oklab, #ffffff 4%, transparent)' }}
                onSubmit={(evenement) => {
                  evenement.preventDefault()
                }}
              >
                <span aria-hidden="true" className="o-pl-4 o-pr-2">
                  <Icon icon={Terminal} size={16} style={{ color: ENCRE }} />
                </span>
                <label htmlFor="vigie-courriel" className="o-sr-only">
                  Votre adresse de courriel professionnelle
                </label>
                <input
                  id="vigie-courriel"
                  name="vigie-courriel"
                  type="email"
                  placeholder="vigie install --pour vous@la-maison.fr"
                  className="o-min-w-0 o-grow o-bg-transparent o-py-4 o-pr-3 o-font-mono o-text-sm o-text-zinc-50 focus:o-ring"
                  style={{ border: 'none', borderRadius: 0 }}
                />
                <button
                  type="submit"
                  className="o-inline-flex o-shrink-0 o-cursor-pointer o-items-center o-gap-2 o-px-6 o-py-4 o-text-sm o-font-semibold o-transition-opacity hover:o-opacity-85 focus:o-ring"
                  style={{ backgroundColor: accent(400), color: 'var(--o-palette-zinc-950)', border: 'none' }}
                >
                  Recevoir la cle
                  <Icon icon={ArrowRight} size={15} aria-hidden="true" />
                </button>
              </form>
            </div>
          </section>
        </main>

        {/* =============== P18 : l ours, en trois colonnes de chasse fixe === */}
        <footer className="o-border-t o-px-6 o-pb-10 o-pt-14 md:o-px-8" style={{ borderColor: FILET }}>
          <div className="o-mx-auto o-max-w-7xl">
            <div className="o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-4 o-border-b o-pb-4" style={{ borderColor: FILET }}>
              <p className="o-m-0 o-font-mono o-text-sm o-uppercase o-tracking-widest o-text-zinc-50">Vigie</p>
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
                Bulletin d exploitation — numero 41, avril 2026
              </p>
            </div>

            <div className="o-mt-8 o-grid o-gap-8 md:o-grid-cols-3">
              {([
                [
                  'L astreinte',
                  'Rotation de six personnes, une semaine chacune, jamais deux semaines de suite. Lea Nardi, Tarek Boulanger, Come Ravel, Ines Delaunay, Bastien Lecointre, Nadia Toussaint. Reveil par appel, puis par message, puis par le suivant dans la liste.',
                ],
                [
                  'Les sondes',
                  'Agent unique, ecrit en Rust, quatre megaoctets, sans dependance a l execution. Il lit les mesures exposees par vos services, les traces au format ouvert, et les journaux du systeme. Il n ouvre aucun port entrant.',
                ],
                [
                  'Les mentions',
                  'Vigie SAS, capital de 96 000 EUR, RCS Lyon 913 447 220, 14 rue Chevreul, 69007 Lyon. Hebergement a Strasbourg et a Gravelines. Etat du service publie en continu. Accessibilite : partiellement conforme, declaration du 14 janvier 2026.',
                ],
              ] as const).map(([titre, texte]) => (
                <div key={titre}>
                  <h2 className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: ENCRE }}>
                    {titre}
                  </h2>
                  <p className="o-m-0 o-mt-3 o-font-mono o-text-xs o-leading-relaxed o-text-zinc-400">{texte}</p>
                </div>
              ))}
            </div>

            <div className="o-mt-10 o-flex o-flex-wrap o-items-center o-justify-between o-gap-4 o-border-t o-pt-6 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500" style={{ borderColor: FILET }}>
              <span>Lyon 69007 — 14 rue Chevreul</span>
              <nav aria-label="Mentions" className="o-flex o-flex-wrap o-gap-x-6 o-gap-y-2">
                {([
                  ['#incident', 'Rapports publics'],
                  ['#retention', 'Traitement des donnees'],
                  ['#trace', 'Documentation de l agent'],
                  ['#essai', 'Nous ecrire'],
                ] as const).map(([cible, mot]) => (
                  <a key={mot} href={cible} className="o-no-underline o-text-zinc-500 hover:o-text-zinc-200 o-transition-colors focus:o-ring">
                    {mot}
                  </a>
                ))}
              </nav>
              <span>© 2026 Vigie SAS</span>
            </div>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
