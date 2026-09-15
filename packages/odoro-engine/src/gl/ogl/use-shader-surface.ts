/**
 * Fullscreen effects in a fragment shader.
 *
 * ## Why this backend rather than the other
 *
 * The question to ask for every effect: **are a camera and lighting really
 * necessary?** An animated gradient, a noise field, a grid in perspective, a
 * distortion — no. All of this is computed per fragment, without geometry or
 * transformation. An animated background entrusted to a 3D scene engine costs
 * an order of magnitude more for a render that twelve kilobytes produce.
 *
 * This backend therefore exposes neither a scene nor a camera: a triangle
 * covering the screen and a fragment shader. What does not fit in that frame
 * belongs to the other backend.
 *
 * @module
 */

import { type RefObject, useEffect, useRef, useState } from 'react'

import { CLOCK_PRIORITY, clock } from '../../core/clock.js'
import { motionPolicy } from '../../core/motion-policy.js'
import { type RefusalReason, surfaceManager } from '../surface-manager.js'
import { FULLSCREEN_VERTEX } from './shaders.js'

/** Value accepted for a uniform. */
export type UniformValue = number | readonly number[]

/** Options of {@link useShaderSurface}. */
export interface ShaderSurfaceOptions {
  /** Source of the fragment shader. */
  fragment: string
  /**
   * Values passed to the shader. `uTime` and `uResolution` are provided as a
   * matter of course and do not have to be declared here.
   */
  uniforms?: Readonly<Record<string, UniformValue>>
  /**
   * Pixel density. `auto` deduces it from the display and from the quality
   * selected by the motion policy.
   *
   * @defaultValue 'auto'
   */
  dpr?: 'auto' | number
  /**
   * Suspends the render when the surface leaves the screen.
   *
   * @defaultValue true
   */
  pauseOffscreen?: boolean
  /** Name shown in the diagnostics panel. */
  name?: string
  /**
   * Renders a single frame then stops. Useful for a fixed pattern whose
   * composition alone depends on the shader.
   *
   * @defaultValue false
   */
  still?: boolean
}

/** State returned by {@link useShaderSurface}. */
export interface ShaderSurfaceHandle<T extends HTMLElement> {
  /** Ref to set on the host element of the canvas. */
  readonly ref: RefObject<T | null>
  /** `true` once the surface is ready and the first frame is rendered. */
  readonly ready: boolean
  /**
   * Reason for the refusal, if there is one. Its presence means that the
   * caller must display its static fallback.
   */
  readonly refused: RefusalReason | 'reduced-motion' | undefined
}

/** Pixel density caps per quality level. */
const DPR_CAP: Readonly<Record<'low' | 'medium' | 'high', number>> = {
  low: 1,
  medium: 1.5,
  high: 2,
}

/**
 * Renders a fullscreen effect into an arbitrated surface.
 *
 * The rendering goes through the single loop of the engine: no animation loop
 * is opened here, and the low priority guarantees that the frame is produced
 * after every update of the frame.
 *
 * @example
 * const { ref, refused } = useShaderSurface({
 *   fragment: AURORA_FRAGMENT,
 *   uniforms: { uColorA: [0.1, 0.2, 0.9], uSpeed: 0.4, uScale: 3, uOctaves: 4 },
 *   name: 'aurora',
 * })
 *
 * if (refused !== undefined) return <Poster />
 * return <div ref={ref} className="o-absolute o-inset-0" />
 */
export function useShaderSurface<T extends HTMLElement = HTMLDivElement>(
  options: ShaderSurfaceOptions,
): ShaderSurfaceHandle<T> {
  const {
    fragment,
    uniforms,
    dpr = 'auto',
    pauseOffscreen = true,
    name = 'surface',
    still = false,
  } = options

  const ref = useRef<T | null>(null)
  const uniformsRef = useRef(uniforms)
  uniformsRef.current = uniforms

  const [ready, setReady] = useState(false)
  const [refused, setRefused] = useState<ShaderSurfaceHandle<T>['refused']>(undefined)

  useEffect(() => {
    const host = ref.current
    if (host === null) return

    const state = motionPolicy.state
    if (state.reduced) {
      // An animated background has no final state to preserve: it brings
      // nothing other than its motion. It is therefore not rendered at all, and
      // the caller displays its fallback.
      setRefused('reduced-motion')
      return
    }

    const result = surfaceManager.acquire({ backend: 'ogl', name, host })
    if (!result.ok) {
      setRefused(result.reason)
      return
    }

    const { surface } = result
    let disposed = false
    let subscription: ReturnType<typeof clock.subscribe> | undefined
    let observer: ResizeObserver | undefined
    let visibility: IntersectionObserver | undefined
    let dispose: (() => void) | undefined

    void import('ogl')
      .then(({ Renderer, Program, Mesh, Triangle }) => {
        if (disposed) return

        const cap = DPR_CAP[state.quality]
        const density =
          dpr === 'auto'
            ? Math.min(window.devicePixelRatio || 1, cap)
            : Math.min(dpr, cap)

        const renderer = new Renderer({
          canvas: surface.canvas,
          dpr: density,
          alpha: false,
        })
        const gl = renderer.gl

        // `fwidth` requires WebGL 2, or the corresponding extension in WebGL 1:
        // without this declaration, the shader does not compile on older
        // platforms and the effect disappears without a message.
        const isWebgl2 =
          'drawBuffers' in gl && typeof WebGL2RenderingContext !== 'undefined'
        const source =
          isWebgl2 || !fragment.includes('fwidth')
            ? fragment
            : `#extension GL_OES_standard_derivatives : enable\n${fragment}`

        const declared: Record<string, { value: UniformValue }> = {
          uTime: { value: 0 },
          uResolution: { value: [1, 1] },
        }
        for (const [key, value] of Object.entries(uniformsRef.current ?? {})) {
          declared[key] = { value }
        }

        const geometry = new Triangle(gl)
        const program = new Program(gl, {
          vertex: FULLSCREEN_VERTEX,
          fragment: source,
          uniforms: declared,
        })
        const mesh = new Mesh(gl, { geometry, program })

        const resize = (): void => {
          const width = host.clientWidth || 1
          const height = host.clientHeight || 1
          renderer.setSize(width, height)
          declared['uResolution'] = { value: [gl.canvas.width, gl.canvas.height] }
          program.uniforms['uResolution'] = declared['uResolution']
        }

        resize()
        observer = new ResizeObserver(resize)
        observer.observe(host)

        const draw = (time: number): void => {
          program.uniforms['uTime'] = { value: time }
          // The values supplied by the caller are read again on every frame:
          // changing a prop is enough to modify the render, without remounting.
          for (const [key, value] of Object.entries(uniformsRef.current ?? {})) {
            program.uniforms[key] = { value }
          }
          renderer.render({ scene: mesh })
        }

        draw(0)
        setReady(true)

        if (!still) {
          subscription = clock.subscribe(({ time }) => draw(time), {
            priority: CLOCK_PRIORITY.render,
            name,
          })

          if (pauseOffscreen && typeof IntersectionObserver !== 'undefined') {
            visibility = new IntersectionObserver((entries) => {
              const visible = entries[0]?.isIntersecting ?? true
              // The subscription is suspended, not removed: it keeps its place
              // in the order of the frame and its state.
              subscription?.setActive(visible)
            })
            visibility.observe(host)
          }
        }

        dispose = () => {
          // Every graphics resource must be released explicitly: nothing is
          // freed automatically, and an oversight is paid for in memory that
          // never comes back down.
          geometry.remove()
          program.remove()
          const lose = gl.getExtension('WEBGL_lose_context') as {
            loseContext?: () => void
          } | null
          lose?.loseContext?.()
        }
      })
      .catch((cause: unknown) => {
        console.error(`[odoro] surface "${name}": could not be loaded`, cause)
        setRefused('webgl-unavailable')
      })

    return () => {
      disposed = true
      subscription?.unsubscribe()
      observer?.disconnect()
      visibility?.disconnect()
      dispose?.()
      surface.release()
      setReady(false)
    }
    // `uniforms` is read again through the ref on every frame: comparing it by
    // identity would rebuild the surface on every render.
  }, [fragment, dpr, pauseOffscreen, name, still])

  return { ref, ready, refused }
}
