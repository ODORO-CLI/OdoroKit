/**
 * Sillon — agence d architecture.
 *
 * ## L architecture : le dossier de references se parcourt de cote
 *
 * Landing page complete dont le **coeur est un dossier de planches**, et c est
 * ce qui n appartient qu a elle : un cartouche encadre qui filtre par
 * programme, des planches numerotees `PL. 00` a `PL. 08` avec leur cartouche
 * technique en pied — surface, cout au metre carre, maitrise d ouvrage, annee.
 *
 * Les planches ne s empilent pas : elles se **parcourent en rail**, comme on
 * feuillette un dossier de concours pose a plat. L ecran reste fixe, la piste
 * glisse de la premiere planche a la legende.
 *
 * L enchainement, ecran par ecran :
 *
 * - **ouverture**, de gouttiere a gouttiere : le titre a gauche, le chapeau a
 *   droite, et une photographie pleine largeur qui derive ;
 * - **la planche 00** : une maquette de masses en volume, sur une coupe
 *   sombre epinglee de trois ecrans et demi ;
 * - **le rail** des planches, ferme par la legende du dossier ;
 * - **le parti pris** : un ecran de texte seul, dont la premiere moitie est
 *   eteinte, et un tirage en bichromie qui deborde sur la section suivante ;
 * - **les notes de chantier** : cinq prescriptions, un chiffre dans la marge ;
 * - **un formulaire en ligne**, nom et courriel, et un disque aimante ;
 * - **une ligne de pied**.
 *
 * ## Le fond, et la seule surface graphique
 *
 * Blanc, et rien ne bouge derriere le texte. La page n a **qu une** surface
 * three.js, et ce n est plus un decor : le fond `Cubes` a cede la place a la
 * maquette de masses, et le decor est redevenu un degrade CSS. La maquette se
 * monte au defilement — la dalle, les refends, les volumes, le gabarit — et
 * la camera en fait le tour. Sous mouvement reduit, ou quand la surface est
 * refusee, la meme maquette est rendue en **axonometrie dessinee**, tiree des
 * memes cotes : le sujet de la planche 00 ne disparait jamais.
 *
 * @module
 */

import { type SceneContext } from '@odoro-cli/engine/three'
import { Icon } from '@odoro-cli/icons'
import { ArrowRight, ArrowUpRight } from '@odoro-cli/icons/outline'
import { useMemo, useRef, useState, type ReactElement, type ReactNode } from 'react'

import { Magnetic } from '@/odoro/effect/Magnetic.jsx'
import { Duotone } from '@/odoro/image/Duotone.jsx'
import { ParallaxImage } from '@/odoro/image/ParallaxImage.jsx'
import { SplitReveal } from '@/odoro/text/SplitReveal.jsx'

import { nuit } from './communs.jsx'
import { photo } from './media.js'
import { accentDoux, aplat, encre, encreSurSombre } from './palettes.js'
import {
  Actions,
  affiche,
  Autocollant,
  BarreCoins,
  Etiquette,
  Indice,
  Manifeste,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
} from './marche.jsx'
import { Epingle, Rail } from './scene.jsx'
import { eclairer, teinte, Volume } from './volume.jsx'

/** Les programmes, tels que le cartouche les filtre. */
const PROGRAMMES = [
  'Logement',
  'Equipement public',
  'Rehabilitation',
  'Tertiaire',
] as const
type Programme = (typeof PROGRAMMES)[number]

/** Un ouvrage livre, rendu comme une planche. */
interface Planche {
  readonly rang: string
  readonly nom: string
  readonly lieu: string
  readonly programme: Programme
  readonly annee: number
  readonly surface: number
  readonly cout: number
  readonly ouvrage: string
  readonly graine: string
  readonly texte: string
  readonly bois?: boolean
}

/** Les huit planches du dossier, de la plus recente a la plus ancienne. */
const PLANCHES: readonly Planche[] = [
  {
    rang: '01',
    nom: 'Les Ateliers du Blosne',
    lieu: 'Rennes (35)',
    programme: 'Logement',
    annee: 2025,
    surface: 4180,
    cout: 1840,
    ouvrage: 'Archipel Habitat',
    graine: 'sillon-blosne',
    texte:
      'Quarante-deux logements sociaux en ossature bois sur quatre niveaux, coursives exterieures. Aucun couloir interieur : chaque logement est traversant et donne sur la coursive.',
    bois: true,
  },
  {
    rang: '02',
    nom: 'Groupe scolaire Yourcenar',
    lieu: 'Saint-Nazaire (44)',
    programme: 'Equipement public',
    annee: 2024,
    surface: 2340,
    cout: 2310,
    ouvrage: 'Ville de Saint-Nazaire',
    graine: 'sillon-ecole',
    texte:
      'Douze classes de plain-pied autour d un preau plante. Terre crue compressee, produite a onze kilometres du chantier.',
    bois: true,
  },
  {
    rang: '03',
    nom: 'Halle Saint-Martin',
    lieu: 'Quimper (29)',
    programme: 'Rehabilitation',
    annee: 2024,
    surface: 1620,
    cout: 1490,
    ouvrage: 'Ville de Quimper',
    graine: 'sillon-halle',
    texte:
      'Une halle de 1908 rendue au marche apres trente ans de garage. Charpente d origine conservee a 88 % ; le reste en chene de Coat-an-Noz.',
  },
  {
    rang: '04',
    nom: 'Le Cadran',
    lieu: 'Vannes (56)',
    programme: 'Tertiaire',
    annee: 2023,
    surface: 3900,
    cout: 1980,
    ouvrage: 'SEM Territoires',
    graine: 'sillon-cadran',
    texte:
      'Bureaux concus pour etre transformes en logements sans toucher a la structure : trames de 5,40 m, gaines verticales doublees, 2,90 m sous dalle.',
  },
  {
    rang: '05',
    nom: 'Mediatheque des Rives',
    lieu: 'Lorient (56)',
    programme: 'Equipement public',
    annee: 2023,
    surface: 1870,
    cout: 2540,
    ouvrage: 'Communaute d agglomeration',
    graine: 'sillon-mediatheque',
    texte:
      'Salle unique de dix-huit metres de portee, eclairee par le nord. Le programme demandait des etages ; nous avons rendu un volume, et le jury a suivi.',
    bois: true,
  },
  {
    rang: '06',
    nom: 'Residence Les Genets',
    lieu: 'Brest (29)',
    programme: 'Logement',
    annee: 2022,
    surface: 5620,
    cout: 1720,
    ouvrage: 'Bailleur Aiguillon',
    graine: 'sillon-genets',
    texte:
      'Cinquante-huit logements en accession sociale. Cuisines sur rue, sejours sur jardin, aucun logement sur le parking.',
  },
  {
    rang: '07',
    nom: 'Ancienne conserverie Kerlan',
    lieu: 'Douarnenez (29)',
    programme: 'Rehabilitation',
    annee: 2022,
    surface: 2450,
    cout: 1610,
    ouvrage: 'Departement du Finistere',
    graine: 'sillon-conserverie',
    texte:
      'Conserverie de sardines devenue pole associatif. Les cuves de saumure sont restees en place et servent de jardinieres a la cour.',
  },
  {
    rang: '08',
    nom: 'Gymnase de Kerhuon',
    lieu: 'Le Relecq-Kerhuon (29)',
    programme: 'Equipement public',
    annee: 2021,
    surface: 1980,
    cout: 1870,
    ouvrage: 'Ville du Relecq-Kerhuon',
    graine: 'sillon-gymnase',
    texte:
      'Charpente lamelle-colle de vingt-quatre metres, sans poteau intermediaire. Bois des Landes ; chantier de onze mois, un de moins que prevu.',
    bois: true,
  },
]

/**
 * Les notes de chantier : les partis pris de l agence, et le chiffre qui les
 * tient, pose dans la marge.
 */
const NOTES: readonly {
  readonly rang: string
  readonly chiffre: string
  readonly quoi: string
  readonly titre: string
  readonly texte: string
}[] = [
  {
    rang: 'N.1',
    chiffre: '02',
    quoi: 'journees sur site, avant le premier trait',
    titre: 'Aucun projet ne commence sur plan.',
    texte:
      'Deux journees sur site, a des heures differentes, et un releve de ce qui existe deja — y compris ce que le programme voulait demolir.',
  },
  {
    rang: 'N.2',
    chiffre: '7 / 8',
    quoi: 'ouvrages livres dans l enveloppe ; le huitieme a 3 %',
    titre: 'Le cout au metre carre est fixe avant l esquisse.',
    texte:
      'Il ne bouge plus ensuite. Sept ouvrages sur huit ont ete livres dans l enveloppe ; le huitieme l a depassee de trois pour cent, et il est nomme.',
  },
  {
    rang: 'N.3',
    chiffre: '< 300',
    quoi: 'kilometres entre la carriere, la scierie et le chantier',
    titre: 'Rien n est prescrit sans avoir ete vu sortir de terre.',
    texte:
      'Bois de Bretagne ou des Landes, terre crue du site quand elle s y prete, pierre de Logonna.',
  },
  {
    rang: 'N.4',
    chiffre: '0',
    quoi: 'assemblage colle sur les huit planches',
    titre: 'Un batiment qu on peut defaire est un batiment qu on peut reparer.',
    texte:
      'Assemblages visses plutot que colles, planchers secs, reseaux apparents en gaine technique.',
  },
  {
    rang: 'N.5',
    chiffre: '11',
    quoi: 'personnes, jamais plus de trois chantiers en travaux',
    titre: 'Une petite agence, qui le reste.',
    texte:
      'Quatre architectes, trois chefs de projet, deux dessinateurs, une economiste, une assistante. Honoraires de 9 a 13 % du montant des travaux, grille remise avec l offre.',
  },
]

/** La legende du dossier, sur la derniere planche du rail. */
const LEGENDE: readonly (readonly [string, string])[] = [
  ['Surface', 'Surface de plancher au sens du code de l urbanisme'],
  [
    'Cout',
    'Montant des travaux au decompte final, hors honoraires et hors foncier, par metre carre',
  ],
  ['MOA', 'Maitrise d ouvrage — le commanditaire, non le financeur'],
  ['Bois', 'Structure principale en bois ou en materiau biosource'],
]

/* ===================== La planche 00 : la maquette de masses ============ */

/**
 * Une masse de la maquette.
 *
 * Une boite posee sur la trame : centre en `x` et `z`, **base** en `y`, et ses
 * trois dimensions. Le `seuil` est la progression du defilement a laquelle
 * elle commence a sortir de terre — c est ce qui fait qu une maquette se monte
 * au lieu d apparaitre.
 *
 * La meme liste sert deux fois : elle construit les volumes en three.js et
 * elle dessine l axonometrie de repli. Les deux montrent donc, par
 * construction, exactement le meme ouvrage.
 */
interface Masse {
  readonly cle: string
  readonly x: number
  readonly y: number
  readonly z: number
  readonly l: number
  readonly h: number
  readonly p: number
  readonly seuil: number
  /** Vrai pour la dalle et le socle : un beton plus sourd que les etages. */
  readonly socle?: boolean
  /** Vrai pour le gabarit du plan local : un fil, jamais un plein. */
  readonly fil?: boolean
}

/**
 * La maquette, en quatre temps : la dalle, les refends, les volumes, le
 * gabarit. Les cotes sont a l echelle de la trame de 5,40 m employee sur les
 * huit planches du dossier.
 */
const MAQUETTE: readonly Masse[] = [
  { cle: 'dalle', x: 0, y: 0, z: 0, l: 5.4, h: 0.16, p: 3.2, seuil: 0, socle: true },
  { cle: 'refend-1', x: -2.16, y: 0.16, z: 0, l: 0.09, h: 1.02, p: 2.5, seuil: 0.1 },
  { cle: 'refend-2', x: -1.08, y: 0.16, z: 0, l: 0.09, h: 1.02, p: 2.5, seuil: 0.14 },
  { cle: 'refend-3', x: 0, y: 0.16, z: 0, l: 0.09, h: 1.02, p: 2.5, seuil: 0.18 },
  { cle: 'refend-4', x: 1.08, y: 0.16, z: 0, l: 0.09, h: 1.02, p: 2.5, seuil: 0.22 },
  { cle: 'refend-5', x: 2.16, y: 0.16, z: 0, l: 0.09, h: 1.02, p: 2.5, seuil: 0.26 },
  {
    cle: 'plancher',
    x: 0,
    y: 1.18,
    z: 0,
    l: 5,
    h: 0.14,
    p: 2.9,
    seuil: 0.33,
    socle: true,
  },
  { cle: 'barre', x: -1, y: 1.32, z: -0.42, l: 3.1, h: 1.02, p: 1.5, seuil: 0.42 },
  { cle: 'tour', x: 1.92, y: 1.32, z: 0.28, l: 1.16, h: 2.1, p: 1.16, seuil: 0.5 },
  { cle: 'aile', x: -1.62, y: 1.32, z: 0.86, l: 1.7, h: 0.6, p: 1, seuil: 0.57 },
  {
    cle: 'casquette',
    x: -0.5,
    y: 2.34,
    z: -0.2,
    l: 2.4,
    h: 0.11,
    p: 1.95,
    seuil: 0.64,
    socle: true,
  },
  { cle: 'gabarit', x: 0, y: 0.16, z: 0, l: 5.4, h: 3.4, p: 3.2, seuil: 0.8, fil: true },
]

/** Les quatre temps du montage, dits dans la marge pendant que la maquette monte. */
const TEMPS = [
  {
    mot: 'La dalle',
    cote: '5,40 m',
    quoi: 'de trame, 2,90 m sous dalle',
    titre: 'Une dalle, et sa cote, avant toute forme.',
    texte:
      'La trame de cinq metres quarante et la hauteur libre sont arretees le premier jour. Tout le reste en decoule, y compris ce que nous ne construirons pas.',
  },
  {
    mot: 'Les refends',
    cote: '5',
    quoi: 'refends porteurs, aucun poteau au milieu',
    titre: 'Cinq refends, et rien entre eux.',
    texte:
      'Les murs porteurs vont au bord ; le plateau reste libre d un pignon a l autre. Un bureau se rend en logement sans toucher a la structure.',
  },
  {
    mot: 'Les volumes',
    cote: '3',
    quoi: 'masses, chacune assise sur un refend',
    titre: 'Les volumes sortent de la trame, pas l inverse.',
    texte:
      'Une barre, une cage d escalier, une aile basse. Chaque masse tombe sur un refend : aucune ne se pose sur un plancher, et aucune n a besoin d une reprise en sous-oeuvre.',
  },
  {
    mot: 'Le gabarit',
    cote: '18,60 m',
    quoi: 'autorises ; nous nous arretons a 16,40 m',
    titre: 'Le gabarit du plan local, et ce qu on lui laisse.',
    texte:
      'Le fil marque la hauteur constructible. Nous nous arretons deux metres vingt dessous, et le dernier niveau devient une terrasse plantee plutot qu un etage de plus.',
  },
] as const

/** L echelle du dessin d axonometrie, et son centre dans le cadre. */
const AXO = { echelle: 34, cx: 176, cy: 236 } as const

/**
 * L axonometrie dessinee de la maquette — le repli de la planche 00.
 *
 * Isometrie a trente degres : `x` part a droite, `z` a gauche, `y` monte. Trois
 * faces par masse suffisent a lire un volume ; les masses sont peintes de la
 * plus lointaine a la plus proche, ce qui rend l occultation sans profondeur.
 */
function Axonometrie(): ReactElement {
  const point = (x: number, y: number, z: number): string => {
    const px = AXO.cx + (x - z) * 0.866 * AXO.echelle
    const py = AXO.cy + ((x + z) * 0.5 - y) * AXO.echelle
    return `${px.toFixed(1)},${py.toFixed(1)}`
  }
  const rangees = [...MAQUETTE].sort((a, b) => a.y + a.x + a.z - (b.y + b.x + b.z))
  return (
    <svg
      viewBox="0 0 352 300"
      className="o-h-full o-w-full"
      aria-hidden="true"
      fill="none"
      strokeLinejoin="round"
    >
      {rangees.map((m) => {
        const gauche = m.x - m.l / 2
        const droite = m.x + m.l / 2
        const arriere = m.z - m.p / 2
        const avant = m.z + m.p / 2
        const haut = m.y + m.h
        const dessus = [
          point(gauche, haut, arriere),
          point(droite, haut, arriere),
          point(droite, haut, avant),
          point(gauche, haut, avant),
        ].join(' ')
        const flanc = [
          point(droite, haut, arriere),
          point(droite, haut, avant),
          point(droite, m.y, avant),
          point(droite, m.y, arriere),
        ].join(' ')
        const face = [
          point(gauche, haut, avant),
          point(droite, haut, avant),
          point(droite, m.y, avant),
          point(gauche, m.y, avant),
        ].join(' ')
        if (m.fil === true) {
          return (
            <g
              key={m.cle}
              stroke={encreSurSombre()}
              strokeWidth="1"
              strokeDasharray="5 4"
              opacity="0.75"
            >
              <polygon points={dessus} />
              <polygon points={flanc} />
              <polygon points={face} />
            </g>
          )
        }
        const clair = m.socle === true ? 0.5 : 0.62
        return (
          <g key={m.cle} stroke="rgba(255,255,255,0.82)" strokeWidth="0.9">
            <polygon points={face} fill={`rgba(255,255,255,${String(clair * 0.42)})`} />
            <polygon points={flanc} fill={`rgba(255,255,255,${String(clair * 0.66)})`} />
            <polygon points={dessus} fill={`rgba(255,255,255,${String(clair)})`} />
          </g>
        )
      })}
    </svg>
  )
}

/** Le filet du dossier, dans les deux themes. */
const FILET = 'o-border-zinc-300 dark:o-border-zinc-700'

/** La largeur d une planche dans le rail : large, sans jamais deborder. */
const LARGEUR_PLANCHE = 'clamp(300px, 72vw, 880px)'

/**
 * Le cartouche du dossier.
 *
 * Sur une planche reelle, il est encadre et il identifie le rendu. Ici il
 * reste pose en tete du rail pendant qu on parcourt les planches, et c est lui
 * qui filtre : le programme choisi retire des planches de la piste.
 */
function Cartouche({
  programme,
  onProgramme,
  nombre,
  surface,
}: {
  readonly programme: Programme | 'Tous'
  readonly onProgramme: (valeur: Programme | 'Tous') => void
  readonly nombre: number
  readonly surface: number
}): ReactElement {
  return (
    <div className={`o-w-full o-border-w-1 ${FILET} md:o-max-w-sm`}>
      <dl className="o-m-0 o-grid o-grid-cols-3 max-md:o-hidden">
        {(
          [
            ['Ordre', 'S12841'],
            ['Planches', `${String(nombre)} / ${String(PLANCHES.length)}`],
            ['Surface', `${surface.toLocaleString('fr-FR')} m2`],
          ] as const
        ).map(([quoi, valeur], rang) => (
          <div
            key={quoi}
            className={`o-px-3 o-py-2 ${rang < 2 ? `o-border-r ${FILET}` : ''}`}
          >
            <dt className="o-font-mono o-text-xs o-uppercase o-tracking-wider o-text-zinc-500 dark:o-text-zinc-400">
              {quoi}
            </dt>
            <dd className="o-m-0 o-mt-0.5 o-font-mono o-text-sm o-tabular-nums o-text-zinc-950 dark:o-text-zinc-50">
              {valeur}
            </dd>
          </div>
        ))}
      </dl>
      <div
        role="group"
        aria-label="Filtrer les planches par programme"
        className={`o-flex o-flex-wrap o-gap-x-3 o-gap-y-1 o-px-3 o-py-2 md:o-border-t ${FILET}`}
      >
        {(['Tous', ...PROGRAMMES] as const).map((option) => {
          const actif = programme === option
          return (
            <button
              key={option}
              type="button"
              aria-pressed={actif}
              onClick={() => {
                onProgramme(option)
              }}
              className="o-font-mono o-text-xs o-uppercase o-tracking-wider o-transition-colors focus:o-ring"
              style={
                actif
                  ? {
                      color: encre(),
                      fontWeight: 700,
                      textDecoration: 'underline',
                      textUnderlineOffset: '3px',
                    }
                  : { color: 'var(--o-theme-muted)' }
              }
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Une case de cartouche technique, en pied de planche. */
function Case({
  quoi,
  children,
  dernier = false,
}: {
  readonly quoi: string
  readonly children: ReactNode
  readonly dernier?: boolean
}): ReactElement {
  return (
    <div className={`o-min-w-0 o-px-3 o-py-2 ${dernier ? '' : `o-border-r ${FILET}`}`}>
      <dt className="o-font-mono o-text-xs o-uppercase o-tracking-wider o-text-zinc-500 dark:o-text-zinc-400">
        {quoi}
      </dt>
      <dd className="o-m-0 o-mt-0.5 o-truncate o-font-mono o-text-sm o-tabular-nums o-text-zinc-950 dark:o-text-zinc-50">
        {children}
      </dd>
    </div>
  )
}

/** Une planche du rail : la photographie, puis le cartouche technique. */
function PlancheRail({ planche }: { readonly planche: Planche }): ReactElement {
  return (
    <article className="o-mr-6 o-shrink-0 md:o-mr-8" style={{ width: LARGEUR_PLANCHE }}>
      <div
        className="o-relative o-overflow-hidden o-bg-zinc-100 dark:o-bg-zinc-900"
        style={{ height: 'min(36vh, 420px)' }}
      >
        <img
          src={photo(planche.graine, 1500, 900)}
          alt={`${planche.nom}, ${planche.lieu}`}
          decoding="async"
          className="o-absolute o-inset-0 o-size-full o-object-cover"
        />
        <span
          aria-hidden="true"
          className="o-absolute o-left-3 o-top-3 o-rounded-full o-bg-zinc-950 o-px-2.5 o-py-1 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-50"
        >
          PL. {planche.rang}
        </span>
      </div>
      <div className={`o-border-w-1 ${FILET}`} style={{ borderTopWidth: 0 }}>
        <div
          className={`o-flex o-flex-wrap o-items-baseline o-gap-x-4 o-gap-y-1 o-border-b ${FILET} o-px-3 o-py-2.5`}
        >
          <SplitReveal
            as="h3"
            by="words"
            stagger={70}
            distance={14}
            className="o-m-0 o-text-lg o-font-semibold o-tracking-tight o-text-zinc-950 dark:o-text-zinc-50 md:o-text-xl"
          >
            {planche.nom}
          </SplitReveal>
          <span className="o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
            {planche.lieu}
          </span>
          {planche.bois === true && (
            <span
              className="o-rounded-full o-px-2 o-py-0.5 o-font-mono o-text-xs"
              style={{ backgroundColor: accentDoux(500, 16), color: encre() }}
            >
              Bois
            </span>
          )}
          <span className="o-ml-auto o-font-mono o-text-xs o-tabular-nums o-text-zinc-500 dark:o-text-zinc-400">
            {planche.annee}
          </span>
        </div>
        <dl className="o-m-0 o-grid o-grid-cols-2 sm:o-grid-cols-4">
          <Case quoi="Surface">{planche.surface.toLocaleString('fr-FR')} m2</Case>
          <Case quoi="Cout">{planche.cout.toLocaleString('fr-FR')} EUR / m2</Case>
          <Case quoi="Programme">{planche.programme}</Case>
          <Case quoi="MOA" dernier>
            {planche.ouvrage}
          </Case>
        </dl>
        <p
          className={`o-m-0 o-border-t ${FILET} o-px-3 o-py-2.5 o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400 max-md:o-hidden`}
        >
          {planche.texte}
        </p>
      </div>
    </article>
  )
}

/** Un champ du formulaire en ligne : une ligne soulignee, rien d autre. */
function Champ({
  nom,
  type = 'text',
}: {
  readonly nom: string
  readonly type?: string
}): ReactElement {
  return (
    <label className="o-block o-grow">
      <span className="o-sr-only">{nom}</span>
      <input
        type={type}
        placeholder={nom}
        autoComplete={type === 'email' ? 'email' : 'name'}
        className="o-w-full o-border-b o-border-zinc-400 dark:o-border-zinc-600 o-bg-transparent o-py-4 o-text-lg o-text-zinc-950 dark:o-text-zinc-50 focus:o-ring"
        style={{ borderRadius: 0 }}
      />
    </label>
  )
}

/** La vitrine complete : un dossier de planches, parcouru de cote. */
export default function Page(): ReactElement {
  const polices = usePolices('manrope')
  const [programme, setProgramme] = useState<Programme | 'Tous'>('Tous')

  // Le cadre de la scene epinglee. `Epingle` ecrit sa progression dans `--p`
  // sur son propre element ; le cadre en est l enfant direct, donc son parent
  // porte la variable. La lire au style en ligne coute une propriete par
  // image — la relire au style calcule en couterait un recalcul entier.
  const cadre = useRef<HTMLDivElement>(null)
  const avancee = useRef(0)

  const maquette = useMemo(() => {
    /** Ce qui a ete monte, relu a chaque image pour faire sortir les masses. */
    let masses: readonly {
      readonly groupe: SceneContext['scene']['children'][number]
      readonly seuil: number
    }[] = []

    /**
     * La camera, a une progression donnee.
     *
     * Elle contourne la maquette de trois quarts avant a trois quarts arriere,
     * en montant et en se rapprochant. Le decalage `LATERAL` translate la
     * camera **et** son point de visee le long de l axe ecran : la maquette se
     * tient ainsi dans la moitie droite du cadre a tous les angles, ce qu un
     * simple decalage en `x` du modele ne donnerait pas — il tournerait avec
     * la camera.
     */
    const poser = (camera: SceneContext['camera'], p: number): void => {
      const angle = 0.72 - p * 2.5
      // Un cadre etroit : la legende passe au-dessus au lieu d etre a cote, la
      // maquette se recentre et descend sous le texte, et on recule d un pas.
      const etroit = camera.aspect < 1.1
      const rayon = (etroit ? 11.4 : 9.7) - p * 0.9
      const lateral = etroit ? 0.7 : 3
      // Perpendiculaire a la visee, dans le plan horizontal.
      const dx = -lateral * Math.cos(angle)
      const dz = lateral * Math.sin(angle)
      camera.position.set(
        Math.sin(angle) * rayon + dx,
        2.4 + p * 2.6,
        Math.cos(angle) * rayon + dz,
      )
      // La visee descend a mesure que la camera monte : sans cela la maquette
      // glisserait vers le bas du cadre au fur et a mesure du survol.
      camera.lookAt(dx, (etroit ? 3.4 : 1.7) - p * 0.5, dz)
    }

    return (
      <Volume
        nom="maquette de masses"
        className="o-absolute o-inset-0 o-z-0 o-pointer-events-none"
        repli={
          <div className="o-flex o-h-full o-items-center o-justify-center o-p-8 md:o-justify-end md:o-p-14">
            <div className="o-w-full o-max-w-xl">
              <Axonometrie />
            </div>
          </div>
        }
        construire={(contexte) => {
          const { scene, camera, three } = contexte
          const beton = teinte('--o-vitrine-300', '#d9d4cb')
          const socle = teinte('--o-vitrine-500', '#a49c8e')
          const trace = teinte('--o-vitrine-200', '#e6e1d8')

          const matiereEtage = new three.MeshStandardMaterial({
            color: beton,
            roughness: 0.58,
            metalness: 0.06,
          })
          const matiereSocle = new three.MeshStandardMaterial({
            color: socle,
            roughness: 0.82,
            metalness: 0.04,
          })
          const filDesAretes = new three.LineBasicMaterial({
            color: 0xffffff,
            transparent: true,
            opacity: 0.34,
          })
          const filDuGabarit = new three.LineBasicMaterial({
            color: trace,
            transparent: true,
            opacity: 0.55,
          })

          // La maquette est posee a l origine, un quart de tour de biais : la
          // camera, elle, se decale — voir `poser`.
          const racine = new three.Group()
          racine.rotation.y = -0.34
          racine.scale.setScalar(0.86)

          const montees = MAQUETTE.map((m) => {
            const groupe = new three.Group()
            groupe.position.set(m.x, m.y, m.z)
            const forme = new three.BoxGeometry(m.l, m.h, m.p)
            const aretes = new three.EdgesGeometry(forme)
            if (m.fil === true) {
              const cage = new three.LineSegments(aretes, filDuGabarit)
              cage.position.y = m.h / 2
              groupe.add(cage)
            } else {
              const bloc = new three.Mesh(
                forme,
                m.socle === true ? matiereSocle : matiereEtage,
              )
              bloc.position.y = m.h / 2
              const traits = new three.LineSegments(aretes, filDesAretes)
              traits.position.y = m.h / 2
              groupe.add(bloc, traits)
            }
            // Une masse part ecrasee sur la trame, et cachee : elle s extrude
            // quand le defilement l appelle.
            groupe.scale.y = 0.001
            groupe.visible = m.seuil === 0
            racine.add(groupe)
            return { groupe, seuil: m.seuil, formes: [forme, aretes] }
          })
          masses = montees.map(({ groupe, seuil }) => ({ groupe, seuil }))
          scene.add(racine)

          eclairer(contexte, {
            cle: 0xfff3e2,
            remplissage: 0x8fa2cc,
            contour: 0xffffff,
            force: 1.2,
          })
          // Une rasante sous la dalle : sans elle, les refends se referment en
          // une seule tache et la maquette redevient un bloc.
          const rasante = new three.PointLight(0xffffff, 30, 30, 2)
          rasante.position.set(-5.5, 1.2, 5)
          scene.add(rasante)

          poser(camera, 0)

          return () => {
            matiereEtage.dispose()
            matiereSocle.dispose()
            filDesAretes.dispose()
            filDuGabarit.dispose()
            for (const { formes } of montees) {
              for (const forme of formes) forme.dispose()
            }
            masses = []
          }
        }}
        animer={({ camera }, { delta }) => {
          const parent = cadre.current?.parentElement
          const brut =
            parent === null || parent === undefined
              ? 0
              : Number.parseFloat(parent.style.getPropertyValue('--p'))
          const vise = Number.isFinite(brut) ? Math.min(1, Math.max(0, brut)) : 0
          // Un suivi amorti : le defilement d une molette est saccade, une
          // camera d architecte ne l est pas.
          avancee.current += (vise - avancee.current) * Math.min(1, delta * 5)
          const p = avancee.current
          poser(camera, p)

          for (const { groupe, seuil } of masses) {
            const part = Math.min(1, Math.max(0, (p - seuil) / 0.14))
            // Tant qu une masse n est pas appelee elle n existe pas : une boite
            // ecrasee resterait lisible comme une plaque posee en l air.
            groupe.visible = part > 0
            // Une sortie amortie, pour que la masse se pose au lieu de claquer.
            groupe.scale.y = 0.001 + (1 - (1 - part) ** 3) * 0.999
          }
        }}
      />
    )
  }, [])

  const retenues = useMemo(
    () => PLANCHES.filter((p) => programme === 'Tous' || p.programme === programme),
    [programme],
  )
  const surface = useMemo(() => retenues.reduce((s, p) => s + p.surface, 0), [retenues])

  return (
    <Porte forme="trou" marque="Sillon" sombre={false}>
      <div
        className="o-bg-white dark:o-bg-zinc-950 o-text-zinc-900 dark:o-text-zinc-100"
        style={polices}
      >
        {/* ================= 1. L ouverture, de gouttiere a gouttiere ======= */}
        <header
          id="haut"
          className="o-relative o-isolate o-flex o-min-h-screen o-flex-col o-overflow-hidden o-bg-white dark:o-bg-zinc-950"
        >
          <BarreCoins
            marque="Sillon"
            liens={[
              ['#maquette', 'La maquette'],
              ['#dossier', 'Le dossier'],
              ['#notes', 'Les notes'],
              ['#contact', 'Nous ecrire'],
            ]}
            droite="Brest — depuis 2014"
            sombre={false}
          />

          <div className="o-relative o-z-10 o-flex o-grow o-flex-col o-justify-between o-gap-10 o-px-6 o-pb-6 o-pt-10 md:o-px-8">
            <div className="o-grid o-gap-8 md:o-grid-cols-12">
              <div className="o-min-w-0 md:o-col-span-8">
                <Surgit>
                  <Etiquette sombre={false}>
                    Dossier de references — huit ouvrages livres
                  </Etiquette>
                </Surgit>
                <TitreVague
                  delai={120}
                  className="o-m-0 o-mt-6 o-max-w-4xl o-text-zinc-950 dark:o-text-zinc-50"
                  style={affiche('l', 300)}
                >
                  Huit ouvrages livres, avec leur cout au decompte final.
                </TitreVague>
              </div>
              <Surgit
                delai={360}
                className="o-flex o-flex-col o-justify-end o-gap-6 md:o-col-span-4"
              >
                <p className="o-m-0 o-max-w-sm o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                  Le cout indique est celui des travaux, ramene au metre carre de
                  plancher. Celui du decompte final, pas celui de l estimation.
                </p>
                <Actions
                  sombre={false}
                  pleine={[
                    '#dossier',
                    <>
                      Ouvrir le dossier{' '}
                      <Icon icon={ArrowRight} size={16} aria-hidden="true" />
                    </>,
                  ]}
                  fantome={['#notes', 'Les notes de chantier']}
                />
              </Surgit>
            </div>

            {/* La photographie pleine largeur, qui derive contre le defilement ;
              sa legende est posee dans la marge, en mono, comme sur un rendu. */}
            <Surgit delai={560} as="div">
              <ParallaxImage
                src={photo('sillon-blosne', 1800, 900)}
                alt="Logements au Blosne, facade en zinc et balcons filants"
                ratio={2.6}
                strength={0.3}
                className="o-w-full o-object-cover"
              />
              <div className="o-mt-3 o-flex o-flex-wrap o-items-baseline o-justify-between o-gap-x-6 o-gap-y-1 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                <p className="o-m-0">
                  <span style={{ color: encre() }}>PL. 01</span> — Les Ateliers du Blosne,
                  Rennes — 1 840 EUR / m2
                </p>
                <p className="o-m-0">Ordre des architectes S12841 — Bretagne</p>
              </div>
            </Surgit>
          </div>
        </header>

        <main>
          {/* ================= 2. PL. 00 — la maquette de masses ==============
            Une coupe sombre au milieu d une page blanche, epinglee trois ecrans
            et demi. La maquette se monte pendant qu on la contourne : la dalle,
            les refends, les volumes, puis le gabarit du plan local en fil. */}
          <section
            id="maquette"
            className="o-scroll-mt-24"
            aria-label="Planche 00 — maquette de masses"
          >
            <Epingle ecrans={3.6} actes={TEMPS.length} style={nuit('zinc')}>
              {(acte, progression) => {
                const t = TEMPS[acte] ?? TEMPS[0]
                return (
                  <div ref={cadre} className="o-absolute o-inset-0 o-overflow-hidden">
                    {/* Le decor, sous le repli : un degrade CSS, la ou la page
                      portait un fond en three.js. */}
                    <div
                      aria-hidden="true"
                      className="o-absolute o-inset-0 o-z-0"
                      style={{
                        background: [
                          `radial-gradient(58% 52% at 68% 46%, ${accentDoux(400, 30)}, transparent 70%)`,
                          `radial-gradient(74% 62% at 12% 96%, ${accentDoux(700, 20)}, transparent 76%)`,
                          'linear-gradient(180deg, var(--o-palette-zinc-950) 0%, var(--o-palette-zinc-900) 100%)',
                        ].join(', '),
                      }}
                    />
                    {maquette}

                    {/* Le meme degrade repris par-dessus le canevas, en clair :
                      une surface three.js est opaque, et un degrade pose
                      dessous ne se verrait jamais. */}
                    <div
                      aria-hidden="true"
                      className="o-pointer-events-none o-absolute o-inset-0 o-z-10"
                      style={{
                        background: [
                          'radial-gradient(60% 54% at 70% 44%, color-mix(in oklab, var(--o-vitrine-400) 16%, transparent), transparent 72%)',
                          'radial-gradient(78% 64% at 8% 98%, color-mix(in oklab, var(--o-vitrine-700) 30%, transparent), transparent 74%)',
                        ].join(', '),
                      }}
                    />

                    {/* Les voiles qui gardent la colonne de texte lisible : par la
                      gauche sur un grand cadre, par le haut sur un petit. */}
                    <div
                      aria-hidden="true"
                      className="o-pointer-events-none o-absolute o-inset-0 o-z-10 max-md:o-hidden"
                      style={{
                        background:
                          'linear-gradient(90deg, var(--o-palette-zinc-950) 6%, color-mix(in oklab, var(--o-palette-zinc-950) 62%, transparent) 40%, transparent 64%)',
                      }}
                    />
                    <div
                      aria-hidden="true"
                      className="o-pointer-events-none o-absolute o-inset-0 o-z-10 md:o-hidden"
                      style={{
                        background:
                          'linear-gradient(180deg, color-mix(in oklab, var(--o-palette-zinc-950) 90%, transparent) 0%, color-mix(in oklab, var(--o-palette-zinc-950) 86%, transparent) 62%, transparent 100%)',
                      }}
                    />

                    <div className="o-relative o-z-20 o-flex o-h-full o-flex-col o-justify-center o-px-6 md:o-px-8">
                      <div className="o-grid o-gap-x-8 o-gap-y-10 md:o-grid-cols-12">
                        {/* La marge : le numero de planche, les quatre temps, la cote. */}
                        <div className="md:o-col-span-3">
                          <Indice rang="00">La maquette</Indice>
                          <ol className="o-m-0 o-mt-8 o-list-none o-p-0">
                            {TEMPS.map((autre, rang) => (
                              <li
                                key={autre.mot}
                                className="o-flex o-items-center o-gap-3 o-py-1 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                                style={{
                                  color:
                                    rang === acte
                                      ? encreSurSombre()
                                      : 'var(--o-theme-muted)',
                                }}
                              >
                                <span
                                  aria-hidden="true"
                                  className="o-h-px o-transition-all"
                                  style={{
                                    width: rang === acte ? 26 : 8,
                                    backgroundColor: 'currentColor',
                                  }}
                                />
                                {autre.mot}
                              </li>
                            ))}
                          </ol>
                          <p className="o-m-0 o-mt-10 o-font-mono o-text-4xl o-tabular-nums o-tracking-tight o-text-zinc-50 md:o-text-5xl">
                            {t.cote}
                          </p>
                          <p className="o-m-0 o-mt-1 o-max-w-xs o-font-mono o-text-xs o-leading-relaxed o-text-zinc-400">
                            {t.quoi}
                          </p>
                        </div>

                        {/* Le propos, cale a gauche de la maquette. */}
                        <div className="o-min-w-0 md:o-col-span-4">
                          <h2
                            className="o-m-0 o-max-w-md o-text-balance o-text-zinc-50"
                            style={{
                              ...affiche('m', 300),
                              fontSize: 'clamp(1.75rem, 3.4vw, 3rem)',
                            }}
                          >
                            {t.titre}
                          </h2>
                          <p className="o-m-0 o-mt-6 o-max-w-sm o-text-base o-leading-relaxed o-text-zinc-300">
                            {t.texte}
                          </p>
                        </div>
                      </div>

                      <p className="o-pointer-events-none o-absolute o-bottom-16 o-right-6 o-m-0 o-text-right o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400 max-md:o-hidden md:o-bottom-20 md:o-right-8">
                        PL. 00 — maquette de masses
                        <br />
                        Echelle 1 / 200 — tilleul et carton bois
                      </p>
                    </div>

                    {/* La reglette : ou l on en est du montage. */}
                    <div
                      aria-hidden="true"
                      className="o-absolute o-bottom-8 o-left-6 o-right-6 o-z-20 o-h-px o-bg-white-10 md:o-left-8 md:o-right-8"
                    >
                      <div
                        className="o-h-full"
                        style={{
                          width: `${String(Math.round(progression * 100))}%`,
                          backgroundColor: encreSurSombre(),
                          transition: 'width 220ms linear',
                        }}
                      />
                    </div>
                  </div>
                )
              }}
            </Epingle>
          </section>

          {/* ================= 3. Le rail des planches ========================= */}
          <div id="dossier" className={`o-scroll-mt-24 o-border-t ${FILET}`}>
            <Rail
              ecrans={3.2}
              entete={
                <div className="o-px-6 o-pb-4 o-pt-6 md:o-px-8">
                  <div className="o-flex o-flex-wrap o-items-end o-justify-between o-gap-x-10 o-gap-y-4">
                    <div>
                      <Indice rang="01" sombre={false}>
                        Le dossier
                      </Indice>
                      <h2
                        className="o-m-0 o-mt-3 o-text-zinc-950 dark:o-text-zinc-50"
                        style={{
                          ...affiche('m', 300),
                          fontSize: 'clamp(1.75rem, 3.6vw, 3.25rem)',
                        }}
                      >
                        Le dossier, planche par planche.
                      </h2>
                    </div>
                    <Cartouche
                      programme={programme}
                      onProgramme={setProgramme}
                      nombre={retenues.length}
                      surface={surface}
                    />
                  </div>
                </div>
              }
            >
              <div aria-hidden="true" className="o-w-6 o-shrink-0 md:o-w-8" />

              {retenues.map((planche) => (
                <PlancheRail key={planche.rang} planche={planche} />
              ))}

              {/* La derniere planche : la legende du dossier. */}
              <div
                className="o-mr-6 o-shrink-0 o-self-center md:o-mr-8"
                style={{ width: 'clamp(260px, 34vw, 420px)' }}
              >
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                  Legende du dossier
                </p>
                <dl className={`o-m-0 o-mt-4 o-border-t ${FILET}`}>
                  {LEGENDE.map(([signe, quoi]) => (
                    <div
                      key={signe}
                      className={`o-grid o-grid-cols-4 o-gap-x-3 o-border-b ${FILET} o-py-2.5`}
                    >
                      <dt
                        className="o-font-mono o-text-xs o-uppercase o-tracking-wider"
                        style={{ color: encre() }}
                      >
                        {signe}
                      </dt>
                      <dd className="o-m-0 o-col-span-3 o-text-xs o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                        {quoi}
                      </dd>
                    </div>
                  ))}
                </dl>
                <p className="o-m-0 o-mt-4 o-font-mono o-text-xs o-leading-relaxed o-text-zinc-500 dark:o-text-zinc-400">
                  {retenues.length === PLANCHES.length
                    ? 'Dossier complet — huit planches.'
                    : `Extrait — ${String(retenues.length)} planche${retenues.length > 1 ? 's' : ''} sur huit.`}
                </p>
              </div>
              <div aria-hidden="true" className="o-w-6 o-shrink-0 md:o-w-8" />
            </Rail>
          </div>

          {/* ================= 4. Le parti pris : un ecran de texte seul ======
            Rien d autre qu une phrase, dont la premiere moitie est eteinte, et
            une photographie en bichromie qui deborde sur les notes : c est la
            seule fois ou le dossier sort de son cadre. */}
          <section
            className={`o-relative o-border-t ${FILET} o-px-6 o-pb-0 o-pt-24 md:o-px-8 md:o-pt-36`}
          >
            <div className="o-grid o-gap-x-8 o-gap-y-12 md:o-grid-cols-12">
              <div className="o-min-w-0 md:o-col-span-8">
                <Indice rang="02" sombre={false}>
                  Le parti pris
                </Indice>
                <div className="o-mt-10">
                  <Manifeste
                    sombre={false}
                    eteint="Un plan ne dit rien du prix, et un rendu ne dit rien de la lumiere."
                  >
                    Alors nous montrons huit chantiers finis, la facture ouverte, et les
                    deux journees passees sur site avant le premier trait.
                  </Manifeste>
                </div>
                <div className="o-mt-14 o-flex o-flex-wrap o-items-center o-gap-x-8 o-gap-y-6">
                  <Autocollant angle={-4}>Rev. C — septembre 2026</Autocollant>
                  <p className="o-m-0 o-max-w-xs o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                    Onze personnes, jamais plus de trois chantiers en travaux
                  </p>
                </div>
              </div>

              {/* La photographie deborde de sa section : elle passe par-dessus le
                filet des notes de chantier, un peu comme un tirage pose de
                travers sur le dossier suivant. */}
              <figure
                className="o-relative o-z-10 o-m-0 o-min-w-0 md:o-col-span-4"
                style={{ marginBottom: 'clamp(-9rem, -8vw, -3rem)' }}
              >
                <Duotone
                  src={photo('sillon-conserverie', 900, 1200)}
                  alt="Ancienne conserverie Kerlan, cuves de saumure conservees dans la cour"
                  ratio={0.78}
                  hover={false}
                  shadow="var(--o-palette-zinc-950)"
                  light="var(--o-vitrine-200)"
                  className="o-w-full"
                />
                <figcaption className="o-mt-3 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                  <span style={{ color: encre() }}>PL. 07</span> — Kerlan, Douarnenez
                  <br />
                  Les cuves de saumure sont restees
                </figcaption>
              </figure>
            </div>
          </section>

          {/* ================= 5. Les notes de chantier, chiffres dans la marge ===== */}
          <section
            id="notes"
            className={`o-scroll-mt-24 o-border-t ${FILET} o-px-6 o-py-20 md:o-px-8 md:o-py-28`}
          >
            <div className="o-grid o-gap-x-8 o-gap-y-10 md:o-grid-cols-12">
              <div className="md:o-col-span-3">
                <Indice rang="03" sombre={false}>
                  Notes de chantier
                </Indice>
              </div>
              <h2
                className="o-m-0 o-max-w-2xl o-text-zinc-950 dark:o-text-zinc-50 md:o-col-span-6"
                style={{ ...affiche('m', 300), fontSize: 'clamp(2rem, 4.2vw, 3.75rem)' }}
              >
                Cinq prescriptions, et le chiffre qui les tient.
              </h2>
            </div>

            <ol className={`o-m-0 o-mt-16 o-list-none o-border-t ${FILET} o-p-0`}>
              {NOTES.map((note) => (
                <li
                  key={note.rang}
                  className={`o-grid o-gap-x-8 o-gap-y-3 o-border-b ${FILET} o-py-8 md:o-grid-cols-12`}
                >
                  {/* La marge : le chiffre en mono, et ce qu il compte. */}
                  <div className="md:o-col-span-3">
                    <p
                      className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest"
                      style={{ color: encre() }}
                    >
                      {note.rang}
                    </p>
                    <p className="o-m-0 o-mt-2 o-font-mono o-text-3xl o-tabular-nums o-tracking-tight o-text-zinc-950 dark:o-text-zinc-50 md:o-text-4xl">
                      {note.chiffre}
                    </p>
                    <p className="o-m-0 o-mt-1 o-max-w-xs o-font-mono o-text-xs o-leading-relaxed o-text-zinc-500 dark:o-text-zinc-400">
                      {note.quoi}
                    </p>
                  </div>
                  <div className="md:o-col-span-6">
                    <h3 className="o-m-0 o-text-xl o-font-medium o-tracking-tight o-text-zinc-950 dark:o-text-zinc-50 md:o-text-2xl">
                      {note.titre}
                    </h3>
                    <p className="o-m-0 o-mt-3 o-max-w-lg o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
                      {note.texte}
                    </p>
                  </div>
                  {/* La colonne de droite reste vide : c est la marge du dossier. */}
                </li>
              ))}
            </ol>
          </section>

          {/* ================= 6. Le formulaire en ligne, et son disque ======= */}
          <section
            id="contact"
            className={`o-scroll-mt-24 o-border-t ${FILET} o-px-6 o-py-20 md:o-px-8 md:o-py-28`}
          >
            <div className="o-grid o-gap-x-8 o-gap-y-8 md:o-grid-cols-12">
              <div className="md:o-col-span-3">
                <Indice rang="04" sombre={false}>
                  Un projet
                </Indice>
                <p className="o-m-0 o-mt-6 o-max-w-xs o-font-mono o-text-xs o-leading-relaxed o-text-zinc-500 dark:o-text-zinc-400">
                  Reponse sous cinq jours ouvres.
                  <br />
                  agence@sillon-architecture.fr
                  <br />
                  22 rue de Siam, 29200 Brest
                </p>
              </div>
              <div className="md:o-col-span-9">
                <h2
                  className="o-m-0 o-max-w-3xl o-text-zinc-950 dark:o-text-zinc-50"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(2rem, 4.2vw, 3.75rem)',
                  }}
                >
                  Ecrivez-nous avant la premiere esquisse.
                </h2>
                <form
                  className="o-mt-12 o-flex o-flex-wrap o-items-end o-gap-x-8 o-gap-y-6"
                  aria-label="Nous ecrire"
                  onSubmit={(event) => {
                    event.preventDefault()
                  }}
                >
                  <Champ nom="Votre nom" />
                  <Champ nom="Votre courriel" type="email" />
                  <Magnetic strength={0.4} radius={140}>
                    <button
                      type="submit"
                      aria-label="Envoyer"
                      className="o-inline-flex o-size-16 o-shrink-0 o-items-center o-justify-center o-rounded-full o-transition-transform hover:o-scale-105 focus:o-ring md:o-size-20"
                      style={aplat()}
                    >
                      <Icon icon={ArrowUpRight} size={22} aria-hidden="true" />
                    </button>
                  </Magnetic>
                </form>
              </div>
            </div>
          </section>
        </main>

        {/* ================= 7. Le pied : une seule ligne ==================== */}
        <footer className="o-border-t o-border-zinc-900 dark:o-border-zinc-100 o-px-6 o-py-5 md:o-px-8">
          <div className="o-flex o-flex-wrap o-items-center o-justify-between o-gap-x-8 o-gap-y-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
            <span className="o-text-zinc-950 dark:o-text-zinc-50">
              Sillon architecture
            </span>
            <nav
              aria-label="Pied de page"
              className="o-flex o-flex-wrap o-gap-x-6 o-gap-y-1"
            >
              {(
                [
                  ['#maquette', 'La maquette'],
                  ['#dossier', 'Le dossier'],
                  ['#notes', 'Les notes'],
                  ['#contact', 'Nous ecrire'],
                  ['#haut', 'Haut de page'],
                ] as const
              ).map(([href, mot]) => (
                <a
                  key={href}
                  href={href}
                  className="o-no-underline o-text-zinc-500 dark:o-text-zinc-400 hover:o-text-zinc-950 dark:hover:o-text-zinc-50 o-transition-colors focus:o-ring"
                >
                  {mot}
                </a>
              ))}
            </nav>
            <span>
              © 2026 — SARL au capital de 30 000 EUR — RCS Brest 801 447 220 — MAF 148 902
              K
            </span>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
