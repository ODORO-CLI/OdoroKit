/**
 * Lisiere — pret-a-porter.
 *
 * ## Le parti pris : un masthead editorial
 *
 * Pas une boutique, un cahier de collection. La page s ouvre donc comme la
 * une d un magazine : le nom compose en grand, centre, serre entre deux
 * filets, le numero d edition a gauche et la saison a droite en petites
 * capitales, et une navigation en filet sous le titre — jamais collante,
 * jamais avec un bouton pose a droite d un logo.
 *
 * Le heros n est pas un argumentaire mais un chapeau : trois lignes a
 * empattements, centrees, sans bouton, suivies de la photographie
 * d ouverture et de sa legende numerotee. Toutes les sections qui suivent
 * sont separees par des filets, jamais par un aplat de couleur.
 *
 * ## Le mouvement : le defile se parcourt de cote
 *
 * Vient ensuite le seul mouvement de la page : les **cinq silhouettes du
 * passage du 4 septembre en rail**. L ecran reste fixe, la piste glisse de la
 * note d ouverture au generique — un passage se regarde de profil, l une apres
 * l autre, jamais en grille. Le reste de la page ne bouge pas.
 *
 * ## Aucune section d appel
 *
 * Un cahier de collection ne finit pas sur « On commence ? ». L action tient
 * dans la barre — le panier — et dans le pied, ou la lettre de saison occupe
 * une seule ligne au-dessus des colonnes en mono et du mot-marque qui remplit
 * la largeur.
 *
 * ## Ce que la page fait, et pas seulement montre
 *
 * Trois mecanismes portent le metier : le cahier se filtre par famille, la
 * fiche produit demande une taille avant de laisser commander — et le stock
 * de la taille choisie s affiche —, le guide des tailles s ouvre a la
 * demande. Le reste est du contenu de maison : composition et entretien
 * matiere par matiere, les trois ateliers avec leur effectif et leur
 * distance, les delais de livraison par zone et les conditions de retour.
 *
 * ## La couleur
 *
 * Aucune teinte n est ecrite en dur : la page lit `--o-vitrine-*`, pose par
 * la barre. Les accents de texte passent par un melange de l accent et de
 * l encre du theme, ce qui les garde lisibles en clair comme en sombre et
 * quelle que soit la palette choisie. Les neutres, eux, restent des neutres.
 *
 * ## Le fond
 *
 * Aucun. Ni shader, ni degrade, ni motif : la photographie et les filets
 * portent la page. Un lavis derriere une une de magazine ne ferait que salir
 * le papier.
 *
 * @module
 */

import { HoverZoom } from '@/odoro/image/HoverZoom.jsx'
import { ImageStackSwipe } from '@/odoro/image/ImageStackSwipe.jsx'
import { CircularText } from '@/odoro/text/CircularText.jsx'
import { SplitLines } from '@/odoro/text/SplitLines.jsx'
import { Icon } from '@odoro-cli/icons'
import {
  ArrowRight,
  Camera,
  MapPin,
  Package,
  RotateCcw,
  Ruler,
  Scissors,
} from '@odoro-cli/icons/outline'
import { Input } from '@odoro-cli/libs/ui'
import { Reveal, Stagger } from '@odoro-cli/libs/motion'
import { useMemo, useState, type CSSProperties, type ReactElement } from 'react'

import { media, photo } from './media.js'
import { aplat, encre } from './palettes.js'
import { Porte, usePolices, affiche as corps, BarreCoins, Surgit } from './marche.jsx'
import { Rail } from './scene.jsx'

/**
 * L accent, ramene vers l encre du theme.
 *
 * La barre laisse choisir **n importe quelle** couleur : une nuance posee
 * telle quelle serait illisible des que le visiteur prend un accent tres clair
 * en theme clair, ou tres sombre en theme sombre. Melanger l accent a
 * `--o-theme-fg` le fonce en theme clair et l eclaircit en theme sombre, sans
 * lui faire perdre sa teinte. A trente-cinq pour cent d accent, le melange
 * tient au-dessus de 5:1 pour tout l intervalle du blanc au noir — verifie par
 * balayage sur les deux themes et les deux fonds.
 */
const ENCRE_ACCENT = encre()

/**
 * L aplat plein et son encre.
 *
 * Meme raisonnement : un bouton peint a la couleur choisie porterait une encre
 * blanche illisible si le visiteur prend du jaune. L aplat est donc l accent
 * ramene vers le noir de moitie — il reste teinte, et l encre blanche y tient
 * au-dessus de 6:1 quelle que soit la couleur choisie.
 */
const APLAT_PLEIN: CSSProperties = aplat()

/** Le filet noir du masthead : le seul trait appuye de la page. */
const FILET_FORT = 'o-border-zinc-900 dark:o-border-zinc-100'

/** Le filet ordinaire, celui qui separe deux sections. */
const FILET = 'o-border-zinc-200 dark:o-border-zinc-800'

/** Les rubriques de la navigation, dans l ordre du cahier. */
const NAVIGATION = [
  ['#collection', 'Collection'],
  ['#piece', 'La piece'],
  ['#matieres', 'Matieres'],
  ['#livraison', 'Livraison'],
  ['#boutiques', 'Boutiques'],
] as const

/** Les familles du cahier, dans l ordre du filtre. */
const FAMILLES = [
  'Manteaux et vestes',
  'Chemises et maille',
  'Pantalons et jupes',
  'Robes',
] as const

/** Une famille du cahier, ou le filtre ouvert. */
type Famille = (typeof FAMILLES)[number] | 'Tout'

/** Une piece de la collection, telle qu elle parait dans la grille. */
interface Piece {
  readonly nom: string
  readonly matiere: string
  readonly prix: number
  readonly graine: string
  readonly famille: (typeof FAMILLES)[number]
  /** Les tailles encore coupees, du plus petit au plus grand. */
  readonly tailles: readonly string[]
  /** La piece occupe deux colonnes : c est une ouverture de cahier. */
  readonly large?: boolean
}

/** La collection d automne, dans l ordre du cahier. */
const COLLECTION: readonly Piece[] = [
  {
    nom: 'Manteau Sablon',
    matiere: 'Laine bouillie',
    prix: 480,
    graine: 'lisiere-manteau',
    famille: 'Manteaux et vestes',
    tailles: ['34', '36', '38', '40', '44'],
    large: true,
  },
  {
    nom: 'Chemise Ourle',
    matiere: 'Popeline de coton',
    prix: 145,
    graine: 'lisiere-chemise',
    famille: 'Chemises et maille',
    tailles: ['34', '36', '38', '40', '42', '44', '46'],
  },
  {
    nom: 'Pantalon Grange',
    matiere: 'Toile de lin',
    prix: 190,
    graine: 'lisiere-pantalon',
    famille: 'Pantalons et jupes',
    tailles: ['36', '38', '40', '42', '44'],
  },
  {
    nom: 'Maille Cotiere',
    matiere: 'Laine des Pyrenees',
    prix: 260,
    graine: 'lisiere-maille',
    famille: 'Chemises et maille',
    tailles: ['36', '38', '40', '42'],
  },
  {
    nom: 'Robe Aout',
    matiere: 'Serge de viscose',
    prix: 320,
    graine: 'lisiere-robe',
    famille: 'Robes',
    tailles: ['34', '36', '38', '40', '42'],
  },
  {
    nom: 'Veste Talus',
    matiere: 'Velours cotele',
    prix: 395,
    graine: 'lisiere-veste',
    famille: 'Manteaux et vestes',
    tailles: ['36', '38', '40', '42', '44', '46'],
    large: true,
  },
  {
    nom: 'Jupe Fauche',
    matiere: 'Gabardine',
    prix: 210,
    graine: 'lisiere-jupe',
    famille: 'Pantalons et jupes',
    tailles: ['34', '36', '38', '40'],
  },
  {
    nom: 'Trench Orme',
    matiere: 'Coton cire',
    prix: 540,
    graine: 'lisiere-trench',
    famille: 'Manteaux et vestes',
    tailles: ['38', '40', '42', '44'],
  },
]

/** Les tailles du manteau Sablon, avec ce qu il en reste en atelier. */
const TAILLES: readonly {
  readonly taille: string
  readonly reste: number
  /** Delai d expedition annonce quand la taille est en rayon. */
  readonly delai: string
}[] = [
  { taille: '34', reste: 2, delai: 'Expedie sous 48 heures' },
  { taille: '36', reste: 6, delai: 'Expedie sous 48 heures' },
  { taille: '38', reste: 9, delai: 'Expedie sous 48 heures' },
  { taille: '40', reste: 4, delai: 'Expedie sous 48 heures' },
  { taille: '42', reste: 0, delai: 'Recoupe en fevrier, sur liste' },
  { taille: '44', reste: 3, delai: 'Expedie sous 72 heures' },
]

/**
 * Le guide des tailles, en centimetres.
 *
 * Ce sont les mesures du corps, pas celles du vetement : c est ce qu on
 * demande a la reception d une boutique, et la seule facon de choisir sans
 * essayer. L aisance du manteau Sablon est donnee a part.
 */
const GUIDE: readonly {
  readonly taille: string
  readonly poitrine: string
  readonly ceinture: string
  readonly bassin: string
  readonly dos: string
}[] = [
  {
    taille: '34',
    poitrine: '80 - 83',
    ceinture: '62 - 65',
    bassin: '88 - 91',
    dos: '38,5',
  },
  {
    taille: '36',
    poitrine: '84 - 87',
    ceinture: '66 - 69',
    bassin: '92 - 95',
    dos: '39,5',
  },
  {
    taille: '38',
    poitrine: '88 - 91',
    ceinture: '70 - 73',
    bassin: '96 - 99',
    dos: '40,5',
  },
  {
    taille: '40',
    poitrine: '92 - 95',
    ceinture: '74 - 77',
    bassin: '100 - 103',
    dos: '41,5',
  },
  {
    taille: '42',
    poitrine: '96 - 99',
    ceinture: '78 - 81',
    bassin: '104 - 107',
    dos: '42,5',
  },
  {
    taille: '44',
    poitrine: '100 - 104',
    ceinture: '82 - 86',
    bassin: '108 - 112',
    dos: '43,5',
  },
  {
    taille: '46',
    poitrine: '105 - 109',
    ceinture: '87 - 91',
    bassin: '113 - 117',
    dos: '44,5',
  },
]

/** Les matieres de la saison, avec leur composition et leur entretien. */
const MATIERES: readonly {
  readonly matiere: string
  readonly composition: string
  readonly grammage: string
  readonly tisseur: string
  readonly entretien: string
}[] = [
  {
    matiere: 'Laine bouillie',
    composition: '100 % laine vierge, doublure 100 % cupro',
    grammage: '780 g/m2',
    tisseur: 'Filature Rougier, Lodeve',
    entretien:
      'Nettoyage a sec uniquement. Brosse douce dans le sens du poil apres chaque port. Ne pas repasser : la vapeur suffit.',
  },
  {
    matiere: 'Popeline de coton',
    composition: '100 % coton peigne, boutons corozo',
    grammage: '135 g/m2',
    tisseur: 'Tissage Berthaud, Charlieu',
    entretien:
      'Machine 30 degres, essorage 800 tours. Repassage moyen sur l envers du col. Le coton peigne perd 2 % a la premiere lessive : la coupe en tient compte.',
  },
  {
    matiere: 'Toile de lin',
    composition: '100 % lin teille en Normandie',
    grammage: '245 g/m2',
    tisseur: 'Filature Rougier, Lodeve',
    entretien:
      'Machine 30 degres, sechage a plat. Le lin se froisse, c est sa nature ; un repassage tres chaud sur l envers le remet a plat en deux minutes.',
  },
  {
    matiere: 'Laine des Pyrenees',
    composition: '85 % laine, 15 % alpaga, filee a Lodeve',
    grammage: '410 g/m2',
    tisseur: 'Filature Rougier, Lodeve',
    entretien:
      'Lavage a la main a froid, lessive laine, sechage a plat sur serviette. Ne jamais suspendre mouillee : la maille s allonge de trois centimetres.',
  },
  {
    matiere: 'Velours cotele',
    composition: '98 % coton, 2 % elasthanne, cote 8 fils',
    grammage: '340 g/m2',
    tisseur: 'Tissage Berthaud, Charlieu',
    entretien:
      'Machine 30 degres sur l envers, sans adoucissant. Repassage a la pattemouille, jamais directement sur la cote.',
  },
  {
    matiere: 'Coton cire',
    composition: '100 % coton, cire de paraffine et cire d abeille',
    grammage: '380 g/m2',
    tisseur: 'Tissage Berthaud, Charlieu',
    entretien:
      'Ni machine, ni sec : eponge humide et sechage a l air. Le recirage se fait chez nous, gratuitement, une fois par an.',
  },
]

/** Les ateliers et fournisseurs, cites par leur nom. */
const FABRICATION: readonly {
  readonly titre: string
  readonly lieu: string
  readonly depuis: string
  readonly effectif: string
  readonly distance: string
  readonly fait: string
  readonly texte: string
}[] = [
  {
    titre: 'Filature Rougier',
    lieu: 'Lodeve, Herault',
    depuis: 'Travaille avec nous depuis 2018',
    effectif: '24 personnes',
    distance: '596 km de l atelier de montage',
    fait: 'Laine bouillie, toile de lin, fil de maille',
    texte:
      'La laine bouillie du manteau Sablon sort de leurs cuves. Trois bains, un foulage, aucune resine : le tissu tient parce qu il est feutre, pas parce qu il est colle. La laine vient de trois eleveurs du Larzac, tondue en mai, lavee sur place.',
  },
  {
    titre: 'Atelier Vasseur',
    lieu: 'Roubaix, Nord',
    depuis: 'Travaille avec nous depuis 2016',
    effectif: '11 couturieres, 2 tables de coupe',
    distance: 'Atelier de montage, toutes les pieces y passent',
    fait: 'Coupe, montage, finitions, numerotation',
    texte:
      'Onze couturieres, deux tables de coupe. Toute la maille et les vestes structurees y sont montees, par series de quarante pieces maximum. Une piece passe entre quatre paires de mains et porte le numero de sa serie, cousu dans la couture de cote.',
  },
  {
    titre: 'Tissage Berthaud',
    lieu: 'Charlieu, Loire',
    depuis: 'Travaille avec nous depuis 2019',
    effectif: '9 personnes',
    distance: '561 km de l atelier de montage',
    fait: 'Velours cotele, popeline, coton cire',
    texte:
      'Le velours cotele de la veste Talus, tisse sur des metiers de 1978 remis en route en 2019. Cinq metres a l heure, laize de 140 centimetres. Le cirage du coton se fait dans le meme batiment, au trempe, sans solvant.',
  },
]

/** Les delais et frais de livraison, par zone. */
const LIVRAISON: readonly {
  readonly zone: string
  readonly delai: string
  readonly frais: string
  readonly note: string
}[] = [
  {
    zone: 'France metropolitaine',
    delai: '2 a 3 jours ouvres',
    frais: '6 € — offert des 200 €',
    note: 'Colissimo suivi, remis contre signature',
  },
  {
    zone: 'Corse et outre-mer',
    delai: '5 a 8 jours ouvres',
    frais: '14 € — offert des 400 €',
    note: 'Taxes locales a la charge du destinataire',
  },
  {
    zone: 'Union europeenne',
    delai: '3 a 6 jours ouvres',
    frais: '12 € — offert des 300 €',
    note: 'Prix affiches taxes comprises, rien a payer a l arrivee',
  },
  {
    zone: 'Suisse et Royaume-Uni',
    delai: '4 a 7 jours ouvres',
    frais: '22 €',
    note: 'Droits de douane factures a la livraison par le transporteur',
  },
  {
    zone: 'Retrait en boutique',
    delai: 'Sous 24 heures',
    frais: 'Gratuit',
    note: 'Paris, Lyon et Nantes — essayage possible avant paiement',
  },
]

/** Les conditions de retour, telles qu elles figurent au bon de commande. */
const RETOURS: readonly { readonly titre: string; readonly texte: string }[] = [
  {
    titre: 'Trente jours, frais a notre charge',
    texte:
      'Le bon de retour prepaye est dans le colis. Depot en bureau de poste ou en point relais ; le remboursement part le jour ou le colis nous revient, sur le moyen de paiement d origine.',
  },
  {
    titre: 'Echange de taille en priorite',
    texte:
      'Une taille echangee est mise de cote des la demande, avant meme le retour du premier colis. C est la seule facon de ne pas perdre sa taille sur une serie de quarante.',
  },
  {
    titre: 'Ce que nous ne reprenons pas',
    texte:
      'Une piece portee, lavee, retouchee ou sans son etiquette de serie. Les retouches faites chez nous, elles, restent gratuites a vie sur l ourlet et les manches.',
  },
]

/** Les trois adresses ouvertes au public. */
const BOUTIQUES: readonly {
  readonly ville: string
  readonly adresse: string
  readonly horaires: readonly (readonly [string, string])[]
  readonly graine: string
}[] = [
  {
    ville: 'Paris',
    adresse: '18 rue de Poitou, 75003',
    horaires: [
      ['Mardi au vendredi', '11h - 19h30'],
      ['Samedi', '10h30 - 20h'],
      ['Dimanche et lundi', 'Ferme'],
    ],
    graine: 'lisiere-boutique-paris',
  },
  {
    ville: 'Lyon',
    adresse: '4 quai Saint-Vincent, 69001',
    horaires: [
      ['Mercredi au vendredi', '11h - 19h'],
      ['Samedi', '10h - 19h'],
      ['Dimanche au mardi', 'Ferme'],
    ],
    graine: 'lisiere-boutique-lyon',
  },
  {
    ville: 'Nantes',
    adresse: '9 rue de la Juiverie, 44000',
    horaires: [
      ['Jeudi et vendredi', '12h - 19h'],
      ['Samedi', '11h - 19h'],
      ['Dimanche au mercredi', 'Ferme'],
    ],
    graine: 'lisiere-boutique-nantes',
  },
]

/**
 * Le defile, silhouette par silhouette, dans l ordre du passage.
 *
 * Elles ne sont pas empilees mais **parcourues de cote** : c est ainsi qu on
 * regarde un passage, de profil, l une apres l autre. Le rail est la signature
 * de mouvement de la page.
 */
const SILHOUETTES: readonly {
  readonly rang: string
  readonly graine: string
  readonly alt: string
  readonly piece: string
  readonly matiere: string
}[] = [
  {
    rang: '01',
    graine: 'lisiere-defile-1',
    alt: 'Long manteau a carreaux vert et bleu, presente sur mannequin',
    piece: 'Manteau Sablon',
    matiere: 'Laine bouillie',
  },
  {
    rang: '02',
    graine: 'lisiere-defile-2',
    alt: 'Un passage sur le podium exterieur, robe courte bleue, public assis de part et d autre',
    piece: 'Maille Cotiere',
    matiere: 'Laine des Pyrenees',
  },
  {
    rang: '03',
    graine: 'lisiere-defile-3',
    alt: 'Robe longue vert olive a manches gigot, presentee sur buste',
    piece: 'Robe Aout',
    matiere: 'Serge de viscose',
  },
  {
    rang: '04',
    graine: 'lisiere-defile-4',
    alt: 'Manteau bleu porte en exterieur, photographie de mode en couleurs',
    piece: 'Trench Orme',
    matiere: 'Coton cire',
  },
  {
    rang: '05',
    graine: 'lisiere-defile-5',
    alt: 'Veste a carreaux et noeud papillon, presentee sur mannequin coiffe d un chapeau melon',
    piece: 'Veste Talus',
    matiere: 'Velours cotele',
  },
]

/** La largeur d une silhouette dans le rail : grande, sans jamais deborder. */
const LARGEUR_SILHOUETTE = 'clamp(220px, 31vw, 410px)'

/** Un intitule de rubrique, en petites capitales espacees. */
function Rubrique({
  numero,
  children,
}: {
  readonly numero: string
  readonly children: string
}): ReactElement {
  return (
    <p className="o-flex o-items-baseline o-gap-3 o-text-xs o-font-medium o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
      <span className="o-tabular-nums" style={{ color: ENCRE_ACCENT }}>
        {numero}
      </span>
      {children}
    </p>
  )
}

/** La vitrine. */
export default function Page(): ReactElement {
  const polices = usePolices('affiche')
  /** La famille affichee dans le cahier. */
  const [famille, setFamille] = useState<Famille>('Tout')
  /** La taille choisie sur la fiche produit, ou rien tant qu on n a pas choisi. */
  const [taille, setTaille] = useState<string | undefined>(undefined)
  /** Le guide des tailles est replie tant qu on ne le demande pas. */
  const [guideOuvert, setGuideOuvert] = useState(false)

  const cahier = useMemo(
    () =>
      famille === 'Tout' ? COLLECTION : COLLECTION.filter((p) => p.famille === famille),
    [famille],
  )

  const choisie = TAILLES.find((t) => t.taille === taille)

  return (
    <Porte forme="lettres" marque="Lisiere" sombre={false}>
      <div
        className="o-bg-zinc-50 dark:o-bg-zinc-950 o-text-zinc-900 dark:o-text-zinc-50"
        style={polices}
      >
        {/* ----- Le masthead : une bande de tirages, puis le nom qui remplit la page — Nordframe */}
        <header className="o-relative o-isolate o-overflow-hidden">
          <BarreCoins
            marque="Lisiere"
            liens={NAVIGATION}
            droite={
              <a
                href="#panier"
                className="o-no-underline focus:o-ring"
                style={{ color: ENCRE_ACCENT }}
              >
                Panier (2)
              </a>
            }
            sombre={false}
          />

          {/* La planche contact du passage : quatre des cinq silhouettes, petites
            et numerotees. Les cinq reviennent en grand dans le rail, plus bas —
            c est la relation d une planche contact a ses tirages, pas une
            repetition. */}
          <Stagger
            className="o-grid o-list-none o-m-0 o-grid-cols-2 o-gap-2 o-p-0 o-px-2 md:o-grid-cols-4"
            as="ul"
            step={80}
          >
            {SILHOUETTES.slice(0, 4).map((silhouette) => (
              <li key={silhouette.rang} className="o-min-w-0">
                <div
                  className="o-relative o-overflow-hidden o-bg-zinc-100 dark:o-bg-zinc-900"
                  style={{ aspectRatio: '3 / 4' }}
                >
                  <img
                    src={photo(silhouette.graine, 700, 900)}
                    alt={silhouette.alt}
                    className="o-absolute o-inset-0 o-size-full o-object-cover"
                  />
                </div>
                <p className="o-m-0 o-mt-2 o-flex o-items-baseline o-gap-2 o-font-mono o-text-xs o-uppercase o-tracking-widest">
                  <span className="o-tabular-nums" style={{ color: ENCRE_ACCENT }}>
                    {silhouette.rang}
                  </span>
                  <span className="o-min-w-0 o-truncate o-text-zinc-900 dark:o-text-zinc-50">
                    {silhouette.piece}
                  </span>
                </p>
              </li>
            ))}
          </Stagger>
          <p className="o-m-0 o-mt-3 o-px-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
            Planche contact — quatre des cinq silhouettes du passage
          </p>

          <div className="o-relative o-px-2 o-pb-4 o-pt-10">
            <Surgit
              delai={300}
              as="p"
              className="o-m-0 o-select-none o-whitespace-nowrap o-text-center o-uppercase o-text-zinc-950 dark:o-text-zinc-50"
              style={{
                ...corps('xxl', 800),
                fontSize: 'clamp(3.5rem, 17.5vw, 19rem)',
                lineHeight: 0.84,
              }}
            >
              Lisiere
            </Surgit>

            {/* Le tampon du numero, pose de travers sur le mot-marque : le seul
              objet de la une qui ne soit pas aligne sur la grille. Le meme
              renseignement est ecrit en clair dans la ligne du dessous, donc le
              disque n a rien a dire aux technologies d assistance. */}
            <span
              aria-hidden="true"
              className="max-md:o-hidden o-pointer-events-none o-absolute o-right-6 o-top-4 o-z-10 o-text-zinc-950 dark:o-text-zinc-50"
              style={{ transform: 'rotate(-9deg)' }}
            >
              <CircularText size={132} speed={26}>
                {' NUMERO DOUZE · AUTOMNE HIVER 26 ·'}
              </CircularText>
            </span>

            <div className="o-mt-6 o-flex o-flex-wrap o-items-center o-justify-between o-gap-x-8 o-gap-y-3 o-px-4 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
              <Surgit delai={520} as="p" className="o-m-0">
                Numero douze — automne hiver 26
              </Surgit>
              <Surgit delai={600} as="p" className="o-m-0 o-max-w-md o-text-center">
                Trente-deux pieces, photographiees en pied, vendues telles quelles
              </Surgit>
              {/* Pas de gelule : la une d un cahier n a pas de bouton. L action
                vit dans la barre et dans le pied. */}
              <Surgit delai={680} as="p" className="o-m-0">
                <a
                  href="#defile"
                  className="o-inline-flex o-items-center o-gap-2 o-no-underline o-underline-offset-8 hover:o-underline focus:o-ring"
                  style={{ color: ENCRE_ACCENT }}
                >
                  Le passage du 4 septembre{' '}
                  <Icon icon={ArrowRight} size={13} aria-hidden="true" />
                </a>
              </Surgit>
            </div>
          </div>
        </header>

        {/* ----- Le chapeau ---------------------------------------------------- */}
        <section className={`o-border-b ${FILET} o-px-6 o-py-16 md:o-py-20`}>
          <div className="o-mx-auto o-max-w-4xl o-text-center">
            <SplitLines
              as="h1"
              className="o-font-serif o-text-3xl o-tracking-tight o-text-balance md:o-text-5xl"
              stagger={110}
            >
              {'Trente-deux pieces,\nphotographiees en pied,\nvendues telles quelles.'}
            </SplitLines>

            <p className="o-mx-auto o-mt-8 o-max-w-2xl o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-300">
              Lisiere edite deux collections par an et rien entre les deux. Chaque piece
              est coupee en France, en series de quarante, dans des tissus dont nous
              nommons le tisseur. La grille ci-dessous est le catalogue entier : il n y a
              pas de seconde page.
            </p>

            <p className="o-mt-8">
              <a
                href="#boutiques"
                className="o-inline-flex o-items-center o-gap-2 o-text-sm o-uppercase o-tracking-widest o-underline o-underline-offset-8 o-transition-opacity hover:o-opacity-70 focus:o-ring"
                style={{ color: ENCRE_ACCENT }}
              >
                <Icon icon={MapPin} size={15} />
                Essayer en boutique
              </a>
            </p>
          </div>

          <figure className="o-m-0 o-mx-auto o-mt-14 o-max-w-5xl">
            <img
              src={photo('lisiere-couverture', 1400, 900)}
              alt="Silhouette d ouverture : manteau Sablon porte sur un pantalon de lin"
              width={1400}
              height={900}
              className="o-w-full o-h-auto o-object-cover"
              style={{ aspectRatio: '14 / 9' }}
            />
            <figcaption className="o-mt-3 o-flex o-flex-wrap o-items-baseline o-justify-center o-gap-3 o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
              <span style={{ color: ENCRE_ACCENT }}>Fig. 1</span>
              Ouverture — Sablon sur Grange
            </figcaption>
          </figure>
        </section>

        {/* ----- Le defile, en rail : la signature de mouvement de la page ------
          Cinq silhouettes que l on parcourt de cote pendant que l ecran reste
          fixe — un passage se regarde de profil, l une apres l autre. Le rail
          s ouvre sur la note du passage et se ferme sur le generique. */}
        <div
          id="defile"
          aria-labelledby="defile-titre"
          className={`o-scroll-mt-24 o-border-b ${FILET}`}
        >
          <Rail
            ecrans={2.6}
            entete={
              <div className="o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-x-8 o-gap-y-2 o-px-6 o-pb-6 o-pt-8">
                <div>
                  <Rubrique numero="01">Le defile</Rubrique>
                  <h2
                    id="defile-titre"
                    className="o-mt-3 o-font-serif o-tracking-tight"
                    style={{ fontSize: 'clamp(1.75rem, 3.4vw, 3rem)', lineHeight: 1 }}
                  >
                    Cinq silhouettes, dans l ordre du passage
                  </h2>
                </div>
                <p className="o-m-0 o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                  4 septembre — Cour de Rohan
                </p>
              </div>
            }
          >
            <div aria-hidden="true" className="o-w-6 o-shrink-0" />

            {/* La note du passage tient lieu de premiere planche. */}
            <div
              className="o-mr-10 o-flex o-shrink-0 o-flex-col o-justify-end o-self-stretch o-pb-10"
              style={{ width: 'clamp(200px, 26vw, 320px)' }}
            >
              <p className="o-m-0 o-font-serif o-text-xl o-leading-snug o-tracking-tight md:o-text-2xl">
                Cent vingt places assises, dix minutes, aucune musique.
              </p>
              <p className="o-m-0 o-mt-4 o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-300">
                Les cinq silhouettes ci-contre sont passees dans cet ordre. Elles sont
                toutes en vente ; aucune n a ete coupee pour la seule photographie.
              </p>
            </div>

            {SILHOUETTES.map((silhouette) => (
              <figure
                key={silhouette.rang}
                className="o-m-0 o-mr-10 o-shrink-0"
                style={{ width: LARGEUR_SILHOUETTE }}
              >
                <div
                  className="o-relative o-overflow-hidden o-bg-zinc-100 dark:o-bg-zinc-900"
                  style={{ aspectRatio: '3 / 4' }}
                >
                  <img
                    src={photo(silhouette.graine, 900, 1200)}
                    alt={silhouette.alt}
                    decoding="async"
                    className="o-absolute o-inset-0 o-size-full o-object-cover"
                  />
                </div>
                <figcaption
                  className={`o-mt-3 o-flex o-items-baseline o-gap-3 o-border-t ${FILET} o-pt-3 o-text-xs o-uppercase o-tracking-widest`}
                >
                  <span className="o-tabular-nums" style={{ color: ENCRE_ACCENT }}>
                    {silhouette.rang}
                  </span>
                  <span className="o-text-zinc-900 dark:o-text-zinc-50">
                    {silhouette.piece}
                  </span>
                  <span className="o-ml-auto o-text-zinc-500 dark:o-text-zinc-400">
                    {silhouette.matiere}
                  </span>
                </figcaption>
              </figure>
            ))}

            {/* Le generique ferme le rail, comme au bas d une planche contact. */}
            <div
              className="o-mr-6 o-flex o-shrink-0 o-flex-col o-justify-center o-self-stretch"
              style={{ width: 'clamp(180px, 22vw, 260px)' }}
            >
              <p className="o-m-0 o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                Photographies
                <br />
                <span className="o-text-zinc-900 dark:o-text-zinc-50">Camille Roux</span>
              </p>
              <p className="o-m-0 o-mt-6 o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                Stylisme
                <br />
                <span className="o-text-zinc-900 dark:o-text-zinc-50">
                  Nadia Berthier
                </span>
              </p>
              <p className="o-m-0 o-mt-6 o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                Trente-deux pieces au cahier
                <br />
                Huit montrees ci-dessous
              </p>
            </div>
            <div aria-hidden="true" className="o-w-6 o-shrink-0" />
          </Rail>
        </div>

        {/* ----- La collection en grille, filtrable ----------------------------- */}
        <section
          id="collection"
          className={`o-border-b ${FILET} o-px-6 o-py-16 md:o-py-24`}
        >
          <div className="o-mx-auto o-max-w-7xl">
            <div className="o-flex o-flex-wrap o-items-end o-justify-between o-gap-6">
              <div>
                <Rubrique numero="02">Le cahier</Rubrique>
                <h2 className="o-mt-4 o-font-serif o-text-3xl o-tracking-tight md:o-text-5xl">
                  Huit pieces sur trente-deux
                </h2>
              </div>
              <p className="o-max-w-sm o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-300">
                Prix nets, taxes comprises, livraison offerte a partir de 200 € en France.
                Les tailles vont du 34 au 46.
              </p>
            </div>

            {/*
            Le filtre : une rangee de familles, en filets. Il ne feint pas —
            la grille en dessous ne rend que la famille demandee, et le
            compteur suit.
          */}
            <div
              className={`o-mt-10 o-flex o-flex-wrap o-items-center o-gap-x-3 o-gap-y-3 o-border-t ${FILET} o-pt-6`}
            >
              <span className="o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                Famille
              </span>
              {(['Tout', ...FAMILLES] as readonly Famille[]).map((nom) => {
                const active = nom === famille
                const compte =
                  nom === 'Tout'
                    ? COLLECTION.length
                    : COLLECTION.filter((p) => p.famille === nom).length
                return (
                  <button
                    key={nom}
                    type="button"
                    aria-pressed={active}
                    onClick={() => {
                      setFamille(nom)
                    }}
                    className={
                      active
                        ? 'o-border-w-1 o-border-transparent o-px-4 o-py-2 o-text-xs o-uppercase o-tracking-widest o-transition-colors focus:o-ring'
                        : `o-border-w-1 ${FILET} o-px-4 o-py-2 o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-300 hover:o-border-zinc-900 dark:hover:o-border-zinc-100 o-transition-colors focus:o-ring`
                    }
                    style={active ? APLAT_PLEIN : undefined}
                  >
                    {nom}
                    <span className="o-ml-2 o-tabular-nums">{compte}</span>
                  </button>
                )
              })}
            </div>

            <p
              aria-live="polite"
              className="o-mt-4 o-text-sm o-text-zinc-600 dark:o-text-zinc-300"
            >
              {cahier.length === COLLECTION.length
                ? 'Les huit pieces du cahier.'
                : `${String(cahier.length)} ${cahier.length > 1 ? 'pieces' : 'piece'} en ${famille.toLowerCase()}.`}
            </p>

            {/*
            Une grille nue plutot qu un `Stagger` : celui-ci enveloppe chaque
            enfant, et l enveloppe deviendrait la case de la grille — les deux
            ouvertures sur deux colonnes n auraient plus prise.
          */}
            <Reveal className="o-mt-10 o-grid o-gap-x-6 o-gap-y-12 md:o-grid-cols-2 lg:o-grid-cols-3">
              {cahier.map((piece, index) => (
                <article
                  key={piece.nom}
                  className={piece.large === true ? 'lg:o-col-span-2' : undefined}
                >
                  <a
                    href="#piece"
                    className="o-block o-no-underline o-text-current focus:o-ring dark:o-text-current"
                  >
                    <HoverZoom
                      src={photo(piece.graine, piece.large === true ? 1100 : 700, 900)}
                      alt={`${piece.nom} en ${piece.matiere.toLowerCase()}, photographie en pied`}
                      ratio={piece.large === true ? 1.1 : 0.78}
                      zoom={1.08}
                    />
                    <div
                      className={`o-mt-4 o-flex o-items-baseline o-justify-between o-gap-4 o-border-t ${FILET} o-pt-3`}
                    >
                      <div>
                        <h3 className="o-font-serif o-text-lg o-tracking-tight">
                          {piece.nom}
                        </h3>
                        <p className="o-mt-1 o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                          {String(index + 1).padStart(2, '0')} — {piece.matiere}
                        </p>
                        <p className="o-mt-1 o-text-xs o-tabular-nums o-text-zinc-500 dark:o-text-zinc-400">
                          Tailles {piece.tailles.join(' · ')}
                        </p>
                      </div>
                      <p className="o-shrink-0 o-tabular-nums o-text-sm o-font-medium">
                        {piece.prix} €
                      </p>
                    </div>
                  </a>
                </article>
              ))}
            </Reveal>
          </div>
        </section>

        {/* ----- La fiche produit ----------------------------------------------- */}
        <section id="piece" className={`o-border-b ${FILET} o-px-6 o-py-16 md:o-py-24`}>
          <div className="o-mx-auto o-grid o-max-w-7xl o-items-start o-gap-12 lg:o-grid-cols-2">
            <Reveal>
              <ImageStackSwipe
                images={[
                  media(
                    'lisiere-piece-1',
                    'Le manteau Sablon, presente sur mannequin',
                    900,
                    640,
                  ),
                  media('lisiere-piece-2', 'La maille Cotiere, sur cintre', 900, 640),
                  media(
                    'lisiere-piece-3',
                    'Le tissage de la laine, sur metier a bras',
                    900,
                    640,
                  ),
                  media(
                    'lisiere-piece-4',
                    'La doublure en cupro ecru, en detail',
                    900,
                    640,
                  ),
                ]}
                label="Le manteau Sablon, ses matieres et sa fabrication"
                ratio={1.4}
                depth={2}
              />
            </Reveal>

            <div>
              <Rubrique numero="03">La piece</Rubrique>
              <h2 className="o-mt-4 o-font-serif o-text-3xl o-tracking-tight md:o-text-5xl">
                Manteau Sablon
              </h2>
              <p className="o-mt-3 o-text-2xl o-tabular-nums o-font-medium">480 €</p>
              <p className="o-mt-6 o-max-w-prose o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-300">
                Laine bouillie 780 g/m2, doublure cupro, deux poches passepoilees et une
                poche interieure. Coupe droite, epaule tombee, longueur 112 cm en taille
                38. Il se porte ferme sur une maille epaisse sans tirer.
              </p>

              <div className="o-mt-10 o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-4">
                <h3 className="o-text-xs o-font-medium o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                  Choisir une taille
                </h3>
                <button
                  type="button"
                  aria-expanded={guideOuvert}
                  aria-controls="guide-tailles"
                  onClick={() => {
                    setGuideOuvert((ouvert) => !ouvert)
                  }}
                  className="o-inline-flex o-items-center o-gap-2 o-text-xs o-uppercase o-tracking-widest o-underline o-underline-offset-4 o-transition-colors focus:o-ring"
                  style={{ color: ENCRE_ACCENT }}
                >
                  <Icon icon={Ruler} size={14} aria-hidden="true" />
                  {guideOuvert ? 'Fermer le guide' : 'Guide des tailles'}
                </button>
              </div>

              <ul className="o-mt-4 o-flex o-flex-wrap o-gap-2 o-list-none o-p-0">
                {TAILLES.map((t) => {
                  const epuisee = t.reste === 0
                  const active = t.taille === taille
                  return (
                    <li key={t.taille}>
                      <button
                        type="button"
                        disabled={epuisee}
                        aria-pressed={active}
                        onClick={() => {
                          setTaille(t.taille)
                        }}
                        className={
                          epuisee
                            ? 'o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-px-4 o-py-2 o-text-sm o-tabular-nums o-line-through o-text-zinc-500 dark:o-text-zinc-400 o-cursor-not-allowed'
                            : active
                              ? 'o-border-w-1 o-border-transparent o-px-4 o-py-2 o-text-sm o-tabular-nums o-transition-colors focus:o-ring'
                              : 'o-border-w-1 o-border-zinc-300 dark:o-border-zinc-700 o-px-4 o-py-2 o-text-sm o-tabular-nums hover:o-border-zinc-900 dark:hover:o-border-zinc-100 o-transition-colors focus:o-ring'
                        }
                        style={active && !epuisee ? APLAT_PLEIN : undefined}
                      >
                        {t.taille}
                        <span
                          className={
                            active && !epuisee
                              ? 'o-ml-2 o-text-xs'
                              : 'o-ml-2 o-text-xs o-text-zinc-500 dark:o-text-zinc-400'
                          }
                        >
                          {epuisee ? 'epuise' : `${String(t.reste)} en stock`}
                        </span>
                      </button>
                    </li>
                  )
                })}
              </ul>

              {/* Le retour du choix : ce que la taille change vraiment. */}
              <p
                aria-live="polite"
                className="o-mt-4 o-border-l o-pl-4 o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-300"
                style={{ borderColor: ENCRE_ACCENT }}
              >
                {choisie === undefined
                  ? 'Aucune taille choisie. Le 42 est recoupe en fevrier ; les autres partent de l atelier de Roubaix.'
                  : `Taille ${choisie.taille} — ${String(choisie.reste)} pieces sur la serie de quarante. ${choisie.delai}. Retouche d ourlet offerte, comptez cinq jours de plus.`}
              </p>

              {guideOuvert ? (
                <div id="guide-tailles" className="o-mt-6 o-w-full o-overflow-x-auto">
                  <table className="o-w-full o-text-left o-text-sm">
                    <caption className="o-pb-3 o-text-left o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
                      Mesures du corps en centimetres. Le manteau Sablon ajoute 12 cm d
                      aisance a la poitrine : entre deux tailles, prenez la plus petite.
                    </caption>
                    <thead>
                      <tr className={`o-border-b ${FILET_FORT}`}>
                        {['Taille', 'Poitrine', 'Ceinture', 'Bassin', 'Dos'].map(
                          (entete) => (
                            <th
                              key={entete}
                              scope="col"
                              className="o-py-2 o-pr-4 o-text-xs o-font-medium o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400"
                            >
                              {entete}
                            </th>
                          ),
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {GUIDE.map((ligne) => (
                        <tr key={ligne.taille} className={`o-border-b ${FILET}`}>
                          <th
                            scope="row"
                            className="o-py-2 o-pr-4 o-tabular-nums o-font-medium"
                          >
                            {ligne.taille}
                          </th>
                          <td className="o-py-2 o-pr-4 o-tabular-nums o-text-zinc-600 dark:o-text-zinc-300">
                            {ligne.poitrine}
                          </td>
                          <td className="o-py-2 o-pr-4 o-tabular-nums o-text-zinc-600 dark:o-text-zinc-300">
                            {ligne.ceinture}
                          </td>
                          <td className="o-py-2 o-pr-4 o-tabular-nums o-text-zinc-600 dark:o-text-zinc-300">
                            {ligne.bassin}
                          </td>
                          <td className="o-py-2 o-tabular-nums o-text-zinc-600 dark:o-text-zinc-300">
                            {ligne.dos}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : null}

              <div className="o-mt-8 o-flex o-flex-wrap o-gap-3">
                <button
                  type="button"
                  disabled={choisie === undefined}
                  className={
                    choisie === undefined
                      ? 'o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-px-6 o-py-3 o-text-sm o-font-medium o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400 o-cursor-not-allowed'
                      : 'o-px-6 o-py-3 o-text-sm o-font-medium o-uppercase o-tracking-widest o-transition-opacity hover:o-opacity-85 focus:o-ring'
                  }
                  style={choisie === undefined ? undefined : APLAT_PLEIN}
                >
                  {choisie === undefined
                    ? 'Choisir une taille'
                    : `Ajouter le ${choisie.taille} au panier`}
                </button>
                <button
                  type="button"
                  className="o-border-w-1 o-px-6 o-py-3 o-text-sm o-font-medium o-uppercase o-tracking-widest hover:o-bg-zinc-100 dark:hover:o-bg-zinc-800 o-transition-colors focus:o-ring"
                  style={{ borderColor: ENCRE_ACCENT, color: ENCRE_ACCENT }}
                >
                  Reserver en boutique
                </button>
              </div>

              <dl
                className={`o-mt-10 o-grid o-gap-x-6 o-gap-y-4 o-border-t ${FILET} o-pt-6 sm:o-grid-cols-2`}
              >
                <div>
                  <dt className="o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                    Serie
                  </dt>
                  <dd className="o-mt-1 o-text-sm">40 pieces, numerotees</dd>
                </div>
                <div>
                  <dt className="o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                    Fabrication
                  </dt>
                  <dd className="o-mt-1 o-text-sm">Atelier Vasseur, Roubaix</dd>
                </div>
                <div>
                  <dt className="o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                    Entretien
                  </dt>
                  <dd className="o-mt-1 o-text-sm">Nettoyage a sec, brosse douce</dd>
                </div>
                <div>
                  <dt className="o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                    Retour
                  </dt>
                  <dd className="o-mt-1 o-text-sm">30 jours, frais a notre charge</dd>
                </div>
              </dl>
            </div>
          </div>
        </section>

        {/* ----- Matieres et entretien ------------------------------------------ */}
        <section
          id="matieres"
          className={`o-border-b ${FILET} o-px-6 o-py-16 md:o-py-24`}
        >
          <div className="o-mx-auto o-max-w-7xl">
            <Rubrique numero="04">Matieres et entretien</Rubrique>
            <h2 className="o-mt-4 o-max-w-3xl o-font-serif o-text-3xl o-tracking-tight o-text-balance md:o-text-5xl">
              Six tissus, leur composition et ce qu il faut en faire
            </h2>
            <p className="o-mt-6 o-max-w-2xl o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-300">
              La meme fiche est cousue dans chaque piece. Rien n est traite deperlant,
              rien n est enduit : un vetement qui se nettoie mal se porte moins.
            </p>

            <div className="o-mt-12 o-w-full o-overflow-x-auto">
              <table
                className="o-w-full o-text-left o-text-sm"
                style={{ minWidth: '46rem' }}
              >
                <caption className="o-sr-only">
                  Composition, grammage, tisseur et entretien des six matieres de la
                  collection automne hiver 26.
                </caption>
                <thead>
                  <tr className={`o-border-b ${FILET_FORT}`}>
                    {['Matiere', 'Composition', 'Grammage', 'Tisseur', 'Entretien'].map(
                      (entete) => (
                        <th
                          key={entete}
                          scope="col"
                          className="o-py-3 o-pr-5 o-text-xs o-font-medium o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400"
                        >
                          {entete}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  {MATIERES.map((m) => (
                    <tr key={m.matiere} className={`o-border-b ${FILET}`}>
                      <th
                        scope="row"
                        className="o-py-4 o-pr-5 o-align-top o-font-serif o-text-base o-whitespace-nowrap"
                      >
                        {m.matiere}
                      </th>
                      <td className="o-py-4 o-pr-5 o-align-top o-text-zinc-600 dark:o-text-zinc-300">
                        {m.composition}
                      </td>
                      <td className="o-py-4 o-pr-5 o-align-top o-tabular-nums o-whitespace-nowrap o-text-zinc-600 dark:o-text-zinc-300">
                        {m.grammage}
                      </td>
                      <td className="o-py-4 o-pr-5 o-align-top o-text-zinc-600 dark:o-text-zinc-300">
                        {m.tisseur}
                      </td>
                      <td className="o-py-4 o-align-top o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-300">
                        {m.entretien}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="o-mt-6 o-text-sm o-italic o-text-zinc-500 dark:o-text-zinc-400">
              Un bouton perdu, une couture ouverte, un ourlet a reprendre : la reparation
              est gratuite a vie, boutique ou par voie postale.
            </p>
          </div>
        </section>

        {/* ----- Provenance et fabrication -------------------------------------- */}
        <section
          id="fabrication"
          className={`o-border-b ${FILET} o-px-6 o-py-16 md:o-py-24`}
        >
          <div className="o-mx-auto o-max-w-7xl">
            <Rubrique numero="05">Provenance et fabrication</Rubrique>
            <h2 className="o-mt-4 o-max-w-3xl o-font-serif o-text-3xl o-tracking-tight o-text-balance md:o-text-5xl">
              Trois maisons, nommees, a moins de six cents kilometres
            </h2>

            <Stagger className="o-mt-12 o-grid o-gap-10 md:o-grid-cols-3" step={90}>
              {FABRICATION.map((atelier) => (
                <article key={atelier.titre}>
                  <img
                    src={photo(
                      `lisiere-atelier-${atelier.titre.toLowerCase().replace(/ /g, '-')}`,
                      700,
                      500,
                    )}
                    alt={`Interieur de ${atelier.titre}, a ${atelier.lieu}`}
                    width={700}
                    height={500}
                    loading="lazy"
                    className="o-w-full o-h-auto o-object-cover o-aspect-video"
                  />
                  <h3 className="o-mt-5 o-flex o-items-center o-gap-2 o-font-serif o-text-xl o-tracking-tight">
                    <Icon
                      icon={Scissors}
                      size={18}
                      style={{ color: ENCRE_ACCENT }}
                      aria-hidden="true"
                    />
                    {atelier.titre}
                  </h3>
                  <p className="o-mt-1 o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                    {atelier.lieu}
                  </p>
                  <p className="o-mt-3 o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-300">
                    {atelier.texte}
                  </p>
                  <dl
                    className={`o-mt-5 o-flex o-flex-col o-gap-2 o-border-t ${FILET} o-pt-4 o-text-sm`}
                  >
                    <div className="o-flex o-flex-wrap o-gap-x-3">
                      <dt className="o-text-zinc-500 dark:o-text-zinc-400">Depuis</dt>
                      <dd className="o-text-zinc-700 dark:o-text-zinc-200">
                        {atelier.depuis}
                      </dd>
                    </div>
                    <div className="o-flex o-flex-wrap o-gap-x-3">
                      <dt className="o-text-zinc-500 dark:o-text-zinc-400">Effectif</dt>
                      <dd className="o-text-zinc-700 dark:o-text-zinc-200">
                        {atelier.effectif}
                      </dd>
                    </div>
                    <div className="o-flex o-flex-wrap o-gap-x-3">
                      <dt className="o-text-zinc-500 dark:o-text-zinc-400">Distance</dt>
                      <dd className="o-text-zinc-700 dark:o-text-zinc-200">
                        {atelier.distance}
                      </dd>
                    </div>
                    <div className="o-flex o-flex-wrap o-gap-x-3">
                      <dt className="o-text-zinc-500 dark:o-text-zinc-400">Y est fait</dt>
                      <dd className="o-text-zinc-700 dark:o-text-zinc-200">
                        {atelier.fait}
                      </dd>
                    </div>
                  </dl>
                </article>
              ))}
            </Stagger>

            <p
              className="o-mt-12 o-max-w-3xl o-border-l o-pl-5 o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-300"
              style={{ borderColor: ENCRE_ACCENT }}
            >
              Le prix de revient d un manteau Sablon se repartit ainsi : 118 € de tissu et
              fournitures, 96 € de faconnage, 34 € de transport et de controle, 232 € de
              marge brute — dont le loyer des trois boutiques, les salaires et les series
              invendues. Nous n avons ni sous-traitance en cascade, ni intermediaire.
            </p>
          </div>
        </section>

        {/* ----- Livraison et retours -------------------------------------------- */}
        <section
          id="livraison"
          className={`o-border-b ${FILET} o-px-6 o-py-16 md:o-py-24`}
        >
          <div className="o-mx-auto o-max-w-7xl">
            <Rubrique numero="06">Livraison et retours</Rubrique>
            <h2 className="o-mt-4 o-max-w-3xl o-font-serif o-text-3xl o-tracking-tight o-text-balance md:o-text-5xl">
              Cinq zones, cinq delais, un seul bon de retour
            </h2>

            <div className="o-mt-12 o-grid o-items-start o-gap-12 lg:o-grid-cols-3">
              <div className="lg:o-col-span-2 o-w-full o-overflow-x-auto">
                <h3 className="o-flex o-items-center o-gap-2 o-text-xs o-font-medium o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                  <Icon icon={Package} size={14} aria-hidden="true" />
                  Expedition
                </h3>
                <table className="o-mt-4 o-w-full o-text-left o-text-sm">
                  <caption className="o-sr-only">
                    Delais et frais de livraison par zone, et mode d acheminement.
                  </caption>
                  <thead>
                    <tr className={`o-border-b ${FILET_FORT}`}>
                      {['Destination', 'Delai', 'Frais', 'Detail'].map((entete) => (
                        <th
                          key={entete}
                          scope="col"
                          className="o-py-3 o-pr-5 o-text-xs o-font-medium o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400"
                        >
                          {entete}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {LIVRAISON.map((ligne) => (
                      <tr key={ligne.zone} className={`o-border-b ${FILET}`}>
                        <th
                          scope="row"
                          className="o-py-4 o-pr-5 o-align-top o-font-medium"
                        >
                          {ligne.zone}
                        </th>
                        <td className="o-py-4 o-pr-5 o-align-top o-whitespace-nowrap o-text-zinc-600 dark:o-text-zinc-300">
                          {ligne.delai}
                        </td>
                        <td
                          className="o-py-4 o-pr-5 o-align-top o-whitespace-nowrap o-font-medium"
                          style={{ color: ENCRE_ACCENT }}
                        >
                          {ligne.frais}
                        </td>
                        <td className="o-py-4 o-align-top o-text-zinc-600 dark:o-text-zinc-300">
                          {ligne.note}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <p className="o-mt-4 o-text-sm o-text-zinc-600 dark:o-text-zinc-300">
                  Commande passee avant 13 heures un jour ouvre : le colis part le jour
                  meme. Aucune expedition le samedi ni le dimanche.
                </p>
              </div>

              <div>
                <h3 className="o-flex o-items-center o-gap-2 o-text-xs o-font-medium o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                  <Icon icon={RotateCcw} size={14} aria-hidden="true" />
                  Retours et echanges
                </h3>
                <ul className="o-mt-4 o-flex o-flex-col o-gap-6 o-list-none o-p-0">
                  {RETOURS.map((point) => (
                    <li key={point.titre}>
                      <h4 className="o-font-serif o-text-lg o-tracking-tight">
                        {point.titre}
                      </h4>
                      <p className="o-mt-2 o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-300">
                        {point.texte}
                      </p>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* ----- Boutiques ------------------------------------------------------ */}
        <section
          id="boutiques"
          className={`o-border-b ${FILET} o-px-6 o-py-16 md:o-py-24`}
        >
          <div className="o-mx-auto o-max-w-7xl">
            <Rubrique numero="07">Boutiques</Rubrique>
            <h2 className="o-mt-4 o-font-serif o-text-3xl o-tracking-tight md:o-text-5xl">
              Trois adresses, aucun corner
            </h2>
            <div className="o-mt-12 o-grid o-gap-8 md:o-grid-cols-3">
              {BOUTIQUES.map((boutique) => (
                <article key={boutique.ville}>
                  <img
                    src={photo(boutique.graine, 700, 500)}
                    alt={`Devanture de la boutique Lisiere a ${boutique.ville}`}
                    width={700}
                    height={500}
                    loading="lazy"
                    className="o-w-full o-h-auto o-object-cover o-aspect-video"
                  />
                  <div className={`o-mt-4 o-border-t ${FILET} o-pt-4`}>
                    <h3 className="o-font-serif o-text-xl o-tracking-tight">
                      {boutique.ville}
                    </h3>
                    <p className="o-mt-2 o-text-sm o-text-zinc-600 dark:o-text-zinc-300">
                      {boutique.adresse}
                    </p>
                    <dl className="o-mt-3 o-flex o-flex-col o-gap-1 o-text-sm">
                      {boutique.horaires.map(([jours, heures]) => (
                        <div
                          key={jours}
                          className="o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-3"
                        >
                          <dt className="o-text-zinc-500 dark:o-text-zinc-400">
                            {jours}
                          </dt>
                          <dd className="o-tabular-nums o-text-zinc-700 dark:o-text-zinc-200">
                            {heures}
                          </dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                </article>
              ))}
            </div>
            <p className="o-mt-8 o-max-w-2xl o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-300">
              Les trois boutiques tiennent le catalogue entier et les sept tailles. Une
              piece reservee en ligne y attend quarante-huit heures, sans paiement.
              Retouches faites sur place, comptez cinq jours.
            </p>
          </div>
        </section>

        {/* ----- Le pied : le mot-marque qui remplit la largeur, et des colonnes
          en mono. Il n y a pas de section d appel ailleurs sur la page : c est
          ici, et dans la barre, que l on agit. */}
        <footer
          id="panier"
          className={`o-scroll-mt-24 o-border-t ${FILET_FORT} o-overflow-hidden o-px-6 o-pt-14`}
        >
          <div className="o-mx-auto o-max-w-7xl">
            {/* La lettre de saison, en une ligne : deux champs, pas un ecran. */}
            <div
              className={`o-grid o-items-end o-gap-x-10 o-gap-y-6 o-border-b ${FILET} o-pb-12 md:o-grid-cols-12`}
            >
              <p
                className="o-m-0 o-font-serif o-tracking-tight md:o-col-span-7"
                style={{ fontSize: 'clamp(1.5rem, 3vw, 2.75rem)', lineHeight: 1.05 }}
              >
                La collection de printemps part le 4 mars, a neuf heures.
              </p>
              <form
                className="o-flex o-w-full o-flex-wrap o-items-end o-gap-3 md:o-col-span-5"
                onSubmit={(evenement) => {
                  evenement.preventDefault()
                }}
              >
                <Input
                  label="Adresse electronique"
                  hideLabel
                  type="email"
                  name="courriel"
                  placeholder="vous@exemple.fr"
                  wrapperClassName="o-grow"
                  required
                />
                <button
                  type="submit"
                  className="o-px-5 o-py-2.5 o-text-sm o-font-medium o-uppercase o-tracking-widest o-transition-opacity hover:o-opacity-85 focus:o-ring"
                  style={APLAT_PLEIN}
                >
                  S inscrire
                  <Icon icon={ArrowRight} size={14} className="o-ml-2 o-inline-block" />
                </button>
                <p className="o-m-0 o-w-full o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                  Une lettre par saison. Desabonnement en un clic.
                </p>
              </form>
            </div>

            {/* Quatre colonnes, entierement en mono : la voix technique du cahier. */}
            <div className="o-mt-12 o-grid o-gap-x-8 o-gap-y-10 o-font-mono o-text-xs o-uppercase o-tracking-widest sm:o-grid-cols-2 lg:o-grid-cols-4">
              <div>
                <p className="o-m-0 o-text-zinc-500 dark:o-text-zinc-400">La maison</p>
                <p className="o-m-0 o-mt-4 o-leading-relaxed o-text-zinc-900 dark:o-text-zinc-50">
                  18 rue de Poitou
                  <br />
                  75003 Paris
                  <br />
                  01 44 61 08 12
                </p>
                <a
                  href="#boutiques"
                  className="o-mt-4 o-inline-flex o-items-center o-gap-2 o-no-underline o-underline-offset-4 hover:o-underline focus:o-ring"
                  style={{ color: ENCRE_ACCENT }}
                >
                  bonjour@lisiere.fr{' '}
                  <Icon icon={ArrowRight} size={12} aria-hidden="true" />
                </a>
              </div>
              {(
                [
                  [
                    'Collection',
                    [
                      ['#collection', 'Automne hiver 26'],
                      ['#defile', 'Le defile'],
                      ['#piece', 'Manteaux'],
                      ['#collection', 'Archives'],
                    ],
                  ],
                  [
                    'Maison',
                    [
                      ['#fabrication', 'Ateliers'],
                      ['#boutiques', 'Boutiques'],
                      ['#livraison', 'Retours et echanges'],
                      ['#matieres', 'Entretien'],
                    ],
                  ],
                ] as const
              ).map(([titre, liens]) => (
                <nav key={titre} aria-label={titre}>
                  <p className="o-m-0 o-text-zinc-500 dark:o-text-zinc-400">{titre}</p>
                  <ul className="o-m-0 o-mt-4 o-flex o-list-none o-flex-col o-gap-2 o-p-0">
                    {liens.map(([href, mot]) => (
                      <li key={mot}>
                        <a
                          href={href}
                          className="o-no-underline o-text-zinc-900 dark:o-text-zinc-50 o-underline-offset-4 hover:o-underline focus:o-ring"
                        >
                          {mot}
                        </a>
                      </li>
                    ))}
                  </ul>
                </nav>
              ))}
              <div>
                <p className="o-m-0 o-text-zinc-500 dark:o-text-zinc-400">Nous suivre</p>
                <a
                  href="#collection"
                  className="o-mt-4 o-inline-flex o-items-center o-gap-2 o-no-underline o-text-zinc-900 dark:o-text-zinc-50 o-underline-offset-4 hover:o-underline focus:o-ring"
                >
                  <Icon icon={Camera} size={14} aria-hidden="true" />
                  @lisiere.paris
                </a>
                <p className="o-m-0 o-mt-4 o-leading-relaxed o-text-zinc-500 dark:o-text-zinc-400">
                  Deux collections par an
                  <br />
                  Rien entre les deux
                </p>
              </div>
            </div>
          </div>

          {/* Le mot-marque remplit la largeur, coupe a la ligne de base. */}
          <p
            aria-hidden="true"
            className="o-m-0 o-mt-16 o-select-none o-whitespace-nowrap o-text-center o-uppercase o-text-zinc-950 dark:o-text-zinc-50"
            style={{
              ...corps('xxl', 800),
              fontSize: 'clamp(3rem, 18.5vw, 20rem)',
              lineHeight: 0.76,
            }}
          >
            Lisiere
          </p>

          <div
            className={`o-mx-auto o-mt-6 o-flex o-max-w-7xl o-flex-wrap o-items-baseline o-justify-between o-gap-x-8 o-gap-y-2 o-border-t ${FILET} o-py-6 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400`}
          >
            <p className="o-m-0">
              Lisiere SAS — RCS Paris 892 401 337 — TVA FR 42 892 401 337
            </p>
            <p className="o-m-0">© 2026 — Vitrine de demonstration Odoro</p>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
