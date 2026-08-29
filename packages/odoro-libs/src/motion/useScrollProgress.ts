/**
 * Progression de defilement, normalisee entre 0 et 1.
 *
 * ## La seule boucle de la librairie, et elle est cedable
 *
 * Une progression de defilement se lit **a l'image**, pas a l'evenement : un
 * navigateur emet des dizaines d'evenements de defilement par seconde, et
 * mesurer a chacun recalcule la mise en page autant de fois.
 *
 * C'est la seule chose dans `@odoro-cli/libs/motion` qui ouvre une boucle — tout
 * le reste passe par la Web Animations API, pilotee par le compositeur. Elle
 * passe donc par `onFrame`, l'ordonnanceur cedable de
 * `@odoro-cli/libs/motion-policy` : quand `@odoro-cli/engine` est present, il
 * l'installe sur son ticker et il n'y a plus qu'une boucle sur la page.
 *
 * @module
 */

import { type RefObject, useEffect, useRef, useState } from 'react'

import { onFrame } from '../motion-policy/index.js'

/** Options de {@link useScrollProgress}. */
export interface ScrollProgressOptions {
  /**
   * Nombre de decimales conservees. Chaque changement de valeur provoque un
   * rendu : arrondir evite de re-rendre a chaque pixel defile.
   *
   * @defaultValue 3
   */
  precision?: number
}

/** Arrondit une progression a la precision demandee, bornee entre 0 et 1. */
function clamp(value: number, precision: number): number {
  const factor = 10 ** precision
  return Math.round(Math.min(1, Math.max(0, value)) * factor) / factor
}

/**
 * Progression du defilement de la page : 0 en haut, 1 tout en bas.
 *
 * La mesure est coalescee sur l'image : plusieurs evenements de defilement
 * dans la meme image ne provoquent qu'une lecture et au plus un rendu. Elle
 * passe par l'ordonnanceur cedable, non par `requestAnimationFrame` en dur.
 *
 * @example
 * const progress = useScrollProgress()
 * <div className="o-fixed o-top-0 o-left-0 o-h-1 o-bg-brand-600 dark:o-bg-brand-400" style={{ width: `${progress * 100}%` }} />
 */
export function useScrollProgress(options: ScrollProgressOptions = {}): number {
  const { precision = 3 } = options
  const [progress, setProgress] = useState(0)
  const cancel = useRef<(() => void) | undefined>(undefined)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const measure = (): void => {
      cancel.current = undefined
      const root = document.documentElement
      const max = root.scrollHeight - root.clientHeight
      setProgress(max <= 0 ? 0 : clamp(root.scrollTop / max, precision))
    }

    // Coalescant : plusieurs evenements dans la meme image ne provoquent
    // qu'une lecture, et au plus un rendu.
    const schedule = (): void => {
      if (cancel.current !== undefined) return
      cancel.current = onFrame(measure)
    }

    measure()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      cancel.current?.()
      cancel.current = undefined
    }
  }, [precision])

  return progress
}

/**
 * Progression de la traversee d'un element par le viewport : 0 quand son haut
 * atteint le bas de l'ecran, 1 quand son bas quitte le haut de l'ecran.
 *
 * @example
 * const [ref, progress] = useElementScrollProgress<HTMLElement>()
 */
export function useElementScrollProgress<T extends HTMLElement = HTMLElement>(
  options: ScrollProgressOptions = {},
): [RefObject<T | null>, number] {
  const { precision = 3 } = options
  const ref = useRef<T | null>(null)
  const [progress, setProgress] = useState(0)
  const cancel = useRef<(() => void) | undefined>(undefined)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const measure = (): void => {
      cancel.current = undefined
      const element = ref.current
      if (element === null) return
      const rect = element.getBoundingClientRect()
      const viewport = window.innerHeight
      const total = rect.height + viewport
      setProgress(total <= 0 ? 0 : clamp((viewport - rect.top) / total, precision))
    }

    const schedule = (): void => {
      if (cancel.current !== undefined) return
      cancel.current = onFrame(measure)
    }

    measure()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      cancel.current?.()
      cancel.current = undefined
    }
  }, [precision])

  return [ref, progress]
}
