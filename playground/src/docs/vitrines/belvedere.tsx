/**
 * Belvedere — la maison du Belvedere, a Manigod.
 *
 * ## D ou elle vient
 *
 * C est le portage de `templates/starter-next/` : la page d accueil AERRA du
 * socle Next, une maison en bois a vendre, un seul bien, un seul mandat. La
 * composition, la copie et l ordre des ecrans sont ceux de la source ; la pile
 * — react-spring, Lenis, spring-text-engine, three.js avec un GLB —
 * est remplacee par le moteur et la trousse des vitrines.
 *
 * ## Ce que la page fait
 *
 * - **la maison est dessinee** : les rendus de la source sont interdits, et le
 *   dossier de photographies ne montre aucune maison en bois. Deux volumes en
 *   porte-a-faux a bardage brule, grandes baies allumees de l interieur, toit
 *   en zinc, au crepuscule — en SVG, une seule geometrie qui sert au heros, a
 *   la maison, a la situation et au contact, en rendu ou au trait ;
 * - **le sigle ODORO en volume** tourne et traverse la section des acquereurs
 *   au fil du defilement, derriere une grille de verre dont trois cases sont
 *   vides. L angle poursuit la valeur de defilement avec une constante de
 *   temps de 0,12 s, comme dans la source ;
 * - **la revelation au curseur** : sur la situation, le trait est sous le
 *   rendu, et le curseur ouvre une fenetre qui le montre ;
 * - **le rideau** reprend le chronometrage de la source : un compteur, 1 500 ms
 *   au moins, puis le heros arrive a travers le rideau qui part.
 *
 * ## Le fond
 *
 * F-statique : blanc franc, et deux bandes de crepuscule — le ciel de la source,
 * une rampe d ardoise teintee par l accent — pour les ecrans qui portaient une
 * photographie. Une seule surface three.js, dans les acquereurs.
 *
 * @module
 */

import { useMotionState, useScrollScrub } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import { ArrowRight } from '@odoro-cli/icons/outline'
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

import { CountUp } from '@/odoro/text/CountUp.jsx'
import { SplitReveal } from '@/odoro/text/SplitReveal.jsx'

import { nuit } from './communs.jsx'
import { accent } from './palettes.js'
import { affiche, CHROME, Coin, Porte, Surgit, usePolices, verre } from './marche.jsx'
import { Aimant, Eclate, Parallaxe } from './scene.jsx'
import { eclairer, Volume } from './volume.jsx'

/** La hauteur d un ecran sous les barres de la documentation. */
const ECRAN = `calc(100vh - ${String(CHROME)}px)`

/* ============================ Le chronometrage ========================= */

/**
 * Le rideau de la source (`lib/springs/preloader-timing.ts`) : un compteur
 * qui tient 1 500 ms au moins, puis le heros qui arrive en cinq temps. Les
 * retards sont mesures depuis le depart du rideau, comme la-bas.
 */
const RIDEAU_MINIMUM_MS = 1500
const RIDEAU_REDUIT_MS = 300
const ENTREE = {
  motMarque: 120,
  titre: 260,
  sousTitre: 420,
  action: 540,
  legende: 660,
} as const

/* ============================ Le sigle ================================= */

/**
 * L orange du sigle ODORO. C est la marque, pas la vitrine : il ne se reteinte
 * pas avec la palette, pas plus que le sigle de la barre ne le fait dans la
 * source.
 */
const ORANGE = '#f97316'

/** Rayon interieur du sigle, en part du rayon exterieur. */
const SIGLE_INTERIEUR = 0.7

/** Un anneau du sigle : angle droit en haut a gauche, arc de 270 degres. */
function anneau(cx: number, cy: number, r: number): string {
  return `M${String(cx - r)} ${String(cy - r)}H${String(cx)}A${String(r)} ${String(r)} 0 1 1 ${String(cx - r)} ${String(cy)}Z`
}

/** Le sigle entier, exterieur et interieur, a poser avec `evenodd`. */
function traceSigle(taille: number): string {
  const r = taille / 2
  return `${anneau(r, r, r)} ${anneau(r, r, r * SIGLE_INTERIEUR)}`
}

/** Le sigle en SVG : de la geometrie, jamais une image. */
function Sigle({
  className,
  style,
}: {
  readonly className?: string
  readonly style?: CSSProperties
}): ReactElement {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      style={style}
      aria-hidden="true"
      focusable="false"
    >
      <path fillRule="evenodd" d={traceSigle(100)} fill="currentColor" />
    </svg>
  )
}

/* ============================ La copie ================================= */

const NAVIGATION = [
  ['#maison', 'La maison'],
  ['#lieu', 'Le lieu'],
  ['#achat', 'Achat'],
  ['#visiter', 'Visiter'],
] as const

const HEROS = {
  eteint: 'Une maison en bois,',
  allume: 'la vallee en face',
  sousTitre:
    'Manigod, la maison du Belvedere. 214 m2 habitables, 4 chambres, terrain de 1 800 m2. 1 340 000 EUR, honoraires inclus.',
  action: 'Fixer une visite',
  motMarque: 'odoro',
  legende: ['Construite en 2021, DPE A, fibre,', '12 minutes du centre, route deneigee'],
} as const

const MAISON = {
  surtitre: 'Le Belvedere',
  corps:
    '214 m2 habitables, 4 chambres, 2 salles de bain. Bardage en bois brule, grands vitrages, toiture en zinc, 2,80 m sous plafond. Sejour traversant plein sud, ouvert sur la vallee. 12 minutes du centre, route deneigee toute l annee.',
  action: 'Visiter le bien',
  misesEnAvant: [
    {
      glyphe: 'cercle',
      titre: 'DPE classe A',
      texte: 'Construite en 2021, chauffage par pompe a chaleur, fibre optique.',
    },
    {
      glyphe: 'triangle',
      titre: 'Le terrain',
      texte: '1 800 m2 en pleine propriete et 46 m2 de terrasse.',
    },
  ],
  citation: 'Un mandat par bien, pas deux.',
  signature: 'L agent qui a rentre le bien, 4 mai 2026',
  planche: 'La maison au trait, deux volumes en porte-a-faux',
} as const

const CHIFFRES = {
  surtitre: 'Chiffres cles',
  titre: 'La maison du Belvedere a ete construite en 2021.',
  sousTitre:
    '1 800 m2 de terrain en pleine propriete, 4 chambres, 2 salles de bain, DPE A, pompe a chaleur',
  nombres: [
    { valeur: 46, quoi: 'm2 de terrasse' },
    { valeur: 214, quoi: 'm2 habitables' },
    { valeur: 12, quoi: 'minutes du centre' },
  ],
} as const

const SITUATION = {
  surtitre: 'Situation',
  corps:
    '12 minutes du centre par la departementale, deneigee toute l annee. Premiers commerces a 4 km, ecole a 6 minutes, college a 9. Gare a 20 minutes, entree d autoroute a 25. Fibre raccordee. Terrain de 1 800 m2 en pleine propriete, sans vis-a-vis au sud.',
  action: 'Demander la visite',
  indication: 'Passez le curseur pour voir la maison au trait',
} as const

/** Les six profils, et la case de chacun dans la grille de trois par trois. */
const ACQUEREURS = {
  surtitre: 'Acquereurs',
  intro:
    'Six profils, ecrits noir sur blanc avant le premier rendez-vous. Une maison de 214 m2, un seul mandat, jamais un stagiaire a la visite : mieux vaut savoir tout de suite si elle est pour vous.',
  profils: [
    {
      rang: '01',
      titre: 'Famille d ici',
      texte:
        'Quatre chambres, deux salles de bain. Le centre et ses ecoles a 12 minutes.',
      case: 0,
    },
    {
      rang: '02',
      titre: 'Bureau a domicile',
      texte:
        'Fibre en place, 214 m2 habitables, 2,80 m sous plafond : la place d un bureau.',
      case: 1,
    },
    {
      rang: '03',
      titre: 'Sortir de la ville',
      texte: 'Terrain de 1 800 m2 en pleine propriete. Route deneigee toute l annee.',
      case: 3,
    },
    {
      rang: '04',
      titre: 'La vue',
      texte: 'Terrasse de 46 m2 au-dessus de la vallee. Sejour traversant, plein sud.',
      case: 5,
    },
    {
      rang: '05',
      titre: 'Sans travaux',
      texte:
        'Construite en 2021, DPE A, pompe a chaleur : rien a reprendre avant d emmenager.',
      case: 7,
    },
    {
      rang: '06',
      titre: 'La liste d attente',
      texte:
        'Vous etes prevenu avant la mise en ligne : 140 biens vendus, 47 jours en moyenne.',
      case: 8,
    },
  ],
  sigle:
    'Le sigle Odoro, angle carre et arc de 270 degres, tournant au fil du defilement',
} as const

const CONTACT = {
  surtitre: 'Contact',
  eteint: 'Venez voir la maison,',
  allume: 'pas une plaquette',
  corps:
    'Laissez vos coordonnees. Nous convenons d une visite avec la personne qui suit la maison depuis le mandat. Reponse le jour meme.',
  champs: [
    { nom: 'nom', etiquette: 'Nom', type: 'text', completion: 'name' },
    { nom: 'telephone', etiquette: 'Tel.', type: 'tel', completion: 'tel' },
    { nom: 'courriel', etiquette: 'Email', type: 'email', completion: 'email' },
  ],
  action: 'Fixer la visite',
} as const

/* ============================ La feuille =============================== */

const FEUILLE_ID = 'o-vitrine-belvedere'

/**
 * Ce que les utilitaires n ont pas : le survol du bouton (une lueur qui
 * balaie, deux fleches qui se relaient), le tour du sigle de repli, l encre
 * des champs. Coupe sous mouvement reduit.
 */
const FEUILLE = [
  '@keyframes bv-tour{to{transform:rotate(360deg)}}',
  // Ce que le systeme ne decline pas : les echelles de noir et de blanc en
  // `dark:`, et `o-inset-x-*` au-dela de zero. `light-dark()` fait la
  // bascule, et les points d arret sont ceux du systeme.
  '.bv-voile{background-color:light-dark(rgb(255 255 255/.8),rgb(0 0 0/.7))}',
  '.bv-filet-plein{background-color:light-dark(rgb(0 0 0/.1),rgb(255 255 255/.1))}',
  '.bv-filet-bord{border-top:1px solid light-dark(rgb(0 0 0/.1),rgb(255 255 255/.1))}',
  '.bv-bande{left:1.25rem;right:1.25rem}',
  '.bv-carton{left:1rem;right:1rem}',
  '@media (min-width:768px){.bv-carton{left:auto;right:auto}}',
  '[data-bv-sigle-repli]{animation:bv-tour 14s linear infinite}',
  '[data-bv-bouton]{transition:transform 250ms cubic-bezier(0.2,0,0,1)}',
  '[data-bv-bouton]:hover{transform:translateY(-1px)}',
  '[data-bv-lueur]{transform:translateX(0);transition:transform 700ms cubic-bezier(0.2,0,0,1)}',
  '[data-bv-bouton]:hover [data-bv-lueur]{transform:translateX(420%)}',
  '[data-bv-fleche-a],[data-bv-fleche-b]{transition:transform 250ms cubic-bezier(0.2,0,0,1)}',
  '[data-bv-fleche-b]{transform:translateX(-220%)}',
  '[data-bv-bouton]:hover [data-bv-fleche-a]{transform:translateX(220%)}',
  '[data-bv-bouton]:hover [data-bv-fleche-b]{transform:translateX(0)}',
  '[data-bv-champ]::placeholder{color:#3f3f46;opacity:1}',
  '[data-bv-champ]:focus::placeholder{color:#71717a}',
  '@media (prefers-reduced-motion:reduce){[data-bv-sigle-repli]{animation:none}[data-bv-bouton],[data-bv-lueur],[data-bv-fleche-a],[data-bv-fleche-b]{transition:none}}',
].join('')

function useFeuille(): void {
  useEffect(() => {
    if (document.getElementById(FEUILLE_ID) !== null) return
    const style = document.createElement('style')
    style.id = FEUILLE_ID
    style.textContent = FEUILLE
    document.head.append(style)
  }, [])
}

/* ============================ L entree dans le champ =================== */

/**
 * Vu, une fois : un rappel a poser en `ref`, et un booleen.
 *
 * Sous mouvement reduit, vu d emblee : rien de ce qui se revele a l entree ne
 * doit attendre un defilement qui n animera rien.
 */
function useVu(seuil = 0.2): [(element: Element | null) => void, boolean] {
  const { reduced } = useMotionState()
  const [vu, setVu] = useState(false)
  const [element, setElement] = useState<Element | null>(null)
  useEffect(() => {
    if (element === null || vu) return
    if (reduced || typeof IntersectionObserver === 'undefined') {
      setVu(true)
      return
    }
    const observateur = new IntersectionObserver(
      (entrees) => {
        if (entrees.some((e) => e.isIntersecting)) {
          setVu(true)
          observateur.disconnect()
        }
      },
      { threshold: seuil },
    )
    observateur.observe(element)
    return () => {
      observateur.disconnect()
    }
  }, [element, vu, reduced, seuil])
  return [setElement, vu]
}

/** Une revelation a l entree dans le champ : flou et montee, une fois. */
function Arrive({
  delai = 0,
  distance = 32,
  className,
  style,
  children,
}: {
  readonly delai?: number
  readonly distance?: number
  readonly className?: string
  readonly style?: CSSProperties
  readonly children: ReactNode
}): ReactElement {
  const { reduced } = useMotionState()
  const [ref, vu] = useVu()
  const courbe = 'cubic-bezier(0.16, 1, 0.3, 1)'
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: vu ? 1 : 0,
        transform: vu || reduced ? 'none' : `translate3d(0, ${String(distance)}px, 0)`,
        filter: vu || reduced ? 'none' : 'blur(12px)',
        transition: reduced
          ? `opacity 300ms ease ${String(delai)}ms`
          : `opacity 500ms ${courbe} ${String(delai)}ms, transform 1100ms ${courbe} ${String(delai)}ms, filter 1100ms ${courbe} ${String(delai)}ms`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}

/**
 * Un titre revele mot a mot a l entree dans le champ.
 *
 * `SplitReveal` joue au montage : il n est donc monte qu une fois le titre
 * dans le champ, et un jumeau invisible tient la place avant. C est ce que
 * faisait le moteur de texte de la source, mot par mot, 22 ms entre deux.
 */
function TitreEnVue({
  children,
  as = 'h2',
  className,
  style,
  cadence = 22,
}: {
  readonly children: string
  readonly as?: 'h2' | 'p'
  readonly className?: string
  readonly style?: CSSProperties
  readonly cadence?: number
}): ReactElement {
  const [ref, vu] = useVu(0.3)
  const Balise = as
  return (
    <div ref={ref}>
      {vu ? (
        <SplitReveal
          as={as}
          by="words"
          stagger={cadence}
          duration={700}
          distance={28}
          className={className}
          style={style}
        >
          {children}
        </SplitReveal>
      ) : (
        <Balise className={className} style={{ ...style, visibility: 'hidden' }}>
          {children}
        </Balise>
      )}
    </div>
  )
}

/* ============================ Les petites pieces ======================= */

/** Le surtitre : un point, puis un mot ou deux, en mono. */
function Surtitre({
  children,
  sombre = false,
  as: Balise = 'p',
  id,
  className = '',
}: {
  readonly children: ReactNode
  readonly sombre?: boolean
  readonly as?: 'p' | 'h2'
  readonly id?: string
  readonly className?: string
}): ReactElement {
  return (
    <Balise
      id={id}
      className={`o-m-0 o-flex o-items-center o-gap-2 o-font-mono o-text-xs o-uppercase o-tracking-widest ${
        sombre ? 'o-text-white' : 'o-text-zinc-950 dark:o-text-zinc-50'
      } ${className}`}
    >
      <span
        aria-hidden="true"
        className="o-size-1.5 o-shrink-0 o-rounded-full"
        style={{ backgroundColor: 'currentcolor' }}
      />
      {children}
    </Balise>
  )
}

/**
 * Le seul bouton de la page : une gelule noire a coins de 8 px, la fleche
 * dans une case blanche. Au survol, une lueur balaie la gelule et la fleche
 * se relaie — la seconde arrive par la gauche quand la premiere sort.
 *
 * @param surImage Vrai sur une bande de crepuscule : le bouton reste noir a
 *   case blanche dans les deux themes, puisque l image ne change pas.
 */
function Bouton({
  href,
  children,
  surImage = false,
  className = '',
}: {
  readonly href?: string
  readonly children: ReactNode
  readonly surImage?: boolean
  readonly className?: string
}): ReactElement {
  const coque = `o-relative o-flex o-h-12 o-items-center o-justify-between o-gap-6 o-overflow-hidden o-rounded-lg o-py-1 o-pl-6 o-pr-1 o-text-sm o-font-medium o-no-underline focus:o-ring ${
    surImage
      ? 'o-bg-zinc-950 o-text-white'
      : 'o-bg-zinc-950 o-text-white dark:o-bg-zinc-50 dark:o-text-zinc-950'
  } ${className}`
  const contenu = (
    <>
      <span
        aria-hidden="true"
        data-bv-lueur=""
        className="o-pointer-events-none o-absolute o-inset-y-0 o-w-1/3 o-skew-x-12 o-bg-white-20 o-blur-sm"
        style={{ left: '-33%' }}
      />
      <span className="o-relative o-whitespace-nowrap">{children}</span>
      <span
        className={`o-relative o-flex o-size-10 o-shrink-0 o-items-center o-justify-center o-overflow-hidden o-rounded-md ${
          surImage
            ? 'o-bg-white o-text-zinc-950'
            : 'o-bg-white o-text-zinc-950 dark:o-bg-zinc-950 dark:o-text-zinc-50'
        }`}
      >
        <span data-bv-fleche-a="" className="o-flex">
          <Icon icon={ArrowRight} size={18} aria-hidden="true" />
        </span>
        <span data-bv-fleche-b="" className="o-absolute o-flex">
          <Icon icon={ArrowRight} size={18} aria-hidden="true" />
        </span>
      </span>
    </>
  )
  if (href !== undefined) {
    return (
      <a href={href} data-bv-bouton="" className={coque}>
        {contenu}
      </a>
    )
  }
  return (
    <button type="submit" data-bv-bouton="" className={`o-w-full ${coque}`}>
      {contenu}
    </button>
  )
}

/** Les deux glyphes des mises en avant : un cercle, un triangle, au trait. */
function Glyphe({ nom }: { readonly nom: 'cercle' | 'triangle' }): ReactElement {
  if (nom === 'cercle') {
    return (
      <svg
        viewBox="0 0 72 72"
        className="o-size-full"
        fill="none"
        aria-hidden="true"
        focusable="false"
      >
        <circle cx="36" cy="36" r="19.5" stroke="currentColor" />
      </svg>
    )
  }
  return (
    <svg
      viewBox="0 0 43 41"
      className="o-absolute"
      style={{ left: 12, top: 12, width: 43 }}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M18.4688 5.25586C19.8157 2.92123 23.1843 2.92123 24.5312 5.25586L40.1064 32.251C41.4524 34.5843 39.7679 37.5 37.0742 37.5H5.92578C3.23205 37.5 1.5476 34.5843 2.89355 32.251L18.4688 5.25586Z"
        stroke="currentColor"
      />
    </svg>
  )
}

/**
 * Le guillemet de la carte de citation.
 *
 * La taille est portee ici, et non par l appelant : un SVG qui n a ni largeur
 * ni hauteur retombe sur les trois cents pixels par cent cinquante du defaut,
 * et le guillemet couvrait alors la citation entiere en noir plein. Le ton est
 * celui d une marque de fabrique, pose derriere le texte.
 */
function Guillemet({ className }: { readonly className?: string }): ReactElement {
  return (
    <svg
      viewBox="0 0 18.656 14.272"
      width="20"
      height="15.3"
      className={className}
      fill="none"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d="M18.656 1.856L15.328 6.624C16.1387 6.79467 16.8213 7.22134 17.376 7.904C17.952 8.56533 18.24 9.36533 18.24 10.304C18.24 11.4133 17.856 12.352 17.088 13.12C16.32 13.888 15.3493 14.272 14.176 14.272C13.024 14.272 12.064 13.888 11.296 13.12C10.528 12.352 10.144 11.4133 10.144 10.304C10.144 9.70667 10.2613 9.09867 10.496 8.48C10.7307 7.84 11.1893 7.008 11.872 5.984L15.904 0C15.904 0 16.8213 0.618668 18.656 1.856ZM8.512 1.856L5.184 6.624C5.99467 6.79467 6.67733 7.22134 7.232 7.904C7.808 8.56533 8.096 9.36533 8.096 10.304C8.096 11.4133 7.712 12.352 6.944 13.12C6.176 13.888 5.216 14.272 4.064 14.272C2.912 14.272 1.94133 13.888 1.152 13.12C0.384 12.352 0 11.4133 0 10.304C0 9.70667 0.117333 9.09867 0.352 8.48C0.608 7.84 1.07733 7.008 1.76 5.984L5.76 0C5.76 0 6.67733 0.618668 8.512 1.856Z"
        fill="currentColor"
      />
    </svg>
  )
}

/* ============================ Le ciel ================================== */

/** Une nuance de l accent, melangee a l ardoise : le ciel du crepuscule. */
function ardoise(nuance: number, part: number, gris: number): string {
  return `color-mix(in oklab, ${accent(nuance)} ${String(part)}%, var(--o-palette-slate-${String(gris)}))`
}

/**
 * La rampe du ciel de la source (« image 643 »), du bleu nuit en haut a une
 * brume pale en bas, teintee par l accent de la vitrine.
 */
const CIEL = `linear-gradient(to bottom, ${ardoise(900, 60, 950)} 0%, ${ardoise(800, 55, 800)} 22%, ${ardoise(600, 45, 600)} 50%, ${ardoise(500, 40, 500)} 62%, ${ardoise(400, 45, 400)} 72%, ${ardoise(200, 55, 300)} 90%)`

/** Le sol de la vallee, qui monte du bas d une bande de crepuscule. */
const SOL =
  'linear-gradient(to top, var(--o-palette-slate-950) 0%, color-mix(in oklab, var(--o-palette-slate-950) 72%, transparent) 11%, transparent 30%)'

/** Une bande de crepuscule : la nuit d ardoise, et le ciel par-dessus. */
function crepuscule(): CSSProperties {
  return { ...nuit('slate'), backgroundImage: CIEL }
}

/* ============================ La maison ================================ */

type Points = readonly (readonly [number, number])[]

/** Un polygone ferme, en chemin SVG. */
function trace(points: Points): string {
  return `M${points.map(([x, y]) => `${String(x)} ${String(y)}`).join('L')}Z`
}

/** Un point entre deux autres. */
function entre(
  a: readonly [number, number],
  b: readonly [number, number],
  t: number,
): [number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t]
}

/**
 * La geometrie de la maison, dans une boite de 1000 x 720.
 *
 * Deux volumes en porte-a-faux qui forment un V ouvert vers nous : le volume
 * de gauche tourne son bout droit vers le regard, celui de droite son bout
 * gauche. Entre les deux, un joint en retrait, avec une fente de lumiere. Les
 * volumes flottent au-dessus d un socle plus sombre, et le sol de la vallee
 * passe dessous. Les verticales restent verticales, comme dans une vue a deux
 * points de fuite.
 */
const FACE_A: Points = [
  [150, 335],
  [500, 290],
  [500, 600],
  [150, 585],
]
const COTE_A: Points = [
  [90, 318],
  [150, 335],
  [150, 585],
  [90, 556],
]
const TOIT_A: Points = [
  [90, 306],
  [150, 323],
  [500, 278],
  [500, 290],
  [150, 335],
  [90, 318],
]
const JOINT: Points = [
  [500, 300],
  [540, 300],
  [540, 610],
  [500, 600],
]
const FACE_B: Points = [
  [540, 300],
  [880, 345],
  [880, 590],
  [540, 610],
]
const TOIT_B: Points = [
  [540, 288],
  [880, 333],
  [880, 345],
  [540, 300],
]
const SOCLE_A: Points = [
  [200, 585],
  [470, 600],
  [470, 692],
  [200, 680],
]
const SOCLE_B: Points = [
  [580, 610],
  [840, 594],
  [840, 690],
  [580, 702],
]
const BAIE_A: Points = [
  [185, 375],
  [465, 340],
  [465, 562],
  [185, 570],
]
const BAIE_B: Points = [
  [570, 352],
  [848, 392],
  [848, 560],
  [570, 580],
]
const FENTE: Points = [
  [510, 380],
  [530, 380],
  [530, 570],
  [510, 565],
]
const SOL_MAISON = 'M0 720V690C120 660 300 640 500 660C700 680 860 640 1000 668V720Z'
const VALLEE = 'M0 560L110 500L250 528L400 452L540 506L690 440L850 492L1000 458V720H0Z'

/** Les lignes d une baie : trois travees, la retombee du plafond, le garde-corps. */
function lignesDeBaie(baie: Points): {
  readonly meneaux: readonly string[]
  readonly plafond: string
  readonly gardeCorps: string
  readonly gardeCorpsHaut: number
} {
  const [hg, hd, bd, bg] = baie as unknown as readonly [
    readonly [number, number],
    readonly [number, number],
    readonly [number, number],
    readonly [number, number],
  ]
  const meneaux = [1 / 3, 2 / 3].map((t) => {
    const haut = entre(hg, hd, t)
    const bas = entre(bg, bd, t)
    return `M${String(haut[0])} ${String(haut[1])}L${String(bas[0])} ${String(bas[1])}`
  })
  const ligne = (t: number): string => {
    const g = entre(hg, bg, t)
    const d = entre(hd, bd, t)
    return `M${String(g[0])} ${String(g[1])}L${String(d[0])} ${String(d[1])}`
  }
  return { meneaux, plafond: ligne(0.16), gardeCorps: ligne(0.64), gardeCorpsHaut: 0.64 }
}

/** Le garde-corps en verre : la part basse de la baie, un peu voilee. */
function gardeCorps(baie: Points): Points {
  const [hg, hd, bd, bg] = baie as unknown as readonly [
    readonly [number, number],
    readonly [number, number],
    readonly [number, number],
    readonly [number, number],
  ]
  return [entre(hg, bg, 0.64), entre(hd, bd, 0.64), bd, bg]
}

/** Les lignes de bardage d une face, une toutes les trente unites. */
function bardage(face: Points, pas = 30): readonly string[] {
  const [hg, hd, bd, bg] = face as unknown as readonly [
    readonly [number, number],
    readonly [number, number],
    readonly [number, number],
    readonly [number, number],
  ]
  const largeur = hd[0] - hg[0]
  const lignes: string[] = []
  for (let x = pas; x < largeur; x += pas) {
    const t = x / largeur
    const haut = entre(hg, hd, t)
    const bas = entre(bg, bd, t)
    lignes.push(
      `M${String(haut[0])} ${String(haut[1])}L${String(bas[0])} ${String(bas[1])}`,
    )
  }
  return lignes
}

/**
 * La maison, en rendu ou au trait.
 *
 * Le rendu : bardage brule a lames verticales, baies chaudes dont la lueur
 * deborde, fascias de zinc, socle dans l ombre. Le trait : les memes
 * polygones en contour, qui se dessinent a l entree dans le champ quand
 * `dessine` est vrai.
 *
 * @param prefixe Les identifiants des degrades et des motifs : la maison est
 *   posee plusieurs fois sur la page, et deux `<defs>` du meme nom se
 *   volent l un l autre.
 * @param vallee Vrai pour dessiner la ligne de crete derriere la maison.
 */
function Maison({
  mode,
  prefixe,
  dessine = true,
  vallee = false,
  className,
  style,
  label,
}: {
  readonly mode: 'rendu' | 'trait'
  readonly prefixe: string
  readonly dessine?: boolean
  readonly vallee?: boolean
  readonly className?: string
  readonly style?: CSSProperties
  /** Un texte de remplacement : la maison est alors une image, pas un decor. */
  readonly label?: string
}): ReactElement {
  const { reduced } = useMotionState()
  const id = (nom: string): string => `${prefixe}-${nom}`
  const ref = (nom: string): string => `url(#${prefixe}-${nom})`

  const baieA = lignesDeBaie(BAIE_A)
  const baieB = lignesDeBaie(BAIE_B)

  if (mode === 'trait') {
    const montre = dessine || reduced
    let rang = 0
    const Ligne = ({
      d,
      opacite = 1,
      epaisseur = 1.4,
    }: {
      readonly d: string
      readonly opacite?: number
      readonly epaisseur?: number
    }): ReactElement => {
      rang += 1
      const delai = 60 * rang
      return (
        <path
          d={d}
          pathLength={1}
          fill="none"
          stroke="currentColor"
          strokeWidth={epaisseur}
          strokeLinejoin="round"
          strokeLinecap="round"
          opacity={opacite}
          style={{
            strokeDasharray: 1,
            strokeDashoffset: montre ? 0 : 1,
            transition: reduced
              ? undefined
              : `stroke-dashoffset 1400ms cubic-bezier(0.22, 1, 0.36, 1) ${String(delai)}ms`,
          }}
        />
      )
    }
    return (
      <svg
        viewBox="0 0 1000 720"
        className={className}
        style={style}
        aria-hidden={label === undefined ? 'true' : undefined}
        role={label === undefined ? undefined : 'img'}
        aria-label={label}
        focusable="false"
      >
        {vallee && (
          <Ligne
            d="M0 560L110 500L250 528L400 452L540 506L690 440L850 492L1000 458"
            opacite={0.35}
            epaisseur={1}
          />
        )}
        <Ligne d={trace(TOIT_A)} />
        <Ligne d={trace(FACE_A)} />
        <Ligne d={trace(COTE_A)} />
        <Ligne d={trace(JOINT)} />
        <Ligne d={trace(TOIT_B)} />
        <Ligne d={trace(FACE_B)} />
        <Ligne d={trace(SOCLE_A)} opacite={0.7} />
        <Ligne d={trace(SOCLE_B)} opacite={0.7} />
        <Ligne d={trace(BAIE_A)} />
        <Ligne d={trace(BAIE_B)} />
        <Ligne d={trace(FENTE)} opacite={0.8} />
        {[
          ...baieA.meneaux,
          baieA.plafond,
          baieA.gardeCorps,
          ...baieB.meneaux,
          baieB.plafond,
          baieB.gardeCorps,
        ].map((d) => (
          <Ligne key={d} d={d} opacite={0.75} epaisseur={1} />
        ))}
        {[...bardage(FACE_A), ...bardage(FACE_B)].map((d) => (
          <Ligne key={d} d={d} opacite={0.22} epaisseur={0.8} />
        ))}
        <Ligne
          d="M0 690C120 660 300 640 500 660C700 680 860 640 1000 668"
          opacite={0.5}
          epaisseur={1}
        />
      </svg>
    )
  }

  return (
    <svg
      viewBox="0 0 1000 720"
      className={className}
      style={style}
      aria-hidden={label === undefined ? 'true' : undefined}
      role={label === undefined ? undefined : 'img'}
      aria-label={label}
      focusable="false"
    >
      <defs>
        <pattern id={id('bois')} width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="#1b1816" />
          <rect width="1.3" height="8" fill="#2d2724" />
          <rect x="4.2" width="0.7" height="8" fill="#0f0d0c" />
        </pattern>
        <pattern id={id('bois-ombre')} width="8" height="8" patternUnits="userSpaceOnUse">
          <rect width="8" height="8" fill="#110f0e" />
          <rect width="1.2" height="8" fill="#1e1a18" />
        </pattern>
        <linearGradient id={id('interieur')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbe7c0" />
          <stop offset="0.18" stopColor="#f6cf8e" />
          <stop offset="0.62" stopColor="#e9a256" />
          <stop offset="1" stopColor="#b8642a" />
        </linearGradient>
        <linearGradient id={id('zinc')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b3bac1" />
          <stop offset="1" stopColor="#5f676e" />
        </linearGradient>
        <linearGradient id={id('jour')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.14" />
          <stop offset="0.45" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
        <linearGradient id={id('socle')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0c0a09" />
          <stop offset="1" stopColor="#1c1917" />
        </linearGradient>
        <linearGradient id={id('sol')} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#0b1220" stopOpacity="0.55" />
          <stop offset="1" stopColor="#0b1220" stopOpacity="0.95" />
        </linearGradient>
        <filter id={id('lueur')} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="16" />
        </filter>
      </defs>

      {vallee && <path d={VALLEE} fill="#0b1220" opacity="0.22" />}

      {/* La lueur des baies, avant les murs : la lumiere deborde sur le bardage. */}
      <g filter={ref('lueur')} opacity="0.55">
        <path d={trace(BAIE_A)} fill="#f5b86a" />
        <path d={trace(BAIE_B)} fill="#f5b86a" />
        <path d={trace(FENTE)} fill="#f5b86a" />
      </g>

      {/* Les socles dans l ombre, et le sol. */}
      <path d={trace(SOCLE_A)} fill={ref('socle')} />
      <path d={trace(SOCLE_B)} fill={ref('socle')} />
      <path d={SOL_MAISON} fill={ref('sol')} />

      {/* Le volume de gauche. */}
      <path d={trace(COTE_A)} fill={ref('bois-ombre')} />
      <path d={trace(FACE_A)} fill={ref('bois')} />
      <path d={trace(FACE_A)} fill={ref('jour')} />
      <path d={trace(BAIE_A)} fill={ref('interieur')} />
      <path d={trace(gardeCorps(BAIE_A))} fill="#ffffff" opacity="0.14" />
      <g stroke="#1b1816" strokeWidth="5" fill="none">
        {baieA.meneaux.map((d) => (
          <path key={d} d={d} />
        ))}
        <path d={baieA.plafond} strokeWidth="3" />
        <path d={baieA.gardeCorps} stroke="#fff4e0" strokeWidth="2.5" opacity="0.7" />
      </g>
      <path d={trace(BAIE_A)} fill="none" stroke="#0f0d0c" strokeWidth="6" />
      <path d={trace(TOIT_A)} fill={ref('zinc')} />

      {/* Le joint en retrait, et sa fente de lumiere. */}
      <path d={trace(JOINT)} fill="#0c0a09" />
      <path d={trace(FENTE)} fill={ref('interieur')} />

      {/* Le volume de droite. */}
      <path d={trace(FACE_B)} fill={ref('bois')} />
      <path d={trace(FACE_B)} fill={ref('jour')} />
      <path d={trace(BAIE_B)} fill={ref('interieur')} />
      <path d={trace(gardeCorps(BAIE_B))} fill="#ffffff" opacity="0.14" />
      <g stroke="#1b1816" strokeWidth="5" fill="none">
        {baieB.meneaux.map((d) => (
          <path key={d} d={d} />
        ))}
        <path d={baieB.plafond} strokeWidth="3" />
        <path d={baieB.gardeCorps} stroke="#fff4e0" strokeWidth="2.5" opacity="0.7" />
      </g>
      <path d={trace(BAIE_B)} fill="none" stroke="#0f0d0c" strokeWidth="6" />
      <path d={trace(TOIT_B)} fill={ref('zinc')} />
    </svg>
  )
}

/* ============================ La barre ================================= */

/**
 * La barre en pastille de la source : le sigle dans une case, quatre mots,
 * « Contact » dans une case a point. Un verre gris clair a coins de 8 px,
 * fixe sous les barres de la documentation. Sous la coupure, un bouton qui
 * ouvre la liste.
 */
function Pastille(): ReactElement {
  const [ouvert, setOuvert] = useState(false)
  useEffect(() => {
    if (!ouvert) return
    const surTouche = (evenement: KeyboardEvent): void => {
      if (evenement.key === 'Escape') setOuvert(false)
    }
    window.addEventListener('keydown', surTouche)
    return () => {
      window.removeEventListener('keydown', surTouche)
    }
  }, [ouvert])

  const lien =
    'o-rounded-md o-px-3 o-py-1.5 o-text-sm o-no-underline o-text-zinc-800 dark:o-text-zinc-200 hover:o-opacity-60 o-transition-opacity focus:o-ring'
  const case_ = 'o-bg-white o-text-zinc-950 dark:o-bg-zinc-800 dark:o-text-zinc-50'

  return (
    <div
      className="o-pointer-events-none o-fixed o-inset-x-0 o-z-40 o-flex o-justify-center o-px-4"
      style={{ top: `calc(${String(CHROME)}px + 0.75rem)` }}
    >
      <div className="o-pointer-events-auto o-w-full md:o-w-auto">
        <nav
          aria-label="Navigation principale"
          className="o-flex o-items-center o-justify-between o-gap-4 o-rounded-lg o-border-w-1 o-border-black-10 o-bg-white-80 o-p-1 o-backdrop-blur-md dark:o-border-zinc-800 bv-voile md:o-justify-start md:o-gap-10"
        >
          <a
            href="#haut"
            aria-label="Belvedere — accueil"
            className={`o-flex o-size-11 o-shrink-0 o-items-center o-justify-center o-rounded-md o-transition-transform hover:o-scale-105 focus:o-ring ${case_}`}
          >
            <Sigle className="o-w-5" style={{ color: ORANGE }} />
          </a>
          <ul className="o-m-0 o-hidden o-list-none o-items-center o-gap-5 o-p-0 md:o-flex">
            {NAVIGATION.map(([cible, mot]) => (
              <li key={cible}>
                <a href={cible} className={lien}>
                  {mot}
                </a>
              </li>
            ))}
          </ul>
          <a
            href="#visiter"
            className={`o-hidden o-h-11 o-items-center o-gap-2 o-rounded-md o-px-5 o-text-sm o-font-medium o-no-underline o-transition-transform hover:o-scale-105 focus:o-ring md:o-flex ${case_}`}
          >
            <span
              aria-hidden="true"
              className="o-size-2 o-shrink-0 o-rounded-full"
              style={{ backgroundColor: 'currentcolor' }}
            />
            Contact
          </a>
          <button
            type="button"
            onClick={() => {
              setOuvert((v) => !v)
            }}
            aria-expanded={ouvert}
            aria-controls="bv-liste"
            aria-label={ouvert ? 'Fermer le menu' : 'Ouvrir le menu'}
            className={`o-flex o-size-11 o-shrink-0 o-flex-col o-items-center o-justify-center o-gap-1.5 o-rounded-md focus:o-ring md:o-hidden ${case_}`}
          >
            <span
              className="o-h-px o-w-5 o-transition-transform"
              style={{
                backgroundColor: 'currentcolor',
                transform: ouvert ? 'translateY(3.5px) rotate(45deg)' : undefined,
              }}
            />
            <span
              className="o-h-px o-w-5 o-transition-transform"
              style={{
                backgroundColor: 'currentcolor',
                transform: ouvert ? 'translateY(-3.5px) rotate(-45deg)' : undefined,
              }}
            />
          </button>
        </nav>
        <div
          id="bv-liste"
          hidden={!ouvert}
          className="o-mt-2 o-rounded-lg o-border-w-1 o-border-black-10 o-bg-white-80 o-backdrop-blur-md dark:o-border-zinc-800 bv-voile md:o-hidden"
        >
          <ul className="o-m-0 o-flex o-list-none o-flex-col o-gap-3 o-p-5">
            {NAVIGATION.map(([cible, mot]) => (
              <li key={cible}>
                <a
                  href={cible}
                  className={lien}
                  onClick={() => {
                    setOuvert(false)
                  }}
                >
                  {mot}
                </a>
              </li>
            ))}
            <li>
              <a
                href="#visiter"
                className={`${lien} o-inline-flex o-items-center o-gap-2 o-font-medium`}
                onClick={() => {
                  setOuvert(false)
                }}
              >
                <span
                  aria-hidden="true"
                  className="o-size-2 o-shrink-0 o-rounded-full"
                  style={{ backgroundColor: 'currentcolor' }}
                />
                Contact
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  )
}

/* ============================ Le sigle en volume ======================= */

/** Tours complets du sigle sur la traversee de la section. */
const SIGLE_TOURS = 2
/** Secondes pour que l angle rendu comble l essentiel de son ecart a la cible. */
const SIGLE_TAU = 0.12
/** Hauteur du sigle, en part de ce que la camera voit a l origine. */
const SIGLE_PART = 0.16
/** Ce que la camera du moteur voit a z = 0 : fov 45, a cinq unites. */
const VUE_HAUTEUR = 2 * 5 * Math.tan((45 / 2) * (Math.PI / 180))

/**
 * La couleur calculee d un element, ramenee en hexadecimal par le navigateur.
 *
 * Le fond de la page est un jeton en `oklch`, que three.js ne lit pas. Un
 * canevas d un pixel le peint, on le relit : c est le navigateur qui convertit.
 */
function couleurCalculee(valeur: string): string {
  const toile = document.createElement('canvas')
  toile.width = 1
  toile.height = 1
  const pot = toile.getContext('2d', { willReadFrequently: true })
  if (pot === null) return '#ffffff'
  pot.fillStyle = '#000000'
  pot.fillStyle = valeur
  pot.fillRect(0, 0, 1, 1)
  const [r, v, b] = pot.getImageData(0, 0, 1, 1).data
  const deux = (n: number | undefined): string => (n ?? 0).toString(16).padStart(2, '0')
  return `#${deux(r)}${deux(v)}${deux(b)}`
}

/** Ce que retient la scene du sigle d une image a l autre. */
interface EtatSigle {
  angle: number
  hauteur: number
  amorce: boolean
  images: number
  fond: string
}

/**
 * Le sigle ODORO en volume, derriere la grille des acquereurs.
 *
 * Le canevas remplit la section, qui le decoupe : le sigle monte de sous la
 * situation et s en va sous le contact. Son angle et sa hauteur poursuivent la
 * valeur de defilement — jamais un saut, sauf a la premiere image, ou l on
 * cale plutot que de rattraper une course entiere.
 *
 * Le contexte est opaque : le fond de la scene est celui de la section, relu
 * toutes les trente images pour suivre un changement de theme.
 */
function SigleEnVolume({
  progression,
  section,
}: {
  readonly progression: React.RefObject<number>
  readonly section: React.RefObject<HTMLElement | null>
}): ReactElement {
  const etat = useRef<EtatSigle>({
    angle: 0,
    hauteur: 0,
    amorce: false,
    images: 0,
    fond: '',
  })

  const fondDeSection = useCallback((): string => {
    const hote = section.current
    if (hote === null) return '#ffffff'
    return couleurCalculee(getComputedStyle(hote).backgroundColor)
  }, [section])

  return (
    <Volume
      nom="sigle odoro"
      className="o-pointer-events-none o-absolute o-inset-0 o-z-0"
      repli={
        <div className="o-flex o-h-full o-items-center o-justify-center">
          <Sigle
            data-bv-sigle-repli=""
            className="o-w-40 o-opacity-90 md:o-w-56"
            style={{ color: ORANGE }}
          />
        </div>
      }
      construire={(contexte) => {
        const { scene, camera, three } = contexte
        const fond = fondDeSection()
        etat.current = { angle: 0, hauteur: 0, amorce: false, images: 0, fond }
        scene.background = new three.Color(fond)

        // Le sigle : un anneau dont le quart haut-gauche est un angle droit.
        // Angle carre au coin, arete du haut jusqu au sommet du cercle, arc de
        // 270 degres dans le sens horaire, arete de gauche qui remonte. Le
        // trou interieur reprend le meme trace a 0,7 du rayon.
        const rayon = 1
        const dessinerAnneau = (
          cible: {
            moveTo: (x: number, y: number) => unknown
            lineTo: (x: number, y: number) => unknown
            absarc: (
              x: number,
              y: number,
              r: number,
              a: number,
              b: number,
              horaire: boolean,
            ) => unknown
          },
          r: number,
        ): void => {
          cible.moveTo(-r, r)
          cible.lineTo(0, r)
          cible.absarc(0, 0, r, Math.PI / 2, Math.PI, true)
          cible.lineTo(-r, r)
        }
        const forme = new three.Shape()
        dessinerAnneau(forme, rayon)
        const trou = new three.Path()
        dessinerAnneau(trou, rayon * SIGLE_INTERIEUR)
        forme.holes.push(trou)

        const geometrie = new three.ExtrudeGeometry(forme, {
          depth: 0.34,
          bevelEnabled: true,
          bevelThickness: 0.035,
          bevelSize: 0.035,
          bevelSegments: 3,
          curveSegments: 56,
        })
        geometrie.translate(0, 0, -0.17)

        // Une matiere orange qui garde une part diffuse : un metal plein sans
        // carte d environnement rend noir. C est la rasante qui fait briller.
        const matiere = new three.MeshPhysicalMaterial({
          color: ORANGE,
          metalness: 0.28,
          roughness: 0.36,
          clearcoat: 0.7,
          clearcoatRoughness: 0.22,
        })

        const echelle = (SIGLE_PART * VUE_HAUTEUR) / (rayon * 2)
        const sigle = new three.Mesh(geometrie, matiere)
        const pivot = new three.Group()
        pivot.name = 'sigle'
        pivot.add(sigle)
        pivot.scale.setScalar(echelle)
        // Legerement couche vers l arriere : de face, une extrusion est plate.
        pivot.rotation.x = 0.3
        scene.add(pivot)

        eclairer(contexte, {
          cle: 0xfff3e2,
          remplissage: 0x9db6d6,
          contour: 0xffffff,
          force: 1.15,
        })
        const rasante = new three.PointLight(0xffffff, 16, 14, 2)
        rasante.position.set(3.2, 1.4, 1.6)
        const dessous = new three.PointLight(0xffd9b0, 8, 12, 2)
        dessous.position.set(-1.5, -2.4, 2)
        scene.add(rasante, dessous)

        camera.position.set(0, 0, 5)
        camera.lookAt(0, 0, 0)

        // Le contexte est opaque et le canevas couvre la section entiere : le
        // fond de la scene est donc ce qu on voit derriere le sigle, et il doit
        // suivre le theme. `animer` le relit toutes les trente images, ce qui
        // suffit a l ecran mais jamais quand la scene ne rend que quelques
        // images en passant — la section restait alors peinte en blanc sous le
        // theme sombre. On ecoute donc le changement plutot que de l attendre.
        const suivreLeTheme = (): void => {
          const fondCourant = fondDeSection()
          if (fondCourant === etat.current.fond) return
          etat.current.fond = fondCourant
          const couleur = scene.background
          if (couleur !== null && typeof couleur === 'object' && 'set' in couleur) {
            ;(couleur as { set: (c: string) => unknown }).set(fondCourant)
          }
        }
        const observateur = new MutationObserver(suivreLeTheme)
        observateur.observe(document.documentElement, {
          attributes: true,
          attributeFilter: ['data-theme', 'class', 'style'],
        })
        const systeme = window.matchMedia('(prefers-color-scheme: dark)')
        systeme.addEventListener('change', suivreLeTheme)
        suivreLeTheme()

        return () => {
          observateur.disconnect()
          systeme.removeEventListener('change', suivreLeTheme)
          geometrie.dispose()
          matiere.dispose()
        }
      }}
      animer={({ scene }, { delta }) => {
        const pivot = scene.getObjectByName('sigle')
        if (pivot === undefined) return
        const e = etat.current
        const p = progression.current
        const cibleAngle = p * SIGLE_TOURS * Math.PI * 2
        const hauteurSigle = SIGLE_PART * VUE_HAUTEUR
        // Entre par le haut, sort par le bas, sur la traversee de la section.
        const cibleHauteur = (0.5 - p) * (VUE_HAUTEUR + hauteurSigle * 2)

        if (!e.amorce) {
          e.amorce = true
          e.angle = cibleAngle
          e.hauteur = cibleHauteur
        } else {
          // Independant de la cadence : la meme raideur a 60 et a 120 images.
          const k = delta > 0 ? 1 - Math.exp(-delta / SIGLE_TAU) : 1
          e.angle += (cibleAngle - e.angle) * k
          e.hauteur += (cibleHauteur - e.hauteur) * k
        }
        pivot.rotation.y = e.angle
        pivot.position.y = e.hauteur

        e.images += 1
        if (e.images % 30 === 0) {
          const fond = fondDeSection()
          if (fond !== e.fond) {
            e.fond = fond
            const couleur = scene.background
            if (couleur !== null && typeof couleur === 'object' && 'set' in couleur) {
              ;(couleur as { set: (c: string) => unknown }).set(fond)
            }
          }
        }
      }}
    />
  )
}

/* ============================ Les chiffres ============================= */

/** Un nombre qui compte a l entree dans le champ, et se resout d un flou. */
function Nombre({
  valeur,
  quoi,
  delai,
}: {
  readonly valeur: number
  readonly quoi: string
  readonly delai: number
}): ReactElement {
  const { reduced } = useMotionState()
  const [ref, vu] = useVu(0.4)
  return (
    <div
      ref={ref}
      className="o-flex o-w-full o-flex-col o-items-center o-gap-4 o-text-center"
    >
      <dt
        className="o-tabular-nums o-text-zinc-950 dark:o-text-zinc-50"
        style={{
          ...affiche('m', 300),
          fontSize: 'clamp(3.5rem, 6vw, 5.5rem)',
          lineHeight: 1,
          opacity: vu ? 1 : 0.15,
          filter: vu || reduced ? 'none' : 'blur(0.75rem)',
          transition: reduced
            ? 'opacity 300ms ease'
            : `opacity 900ms ease ${String(delai)}ms, filter 1500ms cubic-bezier(0.22, 1, 0.36, 1) ${String(delai)}ms`,
        }}
      >
        {vu ? (
          <CountUp
            value={valeur}
            duration={1500}
            delay={delai}
            declenchement="montage"
            locale="fr-FR"
          />
        ) : (
          <span>{valeur}</span>
        )}
      </dt>
      <dd className="o-m-0 o-text-lg o-text-zinc-950 dark:o-text-zinc-50">{quoi}</dd>
    </div>
  )
}

/* ============================ La page ================================== */

export default function Page(): ReactElement {
  const polices = usePolices('jakarta')
  const { reduced } = useMotionState()
  useFeuille()

  // Le compteur tient au moins le temps de la source, puis le rideau part.
  const [pret, setPret] = useState(false)
  useEffect(() => {
    const id = window.setTimeout(
      () => {
        setPret(true)
      },
      reduced ? RIDEAU_REDUIT_MS : RIDEAU_MINIMUM_MS,
    )
    return () => {
      window.clearTimeout(id)
    }
  }, [reduced])

  // La revelation au curseur, sur la situation : le pointeur ecrit deux
  // variables, une fois par image au plus, et le masque du rendu les lit.
  const [pointeurFin, setPointeurFin] = useState(false)
  useEffect(() => {
    setPointeurFin(window.matchMedia('(hover: hover) and (pointer: fine)').matches)
  }, [])
  const lieu = useRef<HTMLElement | null>(null)
  const pointeur = useRef({ x: 0, y: 0, image: 0 })
  const suivre = useCallback((evenement: React.PointerEvent<HTMLElement>) => {
    const p = pointeur.current
    p.x = evenement.clientX
    p.y = evenement.clientY
    if (p.image !== 0) return
    p.image = window.requestAnimationFrame(() => {
      p.image = 0
      const hote = lieu.current
      if (hote === null) return
      const boite = hote.getBoundingClientRect()
      hote.style.setProperty('--bv-mx', `${String(Math.round(p.x - boite.left))}px`)
      hote.style.setProperty('--bv-my', `${String(Math.round(p.y - boite.top))}px`)
    })
  }, [])
  const quitter = useCallback(() => {
    lieu.current?.style.setProperty('--bv-mx', '-1000px')
    lieu.current?.style.setProperty('--bv-my', '-1000px')
  }, [])

  // Le sigle : la section ecrit sa progression dans une ref, la scene la lit.
  const achat = useRef<HTMLElement | null>(null)
  const [achatElement, setAchatElement] = useState<HTMLElement | null>(null)
  const progression = useRef(0)
  useScrollScrub<HTMLElement>(
    (p) => {
      progression.current = p
    },
    {
      element: achatElement,
      start: 'top bottom',
      end: 'bottom top',
      name: 'sigle au defilement',
    },
  )
  const sigle = useMemo(
    () => <SigleEnVolume progression={progression} section={achat} />,
    [],
  )

  // `new Map` sans annotation prend pour type de cle l union des cases
  // ecrites — 0 | 1 | 3 | 5 | 7 | 8 — alors qu on l interroge avec le rang
  // d une boucle sur neuf cases. La grille est de neuf cases, pas de six.
  const parCase = new Map<number, (typeof ACQUEREURS.profils)[number]>(
    ACQUEREURS.profils.map((profil) => [profil.case, profil]),
  )
  const ordre: readonly number[] = ACQUEREURS.profils
    .map((profil) => profil.case)
    .sort((a, b) => a - b)

  const titreAffiche: CSSProperties = {
    ...affiche('l', 300),
    fontSize: 'clamp(2.75rem, 7.2vw, 6.75rem)',
    letterSpacing: '-0.03em',
    lineHeight: 1,
  }
  const grandCorps: CSSProperties = {
    ...affiche('m', 300),
    fontSize: 'clamp(1.5rem, 2.5vw, 2.25rem)',
    letterSpacing: '-0.015em',
    lineHeight: 1.2,
  }

  return (
    <Porte forme="compteur" marque="Belvedere" sombre={false} pret={pret}>
      <div
        className="o-relative o-bg-white o-text-zinc-950 dark:o-bg-zinc-950 dark:o-text-zinc-50"
        style={polices}
      >
        <Pastille />

        <main id="haut" className="o-relative">
          {/*
            ----- Le heros -------------------------------------------------------

            Trois calques, du fond vers l avant : la rampe du ciel, le mot-marque
            geant dont les lettres s ecartent au defilement, la maison qui passe
            devant. La copie par-dessus.
          */}
          <section
            aria-labelledby="bv-titre"
            className="o-relative o-isolate o-flex o-flex-col o-items-center o-overflow-hidden o-px-5 o-pt-40 md:o-pt-48"
            style={{ ...crepuscule(), minHeight: `max(760px, calc(1.62 * ${ECRAN}))` }}
          >
            <Eclate
              mot={HEROS.motMarque}
              haut={220}
              bas={80}
              className="o-pointer-events-none o-absolute o-z-0 o-m-0 o-hidden o-select-none o-whitespace-nowrap md:o-block"
              style={{
                ...affiche('xxl', 300),
                fontSize: '46vw',
                letterSpacing: '-0.045em',
                lineHeight: 1,
                left: '-8vw',
                top: '30%',
                color: '#ffffff',
                maskImage: 'linear-gradient(to bottom, #000 0%, transparent 82%)',
                WebkitMaskImage: 'linear-gradient(to bottom, #000 0%, transparent 82%)',
                opacity: pret ? 1 : 0,
                transition: reduced
                  ? 'opacity 400ms ease'
                  : `opacity 1400ms cubic-bezier(0.16, 1, 0.3, 1) ${String(ENTREE.motMarque)}ms`,
              }}
            />

            <div className="o-relative o-z-20 o-flex o-max-w-5xl o-flex-col o-items-center o-text-center">
              <h1
                id="bv-titre"
                aria-label={`${HEROS.eteint} ${HEROS.allume}`}
                className="o-m-0 o-text-balance"
                style={titreAffiche}
              >
                {HEROS.eteint.split(' ').map((mot, rang) => (
                  <Surgit
                    key={`e-${String(rang)}`}
                    as="span"
                    delai={ENTREE.titre + rang * 60}
                    distance={22}
                    className="o-inline-block"
                    style={{ marginRight: '0.24em', color: 'rgba(255, 255, 255, 0.62)' }}
                  >
                    <span aria-hidden="true">{mot}</span>
                  </Surgit>
                ))}
                {HEROS.allume.split(' ').map((mot, rang) => (
                  <Surgit
                    key={`a-${String(rang)}`}
                    as="span"
                    delai={ENTREE.titre + (3 + rang) * 60}
                    distance={22}
                    className="o-inline-block"
                    style={{ marginRight: '0.24em', color: '#ffffff' }}
                  >
                    <span aria-hidden="true">{mot}</span>
                  </Surgit>
                ))}
              </h1>
              <Surgit
                as="p"
                delai={ENTREE.sousTitre}
                className="o-m-0 o-mt-8 o-max-w-xl o-text-lg o-leading-snug o-text-white"
              >
                {HEROS.sousTitre}
              </Surgit>
              <Surgit delai={ENTREE.action} className="o-mt-8">
                <Aimant force={0.3}>
                  <Bouton href="#visiter" surImage className="o-w-56">
                    {HEROS.action}
                  </Bouton>
                </Aimant>
              </Surgit>
            </div>

            {/* Le sol de la vallee, entre le mot-marque et la maison. */}
            <div
              aria-hidden="true"
              className="o-pointer-events-none o-absolute o-inset-x-0 o-bottom-0 o-z-10"
              style={{ height: '46%', backgroundImage: SOL }}
            />

            <div
              className="o-pointer-events-none o-absolute o-bottom-0 o-left-1/2 o-z-10 o-w-full"
              style={{
                transform: 'translateX(-50%)',
                width: 'min(92vw, 1120px)',
                opacity: pret ? 1 : 0,
                transition: reduced
                  ? 'opacity 400ms ease'
                  : `opacity 1200ms cubic-bezier(0.16, 1, 0.3, 1) ${String(ENTREE.motMarque)}ms`,
              }}
            >
              <Parallaxe vitesse={-0.12} glisse={0.55}>
                <Maison
                  mode="rendu"
                  prefixe="bv-heros"
                  className="o-block o-w-full"
                  style={{ marginBottom: '-2%' }}
                  label="La maison du Belvedere eclairee de l interieur au crepuscule, au-dessus de la vallee."
                />
              </Parallaxe>
            </div>

            <Surgit
              as="p"
              delai={ENTREE.legende}
              className="bv-bande o-absolute o-bottom-10 o-z-20 o-m-0 o-text-center o-text-base o-leading-snug o-text-white md:o-text-lg"
            >
              {HEROS.legende[0]}
              <br />
              {HEROS.legende[1]}
            </Surgit>
          </section>

          {/*
            ----- La maison ------------------------------------------------------
          */}
          <section
            id="maison"
            aria-labelledby="bv-maison"
            className="o-scroll-mt-24 o-px-5 o-py-20 md:o-px-10 md:o-py-28"
          >
            <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-gap-10">
              <Arrive delai={0} distance={16} className="md:o-col-span-4">
                <Surtitre>{MAISON.surtitre}</Surtitre>
              </Arrive>
              <div className="md:o-col-span-8">
                <TitreEnVue
                  as="h2"
                  className="o-m-0 o-text-zinc-950 dark:o-text-zinc-50"
                  style={grandCorps}
                >
                  {MAISON.corps}
                </TitreEnVue>
                <span id="bv-maison" className="o-sr-only">
                  {MAISON.surtitre}
                </span>
              </div>
            </div>

            <div aria-hidden="true" className="o-mt-12 o-h-px o-w-full bv-filet-plein" />

            <div className="o-mt-12 o-grid o-gap-10 md:o-grid-cols-12 md:o-items-end">
              {MAISON.misesEnAvant.map((mise, rang) => (
                <Arrive key={mise.titre} delai={rang * 90} className="md:o-col-span-4">
                  <div className="o-flex o-flex-col o-items-start">
                    <span
                      className="o-relative o-flex o-shrink-0 o-items-center o-justify-center o-rounded-lg o-bg-zinc-100 o-text-zinc-950 dark:o-bg-zinc-900 dark:o-text-zinc-50"
                      style={{ width: 72, height: 72 }}
                    >
                      <Glyphe nom={mise.glyphe} />
                    </span>
                    <p className="o-m-0 o-mt-8 o-text-xl o-text-zinc-950 dark:o-text-zinc-50">
                      {mise.titre}
                    </p>
                    <p className="o-m-0 o-mt-3 o-max-w-sm o-text-base o-font-light o-leading-snug o-text-zinc-800 dark:o-text-zinc-300">
                      {mise.texte}
                    </p>
                  </div>
                </Arrive>
              ))}
              <Arrive
                delai={180}
                distance={16}
                className="md:o-col-span-4 md:o-flex md:o-justify-end"
              >
                <Bouton href="#visiter" className="o-w-full md:o-w-80">
                  {MAISON.action}
                </Bouton>
              </Arrive>
            </div>

            <div className="o-mt-12 o-grid o-gap-4 md:o-grid-cols-12">
              {/* La maison au crepuscule, et la citation posee dessus. */}
              <Arrive className="o-min-w-0 md:o-col-span-5">
                <figure
                  className="o-relative o-isolate o-m-0 o-overflow-hidden o-rounded-lg"
                  style={{ ...crepuscule(), aspectRatio: '561 / 683' }}
                >
                  <div
                    aria-hidden="true"
                    className="o-pointer-events-none o-absolute o-inset-x-0 o-bottom-0 o-z-0"
                    style={{ height: '40%', backgroundImage: SOL }}
                  />
                  <div
                    className="o-absolute o-inset-x-0 o-bottom-0 o-z-0"
                    style={{ bottom: '4%' }}
                  >
                    <Parallaxe vitesse={0.1} glisse={0.6}>
                      <Maison
                        mode="rendu"
                        prefixe="bv-figure"
                        className="o-block o-w-full"
                        style={{ transform: 'scale(1.35)', transformOrigin: '50% 100%' }}
                        label="La maison du Belvedere au crepuscule, ses baies eclairees de l interieur."
                      />
                    </Parallaxe>
                  </div>
                  <figcaption className="bv-carton o-absolute o-bottom-4 o-z-10 o-rounded-lg o-bg-white o-p-5 o-text-zinc-950 md:o-bottom-8 md:o-left-8 md:o-w-80 md:o-p-7">
                    <blockquote className="o-m-0 o-pr-8">
                      <p className="o-m-0 o-text-lg o-leading-snug">{MAISON.citation}</p>
                      <p className="o-m-0 o-mt-3 o-text-sm o-font-light o-leading-snug o-text-zinc-700">
                        {MAISON.signature}
                      </p>
                    </blockquote>
                    <Guillemet className="o-pointer-events-none o-absolute o-right-6 o-top-6 -o-z-10 o-text-zinc-300" />
                  </figcaption>
                </figure>
              </Arrive>

              {/* La planche : la maison au trait, qui se dessine a l entree dans le champ. */}
              <Arrive delai={90} className="o-min-w-0 md:o-col-span-7">
                <Planche />
              </Arrive>
            </div>
          </section>

          {/*
            ----- Les chiffres cles ----------------------------------------------
          */}
          <section
            id="chiffres"
            aria-labelledby="bv-chiffres"
            className="o-px-5 o-py-20 o-text-center md:o-py-28"
          >
            <Arrive distance={16} className="o-flex o-justify-center">
              <Surtitre>{CHIFFRES.surtitre}</Surtitre>
            </Arrive>
            <div className="o-mx-auto o-mt-6 o-max-w-3xl">
              <TitreEnVue
                as="h2"
                cadence={35}
                className="o-m-0 o-text-balance o-text-zinc-950 dark:o-text-zinc-50"
                style={{ ...grandCorps, textAlign: 'center' }}
              >
                {CHIFFRES.titre}
              </TitreEnVue>
              <span id="bv-chiffres" className="o-sr-only">
                {CHIFFRES.surtitre}
              </span>
            </div>
            <Arrive delai={120} distance={16}>
              <p className="o-mx-auto o-mt-5 o-max-w-md o-text-base o-font-light o-leading-snug o-text-zinc-800 dark:o-text-zinc-300">
                {CHIFFRES.sousTitre}
              </p>
            </Arrive>
            <dl className="o-mx-auto o-mt-16 o-flex o-max-w-5xl o-flex-col o-items-center o-gap-10 sm:o-flex-row sm:o-items-start sm:o-justify-center sm:o-gap-6">
              {CHIFFRES.nombres.map((nombre, rang) => (
                <Nombre
                  key={nombre.quoi}
                  valeur={nombre.valeur}
                  quoi={nombre.quoi}
                  delai={rang * 110}
                />
              ))}
            </dl>
          </section>

          {/*
            ----- La situation ---------------------------------------------------

            La maison au crepuscule en pleine largeur, et sous le rendu, le trait :
            le curseur ouvre une fenetre qui le montre.
          */}
          <section
            id="lieu"
            ref={lieu}
            aria-labelledby="bv-lieu"
            onPointerMove={pointeurFin ? suivre : undefined}
            onPointerLeave={pointeurFin ? quitter : undefined}
            className="o-relative o-isolate o-flex o-scroll-mt-24 o-flex-col o-items-center o-overflow-hidden o-px-5 o-pb-40 o-pt-20 md:o-pt-28"
            style={
              {
                ...crepuscule(),
                minHeight: `calc(1.05 * ${ECRAN})`,
                '--bv-mx': '-1000px',
                '--bv-my': '-1000px',
              } as CSSProperties
            }
          >
            <div
              aria-hidden="true"
              className="o-pointer-events-none o-absolute o-inset-x-0 o-bottom-0 o-z-0"
              style={{ height: '40%', backgroundImage: SOL }}
            />

            <div
              className="o-pointer-events-none o-absolute o-bottom-0 o-left-1/2 o-z-0"
              style={{ transform: 'translateX(-50%)', width: 'min(124vw, 1500px)' }}
            >
              <Parallaxe vitesse={0.08} glisse={0.6}>
                <div className="o-relative">
                  <Maison
                    mode="trait"
                    prefixe="bv-lieu-trait"
                    vallee
                    className="o-block o-w-full o-text-white"
                    style={{ marginBottom: '-3%' }}
                  />
                  <Maison
                    mode="rendu"
                    prefixe="bv-lieu"
                    vallee
                    className="o-absolute o-inset-0 o-block o-w-full"
                    style={{
                      marginBottom: '-3%',
                      maskImage: pointeurFin
                        ? 'radial-gradient(circle 190px at var(--bv-mx) var(--bv-my), transparent 0 58%, #000 100%)'
                        : undefined,
                      WebkitMaskImage: pointeurFin
                        ? 'radial-gradient(circle 190px at var(--bv-mx) var(--bv-my), transparent 0 58%, #000 100%)'
                        : undefined,
                    }}
                    label="La maison du Belvedere au crepuscule, la crete de la vallee derriere."
                  />
                </div>
              </Parallaxe>
            </div>

            <Arrive distance={16} className="o-relative o-z-10 o-flex o-justify-center">
              <Surtitre sombre>{SITUATION.surtitre}</Surtitre>
            </Arrive>
            <div className="o-relative o-z-10 o-mx-auto o-mt-6 o-max-w-5xl">
              <TitreEnVue
                as="h2"
                cadence={18}
                className="o-m-0 o-text-balance o-text-white"
                style={{ ...grandCorps, textAlign: 'center' }}
              >
                {SITUATION.corps}
              </TitreEnVue>
              <span id="bv-lieu" className="o-sr-only">
                {SITUATION.surtitre}
              </span>
            </div>
            <Arrive delai={120} distance={16} className="o-relative o-z-10 o-mt-10">
              <Bouton href="#visiter" surImage className="o-w-60">
                {SITUATION.action}
              </Bouton>
            </Arrive>
            {pointeurFin && <Coin position="bg">{SITUATION.indication}</Coin>}
          </section>

          {/*
            ----- Les acquereurs -------------------------------------------------

            Une grille de trois par trois : six cartes de verre, le centre et la
            contre-diagonale vides. Derriere, sur toute la section, le sigle en
            volume qui tourne et passe.
          */}
          <section
            id="achat"
            ref={(element) => {
              achat.current = element
              setAchatElement(element)
            }}
            aria-labelledby="bv-achat"
            className="o-relative o-isolate o-scroll-mt-24 o-overflow-hidden o-bg-white o-px-5 o-py-20 dark:o-bg-zinc-950 md:o-px-10 md:o-py-28"
          >
            {sigle}
            <span className="o-sr-only">{ACQUEREURS.sigle}</span>

            <div className="o-relative o-z-10 o-grid o-gap-6 md:o-grid-cols-12 md:o-gap-10">
              <Arrive distance={16} className="md:o-col-span-7">
                <Surtitre as="h2" id="bv-achat">
                  {ACQUEREURS.surtitre}
                </Surtitre>
              </Arrive>
              <Arrive delai={100} distance={16} className="md:o-col-span-5">
                <p className="o-m-0 o-max-w-md o-text-base o-font-light o-leading-snug o-text-zinc-800 dark:o-text-zinc-300">
                  {ACQUEREURS.intro}
                </p>
              </Arrive>
            </div>

            <div className="o-relative o-z-10 o-mt-10 o-grid o-grid-cols-1 o-gap-2 sm:o-grid-cols-2 md:o-grid-cols-3">
              {Array.from({ length: 9 }, (_, caseRang) => {
                const profil = parCase.get(caseRang)
                if (profil === undefined) {
                  return (
                    <div
                      key={caseRang}
                      aria-hidden="true"
                      className="o-hidden md:o-block"
                    />
                  )
                }
                const delai = Math.max(0, ordre.indexOf(caseRang)) * 110
                return (
                  <article
                    key={caseRang}
                    className={`o-flex o-flex-col o-p-6 md:o-p-8 ${verre(false)}`}
                    style={{ minHeight: 'clamp(15rem, 26vw, 28rem)', borderRadius: 10 }}
                  >
                    <Arrive
                      delai={delai}
                      className="o-flex o-h-full o-grow o-flex-col o-justify-between o-gap-8"
                    >
                      <div className="o-flex o-flex-col o-gap-6">
                        <p className="o-m-0 o-text-lg o-text-zinc-500 dark:o-text-zinc-400">
                          {profil.rang}
                        </p>
                        <h3
                          className="o-m-0 o-text-zinc-950 dark:o-text-zinc-50"
                          style={grandCorps}
                        >
                          {profil.titre}
                        </h3>
                      </div>
                      <p className="o-m-0 o-text-lg o-leading-snug o-text-zinc-950 dark:o-text-zinc-50">
                        {profil.texte}
                      </p>
                    </Arrive>
                  </article>
                )
              })}
            </div>
          </section>

          {/*
            ----- Le contact -----------------------------------------------------
          */}
          <section
            id="visiter"
            aria-labelledby="bv-visiter"
            className="o-relative o-isolate o-flex o-scroll-mt-24 o-flex-col o-items-center o-overflow-hidden o-px-5 o-pb-16 o-pt-20 md:o-pb-20 md:o-pt-24"
            style={{ ...crepuscule(), minHeight: ECRAN }}
          >
            <div
              aria-hidden="true"
              className="o-pointer-events-none o-absolute o-inset-x-0 o-bottom-0 o-z-0"
              style={{ height: '50%', backgroundImage: SOL }}
            />
            <div
              className="o-pointer-events-none o-absolute o-bottom-0 o-left-1/2 o-z-0"
              style={{ transform: 'translateX(-50%)', width: 'min(110vw, 1400px)' }}
            >
              <Parallaxe vitesse={0.08} glisse={0.6}>
                <Maison
                  mode="rendu"
                  prefixe="bv-contact"
                  vallee
                  className="o-block o-w-full"
                  style={{ marginBottom: '-2%' }}
                  label="La maison entiere au crepuscule, eclairee de l interieur."
                />
              </Parallaxe>
            </div>

            <Arrive distance={16} className="o-relative o-z-10 o-flex o-justify-center">
              <Surtitre sombre>{CONTACT.surtitre}</Surtitre>
            </Arrive>
            <Arrive
              delai={80}
              className="o-relative o-z-10 o-mt-6 o-max-w-5xl o-text-center"
            >
              <h2 id="bv-visiter" className="o-m-0 o-text-balance" style={titreAffiche}>
                <span style={{ color: 'rgba(255, 255, 255, 0.62)' }}>
                  {CONTACT.eteint}
                </span>{' '}
                <span className="o-text-white">{CONTACT.allume}</span>
              </h2>
            </Arrive>

            <Arrive
              delai={160}
              className="o-relative o-z-10 o-mt-16 o-w-full o-max-w-7xl md:o-mt-24"
            >
              <div
                className="o-rounded-lg o-bg-white-80 o-p-6 o-text-zinc-950 o-backdrop-blur-2xl md:o-p-8"
                style={{ borderRadius: 10 }}
              >
                <p className="o-m-0 o-max-w-4xl o-text-zinc-950" style={grandCorps}>
                  {CONTACT.corps}
                </p>
                <form
                  className="o-mt-12 o-flex o-flex-col o-gap-8 md:o-mt-20"
                  onSubmit={(evenement) => {
                    evenement.preventDefault()
                  }}
                >
                  <div className="o-flex o-flex-col o-gap-6 md:o-flex-row md:o-items-center md:o-gap-8">
                    {CONTACT.champs.map((champ) => (
                      <div
                        key={champ.nom}
                        className="o-flex o-flex-1 o-items-center o-border-b o-border-zinc-950 o-pb-3"
                      >
                        <label htmlFor={`bv-${champ.nom}`} className="o-sr-only">
                          {champ.etiquette}
                        </label>
                        <input
                          id={`bv-${champ.nom}`}
                          data-bv-champ=""
                          name={champ.nom}
                          type={champ.type}
                          autoComplete={champ.completion}
                          placeholder={champ.etiquette}
                          className="o-w-full o-bg-transparent o-text-lg o-text-zinc-950 o-outline-none focus:o-ring"
                        />
                      </div>
                    ))}
                  </div>
                  <Bouton surImage>{CONTACT.action}</Bouton>
                </form>
              </div>
            </Arrive>
          </section>
        </main>

        {/*
          ----- Le pied : une ligne d adresse, et les mentions --------------------
        */}
        <footer className="o-border-t bv-filet-bord o-px-5 o-py-8 md:o-px-10">
          <div className="o-mx-auto o-flex o-max-w-7xl o-flex-wrap o-items-center o-justify-between o-gap-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400">
            <span className="o-flex o-items-center o-gap-3">
              <Sigle className="o-w-4" style={{ color: ORANGE }} />
              Belvedere — agence immobiliere, 74230 Manigod
            </span>
            <span>Un mandat par bien, pas deux</span>
            <span className="o-flex o-flex-wrap o-items-center o-gap-4">
              <a
                href="#haut"
                className="o-no-underline o-text-zinc-600 hover:o-text-zinc-950 focus:o-ring dark:o-text-zinc-400 dark:hover:o-text-zinc-50"
              >
                Mentions legales
              </a>
              <a
                href="#haut"
                className="o-no-underline o-text-zinc-600 hover:o-text-zinc-950 focus:o-ring dark:o-text-zinc-400 dark:hover:o-text-zinc-50"
              >
                Honoraires
              </a>
              <span>© 2026 Belvedere</span>
            </span>
          </div>
        </footer>
      </div>
    </Porte>
  )
}

/** La planche de la maison au trait, qui se dessine a l entree dans le champ. */
function Planche(): ReactElement {
  const [ref, vu] = useVu(0.35)
  return (
    <figure
      ref={ref}
      className="o-relative o-m-0 o-flex o-items-center o-justify-center o-overflow-hidden o-rounded-lg o-bg-zinc-100 o-p-8 o-text-zinc-950 dark:o-bg-zinc-900 dark:o-text-zinc-50 md:o-p-12"
      style={{ aspectRatio: '789 / 683' }}
    >
      <Maison
        mode="trait"
        prefixe="bv-planche"
        dessine={vu}
        className="o-block o-w-full"
        label={MAISON.planche}
      />
      <figcaption className="o-absolute o-bottom-4 o-left-6 o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400">
        {MAISON.planche}
      </figcaption>
    </figure>
  )
}
