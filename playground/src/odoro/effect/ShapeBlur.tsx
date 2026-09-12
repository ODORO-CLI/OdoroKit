/**
 * Silhouette geometrique floue qui suit le pointeur sous le contenu.
 *
 * ## Ce qui la distingue d'un halo
 *
 * Un halo est un degrade radial : il n'a pas de forme, seulement un centre.
 * Ici, la tache garde une **silhouette** — un hexagone, un triangle — que le
 * flou adoucit sans la faire disparaitre. C'est ce qui la rend utilisable
 * comme decor de section plutot que comme curseur : on reconnait une forme,
 * pas une lampe.
 *
 * ## Un decoupage puis un flou, pas une image
 *
 * La silhouette est un simple bloc de couleur, decoupe par un trace et floute
 * par le compositeur. Une image ou un trace vectoriel donneraient le meme
 * dessin pour bien plus cher : le decoupage est une propriete que le
 * navigateur applique au moment de peindre, et le flou une operation qu'il
 * confie deja au processeur graphique.
 *
 * ## Le retard fait partie de l'effet
 *
 * La forme est amortie par le crochet de pointeur : elle traine derriere la
 * main, ce qui lui donne du poids. Sans amortissement, une masse de deux cents
 * pixels collee au curseur donnerait un mouvement nerveux et desagreable.
 *
 * ## Sous mouvement reduit
 *
 * Le crochet reste au repos, donc la forme se pose au centre de la zone et n'en
 * bouge plus : c'est bien l'etat final, et le decor demeure.
 *
 * @module
 */

import {
  CLOCK_PRIORITY,
  clock,
  mergePresentation,
  useMotionState,
  type Customisable,
} from '@odoro-cli/engine'
import { useEffect, useRef, useState, type ReactElement, type ReactNode } from 'react'

import { usePointerDamped } from '@/odoro/hooks/usePointerDamped'

/** Silhouettes disponibles. */
export type BlurShape = 'circle' | 'square' | 'triangle' | 'hexagon'

/** Proprietes propres au composant. */
export interface ShapeBlurOwnProps {
  /** Contenu pose sur la forme. */
  children: ReactNode
  /** Silhouette employee. @defaultValue 'hexagon' */
  shape?: BlurShape
  /** Cote de la silhouette, en pixels. @defaultValue 240 */
  size?: number
  /** Flou applique a la silhouette, en pixels. @defaultValue 44 */
  blur?: number
  /** Vitesse de rattrapage du pointeur. @defaultValue 2 */
  speed?: number
  /** Couleur de la silhouette. @defaultValue la teinte de marque */
  color?: string
}

/** Toutes les proprietes. */
export type ShapeBlurProps = Customisable<ShapeBlurOwnProps>

/** Traces de decoupe, un par silhouette. */
const CLIPS: Readonly<Record<BlurShape, string | undefined>> = {
  circle: 'circle(50% at 50% 50%)',
  square: undefined,
  triangle: 'polygon(50% 0%, 100% 100%, 0% 100%)',
  hexagon: 'polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)',
}

/**
 * Fait deriver une forme floue sous son contenu.
 *
 * @example
 * <ShapeBlur className="o-rounded-2xl o-p-12">
 *   <h2>Une section</h2>
 * </ShapeBlur>
 *
 * @example
 * // Un triangle net et lourd, dans une autre teinte.
 * <ShapeBlur shape="triangle" blur={12} speed={1} color="var(--o-palette-sky-400)">
 *   <p>…</p>
 * </ShapeBlur>
 */
export function ShapeBlur({
  children,
  shape = 'hexagon',
  size = 240,
  blur = 44,
  speed = 2,
  color = 'var(--o-palette-brand-500)',
  ...rest
}: ShapeBlurProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLDivElement | null>(null)
  const mark = useRef<HTMLSpanElement | null>(null)

  const pointer = usePointerDamped({ host, speed, name: 'forme floue' })

  useEffect(() => {
    if (host === null) return

    const place = (): void => {
      const target = mark.current
      if (target === null) return

      // La position rendue par le crochet est centree sur zero et bornee a
      // un ; la zone la ramene en pixels, et la moitie du cote recentre la
      // forme sur le point suivi.
      const box = host.getBoundingClientRect()
      const x = ((pointer.current.x + 1) / 2) * box.width - size / 2
      const y = ((pointer.current.y + 1) / 2) * box.height - size / 2

      target.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0)`
    }

    // Sans mouvement, le crochet reste au repos : la forme est posee une fois
    // au centre, et aucune boucle ne recopie la meme valeur soixante fois par
    // seconde.
    if (reduced) {
      place()
      return
    }

    const subscription = clock.subscribe(place, {
      priority: CLOCK_PRIORITY.render,
      name: 'forme floue',
    })

    return () => subscription.unsubscribe()
  }, [host, pointer, size, reduced])

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden o-isolate' },
    rest,
  )

  return (
    <div {...rest} ref={setHost} className={className} style={style}>
      <span
        aria-hidden
        ref={mark}
        className="o-absolute o-pointer-events-none o-will-change-transform"
        style={{
          top: 0,
          left: 0,
          width: `${String(size)}px`,
          height: `${String(size)}px`,
          backgroundColor: color,
          clipPath: CLIPS[shape],
          filter: `blur(${String(blur)}px)`,
          // Sous le contenu, jamais devant : la forme est un decor, et le
          // texte doit rester net par-dessus.
          zIndex: -1,
        }}
      />
      {children}
    </div>
  )
}
