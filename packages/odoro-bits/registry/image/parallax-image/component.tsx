/**
 * Image en parallaxe : elle glisse dans son cadre pendant le defilement.
 *
 * ## L'image est plus haute que le cadre
 *
 * C'est toute la mecanique : l'image deborde de son cadre d'une marge
 * proportionnelle a la force demandee, et une translation verticale promene
 * cette marge pendant la traversee du champ. Le cadre, lui, garde son rapport
 * fige et ne decouvre jamais le fond — la geometrie le garantit, pas un
 * calcul.
 *
 * ## Pourquoi la boucle unique et pas un ecouteur de defilement
 *
 * Un ecouteur de `scroll` se declenche a un rythme decide par le navigateur,
 * qui n'est pas celui du rafraichissement. Ecrire une transformation depuis
 * cet ecouteur produit le tremblement caracteristique des parallaxes faites a
 * la main. La mesure passe donc par l'horloge du moteur, avant le rendu de la
 * meme image : un rectangle lu, une transformation ecrite, aucun rendu React.
 *
 * La progression est mesuree contre le premier ancetre qui defile vraiment,
 * et non contre la fenetre : posee dans un panneau a defilement interne,
 * l'image bouge quand ce panneau bouge.
 *
 * ## Sous mouvement reduit
 *
 * L'image reste immobile, cadree plein cadre : une parallaxe n'a pas d'etat
 * final a preserver, elle n'apporte rien d'autre que son mouvement.
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
import { useEffect, useRef, type CSSProperties, type ReactElement } from 'react'

/** Part de la hauteur du cadre reservee au debordement, a force 1. */
const OVERSCAN = 0.15

/** Premier ancetre dont le contenu defile reellement. */
function scrollParentOf(element: HTMLElement): HTMLElement | null {
  let node = element.parentElement
  while (node !== null) {
    const overflow = getComputedStyle(node).overflowY
    if (overflow === 'auto' || overflow === 'scroll') return node
    node = node.parentElement
  }
  return null
}

/** Proprietes propres au composant. */
export interface ParallaxImageOwnProps {
  /** Source de l'image. */
  src: string
  /** Texte de remplacement. Chaine vide si l'image est purement decorative. */
  alt: string
  /** Rapport largeur sur hauteur du cadre. @defaultValue 1.777 */
  ratio?: number
  /** Force du glissement, de 0 a 1. @defaultValue 0.35 */
  strength?: number
}

/** Toutes les proprietes : les siennes, plus celles d'une image. */
export type ParallaxImageProps = Customisable<ParallaxImageOwnProps, 'img'>

/**
 * Fait glisser une image dans son cadre au fil du defilement.
 *
 * @example
 * <ParallaxImage src="/photo.jpg" alt="Vue de l atelier" strength={0.5} />
 */
export function ParallaxImage({
  src,
  alt,
  ratio = 1.777,
  strength = 0.35,
  ...rest
}: ParallaxImageProps): ReactElement {
  const { reduced } = useMotionState()
  const host = useRef<HTMLDivElement | null>(null)
  const image = useRef<HTMLImageElement | null>(null)

  const force = Math.min(1, Math.max(0, strength))

  useEffect(() => {
    if (reduced || force === 0) return

    const frame = host.current
    if (frame === null) return

    // Le parent qui defile est cherche une fois : il ne change pas pendant la
    // vie du composant, et le chercher a chaque image couterait pour rien.
    const scroller = scrollParentOf(frame)

    const subscription = clock.subscribe(
      () => {
        const target = image.current
        if (target === null) return

        const box = frame.getBoundingClientRect()
        const viewTop = scroller === null ? 0 : scroller.getBoundingClientRect().top
        const viewHeight = scroller === null ? window.innerHeight : scroller.clientHeight

        // Progression de la traversee : 0 quand le cadre entre par le bas,
        // 1 quand il sort par le haut, ramenee a [-1, 1] pour que l'image
        // soit centree au milieu du champ.
        const total = viewHeight + box.height
        const progress = Math.min(
          1,
          Math.max(0, (viewTop + viewHeight - box.top) / Math.max(total, 1)),
        )
        const centred = progress * 2 - 1

        const shift = -centred * box.height * force * OVERSCAN
        target.style.transform = `translate3d(0,${shift.toFixed(2)}px,0)`
      },
      { priority: CLOCK_PRIORITY.input, name: 'image en parallaxe' },
    )

    return () => subscription.unsubscribe()
  }, [reduced, force])

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  // L'image deborde du cadre de la marge exacte que la translation promene :
  // a force 1, quinze pour cent au-dessus et au-dessous.
  const imageStyle: CSSProperties =
    reduced || force === 0
      ? {}
      : {
          top: `${String(-force * OVERSCAN * 100)}%`,
          height: `${String(100 + force * OVERSCAN * 200)}%`,
        }

  return (
    <div
      ref={host}
      className={className}
      style={{ ...style, aspectRatio: String(ratio) }}
    >
      <img
        {...rest}
        ref={image}
        src={src}
        alt={alt}
        className="o-absolute o-inset-0 o-size-full o-object-cover o-will-change-transform"
        style={imageStyle}
      />
    </div>
  )
}
