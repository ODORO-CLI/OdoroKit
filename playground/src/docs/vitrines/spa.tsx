/**
 * Onde — spa et soins.
 *
 * ## Le parti pris
 *
 * Une revue de bien-etre, tenue par la typographie a empattements et des
 * filets, sur laquelle **les photographies derivent tres lentement** : chaque
 * rituel a sa photographie qui glisse contre le defilement, et une seconde,
 * plus petite, posee de travers sur son coin. Rien ne clignote ; tout bouge a
 * la vitesse d une respiration.
 *
 * ## Ce qu on vient chercher
 *
 * Un soin, une duree, une heure. La carte se filtre par famille et par duree,
 * la carte cadeau accepte un montant libre qui annonce ce qu il couvre, et la
 * derniere page prend vraiment la reservation : un soin, un creneau, un
 * recapitulatif, un numero de dossier. C est elle qui sert d appel.
 *
 * ## L enchainement
 *
 * ouverture sur le bassin → trois rituels en photos qui derivent → la carte →
 * quatre nombres en verre sur la facade → le montant libre → la capsule de
 * reservation, sur l eau → une signature en italique.
 *
 * ## La scene
 *
 * Une nappe d eau, et une seule fois : `background/water-surface` est posee
 * sous la derniere section, celle de la reservation. C est le sujet meme d un
 * spa — le bassin a 34 degres — et non un decor. Ses trois couleurs citent le
 * fond du theme, l eau en `--o-vitrine-600` et le ciel en `--o-vitrine-200`.
 * Le texte pose dessus ne compte pas sur un voile gris mais sur son propre
 * feuillet de papier, comme un carton pose sur l eau.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import {
  ArrowRight,
  Check,
  Clock,
  Droplets,
  Gift,
  MapPin,
  Minus,
} from '@odoro-cli/icons/filaire'
import { useState, type CSSProperties, type ReactElement } from 'react'

import { WaterSurface } from '@/odoro/background/WaterSurface.js'
import { HoverZoom } from '@/odoro/image/HoverZoom.js'
import { RevealImage } from '@/odoro/image/RevealImage.js'
import { BlurReveal } from '@/odoro/text/BlurReveal.js'
import { ElasticSlider } from '@/odoro/ui/ElasticSlider.js'

import { nuit, Voile } from './communs.jsx'
import { media, paysage, photo } from './media.js'
import { accent, accentDoux, encre, aplat, encreSurSombre } from './palettes.js'
import {
  Porte,
  usePolices,
  Accent,
  affiche,
  BarreFilet,
  Chiffres,
  Etiquette,
  Grain,
  Surgit,
  verre,
} from './marche.jsx'
import { Devoile, Parallaxe } from './scene.jsx'

/** Le filet de la revue : il separe tout, et rien d autre ne le fait. */
const FILET = 'o-border-stone-300 dark:o-border-stone-700'

/** L accent en encre : la nuance que la palette calcule, pas une nuance fixe. */
const ACCENT_ENCRE: CSSProperties = { color: encre() }

/**
 * Un aplat d accent a peine dose.
 *
 * En theme clair il se melange au fond ; en theme sombre a la surface, plus
 * haute d un cran, sans quoi un aplat pose sur un fond deja tres bas ne se
 * distinguerait pas du papier.
 */
const ACCENT_APLAT: CSSProperties = {
  backgroundColor: `light-dark(${accentDoux(500, 10)}, color-mix(in oklab, ${accent(
    500,
  )} 14%, var(--o-theme-surface)))`,
}

/** Le lien de la revue : petites capitales soulignees, accent au survol. */
const LIEN =
  'o-inline-flex o-items-center o-gap-2 o-text-xs o-uppercase o-tracking-widest o-text-stone-900 dark:o-text-stone-50 o-underline o-underline-offset-8 hover:o-text-brand-700 dark:hover:o-text-brand-300 o-transition-colors focus:o-ring'

/** Le sommaire du numero. */
const SOMMAIRE = [
  ['#rituels', 'Rituels'],
  ['#carte', 'La carte'],
  ['#offrir', 'Offrir'],
  ['#reserver', 'Reserver'],
] as const

/** Un rituel, avec ce qu il comprend et ce qui se paie en plus. */
interface Rituel {
  readonly nom: string
  readonly duree: string
  readonly prix: string
  readonly texte: string
  readonly deroule: readonly string[]
  readonly compris: readonly string[]
  readonly enPlus: readonly string[]
  readonly image: { readonly src: string; readonly alt: string }
  /** La seconde photographie, posee de travers sur le coin de la premiere. */
  readonly coin: { readonly graine: string; readonly alt: string; readonly mot: string }
}

/** Les trois rituels. */
const RITUELS: readonly Rituel[] = [
  {
    nom: 'Onde longue',
    duree: '2 h 30',
    prix: '190',
    texte:
      'Le parcours entier, sans rendez-vous intermediaire : bassin, hammam, gommage au savon noir, puis un massage a l huile chaude de quatre-vingts minutes.',
    deroule: [
      '20 min — bassin a 34 degres, seul ou a deux',
      '20 min — hammam, puis repos sur la banquette de pierre',
      '30 min — gommage au savon noir et rincage',
      '80 min — massage a l huile chaude, corps entier',
    ],
    compris: [
      'Peignoir, sandales et drap de bain',
      'Casier ferme et vestiaire individuel',
      'Le the a la salle claire, avant et apres',
    ],
    enPlus: [
      'Le soin du visage, 60 EUR',
      'La privatisation du bassin, 120 EUR pour deux heures',
    ],
    image: paysage(
      'spa-rituel-longue',
      'Le parcours d eau : le bassin et la rangee de douches',
    ),
    coin: {
      graine: 'spa-hammam',
      alt: 'Le hammam en pierre claire, empli de vapeur',
      mot: 'Pierre et vapeur',
    },
  },
  {
    nom: 'Onde courte',
    duree: '1 h 15',
    prix: '110',
    texte:
      'La version de midi. Vingt minutes de vapeur, un modelage dos et nuque de quarante-cinq minutes, et un the a la salle claire.',
    deroule: [
      '20 min — hammam et douche froide',
      '45 min — modelage dos, nuque et cuir chevelu',
      '10 min — repos et the a la salle claire',
    ],
    compris: [
      'Peignoir, sandales et drap de bain',
      'Casier ferme et vestiaire individuel',
      'Le the a la salle claire',
    ],
    enPlus: [
      'Le bassin avant le soin, 20 EUR',
      'Le prolongement de trente minutes, 45 EUR',
    ],
    image: paysage('spa-rituel-courte', 'Le couloir de pierre qui mene au bassin'),
    coin: {
      graine: 'spa-cabine',
      alt: 'Une cabine de soin, lumiere basse et lin ecru',
      mot: 'Six cabines, closes',
    },
  },
  {
    nom: 'Onde a deux',
    duree: '2 h',
    prix: '340',
    texte:
      'Une cabine double, deux praticiennes, un parcours d eau prive avant et une heure de silence apres. Reservable le soir jusqu a 21h.',
    deroule: [
      '40 min — parcours d eau prive, bassin et hammam',
      '60 min — massage simultane, deux praticiennes',
      '20 min — salle claire privatisee, the et fruits secs',
    ],
    compris: [
      'Deux peignoirs, deux vestiaires attenants',
      'La privatisation du parcours d eau',
      'Un flacon d huile de massage a emporter',
    ],
    enPlus: [
      'Le soin du visage pour l un des deux, 90 EUR',
      'Le creneau du samedi soir, 40 EUR de plus',
    ],
    image: paysage('spa-rituel-duo', 'Le bassin et sa douche, en fin de journee'),
    coin: {
      graine: 'spa-bassin',
      alt: 'Le bassin chauffe, porte ouverte sur le jardin',
      mot: 'Le bassin, prive',
    },
  },
]

/** Un soin de la carte. */
interface Soin {
  readonly nom: string
  readonly famille: string
  readonly minutes: number
  readonly prix: number
  readonly texte: string
}

/** Les familles de la carte, dans l ordre du menu. */
const FAMILLES = ['Le corps', 'Le visage', 'Le bain'] as const

/** Les tranches de duree, telles qu on les demande a l accueil. */
const DUREES = ['30 minutes et moins', 'De 40 a 60 minutes', 'Plus d une heure'] as const

/** La carte des soins, avec ce que chacun comprend. */
const CARTE: readonly Soin[] = [
  {
    nom: 'Modelage a l huile chaude',
    famille: 'Le corps',
    minutes: 50,
    prix: 95,
    texte: 'Corps entier, pression moyenne. Huile de sesame chauffee au bain-marie.',
  },
  {
    nom: 'Modelage profond, dos et nuque',
    famille: 'Le corps',
    minutes: 45,
    prix: 90,
    texte: 'Pression forte, travail des trapezes et des lombaires. Dites-le si ca tire.',
  },
  {
    nom: 'Gommage au savon noir',
    famille: 'Le corps',
    minutes: 30,
    prix: 55,
    texte: 'Au gant de crin, sur la banquette du hammam. Rincage a l eau de rose.',
  },
  {
    nom: 'Enveloppement a l argile blanche',
    famille: 'Le corps',
    minutes: 40,
    prix: 75,
    texte: 'Argile de Provence, repos sous un drap chaud, puis douche tiede.',
  },
  {
    nom: 'Reflexologie plantaire',
    famille: 'Le corps',
    minutes: 45,
    prix: 80,
    texte: 'Assis, habille, pieds nus. Le seul soin que l on peut prendre en pause.',
  },
  {
    nom: 'Soin eclat, nettoyage et massage',
    famille: 'Le visage',
    minutes: 60,
    prix: 105,
    texte: 'Nettoyage, gommage doux, massage manuel, masque tissu. Sans extraction.',
  },
  {
    nom: 'Soin profond a l acide hyaluronique',
    famille: 'Le visage',
    minutes: 75,
    prix: 135,
    texte: 'Serum dose a un pour cent, massage kobido court, masque froid.',
  },
  {
    nom: 'Soin express de midi',
    famille: 'Le visage',
    minutes: 30,
    prix: 60,
    texte: 'Nettoyage et masque, sans huile : on repart sans se recoiffer.',
  },
  {
    nom: 'Modelage kobido',
    famille: 'Le visage',
    minutes: 50,
    prix: 110,
    texte: 'Manuel, rythme rapide, sans appareil. Rougeurs possibles une heure apres.',
  },
  {
    nom: 'Parcours libre, bassin et hammam',
    famille: 'Le bain',
    minutes: 120,
    prix: 45,
    texte: 'Deux heures, peignoir et sandales fournis. Douze personnes au maximum.',
  },
  {
    nom: 'Parcours du matin, avant 11h',
    famille: 'Le bain',
    minutes: 120,
    prix: 35,
    texte: 'Le meme parcours, avant l arrivee des soins. Six personnes au maximum.',
  },
  {
    nom: 'Bain de lait et fleurs',
    famille: 'Le bain',
    minutes: 40,
    prix: 70,
    texte: 'Baignoire privative, lait d amande et fleurs de bleuet. Une personne.',
  },
  {
    nom: 'Privatisation du parcours',
    famille: 'Le bain',
    minutes: 120,
    prix: 480,
    texte: 'Le bassin, le hammam et la salle claire pour vous seuls, jusqu a huit.',
  },
]

/** La tranche de duree d un soin. */
function trancheDe(minutes: number): string {
  if (minutes <= 30) return DUREES[0]
  if (minutes <= 60) return DUREES[1]
  return DUREES[2]
}

/** Une duree, dite comme a l accueil. */
function dureeLibelle(minutes: number): string {
  if (minutes < 60) return `${String(minutes)} min`
  const heures = Math.floor(minutes / 60)
  const reste = minutes % 60
  return reste === 0 ? `${String(heures)} h` : `${String(heures)} h ${String(reste)}`
}

/**
 * Les coffrets, photographies par ce qu ils ouvrent.
 *
 * Une boite fermee ne dit rien ; ce sont les huiles, le linge et les fleurs du
 * bain qui disent le soin. Les trois images sont cadrees a trois formats et
 * posees a trois hauteurs : une rangee de trois vignettes egales serait une
 * grille de cartes, ce que la revue ne fait nulle part ailleurs.
 */
const COFFRETS: readonly {
  readonly nom: string
  readonly prix: string
  readonly quoi: string
  readonly graine: string
  readonly alt: string
  readonly ratio: number
  readonly decalage: string
}[] = [
  {
    nom: 'Coffret Court',
    prix: '110 EUR',
    quoi: 'L Onde courte',
    graine: 'spa-coffret-court',
    alt: 'Les flacons d huile de la maison, alignes sur la console de l accueil',
    ratio: 0.82,
    decalage: '',
  },
  {
    nom: 'Coffret Long',
    prix: '190 EUR',
    quoi: 'L Onde longue',
    graine: 'spa-coffret-long',
    alt: 'Le linge plie et les orchidees, prepares avant un rituel',
    ratio: 1.25,
    decalage: 'sm:o-mt-16',
  },
  {
    nom: 'Coffret a deux',
    prix: '340 EUR',
    quoi: 'L Onde a deux',
    graine: 'spa-coffret-duo',
    alt: 'Les petales du bain de fleurs, a la surface de l eau',
    ratio: 0.95,
    decalage: 'sm:o-mt-6',
  },
]

/**
 * Ce qu un montant libre couvre.
 *
 * Un chiffre seul ne dit rien a celui qui offre : on lui rend donc, a chaque
 * cran, le soin que la somme paie entierement.
 */
function couverture(montant: number): string {
  if (montant >= 480) return 'la privatisation du parcours, deux heures a huit'
  if (montant >= 340) return 'l Onde a deux, cabine double et parcours prive'
  if (montant >= 190)
    return 'l Onde longue, le parcours entier et ses 80 minutes de massage'
  if (montant >= 135) return 'le soin profond a l acide hyaluronique, 75 minutes'
  if (montant >= 110) return 'l Onde courte, ou le modelage kobido'
  if (montant >= 95) return 'le modelage a l huile chaude, 50 minutes'
  if (montant >= 70) return 'le bain de lait et fleurs, ou un enveloppement'
  if (montant >= 45) return 'le parcours libre, bassin et hammam, deux heures'
  return 'une part du soin de son choix, a completer sur place'
}

/** Un jour ouvert a la reservation, avec ses creneaux. */
const CRENEAUX: readonly {
  readonly jour: string
  readonly heures: readonly (readonly [string, boolean])[]
}[] = [
  {
    jour: 'Jeudi 12',
    heures: [
      ['10h30', true],
      ['12h00', false],
      ['14h00', true],
      ['16h30', true],
      ['19h00', false],
    ],
  },
  {
    jour: 'Vendredi 13',
    heures: [
      ['10h30', false],
      ['12h00', true],
      ['14h00', true],
      ['16h30', false],
      ['19h00', true],
    ],
  },
  {
    jour: 'Samedi 14',
    heures: [
      ['10h00', true],
      ['11h00', true],
      ['13h30', false],
      ['15h30', true],
      ['18h00', true],
    ],
  },
]

/** Le lieu, en quatre lignes. */
const LIEU = [
  {
    icone: MapPin,
    cle: 'Adresse',
    valeur:
      '9 rue de Poitou, 75003 Paris. Metro Filles du Calvaire, trois minutes a pied.',
  },
  {
    icone: Clock,
    cle: 'Ouverture',
    valeur:
      'Mardi au samedi, 10h — 21h. Dimanche, 11h — 18h. Ferme le lundi et la premiere semaine d aout.',
  },
  {
    icone: Droplets,
    cle: 'Le silence',
    valeur:
      'Telephones deposes a l accueil, dans un casier ferme. Aucune musique dans les cabines, aucune enceinte au bassin.',
  },
  {
    icone: Check,
    cle: 'Annulation',
    valeur:
      'Sans frais jusqu a vingt-quatre heures avant. Au-dela, la moitie du soin est retenue.',
  },
] as const

/** Un intitule de section, a empattements, cale sur le filet du dessus. */
function TitreSection({
  id,
  numero,
  children,
}: {
  readonly id: string
  readonly numero: string
  readonly children: string
}): ReactElement {
  return (
    <div className="o-flex o-flex-wrap o-items-baseline o-gap-x-6 o-gap-y-2">
      <span
        className="o-text-xs o-tabular-nums o-uppercase o-tracking-widest"
        style={ACCENT_ENCRE}
      >
        {numero}
      </span>
      <h2
        id={id}
        className="o-m-0 o-font-serif o-text-3xl o-tracking-tight o-text-stone-900 dark:o-text-stone-50 md:o-text-5xl"
      >
        {children}
      </h2>
    </div>
  )
}

/**
 * Une rangee de filtres, en petites capitales.
 *
 * La revue n a ni pastille ni menu deroulant : un filtre y prend la forme d une
 * entree de sommaire, que le choix souligne.
 */
function Filtre({
  legende,
  options,
  valeur,
  onChange,
}: {
  readonly legende: string
  readonly options: readonly string[]
  readonly valeur: string
  readonly onChange: (valeur: string) => void
}): ReactElement {
  return (
    <div className="o-flex o-flex-wrap o-items-baseline o-gap-x-6 o-gap-y-2">
      <p className="o-m-0 o-w-20 o-shrink-0 o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
        {legende}
      </p>
      <div
        role="radiogroup"
        aria-label={legende}
        className="o-flex o-flex-wrap o-gap-x-6 o-gap-y-2"
      >
        {options.map((option) => {
          const actif = option === valeur
          return (
            <button
              key={option}
              type="button"
              role="radio"
              aria-checked={actif}
              onClick={() => {
                onChange(option)
              }}
              className={
                actif
                  ? 'o-text-xs o-uppercase o-tracking-widest o-underline o-underline-offset-8 o-decoration-2 focus:o-ring'
                  : 'o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400 hover:o-text-stone-900 dark:hover:o-text-stone-50 o-transition-colors focus:o-ring'
              }
              style={actif ? ACCENT_ENCRE : undefined}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/**
 * Un rituel : la photographie qui derive, une seconde posee de travers sur son
 * coin, et le texte en face. Les cotes s inversent d un rituel a l autre.
 */
function RituelPlanche({
  rituel,
  rang,
}: {
  readonly rituel: Rituel
  readonly rang: number
}): ReactElement {
  const inverse = rang % 2 === 1
  return (
    <article
      className={`o-relative o-grid o-gap-10 o-border-t ${FILET} o-py-16 md:o-grid-cols-12 md:o-gap-12 md:o-py-24`}
    >
      <div
        className={`o-relative md:o-col-span-6 ${inverse ? 'md:o-order-last md:o-col-start-7' : ''}`}
      >
        <Devoile
          src={rituel.image.src}
          alt={rituel.image.alt}
          ratio="4 / 5"
          depuis={inverse ? 'droite' : 'gauche'}
          derive={26}
          className="o-w-full"
        />
        {/* La seconde photographie, plus petite, penchee, qui deborde du cadre
            et derive un peu plus vite que la premiere. */}
        <Parallaxe
          vitesse={0.12}
          className={`o-absolute o-bottom-0 o-w-2/5 ${inverse ? 'o-left-0' : 'o-right-0'}`}
          style={{
            maxWidth: 224,
            transform: `translateY(22%) rotate(${inverse ? '4deg' : '-4deg'})`,
          }}
        >
          <RevealImage
            src={media(rituel.coin.graine, rituel.coin.alt, 600, 750).src}
            alt={rituel.coin.alt}
            ratio={0.8}
            direction="up"
            duration={1200}
            className={`o-w-full o-border-w-4 o-border-stone-50 dark:o-border-stone-950 o-object-cover o-shadow-xl`}
          />
          <p
            className="o-m-0 o-mt-2 o-text-xs o-uppercase o-tracking-widest"
            style={ACCENT_ENCRE}
          >
            {rituel.coin.mot}
          </p>
        </Parallaxe>
      </div>

      <div
        className={`md:o-col-span-5 ${inverse ? 'md:o-col-start-1' : 'md:o-col-start-7 md:o-pl-8'} md:o-self-center`}
      >
        <p className="o-m-0 o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
          Rituel {String(rang + 1).padStart(2, '0')}
        </p>
        <BlurReveal
          as="h3"
          step={140}
          blur={12}
          duration={900}
          className="o-m-0 o-mt-4 o-font-serif o-tracking-tight o-text-stone-900 dark:o-text-stone-50"
          style={{ fontSize: 'clamp(2.5rem, 5.5vw, 5.5rem)', lineHeight: 0.95 }}
        >
          {rituel.nom}
        </BlurReveal>
        <p className="o-m-0 o-mt-6 o-flex o-flex-wrap o-items-baseline o-gap-x-6 o-gap-y-2">
          <span className="o-flex o-items-center o-gap-2 o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
            <Icon icon={Clock} size={13} aria-hidden="true" />
            {rituel.duree}
          </span>
          <span className="o-font-serif o-text-4xl o-tabular-nums o-tracking-tight o-text-stone-900 dark:o-text-stone-50">
            {rituel.prix}
            <span className="o-ml-1 o-font-sans o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
              EUR
            </span>
          </span>
        </p>
        <p className="o-m-0 o-mt-6 o-max-w-md o-text-base o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
          {rituel.texte}
        </p>

        <ol
          className={`o-m-0 o-mt-8 o-flex o-list-none o-flex-col o-border-t ${FILET} o-p-0 o-text-xs o-leading-relaxed o-text-stone-600 dark:o-text-stone-400`}
        >
          {rituel.deroule.map((etape) => (
            <li key={etape} className={`o-border-b ${FILET} o-py-2 o-tabular-nums`}>
              {etape}
            </li>
          ))}
        </ol>

        <div className="o-mt-8 o-grid o-gap-8 sm:o-grid-cols-2">
          <div>
            <h4
              className="o-m-0 o-text-xs o-uppercase o-tracking-widest"
              style={ACCENT_ENCRE}
            >
              Compris
            </h4>
            <ul className="o-m-0 o-mt-3 o-flex o-list-none o-flex-col o-gap-2 o-p-0 o-text-sm o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
              {rituel.compris.map((ligne) => (
                <li key={ligne} className="o-flex o-items-start o-gap-2.5">
                  <Icon
                    icon={Check}
                    size={14}
                    className="o-mt-1 o-shrink-0"
                    style={ACCENT_ENCRE}
                    aria-hidden="true"
                  />
                  <span>{ligne}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="o-m-0 o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
              En plus, si vous voulez
            </h4>
            <ul className="o-m-0 o-mt-3 o-flex o-list-none o-flex-col o-gap-2 o-p-0 o-text-sm o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
              {rituel.enPlus.map((ligne) => (
                <li key={ligne} className="o-flex o-items-start o-gap-2.5">
                  <Icon
                    icon={Minus}
                    size={14}
                    className="o-mt-1 o-shrink-0 o-text-stone-400 dark:o-text-stone-500"
                    aria-hidden="true"
                  />
                  <span>{ligne}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </article>
  )
}

/** La vitrine. */
export default function Page(): ReactElement {
  const polices = usePolices('cormorant')
  const [famille, setFamille] = useState('Toutes')
  const [duree, setDuree] = useState('Toutes')
  const [montant, setMontant] = useState(150)
  const [soin, setSoin] = useState(CARTE[0]?.nom ?? '')
  const [creneau, setCreneau] = useState('')
  const [reserve, setReserve] = useState(false)

  const retenus = CARTE.filter(
    (item) =>
      (famille === 'Toutes' || item.famille === famille) &&
      (duree === 'Toutes' || trancheDe(item.minutes) === duree),
  )
  const choisi = CARTE.find((item) => item.nom === soin)

  // La plage de duree des soins retenus. Quand un seul reste, « de 30 min a 30
  // min » sonnerait faux : on ne dit alors que la duree.
  const minutes = retenus.map((item) => item.minutes)
  const courte = minutes.length === 0 ? 0 : Math.min(...minutes)
  const longue = minutes.length === 0 ? 0 : Math.max(...minutes)
  const plage =
    courte === longue
      ? `de ${dureeLibelle(courte)}`
      : `de ${dureeLibelle(courte)} a ${dureeLibelle(longue)}`

  /** Le dossier, deduit du choix : rien n est tire au sort. */
  const dossier = `ON-${String(((soin.length * 29 + creneau.length * 13) % 800) + 100)}`

  return (
    <Porte forme="iris" marque="Onde" sombre={false}>
      <div
        className="o-bg-stone-50 dark:o-bg-stone-950 o-text-stone-700 dark:o-text-stone-300"
        style={polices}
      >
        {/* ---------- L ouverture : la nuit sur le bassin — Altitude ---------- */}
        <header
          id="onde"
          className="o-relative o-isolate o-min-h-screen o-overflow-hidden"
          style={nuit('stone')}
        >
          <img
            src={photo('spa-bassin', 1800, 1100)}
            alt=""
            aria-hidden="true"
            className="o-absolute o-inset-0 o-z-0 o-size-full o-object-cover"
            style={{ filter: 'brightness(0.85) saturate(0.9)' }}
          />
          <Voile sens="haut-bas" famille="stone" />
          <Grain opacite={0.06} />

          <BarreFilet
            marque="Onde"
            liens={SOMMAIRE}
            action={['#reserver', 'Reserver un soin']}
          />

          <div className="o-relative o-z-10 o-mx-auto o-flex o-min-h-screen o-max-w-6xl o-flex-col o-items-center o-justify-center o-px-5 o-pb-28 o-pt-24 o-text-center md:o-px-8">
            <Surgit>
              <Etiquette>Numero douze — automne 2026</Etiquette>
            </Surgit>
            <Surgit
              delai={120}
              as="h1"
              className="o-m-0 o-mt-7 o-max-w-4xl o-text-stone-50"
              style={{ ...affiche('l', 300), fontFamily: 'var(--o-vitrine-affichage)' }}
            >
              Une heure hors du temps,{' '}
              <Accent couleur={encreSurSombre()}>rue de Poitou</Accent>.
            </Surgit>
            <Surgit
              delai={420}
              as="p"
              className="o-m-0 o-mt-7 o-max-w-xl o-text-lg o-leading-relaxed o-text-stone-300"
            >
              Six cabines, un bassin a trente-quatre degres, aucun bruit — et le telephone
              depose a l accueil. On ne reserve pas une heure, on reserve le silence.
            </Surgit>

            {/* La capsule de demande, en verre. */}
            <Surgit
              delai={540}
              className={`${verre(true)} o-mt-10 o-flex o-w-full o-max-w-lg o-flex-wrap o-items-center o-gap-2 o-p-2 o-pl-5`}
            >
              <span className="o-grow o-text-left o-text-sm o-text-stone-200">
                Un soin, une date, une reponse dans l heure.
              </span>
              <a
                href="#reserver"
                className="o-inline-flex o-items-center o-gap-2 o-rounded-full o-px-5 o-py-2.5 o-text-sm o-font-semibold o-no-underline o-transition-opacity hover:o-opacity-85 focus:o-ring"
                style={aplat()}
              >
                Reserver <Icon icon={ArrowRight} size={14} aria-hidden="true" />
              </a>
            </Surgit>
          </div>

          <p className="o-pointer-events-none o-absolute o-bottom-6 o-left-6 o-z-20 o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-stone-400 md:o-left-8">
            9 rue de Poitou, Paris III
            <br />
            Mardi — dimanche
          </p>
          <p className="o-pointer-events-none o-absolute o-bottom-6 o-right-6 o-z-20 o-m-0 o-text-right o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-stone-400 md:o-right-8">
            Le bassin, 34 degres
            <br />
            Photographie : la salle claire
          </p>
        </header>

        <main>
          {/* ---------- Les rituels : trois planches, les photos derivent ---------- */}
          <section
            id="rituels"
            aria-labelledby="rituels-titre"
            className="o-scroll-mt-24 o-px-5 o-pt-16 md:o-px-8 md:o-pt-24"
          >
            <div className="o-mx-auto o-max-w-6xl">
              <div className="o-flex o-flex-wrap o-items-end o-justify-between o-gap-6">
                <TitreSection id="rituels-titre" numero="01">
                  Trois rituels
                </TitreSection>
                <p className="o-m-0 o-max-w-xs o-text-sm o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
                  Chaque rituel dit sa minute et ce qu il comprend. Rien ne s ajoute a la
                  note sans qu on vous l ait propose avant.
                </p>
              </div>
              <div className="o-mt-12 o-flex o-flex-col">
                {RITUELS.map((rituel, rang) => (
                  <RituelPlanche key={rituel.nom} rituel={rituel} rang={rang} />
                ))}
              </div>
            </div>
          </section>

          {/* ---------- La carte des soins, filtrable ---------- */}
          <section
            id="carte"
            aria-labelledby="carte-titre"
            className={`o-scroll-mt-24 o-border-t ${FILET} o-px-5 o-py-16 md:o-px-8 md:o-py-24`}
          >
            <div className="o-mx-auto o-grid o-max-w-6xl o-gap-10 md:o-grid-cols-12">
              <div className="md:o-col-span-4">
                <div className="md:o-sticky" style={{ top: 125 }}>
                  <TitreSection id="carte-titre" numero="02">
                    La carte
                  </TitreSection>
                  <p className="o-m-0 o-mt-6 o-max-w-xs o-text-sm o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
                    Treize soins. Chacun comprend le parcours d eau, avant ou apres, sans
                    supplement.
                  </p>
                  <div
                    className={`o-mt-8 o-flex o-flex-col o-gap-4 o-border-t ${FILET} o-pt-6`}
                  >
                    <Filtre
                      legende="Famille"
                      options={['Toutes', ...FAMILLES]}
                      valeur={famille}
                      onChange={setFamille}
                    />
                    <Filtre
                      legende="Duree"
                      options={['Toutes', ...DUREES]}
                      valeur={duree}
                      onChange={setDuree}
                    />
                  </div>
                  <p
                    aria-live="polite"
                    className="o-m-0 o-mt-6 o-text-sm o-text-stone-600 dark:o-text-stone-400"
                  >
                    {retenus.length === 0 ? (
                      'Aucun soin ne repond a ces deux filtres. Le parcours d eau, lui, reste ouvert.'
                    ) : (
                      <span>
                        <span className="o-tabular-nums" style={ACCENT_ENCRE}>
                          {retenus.length}
                        </span>{' '}
                        {retenus.length === 1 ? 'soin retenu' : 'soins retenus'}, {plage}.
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="md:o-col-span-8">
                <ul
                  className={`o-m-0 o-flex o-list-none o-flex-col o-border-t ${FILET} o-p-0`}
                >
                  {retenus.map((item) => (
                    <li key={item.nom} className={`o-border-b ${FILET} o-py-5`}>
                      <div className="o-flex o-flex-wrap o-items-baseline o-gap-x-4 o-gap-y-1">
                        <span className="o-font-serif o-text-xl o-text-stone-900 dark:o-text-stone-50">
                          {item.nom}
                        </span>
                        <span
                          className={`o-h-px o-flex-1 o-border-b o-border-dashed ${FILET}`}
                          aria-hidden
                        />
                        <span className="o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                          {dureeLibelle(item.minutes)}
                        </span>
                        <span className="o-ml-auto o-w-20 o-whitespace-nowrap o-text-right o-font-serif o-text-xl o-tabular-nums o-text-stone-900 dark:o-text-stone-50">
                          {item.prix} EUR
                        </span>
                      </div>
                      <p className="o-m-0 o-mt-1.5 o-max-w-2xl o-text-sm o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
                        {item.texte}
                      </p>
                    </li>
                  ))}
                </ul>
                <p className="o-m-0 o-mt-8 o-max-w-2xl o-text-xs o-leading-relaxed o-text-stone-500 dark:o-text-stone-400">
                  Les soins du corps se prennent des seize ans, ceux du visage des
                  quatorze ans accompagnes. Le hammam est deconseille au premier trimestre
                  de grossesse ; dites-le a la reservation, la carte prenatale existe.
                </p>
              </div>
            </div>
          </section>

          {/* ---------- La facade, et quatre nombres en verre poses dessus ---------- */}
          <section
            aria-label="Onde en quatre nombres"
            className="o-relative o-isolate o-overflow-hidden"
            style={{ ...nuit('stone'), minHeight: '70vh' }}
          >
            <Parallaxe
              vitesse={0.18}
              echelle={0.08}
              className="o-absolute o-inset-0 o-z-0"
            >
              <img
                src={photo('spa-lieu', 1800, 1100)}
                alt="La facade du spa, rue de Poitou, la nuit"
                className="o-size-full o-object-cover"
              />
            </Parallaxe>
            <Voile sens="bas" famille="stone" />
            <div className="o-relative o-z-10 o-mx-auto o-flex o-max-w-6xl o-flex-col o-justify-end o-px-5 o-pb-10 o-pt-64 md:o-px-8">
              <p className="o-m-0 o-mb-6 o-font-serif o-text-2xl o-italic o-text-stone-50 md:o-text-4xl">
                La facade, rue de Poitou, a la nuit tombee.
              </p>
              <Chiffres
                verre
                nombres={[
                  { valeur: '34°', quoi: 'le bassin' },
                  { valeur: '6', quoi: 'cabines closes' },
                  { valeur: '0', quoi: 'telephone en salle' },
                  { valeur: '1 h 15', quoi: 'le rituel court' },
                ]}
              />
            </div>
          </section>

          {/* ---------- Offrir : le montant libre ---------- */}
          <section
            id="offrir"
            aria-labelledby="offrir-titre"
            className={`o-scroll-mt-24 o-border-t ${FILET} o-px-5 o-py-16 md:o-px-8 md:o-py-24`}
          >
            <div className="o-mx-auto o-max-w-6xl">
              <div className="o-flex o-flex-wrap o-items-end o-justify-between o-gap-6">
                <TitreSection id="offrir-titre" numero="03">
                  Offrir
                </TitreSection>
                <p className="o-m-0 o-max-w-xs o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                  Trois coffrets, dans un etui de lin ecru
                  <br />
                  Photographies rue de Poitou
                </p>
              </div>

              {/* Trois etuis, a trois formats et trois hauteurs : une nature morte,
                pas une rangee de cartes. */}
              <ul className="o-m-0 o-mt-12 o-grid o-list-none o-gap-6 o-p-0 sm:o-grid-cols-3 md:o-gap-10">
                {COFFRETS.map((coffret) => (
                  <li key={coffret.nom} className={coffret.decalage}>
                    <HoverZoom
                      src={photo(coffret.graine, 900, 1100)}
                      alt={coffret.alt}
                      ratio={coffret.ratio}
                      zoom={1.08}
                      duration={900}
                      className="o-w-full"
                    />
                    <p className="o-m-0 o-mt-3 o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-x-4 o-text-xs o-uppercase o-tracking-widest">
                      <span className="o-text-stone-900 dark:o-text-stone-50">
                        {coffret.nom}
                      </span>
                      <span className="o-tabular-nums" style={ACCENT_ENCRE}>
                        {coffret.prix}
                      </span>
                    </p>
                    <p className="o-m-0 o-mt-1 o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                      Ouvre {coffret.quoi}
                    </p>
                  </li>
                ))}
              </ul>
            </div>

            <div className="o-mx-auto o-mt-20 o-grid o-max-w-6xl o-gap-10 lg:o-grid-cols-2">
              <div>
                <p className="o-m-0 o-max-w-md o-font-serif o-text-2xl o-leading-snug o-text-stone-800 dark:o-text-stone-100 md:o-text-3xl">
                  Ou le montant de votre choix : de quarante a cinq cents euros, par crans
                  de dix.
                </p>
                <p className="o-m-0 o-mt-6 o-max-w-md o-text-base o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
                  La carte porte le montant et non le soin — celui qui la recoit choisit.
                </p>
                <ElasticSlider
                  className="o-mt-10 o-max-w-md"
                  label="Montant du coffret, en euros"
                  min={40}
                  max={500}
                  step={10}
                  value={montant}
                  onChange={setMontant}
                  showValue={false}
                  leading={<Icon icon={Gift} size={17} aria-hidden="true" />}
                />
              </div>

              <div className="o-p-8 md:o-p-10" style={ACCENT_APLAT}>
                <p className="o-m-0 o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                  Carte cadeau
                </p>
                <p
                  className="o-m-0 o-mt-4 o-font-serif o-tabular-nums o-tracking-tight o-text-stone-900 dark:o-text-stone-50"
                  style={{ fontSize: 'clamp(4rem, 8vw, 8rem)', lineHeight: 1 }}
                >
                  {montant}
                  <span className="o-ml-2 o-font-sans o-text-sm o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                    EUR
                  </span>
                </p>
                <p
                  aria-live="polite"
                  className="o-m-0 o-mt-6 o-font-serif o-text-2xl o-leading-snug o-text-stone-800 dark:o-text-stone-100"
                >
                  Cette somme couvre {couverture(montant)}.
                </p>
                <p className="o-m-0 o-mt-6 o-text-xs o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
                  Valable dix-huit mois, utilisable en une ou plusieurs fois, nominative
                  mais transmissible. Ni reprise ni echange contre especes, conformement a
                  l article L. 121-11.
                </p>
                <a href="#reserver" className={`o-mt-8 ${LIEN}`}>
                  Commander cette carte
                  <Icon icon={ArrowRight} size={14} />
                </a>
              </div>
            </div>
          </section>

          {/* ---------- La capsule : la reservation, sur l eau ---------- */}
          <section
            id="reserver"
            aria-labelledby="reserver-titre"
            className={`o-relative o-isolate o-scroll-mt-24 o-overflow-hidden o-border-t ${FILET}`}
          >
            <WaterSurface
              className="o-absolute o-inset-0 o-z-0"
              amplitude={0.1}
              wavelength={1.8}
              choppiness={0.5}
              speed={0.7}
              sun={0.85}
              parallax={0.1}
              colors={['--o-theme-bg', '--o-vitrine-600', '--o-vitrine-200']}
              poster="o-bg-gradient-to-t o-from-stone-300 dark:o-from-stone-800 o-to-stone-50 dark:o-to-stone-950 o-blur-2xl o-scale-110"
            />

            <div className="o-relative o-z-10 o-mx-auto o-grid o-max-w-6xl o-items-start o-gap-8 o-px-5 o-py-24 md:o-px-8 md:o-py-32 lg:o-grid-cols-12">
              {/* Le lieu, sur son propre carton, en marge de la reservation. */}
              <aside
                aria-label="Le lieu"
                className={`o-border-t o-border-b ${FILET} o-bg-stone-50 dark:o-bg-stone-950 o-px-6 o-py-8 lg:o-col-span-4 lg:o-mt-24`}
              >
                <p className="o-m-0 o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                  Le lieu — 04
                </p>
                <dl className="o-m-0 o-mt-4 o-flex o-flex-col">
                  {LIEU.map((ligne) => (
                    <div key={ligne.cle} className={`o-border-t ${FILET} o-py-4`}>
                      <dt className="o-flex o-items-center o-gap-2 o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                        <Icon icon={ligne.icone} size={13} aria-hidden="true" />
                        {ligne.cle}
                      </dt>
                      <dd className="o-m-0 o-mt-1.5 o-text-sm o-leading-relaxed o-text-stone-900 dark:o-text-stone-50">
                        {ligne.valeur}
                      </dd>
                    </div>
                  ))}
                </dl>
              </aside>

              <div
                className={`o-border-t o-border-b ${FILET} o-bg-stone-50 dark:o-bg-stone-950 o-px-6 o-py-12 md:o-px-12 md:o-py-14 lg:o-col-span-8`}
              >
                <p className="o-m-0 o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                  Reservations — 05
                </p>
                <h2
                  id="reserver-titre"
                  className="o-m-0 o-mt-6 o-font-serif o-tracking-tight o-text-stone-900 dark:o-text-stone-50"
                  style={{ fontSize: 'clamp(2.5rem, 5vw, 4.5rem)', lineHeight: 1 }}
                >
                  Une heure suffit.
                </h2>

                {reserve ? (
                  <div className="o-mt-8">
                    <p
                      className="o-m-0 o-p-6 o-text-base o-leading-relaxed o-text-stone-800 dark:o-text-stone-100"
                      style={ACCENT_APLAT}
                    >
                      {choisi?.nom ?? 'Votre soin'}, {creneau}. Dossier{' '}
                      <span className="o-tabular-nums" style={ACCENT_ENCRE}>
                        {dossier}
                      </span>
                      . Presentez-vous dix minutes avant : le vestiaire, le peignoir et
                      les sandales vous attendent. Le telephone se depose a l accueil.
                    </p>
                    <button
                      type="button"
                      className="o-mt-6 o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400 o-underline o-underline-offset-8 hover:o-text-stone-900 dark:hover:o-text-stone-50 o-transition-colors focus:o-ring"
                      onClick={() => {
                        setReserve(false)
                        setCreneau('')
                      }}
                    >
                      Reserver autre chose
                    </button>
                  </div>
                ) : (
                  <div className="o-mt-8">
                    <p className="o-m-0 o-text-sm o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
                      Choisissez un soin et une heure. Les creneaux barres sont deja pris.
                      Annulation sans frais jusqu a vingt-quatre heures avant.
                    </p>

                    <label
                      className="o-mt-8 o-block o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400"
                      htmlFor="onde-soin"
                    >
                      Le soin
                    </label>
                    <select
                      id="onde-soin"
                      className={`o-mt-2 o-w-full o-border-w-1 ${FILET} o-bg-stone-50 dark:o-bg-stone-950 o-px-4 o-py-3 o-text-sm o-text-stone-900 dark:o-text-stone-50 focus:o-ring`}
                      value={soin}
                      onChange={(evenement) => {
                        setSoin(evenement.target.value)
                      }}
                    >
                      {RITUELS.map((rituel) => (
                        <option key={rituel.nom} value={rituel.nom}>
                          {rituel.nom} — {rituel.duree} — {rituel.prix} EUR
                        </option>
                      ))}
                      {CARTE.map((item) => (
                        <option key={item.nom} value={item.nom}>
                          {item.nom} — {dureeLibelle(item.minutes)} — {item.prix} EUR
                        </option>
                      ))}
                    </select>

                    <p className="o-m-0 o-mt-8 o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                      Le creneau
                    </p>
                    <div className="o-mt-4 o-flex o-flex-col o-gap-5">
                      {CRENEAUX.map((jour) => (
                        <div key={jour.jour}>
                          <p className="o-m-0 o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                            {jour.jour}
                          </p>
                          <div
                            role="radiogroup"
                            aria-label={`Creneaux du ${jour.jour}`}
                            className="o-mt-2 o-flex o-flex-wrap o-gap-2"
                          >
                            {jour.heures.map(([heure, libre]) => {
                              const valeur = `${jour.jour}, ${heure}`
                              const actif = valeur === creneau
                              return (
                                <button
                                  key={heure}
                                  type="button"
                                  role="radio"
                                  aria-checked={actif}
                                  disabled={!libre}
                                  onClick={() => {
                                    setCreneau(valeur)
                                  }}
                                  className={
                                    libre
                                      ? actif
                                        ? 'o-border-w-1 o-border-brand-500 o-px-4 o-py-2 o-text-sm o-tabular-nums o-text-stone-900 dark:o-text-stone-50 focus:o-ring'
                                        : `o-border-w-1 ${FILET} o-px-4 o-py-2 o-text-sm o-tabular-nums o-text-stone-700 dark:o-text-stone-300 hover:o-border-brand-400 o-transition-colors focus:o-ring`
                                      : 'o-cursor-not-allowed o-border-w-1 o-border-stone-200 dark:o-border-stone-800 o-px-4 o-py-2 o-text-sm o-tabular-nums o-text-stone-500 dark:o-text-stone-500 o-line-through'
                                  }
                                  style={actif ? ACCENT_APLAT : undefined}
                                >
                                  {heure}
                                </button>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>

                    <p
                      aria-live="polite"
                      className={`o-m-0 o-mt-8 o-border-t ${FILET} o-pt-6 o-text-sm o-leading-relaxed o-text-stone-700 dark:o-text-stone-300`}
                    >
                      {creneau === ''
                        ? 'Aucun creneau retenu pour le moment.'
                        : `${choisi?.nom ?? soin} — ${creneau}. Prevoyez trente minutes de plus pour le parcours d eau, compris.`}
                    </p>

                    <button
                      type="button"
                      disabled={creneau === ''}
                      className={
                        creneau === ''
                          ? 'o-mt-6 o-inline-flex o-cursor-not-allowed o-items-center o-gap-2 o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-500'
                          : `o-mt-6 ${LIEN}`
                      }
                      onClick={() => {
                        setReserve(true)
                      }}
                    >
                      Confirmer la reservation
                      <Icon icon={ArrowRight} size={14} />
                    </button>

                    <p className="o-m-0 o-mt-8 o-text-xs o-leading-relaxed o-text-stone-500 dark:o-text-stone-400">
                      Par telephone, 01 42 71 08 55, du mardi au samedi de 10h a 21h.
                      Aucun acompte n est demande pour un soin de moins de deux heures.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </main>

        {/* ---------- Le pied : une signature en italique, et les mentions ---------- */}
        <footer className={`o-border-t ${FILET} o-px-5 o-py-16 md:o-px-8 md:o-py-24`}>
          <div className="o-mx-auto o-max-w-6xl">
            <p
              className="o-m-0 o-font-serif o-italic o-text-stone-900 dark:o-text-stone-50"
              style={{
                fontSize: 'clamp(2.5rem, 6vw, 6rem)',
                lineHeight: 1,
                letterSpacing: '-0.01em',
              }}
            >
              Le silence se reserve. <span style={ACCENT_ENCRE}>— Onde</span>
            </p>
            <div
              className={`o-mt-12 o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-x-8 o-gap-y-3 o-border-t ${FILET} o-pt-6 o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400`}
            >
              <p className="o-m-0">9 rue de Poitou, 75003 Paris — 01 42 71 08 55</p>
              <nav
                aria-label="Pied de page"
                className="o-flex o-flex-wrap o-gap-x-6 o-gap-y-1"
              >
                {SOMMAIRE.map(([href, mot]) => (
                  <a
                    key={href}
                    href={href}
                    className="o-no-underline o-text-stone-500 dark:o-text-stone-400 hover:o-text-stone-900 dark:hover:o-text-stone-50 o-transition-colors focus:o-ring"
                  >
                    {mot}
                  </a>
                ))}
              </nav>
              <p className="o-m-0">Onde SARL — SIRET 843 209 116 00017 — © 2026</p>
            </div>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
