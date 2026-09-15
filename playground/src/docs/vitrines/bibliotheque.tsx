/**
 * Rayon 800 — bibliotheque municipale.
 *
 * ## Le mecanisme : la cote
 *
 * Une bibliotheque ne se cherche pas, elle se descend. La classification
 * decimale va du plus general au plus particulier, un chiffre a la fois, et
 * c est exactement ce que la page fait faire :
 *
 * 1. **la classe** — dix, de 000 a 900. Le tableau des cent divisions les
 *    montre toutes d un coup, avec le nombre de volumes que la maison tient
 *    dans chaque case (forme C13) ;
 * 2. **la division** — 84, litterature francaise ;
 * 3. **la section** — 843, le roman ; la ou le fonds le permet, et la page
 *    le dit quand il ne le permet pas ;
 * 4. **la cote entiere** — 843.92 VAU, et le volume est sur le rayon.
 *
 * A chaque cran, le **rayon en volume** (`BookShelf` du registre) ne garde
 * que les volumes dont la cote commence par ce qu on vient de choisir. Il
 * n est jamais le seul porteur du sens : la liste des cotes est du texte, et
 * elle reste entiere sous mouvement reduit.
 *
 * ## La mise en scene
 *
 * Fond statique — un papier teinte, aucune animation derriere le texte.
 * Signature de mouvement **M-chapitres** : une etiquette collante a gauche,
 * le contenu qui defile a droite. L appel est un **registre** ou l on inscrit
 * son nom a la suite des autres (forme A35) ; le pied est un **index
 * alphabetique** en petites capitales, par lettre (forme P21).
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import { ArrowDown, BookOpen, CornerDownRight } from '@odoro-cli/icons/outline'
import { useMemo, useState, type CSSProperties, type ReactElement } from 'react'

import { Frame } from '@/odoro/image/Frame.jsx'
import { BookShelf, type ShelfVolume } from '@/odoro/section/BookShelf.jsx'
import { SplitLines } from '@/odoro/text/SplitLines.jsx'

import { nuit } from './communs.jsx'
import {
  Actions,
  affiche,
  BarreFilet,
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
import { photo } from './media.js'
import { accent, accentDoux, aplat, encre } from './palettes.js'
import { Chapitre } from './scene.jsx'

/** La hauteur d un ecran sous les barres de la documentation. */
const ECRAN = `calc(100vh - ${String(CHROME)}px)`

/** Les rubriques de la barre. */
const NAVIGATION: readonly Lien[] = [
  ['#tableau', 'Le tableau'],
  ['#cote', 'La cote'],
  ['#maison', 'La maison'],
]

/** Le serif de titre, en 400 : Cormorant en 300 disparait sur le papier. */
function titre(corps: 'm' | 'l' | 'xl'): CSSProperties {
  return { ...affiche(corps, 400), letterSpacing: '-0.015em' }
}

/* ============================ Les dix classes ========================== */

/** Une classe de la decimale, avec ce qu elle range. */
const CLASSES = [
  { chiffre: '0', nom: 'Informatique et generalites' },
  { chiffre: '1', nom: 'Philosophie et psychologie' },
  { chiffre: '2', nom: 'Religion' },
  { chiffre: '3', nom: 'Sciences sociales' },
  { chiffre: '4', nom: 'Langues' },
  { chiffre: '5', nom: 'Sciences de la nature' },
  { chiffre: '6', nom: 'Techniques et medecine' },
  { chiffre: '7', nom: 'Arts et loisirs' },
  { chiffre: '8', nom: 'Litterature' },
  { chiffre: '9', nom: 'Histoire et geographie' },
] as const

/* ============================ Les cent divisions ======================= */

/** Une division : les deux premiers chiffres, son intitule, et le fonds tenu. */
interface Division {
  readonly cote: string
  readonly nom: string
  /** Volumes tenus par la maison sur cette division. */
  readonly volumes: number
}

/**
 * Les cent divisions de la decimale, et le fonds de la maison dans chacune.
 *
 * Les intitules sont ceux de la classification ; les nombres sont ceux du
 * recolement de janvier. Ils ne sont pas ronds, et ils ne le seront jamais.
 */
const DIVISIONS: readonly Division[] = [
  { cote: '00', nom: 'Generalites', volumes: 118 },
  { cote: '01', nom: 'Bibliographies', volumes: 64 },
  { cote: '02', nom: 'Bibliotheconomie', volumes: 212 },
  { cote: '03', nom: 'Encyclopedies', volumes: 96 },
  { cote: '04', nom: 'Fonds non attribue', volumes: 0 },
  { cote: '05', nom: 'Publications en serie', volumes: 41 },
  { cote: '06', nom: 'Associations et musees', volumes: 73 },
  { cote: '07', nom: 'Journalisme et edition', volumes: 288 },
  { cote: '08', nom: 'Recueils generaux', volumes: 35 },
  { cote: '09', nom: 'Manuscrits et livres rares', volumes: 147 },

  { cote: '10', nom: 'Philosophie', volumes: 402 },
  { cote: '11', nom: 'Metaphysique', volumes: 88 },
  { cote: '12', nom: 'Theorie de la connaissance', volumes: 131 },
  { cote: '13', nom: 'Parapsychologie', volumes: 57 },
  { cote: '14', nom: 'Ecoles philosophiques', volumes: 164 },
  { cote: '15', nom: 'Psychologie', volumes: 691 },
  { cote: '16', nom: 'Logique', volumes: 74 },
  { cote: '17', nom: 'Morale', volumes: 226 },
  { cote: '18', nom: 'Philosophie antique', volumes: 198 },
  { cote: '19', nom: 'Philosophie moderne', volumes: 377 },

  { cote: '20', nom: 'Religion', volumes: 154 },
  { cote: '21', nom: 'Philosophie de la religion', volumes: 62 },
  { cote: '22', nom: 'Bible', volumes: 183 },
  { cote: '23', nom: 'Theologie chretienne', volumes: 109 },
  { cote: '24', nom: 'Morale chretienne', volumes: 48 },
  { cote: '25', nom: 'Eglises locales', volumes: 37 },
  { cote: '26', nom: 'Theologie sociale', volumes: 55 },
  { cote: '27', nom: 'Histoire de l Eglise', volumes: 142 },
  { cote: '28', nom: 'Confessions chretiennes', volumes: 66 },
  { cote: '29', nom: 'Autres religions', volumes: 301 },

  { cote: '30', nom: 'Sciences sociales', volumes: 244 },
  { cote: '31', nom: 'Statistiques', volumes: 39 },
  { cote: '32', nom: 'Science politique', volumes: 588 },
  { cote: '33', nom: 'Economie', volumes: 476 },
  { cote: '34', nom: 'Droit', volumes: 351 },
  { cote: '35', nom: 'Administration publique', volumes: 127 },
  { cote: '36', nom: 'Problemes sociaux', volumes: 433 },
  { cote: '37', nom: 'Education', volumes: 612 },
  { cote: '38', nom: 'Commerce et transports', volumes: 158 },
  { cote: '39', nom: 'Coutumes et folklore', volumes: 269 },

  { cote: '40', nom: 'Langues', volumes: 91 },
  { cote: '41', nom: 'Linguistique', volumes: 176 },
  { cote: '42', nom: 'Anglais', volumes: 384 },
  { cote: '43', nom: 'Allemand', volumes: 142 },
  { cote: '44', nom: 'Francais', volumes: 507 },
  { cote: '45', nom: 'Italien', volumes: 88 },
  { cote: '46', nom: 'Espagnol', volumes: 133 },
  { cote: '47', nom: 'Latin', volumes: 71 },
  { cote: '48', nom: 'Grec', volumes: 46 },
  { cote: '49', nom: 'Autres langues', volumes: 214 },

  { cote: '50', nom: 'Sciences', volumes: 186 },
  { cote: '51', nom: 'Mathematiques', volumes: 329 },
  { cote: '52', nom: 'Astronomie', volumes: 208 },
  { cote: '53', nom: 'Physique', volumes: 261 },
  { cote: '54', nom: 'Chimie', volumes: 144 },
  { cote: '55', nom: 'Sciences de la terre', volumes: 237 },
  { cote: '56', nom: 'Paleontologie', volumes: 83 },
  { cote: '57', nom: 'Biologie', volumes: 311 },
  { cote: '58', nom: 'Botanique', volumes: 174 },
  { cote: '59', nom: 'Zoologie', volumes: 296 },

  { cote: '60', nom: 'Techniques', volumes: 112 },
  { cote: '61', nom: 'Medecine', volumes: 548 },
  { cote: '62', nom: 'Ingenierie', volumes: 263 },
  { cote: '63', nom: 'Agriculture', volumes: 197 },
  { cote: '64', nom: 'Economie domestique', volumes: 421 },
  { cote: '65', nom: 'Gestion', volumes: 168 },
  { cote: '66', nom: 'Chimie industrielle', volumes: 54 },
  { cote: '67', nom: 'Fabrication', volumes: 76 },
  { cote: '68', nom: 'Petits metiers', volumes: 139 },
  { cote: '69', nom: 'Batiment', volumes: 182 },

  { cote: '70', nom: 'Arts', volumes: 288 },
  { cote: '71', nom: 'Urbanisme et paysage', volumes: 119 },
  { cote: '72', nom: 'Architecture', volumes: 246 },
  { cote: '73', nom: 'Sculpture', volumes: 98 },
  { cote: '74', nom: 'Dessin et arts decoratifs', volumes: 334 },
  { cote: '75', nom: 'Peinture', volumes: 402 },
  { cote: '76', nom: 'Estampe et gravure', volumes: 87 },
  { cote: '77', nom: 'Photographie', volumes: 221 },
  { cote: '78', nom: 'Musique', volumes: 566 },
  { cote: '79', nom: 'Sports et spectacles', volumes: 358 },

  { cote: '80', nom: 'Litterature', volumes: 204 },
  { cote: '81', nom: 'Litterature americaine', volumes: 612 },
  { cote: '82', nom: 'Litterature anglaise', volumes: 738 },
  { cote: '83', nom: 'Litterature allemande', volumes: 256 },
  { cote: '84', nom: 'Litterature francaise', volumes: 2418 },
  { cote: '85', nom: 'Litterature italienne', volumes: 174 },
  { cote: '86', nom: 'Litterature espagnole', volumes: 233 },
  { cote: '87', nom: 'Litterature latine', volumes: 91 },
  { cote: '88', nom: 'Litterature grecque', volumes: 68 },
  { cote: '89', nom: 'Autres litteratures', volumes: 487 },

  { cote: '90', nom: 'Histoire', volumes: 231 },
  { cote: '91', nom: 'Geographie et voyages', volumes: 419 },
  { cote: '92', nom: 'Biographies', volumes: 674 },
  { cote: '93', nom: 'Monde ancien', volumes: 188 },
  { cote: '94', nom: 'Europe', volumes: 806 },
  { cote: '95', nom: 'Asie', volumes: 242 },
  { cote: '96', nom: 'Afrique', volumes: 157 },
  { cote: '97', nom: 'Amerique du Nord', volumes: 193 },
  { cote: '98', nom: 'Amerique du Sud', volumes: 84 },
  { cote: '99', nom: 'Oceanie', volumes: 41 },
]

/* ============================ Les sections ============================= */

/**
 * Le troisieme chiffre, la ou le fonds le justifie.
 *
 * Une bibliotheque de quartier ne pousse pas la cote a trois chiffres partout :
 * sur une division de soixante volumes, cela ferait des rayons de six livres.
 * Les divisions absentes de cette table s arretent donc a deux chiffres, et la
 * page le dit au lieu de faire semblant.
 */
const SECTIONS: Readonly<Record<string, readonly (readonly [string, string])[]>> = {
  '84': [
    ['841', 'Poesie francaise'],
    ['842', 'Theatre francais'],
    ['843', 'Roman francais'],
    ['844', 'Essai et chronique'],
    ['845', 'Discours et eloquence'],
    ['846', 'Correspondance'],
    ['847', 'Satire et humour'],
    ['848', 'Melanges et fragments'],
    ['849', 'Litterature occitane'],
  ],
  '78': [
    ['781', 'Principes generaux'],
    ['782', 'Musique vocale'],
    ['783', 'Voix seule'],
    ['784', 'Instruments et ensembles'],
    ['785', 'Musique de chambre'],
    ['786', 'Clavier'],
    ['787', 'Cordes'],
    ['788', 'Vents'],
  ],
  '94': [
    ['940', 'Europe, vue d ensemble'],
    ['941', 'Iles Britanniques'],
    ['943', 'Allemagne et Europe centrale'],
    ['944', 'France'],
    ['945', 'Italie'],
    ['946', 'Espagne et Portugal'],
    ['947', 'Europe orientale'],
    ['948', 'Scandinavie'],
  ],
  '61': [
    ['611', 'Anatomie'],
    ['612', 'Physiologie'],
    ['613', 'Hygiene et prevention'],
    ['614', 'Sante publique'],
    ['615', 'Pharmacologie'],
    ['616', 'Maladies'],
    ['617', 'Chirurgie'],
    ['618', 'Obstetrique'],
  ],
  '15': [
    ['150', 'Psychologie generale'],
    ['152', 'Perception et emotion'],
    ['153', 'Memoire et apprentissage'],
    ['155', 'Psychologie du developpement'],
    ['156', 'Psychologie comparee'],
    ['158', 'Psychologie appliquee'],
  ],
}

/* ============================ Le fonds ================================= */

/** Un volume du fonds, avec sa cote entiere. */
interface Volume {
  readonly id: string
  readonly cote: string
  readonly titre: string
  readonly auteur: string
  readonly annee: string
  readonly etat: string
  /** Dos, toile, tranche — des jetons, jamais des valeurs. */
  readonly reliure: readonly [string, string, string]
}

/** Douze volumes ecrits a la main, repartis sur la decimale. */
const FONDS: readonly Volume[] = [
  {
    id: 'chaux',
    cote: '843.92 BOU',
    titre: 'La chaux vive',
    auteur: 'Irene Bouchard',
    annee: '1994',
    etat: 'En rayon',
    reliure: ['--o-vitrine-700', '--o-vitrine-600', '--o-palette-stone-200'],
  },
  {
    id: 'ligne',
    cote: '843.92 VAU',
    titre: 'La ligne de partage',
    auteur: 'Salome Vaury',
    annee: '1988',
    etat: 'Sorti — retour le 24',
    reliure: ['--o-palette-stone-800', '--o-palette-stone-700', '--o-palette-stone-300'],
  },
  {
    id: 'silence',
    cote: '843.93 DEL',
    titre: 'Le silence des ateliers',
    auteur: 'Hugo Delaunay',
    annee: '2011',
    etat: 'En rayon',
    reliure: ['--o-vitrine-800', '--o-vitrine-700', '--o-palette-stone-200'],
  },
  {
    id: 'marees',
    cote: '841.92 ROQ',
    titre: 'Marees basses',
    auteur: 'Ines Roque',
    annee: '1976',
    etat: 'Reserve — salle de lecture',
    reliure: ['--o-palette-teal-900', '--o-palette-teal-800', '--o-palette-stone-200'],
  },
  {
    id: 'bureau',
    cote: '842.92 RIV',
    titre: 'Le bureau des courants d air',
    auteur: 'Come Riviere',
    annee: '2003',
    etat: 'En rayon',
    reliure: ['--o-palette-amber-700', '--o-palette-amber-600', '--o-palette-stone-200'],
  },
  {
    id: 'table',
    cote: '844.92 ARS',
    titre: 'Trente-deux facons de mettre la table',
    auteur: 'Jonas Arsac',
    annee: '1999',
    etat: 'En rayon',
    reliure: ['--o-palette-stone-300', '--o-palette-stone-200', '--o-palette-stone-600'],
  },
  {
    id: 'lampe',
    cote: '784.2 TOU',
    titre: 'Une lampe pour deux',
    auteur: 'Elsa Toussaint',
    annee: '1982',
    etat: 'En rayon',
    reliure: [
      '--o-palette-violet-900',
      '--o-palette-violet-800',
      '--o-palette-stone-200',
    ],
  },
  {
    id: 'orgue',
    cote: '786.5 NAD',
    titre: 'L orgue de la collegiale',
    auteur: 'Tarek Nadji',
    annee: '2018',
    etat: 'En rayon',
    reliure: ['--o-vitrine-500', '--o-vitrine-400', '--o-palette-stone-800'],
  },
  {
    id: 'quai',
    cote: '944.08 VAS',
    titre: 'Le quai, 1936-1945',
    auteur: 'Lea Vasseur',
    annee: '2007',
    etat: 'En rayon',
    reliure: ['--o-palette-sky-900', '--o-palette-sky-800', '--o-palette-stone-300'],
  },
  {
    id: 'archive',
    cote: '944.083 NAD',
    titre: 'Une archive de rien',
    auteur: 'Tarek Nadji',
    annee: '2021',
    etat: 'Sorti — retour le 18',
    reliure: [
      '--o-palette-emerald-900',
      '--o-palette-emerald-800',
      '--o-palette-stone-200',
    ],
  },
  {
    id: 'mains',
    cote: '616.8 BER',
    titre: 'Ce que font les mains',
    auteur: 'Nadia Berthaut',
    annee: '2015',
    etat: 'En rayon',
    reliure: ['--o-palette-rose-900', '--o-palette-rose-800', '--o-palette-stone-200'],
  },
  {
    id: 'memoire',
    cote: '153.12 FER',
    titre: 'La memoire des lieux ordinaires',
    auteur: 'Maud Ferrand',
    annee: '2009',
    etat: 'En rayon',
    reliure: ['--o-palette-stone-700', '--o-palette-stone-600', '--o-palette-stone-200'],
  },
]

/* ============================ Le registre (A35) ======================== */

/** Une ligne du registre, telle qu elle y est deja. */
const REGISTRE_TENU = [
  { rang: 1, nom: 'Salome Vaury', quand: '12 janvier' },
  { rang: 2, nom: 'Tarek Nadji', quand: '12 janvier' },
  { rang: 3, nom: 'Lea Vasseur', quand: '19 janvier' },
  { rang: 4, nom: 'Come Riviere', quand: '2 fevrier' },
  { rang: 5, nom: 'Nadia Berthaut', quand: '2 fevrier' },
  { rang: 6, nom: 'Hugo Delaunay', quand: '16 fevrier' },
  { rang: 7, nom: 'Ines Roque', quand: '1er mars' },
  { rang: 8, nom: 'Jonas Arsac', quand: '8 mars' },
  { rang: 9, nom: 'Elsa Toussaint', quand: '22 mars' },
  { rang: 10, nom: 'Maud Ferrand', quand: '5 avril' },
  { rang: 11, nom: 'Irene Bouchard', quand: '12 avril' },
] as const

/* ============================ L index (P21) ============================ */

/** L index alphabetique du pied, par lettre. */
const INDEX: readonly (readonly [string, string])[] = [
  ['#maison', 'Acces'],
  ['#registre', 'Atelier d ecriture'],
  ['#maison', 'Boite de retour'],
  ['#cote', 'Classification decimale'],
  ['#cote', 'Cote'],
  ['#tableau', 'Divisions'],
  ['#maison', 'Estampes'],
  ['#maison', 'Fonds ancien'],
  ['#maison', 'Gratuite'],
  ['#maison', 'Horaires'],
  ['#tableau', 'Index des classes'],
  ['#cote', 'Litterature francaise'],
  ['#maison', 'Magasin'],
  ['#maison', 'Navette entre annexes'],
  ['#registre', 'Numero de lecteur'],
  ['#cote', 'Ouvrages de reference'],
  ['#maison', 'Photocopies'],
  ['#cote', 'Prolongation'],
  ['#maison', 'Quotidiens'],
  ['#cote', 'Rayon 800'],
  ['#maison', 'Recolement'],
  ['#registre', 'S inscrire'],
  ['#maison', 'Salle de lecture'],
  ['#cote', 'Sections'],
  ['#maison', 'Table de presse'],
  ['#registre', 'Usuels'],
  ['#haut', 'Ville de Nantes'],
]

/** L index, groupe par lettre initiale. */
function parLettre(): readonly (readonly [
  string,
  readonly (readonly [string, string])[],
])[] {
  const paquets = new Map<string, (readonly [string, string])[]>()
  for (const entree of INDEX) {
    const lettre = (entree[1][0] ?? '?').toUpperCase()
    const deja = paquets.get(lettre)
    if (deja === undefined) paquets.set(lettre, [entree])
    else deja.push(entree)
  }
  return [...paquets.entries()]
}

/**
 * La premiere section d une division qui tienne vraiment quelque chose.
 *
 * Ouvrir sur une section vide serait exact et decourageant : la maison range
 * a trois chiffres bien au-dela de ce qu elle montre ici. On ouvre donc la ou
 * il y a des volumes, et on laisse le visiteur descendre ailleurs.
 */
function premiereSection(division: string): string | null {
  const liste = SECTIONS[division]
  if (liste === undefined) return null
  const pleine = liste.find(([code]) => FONDS.some((v) => v.cote.startsWith(code)))
  return pleine?.[0] ?? liste[0]?.[0] ?? null
}

/** Un cran du fil d Ariane : un chiffre descendu, et de quoi y revenir. */
interface Cran {
  readonly code: string
  readonly nom: string
  readonly remonter: () => void
}

/* ============================ La page ================================== */

export default function Page(): ReactElement {
  const polices = usePolices('cormorant')

  // La cote se descend chiffre a chiffre : la classe, puis la division, puis
  // la section quand le fonds la justifie.
  const [classe, setClasse] = useState('8')
  const [division, setDivision] = useState<string | null>('84')
  const [section, setSection] = useState<string | null>('843')

  const [nom, setNom] = useState('')
  const [inscrits, setInscrits] = useState<
    readonly { rang: number; nom: string; quand: string }[]
  >([])

  /** Ce qu on a choisi, ecrit comme une cote. */
  const cote = section ?? division ?? classe

  const divisionsDeLaClasse = useMemo(
    () => DIVISIONS.filter((d) => d.cote.startsWith(classe)),
    [classe],
  )
  const sectionsDeLaDivision = division === null ? undefined : SECTIONS[division]

  /** Le fonds dont la cote commence par ce qu on a choisi. */
  const tenus = useMemo(() => FONDS.filter((v) => v.cote.startsWith(cote)), [cote])

  /** Le rayon : les volumes retenus, ranges par deux planches de six. */
  const rayon: readonly ShelfVolume[] = useMemo(
    () =>
      tenus.map((v, rang) => ({
        id: v.id,
        title: v.titre,
        shelf: Math.floor(rang / 6),
        slot: rang % 6,
        spine: v.reliure[0],
        cloth: v.reliure[1],
        edge: v.reliure[2],
      })),
    [tenus],
  )

  const [tire, setTire] = useState<string | null>(null)
  const ouvert =
    tire !== null && tenus.some((v) => v.id === tire) ? tire : (tenus[0]?.id ?? null)
  const volume = FONDS.find((v) => v.id === ouvert)

  const laDivision = DIVISIONS.find((d) => d.cote === division)
  const laClasse = CLASSES.find((c) => c.chiffre === classe)

  // Le fil d Ariane de la cote : un cran par chiffre descendu, chacun
  // capable de remonter a lui-meme.
  const fil: readonly Cran[] = [
    {
      code: `${classe}00`,
      nom: laClasse?.nom ?? '',
      remonter: () => {
        setDivision(null)
        setSection(null)
        setTire(null)
      },
    },
    ...(division === null
      ? []
      : [
          {
            code: `${division}0`,
            nom: laDivision?.nom ?? '',
            remonter: () => {
              setSection(null)
              setTire(null)
            },
          },
        ]),
    ...(section === null
      ? []
      : [
          {
            code: section,
            nom: sectionsDeLaDivision?.find(([c]) => c === section)?.[1] ?? '',
            remonter: () => undefined,
          },
        ]),
  ]

  /** Inscrire un nom a la suite du registre. */
  const inscrire = (): void => {
    const propre = nom.trim()
    if (propre === '') return
    setInscrits((precedents) => [
      ...precedents,
      {
        rang: REGISTRE_TENU.length + precedents.length + 1,
        nom: propre,
        quand: 'aujourd hui',
      },
    ])
    setNom('')
  }

  return (
    <Porte forme="compteur" marque="Rayon 800" sombre={false}>
      <div
        className="o-relative"
        style={{ ...polices, backgroundColor: accentDoux(100, 10) }}
      >
        {/*
          ----- L ouverture : du papier, une cote en filigrane ------------------
        */}
        <section
          id="haut"
          className="o-relative o-flex o-flex-col o-overflow-hidden"
          style={{ minHeight: ECRAN }}
        >
          <BarreFilet
            marque="Rayon 800"
            liens={NAVIGATION}
            action={['#registre', 'S inscrire']}
            sombre={false}
          />

          {/* La cote, posee en enorme derriere le titre. */}
          <span
            aria-hidden="true"
            className="o-pointer-events-none o-absolute o-right-0 o-select-none o-whitespace-nowrap o-font-mono o-tabular-nums"
            style={{
              top: '22%',
              fontSize: 'min(34vw, 460px)',
              lineHeight: 1,
              // Une encre transparente, et non un melange avec le fond : le
              // filigrane suit alors la bande sur laquelle il tombe, et il reste
              // ce qu il est — un fantome, pas un texte.
              color: `color-mix(in oklab, ${accent(500)} 22%, transparent)`,
            }}
          >
            843.92
          </span>

          <div className="o-relative o-z-10 o-mx-auto o-flex o-w-full o-max-w-7xl o-grow o-flex-col o-justify-center o-px-6 o-pb-24 o-pt-10 md:o-px-10">
            <Surgit>
              <Etiquette sombre={false}>
                Bibliotheque municipale — ouverte du mardi au samedi, gratuite
              </Etiquette>
            </Surgit>
            <TitreVague
              delai={140}
              cadence={80}
              className="o-m-0 o-mt-8 o-max-w-4xl o-text-teal-950 dark:o-text-teal-50"
              style={{
                ...titre('l'),
                fontSize: 'clamp(2.5rem, 8vw, 8rem)',
                lineHeight: 0.94,
              }}
            >
              Rien n est cache. Tout est range.
            </TitreVague>
            <Surgit
              delai={600}
              as="p"
              className="o-m-0 o-mt-9 o-max-w-lg o-text-lg o-leading-relaxed o-text-stone-700 dark:o-text-stone-300"
            >
              Cent divisions, quatre-vingt-onze mille volumes, et une cote qui se descend
              chiffre a chiffre. Suivez-la : les rayons se deplient.
            </Surgit>
            <Surgit delai={740} className="o-mt-9">
              <Actions
                pleine={[
                  '#tableau',
                  <>
                    Ouvrir le tableau{' '}
                    <Icon icon={ArrowDown} size={16} aria-hidden="true" />
                  </>,
                ]}
                fantome={['#maison', 'Horaires et acces']}
                sombre={false}
              />
            </Surgit>
          </div>

          <div className="o-hidden md:o-block">
            <Coin position="bd" sombre={false}>
              Salle de lecture au premier
              <br />
              Magasin sur demande, sous une heure
            </Coin>
          </div>
        </section>

        {/*
          ----- Chapitre 01 : le tableau des cent divisions (C13) ---------------
        */}
        <section
          id="tableau"
          className="o-scroll-mt-24 o-border-t o-px-6 o-py-20 md:o-px-10 md:o-py-28"
          style={{ borderColor: 'var(--o-theme-line)' }}
        >
          <div className="o-mx-auto o-max-w-7xl">
            <Chapitre
              indice="(01) — Le tableau"
              largeur={3}
              titre={
                <h2
                  className="o-m-0 o-max-w-xs o-text-balance o-text-teal-950 dark:o-text-teal-50"
                  style={{ ...titre('m'), fontSize: 'clamp(1.75rem, 3.4vw, 3rem)' }}
                >
                  Cent cases, et ce que chacune tient
                </h2>
              }
              texte={
                <p className="o-m-0 o-text-stone-700 dark:o-text-stone-300">
                  Dix classes en lignes, dix divisions en colonnes. Le nombre sous chaque
                  case est le fonds reel au recolement de janvier. Cliquez une case : la
                  cote se descend.
                </p>
              }
            >
              {/* Le tableau se lit large : sous 1 000 px il se parcourt de cote. */}
              <div className="o-overflow-x-auto" style={{ overflowY: 'hidden' }}>
                <table
                  className="o-w-full o-text-left"
                  style={{ minWidth: 720, borderCollapse: 'separate', borderSpacing: 3 }}
                >
                  <caption className="o-sr-only">
                    Les cent divisions de la classification decimale, et le fonds tenu
                    dans chacune
                  </caption>
                  <tbody>
                    {CLASSES.map((c) => (
                      <tr key={c.chiffre}>
                        <th
                          scope="row"
                          className="o-w-px o-whitespace-nowrap o-pr-4 o-align-middle o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-300"
                        >
                          <span
                            className="o-block o-tabular-nums"
                            style={{ color: encre() }}
                          >
                            {c.chiffre}00
                          </span>
                          <span
                            className="o-mt-1 o-hidden o-normal-case lg:o-block"
                            style={{ letterSpacing: 0, maxWidth: '9rem' }}
                          >
                            {c.nom}
                          </span>
                        </th>
                        {DIVISIONS.filter((d) => d.cote.startsWith(c.chiffre)).map(
                          (d) => {
                            const prise = d.cote === division
                            const vide = d.volumes === 0
                            return (
                              <td key={d.cote} className="o-p-0">
                                <button
                                  type="button"
                                  aria-pressed={prise}
                                  disabled={vide}
                                  onClick={() => {
                                    setClasse(c.chiffre)
                                    setDivision(d.cote)
                                    setSection(premiereSection(d.cote))
                                    setTire(null)
                                  }}
                                  className={`o-flex o-h-16 o-w-full o-flex-col o-justify-between o-border-w-1 o-p-1.5 o-text-left o-transition-colors focus:o-ring ${vide ? '' : 'o-cursor-pointer'}`}
                                  style={
                                    prise
                                      ? { ...aplat(), borderColor: 'transparent' }
                                      : {
                                          borderColor: 'var(--o-theme-line)',
                                          backgroundColor: vide
                                            ? 'transparent'
                                            : accentDoux(
                                                300,
                                                8 +
                                                  Math.min(
                                                    26,
                                                    Math.round(d.volumes / 32),
                                                  ),
                                              ),
                                          color: vide
                                            ? 'var(--o-theme-muted)'
                                            : 'var(--o-theme-fg)',
                                        }
                                  }
                                  title={`${d.cote}0 — ${d.nom}`}
                                >
                                  <span className="o-font-mono o-text-xs o-tabular-nums o-opacity-80">
                                    {d.cote}0
                                  </span>
                                  <span
                                    className="o-truncate o-text-xs o-leading-tight"
                                    style={{ fontSize: '0.66rem' }}
                                  >
                                    {d.nom}
                                  </span>
                                  <span className="o-font-mono o-text-xs o-font-semibold o-tabular-nums">
                                    {vide ? '—' : d.volumes}
                                  </span>
                                </button>
                              </td>
                            )
                          },
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="o-m-0 o-mt-5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-300">
                La case 040 est vide depuis 1989 : la classification l a laissee libre, et
                nous ne l avons jamais remplie.
              </p>
            </Chapitre>
          </div>
        </section>

        {/*
          ----- Chapitre 02 : le mecanisme, la cote ----------------------------
        */}
        <section
          id="cote"
          className="o-scroll-mt-24 o-border-t o-px-6 o-py-20 md:o-px-10 md:o-py-28"
          style={{
            borderColor: 'var(--o-theme-line)',
            backgroundColor: accentDoux(200, 12),
          }}
        >
          <div className="o-mx-auto o-max-w-7xl">
            <Chapitre
              indice="(02) — La cote"
              largeur={3}
              titre={
                <h2
                  className="o-m-0 o-max-w-xs o-text-balance o-text-teal-950 dark:o-text-teal-50"
                  style={{ ...titre('m'), fontSize: 'clamp(1.75rem, 3.4vw, 3rem)' }}
                >
                  Du general au particulier
                </h2>
              }
              texte={
                <p className="o-m-0 o-text-stone-700 dark:o-text-stone-300">
                  Un chiffre de plus, un rayon de moins. Le meuble ne garde que ce qui
                  commence par la cote courante, et la liste reste lisible sans lui.
                </p>
              }
            >
              {/* Le fil d Ariane de la cote. */}
              <ol className="o-m-0 o-flex o-list-none o-flex-wrap o-items-center o-gap-2 o-p-0 o-font-mono o-text-sm o-tabular-nums">
                {fil.map((cran, rang) => (
                  <li key={cran.code} className="o-flex o-items-center o-gap-2">
                    {rang > 0 && (
                      <Icon
                        icon={CornerDownRight}
                        size={14}
                        aria-hidden="true"
                        style={{ color: encre() }}
                      />
                    )}
                    <button
                      type="button"
                      onClick={cran.remonter}
                      className="o-cursor-pointer o-border-w-1 o-bg-transparent o-px-3 o-py-1.5 o-text-sm o-transition-colors focus:o-ring"
                      style={{
                        borderColor: 'var(--o-theme-line)',
                        color: 'var(--o-theme-fg)',
                      }}
                    >
                      <span className="o-font-semibold">{cran.code}</span>
                      <span className="o-ml-2 o-opacity-70">{cran.nom}</span>
                    </button>
                  </li>
                ))}
              </ol>

              {/* Les divisions de la classe, puis les sections de la division. */}
              <div className="o-mt-10 o-grid o-gap-10 lg:o-grid-cols-12">
                <div className="o-min-w-0 lg:o-col-span-7">
                  <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-300">
                    Les dix divisions de la classe {classe}00
                  </p>
                  <ul className="o-m-0 o-mt-4 o-flex o-list-none o-flex-wrap o-gap-2 o-p-0">
                    {divisionsDeLaClasse.map((d) => {
                      const prise = d.cote === division
                      return (
                        <li key={d.cote}>
                          <button
                            type="button"
                            aria-pressed={prise}
                            disabled={d.volumes === 0}
                            onClick={() => {
                              setDivision(d.cote)
                              setSection(premiereSection(d.cote))
                              setTire(null)
                            }}
                            className="o-cursor-pointer o-border-w-1 o-px-3 o-py-2 o-text-sm o-transition-colors focus:o-ring"
                            style={
                              prise
                                ? { ...aplat(), borderColor: 'transparent' }
                                : {
                                    borderColor: 'var(--o-theme-line)',
                                    color:
                                      d.volumes === 0
                                        ? 'var(--o-theme-muted)'
                                        : 'var(--o-theme-fg)',
                                    backgroundColor: 'transparent',
                                  }
                            }
                          >
                            <span className="o-font-mono o-tabular-nums">{d.cote}0</span>
                            <span className="o-ml-2">{d.nom}</span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>

                  <div
                    className="o-mt-10 o-border-t o-pt-8"
                    style={{ borderColor: 'var(--o-theme-line)' }}
                  >
                    <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-300">
                      Le troisieme chiffre
                    </p>
                    {sectionsDeLaDivision === undefined ? (
                      <p className="o-m-0 o-mt-4 o-max-w-lg o-text-base o-leading-relaxed o-text-stone-700 dark:o-text-stone-300">
                        A cette division, la cote s arrete a deux chiffres. Le fonds tenu
                        ne justifie pas de la pousser : on ferait des rayons de six
                        volumes, et personne ne les trouverait.
                      </p>
                    ) : (
                      <ul className="o-m-0 o-mt-4 o-flex o-list-none o-flex-wrap o-gap-2 o-p-0">
                        {sectionsDeLaDivision.map(([code, nomCourt]) => {
                          const prise = code === section
                          return (
                            <li key={code}>
                              <button
                                type="button"
                                aria-pressed={prise}
                                onClick={() => {
                                  setSection(code)
                                  setTire(null)
                                }}
                                className="o-cursor-pointer o-rounded-full o-border-w-1 o-px-4 o-py-1.5 o-text-sm o-transition-colors focus:o-ring"
                                style={
                                  prise
                                    ? { ...aplat(), borderColor: 'transparent' }
                                    : {
                                        borderColor: 'var(--o-theme-line)',
                                        color: 'var(--o-theme-fg)',
                                        backgroundColor: 'transparent',
                                      }
                                }
                              >
                                <span className="o-font-mono o-tabular-nums">{code}</span>
                                <span className="o-ml-2">{nomCourt}</span>
                              </button>
                            </li>
                          )
                        })}
                      </ul>
                    )}
                  </div>

                  {/* Les volumes retenus, en toutes lettres. */}
                  <div className="o-mt-12">
                    <p
                      aria-live="polite"
                      className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-300"
                    >
                      {tenus.length === 0
                        ? `Aucun volume cote ${cote} dans le fonds montre ici`
                        : `${String(tenus.length)} volume${tenus.length > 1 ? 's' : ''} dont la cote commence par ${cote}`}
                    </p>
                    <ol
                      className="o-m-0 o-mt-5 o-list-none o-border-t o-p-0"
                      style={{ borderColor: 'var(--o-theme-line)' }}
                    >
                      {tenus.map((v) => (
                        <li
                          key={v.id}
                          className="o-border-b"
                          style={{ borderColor: 'var(--o-theme-line)' }}
                        >
                          <button
                            type="button"
                            aria-pressed={v.id === ouvert}
                            onClick={() => {
                              setTire(v.id)
                            }}
                            className="o-grid o-w-full o-cursor-pointer o-gap-2 o-bg-transparent o-px-0 o-py-5 o-text-left o-transition-opacity hover:o-opacity-70 focus:o-ring md:o-grid-cols-12 md:o-gap-6"
                          >
                            <span
                              className="o-font-mono o-text-sm o-tabular-nums md:o-col-span-3"
                              style={{ color: encre() }}
                            >
                              {v.cote}
                            </span>
                            <span className="md:o-col-span-6">
                              <span
                                className="o-block o-text-lg o-text-teal-950 dark:o-text-teal-50"
                                style={{
                                  ...titre('m'),
                                  fontSize: 'clamp(1.1rem, 1.8vw, 1.45rem)',
                                  lineHeight: 1.15,
                                }}
                              >
                                {v.titre}
                              </span>
                              <span className="o-mt-1 o-block o-text-sm o-text-stone-600 dark:o-text-stone-400">
                                {v.auteur} — {v.annee}
                              </span>
                            </span>
                            <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-300 md:o-col-span-3 md:o-text-right">
                              {v.etat}
                            </span>
                          </button>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>

                {/* Le rayon en volume, et le volume tire. */}
                <div className="o-min-w-0 lg:o-col-span-5">
                  <div className="lg:o-sticky" style={{ top: CHROME + 32 }}>
                    {/*
                      La cle porte la cote : le meuble construit sa scene au
                      montage et ne la refait pas quand la liste change. Sans
                      elle, le rayon garderait les volumes du cran precedent
                      et contredirait la liste ci-contre.
                    */}
                    <BookShelf
                      key={cote}
                      volumes={rayon}
                      selected={ouvert}
                      onSelect={setTire}
                      colors={['--o-palette-stone-500', '--o-palette-stone-800']}
                      poster="o-bg-gradient-to-b o-from-stone-300 o-to-stone-600 dark:o-from-stone-700 dark:o-to-stone-950"
                      className="o-w-full o-overflow-hidden"
                      style={{ height: 300 }}
                    />
                    <p className="o-m-0 o-mt-4 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-stone-600 dark:o-text-stone-300">
                      Le meuble se tourne au glissement. Il ne garde que la cote courante
                      ; sous mouvement reduit il se replie, et la liste ci-contre reste
                      entiere.
                    </p>

                    {volume !== undefined && (
                      <div
                        className="o-mt-8 o-border-w-1 o-p-6"
                        style={{ borderColor: encre() }}
                      >
                        <p
                          className="o-m-0 o-font-mono o-text-sm o-tabular-nums"
                          style={{ color: encre() }}
                        >
                          {volume.cote}
                        </p>
                        <h3
                          className="o-m-0 o-mt-3 o-text-teal-950 dark:o-text-teal-50"
                          style={{
                            ...titre('m'),
                            fontSize: 'clamp(1.25rem, 2.2vw, 1.75rem)',
                            lineHeight: 1.1,
                          }}
                        >
                          {volume.titre}
                        </h3>
                        <dl className="o-m-0 o-mt-5 o-flex o-flex-col o-gap-2 o-text-sm">
                          {(
                            [
                              ['Auteur', volume.auteur],
                              ['Annee', volume.annee],
                              ['Etat', volume.etat],
                            ] as const
                          ).map(([quoi, valeur]) => (
                            <div
                              key={quoi}
                              className="o-flex o-items-baseline o-justify-between o-gap-4 o-border-b o-pb-2"
                              style={{ borderColor: 'var(--o-theme-line)' }}
                            >
                              <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-300">
                                {quoi}
                              </dt>
                              <dd className="o-m-0 o-text-right o-text-stone-900 dark:o-text-stone-100">
                                {valeur}
                              </dd>
                            </div>
                          ))}
                        </dl>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Chapitre>
          </div>
        </section>

        {/*
          ----- La coupe sombre : un ecran de texte seul ------------------------
        */}
        <section
          className="o-flex o-items-center o-px-6 o-py-24 md:o-px-10 md:o-py-36"
          style={nuit('stone')}
        >
          <div className="o-mx-auto o-w-full o-max-w-7xl">
            <Manifeste eteint="Une bibliotheque ne vous recommande rien.">
              Elle range, elle ouvre a neuf heures, et elle vous laisse vous perdre entre
              deux chiffres.
            </Manifeste>
            <SplitLines
              as="p"
              stagger={110}
              className="o-m-0 o-mt-10 o-max-w-2xl o-text-base o-leading-relaxed o-text-stone-300"
            >
              C est la difference entre un algorithme et une cote : l un vous ramene ou
              vous etiez deja, l autre vous pose devant deux cent dix-huit volumes que
              vous ne cherchiez pas.
            </SplitLines>
          </div>
        </section>

        {/*
          ----- La maison : la salle, en photographie ---------------------------
        */}
        <section
          id="maison"
          className="o-scroll-mt-24 o-px-6 o-py-20 md:o-px-10 md:o-py-28"
        >
          <div className="o-mx-auto o-max-w-7xl">
            <Indice rang="03" sombre={false}>
              La maison
            </Indice>
            <h2
              className="o-m-0 o-mt-5 o-max-w-3xl o-text-teal-950 dark:o-text-teal-50"
              style={{ ...titre('m'), fontSize: 'clamp(1.9rem, 4vw, 3.75rem)' }}
            >
              Quatre cents places assises, et personne ne vous demandera pourquoi vous
              etes la.
            </h2>

            <div className="o-mt-14 o-grid o-gap-12 lg:o-grid-cols-12 lg:o-items-end">
              {/* La photographie deborde d une colonne sur l autre. */}
              <figure className="o-m-0 lg:o-col-span-8">
                <Frame
                  src={photo('sillon-mediatheque', 1200, 800)}
                  alt="La grande salle de lecture, ses tables et ses lampes"
                  ratio={1200 / 750}
                  zoom={0.05}
                  className="o-w-full"
                />
                <figcaption className="o-mt-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-300">
                  La grande salle — cent quatre-vingts lampes, une par place
                </figcaption>
              </figure>

              <dl className="o-m-0 lg:o-col-span-4">
                {(
                  [
                    [
                      'Horaires',
                      'Mardi au vendredi, 10 h — 19 h. Samedi, 10 h — 18 h. Ferme le lundi et le dimanche.',
                    ],
                    [
                      'Inscription',
                      'Gratuite pour tous, sans condition de residence. Une piece d identite suffit.',
                    ],
                    [
                      'Pret',
                      'Vingt documents, quatre semaines, prolongeable deux fois depuis chez vous.',
                    ],
                    [
                      'Magasin',
                      'Un tiers du fonds est en magasin. Demande au bureau, communication sous une heure.',
                    ],
                    [
                      'Retour',
                      'Boite a l exterieur, ouverte jour et nuit, videe a huit heures.',
                    ],
                  ] as const
                ).map(([quoi, valeur]) => (
                  <div
                    key={quoi}
                    className="o-border-t o-py-4"
                    style={{ borderColor: 'var(--o-theme-line)' }}
                  >
                    <dt
                      className="o-font-mono o-text-xs o-uppercase o-tracking-widest"
                      style={{ color: encre() }}
                    >
                      {quoi}
                    </dt>
                    <dd className="o-m-0 o-mt-2 o-text-sm o-leading-relaxed o-text-stone-700 dark:o-text-stone-300">
                      {valeur}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/*
          ----- L appel : le registre (A35) -------------------------------------
        */}
        <section
          id="registre"
          className="o-scroll-mt-24 o-border-t o-px-6 o-py-20 md:o-px-10 md:o-py-28"
          style={{
            borderColor: 'var(--o-theme-line)',
            backgroundColor: accentDoux(200, 14),
          }}
        >
          <div className="o-mx-auto o-grid o-max-w-7xl o-gap-12 lg:o-grid-cols-12">
            <div className="lg:o-col-span-5">
              <Indice rang="04" sombre={false}>
                Le registre
              </Indice>
              <h2
                className="o-m-0 o-mt-5 o-max-w-sm o-text-teal-950 dark:o-text-teal-50"
                style={{ ...titre('m'), fontSize: 'clamp(1.75rem, 3.4vw, 3rem)' }}
              >
                L atelier d ecriture du jeudi
              </h2>
              <p className="o-m-0 o-mt-6 o-max-w-sm o-text-base o-leading-relaxed o-text-stone-700 dark:o-text-stone-300">
                Deux heures, tous les quinze jours, en salle 2. Il n y a ni niveau, ni
                inscription payante, ni engagement : on ecrit son nom a la suite des
                autres, et on vient.
              </p>

              <div className="o-mt-10">
                <label
                  htmlFor="registre-nom"
                  className="o-block o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-300"
                >
                  Votre nom, a la suite
                </label>
                <div className="o-mt-3 o-flex o-flex-wrap o-gap-3">
                  <input
                    id="registre-nom"
                    type="text"
                    value={nom}
                    onChange={(evenement) => {
                      setNom(evenement.target.value)
                    }}
                    onKeyDown={(evenement) => {
                      if (evenement.key === 'Enter') {
                        evenement.preventDefault()
                        inscrire()
                      }
                    }}
                    placeholder="Prenom et nom"
                    className="o-min-w-0 o-grow o-border-w-1 o-bg-transparent o-px-4 o-py-3 o-text-base focus:o-ring"
                    style={{
                      borderColor: 'var(--o-theme-line)',
                      color: 'var(--o-theme-fg)',
                    }}
                  />
                  <button
                    type="button"
                    onClick={inscrire}
                    className="o-inline-flex o-cursor-pointer o-items-center o-gap-2 o-border-w-0 o-px-6 o-py-3 o-text-sm o-font-semibold o-transition-transform hover:o-scale-105 focus:o-ring"
                    style={aplat()}
                  >
                    Signer le registre
                    <Icon icon={BookOpen} size={16} aria-hidden="true" />
                  </button>
                </div>
                <p className="o-m-0 o-mt-3 o-text-xs o-leading-relaxed o-text-stone-600 dark:o-text-stone-400">
                  Rien n est envoye nulle part : le registre vit dans cette page, comme le
                  cahier vit sur le bureau de la salle 2.
                </p>
              </div>
            </div>

            {/* Le cahier lui-meme. */}
            <div className="lg:o-col-span-7">
              <div
                className="o-p-8 md:o-p-10"
                style={{
                  backgroundColor: 'var(--o-theme-bg)',
                  backgroundImage: `repeating-linear-gradient(to bottom, transparent 0, transparent 35px, ${accentDoux(700, 16)} 35px, ${accentDoux(700, 16)} 36px)`,
                  boxShadow: '0 24px 60px -48px rgba(0,0,0,0.6)',
                }}
              >
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-300">
                  Atelier d ecriture — cahier de la salle 2
                </p>
                <ol aria-live="polite" className="o-m-0 o-mt-6 o-list-none o-p-0">
                  {[...REGISTRE_TENU, ...inscrits].map((ligne) => (
                    <li
                      key={`${String(ligne.rang)}-${ligne.nom}`}
                      className="o-flex o-items-baseline o-gap-5"
                      style={{ height: 36 }}
                    >
                      <span className="o-w-6 o-shrink-0 o-text-right o-font-mono o-text-xs o-tabular-nums o-text-stone-500 dark:o-text-stone-400">
                        {ligne.rang}
                      </span>
                      <span
                        className="o-grow o-text-lg o-italic o-text-stone-900 dark:o-text-stone-100"
                        style={{
                          fontFamily: 'var(--o-vitrine-affichage, var(--o-font-serif))',
                        }}
                      >
                        {ligne.nom}
                      </span>
                      <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                        {ligne.quand}
                      </span>
                    </li>
                  ))}
                </ol>
                {inscrits.length === 0 && (
                  <p className="o-m-0 o-mt-6 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-500 dark:o-text-stone-400">
                    Douzieme ligne libre
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/*
          ----- Le pied : l index alphabetique, par lettre (P21) ----------------
        */}
        <footer
          className="o-border-t o-px-6 o-py-16 md:o-px-10"
          style={{ borderColor: 'var(--o-theme-line)' }}
        >
          <div className="o-mx-auto o-max-w-7xl">
            <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-300">
              Index
            </p>

            <div className="o-mt-8" style={{ columnWidth: '17rem', columnGap: '3rem' }}>
              {parLettre().map(([lettre, entrees]) => (
                <div key={lettre} className="o-mb-6" style={{ breakInside: 'avoid' }}>
                  <p
                    className="o-m-0 o-border-b o-pb-1 o-text-sm o-uppercase o-tracking-widest"
                    style={{
                      borderColor: 'var(--o-theme-line)',
                      color: encre(),
                      fontVariantCaps: 'small-caps',
                    }}
                  >
                    {lettre}
                  </p>
                  <ul className="o-m-0 o-mt-2 o-flex o-list-none o-flex-col o-gap-1.5 o-p-0">
                    {entrees.map(([cible, mot]) => (
                      <li key={mot}>
                        <a
                          href={cible}
                          className="o-text-sm o-uppercase o-tracking-wide o-text-stone-700 o-no-underline o-transition-colors hover:o-text-teal-900 focus:o-ring dark:o-text-stone-300 dark:hover:o-text-teal-100"
                          style={{
                            fontSize: '0.78rem',
                            fontVariantCaps: 'small-caps',
                            textTransform: 'lowercase',
                          }}
                        >
                          {mot}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            <p
              className="o-m-0 o-mt-12 o-flex o-flex-wrap o-items-center o-justify-between o-gap-4 o-border-t o-pt-6 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-stone-600 dark:o-text-stone-300"
              style={{ borderColor: 'var(--o-theme-line)' }}
            >
              <span>
                © 2026 Rayon 800 — bibliotheque municipale, 7 place du Bouffay, 44000
                Nantes
              </span>
              <a
                href="#haut"
                className="o-text-stone-600 o-no-underline hover:o-text-teal-900 focus:o-ring dark:o-text-stone-300 dark:hover:o-text-teal-100"
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
