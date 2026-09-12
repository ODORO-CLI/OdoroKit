/**
 * Revelation floue : les mots passent du flou au net, l'un apres l'autre.
 *
 * ## `element.animate` plutot qu'une feuille
 *
 * L'effet ne se joue qu'une fois, quand le texte entre dans le champ. Une
 * animation declarative devrait exister avant de savoir quand partir, et il
 * faudrait la retenir par un attribut puis la lacher au bon moment.
 * L'API Web Animations dit la meme chose en une ligne, au moment exact ou
 * l'observateur signale l'entree — et le navigateur la compose comme
 * n'importe quelle animation CSS.
 *
 * ## Le flou initial n'est pose que si l'effet aura lieu
 *
 * Le piege classique de ce genre d'effet : cacher le texte en CSS et le
 * reveler en JavaScript. Si le JavaScript ne vient jamais — erreur, lecteur
 * sans script, mouvement reduit — le texte reste invisible. Ici l'etat cache
 * est pose par le meme code qui programme la revelation : sans lui, le texte
 * est simplement la, net.
 *
 * ## Le decoupage est un artifice d'affichage
 *
 * Les mots sont eclates en elements pour recevoir chacun leur delai. Le
 * conteneur porte donc le texte complet pour les lecteurs d'ecran, et les
 * mots eclates sont retires de l'arbre d'accessibilite.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useEffect, useRef, type ElementType, type ReactElement } from 'react'

/** Proprietes propres au composant. */
export interface BlurRevealOwnProps {
  /** Texte a reveler. */
  children: string
  /** Balise rendue. @defaultValue 'p' */
  as?: ElementType
  /** Delai entre deux mots, en millisecondes. @defaultValue 90 */
  step?: number
  /** Flou de depart, en pixels. @defaultValue 8 */
  blur?: number
  /** Duree de la revelation d'un mot, en millisecondes. @defaultValue 600 */
  duration?: number
}

/** Toutes les proprietes. */
export type BlurRevealProps = Customisable<BlurRevealOwnProps, 'p'>

/**
 * Revele un texte mot a mot, du flou vers le net, a l'entree dans le champ.
 *
 * @example
 * <BlurReveal as="h2" className="o-text-3xl o-font-bold">
 *   Ce qui compte merite d etre lu
 * </BlurReveal>
 *
 * @example
 * // Plus lent, plus flou : pour un titre seul sur son ecran.
 * <BlurReveal step={140} blur={14}>Une entree en matiere</BlurReveal>
 */
export function BlurReveal({
  children,
  as: Tag = 'p',
  step = 90,
  blur = 8,
  duration = 600,
  ...rest
}: BlurRevealProps): ReactElement {
  const { reduced } = useMotionState()
  const host = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const element = host.current
    if (element === null || reduced) return

    const words = element.querySelectorAll<HTMLElement>('[data-o-blur-word]')
    if (words.length === 0) return

    // L'etat cache est pose ici, pas dans le rendu : si ce code ne tourne
    // pas, le texte reste net et visible. Voir l'en-tete du module.
    for (const word of words) {
      word.style.opacity = '0'
    }

    let played = false
    const animations: Animation[] = []

    const observer = new IntersectionObserver(
      (entries) => {
        if (played || entries.every((entry) => !entry.isIntersecting)) return
        played = true
        observer.disconnect()

        words.forEach((word, index) => {
          word.style.opacity = ''
          animations.push(
            word.animate(
              [
                { filter: `blur(${String(blur)}px)`, opacity: 0 },
                { filter: 'blur(0px)', opacity: 1 },
              ],
              {
                duration,
                delay: index * step,
                easing: 'ease-out',
                fill: 'both',
              },
            ),
          )
        })
      },
      { threshold: 0.4 },
    )

    observer.observe(element)
    return () => {
      observer.disconnect()
      for (const animation of animations) animation.cancel()
      for (const word of words) {
        word.style.opacity = ''
      }
    }
  }, [reduced, children, step, blur, duration])

  const { className, style } = mergePresentation({}, rest)

  // Mouvement reduit : le texte est la, net, sans decoupage.
  if (reduced) {
    return (
      <Tag {...rest} className={className} style={style}>
        {children}
      </Tag>
    )
  }

  const words = children.split(' ').filter((word) => word.length > 0)

  return (
    <Tag {...rest} ref={host} className={className} style={style}>
      {/* Le texte complet, d'un seul tenant, pour les lecteurs d'ecran. */}
      <span className="o-sr-only">{children}</span>
      <span aria-hidden>
        {words.map((word, index) => (
          <span key={`${word}-${String(index)}`}>
            <span data-o-blur-word="" style={{ display: 'inline-block' }}>
              {word}
            </span>
            {index < words.length - 1 ? ' ' : null}
          </span>
        ))}
      </span>
    </Tag>
  )
}
