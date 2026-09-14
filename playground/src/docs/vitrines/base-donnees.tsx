/**
 * Socle — base de donnees relationnelle.
 *
 * ## La reference : Vesper (GetLayers)
 *
 * Un noir profond, un HUD, une encre froide, des filets a un pixel et des
 * metadonnees en mono a chaque coin. Vesper fait une console ; ici la console
 * a une raison d etre, parce que le produit **est** une console.
 *
 * ## Le mecanisme : la requete
 *
 * On compose une requete — un filtre, un index, une jointure, un tri, une
 * limite — et le **plan d execution se dessine**, noeud par noeud, avec ses
 * couts et ses lignes estimees. Chaque noeud du plan est cliquable, a la
 * souris, au doigt et au clavier, et porte son nom accessible.
 *
 * Le modele de cout est celui d un planificateur ordinaire, reduit a ce qu il
 * faut pour etre juste : cout de page sequentielle a 1, page aleatoire a 4,
 * ligne a 0,01, operateur a 0,0025. C est assez pour que la page montre ce
 * qu aucune brochure ne montre — **qu un index n est pas toujours employe**.
 * Filtrez sur `pays = 'FR'`, qui rend six lignes sur dix : l index existe, et
 * le planificateur prend quand meme le parcours sequentiel, parce qu il coute
 * moins cher. C est la lecon de la page, et elle se demontre en deux clics.
 *
 * ## Une seule surface graphique
 *
 * Le flux de donnees de l ouverture est un shader ; tout le reste — le plan,
 * les barres, le schema — est dessine en SVG ou compose avec le registre.
 *
 * @module
 */

import { Icon } from '@odoro-cli/icons'
import { ArrowRight } from '@odoro-cli/icons/filaire'
import { Reveal } from '@odoro-cli/libs/motion'
import {
  useEffect,
  useMemo,
  useState,
  type KeyboardEvent,
  type ReactElement,
} from 'react'

import { DataStream } from '@/odoro/background/DataStream.jsx'
import { Changelog } from '@/odoro/section/Changelog.jsx'
import { Typewriter } from '@/odoro/text/Typewriter.jsx'
import { TreeView } from '@/odoro/ui/TreeView.jsx'

import { nuit } from './communs.jsx'
import { accent, accentDoux, encreSurSombre } from './palettes.js'
import {
  Actions,
  affiche,
  BarreCoins,
  CHROME,
  Coin,
  Etiquette,
  Grain,
  Indice,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
} from './marche.jsx'
import { Chapitre } from './scene.jsx'

/* ============================ Le modele de cout ======================== */

/**
 * Les constantes du planificateur.
 *
 * Ce sont celles d un moteur relationnel ordinaire, laissees a leur valeur par
 * defaut. Les changer changerait les plans — c est justement le sujet.
 */
const PAGE_SEQ = 1
const PAGE_ALEATOIRE = 4
const LIGNE = 0.01
const LIGNE_INDEX = 0.005
const OPERATEUR = 0.0025

/** Une table de la base de demonstration. */
interface Table {
  readonly nom: string
  readonly lignes: number
  readonly pages: number
}

const COMMANDES: Table = { nom: 'commandes', lignes: 2_400_000, pages: 26_000 }
const CLIENTS: Table = { nom: 'clients', lignes: 180_000, pages: 2_400 }

/** Un filtre possible, avec sa selectivite mesuree sur les statistiques. */
interface Filtre {
  readonly cle: string
  readonly sql: string
  readonly colonne: string
  readonly selectivite: number
  readonly mot: string
}

const FILTRES: readonly Filtre[] = [
  {
    cle: 'recent',
    mot: 'Sept derniers jours',
    colonne: 'cree_le',
    sql: "cree_le >= now() - interval '7 days'",
    selectivite: 0.012,
  },
  {
    cle: 'gros',
    mot: 'Panier au-dessus de 500',
    colonne: 'total_ttc',
    sql: 'total_ttc > 500',
    selectivite: 0.07,
  },
  {
    cle: 'expediee',
    mot: 'Deja expediees',
    colonne: 'statut',
    sql: "statut = 'expediee'",
    selectivite: 0.34,
  },
  {
    cle: 'france',
    mot: 'Livrees en France',
    colonne: 'pays',
    sql: "pays = 'FR'",
    selectivite: 0.62,
  },
]

/** L etat de la requete composee. */
interface Requete {
  readonly filtre: Filtre
  readonly index: boolean
  readonly jointure: boolean
  readonly tri: boolean
  readonly limite: boolean
}

/** Un noeud du plan d execution. */
interface Noeud {
  readonly cle: string
  readonly nom: string
  /** Le detail, ligne a ligne, tel qu un `EXPLAIN` le rendrait. */
  readonly detail: readonly (readonly [string, string])[]
  readonly cout: number
  readonly lignes: number
  /** Ce que ce noeud coute vraiment, et pourquoi. */
  readonly note: string
  /** Les enfants, du plus a gauche au plus a droite. */
  readonly enfants: readonly Noeud[]
}

/** Un nombre a la francaise, avec ses espaces de milliers. */
function nombre(valeur: number): string {
  return Math.round(valeur)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}

/** Un nombre abrege, pour tenir dans une boite : 1,5 M, 288 k, 42. */
function court(valeur: number): string {
  if (valeur >= 1_000_000) return `${(valeur / 1_000_000).toFixed(1).replace('.', ',')} M`
  if (valeur >= 10_000) return `${String(Math.round(valeur / 1000))} k`
  return nombre(valeur)
}

/** Un cout, comme le rend un plan : deux decimales. */
function cout(valeur: number): string {
  const [entier, decimales] = valeur.toFixed(2).split('.')
  return `${nombre(Number(entier ?? 0))},${decimales ?? '00'}`
}

/**
 * Le temps mesure sur la base de demonstration.
 *
 * Le cout du planificateur n est pas une duree — c est un nombre sans unite.
 * Le rapport employe ici a ete releve une fois sur la machine de reference, et
 * il ne vaut que pour elle : c est pourquoi la page dit « mesure », et jamais
 * « garanti ».
 */
function duree(coutTotal: number, lignes: number): number {
  return coutTotal * 0.0128 + lignes * 0.00042
}

/**
 * Le plan d execution de la requete composee.
 *
 * Construit du bas vers le haut : les parcours d abord, puis la jointure, le
 * tri et la limite. Chaque etage porte le cout cumule de ce qui le precede,
 * comme le ferait un vrai plan.
 */
function planifier(requete: Requete): Noeud {
  const { filtre, index, jointure, tri, limite } = requete
  const sorties = Math.round(COMMANDES.lignes * filtre.selectivite)

  const coutSequentiel =
    COMMANDES.pages * PAGE_SEQ + COMMANDES.lignes * (LIGNE + OPERATEUR)
  const coutIndex =
    2 +
    sorties * (LIGNE_INDEX + LIGNE + OPERATEUR) +
    filtre.selectivite * COMMANDES.pages * PAGE_ALEATOIRE

  const parIndex = index && coutIndex < coutSequentiel
  const coutParcours = parIndex ? coutIndex : coutSequentiel

  let racine: Noeud = {
    cle: 'commandes',
    nom: parIndex ? `Index Scan sur commandes` : 'Seq Scan sur commandes',
    detail: [
      ['Filtre', filtre.sql],
      ['Index', index ? `idx_commandes_${filtre.colonne}` : 'aucun sur cette colonne'],
      ['Lignes lues', nombre(parIndex ? sorties : COMMANDES.lignes)],
      [
        'Pages',
        nombre(parIndex ? filtre.selectivite * COMMANDES.pages : COMMANDES.pages),
      ],
    ],
    cout: coutParcours,
    lignes: sorties,
    note: index
      ? parIndex
        ? `L index est pris : il ne remonte que ${nombre(sorties)} lignes, et ${cout(coutIndex)} de cout valent mieux que ${cout(coutSequentiel)}.`
        : `L index existe et n est pas pris. Ce filtre rend ${String(Math.round(filtre.selectivite * 100))} pour cent de la table : le parcours par index couterait ${cout(coutIndex)}, le parcours sequentiel ${cout(coutSequentiel)}. Le planificateur choisit le moins cher, et il a raison.`
      : `Aucun index sur ${filtre.colonne} : les ${nombre(COMMANDES.lignes)} lignes sont lues, puis filtrees.`,
    enfants: [],
  }

  if (jointure) {
    const boucle = sorties <= 20_000
    if (boucle) {
      const coutBoucle =
        coutParcours + sorties * (PAGE_ALEATOIRE + LIGNE + LIGNE_INDEX * 3)
      racine = {
        cle: 'jointure',
        nom: 'Nested Loop',
        detail: [
          ['Condition', 'commandes.client_id = clients.id'],
          ['Interieur', 'Index Scan sur clients_pkey'],
          ['Boucles', nombre(sorties)],
          ['Lignes', nombre(sorties)],
        ],
        cout: coutBoucle,
        lignes: sorties,
        note: `Peu de lignes a gauche : ${nombre(sorties)} acces a l index de clients coutent moins qu une table de hachage sur ${nombre(CLIENTS.lignes)} lignes.`,
        enfants: [
          racine,
          {
            cle: 'clients',
            nom: 'Index Scan sur clients_pkey',
            detail: [
              ['Condition', 'id = commandes.client_id'],
              ['Lignes par boucle', '1'],
              ['Hauteur de l arbre', '3'],
            ],
            cout: sorties * LIGNE_INDEX * 3,
            lignes: 1,
            note: 'Un acces par ligne exterieure, trois niveaux d arbre a descendre.',
            enfants: [],
          },
        ],
      }
    } else {
      const coutClients = CLIENTS.pages * PAGE_SEQ + CLIENTS.lignes * LIGNE
      const coutHachage =
        coutParcours + coutClients + CLIENTS.lignes * OPERATEUR + sorties * OPERATEUR * 2
      racine = {
        cle: 'jointure',
        nom: 'Hash Join',
        detail: [
          ['Condition', 'commandes.client_id = clients.id'],
          ['Table de hachage', `${nombre(CLIENTS.lignes)} lignes, 14 Mo`],
          ['Lignes', nombre(sorties)],
        ],
        cout: coutHachage,
        lignes: sorties,
        note: `Au-dela de vingt mille lignes a gauche, la boucle imbriquee devient plus chere qu une table de hachage construite une seule fois sur clients.`,
        enfants: [
          racine,
          {
            cle: 'clients',
            nom: 'Seq Scan sur clients',
            detail: [
              ['Lignes', nombre(CLIENTS.lignes)],
              ['Pages', nombre(CLIENTS.pages)],
              ['Employe par', 'Hash'],
            ],
            cout: coutClients,
            lignes: CLIENTS.lignes,
            note: 'La table entiere est lue une fois pour construire la table de hachage.',
            enfants: [],
          },
        ],
      }
    }
  }

  if (tri) {
    const enTete = limite ? 50 : racine.lignes
    const facteur = Math.log2(Math.max(2, enTete))
    const coutTri = racine.cout + racine.lignes * facteur * OPERATEUR * 2
    const memoire = racine.lignes * 72
    const surDisque = !limite && memoire > 4 * 1024 * 1024
    racine = {
      cle: 'tri',
      nom: limite
        ? 'Top-N heapsort'
        : surDisque
          ? 'Sort, sur disque'
          : 'Sort, en memoire',
      detail: [
        ['Cle', 'commandes.total_ttc DESC'],
        [
          'Methode',
          limite
            ? 'heapsort a cinquante entrees'
            : surDisque
              ? 'fusion externe'
              : 'quicksort',
        ],
        ['Memoire', limite ? '29 ko' : `${nombre(memoire / 1024)} ko`],
        ['Lignes triees', nombre(racine.lignes)],
      ],
      cout: coutTri,
      lignes: racine.lignes,
      note: limite
        ? 'Avec une limite, rien n est trie entierement : un tas de cinquante entrees suffit, et le reste est jete au fil de l eau.'
        : surDisque
          ? `Le tri ne tient pas dans les quatre mega-octets de memoire de travail : il passe par des fichiers temporaires, et c est la que le temps part.`
          : 'Le tri tient en memoire de travail : rien ne touche le disque.',
      enfants: [racine],
    }
  }

  if (limite) {
    racine = {
      cle: 'limite',
      nom: 'Limit',
      detail: [
        ['Lignes rendues', '50'],
        ['Lignes ecartees', nombre(Math.max(0, racine.lignes - 50))],
      ],
      cout: racine.cout,
      lignes: 50,
      note: tri
        ? 'La limite est descendue jusqu au tri, qui n en garde que cinquante. Sans tri au-dessus, elle arrete aussi le parcours.'
        : 'Sans tri, la limite arrete le parcours des que cinquante lignes sont sorties : le cout affiche est un plafond, pas une facture.',
      enfants: [racine],
    }
  }

  return racine
}

/** Le texte SQL de la requete composee. */
function ecrire(requete: Requete): string {
  const lignes = [
    requete.jointure
      ? 'SELECT c.id, c.total_ttc, cl.raison_sociale'
      : 'SELECT c.id, c.total_ttc, c.statut',
    'FROM commandes AS c',
  ]
  if (requete.jointure) lignes.push('JOIN clients AS cl ON cl.id = c.client_id')
  lignes.push(`WHERE ${requete.filtre.sql.replace(/^/, 'c.')}`)
  if (requete.tri) lignes.push('ORDER BY c.total_ttc DESC')
  if (requete.limite) lignes.push('LIMIT 50')
  return `${lignes.join('\n')};`
}

/* ============================ Le dessin du plan ======================== */

/** Un noeud pose sur la planche, avec sa boite. */
interface Pose {
  readonly noeud: Noeud
  readonly x: number
  readonly y: number
  readonly profondeur: number
}

const BOITE_L = 240
const BOITE_H = 62
const ETAGE = 100

/**
 * Les noeuds poses, du haut vers le bas.
 *
 * Un plan n est pas un organigramme : il se lit de haut en bas, la racine au
 * sommet, et les feuilles — les parcours de table — tout en bas. Les etages
 * sont reguliers ; seuls les enfants d une jointure se separent.
 */
function poser(racine: Noeud): {
  readonly poses: readonly Pose[]
  readonly hauteur: number
} {
  const poses: Pose[] = []
  let profondeurMax = 0

  const descendre = (noeud: Noeud, profondeur: number, centre: number): void => {
    profondeurMax = Math.max(profondeurMax, profondeur)
    poses.push({ noeud, x: centre, y: 24 + profondeur * ETAGE, profondeur })
    if (noeud.enfants.length === 1) {
      const premier = noeud.enfants[0]
      if (premier !== undefined) descendre(premier, profondeur + 1, centre)
      return
    }
    const ecart = 148
    noeud.enfants.forEach((enfant, rang) => {
      descendre(enfant, profondeur + 1, centre + (rang === 0 ? -ecart : ecart))
    })
  }

  descendre(racine, 0, 320)
  return { poses, hauteur: 48 + (profondeurMax + 1) * ETAGE }
}

/** Le plan dessine : des boites reliees, chacune un bouton. */
function Planche({
  racine,
  choisi,
  surChoix,
}: {
  readonly racine: Noeud
  readonly choisi: string
  readonly surChoix: (cle: string) => void
}): ReactElement {
  const { poses, hauteur } = useMemo(() => poser(racine), [racine])
  const total = racine.cout

  return (
    <svg
      viewBox={`0 0 640 ${String(hauteur)}`}
      className="o-h-auto o-w-full"
      role="group"
      aria-label="Le plan d execution, noeud par noeud"
    >
      {/* Les liaisons, tracees avant les boites pour passer dessous. */}
      {poses.map((pose) =>
        pose.noeud.enfants.map((enfant) => {
          const cible = poses.find((p) => p.noeud === enfant)
          if (cible === undefined) return null
          return (
            <path
              key={`${pose.noeud.cle}-${enfant.cle}`}
              d={`M${String(pose.x)} ${String(pose.y + BOITE_H)} C${String(pose.x)} ${String(pose.y + BOITE_H + 26)} ${String(cible.x)} ${String(cible.y - 26)} ${String(cible.x)} ${String(cible.y)}`}
              fill="none"
              stroke={accentDoux(500, 46)}
              strokeWidth="1.5"
            />
          )
        }),
      )}

      {poses.map((pose) => {
        const actif = pose.noeud.cle === choisi
        const part = total === 0 ? 0 : Math.min(1, pose.noeud.cout / total)
        const surTouche = (evenement: KeyboardEvent<SVGGElement>): void => {
          if (evenement.key !== 'Enter' && evenement.key !== ' ') return
          evenement.preventDefault()
          surChoix(pose.noeud.cle)
        }
        return (
          <g
            key={pose.noeud.cle}
            data-o-bd-noeud=""
            role="button"
            tabIndex={0}
            aria-pressed={actif}
            aria-label={`${pose.noeud.nom}, cout ${cout(pose.noeud.cout)}, ${nombre(pose.noeud.lignes)} lignes`}
            onClick={() => {
              surChoix(pose.noeud.cle)
            }}
            onKeyDown={surTouche}
            transform={`translate(${String(pose.x - BOITE_L / 2)} ${String(pose.y)})`}
          >
            <rect
              data-o-bd-focus=""
              x={-6}
              y={-6}
              width={BOITE_L + 12}
              height={BOITE_H + 12}
              rx="12"
              fill="none"
              stroke={encreSurSombre()}
              strokeWidth="2.5"
            />
            <rect
              width={BOITE_L}
              height={BOITE_H}
              rx="8"
              fill={
                actif ? accentDoux(700, 70) : 'color-mix(in oklab, white 5%, transparent)'
              }
              stroke={actif ? encreSurSombre() : accentDoux(500, 42)}
              strokeWidth={actif ? 2 : 1}
            />
            {/* La part du cout total, en barre pleine sous le nom. */}
            <rect
              x="0"
              y={BOITE_H - 4}
              width={BOITE_L * part}
              height="4"
              fill={accent(400)}
              opacity="0.85"
              rx="2"
            />
            <text
              x="14"
              y="25"
              fontSize="13"
              fill="var(--o-theme-fg)"
              style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.01em' }}
            >
              {pose.noeud.nom}
            </text>
            <text
              x="14"
              y="45"
              fontSize="11"
              fill="var(--o-theme-muted)"
              style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.04em' }}
            >
              cout {court(pose.noeud.cout)}
            </text>
            <text
              x={BOITE_L - 14}
              y="45"
              textAnchor="end"
              fontSize="11"
              fill="var(--o-theme-muted)"
              style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.04em' }}
            >
              {court(pose.noeud.lignes)} lignes
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/* ============================ Le graphique en barres =================== */

/** C14 : vingt-quatre heures de latence mediane, dessinees au trait. */
const LATENCE: readonly number[] = [
  2.1, 1.9, 1.8, 1.7, 1.8, 2.4, 4.1, 7.8, 12.4, 14.1, 13.2, 11.8, 9.4, 10.6, 12.9, 13.8,
  12.2, 10.1, 8.4, 6.2, 4.8, 3.6, 2.8, 2.3,
]

/** Le graphique : des traits, une ligne de base, aucun cadre. */
function Barres(): ReactElement {
  const haut = Math.max(...LATENCE)
  const large = 720
  const hauteur = 220
  const pas = large / LATENCE.length
  const pointe = LATENCE.indexOf(haut)

  return (
    <figure className="o-m-0">
      <svg
        viewBox={`0 0 ${String(large)} ${String(hauteur + 46)}`}
        className="o-h-auto o-w-full"
        role="img"
        aria-label={`Latence mediane heure par heure, de ${String(Math.min(...LATENCE))} a ${String(haut)} millisecondes, avec une pointe a ${String(pointe)} heures`}
      >
        {LATENCE.map((valeur, heure) => {
          const h = (valeur / haut) * hauteur
          const x = heure * pas + pas / 2
          return (
            <g key={heure}>
              <path
                d={`M${String(x)} ${String(hauteur)} V${String(hauteur - h)}`}
                stroke={heure === pointe ? encreSurSombre() : accentDoux(400, 56)}
                strokeWidth={heure === pointe ? 6 : 4}
                strokeLinecap="round"
              />
              {heure % 3 === 0 && (
                <text
                  x={x}
                  y={hauteur + 24}
                  textAnchor="middle"
                  fontSize="12"
                  fill="var(--o-theme-muted)"
                  style={{ fontFamily: 'var(--o-font-mono)' }}
                >
                  {String(heure).padStart(2, '0')}
                </text>
              )}
            </g>
          )
        })}
        <path
          d={`M0 ${String(hauteur)} H${String(large)}`}
          stroke={accentDoux(500, 26)}
          strokeWidth="1"
        />
        <text
          x={pointe * pas + pas / 2 + 12}
          y={hauteur - (haut / haut) * hauteur + 18}
          fontSize="13"
          fill={encreSurSombre()}
          style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.06em' }}
        >
          {haut.toFixed(1).replace('.', ',')} ms
        </text>
      </svg>
      <figcaption className="o-mt-6 o-max-w-xl o-text-sm o-leading-relaxed o-text-zinc-400">
        Latence mediane des requetes de lecture, heure par heure, sur la semaine du 1er
        septembre. Grappe de trois noeuds, 190 Go de donnees chaudes. Le creux de la nuit
        n est pas un exploit : c est l heure ou personne ne travaille.
      </figcaption>
    </figure>
  )
}

/* ============================ Le schema ================================ */

const SCHEMA = [
  {
    id: 'public',
    label: 'public',
    hint: 'schema',
    children: [
      {
        id: 'commandes',
        label: 'commandes',
        hint: '2 400 000 lignes',
        children: [
          { id: 'commandes.id', label: 'id', hint: 'bigint, cle primaire' },
          {
            id: 'commandes.client_id',
            label: 'client_id',
            hint: 'bigint, cle etrangere',
          },
          { id: 'commandes.statut', label: 'statut', hint: 'enum, 5 valeurs' },
          { id: 'commandes.total_ttc', label: 'total_ttc', hint: 'numeric(10,2)' },
          { id: 'commandes.cree_le', label: 'cree_le', hint: 'timestamptz, indexe' },
        ],
      },
      {
        id: 'clients',
        label: 'clients',
        hint: '180 000 lignes',
        children: [
          { id: 'clients.id', label: 'id', hint: 'bigint, cle primaire' },
          { id: 'clients.raison_sociale', label: 'raison_sociale', hint: 'text' },
          { id: 'clients.pays', label: 'pays', hint: 'char(2)' },
        ],
      },
      {
        id: 'lignes_commande',
        label: 'lignes_commande',
        hint: '9 100 000 lignes',
        children: [
          {
            id: 'lignes.commande_id',
            label: 'commande_id',
            hint: 'bigint, cle etrangere',
          },
          { id: 'lignes.reference', label: 'reference', hint: 'text' },
          { id: 'lignes.quantite', label: 'quantite', hint: 'integer' },
        ],
      },
    ],
  },
  {
    id: 'audit',
    label: 'audit',
    hint: 'schema, en lecture seule',
    children: [
      {
        id: 'audit.journal',
        label: 'journal',
        hint: '41 200 000 lignes, partitionne par mois',
      },
      { id: 'audit.sessions', label: 'sessions', hint: '2 800 000 lignes' },
    ],
  },
]

const VERSIONS = [
  {
    version: '16.2',
    date: '4 septembre 2026',
    dateTime: '2026-09-04',
    summary: 'Le planificateur descend la limite jusque dans le tri.',
    notes: [
      {
        kind: 'evolution' as const,
        text: 'Top-N heapsort choisi des qu une limite est presente au-dessus d un tri.',
      },
      {
        kind: 'correction' as const,
        text: 'Un parcours par index sur colonne nullable rendait une ligne de trop en jointure externe.',
      },
      {
        kind: 'ajout' as const,
        text: 'EXPLAIN (FORMAT JSON) publie desormais le temps passe par noeud et par boucle.',
      },
    ],
  },
  {
    version: '16.1',
    date: '19 juin 2026',
    dateTime: '2026-06-19',
    summary: 'Replication logique par partition.',
    notes: [
      {
        kind: 'ajout' as const,
        text: 'Une partition peut etre repliquee sans le reste de sa table mere.',
      },
      {
        kind: 'evolution' as const,
        text: 'La memoire de travail par defaut passe de 4 a 8 mega-octets.',
      },
      {
        kind: 'retrait' as const,
        text: 'Le format de sauvegarde anterieur a la 14 n est plus lu.',
      },
    ],
  },
  {
    version: '16.0',
    date: '2 mars 2026',
    dateTime: '2026-03-02',
    summary: 'Le moteur de stockage passe en ecriture differee.',
    notes: [
      {
        kind: 'ajout' as const,
        text: 'Ecriture differee par groupe de transactions, au prix de 200 ms de perte possible.',
      },
      {
        kind: 'evolution' as const,
        text: 'Les statistiques etendues sont collectees sur les couples de colonnes correles.',
      },
    ],
  },
]

/* ============================ La feuille =============================== */

const STYLE_BD = 'o-vitrine-base-donnees'

const CSS_BD = [
  '[data-o-bd-noeud]{cursor:pointer;outline:none}',
  '[data-o-bd-noeud] [data-o-bd-focus]{opacity:0}',
  '[data-o-bd-noeud]:focus-visible [data-o-bd-focus]{opacity:1}',
].join('')

function useFeuilleBd(): void {
  useEffect(() => {
    if (document.getElementById(STYLE_BD) !== null) return
    const feuille = document.createElement('style')
    feuille.id = STYLE_BD
    feuille.textContent = CSS_BD
    document.head.append(feuille)
  }, [])
}

/* ============================ La page ================================== */

const NAVIGATION = [
  ['#requete', 'La requete'],
  ['#latence', 'La latence'],
  ['#schema', 'Le schema'],
] as const

/** Un interrupteur du compositeur : un mot, un etat, rien de plus. */
function Bascule({
  mot,
  actif,
  note,
  surClic,
}: {
  readonly mot: string
  readonly actif: boolean
  readonly note: string
  readonly surClic: () => void
}): ReactElement {
  return (
    <button
      type="button"
      aria-pressed={actif}
      onClick={surClic}
      className="o-flex o-w-full o-cursor-pointer o-flex-col o-gap-1 o-border-w-1 o-p-4 o-text-left o-transition-colors focus:o-ring"
      style={
        actif
          ? {
              borderColor: encreSurSombre(),
              backgroundColor: accentDoux(700, 60),
              color: 'var(--o-theme-fg)',
            }
          : { borderColor: accentDoux(500, 34), color: 'var(--o-theme-muted)' }
      }
    >
      <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest">{mot}</span>
      <span className="o-text-xs o-leading-relaxed">{note}</span>
    </button>
  )
}

export default function Page(): ReactElement {
  const polices = usePolices('grotesk')
  useFeuilleBd()
  const [rangFiltre, setRangFiltre] = useState(3)
  const [index, setIndex] = useState(true)
  const [jointure, setJointure] = useState(true)
  const [tri, setTri] = useState(true)
  const [limite, setLimite] = useState(false)
  const [noeudChoisi, setNoeudChoisi] = useState('commandes')

  const requete: Requete | undefined = useMemo(() => {
    const filtre = FILTRES[rangFiltre] ?? FILTRES[0]
    return filtre === undefined ? undefined : { filtre, index, jointure, tri, limite }
  }, [rangFiltre, index, jointure, tri, limite])
  const plan = useMemo(
    () => (requete === undefined ? undefined : planifier(requete)),
    [requete],
  )

  const trouver = (noeud: Noeud): Noeud | undefined => {
    if (noeud.cle === noeudChoisi) return noeud
    for (const enfant of noeud.enfants) {
      const trouve = trouver(enfant)
      if (trouve !== undefined) return trouve
    }
    return undefined
  }
  const detail = plan === undefined ? undefined : (trouver(plan) ?? plan)

  if (requete === undefined || plan === undefined || detail === undefined) return <div />

  const ms = duree(plan.cout, plan.lignes)

  return (
    <Porte forme="compteur" marque="Socle" sombre>
      <div className="o-relative" style={{ ...polices, ...nuit('zinc') }}>
        {/* ================= L ouverture : le HUD ======================== */}
        <header
          className="o-relative o-isolate o-overflow-hidden"
          style={{ minHeight: `calc(100vh - ${String(CHROME)}px)` }}
        >
          <div aria-hidden="true" className="o-absolute o-inset-0">
            <DataStream
              className="o-absolute o-inset-0"
              lanes={26}
              speed={0.6}
              density={5}
              thickness={0.26}
              colors={['--o-theme-bg', '--o-vitrine-500', '--o-vitrine-300']}
              fallback="o-bg-zinc-950"
            />
            <div
              className="o-absolute o-inset-0"
              style={{
                background:
                  'linear-gradient(to right, var(--o-palette-zinc-950) 4%, color-mix(in oklab, var(--o-palette-zinc-950) 82%, transparent) 46%, color-mix(in oklab, var(--o-palette-zinc-950) 42%, transparent) 78%, color-mix(in oklab, var(--o-palette-zinc-950) 25%, transparent) 100%)',
              }}
            />
            <div
              className="o-absolute o-inset-x-0 o-bottom-0 o-h-64"
              style={{
                background:
                  'linear-gradient(to bottom, transparent, var(--o-palette-zinc-950))',
              }}
            />
          </div>
          <Grain opacite={0.05} />

          <BarreCoins
            marque="Socle"
            liens={NAVIGATION}
            droite="v16.2 — LTS jusqu en 2030"
          />

          <Coin position="bd">
            Grappe de trois noeuds
            <br />
            190 Go chauds · 41 M lignes d audit
          </Coin>

          <div
            className="o-relative o-z-20 o-flex o-flex-col o-justify-center o-px-6 o-pb-28 o-pt-16 md:o-px-10"
            style={{ minHeight: `calc(100vh - ${String(CHROME)}px - 5rem)` }}
          >
            <div className="o-mx-auto o-w-full o-max-w-7xl">
              <Surgit>
                <Etiquette>Base de donnees relationnelle — auto-hebergeable</Etiquette>
              </Surgit>
              <TitreVague
                delai={140}
                className="o-m-0 o-mt-8 o-text-zinc-50"
                style={{
                  ...affiche('xl', 300),
                  fontSize: 'clamp(3.25rem, 13vw, 11rem)',
                  lineHeight: 0.86,
                }}
              >
                Socle
              </TitreVague>
              <Surgit
                delai={520}
                as="p"
                className="o-m-0 o-mt-8 o-max-w-xl o-text-lg o-leading-relaxed o-text-zinc-400"
              >
                Un moteur qui vous montre ce qu il fait. Composez une requete plus bas :
                le plan d execution se dessine, avec ses couts, et vous verrez pourquoi
                votre index n est pas toujours employe.
              </Surgit>

              {/* L invite : la seule chose qui frappe d elle-meme sur la page. */}
              <Surgit
                delai={640}
                className="o-mt-10 o-max-w-xl o-border-w-1 o-p-5"
                style={{
                  borderColor: accentDoux(500, 36),
                  backgroundColor: 'color-mix(in oklab, black 55%, transparent)',
                }}
              >
                <p className="o-m-0 o-font-mono o-text-sm o-leading-relaxed o-text-zinc-300">
                  <span style={{ color: encreSurSombre() }}>socle=# </span>
                  <Typewriter
                    phrases={[
                      "EXPLAIN ANALYZE SELECT * FROM commandes WHERE cree_le > now() - interval '7 days';",
                      'CREATE INDEX CONCURRENTLY idx_commandes_statut ON commandes (statut);',
                      "SELECT pg_size_pretty(pg_total_relation_size('commandes'));",
                    ]}
                    typeSpeed={38}
                    deleteSpeed={14}
                    hold={2200}
                  />
                </p>
              </Surgit>

              <Surgit delai={780} className="o-mt-10">
                <Actions
                  pleine={[
                    '#requete',
                    <>
                      Composer une requete{' '}
                      <Icon icon={ArrowRight} size={15} aria-hidden="true" />
                    </>,
                  ]}
                  fantome={['#schema', 'Voir le schema']}
                />
              </Surgit>
            </div>
          </div>
        </header>

        <main>
          {/* ================= Le mecanisme : la requete ================== */}
          <section
            id="requete"
            className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
          >
            <div className="o-mx-auto o-max-w-7xl">
              <Reveal>
                <Indice rang="01">La requete</Indice>
              </Reveal>
              <Reveal delay={80}>
                <h2
                  className="o-m-0 o-mt-6 o-max-w-3xl o-text-zinc-50"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.85rem, 4vw, 3.5rem)',
                    lineHeight: 1,
                  }}
                >
                  Un index n est pas une promesse.
                </h2>
              </Reveal>

              <div className="o-mt-14 o-grid o-gap-10 lg:o-grid-cols-12">
                {/* Le compositeur. */}
                <div className="lg:o-col-span-4">
                  <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                    Le filtre
                  </p>
                  <ul className="o-m-0 o-mt-4 o-flex o-list-none o-flex-col o-gap-2 o-p-0">
                    {FILTRES.map((f, rang) => {
                      const actif = rang === rangFiltre
                      return (
                        <li key={f.cle}>
                          <button
                            type="button"
                            aria-pressed={actif}
                            onClick={() => {
                              setRangFiltre(rang)
                            }}
                            className="o-flex o-w-full o-cursor-pointer o-items-baseline o-justify-between o-gap-4 o-border-w-1 o-px-4 o-py-3 o-text-left o-transition-colors focus:o-ring"
                            style={
                              actif
                                ? {
                                    borderColor: encreSurSombre(),
                                    backgroundColor: accentDoux(700, 60),
                                    color: 'var(--o-theme-fg)',
                                  }
                                : {
                                    borderColor: accentDoux(500, 34),
                                    color: 'var(--o-theme-muted)',
                                  }
                            }
                          >
                            <span className="o-text-sm">{f.mot}</span>
                            <span className="o-shrink-0 o-font-mono o-text-xs o-tabular-nums">
                              {(f.selectivite * 100).toFixed(1).replace('.', ',')} %
                            </span>
                          </button>
                        </li>
                      )
                    })}
                  </ul>

                  <p className="o-m-0 o-mt-8 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                    Le reste
                  </p>
                  <div className="o-mt-4 o-grid o-gap-2">
                    <Bascule
                      mot="Index sur la colonne"
                      actif={index}
                      note={`idx_commandes_${requete.filtre.colonne}, arbre B`}
                      surClic={() => {
                        setIndex((v) => !v)
                      }}
                    />
                    <Bascule
                      mot="Jointure avec clients"
                      actif={jointure}
                      note="cl.id = c.client_id, 180 000 lignes a droite"
                      surClic={() => {
                        setJointure((v) => !v)
                      }}
                    />
                    <Bascule
                      mot="Tri par montant"
                      actif={tri}
                      note="ORDER BY total_ttc DESC"
                      surClic={() => {
                        setTri((v) => !v)
                      }}
                    />
                    <Bascule
                      mot="Limite a cinquante"
                      actif={limite}
                      note="LIMIT 50"
                      surClic={() => {
                        setLimite((v) => !v)
                      }}
                    />
                  </div>

                  <pre
                    className="o-m-0 o-mt-8 o-overflow-x-auto o-border-w-1 o-p-4 o-font-mono o-text-xs o-leading-relaxed o-text-zinc-300"
                    style={{ borderColor: accentDoux(500, 30), overflowY: 'hidden' }}
                  >
                    <code>{ecrire(requete)}</code>
                  </pre>
                </div>

                {/* Le plan, dessine. */}
                <div className="lg:o-col-span-5">
                  <div
                    className="o-border-w-1 o-p-4 md:o-p-6"
                    style={{ borderColor: accentDoux(500, 30) }}
                  >
                    <div className="o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-4">
                      <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                        Plan d execution
                      </p>
                      <p
                        className="o-m-0 o-font-mono o-text-xs o-tabular-nums"
                        style={{ color: encreSurSombre() }}
                        aria-live="polite"
                      >
                        cout {cout(plan.cout)} · {ms.toFixed(1).replace('.', ',')} ms
                      </p>
                    </div>
                    <div className="o-mt-6">
                      <Planche
                        racine={plan}
                        choisi={noeudChoisi}
                        surChoix={setNoeudChoisi}
                      />
                    </div>
                  </div>
                  <p className="o-m-0 o-mt-4 o-text-sm o-leading-relaxed o-text-zinc-500">
                    Chaque boite est un bouton : la tabulation passe de l une a l autre,
                    Entree ou la barre d espace l ouvre a droite. La barre pleine sous le
                    nom est la part du cout total.
                  </p>
                </div>

                {/* Le noeud ouvert. */}
                <div className="lg:o-col-span-3">
                  <div className="lg:o-sticky" style={{ top: CHROME + 32 }}>
                    <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                      Le noeud
                    </p>
                    <h3
                      className="o-m-0 o-mt-4 o-font-mono o-text-zinc-50"
                      aria-live="polite"
                      style={{
                        fontSize: 'clamp(1.1rem, 1.8vw, 1.5rem)',
                        lineHeight: 1.16,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {detail.nom}
                    </h3>
                    <dl className="o-m-0 o-mt-6">
                      {detail.detail.map(([quoi, valeur]) => (
                        <div key={quoi} className="o-border-t o-border-white-10 o-py-3">
                          <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
                            {quoi}
                          </dt>
                          <dd className="o-m-0 o-mt-1 o-break-words o-font-mono o-text-xs o-text-zinc-200">
                            {valeur}
                          </dd>
                        </div>
                      ))}
                      <div className="o-border-t o-border-white-10 o-py-3">
                        <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
                          Cout cumule
                        </dt>
                        <dd
                          className="o-m-0 o-mt-1 o-font-mono o-text-sm o-tabular-nums"
                          style={{ color: encreSurSombre() }}
                        >
                          {cout(detail.cout)}
                        </dd>
                      </div>
                    </dl>
                    <p className="o-m-0 o-mt-6 o-text-sm o-leading-relaxed o-text-zinc-300">
                      {detail.note}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ================= C14 : les barres au trait ================== */}
          <section
            id="latence"
            className="o-scroll-mt-24 o-border-t o-border-white-10 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
          >
            <div className="o-mx-auto o-max-w-6xl">
              <Reveal>
                <Indice rang="02">La latence</Indice>
              </Reveal>
              <Reveal delay={80}>
                <h2
                  className="o-m-0 o-mb-14 o-mt-6 o-max-w-2xl o-text-zinc-50"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.85rem, 4vw, 3.5rem)',
                    lineHeight: 1,
                  }}
                >
                  Vingt-quatre heures, une pointe a neuf heures.
                </h2>
              </Reveal>
              <Barres />
            </div>
          </section>

          {/* ================= M-chapitres : le schema, le journal ======== */}
          <div className="o-border-t o-border-white-10 o-px-6 o-py-24 md:o-px-10 md:o-py-32">
            <div className="o-mx-auto o-flex o-max-w-6xl o-flex-col o-gap-24">
              <Chapitre
                id="schema"
                className="o-scroll-mt-24"
                indice="(03) — Le schema"
                titre={
                  <h2
                    className="o-m-0 o-text-zinc-50"
                    style={{
                      ...affiche('m', 300),
                      fontSize: 'clamp(1.6rem, 3vw, 2.75rem)',
                      lineHeight: 1,
                    }}
                  >
                    Deux schemas, cinq tables, cinquante-trois millions de lignes.
                  </h2>
                }
                texte="La base de demonstration est celle qui sert au compositeur ci-dessus. Depliez une table pour voir ses colonnes et leurs types."
              >
                <TreeView
                  nodes={SCHEMA}
                  label="Le schema de la base de demonstration"
                  defaultOpen={['public', 'commandes']}
                  defaultValue="commandes.cree_le"
                />
              </Chapitre>

              <Chapitre
                indice="(04) — Le journal"
                titre={
                  <h2
                    className="o-m-0 o-text-zinc-50"
                    style={{
                      ...affiche('m', 300),
                      fontSize: 'clamp(1.6rem, 3vw, 2.75rem)',
                      lineHeight: 1,
                    }}
                  >
                    Ce qui a change, et ce qui a disparu.
                  </h2>
                }
                texte="Trois versions majeures par an, et une note de retrait a chaque fois qu une chose cesse de marcher. C est la partie que personne n aime ecrire."
              >
                <Changelog releases={VERSIONS} label="Les versions publiees" />
              </Chapitre>
            </div>
          </div>

          {/* ================= A16 : le formulaire d une seule ligne ====== */}
          <section
            aria-labelledby="essai-titre"
            className="o-border-t o-border-white-10 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
          >
            <div className="o-mx-auto o-max-w-3xl">
              <h2
                id="essai-titre"
                className="o-m-0 o-text-zinc-50"
                style={{
                  ...affiche('m', 300),
                  fontSize: 'clamp(1.75rem, 4vw, 3.25rem)',
                  lineHeight: 1.02,
                }}
              >
                Une grappe de trois noeuds, montee en douze minutes.
              </h2>
              <Essai />
            </div>
          </section>
        </main>

        {/* ================= Le pied : l ours du journal ================== */}
        <footer className="o-border-t o-border-white-10 o-px-6 o-py-16 md:o-px-10">
          <p className="o-mx-auto o-m-0 o-max-w-6xl o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
            Socle — ours
          </p>
          <div className="o-mx-auto o-mt-8 o-grid o-max-w-6xl o-gap-10 o-font-mono o-text-xs o-leading-relaxed md:o-grid-cols-3">
            <div className="o-max-w-2xs">
              <p className="o-m-0 o-text-zinc-300">
                <span style={{ color: encreSurSombre() }}>La fondation.</span> Socle est
                publie par la fondation Socle, association d interet general enregistree a
                Delft. Direction technique Ines Aubertin. Comite de publication : sept
                mainteneurs, elus pour deux ans. Les decisions de compatibilite sont
                prises en seance publique, le premier jeudi du mois.
              </p>
            </div>
            <div className="o-max-w-2xs">
              <p className="o-m-0 o-text-zinc-300">
                <span style={{ color: encreSurSombre() }}>Le tirage.</span> Version 16.2,
                publiee le 4 septembre 2026, maintenue jusqu au 30 juin 2030. Licence
                Apache 2.0. Empreinte de l archive sha256:9f14c2e0a7. Paquets verifies
                pour Debian, Alpine et FreeBSD. Les versions 14 et anterieures ne
                recoivent plus de correctif de securite.
              </p>
            </div>
            <div className="o-max-w-2xs">
              <p className="o-m-0 o-text-zinc-300">
                <span style={{ color: encreSurSombre() }}>L adresse.</span> Fondation
                Socle, Oude Delft 112, 2611 CG Delft. Signalements de securite a
                securite@socle.dev, cle publique sur le site. Forum public, archives
                ouvertes depuis 2019.{' '}
                <a
                  href="#requete"
                  className="o-no-underline focus:o-ring"
                  style={{ color: encreSurSombre() }}
                >
                  socle.dev
                </a>
              </p>
            </div>
          </div>
          <p className="o-mx-auto o-mt-12 o-max-w-6xl o-border-t o-border-white-10 o-pt-6 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
            © 2026 Fondation Socle · Les couts affiches sont ceux du planificateur, pas
            des durees
          </p>
        </footer>
      </div>
    </Porte>
  )
}

/* ============================ Le formulaire d une ligne ================ */

/** A16 : le champ et le bouton dans le meme filet. */
function Essai(): ReactElement {
  const [adresse, setAdresse] = useState('')
  const [envoye, setEnvoye] = useState(false)

  return (
    <form
      className="o-mt-10"
      onSubmit={(evenement) => {
        evenement.preventDefault()
        setEnvoye(adresse.trim().length > 0)
      }}
    >
      <label
        htmlFor="socle-adresse"
        className="o-block o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400"
      >
        Votre adresse, et la cle d essai part dans la minute
      </label>
      {/* Le champ et le bouton partagent le meme filet : A16. */}
      <div
        className="o-mt-4 o-flex o-items-stretch o-border-w-1"
        style={{ borderColor: accentDoux(400, 50) }}
      >
        <input
          id="socle-adresse"
          type="email"
          required
          value={adresse}
          onChange={(evenement) => {
            setAdresse(evenement.target.value)
            setEnvoye(false)
          }}
          placeholder="vous@votre-domaine.fr"
          className="o-min-w-0 o-grow o-bg-transparent o-px-5 o-py-4 o-font-mono o-text-sm o-text-zinc-50 focus:o-ring"
          style={{ border: 'none', outlineOffset: '-2px' }}
        />
        <button
          type="submit"
          className="o-shrink-0 o-cursor-pointer o-px-6 o-py-4 o-font-mono o-text-xs o-font-semibold o-uppercase o-tracking-widest o-transition-opacity hover:o-opacity-85 focus:o-ring"
          style={{
            backgroundColor: accent(400),
            color: 'var(--o-palette-zinc-950)',
            border: 'none',
          }}
        >
          Recevoir la cle
        </button>
      </div>
      <p
        className="o-m-0 o-mt-4 o-text-sm o-leading-relaxed o-text-zinc-400"
        aria-live="polite"
      >
        {envoye
          ? `Cle envoyee a ${adresse}. Elle ouvre une grappe de trois noeuds pendant trente jours, sans carte bancaire et sans relance commerciale.`
          : 'Trente jours, trois noeuds, aucune carte bancaire. L adresse sert a envoyer la cle, et a rien d autre.'}
      </p>
    </form>
  )
}
