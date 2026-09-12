/**
 * Emouture — coutelier, Thiers.
 *
 * ## Ce que la page fait : le profil
 *
 * Une lame ne coupe pas parce qu elle est aiguisee : elle coupe parce qu elle
 * est **mince derriere le fil**. Le mecanisme de la page est donc une coupe de
 * lame, dessinee au trait et cotee, dont on change l emouture — et tout ce qui
 * est ecrit dessus se recalcule :
 *
 * - la **hauteur de l emouture** vaut la part demandee de la hauteur de lame ;
 * - le **demi-angle** est l arc-tangente de la demi-epaisseur au dos sur cette
 *   hauteur ; l angle inclus en est le double ;
 * - l **epaisseur a un millimetre du fil** se lit sur la meme geometrie, la
 *   creuse et la convexe ajoutant leur fleche au milieu de l emouture ;
 * - le **rayon de meule equivalent** se deduit de cette fleche, par la relation
 *   de la corde et de la fleche ;
 * - l **effort de coupe** est donne en part de la plate pleine hauteur, et la
 *   **tenue du fil** croit comme la racine de l epaisseur derriere le fil,
 *   multipliee par le facteur de l acier choisi.
 *
 * Rien n est ecrit a la main : changez l acier, l epaisseur au dos ou
 * l emouture, et les six chiffres du plan bougent ensemble.
 *
 * ## La forme des chiffres
 *
 * Ils sont **poses sur le plan cote**, sur leurs lignes de cote, avec leurs
 * fleches — comme sur une feuille d atelier. Il n y a pas de barre
 * d indicateurs : un couteau se juge sur une coupe, pas sur quatre nombres en
 * quatre-vingt-seize points.
 *
 * ## Le fond, et le mouvement
 *
 * Aucune surface graphique : une grille fixe, des filets d un pixel, et un
 * champ d aiguilles qui se tournent vers le pointeur dans l ouverture. Le
 * mouvement est en chapitres — l etiquette reste posee a gauche, les commandes
 * avec elle, pendant que le plan defile a droite.
 *
 * @module
 */

import { useMotionState } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import { ArrowDown, ArrowUpRight } from '@odoro-cli/icons/filaire'
import { useMemo, useState, type ReactElement, type ReactNode } from 'react'

import { MagnetLines } from '@/odoro/effect/MagnetLines.jsx'
import { ComparisonTable } from '@/odoro/section/ComparisonTable.jsx'
import { SplitLines } from '@/odoro/text/SplitLines.jsx'

import { nuit } from './communs.jsx'
import {
  Actions,
  affiche,
  BarreFilet,
  CHROME,
  Coin,
  Etiquette,
  Indice,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
} from './marche.jsx'
import { accent, aplat, encreSurSombre } from './palettes.js'
import { Chapitre } from './scene.jsx'

/** La hauteur d un ecran sous les barres de la documentation. */
const ECRAN = `calc(100vh - ${String(CHROME)}px)`

/** La hauteur de lame du couteau de l atelier, du dos au fil, en millimetres. */
const HAUTEUR = 38

/** La longueur de lame, en millimetres : elle donne la surface a affuter. */
const LONGUEUR = 195

/* ============================ L atelier ================================ */

/** Une emouture, decrite par sa geometrie et non par son nom. */
interface Emouture {
  readonly cle: string
  readonly nom: string
  /** Part de la hauteur de lame prise par l emouture, de zero a un. */
  readonly part: number
  /**
   * Fleche au milieu de l emouture, en millimetres. Negative pour une creuse,
   * positive pour une convexe, nulle pour une plate.
   */
  readonly fleche: number
  readonly usage: string
  readonly note: string
}

/** Les cinq emoutures que l atelier taille. */
const EMOUTURES = [
  {
    cle: 'plate',
    nom: 'Plate, pleine hauteur',
    part: 1,
    fleche: 0,
    usage: 'Cuisine, legumes, decoupe fine',
    note: 'La plus mince qu une lame puisse etre sans devenir un rasoir. Elle traverse un chou-rave sans le fendre, et elle ne pardonne pas un os.',
  },
  {
    cle: 'sabre',
    nom: 'Plate a mi-hauteur',
    part: 0.55,
    fleche: 0,
    usage: 'Couteau de poche, usage melange',
    note: 'Le dos garde toute son epaisseur : la lame encaisse un levier. On perd en penetration ce qu on gagne en tranquillite.',
  },
  {
    cle: 'creuse',
    nom: 'Creuse, courte',
    part: 0.42,
    fleche: -0.11,
    usage: 'Chasse, depouille, tranchage',
    note: 'Tournee sur une meule : la face se creuse, et le fil se retrouve seul devant. Elle mord tout de suite, et elle s emousse aussi vite.',
  },
  {
    cle: 'convexe',
    nom: 'Convexe, pleine hauteur',
    part: 0.92,
    fleche: 0.16,
    usage: 'Hachoir, bois vert, exterieur',
    note: 'Aucune arete, une seule courbe du dos au fil. C est la geometrie qui casse le moins, et celle qu on affute le plus mal sur une pierre plate.',
  },
  {
    cle: 'scandi',
    nom: 'Scandinave',
    part: 0.17,
    fleche: 0,
    usage: 'Bois, copeau, ecorce',
    note: 'Un biseau court et franc, le reste plein. On l affute a plat sur la pierre, sans chercher l angle : le biseau est son propre guide.',
  },
] as const satisfies readonly Emouture[]

/** Un acier, et ce qu il change. */
interface Acier {
  readonly cle: string
  readonly nom: string
  readonly durete: number
  /** Facteur de tenue du fil, la reference etant l acier au carbone. */
  readonly facteur: number
  readonly entretien: string
  readonly grain: string
  readonly patine: string
}

/** Les trois aciers tenus en barre. */
const ACIERS = [
  {
    cle: 'xc75',
    nom: 'XC75 au carbone',
    durete: 60,
    facteur: 1,
    entretien: 'Essuyer apres usage, huiler une fois par mois',
    grain: 'Grain tres fin, se refait en dix passes',
    patine: 'Se patine en gris-bleu des la premiere tomate',
  },
  {
    cle: '14c28n',
    nom: '14C28N inoxydable',
    durete: 59,
    facteur: 0.88,
    entretien: 'Rien : lave-vaisselle tolere, jamais recommande',
    grain: 'Grain fin, un peu glissant sur la pierre',
    patine: 'Ne bouge pas, et ne raconte rien',
  },
  {
    cle: '1.2519',
    nom: '1.2519 au tungstene',
    durete: 62,
    facteur: 1.32,
    entretien: 'Essuyer et huiler, comme le carbone',
    grain: 'Carbures durs : longue tenue, affutage lent',
    patine: 'Patine sombre, tres reguliere',
  },
] as const satisfies readonly Acier[]

/** Les epaisseurs de barre, au dos de la lame, en millimetres. */
const EPAISSEURS = [2.5, 3.2, 4] as const

/** Les quatre reponses de la question, et ce qu elles commandent. */
const REPONSES = [
  {
    cle: 'legumes',
    question: 'Des legumes, tous les jours',
    ecrite: 'Alors il vous faut une lame qui traverse, pas une lame qui fend.',
    emouture: 'plate',
    acier: 'xc75',
    epaisseur: 2.5,
  },
  {
    cle: 'pain',
    question: 'Du pain, de la viande, un peu de tout',
    ecrite: 'Alors il vous faut une lame qui encaisse un levier sans broncher.',
    emouture: 'sabre',
    acier: '14c28n',
    epaisseur: 3.2,
  },
  {
    cle: 'bois',
    question: 'Du bois, dehors, souvent',
    ecrite: 'Alors il vous faut un biseau court, et rien devant lui.',
    emouture: 'scandi',
    acier: '1.2519',
    epaisseur: 4,
  },
  {
    cle: 'gibier',
    question: 'Du gibier, deux fois par an',
    ecrite: 'Alors il vous faut un fil qui mord tout de suite, meme froid.',
    emouture: 'creuse',
    acier: 'xc75',
    epaisseur: 3.2,
  },
] as const

/** Les liens de la barre. */
const NAVIGATION = [
  ['#profil', 'Le profil'],
  ['#acier', 'L acier'],
  ['#manche', 'Le manche'],
  ['#commande', 'Commander'],
] as const

/** Les couches du pied, comme une coupe de mur. */
const COUCHES = [
  {
    cle: 'fil',
    titre: 'Le fil',
    epaisseur: '0,4 mm',
    texte: 'Affute a la pierre a eau, mille puis six mille, sans micro-biseau. Le fil part de l atelier a quinze degres par face.',
  },
  {
    cle: 'lame',
    titre: 'La lame',
    epaisseur: '3,2 mm',
    texte: 'Barre forgee a Thiers, trempee a huile, revenue deux fois. Le numero de coulee est grave sous le manche.',
  },
  {
    cle: 'manche',
    titre: 'Le manche',
    epaisseur: '22 mm',
    texte: 'Plaquettes de buis, de genevrier ou de micarta, rivetees laiton. Ajustees a la main, jamais tournees.',
  },
  {
    cle: 'maison',
    titre: 'La maison',
    epaisseur: '—',
    texte: 'Emouture — 8 rue des Forgerons, 63300 Thiers. Atelier ouvert le vendredi, de 14 h a 18 h.',
  },
] as const

/* ============================ La geometrie ============================= */

/** Ce que la geometrie donne, et que rien n ecrit a la main. */
interface Profil {
  /** Hauteur de l emouture, en millimetres. */
  readonly hauteur: number
  /** Demi-angle de l emouture, en degres. */
  readonly demi: number
  /** Angle inclus, en degres. */
  readonly inclus: number
  /** Epaisseur a un millimetre du fil, en millimetres. */
  readonly derriere: number
  /** Epaisseur au milieu de l emouture, en millimetres. */
  readonly milieu: number
  /** Rayon de meule equivalent a la fleche, en millimetres. Nul pour une plate. */
  readonly meule: number
  /** Surface a affuter, une face, en millimetres carres. */
  readonly surface: number
}

/**
 * L epaisseur de la lame a une distance donnee du fil.
 *
 * La plate est une droite : l epaisseur croit comme la distance fois la
 * tangente du demi-angle. La creuse et la convexe ajoutent une fleche, prise
 * en parabole — a fleche faible, la parabole et l arc de cercle se confondent
 * a moins d un centieme.
 */
function epaisseurA(distance: number, hauteur: number, demiEpaisseur: number, fleche: number): number {
  const droite = (distance / hauteur) * demiEpaisseur
  const demi = hauteur / 2
  const courbe = fleche * (1 - ((distance - demi) / demi) ** 2)
  return Math.max(0.01, 2 * (droite + courbe))
}

/** Le profil complet, deduit de l emouture et de l epaisseur au dos. */
function profilDe(emouture: Emouture, epaisseur: number): Profil {
  const hauteur = emouture.part * HAUTEUR
  const demiEpaisseur = epaisseur / 2
  const demi = (Math.atan(demiEpaisseur / hauteur) * 180) / Math.PI
  // La relation de la corde et de la fleche : R = (corde / 2) au carre, sur
  // deux fleches. C est le rayon de la meule qu il faudrait pour la tailler.
  const meule = emouture.fleche === 0 ? 0 : (hauteur / 2) ** 2 / (2 * Math.abs(emouture.fleche))
  return {
    hauteur,
    demi,
    inclus: demi * 2,
    derriere: epaisseurA(1, hauteur, demiEpaisseur, emouture.fleche),
    milieu: epaisseurA(hauteur / 2, hauteur, demiEpaisseur, emouture.fleche),
    meule,
    surface: hauteur * LONGUEUR,
  }
}

/** L epaisseur derriere le fil de la reference : la plate pleine hauteur en 3,2. */
const REFERENCE = profilDe(EMOUTURES[0], 3.2).derriere

/** Un nombre a la francaise. */
function nombre(valeur: number, decimales = 0): string {
  return valeur.toLocaleString('fr-FR', { minimumFractionDigits: decimales, maximumFractionDigits: decimales })
}

/* ============================ Le plan cote ============================= */

/**
 * Les deux echelles du plan.
 *
 * Une coupe de lame fait trente-huit millimetres de haut sur trois
 * d epaisseur : au meme rapport, ce serait un trait. Les feuilles d atelier
 * dilatent l epaisseur, et l ecrivent sur le plan — c est ce qu on fait ici.
 */
const ECHELLE_X = 15
const ECHELLE_Y = 46
/** L origine du plan : le fil, a gauche, sur l axe. */
const FIL_X = 74
const AXE_Y = 188

/** Un point du plan, du fil vers le dos. */
function pointPlan(distance: number, demiEpaisseur: number): readonly [number, number] {
  return [FIL_X + distance * ECHELLE_X, AXE_Y - demiEpaisseur * ECHELLE_Y]
}

/**
 * La coupe de la lame, cotee.
 *
 * Le trace suit la geometrie, pas une silhouette dessinee a l oeil : chaque
 * point de la face vient de {@link epaisseurA}. Changer d emouture change la
 * courbe et les cotes en meme temps, parce que c est la meme source.
 */
function PlanCote({ emouture, epaisseur, profil }: { readonly emouture: Emouture; readonly epaisseur: number; readonly profil: Profil }): ReactElement {
  const demiEpaisseur = epaisseur / 2
  const trait = encreSurSombre()
  const cote = 'var(--o-palette-stone-300)'
  const filet = 'var(--o-palette-stone-600)'

  // La face superieure, du fil au haut de l emouture, puis le plat jusqu au
  // dos, puis le dos arrondi.
  const face = useMemo(() => {
    const pas = profil.hauteur / 40
    const points: string[] = []
    for (let d = 0; d <= profil.hauteur + 0.0001; d += pas) {
      const [x, y] = pointPlan(d, epaisseurA(d, profil.hauteur, demiEpaisseur, emouture.fleche) / 2)
      points.push(`${x.toFixed(1)} ${y.toFixed(1)}`)
    }
    const [dosX, dosY] = pointPlan(HAUTEUR, demiEpaisseur)
    points.push(`${dosX.toFixed(1)} ${dosY.toFixed(1)}`)
    return points.join('L')
  }, [profil.hauteur, demiEpaisseur, emouture.fleche])

  const faceBasse = useMemo(() => {
    const pas = profil.hauteur / 40
    const points: string[] = []
    for (let d = profil.hauteur; d >= -0.0001; d -= pas) {
      const [x, y] = pointPlan(d, -epaisseurA(d, profil.hauteur, demiEpaisseur, emouture.fleche) / 2)
      points.push(`${x.toFixed(1)} ${y.toFixed(1)}`)
    }
    return points.join('L')
  }, [profil.hauteur, demiEpaisseur, emouture.fleche])

  const [dosHaut] = [pointPlan(HAUTEUR, demiEpaisseur)]
  const [dosBas] = [pointPlan(HAUTEUR, -demiEpaisseur)]
  const [milieuX] = [pointPlan(profil.hauteur / 2, 0)]

  return (
    <svg viewBox="0 0 720 360" className="o-h-full o-w-full" fill="none" aria-hidden="true">
      {/* La matiere, hachuree comme sur une coupe. */}
      <defs>
        <pattern id="o-couteau-acier" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <line x1="0" y1="0" x2="0" y2="6" stroke={trait} strokeWidth="1" strokeOpacity="0.45" />
        </pattern>
      </defs>

      <path
        d={`M${face}L${dosHaut[0].toFixed(1)} ${dosBas[1].toFixed(1)}L${faceBasse}Z`}
        fill="url(#o-couteau-acier)"
        stroke={trait}
        strokeWidth="1.6"
        strokeLinejoin="round"
      />

      {/* L axe de la lame. */}
      <line x1={FIL_X - 30} y1={AXE_Y} x2={dosHaut[0] + 40} y2={AXE_Y} stroke={filet} strokeWidth="0.9" strokeDasharray="10 4 2 4" />

      {/* La ligne de cote de la hauteur de lame. */}
      <g stroke={cote} strokeWidth="0.9">
        <line x1={FIL_X} y1={AXE_Y + 108} x2={dosHaut[0]} y2={AXE_Y + 108} />
        <line x1={FIL_X} y1={AXE_Y + 4} x2={FIL_X} y2={AXE_Y + 116} />
        <line x1={dosHaut[0]} y1={dosBas[1]} x2={dosHaut[0]} y2={AXE_Y + 116} />
        {/* La ligne de cote de la hauteur d emouture. */}
        <line x1={FIL_X} y1={AXE_Y + 74} x2={FIL_X + profil.hauteur * ECHELLE_X} y2={AXE_Y + 74} />
        <line x1={FIL_X + profil.hauteur * ECHELLE_X} y1={AXE_Y + 10} x2={FIL_X + profil.hauteur * ECHELLE_X} y2={AXE_Y + 82} />
        {/* La ligne de cote de l epaisseur au dos. */}
        <line x1={dosHaut[0] + 34} y1={dosHaut[1]} x2={dosHaut[0] + 34} y2={dosBas[1]} />
        <line x1={dosHaut[0]} y1={dosHaut[1]} x2={dosHaut[0] + 42} y2={dosHaut[1]} />
        <line x1={dosHaut[0]} y1={dosBas[1]} x2={dosHaut[0] + 42} y2={dosBas[1]} />
      </g>

      {/* Le repere a un millimetre du fil : le seul chiffre qui dise si ca coupe. */}
      <g stroke={trait} strokeWidth="1.1">
        <line x1={FIL_X + ECHELLE_X} y1={AXE_Y - 64} x2={FIL_X + ECHELLE_X} y2={AXE_Y + 34} strokeDasharray="3 3" />
        <circle cx={FIL_X + ECHELLE_X} cy={AXE_Y} r="3" fill={trait} />
      </g>

      {/* L angle inclus, ouvert au fil. */}
      <path
        d={`M${String(FIL_X + 56)} ${(AXE_Y - 56 * Math.tan((profil.demi * Math.PI) / 180) * (ECHELLE_Y / ECHELLE_X)).toFixed(1)} A 56 56 0 0 0 ${String(FIL_X + 56)} ${(AXE_Y + 56 * Math.tan((profil.demi * Math.PI) / 180) * (ECHELLE_Y / ECHELLE_X)).toFixed(1)}`}
        stroke={cote}
        strokeWidth="0.9"
      />

      {/* Les chiffres, poses sur leurs lignes de cote. */}
      <g fill={cote} style={{ fontFamily: 'var(--o-font-mono)', fontSize: 12, letterSpacing: '0.06em' }}>
        <text x={(FIL_X + dosHaut[0]) / 2} y={AXE_Y + 124} textAnchor="middle">{`hauteur de lame ${nombre(HAUTEUR)} mm`}</text>
        <text x={FIL_X + (profil.hauteur * ECHELLE_X) / 2} y={AXE_Y + 66} textAnchor="middle" fill={trait}>
          {`emouture ${nombre(profil.hauteur, 1)} mm`}
        </text>
        <text x={dosHaut[0] + 50} y={AXE_Y + 4}>{`dos ${nombre(epaisseur, 1)} mm`}</text>
        <text x={FIL_X + ECHELLE_X + 10} y={AXE_Y - 70} fill={trait}>
          {`${nombre(profil.derriere, 2)} mm a 1 mm du fil`}
        </text>
        <text x={FIL_X + 66} y={AXE_Y + 4}>{`${nombre(profil.inclus, 1)}°`}</text>
        {emouture.fleche !== 0 && (
          <text x={milieuX[0]} y={AXE_Y - 92} textAnchor="middle">
            {`fleche ${nombre(Math.abs(emouture.fleche), 2)} mm — meule ${nombre(profil.meule)} mm`}
          </text>
        )}
        <text x="16" y="26" fill={filet}>{`Coupe A-A — echelle ${String(ECHELLE_X)} : 1 en hauteur, ${String(ECHELLE_Y)} : 1 en epaisseur`}</text>
        <text x="16" y="346" fill={filet}>Emouture — plan 04, couteau de table 195</text>
      </g>
    </svg>
  )
}

/* ============================ Le profil de lame ======================== */

/** La lame vue de cote, avec la ligne d emouture a sa hauteur reelle. */
function LameDeProfil({ emouture }: { readonly emouture: Emouture }): ReactElement {
  const trait = encreSurSombre()
  const filet = 'var(--o-palette-stone-500)'
  // La ligne d emouture descend d autant que l emouture est basse.
  const y = 38 + (1 - emouture.part) * 54

  return (
    <svg viewBox="0 0 460 120" className="o-h-full o-w-full" fill="none" aria-hidden="true">
      {/* La lame : dos droit, ventre qui remonte, pointe. */}
      <path
        d="M34 30 H286 C360 32 418 44 446 62 C418 80 360 94 286 100 H34 Q20 66 34 30 Z"
        stroke={trait}
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      {/* La ligne d emouture, posee a la hauteur que la geometrie donne. */}
      <path d={`M48 ${String(Math.round(y))} H300 Q372 ${String(Math.round(y))} 424 62`} stroke={filet} strokeWidth="1.3" strokeDasharray="7 5" />
      {/* La soie, en pointille : elle continue dans le manche, hors cadre. */}
      <path d="M34 44 H2 M34 88 H2" stroke={filet} strokeWidth="1.1" strokeDasharray="3 4" />
      {/* Le talon, marque d un trait plein. */}
      <path d="M34 30 V100" stroke={filet} strokeWidth="1.1" />
    </svg>
  )
}

/* ============================ Les petites pieces ======================= */

/** Un choix : une case franche, sans rondeur. Artefakt ne connait pas la gelule. */
function Case({ actif, onClick, children }: { readonly actif: boolean; readonly onClick: () => void; readonly children: ReactNode }): ReactElement {
  return (
    <button
      type="button"
      aria-pressed={actif}
      onClick={onClick}
      className="o-border-w-1 o-px-3.5 o-py-2 o-text-left o-font-mono o-text-xs o-uppercase o-tracking-wider o-transition-colors focus:o-ring"
      style={actif ? { ...aplat(), borderColor: 'transparent' } : { borderColor: 'var(--o-theme-line)', color: 'var(--o-palette-stone-300)' }}
    >
      {children}
    </button>
  )
}

/** Une valeur du plan, reprise en clair a cote du dessin. */
function Cote({ quoi, valeur, note }: { readonly quoi: string; readonly valeur: string; readonly note?: string }): ReactElement {
  return (
    <div className="o-border-t o-border-white-10 o-py-3.5">
      <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-400">{quoi}</dt>
      <dd className="o-m-0 o-mt-1 o-tabular-nums o-text-stone-50" style={{ ...affiche('m', 300), fontSize: 'clamp(1.25rem, 2.2vw, 1.875rem)' }}>
        {valeur}
      </dd>
      {note !== undefined && <p className="o-m-0 o-mt-1 o-text-xs o-leading-relaxed o-text-stone-400">{note}</p>}
    </div>
  )
}

/* ============================ La page ================================== */

export default function Page(): ReactElement {
  const polices = usePolices('affiche')
  const { reduced } = useMotionState()

  const [cleEmouture, setCleEmouture] = useState<string>(EMOUTURES[0].cle)
  const [cleAcier, setCleAcier] = useState<string>(ACIERS[0].cle)
  const [epaisseur, setEpaisseur] = useState<number>(3.2)
  const [reponse, setReponse] = useState<string | null>(null)

  const emouture: Emouture = EMOUTURES.find((e) => e.cle === cleEmouture) ?? EMOUTURES[0]
  const acier: Acier = ACIERS.find((a) => a.cle === cleAcier) ?? ACIERS[0]
  const profil = useMemo(() => profilDe(emouture, epaisseur), [emouture, epaisseur])

  // L effort de coupe, et la tenue du fil : deux nombres relatifs, tires de la
  // meme epaisseur derriere le fil. L effort lui est proportionnel, la tenue
  // croit comme sa racine — c est la quantite d acier qui soutient le fil.
  const effort = Math.round((profil.derriere / REFERENCE) * 100)
  const tenue = Math.round(Math.sqrt(profil.derriere / REFERENCE) * 100 * acier.facteur)

  const choisie = REPONSES.find((r) => r.cle === reponse)

  const repondre = (cle: string): void => {
    const trouvee = REPONSES.find((r) => r.cle === cle)
    if (trouvee === undefined) return
    setReponse(cle)
    setCleEmouture(trouvee.emouture)
    setCleAcier(trouvee.acier)
    setEpaisseur(trouvee.epaisseur)
  }

  /** Un filet de la grille : une encre translucide, pas un aplat. */
  const filet = (part: number): string => `color-mix(in oklab, ${accent(300)} ${String(part)}%, transparent)`

  return (
    <Porte forme="trou" marque="Emouture" >
      <div className="o-relative o-text-stone-50" style={{ ...polices, ...nuit('stone') }}>
        {/* La grille : un aplat fixe, dix millimetres de cote, avec une maille
            forte tous les cinq carreaux. Rien ne bouge derriere le texte. */}
        <div
          aria-hidden="true"
          className="o-pointer-events-none o-fixed o-inset-0 o-z-0"
          style={{
            backgroundImage: [
              `linear-gradient(to right, ${filet(14)} 1px, transparent 1px)`,
              `linear-gradient(to bottom, ${filet(14)} 1px, transparent 1px)`,
              `linear-gradient(to right, ${filet(5)} 1px, transparent 1px)`,
              `linear-gradient(to bottom, ${filet(5)} 1px, transparent 1px)`,
            ].join(', '),
            backgroundSize: '200px 200px, 200px 200px, 40px 40px, 40px 40px',
          }}
        />

        <div className="o-relative o-z-10">
          <BarreFilet marque="Emouture" liens={NAVIGATION} action={['#commande', 'Commander']} />

          <main>
            {/*
              ----- L ouverture : la lame, et le champ d aiguilles -----------
            */}
            <section id="haut" className="o-relative o-flex o-flex-col o-overflow-hidden" style={{ minHeight: ECRAN }}>
              <div aria-hidden="true" className="o-pointer-events-none o-absolute o-inset-y-0 o-right-0 o-hidden o-w-1/2 lg:o-block">
                <MagnetLines rows={12} columns={14} length={24} thickness={2} reach={300} idle={-32} color={filet(62)} className="o-absolute o-inset-0" />
              </div>

              <div className="o-relative o-flex o-grow o-flex-col o-justify-center o-px-6 o-py-10 md:o-px-12">
                <Surgit>
                  <Etiquette>Thiers — huit couteliers, une seule emouture par piece</Etiquette>
                </Surgit>
                <TitreVague
                  delai={140}
                  className="o-m-0 o-mt-7 o-max-w-3xl"
                  style={{ ...affiche('l', 400), fontSize: 'clamp(2rem, 5.8vw, 5.5rem)', lineHeight: 0.94, letterSpacing: '-0.045em' }}
                >
                  Ce qui coupe, c est la geometrie.
                </TitreVague>

                <div className="o-mt-10 o-max-w-xl">
                  <Surgit delai={540} as="p" className="o-m-0 o-text-base o-leading-relaxed o-text-stone-300">
                    Un fil aiguise sur une lame epaisse fend ; un fil moyen sur une lame mince tranche. Tout se joue dans le millimetre derriere le tranchant, et ce millimetre se dessine.
                  </Surgit>
                  <Surgit delai={680} className="o-mt-8">
                    <Actions
                      pleine={['#profil', <>Ouvrir le plan <Icon icon={ArrowDown} size={16} aria-hidden="true" /></>]}
                      fantome={['#commande', 'Quatre questions']}
                    />
                  </Surgit>
                </div>

                <Surgit delai={820} className="o-mt-10 o-max-w-md o-opacity-90">
                  <LameDeProfil emouture={emouture} />
                </Surgit>
              </div>

              <Coin position="bd">
                Plan 04 — couteau de table 195
                <br />
                Acier {acier.nom} — {String(acier.durete)} HRC
              </Coin>
            </section>

            {/*
              ----- Le mecanisme : le plan cote, en chapitre -----------------
            */}
            <Chapitre
              id="profil"
              largeur={4}
              className="o-scroll-mt-24 o-border-t o-border-white-10 o-px-6 o-py-16 md:o-px-12 md:o-py-24"
              indice="(01) — Le profil"
              titre={
                <h2 className="o-m-0 o-max-w-sm" style={{ ...affiche('m', 400), fontSize: 'clamp(1.75rem, 3.2vw, 2.75rem)', lineHeight: 1 }}>
                  {emouture.nom}.
                </h2>
              }
              texte={
                <div className="o-flex o-flex-col o-gap-6">
                  <p className="o-m-0 o-text-sm o-leading-relaxed o-text-stone-300">{emouture.note}</p>

                  <fieldset className="o-m-0 o-p-0">
                    <legend className="o-mb-2.5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-400">L emouture</legend>
                    <div className="o-flex o-flex-col o-gap-1.5">
                      {EMOUTURES.map((e) => (
                        <Case key={e.cle} actif={e.cle === cleEmouture} onClick={() => { setCleEmouture(e.cle) }}>
                          {e.nom}
                        </Case>
                      ))}
                    </div>
                  </fieldset>

                  <fieldset className="o-m-0 o-p-0">
                    <legend className="o-mb-2.5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-400">L epaisseur au dos</legend>
                    <div className="o-flex o-flex-wrap o-gap-1.5">
                      {EPAISSEURS.map((e) => (
                        <Case key={e} actif={e === epaisseur} onClick={() => { setEpaisseur(e) }}>
                          {`${nombre(e, 1)} mm`}
                        </Case>
                      ))}
                    </div>
                  </fieldset>
                </div>
              }
            >
              <div className="o-border-w-1 o-border-white-10 o-p-3 md:o-p-5" style={{ backgroundColor: `color-mix(in oklab, ${accent(900)} 22%, var(--o-theme-bg))` }}>
                <PlanCote emouture={emouture} epaisseur={epaisseur} profil={profil} />
              </div>

              <dl className="o-m-0 o-mt-8 o-grid o-gap-x-10 sm:o-grid-cols-2">
                <Cote
                  quoi="Angle inclus"
                  valeur={`${nombre(profil.inclus, 1)}°`}
                  note={`Soit ${nombre(profil.demi, 1)}° par face, avant tout micro-biseau.`}
                />
                <Cote
                  quoi="Epaisseur a 1 mm du fil"
                  valeur={`${nombre(profil.derriere, 2)} mm`}
                  note="Le seul chiffre qui dise si une lame traverse ou si elle fend."
                />
                <Cote
                  quoi="Effort de coupe"
                  valeur={`${String(effort)} %`}
                  note="Base cent sur la plate pleine hauteur, en trois millimetres deux."
                />
                <Cote
                  quoi="Tenue du fil"
                  valeur={String(tenue)}
                  note={`${acier.nom}, ${String(acier.durete)} HRC. La tenue croit comme la racine de l epaisseur derriere le fil.`}
                />
                <Cote
                  quoi="Surface a affuter, une face"
                  valeur={`${nombre(profil.surface)} mm²`}
                  note={`${nombre(profil.hauteur, 1)} mm d emouture sur ${String(LONGUEUR)} mm de lame.`}
                />
                <Cote
                  quoi={emouture.fleche === 0 ? 'Fleche au milieu' : 'Meule equivalente'}
                  valeur={emouture.fleche === 0 ? 'Aucune — face plane' : `${nombre(profil.meule)} mm`}
                  note={
                    emouture.fleche === 0
                      ? 'Une face plane se refait sur une pierre plate, sans gabarit.'
                      : `Fleche de ${nombre(Math.abs(emouture.fleche), 2)} mm ${emouture.fleche < 0 ? 'en creux' : 'en bombe'} au milieu de l emouture.`
                  }
                />
              </dl>
            </Chapitre>

            {/*
              ----- Les cinq emoutures, cote a cote --------------------------
            */}
            <section className="o-border-t o-border-white-10 o-px-6 o-py-16 md:o-px-12 md:o-py-24">
              <Indice rang="02">Les cinq</Indice>
              <h2 className="o-m-0 o-mt-4 o-max-w-2xl" style={{ ...affiche('m', 400), fontSize: 'clamp(1.625rem, 3.4vw, 3rem)', lineHeight: 1 }}>
                Aucune n est meilleure. Elles repondent a des questions differentes.
              </h2>
              {/* Le tableau porte cinq colonnes : sur un telephone il ne
                  rentre pas, et il doit defiler de cote. La bande declare son
                  `overflow-y` : sans lui, elle avalerait la molette et figerait
                  la page. */}
              <div className="o-relative o-mt-10 o-overflow-x-auto" style={{ overflowY: 'hidden' }}>
                <ComparisonTable
                  caption="Les cinq emoutures taillees a l atelier, en trois millimetres deux au dos"
                  maxHeight={520}
                  columns={EMOUTURES.map((e) => ({ name: e.nom, note: e.usage, featured: e.cle === cleEmouture }))}
                  rows={[
                    { label: 'Hauteur d emouture', values: EMOUTURES.map((e) => `${nombre(profilDe(e, 3.2).hauteur, 1)} mm`) },
                    { label: 'Angle inclus', values: EMOUTURES.map((e) => `${nombre(profilDe(e, 3.2).inclus, 1)}°`) },
                    { label: 'A 1 mm du fil', values: EMOUTURES.map((e) => `${nombre(profilDe(e, 3.2).derriere, 2)} mm`) },
                    { label: 'Effort de coupe', values: EMOUTURES.map((e) => `${String(Math.round((profilDe(e, 3.2).derriere / REFERENCE) * 100))} %`) },
                    { label: 'Face plane', values: EMOUTURES.map((e) => e.fleche === 0) },
                    { label: 'Affutage sans gabarit', values: EMOUTURES.map((e) => e.fleche >= 0 && e.part < 0.6) },
                  ]}
                />
              </div>
            </section>

            {/*
              ----- L acier, en chapitre -------------------------------------
            */}
            <Chapitre
              id="acier"
              largeur={4}
              className="o-scroll-mt-24 o-border-t o-border-white-10 o-px-6 o-py-16 md:o-px-12 md:o-py-24"
              indice="(03) — L acier"
              titre={
                <h2 className="o-m-0 o-max-w-sm" style={{ ...affiche('m', 400), fontSize: 'clamp(1.75rem, 3.2vw, 2.75rem)', lineHeight: 1 }}>
                  Trois barres, trois caracteres.
                </h2>
              }
              texte={
                <p className="o-m-0 o-text-sm o-leading-relaxed o-text-stone-300">
                  Nous ne tenons pas dix aciers. Un carbone qui se refait en dix passes, un inoxydable pour ceux qui oublient d essuyer, et un allie pour ceux qui coupent beaucoup et affutent peu.
                </p>
              }
            >
              <ol className="o-m-0 o-list-none o-p-0">
                {ACIERS.map((a, rang) => {
                  const actif = a.cle === cleAcier
                  return (
                    <li key={a.cle} className="o-border-t o-border-white-10">
                      <button
                        type="button"
                        aria-pressed={actif}
                        onClick={() => { setCleAcier(a.cle) }}
                        className="o-grid o-w-full o-cursor-pointer o-gap-x-8 o-gap-y-3 o-py-7 o-text-left o-transition-colors hover:o-bg-white-10 focus:o-ring md:o-grid-cols-12"
                      >
                        <span className="o-flex o-items-baseline o-gap-4 md:o-col-span-5">
                          <span className="o-font-mono o-text-xs o-tabular-nums" style={{ color: actif ? encreSurSombre() : 'var(--o-palette-stone-400)' }}>
                            {String(rang + 1).padStart(2, '0')}
                          </span>
                          <span style={{ ...affiche('m', 400), fontSize: 'clamp(1.375rem, 2.6vw, 2.125rem)', lineHeight: 1, color: actif ? encreSurSombre() : undefined }}>
                            {a.nom}
                          </span>
                        </span>
                        <span className="o-flex o-flex-col o-gap-1 o-text-sm o-text-stone-300 md:o-col-span-7">
                          <span>{a.grain}</span>
                          <span className="o-text-stone-400">{a.entretien}</span>
                          <span className="o-font-mono o-text-xs o-uppercase o-tracking-wider o-text-stone-400">
                            {String(a.durete)} HRC — tenue {nombre(a.facteur * 100)} — {a.patine}
                          </span>
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ol>
            </Chapitre>

            {/*
              ----- Le manche : une figure large, et sa legende dans la marge -
            */}
            <section id="manche" className="o-scroll-mt-24 o-border-t o-border-white-10 o-px-6 o-py-16 md:o-px-12 md:o-py-24">
              <div className="o-grid o-gap-10 lg:o-grid-cols-12">
                <div className="lg:o-col-span-3">
                  <Indice rang="04">Le manche</Indice>
                  <p className="o-m-0 o-mt-6 o-text-sm o-leading-relaxed o-text-stone-300">
                    Deux plaquettes, trois rivets, et une soie qui traverse. Le manche est ajuste sur la main qui l a commande : on demande une pointure, comme pour un gant.
                  </p>
                  <dl className="o-m-0 o-mt-8">
                    {([
                      ['Buis', 'Dense, jaune paille, se polit a la main'],
                      ['Genevrier', 'Leger, odorant, veine tres marquee'],
                      ['Micarta', 'Toile et resine, accroche mouille'],
                    ] as const).map(([quoi, texte]) => (
                      <div key={quoi} className="o-border-t o-border-white-10 o-py-3">
                        <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: encreSurSombre() }}>{quoi}</dt>
                        <dd className="o-m-0 o-mt-1 o-text-sm o-text-stone-300">{texte}</dd>
                      </div>
                    ))}
                  </dl>
                </div>

                <div className="o-min-w-0 lg:o-col-span-9">
                  <svg viewBox="0 0 900 260" className="o-w-full" fill="none" aria-hidden="true">
                    {/* La soie, qui traverse le manche de part en part. */}
                    <path d="M120 118 H716 V148 H120 Z" fill={filet(18)} stroke={encreSurSombre()} strokeWidth="1.2" />
                    {/* Les deux plaquettes, en coupe. */}
                    <path d="M330 74 H700 Q724 74 724 96 V170 Q724 192 700 192 H330 Q318 192 318 176 V90 Q318 74 330 74 Z" stroke={encreSurSombre()} strokeWidth="1.8" />
                    {/* La lame, qui sort a gauche. */}
                    <path d="M318 108 L60 100 L20 118 L60 146 L318 158 Z" fill={filet(10)} stroke={encreSurSombre()} strokeWidth="1.6" strokeLinejoin="round" />
                    {/* Les trois rivets, cotes. */}
                    {[392, 520, 650].map((x) => (
                      <g key={x}>
                        <circle cx={x} cy="133" r="13" stroke="var(--o-palette-stone-300)" strokeWidth="1.3" />
                        <circle cx={x} cy="133" r="4" fill="var(--o-palette-stone-300)" />
                        <line x1={x} y1="206" x2={x} y2="150" stroke="var(--o-palette-stone-500)" strokeWidth="0.9" strokeDasharray="4 3" />
                      </g>
                    ))}
                    {/* Les lignes de cote du manche. */}
                    <g stroke="var(--o-palette-stone-400)" strokeWidth="0.9">
                      <line x1="318" y1="228" x2="724" y2="228" />
                      <line x1="318" y1="198" x2="318" y2="236" />
                      <line x1="724" y1="198" x2="724" y2="236" />
                      <line x1="760" y1="74" x2="760" y2="192" />
                      <line x1="724" y1="74" x2="768" y2="74" />
                      <line x1="724" y1="192" x2="768" y2="192" />
                    </g>
                    <g fill="var(--o-palette-stone-300)" style={{ fontFamily: 'var(--o-font-mono)', fontSize: 13 }}>
                      <text x="521" y="248" textAnchor="middle">manche 118 mm</text>
                      <text x="778" y="138">22 mm</text>
                      <text x="392" y="222" textAnchor="middle">rivets laiton 4 mm</text>
                      <text x="120" y="88">soie traversante</text>
                    </g>
                  </svg>
                  <p className="o-m-0 o-mt-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-400">
                    Figure 2 — montage plein manche, coupe longitudinale
                  </p>
                </div>
              </div>
            </section>

            {/*
              ----- La question, et la reponse ecrite en grand ---------------
            */}
            <section
              id="commande"
              className="o-flex o-scroll-mt-24 o-flex-col o-justify-center o-border-t o-border-white-10 o-px-6 o-py-20 md:o-px-12"
              style={{ minHeight: ECRAN, backgroundColor: `color-mix(in oklab, ${accent(900)} 30%, var(--o-theme-bg))` }}
            >
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-400">
                Une seule question — la reponse commande tout le reste
              </p>
              <h2 className="o-m-0 o-mt-5 o-max-w-3xl" style={{ ...affiche('m', 400), fontSize: 'clamp(1.75rem, 4vw, 3.5rem)', lineHeight: 1 }}>
                Que coupez-vous, le plus souvent ?
              </h2>

              <ul className="o-m-0 o-mt-10 o-flex o-list-none o-flex-wrap o-gap-2 o-p-0">
                {REPONSES.map((r) => (
                  <li key={r.cle}>
                    <Case actif={r.cle === reponse} onClick={() => { repondre(r.cle) }}>
                      {r.question}
                    </Case>
                  </li>
                ))}
              </ul>

              <div className="o-mt-14 o-min-h-48">
                {choisie === undefined ? (
                  <p className="o-m-0 o-max-w-3xl o-text-stone-500" style={{ ...affiche('m', 400), fontSize: 'clamp(1.5rem, 4.4vw, 4rem)', lineHeight: 1.04 }}>
                    Choisissez, et la reponse s ecrit ici.
                  </p>
                ) : (
                  <>
                    <SplitLines
                      key={choisie.cle}
                      as="p"
                      declenchement="montage"
                      duration={760}
                      stagger={110}
                      className="o-m-0 o-max-w-3xl"
                      style={{ ...affiche('m', 400), fontSize: 'clamp(1.5rem, 4.4vw, 4rem)', lineHeight: 1.04 }}
                    >
                      {choisie.ecrite}
                    </SplitLines>
                    <p className="o-m-0 o-mt-8 o-max-w-xl o-text-sm o-leading-relaxed o-text-stone-300">
                      Le plan est regle : {emouture.nom.toLowerCase()}, {acier.nom}, {nombre(epaisseur, 1)} mm au dos. Remontez pour le voir, ou ecrivez-nous avec ces trois mots.
                    </p>
                  </>
                )}
              </div>

              <div className="o-mt-12">
                <a
                  href="mailto:atelier@emouture-thiers.fr"
                  className="o-inline-flex o-items-center o-gap-3 o-border-w-1 o-px-8 o-py-4 o-text-sm o-font-semibold o-no-underline o-transition-colors focus:o-ring"
                  style={aplat()}
                >
                  Commander une piece
                  <Icon icon={ArrowUpRight} size={17} aria-hidden="true" />
                </a>
              </div>
            </section>
          </main>

          {/*
            ----- Le pied : une coupe, comme une tranche de mur -------------

            Quatre couches empilees, chacune hachuree, avec sa cote a gauche :
            le fil, la lame, le manche, la maison. On lit le pied comme on lit
            un detail de construction, de haut en bas.
          */}
          <footer className="o-relative o-border-t o-border-white-10 o-px-6 o-pb-10 o-pt-12 md:o-px-12">
            <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-400">
              Detail 1 — coupe verticale, de haut en bas
            </p>

            <div className="o-mt-6 o-border-w-1 o-border-white-20">
              {COUCHES.map((couche, rang) => (
                <div
                  key={couche.cle}
                  className={`o-grid o-gap-x-8 o-gap-y-2 o-px-5 o-py-6 md:o-grid-cols-12 ${rang > 0 ? 'o-border-t o-border-white-20' : ''}`}
                  style={{
                    backgroundImage: `repeating-linear-gradient(${String(rang % 2 === 0 ? 45 : -45)}deg, ${filet(rang === COUCHES.length - 1 ? 4 : 9)} 0 1px, transparent 1px ${String(7 + rang * 2)}px)`,
                  }}
                >
                  <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-tabular-nums md:o-col-span-2" style={{ color: encreSurSombre() }}>
                    {couche.epaisseur}
                  </p>
                  <p className="o-m-0 md:o-col-span-3" style={{ ...affiche('m', 400), fontSize: 'clamp(1.25rem, 2.4vw, 1.875rem)', lineHeight: 1 }}>
                    {couche.titre}
                  </p>
                  <p className="o-m-0 o-text-sm o-leading-relaxed o-text-stone-300 md:o-col-span-7">{couche.texte}</p>
                </div>
              ))}
            </div>

            <div className="o-mt-8 o-flex o-flex-wrap o-items-center o-justify-between o-gap-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-400">
              <span>© 2026 Emouture</span>
              <span>
                {reduced ? 'Plan fige — mouvement reduit' : 'Plans rediges a l atelier, cotes en millimetres'}
              </span>
              <a href="#haut" className="o-text-stone-400 o-no-underline hover:o-text-stone-50 focus:o-ring">Remonter ↑</a>
            </div>
          </footer>
        </div>
      </div>
    </Porte>
  )
}
