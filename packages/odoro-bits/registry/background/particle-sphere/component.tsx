/**
 * Sphere of points: a spherical cloud that turns, and that the pointer lifts.
 *
 * ## What this background reacts to
 *
 * To pointer movement, with damping: the position of the cursor is projected
 * onto the hemisphere facing the camera, then brought back into the frame of
 * the sphere as it turns — without that, the bump would turn with it instead
 * of staying under the cursor. The points near that direction are lifted
 * along their normal and change hue. On leaving the frame, the bump fades
 * out.
 *
 * What sets this entry apart from `orbital-sphere`: over there a decorative
 * sphere, girded with rings and studded with nodes, which only turns; here a
 * surface of points that deforms under the hand.
 *
 * ## What happens per frame
 *
 * No React render: the rotation, the direction of the pointer and the
 * strength of the bump are written into live uniforms from the engine loop.
 * The working vectors and quaternions are allocated once, at construction.
 *
 * ## The fallback
 *
 * While the scene loads, without WebGL, under reduced motion, or if the
 * arbiter refuses a second scene, a blurred gradient takes its place — in the
 * same tones, with no hard edge.
 *
 * @module
 */

import {
  NOISE_FUNCTIONS_3D,
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

import {
  PARTICLE_SPHERE_FRAGMENT,
  PARTICLE_SPHERE_VERTEX,
} from './particle-sphere.shader.js'

/** What the escape hatch receives. */
export interface ParticleSphereControls {
  /** Scene context: objects, camera, renderer, module. */
  readonly scene: SceneContext
  /** Live uniforms: changing them changes the render on the next frame. */
  readonly uniforms: Record<string, { value: unknown }>
}

/** Props specific to this component. */
export interface ParticleSphereOwnProps {
  /** Number of points. @defaultValue 3000 */
  points?: number
  /** Size of a point, in pixels. @defaultValue 2.5 */
  size?: number
  /** Height of the bump under the pointer, in radii. @defaultValue 0.35 */
  pull?: number
  /** Extent of the bump, between zero and one. @defaultValue 0.45 */
  reach?: number
  /** Rotation speed, in turns per minute. @defaultValue 1.5 */
  rpm?: number
  /** Tokens: the background, the points, the lifted points. */
  colors?: readonly [string, string, string]
  /** Fallback classes. */
  poster?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<ParticleSphereControls>
}

/** All props. */
export type ParticleSphereProps = Customisable<ParticleSphereOwnProps>

/** Tokens used by default. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-cyan-400',
  '--o-palette-amber-400',
] as const

/** Default fallback: a frozen halo, in the same tones. */
const DEFAULT_POSTER =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-via-cyan-200 dark:o-via-cyan-900 o-to-zinc-50 dark:o-to-zinc-950 o-blur-2xl o-scale-110'

/** Number of points at low quality. */
const LOW_POINTS = 1200

/** Ceiling on the number of points: beyond it, the cloud is nothing but noise. */
const MAX_POINTS = 8000

/** The golden angle, which gives the spiral its step. */
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

/** What the loop handles, built once per mount. */
interface World {
  readonly group: InstanceType<SceneContext['three']['Group']>
  readonly direction: InstanceType<SceneContext['three']['Vector3']>
  readonly inverse: InstanceType<SceneContext['three']['Quaternion']>
}

/** Pseudo-random number for an index, stable from one mount to the next. */
function hash(index: number): number {
  const x = Math.sin(index * 127.1 + 311.7) * 43758.5453123
  return x - Math.floor(x)
}

/**
 * Sphere of points.
 *
 * @example
 * <div className="o-relative o-h-96 o-overflow-hidden o-rounded-xl">
 *   <ParticleSphere className="o-absolute o-inset-0" />
 *   <div className="o-relative o-z-10">…</div>
 * </div>
 */
export function ParticleSphere({
  points = 3000,
  size = 2.5,
  pull = 0.35,
  reach = 0.45,
  rpm = 1.5,
  colors = DEFAULT_TOKENS,
  poster = DEFAULT_POSTER,
  onReady,
  ...rest
}: ParticleSphereProps): ReactElement {
  const { theme } = useMotionState()
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  const pointer = usePointerDamped({ host, speed: 4, name: 'particle-sphere : pointer' })

  const uniforms = useRef<Record<string, { value: unknown }>>({})
  const context = useRef<SceneContext | null>(null)
  const world = useRef<World | null>(null)

  // The hook brings the pointer back to the centre when it leaves the frame:
  // without this flag, the bump would stay stuck in the middle of the sphere.
  const inside = useRef(false)
  const strength = useRef(0)

  useEffect(() => {
    if (host === null) return
    const onEnter = (): void => {
      inside.current = true
    }
    const onLeave = (): void => {
      inside.current = false
    }
    host.addEventListener('pointerenter', onEnter, { passive: true })
    host.addEventListener('pointerleave', onLeave, { passive: true })
    return () => {
      host.removeEventListener('pointerenter', onEnter)
      host.removeEventListener('pointerleave', onLeave)
    }
  }, [host])

  // The settings are read by ref inside the loop: moving a slider in the
  // workshop takes effect on the next frame without rebuilding the scene.
  const settings = useRef({ size, pull, reach, rpm })
  settings.current = { size, pull, reach, rpm }

  const { ref, ready, refused } = useScene<HTMLDivElement>({
    name: 'particle-sphere',
    setup: (scene) => {
      context.current = scene
      const { three, camera, renderer, quality } = scene

      const paint = (value: ShaderColour): InstanceType<typeof three.Color> =>
        new three.Color(value[0], value[1], value[2])
      const [background, tint, lifted] = colors.map((token) =>
        readTokenColour(token, host),
      )

      // The background is the colour of the theme. The token is in sRGB and
      // the engine encodes its clear colour from linear to sRGB: without the
      // inverse conversion, the background comes out a notch lighter than the
      // page.
      renderer.setClearColor(paint(background ?? [0, 0, 0]).convertSRGBToLinear(), 1)

      const total = Math.min(
        quality === 'low' ? Math.min(points, LOW_POINTS) : points,
        MAX_POINTS,
      )

      // The Fibonacci spiral spreads the points at equal distance; a slight
      // draw per point breaks the regularity of the lattice, which would
      // otherwise read as moire.
      const positions = new Float32Array(total * 3)
      for (let index = 0; index < total; index += 1) {
        const y = 1 - (index / Math.max(total - 1, 1)) * 2
        const ray = Math.sqrt(Math.max(0, 1 - y * y))
        const theta = GOLDEN_ANGLE * index + (hash(index) - 0.5) * 0.35
        const wobble = 1 + (hash(index * 7 + 3) - 0.5) * 0.02
        positions[index * 3] = Math.cos(theta) * ray * wobble
        positions[index * 3 + 1] = y * wobble
        positions[index * 3 + 2] = Math.sin(theta) * ray * wobble
      }

      const geometry = new three.BufferGeometry()
      geometry.setAttribute('position', new three.BufferAttribute(positions, 3))

      uniforms.current = {
        uTime: { value: 0 },
        uPointer: { value: new three.Vector3(0, 0, 1) },
        uPull: { value: 0 },
        uReach: { value: reach },
        uSize: { value: size },
        uPixelRatio: { value: renderer.getPixelRatio() },
        uColorA: { value: paint(tint ?? [0, 0, 0]) },
        uColorB: { value: paint(lifted ?? [0, 0, 0]) },
      }

      const material = new three.ShaderMaterial({
        vertexShader: `${NOISE_FUNCTIONS_3D}\n${PARTICLE_SPHERE_VERTEX}`,
        fragmentShader: PARTICLE_SPHERE_FRAGMENT,
        uniforms: uniforms.current,
        transparent: true,
        depthWrite: false,
      })

      const group = new three.Group()
      group.name = 'particle-sphere'
      group.add(new three.Points(geometry, material))
      scene.scene.add(group)

      camera.position.set(0, 0, 3.4)
      camera.lookAt(0, 0, 0)

      world.current = {
        group,
        direction: new three.Vector3(0, 0, 1),
        inverse: new three.Quaternion(),
      }

      return () => {
        scene.scene.remove(group)
        geometry.dispose()
        material.dispose()
        world.current = null
      }
    },

    frame: (_scene, { time, delta }) => {
      const live = world.current
      if (live === null) return
      const { group, direction, inverse } = live
      const { size: px, pull: height, reach: extent, rpm: turns } = settings.current
      const current = uniforms.current

      // The rotation is expressed as a function of the elapsed time: the same
      // setting gives the same speed at sixty as at a hundred and twenty
      // frames.
      group.rotation.y += (delta * turns * Math.PI * 2) / 60
      group.rotation.x = Math.sin(time * 0.2) * 0.18

      // The pointer, projected onto the hemisphere facing the camera: inside
      // the frame, the direction points forward; at the edge, it lies down
      // onto the outline.
      let x = pointer.current.x * 1.15
      let y = -pointer.current.y * 1.15
      const spread = Math.hypot(x, y)
      if (spread > 1) {
        x /= spread
        y /= spread
      }
      const z = Math.sqrt(Math.max(0, 1 - x * x - y * y))
      // Then brought back into the frame of the sphere, which turns under the
      // cursor.
      inverse.copy(group.quaternion).invert()
      direction.set(x, y, z).applyQuaternion(inverse)

      // The strength rises and falls gently: the bump does not snap on
      // entering the frame, and does not stay stuck on leaving it.
      const target = inside.current ? height : 0
      strength.current += (target - strength.current) * Math.min(1, delta * 6)

      const set = (key: string, value: unknown): void => {
        const uniform = current[key]
        if (uniform !== undefined) uniform.value = value
      }
      set('uTime', time)
      set('uPull', strength.current)
      set('uReach', extent)
      set('uSize', px)
      const target_ = current['uPointer']
      if (target_ !== undefined) {
        ;(target_.value as { copy: (v: unknown) => unknown }).copy(direction)
      }
    },
  })

  // The theme has flipped: the tokens are read again and the colours updated
  // in place. The scene is not rebuilt — only its colours change.
  useEffect(() => {
    const scene = context.current
    const live = uniforms.current
    if (scene === null || live['uColorA'] === undefined) return
    const [background, tint, lifted] = colors.map((token) => readTokenColour(token, host))
    const paint = (key: string, value: ShaderColour | undefined): void => {
      const uniform = live[key]
      if (uniform === undefined || value === undefined) return
      ;(uniform.value as { setRGB: (r: number, g: number, b: number) => unknown }).setRGB(
        value[0],
        value[1],
        value[2],
      )
    }
    paint('uColorA', tint)
    paint('uColorB', lifted)
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
