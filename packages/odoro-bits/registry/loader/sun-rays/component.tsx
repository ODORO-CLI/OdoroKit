/**
 * Soleil dont les rayons tournent : un disque fixe, douze rayons qui
 * s'allongent en alternance, et une rotation d'ensemble tres lente.
 *
 * ## Deux rythmes, pas un
 *
 * Un soleil dont tous les rayons pulsent ensemble clignote ; un soleil dont
 * les rayons pulsent en cascade tourne deja, et la rotation d'ensemble
 * n'ajoute rien. En les faisant respirer en alternance — un rayon sur deux
 * en avance d'une demi-periode — la couronne ne se lit ni comme un
 * clignotement ni comme une rotation : elle scintille. La rotation lente,
 * huit fois plus longue qu'une respiration, se pose alors dessus sans
 * entrer en concurrence.
 *
 * Les rayons alternent aussi de longueur au repos, longs et courts : c'est
 * ce qui distingue une couronne solaire d'une roue a rayons.
 *
 * ## Un rayon, une variable
 *
 * Chaque rayon est le meme segment, tourne a sa place. L'angle est une
 * variable CSS lue **dans** les etapes de l'animation : sans cela, la
 * rotation posee en attribut serait ecrasee par la transformation animee,
 * et les douze rayons se superposeraient sur un seul. Une animation, douze
 * elements, aucune duplication de regle.
 *
 * Le disque central ne bouge pas : c'est l'ancre visuelle. Un coeur qui
 * respirerait aussi brouillerait la lecture — rien ne resterait fixe.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Le dessin est retire
 * de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, les rayons restent a leur longueur de repos et la
 * couronne ne tourne plus : la figure se lit encore comme un soleil, seul
 * le mouvement s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-sun-rays'

/** Nombre de rayons. Douze : un cadran, et une alternance qui se referme. */
const RAYS = 12

/** Pose le soleil, ses rayons et sa rotation, une fois par document. */
function ensureSunRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-sun-rays]{display:inline-block;line-height:0}',
    '[data-o-sun-rays] svg{display:block}',
    '[data-o-sun-crown],[data-o-sun-ray]{',
    'transform-box:view-box;transform-origin:50px 50px;',
    '}',
    '[data-o-sun-crown]{',
    'animation:o-sun-rays-turn var(--o-sun-turn) linear infinite;',
    '}',
    '@keyframes o-sun-rays-turn{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}',
    '[data-o-sun-ray]{',
    'transform:rotate(var(--o-sun-angle));',
    'animation:o-sun-rays-reach var(--o-sun-speed) ease-in-out infinite;',
    'animation-delay:var(--o-sun-delay);',
    '}',
    // L'angle est repris dans chaque etape : une animation de transformation
    // remplace la valeur entiere, pas seulement la fonction qu'elle anime.
    '@keyframes o-sun-rays-reach{',
    '0%,100%{transform:rotate(var(--o-sun-angle)) translateY(0);opacity:0.55}',
    '50%{transform:rotate(var(--o-sun-angle)) translateY(-5px);opacity:1}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-sun-crown]{animation:none;transform:none}',
    '[data-o-sun-ray]{animation:none;transform:rotate(var(--o-sun-angle));opacity:0.8}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface SunRaysOwnProps {
  /** Cote de la zone de dessin, en pixels. @defaultValue 56 */
  size?: number
  /** Duree d'une respiration de rayon, en millisecondes. @defaultValue 1800 */
  speed?: number
  /** Couleur du soleil. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type SunRaysProps = Customisable<SunRaysOwnProps, 'span'>

/**
 * Signale une attente par un soleil dont la couronne scintille et tourne.
 *
 * @example
 * <SunRays />
 *
 * @example
 * // Plus grand, plus lent, dans la teinte de marque.
 * <SunRays size={88} speed={2600} color="var(--o-palette-brand-500)" />
 */
export function SunRays({
  size = 56,
  speed = 1800,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: SunRaysProps): ReactElement {
  ensureSunRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-sun-speed': `${String(speed)}ms`,
    // Le tour est huit fois plus long qu'une respiration : assez lent pour
    // ne pas rivaliser avec le scintillement.
    '--o-sun-turn': `${String(speed * 8)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-sun-rays=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <circle cx="50" cy="50" r="16" fill="currentColor" />
        <g data-o-sun-crown="">
          {Array.from({ length: RAYS }, (_, index) => {
            const long = index % 2 === 0
            return (
              <line
                key={index}
                data-o-sun-ray=""
                x1="50"
                y1={long ? 26 : 28}
                x2="50"
                y2={long ? 8 : 16}
                stroke="currentColor"
                strokeWidth={long ? 4 : 3}
                strokeLinecap="round"
                style={
                  {
                    '--o-sun-angle': `${String((360 / RAYS) * index)}deg`,
                    // Un rayon sur deux est en avance d'une demi-periode.
                    // Le delai est negatif : la couronne scintille des la
                    // premiere image, au lieu d'attendre son tour.
                    '--o-sun-delay': long ? '0ms' : `${String(Math.round(-speed / 2))}ms`,
                  } as CSSProperties
                }
              />
            )
          })}
        </g>
      </svg>
    </span>
  )
}
