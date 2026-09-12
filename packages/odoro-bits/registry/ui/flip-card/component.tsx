/**
 * Carte a retournement : deux faces, une bascule au clic ou au clavier.
 *
 * ## Un bouton qui a l'air d'une carte
 *
 * La bascule est un etat que l'utilisateur controle, donc l'element est un
 * bouton pour l'arbre d'accessibilite : `role="button"`, focusable, active a
 * l'Entree et a l'Espace, et `aria-pressed` dit quelle face est montree.
 * Sans cela, la carte serait un piege : cliquable a la souris, invisible au
 * clavier et muette au lecteur d'ecran.
 *
 * La face cachee est aussi retiree de l'arbre : un lecteur d'ecran n'a pas
 * a lire le dos d'une carte qui montre sa face.
 *
 * ## La rotation est une transition, pas une animation
 *
 * L'etat vise — a l'endroit ou retourne — est un angle, et la transition
 * fait le chemin. Interrompre la bascule au milieu repart donc de l'angle
 * courant, sans saut : c'est exactement ce que les transitions savent faire
 * et que les animations ne savent pas.
 *
 * Sous mouvement reduit, la bascule devient un fondu croise : l'information
 * — l'autre face — arrive quand meme, seul le geste en trois dimensions est
 * omis.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Proprietes propres au composant. */
export interface FlipCardOwnProps {
  /** Face montree au repos. */
  front: ReactNode
  /** Face revelee par la bascule. */
  back: ReactNode
  /** Axe de la rotation. @defaultValue 'horizontal' */
  direction?: 'horizontal' | 'vertical'
  /** Duree de la bascule, en millisecondes. @defaultValue 600 */
  duration?: number
}

/** Toutes les proprietes. */
export type FlipCardProps = Customisable<FlipCardOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-flip-card'

/** Pose la scene en trois dimensions, une fois par document. */
function ensureFlipRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-flip]{position:relative;display:block;perspective:1000px;cursor:pointer}',
    '[data-o-flip-inner]{',
    'position:relative;width:100%;height:100%;',
    'transform-style:preserve-3d;',
    'transition:transform var(--o-flip-duration) cubic-bezier(0.4,0.2,0.2,1);',
    '}',
    '[data-o-flip][aria-pressed="true"] [data-o-flip-inner]{transform:var(--o-flip-turn)}',
    '[data-o-flip-face]{',
    'position:absolute;inset:0;',
    'backface-visibility:hidden;-webkit-backface-visibility:hidden;',
    '}',
    '[data-o-flip-face="back"]{transform:var(--o-flip-turn)}',
    // La face avant donne sa taille a la carte : elle seule est dans le flux.
    '[data-o-flip-face="front"]{position:relative}',
    // Mouvement reduit : plus de scene, un fondu croise entre les faces.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-flip-inner]{transform-style:flat;transition:none}',
    '[data-o-flip][aria-pressed="true"] [data-o-flip-inner]{transform:none}',
    '[data-o-flip-face]{backface-visibility:visible;-webkit-backface-visibility:visible;',
    'transform:none;transition:opacity 240ms linear}',
    '[data-o-flip][aria-pressed="true"] [data-o-flip-face="front"]{opacity:0}',
    '[data-o-flip]:not([aria-pressed="true"]) [data-o-flip-face="back"]{opacity:0}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Retourne une carte entre deux faces, au clic comme au clavier.
 *
 * Les deux faces recouvrent la meme surface : c'est la face avant qui donne
 * sa taille a la carte.
 *
 * @example
 * <FlipCard
 *   className="o-h-48 o-w-72"
 *   front={<div className="o-rounded-xl o-border-w-1 o-p-6">Recto</div>}
 *   back={<div className="o-rounded-xl o-border-w-1 o-p-6">Verso</div>}
 * />
 *
 * @example
 * // Bascule de haut en bas, plus lente.
 * <FlipCard direction="vertical" duration={900} front={recto} back={verso} />
 */
export function FlipCard({
  front,
  back,
  direction = 'horizontal',
  duration = 600,
  ...rest
}: FlipCardProps): ReactElement {
  const { reduced } = useMotionState()
  const [flipped, setFlipped] = useState(false)
  ensureFlipRule()

  const toggle = (): void => setFlipped((value) => !value)

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key !== 'Enter' && event.key !== ' ') return
    // L'Espace ferait defiler la page : c'est la carte qui prend le geste.
    event.preventDefault()
    toggle()
  }

  const { className, style } = mergePresentation({}, rest)

  const angle = direction === 'vertical' ? 'rotateX(180deg)' : 'rotateY(180deg)'

  const cardStyle = {
    ...style,
    '--o-flip-turn': angle,
    '--o-flip-duration': `${String(reduced ? 0 : duration)}ms`,
  } as CSSProperties

  return (
    <div
      {...rest}
      className={className}
      style={cardStyle}
      data-o-flip=""
      role="button"
      tabIndex={0}
      aria-pressed={flipped}
      onClick={toggle}
      onKeyDown={onKeyDown}
    >
      <div data-o-flip-inner="">
        <div data-o-flip-face="front" {...(flipped ? { 'aria-hidden': true } : {})}>
          {front}
        </div>
        <div data-o-flip-face="back" {...(flipped ? {} : { 'aria-hidden': true })}>
          {back}
        </div>
      </div>
    </div>
  )
}
