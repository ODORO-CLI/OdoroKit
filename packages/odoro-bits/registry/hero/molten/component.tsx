/**
 * Molten — a molten mass that breathes.
 *
 * ## What this component costs
 *
 * Around a hundred and thirty kilobytes compressed on first display, against
 * thirteen for the light backend. It is the most expensive component of the
 * registry, and the CLI announces it before writing anything at all.
 *
 * The trade-off is what a 3D scene allows and a full-screen shader does not: a
 * camera, a depth, a silhouette reacting to the pointer. If the effect being
 * sought needs none of the three, the aurora does the same job for a tenth of
 * the weight.
 *
 * ## The fallback is half the component
 *
 * It is displayed while the backend downloads — several hundred milliseconds
 * on an ordinary connection, in the most visible spot on the page — then faded
 * out. It also serves when the scene will never come: without WebGL, under
 * reduced motion, or when the arbiter refuses the surface.
 *
 * ## What quality changes
 *
 * The subdivision of the sphere and the number of octaves. Those are the two
 * settings that weigh, and they are the two that degrade best: the silhouette
 * stays, only the detail fades. Lowering the render resolution instead would
 * have given a blurry image, which is noticed far more.
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
import { useEffect, useMemo, useRef, useState, type ReactElement } from 'react'

import { usePointerDamped } from '@registre/hooks/usePointerDamped'
import { usePoster } from '@registre/hooks/usePoster'

import { MOLTEN_FRAGMENT, MOLTEN_VERTEX } from './molten.shader.js'

/** What the escape hatch receives. */
export interface MoltenControls {
  /** Context of the scene: objects, camera, renderer, module. */
  readonly scene: SceneContext
  /** Live uniforms of the material, editable in place. */
  readonly uniforms: Record<string, { value: unknown }>
}

/** Props of the component itself. */
export interface MoltenOwnProps {
  /** Depth of the deformation, in radii. @defaultValue 0.28 */
  amplitude?: number
  /** Scale of the noise. @defaultValue 1.6 */
  frequency?: number
  /** Speed of the breathing. @defaultValue 0.25 */
  speed?: number
  /** Strength of the rim halo. @defaultValue 0.8 */
  glow?: number
  /** Amount of pointer following. Zero to hold it still. @defaultValue 0.25 */
  parallax?: number
  /** Tokens of the core and of the crust. */
  colors?: readonly [string, string]
  /** Classes of the fallback. */
  poster?: string
  /** Escape hatch. */
  onReady?: ReadyCallback<MoltenControls>
}

/** All the props. */
export type MoltenProps = Customisable<MoltenOwnProps>

/** Tokens used by default. */
const DEFAULT_TOKENS = ['--o-palette-brand-600', '--o-palette-fuchsia-600'] as const

/** Default fallback: a radial gradient in the same tones. */
const DEFAULT_POSTER =
  'o-bg-gradient-to-br o-from-brand-600 dark:o-from-brand-400 o-via-fuchsia-600 dark:o-via-fuchsia-400 o-to-zinc-50 dark:o-to-zinc-900 o-blur-2xl o-scale-110'

/** Subdivision of the sphere and noise octaves, per quality tier. */
const DETAIL: Readonly<Record<QualityLevel, { detail: number; octaves: number }>> = {
  low: { detail: 24, octaves: 2 },
  medium: { detail: 48, octaves: 3 },
  high: { detail: 96, octaves: 4 },
}

/**
 * Molten mass, as a 3D scene.
 *
 * @example
 * <section className="o-relative o-h-screen">
 *   <Molten className="o-absolute o-inset-0" />
 *   <h1 className="o-relative">Odoro</h1>
 * </section>
 *
 * @example
 * // Level 5: the scene itself, for what the API did not plan for.
 * <Molten
 *   onReady={({ handle }) => {
 *     handle.uniforms.uGlow.value = 2
 *     handle.scene.camera.position.z = 4
 *   }}
 * />
 */
export function Molten({
  amplitude = 0.28,
  frequency = 1.6,
  speed = 0.25,
  glow = 0.8,
  parallax = 0.25,
  colors = DEFAULT_TOKENS,
  poster = DEFAULT_POSTER,
  onReady,
  ...rest
}: MoltenProps): ReactElement {
  const { quality, theme } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)

  const pointer = usePointerDamped({ host, speed: 3, name: 'molten : pointer' })

  /** Live uniforms, shared between the setup and the loop. */
  const uniforms = useRef<Record<string, { value: unknown }>>({})
  const context = useRef<SceneContext | null>(null)

  const grade = DETAIL[quality]

  const { ref, ready, refused } = useScene({
    name: 'molten',
    setup: (scene) => {
      context.current = scene
      const { three, camera } = scene

      const [core, crust] = colors.map((token) => readTokenColour(token, host))

      uniforms.current = {
        uTime: { value: 0 },
        uAmplitude: { value: amplitude },
        uFrequency: { value: frequency },
        uSpeed: { value: speed },
        uOctaves: { value: grade.octaves },
        uGlow: { value: glow },
        uCore: { value: new three.Color(core?.[0] ?? 1, core?.[1] ?? 1, core?.[2] ?? 1) },
        uCrust: {
          value: new three.Color(crust?.[0] ?? 0, crust?.[1] ?? 0, crust?.[2] ?? 0),
        },
      }

      const mesh = new three.Mesh(
        // A subdivided icosahedron spreads its vertices far more evenly than a
        // sphere in latitude and longitude, which crowds them at the poles —
        // where the deformation would then be finer than elsewhere, for no
        // reason.
        new three.IcosahedronGeometry(1, grade.detail),
        new three.ShaderMaterial({
          // The noise comes from the engine: copying it here would make a
          // second version to maintain.
          vertexShader: `${NOISE_FUNCTIONS_3D}\n${MOLTEN_VERTEX}`,
          fragmentShader: MOLTEN_FRAGMENT,
          uniforms: uniforms.current,
        }),
      )

      scene.scene.add(mesh)
      camera.position.z = 2.6
    },

    frame: ({ scene }, { time, delta }) => {
      const time_ = uniforms.current['uTime']
      if (time_ !== undefined) time_.value = time

      if (parallax === 0) return
      // The pointer tilts the mass, it does not move it: a rotation reads as a
      // volume presenting itself, a translation as an image sliding past.
      const target = pointer.current
      scene.rotation.y += (target.x * parallax - scene.rotation.y) * delta * 2
      scene.rotation.x += (-target.y * parallax - scene.rotation.x) * delta * 2
    },
  })

  // The theme has flipped: the tokens are read again and the uniforms updated
  // in place. The scene is not rebuilt — only its colours change.
  useEffect(() => {
    const scene = context.current
    const live = uniforms.current
    if (scene === null || live['uCore'] === undefined) return
    const [core, crust] = colors.map((token) => readTokenColour(token, host))
    const paint = (key: string, value: readonly number[] | undefined): void => {
      const uniform = live[key]
      if (uniform === undefined || value === undefined) return
      ;(uniform.value as { setRGB: (r: number, g: number, b: number) => unknown }).setRGB(
        value[0] ?? 0,
        value[1] ?? 0,
        value[2] ?? 0,
      )
    }
    paint('uCore', core)
    paint('uCrust', crust)
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

  const detail = useMemo(() => String(grade.detail), [grade.detail])

  return (
    <div
      {...rest}
      ref={(element) => {
        setHost(element)
        ref.current = element
      }}
      className={className}
      style={style}
      data-o-detail={detail}
      aria-hidden
    >
      {fallback.visible ? (
        <div style={fallback.style} className={`o-absolute o-inset-0 ${poster}`} />
      ) : null}
    </div>
  )
}
