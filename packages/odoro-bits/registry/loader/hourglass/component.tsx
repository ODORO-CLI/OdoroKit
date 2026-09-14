/**
 * Sablier : le sable coule du haut vers le bas, puis le sablier se
 * retourne et tout recommence.
 *
 * ## Le sable coule a vitesse constante, le retournement non
 *
 * C'est la propriete qui fait du sablier un instrument de mesure : le
 * debit par le col ne depend pas de la hauteur de sable au-dessus. La
 * descente du niveau est donc lineaire, et le tas du bas monte au meme
 * rythme. Le retournement, lui, est un geste de main : il part doucement,
 * accelere, et se pose — `ease-in-out`, sur un demi-tour.
 *
 * Le sable est decoupe par la forme interieure de chaque ampoule : c'est un
 * `clipPath`, et les deux formes de sable ne font que glisser derriere lui.
 * Le tas du bas a une pointe, comme du sable qui tombe d'un point ; le
 * sable du haut a un creux au milieu, comme du sable qui s'ecoule par un
 * trou. Ce sont la meme forme, tournee d'un demi-tour — ce qui fait que la
 * fin du cycle, le sablier retourne avec son tas en haut, est exactement
 * l'image de depart. La boucle se referme sans saut.
 *
 * Quatre animations sur des elements SVG, tenues par le compositeur, aucun
 * JavaScript apres le premier rendu.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Le sablier est retire
 * de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, le sable est entierement en bas : c'est l'etat ou
 * un sablier finit, et la figure se reconnait encore.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { useId, type CSSProperties, type ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-hourglass'

/** Contour du verre, les deux ampoules et le col. */
const GLASS =
  'M 28 10 L 72 10 L 72 22 Q 72 40 53 49 L 53 51 Q 72 60 72 78 L 72 90 L 28 90 L 28 78 Q 28 60 47 51 L 47 49 Q 28 40 28 22 Z'

/** Interieur de l'ampoule du haut : la ou le sable peut se voir. */
const TOP_BULB = 'M 30 12 L 70 12 L 70 22 Q 70 39 52 48.5 L 48 48.5 Q 30 39 30 22 Z'

/** Interieur de l'ampoule du bas. */
const BOTTOM_BULB =
  'M 48 51.5 L 52 51.5 Q 70 61 70 78 L 70 88 L 30 88 L 30 78 Q 30 61 48 51.5 Z'

/** Le tas du bas, en pointe. */
const MOUND = 'M 30 90 L 30 76 Q 42 70 50 60 Q 58 70 70 76 L 70 90 Z'

/** Le sable du haut : le meme tas, tourne d'un demi-tour, donc creuse. */
const HOLLOW = 'M 70 10 L 70 24 Q 58 30 50 40 Q 42 30 30 24 L 30 10 Z'

/**
 * Course du sable, en unites de la vue.
 *
 * Assez pour que le sable du haut sorte entierement de son ampoule, et que
 * le tas du bas parte entierement sous la sienne.
 */
const TRAVEL = 40

/** Pose le sablier, le sable et le retournement, une fois par document. */
function ensureHourglassRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-hourglass]{display:inline-block;line-height:0}',
    '[data-o-hourglass] svg{display:block}',
    '[data-o-hourglass-body],[data-o-hourglass-sand],[data-o-hourglass-stream]{',
    'transform-box:view-box;transform-origin:50px 50px;',
    'animation-duration:var(--o-hourglass-speed);animation-iteration-count:infinite;',
    '}',
    '[data-o-hourglass-body]{animation-name:o-hourglass-flip}',
    // Au repos, le sable est en bas : le haut a glisse hors de son ampoule,
    // le tas est monte dans la sienne.
    `[data-o-hourglass-sand="top"]{transform:translateY(${String(TRAVEL)}px);animation-name:o-hourglass-drain}`,
    '[data-o-hourglass-sand="bottom"]{transform:translateY(0);animation-name:o-hourglass-fill}',
    '[data-o-hourglass-stream]{opacity:0;animation-name:o-hourglass-stream}',
    // Un debit constant : le niveau descend en lineaire jusqu'a vide, puis
    // attend le retournement.
    '@keyframes o-hourglass-drain{',
    '0%{transform:translateY(0);animation-timing-function:linear}',
    `72%,100%{transform:translateY(${String(TRAVEL)}px)}`,
    '}',
    '@keyframes o-hourglass-fill{',
    `0%{transform:translateY(${String(TRAVEL)}px);animation-timing-function:linear}`,
    '72%,100%{transform:translateY(0)}',
    '}',
    // Le filet de sable est un trait en pointille dont le motif descend :
    // ce sont les grains qui tombent. Il s'eteint quand le haut est vide.
    '@keyframes o-hourglass-stream{',
    '0%{stroke-dashoffset:0;opacity:1;animation-timing-function:linear}',
    '70%{stroke-dashoffset:-72px;opacity:1}',
    '74%,100%{stroke-dashoffset:-72px;opacity:0}',
    '}',
    // Un geste de main : un demi-tour qui part doucement et se pose. Le
    // sablier retourne, tas en haut, est l'image de depart.
    '@keyframes o-hourglass-flip{',
    '0%,78%{transform:rotate(0deg);animation-timing-function:ease-in-out}',
    '96%,100%{transform:rotate(180deg)}',
    '}',
    // Tout le sable en bas, sablier droit : la figure est dite, ecoulee.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-hourglass-body],[data-o-hourglass-sand],[data-o-hourglass-stream]{animation:none}',
    '[data-o-hourglass-body]{transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface HourglassOwnProps {
  /** Hauteur du sablier, en pixels. @defaultValue 48 */
  size?: number
  /** Duree d'un cycle, ecoulement et retournement compris, en millisecondes. @defaultValue 3000 */
  speed?: number
  /** Couleur du verre et du sable. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type HourglassProps = Customisable<HourglassOwnProps, 'span'>

/**
 * Signale une attente par un sablier qui s'ecoule et se retourne.
 *
 * @example
 * <Hourglass />
 *
 * @example
 * // Plus grand, plus lent, dans la teinte de marque.
 * <Hourglass size={80} speed={5000} color="var(--o-palette-brand-500)" />
 */
export function Hourglass({
  size = 48,
  speed = 3000,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: HourglassProps): ReactElement {
  ensureHourglassRule()

  // Les decoupes sont referencees par identifiant dans le document : deux
  // sabliers sur la meme page ne doivent pas se partager le meme.
  const id = useId().replace(/[^a-zA-Z0-9_-]/g, '')
  const topClip = `o-hourglass-top-${id}`
  const bottomClip = `o-hourglass-bottom-${id}`

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-hourglass-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-hourglass=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <defs>
          <clipPath id={topClip}>
            <path d={TOP_BULB} />
          </clipPath>
          <clipPath id={bottomClip}>
            <path d={BOTTOM_BULB} />
          </clipPath>
        </defs>
        <g data-o-hourglass-body="">
          <rect x={22} y={4} width={56} height={6} rx={2} fill="currentColor" />
          <rect x={22} y={90} width={56} height={6} rx={2} fill="currentColor" />
          <g clipPath={`url(#${topClip})`}>
            <path
              data-o-hourglass-sand="top"
              d={HOLLOW}
              fill="currentColor"
              fillOpacity={0.8}
            />
          </g>
          <g clipPath={`url(#${bottomClip})`}>
            <path
              data-o-hourglass-sand="bottom"
              d={MOUND}
              fill="currentColor"
              fillOpacity={0.8}
            />
          </g>
          <line
            data-o-hourglass-stream=""
            x1={50}
            y1={49}
            x2={50}
            y2={86}
            stroke="currentColor"
            strokeWidth={2}
            strokeDasharray="1.5 2.5"
            strokeOpacity={0.8}
          />
          <path
            d={GLASS}
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
        </g>
      </svg>
    </span>
  )
}
