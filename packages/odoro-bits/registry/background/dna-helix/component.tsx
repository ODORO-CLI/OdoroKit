/**
 * Double helix: two strands of opposed points, joined by rungs, turning
 * about their axis.
 *
 * ## Why points, and two clouds rather than one
 *
 * A solid tube would hide the strand behind and the helix would read as a
 * ribbon. Points let the eye see through, which is the only way to grasp
 * that there are two strands and not one. And the two clouds are kept
 * apart so that each carries its own colour: a single cloud with per-vertex
 * colours would cost one more attribute for the same picture.
 *
 * ## The pitch of the helix
 *
 * The radius is fixed; what changes with the number of turns is the pitch —
 * the height gained per turn. Few turns give a stretched spring, many a
 * tight twist. The rungs join the two strands at the same height, one point
 * in `n`: joining them all would make a wall.
 *
 * ## What this component does not do
 *
 * It opens neither an animation loop nor an observer: `useScene` carries
 * them. The geometry is built once — the rotation is the group's, not a
 * rewriting of the vertices.
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
export interface DnaHelixOwnProps {
  /** Number of turns of the helix over its whole height. @defaultValue 4 */
  turns?: number
  /** Points per strand. Degraded at low quality. @defaultValue 220 */
  points?: number
  /** Rotation speed, in turns per minute. @defaultValue 3 */
  rpm?: number
  /** One rung every so many points. Zero removes them. @defaultValue 6 */
  rungs?: number
  /** Tokens: the background, the first strand, the second strand. */
  colors?: readonly [string, string, string]
  /** Fallback classes. */
  poster?: string
}

/** Every property. */
export type DnaHelixProps = Customisable<DnaHelixOwnProps>

/** Tokens used by default. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-sky-400',
  '--o-palette-rose-400',
] as const

/** Default fallback: a frozen hue, in the same tones. */
const DEFAULT_POSTER =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-zinc-950 o-via-sky-100 dark:o-via-sky-950 o-to-rose-100 dark:o-to-rose-950'

/** Points per strand at low quality. */
const LOW_POINTS = 90

/** Radius of the helix, in scene units. */
const RADIUS = 0.95

/** Height of the helix, in scene units. */
const HEIGHT = 3.0

type Three = SceneContext['three']
type Group = InstanceType<Three['Group']>
type PointsMaterial = InstanceType<Three['PointsMaterial']>
type LineMaterial = InstanceType<Three['LineBasicMaterial']>

/** What the scene keeps between construction and frames. */
interface Helix {
  readonly group: Group
  readonly first: PointsMaterial
  readonly second: PointsMaterial
  readonly bars: LineMaterial
  /** Angular velocity, in radians per second. */
  readonly rate: number
}

/** Average of two hues, used for the rungs. */
function blend(
  one: ShaderColour | undefined,
  other: ShaderColour | undefined,
): ShaderColour {
  return [
    ((one?.[0] ?? 0) + (other?.[0] ?? 0)) / 2,
    ((one?.[1] ?? 0) + (other?.[1] ?? 0)) / 2,
    ((one?.[2] ?? 0) + (other?.[2] ?? 0)) / 2,
  ]
}

/**
 * Double helix.
 *
 * @example
 * <div className="o-relative o-h-96 o-overflow-hidden o-rounded-xl">
 *   <DnaHelix className="o-absolute o-inset-0" />
 *   <div className="o-relative o-z-10">…</div>
 * </div>
 */
export function DnaHelix({
  turns = 4,
  points = 220,
  rpm = 3,
  rungs = 6,
  colors = DEFAULT_TOKENS,
  poster = DEFAULT_POSTER,
  ...rest
}: DnaHelixProps): ReactElement {
  const { theme } = useMotionState()
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  const helix = useRef<Helix | null>(null)
  const context = useRef<SceneContext | null>(null)

  const { ref, ready, refused } = useScene<HTMLDivElement>({
    name: 'double-helix',
    setup: (scene: SceneContext) => {
      context.current = scene
      const { three, renderer, camera, quality } = scene

      const [bg, one, other] = colors.map((token) => readTokenColour(token, ref.current))

      // The scene's background is the page's background. The token is in sRGB and
      // the engine encodes its clear colour from linear to sRGB:
      // without the inverse conversion, the background comes out a shade lighter.
      renderer.setClearColor(
        new three.Color(bg?.[0] ?? 0, bg?.[1] ?? 0, bg?.[2] ?? 0).convertSRGBToLinear(),
        1,
      )

      camera.position.set(0, 0, 4.2)
      camera.lookAt(0, 0, 0)

      const count =
        quality === 'low' ? Math.min(points, LOW_POINTS) : Math.max(points, 12)
      const spin = Math.max(turns, 0.25) * Math.PI * 2

      const firstPositions = new Float32Array(count * 3)
      const secondPositions = new Float32Array(count * 3)
      const barPositions: number[] = []
      const gap = Math.max(Math.round(rungs), 0)

      for (let index = 0; index < count; index += 1) {
        const share = index / Math.max(count - 1, 1)
        const angle = share * spin
        const y = (share - 0.5) * HEIGHT

        const ax = Math.cos(angle) * RADIUS
        const az = Math.sin(angle) * RADIUS
        firstPositions[index * 3] = ax
        firstPositions[index * 3 + 1] = y
        firstPositions[index * 3 + 2] = az

        // The second strand is the first turned by half a turn: that is what
        // makes a double helix rather than two independent helices.
        secondPositions[index * 3] = -ax
        secondPositions[index * 3 + 1] = y
        secondPositions[index * 3 + 2] = -az

        if (gap > 0 && index % gap === 0) {
          barPositions.push(ax, y, az, -ax, y, -az)
        }
      }

      const makeCloud = (
        data: Float32Array,
        tint: ShaderColour | undefined,
      ): { material: PointsMaterial; cloud: InstanceType<Three['Points']> } => {
        const geometry = new three.BufferGeometry()
        geometry.setAttribute('position', new three.BufferAttribute(data, 3))
        const material = new three.PointsMaterial({
          size: 0.09,
          transparent: true,
          opacity: 0.95,
          depthWrite: false,
        })
        material.color.setRGB(tint?.[0] ?? 0, tint?.[1] ?? 0, tint?.[2] ?? 0)
        return { material, cloud: new three.Points(geometry, material) }
      }

      const first = makeCloud(firstPositions, one)
      const second = makeCloud(secondPositions, other)

      const barGeometry = new three.BufferGeometry()
      barGeometry.setAttribute(
        'position',
        new three.BufferAttribute(new Float32Array(barPositions), 3),
      )
      const bars = new three.LineBasicMaterial({ transparent: true, opacity: 0.35 })
      const mixed = blend(one, other)
      bars.color.setRGB(mixed[0], mixed[1], mixed[2])

      const group = new three.Group()
      group.name = 'helix'
      group.add(first.cloud)
      group.add(second.cloud)
      group.add(new three.LineSegments(barGeometry, bars))
      // The axis is slightly tilted: perfectly vertical, the rotation would
      // read only on the rungs.
      group.rotation.z = 0.18
      scene.scene.add(group)

      helix.current = {
        group,
        first: first.material,
        second: second.material,
        bars,
        rate: (rpm * Math.PI * 2) / 60,
      }

      return () => {
        scene.scene.remove(group)
        helix.current = null
      }
    },

    frame: (_, { time, delta }) => {
      const live = helix.current
      if (live === null) return
      // The rotation is expressed as a function of elapsed time: the same
      // setting gives the same apparent speed at any frame rate.
      live.group.rotation.y += live.rate * delta
      live.group.rotation.z = 0.18 + Math.sin(time * 0.25) * 0.06
    },
  })

  // The theme has flipped: the tokens are re-read and the materials repainted in
  // place. The scene is not rebuilt.
  useEffect(() => {
    const scene = context.current
    const live = helix.current
    if (scene === null || live === null || host === null) return
    const [bg, one, other] = colors.map((token) => readTokenColour(token, host))
    live.first.color.setRGB(one?.[0] ?? 0, one?.[1] ?? 0, one?.[2] ?? 0)
    live.second.color.setRGB(other?.[0] ?? 0, other?.[1] ?? 0, other?.[2] ?? 0)
    const mixed = blend(one, other)
    live.bars.color.setRGB(mixed[0], mixed[1], mixed[2])
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
