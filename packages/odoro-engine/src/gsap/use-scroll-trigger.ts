/**
 * Scroll-linked animations.
 *
 * ## The refresh, and the trap it holds
 *
 * A scroll trigger memorises absolute positions, computed when it is created.
 * Anything that moves the page afterwards — an image arriving, a font
 * replacing its stand-in, content loaded on demand — makes those positions
 * wrong. The animation then fires too early or too late, and the flaw has the
 * disconcerting property of disappearing on reload, when everything is already
 * cached.
 *
 * The refresh after a page change is therefore deferred until the images
 * **and** the fonts are settled. See {@link onRouteChange}.
 *
 * ## The scrolling container is not always the page
 *
 * A trigger measures against a "scroller", and the default one is the window.
 * Placed inside a panel with its own scrolling — a side column, a modal
 * window, a documentation frame — it then measures a scroll that does not
 * move, and the animation never fires. The flaw does not fail: simply nothing
 * happens.
 *
 * Both hooks therefore walk up the chain of ancestors to the first one that
 * really scrolls. This is a detection, not a guess: the ancestor must both
 * declare a handled overflow and have content taller than its box. `scroller`
 * makes it possible to short-circuit it.
 *
 * ## Reduced motion
 *
 * A scroll-linked animation is driven by the user: it does not impose itself
 * on them. Under reduced motion, it is not created at all and the element
 * stays in its final state — rather than leaving it frozen in its starting
 * state, which would make it invisible.
 *
 * @module
 */

import gsap from 'gsap'
import { type RefObject, useEffect, useRef } from 'react'

import { motionPolicy } from '../core/motion-policy.js'
import { registry } from '../core/registry.js'
import { loadScrollTrigger } from './setup.js'

/**
 * First ancestor that really scrolls, or `undefined` for the window.
 *
 * Both conditions count. An `overflow: auto` on a container that fits in its
 * box does not scroll, and taking it for the scroller would freeze the
 * progress at zero — exactly the flaw we are trying to avoid.
 */
export function scrollingAncestor(element: Element): Element | undefined {
  let node = element.parentElement

  while (node !== null && node !== document.body) {
    const style = getComputedStyle(node)
    const handled = /auto|scroll|overlay/.test(`${style.overflowY} ${style.overflowX}`)
    if (
      handled &&
      (node.scrollHeight > node.clientHeight || node.scrollWidth > node.clientWidth)
    ) {
      return node
    }
    node = node.parentElement
  }

  return undefined
}

/**
 * Settings of a trigger, without its element or its animation: the first comes
 * from the ref, the second is built in the context of the component so as to
 * be reverted with it.
 */
export type ScrollTriggerConfig = Omit<ScrollTrigger.StaticVars, 'trigger' | 'animation'>

/** Options of {@link useScrollTrigger}. */
export interface ScrollTriggerOptions extends ScrollTriggerConfig {
  /** Name shown in the diagnostics panel. */
  name?: string
  /**
   * Container whose scroll is followed.
   *
   * By default, the first ancestor that really scrolls, or the window if there
   * is none. `null` forces the window.
   */
  scroller?: Element | null
  /**
   * Builds the animation attached to the trigger. It is created in the context
   * of the component and reverted with it.
   */
  animation?: (element: Element) => gsap.core.Animation | undefined
}

/**
 * Creates a scroll trigger tied to the life cycle of the component.
 *
 * @returns The ref to set on the trigger element.
 *
 * @example
 * const ref = useScrollTrigger({
 *   start: 'top 80%',
 *   end: 'bottom 20%',
 *   scrub: true,
 *   name: 'parallax',
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
      const container = scroller === undefined ? scrollingAncestor(element) : scroller

      context = gsap.context(() => {
        const created = animation?.(element)
        ScrollTriggerClass.create({
          ...config,
          trigger: element,
          ...(container === undefined || container === null
            ? {}
            : { scroller: container }),
          ...(created === undefined ? {} : { animation: created }),
        })
      }, element)

      handle = registry.register({
        kind: 'scroll-trigger',
        name,
        dispose: () => context?.revert(),
        detail: {
          start: String(start ?? 'default'),
          scrub: scrub === undefined ? false : true,
        },
      })
    })

    return () => {
      cancelled = true
      handle?.release()
      // `revert` also destroys the triggers created in the context: that is
      // what guarantees that none survives its component.
      context?.revert()
    }
  }, [name, start, end, scrub, pin])

  return ref
}

/** What {@link useScrollScrub} returns. */
export interface ScrollScrubHandle<T extends Element> {
  /** Ref to set on the observed element. */
  readonly ref: RefObject<T | null>
}

/** Options of {@link useScrollScrub}. */
export interface ScrollScrubOptions {
  /**
   * Observed element, when it cannot come from the returned ref.
   *
   * ## Why this door exists
   *
   * The ref is read once, on mount. That is enough as long as the observed
   * element is the one the ref is set on. This is no longer the case when the
   * observer designates an element **placed further down the tree**: React
   * attaches the refs as it walks, so that the ref of a following sibling is
   * still empty when the effect runs. The element is then null, no trigger is
   * created, and nothing happens — without an error.
   *
   * Passing the element here brings it into the dependencies of the effect:
   * the trigger is created as soon as it appears.
   */
  element?: Element | null
  /** Start of the observed range. @defaultValue 'top bottom' */
  start?: string
  /** End of the observed range. @defaultValue 'bottom top' */
  end?: string
  /** Name shown in the diagnostics panel. */
  name?: string
  /**
   * Container whose scroll is followed.
   *
   * By default, the first ancestor that really scrolls, or the window if there
   * is none. `null` forces the window.
   */
  scroller?: Element | null
}

/**
 * Scroll progress of an element, from 0 to 1.
 *
 * ## The boundary with `@odoro-cli/libs/motion`
 *
 * Both packages touch the scroll, and do not do the same thing.
 *
 * `useScrollProgress`, in the library, returns **a number**: how far the page
 * has been read, or the crossing of an element by the viewport. No
 * dependencies, one measurement per frame, and a React render when the value
 * changes.
 *
 * `useScrollScrub`, here, slaves a **callback** to a GSAP trigger: bounds
 * expressed in the grammar of ScrollTrigger, scrolling container detected, no
 * React render during the run. It is GSAP's term for a scroll-driven
 * animation, and it says exactly what the hook does.
 *
 * Both carried the same name, which forced you to read the signature to know
 * which one you were holding. They do not replace one another: you take the
 * library's to display a bar, the engine's to drive an animation.
 *
 * The value is passed to a callback rather than returned as state: a progress
 * value would otherwise cause one React render per frame.
 *
 * @example
 * const { ref } = useScrollScrub((progress) => {
 *   bar.current.style.transform = `scaleX(${progress})`
 * })
 */
export function useScrollScrub<T extends Element = HTMLElement>(
  onProgress: (progress: number) => void,
  options: ScrollScrubOptions = {},
): ScrollScrubHandle<T> {
  const ref = useRef<T | null>(null)
  const callback = useRef(onProgress)
  callback.current = onProgress

  const {
    start = 'top bottom',
    end = 'bottom top',
    name = 'progress',
    scroller,
    element: given,
  } = options

  useEffect(() => {
    // `undefined` means "nothing supplied": we fall back on the ref. `null`
    // means "supplied, but not there yet": we wait.
    const element = given === undefined ? ref.current : given
    if (element === null) return

    if (motionPolicy.state.reduced) {
      // Final state: the full progress, once.
      callback.current(1)
      return
    }

    let context: gsap.Context | undefined
    let handle: ReturnType<typeof registry.register> | undefined
    let cancelled = false

    void loadScrollTrigger().then((ScrollTriggerClass) => {
      if (ScrollTriggerClass === null || cancelled) return

      const container = scroller === undefined ? scrollingAncestor(element) : scroller

      context = gsap.context(() => {
        ScrollTriggerClass.create({
          trigger: element,
          start,
          end,
          ...(container === undefined || container === null
            ? {}
            : { scroller: container }),
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
 * Refreshes the positions of every trigger.
 *
 * To be called after a page change, **once the new content is rendered**.
 * Waiting for the images and the fonts is handled here: without it, the
 * memorised positions would be those of a page that has not finished settling.
 *
 * @param timeoutMs Delay beyond which we refresh without waiting any longer.
 *   An image that never loads must not condemn the page.
 *
 * @example
 * // In the root component of the application:
 * useEffect(() => {
 *   void onRouteChange()
 * }, [location.pathname])
 */
export async function onRouteChange(timeoutMs = 3000): Promise<void> {
  if (typeof window === 'undefined') return
  const ScrollTriggerClass = await loadScrollTrigger()
  if (ScrollTriggerClass === null) return

  const settled = Promise.all([
    // Fonts replace their stand-in afterwards, which shifts the layout — often
    // more than the images do.
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
 * Destroys every trigger of the page.
 *
 * To be called on unmounting an application, or before a page change that
 * entirely replaces the content.
 *
 * @example
 * killScrollTriggers()
 */
export function killScrollTriggers(): number {
  return registry.disposeAll('scroll-trigger')
}
