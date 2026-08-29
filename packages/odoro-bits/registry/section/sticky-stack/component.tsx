/**
 * Cartes qui se figent et s'empilent au defilement.
 *
 * ## Le collage est natif, et il doit le rester
 *
 * `position: sticky` fait tout le travail de position : la carte suit le
 * defilement jusqu'a son point d'ancrage, puis s'y fige pendant que la
 * suivante monte. Reproduire cela a la main demanderait de mesurer, de
 * calculer, et de reecrire une transformation par image — pour un resultat qui
 * traine d'une image derriere le contenu.
 *
 * Le seul reglage que le natif ne donne pas est la **reduction** de la carte
 * figee quand la suivante la recouvre. C'est ce que la boucle ecrit, et rien
 * d'autre.
 *
 * ## Chaque carte a son propre ancrage
 *
 * Empiler des cartes au meme endroit les ferait disparaitre les unes sous les
 * autres. Chacune s'ancre donc quelques pixels plus bas que la precedente : le
 * bord de celles du dessous reste visible, et l'empilement se lit.
 *
 * @module
 */

import {
  mergePresentation,
  useMotionState,
  useScrollProgress,
  type Customisable,
} from 'odoro-engine'
import {
  Children,
  useCallback,
  useRef,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Proprietes propres au composant. */
export interface StickyStackOwnProps {
  /** Les cartes. */
  children: ReactNode
  /** Distance au haut de la fenetre, en pixels. @defaultValue 96 */
  offset?: number
  /** Decalage visible entre deux cartes empilees, en pixels. @defaultValue 24 */
  gap?: number
  /** Reduction de la carte quand la suivante arrive, de 0 a 0.3. @defaultValue 0.05 */
  shrink?: number
}

/** Toutes les proprietes. */
export type StickyStackProps = Customisable<StickyStackOwnProps>

/** Une carte figee, qui se reduit quand la suivante la recouvre. */
function Card({
  index,
  offset,
  gap,
  shrink,
  reduced,
  children,
}: {
  index: number
  offset: number
  gap: number
  shrink: number
  reduced: boolean
  children: ReactNode
}): ReactElement {
  const inner = useRef<HTMLDivElement | null>(null)

  const onProgress = useCallback(
    (progress: number) => {
      const target = inner.current
      if (target === null) return
      // La reduction ne commence qu'a la seconde moitie de la traversee :
      // avant, la carte n'est pas encore recouverte, et la voir retrecir sans
      // raison se lit comme un defaut.
      const started = Math.max(0, progress * 2 - 1)
      target.style.transform = `scale(${(1 - started * shrink).toFixed(4)})`
    },
    [shrink],
  )

  const { ref } = useScrollProgress<HTMLDivElement>(onProgress, {
    name: 'cartes empilees',
  })

  return (
    <div
      ref={ref}
      className="o-sticky"
      style={{ top: `${String(offset + index * gap)}px` }}
    >
      <div
        ref={inner}
        className={reduced ? undefined : 'o-will-change-transform o-origin-top'}
      >
        {children}
      </div>
    </div>
  )
}

/**
 * Empile des cartes au fil du defilement.
 *
 * @example
 * <StickyStack offset={120} shrink={0.06}>
 *   {etapes.map((etape) => (
 *     <article key={etape.id} className="o-rounded-xl o-border-w-1 o-p-8">
 *       {etape.titre}
 *     </article>
 *   ))}
 * </StickyStack>
 */
export function StickyStack({
  children,
  offset = 96,
  gap = 24,
  shrink = 0.05,
  ...rest
}: StickyStackProps): ReactElement {
  const { reduced } = useMotionState()
  const cards = Children.toArray(children)

  const { className, style } = mergePresentation(
    { className: 'o-flex o-flex-col o-gap-8' },
    rest,
  )

  return (
    <div {...rest} className={className} style={style as CSSProperties}>
      {cards.map((card, index) => (
        <Card
          key={index}
          index={index}
          offset={offset}
          gap={gap}
          shrink={reduced ? 0 : shrink}
          reduced={reduced}
        >
          {card}
        </Card>
      ))}
    </div>
  )
}
