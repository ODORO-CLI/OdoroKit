/**
 * Animation de sortie avant demontage.
 *
 * React demonte un element des que la condition de rendu devient fausse : il
 * n'y a plus rien a animer. Ce hook interpose un etat de sortie — il continue
 * de signaler que l'element doit etre rendu jusqu'a ce que son animation de
 * disparition soit terminee.
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

/** Etape du cycle de vie d'un element pilote par {@link usePresence}. */
export type PresenceStatus = 'entering' | 'entered' | 'exiting' | 'exited'

/** Options de {@link usePresence}. */
export interface PresenceOptions {
  /** Etat de depart a l'entree. @defaultValue opacite nulle, echelle reduite */
  enter?: MotionKeyframe
  /** Etat d'arrivee a la sortie. @defaultValue opacite nulle, echelle reduite */
  exit?: MotionKeyframe
  /** Duree : nom de token ou millisecondes. @defaultValue 'base' */
  duration?: DurationInput
  /** Courbe d'entree. @defaultValue 'entrance' */
  easingIn?: EasingInput
  /** Courbe de sortie. @defaultValue 'exit' */
  easingOut?: EasingInput
  /**
   * Joue l'animation d'entree des le premier rendu, meme si l'element est
   * present d'emblee.
   *
   * @defaultValue false
   */
  initial?: boolean
}

/** Valeur retournee par {@link usePresence}. */
export interface Presence<T extends HTMLElement> {
  /** Ref a poser sur l'element anime. */
  ref: RefObject<T | null>
  /**
   * `true` tant que l'element doit rester dans l'arbre — y compris pendant sa
   * sortie.
   */
  isMounted: boolean
  /** Etape courante du cycle de vie. */
  status: PresenceStatus
}

const DEFAULT_ENTER: MotionKeyframe = { opacity: 0, transform: 'scale(0.96)' }

/**
 * Retarde le demontage d'un element le temps de son animation de sortie.
 *
 * Sous `prefers-reduced-motion`, les deux animations sont neutralisees et le
 * demontage redevient immediat.
 *
 * @param present Condition d'affichage voulue par l'application.
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

  // Le montage doit precede l'animation d'entree : sans cet effet separe,
  // l'element n'existerait pas encore quand on cherche a l'animer.
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
          // L'etat d'arrivee est l'etat naturel : on relache l'animation
          // plutot que de la laisser retenir une couche de composition.
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
    // `enter` et `exit` sont des litteraux cote appelant : les comparer par
    // identite relancerait l'animation a chaque rendu.
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
