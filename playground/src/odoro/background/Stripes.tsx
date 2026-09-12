/**
 * Rayures : des bandes diagonales, en un seul degrade repete.
 *
 * ## Pourquoi un seul degrade suffit
 *
 * Une rayure est une alternance de deux etats le long d'un axe. C'est la
 * definition meme d'un `repeating-linear-gradient` : une bande de couleur, un
 * vide, et la repetition est gratuite. Dessiner cela avec un script ou une
 * surface graphique reviendrait a payer pour ce que le compositeur fait deja.
 *
 * ## Pourquoi la largeur et l'ecart sont deux reglages
 *
 * Une seule densite ne dit rien : des bandes larges et serrees font un store,
 * des bandes fines et espacees font un filigrane. Separer la largeur de la
 * bande et celle du vide couvre les deux, la ou un unique « pas » les
 * confondrait.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement } from 'react'

/** Proprietes propres au composant. */
export interface StripesOwnProps {
  /** Largeur d'une bande, en pixels. @defaultValue 10 */
  width?: number
  /** Ecart entre deux bandes, en pixels. @defaultValue 22 */
  gap?: number
  /** Inclinaison des bandes, en degres. @defaultValue 45 */
  angle?: number
  /** Couleur des bandes. */
  color?: string
  /** Couleur du fond. */
  background?: string
}

/** Toutes les proprietes. */
export type StripesProps = Customisable<StripesOwnProps>

/**
 * Rayures de fond.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Stripes className="o-absolute o-inset-0" angle={-30} />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Stripes({
  width = 10,
  gap = 22,
  angle = 45,
  color = 'color-mix(in oklab, var(--o-palette-brand-500, oklch(59.8% 0.198 275)) 14%, transparent)',
  background = 'var(--o-theme-bg, oklch(98.5% 0 0))',
  ...rest
}: StripesProps): ReactElement {
  const band = `${String(width)}px`
  const period = `${String(width + gap)}px`

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      className={className}
      style={
        {
          ...style,
          backgroundColor: background,
          backgroundImage: `repeating-linear-gradient(${String(angle)}deg, ${color} 0 ${band}, transparent ${band} ${period})`,
        } as CSSProperties
      }
      aria-hidden
    />
  )
}
