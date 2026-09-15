/**
 * Elastic mesh: a gridded sheet the pointer pulls towards itself, and which
 * ripples as it settles back flat.
 *
 * ## Why a simulation, and not a formula
 *
 * A relief drawn from a noise or a sine of the distance to the pointer follows
 * the cursor but has no memory: the sheet goes flat again exactly when the
 * cursor leaves, without a fold of delay. Yet it is the delay that makes the
 * elastic. Every node therefore keeps a speed, and its acceleration has three
 * terms: the laplacian of its four neighbours — which propagates the wave from
 * one to the next —, a pull back towards the plane, and the pointer's traction.
 *
 * The cost is linear in the number of nodes, and is paid on the processor; it
 * is negligible next to drawing the sheet, which is a single call.
 *
 * ## Why the time step is capped
 *
 * An explicit scheme diverges as soon as the step exceeds what the stiffness
 * allows. After a tab spent in the background, the first frame sometimes
 * carries a whole second: without a cap, the sheet blows up on return and
 * never comes back. The cap at thirty milliseconds costs one frame of slow
 * motion, and that is all.
 *
 * ## The drops
 *
 * Without a pointer, a perfectly flat sheet is an empty screen. An impulse
 * therefore falls now and then on a node drawn at random, and its wave crosses
 * the mesh. It is also what makes the elasticity visible when nobody is
 * touching anything.
 *
 * ## Under reduced motion
 *
 * The scene is refused by the engine and the static fallback shows.
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
export interface ElasticMeshOwnProps {
  /** Nodes per side of the mesh. @defaultValue 26 */
  density?: number
  /** Traction strength of the pointer. @defaultValue 1 */
  pull?: number
  /** Stiffness of the sheet: higher, the faster the wave runs. @defaultValue 1 */
  springiness?: number
  /** Drops per minute when the pointer touches nothing. @defaultValue 12 */
  drops?: number
  /** Tokens: the background, the sheet at rest, the sheet under strain. */
  colors?: readonly [string, string, string]
  /** Fallback classes. */
  poster?: string
}

/** Every property. */
export type ElasticMeshProps = Customisable<ElasticMeshOwnProps>

/** Tokens used by default. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-theme-line',
  '--o-palette-violet-400',
] as const

/** Default fallback: a frozen hue, in the same tones. */
const DEFAULT_POSTER =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-zinc-950 o-to-violet-100 dark:o-to-violet-950'

/**
 * Nodes per side at low quality.
 *
 * The cost is the square of the side, for the simulation as for the drawing.
 */
const LOW_DENSITY = 16

/** Half-width of the sheet, in scene units. */
const HALF = 1.6

/** Reach of the pointer's traction, in scene units. */
const GRIP = 0.55

/** Maximum time step, in seconds. Beyond it, the explicit scheme diverges. */
const MAX_STEP = 0.03

type Three = SceneContext['three']
type BufferAttribute = InstanceType<Three['BufferAttribute']>

/** What the scene keeps between construction and frames. */
interface Sheet {
  readonly side: number
  readonly position: BufferAttribute
  readonly colour: BufferAttribute
  /** Displacement of each node out of the plane. */
  readonly height: Float32Array
  /** Speed of each node. */
  readonly speed: Float32Array
  /** Time left before the next drop, in seconds. */
  nextDrop: number
  /** Current hues, re-read on every theme flip. */
  rest: ShaderColour
  strained: ShaderColour
}

/**
 * Elastic mesh.
 *
 * @example
 * <div className="o-relative o-h-96 o-overflow-hidden o-rounded-xl">
 *   <ElasticMesh className="o-absolute o-inset-0" />
 *   <div className="o-relative o-z-10">…</div>
 * </div>
 */
export function ElasticMesh({
  density = 26,
  pull = 1,
  springiness = 1,
  drops = 12,
  colors = DEFAULT_TOKENS,
  poster = DEFAULT_POSTER,
  ...rest
}: ElasticMeshProps): ReactElement {
  const { theme } = useMotionState()
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  const sheet = useRef<Sheet | null>(null)
  const context = useRef<SceneContext | null>(null)

  const settings = useRef({ pull, springiness, drops })
  settings.current = { pull, springiness, drops }

  const pointer = usePointerDamped({ host, speed: 6, name: 'elastic-mesh : pointer' })

  const { ref, ready, refused } = useScene<HTMLDivElement>({
    name: 'elastic-mesh',
    setup: (scene: SceneContext) => {
      context.current = scene
      const { three, renderer, camera, quality } = scene

      const [bg, calm, strained] = colors.map((token) =>
        readTokenColour(token, ref.current),
      )

      // The scene's background is the page's background. The token is in sRGB and
      // the engine encodes its clear colour from linear to sRGB:
      // without the inverse conversion, the background comes out a shade lighter.
      renderer.setClearColor(
        new three.Color(bg?.[0] ?? 0, bg?.[1] ?? 0, bg?.[2] ?? 0).convertSRGBToLinear(),
        1,
      )

      const side =
        quality === 'low' ? Math.min(density, LOW_DENSITY) : Math.max(density, 4)
      const count = side * side

      // The camera looks at the sheet from an angle: head on, a displacement
      // out of the plane would read only through the colour.
      camera.position.set(0, -1.35, 1.95)
      camera.lookAt(0, 0.05, 0)

      const positions = new Float32Array(count * 3)
      const colours = new Float32Array(count * 3)
      for (let iy = 0; iy < side; iy += 1) {
        for (let ix = 0; ix < side; ix += 1) {
          const index = iy * side + ix
          positions[index * 3] = (ix / (side - 1)) * 2 * HALF - HALF
          positions[index * 3 + 1] = (iy / (side - 1)) * 2 * HALF - HALF
          positions[index * 3 + 2] = 0
        }
      }

      // The segments are indexed: each node exists only once, and a single
      // write of its position moves the four lines that lead to it.
      const indices: number[] = []
      for (let iy = 0; iy < side; iy += 1) {
        for (let ix = 0; ix < side; ix += 1) {
          const index = iy * side + ix
          if (ix + 1 < side) indices.push(index, index + 1)
          if (iy + 1 < side) indices.push(index, index + side)
        }
      }

      const geometry = new three.BufferGeometry()
      const position = new three.BufferAttribute(positions, 3)
      const colour = new three.BufferAttribute(colours, 3)
      position.setUsage(three.DynamicDrawUsage)
      colour.setUsage(three.DynamicDrawUsage)
      geometry.setAttribute('position', position)
      geometry.setAttribute('color', colour)
      geometry.setIndex(indices)

      const material = new three.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.9,
      })
      const lines = new three.LineSegments(geometry, material)
      lines.name = 'maillage'
      scene.scene.add(lines)

      sheet.current = {
        side,
        position,
        colour,
        height: new Float32Array(count),
        speed: new Float32Array(count),
        nextDrop: 1,
        rest: calm ?? [0, 0, 0],
        strained: strained ?? [0, 0, 0],
      }

      return () => {
        scene.scene.remove(lines)
        sheet.current = null
      }
    },

    frame: (_, { deltaRaw }) => {
      const live = sheet.current
      if (live === null) return

      const { side, height, speed, position, colour } = live
      const { pull: force, springiness: stiff, drops: rate } = settings.current

      // The step is capped: an explicit scheme diverges beyond what the
      // stiffness allows, and the first frame after a hidden tab easily
      // carries ten times too much.
      const dt = Math.min(deltaRaw, MAX_STEP)

      // The pointer, from the hook's frame of reference to the sheet's.
      const px = pointer.current.x * HALF * 1.1
      const py = -pointer.current.y * HALF * 1.1

      // The drop: an impulse on a node drawn at random.
      live.nextDrop -= dt
      if (rate > 0 && live.nextDrop <= 0) {
        live.nextDrop = 60 / rate
        const target = Math.floor(Math.random() * side * side)
        speed[target] = (speed[target] ?? 0) - 2.4
      }

      const k = 55 * Math.max(stiff, 0.05)
      const damping = Math.exp(-2.4 * dt)
      const positions = position.array as Float32Array

      for (let iy = 0; iy < side; iy += 1) {
        for (let ix = 0; ix < side; ix += 1) {
          const index = iy * side + ix

          // The edges are pinned: a free sheet would slide out of the frame.
          if (ix === 0 || iy === 0 || ix === side - 1 || iy === side - 1) {
            height[index] = 0
            speed[index] = 0
            positions[index * 3 + 2] = 0
            continue
          }

          const here = height[index] ?? 0
          const laplacian =
            (height[index - 1] ?? 0) +
            (height[index + 1] ?? 0) +
            (height[index - side] ?? 0) +
            (height[index + side] ?? 0) -
            4 * here

          // The traction: a gaussian of the distance to the pointer, in the
          // plane of the sheet.
          const dx = (positions[index * 3] ?? 0) - px
          const dy = (positions[index * 3 + 1] ?? 0) - py
          const grip = Math.exp(-(dx * dx + dy * dy) / (GRIP * GRIP))

          const acceleration = k * laplacian - 7 * here + grip * force * 9
          const next = ((speed[index] ?? 0) + acceleration * dt) * damping
          speed[index] = next
          height[index] = here + next * dt
          positions[index * 3 + 2] = height[index] ?? 0
        }
      }

      // The hue follows the strain: at rest the theme's line colour, under
      // strain the vivid one. The square tightens the colour onto the marked
      // folds.
      const colourArray = colour.array as Float32Array
      const [r0, g0, b0] = live.rest
      const [r1, g1, b1] = live.strained
      for (let index = 0; index < side * side; index += 1) {
        const strain = Math.min(Math.abs(height[index] ?? 0) * 2.4, 1)
        const share = strain * strain
        colourArray[index * 3] = r0 + (r1 - r0) * share
        colourArray[index * 3 + 1] = g0 + (g1 - g0) * share
        colourArray[index * 3 + 2] = b0 + (b1 - b0) * share
      }

      position.needsUpdate = true
      colour.needsUpdate = true
    },
  })

  // The theme has flipped: the tokens are re-read and the reference hues
  // replaced. The scene is not rebuilt — the loop repaints on its own.
  useEffect(() => {
    const scene = context.current
    const live = sheet.current
    if (scene === null || live === null || host === null) return
    const [bg, calm, strained] = colors.map((token) => readTokenColour(token, host))
    live.rest = calm ?? live.rest
    live.strained = strained ?? live.strained
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
