/**
 * Grille : un quadrillage qui derive, sans contexte graphique.
 *
 * ## Pourquoi celui-ci n'emploie pas WebGL
 *
 * Un quadrillage est une repetition reguliere de deux traits. Deux degrades
 * repetes le decrivent exactement, et le compositeur du navigateur les dessine
 * sans qu'aucun JavaScript ne s'execute. Prendre une surface graphique pour
 * cela reviendrait a payer treize kilo-octets et un contexte — dont le
 * navigateur ne distribue qu'un nombre limite — pour un resultat identique.
 *
 * La consequence pratique compte autant que le principe : l'arbitre n'accorde
 * qu'une surface par backend, si bien que deux fonds en shader ne peuvent pas
 * coexister sur une page. Celui-ci se pose autant de fois qu'on veut.
 *
 * ## L'attenuation vers les bords
 *
 * Un quadrillage qui s'arrete net au bord de son conteneur se lit comme une
 * texture posee dessus. Un masque radial le fait disparaitre progressivement,
 * ce qui le fait appartenir a la page plutot que s'y superposer.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from 'odoro-engine'
import { type CSSProperties, type ReactElement } from 'react'

/** Proprietes propres au composant. */
export interface GridLinesOwnProps {
  /** Pas du quadrillage, en pixels. @defaultValue 48 */
  size?: number
  /** Epaisseur des traits, en pixels. @defaultValue 1 */
  thickness?: number
  /** Couleur des traits. */
  color?: string
  /** Duree d'un cycle de derive, en secondes. Zero pour l'immobiliser. @defaultValue 0 */
  speed?: number
  /** Attenue la grille vers les bords. @defaultValue true */
  fade?: boolean
}

/** Toutes les proprietes. */
export type GridLinesProps = Customisable<GridLinesOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-grid-lines'

/** Pose la derive, une fois par document. */
function ensureGridRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // La derive parcourt exactement un pas : au terme du cycle, le motif est
    // superposable a lui-meme et la boucle ne se voit pas.
    '@keyframes o-grid-drift{to{background-position:var(--o-grid-size) var(--o-grid-size)}}',
    '[data-o-grid-drift]{animation:o-grid-drift var(--o-grid-duration) linear infinite}',
    '@media (prefers-reduced-motion:reduce){[data-o-grid-drift]{animation:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Quadrillage de fond.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <GridLines className="o-absolute o-inset-0" speed={24} />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function GridLines({
  size = 48,
  thickness = 1,
  color = 'oklch(100% 0 0 / 0.08)',
  speed = 0,
  fade = true,
  ...rest
}: GridLinesProps): ReactElement {
  const { reduced } = useMotionState()
  ensureGridRule()

  const step = `${String(size)}px`
  const line = `${String(thickness)}px`

  const mask = fade
    ? 'radial-gradient(ellipse at center, black 45%, transparent 85%)'
    : undefined

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      className={className}
      style={
        {
          ...style,
          '--o-grid-size': step,
          '--o-grid-duration': `${String(Math.max(speed, 1))}s`,
          backgroundImage: [
            `linear-gradient(to right, ${color} ${line}, transparent ${line})`,
            `linear-gradient(to bottom, ${color} ${line}, transparent ${line})`,
          ].join(','),
          backgroundSize: `${step} ${step}`,
          ...(mask === undefined ? {} : { WebkitMaskImage: mask, maskImage: mask }),
        } as CSSProperties
      }
      data-o-grid-drift={speed > 0 && !reduced ? '' : undefined}
      aria-hidden
    />
  )
}
