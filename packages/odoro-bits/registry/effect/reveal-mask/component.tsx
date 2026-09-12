/**
 * Rideau par bandes : le contenu est revele par des bandes verticales qui se
 * retirent en cascade.
 *
 * ## Des surcouches, pas un masque sur le contenu
 *
 * Le contenu est rendu normalement des le premier instant ; ce sont des
 * bandes opaques posees par-dessus qui le cachent, puis remontent l'une apres
 * l'autre. Masquer le contenu lui-meme — opacite, clip — le ferait disparaitre
 * pour les lecteurs d'ecran et pour la recherche dans la page, alors qu'il
 * est la et n'attend que d'etre vu.
 *
 * Chaque bande est lancee par l'API Web Animations avec un delai croissant ;
 * quand la derniere se termine, la surcouche entiere quitte le DOM. Rien ne
 * reste au-dessus du contenu, pas meme d'invisible.
 *
 * ## Le declenchement vient du champ
 *
 * Le rideau attend que la zone entre dans le champ, via le crochet
 * `useInView` — qui s'ouvre de lui-meme si l'observation est impossible : un
 * rideau qui ne se leve jamais est le pire defaut possible.
 *
 * Sous mouvement reduit, la surcouche n'est pas rendue du tout : le contenu
 * est immediatement visible.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useEffect, useState, type ReactElement, type ReactNode } from 'react'

import { useInView } from '@registre/hooks/useInView'

/** Proprietes propres au composant. */
export interface RevealMaskOwnProps {
  /** Contenu a reveler. */
  children: ReactNode
  /** Nombre de bandes. @defaultValue 4 */
  bands?: number
  /** Duree du retrait d'une bande, en millisecondes. @defaultValue 600 */
  duration?: number
  /** Decalage entre deux bandes voisines, en millisecondes. @defaultValue 90 */
  step?: number
  /** Couleur des bandes. @defaultValue le token d'encre */
  color?: string
}

/** Toutes les proprietes. */
export type RevealMaskProps = Customisable<RevealMaskOwnProps>

/**
 * Revele son contenu par bandes, a l'entree dans le champ.
 *
 * Pour rejouer l'animation, remonter le composant — une `key` differente
 * suffit.
 *
 * @example
 * <RevealMask>
 *   <img src={couverture} alt="Couverture du numero 12" />
 * </RevealMask>
 *
 * @example
 * // Six bandes serrees, dans la couleur de marque.
 * <RevealMask bands={6} step={60} color="var(--o-palette-brand-500)">
 *   <article className="o-p-8">…</article>
 * </RevealMask>
 */
export function RevealMask({
  children,
  bands = 4,
  duration = 600,
  step = 90,
  color = 'var(--o-theme-bg, currentColor)',
  ...rest
}: RevealMaskProps): ReactElement {
  const { reduced } = useMotionState()
  const { ref, vu } = useInView<HTMLDivElement>()
  const [veil, setVeil] = useState<HTMLDivElement | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (veil === null || !vu) return

    const strips = veil.querySelectorAll('[data-o-reveal-band]')
    let finished = 0
    const animations: Animation[] = []

    strips.forEach((strip, index) => {
      const animation = strip.animate(
        // Un cran au-dela de 100% : un sous-pixel de bande qui traine se
        // voit comme un fil sombre en haut du contenu.
        [{ transform: 'translateY(0)' }, { transform: 'translateY(-101%)' }],
        {
          duration,
          delay: index * step,
          easing: 'cubic-bezier(0.2, 0, 0, 1)',
          fill: 'forwards',
        },
      )
      animation.onfinish = () => {
        finished += 1
        // La surcouche ne part que lorsque la derniere bande est levee :
        // la retirer bande par bande ferait autant de rendus React.
        if (finished === strips.length) setDone(true)
      }
      animations.push(animation)
    })

    return () => {
      for (const animation of animations) animation.cancel()
    }
  }, [veil, vu, duration, step])

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={ref}
      className={className}
      style={{ position: 'relative', overflow: 'hidden', ...style }}
    >
      {children}
      {/* Sous mouvement reduit, pas de rideau du tout ; une fois leve, il
          quitte le DOM. */}
      {reduced || done ? null : (
        <div
          aria-hidden
          ref={setVeil}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            gridTemplateColumns: `repeat(${String(Math.max(1, Math.round(bands)))}, 1fr)`,
            pointerEvents: 'none',
          }}
        >
          {Array.from({ length: Math.max(1, Math.round(bands)) }, (_, index) => (
            <span key={index} data-o-reveal-band="" style={{ background: color }} />
          ))}
        </div>
      )}
    </div>
  )
}
