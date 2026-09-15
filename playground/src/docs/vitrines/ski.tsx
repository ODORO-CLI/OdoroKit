/**
 * Combe — ecole de ski.
 *
 * ## La reference : Aerra (GetLayers)
 *
 * La montagne pleine page, un mot-marque qui tient tout le cadre, et des
 * metadonnees en mono aux bords. Ce qu on lui prend vraiment, c est la
 * **derive** : la photographie recule et s assombrit quand on defile, et elle
 * continue de reculer une demi-seconde apres que la molette s est arretee.
 *
 * ## Le mecanisme : le bulletin
 *
 * Vingt-deux pistes, quatre stations de mesure, huit creneaux de meteo a trois
 * heures. Rien n est illustratif : on choisit son niveau, et la page calcule
 * combien de pistes vous sont ouvertes, quel denivele cumule cela represente,
 * et **a quelle heure monter** — le creneau retenu est celui ou le vent tombe
 * et ou la visibilite revient, apparie a la piste la plus haute qui vous est
 * accessible. Personne n a ecrit ce conseil : il tombe des donnees.
 *
 * ## Une seule photographie, deux fois
 *
 * Le massif n existe pas en dessin : il faut la photographie. Elle revient
 * donc une seconde fois, plus bas, et c est le sujet de la section — la meme
 * combe sous une autre lumiere, que le visiteur regle lui-meme au pointeur.
 * Tout le reste — l echelle d enneigement, la frise des cours, la carte du
 * massif — est trace.
 *
 * @module
 */

import { useMotionState } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import { ArrowDown, ArrowUpRight } from '@odoro-cli/icons/outline'
import { Reveal } from '@odoro-cli/libs/motion'
import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactElement,
} from 'react'

import { GlareHover } from '@/odoro/effect/GlareHover.jsx'
import { ColorShift } from '@/odoro/image/ColorShift.jsx'
import { BlurReveal } from '@/odoro/text/BlurReveal.jsx'

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
} from './marche.jsx'
import { photo } from './media.js'
import { accent, accentDoux, encre } from './palettes.js'
import { Parallaxe, ZoomDefile } from './scene.jsx'

/* ============================ Le domaine =============================== */

/** Une piste du domaine. */
interface Piste {
  readonly nom: string
  readonly couleur: 'verte' | 'bleue' | 'rouge' | 'noire'
  readonly bas: number
  readonly haut: number
  readonly longueur: number
  readonly etat: 'ouverte' | 'damage' | 'fermee'
  readonly note?: string
}

/**
 * Les vingt-deux pistes, relevees au bulletin de 8 h 15.
 *
 * Les altitudes sont celles des bornes de depart et d arrivee ; le denivele
 * d une piste est leur difference, et la page ne le stocke pas — elle le
 * calcule, pour qu une correction d altitude ne laisse pas un total faux.
 */
const PISTES: readonly Piste[] = [
  {
    nom: 'Le Pre',
    couleur: 'verte',
    bas: 1200,
    haut: 1310,
    longueur: 900,
    etat: 'ouverte',
  },
  {
    nom: 'Les Melezes',
    couleur: 'verte',
    bas: 1200,
    haut: 1360,
    longueur: 1200,
    etat: 'ouverte',
  },
  {
    nom: 'Le Ruisseau',
    couleur: 'verte',
    bas: 1240,
    haut: 1390,
    longueur: 1050,
    etat: 'ouverte',
  },
  {
    nom: 'La Clairiere',
    couleur: 'verte',
    bas: 1300,
    haut: 1480,
    longueur: 1400,
    etat: 'damage',
    note: 'Damage jusqu a 10 h',
  },
  {
    nom: 'Le Chalet',
    couleur: 'bleue',
    bas: 1300,
    haut: 1650,
    longueur: 2100,
    etat: 'ouverte',
  },
  {
    nom: 'La Serre',
    couleur: 'bleue',
    bas: 1420,
    haut: 1820,
    longueur: 2400,
    etat: 'ouverte',
  },
  {
    nom: 'Les Crocus',
    couleur: 'bleue',
    bas: 1500,
    haut: 1900,
    longueur: 2200,
    etat: 'ouverte',
  },
  {
    nom: 'Le Pas du Loup',
    couleur: 'bleue',
    bas: 1650,
    haut: 2080,
    longueur: 2700,
    etat: 'ouverte',
  },
  {
    nom: 'La Traverse',
    couleur: 'bleue',
    bas: 1780,
    haut: 2120,
    longueur: 3100,
    etat: 'ouverte',
  },
  {
    nom: 'Le Grand Vallon',
    couleur: 'bleue',
    bas: 1820,
    haut: 2440,
    longueur: 4200,
    etat: 'ouverte',
  },
  {
    nom: 'La Combe Nord',
    couleur: 'rouge',
    bas: 1650,
    haut: 2380,
    longueur: 3400,
    etat: 'ouverte',
  },
  {
    nom: 'Le Rocher Blanc',
    couleur: 'rouge',
    bas: 1700,
    haut: 2410,
    longueur: 3050,
    etat: 'ouverte',
  },
  {
    nom: 'Les Barres',
    couleur: 'rouge',
    bas: 1880,
    haut: 2460,
    longueur: 2600,
    etat: 'ouverte',
  },
  {
    nom: 'La Vire',
    couleur: 'rouge',
    bas: 1920,
    haut: 2510,
    longueur: 2350,
    etat: 'damage',
    note: 'Ouverture a 11 h',
  },
  {
    nom: 'Le Tunnel',
    couleur: 'rouge',
    bas: 2020,
    haut: 2520,
    longueur: 1900,
    etat: 'ouverte',
  },
  {
    nom: 'Le Torrent',
    couleur: 'rouge',
    bas: 1480,
    haut: 1960,
    longueur: 2200,
    etat: 'fermee',
    note: 'Manque de neige sous 1 600 m',
  },
  {
    nom: 'Le Couloir Sud',
    couleur: 'noire',
    bas: 2100,
    haut: 2590,
    longueur: 1600,
    etat: 'ouverte',
  },
  {
    nom: 'La Face',
    couleur: 'noire',
    bas: 2140,
    haut: 2610,
    longueur: 1450,
    etat: 'ouverte',
  },
  {
    nom: 'Les Cheminees',
    couleur: 'noire',
    bas: 2180,
    haut: 2600,
    longueur: 1300,
    etat: 'fermee',
    note: 'Risque d avalanche 3 sur 5',
  },
  {
    nom: 'Le Dos d Ane',
    couleur: 'noire',
    bas: 2060,
    haut: 2480,
    longueur: 1500,
    etat: 'fermee',
    note: 'Risque d avalanche 3 sur 5',
  },
  {
    nom: 'La Goulotte',
    couleur: 'noire',
    bas: 2240,
    haut: 2620,
    longueur: 1150,
    etat: 'ouverte',
  },
  {
    nom: 'Le Vallon Perdu',
    couleur: 'rouge',
    bas: 1560,
    haut: 2140,
    longueur: 2900,
    etat: 'ouverte',
  },
]

/** Une station de mesure d enneigement, sur l echelle verticale. */
interface Mesure {
  readonly altitude: number
  readonly hauteur: number
  readonly nature: string
}

const NEIGE: readonly Mesure[] = [
  { altitude: 1200, hauteur: 24, nature: 'Neige lourde, fond herbeux' },
  { altitude: 1650, hauteur: 68, nature: 'Neige transformee, bonne tenue' },
  { altitude: 2100, hauteur: 112, nature: 'Neige froide, poudreuse tassee' },
  { altitude: 2600, hauteur: 145, nature: 'Neige ventee, croute par endroits' },
]

/** La limite pluie-neige du jour, en metres. */
const LIMITE = 1480

/** Un creneau du bulletin meteo, a trois heures. */
interface Creneau {
  readonly heure: string
  readonly ciel: 'soleil' | 'voile' | 'couvert' | 'neige'
  readonly temperature: number
  readonly vent: number
  readonly visibilite: number
}

const METEO: readonly Creneau[] = [
  { heure: '7 h', ciel: 'couvert', temperature: -6, vent: 42, visibilite: 0.8 },
  { heure: '9 h', ciel: 'voile', temperature: -5, vent: 34, visibilite: 1.6 },
  { heure: '11 h', ciel: 'soleil', temperature: -2, vent: 15, visibilite: 4 },
  { heure: '13 h', ciel: 'soleil', temperature: 1, vent: 12, visibilite: 5 },
  { heure: '15 h', ciel: 'voile', temperature: 0, vent: 22, visibilite: 3 },
  { heure: '17 h', ciel: 'couvert', temperature: -3, vent: 30, visibilite: 1.2 },
  { heure: '19 h', ciel: 'neige', temperature: -5, vent: 38, visibilite: 0.4 },
  { heure: '21 h', ciel: 'neige', temperature: -7, vent: 44, visibilite: 0.3 },
]

/** Les trois niveaux, et les couleurs de piste qu ils ouvrent. */
const NIVEAUX = [
  { id: 'debutant', mot: 'Premieres descentes', couleurs: ['verte', 'bleue'] as const },
  {
    id: 'intermediaire',
    mot: 'Je descends tout en bleu',
    couleurs: ['verte', 'bleue', 'rouge'] as const,
  },
  {
    id: 'confirme',
    mot: 'Je cherche du raide',
    couleurs: ['bleue', 'rouge', 'noire'] as const,
  },
] as const

/** Les nuances d une couleur de piste, en clair et en sombre. */
const TEINTES: Readonly<Record<Piste['couleur'], string>> = {
  verte: 'var(--o-palette-emerald-500)',
  bleue: 'var(--o-palette-sky-500)',
  rouge: 'var(--o-palette-red-500)',
  noire: 'var(--o-palette-zinc-900)',
}

/* ============================ Les cours ================================ */

/** Un cours de la journee, sur la frise horaire. */
interface Cours {
  readonly nom: string
  readonly debut: number
  readonly fin: number
  readonly moniteur: string
  readonly rendezVous: string
  readonly places: number
}

const COURS: readonly Cours[] = [
  {
    nom: 'Jardin des neiges',
    debut: 9,
    fin: 10.5,
    moniteur: 'Lea M.',
    rendezVous: 'Tapis du Pre',
    places: 4,
  },
  {
    nom: 'Collectif enfants — flocon',
    debut: 9.5,
    fin: 12,
    moniteur: 'Come V.',
    rendezVous: 'Depart telesiege Serre',
    places: 0,
  },
  {
    nom: 'Particulier adulte',
    debut: 11,
    fin: 12.5,
    moniteur: 'Nadia B.',
    rendezVous: 'Front de neige',
    places: 2,
  },
  {
    nom: 'Collectif ados — etoile',
    debut: 13.5,
    fin: 16,
    moniteur: 'Hugo T.',
    rendezVous: 'Gare intermediaire',
    places: 3,
  },
  {
    nom: 'Hors-piste accompagne',
    debut: 13,
    fin: 16.5,
    moniteur: 'Lea M.',
    rendezVous: 'Sommet Grand Vallon',
    places: 1,
  },
  {
    nom: 'Ski de nuit — initiation',
    debut: 18,
    fin: 20,
    moniteur: 'Come V.',
    rendezVous: 'Front de neige',
    places: 6,
  },
]

/** Une heure ecrite court : « 16 h 30 ». */
function heure(valeur: number): string {
  const h = Math.floor(valeur)
  const m = Math.round((valeur - h) * 60)
  return m === 0 ? `${String(h)} h` : `${String(h)} h ${String(m)}`
}

/* ============================ La carte du massif ======================= */

/** Un point de rendez-vous, sur la carte a points du massif. */
interface Lieu {
  readonly x: number
  readonly y: number
  readonly nom: string
  readonly detail: string
}

const LIEUX: readonly Lieu[] = [
  { x: 180, y: 330, nom: 'Front de neige', detail: '1 200 m — bureau de l ecole' },
  { x: 360, y: 236, nom: 'Gare intermediaire', detail: '1 650 m — telecabine' },
  { x: 548, y: 152, nom: 'Sommet Grand Vallon', detail: '2 440 m — table d orientation' },
  { x: 286, y: 392, nom: 'Tapis du Pre', detail: '1 200 m — jardin des neiges' },
]

/**
 * Le relief du massif, en trois masses.
 *
 * Une carte a points ne dit pas la geographie : elle dit ou l on se retrouve.
 * Trois silhouettes suffisent a poser une vallee et deux cretes.
 */
const RELIEFS: readonly string[] = [
  'M40 420 C 120 360, 200 380, 262 318 C 320 258, 380 276, 442 214 C 500 156, 560 118, 624 118 C 676 118, 700 160, 668 200 C 630 248, 556 262, 500 306 C 440 354, 396 404, 320 424 C 240 444, 96 462, 40 420 Z',
  'M240 470 C 320 434, 400 442, 470 398 C 540 354, 596 300, 660 286 C 710 276, 728 318, 698 352 C 660 396, 588 412, 526 446 C 462 480, 380 500, 300 496 C 252 494, 224 484, 240 470 Z',
]

/* ============================ La feuille =============================== */

const STYLE_SKI = 'o-vitrine-ski'

/**
 * Ce que les utilitaires n ont pas : les flocons qui tombent derriere le
 * bulletin, et le trait de l echelle qui se remplit une fois.
 */
const CSS_SKI = [
  '@keyframes o-sk-flocon{0%{transform:translate3d(0,-10%,0);opacity:0}',
  '12%{opacity:0.8}100%{transform:translate3d(var(--o-sk-derive,20px),110vh,0);opacity:0}}',
  '@keyframes o-sk-trait{0%{stroke-dashoffset:var(--o-sk-l,600)}100%{stroke-dashoffset:0}}',
  '@keyframes o-sk-jauge{0%{transform:scaleX(0)}100%{transform:scaleX(1)}}',
  '[data-o-sk-flocon]{animation:o-sk-flocon var(--o-sk-duree,14s) linear var(--o-sk-delai,0s) infinite}',
  '[data-o-sk-trait]{animation:o-sk-trait 1.8s ease-out var(--o-sk-delai,0s) both}',
  '[data-o-sk-jauge]{transform-origin:left center;animation:o-sk-jauge 1.1s cubic-bezier(0.22,1,0.36,1) var(--o-sk-delai,0s) both}',
  '@media (prefers-reduced-motion:reduce){',
  '[data-o-sk-flocon]{animation:none;opacity:0}',
  '[data-o-sk-trait]{animation:none;stroke-dashoffset:0}',
  '[data-o-sk-jauge]{animation:none;transform:none}}',
].join('')

function useFeuilleSki(): void {
  useEffect(() => {
    if (document.getElementById(STYLE_SKI) !== null) return
    const feuille = document.createElement('style')
    feuille.id = STYLE_SKI
    feuille.textContent = CSS_SKI
    document.head.append(feuille)
  }, [])
}

/* ============================ Les dessins ============================== */

/** Une suite stable, pour semer des flocons sans tirer au sort a chaque rendu. */
function graines(nombre: number, germe: number): readonly number[] {
  const suite: number[] = []
  let valeur = germe
  for (let rang = 0; rang < nombre; rang += 1) {
    valeur = (valeur * 1103515245 + 12345) % 2147483648
    suite.push(valeur / 2147483648)
  }
  return suite
}

/** La neige qui tombe, derriere le bulletin. */
function Flocons({
  nombre,
  germe,
}: {
  readonly nombre: number
  readonly germe: number
}): ReactElement {
  const semis = graines(nombre * 3, germe)
  return (
    <div
      aria-hidden="true"
      className="o-pointer-events-none o-absolute o-inset-0 o-overflow-hidden"
    >
      {Array.from({ length: nombre }, (_, rang) => {
        const taille = 3 + (semis[rang * 3] ?? 0) * 5
        return (
          <span
            key={rang}
            data-o-sk-flocon=""
            className="o-absolute o-block o-rounded-full o-bg-white"
            style={
              {
                left: `${String(((semis[rang * 3 + 1] ?? 0) * 100).toFixed(2))}%`,
                top: 0,
                width: taille,
                height: taille,
                opacity: 0.5,
                '--o-sk-duree': `${String(10 + (semis[rang * 3 + 2] ?? 0) * 12)}s`,
                '--o-sk-delai': `${String(-rang * 1.1)}s`,
                '--o-sk-derive': `${String(Math.round(((semis[rang * 3] ?? 0) - 0.5) * 120))}px`,
              } as CSSProperties
            }
          />
        )
      })}
    </div>
  )
}

/**
 * L echelle d enneigement : la forme C15 de la fiche.
 *
 * Une echelle verticale graduee, la valeur posee dessus. La limite
 * pluie-neige est tracee a sa vraie altitude, et c est elle qui explique
 * pourquoi la piste du bas est fermee.
 */
function Echelle(): ReactElement {
  const haut = 2700
  const bas = 1100
  const y = (altitude: number): number => 40 + ((haut - altitude) / (haut - bas)) * 520
  const maxNeige = Math.max(...NEIGE.map((m) => m.hauteur))

  return (
    <svg
      viewBox="0 0 560 620"
      className="o-h-auto o-w-full"
      role="img"
      aria-label="Enneigement par altitude, de 1 200 a 2 600 metres, et limite pluie-neige a 1 480 metres"
    >
      {/* Le montant de l echelle, et ses graduations de cent metres. */}
      <path d="M92 30V580" stroke="var(--o-theme-fg)" strokeWidth="2" />
      {Array.from({ length: 17 }, (_, rang) => {
        const altitude = bas + rang * 100
        const majeur = altitude % 500 === 0
        return (
          <g key={altitude}>
            <path
              d={`M${String(majeur ? 74 : 84)} ${String(y(altitude))}H92`}
              stroke={majeur ? 'var(--o-theme-fg)' : accentDoux(700, 40)}
              strokeWidth="1"
            />
            {majeur && (
              <text
                x="66"
                y={y(altitude) + 5}
                fontSize="15"
                textAnchor="end"
                fill="currentColor"
                style={{
                  fontFamily: 'var(--o-font-mono)',
                  color: 'var(--o-theme-muted)',
                }}
              >
                {String(altitude)}
              </text>
            )}
          </g>
        )
      })}

      {/* La limite pluie-neige : la ligne qui explique le bas du domaine. */}
      <path
        d={`M92 ${String(y(LIMITE))}H540`}
        stroke={accent(500)}
        strokeWidth="1.5"
        strokeDasharray="6 6"
      />
      <text
        x="540"
        y={y(LIMITE) + 22}
        fontSize="15"
        textAnchor="end"
        fill="currentColor"
        style={{
          fontFamily: 'var(--o-font-mono)',
          letterSpacing: '0.1em',
          color: encre(),
        }}
      >
        LIMITE PLUIE-NEIGE 1 480 M
      </text>

      {/* Les quatre mesures, posees sur l echelle. */}
      {NEIGE.map((mesure, rang) => {
        const largeur = 70 + (mesure.hauteur / maxNeige) * 300
        return (
          <g key={mesure.altitude}>
            <rect
              data-o-sk-jauge=""
              x="92"
              y={y(mesure.altitude) - 17}
              width={largeur}
              height="34"
              fill={accentDoux(400, 26 + rang * 14)}
              style={
                {
                  transformOrigin: `92px ${String(y(mesure.altitude))}px`,
                  '--o-sk-delai': `${String((rang * 0.12).toFixed(2))}s`,
                } as CSSProperties
              }
            />
            <text
              x={110}
              y={y(mesure.altitude) + 7}
              fontSize="21"
              fill="currentColor"
              style={{ fontFamily: 'var(--o-font-mono)', color: 'var(--o-theme-fg)' }}
            >
              {String(mesure.hauteur)} cm
            </text>
            <text
              x={110}
              y={y(mesure.altitude) + 34}
              fontSize="14"
              fill="currentColor"
              style={{ fontFamily: 'var(--o-font-mono)', color: 'var(--o-theme-muted)' }}
            >
              {mesure.nature}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/** Le pictogramme d un ciel, au trait. */
function Ciel({
  genre,
  couleur,
}: {
  readonly genre: Creneau['ciel']
  readonly couleur: string
}): ReactElement {
  return (
    <svg
      viewBox="0 0 40 30"
      width="34"
      height="26"
      aria-hidden="true"
      fill="none"
      stroke={couleur}
      strokeWidth="1.8"
      strokeLinecap="round"
    >
      {genre === 'soleil' && (
        <>
          <circle cx="20" cy="15" r="6.5" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => {
            const r = (angle * Math.PI) / 180
            return (
              <path
                key={angle}
                d={`M${String(20 + Math.cos(r) * 10)} ${String(15 + Math.sin(r) * 10)}L${String(20 + Math.cos(r) * 13)} ${String(15 + Math.sin(r) * 13)}`}
              />
            )
          })}
        </>
      )}
      {genre === 'voile' && (
        <>
          <circle cx="16" cy="12" r="5.5" />
          <path d="M8 21h24M12 25h20" />
        </>
      )}
      {genre === 'couvert' && (
        <path d="M9 19a6 6 0 0 1 5-8 8 8 0 0 1 15 2 5 5 0 0 1-1 10H13a5 5 0 0 1-4-4Z" />
      )}
      {genre === 'neige' && (
        <>
          <path d="M9 15a6 6 0 0 1 5-8 8 8 0 0 1 15 2 5 5 0 0 1-1 10H13a5 5 0 0 1-4-4Z" />
          <path d="M14 24v2M20 25v2M26 24v2" />
        </>
      )}
    </svg>
  )
}

/* ============================ Le bulletin : le mecanisme =============== */

/** Le bulletin du jour, pour le niveau demande. */
function Bulletin(): ReactElement {
  const [niveau, setNiveau] = useState<(typeof NIVEAUX)[number]['id']>('intermediaire')
  const choix = NIVEAUX.find((n) => n.id === niveau) ?? NIVEAUX[1]

  const releve = useMemo(() => {
    const couleurs: readonly string[] = choix?.couleurs ?? []
    const miennes = PISTES.filter((p) => couleurs.includes(p.couleur))
    const ouvertes = miennes.filter((p) => p.etat === 'ouverte')
    const denivele = ouvertes.reduce((somme, p) => somme + (p.haut - p.bas), 0)
    const longueur = ouvertes.reduce((somme, p) => somme + p.longueur, 0)

    // Le creneau conseille : celui dont la visibilite passe et dont le vent
    // est le plus faible. Aucun creneau n est ecrit d avance comme « le bon ».
    const jour = METEO.filter(
      (c) => Number.parseInt(c.heure, 10) >= 9 && Number.parseInt(c.heure, 10) <= 17,
    )
    const meilleur = [...jour].sort(
      (a, b) => b.visibilite - a.visibilite || a.vent - b.vent,
    )[0]

    // La piste conseillee : la plus haute qui vous soit ouverte a ce moment.
    const sommet = [...ouvertes].sort((a, b) => b.haut - a.haut)[0]

    return { miennes, ouvertes, denivele, longueur, meilleur, sommet }
  }, [choix])

  const conseil =
    releve.meilleur === undefined || releve.sommet === undefined
      ? 'Aucune piste de votre niveau n est ouverte aujourd hui.'
      : `Montez a ${releve.sommet.nom} vers ${releve.meilleur.heure} : le vent tombe a ${String(releve.meilleur.vent)} km/h et la visibilite repasse a ${String(releve.meilleur.visibilite).replace('.', ',')} km.`

  return (
    <div>
      {/* ------- Le niveau ------- */}
      <div className="o-flex o-flex-wrap o-items-center o-gap-3">
        <p className="o-m-0 o-mr-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
          Votre niveau
        </p>
        {NIVEAUX.map((cible) => {
          const actif = cible.id === niveau
          return (
            <button
              key={cible.id}
              type="button"
              aria-pressed={actif}
              onClick={() => {
                setNiveau(cible.id)
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
              {cible.mot}
            </button>
          )
        })}
      </div>

      {/* ------- Ce que cela ouvre ------- */}
      <dl
        className="o-m-0 o-mt-10 o-grid o-gap-px sm:o-grid-cols-3"
        style={{ backgroundColor: accentDoux(700, 18) }}
      >
        {[
          [
            `Pistes ouvertes sur ${String(releve.miennes.length)} de votre niveau`,
            String(releve.ouvertes.length),
          ],
          ['Denivele cumule', `${releve.denivele.toLocaleString('fr-FR')} m`],
          [
            'Longueur cumulee',
            `${(releve.longueur / 1000).toFixed(1).replace('.', ',')} km`,
          ],
        ].map(([quoi, valeur]) => (
          <div key={quoi} className="o-bg-zinc-50 dark:o-bg-zinc-950 o-px-6 o-py-6">
            <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
              {quoi}
            </dt>
            <dd
              className="o-m-0 o-mt-3 o-tabular-nums o-text-zinc-950 dark:o-text-zinc-50"
              style={{
                ...affiche('m', 300),
                fontSize: 'clamp(1.75rem, 3.4vw, 2.75rem)',
                lineHeight: 1,
              }}
            >
              {valeur}
            </dd>
          </div>
        ))}
      </dl>

      {/* ------- Le conseil, qui tombe des donnees ------- */}
      <div className="o-mt-10 o-rounded-2xl o-p-8" style={nuit('slate')}>
        <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
          Le conseil du bureau, calcule a 8 h 15
        </p>
        <BlurReveal
          as="p"
          step={70}
          blur={9}
          duration={640}
          className="o-m-0 o-mt-4 o-max-w-2xl o-text-zinc-50"
          style={{
            ...affiche('m', 300),
            fontSize: 'clamp(1.25rem, 2.8vw, 2rem)',
            lineHeight: 1.12,
          }}
        >
          {conseil}
        </BlurReveal>
      </div>

      {/* ------- Les pistes ------- */}
      <div className="o-mt-14">
        <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
          Les pistes de votre niveau — releve de 8 h 15
        </p>
        <ul className="o-m-0 o-mt-6 o-list-none o-border-t o-border-black-10 dark:o-border-zinc-800 o-p-0">
          {releve.miennes.map((piste) => (
            <li
              key={piste.nom}
              className="o-border-b o-border-black-10 dark:o-border-zinc-800"
            >
              <GlareHover duration={900} width={18} className="o-block">
                <div className="o-flex o-flex-wrap o-items-baseline o-gap-x-6 o-gap-y-2 o-py-4">
                  <span
                    aria-hidden="true"
                    className="o-size-3 o-shrink-0 o-rounded-full"
                    style={{
                      backgroundColor: TEINTES[piste.couleur],
                      outline:
                        piste.couleur === 'noire'
                          ? '1px solid var(--o-theme-line)'
                          : undefined,
                    }}
                  />
                  <span className="o-min-w-0 o-grow o-text-base o-text-zinc-950 dark:o-text-zinc-50">
                    <span className="o-sr-only">Piste {piste.couleur} — </span>
                    {piste.nom}
                  </span>
                  <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-tabular-nums o-text-zinc-500 dark:o-text-zinc-400">
                    {String(piste.bas)} — {String(piste.haut)} m ·{' '}
                    {(piste.longueur / 1000).toFixed(1).replace('.', ',')} km
                  </span>
                  <span
                    className="o-font-mono o-text-xs o-uppercase o-tracking-widest"
                    style={{
                      color: piste.etat === 'ouverte' ? encre() : 'var(--o-theme-muted)',
                    }}
                  >
                    {piste.etat === 'ouverte' ? 'Ouverte' : (piste.note ?? 'Fermee')}
                  </span>
                </div>
              </GlareHover>
            </li>
          ))}
        </ul>
      </div>

      {/* ------- La meteo a trois heures ------- */}
      <div className="o-mt-14">
        <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
          La meteo du col, a trois heures
        </p>
        <div className="o-mt-6 o-overflow-x-auto" style={{ overflowY: 'hidden' }}>
          <div
            className="o-flex o-gap-px"
            style={{ minWidth: 700, backgroundColor: accentDoux(700, 18) }}
          >
            {METEO.map((creneau) => {
              const retenu = creneau.heure === releve.meilleur?.heure
              return (
                <div
                  key={creneau.heure}
                  className="o-grow o-px-4 o-py-5"
                  style={{
                    backgroundColor: retenu ? accentDoux(400, 30) : 'var(--o-theme-bg)',
                    outline: retenu ? `2px solid ${encre()}` : undefined,
                    outlineOffset: -2,
                  }}
                >
                  <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                    {creneau.heure}
                  </p>
                  <div className="o-mt-3" style={{ color: encre() }}>
                    <Ciel genre={creneau.ciel} couleur="currentColor" />
                  </div>
                  <p className="o-m-0 o-mt-3 o-text-lg o-tabular-nums o-text-zinc-950 dark:o-text-zinc-50">
                    {String(creneau.temperature)} °C
                  </p>
                  <p className="o-m-0 o-mt-1 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                    {String(creneau.vent)} km/h
                    <br />
                    {String(creneau.visibilite).replace('.', ',')} km
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============================ La page ================================== */

const NAVIGATION = [
  ['#bulletin', 'Le bulletin'],
  ['#lumiere', 'La combe'],
  ['#cours', 'Les cours'],
] as const

export default function Page(): ReactElement {
  const polices = usePolices('bricolage')
  useFeuilleSki()
  const { reduced } = useMotionState()
  const [cours, setCours] = useState(COURS[4]?.nom ?? '')
  const retenu = COURS.find((c) => c.nom === cours) ?? COURS[4]

  const debutFrise = 8.5
  const finFrise = 20.5

  const massif = photo('bivouac-ecrins', 1600, 1067)

  return (
    <Porte forme="compteur" marque="Combe" sombre={false}>
      <div
        className="o-bg-zinc-50 dark:o-bg-zinc-950 o-text-zinc-900 dark:o-text-zinc-50"
        style={polices}
      >
        {/* ================= L ouverture : la montagne qui recule ========= */}
        <ZoomDefile
          de={1.14}
          a={1}
          assombrir={0.55}
          glisse={0.7}
          className="o-isolate"
          style={{ ...nuit('slate'), minHeight: `calc(100vh - ${String(CHROME)}px)` }}
          fond={
            <img
              src={massif}
              alt="Les cretes enneigees du massif, vues du col au petit matin"
              className="o-size-full o-object-cover"
            />
          }
        >
          <Voile sens="haut-bas" famille="slate" />
          <Grain opacite={0.05} />
          <BarreGelule
            marque="Combe"
            liens={NAVIGATION}
            action={['#cours', 'Reserver']}
          />

          <div
            className="o-relative o-z-20 o-flex o-flex-col o-justify-between o-gap-12 o-px-6 o-pb-16 o-pt-32 md:o-px-10"
            style={{ minHeight: `calc(100vh - ${String(CHROME)}px)` }}
          >
            <div>
              <Surgit>
                <Etiquette>
                  Ecole de ski — massif du Grand Vallon — 1 200 a 2 620 m
                </Etiquette>
              </Surgit>
              <TitreVague
                delai={140}
                className="o-m-0 o-mt-8 o-max-w-4xl o-text-zinc-50"
                style={{
                  ...affiche('l', 300),
                  fontSize: 'clamp(3rem, 12vw, 11rem)',
                  letterSpacing: '-0.05em',
                }}
              >
                Combe
              </TitreVague>
            </div>

            <div className="o-flex o-flex-wrap o-items-end o-justify-between o-gap-8">
              <Surgit
                delai={520}
                as="p"
                className="o-m-0 o-max-w-md o-text-base o-leading-relaxed o-text-zinc-200"
              >
                Six moniteurs, vingt-deux pistes, et un bulletin qui ne vous dit pas que
                tout va bien : il vous dit ce qui est ouvert pour vous, et a quelle heure
                monter.
              </Surgit>
              <Surgit delai={640}>
                <a
                  href="#bulletin"
                  className="o-inline-flex o-items-center o-gap-3 o-rounded-full o-border-w-1 o-border-white-20 o-bg-white-10 o-px-6 o-py-3 o-text-sm o-font-semibold o-text-white o-no-underline o-backdrop-blur-md o-transition-colors hover:o-bg-white-20 focus:o-ring"
                >
                  Lire le bulletin du jour
                  <Icon icon={ArrowDown} size={16} aria-hidden="true" />
                </a>
              </Surgit>
            </div>

            {/*
              Les metadonnees tiennent le coin haut droit, le seul vide du
              cadre : en bas, elles tombaient sur le paragraphe et la gelule.
            */}
            <Coin position="hd">
              Bulletin de 8 h 15 — 18 pistes sur 22
              <br />
              Limite pluie-neige 1 480 m · avalanche 3 sur 5
            </Coin>
          </div>
        </ZoomDefile>

        {/* ================= Le bulletin : le mecanisme =================== */}
        <section
          id="bulletin"
          className="o-relative o-scroll-mt-24 o-overflow-hidden o-px-6 o-py-24 md:o-px-10 md:o-py-32"
        >
          {!reduced && <Flocons nombre={22} germe={4441} />}
          <div className="o-relative o-mx-auto o-max-w-6xl">
            <Reveal>
              <Indice rang="01" sombre={false}>
                Le bulletin
              </Indice>
            </Reveal>
            <Reveal delay={80}>
              <h2
                className="o-m-0 o-mt-6 o-max-w-3xl o-text-zinc-950 dark:o-text-zinc-50"
                style={{
                  ...affiche('m', 300),
                  fontSize: 'clamp(1.85rem, 4.4vw, 3.75rem)',
                  lineHeight: 0.94,
                  letterSpacing: '-0.03em',
                }}
              >
                Ce qui est skiable, pour vous, ce matin.
              </h2>
            </Reveal>

            <div className="o-mt-14 o-grid o-gap-12 lg:o-grid-cols-12 lg:o-gap-16">
              {/* L echelle d enneigement derive plus lentement que le reste. */}
              <div className="lg:o-col-span-5">
                <Parallaxe vitesse={0.1} glisse={0.8}>
                  <Echelle />
                </Parallaxe>
              </div>
              <div className="lg:o-col-span-7">
                <Bulletin />
              </div>
            </div>
          </div>
        </section>

        {/* ================= La lumiere : la meme combe autrement ========= */}
        <section
          id="lumiere"
          className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
          style={nuit('slate')}
        >
          <div className="o-mx-auto o-max-w-6xl">
            <Reveal>
              <Indice rang="02">La combe</Indice>
            </Reveal>
            <Reveal delay={80}>
              <h2
                className="o-m-0 o-mt-6 o-max-w-3xl o-text-zinc-50"
                style={{
                  ...affiche('m', 300),
                  fontSize: 'clamp(1.85rem, 4.2vw, 3.5rem)',
                  lineHeight: 0.96,
                  letterSpacing: '-0.03em',
                }}
              >
                La pente ne change pas. La lumiere, si.
              </h2>
            </Reveal>
            <p className="o-m-0 o-mt-6 o-max-w-xl o-text-base o-leading-relaxed o-text-zinc-300">
              Lire une neige, c est lire une lumiere. Promenez le pointeur sur la face : a
              gauche le petit matin bleu, a droite le couchant, en haut la lumiere dure de
              midi, en bas le jour blanc dans lequel on ne voit plus une bosse.
            </p>

            <Parallaxe vitesse={0.08} glisse={0.78} className="o-mt-14">
              <ColorShift
                src={massif}
                alt="La face nord du massif, cretes et couloirs enneiges"
                ratio={1.5}
                shift={120}
                saturate={1.5}
                className="o-overflow-hidden o-rounded-2xl"
              />
            </Parallaxe>
            <p className="o-m-0 o-mt-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
              La face nord depuis la table d orientation — les trois couloirs noirs sont a
              droite du sommet
            </p>
          </div>
        </section>

        {/* ================= Les cours : la frise de la journee (A23) ===== */}
        <section
          id="cours"
          className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
        >
          <div className="o-mx-auto o-max-w-6xl">
            <Reveal>
              <Indice rang="03" sombre={false}>
                Les cours
              </Indice>
            </Reveal>
            <Reveal delay={80}>
              <h2
                className="o-m-0 o-mt-6 o-max-w-2xl o-text-zinc-950 dark:o-text-zinc-50"
                style={{
                  ...affiche('m', 300),
                  fontSize: 'clamp(1.85rem, 4vw, 3.25rem)',
                  lineHeight: 0.96,
                  letterSpacing: '-0.03em',
                }}
              >
                Six moniteurs, une journee, et les places qui restent.
              </h2>
            </Reveal>

            {/* La frise : l heure en abscisse, un cours par ligne, l initiale
                du moniteur dans la barre — c est ce qu on cherche d abord. */}
            <div className="o-mt-14 o-overflow-x-auto" style={{ overflowY: 'hidden' }}>
              <div style={{ minWidth: 720 }}>
                <div className="o-flex o-border-b o-border-black-10 dark:o-border-zinc-800 o-pb-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                  {[9, 11, 13, 15, 17, 19].map((h) => (
                    <span key={h} className="o-grow">
                      {h} h
                    </span>
                  ))}
                  <span>21 h</span>
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
                        className="o-relative o-border-b o-border-black-10 dark:o-border-zinc-800"
                        style={{ height: 72 }}
                      >
                        <button
                          type="button"
                          disabled={!libre}
                          aria-pressed={choisi}
                          onClick={() => {
                            setCours(seance.nom)
                          }}
                          className="o-absolute o-flex o-flex-col o-justify-center o-gap-1 o-overflow-hidden o-rounded-xl o-px-4 o-text-left o-transition-colors focus:o-ring"
                          style={{
                            left: `${String(gauche.toFixed(2))}%`,
                            width: `${String(large.toFixed(2))}%`,
                            minWidth: 150,
                            top: 10,
                            height: 52,
                            border: 0,
                            cursor: libre ? 'pointer' : 'not-allowed',
                            backgroundColor: choisi
                              ? encre()
                              : libre
                                ? accentDoux(300, 34)
                                : 'var(--o-theme-surface)',
                            color: choisi
                              ? 'var(--o-theme-bg)'
                              : libre
                                ? 'var(--o-theme-fg)'
                                : 'var(--o-theme-muted)',
                          }}
                        >
                          <span className="o-truncate o-text-sm">{seance.nom}</span>
                          <span className="o-truncate o-font-mono o-text-xs o-uppercase o-tracking-widest">
                            {seance.moniteur} ·{' '}
                            {libre ? `${String(seance.places)} places` : 'complet'}
                          </span>
                        </button>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </div>

            <div className="o-mt-10 o-grid o-gap-8 md:o-grid-cols-12">
              <div className="md:o-col-span-7">
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                  Cours retenu
                </p>
                <p
                  className="o-m-0 o-mt-3 o-text-zinc-950 dark:o-text-zinc-50"
                  aria-live="polite"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.35rem, 3vw, 2.25rem)',
                    lineHeight: 1.04,
                  }}
                >
                  {retenu?.nom ?? ''} — {heure(retenu?.debut ?? 0)} a{' '}
                  {heure(retenu?.fin ?? 0)}
                </p>
                <p className="o-m-0 o-mt-4 o-max-w-md o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                  Avec {retenu?.moniteur ?? ''}. Rendez-vous {retenu?.rendezVous ?? ''},
                  dix minutes avant, skis aux pieds et forfait en poche.
                </p>
              </div>
              <div className="md:o-col-span-5 md:o-flex md:o-items-end md:o-justify-end">
                <a
                  href="#cours"
                  className="o-inline-flex o-items-center o-gap-2 o-rounded-full o-px-7 o-py-4 o-text-sm o-font-semibold o-no-underline o-transition-transform hover:o-scale-105 focus:o-ring"
                  style={{ backgroundColor: encre(), color: 'var(--o-theme-bg)' }}
                >
                  Reserver ce cours{' '}
                  <Icon icon={ArrowUpRight} size={15} aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ================= Le pied : la carte a points du massif (P24) == */}
        <footer className="o-border-t o-border-black-10 dark:o-border-zinc-800 o-px-6 o-py-16 md:o-px-10">
          <div className="o-mx-auto o-max-w-6xl">
            <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
              Les quatre points de rendez-vous du massif
            </p>
            <div className="o-mt-8 o-overflow-x-auto" style={{ overflowY: 'hidden' }}>
              <svg
                viewBox="0 0 760 520"
                className="o-h-auto"
                style={{ minWidth: 600, width: '100%', maxWidth: 860 }}
                role="img"
                aria-label="Carte du massif : front de neige, tapis du Pre, gare intermediaire et sommet du Grand Vallon"
              >
                <defs>
                  <pattern
                    id="o-sk-points"
                    width="12"
                    height="12"
                    patternUnits="userSpaceOnUse"
                  >
                    <circle cx="6" cy="6" r="2" fill={accentDoux(600, 42)} />
                  </pattern>
                  <clipPath id="o-sk-relief">
                    {RELIEFS.map((relief) => (
                      <path key={relief.slice(0, 16)} d={relief} />
                    ))}
                  </clipPath>
                </defs>
                <rect
                  width="760"
                  height="520"
                  fill="url(#o-sk-points)"
                  clipPath="url(#o-sk-relief)"
                />

                {/* La ligne de la telecabine : du bas au sommet. */}
                <path
                  data-o-sk-trait=""
                  d="M180 330 L360 236 L548 152"
                  fill="none"
                  stroke={accent(500)}
                  strokeWidth="2.5"
                  strokeDasharray="600"
                  pathLength={600}
                  style={{ '--o-sk-l': 600 } as CSSProperties}
                />

                {LIEUX.map((lieu) => {
                  const aGauche = lieu.x > 430
                  return (
                    <g key={lieu.nom}>
                      <circle
                        cx={lieu.x}
                        cy={lieu.y}
                        r="7"
                        fill="var(--o-theme-bg)"
                        stroke={accent(500)}
                        strokeWidth="3"
                      />
                      <text
                        x={lieu.x + (aGauche ? -16 : 16)}
                        y={lieu.y + 1}
                        fontSize="16"
                        textAnchor={aGauche ? 'end' : 'start'}
                        fill="currentColor"
                        style={{
                          fontFamily: 'var(--o-font-mono)',
                          letterSpacing: '0.1em',
                          color: 'var(--o-theme-fg)',
                        }}
                      >
                        {lieu.nom}
                      </text>
                      <text
                        x={lieu.x + (aGauche ? -16 : 16)}
                        y={lieu.y + 21}
                        fontSize="13"
                        textAnchor={aGauche ? 'end' : 'start'}
                        fill="currentColor"
                        style={{
                          fontFamily: 'var(--o-font-mono)',
                          letterSpacing: '0.08em',
                          color: 'var(--o-theme-muted)',
                        }}
                      >
                        {lieu.detail}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>

            <div className="o-mt-10 o-grid o-gap-8 o-border-t o-border-black-10 dark:o-border-zinc-800 o-pt-8 sm:o-grid-cols-3">
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400">
                Ecole de ski Combe
                <br />
                Front de neige, 1 200 m
                <br />
                Bureau ouvert 8 h 15 — 17 h 30
              </p>
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400">
                Six moniteurs diplomes
                <br />
                Cours en francais, anglais et italien
                <br />
                Materiel non fourni
              </p>
              <nav aria-label="Liens utiles">
                <ul className="o-m-0 o-list-none o-space-y-2 o-p-0">
                  {[
                    'Tarifs des cours',
                    'Forfaits du domaine',
                    'Securite et avalanches',
                    'Nous ecrire',
                  ].map((lien) => (
                    <li key={lien}>
                      <a
                        href="#bulletin"
                        className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400 o-no-underline o-transition-colors hover:o-text-zinc-950 dark:hover:o-text-zinc-50 focus:o-ring"
                      >
                        {lien}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
            <p className="o-m-0 o-mt-10 o-border-t o-border-black-10 dark:o-border-zinc-800 o-pt-5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
              Ecole de ski Combe — © 2026. Enneigement et meteo releves a 8 h 15 par le
              service des pistes ; le bulletin fait foi sur le domaine.
            </p>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
