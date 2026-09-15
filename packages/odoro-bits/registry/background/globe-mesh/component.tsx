/**
 * Globe: a ball of points inside a wireframe cage that shimmers.
 *
 * Three draws share one rotation:
 *
 * - **the points**, a Fibonacci sphere where each point carries nothing but a
 *   direction and a seed. Its radius, its size and its colour are derived in
 *   the shader; several thousand of them therefore cost one draw call, and
 *   nothing is written per frame;
 * - **the cage**, the edges of a subdivided icosahedron, travelled by a glint
 *   that runs along each strand or crosses the ball as a band;
 * - **the panels**, the faces of the same icosahedron, invisible until the
 *   pointer arrives.
 *
 * ## What the port changed, and why
 *
 * **The shader did not compile.** The cage fragment wrote
 * `float head = fract(vSeed + uTime * uShimmer)` with no semicolon. WebGL
 * raises nothing one can see: the cage was simply missing.
 *
 * **The settings were recomputed on every frame.** `settingsFor` was called
 * from the loop *and* from the pointer computation, allocating two objects per
 * frame for values that only change when a prop is edited. They are memoised
 * from now on.
 *
 * **The loop, the size observer and the camera were held by hand.** The engine
 * already carries them: `useScene` arbitrates the surface, follows the
 * resizing, suspends out of view and subscribes to the single loop. One more
 * `requestAnimationFrame` means two competing loops on the page.
 *
 * **The colours were hard-coded** — a white, a green, a lilac, two wave hues.
 * They come from the palette.
 *
 * ## The pointer is a direction, not a position
 *
 * Its ray is intersected with the ball, and the point it touches is pushed back
 * through the rotation of the group, into object space. That is what lets a lit
 * panel stay on the same face while the globe turns. Comparing screen
 * positions, on the contrary, leaves the spot motionless while the geometry
 * slides underneath.
 *
 * @module
 */

import {
  mergePresentation,
  readTokenColour,
  useMotionState,
  type Customisable,
} from '@odoro-cli/engine'
import { useScene, type SceneContext, type SceneFrame } from '@odoro-cli/engine/three'
import { useEffect, useMemo, useRef, useState, type ReactElement } from 'react'

import { usePoster } from '@registre/hooks/usePoster'

import {
  GLOBE_CAGE_FRAGMENT,
  GLOBE_CAGE_VERTEX,
  GLOBE_PANEL_FRAGMENT,
  GLOBE_PANEL_VERTEX,
  GLOBE_POINT_FRAGMENT,
  GLOBE_POINT_VERTEX,
  GLOBE_SOURCES,
} from './globe-mesh.shader.js'

/** Style of the glint that travels the cage. */
export type GlobeShimmer = 'edge' | 'sweep'

/** Properties specific to this component. */
export interface GlobeMeshOwnProps {
  /** Density of the cloud, from 1 to 20. @defaultValue 14 */
  density?: number
  /** Rotation speed, from 0 to 20. Zero stops only the drift of its own. @defaultValue 8 */
  spin?: number
  /** Direction of rotation. @defaultValue 'right' */
  spinDir?: 'left' | 'right'
  /** Subdivision of the cage, from 0 to 3. @defaultValue 1 */
  detail?: number
  /** Style of the glint. @defaultValue 'sweep' */
  shimmer?: GlobeShimmer
  /** Angle of the sweep, in degrees. @defaultValue 90 */
  sweepAngle?: number
  /** Reacts to the pointer. @defaultValue true */
  interactive?: boolean
  /** Tokens of the points, the cage, the glint and the two waves. */
  colors?: readonly [string, string, string, string, string]
  /** Fallback classes. */
  poster?: string
}

/** Every property. */
export type GlobeMeshProps = Customisable<GlobeMeshOwnProps>

/** Tokens used by default. */
const DEFAULT_TOKENS = [
  '--o-theme-fg',
  '--o-palette-emerald-400',
  '--o-palette-violet-300',
  '--o-palette-sky-400',
  '--o-palette-rose-400',
] as const

/** Default fallback. */
const DEFAULT_POSTER =
  'o-bg-gradient-to-br o-from-zinc-100 dark:o-from-zinc-900 o-to-zinc-50 dark:o-to-zinc-950'

/** Distance from the cage to the point cloud. */
const CAGE = 1.18

/** Sensitivity of the drag, in radians per pixel. */
const DRAG = 0.021

/** Bounds a value. */
function clamp(value: number, low: number, high: number): number {
  return Math.max(low, Math.min(high, Number.isFinite(value) ? value : low))
}

/**
 * Globe of points inside a wireframe cage.
 *
 * @example
 * <div className="o-relative o-h-96">
 *   <GlobeMesh className="o-absolute o-inset-0" />
 * </div>
 *
 * @example
 * // The glint runs along the edges rather than sweeping the ball.
 * <GlobeMesh shimmer="edge" detail={2} />
 */
export function GlobeMesh({
  density = 14,
  spin = 8,
  spinDir = 'right',
  detail = 1,
  shimmer = 'sweep',
  sweepAngle = 90,
  interactive = true,
  colors = DEFAULT_TOKENS,
  poster = DEFAULT_POSTER,
  ...rest
}: GlobeMeshProps): ReactElement {
  const { quality, reduced } = useMotionState()
  const [element, setElement] = useState<HTMLElement | null>(null)

  const tokenList = colors.join(' ')
  const [shades, setShades] = useState<readonly (readonly number[])[]>([])

  useEffect(() => {
    if (element === null) return
    setShades(tokenList.split(' ').map((token) => readTokenColour(token, element)))
  }, [element, tokenList, reduced, quality])

  // The settings depend on the props alone: recomputing them per frame, as the
  // original did, allocates two objects for values that never move.
  const settings = useMemo(() => {
    const level = clamp(density, 1, 20)
    return {
      points: Math.round(300 + level * level * 22),
      detail: Math.round(clamp(detail, 0, 3)),
      edgeMix: shimmer === 'sweep' ? 0 : 1,
      sweepMix: shimmer === 'sweep' ? 1 : 0,
      sweepAxis: clamp(sweepAngle, 0, 360) * (Math.PI / 180),
      spin: clamp(spin, 0, 20) * 0.055 * (spinDir === 'left' ? -1 : 1),
    }
  }, [density, detail, shimmer, sweepAngle, spin, spinDir])

  const shadesRef = useRef(shades)
  shadesRef.current = shades
  const settingsRef = useRef(settings)
  settingsRef.current = settings

  /** What the pointer aims at, and the trust it is granted. */
  const aim = useRef({ x: 0, y: 0, grip: 0, target: 0 })
  /** Accumulated rotation: the drift of its own, then the drag. */
  const turn = useRef({ angle: 0, dragX: 0, dragY: 0, velX: 0, velY: 0 })
  const dragging = useRef(false)
  const last = useRef({ x: 0, y: 0 })

  const { ref, ready, refused } = useScene<HTMLDivElement>({
    name: 'globe',
    setup: (context: SceneContext) => {
      const { scene, camera, three, quality: level } = context
      const tints = shadesRef.current
      if (tints.length < 5) return

      const s = settingsRef.current
      const colour = (index: number): InstanceType<typeof three.Color> => {
        const rgb = tints[index] ?? [1, 1, 1]
        return new three.Color(rgb[0] ?? 1, rgb[1] ?? 1, rgb[2] ?? 1)
      }

      camera.position.set(0, 0, 6.7)

      const group = new three.Group()
      group.name = 'globe'
      scene.add(group)

      // Three directions neither coplanar nor adjacent, each turning about an
      // axis of its own. Random starts gave a good result one time in three,
      // and clumps the other times.
      const sources = [
        new three.Vector3(-0.6, -0.45, 0.65).normalize(),
        new three.Vector3(0.72, 0.35, 0.6).normalize(),
        new three.Vector3(0.1, 0.9, -0.42).normalize(),
      ]
      const axes = [
        new three.Vector3(0.2, 1, 0.1).normalize(),
        new three.Vector3(-0.8, 0.4, 0.3).normalize(),
        new three.Vector3(0.3, -0.5, 0.9).normalize(),
      ]

      const waveA = colour(3)
      const waveB = colour(4)

      // A single shared set of uniforms: the points, the cage and the panels
      // then cannot fall a frame out of step with one another.
      const shared = {
        uTime: { value: 0 },
        uSpread: { value: 0.525 },
        uIntensity: { value: 0.825 },
        uWave: { value: 0.77 },
        uSource: { value: sources.map((v) => v.clone()) },
        uSourceColor: {
          value: [waveA.clone(), waveB.clone(), waveA.clone().lerp(waveB, 0.35)],
        },
        uHoverDir: { value: new three.Vector3(0, 0, 1) },
        uHover: { value: 0 },
        uHoverArc: { value: 0.745 },
      }
      const cageColours = {
        uNet: { value: colour(1) },
        uShimmerColor: { value: colour(2) },
        uShimmer: { value: 0.27 },
        uEdgeMix: { value: s.edgeMix },
        uSweepMix: { value: s.sweepMix },
        uSweepAxis: { value: s.sweepAxis },
        uSweepWidth: { value: 0.204 },
      }

      const count = level === 'low' ? Math.round(s.points * 0.4) : s.points
      const golden = Math.PI * (3 - Math.sqrt(5))
      const dirs = new Float32Array(count * 3)
      const seeds = new Float32Array(count)
      for (let index = 0; index < count; index += 1) {
        const y = 1 - (index / Math.max(1, count - 1)) * 2
        const radius = Math.sqrt(Math.max(0, 1 - y * y))
        const theta = golden * index
        dirs[index * 3] = Math.cos(theta) * radius
        dirs[index * 3 + 1] = y
        dirs[index * 3 + 2] = Math.sin(theta) * radius
        seeds[index] = Math.abs(Math.sin(index * 127.1 + 311.7) * 43758.5453) % 1
      }

      const cloud = new three.BufferGeometry()
      // `position` is required by three even though the shader rebuilds the
      // point from `aDir`: without it the draw range is zero.
      cloud.setAttribute('position', new three.BufferAttribute(dirs, 3))
      cloud.setAttribute('aDir', new three.BufferAttribute(dirs, 3))
      cloud.setAttribute('aSeed', new three.BufferAttribute(seeds, 1))
      cloud.boundingSphere = new three.Sphere(new three.Vector3(), 2)

      const pointMaterial = new three.ShaderMaterial({
        vertexShader: GLOBE_POINT_VERTEX,
        fragmentShader: GLOBE_POINT_FRAGMENT,
        uniforms: {
          ...shared,
          uRadius: { value: 1 },
          uDotSize: { value: 0.0144 },
          uWobble: { value: 0.033 },
          uFlicker: { value: 0.294 },
          uViewHeight: { value: 600 },
          uDot: { value: colour(0) },
        },
        transparent: true,
        blending: three.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
      })

      const points = new three.Points(cloud, pointMaterial)
      // The shader moves the points off the surface: the culling computation
      // of three cannot know where they really are.
      points.frustumCulled = false
      group.add(points)

      // The cage and its panels, drawn from the same icosahedron.
      const solid = new three.IcosahedronGeometry(CAGE, s.detail)
      const edges = new three.EdgesGeometry(solid)
      const edgePos = edges.attributes['position']
      if (edgePos !== undefined) {
        const total = edgePos.count
        const param = new Float32Array(total)
        const edgeSeed = new Float32Array(total)
        for (let index = 0; index < total; index += 2) {
          param[index] = 0
          param[index + 1] = 1
          const mx = (edgePos.getX(index) + edgePos.getX(index + 1)) * 0.5
          const my = (edgePos.getY(index) + edgePos.getY(index + 1)) * 0.5
          const mz = (edgePos.getZ(index) + edgePos.getZ(index + 1)) * 0.5
          const seed =
            Math.abs(Math.sin(mx * 127.1 + my * 311.7 + mz * 74.7) * 43758.5453) % 1
          edgeSeed[index] = seed
          edgeSeed[index + 1] = seed
        }
        edges.setAttribute('aEdge', new three.BufferAttribute(param, 1))
        edges.setAttribute('aSeed', new three.BufferAttribute(edgeSeed, 1))
      }

      // The icosahedron comes out unindexed: the positions already come in
      // triplets, and the centre of each face is three vertices apart.
      const facePos = solid.attributes['position']
      if (facePos !== undefined) {
        const total = facePos.count
        const centre = new Float32Array(total * 3)
        const faceSeed = new Float32Array(total)
        for (let index = 0; index < total; index += 3) {
          let cx = 0
          let cy = 0
          let cz = 0
          for (let k = 0; k < 3; k += 1) {
            cx += facePos.getX(index + k)
            cy += facePos.getY(index + k)
            cz += facePos.getZ(index + k)
          }
          cx /= 3
          cy /= 3
          cz /= 3
          const seed =
            Math.abs(Math.sin(cx * 269.5 + cy * 183.3 + cz * 246.1) * 43758.5453) % 1
          for (let k = 0; k < 3; k += 1) {
            centre[(index + k) * 3] = cx
            centre[(index + k) * 3 + 1] = cy
            centre[(index + k) * 3 + 2] = cz
            faceSeed[index + k] = seed
          }
        }
        solid.setAttribute('aFace', new three.BufferAttribute(centre, 3))
        solid.setAttribute('aSeed', new three.BufferAttribute(faceSeed, 1))
      }

      const cageMaterial = new three.ShaderMaterial({
        vertexShader: GLOBE_CAGE_VERTEX,
        fragmentShader: GLOBE_CAGE_FRAGMENT,
        uniforms: {
          ...shared,
          ...cageColours,
          uNetGlow: { value: 0.825 },
          uHoverGlow: { value: 0.99 },
        },
        transparent: true,
        blending: three.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
      })

      const panelMaterial = new three.ShaderMaterial({
        vertexShader: GLOBE_PANEL_VERTEX,
        fragmentShader: GLOBE_PANEL_FRAGMENT,
        uniforms: { ...shared, ...cageColours, uFill: { value: 0.063 } },
        transparent: true,
        blending: three.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
        // Both sides: a panel at the back must show through the ball rather
        // than be a hole in the fill.
        side: three.DoubleSide,
      })

      const cage = new three.LineSegments(edges, cageMaterial)
      const panels = new three.Mesh(solid, panelMaterial)
      cage.frustumCulled = false
      panels.frustumCulled = false
      group.add(panels)
      group.add(cage)

      // The pointer: its ray cuts the ball, and the point it touches comes
      // back into the space of the group.
      const hit = new three.Vector3()
      const readAim = (): void => {
        const { x, y } = aim.current
        const half = 3.2
        let dx = x * half
        let dy = y * half
        let dz = -6.7
        const length = Math.hypot(dx, dy, dz) || 1
        dx /= length
        dy /= length
        dz /= length

        const b = 6.7 * dz
        const c = 6.7 * 6.7 - CAGE * CAGE
        const disc = b * b - c
        // A miss falls back on the closest approach point: the spot then
        // slides along the rim instead of staying stuck.
        const t = disc > 0 ? -b - Math.sqrt(disc) : -b

        hit.set(dx * t, dy * t, 6.7 + dz * t)
        group.updateMatrixWorld()
        group.worldToLocal(hit)
        if (hit.lengthSq() > 1e-8) {
          const target = shared.uHoverDir.value
          target.copy(hit.normalize())
        }
      }

      // The engine loop drives everything: nothing is opened here.
      const advance = (frame: SceneFrame): void => {
        const delta = Math.min(frame.delta, 0.05)
        shared.uTime.value = frame.time

        for (let index = 0; index < GLOBE_SOURCES; index += 1) {
          const source = sources[index]
          const axis = axes[index]
          const live = (shared.uSource.value as InstanceType<typeof three.Vector3>[])[
            index
          ]
          if (source === undefined || axis === undefined || live === undefined) continue
          source.applyAxisAngle(axis, delta * 0.77 * (0.35 + index * 0.12)).normalize()
          live.copy(source)
        }

        const state = turn.current
        if (!dragging.current) {
          const decay = Math.exp(-delta * 3)
          state.dragY += state.velY
          state.dragX += state.velX
          state.velX *= decay
          state.velY *= decay
          state.angle += settingsRef.current.spin * delta
        }

        group.rotation.y = state.angle + state.dragY
        // Tilted beyond that, the ball loses its three-quarter view and the
        // cage flattens into concentric rings.
        group.rotation.x = clamp(state.dragX * 0.5, -1, 1)

        const pointer = aim.current
        pointer.grip += (pointer.target - pointer.grip) * (1 - Math.exp(-delta * 5))
        shared.uHover.value = pointer.grip
        if (pointer.grip > 0.001) readAim()

        pointMaterial.uniforms['uViewHeight'] = {
          value: context.renderer.domElement.height,
        }
      }

      // The advance function is stowed on the group: `frame` finds it again
      // without an extra ref having to carry it.
      group.userData['advance'] = advance

      return () => {
        scene.remove(group)
        cloud.dispose()
        edges.dispose()
        solid.dispose()
        pointMaterial.dispose()
        cageMaterial.dispose()
        panelMaterial.dispose()
      }
    },
    frame: ({ scene }, frame) => {
      const group = scene.getObjectByName('globe')
      const advance = group?.userData['advance']
      if (typeof advance === 'function') advance(frame)
    },
  })

  // The pointer: read on the host, never on the whole window.
  useEffect(() => {
    if (element === null || !interactive || reduced) return

    const move = (event: PointerEvent): void => {
      const box = element.getBoundingClientRect()
      if (box.width > 0 && box.height > 0) {
        aim.current.x = ((event.clientX - box.left) / box.width) * 2 - 1
        aim.current.y = -(((event.clientY - box.top) / box.height) * 2 - 1)
      }
      if (!dragging.current) return
      const dx = event.clientX - last.current.x
      const dy = event.clientY - last.current.y
      last.current = { x: event.clientX, y: event.clientY }
      turn.current.dragY += dx * DRAG
      turn.current.dragX += dy * DRAG
      // Kept so that the globe carries on turning after the release.
      turn.current.velY = dx * DRAG
      turn.current.velX = dy * DRAG
    }

    const down = (event: PointerEvent): void => {
      dragging.current = true
      last.current = { x: event.clientX, y: event.clientY }
      turn.current.velX = 0
      turn.current.velY = 0
    }
    const up = (): void => {
      dragging.current = false
    }
    // `enter` and `leave`, not `over` and `out`: the latter also fire when the
    // pointer moves from one child to another.
    const enter = (): void => {
      aim.current.target = 1
    }
    const leave = (): void => {
      aim.current.target = 0
      up()
    }

    element.addEventListener('pointerdown', down)
    element.addEventListener('pointerenter', enter)
    element.addEventListener('pointerleave', leave)
    element.addEventListener('pointercancel', leave)
    window.addEventListener('pointermove', move, { passive: true })
    window.addEventListener('pointerup', up)

    return () => {
      element.removeEventListener('pointerdown', down)
      element.removeEventListener('pointerenter', enter)
      element.removeEventListener('pointerleave', leave)
      element.removeEventListener('pointercancel', leave)
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerup', up)
    }
  }, [element, interactive, reduced])

  const waiting = usePoster({ ready, refused })

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
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
      style={{ touchAction: 'none', ...style }}
      role="img"
      aria-label="Globe of points in a wireframe cage"
    >
      {waiting.visible ? (
        <div style={waiting.style} className={`o-absolute o-inset-0 ${poster}`} />
      ) : null}
    </div>
  )
}
