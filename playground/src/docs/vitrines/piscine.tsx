/**
 * Bassin Nord — piscine municipale.
 *
 * ## La reference : Altitude (GetLayers)
 *
 * L eau tient l ouverture, et rien d autre : une surface qui bouge, un titre
 * pose dessus, quatre mots en mono aux coins. Le corps, lui, est clair et
 * tenu — une piscine municipale n est pas un spa, et la page doit d abord
 * repondre a une question de service public : **est-ce que je peux nager
 * maintenant, et dans quelle ligne**.
 *
 * ## Le mecanisme : les lignes d eau
 *
 * Six lignes, treize creneaux, soixante-dix-huit valeurs relevees sur un mois
 * de comptages a l entree. La carte de chaleur les montre toutes ; le curseur
 * choisit une heure ; les trois allures filtrent les lignes qui vous vont. La
 * page conclut elle-meme — le meilleur creneau de la semaine pour l allure
 * demandee est **calcule**, pas ecrit d avance.
 *
 * ## Pourquoi une seule photographie
 *
 * Le batiment de 1928 est le seul argument que le dessin ne sait pas porter :
 * les voutes, la faience, les colonnes dans l eau. Elle est donc la, une fois,
 * en hauteur, et elle deborde sur la section suivante. Tout le reste — la
 * coupe du bassin, la carte de chaleur, l horloge du pied — est trace.
 *
 * ## Le mouvement
 *
 * M-parallaxe **lent** : glisse 0,82, vitesse basse. Rien ne doit donner
 * l impression de courir dans une piscine.
 *
 * @module
 */

import { useMotionState } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import { ArrowDown, ArrowUpRight } from '@odoro-cli/icons/filaire'
import { Reveal } from '@odoro-cli/libs/motion'
import { useEffect, useMemo, useState, type ReactElement } from 'react'

import { WaterSurface } from '@/odoro/background/WaterSurface.jsx'
import { ScrollRevealImage } from '@/odoro/image/ScrollRevealImage.jsx'
import { WaveText } from '@/odoro/text/WaveText.jsx'
import { ElasticSlider } from '@/odoro/ui/ElasticSlider.jsx'

import { nuit, Voile } from './communs.jsx'
import {
  affiche,
  BarreGelule,
  CHROME,
  Coin,
  Etiquette,
  Grain,
  Indice,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
  verre,
} from './marche.jsx'
import { photo } from './media.js'
import { accent, accentDoux, encre, encreSurSombre } from './palettes.js'
import { Parallaxe } from './scene.jsx'

/* ============================ Les lignes d eau ========================= */

/** Une ligne du bassin, avec ce qu on y fait. */
interface LigneEau {
  readonly numero: number
  readonly allure: 'rapide' | 'moyen' | 'tranquille'
  readonly nom: string
  readonly note: string
  /** Nageurs au-dela desquels la ligne est saturee. */
  readonly capacite: number
}

const LIGNES: readonly LigneEau[] = [
  {
    numero: 1,
    allure: 'rapide',
    nom: 'Ligne rapide',
    note: 'Crawl, virages culbute, depassement autorise au milieu.',
    capacite: 6,
  },
  {
    numero: 2,
    allure: 'rapide',
    nom: 'Ligne rapide',
    note: 'La meme, mais c est celle du club le soir.',
    capacite: 6,
  },
  {
    numero: 3,
    allure: 'moyen',
    nom: 'Ligne moyenne',
    note: 'Le tout-venant. C est la que tombent les trois quarts des gens.',
    capacite: 8,
  },
  {
    numero: 4,
    allure: 'moyen',
    nom: 'Ligne moyenne',
    note: 'Idem, cote fenetres. Un peu plus fraiche le matin.',
    capacite: 8,
  },
  {
    numero: 5,
    allure: 'tranquille',
    nom: 'Ligne calme',
    note: 'Brasse, dos, palmes interdites. On ne double pas.',
    capacite: 8,
  },
  {
    numero: 6,
    allure: 'tranquille',
    nom: 'Ligne reservee',
    note: 'Cours, aquagym, scolaires. Libre entre les creneaux.',
    capacite: 10,
  },
]

/** Les creneaux d une journee ordinaire, en heures pleines. */
const CRENEAUX: readonly number[] = [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19]

/**
 * Les comptages, ligne par ligne et creneau par creneau.
 *
 * Moyenne d un mois de comptages a l entree, arrondie au nageur. Les deux
 * bosses sont vraies et connues de tous les maitres nageurs : sept heures et
 * dix-huit heures.
 */
const AFFLUENCE: readonly (readonly number[])[] = [
  [6, 5, 2, 1, 1, 4, 3, 1, 2, 3, 5, 6, 4],
  [5, 4, 2, 1, 1, 3, 2, 1, 1, 2, 4, 6, 6],
  [8, 7, 4, 3, 3, 7, 6, 3, 4, 6, 8, 8, 7],
  [7, 6, 3, 2, 2, 6, 5, 2, 3, 5, 7, 8, 6],
  [4, 5, 6, 5, 4, 3, 3, 5, 6, 7, 6, 5, 3],
  [0, 0, 9, 10, 8, 0, 0, 9, 10, 10, 2, 0, 0],
]

/** L allure demandee, et ce qu elle veut dire a haute voix. */
const ALLURES = [
  { id: 'rapide', mot: 'Je fais des longueurs' },
  { id: 'moyen', mot: 'Je nage sans compter' },
  { id: 'tranquille', mot: 'Je viens me detendre' },
] as const

/* ============================ Les cours ================================ */

/** Un cours de la semaine, pose sur la frise de la journee. */
interface Cours {
  readonly nom: string
  readonly debut: number
  readonly fin: number
  readonly public: string
  readonly places: number
}

const COURS: readonly Cours[] = [
  {
    nom: 'Bebes nageurs',
    debut: 9,
    fin: 10,
    public: '6 mois a 3 ans, avec un parent',
    places: 3,
  },
  {
    nom: 'Apprentissage enfants',
    debut: 10,
    fin: 11.5,
    public: '5 a 10 ans, trois niveaux',
    places: 0,
  },
  {
    nom: 'Aquagym',
    debut: 12,
    fin: 12.75,
    public: 'Tous ages, dans le petit bain',
    places: 7,
  },
  {
    nom: 'Perfectionnement crawl',
    debut: 14,
    fin: 15.5,
    public: 'Sait nager 200 m sans arret',
    places: 4,
  },
  {
    nom: 'Aquaphobie',
    debut: 16,
    fin: 17,
    public: 'Adultes, huit personnes au plus',
    places: 2,
  },
  {
    nom: 'Entrainement club',
    debut: 19,
    fin: 21,
    public: 'Licencies du Cercle Nord',
    places: 0,
  },
]

/** Une heure ecrite court : « 12 h 45 ». */
function heure(valeur: number): string {
  const h = Math.floor(valeur)
  const m = Math.round((valeur - h) * 60)
  return m === 0 ? `${String(h)} h` : `${String(h)} h ${String(m)}`
}

/* ============================ La feuille =============================== */

const STYLE_PISCINE = 'o-vitrine-piscine'

/**
 * Ce que les utilitaires n ont pas : une ondulation lente sur la coupe du
 * bassin, et l aiguille des secondes de l horloge du pied.
 */
const CSS_PISCINE = [
  '@keyframes o-pi-onde{0%{transform:translate3d(0,0,0)}100%{transform:translate3d(-120px,0,0)}}',
  '@keyframes o-pi-trace{0%{stroke-dashoffset:var(--o-pi-l,600)}100%{stroke-dashoffset:0}}',
  '@keyframes o-pi-seconde{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}',
  '[data-o-pi-onde]{animation:o-pi-onde var(--o-pi-duree,18s) linear infinite}',
  '[data-o-pi-trace]{animation:o-pi-trace 1.8s ease-out var(--o-pi-delai,0s) both}',
  '[data-o-pi-seconde]{animation:o-pi-seconde 60s steps(60) infinite}',
  '@media (prefers-reduced-motion:reduce){',
  '[data-o-pi-onde],[data-o-pi-seconde]{animation:none}',
  '[data-o-pi-trace]{animation:none;stroke-dashoffset:0}}',
].join('')

function useFeuillePiscine(): void {
  useEffect(() => {
    if (document.getElementById(STYLE_PISCINE) !== null) return
    const feuille = document.createElement('style')
    feuille.id = STYLE_PISCINE
    feuille.textContent = CSS_PISCINE
    document.head.append(feuille)
  }, [])
}

/* ============================ La coupe du bassin ======================= */

/**
 * La coupe du bassin, au trait.
 *
 * Vingt-cinq metres, une pente de 1,10 a 3,50, et les six lignes vues de
 * bout. C est la seule facon de dire d un coup ou l on a pied.
 */
function Coupe(): ReactElement {
  return (
    <svg
      viewBox="0 0 1080 300"
      className="o-h-auto o-w-full"
      role="img"
      aria-label="Coupe du bassin : vingt-cinq metres, de 1,10 m au petit bain a 3,50 m au plongeoir"
    >
      {/* Le creux du bassin. */}
      <path
        d="M60 60 L60 148 L520 148 L1020 250 L1020 60"
        fill={accentDoux(400, 26)}
        stroke="none"
      />
      <path
        d="M60 60 L60 148 L520 148 L1020 250 L1020 60"
        fill="none"
        stroke={accent(500)}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <defs>
        <clipPath id="o-pi-bassin">
          <rect x="60" y="40" width="960" height="40" />
        </clipPath>
      </defs>
      {/* La surface de l eau, et son ondulation. */}
      <g clipPath="url(#o-pi-bassin)">
        <path
          data-o-pi-onde=""
          d="M-60 62 q 30 -7 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0 t 60 0"
          fill="none"
          stroke={accent(300)}
          strokeWidth="3"
        />
      </g>

      {/* Les cotes. */}
      <path
        d="M110 62 V148"
        stroke={accentDoux(800, 46)}
        strokeWidth="1"
        strokeDasharray="3 5"
      />
      <text
        x="120"
        y="112"
        fontSize="19"
        fill="currentColor"
        style={{ fontFamily: 'var(--o-font-mono)', color: 'var(--o-theme-fg)' }}
      >
        1,10 m
      </text>
      <path
        d="M960 62 V244"
        stroke={accentDoux(800, 46)}
        strokeWidth="1"
        strokeDasharray="3 5"
      />
      <text
        x="950"
        y="160"
        fontSize="19"
        textAnchor="end"
        fill="currentColor"
        style={{ fontFamily: 'var(--o-font-mono)', color: 'var(--o-theme-fg)' }}
      >
        3,50 m
      </text>

      {/* Les six lignes, vues de bout : les flotteurs sur la surface. */}
      {[170, 300, 430, 560, 690, 820].map((x, rang) => (
        <g key={x}>
          <circle cx={x} cy={62} r="7" fill={accent(500)} />
          <text
            x={x}
            y={40}
            fontSize="17"
            textAnchor="middle"
            fill="currentColor"
            style={{ fontFamily: 'var(--o-font-mono)', color: 'var(--o-theme-muted)' }}
          >
            {String(rang + 1)}
          </text>
        </g>
      ))}

      <text
        x="60"
        y="286"
        fontSize="17"
        fill="currentColor"
        style={{
          fontFamily: 'var(--o-font-mono)',
          letterSpacing: '0.12em',
          color: 'var(--o-theme-muted)',
        }}
      >
        PETIT BAIN
      </text>
      <text
        x="1020"
        y="286"
        fontSize="17"
        textAnchor="end"
        fill="currentColor"
        style={{
          fontFamily: 'var(--o-font-mono)',
          letterSpacing: '0.12em',
          color: 'var(--o-theme-muted)',
        }}
      >
        GRAND BAIN — 25 M
      </text>
    </svg>
  )
}

/* ============================ Le mecanisme ============================= */

/**
 * La carte de chaleur des lignes d eau.
 *
 * Le fond d une case ne depasse jamais la moitie de l accent : au-dela,
 * l encre du theme ne tient plus dessus en sombre. C est la contrainte qui a
 * decide de l echelle, et non l inverse.
 */
function Lignes(): ReactElement {
  const [heureChoisie, setHeureChoisie] = useState(12)
  const [allure, setAllure] = useState<'rapide' | 'moyen' | 'tranquille'>('moyen')

  const colonne = Math.max(0, CRENEAUX.indexOf(heureChoisie))

  /** Le meilleur creneau pour l allure demandee : calcule, pas ecrit. */
  const conseil = useMemo(() => {
    let mieux: { ligne: LigneEau; index: number; part: number } | null = null
    for (const [rang, ligne] of LIGNES.entries()) {
      if (ligne.allure !== allure) continue
      const releve = AFFLUENCE[rang] ?? []
      for (const [index, nageurs] of releve.entries()) {
        // Une ligne vide est une ligne fermee, pas une ligne libre.
        if (nageurs === 0) continue
        const part = nageurs / ligne.capacite
        if (mieux === null || part < mieux.part) mieux = { ligne, index, part }
      }
    }
    return mieux
  }, [allure])

  const presentes = LIGNES.filter((l) => l.allure === allure).map((l) => l.numero)

  return (
    <div>
      {/* ------- Les commandes ------- */}
      <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
        <div className="md:o-col-span-5">
          <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
            Ce que vous venez faire
          </p>
          <div className="o-mt-4 o-flex o-flex-wrap o-gap-2">
            {ALLURES.map((choix) => {
              const actif = choix.id === allure
              return (
                <button
                  key={choix.id}
                  type="button"
                  aria-pressed={actif}
                  onClick={() => {
                    setAllure(choix.id)
                  }}
                  className={`o-rounded-full o-border-w-1 o-px-4 o-py-2 o-text-sm o-transition-colors focus:o-ring ${
                    actif
                      ? ''
                      : 'o-border-black-20 dark:o-border-zinc-700 hover:o-bg-black-10 dark:hover:o-bg-zinc-900'
                  }`}
                  style={
                    actif
                      ? {
                          backgroundColor: encre(),
                          color: 'var(--o-theme-bg)',
                          borderColor: encre(),
                        }
                      : undefined
                  }
                >
                  {choix.mot}
                </button>
              )
            })}
          </div>
        </div>
        <div className="md:o-col-span-7">
          <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
            Heure regardee — {heure(heureChoisie)}
          </p>
          <div className="o-mt-4">
            <ElasticSlider
              label="Heure de la journee"
              min={7}
              max={19}
              step={1}
              value={heureChoisie}
              onChange={(valeur) => {
                setHeureChoisie(valeur)
              }}
              showValue={false}
            />
          </div>
        </div>
      </div>

      {/* ------- La carte de chaleur ------- */}
      <div className="o-mt-12 o-overflow-x-auto" style={{ overflowY: 'hidden' }}>
        <table
          className="o-text-left"
          style={{ minWidth: 720, width: '100%', borderCollapse: 'collapse' }}
        >
          <caption className="o-sr-only">
            Nageurs par ligne d eau et par creneau, moyenne d un mois de comptages
          </caption>
          <thead>
            <tr>
              <th
                scope="col"
                className="o-py-2 o-pr-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-font-normal o-text-zinc-500 dark:o-text-zinc-400"
              >
                Ligne
              </th>
              {CRENEAUX.map((creneau, index) => (
                <th
                  key={creneau}
                  scope="col"
                  className="o-px-1 o-py-2 o-text-center o-font-mono o-text-xs o-font-normal o-tabular-nums"
                  style={{ color: index === colonne ? encre() : 'var(--o-theme-muted)' }}
                >
                  {creneau}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {LIGNES.map((ligne, rang) => {
              const releve = AFFLUENCE[rang] ?? []
              const retenue = presentes.includes(ligne.numero)
              return (
                <tr key={ligne.numero} style={{ opacity: retenue ? 1 : 0.4 }}>
                  <th
                    scope="row"
                    className="o-whitespace-nowrap o-py-1 o-pr-4 o-text-sm o-font-normal"
                  >
                    <span
                      className="o-font-mono o-tabular-nums"
                      style={{ color: retenue ? encre() : 'var(--o-theme-muted)' }}
                    >
                      {String(ligne.numero)}
                    </span>
                    <span className="o-ml-3 o-text-zinc-600 dark:o-text-zinc-400">
                      {ligne.nom}
                    </span>
                  </th>
                  {releve.map((nageurs, index) => {
                    const part = Math.min(1, nageurs / ligne.capacite)
                    const fermee = nageurs === 0
                    return (
                      <td
                        key={CRENEAUX[index] ?? index}
                        className="o-px-1 o-py-1 o-text-center o-font-mono o-text-xs o-tabular-nums"
                        style={{
                          backgroundColor: fermee
                            ? 'var(--o-theme-surface)'
                            : accentDoux(500, Math.round(part * 50)),
                          color: 'var(--o-theme-fg)',
                          outline: index === colonne ? `2px solid ${encre()}` : undefined,
                          outlineOffset: -2,
                        }}
                      >
                        {fermee ? '—' : String(nageurs)}
                      </td>
                    )
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
      <p className="o-m-0 o-mt-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
        Nageurs comptes a l entree · moyenne de septembre · un tiret vaut ligne fermee
      </p>

      {/* ------- Ce que la page en conclut ------- */}
      <div className="o-mt-12 o-grid o-gap-8 md:o-grid-cols-12">
        <div className="md:o-col-span-7">
          <div className="o-rounded-2xl o-p-7" style={nuit('slate')}>
            <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
              Le creneau que nous vous donnerions
            </p>
            <p
              className="o-m-0 o-mt-4 o-text-zinc-50"
              aria-live="polite"
              style={{
                ...affiche('m', 300),
                fontSize: 'clamp(1.5rem, 3.4vw, 2.5rem)',
                lineHeight: 1.02,
              }}
            >
              {conseil === null
                ? 'Aucune ligne ouverte pour cette allure.'
                : `Ligne ${String(conseil.ligne.numero)}, a ${heure(CRENEAUX[conseil.index] ?? 0)}`}
            </p>
            {conseil !== null && (
              <p className="o-m-0 o-mt-4 o-max-w-md o-text-sm o-leading-relaxed o-text-zinc-300">
                {conseil.ligne.note} A cette heure-la elle tourne a{' '}
                {String(Math.round(conseil.part * 100))} pour cent de sa capacite, soit le
                creux de la semaine pour cette allure.
              </p>
            )}
          </div>
        </div>
        <div className="md:o-col-span-5">
          <dl className="o-m-0">
            {[
              [
                'A cette heure',
                `${String(AFFLUENCE.reduce((somme, releve) => somme + (releve[colonne] ?? 0), 0))} nageurs dans le bassin`,
              ],
              [
                'Lignes ouvertes',
                `${String(AFFLUENCE.filter((releve) => (releve[colonne] ?? 0) > 0).length)} sur 6`,
              ],
              ['Temperature de l eau', '28,2 °C — relevee a 7 h'],
            ].map(([quoi, valeur]) => (
              <div
                key={quoi}
                className="o-border-t o-border-black-10 dark:o-border-zinc-800 o-py-4"
              >
                <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                  {quoi}
                </dt>
                <dd className="o-m-0 o-mt-2 o-text-lg o-text-zinc-950 dark:o-text-zinc-50">
                  {valeur}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  )
}

/* ============================ L horloge du pied ======================== */

/** L horloge murale du hall : une seule, et c est tout le pied. */
function Horloge(): ReactElement {
  const { reduced } = useMotionState()
  const [angles, setAngles] = useState({ h: 0, m: 0 })

  useEffect(() => {
    const poser = (): void => {
      const maintenant = new Date()
      setAngles({
        h: ((maintenant.getHours() % 12) + maintenant.getMinutes() / 60) * 30,
        m: maintenant.getMinutes() * 6,
      })
    }
    poser()
    const id = window.setInterval(poser, 20_000)
    return () => {
      window.clearInterval(id)
    }
  }, [])

  return (
    <svg
      viewBox="0 0 200 200"
      className="o-h-auto o-w-full"
      style={{ maxWidth: 240 }}
      role="img"
      aria-label="Horloge du hall"
    >
      <circle
        cx="100"
        cy="100"
        r="94"
        fill="none"
        stroke={accentDoux(700, 30)}
        strokeWidth="2"
      />
      {Array.from({ length: 12 }, (_, rang) => {
        const angle = (rang * 30 * Math.PI) / 180
        const interieur = rang % 3 === 0 ? 74 : 82
        return (
          <path
            key={rang}
            d={`M${String(100 + Math.sin(angle) * interieur)} ${String(100 - Math.cos(angle) * interieur)}L${String(100 + Math.sin(angle) * 88)} ${String(100 - Math.cos(angle) * 88)}`}
            stroke={rang % 3 === 0 ? accent(500) : accentDoux(700, 40)}
            strokeWidth={rang % 3 === 0 ? 4 : 2}
            strokeLinecap="round"
          />
        )
      })}
      <path
        d="M100 100V46"
        stroke="var(--o-theme-fg)"
        strokeWidth="6"
        strokeLinecap="round"
        style={{
          transformOrigin: '100px 100px',
          transform: `rotate(${String(angles.h)}deg)`,
        }}
      />
      <path
        d="M100 100V26"
        stroke="var(--o-theme-fg)"
        strokeWidth="4"
        strokeLinecap="round"
        style={{
          transformOrigin: '100px 100px',
          transform: `rotate(${String(angles.m)}deg)`,
        }}
      />
      {!reduced && (
        <path
          data-o-pi-seconde=""
          d="M100 108V24"
          stroke={accent(500)}
          strokeWidth="2"
          strokeLinecap="round"
          style={{ transformOrigin: '100px 100px' }}
        />
      )}
      <circle cx="100" cy="100" r="6" fill="var(--o-theme-fg)" />
    </svg>
  )
}

/* ============================ La page ================================== */

const NAVIGATION = [
  ['#bassin', 'Le bassin'],
  ['#lignes', 'Les lignes'],
  ['#cours', 'Les cours'],
] as const

export default function Page(): ReactElement {
  const polices = usePolices('manrope')
  useFeuillePiscine()
  const [cours, setCours] = useState(COURS[2]?.nom ?? '')
  const retenu = COURS.find((c) => c.nom === cours) ?? COURS[2]

  const debutFrise = 8.5
  const finFrise = 21.5

  return (
    <Porte forme="zoom" marque="Bassin Nord">
      <div
        className="o-bg-zinc-50 dark:o-bg-zinc-950 o-text-zinc-900 dark:o-text-zinc-50"
        style={polices}
      >
        {/* ================= L ouverture : l eau ========================== */}
        <header
          className="o-relative o-isolate o-flex o-flex-col o-justify-between o-overflow-hidden o-px-6 o-pb-14 o-pt-32 md:o-px-10"
          style={{ ...nuit('slate'), minHeight: `calc(100vh - ${String(CHROME)}px)` }}
        >
          <WaterSurface
            aria-hidden="true"
            className="o-absolute o-inset-0 o-z-0"
            amplitude={0.09}
            wavelength={1.9}
            choppiness={0.45}
            speed={0.55}
            sun={0.85}
            parallax={0.08}
            colors={['--o-palette-slate-950', '--o-vitrine-600', '--o-vitrine-200']}
            poster="o-bg-slate-950"
          />
          <Voile sens="haut-bas" famille="slate" />
          <Grain opacite={0.05} />

          <BarreGelule
            marque="Bassin Nord"
            liens={NAVIGATION}
            action={['#cours', 'S inscrire']}
          />

          <div className="o-relative o-z-20">
            <Surgit>
              <Etiquette>Piscine municipale — quartier nord — depuis 1928</Etiquette>
            </Surgit>
            <TitreVague
              delai={140}
              className="o-m-0 o-mt-8 o-max-w-4xl o-text-zinc-50"
              style={{ ...affiche('l', 300), fontSize: 'clamp(2.75rem, 9vw, 9rem)' }}
            >
              Bassin Nord
            </TitreVague>
          </div>

          <div className="o-relative o-z-20 o-flex o-flex-wrap o-items-end o-justify-between o-gap-8">
            <Surgit
              delai={520}
              as="p"
              className="o-m-0 o-max-w-md o-text-base o-leading-relaxed o-text-zinc-200"
            >
              Vingt-cinq metres, six lignes, vingt-huit degres. Cette page ne vous vend
              rien : elle vous dit a quelle heure la ligne qui vous convient est vide.
            </Surgit>
            <Surgit delai={640}>
              <a
                href="#lignes"
                className="o-inline-flex o-items-center o-gap-3 o-rounded-full o-border-w-1 o-border-white-20 o-bg-white-10 o-px-6 o-py-3 o-text-sm o-font-semibold o-text-white o-no-underline o-backdrop-blur-md o-transition-colors hover:o-bg-white-20 focus:o-ring"
              >
                Voir les lignes d eau
                <Icon icon={ArrowDown} size={16} aria-hidden="true" />
              </a>
            </Surgit>
          </div>

          <Coin position="bg">
            12 rue des Bains — halle nord
            <br />
            Tramway 2, arret Piscine
          </Coin>
          <Coin position="bd">
            Eau a 28,2 °C
            <br />
            Bassin ouvert 6 h 45 — 21 h 30
          </Coin>
        </header>

        {/* ================= Le batiment : une seule photographie ========= */}
        <section
          id="bassin"
          className="o-relative o-scroll-mt-24 o-px-6 o-pt-24 md:o-px-10 md:o-pt-32"
        >
          <div className="o-mx-auto o-grid o-max-w-6xl o-gap-10 md:o-grid-cols-12 md:o-gap-14">
            <div className="md:o-col-span-5">
              <Reveal>
                <Indice rang="01" sombre={false}>
                  Le batiment
                </Indice>
              </Reveal>
              <Reveal delay={80}>
                <h2
                  className="o-m-0 o-mt-6 o-text-zinc-950 dark:o-text-zinc-50"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.85rem, 4vw, 3.25rem)',
                    lineHeight: 0.96,
                  }}
                >
                  Une nef de brique, et de l eau dedans.
                </h2>
              </Reveal>
              <p className="o-m-0 o-mt-6 o-max-w-md o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                Construite en 1928 sur le modele des bains-douches municipaux, la halle a
                garde ses voutes, sa faience et ses quatre colonnes de granit — qui
                traversent le bassin et qu il faut apprendre a contourner.
              </p>
              <p className="o-m-0 o-mt-4 o-max-w-md o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                Le chauffage est passe au bois en 2019 ; c est ce qui permet de tenir
                vingt-huit degres sans facturer une entree au prix d un cinema.
              </p>
              <dl className="o-m-0 o-mt-10">
                {[
                  ['Mise en eau', '14 juin 1928'],
                  ['Classement', 'Inscrit a l inventaire, 2004'],
                  ['Entree', '3,40 EUR — 1,70 EUR pour la ville'],
                ].map(([quoi, valeur]) => (
                  <div
                    key={quoi}
                    className="o-flex o-items-baseline o-justify-between o-gap-4 o-border-t o-border-black-10 dark:o-border-zinc-800 o-py-3"
                  >
                    <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                      {quoi}
                    </dt>
                    <dd className="o-m-0 o-font-mono o-text-sm o-text-zinc-950 dark:o-text-zinc-50">
                      {valeur}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            {/*
              La photographie deborde de deux cent quarante pixels sur la
              section suivante : c est le seul endroit de la page ou quelque
              chose sort de son cadre, et il fallait que ce soit celui-la.
            */}
            <div className="md:o-col-span-7">
              <Parallaxe
                vitesse={0.14}
                glisse={0.82}
                className="o-relative o-z-10"
                style={{ marginBottom: -140 }}
              >
                <figure className="o-m-0">
                  <ScrollRevealImage
                    src={photo('cadre-archive-piscine', 1000, 1500)}
                    alt="La halle de la piscine : voutes de brique, faience claire et quatre colonnes de granit plantees dans le bassin"
                    ratio={0.72}
                    direction="up"
                    span={0.5}
                  />
                  <figcaption className="o-mt-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                    La halle, vue de la galerie haute — les quatre colonnes sont dans l
                    eau
                  </figcaption>
                </figure>
              </Parallaxe>
            </div>
          </div>
        </section>

        {/* ================= La coupe du bassin =========================== */}
        <section
          aria-labelledby="coupe-titre"
          className="o-px-6 o-pb-24 o-pt-40 md:o-px-10 md:o-pb-32 md:o-pt-48"
        >
          <div className="o-mx-auto o-max-w-6xl">
            <h2
              id="coupe-titre"
              className="o-m-0 o-max-w-xl o-text-zinc-950 dark:o-text-zinc-50"
              style={{
                ...affiche('m', 300),
                fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
                lineHeight: 1,
              }}
            >
              Ou l on a pied, et ou l on n en a plus.
            </h2>
            <div className="o-mt-12">
              <Coupe />
            </div>
          </div>
        </section>

        {/* ================= Les lignes d eau : le mecanisme ============== */}
        <section
          id="lignes"
          className="o-scroll-mt-24 o-border-t o-border-black-10 dark:o-border-zinc-800 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
        >
          <div className="o-mx-auto o-max-w-6xl">
            <Reveal>
              <Indice rang="02" sombre={false}>
                Les lignes d eau
              </Indice>
            </Reveal>
            <Reveal delay={80}>
              <h2
                className="o-m-0 o-mt-6 o-max-w-3xl o-text-zinc-950 dark:o-text-zinc-50"
                style={{
                  ...affiche('m', 300),
                  fontSize: 'clamp(1.85rem, 4.2vw, 3.5rem)',
                  lineHeight: 0.96,
                }}
              >
                <WaveText amplitude={5} speed={2600}>
                  Six lignes, treize heures
                </WaveText>
                <br />
                et personne qui vous double.
              </h2>
            </Reveal>
            <p className="o-m-0 o-mt-6 o-max-w-xl o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
              Dites-nous ce que vous venez faire et a quelle heure vous pouvez venir : la
              carte ci-dessous est un mois de comptages, et elle repond a votre place.
            </p>
            <div className="o-mt-14">
              <Lignes />
            </div>
          </div>
        </section>

        {/* ================= Les cours : la frise de la journee (A23) ===== */}
        <section
          id="cours"
          className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
          style={nuit('slate')}
        >
          <div className="o-mx-auto o-max-w-6xl">
            <Reveal>
              <Indice rang="03">Les cours</Indice>
            </Reveal>
            <Reveal delay={80}>
              <h2
                className="o-m-0 o-mt-6 o-max-w-2xl o-text-zinc-50"
                style={{
                  ...affiche('m', 300),
                  fontSize: 'clamp(1.85rem, 4vw, 3.25rem)',
                  lineHeight: 0.96,
                }}
              >
                Prenez votre place sur la ligne 6.
              </h2>
            </Reveal>

            {/*
              La frise : une seule echelle horaire pour tous les cours. Le nom
              tient dans une colonne a part — dans la barre, il se faisait
              couper des que la seance durait moins d une heure.
            */}
            <div className="o-mt-14 o-overflow-x-auto" style={{ overflowY: 'hidden' }}>
              <div style={{ minWidth: 700 }}>
                <div className="o-flex o-border-b o-border-white-10 o-pb-2">
                  <span className="o-shrink-0" style={{ width: 220 }} />
                  <span className="o-flex o-grow o-justify-between o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                    {[9, 11, 13, 15, 17, 19, 21].map((h) => (
                      <span key={h}>{h} h</span>
                    ))}
                  </span>
                </div>
                <ul className="o-m-0 o-list-none o-p-0">
                  {COURS.map((seance) => {
                    const choisi = seance.nom === cours
                    const libre = seance.places > 0
                    const gauche =
                      ((seance.debut - debutFrise) / (finFrise - debutFrise)) * 100
                    const large =
                      ((seance.fin - seance.debut) / (finFrise - debutFrise)) * 100
                    return (
                      <li
                        key={seance.nom}
                        className="o-flex o-items-center o-border-b o-border-white-10"
                        style={{ height: 58 }}
                      >
                        <span
                          className="o-shrink-0 o-truncate o-pr-4 o-text-sm"
                          style={{
                            width: 220,
                            color: libre
                              ? 'var(--o-palette-slate-100)'
                              : 'var(--o-palette-slate-400)',
                          }}
                        >
                          {seance.nom}
                        </span>
                        <span
                          className="o-relative o-block o-grow"
                          style={{ height: 34 }}
                        >
                          <button
                            type="button"
                            disabled={!libre}
                            aria-pressed={choisi}
                            onClick={() => {
                              setCours(seance.nom)
                            }}
                            className="o-absolute o-inset-y-0 o-flex o-items-center o-justify-between o-gap-2 o-whitespace-nowrap o-rounded-full o-px-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-transition-colors focus:o-ring"
                            style={{
                              left: `${String(gauche.toFixed(2))}%`,
                              width: `${String(large.toFixed(2))}%`,
                              minWidth: 118,
                              border: 0,
                              cursor: libre ? 'pointer' : 'not-allowed',
                              backgroundColor: choisi
                                ? encreSurSombre()
                                : libre
                                  ? 'var(--o-palette-slate-800)'
                                  : 'color-mix(in oklab, var(--o-palette-slate-100) 9%, var(--o-palette-slate-950))',
                              color: choisi
                                ? 'var(--o-palette-slate-950)'
                                : libre
                                  ? 'var(--o-palette-slate-100)'
                                  : 'var(--o-palette-slate-400)',
                            }}
                          >
                            <span className="o-sr-only">{seance.nom} — </span>
                            <span>{heure(seance.debut)}</span>
                            <span>
                              {libre ? `${String(seance.places)} pl.` : 'complet'}
                            </span>
                          </button>
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>

            <div className="o-mt-10 o-grid o-gap-8 md:o-grid-cols-12">
              <div className="md:o-col-span-7">
                <div className={`${verre(true)} o-p-6`}>
                  <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                    Seance retenue
                  </p>
                  <p
                    className="o-m-0 o-mt-3 o-text-zinc-50"
                    aria-live="polite"
                    style={{
                      ...affiche('m', 300),
                      fontSize: 'clamp(1.35rem, 2.8vw, 2rem)',
                      lineHeight: 1.04,
                    }}
                  >
                    {retenu?.nom ?? ''} — {heure(retenu?.debut ?? 0)} a{' '}
                    {heure(retenu?.fin ?? 0)}
                  </p>
                  <p className="o-m-0 o-mt-4 o-text-sm o-leading-relaxed o-text-zinc-300">
                    {retenu?.public ?? ''}. Inscription au trimestre, reglable en trois
                    fois, et remboursee au prorata si la halle ferme.
                  </p>
                </div>
              </div>
              <div className="md:o-col-span-5 md:o-flex md:o-items-end md:o-justify-end">
                <a
                  href="#cours"
                  className="o-inline-flex o-items-center o-gap-2 o-rounded-full o-px-7 o-py-4 o-text-sm o-font-semibold o-no-underline o-transition-transform hover:o-scale-105 focus:o-ring"
                  style={{
                    backgroundColor: encreSurSombre(),
                    color: 'var(--o-palette-slate-950)',
                  }}
                >
                  S inscrire a cette seance{' '}
                  <Icon icon={ArrowUpRight} size={15} aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ================= Le pied : une horloge et une adresse (P19) === */}
        <footer className="o-px-6 o-py-20 md:o-px-10 md:o-py-28">
          <div className="o-mx-auto o-flex o-max-w-3xl o-flex-col o-items-center o-gap-10 o-text-center sm:o-flex-row sm:o-text-left">
            <div className="o-shrink-0">
              <Horloge />
            </div>
            <div>
              <p
                className="o-m-0 o-text-zinc-950 dark:o-text-zinc-50"
                style={{
                  ...affiche('m', 300),
                  fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
                  lineHeight: 1.08,
                }}
              >
                12 rue des Bains
                <br />
                Halle nord
              </p>
              <p className="o-m-0 o-mt-6 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                Bassin ouvert de 6 h 45 a 21 h 30 — ferme le lundi matin
                <br />
                Bassin Nord — regie municipale — © 2026
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
