/**
 * Barres en vague : cinq barres fines s'etirent depuis leur centre, l'une
 * apres l'autre, comme une onde qui traverse la rangee.
 *
 * ## Une echelle, pas une hauteur
 *
 * Chaque barre occupe toute la hauteur du conteneur et n'est etiree que par
 * une echelle verticale, depuis son milieu : la mise en page ne bouge jamais,
 * et la figure reste symetrique autour de sa ligne mediane — c'est ce qui la
 * fait lire comme une forme d'onde plutot que comme un histogramme. Un
 * histogramme, c'est `equalizer`, ancre au sol.
 *
 * Les cinq barres jouent la meme animation avec un cinquieme de cycle
 * d'ecart, en delai negatif : la vague est deja en route a la premiere image,
 * au lieu de partir d'une rangee plate.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Les barres sont
 * retirees de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, les cinq barres restent a mi-hauteur : la forme
 * d'onde se lit encore, seule la vague s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-wave-bars'

/** Nombre de barres. */
const BARS = 5

/** Pose les barres et leur vague, une fois par document. */
function ensureWaveBarsRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-wave-bars]{',
    'display:inline-flex;align-items:center;',
    'gap:var(--o-wbars-size);height:calc(var(--o-wbars-size) * 8);',
    '}',
    '[data-o-wave-bar]{',
    'width:var(--o-wbars-size);height:100%;',
    'border-radius:calc(var(--o-wbars-size) / 2);background:var(--o-wbars-color);',
    'transform-origin:center;',
    'animation:o-wave-bars-swell var(--o-wbars-speed) ease-in-out infinite;',
    'animation-delay:var(--o-wbars-delay);',
    '}',
    '@keyframes o-wave-bars-swell{',
    '0%,100%{transform:scaleY(0.25)}',
    '50%{transform:scaleY(1)}',
    '}',
    // Une rangee a mi-hauteur : la forme d'onde reste dite, sans vague.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-wave-bar]{animation:none;transform:scaleY(0.6)}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface WaveBarsOwnProps {
  /** Largeur d'une barre, en pixels. @defaultValue 4 */
  size?: number
  /** Duree d'un passage complet de la vague, en millisecondes. @defaultValue 1000 */
  speed?: number
  /** Couleur des barres. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type WaveBarsProps = Customisable<WaveBarsOwnProps, 'span'>

/**
 * Signale une attente par cinq barres traversees d'une vague.
 *
 * @example
 * <WaveBars />
 *
 * @example
 * // Plus large, plus lent, dans la teinte de marque.
 * <WaveBars size={6} speed={1600} color="var(--o-palette-brand-500)" />
 */
export function WaveBars({
  size = 4,
  speed = 1000,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: WaveBarsProps): ReactElement {
  ensureWaveBarsRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-wbars-size': `${String(size)}px`,
    '--o-wbars-speed': `${String(speed)}ms`,
    '--o-wbars-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-wave-bars=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      {Array.from({ length: BARS }, (_, bar) => (
        <span
          key={bar}
          aria-hidden
          data-o-wave-bar=""
          style={
            {
              // Un cinquieme de cycle d'ecart, en negatif : la vague est deja
              // en route a la premiere image.
              '--o-wbars-delay': `${String(Math.round((-speed * bar) / BARS))}ms`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  )
}
