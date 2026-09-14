/**
 * Verre & Monture — opticien, rue de Turbigo, Paris 3.
 *
 * ## La reference : Kimi
 *
 * Un blanc clinique, une encre presque noire, des **equerres de reperage** aux
 * coins plutot que des bordures, des cotes en millimetres partout. Un opticien
 * mesure : la page mesure aussi.
 *
 * ## Le mecanisme : l essai
 *
 * Six formes de visage dessinees, six montures dessinees, et la monture se
 * **pose sur le visage a la bonne echelle**. Rien n est approximatif :
 *
 * - la largeur frontale d une monture vaut deux verres, le pont et les deux
 *   tenons — la page la compare a la largeur du visage et dit de combien elle
 *   deborde, en millimetres ;
 * - l ecart entre centres optiques vaut le verre plus le pont ; compare a
 *   l ecart pupillaire du visiteur, il donne le **decentrement** a faire, et
 *   donc l epaisseur qu on ajoute ;
 * - le verdict forme par forme est celui du metier : on contrarie la forme du
 *   visage, on ne la repete pas.
 *
 * L ecart pupillaire se regle au curseur et se lit sur un **cadran a aiguille**
 * dessine (C12) — le chiffre de la page est celui-la, et pas une barre de
 * quatre nombres.
 *
 * ## Ce que la page ne charge pas
 *
 * Aucune photographie, aucune scene graphique : un visage photographie serait
 * le visage de quelqu un, et une monture en volume couterait un mega-octet
 * pour montrer six traits. Tout est en SVG, et tout est cote.
 *
 * @module
 */

import { useMotionState } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import { ArrowRight, ArrowUpRight } from '@odoro-cli/icons/filaire'
import { Reveal } from '@odoro-cli/libs/motion'
import { useMemo, useState, type ReactElement, type ReactNode } from 'react'

import { GlareHover } from '@/odoro/effect/GlareHover.jsx'
import { TrueFocus } from '@/odoro/text/TrueFocus.jsx'
import { CursorRing } from '@/odoro/effect/CursorRing.jsx'
import { ElasticSlider } from '@/odoro/ui/ElasticSlider.jsx'

import { nuit } from './communs.jsx'
import {
  affiche,
  BarreCoins,
  CHROME,
  Coin,
  Etiquette,
  Indice,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
  type Lien,
} from './marche.jsx'
import { accent, accentDoux, aplat, encre, encreSurSombre } from './palettes.js'
import { Aimant } from './scene.jsx'

/** La hauteur d un ecran sous les barres de la documentation. */
const ECRAN = `calc(100vh - ${String(CHROME)}px)`

/** Les rubriques de la barre. */
const NAVIGATION: readonly Lien[] = [
  ['#essai', 'L essai'],
  ['#ecart', 'L ecart'],
  ['#verres', 'Les verres'],
  ['#carte', 'La carte'],
]

/* ============================ Les visages ============================== */

/** Une forme de visage, son trace et sa largeur reelle aux pommettes. */
interface Morphologie {
  readonly id: string
  readonly nom: string
  /** Largeur aux pommettes, en millimetres. */
  readonly largeur: number
  /** Le contour, dans un repere de 200 sur 264. */
  readonly trace: string
  readonly conseil: string
  /** Les formes de monture qui vont — et celles qui ne vont pas. */
  readonly bonnes: readonly string[]
  readonly mauvaises: readonly string[]
}

/**
 * Les six formes.
 *
 * Les contours sont dessines pour que les pommettes tombent toutes entre
 * x = 40 et x = 160 : cent vingt unites du repere valent donc la largeur reelle
 * du visage, et c est ce rapport qui met la monture a l echelle.
 */
const VISAGES: readonly Morphologie[] = [
  {
    id: 'ovale',
    nom: 'Ovale',
    largeur: 137,
    trace:
      'M100 20 C136 20 160 56 160 110 C160 176 130 244 100 244 C70 244 40 176 40 110 C40 56 64 20 100 20 Z',
    conseil:
      'La forme qui accepte tout. On choisit alors par le gout, pas par la geometrie.',
    bonnes: ['rectangulaire', 'ronde', 'papillon', 'aviateur', 'carree', 'ovale'],
    mauvaises: [],
  },
  {
    id: 'rond',
    nom: 'Rond',
    largeur: 142,
    trace:
      'M100 22 C142 22 160 60 160 120 C160 180 136 242 100 242 C64 242 40 180 40 120 C40 60 58 22 100 22 Z',
    conseil:
      'On contrarie : des angles, une monture plus large que haute, un dessus marque.',
    bonnes: ['rectangulaire', 'carree', 'papillon'],
    mauvaises: ['ronde', 'ovale'],
  },
  {
    id: 'carre',
    nom: 'Carre',
    largeur: 145,
    trace:
      'M44 34 C44 26 52 24 62 24 H138 C148 24 156 26 156 34 V152 C156 206 136 242 100 242 C64 242 44 206 44 152 Z',
    conseil: 'La machoire est marquee : on adoucit avec des courbes et une monture fine.',
    bonnes: ['ronde', 'ovale', 'aviateur'],
    mauvaises: ['carree', 'rectangulaire'],
  },
  {
    id: 'rectangle',
    nom: 'Rectangle',
    largeur: 133,
    trace:
      'M52 26 C52 22 60 20 70 20 H130 C140 20 148 22 148 26 V166 C148 218 130 250 100 250 C70 250 52 218 52 166 Z',
    conseil: 'Le visage est long : une monture haute le coupe et le raccourcit.',
    bonnes: ['carree', 'papillon', 'aviateur'],
    mauvaises: ['ovale', 'ronde'],
  },
  {
    id: 'coeur',
    nom: 'Coeur',
    largeur: 140,
    trace:
      'M42 46 C42 30 60 22 100 22 C140 22 158 30 158 46 L150 140 C142 200 122 244 100 244 C78 244 58 200 50 140 Z',
    conseil:
      'Le front porte, le menton est fin : une monture legere, plus lourde en bas qu en haut.',
    bonnes: ['ovale', 'ronde', 'aviateur'],
    mauvaises: ['papillon'],
  },
  {
    id: 'diamant',
    nom: 'Diamant',
    largeur: 136,
    trace:
      'M100 20 C122 20 134 48 144 96 C154 148 128 246 100 246 C72 246 46 148 56 96 C66 48 78 20 100 20 Z',
    conseil:
      'Les pommettes sont le point large : on elargit le front avec un dessus dessine.',
    bonnes: ['papillon', 'ovale', 'ronde'],
    mauvaises: ['rectangulaire'],
  },
]

/* ============================ Les montures ============================= */

/** Une monture de la vitrine, avec ses cotes de catalogue. */
interface Monture {
  readonly id: string
  readonly nom: string
  readonly forme: string
  /** Largeur d un verre (cote A du systeme boxing), en millimetres. */
  readonly verre: number
  /** Hauteur d un verre (cote B), en millimetres. */
  readonly hauteur: number
  /** Pont (DBL), en millimetres. */
  readonly pont: number
  /** Longueur de branche, en millimetres. */
  readonly branche: number
  readonly matiere: string
  readonly prix: string
}

const VITRINE: readonly Monture[] = [
  {
    id: 'turbigo',
    nom: 'Turbigo',
    forme: 'rectangulaire',
    verre: 52,
    hauteur: 38,
    pont: 18,
    branche: 145,
    matiere: 'Acetate ecaille',
    prix: '185 EUR',
  },
  {
    id: 'volta',
    nom: 'Volta',
    forme: 'ronde',
    verre: 47,
    hauteur: 45,
    pont: 21,
    branche: 145,
    matiere: 'Metal dore mat',
    prix: '210 EUR',
  },
  {
    id: 'sedaine',
    nom: 'Sedaine',
    forme: 'papillon',
    verre: 54,
    hauteur: 42,
    pont: 17,
    branche: 140,
    matiere: 'Acetate miel',
    prix: '245 EUR',
  },
  {
    id: 'charonne',
    nom: 'Charonne',
    forme: 'carree',
    verre: 50,
    hauteur: 44,
    pont: 20,
    branche: 145,
    matiere: 'Acetate noir',
    prix: '165 EUR',
  },
  {
    id: 'laumiere',
    nom: 'Laumiere',
    forme: 'aviateur',
    verre: 56,
    hauteur: 46,
    pont: 16,
    branche: 145,
    matiere: 'Metal argent',
    prix: '230 EUR',
  },
  {
    id: 'buci',
    nom: 'Buci',
    forme: 'ovale',
    verre: 49,
    hauteur: 36,
    pont: 19,
    branche: 140,
    matiere: 'Titane fil',
    prix: '275 EUR',
  },
]

/** La monture de la carte de visite, et celle de l ouverture. */
const MARQUE: Monture = VITRINE[0] ?? {
  id: 'turbigo',
  nom: 'Turbigo',
  forme: 'rectangulaire',
  verre: 52,
  hauteur: 38,
  pont: 18,
  branche: 145,
  matiere: 'Acetate ecaille',
  prix: '185 EUR',
}
const VEDETTE: Monture = VITRINE[2] ?? MARQUE

/** Largeur frontale d une monture : deux verres, le pont, et les deux tenons. */
function largeurFrontale(monture: Monture): number {
  return monture.verre * 2 + monture.pont + 8
}

/** Ecart entre centres optiques : un verre plus le pont. */
function ecartOptique(monture: Monture): number {
  return monture.verre + monture.pont
}

/* ============================ Le dessin d un verre ===================== */

/**
 * Le contour d un verre, pour la forme demandee, en millimetres.
 *
 * Le repere du dessin **est** le millimetre : la meme fonction sert a la
 * vitrine et a l essai sur le visage, a deux echelles differentes, sans que
 * rien ne soit redessine.
 */
function contourVerre(forme: string, x: number, y: number, l: number, h: number): string {
  const droite = x + l
  const bas = y + h
  const milieu = y + h / 2
  switch (forme) {
    case 'ronde':
      return `M${x} ${milieu} a${l / 2} ${h / 2} 0 1 0 ${l} 0 a${l / 2} ${h / 2} 0 1 0 ${-l} 0 Z`
    case 'ovale':
      return `M${x} ${milieu} a${l / 2} ${h / 2} 0 1 0 ${l} 0 a${l / 2} ${h / 2} 0 1 0 ${-l} 0 Z`
    case 'papillon':
      // Le coin superieur exterieur remonte : c est tout le dessin du papillon.
      return `M${x + 3} ${y + 6} C${x + 12} ${y - 4} ${droite - 6} ${y - 6} ${droite} ${y - 2} C${droite + 1} ${y + 12} ${droite - 6} ${bas - 4} ${x + l * 0.45} ${bas} C${x + 8} ${bas - 2} ${x} ${y + 16} ${x + 3} ${y + 6} Z`
    case 'aviateur':
      // La goutte : large en haut, pointe en bas vers l exterieur.
      return `M${x} ${y + 8} C${x + 4} ${y} ${droite - 4} ${y} ${droite} ${y + 6} C${droite} ${y + 20} ${droite - 10} ${bas} ${x + l * 0.42} ${bas} C${x + 6} ${bas} ${x} ${y + 22} ${x} ${y + 8} Z`
    case 'carree':
      return `M${x + 4} ${y} h${l - 8} a4 4 0 0 1 4 4 v${h - 8} a4 4 0 0 1 -4 4 h${-(l - 8)} a4 4 0 0 1 -4 -4 v${-(h - 8)} a4 4 0 0 1 4 -4 Z`
    default:
      return `M${x + 7} ${y} h${l - 14} a7 7 0 0 1 7 7 v${h - 14} a7 7 0 0 1 -7 7 h${-(l - 14)} a7 7 0 0 1 -7 -7 v${-(h - 14)} a7 7 0 0 1 7 -7 Z`
  }
}

/**
 * La monture entiere, dessinee autour d un centre, en millimetres.
 *
 * @param cx Abscisse du milieu du pont.
 * @param cy Ordonnee de la ligne des centres optiques.
 */
function Face({
  monture,
  cx,
  cy,
  trait,
  couleur,
  branches = true,
}: {
  readonly monture: Monture
  readonly cx: number
  readonly cy: number
  readonly trait: number
  readonly couleur: string
  readonly branches?: boolean
}): ReactElement {
  const { verre, hauteur, pont, forme } = monture
  const gaucheX = cx - pont / 2 - verre
  const droiteX = cx + pont / 2
  const y = cy - hauteur / 2
  const bord = cx + pont / 2 + verre

  return (
    <g fill="none" stroke={couleur} strokeWidth={trait} strokeLinejoin="round">
      <path d={contourVerre(forme, gaucheX, y, verre, hauteur)} />
      <path d={contourVerre(forme, droiteX, y, verre, hauteur)} />
      {/* Le pont, a la hauteur ou il tombe vraiment : au tiers haut du verre. */}
      <path d={`M${gaucheX + verre} ${y + hauteur * 0.3} h${pont}`} />
      {branches && (
        <>
          <path d={`M${gaucheX} ${y + hauteur * 0.28} h-4 l-3 3`} />
          <path d={`M${bord} ${y + hauteur * 0.28} h4 l3 3`} />
        </>
      )}
    </g>
  )
}

/* ============================ Les equerres ============================= */

/** Quatre equerres de reperage : un cadre n est pas borde, il est repere. */
function Reperes({
  couleur,
  taille = 12,
}: {
  readonly couleur: string
  readonly taille?: number
}): ReactElement {
  const coins = [
    { pos: 'o-left-3 o-top-3', bords: '1px 0 0 1px' },
    { pos: 'o-right-3 o-top-3', bords: '1px 1px 0 0' },
    { pos: 'o-bottom-3 o-left-3', bords: '0 0 1px 1px' },
    { pos: 'o-bottom-3 o-right-3', bords: '0 1px 1px 0' },
  ] as const
  return (
    <>
      {coins.map((coin) => (
        <span
          key={coin.pos}
          aria-hidden="true"
          className={`o-pointer-events-none o-absolute o-block ${coin.pos}`}
          style={{
            width: taille,
            height: taille,
            borderColor: couleur,
            borderStyle: 'solid',
            borderWidth: coin.bords,
          }}
        />
      ))}
    </>
  )
}

/* ============================ Le cadran (C12) ========================== */

/**
 * Le cadran a aiguille de l ecart pupillaire.
 *
 * Un opticien lit l ecart sur un pupillometre, pas sur un tableau de bord :
 * le chiffre de cette page est donc une aiguille sur un arc gradue, et rien
 * d autre.
 */
function Cadran({
  valeur,
  min,
  max,
}: {
  readonly valeur: number
  readonly min: number
  readonly max: number
}): ReactElement {
  const part = (valeur - min) / (max - min)
  // L arc couvre deux cent vingt degres, de -200 a +20 : l ouverture en bas
  // est ce qui distingue un cadran d instrument d un simple anneau.
  const angle = -200 + part * 220
  const rayon = 76
  const centre = 100
  const versPoint = (a: number, r: number): readonly [number, number] => [
    centre + r * Math.cos((a * Math.PI) / 180),
    centre + r * Math.sin((a * Math.PI) / 180),
  ]
  const [x0, y0] = versPoint(-200, rayon)
  const [x1, y1] = versPoint(20, rayon)
  const [ax, ay] = versPoint(angle, rayon - 14)

  const graduations = Array.from({ length: max - min + 1 }, (_, rang) => {
    const a = -200 + (rang / (max - min)) * 220
    const longue = (min + rang) % 4 === 0
    const [gx0, gy0] = versPoint(a, rayon)
    const [gx1, gy1] = versPoint(a, rayon - (longue ? 12 : 6))
    return { a, longue, gx0, gy0, gx1, gy1, valeur: min + rang }
  })

  return (
    <svg
      viewBox="0 0 200 168"
      className="o-h-auto o-w-full"
      role="img"
      aria-label={`Cadran : ecart pupillaire de ${String(valeur)} millimetres`}
    >
      <path
        d={`M${x0.toFixed(1)} ${y0.toFixed(1)} A${String(rayon)} ${String(rayon)} 0 1 1 ${x1.toFixed(1)} ${y1.toFixed(1)}`}
        fill="none"
        stroke={accentDoux(700, 24)}
        strokeWidth="1"
      />
      {graduations.map((g) => (
        <g key={g.valeur}>
          <path
            d={`M${g.gx0.toFixed(1)} ${g.gy0.toFixed(1)} L${g.gx1.toFixed(1)} ${g.gy1.toFixed(1)}`}
            stroke={g.longue ? accentDoux(700, 52) : accentDoux(700, 26)}
            strokeWidth={g.longue ? 1.4 : 0.8}
          />
          {g.longue && (
            <text
              x={versPoint(g.a, rayon - 24)[0]}
              y={versPoint(g.a, rayon - 24)[1] + 3}
              fontSize="8"
              textAnchor="middle"
              fill="currentColor"
              style={{ color: 'var(--o-theme-muted)', fontFamily: 'var(--o-font-mono)' }}
            >
              {g.valeur}
            </text>
          )}
        </g>
      ))}
      <path
        d={`M${String(centre)} ${String(centre)} L${ax.toFixed(1)} ${ay.toFixed(1)}`}
        stroke={accent(500)}
        strokeWidth="2.5"
        strokeLinecap="round"
        style={{ transition: 'none' }}
      />
      <circle cx={centre} cy={centre} r="4" fill={accent(500)} />
      <text
        x={centre}
        y={centre + 42}
        fontSize="26"
        textAnchor="middle"
        fill="currentColor"
        style={{ color: 'var(--o-theme-fg)', fontFamily: 'var(--o-font-mono)' }}
      >
        {valeur}
      </text>
      <text
        x={centre}
        y={centre + 56}
        fontSize="9"
        textAnchor="middle"
        fill="currentColor"
        style={{
          color: 'var(--o-theme-muted)',
          fontFamily: 'var(--o-font-mono)',
          letterSpacing: '0.16em',
        }}
      >
        MM
      </text>
    </svg>
  )
}

/* ============================ Les verres =============================== */

/**
 * L epaisseur au bord d un verre, pour un indice donne.
 *
 * Modele volontairement simple, et dit comme tel : une seule face courbee, un
 * verre de cinquante millimetres, une correction de -4,00 dioptries. La fleche
 * de la courbe vaut `y² x P / (2000 x (n - 1))` ; le bord vaut cette fleche,
 * plus le millimetre du centre. Ce qui compte ici n est pas la troisieme
 * decimale, c est que l ecart entre les indices soit le bon — et il l est.
 */
function bordDuVerre(indice: number): number {
  const rayon = 25
  const puissance = 4
  return (rayon * rayon * puissance) / (2000 * (indice - 1)) + 1
}

const INDICES = [
  {
    indice: 1.5,
    nom: 'Organique 1,5',
    note: 'Le verre de base. Epais des que la correction monte.',
    prix: 'compris',
  },
  {
    indice: 1.6,
    nom: 'Aminci 1,6',
    note: 'Le bon compromis, de -2,00 a -4,00.',
    prix: '+ 60 EUR',
  },
  {
    indice: 1.67,
    nom: 'Aminci 1,67',
    note: 'Au-dela de -4,00, ou quand la monture est large.',
    prix: '+ 120 EUR',
  },
  {
    indice: 1.74,
    nom: 'Extra-aminci 1,74',
    note: 'Les fortes corrections, et les montures fines percees.',
    prix: '+ 210 EUR',
  },
] as const

/* ============================ Le pied (P27) ============================ */

/** Un pictogramme du pied, dessine dans son cadre de reperage. */
interface Picto {
  readonly titre: string
  readonly legende: string
  readonly trace: ReactNode
}

const PICTOS: readonly Picto[] = [
  {
    titre: 'La mesure',
    legende:
      'Ecart pupillaire, hauteur de montage, angle pantoscopique. Quinze minutes, sans rendez-vous.',
    trace: (
      <>
        <path d="M8 32h48" />
        <path d="M14 26v12M32 24v16M50 26v12" />
        <circle cx="32" cy="32" r="3" />
      </>
    ),
  },
  {
    titre: 'Le montage',
    legende:
      'Taille a la meuleuse dans l atelier du fond, sur le gabarit de votre monture.',
    trace: (
      <>
        <circle cx="32" cy="32" r="18" />
        <circle cx="32" cy="32" r="6" />
        <path d="M32 14v6M32 44v6M14 32h6M44 32h6" />
      </>
    ),
  },
  {
    titre: 'Le reglage',
    legende:
      'A vie, et gratuit, meme si la monture vient d ailleurs. Une branche tordue se redresse.',
    trace: (
      <>
        <path d="M12 40c8-14 32-14 40 0" />
        <path d="M12 40l-4 6M52 40l4 6" />
        <circle cx="22" cy="28" r="8" />
        <circle cx="42" cy="28" r="8" />
        <path d="M30 28h4" />
      </>
    ),
  },
  {
    titre: 'La garantie',
    legende:
      'Deux ans sur la monture, un an sur l adaptation : si vous ne vous y faites pas, on refait.',
    trace: (
      <>
        <path d="M32 10l20 8v16c0 12-10 18-20 20-10-2-20-8-20-20V18z" />
        <path d="M24 32l6 6 12-12" />
      </>
    ),
  },
]

/* ============================ L essai ================================== */

/** Le mecanisme : la monture se pose sur le visage, a l echelle. */
function Essai({ ecart }: { readonly ecart: number }): ReactElement {
  const [visage, setVisage] = useState('ovale')
  const [monture, setMonture] = useState('turbigo')

  const forme = VISAGES.find((v) => v.id === visage) ?? VISAGES[0]
  const piece = VITRINE.find((m) => m.id === monture) ?? VITRINE[0]
  if (forme === undefined || piece === undefined) throw new Error('essai vide')

  const releve = useMemo(() => {
    const largeur = largeurFrontale(piece)
    const debord = largeur - forme.largeur
    const optique = ecartOptique(piece)
    const decentrement = Math.abs(ecart - optique) / 2
    const verdict = forme.mauvaises.includes(piece.forme)
      ? 'deconseillee'
      : forme.bonnes.includes(piece.forme)
        ? 'conseillee'
        : 'a essayer'
    return { largeur, debord, optique, decentrement, verdict }
  }, [piece, forme, ecart])

  // Cent vingt unites du repere du visage valent la largeur reelle : c est ce
  // rapport, et lui seul, qui met la monture a l echelle sur le dessin.
  const echelle = 120 / forme.largeur

  // Deux couleurs, pas une : le trait de la monture peut etre pale sur son
  // aplat, le mot du verdict doit tenir sur le fond de la page dans les deux
  // themes — d ou `encre()`, qui bascule avec lui.
  const couleurTrait =
    releve.verdict === 'deconseillee'
      ? 'light-dark(var(--o-palette-rose-600), var(--o-palette-rose-400))'
      : releve.verdict === 'conseillee'
        ? accent(500)
        : accentDoux(900, 55)
  const couleurVerdict =
    releve.verdict === 'deconseillee'
      ? 'light-dark(var(--o-palette-rose-700), var(--o-palette-rose-300))'
      : releve.verdict === 'conseillee'
        ? encre()
        : 'var(--o-theme-muted)'

  return (
    <div className="o-grid o-gap-10 lg:o-grid-cols-12">
      {/* ----- Le visage, et la monture posee dessus ----- */}
      <div className="lg:o-col-span-5">
        <div className="o-relative o-p-6" style={{ backgroundColor: accentDoux(300, 8) }}>
          <Reperes couleur={accentDoux(700, 46)} />
          <svg
            viewBox="0 0 200 264"
            className="o-mx-auto o-h-auto o-w-full"
            style={{ maxWidth: 320 }}
            role="img"
            aria-label={`Visage ${forme.nom.toLowerCase()} portant la monture ${piece.nom}`}
          >
            {/* La tete, au trait. */}
            <path
              d={forme.trace}
              fill="var(--o-theme-bg)"
              stroke={accentDoux(900, 46)}
              strokeWidth="1.4"
            />
            {/* La ligne des pommettes, cotee : c est l etalon du dessin. */}
            <g stroke={accentDoux(700, 34)} strokeWidth="0.7" strokeDasharray="3 3">
              <path d="M40 158h120M40 152v12M160 152v12" />
            </g>
            <text
              x="100"
              y="150"
              fontSize="7"
              textAnchor="middle"
              fill="currentColor"
              style={{
                color: 'var(--o-theme-muted)',
                fontFamily: 'var(--o-font-mono)',
                letterSpacing: '0.1em',
              }}
            >
              {`${String(forme.largeur)} MM`}
            </text>
            {/* Les yeux, a l ecart pupillaire choisi. */}
            <g fill={accentDoux(900, 36)}>
              <circle cx={100 - (ecart / 2) * echelle} cy={112} r={2.6} />
              <circle cx={100 + (ecart / 2) * echelle} cy={112} r={2.6} />
            </g>
            {/* La monture, a l echelle du visage. */}
            <g
              transform={`translate(100 112) scale(${echelle.toFixed(4)}) translate(-100 -112)`}
            >
              <Face
                monture={piece}
                cx={100}
                cy={112}
                trait={2.2 / echelle}
                couleur={couleurTrait}
              />
            </g>
          </svg>
        </div>
      </div>

      {/* ----- Les choix, et le releve ----- */}
      <div className="o-min-w-0 lg:o-col-span-7">
        <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
          1 — La forme du visage
        </p>
        {/*
          On choisit sa forme de visage en la regardant, pas en lisant son nom :
          six silhouettes, et le nom dessous. C est aussi ce qui evite la gelule
          arrondie, que cette page ne s autorise nulle part.
        */}
        <ul
          className="o-m-0 o-mt-4 o-grid o-list-none o-grid-cols-3 o-gap-px o-p-0 sm:o-grid-cols-6"
          style={{ backgroundColor: accentDoux(700, 20) }}
        >
          {VISAGES.map((forme2) => {
            const choisie = forme2.id === visage
            return (
              <li key={forme2.id}>
                <button
                  type="button"
                  onClick={() => {
                    setVisage(forme2.id)
                  }}
                  aria-pressed={choisie}
                  className={`o-flex o-w-full o-cursor-pointer o-appearance-none o-flex-col o-items-center o-gap-2 o-border-none o-px-2 o-py-3 o-transition-colors focus:o-ring ${
                    choisie ? '' : 'o-bg-zinc-50 dark:o-bg-zinc-950'
                  }`}
                  style={choisie ? aplat() : undefined}
                >
                  <svg viewBox="20 10 160 250" className="o-w-10" aria-hidden="true">
                    <path
                      d={forme2.trace}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="6"
                    />
                  </svg>
                  <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest">
                    {forme2.nom}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
        <p className="o-m-0 o-mt-4 o-max-w-md o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
          {forme.conseil}
        </p>

        <p className="o-m-0 o-mt-10 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
          2 — La monture
        </p>
        <ul
          className="o-m-0 o-mt-4 o-grid o-list-none o-gap-px o-p-0 sm:o-grid-cols-3"
          style={{ backgroundColor: accentDoux(700, 20) }}
        >
          {VITRINE.map((piece2) => {
            const choisie = piece2.id === monture
            return (
              <li key={piece2.id}>
                <GlareHover duration={620} width={18} className="o-h-full">
                  <button
                    type="button"
                    onClick={() => {
                      setMonture(piece2.id)
                    }}
                    aria-pressed={choisie}
                    className={`o-flex o-h-full o-w-full o-cursor-pointer o-appearance-none o-flex-col o-gap-3 o-border-none o-px-4 o-py-4 o-text-left o-transition-colors focus:o-ring ${
                      choisie ? '' : 'o-bg-zinc-50 dark:o-bg-zinc-950'
                    }`}
                    style={choisie ? aplat() : undefined}
                  >
                    <svg viewBox="0 0 140 60" className="o-w-full" aria-hidden="true">
                      <Face
                        monture={piece2}
                        cx={70}
                        cy={30}
                        trait={1.6}
                        couleur="currentColor"
                      />
                    </svg>
                    <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest">
                      {piece2.nom}
                    </span>
                    <span className="o-font-mono o-text-xs o-opacity-70">
                      {piece2.verre}-{piece2.pont}-{piece2.branche}
                    </span>
                  </button>
                </GlareHover>
              </li>
            )
          })}
        </ul>

        {/* Le releve : ce que l essai donne, en millimetres. */}
        <div
          className="o-relative o-mt-10 o-p-6"
          style={{ boxShadow: `inset 0 0 0 1px ${accentDoux(700, 30)}` }}
        >
          <Reperes couleur={accent(500)} taille={9} />
          <p className="o-m-0 o-flex o-flex-wrap o-items-baseline o-gap-3">
            <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
              Verdict
            </span>
            <span
              className="o-font-mono o-text-lg o-uppercase o-tracking-widest"
              aria-live="polite"
              style={{ color: couleurVerdict }}
            >
              {releve.verdict}
            </span>
          </p>
          <dl className="o-m-0 o-mt-6 o-grid o-gap-6 sm:o-grid-cols-3">
            {(
              [
                [
                  'Largeur frontale',
                  `${String(releve.largeur)} mm`,
                  releve.debord > 2
                    ? `deborde de ${String(releve.debord)} mm`
                    : releve.debord < -6
                      ? `etroite de ${String(-releve.debord)} mm`
                      : 'bien posee',
                ],
                [
                  'Centres optiques',
                  `${String(releve.optique)} mm`,
                  `votre ecart : ${String(ecart)} mm`,
                ],
                [
                  'Decentrement',
                  `${releve.decentrement.toFixed(1).replace('.', ',')} mm`,
                  releve.decentrement > 2
                    ? 'verres plus epais au bord'
                    : 'sans consequence',
                ],
              ] as const
            ).map(([quoi, valeur, note]) => (
              <div key={quoi}>
                <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                  {quoi}
                </dt>
                <dd className="o-m-0 o-mt-2 o-font-mono o-text-xl o-tabular-nums o-text-zinc-950 dark:o-text-zinc-50">
                  {valeur}
                </dd>
                <dd className="o-m-0 o-mt-1 o-text-xs o-leading-relaxed o-text-zinc-500 dark:o-text-zinc-400">
                  {note}
                </dd>
              </div>
            ))}
          </dl>
          <p className="o-m-0 o-mt-6 o-border-t o-border-black-10 dark:o-border-zinc-800 o-pt-4 o-text-xs o-leading-relaxed o-text-zinc-500 dark:o-text-zinc-400">
            {piece.nom} — {piece.matiere}, {piece.prix}. Le verdict suit la regle du
            metier : on contrarie la forme du visage, on ne la repete pas. Il ne remplace
            pas l essai, il vous evite d essayer douze montures.
          </p>
        </div>
      </div>
    </div>
  )
}

/* ============================ La carte de visite (A24) ================= */

/** L appel : une carte de visite qu on retourne. */
function CarteDeVisite(): ReactElement {
  const { reduced } = useMotionState()
  const [retournee, setRetournee] = useState(false)

  return (
    <div
      className="o-relative o-mx-auto"
      style={{ maxWidth: '30rem', perspective: '1200px' }}
      onPointerEnter={() => {
        setRetournee(true)
      }}
      onPointerLeave={() => {
        setRetournee(false)
      }}
    >
      <div
        className="o-relative"
        style={{
          transformStyle: 'preserve-3d',
          transform: reduced || !retournee ? undefined : 'rotateY(180deg)',
          transition: reduced
            ? undefined
            : 'transform 700ms cubic-bezier(0.16, 1, 0.3, 1)',
          aspectRatio: '85 / 55',
        }}
      >
        {/* Le recto : le nom, grave. */}
        <div
          className="o-absolute o-inset-0 o-flex o-flex-col o-justify-between o-p-7"
          aria-hidden={retournee}
          style={{
            backfaceVisibility: 'hidden',
            backgroundColor: 'var(--o-theme-bg)',
            boxShadow: `inset 0 0 0 1px ${accentDoux(700, 34)}`,
            opacity: reduced && retournee ? 0 : 1,
            transition: reduced ? 'opacity 200ms ease' : undefined,
          }}
        >
          <div className="o-flex o-items-start o-justify-between o-gap-6">
            <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
              Opticien — Paris 3
            </p>
            <svg viewBox="0 0 140 60" className="o-w-20" aria-hidden="true">
              <Face monture={MARQUE} cx={70} cy={30} trait={1.6} couleur={accent(500)} />
            </svg>
          </div>
          <p
            className="o-m-0 o-text-zinc-950 dark:o-text-zinc-50"
            style={{
              ...affiche('m', 300),
              fontSize: 'clamp(1.5rem, 3vw, 2.25rem)',
              lineHeight: 1,
            }}
          >
            Verre &amp; Monture
          </p>
        </div>

        {/* Le verso : ou, quand, comment. */}
        <div
          className="o-absolute o-inset-0 o-flex o-flex-col o-justify-between o-gap-4 o-p-7"
          aria-hidden={!retournee}
          style={{
            backfaceVisibility: 'hidden',
            transform: reduced ? undefined : 'rotateY(180deg)',
            opacity: reduced && !retournee ? 0 : 1,
            transition: reduced ? 'opacity 200ms ease' : undefined,
            ...nuit('slate'),
          }}
        >
          <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-slate-300">
            28 rue de Turbigo, 75003 Paris
            <br />
            Mardi au samedi, 10 h — 19 h 30
            <br />
            01 44 00 00 00
          </p>
          <div className="o-flex o-flex-wrap o-items-center o-gap-4">
            <Aimant force={0.35}>
              <a
                href="#essai"
                className="o-inline-flex o-items-center o-gap-2 o-px-5 o-py-3 o-font-mono o-text-xs o-font-semibold o-uppercase o-tracking-widest o-no-underline o-transition-opacity hover:o-opacity-85 focus:o-ring"
                style={aplat()}
              >
                Prendre la mesure <Icon icon={ArrowRight} size={14} aria-hidden="true" />
              </a>
            </Aimant>
            <span
              className="o-font-mono o-text-xs o-uppercase o-tracking-widest"
              style={{ color: encreSurSombre() }}
            >
              Sans rendez-vous
            </span>
          </div>
        </div>
      </div>
      <p className="o-m-0 o-mt-5 o-text-center o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
        Survolez la carte pour la retourner
      </p>
    </div>
  )
}

/* ============================ La page ================================== */

export default function Page(): ReactElement {
  const polices = usePolices('manrope')
  const [ecart, setEcart] = useState(63)

  const verres = useMemo(
    () => INDICES.map((ligne) => ({ ...ligne, bord: bordDuVerre(ligne.indice) })),
    [],
  )
  const plusEpais = verres[0]?.bord ?? 3

  return (
    <Porte forme="iris" marque="Verre &amp; Monture" sombre={false}>
      <div
        className="o-bg-zinc-50 dark:o-bg-zinc-950 o-text-zinc-900 dark:o-text-zinc-50"
        style={polices}
      >
        {/* ================= L ouverture : blanc clinique ================= */}
        <header
          className="o-relative o-isolate o-flex o-flex-col"
          style={{ minHeight: ECRAN }}
        >
          <Reperes couleur={accentDoux(700, 40)} taille={16} />
          <BarreCoins
            marque="Verre &amp; Monture"
            liens={NAVIGATION}
            droite="Paris 3 — sans rendez-vous"
            sombre={false}
          />

          <div className="o-relative o-flex o-grow o-flex-col o-justify-center o-gap-12 o-px-6 o-py-12 md:o-px-12">
            <div className="o-grid o-items-center o-gap-12 lg:o-grid-cols-12">
              <div className="lg:o-col-span-7">
                <Surgit>
                  <Etiquette sombre={false}>
                    Opticien lunetier — atelier au fond du magasin
                  </Etiquette>
                </Surgit>
                <TitreVague
                  delai={140}
                  className="o-m-0 o-mt-7 o-text-zinc-950 dark:o-text-zinc-50"
                  style={{
                    ...affiche('l', 300),
                    fontSize: 'clamp(2.5rem, 8vw, 7.5rem)',
                    lineHeight: 0.9,
                    letterSpacing: '-0.04em',
                  }}
                >
                  Verre &amp; Monture
                </TitreVague>
                <Surgit
                  delai={520}
                  as="p"
                  className="o-m-0 o-mt-8 o-max-w-lg o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400"
                >
                  Une monture se choisit en millimetres avant de se choisir en gout. Posez
                  la votre sur votre visage, ici, avant de pousser la porte.
                </Surgit>
                <Surgit
                  delai={640}
                  className="o-mt-10 o-flex o-flex-wrap o-items-center o-gap-4"
                >
                  <Aimant force={0.4}>
                    <a
                      href="#essai"
                      className="o-inline-flex o-items-center o-gap-2 o-px-6 o-py-3 o-font-mono o-text-xs o-font-semibold o-uppercase o-tracking-widest o-no-underline o-transition-opacity hover:o-opacity-85 focus:o-ring"
                      style={aplat()}
                    >
                      Essayer une monture{' '}
                      <Icon icon={ArrowRight} size={14} aria-hidden="true" />
                    </a>
                  </Aimant>
                  <a
                    href="#verres"
                    className="o-inline-flex o-items-center o-gap-2 o-px-6 o-py-3 o-font-mono o-text-xs o-font-semibold o-uppercase o-tracking-widest o-no-underline focus:o-ring"
                    style={{
                      boxShadow: `inset 0 0 0 1px ${accentDoux(700, 40)}`,
                      color: 'inherit',
                    }}
                  >
                    Comprendre les verres
                  </a>
                </Surgit>
              </div>

              {/* La monture de l ouverture, cotee comme sur un plan. */}
              <Surgit delai={340} className="lg:o-col-span-5">
                <div
                  className="o-relative o-p-6"
                  style={{ boxShadow: `inset 0 0 0 1px ${accentDoux(700, 26)}` }}
                >
                  <Reperes couleur={accent(500)} taille={10} />
                  <svg
                    viewBox="0 0 150 86"
                    className="o-h-auto o-w-full"
                    role="img"
                    aria-label="La monture Sedaine, cotee : verre 54, pont 17, branche 140"
                  >
                    <g
                      stroke={accentDoux(700, 30)}
                      strokeWidth="0.4"
                      strokeDasharray="2 2"
                    >
                      <path d="M21 22v-10M75 22v-10M129 22v-10" />
                      <path d="M21 14h54M75 14h54" />
                    </g>
                    <text
                      x="48"
                      y="11"
                      fontSize="5"
                      textAnchor="middle"
                      fill="currentColor"
                      style={{
                        color: 'var(--o-theme-muted)',
                        fontFamily: 'var(--o-font-mono)',
                        letterSpacing: '0.1em',
                      }}
                    >
                      54 MM
                    </text>
                    <text
                      x="102"
                      y="11"
                      fontSize="5"
                      textAnchor="middle"
                      fill="currentColor"
                      style={{
                        color: 'var(--o-theme-muted)',
                        fontFamily: 'var(--o-font-mono)',
                        letterSpacing: '0.1em',
                      }}
                    >
                      17 MM
                    </text>
                    <g transform="translate(75 48) scale(0.86) translate(-75 -48)">
                      <Face
                        monture={VEDETTE}
                        cx={75}
                        cy={48}
                        trait={1.8}
                        couleur={accentDoux(900, 60)}
                      />
                    </g>
                  </svg>
                  <p className="o-m-0 o-mt-4 o-border-t o-border-black-10 dark:o-border-zinc-800 o-pt-4 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                    Sedaine — acetate miel
                    <br />
                    54-17-140 — 245 EUR
                  </p>
                </div>
              </Surgit>
            </div>
          </div>

          <Coin position="bg" sombre={false}>
            Cent quarante montures en vitrine
            <br />
            Trente marques, six ateliers francais
          </Coin>
        </header>

        {/* ================= Le manifeste, mot a mot ====================== */}
        <section
          aria-labelledby="manifeste-titre"
          className="o-border-t o-border-black-10 dark:o-border-zinc-800 o-px-6 o-py-24 md:o-px-12 md:o-py-32"
        >
          <div className="o-mx-auto o-max-w-5xl">
            <h2 id="manifeste-titre" className="o-sr-only">
              Ce que nous faisons
            </h2>
            <Reveal>
              <TrueFocus
                as="p"
                blur={4}
                attenue={0.72}
                hold={1100}
                couleur={accent(500)}
                className="o-m-0 o-text-balance o-text-zinc-950 dark:o-text-zinc-50"
                style={{
                  ...affiche('m', 300),
                  fontSize: 'clamp(1.6rem, 4vw, 3.5rem)',
                  lineHeight: 1.08,
                }}
              >
                On mesure. On taille. On regle. On revoit dans quinze jours.
              </TrueFocus>
            </Reveal>
            <Reveal delay={120}>
              <p className="o-m-0 o-mt-10 o-max-w-xl o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                Quatre gestes, et trois d entre eux se font apres la vente. C est la
                difference entre un opticien et un rayon de lunettes : ce qui vous est
                vendu n est pas la monture, c est l ajustement.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ================= Le mecanisme : l essai ======================= */}
        <section
          id="essai"
          className="o-scroll-mt-24 o-border-t o-border-black-10 dark:o-border-zinc-800 o-px-6 o-py-24 md:o-px-12 md:o-py-32"
        >
          <div className="o-mx-auto o-max-w-6xl">
            <Reveal>
              <Indice rang="01" sombre={false}>
                L essai
              </Indice>
            </Reveal>
            <Reveal delay={80}>
              <h2
                className="o-m-0 o-mt-6 o-max-w-3xl o-text-zinc-950 dark:o-text-zinc-50"
                style={{
                  ...affiche('m', 300),
                  fontSize: 'clamp(1.85rem, 4.4vw, 3.75rem)',
                  lineHeight: 0.96,
                  letterSpacing: '-0.03em',
                }}
              >
                La monture se pose a l echelle, pas a peu pres.
              </h2>
            </Reveal>
            <div className="o-mt-14">
              {/* Le curseur devient une lentille sur la zone d essai : c est la
                  signature de mouvement de la page, et elle est a sa place. */}
              <CursorRing size={34} lag={1.2} grow={1.9} color={accent(500)}>
                <Essai ecart={ecart} />
              </CursorRing>
            </div>
          </div>
        </section>

        {/* ================= L ecart pupillaire, au cadran (C12) ========== */}
        <section
          id="ecart"
          className="o-scroll-mt-24 o-border-t o-border-black-10 dark:o-border-zinc-800 o-px-6 o-py-24 md:o-px-12 md:o-py-32"
        >
          <div className="o-mx-auto o-grid o-max-w-6xl o-items-center o-gap-12 lg:o-grid-cols-12">
            <div className="lg:o-col-span-7">
              <Reveal>
                <Indice rang="02" sombre={false}>
                  L ecart
                </Indice>
              </Reveal>
              <Reveal delay={80}>
                <h2
                  className="o-m-0 o-mt-6 o-text-zinc-950 dark:o-text-zinc-50"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.75rem, 3.6vw, 3rem)',
                    lineHeight: 0.96,
                    letterSpacing: '-0.03em',
                  }}
                >
                  Un millimetre d ecart se voit au bout d une heure.
                </h2>
              </Reveal>
              <p className="o-m-0 o-mt-6 o-max-w-xl o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                Le centre optique du verre doit tomber devant la pupille. S il tombe a
                cote, le verre devient un prisme : la tete tire, et on accuse la
                correction. Reglez votre ecart ci-dessous — l essai plus haut en tient
                compte aussitot.
              </p>
              <div className="o-mt-10 o-max-w-md">
                <ElasticSlider
                  label="Ecart pupillaire, en millimetres"
                  min={54}
                  max={72}
                  step={1}
                  value={ecart}
                  onChange={setEcart}
                  showValue={false}
                />
              </div>
              <p className="o-m-0 o-mt-6 o-max-w-md o-text-xs o-leading-relaxed o-text-zinc-500 dark:o-text-zinc-400">
                Un adulte se tient entre cinquante-huit et soixante-huit millimetres. Nous
                le mesurons au pupillometre, en quinze secondes, meme si vous n achetez
                rien.
              </p>
            </div>

            <div className="lg:o-col-span-5">
              <div
                className="o-relative o-p-6"
                style={{ backgroundColor: accentDoux(300, 8) }}
              >
                <Reperes couleur={accentDoux(700, 46)} />
                <Cadran valeur={ecart} min={54} max={72} />
              </div>
            </div>
          </div>
        </section>

        {/* ================= Les verres, en coupe ========================= */}
        <section
          id="verres"
          className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-12 md:o-py-32"
          style={nuit('slate')}
        >
          <div className="o-mx-auto o-max-w-6xl">
            <Reveal>
              <Indice rang="03">Les verres</Indice>
            </Reveal>
            <Reveal delay={80}>
              <h2
                className="o-m-0 o-mt-6 o-max-w-3xl o-text-slate-50"
                style={{
                  ...affiche('m', 300),
                  fontSize: 'clamp(1.85rem, 4.4vw, 3.75rem)',
                  lineHeight: 0.96,
                  letterSpacing: '-0.03em',
                }}
              >
                L indice ne se voit qu en coupe.
              </h2>
            </Reveal>
            <p className="o-m-0 o-mt-6 o-max-w-xl o-text-base o-leading-relaxed o-text-slate-300">
              Quatre verres pour la meme correction de -4,00 dioptries, dessines a la meme
              echelle. Ce qui change n est pas le centre, c est le bord : c est lui qu on
              voit dans la monture.
            </p>

            <ul
              className="o-m-0 o-mt-14 o-grid o-list-none o-gap-px o-p-0 sm:o-grid-cols-2 lg:o-grid-cols-4"
              style={{ backgroundColor: 'var(--o-palette-slate-800)' }}
            >
              {verres.map((verre) => {
                const bord = verre.bord
                // Le dessin est en millimetres : la coupe est donc a la meme
                // echelle d une case a l autre, ce qui est tout l interet.
                const demi = bord / 2
                return (
                  <li key={verre.nom} className="o-bg-slate-950 o-px-5 o-py-6">
                    <p
                      className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                      style={{ color: encreSurSombre() }}
                    >
                      {verre.nom}
                    </p>
                    {/*
                      La demi-coupe, du centre au bord, dans un repere ou l unite
                      est le millimetre. Montrer le verre entier le rendrait
                      quatorze fois plus long que haut : on ne verrait plus rien
                      de ce qui separe un 1,5 d un 1,74, qui est tout le propos.
                    */}
                    <svg
                      viewBox="0 0 30 8"
                      className="o-mt-5 o-h-auto o-w-full"
                      role="img"
                      aria-label={`Demi-coupe du verre d indice ${String(verre.indice)} : ${bord.toFixed(1)} millimetres au bord, un millimetre au centre`}
                    >
                      <path
                        d={`M2 ${(4 - 0.5).toFixed(2)} Q15 ${(4 - 0.62).toFixed(2)} 27 ${(4 - demi).toFixed(2)} L27 ${(4 + demi).toFixed(2)} Q15 ${(4 + 0.62).toFixed(2)} 2 ${(4 + 0.5).toFixed(2)} Z`}
                        fill={accentDoux(500, 34)}
                        stroke={accent(400)}
                        strokeWidth="0.18"
                      />
                      {/* L axe du verre, et la cote au bord. */}
                      <path
                        d="M2 0.6V7.4"
                        stroke={accentDoux(400, 40)}
                        strokeWidth="0.16"
                        strokeDasharray="0.6 0.6"
                      />
                      <path
                        d={`M28.4 ${(4 - demi).toFixed(2)}v${bord.toFixed(2)}`}
                        stroke={accent(400)}
                        strokeWidth="0.24"
                      />
                      <path
                        d={`M27 ${(4 - demi).toFixed(2)}h1.8M27 ${(4 + demi).toFixed(2)}h1.8`}
                        stroke={accent(400)}
                        strokeWidth="0.14"
                      />
                    </svg>
                    <p className="o-m-0 o-mt-5 o-font-mono o-text-2xl o-tabular-nums o-text-slate-50">
                      {bord.toFixed(1).replace('.', ',')} mm
                    </p>
                    <p className="o-m-0 o-mt-1 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-400">
                      {bord === plusEpais
                        ? 'au bord — la reference'
                        : `au bord — ${(((plusEpais - bord) / plusEpais) * 100).toFixed(0)} % de moins`}
                    </p>
                    <p className="o-m-0 o-mt-4 o-border-t o-border-white-10 o-pt-3 o-text-xs o-leading-relaxed o-text-slate-300">
                      {verre.note}
                    </p>
                    <p
                      className="o-m-0 o-mt-3 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                      style={{ color: encreSurSombre() }}
                    >
                      {verre.prix}
                    </p>
                  </li>
                )
              })}
            </ul>

            <p className="o-m-0 o-mt-8 o-max-w-2xl o-text-xs o-leading-relaxed o-text-slate-400">
              Calcul simplifie, et dit comme tel : une seule face courbee, un verre de
              cinquante millimetres, un centre d un millimetre. Les valeurs absolues
              varient avec la monture ; l ecart entre les indices, lui, est celui-la.
            </p>
          </div>
        </section>

        {/* ================= L appel : la carte de visite (A24) =========== */}
        <section
          id="carte"
          className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-12 md:o-py-32"
        >
          <div className="o-mx-auto o-max-w-4xl">
            <Reveal>
              <Indice rang="04" sombre={false}>
                La carte
              </Indice>
            </Reveal>
            <Reveal delay={80}>
              <h2
                className="o-m-0 o-mb-14 o-mt-6 o-max-w-2xl o-text-zinc-950 dark:o-text-zinc-50"
                style={{
                  ...affiche('m', 300),
                  fontSize: 'clamp(1.75rem, 3.6vw, 3rem)',
                  lineHeight: 0.96,
                  letterSpacing: '-0.03em',
                }}
              >
                Passez quand vous voulez, on mesure sans vendre.
              </h2>
            </Reveal>
            <CarteDeVisite />
          </div>
        </section>

        {/* ================= Le pied : quatre pictogrammes (P27) ========== */}
        <footer className="o-border-t o-border-black-10 dark:o-border-zinc-800 o-px-6 o-py-16 md:o-px-12">
          <div className="o-mx-auto o-max-w-6xl">
            <ul
              className="o-m-0 o-grid o-list-none o-gap-px o-p-0 sm:o-grid-cols-2"
              style={{ backgroundColor: accentDoux(700, 18) }}
            >
              {PICTOS.map((picto) => (
                <li
                  key={picto.titre}
                  className="o-flex o-items-start o-gap-6 o-bg-zinc-50 dark:o-bg-zinc-950 o-px-5 o-py-6"
                >
                  {/* Le pictogramme dans son cadre de reperage : c est le meme
                      vocabulaire que le reste de la page, pas une icone posee. */}
                  <span
                    className="o-relative o-block o-shrink-0"
                    style={{
                      width: 76,
                      height: 76,
                      boxShadow: `inset 0 0 0 1px ${accentDoux(700, 26)}`,
                    }}
                  >
                    <Reperes couleur={accent(500)} taille={7} />
                    <svg
                      viewBox="0 0 64 64"
                      className="o-size-full"
                      aria-hidden="true"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ color: encre() }}
                    >
                      {picto.trace}
                    </svg>
                  </span>
                  <span>
                    <h2 className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-950 dark:o-text-zinc-50">
                      {picto.titre}
                    </h2>
                    <p className="o-m-0 o-mt-3 o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                      {picto.legende}
                    </p>
                  </span>
                </li>
              ))}
            </ul>

            <div className="o-mt-12 o-flex o-flex-wrap o-items-center o-justify-between o-gap-6 o-border-t o-border-black-10 dark:o-border-zinc-800 o-pt-6">
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                Verre &amp; Monture — 28 rue de Turbigo, 75003 Paris — © 2026
              </p>
              <a
                href="#carte"
                className="o-inline-flex o-items-center o-gap-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-no-underline focus:o-ring"
                style={{ color: encre() }}
              >
                atelier@verre-et-monture.fr{' '}
                <Icon icon={ArrowUpRight} size={14} aria-hidden="true" />
              </a>
            </div>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
