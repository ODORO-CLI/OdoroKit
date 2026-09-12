/**
 * Abat-Jour — editeur de luminaires, Saint-Ouen.
 *
 * ## Ce que la page fait : la temperature
 *
 * Le sujet de la page est **la lumiere**, pas l objet qui la porte. Son
 * mecanisme est donc une echelle de temperature de couleur — huit crans, de la
 * flamme de bougie au ciel couvert — et **tout change avec elle** : le halo, la
 * lampe, son reflet au sol, les filets, les chiffres, le pied. C est la
 * filiation de mirror-hall : un noir profond, un sol qui reflete, et une seule
 * source qui commande la piece.
 *
 * ## D ou vient la couleur
 *
 * Jamais d un hexadecimal ecrit a la main. Les huit temperatures sont **huit
 * points d un segment** tendu entre l accent de la vitrine et sa couleur
 * d appoint, parcouru en `oklch` : a mille huit cents kelvins on est a
 * l accent, a six mille cinq cents a l appoint. Repeindre la vitrine depuis la
 * barre repeint la lumiere entiere, du halo au pied.
 *
 * ## Ce qui est calcule, et qui ne s invente pas
 *
 * - le **mired**, un million divise par la temperature — l unite dans laquelle
 *   les gelatines de correction sont vendues ;
 * - la **loi de deplacement de Wien**, qui donne la longueur d onde du maximum
 *   d emission : a deux mille sept cents kelvins elle tombe a mille soixante-
 *   treize nanometres, c est-a-dire dans l infrarouge, et c est exactement pour
 *   cela qu une lampe a filament chauffe ;
 * - la **part visible du rayonnement**, obtenue en integrant la loi de Planck
 *   entre trois cent quatre-vingts et sept cent quatre-vingts nanometres et en
 *   la rapportant a l integrale totale, qui vaut sigma T puissance quatre sur
 *   pi ;
 * - la **courbe de Planck** elle-meme, tracee point par point ;
 * - l **eclairement au sol**, par la photometrie ordinaire : l intensite est le
 *   flux divise par l angle solide du faisceau, et l eclairement cette
 *   intensite divisee par le carre de la distance.
 *
 * ## Les chiffres et le mouvement
 *
 * Les chiffres tiennent sur **une echelle verticale graduee, la valeur posee
 * dessus** — c est la forme C15, et c est aussi la commande. Le mouvement est
 * le flottement : les suspensions ne sont accrochees a rien, et elles bougent
 * comme un objet au bout d un fil.
 *
 * @module
 */

import { useMotionState } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import { ArrowDown, ArrowUpRight } from '@odoro-cli/icons/filaire'
import { useMemo, useState, type ReactElement, type ReactNode } from 'react'

import { GlowCursor } from '@/odoro/effect/GlowCursor.jsx'
import { GradientFlow } from '@/odoro/text/GradientFlow.jsx'
import { ReflectiveCard } from '@/odoro/ui/ReflectiveCard.jsx'

import { nuit } from './communs.jsx'
import {
  Actions,
  affiche,
  BarreFilet,
  CHROME,
  Coin,
  Etiquette,
  Grain,
  Indice,
  Porte,
  Surgit,
  usePolices,
} from './marche.jsx'
import { accent, aplat, encreSurSombre } from './palettes.js'
import { Flotte } from './scene.jsx'

/** La hauteur d un ecran sous les barres de la documentation. */
const ECRAN = `calc(100vh - ${String(CHROME)}px)`

/** Les bornes de l echelle, en kelvins. */
const FROID = 6500
const CHAUD = 1800

/* ============================ Le catalogue ============================= */

/** Un cran de l echelle, et ce qu il vaut dans le monde. */
interface Cran {
  /** Temperature de couleur, en kelvins. */
  readonly kelvin: number
  /** Ce qui, dehors, donne cette lumiere. */
  readonly nom: string
}

/** Les huit crans, de la flamme au ciel couvert. */
const CRANS = [
  { kelvin: 1800, nom: 'Flamme de bougie' },
  { kelvin: 2200, nom: 'Filament a bout de course' },
  { kelvin: 2700, nom: 'Ampoule a incandescence' },
  { kelvin: 3000, nom: 'Halogene, fin de soiree' },
  { kelvin: 3500, nom: 'Lampe de bureau' },
  { kelvin: 4000, nom: 'Atelier, lumiere de travail' },
  { kelvin: 5000, nom: 'Midi, plein sud' },
  { kelvin: 6500, nom: 'Ciel couvert' },
] as const satisfies readonly Cran[]

/** Un luminaire du catalogue. */
interface Piece {
  readonly cle: string
  readonly nom: string
  readonly type: 'suspension' | 'lampadaire' | 'applique'
  readonly reference: string
  /** Flux lumineux, en lumens. */
  readonly flux: number
  /** Puissance appelee, en watts. */
  readonly puissance: number
  /** Angle du faisceau a mi-intensite, en degres. */
  readonly faisceau: number
  /** Indice de rendu des couleurs. */
  readonly irc: number
  readonly matiere: string
  readonly cotes: string
  readonly prix: number
  readonly note: string
}

/** Les trois pieces editees. */
const PIECES = [
  {
    cle: 'coupole',
    nom: 'Coupole',
    type: 'suspension',
    reference: 'AJ-38-S',
    flux: 1150,
    puissance: 11,
    faisceau: 38,
    irc: 97,
    matiere: 'Aluminium file, interieur sable blanc, cable textile 3 m',
    cotes: 'Diametre 38 cm, hauteur 21 cm',
    prix: 490,
    note: 'Un faisceau serre, pour une table. Au-dessus d un canape elle fait un cercle et rien autour : c est voulu, et c est ce qu on lui reproche.',
  },
  {
    cle: 'tige',
    nom: 'Tige',
    type: 'lampadaire',
    reference: 'AJ-165-L',
    flux: 780,
    puissance: 8,
    faisceau: 62,
    irc: 95,
    matiere: 'Acier tube 12 mm, base fonte 4,2 kg, abat-jour opalin',
    cotes: 'Hauteur 165 cm, abat-jour 26 cm',
    prix: 620,
    note: 'Elle ne tient debout que parce que la base pese quatre kilos. Un lampadaire leger est un lampadaire par terre.',
  },
  {
    cle: 'applique',
    nom: 'Applique',
    type: 'applique',
    reference: 'AJ-22-A',
    flux: 420,
    puissance: 5,
    faisceau: 96,
    irc: 93,
    matiere: 'Laiton brosse, demi-coupole, interrupteur a tirette',
    cotes: 'Saillie 14 cm, diametre 22 cm',
    prix: 310,
    note: 'Elle lave le mur plutot que d eclairer la piece. Posee a cent trente centimetres du sol, elle remplace une lampe de chevet.',
  },
] as const satisfies readonly Piece[]

/** Les liens de la barre. */
const NAVIGATION = [
  ['#lumiere', 'La lumiere'],
  ['#spectre', 'Le spectre'],
  ['#pieces', 'Les trois pieces'],
] as const

/** Ce qu on fait, dans la vraie vie, de chacune des huit lumieres. */
const USAGES: Readonly<Record<number, string>> = {
  1800: 'Une table dressee, rien d autre. On n y lit pas.',
  2200: 'Un couloir, un escalier, une veilleuse.',
  2700: 'Le salon, la chambre, tout ce qui se fait assis.',
  3000: 'La salle de bains, et les miroirs qui la suivent.',
  3500: 'Un bureau ou l on travaille apres dix-huit heures.',
  4000: 'Un etabli, une cuisine, une table a decouper.',
  5000: 'Un atelier de couleur : tissu, peinture, epreuve.',
  6500: 'La comparaison seulement. Personne ne vit la-dedans.',
}

/** Les trois bandes du pied, et leur temperature. */
const BANDES = [
  { kelvin: 2200, titre: 'L atelier', lignes: ['14 rue des Rosiers', '93400 Saint-Ouen', 'Ouvert le samedi, 11 h a 18 h'] },
  { kelvin: 3500, titre: 'Les pieces', lignes: ['Coupole — AJ-38-S', 'Tige — AJ-165-L', 'Applique — AJ-22-A'] },
  { kelvin: 5000, titre: 'La maison', lignes: ['Garantie dix ans, source comprise', 'Reparation a l atelier, sans terme', '© 2026 Abat-Jour'] },
] as const

/* ============================ La physique ============================== */

/** Deuxieme constante de rayonnement, en nanometres-kelvins. */
const C2 = 1.4387769e7

/** Constante de deplacement de Wien, en nanometres-kelvins. */
const WIEN = 2.897771e6

/** Constante de Stefan-Boltzmann, en watts par metre carre et par kelvin puissance quatre. */
const SIGMA = 5.670374419e-8

/** Premiere constante de rayonnement spectral, en unites du systeme international. */
const C1 = 1.1910429e-16

/**
 * La luminance spectrale du corps noir, en unites du systeme international.
 *
 * C est la loi de Planck, ecrite pour une longueur d onde en nanometres. Elle
 * sert deux fois : a tracer la courbe, et a integrer la part visible.
 */
function planck(nanometres: number, kelvin: number): number {
  const metres = nanometres * 1e-9
  return C1 / (metres ** 5 * (Math.exp(C2 / (nanometres * kelvin)) - 1))
}

/** Ce que la temperature donne, et que rien n ecrit a la main. */
interface Lumiere {
  /** Un million divise par la temperature : l unite des gelatines. */
  readonly mired: number
  /** Longueur d onde du maximum d emission, en nanometres. */
  readonly wien: number
  /** Part du rayonnement emise entre 380 et 780 nanometres. */
  readonly visible: number
  /** La courbe de Planck, normalisee sur son propre maximum. */
  readonly courbe: readonly number[]
}

/** Les longueurs d onde echantillonnees, du violet au rouge. */
const ONDES = Array.from({ length: 81 }, (_, rang) => 380 + rang * 5)

/** Tout ce qui se deduit de la seule temperature. */
function lumiereDe(kelvin: number): Lumiere {
  const valeurs = ONDES.map((onde) => planck(onde, kelvin))
  const sommet = Math.max(...valeurs)

  // L integrale entre 380 et 780 nanometres, par la methode des rectangles,
  // rapportee a l integrale totale, qui vaut sigma T puissance quatre sur pi.
  const pas = 5e-9
  const partielle = valeurs.reduce((somme, valeur) => somme + valeur * pas, 0)
  const totale = (SIGMA * kelvin ** 4) / Math.PI

  return {
    mired: Math.round(1e6 / kelvin),
    wien: WIEN / kelvin,
    visible: partielle / totale,
    courbe: valeurs.map((valeur) => valeur / sommet),
  }
}

/** Ce que la photometrie donne pour une piece, a une distance donnee. */
interface Photometrie {
  /** Efficacite lumineuse, en lumens par watt. */
  readonly efficacite: number
  /** Angle solide du faisceau, en steradians. */
  readonly angle: number
  /** Intensite lumineuse, en candelas. */
  readonly intensite: number
  /** Eclairement au sol, en lux. */
  readonly eclairement: number
  /** Diametre de la tache lumineuse, en metres. */
  readonly tache: number
}

/** La distance d eclairage retenue : une table sous une suspension. */
const DISTANCE = 1.2

/** La photometrie de la piece, a la distance de reference. */
function photometrieDe(piece: Piece): Photometrie {
  const demi = (piece.faisceau * Math.PI) / 360
  const angle = 2 * Math.PI * (1 - Math.cos(demi))
  const intensite = piece.flux / angle
  return {
    efficacite: piece.flux / piece.puissance,
    angle,
    intensite,
    eclairement: intensite / DISTANCE ** 2,
    tache: 2 * DISTANCE * Math.tan(demi),
  }
}

/** Un nombre a la francaise. */
function nombre(valeur: number, decimales = 0): string {
  return valeur.toLocaleString('fr-FR', { minimumFractionDigits: decimales, maximumFractionDigits: decimales })
}

/* ============================ Les teintes ============================== */

/** La place d une temperature sur le segment, de zero (chaud) a un (froid). */
function place(kelvin: number): number {
  return (kelvin - CHAUD) / (FROID - CHAUD)
}

/**
 * La couleur d une temperature, a la nuance demandee.
 *
 * Le segment va de l accent de la vitrine a sa couleur d appoint, parcouru en
 * polaire : melangees en coordonnees rectangulaires, une flamme et un ciel
 * couvert se rencontreraient sur un gris, et les crans du milieu perdraient
 * toute identite.
 */
function lueur(kelvin: number, nuance: number): string {
  return `color-mix(in oklch, ${accent(nuance)} ${String(Math.round((1 - place(kelvin)) * 100))}%, var(--o-vitrine-seconde))`
}

/** La meme couleur, rendue translucide : les halos et les filets. */
function voile(kelvin: number, part: number, nuance = 300): string {
  return `color-mix(in oklab, ${lueur(kelvin, nuance)} ${String(part)}%, transparent)`
}

/** La meme couleur, fondue dans le noir de la piece : les aplats profonds. */
function fond(kelvin: number, part: number, nuance = 500): string {
  return `color-mix(in oklab, ${lueur(kelvin, nuance)} ${String(part)}%, var(--o-palette-zinc-950))`
}

/* ============================ La lampe dessinee ======================== */

/**
 * Le luminaire, dessine, avec sa source et son faisceau.
 *
 * Trois silhouettes, une par type. La source et le cone de lumiere prennent la
 * couleur du cran choisi : c est le meme segment que le reste de la page, donc
 * la lampe ne peut pas se desaccorder du halo qui l entoure.
 */
function Lampe({ piece, kelvin }: { readonly piece: Piece; readonly kelvin: number }): ReactElement {
  const metal = lueur(kelvin, 200)
  const source = lueur(kelvin, 100)
  const cone = voile(kelvin, 34, 300)
  const identifiant = `o-luminaire-faisceau-${piece.cle}`

  // Le demi-angle du faisceau, rendu en pixels a la hauteur du dessin : la
  // tache dessinee est celle que la photometrie annonce, pas une jolie forme.
  const ouverture = Math.tan((piece.faisceau * Math.PI) / 360) * 300

  return (
    <svg viewBox="0 0 360 460" className="o-h-full o-w-full" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={identifiant} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={cone} stopOpacity="0.85" />
          <stop offset="1" stopColor={cone} stopOpacity="0" />
        </linearGradient>
        <radialGradient id={`${identifiant}-source`}>
          <stop offset="0" stopColor={source} stopOpacity="1" />
          <stop offset="1" stopColor={source} stopOpacity="0" />
        </radialGradient>
      </defs>

      {piece.type === 'suspension' && (
        <>
          <path d="M180 0 V96" stroke={metal} strokeWidth="2" opacity="0.6" />
          <path d={`M180 148 L${String(180 - ouverture)} 448 H${String(180 + ouverture)} Z`} fill={`url(#${identifiant})`} />
          <path d="M118 148 Q180 82 242 148 Z" fill="var(--o-palette-zinc-900)" stroke={metal} strokeWidth="2" />
          <ellipse cx="180" cy="148" rx="62" ry="11" fill={source} opacity="0.9" />
          <circle cx="180" cy="148" r="74" fill={`url(#${identifiant}-source)`} opacity="0.6" />
        </>
      )}

      {piece.type === 'lampadaire' && (
        <>
          <path d={`M180 150 L${String(180 - ouverture)} 448 H${String(180 + ouverture)} Z`} fill={`url(#${identifiant})`} />
          <path d="M136 92 L224 92 L246 150 L114 150 Z" fill="var(--o-palette-zinc-900)" stroke={metal} strokeWidth="2" />
          <ellipse cx="180" cy="150" rx="66" ry="10" fill={source} opacity="0.9" />
          <circle cx="180" cy="150" r="70" fill={`url(#${identifiant}-source)`} opacity="0.55" />
          <path d="M180 150 V424" stroke={metal} strokeWidth="4" />
          <ellipse cx="180" cy="428" rx="52" ry="12" fill="var(--o-palette-zinc-900)" stroke={metal} strokeWidth="2" />
        </>
      )}

      {piece.type === 'applique' && (
        <>
          <path d={`M198 176 L${String(198 - ouverture)} 448 H${String(198 + ouverture)} Z`} fill={`url(#${identifiant})`} />
          <path d="M96 60 V420" stroke={metal} strokeWidth="2" opacity="0.45" strokeDasharray="6 6" />
          <path d="M96 130 H140 A 58 58 0 1 1 140 234 H96 Z" fill="var(--o-palette-zinc-900)" stroke={metal} strokeWidth="2" />
          <ellipse cx="186" cy="182" rx="12" ry="34" fill={source} opacity="0.9" />
          <circle cx="190" cy="182" r="64" fill={`url(#${identifiant}-source)`} opacity="0.5" />
        </>
      )}
    </svg>
  )
}

/* ============================ Le sol qui reflete ======================= */

/** Les regles du reflet et du flottement, posees une fois. */
const REGLE = [
  '@keyframes o-luminaire-onde{0%,100%{transform:scaleY(-1) skewX(-1.4deg)}50%{transform:scaleY(-1) skewX(1.4deg)}}',
  '[data-o-luminaire-reflet]{animation:o-luminaire-onde 11s ease-in-out infinite}',
  '@media (prefers-reduced-motion:reduce){[data-o-luminaire-reflet]{animation:none;transform:scaleY(-1)}}',
].join('')

/**
 * Un objet pose sur un sol qui le reflete.
 *
 * Le reflet est le meme dessin, retourne, efface vers le bas par un masque, et
 * qui ondule lentement — c est la reference mirror-hall, et c est ce qui donne
 * a un fond noir une profondeur qu aucun degrade ne donne.
 */
function SurLeSol({ children, hauteur }: { readonly children: ReactNode; readonly hauteur: number }): ReactElement {
  return (
    <div className="o-relative o-flex o-flex-col o-items-center">
      <div style={{ height: hauteur }}>{children}</div>
      <div
        aria-hidden="true"
        className="o-pointer-events-none o-overflow-hidden o-opacity-25"
        style={{
          height: hauteur * 0.58,
          maskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.9), transparent 82%)',
          WebkitMaskImage: 'linear-gradient(to bottom, rgba(0,0,0,0.9), transparent 82%)',
          filter: 'blur(2px)',
        }}
      >
        <div data-o-luminaire-reflet="" style={{ height: hauteur }}>
          {children}
        </div>
      </div>
    </div>
  )
}

/* ============================ L echelle verticale ====================== */

/**
 * L echelle des temperatures : huit crans gradues, la valeur posee dessus.
 *
 * C est a la fois la forme des chiffres de la page et sa commande. Une reglette
 * horizontale aurait fait un curseur de plus ; verticale, graduee, avec la
 * valeur qui se deplace le long d elle, elle se lit comme un thermometre — et
 * c est bien une temperature.
 */
function Echelle({ kelvin, onChange }: { readonly kelvin: number; readonly onChange: (kelvin: number) => void }): ReactElement {
  const rang = CRANS.findIndex((cran) => cran.kelvin === kelvin)
  const courant = CRANS[rang] ?? CRANS[2]
  // Le froid est en haut, le chaud en bas : c est le sens d un thermometre, et
  // l inverse de l ordre du tableau.
  const haut = ((CRANS.length - 1 - Math.max(0, rang)) / (CRANS.length - 1)) * 100

  return (
    <div className="o-flex o-items-stretch o-gap-5">
      {/* La valeur, posee en face de son cran. */}
      <div className="o-relative o-w-40 o-text-right sm:o-w-52">
        <div
          className="o-absolute o-right-0"
          style={{ top: `${String(haut)}%`, transform: 'translateY(-50%)', transition: 'top 420ms cubic-bezier(0.16, 1, 0.3, 1)' }}
        >
          <p className="o-m-0 o-tabular-nums" style={{ ...affiche('m', 300), fontSize: 'clamp(2rem, 4.4vw, 3.5rem)', lineHeight: 1, color: lueur(kelvin, 200) }}>
            {nombre(kelvin)} K
          </p>
          <p className="o-m-0 o-mt-1 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">{courant.nom}</p>
        </div>
      </div>

      {/* La reglette, et ses huit crans. */}
      <ul className="o-m-0 o-flex o-list-none o-flex-col o-justify-between o-p-0" style={{ minHeight: 320 }}>
        {[...CRANS].reverse().map((cran) => {
          const actif = cran.kelvin === kelvin
          return (
            <li key={cran.kelvin}>
              <button
                type="button"
                aria-pressed={actif}
                onClick={() => { onChange(cran.kelvin) }}
                className="o-flex o-cursor-pointer o-items-center o-gap-3 o-py-1 focus:o-ring"
              >
                <span
                  aria-hidden="true"
                  className="o-block o-h-0.5 o-transition-all"
                  style={{ width: actif ? 54 : 26, backgroundColor: actif ? lueur(cran.kelvin, 200) : 'var(--o-palette-zinc-600)' }}
                />
                <span className={`o-font-mono o-text-xs o-tabular-nums ${actif ? 'o-text-zinc-50' : 'o-text-zinc-400'}`}>
                  <span className="o-sr-only">Temperature de couleur </span>
                  {nombre(cran.kelvin)}
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/* ============================ La courbe de Planck ====================== */

/** La courbe de Planck sur le visible, tracee point par point. */
function Spectre({ lumiere: l, kelvin }: { readonly lumiere: Lumiere; readonly kelvin: number }): ReactElement {
  const trait = lueur(kelvin, 200)
  const gauche = 54
  const droite = 686
  const haut = 20
  const bas = 240

  const x = (onde: number): number => gauche + ((onde - 380) / 400) * (droite - gauche)
  const y = (valeur: number): number => bas - valeur * (bas - haut)

  const trace = useMemo(() => {
    const points = l.courbe.map((valeur, rang) => `${x(ONDES[rang] ?? 380).toFixed(1)} ${y(valeur).toFixed(1)}`)
    return {
      ligne: `M${points.join('L')}`,
      aire: `M${String(gauche)} ${String(bas)}L${points.join('L')}L${String(droite)} ${String(bas)}Z`,
    }
  }, [l.courbe])

  return (
    <svg viewBox="0 0 720 280" className="o-h-full o-w-full" fill="none" aria-hidden="true">
      <g stroke="var(--o-palette-zinc-800)" strokeWidth="1">
        {[380, 450, 500, 550, 600, 650, 700, 780].map((onde) => (
          <line key={onde} x1={x(onde).toFixed(1)} y1={haut} x2={x(onde).toFixed(1)} y2={bas} />
        ))}
        {[0, 0.25, 0.5, 0.75, 1].map((part) => (
          <line key={part} x1={gauche} y1={y(part).toFixed(1)} x2={droite} y2={y(part).toFixed(1)} opacity={part === 0 ? 1 : 0.5} />
        ))}
      </g>

      <path d={trace.aire} fill={trait} fillOpacity="0.18" />
      <path d={trace.ligne} stroke={trait} strokeWidth="2.6" strokeLinejoin="round" />

      <g fill="var(--o-palette-zinc-400)" style={{ fontFamily: 'var(--o-font-mono)', fontSize: 11 }}>
        {[380, 450, 500, 550, 600, 650, 700, 780].map((onde) => (
          <text key={onde} x={x(onde).toFixed(1)} y="260" textAnchor="middle">
            {String(onde)}
          </text>
        ))}
        <text x={gauche} y="14">Luminance, rapportee a son maximum</text>
        <text x={droite} y="276" textAnchor="end">Longueur d onde, en nanometres</text>
      </g>
    </svg>
  )
}

/* ============================ Les petites pieces ======================= */

/** Une valeur lue, sur son filet. */
function Valeur({ quoi, valeur, note }: { readonly quoi: string; readonly valeur: string; readonly note: string }): ReactElement {
  return (
    <div className="o-border-t o-border-white-10 o-py-4">
      <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">{quoi}</dt>
      <dd className="o-m-0 o-mt-1.5 o-tabular-nums o-text-zinc-50" style={{ ...affiche('m', 300), fontSize: 'clamp(1.375rem, 2.4vw, 2rem)' }}>
        {valeur}
      </dd>
      <p className="o-m-0 o-mt-1 o-text-xs o-leading-relaxed o-text-zinc-400">{note}</p>
    </div>
  )
}

/** Un choix : une gelule bordee, pleine quand elle est prise. */
function Choix({ actif, onClick, children }: { readonly actif: boolean; readonly onClick: () => void; readonly children: ReactNode }): ReactElement {
  return (
    <button
      type="button"
      aria-pressed={actif}
      onClick={onClick}
      className="o-rounded-full o-border-w-1 o-px-4 o-py-1.5 o-text-sm o-transition-colors focus:o-ring"
      style={actif ? { ...aplat(), borderColor: 'transparent' } : { borderColor: 'var(--o-theme-line)', color: 'var(--o-palette-zinc-300)' }}
    >
      {children}
    </button>
  )
}

/* ============================ La page ================================== */

export default function Page(): ReactElement {
  const polices = usePolices('syne')
  const { reduced } = useMotionState()

  const [kelvin, setKelvin] = useState<number>(2700)
  const [clePiece, setClePiece] = useState<string>(PIECES[0].cle)

  const piece: Piece = PIECES.find((p) => p.cle === clePiece) ?? PIECES[0]
  const lumiere = useMemo(() => lumiereDe(kelvin), [kelvin])
  const photo = useMemo(() => photometrieDe(piece), [piece])

  return (
    <Porte forme="iris" marque="Abat-Jour">
      <div className="o-relative o-text-zinc-50" style={{ ...polices, ...nuit('zinc') }}>
        <style>{REGLE}</style>

        {/* Le noir de la piece, teinte par la lumiere qui y brule. Rien
            d autre : la page n a pas de fond, elle a une source. */}
        <div
          aria-hidden="true"
          className="o-pointer-events-none o-fixed o-inset-0 o-z-0"
          style={{
            background: `radial-gradient(58% 42% at 50% 22%, ${voile(kelvin, 16, 400)}, transparent 72%), ${fond(kelvin, 5, 700)}`,
            transition: 'background 800ms ease',
          }}
        />

        <div className="o-relative o-z-10">
          <BarreFilet marque="Abat-Jour" liens={NAVIGATION} action={['#catalogue', 'Le catalogue']} />

          <main>
            {/*
              ----- L ouverture, et le mecanisme ----------------------------

              La lampe est au centre, posee sur un sol qui la reflete ;
              l echelle est a droite. Regler un cran reteinte le halo, la
              source, le reflet, les filets, et tout ce qui suit.
            */}
            <GlowCursor size={420} intensity={0.28} trail={0.4} color={voile(kelvin, 60, 300)}>
              <section id="lumiere" className="o-relative o-scroll-mt-24 o-overflow-hidden o-px-6 o-pb-14 o-pt-10 md:o-px-12" style={{ minHeight: ECRAN }}>
                <div className="o-grid o-gap-10 lg:o-grid-cols-12 lg:o-items-center" style={{ minHeight: `calc(${ECRAN} - 6rem)` }}>
                  <div className="lg:o-col-span-4">
                    <Surgit>
                      <Etiquette>Saint-Ouen — sources remplacables</Etiquette>
                    </Surgit>
                    <h1 className="o-m-0 o-mt-6" style={{ ...affiche('l', 400), fontSize: 'clamp(2.25rem, 5.4vw, 4.75rem)', lineHeight: 0.96 }}>
                      {['Une', 'piece,', 'une', 'seule'].map((mot, rang) => (
                        <Surgit key={mot} as="span" delai={140 + rang * 70} className="o-inline-block" style={{ marginRight: '0.22em' }}>
                          {mot}
                        </Surgit>
                      ))}
                      <Surgit as="span" delai={440} className="o-inline-block">
                        <GradientFlow speed={6200} angle={100} from={lueur(kelvin, 100)} to={lueur(kelvin, 400)}>
                          temperature.
                        </GradientFlow>
                      </Surgit>
                    </h1>
                    <Surgit delai={580} as="p" className="o-m-0 o-mt-8 o-max-w-sm o-text-base o-leading-relaxed o-text-zinc-300">
                      Choisir un luminaire sans choisir sa temperature, c est choisir un tissu sans regarder la couleur. Reglez l echelle : la page entiere change de lumiere.
                    </Surgit>
                    <Surgit delai={720} className="o-mt-8">
                      <Actions
                        pleine={['#spectre', <>Voir le spectre <Icon icon={ArrowDown} size={16} aria-hidden="true" /></>]}
                        fantome={['#pieces', 'Les trois pieces']}
                      />
                    </Surgit>
                  </div>

                  {/* La lampe, qui flotte au bout de son fil. */}
                  <div className="o-flex o-min-w-0 o-justify-center lg:o-col-span-5">
                    <Flotte amplitude={reduced ? 0 : 9} duree={9} className="o-w-full o-max-w-xs">
                      <SurLeSol hauteur={420}>
                        <Lampe piece={piece} kelvin={kelvin} />
                      </SurLeSol>
                    </Flotte>
                  </div>

                  {/* L echelle : la commande, et la forme des chiffres. */}
                  <div className="o-flex o-justify-start lg:o-col-span-3 lg:o-justify-end">
                    <Echelle kelvin={kelvin} onChange={setKelvin} />
                  </div>
                </div>

                <div className="o-hidden lg:o-block">
                  <Coin position="bg">
                    {piece.reference} — {piece.cotes}
                    <br />
                    IRC {String(piece.irc)} — source remplacable
                  </Coin>
                </div>
                <Grain opacite={0.05} />
              </section>
            </GlowCursor>

            {/*
              ----- Le spectre, et ce qui s en deduit -----------------------
            */}
            <section id="spectre" className="o-scroll-mt-24 o-border-t o-border-white-10 o-px-6 o-py-20 md:o-px-12 md:o-py-28">
              <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
                <div className="md:o-col-span-7">
                  <Indice rang="01">Le spectre</Indice>
                  <h2 className="o-m-0 o-mt-5 o-max-w-2xl" style={{ ...affiche('m', 400), fontSize: 'clamp(1.75rem, 4vw, 3.25rem)', lineHeight: 1 }}>
                    A {nombre(kelvin)} kelvins, {nombre(lumiere.visible * 100, 1)} pour cent du rayonnement se voit.
                  </h2>
                </div>
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400 md:o-col-span-5 md:o-text-right">
                  Loi de Planck, integree entre 380 et 780 nm,
                  <br />
                  rapportee a sigma T puissance quatre sur pi.
                </p>
              </div>

              <div className="o-mt-12 o-grid o-gap-10 lg:o-grid-cols-12 lg:o-gap-12">
                <div className="o-min-w-0 lg:o-col-span-7">
                  <div className="o-overflow-hidden o-rounded-2xl o-border-w-1 o-border-white-10 o-p-4 md:o-p-6" style={{ backgroundColor: fond(kelvin, 9, 800) }}>
                    <Spectre lumiere={lumiere} kelvin={kelvin} />
                  </div>
                  <p className="o-m-0 o-mt-3 o-text-sm o-leading-relaxed o-text-zinc-300">
                    La courbe est tracee sur le visible seulement. Le maximum de Planck, lui, tombe a{' '}
                    <span className="o-tabular-nums" style={{ color: encreSurSombre() }}>{nombre(lumiere.wien)} nm</span> :{' '}
                    {lumiere.wien > 780
                      ? 'dans l infrarouge, hors du dessin. Une source de cette temperature chauffe donc plus qu elle n eclaire.'
                      : 'dans le visible, ce qui est le cas d un ciel du nord et de presque rien d autre.'}
                  </p>
                </div>

                <dl className="o-m-0 lg:o-col-span-5">
                  <Valeur
                    quoi="Temperature de couleur"
                    valeur={`${nombre(kelvin)} K`}
                    note={`${CRANS.find((c) => c.kelvin === kelvin)?.nom ?? ''}, et rien d autre sur cette page.`}
                  />
                  <Valeur
                    quoi="Mired"
                    valeur={nombre(lumiere.mired)}
                    note="Un million sur la temperature : l unite dans laquelle les gelatines de correction sont vendues."
                  />
                  <Valeur
                    quoi="Maximum de Planck"
                    valeur={`${nombre(lumiere.wien)} nm`}
                    note="Loi de deplacement de Wien : 2 897 771 nanometres-kelvins, divises par la temperature."
                  />
                  <Valeur
                    quoi="Part visible du rayonnement"
                    valeur={`${nombre(lumiere.visible * 100, 1)} %`}
                    note="Le reste part en infrarouge. C est la seule raison pour laquelle une ampoule a filament est chaude."
                  />
                </dl>
              </div>
            </section>

            {/*
              ----- Le nuancier : huit lumieres, larges de leur mired --------

              Les panneaux n ont pas la meme largeur : chacune vaut son mired,
              c est-a-dire l inverse de sa temperature. Les lumieres chaudes
              sont larges, les froides etroites — et c est exactement ainsi
              qu elles se distinguent a l oeil, par grands pas en bas
              d echelle et par petits pas en haut.
            */}
            <section className="o-border-t o-border-white-10 o-px-6 o-py-20 md:o-px-12 md:o-py-24">
              <div className="o-flex o-flex-wrap o-items-end o-justify-between o-gap-6">
                <div>
                  <Indice rang="02">Les huit lumieres</Indice>
                  <h2 className="o-m-0 o-mt-5 o-max-w-xl" style={{ ...affiche('m', 400), fontSize: 'clamp(1.625rem, 3.4vw, 2.75rem)', lineHeight: 1 }}>
                    Chacune sert a une chose, et a une seule.
                  </h2>
                </div>
                <p className="o-m-0 o-max-w-xs o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400">
                  La largeur d un panneau vaut son mired : l ecart qu on percoit, pas l ecart en kelvins.
                </p>
              </div>

              <ul className="o-m-0 o-mt-10 o-flex o-list-none o-flex-col o-gap-1 o-p-0 md:o-flex-row">
                {CRANS.map((cran) => {
                  const actif = cran.kelvin === kelvin
                  return (
                    <li key={cran.kelvin} style={{ flexGrow: 1e6 / cran.kelvin, flexBasis: 0, minWidth: 108 }}>
                      <button
                        type="button"
                        aria-pressed={actif}
                        onClick={() => { setKelvin(cran.kelvin) }}
                        className="o-flex o-w-full o-cursor-pointer o-flex-col o-justify-end o-p-4 o-text-left o-transition-transform hover:o-scale-105 focus:o-ring"
                        style={{
                          minHeight: 210,
                          backgroundColor: fond(cran.kelvin, 34, 500),
                          boxShadow: actif ? `inset 0 0 0 2px ${lueur(cran.kelvin, 200)}` : `inset 0 0 0 1px ${voile(cran.kelvin, 34, 500)}`,
                        }}
                      >
                        <span aria-hidden="true" className="o-mb-4 o-block o-h-10 o-w-10 o-rounded-full" style={{ backgroundColor: lueur(cran.kelvin, 200), boxShadow: `0 0 34px 6px ${voile(cran.kelvin, 55, 300)}` }} />
                        <span className="o-block o-font-mono o-text-xs o-tabular-nums" style={{ color: lueur(cran.kelvin, 200) }}>
                          {nombre(cran.kelvin)} K
                        </span>
                        <span className="o-mt-1 o-block o-text-sm o-font-semibold o-text-zinc-50">{cran.nom}</span>
                        <span className="o-mt-2 o-block o-text-xs o-leading-relaxed o-text-zinc-400">{USAGES[cran.kelvin] ?? ''}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </section>

            {/*
              ----- La photometrie, piece par piece -------------------------
            */}
            <section
              id="pieces"
              className="o-scroll-mt-24 o-border-t o-border-white-10 o-px-6 o-py-20 md:o-px-12 md:o-py-28"
              style={{ backgroundColor: fond(kelvin, 7, 700) }}
            >
              <div className="o-flex o-flex-wrap o-items-end o-justify-between o-gap-6">
                <div>
                  <Indice rang="03">Les trois pieces</Indice>
                  <h2 className="o-m-0 o-mt-5 o-max-w-xl" style={{ ...affiche('m', 400), fontSize: 'clamp(1.75rem, 4vw, 3.25rem)', lineHeight: 1 }}>
                    {piece.nom} — {nombre(photo.eclairement)} lux sous elle.
                  </h2>
                </div>
                <div className="o-flex o-flex-wrap o-gap-2">
                  {PIECES.map((p) => (
                    <Choix key={p.cle} actif={p.cle === clePiece} onClick={() => { setClePiece(p.cle) }}>
                      {p.nom}
                    </Choix>
                  ))}
                </div>
              </div>

              <div className="o-mt-12 o-grid o-gap-10 lg:o-grid-cols-12 lg:o-gap-12 lg:o-items-center">
                <div className="o-min-w-0 lg:o-col-span-5">
                  <ReflectiveCard shine={0.16} brush={0.08} className="o-rounded-2xl o-p-6">
                    <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                      {piece.reference} — {piece.type}
                    </p>
                    <p className="o-m-0 o-mt-3 o-text-sm o-leading-relaxed o-text-zinc-200">{piece.note}</p>
                    <dl className="o-m-0 o-mt-6 o-flex o-flex-col o-gap-3 o-border-t o-border-white-10 o-pt-5 o-text-sm">
                      {([
                        ['Matiere', piece.matiere],
                        ['Cotes', piece.cotes],
                        ['Prix', `${nombre(piece.prix)} EUR, source comprise`],
                      ] as const).map(([quoi, valeur]) => (
                        <div key={quoi} className="o-grid o-gap-1 sm:o-grid-cols-12">
                          <dt className="o-font-mono o-text-xs o-uppercase o-tracking-wider o-text-zinc-400 sm:o-col-span-3">{quoi}</dt>
                          <dd className="o-m-0 o-text-zinc-200 sm:o-col-span-9">{valeur}</dd>
                        </div>
                      ))}
                    </dl>
                  </ReflectiveCard>
                </div>

                <dl className="o-m-0 o-grid o-gap-x-10 lg:o-col-span-7 sm:o-grid-cols-2">
                  <Valeur
                    quoi="Efficacite lumineuse"
                    valeur={`${nombre(photo.efficacite)} lm / W`}
                    note={`${nombre(piece.flux)} lumens pour ${nombre(piece.puissance)} watts appeles au mur.`}
                  />
                  <Valeur
                    quoi="Intensite dans l axe"
                    valeur={`${nombre(photo.intensite)} cd`}
                    note={`Le flux divise par l angle solide du faisceau, ${nombre(photo.angle, 2)} steradians.`}
                  />
                  <Valeur
                    quoi={`Eclairement a ${nombre(DISTANCE, 1)} m`}
                    valeur={`${nombre(photo.eclairement)} lux`}
                    note="L intensite divisee par le carre de la distance. Une table de travail en demande trois cents."
                  />
                  <Valeur
                    quoi="Tache lumineuse"
                    valeur={`${nombre(photo.tache, 2)} m`}
                    note={`Faisceau de ${String(piece.faisceau)} degres, mesure a mi-intensite.`}
                  />
                </dl>
              </div>
            </section>

            {/*
              ----- Une phrase, et rien d autre -----------------------------
            */}
            <section
              className="o-flex o-flex-col o-justify-center o-border-t o-border-white-10 o-px-6 o-py-24 md:o-px-12"
              style={{ minHeight: '62vh', backgroundColor: fond(kelvin, 8, 800) }}
            >
              <p className="o-m-0 o-max-w-4xl o-text-balance" style={{ ...affiche('m', 400), fontSize: 'clamp(1.625rem, 3.6vw, 3.5rem)', lineHeight: 1.12 }}>
                <span className="o-text-zinc-500">Nous editons trois luminaires et nous en vendons peu. </span>
                <span className="o-text-zinc-50">Ce qui se decide vraiment, dans une piece, c est la temperature — et elle ne coute rien.</span>
              </p>
              <p className="o-m-0 o-mt-10 o-max-w-xl o-text-base o-leading-relaxed o-text-zinc-300">
                Les sources sont des modules standard, achetables partout, remplacables au tournevis. Nous ne soudons rien dans un abat-jour : une lampe qu on jette parce que sa diode est morte est une lampe ratee.
              </p>
            </section>

            {/*
              ----- L appel : un seul bouton, plein cadre -------------------

              Pas de titre, pas de paragraphe, pas de gelule secondaire : la
              bande entiere est le bouton, et elle porte la lumiere du cran
              choisi.
            */}
            <a
              id="catalogue"
              href="mailto:atelier@abat-jour-editions.fr"
              className="o-flex o-scroll-mt-24 o-items-center o-justify-center o-gap-6 o-px-6 o-py-20 o-text-center o-no-underline o-transition-opacity hover:o-opacity-90 focus:o-ring md:o-py-28"
              style={{
                backgroundColor: lueur(kelvin, 400),
                color: 'var(--o-palette-zinc-950)',
                transition: 'background-color 800ms ease',
              }}
            >
              <span style={{ ...affiche('xl', 400), fontSize: 'clamp(2rem, 8vw, 7.5rem)', lineHeight: 0.94 }}>
                Demander le catalogue
              </span>
              <Icon icon={ArrowUpRight} size={40} aria-hidden="true" />
            </a>
          </main>

          {/*
            ----- Le pied : trois bandes de couleur ------------------------

            Une par temperature — la bougie, la lampe de bureau, le plein sud.
            Elles ne suivent pas le cran choisi : ce sont les trois lumieres
            que la maison edite, et elles restent la pour qu on les compare.
          */}
          <footer>
            {BANDES.map((bande) => (
              <div
                key={bande.titre}
                className="o-px-6 o-py-10 md:o-px-12"
                style={{ backgroundColor: fond(bande.kelvin, 34, 600) }}
              >
                <div className="o-grid o-gap-6 md:o-grid-cols-12 md:o-items-baseline">
                  <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest md:o-col-span-3" style={{ color: lueur(bande.kelvin, 200) }}>
                    {nombre(bande.kelvin)} K — {bande.titre}
                  </p>
                  <ul className="o-m-0 o-flex o-list-none o-flex-col o-gap-1 o-p-0 o-text-sm o-text-zinc-200 md:o-col-span-9">
                    {bande.lignes.map((ligne) => (
                      <li key={ligne}>{ligne}</li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
            <div className="o-flex o-flex-wrap o-items-center o-justify-between o-gap-4 o-px-6 o-py-6 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400 md:o-px-12" style={{ backgroundColor: 'var(--o-palette-zinc-950)' }}>
              <span>Abat-Jour — editeur de luminaires</span>
              <span>{reduced ? 'Reflet fige — mouvement reduit' : 'Le sol est en resine noire, coulee sur place'}</span>
              <a href="#lumiere" className="o-text-zinc-400 o-no-underline hover:o-text-zinc-50 focus:o-ring">Remonter ↑</a>
            </div>
          </footer>
        </div>
      </div>
    </Porte>
  )
}
