/**
 * City blocks: a checkerboard of blocks seen in isometric view, rising and
 * falling back in a diagonal cascade.
 *
 * ## Why an instanced scene, and not a shader
 *
 * Lit boxes, seen from above at an angle, with their shaded faces and
 * their occlusions: a fragment shader would have to cast one ray per
 * pixel through the checkerboard. A scene does it in the pipeline, and a
 * single instanced geometry is enough: a few hundred blocks draw in one
 * call, and the loop rewrites nothing but their matrices — one scale and
 * one position per block. It is the cheaper of the two techniques, and
 * the only one that gives lit faces without simulating them.
 *
 * ## The cascade
 *
 * Each block's height follows a sine of time offset by the sum of its two
 * indices: the wave crosses the checkerboard along the diagonal, the one
 * the isometric camera faces head on. Each block also has a base height
 * drawn once, without which the wave would read as a smooth sheet rather
 * than as a city.
 *
 * The camera is not orthographic — the engine supplies a perspective — but
 * placed high and far, on the diagonal: the isometric effect comes from
 * the angle, not from the projection. The whole thing pivots very slowly.
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

import { usePoster } from '@registre/hooks/usePoster'

/** Properties specific to this component. */
export interface CityBlocksOwnProps {
  /** Blocks per side of the checkerboard. @defaultValue 14 */
  size?: number
  /** Cascade speed. @defaultValue 0.6 */
  speed?: number
  /** Maximum block height, in scene units. @defaultValue 2.4 */
  height?: number
  /** Gap between blocks, as a fraction of a block. @defaultValue 0.25 */
  gap?: number
  /** Tokens: the background, the low blocks, the tall blocks. */
  colors?: readonly [string, string, string]
  /** Fallback classes. */
  poster?: string
}

/** Every property. */
export type CityBlocksProps = Customisable<CityBlocksOwnProps>

/** Tokens used by default. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-indigo-500',
  '--o-palette-sky-300',
] as const

/** Default fallback: a frozen hue, in the same tones. */
const DEFAULT_POSTER =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-to-indigo-100 dark:o-to-indigo-950'

/**
 * Blocks per side at low quality.
 *
 * The cost lies in the matrices rewritten every frame, one per block; the
 * number of blocks is the square of the side.
 */
const LOW_SIZE = 10

type Three = SceneContext['three']
type InstancedMesh = InstanceType<Three['InstancedMesh']>
type Object3D = InstanceType<Three['Object3D']>
type Group = InstanceType<Three['Group']>
type Colour = InstanceType<Three['Color']>

/** What the scene keeps between construction and frames. */
interface City {
  readonly side: number
  readonly mesh: InstancedMesh
  /** Scratch object whose matrix is copied into each instance. */
  readonly proxy: Object3D
  readonly group: Group
  readonly colour: Colour
}

/** Deterministic pseudo-random number: the city is the same on every mount. */
function hash(seed: number): number {
  const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453
  return value - Math.floor(value)
}

/**
 * City blocks.
 *
 * @example
 * <div className="o-relative o-h-96 o-overflow-hidden o-rounded-xl">
 *   <CityBlocks className="o-absolute o-inset-0" />
 *   <div className="o-relative o-z-10">…</div>
 * </div>
 */
export function CityBlocks({
  size = 14,
  speed = 0.6,
  height = 2.4,
  gap = 0.25,
  colors = DEFAULT_TOKENS,
  poster = DEFAULT_POSTER,
  ...rest
}: CityBlocksProps): ReactElement {
  const { theme } = useMotionState()
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  const city = useRef<City | null>(null)
  const context = useRef<SceneContext | null>(null)

  const settings = useRef({ speed, height, gap })
  settings.current = { speed, height, gap }

  /** Paints each block between the two hues, from a stable draw. */
  const paint = (
    ville: City,
    low: ShaderColour | undefined,
    high: ShaderColour | undefined,
  ): void => {
    const count = ville.side * ville.side
    for (let index = 0; index < count; index += 1) {
      const share = hash(index + 0.5)
      ville.colour.setRGB(
        (low?.[0] ?? 0) + ((high?.[0] ?? 0) - (low?.[0] ?? 0)) * share,
        (low?.[1] ?? 0) + ((high?.[1] ?? 0) - (low?.[1] ?? 0)) * share,
        (low?.[2] ?? 0) + ((high?.[2] ?? 0) - (low?.[2] ?? 0)) * share,
      )
      ville.mesh.setColorAt(index, ville.colour)
    }
    if (ville.mesh.instanceColor !== null) ville.mesh.instanceColor.needsUpdate = true
  }

  const { ref, ready, refused } = useScene<HTMLDivElement>({
    name: 'blocks',
    setup: (scene: SceneContext) => {
      context.current = scene
      const { three, renderer, camera, quality } = scene

      const [bg, low, high] = colors.map((token) => readTokenColour(token, ref.current))

      // The scene's background is the page's background. The token is in sRGB and
      // the engine encodes its clear colour from linear to sRGB:
      // without the inverse conversion, the background comes out a shade lighter.
      renderer.setClearColor(
        new three.Color(bg?.[0] ?? 0, bg?.[1] ?? 0, bg?.[2] ?? 0).convertSRGBToLinear(),
        1,
      )

      const side = quality === 'low' ? Math.min(size, LOW_SIZE) : Math.max(size, 2)
      const count = side * side

      // The camera, high and far on the diagonal: the isometry comes from the
      // angle. The distance follows the side, so the checkerboard fills the
      // frame whatever its number of blocks.
      const distance = side * 0.95
      camera.position.set(distance, distance * 0.8, distance)
      camera.lookAt(0, height * 0.25, 0)

      // A box whose base sits at the origin: scaling in y only raises it,
      // without sinking it into the ground.
      const geometry = new three.BoxGeometry(1, 1, 1)
      geometry.translate(0, 0.5, 0)

      const material = new three.MeshLambertMaterial()
      const mesh = new three.InstancedMesh(geometry, material, count)
      mesh.instanceMatrix.setUsage(three.DynamicDrawUsage)

      // Two lights with no colour of their own: an ambient one so the shadow
      // is not black, a directional one at an angle so the three visible
      // faces have three values.
      const ambient = new three.AmbientLight(undefined, 0.9)
      const sun = new three.DirectionalLight(undefined, 2.2)
      sun.position.set(3, 6, 2)

      const group = new three.Group()
      group.name = 'blocks'
      group.add(mesh)
      group.add(ambient)
      group.add(sun)
      scene.scene.add(group)

      const ville: City = {
        side,
        mesh,
        proxy: new three.Object3D(),
        group,
        colour: new three.Color(),
      }
      paint(ville, low, high)
      city.current = ville

      return () => {
        scene.scene.remove(group)
        city.current = null
      }
    },

    frame: (_, { time, delta }) => {
      const ville = city.current
      if (ville === null) return
      const { speed: rate, height: peak, gap: space } = settings.current
      const { side, mesh, proxy } = ville

      const pitch = 1 + Math.max(space, 0)
      const half = (side - 1) / 2
      const phase = time * rate * 2

      for (let ix = 0; ix < side; ix += 1) {
        for (let iz = 0; iz < side; iz += 1) {
          const index = ix * side + iz

          // A base height of the block's own, and the diagonal wave.
          const base = 0.35 + hash(index + 0.5) * 0.65
          const wave = 0.5 + 0.5 * Math.sin(phase - (ix + iz) * 0.55)
          const tall = Math.max(peak * base * (0.2 + 0.8 * wave), 0.05)

          proxy.position.set((ix - half) * pitch, 0, (iz - half) * pitch)
          proxy.scale.set(1, tall, 1)
          proxy.updateMatrix()
          mesh.setMatrixAt(index, proxy.matrix)
        }
      }
      mesh.instanceMatrix.needsUpdate = true

      // The whole thing pivots very slowly: the isometric view does not freeze.
      ville.group.rotation.y += delta * 0.04
    },
  })

  // The theme has flipped: the tokens are re-read and the colours repainted in
  // place. The scene is not rebuilt.
  useEffect(() => {
    const scene = context.current
    const ville = city.current
    if (scene === null || ville === null || host === null) return
    const [bg, low, high] = colors.map((token) => readTokenColour(token, host))
    paint(ville, low, high)
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
