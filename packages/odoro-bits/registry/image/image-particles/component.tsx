/**
 * Image in particles: the photograph is sampled into a canvas outside the
 * document, then rendered as coloured points that gather to form it.
 *
 * ## Why a scene, and not a full-frame shader
 *
 * The light backend paints fragments: it has no vertices to move. Here,
 * however, the whole effect lies in the journey of each point towards its
 * place — a geometry of several thousand vertices, scattered then gathered in
 * the vertex shader. That is the only reason to pay for a scene.
 *
 * ## The real image is underneath, and it serves as the fallback
 *
 * The `img` element is laid under the canvas, absolutely positioned: it
 * carries the alternative text, it is displayed while the renderer downloads,
 * and it stays alone when the scene will not come — without WebGL, under
 * reduced motion, or when the arbiter refuses the surface. There is therefore
 * no fallback to draw: the photograph **is** the fallback, and the best
 * possible one.
 *
 * ## What the colour of the points owes to the image, and the background to the theme
 *
 * Each point takes the colour of its cell: the hues come from the photograph,
 * not from the palette. What comes from the palette is the background of the
 * canvas — without it, the scene would stand out against black in the middle
 * of a light page. It is read again on every theme switch, without rebuilding
 * the scene.
 *
 * ## Reading the pixels can fail
 *
 * An image from another domain without an authorisation header taints the
 * canvas and the read throws. The points then stay at zero, invisible, and the
 * photograph stays displayed underneath.
 *
 * @module
 */

import {
  mergePresentation,
  readTokenColour,
  useMotionState,
  type Customisable,
  type QualityLevel,
} from '@odoro-cli/engine'
import { useScene, type SceneContext } from '@odoro-cli/engine/three'
import { useEffect, useRef, useState, type ReactElement } from 'react'

import { usePointerDamped } from '@registre/hooks/usePointerDamped'

import {
  IMAGE_PARTICLES_FRAGMENT,
  IMAGE_PARTICLES_VERTEX,
} from './image-particles.shader.js'

/** Share of the requested density kept at each quality step. */
const GRADE: Readonly<Record<QualityLevel, number>> = {
  low: 0.55,
  medium: 0.78,
  high: 1,
}

/** Half-height of the plane, in scene units. The rest follows from it. */
const HALF = 1

/** What a sampling produces: one place and one colour per cell. */
interface Sample {
  readonly positions: Float32Array
  readonly tints: Float32Array
}

/** Properties specific to the component. */
export interface ImageParticlesOwnProps {
  /** Source of the image. */
  src: string
  /** Alternative text. Empty string if the image is purely decorative. */
  alt: string
  /** Width to height ratio of the frame. @defaultValue 1.777 */
  ratio?: number
  /**
   * Number of points across the width, before reduction by the quality.
   *
   * Capped at two hundred and twenty: beyond that, each point weighs less than
   * a pixel and the image becomes an image again, only more expensive.
   *
   * @defaultValue 140
   */
  density?: number
  /** Size of a point, in cells. Beyond one, the points touch. @defaultValue 1.1 */
  size?: number
  /** Scatter distance at the start, in scene units. @defaultValue 0.7 */
  scatter?: number
  /** Duration of the gathering, in milliseconds. @defaultValue 1600 */
  duration?: number
  /** Speed of the breathing, once the image is formed. @defaultValue 0.6 */
  speed?: number
  /** Tilt of the cloud under the pointer. Zero freezes it. @defaultValue 0.16 */
  parallax?: number
  /** Token whose colour paints the background of the scene. */
  background?: string
}

/** All properties: its own, plus those of an image. */
export type ImageParticlesProps = Customisable<ImageParticlesOwnProps, 'img'>

/**
 * Renders an image as a cloud of coloured points.
 *
 * @example
 * <ImageParticles src="/portrait.jpg" alt="Portrait of the team" />
 *
 * @example
 * // Coarser, wide scatter, slow gathering.
 * <ImageParticles
 *   src="/portrait.jpg"
 *   alt=""
 *   density={90}
 *   scatter={1.4}
 *   duration={2600}
 * />
 */
export function ImageParticles({
  src,
  alt,
  ratio = 1.777,
  density = 140,
  size = 1.1,
  scatter = 0.7,
  duration = 1600,
  speed = 0.6,
  parallax = 0.16,
  background = '--o-theme-bg',
  ...rest
}: ImageParticlesProps): ReactElement {
  const { quality, theme } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)

  const pointer = usePointerDamped({
    host,
    speed: 2.5,
    name: 'image in particles : pointer',
  })

  const cols = Math.round(Math.min(220, Math.max(24, density * GRADE[quality])))
  const rows = Math.max(2, Math.round(cols / Math.max(ratio, 0.1)))
  const count = cols * rows

  /** Sample ready to be poured into the geometry, or nothing. */
  const sample = useRef<Sample | null>(null)
  /** Pours the sample into the attributes. Exists as soon as the scene is there. */
  const pour = useRef<((data: Sample) => void) | null>(null)
  /** Progress of the gathering, from zero to one. */
  const assembly = useRef(0)
  /** Live uniforms: changing them changes the rendering on the next frame. */
  const uniforms = useRef<Record<string, { value: number }>>({})
  const context = useRef<SceneContext | null>(null)

  // The sampling is independent of the scene: it can finish before the scene
  // exists — the renderer weighs more than an image — or after. The ref serves
  // as the meeting point between the two.
  useEffect(() => {
    if (typeof document === 'undefined') return

    let cancelled = false
    const source = new Image()
    // See the header: without this attribute, an image from another domain
    // taints the canvas and the read throws.
    source.crossOrigin = 'anonymous'
    source.decoding = 'async'

    const read = (): void => {
      if (cancelled) return

      try {
        const canvas = document.createElement('canvas')
        canvas.width = cols
        canvas.height = rows
        const paint = canvas.getContext('2d')
        if (paint === null) return

        // "Cover" framing: the part of the image that fills the grid without
        // distorting it, exactly like the `img` element laid underneath.
        const nw = source.naturalWidth
        const nh = source.naturalHeight
        if (nw === 0 || nh === 0) return
        const scale = Math.max(cols / nw, rows / nh)
        const sw = cols / scale
        const sh = rows / scale
        paint.drawImage(source, (nw - sw) / 2, (nh - sh) / 2, sw, sh, 0, 0, cols, rows)

        const pixels = paint.getImageData(0, 0, cols, rows).data
        const positions = new Float32Array(count * 3)
        const tints = new Float32Array(count * 3)

        const width = HALF * 2 * ratio
        const height = HALF * 2

        for (let y = 0; y < rows; y += 1) {
          for (let x = 0; x < cols; x += 1) {
            const cell = y * cols + x
            const at = cell * 3
            const px = cell * 4

            // The centre of the cell, brought back to the frame of reference
            // of the scene: its vertical axis goes up, that of the image goes
            // down.
            positions[at] = ((x + 0.5) / cols) * width - width / 2
            positions[at + 1] = height / 2 - ((y + 0.5) / rows) * height
            positions[at + 2] = 0

            // The colours of the image are in sRGB, the scene works in linear:
            // without this conversion, the cloud comes out washed out.
            tints[at] = ((pixels[px] ?? 0) / 255) ** 2.2
            tints[at + 1] = ((pixels[px + 1] ?? 0) / 255) ** 2.2
            tints[at + 2] = ((pixels[px + 2] ?? 0) / 255) ** 2.2
          }
        }

        const data: Sample = { positions, tints }
        sample.current = data
        assembly.current = 0
        pour.current?.(data)
      } catch {
        // Tainted canvas: the photograph stays alone, with no cloud.
        sample.current = null
      }
    }

    source.addEventListener('load', read)
    source.src = src
    if (source.complete && source.naturalWidth > 0) read()

    return () => {
      cancelled = true
      source.removeEventListener('load', read)
    }
  }, [src, cols, rows, count, ratio])

  const { ref } = useScene({
    name: 'image in particles',
    setup: (scene) => {
      context.current = scene
      const { three, camera, renderer } = scene

      const ground = readTokenColour(background, host)
      renderer.setClearColor(
        new three.Color(
          ground?.[0] ?? 0.98,
          ground?.[1] ?? 0.98,
          ground?.[2] ?? 0.98,
        ).convertSRGBToLinear(),
        1,
      )

      const positions = new Float32Array(count * 3)
      const tints = new Float32Array(count * 3)
      const seeds = new Float32Array(count * 3)
      for (let index = 0; index < count * 3; index += 1) {
        seeds[index] = Math.random() * 2 - 1
      }

      const geometry = new three.BufferGeometry()
      geometry.setAttribute('position', new three.BufferAttribute(positions, 3))
      geometry.setAttribute('aTint', new three.BufferAttribute(tints, 3))
      geometry.setAttribute('aSeed', new three.BufferAttribute(seeds, 3))

      uniforms.current = {
        uTime: { value: 0 },
        uScatter: { value: Math.max(0, scatter) },
        uAssembly: { value: 0 },
        uCell: { value: ((HALF * 2) / rows) * Math.max(0.2, size) },
        uProjection: { value: 500 },
      }

      const points = new three.Points(
        geometry,
        new three.ShaderMaterial({
          vertexShader: IMAGE_PARTICLES_VERTEX,
          fragmentShader: IMAGE_PARTICLES_FRAGMENT,
          uniforms: uniforms.current,
        }),
      )
      // The places arrive after construction: a bounding sphere computed on
      // zeros would make the whole cloud disappear as soon as the camera
      // moves.
      points.frustumCulled = false

      const group = new three.Group()
      group.name = 'cloud'
      group.add(points)
      scene.scene.add(group)

      // The plane is two units tall: place the camera at that distance and it
      // occupies exactly the height of the field of view.
      camera.position.set(0, 0, HALF / Math.tan((45 * Math.PI) / 360))
      camera.lookAt(0, 0, 0)

      // The meeting point: if the sample is already there, it is poured right
      // away; otherwise, the read will call this function when it finishes.
      pour.current = (data) => {
        positions.set(data.positions)
        tints.set(data.tints)
        geometry.getAttribute('position').needsUpdate = true
        geometry.getAttribute('aTint').needsUpdate = true
      }
      if (sample.current !== null) pour.current(sample.current)

      return () => {
        pour.current = null
      }
    },

    frame: ({ scene, camera, renderer }, { time, delta }) => {
      const live = uniforms.current
      const clock = live['uTime']
      if (clock !== undefined) clock.value = time * Math.max(0, speed)

      // The size of a point is computed in buffer pixels: it depends on the
      // real height of the canvas and on the aperture of the camera.
      const projection = live['uProjection']
      if (projection !== undefined) {
        const height = renderer.domElement.height
        projection.value = height / (2 * Math.tan((camera.fov * Math.PI) / 360))
      }

      // The gathering only advances when there is something to gather, and
      // ends gently: a linear arrival would look like an abrupt stop.
      const state = live['uAssembly']
      if (state !== undefined && sample.current !== null && assembly.current < 1) {
        assembly.current = Math.min(
          1,
          assembly.current + (delta * 1000) / Math.max(120, duration),
        )
        const t = assembly.current
        state.value = 1 - (1 - t) ** 3
      }

      const group = scene.getObjectByName('cloud')
      if (group === undefined) return

      // "Cover" framing of the plane: if the frame is wider than the image,
      // the cloud grows to fill it rather than leaving bands.
      group.scale.setScalar(Math.max(1, camera.aspect / Math.max(ratio, 0.1)))

      if (parallax === 0) return
      const lean = pointer.current
      group.rotation.y += (lean.x * parallax - group.rotation.y) * delta * 3
      group.rotation.x += (lean.y * parallax * 0.6 - group.rotation.x) * delta * 3
    },
  })

  // The theme has switched: the background of the scene is read again, the
  // scene is not rebuilt.
  useEffect(() => {
    const scene = context.current
    if (scene === null) return
    const ground = readTokenColour(background, host)
    if (ground === undefined) return
    scene.renderer.setClearColor(
      new scene.three.Color(
        ground[0] ?? 0,
        ground[1] ?? 0,
        ground[2] ?? 0,
      ).convertSRGBToLinear(),
      1,
    )
  }, [theme, background, host])

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  return (
    <div className={className} style={{ ...style, aspectRatio: String(ratio) }}>
      <img
        loading="lazy"
        decoding="async"
        {...rest}
        src={src}
        alt={alt}
        className="o-absolute o-inset-0 o-size-full o-object-cover"
      />

      {/* The surface of the scene: laid over the photograph, decorative,
          opaque as soon as it renders. Without it, the photograph is all there
          is. */}
      <div
        aria-hidden
        ref={(element) => {
          setHost(element)
          ref.current = element
        }}
        className="o-absolute o-inset-0"
      />
    </div>
  )
}
