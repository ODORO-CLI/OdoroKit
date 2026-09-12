/**
 * Plan technique : un quadrillage clair sur fond profond, avec des croix aux
 * intersections principales.
 *
 * ## Comment les croix sont dessinees sans script
 *
 * Une croix n'est pas un motif que les degrades donnent directement : un
 * degrade lineaire remplit toute sa tuile dans l'axe perpendiculaire, et deux
 * couches se superposent au lieu de s'intersecter. La solution tient en deux
 * couches empilees dans le bon ordre : un degrade conique dessine une etoile a
 * quatre branches par grande tuile, et un degrade radial couleur de fond,
 * pose au-dessus, la recouvre au-dela d'un petit rayon. Ne reste visible que
 * le coeur de l'etoile — une croix — et le quadrillage, place plus haut dans
 * la pile, n'est pas touche.
 *
 * ## Pourquoi les croix tombent une intersection sur quatre
 *
 * Marquer chaque noeud transformerait le plan en tissu. Une croix toutes les
 * quatre mailles donne le reperage sans la surcharge — c'est le role des
 * reperes d'un vrai plan, pas leur decoration.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement } from 'react'

/** Proprietes propres au composant. */
export interface BlueprintOwnProps {
  /** Pas de la maille, en pixels. Les croix tombent toutes les quatre mailles. @defaultValue 24 */
  cell?: number
  /** Opacite des traits, entre 0 et 1. @defaultValue 0.4 */
  strength?: number
  /** Couleur des traits et des croix. */
  color?: string
  /** Couleur du fond. */
  background?: string
}

/** Toutes les proprietes. */
export type BlueprintProps = Customisable<BlueprintOwnProps>

/**
 * Plan technique de fond.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Blueprint className="o-absolute o-inset-0" cell={32} />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Blueprint({
  cell = 24,
  strength = 0.4,
  color = 'var(--o-palette-sky-200, oklch(90.1% 0.058 230.902))',
  background = 'var(--o-theme-bg, oklch(98.5% 0 0))',
  ...rest
}: BlueprintProps): ReactElement {
  // Les croix sont plus affirmees que la maille : ce sont des reperes, pas une
  // texture, et a force egale elles disparaitraient dans le quadrillage.
  const line = `color-mix(in oklab, ${color} ${String(Math.round(strength * 55))}%, transparent)`
  const cross = `color-mix(in oklab, ${color} ${String(Math.min(100, Math.round(strength * 150)))}%, transparent)`

  const step = `${String(cell)}px`
  const major = cell * 4
  const wide = `${String(major)}px`
  const offset = `${String(major / 2)}px`
  const radius = `${String(Math.round(cell / 3))}px`

  // L'etoile a quatre branches : des secteurs de 12 degres centres sur les
  // quatre points cardinaux de chaque grande tuile.
  const star = `conic-gradient(from -6deg, ${cross} 0 12deg, transparent 0 90deg, ${cross} 0 102deg, transparent 0 180deg, ${cross} 0 192deg, transparent 0 270deg, ${cross} 0 282deg, transparent 0)`

  // Le cache : couleur de fond partout sauf dans un petit disque central. Il
  // couvre l'etoile situee dessous, pas la maille situee dessus.
  const cutter = `radial-gradient(circle, transparent ${radius}, ${background} ${radius})`

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
            `linear-gradient(to right, ${line} 1px, transparent 1px)`,
            `linear-gradient(to bottom, ${line} 1px, transparent 1px)`,
            cutter,
            star,
          ].join(','),
          backgroundSize: `${step} ${step}, ${step} ${step}, ${wide} ${wide}, ${wide} ${wide}`,
          backgroundPosition: `0 0, 0 0, ${offset} ${offset}, ${offset} ${offset}`,
        } as CSSProperties
      }
      aria-hidden
    />
  )
}
