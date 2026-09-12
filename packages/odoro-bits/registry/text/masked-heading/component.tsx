/**
 * Titre masque : une image visible a travers les lettres, et qui defile.
 *
 * ## Le texte est le masque, l'image est l'encre
 *
 * `background-clip: text` decoupe le fond a la forme des glyphes. Ce n'est pas
 * une superposition : il n'y a qu'un seul element, et les lettres restent des
 * lettres — selectionnables, cherchables, annoncees telles quelles. Aucun
 * decoupage, aucun calque, aucun `aria-label` a maintenir.
 *
 * ## Un balancement, pas une bande sans fin
 *
 * Une image quelconque n'est pas raccordable : la faire defiler en boucle
 * ferait sauter la couture a chaque tour. Le deplacement va donc d'un bord a
 * l'autre puis revient — `alternate` — ce qui n'a aucune couture a montrer.
 * L'image est agrandie au-dela du cadre pour qu'il y ait de quoi parcourir.
 *
 * ## Ce que voit un navigateur qui ne sait pas decouper
 *
 * Tout ce qui rend le texte invisible — le fond, la couleur transparente —
 * vit dans un `@supports`. Sans le decoupage, il ne reste qu'un titre a
 * l'encre courante. L'inverse aurait donne un titre absent.
 *
 * ## L'image ne dit rien
 *
 * Elle est une matiere, pas un contenu : c'est le texte qui porte le sens, et
 * c'est pourquoi il n'y a pas de texte de remplacement a fournir. Une image
 * qui informe n'a pas sa place ici.
 *
 * ## Mouvement reduit
 *
 * Le balancement s'arrete au centre de l'image. Le titre reste rempli : la
 * matiere est l'etat d'arrivee, seul son deplacement etait l'animation.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import {
  type CSSProperties,
  type ElementType,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Proprietes propres au composant. */
export interface MaskedHeadingOwnProps {
  /** Texte du titre. */
  children: ReactNode
  /**
   * Image vue a travers les lettres.
   *
   * Purement decorative : le sens est porte par le texte.
   */
  src: string
  /** Balise rendue. @defaultValue 'span' */
  as?: ElementType
  /**
   * Largeur de l'image, en part de celle du titre.
   *
   * Au-dela de cent pour cent, il reste de quoi parcourir : c'est cette marge
   * que le balancement traverse.
   *
   * @defaultValue 220
   */
  zoom?: number
  /** Duree d'un aller, en millisecondes. @defaultValue 14000 */
  speed?: number
}

/** Toutes les proprietes. */
export type MaskedHeadingProps = Customisable<MaskedHeadingOwnProps, 'span'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-masked-heading'

/** Pose les regles du masque, une fois par document. */
function ensureMaskedRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-masked]{display:inline-block}',
    '@keyframes o-masked-pan{',
    'from{background-position:0% 50%}',
    'to{background-position:100% 50%}',
    '}',
    // Tout ce qui rend le texte invisible vit ici : sans le decoupage, il
    // reste un titre a l'encre courante. Voir l'en-tete.
    '@supports ((-webkit-background-clip:text) or (background-clip:text)){',
    '[data-o-masked]{',
    'background-image:var(--o-masked-image);',
    'background-size:var(--o-masked-zoom) auto;',
    'background-repeat:no-repeat;',
    'background-position:0% 50%;',
    '-webkit-background-clip:text;',
    'background-clip:text;',
    'color:transparent;',
    'animation:o-masked-pan var(--o-masked-speed) ease-in-out infinite alternate;',
    '}',
    '}',
    // Sans mouvement, l'image se pose au centre et n'en bouge plus.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-masked]{animation:none;background-position:50% 50%}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Remplit un titre d'une image qui se balance lentement.
 *
 * @example
 * <MaskedHeading as="h1" src="/textures/beton.jpg" className="o-text-6xl o-font-black">
 *   Matiere
 * </MaskedHeading>
 *
 * @example
 * // Un cadrage serre, un balancement plus vif.
 * <MaskedHeading src="/textures/vagues.jpg" zoom={400} speed={6000}>
 *   Maree
 * </MaskedHeading>
 */
export function MaskedHeading({
  children,
  src,
  as: Tag = 'span',
  zoom = 220,
  speed = 14000,
  ...rest
}: MaskedHeadingProps): ReactElement {
  ensureMaskedRule()

  const { className, style } = mergePresentation({}, rest)

  const styleRacine = {
    ...style,
    // La valeur est posee par la propriete, jamais concatenee dans une
    // feuille : rien de ce que contient l'adresse ne peut devenir du CSS.
    '--o-masked-image': `url(${JSON.stringify(src)})`,
    '--o-masked-zoom': `${String(Math.max(100, zoom))}%`,
    '--o-masked-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <Tag {...rest} className={className} style={styleRacine} data-o-masked="">
      {children}
    </Tag>
  )
}
