/**
 * Parallaxe : un element qui se deplace moins vite que la page.
 *
 * ## Pourquoi la boucle unique et pas un ecouteur de defilement
 *
 * Un ecouteur de `scroll` se declenche a un rythme decide par le navigateur,
 * qui n'est pas celui du rafraichissement de l'ecran. Ecrire une transformation
 * depuis cet ecouteur produit un decalage d'une image sur deux : l'element
 * traine derriere le contenu, puis le rattrape. C'est le tremblement
 * caracteristique des parallaxes faites a la main.
 *
 * La lecture passe donc par la boucle unique du moteur, qui la place avant le
 * rendu de la meme image.
 *
 * ## Sous mouvement reduit
 *
 * L'element reste a sa place. Une parallaxe n'a pas d'etat final a preserver :
 * elle n'apporte rien d'autre que son mouvement.
 *
 * @module
 */

import {
  mergePresentation,
  useMotionState,
  useScrollProgress,
  type Customisable,
} from 'odoro-engine'
import { useCallback, useRef, type ReactElement, type ReactNode } from 'react'

/** Proprietes propres au composant. */
export interface ParallaxOwnProps {
  /** Contenu deplace. */
  children: ReactNode
  /** Amplitude du deplacement sur toute la traversee, en pixels. @defaultValue 80 */
  distance?: number
  /** Axe du deplacement. @defaultValue 'y' */
  axis?: 'x' | 'y'
  /** Agrandissement additionnel, de 0 a 1. @defaultValue 0 */
  scale?: number
}

/** Toutes les proprietes. */
export type ParallaxProps = Customisable<ParallaxOwnProps>

/**
 * Deplace un contenu au fil du defilement.
 *
 * @example
 * <div className="o-relative o-h-96 o-overflow-hidden">
 *   <Parallax distance={120} scale={0.15} className="o-absolute o-inset-0">
 *     <img src="/photo.jpg" alt="" className="o-size-full o-object-cover" />
 *   </Parallax>
 * </div>
 */
export function Parallax({
  children,
  distance = 80,
  axis = 'y',
  scale = 0,
  ...rest
}: ParallaxProps): ReactElement {
  const { reduced } = useMotionState()
  const inner = useRef<HTMLDivElement | null>(null)

  const onProgress = useCallback(
    (progress: number) => {
      const target = inner.current
      if (target === null) return

      // La progression va de 0 a 1 sur la traversee ; on la ramene a [-1, 1]
      // pour que l'element soit a sa place quand il est au centre du champ.
      const centred = progress * 2 - 1
      const shift = (-centred * distance) / 2
      const zoom = 1 + scale * (1 - Math.abs(centred))

      target.style.transform =
        axis === 'y'
          ? `translate3d(0,${shift.toFixed(2)}px,0) scale(${zoom.toFixed(3)})`
          : `translate3d(${shift.toFixed(2)}px,0,0) scale(${zoom.toFixed(3)})`
    },
    [distance, axis, scale],
  )

  const { ref } = useScrollProgress<HTMLDivElement>(onProgress, {
    name: 'parallaxe',
  })

  const { className, style } = mergePresentation(
    { className: 'o-will-change-transform' },
    rest,
  )

  return (
    <div {...rest} ref={ref} className={className} style={style}>
      <div ref={inner} className={reduced ? undefined : 'o-will-change-transform'}>
        {children}
      </div>
    </div>
  )
}
