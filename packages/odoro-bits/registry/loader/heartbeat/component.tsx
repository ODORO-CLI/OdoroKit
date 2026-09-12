/**
 * Coeur qui bat : un coeur se gonfle deux fois de suite, se repose, et
 * laisse partir une onde a chaque battement.
 *
 * ## Un battement en fait deux
 *
 * Un coeur ne pulse pas comme une lampe. Chaque battement est un couple —
 * le « boum-boum » d'un stethoscope — : une contraction franche, une
 * seconde plus courte, puis un repos qui dure plus que les deux reunies.
 * Ce sont les proportions posees ici, image cle par image cle : deux
 * gonflements en `ease-out` — brusques au depart, amortis a l'arrivee,
 * comme une contraction — et deux retours en `ease-in`, puis plus rien
 * jusqu'a la fin du cycle. Une pulsation reguliere en `ease-in-out`
 * donnerait un ballon qui respire, pas un coeur.
 *
 * L'onde est un second coeur en trait, qui part de la taille du premier au
 * moment de la contraction et s'elargit en s'effacant. Elle sert a lire le
 * battement de loin, quand le gonflement lui-meme est trop petit pour etre
 * vu.
 *
 * Deux animations sur des elements SVG, tenues par le compositeur, aucun
 * JavaScript apres le premier rendu.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Le coeur est retire de
 * l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, le coeur est plein, a sa taille de repos, sans
 * onde : la figure se lit encore, seul le battement s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-heartbeat'

/** Le coeur, deux lobes et une pointe, centre sur la vue. */
const HEART =
  'M 50 86 C 22 64, 8 48, 8 32 C 8 19, 19 10, 30 10 C 39 10, 47 16, 50 25 C 53 16, 61 10, 70 10 C 81 10, 92 19, 92 32 C 92 48, 78 64, 50 86 Z'

/** Pose le coeur, son double battement et son onde, une fois par document. */
function ensureHeartRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-heartbeat]{display:inline-block;line-height:0}',
    '[data-o-heartbeat] svg{display:block;overflow:visible}',
    '[data-o-heart],[data-o-heart-wave]{',
    'transform-box:view-box;transform-origin:50px 50px;',
    'animation-duration:var(--o-heart-speed);animation-iteration-count:infinite;',
    '}',
    '[data-o-heart]{animation-name:o-heartbeat-beat}',
    '[data-o-heart-wave]{opacity:0;animation-name:o-heartbeat-wave}',
    // Deux contractions, la seconde plus courte, puis le repos.
    '@keyframes o-heartbeat-beat{',
    '0%{transform:scale(1);animation-timing-function:ease-out}',
    '10%{transform:scale(1.16);animation-timing-function:ease-in}',
    '22%{transform:scale(1);animation-timing-function:ease-out}',
    '32%{transform:scale(1.1);animation-timing-function:ease-in}',
    '46%,100%{transform:scale(1)}',
    '}',
    // L'onde part avec la premiere contraction et s'eteint en s'elargissant.
    '@keyframes o-heartbeat-wave{',
    '0%,4%{transform:scale(1);opacity:0;animation-timing-function:ease-out}',
    '10%{transform:scale(1.12);opacity:0.55;animation-timing-function:ease-out}',
    '62%,100%{transform:scale(1.7);opacity:0}',
    '}',
    // Un coeur plein a sa taille de repos : la figure est dite, sans battre.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-heart],[data-o-heart-wave]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface HeartbeatOwnProps {
  /** Largeur du coeur, en pixels. @defaultValue 40 */
  size?: number
  /** Duree d'un cycle, double battement et repos compris, en millisecondes. @defaultValue 1200 */
  speed?: number
  /** Couleur du coeur et de l'onde. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type HeartbeatProps = Customisable<HeartbeatOwnProps, 'span'>

/**
 * Signale une attente par un coeur qui bat.
 *
 * @example
 * <Heartbeat />
 *
 * @example
 * // Plus grand, plus calme, dans la teinte de marque.
 * <Heartbeat size={64} speed={1800} color="var(--o-palette-brand-500)" />
 */
export function Heartbeat({
  size = 40,
  speed = 1200,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: HeartbeatProps): ReactElement {
  ensureHeartRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-heart-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-heartbeat=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <path
          data-o-heart-wave=""
          d={HEART}
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinejoin="round"
        />
        <path data-o-heart="" d={HEART} fill="currentColor" />
      </svg>
    </span>
  )
}
