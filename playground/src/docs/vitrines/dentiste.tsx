/**
 * Emaille — cabinet dentaire.
 *
 * ## La reference : Baseline (GetLayers)
 *
 * Un blanc franc, une seule encre teintee, des filets a un pixel, aucun
 * effet. Baseline vend la **confiance** : elle n a rien a cacher, donc elle
 * ne cache rien. C est exactement le probleme d un cabinet dentaire, ou la
 * question que tout le monde se pose avant de prendre rendez-vous n est pas
 * « etes-vous competents » mais « combien cela va-t-il me couter ».
 *
 * ## Le mecanisme : la bouche
 *
 * Un schema dentaire complet — trente-deux dents, numerotation
 * internationale — **cliquable au doigt, a la souris et au clavier**. Neuf
 * dents portent un soin releve au bilan ; on les ajoute et on les retire du
 * devis, et le devis se recalcule : honoraire du cabinet, base de
 * remboursement de l assurance maladie, part de l assurance maladie a
 * soixante-dix pour cent de cette base, part de la mutuelle selon le niveau
 * choisi, et **ce qui reste vraiment a payer**.
 *
 * Le calcul n est pas une figure de style : c est celui de la feuille de
 * soins. Il explique au passage ce que personne n explique — pourquoi une
 * couronne a cinq cents euros est remboursee sur une base de cent vingt, et
 * pourquoi un implant, hors nomenclature, n est rembourse par l assurance
 * maladie de rien du tout.
 *
 * ## Presque tout est dessine
 *
 * La coupe de molaire de l ouverture, l arcade, le plan cote du cabinet, les
 * quatre pictogrammes du pied : aucune photographie. Une page de sante qui
 * pose une banque d images de sourires blancs ment sur ce qu elle est, et un
 * schema dessine explique ce qu aucune photographie n explique.
 *
 * @module
 */

import { useMotionState } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import { ArrowRight, ArrowUpRight } from '@odoro-cli/icons/filaire'
import { Reveal } from '@odoro-cli/libs/motion'
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
} from 'react'

import { BeamConnect } from '@/odoro/effect/BeamConnect.jsx'
import { Faq } from '@/odoro/section/Faq.jsx'
import { HighlightSweep } from '@/odoro/text/HighlightSweep.jsx'

import { nuit } from './communs.jsx'
import { accent, accentDoux, encre, encreSurSombre } from './palettes.js'
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
import { Chapitre } from './scene.jsx'

/* ============================ Les actes ================================ */

/**
 * Un acte, tel qu il figure sur un devis conventionne.
 *
 * `honoraire` est ce que le cabinet demande ; `base` est la base de
 * remboursement de l assurance maladie. Les deux coincident pour les soins
 * conservateurs — leur tarif est opposable — et divergent pour les protheses,
 * ou l honoraire est plafonne mais la base reste basse. C est toute la
 * difference entre un plombage et une couronne, et c est ce que le devis
 * doit rendre lisible.
 */
interface Acte {
  readonly code: string
  readonly libelle: string
  readonly honoraire: number
  readonly base: number
}

const ACTES = {
  composite1: {
    code: 'HBMD038',
    libelle: 'Composite, une face',
    honoraire: 26.97,
    base: 26.97,
  },
  composite2: {
    code: 'HBMD053',
    libelle: 'Composite, deux faces',
    honoraire: 45.38,
    base: 45.38,
  },
  composite3: {
    code: 'HBMD049',
    libelle: 'Composite, trois faces',
    honoraire: 64.89,
    base: 64.89,
  },
  radiculaire: {
    code: 'HBFD001',
    libelle: 'Traitement radiculaire',
    honoraire: 81.94,
    base: 81.94,
  },
  couronne: {
    code: 'HBLD038',
    libelle: 'Couronne ceramo-metallique',
    honoraire: 500,
    base: 120,
  },
  implant: {
    code: 'hors nomenclature',
    libelle: 'Implant et pilier',
    honoraire: 950,
    base: 0,
  },
  avulsion: {
    code: 'HBGD036',
    libelle: 'Avulsion de dent de sagesse',
    honoraire: 33.44,
    base: 33.44,
  },
} as const satisfies Readonly<Record<string, Acte>>

/** Le nom d un acte du bareme. */
type NomActe = keyof typeof ACTES

/** Le bilan d entree : il est dans tous les plans, et il n est pas negociable. */
const SOCLE: Acte = {
  code: 'HBQK002 + HBJD001',
  libelle: 'Bilan, radiographies et detartrage',
  honoraire: 73.38,
  base: 73.38,
}

/** Les niveaux de mutuelle, en part de la base de remboursement. */
const MUTUELLES = [
  {
    cle: 'aucune',
    mot: 'Aucune',
    part: 0,
    note: 'Vous reglez tout ce que l assurance maladie ne prend pas.',
  },
  {
    cle: '100',
    mot: '100 % BR',
    part: 1,
    note: 'Le contrat complete jusqu a la base de remboursement, pas au-dela.',
  },
  {
    cle: '200',
    mot: '200 % BR',
    part: 2,
    note: 'Le contrat couvre deux fois la base : une couronne commence a etre tenue.',
  },
  {
    cle: '300',
    mot: '300 % BR',
    part: 3,
    note: 'Trois fois la base. Au-dela, il n y a plus grand-chose a couvrir.',
  },
] as const

/** Le releve d un acte, une fois la mutuelle choisie. */
interface Releve {
  readonly honoraire: number
  readonly maladie: number
  readonly mutuelle: number
  readonly reste: number
}

/**
 * La feuille de soins d un acte.
 *
 * L assurance maladie rembourse soixante-dix pour cent de la **base**, jamais
 * de l honoraire. La mutuelle complete jusqu a `part` fois cette base, sans
 * jamais depasser ce qui reste du. Le reste a charge est la difference — et
 * c est le seul nombre qui interesse vraiment quelqu un.
 */
function calculer(acte: Acte, part: number): Releve {
  const centimes = (valeur: number): number => Math.round(valeur * 100) / 100
  const maladie = centimes(acte.base * 0.7)
  const plafond = centimes(acte.base * part) - maladie
  const mutuelle = Math.max(0, Math.min(centimes(acte.honoraire - maladie), plafond))
  return {
    honoraire: acte.honoraire,
    maladie,
    mutuelle,
    reste: centimes(acte.honoraire - maladie - mutuelle),
  }
}

/** Une somme en euros, a la francaise. */
function euros(valeur: number): string {
  return `${valeur.toFixed(2).replace('.', ',')} €`
}

/* ============================ L arcade ================================= */

/** Une dent du schema. */
interface Dent {
  /** Numerotation internationale : quadrant puis rang. */
  readonly code: string
  readonly nom: string
  readonly largeur: number
  readonly acte?: NomActe
  readonly absente?: boolean
}

/** Le nom d une dent par son rang dans le quadrant. */
const NOMS = [
  'incisive centrale',
  'incisive laterale',
  'canine',
  'premiere premolaire',
  'deuxieme premolaire',
  'premiere molaire',
  'deuxieme molaire',
  'dent de sagesse',
] as const

/** La largeur d une couronne par rang : une molaire n est pas une incisive. */
const LARGEURS = [12, 10, 12, 13, 13, 20, 19, 17] as const

/** Le bilan du 4 septembre, dent par dent. */
const SOINS: Readonly<Record<string, NomActe>> = {
  '18': 'avulsion',
  '16': 'couronne',
  '11': 'composite1',
  '24': 'composite1',
  '26': 'composite2',
  '36': 'radiculaire',
  '37': 'composite3',
  '46': 'implant',
  '48': 'avulsion',
}

/** Les dents qui manquent : elles se dessinent en pointille. */
const ABSENTES: ReadonlySet<string> = new Set(['46'])

/** Ce que la page propose d emblee, pour que le devis dise quelque chose. */
const DEPART: readonly string[] = ['16', '26', '36']

/** Une dent construite depuis son quadrant et son rang. */
function fabriquer(quadrant: number, rang: number, haut: boolean): Dent {
  const code = `${String(quadrant)}${String(rang)}`
  const base = LARGEURS[rang - 1] ?? 12
  // Les incisives du bas sont sensiblement plus etroites que celles du haut :
  // sans cette correction, l arcade inferieure parait fausse.
  const largeur = !haut && rang <= 2 ? base - 3 : base
  const acte = SOINS[code]
  return {
    code,
    nom: NOMS[rang - 1] ?? 'dent',
    largeur,
    ...(acte === undefined ? {} : { acte }),
    ...(ABSENTES.has(code) ? { absente: true } : {}),
  }
}

/** Une arcade, de la gauche de l ecran (cote droit du patient) vers la droite. */
function arcade(haut: boolean): readonly Dent[] {
  const gauche = haut ? 1 : 4
  const droite = haut ? 2 : 3
  return [
    ...[8, 7, 6, 5, 4, 3, 2, 1].map((rang) => fabriquer(gauche, rang, haut)),
    ...[1, 2, 3, 4, 5, 6, 7, 8].map((rang) => fabriquer(droite, rang, haut)),
  ]
}

const HAUT = arcade(true)
const BAS = arcade(false)

/** Une dent posee sur son arc. */
interface Place {
  readonly dent: Dent
  readonly x: number
  readonly y: number
  /** Rotation en degres : la couronne pointe vers l exterieur de l arcade. */
  readonly tourne: number
  readonly hauteur: number
  /** Ou poser le numero, hors de l arcade. */
  readonly nx: number
  readonly ny: number
}

/**
 * Les dents posees sur une demi-ellipse.
 *
 * L arcade n est pas un demi-cercle : elle est plus large que profonde, et
 * c est ce rapport qui la rend reconnaissable au premier coup d oeil.
 */
function poser(dents: readonly Dent[], haut: boolean): readonly Place[] {
  const cx = 330
  const cy = haut ? 246 : 286
  const rx = haut ? 256 : 232
  const ry = haut ? 176 : 158
  // La course s arrete avant l horizontale : sans cela les deux arcades se
  // rejoignent aux joues et le schema se lit comme un seul anneau.
  const course = 158
  const depart = (180 - course) / 2
  return dents.map((dent, rang) => {
    const t = (rang + 0.5) / dents.length
    const degres = haut ? 180 + depart + t * course : 180 - depart - t * course
    const radians = (degres * Math.PI) / 180
    const cos = Math.cos(radians)
    const sin = Math.sin(radians)
    return {
      dent,
      x: cx + rx * cos,
      y: cy + ry * sin,
      // Une rotation de `90 - degres` envoie l axe vertical de la couronne sur
      // le rayon : la dent regarde dehors, comme dans une bouche.
      tourne: 90 - degres,
      hauteur: haut ? 30 : 27,
      nx: cx + (rx + 28) * cos,
      ny: cy + (ry + 22) * sin,
    }
  })
}

/* ============================ La feuille =============================== */

const STYLE_DENTISTE = 'o-vitrine-dentiste'

/**
 * Ce que les utilitaires n ont pas.
 *
 * Le repere de focus est dessine **dans** le SVG plutot que confie a
 * `outline` : la prise en charge du contour sur un groupe SVG est encore
 * inegale, et un repere de focus qui manque une fois sur trois ne vaut rien.
 */
const CSS_DENTISTE = [
  '@keyframes o-dt-trace{from{stroke-dashoffset:var(--o-dt-l,1200)}to{stroke-dashoffset:0}}',
  '@keyframes o-dt-pouls{0%,100%{opacity:0.55}50%{opacity:1}}',
  '[data-o-dt-trace]{animation:o-dt-trace 2.4s cubic-bezier(0.33,1,0.68,1) 0.3s both}',
  '[data-o-dt-pouls]{animation:o-dt-pouls 3.2s ease-in-out infinite}',
  '[data-o-dt-dent]{cursor:pointer;outline:none}',
  '[data-o-dt-dent] [data-o-dt-focus]{opacity:0}',
  '[data-o-dt-dent]:focus-visible [data-o-dt-focus]{opacity:1}',
  '@media (prefers-reduced-motion:reduce){',
  '[data-o-dt-trace]{animation:none;stroke-dashoffset:0}',
  '[data-o-dt-pouls]{animation:none;opacity:1}}',
].join('')

function useFeuilleDentiste(): void {
  useEffect(() => {
    if (document.getElementById(STYLE_DENTISTE) !== null) return
    const feuille = document.createElement('style')
    feuille.id = STYLE_DENTISTE
    feuille.textContent = CSS_DENTISTE
    document.head.append(feuille)
  }, [])
}

/* ============================ La coupe de molaire ====================== */

/** L objet de l ouverture : une molaire en coupe, qui se dessine au trait. */
function Coupe(): ReactElement {
  const encreTrait = accentDoux(800, 55)
  const etiquettes = [
    { mot: 'Email', x: 246, y: 112, de: [222, 118], a: [196, 128] },
    { mot: 'Dentine', x: 246, y: 168, de: [222, 174], a: [180, 180] },
    { mot: 'Pulpe', x: 246, y: 222, de: [222, 228], a: [150, 200] },
    { mot: 'Racine', x: 246, y: 316, de: [222, 322], a: [186, 330] },
  ] as const

  return (
    <svg
      viewBox="0 0 320 430"
      className="o-h-auto o-w-full"
      role="img"
      aria-label="Coupe d une molaire : email, dentine, pulpe et deux racines, posee dans son os"
    >
      {/* L os alveolaire, en trame : la dent n est pas posee sur rien. */}
      <defs>
        <pattern id="o-dt-os" width="9" height="9" patternUnits="userSpaceOnUse">
          <circle cx="4.5" cy="4.5" r="1.1" fill={accentDoux(500, 26)} />
        </pattern>
      </defs>
      <rect x="14" y="222" width="200" height="196" fill="url(#o-dt-os)" />

      {/* La gencive : une bande qui passe au collet. */}
      <path
        d="M10 228 C60 214 164 214 218 228 L218 250 C164 238 60 238 10 250 Z"
        fill={accentDoux(300, 34)}
      />

      {/* Les deux racines. */}
      <path
        d="M74 224 C64 272 80 324 92 378 C96 394 110 394 113 378 C120 328 120 272 122 224 Z"
        fill={accentDoux(200, 52)}
        stroke={encreTrait}
        strokeWidth="2"
      />
      <path
        d="M152 224 C154 272 154 328 161 378 C164 394 178 394 182 378 C194 324 210 272 200 224 Z"
        fill={accentDoux(200, 52)}
        stroke={encreTrait}
        strokeWidth="2"
      />

      {/* La couronne : email dehors, dentine dedans. */}
      <path
        d="M24 152 C22 110 46 76 72 74 C90 73 98 90 114 90 C130 90 140 73 158 74 C184 76 208 110 206 152 C205 186 196 206 190 226 L40 226 C34 206 25 186 24 152 Z"
        fill={accentDoux(100, 62)}
        stroke={encreTrait}
        strokeWidth="2.5"
      />
      <path
        d="M52 156 C50 124 66 100 84 100 C96 100 102 114 114 114 C126 114 132 100 146 100 C164 100 180 124 178 156 C177 186 170 206 166 226 L64 226 C60 206 53 186 52 156 Z"
        fill={accentDoux(300, 46)}
      />

      {/* La pulpe : la seule chose vivante du dessin, donc la seule qui bat. */}
      <g data-o-dt-pouls="">
        <path
          d="M92 134 C92 122 104 128 114 128 C124 128 138 122 138 134 L132 178 C132 190 98 190 98 178 Z"
          fill={encre()}
          opacity="0.9"
        />
        <path
          d="M104 180 C96 230 98 300 101 356"
          fill="none"
          stroke={encre()}
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.9"
        />
        <path
          d="M128 180 C136 230 140 300 168 356"
          fill="none"
          stroke={encre()}
          strokeWidth="3.5"
          strokeLinecap="round"
          opacity="0.9"
        />
      </g>

      {/* Le trait qui se dessine par-dessus : le contour de la couronne. */}
      <path
        data-o-dt-trace=""
        d="M24 152 C22 110 46 76 72 74 C90 73 98 90 114 90 C130 90 140 73 158 74 C184 76 208 110 206 152 C205 186 196 206 190 226"
        fill="none"
        stroke={encre()}
        strokeWidth="3"
        strokeLinecap="round"
        pathLength={1000}
        style={{ strokeDasharray: 1000, '--o-dt-l': 1000 } as CSSProperties}
      />

      {/* Les legendes, avec leur ligne de rappel. */}
      {etiquettes.map((e) => (
        <g key={e.mot}>
          <path
            d={`M${String(e.de[0])} ${String(e.de[1])} L${String(e.a[0])} ${String(e.a[1])}`}
            stroke={accentDoux(700, 45)}
            strokeWidth="1"
          />
          <circle cx={e.a[0]} cy={e.a[1]} r="2.5" fill={accentDoux(700, 60)} />
          <text
            x={e.x}
            y={e.y}
            fontSize="12"
            fill="var(--o-theme-muted)"
            style={{
              fontFamily: 'var(--o-font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
            }}
          >
            {e.mot}
          </text>
        </g>
      ))}
    </svg>
  )
}

/* ============================ Le schema dentaire ======================= */

/** Une dent du schema, cliquable a la souris comme au clavier. */
function DentDessinee({
  place,
  choisie,
  surChoix,
}: {
  readonly place: Place
  readonly choisie: boolean
  readonly surChoix: (code: string) => void
}): ReactElement {
  const { dent, x, y, tourne, hauteur } = place
  const soignable = dent.acte !== undefined
  const acte = dent.acte === undefined ? undefined : ACTES[dent.acte]

  const nom = [
    `Dent ${dent.code}`,
    dent.nom,
    dent.absente === true ? 'absente' : undefined,
    acte === undefined ? 'rien a prevoir' : `${acte.libelle}, ${euros(acte.honoraire)}`,
  ]
    .filter((morceau) => morceau !== undefined)
    .join(', ')

  const surTouche = (evenement: KeyboardEvent<SVGGElement>): void => {
    if (evenement.key !== 'Enter' && evenement.key !== ' ') return
    evenement.preventDefault()
    surChoix(dent.code)
  }

  const remplissage = choisie
    ? encre()
    : soignable
      ? accentDoux(300, 42)
      : 'var(--o-theme-bg)'
  const contour = choisie
    ? encre()
    : soignable
      ? accentDoux(700, 55)
      : accentDoux(700, 26)

  return (
    <g
      data-o-dt-dent=""
      role="button"
      tabIndex={0}
      aria-label={nom}
      {...(soignable ? { 'aria-pressed': choisie } : { 'aria-disabled': true })}
      onClick={() => {
        surChoix(dent.code)
      }}
      onKeyDown={surTouche}
      transform={`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${tourne.toFixed(1)})`}
    >
      {/* La zone de prise : plus large que la dent, pour le doigt. */}
      <rect
        x={-dent.largeur / 2 - 5}
        y={-hauteur / 2 - 5}
        width={dent.largeur + 10}
        height={hauteur + 10}
        fill="transparent"
      />
      <rect
        data-o-dt-focus=""
        x={-dent.largeur / 2 - 6}
        y={-hauteur / 2 - 6}
        width={dent.largeur + 12}
        height={hauteur + 12}
        rx="5"
        fill="none"
        stroke={encre()}
        strokeWidth="2.5"
      />
      <rect
        x={-dent.largeur / 2}
        y={-hauteur / 2}
        width={dent.largeur}
        height={hauteur}
        rx={dent.largeur / 3}
        fill={dent.absente === true ? 'none' : remplissage}
        stroke={contour}
        strokeWidth={choisie ? 2 : 1.4}
        strokeDasharray={dent.absente === true ? '4 4' : undefined}
      />
      {/* Les sillons : ce qui distingue une molaire d une incisive de loin. */}
      {dent.largeur >= 17 && dent.absente !== true && (
        <path
          d={`M${String(-dent.largeur / 2 + 3)} ${String(-hauteur / 6)} h${String(dent.largeur - 6)} M0 ${String(-hauteur / 2 + 3)} v${String(hauteur / 3)}`}
          stroke={choisie ? 'var(--o-theme-bg)' : accentDoux(700, 40)}
          strokeWidth="0.8"
          fill="none"
        />
      )}
    </g>
  )
}

/**
 * Le schema complet : deux arcades, trente-deux dents.
 *
 * Chaque dent est un bouton a part entiere — nom accessible, etat annonce,
 * activation a la souris, au doigt, a Entree et a la barre d espace. Le
 * numero est pose **hors** de l arcade : dedans, il aurait fallu deux jeux de
 * couleurs de texte selon que la dent est prise ou non, et l un des deux
 * serait tombe sous le seuil de contraste.
 */
function Schema({
  choisies,
  surChoix,
}: {
  readonly choisies: ReadonlySet<string>
  readonly surChoix: (code: string) => void
}): ReactElement {
  const hautes = useMemo(() => poser(HAUT, true), [])
  const basses = useMemo(() => poser(BAS, false), [])

  return (
    <svg
      viewBox="0 0 660 516"
      className="o-h-auto o-w-full"
      role="group"
      aria-label="Schema dentaire : trente-deux dents a choisir"
    >
      <text
        x="330"
        y="22"
        textAnchor="middle"
        fontSize="12"
        fill="var(--o-theme-muted)"
        style={{
          fontFamily: 'var(--o-font-mono)',
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
        }}
      >
        Maxillaire
      </text>
      <text
        x="330"
        y="504"
        textAnchor="middle"
        fontSize="12"
        fill="var(--o-theme-muted)"
        style={{
          fontFamily: 'var(--o-font-mono)',
          textTransform: 'uppercase',
          letterSpacing: '0.18em',
        }}
      >
        Mandibule
      </text>
      {/* Le plan sagittal : la moitie droite du patient est a gauche. */}
      <path
        d="M330 38 V486"
        stroke={accentDoux(700, 16)}
        strokeWidth="1"
        strokeDasharray="4 8"
      />

      {[...hautes, ...basses].map((place) => (
        <text
          key={`n-${place.dent.code}`}
          x={place.nx}
          y={place.ny + 4}
          textAnchor="middle"
          fontSize="11"
          fill={choisies.has(place.dent.code) ? encre() : 'var(--o-theme-muted)'}
          style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.06em' }}
        >
          {place.dent.code}
        </text>
      ))}

      {[...hautes, ...basses].map((place) => (
        <DentDessinee
          key={place.dent.code}
          place={place}
          choisie={choisies.has(place.dent.code)}
          surChoix={surChoix}
        />
      ))}
    </svg>
  )
}

/* ============================ Le plan cote ============================= */

/** C20 : les chiffres du cabinet, poses sur un plan cote. */
function PlanCote(): ReactElement {
  const trait = accentDoux(700, 50)

  /** Une cote horizontale : la ligne, ses deux tirets, et sa valeur. */
  const large = (x1: number, x2: number, y: number, texte: string): ReactElement => (
    <g>
      <path
        d={`M${String(x1)} ${String(y)} H${String(x2)} M${String(x1)} ${String(y - 6)} v12 M${String(x2)} ${String(y - 6)} v12`}
        stroke={trait}
        strokeWidth="1"
      />
      <text
        x={(x1 + x2) / 2}
        y={y - 12}
        textAnchor="middle"
        fontSize="13"
        fill={encre()}
        style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.08em' }}
      >
        {texte}
      </text>
    </g>
  )

  /** Une cote verticale : la valeur tourne avec la ligne, comme sur un plan. */
  const haute = (y1: number, y2: number, x: number, texte: string): ReactElement => (
    <g>
      <path
        d={`M${String(x)} ${String(y1)} V${String(y2)} M${String(x - 6)} ${String(y1)} h12 M${String(x - 6)} ${String(y2)} h12`}
        stroke={trait}
        strokeWidth="1"
      />
      <text
        x={x + 16}
        y={(y1 + y2) / 2}
        textAnchor="middle"
        fontSize="13"
        fill={encre()}
        transform={`rotate(-90 ${String(x + 16)} ${String((y1 + y2) / 2)})`}
        style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.08em' }}
      >
        {texte}
      </text>
    </g>
  )

  return (
    <svg
      viewBox="0 0 860 400"
      className="o-h-auto o-w-full"
      role="img"
      aria-label="Plan cote du cabinet : accueil de 22 metres carres, trois salles de soin de 16, 14 et 14 metres carres, une sterilisation de 9 metres carres, entree de plain-pied"
    >
      {/* Les murs porteurs, puis les cloisons. */}
      <rect
        x="40"
        y="64"
        width="760"
        height="276"
        fill="none"
        stroke={accentDoux(800, 62)}
        strokeWidth="3"
      />
      <path
        d="M330 64 V340 M560 64 V340 M330 202 H800"
        stroke={accentDoux(800, 62)}
        strokeWidth="3"
        fill="none"
      />

      {/* Les portes : un arc de debattement, comme sur un vrai plan. */}
      {(
        [
          [330, 104, 1],
          [330, 262, 1],
          [560, 116, 1],
          [560, 274, 1],
        ] as const
      ).map(([x, y, sens]) => (
        <g key={`${String(x)}-${String(y)}`}>
          <path
            d={`M${String(x)} ${String(y)} v34`}
            stroke="var(--o-theme-bg)"
            strokeWidth="4"
          />
          <path
            d={`M${String(x)} ${String(y)} a34 34 0 0 ${sens === 1 ? '1' : '0'} 34 34`}
            fill="none"
            stroke={trait}
            strokeWidth="1.5"
          />
        </g>
      ))}

      {[
        { mot: 'Accueil', aire: '22 m2', x: 185, y: 192 },
        { mot: 'Salle 1', aire: '16 m2', x: 445, y: 128 },
        { mot: 'Salle 2', aire: '14 m2', x: 445, y: 272 },
        { mot: 'Salle 3', aire: '14 m2', x: 680, y: 128 },
        { mot: 'Sterilisation', aire: '9 m2', x: 680, y: 272 },
      ].map((piece) => (
        <g key={piece.mot}>
          <text
            x={piece.x}
            y={piece.y}
            textAnchor="middle"
            fontSize="13"
            fill="var(--o-theme-fg)"
            style={{
              fontFamily: 'var(--o-font-mono)',
              textTransform: 'uppercase',
              letterSpacing: '0.12em',
            }}
          >
            {piece.mot}
          </text>
          <text
            x={piece.x}
            y={piece.y + 28}
            textAnchor="middle"
            fontSize="24"
            fill={encre()}
            style={{ fontFamily: 'var(--o-vitrine-affichage)', letterSpacing: '-0.02em' }}
          >
            {piece.aire}
          </text>
        </g>
      ))}

      {/* L entree, de plain-pied : c est le chiffre qui compte pour beaucoup. */}
      <path d="M40 172 v60" stroke={accent(500)} strokeWidth="7" />
      <text
        x="40"
        y="372"
        fontSize="13"
        fill={encre()}
        style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.08em' }}
      >
        ENTREE — 0 MARCHE, PORTE DE 1,05 M
      </text>

      {large(40, 800, 38, '18,40 m')}
      {haute(64, 340, 826, '7,20 m')}
    </svg>
  )
}

/* ============================ Le devis ================================= */

/** Le panneau sombre : ce que la bouche coute, ligne par ligne. */
function Devis({
  lignes,
  part,
  mutuelle,
}: {
  readonly lignes: readonly (readonly [string, Acte])[]
  readonly part: number
  readonly mutuelle: string
}): ReactElement {
  const releves = lignes.map(
    ([code, acte]) => [code, acte, calculer(acte, part)] as const,
  )
  const total = releves.reduce(
    (somme, [, , releve]) => ({
      honoraire: somme.honoraire + releve.honoraire,
      maladie: somme.maladie + releve.maladie,
      mutuelle: somme.mutuelle + releve.mutuelle,
      reste: somme.reste + releve.reste,
    }),
    { honoraire: 0, maladie: 0, mutuelle: 0, reste: 0 },
  )

  return (
    <div className="o-rounded-2xl o-p-7 md:o-p-9" style={nuit('slate')}>
      <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-400">
        Devis — cabinet Emaille, tarifs 2026
      </p>

      <table
        className="o-mt-7 o-w-full o-text-left"
        style={{ borderCollapse: 'collapse' }}
      >
        <caption className="o-sr-only">
          Les actes retenus, avec leur remboursement et le reste a charge
        </caption>
        <thead>
          <tr className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-400">
            <th scope="col" className="o-border-b o-border-white-10 o-pb-2 o-font-normal">
              Acte
            </th>
            <th
              scope="col"
              className="o-border-b o-border-white-10 o-pb-2 o-pl-5 o-text-right o-font-normal"
            >
              Honoraire
            </th>
            <th
              scope="col"
              className="max-sm:o-hidden o-border-b o-border-white-10 o-pb-2 o-pl-5 o-text-right o-font-normal"
            >
              Maladie
            </th>
            <th
              scope="col"
              className="max-sm:o-hidden o-border-b o-border-white-10 o-pb-2 o-pl-5 o-text-right o-font-normal"
            >
              Mutuelle
            </th>
            <th
              scope="col"
              className="o-border-b o-border-white-10 o-pb-2 o-pl-5 o-text-right o-font-normal"
            >
              Reste
            </th>
          </tr>
        </thead>
        <tbody>
          {releves.map(([code, acte, releve]) => (
            <tr key={`${code}-${acte.code}`} className="o-align-top">
              <th
                scope="row"
                className="o-border-b o-border-white-10 o-py-3 o-pr-3 o-font-normal"
              >
                <span className="o-block o-text-sm o-text-slate-50">{acte.libelle}</span>
                <span className="o-block o-font-mono o-text-xs o-text-slate-400">
                  {code === 'socle' ? acte.code : `Dent ${code} — ${acte.code}`}
                </span>
              </th>
              <td className="o-whitespace-nowrap o-border-b o-border-white-10 o-py-3 o-pl-5 o-text-right o-font-mono o-text-sm o-tabular-nums o-text-slate-200">
                {euros(releve.honoraire)}
              </td>
              <td className="max-sm:o-hidden o-whitespace-nowrap o-border-b o-border-white-10 o-py-3 o-pl-5 o-text-right o-font-mono o-text-sm o-tabular-nums o-text-slate-400">
                {euros(releve.maladie)}
              </td>
              <td className="max-sm:o-hidden o-whitespace-nowrap o-border-b o-border-white-10 o-py-3 o-pl-5 o-text-right o-font-mono o-text-sm o-tabular-nums o-text-slate-400">
                {euros(releve.mutuelle)}
              </td>
              <td
                className="o-whitespace-nowrap o-border-b o-border-white-10 o-py-3 o-pl-5 o-text-right o-font-mono o-text-sm o-tabular-nums"
                style={{ color: encreSurSombre() }}
              >
                {euros(releve.reste)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="o-mt-8 o-flex o-flex-wrap o-items-end o-justify-between o-gap-4">
        <div>
          <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-400">
            Reste a votre charge
          </p>
          <p
            className="o-m-0 o-mt-2 o-tabular-nums o-text-slate-50"
            aria-live="polite"
            style={{
              ...affiche('m', 300),
              fontSize: 'clamp(2.5rem, 6vw, 4.25rem)',
              lineHeight: 0.9,
            }}
          >
            {euros(total.reste)}
          </p>
        </div>
        <p className="o-m-0 o-max-w-xs o-text-xs o-leading-relaxed o-text-slate-400">
          Sur {euros(total.honoraire)} d honoraires. L assurance maladie en prend{' '}
          {euros(total.maladie)}, la mutuelle{' '}
          {mutuelle.toLowerCase() === 'aucune' ? 'rien' : euros(total.mutuelle)}.
        </p>
      </div>
    </div>
  )
}

/**
 * La bouche au-dessus, le devis en dessous, et le faisceau entre les deux.
 *
 * Sous mouvement reduit, le faisceau disparait et les deux blocs restent l un
 * sous l autre : la liaison etait une illustration du calcul, jamais le calcul.
 */
function Corps({
  reduit,
  schema,
  devis,
}: {
  readonly reduit: boolean
  readonly schema: ReactElement
  readonly devis: ReactElement
}): ReactElement {
  if (reduit) {
    return (
      <div className="o-mt-12 o-flex o-flex-col o-gap-16">
        {schema}
        {devis}
      </div>
    )
  }
  return (
    <BeamConnect
      className="o-mt-12 o-flex o-flex-col o-gap-16"
      curvature={70}
      thickness={1.5}
      color={accentDoux(600, 70)}
      speed={3600}
    >
      <div data-beam="from">{schema}</div>
      <div data-beam="to">{devis}</div>
    </BeamConnect>
  )
}

/* ============================ La frise du jour ========================= */

/** Un creneau de la journee. */
interface Creneau {
  readonly heure: string
  readonly pris: boolean
  readonly quoi?: string
}

/** Mardi 16 septembre, tel que l agenda le montre. */
const JOURNEE: readonly Creneau[] = [
  { heure: '08:00', pris: true, quoi: 'Urgence' },
  { heure: '08:30', pris: true, quoi: 'Controle' },
  { heure: '09:00', pris: false },
  { heure: '09:30', pris: true, quoi: 'Couronne, pose' },
  { heure: '10:00', pris: true, quoi: 'Couronne, pose' },
  { heure: '10:30', pris: false },
  { heure: '11:00', pris: true, quoi: 'Detartrage' },
  { heure: '11:30', pris: true, quoi: 'Composite' },
  { heure: '12:00', pris: true, quoi: 'Dejeuner' },
  { heure: '12:30', pris: true, quoi: 'Dejeuner' },
  { heure: '13:00', pris: true, quoi: 'Dejeuner' },
  { heure: '13:30', pris: false },
  { heure: '14:00', pris: true, quoi: 'Traitement radiculaire' },
  { heure: '14:30', pris: false },
  { heure: '15:00', pris: false },
  { heure: '15:30', pris: true, quoi: 'Enfant, scellements' },
  { heure: '16:00', pris: true, quoi: 'Empreinte' },
  { heure: '16:30', pris: false },
  { heure: '17:00', pris: true, quoi: 'Avulsion' },
  { heure: '17:30', pris: true, quoi: 'Avulsion' },
  { heure: '18:00', pris: false },
  { heure: '18:30', pris: true, quoi: 'Urgence reservee' },
]

/** A23 : la journee de mardi, et le creneau qu on y prend. */
function Frise(): ReactElement {
  const [pris, setPris] = useState<string | null>('14:30')
  const libres = JOURNEE.filter((creneau) => !creneau.pris).length

  return (
    <div>
      <div className="o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-4">
        <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
          Mardi 16 septembre — {libres} creneaux libres
        </p>
        <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
          08:00 → 19:00
        </p>
      </div>

      {/*
        La bande defile de cote. `overflow-y` est declare explicitement :
        laisse a `auto` par la cascade, la bande avalerait la molette et la
        page se figerait sous le pointeur.
      */}
      <div className="o-mt-5 o-overflow-x-auto o-pb-3" style={{ overflowY: 'hidden' }}>
        <ul className="o-m-0 o-flex o-w-max o-list-none o-items-end o-gap-1 o-p-0">
          {JOURNEE.map((creneau) => {
            const choisi = pris === creneau.heure
            return (
              <li key={creneau.heure} className="o-shrink-0">
                {creneau.pris ? (
                  <span
                    className="o-flex o-h-28 o-w-20 o-flex-col o-justify-end o-rounded-md o-p-2"
                    style={{ backgroundColor: accentDoux(300, 22) }}
                  >
                    <span className="o-block o-text-xs o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                      {creneau.quoi}
                    </span>
                    <span className="o-mt-1 o-block o-font-mono o-text-xs o-tabular-nums o-text-zinc-500 dark:o-text-zinc-400">
                      {creneau.heure}
                    </span>
                  </span>
                ) : (
                  <button
                    type="button"
                    aria-pressed={choisi}
                    onClick={() => {
                      setPris(choisi ? null : creneau.heure)
                    }}
                    className="o-flex o-h-28 o-w-20 o-cursor-pointer o-flex-col o-justify-end o-rounded-md o-border-w-1 o-p-2 o-text-left o-transition-colors focus:o-ring"
                    style={
                      choisi
                        ? {
                            backgroundColor: encre(),
                            borderColor: encre(),
                            color: 'var(--o-theme-bg)',
                          }
                        : {
                            backgroundColor: 'transparent',
                            borderColor: accentDoux(700, 45),
                            color: 'inherit',
                          }
                    }
                  >
                    <span className="o-block o-text-xs o-font-semibold o-leading-relaxed">
                      {choisi ? 'Retenu' : 'Libre'}
                    </span>
                    <span className="o-mt-1 o-block o-font-mono o-text-xs o-tabular-nums">
                      {creneau.heure}
                    </span>
                  </button>
                )}
              </li>
            )
          })}
        </ul>
      </div>

      <p
        className="o-m-0 o-mt-6 o-max-w-2xl o-text-lg o-leading-relaxed o-text-zinc-700 dark:o-text-zinc-300"
        aria-live="polite"
      >
        {pris === null
          ? 'Aucun creneau retenu. Choisissez une case libre sur la frise.'
          : `Mardi 16 septembre a ${pris} — trente minutes, salle 2, avec le docteur Wasser. La confirmation part par SMS, le rappel la veille a 18 h.`}
      </p>
    </div>
  )
}

/* ============================ Le pied ================================== */

/** Un pictogramme dessine du pied : P27. */
function Picto({
  dessin,
  titre,
  texte,
}: {
  readonly dessin: ReactElement
  readonly titre: string
  readonly texte: string
}): ReactElement {
  return (
    <div>
      <svg viewBox="0 0 64 64" className="o-h-14 o-w-14" role="img" aria-label={titre}>
        {dessin}
      </svg>
      <p
        className="o-m-0 o-mt-5 o-font-mono o-text-xs o-uppercase o-tracking-widest"
        style={{ color: encreSurSombre() }}
      >
        {titre}
      </p>
      <p className="o-m-0 o-mt-2 o-max-w-xs o-text-sm o-leading-relaxed o-text-slate-300">
        {texte}
      </p>
    </div>
  )
}

/* ============================ La page ================================== */

const NAVIGATION = [
  ['#bouche', 'Le devis'],
  ['#cabinet', 'Le cabinet'],
  ['#deroule', 'Le deroule'],
  ['#creneaux', 'Les creneaux'],
] as const

const QUESTIONS = [
  {
    question: 'Pourquoi une couronne a 500 € n est-elle remboursee que sur 120 ?',
    answer: (
      <p className="o-m-0">
        Parce que ce sont deux nombres qui ne mesurent pas la meme chose. 500 € est l
        honoraire, plafonne par la convention pour cette couronne. 120 € est la base de
        remboursement, fixee par l assurance maladie et inchangee depuis longtemps. Elle
        rembourse 70 % de la base, soit 84 €. Le reste depend de votre contrat, et c est
        ce que le schema du haut de page vous montre.
      </p>
    ),
  },
  {
    question: 'Faites-vous des devis avant de commencer ?',
    answer: (
      <p className="o-m-0">
        Toujours, et pour tout ce qui depasse le soin conservateur. Le devis est remis en
        main propre, il est valable six mois, et rien n est commence avant que vous l ayez
        signe. Si un acte se revele inutile en cours de traitement, il est retire du
        devis, pas facture.
      </p>
    ),
  },
  {
    question: 'Et si j ai mal ce matin ?',
    answer: (
      <p className="o-m-0">
        Deux creneaux sont gardes chaque jour, a 08:00 et a 18:30, et ils ne sont jamais
        ouverts a la reservation en ligne. Appelez avant 09:00 : vous serez vu dans la
        journee, ou oriente vers le service d urgence du centre hospitalier si cela releve
        de lui.
      </p>
    ),
  },
  {
    question: 'Prenez-vous la carte Vitale et le tiers payant ?',
    answer: (
      <p className="o-m-0">
        Oui pour la carte Vitale, et oui pour le tiers payant sur la part de l assurance
        maladie. Sur la part mutuelle, cela depend de votre organisme : nous le verifions
        a l accueil au premier rendez-vous, et nous vous le disons avant les soins, pas
        apres.
      </p>
    ),
  },
]

export default function Page(): ReactElement {
  const polices = usePolices('manrope')
  useFeuilleDentiste()
  const { reduced } = useMotionState()
  const [choisies, setChoisies] = useState<ReadonlySet<string>>(() => new Set(DEPART))
  const [dite, setDite] = useState(
    'Dent 16, premiere molaire : couronne ceramo-metallique, retenue au devis.',
  )
  const [niveau, setNiveau] = useState<string>('200')

  const basculer = useCallback((code: string) => {
    const dent = [...HAUT, ...BAS].find((d) => d.code === code)
    if (dent === undefined) return
    if (dent.acte === undefined) {
      setDite(`Dent ${dent.code}, ${dent.nom} : saine. Rien a prevoir.`)
      return
    }
    const acte = ACTES[dent.acte]
    setChoisies((precedentes) => {
      const suivantes = new Set(precedentes)
      if (suivantes.has(code)) {
        suivantes.delete(code)
        setDite(`Dent ${dent.code}, ${dent.nom} : ${acte.libelle} retiree du devis.`)
      } else {
        suivantes.add(code)
        setDite(
          `Dent ${dent.code}, ${dent.nom} : ${acte.libelle}, ${euros(acte.honoraire)}, ajoutee au devis.`,
        )
      }
      return suivantes
    })
  }, [])

  const mutuelle = MUTUELLES.find((m) => m.cle === niveau) ?? MUTUELLES[0]

  const lignes = useMemo(() => {
    const retenues: (readonly [string, Acte])[] = [['socle', SOCLE]]
    for (const dent of [...HAUT, ...BAS]) {
      if (dent.acte === undefined || !choisies.has(dent.code)) continue
      retenues.push([dent.code, ACTES[dent.acte]])
    }
    return retenues
  }, [choisies])

  return (
    <Porte forme="iris" marque="Emaille" sombre={false}>
      <div
        className="o-bg-white dark:o-bg-zinc-950 o-text-zinc-900 dark:o-text-zinc-100"
        style={polices}
      >
        <BarreFilet
          marque="Emaille"
          liens={NAVIGATION}
          action={['#creneaux', 'Prendre rendez-vous']}
          sombre={false}
        />

        {/* ================= L ouverture : la coupe et le nom ============= */}
        <header
          className="o-relative o-isolate o-overflow-hidden o-px-6 o-pb-16 o-pt-14 md:o-px-10"
          style={{ minHeight: `calc(100vh - ${String(CHROME)}px)` }}
        >
          <Coin position="hd" sombre={false}>
            14 rue du Palais
            <br />
            Clermont-Ferrand
          </Coin>

          <div className="o-mx-auto o-grid o-max-w-7xl o-items-center o-gap-12 md:o-grid-cols-12">
            <div className="md:o-col-span-7">
              <Surgit>
                <Etiquette sombre={false}>
                  Cabinet dentaire — conventionne secteur 1
                </Etiquette>
              </Surgit>
              <TitreVague
                delai={140}
                className="o-m-0 o-mt-7 o-text-zinc-950 dark:o-text-zinc-50"
                style={{
                  ...affiche('xl', 300),
                  fontSize: 'clamp(3.25rem, 13vw, 11rem)',
                  lineHeight: 0.86,
                }}
              >
                Emaille
              </TitreVague>
              <Surgit
                delai={520}
                as="p"
                className="o-m-0 o-mt-8 o-max-w-lg o-text-lg o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400"
              >
                Trois praticiens, trois fauteuils, et le prix affiche avant le soin.
                Cliquez une dent : le devis se fait devant vous.
              </Surgit>
              <Surgit delai={640} className="o-mt-9">
                <Actions
                  pleine={[
                    '#bouche',
                    <>
                      Ouvrir le schema{' '}
                      <Icon icon={ArrowRight} size={15} aria-hidden="true" />
                    </>,
                  ]}
                  fantome={['#creneaux', 'Voir les creneaux']}
                  sombre={false}
                />
              </Surgit>

              {/*
                La carte flottante de Salonix, rendue utile : ce n est pas un
                argument, c est le soin le plus demande de la semaine et son
                reste a charge reel.
              */}
              <Surgit
                delai={760}
                className="o-mt-12 o-inline-block o-max-w-sm o-rounded-2xl o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-p-5"
              >
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                  Le plus demande cette semaine
                </p>
                <p className="o-m-0 o-mt-3 o-text-base o-text-zinc-900 dark:o-text-zinc-100">
                  Bilan, radiographies et detartrage — {euros(SOCLE.honoraire)}. Avec une
                  mutuelle a 200 % BR, il vous reste{' '}
                  <span style={{ color: encre() }}>
                    {euros(calculer(SOCLE, 2).reste)}
                  </span>{' '}
                  a payer.
                </p>
              </Surgit>
            </div>

            <Surgit delai={420} className="md:o-col-span-5">
              <div className="o-mx-auto o-max-w-sm">
                <Coupe />
              </div>
            </Surgit>
          </div>
        </header>

        <main>
          {/* ================= La coupe sombre : le manifeste ============= */}
          <section
            aria-labelledby="manifeste-titre"
            className="o-px-6 o-py-20 md:o-px-10 md:o-py-28"
            style={nuit('slate')}
          >
            <div className="o-mx-auto o-max-w-5xl">
              <Indice rang="01">Ce qu on vous doit</Indice>
              <h2
                id="manifeste-titre"
                className="o-m-0 o-mt-10 o-text-slate-50"
                style={{
                  ...affiche('m', 300),
                  fontSize: 'clamp(1.9rem, 4.4vw, 4rem)',
                  lineHeight: 1.06,
                }}
              >
                <span className="o-text-slate-500">
                  Un soin ne fait pas peur parce qu il fait mal. Il fait peur{' '}
                </span>
                parce que{' '}
                <HighlightSweep
                  colour={accentDoux(500, 70)}
                  thickness={0.42}
                  duration={900}
                >
                  personne ne dit ce qu il coute
                </HighlightSweep>
                .
              </h2>
              <p className="o-m-0 o-mt-10 o-max-w-2xl o-text-base o-leading-relaxed o-text-slate-300">
                Alors nous l affichons. Le schema qui suit est celui d un bilan reel :
                neuf dents a reprendre, chacune avec son acte, son code, son honoraire et
                sa base de remboursement. Vous pouvez en retirer, en ajouter, changer de
                mutuelle. Le nombre du bas ne ment pas.
              </p>
              <p className="o-m-0 o-mt-12 o-border-t o-border-white-10 o-pt-5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-400">
                Convention nationale des chirurgiens-dentistes — tarifs au 1er janvier
                2026
              </p>
            </div>
          </section>

          {/* ================= Le mecanisme : la bouche =================== */}
          <section
            id="bouche"
            className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
          >
            <div className="o-mx-auto o-max-w-7xl">
              <Reveal>
                <Indice rang="02" sombre={false}>
                  La bouche
                </Indice>
              </Reveal>
              <Reveal delay={80}>
                <h2
                  className="o-m-0 o-mt-6 o-max-w-3xl o-text-zinc-950 dark:o-text-zinc-50"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.85rem, 4vw, 3.5rem)',
                    lineHeight: 0.98,
                  }}
                >
                  Trente-deux dents, neuf a reprendre.
                </h2>
              </Reveal>

              {/* Le niveau de mutuelle : quatre choix, un groupe de radios. */}
              <fieldset className="o-m-0 o-mt-10 o-border-w-0 o-p-0">
                <legend className="o-mb-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                  Votre mutuelle
                </legend>
                <div className="o-flex o-flex-wrap o-gap-2">
                  {MUTUELLES.map((m) => {
                    const actif = m.cle === niveau
                    return (
                      <label
                        key={m.cle}
                        className="o-inline-flex o-cursor-pointer o-items-center o-gap-2 o-rounded-full o-border-w-1 o-px-4 o-py-2 o-text-sm o-font-semibold o-transition-colors"
                        style={
                          actif
                            ? {
                                backgroundColor: encre(),
                                borderColor: encre(),
                                color: 'var(--o-theme-bg)',
                              }
                            : { borderColor: accentDoux(700, 40) }
                        }
                      >
                        <input
                          type="radio"
                          name="mutuelle"
                          value={m.cle}
                          checked={actif}
                          onChange={() => {
                            setNiveau(m.cle)
                          }}
                          className="o-sr-only focus:o-ring"
                        />
                        {m.mot}
                      </label>
                    )
                  })}
                </div>
                <p className="o-m-0 o-mt-3 o-max-w-xl o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                  {mutuelle.note}
                </p>
              </fieldset>

              {/*
                Le faisceau descend de la bouche au devis : c est la meme
                operation vue de deux cotes, et le trait le dit sans une phrase.
                La bouche et la legende partagent une ligne ; le devis prend
                toute la largeur en dessous, parce qu un tableau a cinq colonnes
                serre dans cinq douziemes ne se lit pas.
              */}
              <Corps
                reduit={reduced}
                schema={
                  <div className="o-grid o-items-start o-gap-10 lg:o-grid-cols-12">
                    <div className="lg:o-col-span-8">
                      <Schema choisies={choisies} surChoix={basculer} />
                    </div>
                    <div className="lg:o-col-span-4">
                      <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                        La legende
                      </p>
                      <ul className="o-m-0 o-mt-5 o-flex o-list-none o-flex-col o-gap-4 o-p-0">
                        {[
                          [
                            'retenue',
                            'Retenue au devis',
                            'Cliquez de nouveau pour la retirer.',
                          ],
                          [
                            'soin',
                            'Un soin a prevoir',
                            'Relevee au bilan du 4 septembre.',
                          ],
                          ['saine', 'Saine', 'Rien a faire, et nous ne le ferons pas.'],
                          ['absente', 'Absente', 'La 46 a ete extraite en 2019.'],
                        ].map(([cle, titre, texte]) => (
                          <li key={cle} className="o-flex o-items-start o-gap-3">
                            <span
                              aria-hidden="true"
                              className="o-mt-1 o-block o-h-5 o-w-4 o-shrink-0 o-rounded-sm o-border-w-1"
                              style={
                                cle === 'retenue'
                                  ? { backgroundColor: encre(), borderColor: encre() }
                                  : cle === 'soin'
                                    ? {
                                        backgroundColor: accentDoux(300, 42),
                                        borderColor: accentDoux(700, 55),
                                      }
                                    : cle === 'saine'
                                      ? {
                                          backgroundColor: 'transparent',
                                          borderColor: accentDoux(700, 26),
                                        }
                                      : {
                                          backgroundColor: 'transparent',
                                          borderColor: accentDoux(700, 55),
                                          borderStyle: 'dashed',
                                        }
                              }
                            />
                            <span className="o-block">
                              <span className="o-block o-text-sm o-font-semibold o-text-zinc-900 dark:o-text-zinc-100">
                                {titre}
                              </span>
                              <span className="o-block o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                                {texte}
                              </span>
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                }
                devis={
                  <Devis lignes={lignes} part={mutuelle.part} mutuelle={mutuelle.mot} />
                }
              />

              <p
                className="o-m-0 o-mt-8 o-max-w-3xl o-text-base o-leading-relaxed o-text-zinc-700 dark:o-text-zinc-300"
                aria-live="polite"
              >
                {dite}
              </p>
              <p className="o-m-0 o-mt-4 o-max-w-3xl o-text-sm o-leading-relaxed o-text-zinc-500 dark:o-text-zinc-400">
                Naviguez au clavier : la tabulation passe de dent en dent, Entree ou la
                barre d espace l ajoute au devis. Les dents saines se disent, elles ne s
                ajoutent pas.
              </p>
            </div>
          </section>

          {/* ================= Le cabinet, en plan cote =================== */}
          <section
            id="cabinet"
            className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
            style={{ backgroundColor: accentDoux(200, 16) }}
          >
            <div className="o-mx-auto o-max-w-6xl">
              <Reveal>
                <Indice rang="03" sombre={false}>
                  Le cabinet
                </Indice>
              </Reveal>
              <Reveal delay={80}>
                <h2
                  className="o-m-0 o-mt-6 o-max-w-2xl o-text-zinc-950 dark:o-text-zinc-50"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.85rem, 4vw, 3.5rem)',
                    lineHeight: 0.98,
                  }}
                >
                  Soixante-quinze metres carres, et zero marche.
                </h2>
              </Reveal>
              <Reveal delay={140}>
                <div className="o-mt-12">
                  <PlanCote />
                </div>
              </Reveal>
              <p className="o-m-0 o-mt-8 o-max-w-2xl o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                Plan releve a la livraison, en juin 2024. La salle 3 est equipee pour le
                fauteuil roulant : la porte fait 1,05 m et le transfert se fait par la
                gauche.
              </p>
            </div>
          </section>

          {/* ================= Le deroule, en chapitres collants ========== */}
          <div
            id="deroule"
            className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
          >
            <div className="o-mx-auto o-flex o-max-w-6xl o-flex-col o-gap-20">
              <Chapitre
                indice="(04) — Le deroule"
                titre={
                  <h2
                    className="o-m-0 o-text-zinc-950 dark:o-text-zinc-50"
                    style={{
                      ...affiche('m', 300),
                      fontSize: 'clamp(1.6rem, 3vw, 2.75rem)',
                      lineHeight: 1,
                    }}
                  >
                    Quatre rendez-vous, pas un de plus.
                  </h2>
                }
                texte="Le plan ci-dessus tient en quatre seances. Chacune a sa duree, et nous la tenons : un retard de vingt minutes se paie sur tous les patients de l apres-midi."
              >
                <ol className="o-m-0 o-list-none o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-p-0">
                  {[
                    [
                      'Seance 1',
                      '45 min',
                      'Bilan, quatre radiographies retro-alveolaires, detartrage des deux arcades. Le devis est imprime a la fin de la seance.',
                    ],
                    [
                      'Seance 2',
                      '60 min',
                      'Traitement radiculaire de la 36, sous digue. Une seule seance : nous ne rouvrons pas une dent sans raison.',
                    ],
                    [
                      'Seance 3',
                      '45 min',
                      'Composites sur la 26 et la 11. Empreinte optique de la 16 pour la couronne.',
                    ],
                    [
                      'Seance 4',
                      '30 min',
                      'Pose de la couronne, reglage de l occlusion, controle a huit jours.',
                    ],
                  ].map(([quand, duree, quoi], rang) => (
                    <li
                      key={quand}
                      className="o-grid o-gap-4 o-border-b o-border-zinc-200 dark:o-border-zinc-800 o-py-7 md:o-grid-cols-12"
                    >
                      <p className="o-m-0 md:o-col-span-3">
                        <span
                          className="o-block o-tabular-nums o-text-zinc-950 dark:o-text-zinc-50"
                          style={{
                            ...affiche('m', 300),
                            fontSize: 'clamp(2.25rem, 4vw, 3.25rem)',
                            lineHeight: 0.9,
                          }}
                        >
                          {String(rang + 1).padStart(2, '0')}
                        </span>
                        <span
                          className="o-mt-2 o-block o-font-mono o-text-xs o-uppercase o-tracking-widest"
                          style={{ color: encre() }}
                        >
                          {duree}
                        </span>
                      </p>
                      <div className="md:o-col-span-9">
                        <h3 className="o-m-0 o-text-xl o-font-medium o-tracking-tight o-text-zinc-950 dark:o-text-zinc-50">
                          {quand}
                        </h3>
                        <p className="o-m-0 o-mt-3 o-max-w-xl o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                          {quoi}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </Chapitre>

              <Chapitre
                indice="(05) — Les questions"
                titre={
                  <h2
                    className="o-m-0 o-text-zinc-950 dark:o-text-zinc-50"
                    style={{
                      ...affiche('m', 300),
                      fontSize: 'clamp(1.6rem, 3vw, 2.75rem)',
                      lineHeight: 1,
                    }}
                  >
                    Celles qu on nous pose a l accueil.
                  </h2>
                }
                texte="Quatre questions, toujours les memes, et nous n avons jamais compris pourquoi il fallait venir jusqu ici pour les poser."
              >
                <Faq items={QUESTIONS} single />
              </Chapitre>
            </div>
          </div>

          {/* ================= L appel : la frise de la journee =========== */}
          <section
            id="creneaux"
            className="o-scroll-mt-24 o-px-6 o-py-20 md:o-px-10 md:o-py-24"
            style={{ backgroundColor: accentDoux(200, 16) }}
          >
            <div className="o-mx-auto o-max-w-6xl">
              <Reveal>
                <Indice rang="06" sombre={false}>
                  Prendre rendez-vous
                </Indice>
              </Reveal>
              <Reveal delay={80}>
                <h2
                  className="o-m-0 o-mb-12 o-mt-6 o-max-w-2xl o-text-zinc-950 dark:o-text-zinc-50"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.85rem, 4vw, 3.5rem)',
                    lineHeight: 0.98,
                  }}
                >
                  Une journee, vingt-deux cases, sept libres.
                </h2>
              </Reveal>
              <Frise />
            </div>
          </section>
        </main>

        {/* ================= Le pied : quatre pictogrammes ================ */}
        <footer className="o-px-6 o-py-20 md:o-px-10" style={nuit('slate')}>
          <div className="o-mx-auto o-max-w-6xl">
            <div className="o-grid o-gap-12 sm:o-grid-cols-2 lg:o-grid-cols-4">
              <Picto
                titre="On repare avant de remplacer"
                texte="Une dent devitalisee et couronnee tient vingt ans. Un implant ne rattrape jamais une dent qu on aurait pu garder."
                dessin={
                  <g
                    fill="none"
                    stroke={accent(400)}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 24c0-9 6-14 11-14 3 0 4 2 7 2s4-2 7-2c5 0 11 5 11 14 0 8-3 12-5 20-1 6-2 12-5 12s-3-9-5-15c-1-3-4-3-5 0-2 6-2 15-5 15s-4-6-5-12c-2-8-11-12-11-20Z" />
                    <path d="M26 22c4-2 8-2 12 0" />
                  </g>
                }
              />
              <Picto
                titre="Du lundi au samedi matin"
                texte="08:00 a 19:00 en semaine, 08:00 a 12:30 le samedi. Deux creneaux d urgence gardes chaque jour, jamais ouverts en ligne."
                dessin={
                  <g
                    fill="none"
                    stroke={accent(400)}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="32" cy="32" r="22" />
                    <path d="M32 17v16l11 7" />
                    <path d="M32 10v4M32 50v4M10 32h4M50 32h4" />
                  </g>
                }
              />
              <Picto
                titre="Tramway B, arret Palais"
                texte="Deux minutes a pied. Stationnement minute sur la place, et un arret depose-minute devant la porte."
                dessin={
                  <g
                    fill="none"
                    stroke={accent(400)}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="17" y="10" width="30" height="34" rx="6" />
                    <path d="M21 20h22M22 32h6M36 32h6" />
                    <path d="M24 44l-5 10M40 44l5 10M14 54h36" />
                  </g>
                }
              />
              <Picto
                titre="De plain-pied"
                texte="Aucune marche a l entree, porte de 1,05 m, salle 3 amenagee pour le transfert depuis un fauteuil roulant."
                dessin={
                  <g
                    fill="none"
                    stroke={accent(400)}
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="38" cy="11" r="5" />
                    <path d="M38 18v9h11l4 15h-6" />
                    <path d="M38 27H27" />
                    <circle cx="27" cy="41" r="15" />
                  </g>
                }
              />
            </div>

            <div className="o-mt-16 o-flex o-flex-wrap o-items-end o-justify-between o-gap-8 o-border-t o-border-white-10 o-pt-8">
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-slate-400">
                Cabinet Emaille — 14 rue du Palais, 63000 Clermont-Ferrand
                <br />
                Docteurs Wasser, Lemaigre et Bounoua — conventionnes secteur 1
              </p>
              <p className="o-m-0">
                <a
                  href="#creneaux"
                  className="o-inline-flex o-items-center o-gap-2 o-font-mono o-text-sm o-uppercase o-tracking-widest o-no-underline focus:o-ring"
                  style={{ color: encreSurSombre() }}
                >
                  04 73 00 00 00 <Icon icon={ArrowUpRight} size={15} aria-hidden="true" />
                </a>
              </p>
            </div>
            <p className="o-m-0 o-mt-8 o-text-xs o-leading-relaxed o-text-slate-400">
              © 2026 — Les honoraires affiches sont ceux de la convention nationale des
              chirurgiens-dentistes, tarifs au 1er janvier 2026. Le calcul de
              remboursement est indicatif : votre contrat de mutuelle fait foi. Mentions
              legales · Donnees personnelles · Accessibilite : partiellement conforme.
            </p>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
