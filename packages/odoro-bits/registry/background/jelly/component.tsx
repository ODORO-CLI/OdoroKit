/**
 * Jelly: a translucent mass that wobbles where it is touched.
 *
 * ## What this background reacts to
 *
 * To a click — or a touch — anywhere in the frame. The press point is cast
 * as a ray from the camera: if it hits the jelly, the impact is there;
 * otherwise the point of the jelly nearest the ray takes the blow, so that a
 * click beside it makes the edge wobble. A circular buffer of four impacts
 * lives in the uniforms; the fifth click replaces the oldest.
 *
 * ## The time of the impacts
 *
 * The time written into the buffer is the engine clock's, recorded by a
 * subscription at input priority: it is the same time as the scene loop's,
 * without which the age of the impacts would be wrong and the jelly would
 * wobble before or after the click.
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
  CLOCK_PRIORITY,
  NOISE_FUNCTIONS_3D,
  clock,
  mergePresentation,
  readTokenColour,
  useMotionState,
  useOnReady,
  type Customisable,
  type QualityLevel,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro-cli/engine'
import { useScene, type SceneContext } from '@odoro-cli/engine/three'
import { useEffect, useRef, useState, type ReactElement } from 'react'

import { usePoster } from '@registre/hooks/usePoster'

import { JELLY_FRAGMENT, JELLY_VERTEX } from './jelly.shader.js'

/** What the escape hatch receives. */
export interface JellyControls {
  /** Scene context: objects, camera, renderer, module. */
  readonly scene: SceneContext
  /** Live uniforms: changing them changes the output on the next frame. */
  readonly uniforms: Record<string, { value: unknown }>
}

/** Properties specific to this component. */
export interface JellyOwnProps {
  /** Amplitude of the wobble, in radii. @defaultValue 0.22 */
  wobble?: number
  /** Stiffness: the frequency of the waves. @defaultValue 9 */
  stiffness?: number
  /** Damping: the speed at which a blow dies out. @defaultValue 1.6 */
  damping?: number
  /** Rotation speed, in turns per minute. @defaultValue 1 */
  rpm?: number
  /** Tokens: the background, the body, the highlights. */
  colors?: readonly [string, string, string]
  /** Fallback classes. */
  poster?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<JellyControls>
}

/** Every property. */
export type JellyProps = Customisable<JellyOwnProps>

/** Tokens used by default. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-lime-500',
  '--o-palette-lime-200',
] as const

/** Default fallback: a blurred blot, in the same tones. */
const DEFAULT_POSTER =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-via-lime-300 dark:o-via-lime-900 o-to-zinc-50 dark:o-to-zinc-950 o-blur-2xl o-scale-110'

/** Number of impacts alive at once. Must follow the shader's constant. */
const SLOTS = 4

/** Jelly radius, in scene units. */
const RADIUS = 1.15

/** Icosahedron subdivision by quality level. */
const DETAIL: Readonly<Record<QualityLevel, number>> = {
  low: 20,
  medium: 36,
  high: 52,
}

/** What the click manipulates, built once per mount. */
interface World {
  readonly mesh: InstanceType<SceneContext['three']['Mesh']>
  readonly raycaster: InstanceType<SceneContext['three']['Raycaster']>
  readonly sphere: InstanceType<SceneContext['three']['Sphere']>
  readonly ndc: InstanceType<SceneContext['three']['Vector2']>
  readonly point: InstanceType<SceneContext['three']['Vector3']>
  readonly impacts: InstanceType<SceneContext['three']['Vector4']>[]
}

/**
 * Jelly.
 *
 * @example
 * <div className="o-relative o-h-96 o-overflow-hidden o-rounded-xl">
 *   <Jelly className="o-absolute o-inset-0" />
 *   <div className="o-relative o-z-10">…</div>
 * </div>
 */
export function Jelly({
  wobble = 0.22,
  stiffness = 9,
  damping = 1.6,
  rpm = 1,
  colors = DEFAULT_TOKENS,
  poster = DEFAULT_POSTER,
  onReady,
  ...rest
}: JellyProps): ReactElement {
  const { theme } = useMotionState()
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  const uniforms = useRef<Record<string, { value: unknown }>>({})
  const context = useRef<SceneContext | null>(null)
  const world = useRef<World | null>(null)

  // The engine clock's time — the same as the loop's. It is what dates the
  // impacts; performance.now() would give another origin.
  const lastTime = useRef(0)

  useEffect(() => {
    const subscription = clock.subscribe(
      ({ time }) => {
        lastTime.current = time
      },
      { priority: CLOCK_PRIORITY.input, name: 'jelly : clock' },
    )
    return () => subscription.unsubscribe()
  }, [])

  // The settings are read by ref inside the loop: a slider change in the
  // workshop takes effect on the next frame without rebuilding the scene.
  const settings = useRef({ wobble, stiffness, damping, rpm })
  settings.current = { wobble, stiffness, damping, rpm }

  const { ref, ready, refused } = useScene<HTMLDivElement>({
    name: 'jelly',
    setup: (scene) => {
      context.current = scene
      const { three, camera, renderer, quality } = scene

      const paint = (value: ShaderColour): InstanceType<typeof three.Color> =>
        new three.Color(value[0], value[1], value[2])
      const [background, body, highlight] = colors.map((token) =>
        readTokenColour(token, host),
      )

      // The background is the theme's colour. The token is in sRGB and the
      // engine encodes its clear colour from linear to sRGB: without the inverse
      // conversion, the background comes out a shade lighter than the page.
      renderer.setClearColor(paint(background ?? [0, 0, 0]).convertSRGBToLinear(), 1)

      // A start at -1000 gives an enormous age, hence an impact already out.
      const impacts = Array.from(
        { length: SLOTS },
        () => new three.Vector4(0, 0, 1, -1000),
      )

      uniforms.current = {
        uTime: { value: 0 },
        uImpacts: { value: impacts },
        uWobble: { value: wobble },
        uStiffness: { value: stiffness },
        uDamping: { value: damping },
        uBody: { value: paint(body ?? [0, 0, 0]) },
        uHighlight: { value: paint(highlight ?? [0, 0, 0]) },
      }

      const geometry = new three.IcosahedronGeometry(1, DETAIL[quality])
      const material = new three.ShaderMaterial({
        vertexShader: `${NOISE_FUNCTIONS_3D}\n${JELLY_VERTEX}`,
        fragmentShader: JELLY_FRAGMENT,
        uniforms: uniforms.current,
        transparent: true,
      })
      const mesh = new three.Mesh(geometry, material)
      mesh.scale.setScalar(RADIUS)
      mesh.name = 'jelly'
      scene.scene.add(mesh)

      camera.position.set(0, 0.2, 3.8)
      camera.lookAt(0, 0, 0)

      world.current = {
        mesh,
        raycaster: new three.Raycaster(),
        sphere: new three.Sphere(new three.Vector3(0, 0, 0), RADIUS),
        ndc: new three.Vector2(),
        point: new three.Vector3(),
        impacts,
      }

      return () => {
        scene.scene.remove(mesh)
        geometry.dispose()
        material.dispose()
        world.current = null
      }
    },

    frame: (_scene, { time, delta }) => {
      const live = world.current
      if (live === null) return
      const {
        wobble: amplitude,
        stiffness: frequency,
        damping: decay,
        rpm: turns,
      } = settings.current
      const current = uniforms.current

      // The rotation is expressed as a function of elapsed time: the same
      // setting gives the same speed at sixty frames as at a hundred and twenty.
      live.mesh.rotation.y += (delta * turns * Math.PI * 2) / 60

      const set = (key: string, value: number): void => {
        const uniform = current[key]
        if (uniform !== undefined) uniform.value = value
      }
      set('uTime', time)
      set('uWobble', amplitude)
      set('uStiffness', frequency)
      set('uDamping', decay)
    },
  })

  // The click: a ray from the camera, a point on the jelly, an impact in
  // the buffer.
  useEffect(() => {
    if (host === null) return

    const onDown = (event: PointerEvent): void => {
      const live = world.current
      const scene = context.current
      if (live === null || scene === null) return

      const bounds = host.getBoundingClientRect()
      live.ndc.set(
        ((event.clientX - bounds.left) / Math.max(bounds.width, 1)) * 2 - 1,
        -((event.clientY - bounds.top) / Math.max(bounds.height, 1)) * 2 + 1,
      )
      live.raycaster.setFromCamera(live.ndc, scene.camera)

      // Hit, or not: in the second case, the point nearest the ray takes
      // the blow, and the edge wobbles.
      const hit = live.raycaster.ray.intersectSphere(live.sphere, live.point)
      if (hit === null)
        live.raycaster.ray.closestPointToPoint(live.sphere.center, live.point)

      // From the world to the jelly, which turns: the impact is fixed to
      // its surface.
      live.mesh.worldToLocal(live.point).normalize()

      // Circular buffer: everything shifts by one, the new impact at the
      // head.
      for (let index = SLOTS - 1; index > 0; index -= 1) {
        const previous = live.impacts[index - 1]
        const slot = live.impacts[index]
        if (previous !== undefined && slot !== undefined) slot.copy(previous)
      }
      live.impacts[0]?.set(live.point.x, live.point.y, live.point.z, lastTime.current)
    }

    host.addEventListener('pointerdown', onDown)
    return () => host.removeEventListener('pointerdown', onDown)
  }, [host])

  // The theme has flipped: the tokens are re-read and the colours updated in
  // place. The scene is not rebuilt — only its colours change.
  useEffect(() => {
    const scene = context.current
    const live = uniforms.current
    if (scene === null || live['uBody'] === undefined) return
    const [background, body, highlight] = colors.map((token) =>
      readTokenColour(token, host),
    )
    const paint = (key: string, value: ShaderColour | undefined): void => {
      const uniform = live[key]
      if (uniform === undefined || value === undefined) return
      ;(uniform.value as { setRGB: (r: number, g: number, b: number) => unknown }).setRGB(
        value[0],
        value[1],
        value[2],
      )
    }
    paint('uBody', body)
    paint('uHighlight', highlight)
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
