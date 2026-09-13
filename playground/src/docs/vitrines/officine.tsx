/**
 * Odoro — maison de parfum, sur papier millimetre.
 *
 * ## D ou vient la page
 *
 * C est le portage du site livre `templates/parfum` — le template Artefakt
 * rehabille en papier creme, puis converti en maison de parfum. La composition
 * ecran par ecran est la sienne : l entete, le heros a marqueurs, la matiere
 * premiere, les quatre extraits, la pyramide olfactive, les questions, le
 * pied a bulletin. Ce qui change est le moteur : l horloge du systeme a la
 * place de react-spring, les classes `o-*` a la place de Tailwind, un flacon
 * modele en primitives a la place du GLB, et des icones redessinees en ligne.
 *
 * ## Le mecanisme : un flacon qui traverse la page
 *
 * Un seul canevas, colle derriere toute la page, porte le flacon. Il est
 * centre dans le heros ; pendant que la copie defile il **tourne d un quart de
 * tour et glisse vers la droite** pour se poser derriere la colonne de
 * specifications ; il sort par le haut quand les collections arrivent ; et
 * il **revient par la gauche, epingle**, sur l ecran des questions. C est une
 * trajectoire de camera, jamais une seconde scene : la camera se deplace, le
 * flacon reste a l origine et tourne sur lui-meme.
 *
 * La trajectoire ne se lit pas sur une hauteur fixe de piste : les sections
 * n ont pas toutes la meme taille d un ecran a l autre, et une progression
 * globale deriverait. Elle se lit sur **les sections elles-memes**, mesurees a
 * chaque image — le heros qui s en va, les details qui s en vont, les
 * questions qui arrivent — et la pose visee est rattrapee avec inertie.
 *
 * ## Le canevas est opaque, et c est la trame qui gagne
 *
 * Le moteur ouvre ses contextes sans transparence : rien de ce qui passe sous
 * un canevas ne se voit. Or la page est une trame de papier en CSS, et le
 * flacon doit sembler pose dessus. Le canevas rend donc le flacon sur un fond
 * blanc et se **multiplie** sur le papier : le blanc disparait, le verre
 * ambre encre la trame comme une impression. En theme sombre, le fond est
 * noir et le canevas passe en `screen` — le noir disparait, le verre s allume.
 * Le mot-marque en filigrane est dans la scene, derriere le flacon, pour que
 * celui-ci le recouvre vraiment.
 *
 * ## La trame, et la lueur qui suit le curseur
 *
 * Comme dans la source : un fond de cellules, deux degrades repetes qui posent
 * les barres, et **trois degrades radiaux fixes sous les barres** — un serre
 * sur le pointeur, un large qui dissout le bord du premier, un troisieme qui
 * traine derriere. Les barres peignent par-dessus la lumiere et la coupent en
 * cellules : c est la grille qui s allume, pas une lampe qui l eclaire.
 *
 * @module
 */

import { CLOCK_PRIORITY, clock, useMotionState } from '@odoro-cli/engine'
import { type SceneContext } from '@odoro-cli/engine/three'
import { Icon } from '@odoro-cli/icons'
import { ArrowRight } from '@odoro-cli/icons/filaire'
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  type RefObject,
} from 'react'

import { DecodeText } from '@/odoro/text/DecodeText.jsx'
import { TiltCard } from '@/odoro/ui/TiltCard.jsx'

import { CHROME, Porte, Surgit, usePolices } from './marche.jsx'
import { accent, accentDoux, encre } from './palettes.js'
import { Aimant, Epingle } from './scene.jsx'
import { eclairer, teinte, Volume } from './volume.jsx'

/** La hauteur d un ecran sous les barres de la documentation. */
const ECRAN = `calc(100vh - ${String(CHROME)}px)`

/* ============================ Le contenu =============================== */

const NAVIGATION = [
  { mot: 'BOUTIQUE', cible: '#collections' },
  {
    mot: 'COLLECTIONS',
    cible: '#collections',
    sousMenu: [
      ['OMBRE D OUD', '#collections'],
      ['VETIVER DES CHAMPS', '#collections'],
      ['AMBRE THERMAL', '#collections'],
      ['IRIS DE PIERRE', '#collections'],
    ] as const,
  },
  { mot: 'COMPOSITION', cible: '#composition' },
  { mot: 'MAISON', cible: '#questions' },
] as const

const MARQUEUR_GAUCHE = ['DISTILLE', 'POUR LA PEAU.', 'FAIT POUR DURER.'] as const
const MARQUEUR_DROIT = ['COMPOSE', 'POUR L INVISIBLE.', 'PORTE A DESSEIN.'] as const

const TITRE = ['EXTRAIT A 22 %. REACTIF A LA PEAU.', 'SILLAGE DE DOUZE HEURES. SERIE LIMITEE.'] as const

const BADGE_GAUCHE = {
  legende: 'DEP.2021',
  lignes: ['NE DE LA CHIMIE.', 'MENE PAR L OBSESSION.', 'COMPOSE A LA MAIN.'],
} as const
const BADGE_DROIT = { lignes: ['LIVRAISON MONDIALE', 'RAPIDE ET SECURISEE'] } as const

/** Les cinq lignes de specification, avec le pictogramme redessine. */
const SPECIFICATIONS = [
  { rang: '01', icone: 'froid', titre: 'TETE STABILISEE', texte: 'UN DEPART D AGRUMES FROIDS QUI NE S EVAPORE PAS.' },
  { rang: '02', icone: 'chaleur', titre: 'COEUR D AMBRE CHAUD', texte: 'AMBRE ET BENJOIN PORTENT LA CHALEUR SANS ALOURDIR LA COMPOSITION.' },
  { rang: '03', icone: 'colonne', titre: 'FOND RENFORCE', texte: 'MOUSSE DE CHENE ET VETIVER DONNENT AU FOND SA COLONNE VERTEBRALE.' },
  { rang: '04', icone: 'diffusion', titre: 'DIFFUSION MAITRISEE', texte: 'UN SILLAGE MESURE QUI RESTE PRES DU CORPS PLUTOT QUE D EMPLIR UNE PIECE.' },
  { rang: '05', icone: 'fiole', titre: 'CONCENTRATION EXTRAIT', texte: 'VINGT-DEUX POUR CENT DE CONCENTRE POUR LA PROFONDEUR ET LA TENUE.' },
] as const

/**
 * Les quatre extraits. Les prix sont ceux de la source, qui les dit
 * eux-memes inventes : ils ne servent qu a porter l etat de survol.
 */
const EXTRAITS = [
  { rang: '01', nom: 'OMBRE D OUD', prix: '280 EUR', liquide: '#5a3a26', puces: ['EXTRAIT 22 %', 'SERIE LIMITEE'] },
  { rang: '02', nom: 'VETIVER DES CHAMPS', prix: '240 EUR', liquide: '#5f7a4f', puces: ['PARFUM 18 %', 'MIXTE'] },
  { rang: '03', nom: 'AMBRE THERMAL', prix: '310 EUR', liquide: 'var(--o-vitrine-500)', puces: ['FOND D AMBRE', 'DOUZE HEURES'] },
  { rang: '04', nom: 'IRIS DE PIERRE', prix: '190 EUR', liquide: '#7a6f94', puces: ['COLOGNE 12 %', 'PRES DE LA PEAU'] },
] as const

/** Les cinq couches de la pyramide, du sommet volatil a la resine du fond. */
const COUCHES = [
  { rang: '01', icone: 'sommet', titre: 'NOTES DE TETE', texte: 'Les premieres minutes : agrumes froids, poivre rose, une arete de metal.' },
  { rang: '02', icone: 'grille', titre: 'STRUCTURE DU COEUR', texte: 'Iris et feuille de violette tiennent l ensemble.' },
  { rang: '03', icone: 'plume', titre: 'AMBRE THERMAL', texte: 'Ambre et benjoin portent la chaleur sans alourdir le fond du parfum.' },
  { rang: '04', icone: 'cube', titre: 'MEMBRANE FUMEE', texte: 'Goudron de bouleau et encens laissent respirer le sucre sans gourmandise.' },
  { rang: '05', icone: 'vague', titre: 'FOND DE PEAU', texte: 'Musc, vetiver et santal se posent pour la longue tenue.' },
] as const

const QUESTIONS = [
  { rang: '01', question: 'COMBIEN DE TEMPS TIENT L EXTRAIT ?', reponse: 'Entre huit et douze heures sur la plupart des peaux. La concentration en extrait porte le fond jusqu a la fin de la journee.' },
  { rang: '02', question: 'QUELLES MATIERES DANS L EXTRAIT ?', reponse: 'Oud naturel, absolu d iris, vetiver et un fond d ambre stabilise, assembles pour la profondeur et la tenue.' },
  { rang: '03', question: 'COMMENT CONSERVER LE FLACON ?', reponse: 'Debout, a l abri de la lumiere et de la chaleur. Les deux abiment la tete bien avant le fond.' },
  { rang: '04', question: 'LIVREZ-VOUS A L INTERNATIONAL ?', reponse: 'Oui. Livraison mondiale, securisee et suivie sur chaque commande.' },
  { rang: '05', question: 'PUIS-JE RETOURNER MA COMMANDE ?', reponse: 'Oui. Un flacon non ouvert peut etre retourne ou echange dans le delai indique.' },
] as const

const COLONNES_PIED = [
  { titre: 'BOUTIQUE', liens: ['EXTRAITS', 'PARFUMS', 'EDITIONS'] },
  { titre: 'COMPOSITION', liens: ['MATIERES', 'ORIGINES'] },
  { titre: 'MAISON', liens: [] },
  { titre: 'AIDE', liens: ['CONFIDENTIALITE', 'Conditions generales', 'COMMENT LE PORTER', 'LIVRAISON ET RETOURS', 'FAQ'] },
] as const

const RESEAUX = ['INSTAGRAM', 'YOUTUBE', 'TIK-TOK'] as const

/* ============================ La feuille =============================== */

/**
 * Ce que les utilitaires n ont pas : la trame, la lampe, le melange du
 * canevas selon le theme, et les etats de survol des cartes.
 *
 * Les couleurs sont toutes des melanges de l accent de la vitrine et du fond
 * du theme : la page se reteinte et suit le theme sans qu une nuance soit
 * ecrite en dur.
 */
const FEUILLE = [
  '.of-racine{',
  '--of-cellule:light-dark(color-mix(in oklab,var(--o-vitrine-800) 9%,var(--o-theme-bg)),color-mix(in oklab,var(--o-vitrine-500) 10%,var(--o-theme-bg)));',
  '--of-barre:light-dark(color-mix(in oklab,var(--o-vitrine-800) 17%,var(--o-theme-bg)),color-mix(in oklab,var(--o-vitrine-500) 4%,var(--o-theme-bg)));',
  '--of-filet:light-dark(color-mix(in oklab,var(--o-vitrine-800) 42%,transparent),color-mix(in oklab,var(--o-vitrine-300) 30%,transparent));',
  '--of-lueur:light-dark(var(--o-vitrine-600),var(--o-vitrine-400));',
  'background-color:var(--of-cellule);letter-spacing:.04em}',
  '.of-trame{position:absolute;inset:0;pointer-events:none;background-image:repeating-linear-gradient(to right,var(--of-barre) 0 2px,transparent 2px 10px),repeating-linear-gradient(to bottom,var(--of-barre) 0 2px,transparent 2px 10px);background-position:-1px -1px}',
  '.of-lampe{position:fixed;inset:0;pointer-events:none;background-image:',
  'radial-gradient(circle 192px at var(--of-px,-100vw) var(--of-py,-100vh),color-mix(in oklab,var(--of-lueur) 22%,transparent) 0%,color-mix(in oklab,var(--of-lueur) 17%,transparent) 26%,color-mix(in oklab,var(--of-lueur) 11%,transparent) 52%,color-mix(in oklab,var(--of-lueur) 5%,transparent) 74%,color-mix(in oklab,var(--of-lueur) 1.5%,transparent) 89%,transparent 100%),',
  'radial-gradient(circle 336px at var(--of-px,-100vw) var(--of-py,-100vh),color-mix(in oklab,var(--of-lueur) 5%,transparent) 0%,color-mix(in oklab,var(--of-lueur) 2.5%,transparent) 48%,transparent 100%),',
  'radial-gradient(circle 230px at var(--of-qx,-100vw) var(--of-qy,-100vh),color-mix(in oklab,var(--of-lueur) 9%,transparent) 0%,color-mix(in oklab,var(--of-lueur) 4%,transparent) 52%,transparent 100%)}',
  '@media (hover:none){.of-lampe{display:none}}',
  '.of-scene{mix-blend-mode:multiply}',
  ':root[data-theme="dark"] .of-scene{mix-blend-mode:screen}',
  '@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) .of-scene{mix-blend-mode:screen}}',
  '.of-panneau{background-color:var(--of-cellule);border:1px solid var(--of-filet)}',
  '.of-cadre{border:1px solid var(--of-filet)}',
  '.of-filet{border-color:var(--of-filet)}',
  '.of-large{letter-spacing:.12em}',
  // `o-inset-x-*` n existe qu a zero, et sans variante de point d arret :
  // la bande de fleches se cale donc ici, a partir de la meme largeur que
  // `md:` du systeme.
  '@media (min-width:768px){.of-fleches{left:2.5rem;right:2.5rem}}',
  '.of-bouton{border:1px solid currentColor;transition:background-color 250ms,color 250ms}',
  '.of-bouton:hover{background-color:light-dark(var(--o-vitrine-aplat-clair),var(--o-vitrine-aplat-sombre));color:light-dark(var(--o-vitrine-sur-aplat-clair),var(--o-vitrine-sur-aplat-sombre));border-color:transparent}',
  '.of-carte .of-puces,.of-carte .of-achat,.of-carte .of-prix{transition:opacity 250ms,color 250ms}',
  '.of-carte .of-achat{opacity:0;pointer-events:none}',
  '.of-carte:hover .of-achat,.of-carte:focus-within .of-achat{opacity:1;pointer-events:auto}',
  '.of-carte:hover .of-puces,.of-carte:focus-within .of-puces{opacity:0}',
  '@media (hover:none){.of-carte .of-achat{opacity:1;pointer-events:auto}.of-carte .of-puces{opacity:0}}',
  '.of-couche[data-off]{display:none}',
  '@media (min-width:768px){.of-couche[data-off]{display:flex;opacity:0;pointer-events:none}}',
  '.of-couche{transition:top 700ms cubic-bezier(.16,1,.3,1),opacity 350ms}',
  '.of-case{appearance:none;-webkit-appearance:none;border:1px solid var(--of-filet);transition:background-color 150ms,border-color 150ms}',
  '.of-case:hover{border-color:currentColor}.of-case:checked{background-color:currentColor;border-color:currentColor}',
  '.of-champ::placeholder{color:currentColor;opacity:.7}',
  '.of-lien{transition:color 150ms}.of-lien:hover{color:var(--o-theme-fg)}',
].join('')

/* ============================ Les icones =============================== */

/** Un trait de 24 unites, en encre courante. */
function Trait({ d, boite = '0 0 24 24', taille = 24, className }: { readonly d: string; readonly boite?: string; readonly taille?: number; readonly className?: string }): ReactElement {
  return (
    <svg viewBox={boite} width={taille} height={taille} fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={className}>
      <path d={d} />
    </svg>
  )
}

/** Les pictogrammes de la page, redessines en geometrie simple. */
const PICTOS: Readonly<Record<string, string>> = {
  globe: 'M2 12a10 6 0 1 0 20 0a10 6 0 1 0-20 0M8 12a4 6 0 1 0 8 0a4 6 0 1 0-8 0M2 12h20',
  reticule: 'M12 6a6 6 0 1 0 0 12a6 6 0 1 0 0-12M12 2v4M12 18v4M2 12h4M18 12h4M12 12h.01',
  froid: 'M12 3v18M4.2 7.5l15.6 9M4.2 16.5l15.6-9M12 3l-2.5 2.5M12 3l2.5 2.5M12 21l-2.5-2.5M12 21l2.5-2.5',
  chaleur: 'M9 4a2 2 0 0 1 4 0v9.3a3.5 3.5 0 1 1-4 0ZM11 9v6M17 5.5l1.5-1.5M19 9h2M16 3.5V2',
  colonne: 'M12 3v18M8 6h8M8 10h8M8 14h8M8 18h8',
  diffusion: 'M5 19a1 1 0 1 0 0-2a1 1 0 0 0 0 2ZM9 15a4 4 0 0 1 4 4M9 10a9 9 0 0 1 9 9M9 5a14 14 0 0 1 14 14',
  fiole: 'M9 3h6M10 3v6L4.5 19a1.5 1.5 0 0 0 1.3 2h12.4a1.5 1.5 0 0 0 1.3-2L14 9V3M7.5 15h9',
  sommet: 'M12 4l8 4-8 4-8-4ZM4 12l8 4 8-4M4 16l8 4 8-4',
  grille: 'M6 6h12v12H6ZM10 2v4M14 2v4M10 18v4M14 18v4M2 10h4M2 14h4M18 10h4M18 14h4',
  plume: 'M20 4c-6 0-11 3-14 9l-3 7 7-3c6-3 9-8 10-13ZM4 20l9-9M8 16h4M10 12h4',
  cube: 'M12 3l8 4.5v9L12 21l-8-4.5v-9ZM12 12l8-4.5M12 12v9M12 12L4 7.5',
  vague: 'M2 9c3-3 5-3 8 0s5 3 8 0 3-2 4-2M2 16c3-3 5-3 8 0s5 3 8 0 3-2 4-2',
}

/** L equerre d un marqueur : un angle droit, retourne selon le coin. */
function Equerre({ retourne = '' }: { readonly retourne?: string }): ReactElement {
  return (
    <svg viewBox="0 0 11 11" width="11" height="11" fill="none" stroke="currentColor" aria-hidden="true" style={{ transform: retourne }}>
      <path d="M.5 10.5V.5h10" />
    </svg>
  )
}

/** La fleche des boutons et du bulletin. */
function Fleche(): ReactElement {
  return (
    <svg viewBox="0 0 10 6" width="10" height="6" fill="none" stroke="currentColor" strokeWidth="1" aria-hidden="true">
      <path d="M0 3h9M6 .5L9 3 6 5.5" />
    </svg>
  )
}

/**
 * Le sigle ODORO : un anneau dont le quart haut-gauche est un angle droit.
 * De la geometrie, jamais une image — l anneau interieur fait 0,7 du rayon.
 */
function anneau(cx: number, cy: number, r: number): string {
  return `M${String(cx - r)} ${String(cy - r)}H${String(cx)}A${String(r)} ${String(r)} 0 1 1 ${String(cx - r)} ${String(cy)}Z`
}

function Sigle({ taille = 18 }: { readonly taille?: number }): ReactElement {
  return (
    <svg viewBox="0 0 24 24" width={taille} height={taille} aria-hidden="true">
      <path d={`${anneau(12, 12, 12)} ${anneau(12, 12, 12 * 0.7)}`} fill="currentColor" fillRule="evenodd" />
    </svg>
  )
}

/** Le logotype : le sigle, puis le nom en mono espace. */
function Logotype({ taille = 'o-text-sm' }: { readonly taille?: string }): ReactElement {
  return (
    <span className={`o-inline-flex o-items-center o-gap-2 ${taille} o-font-bold`} style={{ letterSpacing: '.3em' }}>
      <Sigle taille={taille === 'o-text-sm' ? 16 : 22} />
      ODORO
    </span>
  )
}

/* ============================ Le flacon dessine ======================== */

/**
 * Le flacon au trait : corps d apothicaire aux angles chanfreines, epaule,
 * col, bouchon strie, etiquette. C est le repli de la scene, et c est aussi
 * chaque flacon des collections, avec son liquide teinte.
 */
function FlaconDessine({ liquide, etiquette = true, className }: { readonly liquide: string; readonly etiquette?: boolean; readonly className?: string }): ReactElement {
  const stries = Array.from({ length: 9 }, (_, i) => 74 + i * 6.5)
  return (
    <svg viewBox="0 0 200 330" className={className} fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" aria-hidden="true">
      {/* Le corps, avec ses chanfreins, rempli du liquide. */}
      <path d="M40 132l14-14h92l14 14v170l-14 14H54l-14-14Z" fill={liquide} fillOpacity="0.72" />
      <path d="M40 132l14-14h92l14 14v170l-14 14H54l-14-14Z" />
      {/* Le reflet : une bande claire le long du chanfrein gauche. */}
      <path d="M50 140v154" stroke="var(--o-theme-bg)" strokeOpacity="0.45" strokeWidth="5" />
      {/* L epaule et le col. */}
      <path d="M72 118v-10l8-6h40l8 6v10" />
      <path d="M84 102V80h32v22" />
      {/* Le bouchon strie. */}
      <rect x="70" y="30" width="60" height="46" rx="6" fill="var(--o-theme-fg)" fillOpacity="0.72" />
      <rect x="70" y="30" width="60" height="46" rx="6" />
      {stries.map((x) => (
        <path key={x} d={`M${String(x)} 34v38`} stroke="var(--o-theme-bg)" strokeOpacity="0.35" />
      ))}
      {/* L etiquette. */}
      {etiquette && (
        <>
          <rect x="60" y="176" width="80" height="78" fill="var(--o-theme-bg)" fillOpacity="0.92" stroke="currentColor" strokeOpacity="0.6" />
          <text x="100" y="212" textAnchor="middle" fill="currentColor" stroke="none" style={{ fontFamily: 'var(--o-font-mono)', fontSize: 17, fontWeight: 700, letterSpacing: '.12em' }}>
            ODORO
          </text>
          <text x="100" y="236" textAnchor="middle" fill="currentColor" stroke="none" style={{ fontFamily: 'var(--o-font-mono)', fontSize: 6.5, letterSpacing: '.1em' }}>
            EXTRAIT DE PARFUM
          </text>
        </>
      )}
    </svg>
  )
}

/* ============================ Le mecanisme ============================= */

/**
 * Une pose du flacon a l ecran : centre en fractions de la fenetre (x vers la
 * droite, y vers le haut), hauteur en fraction de la fenetre, et l angle de
 * la platine.
 */
interface Pose {
  readonly x: number
  readonly y: number
  readonly part: number
  readonly tour: number
}

/** Les poses de la traversee, ecran large. */
const POSES = {
  // La fenetre du heros est etroite : la navigation ferme le haut a 102 px
  // et la promesse ouvre le bas a 567. Le flacon tient entre les deux, et
  // n empiete ni sur l une ni sur l autre.
  heros: { x: 0, y: 0.225, part: 0.45, tour: 0 },
  details: { x: 0.13, y: -0.03, part: 0.82, tour: Math.PI / 4 },
  sortie: { x: 0.13, y: 1.25, part: 0.82, tour: Math.PI / 4 },
  arrivee: { x: -0.86, y: -0.1, part: 0.74, tour: Math.PI / 4 - 0.32 },
  questions: { x: -0.27, y: -0.1, part: 0.74, tour: (24 * Math.PI) / 180 },
} as const satisfies Readonly<Record<string, Pose>>

/**
 * Ecran etroit : le flacon tient dans le heros, plus petit, et s en va avec
 * lui. La colonne de specifications le couvrirait, et les questions sont des
 * panneaux pleine largeur — il n y a pas de place ou le poser.
 */
const POSES_ETROITES = {
  heros: { x: 0, y: 0.16, part: 0.4, tour: 0 },
  sortie: { x: 0, y: 1.4, part: 0.4, tour: 0.4 },
  cache: { x: -1.6, y: -0.1, part: 0.4, tour: 0.4 },
} as const satisfies Readonly<Record<string, Pose>>

/** Ce que la scene lit a chaque image : la pose, le pointeur, le filigrane. */
interface Etat {
  pose: Pose
  /** Pointeur normalise, de -1 a 1, pour le balancement du flacon. */
  px: number
  py: number
  /** Le mot-marque : centre vertical en fraction de la fenetre, largeur en fraction, et sa visibilite. */
  filigraneY: number
  filigraneL: number
  filigraneVisible: boolean
  /** La torche sur le filigrane, en fractions de sa boite. */
  torcheU: number
  torcheV: number
  torcheVisible: boolean
  /** Fraction de la fenetre couverte par le flacon a l horizontale, pour savoir s il est hors champ. */
  aspect: number
}

const ETAT_INITIAL: Etat = {
  pose: POSES.heros,
  px: 0,
  py: 0,
  filigraneY: 0,
  filigraneL: 0.8,
  filigraneVisible: true,
  torcheU: -1,
  torcheV: -1,
  torcheVisible: false,
  aspect: 1.6,
}

function borne(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v
}

/** Smootherstep : vitesse nulle aux deux bouts. */
function douce(t: number): number {
  return t * t * t * (t * (t * 6 - 15) + 10)
}

/** Pleine vitesse des le premier pixel, longue queue qui ralentit. */
function derive(t: number): number {
  return 1 - Math.pow(1 - t, 2.2)
}

function melangerPose(a: Pose, b: Pose, t: number, tourT = t): Pose {
  return {
    x: a.x + (b.x - a.x) * t,
    y: a.y + (b.y - a.y) * t,
    part: a.part + (b.part - a.part) * t,
    tour: a.tour + (b.tour - a.tour) * tourT,
  }
}

/** Vrai quand le flacon ne montre plus rien a l ecran. */
function horsChamp(p: Pose, aspect: number): boolean {
  const demiHauteur = p.part / 2
  const demiLargeur = (p.part * 0.62) / (2 * aspect)
  return p.x + demiLargeur < -0.5 || p.x - demiLargeur > 0.5 || p.y - demiHauteur > 0.5 || p.y + demiHauteur < -0.5
}

/**
 * La mecanique de la page, en une seule horloge : la lampe qui suit le
 * curseur, et la pose du flacon deduite des sections.
 *
 * Trois lectures de geometrie par image — la boite collee, le heros, les
 * details, les questions — et rien d autre : la pose visee est calculee de
 * la, puis rattrapee avec inertie, comme la traversee glissee de `scene.tsx`.
 */
function useMecanique(
  refs: {
    readonly lampe: RefObject<HTMLDivElement | null>
    readonly boite: RefObject<HTMLDivElement | null>
    readonly heros: RefObject<HTMLElement | null>
    readonly details: RefObject<HTMLElement | null>
    readonly questions: RefObject<HTMLElement | null>
  },
  etat: RefObject<Etat>,
): void {
  const { reduced } = useMotionState()

  useEffect(() => {
    if (reduced) return
    const lampe = refs.lampe.current
    const boite = refs.boite.current
    const heros = refs.heros.current
    const details = refs.details.current
    const questions = refs.questions.current
    if (lampe === null || boite === null || heros === null || details === null || questions === null) return

    const fin = window.matchMedia('(pointer: fine)').matches
    let brutX = 0
    let brutY = 0
    let engage = false
    let douxX = 0
    let douxY = 0
    let lentX = 0
    let lentY = 0
    let ecritX = -1
    let ecritY = -1

    const bouger = (e: PointerEvent): void => {
      brutX = e.clientX
      brutY = e.clientY
      if (!engage) {
        douxX = lentX = brutX
        douxY = lentY = brutY
        engage = true
      }
    }
    if (fin) window.addEventListener('pointermove', bouger, { passive: true })

    let courant: Pose = { ...etat.current.pose }

    const abonnement = clock.subscribe(
      ({ delta }) => {
        // La lampe : la position lissee, et une copie plus lente qui traine.
        if (engage) {
          const k = 1 - Math.exp(-7 * delta)
          const kLent = 1 - Math.exp(-2.6 * delta)
          douxX += (brutX - douxX) * k
          douxY += (brutY - douxY) * k
          lentX += (brutX - lentX) * kLent
          lentY += (brutY - lentY) * kLent
          if (Math.abs(douxX - ecritX) > 0.2 || Math.abs(douxY - ecritY) > 0.2) {
            ecritX = douxX
            ecritY = douxY
            lampe.style.setProperty('--of-px', `${douxX.toFixed(1)}px`)
            lampe.style.setProperty('--of-py', `${douxY.toFixed(1)}px`)
            lampe.style.setProperty('--of-qx', `${lentX.toFixed(1)}px`)
            lampe.style.setProperty('--of-qy', `${lentY.toFixed(1)}px`)
          }
        }

        // La pose visee, lue sur les sections.
        const cadre = boite.getBoundingClientRect()
        const H = Math.max(1, cadre.height)
        const W = Math.max(1, cadre.width)
        const aspect = W / H
        const etroit = W < 1024
        const rHeros = heros.getBoundingClientRect()
        const rDetails = details.getBoundingClientRect()
        const rQuestions = questions.getBoundingClientRect()
        const t = (r: DOMRect): number => (cadre.top - r.top) / Math.max(1, r.height)
        const p1 = borne(t(rHeros))
        const p2 = borne(t(rDetails))
        const e = borne((0.55 * H - (rQuestions.top - cadre.top)) / (0.85 * H))

        let cible: Pose
        if (etroit) {
          cible = e > 0 ? POSES_ETROITES.cache : p2 > 0 ? POSES_ETROITES.sortie : melangerPose(POSES_ETROITES.heros, POSES_ETROITES.sortie, derive(p1))
        } else if (e > 0) {
          cible = melangerPose(POSES.arrivee, POSES.questions, douce(e))
        } else if (p2 > 0) {
          cible = melangerPose(POSES.details, POSES.sortie, p2)
        } else {
          cible = melangerPose(POSES.heros, POSES.details, derive(p1), douce(p1))
        }

        // Entre deux phases le flacon est hors champ : il saute sans qu on le
        // voie, plutot que de traverser l ecran pour rejoindre sa pose.
        if (horsChamp(courant, aspect) && horsChamp(cible, aspect)) {
          courant = { ...cible }
        } else {
          const k = 1 - Math.exp(-6.5 * delta)
          courant = melangerPose(courant, cible, k)
        }

        // Le filigrane suit le heros ; il s eteint des qu il a quitte l ecran.
        const centreHeros = rHeros.top + rHeros.height * 0.53
        const filigraneY = (cadre.top + H / 2 - centreHeros) / H
        const filigraneVisible = Math.abs(filigraneY) < 0.9 && !etroit
        const largeurPx = Math.min(W * 0.8, H * 1.55)
        const filigraneL = largeurPx / W
        const hauteurPx = largeurPx / 4
        const torcheU = engage ? (douxX - cadre.left - (W - largeurPx) / 2) / largeurPx : -1
        const torcheV = engage ? (douxY - (cadre.top + H / 2 - filigraneY * H - hauteurPx / 2)) / hauteurPx : -1

        etat.current = {
          pose: courant,
          px: engage ? borne((douxX - cadre.left) / W) * 2 - 1 : 0,
          py: engage ? borne((douxY - cadre.top) / H) * 2 - 1 : 0,
          filigraneY,
          filigraneL,
          filigraneVisible,
          torcheU,
          torcheV,
          torcheVisible: engage && fin && filigraneVisible,
          aspect,
        }
      },
      { name: 'officine mecanique', priority: CLOCK_PRIORITY.input },
    )

    return () => {
      abonnement.unsubscribe()
      if (fin) window.removeEventListener('pointermove', bouger)
    }
  }, [reduced, refs, etat])
}

/* ============================ Le flacon en volume ====================== */

/** Hauteur du flacon modele, en unites de la scene. */
const FLACON_HAUTEUR = 2.43
/** Demi-angle de la camera, en radians : un objectif long, qui ne deforme pas. */
const DEMI_ANGLE = (15 * Math.PI) / 180
const TAN_DEMI = Math.tan(DEMI_ANGLE)
/** Le filigrane se tient a cette distance derriere le flacon. */
const PROFONDEUR_FILIGRANE = 1.8

type Trois = SceneContext['three']

/** Un rectangle arrondi, en forme a extruder. */
function rectangleArrondi(three: Trois, l: number, h: number, r: number): InstanceType<Trois['Shape']> {
  const forme = new three.Shape()
  const x = -l / 2
  const y = -h / 2
  forme.moveTo(x + r, y)
  forme.lineTo(x + l - r, y)
  forme.quadraticCurveTo(x + l, y, x + l, y + r)
  forme.lineTo(x + l, y + h - r)
  forme.quadraticCurveTo(x + l, y + h, x + l - r, y + h)
  forme.lineTo(x + r, y + h)
  forme.quadraticCurveTo(x, y + h, x, y + h - r)
  forme.lineTo(x, y + r)
  forme.quadraticCurveTo(x, y, x + r, y)
  return forme
}

/** Le profil d un bouchon strie : un cercle a cannelures. */
function profilStrie(three: Trois, rayon: number, cannelures: number, creux: number): InstanceType<Trois['Shape']> {
  const forme = new three.Shape()
  const pas = (Math.PI * 2) / cannelures
  for (let i = 0; i <= cannelures * 2; i += 1) {
    const a = (i * pas) / 2
    const r = i % 2 === 0 ? rayon : rayon - creux
    const x = Math.cos(a) * r
    const y = Math.sin(a) * r
    if (i === 0) forme.moveTo(x, y)
    else forme.lineTo(x, y)
  }
  forme.closePath()
  return forme
}

/** La police mono de la page, lue sur la racine de la vitrine. */
function policeMono(): string {
  const racine = document.querySelector<HTMLElement>('.of-racine')
  const lue = racine === null ? '' : getComputedStyle(racine).getPropertyValue('--o-font-mono').trim()
  return lue === '' ? 'ui-monospace, monospace' : lue
}

/** L etiquette, dessinee dans un canevas : papier, filet, deux lignes. */
function dessinerEtiquette(toile: HTMLCanvasElement, papier: string, encreTexte: string, filet: string): void {
  const l = toile.width
  const h = toile.height
  const pot = toile.getContext('2d')
  if (pot === null) return
  const famille = policeMono()
  pot.fillStyle = papier
  pot.fillRect(0, 0, l, h)
  pot.strokeStyle = filet
  pot.lineWidth = Math.max(2, h * 0.008)
  pot.strokeRect(h * 0.07, h * 0.07, l - h * 0.14, h - h * 0.14)
  pot.fillStyle = encreTexte
  pot.textAlign = 'center'
  pot.textBaseline = 'middle'
  pot.font = `700 ${String(Math.round(h * 0.3))}px ${famille}`
  pot.fillText('ODORO', l / 2, h * 0.42)
  pot.font = `400 ${String(Math.round(h * 0.11))}px ${famille}`
  pot.fillText('EXTRAIT DE PARFUM', l / 2, h * 0.7)
}

/** Le mot-marque, blanc sur transparent : la matiere le teinte. */
function dessinerFiligrane(toile: HTMLCanvasElement): void {
  const l = toile.width
  const h = toile.height
  const pot = toile.getContext('2d')
  if (pot === null) return
  pot.clearRect(0, 0, l, h)
  pot.fillStyle = '#ffffff'
  pot.textAlign = 'center'
  pot.textBaseline = 'middle'
  pot.font = `700 ${String(Math.round(h * 0.78))}px ${policeMono()}`
  pot.fillText('ODORO', l / 2, h * 0.54)
}

/** Le disque doux de la torche, en carte d opacite. */
function dessinerDisque(toile: HTMLCanvasElement): void {
  const c = toile.width / 2
  const pot = toile.getContext('2d')
  if (pot === null) return
  const degrade = pot.createRadialGradient(c, c, 0, c, c, c)
  degrade.addColorStop(0, '#ffffff')
  degrade.addColorStop(0.45, 'rgba(255,255,255,0.75)')
  degrade.addColorStop(1, 'rgba(255,255,255,0)')
  pot.fillStyle = '#000000'
  pot.fillRect(0, 0, toile.width, toile.height)
  pot.fillStyle = degrade
  pot.fillRect(0, 0, toile.width, toile.height)
}

/** Vrai quand la racine est en theme sombre — lu au changement, pas a l image. */
function estSombre(): boolean {
  if (typeof document === 'undefined') return false
  // `color-scheme` prend trois valeurs utiles ici. La documentation ecrit
  // `dark` ou `light` quand le visiteur a choisi, et laisse `light dark`
  // quand il s en remet au systeme. Chercher « dark » dans la chaine rendait
  // donc la page sombre en plein jour ; comparer a « dark » tout court la
  // rendait claire sous un systeme en nuit. On lit le choix s il existe, et
  // on interroge le systeme sinon.
  const declare = getComputedStyle(document.documentElement).colorScheme.trim()
  if (declare === 'dark') return true
  if (declare === 'light') return false
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

/**
 * Le flacon, la lumiere, le filigrane : tout ce que la scene contient.
 *
 * Rendu sur un fond blanc (ou noir en theme sombre) que le melange du canevas
 * efface : voir l en-tete du module.
 */
function construireScene(contexte: SceneContext, etat: RefObject<Etat>, sombre: RefObject<boolean>): () => void {
  const { scene, camera, three } = contexte
  const geometries: { dispose: () => void }[] = []
  const matieres: { dispose: () => void }[] = []
  const textures: { dispose: () => void }[] = []

  camera.fov = 30
  camera.updateProjectionMatrix()

  const ambre = teinte('--o-vitrine-500', '#d99a2b')
  const ambreFonce = teinte('--o-vitrine-700', '#8a5a12')
  const olive = new three.Color(teinte('--o-vitrine-950', '#3a2a08')).multiplyScalar(0.55)
  const papier = teinte('--o-vitrine-50', '#f5efe4')

  /* ----- Le verre ----- */
  const verre = new three.MeshPhysicalMaterial({
    color: ambre,
    metalness: 0,
    roughness: 0.09,
    // Sans transmission la matiere est une surface opaque, et le flacon rend
    // un jaune plat de plastique. Avec elle, le fond traverse le verre et
    // l epaisseur se voit — c est ce qui fait l ambre.
    transmission: 0.92,
    thickness: 1.15,
    ior: 1.52,
    attenuationColor: new three.Color(ambreFonce),
    attenuationDistance: 1.6,
    clearcoat: 1,
    clearcoatRoughness: 0.06,
    iridescence: 0.14,
    iridescenceIOR: 1.3,
    transparent: true,
    emissive: new three.Color(ambreFonce).multiplyScalar(0.06),
  })
  const bouchon = new three.MeshStandardMaterial({ color: olive, metalness: 0.12, roughness: 0.62 })
  const bouchonClair = new three.MeshStandardMaterial({ color: olive.clone().multiplyScalar(1.5), metalness: 0.12, roughness: 0.5 })
  matieres.push(verre, bouchon, bouchonClair)

  const flacon = new three.Group()
  flacon.name = 'flacon'
  const corps = new three.Group()
  corps.position.y = -0.135
  flacon.add(corps)

  // Le corps d apothicaire : un rectangle arrondi extrude, chanfreine par le
  // biseau de l extrusion sur ses faces avant et arriere.
  const gCorps = new three.ExtrudeGeometry(rectangleArrondi(three, 1.36, 1.46, 0.16), {
    depth: 0.78,
    bevelEnabled: true,
    bevelThickness: 0.07,
    bevelSize: 0.07,
    bevelSegments: 3,
    curveSegments: 10,
  })
  gCorps.center()
  geometries.push(gCorps)
  const maCorps = new three.Mesh(gCorps, verre)
  maCorps.position.y = -0.35
  corps.add(maCorps)

  // L epaule : le meme profil, plus etroit, qui monte vers le col.
  const gEpaule = new three.ExtrudeGeometry(rectangleArrondi(three, 0.88, 0.2, 0.08), {
    depth: 0.46,
    bevelEnabled: true,
    bevelThickness: 0.05,
    bevelSize: 0.05,
    bevelSegments: 2,
    curveSegments: 8,
  })
  gEpaule.center()
  geometries.push(gEpaule)
  const maEpaule = new three.Mesh(gEpaule, verre)
  maEpaule.position.y = 0.5
  corps.add(maEpaule)

  // La bague et le col.
  const gBague = new three.CylinderGeometry(0.31, 0.29, 0.08, 40)
  const gCol = new three.CylinderGeometry(0.24, 0.25, 0.24, 40)
  geometries.push(gBague, gCol)
  const maBague = new three.Mesh(gBague, verre)
  maBague.position.y = 0.65
  const maCol = new three.Mesh(gCol, verre)
  maCol.position.y = 0.78
  corps.add(maBague, maCol)

  // Le bouchon strie : un cylindre a cannelures, extrude puis couche.
  const gBouchon = new three.ExtrudeGeometry(profilStrie(three, 0.4, 40, 0.028), {
    depth: 0.46,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.015,
    bevelSegments: 2,
  })
  gBouchon.rotateX(-Math.PI / 2)
  geometries.push(gBouchon)
  const maBouchon = new three.Mesh(gBouchon, bouchon)
  maBouchon.position.y = 0.86
  const gCalotte = new three.CylinderGeometry(0.36, 0.38, 0.05, 40)
  geometries.push(gCalotte)
  const maCalotte = new three.Mesh(gCalotte, bouchonClair)
  maCalotte.position.y = 1.345
  corps.add(maBouchon, maCalotte)

  // L etiquette : du papier pose sur la face avant, avec le nom de la maison.
  const toileEtiquette = document.createElement('canvas')
  toileEtiquette.width = 1024
  toileEtiquette.height = 512
  const filetEtiquette = teinte('--o-vitrine-800', '#6a4a10')
  dessinerEtiquette(toileEtiquette, papier, '#161311', filetEtiquette)
  const texEtiquette = new three.CanvasTexture(toileEtiquette)
  texEtiquette.colorSpace = three.SRGBColorSpace
  texEtiquette.anisotropy = 4
  textures.push(texEtiquette)
  const matEtiquette = new three.MeshStandardMaterial({ map: texEtiquette, roughness: 0.92, metalness: 0 })
  matieres.push(matEtiquette)
  const gEtiquette = new three.PlaneGeometry(0.9, 0.45)
  geometries.push(gEtiquette)
  const maEtiquette = new three.Mesh(gEtiquette, matEtiquette)
  maEtiquette.position.set(0, -0.47, 0.463)
  corps.add(maEtiquette)

  scene.add(flacon)

  /* ----- Le filigrane, derriere ----- */
  const toileFiligrane = document.createElement('canvas')
  toileFiligrane.width = 2048
  toileFiligrane.height = 512
  dessinerFiligrane(toileFiligrane)
  const texFiligrane = new three.CanvasTexture(toileFiligrane)
  texFiligrane.colorSpace = three.SRGBColorSpace
  textures.push(texFiligrane)
  const toileDisque = document.createElement('canvas')
  toileDisque.width = 256
  toileDisque.height = 256
  dessinerDisque(toileDisque)
  const texDisque = new three.CanvasTexture(toileDisque)
  texDisque.wrapS = three.ClampToEdgeWrapping
  texDisque.wrapT = three.ClampToEdgeWrapping
  textures.push(texDisque)

  const matFiligrane = new three.MeshBasicMaterial({ map: texFiligrane, transparent: true, opacity: 0.3, depthWrite: false, toneMapped: false })
  const matTorche = new three.MeshBasicMaterial({ map: texFiligrane, alphaMap: texDisque, transparent: true, opacity: 0.55, depthWrite: false, toneMapped: false })
  matieres.push(matFiligrane, matTorche)
  const gPlan = new three.PlaneGeometry(1, 0.25)
  geometries.push(gPlan)
  const filigrane = new three.Mesh(gPlan, matFiligrane)
  filigrane.name = 'filigrane'
  filigrane.renderOrder = -2
  const torche = new three.Mesh(gPlan, matTorche)
  torche.name = 'torche'
  torche.renderOrder = -1
  torche.position.z = 0.01
  scene.add(filigrane, torche)

  /* ----- La lumiere ----- */
  // Une cle chaude, un remplissage froid, un contour ; puis ce qui fait le
  // verre : une rasante a droite et une lampe de dessous, qui posent le
  // trait clair sur le chanfrein et allument le corps par le bas.
  eclairer(contexte, { cle: 0xfff1dc, remplissage: 0x9fb0c8, contour: 0xfff4e6, force: 1.1 })
  const rasante = new three.PointLight(0xffffff, 30, 16, 2)
  rasante.position.set(3.4, 1.3, 2.2)
  const dessous = new three.PointLight(0xffd9a0, 22, 12, 2)
  dessous.position.set(0.6, -2.8, 2.2)
  const face = new three.SpotLight(0xfff3e0, 36, 18, 0.7, 0.8, 2)
  face.position.set(-2.2, 1.6, 3.6)
  face.target.position.set(0.2, -0.2, 0)
  scene.add(rasante, dessous, face, face.target)

  /* ----- Le fond, selon le theme ----- */
  const blanc = new three.Color(0xffffff)
  const noir = new three.Color(0x000000)
  const encreClair = new three.Color(teinte('--o-vitrine-800', '#6a4a10'))
  const encreSombre = new three.Color(teinte('--o-vitrine-300', '#f2cf7a'))
  let themeApplique: boolean | null = null
  const appliquerTheme = (): void => {
    const s = sombre.current
    if (s === themeApplique) return
    themeApplique = s
    scene.background = s ? noir : blanc
    matFiligrane.color.copy(s ? encreSombre : encreClair)
    matTorche.color.copy(s ? encreSombre : encreClair)
    matFiligrane.opacity = s ? 0.26 : 0.3
    matTorche.opacity = s ? 0.5 : 0.55
  }
  appliquerTheme()

  // Le nom de la maison en Space Mono, des que la police est arrivee.
  void document.fonts.ready.then(() => {
    dessinerEtiquette(toileEtiquette, papier, '#161311', filetEtiquette)
    texEtiquette.needsUpdate = true
    dessinerFiligrane(toileFiligrane)
    texFiligrane.needsUpdate = true
  })

  /* ----- La camera, a chaque image ----- */
  flacon.userData['appliquerTheme'] = appliquerTheme
  void etat

  return () => {
    for (const g of geometries) g.dispose()
    for (const m of matieres) m.dispose()
    for (const t of textures) t.dispose()
  }
}

/** Place la camera et le filigrane d apres la pose lue par la mecanique. */
function animerScene(contexte: SceneContext, temps: number, etat: RefObject<Etat>): void {
  const { scene, camera } = contexte
  const flacon = scene.getObjectByName('flacon')
  const filigrane = scene.getObjectByName('filigrane')
  const torche = scene.getObjectByName('torche')
  if (flacon === undefined || filigrane === undefined || torche === undefined) return
  const rappel = flacon.userData['appliquerTheme'] as (() => void) | undefined
  rappel?.()

  const { pose, px, py, filigraneY, filigraneL, filigraneVisible, torcheU, torcheV, torcheVisible } = etat.current

  // La camera recule pour donner au flacon la hauteur voulue, et se decale
  // pour le poser ou la page le veut : une translation, jamais une rotation.
  const distance = FLACON_HAUTEUR / (Math.max(0.05, pose.part) * 2 * TAN_DEMI)
  const visibleH = 2 * distance * TAN_DEMI
  const visibleW = visibleH * camera.aspect
  const cx = -pose.x * visibleW
  const cy = -pose.y * visibleH
  camera.position.set(cx, cy, distance)
  camera.lookAt(cx, cy, 0)

  // Le flacon tourne sur sa platine, repond au regard et respire.
  flacon.rotation.y = pose.tour + px * 0.22 + Math.sin(temps * 0.33) * 0.03
  flacon.rotation.z = -py * 0.05 + Math.sin(temps * 0.5) * 0.008
  flacon.position.y = Math.sin(temps * 0.9) * 0.015

  // Le filigrane, derriere : il suit le heros a l ecran.
  const dist2 = distance + PROFONDEUR_FILIGRANE
  const vh2 = 2 * dist2 * TAN_DEMI
  const vw2 = vh2 * camera.aspect
  const largeur = filigraneL * vw2
  filigrane.visible = filigraneVisible
  filigrane.position.set(cx, cy + filigraneY * vh2, -PROFONDEUR_FILIGRANE)
  filigrane.scale.set(largeur, largeur, 1)
  torche.visible = filigraneVisible && torcheVisible
  torche.position.set(cx, cy + filigraneY * vh2, -PROFONDEUR_FILIGRANE + 0.01)
  torche.scale.set(largeur, largeur, 1)

  // La torche : le disque glisse sur la carte d opacite, centre sous le
  // pointeur. Un rayon de 0,22 de la largeur du mot, deux fois plus haut que
  // large dans les fractions du plan, qui fait un quart de sa largeur.
  // `getObjectByName` rend un `Object3D`, qui ne porte pas de matiere : le
  // passage se fait par `unknown`, faute de quoi TypeScript refuse deux types
  // qui ne se recouvrent pas. La torche est un maillage, pose plus haut dans
  // `construire`, et sa matiere porte bien une carte d opacite.
  type Torche = { material: { alphaMap: { repeat: { set: (x: number, y: number) => unknown }; offset: { set: (x: number, y: number) => unknown } } | null } }
  const mat = (torche as unknown as Torche).material
  if (mat.alphaMap !== null) {
    const sU = 0.44
    const sV = sU * 4
    mat.alphaMap.repeat.set(1 / sU, 1 / sV)
    mat.alphaMap.offset.set(0.5 - torcheU / sU, 0.5 - (1 - torcheV) / sV)
  }
}

/* ============================ Les pieces ============================== */

/** Un panneau opaque de la page : la cellule du papier, bordee du filet. */
function Panneau({ children, className = '', style }: { readonly children: ReactNode; readonly className?: string; readonly style?: CSSProperties }): ReactElement {
  return (
    <div className={`of-panneau ${className}`} style={style}>
      {children}
    </div>
  )
}

/** Un bouton cadre : le libelle, une fleche, et l accent au survol. */
function BoutonCadre({ children, cible }: { readonly children: string; readonly cible: string }): ReactElement {
  return (
    <a href={cible} className="of-bouton of-large o-inline-flex o-items-center o-gap-6 o-px-8 o-py-4 o-text-sm o-uppercase o-no-underline o-text-zinc-950 dark:o-text-zinc-50 focus:o-ring">
      {children}
      <Fleche />
    </a>
  )
}

/** Un intitule de section : le masthead en mono, a l encre d accent. */
function Masthead({ children, id, className = '' }: { readonly children: string; readonly id?: string; readonly className?: string }): ReactElement {
  return (
    <h2 id={id} className={`o-m-0 o-uppercase ${className}`} style={{ fontSize: 'clamp(2.25rem, 4.9vw, 4.4rem)', lineHeight: 0.9, letterSpacing: '-0.01em', fontWeight: 700, color: encre() }}>
      <DecodeText as="span" trigger="view" duration={900}>
        {children}
      </DecodeText>
    </h2>
  )
}

/**
 * Une rubrique de la barre, avec le sous-menu que le caret promet.
 *
 * Ouvert au survol d un pointeur fin, a l activation sinon ; ferme par
 * Echap, par la sortie du groupe ou par un clic ailleurs.
 */
function Rubrique({ mot, cible, sousMenu }: { readonly mot: string; readonly cible: string; readonly sousMenu?: readonly (readonly [string, string])[] }): ReactElement {
  const id = useId()
  const [ouvert, setOuvert] = useState(false)
  const groupe = useRef<HTMLDivElement>(null)
  const classes = 'of-large o-text-xs o-uppercase o-no-underline o-text-zinc-950 dark:o-text-zinc-50 focus:o-ring'

  useEffect(() => {
    if (!ouvert) return
    const clavier = (e: KeyboardEvent): void => {
      if (e.key === 'Escape') setOuvert(false)
    }
    const ailleurs = (e: PointerEvent): void => {
      if (!groupe.current?.contains(e.target as Node)) setOuvert(false)
    }
    document.addEventListener('keydown', clavier)
    document.addEventListener('pointerdown', ailleurs)
    return () => {
      document.removeEventListener('keydown', clavier)
      document.removeEventListener('pointerdown', ailleurs)
    }
  }, [ouvert])

  if (sousMenu === undefined) {
    return (
      <a href={cible} className={classes}>
        {mot}
      </a>
    )
  }

  const survol = (): boolean => window.matchMedia('(hover: hover) and (pointer: fine)').matches

  return (
    <div
      ref={groupe}
      className="o-relative"
      onPointerEnter={() => {
        if (survol()) setOuvert(true)
      }}
      onPointerLeave={() => {
        if (survol()) setOuvert(false)
      }}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setOuvert(false)
      }}
    >
      <button
        type="button"
        aria-expanded={ouvert}
        aria-controls={id}
        onClick={() => {
          setOuvert((v) => !v)
        }}
        className={`o-inline-flex o-cursor-pointer o-items-center o-gap-2 o-border-none o-bg-transparent o-p-0 o-font-mono ${classes}`}
      >
        {mot}
        <svg viewBox="0 0 6 5" width="6" height="5" aria-hidden="true" style={{ transform: ouvert ? 'rotate(180deg)' : undefined, transition: 'transform 150ms' }}>
          <path d="M3 5L0 0h6Z" fill="currentColor" />
        </svg>
      </button>
      <div className={`o-absolute o-left-0 o-top-full o-pt-4 ${ouvert ? 'o-visible' : 'o-invisible'}`} style={{ zIndex: 5 }}>
        <ul id={id} className="of-panneau o-m-0 o-flex o-w-max o-list-none o-flex-col o-gap-3 o-p-4" style={{ opacity: ouvert ? 1 : 0, transition: 'opacity 150ms' }}>
          {sousMenu.map(([entree, href]) => (
            <li key={entree}>
              <a href={href} tabIndex={ouvert ? undefined : -1} className="of-lien of-large o-block o-whitespace-nowrap o-text-xs o-uppercase o-no-underline o-text-zinc-600 dark:o-text-zinc-400 focus:o-ring">
                {entree}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

/** L entete : le logotype, la barre avec son sous-menu, le panier. */
function Entete(): ReactElement {
  return (
    <header className="o-relative o-z-20 o-flex o-flex-wrap o-items-center o-gap-x-6 o-gap-y-4 o-px-5 o-py-5 md:o-px-10 md:o-py-6">
      <a href="#haut" className="o-order-1 o-no-underline o-text-zinc-950 dark:o-text-zinc-50 focus:o-ring" aria-label="Odoro, retour en haut">
        <Logotype />
      </a>
      <nav aria-label="Rubriques" className="o-order-3 o-w-full md:o-order-2 md:o-w-auto md:o-flex-1">
        <ul className="o-m-0 o-flex o-list-none o-flex-wrap o-gap-x-8 o-gap-y-3 o-p-0 md:o-justify-center md:o-gap-16">
          {NAVIGATION.map((r) => (
            <li key={r.mot}>
              <Rubrique mot={r.mot} cible={r.cible} sousMenu={'sousMenu' in r ? r.sousMenu : undefined} />
            </li>
          ))}
        </ul>
      </nav>
      <a href="#collections" className="of-large o-order-2 o-ml-auto o-text-xs o-uppercase o-whitespace-nowrap o-no-underline o-text-zinc-950 dark:o-text-zinc-50 focus:o-ring md:o-order-3 md:o-ml-0">
        PANIER [ 0 ]
      </a>
    </header>
  )
}

/** Un marqueur du heros : trois lignes entre deux equerres. */
function Marqueur({ lignes, cote, delai }: { readonly lignes: readonly string[]; readonly cote: 'gauche' | 'droit'; readonly delai: number }): ReactElement {
  const droite = cote === 'droit'
  return (
    <Surgit delai={delai} className={`o-flex o-flex-col o-gap-4 ${droite ? 'o-items-end o-text-right' : 'o-items-start'}`}>
      <Equerre retourne={droite ? 'scaleX(-1)' : ''} />
      <p className="of-large o-m-0 o-text-xs o-uppercase o-leading-relaxed o-text-zinc-950 dark:o-text-zinc-50 sm:o-text-sm">
        {lignes.map((l) => (
          <span key={l} className="o-block">
            {l}
          </span>
        ))}
      </p>
      <Equerre retourne={droite ? 'scale(-1,-1)' : 'scaleY(-1)'} />
    </Surgit>
  )
}

/** Un badge de coin du heros : un pictogramme, une legende, des lignes. */
function Badge({ picto, legende, lignes, delai }: { readonly picto: string; readonly legende?: string; readonly lignes: readonly string[]; readonly delai: number }): ReactElement {
  return (
    <Surgit delai={delai} className="of-cadre o-flex o-items-stretch o-gap-4 o-p-4 o-text-zinc-950 dark:o-text-zinc-50">
      <div className="o-flex o-w-16 o-shrink-0 o-flex-col o-items-center o-justify-center o-gap-2">
        <Trait d={PICTOS[picto] ?? ''} taille={28} />
        {legende !== undefined && <span className="of-large o-text-xs">{legende}</span>}
      </div>
      <span aria-hidden="true" className="o-w-px o-shrink-0 o-self-stretch" style={{ backgroundColor: 'var(--of-filet)' }} />
      <p className="of-large o-m-0 o-self-center o-text-xs o-uppercase o-leading-relaxed">
        {lignes.map((l) => (
          <span key={l} className="o-block">
            {l}
          </span>
        ))}
      </p>
    </Surgit>
  )
}

/** Une ligne de specification : le rang en haut, le pictogramme en bas, le texte a droite. */
function Specification({ rang, icone, titre, texte }: { readonly rang: string; readonly icone: string; readonly titre: string; readonly texte: string }): ReactElement {
  return (
    <Panneau className="o-flex o-items-stretch o-gap-6 o-p-4">
      <div className="o-flex o-shrink-0 o-flex-col o-items-start o-justify-between o-gap-4">
        <span aria-hidden="true" className="o-text-sm o-text-zinc-600 dark:o-text-zinc-400">
          {rang}
        </span>
        <Trait d={PICTOS[icone] ?? ''} taille={26} className="o-text-zinc-950 dark:o-text-zinc-50" />
      </div>
      <div className="o-flex o-min-w-0 o-flex-1 o-flex-col o-gap-2">
        <h3 className="of-large o-m-0 o-text-sm o-font-bold o-uppercase o-text-zinc-950 dark:o-text-zinc-50">{titre}</h3>
        <p className="o-m-0 o-text-xs o-uppercase o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">{texte}</p>
      </div>
    </Panneau>
  )
}

/**
 * Une carte d extrait : bordee, transparente, le flacon dessine au centre.
 * Au survol les pastilles cedent la place au lien d achat et le prix monte
 * a l encre pleine, comme dans la source. Les quatre nuanciers changent la
 * vue — ici, le liquide se relit sous un autre angle de lumiere.
 */
function CarteExtrait({ rang, nom, prix, liquide, puces }: (typeof EXTRAITS)[number]): ReactElement {
  const [vue, setVue] = useState(0)
  const reflets = ['0.72', '0.6', '0.82', '0.5']
  return (
    <li className="o-min-w-0">
      <TiltCard tilt={5} glare={0} className="o-h-full">
        <article className="of-carte of-cadre o-relative o-flex o-h-full o-flex-col o-justify-between o-gap-6 o-p-4 o-text-zinc-950 dark:o-text-zinc-50" style={{ minHeight: '27rem' }}>
          <div className="o-flex o-items-start o-justify-between">
            <span aria-hidden="true" className="o-text-sm o-text-zinc-600 dark:o-text-zinc-400">
              {rang}
            </span>
            <svg viewBox="0 0 13 13" width="13" height="13" aria-hidden="true" className="o-opacity-60">
              <path d="M6.5 0v13M0 6.5h13" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          </div>
          <div className="o-pointer-events-none o-absolute o-inset-x-0 o-top-1/2 o-flex o-justify-center" style={{ transform: 'translateY(-52%)' }}>
            <div className="o-w-40" style={{ opacity: reflets[vue] ?? '0.72', transition: 'opacity 250ms' }}>
              <FlaconDessine liquide={liquide} etiquette className="o-w-full" />
            </div>
          </div>
          <div role="group" aria-label={`${nom} — vue`} className="o-absolute o-right-4 o-top-1/2 o-flex o-flex-col o-gap-2" style={{ transform: 'translateY(-50%)' }}>
            {reflets.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Vue ${String(i + 1)} de 4`}
                aria-pressed={i === vue}
                onClick={() => {
                  setVue(i)
                }}
                className="o-size-3 o-cursor-pointer o-border-w-1 o-p-0 focus:o-ring"
                style={{ backgroundColor: i === vue ? 'currentColor' : 'transparent', borderColor: 'currentColor', opacity: i === vue ? 1 : 0.5 }}
              />
            ))}
          </div>
          <div className="o-relative o-flex o-flex-col o-gap-4">
            <div className="o-flex o-items-baseline o-justify-between o-gap-4">
              <h3 className="o-m-0 o-text-xl o-font-bold o-uppercase" style={{ lineHeight: 1, maxWidth: '12rem' }}>
                <DecodeText as="span" trigger="view" duration={800}>
                  {nom}
                </DecodeText>
              </h3>
              <span className="of-prix o-shrink-0 o-text-sm o-text-zinc-600 dark:o-text-zinc-400">{prix}</span>
            </div>
            <div className="o-relative o-h-10">
              <ul className="of-puces o-absolute o-inset-0 o-m-0 o-flex o-list-none o-items-center o-gap-2 o-p-0">
                {puces.map((p) => (
                  <li key={p} className="of-large o-flex o-h-full o-items-center o-border-w-1 o-px-3 o-text-xs o-uppercase o-whitespace-nowrap o-text-zinc-600 dark:o-text-zinc-400" style={{ borderColor: 'var(--of-filet)' }}>
                    {p}
                  </li>
                ))}
              </ul>
              <a href="#collections" className="of-achat of-large o-absolute o-inset-0 o-flex o-items-center o-justify-between o-border-w-1 o-px-3 o-text-xs o-uppercase o-no-underline o-text-zinc-950 dark:o-text-zinc-50 focus:o-ring" style={{ borderColor: 'currentColor' }}>
                ACHETER
                <span className="o-sr-only">{` — ${nom}, ${prix}`}</span>
                <Fleche />
              </a>
            </div>
          </div>
        </article>
      </TiltCard>
    </li>
  )
}

/**
 * La pyramide olfactive, dessinee : cinq plaques separees, du sommet
 * volatil au fond, chacune teintee un peu plus profond que la precedente.
 */
const PLAQUES = COUCHES.map((_, i) => {
  const cy = 60 + i * 100
  const l = 150 + i * 44
  return { cy, l, ancreX: (200 + l / 2) / 400, ancreY: cy / 520 }
})

function Pyramide({ actif }: { readonly actif: number }): ReactElement {
  const encreTrait = 'var(--o-theme-fg)'
  return (
    <svg viewBox="0 0 400 520" className="o-h-full o-w-full" fill="none" aria-hidden="true" style={{ overflow: 'visible' }}>
      <path d="M200 20v490" stroke={encreTrait} strokeOpacity="0.25" strokeDasharray="2 6" />
      {PLAQUES.map((p, i) => {
        const g = 200 - p.l / 2
        const d = 200 + p.l / 2
        const e = p.l * 0.2
        const t = 18
        const teinteHaut = accentDoux(300 + i * 100, 42 + i * 12)
        const teinteCote = accentDoux(500 + i * 100, 55 + i * 10)
        const surligne = i === actif
        return (
          <g key={p.cy} style={{ opacity: actif < 0 || surligne ? 1 : 0.55, transition: 'opacity 300ms' }}>
            <path d={`M${String(g)} ${String(p.cy)}L200 ${String(p.cy + e)}L${String(d)} ${String(p.cy)}v${String(t)}L200 ${String(p.cy + e + t)}L${String(g)} ${String(p.cy + t)}Z`} fill={teinteCote} stroke={encreTrait} strokeOpacity="0.5" />
            <path d={`M${String(g)} ${String(p.cy)}L200 ${String(p.cy - e)}L${String(d)} ${String(p.cy)}L200 ${String(p.cy + e)}Z`} fill={teinteHaut} stroke={encreTrait} strokeOpacity={surligne ? '0.9' : '0.5'} strokeWidth={surligne ? 1.6 : 1} />
            <text x={g - 10} y={p.cy + 4} textAnchor="end" fill={encreTrait} fillOpacity="0.6" style={{ fontFamily: 'var(--o-font-mono)', fontSize: 11, letterSpacing: '.1em' }}>
              {COUCHES[i]?.rang}
            </text>
          </g>
        )
      })}
    </svg>
  )
}

/** Une carte de couche : le rang, le pictogramme, le titre et le corps. */
function CarteCouche({ couche, className = '', style, off = false }: { readonly couche: (typeof COUCHES)[number]; readonly className?: string; readonly style?: CSSProperties; readonly off?: boolean }): ReactElement {
  return (
    <Panneau className={`of-couche o-flex o-items-stretch o-gap-6 o-p-4 ${className}`} style={style} {...(off ? { 'data-off': '' } : {})}>
      <div className="o-flex o-shrink-0 o-flex-col o-items-start o-justify-between o-gap-4">
        <span aria-hidden="true" className="o-text-sm o-text-zinc-600 dark:o-text-zinc-400">
          {couche.rang}
        </span>
        <Trait d={PICTOS[couche.icone] ?? ''} taille={26} className="o-text-zinc-950 dark:o-text-zinc-50" />
      </div>
      <div className="o-flex o-min-w-0 o-flex-1 o-flex-col o-gap-2">
        <h3 className="of-large o-m-0 o-text-sm o-font-bold o-uppercase o-text-zinc-950 dark:o-text-zinc-50">{couche.titre}</h3>
        <p className="o-m-0 o-text-xs o-uppercase o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">{couche.texte}</p>
      </div>
    </Panneau>
  )
}

/**
 * La scene de la composition : la pyramide au centre, la carte qui descend
 * de couche en couche, la ligne de rappel entre les deux.
 *
 * La pyramide occupe la boite 26 %-62 % en largeur, 10 %-90 % en hauteur ;
 * la carte est a droite ; la ligne relie le bord gauche de la carte a la
 * pointe droite de la plaque. Tout est en pourcentages de la scene, donc
 * la ligne ne se decroche jamais de ce qu elle relie.
 */
function SceneComposition({ acte }: { readonly acte: number }): ReactElement {
  const boite = { g: 26, l: 36, h: 10, ht: 80 }
  const ancres = PLAQUES.map((p) => ({ x: boite.g + p.ancreX * boite.l, y: boite.h + p.ancreY * boite.ht }))
  const hautsCartes = ancres.map((a) => Math.min(76, Math.max(8, a.y - 5)))
  const ancre = ancres[acte] ?? ancres[0]
  const hautCarte = hautsCartes[acte] ?? 8
  return (
    <div className="o-relative o-flex o-h-full o-flex-col o-gap-6 o-px-5 o-py-6 md:o-block md:o-px-10 md:o-py-0">
      <div className="md:o-absolute md:o-left-10 md:o-top-24 md:o-w-80 lg:o-w-96">
        <Masthead id="composition-titre">CHIMIE COMPOSEE POUR DURER</Masthead>
      </div>
      <p className="o-m-0 o-max-w-md o-text-xs o-uppercase o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400 sm:o-text-sm md:o-absolute md:o-bottom-10 md:o-left-10 md:o-w-80 lg:o-w-96">
        Chaque note a une raison d etre. Du sommet volatil jusqu a la resine du fond, l extrait est construit pour tenir sans perdre sa forme.
      </p>

      <div className="o-mx-auto o-w-full o-max-w-xs md:o-absolute md:o-max-w-none" style={{ height: '38vh', ...({ '--of-pyr': 1 } as CSSProperties) }}>
        <div className="o-h-full md:o-absolute" style={{ left: `${String(boite.g)}%`, top: `${String(boite.h)}%`, width: `${String(boite.l)}%`, height: `${String(boite.ht)}%` }}>
          <Pyramide actif={acte} />
        </div>
      </div>

      {/* La ligne de rappel et son carre, sur grand ecran seulement. */}
      <svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" className="o-pointer-events-none o-absolute o-inset-0 o-hidden o-h-full o-w-full md:o-block">
        <line x1={66} y1={hautCarte + 6} x2={ancre?.x ?? 50} y2={ancre?.y ?? 50} stroke="var(--of-filet)" strokeWidth="1" vectorEffect="non-scaling-stroke" style={{ transition: 'all 700ms cubic-bezier(.16,1,.3,1)' }} />
      </svg>
      <span aria-hidden="true" className="o-absolute o-hidden o-size-2 md:o-block" style={{ left: `calc(${String(ancre?.x ?? 50)}% - 4px)`, top: `calc(${String(ancre?.y ?? 50)}% - 4px)`, backgroundColor: 'var(--o-theme-fg)', transition: 'all 700ms cubic-bezier(.16,1,.3,1)' }} />

      {COUCHES.map((c, i) => (
        <CarteCouche key={c.rang} couche={c} off={i !== acte} className="md:o-absolute md:o-right-10 md:o-w-80 lg:o-w-96" style={{ top: `${String(hautsCartes[i] ?? 8)}%` }} />
      ))}

      <ol aria-hidden="true" className="o-m-0 o-flex o-list-none o-gap-2 o-p-0 md:o-absolute md:o-bottom-10 md:o-right-10 md:o-w-80 lg:o-w-96">
        {COUCHES.map((c, i) => (
          <li key={c.rang} className="o-h-0.5 o-flex-1" style={{ backgroundColor: i <= acte ? encre() : 'var(--of-filet)', transition: 'background-color 300ms' }} />
        ))}
      </ol>
    </div>
  )
}

/** Une ligne des questions : le rang et la question a gauche, la reponse a droite. */
function Question({ rang, question, reponse }: (typeof QUESTIONS)[number]): ReactElement {
  return (
    <Panneau className="o-flex o-flex-col o-gap-4 o-p-4 md:o-flex-row md:o-items-start md:o-gap-0">
      <dt className="o-flex o-shrink-0 o-flex-col o-gap-3 md:o-w-48 md:o-pr-6">
        <span className="of-large o-text-sm o-font-bold o-uppercase o-text-zinc-950 dark:o-text-zinc-50">{question}</span>
        <span aria-hidden="true" className="o-text-sm o-text-zinc-600 dark:o-text-zinc-400">
          {rang}
        </span>
      </dt>
      <dd className="of-filet o-m-0 o-min-w-0 o-flex-1 o-text-xs o-uppercase o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400 md:o-border-l md:o-pl-6" style={{ minHeight: '4.5rem' }}>
        {reponse}
      </dd>
    </Panneau>
  )
}

/** Le bulletin : un courriel, une fleche, et la case de consentement. */
function Bulletin(): ReactElement {
  const idCourriel = useId()
  const idConsentement = useId()
  return (
    <form
      className="o-flex o-flex-col o-gap-4"
      onSubmit={(e) => {
        e.preventDefault()
      }}
    >
      <label htmlFor={idCourriel} className="of-large o-text-sm o-font-bold o-uppercase o-text-zinc-950 dark:o-text-zinc-50">
        AVANT LE PROCHAIN LOT.
      </label>
      <div className="o-flex o-items-center o-border-w-1 o-pr-4 o-text-zinc-950 dark:o-text-zinc-50" style={{ borderColor: 'currentColor' }}>
        <input id={idCourriel} type="email" name="courriel" autoComplete="email" placeholder="Votre e-mail" className="of-champ of-large o-min-w-0 o-flex-1 o-border-none o-bg-transparent o-px-4 o-py-3 o-font-mono o-text-xs o-uppercase o-text-zinc-950 dark:o-text-zinc-50 focus:o-ring" />
        <button type="submit" className="o-inline-flex o-cursor-pointer o-items-center o-border-none o-bg-transparent o-p-2 o-text-zinc-950 dark:o-text-zinc-50 focus:o-ring">
          <span className="o-sr-only">S inscrire</span>
          <Fleche />
        </button>
      </div>
      <div className="o-flex o-items-center o-gap-3 o-text-zinc-950 dark:o-text-zinc-50">
        <input id={idConsentement} type="checkbox" name="consentement" className="of-case o-size-3 o-shrink-0 o-cursor-pointer o-rounded-none focus:o-ring" />
        <label htmlFor={idConsentement} className="of-large o-text-xs o-uppercase o-text-zinc-600 dark:o-text-zinc-400">
          J ACCEPTE DE RECEVOIR VOS NOUVELLES.
        </label>
      </div>
    </form>
  )
}

/* ============================ La page ================================== */

export default function Page(): ReactElement {
  const polices = usePolices('grotesk')
  const { reduced } = useMotionState()

  const lampe = useRef<HTMLDivElement>(null)
  const boite = useRef<HTMLDivElement>(null)
  const heros = useRef<HTMLElement>(null)
  const details = useRef<HTMLElement>(null)
  const questions = useRef<HTMLElement>(null)
  const etat = useRef<Etat>(ETAT_INITIAL)
  const sombre = useRef(false)

  const refs = useRef({ lampe, boite, heros, details, questions })
  useMecanique(refs.current, etat)

  // Le theme, lu au changement de la racine et non a chaque image.
  useEffect(() => {
    sombre.current = estSombre()
    const relire = (): void => {
      sombre.current = estSombre()
    }
    const observateur = new MutationObserver(relire)
    observateur.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme', 'class', 'style'] })
    const media = window.matchMedia('(prefers-color-scheme: dark)')
    media.addEventListener('change', relire)
    return () => {
      observateur.disconnect()
      media.removeEventListener('change', relire)
    }
  }, [])

  const construire = useCallback((contexte: SceneContext) => construireScene(contexte, etat, sombre), [])
  const animer = useCallback((contexte: SceneContext, image: { readonly time: number }) => {
    animerScene(contexte, image.time, etat)
  }, [])

  const encreForte = 'o-text-zinc-950 dark:o-text-zinc-50'

  return (
    <Porte forme="compteur" marque="Odoro" sombre={false}>
      <div className={`of-racine o-relative o-font-mono ${encreForte}`} style={polices}>
        <style>{FEUILLE}</style>

        {/* Le papier : la lumiere d abord, les barres par-dessus. */}
        <div ref={lampe} aria-hidden="true" className="of-lampe o-z-0" />
        <div aria-hidden="true" className="of-trame o-z-0" />

        <div className="o-relative">
          {/* Le canevas colle, qui porte le flacon du heros aux questions. */}
          <div
            ref={boite}
            className={`of-scene o-z-0 o-overflow-hidden ${reduced ? 'o-absolute o-inset-x-0 o-top-0' : 'o-sticky'}`}
            style={{ top: reduced ? 0 : CHROME, height: ECRAN }}
          >
            <Volume
              nom="flacon d apothicaire"
              className="o-absolute o-inset-0"
              construire={construire}
              animer={animer}
              repli={
                <div className="o-relative o-flex o-h-full o-items-center o-justify-center">
                  <span aria-hidden="true" className="o-pointer-events-none o-absolute o-select-none o-font-bold" style={{ fontSize: 'min(27vw, 46vh)', lineHeight: 1, color: 'color-mix(in oklab, var(--o-theme-fg) 14%, transparent)', top: '48%', transform: 'translateY(-50%)' }}>
                    ODORO
                  </span>
                  <div className="o-relative" style={{ height: '58%' }}>
                    <FlaconDessine liquide="var(--o-vitrine-500)" className="o-h-full" />
                  </div>
                </div>
              }
            />
          </div>

          <div className="o-relative o-z-10" style={{ marginTop: `calc(-1 * ${ECRAN})` }}>
            {/* ----- Le heros ---------------------------------------------- */}
            <section id="haut" ref={heros} aria-labelledby="titre-page" className="o-relative o-flex o-flex-col" style={{ minHeight: ECRAN }}>
              <Entete />

              {/* Les deux marqueurs, de part et d autre. */}
              <div className="of-fleches o-flex o-justify-between o-gap-4 o-px-5 md:o-absolute md:o-top-1/2 md:o-px-0">
                <div className="md:o-absolute md:o-left-0 md:o-top-0" style={{ transform: 'translateY(-50%)' }}>
                  <Marqueur lignes={MARQUEUR_GAUCHE} cote="gauche" delai={140} />
                </div>
                <div className="md:o-absolute md:o-right-0 md:o-top-0" style={{ transform: 'translateY(-50%)' }}>
                  <Marqueur lignes={MARQUEUR_DROIT} cote="droit" delai={220} />
                </div>
              </div>

              {/* La place du flacon, sur ecran etroit : il est dans le canevas
                  derriere, plus petit, et la colonne lui laisse cette hauteur. */}
              <div aria-hidden="true" className="o-grow md:o-hidden" style={{ minHeight: '34vh' }} />
              <div className="o-hidden o-grow md:o-block" />

              <div className="o-flex o-flex-col o-items-center o-gap-8 o-px-5 o-pt-8">
                <h1 id="titre-page" className={`of-large o-m-0 o-flex o-flex-col o-items-center o-text-center o-text-sm o-uppercase o-leading-relaxed sm:o-text-base ${encreForte}`}>
                  {TITRE.map((ligne, i) => (
                    <Surgit key={ligne} as="span" delai={260 + i * 110} className="o-block">
                      <DecodeText as="span" trigger="mount" duration={1100}>
                        {ligne}
                      </DecodeText>
                    </Surgit>
                  ))}
                </h1>
                <Surgit delai={420}>
                  <Aimant force={0.3}>
                    <BoutonCadre cible="#details">DECOUVRIR</BoutonCadre>
                  </Aimant>
                </Surgit>
              </div>

              <div className="o-mt-10 o-grid o-gap-3 o-px-5 o-pb-8 sm:o-grid-cols-2 md:o-flex md:o-justify-between md:o-px-10 md:o-pb-10">
                <Badge picto="globe" legende={BADGE_GAUCHE.legende} lignes={BADGE_GAUCHE.lignes} delai={480} />
                <Badge picto="reticule" lignes={BADGE_DROIT.lignes} delai={540} />
              </div>
            </section>

            {/* ----- La matiere premiere ---------------------------------- */}
            <section id="details" ref={details} aria-labelledby="details-titre" className="o-relative o-scroll-mt-24 o-px-5 o-py-16 md:o-px-10 md:o-py-24" style={{ minHeight: ECRAN }}>
              <div className="o-grid o-gap-10 md:o-h-full md:o-grid-cols-12 md:o-gap-6" style={{ minHeight: `calc(${ECRAN} - 12rem)` }}>
                <div className="o-flex o-flex-col o-justify-between o-gap-8 md:o-col-span-4">
                  <div className="o-flex o-flex-col o-gap-6">
                    <Masthead id="details-titre">MATIERE PREMIERE.</Masthead>
                    <p className="o-m-0 o-max-w-sm o-text-xs o-uppercase o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400 sm:o-text-sm">
                      Un extrait pense pour la chimie de la peau, l air qui change et tout ce qui arrive apres la premiere heure.
                    </p>
                  </div>
                  <div className="o-hidden md:o-block">
                    <BoutonCadre cible="#collections">VOIR L EXTRAIT</BoutonCadre>
                  </div>
                </div>
                <div className="o-hidden md:o-col-span-3 md:o-block" aria-hidden="true" />
                <ol className="o-m-0 o-grid o-list-none o-gap-3 o-p-0 sm:o-grid-cols-2 md:o-col-span-5 md:o-grid-cols-1">
                  {SPECIFICATIONS.map((s) => (
                    <li key={s.rang} className="o-min-w-0">
                      <Specification {...s} />
                    </li>
                  ))}
                </ol>
                <div className="o-flex o-justify-center md:o-hidden">
                  <BoutonCadre cible="#collections">VOIR L EXTRAIT</BoutonCadre>
                </div>
              </div>
            </section>

            {/* ----- Les collections ---------------------------------------- */}
            <section id="collections" aria-labelledby="collections-titre" className="o-relative o-flex o-scroll-mt-24 o-flex-col o-justify-between o-gap-10 o-px-5 o-py-16 md:o-px-10 md:o-py-24" style={{ minHeight: ECRAN }}>
              <div className="o-flex o-flex-col o-gap-6 md:o-flex-row md:o-items-start md:o-justify-between">
                <Masthead id="collections-titre">COLLECTIONS.</Masthead>
                <p className="o-m-0 o-max-w-xs o-text-xs o-uppercase o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400 sm:o-text-sm md:o-mr-12 md:o-mt-2">
                  Des extraits techniques pour l air qui change, la peau et le quotidien.
                </p>
              </div>
              <ul className="o-m-0 o-grid o-list-none o-gap-3 o-p-0 sm:o-grid-cols-2 lg:o-grid-cols-4">
                {EXTRAITS.map((e) => (
                  <CarteExtrait key={e.rang} {...e} />
                ))}
              </ul>
              <div className="o-flex o-justify-center">
                <BoutonCadre cible="#composition">TOUS LES EXTRAITS</BoutonCadre>
              </div>
            </section>

            {/* ----- La composition ------------------------------------------ */}
            <section id="composition" aria-labelledby="composition-titre" className="o-relative o-scroll-mt-24">
              {reduced ? (
                <div className="o-flex o-flex-col o-gap-8 o-px-5 o-py-16 md:o-px-10">
                  <Masthead>CHIMIE COMPOSEE POUR DURER</Masthead>
                  <p className="o-m-0 o-max-w-md o-text-xs o-uppercase o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400 sm:o-text-sm">
                    Chaque note a une raison d etre. Du sommet volatil jusqu a la resine du fond, l extrait est construit pour tenir sans perdre sa forme.
                  </p>
                  <div className="o-mx-auto o-w-full o-max-w-sm" style={{ height: '52vh' }}>
                    <Pyramide actif={-1} />
                  </div>
                  <ol className="o-m-0 o-grid o-list-none o-gap-3 o-p-0 sm:o-grid-cols-2">
                    {COUCHES.map((c) => (
                      <li key={c.rang} className="o-min-w-0">
                        <CarteCouche couche={c} />
                      </li>
                    ))}
                  </ol>
                </div>
              ) : (
                <Epingle ecrans={3} actes={COUCHES.length}>
                  {(acte) => <SceneComposition acte={acte} />}
                </Epingle>
              )}
            </section>

            {/* ----- Bon a savoir ------------------------------------------- */}
            <section id="questions" ref={questions} aria-labelledby="questions-titre" className="o-relative o-scroll-mt-24 o-px-5 o-py-16 md:o-px-10 md:o-py-24" style={{ minHeight: ECRAN }}>
              <div className="o-grid o-gap-10 md:o-grid-cols-12">
                <div className="md:o-col-span-5">
                  <Masthead id="questions-titre">BON A SAVOIR.</Masthead>
                </div>
                <dl className="o-m-0 o-flex o-flex-col o-gap-3 md:o-col-span-7">
                  {QUESTIONS.map((q) => (
                    <Question key={q.rang} {...q} />
                  ))}
                </dl>
              </div>
            </section>
          </div>
        </div>

        {/* ----- Le pied ------------------------------------------------- */}
        <footer className="o-relative o-z-10 o-px-5 o-pb-8 o-pt-14 md:o-px-10">
          <div className="o-grid o-gap-10 md:o-grid-cols-12">
            <a href="#haut" className={`o-no-underline md:o-col-span-3 ${encreForte} focus:o-ring`} aria-label="Odoro, retour en haut">
              <Logotype taille="o-text-xl" />
            </a>
            <nav aria-label="Plan du site" className="md:o-col-span-6">
              <ul className="o-m-0 o-grid o-list-none o-grid-cols-2 o-gap-8 o-p-0 md:o-grid-cols-4">
                {COLONNES_PIED.map((col) => (
                  <li key={col.titre} className="o-flex o-flex-col o-gap-4">
                    <a href="#haut" className={`of-large o-text-sm o-font-bold o-uppercase o-no-underline ${encreForte} focus:o-ring`}>
                      {col.titre}
                    </a>
                    {col.liens.length > 0 && (
                      <ul className="o-m-0 o-flex o-list-none o-flex-col o-gap-2 o-p-0">
                        {col.liens.map((lien) => (
                          <li key={lien}>
                            <a href="#haut" className="of-lien of-large o-text-xs o-uppercase o-no-underline o-text-zinc-600 dark:o-text-zinc-400 focus:o-ring">
                              {lien}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
            <div className="md:o-col-span-3">
              <Bulletin />
            </div>
          </div>
          <div aria-hidden="true" className="o-mt-14 o-h-px o-w-full" style={{ backgroundColor: 'var(--of-filet)' }} />
          <div className="o-mt-6 o-flex o-flex-col-reverse o-gap-4 sm:o-flex-row sm:o-items-center sm:o-justify-between">
            <p className="of-large o-m-0 o-text-xs o-uppercase o-text-zinc-600 dark:o-text-zinc-400">© 2026 ODORO. TOUS DROITS RESERVES.</p>
            <ul className="of-large o-m-0 o-flex o-list-none o-flex-wrap o-items-center o-gap-3 o-p-0 o-text-xs o-uppercase o-text-zinc-600 dark:o-text-zinc-400">
              {RESEAUX.map((r, i) => (
                <li key={r} className="o-flex o-items-center o-gap-3">
                  {i > 0 && <span aria-hidden="true">/</span>}
                  <a href="#haut" className="of-lien o-no-underline o-text-zinc-600 dark:o-text-zinc-400 focus:o-ring">
                    {r}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </footer>
      </div>
    </Porte>
  )
}

/** Le lien bleu par defaut de la librairie, coupe pour la page : tout est encre. */
void accent
void Icon
void ArrowRight
