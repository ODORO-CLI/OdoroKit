/**
 * Croisillons : deux trames diagonales croisees, en degrades repetes.
 *
 * ## Pourquoi deux trames et pas une grille tournee
 *
 * Tourner une grille de 45 degres avec `transform` obligerait a surdimensionner
 * l'element pour couvrir les coins, puis a masquer le depassement. Deux
 * `repeating-linear-gradient` inclines a plus et moins 45 degres dessinent le
 * meme croisillon sans rotation, sans surplus et sans masque : l'inclinaison
 * est portee par le degrade lui-meme.
 *
 * ## Ou les traits se croisent
 *
 * Aux croisements, les deux trames se superposent et la couleur s'y accumule
 * naturellement — c'est ce leger renforcement des noeuds qui fait la matiere
 * du motif, et il est gratuit : aucune couche dediee ne le dessine.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement } from 'react'

/** Proprietes propres au composant. */
export interface CrosshatchOwnProps {
  /** Ecart entre deux traits d'une meme trame, en pixels. @defaultValue 14 */
  spacing?: number
  /** Opacite des traits, entre 0 et 1. @defaultValue 0.12 */
  strength?: number
  /** Couleur des traits. */
  color?: string
}

/** Toutes les proprietes. */
export type CrosshatchProps = Customisable<CrosshatchOwnProps>

/**
 * Croisillons de fond.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Crosshatch className="o-absolute o-inset-0" spacing={18} />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Crosshatch({
  spacing = 14,
  strength = 0.12,
  color = 'var(--o-palette-zinc-500, oklch(55.2% 0.016 285.938))',
  ...rest
}: CrosshatchProps): ReactElement {
  const line = `color-mix(in oklab, ${color} ${String(Math.round(strength * 100))}%, transparent)`
  const period = `${String(spacing)}px`

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      className={className}
      style={
        {
          ...style,
          backgroundImage: [
            `repeating-linear-gradient(45deg, ${line} 0 1px, transparent 1px ${period})`,
            `repeating-linear-gradient(-45deg, ${line} 0 1px, transparent 1px ${period})`,
          ].join(','),
        } as CSSProperties
      }
      aria-hidden
    />
  )
}
