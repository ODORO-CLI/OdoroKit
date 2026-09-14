/**
 * Criee — poissonnerie de quartier, Brest.
 *
 * ## Le mecanisme : l arrivage du jour
 *
 * Une poissonnerie honnete ne tient pas un catalogue : elle tient **une liste
 * du jour**, et cette liste dit d ou vient chaque poisson. Sept lots sont
 * ecrits a la main avec l espece, le bateau, le port de debarque, l engin, la
 * taille et le prix au kilo. La page ajoute ce qu aucune etiquette ne dit :
 *
 * - un **feu de saison** calcule sur le mois du visiteur, a partir d un
 *   calendrier de douze mois par espece — vert en pleine saison, orange en
 *   bordure, rouge pendant le frai ;
 * - un **filtre par port** qui recompose la liste ;
 * - un **plan cote** (C20) : l espece choisie est dessinee a plat, et les
 *   chiffres sont poses sur les cotes — taille, poids, rendement au filetage.
 *
 * Rien n est simule : changez de mois sur la machine et les feux changent.
 *
 * ## L encre qui fonce le papier
 *
 * La filiation est Dantora : une page de papier ou l encre s installe. La
 * nappe d eau derive derriere l ouverture, puis chaque coupe de section est
 * une **tache d encre** dessinee qui mord le papier. Le fond ne coute aucune
 * surface graphique — trois taches floues en CSS et deux chemins SVG.
 *
 * ## Le mouvement
 *
 * M-parallaxe avec glisse : le poisson de l ouverture, les plans de mer et les
 * legendes derivent a des vitesses differentes et **continuent de couler apres
 * l arret de la molette**.
 *
 * @module
 */

import { useMotionState } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import { Anchor, ArrowDown, Phone } from '@odoro-cli/icons/filaire'
import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactElement,
} from 'react'

import { GradualBlur } from '@/odoro/effect/GradualBlur.jsx'
import { SplitFlap } from '@/odoro/text/SplitFlap.jsx'
import { PillTabs } from '@/odoro/ui/PillTabs.jsx'

import { nuit } from './communs.jsx'
import {
  Actions,
  affiche,
  BarreGelule,
  CHROME,
  Coin,
  Etiquette,
  Indice,
  Manifeste,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
  type Lien,
} from './marche.jsx'
import { accent, accentDoux, encre, encreSurSombre } from './palettes.js'
import { Nappe, Parallaxe } from './scene.jsx'

/** La hauteur d un ecran sous les barres de la documentation. */
const ECRAN = `calc(100vh - ${String(CHROME)}px)`

/** Les rubriques de la barre. */
const NAVIGATION: readonly Lien[] = [
  ['#arrivage', 'L arrivage'],
  ['#bateaux', 'Les bateaux'],
  ['#atelier', 'Au comptoir'],
  ['#appeler', 'Appeler'],
]

/* ============================ L arrivage =============================== */

/** Le niveau de saison d un mois : pleine, bordure, frai. */
type Feu = 'v' | 'o' | 'r'

/** Un lot debarque ce matin. */
interface Lot {
  readonly cle: string
  readonly espece: string
  readonly bateau: string
  readonly port: string
  readonly portCle: string
  readonly engin: string
  /** Taille moyenne du lot, en centimetres. */
  readonly taille: number
  /** Poids moyen d une piece, en kilogrammes. */
  readonly poids: number
  /** Prix au kilo, en euros. */
  readonly prix: number
  /** Rendement au filetage, en pour cent du poids vif. */
  readonly rendement: number
  /** Douze mois, du janvier au decembre. */
  readonly calendrier: string
  /** Ce qu on en fait, dit au comptoir. */
  readonly conseil: string
}

const LOTS: readonly [Lot, ...Lot[]] = [
  {
    cle: 'bar',
    espece: 'Bar de ligne',
    bateau: 'L Iroise II',
    port: 'Le Guilvinec',
    portCle: 'guilvinec',
    engin: 'Ligne a main, un hamecon',
    taille: 46,
    poids: 1.9,
    prix: 28.5,
    rendement: 45,
    calendrier: 'rrrovvvvvvvo',
    conseil:
      'Entier au four, sur un lit de fenouil. La chair est ferme, elle ne demande rien.',
  },
  {
    cle: 'lieu',
    espece: 'Lieu jaune',
    bateau: 'Sainte-Barbe',
    port: 'Loctudy',
    portCle: 'loctudy',
    engin: 'Ligne de fond',
    taille: 58,
    poids: 2.6,
    prix: 19.8,
    rendement: 48,
    calendrier: 'vvoorrrovvvv',
    conseil:
      'En pave epais, poele cote peau, sept minutes. Le meilleur rapport de la criee.',
  },
  {
    cle: 'sardine',
    espece: 'Sardine',
    bateau: 'Le Cormoran',
    port: 'Saint-Guenole',
    portCle: 'guenole',
    engin: 'Bolinche, maille de 20 mm',
    taille: 17,
    poids: 0.06,
    prix: 9.4,
    rendement: 62,
    calendrier: 'rrrovvvvvvor',
    conseil: 'Sur le grill, cinq minutes, gros sel. Achetee le matin, mangee le soir.',
  },
  {
    cle: 'saint-jacques',
    espece: 'Coquille Saint-Jacques',
    bateau: 'Marie-Jeanne',
    port: 'Erquy',
    portCle: 'erquy',
    engin: 'Drague, quarante-cinq minutes de trait',
    taille: 11,
    poids: 0.18,
    prix: 14.9,
    rendement: 22,
    calendrier: 'vvvoorrrrvvv',
    conseil: 'Noix a cru, huile d olive et citron vert. La barde part au fumet.',
  },
  {
    cle: 'maquereau',
    espece: 'Maquereau',
    bateau: 'Le Cormoran',
    port: 'Saint-Guenole',
    portCle: 'guenole',
    engin: 'Bolinche, maille de 20 mm',
    taille: 31,
    poids: 0.4,
    prix: 7.6,
    rendement: 55,
    calendrier: 'oovvvvvvvoor',
    conseil:
      'En filets au vin blanc, ou marine vingt-quatre heures. Le poisson le moins cher de la halle.',
  },
  {
    cle: 'sole',
    espece: 'Sole',
    bateau: 'L Iroise II',
    port: 'Le Guilvinec',
    portCle: 'guilvinec',
    engin: 'Filet maillant cale',
    taille: 34,
    poids: 0.45,
    prix: 42,
    rendement: 40,
    calendrier: 'rrrovvvvvvvo',
    conseil:
      'Meuniere, beurre demi-sel, rien d autre. Nous la levons devant vous si vous voulez.',
  },
  {
    cle: 'tourteau',
    espece: 'Tourteau',
    bateau: 'Marie-Jeanne',
    port: 'Erquy',
    portCle: 'erquy',
    engin: 'Casier, releve toutes les 48 h',
    taille: 17,
    poids: 0.9,
    prix: 12.5,
    rendement: 30,
    calendrier: 'oovvvvvvvvoo',
    conseil: 'Cuit au court-bouillon a la commande. Comptez un tourteau pour deux.',
  },
]

/** Les ports, pour le filtre. */
const PORTS = [
  { id: 'tous', label: 'Tous les ports' },
  { id: 'guilvinec', label: 'Le Guilvinec' },
  { id: 'loctudy', label: 'Loctudy' },
  { id: 'guenole', label: 'Saint-Guenole' },
  { id: 'erquy', label: 'Erquy' },
] as const

/** Les douze mois, pour le calendrier de saison. */
const MOIS = [
  'Jan',
  'Fev',
  'Mar',
  'Avr',
  'Mai',
  'Jui',
  'Jul',
  'Aou',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
] as const

/** Le feu d une espece au mois demande. */
function feuDe(lot: Lot, mois: number): Feu {
  const lettre = lot.calendrier[mois]
  return lettre === 'v' || lettre === 'o' ? lettre : 'r'
}

/** Ce que dit un feu, en toutes lettres. */
const DIT_FEU: Readonly<Record<Feu, string>> = {
  v: 'Pleine saison',
  o: 'Bordure de saison',
  r: 'Periode de frai — nous n en vendons pas',
}

/** La couleur d un feu. Trois teintes du systeme, hors palette de la vitrine. */
const TEINTE_FEU: Readonly<Record<Feu, string>> = {
  v: 'var(--o-palette-emerald-500)',
  o: 'var(--o-palette-amber-500)',
  r: 'var(--o-palette-rose-500)',
}

/** Un prix en euros, a la francaise. */
function euros(n: number): string {
  return `${n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} EUR`
}

/* ============================ Le papier et l encre ===================== */

/**
 * La tache d encre qui mord le papier.
 *
 * Deux chemins irreguliers empiles, l un plus pale que l autre : c est ainsi
 * qu une encre se pose sur une fibre — un coeur sature, un halo qui fuit. Elle
 * sert de coupe entre deux sections, a la place d un filet.
 */
function Encrage({ retourne = false }: { readonly retourne?: boolean }): ReactElement {
  return (
    <div
      aria-hidden="true"
      className="o-pointer-events-none o-relative o-h-16 o-w-full o-overflow-hidden md:o-h-24"
    >
      <svg
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
        className="o-h-full o-w-full"
        style={{ transform: retourne ? 'scaleY(-1)' : undefined }}
      >
        <path
          d="M0 0h1200v42c-64 14-118-8-172 2-54 10-86 34-148 30-62-4-92-30-150-28-58 2-96 30-160 32-64 2-112-22-176-18-64 4-118 28-194 22V0Z"
          fill={accentDoux(700, 34)}
        />
        <path
          d="M0 0h1200v22c-52 10-96-6-142 2-46 8-72 26-124 24-52-2-80-24-128-22-48 2-80 24-134 26-54 2-94-18-148-14-54 4-100 22-164 18V0Z"
          fill={accentDoux(800, 62)}
        />
      </svg>
    </div>
  )
}

/* ============================ Les poissons dessines ==================== */

/** Le poisson de l ouverture : un lieu jaune, de profil, au trait. */
function PoissonDeProfil(): ReactElement {
  return (
    <svg
      viewBox="0 0 520 240"
      className="o-h-full o-w-full"
      aria-hidden="true"
      fill="none"
    >
      <path
        d="M52 120c56-62 150-88 236-84 62 3 108 24 140 46 22-20 48-34 78-42-14 30-18 56-14 80-4 24 0 50 14 80-30-8-56-22-78-42-32 22-78 43-140 46-86 4-180-22-236-84Z"
        fill={accentDoux(400, 55)}
        stroke={accent(800)}
        strokeWidth="2.4"
        strokeLinejoin="round"
      />
      <path
        d="M258 40c10 22 12 38 10 54M258 200c10-22 12-38 10-54"
        stroke={accent(800)}
        strokeWidth="2.4"
      />
      <path
        d="M180 96c-30 10-44 24-44 24s14 14 44 24"
        stroke={accent(800)}
        strokeWidth="2"
      />
      <circle cx="116" cy="108" r="9" fill={accent(900)} />
      <circle cx="113" cy="105" r="3" fill={accent(100)} />
      <path d="M86 92c14 22 14 34 0 56" stroke={accent(800)} strokeWidth="2.4" />
      {[0, 1, 2, 3, 4].map((rang) => (
        <path
          key={rang}
          d={`M${String(180 + rang * 52)} ${String(84 + (rang % 2) * 10)}q18 12 0 24`}
          stroke={accent(700)}
          strokeWidth="1.6"
          opacity="0.75"
        />
      ))}
      <path
        d="M130 120h310"
        stroke={accent(700)}
        strokeWidth="1.4"
        opacity="0.6"
        strokeDasharray="7 9"
      />
    </svg>
  )
}

/**
 * Le plan cote (C20) : l espece a plat, et les chiffres poses sur les cotes.
 *
 * Le dessin est le meme silhouette pour tous les lots — un poisson de halle —
 * mais les cotes, elles, sont celles du lot regarde. C est un plan d atelier,
 * pas une illustration : les lignes d attache, les fleches et les valeurs sont
 * a leur place, et la longueur du trait horizontal suit la taille reelle.
 */
function PlanCote({ lot }: { readonly lot: Lot }): ReactElement {
  // La cote de longueur occupe entre la moitie et toute la largeur utile,
  // selon la taille du lot : une sardine ne doit pas se dessiner comme un bar.
  const partLongueur = Math.min(1, Math.max(0.42, lot.taille / 60))
  const x2 = 70 + partLongueur * 400
  const trait = encre()
  return (
    <svg
      viewBox="0 0 540 320"
      className="o-h-auto o-w-full"
      role="img"
      aria-label={`Plan cote du lot : ${lot.espece}, ${String(lot.taille)} centimetres, ${String(lot.poids)} kilogramme en moyenne`}
    >
      {/* Le papier millimetre du plan. */}
      <g stroke={trait} opacity="0.12">
        {Array.from({ length: 14 }, (_, rang) => (
          <line
            key={`h${String(rang)}`}
            x1="0"
            y1={rang * 24}
            x2="540"
            y2={rang * 24}
            strokeWidth="0.6"
          />
        ))}
        {Array.from({ length: 23 }, (_, rang) => (
          <line
            key={`v${String(rang)}`}
            x1={rang * 24}
            y1="0"
            x2={rang * 24}
            y2="320"
            strokeWidth="0.6"
          />
        ))}
      </g>

      {/* La silhouette, a plat. */}
      <g
        transform={`translate(70 96) scale(${String(partLongueur)} ${String(0.7 + partLongueur * 0.3)})`}
      >
        <path
          d="M0 60C46 6 130-16 210-12c56 3 98 22 128 42 20-18 44-30 72-38-13 27-17 50-13 72-4 22 0 45 13 72-28-8-52-20-72-38-30 20-72 39-128 42C130 136 46 114 0 60Z"
          fill={accentDoux(400, 40)}
          stroke={trait}
          strokeWidth="2.4"
          strokeLinejoin="round"
        />
        <circle cx="58" cy="46" r="8" fill={trait} />
        <path d="M30 34c13 20 13 32 0 52" stroke={trait} strokeWidth="2" fill="none" />
      </g>

      {/* La cote de longueur. */}
      <g stroke={trait} strokeWidth="1.4" fill="none">
        <line x1="70" y1="216" x2="70" y2="248" />
        <line x1={x2} y1="216" x2={x2} y2="248" />
        <line x1="70" y1="238" x2={x2} y2="238" />
        <path
          d={`M70 238l10-5v10ZM${String(x2)} 238l-10-5v10Z`}
          fill={trait}
          stroke="none"
        />
      </g>
      <text
        x={(70 + x2) / 2}
        y="230"
        textAnchor="middle"
        fontSize="20"
        fontFamily="var(--o-font-mono)"
        fill={trait}
      >
        {lot.taille} cm
      </text>

      {/* La cote de poids, attachee au dos. */}
      <g stroke={trait} strokeWidth="1.4" fill="none" opacity="0.9">
        <line x1={x2 - 40} y1="92" x2="500" y2="52" />
        <circle cx={x2 - 40} cy="92" r="3.5" fill={trait} />
      </g>
      <text
        x="500"
        y="46"
        textAnchor="end"
        fontSize="18"
        fontFamily="var(--o-font-mono)"
        fill={trait}
      >
        {lot.poids.toLocaleString('fr-FR')} kg la piece
      </text>

      {/* La cote de rendement, attachee au filet. */}
      <g stroke={trait} strokeWidth="1.4" fill="none" opacity="0.9">
        <line x1="200" y1="140" x2="150" y2="290" />
        <circle cx="200" cy="140" r="3.5" fill={trait} />
      </g>
      <text
        x="150"
        y="308"
        textAnchor="middle"
        fontSize="18"
        fontFamily="var(--o-font-mono)"
        fill={trait}
      >
        {lot.rendement} pour cent de filet
      </text>
    </svg>
  )
}

/* ============================ Le numero qui se compose (A20) =========== */

/** Le numero de la poissonnerie, chiffre a chiffre. */
const NUMERO = ['02', '98', '44', '17', '30'] as const

/**
 * Le numero qui se compose au survol.
 *
 * Au repos, le numero est masque par des traits ; quand le pointeur entre — ou
 * quand le lien prend le focus au clavier — les paires se posent une a une,
 * comme un cadran a impulsions. Sous mouvement reduit, le numero est entier
 * des le premier rendu : personne ne doit avoir a survoler pour lire un
 * telephone. Le lecteur d ecran, lui, a toujours le numero complet.
 */
function NumeroQuiSeCompose(): ReactElement {
  const { reduced } = useMotionState()
  const [poses, setPoses] = useState(reduced ? NUMERO.length : 0)
  const [compose, setCompose] = useState(reduced)

  useEffect(() => {
    if (reduced || !compose) return
    if (poses >= NUMERO.length) return
    const id = window.setTimeout(() => {
      setPoses((rang) => rang + 1)
    }, 180)
    return () => {
      window.clearTimeout(id)
    }
  }, [compose, poses, reduced])

  const partir = (): void => {
    setCompose(true)
  }
  const revenir = (): void => {
    if (reduced) return
    setCompose(false)
    setPoses(0)
  }

  return (
    <a
      href="tel:+33298441730"
      onPointerEnter={partir}
      onPointerLeave={revenir}
      onFocus={partir}
      onBlur={revenir}
      className="o-inline-flex o-flex-wrap o-items-baseline o-gap-x-4 o-gap-y-2 o-no-underline focus:o-ring"
      aria-label="Appeler la poissonnerie au 02 98 44 17 30"
    >
      {NUMERO.map((paire, rang) => (
        <span
          key={paire + String(rang)}
          aria-hidden="true"
          className="o-inline-flex o-items-end o-tabular-nums"
          style={{
            ...affiche('xl', 800),
            fontSize: 'clamp(2.5rem, 11vw, 8rem)',
            color: encre(),
          }}
        >
          {rang < poses ? (
            paire
          ) : (
            // Deux traits, pas deux soulignes : un caractere de remplacement
            // serait du texte pale a lire, et il n y a rien a lire tant que le
            // numero ne s est pas compose.
            <span
              className="o-inline-flex o-items-end o-gap-2"
              style={{ height: '0.78em' }}
            >
              <span
                className="o-block o-h-1.5 o-w-8 o-rounded-full md:o-w-14"
                style={{ backgroundColor: 'var(--o-theme-line)' }}
              />
              <span
                className="o-block o-h-1.5 o-w-8 o-rounded-full md:o-w-14"
                style={{ backgroundColor: 'var(--o-theme-line)' }}
              />
            </span>
          )}
        </span>
      ))}
    </a>
  )
}

/* ============================ Le mois courant ========================== */

/** Le mois du visiteur, de 0 a 11, relu a chaque montage. */
function useMois(): number {
  const [mois] = useState(() => new Date().getMonth())
  return mois
}

/* ============================ La page ================================== */

export default function Page(): ReactElement {
  const polices = usePolices('oswald')
  const mois = useMois()
  const [port, setPort] = useState<string>('tous')
  const [ouvert, setOuvert] = useState<string>(LOTS[0].cle)

  const listes = useMemo(
    () => (port === 'tous' ? LOTS : LOTS.filter((l) => l.portCle === port)),
    [port],
  )
  const lot = useMemo(
    () => listes.find((l) => l.cle === ouvert) ?? listes[0] ?? LOTS[0],
    [listes, ouvert],
  )

  /** Le nombre de lots en pleine saison, dit tel quel dans l ouverture. */
  const enSaison = useMemo(
    () => LOTS.filter((l) => feuDe(l, mois) === 'v').length,
    [mois],
  )

  return (
    <Porte forme="trou" marque="Criee" sombre={false}>
      <div className="o-relative o-overflow-hidden" style={polices}>
        {/*
          ----- L ouverture : la nappe d eau, le poisson qui derive ------------
        */}
        <section
          id="haut"
          className="o-relative o-isolate o-flex o-flex-col"
          style={{ minHeight: ECRAN, backgroundColor: accentDoux(300, 12) }}
        >
          <Nappe
            couleurs={[accentDoux(400, 62), accentDoux(600, 46), accentDoux(200, 70)]}
            opacite={0.85}
            className="o-z-0"
          />
          <div aria-hidden="true" className="o-absolute o-inset-x-0 o-bottom-0 o-z-0">
            <GradualBlur
              side="bottom"
              size={160}
              strength={14}
              layers={6}
              scrollable={false}
              tint={accentDoux(200, 40)}
            >
              <div className="o-h-40 o-w-full" />
            </GradualBlur>
          </div>

          <BarreGelule
            marque="Criee"
            liens={NAVIGATION}
            action={['#appeler', 'Appeler']}
            sombre={false}
          />

          <div className="o-relative o-z-10 o-mx-auto o-grid o-w-full o-max-w-7xl o-grow o-gap-8 o-px-6 o-pb-16 o-pt-28 md:o-grid-cols-12 md:o-items-center md:o-px-10">
            <div className="md:o-col-span-7">
              <Surgit>
                <Etiquette sombre={false}>
                  Halle Saint-Louis, Brest — debarque de 5 h 20
                </Etiquette>
              </Surgit>
              <TitreVague
                delai={140}
                className="o-m-0 o-mt-6 o-max-w-3xl o-uppercase o-text-slate-900 dark:o-text-slate-50"
                style={{
                  ...affiche('l', 700),
                  fontSize: 'clamp(2.5rem, 7.6vw, 7.5rem)',
                  letterSpacing: '-0.02em',
                }}
              >
                Sept lots, sept bateaux, un matin.
              </TitreVague>
              <Surgit
                delai={540}
                as="p"
                className="o-m-0 o-mt-7 o-max-w-md o-text-base o-leading-relaxed o-text-slate-700 dark:o-text-slate-200"
              >
                Nous n achetons qu a la criee, et nous ecrivons le nom du bateau sur l
                etiquette. Ce qui n est pas de saison n est pas sur l etal :{' '}
                {String(enSaison)} especes sur sept le sont ce mois-ci.
              </Surgit>
              <Surgit delai={660} className="o-mt-9">
                <Actions
                  pleine={[
                    '#arrivage',
                    <>
                      Voir l arrivage{' '}
                      <Icon icon={ArrowDown} size={16} aria-hidden="true" />
                    </>,
                  ]}
                  fantome={['#bateaux', 'Les bateaux']}
                  sombre={false}
                />
              </Surgit>
            </div>

            <div className="o-min-w-0 md:o-col-span-5">
              <Parallaxe vitesse={0.34} glisse={0.78} className="o-block">
                <PoissonDeProfil />
              </Parallaxe>
            </div>
          </div>

          <div className="o-relative o-z-10 o-hidden md:o-block">
            <Coin position="bd" sombre={false}>
              Mardi au samedi 8 h — 13 h
              <br />
              et 16 h — 19 h 30
            </Coin>
          </div>
        </section>

        <Encrage />

        {/*
          ----- Le mecanisme : l arrivage du jour -------------------------------
        */}
        <section
          id="arrivage"
          className="o-relative o-scroll-mt-24 o-px-6 o-pb-20 o-pt-4 md:o-px-10 md:o-pb-28"
        >
          <div className="o-mx-auto o-max-w-7xl">
            <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
              <div className="md:o-col-span-7">
                <Indice rang="01" sombre={false}>
                  L arrivage
                </Indice>
                <h2
                  className="o-m-0 o-mt-5 o-max-w-2xl o-uppercase o-text-slate-900 dark:o-text-slate-50"
                  style={{
                    ...affiche('m', 700),
                    fontSize: 'clamp(1.9rem, 4.4vw, 3.75rem)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Le tableau de la criee
                </h2>
              </div>
              <p className="o-m-0 o-text-sm o-leading-relaxed o-text-slate-700 dark:o-text-slate-300 md:o-col-span-5">
                Le feu est calcule sur le mois de votre machine ({MOIS[mois] ?? 'Jan'}) et
                sur le calendrier de chaque espece. Rouge veut dire frai : nous n en
                achetons pas, meme quand la criee en propose.
              </p>
            </div>

            <div className="o-mt-10">
              <PillTabs
                items={PORTS.map((p) => ({ id: p.id, label: p.label }))}
                value={port}
                onValueChange={(id) => {
                  setPort(id)
                }}
                label="Filtrer par port de debarque"
                style={
                  {
                    // La pastille est un aplat doux, et l encre de l onglet
                    // actif reste celle du theme : une encre claire sur une
                    // pastille claire serait illisible des que la barre change
                    // de teinte.
                    '--o-pill-fill': accentDoux(400, 46),
                    '--o-pill-ink': 'var(--o-theme-fg)',
                  } as CSSProperties
                }
              />
            </div>

            {/* Le tableau, rang par rang. Chaque nom bat comme un afficheur. */}
            <ol
              className="o-m-0 o-mt-10 o-list-none o-border-t o-p-0"
              style={{ borderColor: 'var(--o-theme-line)' }}
            >
              {listes.map((l) => {
                const feu = feuDe(l, mois)
                const actif = l.cle === lot.cle
                return (
                  <li
                    key={l.cle}
                    className="o-border-b"
                    style={{ borderColor: 'var(--o-theme-line)' }}
                  >
                    <button
                      type="button"
                      aria-pressed={actif}
                      onClick={() => {
                        setOuvert(l.cle)
                      }}
                      className="o-grid o-w-full o-cursor-pointer o-items-center o-gap-3 o-bg-transparent o-px-0 o-py-5 o-text-left o-transition-colors hover:o-opacity-80 focus:o-ring md:o-grid-cols-12 md:o-gap-6"
                    >
                      <span className="o-flex o-items-center o-gap-3 md:o-col-span-4">
                        <span
                          aria-hidden="true"
                          className="o-size-3 o-shrink-0 o-rounded-full"
                          style={{ backgroundColor: TEINTE_FEU[feu] }}
                        />
                        <SplitFlap
                          as="span"
                          interval={45}
                          step={22}
                          className="o-text-base o-font-semibold o-tracking-tight o-text-slate-900 dark:o-text-slate-50"
                        >
                          {l.espece}
                        </SplitFlap>
                      </span>
                      <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-600 dark:o-text-slate-300 md:o-col-span-3">
                        {l.bateau}
                      </span>
                      <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-600 dark:o-text-slate-300 md:o-col-span-2">
                        {l.port}
                      </span>
                      <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-600 dark:o-text-slate-300 md:o-col-span-1">
                        {l.taille} cm
                      </span>
                      <span
                        className="o-tabular-nums o-text-base o-font-semibold md:o-col-span-2 md:o-text-right"
                        style={{ color: encre() }}
                      >
                        {euros(l.prix)} / kg
                      </span>
                    </button>
                  </li>
                )
              })}
            </ol>
            {listes.length === 0 && (
              <p className="o-mt-8 o-text-lg o-text-slate-700 dark:o-text-slate-300">
                Ce port n a pas debarque ce matin. Le vent d ouest tenait a huit ce
                week-end.
              </p>
            )}

            {/* La fiche du lot regarde : le plan cote et le calendrier. */}
            <div className="o-mt-16 o-grid o-gap-12 md:o-grid-cols-12">
              <div className="o-min-w-0 md:o-col-span-6">
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-500 dark:o-text-slate-400">
                  Plan cote du lot
                </p>
                <div
                  className="o-mt-5 o-rounded-2xl o-border-w-1 o-p-4"
                  style={{
                    borderColor: 'var(--o-theme-line)',
                    backgroundColor: accentDoux(200, 16),
                  }}
                >
                  <PlanCote lot={lot} />
                </div>
              </div>

              <div className="o-min-w-0 md:o-col-span-6">
                <h3
                  className="o-m-0 o-uppercase o-text-slate-900 dark:o-text-slate-50"
                  style={{
                    ...affiche('m', 700),
                    fontSize: 'clamp(1.6rem, 3.4vw, 2.75rem)',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {lot.espece}
                </h3>
                <p
                  className="o-m-0 o-mt-3 o-inline-flex o-items-center o-gap-2 o-rounded-full o-px-3 o-py-1 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                  style={{
                    backgroundColor: 'var(--o-theme-surface)',
                    color: 'var(--o-theme-fg)',
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="o-size-2 o-rounded-full"
                    style={{ backgroundColor: TEINTE_FEU[feuDe(lot, mois)] }}
                  />
                  {DIT_FEU[feuDe(lot, mois)]}
                </p>
                <p className="o-m-0 o-mt-6 o-max-w-md o-text-base o-leading-relaxed o-text-slate-700 dark:o-text-slate-200">
                  {lot.conseil}
                </p>

                {/* Le calendrier de saison : douze cases, une par mois. */}
                <p className="o-m-0 o-mt-10 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-500 dark:o-text-slate-400">
                  Douze mois de {lot.espece.toLowerCase()}
                </p>
                <ol className="o-m-0 o-mt-4 o-grid o-list-none o-grid-cols-6 o-gap-1.5 o-p-0 sm:o-grid-cols-12">
                  {MOIS.map((nom, rang) => {
                    const f = feuDe(lot, rang)
                    return (
                      <li
                        key={nom}
                        className="o-flex o-flex-col o-items-center o-gap-1.5 o-rounded-md o-py-2 o-font-mono o-text-xs"
                        style={{
                          backgroundColor:
                            rang === mois ? 'var(--o-theme-surface)' : 'transparent',
                          color:
                            rang === mois ? 'var(--o-theme-fg)' : 'var(--o-theme-muted)',
                        }}
                      >
                        <span
                          aria-hidden="true"
                          className="o-size-2.5 o-rounded-full"
                          style={{ backgroundColor: TEINTE_FEU[f] }}
                        />
                        {nom}
                      </li>
                    )
                  })}
                </ol>
                <p className="o-m-0 o-mt-4 o-text-xs o-leading-relaxed o-text-slate-600 dark:o-text-slate-400">
                  Vert : pleine saison. Orange : bordure, la chair est moins grasse. Rouge
                  : frai, l espece est laissee tranquille.
                </p>

                <dl
                  className="o-m-0 o-mt-10 o-border-t"
                  style={{ borderColor: 'var(--o-theme-line)' }}
                >
                  {(
                    [
                      ['Bateau', `${lot.bateau} — ${lot.port}`],
                      ['Engin', lot.engin],
                      [
                        'Piece moyenne',
                        `${lot.taille.toLocaleString('fr-FR')} cm, ${lot.poids.toLocaleString('fr-FR')} kg`,
                      ],
                      [
                        'Rendement',
                        `${String(lot.rendement)} pour cent de filet, le reste part au fumet`,
                      ],
                      ['Prix', `${euros(lot.prix)} le kilo, vide et ecaille`],
                    ] as const
                  ).map(([quoi, valeur]) => (
                    <div
                      key={quoi}
                      className="o-grid o-gap-x-6 o-gap-y-1 o-border-b o-py-4 sm:o-grid-cols-12"
                      style={{ borderColor: 'var(--o-theme-line)' }}
                    >
                      <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-500 dark:o-text-slate-400 sm:o-col-span-4">
                        {quoi}
                      </dt>
                      <dd className="o-m-0 o-text-sm o-leading-relaxed o-text-slate-800 dark:o-text-slate-200 sm:o-col-span-8">
                        {valeur}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>
          </div>
        </section>

        {/*
          ----- Les bateaux : trois plans de mer qui derivent -------------------
        */}
        <section
          id="bateaux"
          className="o-relative o-isolate o-scroll-mt-24 o-overflow-hidden o-px-6 o-py-24 md:o-px-10 md:o-py-32"
          style={nuit('slate')}
        >
          <div aria-hidden="true" className="o-absolute o-inset-0 o-z-0">
            <Parallaxe
              vitesse={0.1}
              glisse={0.85}
              className="o-absolute o-inset-x-0 o-bottom-0 o-h-2/3"
            >
              <svg
                viewBox="0 0 1200 300"
                preserveAspectRatio="none"
                className="o-h-full o-w-full"
              >
                <path
                  d="M0 120q150-40 300 0t300 0 300 0 300 0v180H0Z"
                  fill={accentDoux(700, 30)}
                />
              </svg>
            </Parallaxe>
            <Parallaxe
              vitesse={0.22}
              glisse={0.8}
              className="o-absolute o-inset-x-0 o-bottom-0 o-h-1/2"
            >
              <svg
                viewBox="0 0 1200 240"
                preserveAspectRatio="none"
                className="o-h-full o-w-full"
              >
                <path
                  d="M0 90q120-46 240 0t240 0 240 0 240 0 240 0v150H0Z"
                  fill={accentDoux(600, 46)}
                />
              </svg>
            </Parallaxe>
            <Parallaxe
              vitesse={0.4}
              glisse={0.72}
              className="o-absolute o-inset-x-0 o-bottom-0 o-h-1/3"
            >
              <svg
                viewBox="0 0 1200 180"
                preserveAspectRatio="none"
                className="o-h-full o-w-full"
              >
                <path
                  d="M0 70q90-52 180 0t180 0 180 0 180 0 180 0 180 0v110H0Z"
                  fill={accentDoux(500, 70)}
                />
              </svg>
            </Parallaxe>
          </div>

          <div className="o-relative o-z-10 o-mx-auto o-max-w-7xl">
            <Indice rang="02">Les bateaux</Indice>
            <h2
              className="o-m-0 o-mt-6 o-max-w-4xl o-uppercase o-text-slate-50"
              style={{
                ...affiche('m', 700),
                fontSize: 'clamp(1.9rem, 4.6vw, 4rem)',
                letterSpacing: '-0.02em',
              }}
            >
              Quatre bateaux, quatre ports, et personne entre eux et nous.
            </h2>
            <ul
              className="o-m-0 o-mt-14 o-grid o-list-none o-gap-px o-p-0 md:o-grid-cols-4"
              style={{ backgroundColor: 'var(--o-theme-line)' }}
            >
              {(
                [
                  [
                    'L Iroise II',
                    'Le Guilvinec',
                    'Ligneur de 12 m, deux hommes, sortie a la journee',
                  ],
                  [
                    'Sainte-Barbe',
                    'Loctudy',
                    'Ligneur de 10 m, patron proprietaire depuis 1998',
                  ],
                  [
                    'Le Cormoran',
                    'Saint-Guenole',
                    'Bolincheur de 16 m, peche de nuit, retour a 4 h',
                  ],
                  ['Marie-Jeanne', 'Erquy', 'Caseyeur et dragueur, marees de deux jours'],
                ] as const
              ).map(([nom, lieu, texte]) => (
                <li
                  key={nom}
                  className="o-p-6"
                  style={{ backgroundColor: 'var(--o-theme-bg)' }}
                >
                  <p
                    className="o-m-0 o-flex o-items-center o-gap-2 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                    style={{ color: encreSurSombre() }}
                  >
                    <Icon icon={Anchor} size={14} aria-hidden="true" />
                    {lieu}
                  </p>
                  <p className="o-m-0 o-mt-4 o-text-xl o-font-semibold o-tracking-tight o-text-slate-50">
                    {nom}
                  </p>
                  <p className="o-m-0 o-mt-3 o-text-sm o-leading-relaxed o-text-slate-300">
                    {texte}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <Encrage retourne />

        {/*
          ----- Le comptoir : un ecran de texte seul ----------------------------
        */}
        <section
          id="atelier"
          className="o-relative o-flex o-scroll-mt-24 o-items-center o-px-6 o-py-24 md:o-px-10 md:o-py-36"
        >
          <div className="o-mx-auto o-w-full o-max-w-7xl">
            <Manifeste
              eteint="Nous ne vendons pas de saumon d elevage, pas de cabillaud d Islande, pas de crevettes de Madagascar."
              sombre={false}
            >
              Ce qui nage a moins de deux cents milles, et rien d autre. La liste est plus
              courte, elle change tous les jours, et c est tout l interet.
            </Manifeste>
          </div>
        </section>

        {/*
          ----- L appel : le numero qui se compose (A20) ------------------------
        */}
        <section
          id="appeler"
          className="o-relative o-scroll-mt-24 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
          style={{ backgroundColor: accentDoux(300, 14) }}
        >
          <div className="o-mx-auto o-max-w-7xl">
            <p className="o-m-0 o-flex o-items-center o-gap-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-600 dark:o-text-slate-300">
              <Icon icon={Phone} size={14} aria-hidden="true" />
              Commande de la veille pour le lendemain, jusqu a 18 h
            </p>
            <div className="o-mt-8">
              <NumeroQuiSeCompose />
            </div>
            <p className="o-m-0 o-mt-8 o-max-w-xl o-text-base o-leading-relaxed o-text-slate-700 dark:o-text-slate-200">
              Dites-nous le nombre de couverts, pas l espece : nous choisissons au
              debarquement et nous vous rappelons si le lot n est pas bon. Un plateau de
              fruits de mer demande quarante-huit heures.
            </p>
          </div>
        </section>

        {/*
          ----- Le pied : une etiquette de produit (P26) ------------------------
        */}
        <footer className="o-relative o-px-6 o-py-16 md:o-px-10" style={nuit('slate')}>
          <div
            className="o-mx-auto o-max-w-4xl o-rounded-lg o-border-w-1 o-p-6 md:o-p-10"
            style={{ borderColor: 'var(--o-theme-fg)' }}
          >
            <p
              className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
              style={{ color: encreSurSombre() }}
            >
              Etiquette reglementaire
            </p>
            <p
              className="o-m-0 o-mt-4 o-uppercase o-text-slate-50"
              style={{
                ...affiche('m', 700),
                fontSize: 'clamp(1.75rem, 4vw, 3rem)',
                letterSpacing: '-0.02em',
              }}
            >
              Criee — poissonnerie
            </p>
            <dl
              className="o-m-0 o-mt-8 o-border-t"
              style={{ borderColor: 'var(--o-theme-line)' }}
            >
              {(
                [
                  [
                    'Denomination',
                    'Poissons, coquillages et crustaces frais, vendus entiers ou prepares a la demande',
                  ],
                  ['Origine', 'France — Bretagne sud et nord'],
                  [
                    'Zone de peche',
                    'FAO 27.VIII.a (golfe de Gascogne) et 27.VII.e (Manche ouest)',
                  ],
                  [
                    'Engins',
                    'Ligne a main, ligne de fond, bolinche, casier, filet maillant cale, drague',
                  ],
                  [
                    'Lot',
                    'Un lot par bateau et par maree — le numero est sur le ticket de caisse',
                  ],
                  [
                    'Conservation',
                    'Entre 0 et 2 degres, sur glace ; a consommer dans les 24 heures',
                  ],
                  [
                    'Conditionnement',
                    'Papier sulfurise et sac kraft ; aucun plastique au comptoir depuis 2021',
                  ],
                  [
                    'Etablissement',
                    'Criee SARL, 7 halle Saint-Louis, 29200 Brest — agrement FR 29.019.201 CE',
                  ],
                ] as const
              ).map(([terme, valeur]) => (
                <div
                  key={terme}
                  className="o-grid o-gap-x-6 o-gap-y-1 o-border-b o-py-3.5 sm:o-grid-cols-12"
                  style={{ borderColor: 'var(--o-theme-line)' }}
                >
                  <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-400 sm:o-col-span-4">
                    {terme}
                  </dt>
                  <dd className="o-m-0 o-text-sm o-leading-relaxed o-text-slate-200 sm:o-col-span-8">
                    {valeur}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="o-m-0 o-mt-8 o-flex o-flex-wrap o-items-center o-justify-between o-gap-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-slate-400">
              <span>© 2026 Criee SARL</span>
              <a
                href="#haut"
                className="o-text-slate-400 o-no-underline hover:o-text-slate-50 focus:o-ring"
              >
                Remonter ↑
              </a>
            </p>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
