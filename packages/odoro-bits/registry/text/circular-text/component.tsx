/**
 * Texte en cercle : une phrase posee sur un anneau qui tourne sans fin.
 *
 * ## Un `textPath`, pas des lettres placees une a une
 *
 * Poser chaque lettre soi-meme — un element par caractere, une rotation par
 * element — refait a la main ce que SVG sait faire nativement : `textPath`
 * suit le trace, gere l'espacement, et ne coute qu'un noeud. La rotation est
 * une animation CSS sur le SVG entier, tenue par le compositeur ; apres le
 * premier rendu, plus rien ne s'execute.
 *
 * ## Le cercle est une image, le texte est ailleurs
 *
 * Un texte enroule se lit mal a l'oeil et pas du tout a l'oreille : un
 * lecteur d'ecran qui plonge dans le SVG en sortirait une bouillie. Le SVG
 * entier est donc `aria-hidden`, et le texte complet vit en parallele dans un
 * element visuellement masque.
 *
 * Sous mouvement reduit, l'anneau reste — c'est de la mise en page — mais ne
 * tourne plus.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useId, type CSSProperties, type ElementType, type ReactElement } from 'react'

/** Proprietes propres au composant. */
export interface CircularTextOwnProps {
  /** Texte a enrouler. */
  children: string
  /** Balise rendue. @defaultValue 'span' */
  as?: ElementType
  /** Diametre de l'anneau, en pixels. @defaultValue 160 */
  size?: number
  /** Duree d'un tour complet, en secondes. @defaultValue 12 */
  speed?: number
  /** Tourner dans le sens inverse. @defaultValue false */
  reverse?: boolean
}

/** Toutes les proprietes. */
export type CircularTextProps = Customisable<CircularTextOwnProps, 'span'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-circular-text'

/** Pose la rotation, une fois par document. */
function ensureCircularRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '@keyframes o-circular-spin{to{transform:rotate(360deg)}}',
    '[data-o-circular]{',
    'display:block;',
    'animation:o-circular-spin var(--o-circular-speed) linear infinite;',
    'animation-direction:var(--o-circular-direction);',
    '}',
    // La preference du systeme est respectee meme si l'etat du moteur n'a pas
    // encore ete lu : la feuille sait l'arreter toute seule.
    '@media (prefers-reduced-motion:reduce){[data-o-circular]{animation:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Enroule un texte sur un cercle qui tourne en continu.
 *
 * @example
 * <CircularText size={180}>
 *   DEPUIS 2012 · FAIT MAIN · DEPUIS 2012 · FAIT MAIN ·
 * </CircularText>
 *
 * @example
 * // Petit badge, rotation lente en sens inverse.
 * <CircularText size={110} speed={24} reverse>
 *   OUVERT TOUS LES JOURS ·
 * </CircularText>
 */
export function CircularText({
  children,
  as: Tag = 'span',
  size = 160,
  speed = 12,
  reverse = false,
  ...rest
}: CircularTextProps): ReactElement {
  const { reduced } = useMotionState()
  const pathId = useId()
  ensureCircularRule()

  const { className, style } = mergePresentation({}, rest)

  const svgStyle = {
    '--o-circular-speed': `${String(speed)}s`,
    '--o-circular-direction': reverse ? 'reverse' : 'normal',
  } as CSSProperties

  return (
    <Tag
      {...rest}
      className={className}
      style={{
        display: 'inline-block',
        width: `${String(size)}px`,
        height: `${String(size)}px`,
        ...style,
      }}
    >
      {/* Le texte, d'un seul tenant, pour les lecteurs d'ecran. */}
      <span className="o-sr-only">{children}</span>
      <svg
        aria-hidden
        viewBox="0 0 100 100"
        width="100%"
        height="100%"
        // Sous mouvement reduit l'attribut n'est pas pose : l'anneau est la,
        // immobile, et la feuille n'a rien a animer.
        {...(reduced ? {} : { 'data-o-circular': '' })}
        style={reduced ? undefined : svgStyle}
      >
        <defs>
          {/* Un cercle de rayon 38 : assez de marge pour que les lettres ne
              sortent pas de la boite quand la police deborde du trace. */}
          <path
            id={pathId}
            d="M 50 12 a 38 38 0 1 1 -0.01 0"
            fill="none"
          />
        </defs>
        <text fill="currentColor" fontSize="11" letterSpacing="1.5">
          <textPath href={`#${pathId}`}>{children}</textPath>
        </text>
      </svg>
    </Tag>
  )
}
