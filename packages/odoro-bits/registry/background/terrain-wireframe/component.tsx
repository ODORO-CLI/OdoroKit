/**
 * Wireframe terrain: a gridded sheet whose crests scroll towards
 * the camera, and fade into the fog in the distance.
 *
 * ## Why a scene, and not a fullscreen shader
 *
 * A fragment shader can project a floor by setting z = 1/y — that is what
 * `night-drive` does — but not a terrain: for every pixel it would have to
 * find the point of the sheet that projects onto it, and that search has no
 * closed form. A scene carries the sheet as a geometry of segments whose
 * heights alone change; the projection is done by the pipeline, once per
 * vertex. This is the case where the 3D engine's lines cost less than their
 * per-fragment equivalent.
 *
 * ## How the terrain scrolls
 *
 * The vertices do not move in depth: it is the noise that is read at a
 * depth offset by time. The crests seem to advance, the sheet stays put
 * — no vertex ever crosses the edge of the scene. The noise is a
 * two-octave value noise, evaluated once per vertex per frame; a few
 * thousand vertices make for a short loop.
 *
 * A central valley is left in the terrain: the crests rise on the sides,
 * the centre stays flat. Without it, the eye would run straight into the
 * nearest crest.
 *
 * ## Under reduced motion
 *
 * The scene is refused by the engine and the static fallback is shown.
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

/** Props specific to this component. */
export interface TerrainWireframeOwnProps {
  /** Columns of the sheet. The rows are half as many. @defaultValue 80 */
  columns?: number
  /** Scrolling speed, in scene units per second. @defaultValue 1.2 */
  speed?: number
  /** Height of the crests, in scene units. @defaultValue 1.6 */
  height?: number
  /** Width of the central valley, between zero and one. Zero removes it. @defaultValue 0.6 */
  valley?: number
  /** Tokens: the background and the fog, the lines, the crests. */
  colors?: readonly [string, string, string]
  /** Fallback classes. */
  poster?: string
}

/** All props. */
export type TerrainWireframeProps = Customisable<TerrainWireframeOwnProps>

/** Tokens used by default. */
const DEFAULT_TOKENS = [
  '--o-theme-bg',
  '--o-palette-teal-500',
  '--o-palette-teal-200',
] as const

/** Default fallback: a frozen tint, in the same tones. */
const DEFAULT_POSTER =
  'o-bg-gradient-to-t o-from-zinc-50 dark:o-from-zinc-950 o-to-teal-100 dark:o-to-teal-950'

/**
 * Columns at low quality.
 *
 * The cost is in the noise loop, one call per vertex per frame; halving
 * the columns divides the vertices by four.
 */
const LOW_COLUMNS = 40

/** Width of the sheet, in scene units. */
const WIDTH = 18

/** Depth of the sheet, in scene units. */
const DEPTH = 16

/** Scale of the noise: crests per scene unit. */
const SCALE = 0.35

type Three = SceneContext['three']
type Fog = InstanceType<Three['Fog']>

/** What the scene keeps between construction and frames. */
interface Relief {
  readonly columns: number
  readonly rows: number
  /** Vertex buffer, x and z fixed, y rewritten every frame. */
  readonly positions: Float32Array
  /** Colour buffer, a lines/crests mix according to the height. */
  readonly colours: Float32Array
  readonly positionAttribute: { needsUpdate: boolean }
  readonly colourAttribute: { needsUpdate: boolean }
  readonly fog: Fog
}

/** Deterministic pseudo-random number over an integer grid. */
function hash(x: number, y: number): number {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453
  return value - Math.floor(value)
}

/** Value noise: four draws interpolated with cubic smoothing. */
function noise(x: number, y: number): number {
  const ix = Math.floor(x)
  const iy = Math.floor(y)
  const fx = x - ix
  const fy = y - iy
  const ux = fx * fx * (3 - 2 * fx)
  const uy = fy * fy * (3 - 2 * fy)
  const a = hash(ix, iy)
  const b = hash(ix + 1, iy)
  const c = hash(ix, iy + 1)
  const d = hash(ix + 1, iy + 1)
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy
}

/**
 * Wireframe terrain.
 *
 * @example
 * <div className="o-relative o-h-96 o-overflow-hidden o-rounded-xl">
 *   <TerrainWireframe className="o-absolute o-inset-0" />
 *   <div className="o-relative o-z-10">…</div>
 * </div>
 */
export function TerrainWireframe({
  columns = 80,
  speed = 1.2,
  height = 1.6,
  valley = 0.6,
  colors = DEFAULT_TOKENS,
  poster = DEFAULT_POSTER,
  ...rest
}: TerrainWireframeProps): ReactElement {
  const { theme } = useMotionState()
  const [host, setHost] = useState<HTMLDivElement | null>(null)

  const relief = useRef<Relief | null>(null)
  const context = useRef<SceneContext | null>(null)

  // The colours are read through a ref inside the loop: a theme change
  // replaces them without rebuilding the scene.
  const shades = useRef<readonly ShaderColour[]>([])

  const settings = useRef({ speed, height, valley })
  settings.current = { speed, height, valley }

  const { ref, ready, refused } = useScene<HTMLDivElement>({
    name: 'relief',
    setup: (scene: SceneContext) => {
      context.current = scene
      const { three, renderer, camera, quality } = scene

      shades.current = colors.map((token) => readTokenColour(token, ref.current))
      const [bg] = shades.current

      // The scene's background is the page's background, and the fog has the
      // same colour: the distant crests fade into it with no visible edge.
      // The token is in sRGB and the engine encodes its clear colour from
      // linear to sRGB: without the reverse conversion, the background comes
      // out one notch lighter.
      const bgColour = new three.Color(
        bg?.[0] ?? 0,
        bg?.[1] ?? 0,
        bg?.[2] ?? 0,
      ).convertSRGBToLinear()
      renderer.setClearColor(bgColour, 1)
      const fog = new three.Fog(bgColour, 4, DEPTH + 2)
      scene.scene.fog = fog

      // The camera sits low and looks far ahead: the terrain reads in
      // perspective, the horizon in the upper third.
      camera.position.set(0, 1.8, 3.5)
      camera.lookAt(0, 0.2, -DEPTH)

      const cols =
        quality === 'low' ? Math.min(columns, LOW_COLUMNS) : Math.max(columns, 8)
      const rows = Math.max(Math.round(cols / 2), 4)
      const count = (cols + 1) * (rows + 1)

      // The vertices: x and z are fixed, y is rewritten every frame.
      const positions = new Float32Array(count * 3)
      const colours = new Float32Array(count * 3)
      for (let row = 0; row <= rows; row += 1) {
        for (let col = 0; col <= cols; col += 1) {
          const at = (row * (cols + 1) + col) * 3
          positions[at] = (col / cols - 0.5) * WIDTH
          positions[at + 1] = 0
          positions[at + 2] = 2 - (row / rows) * DEPTH
        }
      }

      // The segments: each vertex is joined to its neighbour on the right and
      // to the one behind. No diagonals: a grid, not
      // triangles.
      const pairs: number[] = []
      for (let row = 0; row <= rows; row += 1) {
        for (let col = 0; col <= cols; col += 1) {
          const index = row * (cols + 1) + col
          if (col < cols) pairs.push(index, index + 1)
          if (row < rows) pairs.push(index, index + cols + 1)
        }
      }

      const geometry = new three.BufferGeometry()
      const positionAttribute = new three.BufferAttribute(positions, 3)
      const colourAttribute = new three.BufferAttribute(colours, 3)
      positionAttribute.setUsage(three.DynamicDrawUsage)
      colourAttribute.setUsage(three.DynamicDrawUsage)
      geometry.setAttribute('position', positionAttribute)
      geometry.setAttribute('color', colourAttribute)
      geometry.setIndex(pairs)

      // The colours come from the vertices: that is what makes it possible to
      // lighten a crest without one material per segment.
      const material = new three.LineBasicMaterial({
        vertexColors: true,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      })

      const lines = new three.LineSegments(geometry, material)
      lines.name = 'relief'
      scene.scene.add(lines)

      relief.current = {
        columns: cols,
        rows,
        positions,
        colours,
        positionAttribute,
        colourAttribute,
        fog,
      }

      return () => {
        scene.scene.remove(lines)
        scene.scene.fog = null
        relief.current = null
      }
    },

    frame: (_, { time }) => {
      const sheet = relief.current
      if (sheet === null) return
      const { speed: rate, height: amplitude, valley: hollow } = settings.current
      const [, line, peak] = shades.current
      const lr = line?.[0] ?? 0
      const lg = line?.[1] ?? 0
      const lb = line?.[2] ?? 0
      const pr = peak?.[0] ?? 0
      const pg = peak?.[1] ?? 0
      const pb = peak?.[2] ?? 0

      // The noise is read at a depth offset by time: the crests
      // advance, the vertices stay put.
      const offset = time * rate
      const count = (sheet.columns + 1) * (sheet.rows + 1)
      const halfValley = hollow * 3

      for (let index = 0; index < count; index += 1) {
        const at = index * 3
        const x = sheet.positions[at] ?? 0
        const z = sheet.positions[at + 2] ?? 0
        const sx = x * SCALE
        const sz = (z - offset) * SCALE

        // Two octaves: the second, twice as fine and twice as
        // weak, breaks the roundness of the first.
        let bump = noise(sx, sz) * 0.7 + noise(sx * 2 + 17, sz * 2 + 31) * 0.3

        // The valley: flat at the centre, full on the sides.
        if (halfValley > 0) {
          const edge = Math.min(Math.max((Math.abs(x) - halfValley) / 2.5, 0), 1)
          bump *= edge * edge * (3 - 2 * edge)
        }

        const y = bump * amplitude
        sheet.positions[at + 1] = y

        const share = Math.min(Math.max(y / Math.max(amplitude, 0.001), 0), 1)
        sheet.colours[at] = lr + (pr - lr) * share
        sheet.colours[at + 1] = lg + (pg - lg) * share
        sheet.colours[at + 2] = lb + (pb - lb) * share
      }

      sheet.positionAttribute.needsUpdate = true
      sheet.colourAttribute.needsUpdate = true
    },
  })

  // The theme has flipped: the tokens are read again and the colours replaced
  // in place. The lines read the ref on the next frame; the background and the
  // fog are painted here, because they are not re-read every frame.
  useEffect(() => {
    const scene = context.current
    const sheet = relief.current
    if (scene === null || sheet === null || host === null) return
    shades.current = colors.map((token) => readTokenColour(token, host))
    const [bg] = shades.current
    const bgColour = new scene.three.Color(
      bg?.[0] ?? 0,
      bg?.[1] ?? 0,
      bg?.[2] ?? 0,
    ).convertSRGBToLinear()
    scene.renderer.setClearColor(bgColour, 1)
    sheet.fog.color.copy(bgColour)
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
