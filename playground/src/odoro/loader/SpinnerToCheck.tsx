/**
 * Anneau qui conclut : un arc tourne pendant l'attente, se referme en
 * cercle plein a la reponse, et la marque du resultat se trace dedans.
 *
 * ## L'anneau ne saute pas a zero, il s'arrete la ou il est
 *
 * Le probleme d'un chargeur a etats, c'est le raccord. L'arc tourne depuis
 * plusieurs secondes ; au moment de la reponse il se trouve a un angle
 * quelconque, et remplacer sa rotation par une autre animation le ferait
 * revenir d'un coup a son point de depart — une secousse qui trahit la
 * mecanique.
 *
 * La rotation n'est donc jamais remplacee : elle est **mise en pause**. Les
 * deux animations vivent cote a cote dans la meme liste, et
 * `animation-play-state` s'applique a chacune separement — la rotation
 * gele a l'angle qu'elle avait, la fermeture demarre. L'anneau s'immobilise
 * ou il en etait, puis se comble.
 *
 * La fermeture n'est pas un fondu : c'est le tiret lui-meme qui s'allonge,
 * de son quart de tour au tour complet. Le cercle declare une longueur de
 * cent, donc « un quart » s'ecrit vingt-six, et « tout » cent. L'attente et
 * le resultat sont le meme trait, a deux longueurs.
 *
 * La marque ne se trace qu'ensuite, une fois l'anneau ferme : d'abord le
 * contenant, puis le contenu. C'est ce qui distingue ce chargeur d'une
 * coche qui se dessine seule — ici la figure constante est l'anneau, et la
 * coche n'est que sa conclusion.
 *
 * ## Un statut qui parle
 *
 * L'element porte `role="status"` : le libelle hors ecran change avec
 * l'etat, et le changement est annonce sans voler le focus. Une forme et
 * une couleur ne se lisent pas a voix haute ; le libelle, si. Le dessin est
 * retire de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, l'arc est pose immobile pendant l'attente, et
 * l'anneau ferme avec sa marque tracee a la reponse : l'etat final de
 * chaque etat.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-spinner-to-check'

/** La coche, inscrite dans l'anneau. */
const CHECK = 'M 32 51 L 45 64 L 69 38'

/** La croix, deux traits d'un seul chemin : le trace les enchaine. */
const CROSS = 'M 37 37 L 63 63 M 63 37 L 37 63'

/** Part du tour couverte par l'arc pendant l'attente, en pour cent. */
const ARC = 26

/** Etats possibles du composant. */
export type SpinnerToCheckState = 'chargement' | 'succes' | 'echec'

/** Pose l'anneau, sa fermeture et la marque, une fois par document. */
function ensureSpinnerToCheckRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-stc]{display:inline-block;line-height:0}',
    '[data-o-stc] svg{display:block}',
    '[data-o-stc-ring]{',
    'transform-box:view-box;transform-origin:50px 50px;',
    `stroke-dasharray:${String(ARC)} ${String(100 - ARC)};`,
    '}',
    '[data-o-stc-mark]{stroke-dasharray:100 100;stroke-dashoffset:100}',
    '[data-o-stc="chargement"] [data-o-stc-ring]{',
    'animation:o-stc-spin var(--o-stc-speed) linear infinite;',
    '}',
    // La rotation reste en premiere position de la liste : elle n'est donc
    // pas relancee, seulement mise en pause a l'angle courant, pendant que
    // la fermeture demarre a cote d'elle.
    '[data-o-stc="succes"] [data-o-stc-ring],',
    '[data-o-stc="echec"] [data-o-stc-ring]{',
    'animation:o-stc-spin var(--o-stc-speed) linear infinite,',
    'o-stc-close calc(var(--o-stc-speed) * 0.45) cubic-bezier(0.4,0,0.2,1) forwards;',
    'animation-play-state:paused,running;',
    '}',
    // La marque attend que l'anneau soit ferme : d'abord le contenant.
    '[data-o-stc="succes"] [data-o-stc-mark],',
    '[data-o-stc="echec"] [data-o-stc-mark]{',
    'animation:o-stc-draw calc(var(--o-stc-speed) * 0.4) cubic-bezier(0.65,0,0.35,1)',
    'calc(var(--o-stc-speed) * 0.42) forwards;',
    '}',
    '@keyframes o-stc-spin{to{transform:rotate(360deg)}}',
    `@keyframes o-stc-close{from{stroke-dasharray:${String(ARC)} ${String(100 - ARC)}}to{stroke-dasharray:100 0}}`,
    '@keyframes o-stc-draw{to{stroke-dashoffset:0}}',
    // Arc pose pendant l'attente, anneau ferme et marque tracee ensuite.
    //
    // Les selecteurs y sont aussi precis que ceux des etats : une requete de
    // media n'ajoute aucune specificite, et une regle plus courte perdrait
    // contre `[data-o-stc="chargement"] [data-o-stc-ring]` — l'anneau
    // continuerait de tourner sous mouvement reduit.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-stc] [data-o-stc-ring]{animation:none;transform:none}',
    '[data-o-stc] [data-o-stc-mark]{animation:none}',
    '[data-o-stc="succes"] [data-o-stc-ring],',
    '[data-o-stc="echec"] [data-o-stc-ring]{stroke-dasharray:100 0}',
    '[data-o-stc="succes"] [data-o-stc-mark],',
    '[data-o-stc="echec"] [data-o-stc-mark]{stroke-dashoffset:0}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface SpinnerToCheckOwnProps {
  /** Cote du dessin, en pixels. @defaultValue 56 */
  size?: number
  /** Epaisseur de l'anneau et de la marque, en pixels. @defaultValue 6 */
  thickness?: number
  /** Duree d'un tour de l'arc, en millisecondes. @defaultValue 1000 */
  speed?: number
  /** Etat de l'operation. @defaultValue 'chargement' */
  state?: SpinnerToCheckState
  /** Couleur de l'anneau et de la marque. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce pendant l'attente. @defaultValue 'Chargement' */
  label?: string
  /** Libelle annonce au succes. @defaultValue 'Termine' */
  labelSucces?: string
  /** Libelle annonce a l'echec. @defaultValue 'Echec' */
  labelEchec?: string
}

/** Toutes les proprietes. */
export type SpinnerToCheckProps = Customisable<SpinnerToCheckOwnProps, 'span'>

/**
 * Signale une attente puis son issue par un anneau qui se referme.
 *
 * @example
 * <SpinnerToCheck state={enCours ? 'chargement' : 'succes'} />
 *
 * @example
 * // Un refus, plus grand, dans une teinte d'alerte.
 * <SpinnerToCheck state="echec" size={80} color="var(--o-palette-red-500)" />
 */
export function SpinnerToCheck({
  size = 56,
  thickness = 6,
  speed = 1000,
  state = 'chargement',
  color = 'currentColor',
  label = 'Chargement',
  labelSucces = 'Termine',
  labelEchec = 'Echec',
  ...rest
}: SpinnerToCheckProps): ReactElement {
  ensureSpinnerToCheckRule()

  const { className, style } = mergePresentation({}, rest)

  // Le dessin vit dans une vue de 100 unites : l'epaisseur demandee en
  // pixels est convertie pour que le trait garde sa mesure a toute taille.
  const stroke = Math.min((thickness / size) * 100, 16)

  // Le rayon laisse la place au trait : sans cette marge, l'anneau serait
  // rogne par le bord de la vue aux fortes epaisseurs.
  const radius = 50 - stroke / 2 - 2

  const mark = state === 'echec' ? CROSS : CHECK

  const spoken =
    state === 'succes' ? labelSucces : state === 'echec' ? labelEchec : label

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-stc-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-stc={state}
      role="status"
    >
      <span className="o-sr-only">{spoken}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        {/* La piste sous l'arc : sans elle, un quart de tour isole ne se
            lit pas comme un anneau. */}
        <circle
          cx={50}
          cy={50}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeOpacity={0.18}
        />
        <circle
          data-o-stc-ring=""
          cx={50}
          cy={50}
          r={radius}
          pathLength={100}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke}
          strokeLinecap="round"
        />
        <path
          data-o-stc-mark=""
          // La cle force React a remonter un chemin neuf quand la figure
          // change : le trace repart du debut au lieu de continuer sur
          // l'ancienne, ce qui montrerait une croix a demi dessinee.
          key={state === 'echec' ? 'croix' : 'coche'}
          d={mark}
          pathLength={100}
          fill="none"
          stroke="currentColor"
          strokeWidth={stroke * 0.9}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}
