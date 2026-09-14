/**
 * Obturateur — fabricant d appareils photographiques.
 *
 * ## La reference : Kimi
 *
 * Encre presque blanche sur un noir de zinc, tout en capitales, un seul
 * accent reserve a l instrumentation, **aucun arrondi** : les plaques sont
 * marquees par quatre equerres, le curseur devient un reticule sur la zone de
 * reglage, et la grille du fond n est pas un decor mais un repere.
 *
 * ## Ce que la page fait : le triangle
 *
 * Le mecanisme est le **triangle d exposition**, et il est calcule, pas
 * illustre :
 *
 * - l indice de lumination vaut `IL = log2(N² / t) - log2(S / 100)` ; la page
 *   le maintient constant, si bien que **bouger un reglage deplace un autre** ;
 * - la **profondeur de champ** vient de l hyperfocale
 *   `H = f² / (N c) + f`, avec un objectif de 50 mm et un cercle de confusion
 *   de 0,03 mm, mise au point a douze metres ;
 * - le **file du sujet** est le deplacement de son image sur le capteur
 *   pendant la pose : un coureur a 14 km/h a douze metres inscrit
 *   `v t f / s` millimetres de trainee, et au-dela de trente microns le
 *   cliche est flou.
 *
 * L image dessinee sous les molettes **obeit a ces trois nombres** : le fond
 * se defocalise quand le diaphragme s ouvre, le coureur file quand la pose
 * s allonge, le grain monte avec la sensibilite.
 *
 * ## Les formes
 *
 * A26 : un devis en trois curseurs, le total en 120 px. P45 : un pied a
 * cadran, l heure de la maison. C28 : trois cadrans gradues a aiguille.
 *
 * ## Le poids
 *
 * F-statique : une grille et rien d autre. Le diaphragme, les molettes, les
 * cadrans, la scene et l horloge sont dessines au trait. Une page d optique
 * n a pas besoin d un moteur de rendu.
 *
 * @module
 */

import { useMotionState } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import { ArrowDown, ArrowUpRight } from '@odoro-cli/icons/filaire'
import { Reveal } from '@odoro-cli/libs/motion'
import {
  useEffect,
  useId,
  useMemo,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

import { TargetCursor } from '@/odoro/effect/TargetCursor.jsx'
import { GridLines } from '@/odoro/background/GridLines.jsx'
import { MorphText } from '@/odoro/text/MorphText.jsx'
import { ElasticSlider } from '@/odoro/ui/ElasticSlider.jsx'

import { nuit } from './communs.jsx'
import { accent, accentDoux, aplat, encreSurSombre } from './palettes.js'
import {
  affiche,
  BarreCoins,
  CHROME,
  Coin,
  Etiquette,
  Grain,
  Indice,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
} from './marche.jsx'
import { Aimant } from './scene.jsx'

/** La hauteur d un ecran sous les barres de la documentation. */
const ECRAN = `calc(100vh - ${String(CHROME)}px)`

/** Le chanfrein : un coin coupe en bas a droite. Aucun arrondi sur cette page. */
const CHANFREIN =
  'polygon(0 0, 100% 0, 100% calc(100% - 10px), calc(100% - 10px) 100%, 0 100%)'

/* ============================ La feuille =============================== */

const STYLE_OBTURATEUR = 'o-vitrine-appareil-photo'

const CSS_OBTURATEUR = [
  '@keyframes o-ob-diaph{0%,100%{transform:rotate(0)}50%{transform:rotate(26deg)}}',
  '@keyframes o-ob-aiguille{0%{transform:rotate(-124deg)}100%{transform:rotate(var(--o-ob-angle,0deg))}}',
  '@keyframes o-ob-tiret{0%{stroke-dashoffset:0}100%{stroke-dashoffset:-24}}',
  '[data-o-ob-diaph]{animation:o-ob-diaph var(--o-ob-duree,9s) cubic-bezier(0.45,0,0.55,1) infinite;transform-origin:center}',
  '[data-o-ob-aiguille]{animation:o-ob-aiguille 1400ms cubic-bezier(0.2,1.1,0.3,1) both;transform-origin:center}',
  '[data-o-ob-tiret]{animation:o-ob-tiret 1.8s linear infinite}',
  '@media (prefers-reduced-motion:reduce){',
  '[data-o-ob-diaph],[data-o-ob-tiret]{animation:none}',
  '[data-o-ob-aiguille]{animation:none;transform:rotate(var(--o-ob-angle,0deg))}}',
].join('')

function useFeuilleObturateur(): void {
  useEffect(() => {
    if (document.getElementById(STYLE_OBTURATEUR) !== null) return
    const feuille = document.createElement('style')
    feuille.id = STYLE_OBTURATEUR
    feuille.textContent = CSS_OBTURATEUR
    document.head.append(feuille)
  }, [])
}

/* ============================ La grammaire du cadre ==================== */

/** Quatre equerres de coin : un panneau se marque, il ne se borde pas. */
function Equerres({
  couleur,
  taille = 11,
}: {
  readonly couleur: string
  readonly taille?: number
}): ReactElement {
  const coins = [
    { top: 0, left: 0, borderWidth: '2px 0 0 2px' },
    { top: 0, right: 0, borderWidth: '2px 2px 0 0' },
    { bottom: 0, left: 0, borderWidth: '0 0 2px 2px' },
    { bottom: 0, right: 0, borderWidth: '0 2px 2px 0' },
  ] as const
  return (
    <>
      {coins.map((coin, rang) => (
        <span
          key={rang}
          aria-hidden="true"
          className="o-pointer-events-none o-absolute o-block"
          style={{
            ...coin,
            width: taille,
            height: taille,
            borderColor: couleur,
            borderStyle: 'solid',
          }}
        />
      ))}
    </>
  )
}

/** Une plaque chanfreinee, marquee aux quatre coins. */
function Plaque({
  children,
  className,
  style,
  encreCoins,
}: {
  readonly children: ReactNode
  readonly className?: string
  readonly style?: CSSProperties
  readonly encreCoins?: string
}): ReactElement {
  return (
    <div
      className={`o-relative ${className ?? ''}`}
      style={{ clipPath: CHANFREIN, backgroundColor: accentDoux(500, 5), ...style }}
    >
      <Equerres couleur={encreCoins ?? accentDoux(300, 34)} />
      {children}
    </div>
  )
}

/* ============================ Le diaphragme ============================ */

/**
 * Un diaphragme a sept lames, dessine.
 *
 * L ouverture est le rayon du trou, de zero — ferme — a un. Les lames sont
 * sept secteurs identiques, tournes d un septieme de tour chacun ; leur bord
 * interieur est la corde qui laisse passer la lumiere.
 */
function Diaphragme({
  ouverture,
  respire = false,
  taille = 400,
}: {
  readonly ouverture: number
  readonly respire?: boolean
  readonly taille?: number
}): ReactElement {
  const lames = 7
  const rayon = 100
  const trou = 12 + ouverture * 62

  const lame = (rang: number): string => {
    const angle = (rang * 2 * Math.PI) / lames
    const suivant = angle + (2 * Math.PI) / lames
    const cx = Math.cos(angle) * trou
    const cy = Math.sin(angle) * trou
    const dx = Math.cos(suivant) * trou
    const dy = Math.sin(suivant) * trou
    const ex = Math.cos(suivant) * rayon
    const ey = Math.sin(suivant) * rayon
    const fx = Math.cos(angle) * rayon
    const fy = Math.sin(angle) * rayon
    return `M${cx.toFixed(1)} ${cy.toFixed(1)}L${dx.toFixed(1)} ${dy.toFixed(1)}L${ex.toFixed(1)} ${ey.toFixed(
      1,
    )}A${String(rayon)} ${String(rayon)} 0 0 0 ${fx.toFixed(1)} ${fy.toFixed(1)}Z`
  }

  return (
    <svg
      viewBox="-110 -110 220 220"
      width={taille}
      height={taille}
      className="o-h-auto o-w-full"
      aria-hidden="true"
    >
      {/* La lueur du trou : sans elle, sept lames noires sur un fond noir. */}
      <circle cx="0" cy="0" r={trou + 6} fill={accentDoux(100, 22)} />
      <g
        data-o-ob-diaph={respire ? '' : undefined}
        style={{ '--o-ob-duree': '11s' } as CSSProperties}
      >
        {Array.from({ length: lames }, (_, rang) => (
          <path
            key={rang}
            d={lame(rang)}
            fill={accentDoux(200, 10 + (rang % 3) * 6)}
            stroke={accentDoux(200, 52)}
            strokeWidth="1"
          />
        ))}
      </g>
      <circle
        cx="0"
        cy="0"
        r={rayon}
        fill="none"
        stroke={accentDoux(200, 58)}
        strokeWidth="1.5"
      />
      <circle
        cx="0"
        cy="0"
        r={rayon + 7}
        fill="none"
        stroke={accentDoux(200, 30)}
        strokeWidth="1"
      />
    </svg>
  )
}

/* ============================ Le triangle ============================== */

/** Les vitesses d obturation offertes, en secondes. */
const VITESSES = [
  1 / 8000,
  1 / 4000,
  1 / 2000,
  1 / 1000,
  1 / 500,
  1 / 250,
  1 / 125,
  1 / 60,
  1 / 30,
  1 / 15,
  1 / 8,
]

/** Les diaphragmes graves sur la bague. */
const OUVERTURES = [1.2, 1.4, 2, 2.8, 4, 5.6, 8, 11, 16, 22]

/** Les sensibilites de la molette arriere. */
const SENSIBILITES = [64, 100, 200, 400, 800, 1600, 3200, 6400, 12800]

/** La vitesse, ecrite comme sur le barillet. */
function ditVitesse(t: number): string {
  return t >= 1 ? `${String(t)} s` : `1/${String(Math.round(1 / t))}`
}

/** L indice de lumination d un triplet. */
function lumination(t: number, n: number, s: number): number {
  return Math.log2((n * n) / t) - Math.log2(s / 100)
}

/** L element du tableau le plus proche d une valeur. */
function approche(table: readonly number[], vise: number): number {
  return table.reduce((meilleur, valeur) =>
    Math.abs(Math.log2(valeur) - Math.log2(vise)) <
    Math.abs(Math.log2(meilleur) - Math.log2(vise))
      ? valeur
      : meilleur,
  )
}

/** La focale et le cercle de confusion de l objectif de reference. */
const FOCALE = 50
const CONFUSION = 0.03
/** La mise au point, en millimetres. */
const SUJET = 12000
/** Le coureur, en metres par seconde — quatorze kilometres a l heure. */
const ALLURE = 3.89

/** La profondeur de champ a une ouverture donnee, en metres. */
function profondeur(n: number): { avant: number; arriere: number; totale: number } {
  const hyperfocale = (FOCALE * FOCALE) / (n * CONFUSION) + FOCALE
  const avant = (SUJET * (hyperfocale - FOCALE)) / (hyperfocale + SUJET - 2 * FOCALE)
  const arriere =
    SUJET >= hyperfocale
      ? Number.POSITIVE_INFINITY
      : (SUJET * (hyperfocale - FOCALE)) / (hyperfocale - SUJET)
  return {
    avant: avant / 1000,
    arriere: arriere / 1000,
    totale: (arriere - avant) / 1000,
  }
}

/** Le file du sujet sur le capteur, en microns. */
function file(t: number): number {
  return ((ALLURE * t * 1000 * FOCALE) / SUJET) * 1000
}

/**
 * La scene dessinee, qui obeit aux trois reglages.
 *
 * Le fond se defocalise a mesure que la profondeur de champ se reduit ; le
 * coureur file quand la pose s allonge ; le grain monte avec la sensibilite.
 * Rien n est decoratif : les trois quantites sortent des formules ci-dessus.
 */
function Cliche({
  flouFond,
  fileMicrons,
  grain,
}: {
  readonly flouFond: number
  readonly fileMicrons: number
  readonly grain: number
}): ReactElement {
  const identifiant = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const flouSujet = Math.min(9, fileMicrons / 14)

  return (
    <svg
      viewBox="0 0 620 300"
      className="o-h-auto o-w-full"
      role="img"
      aria-label={`Le cliche obtenu : fond floute de ${flouFond.toFixed(1)} unites, sujet file de ${String(Math.round(fileMicrons))} microns`}
    >
      <defs>
        <filter id={`fond-${identifiant}`} x="-12%" y="-12%" width="124%" height="124%">
          <feGaussianBlur stdDeviation={flouFond.toFixed(2)} />
        </filter>
        <filter id={`sujet-${identifiant}`} x="-30%" y="-12%" width="160%" height="124%">
          <feGaussianBlur stdDeviation={`${flouSujet.toFixed(2)} 0`} />
        </filter>
        <filter id={`grain-${identifiant}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
      </defs>

      <rect width="620" height="300" fill={accentDoux(900, 40)} />

      {/* Le fond : la ligne d arbres et la barriere, qui se defocalisent. */}
      <g filter={`url(#fond-${identifiant})`}>
        <rect y="150" width="620" height="150" fill={accentDoux(800, 26)} />
        {Array.from({ length: 11 }, (_, rang) => (
          <g key={rang}>
            <path
              d={`M${String(28 + rang * 58)} 150v-64`}
              stroke={accentDoux(600, 34)}
              strokeWidth="7"
            />
            <circle
              cx={28 + rang * 58}
              cy={78 - (rang % 3) * 8}
              r={26 + (rang % 4) * 5}
              fill={accentDoux(600, 30)}
            />
          </g>
        ))}
        <path d="M0 172h620M0 190h620" stroke={accentDoux(400, 34)} strokeWidth="3" />
        {Array.from({ length: 21 }, (_, rang) => (
          <path
            key={rang}
            d={`M${String(10 + rang * 30)} 166v30`}
            stroke={accentDoux(400, 26)}
            strokeWidth="3"
          />
        ))}
      </g>

      {/* Le sujet : un coureur, qui file quand la pose s allonge. */}
      <g filter={flouSujet > 0.2 ? `url(#sujet-${identifiant})` : undefined}>
        <g fill={accent(200)}>
          <circle cx="318" cy="112" r="15" />
          <path d="M300 132h36l-6 54h-26Z" />
          <path d="M300 138 268 172l10 8 30-28ZM336 138l30 22-8 10-30-22Z" />
          <path d="M310 186 286 244l14 8 26-56ZM328 186l24 42-13 9-25-42Z" />
        </g>
      </g>

      {/* Le grain : il monte avec la sensibilite, et rien d autre. */}
      <rect
        width="620"
        height="300"
        filter={`url(#grain-${identifiant})`}
        opacity={grain.toFixed(3)}
        style={{ mixBlendMode: 'overlay' }}
      />

      {/* Le reticule du cadre, en mono. */}
      <g stroke={accentDoux(200, 34)} strokeWidth="1">
        <path d="M18 18h26M18 18v26M602 18h-26M602 18v26M18 282h26M18 282v-26M602 282h-26M602 282v-26" />
      </g>
    </svg>
  )
}

/** Une molette du triangle : un barillet crante qu on tourne d un cran. */
function Molette({
  titre,
  valeur,
  unite,
  crans,
  rang,
  poser,
  note,
  verrouille,
}: {
  readonly titre: string
  readonly valeur: string
  readonly unite: string
  readonly crans: readonly string[]
  readonly rang: number
  readonly poser: (rang: number) => void
  readonly note: string
  readonly verrouille: boolean
}): ReactElement {
  return (
    <Plaque className="o-p-5" encreCoins={verrouille ? accentDoux(300, 22) : accent(400)}>
      <p className="o-m-0 o-flex o-items-center o-justify-between o-gap-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
        {titre}
        {verrouille && <span style={{ color: encreSurSombre() }}>verrouille</span>}
      </p>

      <p
        className="o-m-0 o-mt-3 o-tabular-nums o-text-zinc-50"
        style={{
          ...affiche('m', 300),
          fontSize: 'clamp(1.9rem, 3.4vw, 3rem)',
          lineHeight: 0.94,
        }}
      >
        {valeur}
        <span className="o-ml-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
          {unite}
        </span>
      </p>

      {/* Le barillet : les crans, celui qui est pris marque en haut. */}
      <div className="o-mt-5 o-flex o-items-center o-gap-2">
        <button
          type="button"
          onClick={() => {
            poser(Math.max(0, rang - 1))
          }}
          disabled={verrouille || rang === 0}
          aria-label={`${titre} — un cran en moins`}
          className="o-shrink-0 o-border-w-1 o-px-2 o-py-1 o-font-mono o-text-xs o-transition-colors disabled:o-opacity-40 focus:o-ring"
          style={{ borderColor: accentDoux(300, 26), color: 'var(--o-theme-fg)' }}
        >
          −
        </button>
        <div
          className="o-relative o-min-w-0 o-grow o-overflow-hidden"
          style={{ height: 34 }}
        >
          <svg
            viewBox="0 0 300 34"
            className="o-h-full o-w-full"
            aria-hidden="true"
            preserveAspectRatio="none"
          >
            {crans.map((_, index) => {
              const x = 6 + (index / Math.max(1, crans.length - 1)) * 288
              const pris = index === rang
              return (
                <path
                  key={index}
                  d={`M${x.toFixed(1)} ${pris ? '2' : '10'}V32`}
                  stroke={pris ? encreSurSombre() : accentDoux(300, 26)}
                  strokeWidth={pris ? 3 : 1.5}
                />
              )
            })}
          </svg>
        </div>
        <button
          type="button"
          onClick={() => {
            poser(Math.min(crans.length - 1, rang + 1))
          }}
          disabled={verrouille || rang === crans.length - 1}
          aria-label={`${titre} — un cran en plus`}
          className="o-shrink-0 o-border-w-1 o-px-2 o-py-1 o-font-mono o-text-xs o-transition-colors disabled:o-opacity-40 focus:o-ring"
          style={{ borderColor: accentDoux(300, 26), color: 'var(--o-theme-fg)' }}
        >
          +
        </button>
      </div>

      <p className="o-m-0 o-mt-4 o-text-xs o-leading-relaxed o-text-zinc-400">{note}</p>
    </Plaque>
  )
}

/**
 * Le mecanisme : le triangle d exposition.
 *
 * Un des trois reglages est verrouille ; bouger l un des deux autres corrige
 * celui qui reste, pour que l indice de lumination ne bouge pas. C est ce que
 * fait un appareil en mode semi-automatique, et c est ce qu on n arrive jamais
 * a expliquer avec un schema fixe.
 */
function Triangle(): ReactElement {
  const [vitesse, setVitesse] = useState(4)
  const [ouverture, setOuverture] = useState(3)
  const [sensibilite, setSensibilite] = useState(2)
  const [verrou, setVerrou] = useState<'vitesse' | 'ouverture' | 'sensibilite'>(
    'sensibilite',
  )

  const t = VITESSES[vitesse] ?? VITESSES[4] ?? 1 / 500
  const n = OUVERTURES[ouverture] ?? 2.8
  const s = SENSIBILITES[sensibilite] ?? 200

  const il = lumination(t, n, s)

  /**
   * Bouger un reglage, et rendre les deux autres coherents.
   *
   * Le reglage verrouille ne bouge pas ; c est le troisieme qui compense, cale
   * sur le cran grave le plus proche. La lumination reste donc constante a un
   * tiers de valeur pres.
   */
  const bouger = (quoi: 'vitesse' | 'ouverture' | 'sensibilite', rang: number): void => {
    if (quoi === 'vitesse') {
      const nouveauT = VITESSES[rang] ?? t
      setVitesse(rang)
      if (verrou === 'sensibilite') {
        setOuverture(
          OUVERTURES.indexOf(
            approche(OUVERTURES, Math.sqrt((2 ** il * s * nouveauT) / 100)),
          ),
        )
      } else {
        setSensibilite(
          SENSIBILITES.indexOf(
            approche(SENSIBILITES, (100 * (n * n)) / (nouveauT * 2 ** il)),
          ),
        )
      }
      return
    }
    if (quoi === 'ouverture') {
      const nouveauN = OUVERTURES[rang] ?? n
      setOuverture(rang)
      if (verrou === 'sensibilite') {
        setVitesse(
          VITESSES.indexOf(
            approche(VITESSES, (nouveauN * nouveauN * 100) / (s * 2 ** il)),
          ),
        )
      } else {
        setSensibilite(
          SENSIBILITES.indexOf(
            approche(SENSIBILITES, (100 * (nouveauN * nouveauN)) / (t * 2 ** il)),
          ),
        )
      }
      return
    }
    const nouveauS = SENSIBILITES[rang] ?? s
    setSensibilite(rang)
    if (verrou === 'ouverture') {
      setVitesse(
        VITESSES.indexOf(approche(VITESSES, (n * n * 100) / (nouveauS * 2 ** il))),
      )
    } else {
      setOuverture(
        OUVERTURES.indexOf(
          approche(OUVERTURES, Math.sqrt((2 ** il * nouveauS * t) / 100)),
        ),
      )
    }
  }

  const champ = profondeur(n)
  const trainee = file(t)
  const net = trainee <= 30

  return (
    <div className="o-grid o-gap-10 lg:o-grid-cols-12 lg:o-gap-12">
      {/* ----- Les trois molettes --------------------------------------- */}
      <div className="o-min-w-0 lg:o-col-span-5">
        <fieldset className="o-m-0 o-p-0">
          <legend className="o-mb-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
            Ce qui ne bouge pas
          </legend>
          <div className="o-flex o-flex-wrap o-gap-2">
            {(
              [
                ['vitesse', 'La vitesse'],
                ['ouverture', 'L ouverture'],
                ['sensibilite', 'La sensibilite'],
              ] as const
            ).map(([cle, mot]) => (
              <button
                key={cle}
                type="button"
                aria-pressed={verrou === cle}
                onClick={() => {
                  setVerrou(cle)
                }}
                className="o-border-w-1 o-px-4 o-py-1.5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-transition-colors focus:o-ring"
                style={
                  verrou === cle
                    ? { ...aplat(), borderColor: 'transparent', clipPath: CHANFREIN }
                    : {
                        borderColor: accentDoux(300, 26),
                        color: 'var(--o-theme-muted)',
                        clipPath: CHANFREIN,
                      }
                }
              >
                {mot}
              </button>
            ))}
          </div>
        </fieldset>

        <div className="o-mt-6 o-flex o-flex-col o-gap-4">
          <Molette
            titre="Vitesse"
            valeur={ditVitesse(t)}
            unite="seconde"
            crans={VITESSES.map(ditVitesse)}
            rang={vitesse}
            verrouille={verrou === 'vitesse'}
            poser={(rang) => {
              bouger('vitesse', rang)
            }}
            note="Le temps pendant lequel le rideau reste ouvert. C est lui, et lui seul, qui decide si un sujet qui bouge reste net."
          />
          <Molette
            titre="Ouverture"
            valeur={`f/${n.toLocaleString('fr-FR')}`}
            unite="diaphragme"
            crans={OUVERTURES.map((valeur) => `f/${String(valeur)}`)}
            rang={ouverture}
            verrouille={verrou === 'ouverture'}
            poser={(rang) => {
              bouger('ouverture', rang)
            }}
            note="Le diametre du trou, en fraction de la focale. Un cran double la lumiere et divise la profondeur de champ."
          />
          <Molette
            titre="Sensibilite"
            valeur={`ISO ${s.toLocaleString('fr-FR')}`}
            unite="norme 12232"
            crans={SENSIBILITES.map((valeur) => String(valeur))}
            rang={sensibilite}
            verrouille={verrou === 'sensibilite'}
            poser={(rang) => {
              bouger('sensibilite', rang)
            }}
            note="L amplification du signal. Elle ne capte pas plus de lumiere : elle crie plus fort, et le bruit vient avec."
          />
        </div>
      </div>

      {/* ----- Le cliche et le releve ----------------------------------- */}
      <div className="o-min-w-0 lg:o-col-span-7">
        <div className="o-grid o-items-start o-gap-6 sm:o-grid-cols-12">
          <div className="o-min-w-0 sm:o-col-span-9">
            <Cliche
              flouFond={Math.max(0, 7.5 - champ.totale * 1.35)}
              fileMicrons={trainee}
              grain={Math.min(0.5, Math.max(0, Math.log2(s / 100) * 0.055))}
            />
          </div>
          <div className="o-min-w-0 sm:o-col-span-3">
            <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
              Diaphragme
            </p>
            <div className="o-mt-3">
              <Diaphragme
                ouverture={Math.max(
                  0,
                  Math.min(1, 1 - (Math.log2(n) - Math.log2(1.2)) / 4.2),
                )}
                taille={160}
              />
            </div>
          </div>
        </div>

        <dl
          aria-live="polite"
          className="o-m-0 o-mt-8 o-grid o-gap-px sm:o-grid-cols-2 lg:o-grid-cols-4"
          style={{ backgroundColor: 'var(--o-theme-line)' }}
        >
          {(
            [
              [
                'Lumination',
                `IL ${il.toFixed(1).replace('.', ',')}`,
                'a 100 ISO equivalent',
              ],
              [
                'Profondeur de champ',
                champ.totale > 900
                  ? 'de 6 m a l infini'
                  : `${champ.totale.toFixed(2).replace('.', ',')} m`,
                `de ${champ.avant.toFixed(1).replace('.', ',')} m a ${champ.arriere > 900 ? 'l infini' : `${champ.arriere.toFixed(1).replace('.', ',')} m`}`,
              ],
              [
                'File du coureur',
                `${String(Math.round(trainee))} µm`,
                net ? 'sous le cercle de confusion' : 'au-dessus : le sujet bouge',
              ],
              [
                'Bruit',
                `${String(Math.round(Math.log2(s / 100) * 1.7 + 1.2))} sur 10`,
                'mesure sur une plage grise',
              ],
            ] as const
          ).map(([quoi, valeur, note]) => (
            <div
              key={quoi}
              className="o-px-4 o-py-4"
              style={{ backgroundColor: 'var(--o-theme-bg)' }}
            >
              <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                {quoi}
              </dt>
              <dd
                className="o-m-0 o-mt-2 o-font-mono o-text-sm o-tabular-nums"
                style={{
                  color:
                    quoi === 'File du coureur' && !net
                      ? accent(300)
                      : 'var(--o-theme-fg)',
                }}
              >
                {valeur}
              </dd>
              <dd className="o-m-0 o-mt-1 o-text-xs o-leading-relaxed o-text-zinc-500">
                {note}
              </dd>
            </div>
          ))}
        </dl>

        <p className="o-m-0 o-mt-5 o-max-w-2xl o-text-sm o-leading-relaxed o-text-zinc-400">
          Objectif de 50 mm, mise au point a douze metres, cercle de confusion de 0,03 mm.
          Le coureur traverse le cadre a quatorze kilometres a l heure. Tant que sa
          trainee reste sous trente microns sur le capteur, le tirage est net a trente
          centimetres.
        </p>
      </div>
    </div>
  )
}

/* ============================ La coupe du boitier ====================== */

/** Ce que la coupe montre, dans l ordre ou la lumiere le traverse. */
const ORGANES = [
  {
    rang: '01',
    quoi: 'Lentille frontale',
    note: 'Verre a bas indice, traite sur les deux faces. Elle ne corrige rien : elle collecte.',
  },
  {
    rang: '02',
    quoi: 'Doublet colle',
    note: 'Deux verres de dispersion opposee, colles au baume. Ils rattrapent la frange violette des grands diaphragmes.',
  },
  {
    rang: '03',
    quoi: 'Diaphragme a sept lames',
    note: 'Place au centre optique. Sept lames donnent quatorze branches aux etoiles des points de lumiere.',
  },
  {
    rang: '04',
    quoi: 'Rideaux de l obturateur',
    note: 'Deux rideaux de titane qui descendent l un derriere l autre. Au-dela de 1/250, ils ne sont jamais ouverts ensemble.',
  },
  {
    rang: '05',
    quoi: 'Capteur 24 x 36',
    note: 'Sur trois axes motorises : la stabilisation compense jusqu a huit valeurs de pose.',
  },
] as const

/**
 * La coupe du boitier : la lumiere entre a gauche, elle sort a droite.
 *
 * Une figure, pas une illustration : chaque organe porte son numero, et la
 * liste a cote dit ce qu il fait. C est la seule section de la page qui ne
 * se manipule pas, et elle sert de respiration entre deux instruments.
 */
function CoupeBoitier(): ReactElement {
  const { reduced } = useMotionState()
  return (
    <svg
      viewBox="0 0 760 340"
      className="o-h-auto o-w-full"
      role="img"
      aria-label="Coupe du boitier : lentille frontale, doublet colle, diaphragme, rideaux et capteur"
    >
      {/* L axe optique, qui rampe de gauche a droite. */}
      <path
        data-o-ob-tiret={reduced ? undefined : ''}
        d="M8 170h744"
        stroke={accentDoux(200, 30)}
        strokeWidth="1"
        strokeDasharray="8 16"
      />

      {/* Le fut de l objectif. */}
      <path
        d="M40 96h300v148H40Z"
        fill="none"
        stroke={accentDoux(200, 36)}
        strokeWidth="1.5"
      />
      <path d="M40 118h300M40 222h300" stroke={accentDoux(200, 16)} strokeWidth="1" />

      {/* Les verres : des lentilles en coupe, biconvexes ou concaves. */}
      {(
        [
          { x: 72, h: 122, courbe: 34 },
          { x: 132, h: 112, courbe: -22 },
          { x: 176, h: 108, courbe: 26 },
          { x: 258, h: 96, courbe: 20 },
          { x: 302, h: 92, courbe: -16 },
        ] as const
      ).map((verre) => (
        <path
          key={verre.x}
          d={`M${String(verre.x)} ${String(170 - verre.h / 2)}q${String(verre.courbe)} ${String(verre.h / 2)} 0 ${String(
            verre.h,
          )}q${String(-verre.courbe - 12)} ${String(-verre.h / 2)} 0 ${String(-verre.h)}Z`}
          fill={accentDoux(200, verre.courbe > 0 ? 14 : 8)}
          stroke={accentDoux(200, 48)}
          strokeWidth="1.4"
        />
      ))}

      {/* Le diaphragme, vu par la tranche. */}
      <path
        d="M214 114v34M214 226v-34"
        stroke={accent(300)}
        strokeWidth="5"
        strokeLinecap="round"
      />

      {/* Le boitier et l oculaire. */}
      <path
        d="M340 60h300v220H340Z"
        fill="none"
        stroke={accentDoux(200, 42)}
        strokeWidth="1.5"
      />
      <path
        d="M640 96h64v88h-64"
        fill="none"
        stroke={accentDoux(200, 26)}
        strokeWidth="1.5"
      />

      {/* Les deux rideaux. */}
      <path
        d="M392 74v76M392 266v-40"
        stroke={accent(300)}
        strokeWidth="6"
        strokeLinecap="square"
      />
      <path
        d="M408 74v50M408 266v-66"
        stroke={accentDoux(300, 60)}
        strokeWidth="6"
        strokeLinecap="square"
      />

      {/* Le capteur et son berceau. */}
      <path
        d="M446 104v132"
        stroke={accent(200)}
        strokeWidth="8"
        strokeLinecap="square"
      />
      <path d="M456 116v108M466 128v84" stroke={accentDoux(200, 26)} strokeWidth="4" />

      {/* Les reperes. */}
      {(
        [
          ['01', 82, 72],
          ['02', 148, 88],
          ['03', 214, 98],
          ['04', 400, 56],
          ['05', 452, 88],
        ] as const
      ).map(([mot, x, y]) => (
        <g key={mot}>
          <path
            d={`M${String(x)} ${String(y)}V${String(y + 18)}`}
            stroke={accentDoux(200, 40)}
            strokeWidth="1"
          />
          <text
            x={x}
            y={y - 6}
            fontSize="13"
            textAnchor="middle"
            fill={encreSurSombre()}
            style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.1em' }}
          >
            {mot}
          </text>
        </g>
      ))}

      <text
        x="8"
        y="326"
        fontSize="12"
        fill="currentColor"
        opacity="0.55"
        style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.1em' }}
      >
        LA LUMIERE ENTRE ICI
      </text>
      <text
        x="752"
        y="326"
        fontSize="12"
        textAnchor="end"
        fill="currentColor"
        opacity="0.55"
        style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.1em' }}
      >
        TIRAGE 20 MM — MONTURE O-1
      </text>
    </svg>
  )
}

/* ============================ Les cadrans ============================== */

/** Un cadran gradue a aiguille (C28). */
function Cadran({
  titre,
  valeur,
  affichee,
  min,
  max,
  graduations,
  note,
}: {
  readonly titre: string
  readonly valeur: number
  readonly affichee: string
  readonly min: number
  readonly max: number
  readonly graduations: readonly string[]
  readonly note: string
}): ReactElement {
  const part = Math.max(0, Math.min(1, (valeur - min) / (max - min)))
  const angle = -124 + part * 248

  return (
    <div className="o-min-w-0">
      <svg
        viewBox="0 0 220 160"
        className="o-h-auto o-w-full"
        role="img"
        aria-label={`${titre} : ${affichee}`}
      >
        {/* L arc gradue. */}
        <path
          d="M22 140A98 98 0 0 1 198 140"
          fill="none"
          stroke={accentDoux(300, 22)}
          strokeWidth="1.5"
        />
        {graduations.map((mot, rang) => {
          const a =
            ((-124 + (rang / (graduations.length - 1)) * 248 - 90) * Math.PI) / 180
          const x1 = 110 + Math.cos(a) * 86
          const y1 = 138 + Math.sin(a) * 86
          const x2 = 110 + Math.cos(a) * 98
          const y2 = 138 + Math.sin(a) * 98
          const tx = 110 + Math.cos(a) * 72
          const ty = 138 + Math.sin(a) * 72
          return (
            <g key={mot}>
              <path
                d={`M${x1.toFixed(1)} ${y1.toFixed(1)}L${x2.toFixed(1)} ${y2.toFixed(1)}`}
                stroke={accentDoux(300, 34)}
                strokeWidth="2"
              />
              <text
                x={tx}
                y={ty + 4}
                fontSize="10"
                textAnchor="middle"
                fill="currentColor"
                opacity="0.55"
                style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.06em' }}
              >
                {mot}
              </text>
            </g>
          )
        })}

        {/* L aiguille : elle part du zero et se pose sur la mesure. */}
        <g
          data-o-ob-aiguille=""
          style={
            {
              '--o-ob-angle': `${angle.toFixed(1)}deg`,
              transformOrigin: '110px 138px',
            } as CSSProperties
          }
        >
          <path d="M110 138 L106 60 L110 48 L114 60 Z" fill={encreSurSombre()} />
        </g>
        <circle cx="110" cy="138" r="7" fill={accentDoux(300, 40)} />
        <circle cx="110" cy="138" r="2.5" fill="var(--o-theme-bg)" />
      </svg>

      <p className="o-m-0 o-mt-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
        {titre}
      </p>
      <p
        className="o-m-0 o-mt-1 o-tabular-nums o-text-zinc-50"
        style={{
          ...affiche('m', 300),
          fontSize: 'clamp(1.5rem, 2.6vw, 2.25rem)',
          lineHeight: 1,
        }}
      >
        {affichee}
      </p>
      <p className="o-m-0 o-mt-2 o-text-xs o-leading-relaxed o-text-zinc-500">{note}</p>
    </div>
  )
}

/* ============================ Le devis ================================= */

/** Ce que coute un boitier, et ce qui s y ajoute. */
const PRIX_BOITIER = 3280
const PRIX_OBJECTIF = 1140
/** L extension de garantie, par annee au-dela des deux annees comprises. */
const PRIX_ANNEE = 168

/**
 * Le devis en trois curseurs (A26), le total en 120 px.
 *
 * Trois curseurs, un prix, et le detail ecrit dessous : le nombre de boitiers,
 * les objectifs, et les annees de garantie au-dela des deux comprises. La
 * remise de parc s applique a partir de cinq boitiers, et elle est ecrite.
 */
function Devis(): ReactElement {
  const [boitiers, setBoitiers] = useState(2)
  const [objectifs, setObjectifs] = useState(2)
  const [garantie, setGarantie] = useState(4)

  const detail = useMemo(() => {
    const corps = boitiers * PRIX_BOITIER
    const optiques = boitiers * objectifs * PRIX_OBJECTIF
    const annees = boitiers * Math.max(0, garantie - 2) * PRIX_ANNEE
    // La remise de parc : deux pour cent par boitier au-dela de quatre, a
    // douze pour cent au plus. Elle ne porte que sur le materiel.
    const part = Math.min(0.12, Math.max(0, boitiers - 4) * 0.02)
    const remise = Math.round((corps + optiques) * part)
    return {
      corps,
      optiques,
      annees,
      remise,
      part,
      total: corps + optiques + annees - remise,
    }
  }, [boitiers, objectifs, garantie])

  const euros = (montant: number): string => `${montant.toLocaleString('fr-FR')} EUR`

  return (
    <div className="o-grid o-gap-12 lg:o-grid-cols-12 lg:o-gap-16">
      <div className="o-min-w-0 lg:o-col-span-6">
        <div
          className="o-flex o-flex-col o-gap-8"
          style={{ '--o-eslider-accent': encreSurSombre() } as CSSProperties}
        >
          {(
            [
              [
                'Boitiers',
                boitiers,
                1,
                12,
                setBoitiers,
                `${String(boitiers)} boitier${boitiers > 1 ? 's' : ''}`,
              ],
              [
                'Objectifs par boitier',
                objectifs,
                0,
                4,
                setObjectifs,
                `${String(objectifs)}`,
              ],
              ['Garantie', garantie, 2, 10, setGarantie, `${String(garantie)} ans`],
            ] as const
          ).map(([mot, valeur, min, max, poser, ecrit]) => (
            <div key={mot}>
              <p className="o-m-0 o-mb-3 o-flex o-items-baseline o-justify-between o-gap-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                {mot}
                <span className="o-tabular-nums o-text-zinc-50">{ecrit}</span>
              </p>
              <ElasticSlider
                label={mot}
                min={min}
                max={max}
                step={1}
                value={valeur}
                onChange={poser}
                showValue={false}
                stretch={0.07}
              />
            </div>
          ))}
        </div>

        <p className="o-m-0 o-mt-8 o-max-w-md o-text-xs o-leading-relaxed o-text-zinc-500">
          Boitier a {euros(PRIX_BOITIER)}, objectif a {euros(PRIX_OBJECTIF)}, annee de
          garantie supplementaire a {euros(PRIX_ANNEE)} par boitier. Deux annees sont
          comprises. Prix hors taxe, livraison sous six semaines depuis l atelier de
          Besancon.
        </p>
      </div>

      <div className="o-min-w-0 lg:o-col-span-6">
        <Plaque className="o-p-8" encreCoins={accent(400)}>
          <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
            Total hors taxe
          </p>
          <p
            aria-live="polite"
            className="o-m-0 o-mt-3 o-tabular-nums o-text-zinc-50"
            style={{
              ...affiche('l', 300),
              fontSize: 'clamp(3rem, 9vw, 7.5rem)',
              lineHeight: 0.86,
              letterSpacing: '-0.045em',
            }}
          >
            {detail.total.toLocaleString('fr-FR')}
          </p>
          <dl className="o-m-0 o-mt-8">
            {(
              [
                [`Boitiers — ${String(boitiers)}`, euros(detail.corps)],
                [`Objectifs — ${String(boitiers * objectifs)}`, euros(detail.optiques)],
                [
                  `Garantie — ${String(Math.max(0, garantie - 2))} an${garantie - 2 > 1 ? 's' : ''} de plus`,
                  euros(detail.annees),
                ],
                [
                  `Remise de parc — ${String(Math.round(detail.part * 100))} %`,
                  `− ${euros(detail.remise)}`,
                ],
              ] as const
            ).map(([quoi, montant]) => (
              <div
                key={quoi}
                className="o-flex o-items-baseline o-justify-between o-gap-4 o-border-t o-border-white-10 o-py-3"
              >
                <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                  {quoi}
                </dt>
                <dd className="o-m-0 o-font-mono o-text-sm o-tabular-nums o-text-zinc-100">
                  {montant}
                </dd>
              </div>
            ))}
          </dl>
          <div className="o-mt-8">
            <Aimant force={0.32}>
              <a
                href="mailto:parc@obturateur.fr"
                className="o-inline-flex o-items-center o-gap-2 o-px-6 o-py-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-no-underline o-transition-opacity hover:o-opacity-85 focus:o-ring"
                style={{ ...aplat(), clipPath: CHANFREIN }}
              >
                Demander ce devis
                <Icon icon={ArrowUpRight} size={14} aria-hidden="true" />
              </a>
            </Aimant>
          </div>
        </Plaque>
      </div>
    </div>
  )
}

/* ============================ L horloge du pied ======================== */

/** Le cadran du pied (P45) : l heure de la maison, en direct. */
function HorlogeCadran(): ReactElement {
  const { reduced } = useMotionState()
  const [heure, setHeure] = useState<{
    h: number
    m: number
    s: number
    texte: string
  } | null>(null)

  useEffect(() => {
    const lire = (): void => {
      const format = new Intl.DateTimeFormat('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: 'Europe/Paris',
      })
      const parties = format.formatToParts(new Date())
      const lu = (quoi: string): number =>
        Number(parties.find((p) => p.type === quoi)?.value ?? '0')
      setHeure({
        h: lu('hour') % 12,
        m: lu('minute'),
        s: lu('second'),
        texte: format.format(new Date()),
      })
    }
    lire()
    const id = window.setInterval(lire, 1000)
    return () => {
      window.clearInterval(id)
    }
  }, [])

  const heures = heure === null ? 0 : (heure.h + heure.m / 60) * 30
  const minutes = heure === null ? 0 : (heure.m + heure.s / 60) * 6
  const secondes = heure === null ? 0 : heure.s * 6

  return (
    <div className="o-flex o-flex-col o-items-center">
      <svg
        viewBox="0 0 220 220"
        className="o-h-auto o-w-full"
        style={{ maxWidth: 210 }}
        role="img"
        aria-label={`Heure de l atelier a Besancon : ${heure?.texte ?? ''}`}
      >
        <circle
          cx="110"
          cy="110"
          r="102"
          fill="none"
          stroke={accentDoux(300, 22)}
          strokeWidth="1.5"
        />
        {Array.from({ length: 60 }, (_, rang) => {
          const a = ((rang * 6 - 90) * Math.PI) / 180
          const dedans = rang % 5 === 0 ? 84 : 94
          return (
            <path
              key={rang}
              d={`M${(110 + Math.cos(a) * dedans).toFixed(1)} ${(110 + Math.sin(a) * dedans).toFixed(1)}L${(110 + Math.cos(a) * 100).toFixed(1)} ${(110 + Math.sin(a) * 100).toFixed(1)}`}
              stroke={accentDoux(300, rang % 5 === 0 ? 40 : 20)}
              strokeWidth={rang % 5 === 0 ? 2.4 : 1}
            />
          )
        })}
        <g
          style={{
            transform: `rotate(${heures.toFixed(1)}deg)`,
            transformOrigin: '110px 110px',
          }}
        >
          <path
            d="M110 110V52"
            stroke="var(--o-theme-fg)"
            strokeWidth="5"
            strokeLinecap="round"
          />
        </g>
        <g
          style={{
            transform: `rotate(${minutes.toFixed(1)}deg)`,
            transformOrigin: '110px 110px',
          }}
        >
          <path
            d="M110 110V30"
            stroke="var(--o-theme-fg)"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </g>
        {!reduced && (
          <g
            style={{
              transform: `rotate(${secondes.toFixed(1)}deg)`,
              transformOrigin: '110px 110px',
            }}
          >
            <path
              d="M110 124V26"
              stroke={encreSurSombre()}
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          </g>
        )}
        <circle cx="110" cy="110" r="5" fill={encreSurSombre()} />
      </svg>
      <p className="o-m-0 o-mt-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-tabular-nums o-text-zinc-400">
        Besancon — {heure?.texte ?? '--:--:--'}
      </p>
    </div>
  )
}

/* ============================ La page ================================== */

const NAVIGATION = [
  ['#triangle', 'Le triangle'],
  ['#banc', 'Le banc'],
  ['#parc', 'Le parc'],
] as const

export default function Page(): ReactElement {
  const polices = usePolices('jakarta')
  useFeuilleObturateur()
  const { reduced } = useMotionState()

  return (
    <Porte forme="iris" marque="Obturateur">
      <div className="o-relative o-text-zinc-50" style={{ ...polices, ...nuit('zinc') }}>
        {/* ================= L ouverture : le diaphragme ================== */}
        <header
          className="o-relative o-isolate o-flex o-flex-col o-overflow-hidden"
          style={{ minHeight: ECRAN }}
        >
          <div aria-hidden="true" className="o-absolute o-inset-0 o-z-0">
            <GridLines
              size={56}
              thickness={1}
              color={accentDoux(300, 14)}
              speed={0}
              fade
            />
          </div>
          <div
            aria-hidden="true"
            className="o-pointer-events-none o-absolute o-inset-0 o-z-0"
            style={{
              background: `radial-gradient(48% 56% at 74% 46%, ${accentDoux(400, 22)}, transparent 72%)`,
            }}
          />

          <BarreCoins
            marque="Obturateur"
            liens={NAVIGATION}
            droite="Besancon — depuis 1977"
          />

          <div className="o-relative o-z-10 o-grid o-grow o-items-center o-gap-10 o-px-6 o-pb-16 o-pt-10 md:o-px-10 lg:o-grid-cols-12">
            <div className="o-min-w-0 lg:o-col-span-7">
              <Surgit>
                <Etiquette>Obturateur plan focal — 1/8000 a 30 s</Etiquette>
              </Surgit>
              <TitreVague
                delai={140}
                className="o-m-0 o-mt-6 o-max-w-3xl o-uppercase"
                style={{
                  ...affiche('l', 800),
                  fontSize: 'clamp(2.5rem, 7.6vw, 7.5rem)',
                  lineHeight: 0.86,
                  letterSpacing: '-0.045em',
                }}
              >
                Trois reglages, un seul resultat
              </TitreVague>
              <Surgit
                delai={520}
                as="p"
                className="o-m-0 o-mt-7 o-max-w-md o-text-base o-leading-relaxed o-text-zinc-400"
              >
                Nous fabriquons un boitier par jour ouvre, a Besancon, et nous publions ce
                que chaque reglage coute aux deux autres. Le reste est du commerce.
              </Surgit>

              <Surgit
                delai={640}
                className="o-mt-9 o-flex o-flex-wrap o-items-center o-gap-4"
              >
                <Aimant force={0.32}>
                  <a
                    href="#triangle"
                    className="o-inline-flex o-items-center o-gap-2 o-px-7 o-py-3.5 o-font-mono o-text-xs o-font-semibold o-uppercase o-tracking-widest o-no-underline o-transition-opacity hover:o-opacity-85 focus:o-ring"
                    style={{ ...aplat(), clipPath: CHANFREIN }}
                  >
                    Ouvrir le triangle{' '}
                    <Icon icon={ArrowDown} size={14} aria-hidden="true" />
                  </a>
                </Aimant>
                <a
                  href="#banc"
                  className="o-inline-flex o-items-center o-gap-2 o-border-w-1 o-px-7 o-py-3.5 o-font-mono o-text-xs o-font-semibold o-uppercase o-tracking-widest o-no-underline o-transition-colors hover:o-bg-white-10 focus:o-ring"
                  style={{ borderColor: accentDoux(300, 30), clipPath: CHANFREIN }}
                >
                  Le banc d essai
                </a>
              </Surgit>

              {/* La fiche technique qui defile, soudee d un chiffre a l autre. */}
              <Surgit delai={760} className="o-mt-14">
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
                  Le boitier 04, en trois chiffres
                </p>
                {/* La soudure de `MorphText` passe par un seuil d alpha : sous
                    une graisse 300, un trait de soixante-douze pixels tombe
                    sous le seuil et le mot disparait. Il lui faut du gras. */}
                <div
                  className="o-mt-2 o-uppercase o-text-zinc-50"
                  style={{
                    ...affiche('m', 800),
                    fontSize: 'clamp(2.75rem, 5.6vw, 4.5rem)',
                    lineHeight: 1,
                    letterSpacing: '-0.03em',
                  }}
                >
                  <MorphText
                    mots={['1/8000 s', 'f/1,2', 'ISO 64', '410 000 vues']}
                    hold={2100}
                    morph={720}
                    flou={10}
                    fusion={2}
                  />
                </div>
              </Surgit>
            </div>

            <div className="o-relative o-min-w-0 lg:o-col-span-5">
              <Surgit delai={380}>
                <div className="o-mx-auto" style={{ maxWidth: 440 }}>
                  <Diaphragme ouverture={0.55} respire={!reduced} />
                </div>
              </Surgit>
            </div>
          </div>

          <Coin position="bd">
            Monture O-1, tirage 20 mm
            <br />
            Capteur 24 x 36, 61 Mpx
          </Coin>
          <Grain opacite={0.05} />
        </header>

        <main>
          {/* ================= Le mecanisme : le triangle ================= */}
          <section
            id="triangle"
            className="o-scroll-mt-24 o-border-t o-border-white-10 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
          >
            <div className="o-mx-auto o-max-w-7xl">
              <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
                <div className="o-min-w-0 md:o-col-span-8">
                  <Reveal>
                    <Indice rang="01">Le triangle</Indice>
                  </Reveal>
                  <Reveal delay={80}>
                    <h2
                      className="o-m-0 o-mt-5 o-max-w-3xl o-text-balance o-uppercase"
                      style={{
                        ...affiche('m', 800),
                        fontSize: 'clamp(1.75rem, 4.2vw, 3.75rem)',
                        lineHeight: 0.92,
                        letterSpacing: '-0.04em',
                      }}
                    >
                      Bougez-en un, les deux autres suivent.
                    </h2>
                  </Reveal>
                </div>
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400 md:o-col-span-4 md:o-text-right">
                  IL = log2(N² / t) − log2(S / 100)
                  <br />
                  50 mm — mise au point a 12 m
                </p>
              </div>
              <div className="o-mt-16">
                {reduced ? (
                  <Triangle />
                ) : (
                  <TargetCursor
                    size={30}
                    corner={11}
                    padding={7}
                    color={accent(300)}
                    targets="button, a, [role='slider']"
                  >
                    <Triangle />
                  </TargetCursor>
                )}
              </div>
            </div>
          </section>

          {/* ================= La coupe : une figure, une respiration ===== */}
          <section className="o-border-t o-border-white-10 o-px-6 o-py-24 md:o-px-10 md:o-py-32">
            <div className="o-mx-auto o-max-w-7xl">
              <Reveal>
                <Indice rang="02">La coupe</Indice>
              </Reveal>
              <Reveal delay={80}>
                <h2
                  className="o-m-0 o-mt-5 o-max-w-3xl o-text-balance o-uppercase"
                  style={{
                    ...affiche('m', 800),
                    fontSize: 'clamp(1.75rem, 4.2vw, 3.5rem)',
                    lineHeight: 0.92,
                    letterSpacing: '-0.04em',
                  }}
                >
                  Cinq obstacles entre la lumiere et le capteur.
                </h2>
              </Reveal>
              <div className="o-mt-14 o-grid o-gap-12 lg:o-grid-cols-12 lg:o-gap-16">
                <div className="o-min-w-0 lg:o-col-span-7">
                  <CoupeBoitier />
                </div>
                <ol className="o-m-0 o-min-w-0 o-list-none o-p-0 lg:o-col-span-5">
                  {ORGANES.map((organe) => (
                    <li
                      key={organe.rang}
                      className="o-grid o-gap-3 o-border-t o-border-white-10 o-py-5 sm:o-grid-cols-12"
                    >
                      <p
                        className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest sm:o-col-span-2"
                        style={{ color: encreSurSombre() }}
                      >
                        {organe.rang}
                      </p>
                      <div className="o-min-w-0 sm:o-col-span-10">
                        <p className="o-m-0 o-text-base o-text-zinc-100">{organe.quoi}</p>
                        <p className="o-m-0 o-mt-2 o-text-sm o-leading-relaxed o-text-zinc-400">
                          {organe.note}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </section>

          {/* ================= Le banc d essai : trois cadrans ============ */}
          <section
            id="banc"
            className="o-scroll-mt-24 o-border-t o-border-white-10 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
            style={{ backgroundColor: accentDoux(500, 6) }}
          >
            <div className="o-mx-auto o-max-w-7xl">
              <div className="o-grid o-gap-10 lg:o-grid-cols-12 lg:o-gap-16">
                <div className="o-min-w-0 lg:o-col-span-4">
                  <Reveal>
                    <Indice rang="03">Le banc</Indice>
                  </Reveal>
                  <Reveal delay={80}>
                    <h2
                      className="o-m-0 o-mt-5 o-max-w-sm o-text-balance o-uppercase"
                      style={{
                        ...affiche('m', 800),
                        fontSize: 'clamp(1.6rem, 3.4vw, 3rem)',
                        lineHeight: 0.92,
                        letterSpacing: '-0.04em',
                      }}
                    >
                      Chaque boitier passe une nuit sur le banc.
                    </h2>
                  </Reveal>
                  <p className="o-m-0 o-mt-6 o-max-w-sm o-text-base o-leading-relaxed o-text-zinc-400">
                    Douze heures de declenchements, une cellule au foyer, un four a
                    paliers. Les trois aiguilles ci-contre sont les mesures du dernier
                    boitier sorti — le numero 2 118.
                  </p>
                  <p
                    className="o-m-0 o-mt-6 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                    style={{ color: encreSurSombre() }}
                  >
                    Releve du 9 mars, 04 h 12
                  </p>
                </div>
                <div className="o-min-w-0 lg:o-col-span-8">
                  <div className="o-grid o-gap-10 sm:o-grid-cols-3">
                    <Cadran
                      titre="Endurance de l obturateur"
                      valeur={410}
                      affichee="410 000"
                      min={0}
                      max={600}
                      graduations={['0', '150', '300', '450', '600 k']}
                      note="Declenchements avant derive de plus d un sixieme de valeur. Le rideau est garanti 300 000."
                    />
                    <Cadran
                      titre="Ecart de pose a 1/1000"
                      valeur={0.08}
                      affichee="+0,08 IL"
                      min={-0.5}
                      max={0.5}
                      graduations={['−0,5', '−0,25', '0', '+0,25', '+0,5']}
                      note="Mesure a la cellule au foyer, sur cent declenchements. La norme de la maison est un dixieme."
                    />
                    <Cadran
                      titre="Plage de service"
                      valeur={45}
                      affichee="−10 a +45 °C"
                      min={-20}
                      max={60}
                      graduations={['−20', '0', '20', '40', '60 °C']}
                      note="Essai en four a paliers de cinq degres, quatre heures par palier, avec condensation."
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ================= Le devis en trois curseurs ================= */}
          <section
            id="parc"
            className="o-scroll-mt-24 o-border-t o-border-white-10 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
          >
            <div className="o-mx-auto o-max-w-7xl">
              <Reveal>
                <Indice rang="04">Le parc</Indice>
              </Reveal>
              <Reveal delay={80}>
                <h2
                  className="o-m-0 o-mt-5 o-max-w-2xl o-text-balance o-uppercase"
                  style={{
                    ...affiche('m', 800),
                    fontSize: 'clamp(1.75rem, 4vw, 3.5rem)',
                    lineHeight: 0.92,
                    letterSpacing: '-0.04em',
                  }}
                >
                  Trois curseurs, et le prix exact.
                </h2>
              </Reveal>
              <div className="o-mt-16">
                <Devis />
              </div>
            </div>
          </section>
        </main>

        {/* ================= Le pied a cadran ============================= */}
        <footer className="o-border-t o-border-white-10 o-px-6 o-py-16 md:o-px-10">
          <div className="o-mx-auto o-grid o-max-w-5xl o-items-center o-gap-12 md:o-grid-cols-12">
            <div className="o-min-w-0 md:o-col-span-4">
              <HorlogeCadran />
            </div>
            <div className="o-min-w-0 md:o-col-span-8">
              <p
                className="o-m-0 o-uppercase o-text-zinc-50"
                style={{
                  ...affiche('m', 800),
                  fontSize: 'clamp(2rem, 4.5vw, 3.25rem)',
                  lineHeight: 0.9,
                  letterSpacing: '-0.04em',
                }}
              >
                Obturateur
              </p>
              <p className="o-m-0 o-mt-4 o-max-w-lg o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400">
                12 chemin de la Bergerie, 25000 Besancon — atelier ouvert du lundi au
                jeudi, 8 h a 17 h. Reparations recues toute l annee, y compris sur les
                boitiers d avant 1990.
              </p>
              <nav
                aria-label="Rubriques"
                className="o-mt-8 o-flex o-flex-wrap o-gap-x-8 o-gap-y-3"
              >
                {(
                  [
                    ['#triangle', 'Le triangle'],
                    ['#banc', 'Le banc d essai'],
                    ['#parc', 'Devis de parc'],
                    ['mailto:atelier@obturateur.fr', 'atelier@obturateur.fr'],
                  ] as const
                ).map(([cible, mot]) => (
                  <a
                    key={mot}
                    href={cible}
                    className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-300 o-no-underline o-transition-colors hover:o-text-zinc-50 focus:o-ring"
                  >
                    {mot}
                  </a>
                ))}
              </nav>
              <p className="o-m-0 o-mt-8 o-border-t o-border-white-10 o-pt-5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
                © 2026 Obturateur SAS — les mesures publiees sont celles du banc de la
                maison
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
