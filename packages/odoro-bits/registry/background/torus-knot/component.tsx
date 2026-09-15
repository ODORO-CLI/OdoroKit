/**
 * Torus knot: a knotted torus in wireframe, turning, with a few pulses
 * running along it.
 *
 * ## Why an opaque solid under the wireframe
 *
 * A wireframe on its own shows the edges at the back as much as those at the
 * front, and a torus knot has enough of them for the volume to become
 * unreadable — you see a ball of yarn, not a knot. The same solid is
 * therefore drawn underneath, opaque, in the colour of the background: it
 * hides whatever passes behind without adding anything to the image. This is
 * hidden-line drawing, obtained through depth instead of a computation.
 *
 * Polygon offset exists for this precise case: without it, the edge and the
 * face that carries it sit at the same depth, and the wire flickers.
 *
 * ## The pulses
 *
 * They follow the guide curve of the knot, the very one the geometry is drawn
 * from: two cosines and a sine, the formula fits in five lines. They give the
 * direction of travel, which a rotation alone does not tell. Their radius
 * goes beyond that of the tube, without which the masking solid would swallow
 * them.
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
} from '@odoro-cli/engine'
import { useScene, type SceneContext } from '@odoro-cli/engine/three'
import { useEffect, useRef, useState, type ReactElement } from 'react'

import { usePoster } from '@registre/hooks/usePoster'

/** Props specific to this component. */
export interface TorusKnotOwnProps {
  /** Number of turns around the axis of revolution. @defaultValue 2 */
  p?: number
  /** Number of turns around the core of the torus. @defaultValue 3 */
  q?: number
  /** Thickness of the tube, in scene units. @defaultValue 0.3 */
  tube?: number
  /** Rotation speed, in turns per minute. @defaultValue 3 */
  rpm?: number
  /** Number of pulses running along the knot. @defaultValue 4 */
  pulses?: number
  /** Tokens: the background and the masking solid, the wireframe, the pulses. */
  colors?: readonly [string, string, string]
  /** Fallback classes. */
  poster?: string
}

/** All props. */
export type TorusKnotProps = Customisable<TorusKnotOwnProps>

/** Tokens used by default. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-emerald-400',
  '--o-palette-lime-400',
] as const

/** Default fallback: a frozen tint, in the same tones. */
const DEFAULT_POSTER =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-to-emerald-100 dark:o-to-emerald-950'

/** Radius of the knot, in scene units. */
const RADIUS = 1.15

/**
 * Segments along the tube, according to quality.
 *
 * The wireframe draws all its edges from them: this is the only lever that
 * counts.
 */
const TUBULAR = { high: 180, medium: 130, low: 70 } as const

/** Segments around the tube, according to quality. */
const RADIAL = { high: 10, medium: 8, low: 6 } as const

type Three = SceneContext['three']
type Group = InstanceType<Three['Group']>
type Object3D = InstanceType<Three['Object3D']>
type BasicMaterial = InstanceType<Three['MeshBasicMaterial']>
type LineMaterial = InstanceType<Three['LineBasicMaterial']>

/** What the scene keeps between construction and frames. */
interface Knot {
  readonly group: Group
  readonly pulses: readonly Object3D[]
  readonly hidden: BasicMaterial
  readonly wire: LineMaterial
  readonly spark: BasicMaterial
  /** Angular speed, in radians per second. */
  readonly rate: number
  readonly p: number
  readonly q: number
}

/**
 * A point on the guide curve of the knot.
 *
 * This is the same parametrisation the geometry is drawn from: the parameter
 * advances by `p` turns while the second angle makes `q` of them.
 */
function onCurve(u: number, p: number, q: number): readonly [number, number, number] {
  const quOverP = (q / p) * u
  const swell = RADIUS * (2 + Math.cos(quOverP)) * 0.5
  return [swell * Math.cos(u), swell * Math.sin(u), RADIUS * Math.sin(quOverP) * 0.5]
}

/**
 * Torus knot.
 *
 * @example
 * <div className="o-relative o-h-96 o-overflow-hidden o-rounded-xl">
 *   <TorusKnot className="o-absolute o-inset-0" />
 *   <div className="o-relative o-z-10">…</div>
 * </div>
 */
export function TorusKnot({
  p = 2,
  q = 3,
  tube = 0.3,
  rpm = 3,
  pulses = 4,
  colors = DEFAULT_TOKENS,
  poster = DEFAULT_POSTER,
  ...rest
}: TorusKnotProps): ReactElement {
  const { theme } = useMotionState()
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  const knot = useRef<Knot | null>(null)
  const context = useRef<SceneContext | null>(null)

  const { ref, ready, refused } = useScene<HTMLDivElement>({
    name: 'torus-knot',
    setup: (scene: SceneContext) => {
      context.current = scene
      const { three, renderer, camera, quality } = scene

      const [bg, line, spark] = colors.map((token) => readTokenColour(token, ref.current))

      // The background of the scene is the background of the page. The token
      // is in sRGB and the engine encodes its clear colour from linear to
      // sRGB: without the reverse conversion, the background comes out one
      // notch lighter.
      renderer.setClearColor(
        new three.Color(bg?.[0] ?? 0, bg?.[1] ?? 0, bg?.[2] ?? 0).convertSRGBToLinear(),
        1,
      )

      camera.position.set(0, 0, 5.9)
      camera.lookAt(0, 0, 0)

      const turns = Math.max(Math.round(p), 1)
      const loops = Math.max(Math.round(q), 1)

      const geometry = new three.TorusKnotGeometry(
        RADIUS,
        Math.max(tube, 0.02),
        TUBULAR[quality],
        RADIAL[quality],
        turns,
        loops,
      )

      // The masking solid: in the colour of the background, it adds nothing
      // to the image but takes away whatever passes behind. Polygon offset
      // pushes the face away from the edge that borders it, without which the
      // wire flickers.
      const hidden = new three.MeshBasicMaterial({
        polygonOffset: true,
        polygonOffsetFactor: 1,
        polygonOffsetUnits: 1,
      })
      hidden.color.setRGB(bg?.[0] ?? 0, bg?.[1] ?? 0, bg?.[2] ?? 0)

      const wire = new three.LineBasicMaterial({ transparent: true, opacity: 0.85 })
      wire.color.setRGB(line?.[0] ?? 0, line?.[1] ?? 0, line?.[2] ?? 0)

      // The wireframe is built on the vertex grid of the geometry, not by
      // `WireframeGeometry`: that one puts out every edge of the triangles,
      // diagonals included, and the knot then reads as a net. Here only the
      // lines of the grid are drawn — the rings around the tube, and the
      // generatrices along it.
      const along = TUBULAR[quality]
      const around = RADIAL[quality]
      const grid: number[] = []
      for (let i = 0; i < along; i += 1) {
        for (let j = 0; j < around; j += 1) {
          const here = i * (around + 1) + j
          grid.push(here, here + around + 1)
          grid.push(here, here + 1)
        }
      }
      const wireGeometry = new three.BufferGeometry()
      wireGeometry.setAttribute('position', geometry.getAttribute('position'))
      wireGeometry.setIndex(grid)

      const group = new three.Group()
      group.name = 'knot'
      group.add(new three.Mesh(geometry, hidden))
      group.add(new three.LineSegments(wireGeometry, wire))

      // The pulses: small spheres placed on the guide curve.
      const sparkMaterial = new three.MeshBasicMaterial()
      sparkMaterial.color.setRGB(spark?.[0] ?? 0, spark?.[1] ?? 0, spark?.[2] ?? 0)
      // The beads spill out of the tube: placed on the guide curve, they
      // would be entirely hidden by the masking solid.
      const sparkGeometry = new three.SphereGeometry(Math.max(tube, 0.02) * 1.2, 12, 12)

      const beads: Object3D[] = []
      for (let index = 0; index < Math.max(Math.round(pulses), 0); index += 1) {
        const bead = new three.Mesh(sparkGeometry, sparkMaterial)
        group.add(bead)
        beads.push(bead)
      }

      scene.scene.add(group)

      knot.current = {
        group,
        pulses: beads,
        hidden,
        wire,
        spark: sparkMaterial,
        rate: (rpm * Math.PI * 2) / 60,
        p: turns,
        q: loops,
      }

      return () => {
        scene.scene.remove(group)
        knot.current = null
      }
    },

    frame: (_, { time, delta }) => {
      const live = knot.current
      if (live === null) return

      // The rotation is expressed as a function of elapsed time: the same
      // setting gives the same apparent speed at any frame rate.
      live.group.rotation.y += live.rate * delta
      live.group.rotation.x = Math.sin(live.group.rotation.y * 0.4) * 0.28

      // The pulses travel the guide curve, spread out at an equal step.
      const total = live.pulses.length
      for (const [index, bead] of live.pulses.entries()) {
        const share = (time * 0.14 + index / Math.max(total, 1)) % 1
        const [x, y, z] = onCurve(share * live.p * Math.PI * 2, live.p, live.q)
        bead.position.set(x, y, z)
      }
    },
  })

  // The theme has switched: the tokens are read again and the materials
  // repainted in place. The scene is not rebuilt.
  useEffect(() => {
    const scene = context.current
    const live = knot.current
    if (scene === null || live === null || host === null) return
    const [bg, line, spark] = colors.map((token) => readTokenColour(token, host))
    live.hidden.color.setRGB(bg?.[0] ?? 0, bg?.[1] ?? 0, bg?.[2] ?? 0)
    live.wire.color.setRGB(line?.[0] ?? 0, line?.[1] ?? 0, line?.[2] ?? 0)
    live.spark.color.setRGB(spark?.[0] ?? 0, spark?.[1] ?? 0, spark?.[2] ?? 0)
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
