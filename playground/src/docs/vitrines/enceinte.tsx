/**
 * Membrane — fabricant d enceintes, Saint-Etienne.
 *
 * ## Ce que la page fait : la courbe
 *
 * Une enceinte n a pas de son : elle a un son **dans une piece**. Le mecanisme
 * de la page est donc un calcul de reponse en frequence qui tient compte de la
 * piece, et il est honnete de bout en bout — pas une courbe dessinee a la main
 * pour faire joli :
 *
 * - **le passe-haut du bass-reflex**, du quatrieme ordre, accorde a la
 *   frequence d event du modele ;
 * - **le mur de derriere** : l onde directe et l onde reflechie parcourent des
 *   chemins qui different de deux fois la distance au mur. Elles s annulent
 *   quand cette difference vaut une demi-longueur d onde, soit a
 *   `c / 4d` — a trente centimetres du mur, un creux de neuf decibels tombe a
 *   deux cent quatre-vingt-six hertz, en plein dans les voix ;
 * - **le gain de piece** sous le premier mode axial, `c / 2L` ;
 * - **les deux premiers modes axiaux**, en bosses etroites ;
 * - **le renfort d angle**, deux parois de plus sous deux cents hertz.
 *
 * De ces cinq termes sortent les chiffres affiches : la coupure a trois
 * decibels en piece, la profondeur du creux de mur, l ecart maximal dans le bas
 * medium, et **la distance au mur qui donne la courbe la plus droite** — celle
 * des quatre, cherchee par le calcul et non choisie par nous.
 *
 * ## L objet, et le balayage
 *
 * L enceinte est en volume, seule surface graphique de la page : son arriere-
 * plan est le fond, le moteur ouvrant ses contextes opaques. Un **balayage**
 * parcourt le spectre de vingt hertz a vingt kilohertz en neuf secondes, et il
 * mene deux choses a la fois : le curseur sur la courbe, et **le debattement du
 * haut-parleur**, qui suit la loi reelle — a niveau constant, le deplacement de
 * la membrane varie comme l inverse du carre de la frequence. C est pour cela
 * qu on voit le grave et qu on ne voit jamais l aigu.
 *
 * Refusee, la scene cede la place a la **meme enceinte dessinee**, de face et
 * de profil, dans la finition choisie.
 *
 * ## La couleur
 *
 * Les trois finitions sont trois points d un segment tendu entre l accent de la
 * vitrine et sa couleur d appoint, parcouru en polaire : aucune n est ecrite.
 * Repeindre la vitrine repeint le coffret, en scene comme au dessin.
 *
 * @module
 */

import { clock, CLOCK_PRIORITY, useMotionState } from '@odoro-cli/engine'
import { type SceneContext } from '@odoro-cli/engine/three'
import { Icon } from '@odoro-cli/icons'
import { ArrowDown, ArrowUpRight } from '@odoro-cli/icons/outline'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'

import { SplitReveal } from '@/odoro/text/SplitReveal.jsx'
import { AnimatedList } from '@/odoro/ui/AnimatedList.jsx'
import { SpotlightCard } from '@/odoro/ui/SpotlightCard.jsx'
import { StarBorder } from '@/odoro/ui/StarBorder.jsx'

import { nuit } from './communs.jsx'
import {
  Actions,
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
import { accent, aplat, encreSurSombre } from './palettes.js'
import { Aimant } from './scene.jsx'
import { eclairer, teinte, Volume } from './volume.jsx'

/** La hauteur d un ecran sous les barres de la documentation. */
const ECRAN = `calc(100vh - ${String(CHROME)}px)`

/** La celerite du son dans l air a vingt degres, en metres par seconde. */
const CELERITE = 343

/** Une couleur de la scene, typee sans dependre du paquet `three`. */
type Couleur3D = InstanceType<SceneContext['three']['Color']>

/* ============================ Le catalogue ============================= */

/** Un modele du catalogue. */
interface Modele {
  readonly cle: string
  readonly reference: string
  readonly nom: string
  readonly type: string
  /** Diametre du haut-parleur de grave, en centimetres. */
  readonly grave: number
  /** Largeur du baffle, en metres : elle fixe le palier de baffle. */
  readonly baffle: number
  /** Frequence d accord de l event, en hertz. */
  readonly accord: number
  /** Rendement, en decibels pour un watt a un metre. */
  readonly rendement: number
  readonly impedance: string
  readonly volume: string
  readonly coupure: number
  readonly dimensions: string
  readonly masse: string
  readonly prix: number
  readonly note: string
}

/** Les trois modeles tenus en atelier. */
const MODELES = [
  {
    cle: 'm12',
    reference: 'M-12',
    nom: 'Douze',
    type: 'Bibliotheque, deux voies',
    grave: 12,
    baffle: 0.16,
    accord: 58,
    rendement: 84,
    impedance: '6 ohms',
    volume: '4,2 litres',
    coupure: 2800,
    dimensions: '270 x 160 x 210 mm',
    masse: '4,1 kg',
    prix: 890,
    note: 'Le plus petit coffret que nous sachions faire sans mentir sur le grave. Il ne descend pas ; il ne pretend pas descendre.',
  },
  {
    cle: 'm18',
    reference: 'M-18',
    nom: 'Dix-huit',
    type: 'Bibliotheque, deux voies',
    grave: 18,
    baffle: 0.22,
    accord: 42,
    rendement: 87,
    impedance: '4 ohms',
    volume: '12,5 litres',
    coupure: 2200,
    dimensions: '380 x 220 x 290 mm',
    masse: '8,6 kg',
    prix: 1640,
    note: 'Celui que nous montons neuf fois sur dix. Un dix-huit centimetres dans douze litres : le meilleur rapport entre ce qu on entend et ce qu on encombre.',
  },
  {
    cle: 'm24',
    reference: 'M-24',
    nom: 'Vingt-quatre',
    type: 'Colonne, trois voies',
    grave: 24,
    baffle: 0.24,
    accord: 32,
    rendement: 90,
    impedance: '4 ohms',
    volume: '38 litres',
    coupure: 2000,
    dimensions: '1040 x 240 x 340 mm',
    masse: '24,8 kg',
    prix: 3280,
    note: 'Deux graves montes en serie, un medium clos, un dome de vingt-cinq. Elle demande trois metres de recul ; en dessous, elle vous ecrase.',
  },
] as const satisfies readonly Modele[]

/** Une piece d ecoute, avec ses cotes reelles. */
interface Salle {
  readonly cle: string
  readonly nom: string
  /** Longueur, en metres : elle fixe le premier mode axial. */
  readonly longueur: number
  readonly largeur: number
  readonly hauteur: number
  readonly sol: string
}

/** Les trois pieces proposees. */
const SALLES = [
  {
    cle: 'salon',
    nom: 'Le salon',
    longueur: 5.4,
    largeur: 4.2,
    hauteur: 2.5,
    sol: 'Parquet, un tapis de laine, rideaux epais',
  },
  {
    cle: 'chambre',
    nom: 'La chambre',
    longueur: 3.6,
    largeur: 3.0,
    hauteur: 2.4,
    sol: 'Moquette, un lit, une armoire pleine',
  },
  {
    cle: 'plateau',
    nom: 'Le plateau',
    longueur: 9.0,
    largeur: 6.5,
    hauteur: 3.2,
    sol: 'Beton cire, verrieres, rien au mur',
  },
] as const satisfies readonly Salle[]

/** Les quatre reculs possibles par rapport au mur de derriere, en metres. */
const RECULS = [0.1, 0.3, 0.6, 1] as const

/** Ou l enceinte est posee dans la piece. */
interface Position {
  readonly cle: string
  readonly nom: string
  /** Coefficient de reflexion du mur de derriere. */
  readonly reflexion: number
  /** Vrai quand deux parois de plus renforcent le grave. */
  readonly coin: boolean
}

/** Les deux positions proposees. */
const POSITIONS = [
  { cle: 'libre', nom: 'Loin des angles', reflexion: 0.6, coin: false },
  { cle: 'angle', nom: 'Dans un angle', reflexion: 0.75, coin: true },
] as const satisfies readonly Position[]

/** Une finition du coffret. */
interface Finition {
  readonly cle: string
  readonly nom: string
  /** Sa place sur le segment tendu entre les deux jetons de la palette. */
  readonly t: number
  readonly matiere: string
  readonly prix: number
}

/** Les trois finitions, du plus froid au plus chaud. */
const FINITIONS = [
  {
    cle: 'graphite',
    nom: 'Laque graphite',
    t: 0,
    matiere: 'Six couches, poncees a l eau entre chacune',
    prix: 0,
  },
  {
    cle: 'frene',
    nom: 'Frene sable',
    t: 0.5,
    matiere: 'Placage tranche, veine debout, cire dure',
    prix: 180,
  },
  {
    cle: 'noyer',
    nom: 'Noyer huile',
    t: 1,
    matiere: 'Placage sur contreplaque bouleau, huile dure',
    prix: 340,
  },
] as const satisfies readonly Finition[]

/** Un support, sous l enceinte. */
const SUPPORTS = [
  { id: 'aucun', label: 'Sans support', hint: 'Sur un meuble', prix: 0 },
  { id: 'pointes', label: 'Pointes acier', hint: 'Quatre, reglables', prix: 90 },
  { id: 'pied', label: 'Pied fonte 62 cm', hint: 'La paire, lestable', prix: 420 },
  { id: 'mural', label: 'Equerre murale', hint: 'La paire, orientable', prix: 160 },
] as const

/** Les longueurs de cable proposees. */
const CABLES = [
  { cle: 'deux', nom: '2 x 2 m', prix: 60 },
  { cle: 'trois', nom: '2 x 3,5 m', prix: 95 },
  { cle: 'cinq', nom: '2 x 5 m', prix: 130 },
] as const

/** Les liens de la barre. */
const NAVIGATION = [
  ['#courbe', 'La courbe'],
  ['#coffret', 'Le coffret'],
  ['#finitions', 'Les finitions'],
] as const

/** Les pieces du coffret, numerotees sur la coupe. */
const COUPE = [
  [
    '01',
    'Grave',
    'Membrane en papier charge, saladier en fonte injectee, suspension caoutchouc.',
  ],
  [
    '02',
    'Dome',
    'Vingt-cinq millimetres, tissu enduit, chambre arriere amortie a la laine.',
  ],
  ['03', 'Filtre', 'Deux cellules du second ordre, bobines a air, condensateurs film.'],
  [
    '04',
    'Event',
    'Section evasee aux deux bouts : un event droit siffle des qu il travaille.',
  ],
  [
    '05',
    'Cloison',
    'Une traverse collee entre les deux faces : le panneau ne chante plus.',
  ],
  ['06', 'Amortissement', 'Feutre de laine, quatre cents grammes, agrafe et non colle.'],
] as const

/** Le pied de catalogue : la ligne d une reference. */
const CODES = [
  ['MEM-12-GRA', 'M-12 laque graphite', '270 x 160 x 210', '4,1 kg', '6 ohms', '84 dB'],
  ['MEM-12-FRE', 'M-12 frene sable', '270 x 160 x 210', '4,2 kg', '6 ohms', '84 dB'],
  ['MEM-18-GRA', 'M-18 laque graphite', '380 x 220 x 290', '8,6 kg', '4 ohms', '87 dB'],
  ['MEM-18-NOY', 'M-18 noyer huile', '380 x 220 x 290', '8,8 kg', '4 ohms', '87 dB'],
  ['MEM-24-GRA', 'M-24 laque graphite', '1040 x 240 x 340', '24,8 kg', '4 ohms', '90 dB'],
  ['MEM-24-NOY', 'M-24 noyer huile', '1040 x 240 x 340', '25,4 kg', '4 ohms', '90 dB'],
  ['MEM-PI-62', 'Pied fonte 62 cm, la paire', '620 x 200 x 260', '11,2 kg', '—', '—'],
  ['MEM-CA-35', 'Cable cuivre 2 x 3,5 m', '4 mm carre', '0,9 kg', '—', '—'],
] as const

/* ============================ Le calcul ================================ */

/**
 * La reponse, en decibels, a une frequence donnee.
 *
 * Cinq termes, additionnes parce que ce sont des decibels : le coffret, le mur
 * de derriere, le gain de piece, les modes, et l angle. Rien n est lisse : les
 * creux profonds de la courbe sont ceux qu on mesure vraiment au micro.
 */
function reponse(
  m: Modele,
  salle: Salle,
  recul: number,
  position: Position,
  f: number,
): number {
  // Le coffret : un passe-haut du quatrieme ordre a la frequence d accord, et
  // la directivite du dome qui retombe tout en haut.
  const coffret =
    -10 * Math.log10(1 + (m.accord / f) ** 8) - 10 * Math.log10(1 + (f / 17000) ** 4)

  // Le mur de derriere : l onde reflechie a parcouru deux fois le recul de
  // plus que l onde directe. Somme des deux pressions, en module.
  const r = position.reflexion
  const marche = (4 * Math.PI * f * recul) / CELERITE
  // Le peigne n existe que tant que les deux ondes restent en phase l une
  // avec l autre. Au-dela de la frequence de transition le champ est diffus,
  // les creux se comblent, et une mesure lissee au tiers d octave ne montre
  // plus rien : la coherence retombe donc avec la frequence.
  const coherence = 1 / (1 + (f / 500) ** 2)
  const mur =
    coherence * 10 * Math.log10(Math.max(0.015, 1 + r * r + 2 * r * Math.cos(marche)))

  // Le premier mode axial, et le gain de pression qui monte sous lui.
  const premier = CELERITE / (2 * salle.longueur)
  const gain = f < premier ? Math.min(11, 8 * Math.log2(premier / f)) : 0

  // Les deux premiers modes axiaux, longueur et largeur : deux bosses.
  const bosse = (centre: number, hauteur: number): number =>
    hauteur / (1 + ((f - centre) / (centre / 8)) ** 2)
  const modes = bosse(premier, 5) + bosse(CELERITE / (2 * salle.largeur), 4)

  // L angle : deux parois de plus, donc du grave en plus, et seulement la.
  const angle = position.coin && f < 200 ? 3 : 0

  return coffret + mur + gain + modes + angle
}

/** Le nombre de points de la courbe : assez pour que le creux de mur existe. */
const POINTS = 260

/** La frequence du point de rang donne, sur une echelle logarithmique. */
function frequenceDe(rang: number): number {
  return 20 * 1000 ** (rang / (POINTS - 1))
}

/** La courbe entiere, et ce qu on en lit. */
interface Courbe {
  readonly valeurs: readonly number[]
  /** La premiere frequence atteinte a moins trois decibels, en montant. */
  readonly coupure: number
  /** L ecart entre le plus haut et le plus bas, de quarante a quatre cents hertz. */
  readonly ecart: number
  /** La frequence du creux du mur de derriere. */
  readonly creux: number
  /** Le premier mode axial de la piece. */
  readonly mode: number
  /** Le palier de baffle du modele. */
  readonly palier: number
}

/** Calcule la courbe et les quatre valeurs qu on en tire. */
function courbeDe(m: Modele, salle: Salle, recul: number, position: Position): Courbe {
  const valeurs = Array.from({ length: POINTS }, (_, rang) =>
    reponse(m, salle, recul, position, frequenceDe(rang)),
  )

  // La coupure : le point le plus bas a partir duquel la courbe ne redescend
  // plus sous moins trois decibels.
  // L extension dans le grave : la premiere frequence, en montant depuis vingt
  // hertz, ou la courbe rejoint moins trois decibels. On monte, et non on
  // descend : un creux de mur en plein medium repondrait a la question, et ce
  // n est pas la question.
  let coupure = 20
  for (let rang = 0; rang < POINTS; rang += 1) {
    if ((valeurs[rang] ?? -99) >= -3) {
      coupure = frequenceDe(rang)
      break
    }
  }

  // L ecart dans le bas medium : c est la que la piece fait le plus de degats,
  // et c est le seul chiffre qui distingue vraiment deux placements.
  let bas = Number.POSITIVE_INFINITY
  let haut = Number.NEGATIVE_INFINITY
  for (let rang = 0; rang < POINTS; rang += 1) {
    const f = frequenceDe(rang)
    if (f < 40 || f > 400) continue
    const v = valeurs[rang] ?? 0
    if (v < bas) bas = v
    if (v > haut) haut = v
  }

  return {
    valeurs,
    coupure,
    ecart: haut - bas,
    creux: CELERITE / (4 * recul),
    mode: CELERITE / (2 * salle.longueur),
    palier: 115 / m.baffle,
  }
}

/** Un nombre a la francaise. */
function nombre(valeur: number, decimales = 0): string {
  return valeur.toLocaleString('fr-FR', {
    minimumFractionDigits: decimales,
    maximumFractionDigits: decimales,
  })
}

/** Une frequence ecrite comme on la dit : « 286 Hz », « 2,2 kHz ». */
function hertz(f: number): string {
  return f >= 1000 ? `${nombre(f / 1000, 1)} kHz` : `${nombre(f)} Hz`
}

/** Un montant en euros. */
function euros(n: number): string {
  return `${n.toLocaleString('fr-FR')} EUR`
}

/* ============================ Les teintes ============================== */

/**
 * La teinte d une finition, a la nuance demandee.
 *
 * Le segment va de l accent de la vitrine a sa couleur d appoint, parcouru en
 * `oklch` : en coordonnees rectangulaires, un graphite et un noyer se
 * rencontreraient sur un gris sans nom, et le frene du milieu n existerait pas.
 */
function teinteFinition(t: number, nuance: number): string {
  return `color-mix(in oklch, ${accent(nuance)} ${String(Math.round((1 - t) * 100))}%, var(--o-vitrine-seconde))`
}

/** La meme teinte, fondue dans le fond de la page. */
function fondFinition(t: number, part: number, nuance = 700): string {
  return `color-mix(in oklab, ${teinteFinition(t, nuance)} ${String(part)}%, var(--o-theme-bg))`
}

/* ============================ La courbe dessinee ======================= */

/** Les bornes du cadre de la courbe, en coordonnees du dessin. */
const CADRE = { gauche: 52, droite: 706, haut: 18, bas: 282, minDb: -18, maxDb: 12 }

/** L abscisse d une frequence. */
function abscisse(f: number): number {
  return CADRE.gauche + (Math.log10(f / 20) / 3) * (CADRE.droite - CADRE.gauche)
}

/** L ordonnee d un niveau. */
function ordonnee(db: number): number {
  const borne = Math.max(CADRE.minDb, Math.min(CADRE.maxDb, db))
  return (
    CADRE.bas -
    ((borne - CADRE.minDb) / (CADRE.maxDb - CADRE.minDb)) * (CADRE.bas - CADRE.haut)
  )
}

/** Les frequences graduees, celles d une feuille de mesure. */
const GRADUATIONS = [20, 50, 100, 200, 500, 1000, 2000, 5000, 10000, 20000] as const

/**
 * La courbe de reponse, en aires.
 *
 * L aire entre la courbe et la ligne de reference est remplie : c est ce qui
 * fait voir d un coup d oeil ce que la piece ajoute et ce qu elle enleve, ce
 * qu un simple trait ne montre pas. Les deux filets a trois decibels donnent la
 * tolerance, et le curseur du balayage se deplace par transformation, sans
 * qu un seul rendu de React soit demande.
 */
function CourbeDessinee({
  courbe,
  finition,
  curseur,
}: {
  readonly courbe: Courbe
  readonly finition: Finition
  readonly curseur: (element: SVGGElement | null) => void
}): ReactElement {
  const trace = useMemo(() => {
    const points = courbe.valeurs.map(
      (db, rang) =>
        `${abscisse(frequenceDe(rang)).toFixed(1)} ${ordonnee(db).toFixed(1)}`,
    )
    return {
      ligne: `M${points.join('L')}`,
      aire: `M${points.join('L')}L${String(CADRE.droite)} ${ordonnee(0).toFixed(1)}L${String(CADRE.gauche)} ${ordonnee(0).toFixed(1)}Z`,
    }
  }, [courbe])

  const trait = teinteFinition(finition.t, 300)

  return (
    <svg
      viewBox="0 0 726 320"
      className="o-h-full o-w-full"
      fill="none"
      aria-hidden="true"
    >
      {/* La grille de la feuille de mesure : decades et decibels. */}
      <g stroke="var(--o-palette-zinc-800)" strokeWidth="1">
        {GRADUATIONS.map((f) => (
          <line
            key={f}
            x1={abscisse(f).toFixed(1)}
            y1={CADRE.haut}
            x2={abscisse(f).toFixed(1)}
            y2={CADRE.bas}
          />
        ))}
        {[-18, -12, -6, 0, 6, 12].map((db) => (
          <line
            key={db}
            x1={CADRE.gauche}
            y1={ordonnee(db).toFixed(1)}
            x2={CADRE.droite}
            y2={ordonnee(db).toFixed(1)}
            opacity={db === 0 ? 1 : 0.55}
          />
        ))}
      </g>
      {/* La tolerance : plus ou moins trois decibels. */}
      <g stroke="var(--o-palette-zinc-600)" strokeWidth="1" strokeDasharray="3 5">
        <line
          x1={CADRE.gauche}
          y1={ordonnee(3).toFixed(1)}
          x2={CADRE.droite}
          y2={ordonnee(3).toFixed(1)}
        />
        <line
          x1={CADRE.gauche}
          y1={ordonnee(-3).toFixed(1)}
          x2={CADRE.droite}
          y2={ordonnee(-3).toFixed(1)}
        />
      </g>

      <path d={trace.aire} fill={trait} fillOpacity="0.2" />
      <path d={trace.ligne} stroke={trait} strokeWidth="2.4" strokeLinejoin="round" />

      {/* Le curseur du balayage : un trait, un point, et rien d autre. */}
      <g ref={curseur} style={{ transform: `translateX(${String(CADRE.gauche)}px)` }}>
        <line
          x1="0"
          y1={CADRE.haut}
          x2="0"
          y2={CADRE.bas}
          stroke={encreSurSombre()}
          strokeWidth="1.4"
        />
        <circle
          cx="0"
          cy={ordonnee(0)}
          r="5"
          fill={encreSurSombre()}
          data-o-membrane-point=""
        />
      </g>

      {/* Les graduations ecrites. */}
      <g
        fill="var(--o-palette-zinc-400)"
        style={{ fontFamily: 'var(--o-font-mono)', fontSize: 11 }}
      >
        {GRADUATIONS.map((f) => (
          <text key={f} x={abscisse(f).toFixed(1)} y="302" textAnchor="middle">
            {f >= 1000 ? `${String(f / 1000)}k` : String(f)}
          </text>
        ))}
        {[12, 6, 0, -6, -12, -18].map((db) => (
          <text key={db} x="44" y={(ordonnee(db) + 4).toFixed(1)} textAnchor="end">
            {db > 0 ? `+${String(db)}` : String(db)}
          </text>
        ))}
        <text x={CADRE.gauche} y="12">
          dB
        </text>
        <text x={CADRE.droite} y="12" textAnchor="end">
          Hz
        </text>
      </g>
    </svg>
  )
}

/* ============================ L enceinte dessinee ====================== */

/**
 * L enceinte, dessinee de face et de profil.
 *
 * C est le repli de la scene, et il montre la meme chose : le meme coffret dans
 * la meme finition, le meme haut-parleur, le meme event. Une page dont le sujet
 * disparait avec la troisieme dimension n a pas de sujet.
 */
function EnceinteDessinee({
  modele,
  finition,
}: {
  readonly modele: Modele
  readonly finition: Finition
}): ReactElement {
  const face = teinteFinition(finition.t, 600)
  const cote = teinteFinition(finition.t, 800)
  const arete = teinteFinition(finition.t, 300)
  const colonne = modele.cle === 'm24'

  return (
    <svg
      viewBox="0 0 320 400"
      className="o-h-full o-w-full"
      fill="none"
      aria-hidden="true"
    >
      {/* Le profil, derriere, en retrait. */}
      <path
        d="M232 62 L286 82 L286 366 L232 346 Z"
        fill={cote}
        stroke={arete}
        strokeWidth="1"
        strokeOpacity="0.4"
      />
      {/* La face. */}
      <rect
        x="52"
        y="62"
        width="180"
        height="284"
        rx="4"
        fill={face}
        stroke={arete}
        strokeWidth="1.2"
        strokeOpacity="0.55"
      />
      <path d="M52 62 L232 62 L286 82 L106 82 Z" fill={arete} fillOpacity="0.28" />

      {/* Le dome, et sa plaque. */}
      <circle
        cx="142"
        cy="118"
        r="27"
        stroke={arete}
        strokeWidth="1.4"
        strokeOpacity="0.5"
      />
      <circle cx="142" cy="118" r="14" fill={arete} fillOpacity="0.55" />

      {/* Le grave : saladier, suspension, cone, cache-noyau. */}
      <circle
        cx="142"
        cy="218"
        r="62"
        stroke={arete}
        strokeWidth="1.4"
        strokeOpacity="0.5"
      />
      <circle
        cx="142"
        cy="218"
        r="54"
        stroke={arete}
        strokeWidth="6"
        strokeOpacity="0.3"
      />
      <circle
        cx="142"
        cy="218"
        r="46"
        fill={cote}
        stroke={arete}
        strokeWidth="1"
        strokeOpacity="0.45"
      />
      <circle cx="142" cy="218" r="15" fill={arete} fillOpacity="0.6" />
      {[0, 60, 120, 180, 240, 300].map((a) => {
        const r = (a * Math.PI) / 180
        return (
          <circle
            key={a}
            cx={(142 + Math.cos(r) * 58).toFixed(1)}
            cy={(218 + Math.sin(r) * 58).toFixed(1)}
            r="3"
            fill={arete}
            fillOpacity="0.7"
          />
        )
      })}

      {/* Le second grave de la colonne, quand il existe. */}
      {colonne && (
        <>
          <circle
            cx="142"
            cy="312"
            r="46"
            stroke={arete}
            strokeWidth="1.4"
            strokeOpacity="0.5"
          />
          <circle
            cx="142"
            cy="312"
            r="36"
            fill={cote}
            stroke={arete}
            strokeWidth="1"
            strokeOpacity="0.4"
          />
          <circle cx="142" cy="312" r="11" fill={arete} fillOpacity="0.6" />
        </>
      )}
      {/* L event, en bas de la face, quand la place reste. */}
      {!colonne && (
        <ellipse
          cx="142"
          cy="312"
          rx="24"
          ry="11"
          fill="var(--o-palette-zinc-950)"
          stroke={arete}
          strokeWidth="1.2"
          strokeOpacity="0.5"
        />
      )}

      {/* Les quatre patins. */}
      <path
        d="M68 346 V362 M216 346 V362 M250 352 V366 M270 358 V372"
        stroke={arete}
        strokeWidth="4"
        strokeOpacity="0.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

/* ============================ La coupe ================================= */

/** La coupe du coffret, numerotee : une figure, pas une vignette. */
function CoupeDuCoffret({ finition }: { readonly finition: Finition }): ReactElement {
  const bois = teinteFinition(finition.t, 700)
  const trait = teinteFinition(finition.t, 200)
  const repere = (x: number, y: number, rang: string): ReactElement => (
    <g key={rang}>
      <circle
        cx={x}
        cy={y}
        r="11"
        fill="var(--o-palette-zinc-950)"
        stroke={trait}
        strokeWidth="1.2"
      />
      <text
        x={x}
        y={y + 4}
        textAnchor="middle"
        fill={trait}
        style={{ fontFamily: 'var(--o-font-mono)', fontSize: 11 }}
      >
        {rang}
      </text>
    </g>
  )

  return (
    <svg
      viewBox="0 0 420 420"
      className="o-h-full o-w-full"
      fill="none"
      aria-hidden="true"
    >
      {/* Le coffret en coupe : deux parois, et la matiere hachuree entre. */}
      <defs>
        <pattern
          id="o-membrane-hachure"
          width="7"
          height="7"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="7"
            stroke={trait}
            strokeWidth="1.1"
            strokeOpacity="0.55"
          />
        </pattern>
      </defs>

      <path
        d="M60 40 H340 V380 H60 Z M84 64 H316 V356 H84 Z"
        fill="url(#o-membrane-hachure)"
        fillRule="evenodd"
        stroke={trait}
        strokeWidth="1.4"
      />
      <rect x="84" y="64" width="232" height="292" fill={bois} fillOpacity="0.16" />

      {/* Le grave, vu en coupe : cone, bobine, aimant. */}
      <path
        d="M84 150 L150 178 L150 206 L84 234 Z"
        fill={bois}
        fillOpacity="0.5"
        stroke={trait}
        strokeWidth="1.4"
      />
      <rect x="150" y="176" width="20" height="32" fill={trait} fillOpacity="0.5" />
      <rect
        x="170"
        y="162"
        width="46"
        height="60"
        rx="3"
        fill={trait}
        fillOpacity="0.28"
        stroke={trait}
        strokeWidth="1.2"
      />

      {/* Le dome et sa chambre. */}
      <path d="M84 92 A 22 22 0 0 1 84 136" stroke={trait} strokeWidth="2.4" />
      <circle
        cx="112"
        cy="114"
        r="20"
        stroke={trait}
        strokeWidth="1.2"
        strokeDasharray="3 4"
      />

      {/* Le filtre, pose au fond. */}
      <rect
        x="228"
        y="290"
        width="80"
        height="52"
        rx="3"
        stroke={trait}
        strokeWidth="1.3"
      />
      <path
        d="M244 306 h16 m8 0 h16 M244 326 h48"
        stroke={trait}
        strokeWidth="1.6"
        strokeOpacity="0.7"
      />
      <circle cx="268" cy="306" r="7" stroke={trait} strokeWidth="1.6" />

      {/* L event, evase aux deux bouts. */}
      <path
        d="M84 296 q 18 -12 34 0 v 28 q -16 12 -34 0 Z"
        fill="var(--o-palette-zinc-950)"
        stroke={trait}
        strokeWidth="1.4"
      />
      <path d="M118 302 H196 M118 318 H196" stroke={trait} strokeWidth="1.4" />
      <path d="M196 292 q 14 18 0 36" stroke={trait} strokeWidth="1.4" />

      {/* La cloison, collee entre les deux faces. */}
      <path d="M84 248 H316" stroke={trait} strokeWidth="5" strokeOpacity="0.45" />
      {/* L amortissement, agrafe au fond. */}
      <path
        d="M300 74 q -10 14 0 28 q 10 14 0 28 q -10 14 0 28"
        stroke={trait}
        strokeWidth="1.6"
        strokeOpacity="0.6"
      />

      {/* Les renvois, puis les pastilles numerotees. */}
      <g stroke={trait} strokeWidth="0.9" strokeOpacity="0.55">
        <path d="M120 192 L56 192" />
        <path d="M96 114 L56 114" />
        <path d="M268 316 L364 316" />
        <path d="M150 310 L150 398" />
        <path d="M230 248 L364 248" />
        <path d="M300 102 L364 102" />
      </g>
      {repere(42, 192, '01')}
      {repere(42, 114, '02')}
      {repere(378, 316, '03')}
      {repere(150, 404, '04')}
      {repere(378, 248, '05')}
      {repere(378, 102, '06')}
    </svg>
  )
}

/* ============================ Le panier ================================ */

/**
 * Le panier flottant : ce qu on a choisi en parcourant.
 *
 * Il reste au bord de l ecran du debut a la fin, parce que les choix sont pris
 * a trois endroits differents de la page — le modele dans la courbe, la
 * finition plus bas, le support et le cable plus bas encore. Sans lui, il
 * faudrait remonter pour savoir ou on en est.
 */
function Panier({
  lignes,
  total,
  ouvert,
  onBascule,
}: {
  readonly lignes: readonly (readonly [string, string, number])[]
  readonly total: number
  readonly ouvert: boolean
  readonly onBascule: () => void
}): ReactElement {
  return (
    <div className="o-pointer-events-none o-fixed o-bottom-4 o-left-4 o-z-40 o-flex o-justify-end sm:o-left-auto sm:o-right-6 o-right-4">
      {/* Le cadre etoile arrondit a fond par defaut : le rayon est repose
            en style, seul moyen de passer devant sa feuille injectee. */}
      <StarBorder
        color="--o-vitrine-400"
        speed={7000}
        glow={0.5}
        className="o-pointer-events-auto o-w-full sm:o-w-72"
        style={{ borderRadius: 18 }}
      >
        <div
          className={`o-w-full o-p-3.5 ${verre(true)}`}
          style={{
            backgroundColor:
              'color-mix(in oklab, var(--o-palette-zinc-950) 82%, transparent)',
          }}
        >
          <div className="o-flex o-items-center o-justify-between o-gap-3">
            <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-300">
              La paire, composee
            </p>
            <button
              type="button"
              aria-expanded={ouvert}
              onClick={onBascule}
              className="o-rounded-full o-border-w-1 o-border-white-20 o-px-3 o-py-1 o-font-mono o-text-xs o-uppercase o-tracking-wider o-text-zinc-200 o-transition-colors hover:o-bg-white-10 focus:o-ring"
            >
              {ouvert ? 'Replier' : 'Deplier'}
            </button>
          </div>

          {ouvert && (
            <dl className="o-m-0 o-mt-3">
              {lignes.map(([quoi, valeur, prix]) => (
                <div
                  key={quoi}
                  className="o-flex o-items-baseline o-justify-between o-gap-3 o-border-t o-border-white-10 o-py-2"
                >
                  <div className="o-min-w-0">
                    <dt className="o-font-mono o-text-xs o-uppercase o-tracking-wider o-text-zinc-400">
                      {quoi}
                    </dt>
                    <dd className="o-m-0 o-truncate o-text-sm o-text-zinc-100">
                      {valeur}
                    </dd>
                  </div>
                  <span className="o-shrink-0 o-font-mono o-text-xs o-tabular-nums o-text-zinc-300">
                    {prix === 0 ? 'compris' : euros(prix)}
                  </span>
                </div>
              ))}
            </dl>
          )}

          <div className="o-mt-3 o-flex o-items-baseline o-justify-between o-gap-3 o-border-t o-border-white-20 o-pt-3">
            <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-300">
              Total
            </span>
            <span
              className="o-tabular-nums"
              style={{
                ...affiche('m', 300),
                fontSize: '1.5rem',
                color: encreSurSombre(),
              }}
            >
              {euros(total)}
            </span>
          </div>

          <Aimant force={0.3} className="o-mt-3 o-block">
            <a
              href="mailto:atelier@membrane-hp.fr"
              className="o-flex o-w-full o-items-center o-justify-center o-gap-2 o-rounded-full o-px-4 o-py-2.5 o-text-sm o-font-semibold o-no-underline focus:o-ring"
              style={aplat()}
            >
              Reserver une ecoute
              <Icon icon={ArrowUpRight} size={15} aria-hidden="true" />
            </a>
          </Aimant>
        </div>
      </StarBorder>
    </div>
  )
}

/* ============================ Les petites pieces ======================= */

/** Un choix : une gelule bordee, pleine quand elle est prise. */
function Choix({
  actif,
  onClick,
  children,
}: {
  readonly actif: boolean
  readonly onClick: () => void
  readonly children: ReactNode
}): ReactElement {
  return (
    <button
      type="button"
      aria-pressed={actif}
      onClick={onClick}
      className="o-rounded-full o-border-w-1 o-px-4 o-py-1.5 o-text-sm o-transition-colors focus:o-ring"
      style={
        actif
          ? { ...aplat(), borderColor: 'transparent' }
          : { borderColor: 'var(--o-theme-line)', color: 'var(--o-palette-zinc-300)' }
      }
    >
      {children}
    </button>
  )
}

/** Une valeur lue sur la courbe. */
function Lecture({
  quoi,
  valeur,
  note,
}: {
  readonly quoi: string
  readonly valeur: string
  readonly note: string
}): ReactElement {
  return (
    <div className="o-border-t o-border-white-10 o-py-4">
      <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
        {quoi}
      </dt>
      <dd
        className="o-m-0 o-mt-1.5 o-tabular-nums o-text-zinc-50"
        style={{ ...affiche('m', 300), fontSize: 'clamp(1.375rem, 2.4vw, 2rem)' }}
      >
        {valeur}
      </dd>
      <p className="o-m-0 o-mt-1 o-text-xs o-leading-relaxed o-text-zinc-400">{note}</p>
    </div>
  )
}

/* ============================ La page ================================== */

/** Ce que la scene garde d une image a l autre. */
interface MemoireDeScene {
  bas: Couleur3D
  haut: Couleur3D
  vise: Couleur3D
  lues: string
}

export default function Page(): ReactElement {
  const polices = usePolices('jakarta')
  const { reduced } = useMotionState()

  const [cleModele, setCleModele] = useState<string>(MODELES[1].cle)
  const [cleSalle, setCleSalle] = useState<string>(SALLES[0].cle)
  const [recul, setRecul] = useState<number>(0.3)
  const [clePosition, setClePosition] = useState<string>(POSITIONS[0].cle)
  const [cleFinition, setCleFinition] = useState<string>(FINITIONS[2].cle)
  const [support, setSupport] = useState<string>(SUPPORTS[1].id)
  const [cleCable, setCleCable] = useState<string>(CABLES[1].cle)
  const [panierOuvert, setPanierOuvert] = useState(true)
  const [enMarche, setEnMarche] = useState(true)

  const modele: Modele = MODELES.find((m) => m.cle === cleModele) ?? MODELES[1]
  const salle: Salle = SALLES.find((s) => s.cle === cleSalle) ?? SALLES[0]
  const position: Position = POSITIONS.find((p) => p.cle === clePosition) ?? POSITIONS[0]
  const finition: Finition = FINITIONS.find((f) => f.cle === cleFinition) ?? FINITIONS[2]
  const supportChoisi = SUPPORTS.find((s) => s.id === support) ?? SUPPORTS[0]
  const cable = CABLES.find((c) => c.cle === cleCable) ?? CABLES[1]

  const courbe = useMemo(
    () => courbeDe(modele, salle, recul, position),
    [modele, salle, recul, position],
  )

  // Le meilleur recul des quatre, cherche et non choisi : celui dont l ecart
  // dans le bas medium est le plus faible.
  const meilleurRecul = useMemo(() => {
    let garde: number = RECULS[0]
    let mieux = Number.POSITIVE_INFINITY
    for (const essai of RECULS) {
      const { ecart } = courbeDe(modele, salle, essai, position)
      if (ecart < mieux) {
        mieux = ecart
        garde = essai
      }
    }
    return garde
  }, [modele, salle, position])

  const total = modele.prix * 2 + finition.prix * 2 + supportChoisi.prix + cable.prix

  /* ----- Le balayage ---------------------------------------------------- */

  // Le balayage avance dans sa propre horloge et ecrit directement dans le
  // document : demander un rendu de React soixante fois par seconde pour
  // deplacer un trait serait le meilleur moyen de faire tomber la page.
  const phase = useRef(0)
  const debattement = useRef(0)
  const curseur = useRef<SVGGElement | null>(null)
  const lecture = useRef<HTMLSpanElement | null>(null)
  const donnees = useRef(courbe)
  donnees.current = courbe

  useEffect(() => {
    if (reduced || !enMarche) return
    const abonnement = clock.subscribe(
      ({ delta }) => {
        phase.current = (phase.current + delta / 9) % 1
        const f = 20 * 1000 ** phase.current
        const rang = Math.min(POINTS - 1, Math.round(phase.current * (POINTS - 1)))
        const db = donnees.current.valeurs[rang] ?? 0

        const groupe = curseur.current
        if (groupe !== null) {
          groupe.style.transform = `translateX(${abscisse(f).toFixed(1)}px)`
          const point = groupe.querySelector('[data-o-membrane-point]')
          if (point !== null) point.setAttribute('cy', ordonnee(db).toFixed(1))
        }
        const texte = lecture.current
        if (texte !== null)
          texte.textContent = `${hertz(f)} — ${db >= 0 ? '+' : ''}${nombre(db, 1)} dB`

        // Le debattement de la membrane : a niveau constant, il varie comme
        // l inverse du carre de la frequence. C est la raison physique pour
        // laquelle on voit bouger un grave et jamais un aigu.
        debattement.current = f > 900 ? 0 : Math.min(1, (55 / f) ** 2)
      },
      { name: 'balayage de frequence', priority: CLOCK_PRIORITY.input },
    )
    return () => {
      abonnement.unsubscribe()
    }
  }, [reduced, enMarche])

  /* ----- La scene ------------------------------------------------------- */

  const bornes = useRef({ bas: '#a1a1aa', haut: '#78350f' })
  const memoire = useRef<MemoireDeScene | null>(null)
  const visee = useRef({ t: finition.t, colonne: modele.cle === 'm24' })
  useEffect(() => {
    bornes.current = {
      bas: teinte('--o-vitrine-500', '#a1a1aa'),
      haut: teinte('--o-vitrine-seconde', '#78350f'),
    }
    visee.current = { t: finition.t, colonne: modele.cle === 'm24' }
  })

  const basculerPanier = useCallback(() => {
    setPanierOuvert((v) => !v)
  }, [])

  const lignes = [
    ['Modele', `${modele.reference} ${modele.nom} — la paire`, modele.prix * 2],
    ['Finition', `${finition.nom} — la paire`, finition.prix * 2],
    ['Support', supportChoisi.label, supportChoisi.prix],
    ['Cable', cable.nom, cable.prix],
  ] as const

  return (
    <Porte forme="zoom" marque="Membrane">
      <div className="o-relative o-text-zinc-50" style={{ ...polices, ...nuit('zinc') }}>
        <BarreGelule
          marque="Membrane"
          liens={NAVIGATION}
          action={['#finitions', 'Composer']}
        />

        <main className={panierOuvert ? 'xl:o-pr-80' : ''}>
          {/*
            ----- L ouverture : l enceinte, et le mot ------------------------
          */}
          <section
            id="haut"
            className="o-relative o-isolate o-flex o-flex-col o-overflow-hidden"
            style={{ minHeight: ECRAN }}
          >
            <Volume
              nom="enceinte M"
              className="o-pointer-events-none o-absolute o-inset-0 o-z-0"
              repli={
                <div className="o-flex o-h-full o-items-center o-justify-end o-p-12">
                  <div
                    className="o-h-full o-w-full o-max-w-sm"
                    style={{ maxHeight: 460 }}
                  >
                    <EnceinteDessinee modele={modele} finition={finition} />
                  </div>
                </div>
              }
              construire={(contexte) => {
                const { scene, camera, three } = contexte

                const memo: MemoireDeScene = {
                  bas: new three.Color(bornes.current.bas),
                  haut: new three.Color(bornes.current.haut),
                  vise: new three.Color(),
                  lues: bornes.current.bas + bornes.current.haut,
                }
                memo.vise.copy(memo.bas).lerpHSL(memo.haut, visee.current.t)
                memoire.current = memo

                // Le canevas est opaque : c est lui le fond de la page.
                scene.background = new three.Color(
                  teinte('--o-vitrine-950', '#18181b'),
                ).multiplyScalar(0.3)

                const geometries: { dispose: () => void }[] = []
                const matieres: { dispose: () => void }[] = []

                const coffretMatiere = new three.MeshPhysicalMaterial({
                  color: memo.vise.clone(),
                  metalness: 0.1,
                  roughness: 0.48,
                  clearcoat: 0.55,
                  clearcoatRoughness: 0.3,
                })
                const membraneMatiere = new three.MeshPhysicalMaterial({
                  color: new three.Color(
                    teinte('--o-vitrine-800', '#27272a'),
                  ).multiplyScalar(0.7),
                  metalness: 0.05,
                  roughness: 0.86,
                })
                const metalMatiere = new three.MeshPhysicalMaterial({
                  color: teinte('--o-vitrine-200', '#e4e4e7'),
                  metalness: 0.5,
                  roughness: 0.24,
                  clearcoat: 1,
                })
                const creuxMatiere = new three.MeshStandardMaterial({
                  color: 0x000000,
                  roughness: 1,
                })
                matieres.push(coffretMatiere, membraneMatiere, metalMatiere, creuxMatiere)

                /** Le coffret : un rectangle a aretes cassees, extrude. */
                const forme = new three.Shape()
                const largeur = 0.86
                const hauteur = 1.46
                const rayon = 0.022
                const x = largeur / 2
                const y = hauteur / 2
                forme.moveTo(-x + rayon, -y)
                forme.lineTo(x - rayon, -y)
                forme.quadraticCurveTo(x, -y, x, -y + rayon)
                forme.lineTo(x, y - rayon)
                forme.quadraticCurveTo(x, y, x - rayon, y)
                forme.lineTo(-x + rayon, y)
                forme.quadraticCurveTo(-x, y, -x, y - rayon)
                forme.lineTo(-x, -y + rayon)
                forme.quadraticCurveTo(-x, -y, -x + rayon, -y)
                const gCoffret = new three.ExtrudeGeometry(forme, {
                  depth: 0.74,
                  bevelEnabled: true,
                  bevelThickness: 0.012,
                  bevelSize: 0.012,
                  bevelSegments: 2,
                  curveSegments: 8,
                })
                gCoffret.translate(0, 0, -0.74)
                geometries.push(gCoffret)

                const enceinte = new three.Group()
                enceinte.name = 'enceinte'
                const coffret = new three.Mesh(gCoffret, coffretMatiere)
                coffret.name = 'coffret'
                enceinte.add(coffret)

                // Le grave : un cone au profil tourne, sa suspension, son
                // cache-noyau. Le groupe entier avance et recule : c est le
                // debattement, et c est ce qu on vient voir.
                const profil = [
                  new three.Vector2(0.03, 0.1),
                  new three.Vector2(0.1, 0.07),
                  new three.Vector2(0.2, 0.02),
                  new three.Vector2(0.25, 0),
                ]
                const gCone = new three.LatheGeometry(profil, 48)
                const gSuspension = new three.TorusGeometry(0.27, 0.028, 10, 48)
                const gCache = new three.SphereGeometry(
                  0.07,
                  24,
                  12,
                  0,
                  Math.PI * 2,
                  0,
                  Math.PI / 2,
                )
                const gSaladier = new three.TorusGeometry(0.305, 0.022, 8, 56)
                geometries.push(gCone, gSuspension, gCache, gSaladier)

                const grave = new three.Group()
                grave.name = 'grave'
                const cone = new three.Mesh(gCone, membraneMatiere)
                cone.rotation.x = -Math.PI / 2
                const suspension = new three.Mesh(gSuspension, membraneMatiere)
                const cache = new three.Mesh(gCache, membraneMatiere)
                cache.rotation.x = Math.PI / 2
                cache.position.z = 0.1
                const saladier = new three.Mesh(gSaladier, metalMatiere)
                grave.add(cone, suspension, cache, saladier)
                grave.position.set(0, -0.24, 0.01)
                enceinte.add(grave)

                // Le dome, et sa plaque.
                const gDome = new three.SphereGeometry(
                  0.052,
                  24,
                  14,
                  0,
                  Math.PI * 2,
                  0,
                  Math.PI / 2,
                )
                const gPlaque = new three.TorusGeometry(0.085, 0.016, 8, 40)
                geometries.push(gDome, gPlaque)
                const dome = new three.Mesh(gDome, membraneMatiere)
                dome.rotation.x = Math.PI / 2
                dome.position.set(0, 0.44, 0.015)
                const plaque = new three.Mesh(gPlaque, metalMatiere)
                plaque.position.set(0, 0.44, 0.01)
                enceinte.add(dome, plaque)

                // L event, creuse dans la face : un cylindre noir en retrait.
                const gEvent = new three.CylinderGeometry(0.062, 0.062, 0.14, 32, 1, true)
                geometries.push(gEvent)
                const event = new three.Mesh(gEvent, creuxMatiere)
                event.rotation.x = Math.PI / 2
                event.position.set(0, -0.62, -0.06)
                enceinte.add(event)

                // Les quatre pointes, sous le coffret.
                const gPointe = new three.ConeGeometry(0.028, 0.09, 12)
                geometries.push(gPointe)
                for (const [px, pz] of [
                  [-0.3, -0.12],
                  [0.3, -0.12],
                  [-0.3, -0.6],
                  [0.3, -0.6],
                ] as const) {
                  const pointe = new three.Mesh(gPointe, metalMatiere)
                  pointe.position.set(px, -hauteur / 2 - 0.045, pz)
                  pointe.rotation.x = Math.PI
                  enceinte.add(pointe)
                }

                enceinte.rotation.y = -0.62
                enceinte.rotation.x = 0.05
                enceinte.position.set(1.3, -0.02, 0)
                scene.add(enceinte)

                // Le sol : un disque sombre sous l enceinte, qui la pose au
                // lieu de la laisser flotter dans le noir.
                const gSol = new three.CircleGeometry(2.4, 48)
                geometries.push(gSol)
                const solMatiere = new three.MeshStandardMaterial({
                  color: new three.Color(
                    teinte('--o-vitrine-950', '#18181b'),
                  ).multiplyScalar(0.55),
                  roughness: 0.6,
                  metalness: 0.2,
                })
                matieres.push(solMatiere)
                const sol = new three.Mesh(gSol, solMatiere)
                sol.rotation.x = -Math.PI / 2
                sol.position.set(1.3, -hauteur / 2 - 0.1, -0.3)
                scene.add(sol)

                // Un coffret laque sans lumiere rasante est une tache noire :
                // la cle chaude devant, un remplissage froid a gauche, le
                // contour derriere, et deux rasantes qui posent l arete du
                // coffret. La lampe de dessous fait exister les pointes.
                eclairer(contexte, {
                  cle: 0xfff3e4,
                  remplissage: 0x8fa5cf,
                  contour: 0xffffff,
                  force: 1.15,
                })
                const rasanteGauche = new three.PointLight(0xffffff, 26, 16, 2)
                rasanteGauche.position.set(-1.4, 1.4, 2.8)
                const rasanteDroite = new three.PointLight(0xfff2dd, 34, 16, 2)
                rasanteDroite.position.set(3.6, 0.8, 1.6)
                const dessous = new three.PointLight(0xffe6c0, 20, 12, 2)
                dessous.position.set(1.2, -1.9, 1.6)
                scene.add(rasanteGauche, rasanteDroite, dessous)

                camera.position.set(-0.1, 0.4, 4.3)
                camera.lookAt(1.2, -0.02, 0)

                return () => {
                  memoire.current = null
                  for (const g of geometries) g.dispose()
                  for (const m of matieres) m.dispose()
                }
              }}
              animer={(contexte, { delta, time }) => {
                const { scene, three } = contexte
                const memo = memoire.current
                const enceinte = scene.getObjectByName('enceinte')
                if (memo === null || enceinte === undefined) return

                const lues = bornes.current.bas + bornes.current.haut
                if (lues !== memo.lues) {
                  memo.bas.set(bornes.current.bas)
                  memo.haut.set(bornes.current.haut)
                  memo.lues = lues
                }
                memo.vise.copy(memo.bas).lerpHSL(memo.haut, visee.current.t)

                const part = 1 - Math.exp(-3.4 * delta)
                const coffret = scene.getObjectByName('coffret')
                if (
                  coffret instanceof three.Mesh &&
                  coffret.material instanceof three.MeshPhysicalMaterial
                ) {
                  coffret.material.color.lerp(memo.vise, part)
                }

                // La colonne est plus haute et plus etroite : le meme coffret
                // etire, plutot qu un second modele a charger.
                const colonne = visee.current.colonne
                const vouluY = colonne ? 1.34 : 1
                const vouluX = colonne ? 0.9 : 1
                enceinte.scale.y += (vouluY - enceinte.scale.y) * part
                enceinte.scale.x += (vouluX - enceinte.scale.x) * part
                enceinte.scale.z = enceinte.scale.x

                // Le debattement, amplifie mille fois pour se voir : un
                // deplacement reel de trois millimetres serait invisible a
                // cette echelle, et c est le seul endroit ou nous exagerons.
                const grave = scene.getObjectByName('grave')
                if (grave !== undefined) {
                  grave.position.z =
                    0.01 + Math.sin(time * 26) * debattement.current * 0.09
                }

                // Un quart de tour tres lent : on fait le tour du coffret
                // sans qu il tourne comme un presentoir de vitrine.
                enceinte.rotation.y = -0.62 + Math.sin(time * 0.18) * 0.14
              }}
            />

            {/* Le voile du bas, dans la teinte du coffret : le titre y tombe. */}
            <div
              aria-hidden="true"
              className="o-pointer-events-none o-absolute o-inset-0 o-z-10"
              style={{
                background: `linear-gradient(to top, ${fondFinition(finition.t, 22, 900)} 0%, transparent 62%), linear-gradient(to right, var(--o-palette-zinc-950) 4%, color-mix(in oklab, var(--o-palette-zinc-950) 50%, transparent) 42%, transparent 68%)`,
                transition: 'background 700ms ease',
              }}
            />
            <Grain opacite={0.06} />

            <div className="o-relative o-z-20 o-flex o-grow o-flex-col o-justify-end o-px-6 o-pb-20 o-pt-28 md:o-px-12 md:o-pb-24">
              <Surgit>
                <Etiquette>Saint-Etienne — coffrets montes et regles a la main</Etiquette>
              </Surgit>
              <TitreVague
                delai={140}
                className="o-m-0 o-mt-5 o-max-w-3xl"
                style={{
                  ...affiche('l', 800),
                  fontSize: 'clamp(2.25rem, 6.2vw, 6.25rem)',
                }}
              >
                Une enceinte seule ne sonne pas.
              </TitreVague>
              <SplitReveal
                as="p"
                by="words"
                stagger={54}
                duration={760}
                distance={30}
                className="o-m-0 o-mt-1 o-max-w-3xl"
                style={{
                  ...affiche('l', 300),
                  fontSize: 'clamp(1.75rem, 4.4vw, 4.25rem)',
                  color: encreSurSombre(),
                }}
              >
                Elle sonne dans une piece.
              </SplitReveal>

              <div className="o-mt-10 o-max-w-lg">
                <Surgit
                  delai={600}
                  as="p"
                  className="o-m-0 o-text-base o-leading-relaxed o-text-zinc-300"
                >
                  Le mur derriere elle lui creuse un trou de neuf decibels, et personne ne
                  vous le dit en magasin. Reglez la piece, le recul et la position : la
                  courbe se refait.
                </Surgit>
                <Surgit delai={720} className="o-mt-8">
                  <Actions
                    pleine={[
                      '#courbe',
                      <>
                        Tracer la courbe{' '}
                        <Icon icon={ArrowDown} size={16} aria-hidden="true" />
                      </>,
                    ]}
                    fantome={['#coffret', 'Ouvrir le coffret']}
                  />
                </Surgit>
              </div>
            </div>

            <div className="o-hidden lg:o-block">
              <Coin position="hd">
                {modele.reference} — {modele.type}
                <br />
                {modele.rendement} dB / W / m — {modele.impedance}
              </Coin>
            </div>
          </section>

          {/*
            ----- Le mecanisme : la courbe -----------------------------------
          */}
          <section
            id="courbe"
            className="o-scroll-mt-24 o-border-t o-border-white-10 o-px-6 o-py-20 md:o-px-12 md:o-py-28"
          >
            <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
              <div className="md:o-col-span-7">
                <Indice rang="01">La courbe</Indice>
                <h2
                  className="o-m-0 o-mt-5 o-max-w-2xl"
                  style={{
                    ...affiche('m', 800),
                    fontSize: 'clamp(1.75rem, 4vw, 3.25rem)',
                  }}
                >
                  A {nombre(recul * 100)} centimetres du mur, le creux tombe a{' '}
                  {hertz(courbe.creux)}.
                </h2>
              </div>
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400 md:o-col-span-5 md:o-text-right">
                Cinq termes, additionnes en decibels :
                <br />
                le coffret, le mur, le gain de piece, les modes, l angle.
              </p>
            </div>

            <div className="o-mt-12 o-grid o-gap-10 lg:o-grid-cols-12 lg:o-gap-12">
              <div className="o-flex o-flex-col o-gap-7 lg:o-col-span-4">
                <fieldset className="o-m-0 o-p-0">
                  <legend className="o-mb-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                    Le modele
                  </legend>
                  <div className="o-flex o-flex-wrap o-gap-2">
                    {MODELES.map((m) => (
                      <Choix
                        key={m.cle}
                        actif={m.cle === cleModele}
                        onClick={() => {
                          setCleModele(m.cle)
                        }}
                      >
                        {m.reference}
                      </Choix>
                    ))}
                  </div>
                  <p className="o-m-0 o-mt-3 o-text-sm o-leading-relaxed o-text-zinc-300">
                    {modele.note}
                  </p>
                </fieldset>

                <fieldset className="o-m-0 o-p-0">
                  <legend className="o-mb-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                    La piece
                  </legend>
                  <div className="o-flex o-flex-wrap o-gap-2">
                    {SALLES.map((s) => (
                      <Choix
                        key={s.cle}
                        actif={s.cle === cleSalle}
                        onClick={() => {
                          setCleSalle(s.cle)
                        }}
                      >
                        {s.nom}
                      </Choix>
                    ))}
                  </div>
                  <p className="o-m-0 o-mt-3 o-font-mono o-text-xs o-text-zinc-400">
                    {nombre(salle.longueur, 1)} x {nombre(salle.largeur, 1)} x{' '}
                    {nombre(salle.hauteur, 1)} m — {salle.sol}
                  </p>
                </fieldset>

                <fieldset className="o-m-0 o-p-0">
                  <legend className="o-mb-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                    Le recul, et la position
                  </legend>
                  <div className="o-flex o-flex-wrap o-gap-2">
                    {RECULS.map((d) => (
                      <Choix
                        key={d}
                        actif={d === recul}
                        onClick={() => {
                          setRecul(d)
                        }}
                      >
                        {`${nombre(d * 100)} cm`}
                      </Choix>
                    ))}
                  </div>
                  <div className="o-mt-2 o-flex o-flex-wrap o-gap-2">
                    {POSITIONS.map((p) => (
                      <Choix
                        key={p.cle}
                        actif={p.cle === clePosition}
                        onClick={() => {
                          setClePosition(p.cle)
                        }}
                      >
                        {p.nom}
                      </Choix>
                    ))}
                  </div>
                  <p className="o-m-0 o-mt-3 o-text-xs o-leading-relaxed o-text-zinc-400">
                    {recul === meilleurRecul
                      ? 'Des quatre reculs, c est celui qui donne la courbe la plus droite dans cette piece.'
                      : `Des quatre reculs, c est a ${nombre(meilleurRecul * 100)} cm que la courbe est la plus droite dans cette piece.`}
                  </p>
                </fieldset>
              </div>

              <div className="o-min-w-0 lg:o-col-span-8">
                <div className="o-flex o-flex-wrap o-items-center o-justify-between o-gap-4">
                  <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                    Balayage —{' '}
                    <span
                      ref={lecture}
                      aria-hidden="true"
                      className="o-tabular-nums"
                      style={{ color: encreSurSombre() }}
                    >
                      20 Hz — 0,0 dB
                    </span>
                  </p>
                  <button
                    type="button"
                    aria-pressed={enMarche}
                    onClick={() => {
                      setEnMarche((v) => !v)
                    }}
                    className="o-rounded-full o-border-w-1 o-border-white-20 o-px-4 o-py-1.5 o-font-mono o-text-xs o-uppercase o-tracking-wider o-text-zinc-200 o-transition-colors hover:o-bg-white-10 focus:o-ring"
                  >
                    {enMarche ? 'Arreter le balayage' : 'Relancer le balayage'}
                  </button>
                </div>

                <div
                  className="o-mt-3 o-overflow-hidden o-rounded-2xl o-border-w-1 o-border-white-10 o-p-3 md:o-p-5"
                  style={{ backgroundColor: fondFinition(finition.t, 8, 900) }}
                >
                  <CourbeDessinee
                    courbe={courbe}
                    finition={finition}
                    curseur={(el) => {
                      curseur.current = el
                    }}
                  />
                </div>

                <dl className="o-m-0 o-mt-8 o-grid o-gap-x-10 sm:o-grid-cols-2">
                  <Lecture
                    quoi="Extension dans le grave, en piece"
                    valeur={hertz(courbe.coupure)}
                    note={`Accord de l event a ${String(modele.accord)} Hz ; la piece rattrape le reste.`}
                  />
                  <Lecture
                    quoi="Creux du mur de derriere"
                    valeur={hertz(courbe.creux)}
                    note="La reflexion a parcouru deux fois le recul de plus que le son direct."
                  />
                  <Lecture
                    quoi="Premier mode axial"
                    valeur={hertz(courbe.mode)}
                    note={`La longueur de la piece, ${nombre(salle.longueur, 1)} m, et rien d autre.`}
                  />
                  <Lecture
                    quoi="Ecart de 40 a 400 hertz"
                    valeur={`${nombre(courbe.ecart, 1)} dB`}
                    note="Le seul chiffre qui separe vraiment deux placements."
                  />
                </dl>
              </div>
            </div>
          </section>

          {/*
            ----- Le coffret : une figure numerotee, et sa legende ----------
          */}
          <section
            id="coffret"
            className="o-scroll-mt-24 o-border-t o-border-white-10 o-px-6 o-py-20 md:o-px-12 md:o-py-28"
            style={{ backgroundColor: fondFinition(finition.t, 7, 900) }}
          >
            <div className="o-grid o-gap-12 lg:o-grid-cols-12">
              <div className="o-min-w-0 lg:o-col-span-6">
                <div className="o-mx-auto o-w-full o-max-w-lg">
                  <CoupeDuCoffret finition={finition} />
                </div>
                <p className="o-m-0 o-mt-4 o-text-center o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                  Figure 1 — {modele.reference}, coupe longitudinale, echelle 1 : 4
                </p>
              </div>

              <div className="lg:o-col-span-6">
                <Indice rang="02">Le coffret</Indice>
                <h2
                  className="o-m-0 o-mt-5 o-max-w-md"
                  style={{
                    ...affiche('m', 800),
                    fontSize: 'clamp(1.75rem, 3.6vw, 3rem)',
                  }}
                >
                  Six pieces, et une seule qui coute cher.
                </h2>
                <p className="o-m-0 o-mt-5 o-max-w-md o-text-base o-leading-relaxed o-text-zinc-300">
                  Le haut-parleur vaut le tiers du prix ; le contreplaque de bouleau, la
                  colle et les heures valent le reste. Un coffret mal fait s entend avant
                  le haut-parleur.
                </p>
                <dl className="o-m-0 o-mt-10">
                  {COUPE.map(([rang, quoi, texte]) => (
                    <div
                      key={rang}
                      className="o-grid o-gap-x-5 o-gap-y-1 o-border-t o-border-white-10 o-py-4 sm:o-grid-cols-12"
                    >
                      <dt className="o-flex o-items-baseline o-gap-3 sm:o-col-span-4">
                        <span
                          className="o-font-mono o-text-xs o-tabular-nums"
                          style={{ color: encreSurSombre() }}
                        >
                          {rang}
                        </span>
                        <span className="o-text-sm o-font-semibold o-text-zinc-50">
                          {quoi}
                        </span>
                      </dt>
                      <dd className="o-m-0 o-text-sm o-leading-relaxed o-text-zinc-300 sm:o-col-span-8">
                        {texte}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </section>

          {/*
            ----- Les finitions, le support, le cable ------------------------
          */}
          <section
            id="finitions"
            className="o-scroll-mt-24 o-border-t o-border-white-10 o-px-6 o-py-20 md:o-px-12 md:o-py-28"
          >
            <Indice rang="03">Le reste</Indice>
            <h2
              className="o-m-0 o-mt-5 o-max-w-2xl"
              style={{ ...affiche('m', 800), fontSize: 'clamp(1.75rem, 4vw, 3.25rem)' }}
            >
              Ce qui se choisit, et ce qui se paye.
            </h2>

            <div className="o-mt-12 o-grid o-gap-10 lg:o-grid-cols-12 lg:o-gap-12">
              <div className="lg:o-col-span-7">
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                  La finition du coffret
                </p>
                <ul className="o-m-0 o-mt-4 o-grid o-list-none o-gap-3 o-p-0 sm:o-grid-cols-3">
                  {FINITIONS.map((f) => {
                    const actif = f.cle === cleFinition
                    return (
                      <li key={f.cle}>
                        <SpotlightCard
                          radius={220}
                          strength={0.4}
                          color={teinteFinition(f.t, 300)}
                          className="o-h-full o-rounded-2xl"
                        >
                          <button
                            type="button"
                            aria-pressed={actif}
                            onClick={() => {
                              setCleFinition(f.cle)
                            }}
                            className={`o-h-full o-w-full o-cursor-pointer o-p-4 o-text-left focus:o-ring ${verre(true)}`}
                            style={{
                              borderColor: actif ? teinteFinition(f.t, 300) : undefined,
                            }}
                          >
                            <span
                              aria-hidden="true"
                              className="o-block o-h-16 o-w-full o-rounded-lg"
                              style={{
                                background: `linear-gradient(150deg, ${teinteFinition(f.t, 400)}, ${teinteFinition(f.t, 800)})`,
                              }}
                            />
                            <span className="o-mt-3 o-block o-text-sm o-font-semibold o-text-zinc-50">
                              {f.nom}
                            </span>
                            <span className="o-mt-1 o-block o-text-xs o-leading-relaxed o-text-zinc-400">
                              {f.matiere}
                            </span>
                            <span
                              className="o-mt-2 o-block o-font-mono o-text-xs o-tabular-nums"
                              style={{ color: encreSurSombre() }}
                            >
                              {f.prix === 0
                                ? 'Comprise'
                                : `+ ${euros(f.prix)} par enceinte`}
                            </span>
                          </button>
                        </SpotlightCard>
                      </li>
                    )
                  })}
                </ul>

                <p className="o-m-0 o-mt-10 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                  La longueur de cable
                </p>
                <div className="o-mt-3 o-flex o-flex-wrap o-gap-2">
                  {CABLES.map((c) => (
                    <Choix
                      key={c.cle}
                      actif={c.cle === cleCable}
                      onClick={() => {
                        setCleCable(c.cle)
                      }}
                    >
                      {`${c.nom} — ${euros(c.prix)}`}
                    </Choix>
                  ))}
                </div>
                <p className="o-m-0 o-mt-3 o-max-w-md o-text-xs o-leading-relaxed o-text-zinc-400">
                  Cuivre etame de quatre millimetres carres, sans gaine bavarde. Au-dela
                  de cinq metres, la resistance de ligne commence a se voir sur une charge
                  de quatre ohms.
                </p>
              </div>

              <div className="lg:o-col-span-5">
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                  Le support
                </p>
                <div
                  className="o-mt-4 o-rounded-2xl o-border-w-1 o-border-white-10 o-p-2"
                  style={{ backgroundColor: fondFinition(finition.t, 8, 900) }}
                >
                  <AnimatedList
                    label="Support sous l enceinte"
                    items={SUPPORTS.map((s) => ({
                      id: s.id,
                      label: s.label,
                      hint: s.prix === 0 ? 'compris' : euros(s.prix),
                    }))}
                    value={support}
                    onChange={setSupport}
                    stagger={70}
                  />
                </div>
                <p className="o-m-0 o-mt-4 o-max-w-sm o-text-xs o-leading-relaxed o-text-zinc-400">
                  {supportChoisi.hint}. Une bibliotheque met le haut-parleur a quarante
                  centimetres du mur sans qu on le decide : c est le premier reglage, et
                  il est gratuit.
                </p>
              </div>
            </div>
          </section>

          {/*
            ----- Une phrase, et rien d autre --------------------------------
          */}
          <section
            className="o-flex o-flex-col o-justify-center o-border-t o-border-white-10 o-px-6 o-py-24 md:o-px-12"
            style={{
              minHeight: '62vh',
              backgroundColor: fondFinition(finition.t, 12, 900),
            }}
          >
            <p
              className="o-m-0 o-max-w-4xl o-text-balance"
              style={{
                ...affiche('m', 300),
                fontSize: 'clamp(1.75rem, 3.8vw, 3.75rem)',
                lineHeight: 1.12,
              }}
            >
              <span className="o-text-zinc-500">
                Nous ne vendons pas de cable a mille euros, pas de pointes en ceramique,
                pas de disque de demonstration.{' '}
              </span>
              <span className="o-text-zinc-50">
                Nous vendons une paire d enceintes et une apres-midi pour les placer chez
                vous.
              </span>
            </p>
            <p className="o-m-0 o-mt-10 o-max-w-xl o-text-base o-leading-relaxed o-text-zinc-300">
              La livraison comprend la mesure au micro dans votre piece, le reglage du
              recul, et le proces-verbal. Si la courbe ne tient pas, l enceinte repart et
              vous ne payez rien.
            </p>
          </section>
        </main>

        {/*
          ----- Le pied : le catalogue ------------------------------------
        */}
        <footer
          className={`o-relative o-border-t o-border-white-10 o-px-6 o-pb-40 o-pt-16 md:o-px-12 ${panierOuvert ? 'xl:o-pr-80' : ''}`}
        >
          <div className="o-flex o-flex-wrap o-items-end o-justify-between o-gap-6">
            <p
              className="o-m-0"
              style={{ ...affiche('m', 800), fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}
            >
              Membrane
            </p>
            <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
              Catalogue 2026 — references, cotes, masses
            </p>
          </div>

          <div className="o-mt-8 o-overflow-x-auto" style={{ overflowY: 'hidden' }}>
            <table
              className="o-w-full o-text-left o-font-mono o-text-xs"
              style={{ minWidth: 680, borderCollapse: 'collapse' }}
            >
              <thead>
                <tr className="o-text-zinc-400">
                  {[
                    'Code',
                    'Designation',
                    'Cotes en mm',
                    'Masse',
                    'Impedance',
                    'Rendement',
                  ].map((entete) => (
                    <th
                      key={entete}
                      scope="col"
                      className="o-border-b o-border-white-20 o-py-3 o-pr-6 o-font-normal o-uppercase o-tracking-widest"
                    >
                      {entete}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CODES.map((ligne) => (
                  <tr key={ligne[0]}>
                    <th
                      scope="row"
                      className="o-border-b o-border-white-10 o-py-3 o-pr-6 o-font-normal o-tabular-nums"
                      style={{ color: encreSurSombre() }}
                    >
                      {ligne[0]}
                    </th>
                    {ligne.slice(1).map((cellule, rang) => (
                      <td
                        key={rang}
                        className="o-border-b o-border-white-10 o-py-3 o-pr-6 o-tabular-nums o-text-zinc-300"
                      >
                        {cellule}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="o-mt-10 o-flex o-flex-wrap o-items-center o-justify-between o-gap-4 o-border-t o-border-white-10 o-pt-6 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
            <span>© 2026 Membrane</span>
            <span>9 rue des Aciers, 42000 Saint-Etienne — ecoute sur rendez-vous</span>
            <a
              href="#haut"
              className="o-text-zinc-400 o-no-underline hover:o-text-zinc-50 focus:o-ring"
            >
              Remonter ↑
            </a>
          </div>
        </footer>

        <Panier
          lignes={lignes}
          total={total}
          ouvert={panierOuvert}
          onBascule={basculerPanier}
        />
      </div>
    </Porte>
  )
}
