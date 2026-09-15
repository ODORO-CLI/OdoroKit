/**
 * Constellation: points joined by a segment when they come close; the
 * pointer draws them in.
 *
 * ## Why points and lines, and not a shader
 *
 * The segments are the heart of the effect, and a segment joins two
 * particles: a fragment shader, which knows only the current pixel, would
 * have to recover for every pixel all the pairs that might run through it
 * — a cost of n squared per pixel. On the processor, the same n squared is
 * paid once per frame, for a hundred or so points, and yields a list of
 * segments the engine draws in one call: a line buffer preallocated for
 * every possible pair, of which only the live range is drawn. It is the
 * simplest technique that holds the frame
 * rate.
 *
 * ## The movement
 *
 * Each point follows an anchor point that wanders slowly — two sines of
 * non-multiple frequencies — through a damped spring. The pointer adds a
 * pull that falls off with distance: the points lean towards it, then come
 * back to their anchor. Without the anchor they would all end up under the
 * cursor.
 *
 * ## The colours
 *
 * A segment's intensity falls off with its length, through a mix towards
 * the background colour — not towards black, which on a light theme would
 * make the faint segments darker than the strong ones.
 *
 * @module
 */

import {
  mergePresentation,
  readTokenColour,
  useMotionState,
  type Customisable,
  type ShaderColour,
} from '@odoro-cli/engine'
import { useScene, type SceneContext } from '@odoro-cli/engine/three'
import { useEffect, useRef, useState, type ReactElement } from 'react'

import { usePointerDamped } from '@registre/hooks/usePointerDamped'
import { usePoster } from '@registre/hooks/usePoster'

/** Properties specific to this component. */
export interface ConstellationOwnProps {
  /** Number of points. @defaultValue 110 */
  count?: number
  /** Distance below which two points are joined. @defaultValue 0.9 */
  distance?: number
  /** Pull strength of the pointer. Zero cuts it. @defaultValue 1 */
  attract?: number
  /** Speed of the wandering. @defaultValue 0.6 */
  speed?: number
  /** Tokens: the background, the points, the segments. */
  colors?: readonly [string, string, string]
  /** Fallback classes. */
  poster?: string
}

/** Every property. */
export type ConstellationProps = Customisable<ConstellationOwnProps>

/** Tokens used by default. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-theme-fg', '--o-palette-brand-500'] as const

/** Default fallback: a frozen hue, in the same tones. */
const DEFAULT_POSTER = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Number of points at low quality.
 *
 * The cost is n squared: halving it divides the work by four.
 */
const LOW_COUNT = 55

/** Visible half-height at the camera's distance, in scene units. */
const HALF_HEIGHT = Math.tan((45 / 2) * (Math.PI / 180)) * 5

/** A point: its position, its velocity, and the anchor it follows. */
interface Node {
  x: number
  y: number
  vx: number
  vy: number
  /** Centre of the anchor's wandering. */
  ax: number
  ay: number
  /** Phases of the two sines of the wandering. */
  p1: number
  p2: number
}

type Three = SceneContext['three']
type Attribute = InstanceType<Three['BufferAttribute']>
type Geometry = InstanceType<Three['BufferGeometry']>
type PointsMaterial = InstanceType<Three['PointsMaterial']>

/** What the loop rewrites every frame. */
interface Buffers {
  readonly points: Attribute
  readonly lines: Attribute
  readonly tints: Attribute
  readonly lineGeometry: Geometry
}

/**
 * Constellation.
 *
 * @example
 * <div className="o-relative o-h-96 o-overflow-hidden">
 *   <Constellation className="o-absolute o-inset-0" />
 *   <div className="o-relative">…</div>
 * </div>
 */
export function Constellation({
  count = 110,
  distance = 0.9,
  attract = 1,
  speed = 0.6,
  colors = DEFAULT_TOKENS,
  poster = DEFAULT_POSTER,
  ...rest
}: ConstellationProps): ReactElement {
  const { theme } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)

  const pointer = usePointerDamped({ host, speed: 3, name: 'constellation : pointer' })

  const nodes = useRef<Node[]>([])
  const buffers = useRef<Buffers | null>(null)
  const material = useRef<PointsMaterial | null>(null)
  const context = useRef<SceneContext | null>(null)

  /** Colours read, shared with the loop: the background and the segments. */
  const shades = useRef<{ bg: ShaderColour; line: ShaderColour }>({
    bg: [0, 0, 0],
    line: [0, 0, 0],
  })

  const { ref, ready, refused } = useScene({
    name: 'constellation',
    setup: (scene) => {
      context.current = scene
      const { three, renderer, quality } = scene

      const [bg, dot, line] = colors.map((token) => readTokenColour(token, host))
      if (bg !== undefined && line !== undefined) shades.current = { bg, line }

      const bgColour = new three.Color(bg?.[0] ?? 0, bg?.[1] ?? 0, bg?.[2] ?? 0)
      renderer.setClearColor(bgColour.convertSRGBToLinear(), 1)

      const total = quality === 'low' ? Math.min(count, LOW_COUNT) : count
      const halfWidth = HALF_HEIGHT * scene.camera.aspect

      nodes.current = Array.from({ length: total }, () => {
        const ax = (Math.random() * 2 - 1) * halfWidth * 0.95
        const ay = (Math.random() * 2 - 1) * HALF_HEIGHT * 0.95
        return {
          x: ax,
          y: ay,
          vx: 0,
          vy: 0,
          ax,
          ay,
          p1: Math.random() * Math.PI * 2,
          p2: Math.random() * Math.PI * 2,
        }
      })

      const points = new three.BufferAttribute(new Float32Array(total * 3), 3)
      points.setUsage(three.DynamicDrawUsage)
      const pointGeometry = new three.BufferGeometry()
      pointGeometry.setAttribute('position', points)

      const dots = new three.PointsMaterial({
        size: 0.06,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
      })
      dots.color.setRGB(dot?.[0] ?? 0, dot?.[1] ?? 0, dot?.[2] ?? 0)
      material.current = dots

      // Every possible pair, allocated once: two vertices per segment, one
      // colour per vertex. Only the live range is drawn.
      const pairs = (total * (total - 1)) / 2
      const lines = new three.BufferAttribute(new Float32Array(pairs * 6), 3)
      lines.setUsage(three.DynamicDrawUsage)
      const tints = new three.BufferAttribute(new Float32Array(pairs * 6), 3)
      tints.setUsage(three.DynamicDrawUsage)
      const lineGeometry = new three.BufferGeometry()
      lineGeometry.setAttribute('position', lines)
      lineGeometry.setAttribute('color', tints)
      lineGeometry.setDrawRange(0, 0)

      const strokes = new three.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      })

      buffers.current = { points, lines, tints, lineGeometry }

      const group = new three.Group()
      group.name = 'constellation'
      group.add(new three.Points(pointGeometry, dots))
      group.add(new three.LineSegments(lineGeometry, strokes))
      scene.scene.add(group)

      return () => {
        scene.scene.remove(group)
        buffers.current = null
        material.current = null
      }
    },

    frame: ({ camera }, { time, delta }) => {
      const live = buffers.current
      if (live === null) return

      const dt = Math.min(delta, 0.05)
      const t = time * speed
      const halfWidth = HALF_HEIGHT * camera.aspect
      const px = pointer.current.x * halfWidth
      const py = -pointer.current.y * HALF_HEIGHT

      const field = nodes.current
      let index = 0
      for (const node of field) {
        // The anchor wanders: two sines per axis, of non-multiple frequencies.
        const tx =
          node.ax +
          0.35 * Math.sin(t * 0.41 + node.p1) +
          0.18 * Math.sin(t * 0.97 + node.p2)
        const ty =
          node.ay +
          0.35 * Math.cos(t * 0.37 + node.p2) +
          0.18 * Math.cos(t * 0.83 + node.p1)

        // Damped spring towards the anchor.
        let ax = (tx - node.x) * 3 - node.vx * 2
        let ay = (ty - node.y) * 3 - node.vy * 2

        // The pointer's pull, zero beyond two units.
        if (attract > 0) {
          const dx = px - node.x
          const dy = py - node.y
          const d = Math.hypot(dx, dy)
          if (d > 0.0001 && d < 2) {
            const pull = (1 - d / 2) * attract * 5
            ax += (dx / d) * pull
            ay += (dy / d) * pull
          }
        }

        node.vx += ax * dt
        node.vy += ay * dt
        node.x += node.vx * dt
        node.y += node.vy * dt

        live.points.setXYZ(index, node.x, node.y, 0)
        index += 1
      }
      live.points.needsUpdate = true

      // The segments: one pair per couple within reach, coloured by length
      // through a mix towards the background.
      const { bg, line } = shades.current
      const reach2 = distance * distance
      let vertex = 0
      for (let i = 0; i < field.length; i += 1) {
        const a = field[i]
        if (a === undefined) continue
        for (let j = i + 1; j < field.length; j += 1) {
          const b = field[j]
          if (b === undefined) continue
          const dx = b.x - a.x
          const dy = b.y - a.y
          const d2 = dx * dx + dy * dy
          if (d2 > reach2) continue

          const strength = 1 - Math.sqrt(d2) / distance
          const r = bg[0] + (line[0] - bg[0]) * strength
          const g = bg[1] + (line[1] - bg[1]) * strength
          const bl = bg[2] + (line[2] - bg[2]) * strength

          live.lines.setXYZ(vertex, a.x, a.y, 0)
          live.tints.setXYZ(vertex, r, g, bl)
          live.lines.setXYZ(vertex + 1, b.x, b.y, 0)
          live.tints.setXYZ(vertex + 1, r, g, bl)
          vertex += 2
        }
      }
      live.lineGeometry.setDrawRange(0, vertex)
      live.lines.needsUpdate = true
      live.tints.needsUpdate = true
    },
  })

  // The theme has flipped: the tokens are re-read and the colours repainted in
  // place. The scene is not rebuilt.
  useEffect(() => {
    const scene = context.current
    const dots = material.current
    if (scene === null || dots === null) return
    const [bg, dot, line] = colors.map((token) => readTokenColour(token, host))
    if (dot !== undefined) dots.color.setRGB(dot[0], dot[1], dot[2])
    if (bg !== undefined && line !== undefined) {
      shades.current = { bg, line }
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
