/**
 * Bivouac — voyagiste de petits groupes.
 *
 * ## L architecture : le carnet de course est le milieu de la page
 *
 * Landing page complete dont le **coeur est une fiche de course**, et c est ce
 * qui n appartient qu a elle : un onglet par voyage comme les intercalaires
 * d un classeur, un profil altimetrique dessine, puis le deroule des etapes
 * jour apres jour — denivele positif et negatif, temps de marche, couchage.
 * C est le document que le marcheur imprime et emporte.
 *
 * L enchainement :
 *
 * - **ouverture** : une crete en plein cadre, le mot-marque en filigrane dont
 *   les lettres s ecartent quand on defile, et le titre revele mot a mot ;
 * - **les trois itineraires**, en planches de formats differents qui derivent
 *   a des vitesses differentes, les chiffres de la course poses en legende sur
 *   la photographie — c est la seule mise en scene de chiffres de la page ;
 * - **le carnet** : intercalaires, entete, profil, etapes ;
 * - **le vol groupe**, en bande etroite ;
 * - **le materiel** coche et le **tableau des conditions** ;
 * - **deux panneaux decales** : la photographie d un cote, ce qu il faut
 *   savoir pour partir de l autre ;
 * - **le pied** : trois horloges, trois positions, en chasse fixe.
 *
 * ## Le mouvement
 *
 * Le mot-marque s ecarte lettre a lettre au defilement de l ouverture ; les
 * planches d itineraire derivent contre le defilement, chacune a sa vitesse,
 * et la derniere mord sur la section suivante. Le carnet, lui, ne bouge pas :
 * un document qu on lit pour marcher n a pas a se deplacer sous les yeux.
 *
 * ## Le fond
 *
 * Le vol groupe occupe une **bande etroite** entre le deroule et le materiel,
 * comme une vignette de carnet. Il n est pas sous le texte : la montagne se lit
 * sur du papier, pas sur une image assombrie.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import {
  ArrowRight,
  ArrowUpRight,
  Backpack,
  Bed,
  Check,
  Footprints,
  MapPin,
  Mountain,
  TrendingDown,
  TrendingUp,
  Users,
} from '@odoro-cli/icons/outline'
import { useMemo, useState, type ReactElement } from 'react'

import { Swarm } from '@/odoro/background/Swarm.jsx'
import { Parallax } from '@/odoro/effect/Parallax.jsx'
import { ParallaxImage } from '@/odoro/image/ParallaxImage.jsx'
import { FoldText } from '@/odoro/text/FoldText.jsx'

import { nuit, Voile } from './communs.jsx'
import { photo } from './media.js'
import { accentDoux, aplat, encre, encreSurSombre } from './palettes.js'
import {
  Actions,
  affiche,
  BarreCoins,
  Etiquette,
  Grain,
  Horloge,
  Indice,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
} from './marche.jsx'
import { Eclate } from './scene.jsx'

import { Reveal } from '@odoro-cli/libs/motion'

/** Une etape du carnet. */
interface Etape {
  readonly jour: number
  readonly titre: string
  readonly montee: number
  readonly descente: number
  readonly heures: string
  readonly couchage: string
  readonly texte: string
}

/** Un voyage, avec son deroule complet. */
interface Voyage {
  readonly cle: string
  readonly nom: string
  readonly lieu: string
  readonly saison: string
  readonly effort: 'Contemplatif' | 'Soutenu' | 'Engage'
  readonly prix: number
  readonly places: number
  readonly graine: string
  readonly resume: string
  readonly etapes: readonly Etape[]
}

/**
 * Les trois courses detaillees.
 *
 * Les deniveles s additionnent : c est le total annonce en entete, et il doit
 * tomber juste. Un carnet ou la somme ne tombe pas n est pas un carnet.
 */
const VOYAGES: readonly Voyage[] = [
  {
    cle: 'ecrins',
    nom: 'La traversee des Ecrins',
    lieu: 'Hautes-Alpes',
    saison: 'Juillet a septembre',
    effort: 'Engage',
    prix: 1290,
    places: 3,
    graine: 'bivouac-ecrins',
    resume:
      'Du Pre de Madame Carle au Valgaudemar. Quatre refuges, deux cols au-dessus de trois mille. On porte ses affaires ; le ravitaillement se fait aux refuges.',
    etapes: [
      {
        jour: 1,
        titre: 'Pre de Madame Carle — refuge du Glacier Blanc',
        montee: 620,
        descente: 40,
        heures: '2 h 30',
        couchage: 'Refuge du Glacier Blanc, dortoir',
        texte:
          'Courte montee d approche, volontairement. On arrive tot, on regarde le glacier, on dort a 2 542 m pour commencer l acclimatation.',
      },
      {
        jour: 2,
        titre: 'Col du Monetier',
        montee: 1180,
        descente: 1340,
        heures: '7 h',
        couchage: 'Refuge de l Alpe de Villar-d Arene',
        texte:
          'Le premier col a 3 043 m. Neve possible jusqu a mi-juillet ; crampons legers fournis et poses par le guide au pied de la pente.',
      },
      {
        jour: 3,
        titre: 'Plateau d Emparis',
        montee: 890,
        descente: 760,
        heures: '5 h 30',
        couchage: 'Gite du Chazelet, chambre de quatre',
        texte:
          'Journee de repit sur les alpages, face a la Meije. La plus belle et la moins dure : elle est placee la expres, entre deux cols.',
      },
      {
        jour: 4,
        titre: 'Breche de la Plate des Agneaux',
        montee: 1310,
        descente: 980,
        heures: '8 h',
        couchage: 'Refuge Adele Planchard',
        texte:
          'La journee la plus longue. Depart a 5 h, pause a midi au replat, arrivee avant l orage. Aucune etape n est raccourcissable.',
      },
      {
        jour: 5,
        titre: 'Col de la Casse Deserte',
        montee: 940,
        descente: 1420,
        heures: '7 h',
        couchage: 'Refuge de Vallonpierre',
        texte:
          'Le passage le plus mineral du parcours. Le lac de Vallonpierre au soir compense les cinq heures de caillasse.',
      },
      {
        jour: 6,
        titre: 'Descente sur le Valgaudemar',
        montee: 780,
        descente: 1490,
        heures: '6 h',
        couchage: 'Gite de La Chapelle, chambre double',
        texte:
          'Derniere crete, puis on perd quinze cents metres jusqu au fond de vallee. Les genoux travaillent : batons vivement conseilles.',
      },
      {
        jour: 7,
        titre: 'Retour a La Chapelle-en-Valgaudemar',
        montee: 680,
        descente: 640,
        heures: '4 h',
        couchage: 'Fin du voyage a 15 h',
        texte:
          'Boucle courte au-dessus du village, puis repas de fin ensemble. Navette vers Gap a 16 h 30, train a 18 h 12.',
      },
    ],
  },
  {
    cle: 'atlas',
    nom: 'Les vallees du Haut Atlas',
    lieu: 'Region de Marrakech, Maroc',
    saison: 'Avril a juin, septembre a novembre',
    effort: 'Soutenu',
    prix: 1480,
    places: 6,
    graine: 'bivouac-atlas',
    resume:
      'Six villages berberes, une nuit chez l habitant dans chacun, et les mules qui portent. Le guide est de la vallee d Ait Bouguemez et y vit toute l annee.',
    etapes: [
      {
        jour: 1,
        titre: 'Marrakech — Ait Bouguemez',
        montee: 0,
        descente: 0,
        heures: 'Route, 5 h',
        couchage: 'Gite d Agouti, chez Lahcen',
        texte:
          'Journee de route par le col de Tizi n Tirghist. Aucune marche : l acclimatation a 1 800 m se fait en dormant, pas en montant.',
      },
      {
        jour: 2,
        titre: 'Vallee heureuse — Sidi Moussa',
        montee: 540,
        descente: 540,
        heures: '4 h',
        couchage: 'Gite d Agouti, chez Lahcen',
        texte:
          'Montee au grenier collectif de Sidi Moussa, retour par les champs. Meme couchage : on pose ses affaires deux nuits.',
      },
      {
        jour: 3,
        titre: 'Col de Tizi n Ait Imi',
        montee: 1120,
        descente: 480,
        heures: '6 h 30',
        couchage: 'Bivouac sous tente, 2 900 m',
        texte:
          'La seule nuit sous tente du voyage. Les mules montent le materiel ; le cuisinier part une heure avant nous.',
      },
      {
        jour: 4,
        titre: 'Descente sur Zaouiat Ahansal',
        montee: 320,
        descente: 1380,
        heures: '6 h',
        couchage: 'Chez Fatima, Zaouiat Ahansal',
        texte:
          'Longue descente dans les gorges. Le village est classe ; la maison ou l on dort est tenue par la meme famille depuis quatre generations.',
      },
      {
        jour: 5,
        titre: 'Les cathedrales de Tamga',
        montee: 610,
        descente: 610,
        heures: '5 h',
        couchage: 'Chez Fatima, Zaouiat Ahansal',
        texte:
          'Boucle au pied des falaises rouges. Journee courte, sieste possible : c est la moitie du voyage et le corps le demande.',
      },
      {
        jour: 6,
        titre: 'Vers Ait Bougmez par les cretes',
        montee: 980,
        descente: 720,
        heures: '6 h 30',
        couchage: 'Gite d Ifrane, chez Brahim',
        texte:
          'Retour par la ligne de crete plutot que par la piste. Deux heures de plus, et la seule vue sur l ensemble du massif.',
      },
      {
        jour: 7,
        titre: 'Marche aux mulets d Ait Bouguemez',
        montee: 240,
        descente: 380,
        heures: '3 h',
        couchage: 'Gite d Agouti, chez Lahcen',
        texte:
          'Le souk du dimanche, si le calendrier tombe juste — sinon la cooperative de noix. Journee legere, volontairement.',
      },
      {
        jour: 8,
        titre: 'Tizi n Tighist',
        montee: 720,
        descente: 900,
        heures: '5 h',
        couchage: 'Gite d Agouti, chez Lahcen',
        texte:
          'Derniere montee, panorama sur le M Goun. On redescend par le versant nord, plus frais l apres-midi.',
      },
      {
        jour: 9,
        titre: 'Retour a Marrakech',
        montee: 0,
        descente: 0,
        heures: 'Route, 5 h',
        couchage: 'Fin du voyage a 16 h',
        texte:
          'Route du retour, arret au col pour le the. Depose a l aeroport ou en medina, au choix.',
      },
    ],
  },
  {
    cle: 'lofoten',
    nom: 'Lofoten en hiver',
    lieu: 'Nordland, Norvege',
    saison: 'Decembre a fevrier',
    effort: 'Contemplatif',
    prix: 2150,
    places: 2,
    graine: 'bivouac-lofoten',
    resume:
      'Quatre heures de jour au solstice, et c est le sujet. On loge dans deux rorbu, on marche court, on attend la lumiere. Aurores probables, jamais promises.',
    etapes: [
      {
        jour: 1,
        titre: 'Svolvaer — Reine',
        montee: 0,
        descente: 0,
        heures: 'Route, 2 h 30',
        couchage: 'Rorbu de Reine, chambre double',
        texte:
          'Arrivee en fin de matinee, route jusqu a Reine avant la nuit de 14 h. Le premier soir sert a s installer et a dormir.',
      },
      {
        jour: 2,
        titre: 'Plage de Kvalvika',
        montee: 340,
        descente: 340,
        heures: '3 h',
        couchage: 'Rorbu de Reine, chambre double',
        texte:
          'Passage d un col enneige puis descente sur une plage fermee par la mer. Raquettes fournies. On y reste pour la lumiere de midi.',
      },
      {
        jour: 3,
        titre: 'Reinebringen, si les conditions le permettent',
        montee: 450,
        descente: 450,
        heures: '3 h 30',
        couchage: 'Rorbu de Reine, chambre double',
        texte:
          'La montee est fermee en cas de verglas, et c est le guide qui tranche le matin meme. Le repli est la baie d A, sans denivele.',
      },
      {
        jour: 4,
        titre: 'Vers Hamnoy et les sechoirs',
        montee: 180,
        descente: 180,
        heures: '2 h 30',
        couchage: 'Rorbu de Hamnoy, chambre double',
        texte:
          'Marche courte le long des sechoirs a morue. On change de rorbu : le second est plus expose, donc meilleur pour les aurores.',
      },
      {
        jour: 5,
        titre: 'Journee libre et attente',
        montee: 0,
        descente: 0,
        heures: 'Libre',
        couchage: 'Rorbu de Hamnoy, chambre double',
        texte:
          'Aucun programme. C est la journee ou l on attend le ciel, et elle est au programme parce qu elle est le voyage.',
      },
      {
        jour: 6,
        titre: 'Retour a Svolvaer',
        montee: 0,
        descente: 0,
        heures: 'Route, 2 h 30',
        couchage: 'Fin du voyage a 13 h',
        texte:
          'Route de retour par la cote. Vol au depart de Svolvaer en fin d apres-midi.',
      },
    ],
  },
]

/** Le materiel, coche selon qu il est fourni ou a apporter. */
const MATERIEL: readonly (readonly [boolean, string])[] = [
  [true, 'Crampons legers et batons, quand l etape l exige'],
  [true, 'Trousse de premiers secours collective et couverture de survie'],
  [true, 'Rechaud, popote et ravitaillement des bivouacs'],
  [true, 'Portage par mules ou par porteurs, quand il est prevu'],
  [false, 'Chaussures montantes rodees — ni neuves, ni de trail'],
  [false, 'Sac de trente-cinq litres, sac a viande pour les refuges'],
  [false, 'Veste impermeable et polaire, meme en juillet'],
  [false, 'Lampe frontale, et des piles de rechange'],
]

/** Les conditions, en tableau plutot qu en accordeon. */
const CONDITIONS: readonly (readonly [string, string])[] = [
  ['Groupe', 'Huit personnes au maximum, quatre au minimum pour partir'],
  [
    'Depart non atteint',
    'Prevenu a trente jours ; report, echange ou remboursement integral sous huit jours',
  ],
  ['Acompte', '30 % a l inscription, solde appele a trente jours du depart'],
  [
    'Annulation',
    'Sans frais a plus de soixante jours ; 30 % jusqu a trente ; 60 % jusqu a quinze ; totalite en deca',
  ],
  [
    'Chambre individuelle',
    'Sans supplement en refuge et sous tente ; de 90 a 220 EUR sur les autres voyages',
  ],
  ['Assurance', 'Rapatriement comprise ; annulation en option a 3,9 % du prix'],
]

/**
 * Le profil altimetrique.
 *
 * Une suite de barres, une par jour, hautes comme le denivele positif. Ce n est
 * pas un ornement : c est ce qui dit ou sont les jours durs, et c est la
 * premiere chose que regarde un marcheur.
 */
function Profil({ etapes }: { readonly etapes: readonly Etape[] }): ReactElement {
  const maximum = Math.max(...etapes.map((e) => e.montee), 1)
  return (
    <figure className="o-m-0">
      <div className="o-flex o-items-end o-gap-1" style={{ height: '72px' }}>
        {etapes.map((etape) => (
          <div
            key={etape.jour}
            className="o-flex o-flex-1 o-flex-col o-items-center o-gap-1.5"
          >
            <div
              className="o-w-full o-rounded-t-sm"
              style={{
                height: `${String(Math.max(3, (etape.montee / maximum) * 60))}px`,
                backgroundColor:
                  etape.montee >= maximum * 0.8 ? encre() : accentDoux(500, 45),
              }}
            />
            <span className="o-font-mono o-text-xs o-tabular-nums o-text-zinc-500 dark:o-text-zinc-400">
              {etape.jour}
            </span>
          </div>
        ))}
      </div>
      <figcaption className="o-mt-3 o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
        Denivele positif par jour, en metres. La barre pleine marque la journee la plus
        dure : {Math.max(...etapes.map((e) => e.montee))} m.
      </figcaption>
    </figure>
  )
}

/** Le denivele positif total d une course, en metres. */
function denivelePositif(v: Voyage): number {
  return v.etapes.reduce((somme, etape) => somme + etape.montee, 0)
}

/**
 * La place de chaque planche d itineraire dans la grille de douze.
 *
 * Trois formats, trois vitesses de derive, trois hauteurs de depart : c est ce
 * qui separe une planche hors texte d une vignette de catalogue. La derniere
 * mord de trois centimetres sur la section qui suit.
 */
const PLANCHES: readonly {
  readonly cle: string
  readonly place: string
  readonly ratio: string
  readonly vitesse: number
  readonly marge?: string
}[] = [
  { cle: 'ecrins', place: 'o-col-span-12 md:o-col-span-5', ratio: '4 / 5', vitesse: 70 },
  {
    cle: 'atlas',
    place: 'o-col-span-12 md:o-col-span-4 md:o-col-start-7 md:o-mt-32',
    ratio: '3 / 4',
    vitesse: -40,
  },
  {
    cle: 'lofoten',
    place: 'o-col-span-12 md:o-col-span-8 md:o-col-start-3',
    ratio: '16 / 9',
    vitesse: 100,
    marge: '-3rem',
  },
]

/**
 * Les trois bases, avec leur fuseau et leur position.
 *
 * Le pied d un voyagiste ne dit pas « nous contacter » : il dit ou l on est, a
 * quelle heure il y fait jour, et a quelles coordonnees on retrouve le guide.
 */
const BASES: readonly (readonly [string, string, string, string])[] = [
  [
    'Grenoble',
    'Europe/Paris',
    '45,1885 N — 5,7245 E',
    'Le bureau — 14 rue Colbert, 38000',
  ],
  [
    'Marrakech',
    'Africa/Casablanca',
    '31,6295 N — 7,9811 O',
    'Ait Bouguemez — chez Lahcen, Agouti',
  ],
  [
    'Svolvaer',
    'Europe/Oslo',
    '68,2342 N — 14,5681 E',
    'Reine — rorbu de Hamnoy, Nordland',
  ],
]

/** La vitrine complete : un carnet de route. */
export default function Page(): ReactElement {
  const polices = usePolices('inter')
  const [cle, setCle] = useState<string>('ecrins')
  const voyage = useMemo(() => VOYAGES.find((v) => v.cle === cle) ?? VOYAGES[0], [cle])

  if (voyage === undefined) return <div />

  const montee = voyage.etapes.reduce((s, e) => s + e.montee, 0)
  const descente = voyage.etapes.reduce((s, e) => s + e.descente, 0)

  return (
    <Porte forme="compteur" marque="Bivouac">
      <div
        className="o-bg-stone-50 dark:o-bg-stone-950 o-text-stone-900 dark:o-text-stone-100"
        style={polices}
      >
        {/* ================= 1. L ouverture ============================== */}
        <header
          className="o-relative o-isolate o-min-h-screen o-overflow-hidden"
          style={nuit('stone')}
        >
          {/* Le mot-marque en filigrane, dont les lettres s ecartent au
            defilement — Aerra. Le titre reste une seule chaine pour les
            lecteurs d ecran, et le bloc entier leur est cache : le nom est
            deja dans la barre et dans le pied. */}
          <div
            aria-hidden="true"
            className="o-pointer-events-none o-absolute o-inset-x-0 o-top-20 o-z-0 o-select-none o-text-center"
          >
            <Eclate
              mot="BIVOUAC"
              haut={190}
              bas={70}
              as="p"
              className="o-m-0 o-whitespace-nowrap o-font-bold o-leading-tight o-tracking-tighter"
              style={{
                fontSize: 'min(24vw, 340px)',
                color: 'color-mix(in oklab, var(--o-theme-fg) 16%, transparent)',
              }}
            />
          </div>
          <img
            src={photo('bivouac-ecrins', 1800, 1000)}
            alt=""
            aria-hidden="true"
            className="o-absolute o-inset-x-0 o-bottom-0 o-z-0 o-w-full o-object-cover"
            style={{
              height: '80%',
              WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 30%)',
              maskImage: 'linear-gradient(to bottom, transparent 0%, black 30%)',
            }}
          />
          <Voile sens="bas" famille="stone" />
          <Grain />

          <BarreCoins
            marque="Bivouac"
            liens={[
              ['#courses', 'Les courses'],
              ['#materiel', 'Le materiel'],
              ['#conditions', 'Les conditions'],
            ]}
            droite="Huit marcheurs au plus"
          />

          <div className="o-relative o-z-10 o-mx-auto o-flex o-min-h-screen o-max-w-6xl o-flex-col o-justify-end o-px-6 o-pb-16 o-pt-24 md:o-px-8">
            <Surgit>
              <Etiquette>Trois courses — de juin a fevrier</Etiquette>
            </Surgit>
            <TitreVague
              delai={120}
              className="o-m-0 o-mt-6 o-max-w-4xl o-text-stone-50"
              style={{ ...affiche('l', 300), fontSize: 'clamp(2.25rem, 5.8vw, 5.75rem)' }}
            >
              On vend un itineraire, pas une photographie de crete.
            </TitreVague>
            <div className="o-mt-8 o-grid o-items-end o-gap-8 lg:o-grid-cols-12">
              <Surgit
                delai={420}
                as="p"
                className="o-m-0 o-max-w-xl o-text-lg o-leading-relaxed o-text-stone-300 lg:o-col-span-7"
              >
                Chaque course est publiee en entier : le denivele de chaque jour, l heure
                de marche, le refuge du soir, ce qu on porte. Vous saurez a quoi ressemble
                la troisieme journee avant de payer l acompte.
              </Surgit>
              <Surgit delai={520} className="lg:o-col-span-5 lg:o-justify-self-end">
                <Actions
                  pleine={[
                    '#courses',
                    <>
                      Lire les trois carnets{' '}
                      <Icon icon={ArrowRight} size={16} aria-hidden="true" />
                    </>,
                  ]}
                  fantome={['#materiel', 'Ce qu il faut emporter']}
                />
              </Surgit>
            </div>
            <div className="o-mt-12 o-flex o-flex-wrap o-justify-between o-gap-x-10 o-gap-y-3 o-border-t o-border-white-20 o-pt-6 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-stone-400">
              <Surgit delai={620} as="p" className="o-m-0">
                Bivouac — Grenoble
                <br />
                Atout France IM038210014
              </Surgit>
              <Surgit delai={680} as="p" className="o-m-0 sm:o-text-right">
                Ecrins · Haut Atlas · Lofoten
                <br />
                Depart des quatre marcheurs
              </Surgit>
            </div>
          </div>
        </header>

        {/* ================= 2. Les itineraires, en planches qui derivent ===== */}
        <section
          aria-labelledby="terrains-titre"
          className="o-mx-auto o-max-w-5xl o-overflow-hidden o-px-4 o-pb-20 o-pt-16 md:o-px-8 md:o-pt-24"
        >
          <div className="o-grid o-gap-6 md:o-grid-cols-12 md:o-items-end">
            <div className="md:o-col-span-7">
              <Reveal>
                <Indice rang="01" sombre={false}>
                  Trois itineraires
                </Indice>
              </Reveal>
              <Reveal delay={80}>
                <h2
                  id="terrains-titre"
                  className="o-m-0 o-mt-6 o-text-balance"
                  style={{ ...affiche('m', 300), fontSize: 'clamp(2rem, 5vw, 4.5rem)' }}
                >
                  Trois terrains, trois saisons.
                </h2>
              </Reveal>
            </div>
            <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-stone-500 dark:o-text-stone-400 md:o-col-span-4 md:o-col-start-7 md:o-justify-self-end md:o-text-right">
              Les chiffres poses sur les planches
              <br />
              sont ceux du carnet complet
            </p>
          </div>

          <ul className="o-m-0 o-mt-16 o-grid o-list-none o-grid-cols-12 o-gap-x-5 o-gap-y-12 o-p-0">
            {PLANCHES.map((planche) => {
              const v = VOYAGES.find((item) => item.cle === planche.cle)
              if (v === undefined) return null
              const denivele = denivelePositif(v)
              return (
                <li
                  key={v.cle}
                  className={`o-min-w-0 ${planche.place}`}
                  style={
                    planche.marge === undefined
                      ? undefined
                      : { marginBottom: planche.marge }
                  }
                >
                  <Parallax distance={planche.vitesse} scale={0.04}>
                    <button
                      type="button"
                      aria-label={`Ouvrir le carnet : ${v.nom}`}
                      onClick={() => {
                        setCle(v.cle)
                      }}
                      className="o-block o-w-full o-cursor-pointer o-text-left focus:o-ring"
                    >
                      <figure className="o-m-0">
                        {/* Les chiffres de la course sont poses sur la
                          photographie, en legende : ils n ont pas de barre a
                          eux sur cette page. */}
                        <div className="o-relative o-overflow-hidden">
                          <img
                            src={photo(v.graine, 900, 1100)}
                            alt={`${v.lieu} — ${v.nom}`}
                            loading="lazy"
                            className="o-block o-w-full o-object-cover o-transition-transform hover:o-scale-105"
                            style={{ aspectRatio: planche.ratio }}
                          />
                          <p
                            className="o-m-0 o-absolute o-inset-x-0 o-bottom-0 o-flex o-flex-wrap o-gap-x-4 o-gap-y-1 o-px-4 o-pb-3 o-pt-10 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-50"
                            style={{
                              background:
                                'linear-gradient(to top, color-mix(in oklab, var(--o-palette-stone-950) 82%, transparent), transparent)',
                            }}
                          >
                            <span className="o-tabular-nums">
                              {v.etapes.length} jours
                            </span>
                            <span className="o-tabular-nums">
                              {denivele.toLocaleString('fr-FR')} m D+
                            </span>
                            <span className="o-tabular-nums">{v.prix} EUR</span>
                            <span
                              className="o-tabular-nums"
                              style={{ color: encreSurSombre() }}
                            >
                              {v.places} place{v.places > 1 ? 's' : ''}
                            </span>
                          </p>
                        </div>
                        <figcaption className="o-mt-4">
                          {/* Un mot par volet, et non un titre entier : le
                            depliage fait de chaque lettre un bloc en ligne, et
                            une ligne pourrait alors se couper au milieu d un
                            mot. Le nom entier reste porte par le bouton. */}
                          <span
                            aria-hidden="true"
                            className="o-block o-tracking-tight"
                            style={{
                              ...affiche('m', 300),
                              fontSize: 'clamp(1.35rem, 2.4vw, 2.25rem)',
                            }}
                          >
                            {v.nom.split(' ').map((mot, rang) => (
                              <FoldText
                                key={`${mot}-${String(rang)}`}
                                as="span"
                                step={34}
                                duration={640}
                                className="o-inline-block"
                                style={{ marginRight: '0.26em' }}
                              >
                                {mot}
                              </FoldText>
                            ))}
                          </span>
                          <span className="o-mt-2 o-block o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                            {v.lieu} — {v.saison}
                          </span>
                        </figcaption>
                      </figure>
                    </button>
                  </Parallax>
                </li>
              )
            })}
          </ul>
        </section>

        {/* ----- Les intercalaires : un onglet par course --------------------- */}
        <div
          id="courses"
          className="o-sticky o-top-0 o-z-30 o-scroll-mt-24 o-border-b o-border-stone-300 dark:o-border-stone-700"
          style={{ backgroundColor: 'var(--o-theme-bg)' }}
        >
          <div className="o-mx-auto o-flex o-max-w-5xl o-items-stretch o-gap-0 o-overflow-x-auto o-px-4 md:o-px-8">
            <span className="o-flex o-shrink-0 o-items-center o-gap-2 o-pr-6 o-font-mono o-text-xs o-uppercase o-tracking-widest">
              <Icon
                icon={Mountain}
                size={14}
                style={{ color: encre() }}
                aria-hidden="true"
              />
              Bivouac
            </span>
            {VOYAGES.map((v) => {
              const actif = v.cle === voyage.cle
              return (
                <button
                  key={v.cle}
                  type="button"
                  aria-pressed={actif}
                  onClick={() => {
                    setCle(v.cle)
                  }}
                  className="o-shrink-0 o-px-4 o-py-3 o-text-sm o-transition-colors focus:o-ring"
                  style={
                    actif
                      ? {
                          borderBottom: `2px solid ${encre()}`,
                          color: encre(),
                          fontWeight: 600,
                        }
                      : { borderBottom: '2px solid transparent' }
                  }
                >
                  {v.nom}
                </button>
              )
            })}
          </div>
        </div>

        {/* ----- La fiche d entete -------------------------------------------- */}
        <header className="o-mx-auto o-max-w-5xl o-px-4 o-py-10 md:o-px-8 md:o-py-14">
          <p className="o-flex o-items-center o-gap-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
            <Icon icon={MapPin} size={13} aria-hidden="true" />
            {voyage.lieu} — {voyage.saison}
          </p>
          <h2 className="o-mt-4 o-max-w-3xl o-text-3xl o-font-semibold o-leading-tight o-tracking-tight o-text-balance md:o-text-4xl">
            {voyage.nom}
          </h2>
          <p className="o-mt-4 o-max-w-2xl o-text-sm o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
            {voyage.resume}
          </p>

          <div className="o-mt-9 o-grid o-gap-8 md:o-grid-cols-12">
            <dl className="o-m-0 o-grid o-grid-cols-2 o-gap-x-6 o-gap-y-4 md:o-col-span-5 md:o-grid-cols-2">
              {(
                [
                  [Footprints, 'Jours de marche', String(voyage.etapes.length)],
                  [Backpack, 'Effort', voyage.effort],
                  [TrendingUp, 'Denivele positif', `${montee.toLocaleString('fr-FR')} m`],
                  [
                    TrendingDown,
                    'Denivele negatif',
                    `${descente.toLocaleString('fr-FR')} m`,
                  ],
                ] as const
              ).map(([icone, quoi, valeur]) => (
                <div key={quoi}>
                  <dt className="o-flex o-items-center o-gap-1.5 o-font-mono o-text-xs o-uppercase o-tracking-wider o-text-stone-500 dark:o-text-stone-400">
                    <Icon icon={icone} size={12} aria-hidden="true" />
                    {quoi}
                  </dt>
                  <dd className="o-m-0 o-mt-1 o-font-mono o-text-lg o-font-semibold o-tabular-nums">
                    {valeur}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="md:o-col-span-7">
              <Profil etapes={voyage.etapes} />
            </div>
          </div>

          <div className="o-mt-9 o-flex o-flex-wrap o-items-center o-gap-4 o-border-t o-border-stone-300 dark:o-border-stone-700 o-pt-6">
            <p className="o-m-0 o-text-xl o-font-semibold o-tabular-nums">
              {voyage.prix} EUR
              <span className="o-ml-2 o-text-sm o-font-normal o-text-stone-500 dark:o-text-stone-400">
                par personne, tout compris sauf le transport
              </span>
            </p>
            {voyage.places === 0 ? (
              <span className="o-rounded-full o-border-w-1 o-border-stone-400 dark:o-border-stone-600 o-px-3 o-py-1 o-text-xs o-font-medium o-text-stone-500 dark:o-text-stone-400">
                Complet — liste d attente
              </span>
            ) : (
              <span
                className="o-inline-flex o-items-center o-gap-1.5 o-rounded-full o-px-3 o-py-1 o-text-xs o-font-semibold"
                style={{ backgroundColor: accentDoux(500, 16), color: encre() }}
              >
                <Icon icon={Users} size={12} aria-hidden="true" />
                {voyage.places} place{voyage.places > 1 ? 's' : ''} restante
                {voyage.places > 1 ? 's' : ''}
              </span>
            )}
            <a
              href="#conditions"
              className="o-ml-auto o-inline-flex o-items-center o-gap-2 o-rounded-full o-px-5 o-py-2.5 o-text-sm o-font-semibold o-no-underline o-transition-opacity hover:o-opacity-85 focus:o-ring"
              style={aplat()}
            >
              Reserver cette date
            </a>
          </div>
        </header>

        {/* ----- Le deroule, jour par jour ------------------------------------ */}
        <section
          aria-label="Deroule du voyage"
          className="o-mx-auto o-max-w-5xl o-px-4 o-pb-16 md:o-px-8"
        >
          <ol className="o-list-none o-m-0 o-p-0">
            {voyage.etapes.map((etape, rang) => (
              <li
                key={etape.jour}
                className="o-grid o-gap-x-6 o-gap-y-3 o-border-t o-border-stone-300 dark:o-border-stone-700 o-py-6 md:o-grid-cols-12"
              >
                {/* Le numero de jour, dans la gouttiere : c est l ancre du carnet. */}
                <div className="md:o-col-span-2">
                  <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                    Jour
                  </p>
                  <p
                    className="o-m-0 o-font-mono o-text-3xl o-font-bold o-tabular-nums o-leading-tight"
                    style={{ color: encre() }}
                  >
                    {String(etape.jour).padStart(2, '0')}
                  </p>
                </div>

                <div className="md:o-col-span-7">
                  <h3 className="o-m-0 o-text-base o-font-semibold o-tracking-tight">
                    {etape.titre}
                  </h3>
                  <p className="o-mt-2 o-text-sm o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
                    {etape.texte}
                  </p>
                  <p className="o-mt-3 o-flex o-items-center o-gap-2 o-font-mono o-text-xs o-text-stone-500 dark:o-text-stone-400">
                    <Icon icon={Bed} size={12} aria-hidden="true" />
                    {etape.couchage}
                  </p>
                </div>

                <dl className="o-m-0 o-flex o-gap-6 md:o-col-span-3 md:o-justify-end">
                  {(
                    [
                      [TrendingUp, `+${String(etape.montee)} m`],
                      [TrendingDown, `-${String(etape.descente)} m`],
                      [Footprints, etape.heures],
                    ] as const
                  ).map(([icone, valeur]) => (
                    <div key={valeur} className="o-text-right">
                      <dt className="o-sr-only">{valeur}</dt>
                      <dd className="o-m-0 o-flex o-items-center o-gap-1.5 o-font-mono o-text-xs o-tabular-nums o-text-stone-600 dark:o-text-stone-300">
                        <Icon icon={icone} size={11} aria-hidden="true" />
                        {valeur}
                      </dd>
                    </div>
                  ))}
                </dl>

                {/* Une photographie tous les trois jours : un carnet n est pas un
                  album, et une image par etape noierait le deroule. */}
                {rang % 3 === 1 && (
                  <div className="md:o-col-span-12">
                    <ParallaxImage
                      src={photo(voyage.graine, 1400, 620)}
                      alt={`${voyage.nom} — ${etape.titre}`}
                      ratio={2.4}
                      strength={0.34}
                      className="o-mt-2 o-w-full o-rounded-lg o-object-cover"
                    />
                  </div>
                )}
              </li>
            ))}
          </ol>
        </section>

        {/* ----- La vignette : le vol groupe, en bande etroite ----------------- */}
        <figure
          className="o-m-0 o-relative o-isolate o-overflow-hidden"
          style={nuit('stone')}
        >
          <Swarm
            className="o-h-40 o-w-full md:o-h-56"
            colors={['--o-theme-bg', '--o-vitrine-400']}
            poster="o-bg-stone-950"
          />
          <figcaption className="o-border-t o-border-stone-800 o-px-4 o-py-3 o-font-mono o-text-xs o-text-stone-400 dark:o-text-stone-400 md:o-px-8">
            <span className="o-font-semibold" style={{ color: encreSurSombre() }}>
              Migration
            </span>{' '}
            — on part quand les cols ouvrent, et on rentre quand ils ferment.
          </figcaption>
        </figure>

        {/* ----- Materiel et conditions, en deux colonnes de tableau ---------- */}
        <div className="o-mx-auto o-grid o-max-w-5xl o-gap-12 o-px-4 o-py-14 md:o-grid-cols-2 md:o-px-8">
          <section
            id="materiel"
            aria-labelledby="materiel-titre"
            className="o-scroll-mt-24"
          >
            <h2
              id="materiel-titre"
              className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400"
            >
              Materiel
            </h2>
            <ul className="o-mt-5 o-list-none o-m-0 o-flex o-flex-col o-gap-2.5 o-p-0 o-text-sm">
              {MATERIEL.map(([fourni, quoi]) => (
                <li key={quoi} className="o-flex o-items-start o-gap-3">
                  <span
                    aria-hidden="true"
                    className="o-mt-0.5 o-inline-flex o-size-4 o-shrink-0 o-items-center o-justify-center o-rounded-sm o-border-w-1"
                    style={
                      fourni
                        ? {
                            borderColor: 'transparent',
                            backgroundColor: encre(),
                            color: 'var(--o-theme-bg)',
                          }
                        : { borderColor: 'var(--o-theme-line)' }
                    }
                  >
                    {fourni && <Icon icon={Check} size={11} />}
                  </span>
                  <span
                    className={fourni ? '' : 'o-text-stone-600 dark:o-text-stone-400'}
                  >
                    {quoi}
                    {!fourni && (
                      <span className="o-ml-2 o-font-mono o-text-xs o-text-stone-500 dark:o-text-stone-500">
                        a apporter
                      </span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </section>

          <section
            id="conditions"
            aria-labelledby="conditions-titre"
            className="o-scroll-mt-24"
          >
            <h2
              id="conditions-titre"
              className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400"
            >
              Conditions
            </h2>
            <dl className="o-m-0 o-mt-5 o-flex o-flex-col">
              {CONDITIONS.map(([quoi, valeur]) => (
                <div
                  key={quoi}
                  className="o-grid o-gap-x-4 o-border-b o-border-stone-200 dark:o-border-stone-800 o-py-3 sm:o-grid-cols-3"
                >
                  <dt className="o-font-mono o-text-xs o-uppercase o-tracking-wider o-text-stone-500 dark:o-text-stone-400">
                    {quoi}
                  </dt>
                  <dd className="o-m-0 o-text-sm o-leading-relaxed sm:o-col-span-2">
                    {valeur}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="o-mt-6 o-text-xs o-leading-relaxed o-text-stone-500 dark:o-text-stone-400">
              Prix par personne, tout compris sauf le transport jusqu au point de depart.
              Le devis nominatif fait foi.
            </p>
          </section>
        </div>

        {/* ================= L appel : deux panneaux decales ================ */}
        <section
          id="partir"
          aria-labelledby="partir-titre"
          className="o-mx-auto o-max-w-5xl o-scroll-mt-24 o-px-4 o-pb-20 o-pt-8 md:o-px-8 md:o-pb-28"
        >
          <div className="o-grid o-gap-6 md:o-grid-cols-12 md:o-gap-0">
            {/* La photographie part de la sixieme colonne et descend ; le
              panneau la mord d une colonne et remonte. Deux plans decales,
              pas deux moities. */}
            <Reveal className="o-order-1 md:o-order-2 md:o-col-span-7 md:o-col-start-6 md:o-row-start-1">
              <figure className="o-m-0">
                <img
                  src={photo('bivouac-lofoten', 1200, 900)}
                  alt="Un rorbu au bord de l eau, lumiere de midi en hiver"
                  loading="lazy"
                  className="o-block o-h-auto o-w-full o-object-cover"
                  style={{ aspectRatio: '4 / 3' }}
                />
                <figcaption className="o-mt-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400 md:o-text-right">
                  Reine, 14 h 10 — quatre heures de jour au solstice
                </figcaption>
              </figure>
            </Reveal>

            <Reveal
              delay={120}
              className="o-order-2 o-relative o-z-10 md:o-order-1 md:o-col-span-6 md:o-col-start-1 md:o-row-start-1 md:o-mt-24"
            >
              <div
                className="o-border-w-1 o-border-stone-900 dark:o-border-stone-100 o-p-8 md:o-p-10"
                style={{ backgroundColor: 'var(--o-theme-bg)' }}
              >
                <Indice rang="02" sombre={false}>
                  Partir avec nous
                </Indice>
                <h2
                  id="partir-titre"
                  className="o-m-0 o-mt-6 o-text-balance"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.75rem, 3.4vw, 3.25rem)',
                  }}
                >
                  Huit marcheurs, jamais neuf.
                </h2>
                <dl className="o-m-0 o-mt-8 o-border-t o-border-stone-300 dark:o-border-stone-700">
                  {(
                    [
                      ['Le groupe', 'Quatre au minimum pour partir, huit au maximum'],
                      ['Le guide', 'Du massif, et il y vit toute l annee'],
                      ['L acompte', '30 % a l inscription, solde a trente jours'],
                      [
                        'Si le depart ne se fait pas',
                        'Rembourse en entier sous huit jours',
                      ],
                    ] as const
                  ).map(([quoi, valeur]) => (
                    <div
                      key={quoi}
                      className="o-grid o-gap-x-4 o-gap-y-1 o-border-b o-border-stone-200 dark:o-border-stone-800 o-py-3 sm:o-grid-cols-12"
                    >
                      <dt className="o-font-mono o-text-xs o-uppercase o-tracking-wider o-text-stone-500 dark:o-text-stone-400 sm:o-col-span-5">
                        {quoi}
                      </dt>
                      <dd className="o-m-0 o-text-sm o-leading-relaxed sm:o-col-span-7">
                        {valeur}
                      </dd>
                    </div>
                  ))}
                </dl>
                <a
                  href="#courses"
                  className="o-mt-8 o-inline-flex o-items-center o-gap-2 o-rounded-full o-px-6 o-py-3 o-text-sm o-font-semibold o-no-underline o-transition-transform hover:o-scale-105 focus:o-ring"
                  style={aplat()}
                >
                  Reserver une date{' '}
                  <Icon icon={ArrowRight} size={16} aria-hidden="true" />
                </a>
                <p className="o-m-0 o-mt-6 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                  Au-dela de six inscrits ensemble, appelez : cela se decide de vive voix.
                </p>
              </div>
            </Reveal>
          </div>
        </section>

        {/* ================= Le pied : trois horloges, trois positions ====== */}
        <footer className="o-border-t o-border-stone-900 dark:o-border-stone-100 o-px-4 o-pb-8 o-pt-14 md:o-px-8">
          <div className="o-mx-auto o-max-w-5xl">
            <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
              Ou l on est, a cette seconde
            </p>
            <ul className="o-m-0 o-mt-8 o-grid o-list-none o-gap-x-8 o-gap-y-10 o-p-0 sm:o-grid-cols-3">
              {BASES.map(([ville, fuseau, position, quoi]) => (
                <li
                  key={ville}
                  className="o-min-w-0 o-border-t o-border-stone-300 dark:o-border-stone-700 o-pt-5"
                >
                  <p
                    className="o-m-0 o-font-mono o-text-lg o-uppercase o-tracking-tight o-tabular-nums md:o-text-xl"
                    style={{ color: encre() }}
                  >
                    <Horloge ville={ville} fuseau={fuseau} />
                  </p>
                  <p className="o-m-0 o-mt-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-300">
                    {position}
                  </p>
                  <p className="o-m-0 o-mt-1.5 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                    {quoi}
                  </p>
                </li>
              ))}
            </ul>

            <div className="o-mt-14 o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-x-8 o-gap-y-3 o-border-t o-border-stone-300 dark:o-border-stone-700 o-pt-6 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
              <span>
                © 2026 Bivouac SARL — RCS Grenoble 528 411 903 — capital de 40 000 EUR
              </span>
              <a
                href="#partir"
                className="o-inline-flex o-items-center o-gap-1 o-no-underline o-text-stone-700 dark:o-text-stone-300 hover:o-text-stone-950 dark:hover:o-text-stone-50 focus:o-ring"
              >
                courses@bivouac.fr{' '}
                <Icon icon={ArrowUpRight} size={12} aria-hidden="true" />
              </a>
              <span>Atout France IM038210014 — garantie financiere APST</span>
            </div>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
