/**
 * Revelation d'un element a son entree dans le viewport.
 *
 * @module
 */

import {
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactElement,
  type ReactNode,
  createElement,
  useEffect,
  useLayoutEffect,
  useRef,
} from 'react'

import { usePrefersReducedMotion } from '../shared/motionPreference.js'
import {
  type MotionKeyframe,
  REVEAL_FROM,
  VISIBLE,
  applyStyles,
  clearStyles,
} from './keyframes.js'
import {
  type DurationInput,
  type EasingInput,
  resolveDuration,
  resolveEasing,
} from './tokens.js'

/** Proprietes communes aux composants d'animation d'entree. */
export interface RevealTiming {
  /** Duree : nom de token ou millisecondes. @defaultValue 'slow' */
  duration?: DurationInput
  /** Courbe : nom de token ou valeur CSS. @defaultValue 'entrance' */
  easing?: EasingInput
  /** Retard avant demarrage, en millisecondes. @defaultValue 0 */
  delay?: number
  /** Etat de depart. @defaultValue opacite nulle et decalage vertical */
  from?: MotionKeyframe
  /** Etat d'arrivee. @defaultValue etat naturel de l'element */
  to?: MotionKeyframe
}

/** Proprietes de {@link Reveal}. */
export interface RevealProps extends RevealTiming, ComponentPropsWithoutRef<'div'> {
  /** Element rendu. @defaultValue 'div' */
  as?: ElementType
  /** Contenu revele. */
  children?: ReactNode
  /**
   * Proportion de l'element devant etre visible pour declencher.
   * @defaultValue 0.15
   */
  threshold?: number
  /** Marge appliquee au viewport d'observation. @defaultValue '0px' */
  rootMargin?: string
  /** Ne joue l'animation qu'une seule fois. @defaultValue true */
  once?: boolean
  /** Desactive l'animation : le contenu est rendu tel quel. */
  disabled?: boolean
}

/**
 * Anime un element lorsqu'il entre dans le viewport.
 *
 * Le rendu serveur — et le rendu sans JavaScript — produit l'etat **final** :
 * l'etat de depart n'est applique qu'en couche layout, juste avant la
 * premiere peinture. Un contenu ne peut donc jamais rester invisible parce
 * qu'un script a echoue.
 *
 * Sous `prefers-reduced-motion`, l'animation est entierement neutralisee et le
 * contenu reste visible.
 *
 * @example
 * <Reveal duration="slow" delay={100}>
 *   <h2>Titre revele au scroll</h2>
 * </Reveal>
 */
export function Reveal({
  as = 'div',
  children,
  duration = 'slow',
  easing = 'entrance',
  delay = 0,
  from = REVEAL_FROM,
  to = VISIBLE,
  threshold = 0.15,
  rootMargin = '0px',
  once = true,
  disabled = false,
  ...rest
}: RevealProps): ReactElement {
  const ref = useRef<HTMLElement | null>(null)
  const reduced = usePrefersReducedMotion()
  const inactive = disabled || reduced

  // Couche layout : l'etat de depart est pose avant la premiere peinture, donc
  // sans scintillement, mais apres le rendu serveur, qui reste final.
  useLayoutEffect(() => {
    const element = ref.current
    if (element === null || inactive) return
    applyStyles(element, from)
    return () => clearStyles(element, from)
    // `from` est un litteral cote appelant : le comparer par identite
    // relancerait l'effet a chaque rendu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inactive])

  useEffect(() => {
    const element = ref.current
    if (element === null || inactive) return
    if (typeof IntersectionObserver === 'undefined') {
      clearStyles(element, from)
      return
    }

    let animation: Animation | null = null

    const reveal = (): void => {
      animation?.cancel()
      animation = element.animate([{ ...from }, { ...to }], {
        duration: resolveDuration(duration),
        easing: resolveEasing(easing),
        delay,
        fill: 'both',
      })
      void animation.finished.then(
        () => {
          // L'etat d'arrivee est l'etat naturel de l'element : on retire le
          // style inline de depart et l'animation, plutot que de laisser une
          // animation figee retenir une couche de composition.
          clearStyles(element, from)
          animation?.cancel()
          animation = null
        },
        () => undefined,
      )
    }

    const hide = (): void => {
      animation?.cancel()
      animation = null
      applyStyles(element, from)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal()
            if (once) observer.disconnect()
          } else if (!once) {
            hide()
          }
        }
      },
      { threshold, rootMargin },
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
      animation?.cancel()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inactive, once, threshold, rootMargin, delay, duration, easing])

  return createElement(as, { ...rest, ref }, children)
}
