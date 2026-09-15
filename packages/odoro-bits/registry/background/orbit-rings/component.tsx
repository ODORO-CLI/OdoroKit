/**
 * Orbit rings of points in tilted orbit around an empty centre.
 *
 * ## Why instanced points, and not a shader
 *
 * The positions are analytic — a circle, a tilt, a rotation — and nothing
 * depends on the previous frame. A fragment shader could solve them, but for
 * every pixel it would have to project rings in three dimensions and sort their
 * depth. A point cloud per ring does that work in the pipeline: the geometry is
 * built once, and the loop only ever touches rotations — three numbers per
 * ring, no attribute rewritten. It is the simplest technique that holds the
 * frame rate, and the cheaper of the two.
 *
 * ## The composition
 *
 * Each ring has its radius, its tilt and its direction of rotation, in
 * alternation: two neighbouring rings turn in opposite directions, without
 * which the whole would read as a single disc. The centre stays empty — that is
 * what sets it apart from a sphere girded with rings — and the whole precesses
 * slowly so that the rings cross.
 *
 * ## What this component does not do
 *
 * It opens neither an animation loop nor an observer: `useScene` carries them.
 * It writes no colour: the background and the rings are read from the tokens,
 * and repainted in place when the theme flips.
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
export interface OrbitRingsOwnProps {
  /** Number of rings. @defaultValue 5 */
  rings?: number
  /** Points per ring. @defaultValue 320 */
  points?: number
  /** Rotation speed of the first ring, in turns per minute. @defaultValue 3 */
  rpm?: number
  /** Base tilt of the rings, in radians. @defaultValue 0.6 */
  tilt?: number
  /** Tokens: the background, the inner ring, the outer ring. */
  colors?: readonly [string, string, string]
  /** Fallback classes. */
  poster?: string
}

/** All props. */
export type OrbitRingsProps = Customisable<OrbitRingsOwnProps>

/** Tokens used by default. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-500',
  '--o-palette-fuchsia-400',
] as const

/** Default fallback: a frozen halo, in the same tones. */
const DEFAULT_POSTER =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-via-brand-100 dark:o-via-brand-950 o-to-zinc-50 dark:o-to-zinc-950'

/**
 * Points per ring at low quality.
 *
 * Every point is a vertex: the cost grows linearly with their number, and it is
 * the only lever that counts here.
 */
const LOW_POINTS = 140

type Three = SceneContext['three']
type Group = InstanceType<Three['Group']>
type PointsObject = InstanceType<Three['Points']>
type PointsMaterial = InstanceType<Three['PointsMaterial']>

/** A live ring: what turns, and at what rate. */
interface Orbit {
  readonly ring: PointsObject
  readonly material: PointsMaterial
  /** Angular velocity, in radians per second, signed. */
  readonly rate: number
  /** Share of the way between the inner and the outer ring, for the hue. */
  readonly mix: number
}

/**
 * Orbit rings.
 *
 * @example
 * <div className="o-relative o-h-96 o-overflow-hidden">
 *   <OrbitRings className="o-absolute o-inset-0" />
 *   <div className="o-relative">…</div>
 * </div>
 */
export function OrbitRings({
  rings = 5,
  points = 320,
  rpm = 3,
  tilt = 0.6,
  colors = DEFAULT_TOKENS,
  poster = DEFAULT_POSTER,
  ...rest
}: OrbitRingsProps): ReactElement {
  const { theme } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)

  const orbits = useRef<Orbit[]>([])
  const cluster = useRef<Group | null>(null)
  const context = useRef<SceneContext | null>(null)

  const { ref, ready, refused } = useScene({
    name: 'orbit-rings',
    setup: (scene) => {
      context.current = scene
      const { three, renderer, camera, quality } = scene

      const [bg, inner, outer] = colors.map((token) => readTokenColour(token, host))
      const bgColour = new three.Color(bg?.[0] ?? 0, bg?.[1] ?? 0, bg?.[2] ?? 0)
      renderer.setClearColor(bgColour.convertSRGBToLinear(), 1)

      // The camera sits a little above the plane: seen head-on, tilted rings
      // would be nothing but flat ellipses.
      camera.position.set(0, 1.4, 5.4)
      camera.lookAt(0, 0, 0)

      const perRing = quality === 'low' ? Math.min(points, LOW_POINTS) : points
      const total = Math.max(rings, 1)

      const group = new three.Group()
      group.name = 'rings'
      cluster.current = group
      orbits.current = []

      for (let index = 0; index < total; index += 1) {
        const radius = 1.1 + index * 0.32
        const share = total === 1 ? 0 : index / (total - 1)

        // A circle in the XZ plane, thickened by a slight noise: a ring of
        // dust, not a stroke.
        const positions = new Float32Array(perRing * 3)
        for (let p = 0; p < perRing; p += 1) {
          const angle = (p / perRing) * Math.PI * 2
          const wobble = radius + (Math.random() - 0.5) * 0.05
          positions[p * 3] = Math.cos(angle) * wobble
          positions[p * 3 + 1] = (Math.random() - 0.5) * 0.03
          positions[p * 3 + 2] = Math.sin(angle) * wobble
        }
        const geometry = new three.BufferGeometry()
        geometry.setAttribute('position', new three.BufferAttribute(positions, 3))

        const material = new three.PointsMaterial({
          size: 0.022,
          transparent: true,
          opacity: 0.9,
          depthWrite: false,
        })
        const r = (inner?.[0] ?? 0) + ((outer?.[0] ?? 0) - (inner?.[0] ?? 0)) * share
        const g = (inner?.[1] ?? 0) + ((outer?.[1] ?? 0) - (inner?.[1] ?? 0)) * share
        const b = (inner?.[2] ?? 0) + ((outer?.[2] ?? 0) - (inner?.[2] ?? 0)) * share
        material.color.setRGB(r, g, b)

        const ring = new three.Points(geometry, material)

        // The pivot carries the tilt; the ring turns in its own plane.
        // Separating the two avoids composing rotations every frame.
        const pivot = new three.Group()
        pivot.rotation.x = tilt + index * 0.22 * (index % 2 === 0 ? 1 : -1)
        pivot.rotation.z = index * 0.45
        pivot.add(ring)
        group.add(pivot)

        // Alternating direction, and the outer rings slower: like real orbits.
        const direction = index % 2 === 0 ? 1 : -1
        const rate = ((rpm * Math.PI * 2) / 60) * direction * (1 - share * 0.5)
        orbits.current.push({ ring, material, rate, mix: share })
      }

      scene.scene.add(group)

      return () => {
        scene.scene.remove(group)
        orbits.current = []
        cluster.current = null
      }
    },

    frame: (_, { time, delta }) => {
      // Each ring turns in its plane; the whole precesses slowly.
      for (const orbit of orbits.current) {
        orbit.ring.rotation.y += orbit.rate * delta
      }
      const group = cluster.current
      if (group === null) return
      group.rotation.y += delta * 0.05
      group.rotation.x = Math.sin(time * 0.1) * 0.1
    },
  })

  // The theme has flipped: the tokens are re-read and the colours repainted in
  // place. The scene is not rebuilt.
  useEffect(() => {
    const scene = context.current
    if (scene === null || orbits.current.length === 0) return
    const [bg, inner, outer] = colors.map((token) => readTokenColour(token, host))
    if (inner !== undefined && outer !== undefined) {
      for (const orbit of orbits.current) {
        orbit.material.color.setRGB(
          inner[0] + (outer[0] - inner[0]) * orbit.mix,
          inner[1] + (outer[1] - inner[1]) * orbit.mix,
          inner[2] + (outer[2] - inner[2]) * orbit.mix,
        )
      }
    }
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
