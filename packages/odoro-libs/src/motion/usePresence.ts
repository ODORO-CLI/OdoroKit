/**
 * Exit animation before unmounting.
 *
 * React unmounts an element as soon as the render condition becomes false: there
 * is nothing left to animate. This hook interposes an exit state — it keeps
 * reporting that the element must be rendered until its disappearance
 * animation is over.
 *
 * @module
 */

import { type RefObject, useEffect, useLayoutEffect, useRef, useState } from 'react'

import { usePrefersReducedMotion } from '../shared/motionPreference.js'
import { type MotionKeyframe, VISIBLE, clearStyles } from './keyframes.js'
import {
  type DurationInput,
  type EasingInput,
  resolveDuration,
  resolveEasing,
} from './tokens.js'

/** Step in the life cycle of an element driven by {@link usePresence}. */
export type PresenceStatus = 'entering' | 'entered' | 'exiting' | 'exited'

/** Options of {@link usePresence}. */
export interface PresenceOptions {
  /** Starting state on entry. @defaultValue zero opacity, reduced scale */
  enter?: MotionKeyframe
  /** End state on exit. @defaultValue zero opacity, reduced scale */
  exit?: MotionKeyframe
  /** Duration: token name or milliseconds. @defaultValue 'base' */
  duration?: DurationInput
  /** Entrance curve. @defaultValue 'entrance' */
  easingIn?: EasingInput
  /** Exit curve. @defaultValue 'exit' */
  easingOut?: EasingInput
  /**
   * Plays the entrance animation from the first render, even if the element is
   * present right away.
   *
   * @defaultValue false
   */
  initial?: boolean
}

/** Value returned by {@link usePresence}. */
export interface Presence<T extends HTMLElement> {
  /** Ref to place on the animated element. */
  ref: RefObject<T | null>
  /**
   * `true` as long as the element must stay in the tree — including during its
   * exit.
   */
  isMounted: boolean
  /** Current step of the life cycle. */
  status: PresenceStatus
}

const DEFAULT_ENTER: MotionKeyframe = { opacity: 0, transform: 'scale(0.96)' }

/**
 * Delays the unmounting of an element for the duration of its exit animation.
 *
 * Under `prefers-reduced-motion`, both animations are neutralized and the
 * unmounting becomes immediate again.
 *
 * @param present Display condition wanted by the application.
 *
 * @example
 * const { ref, isMounted } = usePresence<HTMLDivElement>(open)
 *
 * if (!isMounted) return null
 * return <div ref={ref} role="dialog">...</div>
 */
export function usePresence<T extends HTMLElement = HTMLElement>(
  present: boolean,
  options: PresenceOptions = {},
): Presence<T> {
  const {
    enter = DEFAULT_ENTER,
    exit = enter,
    duration = 'base',
    easingIn = 'entrance',
    easingOut = 'exit',
    initial = false,
  } = options

  const ref = useRef<T | null>(null)
  const animationRef = useRef<Animation | null>(null)
  const isFirstRun = useRef(true)
  const reduced = usePrefersReducedMotion()

  const [isMounted, setIsMounted] = useState(present)
  const [status, setStatus] = useState<PresenceStatus>(present ? 'entered' : 'exited')

  // The mount must precede the entrance animation: without this separate effect,
  // the element would not exist yet when we try to animate it.
  useLayoutEffect(() => {
    if (present) setIsMounted(true)
  }, [present])

  useLayoutEffect(() => {
    const element = ref.current
    const first = isFirstRun.current
    isFirstRun.current = false

    if (!isMounted || element === null) {
      if (!present) setStatus('exited')
      return
    }

    animationRef.current?.cancel()
    animationRef.current = null

    if (reduced || (first && present && !initial)) {
      setStatus(present ? 'entered' : 'exited')
      if (!present) setIsMounted(false)
      return
    }

    const keyframes = present
      ? [{ ...enter }, { ...VISIBLE }]
      : [{ ...VISIBLE }, { ...exit }]
    const animation = element.animate(keyframes, {
      duration: resolveDuration(duration),
      easing: resolveEasing(present ? easingIn : easingOut),
      fill: 'both',
    })

    animationRef.current = animation
    setStatus(present ? 'entering' : 'exiting')

    void animation.finished.then(
      () => {
        if (animationRef.current !== animation) return
        if (present) {
          // The end state is the natural state: we release the animation
          // rather than letting it hold a composition layer.
          animation.cancel()
          clearStyles(element, VISIBLE)
          animationRef.current = null
          setStatus('entered')
        } else {
          setStatus('exited')
          setIsMounted(false)
        }
      },
      () => undefined,
    )
    // `enter` and `exit` are literals on the caller side: comparing them by
    // identity would restart the animation on every render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [present, isMounted, reduced, duration, easingIn, easingOut, initial])

  useEffect(
    () => () => {
      animationRef.current?.cancel()
      animationRef.current = null
    },
    [],
  )

  return { ref, isMounted, status }
}
