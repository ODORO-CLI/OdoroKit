/**
 * Flottement : chaque enfant direct oscille doucement, jamais en choeur.
 *
 * ## La cadence vient de l'index, pas du hasard
 *
 * Duree et phase de chaque enfant sont derivees de sa position par la meme
 * suite deterministe que la pluie de meteores. `Math.random()` au rendu
 * donnerait deux flottements differents entre le serveur et le client — une
 * erreur d'hydratation par enfant — et un flottement nouveau a chaque rendu
 * du parent. La graine par index garantit surtout ce qui fait l'effet : deux
 * voisins n'ont jamais ni la meme duree ni la meme phase, et le groupe
 * respire au lieu de sauter a l'unisson.
 *
 * ## Le compositeur porte tout
 *
 * Chaque enfant est enveloppe d'un `span` qui porte une seule animation CSS
 * — une translation verticale sinusoidale — reglee par variables. Aucun
 * JavaScript ne s'execute pendant le flottement ; le delai negatif fait que
 * chacun est deja quelque part sur sa course au premier regard.
 *
 * Les enveloppes ne portent pas d'`aria-hidden` : elles contiennent du vrai
 * contenu — badges, vignettes — que le flottement ne doit pas faire taire.
 * Sous mouvement reduit, l'animation est suspendue : tout reste en place.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { Children, type CSSProperties, type ReactElement, type ReactNode } from 'react'

/** Proprietes propres au composant. */
export interface FloatGroupOwnProps {
  /** Elements qui flottent, chacun sur sa propre cadence. */
  children: ReactNode
  /** Amplitude de l'oscillation, en pixels. @defaultValue 8 */
  amplitude?: number
  /** Duree de reference d'un aller-retour, en millisecondes. @defaultValue 3000 */
  duration?: number
}

/** Toutes les proprietes. */
export type FloatGroupProps = Customisable<FloatGroupOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-float-group'

/**
 * Valeur pseudo-aleatoire dans [0, 1), stable pour un couple index-canal.
 *
 * Une congruence suffit : il ne s'agit pas de cryptographie, seulement de
 * garantir que deux voisins ne partagent jamais leur cadence.
 */
function seeded(index: number, channel: number): number {
  const value = Math.sin(index * 127.1 + channel * 311.7) * 43758.5453
  return value - Math.floor(value)
}

/** Pose l'oscillation, une fois par document. */
function ensureFloatRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-float]{',
    'display:inline-block;',
    'animation:o-float-drift var(--o-float-duration) ease-in-out infinite;',
    'animation-delay:var(--o-float-phase);',
    'will-change:transform;',
    '}',
    // Une sinusoide en trois points : l'aller-retour est symetrique, et
    // ease-in-out arrondit les extremes comme un vrai flotteur.
    '@keyframes o-float-drift{',
    '0%,100%{transform:translateY(0)}',
    '50%{transform:translateY(calc(var(--o-float-amplitude) * -1))}',
    '}',
    '@media (prefers-reduced-motion:reduce){[data-o-float]{animation:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Fait flotter chacun de ses enfants directs, pour badges et vignettes.
 *
 * La mise en page du groupe appartient a l'appelant : une rangee, une
 * grille, un nuage — le composant ne fait qu'envelopper chaque enfant.
 *
 * @example
 * <FloatGroup className="o-flex o-items-center o-gap-6">
 *   <Badge>Nouveau</Badge>
 *   <Badge>Sans engagement</Badge>
 *   <Badge>Ouvert la nuit</Badge>
 * </FloatGroup>
 *
 * @example
 * // Un flottement ample et lent, pour de grandes vignettes.
 * <FloatGroup amplitude={16} duration={5000} className="o-grid o-grid-cols-3 o-gap-8">
 *   {vignettes}
 * </FloatGroup>
 */
export function FloatGroup({
  children,
  amplitude = 8,
  duration = 3000,
  ...rest
}: FloatGroupProps): ReactElement {
  ensureFloatRule()

  const { className, style } = mergePresentation({}, rest)

  return (
    <div {...rest} className={className} style={style}>
      {Children.map(children, (child, index) => {
        // Duree etalee autour de la reference, phase portee par un delai
        // negatif : voir l'en-tete du module.
        const own = duration * (0.85 + seeded(index, 0) * 0.4)
        return (
          <span
            data-o-float=""
            style={
              {
                '--o-float-amplitude': `${String(amplitude)}px`,
                '--o-float-duration': `${String(Math.round(own))}ms`,
                '--o-float-phase': `${String(-Math.round(seeded(index, 1) * own))}ms`,
              } as CSSProperties
            }
          >
            {child}
          </span>
        )
      })}
    </div>
  )
}
