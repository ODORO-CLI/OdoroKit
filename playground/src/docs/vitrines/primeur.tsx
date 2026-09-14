/**
 * Cageot — primeur, marche d Aligre, Paris 12.
 *
 * ## La reference : Creatie
 *
 * Des autocollants penches, une nappe de couleurs qui derive, des formes
 * rondes, rien d aligne au cordeau. La page d un primeur doit avoir l air du
 * banc : de la couleur, des etiquettes ecrites a la main, et de la marchandise
 * qui deborde.
 *
 * ## Le mecanisme : le calendrier des saisons
 *
 * Dix-huit produits, et pour chacun **les douze mois de l annee, ecrits a la
 * main** : pleine saison, debut ou fin de saison, hors saison. La page lit
 * l horloge du visiteur, ouvre le mois courant, et dit ce qui est vraiment de
 * saison — le reste est **barre**, pas cache. Un primeur qui ne dit pas ce
 * qu il n a pas ne merite pas qu on le croie.
 *
 * La meme table se relit d un coup en carte de chaleur (C18) : dix-huit
 * lignes, douze colonnes, et l annee entiere se voit d un regard.
 *
 * Le fond suit : la nappe de degrade prend **les couleurs des trois premiers
 * produits du mois choisi**. En fevrier elle est terne, en juillet elle brule.
 * Ce n est pas un ornement, c est la meme donnee vue autrement.
 *
 * ## Ce que la page ne charge pas
 *
 * Aucune photographie — nous n avons pas de photographie d etal, et une
 * tomate de banque d images est pire que pas de tomate. Tout est dessine :
 * les cagettes, les pictogrammes du pied, le timbre de la carte postale.
 *
 * @module
 */

import { useMotionState } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import { ArrowRight, ArrowUpRight } from '@odoro-cli/icons/filaire'
import { Reveal } from '@odoro-cli/libs/motion'
import {
  useMemo,
  useState,
  type CSSProperties,
  type FormEvent,
  type ReactElement,
  type ReactNode,
} from 'react'

import { FloatGroup } from '@/odoro/effect/FloatGroup.jsx'
import { StickerPeel } from '@/odoro/effect/StickerPeel.jsx'
import { RotatingWords } from '@/odoro/text/RotatingWords.jsx'
import { FlipCard } from '@/odoro/ui/FlipCard.jsx'

import { nuit } from './communs.jsx'
import {
  Actions,
  affiche,
  Autocollant,
  BarreGelule,
  CHROME,
  Etiquette,
  Indice,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
  type Lien,
} from './marche.jsx'
import { accent, accentDoux, aplat, encre, encreSurSombre } from './palettes.js'
import { Flotte, Nappe } from './scene.jsx'

/** La hauteur d un ecran sous les barres de la documentation. */
const ECRAN = `calc(100vh - ${String(CHROME)}px)`

/** Les rubriques de la barre. */
const NAVIGATION: readonly Lien[] = [
  ['#calendrier', 'Les saisons'],
  ['#annee', 'L annee'],
  ['#cageot', 'Le cageot'],
  ['#carte', 'La carte'],
]

/* ============================ Les douze mois =========================== */

const MOIS = [
  'Janvier',
  'Fevrier',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Aout',
  'Septembre',
  'Octobre',
  'Novembre',
  'Decembre',
] as const

/** Les trois lettres du mois, pour la carte de chaleur. */
const MOIS_COURT = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D'] as const

/* ============================ Le calendrier ============================ */

/**
 * Un produit du banc.
 *
 * `mois` est une chaine de douze caracteres, un par mois, de janvier a
 * decembre : `X` pleine saison, `o` debut ou fin de saison, `.` hors saison.
 * C est la forme la plus courte qui reste lisible a la main — et cette table
 * est ecrite a la main, produit par produit.
 */
interface Produit {
  readonly nom: string
  readonly famille: 'fruit' | 'legume'
  readonly couleur: string
  readonly mois: string
  readonly prix: string
  readonly origine: string
  readonly note: string
}

const BANC: readonly Produit[] = [
  {
    nom: 'Fraise',
    famille: 'fruit',
    couleur: 'var(--o-palette-rose-500)',
    mois: '...oXXo.....',
    prix: '5,80 EUR la barquette',
    origine: 'Carpentras',
    note: 'Elle ne voyage pas. Une fraise de fevrier a pris l avion, et ca se goute.',
  },
  {
    nom: 'Cerise',
    famille: 'fruit',
    couleur: 'var(--o-palette-rose-700)',
    mois: '....oXo.....',
    prix: '7,20 EUR le kilo',
    origine: 'Ceret',
    note: 'Six semaines par an, pas une de plus. On en fait une affaire.',
  },
  {
    nom: 'Abricot',
    famille: 'fruit',
    couleur: 'var(--o-palette-orange-400)',
    mois: '.....oXXo...',
    prix: '4,90 EUR le kilo',
    origine: 'Vallee du Rhone',
    note: 'Cueilli mur, il ne se garde pas trois jours. C est le prix du gout.',
  },
  {
    nom: 'Melon',
    famille: 'fruit',
    couleur: 'var(--o-palette-orange-300)',
    mois: '.....oXXXo..',
    prix: '3,50 EUR piece',
    origine: 'Cavaillon',
    note: 'Lourd pour sa taille, et le pedoncule qui se decolle : les deux signes.',
  },
  {
    nom: 'Raisin',
    famille: 'fruit',
    couleur: 'var(--o-palette-purple-600)',
    mois: '.......oXXo.',
    prix: '4,60 EUR le kilo',
    origine: 'Ventoux',
    note: 'La pruine blanche sur le grain n est pas un defaut, c est la fraicheur.',
  },
  {
    nom: 'Pomme',
    famille: 'fruit',
    couleur: 'var(--o-palette-lime-500)',
    mois: 'XXo....oXXXX',
    prix: '2,90 EUR le kilo',
    origine: 'Vergers du Perche',
    note: 'La seule qui traverse l hiver sans mentir : elle se garde en chambre froide.',
  },
  {
    nom: 'Poire',
    famille: 'fruit',
    couleur: 'var(--o-palette-yellow-600)',
    mois: 'oo.....oXXXo',
    prix: '3,40 EUR le kilo',
    origine: 'Anjou',
    note: 'On la vend ferme et on la laisse murir chez vous, sur le rebord.',
  },
  {
    nom: 'Tomate',
    famille: 'legume',
    couleur: 'var(--o-palette-red-600)',
    mois: '....oXXXXo..',
    prix: '3,80 EUR le kilo',
    origine: 'Plaine de Versailles',
    note: 'Jamais au frigo. Le froid tue le parfum, et il ne revient pas.',
  },
  {
    nom: 'Courgette',
    famille: 'legume',
    couleur: 'var(--o-palette-lime-600)',
    mois: '....XXXXX...',
    prix: '2,60 EUR le kilo',
    origine: 'Ile-de-France',
    note: 'Petite et ferme. Une grosse courgette est une courgette oubliee.',
  },
  {
    nom: 'Aubergine',
    famille: 'legume',
    couleur: 'var(--o-palette-violet-700)',
    mois: '.....oXXXo..',
    prix: '3,20 EUR le kilo',
    origine: 'Provence',
    note: 'La peau doit rebondir sous le pouce. Molle, elle est amere.',
  },
  {
    nom: 'Radis',
    famille: 'legume',
    couleur: 'var(--o-palette-rose-600)',
    mois: '..oXXXXXo...',
    prix: '1,60 EUR la botte',
    origine: 'Maraichers de Cergy',
    note: 'On achete une botte pour ses fanes autant que pour ses radis : la soupe.',
  },
  {
    nom: 'Asperge',
    famille: 'legume',
    couleur: 'var(--o-palette-lime-300)',
    mois: '...oXo......',
    prix: '8,50 EUR la botte',
    origine: 'Sologne',
    note: 'Six semaines. Le talon doit etre humide et la pointe serree.',
  },
  {
    nom: 'Epinard',
    famille: 'legume',
    couleur: 'var(--o-palette-green-600)',
    mois: '..oXXo..oXX.',
    prix: '4,20 EUR le kilo',
    origine: 'Val de Loire',
    note: 'Deux saisons dans l annee, printemps et arriere-saison. Rien l ete.',
  },
  {
    nom: 'Carotte',
    famille: 'legume',
    couleur: 'var(--o-palette-orange-500)',
    mois: 'ooooXXXXXXoo',
    prix: '1,90 EUR le kilo',
    origine: 'Sables des Landes',
    note: 'De saison presque toute l annee — c est rare, et c est pour ca qu on en vit.',
  },
  {
    nom: 'Poireau',
    famille: 'legume',
    couleur: 'var(--o-palette-lime-700)',
    mois: 'XXXo....oXXX',
    prix: '2,40 EUR le kilo',
    origine: 'Manche',
    note: 'Le legume de l hiver. Le blanc pour la soupe, le vert pour le bouillon.',
  },
  {
    nom: 'Endive',
    famille: 'legume',
    couleur: 'var(--o-palette-yellow-400)',
    mois: 'XXXo.....oXX',
    prix: '2,80 EUR le kilo',
    origine: 'Nord',
    note: 'Poussee sans lumiere, d ou le blanc. Verte, elle amerise.',
  },
  {
    nom: 'Chou-fleur',
    famille: 'legume',
    couleur: 'var(--o-palette-lime-200)',
    mois: 'XXoo....oXXX',
    prix: '2,50 EUR piece',
    origine: 'Bretagne',
    note: 'Les feuilles serrees autour de la pomme disent qu il est frais.',
  },
  {
    nom: 'Potiron',
    famille: 'legume',
    couleur: 'var(--o-palette-orange-600)',
    mois: 'o.......oXXX',
    prix: '2,20 EUR le kilo',
    origine: 'Beauce',
    note: 'On le vend a la part, coupe devant vous : personne ne cuisine dix kilos.',
  },
]

/** L etat d un produit pour un mois : pleine saison, bord de saison, hors. */
type Etat = 'pleine' | 'bord' | 'hors'

function etatDe(produit: Produit, mois: number): Etat {
  const signe = produit.mois[mois]
  if (signe === 'X') return 'pleine'
  if (signe === 'o') return 'bord'
  return 'hors'
}

/* ============================ Le cageot ================================ */

/** Ce qu il y a dans le cageot de la semaine, ecrit le lundi matin. */
const CAGEOT: readonly (readonly [string, string])[] = [
  ['1 kg de carottes de sable', 'Landes'],
  ['1 botte de poireaux', 'Manche'],
  ['800 g de pommes gala', 'Perche'],
  ['1 chou-fleur', 'Bretagne'],
  ['500 g d epinards', 'Val de Loire'],
  ['3 poires conference', 'Anjou'],
  ['1 botte de radis', 'Cergy'],
]

/* ============================ Les pictogrammes du pied ================= */

/** Un pictogramme du pied (P27), dessine au trait, et sa legende. */
interface Picto {
  readonly titre: string
  readonly legende: string
  readonly trace: ReactNode
}

const PICTOS: readonly Picto[] = [
  {
    titre: 'Le cageot consigne',
    legende:
      'Deux euros a la premiere, rendus quand vous la rapportez. Elle fait vingt tours.',
    trace: (
      <>
        <path d="M8 18h48l-6 26H14z" />
        <path d="M8 18l6-8h36l6 8" />
        <path d="M20 26v10M32 26v10M44 26v10" />
      </>
    ),
  },
  {
    titre: 'Le banc du marche',
    legende: 'Mardi, jeudi et dimanche, place d Aligre, sous l auvent vert, des 7 h.',
    trace: (
      <>
        <path d="M6 22h52l-6-10H12z" />
        <path d="M12 22v24M52 22v24" />
        <path d="M12 34h40" />
        <path d="M20 46v-8h12v8" />
      </>
    ),
  },
  {
    titre: 'La tournee a velo',
    legende:
      'Livraison le mercredi dans le 11e et le 12e, a triporteur, sans frais des 25 euros.',
    trace: (
      <>
        <circle cx="16" cy="38" r="10" />
        <circle cx="48" cy="38" r="10" />
        <path d="M16 38l10-18h12l10 18" />
        <path d="M26 20h10" />
      </>
    ),
  },
  {
    titre: 'L heure du reassort',
    legende:
      'Rungis a 4 h, sur le banc a 7 h. Ce qui reste le soir part a la cantine du quartier.',
    trace: (
      <>
        <circle cx="32" cy="32" r="20" />
        <path d="M32 18v14l10 6" />
      </>
    ),
  },
]

/* ============================ Le papier ================================ */

/**
 * Le registre clair des objets en papier et en bois.
 *
 * Une carte postale et une cagette sont eclairees, quel que soit le theme du
 * visiteur : elles sont des objets poses sur la page, pas des panneaux de la
 * page. Redeclarer les variables du theme plutot que poser des classes en dur
 * laisse `accentDoux`, `encre` et les pieces du registre s y adapter seules —
 * et a l interieur, **aucun jumeau `dark:`** : la bande ne suit plus le theme.
 */
const PAPIER = {
  colorScheme: 'light',
  '--o-theme-bg': 'var(--o-palette-stone-50)',
  '--o-theme-surface': 'var(--o-palette-stone-100)',
  '--o-theme-fg': 'var(--o-palette-stone-950)',
  '--o-theme-muted': 'var(--o-palette-stone-600)',
  '--o-theme-line': 'var(--o-palette-stone-300)',
} as CSSProperties

/* ============================ La carte postale ========================= */

/**
 * L appel (A18) : une carte postale a remplir.
 *
 * Le recto est dessine — timbre, cachet, lignes d adresse. Il se souleve au
 * survol **et a la prise de focus** : le formulaire du verso vit dans la page
 * des le depart, il est donc atteignable au clavier meme si l on ne survole
 * jamais rien. Une carte qui ne se retourne qu a la souris serait un piege.
 */
function CartePostale(): ReactElement {
  const { reduced } = useMotionState()
  const [ouverte, setOuverte] = useState(false)
  const [envoye, setEnvoye] = useState(false)

  const envoyer = (evenement: FormEvent<HTMLFormElement>): void => {
    evenement.preventDefault()
    setEnvoye(true)
  }

  return (
    <div
      className="o-relative"
      style={PAPIER}
      onPointerEnter={() => {
        setOuverte(true)
      }}
      onPointerLeave={() => {
        setOuverte(false)
      }}
      onFocus={() => {
        setOuverte(true)
      }}
      onBlur={(evenement) => {
        if (!evenement.currentTarget.contains(evenement.relatedTarget)) setOuverte(false)
      }}
    >
      {/* ----- Le verso : le formulaire, toujours la ----- */}
      <div
        className="o-rounded-3xl o-p-8 md:o-p-10"
        style={{
          backgroundColor: 'var(--o-theme-bg)',
          boxShadow: `inset 0 0 0 1px ${accentDoux(700, 26)}`,
        }}
      >
        <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600">
          Le verso — a remplir
        </p>
        <form onSubmit={envoyer} className="o-mt-6 o-grid o-gap-5 sm:o-grid-cols-2">
          {(
            [
              ['primeur-nom', 'Votre nom', 'text', 'Camille Dorier'],
              ['primeur-rue', 'Votre rue', 'text', '14 rue Trousseau'],
            ] as const
          ).map(([id, libelle, genre, exemple]) => (
            <label key={id} htmlFor={id} className="o-block">
              <span className="o-block o-text-xs o-font-medium o-text-stone-600">
                {libelle}
              </span>
              <input
                id={id}
                name={id}
                type={genre}
                placeholder={exemple}
                className="o-mt-2 o-w-full o-rounded-xl o-border-w-1 o-border-stone-300 o-bg-transparent o-px-4 o-py-3 o-text-sm focus:o-ring"
              />
            </label>
          ))}
          <label htmlFor="primeur-jour" className="o-block">
            <span className="o-block o-text-xs o-font-medium o-text-stone-600">
              Le jour de la tournee
            </span>
            <select
              id="primeur-jour"
              name="primeur-jour"
              className="o-mt-2 o-w-full o-rounded-xl o-border-w-1 o-border-stone-300 o-bg-transparent o-px-4 o-py-3 o-text-sm focus:o-ring"
            >
              <option>Mercredi matin</option>
              <option>Mercredi soir</option>
              <option>Je passe au banc</option>
            </select>
          </label>
          <label htmlFor="primeur-taille" className="o-block">
            <span className="o-block o-text-xs o-font-medium o-text-stone-600">
              La taille du cageot
            </span>
            <select
              id="primeur-taille"
              name="primeur-taille"
              className="o-mt-2 o-w-full o-rounded-xl o-border-w-1 o-border-stone-300 o-bg-transparent o-px-4 o-py-3 o-text-sm focus:o-ring"
            >
              <option>Petit — 14 EUR, deux personnes</option>
              <option>Grand — 24 EUR, quatre personnes</option>
            </select>
          </label>
          <div className="o-flex o-flex-wrap o-items-center o-gap-4 sm:o-col-span-2">
            <button
              type="submit"
              className="o-cursor-pointer o-appearance-none o-rounded-full o-border-none o-px-6 o-py-3 o-text-sm o-font-semibold o-transition-transform hover:o-scale-105 focus:o-ring"
              style={aplat()}
            >
              Poster la carte
            </button>
            <p
              className="o-m-0 o-text-xs o-leading-relaxed o-text-stone-600"
              aria-live="polite"
            >
              {envoye
                ? 'C est note : on vous met un cageot de cote pour mercredi.'
                : 'Sans engagement : on arrete quand vous le dites, au banc ou par telephone.'}
            </p>
          </div>
        </form>
      </div>

      {/* ----- Le recto : la carte dessinee, qui se souleve ----- */}
      <div
        aria-hidden="true"
        className="o-absolute o-inset-0 o-rounded-3xl o-p-8 md:o-p-10"
        style={{
          backgroundColor: accentDoux(100, 70),
          boxShadow: `inset 0 0 0 1px ${accentDoux(700, 26)}`,
          opacity: ouverte ? 0 : 1,
          transform:
            reduced || !ouverte ? undefined : 'translate3d(0, -6%, 0) rotate(-3deg)',
          transition: reduced
            ? 'opacity 220ms ease'
            : 'opacity 420ms ease, transform 620ms cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: ouverte ? 'none' : undefined,
        }}
      >
        <div className="o-flex o-h-full o-flex-col o-justify-between o-gap-8">
          <div className="o-flex o-items-start o-justify-between o-gap-6">
            <div>
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600">
                Le recto
              </p>
              <p
                className="o-m-0 o-mt-4 o-text-stone-950"
                style={{
                  ...affiche('m', 300),
                  fontSize: 'clamp(1.5rem, 3.4vw, 2.75rem)',
                  lineHeight: 1,
                }}
              >
                Le cageot,
                <br />
                toutes les semaines.
              </p>
            </div>
            {/* Le timbre et son cachet, dessines. */}
            <svg viewBox="0 0 90 110" className="o-w-20 o-shrink-0" aria-hidden="true">
              <path
                d="M6 6h78v98H6z"
                fill={accentDoux(300, 55)}
                stroke={accentDoux(700, 40)}
                strokeWidth="1"
                strokeDasharray="4 3"
              />
              <path
                d="M18 74h54l-8-34H26z"
                fill="none"
                stroke={accentDoux(900, 55)}
                strokeWidth="1.5"
              />
              <circle
                cx="45"
                cy="30"
                r="9"
                fill="none"
                stroke={accentDoux(900, 55)}
                strokeWidth="1.5"
              />
              {/* L encre est posee en `color` et reprise par `fill` : une sonde
                  de contraste lit la couleur calculee, pas l attribut. */}
              <text
                x="18"
                y="94"
                fontSize="11"
                fill="currentColor"
                style={{
                  color: accentDoux(900, 60),
                  fontFamily: 'var(--o-font-mono)',
                  letterSpacing: '0.1em',
                }}
              >
                0,99
              </text>
            </svg>
          </div>

          {/* Les lignes d adresse, vides : c est une carte a remplir. */}
          <div className="o-flex o-flex-col o-gap-4">
            {[0, 1, 2].map((rang) => (
              <span
                key={rang}
                className="o-block o-h-px"
                style={{
                  backgroundColor: accentDoux(700, 34),
                  width: `${String(92 - rang * 14)}%`,
                }}
              />
            ))}
            <p
              className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
              style={{ color: encre() }}
            >
              Survolez la carte — ou entrez au clavier
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============================ Le calendrier, en pieces ================= */

/** Le mecanisme : douze mois, et ce qui est vraiment de saison. */
function Calendrier({
  mois,
  poser,
}: {
  readonly mois: number
  readonly poser: (rang: number) => void
}): ReactElement {
  const { pleine, bord, hors } = useMemo(() => {
    const tri = { pleine: [] as Produit[], bord: [] as Produit[], hors: [] as Produit[] }
    for (const produit of BANC) tri[etatDe(produit, mois)].push(produit)
    return tri
  }, [mois])

  const deSaison = pleine.length + bord.length

  return (
    <div>
      {/* Les douze mois, en cellules rondes : l annee tient sur une ligne. */}
      <div className="o-grid o-grid-cols-3 o-gap-2 sm:o-grid-cols-6 lg:o-grid-cols-12">
        {MOIS.map((nom, rang) => {
          const choisi = rang === mois
          return (
            <button
              key={nom}
              type="button"
              onClick={() => {
                poser(rang)
              }}
              aria-pressed={choisi}
              className={`o-cursor-pointer o-appearance-none o-rounded-2xl o-border-none o-px-2 o-py-4 o-text-center o-text-xs o-font-semibold o-uppercase o-tracking-widest o-transition-transform hover:o-scale-105 focus:o-ring ${
                choisi
                  ? ''
                  : 'o-bg-white-60 o-text-zinc-700 dark:o-bg-zinc-900 dark:o-text-zinc-300'
              }`}
              style={choisi ? aplat() : undefined}
            >
              {nom.slice(0, 3)}
            </button>
          )
        })}
      </div>

      <p
        className="o-m-0 o-mt-10 o-text-zinc-950 dark:o-text-zinc-50"
        aria-live="polite"
        style={{
          ...affiche('m', 300),
          fontSize: 'clamp(1.5rem, 3.6vw, 3rem)',
          lineHeight: 1,
        }}
      >
        En {MOIS[mois]?.toLowerCase()}, {String(deSaison)} des dix-huit.
      </p>

      <div className="o-mt-10 o-grid o-gap-10 lg:o-grid-cols-12">
        <div className="lg:o-col-span-7">
          <p
            className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
            style={{ color: encre() }}
          >
            En pleine saison
          </p>
          <ul className="o-m-0 o-mt-5 o-flex o-list-none o-flex-wrap o-gap-3 o-p-0">
            {pleine.map((produit) => (
              <li key={produit.nom}>
                <span
                  className="o-inline-flex o-items-center o-gap-2 o-rounded-full o-px-4 o-py-2 o-text-sm o-font-semibold o-text-zinc-950 dark:o-text-zinc-50"
                  style={{
                    backgroundColor: `color-mix(in oklab, ${produit.couleur} 38%, var(--o-theme-bg))`,
                  }}
                >
                  <span
                    aria-hidden="true"
                    className="o-block o-size-1.5 o-rounded-full"
                    style={{ backgroundColor: produit.couleur }}
                  />
                  {produit.nom}
                </span>
              </li>
            ))}
            {pleine.length === 0 && (
              <li className="o-text-sm o-text-zinc-600 dark:o-text-zinc-400">
                Rien en pleine saison ce mois-ci. C est la soudure.
              </li>
            )}
          </ul>

          <p className="o-m-0 o-mt-10 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
            Ca commence ou ca finit
          </p>
          <ul className="o-m-0 o-mt-5 o-flex o-list-none o-flex-wrap o-gap-3 o-p-0">
            {bord.map((produit) => (
              <li key={produit.nom}>
                <span
                  className="o-inline-flex o-items-center o-gap-2 o-rounded-full o-border-w-1 o-px-4 o-py-2 o-text-sm o-text-zinc-800 dark:o-text-zinc-200"
                  style={{
                    borderColor: `color-mix(in oklab, ${produit.couleur} 55%, transparent)`,
                  }}
                >
                  {produit.nom}
                </span>
              </li>
            ))}
            {bord.length === 0 && (
              <li className="o-text-sm o-text-zinc-600 dark:o-text-zinc-400">Aucun.</li>
            )}
          </ul>

          <p className="o-m-0 o-mt-10 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
            Ce que nous n avons pas
          </p>
          <ul className="o-m-0 o-mt-5 o-flex o-list-none o-flex-wrap o-gap-x-4 o-gap-y-2 o-p-0">
            {hors.map((produit) => (
              <li
                key={produit.nom}
                className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400 o-line-through"
              >
                {produit.nom}
              </li>
            ))}
          </ul>
        </div>

        {/* Le mot du primeur sur le premier produit du mois. */}
        <div className="lg:o-col-span-5">
          {(pleine[0] ?? bord[0]) !== undefined && (
            <div
              className="o-rounded-3xl o-p-8"
              style={{
                backgroundColor: 'var(--o-theme-bg)',
                boxShadow: `inset 0 0 0 1px ${accentDoux(700, 22)}`,
              }}
            >
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                Le mot du banc
              </p>
              <p
                className="o-m-0 o-mt-4 o-text-zinc-950 dark:o-text-zinc-50"
                style={{
                  ...affiche('m', 300),
                  fontSize: 'clamp(1.5rem, 2.6vw, 2.25rem)',
                  lineHeight: 1,
                }}
              >
                {(pleine[0] ?? bord[0])?.nom}
              </p>
              <p className="o-m-0 o-mt-5 o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                {(pleine[0] ?? bord[0])?.note}
              </p>
              <dl className="o-m-0 o-mt-8 o-grid o-grid-cols-2 o-gap-6">
                <div>
                  <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                    Prix du jour
                  </dt>
                  <dd className="o-m-0 o-mt-2 o-text-base o-font-semibold o-text-zinc-950 dark:o-text-zinc-50">
                    {(pleine[0] ?? bord[0])?.prix}
                  </dd>
                </div>
                <div>
                  <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                    Ca vient de
                  </dt>
                  <dd className="o-m-0 o-mt-2 o-text-base o-font-semibold o-text-zinc-950 dark:o-text-zinc-50">
                    {(pleine[0] ?? bord[0])?.origine}
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/* ============================ La carte de chaleur (C18) ================ */

/** L annee entiere, en cases : dix-huit lignes, douze colonnes. */
function CarteDeChaleur({ mois }: { readonly mois: number }): ReactElement {
  return (
    // Une bande qui defile de cote doit dire les deux axes : sans cela la
    // cascade met `overflow-y` a `auto` et la bande avale la molette.
    // `o-relative` n est pas un detail : sans bloc de reference ici, les
    // libelles caches (`o-sr-only`, poses en absolu) se calent sur le premier
    // ancetre positionne, sortent de la bande et elargissent la page.
    <div className="o-relative o-overflow-x-auto" style={{ overflowY: 'hidden' }}>
      <table
        className="o-w-full o-text-left"
        style={{ minWidth: 620, borderCollapse: 'collapse' }}
      >
        <caption className="o-sr-only">
          Les dix-huit produits du banc, mois par mois : pleine saison, debut ou fin de
          saison, hors saison
        </caption>
        <thead>
          <tr>
            <th
              scope="col"
              className="o-py-2 o-pr-4 o-font-mono o-text-xs o-font-normal o-uppercase o-tracking-widest o-text-zinc-400"
            >
              Produit
            </th>
            {MOIS_COURT.map((lettre, rang) => (
              <th
                key={`${lettre}-${String(rang)}`}
                scope="col"
                className="o-px-1 o-py-2 o-text-center o-font-mono o-text-xs o-font-normal o-uppercase"
                style={{
                  color: rang === mois ? encreSurSombre() : 'var(--o-palette-zinc-500)',
                }}
              >
                <span className="o-sr-only">{MOIS[rang]}</span>
                <span aria-hidden="true">{lettre}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {BANC.map((produit) => (
            <tr key={produit.nom}>
              <th
                scope="row"
                className="o-py-1 o-pr-4 o-text-sm o-font-normal o-text-zinc-100"
              >
                {produit.nom}
              </th>
              {MOIS_COURT.map((_, rang) => {
                const etat = etatDe(produit, rang)
                const fond =
                  etat === 'pleine'
                    ? produit.couleur
                    : etat === 'bord'
                      ? `color-mix(in oklab, ${produit.couleur} 40%, var(--o-palette-zinc-950))`
                      : 'var(--o-palette-zinc-900)'
                return (
                  <td key={rang} className="o-px-0.5 o-py-1">
                    <span
                      className="o-block o-h-5 o-rounded-sm"
                      style={{
                        backgroundColor: fond,
                        outline:
                          rang === mois ? `1px solid ${encreSurSombre()}` : undefined,
                      }}
                    >
                      <span className="o-sr-only">
                        {MOIS[rang]} :{' '}
                        {etat === 'pleine'
                          ? 'pleine saison'
                          : etat === 'bord'
                            ? 'debut ou fin de saison'
                            : 'hors saison'}
                      </span>
                    </span>
                  </td>
                )
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ============================ La page ================================== */

export default function Page(): ReactElement {
  const polices = usePolices('unbounded')
  const [mois, setMois] = useState(() => new Date().getMonth())

  // La nappe prend les couleurs du mois : les trois premiers produits de
  // saison. En fevrier elle est terne, en juillet elle brule.
  const couleurs = useMemo(() => {
    const tenus = BANC.filter((produit) => etatDe(produit, mois) !== 'hors')
    const pris = (rang: number): string =>
      `color-mix(in oklab, ${tenus[rang % Math.max(1, tenus.length)]?.couleur ?? accent(400)} 42%, var(--o-theme-bg))`
    return [pris(0), pris(1), pris(2)] as const
  }, [mois])

  const vedettes = useMemo(
    () => BANC.filter((produit) => etatDe(produit, mois) === 'pleine').slice(0, 4),
    [mois],
  )
  const mots = useMemo(() => {
    const noms = BANC.filter((produit) => etatDe(produit, mois) !== 'hors').map(
      (produit) => produit.nom.toLowerCase(),
    )
    return noms.length > 0 ? noms : ['la patience']
  }, [mois])

  return (
    <Porte forme="iris" marque="Cageot" sombre={false}>
      <div
        className="o-relative o-bg-zinc-50 dark:o-bg-zinc-950 o-text-zinc-900 dark:o-text-zinc-50"
        style={polices}
      >
        <Nappe couleurs={[couleurs[0], couleurs[1], couleurs[2]]} opacite={0.75} />

        <div className="o-relative o-z-10">
          <BarreGelule
            marque="Cageot"
            liens={NAVIGATION}
            action={['#carte', 'Le cageot']}
            sombre={false}
          />

          {/* ================= L ouverture ================================ */}
          <header
            className="o-relative o-flex o-flex-col o-justify-center o-px-6 o-pb-16 o-pt-32 md:o-px-10"
            style={{ minHeight: ECRAN }}
          >
            <div className="o-mx-auto o-w-full o-max-w-6xl">
              <Surgit>
                <Etiquette sombre={false}>Primeur — place d Aligre, Paris 12</Etiquette>
              </Surgit>
              <TitreVague
                delai={140}
                className="o-m-0 o-mt-8 o-text-zinc-950 dark:o-text-zinc-50"
                style={{
                  ...affiche('xl', 800),
                  fontSize: 'clamp(3rem, 13vw, 12rem)',
                  lineHeight: 0.84,
                  letterSpacing: '-0.05em',
                }}
              >
                Cageot
              </TitreVague>

              <Surgit
                delai={520}
                as="p"
                className="o-m-0 o-mt-8 o-flex o-flex-wrap o-items-baseline o-gap-x-3 o-text-lg o-leading-relaxed o-text-zinc-700 dark:o-text-zinc-300"
              >
                <span>Ce mois-ci, on a</span>
                <span className="o-text-2xl o-font-semibold o-text-zinc-950 dark:o-text-zinc-50">
                  <RotatingWords words={mots} interval={1900} />
                </span>
              </Surgit>
              <Surgit
                delai={560}
                as="p"
                className="o-m-0 o-mt-4 o-max-w-md o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400"
              >
                Le reste, on ne l a pas : c est toute la difference entre un primeur et un
                rayon.
              </Surgit>

              <Surgit delai={640} className="o-mt-10">
                <Actions
                  pleine={['#calendrier', 'Voir le mois']}
                  fantome={['#carte', 'Recevoir le cageot']}
                  sombre={false}
                />
              </Surgit>

              {/* Les cagettes du mois, qui flottent — et les autocollants penches. */}
              <Surgit delai={760} className="o-mt-16">
                <FloatGroup
                  amplitude={7}
                  duration={4200}
                  className="o-grid o-gap-4 sm:o-grid-cols-2 lg:o-grid-cols-4"
                >
                  {vedettes.map((produit, rang) => (
                    <div
                      key={produit.nom}
                      className="o-relative o-rounded-3xl o-p-6"
                      style={{
                        backgroundColor: `color-mix(in oklab, ${produit.couleur} 26%, var(--o-theme-bg))`,
                        boxShadow: `inset 0 0 0 1px ${accentDoux(700, 20)}`,
                      }}
                    >
                      {/* La cagette, dessinee. */}
                      <svg viewBox="0 0 120 80" className="o-w-full" aria-hidden="true">
                        <path
                          d="M10 26h100l-10 44H20z"
                          fill="none"
                          stroke={produit.couleur}
                          strokeWidth="2"
                        />
                        <path
                          d="M10 26l8-12h84l8 12"
                          fill="none"
                          stroke={produit.couleur}
                          strokeWidth="2"
                        />
                        <path
                          d="M34 36v26M60 36v26M86 36v26"
                          stroke={produit.couleur}
                          strokeWidth="1.5"
                          opacity="0.6"
                        />
                        {[0, 1, 2, 3, 4].map((graine) => (
                          <circle
                            key={graine}
                            cx={26 + graine * 17 + ((rang + graine) % 3) * 2}
                            cy={22 - ((graine + rang) % 2) * 4}
                            r={5 + ((graine + rang) % 2)}
                            fill={produit.couleur}
                          />
                        ))}
                      </svg>
                      <p className="o-m-0 o-mt-4 o-text-base o-font-semibold o-text-zinc-950 dark:o-text-zinc-50">
                        {produit.nom}
                      </p>
                      <p className="o-m-0 o-mt-1 o-text-xs o-text-zinc-600 dark:o-text-zinc-400">
                        {produit.prix} — {produit.origine}
                      </p>
                    </div>
                  ))}
                </FloatGroup>
              </Surgit>
            </div>

            {/* Les autocollants, penches, comme sur une vitre. */}
            <Flotte
              amplitude={9}
              duree={7}
              angle={-8}
              className="o-pointer-events-none o-absolute o-hidden lg:o-block"
              style={{ top: '7rem', right: '2rem' }}
            >
              <Autocollant angle={-8}>Cueilli hier</Autocollant>
            </Flotte>
            <Flotte
              amplitude={12}
              duree={9}
              delai={1.4}
              angle={6}
              className="o-pointer-events-none o-absolute o-hidden lg:o-block"
              style={{ top: '44%', right: '5rem' }}
            >
              <Autocollant angle={6}>Vrac, sans plastique</Autocollant>
            </Flotte>
          </header>

          {/* ================= Le mecanisme : le calendrier =============== */}
          <section
            id="calendrier"
            className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
          >
            <div className="o-mx-auto o-max-w-6xl">
              <Reveal>
                <Indice rang="01" sombre={false}>
                  Le calendrier
                </Indice>
              </Reveal>
              <Reveal delay={80}>
                <h2
                  className="o-m-0 o-mt-6 o-max-w-3xl o-text-zinc-950 dark:o-text-zinc-50"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.85rem, 4.6vw, 4rem)',
                    lineHeight: 0.94,
                  }}
                >
                  Douze mois, et ce qu ils donnent vraiment.
                </h2>
              </Reveal>
              <Reveal delay={140}>
                <p className="o-m-0 o-mt-6 o-max-w-xl o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                  Choisissez un mois : le banc se recompose, le fond change de couleur, et
                  ce que nous n avons pas reste ecrit, barre. La table est la meme toute l
                  annee — c est elle qui commande.
                </p>
              </Reveal>
              <div className="o-mt-14">
                <Calendrier mois={mois} poser={setMois} />
              </div>
            </div>
          </section>

          {/* ================= L annee entiere, en cases (C18) ============ */}
          <section
            id="annee"
            className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
            style={nuit('stone')}
          >
            <div className="o-mx-auto o-max-w-6xl">
              <Reveal>
                <Indice rang="02">L annee</Indice>
              </Reveal>
              <Reveal delay={80}>
                <h2
                  className="o-m-0 o-mt-6 o-max-w-3xl o-text-stone-50"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.85rem, 4.6vw, 4rem)',
                    lineHeight: 0.94,
                  }}
                >
                  L annee tient dans une grille.
                </h2>
              </Reveal>
              <p className="o-m-0 o-mt-6 o-max-w-xl o-text-base o-leading-relaxed o-text-stone-300">
                Case pleine : pleine saison. Case eteinte : debut ou fin. Case sombre : on
                ne l a pas. La colonne du mois choisi est cerclee.
              </p>
              <div className="o-mt-12">
                <CarteDeChaleur mois={mois} />
              </div>
            </div>
          </section>

          {/* ================= Le cageot de la semaine ==================== */}
          <section
            id="cageot"
            className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
          >
            <div className="o-mx-auto o-grid o-max-w-6xl o-items-center o-gap-12 lg:o-grid-cols-12">
              <div className="lg:o-col-span-5">
                <Reveal>
                  <Indice rang="03" sombre={false}>
                    Le cageot
                  </Indice>
                </Reveal>
                <Reveal delay={80}>
                  <h2
                    className="o-m-0 o-mt-6 o-text-zinc-950 dark:o-text-zinc-50"
                    style={{
                      ...affiche('m', 300),
                      fontSize: 'clamp(1.85rem, 4vw, 3.5rem)',
                      lineHeight: 0.94,
                    }}
                  >
                    Ce qu on y met cette semaine.
                  </h2>
                </Reveal>
                <p className="o-m-0 o-mt-6 o-max-w-md o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                  Compose le lundi matin, au retour de Rungis, avec ce qui etait bon ce
                  matin-la. Retournez la cagette pour voir le detail et les provenances.
                </p>
                <div className="o-mt-8" style={{ maxWidth: '17rem' }}>
                  <StickerPeel corner="top-right" size={64} back={accentDoux(300, 60)}>
                    <span
                      className="o-block o-rounded-2xl o-px-6 o-py-4 o-text-base o-font-semibold"
                      style={aplat()}
                    >
                      14 EUR — deux personnes
                    </span>
                  </StickerPeel>
                </div>
              </div>

              <div className="lg:o-col-span-7">
                <FlipCard
                  className="o-w-full o-cursor-pointer focus:o-ring"
                  style={{ ...PAPIER, minHeight: '22rem' }}
                  front={
                    <div
                      className="o-flex o-h-full o-flex-col o-justify-between o-gap-6 o-rounded-3xl o-p-8"
                      style={{
                        backgroundColor: accentDoux(200, 60),
                        boxShadow: `inset 0 0 0 1px ${accentDoux(700, 26)}`,
                      }}
                    >
                      <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600">
                        Semaine 37 — la cagette
                      </p>
                      <svg viewBox="0 0 240 130" className="o-w-full" aria-hidden="true">
                        <path
                          d="M16 40h208l-18 74H34z"
                          fill="none"
                          stroke={accentDoux(900, 60)}
                          strokeWidth="2"
                        />
                        <path
                          d="M16 40l14-18h180l14 18"
                          fill="none"
                          stroke={accentDoux(900, 60)}
                          strokeWidth="2"
                        />
                        <path
                          d="M60 52v52M120 52v52M180 52v52"
                          stroke={accentDoux(900, 40)}
                          strokeWidth="1.5"
                        />
                        <path
                          d="M28 76h184"
                          stroke={accentDoux(900, 30)}
                          strokeWidth="1.5"
                          strokeDasharray="5 6"
                        />
                        {/* Ce qui depasse de la cagette : la marchandise du mois. */}
                        {BANC.filter(
                          (produit) =>
                            etatDe(produit, new Date().getMonth()) === 'pleine',
                        )
                          .slice(0, 5)
                          .map((produit, rang) => (
                            <circle
                              key={produit.nom}
                              cx={44 + rang * 38}
                              cy={30 - (rang % 2) * 6}
                              r={13 + (rang % 2) * 2}
                              fill={produit.couleur}
                            />
                          ))}
                      </svg>
                      <p
                        className="o-m-0 o-text-stone-950"
                        style={{
                          ...affiche('m', 300),
                          fontSize: 'clamp(1.35rem, 2.4vw, 2rem)',
                          lineHeight: 1,
                        }}
                      >
                        Sept produits, tous de saison.
                      </p>
                    </div>
                  }
                  back={
                    <div
                      className="o-flex o-h-full o-flex-col o-gap-4 o-rounded-3xl o-p-8"
                      style={{
                        backgroundColor: 'var(--o-theme-bg)',
                        boxShadow: `inset 0 0 0 1px ${accentDoux(700, 26)}`,
                      }}
                    >
                      <p
                        className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                        style={{ color: encre() }}
                      >
                        Le detail
                      </p>
                      <ul className="o-m-0 o-list-none o-p-0">
                        {CAGEOT.map(([quoi, ou]) => (
                          <li
                            key={quoi}
                            className="o-flex o-items-baseline o-justify-between o-gap-4 o-border-b o-border-stone-200 o-py-2"
                          >
                            <span className="o-text-sm o-text-stone-950">{quoi}</span>
                            <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600">
                              {ou}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  }
                />
              </div>
            </div>
          </section>

          {/* ================= L appel : la carte postale (A18) =========== */}
          <section id="carte" className="o-scroll-mt-24 o-px-6 o-pb-28 md:o-px-10">
            <div className="o-mx-auto o-max-w-4xl">
              <Reveal>
                <Indice rang="04" sombre={false}>
                  La carte
                </Indice>
              </Reveal>
              <Reveal delay={80}>
                <h2
                  className="o-m-0 o-mb-12 o-mt-6 o-text-zinc-950 dark:o-text-zinc-50"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.85rem, 4vw, 3.5rem)',
                    lineHeight: 0.94,
                  }}
                >
                  Une carte postale, et on vous garde un cageot.
                </h2>
              </Reveal>
              <CartePostale />
            </div>
          </section>

          {/* ================= Le pied : quatre pictogrammes (P27) ======== */}
          <footer className="o-border-t o-border-black-10 dark:o-border-zinc-800 o-px-6 o-py-16 md:o-px-10">
            <div className="o-mx-auto o-max-w-6xl">
              <ul className="o-m-0 o-grid o-list-none o-gap-10 o-p-0 sm:o-grid-cols-2 lg:o-grid-cols-4">
                {PICTOS.map((picto) => (
                  <li key={picto.titre}>
                    <svg
                      viewBox="0 0 64 64"
                      className="o-w-16"
                      aria-hidden="true"
                      fill="none"
                      stroke={encre()}
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      {picto.trace}
                    </svg>
                    <h2 className="o-m-0 o-mt-5 o-text-base o-font-semibold o-text-zinc-950 dark:o-text-zinc-50">
                      {picto.titre}
                    </h2>
                    <p className="o-m-0 o-mt-2 o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                      {picto.legende}
                    </p>
                  </li>
                ))}
              </ul>

              <div className="o-mt-14 o-flex o-flex-wrap o-items-center o-justify-between o-gap-6 o-border-t o-border-black-10 dark:o-border-zinc-800 o-pt-6">
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                  Cageot — 28 place d Aligre, 75012 Paris — © 2026
                </p>
                <p className="o-m-0 o-flex o-flex-wrap o-items-center o-gap-6">
                  <a
                    href="#carte"
                    className="o-inline-flex o-items-center o-gap-2 o-text-sm o-font-semibold o-no-underline focus:o-ring"
                    style={{ color: encre() }}
                  >
                    banc@cageot.fr{' '}
                    <Icon icon={ArrowUpRight} size={15} aria-hidden="true" />
                  </a>
                  <a
                    href="#calendrier"
                    className="o-inline-flex o-items-center o-gap-2 o-text-sm o-no-underline o-text-zinc-600 dark:o-text-zinc-400 focus:o-ring"
                  >
                    Le calendrier <Icon icon={ArrowRight} size={15} aria-hidden="true" />
                  </a>
                </p>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </Porte>
  )
}
