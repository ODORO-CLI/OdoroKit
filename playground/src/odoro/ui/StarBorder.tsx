/**
 * Bordure a etoile filante : deux points de lumiere parcourent le contour,
 * l'un sur le bord haut vers la droite, l'autre sur le bord bas vers la
 * gauche, avec une trainee qui s'eteint derriere eux.
 *
 * ## Ce n'est ni le trait de bordure, ni le neon
 *
 * Le trait de bordure fait tourner un degrade conique autour du centre : un
 * arc qui fait le tour. Le neon corrige ce tour pour qu'il avance a vitesse
 * constante le long du bord. Ici il n'y a pas de tour : deux etoiles, en
 * ligne droite, chacune sur son bord et dans son sens, qui naissent a un
 * coin et meurent a l'autre. C'est l'image d'une etoile filante — une
 * trajectoire, pas une orbite.
 *
 * ## L'etoile est un degrade trois fois plus large que le cadre
 *
 * Un disque radial sur un calque de trois largeurs, gare hors champ, que
 * l'animation fait traverser. Le contenu, pose par-dessus avec son propre
 * fond, ne laisse voir le calque que dans le filet d'un pixel qui l'entoure :
 * l'etoile et sa trainee n'existent que la. Un `overflow:hidden` sur le
 * cadre retient ce qui deborde. Rien n'est mesure, rien n'est calcule.
 *
 * ## Le contenu porte le fond, pas le cadre
 *
 * Si le cadre avait un fond, il couvrirait les etoiles. C'est donc le
 * contenu qui est opaque, en surface de theme, avec un filet fin : ce que
 * l'on encadre ressemble a une carte, et c'est ce que l'on attend d'une
 * bordure.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement, type ReactNode } from 'react'

/** Proprietes propres au composant. */
export interface StarBorderOwnProps {
  /** Contenu encadre. */
  children: ReactNode
  /** Token de la couleur des etoiles. @defaultValue '--o-palette-brand-400' */
  color?: string
  /** Duree d'un passage d'une etoile, en millisecondes. @defaultValue 6000 */
  speed?: number
  /** Epaisseur du filet dans lequel l'etoile brille, en pixels. @defaultValue 1 */
  thickness?: number
  /** Intensite de la trainee, de zero a un. @defaultValue 0.7 */
  glow?: number
}

/** Toutes les proprietes. */
export type StarBorderProps = Customisable<StarBorderOwnProps>

/** Token employe par defaut. */
const DEFAULT_TOKEN = '--o-palette-brand-400'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-star-border'

/** Pose le cadre, les deux etoiles et le contenu, une fois par document. */
function ensureStarRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-star]{',
    'position:relative;display:inline-block;overflow:hidden;isolation:isolate;',
    'padding:var(--o-star-thickness);border-radius:999px;',
    '}',
    // Le calque d'une etoile : trois largeurs, une demi-hauteur, un disque.
    '[data-o-star-streak]{',
    'position:absolute;z-index:0;width:300%;height:50%;pointer-events:none;',
    'opacity:var(--o-star-glow);',
    'background:radial-gradient(circle,var(--o-star-color),transparent 12%);',
    'animation-duration:var(--o-star-speed);animation-timing-function:linear;',
    'animation-iteration-count:infinite;',
    '}',
    '[data-o-star-streak="top"]{top:-11px;left:-250%;animation-name:o-star-top}',
    '[data-o-star-streak="bottom"]{bottom:-11px;right:-250%;animation-name:o-star-bottom}',
    // Chaque etoile nait pleine a un coin et s'eteint a l'autre.
    '@keyframes o-star-top{from{transform:translateX(0);opacity:var(--o-star-glow)}to{transform:translateX(100%);opacity:0}}',
    '@keyframes o-star-bottom{from{transform:translateX(0);opacity:var(--o-star-glow)}to{transform:translateX(-100%);opacity:0}}',
    // Le contenu : opaque, par-dessus, avec le rayon du cadre.
    '[data-o-star-content]{',
    'position:relative;z-index:1;border-radius:inherit;',
    'background:var(--o-theme-surface);border:1px solid var(--o-theme-line);',
    '}',
    // Mouvement reduit : chaque etoile posee au milieu de son bord.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-star-streak]{animation:none}',
    '[data-o-star-streak="top"]{transform:translateX(50%)}',
    '[data-o-star-streak="bottom"]{transform:translateX(-50%)}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Encadre un contenu de deux etoiles filantes.
 *
 * @example
 * <StarBorder className="o-rounded-full">
 *   <button type="button" className="o-px-6 o-py-3">Commencer</button>
 * </StarBorder>
 *
 * @example
 * // Une carte, etoiles ciel, plus lentes et plus discretes.
 * <StarBorder color="--o-palette-sky-400" speed={9000} glow={0.5} className="o-rounded-xl">
 *   <div className="o-p-6">Une offre mise en avant</div>
 * </StarBorder>
 */
export function StarBorder({
  children,
  color = DEFAULT_TOKEN,
  speed = 6000,
  thickness = 1,
  glow = 0.7,
  ...rest
}: StarBorderProps): ReactElement {
  ensureStarRules()

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      data-o-star=""
      className={className}
      style={
        {
          '--o-star-color': `var(${color})`,
          '--o-star-speed': `${String(speed)}ms`,
          '--o-star-thickness': `${String(thickness)}px`,
          '--o-star-glow': String(glow),
          ...style,
        } as CSSProperties
      }
    >
      <span aria-hidden="true" data-o-star-streak="top" />
      <span aria-hidden="true" data-o-star-streak="bottom" />
      <div data-o-star-content="">{children}</div>
    </div>
  )
}
