/**
 * Timelines tied to the life cycle of a component.
 *
 * ## The context, and why it is mandatory
 *
 * Every hook creates an animation context carried by the supplied ref, and
 * reverts it on unmount. Any animation created inside — including by code
 * called indirectly — belongs to that context and disappears with it.
 *
 * Without it, an animation keeps running after its component unmounts: it
 * writes into a detached node, holds a reference on the React tree, and the
 * only symptom is a memory usage that climbs over the course of navigations.
 * It is the most common leak of an animated application, and it is invisible
 * as long as you do not look for it.
 *
 * ## Reduced motion
 *
 * When the policy neutralises motion, the timeline is built then **advanced
 * immediately to its final state**. It is not cancelled: an element that was
 * to appear appears, without a transition. This is the rule of the engine,
 * applied here rather than in every caller.
 *
 * @module
 */

import gsap from 'gsap'
import { type DependencyList, type RefObject, useEffect, useRef } from 'react'

import { motionPolicy } from '../core/motion-policy.js'
import { registry } from '../core/registry.js'

/** What the build function receives. */
export interface TimelineSetup {
  /** Timeline to populate. */
  readonly timeline: gsap.core.Timeline
  /** Context, to register animations outside the timeline. */
  readonly context: gsap.Context
  /** Root element, as supplied. */
  readonly element: Element
  /** `true` if motion is neutralised. */
  readonly reduced: boolean
}

/** Options of {@link useTimeline}. */
export interface TimelineOptions {
  /** Name shown in the diagnostics panel. */
  name?: string
  /** Settings passed to the timeline. */
  vars?: gsap.TimelineVars
  /**
   * Plays the timeline as soon as it is built.
   *
   * @defaultValue true
   */
  autoplay?: boolean
}

/** What {@link useTimeline} returns. */
export interface TimelineHandle<T extends Element> {
  /** Ref to set on the root element. */
  readonly ref: RefObject<T | null>
  /** Current timeline, or `null` before mounting. */
  readonly timeline: RefObject<gsap.core.Timeline | null>
}

/**
 * Creates a timeline whose lifetime follows that of the component.
 *
 * @param build Builds the animation. Called on every change of the
 *   dependencies, after reverting the previous one.
 * @param deps Dependencies, as for an effect.
 *
 * @example
 * const { ref } = useTimeline(
 *   ({ timeline }) => {
 *     timeline.from('.title', { y: 24, opacity: 0 })
 *     timeline.from('.line', { scaleX: 0, stagger: 0.08 }, '-=0.2')
 *   },
 *   [],
 *   { name: 'header' },
 * )
 *
 * return <header ref={ref}>...</header>
 */
export function useTimeline<T extends Element = HTMLElement>(
  build: (setup: TimelineSetup) => void,
  deps: DependencyList = [],
  options: TimelineOptions = {},
): TimelineHandle<T> {
  const ref = useRef<T | null>(null)
  const timeline = useRef<gsap.core.Timeline | null>(null)
  const buildRef = useRef(build)
  buildRef.current = build

  const { name = 'timeline', vars, autoplay = true } = options

  useEffect(() => {
    const element = ref.current
    if (element === null) return

    const reduced = motionPolicy.state.reduced

    // The context captures everything created during the call, including by
    // code that knows nothing about it. It is passed as an argument: reading it
    // from the variable being assigned would amount to accessing it before its
    // initialisation, since the build function runs during the call.
    const context = gsap.context((self) => {
      const created = gsap.timeline({ paused: true, ...vars })
      timeline.current = created

      buildRef.current({ timeline: created, context: self, element, reduced })

      if (reduced) {
        // The final state, immediately: neutralising must never make content
        // disappear.
        created.progress(1, true).pause()
        return
      }

      if (autoplay) created.play()
    }, element)

    const handle = registry.register({
      kind: 'timeline',
      name,
      dispose: () => context.revert(),
      detail: { reduced },
    })

    return () => {
      handle.release()
      context.revert()
      timeline.current = null
    }
    // The dependencies are the caller's; `build` is read through a ref so as
    // not to rebuild the animation on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, name, autoplay])

  return { ref, timeline }
}

/** Options of {@link useTween}. */
export interface TweenOptions {
  /** Name shown in the diagnostics panel. */
  name?: string
  /** Replays the animation on every change of this value. */
  trigger?: unknown
}

/**
 * Animates a single element, without a timeline.
 *
 * A shortcut for the most frequent case. The reverting on unmount and the
 * neutralisation under reduced motion are identical to {@link useTimeline}.
 *
 * @example
 * const ref = useTween<HTMLDivElement>({ rotate: 360, duration: 2, repeat: -1 })
 */
export function useTween<T extends Element = HTMLElement>(
  vars: gsap.TweenVars,
  options: TweenOptions = {},
): RefObject<T | null> {
  const ref = useRef<T | null>(null)
  const varsRef = useRef(vars)
  varsRef.current = vars

  const { name = 'tween', trigger } = options

  useEffect(() => {
    const element = ref.current
    if (element === null) return

    const reduced = motionPolicy.state.reduced

    const context = gsap.context(() => {
      const tween = gsap.to(element, { ...varsRef.current })
      if (reduced) tween.progress(1, true).pause()
    }, element)

    const handle = registry.register({
      kind: 'timeline',
      name,
      dispose: () => context.revert(),
    })

    return () => {
      handle.release()
      context.revert()
    }
  }, [name, trigger])

  return ref
}
