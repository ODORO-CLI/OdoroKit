/**
 * Cartes en eventail : un paquet empile qui s'ouvre au survol.
 *
 * ## La premiere carte donne sa taille au paquet
 *
 * Comme pour la carte a retournement, une seule carte reste dans le flux :
 * la premiere. Les autres se posent dessus en absolu. Le paquet occupe donc
 * exactement la place d'une carte, et l'eventail deborde autour — c'est le
 * comportement attendu d'un paquet, pas celui d'une grille.
 *
 * ## Deux transformations par carte, calculees une fois
 *
 * Chaque carte recoit sa position de repos et sa position eventee en
 * variables CSS, calculees au rendu a partir de son rang. La transition
 * fait le trajet entre les deux : interrompre le geste au milieu repart de
 * l'angle courant, sans saut. Aucune boucle, aucun calcul par frame.
 *
 * ## `focus-within` ouvre l'eventail au clavier
 *
 * Le paquet est focusable, et une carte qui contient un lien ou un bouton
 * ouvre l'eventail des que ce lien prend le focus : le contenu range sous
 * la pile reste atteignable sans souris.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { Children, type CSSProperties, type ReactElement, type ReactNode } from 'react'

/** Proprietes propres au composant. */
export interface StackedCardsOwnProps {
  /** Les cartes, jusqu'a quatre. La premiere donne sa taille au paquet. */
  children: ReactNode
  /** Angle entre deux cartes une fois eventees, en degres. @defaultValue 10 */
  spread?: number
  /** Ecart horizontal entre deux cartes une fois eventees, en pixels. @defaultValue 36 */
  lift?: number
}

/** Toutes les proprietes. */
export type StackedCardsProps = Customisable<StackedCardsOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-stacked-cards'

/** Pose le paquet et ses deux etats, une fois par document. */
function ensureStackedRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-stacked]{position:relative;display:inline-block}',
    '[data-o-stacked-item]{',
    'position:absolute;inset:0;',
    'transform:var(--o-stacked-rest);',
    'transform-origin:50% 120%;',
    'transition:transform var(--o-duration-slow) var(--o-ease-emphasized);',
    '}',
    // La premiere carte reste dans le flux : elle donne sa taille au paquet.
    '[data-o-stacked-item]:first-child{position:relative}',
    '[data-o-stacked]:is(:hover,:focus-visible,:focus-within) [data-o-stacked-item]{',
    'transform:var(--o-stacked-fan);',
    '}',
    // Mouvement reduit : l eventail s ouvre, sans trajet.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-stacked-item]{transition:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Empile jusqu'a quatre cartes et les evente au survol ou au focus.
 *
 * @example
 * <StackedCards>
 *   <article className="o-rounded-xl o-border-w-1 o-p-6">Une</article>
 *   <article className="o-rounded-xl o-border-w-1 o-p-6">Deux</article>
 *   <article className="o-rounded-xl o-border-w-1 o-p-6">Trois</article>
 * </StackedCards>
 *
 * @example
 * // Un eventail plus large et plus ecarte.
 * <StackedCards spread={18} lift={64}>{cartes}</StackedCards>
 */
export function StackedCards({
  children,
  spread = 10,
  lift = 36,
  ...rest
}: StackedCardsProps): ReactElement {
  const { reduced } = useMotionState()
  ensureStackedRules()

  const cards = Children.toArray(children).slice(0, 4)
  const middle = (cards.length - 1) / 2

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      tabIndex={0}
      data-o-stacked=""
      className={className}
      style={
        {
          ...style,
          ...(reduced ? { '--o-duration-slow': '0ms' } : {}),
        } as CSSProperties
      }
    >
      {cards.map((card, index) => {
        // Au repos, chaque carte glisse et penche un peu plus que la
        // precedente ; eventee, elle prend sa place autour du centre.
        const rest_ = `translateY(${String(index * -6)}px) rotate(${String(index * 2)}deg)`
        const fan = [
          `translateX(${String((index - middle) * lift)}px)`,
          `translateY(${String(-Math.abs(index - middle) * 8)}px)`,
          `rotate(${String((index - middle) * spread)}deg)`,
        ].join(' ')

        return (
          <div
            key={index}
            data-o-stacked-item=""
            style={
              {
                '--o-stacked-rest': rest_,
                '--o-stacked-fan': fan,
                zIndex: cards.length - index,
              } as CSSProperties
            }
          >
            {card}
          </div>
        )
      })}
    </div>
  )
}
