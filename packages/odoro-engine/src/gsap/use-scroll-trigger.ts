/**
 * Animations liees au defilement.
 *
 * ## Le rafraichissement, et le piege qu'il recele
 *
 * Un declencheur de defilement memorise des positions absolues, calculees a sa
 * creation. Toute chose qui deplace la page apres coup — une image qui arrive,
 * une police qui se substitue a sa remplacante, un contenu charge a la demande
 * — rend ces positions fausses. L'animation se declenche alors trop tot ou
 * trop tard, et le defaut a la propriete deroutante de disparaitre au
 * rechargement, quand tout est deja en cache.
 *
 * Le rafraichissement apres changement de page est donc differe jusqu'a ce que
 * les images **et** les polices soient reglees. Voir {@link onRouteChange}.
 *
 * ## Mouvement reduit
 *
 * Une animation liee au defilement est pilotee par l'utilisateur : elle ne
 * s'impose pas a lui. Sous mouvement reduit, elle n'est pas creee du tout et
 * l'element reste dans son etat final — plutot que de le laisser fige dans son
 * etat de depart, ce qui le rendrait invisible.
 *
 * @module
 */

import gsap from 'gsap'
import { type RefObject, useEffect, useRef } from 'react'

import { motionPolicy } from '../core/motion-policy.js'
import { registry } from '../core/registry.js'
import { loadScrollTrigger } from './setup.js'

/**
 * Reglages d'un declencheur, sans son element ni son animation : le premier
 * vient de la ref, la seconde est construite dans le contexte du composant
 * pour etre revoquee avec lui.
 */
export type ScrollTriggerConfig = Omit<ScrollTrigger.StaticVars, 'trigger' | 'animation'>

/** Options de {@link useScrollTrigger}. */
export interface ScrollTriggerOptions extends ScrollTriggerConfig {
  /** Nom affiche dans le panneau de diagnostic. */
  name?: string
  /**
   * Construit l'animation attachee au declencheur. Elle est creee dans le
   * contexte du composant et revoquee avec lui.
   */
  animation?: (element: Element) => gsap.core.Animation | undefined
}

/**
 * Cree un declencheur de defilement lie au cycle de vie du composant.
 *
 * @returns La ref a poser sur l'element declencheur.
 *
 * @example
 * const ref = useScrollTrigger({
 *   start: 'top 80%',
 *   end: 'bottom 20%',
 *   scrub: true,
 *   name: 'parallaxe',
 *   animation: (element) => gsap.to(element, { y: -80, ease: 'none' }),
 * })
 *
 * return <section ref={ref}>...</section>
 */
export function useScrollTrigger<T extends Element = HTMLElement>(
  options: ScrollTriggerOptions = {},
): RefObject<T | null> {
  const ref = useRef<T | null>(null)
  const optionsRef = useRef(options)
  optionsRef.current = options

  const { name = 'scroll-trigger', start, end, scrub, pin } = options

  useEffect(() => {
    const element = ref.current
    if (element === null) return
    if (motionPolicy.state.reduced) return

    let context: gsap.Context | undefined
    let handle: ReturnType<typeof registry.register> | undefined
    let cancelled = false

    void loadScrollTrigger().then((ScrollTriggerClass) => {
      if (ScrollTriggerClass === null || cancelled || ref.current === null) return

      const { name: _name, animation, ...config } = optionsRef.current

      context = gsap.context(() => {
        const created = animation?.(element)
        ScrollTriggerClass.create({
          ...config,
          trigger: element,
          ...(created === undefined ? {} : { animation: created }),
        })
      }, element)

      handle = registry.register({
        kind: 'scroll-trigger',
        name,
        dispose: () => context?.revert(),
        detail: {
          start: String(start ?? 'defaut'),
          scrub: scrub === undefined ? false : true,
        },
      })
    })

    return () => {
      cancelled = true
      handle?.release()
      // `revert` detruit aussi les declencheurs creés dans le contexte : c'est
      // ce qui garantit qu'aucun ne survit a son composant.
      context?.revert()
    }
  }, [name, start, end, scrub, pin])

  return ref
}

/** Ce que rend {@link useScrollProgress}. */
export interface ScrollProgressHandle<T extends Element> {
  /** Ref a poser sur l'element observe. */
  readonly ref: RefObject<T | null>
}

/** Options de {@link useScrollProgress}. */
export interface ScrollProgressOptions {
  /** Debut de la plage observee. @defaultValue 'top bottom' */
  start?: string
  /** Fin de la plage observee. @defaultValue 'bottom top' */
  end?: string
  /** Nom affiche dans le panneau de diagnostic. */
  name?: string
}

/**
 * Progression du defilement d'un element, de 0 a 1.
 *
 * Cette lecture passe par la boucle unique du moteur. `odoro-libs/motion`
 * expose une progression comparable, autonome, pour les projets sans moteur :
 * **ne pas melanger les deux sur une meme page**, ce serait lire le defilement
 * deux fois, et le decalage entre les deux lectures est precisement le
 * tremblement que la boucle unique existe pour supprimer.
 *
 * La valeur est transmise a un rappel plutot que rendue comme etat : une
 * progression provoquerait sinon un rendu React par image.
 *
 * @example
 * const { ref } = useScrollProgress((progress) => {
 *   barre.current.style.transform = `scaleX(${progress})`
 * })
 */
export function useScrollProgress<T extends Element = HTMLElement>(
  onProgress: (progress: number) => void,
  options: ScrollProgressOptions = {},
): ScrollProgressHandle<T> {
  const ref = useRef<T | null>(null)
  const callback = useRef(onProgress)
  callback.current = onProgress

  const { start = 'top bottom', end = 'bottom top', name = 'progression' } = options

  useEffect(() => {
    const element = ref.current
    if (element === null) return

    if (motionPolicy.state.reduced) {
      // Etat final : la progression complete, une fois.
      callback.current(1)
      return
    }

    let context: gsap.Context | undefined
    let handle: ReturnType<typeof registry.register> | undefined
    let cancelled = false

    void loadScrollTrigger().then((ScrollTriggerClass) => {
      if (ScrollTriggerClass === null || cancelled || ref.current === null) return

      context = gsap.context(() => {
        ScrollTriggerClass.create({
          trigger: element,
          start,
          end,
          onUpdate: (self) => callback.current(self.progress),
        })
      }, element)

      handle = registry.register({
        kind: 'scroll-trigger',
        name,
        dispose: () => context?.revert(),
      })
    })

    return () => {
      cancelled = true
      handle?.release()
      context?.revert()
    }
  }, [start, end, name])

  return { ref }
}

/**
 * Rafraichit les positions de tous les declencheurs.
 *
 * A appeler apres un changement de page, **une fois le nouveau contenu rendu**.
 * L'attente des images et des polices est prise en charge ici : sans elle, les
 * positions memorisees seraient celles d'une page qui n'a pas fini de se
 * mettre en place.
 *
 * @param timeoutMs Delai au-dela duquel on rafraichit sans plus attendre. Une
 *   image qui ne se charge jamais ne doit pas condamner la page.
 *
 * @example
 * // Dans le composant racine de l'application :
 * useEffect(() => {
 *   void onRouteChange()
 * }, [location.pathname])
 */
export async function onRouteChange(timeoutMs = 3000): Promise<void> {
  if (typeof window === 'undefined') return
  const ScrollTriggerClass = await loadScrollTrigger()
  if (ScrollTriggerClass === null) return

  const settled = Promise.all([
    // Les polices se substituent a leur remplacante apres coup, ce qui decale
    // la mise en page — souvent plus que les images.
    typeof document.fonts?.ready === 'object'
      ? document.fonts.ready.catch(() => undefined)
      : Promise.resolve(),
    ...[...document.images]
      .filter((image) => !image.complete)
      .map(
        (image) =>
          new Promise<void>((resolve) => {
            image.addEventListener('load', () => resolve(), { once: true })
            image.addEventListener('error', () => resolve(), { once: true })
          }),
      ),
  ])

  await Promise.race([settled, new Promise((resolve) => setTimeout(resolve, timeoutMs))])

  ScrollTriggerClass.refresh()
}

/**
 * Detruit tous les declencheurs de la page.
 *
 * A appeler au demontage d'une application, ou avant un changement de page qui
 * remplace integralement le contenu.
 *
 * @example
 * killScrollTriggers()
 */
export function killScrollTriggers(): number {
  return registry.disposeAll('scroll-trigger')
}
