/**
 * Splash: on click, drops fly out and fall back.
 *
 * ## A ballistic, not a rosette
 *
 * Sparks fly out in a straight line and die out: that is a flash. A splash, on
 * the other hand, has weight — the drops rise, slow down, then fall, and those
 * that leave flat land further away than those that leave high. Without that
 * curve, one gets an even rosette back, which reads as a mechanism.
 *
 * The curve is not simulated frame by frame. Each drop is given an initial
 * velocity, and its trajectory is **sampled** into five points handed to the
 * Web Animations API as keyframes. The browser interpolates between them on
 * its own thread: nothing runs on the main thread, and the engine loop is not
 * called upon at all.
 *
 * ## The drops live in the DOM, not in state
 *
 * Each impact creates its elements, launches them, and removes them at the end
 * of their animation. Carrying them in React state would impose two renders
 * per click for objects that nobody reads: they are decorative, ephemeral, and
 * their lifecycle is exactly that of their animation.
 *
 * ## The impact ring
 *
 * A crown leaves with the drops and fades faster than they do. It makes the
 * link between the clicked point and the spray: without it, the drops look as
 * if they came from nowhere.
 *
 * ## Where it does not show itself
 *
 * Without a fine pointer, no element is created. Nor under reduced motion: a
 * splash is an entire gesture, and the gesture is what we are asked to leave
 * out.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Properties specific to the component. */
export interface SplashPointerOwnProps {
  /** Area that receives the clicks. */
  children: ReactNode
  /** Number of drops per impact. @defaultValue 14 */
  drops?: number
  /** Horizontal reach of the drops, in pixels. @defaultValue 90 */
  spread?: number
  /** Duration of the flight, in milliseconds. @defaultValue 700 */
  duration?: number
  /** Weight of the drops: the higher, the faster they fall back. @defaultValue 1.4 */
  gravity?: number
  /** Colour of the drops. A value, not a role. @defaultValue the text colour */
  color?: string
}

/** All properties. */
export type SplashPointerProps = Customisable<SplashPointerOwnProps>

/** Beyond this, the spray becomes a smudge and every click costs for nothing. */
const MAX_DROPS = 28

/** Points where the trajectory is sampled. See the module header. */
const SAMPLES = 5

/**
 * Makes every click on its area splash.
 *
 * The wrapper is transparent: it goes around a button, a card or a whole area,
 * without changing anything to their layout.
 *
 * @example
 * <SplashPointer>
 *   <button type="button" className="o-px-6 o-py-3">Send</button>
 * </SplashPointer>
 *
 * @example
 * // Wide and heavy spray, tinted.
 * <SplashPointer drops={22} spread={140} gravity={2.2} color="var(--o-palette-brand-500)">
 *   <div className="o-p-10">The whole card responds</div>
 * </SplashPointer>
 */
export function SplashPointer({
  children,
  drops = 14,
  spread = 90,
  duration = 700,
  gravity = 1.4,
  color = 'currentColor',
  ...rest
}: SplashPointerProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)

  useEffect(() => {
    if (host === null || reduced) return
    if (typeof window === 'undefined') return
    // Coarse pointer: nothing subscribes, no element is created.
    if (!window.matchMedia('(pointer: fine)').matches) return

    const total = Math.max(3, Math.min(MAX_DROPS, Math.round(drops)))

    const onPointerDown = (event: PointerEvent): void => {
      if (event.pointerType === 'touch') return
      const box = host.getBoundingClientRect()
      const x = event.clientX - box.left
      const y = event.clientY - box.top

      // The impact crown, briefer than the drops.
      const ring = document.createElement('span')
      ring.setAttribute('aria-hidden', 'true')
      ring.setAttribute('data-o-splash', '')
      ring.style.position = 'absolute'
      ring.style.left = `${x.toFixed(1)}px`
      ring.style.top = `${y.toFixed(1)}px`
      ring.style.width = '18px'
      ring.style.height = '18px'
      ring.style.margin = '-9px'
      ring.style.borderRadius = '50%'
      ring.style.border = `1.5px solid ${color}`
      ring.style.pointerEvents = 'none'
      host.append(ring)
      const wave = ring.animate(
        [
          { transform: 'scale(0.2)', opacity: 0.9 },
          { transform: `scale(${(spread / 24).toFixed(2)})`, opacity: 0 },
        ],
        {
          duration: Math.round(duration * 0.6),
          easing: 'cubic-bezier(0, 0, 0.2, 1)',
          fill: 'forwards',
        },
      )
      wave.onfinish = () => ring.remove()

      for (let index = 0; index < total; index += 1) {
        // Spread around the turn, then scrambled: a perfect wheel would read
        // as a mechanism. The draw happens on the click, client side only, so
        // it cannot create a hydration mismatch.
        const angle = ((index + Math.random() * 0.7) / total) * Math.PI * 2
        const power = spread * (0.55 + Math.random() * 0.7)
        const speedX = Math.cos(angle) * power
        // Every drop leaves upwards: it is gravity that brings them back, and
        // that is where the curve comes from.
        const speedY = -Math.abs(Math.sin(angle)) * power * 0.9 - power * 0.35
        const side = 3 + Math.random() * 4

        const drop = document.createElement('span')
        drop.setAttribute('aria-hidden', 'true')
        drop.setAttribute('data-o-splash', '')
        drop.style.position = 'absolute'
        drop.style.left = `${x.toFixed(1)}px`
        drop.style.top = `${y.toFixed(1)}px`
        drop.style.width = `${side.toFixed(1)}px`
        drop.style.height = `${side.toFixed(1)}px`
        drop.style.margin = `${(-side / 2).toFixed(1)}px`
        drop.style.borderRadius = '50%'
        drop.style.background = color
        drop.style.pointerEvents = 'none'
        host.append(drop)

        const frames: Keyframe[] = []
        for (let step = 0; step < SAMPLES; step += 1) {
          const time = step / (SAMPLES - 1)
          const flightX = speedX * time
          const flightY = speedY * time + gravity * power * time * time
          frames.push({
            offset: time,
            transform: `translate3d(${flightX.toFixed(1)}px,${flightY.toFixed(1)}px,0) scale(${(1 - time * 0.5).toFixed(2)})`,
            opacity: time < 0.6 ? 1 : (1 - time) / 0.4,
          })
        }

        const flight = drop.animate(frames, {
          duration,
          easing: 'linear',
          fill: 'forwards',
        })
        flight.onfinish = () => drop.remove()
      }
    }

    host.addEventListener('pointerdown', onPointerDown)
    return () => {
      host.removeEventListener('pointerdown', onPointerDown)
      // The drops still in flight belong to this instance: they leave with it.
      for (const orphan of host.querySelectorAll('[data-o-splash]')) orphan.remove()
    }
  }, [host, reduced, drops, spread, duration, gravity, color])

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={setHost}
      className={className}
      // The drops are absolute inside the area and clipped at its edges:
      // without the hidden overflow, a spray near the edge would spill over
      // the page.
      style={{ position: 'relative', overflow: 'hidden', ...style } as CSSProperties}
    >
      {children}
    </div>
  )
}
