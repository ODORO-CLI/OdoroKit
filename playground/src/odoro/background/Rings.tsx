/**
 * Anneaux : des cercles concentriques, en un degrade radial repete.
 *
 * ## Pourquoi le centre est reglable
 *
 * Des anneaux centres se lisent comme une cible ; decales vers un coin, ils
 * deviennent une onde qui traverse la page et laissent le centre optique libre
 * pour le contenu. Le point d'emission est donc deux reglages, pas une
 * constante — c'est lui qui decide de ce que le motif raconte.
 *
 * ## Pourquoi aucun script
 *
 * Un `repeating-radial-gradient` decrit la serie entiere : un trait, un vide,
 * et la repetition jusqu'au bord est gratuite. Le compositeur dessine tout ;
 * ajouter un canvas ou une surface graphique ne changerait pas un pixel du
 * resultat, mais reserverait un contexte que le navigateur ne distribue qu'en
 * nombre limite.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement } from 'react'

/** Proprietes propres au composant. */
export interface RingsOwnProps {
  /** Ecart entre deux anneaux, en pixels. @defaultValue 32 */
  spacing?: number
  /** Epaisseur du trait, en pixels. @defaultValue 1 */
  thickness?: number
  /** Position horizontale du centre, entre 0 et 1. @defaultValue 0.5 */
  x?: number
  /** Position verticale du centre, entre 0 et 1. @defaultValue 0.5 */
  y?: number
  /** Couleur des anneaux. */
  color?: string
}

/** Toutes les proprietes. */
export type RingsProps = Customisable<RingsOwnProps>

/**
 * Anneaux de fond.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Rings className="o-absolute o-inset-0" x={0.8} y={0.2} />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Rings({
  spacing = 32,
  thickness = 1,
  x = 0.5,
  y = 0.5,
  color = 'color-mix(in oklab, var(--o-palette-cyan-500, oklch(71.5% 0.143 215.221)) 18%, transparent)',
  ...rest
}: RingsProps): ReactElement {
  const line = `${String(thickness)}px`
  const period = `${String(spacing)}px`
  const centre = `${String(Math.round(x * 100))}% ${String(Math.round(y * 100))}%`

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      className={className}
      style={
        {
          ...style,
          backgroundImage: `repeating-radial-gradient(circle at ${centre}, ${color} 0 ${line}, transparent ${line} ${period})`,
        } as CSSProperties
      }
      aria-hidden
    />
  )
}
