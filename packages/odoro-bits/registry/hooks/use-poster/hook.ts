/**
 * Visual fallback of an expensive component.
 *
 * ## Why the fallback is shown first
 *
 * A 3D rendering engine weighs more than a hundred kilobytes compressed.
 * Between the arrival of the page and the first frame of the scene, a delay
 * goes by that is counted in hundreds of milliseconds on an ordinary
 * connection. Mounting the scene first and the fallback afterwards would
 * amount to displaying an empty rectangle for all that time — in the most
 * visible spot on the page.
 *
 * The fallback is therefore rendered **immediately**, in the document, and
 * only disappears once the scene is ready. It also serves when the scene will
 * never come: without WebGL, under reduced motion, or when the surface
 * arbiter says no.
 *
 * ## Why it is not simply removed
 *
 * A blunt removal makes the transition flicker between two very close but not
 * identical frames. The fade, on the other hand, hides the gap. Its duration
 * comes from the tokens: it follows the project setting rather than imposing
 * its own.
 *
 * @module
 */

import { useEffect, useRef, useState, type CSSProperties } from 'react'

/** Options of `usePoster`. */
export interface PosterOptions {
  /** Turns true when the scene has rendered its first frame. */
  ready: boolean
  /**
   * Reason for which the scene will never be mounted. Its presence keeps the
   * fallback in place indefinitely.
   */
  refused?: string | undefined
  /** Duration of the fade, in milliseconds. @defaultValue 320 */
  fade?: number
}

/** What `usePoster` returns. */
export interface PosterHandle {
  /** `true` as long as the fallback has to stay in the document. */
  readonly visible: boolean
  /** Styles to apply to the fallback. */
  readonly style: CSSProperties
}

/**
 * Drives the display and the disappearance of a fallback.
 *
 * The fallback stays mounted for the whole length of the fade: removing it
 * right at the start would make the scene appear all at once, which is exactly
 * what the fade exists to avoid.
 *
 * @example
 * const { ref, ready, refused } = useScene({ ... })
 * const poster = usePoster({ ready, refused })
 *
 * return (
 *   <div className="o-relative">
 *     <div ref={ref} className="o-absolute o-inset-0" />
 *     {poster.visible ? (
 *       <div style={poster.style} className="o-absolute o-inset-0 o-bg-zinc-100 dark:o-bg-zinc-950" />
 *     ) : null}
 *   </div>
 * )
 */
export function usePoster(options: PosterOptions): PosterHandle {
  const { ready, refused, fade = 320 } = options

  const [visible, setVisible] = useState(true)
  const [opacity, setOpacity] = useState(1)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    // The scene will not come: the fallback is the final output, not a wait.
    if (refused !== undefined) {
      setVisible(true)
      setOpacity(1)
      return
    }

    if (!ready) return

    setOpacity(0)
    timer.current = setTimeout(() => setVisible(false), fade)

    return () => clearTimeout(timer.current)
  }, [ready, refused, fade])

  return {
    visible,
    style: {
      opacity,
      transition: `opacity ${fade}ms var(--o-ease-entrance, ease-out)`,
      // The fallback fades out, but it must not intercept any click meanwhile.
      pointerEvents: 'none',
    },
  }
}
