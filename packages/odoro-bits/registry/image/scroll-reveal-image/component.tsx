/**
 * Image decouverte au defilement : le rideau suit la position de la page,
 * pas une minuterie. On peut l'arreter au milieu, revenir en arriere, le
 * refermer.
 *
 * ## Ce qui la distingue de l'image revelee
 *
 * L'image revelee est un declenchement : elle entre dans le champ, elle joue
 * son ouverture une fois, c'est fini. Ici l'avancement **est** la position de
 * defilement — un « scrub ». Remonter la page referme le rideau. C'est
 * l'effet qu'on veut sur une longue page ou l'image se decouvre au rythme de
 * la lecture, et il ne se simule pas avec une transition.
 *
 * ## Un seul nombre traverse la frontiere
 *
 * La mesure ecrit une variable CSS sur le cadre, entre zero et un. Tout le
 * reste — decoupage du rideau, contre-zoom de l'image, position du lisere —
 * en decoule dans la feuille de styles, en `calc`. Aucun rendu React, et une
 * seule ecriture par image, sautee quand la valeur n'a pas bouge.
 *
 * ## Pourquoi la boucle du moteur et pas un ecouteur de defilement
 *
 * Un ecouteur de `scroll` se declenche a un rythme decide par le navigateur,
 * qui n'est pas celui du rafraichissement : la valeur arriverait en retard
 * d'une image sur une sur trois, ce qui se voit comme un tremblement sur un
 * bord net. La mesure passe donc par l'horloge du moteur, avant le rendu de
 * la meme image.
 *
 * La progression est mesuree contre le premier ancetre qui defile vraiment,
 * et non contre la fenetre : posee dans un panneau a defilement interne,
 * l'image se decouvre quand ce panneau bouge.
 *
 * ## Sous mouvement reduit
 *
 * Le rideau est ouvert en grand des le premier rendu et rien ne s'abonne :
 * l'etat final, jamais l'etat d'attente.
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

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-scroll-reveal-image'

/** Part de la traversee franchie avant que le rideau commence a s'ouvrir. */
const START = 0.12

/** Pose les regles du rideau, une fois par document. */
function ensureScrollRevealRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  /** Le complement de l'avancement, en pour cent : l'epaisseur du rideau. */
  const epais = 'calc((1 - var(--o-sr-p)) * 100%)'

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // Le decoupage : un seul cote bouge, celui d'ou vient l'ouverture.
    `[data-o-sr-veil="up"]{clip-path:inset(${epais} 0 0 0)}`,
    `[data-o-sr-veil="down"]{clip-path:inset(0 0 ${epais} 0)}`,
    `[data-o-sr-veil="left"]{clip-path:inset(0 ${epais} 0 0)}`,
    `[data-o-sr-veil="right"]{clip-path:inset(0 0 0 ${epais})}`,
    // Le contre-zoom : l'image finit de se poser au moment ou le rideau finit
    // de s'ouvrir. Sans lui, l'image serait deja arrivee avant d'etre vue.
    '[data-o-sr-image]{transform:scale(calc(1.06 - var(--o-sr-p) * 0.06))}',
    // Le lisere marque le bord qui avance, et s'efface avec la fin de la
    // course : l'opacite depasse un au debut, le navigateur la borne.
    '[data-o-sr-edge]{',
    'position:absolute;pointer-events:none;',
    'background:var(--o-palette-brand-500);',
    'opacity:calc((1 - var(--o-sr-p)) * 4);',
    '}',
    `[data-o-sr-edge="up"]{left:0;right:0;height:2px;top:${epais}}`,
    `[data-o-sr-edge="down"]{left:0;right:0;height:2px;bottom:${epais}}`,
    `[data-o-sr-edge="left"]{top:0;bottom:0;width:2px;right:${epais}}`,
    `[data-o-sr-edge="right"]{top:0;bottom:0;width:2px;left:${epais}}`,
  ].join('')
  document.head.append(style)
}

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

/** Sens d'ouverture du rideau. */
export type ScrollRevealDirection = 'up' | 'down' | 'left' | 'right'

/** Proprietes propres au composant. */
export interface ScrollRevealImageOwnProps {
  /** Source de l'image. */
  src: string
  /** Texte de remplacement. Chaine vide si l'image est purement decorative. */
  alt: string
  /** Rapport largeur sur hauteur du cadre. @defaultValue 1.777 */
  ratio?: number
  /** Sens de l'ouverture du rideau. @defaultValue 'up' */
  direction?: ScrollRevealDirection
  /**
   * Part de la traversee du champ pendant laquelle le rideau s'ouvre.
   *
   * A un, l'image n'est entierement decouverte qu'en sortant par le haut ;
   * a un quart, elle l'est des qu'elle est franchement entree.
   *
   * @defaultValue 0.55
   */
  span?: number
  /** Marquer le bord qui avance d'un lisere. @defaultValue true */
  edge?: boolean
}

/** Toutes les proprietes : les siennes, plus celles d'une image. */
export type ScrollRevealImageProps = Customisable<ScrollRevealImageOwnProps, 'img'>

/**
 * Decouvre une image au rythme du defilement.
 *
 * @example
 * <ScrollRevealImage src="/photo.jpg" alt="Vue de l atelier" />
 *
 * @example
 * // Ouverture laterale, courte, sans lisere.
 * <ScrollRevealImage src="/photo.jpg" alt="" direction="right" span={0.3} edge={false} />
 */
export function ScrollRevealImage({
  src,
  alt,
  ratio = 1.777,
  direction = 'up',
  span = 0.55,
  edge = true,
  ...rest
}: ScrollRevealImageProps): ReactElement {
  const { reduced } = useMotionState()
  const host = useRef<HTMLDivElement | null>(null)
  ensureScrollRevealRule()

  const course = Math.min(1, Math.max(0.1, span))

  useEffect(() => {
    if (reduced) return

    const frame = host.current
    if (frame === null) return

    // Le parent qui defile est cherche une fois : il ne change pas pendant la
    // vie du composant.
    const scroller = scrollParentOf(frame)
    let last = -1

    const subscription = clock.subscribe(
      () => {
        const box = frame.getBoundingClientRect()
        const viewTop = scroller === null ? 0 : scroller.getBoundingClientRect().top
        const viewHeight =
          scroller === null ? window.innerHeight : scroller.clientHeight

        // Traversee : zero quand le cadre entre par le bas, un quand il sort
        // par le haut.
        const total = viewHeight + box.height
        const crossing = Math.min(
          1,
          Math.max(0, (viewTop + viewHeight - box.top) / Math.max(total, 1)),
        )

        // L'ouverture n'occupe qu'une part de la traversee, apres un temps
        // mort : une image qui commence a se decouvrir avant d'etre entree
        // n'a pas l'air d'etre decouverte du tout.
        const value = Math.min(1, Math.max(0, (crossing - START) / course))

        // Deux centiemes suffisent a l'oeil : en deca, l'ecriture ne ferait
        // que declencher un recalcul de style pour rien.
        const rounded = Math.round(value * 100) / 100
        if (rounded === last) return
        last = rounded
        frame.style.setProperty('--o-sr-p', String(rounded))
      },
      { priority: CLOCK_PRIORITY.input, name: 'image decouverte au defilement' },
    )

    return () => subscription.unsubscribe()
  }, [reduced, course])

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  const hostStyle = {
    ...style,
    aspectRatio: String(ratio),
    // Sous mouvement reduit, l'unique etat est l'etat final.
    '--o-sr-p': reduced ? '1' : '0',
  } as CSSProperties

  return (
    <div ref={host} className={className} style={hostStyle}>
      <div data-o-sr-veil={direction} className="o-absolute o-inset-0">
        <img
          loading="lazy"
          decoding="async"
          {...rest}
          data-o-sr-image=""
          src={src}
          alt={alt}
          className="o-size-full o-object-cover o-will-change-transform"
        />
      </div>

      {/* Le lisere est decoratif : il marque une progression que l'image dit
          deja. */}
      {edge && !reduced ? <div aria-hidden data-o-sr-edge={direction} /> : null}
    </div>
  )
}
