/**
 * Salle Basse — galerie d art.
 *
 * ## Le parti pris
 *
 * Archetype : colonne laterale. Une galerie tient son cartel a l entree et
 * laisse le mur au travail : le nom, la navigation, l exposition en cours et
 * les horaires restent immobiles dans une colonne de dix-huit rem, et tout ce
 * qui defile a droite est une oeuvre. Aucune barre horizontale, aucun bandeau
 * collant, aucune bande de couleur : un seul mur blanc, du haut au bas de la
 * page, et des filets pour separer.
 *
 * La retenue est le sujet, donc il n y a pas de fond anime : un grain a trois
 * pour cent, juste de quoi que la surface ne soit pas morte. La couleur
 * n apparait que pour dire ce qui est en cours, et ce qui est vendu.
 *
 * ## Ce qui bouge, malgre tout
 *
 * Trois choses, et pas une de plus. Le titre de l accrochage s epaissit sous le
 * pointeur, lettre par lettre — on approche d une cimaise. Les toiles derivent
 * chacune a sa vitesse, avec une inertie qui les fait couler encore apres
 * l arret de la molette : c est ce qui donne au mur une profondeur que des
 * images calees sur le defilement n auraient pas. Et une pastille de curseur
 * vient se coller a l oeuvre survolee, comme un doigt qu on ne pose pas.
 *
 * ## L accrochage, la mosaique, la signature
 *
 * L ouverture est l accrochage : le titre de l exposition en cent-soixante
 * points et la vue de salle en pleine largeur. Les cinq oeuvres suivent en
 * mosaique — cinq largeurs, cinq places, jamais deux rangees pareilles — et
 * leur cartel est colle dans la marge, a hauteur de l oeuvre. La page se
 * termine sur le nom de la galerie, repete en colonne, du plein a l efface :
 * une signature sur le mur, quand il n y a plus rien a regarder.
 *
 * ## Ce qu une galerie doit ecrire
 *
 * Un cartel n est pas une legende : il porte le titre, la technique, les
 * dimensions, l annee, l edition s il y en a une, et l etat de disponibilite —
 * c est la premiere question qu on pose devant une oeuvre, et celle qu on
 * n ose pas poser a l accueil. La pastille pleine dit vendu, la pastille
 * cernee dit reserve : c est la convention du metier, et elle est reprise ici
 * telle quelle, dans la troisieme couleur du modele.
 *
 * ## La couleur
 *
 * Aucune teinte n est ecrite en dur. {@link ENCRE} melange l accent a l encre
 * du theme : il fonce sur le mur blanc, s eclaircit sur le mur sombre, et reste
 * lisible quelle que soit la couleur choisie dans la barre — y compris tres
 * claire, ou une nuance pleine se serait effacee.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import {
  Clock,
  Frame,
  MapPin,
  Ruler,
  ScrollText,
  Truck,
  Users,
} from '@odoro-cli/icons/filaire'
import { Reveal } from '@odoro-cli/libs/motion'
import { type CSSProperties, type ReactElement } from 'react'

import { Noise } from '@/odoro/background/Noise.jsx'
import { StickyCursor } from '@/odoro/effect/StickyCursor.jsx'
import { RevealImage } from '@/odoro/image/RevealImage.jsx'
import { VariableProximity } from '@/odoro/text/VariableProximity.jsx'

import { affiche, paysage, photo } from './media.js'
import { accentDoux, encre } from './palettes.js'
import { affiche as corps, Porte, Surgit, usePolices } from './marche.jsx'
import { Parallaxe } from './scene.jsx'

/** Filet tire de l encre courante : le systeme n a pas d opacite sur couleur. */
const FILET = 'color-mix(in oklab, currentColor 16%, transparent)'

/**
 * L accent, tire vers l encre du theme.
 *
 * La galerie n a qu une couleur, et elle doit tenir sur un mur blanc comme sur
 * un mur presque noir. Une nuance pleine ne le peut pas : celle qui se detache
 * du noir se perd sur le blanc. Melangee a l encre du theme, elle bascule avec
 * elle. Quatre dixiemes et demi d accent : assez pour que la pastille reste une
 * couleur, assez peu pour qu elle reste lisible.
 */
const ENCRE = encre()

/**
 * La couleur des pastilles : la troisieme couleur du modele, telle quelle.
 *
 * Une galerie signale ce qui est vendu par une pastille de couleur, et la
 * convention est assez ancienne pour se passer de legende. La barre du modele
 * Il prend l accent de la page : c est le seul point de couleur d un accrochage
 * volontairement gris, et il doit donc suivre le modele quand on le reteinte.
 * L accent passe par le role calcule, seul a garantir qu une pastille reste
 * visible sur le mur quelle que soit la couleur choisie.
 *
 * Il n est jamais seul a porter l information : le mot « Vendue » ou
 * « Reservee » est ecrit a cote.
 */
const MARQUEUR = encre()

/** Les liens de la colonne. */
const NAVIGATION = [
  ['#exposition', 'Exposition'],
  ['#oeuvres', 'Oeuvres'],
  ['#fonds', 'Le fonds'],
  ['#agenda', 'Agenda'],
  ['#visites', 'Visites'],
  ['#acquerir', 'Acquerir'],
  ['#visiter', 'Venir'],
] as const

/** L etat d une oeuvre au regard de la vente. */
type Etat = 'Disponible' | 'Reservee' | 'Vendue' | 'Collection privee, en pret'

/** Un cartel : ce qui est ecrit a cote d une oeuvre. */
interface Cartel {
  readonly graine: string
  readonly titre: string
  readonly technique: string
  readonly dimensions: string
  readonly annee: string
  readonly alt: string
  readonly etat: Etat
  /** Prix affiche, ou la mention qui en tient lieu. */
  readonly prix: string
  /** Numero d edition, quand l oeuvre en a une. */
  readonly edition?: string
  /** Rapport largeur sur hauteur de l accrochage. */
  readonly format: number
}

/** Les cinq oeuvres accrochees dans la salle. */
const OEUVRES: readonly Cartel[] = [
  {
    graine: 'salle-basse-un',
    titre: 'Mur nord, sept heures',
    technique: 'Huile sur toile de lin',
    dimensions: '162 × 130 cm',
    annee: '2024',
    alt: 'Reproduction de l oeuvre « Mur nord, sept heures »',
    etat: 'Disponible',
    prix: '9 400 EUR',
    format: 1.25,
  },
  {
    graine: 'salle-basse-deux',
    titre: 'Sans titre (carriere)',
    technique: 'Fusain et pierre noire sur papier marouffle',
    dimensions: '210 × 150 cm',
    annee: '2023',
    alt: 'Reproduction de l oeuvre « Sans titre (carriere) »',
    etat: 'Vendue',
    prix: 'Vendue le 3 septembre 2026',
    format: 1.4,
  },
  {
    graine: 'salle-basse-trois',
    titre: 'Deux fois la meme heure',
    technique: 'Diptyque, tempera sur bois',
    dimensions: '2 × (90 × 90) cm',
    annee: '2025',
    alt: 'Reproduction de l oeuvre « Deux fois la meme heure »',
    etat: 'Reservee',
    prix: '12 000 EUR — option jusqu au 20 septembre',
    format: 2,
  },
  {
    graine: 'salle-basse-quatre',
    titre: 'Le fond de la piece',
    technique: 'Plomb repousse et cire',
    dimensions: '48 × 36 × 9 cm',
    annee: '2025',
    alt: 'Reproduction de l oeuvre « Le fond de la piece »',
    etat: 'Disponible',
    prix: '5 800 EUR',
    edition: 'Piece unique, signee au dos',
    format: 1.33,
  },
  {
    graine: 'salle-basse-cinq',
    titre: 'Retour de la lumiere sur le sol',
    technique: 'Acrylique et poussiere de marbre sur toile',
    dimensions: '195 × 260 cm',
    annee: '2026',
    alt: 'Reproduction de l oeuvre « Retour de la lumiere sur le sol »',
    etat: 'Collection privee, en pret',
    prix: 'Hors vente',
    format: 1.5,
  },
]

/** Les pieces du fonds, en reserve. */
const FONDS: readonly Cartel[] = [
  {
    graine: 'fonds-un',
    titre: 'Etude pour un mur',
    technique: 'Encre sur papier',
    dimensions: '38 × 28 cm',
    annee: '2019',
    alt: 'Reproduction de la piece « Etude pour un mur »',
    etat: 'Disponible',
    prix: '1 200 EUR',
    format: 0.78,
  },
  {
    graine: 'fonds-deux',
    titre: 'Ardoise, verso',
    technique: 'Craie sur ardoise',
    dimensions: '40 × 30 cm',
    annee: '2020',
    alt: 'Reproduction de la piece « Ardoise, verso »',
    etat: 'Vendue',
    prix: 'Vendue',
    format: 0.78,
  },
  {
    graine: 'fonds-trois',
    titre: 'Chute numero 4',
    technique: 'Cuivre oxyde',
    dimensions: '52 × 41 cm',
    annee: '2021',
    alt: 'Reproduction de la piece « Chute numero 4 »',
    etat: 'Disponible',
    prix: '2 600 EUR',
    format: 0.78,
  },
  {
    graine: 'fonds-quatre',
    titre: 'Sans titre (matin)',
    technique: 'Huile sur bois',
    dimensions: '60 × 45 cm',
    annee: '2022',
    alt: 'Reproduction de la piece « Sans titre (matin) »',
    etat: 'Reservee',
    prix: '3 400 EUR — option jusqu au 12 octobre',
    format: 0.78,
  },
  {
    graine: 'fonds-cinq',
    titre: 'Piece de sol',
    technique: 'Beton coule et pigment',
    dimensions: '120 × 90 × 4 cm',
    annee: '2023',
    alt: 'Reproduction de la piece « Piece de sol »',
    etat: 'Disponible',
    prix: '4 100 EUR',
    format: 0.78,
  },
  {
    graine: 'fonds-six',
    titre: 'Ligne d horizon, huit essais',
    technique: 'Serigraphie sur papier de chiffon',
    dimensions: '8 × (30 × 30) cm',
    annee: '2024',
    alt: 'Reproduction de la piece « Ligne d horizon, huit essais »',
    etat: 'Disponible',
    prix: '890 EUR la serie',
    edition: 'Edition de 12, numerotee',
    format: 0.78,
  },
]

/** Une exposition, passee ou a venir. */
interface Exposition {
  readonly periode: string
  readonly debut: string
  readonly titre: string
  readonly artiste: string
  readonly note: string
}

/** Ce qui vient. */
const A_VENIR: readonly Exposition[] = [
  {
    periode: '14 novembre 2026 — 24 janvier 2027',
    debut: '2026-11-14',
    titre: 'Ce qui reste du plafond',
    artiste: 'Irene Mazaud',
    note: 'Onze pieces, dont sept inedites. Vernissage le 13 novembre a 18h.',
  },
  {
    periode: '6 fevrier — 18 avril 2027',
    debut: '2027-02-06',
    titre: 'Trente-deux gris',
    artiste: 'Collectif Bas-Cote',
    note: 'Quatre artistes, commissariat de Helene Dorval. Catalogue a paraitre.',
  },
  {
    periode: '2 mai — 27 juin 2027',
    debut: '2027-05-02',
    titre: 'Le poids du papier',
    artiste: 'Jonas Wrede',
    note: 'Premiere exposition personnelle en France. Vingt-quatre pieces.',
  },
]

/** Ce qui a eu lieu. */
const PASSEES: readonly Exposition[] = [
  {
    periode: '12 avril — 22 juin 2026',
    debut: '2026-04-12',
    titre: 'Une piece par jour',
    artiste: 'Helene Dorval',
    note: 'Quatorze pieces. Trois entrees en collection publique.',
  },
  {
    periode: '11 janvier — 29 mars 2026',
    debut: '2026-01-11',
    titre: 'Carrieres',
    artiste: 'Paul Ambroise',
    note: 'Neuf pieces, catalogue epuise. Reedition prevue en 2027.',
  },
  {
    periode: '20 septembre — 21 decembre 2025',
    debut: '2025-09-20',
    titre: 'Rien de plus',
    artiste: 'Miriam Kessler',
    note: 'Sept pieces. Deux sont conservees au fonds de la galerie.',
  },
  {
    periode: '3 mai — 31 aout 2025',
    debut: '2025-05-03',
    titre: 'Le mur sud',
    artiste: 'Irene Mazaud',
    note: 'Dix-huit pieces, dont la serie complete des ardoises.',
  },
]

/** Les horaires d ouverture. */
const HORAIRES: readonly (readonly [string, string])[] = [
  ['Mardi — vendredi', '11h — 19h'],
  ['Samedi', '10h — 20h'],
  ['Dimanche', '14h — 18h'],
  ['Lundi et jours feries', 'Ferme'],
]

/** Les visites commentees, et ce qu il faut savoir avant. */
const VISITES: readonly {
  readonly icone: typeof Users
  readonly titre: string
  readonly quand: string
  readonly corps: string
}[] = [
  {
    icone: Users,
    titre: 'Avec l artiste',
    quand: 'Premier samedi du mois, 16h — 1h environ',
    corps:
      'Sans reservation, dans la limite de vingt personnes. Helene Dorval commente cinq pieces et repond ensuite. Les 3 octobre et 7 novembre pour l exposition en cours.',
  },
  {
    icone: Clock,
    titre: 'Une oeuvre en vingt minutes',
    quand: 'Chaque jeudi, 12h30',
    corps:
      'Une seule piece, vingt minutes, debout. Gratuit, sans reservation, huit personnes au plus. La piece change chaque semaine et est annoncee le lundi.',
  },
  {
    icone: Frame,
    titre: 'Groupes et scolaires',
    quand: 'Sur rendez-vous, du mardi au vendredi',
    corps:
      'Douze a vingt-cinq personnes, une heure, 60 EUR pour le groupe et gratuit pour les classes. Un dossier de six pages est envoye avant la visite.',
  },
  {
    icone: ScrollText,
    titre: 'Visite en langue des signes',
    quand: 'Un samedi par exposition, 15h',
    corps:
      'Interpretee, gratuite, sur inscription a acces@sallebasse.fr. Le 17 octobre pour l exposition en cours. Boucle magnetique disponible a l accueil.',
  },
]

/** Les conditions d acquisition. */
const ACQUISITION: readonly (readonly [string, string])[] = [
  [
    'Reserver',
    'Une option se pose a l accueil ou par courriel, et tient quinze jours. Elle est gratuite et n engage a rien ; passe ce delai, l oeuvre repart a la vente sans relance.',
  ],
  [
    'Payer',
    'En une fois, ou en trois mensualites sans frais au-dela de 3 000 EUR. L oeuvre part quand le solde est regle. Virement, carte, ou cheque de banque.',
  ],
  [
    'Ce qui accompagne l oeuvre',
    'Un certificat d authenticite signe de l artiste, une fiche technique de conservation, et la facture. Pour une edition, le numero et le tirage y sont portes.',
  ],
  [
    'Retirer',
    'Les oeuvres restent accrochees jusqu au dernier jour de l exposition, meme vendues. Retrait a la galerie, ou livraison par transporteur specialise sur devis.',
  ],
  [
    'Droit de suite et revente',
    'Le droit de suite s applique aux reventes ulterieures, a la charge du vendeur. La galerie rachete en priorite une piece de son fonds, au prix d achat.',
  ],
  [
    'Achat a distance',
    'Quatorze jours pour se retracter, transport retour a la charge de l acheteur. Aucune vente n est conclue sans que l oeuvre ait ete vue, en salle ou en visioconference.',
  ],
]

/** Les conditions de pret aux institutions. */
const PRET: readonly (readonly [string, string])[] = [
  [
    'Demande',
    'Par courrier signe de la direction de l etablissement, trois mois avant l ouverture, avec les dates, le lieu et la liste des pieces souhaitees.',
  ],
  [
    'Conditions de conservation',
    'Cinquante a soixante pour cent d humidite relative, 20 degres, 50 lux pour les oeuvres sur papier. Releve transmis chaque mois pendant le pret.',
  ],
  [
    'Assurance et transport',
    'De clou a clou, a la charge de l emprunteur, sur la valeur d assurance indiquee au contrat. Transporteur specialise obligatoire, caisse climatique pour les pieces sur bois.',
  ],
  [
    'Constat d etat',
    'Etabli au depart et au retour, contradictoirement. Toute alteration constatee suspend le pret suivant jusqu a expertise.',
  ],
]

/**
 * La pastille de disponibilite.
 *
 * Pleine pour une piece vendue, cernee pour une piece qui n est plus a prendre
 * sans l etre pour autant — sous option, ou en pret. C est la convention des
 * cimaises, et elle se lit sans legende. Une piece disponible n a pas de
 * pastille : ici, c est l absence qui fait sens.
 */
function Pastille({ etat }: { readonly etat: Etat }): ReactElement {
  if (etat === 'Disponible') return <></>

  return (
    <span
      aria-hidden
      className="o-inline-block o-size-2 o-shrink-0 o-rounded-full o-border-w-1"
      style={
        etat === 'Vendue'
          ? { backgroundColor: MARQUEUR, borderColor: MARQUEUR }
          : { borderColor: MARQUEUR }
      }
    />
  )
}

/**
 * La colonne de gauche.
 *
 * Elle est fixe au-dela de mille vingt-quatre pixels — collee sous le
 * bandeau du site — et se replie en simple barre en dessous : la navigation
 * passe alors a l horizontale et les horaires laissent la place, puisqu ils
 * sont repris plus bas dans « Venir ».
 */
function Colonne(): ReactElement {
  return (
    <div
      className="lg:o-w-72 lg:o-shrink-0 lg:o-border-r max-lg:o-border-b"
      style={{ borderColor: FILET }}
    >
      <div className="lg:o-sticky lg:o-top-24 o-flex o-flex-col o-gap-8 o-px-4 o-py-6 md:o-px-8 lg:o-py-10">
        <div>
          {/* Le titre de la page est celui de l accrochage, pose en grand dans
              l ouverture : la colonne ne porte plus qu un cartel d entree. */}
          <p className="o-m-0 o-text-base o-font-medium o-uppercase o-tracking-widest o-text-zinc-950 dark:o-text-zinc-100">
            Salle Basse
          </p>
          <p className="o-mt-2 o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
            12 rue des Vertus, Paris 3e — entree libre
          </p>
        </div>

        <nav aria-label="Navigation de la galerie">
          <ul className="o-flex o-list-none o-flex-wrap o-gap-x-6 o-gap-y-2 o-p-0 o-text-xs o-uppercase o-tracking-widest lg:o-flex-col lg:o-gap-3">
            {NAVIGATION.map(([href, libelle]) => (
              <li key={href}>
                <a
                  href={href}
                  className="o-text-zinc-600 dark:o-text-zinc-400 o-no-underline hover:o-underline o-transition-colors focus:o-ring"
                >
                  {libelle}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        {/* L exposition en cours : la seule chose que la colonne repete. */}
        <div className="max-lg:o-hidden o-border-t o-pt-6" style={{ borderColor: FILET }}>
          <p
            className="o-flex o-items-center o-gap-2 o-text-xs o-uppercase o-tracking-widest"
            style={{ color: ENCRE }}
          >
            <span
              aria-hidden
              className="o-inline-block o-size-1.5 o-rounded-full"
              style={{ backgroundColor: ENCRE }}
            />
            En cours
          </p>
          <p className="o-mt-3 o-text-lg o-font-medium o-tracking-tight o-text-zinc-950 dark:o-text-zinc-100">
            Une piece par jour
          </p>
          <p className="o-mt-1 o-text-sm o-text-zinc-600 dark:o-text-zinc-400">
            Helene Dorval
          </p>
          <p className="o-mt-3 o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
            <time dateTime="2026-08-29">29 aout</time> —{' '}
            <time dateTime="2026-11-08">8 novembre 2026</time>
          </p>
        </div>

        <div className="max-lg:o-hidden o-border-t o-pt-6" style={{ borderColor: FILET }}>
          <p className="o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
            Horaires
          </p>
          <dl className="o-mt-4 o-flex o-flex-col o-gap-2 o-p-0 o-text-xs">
            {HORAIRES.map(([jours, heures]) => (
              <div key={jours} className="o-flex o-justify-between o-gap-3">
                <dt className="o-text-zinc-600 dark:o-text-zinc-400">{jours}</dt>
                <dd className="o-m-0 o-tabular-nums o-text-zinc-950 dark:o-text-zinc-100">
                  {heures}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        <p
          className="max-lg:o-hidden o-border-t o-pt-6 o-text-xs o-leading-relaxed o-text-zinc-500 dark:o-text-zinc-400"
          style={{ borderColor: FILET }}
        >
          Galerie d art contemporain, ouverte en 2014. Membre du Comite professionnel
          des galeries d art. Maison des artistes n 3341-08.
        </p>
      </div>
    </div>
  )
}

/**
 * L accrochage : la vue de salle, et le titre de l exposition en grand.
 *
 * C est l ouverture de la page, et c est le seul titre qui a le droit d etre un
 * objet. La vue d accrochage derive derriere lui — avec de l inertie, donc elle
 * coule encore une demi-seconde apres l arret de la molette — et les lettres du
 * titre s epaississent sous le pointeur, comme on approche d une cimaise.
 */
function Accrochage(): ReactElement {
  const vue = paysage(
    'salle-basse-accrochage',
    'Vue de l accrochage de l exposition « Une piece par jour »',
  )

  return (
    <section
      id="exposition"
      aria-labelledby="exposition-titre"
      className="o-px-4 o-pb-16 o-pt-10 md:o-px-10 lg:o-px-16 lg:o-pb-24 lg:o-pt-14"
    >
      <Surgit>
        <p
          className="o-m-0 o-flex o-items-center o-gap-2 o-text-xs o-uppercase o-tracking-widest"
          style={{ color: ENCRE }}
        >
          <span
            aria-hidden
            className="o-inline-block o-size-1.5 o-rounded-full"
            style={{ backgroundColor: MARQUEUR }}
          />
          Exposition en cours — 29 aout / 8 novembre 2026
        </p>
      </Surgit>

      {/*
        Le titre est coupe a la main, une ligne par element. `VariableProximity`
        pose chaque lettre en bloc en ligne, et le navigateur s autorise alors a
        couper entre deux lettres : « Une piec / e par jour ». Chaque ligne est
        donc insecable, et c est nous qui decidons ou elle tombe.
      */}
      <Surgit delai={120} className="o-mt-8">
        <h1
          id="exposition-titre"
          className="o-m-0 o-text-zinc-950 dark:o-text-zinc-100"
          style={{ ...corps('xl', 300), fontSize: 'clamp(2.5rem, 10vw, 10rem)', lineHeight: 0.88 }}
        >
          {['Une piece', 'par jour'].map((ligne) => (
            <VariableProximity
              key={ligne}
              as="span"
              rayon={220}
              // Archivo Black n a pas d axe de graisse : la loupe retombe sur
              // la graisse arrondie a la centaine, et il faut donc viser les
              // deux coupes que la famille sait rendre.
              graisseBasse={400}
              graisseHaute={900}
              className="o-block o-whitespace-nowrap"
            >
              {ligne}
            </VariableProximity>
          ))}
        </h1>
      </Surgit>

      <Surgit delai={260} as="p" className="o-m-0 o-mt-8 o-flex o-flex-wrap o-items-baseline o-gap-x-8 o-gap-y-2">
        <span className="o-text-xl o-text-zinc-950 dark:o-text-zinc-100 md:o-text-2xl">
          Helene Dorval
        </span>
        <span className="o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400">
          Quatre-vingt-dix matins — cinq pieces accrochees
        </span>
      </Surgit>

      {/* La vue de salle, pleine largeur, qui derive et continue de couler. */}
      <div className="o-mt-12 o-overflow-hidden">
        <Parallaxe vitesse={0.16} echelle={0.05} glisse={0.78}>
          <RevealImage src={vue.src} alt={vue.alt} ratio={2.2} duration={1100} className="o-w-full" />
        </Parallaxe>
      </div>
      <p className="o-mt-4 o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
        Vue d accrochage, salle basse, septembre 2026 — photographie Camille Roulet
      </p>

      <div className="o-mt-14 o-grid o-gap-10 lg:o-grid-cols-12">
        <p className="o-m-0 o-text-lg o-leading-relaxed o-text-zinc-700 dark:o-text-zinc-300 lg:o-col-span-5 lg:o-col-start-4">
          Pendant quatre-vingt-dix jours, Helene Dorval a fait une seule chose chaque
          matin, entre sept et neuf heures. Cinq de ces pieces sont accrochees ici, dans
          l ordre ou elles ont ete faites. Les autres sont restees a l atelier.
        </p>
        <p className="o-m-0 o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400 lg:o-col-span-3">
          Quatre expositions par an, une salle de cent dix metres carres, et le temps
          qu il faut devant chaque piece. Visite commentee par l artiste le premier
          samedi du mois a 16h, sans reservation, dans la limite de vingt personnes.
        </p>
      </div>
    </section>
  )
}

/** Une ligne de cartel : une etiquette breve, une valeur. */
function Mention({
  quoi,
  valeur,
}: {
  readonly quoi: string
  readonly valeur: string
}): ReactElement {
  return (
    <div>
      <dt className="o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
        {quoi}
      </dt>
      <dd className="o-m-0 o-mt-1 o-text-sm o-text-zinc-950 dark:o-text-zinc-100">
        {valeur}
      </dd>
    </div>
  )
}

/**
 * Le rythme de l accrochage.
 *
 * Cinq oeuvres, cinq largeurs, cinq places : c est ainsi qu on accroche un mur,
 * et c est ce qui empeche une suite de photographies de devenir une grille. La
 * `glisse` donne a chaque toile son propre poids — une grande derive plus
 * longtemps qu une petite, et continue de couler apres l arret du geste.
 */
const ACCROCHAGE = [
  { image: 'lg:o-col-span-8 lg:o-col-start-5', cartel: 'lg:o-col-span-4 lg:o-col-start-1 lg:o-row-start-1', vitesse: 0.14, glisse: 0.62, decalage: '0rem' },
  { image: 'lg:o-col-span-5 lg:o-col-start-1', cartel: 'lg:o-col-span-4 lg:o-col-start-7', vitesse: -0.1, glisse: 0.8, decalage: 'clamp(0rem, 4vw, 5rem)' },
  { image: 'lg:o-col-span-7 lg:o-col-start-6', cartel: 'lg:o-col-span-4 lg:o-col-start-1 lg:o-row-start-1', vitesse: 0.2, glisse: 0.55, decalage: 'clamp(0rem, 3vw, 3.5rem)' },
  { image: 'lg:o-col-span-6 lg:o-col-start-2', cartel: 'lg:o-col-span-4', vitesse: -0.16, glisse: 0.74, decalage: 'clamp(0rem, 2vw, 2.5rem)' },
  { image: 'lg:o-col-span-9 lg:o-col-start-4', cartel: 'lg:o-col-span-3 lg:o-col-start-1 lg:o-row-start-1', vitesse: 0.12, glisse: 0.85, decalage: 'clamp(0rem, 5vw, 6rem)' },
] as const

/**
 * Les cinq oeuvres, en mosaique, cartel colle dans la marge.
 *
 * Le cartel n est plus une legende posee sous l image : il est colle dans la
 * marge, a la hauteur de l oeuvre, et y reste tant qu on la longe — comme le
 * carton pose a cote d une toile, qu on lit sans quitter le mur des yeux. Les
 * toiles derivent chacune a sa vitesse, et une pastille de curseur vient se
 * coller a celle qu on survole.
 */
function Oeuvres(): ReactElement {
  return (
    <section
      id="oeuvres"
      aria-labelledby="oeuvres-titre"
      className="o-border-t o-px-4 o-py-14 md:o-px-10 lg:o-px-16 lg:o-py-24"
      style={{ borderColor: FILET }}
    >
      <h2
        id="oeuvres-titre"
        className="o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400"
      >
        Les cinq oeuvres accrochees
      </h2>

      <StickyCursor size={16} stick={0.35} padding={10} targets="[data-o-sticky]" color={MARQUEUR}>
        <div className="o-mt-14 o-flex o-flex-col o-gap-24 md:o-gap-36">
          {OEUVRES.map((oeuvre, index) => {
            const place = ACCROCHAGE[index % ACCROCHAGE.length] ?? ACCROCHAGE[0]
            if (place === undefined) return null
            return (
              <figure key={oeuvre.graine} className="o-m-0 o-grid o-gap-6 lg:o-grid-cols-12 lg:o-gap-10">
                <Parallaxe
                  vitesse={place.vitesse}
                  glisse={place.glisse}
                  className={`o-min-w-0 ${place.image}`}
                  style={{ marginTop: place.decalage }}
                >
                  <span data-o-sticky className="o-block">
                    <RevealImage
                      src={photo(oeuvre.graine, 1400, Math.round(1400 / oeuvre.format))}
                      alt={oeuvre.alt}
                      ratio={oeuvre.format}
                      duration={1000}
                      className="o-w-full"
                    />
                  </span>
                </Parallaxe>

                {/* Le cartel, colle dans la marge tant qu on longe l oeuvre. */}
                <figcaption className={`o-min-w-0 ${place.cartel}`}>
                  <div className="lg:o-sticky" style={{ top: 128 }}>
                    <div className="o-flex o-items-baseline o-gap-4 o-border-t o-pt-4" style={{ borderColor: FILET }}>
                      <span
                        className="o-text-xs o-tabular-nums o-uppercase o-tracking-widest"
                        style={{ color: ENCRE }}
                      >
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span className="o-inline-flex o-items-center o-gap-2 o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400">
                        <Pastille etat={oeuvre.etat} />
                        {oeuvre.etat}
                      </span>
                    </div>
                    <p
                      className="o-m-0 o-mt-4 o-text-zinc-950 dark:o-text-zinc-100"
                      style={{ ...corps('m', 300), fontSize: 'clamp(1.5rem, 2.6vw, 2.5rem)' }}
                    >
                      {oeuvre.titre}
                    </p>
                    <dl className="o-mt-6 o-grid o-gap-x-6 o-gap-y-4 sm:o-grid-cols-2">
                      <Mention quoi="Technique" valeur={oeuvre.technique} />
                      <Mention quoi="Dimensions" valeur={oeuvre.dimensions} />
                      <Mention quoi="Annee" valeur={oeuvre.annee} />
                      <Mention quoi="Prix" valeur={oeuvre.prix} />
                      {oeuvre.edition !== undefined && (
                        <Mention quoi="Edition" valeur={oeuvre.edition} />
                      )}
                    </dl>
                  </div>
                </figcaption>
              </figure>
            )
          })}
        </div>
      </StickyCursor>

      <p className="o-mt-20 o-max-w-xl o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
        Prix nets, transport et encadrement non compris. Les oeuvres restent accrochees
        jusqu au dernier jour, meme vendues. Une pastille pleine dit vendu, une pastille
        cernee dit reserve.
      </p>
    </section>
  )
}

/** Le fonds de la galerie : petit, range, sans effet. */
function Fonds(): ReactElement {
  return (
    <section
      id="fonds"
      aria-labelledby="fonds-titre"
      className="o-border-t o-px-4 o-py-14 md:o-px-10 lg:o-px-16 lg:o-py-20"
      style={{ borderColor: FILET }}
    >
      <h2
        id="fonds-titre"
        className="o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400"
      >
        Le fonds — quarante-deux pieces en reserve
      </h2>
      <p className="o-mt-6 o-max-w-xl o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
        Ce que la galerie garde entre deux accrochages. La reserve se visite sur
        rendez-vous, le jeudi apres-midi. Six pieces sont montrees ici ; la liste
        complete est envoyee sur demande.
      </p>

      <ul className="o-mt-12 o-grid o-list-none o-gap-x-8 o-gap-y-12 o-p-0 sm:o-grid-cols-2 lg:o-grid-cols-3">
        {FONDS.map((piece) => (
          <li key={piece.graine}>
            <img
              src={affiche(piece.graine, piece.alt).src}
              alt={piece.alt}
              width={800}
              height={1100}
              loading="lazy"
              className="o-block o-aspect-portrait o-h-auto o-w-full o-object-cover o-bg-zinc-100 dark:o-bg-zinc-900"
            />
            <p className="o-mt-4 o-flex o-items-center o-gap-2 o-text-sm o-font-medium o-tracking-tight o-text-zinc-950 dark:o-text-zinc-100">
              <Pastille etat={piece.etat} />
              {piece.titre}
            </p>
            <p className="o-mt-1 o-text-sm o-text-zinc-600 dark:o-text-zinc-400">
              {piece.technique}
            </p>
            <p className="o-mt-1 o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
              {piece.dimensions} — {piece.annee}
            </p>
            {piece.edition !== undefined && (
              <p className="o-mt-1 o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                {piece.edition}
              </p>
            )}
            <p className="o-mt-2 o-text-sm" style={{ color: ENCRE }}>
              {piece.prix}
            </p>
          </li>
        ))}
      </ul>
    </section>
  )
}

/** Une colonne d expositions. */
function ColonneExpositions({
  titre,
  entrees,
  enCouleur,
}: {
  readonly titre: string
  readonly entrees: readonly Exposition[]
  readonly enCouleur: boolean
}): ReactElement {
  const style: CSSProperties | undefined = enCouleur ? { color: ENCRE } : undefined

  return (
    <div>
      <h3
        className={
          enCouleur
            ? 'o-text-xs o-uppercase o-tracking-widest'
            : 'o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400'
        }
        style={style}
      >
        {titre}
      </h3>
      <ul className="o-mt-6 o-flex o-list-none o-flex-col o-p-0">
        {entrees.map((entree) => (
          <li key={entree.titre} className="o-border-t o-py-5" style={{ borderColor: FILET }}>
            <p className="o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
              <time dateTime={entree.debut}>{entree.periode}</time>
            </p>
            <p className="o-mt-2 o-text-lg o-font-medium o-tracking-tight o-text-zinc-950 dark:o-text-zinc-100">
              {entree.titre}
            </p>
            <p className="o-mt-1 o-text-sm o-text-zinc-600 dark:o-text-zinc-400">
              {entree.artiste}
            </p>
            <p className="o-mt-2 o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
              {entree.note}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}

/** L agenda : ce qui vient, ce qui a eu lieu. */
function Agenda(): ReactElement {
  return (
    <section
      id="agenda"
      aria-labelledby="agenda-titre"
      className="o-border-t o-px-4 o-py-14 md:o-px-10 lg:o-px-16 lg:o-py-20"
      style={{ borderColor: FILET }}
    >
      <h2 id="agenda-titre" className="o-sr-only">
        Agenda des expositions
      </h2>

      <Reveal>
        <div className="o-grid o-gap-12 md:o-grid-cols-2">
          <ColonneExpositions titre="A venir" entrees={A_VENIR} enCouleur />
          <ColonneExpositions titre="Passees" entrees={PASSEES} enCouleur={false} />
        </div>
      </Reveal>

      <p className="o-mt-10 o-max-w-2xl o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
        Quatre expositions par an depuis 2014, soit quarante-huit accrochages. Les
        dossiers de presse des expositions passees restent en ligne, et les catalogues
        epuises sont consultables sur place.
      </p>
    </section>
  )
}

/** Les visites commentees. */
function Visites(): ReactElement {
  return (
    <section
      id="visites"
      aria-labelledby="visites-titre"
      className="o-border-t o-px-4 o-py-14 md:o-px-10 lg:o-px-16 lg:o-py-20"
      style={{ borderColor: FILET }}
    >
      <h2
        id="visites-titre"
        className="o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400"
      >
        Visites commentees
      </h2>
      <p className="o-mt-6 o-max-w-xl o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
        Quatre formats, tous gratuits sauf les groupes. Aucun ne dure plus d une heure :
        on regarde peu de pieces, longtemps.
      </p>

      <dl className="o-mt-12 o-grid o-gap-x-12 o-gap-y-10 md:o-grid-cols-2">
        {VISITES.map((visite) => (
          <div key={visite.titre} className="o-border-t o-pt-5" style={{ borderColor: FILET }}>
            <dt className="o-flex o-items-center o-gap-3 o-text-base o-font-medium o-tracking-tight o-text-zinc-950 dark:o-text-zinc-100">
              <span aria-hidden style={{ color: ENCRE }}>
                <Icon icon={visite.icone} size={18} />
              </span>
              {visite.titre}
            </dt>
            <dd className="o-m-0">
              <p className="o-mt-2 o-text-xs o-uppercase o-tracking-widest" style={{ color: ENCRE }}>
                {visite.quand}
              </p>
              <p className="o-mt-2 o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                {visite.corps}
              </p>
            </dd>
          </div>
        ))}
      </dl>
    </section>
  )
}

/** Acquerir une oeuvre, ou en emprunter une. */
function Acquerir(): ReactElement {
  return (
    <section
      id="acquerir"
      aria-labelledby="acquerir-titre"
      className="o-border-t o-px-4 o-py-14 md:o-px-10 lg:o-px-16 lg:o-py-20"
      style={{ borderColor: FILET }}
    >
      <h2
        id="acquerir-titre"
        className="o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400"
      >
        Acquerir, emprunter
      </h2>
      <p className="o-mt-6 o-max-w-xl o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
        Les prix sont affiches au cartel de chaque piece. Ce qui suit est ce qu on
        explique a l accueil, ecrit une fois pour toutes.
      </p>

      <div
        className="o-mt-12 o-rounded-none o-p-6 md:o-p-8"
        style={{ backgroundColor: accentDoux(500, 7) }}
      >
        <h3 className="o-flex o-items-center o-gap-3 o-text-base o-font-medium o-tracking-tight o-text-zinc-950 dark:o-text-zinc-100">
          <span aria-hidden style={{ color: ENCRE }}>
            <Icon icon={Ruler} size={18} />
          </span>
          Acquisition
        </h3>
        <dl className="o-mt-6 o-grid o-gap-x-12 o-gap-y-6 md:o-grid-cols-2">
          {ACQUISITION.map(([quoi, corps]) => (
            <div key={quoi}>
              <dt className="o-text-sm o-font-medium o-text-zinc-950 dark:o-text-zinc-100">
                {quoi}
              </dt>
              <dd className="o-m-0 o-mt-1.5 o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                {corps}
              </dd>
            </div>
          ))}
        </dl>
      </div>

      <h3 className="o-mt-14 o-flex o-items-center o-gap-3 o-text-base o-font-medium o-tracking-tight o-text-zinc-950 dark:o-text-zinc-100">
        <span aria-hidden style={{ color: ENCRE }}>
          <Icon icon={Truck} size={18} />
        </span>
        Pret aux institutions
      </h3>
      <p className="o-mt-3 o-max-w-2xl o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
        La galerie prete aux musees, centres d art et fonds regionaux, et sert
        d intermediaire aupres des collectionneurs pour les pieces qui ne lui
        appartiennent plus.
      </p>
      <dl className="o-mt-8 o-grid o-gap-x-12 o-gap-y-6 md:o-grid-cols-2">
        {PRET.map(([quoi, corps]) => (
          <div key={quoi} className="o-border-t o-pt-4" style={{ borderColor: FILET }}>
            <dt className="o-text-sm o-font-medium o-text-zinc-950 dark:o-text-zinc-100">
              {quoi}
            </dt>
            <dd className="o-m-0 o-mt-1.5 o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
              {corps}
            </dd>
          </div>
        ))}
      </dl>

      <p className="o-mt-8 o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
        Dossiers de pret et demandes de reproduction : prets@sallebasse.fr — reponse
        sous huit jours ouvres.
      </p>
    </section>
  )
}

/** Les horaires et l acces. */
function Visiter(): ReactElement {
  return (
    <section
      id="visiter"
      aria-labelledby="visiter-titre"
      className="o-border-t o-px-4 o-py-14 md:o-px-10 lg:o-px-16 lg:o-py-20"
      style={{ borderColor: FILET }}
    >
      <div className="o-grid o-gap-12 md:o-grid-cols-3">
        <div>
          <h2
            id="visiter-titre"
            className="o-flex o-items-center o-gap-2 o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400"
          >
            <Icon icon={Clock} size={14} />
            Horaires
          </h2>
          <dl className="o-mt-6 o-flex o-flex-col o-p-0 o-text-sm">
            {HORAIRES.map(([jours, heures]) => (
              <div
                key={jours}
                className="o-flex o-justify-between o-gap-4 o-border-t o-py-3"
                style={{ borderColor: FILET }}
              >
                <dt className="o-text-zinc-600 dark:o-text-zinc-400">{jours}</dt>
                <dd className="o-m-0 o-tabular-nums o-font-medium o-text-zinc-950 dark:o-text-zinc-100">
                  {heures}
                </dd>
              </div>
            ))}
          </dl>
          <p className="o-mt-4 o-text-xs o-leading-relaxed o-text-zinc-500 dark:o-text-zinc-400">
            Fermeture annuelle du 1er au 20 aout. Derniere entree quinze minutes avant
            la fermeture.
          </p>
        </div>

        <div>
          <h3 className="o-flex o-items-center o-gap-2 o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
            <Icon icon={MapPin} size={14} />
            Adresse
          </h3>
          <p className="o-mt-6 o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
            12 rue des Vertus
            <br />
            75003 Paris
            <br />
            Metro Arts et Metiers, sortie rue Beaubourg.
          </p>
          <p className="o-mt-4 o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
            Salle de plain-pied, ascenseur depuis la cour, toilettes adaptees. Chiens
            guides admis. Sieges pliants disponibles a l accueil.
          </p>
        </div>

        <div>
          <h3 className="o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
            Nous ecrire
          </h3>
          <p className="o-mt-6 o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
            bonjour@sallebasse.fr
            <br />
            01 44 78 20 16
          </p>
          <p className="o-mt-4 o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
            Reserve et rendez-vous : bonjour@sallebasse.fr. Dossiers d artistes :
            dossiers@sallebasse.fr, ouverts du 1er janvier au 31 mars, reponse a tous.
          </p>
        </div>
      </div>
    </section>
  )
}

/** Les renvois du pied : la forme A10 met l action dans la barre et dans le pied. */
const LIENS_PIED: readonly (readonly [string, string])[] = [
  ['#exposition', 'Exposition en cours'],
  ['#oeuvres', 'Les oeuvres'],
  ['#fonds', 'Le fonds'],
  ['#agenda', 'Expositions passees'],
  ['#visites', 'Visites commentees'],
  ['#acquerir', 'Acquerir, emprunter'],
  ['#visiter', 'Horaires et acces'],
  ['#visiter', 'Dossiers d artistes'],
]

/**
 * Le pied : le mot-marque en colonne verticale.
 *
 * Une galerie signe son mur. Le nom descend donc en colonne, une ligne par
 * repetition, du plein a l efface — le dernier passage est presque le blanc du
 * mur. C est la seule fantaisie typographique que la page s autorise, et elle
 * arrive quand il n y a plus rien a regarder.
 */
function Pied(): ReactElement {
  const passages = [1, 0.68, 0.44, 0.26, 0.14, 0.07]
  return (
    <footer
      className="o-relative o-overflow-hidden o-border-t o-px-4 o-pb-10 o-pt-16 md:o-px-10 lg:o-px-16"
      style={{ borderColor: FILET }}
    >
      <p aria-label="Salle Basse" className="o-m-0">
        {passages.map((teinte, rang) => (
          <span
            key={teinte}
            aria-hidden="true"
            className="o-block o-whitespace-nowrap o-text-zinc-950 dark:o-text-zinc-100"
            style={{
              ...corps('xxl', 300),
              fontSize: 'clamp(2rem, 9.5vw, 8rem)',
              lineHeight: 0.94,
              opacity: teinte,
              // Chaque passage recule d un cran : le nom s enfonce dans le mur.
              marginLeft: `${String(rang * 2)}%`,
            }}
          >
            Salle Basse
          </span>
        ))}
      </p>

      <nav
        aria-label="Plan du site"
        className="o-mt-16 o-border-t o-pt-8"
        style={{ borderColor: FILET }}
      >
        <ul className="o-m-0 o-flex o-list-none o-flex-wrap o-gap-x-8 o-gap-y-3 o-p-0 o-text-xs o-uppercase o-tracking-widest">
          {LIENS_PIED.map(([href, mot]) => (
            <li key={mot}>
              <a
                href={href}
                className="o-text-zinc-600 o-no-underline o-transition-colors hover:o-underline dark:o-text-zinc-400 focus:o-ring"
              >
                {mot}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <p
        className="o-mt-8 o-border-t o-pt-6 o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400"
        style={{ borderColor: FILET }}
      >
        2026 Salle Basse — 12 rue des Vertus, 75003 Paris — SARL au capital de 20 000
        EUR, RCS Paris 802 447 118 — Mentions legales
      </p>
    </footer>
  )
}

/**
 * La vitrine.
 *
 * Aucune redefinition de marque : la barre de la page pose les `--o-vitrine-*`
 * et les `--o-palette-brand-*` sur le conteneur, et la galerie les lit.
 */
export default function Page(): ReactElement {
  const polices = usePolices('affiche')
  return (
    <Porte forme="trou" marque="Salle Basse" sombre={false}>
    <div className="o-relative o-isolate o-bg-white dark:o-bg-zinc-950 o-text-zinc-950 dark:o-text-zinc-100" style={polices}>
      {/* Le seul fond de la page : un grain a trois pour cent, immobile. */}
      <Noise
        className="o-absolute o-inset-0 o-z-0 o-pointer-events-none"
        opacity={0.03}
        scale={0.9}
      />

      <div className="o-relative o-z-10 lg:o-flex">
        <Colonne />
        <main className="o-min-w-0 o-flex-1">
          <Accrochage />
          <Oeuvres />
          <Fonds />
          <Agenda />
          <Visites />
          <Acquerir />
          <Visiter />
        </main>
      </div>
      {/* Le pied quitte la colonne de droite : la signature tient tout le mur. */}
      <Pied />
    </div>
    </Porte>
  )
}
