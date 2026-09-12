/**
 * Texte en attente, balaye : un mot eteint qu'une bande de pleine encre
 * traverse en boucle.
 *
 * ## Le texte est eteint, pas le reflet
 *
 * Un reflet sur un titre ajoute une lueur a un texte deja plein : c'est un
 * ornement. Ici c'est l'inverse, et c'est ce qui en fait un etat d'attente :
 * le texte est peint a un tiers de son encre, et la seule chose pleine est la
 * bande qui le traverse. Tant qu'elle passe, le mot n'est pas « la ». Le
 * meme mecanisme, lu a l'envers, dit une autre chose.
 *
 * Le degrade est le fond de l'element, decoupe par ses glyphes ; seule sa
 * position bouge. La bande est etroite et ses bords sont doux : une bande
 * franche se lirait comme un curseur, et un curseur promet une position.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran.
 * Le texte peint est retire de l'arbre d'accessibilite, parce que sa couleur
 * est transparente : il ne serait annonce que comme un doublon du libelle.
 *
 * Sous mouvement reduit, le texte revient a sa pleine encre, sans bande :
 * un mot eteint et fige ne dirait plus l'attente, il dirait « desactive ».
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-text-shimmer-loader'

/** Pose le texte eteint et sa bande, une fois par document. */
function ensureTextShimmerLoaderRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-tsl]{',
    'display:inline-block;white-space:nowrap;font-weight:600;',
    'font-size:var(--o-tsl-size);color:var(--o-tsl-color);',
    '}',
    '[data-o-tsl-text]{',
    'display:inline-block;',
    // Le fond porte l'encre : le texte lui-meme est transparent et ne sert
    // que de pochoir. La bande est a 50 % de l'image, ses bords a 12 %
    // de part et d'autre.
    '--o-tsl-dim:color-mix(in oklab,var(--o-tsl-color) 32%,transparent);',
    'background-image:linear-gradient(100deg,var(--o-tsl-dim) 0 38%,var(--o-tsl-color) 50%,var(--o-tsl-dim) 62% 100%);',
    'background-size:250% 100%;background-repeat:no-repeat;',
    '-webkit-background-clip:text;background-clip:text;',
    'color:transparent;',
    'animation:o-tsl-sweep var(--o-tsl-speed) linear infinite;',
    '}',
    // De 100 % a 0 % : l'image glisse vers la droite, la bande traverse le
    // mot de gauche a droite.
    '@keyframes o-tsl-sweep{from{background-position:100% 0}to{background-position:0% 0}}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-tsl-text]{animation:none;background-image:none;color:var(--o-tsl-color)}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface TextShimmerLoaderOwnProps {
  /** Le texte affiche. @defaultValue 'Chargement' */
  text?: string
  /** Corps du texte, en pixels. @defaultValue 16 */
  size?: number
  /** Duree d'un passage de la bande, en millisecondes. @defaultValue 1800 */
  speed?: number
  /** Couleur du texte et de la bande. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type TextShimmerLoaderProps = Customisable<TextShimmerLoaderOwnProps, 'span'>

/**
 * Signale une attente par un texte eteint qu'une bande d'encre traverse.
 *
 * @example
 * <TextShimmerLoader />
 *
 * @example
 * // Plus grand, plus lent, dans la teinte de marque.
 * <TextShimmerLoader size={24} speed={2600} color="var(--o-palette-brand-500)" />
 */
export function TextShimmerLoader({
  text = 'Chargement',
  size = 16,
  speed = 1800,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: TextShimmerLoaderProps): ReactElement {
  ensureTextShimmerLoaderRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-tsl-size': `${String(size)}px`,
    '--o-tsl-speed': `${String(speed)}ms`,
    '--o-tsl-color': color,
  } as CSSProperties

  return (
    <span {...rest} className={className} style={loaderStyle} data-o-tsl="" role="status">
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-tsl-text="">
        {text}
      </span>
    </span>
  )
}
