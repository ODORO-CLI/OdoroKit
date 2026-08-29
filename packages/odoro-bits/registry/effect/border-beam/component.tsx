/**
 * Trait lumineux parcourant une bordure.
 *
 * ## Un degrade conique, pas un element qui tourne
 *
 * L'approche naive consiste a faire tourner un petit rectangle autour du
 * contour. Elle demande de connaitre la geometrie, casse des que l'element
 * change de proportions, et coince dans les angles arrondis.
 *
 * Un degrade conique tourne, lui, autour du centre : la bande claire balaie
 * naturellement tout le contour, quelle que soit la forme. Il ne reste qu'a
 * n'en garder que la bordure, ce que fait un masque en deux couches dont on
 * soustrait l'interieur.
 *
 * ## Aucun JavaScript par image
 *
 * La rotation est une animation CSS d'une propriete personnalisee enregistree
 * en angle. Sans cet enregistrement, un navigateur interpolerait la valeur
 * comme une chaine de caracteres — c'est-a-dire pas du tout : le trait
 * sauterait d'un tour a l'autre au lieu de tourner.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from 'odoro-engine'
import { type CSSProperties, type ReactElement, type ReactNode } from 'react'

/** Proprietes propres au composant. */
export interface BorderBeamOwnProps {
  /** Contenu encadre. */
  children: ReactNode
  /** Duree d'un tour complet, en millisecondes. @defaultValue 4000 */
  duration?: number
  /** Epaisseur du trait, en pixels. @defaultValue 2 */
  width?: number
  /** Couleur du trait. */
  color?: string
  /** Longueur de la trainee, en pourcentage du contour. @defaultValue 25 */
  trail?: number
}

/** Toutes les proprietes. */
export type BorderBeamProps = Customisable<BorderBeamOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-border-beam'

/** Pose l'animation et l'enregistrement d'angle, une fois par document. */
function ensureBeamRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '@property --o-beam-angle{syntax:"<angle>";inherits:false;initial-value:0deg}',
    '@keyframes o-beam{to{--o-beam-angle:360deg}}',
    '[data-o-beam]{position:relative;isolation:isolate}',
    '[data-o-beam]::after{',
    'content:"";position:absolute;inset:0;pointer-events:none;border-radius:inherit;',
    'padding:var(--o-beam-width);',
    'background:conic-gradient(from var(--o-beam-angle),transparent 0%,var(--o-beam-color) var(--o-beam-trail),transparent calc(var(--o-beam-trail) * 2));',
    '-webkit-mask:linear-gradient(black 0 0) content-box,linear-gradient(black 0 0);',
    'mask:linear-gradient(black 0 0) content-box,linear-gradient(black 0 0);',
    '-webkit-mask-composite:xor;mask-composite:exclude;',
    'animation:o-beam var(--o-beam-duration) linear infinite',
    '}',
    '@media (prefers-reduced-motion:reduce){[data-o-beam]::after{animation:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Fait courir un trait le long du contour.
 *
 * @example
 * <BorderBeam className="o-rounded-xl o-border-w-1 o-p-6" duration={6000}>
 *   <p>Une carte mise en avant</p>
 * </BorderBeam>
 */
export function BorderBeam({
  children,
  duration = 4000,
  width = 2,
  color = 'oklch(70% 0.18 264)',
  trail = 25,
  ...rest
}: BorderBeamProps): ReactElement {
  const { reduced } = useMotionState()
  ensureBeamRule()

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      className={className}
      style={
        {
          ...style,
          '--o-beam-duration': `${String(duration)}ms`,
          '--o-beam-width': `${String(width)}px`,
          '--o-beam-color': color,
          '--o-beam-trail': `${String(trail)}%`,
        } as CSSProperties
      }
      data-o-beam={reduced ? undefined : ''}
    >
      {children}
    </div>
  )
}
