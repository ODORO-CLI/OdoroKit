/**
 * Points masques : une grille de points estompee vers les bords par un masque.
 *
 * ## Pourquoi un masque plutot qu'un degrade de plus
 *
 * Estomper le motif avec un degrade superpose obligerait a connaitre la
 * couleur du fond pour peindre par-dessus — le composant cesserait d'etre
 * posable n'importe ou. Un `mask-image` retire de l'opacite au lieu d'ajouter
 * de la peinture : la vignette fonctionne sur n'importe quel fond, clair ou
 * sombre, sans rien savoir de lui.
 *
 * ## Pourquoi la vignette est un reglage continu
 *
 * A zero, le masque disparait completement — pas un masque transparent, pas de
 * masque du tout, le compositeur n'ayant alors rien a composer. Entre les
 * deux, la valeur rapproche simplement le debut de l'estompe du centre.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement } from 'react'

/** Proprietes propres au composant. */
export interface SpotGridOwnProps {
  /** Pas de la grille, en pixels. @defaultValue 24 */
  gap?: number
  /** Rayon d'un point, en pixels. @defaultValue 2 */
  dot?: number
  /** Force de la vignette, entre 0 et 1. Zero la retire. @defaultValue 0.6 */
  vignette?: number
  /** Couleur des points. */
  color?: string
}

/** Toutes les proprietes. */
export type SpotGridProps = Customisable<SpotGridOwnProps>

/**
 * Grille de points de fond.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <SpotGrid className="o-absolute o-inset-0" gap={32} />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function SpotGrid({
  gap = 24,
  dot = 2,
  vignette = 0.6,
  color = 'color-mix(in oklab, var(--o-theme-muted, oklch(55.2% 0.016 285.938)) 35%, transparent)',
  ...rest
}: SpotGridProps): ReactElement {
  const radius = `${String(dot)}px`
  const period = `${String(gap)}px`

  const mask =
    vignette > 0
      ? `radial-gradient(ellipse at center, black ${String(Math.round(75 - vignette * 55))}%, transparent 100%)`
      : undefined

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      className={className}
      style={
        {
          ...style,
          backgroundImage: `radial-gradient(circle, ${color} ${radius}, transparent ${radius})`,
          backgroundSize: `${period} ${period}`,
          ...(mask === undefined ? {} : { WebkitMaskImage: mask, maskImage: mask }),
        } as CSSProperties
      }
      aria-hidden
    />
  )
}
