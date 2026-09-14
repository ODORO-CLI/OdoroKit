/**
 * Tige & Co — fleuriste.
 *
 * ## L architecture : le carnet de commandes est le milieu de la page
 *
 * Landing page complete dont le **coeur est un etal filtre**, et c est ce qui
 * n appartient qu a elle : un rail de facettes colle a gauche — taille,
 * palette, zone de livraison — qui **recalcule le prix** et non seulement la
 * liste. Un fleuriste vend ce qui est sur l etal aujourd hui.
 *
 * ## L univers (Creatie)
 *
 * Du papier creme, rien qui bouge derriere le texte ; ce sont les brassees qui
 * derivent, et des petales colles de travers. L enchainement :
 *
 * - **ouverture** : le nom ecrit a la main, l accroche en capitales lourdes,
 *   une brassee qui mord sur la section suivante ;
 * - **la saison** : ce qui pousse ce mois-ci en manifeste, trois photos en
 *   decale, et la rangee des douze mois ;
 * - **l atelier** en mosaique inegale ;
 * - **le carnet de commandes**, le mecanisme ;
 * - **l adresse**, en grand, et rien d autre ;
 * - **le colophon** : caracteres, papier, credits des photographies.
 *
 * ## Le fond
 *
 * Aucune scene. Un etal n en a pas : ce qui compte y est la couleur des fleurs,
 * et tout ce qui bouge derriere leur ferait concurrence.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import { ArrowRight, Bike, Truck } from '@odoro-cli/icons/filaire'
import { Reveal } from '@odoro-cli/libs/motion'
import { useMemo, useState, type CSSProperties, type ReactElement } from 'react'

import { StickerPeel } from '@/odoro/effect/StickerPeel.jsx'
import { HoverZoom } from '@/odoro/image/HoverZoom.jsx'
import { HandWritten } from '@/odoro/text/HandWritten.jsx'

import { photo } from './media.js'
import { accentDoux, aplat, encre } from './palettes.js'
import {
  Actions,
  affiche,
  BarreFilet,
  Etiquette,
  Indice,
  Manifeste,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
} from './marche.jsx'
import { Devoile, Flotte, Parallaxe } from './scene.jsx'

interface Bouquet {
  readonly nom: string
  readonly fleurs: string
  readonly prix: number
  readonly taille: string
  readonly graine: string
  readonly alt: string
}

/** Les six bouquets du moment. */
const BOUQUETS: readonly Bouquet[] = [
  {
    nom: 'Fevrier clair',
    fleurs: 'Renoncules, anemones, eucalyptus',
    prix: 42,
    taille: 'Moyen — 35 tiges',
    graine: 'tige-fevrier',
    alt: 'Renoncules en fleur, avant montage du bouquet',
  },
  {
    nom: 'Les tulipes du mardi',
    fleurs: 'Tulipes perroquet, mimosa',
    prix: 28,
    taille: 'Petit — 20 tiges',
    graine: 'tige-tulipes',
    alt: 'Bouquet de tulipes perroquet roses et de mimosa jaune',
  },
  {
    nom: 'Brassee du marche',
    fleurs: 'Ce qui est beau ce matin-la',
    prix: 35,
    taille: 'Moyen — variable',
    graine: 'tige-brassee',
    alt: 'Brassee de fleurs de saison posee sur une table de bois',
  },
  {
    nom: 'Grand rose ancien',
    fleurs: 'Roses de jardin, pivoines, astrances',
    prix: 68,
    taille: 'Grand — 55 tiges',
    graine: 'tige-rose',
    alt: 'Grand bouquet de roses de jardin et de pivoines roses',
  },
  {
    nom: 'Vert seulement',
    fleurs: 'Fougeres, ruscus, olivier',
    prix: 32,
    taille: 'Moyen — feuillage',
    graine: 'tige-vert',
    alt: 'Bouquet de feuillages verts, fougeres et branches d olivier',
  },
  {
    nom: 'La botte de saison',
    fleurs: 'Une seule variete, en nombre',
    prix: 24,
    taille: 'Petit — 25 tiges',
    graine: 'tige-botte',
    alt: 'Botte de roses blanches, une seule variete, en vase',
  },
]

/* ============================ La composition =========================== */

/** Une taille de bouquet, avec son prix de base. */
interface Taille {
  readonly cle: string
  readonly nom: string
  readonly tiges: string
  readonly base: number
  readonly hauteur: string
}

/** Les quatre tailles montees a l atelier. */
const TAILLES: readonly Taille[] = [
  {
    cle: 'petit',
    nom: 'Petit',
    tiges: '20 a 25 tiges',
    base: 26,
    hauteur: '35 cm environ',
  },
  {
    cle: 'moyen',
    nom: 'Moyen',
    tiges: '30 a 40 tiges',
    base: 42,
    hauteur: '50 cm environ',
  },
  {
    cle: 'grand',
    nom: 'Grand',
    tiges: '50 a 60 tiges',
    base: 68,
    hauteur: '65 cm environ',
  },
  {
    cle: 'brassee',
    nom: 'Brassee',
    tiges: '75 a 90 tiges',
    base: 96,
    hauteur: '80 cm environ',
  },
]

/** Une palette de saison, avec ce qu elle coute et ce qu elle contient. */
interface PaletteFlorale {
  readonly cle: string
  readonly nom: string
  readonly fleurs: string
  /** Multiplie le prix de base : une variete rare coute plus qu un champetre. */
  readonly coefficient: number
  readonly saison: string
  /** Les mois ou elle se monte sans faire venir quoi que ce soit de loin. */
  readonly mois: readonly number[]
}

/** Les cinq palettes proposees. */
const PALETTES_FLORALES: readonly PaletteFlorale[] = [
  {
    cle: 'blanc',
    nom: 'Blanc et vert',
    fleurs: 'Renoncules blanches, anemones, eucalyptus, ruscus',
    coefficient: 1,
    saison: 'D octobre a avril',
    mois: [0, 1, 2, 3, 9, 10, 11],
  },
  {
    cle: 'rose',
    nom: 'Rose ancien',
    fleurs: 'Roses de jardin, pivoines, astrances, scabieuses',
    coefficient: 1.3,
    saison: 'De mai a juillet',
    mois: [4, 5, 6],
  },
  {
    cle: 'jaune',
    nom: 'Jaune de fin d hiver',
    fleurs: 'Mimosa, narcisses, forsythia, giroflees',
    coefficient: 0.95,
    saison: 'De janvier a mars',
    mois: [0, 1, 2],
  },
  {
    cle: 'rouge',
    nom: 'Rouge profond',
    fleurs: 'Dahlias, amarantes, cosmos chocolat, sedum',
    coefficient: 1.15,
    saison: 'De juillet a octobre',
    mois: [6, 7, 8, 9],
  },
  {
    cle: 'champetre',
    nom: 'Champetre',
    fleurs: 'Ce qui est beau au marche ce matin-la',
    coefficient: 0.85,
    saison: 'Toute l annee',
    mois: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  },
]

/** Une zone de livraison, avec son tarif et son delai. */
interface Zone {
  readonly cle: string
  readonly nom: string
  readonly detail: string
  readonly tarif: number
  readonly delai: string
  /** Montant de fleurs a partir duquel le port est offert. Zero : jamais. */
  readonly franchise: number
}

/** Les quatre zones desservies. */
const ZONES: readonly Zone[] = [
  {
    cle: 'velo',
    nom: 'A velo, 3e 4e 10e 11e',
    detail: 'Les quatre arrondissements autour de l atelier.',
    tarif: 6,
    delai: 'Le jour meme si la commande part avant 14h',
    franchise: 50,
  },
  {
    cle: 'paris',
    nom: 'Reste de Paris',
    detail: 'Intra-muros, du 1er au 20e, en scooter electrique.',
    tarif: 9,
    delai: 'Le jour meme si la commande part avant 12h',
    franchise: 80,
  },
  {
    cle: 'couronne',
    nom: 'Petite couronne',
    detail: 'Hauts-de-Seine, Seine-Saint-Denis, Val-de-Marne.',
    tarif: 14,
    delai: 'Le lendemain, creneau de trois heures',
    franchise: 0,
  },
  {
    cle: 'retrait',
    nom: 'Retrait a l atelier',
    detail: '22 rue de la Folie-Mericourt, du mardi au samedi.',
    tarif: 0,
    delai: 'Pret deux heures apres la commande',
    franchise: 0,
  },
]

/* =========================== Le calendrier ============================= */

/** Les mois, sans accent. */
const MOIS = [
  'janvier',
  'fevrier',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'aout',
  'septembre',
  'octobre',
  'novembre',
  'decembre',
] as const

/**
 * Les mois abreges, pour la rangee des douze.
 *
 * Couper les noms a quatre lettres donnerait « Dece » et « Nove » : les
 * abreviations sont donc ecrites, comme dans un calendrier imprime.
 */
const MOIS_COURTS = [
  'jan',
  'fev',
  'mar',
  'avr',
  'mai',
  'juin',
  'juil',
  'aou',
  'sep',
  'oct',
  'nov',
  'dec',
] as const

/** Ce qui pousse un mois donne, et ce qui n y pousse pas. */
interface MoisFloral {
  readonly fleurs: readonly string[]
  readonly note: string
  readonly absentes: string
}

/**
 * Le calendrier des fleurs, mois par mois.
 *
 * C est la page que les fleuristes serieux publient et que les autres evitent :
 * elle dit ce qu on ne peut pas vendre. Une pivoine en decembre a traverse
 * l Atlantique en avion ; ecrire le mois ou elle pousse vaut mieux que de
 * l ecrire nulle part.
 */
const CALENDRIER: readonly MoisFloral[] = [
  {
    fleurs: ['Amaryllis', 'Anemone', 'Renoncule', 'Mimosa', 'Hellebore', 'Eucalyptus'],
    note: 'Le mimosa monte du Var la deuxieme semaine, et ne tient que huit jours.',
    absentes:
      'Ni pivoine, ni dahlia, ni rose de jardin : rien de tout cela ne pousse en janvier.',
  },
  {
    fleurs: ['Renoncule', 'Anemone', 'Tulipe', 'Mimosa', 'Narcisse', 'Giroflee'],
    note: 'Le meilleur mois de la renoncule : quarante varietes passent par le marche.',
    absentes:
      'Toujours pas de pivoine. Les roses viennent de serre, nous n en prenons pas.',
  },
  {
    fleurs: ['Tulipe', 'Narcisse', 'Jacinthe', 'Forsythia', 'Renoncule', 'Muflier'],
    note: 'Les branches fleuries arrivent : forsythia, prunus, puis lilas en fin de mois.',
    absentes: 'Le dahlia est encore en terre, il ne sortira pas avant juillet.',
  },
  {
    fleurs: [
      'Lilas',
      'Tulipe perroquet',
      'Muguet',
      'Ancolie',
      'Pois de senteur',
      'Viburnum',
    ],
    note: 'Le muguet le 1er, vendu en brins et en pots, comme partout.',
    absentes: 'La pivoine se montre les tout derniers jours, jamais avant.',
  },
  {
    fleurs: [
      'Pivoine',
      'Rose de jardin',
      'Pois de senteur',
      'Lilas',
      'Ancolie',
      'Marguerite',
    ],
    note: 'Six semaines de pivoine, pas une de plus. C est le mois ou l atelier ne dort pas.',
    absentes: 'Les chrysanthemes et les dahlias sont hors sujet jusqu a l ete.',
  },
  {
    fleurs: [
      'Rose de jardin',
      'Delphinium',
      'Astrance',
      'Achillee',
      'Scabieuse',
      'Pivoine',
    ],
    note: 'La rose de jardin francaise est a son maximum, parfum compris.',
    absentes:
      'La pivoine s arrete au 20 : apres, c est de l import, nous nous abstenons.',
  },
  {
    fleurs: ['Dahlia', 'Tournesol', 'Zinnia', 'Cosmos', 'Rose', 'Gypsophile'],
    note: 'Debut du dahlia, cultive a 40 kilometres, coupe la veille.',
    absentes: 'Plus de pivoine ni de lilas jusqu au printemps prochain.',
  },
  {
    fleurs: ['Dahlia', 'Cosmos', 'Zinnia', 'Amarante', 'Tournesol', 'Hortensia'],
    note: 'L atelier ferme la premiere quinzaine ; les abonnements sont mis en pause.',
    absentes: 'Peu de feuillage tendre : la chaleur le fait tourner en une journee.',
  },
  {
    fleurs: ['Dahlia', 'Amarante', 'Sedum', 'Rose d automne', 'Physalis', 'Aster'],
    note: 'Le meilleur rapport tenue et prix de l annee : tout est local et abondant.',
    absentes: 'La tulipe ne reviendra qu en fevrier, quoi qu en disent les catalogues.',
  },
  {
    fleurs: [
      'Chrysantheme',
      'Dahlia',
      'Sedum',
      'Branches a baies',
      'Anemone du Japon',
      'Eucalyptus',
    ],
    note: 'Le chrysantheme de collection sort du placard funeraire : essayez-le en bouquet.',
    absentes: 'Le dahlia s arrete a la premiere gelee, souvent autour du 25.',
  },
  {
    fleurs: [
      'Chrysantheme',
      'Renoncule',
      'Anemone',
      'Branches a baies',
      'Pin',
      'Eucalyptus',
    ],
    note: 'Retour des renoncules et des anemones : la saison d hiver commence vraiment.',
    absentes: 'Ni dahlia ni rose de jardin, jusqu au mois de mai.',
  },
  {
    fleurs: ['Amaryllis', 'Anemone', 'Renoncule', 'Hellebore', 'Sapin', 'Houx'],
    note: 'Couronnes montees sur commande a partir du 1er, huit par jour au maximum.',
    absentes: 'Aucune fleur d ete. Ce qui en a l air vient d ailleurs, en avion.',
  },
]

/**
 * Le nom, ecrit a la main : un seul trait.
 *
 * La barre du T est tracee d abord, puis la main revient a la hampe et descend
 * sans se lever jusqu au e final, qui file en trait de soulignement.
 */
const TRACE_NOM = [
  'M 22 30',
  'C 48 20, 82 16, 108 22',
  'C 90 24, 72 24, 62 26',
  'C 58 46, 54 66, 50 82',
  'C 48 92, 58 94, 66 86',
  'C 74 76, 82 62, 90 56',
  'C 92 64, 88 78, 94 84',
  'C 100 88, 106 76, 110 66',
  'C 114 60, 126 56, 132 62',
  'C 138 70, 132 84, 124 84',
  'C 114 84, 112 72, 120 64',
  'C 128 58, 134 66, 134 74',
  'C 134 86, 136 100, 128 106',
  'C 118 110, 110 102, 118 94',
  'C 126 86, 142 80, 152 72',
  'C 160 66, 172 62, 174 70',
  'C 176 78, 162 82, 158 76',
  'C 156 66, 170 58, 184 62',
  'C 194 66, 196 80, 210 82',
  'C 226 84, 250 70, 290 60',
].join(' ')

/** Le papier : une creme chaude en clair, une nuit de pierre en sombre. */
const PAPIER: CSSProperties = {
  backgroundColor: 'light-dark(#f6efe5, var(--o-palette-stone-950))',
}

/** Un prix en euros, arrondi a l euro comme sur l ardoise de l atelier. */
function euros(valeur: number): string {
  return `${String(Math.round(valeur))} EUR`
}

/* ============================ Le rendu ============================ */

/** La vitrine complete : l etal de la semaine. */
export default function Page(): ReactElement {
  const polices = usePolices('bricolage')
  const moisCourant = useMemo(() => new Date().getMonth(), [])
  const [moisVu, setMoisVu] = useState<number>(moisCourant)

  const [taille, setTaille] = useState<string>('moyen')
  const [palette, setPalette] = useState<string>('blanc')
  const [zone, setZone] = useState<string>('velo')

  const laTaille = TAILLES.find((t) => t.cle === taille) ?? TAILLES[0]
  const laPalette =
    PALETTES_FLORALES.find((p) => p.cle === palette) ?? PALETTES_FLORALES[0]
  const laZone = ZONES.find((z) => z.cle === zone) ?? ZONES[0]

  // Le prix se recalcule : la taille donne la base, la palette son coefficient.
  // Le port tombe au-dela de la franchise de la zone, quand elle existe.
  const compte = useMemo(() => {
    if (laTaille === undefined || laPalette === undefined || laZone === undefined)
      return undefined
    const fleurs = Math.round(laTaille.base * laPalette.coefficient)
    const port = laZone.franchise > 0 && fleurs >= laZone.franchise ? 0 : laZone.tarif
    return { fleurs, port, total: fleurs + port }
  }, [laTaille, laPalette, laZone])

  const deSaison = laPalette?.mois.includes(moisCourant) ?? false
  const moisFloral = CALENDRIER[moisCourant]
  const moisChoisi = CALENDRIER[moisVu]

  return (
    <Porte forme="trou" marque="Tige & Co" sombre={false}>
      <div
        className="o-text-stone-900 dark:o-text-stone-100"
        style={{ ...polices, ...PAPIER }}
      >
        {/* ================= 1. L ouverture : creme, le nom a la main ======== */}
        <header className="o-relative o-isolate">
          <BarreFilet
            sombre={false}
            marque="Tige & Co"
            liens={[
              ['#saison', 'La saison'],
              ['#atelier', 'L atelier'],
              ['#carnet', 'Commander'],
            ]}
            action={['#adresse', 'Venir a l atelier']}
          />

          <div className="o-relative o-z-10 o-mx-auto o-grid o-max-w-6xl o-items-center o-gap-10 o-px-6 o-pb-16 o-pt-14 lg:o-grid-cols-12 lg:o-gap-8 lg:o-pt-20">
            <div className="o-min-w-0 lg:o-col-span-7">
              <Surgit>
                <Etiquette sombre={false}>
                  Fleuriste — Paris 11e — ouvert jusqu a 19 h 30
                </Etiquette>
              </Surgit>
              <Surgit delai={140} className="o-mt-8">
                <HandWritten
                  path={TRACE_NOM}
                  viewBox="0 0 320 110"
                  width={320}
                  thickness={4}
                  duration={2200}
                  declenchement="montage"
                  color={encre()}
                  className="o-max-w-full"
                >
                  Tige & Co
                </HandWritten>
              </Surgit>
              <TitreVague
                delai={320}
                cadence={90}
                className="o-m-0 o-mt-2 o-max-w-3xl o-uppercase o-text-stone-950 dark:o-text-stone-50"
                style={{ ...affiche('l', 800), fontSize: 'clamp(2.75rem, 8vw, 8rem)' }}
              >
                Ce qui est sur l etal ce matin.
              </TitreVague>
              {moisFloral !== undefined && (
                <Surgit
                  delai={720}
                  as="p"
                  className="o-m-0 o-mt-8 o-max-w-lg o-text-lg o-leading-relaxed o-text-stone-600 dark:o-text-stone-300"
                >
                  <span style={{ color: encre() }}>En {MOIS[moisCourant]} : </span>
                  {moisFloral.fleurs.join(', ').toLowerCase()}. Rien qui ait pris l avion.
                </Surgit>
              )}
              <Surgit delai={840} className="o-mt-9">
                <Actions
                  sombre={false}
                  pleine={[
                    '#carnet',
                    <>
                      Composer un bouquet{' '}
                      <Icon icon={ArrowRight} size={16} aria-hidden="true" />
                    </>,
                  ]}
                  fantome={['#saison', 'Ce qui pousse']}
                />
              </Surgit>
            </div>

            {/* La brassee derive, et mord sur la section suivante. */}
            <Surgit
              delai={500}
              className="o-relative o-min-w-0 lg:o-col-span-5"
              style={{ marginBottom: 'min(0px, calc(2rem - 8vw))' }}
            >
              <Parallaxe vitesse={0.18} echelle={0.03}>
                {/* Le cadre decoupe est celui de `Devoile` : arrondir la figure et
                  l y couper evite les coins carres que laissait l image seule. */}
                <Devoile
                  src={photo('tige-brassee', 1000, 1250)}
                  alt="Une brassee de fleurs de saison, papier kraft, posee sur la table de l atelier"
                  ratio="4 / 5"
                  depuis="bas"
                  derive={48}
                  className="o-overflow-hidden o-rounded-3xl o-shadow-2xl"
                />
              </Parallaxe>
              {/* Les petales : des autocollants colles de travers, qui flottent et se decollent au survol. */}
              <Flotte
                amplitude={6}
                duree={7}
                angle={-8}
                className="o-absolute o-z-20"
                style={{ top: '-1.25rem', left: '-1rem' }}
              >
                <StickerPeel corner="top-right" size={34} className="o-rounded-2xl">
                  <span
                    className="o-block o-px-4 o-py-2.5 o-text-sm o-font-semibold"
                    style={aplat()}
                  >
                    Monte ce matin
                  </span>
                </StickerPeel>
              </Flotte>
              <Flotte
                amplitude={8}
                duree={9}
                delai={-3}
                angle={7}
                className="o-absolute o-z-20"
                style={{ bottom: '3rem', right: '-1.25rem' }}
              >
                <StickerPeel corner="bottom-left" size={34} className="o-rounded-2xl">
                  <span
                    className="o-block o-px-4 o-py-2.5 o-text-sm o-font-semibold"
                    style={aplat()}
                  >
                    Livre a velo en 2 h
                  </span>
                </StickerPeel>
              </Flotte>
              <Flotte
                amplitude={5}
                duree={8}
                delai={-5}
                angle={4}
                className="o-absolute o-z-20 o-hidden md:o-block"
                style={{ top: '38%', right: '-2.5rem' }}
              >
                <StickerPeel corner="top-left" size={30} className="o-rounded-2xl">
                  <span
                    className="o-block o-px-4 o-py-2.5 o-text-sm o-font-semibold"
                    style={aplat()}
                  >
                    Sept jours de tenue
                  </span>
                </StickerPeel>
              </Flotte>
            </Surgit>
          </div>

          <p className="o-pointer-events-none o-absolute o-bottom-6 o-left-6 o-z-0 o-m-0 o-hidden o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-stone-500 dark:o-text-stone-400 md:o-block">
            22 rue de la Folie-Mericourt
            <br />
            Paris 11e
          </p>
        </header>

        <main>
          {/* ================= 2. La saison : manifeste, photos en decale, douze mois ===== */}
          <section
            id="saison"
            aria-labelledby="saison-titre"
            className="o-scroll-mt-24 o-mx-auto o-max-w-6xl o-px-6 o-pb-24 o-pt-28 md:o-pt-40"
          >
            <Indice rang="01" sombre={false}>
              La saison
            </Indice>
            <h2 id="saison-titre" className="o-sr-only">
              Ce qui pousse ce mois-ci
            </h2>
            {moisFloral !== undefined && (
              <div className="o-mt-8">
                <Manifeste
                  sombre={false}
                  eteint={`En ${MOIS[moisCourant]}, l etal ne connait que six fleurs :`}
                >
                  {moisFloral.fleurs.join(', ').toLowerCase()}. {moisFloral.note}
                </Manifeste>
              </div>
            )}

            <div className="o-relative o-mt-20 o-grid o-grid-cols-12 o-gap-4 md:o-gap-8">
              <Parallaxe vitesse={0.14} className="o-col-span-7 md:o-col-span-5">
                <Devoile
                  src={photo('tige-fevrier', 900, 1100)}
                  alt="Renoncules en fleur, avant montage"
                  ratio="4 / 5"
                  depuis="bas"
                  derive={30}
                  legende="Renoncules — de janvier a mars"
                />
              </Parallaxe>
              <Parallaxe
                vitesse={-0.1}
                className="o-self-end md:o-pb-24"
                style={{ gridColumn: 'span 5 / 13' }}
              >
                <Devoile
                  src={photo('tige-tulipes', 700, 900)}
                  alt="Tulipes perroquet roses et mimosa"
                  ratio="3 / 4"
                  depuis="droite"
                  derive={24}
                  legende="Tulipes perroquet — le mardi"
                />
              </Parallaxe>
              <Parallaxe
                vitesse={0.2}
                className="o-col-span-10 o-col-start-2 md:o-col-span-6 md:o-col-start-4"
                style={{ marginTop: '-2rem' }}
              >
                <Devoile
                  src={photo('tige-rose', 1200, 800)}
                  alt="Roses de jardin et pivoines roses, en brassee"
                  ratio="3 / 2"
                  depuis="gauche"
                  derive={36}
                  legende="Roses de jardin — six semaines de mai"
                  className="o-shadow-2xl"
                />
              </Parallaxe>
              <p className="o-col-span-12 o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-stone-500 dark:o-text-stone-400 md:o-absolute md:o-right-0 md:o-top-0 md:o-w-56 md:o-text-right">
                Quatre producteurs, Ile-de-France et Val de Loire. Coupe la veille, sur le
                seau le matin.
              </p>
            </div>

            {/* La rangee des douze mois : on en choisit un, l etal de ce mois-la s ecrit dessous. */}
            <div className="o-mt-24 o-border-t o-border-stone-900 dark:o-border-stone-100 o-pt-6">
              {/* `o-relative` n est pas decoratif : les libelles en `o-sr-only` sont
                absolus, et sans bloc conteneur pose ici ils s ancrent hors du
                defilement horizontal — ce qui elargit le document entier. */}
              <div
                role="group"
                aria-label="Choisir un mois du calendrier des fleurs"
                className="o-relative o-flex o-gap-1 o-overflow-x-auto o-pb-2 o-scrollbar dark:o-scrollbar-dark"
              >
                {MOIS_COURTS.map((court, rang) => {
                  const actif = rang === moisVu
                  const courant = rang === moisCourant
                  return (
                    <button
                      key={court}
                      type="button"
                      aria-pressed={actif}
                      onClick={() => {
                        setMoisVu(rang)
                      }}
                      className="o-shrink-0 o-rounded-full o-border-w-1 o-px-3 o-py-1.5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-transition-colors focus:o-ring"
                      style={
                        actif
                          ? { ...aplat(), borderColor: 'transparent' }
                          : {
                              borderColor: courant ? encre() : 'var(--o-theme-line)',
                              color: courant ? encre() : 'inherit',
                            }
                      }
                    >
                      <span className="o-sr-only">{MOIS[rang]}</span>
                      <span aria-hidden="true">{court}</span>
                    </button>
                  )
                })}
              </div>
              {moisChoisi !== undefined && (
                <div
                  aria-live="polite"
                  className="o-mt-8 o-grid o-gap-6 md:o-grid-cols-12"
                >
                  <p className="o-m-0 o-text-2xl o-font-semibold o-leading-snug o-tracking-tight md:o-col-span-7 md:o-text-3xl">
                    <span className="o-capitalize">{MOIS[moisVu]}</span> :{' '}
                    {moisChoisi.fleurs.join(', ').toLowerCase()}.
                  </p>
                  <div className="md:o-col-span-5">
                    <p className="o-m-0 o-text-sm o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
                      {moisChoisi.note}
                    </p>
                    <p
                      className="o-m-0 o-mt-3 o-text-sm o-leading-relaxed"
                      style={{ color: encre() }}
                    >
                      {moisChoisi.absentes}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* ================= 3. L atelier, en mosaique inegale ============== */}
          <section
            id="atelier"
            aria-labelledby="atelier-titre"
            className="o-scroll-mt-24 o-border-t o-border-stone-200 dark:o-border-stone-800"
          >
            <div className="o-mx-auto o-grid o-max-w-6xl o-gap-10 o-px-6 o-py-20 md:o-grid-cols-12 md:o-py-28">
              <div className="o-min-w-0 md:o-col-span-4">
                <div className="md:o-sticky" style={{ top: 133 }}>
                  <Indice rang="02" sombre={false}>
                    L atelier
                  </Indice>
                  <h2
                    id="atelier-titre"
                    className="o-m-0 o-mt-6 o-text-stone-950 dark:o-text-stone-50"
                    style={{ ...affiche('m', 800), fontSize: 'clamp(2rem, 4.5vw, 4rem)' }}
                  >
                    Tout est monte ce matin.
                  </h2>
                  <p className="o-mt-6 o-max-w-xs o-text-base o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
                    Les couronnes partent dans l heure ; les bouquets du jour attendent
                    sur le seau, pas dans une chambre froide.
                  </p>
                </div>
              </div>

              <div className="o-grid o-grid-cols-12 o-gap-4 md:o-col-span-8 md:o-gap-6">
                <Reveal className="o-col-span-12 sm:o-col-span-8">
                  <HoverZoom
                    src={photo('tige-atelier-couronne', 1200, 900)}
                    alt="Le tressage d une base de couronne"
                    ratio={1.333}
                    zoom={1.18}
                    className="o-w-full o-rounded-2xl"
                  />
                  <p className="o-m-0 o-mt-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                    La couronne — huit par jour, pas une de plus
                  </p>
                </Reveal>
                <Reveal delay={90} className="o-col-span-6 sm:o-col-span-4 sm:o-mt-16">
                  <HoverZoom
                    src={photo('tige-atelier-rond', 700, 700)}
                    alt="Un bouquet rond, monte en spirale"
                    ratio={1}
                    zoom={1.18}
                    className="o-w-full o-rounded-2xl"
                  />
                  <p className="o-m-0 o-mt-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                    Le rond, en spirale
                  </p>
                </Reveal>
                <Reveal
                  delay={180}
                  className="o-col-span-6 sm:o-col-span-4 sm:o-col-start-3"
                >
                  <HoverZoom
                    src={photo('tige-atelier-sechees', 700, 700)}
                    alt="Une tete sechee, gardee pour l hiver"
                    ratio={1}
                    zoom={1.18}
                    className="o-w-full o-rounded-2xl"
                  />
                  <p className="o-m-0 o-mt-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                    Les sechees, pour l hiver
                  </p>
                </Reveal>
              </div>
            </div>
          </section>

          {/* ================= 4. Le carnet de commandes : le mecanisme ======= */}
          <section
            id="carnet"
            aria-labelledby="carnet-titre"
            className="o-scroll-mt-24 o-border-t o-border-stone-200 dark:o-border-stone-800"
          >
            <div className="o-mx-auto o-max-w-6xl o-px-6 o-pt-20 md:o-pt-28">
              <div className="o-grid o-gap-8 md:o-grid-cols-12 md:o-items-end">
                <div className="md:o-col-span-8">
                  <Indice rang="03" sombre={false}>
                    Le carnet de commandes
                  </Indice>
                  <h2
                    id="carnet-titre"
                    className="o-m-0 o-mt-6 o-max-w-2xl o-text-stone-950 dark:o-text-stone-50"
                    style={{ ...affiche('m', 800), fontSize: 'clamp(2rem, 4.5vw, 4rem)' }}
                  >
                    Composez. On monte, on livre.
                  </h2>
                </div>
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-stone-500 dark:o-text-stone-400 md:o-col-span-4 md:o-text-right">
                  Le prix se recalcule a chaque choix
                  <br />
                  Port offert des 50 EUR a velo
                </p>
              </div>
            </div>

            <div className="o-mx-auto o-grid o-max-w-6xl o-gap-10 o-px-6 o-pb-24 o-pt-12 lg:o-grid-cols-12 lg:o-gap-10">
              {/* ----- Le rail de facettes ------------------------------------- */}
              <aside aria-label="Composer un bouquet" className="lg:o-col-span-3">
                <div className="lg:o-sticky" style={{ top: 133 }}>
                  {(
                    [
                      [
                        'Taille',
                        TAILLES.map((t) => [t.cle, t.nom, t.tiges] as const),
                        taille,
                        setTaille,
                      ],
                      [
                        'Palette',
                        PALETTES_FLORALES.map((p) => [p.cle, p.nom, p.saison] as const),
                        palette,
                        setPalette,
                      ],
                      [
                        'Livraison',
                        ZONES.map((z) => [z.cle, z.nom, z.delai] as const),
                        zone,
                        setZone,
                      ],
                    ] as const
                  ).map(([titre, options, courant, poser], rang) => (
                    <fieldset
                      key={titre}
                      className={`o-m-0 o-p-0 ${rang > 0 ? 'o-mt-5' : ''}`}
                    >
                      <legend className="o-mb-2 o-w-full o-border-b o-border-stone-900 dark:o-border-stone-100 o-pb-1 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                        {titre}
                      </legend>
                      <ul className="o-list-none o-m-0 o-flex o-flex-col o-gap-1 o-p-0">
                        {options.map(([cle, nom, detail]) => {
                          const actif = cle === courant
                          return (
                            <li key={cle}>
                              <button
                                type="button"
                                aria-pressed={actif}
                                onClick={() => {
                                  poser(cle)
                                }}
                                className="o-w-full o-rounded-md o-px-2 o-py-1.5 o-text-left o-transition-colors focus:o-ring"
                                style={
                                  actif
                                    ? { backgroundColor: accentDoux(500, 15) }
                                    : undefined
                                }
                              >
                                <span
                                  className="o-block o-text-sm"
                                  style={
                                    actif
                                      ? { color: encre(), fontWeight: 600 }
                                      : undefined
                                  }
                                >
                                  {nom}
                                </span>
                                {/* Sur la facette active, l aplat est teinte par
                                  l accent : une ardoise fixe y tombe sous le seuil
                                  des que l accent choisi est sombre. */}
                                <span
                                  className="o-block o-text-xs"
                                  style={
                                    actif
                                      ? {
                                          color:
                                            'color-mix(in oklab, var(--o-theme-fg) 72%, transparent)',
                                        }
                                      : { color: 'var(--o-theme-muted)' }
                                  }
                                >
                                  {detail}
                                </span>
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    </fieldset>
                  ))}

                  {/* Le compte, sous les facettes : c est elles qui le font bouger. */}
                  {compte !== undefined &&
                    laTaille !== undefined &&
                    laPalette !== undefined &&
                    laZone !== undefined && (
                      <dl
                        aria-live="polite"
                        className="o-m-0 o-mt-6 o-flex o-flex-col o-gap-1.5 o-border-w-1 o-border-stone-900 dark:o-border-stone-100 o-p-4 o-text-sm"
                      >
                        <div className="o-flex o-items-baseline o-justify-between o-gap-3">
                          <dt className="o-text-stone-600 dark:o-text-stone-400">
                            Les fleurs
                          </dt>
                          <dd className="o-m-0 o-tabular-nums">{euros(compte.fleurs)}</dd>
                        </div>
                        <div className="o-flex o-items-baseline o-justify-between o-gap-3">
                          <dt className="o-text-stone-600 dark:o-text-stone-400">
                            Le port
                          </dt>
                          <dd className="o-m-0 o-tabular-nums">
                            {compte.port === 0 ? 'offert' : euros(compte.port)}
                          </dd>
                        </div>
                        <div className="o-mt-1.5 o-flex o-items-baseline o-justify-between o-gap-3 o-border-t o-border-stone-200 dark:o-border-stone-800 o-pt-2">
                          <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest">
                            Total
                          </dt>
                          <dd
                            className="o-m-0 o-text-2xl o-font-bold o-tabular-nums o-tracking-tight"
                            style={{ color: encre() }}
                          >
                            {euros(compte.total)}
                          </dd>
                        </div>
                        <p className="o-m-0 o-mt-2 o-text-xs o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
                          {laTaille.tiges}, {laTaille.hauteur}. {laPalette.fleurs}.
                          {!deSaison && (
                            <span style={{ color: encre() }}>
                              {' '}
                              Cette palette n est pas de saison en {MOIS[moisCourant]} :
                              nous la montons avec ce qui existe, et le resultat differe
                              de la photographie.
                            </span>
                          )}
                        </p>
                        <p className="o-m-0 o-mt-2 o-flex o-items-start o-gap-1.5 o-text-xs o-text-stone-600 dark:o-text-stone-400">
                          <Icon
                            icon={laZone.cle === 'velo' ? Bike : Truck}
                            size={12}
                            className="o-mt-0.5 o-shrink-0"
                            aria-hidden="true"
                          />
                          {laZone.delai}
                          {laZone.franchise > 0 && (
                            <span>
                              {' '}
                              — port offert des {euros(laZone.franchise)} de fleurs
                            </span>
                          )}
                        </p>
                        <button
                          type="button"
                          className="o-mt-3 o-inline-flex o-w-full o-items-center o-justify-center o-gap-2 o-rounded-full o-px-5 o-py-3 o-text-sm o-font-semibold o-transition-transform hover:o-scale-105 focus:o-ring"
                          style={aplat()}
                        >
                          Commander ce bouquet{' '}
                          <Icon icon={ArrowRight} size={16} aria-hidden="true" />
                        </button>
                      </dl>
                    )}
                </div>
              </aside>

              {/* ----- L etal : la grille de photos, legendes en mono ------------- */}
              <div className="o-min-w-0 lg:o-col-span-9">
                <h3 className="o-m-0 o-border-b o-border-stone-900 dark:o-border-stone-100 o-pb-2 o-font-mono o-text-xs o-font-normal o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                  L etal — six bouquets montes ce matin, ou le votre a gauche
                </h3>
                <ul className="o-list-none o-m-0 o-mt-6 o-grid o-gap-x-5 o-gap-y-10 o-p-0 sm:o-grid-cols-2 lg:o-grid-cols-3">
                  {BOUQUETS.map((bouquet, rang) => (
                    <li key={bouquet.nom} className={rang % 3 === 1 ? 'lg:o-mt-12' : ''}>
                      <img
                        src={photo(bouquet.graine, 800, 800)}
                        alt={bouquet.alt}
                        loading="lazy"
                        className="o-aspect-square o-h-auto o-w-full o-rounded-2xl o-object-cover"
                      />
                      <p className="o-m-0 o-mt-3 o-flex o-items-baseline o-justify-between o-gap-3">
                        <span className="o-text-lg o-font-semibold o-tracking-tight">
                          {bouquet.nom}
                        </span>
                        <span
                          className="o-shrink-0 o-tabular-nums o-font-semibold"
                          style={{ color: encre() }}
                        >
                          {bouquet.prix} EUR
                        </span>
                      </p>
                      <p className="o-m-0 o-mt-1 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                        {bouquet.fleurs} — {bouquet.taille}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* ================= 5. L adresse, en grand, rien d autre ========== */}
          <section
            id="adresse"
            aria-labelledby="adresse-titre"
            className="o-scroll-mt-24 o-border-t o-border-stone-900 dark:o-border-stone-100"
          >
            <div className="o-mx-auto o-max-w-6xl o-px-6 o-py-24 md:o-py-36">
              <h2
                id="adresse-titre"
                className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400"
              >
                Venir chercher
              </h2>
              <p
                className="o-m-0 o-mt-8 o-uppercase o-text-stone-950 dark:o-text-stone-50"
                style={{
                  ...affiche('xl', 800),
                  fontSize: 'clamp(2.5rem, 9.5vw, 10rem)',
                  lineHeight: 0.88,
                }}
              >
                22 rue de la
                <br />
                Folie-Mericourt
              </p>
              <p className="o-m-0 o-mt-8 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                Paris 11e — Parmentier, Oberkampf
                <br />
                Du mardi au samedi, 9 h — 19 h 30 — dimanche jusqu a midi
              </p>
            </div>
          </section>
        </main>

        {/* ================= 6. Le colophon ================================ */}
        {/* La derniere page d un imprime : le terme en marge, le texte en regard,
          des filets pleine largeur, et la signature retracee a la main. Rien
          d une grille de liens. */}
        <footer className="o-border-t o-border-stone-900 dark:o-border-stone-100">
          <div className="o-mx-auto o-max-w-5xl o-px-6 o-pb-12 o-pt-16 md:o-pb-16 md:o-pt-24">
            <div className="o-flex o-flex-wrap o-items-end o-justify-between o-gap-x-10 o-gap-y-6">
              <div>
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                  Colophon
                </p>
                <p className="o-m-0 o-mt-3 o-max-w-sm o-text-lg o-leading-snug o-text-stone-900 dark:o-text-stone-100 md:o-text-xl">
                  Ce que cette page emploie, et d ou viennent les images.
                </p>
              </div>
              <HandWritten
                path={TRACE_NOM}
                viewBox="0 0 320 110"
                width={190}
                thickness={3}
                duration={2000}
                declenchement="vue"
                color={encre()}
                className="o-max-w-full"
              >
                Tige & Co
              </HandWritten>
            </div>

            <dl className="o-m-0 o-mt-12 o-text-sm o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
              {(
                [
                  [
                    'Caracteres',
                    <>
                      Bricolage Grotesque pour les titres, Figtree pour le texte,
                      JetBrains Mono pour les notes. Le nom est trace a la main, d un seul
                      trait.
                    </>,
                  ],
                  [
                    'Papier',
                    <>
                      Creme chaude, encre pierre. Rien ne bouge derriere le texte : ce
                      sont les fleurs qui derivent.
                    </>,
                  ],
                  [
                    'Photographies',
                    <>
                      Wikimedia Commons — Lizzie Amianyuhua (CC0), Didier Descouens et
                      Boris Presseq, Acabashi, Wolfmann, Geoff Derrin, Pittigrilli (CC
                      BY-SA 4.0), Jebulon, Nguyenthibeut (CC BY-SA 3.0), et une couronne
                      sans nom (CC0).
                    </>,
                  ],
                  [
                    'Fleurs',
                    <>
                      Quatre producteurs nommes, Ile-de-France et Val de Loire. Rien qui
                      ait pris l avion, jamais, meme en decembre.
                    </>,
                  ],
                  [
                    'Mentions',
                    <>
                      Tige &amp; Co SARL — RCS Paris 852 330 117.{' '}
                      <a
                        href="mailto:bonjour@tige.paris"
                        className="o-no-underline o-text-stone-900 dark:o-text-stone-100 hover:o-underline focus:o-ring"
                      >
                        bonjour@tige.paris ↗
                      </a>
                    </>,
                  ],
                ] as const
              ).map(([terme, texte]) => (
                <div
                  key={terme}
                  className="o-grid o-gap-x-8 o-gap-y-1 o-border-t o-border-stone-300 dark:o-border-stone-700 o-py-4 md:o-grid-cols-12"
                >
                  <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-900 dark:o-text-stone-100 md:o-col-span-3">
                    {terme}
                  </dt>
                  <dd className="o-m-0 md:o-col-span-9">{texte}</dd>
                </div>
              ))}
            </dl>

            <p className="o-m-0 o-mt-10 o-flex o-flex-wrap o-justify-between o-gap-x-8 o-gap-y-2 o-border-t o-border-stone-900 dark:o-border-stone-100 o-pt-5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
              <span>Acheve d imprimer ce matin, sur le seau</span>
              <span>© 2026 Tige &amp; Co</span>
            </p>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
