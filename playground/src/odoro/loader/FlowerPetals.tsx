/**
 * Petales qui s'ouvrent : huit petales s'ouvrent un a un autour d'un coeur,
 * tiennent, puis se referment.
 *
 * ## Un petale pousse depuis sa base
 *
 * Chaque petale est une ellipse posee au-dessus du coeur, puis tournee
 * autour de lui par son groupe : huit groupes, huit angles, une seule forme.
 * L'ouverture est une echelle dont l'origine est la base du petale — le
 * bout qui touche le coeur. Une echelle centree ferait apparaitre le petale
 * en l'air, detache ; depuis sa base, il pousse.
 *
 * Le cycle est asymetrique a dessein : l'ouverture est lente et la fleur
 * tient ouverte la moitie du temps, la fermeture est brusque. Une fleur qui
 * s'ouvrirait et se fermerait a la meme allure respirerait, et ce chargeur
 * n'est pas une respiration — `dots-loader` l'est deja.
 *
 * Les huit petales partagent l'animation, decalee d'un douzieme de cycle
 * chacun, en delai negatif : la sequence est engagee des la premiere image.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Le dessin est retire
 * de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, la fleur reste ouverte : c'est l'etat ou elle passe
 * le plus de temps, et le seul ou elle se reconnait.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-flower-petals'

/** Nombre de petales. */
const PETALS = 8

/** Pose la fleur et son ouverture, une fois par document. */
function ensureFlowerRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-flower-petals]{display:inline-block;line-height:0}',
    '[data-o-flower-heart]{fill:var(--o-petal-color)}',
    // L'origine de l'echelle est la base du petale, cote coeur : il pousse
    // depuis la fleur, il n'apparait pas en l'air.
    '[data-o-flower-petal]{',
    'fill:var(--o-petal-color);opacity:0.85;',
    'transform-box:fill-box;transform-origin:50% 100%;',
    'animation:o-flower-petals-bloom var(--o-petal-speed) infinite;',
    'animation-delay:var(--o-petal-delay);',
    '}',
    // Ouverture lente, longue tenue, fermeture brusque.
    '@keyframes o-flower-petals-bloom{',
    '0%{transform:scale(0.1);animation-timing-function:ease-out}',
    '30%,80%{transform:scale(1);animation-timing-function:ease-in}',
    '92%,100%{transform:scale(0.1)}',
    '}',
    // La fleur ouverte : l'etat ou elle se reconnait.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-flower-petal]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface FlowerPetalsOwnProps {
  /** Cote du dessin, en pixels. @defaultValue 48 */
  size?: number
  /** Duree d'une floraison complete, en millisecondes. @defaultValue 2400 */
  speed?: number
  /** Couleur des petales et du coeur. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type FlowerPetalsProps = Customisable<FlowerPetalsOwnProps, 'span'>

/**
 * Signale une attente par une fleur qui s'ouvre petale apres petale.
 *
 * @example
 * <FlowerPetals />
 *
 * @example
 * // Plus grande, plus lente, dans la teinte de marque.
 * <FlowerPetals size={96} speed={3600} color="var(--o-palette-brand-500)" />
 */
export function FlowerPetals({
  size = 48,
  speed = 2400,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: FlowerPetalsProps): ReactElement {
  ensureFlowerRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-petal-speed': `${String(speed)}ms`,
    '--o-petal-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-flower-petals=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden width={size} height={size} viewBox="0 0 100 100">
        {Array.from({ length: PETALS }, (_, index) => (
          <g key={index} transform={`rotate(${String((360 / PETALS) * index)} 50 50)`}>
            <ellipse
              data-o-flower-petal=""
              cx="50"
              cy="27"
              rx="9"
              ry="19"
              style={
                {
                  // Un douzieme de cycle entre deux petales, en negatif : la
                  // sequence est engagee des la premiere image.
                  '--o-petal-delay': `${String(Math.round((-speed * (PETALS - 1 - index)) / 12))}ms`,
                } as CSSProperties
              }
            />
          </g>
        ))}
        <circle data-o-flower-heart="" cx="50" cy="50" r="7" />
      </svg>
    </span>
  )
}
