/**
 * Water surface: a sheet of Gerstner waves seen at a grazing angle, which
 * reflects the sky and makes the sun sparkle.
 *
 * ## Why a scene, and not a fullscreen shader
 *
 * A grazing reflection is a matter of the angle between the surface and the
 * eye: it needs a real surface, a real camera, and a normal that changes from
 * one point to the next. A fullscreen fragment knows neither of those.
 *
 * What sets this entry apart from `hero/tide`: the tide is a swell of noise,
 * lit like a relief map and tinted by height; here the waves are waves —
 * sinusoids that pinch at the crests — and the colour comes from the Fresnel
 * term, head on the water, edge on the sky.
 *
 * ## What the pointer does
 *
 * The camera slides sideways following the cursor, with damping: the
 * reflection moves across the water as it does when you tilt your head. The
 * `parallax` setting doses that slide; at zero, the camera does not move.
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
  type QualityLevel,
  type ReadyCallback,
  type ShaderColour,
} from '@odoro-cli/engine'
import { useScene, type SceneContext } from '@odoro-cli/engine/three'
import { useEffect, useRef, useState, type ReactElement } from 'react'

import { usePointerDamped } from '@registre/hooks/usePointerDamped'
import { usePoster } from '@registre/hooks/usePoster'

import { WATER_SURFACE_FRAGMENT, WATER_SURFACE_VERTEX } from './water-surface.shader.js'

/** What the escape hatch receives. */
export interface WaterSurfaceControls {
  /** Scene context: objects, camera, renderer, module. */
  readonly scene: SceneContext
  /** Live uniforms: changing them changes the render on the next frame. */
  readonly uniforms: Record<string, { value: unknown }>
}

/** Props specific to this component. */
export interface WaterSurfaceOwnProps {
  /** Height of the main wave, in scene units. @defaultValue 0.12 */
  amplitude?: number
  /** Length of the main wave, in scene units. @defaultValue 1.6 */
  wavelength?: number
  /** Pinching of the crests, between zero and one. @defaultValue 0.6 */
  choppiness?: number
  /** Speed of the waves. @defaultValue 1 */
  speed?: number
  /** Intensity of the sun on the water. @defaultValue 1 */
  sun?: number
  /** Slide of the camera under the pointer. @defaultValue 0.15 */
  parallax?: number
  /** Tokens: the background and the haze, the water, the reflected sky. */
  colors?: readonly [string, string, string]
  /** Fallback classes. */
  poster?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<WaterSurfaceControls>
}

/** All props. */
export type WaterSurfaceProps = Customisable<WaterSurfaceOwnProps>

/** Tokens used by default. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-sky-600',
  '--o-palette-sky-200',
] as const

/** Default fallback: the water frozen into a blurred gradient, in the same tones. */
const DEFAULT_POSTER =
  'o-bg-gradient-to-t o-from-sky-600 o-via-sky-300 dark:o-via-sky-900 o-to-zinc-50 dark:o-to-zinc-950 o-blur-2xl o-scale-110'

/** Subdivision of the sheet per quality step. */
const SEGMENTS: Readonly<Record<QualityLevel, number>> = {
  low: 90,
  medium: 160,
  high: 220,
}

/** How far the camera sits above the water and behind it. */
const CAMERA = { height: 0.55, back: 3.2 } as const

/**
 * Water surface.
 *
 * @example
 * <section className="o-relative o-min-h-screen">
 *   <WaterSurface className="o-absolute o-inset-0" />
 *   <h1 className="o-relative">Odoro</h1>
 * </section>
 */
export function WaterSurface({
  amplitude = 0.12,
  wavelength = 1.6,
  choppiness = 0.6,
  speed = 1,
  sun = 1,
  parallax = 0.15,
  colors = DEFAULT_TOKENS,
  poster = DEFAULT_POSTER,
  onReady,
  ...rest
}: WaterSurfaceProps): ReactElement {
  const { theme } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)

  const pointer = usePointerDamped({ host, speed: 2, name: 'water-surface : pointer' })

  /** Live uniforms, shared between the construction and the loop. */
  const uniforms = useRef<Record<string, { value: unknown }>>({})
  const context = useRef<SceneContext | null>(null)

  // The settings are read by ref inside the loop: moving a slider in the
  // workshop takes effect on the next frame without rebuilding the scene.
  const settings = useRef({ amplitude, wavelength, choppiness, speed, sun, parallax })
  settings.current = { amplitude, wavelength, choppiness, speed, sun, parallax }

  const { ref, ready, refused } = useScene({
    name: 'water-surface',
    setup: (scene) => {
      context.current = scene
      const { three, camera, renderer } = scene

      const paint = (value: ShaderColour): InstanceType<typeof three.Color> =>
        new three.Color(value[0], value[1], value[2])
      const [deep, water, sky] = colors.map((token) => readTokenColour(token, host))

      // The background of the scene is the haze colour. The token is in sRGB
      // and the renderer encodes its clear colour from linear to sRGB:
      // without the inverse conversion, the background comes out one notch
      // lighter than the page around it.
      const deepColour = paint(deep ?? [0, 0, 0])
      renderer.setClearColor(deepColour.clone().convertSRGBToLinear(), 1)

      uniforms.current = {
        uTime: { value: 0 },
        uAmplitude: { value: amplitude },
        uWavelength: { value: wavelength },
        uChop: { value: choppiness },
        uSpeed: { value: speed },
        uSun: { value: sun },
        uDeep: { value: deepColour },
        uWater: { value: paint(water ?? [0, 0, 0]) },
        uSky: { value: paint(sky ?? [0, 0, 0]) },
      }

      // A wide, deep plane: the haze erases it well before its edges.
      const segments = SEGMENTS[scene.quality]
      const geometry = new three.PlaneGeometry(
        24,
        30,
        segments,
        Math.round(segments * 1.25),
      )
      const material = new three.ShaderMaterial({
        vertexShader: WATER_SURFACE_VERTEX,
        fragmentShader: `${NOISE_FUNCTIONS_3D}\n${WATER_SURFACE_FRAGMENT}`,
        uniforms: uniforms.current,
      })
      const mesh = new three.Mesh(geometry, material)
      // The plane lies flat: it is seen at a grazing angle, and that is the
      // whole reflection.
      mesh.rotation.x = -Math.PI / 2
      mesh.position.y = -0.6
      mesh.position.z = -6
      mesh.name = 'water-surface'
      scene.scene.add(mesh)

      camera.position.set(0, CAMERA.height, CAMERA.back)
      camera.lookAt(0, -0.35, -4)

      return () => {
        scene.scene.remove(mesh)
        geometry.dispose()
        material.dispose()
      }
    },

    frame: ({ camera }, { time, delta }) => {
      const live = uniforms.current
      const {
        amplitude: a,
        wavelength: l,
        choppiness: c,
        speed: s,
        sun: brightness,
        parallax: lean,
      } = settings.current
      const set = (key: string, value: number): void => {
        const uniform = live[key]
        if (uniform !== undefined) uniform.value = value
      }
      set('uTime', time)
      set('uAmplitude', a)
      set('uWavelength', l)
      set('uChop', c)
      set('uSpeed', s)
      set('uSun', brightness)

      // The camera slides with the pointer: read here, never through a React
      // render — the value changes on every frame.
      const targetX = pointer.current.x * lean * 2
      const targetY = CAMERA.height - pointer.current.y * lean * 0.6
      camera.position.x += (targetX - camera.position.x) * Math.min(1, delta * 3)
      camera.position.y += (targetY - camera.position.y) * Math.min(1, delta * 3)
      camera.lookAt(camera.position.x * 0.4, -0.35, -4)
    },
  })

  // The theme has toggled: the tokens are read again and the uniforms updated
  // in place. The scene is not rebuilt — only its colours change.
  useEffect(() => {
    const scene = context.current
    const live = uniforms.current
    if (scene === null || live['uDeep'] === undefined) return
    const [deep, water, sky] = colors.map((token) => readTokenColour(token, host))
    const paint = (key: string, value: ShaderColour | undefined): void => {
      const uniform = live[key]
      if (uniform === undefined || value === undefined) return
      ;(uniform.value as { setRGB: (r: number, g: number, b: number) => unknown }).setRGB(
        value[0],
        value[1],
        value[2],
      )
    }
    paint('uDeep', deep)
    paint('uWater', water)
    paint('uSky', sky)
    if (deep !== undefined) {
      scene.renderer.setClearColor(
        new scene.three.Color(deep[0], deep[1], deep[2]).convertSRGBToLinear(),
        1,
      )
    }
  }, [theme, colors, host])

  const fallback = usePoster({ ready, refused })

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
      {fallback.visible ? (
        <div style={fallback.style} className={`o-absolute o-inset-0 ${poster}`} />
      ) : null}
    </div>
  )
}
