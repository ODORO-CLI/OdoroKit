/**
 * Cartes rebondissantes : un eventail deja ouvert, dont les cartes arrivent
 * en rebondissant une a une, et s'ecartent pour celle qu'on survole.
 *
 * ## Ce qui les distingue des cartes en eventail
 *
 * Les cartes en eventail sont un paquet ferme qui s'ouvre au survol. Ici
 * l'eventail est **l'etat de repos** : il est ouvert des l'arrivee, et c'est
 * l'arrivee qui est l'evenement. Chaque carte tombe en place avec un
 * depassement — elle passe sa position, revient, se pose — decalee de la
 * precedente. Ensuite, survoler une carte la souleve et la redresse, et ses
 * voisines s'ecartent pour lui faire de la place, comme un jeu qu'on etale
 * et dont on tire une carte.
 *
 * ## Le rebond est une courbe, pas une simulation
 *
 * Une courbe de Bezier dont l'ordonnee depasse un — `1.56` au second point
 * de controle — produit exactement un depassement puis un retour. C'est
 * tenu par le compositeur, sans une ligne de JavaScript par image, et
 * interrompre le geste repart de la position courante.
 *
 * ## Les voisines s'ecartent sans JavaScript
 *
 * Le combinateur `~` designe les cartes qui suivent la carte survolee ;
 * `:has(~ :hover)` designe celles qui la precedent. Deux regles, et toute la
 * rangee reagit, sans ecouteur ni etat.
 *
 * ## Le decalage d'arrivee ne doit pas retarder le survol
 *
 * Le delai par carte est pose sur la transition de transformation. Laisse
 * tel quel, il retarderait aussi le soulevement au survol de la derniere
 * carte. Une fois l'arrivee terminee, l'hote passe en etat « pose » et les
 * delais tombent a zero.
 *
 * ## Sous mouvement reduit
 *
 * L'eventail est ouvert, sans trajet ni rebond ; le survol change d'etat
 * sans transition. C'est l'etat final.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { Children, useEffect, useState, type CSSProperties, type ReactElement, type ReactNode } from 'react'

import { useInView } from '@/odoro/hooks/useInView'

/** Proprietes propres au composant. */
export interface BounceCardsOwnProps {
  /** Les cartes, de deux a six. La premiere donne sa taille a la rangee. */
  children: ReactNode
  /** Angle entre deux cartes voisines, en degres. @defaultValue 6 */
  spread?: number
  /** Ecart horizontal entre deux cartes, en pixels. @defaultValue 56 */
  gap?: number
  /** Decalage d'arrivee entre deux cartes, en millisecondes. @defaultValue 90 */
  delay?: number
}

/** Toutes les proprietes. */
export type BounceCardsProps = Customisable<BounceCardsOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-bounce-cards'

/** Duree du trajet d'une carte, en millisecondes. */
const TRAVEL = 640

/** Pose la rangee, l'arrivee et le survol, une fois par document. */
function ensureBounceRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-bounce]{position:relative;display:inline-block}',
    '[data-o-bounce-item]{',
    'position:absolute;inset:0;',
    'transform:var(--o-bounce-rest);transform-origin:50% 110%;',
    // Le second point de controle depasse un : c'est le rebond.
    `transition:transform ${String(TRAVEL)}ms cubic-bezier(0.34,1.56,0.64,1) var(--o-bounce-delay),`,
    'opacity 320ms ease var(--o-bounce-delay);',
    '}',
    '[data-o-bounce-item]:first-child{position:relative}',
    // Avant l'arrivee : plus bas, plus petit, invisible.
    '[data-o-bounce]:not([data-o-bounce-in]) [data-o-bounce-item]{',
    'opacity:0;transform:translateY(72px) scale(0.6);',
    '}',
    // Pose : les delais d'arrivee ne retardent plus le survol.
    '[data-o-bounce-settled] [data-o-bounce-item]{--o-bounce-delay:0ms}',
    '[data-o-bounce-in] [data-o-bounce-item]:hover{transform:var(--o-bounce-up);z-index:10}',
    '[data-o-bounce-in] [data-o-bounce-item]:hover ~ [data-o-bounce-item]{transform:var(--o-bounce-right)}',
    '[data-o-bounce-in] [data-o-bounce-item]:has(~ [data-o-bounce-item]:hover){transform:var(--o-bounce-left)}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-bounce-item]{transition:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Etale des cartes en eventail, avec une arrivee qui rebondit.
 *
 * @example
 * <BounceCards>
 *   <article className="o-w-40 o-rounded-xl o-p-4">Une</article>
 *   <article className="o-w-40 o-rounded-xl o-p-4">Deux</article>
 *   <article className="o-w-40 o-rounded-xl o-p-4">Trois</article>
 * </BounceCards>
 *
 * @example
 * // Plus serre, arrivee plus rapide.
 * <BounceCards spread={4} gap={40} delay={50}>{cartes}</BounceCards>
 */
export function BounceCards({
  children,
  spread = 6,
  gap = 56,
  delay = 90,
  ...rest
}: BounceCardsProps): ReactElement {
  const { reduced } = useMotionState()
  const { ref, vu } = useInView<HTMLDivElement>({ amount: 0.4 })
  const [settled, setSettled] = useState(false)
  ensureBounceRules()

  const cards = Children.toArray(children).slice(0, 6)
  const middle = (cards.length - 1) / 2

  useEffect(() => {
    if (!vu) return
    if (reduced) {
      setSettled(true)
      return
    }
    const timer = window.setTimeout(
      () => setSettled(true),
      TRAVEL + delay * Math.max(cards.length - 1, 0),
    )
    return () => window.clearTimeout(timer)
  }, [vu, reduced, delay, cards.length])

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={ref}
      className={className}
      style={style}
      data-o-bounce=""
      {...(vu ? { 'data-o-bounce-in': '' } : {})}
      {...(settled ? { 'data-o-bounce-settled': '' } : {})}
    >
      {cards.map((card, index) => {
        const offset = index - middle
        const x = offset * gap
        const angle = offset * spread
        const push = gap * 0.45

        return (
          <div
            key={index}
            data-o-bounce-item=""
            style={
              {
                '--o-bounce-delay': `${String(index * delay)}ms`,
                '--o-bounce-rest': `translateX(${String(x)}px) rotate(${String(angle)}deg)`,
                '--o-bounce-up': `translateX(${String(x)}px) translateY(-20px) scale(1.06)`,
                '--o-bounce-right': `translateX(${String(x + push)}px) rotate(${String(angle)}deg)`,
                '--o-bounce-left': `translateX(${String(x - push)}px) rotate(${String(angle)}deg)`,
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
