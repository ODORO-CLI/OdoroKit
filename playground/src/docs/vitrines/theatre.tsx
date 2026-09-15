/**
 * Coulisse — theatre de ville.
 *
 * ## La reference : Spector (Framer)
 *
 * Capitales grasses, manifeste dont la premiere moitie est eteinte, un seul
 * accent rationne — ici le rose — et une page entierement dans le noir. Rien
 * n est arrondi, rien n est centre : la page se tient sur des filets et sur
 * une seule ligne de force verticale.
 *
 * ## Le mecanisme : le plateau
 *
 * La fiche du catalogue demande « une coupe du plateau, et ce que chaque
 * metier y fait ». La coupe est donc dessinee pour de bon — gril, cintres,
 * cadre, plancher, dessous, fosse, gradins, cabine — **avec ses cotes**, et
 * elle est epinglee pendant cinq ecrans. A chaque acte, un metier prend le
 * plateau : ses zones s allument dans la coupe, son poste se remplit, et le
 * cumul des heures se recalcule depuis les durees ecrites a la main. La page
 * finit par dire ce qu elle voulait dire : dix-neuf heures trente de plateau
 * pour une heure cinquante de spectacle.
 *
 * Les chiffres de la page sont ceux de la coupe (forme C20) : ils sont poses
 * sur le plan, au bout de leurs lignes de cote, et nulle part ailleurs.
 *
 * ## Pourquoi rien n est photographie
 *
 * Aucune photographie de salle n existe dans le dossier, et une salle
 * empruntee ailleurs aurait ete une salle etrangere. Tout est trace : le
 * rideau de l ouverture, la coupe, les trois portes, la frise de metiers du
 * pied.
 *
 * @module
 */

import { useMotionState } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import { ArrowRight, ArrowUpRight } from '@odoro-cli/icons/outline'
import { Reveal } from '@odoro-cli/libs/motion'
import { useEffect, useMemo, useRef, type CSSProperties, type ReactElement } from 'react'

import { CursorHalo } from '@/odoro/effect/CursorHalo.jsx'
import { NeonBorder } from '@/odoro/effect/NeonBorder.jsx'
import { ShineText } from '@/odoro/text/ShineText.jsx'

import { nuit } from './communs.jsx'
import { accent, accentDoux, encreSurSombre } from './palettes.js'
import {
  Actions,
  affiche,
  BarreCoins,
  CHROME,
  Etiquette,
  Grain,
  Indice,
  Manifeste,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
} from './marche.jsx'
import { Epingle } from './scene.jsx'

/* ============================ La coupe ================================= */

/** Le cadre de la coupe, en unites de dessin. */
const CADRE = { l: 1240, h: 620 } as const

/** Une zone de la coupe : ce qu un metier occupe. */
type Zone = readonly [x: number, y: number, largeur: number, hauteur: number]

/** Un metier du plateau, son poste, et ce qu il fait ce jour-la. */
interface Metier {
  readonly nom: string
  readonly poste: string
  readonly appel: string
  /** Duree de presence avant le lever, en minutes. */
  readonly minutes: number
  readonly fait: string
  readonly releve: readonly (readonly [string, string])[]
  readonly zones: readonly Zone[]
}

/**
 * Les cinq metiers, dans l ordre ou ils entrent sur le plateau.
 *
 * Les durees sont celles d une journee de montage ordinaire, et c est leur
 * somme qui donne le chiffre du dernier acte : rien n est arrondi a la main.
 */
const METIERS = [
  {
    nom: 'L electricien',
    poste: 'Le gril, la face, la cabine',
    appel: '08 h 00',
    minutes: 480,
    fait: 'Implante cent trente-quatre projecteurs, en accroche quarante et un au gril et vingt-deux a la face de salle, puis encode cinquante-deux memoires avec le createur. La poursuite se tient en cabine, au fond.',
    releve: [
      ['Projecteurs', '134'],
      ['Perches chargees', '6 sur 24'],
      ['Memoires', '52'],
      ['Puissance appelee', '58 kW'],
    ],
    zones: [
      [560, 96, 560, 96],
      [140, 194, 300, 34],
      [52, 292, 124, 70],
    ],
  },
  {
    nom: 'Le machiniste',
    poste: 'Le plancher, cote jardin',
    appel: '14 h 00',
    minutes: 360,
    fait: 'Monte le decor, le cale, le trappe et le deplace a vue. Trois changements a vue dans ce spectacle, le plus long tient en trente-huit secondes, compte depuis le dernier mot.',
    releve: [
      ['Changements a vue', '3'],
      ['Le plus long', '38 s'],
      ['Elements de decor', '11'],
      ['Trappes ouvertes', '2 sur 9'],
    ],
    zones: [[536, 462, 584, 58]],
  },
  {
    nom: 'Le cintrier',
    poste: 'La passerelle est, au gril',
    appel: '16 h 00',
    minutes: 120,
    fait: 'Charge les perches au contrepoids, releve les hauteurs au centimetre et les reporte sur la conduite. Neuf perches en service sur les vingt-quatre du gril, dont deux en vitesse lente.',
    releve: [
      ['Perches en service', '9 sur 24'],
      ['Charge la plus lourde', '310 kg'],
      ['Hauteur de travail', '17,40 m'],
      ['Tops de perche', '14'],
    ],
    zones: [
      [540, 48, 580, 30],
      [1080, 176, 44, 230],
    ],
  },
  {
    nom: 'Le sonorisateur',
    poste: 'La regie, fond de salle',
    appel: '17 h 30',
    minutes: 90,
    fait: 'Cale le systeme sur la salle vide, puis le recale a la vingtieme minute sur la salle pleine : quatre cents corps mangent les aigus et rien d autre. Douze entrees, deux retours de plateau.',
    releve: [
      ['Entrees', '12'],
      ['Retours de plateau', '2'],
      ['Recalage', '20e minute'],
      ['Niveau moyen en salle', '82 dB'],
    ],
    zones: [
      [52, 292, 124, 70],
      [516, 156, 26, 90],
    ],
  },
  {
    nom: 'L habilleuse',
    poste: 'Les loges, le passage sous plateau',
    appel: '18 h 30',
    minutes: 120,
    fait: 'Onze costumes, quatre changements rapides dont un de vingt-deux secondes dans le noir, cote jardin, en aveugle. Le passage sous le plateau est le seul chemin d un cote a l autre pendant le jeu.',
    releve: [
      ['Costumes', '11'],
      ['Changements rapides', '4'],
      ['Le plus court', '22 s'],
      ['Traversees par le dessous', '6'],
    ],
    zones: [
      [556, 516, 240, 66],
      [536, 512, 584, 12],
    ],
  },
] as const satisfies readonly Metier[]

/** Les cotes portees par la coupe — la seule facon dont cette page chiffre. */
const COTES: readonly (readonly [string, string])[] = [
  ['Hauteur sous gril', '18,00 m'],
  ['Ouverture de cadre', '10,40 m'],
  ['Profondeur de plateau', '12,60 m'],
  ['Fosse', '2,20 m'],
]

/* ============================ La feuille =============================== */

const STYLE_THEATRE = 'o-vitrine-theatre'

/**
 * Ce que les utilitaires n ont pas.
 *
 * Le rideau de l ouverture est une seule regle : deux plis qui respirent, tres
 * lentement, de part et d autre du cadre. Les portes, elles, s ouvrent au
 * survol sur une charniere posee a gauche — une rotation, pas un fondu.
 */
const CSS_THEATRE = [
  '@keyframes o-th-pli{0%,100%{transform:scaleX(1)}50%{transform:scaleX(1.014)}}',
  '@keyframes o-th-servante{0%,100%{opacity:0.55}50%{opacity:1}}',
  '[data-o-th-pli]{animation:o-th-pli 14s ease-in-out infinite;transform-origin:var(--o-th-ancre,left) center}',
  '[data-o-th-servante]{animation:o-th-servante 5s ease-in-out infinite}',
  '[data-o-th-porte] [data-o-th-battant]{transform-origin:left center;transition:transform 620ms cubic-bezier(0.22,1,0.36,1)}',
  '[data-o-th-porte]:is(:hover,:focus-visible) [data-o-th-battant]{transform:perspective(700px) rotateY(-38deg)}',
  '@media (prefers-reduced-motion:reduce){',
  '[data-o-th-pli],[data-o-th-servante]{animation:none}',
  '[data-o-th-porte] [data-o-th-battant]{transition:none}}',
].join('')

function useFeuilleTheatre(): void {
  useEffect(() => {
    if (document.getElementById(STYLE_THEATRE) !== null) return
    const feuille = document.createElement('style')
    feuille.id = STYLE_THEATRE
    feuille.textContent = CSS_THEATRE
    document.head.append(feuille)
  }, [])
}

/* ============================ Le rideau dessine ======================== */

/**
 * Le rideau de l ouverture : deux pans de velours et une frise.
 *
 * Des bandes verticales de largeur inegale — un velours n a pas de plis
 * reguliers — et une ombre portee au bas de chaque pli. Tout vient de l accent
 * de la vitrine : repeinte en bleu, la page ferme un rideau bleu.
 */
function Rideau(): ReactElement {
  const plis =
    'repeating-linear-gradient(90deg,' +
    [
      `${accentDoux(950, 88)} 0 14px`,
      `${accentDoux(900, 70)} 14px 26px`,
      `${accentDoux(950, 96)} 26px 44px`,
      `${accentDoux(800, 46)} 44px 52px`,
      `${accentDoux(950, 90)} 52px 74px`,
    ].join(',') +
    ')'
  return (
    <div
      aria-hidden="true"
      className="o-pointer-events-none o-absolute o-inset-0 o-overflow-hidden"
    >
      <div
        data-o-th-pli=""
        className="o-absolute o-bottom-0 o-left-0 o-top-0 o-w-1/4 md:o-w-1/5"
        style={{ backgroundImage: plis, '--o-th-ancre': 'left' } as CSSProperties}
      />
      <div
        data-o-th-pli=""
        className="o-absolute o-bottom-0 o-right-0 o-top-0 o-w-1/4 md:o-w-1/5"
        style={{ backgroundImage: plis, '--o-th-ancre': 'right' } as CSSProperties}
      />
      {/* La frise : le pan qui reste en haut du cadre, festonne. */}
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="o-absolute o-inset-x-0 o-top-0 o-h-24 o-w-full"
      >
        <path
          d="M0 0h1200v52c-60 0-60 34-120 34s-60-34-120-34-60 34-120 34-60-34-120-34-60 34-120 34-60-34-120-34-60 34-120 34-60-34-120-34-60 34-120 34-60-34-120-34z"
          fill={accentDoux(950, 92)}
        />
      </svg>
      {/* Le foyer unique : une poursuite posee au tiers, comme chez Spector. */}
      <div
        className="o-absolute o-inset-0"
        style={{
          background: `radial-gradient(62% 58% at 34% 42%, ${accentDoux(500, 16)} 0%, transparent 70%)`,
        }}
      />
    </div>
  )
}

/* ============================ La coupe, dessinee ======================= */

/** Les gradins, marche par marche : huit rangs qui montent vers le fond. */
function gradins(): string {
  let d = 'M452 500'
  let x = 452
  let y = 500
  for (let rang = 0; rang < 8; rang += 1) {
    x -= 49
    d += ` L${String(x)} ${String(y)}`
    y -= 18
    d += ` L${String(x)} ${String(y)}`
  }
  return `${d} L60 ${String(y)} L60 560 L452 560 Z`
}

/** Une ligne de cote, avec ses deux fleches et sa valeur. */
function Cote({
  sens,
  de,
  a,
  pose,
  valeur,
  ancre = 'start',
  part = 0.5,
}: {
  readonly sens: 'v' | 'h'
  readonly de: number
  readonly a: number
  /** L abscisse d une cote verticale, l ordonnee d une cote horizontale. */
  readonly pose: number
  readonly valeur: string
  readonly ancre?: 'start' | 'end' | 'middle'
  /** Ou la valeur se pose le long de la ligne, de 0 a 1. */
  readonly part?: number
}): ReactElement {
  const trait = accentDoux(300, 46)
  const ligne =
    sens === 'v'
      ? `M${String(pose)} ${String(de)}V${String(a)}`
      : `M${String(de)} ${String(pose)}H${String(a)}`
  const embouts =
    sens === 'v'
      ? `M${String(pose - 5)} ${String(de + 8)}L${String(pose)} ${String(de)}L${String(pose + 5)} ${String(de + 8)} M${String(pose - 5)} ${String(a - 8)}L${String(pose)} ${String(a)}L${String(pose + 5)} ${String(a - 8)}`
      : `M${String(de + 8)} ${String(pose - 5)}L${String(de)} ${String(pose)}L${String(de + 8)} ${String(pose + 5)} M${String(a - 8)} ${String(pose - 5)}L${String(a)} ${String(pose)}L${String(a - 8)} ${String(pose + 5)}`
  const tx = sens === 'v' ? pose + (ancre === 'end' ? -8 : 8) : de + (a - de) * part
  const ty = sens === 'v' ? de + (a - de) * part : pose - 9
  return (
    <g>
      <path d={ligne} stroke={trait} strokeWidth="1" fill="none" />
      <path d={embouts} stroke={trait} strokeWidth="1.4" fill="none" />
      <text
        x={tx}
        y={ty}
        textAnchor={sens === 'h' ? 'middle' : ancre}
        fontSize="21"
        fill={accent(300)}
        style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.06em' }}
      >
        {valeur}
      </text>
    </g>
  )
}

/**
 * La coupe du plateau, avec ses cotes, et les zones du metier a l acte.
 *
 * Toutes les zones sont rendues en permanence et ne changent que d opacite :
 * une zone qui apparait par un changement d arbre sauterait, et la transition
 * d une zone a la suivante est precisement ce qu on veut lire.
 */
function Coupe({ acte }: { readonly acte: number }): ReactElement {
  const marches = useMemo(gradins, [])
  const filet = accentDoux(300, 22)
  const mono: CSSProperties = {
    fontFamily: 'var(--o-font-mono)',
    letterSpacing: '0.12em',
  }
  const perches = [104, 140, 176, 212, 248, 284]

  return (
    <svg
      viewBox={`0 0 ${String(CADRE.l)} ${String(CADRE.h)}`}
      className="o-h-auto o-w-full"
      role="img"
      aria-label="Coupe du theatre : la salle et ses gradins a gauche, la fosse, le cadre de scene, le plateau, les cintres et le gril a droite, cotes portees."
    >
      <defs>
        <pattern
          id="o-th-hachure"
          width="10"
          height="10"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(38)"
        >
          <path d="M0 0v10" stroke={filet} strokeWidth="1" />
        </pattern>
      </defs>

      {/* La salle : le sol, les gradins, la cabine. */}
      <path d={marches} fill={accentDoux(900, 26)} stroke={filet} strokeWidth="1.2" />
      <rect
        x="52"
        y="292"
        width="124"
        height="70"
        fill="none"
        stroke={filet}
        strokeWidth="1.2"
      />
      <text x="58" y="284" fontSize="21" fill="var(--o-theme-muted)" style={mono}>
        CABINE
      </text>
      <text x="196" y="452" fontSize="21" fill="var(--o-theme-muted)" style={mono}>
        SALLE — 412 PLACES
      </text>

      {/* La perche de face, au-dessus de la salle. */}
      <path d="M140 210h300" stroke={filet} strokeWidth="4" />
      {[170, 230, 290, 350, 410].map((x) => (
        <path
          key={x}
          d={`M${String(x)} 210l-9 22h18z`}
          fill={accentDoux(400, 40)}
          stroke={filet}
          strokeWidth="1"
        />
      ))}
      <text x="140" y="196" fontSize="21" fill="var(--o-theme-muted)" style={mono}>
        FACE DE SALLE
      </text>

      {/* La fosse, en creux entre la salle et le plateau. */}
      <rect
        x="452"
        y="500"
        width="68"
        height="66"
        fill="url(#o-th-hachure)"
        stroke={filet}
        strokeWidth="1.2"
      />

      {/* Le mur de cadre, puis le lointain. */}
      <rect
        x="516"
        y="40"
        width="24"
        height="130"
        fill={accentDoux(900, 40)}
        stroke={filet}
        strokeWidth="1.2"
      />
      <rect
        x="1120"
        y="40"
        width="16"
        height="470"
        fill={accentDoux(900, 40)}
        stroke={filet}
        strokeWidth="1.2"
      />

      {/* Le gril, et les perches qui y pendent. */}
      <rect
        x="540"
        y="48"
        width="580"
        height="30"
        fill="url(#o-th-hachure)"
        stroke={filet}
        strokeWidth="1.2"
      />
      <text x="546" y="40" fontSize="21" fill="var(--o-theme-muted)" style={mono}>
        GRIL — 24 PERCHES
      </text>
      {perches.map((y, rang) => (
        <g key={y}>
          {[620, 830, 1040].map((x) => (
            <path
              key={x}
              d={`M${String(x)} 78V${String(y)}`}
              stroke={filet}
              strokeWidth="1"
            />
          ))}
          <path
            d={`M580 ${String(y)}h520`}
            stroke={accentDoux(300, 40)}
            strokeWidth="4"
          />
          {rang % 2 === 0 &&
            [640, 760, 880, 1000].map((x) => (
              <path
                key={x}
                d={`M${String(x)} ${String(y)}l-9 20h18z`}
                fill={accentDoux(400, 40)}
                stroke={filet}
                strokeWidth="1"
              />
            ))}
        </g>
      ))}

      {/* Le rideau, replie contre le cadre. */}
      <path
        d="M544 170c14 40 0 80 8 120 8 40-6 80 2 120 8 40 0 60 0 90"
        stroke={accent(500)}
        strokeWidth="3"
        fill="none"
      />

      {/* Le plateau, son plancher, son dessous, les loges. */}
      <path d="M536 500h584" stroke={accentDoux(300, 70)} strokeWidth="5" />
      <rect
        x="536"
        y="500"
        width="584"
        height="16"
        fill={accentDoux(900, 40)}
        stroke={filet}
        strokeWidth="1"
      />
      <rect
        x="536"
        y="516"
        width="584"
        height="72"
        fill="url(#o-th-hachure)"
        stroke={filet}
        strokeWidth="1.2"
      />
      <rect
        x="556"
        y="524"
        width="240"
        height="56"
        fill={accentDoux(900, 34)}
        stroke={filet}
        strokeWidth="1.2"
      />
      <text x="566" y="558" fontSize="21" fill="var(--o-theme-muted)" style={mono}>
        LOGES
      </text>
      <text x="830" y="558" fontSize="21" fill="var(--o-theme-muted)" style={mono}>
        DESSOUS
      </text>

      {/* Les passerelles, accrochees au lointain. */}
      {[176, 266, 356].map((y) => (
        <path key={y} d={`M1080 ${String(y)}h40`} stroke={filet} strokeWidth="3" />
      ))}
      <path d="M1098 176v230" stroke={filet} strokeWidth="1" strokeDasharray="5 6" />

      {/* Les cotes : les seuls chiffres de cette page. */}
      <Cote
        sens="v"
        de={78}
        a={500}
        pose={1172}
        valeur="18,00 m"
        ancre="end"
        part={0.14}
      />
      <Cote sens="v" de={170} a={500} pose={578} valeur="7,40 m" />
      <Cote sens="h" de={536} a={1120} pose={604} valeur="12,60 m" />
      <Cote sens="v" de={500} a={566} pose={436} valeur="2,20 m" ancre="end" />

      {/* Les zones du metier a l acte. Toutes presentes, une seule allumee. */}
      {METIERS.map((metier, rang) => (
        <g
          key={metier.nom}
          style={{ opacity: rang === acte ? 1 : 0, transition: 'opacity 520ms ease' }}
        >
          {metier.zones.map((zone) => (
            <rect
              key={zone.join('-')}
              x={zone[0]}
              y={zone[1]}
              width={zone[2]}
              height={zone[3]}
              fill={accent(500)}
              fillOpacity={0.16}
              stroke={accent(400)}
              strokeWidth="2"
            />
          ))}
        </g>
      ))}
    </svg>
  )
}

/* ============================ La conduite ============================== */

/** Un top de la conduite du soir. */
const CONDUITE: readonly (readonly [heure: string, quoi: string, qui: string])[] = [
  ['08 h 00', 'Implantation lumiere', 'Electricien'],
  ['14 h 00', 'Montage du decor', 'Machiniste'],
  ['16 h 00', 'Charge des perches', 'Cintrier'],
  ['17 h 30', 'Raccord son, salle vide', 'Sonorisateur'],
  ['18 h 30', 'Appel des loges', 'Habilleuse'],
  ['19 h 30', 'Ouverture des portes', 'Regisseur'],
  ['20 h 30', 'Le noir', 'Regisseur'],
  ['22 h 20', 'Saluts, puis demontage', 'Tout le plateau'],
]

/* ============================ La saison ================================ */

/** Une creation de la saison. */
const SAISON: readonly {
  readonly rang: string
  readonly titre: string
  readonly forme: string
  readonly duree: string
  readonly dates: string
}[] = [
  {
    rang: '01',
    titre: 'Le Mur porteur',
    forme: 'Creation maison',
    duree: '1 h 50',
    dates: '9 — 18 octobre',
  },
  {
    rang: '02',
    titre: 'Nous autres',
    forme: 'Theatre gestuel',
    duree: '1 h 05',
    dates: '7 — 9 novembre',
  },
  {
    rang: '03',
    titre: 'La Repetition generale',
    forme: 'Accueil, deux salles',
    duree: '2 h 20',
    dates: '4 — 13 decembre',
  },
  {
    rang: '04',
    titre: 'Fond de scene',
    forme: 'Carte blanche a la troupe',
    duree: '55 min',
    dates: '22 janvier',
  },
  {
    rang: '05',
    titre: 'Onze',
    forme: 'Creation maison',
    duree: '1 h 35',
    dates: '5 — 21 mars',
  },
  {
    rang: '06',
    titre: 'Le Dernier Rang',
    forme: 'Sortie de residence',
    duree: '1 h 10',
    dates: '16 — 24 mai',
  },
]

/* ============================ Les trois portes ========================= */

/** Une porte numerotee : un battant qui s ouvre sur une intention. */
function Porte3({
  numero,
  intention,
  texte,
  action,
  href,
}: {
  readonly numero: string
  readonly intention: string
  readonly texte: string
  readonly action: string
  readonly href: string
}): ReactElement {
  return (
    <a
      href={href}
      data-o-th-porte=""
      className="o-block o-no-underline focus:o-ring"
      style={{ color: 'inherit' }}
    >
      <div
        className="o-relative o-overflow-hidden"
        style={{ boxShadow: `inset 0 0 0 1px ${accentDoux(300, 26)}` }}
      >
        {/* Ce qu il y a derriere la porte, visible quand le battant s ecarte. */}
        <div
          className="o-flex o-h-full o-flex-col o-justify-end o-gap-3 o-p-6"
          style={{ minHeight: '19rem', backgroundColor: accentDoux(900, 34) }}
        >
          <p className="o-m-0 o-text-sm o-leading-relaxed o-text-zinc-300">{texte}</p>
          <p
            className="o-m-0 o-inline-flex o-items-center o-gap-2 o-font-mono o-text-xs o-uppercase o-tracking-widest"
            style={{ color: encreSurSombre() }}
          >
            {action} <Icon icon={ArrowRight} size={14} aria-hidden="true" />
          </p>
        </div>

        {/* Le battant. */}
        <div
          data-o-th-battant=""
          aria-hidden="true"
          className="o-absolute o-inset-0 o-flex o-flex-col o-justify-between o-p-6"
          style={{
            backgroundColor: 'var(--o-palette-zinc-950)',
            backgroundImage: `repeating-linear-gradient(90deg, ${accentDoux(900, 26)} 0 3px, transparent 3px 22px)`,
            boxShadow: `inset 0 0 0 1px ${accentDoux(300, 22)}, inset -14px 0 34px ${accentDoux(950, 90)}`,
          }}
        >
          <span
            className="o-tabular-nums"
            style={{
              ...affiche('m', 800),
              fontSize: 'clamp(3.5rem, 8vw, 6rem)',
              lineHeight: 0.8,
              color: accent(500),
            }}
          >
            {numero}
          </span>
          <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
            {intention}
          </span>
          {/* La poignee, a hauteur d homme. */}
          <span
            className="o-absolute o-right-4 o-top-1/2 o-block o-h-6 o-w-1.5"
            style={{ backgroundColor: accentDoux(300, 60) }}
          />
        </div>
      </div>
      <p className="o-m-0 o-mt-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
        Porte {numero} — {intention}
      </p>
    </a>
  )
}

/* ============================ La frise du pied ========================= */

/** Un pictogramme de metier, trace au filet — la forme P35. */
const PICTOS: readonly { readonly nom: string; readonly d: string }[] = [
  // Un projecteur, sur sa lyre.
  { nom: 'Lumiere', d: 'M14 10h18v20H14zM32 14l12-6v24l-12-6zM23 30v10M14 40h18' },
  // Une perche et ses deux fils.
  { nom: 'Cintres', d: 'M8 10v34M48 10v34M8 22h40M16 10v12M40 10v12' },
  // Un casque d intercom.
  {
    nom: 'Regie',
    d: 'M12 30v-6a16 16 0 0 1 32 0v6M12 30h8v14h-8zM36 30h8v14h-8zM28 44h10',
  },
  // Une aiguille et son fil.
  {
    nom: 'Costumes',
    d: 'M10 44L40 14M40 14l6-6M36 10a6 6 0 1 0 8 8M14 40c-6 4-6 8-2 8s4-6 2-8',
  },
  // Une cle a molette.
  { nom: 'Plateau', d: 'M14 12a10 10 0 0 0 12 14l18 18-6 6-18-18A10 10 0 0 0 8 20z' },
  // Un fauteuil de salle, vu de cote.
  { nom: 'Accueil', d: 'M12 44V20a8 8 0 0 1 16 0v8h14v16M28 28h14M18 44v-6' },
]

/* ============================ La page ================================== */

const NAVIGATION = [
  ['#plateau', 'Le plateau'],
  ['#conduite', 'La conduite'],
  ['#saison', 'La saison'],
  ['#portes', 'Venir'],
] as const

export default function Page(): ReactElement {
  const polices = usePolices('jakarta')
  useFeuilleTheatre()
  const { reduced } = useMotionState()
  const plateau = useRef<HTMLDivElement>(null)

  // Le chiffre du dernier acte : la somme des presences, pas une estimation.
  const { heures, minutes, rapport } = useMemo(() => {
    const total = METIERS.reduce((somme, metier) => somme + metier.minutes, 0)
    return {
      heures: Math.floor(total / 60),
      minutes: total % 60,
      rapport: Math.round(total / 110),
    }
  }, [])

  return (
    <Porte forme="trou" marque="Coulisse">
      <div className="o-relative" style={{ ...nuit('zinc'), ...polices }}>
        {/* La poursuite : elle ne vaut que sur le plateau, pas sur la page. */}
        {!reduced && (
          <CursorHalo
            host={plateau}
            haloSize={110}
            dotSize={4}
            speed={6}
            hoverScale={1.3}
            style={{ color: accent(400) }}
          />
        )}

        {/* ================= L ouverture : rideau ferme =================== */}
        <header
          className="o-relative o-isolate o-flex o-flex-col o-overflow-hidden"
          style={{ minHeight: `calc(100vh - ${String(CHROME)}px)` }}
        >
          <Rideau />
          <Grain opacite={0.07} />

          <BarreCoins
            marque="Coulisse"
            liens={NAVIGATION}
            droite="Scene conventionnee — Villeneuve-sur-Lot"
          />

          <div className="o-relative o-z-20 o-flex o-grow o-flex-col o-justify-between o-gap-10 o-px-6 o-pb-12 md:o-px-10">
            <div className="o-max-w-4xl">
              <Surgit>
                <Etiquette>Saison 26 — 27 · six creations · 412 places</Etiquette>
              </Surgit>
              <TitreVague
                delai={160}
                cadence={0}
                className="o-m-0 o-mt-8 o-uppercase o-text-zinc-50"
                style={{
                  ...affiche('xl', 800),
                  fontSize: 'clamp(3.25rem, 15vw, 13rem)',
                  lineHeight: 0.78,
                  letterSpacing: '-0.055em',
                }}
              >
                Coulisse
              </TitreVague>
              <Surgit
                delai={520}
                as="p"
                className="o-m-0 o-mt-8 o-max-w-xl o-text-lg o-leading-relaxed o-text-zinc-300"
              >
                Le theatre de la ville, et le seul plateau du departement ou l on peut
                encore monter un decor a l italienne.
              </Surgit>
              <Surgit delai={600} className="o-mt-8">
                <Actions
                  pleine={['#portes', 'Prendre une place']}
                  fantome={['#saison', 'Les six creations']}
                />
              </Surgit>
            </div>

            <div className="o-flex o-flex-wrap o-items-end o-justify-between o-gap-8">
              <Surgit delai={640}>
                {/* La servante : la lampe qu on laisse allumee sur un plateau vide. */}
                <div
                  className="o-relative o-inline-block o-px-7 o-py-5"
                  style={{ backgroundColor: accentDoux(950, 82) }}
                >
                  <NeonBorder
                    color="--o-vitrine-500"
                    radius={0}
                    thickness={1}
                    glow={80}
                    duration={5200}
                  />
                  <p className="o-relative o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-300">
                    Ce soir, 20 h 30
                    <br />
                    <span className="o-text-lg o-text-zinc-50">Le Mur porteur</span>
                    <br />
                    <span data-o-th-servante="" style={{ color: encreSurSombre() }}>
                      ● La servante est allumee
                    </span>
                  </p>
                </div>
              </Surgit>

              <Surgit
                delai={720}
                as="p"
                className="o-m-0 o-max-w-xs o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400 md:o-text-right"
              >
                Cette page ne montre pas la salle.
                <br />
                Elle montre ce qu il y a derriere.
                <br />
                <a
                  href="#plateau"
                  className="o-inline-flex o-items-center o-gap-2 o-no-underline focus:o-ring"
                  style={{ color: encreSurSombre() }}
                >
                  Ouvrir la coupe <Icon icon={ArrowRight} size={14} aria-hidden="true" />
                </a>
              </Surgit>
            </div>
          </div>
        </header>

        <main>
          {/* ================= Le manifeste, moitie eteint ================ */}
          <section className="o-border-t o-border-white-10 o-px-6 o-py-24 md:o-px-10 md:o-py-32">
            <div className="o-mx-auto o-max-w-6xl o-grid o-gap-10 md:o-grid-cols-12">
              <div className="md:o-col-span-3">
                <Indice rang="01">Le metier</Indice>
              </div>
              <div className="o-min-w-0 md:o-col-span-9">
                <Reveal>
                  <Manifeste eteint="Ce que le public voit dure une heure cinquante.">
                    Ce qui le rend possible commence a huit heures du matin, et se demonte
                    a une heure.
                  </Manifeste>
                </Reveal>
              </div>
            </div>
          </section>

          {/* ================= Le mecanisme : la coupe epinglee =========== */}
          <section id="plateau" className="o-scroll-mt-24" ref={plateau}>
            <Epingle ecrans={METIERS.length + 1} actes={METIERS.length}>
              {(acte: number) => {
                const metier = METIERS[acte] ?? METIERS[0]
                return (
                  <div className="o-flex o-h-full o-flex-col o-px-4 o-pb-4 o-pt-6 md:o-px-10 md:o-pb-8">
                    <div className="o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-4">
                      <Indice rang="02">La coupe du plateau</Indice>
                      <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
                        {String(acte + 1).padStart(2, '0')} /{' '}
                        {String(METIERS.length).padStart(2, '0')} — appel {metier.appel}
                      </p>
                    </div>

                    <div className="o-mt-4 o-grid o-min-h-0 o-grow o-items-center o-gap-6 md:o-grid-cols-12 md:o-gap-10">
                      <div className="o-min-w-0 md:o-col-span-8">
                        <Coupe acte={acte} />
                      </div>

                      <div className="o-min-w-0 md:o-col-span-4">
                        <h2
                          className="o-m-0 o-uppercase o-text-zinc-50"
                          style={{
                            ...affiche('m', 800),
                            fontSize: 'clamp(1.6rem, 3.4vw, 3rem)',
                            lineHeight: 0.88,
                            letterSpacing: '-0.04em',
                          }}
                        >
                          {metier.nom}
                        </h2>
                        <p
                          className="o-m-0 o-mt-2 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                          style={{ color: encreSurSombre() }}
                        >
                          {metier.poste}
                        </p>
                        <p className="o-m-0 o-mt-5 o-max-w-md o-text-sm o-leading-relaxed o-text-zinc-300">
                          {metier.fait}
                        </p>
                        <dl className="o-m-0 o-mt-6 o-grid o-grid-cols-2 o-gap-x-6">
                          {metier.releve.map(([quoi, valeur]) => (
                            <div
                              key={quoi}
                              className="o-min-w-0 o-border-t o-border-white-10 o-py-2"
                            >
                              <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
                                {quoi}
                              </dt>
                              <dd className="o-m-0 o-mt-1 o-font-mono o-text-sm o-tabular-nums o-text-zinc-50">
                                {valeur}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    </div>

                    {/* La reglette des actes, et les cotes du plan, ensemble. */}
                    <div className="o-mt-4 o-flex o-flex-wrap o-items-center o-justify-between o-gap-4 o-border-t o-border-white-10 o-pt-4">
                      <ol className="o-m-0 o-flex o-list-none o-flex-wrap o-gap-2 o-p-0">
                        {METIERS.map((autre, rang) => (
                          <li key={autre.nom}>
                            <span
                              className="o-block o-h-1 o-w-10"
                              style={{
                                backgroundColor:
                                  rang === acte ? accent(500) : 'var(--o-theme-line)',
                              }}
                            />
                            <span className="o-sr-only">{autre.nom}</span>
                          </li>
                        ))}
                      </ol>
                      <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
                        {COTES.map(([quoi, valeur]) => `${quoi} ${valeur}`).join(' · ')}
                      </p>
                    </div>
                  </div>
                )
              }}
            </Epingle>
          </section>

          {/* ================= Le total, en un seul ecran ================== */}
          <section
            className="o-px-6 o-py-24 md:o-px-10 md:o-py-32"
            style={{ backgroundColor: accentDoux(950, 70) }}
          >
            <div className="o-mx-auto o-max-w-6xl">
              <Reveal>
                <p
                  className="o-m-0 o-max-w-4xl o-text-balance o-uppercase o-text-zinc-50"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.75rem, 4.4vw, 4rem)',
                    lineHeight: 0.95,
                  }}
                >
                  <ShineText
                    from="var(--o-palette-zinc-50)"
                    shine={accent(400)}
                    duration={4200}
                  >
                    {`${String(heures)} h ${String(minutes).padStart(2, '0')} de plateau pour 1 h 50 de spectacle.`}
                  </ShineText>
                </p>
              </Reveal>
              <Reveal delay={90}>
                <p className="o-m-0 o-mt-8 o-max-w-xl o-text-base o-leading-relaxed o-text-zinc-400">
                  Soit {rapport} fois la duree du spectacle, chaque jour de premiere, pour
                  cinq personnes appelees a des heures differentes. C est la somme des
                  cinq presences ci-dessus, et rien d autre.
                </p>
              </Reveal>
            </div>
          </section>

          {/* ================= La conduite du soir ======================== */}
          <section
            id="conduite"
            className="o-scroll-mt-24 o-border-t o-border-white-10 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
          >
            <div className="o-mx-auto o-max-w-6xl">
              <Reveal>
                <Indice rang="03">La conduite du soir</Indice>
              </Reveal>
              <Reveal delay={80}>
                <h2
                  className="o-m-0 o-mt-6 o-max-w-3xl o-uppercase o-text-zinc-50"
                  style={{
                    ...affiche('m', 800),
                    fontSize: 'clamp(1.85rem, 4.4vw, 3.75rem)',
                    lineHeight: 0.9,
                    letterSpacing: '-0.04em',
                  }}
                >
                  Huit tops, et le regisseur qui les donne.
                </h2>
              </Reveal>

              <ol className="o-m-0 o-mt-14 o-list-none o-border-t o-border-white-10 o-p-0">
                {CONDUITE.map(([heure, quoi, qui], rang) => (
                  <li
                    key={heure}
                    className="o-grid o-items-baseline o-gap-3 o-border-b o-border-white-10 o-py-5 md:o-grid-cols-12 md:o-gap-8"
                  >
                    <span
                      className="o-font-mono o-text-sm o-tabular-nums md:o-col-span-2"
                      style={{ color: encreSurSombre() }}
                    >
                      {heure}
                    </span>
                    <span
                      className="o-min-w-0 o-text-lg o-text-zinc-50 md:o-col-span-6"
                      style={{ fontWeight: 500 }}
                    >
                      {quoi}
                    </span>
                    <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 md:o-col-span-3">
                      {qui}
                    </span>
                    <span
                      aria-hidden="true"
                      className="o-font-mono o-text-xs o-tabular-nums o-text-zinc-500 md:o-col-span-1 md:o-text-right"
                    >
                      {String(rang + 1).padStart(2, '0')}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* ================= La saison ================================== */}
          <section
            id="saison"
            className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
            style={{ backgroundColor: accentDoux(950, 70) }}
          >
            <div className="o-mx-auto o-max-w-6xl">
              <Reveal>
                <Indice rang="04">La saison</Indice>
              </Reveal>
              <ol className="o-m-0 o-mt-12 o-list-none o-border-t o-border-white-10 o-p-0">
                {SAISON.map((piece) => (
                  <li
                    key={piece.rang}
                    className="o-grid o-items-end o-gap-4 o-border-b o-border-white-10 o-py-8 md:o-grid-cols-12 md:o-gap-8"
                  >
                    <span
                      aria-hidden="true"
                      className="o-tabular-nums o-text-zinc-500 md:o-col-span-2"
                      style={{
                        ...affiche('m', 800),
                        fontSize: 'clamp(2rem, 4vw, 3.25rem)',
                        lineHeight: 0.8,
                      }}
                    >
                      {piece.rang}
                    </span>
                    <h3
                      className="o-m-0 o-min-w-0 o-uppercase o-text-zinc-50 md:o-col-span-6"
                      style={{
                        ...affiche('m', 800),
                        fontSize: 'clamp(1.35rem, 3vw, 2.5rem)',
                        lineHeight: 0.92,
                        letterSpacing: '-0.03em',
                      }}
                    >
                      {piece.titre}
                    </h3>
                    <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400 md:o-col-span-4 md:o-text-right">
                      {piece.forme}
                      <br />
                      <span style={{ color: encreSurSombre() }}>
                        {piece.dates}
                      </span> · {piece.duree}
                    </p>
                  </li>
                ))}
              </ol>
            </div>
          </section>

          {/* ================= A34 : trois portes numerotees =============== */}
          <section
            id="portes"
            className="o-scroll-mt-24 o-border-t o-border-white-10 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
          >
            <div className="o-mx-auto o-max-w-6xl">
              <Reveal>
                <Indice rang="05">Venir</Indice>
              </Reveal>
              <Reveal delay={80}>
                <h2
                  className="o-m-0 o-mt-6 o-max-w-2xl o-uppercase o-text-zinc-50"
                  style={{
                    ...affiche('m', 800),
                    fontSize: 'clamp(1.85rem, 4.4vw, 3.75rem)',
                    lineHeight: 0.9,
                    letterSpacing: '-0.04em',
                  }}
                >
                  Trois portes, une par intention.
                </h2>
              </Reveal>
              <div className="o-mt-14 o-grid o-gap-6 md:o-grid-cols-3">
                <Porte3
                  numero="01"
                  intention="Voir"
                  href="#saison"
                  texte="Six creations, de 55 minutes a 2 h 20. Placement libre, le dernier rang est a douze euros, et la salle ouvre trois quarts d heure avant."
                  action="Prendre une place"
                />
                <Porte3
                  numero="02"
                  intention="Repeter ici"
                  href="#conduite"
                  texte="Le plateau est libre neuf semaines par an pour des compagnies du departement. On fournit le gril charge, le son, et un regisseur pour les trois derniers jours."
                  action="Demander une residence"
                />
                <Porte3
                  numero="03"
                  intention="Travailler avec nous"
                  href="#plateau"
                  texte="Deux postes de machiniste en intermittence, un apprentissage de cintrier a partir de janvier. On apprend sur le plateau, pas ailleurs."
                  action="Voir les postes"
                />
              </div>
            </div>
          </section>
        </main>

        {/* ================= P35 : la frise des metiers =================== */}
        <footer className="o-border-t o-border-white-10 o-px-6 o-py-16 md:o-px-10">
          <div className="o-mx-auto o-max-w-6xl">
            <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
              Les six metiers de la maison
            </p>
            <ul
              className="o-m-0 o-mt-8 o-grid o-list-none o-gap-px o-p-0 o-grid-cols-2 sm:o-grid-cols-3 lg:o-grid-cols-6"
              style={{ backgroundColor: 'var(--o-theme-line)' }}
            >
              {PICTOS.map((picto) => (
                <li
                  key={picto.nom}
                  className="o-min-w-0 o-px-4 o-py-6"
                  style={{ backgroundColor: 'var(--o-theme-bg)' }}
                >
                  <svg viewBox="0 0 56 56" className="o-h-12 o-w-12" aria-hidden="true">
                    <path
                      d={picto.d}
                      fill="none"
                      stroke={accent(400)}
                      strokeWidth="2.2"
                      strokeLinecap="square"
                    />
                  </svg>
                  <p className="o-m-0 o-mt-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-50">
                    {picto.nom}
                  </p>
                </li>
              ))}
            </ul>

            <div className="o-mt-12 o-flex o-flex-wrap o-items-end o-justify-between o-gap-6 o-border-t o-border-white-10 o-pt-8">
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-500">
                Coulisse — 4 place du Marche-aux-Grains, Villeneuve-sur-Lot
                <br />
                Billetterie du mardi au samedi, 14 h — 19 h
                <br />© 2026 — scene conventionnee, licences 1-2-3
              </p>
              <p className="o-m-0">
                <a
                  href="#portes"
                  className="o-inline-flex o-items-center o-gap-2 o-font-mono o-text-sm o-uppercase o-tracking-widest o-no-underline focus:o-ring"
                  style={{ color: encreSurSombre() }}
                >
                  billetterie@coulisse-theatre.fr{' '}
                  <Icon icon={ArrowUpRight} size={15} aria-hidden="true" />
                </a>
              </p>
            </div>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
