/**
 * Fonds — archives departementales.
 *
 * ## La reference : Artefakt (GetLayers)
 *
 * Une grille de cellules d un pixel qui tient toute la page, un filigrane en
 * contour, des metadonnees en mono partout, et aucune rondeur. C est la
 * grammaire d un inventaire, et c est exactement ce qu il faut a un depot
 * d archives.
 *
 * ## Le mecanisme : la cote
 *
 * Quatre niveaux — fonds, serie, article, piece — parcourus en colonnes. A
 * chaque pas, **la cote s allonge et la notice se remplit** : intitule, dates
 * extremes, importance materielle, producteur, communicabilite. C est la
 * description a plusieurs niveaux telle qu elle se pratique : chaque niveau a
 * sa notice, et le niveau inferieur n herite que de ce qu il ne redit pas.
 *
 * Trois articles seulement sont decrits a la piece. Ce n est pas un oubli :
 * un inventaire ne descend au document que la ou quelqu un a eu le temps de
 * le faire, et la page le dit plutot que de simuler une base complete.
 *
 * ## La photographie
 *
 * Une seule, et c est une piece numerisee du fonds figure : elle apparait
 * quand on arrive au document. Son auteur et sa licence sont dans le pied,
 * qui est un releve de credits — la forme P41.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import { ArrowRight, ArrowUpRight } from '@odoro-cli/icons/filaire'
import { Reveal } from '@odoro-cli/libs/motion'
import { useMemo, useState, type CSSProperties, type ReactElement } from 'react'

import { MagnetLines } from '@/odoro/effect/MagnetLines.jsx'
import { RevealImage } from '@/odoro/image/RevealImage.jsx'
import { BlurWords } from '@/odoro/text/BlurWords.jsx'

import { nuit } from './communs.jsx'
import { accent, accentDoux, aplat, encre, encreSurSombre } from './palettes.js'
import { photo } from './media.js'
import {
  Actions,
  affiche,
  BarreCoins,
  CHROME,
  Etiquette,
  Indice,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
} from './marche.jsx'
import { Chapitre } from './scene.jsx'

/* ============================ L inventaire ============================= */

/** Un niveau de description : sa cote complete, et sa notice. */
interface Noeud {
  /** La cote, entiere : un lecteur la recopie telle quelle sur sa demande. */
  readonly cote: string
  readonly intitule: string
  readonly dates: string
  /** Importance materielle : ce que le magasinier va chercher. */
  readonly metrage: string
  readonly producteur: string
  readonly acces: string
  readonly note: string
  /** Vrai quand la piece est numerisee et consultable a distance. */
  readonly numerise?: boolean
  readonly enfants?: readonly Noeud[]
}

const INVENTAIRE: readonly Noeud[] = [
  {
    cote: '3 E',
    intitule: 'Minutes et repertoires de notaires',
    dates: '1562 — 1940',
    metrage: '1 240 ml, 9 118 articles',
    producteur: 'Etudes notariales du departement',
    acces: 'Libre au-dela de soixante-quinze ans',
    note: 'Le plus gros fonds du depot, et le plus demande : neuf lecteurs sur dix viennent pour lui. Les minutes sont classees par etude, puis par notaire, puis par annee.',
    enfants: [
      {
        cote: '3 E 214',
        intitule: 'Etude de Vezelise',
        dates: '1602 — 1899',
        metrage: '38 ml, 214 registres',
        producteur: 'Notaires de Vezelise, puis de Haroue',
        acces: 'Libre',
        note: 'Etude fondee en 1602, transferee a Haroue en 1841. Les registres de 1789 a 1793 manquent : ils ont brule dans l incendie du greffe.',
        enfants: [
          {
            cote: '3 E 214/7',
            intitule: 'Minutes de maitre Jean Chaumont',
            dates: '1721 — 1729',
            metrage: '1 registre, 312 feuillets, 320 x 220 mm',
            producteur: 'Jean Chaumont, notaire royal',
            acces: 'Libre — original communicable',
            note: 'Reliure parchemin d origine, dos fendu sur quinze centimetres. Restaure en 2019. Index alphabetique en fin de volume, de la main du notaire.',
            enfants: [
              {
                cote: '3 E 214/7, f. 12',
                intitule: 'Bail a ferme de la cense du Haut-Pre',
                dates: '4 mars 1723',
                metrage: '2 feuillets, encre ferro-gallique',
                producteur: 'Jean Chaumont, notaire royal',
                acces: 'Libre — numerise',
                note: 'Bail de neuf ans consenti a Nicolas Anquetil, laboureur, pour quarante-deux jours de terre et un droit de vaine pature. Signatures autographes des deux parties et de deux temoins.',
              },
              {
                cote: '3 E 214/7, f. 88',
                intitule: 'Inventaire apres deces de Marguerite Vaury',
                dates: '19 septembre 1726',
                metrage: '11 feuillets',
                producteur: 'Jean Chaumont, notaire royal',
                acces: 'Libre — original communicable',
                note: 'Piece la plus citee du registre : elle donne le detail d un menage rural complet, ustensile par ustensile, y compris les dettes de la maison.',
              },
            ],
          },
          {
            cote: '3 E 214/8',
            intitule: 'Minutes de maitre Nicolas Chaumont',
            dates: '1730 — 1741',
            metrage: '1 registre, 288 feuillets',
            producteur: 'Nicolas Chaumont, notaire royal',
            acces: 'Libre — original communicable',
            note: 'Fils du precedent. Registre non decrit a la piece : il se consulte en salle, feuillet a feuillet.',
          },
        ],
      },
      {
        cote: '3 E 188',
        intitule: 'Etude de Toul',
        dates: '1571 — 1910',
        metrage: '61 ml, 402 registres',
        producteur: 'Notaires de Toul',
        acces: 'Libre',
        note: 'Etude urbaine, la plus ancienne du departement. Les contrats de mariage y sont particulierement suivis, avec les dots chiffrees jusqu au denier.',
        enfants: [
          {
            cote: '3 E 188/2',
            intitule: 'Contrats de mariage',
            dates: '1571 — 1604',
            metrage: '1 liasse, 146 pieces',
            producteur: 'Notaires de Toul',
            acces: 'Libre — original communicable',
            note: 'Liasse non decrite a la piece. Un depouillement nominatif existe en salle, sur fiches, tenu par la societe savante locale.',
          },
          {
            cote: '3 E 188/3',
            intitule: 'Testaments et donations',
            dates: '1605 — 1650',
            metrage: '1 liasse, 98 pieces',
            producteur: 'Notaires de Toul',
            acces: 'Libre — original communicable',
            note: 'Liasse non decrite a la piece. Etat sanitaire moyen : douze pieces sont en attente de restauration et ne sortent pas.',
          },
        ],
      },
    ],
  },
  {
    cote: '2 Fi',
    intitule: 'Documents figures entres par voie extraordinaire',
    dates: '1770 — 1985',
    metrage: '96 ml, 11 402 pieces',
    producteur: 'Dons, legs et achats',
    acces: 'Libre — droits d auteur reserves',
    note: 'Plans, dessins, cartes postales, affiches et photographies. C est le fonds le plus numerise du depot : quatre pieces sur dix sont consultables a distance.',
    enfants: [
      {
        cote: '2 Fi 1',
        intitule: 'Plans, dessins et releves',
        dates: '1770 — 1985',
        metrage: '22 ml, 1 908 pieces',
        producteur: 'Dons d architectes et de particuliers',
        acces: 'Libre — droits d auteur reserves',
        note: 'Le classement suit la matiere, pas le donateur : releves de batiments, croquis de paysage, plans d alignement.',
        enfants: [
          {
            cote: '2 Fi 1/118',
            intitule: 'Croquis de dunes et de rives',
            dates: 'Sans date, XXe siecle',
            metrage: '1 chemise, 6 dessins, 297 x 210 mm',
            producteur: 'Don d un particulier, 2004',
            acces: 'Libre — reproduction soumise a autorisation',
            note: 'Six fusains sur papier a grain, d une meme main, sans signature autre qu une date abregee. Entres avec un carton de correspondance qui les date de 1990.',
            enfants: [
              {
                cote: '2 Fi 1/118, piece 2',
                intitule: 'Dune et rive, au fusain',
                dates: '1990',
                metrage: '1 dessin, fusain sur papier, 297 x 210 mm',
                producteur: 'Fons Heijnsbroek',
                acces: 'Libre — numerise en 2021',
                note: 'Le seul dessin de la chemise a porter une date lisible, en bas a droite. Numerise a 600 points par pouce, couleur, avec mire.',
                numerise: true,
              },
              {
                cote: '2 Fi 1/118, piece 3',
                intitule: 'Rive basse, au fusain',
                dates: 'Sans date',
                metrage: '1 dessin, fusain sur papier, 297 x 210 mm',
                producteur: 'Fons Heijnsbroek',
                acces: 'Libre — original communicable',
                note: 'Meme papier et meme main que la piece 2. Pliure horizontale mediane, ancienne, non restauree : le dessin se consulte a plat, sous plexiglas.',
              },
            ],
          },
          {
            cote: '2 Fi 1/119',
            intitule: 'Releves de facades du centre ancien',
            dates: '1881 — 1889',
            metrage: '1 rouleau, 14 planches',
            producteur: 'Cabinet d architecture, don 1962',
            acces: 'Libre — original communicable sur rendez-vous',
            note: 'Rouleau non decrit a la planche. Il demande la grande table et deux personnes pour le derouler : la consultation se reserve huit jours a l avance.',
          },
        ],
      },
      {
        cote: '2 Fi 4',
        intitule: 'Cartes postales',
        dates: '1903 — 1962',
        metrage: '9 ml, 6 240 pieces',
        producteur: 'Achats et dons successifs',
        acces: 'Libre — numerise en totalite',
        note: 'Classement par commune, puis par editeur. C est le fonds d appel des expositions : il se prete deux fois par an.',
        enfants: [
          {
            cote: '2 Fi 4/56',
            intitule: 'Vues de la vallee',
            dates: '1903 — 1914',
            metrage: '1 boite, 218 cartes',
            producteur: 'Editeurs divers',
            acces: 'Libre — numerise',
            note: 'Boite non decrite a la piece : le recolement se fait par commune. Les vues de crue de 1910 sont les plus demandees.',
          },
          {
            cote: '2 Fi 4/57',
            intitule: 'Foires, marches et fetes',
            dates: '1907 — 1930',
            metrage: '1 boite, 164 cartes',
            producteur: 'Editeurs divers',
            acces: 'Libre — numerise',
            note: 'Boite non decrite a la piece. Un tiers des cartes portent une correspondance au verso, ce qui les date au jour pres.',
          },
        ],
      },
    ],
  },
  {
    cote: '1 O',
    intitule: 'Administration et comptabilite communales',
    dates: '1800 — 1940',
    metrage: '312 ml, 4 016 articles',
    producteur: 'Prefecture, bureau des affaires communales',
    acces: 'Libre',
    note: 'Le controle de l Etat sur les communes : voirie, batiments, biens, dons et legs. On y suit un village par ses travaux plutot que par ses habitants.',
    enfants: [
      {
        cote: '1 O 22',
        intitule: 'Voirie et chemins vicinaux',
        dates: '1824 — 1938',
        metrage: '74 ml, 902 articles',
        producteur: 'Prefecture, service vicinal',
        acces: 'Libre',
        note: 'Un dossier par chemin, avec les plans d alignement, les enquetes et les oppositions des riverains. Les plans sont souvent les seuls documents figures d un village.',
        enfants: [
          {
            cote: '1 O 22/4',
            intitule: 'Chemin de grande communication n 17',
            dates: '1836 — 1871',
            metrage: '1 liasse, 214 pieces, dont 6 plans',
            producteur: 'Prefecture, service vicinal',
            acces: 'Libre — original communicable',
            note: 'Trente-cinq ans de dossier pour onze kilometres de chemin. Deux enquetes publiques, quatorze oppositions, et un trace finalement devie de deux cents metres.',
            enfants: [
              {
                cote: '1 O 22/4, piece 61',
                intitule: 'Plan d alignement, section du bois',
                dates: '12 juin 1844',
                metrage: '1 plan, lavis sur papier entoile, 980 x 420 mm',
                producteur: 'Agent voyer d arrondissement',
                acces: 'Libre — original communicable a plat',
                note: 'Trois etats successifs sur la meme feuille, distingues par la couleur du lavis : le trace ancien en noir, le projet en carmin, le trace retenu en bleu.',
              },
              {
                cote: '1 O 22/4, piece 88',
                intitule: 'Opposition des riverains du Haut-Pre',
                dates: '3 octobre 1845',
                metrage: '1 feuillet, 14 signatures dont 9 croix',
                producteur: 'Riverains, transmis par le maire',
                acces: 'Libre — original communicable',
                note: 'Neuf des quatorze signataires signent d une croix, avec leur nom porte par le secretaire de mairie. C est la piece que les enseignants demandent le plus.',
              },
            ],
          },
          {
            cote: '1 O 22/5',
            intitule: 'Ponts et passerelles',
            dates: '1842 — 1908',
            metrage: '1 liasse, 168 pieces',
            producteur: 'Prefecture, service vicinal',
            acces: 'Libre — original communicable',
            note: 'Liasse non decrite a la piece. Les devis d entreprise y sont conserves, ce qui est rare : ailleurs, ils ont ete elimines en 1936.',
          },
        ],
      },
      {
        cote: '1 O 31',
        intitule: 'Batiments communaux',
        dates: '1802 — 1940',
        metrage: '88 ml, 1 104 articles',
        producteur: 'Prefecture, bureau des affaires communales',
        acces: 'Libre',
        note: 'Ecoles, mairies, halles, lavoirs, presbyteres. Les dossiers d ecole contiennent les plans types imposes par l Etat, et les ecarts que chaque commune s est permis.',
        enfants: [
          {
            cote: '1 O 31/9',
            intitule: 'Maisons d ecole',
            dates: '1879 — 1912',
            metrage: '1 liasse, 246 pieces, dont 22 plans',
            producteur: 'Prefecture et architecte departemental',
            acces: 'Libre — original communicable',
            note: 'Liasse non decrite a la piece. Un instrument de recherche par commune existe en salle, dactylographie en 1978.',
          },
          {
            cote: '1 O 31/10',
            intitule: 'Halles, lavoirs et fontaines',
            dates: '1861 — 1934',
            metrage: '1 liasse, 189 pieces',
            producteur: 'Prefecture et architecte departemental',
            acces: 'Libre — original communicable',
            note: 'Liasse non decrite a la piece. Les devis de fontaine portent presque toujours le detail de la fonte, fournisseur compris.',
          },
        ],
      },
    ],
  },
]

/** Les quatre niveaux, dans l ordre de la descente. */
const NIVEAUX = ['Fonds', 'Serie', 'Article', 'Piece'] as const

/* ============================ Les chiffres ============================= */

/** La forme C26 : des chiffres dans des pastilles alignees. */
const PASTILLES: readonly (readonly [valeur: string, quoi: string])[] = [
  ['38', 'kilometres lineaires'],
  ['1 411', 'fonds classes'],
  ['1247', 'la piece la plus ancienne'],
  ['62', 'places en salle'],
  ['9 200', 'lecteurs par an'],
]

/* ============================ La salle de lecture ====================== */

/** Ce qu il faut savoir avant de venir. */
const SALLE: readonly (readonly [string, string])[] = [
  [
    'Inscription',
    'Gratuite, a l annee, sur presentation d une piece d identite. Elle se fait en dix minutes au bureau d accueil, et vaut pour les quatre salles.',
  ],
  [
    'Horaires',
    'Du mardi au vendredi, 9 h — 17 h sans interruption. Dernier appel de documents a 16 h 15, dernier retour a 16 h 45.',
  ],
  [
    'Commandes',
    'Cinq articles a la fois, trois levees par jour : 9 h 15, 11 h et 14 h 30. Une commande passee la veille est sur la table a l ouverture.',
  ],
  [
    'Ce qui entre',
    'Un crayon a papier, des feuilles volantes, un ordinateur, un appareil photographique sans flash. Rien d autre, et les sacs restent au vestiaire.',
  ],
]

/* ============================ La plaque ================================ */

/**
 * L adresse gravee dans une plaque — la forme A42.
 *
 * Le creux est obtenu par deux ombres portees sur le texte : une claire en
 * dessous, une sombre au-dessus. Ce n est pas un effet de style : c est la
 * seule facon d obtenir une gravure sans image.
 */
function Plaque(): ReactElement {
  const grave: CSSProperties = {
    color: 'var(--o-theme-muted)',
    textShadow: '0 1px 0 rgb(255 255 255 / 0.45), 0 -1px 0 rgb(0 0 0 / 0.35)',
  }
  return (
    <div
      className="o-relative o-mx-auto o-max-w-xl o-px-10 o-py-12 o-text-center"
      style={{
        backgroundColor: accentDoux(400, 22),
        boxShadow:
          'inset 2px 2px 0 rgb(255 255 255 / 0.28), inset -2px -2px 0 rgb(0 0 0 / 0.22), 0 20px 40px -30px rgb(0 0 0 / 0.7)',
      }}
    >
      {/* Les quatre vis de la plaque. */}
      {(
        [
          'o-left-3 o-top-3',
          'o-right-3 o-top-3',
          'o-bottom-3 o-left-3',
          'o-bottom-3 o-right-3',
        ] as const
      ).map((coin) => (
        <span
          key={coin}
          aria-hidden="true"
          className={`o-absolute o-block o-size-2.5 o-rounded-full ${coin}`}
          style={{
            backgroundColor: accentDoux(600, 40),
            boxShadow: 'inset 0 1px 0 rgb(255 255 255 / 0.4)',
          }}
        />
      ))}
      <p
        className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
        style={grave}
      >
        Departement — service des archives
      </p>
      <p
        className="o-m-0 o-mt-5 o-uppercase o-text-zinc-800 dark:o-text-zinc-100"
        style={{
          ...affiche('m', 500),
          fontSize: 'clamp(1.35rem, 3vw, 2.25rem)',
          lineHeight: 1.05,
          letterSpacing: '0.02em',
        }}
      >
        2 rue du Fonds
        <br />
        54000 Nancy
      </p>
      <p
        className="o-m-0 o-mt-6 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest"
        style={grave}
      >
        Salle de lecture du mardi au vendredi, 9 h — 17 h
        <br />
        Entree libre · 03 83 00 00 00
      </p>
    </div>
  )
}

/* ============================ La page ================================== */

const NAVIGATION = [
  ['#inventaire', 'L inventaire'],
  ['#salle', 'La salle'],
  ['#venir', 'Venir'],
] as const

/** Le dessin numerise, et ses credits, ensemble. */
const PIECE_NUMERISEE = {
  src: photo('fonds-deux'),
  alt: 'Dessin au fusain : une dune et une rive, trait rapide sur papier a grain.',
  credit:
    'Fons Heijnsbroek, dessin au fusain, 1990 — domaine public (CC0), Wikimedia Commons.',
} as const

export default function Page(): ReactElement {
  const polices = usePolices('manrope')
  const [chemin, setChemin] = useState<readonly Noeud[]>(() => [INVENTAIRE[0] as Noeud])

  // Les colonnes visibles : les fonds, puis les enfants de chaque noeud pris.
  const colonnes = useMemo(() => {
    const liste: (readonly Noeud[])[] = [INVENTAIRE]
    for (const noeud of chemin) {
      if (noeud.enfants !== undefined) liste.push(noeud.enfants)
    }
    // Les quatre colonnes existent toujours : une colonne qui apparait en
    // cours de descente ferait sauter la mise en page a chaque clic.
    while (liste.length < NIVEAUX.length) liste.push([])
    return liste
  }, [chemin])

  const courant = chemin[chemin.length - 1]
  const grille: CSSProperties = {
    backgroundImage: `linear-gradient(${accentDoux(700, 9)} 1px, transparent 1px), linear-gradient(90deg, ${accentDoux(700, 9)} 1px, transparent 1px)`,
    backgroundSize: '34px 34px',
  }

  return (
    <Porte forme="lettres" marque="Fonds" sombre={false}>
      <div
        className="o-bg-zinc-50 dark:o-bg-zinc-950 o-text-zinc-900 dark:o-text-zinc-100"
        style={polices}
      >
        {/* ================= L ouverture : la grille et le filigrane ====== */}
        <header
          className="o-relative o-isolate o-flex o-flex-col o-overflow-hidden"
          style={{ minHeight: `calc(100vh - ${String(CHROME)}px)`, ...grille }}
        >
          <BarreCoins
            marque="Fonds"
            liens={NAVIGATION}
            droite="Archives departementales — Nancy"
            sombre={false}
          />

          {/* Le mot-marque en contour, derriere tout. */}
          <span
            aria-hidden="true"
            className="o-pointer-events-none o-absolute o-inset-x-0 o-bottom-4 o-select-none o-overflow-hidden o-whitespace-nowrap o-text-center"
            style={{
              ...affiche('xxl', 800),
              fontSize: 'min(13vw, 180px)',
              color: 'transparent',
              WebkitTextStroke: `1px ${accentDoux(700, 20)}`,
            }}
          >
            INVENTAIRE
          </span>

          <div className="o-relative o-grid o-grow o-items-center o-gap-10 o-px-6 o-pb-12 md:o-grid-cols-12 md:o-px-10">
            <div className="o-min-w-0 md:o-col-span-7">
              <Surgit>
                <Etiquette sombre={false}>
                  Depot public · 38 km lineaires · 1247 — 2019
                </Etiquette>
              </Surgit>
              <TitreVague
                delai={140}
                cadence={80}
                className="o-m-0 o-mt-7 o-text-zinc-950 dark:o-text-zinc-50"
                style={{
                  ...affiche('xl', 800),
                  fontSize: 'clamp(3rem, 13vw, 12rem)',
                  lineHeight: 0.82,
                  letterSpacing: '-0.05em',
                }}
              >
                Fonds
              </TitreVague>
              <Surgit
                delai={520}
                as="p"
                className="o-m-0 o-mt-7 o-max-w-lg o-text-lg o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400"
              >
                Tout ce qui est ici porte une cote. Cette page la fabrique avec vous, du
                fonds a la piece, et vous donne la notice a chaque pas.
              </Surgit>
              <Surgit delai={620} className="o-mt-8">
                <Actions
                  pleine={['#inventaire', 'Descendre dans une cote']}
                  fantome={['#salle', 'La salle de lecture']}
                  sombre={false}
                />
              </Surgit>
            </div>

            <Surgit delai={420} className="o-min-w-0 md:o-col-span-5">
              {/* Les aiguilles : la grille d Artefakt, qui suit le pointeur. */}
              <div
                className="o-relative o-mx-auto o-flex o-aspect-square o-w-full o-max-w-sm o-items-center o-justify-center"
                style={{ boxShadow: `inset 0 0 0 1px ${accentDoux(700, 22)}` }}
              >
                <MagnetLines
                  className="o-absolute o-inset-0"
                  rows={11}
                  columns={11}
                  length={22}
                  thickness={1}
                  reach={220}
                  color={accentDoux(700, 62)}
                />
                <p className="o-pointer-events-none o-absolute o-bottom-4 o-left-4 o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                  Magasin 3 — epis 1 a 121
                </p>
              </div>
            </Surgit>
          </div>
        </header>

        {/* ================= C26 : les pastilles ========================== */}
        <section
          aria-label="Le depot en chiffres"
          className="o-border-t o-border-black-10 dark:o-border-zinc-800 o-px-6 o-py-12 md:o-px-10"
        >
          <ul className="o-mx-auto o-m-0 o-flex o-max-w-6xl o-list-none o-flex-wrap o-items-center o-gap-4 o-p-0">
            {PASTILLES.map(([valeur, quoi]) => (
              <li
                key={quoi}
                className="o-flex o-min-w-0 o-items-center o-gap-3 o-rounded-full o-px-5 o-py-2.5"
                style={{ boxShadow: `inset 0 0 0 1px ${accentDoux(700, 26)}` }}
              >
                <span
                  className="o-tabular-nums o-text-zinc-950 dark:o-text-zinc-50"
                  style={{
                    ...affiche('m', 500),
                    fontSize: 'clamp(1.15rem, 2vw, 1.6rem)',
                  }}
                >
                  {valeur}
                </span>
                <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                  {quoi}
                </span>
              </li>
            ))}
          </ul>
        </section>

        <main>
          {/* ================= Le mecanisme : la cote ====================== */}
          <section
            id="inventaire"
            className="o-scroll-mt-24 o-border-t o-border-black-10 dark:o-border-zinc-800 o-px-6 o-py-20 md:o-px-10 md:o-py-28"
          >
            <div className="o-mx-auto o-max-w-6xl">
              <Chapitre
                indice="(01) — L inventaire"
                largeur={3}
                titre={
                  <h2
                    className="o-m-0 o-text-zinc-950 dark:o-text-zinc-50"
                    style={{
                      ...affiche('m', 500),
                      fontSize: 'clamp(1.75rem, 3.2vw, 2.75rem)',
                      lineHeight: 0.98,
                      letterSpacing: '-0.03em',
                    }}
                  >
                    La cote se fabrique en descendant.
                  </h2>
                }
                texte="Quatre niveaux : le fonds, la serie, l article, la piece. Chacun a sa notice ; le suivant ne redit que ce qui change. Trois articles seulement sont decrits jusqu au document."
              >
                {/* La cote en cours, en grand. */}
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                  Cote
                </p>
                <p
                  className="o-m-0 o-mt-2 o-break-words o-text-zinc-950 dark:o-text-zinc-50"
                  style={{
                    ...affiche('m', 500),
                    fontFamily: 'var(--o-font-mono)',
                    fontSize: 'clamp(1.5rem, 4vw, 3rem)',
                    lineHeight: 1,
                    letterSpacing: '-0.02em',
                  }}
                  aria-live="polite"
                >
                  {courant?.cote ?? '—'}
                </p>

                {/* Les colonnes de la descente. */}
                <div
                  className="o-mt-8 o-grid o-gap-px sm:o-grid-cols-2 lg:o-grid-cols-4"
                  style={{ backgroundColor: accentDoux(700, 18) }}
                >
                  {colonnes.map((colonne, niveau) => (
                    <div
                      key={NIVEAUX[niveau] ?? niveau}
                      className="o-min-w-0 o-bg-zinc-50 dark:o-bg-zinc-950 o-p-3"
                    >
                      <p className="o-m-0 o-px-2 o-pb-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                        {NIVEAUX[niveau] ?? ''}
                      </p>
                      <ul className="o-m-0 o-list-none o-p-0">
                        {colonne.map((noeud) => {
                          const pris = chemin[niveau]?.cote === noeud.cote
                          return (
                            <li key={noeud.cote}>
                              <button
                                type="button"
                                onClick={() => {
                                  setChemin([...chemin.slice(0, niveau), noeud])
                                }}
                                aria-pressed={pris}
                                className="o-block o-w-full o-cursor-pointer o-px-2 o-py-2.5 o-text-left o-transition-colors focus:o-ring"
                                style={{
                                  backgroundColor: pris
                                    ? accentDoux(500, 16)
                                    : 'transparent',
                                  border: 'none',
                                  color: 'inherit',
                                  boxShadow: pris
                                    ? `inset 2px 0 0 ${accent(500)}`
                                    : 'none',
                                }}
                              >
                                <span
                                  className="o-block o-font-mono o-text-xs o-tabular-nums"
                                  style={{
                                    color: pris ? encre() : 'var(--o-theme-muted)',
                                  }}
                                >
                                  {noeud.cote}
                                </span>
                                <span className="o-mt-1 o-block o-text-sm o-leading-snug">
                                  {noeud.intitule}
                                </span>
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                      {colonne.length === 0 && (
                        <p className="o-m-0 o-px-2 o-text-sm o-leading-relaxed o-text-zinc-500 dark:o-text-zinc-400">
                          {chemin.length >= niveau
                            ? 'Non decrit a ce niveau : l article se demande en entier.'
                            : 'Choisissez dans la colonne precedente.'}
                        </p>
                      )}
                    </div>
                  ))}
                </div>

                {/* La notice du niveau atteint. */}
                {courant !== undefined && (
                  <div className="o-mt-10 o-border-t o-border-black-10 dark:o-border-zinc-800 o-pt-10">
                    <div className="o-grid o-gap-10 md:o-grid-cols-12">
                      <div className="o-min-w-0 md:o-col-span-7">
                        <p
                          className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                          style={{ color: encre() }}
                        >
                          Notice — niveau {NIVEAUX[chemin.length - 1] ?? 'fonds'}
                        </p>
                        <h3
                          className="o-m-0 o-mt-4 o-text-zinc-950 dark:o-text-zinc-50"
                          style={{
                            ...affiche('m', 500),
                            fontSize: 'clamp(1.35rem, 2.6vw, 2rem)',
                            lineHeight: 1.02,
                          }}
                        >
                          {courant.intitule}
                        </h3>
                        <BlurWords
                          key={courant.cote}
                          as="p"
                          boucle={false}
                          step={40}
                          duration={420}
                          className="o-m-0 o-mt-5 o-max-w-2xl o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400"
                        >
                          {courant.note}
                        </BlurWords>

                        {courant.enfants === undefined &&
                          chemin.length < NIVEAUX.length && (
                            <p
                              className="o-m-0 o-mt-6 o-max-w-xl o-px-4 o-py-3 o-text-sm o-leading-relaxed"
                              style={{
                                backgroundColor: accentDoux(500, 12),
                                color: 'inherit',
                              }}
                            >
                              Cet article n est pas decrit a la piece : il se demande en
                              entier et se depouille en salle.
                            </p>
                          )}
                      </div>

                      <dl className="o-m-0 o-min-w-0 md:o-col-span-5">
                        {[
                          ['Dates extremes', courant.dates],
                          ['Importance materielle', courant.metrage],
                          ['Producteur', courant.producteur],
                          ['Communicabilite', courant.acces],
                        ].map(([quoi, valeur]) => (
                          <div
                            key={quoi}
                            className="o-border-b o-border-black-10 dark:o-border-zinc-800 o-py-3"
                          >
                            <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                              {quoi}
                            </dt>
                            <dd className="o-m-0 o-mt-1 o-text-sm o-text-zinc-900 dark:o-text-zinc-100">
                              {valeur}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>

                    {/* La piece numerisee, quand on arrive au document. */}
                    {courant.numerise === true && (
                      <figure className="o-m-0 o-mt-10">
                        <RevealImage
                          src={PIECE_NUMERISEE.src}
                          alt={PIECE_NUMERISEE.alt}
                          ratio={4 / 3}
                          direction="up"
                          duration={1000}
                          className="o-w-full"
                        />
                        <figcaption className="o-mt-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                          {courant.cote} — numerise a 600 ppp, couleur, avec mire. Credits
                          au pied de page.
                        </figcaption>
                      </figure>
                    )}
                  </div>
                )}
              </Chapitre>
            </div>
          </section>

          {/* ================= La salle de lecture ========================= */}
          <section
            id="salle"
            className="o-scroll-mt-24 o-px-6 o-py-20 md:o-px-10 md:o-py-28"
            style={nuit('zinc')}
          >
            <div className="o-mx-auto o-max-w-6xl">
              <Chapitre
                indice="(02) — La salle"
                largeur={3}
                titre={
                  <h2
                    className="o-m-0 o-text-zinc-50"
                    style={{
                      ...affiche('m', 500),
                      fontSize: 'clamp(1.75rem, 3.2vw, 2.75rem)',
                      lineHeight: 0.98,
                      letterSpacing: '-0.03em',
                    }}
                  >
                    Soixante-deux places, trois levees par jour.
                  </h2>
                }
                texte="Le magasin est a quatre-vingts metres de la salle, et c est ce trajet qui fixe les horaires de commande."
              >
                <ol className="o-m-0 o-list-none o-border-t o-border-white-10 o-p-0">
                  {SALLE.map(([quoi, texte], rang) => (
                    <li
                      key={quoi}
                      className="o-grid o-gap-3 o-border-b o-border-white-10 o-py-6 md:o-grid-cols-12 md:o-gap-8"
                    >
                      <span
                        aria-hidden="true"
                        className="o-font-mono o-text-xs o-tabular-nums md:o-col-span-1"
                        style={{ color: encreSurSombre() }}
                      >
                        {String(rang + 1).padStart(2, '0')}
                      </span>
                      <h3 className="o-m-0 o-min-w-0 o-text-lg o-font-semibold o-text-zinc-50 md:o-col-span-4">
                        {quoi}
                      </h3>
                      <p className="o-m-0 o-min-w-0 o-text-sm o-leading-relaxed o-text-zinc-400 md:o-col-span-7">
                        {texte}
                      </p>
                    </li>
                  ))}
                </ol>
              </Chapitre>
            </div>
          </section>

          {/* ================= A42 : la plaque gravee ====================== */}
          <section
            id="venir"
            className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
            style={grille}
          >
            <div className="o-mx-auto o-max-w-4xl">
              <Reveal>
                <Indice rang="03" sombre={false}>
                  Venir
                </Indice>
              </Reveal>
              <div className="o-mt-12">
                <Plaque />
              </div>
              <p className="o-mx-auto o-m-0 o-mt-10 o-max-w-xl o-text-center o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                La plaque est a droite de la porte cochere. L entree des lecteurs est la
                seconde, sous l auvent ; la premiere est celle du quai de dechargement.
              </p>
              <p className="o-m-0 o-mt-8 o-text-center">
                <a
                  href="#inventaire"
                  className="o-inline-flex o-items-center o-gap-2 o-rounded-full o-px-7 o-py-3.5 o-text-sm o-font-semibold o-no-underline o-transition-transform hover:o-scale-105 focus:o-ring"
                  style={aplat()}
                >
                  Preparer sa venue{' '}
                  <Icon icon={ArrowRight} size={15} aria-hidden="true" />
                </a>
              </p>
            </div>
          </section>
        </main>

        {/* ================= P41 : le releve des credits ================== */}
        <footer className="o-border-t o-border-black-10 dark:o-border-zinc-800 o-px-6 o-py-14 md:o-px-10">
          <div className="o-mx-auto o-max-w-6xl">
            <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
              Credits
            </p>

            <dl className="o-m-0 o-mt-8 o-border-t o-border-black-10 dark:o-border-zinc-800">
              {[
                ['Photographie', PIECE_NUMERISEE.credit],
                [
                  'Reproductions',
                  'Les autres pieces montrees sur ce site sont des dessins originaux realises pour la page : aucune reproduction du fonds n y figure sans mention.',
                ],
                [
                  'Composition',
                  'Manrope pour le texte et les titres, DM Mono pour les cotes et les metadonnees. Les deux sous licence ouverte SIL.',
                ],
                [
                  'Instruments de recherche',
                  'Les notices suivent la norme generale de description archivistique a plusieurs niveaux. Les cotes de cette page sont fictives.',
                ],
                [
                  'Droits',
                  'Reproduction des documents libres de droits autorisee avec mention de la cote. Pour les autres, une demande ecrite est necessaire.',
                ],
              ].map(([quoi, valeur]) => (
                <div
                  key={quoi}
                  className="o-grid o-gap-2 o-border-b o-border-black-10 dark:o-border-zinc-800 o-py-4 md:o-grid-cols-12 md:o-gap-8"
                >
                  <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400 md:o-col-span-3">
                    {quoi}
                  </dt>
                  <dd className="o-m-0 o-min-w-0 o-text-sm o-leading-relaxed o-text-zinc-700 dark:o-text-zinc-300 md:o-col-span-9">
                    {valeur}
                  </dd>
                </div>
              ))}
            </dl>

            <div className="o-mt-10 o-flex o-flex-wrap o-items-end o-justify-between o-gap-6">
              <nav
                aria-label="Pied de page"
                className="o-flex o-flex-wrap o-gap-x-7 o-gap-y-2"
              >
                {NAVIGATION.map(([cible, mot]) => (
                  <a
                    key={cible}
                    href={cible}
                    className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400 o-no-underline hover:o-text-zinc-950 dark:hover:o-text-zinc-50 focus:o-ring"
                  >
                    {mot}
                  </a>
                ))}
              </nav>
              <p className="o-m-0">
                <a
                  href="#inventaire"
                  className="o-inline-flex o-items-center o-gap-2 o-font-mono o-text-sm o-uppercase o-tracking-widest o-no-underline focus:o-ring"
                  style={{ color: encre() }}
                >
                  lecture@archives-fonds.fr{' '}
                  <Icon icon={ArrowUpRight} size={15} aria-hidden="true" />
                </a>
              </p>
            </div>
            <p className="o-m-0 o-mt-8 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
              © 2026 — service des archives, 2 rue du Fonds, Nancy — cotes et notices de
              demonstration
            </p>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
