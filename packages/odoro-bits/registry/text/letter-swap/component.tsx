/**
 * Lettres permutees : au survol, chaque lettre glisse vers le haut et sa
 * doublure prend sa place — l'effet des menus de studios.
 *
 * ## Deux copies dans un masque, une transition, rien d'autre
 *
 * Chaque lettre vit dans une cellule a `overflow: hidden` : l'originale en
 * place, la doublure juste en dessous, hors du masque. Le survol translate la
 * colonne d'une hauteur de lettre — la doublure monte, l'originale sort. Tout
 * est transition CSS ; le retrait du pointeur rejoue le trajet a l'envers,
 * gratuitement. Le delai croissant de gauche a droite fait courir une vague
 * le long du mot.
 *
 * ## Le survol du lien, pas seulement du texte
 *
 * L'effet vit dans des menus : ce qui est survole, c'est le lien, dont le
 * texte n'occupe qu'une partie. Les regles ecoutent donc aussi le `:hover` et
 * le `:focus-visible` de l'element interactif qui enveloppe le composant —
 * un clavier declenche la meme vague qu'une souris.
 *
 * ## Le decoupage est un artifice d'affichage
 *
 * Le texte est eclate en lettres, et chaque lettre existe deux fois. Le
 * conteneur porte donc le texte complet en `aria-label`, et les cellules sont
 * retirees de l'arbre d'accessibilite.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ElementType, type ReactElement } from 'react'

/** Proprietes propres au composant. */
export interface LetterSwapOwnProps {
  /** Texte a permuter. */
  children: string
  /** Balise rendue. @defaultValue 'span' */
  as?: ElementType
  /** Delai entre deux lettres, en millisecondes. @defaultValue 25 */
  step?: number
  /** Duree du glissement d'une lettre, en millisecondes. @defaultValue 350 */
  duration?: number
}

/** Toutes les proprietes. */
export type LetterSwapProps = Customisable<LetterSwapOwnProps, 'span'>

/** Espace insecable : une espace ordinaire s'ecrase dans un bloc en ligne. */
const NBSP = '\u00A0'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-letter-swap'

/** Pose les regles de la permutation, une fois par document. */
function ensureSwapRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-swap]{display:inline-block}',
    '[data-o-swap-cell]{display:inline-block;overflow:hidden;vertical-align:top}',
    '[data-o-swap-col]{',
    'display:block;position:relative;',
    'transition:transform var(--o-swap-duration) cubic-bezier(0.2,0,0,1);',
    'transition-delay:var(--o-swap-delay);',
    '}',
    '[data-o-swap-double]{position:absolute;top:100%;left:0}',
    // Le survol du composant, ou celui du lien qui l'enveloppe. Un clavier
    // passe par le focus et obtient la meme vague.
    '[data-o-swap]:hover [data-o-swap-col],',
    '[data-o-swap]:focus-visible [data-o-swap-col],',
    ':where(a,button):hover [data-o-swap] [data-o-swap-col],',
    ':where(a,button):focus-visible [data-o-swap] [data-o-swap-col]{',
    'transform:translateY(-100%);',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Permute les lettres d'un texte au survol ou au focus.
 *
 * @example
 * <a href="/travaux" className="o-text-2xl o-font-bold">
 *   <LetterSwap>Travaux</LetterSwap>
 * </a>
 *
 * @example
 * // Une vague plus lente, plus marquee.
 * <LetterSwap step={60} duration={500}>Studio</LetterSwap>
 */
export function LetterSwap({
  children,
  as: Tag = 'span',
  step = 25,
  duration = 350,
  ...rest
}: LetterSwapProps): ReactElement {
  const { reduced } = useMotionState()
  ensureSwapRule()

  const { className, style } = mergePresentation({}, rest)

  // Mouvement reduit : le texte est rendu tel quel, sans decoupage — la
  // permutation n'apportait que le geste.
  if (reduced) {
    return (
      <Tag {...rest} className={className} style={style}>
        {children}
      </Tag>
    )
  }

  const letters = [...children]

  const swapStyle = {
    ...style,
    '--o-swap-duration': `${String(duration)}ms`,
  } as CSSProperties

  return (
    <Tag
      {...rest}
      className={className}
      style={swapStyle}
      role="text"
      aria-label={children}
      data-o-swap=""
    >
      {letters.map((letter, index) => {
        const shown = letter === ' ' ? NBSP : letter
        return (
          <span
            key={`${letter}-${String(index)}`}
            aria-hidden
            data-o-swap-cell=""
            style={
              {
                '--o-swap-delay': `${String(index * step)}ms`,
              } as CSSProperties
            }
          >
            <span data-o-swap-col="">
              {shown}
              <span data-o-swap-double="">{shown}</span>
            </span>
          </span>
        )
      })}
    </Tag>
  )
}
