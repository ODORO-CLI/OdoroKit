/**
 * Cubes: a field of cubes rising and falling in a wave.
 *
 * ## Why a scene, and why instanced
 *
 * Cubes seen at an angle, with faces lit differently, is geometry and a
 * camera: the light backend cannot do it without rebuilding a ray cast per
 * fragment. A scene does it for nothing.
 *
 * But one mesh per cube is one draw call per cube — several hundred per
 * frame. A single instanced geometry renders them in one call: each cube is
 * no more than a matrix in a buffer written at mount.
 *
 * ## The wave lives in the vertex shader
 *
 * Each cube's height is a sum of sines of its position and of time.
 * Computing it on the processor would mean rewriting every matrix on every
 * frame; the vertex shader instead reads the instance's translation and
 * shifts the vertices. The loop writes nothing but a time.
 *
 * ## What this component does not do
 *
 * It opens neither a loop nor an observer: `useScene` carries them. It
 * writes no colour: background, troughs and crests are read from the tokens,
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

/** Properties specific to this component. */
export interface CubesOwnProps {
  /** Cubes per side. @defaultValue 18 */
  grid?: number
  /** Height of the wave, in cube sides. @defaultValue 0.8 */
  amplitude?: number
  /** Speed of the wave. @defaultValue 0.8 */
  speed?: number
  /** Spatial frequency of the wave. @defaultValue 0.9 */
  frequency?: number
  /** Gap between two cubes, as a fraction of the step. @defaultValue 0.2 */
  gap?: number
  /** Tokens: the background, the troughs, the crests. */
  colors?: readonly [string, string, string]
  /** Fallback classes. */
  poster?: string
}

/** Every property. */
export type CubesProps = Customisable<CubesOwnProps>

/** Tokens used by default. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-violet-500',
  '--o-palette-brand-500',
] as const

/** Default fallback: a frozen gradient, in the same tones. */
const DEFAULT_POSTER =
  'o-bg-gradient-to-br o-from-zinc-50 dark:o-from-zinc-950 o-via-violet-100 dark:o-via-violet-950 o-to-zinc-50 dark:o-to-zinc-950'

/** Cubes per side at low quality. */
const LOW_GRID = 10

/**
 * Cubes per side at most.
 *
 * The instance buffer is allocated once at this size: changing the grid
 * rewrites matrices, never the geometry nor the material.
 */
const MAX_GRID = 36

/**
 * Vertex shader: the wave.
 *
 * `instanceMatrix` is declared by the scene engine when the mesh is
 * instanced; its translation is the cube's position in the field, and that
 * is what gives the phase of the wave. The height is a sum of three sines
 * of non-multiple frequencies: a single wave would read as a sliding
 * carpet.
 */
const CUBES_VERTEX = /* glsl */ `
uniform float uTime;
uniform float uSpeed;
uniform float uAmplitude;
uniform float uFrequency;
uniform float uExtent;

varying float vHeight;
varying vec3 vNormal;
varying float vFade;

void main() {
  #ifdef USE_INSTANCING
  vec4 origin = instanceMatrix * vec4(0.0, 0.0, 0.0, 1.0);
  #else
  vec4 origin = vec4(0.0, 0.0, 0.0, 1.0);
  #endif

  float t = uTime * uSpeed;
  float k = uFrequency;
  float h = sin(origin.x * k + t) * cos(origin.z * k * 0.8 - t * 0.7);
  h += 0.5 * sin((origin.x + origin.z) * k * 1.7 + t * 1.3);
  h /= 1.5;

  vec3 shifted = position;
  shifted.y += h * uAmplitude;

  #ifdef USE_INSTANCING
  vec4 world = instanceMatrix * vec4(shifted, 1.0);
  #else
  vec4 world = vec4(shifted, 1.0);
  #endif

  vHeight = h * 0.5 + 0.5;
  vNormal = normalize(normalMatrix * normal);
  // The edge cubes fade into the background: the field has no rim.
  vFade = smoothstep(uExtent, uExtent * 0.55, length(origin.xz));

  gl_Position = projectionMatrix * modelViewMatrix * world;
}
`

/**
 * Fragment shader: a fixed light, the hue by height.
 *
 * The colours arrive already in sRGB, as read from the tokens; they are
 * written without conversion, which is exactly what the page expects.
 */
const CUBES_FRAGMENT = /* glsl */ `
precision highp float;

uniform vec3 uBg;
uniform vec3 uLow;
uniform vec3 uHigh;

varying float vHeight;
varying vec3 vNormal;
varying float vFade;

void main() {
  vec3 light = normalize(vec3(0.4, 1.0, 0.6));
  float lambert = 0.45 + 0.55 * max(dot(vNormal, light), 0.0);
  vec3 tint = mix(uLow, uHigh, smoothstep(0.1, 0.9, vHeight));
  vec3 colour = mix(uBg, tint * lambert, vFade);
  gl_FragColor = vec4(colour, 1.0);
}
`

type Three = SceneContext['three']
type InstancedMesh = InstanceType<Three['InstancedMesh']>

/** What the scene keeps between the mount and the frames. */
interface Field {
  readonly mesh: InstancedMesh
  readonly uniforms: Record<string, { value: unknown }>
}

/**
 * Writes the instance matrices for a given grid.
 *
 * The field is centred on the origin and its step is one: a cube's position
 * is directly its phase in the wave. Returns the field's half-side.
 */
function layout(three: Three, mesh: InstancedMesh, side: number, gap: number): number {
  const matrix = new three.Matrix4()
  const scale = Math.max(0.05, 1 - gap)
  const half = (side - 1) / 2
  let index = 0
  for (let x = 0; x < side; x += 1) {
    for (let z = 0; z < side; z += 1) {
      matrix.makeScale(scale, scale, scale)
      matrix.setPosition(x - half, 0, z - half)
      mesh.setMatrixAt(index, matrix)
      index += 1
    }
  }
  mesh.count = index
  mesh.instanceMatrix.needsUpdate = true
  return half + 0.5
}

/** Places the camera at an angle, at a distance that frames the whole field. */
function frameCamera(camera: SceneContext['camera'], side: number): void {
  // Seen at an angle, like a model: head on, the wave would read only
  // through colour.
  camera.position.set(side * 0.45, side * 0.6, side * 0.7)
  camera.lookAt(0, -0.3, 0)
}

/**
 * Cubes.
 *
 * @example
 * <div className="o-relative o-h-96 o-overflow-hidden">
 *   <Cubes className="o-absolute o-inset-0" />
 *   <div className="o-relative">…</div>
 * </div>
 */
export function Cubes({
  grid = 18,
  amplitude = 0.8,
  speed = 0.8,
  frequency = 0.9,
  gap = 0.2,
  colors = DEFAULT_TOKENS,
  poster = DEFAULT_POSTER,
  ...rest
}: CubesProps): ReactElement {
  const { theme, quality } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)

  const field = useRef<Field | null>(null)
  const context = useRef<SceneContext | null>(null)

  // The settings are read by ref inside the loop: a slider that moves does
  // not remount the scene, it changes a uniform value on the next frame.
  const live = useRef({ amplitude, speed, frequency })
  live.current = { amplitude, speed, frequency }

  const side = Math.min(
    MAX_GRID,
    Math.max(2, Math.round(quality === 'low' ? Math.min(grid, LOW_GRID) : grid)),
  )

  const { ref, ready, refused } = useScene({
    name: 'cubes',
    setup: (scene) => {
      context.current = scene
      const { three, renderer, camera } = scene

      const [bg, low, high] = colors.map((token) => readTokenColour(token, host))
      const toColour = (
        value: readonly number[] | undefined,
      ): InstanceType<Three['Color']> =>
        new three.Color(value?.[0] ?? 0, value?.[1] ?? 0, value?.[2] ?? 0)

      // The token is in sRGB and the engine encodes its clear colour from linear
      // to sRGB: without the inverse conversion, the background comes out a
      // shade lighter than the page.
      renderer.setClearColor(toColour(bg).convertSRGBToLinear(), 1)

      const uniforms: Record<string, { value: unknown }> = {
        uTime: { value: 0 },
        uSpeed: { value: speed },
        uAmplitude: { value: amplitude },
        uFrequency: { value: frequency },
        uExtent: { value: side / 2 },
        uBg: { value: toColour(bg) },
        uLow: { value: toColour(low) },
        uHigh: { value: toColour(high) },
      }

      const mesh = new three.InstancedMesh(
        new three.BoxGeometry(1, 1, 1),
        new three.ShaderMaterial({
          vertexShader: CUBES_VERTEX,
          fragmentShader: CUBES_FRAGMENT,
          uniforms,
        }),
        MAX_GRID * MAX_GRID,
      )
      mesh.name = 'cubes'
      const extent = uniforms['uExtent']
      if (extent !== undefined) extent.value = layout(three, mesh, side, gap)
      field.current = { mesh, uniforms }
      scene.scene.add(mesh)

      frameCamera(camera, side)

      return () => {
        scene.scene.remove(mesh)
        field.current = null
      }
    },

    frame: (_, { time }) => {
      const current = field.current
      if (current === null) return
      const { uniforms } = current
      const set = (key: string, value: number): void => {
        const uniform = uniforms[key]
        if (uniform !== undefined) uniform.value = value
      }
      set('uTime', time)
      set('uSpeed', live.current.speed)
      set('uAmplitude', live.current.amplitude)
      set('uFrequency', live.current.frequency)
    },
  })

  // The grid or the spacing changed: the matrices are rewritten into the
  // existing buffer, and the camera pulls back accordingly. Nothing is rebuilt.
  useEffect(() => {
    const scene = context.current
    const current = field.current
    if (scene === null || current === null) return
    const extent = layout(scene.three, current.mesh, side, gap)
    const uniform = current.uniforms['uExtent']
    if (uniform !== undefined) uniform.value = extent
    frameCamera(scene.camera, side)
  }, [side, gap])

  // The theme has flipped: the tokens are re-read and the colours repainted in
  // place. The scene is not rebuilt.
  useEffect(() => {
    const scene = context.current
    const current = field.current
    if (scene === null || current === null) return
    const [bg, low, high] = colors.map((token) => readTokenColour(token, host))
    const paint = (key: string, value: readonly number[] | undefined): void => {
      const uniform = current.uniforms[key]
      if (uniform === undefined || value === undefined) return
      ;(uniform.value as { setRGB: (r: number, g: number, b: number) => unknown }).setRGB(
        value[0] ?? 0,
        value[1] ?? 0,
        value[2] ?? 0,
      )
    }
    paint('uBg', bg)
    paint('uLow', low)
    paint('uHigh', high)
    if (bg !== undefined) {
      scene.renderer.setClearColor(
        new scene.three.Color(bg[0] ?? 0, bg[1] ?? 0, bg[2] ?? 0).convertSRGBToLinear(),
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
