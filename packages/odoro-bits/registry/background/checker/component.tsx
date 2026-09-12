/**
 * Damier : une alternance de cases, en un seul degrade conique repete.
 *
 * ## Pourquoi un degrade conique
 *
 * Un damier se decrit d'habitude avec deux degrades lineaires decales — la
 * recette d'avant `conic-gradient`. Le conique fait mieux : quatre quarts de
 * tour autour du centre d'une tuile donnent exactement deux cases pleines et
 * deux cases vides, en une seule image de fond. Moins de couches, meme motif.
 *
 * ## Pourquoi la force est un reglage et pas la couleur seule
 *
 * Un damier plein attire l'oeil comme un plateau de jeu. En fond, il ne doit
 * etre qu'une texture : la force melange la couleur au transparent, et le
 * reglage par defaut le laisse a peine visible.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement } from 'react'

/** Proprietes propres au composant. */
export interface CheckerOwnProps {
  /** Cote d'une case, en pixels. @defaultValue 24 */
  size?: number
  /** Opacite des cases pleines, entre 0 et 1. @defaultValue 0.06 */
  strength?: number
  /** Couleur des cases pleines. */
  color?: string
}

/** Toutes les proprietes. */
export type CheckerProps = Customisable<CheckerOwnProps>

/**
 * Damier de fond.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Checker className="o-absolute o-inset-0" size={32} />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Checker({
  size = 24,
  strength = 0.06,
  color = 'var(--o-palette-zinc-500, oklch(55.2% 0.016 285.938))',
  ...rest
}: CheckerProps): ReactElement {
  const tile = `color-mix(in oklab, ${color} ${String(Math.round(strength * 100))}%, transparent)`
  // La tuile fait deux cases de cote : le conique y decoupe ses quatre quarts.
  const period = `${String(size * 2)}px`

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      className={className}
      style={
        {
          ...style,
          backgroundImage: `conic-gradient(${tile} 0 25%, transparent 0 50%, ${tile} 0 75%, transparent 0)`,
          backgroundSize: `${period} ${period}`,
        } as CSSProperties
      }
      aria-hidden
    />
  )
}
