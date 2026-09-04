/**
 * Declenche quand l'element entre dans le champ, une fois.
 *
 * ## Pourquoi ce crochet plutot que ScrollTrigger
 *
 * Le moteur sait deja observer le defilement, mais par GSAP — et GSAP arrive
 * alors dans le projet de celui qui installe une simple animation de titre.
 * `IntersectionObserver` est dans le navigateur depuis des annees, ne coute
 * rien, et repond exactement a la question posee : « est-ce visible ? ».
 *
 * Ce qui demande GSAP, c'est le *scrub* — une animation dont l'avancement suit
 * la position de defilement au pixel pres. Ce crochet ne pretend pas le faire.
 *
 * ## Il s'ouvre en cas de doute, jamais il ne se ferme
 *
 * Sans `IntersectionObserver` — un navigateur ancien, un environnement de test,
 * un rendu serveur hydrate bizarrement — le crochet rend `vu: true`
 * **immediatement**.
 *
 * Le defaut inverse serait le pire possible : une animation qui ne part jamais
 * laisse le texte dans son etat initial, c'est-a-dire souvent invisible. Un
 * effet qui ne joue pas se remarque a peine ; un titre absent se remarque tout
 * de suite, et trop tard.
 *
 * ## Une fois, par defaut
 *
 * Un titre qui rejoue son animation chaque fois qu'on remonte la page attire
 * l'attention sur lui a un moment ou l'on cherchait autre chose. L'observateur
 * se detache donc apres le premier passage, ce qui libere aussi son cout.
 *
 * @module
 */

import { useEffect, useRef, useState, type RefObject } from 'react'

/** Reglages de l'observation. */
export interface UseInViewOptions {
  /**
   * Se detacher apres le premier passage.
   *
   * @defaultValue true
   */
  once?: boolean
  /**
   * Part visible qui declenche, de 0 a 1.
   *
   * @defaultValue 0.3
   */
  amount?: number
  /**
   * Marge autour de la zone d'observation, syntaxe de `rootMargin`.
   *
   * Une marge negative en bas retarde le declenchement jusqu'a ce que
   * l'element soit franchement entre.
   */
  margin?: string
  /**
   * Ne pas observer du tout : le crochet rend `vu: true` des le montage.
   *
   * C'est ainsi qu'un composant expose un declenchement « au montage » sans
   * ecrire deux chemins de code.
   *
   * @defaultValue false
   */
  immediat?: boolean
}

/** Ce que le crochet rend. */
export interface UseInViewResult<T extends Element> {
  /** A poser sur l'element a observer. */
  readonly ref: RefObject<T | null>
  /** Vrai des que l'element a ete vu. */
  readonly vu: boolean
}

/**
 * Observe un element et dit quand il a ete vu.
 *
 * @example
 * const { ref, vu } = useInView<HTMLDivElement>()
 * return <div ref={ref} data-anime={vu ? '' : undefined} />
 *
 * @example
 * // Declenchement au montage : aucun observateur n'est cree.
 * const { ref, vu } = useInView<HTMLSpanElement>({ immediat: true })
 */
export function useInView<T extends Element>(
  options: UseInViewOptions = {},
): UseInViewResult<T> {
  const { once = true, amount = 0.3, margin, immediat = false } = options

  const ref = useRef<T | null>(null)
  const [vu, setVu] = useState(immediat)

  useEffect(() => {
    if (immediat) {
      setVu(true)
      return
    }

    const cible = ref.current
    if (cible === null) return

    // Voir l'en-tete : en cas de doute, on montre. Un effet qui ne joue pas se
    // remarque a peine, un titre absent se remarque tout de suite.
    if (typeof IntersectionObserver === 'undefined') {
      setVu(true)
      return
    }

    const observateur = new IntersectionObserver(
      (entrees) => {
        for (const entree of entrees) {
          if (entree.isIntersecting) {
            setVu(true)
            if (once) observateur.disconnect()
          } else if (!once) {
            setVu(false)
          }
        }
      },
      {
        // `threshold` refuse une valeur hors de [0, 1] en levant : on la borne
        // plutot que de laisser une faute de frappe casser la page.
        threshold: Math.min(1, Math.max(0, amount)),
        ...(margin === undefined ? {} : { rootMargin: margin }),
      },
    )

    observateur.observe(cible)

    return () => {
      observateur.disconnect()
    }
  }, [once, amount, margin, immediat])

  return { ref, vu }
}
