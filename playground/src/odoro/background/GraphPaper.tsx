/**
 * Papier millimetre : deux quadrillages emboites, en degrades repetes.
 *
 * ## Pourquoi deux mailles plutot qu'une
 *
 * Un quadrillage simple donne une texture ; le papier millimetre donne une
 * echelle. C'est la maille epaisse, posee toutes les cinq mailles fines, qui
 * produit cette lecture : l'oeil groupe les petites cellules par paquets et la
 * surface devient mesurable au lieu d'etre seulement reguliere.
 *
 * ## Pourquoi aucun script
 *
 * Quatre degrades lineaires repetes decrivent exactement le motif, et le
 * compositeur du navigateur les dessine seul. Une surface graphique ou un
 * canvas coutera toujours plus pour un resultat identique — et l'arbitre
 * n'accorde qu'une surface par backend, alors que celui-ci se pose autant de
 * fois qu'on veut.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement } from 'react'

/** Proprietes propres au composant. */
export interface GraphPaperOwnProps {
  /** Pas de la maille fine, en pixels. La maille epaisse en vaut cinq. @defaultValue 8 */
  size?: number
  /** Opacite des traits, entre 0 et 1. @defaultValue 0.4 */
  strength?: number
  /** Couleur des traits. */
  color?: string
  /** Couleur du fond. */
  background?: string
}

/** Toutes les proprietes. */
export type GraphPaperProps = Customisable<GraphPaperOwnProps>

/**
 * Papier millimetre de fond.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <GraphPaper className="o-absolute o-inset-0" size={10} />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function GraphPaper({
  size = 8,
  strength = 0.4,
  color = 'var(--o-palette-sky-500, oklch(68.5% 0.169 237.323))',
  background = 'var(--o-theme-bg, oklch(98.5% 0 0))',
  ...rest
}: GraphPaperProps): ReactElement {
  // La maille fine est volontairement plus palie que l'epaisse : c'est cet
  // ecart, pas la couleur, qui fait lire les paquets de cinq.
  const fine = `color-mix(in oklab, ${color} ${String(Math.round(strength * 45))}%, transparent)`
  const bold = `color-mix(in oklab, ${color} ${String(Math.round(strength * 100))}%, transparent)`
  const step = `${String(size)}px`
  const major = `${String(size * 5)}px`

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      className={className}
      style={
        {
          ...style,
          backgroundColor: background,
          backgroundImage: [
            `linear-gradient(to right, ${bold} 1px, transparent 1px)`,
            `linear-gradient(to bottom, ${bold} 1px, transparent 1px)`,
            `linear-gradient(to right, ${fine} 1px, transparent 1px)`,
            `linear-gradient(to bottom, ${fine} 1px, transparent 1px)`,
          ].join(','),
          backgroundSize: `${major} ${major}, ${major} ${major}, ${step} ${step}, ${step} ${step}`,
        } as CSSProperties
      }
      aria-hidden
    />
  )
}
