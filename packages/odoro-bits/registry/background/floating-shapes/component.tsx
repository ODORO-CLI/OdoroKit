/**
 * Floating shapes: simple solids that drift, spin on themselves and shift
 * in parallax under the pointer.
 *
 * ## Why the parallax is spread over the depth
 *
 * Pivoting the whole scene under the pointer gives a camera movement, not a
 * depth: everything moves by the same angle, and the eye draws no
 * information from it. Here each solid shifts by a fraction that depends on
 * its distance to the camera — the near ones a great deal, the far ones
 * barely. It is the only cue that really separates the planes.
 *
 * ## Five geometries, two materials, as many solids as one likes
 *
 * The geometries and the materials are built once and shared: one more solid
 * costs no more than a draw call, not an allocation. Half of the solids are
 * wireframe, which gives the group two registers instead of one and avoids
 * a soup of solid volumes.
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
export interface FloatingShapesOwnProps {
  /** Number of solids. @defaultValue 18 */
  shapes?: number
  /** Speed of drift and of rotation. @defaultValue 1 */
  speed?: number
  /** Amplitude of the parallax under the pointer. @defaultValue 1 */
  parallax?: number
  /** Tokens: the background, the solid shapes, the wireframe shapes. */
  colors?: readonly [string, string, string]
  /** Fallback classes. */
  poster?: string
}

/** Every property. */
export type FloatingShapesProps = Customisable<FloatingShapesOwnProps>

/** Tokens used by default. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-500',
  '--o-palette-purple-400',
] as const

/** Default fallback: a frozen hue, in the same tones. */
const DEFAULT_POSTER =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-to-purple-100 dark:o-to-purple-950'

/** Number of solids at low quality. */
const LOW_SHAPES = 9

type Three = SceneContext['three']
type Object3D = InstanceType<Three['Object3D']>
type Group = InstanceType<Three['Group']>
type Material = InstanceType<Three['MeshLambertMaterial']>

/** What a solid keeps between frames. */
interface Floater {
  readonly mesh: Object3D
  /** Rest position, before parallax. */
  readonly home: readonly [number, number, number]
  /** Its own rotation speed, in radians per second. */
  readonly spin: readonly [number, number]
  /** Phase and amplitude of the vertical bobbing. */
  readonly bob: readonly [number, number]
  /** Share of parallax, derived from the depth. */
  readonly depth: number
}

/** What the scene keeps between construction and frames. */
interface Floating {
  readonly group: Group
  readonly items: readonly Floater[]
  readonly solid: Material
  readonly wire: Material
}

/** Deterministic pseudo-random number: the composition is the same on every mount. */
function hash(seed: number): number {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
  return value - Math.floor(value)
}

/**
 * Floating shapes.
 *
 * @example
 * <div className="o-relative o-h-96 o-overflow-hidden o-rounded-xl">
 *   <FloatingShapes className="o-absolute o-inset-0" />
 *   <div className="o-relative o-z-10">…</div>
 * </div>
 */
export function FloatingShapes({
  shapes = 18,
  speed = 1,
  parallax = 1,
  colors = DEFAULT_TOKENS,
  poster = DEFAULT_POSTER,
  ...rest
}: FloatingShapesProps): ReactElement {
  const { theme } = useMotionState()
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  const floating = useRef<Floating | null>(null)
  const context = useRef<SceneContext | null>(null)

  const settings = useRef({ speed, parallax })
  settings.current = { speed, parallax }

  const pointer = usePointerDamped({
    host,
    speed: 2.5,
    name: 'floating-shapes : pointer',
  })

  const { ref, ready, refused } = useScene<HTMLDivElement>({
    name: 'floating-shapes',
    setup: (scene: SceneContext) => {
      context.current = scene
      const { three, renderer, camera, quality } = scene

      const [bg, full, wired] = colors.map((token) => readTokenColour(token, ref.current))

      // The scene's background is the page's background. The token is in sRGB and
      // the engine encodes its clear colour from linear to sRGB:
      // without the inverse conversion, the background comes out a shade lighter.
      renderer.setClearColor(
        new three.Color(bg?.[0] ?? 0, bg?.[1] ?? 0, bg?.[2] ?? 0).convertSRGBToLinear(),
        1,
      )

      camera.position.set(0, 0, 6)
      camera.lookAt(0, 0, 0)

      const count = quality === 'low' ? Math.min(shapes, LOW_SHAPES) : Math.max(shapes, 1)

      // The geometries are built once and shared: one more solid costs no more
      // than a draw call.
      const library = [
        new three.BoxGeometry(0.6, 0.6, 0.6),
        new three.TetrahedronGeometry(0.45),
        new three.OctahedronGeometry(0.42),
        new three.IcosahedronGeometry(0.4),
        new three.TorusGeometry(0.32, 0.11, 8, 20),
      ] as const

      const solid = new three.MeshLambertMaterial({ transparent: true, opacity: 0.9 })
      solid.color.setRGB(full?.[0] ?? 0, full?.[1] ?? 0, full?.[2] ?? 0)
      const wire = new three.MeshLambertMaterial({
        wireframe: true,
        transparent: true,
        opacity: 0.8,
      })
      wire.color.setRGB(wired?.[0] ?? 0, wired?.[1] ?? 0, wired?.[2] ?? 0)

      // Two lights with no colour of their own: an ambient one so the shadow is
      // not black, a directional one so the faces can be told apart.
      const group = new three.Group()
      group.name = 'formes'
      group.add(new three.AmbientLight(undefined, 0.7))
      const sun = new three.DirectionalLight(undefined, 1.5)
      sun.position.set(2, 3, 4)
      group.add(sun)

      const items: Floater[] = []
      for (let index = 0; index < count; index += 1) {
        const geometry = library[index % library.length]
        if (geometry === undefined) continue

        const mesh = new three.Mesh(geometry, index % 2 === 0 ? solid : wire)

        // The depth is drawn first: it governs the apparent size, the share of
        // parallax, and the lateral spread.
        const depth = hash(index + 0.5)
        const z = -4.5 + depth * 5.5
        const spread = 4.2 - depth * 1.4
        const home = [
          (hash(index + 1.5) - 0.5) * 2 * spread,
          (hash(index + 2.5) - 0.5) * 2 * spread * 0.62,
          z,
        ] as const

        mesh.position.set(home[0], home[1], home[2])
        mesh.scale.setScalar(0.7 + depth * 0.8)

        items.push({
          mesh,
          home,
          spin: [
            (hash(index + 3.5) - 0.5) * 0.7,
            (hash(index + 4.5) - 0.5) * 0.7,
          ] as const,
          bob: [hash(index + 5.5) * 6.283, 0.1 + hash(index + 6.5) * 0.22] as const,
          // A near solid shifts a great deal, a far one barely.
          depth,
        })
        group.add(mesh)
      }

      scene.scene.add(group)
      floating.current = { group, items, solid, wire }

      return () => {
        scene.scene.remove(group)
        floating.current = null
      }
    },

    frame: (_, { time, delta }) => {
      const live = floating.current
      if (live === null) return
      const { speed: rate, parallax: shift } = settings.current

      // The pointer, from the hook's frame to the scene's.
      const px = pointer.current.x
      const py = -pointer.current.y

      for (const item of live.items) {
        const { mesh, home, spin, bob, depth } = item

        mesh.rotation.x += (spin[0] ?? 0) * rate * delta
        mesh.rotation.y += (spin[1] ?? 0) * rate * delta

        // The parallax: the share depends on the depth, not on the object.
        const share = (0.15 + depth * 0.85) * shift
        mesh.position.x = (home[0] ?? 0) + px * share * 0.7
        mesh.position.y =
          (home[1] ?? 0) +
          py * share * 0.45 +
          Math.sin(time * rate * 0.6 + (bob[0] ?? 0)) * (bob[1] ?? 0)
      }
    },
  })

  // The theme has flipped: the tokens are re-read and the materials repainted in
  // place. The scene is not rebuilt.
  useEffect(() => {
    const scene = context.current
    const live = floating.current
    if (scene === null || live === null || host === null) return
    const [bg, full, wired] = colors.map((token) => readTokenColour(token, host))
    const paint = (material: Material, tint: ShaderColour | undefined): void => {
      material.color.setRGB(tint?.[0] ?? 0, tint?.[1] ?? 0, tint?.[2] ?? 0)
    }
    paint(live.solid, full)
    paint(live.wire, wired)
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
