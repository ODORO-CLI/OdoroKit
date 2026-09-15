/**
 * Swarm: a handful of dots orbiting the pointer.
 *
 * ## Two superimposed movements, and that is all
 *
 * Each dot adds a **chase** — its own position damped towards the pointer —
 * and an **orbit** — a slow turn around that position, at its own radius and
 * its own speed. Nothing else: no collision, no cohesion, no flocking rules. A
 * boids simulation would make the same drawing for ten times the price, and
 * its result would be less predictable from one machine to the next.
 *
 * What gives the impression of a living swarm is that each dot has a different
 * grip on the pointer. At rest, the orbits come together into a turning ring;
 * as soon as the hand flies, the least attached dots stay behind and the swarm
 * stretches into a comet. The dispersion is therefore a consequence of the
 * speed, never a value that gets animated.
 *
 * ## Why the orbit is in turns per second
 *
 * An angle increment per frame would turn twice as fast at a hundred and
 * twenty frames per second. The angle therefore advances as a function of the
 * elapsed time, like the damping of the chase.
 *
 * ## Where it does not show itself
 *
 * Without a fine pointer, no dot is created. Nor under reduced motion: a swarm
 * is perpetual movement, and no final state is left to apply. The system
 * cursor is never hidden.
 *
 * @module
 */

import {
  CLOCK_PRIORITY,
  clock,
  mergePresentation,
  useMotionState,
  type Customisable,
} from '@odoro-cli/engine'
import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Properties specific to the component. */
export interface SwarmCursorOwnProps {
  /**
   * Area where the swarm lives.
   *
   * Provided, it listens only to that area and is clipped to it. Absent, it
   * takes the whole page, as a fixed layer that intercepts nothing.
   */
  children?: ReactNode
  /** Number of dots. @defaultValue 12 */
  count?: number
  /** Radius of the orbit, in pixels. @defaultValue 40 */
  radius?: number
  /** Orbit speed, in turns per second. @defaultValue 0.4 */
  speed?: number
  /** Dispersion: how much the grips differ from one dot to the next. @defaultValue 0.65 */
  spread?: number
  /** Diameter of a dot, in pixels. @defaultValue 6 */
  dotSize?: number
  /** Colour of the dots. A value, not a role. @defaultValue the text colour */
  color?: string
}

/** All properties. */
export type SwarmCursorProps = Customisable<SwarmCursorOwnProps>

/** Identifier of the injected stylesheet. */
const STYLE_ID = 'o-swarm-cursor'

/** Beyond this, the swarm becomes a smudge and every frame costs for nothing. */
const MAX_DOTS = 32

/** Sets the swarm rules, once per document. */
function ensureSwarmCursorRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // The positioning of the area lives in a rule with no specificity: a
    // class from the caller — `o-absolute` to place it inside a frame —
    // must be able to replace it, which an inline style would forbid.
    ':where([data-o-swarm-host="zone"]){position:relative;overflow:hidden}',
    ':where([data-o-swarm-host="page"]){position:fixed;inset:0;z-index:9998;pointer-events:none}',
    '[data-o-swarm-layer]{',
    'position:absolute;inset:0;overflow:hidden;pointer-events:none;',
    'opacity:0;transition:opacity 200ms linear;',
    '}',
    '[data-o-swarm-dot]{position:absolute;left:0;top:0;border-radius:50%;will-change:transform}',
  ].join('')
  document.head.append(style)
}

/**
 * Turns a swarm of dots around the pointer.
 *
 * @example
 * // Over the whole page.
 * <SwarmCursor />
 *
 * @example
 * // Wide, slow and heavily dispersed swarm, confined to a hero.
 * <SwarmCursor count={20} radius={70} speed={0.25} spread={0.9}>
 *   <section className="o-p-16">…</section>
 * </SwarmCursor>
 */
export function SwarmCursor({
  children,
  count = 12,
  radius = 40,
  speed = 0.4,
  spread = 0.65,
  dotSize = 6,
  color = 'currentColor',
  ...rest
}: SwarmCursorProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const wrapping = children !== undefined

  ensureSwarmCursorRule()

  useEffect(() => {
    if (host === null || reduced) return
    if (typeof window === 'undefined') return
    // Coarse pointer: nothing to surround, nothing is created.
    if (!window.matchMedia('(pointer: fine)').matches) return

    const total = Math.max(3, Math.min(MAX_DOTS, Math.round(count)))
    const away = -radius * 4

    const layer = document.createElement('div')
    layer.setAttribute('data-o-swarm-layer', '')
    layer.setAttribute('aria-hidden', 'true')
    host.append(layer)

    const flock: {
      node: HTMLElement
      x: number
      y: number
      grip: number
      angle: number
      turn: number
      reach: number
    }[] = []

    for (let index = 0; index < total; index += 1) {
      const rank = index / total
      const node = document.createElement('span')
      const side = dotSize * (0.6 + Math.random() * 0.8)
      node.setAttribute('data-o-swarm-dot', '')
      node.style.width = `${side.toFixed(1)}px`
      node.style.height = `${side.toFixed(1)}px`
      node.style.margin = `${(-side / 2).toFixed(1)}px`
      node.style.background = color
      node.style.opacity = (0.35 + Math.random() * 0.55).toFixed(2)
      layer.append(node)

      flock.push({
        node,
        x: away,
        y: away,
        // The grip decreases along the rank: it is what stretches the swarm
        // when the hand flies. See the module header.
        grip: 16 * (1 - rank * spread),
        angle: rank * Math.PI * 2,
        // A direction and a cadence of its own: otherwise the dots stay in
        // formation and the ring reads as a cogwheel.
        turn: (Math.random() < 0.5 ? -1 : 1) * (0.6 + Math.random() * 0.8),
        reach: radius * (0.4 + Math.random() * 0.8),
      })
    }

    let box = host.getBoundingClientRect()
    const onFrameChange = (): void => {
      box = host.getBoundingClientRect()
    }

    let targetX = away
    let targetY = away
    let seen = false

    const onMove = (event: Event): void => {
      const pointer = event as PointerEvent
      if (pointer.pointerType === 'touch') return
      targetX = pointer.clientX - box.left
      targetY = pointer.clientY - box.top
      if (!seen) {
        for (const dot of flock) {
          dot.x = targetX
          dot.y = targetY
        }
        seen = true
        layer.style.opacity = '1'
      }
    }

    const onLeave = (): void => {
      layer.style.opacity = '0'
      seen = false
    }

    const surface: HTMLElement | Window = wrapping ? host : window
    surface.addEventListener('pointermove', onMove, { passive: true })
    surface.addEventListener('pointerleave', onLeave)
    window.addEventListener('resize', onFrameChange, { passive: true })
    window.addEventListener('scroll', onFrameChange, { passive: true, capture: true })

    const subscription = clock.subscribe(
      ({ delta }) => {
        if (!seen) return
        for (const dot of flock) {
          const factor = 1 - Math.exp(-dot.grip * delta)
          dot.x += (targetX - dot.x) * factor
          dot.y += (targetY - dot.y) * factor
          dot.angle += dot.turn * speed * Math.PI * 2 * delta
          const orbitX = dot.x + Math.cos(dot.angle) * dot.reach
          const orbitY = dot.y + Math.sin(dot.angle) * dot.reach
          dot.node.style.transform = `translate3d(${orbitX.toFixed(1)}px,${orbitY.toFixed(1)}px,0)`
        }
      },
      { name: 'swarm-cursor : swarm', priority: CLOCK_PRIORITY.default },
    )

    return () => {
      surface.removeEventListener('pointermove', onMove)
      surface.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('resize', onFrameChange)
      window.removeEventListener('scroll', onFrameChange, { capture: true })
      subscription.unsubscribe()
      layer.remove()
    }
  }, [host, reduced, count, radius, speed, spread, dotSize, color, wrapping])

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={setHost}
      className={className}
      style={style as CSSProperties}
      data-o-swarm-host={wrapping ? 'zone' : 'page'}
    >
      {children}
    </div>
  )
}
