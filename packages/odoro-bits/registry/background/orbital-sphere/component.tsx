/**
 * Sphere of particles, girded with rings and studded with bright nodes.
 *
 * ## This file is not a port
 *
 * The implementation it takes after delegated everything to a
 * `createOrbitalSphereRenderer` that did not come with the component. The scene
 * is therefore written here, from its description: a sphere of points, three
 * tilted rings, a few brighter nodes.
 *
 * ## What it does not do, unlike the original
 *
 * It opens neither `requestAnimationFrame`, nor `ResizeObserver`, nor
 * `IntersectionObserver`. All three already live in the engine: `useScene`
 * arbitrates the surface, follows the resizing, suspends the render off screen
 * and subscribes to the single loop. Reopening them here would give two
 * competing loops on one page, and the irregular jitter the single loop exists
 * to remove.
 *
 * The original also applied its hue through `filter: hue-rotate()` on the
 * canvas. That is a fullscreen filter on every frame, for a result the
 * materials' colours give for free — and which, unlike the filter, follows the
 * palette.
 *
 * ## The distribution of the points is not random
 *
 * Drawing a latitude and a longitude at random piles the points up at the
 * poles: the parallels are shorter there, but receive just as many draws. The
 * Fibonacci spiral, on the contrary, spreads the points at equal distance,
 * which is what one wants from a sphere of particles — and what is immediately
 * visible if one goes without it.
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
export interface OrbitalSphereOwnProps {
  /** Number of points on the sphere. @defaultValue 2400 */
  points?: number
  /** Number of rings. @defaultValue 3 */
  rings?: number
  /** Number of bright nodes. @defaultValue 12 */
  nodes?: number
  /** Rotation speed, in turns per minute. @defaultValue 2 */
  rpm?: number
  /** Tokens of the sphere, of the rings and of the nodes. */
  colors?: readonly [string, string, string]
  /** Fallback classes. */
  poster?: string
}

/** All props. */
export type OrbitalSphereProps = Customisable<OrbitalSphereOwnProps>

/** Tokens used by default. */
const DEFAULT_TOKENS = [
  '--o-palette-violet-500',
  '--o-palette-violet-300',
  '--o-palette-fuchsia-400',
] as const

/** Default fallback: a frozen halo, in the same tones. */
const DEFAULT_POSTER =
  'o-bg-gradient-to-br o-from-violet-950 o-via-zinc-50 dark:o-via-zinc-950 o-to-fuchsia-950'

/**
 * Number of points at low quality.
 *
 * Every point is a vertex, and the cost of a point cloud grows linearly with
 * their number. It is the only lever that counts here — the rings and the nodes
 * are negligible beside it.
 */
const LOW_POINTS = 900

/** The golden angle, which gives the spiral its step. */
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))

/**
 * Rotating sphere of particles.
 *
 * @example
 * <div className="o-relative o-h-96 o-overflow-hidden o-rounded-xl">
 *   <OrbitalSphere className="o-absolute o-inset-0" />
 *   <div className="o-relative o-z-10">…</div>
 * </div>
 *
 * @example
 * // The colours follow the palette: three tokens, not three values.
 * <OrbitalSphere colors={[
 *   '--o-palette-sky-500',
 *   '--o-palette-sky-300',
 *   '--o-palette-cyan-400',
 * ]} />
 */
export function OrbitalSphere({
  points = 2400,
  rings = 3,
  nodes = 12,
  rpm = 2,
  colors = DEFAULT_TOKENS,
  poster = DEFAULT_POSTER,
  ...rest
}: OrbitalSphereProps): ReactElement {
  const { quality, reduced } = useMotionState()
  const [element, setElement] = useState<HTMLElement | null>(null)

  // The tokens enter by their text: a literal written in the JSX is a fresh
  // array on every render, and a read that sets a state would loop.
  const tokenList = colors.join(' ')
  const [shades, setShades] = useState<readonly (readonly number[])[]>([])

  useEffect(() => {
    if (element === null) return
    setShades(tokenList.split(' ').map((token) => readTokenColour(token, element)))
  }, [element, tokenList, reduced, quality])

  // The scene reads the colours by ref: it is built once, and a change of theme
  // updates the materials without rebuilding it.
  const shadesRef = useRef(shades)
  shadesRef.current = shades

  const { ref, ready, refused } = useScene<HTMLDivElement>({
    name: 'orbital-sphere',
    setup: (context: SceneContext) => {
      const { scene, camera, three, quality: level } = context
      const [sphereTint, ringTint, nodeTint] = shadesRef.current
      if (sphereTint === undefined || ringTint === undefined || nodeTint === undefined) {
        return
      }

      camera.position.set(0, 0, 3.4)

      const group = new three.Group()
      scene.add(group)

      const count = level === 'low' ? LOW_POINTS : points

      // The sphere of points, spread by the Fibonacci spiral.
      const positions = new Float32Array(count * 3)
      for (let index = 0; index < count; index += 1) {
        // The height sweeps the interval at a constant step; the angle advances
        // by the golden angle. It is that pairing that equalises the distances.
        const y = 1 - (index / Math.max(count - 1, 1)) * 2
        const ray = Math.sqrt(Math.max(0, 1 - y * y))
        const theta = GOLDEN_ANGLE * index
        positions[index * 3] = Math.cos(theta) * ray
        positions[index * 3 + 1] = y
        positions[index * 3 + 2] = Math.sin(theta) * ray
      }

      const cloud = new three.BufferGeometry()
      cloud.setAttribute('position', new three.BufferAttribute(positions, 3))
      const cloudMaterial = new three.PointsMaterial({
        size: 0.016,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
        blending: three.AdditiveBlending,
      })
      cloudMaterial.color.setRGB(
        sphereTint[0] ?? 0,
        sphereTint[1] ?? 0,
        sphereTint[2] ?? 0,
      )
      group.add(new three.Points(cloud, cloudMaterial))

      // The rings, tilted at regular steps around the axis.
      const ringMaterial = new three.MeshBasicMaterial({
        transparent: true,
        opacity: 0.35,
        side: three.DoubleSide,
        blending: three.AdditiveBlending,
        depthWrite: false,
      })
      ringMaterial.color.setRGB(ringTint[0] ?? 0, ringTint[1] ?? 0, ringTint[2] ?? 0)

      for (let index = 0; index < rings; index += 1) {
        const geometry = new three.TorusGeometry(1.25 + index * 0.14, 0.004, 6, 180)
        const torus = new three.Mesh(geometry, ringMaterial)
        torus.rotation.x = Math.PI / 2 + (index / Math.max(rings, 1)) * 0.9
        torus.rotation.y = (index / Math.max(rings, 1)) * Math.PI
        group.add(torus)
      }

      // The nodes: small solid spheres, laid on the same spiral.
      const nodeGeometry = new three.SphereGeometry(0.028, 12, 12)
      const nodeMaterial = new three.MeshBasicMaterial({
        transparent: true,
        opacity: 0.95,
        blending: three.AdditiveBlending,
        depthWrite: false,
      })
      nodeMaterial.color.setRGB(nodeTint[0] ?? 0, nodeTint[1] ?? 0, nodeTint[2] ?? 0)

      for (let index = 0; index < nodes; index += 1) {
        const y = 1 - (index / Math.max(nodes - 1, 1)) * 2
        const ray = Math.sqrt(Math.max(0, 1 - y * y))
        const theta = GOLDEN_ANGLE * index * 7
        const node = new three.Mesh(nodeGeometry, nodeMaterial)
        node.position.set(Math.cos(theta) * ray, y, Math.sin(theta) * ray)
        node.scale.setScalar(1.15)
        group.add(node)
      }

      // What turns is the group, not the camera: a camera that orbited would
      // also turn the frame of the nodes if one came to anchor them.
      const spin = group

      // The setup returns its cleanup function. The geometries and the
      // materials are freed by walking the scene; whatever is created here and
      // does not appear in it is not, and there is none.
      return () => {
        scene.remove(group)
        spin.clear()
      }
    },
    frame: ({ scene }, { delta }) => {
      const group = scene.children.find((child) => child.type === 'Group')
      if (group === undefined) return
      // The rotation is expressed as a function of the elapsed time: the same
      // setting gives the same apparent speed at sixty as at a hundred and
      // twenty frames.
      group.rotation.y += (delta * rpm * Math.PI * 2) / 60
      group.rotation.x = Math.sin(group.rotation.y * 0.3) * 0.12
    },
  })

  const pending = usePoster({ ready, refused })

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden o-bg-zinc-50 dark:o-bg-zinc-950' },
    rest,
  )

  return (
    <div
      {...rest}
      ref={(node) => {
        setElement(node)
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
