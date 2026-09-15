/**
 * Web of threads: points linked to their neighbours, a web that vibrates under the pointer.
 *
 * ## Why a scene, and not a fullscreen shader
 *
 * A fragment shader knows how to draw lines defined by a formula; it does not
 * know how to link sixty points to their nearest neighbours — every fragment
 * would have to walk through all the pairs. A scene carries the web as a
 * geometry of segments, of which only the vertices move: this is the case
 * where the 3D engine's lines cost less than their per-fragment equivalent.
 *
 * ## How the web is woven
 *
 * The points are drawn once, deterministically, inside a normalised
 * rectangle; each point is linked to its neighbours within a given radius,
 * with a cap on links per point so that dense areas do not turn into blots.
 * The links are fixed: it is their endpoints that move.
 *
 * The rectangle is scaled to the camera's field on every frame: the web
 * follows the frame when it is resized, without being rewoven.
 *
 * ## What this background reacts to
 *
 * To the pointer moving, with damping: the points within reach are pushed
 * away and tremble, and the threads that carry them light up. On leaving the
 * frame, the hook brings the target back to the centre and the web relaxes.
 *
 * ## Under reduced motion
 *
 * The scene is refused by the engine and the static fallback is shown.
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

/** Props specific to this component. */
export interface WebThreadsOwnProps {
  /** Number of points. @defaultValue 80 */
  points?: number
  /** Linking radius between points, in scene units. @defaultValue 1.1 */
  radius?: number
  /** Amplitude of the tremble at rest. @defaultValue 0.4 */
  vibration?: number
  /** Reach of the pointer, in scene units. @defaultValue 1.4 */
  reach?: number
  /** Tokens: the background, the threads, the nodes. */
  colors?: readonly [string, string, string]
  /** Fallback classes. */
  poster?: string
}

/** All props. */
export type WebThreadsProps = Customisable<WebThreadsOwnProps>

/** Tokens used by default. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-theme-muted',
  '--o-palette-brand-500',
] as const

/** Default fallback: a frozen tint, in the same tones. */
const DEFAULT_POSTER = 'o-bg-zinc-50 dark:o-bg-zinc-950'

/**
 * Number of points at low quality.
 *
 * The cost is in the links, and the number of links grows faster than the
 * number of points. Halving the points divides the links by nearly four.
 */
const LOW_POINTS = 40

/** Links at most per point: beyond that, dense areas turn into blots. */
const MAX_LINKS = 5

/** Visible height at the camera's distance, for its 45 degree angle. */
const VIEW_HEIGHT = 2 * 5 * Math.tan((45 / 2) * (Math.PI / 180))

/** What the scene keeps between construction and frames. */
interface Web {
  /** Normalised positions, within [-1, 1], drawn once. */
  readonly base: Float32Array
  /** Current positions, in scene units, damped. */
  readonly current: Float32Array
  /** Pairs of point indices, one link per pair. */
  readonly links: Uint16Array
  /** Vertex buffer of the segments. */
  readonly linePositions: Float32Array
  /** Colour buffer of the segments. */
  readonly lineColours: Float32Array
  /** Vertex buffer of the nodes. */
  readonly nodePositions: Float32Array
  readonly lineAttribute: { needsUpdate: boolean }
  readonly lineColourAttribute: { needsUpdate: boolean }
  readonly nodeAttribute: { needsUpdate: boolean }
  readonly nodeMaterial: {
    color: { setRGB: (r: number, g: number, b: number) => unknown }
  }
}

/** Deterministic pseudo-random number: the web is the same on every mount. */
function hash(seed: number): number {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
  return x - Math.floor(x)
}

/**
 * Web of threads.
 *
 * @example
 * <div className="o-relative o-h-96 o-overflow-hidden o-rounded-xl">
 *   <WebThreads className="o-absolute o-inset-0" />
 *   <div className="o-relative o-z-10">…</div>
 * </div>
 */
export function WebThreads({
  points = 80,
  radius = 1.1,
  vibration = 0.4,
  reach = 1.4,
  colors = DEFAULT_TOKENS,
  poster = DEFAULT_POSTER,
  ...rest
}: WebThreadsProps): ReactElement {
  const { theme } = useMotionState()
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  const pointer = usePointerDamped({ host, speed: 5, name: 'web : pointer' })

  const web = useRef<Web | null>(null)
  const context = useRef<SceneContext | null>(null)

  // The colours are read by ref inside the loop: a theme change replaces them
  // without rebuilding the scene.
  const shades = useRef<readonly ShaderColour[]>([])

  const settings = useRef({ vibration, reach })
  settings.current = { vibration, reach }

  const { ref, ready, refused } = useScene<HTMLDivElement>({
    name: 'web',
    setup: (scene: SceneContext) => {
      context.current = scene
      const { three, renderer, quality } = scene

      shades.current = colors.map((token) => readTokenColour(token, ref.current))
      const [bg, thread, node] = shades.current

      // The background of the scene is the background of the page. The token
      // is in sRGB and the engine encodes its clear colour from linear to
      // sRGB: without the inverse conversion, the background comes out one
      // notch lighter.
      renderer.setClearColor(
        new three.Color(bg?.[0] ?? 0, bg?.[1] ?? 0, bg?.[2] ?? 0).convertSRGBToLinear(),
        1,
      )

      const count = quality === 'low' ? Math.min(points, LOW_POINTS) : points

      // The points, drawn once inside a normalised rectangle a little wider
      // than the frame: the web overflows, and no edge is visible.
      const base = new Float32Array(count * 2)
      for (let index = 0; index < count; index += 1) {
        base[index * 2] = (hash(index + 1) * 2 - 1) * 1.15
        base[index * 2 + 1] = (hash(index + 101) * 2 - 1) * 1.15
      }

      // The links: every pair within reach, with a cap per point. The
      // distances are measured in the scene frame at mount time — the web is
      // not rewoven on a resize, only stretched.
      const hostElement = ref.current
      const aspect =
        hostElement === null
          ? 1
          : hostElement.clientWidth / Math.max(hostElement.clientHeight, 1) || 1
      const width = VIEW_HEIGHT * aspect
      const linkCount = new Uint8Array(count)
      const pairs: number[] = []
      for (let a = 0; a < count; a += 1) {
        for (let b = a + 1; b < count; b += 1) {
          if ((linkCount[a] ?? 0) >= MAX_LINKS || (linkCount[b] ?? 0) >= MAX_LINKS)
            continue
          const dx = ((base[a * 2] ?? 0) - (base[b * 2] ?? 0)) * width * 0.5
          const dy = ((base[a * 2 + 1] ?? 0) - (base[b * 2 + 1] ?? 0)) * VIEW_HEIGHT * 0.5
          if (dx * dx + dy * dy > radius * radius) continue
          pairs.push(a, b)
          linkCount[a] = (linkCount[a] ?? 0) + 1
          linkCount[b] = (linkCount[b] ?? 0) + 1
        }
      }
      const links = new Uint16Array(pairs)
      const segments = links.length / 2

      const linePositions = new Float32Array(segments * 2 * 3)
      const lineColours = new Float32Array(segments * 2 * 3)
      const lineGeometry = new three.BufferGeometry()
      const lineAttribute = new three.BufferAttribute(linePositions, 3)
      const lineColourAttribute = new three.BufferAttribute(lineColours, 3)
      lineAttribute.setUsage(three.DynamicDrawUsage)
      lineColourAttribute.setUsage(three.DynamicDrawUsage)
      lineGeometry.setAttribute('position', lineAttribute)
      lineGeometry.setAttribute('color', lineColourAttribute)

      // The colours come from the vertices: that is what makes it possible to
      // light a thread near the pointer without one material per thread.
      const lineMaterial = new three.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.8,
        depthWrite: false,
      })

      const nodePositions = new Float32Array(count * 3)
      const nodeGeometry = new three.BufferGeometry()
      const nodeAttribute = new three.BufferAttribute(nodePositions, 3)
      nodeAttribute.setUsage(three.DynamicDrawUsage)
      nodeGeometry.setAttribute('position', nodeAttribute)
      const nodeMaterial = new three.PointsMaterial({
        size: 0.05,
        transparent: true,
        opacity: 0.95,
        depthWrite: false,
      })
      nodeMaterial.color.setRGB(node?.[0] ?? 0, node?.[1] ?? 0, node?.[2] ?? 0)

      const group = new three.Group()
      group.name = 'web'
      group.add(new three.LineSegments(lineGeometry, lineMaterial))
      group.add(new three.Points(nodeGeometry, nodeMaterial))
      scene.scene.add(group)

      // The threads first take their resting colour.
      for (let index = 0; index < segments * 2; index += 1) {
        lineColours[index * 3] = thread?.[0] ?? 0
        lineColours[index * 3 + 1] = thread?.[1] ?? 0
        lineColours[index * 3 + 2] = thread?.[2] ?? 0
      }

      // The current positions start from the resting positions: without that,
      // the web would converge from the centre on the first frame.
      const current = new Float32Array(count * 2)
      for (let index = 0; index < count; index += 1) {
        current[index * 2] = (base[index * 2] ?? 0) * width * 0.5
        current[index * 2 + 1] = (base[index * 2 + 1] ?? 0) * VIEW_HEIGHT * 0.5
      }

      web.current = {
        base,
        current,
        links,
        linePositions,
        lineColours,
        nodePositions,
        lineAttribute,
        lineColourAttribute,
        nodeAttribute,
        nodeMaterial,
      }

      return () => {
        scene.scene.remove(group)
        web.current = null
      }
    },

    frame: ({ camera }, { time, delta }) => {
      const net = web.current
      if (net === null) return
      const { vibration: tremble, reach: range } = settings.current
      const [, thread, node] = shades.current

      // The scale follows the frame: the web is stretched, never rewoven.
      const halfWidth = (VIEW_HEIGHT * camera.aspect) / 2
      const halfHeight = VIEW_HEIGHT / 2

      // The pointer, from the hook's frame (centred, y downwards) to the scene.
      const px = pointer.current.x * halfWidth
      const py = -pointer.current.y * halfHeight

      const count = net.base.length / 2
      const ease = 1 - Math.exp(-delta * 6)

      for (let index = 0; index < count; index += 1) {
        const bx = (net.base[index * 2] ?? 0) * halfWidth
        const by = (net.base[index * 2 + 1] ?? 0) * halfHeight

        // The resting tremble: two sines at frequencies specific to the point,
        // never a draw per frame — that would only produce noise.
        const jx = Math.sin(time * (0.6 + hash(index + 7) * 0.8) + index) * 0.08 * tremble
        const jy =
          Math.cos(time * (0.5 + hash(index + 13) * 0.9) + index * 1.7) * 0.08 * tremble

        // The pointer pushes away whatever is within reach, and makes it vibrate.
        let ox = 0
        let oy = 0
        const dx = bx + jx - px
        const dy = by + jy - py
        const distance = Math.hypot(dx, dy)
        if (distance < range && distance > 0.0001) {
          const near = 1 - distance / range
          const push = near * near * 0.5
          const shiver = Math.sin(time * 38 + index * 2.3) * near * 0.05
          ox = (dx / distance) * push + shiver
          oy = (dy / distance) * push - shiver
        }

        const tx = bx + jx + ox
        const ty = by + jy + oy
        const cx = net.current[index * 2] ?? tx
        const cy = net.current[index * 2 + 1] ?? ty
        net.current[index * 2] = cx + (tx - cx) * ease
        net.current[index * 2 + 1] = cy + (ty - cy) * ease

        net.nodePositions[index * 3] = net.current[index * 2] ?? 0
        net.nodePositions[index * 3 + 1] = net.current[index * 2 + 1] ?? 0
        net.nodePositions[index * 3 + 2] = 0
      }

      const segments = net.links.length / 2
      for (let segment = 0; segment < segments; segment += 1) {
        const a = net.links[segment * 2] ?? 0
        const b = net.links[segment * 2 + 1] ?? 0
        const ax = net.current[a * 2] ?? 0
        const ay = net.current[a * 2 + 1] ?? 0
        const bx = net.current[b * 2] ?? 0
        const by = net.current[b * 2 + 1] ?? 0

        net.linePositions[segment * 6] = ax
        net.linePositions[segment * 6 + 1] = ay
        net.linePositions[segment * 6 + 2] = 0
        net.linePositions[segment * 6 + 3] = bx
        net.linePositions[segment * 6 + 4] = by
        net.linePositions[segment * 6 + 5] = 0

        // The thread lights up with how close the pointer is to its midpoint.
        const mx = (ax + bx) / 2 - px
        const my = (ay + by) / 2 - py
        const glow = Math.max(0, 1 - Math.hypot(mx, my) / range)
        for (let end = 0; end < 2; end += 1) {
          const at = (segment * 2 + end) * 3
          net.lineColours[at] =
            (thread?.[0] ?? 0) + ((node?.[0] ?? 0) - (thread?.[0] ?? 0)) * glow
          net.lineColours[at + 1] =
            (thread?.[1] ?? 0) + ((node?.[1] ?? 0) - (thread?.[1] ?? 0)) * glow
          net.lineColours[at + 2] =
            (thread?.[2] ?? 0) + ((node?.[2] ?? 0) - (thread?.[2] ?? 0)) * glow
        }
      }

      net.lineAttribute.needsUpdate = true
      net.lineColourAttribute.needsUpdate = true
      net.nodeAttribute.needsUpdate = true
    },
  })

  // The theme has toggled: the tokens are read again and the colours replaced
  // in place. The threads read the ref on the next frame; the nodes and the
  // background are painted here, because they are not read back per frame.
  useEffect(() => {
    const scene = context.current
    const net = web.current
    if (scene === null || net === null || host === null) return
    shades.current = colors.map((token) => readTokenColour(token, host))
    const [bg, , node] = shades.current
    net.nodeMaterial.color.setRGB(node?.[0] ?? 0, node?.[1] ?? 0, node?.[2] ?? 0)
    scene.renderer.setClearColor(
      new scene.three.Color(
        bg?.[0] ?? 0,
        bg?.[1] ?? 0,
        bg?.[2] ?? 0,
      ).convertSRGBToLinear(),
      1,
    )
  }, [theme, colors, host, ready])

  const pending = usePoster({ ready, refused })

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  return (
    <div
      {...rest}
      ref={(element) => {
        setHost(element)
        ref.current = element
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
