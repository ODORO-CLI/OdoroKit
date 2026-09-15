/**
 * Banded curtain: the content is revealed by vertical bands that withdraw in
 * cascade.
 *
 * ## Overlays, not a mask on the content
 *
 * The content is rendered normally from the very first instant; it is opaque
 * bands laid over it that hide it, then rise one after the other. Masking the
 * content itself — opacity, clip — would make it disappear for screen readers
 * and for in-page search, when it is there and only waiting to be seen.
 *
 * Each band is launched by the Web Animations API with an increasing delay;
 * when the last one ends, the whole overlay leaves the DOM. Nothing remains
 * above the content, not even invisibly.
 *
 * ## The trigger comes from the viewport
 *
 * The curtain waits for the area to enter the viewport, through the `useInView`
 * hook — which opens by itself if observation is impossible: a curtain that
 * never rises is the worst possible fault.
 *
 * Under reduced motion, the overlay is not rendered at all: the content is
 * immediately visible.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useEffect, useState, type ReactElement, type ReactNode } from 'react'

import { useInView } from '@registre/hooks/useInView'

/** Properties specific to the component. */
export interface RevealMaskOwnProps {
  /** Content to reveal. */
  children: ReactNode
  /** Number of bands. @defaultValue 4 */
  bands?: number
  /** Duration of the withdrawal of one band, in milliseconds. @defaultValue 600 */
  duration?: number
  /** Offset between two neighbouring bands, in milliseconds. @defaultValue 90 */
  step?: number
  /** Colour of the bands. @defaultValue the ink token */
  color?: string
}

/** All properties. */
export type RevealMaskProps = Customisable<RevealMaskOwnProps>

/**
 * Reveals its content in bands, on entering the viewport.
 *
 * To replay the animation, remount the component — a different `key` is
 * enough.
 *
 * @example
 * <RevealMask>
 *   <img src={cover} alt="Cover of issue 12" />
 * </RevealMask>
 *
 * @example
 * // Six tight bands, in the brand colour.
 * <RevealMask bands={6} step={60} color="var(--o-palette-brand-500)">
 *   <article className="o-p-8">…</article>
 * </RevealMask>
 */
export function RevealMask({
  children,
  bands = 4,
  duration = 600,
  step = 90,
  color = 'var(--o-theme-bg, currentColor)',
  ...rest
}: RevealMaskProps): ReactElement {
  const { reduced } = useMotionState()
  const { ref, inView } = useInView<HTMLDivElement>()
  const [veil, setVeil] = useState<HTMLDivElement | null>(null)
  const [done, setDone] = useState(false)

  useEffect(() => {
    if (veil === null || !inView) return

    const strips = veil.querySelectorAll('[data-o-reveal-band]')
    let finished = 0
    const animations: Animation[] = []

    strips.forEach((strip, index) => {
      const animation = strip.animate(
        // One notch past 100%: a sub-pixel of band left behind shows as a dark
        // thread at the top of the content.
        [{ transform: 'translateY(0)' }, { transform: 'translateY(-101%)' }],
        {
          duration,
          delay: index * step,
          easing: 'cubic-bezier(0.2, 0, 0, 1)',
          fill: 'forwards',
        },
      )
      animation.onfinish = () => {
        finished += 1
        // The overlay only leaves once the last band is raised: removing it
        // band by band would mean as many React renders.
        if (finished === strips.length) setDone(true)
      }
      animations.push(animation)
    })

    return () => {
      for (const animation of animations) animation.cancel()
    }
  }, [veil, inView, duration, step])

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={ref}
      className={className}
      style={{ position: 'relative', overflow: 'hidden', ...style }}
    >
      {children}
      {/* Under reduced motion, no curtain at all; once raised, it leaves the
          DOM. */}
      {reduced || done ? null : (
        <div
          aria-hidden
          ref={setVeil}
          style={{
            position: 'absolute',
            inset: 0,
            display: 'grid',
            gridTemplateColumns: `repeat(${String(Math.max(1, Math.round(bands)))}, 1fr)`,
            pointerEvents: 'none',
          }}
        >
          {Array.from({ length: Math.max(1, Math.round(bands)) }, (_, index) => (
            <span key={index} data-o-reveal-band="" style={{ background: color }} />
          ))}
        </div>
      )}
    </div>
  )
}
