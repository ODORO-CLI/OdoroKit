/**
 * Ballpit: balls that fall, bounce and flee the pointer.
 *
 * ## Why a scene, and not a full-screen shader
 *
 * Lit spheres that overlap, each with its own shading and its own
 * highlight, are what a full-screen fragment does worst: every ball would
 * have to be summed at every pixel. An instanced geometry draws them all in
 * a single call, and the light comes free.
 *
 * ## The physics is simple, and bounded
 *
 * Gravity, impacts against the frame, pairwise impacts with a position
 * correction and a damped elastic impulse. The pairs are tested in n2: with
 * a hundred and sixty balls at most, that is under thirteen thousand tests
 * per frame, well below what an acceleration grid would deserve. The time
 * step is capped: one long frame — a tab coming back — does not catapult
 * the balls out of the frame.
 *
 * Gravity tilts slowly to one side and then to the other. Without that the
 * heap settles within a few seconds, and a frozen background is a dead
 * background.
 *
 * ## The frame follows the surface
 *
 * The walls are derived from the camera on every frame: the visible half
 * height at the depth of the balls, times the aspect of the surface. A
 * resize therefore moves the walls, and the balls settle back inside them
 * on the next frame.
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

/** What the escape hatch receives. */
export interface BallpitControls {
  /** Context of the scene: objects, camera, renderer, module. */
  readonly scene: SceneContext
  /** Live positions, three floats per ball. */
  readonly positions: Float32Array
  /** Live velocities, three floats per ball. */
  readonly velocities: Float32Array
}

/** Props belonging to the component itself. */
export interface BallpitOwnProps {
  /** Number of balls. @defaultValue 80 */
  count?: number
  /** Mean radius of a ball, in scene units. @defaultValue 0.32 */
  size?: number
  /** Gravity. @defaultValue 6 */
  gravity?: number
  /** Restitution of the impacts. @defaultValue 0.55 */
  bounce?: number
  /** Force with which the pointer pushes the balls away. @defaultValue 8 */
  push?: number
  /** Tokens of the balls, handed out in turn. */
  colors?: readonly [string, string, string]
  /** Classes of the fallback. */
  poster?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<BallpitControls>
}

/** All the props. */
export type BallpitProps = Customisable<BallpitOwnProps>

/** Tokens used by default for the balls. */
const DEFAULT_TOKENS = [
  '--o-palette-brand-500',
  '--o-palette-fuchsia-500',
  '--o-palette-sky-400',
] as const

/** The background of the scene always follows the theme. */
const BACKGROUND_TOKEN = '--o-theme-bg'

/** Default fallback: blurred blotches, in the same tones. */
const DEFAULT_POSTER =
  'o-bg-gradient-to-tr o-from-brand-300 dark:o-from-brand-900 o-via-zinc-50 dark:o-via-zinc-950 o-to-sky-300 dark:o-to-sky-900 o-blur-2xl o-scale-110'

/**
 * Ceiling on the number of balls.
 *
 * It bounds the pairwise tests: beyond it, the n2 would stop being
 * negligible and a grid would be called for. The instanced mesh is
 * allocated at that size once and for all.
 */
const MAX_BALLS = 160

/** Number of balls at low quality. */
const LOW_BALLS = 32

/** Depth of the pit, on either side of the plane of the balls. */
const DEPTH = 0.5

/** Distance from the camera to the plane of the balls. */
const CAMERA_DISTANCE = 6

/** Maximum time step: one long frame catapults nothing. */
const MAX_STEP = 1 / 30

/** Reach of the pointer push, in scene units. */
const PUSH_REACH = 1.6

/** What the loop works on, built once per mount. */
interface World {
  readonly mesh: InstanceType<SceneContext['three']['InstancedMesh']>
  readonly positions: Float32Array
  readonly velocities: Float32Array
  readonly radii: Float32Array
  readonly count: number
}

/** Bounded read of a typed array: never `undefined`, never a guard. */
function at(array: Float32Array, index: number): number {
  return array[index] ?? 0
}

/** Pseudo-random number for an index, stable from one mount to the next. */
function hash(index: number): number {
  const x = Math.sin(index * 127.1 + 311.7) * 43758.5453123
  return x - Math.floor(x)
}

/**
 * Ballpit.
 *
 * @example
 * <div className="o-relative o-h-96 o-overflow-hidden o-rounded-xl">
 *   <Ballpit className="o-absolute o-inset-0" />
 *   <div className="o-relative o-z-10">…</div>
 * </div>
 */
export function Ballpit({
  count = 80,
  size = 0.32,
  gravity = 6,
  bounce = 0.55,
  push = 8,
  colors = DEFAULT_TOKENS,
  poster = DEFAULT_POSTER,
  onReady,
  ...rest
}: BallpitProps): ReactElement {
  const { theme } = useMotionState()
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  // A crisp catch-up: the hand that shoves the balls aside has no inertia.
  const pointer = usePointerDamped({ host, speed: 6, name: 'ballpit : pointer' })

  const world = useRef<World | null>(null)
  const context = useRef<SceneContext | null>(null)

  // The hook brings the pointer back to the centre when it leaves the frame:
  // without this flag, the push would dig a permanent hole in the heap.
  const inside = useRef(false)

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

  // The settings are read through a ref inside the loop: moving a slider in
  // the workshop takes effect on the next frame without rebuilding the scene.
  const settings = useRef({ gravity, bounce, push })
  settings.current = { gravity, bounce, push }

  const { ref, ready, refused } = useScene<HTMLDivElement>({
    name: 'ballpit',
    setup: (scene) => {
      context.current = scene
      const { three, camera, renderer, quality } = scene

      const total = Math.min(
        quality === 'low' ? Math.min(count, LOW_BALLS) : count,
        MAX_BALLS,
      )

      camera.position.set(0, 0, CAMERA_DISTANCE)
      camera.lookAt(0, 0, 0)

      // The background is the colour of the theme. The token is in sRGB and
      // the engine encodes its clear colour from linear to sRGB: without the
      // reverse conversion, the background comes out a notch lighter than the
      // page.
      const paint = (value: ShaderColour): InstanceType<typeof three.Color> =>
        new three.Color().setRGB(value[0], value[1], value[2], three.SRGBColorSpace)
      renderer.setClearColor(paint(readTokenColour(BACKGROUND_TOKEN, host)), 1)

      const geometry = new three.SphereGeometry(1, 24, 16)
      const material = new three.MeshStandardMaterial({
        roughness: 0.38,
        metalness: 0.05,
      })
      const mesh = new three.InstancedMesh(geometry, material, MAX_BALLS)
      mesh.count = total
      mesh.name = 'ballpit'

      const positions = new Float32Array(MAX_BALLS * 3)
      const velocities = new Float32Array(MAX_BALLS * 3)
      const radii = new Float32Array(MAX_BALLS)

      const tints = colors.map((token) => paint(readTokenColour(token, host)))
      const dummy = new three.Object3D()

      for (let index = 0; index < total; index += 1) {
        // The balls are born above the frame, staggered, so that they fall
        // like rain rather than turning up already stacked.
        const radius = size * (0.7 + 0.6 * hash(index * 3 + 1))
        radii[index] = radius
        positions[index * 3] = (hash(index * 3 + 2) - 0.5) * 6
        positions[index * 3 + 1] = 3 + hash(index * 3 + 3) * 8
        positions[index * 3 + 2] = (hash(index * 3 + 4) - 0.5) * DEPTH

        dummy.position.set(
          at(positions, index * 3),
          at(positions, index * 3 + 1),
          at(positions, index * 3 + 2),
        )
        dummy.scale.setScalar(radius)
        dummy.updateMatrix()
        mesh.setMatrixAt(index, dummy.matrix)
        mesh.setColorAt(
          index,
          tints[index % tints.length] ?? tints[0] ?? new three.Color(),
        )
      }
      mesh.instanceMatrix.needsUpdate = true
      if (mesh.instanceColor !== null) mesh.instanceColor.needsUpdate = true

      // One key light, one fill light, one ambient: enough to give the
      // spheres a volume without any cast shadow.
      const key = new three.DirectionalLight()
      key.intensity = 2.4
      key.position.set(3, 5, 4)
      const fill = new three.DirectionalLight()
      fill.intensity = 0.7
      fill.position.set(-4, -2, 3)
      const ambient = new three.AmbientLight()
      ambient.intensity = 0.9

      const group = new three.Group()
      group.name = 'ballpit-group'
      group.add(mesh, key, fill, ambient)
      scene.scene.add(group)

      world.current = { mesh, positions, velocities, radii, count: total }

      return () => {
        scene.scene.remove(group)
        geometry.dispose()
        material.dispose()
        mesh.dispose()
        world.current = null
      }
    },

    frame: ({ camera, three }, { time, delta }) => {
      const live = world.current
      if (live === null) return
      const { positions, velocities, radii, count: total, mesh } = live
      const { gravity: g, bounce: restitution, push: force } = settings.current

      // The walls: the visible half height at the depth of the balls, times
      // the aspect of the surface. Read on every frame, they follow the
      // resize.
      const halfHeight = Math.tan((camera.fov * Math.PI) / 360) * CAMERA_DISTANCE
      const halfWidth = halfHeight * camera.aspect

      // Gravity tilts slowly: the heap never quite settles for good.
      const gx = Math.sin(time * 0.25) * g * 0.12
      const gy = -g

      // The pointer, from the frame of the hook to that of the scene.
      const px = pointer.current.x * halfWidth
      const py = -pointer.current.y * halfHeight

      const dt = Math.min(delta, MAX_STEP)
      const drag = 1 - 0.08 * dt

      for (let index = 0; index < total; index += 1) {
        const base = index * 3
        let vx = at(velocities, base) + gx * dt
        let vy = at(velocities, base + 1) + gy * dt
        let vz = at(velocities, base + 2)

        // The push: a force that falls off linearly with the distance to the
        // pointer, and is zero beyond its reach.
        const dx = at(positions, base) - px
        const dy = at(positions, base + 1) - py
        const distance = Math.hypot(dx, dy)
        if (inside.current && force > 0 && distance < PUSH_REACH && distance > 0.0001) {
          const weight = (1 - distance / PUSH_REACH) * force * dt
          vx += (dx / distance) * weight
          vy += (dy / distance) * weight
        }

        vx *= drag
        vy *= drag
        vz *= drag

        let x = at(positions, base) + vx * dt
        let y = at(positions, base + 1) + vy * dt
        let z = at(positions, base + 2) + vz * dt
        const radius = at(radii, index)

        // The walls: the position is brought back inside the frame, and the
        // normal velocity flips, damped by the restitution.
        if (x < -halfWidth + radius) {
          x = -halfWidth + radius
          vx = Math.abs(vx) * restitution
        } else if (x > halfWidth - radius) {
          x = halfWidth - radius
          vx = -Math.abs(vx) * restitution
        }
        if (y < -halfHeight + radius) {
          y = -halfHeight + radius
          vy = Math.abs(vy) * restitution
        } else if (y > halfHeight + 10) {
          // Nothing holds the balls back from above, save a distant limit
          // that prevents an endless drift when gravity is zero.
          y = halfHeight + 10
          vy = 0
        }
        if (z < -DEPTH + radius * 0.5) {
          z = -DEPTH + radius * 0.5
          vz = Math.abs(vz) * restitution
        } else if (z > DEPTH - radius * 0.5) {
          z = DEPTH - radius * 0.5
          vz = -Math.abs(vz) * restitution
        }

        positions[base] = x
        positions[base + 1] = y
        positions[base + 2] = z
        velocities[base] = vx
        velocities[base + 1] = vy
        velocities[base + 2] = vz
      }

      // The pairwise impacts: position correction, then an impulse along the
      // normal if the balls are closing in. The mass follows the cube of the
      // radius, so that a big ball shoves the small ones aside.
      for (let i = 0; i < total; i += 1) {
        const bi = i * 3
        const ri = at(radii, i)
        for (let j = i + 1; j < total; j += 1) {
          const bj = j * 3
          const rj = at(radii, j)
          const dx = at(positions, bj) - at(positions, bi)
          const dy = at(positions, bj + 1) - at(positions, bi + 1)
          const dz = at(positions, bj + 2) - at(positions, bi + 2)
          const minimum = ri + rj
          const squared = dx * dx + dy * dy + dz * dz
          if (squared >= minimum * minimum || squared < 0.000001) continue

          const distance = Math.sqrt(squared)
          const nx = dx / distance
          const ny = dy / distance
          const nz = dz / distance
          const overlap = minimum - distance

          const mi = ri * ri * ri
          const mj = rj * rj * rj
          const share = mj / (mi + mj)

          positions[bi] = at(positions, bi) - nx * overlap * share
          positions[bi + 1] = at(positions, bi + 1) - ny * overlap * share
          positions[bi + 2] = at(positions, bi + 2) - nz * overlap * share
          positions[bj] = at(positions, bj) + nx * overlap * (1 - share)
          positions[bj + 1] = at(positions, bj + 1) + ny * overlap * (1 - share)
          positions[bj + 2] = at(positions, bj + 2) + nz * overlap * (1 - share)

          const rvx = at(velocities, bj) - at(velocities, bi)
          const rvy = at(velocities, bj + 1) - at(velocities, bi + 1)
          const rvz = at(velocities, bj + 2) - at(velocities, bi + 2)
          const closing = rvx * nx + rvy * ny + rvz * nz
          if (closing >= 0) continue

          const impulse = (-(1 + restitution) * closing) / (1 / mi + 1 / mj)
          velocities[bi] = at(velocities, bi) - (nx * impulse) / mi
          velocities[bi + 1] = at(velocities, bi + 1) - (ny * impulse) / mi
          velocities[bi + 2] = at(velocities, bi + 2) - (nz * impulse) / mi
          velocities[bj] = at(velocities, bj) + (nx * impulse) / mj
          velocities[bj + 1] = at(velocities, bj + 1) + (ny * impulse) / mj
          velocities[bj + 2] = at(velocities, bj + 2) + (nz * impulse) / mj
        }
      }

      // The matrices: one translation and one scale per ball, without going
      // through an intermediate object — the only write per frame.
      const matrix = new three.Matrix4()
      for (let index = 0; index < total; index += 1) {
        const base = index * 3
        const radius = at(radii, index)
        matrix.makeScale(radius, radius, radius)
        matrix.setPosition(
          at(positions, base),
          at(positions, base + 1),
          at(positions, base + 2),
        )
        mesh.setMatrixAt(index, matrix)
      }
      mesh.instanceMatrix.needsUpdate = true
    },
  })

  // The theme has flipped: the tokens are read again and the colours updated
  // in place. The scene is not rebuilt — only its colours change.
  useEffect(() => {
    const scene = context.current
    const live = world.current
    if (scene === null || live === null) return
    const { three, renderer } = scene
    const paint = (value: ShaderColour): InstanceType<typeof three.Color> =>
      new three.Color().setRGB(value[0], value[1], value[2], three.SRGBColorSpace)

    renderer.setClearColor(paint(readTokenColour(BACKGROUND_TOKEN, host)), 1)
    const tints = colors.map((token) => paint(readTokenColour(token, host)))
    for (let index = 0; index < live.count; index += 1) {
      const tint = tints[index % tints.length]
      if (tint !== undefined) live.mesh.setColorAt(index, tint)
    }
    if (live.mesh.instanceColor !== null) live.mesh.instanceColor.needsUpdate = true
  }, [theme, colors, host])

  const pending = usePoster({ ready, refused })

  useOnReady(
    onReady,
    ready && context.current !== null && world.current !== null
      ? {
          scene: context.current,
          positions: world.current.positions,
          velocities: world.current.velocities,
        }
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
