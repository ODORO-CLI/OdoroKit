/**
 * Swarm: dots that fly as a group following the boids rules, and
 * steer clear of the pointer.
 *
 * ## Why instanced points, and not a shader
 *
 * A fragment shader solves each particle where it stands, with no memory
 * from one frame to the next: a drift, a fall, an explosion are described
 * that way, by a formula of time. A swarm is not. Each boid depends on its
 * neighbours at the previous frame — separation, alignment, cohesion — and
 * that dependency is a state which has to be kept and integrated. The
 * simulation therefore lives on the processor, in two flat arrays, and the
 * render is a single draw call: a cloud of points whose position attribute is
 * rewritten every frame. A few hundred boids in n squared stay well
 * below a millisecond, and this is the simplest technique that holds
 * the frame rate.
 *
 * ## What this background reacts to
 *
 * To the pointer, with damping: the boids that come close to it are pushed
 * away and the swarm opens around it, then closes again as it moves off.
 *
 * ## What this component does not do
 *
 * It opens neither an animation loop nor a size or visibility observer:
 * `useScene` carries those. It writes no colour: the background and the
 * boids are read from the tokens, and repainted in place when the theme
 * flips.
 *
 * @module
 */

import {
  mergePresentation,
  readTokenColour,
  useMotionState,
  type Customisable,
} from '@odoro-cli/engine'
import { useScene, type SceneContext } from '@odoro-cli/engine/three'
import { useEffect, useRef, useState, type ReactElement } from 'react'

import { usePointerDamped } from '@registre/hooks/usePointerDamped'
import { usePoster } from '@registre/hooks/usePoster'

/** Props specific to this component. */
export interface SwarmOwnProps {
  /** Number of boids. @defaultValue 240 */
  count?: number
  /** Flight speed. @defaultValue 1 */
  speed?: number
  /** Pointer avoidance radius, in scene units. @defaultValue 0.9 */
  avoid?: number
  /** Tokens: the background, the boids. */
  colors?: readonly [string, string]
  /** Fallback classes. */
  poster?: string
}

/** All props. */
export type SwarmProps = Customisable<SwarmOwnProps>

/** Tokens used by default. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-palette-brand-500'] as const

/** Default fallback: a frozen tint, in the same tones. */
const DEFAULT_POSTER = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Number of boids at low quality.
 *
 * The cost is in n squared: it is the only lever that counts, and halving
 * it divides the work by four.
 */
const LOW_COUNT = 100

/**
 * Visible half-height at the camera's distance, in scene units:
 * tangent of half the field of view times the distance.
 */
const HALF_HEIGHT = Math.tan((45 / 2) * (Math.PI / 180)) * 5

/** Perception radius of a boid. */
const SIGHT = 0.55

/** A boid: position and velocity, in the plane of the camera. */
interface Boid {
  x: number
  y: number
  vx: number
  vy: number
}

type Three = SceneContext['three']
type Attribute = InstanceType<Three['BufferAttribute']>
type PointsMaterial = InstanceType<Three['PointsMaterial']>

/**
 * Swarm.
 *
 * @example
 * <div className="o-relative o-h-96 o-overflow-hidden">
 *   <Swarm className="o-absolute o-inset-0" />
 *   <div className="o-relative">…</div>
 * </div>
 */
export function Swarm({
  count = 240,
  speed = 1,
  avoid = 0.9,
  colors = DEFAULT_TOKENS,
  poster = DEFAULT_POSTER,
  ...rest
}: SwarmProps): ReactElement {
  const { theme } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)

  const pointer = usePointerDamped({ host, speed: 5, name: 'swarm : pointer' })

  /** What the loop reads: the simulation, the attribute to rewrite, the material. */
  const boids = useRef<Boid[]>([])
  const attribute = useRef<Attribute | null>(null)
  const material = useRef<PointsMaterial | null>(null)
  const context = useRef<SceneContext | null>(null)

  const { ref, ready, refused } = useScene({
    name: 'swarm',
    setup: (scene) => {
      context.current = scene
      const { three, renderer, quality } = scene

      const [bg, tint] = colors.map((token) => readTokenColour(token, host))
      const bgColour = new three.Color(bg?.[0] ?? 0, bg?.[1] ?? 0, bg?.[2] ?? 0)
      // The token is in sRGB and the engine encodes its clear colour from
      // linear to sRGB: without the reverse conversion, the background comes
      // out one notch lighter than the page.
      renderer.setClearColor(bgColour.convertSRGBToLinear(), 1)

      const total = quality === 'low' ? Math.min(count, LOW_COUNT) : count
      const halfWidth = HALF_HEIGHT * scene.camera.aspect

      // Start: positions and headings drawn at random, speeds all equal.
      boids.current = Array.from({ length: total }, () => {
        const heading = Math.random() * Math.PI * 2
        return {
          x: (Math.random() * 2 - 1) * halfWidth,
          y: (Math.random() * 2 - 1) * HALF_HEIGHT,
          vx: Math.cos(heading),
          vy: Math.sin(heading),
        }
      })

      const positions = new three.BufferAttribute(new Float32Array(total * 3), 3)
      positions.setUsage(three.DynamicDrawUsage)
      attribute.current = positions

      const geometry = new three.BufferGeometry()
      geometry.setAttribute('position', positions)

      const points = new three.PointsMaterial({
        size: 0.05,
        transparent: true,
        opacity: 0.9,
        depthWrite: false,
      })
      points.color.setRGB(tint?.[0] ?? 0, tint?.[1] ?? 0, tint?.[2] ?? 0)
      material.current = points

      const cloud = new three.Points(geometry, points)
      cloud.name = 'swarm'
      scene.scene.add(cloud)

      return () => {
        scene.scene.remove(cloud)
        attribute.current = null
        material.current = null
      }
    },

    frame: ({ camera }, { delta }) => {
      const positions = attribute.current
      if (positions === null) return

      // A bounded step: a long frame — a tab brought back to the foreground —
      // must not fling the swarm out of the frame.
      const dt = Math.min(delta, 0.05)
      const halfWidth = HALF_HEIGHT * camera.aspect

      // The pointer in scene units, y upwards.
      const px = pointer.current.x * halfWidth
      const py = -pointer.current.y * HALF_HEIGHT

      const flock = boids.current
      const sight2 = SIGHT * SIGHT
      const cruise = 0.9 * speed
      const limit = 1.6 * speed

      let index = 0
      for (const boid of flock) {
        let sepX = 0
        let sepY = 0
        let aliX = 0
        let aliY = 0
        let cohX = 0
        let cohY = 0
        let seen = 0

        // The three rules, over the neighbours within sight. In n squared:
        // for a few hundred boids, well below a millisecond.
        for (const other of flock) {
          if (other === boid) continue
          const dx = other.x - boid.x
          const dy = other.y - boid.y
          const d2 = dx * dx + dy * dy
          if (d2 > sight2 || d2 === 0) continue
          seen += 1
          // Separation: the stronger the closer the neighbour is.
          sepX -= dx / d2
          sepY -= dy / d2
          aliX += other.vx
          aliY += other.vy
          cohX += dx
          cohY += dy
        }

        let ax = 0
        let ay = 0
        if (seen > 0) {
          ax += sepX * 0.06 + (aliX / seen - boid.vx) * 1.2 + (cohX / seen) * 0.9
          ay += sepY * 0.06 + (aliY / seen - boid.vy) * 1.2 + (cohY / seen) * 0.9
        }

        // Pointer avoidance: a radial push that falls off with the
        // distance, nil beyond the radius.
        const ex = boid.x - px
        const ey = boid.y - py
        const ed = Math.hypot(ex, ey)
        if (ed < avoid && ed > 0.0001) {
          const push = (1 - ed / avoid) * 14
          ax += (ex / ed) * push
          ay += (ey / ed) * push
        }

        // The edges: a gentle pull back inwards, not a wall.
        const marginX = halfWidth * 0.85
        const marginY = HALF_HEIGHT * 0.85
        if (boid.x > marginX) ax -= (boid.x - marginX) * 6
        if (boid.x < -marginX) ax += (-marginX - boid.x) * 6
        if (boid.y > marginY) ay -= (boid.y - marginY) * 6
        if (boid.y < -marginY) ay += (-marginY - boid.y) * 6

        boid.vx += ax * dt
        boid.vy += ay * dt

        // A swarm neither stops nor runs away with itself: the speed is
        // brought back between a cruising speed and a ceiling.
        const v = Math.hypot(boid.vx, boid.vy) || 0.0001
        const clamped = Math.min(Math.max(v, cruise), limit)
        boid.vx = (boid.vx / v) * clamped
        boid.vy = (boid.vy / v) * clamped

        boid.x += boid.vx * dt
        boid.y += boid.vy * dt

        positions.setXYZ(index, boid.x, boid.y, 0)
        index += 1
      }

      positions.needsUpdate = true
    },
  })

  // The theme has flipped: the tokens are read again and the colours repainted
  // in place. The scene is not rebuilt.
  useEffect(() => {
    const scene = context.current
    const points = material.current
    if (scene === null || points === null) return
    const [bg, tint] = colors.map((token) => readTokenColour(token, host))
    if (tint !== undefined) points.color.setRGB(tint[0], tint[1], tint[2])
    if (bg !== undefined) {
      scene.renderer.setClearColor(
        new scene.three.Color(bg[0], bg[1], bg[2]).convertSRGBToLinear(),
        1,
      )
    }
  }, [theme, colors, host])

  const pending = usePoster({ ready, refused })

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  return (
    <div
      {...rest}
      ref={(node) => {
        setHost(node)
        ref.current = node
      }}
      className={className}
      style={style}
      aria-hidden
    >
      {pending.visible ? (
        <div style={pending.style} className={`o-absolute o-inset-0 ${poster}`} />
      ) : null}
    </div>
  )
}
