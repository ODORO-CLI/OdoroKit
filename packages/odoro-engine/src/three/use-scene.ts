/**
 * 3D scenes.
 *
 * ## The weight, and why it drives the design
 *
 * The 3D scene engine weighs between 120 and 140 kilobytes compressed, most of
 * it in its renderer — which does not tree-shake. That is an order of
 * magnitude above the light backend.
 *
 * It therefore **never** enters the initial bundle. The
 * `@odoro-cli/engine/three` entry is a split point, and the engine itself is
 * only loaded inside this hook, by dynamic import. A site that only shows a
 * text animation does not download a single line of it. This is not an
 * optimisation to be done later: it is what dictates the architecture of this
 * file.
 *
 * ## Consequence for the caller
 *
 * The fallback is displayed **first**, the scene mounts afterwards. There is
 * no moment at which the screen is empty while waiting for the download.
 *
 * @module
 */

import { type RefObject, useEffect, useRef, useState } from 'react'
import type * as ThreeModule from 'three'
import type { PerspectiveCamera, Scene, WebGLRenderer, WebGLRenderTarget } from 'three'

import { CLOCK_PRIORITY, clock } from '../core/clock.js'
import { type QualityLevel, motionPolicy } from '../core/motion-policy.js'
import { type RefusalReason, surfaceManager } from '../gl/surface-manager.js'
import { disposeScene } from './dispose.js'

/** What the scene setup receives. */
export interface SceneContext {
  /** Scene to populate. */
  readonly scene: Scene
  /** Camera, already placed and pointed at the origin. */
  readonly camera: PerspectiveCamera
  /** Renderer. */
  readonly renderer: WebGLRenderer
  /** Complete module, to build geometries and materials. */
  readonly three: typeof ThreeModule
  /** Quality selected on mount. */
  readonly quality: QualityLevel
  /**
   * Render targets to release on unmount. Register here every target created
   * in the setup: they are not reachable by walking the scene.
   */
  readonly targets: WebGLRenderTarget[]
}

/** What the per-frame update receives. */
export interface SceneFrame {
  /** Time elapsed since startup, in seconds. */
  readonly time: number
  /** Duration of the previous frame, in seconds, smoothed. */
  readonly delta: number
  /** Real duration of the previous frame, in seconds. */
  readonly deltaRaw: number
}

/** Options of {@link useScene}. */
export interface SceneOptions {
  /** Builds the content of the scene. */
  setup: (context: SceneContext) => void | (() => void)
  /** Updates the scene on every frame. */
  frame?: (context: SceneContext, frame: SceneFrame) => void
  /** Suspends the render when the surface leaves the screen. @defaultValue true */
  pauseOffscreen?: boolean
  /** Name shown in the diagnostics panel. */
  name?: string
}

/** State returned by {@link useScene}. */
export interface SceneHandle<T extends HTMLElement> {
  /** Ref to set on the host element of the canvas. */
  readonly ref: RefObject<T | null>
  /** `true` once the scene is built and the first frame is rendered. */
  readonly ready: boolean
  /**
   * Reason for the refusal, if there is one. Its presence means that the
   * fallback must stay displayed.
   */
  readonly refused: RefusalReason | 'reduced-motion' | undefined
}

/** Pixel density caps per quality level. */
const DPR_CAP: Readonly<Record<QualityLevel, number>> = { low: 1, medium: 1.5, high: 2 }

/**
 * Mounts a 3D scene into an arbitrated surface.
 *
 * @example
 * const { ref, refused } = useScene({
 *   name: 'molten',
 *   setup: ({ scene, three, camera }) => {
 *     const mesh = new three.Mesh(
 *       new three.IcosahedronGeometry(1, 32),
 *       new three.MeshStandardMaterial({ metalness: 1, roughness: 0.2 }),
 *     )
 *     scene.add(mesh, new three.DirectionalLight(0xffffff, 2))
 *     camera.position.z = 3
 *   },
 *   frame: ({ scene }, { time }) => {
 *     scene.rotation.y = time * 0.2
 *   },
 * })
 *
 * if (refused !== undefined) return <Poster />
 * return <div ref={ref} className="o-absolute o-inset-0" />
 */
export function useScene<T extends HTMLElement = HTMLDivElement>(
  options: SceneOptions,
): SceneHandle<T> {
  const { setup, frame, pauseOffscreen = true, name = 'scene' } = options

  const ref = useRef<T | null>(null)
  const setupRef = useRef(setup)
  const frameRef = useRef(frame)
  setupRef.current = setup
  frameRef.current = frame

  const [ready, setReady] = useState(false)
  const [refused, setRefused] = useState<SceneHandle<T>['refused']>(undefined)

  useEffect(() => {
    const host = ref.current
    if (host === null) return

    const state = motionPolicy.state
    if (state.reduced) {
      setRefused('reduced-motion')
      return
    }

    const result = surfaceManager.acquire({ backend: 'three', name, host })
    if (!result.ok) {
      setRefused(result.reason)
      return
    }

    const { surface } = result
    let disposed = false
    let teardown: (() => void) | undefined

    void import('three')
      .then((three) => {
        if (disposed) return

        const cap = DPR_CAP[state.quality]
        const renderer = new three.WebGLRenderer({
          canvas: surface.canvas,
          antialias: state.quality === 'high',
          alpha: false,
          powerPreference: state.quality === 'low' ? 'low-power' : 'high-performance',
        })
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, cap))
        // Explicit colour space and tone mapping: their default values have
        // changed from one version to the next, and relying on them would make
        // the appearance depend on the installed version.
        renderer.outputColorSpace = three.SRGBColorSpace
        renderer.toneMapping = three.ACESFilmicToneMapping

        const scene = new three.Scene()
        const camera = new three.PerspectiveCamera(45, 1, 0.1, 100)
        camera.position.set(0, 0, 5)
        camera.lookAt(0, 0, 0)

        const targets: WebGLRenderTarget[] = []
        const context: SceneContext = {
          scene,
          camera,
          renderer,
          three,
          quality: state.quality,
          targets,
        }

        const custom = setupRef.current(context)

        const resize = (): void => {
          const width = host.clientWidth || 1
          const height = host.clientHeight || 1
          renderer.setSize(width, height, false)
          camera.aspect = width / height
          camera.updateProjectionMatrix()
        }

        resize()
        // The debounce is handled by the loop: the resize only marks, the next
        // frame applies.
        let pendingResize = false
        const observer = new ResizeObserver(() => {
          pendingResize = true
        })
        observer.observe(host)

        const subscription = clock.subscribe(
          ({ time, delta, deltaRaw }) => {
            if (pendingResize) {
              pendingResize = false
              resize()
            }
            frameRef.current?.(context, { time, delta, deltaRaw })
            renderer.render(scene, camera)
          },
          { priority: CLOCK_PRIORITY.render, name },
        )

        renderer.render(scene, camera)
        setReady(true)

        let visibility: IntersectionObserver | undefined
        if (pauseOffscreen && typeof IntersectionObserver !== 'undefined') {
          visibility = new IntersectionObserver((entries) => {
            subscription.setActive(entries[0]?.isIntersecting ?? true)
          })
          visibility.observe(host)
        }

        teardown = () => {
          subscription.unsubscribe()
          observer.disconnect()
          visibility?.disconnect()
          custom?.()
          disposeScene({ scene, renderer, targets })
        }
      })
      .catch((cause: unknown) => {
        console.error(`[odoro] scene "${name}": could not be loaded`, cause)
        setRefused('webgl-unavailable')
      })

    return () => {
      disposed = true
      teardown?.()
      surface.release()
      setReady(false)
    }
    // `setup` and `frame` are read through refs: comparing them by identity
    // would rebuild the whole scene on every render.
  }, [name, pauseOffscreen])

  return { ref, ready, refused }
}
