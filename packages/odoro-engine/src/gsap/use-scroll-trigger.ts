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
 * ## Le conteneur qui defile n'est pas toujours la page
 *
 * Un declencheur mesure par rapport a un « scroller », et celui par defaut est
 * la fenetre. Pose dans un panneau a defilement propre — une colonne laterale,
 * une fenetre modale, un cadre de documentation —, il mesure alors un
 * defilement qui ne bouge pas, et l'animation ne se declenche jamais. Le
 * defaut n'echoue pas : il ne se passe simplement rien.
 *
 * Les deux hooks remontent donc la chaine des ancetres jusqu'au premier qui
 * defile reellement. C'est une detection, pas une devinette : l'ancetre doit
 * a la fois declarer un debordement traite et avoir un contenu plus haut que
 * sa boite. `scroller` permet de la court-circuiter.
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
 * Premier ancetre qui defile reellement, ou `undefined` pour la fenetre.
 *
 * Les deux conditions comptent. Un `overflow: auto` sur un conteneur qui tient
 * dans sa boite ne defile pas, et le prendre pour scroller figerait la
 * progression a zero — exactement le defaut qu'on cherche a eviter.
 */
export function scrollingAncestor(element: Element): Element | undefined {
  let node = element.parentElement

  while (node !== null && node !== document.body) {
    const style = getComputedStyle(node)
    const traite = /auto|scroll|overlay/.test(`${style.overflowY} ${style.overflowX}`)
    if (
      traite &&
      (node.scrollHeight > node.clientHeight || node.scrollWidth > node.clientWidth)
    ) {
      return node
    }
    node = node.parentElement
  }

  return undefined
}

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
   * Conteneur dont on suit le defilement.
   *
   * Par defaut, le premier ancetre qui defile reellement, ou la fenetre s'il
   * n'y en a pas. `null` force la fenetre.
   */
  scroller?: Element | null
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

      const { name: _name, animation, scroller, ...config } = optionsRef.current
      const conteneur = scroller === undefined ? scrollingAncestor(element) : scroller

      context = gsap.context(() => {
        const created = animation?.(element)
        ScrollTriggerClass.create({
          ...config,
          trigger: element,
          ...(conteneur === undefined || conteneur === null
            ? {}
            : { scroller: conteneur }),
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
  /**
   * Element observe, quand il ne peut pas venir de la ref rendue.
   *
   * ## Pourquoi cette porte existe
   *
   * La ref est lue une fois, au montage. Cela suffit tant que l'element
   * observe est celui sur lequel la ref est posee. Ce n'est plus le cas quand
   * l'observateur designe un element **place plus loin dans l'arbre** : React
   * attache les refs au fil du parcours, si bien que la ref d'un frere suivant
   * est encore vide quand l'effet s'execute. L'element est alors nul, aucun
   * declencheur n'est cree, et il ne se passe rien — sans erreur.
   *
   * Passer l'element ici le fait entrer dans les dependances de l'effet : le
   * declencheur est cree des qu'il apparait.
   */
  element?: Element | null
  /** Debut de la plage observee. @defaultValue 'top bottom' */
  start?: string
  /** Fin de la plage observee. @defaultValue 'bottom top' */
  end?: string
  /** Nom affiche dans le panneau de diagnostic. */
  name?: string
  /**
   * Conteneur dont on suit le defilement.
   *
   * Par defaut, le premier ancetre qui defile reellement, ou la fenetre s'il
   * n'y en a pas. `null` force la fenetre.
   */
  scroller?: Element | null
}

/**
 * Progression du defilement d'un element, de 0 a 1.
 *
 * Cette lecture passe par la boucle unique du moteur. `@odoro/libs/motion`
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

  const {
    start = 'top bottom',
    end = 'bottom top',
    name = 'progression',
    scroller,
    element: given,
  } = options

  useEffect(() => {
    // `undefined` signifie « rien de fourni » : on retombe sur la ref. `null`
    // signifie « fourni, mais pas encore la » : on attend.
    const element = given === undefined ? ref.current : given
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
      if (ScrollTriggerClass === null || cancelled) return

      const conteneur = scroller === undefined ? scrollingAncestor(element) : scroller

      context = gsap.context(() => {
        ScrollTriggerClass.create({
          trigger: element,
          start,
          end,
          ...(conteneur === undefined || conteneur === null
            ? {}
            : { scroller: conteneur }),
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
  }, [start, end, name, scroller, given])

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
