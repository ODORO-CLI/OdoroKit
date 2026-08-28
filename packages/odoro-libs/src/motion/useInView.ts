/**
 * Observation de l'entree d'un element dans le viewport.
 *
 * @module
 */

import { type RefObject, useEffect, useRef, useState } from 'react'

/** Options de {@link useInView}. */
export interface InViewOptions {
  /**
   * Proportion de l'element devant etre visible pour le considerer entre.
   * @defaultValue 0
   */
  threshold?: number
  /** Marge appliquee au viewport d'observation. @defaultValue '0px' */
  rootMargin?: string
  /**
   * Fige la valeur a `true` apres la premiere entree : l'observation cesse,
   * l'element ne redevient jamais « hors champ ».
   *
   * @defaultValue false
   */
  once?: boolean
}

/**
 * Indique si un element est visible dans le viewport.
 *
 * Sans `IntersectionObserver` — rendu serveur, vieux navigateur — l'element
 * est repute visible : du contenu conditionne a la visibilite ne doit jamais
 * rester cache faute d'API.
 *
 * @example
 * const [ref, inView] = useInView<HTMLElement>({ threshold: 0.4, once: true })
 *
 * return <section ref={ref} className={inView ? 'o-animate-fade-in-up' : 'o-invisible'} />
 */
export function useInView<T extends Element = HTMLElement>(
  options: InViewOptions = {},
): [RefObject<T | null>, boolean] {
  const { threshold = 0, rootMargin = '0px', once = false } = options
  const ref = useRef<T | null>(null)
  const [inView, setInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (element === null) return

    if (typeof IntersectionObserver === 'undefined') {
      setInView(true)
      return
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setInView(true)
            if (once) observer.disconnect()
          } else if (!once) {
            setInView(false)
          }
        }
      },
      { threshold, rootMargin },
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold, rootMargin, once])

  return [ref, inView]
}
