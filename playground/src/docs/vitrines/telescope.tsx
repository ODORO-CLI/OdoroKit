/**
 * Coupole — observatoire de nuit.
 *
 * ## Ce que la page fait : le ciel de ce soir
 *
 * Le mecanisme n est pas une illustration d astronomie, c est un calcul
 * d astronomie. On choisit un site et une heure de la nuit ; la page en
 * deduit :
 *
 * - le **jour julien** de l instant choisi ;
 * - le **temps sideral local**
 *   `TSL = 280,46061837 + 360,98564736629 (JJ - 2451545) + longitude` ;
 * - pour chacun des quinze objets du catalogue, l **angle horaire**
 *   `H = TSL - 15 AD`, puis la hauteur et l azimut par
 *   `sin h = sin d sin p + cos d cos p cos H`.
 *
 * Les ascensions droites, les declinaisons et les magnitudes sont celles des
 * catalogues. Ce qui est au-dessous de l horizon est dit au-dessous de
 * l horizon ; ce qui est bas est dit bas. Aucune vitrine ne peut mentir sur
 * un ciel : il suffit de sortir pour verifier.
 *
 * ## La nuit, en diorama
 *
 * Mouvement M-diorama, vertical : cinq ecrans de nuit, la voute qui tourne
 * autour du pole avec la traversee, la fente de la coupole qui s ouvre, le
 * causse au premier plan. Le fond est le semis de points du registre — une
 * seule surface, en canevas.
 *
 * ## Les formes
 *
 * A19 : un compte a rebours jusqu a la cloture des inscriptions de la
 * prochaine nuit publique, calcule sur le vendredi qui vient. P24 : une carte
 * du monde a points, les quatre sites allumes. C15 : une echelle verticale
 * graduee, le noir du ciel pose dessus.
 *
 * @module
 */

import { useMotionState } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import { ArrowDown, ArrowUpRight } from '@odoro-cli/icons/filaire'
import { Reveal } from '@odoro-cli/libs/motion'
import { useEffect, useMemo, useState, type ReactElement } from 'react'

import { Constellation } from '@/odoro/background/Constellation.jsx'
import { useMediaQuery } from '@/odoro/hooks/useMediaQuery'
import { Meteors } from '@/odoro/effect/Meteors.jsx'
import { CircularText } from '@/odoro/text/CircularText.jsx'
import { OrbitalTimeline, type OrbitalStep } from '@/odoro/section/OrbitalTimeline.jsx'
import { StarBorder } from '@/odoro/ui/StarBorder.jsx'

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
import { Couche, Profondeur } from './scene.jsx'

/** La hauteur d un ecran sous les barres de la documentation. */
const ECRAN = `calc(100vh - ${String(CHROME)}px)`

const RADIAN = Math.PI / 180

/* ============================ Les sites ================================ */

/** Un site d observation : ou il est, et ce qu on y voit. */
interface Site {
  readonly cle: string
  readonly nom: string
  readonly pays: string
  readonly latitude: number
  readonly longitude: number
  /** Le noir du ciel au zenith, en magnitude par seconde d arc au carre. */
  readonly noir: number
  readonly altitude: number
  readonly nuitsClaires: number
  /** Position sur la carte du pied, en pourcentage. */
  readonly carte: readonly [number, number]
}

const SITES: readonly Site[] = [
  {
    cle: 'mejean',
    nom: 'Causse Mejean',
    pays: 'Lozere',
    latitude: 44.2,
    longitude: 3.4,
    noir: 21.6,
    altitude: 1020,
    nuitsClaires: 168,
    carte: [45.5, 15.5],
  },
  {
    cle: 'aubrac',
    nom: 'Plateau de l Aubrac',
    pays: 'Aveyron',
    latitude: 44.63,
    longitude: 3.03,
    noir: 21.3,
    altitude: 1340,
    nuitsClaires: 152,
    carte: [43, 20.5],
  },
  {
    cle: 'palma',
    nom: 'Ile de La Palma',
    pays: 'Canaries',
    latitude: 28.75,
    longitude: -17.89,
    noir: 21.9,
    altitude: 2380,
    nuitsClaires: 274,
    carte: [39.5, 27.5],
  },
  {
    cle: 'atacama',
    nom: 'Desert d Atacama',
    pays: 'Chili',
    latitude: -24.63,
    longitude: -70.4,
    noir: 22,
    altitude: 2640,
    nuitsClaires: 318,
    carte: [30.5, 62],
  },
]

/* ============================ Le catalogue ============================= */

/** Un objet du catalogue : ascension droite en heures, declinaison en degres. */
interface Astre {
  readonly nom: string
  readonly genre: string
  readonly ad: number
  readonly dec: number
  readonly magnitude: number
  readonly mot: string
}

const CATALOGUE: readonly Astre[] = [
  {
    nom: 'Vega',
    genre: 'Etoile — Lyre',
    ad: 18.615,
    dec: 38.78,
    magnitude: 0.03,
    mot: 'Le zero de l echelle photometrique, par convention.',
  },
  {
    nom: 'Deneb',
    genre: 'Etoile — Cygne',
    ad: 20.69,
    dec: 45.28,
    magnitude: 1.25,
    mot: 'A deux mille annees-lumiere : l etoile la plus lointaine que l oeil nu atteigne.',
  },
  {
    nom: 'Altair',
    genre: 'Etoile — Aigle',
    ad: 19.846,
    dec: 8.87,
    magnitude: 0.77,
    mot: 'Elle tourne en neuf heures et s en trouve aplatie d un cinquieme.',
  },
  {
    nom: 'Arcturus',
    genre: 'Etoile — Bouvier',
    ad: 14.261,
    dec: 19.18,
    magnitude: -0.05,
    mot: 'Une geante orange qui traverse le disque galactique par le travers.',
  },
  {
    nom: 'Capella',
    genre: 'Etoile — Cocher',
    ad: 5.278,
    dec: 45.998,
    magnitude: 0.08,
    mot: 'Quatre etoiles, dont deux geantes jaunes que rien ne separe a l oeil.',
  },
  {
    nom: 'Polaris',
    genre: 'Etoile — Petite Ourse',
    ad: 2.53,
    dec: 89.26,
    magnitude: 1.98,
    mot: 'A trois quarts de degre du pole : elle decrit un petit cercle, elle ne l occupe pas.',
  },
  {
    nom: 'Betelgeuse',
    genre: 'Etoile — Orion',
    ad: 5.919,
    dec: 7.407,
    magnitude: 0.45,
    mot: 'Une supergeante variable dont le diametre depasse l orbite de Mars.',
  },
  {
    nom: 'Rigel',
    genre: 'Etoile — Orion',
    ad: 5.242,
    dec: -8.2,
    magnitude: 0.18,
    mot: 'Bleue, chaude, et cent vingt mille fois plus lumineuse que le Soleil.',
  },
  {
    nom: 'Sirius',
    genre: 'Etoile — Grand Chien',
    ad: 6.752,
    dec: -16.716,
    magnitude: -1.46,
    mot: 'La plus brillante du ciel, et la plus proche que l on voie de nos latitudes.',
  },
  {
    nom: 'Mizar',
    genre: 'Etoile double — Grande Ourse',
    ad: 13.399,
    dec: 54.93,
    magnitude: 2.23,
    mot: 'Le test de vue des archers : qui separe Alcor a l oeil nu voit bien.',
  },
  {
    nom: 'Albireo',
    genre: 'Etoile double — Cygne',
    ad: 19.512,
    dec: 27.96,
    magnitude: 3.05,
    mot: 'Or et bleu dans le meme champ. Le plus beau couple du ciel d ete.',
  },
  {
    nom: 'M31 — Andromede',
    genre: 'Galaxie',
    ad: 0.712,
    dec: 41.27,
    magnitude: 3.44,
    mot: 'Deux millions et demi d annees-lumiere, et six fois la largeur de la Lune.',
  },
  {
    nom: 'M13 — Hercule',
    genre: 'Amas globulaire',
    ad: 16.695,
    dec: 36.46,
    magnitude: 5.8,
    mot: 'Trois cent mille etoiles dans vingt annees-lumiere de diametre.',
  },
  {
    nom: 'M57 — l Anneau',
    genre: 'Nebuleuse planetaire',
    ad: 18.893,
    dec: 33.03,
    magnitude: 8.8,
    mot: 'Une etoile morte vue par le trou : un rond de fumee de mille ans.',
  },
  {
    nom: 'M42 — Orion',
    genre: 'Nebuleuse diffuse',
    ad: 5.588,
    dec: -5.39,
    magnitude: 4,
    mot: 'La pouponniere la plus proche : mille etoiles y naissent encore.',
  },
]

/** Le jour julien d un instant. */
function jourJulien(quand: Date): number {
  return quand.getTime() / 86400000 + 2440587.5
}

/** Le temps sideral local, en degres. */
function siderealLocal(quand: Date, longitude: number): number {
  const jj = jourJulien(quand)
  const gmst = 280.46061837 + 360.98564736629 * (jj - 2451545)
  return (((gmst + longitude) % 360) + 360) % 360
}

/** La hauteur et l azimut d un astre, en degres. */
function viser(
  astre: Astre,
  site: Site,
  tsl: number,
): { hauteur: number; azimut: number } {
  const angleHoraire = (((tsl - astre.ad * 15) % 360) + 360) % 360
  const h = angleHoraire * RADIAN
  const d = astre.dec * RADIAN
  const p = site.latitude * RADIAN
  const sinHauteur = Math.sin(d) * Math.sin(p) + Math.cos(d) * Math.cos(p) * Math.cos(h)
  const hauteur = Math.asin(Math.max(-1, Math.min(1, sinHauteur))) / RADIAN
  const azimut =
    (((Math.atan2(
      -Math.cos(d) * Math.sin(h),
      Math.sin(d) * Math.cos(p) - Math.cos(d) * Math.sin(p) * Math.cos(h),
    ) /
      RADIAN) %
      360) +
      360) %
    360
  return { hauteur, azimut }
}

/** Les huit aires de vent. */
const AIRES = ['N', 'NE', 'E', 'SE', 'S', 'SO', 'O', 'NO'] as const

function aire(azimut: number): string {
  return AIRES[Math.round(azimut / 45) % 8] ?? 'N'
}

/* ============================ La coupole =============================== */

/**
 * La coupole, dessinee : le tambour, la calotte, et la fente qui s ouvre.
 *
 * `ouverture` va de zero — fente fermee — a un. C est la seule piece du decor
 * qui change avec la traversee du diorama, et c est voulu : une coupole ne
 * fait rien d autre de la nuit que s ouvrir et tourner.
 */
function Coupole({
  ouverture = 1,
  taille = 420,
}: {
  readonly ouverture?: number
  readonly taille?: number
}): ReactElement {
  const large = 22 + ouverture * 34
  return (
    <svg
      viewBox="0 0 400 300"
      width={taille}
      className="o-h-auto o-w-full"
      aria-hidden="true"
    >
      {/* Le tambour de beton. */}
      <path
        d="M96 300V188h208v112Z"
        fill={accentDoux(900, 62)}
        stroke={accentDoux(200, 52)}
        strokeWidth="1.5"
      />
      <path d="M96 220h208M96 252h208" stroke={accentDoux(200, 24)} strokeWidth="1" />
      <path
        d="M176 300v-52h48v52"
        fill={accentDoux(950, 70)}
        stroke={accentDoux(200, 34)}
        strokeWidth="1"
      />

      {/* La calotte. */}
      <path
        d="M88 190a112 106 0 0 1 224 0Z"
        fill={accentDoux(800, 46)}
        stroke={accentDoux(200, 62)}
        strokeWidth="1.5"
      />
      <path
        d="M124 190a76 72 0 0 1 152 0"
        fill="none"
        stroke={accentDoux(200, 26)}
        strokeWidth="1"
      />
      <path d="M88 190h224" stroke={accentDoux(200, 60)} strokeWidth="2" />

      {/* La fente, qui s ouvre. */}
      <path
        d={`M${String(200 - large / 2)} 190V126a${String(large / 2)} ${String(large / 2 + 14)} 0 0 1 ${String(large)} 0v64Z`}
        fill="var(--o-palette-zinc-950)"
        stroke={encreSurSombre()}
        strokeWidth="1.5"
      />
      {/* Le tube du telescope, entrevu par la fente. */}
      <g opacity={Math.min(1, ouverture * 1.6)}>
        <path d="M188 190v-46l24-10v56Z" fill={accentDoux(400, 44)} />
        <path d="M186 190h28" stroke={accent(300)} strokeWidth="3" />
      </g>
    </svg>
  )
}

/* ============================ Le diorama =============================== */

/** Les cinq moments de la nuit, sur le diorama. */
const ACTES = [
  {
    heure: '21 h 40',
    titre: 'La coupole s ouvre',
    texte:
      'Le tambour tourne de quatre-vingt-dix degres. Il faut vingt minutes pour que l air du dedans prenne la temperature du dehors.',
  },
  {
    heure: '22 h 30',
    titre: 'La nuit astronomique',
    texte:
      'Le Soleil passe sous dix-huit degres. Avant cela, le fond du ciel est encore eclaire, et les nebuleuses ne sortent pas.',
  },
  {
    heure: '00 h 15',
    titre: 'Le meridien',
    texte:
      'Les objets d ete passent au plus haut. C est la que l air en travers est le plus mince — une masse d air contre deux a trente degres.',
  },
  {
    heure: '02 h 50',
    titre: 'La rosee',
    texte:
      'Le miroir descend sous le point de rosee. La resistance chauffante du secondaire tient le verre a deux degres au-dessus.',
  },
  {
    heure: '05 h 20',
    titre: 'On referme',
    texte:
      'L aube nautique. Le tambour revient au nord, la fente se ferme, et le releve de la nuit part au catalogue.',
  },
] as const

/** Un semis d etoiles fixe, pour les couches dessinees du diorama. */
function semis(
  nombre: number,
  graine: number,
): readonly { x: number; y: number; r: number }[] {
  let etat = graine
  const suivant = (): number => {
    etat = (etat * 1664525 + 1013904223) % 4294967296
    return etat / 4294967296
  }
  return Array.from({ length: nombre }, () => ({
    x: suivant() * 100,
    y: suivant() * 100,
    r: 0.2 + suivant() * 0.9,
  }))
}

/** La voute dessinee : elle tourne autour du pole avec la traversee. */
function Voute(): ReactElement {
  const etoiles = useMemo(() => semis(260, 20260911), [])
  const laiteuse = useMemo(() => semis(260, 77712), [])
  return (
    <svg
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      className="o-h-full o-w-full"
      aria-hidden="true"
    >
      <g
        style={{
          transform: 'rotate(calc(var(--p, 0) * 46deg))',
          transformOrigin: '78% 8%',
        }}
      >
        {/* La bande laiteuse, en travers. */}
        <g opacity="0.55">
          {laiteuse.map((point, rang) => (
            <circle
              key={`l-${String(rang)}`}
              cx={point.x}
              cy={14 + point.y * 0.34 + point.x * 0.42}
              r={point.r * 0.5}
              fill={accent(100)}
              opacity={0.18 + point.r * 0.3}
            />
          ))}
        </g>
        {etoiles.map((point, rang) => (
          <circle
            key={rang}
            cx={point.x}
            cy={point.y}
            r={point.r * 0.55}
            fill={accent(50)}
            opacity={0.35 + point.r * 0.65}
          />
        ))}
      </g>
    </svg>
  )
}

/** La ligne de crete du causse, et ses genevriers. */
function Crete({
  opacite,
  hauteur,
}: {
  readonly opacite: number
  readonly hauteur: number
}): ReactElement {
  return (
    <svg
      viewBox="0 0 1200 200"
      preserveAspectRatio="none"
      className="o-h-full o-w-full"
      aria-hidden="true"
    >
      <path
        d={`M0 200V${String(hauteur + 40)}c60-18 120 6 180-4s120-34 190-22 110 40 180 30 140-40 210-28 180 36 240 24V200Z`}
        fill={`color-mix(in oklab, var(--o-palette-zinc-950) ${String(Math.round(opacite * 100))}%, transparent)`}
      />
      {[140, 330, 520, 700, 880, 1060].map((x, rang) => (
        <path
          key={x}
          d={`M${String(x)} ${String(hauteur + 46 + rang * 3)}l-9 -26 9 -16 9 16Z`}
          fill={`color-mix(in oklab, var(--o-palette-zinc-950) ${String(Math.round(opacite * 100))}%, transparent)`}
        />
      ))}
    </svg>
  )
}

/* ============================ Le mecanisme ============================= */

/** Deux chiffres, comme sur une horloge. */
function deux(n: number): string {
  return String(Math.floor(n)).padStart(2, '0')
}

/**
 * Le ciel de ce soir.
 *
 * Site et heure au choix ; le reste est du calcul. La table est triee par
 * hauteur decroissante, et ce qui est sous l horizon reste ecrit — un
 * observateur a autant besoin de savoir ce qui n est pas la.
 */
function CielDeCeSoir({
  site,
  poserSite,
}: {
  readonly site: Site
  readonly poserSite: (cle: string) => void
}): ReactElement {
  const [heure, setHeure] = useState(23)
  const [maintenant, setMaintenant] = useState(false)
  const [horloge, setHorloge] = useState<Date | null>(null)

  useEffect(() => {
    setHorloge(new Date())
    if (!maintenant) return undefined
    const id = window.setInterval(() => {
      setHorloge(new Date())
    }, 30000)
    return () => {
      window.clearInterval(id)
    }
  }, [maintenant])

  const instant = useMemo(() => {
    const base = horloge ?? new Date()
    if (maintenant) return base
    const jour = new Date(base.getFullYear(), base.getMonth(), base.getDate())
    jour.setHours(heure, 0, 0, 0)
    return jour
  }, [horloge, maintenant, heure])

  const tsl = siderealLocal(instant, site.longitude)

  const releve = useMemo(
    () =>
      CATALOGUE.map((astre) => ({ astre, ...viser(astre, site, tsl) })).sort(
        (a, b) => b.hauteur - a.hauteur,
      ),
    [site, tsl],
  )

  const visibles = releve.filter((ligne) => ligne.hauteur > 0)
  const format = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit' })

  return (
    <div className="o-grid o-gap-10 lg:o-grid-cols-12 lg:o-gap-14">
      {/* ----- Les reglages : le lieu et l heure ------------------------ */}
      <div className="o-min-w-0 lg:o-col-span-4">
        <fieldset className="o-m-0 o-p-0">
          <legend className="o-mb-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
            Le lieu
          </legend>
          <div className="o-flex o-flex-wrap o-gap-2">
            {SITES.map((autre) => (
              <button
                key={autre.cle}
                type="button"
                aria-pressed={autre.cle === site.cle}
                onClick={() => {
                  poserSite(autre.cle)
                }}
                className="o-rounded-full o-border-w-1 o-px-4 o-py-1.5 o-text-sm o-transition-colors focus:o-ring"
                style={
                  autre.cle === site.cle
                    ? { ...aplat(), borderColor: 'transparent' }
                    : {
                        borderColor: 'var(--o-theme-line)',
                        color: 'var(--o-theme-muted)',
                      }
                }
              >
                {autre.nom}
              </button>
            ))}
          </div>
          <p className="o-m-0 o-mt-4 o-font-mono o-text-xs o-tabular-nums o-text-zinc-400">
            {Math.abs(site.latitude).toFixed(2).replace('.', ',')}°{' '}
            {site.latitude >= 0 ? 'N' : 'S'} —{' '}
            {Math.abs(site.longitude).toFixed(2).replace('.', ',')}°{' '}
            {site.longitude >= 0 ? 'E' : 'O'} — {site.altitude} m
          </p>
        </fieldset>

        <div className="o-mt-10">
          <p className="o-m-0 o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
            L heure
            <span className="o-tabular-nums o-text-zinc-50">
              {maintenant ? format.format(instant) : `${deux(heure)} h 00`}
            </span>
          </p>
          <label className="o-mt-3 o-block">
            <span className="o-sr-only">Heure de la nuit</span>
            <input
              type="range"
              min={20}
              max={29}
              step={1}
              value={heure}
              onChange={(evenement) => {
                setMaintenant(false)
                setHeure(Number(evenement.target.value) % 24)
              }}
              className="o-w-full o-accent-brand-500 focus:o-ring"
            />
          </label>
          <div className="o-mt-3 o-flex o-items-center o-justify-between o-gap-4">
            <span className="o-font-mono o-text-xs o-text-zinc-500">20 h</span>
            <button
              type="button"
              aria-pressed={maintenant}
              onClick={() => {
                setMaintenant((valeur) => !valeur)
                setHorloge(new Date())
              }}
              className="o-rounded-full o-border-w-1 o-px-3 o-py-1 o-font-mono o-text-xs o-uppercase o-tracking-widest o-transition-colors focus:o-ring"
              style={
                maintenant
                  ? { ...aplat(), borderColor: 'transparent' }
                  : { borderColor: 'var(--o-theme-line)', color: 'var(--o-theme-muted)' }
              }
            >
              A cette heure-ci
            </button>
            <span className="o-font-mono o-text-xs o-text-zinc-500">5 h</span>
          </div>
        </div>

        <dl className="o-m-0 o-mt-10">
          {(
            [
              [
                'Temps sideral local',
                `${deux(tsl / 15)} h ${deux(((tsl / 15) % 1) * 60)}`,
              ],
              [
                'Objets au-dessus de l horizon',
                `${String(visibles.length)} sur ${String(CATALOGUE.length)}`,
              ],
              ['Nuits claires par an', String(site.nuitsClaires)],
            ] as const
          ).map(([quoi, valeur]) => (
            <div
              key={quoi}
              className="o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-3 o-border-t o-border-white-10 o-py-3"
            >
              <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                {quoi}
              </dt>
              <dd className="o-m-0 o-font-mono o-text-sm o-tabular-nums o-text-zinc-100">
                {valeur}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      {/* ----- Le releve ------------------------------------------------ */}
      <div className="o-min-w-0 lg:o-col-span-8">
        {/* La bande defile de cote sur un petit ecran : il lui faut un
            `overflow-y` explicite, sans quoi elle avale la molette. */}
        <div className="o-relative o-overflow-x-auto" style={{ overflowY: 'hidden' }}>
          <table
            className="o-w-full o-text-left"
            style={{ borderCollapse: 'collapse', minWidth: 560 }}
          >
            <caption className="o-sr-only">
              Le ciel visible depuis {site.nom}, trie par hauteur au-dessus de l horizon
            </caption>
            <thead>
              <tr className="o-border-b o-border-white-10">
                {['Objet', 'Genre', 'Hauteur', 'Direction', 'Magnitude'].map((mot) => (
                  <th
                    key={mot}
                    scope="col"
                    className="o-py-3 o-pr-4 o-font-mono o-text-xs o-font-normal o-uppercase o-tracking-widest o-text-zinc-400"
                  >
                    {mot}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {releve.map(({ astre, hauteur, azimut }) => {
                const dessus = hauteur > 0
                const atteignable = dessus && astre.magnitude <= site.noir - 15.5
                return (
                  <tr
                    key={astre.nom}
                    className="o-border-b o-border-white-10"
                    style={{ opacity: dessus ? 1 : 0.4 }}
                  >
                    <th
                      scope="row"
                      className="o-py-3 o-pr-4 o-text-sm o-font-medium o-text-zinc-50"
                    >
                      {astre.nom}
                    </th>
                    <td className="o-py-3 o-pr-4 o-text-sm o-text-zinc-400">
                      {astre.genre}
                    </td>
                    <td
                      className="o-py-3 o-pr-4 o-font-mono o-text-sm o-tabular-nums"
                      style={{
                        color: dessus ? encreSurSombre() : 'var(--o-theme-muted)',
                      }}
                    >
                      {dessus ? `${hauteur.toFixed(0)}°` : 'sous l horizon'}
                    </td>
                    <td className="o-py-3 o-pr-4 o-font-mono o-text-sm o-tabular-nums o-text-zinc-300">
                      {dessus ? `${aire(azimut)} ${azimut.toFixed(0)}°` : '—'}
                    </td>
                    <td className="o-py-3 o-font-mono o-text-sm o-tabular-nums o-text-zinc-300">
                      {astre.magnitude.toFixed(2).replace('.', ',')}
                      {atteignable ? '' : dessus ? ' — au telescope' : ''}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <p
          aria-live="polite"
          className="o-m-0 o-mt-6 o-max-w-2xl o-text-sm o-leading-relaxed o-text-zinc-400"
        >
          {visibles[0] === undefined
            ? 'Rien au-dessus de l horizon a cette heure-la.'
            : `Le plus haut a ${maintenant ? format.format(instant) : `${deux(heure)} h`} : ${visibles[0].astre.nom}, a ${visibles[0].hauteur.toFixed(0)} degres. ${visibles[0].astre.mot}`}
        </p>
      </div>
    </div>
  )
}

/* ============================ L echelle du noir ======================== */

/**
 * L echelle verticale du noir du ciel (C15).
 *
 * De dix-sept — le centre d une grande ville — a vingt-deux, ou l on ne gagne
 * plus rien parce que le ciel lui-meme brille. La valeur du site choisi est
 * posee sur la reglette ; les trois autres restent en creux.
 */
function EchelleDuNoir({ site }: { readonly site: Site }): ReactElement {
  const bas = 17
  const haut = 22.2
  const enY = (valeur: number): number => 430 - ((valeur - bas) / (haut - bas)) * 400

  return (
    <div className="o-relative o-flex o-items-stretch o-gap-8">
      <svg
        viewBox="0 0 130 470"
        className="o-h-auto"
        style={{ width: 130 }}
        role="img"
        aria-label={`Noir du ciel a ${site.nom} : ${site.noir.toFixed(1)} magnitudes par seconde d arc au carre`}
      >
        {/* La reglette. */}
        <path d="M44 30V430" stroke={accentDoux(300, 34)} strokeWidth="2" />
        {Array.from({ length: 27 }, (_, rang) => bas + rang * 0.2).map((valeur) => {
          const fort = Math.abs(valeur - Math.round(valeur)) < 0.01
          return (
            <g key={valeur.toFixed(1)}>
              <path
                d={`M44 ${enY(valeur).toFixed(1)}h${fort ? '18' : '9'}`}
                stroke={accentDoux(300, fort ? 46 : 22)}
                strokeWidth={fort ? 2 : 1}
              />
              {fort && (
                <text
                  x="36"
                  y={enY(valeur) + 4}
                  fontSize="12"
                  textAnchor="end"
                  fill="currentColor"
                  opacity="0.55"
                  style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.06em' }}
                >
                  {valeur.toFixed(0)}
                </text>
              )}
            </g>
          )
        })}

        {/* Les trois autres sites, en creux. */}
        {SITES.filter((autre) => autre.cle !== site.cle).map((autre) => (
          <path
            key={autre.cle}
            d={`M44 ${enY(autre.noir).toFixed(1)}h64`}
            stroke={accentDoux(300, 26)}
            strokeWidth="1"
            strokeDasharray="3 4"
          />
        ))}

        {/* La valeur, posee dessus. */}
        <g>
          <path
            d={`M30 ${enY(site.noir).toFixed(1)}h78`}
            stroke={encreSurSombre()}
            strokeWidth="2.5"
          />
          <circle cx="44" cy={enY(site.noir)} r="7" fill={encreSurSombre()} />
        </g>
      </svg>

      <div className="o-relative o-min-w-0 o-grow">
        <div
          className="o-absolute o-left-0"
          style={{
            top: `${String(((enY(site.noir) - 24) / 470) * 100)}%`,
            transform: 'translateY(-50%)',
          }}
        >
          <p
            className="o-m-0 o-tabular-nums o-text-zinc-50"
            style={{
              ...affiche('m', 300),
              fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
              lineHeight: 0.9,
            }}
          >
            {site.noir.toFixed(1).replace('.', ',')}
          </p>
          <p
            className="o-m-0 o-mt-2 o-font-mono o-text-xs o-uppercase o-tracking-widest"
            style={{ color: encreSurSombre() }}
          >
            magnitudes par seconde d arc carree — {site.nom}
          </p>
          <p className="o-m-0 o-mt-4 o-max-w-sm o-text-sm o-leading-relaxed o-text-zinc-400">
            Un ciel de grande ville tombe a dix-sept virgule cinq : on y voit deux cents
            etoiles. Ici, on en compte plus de deux mille, et la Voie lactee porte une
            ombre au sol.
          </p>
        </div>
      </div>
    </div>
  )
}

/* ============================ Le compte a rebours ====================== */

/** La prochaine cloture d inscription : vingt-quatre heures avant le vendredi. */
function prochaineCloture(depuis: Date): { nuit: Date; cloture: Date } {
  const nuit = new Date(depuis)
  nuit.setHours(21, 30, 0, 0)
  // Vendredi = 5 ; on avance jusqu au prochain vendredi dont la cloture n est
  // pas passee, sans quoi le compte a rebours serait negatif un jeudi soir.
  let pas = 0
  while (pas < 15) {
    if (nuit.getDay() === 5 && nuit.getTime() - 86400000 > depuis.getTime()) break
    nuit.setDate(nuit.getDate() + 1)
    pas += 1
  }
  return { nuit, cloture: new Date(nuit.getTime() - 86400000) }
}

/**
 * Le compte a rebours (A19).
 *
 * Il ne compte pas vers une date ecrite en dur — une date passee est une
 * promesse morte — mais vers la cloture calculee du prochain vendredi.
 */
function CompteARebours(): ReactElement {
  const [reste, setReste] = useState<{
    j: number
    h: number
    m: number
    s: number
  } | null>(null)
  const [quand, setQuand] = useState<{ nuit: Date; cloture: Date } | null>(null)

  useEffect(() => {
    const battre = (): void => {
      const maintenant = new Date()
      const echeance = prochaineCloture(maintenant)
      setQuand(echeance)
      const ecart = Math.max(0, echeance.cloture.getTime() - maintenant.getTime())
      setReste({
        j: Math.floor(ecart / 86400000),
        h: Math.floor((ecart % 86400000) / 3600000),
        m: Math.floor((ecart % 3600000) / 60000),
        s: Math.floor((ecart % 60000) / 1000),
      })
    }
    battre()
    const id = window.setInterval(battre, 1000)
    return () => {
      window.clearInterval(id)
    }
  }, [])

  const dateNuit =
    quand === null
      ? ''
      : new Intl.DateTimeFormat('fr-FR', {
          weekday: 'long',
          day: 'numeric',
          month: 'long',
        }).format(quand.nuit)

  return (
    <div className="o-text-center">
      <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
        Inscriptions closes dans
      </p>
      <div
        className="o-mt-6 o-flex o-flex-wrap o-items-baseline o-justify-center o-gap-x-6 o-gap-y-3"
        aria-live="off"
      >
        {(
          [
            ['jours', reste?.j ?? 0],
            ['heures', reste?.h ?? 0],
            ['minutes', reste?.m ?? 0],
            ['secondes', reste?.s ?? 0],
          ] as const
        ).map(([mot, valeur]) => (
          <span key={mot} className="o-inline-flex o-flex-col o-items-center">
            <span
              className="o-tabular-nums o-text-zinc-50"
              style={{
                ...affiche('l', 300),
                fontSize: 'clamp(3rem, 9vw, 7rem)',
                lineHeight: 0.86,
              }}
            >
              {deux(valeur)}
            </span>
            <span className="o-mt-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
              {mot}
            </span>
          </span>
        ))}
      </div>
      <p className="o-m-0 o-mt-8 o-text-base o-leading-relaxed o-text-zinc-300">
        Prochaine nuit publique — {dateNuit}, 21 h 30, sous la coupole. Douze places, pas
        une de plus : c est le nombre de personnes qui tiennent autour de l oculaire sans
        se marcher dessus.
      </p>
      <div className="o-mt-9 o-flex o-justify-center">
        <StarBorder color={accent(300)} speed={5200} thickness={1} glow={0.6}>
          <a
            href="mailto:nuits@coupole-observatoire.fr"
            className="o-inline-flex o-items-center o-gap-2 o-rounded-full o-px-7 o-py-3.5 o-text-sm o-font-semibold o-no-underline o-transition-opacity hover:o-opacity-85 focus:o-ring"
            style={aplat()}
          >
            Reserver une place
            <Icon icon={ArrowUpRight} size={16} aria-hidden="true" />
          </a>
        </StarBorder>
      </div>
    </div>
  )
}

/* ============================ Le pied : la carte ======================= */

/**
 * Une carte du monde a points (P24).
 *
 * Les continents sont un semis de points sur une grille, allumes la ou il y a
 * de la terre — assez pour reconnaitre la forme, pas assez pour pretendre a
 * une projection. Les quatre sites y sont poses, allumes.
 */
const TERRES: readonly (readonly [number, number, number, number])[] = [
  // [x, y, largeur, hauteur] en pourcentage : des taches, pas des frontieres.
  [14, 14, 16, 14],
  [18, 28, 10, 26],
  [42, 12, 22, 16],
  [44, 28, 10, 22],
  [46, 44, 10, 22],
  [62, 18, 24, 22],
  [72, 42, 14, 12],
  [80, 62, 10, 12],
  [28, 54, 10, 26],
  [8, 20, 8, 10],
]

function CarteDuMonde({ site }: { readonly site: Site }): ReactElement {
  const points = useMemo(() => {
    const liste: { x: number; y: number }[] = []
    for (let x = 4; x < 96; x += 1.8) {
      for (let y = 8; y < 84; y += 3.2) {
        if (
          TERRES.some(
            ([tx, ty, tl, th]) => x >= tx && x <= tx + tl && y >= ty && y <= ty + th,
          )
        ) {
          liste.push({ x, y })
        }
      }
    }
    return liste
  }, [])

  return (
    <div className="o-relative">
      <svg
        viewBox="0 0 100 92"
        className="o-h-auto o-w-full"
        role="img"
        aria-label="Carte du monde a points : quatre sites d observation allumes"
      >
        {points.map((point, rang) => (
          <circle
            key={rang}
            cx={point.x}
            cy={point.y}
            r="0.62"
            fill={accentDoux(300, 42)}
          />
        ))}
        {SITES.map((autre) => {
          const actif = autre.cle === site.cle
          return (
            <g key={autre.cle}>
              <circle
                cx={autre.carte[0]}
                cy={autre.carte[1]}
                r={actif ? 2.4 : 1.5}
                fill={actif ? encreSurSombre() : accent(400)}
              />
              {actif && (
                <circle
                  cx={autre.carte[0]}
                  cy={autre.carte[1]}
                  r="5"
                  fill="none"
                  stroke={encreSurSombre()}
                  strokeWidth="0.5"
                />
              )}
              <text
                x={autre.carte[0] + (autre.cle === 'aubrac' ? -4 : 4)}
                y={
                  autre.carte[1] +
                  (autre.cle === 'mejean' ? -3.4 : autre.cle === 'aubrac' ? 4.6 : 1.4)
                }
                fontSize="2.6"
                textAnchor={autre.cle === 'aubrac' ? 'end' : 'start'}
                fill="currentColor"
                opacity={actif ? 0.95 : 0.78}
                // Le nom se pose sur le semis de points, qui est gris comme lui :
                // sans halo, « Plateau de l Aubrac » se lit mal la ou il traverse
                // l Europe. `paint-order` fait passer le contour avant le
                // remplissage, et le contour est le fond de la bande — le nom se
                // detache donc sans cadre ni pastille. L audit de contraste ne
                // voyait rien : il compare un texte au fond de sa section, pas a
                // ce qu un frere peint dessous.
                paintOrder="stroke"
                stroke="var(--o-theme-bg)"
                strokeWidth="0.9"
                strokeLinejoin="round"
                style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.05em' }}
              >
                {autre.nom.toUpperCase()}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}

/* ============================ La page ================================== */

const NAVIGATION = [
  ['#nuit', 'La nuit'],
  ['#ciel', 'Le ciel'],
  ['#venir', 'Venir'],
] as const

/** Un pictogramme de noeud, dessine : le registre n en fournit aucun. */
function Pastille({ d }: { readonly d: string }): ReactElement {
  return (
    <svg
      viewBox="0 0 24 24"
      width="17"
      height="17"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={d} />
    </svg>
  )
}

/** Le programme de la nuit, en frise orbitale. */
const PROGRAMME: readonly OrbitalStep[] = [
  {
    id: 'accueil',
    icon: <Pastille d="M4 20V10l8-6 8 6v10M9 20v-6h6v6" />,
    title: 'Accueil',
    date: '21 h 30',
    status: 'done' as const,
    energy: 100,
    content:
      'Sous le tambour, lampe rouge obligatoire. La vision de nuit met vingt minutes a s installer et trois secondes a se perdre.',
  },
  {
    id: 'oeil',
    icon: (
      <Pastille d="M2 12s3.6-6 10-6 10 6 10 6-3.6 6-10 6-10-6-10-6ZM12 9.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z" />
    ),
    title: 'A l oeil nu',
    date: '22 h 00',
    status: 'done' as const,
    energy: 82,
    content:
      'Reperage des constellations de saison, de la Voie lactee et de la lumiere zodiacale quand elle sort.',
  },
  {
    id: 'oculaire',
    icon: <Pastille d="M9 3h6v5l4 11a2 2 0 0 1-2 3H7a2 2 0 0 1-2-3l4-11ZM9 8h6" />,
    title: 'A l oculaire',
    date: '22 h 45',
    status: 'current' as const,
    energy: 64,
    content:
      'Le trois cents millimetres ouvert a quatre. Amas, nebuleuses, et la Lune seulement si elle est mince.',
  },
  {
    id: 'pose',
    icon: (
      <Pastille d="M4 18V8a2 2 0 0 1 2-2h2l1.4-2h5.2L16 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2ZM12 9a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z" />
    ),
    title: 'La pose longue',
    date: '00 h 30',
    status: 'todo' as const,
    energy: 46,
    content:
      'Une heure sur une seule cible, guidee. On repart avec le fichier brut et la carte du champ.',
  },
  {
    id: 'releve',
    icon: <Pastille d="M6 3h9l3 3v15H6ZM9 10h6M9 14h6M9 18h4" />,
    title: 'Le releve',
    date: '05 h 20',
    status: 'todo' as const,
    energy: 28,
    content:
      'Fermeture de la fente, releve des conditions, envoi au catalogue. Cafe sous le tambour.',
  },
]

export default function Page(): ReactElement {
  const polices = usePolices('syne')
  const { reduced } = useMotionState()
  const [siteCle, setSiteCle] = useState('mejean')
  // La frise orbitale pose ses noeuds en absolu : a rayon fixe, elle deborde
  // un telephone de soixante-dix pixels. Le rayon suit donc la largeur.
  const large = useMediaQuery('(min-width: 720px)')
  const site = (SITES.find((s) => s.cle === siteCle) ?? SITES[0]) as Site

  const ciel = useMemo(
    () => (
      <Constellation
        className="o-absolute o-inset-0"
        count={150}
        distance={0.52}
        speed={0.32}
        attract={0.7}
        colors={['--o-palette-zinc-950', '--o-vitrine-200', '--o-vitrine-500']}
        poster="o-bg-zinc-950"
      />
    ),
    [],
  )

  return (
    <Porte forme="trou" marque="Coupole">
      <div className="o-relative o-text-zinc-50" style={{ ...polices, ...nuit('zinc') }}>
        {/* ================= L ouverture : la coupole ===================== */}
        <header
          className="o-relative o-isolate o-flex o-flex-col o-overflow-hidden"
          style={{ minHeight: ECRAN }}
        >
          <div aria-hidden="true" className="o-absolute o-inset-0 o-z-0">
            {ciel}
          </div>
          <div
            aria-hidden="true"
            className="o-pointer-events-none o-absolute o-inset-0 o-z-0"
            style={{
              background: [
                `radial-gradient(58% 46% at 50% 92%, ${accentDoux(700, 34)}, transparent 74%)`,
                // Le semis reste lisible en haut et s efface sous le titre :
                // un ciel derriere du texte doit ceder la place au texte.
                'linear-gradient(100deg, var(--o-palette-zinc-950) 18%, color-mix(in oklab, var(--o-palette-zinc-950) 62%, transparent) 52%, transparent 78%)',
                'linear-gradient(to bottom, transparent 42%, var(--o-palette-zinc-950) 96%)',
              ].join(', '),
            }}
          />
          {!reduced && (
            <Meteors
              count={9}
              angle={210}
              color={accent(200)}
              className="o-absolute o-inset-0 o-z-0"
            />
          )}

          <BarreCoins marque="Coupole" liens={NAVIGATION} droite="44,20° N — 3,40° E" />

          <div className="o-relative o-z-10 o-flex o-grow o-flex-col o-justify-end o-px-6 o-pb-10 o-pt-10 md:o-px-12">
            <div className="o-grid o-items-end o-gap-10 lg:o-grid-cols-12">
              <div className="o-min-w-0 lg:o-col-span-7">
                <Surgit>
                  <Etiquette>
                    Observatoire du causse — ouvert au public le vendredi
                  </Etiquette>
                </Surgit>
                <TitreVague
                  delai={140}
                  className="o-m-0 o-mt-6 o-max-w-3xl"
                  style={{
                    ...affiche('l', 300),
                    fontSize: 'clamp(2.6rem, 7.4vw, 7.5rem)',
                    lineHeight: 0.88,
                  }}
                >
                  Le ciel de ce soir, a votre heure et a votre latitude.
                </TitreVague>
                <Surgit
                  delai={540}
                  as="p"
                  className="o-m-0 o-mt-7 o-max-w-md o-text-base o-leading-relaxed o-text-zinc-300"
                >
                  Un trois cents millimetres sous une coupole de quatre metres, a mille
                  vingt metres, sous un ciel a vingt et une virgule six. Cette page
                  calcule ce qui est au-dessus de l horizon quand vous la lisez.
                </Surgit>
                <Surgit
                  delai={660}
                  className="o-mt-9 o-flex o-flex-wrap o-items-center o-gap-4"
                >
                  <a
                    href="#ciel"
                    className="o-inline-flex o-items-center o-gap-2 o-rounded-full o-px-7 o-py-3.5 o-text-sm o-font-semibold o-no-underline o-transition-transform hover:o-scale-105 focus:o-ring"
                    style={aplat()}
                  >
                    Ouvrir le releve{' '}
                    <Icon icon={ArrowDown} size={15} aria-hidden="true" />
                  </a>
                  <a
                    href="#venir"
                    className="o-inline-flex o-items-center o-gap-2 o-rounded-full o-border-w-1 o-border-white-20 o-px-7 o-py-3.5 o-text-sm o-font-semibold o-no-underline o-backdrop-blur-md o-transition-colors hover:o-bg-white-10 focus:o-ring"
                  >
                    La prochaine nuit
                  </a>
                </Surgit>
              </div>

              <div className="o-relative o-min-w-0 lg:o-col-span-5">
                <Surgit delai={380}>
                  <div
                    className="o-relative o-mx-auto o-flex o-items-end o-justify-center"
                    style={{ maxWidth: 440 }}
                  >
                    <Coupole ouverture={0.85} />
                    <span
                      className="o-pointer-events-none o-absolute o-left-1/2 o-top-0"
                      style={{ transform: 'translate(-50%, -46%)', color: accent(200) }}
                    >
                      <CircularText size={178} speed={26}>
                        COUPOLE · OBSERVATOIRE DU CAUSSE MEJEAN · 1020 M ·
                      </CircularText>
                    </span>
                  </div>
                </Surgit>
              </div>
            </div>
          </div>

          <Coin position="bd">
            Miroir de 300 mm, f/4
            <br />
            Monture equatoriale allemande
          </Coin>
          <Grain opacite={0.05} />
        </header>

        <main>
          {/* ================= Le diorama de la nuit ====================== */}
          <section id="nuit" className="o-scroll-mt-24">
            <Profondeur
              ecrans={5}
              actes={ACTES.length}
              course={74}
              glisse={0.78}
              className="o-bg-zinc-950"
              hud={(acte) => {
                const a = ACTES[acte] ?? ACTES[0]
                return (
                  <div className="o-flex o-h-full o-flex-col o-justify-between o-px-6 o-py-10 md:o-px-12">
                    <div className="o-flex o-items-start o-justify-between o-gap-6">
                      <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                        La nuit du vendredi — {String(acte + 1).padStart(2, '0')} /{' '}
                        {String(ACTES.length).padStart(2, '0')}
                      </p>
                      <p
                        className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-tabular-nums"
                        style={{ color: encreSurSombre() }}
                      >
                        {a.heure}
                      </p>
                    </div>
                    <div className="o-max-w-xl">
                      <h2
                        className="o-m-0 o-text-balance"
                        style={{
                          ...affiche('m', 300),
                          fontSize: 'clamp(1.9rem, 5vw, 4.25rem)',
                          lineHeight: 0.95,
                        }}
                      >
                        {a.titre}
                      </h2>
                      <p className="o-m-0 o-mt-5 o-max-w-lg o-text-base o-leading-relaxed o-text-zinc-300">
                        {a.texte}
                      </p>
                    </div>
                  </div>
                )
              }}
            >
              {/* Le sol ne monte pas : c est le ciel qui tourne et qui passe.
                  La couche de devant descend un peu — d ou le sentiment de
                  lever la tete au fil de la nuit. */}
              <Couche profondeur={0} className="o-bg-zinc-950">
                <div
                  className="o-absolute o-inset-0"
                  style={{
                    background: `radial-gradient(70% 52% at 50% 4%, ${accentDoux(800, 40)}, transparent 76%)`,
                  }}
                />
              </Couche>
              <Couche profondeur={0.52} derive={16}>
                <Voute />
              </Couche>
              <Couche profondeur={0.24} derive={22} className="o-opacity-40">
                {/* Les cercles de hauteur : trente, soixante, le zenith. */}
                <svg
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  className="o-h-full o-w-full"
                  aria-hidden="true"
                >
                  {[26, 44, 62].map((r) => (
                    <ellipse
                      key={r}
                      cx="50"
                      cy="88"
                      rx={r}
                      ry={r * 0.74}
                      fill="none"
                      stroke={accentDoux(300, 26)}
                      strokeWidth="0.2"
                      strokeDasharray="1 2"
                    />
                  ))}
                  <path
                    d="M50 12V88M12 88h76"
                    stroke={accentDoux(300, 20)}
                    strokeWidth="0.2"
                  />
                </svg>
              </Couche>
              <Couche
                profondeur={0.06}
                derive={26}
                className="o-flex o-items-end o-justify-center"
              >
                <div className="o-w-full" style={{ maxWidth: 460, marginBottom: '16%' }}>
                  <Coupole ouverture={1} />
                </div>
              </Couche>
              <Couche profondeur={0.03} derive={34} className="o-flex o-items-end">
                <div className="o-h-1/3 o-w-full">
                  <Crete opacite={0.9} hauteur={40} />
                </div>
              </Couche>
              <Couche profondeur={-0.08} derive={48} className="o-flex o-items-end">
                <div className="o-w-full" style={{ height: '22%' }}>
                  <Crete opacite={1} hauteur={10} />
                </div>
              </Couche>
            </Profondeur>
          </section>

          {/* ================= Le mecanisme : le ciel de ce soir ========== */}
          <section
            id="ciel"
            className="o-scroll-mt-24 o-border-t o-border-white-10 o-px-6 o-py-24 md:o-px-12 md:o-py-32"
          >
            <div className="o-mx-auto o-max-w-7xl">
              <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
                <div className="o-min-w-0 md:o-col-span-8">
                  <Reveal>
                    <Indice rang="01">Le releve</Indice>
                  </Reveal>
                  <Reveal delay={80}>
                    <h2
                      className="o-m-0 o-mt-5 o-max-w-3xl o-text-balance"
                      style={{
                        ...affiche('m', 300),
                        fontSize: 'clamp(1.9rem, 4.6vw, 4.25rem)',
                        lineHeight: 0.95,
                      }}
                    >
                      Quinze objets, et la hauteur de chacun.
                    </h2>
                  </Reveal>
                </div>
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400 md:o-col-span-4 md:o-text-right">
                  H = TSL − 15 AD
                  <br />
                  sin h = sin d sin p + cos d cos p cos H
                </p>
              </div>
              <div className="o-mt-16">
                <CielDeCeSoir site={site} poserSite={setSiteCle} />
              </div>
            </div>
          </section>

          {/* ================= L echelle du noir ========================== */}
          <section
            className="o-border-t o-border-white-10 o-px-6 o-py-24 md:o-px-12 md:o-py-32"
            style={{ backgroundColor: accentDoux(500, 6) }}
          >
            <div className="o-mx-auto o-grid o-max-w-7xl o-gap-12 lg:o-grid-cols-12 lg:o-gap-16">
              <div className="o-min-w-0 lg:o-col-span-5">
                <Reveal>
                  <Indice rang="02">Le noir</Indice>
                </Reveal>
                <Reveal delay={80}>
                  <h2
                    className="o-m-0 o-mt-5 o-max-w-md o-text-balance"
                    style={{
                      ...affiche('m', 300),
                      fontSize: 'clamp(1.8rem, 4vw, 3.5rem)',
                      lineHeight: 0.96,
                    }}
                  >
                    Ce qu on vient chercher ici n est pas un instrument, c est une
                    absence.
                  </h2>
                </Reveal>
                <p className="o-m-0 o-mt-6 o-max-w-md o-text-base o-leading-relaxed o-text-zinc-300">
                  Un telescope deux fois plus grand gagne une magnitude et demie. Passer d
                  un ciel de peripherie a celui-ci en gagne trois. Le site compte plus que
                  le verre, et c est pour cela que la coupole est la et pas ailleurs.
                </p>
              </div>
              <div className="o-min-w-0 lg:o-col-span-7">
                <EchelleDuNoir site={site} />
              </div>
            </div>
          </section>

          {/* ================= Le programme de la nuit ==================== */}
          <section className="o-border-t o-border-white-10 o-px-6 o-py-24 md:o-px-12 md:o-py-32">
            <div className="o-mx-auto o-max-w-7xl">
              <Reveal>
                <Indice rang="03">Le programme</Indice>
              </Reveal>
              <div className="o-mt-12 o-grid o-gap-12 lg:o-grid-cols-12 lg:o-gap-16">
                <div className="o-min-w-0 lg:o-col-span-5">
                  <Reveal delay={80}>
                    <h2
                      className="o-m-0 o-max-w-md o-text-balance"
                      style={{
                        ...affiche('m', 300),
                        fontSize: 'clamp(1.8rem, 4vw, 3.5rem)',
                        lineHeight: 0.96,
                      }}
                    >
                      Huit heures, cinq stations, un seul oculaire.
                    </h2>
                  </Reveal>
                  {/* La frise orbitale ne livre son detail qu au clic : les cinq
                      moments sont donc aussi ecrits, pour qui ne clique pas. */}
                  <ol className="o-m-0 o-mt-10 o-list-none o-p-0">
                    {PROGRAMME.map((etape) => (
                      <li
                        key={etape.id}
                        className="o-grid o-gap-3 o-border-t o-border-white-10 o-py-5 sm:o-grid-cols-12"
                      >
                        <p
                          className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-tabular-nums sm:o-col-span-3"
                          style={{ color: encreSurSombre() }}
                        >
                          {etape.date}
                        </p>
                        <div className="o-min-w-0 sm:o-col-span-9">
                          <p className="o-m-0 o-text-base o-text-zinc-100">
                            {etape.title}
                          </p>
                          <p className="o-m-0 o-mt-2 o-text-sm o-leading-relaxed o-text-zinc-400">
                            {etape.content}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
                <div className="o-min-w-0 o-overflow-hidden lg:o-col-span-7">
                  <OrbitalTimeline
                    steps={PROGRAMME}
                    radius={large ? 176 : 108}
                    rpm={reduced ? 0 : 0.5}
                    label="Le deroulement de la nuit"
                  />
                </div>
              </div>
            </div>
          </section>

          {/* ================= Le compte a rebours ======================== */}
          <section
            id="venir"
            className="o-scroll-mt-24 o-flex o-flex-col o-items-center o-justify-center o-border-t o-border-white-10 o-px-6 o-py-24 md:o-py-32"
            style={{ backgroundColor: accentDoux(700, 8) }}
          >
            <div className="o-mx-auto o-max-w-3xl">
              <CompteARebours />
            </div>
          </section>
        </main>

        {/* ================= Le pied : la carte du monde ================== */}
        <footer className="o-border-t o-border-white-10 o-px-6 o-py-16 md:o-px-12">
          <div className="o-mx-auto o-max-w-6xl">
            <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
              Le reseau — quatre sites, un seul catalogue
            </p>
            <div className="o-mt-8">
              <CarteDuMonde site={site} />
            </div>
            <div className="o-mt-12 o-grid o-gap-8 o-border-t o-border-white-10 o-pt-8 md:o-grid-cols-12">
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400 md:o-col-span-5">
                Coupole — route de Nivoliers, 48150 Hures-la-Parade
                <br />
                Nuits publiques le vendredi, de mars a octobre
              </p>
              <nav
                aria-label="Rubriques"
                className="o-flex o-flex-wrap o-gap-x-8 o-gap-y-3 md:o-col-span-4"
              >
                {(
                  [
                    ['#nuit', 'La nuit'],
                    ['#ciel', 'Le ciel de ce soir'],
                    ['#venir', 'Reserver'],
                    ['mailto:nuits@coupole-observatoire.fr', 'Nous ecrire'],
                  ] as const
                ).map(([cible, mot]) => (
                  <a
                    key={mot}
                    href={cible}
                    className="o-text-sm o-text-zinc-300 o-no-underline o-transition-colors hover:o-text-zinc-50 focus:o-ring"
                  >
                    {mot}
                  </a>
                ))}
              </nav>
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-500 md:o-col-span-3 md:o-text-right">
                © 2026 Coupole
                <br />
                Positions calculees, non mesurees
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
