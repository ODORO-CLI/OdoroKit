/**
 * Progression de defilement, normalisee entre 0 et 1.
 *
 * @module
 */

import { type RefObject, useEffect, useRef, useState } from 'react'

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
 * La mesure est faite dans un `requestAnimationFrame` coalescant : plusieurs
 * evenements de defilement dans la meme image ne provoquent qu'une lecture et
 * au plus un rendu.
 *
 * @example
 * const progress = useScrollProgress()
 * <div className="o-fixed o-top-0 o-left-0 o-h-1 o-bg-primary" style={{ width: `${progress * 100}%` }} />
 */
export function useScrollProgress(options: ScrollProgressOptions = {}): number {
  const { precision = 3 } = options
  const [progress, setProgress] = useState(0)
  const frame = useRef(0)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const measure = (): void => {
      frame.current = 0
      const root = document.documentElement
      const max = root.scrollHeight - root.clientHeight
      setProgress(max <= 0 ? 0 : clamp(root.scrollTop / max, precision))
    }

    const schedule = (): void => {
      if (frame.current !== 0) return
      frame.current = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame.current !== 0) cancelAnimationFrame(frame.current)
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
  const frame = useRef(0)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const measure = (): void => {
      frame.current = 0
      const element = ref.current
      if (element === null) return
      const rect = element.getBoundingClientRect()
      const viewport = window.innerHeight
      const total = rect.height + viewport
      setProgress(total <= 0 ? 0 : clamp((viewport - rect.top) / total, precision))
    }

    const schedule = (): void => {
      if (frame.current !== 0) return
      frame.current = requestAnimationFrame(measure)
    }

    measure()
    window.addEventListener('scroll', schedule, { passive: true })
    window.addEventListener('resize', schedule, { passive: true })
    return () => {
      window.removeEventListener('scroll', schedule)
      window.removeEventListener('resize', schedule)
      if (frame.current !== 0) cancelAnimationFrame(frame.current)
    }
  }, [precision])

  return [ref, progress]
}
