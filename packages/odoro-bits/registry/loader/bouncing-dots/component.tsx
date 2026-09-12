/**
 * Points qui sautent : trois points bondissent l'un apres l'autre.
 *
 * ## Un saut, pas une oscillation
 *
 * Un aller-retour en `ease-in-out` donne un flottement — le point ralentit
 * en haut et en bas de la meme facon, comme suspendu a un ressort. Un saut
 * ne ressemble pas a cela : le point part vite, ralentit au sommet, puis
 * retombe en accelerant et s'arrete net au sol. Les courbes sont donc posees
 * image cle par image cle — `ease-out` a la montee, `ease-in` a la descente —
 * et le point reste au sol un tiers du cycle : c'est cette pause qui fait
 * lire un rebond plutot qu'une vague.
 *
 * Les trois points decalent leur depart d'un sixieme de cycle, en delai
 * negatif : la sequence est complete a la premiere image, sans point qui
 * attendrait son tour.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Les points sont retires
 * de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, les trois points reposent sur leur ligne de sol :
 * la figure se lit encore comme un chargeur, seul le saut s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-bouncing-dots'

/** Pose les points et leur saut, une fois par document. */
function ensureBounceRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // Le conteneur reserve la hauteur du saut : le point monte dedans, la
    // mise en page ne bouge pas.
    '[data-o-bouncing-dots]{',
    'display:inline-flex;align-items:flex-end;',
    'gap:calc(var(--o-bdots-size) * 0.5);',
    'height:calc(var(--o-bdots-size) * 2.6);',
    '}',
    '[data-o-bouncing-dot]{',
    'width:var(--o-bdots-size);height:var(--o-bdots-size);',
    'border-radius:50%;background:var(--o-bdots-color);',
    'animation:o-bouncing-dots-jump var(--o-bdots-speed) infinite;',
    'animation-delay:var(--o-bdots-delay);',
    '}',
    // Montee en decelerant, descente en accelerant, puis un temps au sol.
    '@keyframes o-bouncing-dots-jump{',
    '0%{transform:translate3d(0,0,0);animation-timing-function:ease-out}',
    '33%{transform:translate3d(0,calc(var(--o-bdots-size) * -1.6),0);animation-timing-function:ease-in}',
    '66%,100%{transform:translate3d(0,0,0)}',
    '}',
    // Trois points au sol : la figure dit encore « attente », sans saut.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-bouncing-dot]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface BouncingDotsOwnProps {
  /** Diametre d'un point, en pixels. @defaultValue 10 */
  size?: number
  /** Duree d'un saut complet, en millisecondes. @defaultValue 800 */
  speed?: number
  /** Couleur des points. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type BouncingDotsProps = Customisable<BouncingDotsOwnProps, 'span'>

/**
 * Signale une attente par trois points qui sautent tour a tour.
 *
 * @example
 * <BouncingDots />
 *
 * @example
 * // Plus gros, plus lent, dans la teinte de marque.
 * <BouncingDots size={14} speed={1200} color="var(--o-palette-brand-500)" />
 */
export function BouncingDots({
  size = 10,
  speed = 800,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: BouncingDotsProps): ReactElement {
  ensureBounceRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-bdots-size': `${String(size)}px`,
    '--o-bdots-speed': `${String(speed)}ms`,
    '--o-bdots-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-bouncing-dots=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          aria-hidden
          data-o-bouncing-dot=""
          style={
            {
              // Un sixieme de cycle d'ecart, en negatif : la sequence est
              // complete des la premiere image.
              '--o-bdots-delay': `${String(Math.round((-speed * dot) / 6))}ms`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  )
}
