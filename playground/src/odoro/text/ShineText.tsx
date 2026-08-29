/**
 * Reflet : une bande claire traverse le texte, en boucle.
 *
 * ## Zero JavaScript a l'execution
 *
 * L'effet tient dans un degrade decoupe sur la forme des lettres, dont la
 * position est animee. Le compositeur du navigateur s'en charge seul : aucune
 * boucle, aucun abonnement, aucun rendu React apres le premier.
 *
 * C'est la demonstration de la frontiere posee par le moteur. Cet effet est
 * visuellement proche de ce qu'un shader ferait, et il ne demande pas une
 * ligne de moteur — parce qu'il ne recalcule rien : il decrit une animation
 * une fois, puis se tait.
 *
 * ## La contrepartie du decoupage
 *
 * `background-clip: text` peint le texte avec le fond, ce qui suppose de
 * rendre la couleur du texte transparente. Un navigateur qui ne saurait pas le
 * faire afficherait donc un texte invisible — pas « sans reflet »,
 * **invisible**.
 *
 * La regle est donc posee derriere une requete de support. Sans elle, le texte
 * garde sa couleur et perd seulement son reflet, ce qui est le bon sens de la
 * degradation.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useId, type CSSProperties, type ElementType, type ReactElement } from 'react'

/** Proprietes propres au composant. */
export interface ShineTextOwnProps {
  /** Texte a habiller. */
  children: string
  /** Balise rendue. @defaultValue 'span' */
  as?: ElementType
  /** Couleur du texte au repos. Par defaut, celle heritee. */
  from?: string
  /** Couleur du reflet. @defaultValue blanc */
  shine?: string
  /** Duree d'un passage, en millisecondes. @defaultValue 3000 */
  duration?: number
  /** Largeur du reflet, en pourcentage de la largeur du texte. @defaultValue 30 */
  width?: number
}

/** Toutes les proprietes. */
export type ShineTextProps = Customisable<ShineTextOwnProps, 'span'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-shine-text'

/**
 * Pose l'animation, une fois par document.
 *
 * Le decoupage est enferme dans une requete de support : la ou il n'est pas
 * compris, le texte garde sa couleur et perd seulement son reflet.
 */
function ensureShineRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '@keyframes o-shine{from{background-position:200% 0}to{background-position:-200% 0}}',
    '@supports (background-clip:text) or (-webkit-background-clip:text){',
    '[data-o-shine]{',
    'background-image:linear-gradient(100deg,var(--o-shine-from) 40%,var(--o-shine-color) 50%,var(--o-shine-from) 60%);',
    'background-size:300% 100%;',
    '-webkit-background-clip:text;background-clip:text;',
    'color:transparent;-webkit-text-fill-color:transparent;',
    'animation:o-shine var(--o-shine-duration) linear infinite;',
    '}}',
    '@media (prefers-reduced-motion:reduce){[data-o-shine]{animation:none;background-position:50% 0}}',
  ].join('')
  document.head.append(style)
}

/**
 * Fait passer un reflet sur un texte.
 *
 * @example
 * <ShineText as="h1" className="o-text-5xl o-font-extrabold">
 *   Odoro
 * </ShineText>
 *
 * @example
 * // Les couleurs sont libres : ce sont des valeurs, pas des roles.
 * <ShineText from="var(--o-palette-zinc-500)" shine="var(--o-palette-amber-300)">
 *   Nouveaute
 * </ShineText>
 */
export function ShineText({
  children,
  as: Tag = 'span',
  from = 'currentColor',
  shine = 'oklch(100% 0 0)',
  duration = 3000,
  width = 30,
  ...rest
}: ShineTextProps): ReactElement {
  const { reduced } = useMotionState()
  useId()
  ensureShineRule()

  const { className, style } = mergePresentation({}, rest)

  const shineStyle = {
    ...style,
    '--o-shine-from': from,
    '--o-shine-color': shine,
    '--o-shine-duration': `${String(duration)}ms`,
    // La largeur du reflet joue sur l'ecart entre les deux jalons sombres du
    // degrade : plus ils se rapprochent, plus la bande est etroite.
    '--o-shine-width': `${String(width)}%`,
  } as CSSProperties

  return (
    <Tag
      {...rest}
      className={className}
      style={shineStyle}
      data-o-shine={reduced ? undefined : ''}
    >
      {children}
    </Tag>
  )
}
