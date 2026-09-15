/**
 * Hologram: a sphere of latitude and longitude lines, projected above a
 * base, that turns, flickers and gets swept.
 *
 * ## Why lines, and a program of its own
 *
 * A sphere of lines is a fixed geometry: circles, built once. What makes it
 * a hologram is not in the geometry but in the way it is painted — the back
 * face fading out, the band travelling up, the stripes — and that fits in a
 * ten-line fragment program, fed by the height and the orientation of each
 * point. An ordinary material would give it nothing but a flat colour.
 *
 * ## The flicker
 *
 * It is chopped into steps, never continuous: at each step, a draw sets the
 * luminance, and during the bursts — one slow step in four — the whole
 * image jumps a few millimetres sideways. A cinema hologram trembles, it
 * does not breathe.
 *
 * What sets this entry apart from `globe-mesh`: no point cloud, no
 * icosahedron cage, no pointer — meridians and parallels, a base, and a
 * band that sweeps; and from `orbital-sphere`: a hollow sphere, not a
 * cloud girdled with rings.
 *
 * ## What this component does not do
 *
 * It opens neither an animation loop nor an observer: `useScene` carries
 * them. It writes no colour: the background, the lines and the band are
 * read from the tokens, and repainted in place when the theme flips.
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

import { HOLOGRAM_FRAGMENT, HOLOGRAM_VERTEX } from './hologram.shader.js'

/** Properties specific to this component. */
export interface HologramOwnProps {
  /** Number of meridians. @defaultValue 12 */
  meridians?: number
  /** Number of parallels. @defaultValue 7 */
  parallels?: number
  /** Rotation speed, in turns per minute. @defaultValue 4 */
  rpm?: number
  /** Strength of the flicker and the jumps. Zero cuts them. @defaultValue 0.5 */
  flicker?: number
  /** Tokens: the background, the lines, the scan band. */
  colors?: readonly [string, string, string]
  /** Fallback classes. */
  poster?: string
}

/** Every property. */
export type HologramProps = Customisable<HologramOwnProps>

/** Tokens used by default. */
const DEFAULT_TOKENS = ['--o-theme-bg', '--o-palette-cyan-500', '--o-theme-fg'] as const

/** Default fallback: a frozen halo, in the same tones. */
const DEFAULT_POSTER =
  'o-bg-gradient-to-b o-from-zinc-50 dark:o-from-zinc-950 o-via-cyan-100 dark:o-via-cyan-950 o-to-zinc-50 dark:o-to-zinc-950'

/** Sphere radius, in scene units. */
const RADIUS = 1.25

/** Depth of the base below the centre of the sphere. */
const BASE_DEPTH = 1.75

/**
 * Segments per circle, by quality.
 *
 * Each segment is two vertices: the cost grows linearly with their count,
 * and that is the only lever that counts here.
 */
const SEGMENTS = { high: 96, medium: 72, low: 40 } as const

/** Pseudo-random number, stable within a step. */
function hash(step: number): number {
  const x = Math.sin(step * 12.9898) * 43758.5453
  return x - Math.floor(x)
}

type Three = SceneContext['three']
type Group = InstanceType<Three['Group']>
type ShaderMaterial = InstanceType<Three['ShaderMaterial']>
type LineMaterial = InstanceType<Three['LineBasicMaterial']>
type PointsMaterial = InstanceType<Three['PointsMaterial']>

/** What the loop touches: the group, and the materials to repaint. */
interface Living {
  readonly group: Group
  readonly sphere: Group
  readonly lines: ShaderMaterial
  readonly base: LineMaterial
  readonly dots: PointsMaterial
  /** Angular velocity, in radians per second. */
  readonly rate: number
  /** Last flicker step applied. */
  step: number
}

/**
 * A circle of a given radius, in a plane, as pairs of vertices.
 *
 * @param push Receives each vertex.
 * @param place Position of an angle on the circle.
 */
function circle(
  segments: number,
  push: (x: number, y: number, z: number) => void,
  place: (angle: number) => readonly [number, number, number],
): void {
  for (let s = 0; s < segments; s += 1) {
    const a = (s / segments) * Math.PI * 2
    const b = ((s + 1) / segments) * Math.PI * 2
    push(...place(a))
    push(...place(b))
  }
}

/**
 * Hologram.
 *
 * @example
 * <div className="o-relative o-h-96 o-overflow-hidden">
 *   <Hologram className="o-absolute o-inset-0" />
 *   <div className="o-relative">…</div>
 * </div>
 */
export function Hologram({
  meridians = 12,
  parallels = 7,
  rpm = 4,
  flicker = 0.5,
  colors = DEFAULT_TOKENS,
  poster = DEFAULT_POSTER,
  ...rest
}: HologramProps): ReactElement {
  const { theme } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)

  const living = useRef<Living | null>(null)
  const context = useRef<SceneContext | null>(null)

  const { ref, ready, refused } = useScene({
    name: 'hologramme',
    setup: (scene) => {
      context.current = scene
      const { three, renderer, camera, quality } = scene

      const [bg, line, scan] = colors.map((token) => readTokenColour(token, host))
      renderer.setClearColor(
        new three.Color(bg?.[0] ?? 0, bg?.[1] ?? 0, bg?.[2] ?? 0).convertSRGBToLinear(),
        1,
      )

      // The camera sits a little above the base: seen head on, the base
      // would be no more than a stroke.
      camera.position.set(0, 0.7, 4.4)
      camera.lookAt(0, -0.2, 0)

      const segments = SEGMENTS[quality]
      const meridianCount = Math.max(Math.round(meridians), 2)
      const parallelCount = Math.max(Math.round(parallels), 1)

      // The meridians: complete circles in planes turned around the
      // vertical axis. The parallels: horizontal circles, at regular
      // latitudes.
      const positions: number[] = []
      const push = (x: number, y: number, z: number): void => {
        positions.push(x, y, z)
      }
      for (let m = 0; m < meridianCount; m += 1) {
        const phi = (m / meridianCount) * Math.PI
        circle(segments, push, (angle) => [
          Math.cos(angle) * Math.cos(phi) * RADIUS,
          Math.sin(angle) * RADIUS,
          Math.cos(angle) * Math.sin(phi) * RADIUS,
        ])
      }
      const latitudes: number[] = []
      for (let k = 1; k <= parallelCount; k += 1) {
        const latitude = -Math.PI / 2 + (Math.PI * k) / (parallelCount + 1)
        latitudes.push(latitude)
        const r = Math.cos(latitude) * RADIUS
        const y = Math.sin(latitude) * RADIUS
        circle(segments, push, (angle) => [Math.cos(angle) * r, y, Math.sin(angle) * r])
      }

      const geometry = new three.BufferGeometry()
      geometry.setAttribute(
        'position',
        new three.BufferAttribute(new Float32Array(positions), 3),
      )

      const lines = new three.ShaderMaterial({
        vertexShader: HOLOGRAM_VERTEX,
        fragmentShader: HOLOGRAM_FRAGMENT,
        transparent: true,
        depthWrite: false,
        uniforms: {
          uTime: { value: 0 },
          uLine: {
            value: new three.Color(line?.[0] ?? 0, line?.[1] ?? 0, line?.[2] ?? 0),
          },
          uScan: {
            value: new three.Color(scan?.[0] ?? 0, scan?.[1] ?? 0, scan?.[2] ?? 0),
          },
          uScanPos: { value: 0 },
          uFlick: { value: 1 },
          uOpacity: { value: 0.75 },
        },
      })

      // The knots: one dot at each crossing of a meridian and a
      // parallel. They are what keeps the sphere readable when the lines
      // at the back fade out.
      const dotPositions: number[] = []
      for (let m = 0; m < meridianCount * 2; m += 1) {
        const phi = (m / meridianCount) * Math.PI
        for (const latitude of latitudes) {
          const r = Math.cos(latitude) * RADIUS
          dotPositions.push(
            Math.cos(phi) * r,
            Math.sin(latitude) * RADIUS,
            Math.sin(phi) * r,
          )
        }
      }
      const dotGeometry = new three.BufferGeometry()
      dotGeometry.setAttribute(
        'position',
        new three.BufferAttribute(new Float32Array(dotPositions), 3),
      )
      const dots = new three.PointsMaterial({
        size: 0.035,
        transparent: true,
        opacity: 0.85,
        depthWrite: false,
      })
      dots.color.setRGB(line?.[0] ?? 0, line?.[1] ?? 0, line?.[2] ?? 0)

      const sphere = new three.Group()
      sphere.add(new three.LineSegments(geometry, lines))
      sphere.add(new three.Points(dotGeometry, dots))

      // The base: three concentric rings lying flat, under the sphere.
      // They do not turn — this is the projector, not the projection.
      const basePositions: number[] = []
      const pushBase = (x: number, y: number, z: number): void => {
        basePositions.push(x, y, z)
      }
      for (const r of [0.55, 0.85, 1.15]) {
        circle(segments, pushBase, (angle) => [
          Math.cos(angle) * r,
          -BASE_DEPTH,
          Math.sin(angle) * r,
        ])
      }
      const baseGeometry = new three.BufferGeometry()
      baseGeometry.setAttribute(
        'position',
        new three.BufferAttribute(new Float32Array(basePositions), 3),
      )
      const base = new three.LineBasicMaterial({
        transparent: true,
        opacity: 0.45,
        depthWrite: false,
      })
      base.color.setRGB(line?.[0] ?? 0, line?.[1] ?? 0, line?.[2] ?? 0)

      const group = new three.Group()
      group.name = 'hologramme'
      group.add(sphere)
      group.add(new three.LineSegments(baseGeometry, base))
      scene.scene.add(group)

      living.current = {
        group,
        sphere,
        lines,
        base,
        dots,
        rate: (rpm * Math.PI * 2) / 60,
        step: -1,
      }

      return () => {
        scene.scene.remove(group)
        living.current = null
      }
    },

    frame: (_, { time, delta }) => {
      const live = living.current
      if (live === null) return

      live.sphere.rotation.y += live.rate * delta
      live.sphere.position.y = Math.sin(time * 0.8) * 0.06

      const uniforms = live.lines.uniforms
      const timeUniform = uniforms['uTime']
      const scanUniform = uniforms['uScanPos']
      const flickUniform = uniforms['uFlick']
      if (timeUniform !== undefined) timeUniform.value = time
      if (scanUniform !== undefined) {
        // The band travels up through the sphere and overshoots it at
        // both ends, so that it does not seem to bounce.
        scanUniform.value = (-1.3 + 2.6 * ((time * 0.3) % 1)) * RADIUS
      }

      // The flicker, in steps: a draw sets the luminance, and during the
      // bursts the image jumps sideways.
      const step = Math.floor(time * 20)
      if (step !== live.step) {
        live.step = step
        const burst = hash(Math.floor(time * 2) + 0.5) > 0.7 ? 1 : 0
        const level = 1 - flicker * (0.35 * hash(step) + 0.3 * burst * hash(step + 0.25))
        if (flickUniform !== undefined) flickUniform.value = level
        live.dots.opacity = 0.85 * level
        live.group.position.x = burst * flicker * (hash(step + 0.75) - 0.5) * 0.12
      }
    },
  })

  // The theme has flipped: the tokens are re-read and the colours repainted in
  // place. The scene is not rebuilt.
  useEffect(() => {
    const scene = context.current
    const live = living.current
    if (scene === null || live === null) return
    const [bg, line, scan] = colors.map((token) => readTokenColour(token, host))
    if (line !== undefined) {
      const lineUniform = live.lines.uniforms['uLine']
      if (lineUniform !== undefined) lineUniform.value.setRGB(line[0], line[1], line[2])
      live.base.color.setRGB(line[0], line[1], line[2])
      live.dots.color.setRGB(line[0], line[1], line[2])
    }
    if (scan !== undefined) {
      const scanUniform = live.lines.uniforms['uScan']
      if (scanUniform !== undefined) scanUniform.value.setRGB(scan[0], scan[1], scan[2])
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
