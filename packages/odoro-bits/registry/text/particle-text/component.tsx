/**
 * Particles: the heading assembles itself out of a cloud, then becomes text
 * again.
 *
 * ## The canvas is scaffolding, not the final rendering
 *
 * The cloud is painted on a canvas laid over the heading, for the duration of
 * the assembly — a few seconds — then it clears and the real text takes its
 * place back. Nothing is left on the browser's hands afterwards: no loop, no
 * surface, no context.
 *
 * That is why the real heading is written in the flow and gives the component
 * its box. It is made transparent **only during** the cloud: if the canvas is
 * missing, if the 2D context is refused, if the measurement fails, the heading
 * is simply there.
 *
 * ## The targets come from the text itself
 *
 * The heading is drawn once off screen, in its own font and at its own size,
 * and the alpha channel is sampled at the requested step: every covered point
 * becomes the destination of a particle. No shape is described by hand —
 * changing the font changes the cloud.
 *
 * ## The final cross-fade is not a flourish
 *
 * A cloud of squares, however perfectly arranged, is not a glyph: the passage
 * from one to the other would be a jump. The two therefore cross over two
 * tenths of a second, which makes the seam invisible without having to measure
 * anything to the pixel.
 *
 * ## One line, one heading
 *
 * The sampling assumes a text that fits on one line: that is the use case — a
 * heading. A paragraph would give tens of thousands of particles for an
 * unreadable effect.
 *
 * ## Reduced motion
 *
 * No cloud, no canvas: the heading is there, assembled. That is the arrival
 * state.
 *
 * @module
 */

import {
  CLOCK_PRIORITY,
  clock,
  mergePresentation,
  useMotionState,
  type ClockSubscription,
  type Customisable,
} from '@odoro-cli/engine'
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactElement,
} from 'react'

import { useInView } from '@registre/hooks/useInView'

/** What triggers the assembly. */
export type ParticleTextTrigger = 'mount' | 'view' | 'hover'

/** Properties specific to the component. */
export interface ParticleTextOwnProps {
  /** Text to assemble. A string, fitting on one line. */
  children: string
  /** Rendered tag. @defaultValue 'span' */
  as?: ElementType
  /** Sampling step, in pixels. The lower, the denser. @defaultValue 5 */
  step?: number
  /** Duration of the flight of one particle, in milliseconds. @defaultValue 1400 */
  duration?: number
  /** Spread of the departures, in milliseconds. @defaultValue 600 */
  spread?: number
  /**
   * When to assemble.
   *
   * @defaultValue 'view'
   */
  trigger?: ParticleTextTrigger
}

/** All properties. */
export type ParticleTextProps = Customisable<ParticleTextOwnProps, 'span'>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-particle-text'

/** Ceiling on particles: beyond it, the cost grows without the eye gaining. */
const MAX_PARTICLES = 2400

/** Duration of the cross-fade between the cloud and the text, in milliseconds. */
const FADE_MS = 240

/** Sets the layer rules, once per document. */
function ensureParticleRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-particle]{position:relative;display:inline-block}',
    '[data-o-particle-source]{display:inline-block}',
    // The original is only transparent during the cloud.
    '[data-o-particle-hidden]{color:transparent}',
    '[data-o-particle-layer]{',
    'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;',
    '}',
  ].join('')
  document.head.append(style)
}

/** Sharp then damped ease out: the particle arrives, it does not brake. */
function damped(t: number): number {
  const rest = 1 - t
  return 1 - rest * rest * rest
}

/**
 * Assembles a heading out of a cloud of particles.
 *
 * @example
 * <ParticleText as="h1" className="o-text-6xl o-font-black">
 *   Odoro
 * </ParticleText>
 *
 * @example
 * // A dense and slow cloud, replayed on every hover.
 * <ParticleText step={3} duration={2400} trigger="hover">Workshop</ParticleText>
 */
export function ParticleText({
  children,
  as: Tag = 'span',
  step = 5,
  duration = 1400,
  spread = 600,
  trigger = 'view',
  ...rest
}: ParticleTextProps): ReactElement {
  const { reduced } = useMotionState()
  const { ref: hostRef, inView } = useInView<HTMLElement>({
    immediate: trigger === 'mount',
  })

  const sourceRef = useRef<HTMLSpanElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [running, setRunning] = useState(false)

  ensureParticleRule()

  useEffect(() => {
    if (reduced) return

    const host = hostRef.current
    const source = sourceRef.current
    const canvas = canvasRef.current
    if (host === null || source === null || canvas === null) return

    let subscription: ClockSubscription | null = null

    const stop = (): void => {
      subscription?.unsubscribe()
      subscription = null
      const ctx = canvas.getContext('2d')
      ctx?.clearRect(0, 0, canvas.width, canvas.height)
      setRunning(false)
    }

    const play = (): void => {
      subscription?.unsubscribe()
      subscription = null

      const box = source.getBoundingClientRect()
      if (box.width < 8 || box.height < 8) return

      const ctx = canvas.getContext('2d', { willReadFrequently: true })
      if (ctx === null) return

      // Twice the resolution is enough: beyond that, four times as many pixels
      // are painted for a difference the screen does not show.
      const scale = Math.min(2, window.devicePixelRatio || 1)
      const width = Math.max(1, Math.round(box.width * scale))
      const height = Math.max(1, Math.round(box.height * scale))
      canvas.width = width
      canvas.height = height

      const dressing = getComputedStyle(source)
      const ink = dressing.color
      const fontSize = Number.parseFloat(dressing.fontSize) * scale

      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.globalAlpha = 1
      ctx.clearRect(0, 0, width, height)
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.font = `${dressing.fontStyle} ${dressing.fontWeight} ${String(fontSize)}px ${dressing.fontFamily}`
      ctx.fillStyle = ink
      ctx.fillText(children, width / 2, height / 2)

      const pixels = ctx.getImageData(0, 0, width, height).data
      ctx.clearRect(0, 0, width, height)

      const pitch = Math.max(2, Math.round(step * scale))
      const targets: number[] = []
      for (let y = 0; y < height; y += pitch) {
        for (let x = 0; x < width; x += pitch) {
          if ((pixels[(y * width + x) * 4 + 3] ?? 0) > 128) targets.push(x, y)
        }
      }

      const total = targets.length / 2
      if (total === 0) return

      // Every other step, every third… rather than a random draw: the cloud
      // keeps its distribution, it does not go patchy in places.
      const skip = Math.max(1, Math.ceil(total / MAX_PARTICLES))
      const count = Math.floor((total + skip - 1) / skip)

      const target = new Float32Array(count * 2)
      const start = new Float32Array(count * 2)
      const delay = new Float32Array(count)

      const radius = Math.max(width, height)
      for (let index = 0; index < count; index += 1) {
        const read = index * skip * 2
        target[index * 2] = targets[read] ?? 0
        target[index * 2 + 1] = targets[read + 1] ?? 0

        const angle = Math.random() * Math.PI * 2
        const distance = radius * (0.6 + Math.random() * 0.7)
        start[index * 2] = width / 2 + Math.cos(angle) * distance
        start[index * 2 + 1] = height / 2 + Math.sin(angle) * distance
        delay[index] = Math.random() * spread
      }

      const size = Math.max(1, pitch * 0.72)
      const began = performance.now()
      let revealed = false
      let fadeStartedAt = 0

      setRunning(true)

      subscription = clock.subscribe(
        () => {
          const elapsed = performance.now() - began

          if (!revealed && elapsed > spread + duration) {
            revealed = true
            fadeStartedAt = elapsed
            // The real text comes back while the cloud fades out: the two
            // cross over, and the seam does not show.
            setRunning(false)
          }

          const opacity = revealed ? 1 - (elapsed - fadeStartedAt) / FADE_MS : 1
          if (opacity <= 0) {
            stop()
            return
          }

          ctx.clearRect(0, 0, width, height)
          ctx.globalAlpha = opacity
          ctx.fillStyle = ink

          for (let index = 0; index < count; index += 1) {
            const progress = Math.min(
              1,
              Math.max(0, (elapsed - (delay[index] ?? 0)) / duration),
            )
            const part = damped(progress)
            const ax = start[index * 2] ?? 0
            const ay = start[index * 2 + 1] ?? 0
            const bx = target[index * 2] ?? 0
            const by = target[index * 2 + 1] ?? 0
            ctx.fillRect(ax + (bx - ax) * part, ay + (by - ay) * part, size, size)
          }
        },
        { name: 'particle heading', priority: CLOCK_PRIORITY.default },
      )
    }

    if (trigger === 'hover') {
      const onEnter = (): void => {
        play()
      }
      host.addEventListener('pointerenter', onEnter)
      return () => {
        host.removeEventListener('pointerenter', onEnter)
        stop()
      }
    }

    if (inView) play()
    return stop
  }, [hostRef, reduced, inView, children, step, duration, spread, trigger])

  const { className, style } = mergePresentation({}, rest)

  return (
    <Tag
      {...rest}
      ref={hostRef}
      className={className}
      style={style as CSSProperties}
      data-o-particle=""
    >
      <span
        ref={sourceRef}
        data-o-particle-source=""
        {...(running ? { 'data-o-particle-hidden': '' } : {})}
      >
        {children}
      </span>
      <canvas ref={canvasRef} aria-hidden="true" data-o-particle-layer="" />
    </Tag>
  )
}
