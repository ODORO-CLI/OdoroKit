/**
 * Point qui pulse : un point plein d'ou s'echappent deux ondes concentriques.
 *
 * ## Deux ondes, une demi-periode d'ecart
 *
 * Une seule onde qui grandit puis disparait laisse un trou : pendant qu'elle
 * s'eteint, rien ne part du centre, et le rythme semble hoqueter. Deux ondes
 * a une demi-periode d'ecart se relaient sans blanc — il y en a toujours une
 * en route. Le delai de la seconde est negatif, pour qu'elle soit deja en
 * chemin a la premiere image plutot que d'attendre son tour.
 *
 * Le point central, lui, ne bouge pas : c'est l'ancre visuelle, ce que l'oeil
 * fixe pendant que les ondes s'eloignent. Un centre qui pulserait aussi
 * brouillerait la lecture — rien ne resterait fixe.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Point et ondes sont
 * retires de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, le point reste plein et une seule onde est figee a
 * mi-course, attenuee : la figure dit encore « quelque chose emet », sans
 * mouvement.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-pulse-dot'

/** Pose le point et ses ondes, une fois par document. */
function ensurePulseRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-pulse-dot]{',
    'position:relative;display:inline-block;',
    'width:var(--o-pdot-size);height:var(--o-pdot-size);',
    '}',
    '[data-o-pulse-core]{',
    'position:absolute;inset:35%;border-radius:50%;',
    'background:var(--o-pdot-color);',
    '}',
    '[data-o-pulse-wave]{',
    'position:absolute;inset:0;border-radius:50%;',
    'border:2px solid var(--o-pdot-color);',
    'animation:o-pulse-dot-wave var(--o-pdot-speed) ease-out infinite;',
    'animation-delay:var(--o-pdot-delay);',
    '}',
    '@keyframes o-pulse-dot-wave{',
    'from{transform:scale(0.3);opacity:0.9}',
    'to{transform:scale(1);opacity:0}',
    '}',
    // Une onde figee a mi-course : la figure dit encore « emission », sans
    // rien qui bouge. La seconde onde disparait, deux ondes fixes seraient
    // une cible, pas un chargeur.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-pulse-wave]{animation:none;transform:scale(0.7);opacity:0.35}',
    '[data-o-pulse-wave]:last-child{display:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface PulseDotOwnProps {
  /** Diametre de l'onde a son extension maximale, en pixels. @defaultValue 32 */
  size?: number
  /** Duree de vie d'une onde, en millisecondes. @defaultValue 1400 */
  speed?: number
  /** Couleur du point et des ondes. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type PulseDotProps = Customisable<PulseDotOwnProps, 'span'>

/**
 * Signale une attente par un point d'ou partent des ondes.
 *
 * @example
 * <PulseDot />
 *
 * @example
 * // Plus large, plus lent, dans la teinte de marque.
 * <PulseDot size={64} speed={2200} color="var(--o-palette-brand-500)" />
 */
export function PulseDot({
  size = 32,
  speed = 1400,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: PulseDotProps): ReactElement {
  ensurePulseRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-pdot-size': `${String(size)}px`,
    '--o-pdot-speed': `${String(speed)}ms`,
    '--o-pdot-color': color,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-pulse-dot=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-pulse-core="" />
      {[0, 1].map((wave) => (
        <span
          key={wave}
          aria-hidden
          data-o-pulse-wave=""
          style={
            {
              // Une demi-periode d'ecart, en negatif : la seconde onde est
              // deja en route a la premiere image.
              '--o-pdot-delay': `${String(Math.round((-speed * wave) / 2))}ms`,
            } as CSSProperties
          }
        />
      ))}
    </span>
  )
}
