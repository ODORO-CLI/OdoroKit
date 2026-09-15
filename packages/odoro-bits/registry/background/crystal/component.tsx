/**
 * Crystal: a faceted solid that turns, and feigns refraction.
 *
 * ## Why a scene, and not a full-screen shader
 *
 * Flat facets, each taking its colour from the angle it makes with the eye,
 * sharp edges, a depth in which the back shows through the front: that is a
 * matter of geometry, not of fragments.
 *
 * ## The geometry is not a solid from the catalogue
 *
 * Two rings of vertices and two tips, at slightly uneven radii: a tipped
 * prism, like a quartz point, in which no facet is exactly like its
 * neighbour. The triangles share no vertex, so that each facet keeps its
 * flat normal — that is what makes it a
 * facet.
 *
 * ## What the pointer does
 *
 * The crystal leans towards the cursor, with damping, and the facets change
 * hue as they change angle. The `parallax` setting doses that lean; at
 * zero, only the rotation remains.
 *
 * ## The fallback
 *
 * While the scene loads, without WebGL, under reduced motion, or if the
 * arbiter refuses a second scene, a blurred gradient takes its place — in
 * the same tones, with no hard edge.
 *
 * @module
 */

import {
  mergePresentation,
  readTokenColour,
  useMotionState,
  useOnReady,
  type Customisable,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro-cli/engine'
import { useScene, type SceneContext } from '@odoro-cli/engine/three'
import { useEffect, useRef, useState, type ReactElement } from 'react'

import { usePointerDamped } from '@registre/hooks/usePointerDamped'
import { usePoster } from '@registre/hooks/usePoster'

import { CRYSTAL_FRAGMENT, CRYSTAL_VERTEX } from './crystal.shader.js'

/** What the escape hatch receives. */
export interface CrystalControls {
  /** Scene context: objects, camera, renderer, module. */
  readonly scene: SceneContext
  /** Live uniforms: changing them changes the output on the next frame. */
  readonly uniforms: Record<string, { value: unknown }>
}

/** Properties specific to this component. */
export interface CrystalOwnProps {
  /** Number of side faces. @defaultValue 6 */
  facets?: number
  /** Rotation speed, in turns per minute. @defaultValue 3 */
  rpm?: number
  /** Separation of the colours on the edges, between zero and one. @defaultValue 0.6 */
  dispersion?: number
  /** Lean towards the pointer. @defaultValue 0.25 */
  parallax?: number
  /** Tokens: the background, the low hue, the high hue and the highlights. */
  colors?: readonly [string, string, string]
  /** Fallback classes. */
  poster?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<CrystalControls>
}

/** Every property. */
export type CrystalProps = Customisable<CrystalOwnProps>

/** Tokens used by default. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-sky-300',
  '--o-palette-violet-400',
] as const

/** Default fallback: a frozen glint, in the same tones. */
const DEFAULT_POSTER =
  'o-bg-gradient-to-tr o-from-zinc-50 dark:o-from-zinc-950 o-via-sky-200 dark:o-via-sky-900 o-to-violet-300 dark:o-to-violet-900 o-blur-2xl o-scale-110'

/** Proportions of the crystal: half-height of the shaft, height of the tips, radius. */
const SHAPE = { body: 0.75, tip: 1.5, radius: 0.62 } as const

/** What the loop handles, built once per mount. */
interface World {
  readonly group: InstanceType<SceneContext['three']['Group']>
}

/** Pseudo-random number from an index, stable from one mount to the next. */
function hash(index: number): number {
  const x = Math.sin(index * 127.1 + 311.7) * 43758.5453123
  return x - Math.floor(x)
}

/**
 * Builds the tipped prism, out of independent triangles.
 *
 * Each triangle's orientation is checked against its centre: a triangle
 * whose normal looks inwards is flipped. That is safer than reasoning about
 * the winding order of the rings, and it costs no more than one cross
 * product per face, once.
 */
// The return type is left to inference: written by hand from the module,
// it takes the default generic parameter, which `Mesh` refuses.
function crystalGeometry(three: SceneContext['three'], sides: number) {
  const count = Math.max(3, Math.round(sides))
  const lower: [number, number, number][] = []
  const upper: [number, number, number][] = []
  for (let index = 0; index < count; index += 1) {
    const angle = (index / count) * Math.PI * 2
    // Uneven radii: no facet is a copy of its neighbour.
    const low = SHAPE.radius * (0.82 + hash(index * 3 + 1) * 0.36)
    const high = SHAPE.radius * (0.82 + hash(index * 3 + 2) * 0.36)
    lower.push([Math.cos(angle) * low, -SHAPE.body, Math.sin(angle) * low])
    upper.push([
      Math.cos(angle) * high,
      SHAPE.body + (hash(index) - 0.5) * 0.2,
      Math.sin(angle) * high,
    ])
  }
  const bottom: [number, number, number] = [0, -SHAPE.tip, 0]
  const top: [number, number, number] = [0.06, SHAPE.tip, -0.04]

  const triangles: [number, number, number][][] = []
  for (let index = 0; index < count; index += 1) {
    const next = (index + 1) % count
    const l0 = lower[index] ?? bottom
    const l1 = lower[next] ?? bottom
    const u0 = upper[index] ?? top
    const u1 = upper[next] ?? top
    triangles.push([bottom, l0, l1])
    triangles.push([l0, u0, u1], [l0, u1, l1])
    triangles.push([top, u1, u0])
  }

  const positions = new Float32Array(triangles.length * 9)
  triangles.forEach((triangle, face) => {
    const [a, b, c] = triangle
    if (a === undefined || b === undefined || c === undefined) return
    const abx = b[0] - a[0]
    const aby = b[1] - a[1]
    const abz = b[2] - a[2]
    const acx = c[0] - a[0]
    const acy = c[1] - a[1]
    const acz = c[2] - a[2]
    const nx = aby * acz - abz * acy
    const ny = abz * acx - abx * acz
    const nz = abx * acy - aby * acx
    const cx = (a[0] + b[0] + c[0]) / 3
    const cy = (a[1] + b[1] + c[1]) / 3
    const cz = (a[2] + b[2] + c[2]) / 3
    const outward = nx * cx + ny * cy + nz * cz >= 0
    const ordered = outward ? [a, b, c] : [a, c, b]
    ordered.forEach((vertex, corner) => {
      positions.set(vertex, face * 9 + corner * 3)
    })
  })

  const geometry = new three.BufferGeometry()
  geometry.setAttribute('position', new three.BufferAttribute(positions, 3))
  geometry.computeVertexNormals()
  return geometry
}

/**
 * Crystal.
 *
 * @example
 * <div className="o-relative o-h-96 o-overflow-hidden o-rounded-xl">
 *   <Crystal className="o-absolute o-inset-0" facets={8} />
 *   <div className="o-relative o-z-10">…</div>
 * </div>
 */
export function Crystal({
  facets = 6,
  rpm = 3,
  dispersion = 0.6,
  parallax = 0.25,
  colors = DEFAULT_TOKENS,
  poster = DEFAULT_POSTER,
  onReady,
  ...rest
}: CrystalProps): ReactElement {
  const { theme } = useMotionState()
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  const pointer = usePointerDamped({ host, speed: 2.5, name: 'crystal : pointer' })

  const uniforms = useRef<Record<string, { value: unknown }>>({})
  const context = useRef<SceneContext | null>(null)
  const world = useRef<World | null>(null)

  // The settings are read by ref inside the loop: a slider change in the
  // workshop takes effect on the next frame without rebuilding the scene.
  const settings = useRef({ rpm, dispersion, parallax })
  settings.current = { rpm, dispersion, parallax }

  const { ref, ready, refused } = useScene<HTMLDivElement>({
    name: 'crystal',
    setup: (scene) => {
      context.current = scene
      const { three, camera, renderer } = scene

      const paint = (value: ShaderColour): InstanceType<typeof three.Color> =>
        new three.Color(value[0], value[1], value[2])
      const [background, low, high] = colors.map((token) => readTokenColour(token, host))

      // The background is the theme's colour. The token is in sRGB and the
      // engine encodes its clear colour from linear to sRGB: without the inverse
      // conversion, the background comes out a shade lighter than the page.
      renderer.setClearColor(paint(background ?? [0, 0, 0]).convertSRGBToLinear(), 1)

      // The two passes share their colours: the same objects, so that a theme
      // change repaints them both at once.
      const shared = {
        uColorA: { value: paint(low ?? [0, 0, 0]) },
        uColorB: { value: paint(high ?? [0, 0, 0]) },
        uDispersion: { value: dispersion },
      }
      uniforms.current = { ...shared, uBack: { value: 0 } }
      const backUniforms = { ...shared, uBack: { value: 1 } }

      const geometry = crystalGeometry(three, facets)
      const back = new three.ShaderMaterial({
        vertexShader: CRYSTAL_VERTEX,
        fragmentShader: CRYSTAL_FRAGMENT,
        uniforms: backUniforms,
        transparent: true,
        depthWrite: false,
        side: three.BackSide,
      })
      const front = new three.ShaderMaterial({
        vertexShader: CRYSTAL_VERTEX,
        fragmentShader: CRYSTAL_FRAGMENT,
        uniforms: uniforms.current,
        transparent: true,
        depthWrite: false,
        side: three.FrontSide,
      })

      // The back first, the front over the top: the render order guarantees it,
      // sorting by distance would not, for two coincident meshes.
      const inner = new three.Mesh(geometry, back)
      inner.renderOrder = 0
      const outer = new three.Mesh(geometry, front)
      outer.renderOrder = 1

      const group = new three.Group()
      group.name = 'crystal'
      group.add(inner, outer)
      scene.scene.add(group)

      camera.position.set(0, 0, 4.2)
      camera.lookAt(0, 0, 0)

      world.current = { group }

      return () => {
        scene.scene.remove(group)
        geometry.dispose()
        back.dispose()
        front.dispose()
        world.current = null
      }
    },

    frame: (_scene, { time, delta }) => {
      const live = world.current
      if (live === null) return
      const { rpm: turns, dispersion: split, parallax: lean } = settings.current
      const { group } = live

      // The rotation is expressed as a function of elapsed time: the same
      // setting gives the same speed at sixty frames as at a hundred and twenty.
      group.rotation.y += (delta * turns * Math.PI * 2) / 60

      // A slow precession, and the lean towards the pointer on top of it.
      const targetZ = Math.sin(time * 0.3) * 0.12 - pointer.current.x * lean
      const targetX = Math.cos(time * 0.23) * 0.08 + pointer.current.y * lean * 0.6
      group.rotation.z += (targetZ - group.rotation.z) * Math.min(1, delta * 2.5)
      group.rotation.x += (targetX - group.rotation.x) * Math.min(1, delta * 2.5)

      const uniform = uniforms.current['uDispersion']
      if (uniform !== undefined) uniform.value = split
    },
  })

  // The theme has flipped: the tokens are re-read and the colours updated in
  // place. The scene is not rebuilt — only its colours change.
  useEffect(() => {
    const scene = context.current
    const live = uniforms.current
    if (scene === null || live['uColorA'] === undefined) return
    const [background, low, high] = colors.map((token) => readTokenColour(token, host))
    const paint = (key: string, value: ShaderColour | undefined): void => {
      const uniform = live[key]
      if (uniform === undefined || value === undefined) return
      ;(uniform.value as { setRGB: (r: number, g: number, b: number) => unknown }).setRGB(
        value[0],
        value[1],
        value[2],
      )
    }
    paint('uColorA', low)
    paint('uColorB', high)
    if (background !== undefined) {
      scene.renderer.setClearColor(
        new scene.three.Color(
          background[0],
          background[1],
          background[2],
        ).convertSRGBToLinear(),
        1,
      )
    }
  }, [theme, colors, host])

  const pending = usePoster({ ready, refused })

  useOnReady(
    onReady,
    ready && context.current !== null
      ? { scene: context.current, uniforms: uniforms.current }
      : null,
    host,
  )

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
