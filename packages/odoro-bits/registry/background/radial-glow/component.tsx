/**
 * Halo : deux lueurs superposees pour asseoir un hero.
 *
 * ## Pourquoi deux lueurs et pas une
 *
 * Une seule tache radiale se lit comme un projecteur : propre, mais plate. La
 * seconde lueur, decalee et dans une teinte voisine, casse la symetrie et donne
 * au fond une profondeur que l'oeil attribue a un eclairage plutot qu'a un
 * motif. Le decalage est fixe par rapport au centre principal : deplacer le
 * halo deplace l'ensemble, sans reglage supplementaire a maintenir.
 *
 * ## Pourquoi aucun script
 *
 * Deux `radial-gradient` sur un fond plein decrivent la scene entiere, et le
 * compositeur les peint une fois pour toutes. C'est le fond de hero le moins
 * cher qui existe : aucun contexte graphique, aucun plafond a partager, et il
 * se pose autant de fois qu'on veut.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement } from 'react'

/** Proprietes propres au composant. */
export interface RadialGlowOwnProps {
  /** Etendue du halo, en fraction du cadre. @defaultValue 0.9 */
  size?: number
  /** Position horizontale du halo, entre 0 et 1. @defaultValue 0.5 */
  x?: number
  /** Position verticale du halo, entre 0 et 1. @defaultValue 0.3 */
  y?: number
  /** Intensite des lueurs, entre 0 et 1. @defaultValue 0.5 */
  strength?: number
  /** Couleur de la lueur principale. */
  color?: string
  /** Couleur de la lueur d'accent. */
  accent?: string
  /** Couleur du fond. */
  background?: string
}

/** Toutes les proprietes. */
export type RadialGlowProps = Customisable<RadialGlowOwnProps>

/**
 * Halo de fond.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <RadialGlow className="o-absolute o-inset-0" y={0.15} />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function RadialGlow({
  size = 0.9,
  x = 0.5,
  y = 0.3,
  strength = 0.5,
  color = 'var(--o-palette-brand-500, oklch(59.8% 0.198 275))',
  accent = 'var(--o-palette-fuchsia-500, oklch(66.7% 0.295 322.15))',
  background = 'var(--o-theme-bg, oklch(98.5% 0 0))',
  ...rest
}: RadialGlowProps): ReactElement {
  const halo = `color-mix(in oklab, ${color} ${String(Math.round(strength * 100))}%, transparent)`
  const glint = `color-mix(in oklab, ${accent} ${String(Math.round(strength * 70))}%, transparent)`

  const pct = (value: number): string => `${String(Math.round(value * 100))}%`

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
            `radial-gradient(ellipse ${pct(size * 0.75)} ${pct(size * 0.6)} at ${pct(x)} ${pct(y)}, ${halo}, transparent 70%)`,
            `radial-gradient(ellipse ${pct(size * 0.55)} ${pct(size * 0.45)} at ${pct(x + 0.22)} ${pct(y + 0.24)}, ${glint}, transparent 70%)`,
          ].join(','),
        } as CSSProperties
      }
      aria-hidden
    />
  )
}
