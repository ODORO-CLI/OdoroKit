/**
 * Glitch on hover: the content breaks into offset slices, briefly.
 *
 * ## Two copies, animated outside React state
 *
 * The content is rendered three times: the original, intact, and two
 * superimposed copies, invisible at rest and mute to screen readers. The burst
 * is a Web Animations animation on each copy: a series of `clip-path` slices
 * offset by translation, each step in `step-end` — a glitch is made of jumps,
 * not of slides. Nothing goes through a React render: the burst starts, ends,
 * and the copies become invisible again on their own since the animation does
 * not fill.
 *
 * ## The colour aberration
 *
 * Each copy carries a drop shadow tinted on one side — one warm, the other
 * cold, read from the palette. The gap between the two is what manufactures
 * the chromatic fringe of badly calibrated screens, without duplicating the
 * content a third time.
 *
 * The slices are drawn at trigger time, client side: each burst is different,
 * and no randomness crosses the initial render.
 *
 * Under reduced motion, the copies are not rendered and nothing listens to the
 * hover: the area is static.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Properties specific to the component. */
export interface GlitchHoverOwnProps {
  /** Content that breaks into a glitch. */
  children: ReactNode
  /** Amplitude of the slice offset, in pixels. @defaultValue 6 */
  intensity?: number
  /** Number of slices per copy. @defaultValue 3 */
  slices?: number
}

/** All properties. */
export type GlitchHoverProps = Customisable<GlitchHoverOwnProps>

/** Duration of a burst: short, which is what makes it credible. */
const BURST = 400

/** Style common to both copies: laid over the original, mute, invisible. */
const COPY_STYLE: CSSProperties = {
  position: 'absolute',
  inset: 0,
  pointerEvents: 'none',
  opacity: 0,
}

/**
 * Builds the slice sequence of one copy.
 *
 * @param direction Side of the offset, +1 or -1: the two copies go in
 * opposite directions, and their crossing is what reads as a glitch.
 */
function makeBurst(direction: 1 | -1, intensity: number, slices: number): Keyframe[] {
  const frames: Keyframe[] = [
    {
      clipPath: 'inset(0 0 100% 0)',
      transform: 'translateX(0)',
      opacity: 0,
      easing: 'step-end',
    },
  ]

  const steps = Math.max(2, Math.round(slices)) * 2
  for (let index = 0; index < steps; index += 1) {
    const top = Math.random() * 82
    const height = 5 + Math.random() * 14
    const offset = direction * (0.4 + Math.random() * 0.6) * intensity
    frames.push({
      clipPath: `inset(${top.toFixed(1)}% 0 ${Math.max(0, 100 - top - height).toFixed(1)}% 0)`,
      transform: `translateX(${offset.toFixed(1)}px)`,
      opacity: 0.9,
      easing: 'step-end',
    })
  }

  frames.push({ clipPath: 'inset(0 0 100% 0)', transform: 'translateX(0)', opacity: 0 })
  return frames
}

/**
 * Makes its area glitch on hover and on focus.
 *
 * Put the inner padding on the content rather than on the wrapper: the copies
 * line up with the box of the wrapper, and a padding on it would offset them
 * from the original.
 *
 * @example
 * <GlitchHover className="o-inline-block">
 *   <div className="o-rounded-xl o-border-w-1 o-p-6">Thumbnail</div>
 * </GlitchHover>
 *
 * @example
 * // A more violent burst, in six slices.
 * <GlitchHover intensity={12} slices={6}>
 *   <img src={cover} alt="Sleeve" />
 * </GlitchHover>
 */
export function GlitchHover({
  children,
  intensity = 6,
  slices = 3,
  ...rest
}: GlitchHoverProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const warm = useRef<HTMLDivElement | null>(null)
  const cold = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (host === null || reduced) return

    let running = 0

    const trigger = (): void => {
      // One burst at a time: restarting mid-flight would chop the end of the
      // previous one without adding anything.
      if (running > 0) return

      const copies: readonly [HTMLDivElement | null, 1 | -1][] = [
        [warm.current, 1],
        [cold.current, -1],
      ]
      for (const [copy, direction] of copies) {
        if (copy === null) continue
        running += 1
        const animation = copy.animate(makeBurst(direction, intensity, slices), {
          duration: BURST,
          fill: 'none',
        })
        animation.onfinish = () => {
          running -= 1
        }
        animation.oncancel = () => {
          running -= 1
        }
      }
    }

    // `focusin` bubbles up from focusable children: a button inside the area
    // triggers the burst from the keyboard too.
    host.addEventListener('pointerenter', trigger)
    host.addEventListener('focusin', trigger)
    return () => {
      host.removeEventListener('pointerenter', trigger)
      host.removeEventListener('focusin', trigger)
    }
  }, [host, reduced, intensity, slices])

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={setHost}
      className={className}
      style={{ position: 'relative', ...style }}
    >
      {children}
      {/* Under reduced motion, the copies do not exist: nothing to animate,
          nothing to superimpose. */}
      {reduced ? null : (
        <>
          <div
            aria-hidden
            ref={warm}
            style={{
              ...COPY_STYLE,
              filter: 'drop-shadow(1px 0 0 var(--o-palette-red-400, currentColor))',
            }}
          >
            {children}
          </div>
          <div
            aria-hidden
            ref={cold}
            style={{
              ...COPY_STYLE,
              filter: 'drop-shadow(-1px 0 0 var(--o-palette-cyan-400, currentColor))',
            }}
          >
            {children}
          </div>
        </>
      )}
    </div>
  )
}
