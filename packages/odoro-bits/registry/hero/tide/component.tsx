/**
 * Tide: a luminous sheet in three dimensions.
 *
 * ## Why a scene, and not a full-screen shader
 *
 * The light backend paints fragments: it knows how to make a sheet seen
 * head-on, not a sheet seen at a grazing angle, with a depth, a light sliding
 * over it and a horizon that blends away. That is exactly what the hero wants,
 * and it is the only reason to pay for a scene.
 *
 * ## What scrolling does
 *
 * The camera pulls back and rises while the frame scrolls: the sheet moves
 * away and flattens, as if one were leaving the shore. The `scroll` setting
 * doses that retreat; at zero, the sheet ignores the page.
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
} from '@odoro-cli/engine'
import { useScene, type SceneContext } from '@odoro-cli/engine/three'
import { useEffect, useRef, useState, type ReactElement } from 'react'

import { usePointerDamped } from '@registre/hooks/usePointerDamped'
import { usePoster } from '@registre/hooks/usePoster'

import { TIDE_FRAGMENT, TIDE_VERTEX } from './tide.shader.js'

/** What the escape hatch receives. */
export interface TideControls {
  /** Context of the scene: objects, camera, renderer, module. */
  readonly scene: SceneContext
  /** Live uniforms: editing them changes the output on the next frame. */
  readonly uniforms: Record<string, { value: unknown }>
}

/** Props of the component itself. */
export interface TideOwnProps {
  /** Height of the swell. @defaultValue 0.45 */
  amplitude?: number
  /** Frequency of the noise. @defaultValue 0.55 */
  frequency?: number
  /** Speed of the swell. @defaultValue 0.18 */
  speed?: number
  /** Strength of the reflection and of the crest edging. @defaultValue 0.9 */
  shine?: number
  /** Tilt under the pointer. @defaultValue 0.2 */
  parallax?: number
  /** Camera retreat while the frame scrolls. @defaultValue 1 */
  scroll?: number
  /** Tokens: the background, the swell, the crests. */
  colors?: readonly [string, string, string]
  /** Classes of the fallback. */
  poster?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<TideControls>
}

/** All the props. */
export type TideProps = Customisable<TideOwnProps>

/** Tokens used by default. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-brand-500',
  '--o-palette-fuchsia-300',
] as const

/** Default fallback: the swell frozen into a blurred gradient, same tones. */
const DEFAULT_POSTER =
  'o-bg-gradient-to-t o-from-zinc-50 dark:o-from-zinc-950 o-via-brand-100 dark:o-via-brand-950 o-to-brand-500 o-blur-2xl o-scale-110'

/** Subdivision of the sheet and noise octaves, per quality tier. */
const DETAIL: Readonly<Record<QualityLevel, { segments: number; octaves: number }>> = {
  low: { segments: 80, octaves: 2 },
  medium: { segments: 140, octaves: 3 },
  high: { segments: 200, octaves: 4 },
}

/**
 * Tide.
 *
 * @example
 * <section className="o-relative o-min-h-screen o-bg-zinc-50 dark:o-bg-zinc-950">
 *   <Tide className="o-absolute o-inset-0" />
 *   <h1 className="o-relative">Odoro</h1>
 * </section>
 */
export function Tide({
  amplitude = 0.45,
  frequency = 0.55,
  speed = 0.18,
  shine = 0.9,
  parallax = 0.2,
  scroll = 1,
  colors = DEFAULT_TOKENS,
  poster = DEFAULT_POSTER,
  onReady,
  ...rest
}: TideProps): ReactElement {
  const { quality, theme } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)

  const pointer = usePointerDamped({ host, speed: 2.5, name: 'tide : pointer' })

  /** Live uniforms, shared between the setup and the loop. */
  const uniforms = useRef<Record<string, { value: unknown }>>({})
  const context = useRef<SceneContext | null>(null)
  const progress = useRef(0)

  const grade = DETAIL[quality]

  const { ref, ready, refused } = useScene({
    name: 'tide',
    setup: (scene) => {
      context.current = scene
      const { three, camera, renderer } = scene

      const [deep, mid, crest] = colors.map((token) => readTokenColour(token, host))
      const toColour = (
        value: readonly number[] | undefined,
        fallback: readonly [number, number, number],
      ): InstanceType<typeof three.Color> =>
        new three.Color(
          value?.[0] ?? fallback[0],
          value?.[1] ?? fallback[1],
          value?.[2] ?? fallback[2],
        )

      const deepColour = toColour(deep, [0.05, 0.05, 0.07])
      // The scene background is the haze colour: without this, the plane would
      // stand out against black where the haze has already erased it. The token
      // is already in sRGB and the renderer encodes its clear colour from
      // linear to sRGB: without the reverse conversion, the background comes
      // out grey, a notch lighter than the page around it.
      renderer.setClearColor(deepColour.clone().convertSRGBToLinear(), 1)

      uniforms.current = {
        uTime: { value: 0 },
        uAmplitude: { value: amplitude },
        uFrequency: { value: frequency },
        uSpeed: { value: speed },
        uOctaves: { value: grade.octaves },
        uShine: { value: shine },
        uDeep: { value: deepColour },
        uMid: { value: toColour(mid, [0.45, 0.4, 0.95]) },
        uCrest: { value: toColour(crest, [0.95, 0.6, 0.95]) },
      }

      // A wide and deep plane: the haze erases it well before its edges.
      const mesh = new three.Mesh(
        new three.PlaneGeometry(18, 20, grade.segments, Math.round(grade.segments * 1.1)),
        new three.ShaderMaterial({
          vertexShader: `${NOISE_FUNCTIONS_3D}\n${TIDE_VERTEX}`,
          fragmentShader: TIDE_FRAGMENT,
          uniforms: uniforms.current,
        }),
      )
      // The plane lies flat, slightly raised towards the camera: we see it at a
      // grazing angle, which is what makes all the relief.
      mesh.rotation.x = -Math.PI / 2 + 0.12
      mesh.position.y = -0.9

      const group = new three.Group()
      group.name = 'tide'
      group.add(mesh)
      scene.scene.add(group)

      camera.position.set(0, 0.7, 4.4)
      camera.lookAt(0, -0.15, 0)
    },

    frame: ({ scene, camera }, { time, delta }) => {
      const time_ = uniforms.current['uTime']
      if (time_ !== undefined) time_.value = time

      const group = scene.getObjectByName('tide')
      if (group === undefined) return

      // The scrolling of the frame moves the camera away: read here, never
      // through a React render — the value changes on every frame.
      const height = host?.clientHeight ?? 1
      const target =
        scroll === 0 ? 0 : Math.min(1, Math.max(0, window.scrollY / Math.max(height, 1)))
      progress.current += (target - progress.current) * Math.min(1, delta * 4)
      const away = progress.current * scroll

      camera.position.set(0, 0.7 + away * 1.4, 4.4 + away * 1.8)
      camera.lookAt(0, -0.15 - away * 0.3, 0)

      if (parallax === 0) return
      const lean = pointer.current
      group.rotation.z += (-lean.x * parallax * 0.5 - group.rotation.z) * delta * 2
      group.rotation.x += (lean.y * parallax * 0.3 - group.rotation.x) * delta * 2
    },
  })

  // The theme has flipped: the tokens are read again and the uniforms updated
  // in place. The scene is not rebuilt — only its colours change.
  useEffect(() => {
    const scene = context.current
    const live = uniforms.current
    if (scene === null || live['uDeep'] === undefined) return
    const [deep, mid, crest] = colors.map((token) => readTokenColour(token, host))
    const paint = (key: string, value: readonly number[] | undefined): void => {
      const uniform = live[key]
      if (uniform === undefined || value === undefined) return
      ;(uniform.value as { setRGB: (r: number, g: number, b: number) => unknown }).setRGB(
        value[0] ?? 0,
        value[1] ?? 0,
        value[2] ?? 0,
      )
    }
    paint('uDeep', deep)
    paint('uMid', mid)
    paint('uCrest', crest)
    if (deep !== undefined) {
      scene.renderer.setClearColor(
        new scene.three.Color(
          deep[0] ?? 0,
          deep[1] ?? 0,
          deep[2] ?? 0,
        ).convertSRGBToLinear(),
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
