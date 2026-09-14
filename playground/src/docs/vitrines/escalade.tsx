/**
 * Devers — salle d escalade.
 *
 * ## La reference : Kimi (GetLayers)
 *
 * Un fond franc, une encre presque noire, **un seul accent reserve a
 * l instrumentation**. On lui prend la discipline, pas le dessin : ici la
 * grammaire est celle d un topo de salle — le rond d une prise, le trait de
 * la voie, la cotation en mono, le nom de l ouvreur dans la marge.
 *
 * ## Le mecanisme : la voie
 *
 * On choisit une cotation, et **la ligne de prises s allume prise par prise,
 * dans l ordre**. Elle ne s allume pas a pas regulier : chaque prise porte le
 * temps qu on passe dessus, releve sur la video d ouverture. Un bac se quitte
 * en deux cent cinquante millisecondes ; la reglette du crux en tient mille
 * six cents. La duree de chaque segment du trace **est** cette valeur, si bien
 * que la ligne file dans la dalle et s arrete dans le devers. C est le procede
 * de `course.tsx`, mais les paliers ne sont pas dessines a la main : ils sont
 * lus dans les donnees.
 *
 * ## Le mouvement : on monte
 *
 * Le corps de la page est un diorama vertical **inverse**. Les couches ont une
 * profondeur negative : le decor descend quand on defile, donc on monte. Le
 * sol s enfonce, le mur file, le relais arrive. Un altimetre ecrit les metres
 * depuis l horloge, sans repasser par React.
 *
 * ## Tout est dessine
 *
 * Le mur, les prises, les volumes, les degaines, le plan de metro du pied :
 * aucun pixel de photographie. Une salle d escalade se dessine mieux qu elle
 * ne se photographie, parce que ce qu on veut montrer est une **ligne**.
 *
 * @module
 */

import { useMotionState } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import { ArrowRight, ArrowUpRight } from '@odoro-cli/icons/filaire'
import { Reveal } from '@odoro-cli/libs/motion'
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
} from 'react'

import { ClickSparks } from '@/odoro/effect/ClickSparks.jsx'
import { Spotlight } from '@/odoro/effect/Spotlight.jsx'
import { ScrollFloat } from '@/odoro/text/ScrollFloat.jsx'
import { PillTabs } from '@/odoro/ui/PillTabs.jsx'

import { nuit } from './communs.jsx'
import {
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
import { accent, accentDoux, encre, encreSurSombre } from './palettes.js'
import { Couche, Profondeur } from './scene.jsx'

/* ============================ Les voies ================================ */

/**
 * Une prise d une voie.
 *
 * `tenue` est le temps passe dessus, en millisecondes, releve sur la video
 * d ouverture. C est cette valeur — et elle seule — qui donne au trace sa
 * vitesse propre : la ligne met exactement ce temps a rejoindre la prise
 * suivante.
 */
interface Prise {
  readonly x: number
  readonly y: number
  readonly forme: string
  readonly tenue: number
  readonly mouvement: string
}

/** Une voie ouverte dans la salle. */
interface Voie {
  readonly id: string
  readonly cotation: string
  readonly nom: string
  readonly ouvreur: string
  readonly hauteur: string
  readonly devers: string
  readonly note: string
  readonly prises: readonly Prise[]
}

/**
 * Les quatre voies du secteur nord.
 *
 * Les coordonnees sont celles du panneau, en unites du cadre 420 x 900, prises
 * sur le releve d ouverture. Le bas du cadre est le sol.
 */
const VOIES: readonly Voie[] = [
  {
    id: '5c',
    cotation: '5c',
    nom: 'Le toboggan',
    ouvreur: 'Nadia B.',
    hauteur: '13,4 m',
    devers: 'dalle a 82°',
    note: 'La voie qu on donne a tout le monde le premier soir. Rien n y est dur, mais rien n y est gratuit non plus : il faut se tenir droit.',
    prises: [
      {
        x: 96,
        y: 840,
        forme: 'Bac',
        tenue: 700,
        mouvement: 'Depart les deux mains au bac',
      },
      {
        x: 148,
        y: 764,
        forme: 'Bac',
        tenue: 320,
        mouvement: 'Main droite, croise court',
      },
      { x: 104, y: 690, forme: 'Plat', tenue: 380, mouvement: 'Main gauche sur le plat' },
      { x: 168, y: 612, forme: 'Bac', tenue: 300, mouvement: 'Grand pas de pied droit' },
      {
        x: 122,
        y: 534,
        forme: 'Reglette',
        tenue: 420,
        mouvement: 'Reglette a deux doigts',
      },
      {
        x: 196,
        y: 462,
        forme: 'Bac',
        tenue: 280,
        mouvement: 'Jete court, il passe tout seul',
      },
      { x: 150, y: 384, forme: 'Pince', tenue: 460, mouvement: 'Pince, on souffle ici' },
      { x: 222, y: 306, forme: 'Bac', tenue: 300, mouvement: 'Retabli sur le volume' },
      { x: 176, y: 228, forme: 'Bac', tenue: 260, mouvement: 'Deux pas d echelle' },
      { x: 236, y: 148, forme: 'Bac', tenue: 300, mouvement: 'Derniere traction' },
      {
        x: 210,
        y: 86,
        forme: 'Relais',
        tenue: 620,
        mouvement: 'Relais — on mousquetonne',
      },
    ],
  },
  {
    id: '6a+',
    cotation: '6a+',
    nom: 'Plein gaz',
    ouvreur: 'Come V.',
    hauteur: '13,4 m',
    devers: 'vertical a 90°',
    note: 'Une voie de rythme : neuf mouvements enchaines sans un seul repos. Ce qui fatigue n est pas une prise, c est de n en lacher aucune.',
    prises: [
      {
        x: 240,
        y: 848,
        forme: 'Bac',
        tenue: 620,
        mouvement: 'Depart assis, pieds hauts',
      },
      {
        x: 292,
        y: 762,
        forme: 'Reglette',
        tenue: 340,
        mouvement: 'Reglette plate, main droite',
      },
      {
        x: 238,
        y: 688,
        forme: 'Inverse',
        tenue: 420,
        mouvement: 'Inverse — le bassin rentre',
      },
      { x: 300, y: 604, forme: 'Pince', tenue: 300, mouvement: 'Pince, coude haut' },
      {
        x: 244,
        y: 520,
        forme: 'Reglette',
        tenue: 280,
        mouvement: 'Relance, on ne pose pas',
      },
      { x: 312, y: 440, forme: 'Bac', tenue: 260, mouvement: 'Le seul bac de la voie' },
      {
        x: 250,
        y: 352,
        forme: 'Plat',
        tenue: 540,
        mouvement: 'Plat glissant, pied a plat',
      },
      {
        x: 318,
        y: 272,
        forme: 'Reglette',
        tenue: 320,
        mouvement: 'Deux doigts, bras tendu',
      },
      {
        x: 262,
        y: 186,
        forme: 'Pince',
        tenue: 380,
        mouvement: 'Pince haute, on se redresse',
      },
      {
        x: 296,
        y: 92,
        forme: 'Relais',
        tenue: 640,
        mouvement: 'Relais — deux mousquetons',
      },
    ],
  },
  {
    id: '6c',
    cotation: '6c',
    nom: 'La bavette',
    ouvreur: 'Tarek A.',
    hauteur: '13,4 m',
    devers: 'devers a 108°',
    note: 'Facile jusqu au huitieme metre, puis un pas de bloc sous la bavette. Quatre-vingts pour cent des chutes de la salle sont a ce mouvement-la.',
    prises: [
      {
        x: 62,
        y: 844,
        forme: 'Bac',
        tenue: 560,
        mouvement: 'Depart debout, main gauche',
      },
      { x: 118, y: 770, forme: 'Bac', tenue: 260, mouvement: 'Echelle, rien a dire' },
      { x: 74, y: 700, forme: 'Bac', tenue: 240, mouvement: 'Echelle, rien a dire' },
      {
        x: 136,
        y: 626,
        forme: 'Plat',
        tenue: 300,
        mouvement: 'Premier plat, on ralentit',
      },
      {
        x: 86,
        y: 552,
        forme: 'Reglette',
        tenue: 380,
        mouvement: 'Reglette, pied droit haut',
      },
      {
        x: 158,
        y: 486,
        forme: 'Bidoigt',
        tenue: 1600,
        mouvement: 'Le crux — bidoigt, on cherche',
      },
      {
        x: 104,
        y: 410,
        forme: 'Inverse',
        tenue: 1180,
        mouvement: 'Inverse sous la bavette',
      },
      {
        x: 182,
        y: 338,
        forme: 'Pince',
        tenue: 820,
        mouvement: 'Sortie de bavette, epaule bloquee',
      },
      { x: 128, y: 258, forme: 'Bac', tenue: 300, mouvement: 'Repos genou, on secoue' },
      {
        x: 196,
        y: 182,
        forme: 'Reglette',
        tenue: 340,
        mouvement: 'Dernier pas difficile',
      },
      { x: 154, y: 104, forme: 'Bac', tenue: 260, mouvement: 'Bac du haut' },
      {
        x: 188,
        y: 62,
        forme: 'Relais',
        tenue: 620,
        mouvement: 'Relais — fin de la voie',
      },
    ],
  },
  {
    id: '7a',
    cotation: '7a',
    nom: 'Devers nord',
    ouvreur: 'Nadia B.',
    hauteur: '12,8 m',
    devers: 'toit a 152°',
    note: 'Six metres de toit, et un talon qui decide de tout. Deux personnes de la salle l ont enchainee cette saison ; la troisieme a onze essais au compteur.',
    prises: [
      {
        x: 300,
        y: 852,
        forme: 'Bac',
        tenue: 700,
        mouvement: 'Depart, talon droit engage',
      },
      { x: 352, y: 786, forme: 'Pince', tenue: 460, mouvement: 'Pince, le bassin sort' },
      {
        x: 296,
        y: 712,
        forme: 'Reglette',
        tenue: 900,
        mouvement: 'Reglette, corps en tension',
      },
      {
        x: 356,
        y: 630,
        forme: 'Inverse',
        tenue: 1340,
        mouvement: 'Inverse sous le toit',
      },
      {
        x: 292,
        y: 560,
        forme: 'Bidoigt',
        tenue: 1820,
        mouvement: 'Le crux — bidoigt plein toit',
      },
      {
        x: 348,
        y: 486,
        forme: 'Plat',
        tenue: 1440,
        mouvement: 'Plat, talon gauche a recaler',
      },
      {
        x: 284,
        y: 412,
        forme: 'Reglette',
        tenue: 1120,
        mouvement: 'Sortie de toit, tout part du pied',
      },
      {
        x: 344,
        y: 330,
        forme: 'Bac',
        tenue: 420,
        mouvement: 'Premier bac depuis le sol',
      },
      {
        x: 288,
        y: 248,
        forme: 'Pince',
        tenue: 520,
        mouvement: 'Pince, on respire enfin',
      },
      { x: 342, y: 162, forme: 'Reglette', tenue: 380, mouvement: 'Derniere reglette' },
      { x: 312, y: 82, forme: 'Relais', tenue: 640, mouvement: 'Relais — enchainee' },
    ],
  },
]

/* ============================ Le mur, vu de face ======================= */

/** Une zone de la paroi, dans le diorama vertical. */
interface Etage {
  readonly nom: string
  readonly metre: number
  readonly angle: string
  readonly texte: string
  readonly detail: readonly (readonly [string, string])[]
}

const ETAGES: readonly Etage[] = [
  {
    nom: 'Le pied de voie',
    metre: 0,
    angle: '90°',
    texte:
      'Vingt-deux centimetres de mousse, un noeud de huit, et la seule phrase qui compte : « je te tiens ». Tout le reste de la salle est une consequence de ce moment.',
    detail: [
      ['Tapis', '22 cm — norme EN 12503'],
      ['Assureurs formes', '148 sur 402 adherents'],
    ],
  },
  {
    nom: 'La dalle',
    metre: 4,
    angle: '82°',
    texte:
      'Le mur penche encore vers vous. On y grimpe avec les pieds, et c est la seule partie de la salle ou la force ne sert a rien du tout.',
    detail: [
      ['Inclinaison', '82 degres'],
      ['Voies ouvertes', '14 — de 4a a 6b'],
    ],
  },
  {
    nom: 'Le devers',
    metre: 8,
    angle: '108°',
    texte:
      'A huit metres, la paroi bascule. Les bras prennent le poids que les pieds tenaient, et la voie cesse d etre une echelle pour devenir un probleme.',
    detail: [
      ['Inclinaison', '108 degres'],
      ['Chutes relevees', '4 sur 5 dans ce metre'],
    ],
  },
  {
    nom: 'Le toit',
    metre: 12,
    angle: '152°',
    texte:
      'Six metres a l horizontale, au-dessus du vide. On n y monte plus, on y traverse ; le corps est le seul point d appui qui reste.',
    detail: [
      ['Avancee', '6,2 m'],
      ['Voies ouvertes', '5 — de 6c a 8a'],
    ],
  },
  {
    nom: 'Le relais',
    metre: 17,
    angle: '90°',
    texte:
      'Dix-sept metres. Deux mousquetons, un « ca va ? » crie d en bas, et la descente qui dure trois fois moins longtemps que la montee.',
    detail: [
      ['Hauteur du toit', '17,4 m'],
      ['Descente', '11 secondes en moyenne'],
    ],
  },
]

/** Le haut de la paroi, en metres : la course de l altimetre. */
const SOMMET = 17.4

/* ============================ Les ouvertures =========================== */

/** Ce qui a ete ouvert ce mois-ci, par cotation. */
const OUVERTURES: readonly (readonly [string, number])[] = [
  ['4', 3],
  ['5a', 5],
  ['5b', 6],
  ['5c', 9],
  ['6a', 12],
  ['6a+', 11],
  ['6b', 8],
  ['6b+', 6],
  ['6c', 5],
  ['7a', 3],
  ['7b', 2],
  ['8a', 1],
]

/* ============================ Les creneaux ============================= */

/** Un creneau de la journee, sur la frise. */
interface Creneau {
  readonly debut: number
  readonly fin: number
  readonly nom: string
  readonly genre: 'libre' | 'cours' | 'ferme' | 'club'
  readonly places: number
}

const JOURNEE: readonly Creneau[] = [
  { debut: 6.5, fin: 9, nom: 'Ouverture matinale', genre: 'libre', places: 40 },
  { debut: 9, fin: 12, nom: 'Cours adultes — debutants', genre: 'cours', places: 4 },
  { debut: 12, fin: 14, nom: 'Pause grimpe', genre: 'libre', places: 32 },
  {
    debut: 14,
    fin: 16.5,
    nom: 'Scolaires — college Jean-Mace',
    genre: 'ferme',
    places: 0,
  },
  { debut: 16.5, fin: 18, nom: 'Cours enfants — 8 a 12 ans', genre: 'cours', places: 2 },
  { debut: 18, fin: 20.5, nom: 'Grimpe libre', genre: 'libre', places: 18 },
  { debut: 20.5, fin: 22, nom: 'Entrainement club', genre: 'club', places: 6 },
  { debut: 22, fin: 23, nom: 'Derniere heure', genre: 'libre', places: 26 },
]

/** L heure ecrite en francais court : « 16 h 30 ». */
function heure(valeur: number): string {
  const h = Math.floor(valeur)
  const m = Math.round((valeur - h) * 60)
  return m === 0 ? `${String(h)} h` : `${String(h)} h ${String(m)}`
}

/* ============================ Le plan de metro ========================= */

/** Une ligne du plan : son trace, et la couleur qui la designe. */
interface Ligne {
  readonly nom: string
  readonly chemin: string
}

/** Une station : sa place, son nom, et si c est la notre. */
interface Station {
  readonly x: number
  readonly y: number
  readonly nom: string
}

/**
 * Le plan : trois lignes en etoile autour d une seule correspondance.
 *
 * Les traces ne se recouvrent nulle part — c est la seule contrainte d un
 * plan de metro, et celle qu on oublie le plus souvent en le dessinant.
 */
const LIGNES: readonly Ligne[] = [
  { nom: 'A', chemin: 'M30 150 H430' },
  { nom: 'B', chemin: 'M95 46 L230 150 L365 254' },
  { nom: 'C', chemin: 'M95 254 L230 150 L365 46' },
]

const STATIONS: readonly Station[] = [
  { x: 30, y: 150, nom: 'Corderie' },
  { x: 130, y: 150, nom: 'Halle nord' },
  { x: 330, y: 150, nom: 'Quatre-Vents' },
  { x: 430, y: 150, nom: 'Terminus' },
  { x: 95, y: 46, nom: 'Gare centrale' },
  { x: 162, y: 98, nom: 'Ecluse' },
  { x: 298, y: 202, nom: 'Stade' },
  { x: 365, y: 254, nom: 'Malterie' },
  { x: 95, y: 254, nom: 'Bois-Robert' },
  { x: 162, y: 202, nom: 'Pont-Neuf' },
  { x: 298, y: 98, nom: 'Marche couvert' },
  { x: 365, y: 46, nom: 'Grand-Pre' },
  { x: 230, y: 150, nom: 'Devers' },
]

/* ============================ La feuille =============================== */

const STYLE_ESCALADE = 'o-vitrine-escalade'

/**
 * Ce que les utilitaires n ont pas.
 *
 * Rien ici ne cadence la voie : elle est cadencee par ses donnees, en
 * JavaScript. Ces regles ne servent qu au decor — la magnesie qui retombe, le
 * relais qui bat, le trait de la ligne de metro qui se trace une fois.
 */
const CSS_ESCALADE = [
  '@keyframes o-es-poussiere{0%{transform:translate3d(0,-12px,0);opacity:0}',
  '18%{opacity:0.55}100%{transform:translate3d(var(--o-es-derive,6px),120px,0);opacity:0}}',
  '@keyframes o-es-relais{0%,100%{opacity:0.3;transform:scale(1)}50%{opacity:1;transform:scale(1.7)}}',
  '@keyframes o-es-ligne{0%{stroke-dashoffset:var(--o-es-l,600)}100%{stroke-dashoffset:0}}',
  '@keyframes o-es-corde{0%{stroke-dashoffset:0}100%{stroke-dashoffset:-36}}',
  '[data-o-es-poussiere]{animation:o-es-poussiere var(--o-es-duree,7s) linear var(--o-es-delai,0s) infinite}',
  '[data-o-es-relais]{animation:o-es-relais 2.6s ease-in-out infinite}',
  '[data-o-es-ligne]{animation:o-es-ligne 2.4s cubic-bezier(0.3,0,0.2,1) var(--o-es-delai,0s) both}',
  '[data-o-es-corde]{animation:o-es-corde 2.2s linear infinite}',
  '@media (prefers-reduced-motion:reduce){',
  '[data-o-es-poussiere],[data-o-es-relais],[data-o-es-corde]{animation:none}',
  '[data-o-es-poussiere]{opacity:0}',
  '[data-o-es-ligne]{animation:none;stroke-dashoffset:0}}',
].join('')

function useFeuilleEscalade(): void {
  useEffect(() => {
    if (document.getElementById(STYLE_ESCALADE) !== null) return
    const feuille = document.createElement('style')
    feuille.id = STYLE_ESCALADE
    feuille.textContent = CSS_ESCALADE
    document.head.append(feuille)
  }, [])
}

/* ============================ Le dessin du mur ========================= */

/** Une suite stable, pour semer des prises sans tirer au sort a chaque rendu. */
function graines(nombre: number, germe: number): readonly number[] {
  const suite: number[] = []
  let valeur = germe
  for (let rang = 0; rang < nombre; rang += 1) {
    valeur = (valeur * 1103515245 + 12345) % 2147483648
    suite.push(valeur / 2147483648)
  }
  return suite
}

/**
 * Un semis de prises sur un panneau.
 *
 * Une prise de salle est une tache de resine, pas un cercle : une ellipse
 * pivotee suffit a la dire, et douze d entre elles font un mur.
 */
function Semis({
  nombre,
  germe,
  couleur,
  taille,
  opacite,
}: {
  readonly nombre: number
  readonly germe: number
  readonly couleur: string
  readonly taille: number
  readonly opacite: number
}): ReactElement {
  const semis = graines(nombre * 4, germe)
  return (
    <div aria-hidden="true" className="o-absolute o-inset-0">
      {Array.from({ length: nombre }, (_, rang) => {
        const largeur = taille * (0.6 + (semis[rang * 4] ?? 0) * 0.9)
        return (
          <span
            key={rang}
            className="o-absolute o-block"
            style={{
              left: `${String(((semis[rang * 4 + 1] ?? 0) * 96 + 2).toFixed(2))}%`,
              top: `${String(((semis[rang * 4 + 2] ?? 0) * 100).toFixed(2))}%`,
              width: largeur,
              height: largeur * 0.66,
              opacity: opacite,
              backgroundColor: couleur,
              borderRadius: '46% 54% 38% 62% / 58% 42% 58% 42%',
              transform: `rotate(${String(Math.round(((semis[rang * 4 + 3] ?? 0) - 0.5) * 140))}deg)`,
            }}
          />
        )
      })}
    </div>
  )
}

/** Les joints d un panneau de contreplaque : la trame du mur. */
function Panneaux({
  couleur,
  pas = 96,
}: {
  readonly couleur: string
  readonly pas?: number
}): ReactElement {
  return (
    <div
      aria-hidden="true"
      className="o-absolute o-inset-0"
      style={{
        backgroundImage: `repeating-linear-gradient(to right, ${couleur} 0 1px, transparent 1px ${String(pas)}px), repeating-linear-gradient(to bottom, ${couleur} 0 1px, transparent 1px ${String(Math.round(pas * 1.6))}px)`,
      }}
    />
  )
}

/** La magnesie qui retombe : le seul mouvement qui descend dans la salle. */
function Poussiere({
  nombre,
  germe,
}: {
  readonly nombre: number
  readonly germe: number
}): ReactElement {
  const semis = graines(nombre * 3, germe)
  return (
    <div aria-hidden="true" className="o-absolute o-inset-0 o-overflow-hidden">
      {Array.from({ length: nombre }, (_, rang) => (
        <span
          key={rang}
          data-o-es-poussiere=""
          className="o-absolute o-block o-rounded-full o-bg-white"
          style={
            {
              left: `${String(((semis[rang * 3] ?? 0) * 100).toFixed(2))}%`,
              top: `${String(((semis[rang * 3 + 1] ?? 0) * 100).toFixed(2))}%`,
              width: 2 + (semis[rang * 3 + 2] ?? 0) * 3,
              height: 2 + (semis[rang * 3 + 2] ?? 0) * 3,
              opacity: 0.4,
              '--o-es-duree': `${String(5 + (semis[rang * 3] ?? 0) * 6)}s`,
              '--o-es-delai': `${String(-rang * 0.8)}s`,
              '--o-es-derive': `${String(Math.round(((semis[rang * 3 + 2] ?? 0) - 0.5) * 26))}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}

/** Une degaine pendue a son point : le detail qui dit qu on est en salle. */
function Degaine({
  hauteur = 54,
  couleur,
}: {
  readonly hauteur?: number
  readonly couleur: string
}): ReactElement {
  return (
    <svg
      viewBox="0 0 20 60"
      width={hauteur / 3}
      height={hauteur}
      aria-hidden="true"
      fill="none"
    >
      <circle cx="10" cy="7" r="5" stroke={couleur} strokeWidth="2" />
      <rect x="7" y="12" width="6" height="32" rx="3" fill={couleur} opacity="0.75" />
      <circle cx="10" cy="52" r="6" stroke={couleur} strokeWidth="2" />
    </svg>
  )
}

/**
 * Le grimpeur, de dos, une main engagee.
 *
 * Il ne se deplace pas : c est la paroi qui coule derriere lui. Le procede est
 * celui du velo de `velo.tsx`, applique a la verticale — sans lui, le diorama
 * montre un mur qui bouge, et non quelqu un qui monte.
 */
function Grimpeur({
  largeur = 150,
  couleur,
  corde,
}: {
  readonly largeur?: number
  readonly couleur: string
  readonly corde: string
}): ReactElement {
  return (
    <svg
      viewBox="0 0 120 190"
      width={largeur}
      height={largeur * 1.58}
      aria-hidden="true"
      fill="none"
    >
      {/* Le bras gauche tendu vers la prise, le droit plie. */}
      <path d="M52 76 L30 34" stroke={couleur} strokeWidth="9" strokeLinecap="round" />
      <path
        d="M70 78 L92 52 L84 86"
        stroke={couleur}
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Le tronc et le bassin. */}
      <path d="M61 66 L59 104" stroke={couleur} strokeWidth="19" strokeLinecap="round" />
      {/* Les jambes, une haute sur la prise de pied, une en appui. */}
      <path
        d="M55 106 L38 132 L46 162"
        stroke={couleur}
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M67 106 L84 128 L78 160"
        stroke={couleur}
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* La tete, tournee vers la prise. */}
      <circle cx="56" cy="50" r="11" fill={couleur} />
      {/* Les chaussons. */}
      <path d="M42 164 L54 168" stroke={corde} strokeWidth="6" strokeLinecap="round" />
      <path d="M74 162 L86 166" stroke={corde} strokeWidth="6" strokeLinecap="round" />
    </svg>
  )
}

/**
 * La coupe de la paroi, au trait.
 *
 * Un profil, quatre angles, quatre noms : ce que la salle vend tient dans
 * cette ligne, et une photographie ne l aurait pas dit.
 */
function Coupe(): ReactElement {
  const reperes = [
    { x: 96, y: 176, nom: 'Dalle', angle: '82°' },
    { x: 320, y: 132, nom: 'Vertical', angle: '90°' },
    { x: 560, y: 88, nom: 'Devers', angle: '108°' },
    { x: 830, y: 52, nom: 'Toit', angle: '152°' },
  ]
  return (
    <svg
      viewBox="0 0 1100 210"
      className="o-h-auto o-w-full"
      role="img"
      aria-label="Coupe de la paroi : dalle a 82 degres, vertical, devers a 108 degres, toit a 152 degres, relais a 17,4 metres"
    >
      {/* Le sol. */}
      <path
        d="M20 196H1080"
        stroke={accentDoux(700, 30)}
        strokeWidth="1"
        strokeDasharray="3 7"
      />
      {/* Le profil, d un seul trait. */}
      <path
        data-o-es-ligne=""
        d="M20 196 L180 160 L420 112 L640 74 L760 40 L1000 36"
        fill="none"
        stroke={accent(500)}
        strokeWidth="3"
        strokeLinejoin="round"
        strokeLinecap="round"
        pathLength={600}
        style={{ strokeDasharray: 600, '--o-es-l': 600 } as CSSProperties}
      />
      {reperes.map((repere) => (
        <g key={repere.nom}>
          <path
            d={`M${String(repere.x)} 196V${String(repere.y)}`}
            stroke={accentDoux(700, 26)}
            strokeWidth="1"
          />
          <text
            x={repere.x}
            y={repere.y - 24}
            fontSize="17"
            textAnchor="middle"
            fill="currentColor"
            style={{
              fontFamily: 'var(--o-font-mono)',
              letterSpacing: '0.14em',
              color: 'var(--o-theme-fg)',
            }}
          >
            {repere.nom.toUpperCase()}
          </text>
          <text
            x={repere.x}
            y={repere.y - 6}
            fontSize="15"
            textAnchor="middle"
            fill="currentColor"
            style={{ fontFamily: 'var(--o-font-mono)', color: 'var(--o-theme-muted)' }}
          >
            {repere.angle}
          </text>
        </g>
      ))}
      <text
        x="1086"
        y="28"
        fontSize="15"
        textAnchor="end"
        fill="currentColor"
        style={{
          fontFamily: 'var(--o-font-mono)',
          letterSpacing: '0.12em',
          color: 'var(--o-theme-muted)',
        }}
      >
        RELAIS 17,4 M
      </text>
    </svg>
  )
}

/* ============================ Le topo ================================== */

/** La longueur cumulee de la ligne, prise par prise, en unites du cadre. */
function cumuls(prises: readonly Prise[]): readonly number[] {
  const suite: number[] = [0]
  for (let rang = 1; rang < prises.length; rang += 1) {
    const a = prises[rang - 1]
    const b = prises[rang]
    const pas = a === undefined || b === undefined ? 0 : Math.hypot(b.x - a.x, b.y - a.y)
    suite.push((suite[rang - 1] ?? 0) + pas)
  }
  return suite
}

/**
 * Le topo : le mecanisme de la page.
 *
 * La ligne rejoint chaque prise en exactement le temps que le grimpeur y
 * passe. Rien n est reparti egalement : c est ce qui fait qu on voit la voie
 * plutot qu une animation.
 */
function Topo(): ReactElement {
  const { reduced } = useMotionState()
  const [choisie, setChoisie] = useState(VOIES[2]?.id ?? '6c')
  const voie = VOIES.find((v) => v.id === choisie) ?? VOIES[0]
  // Le tableau est memorise : sans cela, un tableau neuf a chaque rendu
  // relancerait le calcul des longueurs et, avec lui, la sequence entiere.
  const prises = useMemo<readonly Prise[]>(() => voie?.prises ?? [], [voie])
  const [rang, setRang] = useState(1)

  const mesures = useMemo(() => cumuls(prises), [prises])
  const total = mesures[mesures.length - 1] ?? 1

  // Changer de voie relance la sequence au premier mouvement.
  useEffect(() => {
    setRang(reduced ? prises.length : 1)
  }, [choisie, reduced, prises.length])

  // La duree du mouvement en cours : c est elle qui cadence tout, et rien
  // d autre. Elle sert au minuteur comme a la transition du trace.
  const duree = prises[Math.max(0, rang - 1)]?.tenue ?? 600

  useEffect(() => {
    if (reduced || rang >= prises.length) return
    const id = window.setTimeout(() => {
      setRang((precedent) => precedent + 1)
    }, duree)
    return () => {
      window.clearTimeout(id)
    }
  }, [rang, duree, prises.length, reduced])

  const ligne = prises.map((p) => `${String(p.x)} ${String(p.y)}`).join(' L ')
  const atteint = (mesures[Math.max(0, rang - 1)] ?? 0) / Math.max(1, total)
  const courante = prises[Math.max(0, rang - 1)]
  const fini = rang >= prises.length

  return (
    <div className="o-grid o-gap-10 md:o-grid-cols-12 md:o-gap-14">
      {/* ------- Le panneau ------- */}
      <div className="md:o-col-span-6 lg:o-col-span-5">
        <ClickSparks
          color={accent(400)}
          count={12}
          distance={56}
          className="o-rounded-2xl"
        >
          <div
            className="o-relative o-overflow-hidden o-rounded-2xl"
            style={{ backgroundColor: accentDoux(950, 88) }}
          >
            <Panneaux couleur="color-mix(in oklab, white 7%, transparent)" pas={70} />
            <Semis
              nombre={34}
              germe={911}
              couleur="color-mix(in oklab, white 13%, transparent)"
              taille={22}
              opacite={1}
            />
            <svg
              viewBox="0 0 420 900"
              className="o-relative o-h-auto o-w-full"
              role="img"
              aria-label={`Le trace de la voie ${voie?.cotation ?? ''} — ${voie?.nom ?? ''}`}
            >
              {/* Le sol, et la ligne des dix metres. */}
              <path
                d="M0 880H420"
                stroke="color-mix(in oklab, white 26%, transparent)"
                strokeWidth="2"
              />
              {[200, 440, 680].map((y, index) => (
                <g key={y}>
                  <path
                    d={`M0 ${String(y)}H420`}
                    stroke="color-mix(in oklab, white 10%, transparent)"
                    strokeWidth="1"
                    strokeDasharray="4 10"
                  />
                  <text
                    x="8"
                    y={y - 8}
                    fontSize="15"
                    fill="currentColor"
                    style={{
                      fontFamily: 'var(--o-font-mono)',
                      letterSpacing: '0.14em',
                      color: 'var(--o-palette-stone-400)',
                    }}
                  >
                    {String((3 - index) * 4)} M
                  </text>
                </g>
              ))}

              {/* La ligne au repos, puis celle qui se remplit par-dessus. */}
              <path
                d={`M${ligne}`}
                fill="none"
                stroke="color-mix(in oklab, white 14%, transparent)"
                strokeWidth="3"
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              <path
                d={`M${ligne}`}
                fill="none"
                stroke={accent(400)}
                strokeWidth="4"
                strokeLinejoin="round"
                strokeLinecap="round"
                pathLength={1000}
                style={{
                  strokeDasharray: 1000,
                  strokeDashoffset: 1000 - Math.round(atteint * 1000),
                  transition: reduced
                    ? undefined
                    : `stroke-dashoffset ${String(duree)}ms cubic-bezier(0.4, 0, 0.3, 1)`,
                }}
              />

              {/* Les prises de la voie : eteintes, puis allumees dans l ordre. */}
              {prises.map((prise, index) => {
                const allumee = index < rang
                const relais = prise.forme === 'Relais'
                return (
                  <g key={`${String(prise.x)}-${String(prise.y)}`}>
                    {relais && allumee && !reduced && (
                      <circle
                        data-o-es-relais=""
                        cx={prise.x}
                        cy={prise.y}
                        r="13"
                        fill="none"
                        stroke={accent(400)}
                        strokeWidth="1.5"
                        style={{
                          transformOrigin: `${String(prise.x)}px ${String(prise.y)}px`,
                        }}
                      />
                    )}
                    <ellipse
                      cx={prise.x}
                      cy={prise.y}
                      rx={relais ? 13 : 12}
                      ry={relais ? 13 : 8}
                      transform={
                        relais
                          ? undefined
                          : `rotate(${String((index % 5) * 26 - 50)} ${String(prise.x)} ${String(prise.y)})`
                      }
                      fill={
                        allumee
                          ? accent(400)
                          : 'color-mix(in oklab, white 16%, transparent)'
                      }
                      stroke={allumee ? accent(200) : 'transparent'}
                      strokeWidth="1.5"
                      style={{ transition: reduced ? undefined : 'fill 240ms linear' }}
                    />
                    <text
                      x={prise.x + 20}
                      y={prise.y + 5}
                      fontSize="14"
                      fill="currentColor"
                      style={{
                        fontFamily: 'var(--o-font-mono)',
                        letterSpacing: '0.1em',
                        color: allumee
                          ? 'var(--o-palette-stone-50)'
                          : 'var(--o-palette-stone-400)',
                      }}
                    >
                      {String(index + 1).padStart(2, '0')}
                    </text>
                  </g>
                )
              })}
            </svg>
          </div>
        </ClickSparks>
      </div>

      {/* ------- Le releve ------- */}
      <div className="md:o-col-span-6 lg:o-col-span-7">
        <div className="o-flex o-flex-wrap o-items-center o-gap-4">
          <PillTabs
            label="Cotation de la voie"
            size="sm"
            style={
              {
                '--o-pill-fill': accentDoux(300, 46),
                '--o-pill-ink': encre(),
              } as CSSProperties
            }
            items={VOIES.map((v) => ({ id: v.id, label: v.cotation }))}
            value={choisie}
            onValueChange={setChoisie}
          />
          <button
            type="button"
            onClick={() => {
              setRang(1)
            }}
            className="o-inline-flex o-items-center o-gap-2 o-rounded-full o-border-w-1 o-border-black-20 dark:o-border-zinc-700 o-px-4 o-py-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-transition-colors hover:o-bg-black-10 dark:hover:o-bg-zinc-900 focus:o-ring"
          >
            Rejouer la sequence
          </button>
        </div>

        <h3
          className="o-m-0 o-mt-8 o-text-zinc-950 dark:o-text-zinc-50"
          style={{
            ...affiche('m', 700),
            fontSize: 'clamp(1.75rem, 3.6vw, 3.25rem)',
            lineHeight: 0.94,
          }}
        >
          {voie?.nom ?? ''}
        </h3>
        <p className="o-m-0 o-mt-4 o-max-w-xl o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
          {voie?.note ?? ''}
        </p>

        <dl
          className="o-m-0 o-mt-8 o-grid o-gap-px sm:o-grid-cols-3"
          style={{ backgroundColor: accentDoux(700, 18) }}
        >
          {[
            ['Ouvreur', voie?.ouvreur ?? ''],
            ['Hauteur', voie?.hauteur ?? ''],
            ['Profil', voie?.devers ?? ''],
          ].map(([quoi, valeur]) => (
            <div key={quoi} className="o-bg-zinc-50 dark:o-bg-zinc-950 o-px-4 o-py-4">
              <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                {quoi}
              </dt>
              <dd className="o-m-0 o-mt-2 o-font-mono o-text-sm o-text-zinc-950 dark:o-text-zinc-50">
                {valeur}
              </dd>
            </div>
          ))}
        </dl>

        {/* Le mouvement en cours : le seul texte que la sequence change. */}
        <div className="o-mt-8 o-rounded-2xl o-p-6" style={nuit('zinc')}>
          <p className="o-m-0 o-flex o-items-center o-gap-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
            <span style={{ color: encreSurSombre() }}>
              {String(Math.min(rang, prises.length)).padStart(2, '0')}
            </span>
            <span aria-hidden="true" className="o-h-px o-w-6 o-bg-white-20" />
            {fini ? 'Voie enchainee' : `Mouvement sur ${String(prises.length)}`}
          </p>
          <p
            className="o-m-0 o-mt-4 o-text-zinc-50"
            aria-live="polite"
            style={{
              ...affiche('m', 300),
              fontSize: 'clamp(1.25rem, 2.6vw, 2rem)',
              lineHeight: 1.06,
            }}
          >
            {courante?.mouvement ?? ''}
          </p>
          <p className="o-m-0 o-mt-5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
            {courante?.forme ?? ''} · tenue relevee {String(courante?.tenue ?? 0)} ms
          </p>
          {/* La barre de tenue : elle dit pourquoi la ligne ralentit ici. */}
          <div
            aria-hidden="true"
            className="o-mt-5 o-flex o-items-end o-gap-1"
            style={{ height: 46 }}
          >
            {prises.map((prise, index) => (
              <span
                key={`${String(prise.x)}-${String(prise.y)}-barre`}
                className="o-block o-grow"
                style={{
                  height: `${String(Math.round((prise.tenue / 1900) * 100))}%`,
                  minHeight: 3,
                  backgroundColor:
                    index < rang
                      ? accent(400)
                      : 'color-mix(in oklab, white 16%, transparent)',
                  transition: reduced ? undefined : 'background-color 240ms linear',
                }}
              />
            ))}
          </div>
          <p className="o-m-0 o-mt-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
            Chaque barre est le temps passe sur une prise. La ligne met ce temps-la a la
            rejoindre.
          </p>
        </div>

        <dl className="o-m-0 o-mt-8 o-flex o-flex-wrap o-gap-x-10 o-gap-y-4 o-border-t o-border-black-10 dark:o-border-zinc-800 o-pt-6">
          {[
            [
              'Mouvement le plus long',
              `${String(Math.max(...prises.map((prise) => prise.tenue)))} ms`,
            ],
            [
              'Tour complet',
              `${(prises.reduce((somme, prise) => somme + prise.tenue, 0) / 1000).toFixed(1).replace('.', ',')} s`,
            ],
            ['Prises comptees', String(prises.length)],
          ].map(([quoi, valeur]) => (
            <div key={quoi}>
              <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
                {quoi}
              </dt>
              <dd className="o-m-0 o-mt-1 o-font-mono o-text-sm o-tabular-nums o-text-zinc-950 dark:o-text-zinc-50">
                {valeur}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}

/* ============================ Le panneau du diorama ==================== */

/** Ce qui se pose sur la paroi, et change a chaque zone. */
function Panneau({ rang }: { readonly rang: number }): ReactElement {
  const etage = ETAGES[rang] ?? ETAGES[0]
  if (etage === undefined) return <span />
  return (
    <div className="o-flex o-h-full o-items-end o-p-6 md:o-p-10">
      <div className="o-max-w-md o-rounded-2xl o-border-w-1 o-border-white-10 o-bg-black-70 o-p-6 o-backdrop-blur-xl md:o-p-8">
        <p className="o-m-0 o-flex o-items-center o-gap-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
          <span style={{ color: encreSurSombre() }}>
            {String(rang + 1).padStart(2, '0')}
          </span>
          <span aria-hidden="true" className="o-h-px o-w-6 o-bg-white-20" />
          {etage.metre} m · {etage.angle}
        </p>
        <h3
          className="o-m-0 o-mt-4 o-text-zinc-50"
          style={{
            ...affiche('m', 700),
            fontSize: 'clamp(1.5rem, 3.2vw, 2.75rem)',
            lineHeight: 0.94,
          }}
        >
          {etage.nom}
        </h3>
        <p className="o-m-0 o-mt-4 o-text-sm o-leading-relaxed o-text-zinc-300">
          {etage.texte}
        </p>
        <dl className="o-m-0 o-mt-5">
          {etage.detail.map(([quoi, valeur]) => (
            <div
              key={quoi}
              className="o-flex o-items-baseline o-justify-between o-gap-4 o-border-t o-border-white-10 o-py-2"
            >
              <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                {quoi}
              </dt>
              <dd className="o-m-0 o-font-mono o-text-xs o-text-zinc-100">{valeur}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}

/* ============================ La page ================================== */

const NAVIGATION = [
  ['#paroi', 'La paroi'],
  ['#topo', 'Le topo'],
  ['#venir', 'Venir grimper'],
] as const

export default function Page(): ReactElement {
  const polices = usePolices('grotesk')
  useFeuilleEscalade()
  const { reduced } = useMotionState()

  // L altimetre est ecrit dans le DOM depuis l horloge de la scene : le passer
  // par l etat de React redessinerait la paroi soixante fois par seconde.
  const metres = useRef<HTMLSpanElement>(null)
  const angle = useRef<HTMLSpanElement>(null)
  const [zone, setZone] = useState(0)
  const [creneau, setCreneau] = useState(JOURNEE[5]?.nom ?? '')

  const grimper = (p: number): void => {
    const haut = p * SOMMET
    if (metres.current !== null)
      metres.current.textContent = haut.toFixed(1).replace('.', ',')
    let rang = 0
    for (const [index, etage] of ETAGES.entries()) {
      if (haut >= etage.metre) rang = index
    }
    if (angle.current !== null) angle.current.textContent = ETAGES[rang]?.angle ?? '90°'
    setZone((precedent) => (precedent === rang ? precedent : rang))
  }

  const retenu = JOURNEE.find((c) => c.nom === creneau) ?? JOURNEE[5]
  const maxOuvertures = Math.max(...OUVERTURES.map(([, n]) => n))

  return (
    <Porte forme="trou" marque="Devers" sombre={false}>
      <div
        className="o-bg-zinc-50 dark:o-bg-zinc-950 o-text-zinc-900 dark:o-text-zinc-50"
        style={polices}
      >
        {/* ================= L ouverture : la paroi vue du sol ============ */}
        <header
          className="o-relative o-isolate o-flex o-flex-col o-overflow-hidden"
          style={{ minHeight: `calc(100vh - ${String(CHROME)}px)` }}
        >
          <div
            aria-hidden="true"
            className="o-absolute o-inset-0 o-z-0"
            style={{ backgroundColor: accentDoux(200, 22) }}
          >
            <Panneaux couleur={accentDoux(800, 16)} pas={110} />
            <Semis
              nombre={26}
              germe={4177}
              couleur={accentDoux(500, 62)}
              taille={30}
              opacite={0.5}
            />
            {!reduced && <Poussiere nombre={14} germe={521} />}
          </div>

          <BarreCoins
            marque="Devers"
            liens={NAVIGATION}
            droite="Salle ouverte — 6 h 30 / 23 h"
            sombre={false}
          />

          <div className="o-relative o-z-10 o-flex o-grow o-flex-col o-justify-between o-gap-12 o-px-6 o-pb-10 md:o-px-10">
            <div className="o-grid o-items-end o-gap-10 md:o-grid-cols-12">
              <div className="md:o-col-span-7">
                <Surgit>
                  <Etiquette sombre={false}>
                    Salle d escalade — 1 400 metres carres — quartier nord
                  </Etiquette>
                </Surgit>
                <TitreVague
                  delai={140}
                  className="o-m-0 o-mt-6 o-text-zinc-950 dark:o-text-zinc-50"
                  style={{
                    ...affiche('l', 700),
                    fontSize: 'clamp(3.25rem, 13vw, 11rem)',
                    lineHeight: 0.8,
                    letterSpacing: '-0.05em',
                  }}
                >
                  Devers
                </TitreVague>
                <Surgit
                  delai={520}
                  as="p"
                  className="o-m-0 o-mt-6 o-max-w-md o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400"
                >
                  Quarante-deux voies, dix-sept metres de haut, et un topo qui vous montre
                  la ligne avant que vous mettiez les chaussons.
                </Surgit>
              </div>

              {/* La voie du jour, sous la lampe frontale du pointeur. */}
              <Surgit delai={340} className="md:o-col-span-5">
                <Spotlight size={420} color={accentDoux(400, 90)} border={false}>
                  <div className="o-rounded-2xl o-p-7" style={nuit('zinc')}>
                    <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                      Voie du jour — secteur nord
                    </p>
                    <p
                      className="o-m-0 o-mt-4 o-text-zinc-50"
                      style={{
                        ...affiche('m', 700),
                        fontSize: 'clamp(2.5rem, 5vw, 3.75rem)',
                        lineHeight: 0.86,
                        letterSpacing: '-0.04em',
                      }}
                    >
                      6c
                    </p>
                    <p className="o-m-0 o-mt-2 o-text-lg o-text-zinc-100">La bavette</p>
                    <p className="o-m-0 o-mt-5 o-border-t o-border-white-10 o-pt-4 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400">
                      Ouverte le 3 septembre par Tarek A.
                      <br />
                      <span style={{ color: encreSurSombre() }}>11 croix</span> sur 64
                      essais
                    </p>
                  </div>
                </Spotlight>
              </Surgit>
            </div>

            {/* La coupe de la paroi : le heros ne laisse pas un trou, il y met un releve. */}
            <Surgit delai={560} className="o-mx-auto o-w-full o-max-w-5xl">
              <Coupe />
            </Surgit>

            <Surgit
              delai={700}
              className="o-flex o-flex-wrap o-items-end o-justify-between o-gap-6"
            >
              <div className="o-flex o-flex-wrap o-gap-3">
                <a
                  href="#topo"
                  className="o-inline-flex o-items-center o-gap-2 o-rounded-full o-px-6 o-py-3 o-text-sm o-font-semibold o-no-underline o-transition-transform hover:o-scale-105 focus:o-ring"
                  style={{ backgroundColor: encre(), color: 'var(--o-theme-bg)' }}
                >
                  Voir une voie se tracer{' '}
                  <Icon icon={ArrowRight} size={15} aria-hidden="true" />
                </a>
                <a
                  href="#venir"
                  className="o-inline-flex o-items-center o-gap-2 o-rounded-full o-border-w-1 o-border-black-20 dark:o-border-zinc-700 o-px-6 o-py-3 o-text-sm o-font-semibold o-no-underline o-transition-colors hover:o-bg-black-10 dark:hover:o-bg-zinc-900 focus:o-ring"
                >
                  Reserver un creneau
                </a>
              </div>
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400 md:o-text-right">
                42 voies · 68 blocs · 6 volumes mobiles
                <br />
                Reouverture du secteur toit — 14 octobre
              </p>
            </Surgit>
          </div>
        </header>

        {/* ================= La paroi : le diorama vertical =============== */}
        <div id="paroi" className="o-scroll-mt-24">
          <Profondeur
            ecrans={6}
            actes={ETAGES.length}
            course={170}
            glisse={0.8}
            surProgression={grimper}
            hud={(acte) => <Panneau rang={acte} />}
            style={nuit('stone')}
          >
            {/* La halle : elle ne bouge pas, elle donne l echelle. */}
            <Couche profondeur={0}>
              <div
                aria-hidden="true"
                className="o-absolute o-inset-0"
                style={{
                  background: `linear-gradient(to bottom, var(--o-palette-stone-950) 0%, ${accentDoux(950, 82)} 52%, var(--o-palette-stone-950) 100%)`,
                }}
              />
            </Couche>

            {/*
              Les profondeurs sont negatives : le decor descend pendant qu on
              defile. C est la seule maniere honnete de dire qu on monte.
            */}
            <Couche profondeur={-0.34}>
              <div
                className="o-absolute o-inset-x-0"
                style={{ top: '-180%', height: '300%' }}
              >
                <Semis
                  nombre={44}
                  germe={2203}
                  couleur="color-mix(in oklab, white 9%, transparent)"
                  taille={26}
                  opacite={1}
                />
                <Panneaux
                  couleur="color-mix(in oklab, white 5%, transparent)"
                  pas={130}
                />
              </div>
            </Couche>

            <Couche profondeur={-0.78} derive={18}>
              <div
                className="o-absolute"
                style={{ top: '-230%', left: '6%', right: '6%', height: '340%' }}
              >
                <div
                  className="o-absolute o-inset-0 o-rounded-2xl"
                  style={{ backgroundColor: accentDoux(900, 62) }}
                />
                <Panneaux
                  couleur="color-mix(in oklab, white 10%, transparent)"
                  pas={92}
                />
                <Semis
                  nombre={72}
                  germe={7717}
                  couleur={accentDoux(400, 90)}
                  taille={30}
                  opacite={0.9}
                />
              </div>
            </Couche>

            {/* La corde, qui file vers le haut a la vitesse du premier plan. */}
            <Couche profondeur={-1} derive={26}>
              <svg
                aria-hidden="true"
                className="o-absolute o-h-full o-w-full"
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
              >
                <path
                  data-o-es-corde=""
                  d="M52 -160 C 46 -60, 58 40, 50 140"
                  fill="none"
                  stroke={accentDoux(200, 92)}
                  strokeWidth="0.6"
                  strokeDasharray="6 6"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
              <div className="o-absolute" style={{ top: '-120%', left: '22%' }}>
                <Degaine couleur={accentDoux(200, 88)} hauteur={62} />
              </div>
              <div className="o-absolute" style={{ top: '-40%', left: '70%' }}>
                <Degaine couleur={accentDoux(200, 76)} hauteur={54} />
              </div>
              <div className="o-absolute" style={{ top: '40%', left: '34%' }}>
                <Degaine couleur={accentDoux(200, 68)} hauteur={48} />
              </div>
            </Couche>

            {/* Les volumes de premier plan : ils traversent tout l ecran. */}
            <Couche profondeur={-1.3} derive={44}>
              <div className="o-absolute" style={{ top: '-160%', left: '-4%' }}>
                <span
                  className="o-block"
                  style={{
                    width: 190,
                    height: 130,
                    backgroundColor: accentDoux(700, 70),
                    clipPath: 'polygon(0 0, 100% 22%, 78% 100%, 0 74%)',
                  }}
                />
              </div>
              <div className="o-absolute" style={{ top: '-40%', right: '-3%' }}>
                <span
                  className="o-block"
                  style={{
                    width: 230,
                    height: 160,
                    backgroundColor: accentDoux(800, 72),
                    clipPath: 'polygon(22% 0, 100% 12%, 100% 88%, 0 100%)',
                  }}
                />
              </div>
              <div className="o-absolute" style={{ top: '86%', left: '12%' }}>
                <span
                  className="o-block"
                  style={{
                    width: 150,
                    height: 108,
                    backgroundColor: accentDoux(600, 62),
                    clipPath: 'polygon(0 16%, 86% 0, 100% 82%, 12% 100%)',
                  }}
                />
              </div>
            </Couche>

            {/* Le sol : il part vers le bas, et ne revient pas. */}
            <Couche profondeur={-1.45}>
              <div className="o-absolute o-inset-x-0" style={{ top: '82%' }}>
                <div
                  className="o-h-24"
                  style={{ backgroundColor: 'var(--o-palette-stone-800)' }}
                />
                <div
                  className="o-h-96"
                  style={{ backgroundColor: 'var(--o-palette-stone-950)' }}
                />
              </div>
            </Couche>

            {!reduced && (
              <Couche profondeur={-0.5}>
                <Poussiere nombre={20} germe={3313} />
              </Couche>
            )}

            {/*
              Le grimpeur ne bouge pas : c est la paroi qui coule derriere lui.
              Sans lui, on regarde un mur qui defile ; avec lui, on monte.
            */}
            <Couche profondeur={0}>
              <div className="o-absolute o-inset-0 o-flex o-items-center o-justify-center">
                <div className="o-relative">
                  {/* La corde part du baudrier et sort du cadre par le haut. */}
                  <span
                    aria-hidden="true"
                    className="o-absolute o-block"
                    style={{
                      left: 77,
                      bottom: '100%',
                      width: 3,
                      height: '70vh',
                      backgroundColor: accentDoux(200, 92),
                    }}
                  />
                  <Grimpeur
                    largeur={160}
                    couleur="var(--o-palette-stone-950)"
                    corde={accentDoux(200, 92)}
                  />
                </div>
              </div>
            </Couche>

            {/* L altimetre, colle en haut a droite de la scene. */}
            <div className="o-pointer-events-none o-absolute o-right-6 o-top-6 o-z-40 md:o-right-10 md:o-top-10">
              <div className="o-rounded-2xl o-border-w-1 o-border-white-10 o-bg-black-70 o-px-5 o-py-4 o-text-right o-backdrop-blur-xl">
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                  Altimetre
                </p>
                <p
                  className="o-m-0 o-mt-1 o-tabular-nums o-text-zinc-50"
                  style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}
                >
                  <span ref={metres} aria-hidden="true">
                    0,0
                  </span>
                  <span className="o-ml-1 o-text-base">m</span>
                  <span className="o-sr-only">
                    Zone atteinte : {ETAGES[zone]?.nom ?? ''}
                  </span>
                </p>
                <p
                  className="o-m-0 o-mt-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400"
                  aria-hidden="true"
                >
                  paroi a <span ref={angle}>90°</span>
                </p>
              </div>
            </div>
          </Profondeur>
        </div>

        {/* ================= Le topo : le mecanisme ======================= */}
        <section
          id="topo"
          className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
        >
          <div className="o-mx-auto o-max-w-6xl">
            <Reveal>
              <Indice rang="01" sombre={false}>
                Le topo
              </Indice>
            </Reveal>
            <ScrollFloat
              as="h2"
              lift={16}
              period={4600}
              className="o-m-0 o-mt-6 o-max-w-3xl o-text-zinc-950 dark:o-text-zinc-50"
              style={{
                ...affiche('m', 700),
                fontSize: 'clamp(1.85rem, 4.4vw, 3.75rem)',
                lineHeight: 0.9,
                letterSpacing: '-0.04em',
              }}
            >
              Une voie ne se lit pas a vitesse constante.
            </ScrollFloat>
            <p className="o-m-0 o-mt-6 o-max-w-xl o-text-base o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
              Choisissez une cotation : la ligne s allume prise par prise, dans l ordre,
              et met sur chaque mouvement le temps que le grimpeur y a passe le jour de l
              ouverture.
            </p>
            <div className="o-mt-14">
              <Topo />
            </div>
          </div>
        </section>

        {/* ================= Les ouvertures du mois (C14) ================= */}
        <section
          aria-labelledby="ouvertures-titre"
          className="o-border-t o-border-black-10 dark:o-border-zinc-800 o-px-6 o-py-20 md:o-px-10 md:o-py-28"
        >
          <div className="o-mx-auto o-max-w-6xl">
            <Reveal>
              <Indice rang="02" sombre={false}>
                Les ouvertures
              </Indice>
            </Reveal>
            <Reveal delay={80}>
              <h2
                id="ouvertures-titre"
                className="o-m-0 o-mt-6 o-max-w-2xl o-text-zinc-950 dark:o-text-zinc-50"
                style={{
                  ...affiche('m', 700),
                  fontSize: 'clamp(1.6rem, 3.4vw, 2.75rem)',
                  lineHeight: 0.92,
                  letterSpacing: '-0.04em',
                }}
              >
                Soixante et onze voies remises ce mois-ci.
              </h2>
            </Reveal>

            {/* Un graphique au trait, sans cadre : des batons et leur chiffre. */}
            <div className="o-mt-14 o-overflow-x-auto" style={{ overflowY: 'hidden' }}>
              <svg
                viewBox="0 0 720 260"
                className="o-h-auto"
                style={{ minWidth: 560, width: '100%', maxWidth: 860 }}
                role="img"
                aria-label="Voies ouvertes ce mois-ci par cotation, de 4 a 8a"
              >
                <path d="M0 220H720" stroke={accentDoux(700, 30)} strokeWidth="1" />
                {OUVERTURES.map(([cotation, nombre], index) => {
                  const x = 30 + index * 56
                  const hauteur = (nombre / maxOuvertures) * 172
                  return (
                    <g key={cotation}>
                      <path
                        data-o-es-ligne=""
                        d={`M${String(x)} 220V${String(220 - hauteur)}`}
                        stroke={
                          nombre === maxOuvertures ? accent(500) : accentDoux(700, 58)
                        }
                        strokeWidth={nombre === maxOuvertures ? 5 : 3}
                        strokeLinecap="round"
                        pathLength={600}
                        style={
                          {
                            strokeDasharray: 600,
                            '--o-es-l': 600,
                            '--o-es-delai': `${String((index * 0.07).toFixed(2))}s`,
                          } as CSSProperties
                        }
                      />
                      <text
                        x={x}
                        y={220 - hauteur - 14}
                        fontSize="17"
                        textAnchor="middle"
                        fill="currentColor"
                        style={{
                          fontFamily: 'var(--o-font-mono)',
                          color: 'var(--o-theme-fg)',
                        }}
                      >
                        {String(nombre)}
                      </text>
                      <text
                        x={x}
                        y={246}
                        fontSize="14"
                        textAnchor="middle"
                        fill="currentColor"
                        style={{
                          fontFamily: 'var(--o-font-mono)',
                          letterSpacing: '0.1em',
                          color: 'var(--o-theme-muted)',
                        }}
                      >
                        {cotation}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>
            <p className="o-m-0 o-mt-8 o-max-w-lg o-text-sm o-leading-relaxed o-text-zinc-600 dark:o-text-zinc-400">
              Le pic est a 6a : c est la cotation ou la salle compte le plus de monde,
              donc celle qui s use le plus vite. Les deux ouvreurs remettent un secteur
              entier toutes les trois semaines.
            </p>
          </div>
        </section>

        {/* ================= Venir grimper (A23) ========================= */}
        <section
          id="venir"
          className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-10 md:o-py-32"
          style={nuit('stone')}
        >
          <div className="o-mx-auto o-max-w-6xl">
            <Reveal>
              <Indice rang="03">Venir grimper</Indice>
            </Reveal>
            <Reveal delay={80}>
              <h2
                className="o-m-0 o-mt-6 o-max-w-2xl o-text-zinc-50"
                style={{
                  ...affiche('m', 700),
                  fontSize: 'clamp(1.85rem, 4vw, 3.25rem)',
                  lineHeight: 0.9,
                  letterSpacing: '-0.04em',
                }}
              >
                Prenez l heure ou le mur est a vous.
              </h2>
            </Reveal>

            {/* La frise de la journee : chaque bloc a la largeur de sa duree. */}
            <div className="o-mt-14">
              <div
                className="o-flex o-items-stretch o-gap-px o-overflow-hidden o-rounded-xl"
                style={{ backgroundColor: 'color-mix(in oklab, white 12%, transparent)' }}
              >
                {JOURNEE.map((bloc) => {
                  const choisi = bloc.nom === creneau
                  const libre = bloc.places > 0
                  return (
                    <button
                      key={bloc.nom}
                      type="button"
                      disabled={!libre}
                      onClick={() => {
                        setCreneau(bloc.nom)
                      }}
                      aria-pressed={choisi}
                      className="o-relative o-block o-min-w-0 o-p-0 o-text-left o-transition-colors focus:o-ring"
                      style={{
                        flexGrow: bloc.fin - bloc.debut,
                        flexBasis: 0,
                        height: 108,
                        cursor: libre ? 'pointer' : 'not-allowed',
                        border: 0,
                        backgroundColor: choisi
                          ? accent(500)
                          : libre
                            ? 'var(--o-palette-stone-900)'
                            : 'color-mix(in oklab, var(--o-palette-stone-100) 7%, var(--o-palette-stone-950))',
                        color: choisi
                          ? 'var(--o-palette-stone-950)'
                          : libre
                            ? 'var(--o-palette-stone-100)'
                            : 'var(--o-palette-stone-500)',
                      }}
                    >
                      <span className="o-absolute o-left-2 o-top-2 o-font-mono o-text-xs o-uppercase o-tracking-widest">
                        {heure(bloc.debut)}
                      </span>
                      <span className="o-absolute o-bottom-2 o-left-2 o-right-2 o-block o-truncate o-text-xs">
                        {bloc.genre === 'ferme'
                          ? 'Ferme'
                          : `${String(bloc.places)} places`}
                      </span>
                    </button>
                  )
                })}
              </div>
              <p className="o-m-0 o-mt-3 o-flex o-justify-between o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                <span>6 h 30</span>
                <span>23 h</span>
              </p>
            </div>

            <div className="o-mt-10 o-grid o-gap-8 md:o-grid-cols-12">
              <div className="md:o-col-span-7">
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                  Creneau retenu
                </p>
                <p
                  className="o-m-0 o-mt-3 o-text-zinc-50"
                  aria-live="polite"
                  style={{
                    ...affiche('m', 300),
                    fontSize: 'clamp(1.5rem, 3.2vw, 2.5rem)',
                    lineHeight: 1,
                  }}
                >
                  {retenu?.nom ?? ''} — {heure(retenu?.debut ?? 0)} a{' '}
                  {heure(retenu?.fin ?? 0)}
                </p>
                <p className="o-m-0 o-mt-4 o-max-w-md o-text-sm o-leading-relaxed o-text-zinc-300">
                  {retenu?.genre === 'cours'
                    ? 'Cours encadre : la place comprend le materiel et la formation a l assurage.'
                    : retenu?.genre === 'club'
                      ? 'Entrainement du club : ouvert aux licencies, et aux visiteurs sur inscription la veille.'
                      : 'Grimpe libre : il faut savoir assurer, ou venir avec quelqu un qui sait.'}
                </p>
              </div>
              <div className="md:o-col-span-5 md:o-flex md:o-items-end md:o-justify-end">
                <a
                  href="#venir"
                  className="o-inline-flex o-items-center o-gap-2 o-rounded-full o-px-7 o-py-4 o-text-sm o-font-semibold o-no-underline o-transition-transform hover:o-scale-105 focus:o-ring"
                  style={{
                    backgroundColor: encreSurSombre(),
                    color: 'var(--o-palette-stone-950)',
                  }}
                >
                  Reserver ce creneau{' '}
                  <Icon icon={ArrowUpRight} size={15} aria-hidden="true" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* ================= Le pied : le plan de metro (P17) ============= */}
        <footer className="o-px-6 o-py-16 md:o-px-10">
          <div className="o-mx-auto o-max-w-6xl">
            <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
              Nous trouver — arret Devers, lignes A, B et C
            </p>
            <div className="o-mt-6 o-overflow-x-auto" style={{ overflowY: 'hidden' }}>
              <svg
                viewBox="0 0 460 300"
                className="o-h-auto"
                style={{ minWidth: 460, width: '100%', maxWidth: 640 }}
                role="img"
                aria-label="Plan des trois lignes de metro ; la salle est a la station Devers, correspondance des lignes A, B et C"
              >
                {LIGNES.map((ligne, index) => (
                  <path
                    key={ligne.nom}
                    data-o-es-ligne=""
                    d={ligne.chemin}
                    fill="none"
                    stroke={index === 0 ? accent(500) : accentDoux(700, 40 + index * 14)}
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    pathLength={600}
                    style={
                      {
                        strokeDasharray: 600,
                        '--o-es-l': 600,
                        '--o-es-delai': `${String((index * 0.2).toFixed(2))}s`,
                      } as CSSProperties
                    }
                  />
                ))}
                {STATIONS.map((station) => {
                  const maison = station.nom === 'Devers'
                  // L etiquette fuit toujours le centre du plan : c est ce qui
                  // evite que deux noms se chevauchent sur une branche.
                  const ancre =
                    station.x < 160 ? 'start' : station.x > 300 ? 'end' : 'middle'
                  const dessous = station.y >= 150
                  return (
                    <g key={station.nom}>
                      {maison ? (
                        <rect
                          x={station.x - 11}
                          y={station.y - 11}
                          width="22"
                          height="22"
                          fill="var(--o-theme-bg)"
                          stroke={accent(500)}
                          strokeWidth="3"
                        />
                      ) : (
                        <circle
                          cx={station.x}
                          cy={station.y}
                          r="5.5"
                          fill="var(--o-theme-bg)"
                          stroke="var(--o-theme-muted)"
                          strokeWidth="2"
                        />
                      )}
                      <text
                        x={station.x + (ancre === 'start' ? -2 : ancre === 'end' ? 2 : 0)}
                        y={
                          maison
                            ? station.y - 20
                            : dessous
                              ? station.y + 22
                              : station.y - 14
                        }
                        fontSize={maison ? 14 : 11}
                        textAnchor={ancre}
                        fill="currentColor"
                        style={{
                          fontFamily: 'var(--o-font-mono)',
                          letterSpacing: '0.1em',
                          color: maison ? 'var(--o-theme-fg)' : 'var(--o-theme-muted)',
                        }}
                      >
                        {maison ? 'DEVERS' : station.nom}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>

            <div className="o-mt-10 o-grid o-gap-8 o-border-t o-border-black-10 dark:o-border-zinc-800 o-pt-8 sm:o-grid-cols-3">
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400">
                Devers
                <br />
                14 rue de la Corderie
                <br />
                Halle nord
              </p>
              <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400">
                Lundi au vendredi — 6 h 30 / 23 h
                <br />
                Samedi et dimanche — 9 h / 20 h
                <br />
                Ferme le 1er mai
              </p>
              <nav aria-label="Liens utiles">
                <ul className="o-m-0 o-list-none o-space-y-2 o-p-0">
                  {[
                    'Tarifs et abonnements',
                    'Cours et stages',
                    'Louer le mur',
                    'Nous ecrire',
                  ].map((lien) => (
                    <li key={lien}>
                      <a
                        href="#venir"
                        className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-600 dark:o-text-zinc-400 o-no-underline o-transition-colors hover:o-text-zinc-950 dark:hover:o-text-zinc-50 focus:o-ring"
                      >
                        {lien}
                      </a>
                    </li>
                  ))}
                </ul>
              </nav>
            </div>
            <p className="o-m-0 o-mt-10 o-border-t o-border-black-10 dark:o-border-zinc-800 o-pt-5 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-500 dark:o-text-zinc-400">
              Devers — societe cooperative — agrement FFME 2026 — © 2026. Les temps de
              tenue sont releves sur les videos d ouverture.
            </p>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
