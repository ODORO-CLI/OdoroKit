/**
 * Aphelie — operateur de satellites d observation.
 *
 * ## L architecture : la sequence, puis la table
 *
 * Landing page complete dont le milieu est **une table de constellation** :
 * un operateur ne demande pas qu on le croie, il montre ce qui vole, ligne a
 * ligne, en chasse fixe. On choisit un satellite, la telemetrie suit dans le
 * panneau colle a droite — c est le mecanisme de la page, et il n a pas bouge.
 *
 * Ce qui a change, c est tout ce qui l entoure :
 *
 * - **l ouverture** : le satellite lui-meme, en volume, a droite du titre ;
 * - **la sequence de lancement**, epinglee : quatre actes qui se remplacent
 *   sur un meme ecran — allumage, acquisition du signal, premiere image, mise
 *   en service — avec le nom de la mission extrude et le temps ecoule qui
 *   roule ;
 * - **la constellation en table**, sous un reticule qui suit le pointeur ;
 * - **le prochain lancement**, en compte a rebours qui tourne ;
 * - **le pied**, un tableau a filets, comme une fiche technique.
 *
 * ## L objet, et pourquoi il a pris la place du decor
 *
 * La page portait des anneaux orbitaux en three.js : un decor devant lequel on
 * passe. Un operateur de satellites vend un **engin**, pas une orbite. La seule
 * surface three.js accordee a la page sert donc maintenant a Vireo : corps
 * prismatique a six pans, deux panneaux montes sur leur commande d orientation,
 * antenne parabolique sur sa perche, tuyere sous le plancher. Il tourne
 * lentement, et les panneaux se recalent sur la lumiere a chaque image, comme
 * le fait un mecanisme d orientation solaire a un axe.
 *
 * Le ciel, lui, redescend au CSS : un degrade de nuit et deux cents etoiles
 * semees d une suite deterministe, qui scintillent et derivent. Aucune surface
 * n y est consommee, et il survit au mouvement reduit.
 *
 * Sous mouvement reduit, sans WebGL ou quand le plafond de surfaces est
 * atteint, l engin est rendu en **elevation cotee** : la meme machine, en
 * dessin technique, avec son envergure, sa hauteur et le diametre de son
 * antenne.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import {
  Activity,
  ArrowRight,
  ArrowUpRight,
  TriangleAlert,
} from '@odoro-cli/icons/outline'
import { Reveal } from '@odoro-cli/libs/motion'
import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactElement,
} from 'react'

import { Crosshair } from '@/odoro/effect/Crosshair.jsx'
import { CounterRoll } from '@/odoro/text/CounterRoll.jsx'
import { DepthText } from '@/odoro/text/DepthText.jsx'
import { Stepper } from '@/odoro/ui/Stepper.jsx'

import { nuit, Voile } from './communs.jsx'
import { photo } from './media.js'
import { accent, accentDoux, aplat, encre, encreSurSombre } from './palettes.js'
import {
  Actions,
  affiche,
  BarreGelule,
  Coin,
  Etiquette,
  Grain,
  Indice,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
} from './marche.jsx'
import { Epingle } from './scene.jsx'
import { eclairer, teinte, Volume } from './volume.jsx'

const MISSIONS = ['Optique', 'Radar', 'Infrarouge'] as const
type Mission = (typeof MISSIONS)[number]

/** L etat d un satellite. */
type Etat = 'Nominal' | 'Degrade' | 'Maintenance'

/** Un satellite de la constellation. */
interface Sat {
  readonly nom: string
  readonly mission: Mission
  readonly etat: Etat
  readonly altitude: number
  readonly inclinaison: number
  readonly resolution: string
  readonly lance: string
  readonly fenetre: string
  readonly batterie: number
  readonly stockage: number
  readonly note: string
}

/** La constellation, telle que la table la montre. */
const CONSTELLATION: readonly Sat[] = [
  {
    nom: 'APH-01',
    mission: 'Optique',
    etat: 'Nominal',
    altitude: 512,
    inclinaison: 97.4,
    resolution: '50 cm pan.',
    lance: 'Mars 2022',
    fenetre: '14 h 08 UTC',
    batterie: 97,
    stockage: 22,
    note: 'Premier de la serie Vireo. Reserve de propergol pour huit ans de maintien a poste.',
  },
  {
    nom: 'APH-02',
    mission: 'Optique',
    etat: 'Nominal',
    altitude: 512,
    inclinaison: 97.4,
    resolution: '50 cm pan.',
    lance: 'Mars 2022',
    fenetre: '15 h 41 UTC',
    batterie: 95,
    stockage: 61,
    note: 'Meme plan orbital que APH-01, dephase de 45 degres en anomalie moyenne.',
  },
  {
    nom: 'APH-05',
    mission: 'Radar',
    etat: 'Nominal',
    altitude: 570,
    inclinaison: 97.9,
    resolution: '1 m stripmap',
    lance: 'Sept. 2023',
    fenetre: '16 h 22 UTC',
    batterie: 91,
    stockage: 38,
    note: 'Bande X. Voit a travers la couverture nuageuse et de nuit, sans exception.',
  },
  {
    nom: 'APH-06',
    mission: 'Radar',
    etat: 'Degrade',
    altitude: 569,
    inclinaison: 97.9,
    resolution: '1 m stripmap',
    lance: 'Sept. 2023',
    fenetre: '17 h 55 UTC',
    batterie: 68,
    stockage: 44,
    note: 'Un des deux panneaux solaires ne se deploie qu a 80 %. Capacite reduite d un tiers, sans effet sur la qualite image.',
  },
  {
    nom: 'APH-08',
    mission: 'Infrarouge',
    etat: 'Nominal',
    altitude: 495,
    inclinaison: 97.2,
    resolution: '3,5 m therm.',
    lance: 'Juin 2024',
    fenetre: '06 h 12 UTC demain',
    batterie: 99,
    stockage: 12,
    note: 'Detection de foyers a partir de 4 metres carres. Employe par trois services de securite civile.',
  },
  {
    nom: 'APH-09',
    mission: 'Infrarouge',
    etat: 'Maintenance',
    altitude: 494,
    inclinaison: 97.2,
    resolution: '3,5 m therm.',
    lance: 'Juin 2024',
    fenetre: 'Reprise le 18 sept.',
    batterie: 88,
    stockage: 0,
    note: 'Recalage de la chaine de detection apres derive thermique. Immobilise onze jours, comme annonce le 2 septembre.',
  },
  {
    nom: 'APH-11',
    mission: 'Optique',
    etat: 'Nominal',
    altitude: 505,
    inclinaison: 97.4,
    resolution: '30 cm pan.',
    lance: 'Fev. 2026',
    fenetre: '13 h 30 UTC',
    batterie: 100,
    stockage: 8,
    note: 'Generation la plus recente. Trente centimetres au nadir, quarante a 30 degres de depointage.',
  },
  {
    nom: 'APH-12',
    mission: 'Optique',
    etat: 'Nominal',
    altitude: 505,
    inclinaison: 97.4,
    resolution: '30 cm pan.',
    lance: 'Fev. 2026',
    fenetre: '15 h 03 UTC',
    batterie: 100,
    stockage: 5,
    note: 'Jumeau de APH-11. Les deux ont ete lances sur le meme vol.',
  },
]

/** Le satellite lu par defaut, quand aucun choix ne tient. */
const SAT_ZERO: Sat = CONSTELLATION[6] ?? {
  nom: 'APH-11',
  mission: 'Optique',
  etat: 'Nominal',
  altitude: 505,
  inclinaison: 97.4,
  resolution: '30 cm pan.',
  lance: 'Fev. 2026',
  fenetre: '13 h 30 UTC',
  batterie: 100,
  stockage: 8,
  note: '',
}

/** Les passages a venir, sous le panneau. */
const PASSAGES: readonly (readonly [string, string, string, string])[] = [
  ['13 h 30', 'APH-11', 'Kiruna', 'Acquisition programmee — Rotterdam'],
  ['14 h 08', 'APH-01', 'Kiruna', 'Vidage memoire, 42 Go'],
  ['14 h 51', 'APH-11', 'Hobart', 'Vidage memoire, 18 Go'],
  ['15 h 03', 'APH-12', 'Kiruna', 'Acquisition programmee — Bergen'],
  ['15 h 41', 'APH-02', 'Kourou', 'Acquisition archive — Guyane'],
]

/**
 * La sequence de lancement de Vireo-4, le vol qui a mis APH-11 et APH-12 a
 * poste. Quatre actes, chacun avec son temps ecoule en minutes.
 */
const ACTE_ZERO = {
  id: 'allumage',
  etape: 'T − 0',
  titre: 'Allumage, Kourou.',
  texte:
    'Ensemble de lancement ELV-4, 12 fevrier 2026, 09 h 20 UTC. Deux satellites de 410 kg sous la coiffe.',
  minutes: 0,
} as const

/** Un acte de la sequence. */
interface Acte {
  readonly id: string
  readonly etape: string
  readonly titre: string
  readonly texte: string
  readonly minutes: number
  readonly graine?: string
  readonly alt?: string
}

const ACTES: readonly Acte[] = [
  ACTE_ZERO,
  {
    id: 'signal',
    etape: 'T + 9 min',
    titre: 'Le signal, depuis Kiruna.',
    texte:
      'Separation a 505 km, puis acquisition du signal a la premiere visibilite. Panneaux deployes, batterie a 100 %.',
    minutes: 9,
    graine: 'aphelie-station',
    alt: 'Antenne de 7,3 m en bande X, station de Kiruna',
  },
  {
    id: 'image',
    etape: 'J + 3',
    titre: 'La premiere image.',
    texte:
      'Parcelles du Beauce, trente centimetres au nadir. La chaine optique est calibree sur trois passages.',
    minutes: 4320,
    graine: 'aphelie-champ',
    alt: 'Parcelles agricoles, image satellite en fausses couleurs',
  },
  {
    id: 'service',
    etape: 'J + 30',
    titre: 'En service.',
    texte:
      'Le port de Rotterdam, en veille continue depuis le 14 mars. Deux satellites de plus dans la table qui suit.',
    minutes: 43200,
    graine: 'aphelie-port',
    alt: 'Terminal a conteneurs vu du ciel',
  },
]

/** Le prochain lancement : Vireo-5, en compte a rebours. */
const PROCHAIN = new Date('2026-11-14T09:20:00Z')

/** La fiche du pied, en tableau a filets. */
const FICHE: readonly (readonly [string, readonly string[]])[] = [
  ['Societe', ['Aphelie SA au capital de 18 400 000 EUR', 'RCS Toulouse 851 007 442']],
  ['Siege', ['9 avenue du General Eisenhower', '31100 Toulouse']],
  ['Missions', ['Optique 30 cm', 'Radar bande X', 'Infrarouge thermique']],
  ['Segment sol', ['Kiruna, 67,8 N', 'Kourou, 5,2 N', 'Hobart, 42,9 S']],
  [
    'Tarifs',
    [
      'Archive, 9 EUR par km2',
      'Programmation, 28 EUR par km2',
      'Veille continue, sur devis',
    ],
  ],
  [
    'Documents',
    ['Specifications techniques', 'Conditions de licence', 'Rapport de revisite 2025'],
  ],
  [
    'Reglementation',
    [
      'Operateur declare, loi sur les operations spatiales',
      'Reglement (UE) 2021/821, biens a double usage',
    ],
  ],
  ['Contact', ['commercial@aphelie.space', '+33 5 61 00 00 00']],
]

/* ============================ Le ciel, en CSS ============================ */

const STYLE_SPATIAL = 'o-vitrine-spatial'

/**
 * Deux choses que les utilitaires n ont pas : une etoile qui scintille, et un
 * champ d etoiles qui derive tres lentement. Les deux sont coupees sous
 * mouvement reduit — le ciel reste, il cesse simplement de bouger.
 */
const CSS_SPATIAL = [
  '@keyframes o-sp-scintille{0%,100%{opacity:var(--o-sp-bas,0.2)}50%{opacity:var(--o-sp-haut,0.9)}}',
  '@keyframes o-sp-derive{0%{transform:translate3d(0,0,0)}100%{transform:translate3d(-2%,3%,0)}}',
  '[data-o-sp-etoile]{animation:o-sp-scintille var(--o-sp-duree,5s) ease-in-out var(--o-sp-delai,0s) infinite}',
  '[data-o-sp-champ]{animation:o-sp-derive 120s ease-in-out infinite alternate}',
  '@media (prefers-reduced-motion:reduce){[data-o-sp-etoile],[data-o-sp-champ]{animation:none}}',
].join('')

/** Pose la feuille du ciel une seule fois, quelle que soit la page. */
function useFeuilleSpatiale(): void {
  useEffect(() => {
    if (document.getElementById(STYLE_SPATIAL) !== null) return
    const feuille = document.createElement('style')
    feuille.id = STYLE_SPATIAL
    feuille.textContent = CSS_SPATIAL
    document.head.append(feuille)
  }, [])
}

/** Une suite de nombres stable : semer un ciel sans hasard entre deux rendus. */
function graines(nombre: number, germe: number): readonly number[] {
  const suite: number[] = []
  let valeur = germe
  for (let rang = 0; rang < nombre; rang += 1) {
    valeur = (valeur * 1103515245 + 12345) % 2147483648
    suite.push(valeur / 2147483648)
  }
  return suite
}

/**
 * Le ciel de l ouverture : un degrade de nuit et deux cents etoiles.
 *
 * C est ce qui remplace les anneaux orbitaux. Rien ici ne demande de contexte
 * graphique : la seule surface de la page est reservee a l engin lui-meme.
 *
 * ## Pourquoi le ciel est pose **par-dessus** le canevas
 *
 * Le moteur ouvre ses contextes en `alpha: false` : un canevas de scene est
 * opaque, et tout ce qu on glisse dessous disparait. Le ciel passe donc
 * au-dessus, et son degrade est compose en `screen` — il eclaire sans jamais
 * couvrir. L engin garde ses hautes lumieres, et les etoiles se voient.
 */
function Ciel({ etoiles = 200 }: { readonly etoiles?: number }): ReactElement {
  useFeuilleSpatiale()
  const semis = useMemo(() => graines(etoiles * 4, etoiles * 13 + 7), [etoiles])
  return (
    <div
      aria-hidden="true"
      className="o-absolute o-inset-0 o-z-0 o-overflow-hidden o-pointer-events-none"
      // Le `screen` est porte par l enveloppe, et non par le degrade : un
      // enfant melange ne se compose qu avec le fond de **sa** pile, et cette
      // pile-ci est vide. Pose ici, il se compose avec le canevas de l engin.
      style={{ mixBlendMode: 'screen' }}
    >
      <div
        className="o-absolute o-inset-0"
        style={{
          background: [
            `radial-gradient(58% 44% at 74% 22%, ${accentDoux(500, 18)}, transparent 66%)`,
            `radial-gradient(84% 62% at 8% 96%, ${accentDoux(700, 30)}, transparent 72%)`,
            'linear-gradient(180deg, var(--o-palette-slate-950) 0%, var(--o-palette-slate-900) 46%, var(--o-palette-slate-950) 100%)',
          ].join(', '),
        }}
      />
      <div data-o-sp-champ="" className="o-absolute" style={{ inset: '-4%' }}>
        {Array.from({ length: etoiles }, (_, rang) => {
          const x = semis[rang * 4] ?? 0
          const y = semis[rang * 4 + 1] ?? 0
          const gros = semis[rang * 4 + 2] ?? 0
          const tempo = semis[rang * 4 + 3] ?? 0
          const taille = gros > 0.93 ? 3.4 : gros > 0.7 ? 2.2 : 1.5
          return (
            <span
              key={rang}
              data-o-sp-etoile=""
              className="o-absolute o-block o-rounded-full o-bg-white"
              style={
                {
                  left: `${(x * 100).toFixed(2)}%`,
                  top: `${(y * 100).toFixed(2)}%`,
                  width: taille,
                  height: taille,
                  boxShadow:
                    gros > 0.93 ? '0 0 6px 1px rgba(255,255,255,0.55)' : undefined,
                  '--o-sp-bas': (0.28 + gros * 0.24).toFixed(2),
                  '--o-sp-haut': (0.7 + gros * 0.3).toFixed(2),
                  '--o-sp-duree': `${(3 + tempo * 7).toFixed(1)}s`,
                  '--o-sp-delai': `${(-tempo * 9).toFixed(1)}s`,
                } as CSSProperties
              }
            />
          )
        })}
      </div>
    </div>
  )
}

/* ============================ L engin, et son dessin ==================== */

/**
 * L elevation cotee de Vireo : le repli de l engin en volume.
 *
 * Un satellite se lit a son envergure et a ce qui pend sous le plancher. Le
 * dessin donne les deux, avec les cotes qu un dossier de mission porterait :
 * envergure panneaux deployes, hauteur hors tuyere, diametre de l antenne.
 * C est la meme machine que la scene, vue de face.
 */
function ElevationCotee(): ReactElement {
  const trait = encreSurSombre()
  const cote = 'var(--o-palette-slate-300)'
  const cellules = Array.from({ length: 5 }, (_, rang) => 20 + rang * 21)
  return (
    <svg
      viewBox="0 0 460 300"
      className="o-h-auto o-w-full"
      role="img"
      aria-label="Elevation cotee du satellite Vireo : envergure 6,40 metres, hauteur 2,15 metres, antenne de 0,90 metre"
    >
      <g
        fill="none"
        stroke={trait}
        strokeWidth="1.2"
        strokeLinejoin="round"
        strokeLinecap="round"
      >
        {/* Les deux panneaux, montes sur leurs bras. */}
        <rect x="46" y="104" width="118" height="60" />
        <rect x="296" y="104" width="118" height="60" />
        {cellules.map((decalage) => (
          <path
            key={`g${String(decalage)}`}
            d={`M${String(46 + decalage)} 104V164`}
            opacity="0.5"
          />
        ))}
        {cellules.map((decalage) => (
          <path
            key={`d${String(decalage)}`}
            d={`M${String(296 + decalage)} 104V164`}
            opacity="0.5"
          />
        ))}
        <path d="M46 134h118M296 134h118" opacity="0.5" />
        <path d="M164 134h42M254 134h42" />

        {/* Le corps prismatique, ses six pans vus de face. */}
        <path d="M206 92h48v84h-48Z" />
        <path d="M218 92v84M242 92v84" opacity="0.6" />

        {/* L antenne, vue de face : un disque et son cornet sur trois bras. */}
        <circle cx="230" cy="118" r="34" />
        <circle cx="230" cy="118" r="20" opacity="0.5" />
        <path d="M230 118 206 96M230 118 254 96M230 118 230 148" opacity="0.5" />
        <circle cx="230" cy="118" r="4" />

        {/* La tuyere, sous le plancher, et la perche d antenne au-dessus. */}
        <path d="M218 176h24l10 26h-44Z" />
        <path d="M242 92 258 62" />
        <path d="M254 68h8" />
      </g>

      {/* Les cotes. */}
      <g stroke={cote} strokeWidth="0.9" fill="none" opacity="0.9">
        <path d="M46 236h368" />
        <path d="M42 230 50 242M410 230 418 242" />
        <path d="M46 172v68M414 172v68" strokeDasharray="3 4" opacity="0.45" />
        <path d="M436 62v140" />
        <path d="M430 58 442 66M430 198 442 206" />
        <path d="M258 62h182" strokeDasharray="3 4" opacity="0.45" />
        <path d="M254 202h182" strokeDasharray="3 4" opacity="0.45" />
        <path d="M196 40h68" />
        <path d="M192 34 200 46M260 34 268 46" />
        <path d="M196 40v46M264 40v46" strokeDasharray="3 4" opacity="0.45" />
      </g>
      <g
        fill={cote}
        fontFamily="ui-monospace, monospace"
        fontSize="11"
        letterSpacing="0.08em"
      >
        <text x="230" y="258" textAnchor="middle">
          6,40 m — envergure deployee
        </text>
        <text x="230" y="276" textAnchor="middle" opacity="0.75">
          Vireo, plateforme d observation — elevation, echelle 1:20
        </text>
        <text x="230" y="30" textAnchor="middle">
          0,90 m
        </text>
        <text x="424" y="136" textAnchor="end" transform="rotate(-90 424 136)">
          2,15 m
        </text>
      </g>
    </svg>
  )
}

/* ============================ Le rendu ============================ */

/** La couleur d un voyant, selon l etat. */
function couleurEtat(etat: Etat, sombre: boolean): string {
  if (etat === 'Nominal') return sombre ? encreSurSombre() : encre()
  return 'var(--o-theme-muted)'
}

/**
 * Le schema d orbite du satellite lu.
 *
 * Deux ellipses grises disent les plans de reference, la troisieme porte
 * l inclinaison du satellite choisi. Un dessin et non une scene : l ouverture
 * a deja pris la seule surface WebGL de la page.
 */
function Trace({
  inclinaison,
  altitude,
  sombre = true,
}: {
  readonly inclinaison: number
  readonly altitude: number
  readonly sombre?: boolean
}): ReactElement {
  const trait = sombre ? encreSurSombre() : encre()
  return (
    <div aria-hidden="true" className="o-relative o-aspect-square o-w-full o-max-w-xs">
      <div
        className="o-absolute o-rounded-full"
        style={{
          inset: '33%',
          backgroundColor: 'color-mix(in oklab, var(--o-theme-fg) 10%, transparent)',
        }}
      />
      <div
        className="o-absolute o-rounded-full"
        style={{ inset: '33%', border: '1px solid var(--o-theme-line)' }}
      />
      {[16, -38].map((tour) => (
        <div
          key={tour}
          className="o-absolute o-inset-0 o-rounded-full"
          style={{
            border: '1px solid var(--o-theme-line)',
            transform: `rotate(${String(tour)}deg) scaleX(0.4)`,
          }}
        />
      ))}
      <div
        className="o-absolute o-inset-0 o-rounded-full"
        style={{
          border: `1px solid ${trait}`,
          transform: `rotate(${String(inclinaison - 90)}deg) scaleX(0.4)`,
        }}
      />
      <div
        className="o-absolute o-left-1/2 o-top-0 o-size-2 o-rounded-full"
        style={{
          backgroundColor: trait,
          transform: `translate(-50%, -50%) rotate(${String(inclinaison - 90)}deg) translateY(${String(altitude / 14)}px)`,
        }}
      />
    </div>
  )
}

/** Une jauge de la telemetrie. */
function Jauge({
  quoi,
  part,
}: {
  readonly quoi: string
  readonly part: number
}): ReactElement {
  return (
    <div>
      <div className="o-flex o-items-baseline o-justify-between o-gap-3">
        <span className="o-font-mono o-text-xs o-uppercase o-tracking-wider o-text-slate-400">
          {quoi}
        </span>
        <span
          className="o-font-mono o-text-sm o-tabular-nums"
          style={{ color: encreSurSombre() }}
        >
          {part} %
        </span>
      </div>
      <div
        aria-hidden="true"
        className="o-mt-2 o-h-1.5 o-w-full o-overflow-hidden o-rounded-full"
        style={{ backgroundColor: 'var(--o-theme-line)' }}
      >
        <div
          className="o-h-full o-rounded-full"
          style={{ width: `${String(part)}%`, backgroundColor: encreSurSombre() }}
        />
      </div>
    </div>
  )
}

/** Un compteur du compte a rebours : le nombre roule, le mot reste. */
function Compteur({
  valeur,
  quoi,
}: {
  readonly valeur: number
  readonly quoi: string
}): ReactElement {
  return (
    <div className="o-border-l o-border-slate-200 dark:o-border-slate-800 o-pl-5 md:o-pl-8">
      <p
        className="o-m-0 o-font-mono o-tabular-nums o-text-slate-950 dark:o-text-slate-50"
        style={{
          fontSize: 'clamp(3rem, 9vw, 9rem)',
          lineHeight: 1,
          fontWeight: 300,
          letterSpacing: '-0.04em',
        }}
      >
        <CounterRoll value={valeur} locale="fr-FR" duration={700} step={60} />
      </p>
      <p className="o-m-0 o-mt-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-500 dark:o-text-slate-400">
        {quoi}
      </p>
    </div>
  )
}

/** Le compte a rebours jusqu au prochain lancement, a la seconde. */
function CompteARebours(): ReactElement {
  const [reste, setReste] = useState(() => Math.max(0, PROCHAIN.getTime() - Date.now()))
  useEffect(() => {
    const tic = (): void => {
      setReste(Math.max(0, PROCHAIN.getTime() - Date.now()))
    }
    const id = window.setInterval(tic, 1000)
    return () => {
      window.clearInterval(id)
    }
  }, [])
  const secondes = Math.floor(reste / 1000)
  const jours = Math.floor(secondes / 86400)
  const heures = Math.floor((secondes % 86400) / 3600)
  const minutes = Math.floor((secondes % 3600) / 60)
  const s = secondes % 60
  return (
    <div
      className="o-grid o-grid-cols-2 o-gap-y-10 lg:o-grid-cols-4"
      role="timer"
      aria-label={`Prochain lancement dans ${String(jours)} jours, ${String(heures)} heures, ${String(minutes)} minutes`}
    >
      <Compteur valeur={jours} quoi="jours" />
      <Compteur valeur={heures} quoi="heures" />
      <Compteur valeur={minutes} quoi="minutes" />
      <Compteur valeur={s} quoi="secondes" />
    </div>
  )
}

/** La vitrine complete. */
export default function Page(): ReactElement {
  const polices = usePolices('onest')
  const [choisi, setChoisi] = useState<string>('APH-11')
  const [mission, setMission] = useState<Mission | 'Toutes'>('Toutes')

  const nominaux = CONSTELLATION.filter((s) => s.etat === 'Nominal').length
  const lignes = useMemo(
    () => CONSTELLATION.filter((s) => mission === 'Toutes' || s.mission === mission),
    [mission],
  )
  const sat: Sat = useMemo(
    () => CONSTELLATION.find((s) => s.nom === choisi) ?? SAT_ZERO,
    [choisi],
  )

  // L engin : monte une fois. C est la seule surface graphique de la page —
  // les anneaux orbitaux qui tenaient ce role sont partis au CSS.
  const engin = useMemo(
    () => (
      <Volume
        nom="satellite Vireo"
        className="o-pointer-events-none o-absolute o-inset-0 o-z-0"
        repli={
          <div className="o-flex o-h-full o-items-end o-justify-center o-px-6 o-pb-16 o-opacity-70 md:o-items-center md:o-justify-end md:o-pb-0 md:o-pr-10">
            <div className="o-w-full o-max-w-xl">
              <ElevationCotee />
            </div>
          </div>
        }
        construire={(contexte) => {
          const { scene, camera, three } = contexte
          const alliage = teinte('--o-vitrine-200', '#c8d8ef')
          const cellule = teinte('--o-vitrine-900', '#14203a')
          const cuivre = teinte('--o-vitrine-500', '#3f7fd0')

          const matieres = [
            new three.MeshStandardMaterial({
              color: alliage,
              metalness: 0.92,
              roughness: 0.3,
              flatShading: true,
            }),
            new three.MeshStandardMaterial({
              color: cellule,
              metalness: 0.55,
              roughness: 0.22,
            }),
            new three.MeshStandardMaterial({
              color: alliage,
              metalness: 0.35,
              roughness: 0.5,
              side: three.DoubleSide,
            }),
            new three.MeshStandardMaterial({
              color: cuivre,
              metalness: 1,
              roughness: 0.42,
            }),
            new three.LineBasicMaterial({
              color: 0xffffff,
              transparent: true,
              opacity: 0.34,
            }),
          ] as const
          const [mAlliage, mCellule, mAntenne, mTuyere, mFil] = matieres

          // Le corps : un prisme a six pans, le plus courant des bus. Ses
          // aretes sont reprises en fil clair, sans quoi un metal mat se lit
          // comme une masse et non comme une machine.
          const gCorps = new three.CylinderGeometry(0.58, 0.58, 1.5, 6, 1)
          const gAretes = new three.EdgesGeometry(gCorps)
          const gBras = new three.CylinderGeometry(0.045, 0.045, 0.62, 8)
          const gPanneau = new three.BoxGeometry(1.72, 0.035, 0.96)
          const gPlan = new three.PlaneGeometry(1.72, 0.96, 8, 4)
          const gGrille = new three.WireframeGeometry(gPlan)
          const gAntenne = new three.SphereGeometry(
            0.6,
            28,
            14,
            0,
            Math.PI * 2,
            0,
            Math.PI / 3.2,
          )
          const gPerche = new three.CylinderGeometry(0.032, 0.032, 0.56, 8)
          const gCornet = new three.ConeGeometry(0.07, 0.2, 12)
          const gTuyere = new three.CylinderGeometry(0.09, 0.3, 0.52, 18, 1, true)
          const gCol = new three.CylinderGeometry(0.13, 0.095, 0.2, 12)
          const gMat = new three.CylinderGeometry(0.022, 0.022, 0.7, 6)
          const geometries = [
            gCorps,
            gAretes,
            gBras,
            gPanneau,
            gPlan,
            gGrille,
            gAntenne,
            gPerche,
            gCornet,
            gTuyere,
            gCol,
            gMat,
          ]

          // Le porteur tient l assiette de la maquette ; l engin tourne dedans,
          // pour que le lacet reste un vrai lacet et non un roulis oblique.
          const porteur = new three.Group()
          // Un demi-radian de plongee : sans elle on regarde les panneaux par
          // la tranche, et deux ailes de trois metres se lisent comme deux
          // aiguilles. On les voit d au-dessus, comme sur une photo de vol.
          porteur.rotation.set(0.42, 0, 0.12)
          const vireo = new three.Group()
          vireo.name = 'engin'
          porteur.add(vireo)

          vireo.add(
            new three.Mesh(gCorps, mAlliage),
            new three.LineSegments(gAretes, mFil),
          )

          // Les deux panneaux et leurs bras, sur l axe de la commande
          // d orientation. Le groupe tourne autour de X : les panneaux sont
          // centres sur cet axe, ils pivotent donc sur eux-memes.
          const panneaux = new three.Group()
          panneaux.name = 'panneaux'
          for (const sens of [-1, 1]) {
            const bras = new three.Mesh(gBras, mAlliage)
            bras.position.set(sens * 0.88, 0, 0)
            bras.rotation.z = Math.PI / 2
            const aile = new three.Mesh(gPanneau, mCellule)
            aile.position.set(sens * 2.02, 0, 0)
            const grille = new three.LineSegments(gGrille, mFil)
            grille.position.set(sens * 2.02, 0.026, 0)
            grille.rotation.x = -Math.PI / 2
            panneaux.add(bras, aile, grille)
          }
          vireo.add(panneaux)

          // L antenne parabolique, sur sa perche, ouverte vers l avant : la
          // face concave est eclairee, donc la matiere est a deux faces.
          const perche = new three.Mesh(gPerche, mAlliage)
          perche.position.set(0, 0.4, 0.6)
          perche.rotation.x = Math.PI / 2
          const parabole = new three.Mesh(gAntenne, mAntenne)
          parabole.position.set(0, 0.46, 1)
          parabole.rotation.x = -Math.PI / 2 + 0.26
          // Le cornet est au foyer, et il y tient par une tige : sans elle il
          // flotte devant la parabole comme une piece detachee.
          const tige = new three.Mesh(gPerche, mAlliage)
          tige.position.set(0, 0.48, 1.14)
          tige.rotation.x = Math.PI / 2
          tige.scale.set(0.5, 0.5, 0.5)
          const cornet = new three.Mesh(gCornet, mAlliage)
          cornet.position.set(0, 0.49, 1.28)
          cornet.rotation.x = -Math.PI / 2
          const mat = new three.Mesh(gMat, mAlliage)
          mat.position.set(0.3, 1.06, -0.12)
          mat.rotation.z = 0.28
          vireo.add(perche, parabole, tige, cornet, mat)

          // La tuyere, sous le plancher : un tronc de cone ouvert, et son col.
          const col = new three.Mesh(gCol, mAlliage)
          col.position.set(0, -0.82, 0)
          const tuyere = new three.Mesh(gTuyere, mTuyere)
          tuyere.position.set(0, -1.14, 0)
          vireo.add(col, tuyere)

          // A droite du titre sur un ecran large ; centre et plus petit quand
          // la colonne de texte prend toute la largeur.
          const large = window.innerWidth >= 900
          const axe = large ? 1 : 0
          // Sur un ecran etroit la colonne de texte prend toute la largeur :
          // l engin descend sous les boutons plutot que de passer derriere le
          // titre, et se fait plus petit.
          porteur.position.set(large ? 2.05 : 0, large ? -0.05 : -1.5, 0)
          porteur.scale.setScalar(large ? 0.56 : 0.4)
          scene.add(porteur)

          eclairer(contexte, {
            cle: 0xfff1dc,
            remplissage: 0x5f80c4,
            contour: 0xbcd6ff,
            force: 1.25,
          })
          const dessous = new three.PointLight(0x8fb6ff, 22, 14, 2)
          dessous.position.set(axe + 0.6, -1.8, 1.8)
          const rasante = new three.PointLight(0xffffff, 16, 14, 2)
          rasante.position.set(axe + 2.6, 0.9, 1.4)
          scene.add(dessous, rasante)

          camera.position.set(axe, 0.05, 5.6)
          camera.lookAt(axe, 0.05, 0)

          return () => {
            for (const g of geometries) g.dispose()
            for (const m of matieres) m.dispose()
          }
        }}
        animer={({ scene }, { delta, time }) => {
          const vireo = scene.getObjectByName('engin')
          if (vireo === undefined) return
          // Un tour en trente-sept secondes, et un lent tangage : un engin en
          // orbite n est jamais tout a fait immobile devant l oeil.
          vireo.rotation.y += delta * 0.17
          vireo.rotation.x = Math.sin(time * 0.28) * 0.05
          vireo.position.y = Math.sin(time * 0.42) * 0.04

          const panneaux = vireo.getObjectByName('panneaux')
          if (panneaux === undefined) return
          // La commande d orientation solaire, calculee et non simulee : elle
          // cherche l angle qui met la normale des panneaux face a la lumiere
          // cle de l eclairage, laquelle est en (2,5 / 3,5 / 2,5).
          const lacet = vireo.rotation.y
          panneaux.rotation.x = Math.atan2(
            Math.sin(lacet) * 0.47 + Math.cos(lacet) * 0.47,
            0.66,
          )
        }}
      />
    ),
    [],
  )

  return (
    <Porte forme="compteur" marque="Aphelie">
      <div
        className="o-bg-white dark:o-bg-slate-950 o-text-slate-900 dark:o-text-slate-100"
        style={polices}
      >
        {/* ================= L ouverture : l engin, le titre a sa gauche ===== */}
        <header
          className="o-relative o-isolate o-min-h-screen o-overflow-hidden"
          style={nuit('slate')}
        >
          {engin}
          <Ciel />
          <Voile sens="gauche" famille="slate" />
          <Grain />

          <BarreGelule
            marque="Aphelie"
            liens={[
              ['#sequence', 'Le lancement'],
              ['#constellation', 'La constellation'],
              ['#prochain', 'Prochain vol'],
            ]}
            action={['#constellation', 'Voir ce qui vole']}
          />

          <div className="o-relative o-z-10 o-mx-auto o-flex o-min-h-screen o-max-w-6xl o-flex-col o-justify-center o-px-6 o-pb-28 o-pt-32">
            <div className="o-max-w-2xl">
              <Surgit>
                <Etiquette>
                  Douze satellites — {nominaux} sur {CONSTELLATION.length} nominaux
                </Etiquette>
              </Surgit>
              <TitreVague
                delai={120}
                className="o-m-0 o-mt-7 o-text-slate-50"
                style={{
                  ...affiche('l', 300),
                  fontSize: 'clamp(2.5rem, 5.6vw, 5.75rem)',
                }}
              >
                Un point du globe, toutes les quatre heures.
              </TitreVague>
              <Surgit
                delai={420}
                as="p"
                className="o-m-0 o-mt-7 o-max-w-lg o-text-lg o-leading-relaxed o-text-slate-300"
              >
                Optique a trente centimetres, radar bande X, infrarouge thermique. La
                revisite annoncee est celle mesuree.
              </Surgit>
              <Surgit delai={540} className="o-mt-9">
                <Actions
                  pleine={[
                    '#constellation',
                    <>
                      Voir la constellation{' '}
                      <Icon icon={ArrowRight} size={16} aria-hidden="true" />
                    </>,
                  ]}
                  fantome={['#sequence', 'Le dernier lancement']}
                />
              </Surgit>
              <Surgit
                delai={660}
                as="p"
                className="o-m-0 o-mt-12 o-max-w-xs o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-slate-400"
              >
                Plateforme Vireo, 410 kg — envergure 6,40 m panneaux deployes
              </Surgit>
            </div>
          </div>
          <Coin position="hg">Toulouse — Kiruna — Kourou — Hobart</Coin>
          <Coin position="hd">
            Releve 09.09.2026
            <br />
            12 h 40 UTC
          </Coin>
          <Coin position="bg">Vireo-4 en orbite depuis le 12.02.2026</Coin>
          <Coin position="bd">
            Prochain vol : Vireo-5
            <br />
            14.11.2026 — 09 h 20 UTC
          </Coin>
        </header>

        <main>
          {/* ================= (01) La sequence de lancement, epinglee : quatre actes ===== */}
          <section
            id="sequence"
            aria-label="La sequence de lancement de Vireo-4"
            className="o-scroll-mt-24"
          >
            <Epingle ecrans={4} actes={ACTES.length}>
              {(acte, progression) => {
                const courant: Acte = ACTES[acte] ?? ACTE_ZERO
                return (
                  <div
                    className="o-relative o-flex o-h-full o-flex-col o-overflow-hidden"
                    style={nuit('slate')}
                  >
                    {/* La ligne de progression, en haut de la scene. */}
                    <div
                      aria-hidden="true"
                      className="o-absolute o-inset-x-0 o-top-0 o-h-px o-bg-white-10"
                    >
                      <div
                        className="o-h-full"
                        style={{
                          width: `${String(Math.round(progression * 100))}%`,
                          backgroundColor: encreSurSombre(),
                          transition: 'width 600ms cubic-bezier(0.2, 0, 0, 1)',
                        }}
                      />
                    </div>

                    <div className="o-mx-auto o-grid o-w-full o-max-w-6xl o-grow o-items-center o-gap-10 o-px-6 o-py-10 md:o-grid-cols-12">
                      <div className="o-min-w-0 md:o-col-span-6">
                        <Indice rang="01">La sequence de lancement</Indice>
                        <p
                          className="o-m-0 o-mt-6 o-text-slate-50"
                          style={{
                            ...affiche('xl', 300),
                            fontSize: 'clamp(3rem, 9vw, 8rem)',
                          }}
                        >
                          <DepthText
                            depth={10}
                            step={2}
                            angle={12}
                            speed={8000}
                            couleur={accent(700)}
                          >
                            Vireo-4
                          </DepthText>
                        </p>
                        <div key={courant.id} className="o-mt-8">
                          <p
                            className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                            style={{ color: encreSurSombre() }}
                          >
                            {courant.etape}
                          </p>
                          <h2
                            className="o-m-0 o-mt-3 o-text-slate-50"
                            style={{
                              ...affiche('m', 300),
                              fontSize: 'clamp(1.75rem, 3.4vw, 3.25rem)',
                            }}
                          >
                            {courant.titre}
                          </h2>
                          <p className="o-m-0 o-mt-4 o-max-w-md o-text-base o-leading-relaxed o-text-slate-300">
                            {courant.texte}
                          </p>
                        </div>
                        <p className="o-m-0 o-mt-8 o-flex o-items-baseline o-gap-3 o-font-mono o-text-slate-50">
                          <span className="o-text-xs o-uppercase o-tracking-widest o-text-slate-400">
                            Minutes apres l allumage
                          </span>
                          <span className="o-text-3xl o-tabular-nums md:o-text-4xl">
                            <CounterRoll
                              value={courant.minutes}
                              locale="fr-FR"
                              duration={800}
                              step={70}
                            />
                          </span>
                        </p>
                      </div>

                      <div className="o-relative o-min-w-0 md:o-col-span-6">
                        {courant.graine === undefined ? (
                          <div className="o-flex o-items-center o-justify-center">
                            <Trace inclinaison={97.4} altitude={505} />
                          </div>
                        ) : (
                          <figure key={courant.id} className="o-m-0">
                            <img
                              src={photo(courant.graine, 1200, 800)}
                              alt={courant.alt ?? ''}
                              className="o-h-auto o-w-full o-rounded-2xl o-object-cover"
                              style={{ aspectRatio: '4 / 3' }}
                            />
                            <figcaption className="o-mt-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-400">
                              {courant.alt}
                            </figcaption>
                          </figure>
                        )}
                      </div>
                    </div>

                    {/* Les quatre etapes, en rail, au bas de la scene. */}
                    <div
                      className="o-mx-auto o-w-full o-max-w-6xl o-px-6 o-pb-8"
                      style={
                        { '--o-palette-brand-500': encreSurSombre() } as CSSProperties
                      }
                    >
                      <Stepper
                        label="Etapes du lancement"
                        value={acte}
                        reach="none"
                        steps={ACTES.map((a) => ({
                          id: a.id,
                          label: a.etape,
                          hint: a.titre,
                        }))}
                      />
                    </div>
                  </div>
                )
              }}
            </Epingle>
          </section>

          {/* ================= (02) La constellation, en table, sous le reticule ===== */}
          <section
            id="constellation"
            aria-labelledby="constellation-titre"
            className="o-scroll-mt-24 o-mx-auto o-max-w-6xl o-px-6 o-py-24 md:o-py-32"
          >
            <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
              <div className="md:o-col-span-8">
                <Indice rang="02" sombre={false}>
                  La constellation — releve du 9 septembre, 12 h 40 UTC
                </Indice>
                <h2
                  id="constellation-titre"
                  className="o-m-0 o-mt-6 o-text-slate-950 dark:o-text-slate-50"
                  style={{ ...affiche('l', 300), fontSize: 'clamp(2.5rem, 6vw, 5.5rem)' }}
                >
                  Ce qui vole, et dans quel etat.
                </h2>
              </div>
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-slate-500 dark:o-text-slate-400 md:o-col-span-4 md:o-text-right">
                Le degrade et celui en maintenance
                <br />y figurent, avec leur cause
              </p>
            </div>

            <div className="o-mt-12 o-grid o-gap-10 lg:o-grid-cols-12">
              <div className="o-min-w-0 lg:o-col-span-8">
                <div
                  role="group"
                  aria-label="Filtrer par mission"
                  className="o-flex o-flex-wrap o-items-center o-gap-2 o-border-b o-border-slate-900 dark:o-border-slate-100 o-pb-3"
                >
                  {(['Toutes', ...MISSIONS] as const).map((option) => {
                    const actif = mission === option
                    return (
                      <button
                        key={option}
                        type="button"
                        aria-pressed={actif}
                        onClick={() => {
                          setMission(option)
                        }}
                        className={`o-rounded-full o-px-3 o-py-1 o-font-mono o-text-xs o-uppercase o-tracking-widest o-transition-colors focus:o-ring ${actif ? '' : 'o-text-slate-600 dark:o-text-slate-400 hover:o-text-slate-950 dark:hover:o-text-slate-50'}`}
                        style={actif ? aplat() : undefined}
                      >
                        {option}
                      </button>
                    )
                  })}
                </div>

                <Crosshair
                  coords
                  speed={14}
                  gap={20}
                  color={encre()}
                  className="o-relative"
                >
                  <div className="o-overflow-x-auto">
                    <table className="o-w-full o-min-w-full o-text-left o-font-mono o-text-xs">
                      <caption className="o-sr-only">
                        La constellation Aphelie : huit satellites, leur mission, leur
                        etat et leur orbite
                      </caption>
                      <thead>
                        <tr className="o-border-b o-border-slate-200 dark:o-border-slate-800 o-text-slate-500 dark:o-text-slate-400">
                          {[
                            'Engin',
                            'Mission',
                            'Etat',
                            'Alt. km',
                            'Incl.',
                            'Resolution',
                            'Lance',
                            'Prochain passage',
                          ].map((entete, index) => (
                            <th
                              key={entete}
                              scope="col"
                              className={`o-py-3 o-pr-4 o-font-normal o-uppercase o-tracking-widest ${index === 3 || index === 4 ? 'o-text-right' : ''}`}
                            >
                              {entete}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {lignes.map((s) => {
                          const actif = s.nom === sat.nom
                          return (
                            <tr
                              key={s.nom}
                              className="o-border-b o-border-slate-200 dark:o-border-slate-800"
                              style={
                                actif
                                  ? { backgroundColor: accentDoux(500, 14) }
                                  : undefined
                              }
                            >
                              <th scope="row" className="o-py-3 o-pr-4 o-font-normal">
                                <button
                                  type="button"
                                  aria-pressed={actif}
                                  onClick={() => {
                                    setChoisi(s.nom)
                                  }}
                                  className="o-flex o-items-center o-gap-2 o-font-mono o-text-sm o-font-semibold o-text-slate-950 dark:o-text-slate-50 focus:o-ring"
                                >
                                  <span
                                    aria-hidden="true"
                                    className="o-inline-block o-size-2 o-shrink-0 o-rounded-full"
                                    style={{
                                      backgroundColor: couleurEtat(s.etat, false),
                                    }}
                                  />
                                  {s.nom}
                                </button>
                              </th>
                              <td className="o-py-3 o-pr-4 o-text-slate-700 dark:o-text-slate-300">
                                {s.mission}
                              </td>
                              <td
                                className="o-py-3 o-pr-4 o-uppercase o-tracking-wider"
                                style={{ color: couleurEtat(s.etat, false) }}
                              >
                                {s.etat}
                              </td>
                              <td className="o-py-3 o-pr-4 o-text-right o-tabular-nums o-text-slate-700 dark:o-text-slate-300">
                                {s.altitude}
                              </td>
                              <td className="o-py-3 o-pr-4 o-text-right o-tabular-nums o-text-slate-700 dark:o-text-slate-300">
                                {s.inclinaison.toLocaleString('fr-FR')}°
                              </td>
                              <td className="o-py-3 o-pr-4 o-whitespace-nowrap o-text-slate-700 dark:o-text-slate-300">
                                {s.resolution}
                              </td>
                              <td className="o-py-3 o-pr-4 o-whitespace-nowrap o-text-slate-700 dark:o-text-slate-300">
                                {s.lance}
                              </td>
                              <td className="o-py-3 o-whitespace-nowrap o-text-slate-700 dark:o-text-slate-300">
                                {s.fenetre}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </Crosshair>
                <p className="o-mt-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-500 dark:o-text-slate-400">
                  {lignes.length} engins sur {CONSTELLATION.length} — {nominaux} nominaux,
                  1 degrade, 1 en maintenance
                </p>
              </div>

              {/* Le panneau de telemetrie, colle a droite : il suit la ligne choisie. */}
              <div className="lg:o-col-span-4">
                <div
                  className="o-rounded-2xl o-p-6 lg:o-sticky"
                  style={{ ...nuit('slate'), top: 132 }}
                >
                  <div className="o-flex o-flex-wrap o-items-center o-gap-x-4 o-gap-y-2 o-font-mono o-text-xs">
                    <span className="o-font-bold o-text-slate-50">TELEMETRIE</span>
                    <span
                      className="o-flex o-items-center o-gap-1.5"
                      style={{ color: encreSurSombre() }}
                    >
                      <Icon icon={Activity} size={12} aria-hidden="true" />
                      en direct
                    </span>
                    {sat.etat !== 'Nominal' && (
                      <span className="o-ml-auto o-flex o-items-center o-gap-1.5 o-text-slate-300">
                        <Icon icon={TriangleAlert} size={12} aria-hidden="true" />
                        {sat.etat}
                      </span>
                    )}
                  </div>
                  <div className="o-mt-4 o-flex o-items-center o-justify-center">
                    <Trace inclinaison={sat.inclinaison} altitude={sat.altitude} />
                  </div>
                  <h3 className="o-m-0 o-mt-2 o-font-mono o-text-3xl o-font-bold o-tracking-tight o-text-slate-50">
                    {sat.nom}
                  </h3>
                  <p
                    className="o-m-0 o-mt-1 o-font-mono o-text-xs o-tabular-nums"
                    style={{ color: encreSurSombre() }}
                  >
                    i = {sat.inclinaison.toLocaleString('fr-FR')} deg — h = {sat.altitude}{' '}
                    km
                  </p>
                  <p className="o-m-0 o-mt-4 o-text-sm o-leading-relaxed o-text-slate-300">
                    {sat.note}
                  </p>
                  <div className="o-mt-5 o-flex o-flex-col o-gap-3 o-border-t o-border-slate-800 o-pt-4">
                    <Jauge quoi="Charge batterie" part={sat.batterie} />
                    <Jauge quoi="Memoire occupee" part={sat.stockage} />
                  </div>
                  <ul className="o-m-0 o-mt-5 o-list-none o-border-t o-border-slate-800 o-p-0 o-pt-4">
                    <li className="o-py-1 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-400">
                      Passages a venir — UTC
                    </li>
                    {PASSAGES.map(([heure, engin, station, quoi]) => (
                      <li
                        key={`${heure}-${engin}`}
                        className="o-flex o-flex-wrap o-items-baseline o-gap-x-3 o-py-1 o-font-mono o-text-xs"
                      >
                        <span
                          className="o-tabular-nums o-font-semibold"
                          style={{
                            color:
                              engin === sat.nom
                                ? encreSurSombre()
                                : 'var(--o-palette-slate-50)',
                          }}
                        >
                          {heure}
                        </span>
                        <span
                          className={
                            engin === sat.nom ? 'o-text-slate-50' : 'o-text-slate-400'
                          }
                        >
                          {engin}
                        </span>
                        <span className="o-text-slate-400">{station}</span>
                        <span className="o-w-full o-text-slate-400 xl:o-w-auto">
                          {quoi}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* ================= (03) Le prochain lancement, en compte a rebours ===== */}
          <section
            id="prochain"
            aria-labelledby="prochain-titre"
            className="o-scroll-mt-24 o-border-t o-border-slate-200 dark:o-border-slate-800 o-px-6 o-py-24 md:o-py-36"
          >
            <div className="o-mx-auto o-max-w-6xl">
              <Reveal>
                <Indice rang="03" sombre={false}>
                  Prochain lancement
                </Indice>
                <h2
                  id="prochain-titre"
                  className="o-m-0 o-mt-6 o-font-mono o-text-sm o-uppercase o-tracking-widest o-text-slate-950 dark:o-text-slate-50"
                >
                  Vireo-5 — Kourou, ELV-4 — 14 novembre 2026, 09 h 20 UTC
                </h2>
              </Reveal>
              <Reveal delay={120} className="o-mt-14">
                <CompteARebours />
              </Reveal>
              <Reveal delay={200} className="o-mt-14">
                <a
                  href="#constellation"
                  className="o-inline-flex o-items-center o-gap-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-no-underline focus:o-ring"
                  style={{ color: encre() }}
                >
                  Recevoir l heure exacte de la fenetre{' '}
                  <Icon icon={ArrowUpRight} size={14} aria-hidden="true" />
                </a>
              </Reveal>
            </div>
          </section>
        </main>

        {/* ================= Le pied : une fiche technique, un tableau a filets ===== */}
        <footer className="o-border-t o-border-slate-900 dark:o-border-slate-100 o-px-6 o-pb-8 o-pt-10">
          <div className="o-mx-auto o-max-w-6xl">
            <table
              className="o-w-full o-text-left o-text-sm"
              style={{ borderCollapse: 'collapse' }}
            >
              <caption className="o-pb-4 o-text-left o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-500 dark:o-text-slate-400">
                Aphelie — fiche d identite, edition du 9 septembre 2026
              </caption>
              <tbody>
                {FICHE.map(([quoi, valeurs]) => (
                  <tr
                    key={quoi}
                    className="o-border-t o-border-slate-200 dark:o-border-slate-800"
                  >
                    <th
                      scope="row"
                      className="o-w-40 o-py-3 o-pr-6 o-align-top o-font-mono o-text-xs o-font-normal o-uppercase o-tracking-widest o-text-slate-500 dark:o-text-slate-400 md:o-w-56"
                    >
                      {quoi}
                    </th>
                    <td className="o-py-3">
                      <ul className="o-m-0 o-flex o-list-none o-flex-wrap o-gap-x-8 o-gap-y-1 o-p-0">
                        {valeurs.map((v) => (
                          <li key={v}>
                            {quoi === 'Documents' || quoi === 'Contact' ? (
                              <a
                                href="#constellation"
                                className="o-no-underline o-text-slate-800 dark:o-text-slate-200 hover:o-text-slate-950 dark:hover:o-text-slate-50 focus:o-ring"
                              >
                                {v} ↗
                              </a>
                            ) : (
                              <span className="o-text-slate-800 dark:o-text-slate-200">
                                {v}
                              </span>
                            )}
                          </li>
                        ))}
                      </ul>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <p className="o-m-0 o-mt-6 o-border-t o-border-slate-900 dark:o-border-slate-100 o-pt-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-500 dark:o-text-slate-400">
              © 2026 Aphelie — les acquisitions a 30 cm demandent, sur certaines zones,
              une autorisation prealable obtenue en huit a vingt jours ouvres.
            </p>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
