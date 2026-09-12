/**
 * Grand Largue — ecurie de course au large.
 *
 * ## Les deux references : Kimi pour le trace, New Era pour la traversee
 *
 * De Kimi, l instrumentation : une carte marine dessinee, des roses de vent,
 * un cadran a aiguille, tout en mono. De New Era, l idee qu une page puisse
 * etre un **passage** plutot qu une plaquette — on traverse l Atlantique en
 * defilant, et le reste de la page commente ce qu on vient de traverser.
 *
 * ## Le mecanisme : la route, cadencee par le vent
 *
 * Dix-huit jours de carnet de bord ecrits a la main : la date, la force et la
 * direction du vent, le nombre de milles courus, les empannages. Le trace
 * avance d un jour toutes les huit cent cinquante millisecondes — **toujours
 * le meme temps** — mais chaque jour vaut la distance qu il a valu. La plume
 * file dans les alizes a deux cent quatre-vingts milles et se traine dans la
 * molle a soixante-quatre. C est le vent qui fait le rythme du dessin, et
 * personne n a eu a l ecrire dans une image-cle.
 *
 * La position du point du jour n est pas posee a la main non plus : elle est
 * **calculee** en marchant le long de la route au prorata des milles courus.
 * Deplacer une valeur du carnet deplace le point.
 *
 * ## Le mouvement : M-diorama
 *
 * La traversee est un diorama lateral de nuit. Le bateau ne bouge pas ; c est
 * la mer qui passe, en trois houles de profondeurs differentes. Le releve du
 * bord — milles, cap, vitesse — est interpole dans le meme carnet.
 *
 * ## Ce qui est dessine
 *
 * Tout, sauf le ciel : la carte, la route, le bateau, le plan de voilure, le
 * cadran, la mappemonde du pied. Le ciel est un semis d etoiles en shader,
 * une seule surface pour la page entiere.
 *
 * @module
 */

import { useMotionState } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import { ArrowRight, ArrowUpRight } from '@odoro-cli/icons/filaire'
import { Reveal } from '@odoro-cli/libs/motion'
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactElement } from 'react'

import { Stars } from '@/odoro/background/Stars.jsx'
import { BorderBeam } from '@/odoro/effect/BorderBeam.jsx'
import { RotatingWords } from '@/odoro/text/RotatingWords.jsx'
import { OptionWheel } from '@/odoro/ui/OptionWheel.jsx'

import { nuit } from './communs.jsx'
import {
  affiche,
  BarreFilet,
  CHROME,
  Etiquette,
  Grain,
  Indice,
  Porte,
  Surgit,
  TitreVague,
  usePolices,
  verre,
} from './marche.jsx'
import { accent, accentDoux, encreSurSombre } from './palettes.js'
import { Couche, Profondeur } from './scene.jsx'

/* ============================ Le carnet de bord ======================== */

/** Une journee de mer. */
interface Jour {
  readonly rang: number
  readonly date: string
  /** Direction d ou vient le vent, en degres. */
  readonly vent: number
  /** Force du vent, sur l echelle de Beaufort. */
  readonly force: number
  readonly milles: number
  readonly empannages: number
  readonly note: string
}

/**
 * Dix-huit jours entre Les Sables et Pointe-a-Pitre.
 *
 * Les milles sont ceux du loch, arrondis. Ce sont eux — et rien d autre — qui
 * decident de la vitesse du trace : un jour de calme avance de soixante-quatre
 * milles sur la carte, un jour d alizes de deux cent quatre-vingt-huit.
 */
const JOURNAL: readonly Jour[] = [
  { rang: 1, date: '8 novembre', vent: 315, force: 5, milles: 148, empannages: 0, note: 'Depart a 13 h 02. Sortie du chenal sous grand-voile haute, un ris par precaution.' },
  { rang: 2, date: '9 novembre', vent: 270, force: 6, milles: 172, empannages: 0, note: 'Gascogne dans la nuit. Mer courte, tout claque, personne ne dort.' },
  { rang: 3, date: '10 novembre', vent: 180, force: 3, milles: 96, empannages: 2, note: 'Le vent tombe au sud. Deux empannages pour rester dans le courant portugais.' },
  { rang: 4, date: '11 novembre', vent: 200, force: 2, milles: 64, empannages: 1, note: 'La molle. Soixante-quatre milles en vingt-quatre heures — la journee la plus courte.' },
  { rang: 5, date: '12 novembre', vent: 45, force: 4, milles: 138, empannages: 0, note: 'Le nord-est se leve enfin. On descend vers Madere avec le spi leger.' },
  { rang: 6, date: '13 novembre', vent: 45, force: 5, milles: 206, empannages: 0, note: 'Portant etabli. Pilote automatique en cap-vent, on repare la drisse de secours.' },
  { rang: 7, date: '14 novembre', vent: 45, force: 6, milles: 245, empannages: 1, note: 'Entree dans les alizes au large des Canaries. La mer se forme derriere.' },
  { rang: 8, date: '15 novembre', vent: 50, force: 6, milles: 268, empannages: 0, note: 'Deux cent soixante-huit milles. Surf a 21 noeuds tenus pendant six secondes.' },
  { rang: 9, date: '16 novembre', vent: 90, force: 6, milles: 282, empannages: 0, note: 'Est franc. On ne touche a rien de la journee, ce qui n arrive jamais.' },
  { rang: 10, date: '17 novembre', vent: 95, force: 5, milles: 254, empannages: 2, note: 'Deux empannages pour eviter un grain de trente noeuds vu au radar.' },
  { rang: 11, date: '18 novembre', vent: 85, force: 5, milles: 231, empannages: 1, note: 'Reparation du chariot de grand-voile, deux heures a genoux dans le cockpit.' },
  { rang: 12, date: '19 novembre', vent: 40, force: 3, milles: 118, empannages: 3, note: 'Le vent mollit et tourne. Trois empannages pour ne pas sortir du couloir.' },
  { rang: 13, date: '20 novembre', vent: 150, force: 2, milles: 86, empannages: 4, note: 'Le trou. Quatre empannages, quatre-vingt-six milles, et beaucoup de patience.' },
  { rang: 14, date: '21 novembre', vent: 90, force: 4, milles: 197, empannages: 1, note: 'Le vent revient par l est. On remet le grand spi a 4 h du matin.' },
  { rang: 15, date: '22 novembre', vent: 80, force: 6, milles: 264, empannages: 0, note: 'Alizes retrouves. Nuit de surf sous la lune, rien a signaler.' },
  { rang: 16, date: '23 novembre', vent: 85, force: 6, milles: 288, empannages: 0, note: 'Meilleure journee de la traversee : deux cent quatre-vingt-huit milles.' },
  { rang: 17, date: '24 novembre', vent: 50, force: 5, milles: 246, empannages: 2, note: 'On vise le nord de la Guadeloupe. Deux empannages dans le petit jour.' },
  { rang: 18, date: '25 novembre', vent: 40, force: 4, milles: 177, empannages: 1, note: 'Arrivee a 19 h 41 apres 17 jours 6 heures 39 minutes de mer.' },
]

/** Les milles cumules a la fin de chaque jour. */
const CUMULS: readonly number[] = JOURNAL.reduce<number[]>((suite, jour) => {
  suite.push((suite[suite.length - 1] ?? 0) + jour.milles)
  return suite
}, [])

/** Le total de la traversee, en milles. */
const TOTAL = CUMULS[CUMULS.length - 1] ?? 1

/** Une portion de la route, pour le diorama et pour la carte. */
interface Portion {
  readonly nom: string
  readonly dernier: number
  readonly texte: string
}

const PORTIONS: readonly Portion[] = [
  { nom: 'Le golfe de Gascogne', dernier: 2, texte: 'Deux jours de mer courte et de vent debout dans la houle. On ne gagne rien ici : on evite d y perdre un mat.' },
  { nom: 'La descente iberique', dernier: 5, texte: 'Le long du Portugal, le vent tombe puis se retablit au nord-est. Trois jours de negociation avec une carte meteo.' },
  { nom: 'Les alizes', dernier: 11, texte: 'Cinq jours de portant etabli, sept cents milles au-dessus de la moyenne, et la seule partie du parcours ou l on dort.' },
  { nom: 'Le trou', dernier: 13, texte: 'Une dorsale anticyclonique posee en travers de la route. Deux jours a cent milles, sept empannages, et toute l avance qui fond.' },
  { nom: 'L arrivee aux Antilles', dernier: 18, texte: 'Les alizes reviennent par l est. Quatre jours de surf, une nuit de lune, et le chenal de Pointe-a-Pitre au petit matin.' },
]

/** La portion a laquelle appartient un jour. */
function portionDe(rang: number): number {
  for (const [index, portion] of PORTIONS.entries()) {
    if (rang <= portion.dernier) return index
  }
  return PORTIONS.length - 1
}

/* ============================ La route sur la carte ==================== */

/**
 * Les points de la route, dans le cadre de la carte (1200 x 700).
 *
 * Ce sont les inflexions du parcours, pas les positions du jour : celles-la
 * sont **calculees** plus bas, au prorata des milles courus.
 */
const ROUTE: readonly (readonly [number, number])[] = [
  [1042, 118],
  [994, 178],
  [956, 248],
  [934, 302],
  [898, 352],
  [856, 396],
  [796, 422],
  [700, 434],
  [598, 438],
  [488, 434],
  [378, 426],
  [280, 420],
  [192, 422],
  [142, 436],
]

/** Longueurs cumulees de la route, en unites du cadre. */
const LONGUEURS: readonly number[] = ROUTE.reduce<number[]>((suite, point, rang) => {
  if (rang === 0) return [0]
  const avant = ROUTE[rang - 1] ?? point
  suite.push((suite[rang - 1] ?? 0) + Math.hypot(point[0] - avant[0], point[1] - avant[1]))
  return suite
}, [])

/** Longueur totale de la route, en unites du cadre. */
const LONGUEUR = LONGUEURS[LONGUEURS.length - 1] ?? 1

/**
 * Le point de la route a une fraction donnee du parcours.
 *
 * C est ce qui lie le carnet au dessin : la position du dix-septieme jour est
 * celle du prorata de ses milles, et rien d autre. Corriger une valeur du
 * carnet deplace le point sans qu on ait a toucher au trace.
 */
function pointA(fraction: number): readonly [number, number] {
  const vise = Math.max(0, Math.min(1, fraction)) * LONGUEUR
  for (let rang = 1; rang < ROUTE.length; rang += 1) {
    const fin = LONGUEURS[rang] ?? 0
    if (vise <= fin) {
      const debut = LONGUEURS[rang - 1] ?? 0
      const a = ROUTE[rang - 1] ?? [0, 0]
      const b = ROUTE[rang] ?? [0, 0]
      const part = fin === debut ? 0 : (vise - debut) / (fin - debut)
      return [a[0] + (b[0] - a[0]) * part, a[1] + (b[1] - a[1]) * part]
    }
  }
  return ROUTE[ROUTE.length - 1] ?? [0, 0]
}

/** Les positions du soir de chaque jour, calculees une fois. */
const POSITIONS: readonly (readonly [number, number])[] = CUMULS.map((cumul) => pointA(cumul / TOTAL))

/** Le chemin de la route, en une seule commande SVG. */
const CHEMIN = `M${ROUTE.map(([x, y]) => `${String(x)} ${String(y)}`).join(' L ')}`

/* ============================ Les escales du monde ===================== */

/** Un port du calendrier, sur la mappemonde du pied. */
interface Port {
  readonly x: number
  readonly y: number
  readonly nom: string
  readonly quand: string
}

const PORTS: readonly Port[] = [
  { x: 466, y: 152, nom: 'Les Sables', quand: 'Base — novembre' },
  { x: 412, y: 196, nom: 'Horta', quand: 'Escale technique' },
  { x: 268, y: 236, nom: 'Pointe-a-Pitre', quand: 'Arrivee — novembre' },
  { x: 350, y: 326, nom: 'Salvador', quand: 'Transat retour — mars' },
  { x: 516, y: 384, nom: 'Le Cap', quand: 'Depart — janvier' },
  { x: 868, y: 412, nom: 'Auckland', quand: 'Escale — fevrier' },
]

/**
 * Les masses continentales, en blocs.
 *
 * Une mappemonde de pied de page n a pas a etre une projection : elle a a
 * dire ou sont les ports. Cinq blocs suffisent, et le semis de points fait le
 * reste.
 */
const TERRES: readonly string[] = [
  'M120 90 C 180 66, 270 74, 318 104 C 350 124, 340 160, 300 176 C 268 190, 236 178, 214 196 C 196 212, 206 240, 188 250 C 162 264, 132 240, 124 206 C 116 172, 100 118, 120 90 Z',
  'M266 254 C 304 244, 334 264, 340 300 C 346 340, 330 384, 306 420 C 288 448, 262 450, 254 420 C 244 382, 246 330, 252 296 C 256 272, 252 258, 266 254 Z',
  'M452 96 C 506 78, 560 90, 584 116 C 602 136, 590 160, 562 168 C 534 176, 506 168, 486 176 C 468 184, 462 172, 452 152 C 442 132, 432 104, 452 96 Z',
  'M470 196 C 524 182, 574 194, 592 226 C 610 258, 600 304, 576 344 C 556 378, 530 406, 508 404 C 484 402, 470 372, 462 332 C 452 284, 448 222, 470 196 Z',
  'M600 96 C 700 70, 830 82, 888 118 C 926 142, 916 186, 872 202 C 826 218, 760 206, 712 216 C 672 224, 640 208, 620 178 C 602 150, 580 110, 600 96 Z',
  'M780 372 C 830 358, 880 372, 892 398 C 902 422, 876 442, 838 442 C 800 442, 772 424, 770 400 C 768 384, 768 376, 780 372 Z',
]

/* ============================ La feuille =============================== */

const STYLE_VOILE = 'o-vitrine-voile'

/**
 * Ce que les utilitaires n ont pas : la houle qui passe, l ecume qui file,
 * le halo de l aiguille du cadran, et le bateau qui gite dans la vague.
 */
const CSS_VOILE = [
  '@keyframes o-vo-houle{0%{transform:translate3d(0,0,0)}100%{transform:translate3d(-25%,0,0)}}',
  '@keyframes o-vo-gite{0%,100%{transform:rotate(-7deg) translate3d(0,4px,0)}50%{transform:rotate(-11deg) translate3d(0,-6px,0)}}',
  '@keyframes o-vo-feu{0%,100%{opacity:0.2}50%{opacity:1}}',
  '@keyframes o-vo-trait{0%{stroke-dashoffset:var(--o-vo-l,600)}100%{stroke-dashoffset:0}}',
  '[data-o-vo-houle]{animation:o-vo-houle var(--o-vo-duree,26s) linear infinite}',
  '[data-o-vo-gite]{animation:o-vo-gite 7s ease-in-out infinite}',
  '[data-o-vo-feu]{animation:o-vo-feu var(--o-vo-duree,3.2s) ease-in-out var(--o-vo-delai,0s) infinite}',
  '[data-o-vo-trait]{animation:o-vo-trait 2.2s ease-out var(--o-vo-delai,0s) both}',
  '@media (prefers-reduced-motion:reduce){',
  '[data-o-vo-houle],[data-o-vo-gite],[data-o-vo-feu]{animation:none}',
  '[data-o-vo-trait]{animation:none;stroke-dashoffset:0}}',
].join('')

function useFeuilleVoile(): void {
  useEffect(() => {
    if (document.getElementById(STYLE_VOILE) !== null) return
    const feuille = document.createElement('style')
    feuille.id = STYLE_VOILE
    feuille.textContent = CSS_VOILE
    document.head.append(feuille)
  }, [])
}

/* ============================ Les dessins ============================== */

/** Une suite stable, pour semer des etoiles sans tirer au sort a chaque rendu. */
function graines(nombre: number, germe: number): readonly number[] {
  const suite: number[] = []
  let valeur = germe
  for (let rang = 0; rang < nombre; rang += 1) {
    valeur = (valeur * 1103515245 + 12345) % 2147483648
    suite.push(valeur / 2147483648)
  }
  return suite
}

/** Un semis d etoiles, sur toute la largeur de la course du diorama. */
function Semis({ nombre, germe }: { readonly nombre: number; readonly germe: number }): ReactElement {
  const semis = graines(nombre * 3, germe)
  return (
    <div aria-hidden="true" className="o-absolute o-inset-0">
      {Array.from({ length: nombre }, (_, rang) => {
        const taille = 1 + (semis[rang * 3] ?? 0) * 2.4
        return (
          <span
            key={rang}
            className="o-absolute o-block o-rounded-full o-bg-white"
            style={{
              left: `${String((((semis[rang * 3 + 1] ?? 0) * 100)).toFixed(2))}%`,
              top: `${String((((semis[rang * 3 + 2] ?? 0) * 96)).toFixed(2))}%`,
              width: taille,
              height: taille,
              opacity: 0.25 + (semis[rang * 3] ?? 0) * 0.6,
            }}
          />
        )
      })}
    </div>
  )
}

/** Une houle : une bande d ondes repetee, assez large pour la course. */
function Houle({
  couleur,
  hauteur,
  duree,
  opacite = 1,
}: {
  readonly couleur: string
  readonly hauteur: string
  readonly duree: number
  readonly opacite?: number
}): ReactElement {
  return (
    <div aria-hidden="true" className="o-absolute o-bottom-0 o-left-0" style={{ width: '520vw', height: hauteur, opacity: opacite }}>
      <div
        data-o-vo-houle=""
        className="o-h-full o-w-full"
        style={{ '--o-vo-duree': `${String(duree)}s` } as CSSProperties}
      >
        <svg viewBox="0 0 400 60" preserveAspectRatio="none" className="o-h-full o-w-full">
          <path
            d="M0 60 L0 34 q 12.5 -16 25 0 t 25 0 t 25 0 t 25 0 t 25 0 t 25 0 t 25 0 t 25 0 t 25 0 t 25 0 t 25 0 t 25 0 t 25 0 t 25 0 t 25 0 t 25 0 L400 60 Z"
            fill={couleur}
          />
        </svg>
      </div>
    </div>
  )
}

/** Le bateau, de profil, gite sous le spinnaker. */
function Bateau({ largeur, coque, voile, drisse }: { readonly largeur: number; readonly coque: string; readonly voile: string; readonly drisse: string }): ReactElement {
  return (
    <svg viewBox="0 0 260 320" width={largeur} height={largeur * 1.23} aria-hidden="true" fill="none">
      {/* Le mat et le greement. */}
      <path d="M132 268 L118 26" stroke={drisse} strokeWidth="4" strokeLinecap="round" />
      <path d="M118 30 L44 250" stroke={drisse} strokeWidth="2" />
      <path d="M118 30 L216 244" stroke={drisse} strokeWidth="2" />
      {/* Le spinnaker, gonfle sur l avant. */}
      <path d="M120 38 C 196 88, 232 178, 214 246 C 176 236, 142 172, 124 96 Z" fill={voile} opacity="0.92" />
      {/* La grand-voile. */}
      <path d="M116 36 L108 250 L48 246 Z" fill={voile} opacity="0.7" />
      {/* La coque, et la quille. */}
      <path d="M28 262 L232 258 L206 292 L60 294 Z" fill={coque} />
      <path d="M128 292 L136 316 L146 292 Z" fill={coque} />
      {/* Le feu de tete de mat. */}
      <circle cx="118" cy="24" r="5" fill={drisse} />
    </svg>
  )
}

/**
 * Le cadran du vent : une aiguille, un arc de force.
 *
 * C est la forme C12 de la fiche, et c est aussi le seul instrument du bord
 * qu on regarde vraiment toutes les dix minutes.
 */
function Cadran({ direction, force }: { readonly direction: number; readonly force: number }): ReactElement {
  const { reduced } = useMotionState()
  const arc = Math.min(1, force / 8)
  const rayon = 74
  const tour = 2 * Math.PI * rayon
  return (
    <svg viewBox="0 0 200 200" className="o-h-auto o-w-full" style={{ maxWidth: 220 }} role="img" aria-label={`Vent de ${String(Math.round(direction))} degres, force ${String(force)} Beaufort`}>
      <circle cx="100" cy="100" r={rayon} fill="none" stroke="color-mix(in oklab, white 16%, transparent)" strokeWidth="10" />
      {/* L arc de force : la part du cadran que le vent occupe. */}
      <circle
        cx="100"
        cy="100"
        r={rayon}
        fill="none"
        stroke={accent(400)}
        strokeWidth="10"
        strokeLinecap="round"
        transform="rotate(-90 100 100)"
        style={{
          strokeDasharray: `${String((tour * arc).toFixed(1))} ${String(tour.toFixed(1))}`,
          transition: reduced ? undefined : 'stroke-dasharray 700ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      />
      {/* Les quatre aires cardinales. */}
      {(['N', 'E', 'S', 'O'] as const).map((lettre, rang) => {
        const angle = (rang * 90 * Math.PI) / 180
        return (
          <text
            key={lettre}
            x={100 + Math.sin(angle) * 54}
            y={100 - Math.cos(angle) * 54 + 6}
            fontSize="15"
            textAnchor="middle"
            fill="currentColor"
            style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.1em', color: 'var(--o-palette-slate-400)' }}
          >
            {lettre}
          </text>
        )
      })}
      {/* L aiguille : elle montre d ou vient le vent. */}
      <g
        style={{
          transformOrigin: '100px 100px',
          transform: `rotate(${String(direction)}deg)`,
          transition: reduced ? undefined : 'transform 800ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <path d="M100 100 L100 38" stroke={encreSurSombre()} strokeWidth="5" strokeLinecap="round" />
        <path d="M92 48 L100 32 L108 48 Z" fill={encreSurSombre()} />
      </g>
      <circle cx="100" cy="100" r="7" fill="var(--o-palette-slate-50)" />
    </svg>
  )
}

/* ============================ La carte : le mecanisme ================== */

/** Le pas du carnet : un jour toutes les huit cent cinquante millisecondes. */
const PAS = 850

/**
 * La carte marine, et la route qui s y trace au rythme du vent.
 *
 * Le trace avance d un jour a intervalle constant ; ce qui change, c est la
 * distance qu il couvre — celle du carnet. Rien n est interpole a la main.
 */
function Carte(): ReactElement {
  const { reduced } = useMotionState()
  const [jour, setJour] = useState(1)
  const [tourne, setTourne] = useState(true)

  useEffect(() => {
    if (reduced) {
      setJour(JOURNAL.length)
      return
    }
    if (!tourne || jour >= JOURNAL.length) return
    const id = window.setTimeout(() => {
      setJour((precedent) => precedent + 1)
    }, PAS)
    return () => {
      window.clearTimeout(id)
    }
  }, [jour, tourne, reduced])

  const courant = JOURNAL[jour - 1] ?? JOURNAL[0]
  const fraction = (CUMULS[jour - 1] ?? 0) / TOTAL
  const tete = POSITIONS[jour - 1] ?? POSITIONS[0] ?? [0, 0]
  const portion = PORTIONS[portionDe(jour)] ?? PORTIONS[0]

  const options = useMemo(() => JOURNAL.map((j) => ({ value: String(j.rang), label: `J${String(j.rang)} — ${j.date}` })), [])

  return (
    <div className="o-grid o-gap-10 lg:o-grid-cols-12 lg:o-gap-14">
      {/* ------- La carte ------- */}
      <div className="lg:o-col-span-8">
        <div className="o-relative o-overflow-hidden o-rounded-2xl" style={{ backgroundColor: 'var(--o-palette-slate-900)' }}>
          <svg viewBox="0 0 1200 700" className="o-h-auto o-w-full" role="img" aria-label="Carte de la traversee : Les Sables d Olonne, les Canaries, Pointe-a-Pitre, et la route parcourue">
            <defs>
              <pattern id="o-vo-grille" width="60" height="60" patternUnits="userSpaceOnUse">
                <path d="M60 0H0V60" fill="none" stroke="color-mix(in oklab, white 6%, transparent)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="1200" height="700" fill="url(#o-vo-grille)" />

            {/* Les terres : l Europe en haut a droite, les Antilles a gauche. */}
            <path d="M1200 0 L1200 190 C 1140 186, 1096 150, 1060 96 C 1040 66, 1050 20, 1074 0 Z" fill="color-mix(in oklab, white 9%, transparent)" />
            <path d="M1104 236 C 1140 224, 1180 246, 1200 286 L1200 700 L1010 700 C 1004 620, 1040 520, 1074 420 C 1092 366, 1082 268, 1104 236 Z" fill="color-mix(in oklab, white 9%, transparent)" />
            <path d="M96 396 C 128 384, 158 402, 154 428 C 150 452, 112 462, 86 448 C 62 436, 66 406, 96 396 Z" fill="color-mix(in oklab, white 9%, transparent)" />
            <path d="M0 560 C 60 538, 150 546, 196 574 C 224 592, 206 628, 160 636 C 104 646, 30 628, 0 600 Z" fill="color-mix(in oklab, white 9%, transparent)" />

            {/* Les loxodromies : la trame des cartes marines. */}
            <g stroke="color-mix(in oklab, white 8%, transparent)" strokeWidth="1">
              {[0, 30, 60, 90, 120, 150].map((angle) => (
                <path key={angle} d={`M600 300 L${String(600 + Math.cos((angle * Math.PI) / 180) * 900)} ${String(300 + Math.sin((angle * Math.PI) / 180) * 900)}`} />
              ))}
              {[180, 210, 240, 270, 300, 330].map((angle) => (
                <path key={angle} d={`M600 300 L${String(600 + Math.cos((angle * Math.PI) / 180) * 900)} ${String(300 + Math.sin((angle * Math.PI) / 180) * 900)}`} />
              ))}
              <circle cx="600" cy="300" r="118" fill="none" />
            </g>

            {/* La route au repos, puis la route parcourue par-dessus. */}
            <path d={CHEMIN} fill="none" stroke="color-mix(in oklab, white 18%, transparent)" strokeWidth="4" strokeLinejoin="round" strokeLinecap="round" strokeDasharray="2 10" />
            <path
              d={CHEMIN}
              fill="none"
              stroke={accent(400)}
              strokeWidth="5"
              strokeLinejoin="round"
              strokeLinecap="round"
              pathLength={1000}
              style={{
                strokeDasharray: 1000,
                strokeDashoffset: 1000 - Math.round(fraction * 1000),
                transition: reduced ? undefined : `stroke-dashoffset ${String(PAS)}ms linear`,
              }}
            />

            {/* Les empannages : un chevron au point ou ils ont eu lieu. */}
            {JOURNAL.map((j, index) => {
              if (j.empannages === 0 || index >= jour) return null
              const [x, y] = POSITIONS[index] ?? [0, 0]
              return (
                <g key={`empannage-${String(j.rang)}`}>
                  <path d={`M${String(x - 9)} ${String(y + 16)} L${String(x)} ${String(y + 4)} L${String(x + 9)} ${String(y + 16)}`} fill="none" stroke={encreSurSombre()} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                  <text x={x} y={y + 34} fontSize="15" textAnchor="middle" fill="currentColor" style={{ fontFamily: 'var(--o-font-mono)', color: 'var(--o-palette-slate-400)' }}>
                    {String(j.empannages)}
                  </text>
                </g>
              )
            })}

            {/* La tete du trace : le bateau, la ou il en est. */}
            <circle cx={tete[0]} cy={tete[1]} r="9" fill={accent(300)} style={{ transition: reduced ? undefined : `cx ${String(PAS)}ms linear, cy ${String(PAS)}ms linear` }} />
            {!reduced && (
              <circle data-o-vo-feu="" cx={tete[0]} cy={tete[1]} r="20" fill="none" stroke={accent(300)} strokeWidth="2" style={{ transition: `cx ${String(PAS)}ms linear, cy ${String(PAS)}ms linear` }} />
            )}

            {/* Les deux bouts de la course. */}
            <g>
              <circle cx={ROUTE[0]?.[0] ?? 0} cy={ROUTE[0]?.[1] ?? 0} r="6" fill="var(--o-palette-slate-50)" />
              <text x={(ROUTE[0]?.[0] ?? 0) - 14} y={(ROUTE[0]?.[1] ?? 0) - 16} fontSize="19" textAnchor="end" fill="currentColor" style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.12em', color: 'var(--o-palette-slate-50)' }}>
                LES SABLES
              </text>
              <circle cx={ROUTE[ROUTE.length - 1]?.[0] ?? 0} cy={ROUTE[ROUTE.length - 1]?.[1] ?? 0} r="6" fill="var(--o-palette-slate-50)" />
              <text x={(ROUTE[ROUTE.length - 1]?.[0] ?? 0) - 4} y={(ROUTE[ROUTE.length - 1]?.[1] ?? 0) + 40} fontSize="19" fill="currentColor" style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.12em', color: 'var(--o-palette-slate-50)' }}>
                POINTE-A-PITRE
              </text>
            </g>
          </svg>
        </div>

        {/* La barre de progression, en milles : le seul chiffre qui compte. */}
        <div className="o-mt-6 o-flex o-flex-wrap o-items-center o-justify-between o-gap-4">
          <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
            Jour {String(jour)} sur {String(JOURNAL.length)} — {String(CUMULS[jour - 1] ?? 0)} milles sur {String(TOTAL)}
          </p>
          <button
            type="button"
            onClick={() => {
              if (jour >= JOURNAL.length) {
                setJour(1)
                setTourne(true)
                return
              }
              setTourne((precedent) => !precedent)
            }}
            className="o-rounded-full o-border-w-1 o-border-white-20 o-px-4 o-py-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-100 o-transition-colors hover:o-bg-white-10 focus:o-ring"
          >
            {jour >= JOURNAL.length ? 'Rejouer la traversee' : tourne ? 'Arreter le carnet' : 'Reprendre'}
          </button>
        </div>
        <div aria-hidden="true" className="o-mt-3 o-h-1 o-w-full o-overflow-hidden o-rounded-full o-bg-white-10">
          <span
            className="o-block o-h-full"
            style={{ width: `${String((fraction * 100).toFixed(2))}%`, backgroundColor: accent(400), transition: reduced ? undefined : `width ${String(PAS)}ms linear` }}
          />
        </div>
      </div>

      {/* ------- Le releve du jour ------- */}
      <div className="lg:o-col-span-4">
        <div className={`${verre(true)} o-p-6`}>
          <p className="o-m-0 o-flex o-items-center o-gap-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
            <span style={{ color: encreSurSombre() }}>J{String(courant?.rang ?? 1)}</span>
            <span aria-hidden="true" className="o-h-px o-w-6 o-bg-white-20" />
            {courant?.date ?? ''}
          </p>
          <p className="o-m-0 o-mt-5 o-tabular-nums o-text-zinc-50" aria-live="polite" style={{ ...affiche('m', 300), fontSize: 'clamp(2.5rem, 5vw, 4rem)', lineHeight: 0.9 }}>
            {String(courant?.milles ?? 0)}
            <span className="o-ml-2 o-text-base" style={{ letterSpacing: 'normal' }}>milles</span>
          </p>
          <p className="o-m-0 o-mt-4 o-text-sm o-leading-relaxed o-text-zinc-300">{courant?.note ?? ''}</p>

          <div className="o-mt-6 o-flex o-items-center o-gap-5 o-border-t o-border-white-10 o-pt-6">
            <Cadran direction={courant?.vent ?? 0} force={courant?.force ?? 0} />
            <dl className="o-m-0 o-min-w-0">
              {[
                ['Force', `${String(courant?.force ?? 0)} Beaufort`],
                ['Empannages', String(courant?.empannages ?? 0)],
                ['Portion', portion?.nom ?? ''],
              ].map(([quoi, valeur]) => (
                <div key={quoi} className="o-py-1">
                  <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">{quoi}</dt>
                  <dd className="o-m-0 o-text-sm o-text-zinc-100">{valeur}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        {/* La roue du carnet : on va chercher un jour a la main. */}
        <div className="o-mt-8">
          <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">Aller a un jour</p>
          <div className="o-mt-4">
            <OptionWheel
              label="Jour du carnet de bord"
              options={options}
              value={String(jour)}
              visible={5}
              onChange={(valeur) => {
                setTourne(false)
                setJour(Number(valeur))
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============================ Le compte a rebours (A19) ================ */

/** Le temps qui reste avant la cloture des inscriptions. */
function Compte(): ReactElement {
  const [reste, setReste] = useState<readonly [number, number, number] | null>(null)

  useEffect(() => {
    const cible = new Date('2026-10-15T18:00:00Z').getTime()
    const battre = (): void => {
      const ecart = Math.max(0, cible - Date.now())
      setReste([
        Math.floor(ecart / 86_400_000),
        Math.floor((ecart % 86_400_000) / 3_600_000),
        Math.floor((ecart % 3_600_000) / 60_000),
      ])
    }
    battre()
    const id = window.setInterval(battre, 30_000)
    return () => {
      window.clearInterval(id)
    }
  }, [])

  const cases: readonly (readonly [string, string])[] = [
    ['Jours', String(reste?.[0] ?? 0)],
    ['Heures', String(reste?.[1] ?? 0).padStart(2, '0')],
    ['Minutes', String(reste?.[2] ?? 0).padStart(2, '0')],
  ]

  return (
    <BorderBeam duration={5200} width={2} trail={22} color={accent(400)} className="o-rounded-2xl">
      <div className="o-rounded-2xl o-p-8 md:o-p-12" style={{ backgroundColor: 'var(--o-palette-slate-900)' }}>
        <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
          Cloture des inscriptions — Transat en double 2027
        </p>
        <dl className="o-m-0 o-mt-8 o-flex o-flex-wrap o-items-end o-gap-x-10 o-gap-y-6">
          {cases.map(([quoi, valeur]) => (
            <div key={quoi}>
              <dt className="o-sr-only">{quoi}</dt>
              <dd className="o-m-0 o-tabular-nums o-text-zinc-50" style={{ ...affiche('m', 300), fontSize: 'clamp(3rem, 8vw, 7rem)', lineHeight: 0.84 }}>
                {valeur}
              </dd>
              <p className="o-m-0 o-mt-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">{quoi}</p>
            </div>
          ))}
        </dl>
        <p className="o-m-0 o-mt-8 o-max-w-lg o-text-base o-leading-relaxed o-text-zinc-300">
          Deux places de coequipier restent ouvertes sur le Class40 pour la saison 2027. Il faut savoir barrer de nuit, et accepter de faire la cuisine.
        </p>
        <a
          href="#route"
          className="o-mt-8 o-inline-flex o-items-center o-gap-2 o-rounded-full o-px-7 o-py-4 o-text-sm o-font-semibold o-no-underline o-transition-transform hover:o-scale-105 focus:o-ring"
          style={{ backgroundColor: encreSurSombre(), color: 'var(--o-palette-slate-950)' }}
        >
          Deposer une candidature <Icon icon={ArrowUpRight} size={15} aria-hidden="true" />
        </a>
      </div>
    </BorderBeam>
  )
}

/* ============================ Le panneau du diorama ==================== */

/** Ce qui se pose sur la mer, et change a chaque portion. */
function Panneau({ rang }: { readonly rang: number }): ReactElement {
  const portion = PORTIONS[rang] ?? PORTIONS[0]
  if (portion === undefined) return <span />
  const premier = rang === 0 ? 1 : (PORTIONS[rang - 1]?.dernier ?? 0) + 1
  return (
    <div className="o-flex o-h-full o-items-end o-p-6 md:o-p-10">
      <div className="o-max-w-md o-rounded-2xl o-border-w-1 o-border-white-10 o-bg-black-70 o-p-6 o-backdrop-blur-xl md:o-p-8">
        <p className="o-m-0 o-flex o-items-center o-gap-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
          <span style={{ color: encreSurSombre() }}>{String(rang + 1).padStart(2, '0')}</span>
          <span aria-hidden="true" className="o-h-px o-w-6 o-bg-white-20" />
          Jours {String(premier)} a {String(portion.dernier)}
        </p>
        <h3 className="o-m-0 o-mt-4 o-text-zinc-50" style={{ ...affiche('m', 300), fontSize: 'clamp(1.5rem, 3.2vw, 2.75rem)', lineHeight: 0.98 }}>
          {portion.nom}
        </h3>
        <p className="o-m-0 o-mt-4 o-text-sm o-leading-relaxed o-text-zinc-300">{portion.texte}</p>
      </div>
    </div>
  )
}

/* ============================ La page ================================== */

const NAVIGATION = [
  ['#traversee', 'La traversee'],
  ['#bateau', 'Le bateau'],
  ['#route', 'La route'],
] as const

export default function Page(): ReactElement {
  const polices = usePolices('inter')
  useFeuilleVoile()
  const { reduced } = useMotionState()

  // Le releve du bord est ecrit dans le DOM depuis l horloge de la scene.
  const milles = useRef<HTMLSpanElement>(null)
  const noeuds = useRef<HTMLSpanElement>(null)
  const cap = useRef<HTMLSpanElement>(null)
  const [portionLue, setPortionLue] = useState(0)

  /** Le jour atteint, pour une progression donnee de la traversee. */
  const jourA = (p: number): number => {
    const parcourus = p * TOTAL
    let rang = 1
    for (const [index, cumul] of CUMULS.entries()) {
      if (parcourus >= cumul) rang = index + 2
    }
    return Math.min(JOURNAL.length, rang)
  }

  const naviguer = (p: number): void => {
    const parcourus = Math.round(p * TOTAL)
    const jour = JOURNAL[jourA(p) - 1] ?? JOURNAL[0]
    if (milles.current !== null) milles.current.textContent = parcourus.toLocaleString('fr-FR')
    if (noeuds.current !== null && jour !== undefined) noeuds.current.textContent = (jour.milles / 24).toFixed(1).replace('.', ',')
    if (cap.current !== null && jour !== undefined) cap.current.textContent = String(Math.round(200 + (jour.vent - 40) * 0.35))
    const rang = portionDe(jourA(p))
    setPortionLue((precedent) => (precedent === rang ? precedent : rang))
  }

  return (
    <Porte forme="lettres" marque="Grand Largue">
      <div className="o-relative" style={{ ...nuit('slate'), ...polices }}>
        <BarreFilet marque="Grand Largue" liens={NAVIGATION} action={['#inscriptions', 'Embarquer']} />

        {/* ================= L ouverture : la carte marine =============== */}
        <header className="o-relative o-isolate o-flex o-flex-col o-justify-between o-overflow-hidden o-px-6 o-pb-14 o-pt-16 md:o-px-10" style={{ minHeight: `calc(100vh - ${String(CHROME)}px - 78px)` }}>
          <div aria-hidden="true" className="o-absolute o-inset-0 o-z-0">
            <Stars
              className="o-absolute o-inset-0"
              speed={0.22}
              density={20}
              twinkle={0.7}
              colors={['--o-palette-slate-950', '--o-vitrine-200']}
              fallback="o-bg-slate-950"
            />
          </div>
          {/* La rose des vents, posee sur le ciel : le seul ornement du heros. */}
          <div aria-hidden="true" className="o-pointer-events-none o-absolute o-right-0 o-z-10 o-hidden lg:o-block" style={{ top: '22%', width: '46vw', opacity: 0.24 }}>
            <svg viewBox="0 0 400 400" className="o-h-auto o-w-full">
              <circle cx="200" cy="200" r="186" fill="none" stroke={accent(300)} strokeWidth="1" />
              <circle cx="200" cy="200" r="132" fill="none" stroke={accent(300)} strokeWidth="1" />
              {Array.from({ length: 32 }, (_, rang) => {
                const angle = (rang * 11.25 * Math.PI) / 180
                const dedans = rang % 4 === 0 ? 132 : rang % 2 === 0 ? 162 : 174
                return (
                  <path
                    key={rang}
                    d={`M${String(200 + Math.sin(angle) * dedans)} ${String(200 - Math.cos(angle) * dedans)}L${String(200 + Math.sin(angle) * 186)} ${String(200 - Math.cos(angle) * 186)}`}
                    stroke={accent(300)}
                    strokeWidth={rang % 4 === 0 ? 2 : 1}
                  />
                )
              })}
              <path d="M200 42 L226 200 L200 358 L174 200 Z" fill="none" stroke={accent(300)} strokeWidth="1.5" />
              <path d="M42 200 L200 174 L358 200 L200 226 Z" fill="none" stroke={accent(300)} strokeWidth="1.5" />
            </svg>
          </div>
          <Grain opacite={0.05} />

          <div className="o-relative o-z-20">
            <Surgit>
              <Etiquette>Class40 n° 168 — Les Sables d Olonne</Etiquette>
            </Surgit>
            <TitreVague
              delai={140}
              className="o-m-0 o-mt-8 o-max-w-4xl o-text-zinc-50"
              style={{ ...affiche('l', 300), fontSize: 'clamp(2.75rem, 9vw, 9rem)' }}
            >
              Grand Largue
            </TitreVague>
          </div>

          <div className="o-relative o-z-20 o-flex o-flex-wrap o-items-end o-justify-between o-gap-8">
            <Surgit delai={520} as="p" className="o-m-0 o-max-w-md o-text-base o-leading-relaxed o-text-zinc-300">
              Trois mille quatre cent quatre-vingts milles entre Les Sables et Pointe-a-Pitre. Nous publions le carnet de bord entier, jour par jour, y compris les deux journees ou nous n avancions plus.
            </Surgit>
            <Surgit delai={640} className="o-flex o-flex-wrap o-gap-3">
              <a
                href="#traversee"
                className="o-inline-flex o-items-center o-gap-2 o-rounded-full o-px-6 o-py-3 o-text-sm o-font-semibold o-no-underline o-transition-transform hover:o-scale-105 focus:o-ring"
                style={{ backgroundColor: encreSurSombre(), color: 'var(--o-palette-slate-950)' }}
              >
                Prendre la mer <Icon icon={ArrowRight} size={15} aria-hidden="true" />
              </a>
              <a
                href="#route"
                className="o-inline-flex o-items-center o-gap-2 o-rounded-full o-border-w-1 o-border-white-20 o-bg-white-10 o-px-6 o-py-3 o-text-sm o-font-semibold o-text-white o-no-underline o-backdrop-blur-md o-transition-colors hover:o-bg-white-20 focus:o-ring"
              >
                Voir le carnet
              </a>
            </Surgit>
          </div>

          {/*
            Les metadonnees sont en bande et non aux coins : posees en coin,
            elles tombaient sur le paragraphe et sur les gelules.
          */}
          <Surgit delai={760} className="o-relative o-z-20 o-mt-10 o-grid o-gap-4 o-border-t o-border-white-10 o-pt-5 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest o-text-zinc-400 sm:o-grid-cols-3">
            <p className="o-m-0">46° 29 N — 1° 47 O · Port-Olona</p>
            <p className="o-m-0 sm:o-text-center">17 j 06 h 39 min de traversee</p>
            <p className="o-m-0 sm:o-text-right">Meilleure journee — 288 milles</p>
          </Surgit>
        </header>

        {/* ================= La traversee : le diorama lateral =========== */}
        <div id="traversee" className="o-scroll-mt-24">
          <Profondeur
            ecrans={7}
            actes={PORTIONS.length}
            acteDe={(p) => portionDe(jourA(p))}
            course={380}
            sens="x"
            glisse={0.8}
            surProgression={naviguer}
            hud={(acte) => <Panneau rang={acte} />}
            className="o-bg-slate-950"
          >
            {/* Le ciel de nuit : il ne bouge pas, il donne l echelle. */}
            <Couche profondeur={0}>
              <div
                aria-hidden="true"
                className="o-absolute o-inset-0"
                style={{ background: `linear-gradient(to bottom, var(--o-palette-slate-950) 0%, ${accentDoux(900, 62)} 58%, ${accentDoux(800, 48)} 100%)` }}
              />
            </Couche>

            {/* Le semis d etoiles : dessine, parce qu une page n ouvre qu une
                seule surface graphique et qu elle est deja prise par le heros. */}
            <Couche profondeur={0.05}>
              <div aria-hidden="true" className="o-absolute o-inset-0" style={{ height: '58%' }}>
                <Semis nombre={90} germe={8123} />
              </div>
            </Couche>

            {/* La lune, basse sur l horizon : elle donne l heure de la scene. */}
            <Couche profondeur={0.12}>
              <div aria-hidden="true" className="o-absolute" style={{ right: '14%', top: '16%' }}>
                <span
                  className="o-block o-rounded-full"
                  style={{ width: 66, height: 66, backgroundColor: accentDoux(100, 92), boxShadow: `0 0 90px 24px ${accentDoux(300, 26)}` }}
                />
              </div>
            </Couche>

            {/* Trois houles, trois profondeurs : c est l ecart qui fait la mer. */}
            <Couche profondeur={0.2}>
              <Houle couleur={accentDoux(800, 66)} hauteur="34%" duree={44} opacite={0.8} />
            </Couche>
            <Couche profondeur={0.5}>
              <Houle couleur={accentDoux(900, 74)} hauteur="26%" duree={30} />
            </Couche>
            <Couche profondeur={0.86} derive={16}>
              <Houle couleur="var(--o-palette-slate-950)" hauteur="18%" duree={20} />
            </Couche>

            {/* Le bateau : il ne se deplace pas, c est la mer qui passe. */}
            <Couche profondeur={0}>
              <div className="o-absolute o-inset-x-0 o-bottom-0 o-flex o-justify-center" style={{ height: '58%' }}>
                <div data-o-vo-gite="" className="o-self-end" style={{ marginBottom: '6%' }}>
                  <Bateau
                    largeur={reduced ? 220 : 300}
                    coque="var(--o-palette-slate-950)"
                    voile={accentDoux(200, 88)}
                    drisse={accentDoux(100, 92)}
                  />
                </div>
              </div>
            </Couche>

            {/* Le releve du bord, colle en haut a droite. */}
            <div className="o-pointer-events-none o-absolute o-right-6 o-top-6 o-z-40 md:o-right-10 md:o-top-10">
              <div className="o-rounded-2xl o-border-w-1 o-border-white-10 o-bg-black-70 o-px-5 o-py-4 o-text-right o-backdrop-blur-xl">
                <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">Loch</p>
                <p className="o-m-0 o-mt-1 o-tabular-nums o-text-zinc-50" style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 4vw, 3rem)' }}>
                  <span ref={milles} aria-hidden="true">0</span>
                  <span className="o-ml-1 o-text-base" style={{ letterSpacing: 'normal' }}>milles</span>
                  <span className="o-sr-only">Portion en cours : {PORTIONS[portionLue]?.nom ?? ''}</span>
                </p>
                <p className="o-m-0 o-mt-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400" aria-hidden="true">
                  <span ref={noeuds}>0,0</span> noeuds · cap <span ref={cap}>200</span>°
                </p>
              </div>
            </div>
          </Profondeur>
        </div>

        {/* ================= Le bateau : le plan de voilure =============== */}
        <section id="bateau" className="o-scroll-mt-24 o-px-6 o-py-24 md:o-px-10 md:o-py-32">
          <div className="o-mx-auto o-grid o-max-w-6xl o-gap-12 md:o-grid-cols-12 md:o-gap-16">
            <div className="md:o-col-span-5">
              <Reveal>
                <Indice rang="01">Le bateau</Indice>
              </Reveal>
              <Reveal delay={80}>
                <h2 className="o-m-0 o-mt-6 o-text-zinc-50" style={{ ...affiche('m', 300), fontSize: 'clamp(1.85rem, 4vw, 3.25rem)', lineHeight: 0.98 }}>
                  Douze metres, quatre voiles, deux equipiers.
                </h2>
              </Reveal>
              <p className="o-m-0 o-mt-6 o-max-w-md o-text-base o-leading-relaxed o-text-zinc-300">
                Un Class40 de serie, mis a l eau en 2021, gagne d occasion et refait a la main pendant deux hivers. Rien dessus n est exotique : c est le contraire d un prototype, et c est pour cela qu il arrive.
              </p>
              <dl className="o-m-0 o-mt-10">
                {[
                  ['Longueur', '12,18 m'],
                  ['Bau maximal', '4,50 m'],
                  ['Tirant d eau', '3,00 m — quille droite'],
                  ['Voile au portant', '155 m2 de spi'],
                  ['Deplacement', '4 650 kg lege'],
                ].map(([quoi, valeur]) => (
                  <div key={quoi} className="o-flex o-items-baseline o-justify-between o-gap-4 o-border-t o-border-white-10 o-py-3">
                    <dt className="o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">{quoi}</dt>
                    <dd className="o-m-0 o-font-mono o-text-sm o-text-zinc-100">{valeur}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="md:o-col-span-7">
              <div className="o-relative o-overflow-hidden o-rounded-2xl o-p-8" style={{ backgroundColor: 'var(--o-palette-slate-900)' }}>
                <svg viewBox="0 0 600 520" className="o-h-auto o-w-full" role="img" aria-label="Plan de voilure du Class40 : grand-voile, solent, spinnaker, quille droite">
                  {/* La ligne de flottaison. */}
                  <path d="M40 430H560" stroke="color-mix(in oklab, white 22%, transparent)" strokeWidth="1" strokeDasharray="4 8" />
                  {/* La coque. */}
                  <path d="M64 430 C 110 398, 210 386, 330 388 C 430 390, 512 402, 540 430 Z" fill="color-mix(in oklab, white 14%, transparent)" stroke={accent(400)} strokeWidth="2" />
                  {/* La quille et le safran. */}
                  <path d="M300 430 L300 498 L338 498 L318 430 Z" fill="color-mix(in oklab, white 14%, transparent)" stroke={accent(400)} strokeWidth="2" />
                  <path d="M498 430 L492 476 L512 470 L512 430 Z" fill="none" stroke={accent(400)} strokeWidth="2" />
                  {/* Le mat, la bome, la grand-voile. */}
                  <path d="M262 388 L262 40" stroke="var(--o-palette-slate-50)" strokeWidth="3" />
                  <path d="M262 368 L118 372" stroke="var(--o-palette-slate-50)" strokeWidth="3" />
                  <path d="M258 48 L258 366 L124 370 Z" fill={accentDoux(200, 26)} stroke={accentDoux(100, 70)} strokeWidth="2" />
                  {/* Le solent. */}
                  <path d="M266 76 L266 384 L470 404 Z" fill={accentDoux(300, 20)} stroke={accentDoux(200, 60)} strokeWidth="2" />
                  {/* Les reperes numerotes. */}
                  {[
                    { x: 190, y: 210, n: '1', quoi: 'Grand-voile — 88 m2' },
                    { x: 360, y: 280, n: '2', quoi: 'Solent — 62 m2' },
                    { x: 262, y: 46, n: '3', quoi: 'Tete de mat — 18,9 m' },
                    { x: 318, y: 470, n: '4', quoi: 'Quille droite — 3,00 m' },
                  ].map((repere) => (
                    <g key={repere.n}>
                      <circle cx={repere.x} cy={repere.y} r="14" fill={accent(500)} />
                      <text x={repere.x} y={repere.y + 6} fontSize="17" textAnchor="middle" fill="currentColor" style={{ fontFamily: 'var(--o-font-mono)', color: 'var(--o-palette-slate-950)' }}>
                        {repere.n}
                      </text>
                    </g>
                  ))}
                </svg>
                <ol className="o-m-0 o-mt-8 o-grid o-list-none o-gap-3 o-p-0 sm:o-grid-cols-2">
                  {[
                    ['1', 'Grand-voile — 88 m2, trois ris'],
                    ['2', 'Solent — 62 m2, sur enrouleur'],
                    ['3', 'Tete de mat a 18,9 m'],
                    ['4', 'Quille droite, 3,00 m, 1 700 kg'],
                  ].map(([n, quoi]) => (
                    <li key={n} className="o-flex o-items-baseline o-gap-3 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
                      <span style={{ color: encreSurSombre() }}>{n}</span>
                      {quoi}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* ================= La route : le mecanisme ====================== */}
        <section id="route" className="o-scroll-mt-24 o-border-t o-border-white-10 o-px-6 o-py-24 md:o-px-10 md:o-py-32">
          <div className="o-mx-auto o-max-w-6xl">
            <Reveal>
              <Indice rang="02">La route</Indice>
            </Reveal>
            <Reveal delay={80}>
              <h2 className="o-m-0 o-mt-6 o-max-w-3xl o-text-zinc-50" style={{ ...affiche('m', 300), fontSize: 'clamp(1.85rem, 4.2vw, 3.5rem)', lineHeight: 0.96 }}>
                Dix-huit jours
                <br />
                <RotatingWords
                  words={['au grand largue', 'au portant', 'au pres serre', 'dans la molle']}
                  interval={2400}
                  duration={520}
                  style={{ color: encreSurSombre() }}
                />
              </h2>
            </Reveal>
            <p className="o-m-0 o-mt-6 o-max-w-xl o-text-base o-leading-relaxed o-text-zinc-300">
              Le trace avance d un jour toutes les huit cent cinquante millisecondes. Ce qui change, c est la distance qu il couvre : celle du carnet. Regardez-le s arreter au treizieme jour.
            </p>
            <div className="o-mt-14">
              <Carte />
            </div>
          </div>
        </section>

        {/* ================= Les inscriptions (A19) ====================== */}
        <section id="inscriptions" className="o-scroll-mt-24 o-px-6 o-pb-28 md:o-px-10">
          <div className="o-mx-auto o-max-w-6xl">
            <Compte />
          </div>
        </section>

        {/* ================= Le pied : la mappemonde a points (P24) ====== */}
        <footer className="o-border-t o-border-white-10 o-px-6 o-py-16 md:o-px-10">
          <div className="o-mx-auto o-max-w-6xl">
            <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
              La saison — six ports, deux hemispheres
            </p>
            <div className="o-mt-8 o-overflow-x-auto" style={{ overflowY: 'hidden' }}>
              <svg viewBox="0 0 1000 500" className="o-h-auto" style={{ minWidth: 720, width: '100%' }} role="img" aria-label="Mappemonde : Les Sables d Olonne, Horta, Pointe-a-Pitre, Salvador, Le Cap et Auckland">
                <defs>
                  <pattern id="o-vo-points" width="11" height="11" patternUnits="userSpaceOnUse">
                    <circle cx="5.5" cy="5.5" r="2" fill="color-mix(in oklab, white 26%, transparent)" />
                  </pattern>
                  <clipPath id="o-vo-terres">
                    {TERRES.map((terre) => (
                      <path key={terre.slice(0, 18)} d={terre} />
                    ))}
                  </clipPath>
                </defs>
                <rect width="1000" height="500" fill="url(#o-vo-points)" clipPath="url(#o-vo-terres)" />
                {PORTS.map((port, rang) => {
                  // Passe le milieu de la carte, l etiquette se range a gauche
                  // du point : a droite, elle sortait du cadre.
                  const aGauche = port.x > 640
                  const bord = aGauche ? port.x - 20 : port.x + 20
                  return (
                    <g key={port.nom}>
                      {/* Le halo, qui bat comme un feu de port. */}
                      <circle data-o-vo-feu="" cx={port.x} cy={port.y} r="15" fill="none" stroke={accent(400)} strokeWidth="1.5" style={{ '--o-vo-delai': `${String(rang * 0.4)}s` } as CSSProperties} />
                      <circle cx={port.x} cy={port.y} r="5" fill={accent(400)} />
                      <text x={bord} y={port.y + 1} fontSize="15" textAnchor={aGauche ? 'end' : 'start'} fill="currentColor" style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.1em', color: 'var(--o-palette-slate-50)' }}>
                        {port.nom}
                      </text>
                      <text x={bord} y={port.y + 19} fontSize="12" textAnchor={aGauche ? 'end' : 'start'} fill="currentColor" style={{ fontFamily: 'var(--o-font-mono)', letterSpacing: '0.08em', color: 'var(--o-palette-slate-400)' }}>
                        {port.quand}
                      </text>
                    </g>
                  )
                })}
              </svg>
            </div>
            <p className="o-m-0 o-mt-10 o-border-t o-border-white-10 o-pt-6 o-font-mono o-text-xs o-uppercase o-tracking-widest o-text-zinc-400">
              Grand Largue — association loi 1901 — Port-Olona, Les Sables d Olonne — © 2026. Les milles publies sont ceux du loch, non corriges du courant.
            </p>
          </div>
        </footer>
      </div>
    </Porte>
  )
}
