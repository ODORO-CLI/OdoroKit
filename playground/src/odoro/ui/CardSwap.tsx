/**
 * Echange de cartes : une pile dont la carte de devant saute a l'arriere a
 * intervalle regulier, et les autres avancent d'un rang.
 *
 * ## Le rang est un etat, la position en decoule
 *
 * Chaque carte connait son rang — zero devant, puis un, deux — et le rang
 * donne une transformation : un peu plus haut, un peu plus a droite, un peu
 * plus petit a chaque cran. L'echange n'est qu'un decalage de l'index de
 * tete, un rendu React toutes les quelques secondes, jamais par image. Les
 * transitions font le trajet entre deux rangs.
 *
 * ## La carte qui part fait un saut, les autres glissent
 *
 * Un simple echange de transformations ferait traverser la carte de devant
 * au travers de la pile. Elle recoit donc une animation a trois temps :
 * elle descend hors de la pile, passe sous elle, et remonte a l'arriere.
 * Les images cles lisent ses deux positions en variables, si bien que la
 * meme animation sert quel que soit le nombre de cartes. Son plan passe a
 * l'arriere des le depart : au moment ou elle remonte, elle est deja sous
 * les autres.
 *
 * ## La pile se fige sous le pointeur
 *
 * Une pile qui echange ses cartes pendant qu'on lit celle de devant est une
 * pile qu'on ne peut pas lire. Le survol, et le focus d'un element de la
 * carte, suspendent l'intervalle.
 *
 * ## Sous mouvement reduit
 *
 * La pile est posee et ne tourne plus. Un echange qui se rejoue en boucle
 * n'a pas d'etat final ; l'etat de repos est la pile elle-meme.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  Children,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Proprietes propres au composant. */
export interface CardSwapOwnProps {
  /** Les cartes, de deux a cinq. La premiere donne sa taille a la pile. */
  children: ReactNode
  /** Temps entre deux echanges, en millisecondes. @defaultValue 3000 */
  interval?: number
  /** Duree d'un echange, en millisecondes. @defaultValue 700 */
  duration?: number
  /** Decalage entre deux rangs, en pixels. @defaultValue 16 */
  offset?: number
}

/** Toutes les proprietes. */
export type CardSwapProps = Customisable<CardSwapOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-card-swap'

/** Pose la pile et le saut, une fois par document. */
function ensureSwapRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-swap]{position:relative;display:inline-block}',
    '[data-o-swap-item]{',
    'position:absolute;inset:0;',
    'transform:var(--o-swap-to);transform-origin:50% 100%;',
    'transition:transform var(--o-swap-duration) cubic-bezier(0.2,0,0,1),',
    'opacity var(--o-swap-duration) linear;',
    '}',
    '[data-o-swap-item]:first-child{position:relative}',
    // La carte qui part : trois temps, lus dans ses deux variables.
    '[data-o-swap-item][data-o-swap-out]{',
    'transition:none;',
    'animation:o-card-swap-hop var(--o-swap-duration) cubic-bezier(0.2,0,0,1) both;',
    '}',
    '@keyframes o-card-swap-hop{',
    '0%{transform:var(--o-swap-from)}',
    '45%{transform:translateY(var(--o-swap-drop)) scale(0.96)}',
    '100%{transform:var(--o-swap-to)}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-swap-item]{transition:none;animation:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Fait tourner une pile de cartes, la premiere passant a l'arriere.
 *
 * @example
 * <CardSwap>
 *   <article className="o-w-64 o-rounded-xl o-p-6">Une</article>
 *   <article className="o-w-64 o-rounded-xl o-p-6">Deux</article>
 *   <article className="o-w-64 o-rounded-xl o-p-6">Trois</article>
 * </CardSwap>
 *
 * @example
 * // Plus lent, pile plus etalee.
 * <CardSwap interval={5000} offset={24}>{cartes}</CardSwap>
 */
export function CardSwap({
  children,
  interval = 3000,
  duration = 700,
  offset = 16,
  ...rest
}: CardSwapProps): ReactElement {
  const { reduced } = useMotionState()
  const [head, setHead] = useState(0)
  const [leaving, setLeaving] = useState<number | null>(null)
  const previous = useRef(0)
  const paused = useRef(false)
  ensureSwapRules()

  const cards = Children.toArray(children).slice(0, 5)
  const count = cards.length

  useEffect(() => {
    if (reduced || count < 2) return

    const timer = window.setInterval(
      () => {
        if (paused.current) return
        setHead((value) => (value + 1) % count)
      },
      Math.max(interval, duration + 100),
    )

    return () => window.clearInterval(timer)
  }, [reduced, count, interval, duration])

  // La carte qui vient de quitter la tete fait son saut, puis redevient une
  // carte ordinaire de la pile une fois le trajet fini.
  useEffect(() => {
    if (head === previous.current) return
    setLeaving(previous.current)
    previous.current = head
    const timer = window.setTimeout(() => setLeaving(null), duration)
    return () => window.clearTimeout(timer)
  }, [head, duration])

  const { className, style } = mergePresentation({}, rest)

  const place = (rank: number): string =>
    [
      `translateX(${String(rank * offset * 0.8)}px)`,
      `translateY(${String(rank * -offset)}px)`,
      `scale(${(1 - rank * 0.05).toFixed(3)})`,
    ].join(' ')

  return (
    <div
      {...rest}
      className={className}
      style={
        {
          ...style,
          '--o-swap-duration': `${String(reduced ? 0 : duration)}ms`,
        } as CSSProperties
      }
      data-o-swap=""
      onPointerEnter={(event) => {
        paused.current = true
        rest.onPointerEnter?.(event)
      }}
      onPointerLeave={(event) => {
        paused.current = false
        rest.onPointerLeave?.(event)
      }}
      onFocus={(event) => {
        paused.current = true
        rest.onFocus?.(event)
      }}
      onBlur={(event) => {
        paused.current = false
        rest.onBlur?.(event)
      }}
    >
      {cards.map((card, index) => {
        const rank = (index - head + count) % count
        const out = leaving === index

        return (
          <div
            key={index}
            data-o-swap-item=""
            {...(out ? { 'data-o-swap-out': '' } : {})}
            {...(rank === 0 ? {} : { 'aria-hidden': true })}
            style={
              {
                '--o-swap-from': place(0),
                '--o-swap-to': place(rank),
                '--o-swap-drop': `${String(offset * 4 + 40)}px`,
                zIndex: count - rank,
                opacity: 1 - rank * 0.12,
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
