/**
 * Points qui respirent : trois points pulsent en canon.
 *
 * ## Une animation, trois delais negatifs
 *
 * Les trois points jouent exactement la meme animation ; seule leur phase
 * differe, par un delai negatif d'un tiers de cycle chacun. Un delai positif
 * ferait attendre les deux derniers points au premier rendu — pendant un
 * instant, un seul point serait visible, et le chargeur aurait l'air casse.
 * Negatif, chaque point demarre deja au milieu de sa course : le canon est
 * la des la premiere image.
 *
 * Aucun JavaScript apres le premier rendu : trois animations declarees une
 * fois, tenues par le compositeur.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Les points, eux, sont
 * retires de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, les trois points restent pleins et immobiles : la
 * figure se lit encore comme un chargeur, seul le mouvement s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-dots-loader'

/** Pose les points et leur respiration, une fois par document. */
function ensureDotsRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-dots-loader]{',
    'display:inline-flex;align-items:center;',
    'gap:calc(var(--o-dots-size) * 0.6);',
    '}',
    '[data-o-dots-dot]{',
    'width:var(--o-dots-size);height:var(--o-dots-size);',
    'border-radius:50%;background:var(--o-dots-color);',
    'animation:o-dots-breathe var(--o-dots-speed) ease-in-out infinite;',
    'animation-delay:var(--o-dots-delay);',
    '}',
    '@keyframes o-dots-breathe{',
    '0%,100%{transform:scale(0.6);opacity:0.35}',
    '50%{transform:scale(1);opacity:1}',
    '}',
    // Trois points pleins : la figure dit encore « attente », sans pulsation.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-dots-dot]{animation:none;transform:none;opacity:1}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface DotsLoaderOwnProps {
  /** Diametre d'un point, en pixels. @defaultValue 10 */
  size?: number
  /** Duree d'un cycle de respiration, en millisecondes. @defaultValue 900 */
  speed?: number
  /** Couleur des points. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type DotsLoaderProps = Customisable<DotsLoaderOwnProps, 'span'>

/**
 * Signale une attente par trois points qui respirent en canon.
 *
 * @example
 * <DotsLoader />
 *
 * @example
 * // Plus grand, plus lent, dans la teinte de marque.
 * <DotsLoader size={14} speed={1400} color="var(--o-palette-brand-500)" />
 */
export function DotsLoader({
  size = 10,
  speed = 900,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: DotsLoaderProps): ReactElement {
  ensureDotsRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-dots-size': `${String(size)}px`,
    '--o-dots-speed': `${String(speed)}ms`,
    '--o-dots-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-dots-loader=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      {[0, 1, 2].map((dot) => (
        <span
          key={dot}
          aria-hidden
          data-o-dots-dot=""
          style={
            {
              // Un tiers de cycle d'ecart, en negatif : le canon est complet
              // des la premiere image.
              '--o-dots-delay': `${String(Math.round((-speed * dot) / 3))}ms`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  )
}
