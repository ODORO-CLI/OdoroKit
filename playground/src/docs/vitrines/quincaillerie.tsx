/**
 * Ecrou — quincaillerie de quartier, Paris 17.
 *
 * ## La reference : Artefakt
 *
 * Une grille de cellules visible, des filets d un pixel, le mono partout ou il
 * n y a ni titre ni paragraphe, et aucun arrondi. Une quincaillerie est deja
 * une grille — des tiroirs, des casiers, des rayons — et la page n a donc pas
 * a inventer sa structure : elle la copie sur le meuble.
 *
 * ## Le mecanisme : le tiroir
 *
 * On cherche une piece comme on la cherche au comptoir : **par diametre, par
 * pas de vis et par matiere**. Le tiroir s ouvre alors sur ce qui s y trouve
 * vraiment, et la page calcule ce que le comptoir sait de tete :
 *
 * - le **foret a percer** avant taraudage, qui vaut le diametre nominal moins
 *   le pas — c est la regle du metier, pas une approximation ;
 * - la **clef sur plats**, qui est normalisee par diametre ;
 * - le **couple de serrage**, celui de la classe 8.8 a sec, corrige par la
 *   matiere : un laiton ne se serre pas au couple d un acier ;
 * - le **prix a la piece et au cent**, et le **stock du casier**.
 *
 * Et la vis se **dessine a l echelle** : la tete au diametre de la clef, la
 * tige au diametre nominal, et les filets espaces du pas choisi. Changer de
 * pas change le dessin, parce que c est ce que le pas fait.
 *
 * ## Ce que la page ne charge pas
 *
 * Aucune photographie, aucune scene graphique. La grille est deux degrades
 * repetes, le champ d aimants un champ d aiguilles du registre, la vis et le
 * plan du magasin des chemins SVG. Une page de visserie n a pas besoin de
 * huit cents kilo-octets de moteur pour montrer un ecrou.
 *
 * @module
 */

import { useMotionState } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import { ArrowRight, ArrowUpRight } from '@odoro-cli/icons/filaire'
import { Reveal } from '@odoro-cli/libs/motion'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

import { MagnetLines } from '@/odoro/effect/MagnetLines.jsx'
import { TargetCursor } from '@/odoro/effect/TargetCursor.jsx'
import { DecodeText } from '@/odoro/text/DecodeText.jsx'

import { nuit } from './communs.jsx'
import {
  affiche,
  BarreFilet,
  CHROME,
  Etiquette,
  Indice,
  Manifeste,
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
  ['#tiroir', 'Le tiroir'],
  ['#matieres', 'Les matieres'],
  ['#comptoir', 'Le comptoir'],
  ['#rayon', 'Le plan'],
]

/* ============================ Le meuble a tiroirs ====================== */

/** Un diametre de la visserie metrique, et ce que le comptoir en sait. */
interface Filet {
  /** Diametre nominal, en millimetres. */
  readonly d: number
  /** Les pas disponibles : le gros d abord, le fin ensuite. */
  readonly pas: readonly number[]
  /** Clef sur plats, en millimetres. */
  readonly clef: number
  /** Couple de serrage d une 8.8 a sec, en newtons-metres. */
  readonly couple: number
  /** Prix d une piece de trente, en centimes, en acier zingue. */
  readonly prix: number
  /** Stock du casier : zingue, A2, A4, laiton. */
  readonly stock: readonly [number, number, number, number]
  /** Le casier du meuble. */
  readonly casier: string
}

/**
 * Le meuble, tiroir par tiroir.
 *
 * Les clefs sur plats et les couples sont ceux des tables du metier ; les
 * stocks et les prix sont ceux de la maison, releves au dernier inventaire.
 */
const MEUBLE: readonly Filet[] = [
  {
    d: 3,
    pas: [0.5],
    clef: 5.5,
    couple: 1.3,
    prix: 6,
    stock: [2400, 1800, 620, 940],
    casier: 'A-04',
  },
  {
    d: 4,
    pas: [0.7],
    clef: 7,
    couple: 3,
    prix: 7,
    stock: [2180, 1610, 540, 820],
    casier: 'A-07',
  },
  {
    d: 5,
    pas: [0.8],
    clef: 8,
    couple: 6,
    prix: 9,
    stock: [1940, 1380, 470, 690],
    casier: 'A-11',
  },
  {
    d: 6,
    pas: [1, 0.75],
    clef: 10,
    couple: 10.1,
    prix: 12,
    stock: [1750, 1220, 410, 580],
    casier: 'A-14',
  },
  {
    d: 8,
    pas: [1.25, 1],
    clef: 13,
    couple: 24.6,
    prix: 18,
    stock: [1410, 960, 330, 415],
    casier: 'A-18',
  },
  {
    d: 10,
    pas: [1.5, 1.25],
    clef: 17,
    couple: 48,
    prix: 29,
    stock: [1120, 710, 245, 260],
    casier: 'A-22',
  },
  {
    d: 12,
    pas: [1.75, 1.25],
    clef: 19,
    couple: 84,
    prix: 46,
    stock: [830, 485, 160, 145],
    casier: 'A-26',
  },
  {
    d: 16,
    pas: [2, 1.5],
    clef: 24,
    couple: 208,
    prix: 98,
    stock: [435, 240, 95, 0],
    casier: 'A-31',
  },
  {
    d: 20,
    pas: [2.5, 1.5],
    clef: 30,
    couple: 407,
    prix: 185,
    stock: [215, 115, 40, 0],
    casier: 'A-35',
  },
]

/** Une matiere, et ce qu elle coute en prix comme en couple. */
interface Matiere {
  readonly code: string
  readonly nom: string
  /** Part du prix de l acier zingue. */
  readonly prix: number
  /** Part du couple de la classe 8.8. */
  readonly couple: number
  readonly note: string
}

const MATIERES: readonly Matiere[] = [
  {
    code: 'ZN',
    nom: 'Acier zingue 8.8',
    prix: 1,
    couple: 1,
    note: 'Le tout-venant. Zingage blanc de huit micrometres : l interieur, l abri, jamais la pluie battante.',
  },
  {
    code: 'A2',
    nom: 'Inox A2-70',
    prix: 2.4,
    couple: 0.72,
    note: 'Inox 304. Dehors, hors bord de mer. Il se grippe a sec : une pointe de pate au montage.',
  },
  {
    code: 'A4',
    nom: 'Inox A4-80',
    prix: 3.6,
    couple: 0.82,
    note: 'Inox 316 au molybdene. Bord de mer, piscine, toiture. Trois fois le prix, trente ans de plus.',
  },
  {
    code: 'MS',
    nom: 'Laiton',
    prix: 3,
    couple: 0.45,
    note: 'Decoratif, amagnetique, tendre. On ne serre pas un laiton au couple d un acier : on le casse.',
  },
]

/** Le texte d un pas : « 1,25 mm — fin ». */
function direPas(filet: Filet, pas: number): string {
  const mot = pas === filet.pas[0] ? 'gros' : 'fin'
  const nombre = pas.toFixed(2).replace(/0+$/, '').replace(/\.$/, '').replace('.', ',')
  return `${nombre} mm ${mot}`
}

/** Deux decimales a la francaise. */
function euros(centimes: number): string {
  return `${(centimes / 100).toFixed(2).replace('.', ',')} EUR`
}

/* ============================ Les matieres, en cases =================== */

/** Une case du tableau : un numero, un symbole, un chiffre. */
interface Case {
  readonly rang: string
  readonly symbole: string
  readonly nom: string
  readonly valeur: string
  readonly unite: string
}

/**
 * Le tableau des matieres (C13).
 *
 * La forme est celle d un tableau periodique : un rang en petit dans le coin,
 * un symbole en grand, un chiffre dessous. Le chiffre n est pas le meme d une
 * case a l autre — c est ce qui compte pour cette matiere-la, et c est ce qui
 * distingue ce tableau d une barre de quatre nombres.
 */
const CASES: readonly Case[] = [
  {
    rang: '01',
    symbole: '4.6',
    nom: 'Acier doux',
    valeur: '400',
    unite: 'MPa a la rupture',
  },
  {
    rang: '02',
    symbole: '8.8',
    nom: 'Acier zingue',
    valeur: '800',
    unite: 'MPa a la rupture',
  },
  {
    rang: '03',
    symbole: '10.9',
    nom: 'Acier trempe',
    valeur: '1000',
    unite: 'MPa a la rupture',
  },
  {
    rang: '04',
    symbole: '12.9',
    nom: 'Acier a haute charge',
    valeur: '1200',
    unite: 'MPa a la rupture',
  },
  { rang: '05', symbole: 'A2', nom: 'Inox 304', valeur: '700', unite: 'MPa — classe 70' },
  { rang: '06', symbole: 'A4', nom: 'Inox 316', valeur: '800', unite: 'MPa — classe 80' },
  { rang: '07', symbole: 'Zn', nom: 'Zingage blanc', valeur: '8', unite: 'micrometres' },
  {
    rang: '08',
    symbole: 'ZnNi',
    nom: 'Zinc-nickel',
    valeur: '720',
    unite: 'h au brouillard salin',
  },
  {
    rang: '09',
    symbole: 'Ms',
    nom: 'Laiton CuZn37',
    valeur: '110',
    unite: 'HV de durete',
  },
  { rang: '10', symbole: 'Br', nom: 'Bronze', valeur: '240', unite: 'MPa a la rupture' },
  { rang: '11', symbole: 'PA', nom: 'Polyamide', valeur: '95', unite: 'degres admis' },
  {
    rang: '12',
    symbole: 'Al',
    nom: 'Aluminium 5754',
    valeur: '215',
    unite: 'MPa a la rupture',
  },
  {
    rang: '13',
    symbole: 'Nyl',
    nom: 'Bague nylstop',
    valeur: '120',
    unite: 'degres admis',
  },
  {
    rang: '14',
    symbole: 'Fr',
    nom: 'Frein filet moyen',
    valeur: '150',
    unite: 'degres admis',
  },
  {
    rang: '15',
    symbole: 'Gr',
    nom: 'Rondelle Grower',
    valeur: '2',
    unite: 'tours de reserve',
  },
  {
    rang: '16',
    symbole: 'Ep',
    nom: 'Rondelle epaisse',
    valeur: '4',
    unite: 'mm d epaisseur',
  },
  {
    rang: '17',
    symbole: 'Cu',
    nom: 'Rivet cuivre',
    valeur: '210',
    unite: 'MPa au cisaillement',
  },
  {
    rang: '18',
    symbole: 'Ti',
    nom: 'Titane grade 5',
    valeur: '900',
    unite: 'MPa a la rupture',
  },
]

/* ============================ Le comptoir ============================== */

/** Un service du comptoir, avec son tarif et son delai. */
const COMPTOIR: readonly (readonly [string, string, string, string])[] = [
  ['Reproduction de cle plate', 'Sur place, au duplicateur', '6,50 EUR', '4 minutes'],
  ['Cle a points et a pompe', 'Carte de propriete exigee', '34,00 EUR', '3 jours'],
  [
    'Coupe de tige filetee',
    'Au metre ou a la cote, ebavuree',
    '1,20 EUR la coupe',
    'immediat',
  ],
  [
    'Taraudage M3 a M20',
    'Dans votre piece, a l etabli',
    '4,00 EUR le trou',
    '20 minutes',
  ],
  ['Affutage de lame', 'Ciseaux, secateurs, couteaux', '5,00 EUR', 'le lendemain'],
  [
    'Decoupe de verre et de plexiglas',
    'Jusqu a 120 par 80 centimetres',
    '14,00 EUR le metre',
    '30 minutes',
  ],
  ['Remontage de store et de tringle', 'Cordon, sangle, treuil', 'sur devis', '2 jours'],
]

/* ============================ Le plan du magasin ======================= */

/** Un rayon du plan, avec sa boite dans le repere du plan. */
interface Rayon {
  readonly lettre: string
  readonly nom: string
  readonly x: number
  readonly y: number
  readonly w: number
  readonly h: number
  readonly quoi: string
}

const RAYONS: readonly Rayon[] = [
  {
    lettre: 'A',
    nom: 'Visserie au detail',
    x: 24,
    y: 24,
    w: 168,
    h: 80,
    quoi: 'Le meuble a 620 tiroirs, de M2 a M24. Vente a la piece, au cent, au kilo.',
  },
  {
    lettre: 'B',
    nom: 'Outillage a main',
    x: 24,
    y: 116,
    w: 168,
    h: 80,
    quoi: 'Marteaux, scies, limes, serre-joints. Les manches en frene se remplacent.',
  },
  {
    lettre: 'C',
    nom: 'Electricite',
    x: 24,
    y: 208,
    w: 168,
    h: 72,
    quoi: 'Fil au metre, domino, disjoncteur, va-et-vient. Conseil de section gratuit.',
  },
  {
    lettre: 'D',
    nom: 'Plomberie',
    x: 216,
    y: 24,
    w: 152,
    h: 104,
    quoi: 'Joints, raccords laiton, siphons. On depanne un mitigeur en piece detachee.',
  },
  {
    lettre: 'E',
    nom: 'Peinture et colle',
    x: 216,
    y: 140,
    w: 152,
    h: 72,
    quoi: 'Mise a la teinte au comptoir, en 900 nuances, pendant que vous attendez.',
  },
  {
    lettre: 'F',
    nom: 'Jardin et balcon',
    x: 216,
    y: 224,
    w: 152,
    h: 56,
    quoi: 'Secateurs, terreau, tuteurs. Affutage rendu le lendemain.',
  },
  {
    lettre: 'G',
    nom: 'Aimants et abrasifs',
    x: 392,
    y: 24,
    w: 136,
    h: 120,
    quoi: 'Neodyme de 3 a 40 millimetres, papier de verre au grain, laine d acier.',
  },
  {
    lettre: 'H',
    nom: 'Cles et decoupe',
    x: 392,
    y: 156,
    w: 136,
    h: 76,
    quoi: 'Le duplicateur, la scie a verre, l etabli. C est ici qu on vous taraude un trou.',
  },
]

/* ============================ La feuille =============================== */

const STYLE_QUINCAILLERIE = 'o-vitrine-quincaillerie'

/**
 * Ce que les utilitaires n ont pas.
 *
 * Le tiroir sort d un coup sec et s arrete : une ouverture de meuble n a pas
 * de rebond. Le reste est du clignotement de temoin et un filet qui rampe.
 */
const CSS_QUINCAILLERIE = [
  '@keyframes o-qc-tiroir{0%{transform:translate3d(-26px,0,0);opacity:0.25}100%{transform:none;opacity:1}}',
  '@keyframes o-qc-temoin{0%,100%{opacity:0.3}50%{opacity:1}}',
  '@keyframes o-qc-file{0%{stroke-dashoffset:0}100%{stroke-dashoffset:-24}}',
  '[data-o-qc-tiroir]{animation:o-qc-tiroir 520ms cubic-bezier(0.16,1,0.3,1) both}',
  '[data-o-qc-temoin]{animation:o-qc-temoin 2.2s ease-in-out infinite}',
  '[data-o-qc-file]{animation:o-qc-file 1.4s linear infinite}',
  '@media (prefers-reduced-motion:reduce){',
  '[data-o-qc-tiroir],[data-o-qc-temoin],[data-o-qc-file]{animation:none}}',
].join('')

function useFeuilleQuincaillerie(): void {
  useEffect(() => {
    if (document.getElementById(STYLE_QUINCAILLERIE) !== null) return
    const feuille = document.createElement('style')
    feuille.id = STYLE_QUINCAILLERIE
    feuille.textContent = CSS_QUINCAILLERIE
    document.head.append(feuille)
  }, [])
}

/* ============================ La grille qui s allume =================== */

/**
 * La grille de dix pixels, et la lueur qui la suit.
 *
 * La grille entiere serait un quadrillage de cahier ; on n en laisse donc voir
 * qu un disque, place sous le pointeur par deux variables. Sans pointeur fin,
 * et sous mouvement reduit, le disque reste au centre : la grille existe
 * quand meme, elle ne suit simplement personne.
 */
function Grille({ hauteur = 220 }: { readonly hauteur?: number }): ReactElement {
  const cadre = useRef<HTMLDivElement>(null)
  const { reduced } = useMotionState()

  useEffect(() => {
    const el = cadre.current
    if (el === null || reduced) return
    if (!window.matchMedia('(pointer: fine)').matches) return

    let boite = el.getBoundingClientRect()
    const mesurer = (): void => {
      boite = el.getBoundingClientRect()
    }
    const bouger = (evenement: PointerEvent): void => {
      el.style.setProperty(
        '--o-qc-x',
        `${String(Math.round(evenement.clientX - boite.left))}px`,
      )
      el.style.setProperty(
        '--o-qc-y',
        `${String(Math.round(evenement.clientY - boite.top))}px`,
      )
    }
    window.addEventListener('pointermove', bouger, { passive: true })
    window.addEventListener('scroll', mesurer, { passive: true })
    window.addEventListener('resize', mesurer)
    return () => {
      window.removeEventListener('pointermove', bouger)
      window.removeEventListener('scroll', mesurer)
      window.removeEventListener('resize', mesurer)
    }
  }, [reduced])

  const trame = `linear-gradient(${accentDoux(700, 26)} 1px, transparent 1px), linear-gradient(90deg, ${accentDoux(700, 26)} 1px, transparent 1px)`
  const lueur = `radial-gradient(${String(hauteur)}px ${String(hauteur)}px at var(--o-qc-x, 50%) var(--o-qc-y, 40%), #000 0%, #000 28%, transparent 72%)`

  return (
    <div
      ref={cadre}
      aria-hidden="true"
      className="o-pointer-events-none o-absolute o-inset-0 o-overflow-hidden"
    >
      {/* La trame de fond, a peine lisible : le meuble derriere la vitre. */}
      <div
        className="o-absolute o-inset-0"
        style={{ backgroundImage: trame, backgroundSize: '10px 10px', opacity: 0.35 }}
      />
      {/* La meme trame, appuyee, decoupee par le disque du pointeur. */}
      <div
        className="o-absolute o-inset-0"
        style={{
          backgroundImage: trame,
          backgroundSize: '10px 10px',
          maskImage: lueur,
          WebkitMaskImage: lueur,
        }}
      />
    </div>
  )
}

/* ============================ La grammaire du cadre ==================== */

/** Une cellule : jamais bordee de quatre cotes, toujours posee sur la grille. */
function Cellule({
  children,
  className,
  style,
}: {
  readonly children: ReactNode
  readonly className?: string
  readonly style?: CSSProperties
}): ReactElement {
  return (
    <div
      className={`o-relative o-bg-zinc-50 dark:o-bg-zinc-950 ${className ?? ''}`}
      style={style}
    >
      {children}
    </div>
  )
}

/** Le bouton de la page : carre, en mono, jamais arrondi. */
function Bouton({
  href,
  children,
  pleine = true,
}: {
  readonly href: string
  readonly children: ReactNode
  readonly pleine?: boolean
}): ReactElement {
  return (
    <a
      href={href}
      className="o-inline-flex o-items-center o-gap-2 o-px-6 o-py-3 o-font-mono o-text-xs o-font-semibold o-uppercase o-tracking-widest o-no-underline o-transition-opacity hover:o-opacity-85 focus:o-ring"
      style={
        pleine
          ? aplat()
          : { boxShadow: `inset 0 0 0 1px ${accentDoux(700, 46)}`, color: 'inherit' }
      }
    >
      {children}
    </a>
  )
}

/* ============================ La vis dessinee ========================== */

/**
 * La vis, dessinee a l echelle, en millimetres.
 *
 * Le repere de la figure **est** le millimetre : la tete fait la clef sur
 * plats, la tige le diametre nominal, et les filets sont espaces du pas. Une
 * M20 au pas de 2,5 n a donc pas le meme dessin qu une M20 au pas de 1,5, et
 * c est exactement ce que le pas change dans la main.
 */
function Vis({
  filet,
  pas,
}: {
  readonly filet: Filet
  readonly pas: number
}): ReactElement {
  const d = filet.d
  const rayon = d / 2
  const teteLongueur = Math.round(d * 0.7 * 10) / 10
  const tige = d * 3
  const depart = 4
  const finTete = depart + teteLongueur
  const finTige = finTete + tige
  const axe = 22

  // Les filets : un triangle par pas, sur les deux bords de la tige.
  const dents: string[] = []
  for (let x = finTete; x < finTige - pas; x += pas) {
    dents.push(
      `M${x.toFixed(2)} ${String(axe - rayon)} l${(pas / 2).toFixed(2)} ${(rayon * 0.34).toFixed(2)} l${(pas / 2).toFixed(2)} ${(-rayon * 0.34).toFixed(2)}`,
    )
    dents.push(
      `M${x.toFixed(2)} ${String(axe + rayon)} l${(pas / 2).toFixed(2)} ${(-rayon * 0.34).toFixed(2)} l${(pas / 2).toFixed(2)} ${(rayon * 0.34).toFixed(2)}`,
    )
  }

  const demi = filet.clef / 2

  return (
    <svg
      viewBox="0 0 96 44"
      className="o-h-auto o-w-full"
      role="img"
      aria-label={`Vis a tete hexagonale de ${String(d)} millimetres, pas de ${direPas(filet, pas)}, clef de ${String(filet.clef)}`}
    >
      {/*
        Le gabarit de la plus grosse du meuble. La figure est a l echelle : sans
        lui, une M3 et une M20 auraient l air d occuper la meme place, et le
        dessin mentirait sur ce qu il montre.
      */}
      {d < 20 && (
        <g
          stroke={accentDoux(700, 20)}
          strokeWidth="0.3"
          fill="none"
          strokeDasharray="1.2 1.2"
        >
          <rect x="4" y="7" width="14" height="30" />
          <rect x="18" y="12" width="60" height="20" />
        </g>
      )}

      {/* La cote du diametre, prise au bord droit de la figure. */}
      <g stroke={accentDoux(700, 40)} strokeWidth="0.25">
        <path
          d={`M${String(finTige)} ${String(axe - rayon)}H86M${String(finTige)} ${String(axe + rayon)}H86`}
          strokeDasharray="1 1"
        />
        <path d={`M86 ${String(axe - rayon)}v${String(d)}`} />
      </g>
      <text
        x="88"
        y={axe + 1}
        fontSize="3.4"
        fill="var(--o-theme-muted)"
        style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.04em' }}
      >
        {`d${String(d)}`}
      </text>
      {d < 20 && (
        <text
          x="4"
          y="5"
          fontSize="3"
          fill="var(--o-theme-muted)"
          style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.1em' }}
        >
          GABARIT M20 — MEME ECHELLE
        </text>
      )}

      {/* La tete : la clef sur plats en vraie grandeur. */}
      <rect
        x={depart}
        y={axe - demi}
        width={teteLongueur}
        height={filet.clef}
        fill={accentDoux(600, 62)}
      />
      <path
        d={`M${String(depart)} ${String(axe - demi + 1.4)}h${String(teteLongueur)}M${String(depart)} ${String(axe + demi - 1.4)}h${String(teteLongueur)}`}
        stroke={accentDoux(900, 70)}
        strokeWidth="0.3"
        fill="none"
      />

      {/* La tige, et ses filets. */}
      <rect
        x={finTete}
        y={axe - rayon}
        width={tige}
        height={d}
        fill={accentDoux(500, 46)}
      />
      <g stroke="var(--o-theme-fg)" strokeWidth="0.22" fill="none" opacity="0.5">
        {dents.map((trace, rang) => (
          <path key={rang} d={trace} />
        ))}
      </g>
      {/* Le bout, chanfreine comme il l est en vrai. */}
      <path
        d={`M${String(finTige)} ${String(axe - rayon)}l${(rayon * 0.5).toFixed(2)} ${(rayon * 0.5).toFixed(2)}l${(-rayon * 0.5).toFixed(2)} ${(rayon * 0.5).toFixed(2)}z`}
        fill={accentDoux(500, 46)}
      />
    </svg>
  )
}

/**
 * L ecrou vu de face, et le trou a percer avant taraudage.
 *
 * Les deux sont dans le meme repere : on voit d un coup que le foret est plus
 * petit que le diametre nominal, et de combien — c est le pas.
 */
function Ecrou({
  filet,
  pas,
}: {
  readonly filet: Filet
  readonly pas: number
}): ReactElement {
  const rayonCercle = filet.clef / Math.sqrt(3)
  const centre = 24
  const sommets = Array.from({ length: 6 }, (_, rang) => {
    const angle = (Math.PI / 3) * rang + Math.PI / 6
    return `${(centre + rayonCercle * Math.cos(angle)).toFixed(2)},${(centre + rayonCercle * Math.sin(angle)).toFixed(2)}`
  }).join(' ')
  const foret = filet.d - pas

  return (
    <svg
      viewBox="0 0 48 48"
      className="o-h-auto o-w-full"
      role="img"
      aria-label={`Ecrou vu de face, clef de ${String(filet.clef)} millimetres, percage a ${foret.toFixed(2).replace('.', ',')}`}
    >
      <polygon
        points={sommets}
        fill={accentDoux(600, 54)}
        stroke={accentDoux(900, 60)}
        strokeWidth="0.3"
      />
      <circle cx={centre} cy={centre} r={filet.d / 2} fill="var(--o-theme-bg)" />
      <circle
        cx={centre}
        cy={centre}
        r={foret / 2}
        fill="none"
        stroke={accent(500)}
        strokeWidth="0.5"
        strokeDasharray="1.6 1.2"
      />
      <path
        d={`M${String(centre)} ${String(centre)}h${String(rayonCercle + 3)}`}
        stroke={accentDoux(700, 40)}
        strokeWidth="0.2"
      />
      <text
        x={centre + rayonCercle + 4}
        y={centre + 1}
        fontSize="3"
        fill="var(--o-theme-muted)"
        style={{ fontFamily: 'var(--o-font-mono)' }}
      >
        {`c ${String(filet.clef)}`}
      </text>
    </svg>
  )
}

/* ============================ Le tiroir ================================ */

/** Le mecanisme : on cherche, le tiroir s ouvre. */
function Tiroir(): ReactElement {
  const [rang, setRang] = useState(4)
  const [rangPas, setRangPas] = useState(0)
  const [rangMatiere, setRangMatiere] = useState(0)

  const filet = MEUBLE[rang] ?? MEUBLE[0]
  if (filet === undefined) throw new Error('meuble vide')
  const pas = filet.pas[Math.min(rangPas, filet.pas.length - 1)] ?? filet.pas[0]
  if (pas === undefined) throw new Error('pas manquant')
  const matiere = MATIERES[rangMatiere] ?? MATIERES[0]
  if (matiere === undefined) throw new Error('matiere manquante')

  const releve = useMemo(() => {
    const foret = filet.d - pas
    const couple = filet.couple * matiere.couple
    const prix = Math.round(filet.prix * matiere.prix)
    const stock = filet.stock[rangMatiere] ?? 0
    const reference = `H-M${String(filet.d).padStart(2, '0')}-${String(Math.round(pas * 100)).padStart(3, '0')}-${matiere.code}`
    return { foret, couple, prix, stock, reference }
  }, [filet, pas, matiere, rangMatiere])

  const cellule = 'o-bg-zinc-50 dark:o-bg-zinc-950'
  const filetDeGrille = accentDoux(700, 22)

  return (
    <div className="o-grid o-gap-10 lg:o-grid-cols-12">
      {/* ----- Les trois recherches ----- */}
      <div className="lg:o-col-span-5">
        <fieldset className="o-m-0 o-border-none o-p-0">
          <legend className="o-mb-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
            1 — Le diametre nominal
          </legend>
          <div
            className="o-grid o-grid-cols-3 o-gap-px sm:o-grid-cols-5"
            style={{ backgroundColor: filetDeGrille }}
          >
            {MEUBLE.map((ligne, index) => {
              const choisi = index === rang
              return (
                <button
                  key={ligne.d}
                  type="button"
                  onClick={() => {
                    setRang(index)
                    setRangPas(0)
                  }}
                  aria-pressed={choisi}
                  className={`o-cursor-pointer o-appearance-none o-border-none o-px-3 o-py-4 o-text-center o-font-mono o-text-sm o-tabular-nums o-transition-colors focus:o-ring ${
                    choisi
                      ? ''
                      : `${cellule} o-text-zinc-700 dark:o-text-zinc-300 hover:o-text-zinc-950 dark:hover:o-text-zinc-50`
                  }`}
                  style={choisi ? aplat() : undefined}
                >
                  M{ligne.d}
                </button>
              )
            })}
            {/* La case vide du meuble : ce qui n est pas en rayon se dit. */}
            <p
              className={`o-m-0 o-px-3 o-py-4 o-text-center o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400 ${cellule}`}
            >
              M24
              <br />
              sur commande
            </p>
          </div>
        </fieldset>

        <fieldset className="o-m-0 o-mt-10 o-border-none o-p-0">
          <legend className="o-mb-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
            2 — Le pas de vis
          </legend>
          <div
            className="o-flex o-flex-wrap o-gap-px"
            style={{ backgroundColor: filetDeGrille }}
          >
            {filet.pas.map((valeur, index) => {
              const choisi = index === Math.min(rangPas, filet.pas.length - 1)
              return (
                <button
                  key={valeur}
                  type="button"
                  onClick={() => {
                    setRangPas(index)
                  }}
                  aria-pressed={choisi}
                  className={`o-grow o-cursor-pointer o-appearance-none o-border-none o-px-4 o-py-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-transition-colors focus:o-ring ${
                    choisi ? '' : `${cellule} o-text-zinc-700 dark:o-text-zinc-300`
                  }`}
                  style={choisi ? aplat() : undefined}
                >
                  {direPas(filet, valeur)}
                </button>
              )
            })}
            {filet.pas.length === 1 && (
              <span
                className={`o-grow o-px-4 o-py-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400 dark:o-text-zinc-500 ${cellule}`}
              >
                Pas fin — non tenu
              </span>
            )}
          </div>
        </fieldset>

        <fieldset className="o-m-0 o-mt-10 o-border-none o-p-0">
          <legend className="o-mb-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
            3 — La matiere
          </legend>
          <div className="o-grid o-gap-px" style={{ backgroundColor: filetDeGrille }}>
            {MATIERES.map((ligne, index) => {
              const choisi = index === rangMatiere
              const vide = (filet.stock[index] ?? 0) === 0
              return (
                <button
                  key={ligne.code}
                  type="button"
                  onClick={() => {
                    setRangMatiere(index)
                  }}
                  aria-pressed={choisi}
                  className={`o-flex o-cursor-pointer o-appearance-none o-items-baseline o-justify-between o-gap-4 o-border-none o-px-4 o-py-4 o-text-left o-transition-colors focus:o-ring ${
                    choisi ? '' : `${cellule} o-text-zinc-700 dark:o-text-zinc-300`
                  }`}
                  style={choisi ? aplat() : undefined}
                >
                  <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest">
                    {ligne.code} — {ligne.nom}
                  </span>
                  <span className="o-font-mono o-text-xs o-tabular-nums o-opacity-70">
                    {vide ? 'vide' : `${String(filet.stock[index] ?? 0)} p.`}
                  </span>
                </button>
              )
            })}
          </div>
          <p className="o-m-0 o-mt-4 o-max-w-sm o-text-xs o-leading-relaxed o-text-zinc-500 dark:o-text-zinc-400">
            {matiere.note}
          </p>
        </fieldset>
      </div>

      {/* ----- Le tiroir qui sort ----- */}
      <div className="o-min-w-0 lg:o-col-span-7">
        <div
          key={releve.reference}
          data-o-qc-tiroir=""
          className="o-relative o-p-6 md:o-p-8"
          style={{
            boxShadow: `inset 0 0 0 1px ${accentDoux(700, 34)}`,
            backgroundColor: accentDoux(300, 8),
          }}
        >
          {/* La plaque du tiroir. */}
          <div className="o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-4 o-border-b o-border-black-10 dark:o-border-zinc-800 o-pb-5">
            <p className="o-m-0 o-font-mono o-text-sm o-uppercase o-tracking-widest o-text-zinc-950 dark:o-text-zinc-50">
              <DecodeText duration={700} trigger="mount">
                {releve.reference}
              </DecodeText>
            </p>
            <p
              className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
              style={{ color: encre() }}
            >
              Tiroir {filet.casier} / {String(rangMatiere + 1)}
            </p>
          </div>

          {/* Les deux dessins, a la meme echelle. */}
          <div className="o-mt-8 o-grid o-items-center o-gap-6 sm:o-grid-cols-4">
            <div className="sm:o-col-span-3">
              <Vis filet={filet} pas={pas} />
            </div>
            <div>
              <Ecrou filet={filet} pas={pas} />
            </div>
          </div>

          {/* Ce que le comptoir sait de tete. */}
          <dl
            className="o-m-0 o-mt-8 o-grid o-gap-px sm:o-grid-cols-2"
            style={{ backgroundColor: accentDoux(700, 22) }}
          >
            {(
              [
                [
                  'Foret avant taraudage',
                  `${releve.foret.toFixed(2).replace('.', ',')} mm`,
                  'diametre nominal moins le pas',
                ],
                [
                  'Clef sur plats',
                  `${String(filet.clef)} mm`,
                  'tete hexagonale, norme metrique',
                ],
                [
                  'Couple de serrage',
                  `${releve.couple < 10 ? releve.couple.toFixed(1).replace('.', ',') : String(Math.round(releve.couple))} Nm`,
                  `a sec, ${matiere.nom.toLowerCase()}`,
                ],
                [
                  'Prix',
                  `${euros(releve.prix)} la piece`,
                  `${euros(Math.round(releve.prix * 90))} le cent`,
                ],
              ] as const
            ).map(([quoi, valeur, note]) => (
              <div key={quoi} className="o-bg-zinc-50 dark:o-bg-zinc-950 o-px-5 o-py-4">
                <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                  {quoi}
                </dt>
                <dd className="o-m-0 o-mt-2 o-font-mono o-text-lg o-tabular-nums o-text-zinc-950 dark:o-text-zinc-50">
                  {valeur}
                </dd>
                <dd className="o-m-0 o-mt-1 o-text-xs o-leading-relaxed o-text-zinc-500 dark:o-text-zinc-400">
                  {note}
                </dd>
              </div>
            ))}
          </dl>

          <p
            className="o-m-0 o-mt-6 o-flex o-items-center o-gap-3 o-font-mono o-text-xs o-uppercase o-tracking-widest"
            aria-live="polite"
            style={{ color: releve.stock === 0 ? 'var(--o-theme-muted)' : encre() }}
          >
            <span
              data-o-qc-temoin=""
              aria-hidden="true"
              className="o-block o-size-1.5"
              style={{
                backgroundColor:
                  releve.stock === 0 ? 'var(--o-theme-muted)' : accent(500),
              }}
            />
            {releve.stock === 0
              ? `Casier vide — commande le mardi, sur place le jeudi.`
              : `${String(releve.stock)} pieces dans le casier ${filet.casier}, au rayon A.`}
          </p>
        </div>
      </div>
    </div>
  )
}

/* ============================ Le plan ================================== */

/** Le plan du magasin (A17) : on clique le rayon, il dit ce qu il tient. */
function Plan(): ReactElement {
  const [choisi, setChoisi] = useState('A')
  const rayon = RAYONS.find((r) => r.lettre === choisi) ?? RAYONS[0]
  if (rayon === undefined) throw new Error('plan vide')

  return (
    <div className="o-grid o-gap-10 lg:o-grid-cols-12">
      <div className="o-min-w-0 lg:o-col-span-7">
        <svg viewBox="0 0 544 344" className="o-h-auto o-w-full" aria-hidden="true">
          {/* Les murs, et la porte percee dans la facade. */}
          <rect
            x="8"
            y="8"
            width="528"
            height="300"
            fill="none"
            stroke={accentDoux(700, 46)}
            strokeWidth="1.5"
          />
          <path d="M20 308h116" stroke="var(--o-theme-bg)" strokeWidth="5" fill="none" />
          <path
            data-o-qc-file=""
            d="M20 308h116"
            stroke={accent(500)}
            strokeWidth="3"
            strokeDasharray="12 12"
            fill="none"
          />
          <text
            x="20"
            y="332"
            fontSize="11"
            fill="var(--o-theme-muted)"
            style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.14em' }}
          >
            ENTREE — RUE DES BATIGNOLLES
          </text>

          {/* Le comptoir, au fond a droite. */}
          <rect x="392" y="244" width="136" height="36" fill={accentDoux(700, 18)} />
          <text
            x="404"
            y="267"
            fontSize="10"
            fill="var(--o-theme-muted)"
            style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.14em' }}
          >
            COMPTOIR
          </text>

          {RAYONS.map((r) => {
            const actif = r.lettre === choisi
            return (
              <g key={r.lettre}>
                <rect
                  x={r.x}
                  y={r.y}
                  width={r.w}
                  height={r.h}
                  fill={actif ? accent(500) : accentDoux(500, 12)}
                  stroke={actif ? accent(500) : accentDoux(700, 40)}
                  strokeWidth="1"
                />
                <text
                  x={r.x + 10}
                  y={r.y + 24}
                  fontSize="15"
                  fill={actif ? 'var(--o-palette-zinc-950)' : 'var(--o-theme-fg)'}
                  style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.1em' }}
                >
                  {r.lettre}
                </text>
                <text
                  x={r.x + 10}
                  y={r.y + 40}
                  fontSize="9"
                  fill={actif ? 'var(--o-palette-zinc-900)' : 'var(--o-theme-muted)'}
                  style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.1em' }}
                >
                  {r.nom.toUpperCase()}
                </text>
              </g>
            )
          })}
        </svg>

        {/* Les vrais boutons du plan : sous la figure, atteignables au clavier. */}
        <div
          className="o-mt-6 o-grid o-grid-cols-2 o-gap-px sm:o-grid-cols-4"
          style={{ backgroundColor: accentDoux(700, 22) }}
        >
          {RAYONS.map((r) => {
            const actif = r.lettre === choisi
            return (
              <button
                key={r.lettre}
                type="button"
                onClick={() => {
                  setChoisi(r.lettre)
                }}
                aria-pressed={actif}
                className={`o-cursor-pointer o-appearance-none o-border-none o-px-3 o-py-3 o-text-left o-font-mono o-text-xs o-uppercase o-tracking-widest o-transition-colors focus:o-ring ${
                  actif
                    ? ''
                    : 'o-bg-zinc-50 dark:o-bg-zinc-950 o-text-zinc-700 dark:o-text-zinc-300'
                }`}
                style={actif ? aplat() : undefined}
              >
                {r.lettre} — {r.nom}
              </button>
            )
          })}
        </div>
      </div>

      <div className="lg:o-col-span-5">
        <div
          className="o-p-8"
          style={{ boxShadow: `inset 0 0 0 1px ${accentDoux(700, 34)}` }}
        >
          <p
            className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
            style={{ color: encre() }}
          >
            Rayon {rayon.lettre}
          </p>
          <h3
            className="o-m-0 o-mt-4 o-uppercase o-text-zinc-950 dark:o-text-zinc-50"
            style={{
              ...affiche('m', 700),
              fontSize: 'clamp(1.5rem, 3vw, 2.5rem)',
              lineHeight: 0.95,
            }}
          >
            {rayon.nom}
          </h3>
          <p
            className="o-m-0 o-mt-5 o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400"
            aria-live="polite"
          >
            {rayon.quoi}
          </p>
          <div className="o-mt-8">
            <Aimant force={0.35}>
              <Bouton href="#comptoir">
                Passer au comptoir <Icon icon={ArrowRight} size={14} aria-hidden="true" />
              </Bouton>
            </Aimant>
          </div>
          <p className="o-m-0 o-mt-8 o-border-t o-border-black-10 dark:o-border-zinc-800 o-pt-5 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
            12 rue des Batignolles, Paris 17
            <br />
            Du mardi au samedi, 8 h 30 — 19 h
            <br />
            Ferme le dimanche et le lundi
          </p>
        </div>
      </div>
    </div>
  )
}

/* ============================ La page ================================== */

export default function Page(): ReactElement {
  const polices = usePolices('grotesk')
  useFeuilleQuincaillerie()
  const { reduced } = useMotionState()

  const plan = <Plan />

  return (
    <Porte forme="trou" marque="Ecrou" sombre={false}>
      <div
        className="o-bg-zinc-50 dark:o-bg-zinc-950 o-text-zinc-900 dark:o-text-zinc-50"
        style={polices}
      >
        {/* ================= L ouverture : la grille et le champ ========== */}
        <header
          className="o-relative o-isolate o-flex o-flex-col"
          style={{ minHeight: ECRAN }}
        >
          <Grille hauteur={260} />
          <BarreFilet
            marque="Ecrou"
            liens={NAVIGATION}
            action={['#tiroir', 'Chercher une piece']}
            sombre={false}
          />

          <div className="o-relative o-flex o-grow o-flex-col o-justify-between o-gap-12 o-px-6 o-pb-10 o-pt-12 md:o-px-10">
            <div className="o-grid o-items-end o-gap-10 lg:o-grid-cols-12">
              <div className="lg:o-col-span-8">
                <Surgit>
                  <Etiquette sombre={false}>
                    Quincaillerie de detail — depuis 1961
                  </Etiquette>
                </Surgit>
                <TitreVague
                  delai={140}
                  className="o-m-0 o-mt-6 o-uppercase o-text-zinc-950 dark:o-text-zinc-50"
                  style={{
                    ...affiche('xl', 800),
                    fontSize: 'clamp(3.25rem, 14vw, 13rem)',
                    lineHeight: 0.8,
                    letterSpacing: '-0.05em',
                  }}
                >
                  Ecrou
                </TitreVague>
                <Surgit
                  delai={520}
                  as="p"
                  className="o-m-0 o-mt-8 o-max-w-lg o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400"
                >
                  Onze mille quatre cents references, vendues a la piece. Vous apportez la
                  votre, on ouvre le tiroir ; vous ne l avez pas, on la mesure au pied a
                  coulisse.
                </Surgit>
                <Surgit delai={640} className="o-mt-10 o-flex o-flex-wrap o-gap-3">
                  <Aimant force={0.4}>
                    <Bouton href="#tiroir">
                      Ouvrir le tiroir{' '}
                      <Icon icon={ArrowRight} size={14} aria-hidden="true" />
                    </Bouton>
                  </Aimant>
                  <Bouton href="#rayon" pleine={false}>
                    Le plan du magasin
                  </Bouton>
                </Surgit>
              </div>

              {/* Le champ d aimants : c est le rayon G, et c est aussi un objet. */}
              <Surgit delai={340} className="lg:o-col-span-4">
                <div
                  className="o-relative"
                  style={{ boxShadow: `inset 0 0 0 1px ${accentDoux(700, 40)}` }}
                >
                  <MagnetLines
                    rows={10}
                    columns={10}
                    length={16}
                    thickness={2}
                    reach={200}
                    color={accent(500)}
                    className="o-aspect-square o-w-full"
                  />
                  <p className="o-m-0 o-border-t o-border-black-10 dark:o-border-zinc-800 o-px-4 o-py-3 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                    Rayon G — aimants neodyme
                    <br />
                    de 3 a 40 mm, a la piece
                  </p>
                </div>
              </Surgit>
            </div>

            {/* La bande des rayons : la page annonce le meuble avant de l ouvrir. */}
            <Surgit
              delai={760}
              className="o-grid o-gap-px sm:o-grid-cols-2 lg:o-grid-cols-4"
              style={{ backgroundColor: accentDoux(700, 22) }}
            >
              {(
                [
                  ['Rayon A', '620 tiroirs', 'M2 a M24, au detail'],
                  ['Rayon H', 'Cles et decoupe', 'duplicateur, etabli, scie'],
                  ['Au comptoir', 'Taraudage M3 a M20', 'dans votre piece'],
                  ['Sans achat', 'Le conseil', 'et le pied a coulisse'],
                ] as const
              ).map(([quoi, valeur, note]) => (
                <Cellule key={quoi} className="o-px-5 o-py-5">
                  <p
                    className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                    style={{ color: encre() }}
                  >
                    {quoi}
                  </p>
                  <p className="o-m-0 o-mt-3 o-font-mono o-text-base o-text-zinc-950 dark:o-text-zinc-50">
                    {valeur}
                  </p>
                  <p className="o-m-0 o-mt-1 o-text-xs o-leading-relaxed o-text-zinc-500 dark:o-text-zinc-400">
                    {note}
                  </p>
                </Cellule>
              ))}
            </Surgit>
          </div>
        </header>

        {/* ================= La coupe : un manifeste sur fond noir ======== */}
        <section
          aria-labelledby="manifeste-titre"
          className="o-px-6 o-py-24 md:o-px-10 md:o-py-32"
          style={nuit('zinc')}
        >
          <div className="o-mx-auto o-max-w-6xl">
            <h2 id="manifeste-titre" className="o-sr-only">
              Ce que nous vendons
            </h2>
            <Reveal>
              <Manifeste eteint="Une grande surface vend des boites de cent vis dont vous en poserez quatre.">
                Nous vendons la quatrieme.
              </Manifeste>
            </Reveal>
            <Reveal delay={120}>
              <p className="o-m-0 o-mt-10 o-max-w-xl o-text-base o-leading-relaxed o-text-zinc-400">
                Le meuble a tiroirs est la depuis 1961. Il a ete repeint deux fois, jamais
                deplace. Ce qui a change, c est le nombre de tiroirs : soixante-dix a l
                ouverture, six cent vingt aujourd hui.
              </p>
            </Reveal>
          </div>
        </section>

        {/* ================= Le mecanisme : le tiroir ===================== */}
        <section
          id="tiroir"
          className="o-relative o-scroll-mt-24 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
        >
          <Grille hauteur={200} />
          <div className="o-relative o-mx-auto o-max-w-6xl">
            <Reveal>
              <Indice rang="01" sombre={false}>
                Le tiroir
              </Indice>
            </Reveal>
            <Reveal delay={80}>
              <h2
                className="o-m-0 o-mt-6 o-max-w-3xl o-uppercase o-text-zinc-950 dark:o-text-zinc-50"
                style={{
                  ...affiche('m', 700),
                  fontSize: 'clamp(1.85rem, 4.4vw, 3.75rem)',
                  lineHeight: 0.9,
                  letterSpacing: '-0.04em',
                }}
              >
                Un diametre, un pas, une matiere.
              </h2>
            </Reveal>
            <Reveal delay={140}>
              <p className="o-m-0 o-mt-6 o-max-w-xl o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                La vis se redessine a chaque cran : la tete fait la clef, la tige le
                diametre, et les filets sont espaces du pas. Le foret a percer avant
                taraudage vaut le diametre moins le pas — c est la seule regle a retenir.
              </p>
            </Reveal>
            <div className="o-mt-14">
              <Tiroir />
            </div>
          </div>
        </section>

        {/* ================= Les matieres, en cases (C13) ================= */}
        <section
          id="matieres"
          className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
          style={nuit('zinc')}
        >
          <div className="o-mx-auto o-max-w-6xl">
            <Reveal>
              <Indice rang="02">Les matieres</Indice>
            </Reveal>
            <Reveal delay={80}>
              <h2
                className="o-m-0 o-mt-6 o-max-w-3xl o-uppercase o-text-zinc-50"
                style={{
                  ...affiche('m', 700),
                  fontSize: 'clamp(1.85rem, 4.4vw, 3.75rem)',
                  lineHeight: 0.9,
                  letterSpacing: '-0.04em',
                }}
              >
                Chaque case tient son propre chiffre.
              </h2>
            </Reveal>

            <ul
              className="o-m-0 o-mt-14 o-grid o-list-none o-grid-cols-2 o-gap-px o-p-0 sm:o-grid-cols-3 lg:o-grid-cols-6"
              style={{ backgroundColor: 'var(--o-palette-zinc-800)' }}
            >
              {CASES.map((c) => (
                <li
                  key={c.rang}
                  className="o-relative o-bg-zinc-950 o-px-4 o-py-5 o-transition-colors hover:o-bg-zinc-900"
                >
                  <p className="o-m-0 o-font-mono o-text-xs o-tabular-nums o-text-zinc-500">
                    {c.rang}
                  </p>
                  <p
                    className="o-m-0 o-mt-2 o-text-zinc-50"
                    style={{
                      ...affiche('m', 500),
                      fontSize: 'clamp(1.25rem, 2.4vw, 1.9rem)',
                      lineHeight: 1,
                    }}
                  >
                    {c.symbole}
                  </p>
                  <p
                    className="o-m-0 o-mt-3 o-font-mono o-text-lg o-tabular-nums"
                    style={{ color: encreSurSombre() }}
                  >
                    {c.valeur}
                  </p>
                  <p className="o-m-0 o-mt-1 o-text-xs o-leading-relaxed o-text-zinc-400">
                    {c.unite}
                  </p>
                  <p className="o-m-0 o-mt-3 o-border-t o-border-white-10 o-pt-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
                    {c.nom}
                  </p>
                </li>
              ))}
            </ul>

            <p className="o-m-0 o-mt-8 o-max-w-2xl o-text-sm o-leading-relaxed o-text-zinc-400">
              Les valeurs sont celles des normes, pas des arguments de vente. Une 8.8
              casse a huit cents megapascals ; une A2 ne rouille pas mais tient moins ; un
              laiton ne tient presque rien et ne se voit pas.
            </p>
          </div>
        </section>

        {/* ================= Le comptoir : ce qui se fait a l etabli ====== */}
        <section
          id="comptoir"
          className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
        >
          <div className="o-mx-auto o-grid o-max-w-6xl o-gap-12 lg:o-grid-cols-12">
            <div className="lg:o-col-span-4">
              <div className="lg:o-sticky" style={{ top: CHROME + 32 }}>
                <Reveal>
                  <Indice rang="03" sombre={false}>
                    Le comptoir
                  </Indice>
                </Reveal>
                <Reveal delay={80}>
                  <h2
                    className="o-m-0 o-mt-6 o-uppercase o-text-zinc-950 dark:o-text-zinc-50"
                    style={{
                      ...affiche('m', 700),
                      fontSize: 'clamp(1.75rem, 3.4vw, 3rem)',
                      lineHeight: 0.92,
                      letterSpacing: '-0.04em',
                    }}
                  >
                    Ce qui se fait a l etabli.
                  </h2>
                </Reveal>
                {/* Un profil de cle, dessine : la page ne montre pas une photo de cle. */}
                <svg
                  viewBox="0 0 240 92"
                  className="o-mt-10 o-w-full"
                  role="img"
                  aria-label="Profil d une cle plate, dessine au trait"
                >
                  <path
                    d="M14 46 a20 20 0 1 1 40 0 a20 20 0 1 1 -40 0 M54 46 h150 l0 -16 l10 0 l0 16 l10 0 l0 30 l-170 0 z"
                    fill="none"
                    stroke={accentDoux(700, 56)}
                    strokeWidth="1.5"
                  />
                  <circle
                    cx="34"
                    cy="46"
                    r="7"
                    fill="none"
                    stroke={accentDoux(700, 40)}
                    strokeWidth="1.5"
                  />
                  <path
                    d="M92 76 l6 -12 l8 12 l7 -14 l8 14 l9 -10 l7 10 l9 -13 l8 13"
                    fill="none"
                    stroke={accent(500)}
                    strokeWidth="1.5"
                  />
                  <text
                    x="92"
                    y="34"
                    fontSize="9"
                    fill="var(--o-theme-muted)"
                    style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.14em' }}
                  >
                    PROFIL — 4 MINUTES
                  </text>
                </svg>
              </div>
            </div>

            <div className="o-min-w-0 lg:o-col-span-8">
              <table
                className="o-w-full o-text-left"
                style={{ borderCollapse: 'collapse' }}
              >
                <caption className="o-sr-only">
                  Les travaux du comptoir, leur tarif et leur delai
                </caption>
                <thead>
                  <tr className="o-border-b o-border-black-20 dark:o-border-zinc-700">
                    <th
                      scope="col"
                      className="o-py-3 o-pr-4 o-font-mono o-text-xs o-font-normal o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400"
                    >
                      Travail
                    </th>
                    <th
                      scope="col"
                      className="o-py-3 o-pr-4 o-text-right o-font-mono o-text-xs o-font-normal o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400"
                    >
                      Tarif
                    </th>
                    <th
                      scope="col"
                      className="o-py-3 o-text-right o-font-mono o-text-xs o-font-normal o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400"
                    >
                      Delai
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {COMPTOIR.map(([quoi, note, tarif, delai]) => (
                    <tr
                      key={quoi}
                      className="o-border-b o-border-black-10 dark:o-border-zinc-800"
                    >
                      <th scope="row" className="o-py-5 o-pr-4 o-font-normal">
                        <span className="o-block o-text-base o-text-zinc-950 dark:o-text-zinc-50">
                          {quoi}
                        </span>
                        <span className="o-mt-1 o-block o-text-xs o-leading-relaxed o-text-zinc-500 dark:o-text-zinc-400">
                          {note}
                        </span>
                      </th>
                      <td className="o-py-5 o-pr-4 o-text-right o-font-mono o-text-sm o-tabular-nums o-text-zinc-950 dark:o-text-zinc-50">
                        {tarif}
                      </td>
                      <td className="o-py-5 o-text-right o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                        {delai}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ================= L appel : le plan du magasin (A17) =========== */}
        <section
          id="rayon"
          className="o-scroll-mt-24 o-border-t o-border-black-10 dark:o-border-zinc-800 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
        >
          <div className="o-mx-auto o-max-w-6xl">
            <Reveal>
              <Indice rang="04" sombre={false}>
                Le plan
              </Indice>
            </Reveal>
            <Reveal delay={80}>
              <h2
                className="o-m-0 o-mt-6 o-max-w-3xl o-uppercase o-text-zinc-950 dark:o-text-zinc-50"
                style={{
                  ...affiche('m', 700),
                  fontSize: 'clamp(1.85rem, 4.4vw, 3.75rem)',
                  lineHeight: 0.9,
                  letterSpacing: '-0.04em',
                }}
              >
                Cliquez ou vous allez, on vous y attend.
              </h2>
            </Reveal>
            <div className="o-mt-14">
              {reduced ? (
                plan
              ) : (
                <TargetCursor
                  targets="button"
                  padding={6}
                  spin={0.08}
                  corner={10}
                  color={accent(500)}
                >
                  {plan}
                </TargetCursor>
              )}
            </div>
          </div>
        </section>

        {/* ================= Le pied : une page de catalogue (P23) ======== */}
        <footer className="o-px-6 o-py-16 md:o-px-10" style={nuit('zinc')}>
          <div className="o-mx-auto o-max-w-6xl">
            <div className="o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-4 o-border-b o-border-white-10 o-pb-5">
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                Catalogue 2026 — extrait du rayon A
              </p>
              <p
                className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                style={{ color: encreSurSombre() }}
              >
                Page 14 / 96
              </p>
            </div>

            <div className="o-mt-8 o-overflow-x-auto" style={{ overflowY: 'hidden' }}>
              <table
                className="o-w-full o-text-left"
                style={{ minWidth: 640, borderCollapse: 'collapse' }}
              >
                <caption className="o-sr-only">
                  Extrait du catalogue : references, codes et tailles du rayon A
                </caption>
                <thead>
                  <tr className="o-border-b o-border-white-20">
                    {['Reference', 'Tiroir', 'Diametre', 'Pas', 'Clef', 'Le cent'].map(
                      (entete) => (
                        <th
                          key={entete}
                          scope="col"
                          className="o-py-3 o-pr-5 o-font-mono o-text-xs o-font-normal o-uppercase o-tracking-widest o-text-zinc-500"
                        >
                          {entete}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {MEUBLE.map((ligne) => {
                    const premier = ligne.pas[0] ?? 1
                    return (
                      <tr key={ligne.d} className="o-border-b o-border-white-10">
                        <th
                          scope="row"
                          className="o-py-3 o-pr-5 o-font-mono o-text-xs o-font-normal o-uppercase o-tracking-widest"
                          style={{ color: encreSurSombre() }}
                        >
                          {`H-M${String(ligne.d).padStart(2, '0')}-${String(Math.round(premier * 100)).padStart(3, '0')}-ZN`}
                        </th>
                        <td className="o-py-3 o-pr-5 o-font-mono o-text-xs o-tabular-nums o-text-zinc-400">
                          {ligne.casier}
                        </td>
                        <td className="o-py-3 o-pr-5 o-font-mono o-text-xs o-tabular-nums o-text-zinc-50">
                          M{ligne.d}
                        </td>
                        <td className="o-py-3 o-pr-5 o-font-mono o-text-xs o-tabular-nums o-text-zinc-400">
                          {direPas(ligne, premier)}
                        </td>
                        <td className="o-py-3 o-pr-5 o-font-mono o-text-xs o-tabular-nums o-text-zinc-400">
                          {ligne.clef} mm
                        </td>
                        <td className="o-py-3 o-font-mono o-text-xs o-tabular-nums o-text-zinc-50">
                          {euros(ligne.prix * 90)}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="o-mt-12 o-grid o-gap-10 sm:o-grid-cols-2 lg:o-grid-cols-4">
              <div>
                <p
                  className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                  style={{ color: encreSurSombre() }}
                >
                  La maison
                </p>
                <p className="o-m-0 o-mt-4 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400">
                  Ecrou — quincaillerie
                  <br />
                  12 rue des Batignolles
                  <br />
                  75017 Paris
                </p>
              </div>
              <div>
                <p
                  className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                  style={{ color: encreSurSombre() }}
                >
                  Les codes
                </p>
                <p className="o-m-0 o-mt-4 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400">
                  H — tete hexagonale
                  <br />
                  C — tete cylindrique
                  <br />F — tete fraisee
                </p>
              </div>
              <div>
                <p
                  className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                  style={{ color: encreSurSombre() }}
                >
                  Les tailles
                </p>
                <p className="o-m-0 o-mt-4 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400">
                  Longueurs 6 a 200 mm
                  <br />
                  Pas gros et pas fin
                  <br />
                  Filetage total ou partiel
                </p>
              </div>
              <div>
                <p
                  className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                  style={{ color: encreSurSombre() }}
                >
                  Commander
                </p>
                <p className="o-m-0 o-mt-4">
                  <a
                    href="#tiroir"
                    className="o-inline-flex o-items-center o-gap-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-50 o-no-underline o-transition-opacity hover:o-opacity-80 focus:o-ring"
                  >
                    tiroir@ecrou.fr{' '}
                    <Icon icon={ArrowUpRight} size={14} aria-hidden="true" />
                  </a>
                </p>
                <p className="o-m-0 o-mt-3 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400">
                  01 42 00 00 00
                  <br />
                  Commande le mardi, retrait le jeudi
                </p>
              </div>
            </div>

            <p className="o-m-0 o-mt-12 o-border-t o-border-white-10 o-pt-5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
              Ecrou — SARL au capital de 12 000 EUR — RCS Paris — © 2026. Couples de
              serrage indicatifs, mesures a sec, sans frein filet.
            </p>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
