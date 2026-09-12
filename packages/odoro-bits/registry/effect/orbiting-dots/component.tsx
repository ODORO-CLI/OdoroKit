/**
 * Points en orbite : des satellites tournent autour du contenu.
 *
 * ## Un pivot par point, et le compositeur pour seul horloger
 *
 * Chaque point est pose au bout d'un bras invisible — un element centre sur
 * le contenu, que la rotation CSS fait tourner. Le point lui-meme ne bouge
 * pas dans son repere : c'est le bras qui tourne, et le compositeur tient
 * autant de rotations qu'il y a de points sans qu'aucun JavaScript ne
 * s'execute.
 *
 * La phase de depart de chaque bras est portee par un delai negatif : les
 * points sont repartis sur le cercle des le premier rendu, au lieu de
 * partir tous du meme meridien.
 *
 * ## Deux anneaux plutot qu'un
 *
 * Les points pairs et impairs ne tournent ni a la meme vitesse ni dans le
 * meme sens. Un seul anneau qui tourne se lit comme un chargeur ; deux
 * anneaux croises se lisent comme une aura — c'est cette difference qui
 * fait l'ornement.
 *
 * Sous mouvement reduit, les points restent en place sur leur cercle : la
 * composition demeure, seul le mouvement s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement, type ReactNode } from 'react'

/** Proprietes propres au composant. */
export interface OrbitingDotsOwnProps {
  /** Contenu autour duquel les points tournent. */
  children: ReactNode
  /** Nombre de points. @defaultValue 6 */
  count?: number
  /** Rayon de l'orbite, en pixels. @defaultValue 48 */
  radius?: number
  /** Duree d'une revolution, en millisecondes. @defaultValue 6000 */
  speed?: number
  /** Couleur des points. @defaultValue la couleur du texte */
  color?: string
}

/** Toutes les proprietes. */
export type OrbitingDotsProps = Customisable<OrbitingDotsOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-orbiting-dots'

/** Pose la rotation, une fois par document. */
function ensureOrbitRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-orbits]{position:relative;display:inline-flex;align-items:center;justify-content:center}',
    // Le bras : un point de pivot au centre du contenu. Sa taille est nulle,
    // seul son repere compte.
    '[data-o-orbit-arm]{',
    'position:absolute;left:50%;top:50%;width:0;height:0;',
    'animation:o-orbit-spin var(--o-orbit-speed) linear infinite;',
    'animation-delay:var(--o-orbit-phase);',
    'animation-direction:var(--o-orbit-direction);',
    '}',
    '[data-o-orbit-dot]{',
    'position:absolute;left:var(--o-orbit-radius);top:0;',
    'width:var(--o-orbit-size);height:var(--o-orbit-size);',
    'margin:calc(var(--o-orbit-size) / -2);',
    'border-radius:50%;background:var(--o-orbit-color);',
    '}',
    '@keyframes o-orbit-spin{from{transform:rotate(0turn)}to{transform:rotate(1turn)}}',
    '@media (prefers-reduced-motion:reduce){[data-o-orbit-arm]{animation-play-state:paused}}',
  ].join('')
  document.head.append(style)
}

/**
 * Met des points en orbite autour d'un badge, d'un avatar, d'une icone.
 *
 * @example
 * <OrbitingDots radius={40}>
 *   <img src={avatar} alt="Portrait" className="o-rounded-full" />
 * </OrbitingDots>
 *
 * @example
 * // Une aura dense et lente.
 * <OrbitingDots count={10} radius={64} speed={12000}>
 *   <span className="o-text-2xl">Nouveau</span>
 * </OrbitingDots>
 */
export function OrbitingDots({
  children,
  count = 6,
  radius = 48,
  speed = 6000,
  color = 'currentColor',
  ...rest
}: OrbitingDotsProps): ReactElement {
  ensureOrbitRule()

  const { className, style } = mergePresentation({}, rest)

  const hostStyle = {
    ...style,
    '--o-orbit-color': color,
    '--o-orbit-size': '6px',
  } as CSSProperties

  return (
    <div {...rest} className={className} style={hostStyle} data-o-orbits="">
      {children}
      {Array.from({ length: count }, (_, index) => {
        // Anneaux alternes : les impairs tournent a rebours, plus vite et
        // plus pres. Voir l'en-tete du module.
        const inverse = index % 2 === 1
        const duration = inverse ? speed * 0.7 : speed
        return (
          <span
            key={index}
            aria-hidden
            data-o-orbit-arm=""
            style={
              {
                '--o-orbit-radius': `${String(Math.round(inverse ? radius * 0.72 : radius))}px`,
                '--o-orbit-speed': `${String(Math.round(duration))}ms`,
                // Delai negatif : chaque bras demarre a sa place sur le
                // cercle, pas sur le meridien commun.
                '--o-orbit-phase': `${String(Math.round((-index / count) * duration))}ms`,
                '--o-orbit-direction': inverse ? 'reverse' : 'normal',
              } as CSSProperties
            }
          >
            <span data-o-orbit-dot="" />
          </span>
        )
      })}
    </div>
  )
}
