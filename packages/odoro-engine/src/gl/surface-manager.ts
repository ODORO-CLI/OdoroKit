/**
 * Arbitration of graphics contexts.
 *
 * ## Why an arbiter
 *
 * A browser caps the number of simultaneous WebGL contexts — often sixteen on
 * desktop, far fewer on mobile. Beyond that, it raises no error: it **silently
 * loses the oldest one**. A page that opens one surface per component
 * therefore ends up watching its first effect turn into a black rectangle,
 * without the slightest message, and generally at the user's end rather than
 * in development.
 *
 * Allocation therefore goes through a single point, which refuses rather than
 * letting the page degrade on its own. A refusal is an actionable answer: the
 * caller displays its static fallback.
 *
 * ## Never a context shared between backends
 *
 * Technically, two libraries can drive the same context. In practice, each
 * assumes it is the sole master of the state machine — blend functions, depth
 * test, bound buffer, active program. The resulting faults are
 * non-deterministic and impossible to isolate. Every surface therefore owns
 * its own canvas, and two surfaces of different backends never meet.
 *
 * ## Context loss
 *
 * A sleep, a graphics card switch or memory pressure are enough to lose a
 * context. Untreated, the hero becomes a black rectangle on wake-up — a fault
 * you only discover in production. The event is therefore intercepted, the
 * animation suspended, and the restoration reported to the caller so that it
 * rebuilds its resources.
 *
 * @module
 */

import { registry } from '../core/registry.js'

/** Library driving a surface. */
export type SurfaceBackend = 'ogl' | 'three'

/** Reason for an allocation refusal. */
export type RefusalReason =
  'max-surfaces' | 'max-per-backend' | 'webgl-unavailable' | 'outside-browser'

/** Allocation request. */
export interface SurfaceRequest {
  /** Library that will drive the surface. */
  backend: SurfaceBackend
  /** Name shown in the diagnostics panel. */
  name: string
  /** Host element, into which the canvas is inserted. */
  host: HTMLElement
  /**
   * Called when the context is lost. The caller must stop all rendering and
   * display its fallback.
   */
  onLost?: () => void
  /**
   * Called when the context is restored. The caller must rebuild its
   * resources: nothing that lived on the old context survived.
   */
  onRestored?: () => void
}

/** Allocated surface. */
export interface Surface {
  /** Canvas, already inserted into the host. */
  readonly canvas: HTMLCanvasElement
  /** Library that drives it. */
  readonly backend: SurfaceBackend
  /** Name given to the allocation. */
  readonly name: string
  /** `true` as long as the context is usable. */
  readonly alive: boolean
  /** Releases the surface and removes the canvas. */
  release(): void
}

/** What an allocation attempt returns. */
export type SurfaceResult =
  | { readonly ok: true; readonly surface: Surface }
  | { readonly ok: false; readonly reason: RefusalReason; readonly message: string }

/** Settings of the arbiter. */
export interface SurfaceManagerOptions {
  /** Total number of simultaneous surfaces. @defaultValue 2 */
  max?: number
  /**
   * Number of simultaneous surfaces per library.
   *
   * A single 3D render per page is the rule: the fullscreen effects of one
   * library compose within a single surface, in passes or in distinct
   * viewports.
   *
   * @defaultValue 1
   */
  maxPerBackend?: number
}

/** A live surface, on the arbiter side. */
interface Entry {
  surface: Surface
  backend: SurfaceBackend
  detach: () => void
}

/** Readable explanations of the refusals. */
const MESSAGES: Readonly<Record<RefusalReason, string>> = {
  'max-surfaces': 'The maximum number of graphics surfaces of the page is reached.',
  'max-per-backend':
    'A surface of this library is already open. Only one is allowed per page.',
  'webgl-unavailable': 'This browser exposes no usable WebGL context.',
  'outside-browser': 'No graphics surface can be allocated outside a browser.',
}

class SurfaceManager {
  private max = 2
  private maxPerBackend = 1
  private readonly entries = new Set<Entry>()

  /** Applies settings. */
  public configure(options: SurfaceManagerOptions): void {
    if (options.max !== undefined) this.max = Math.max(1, options.max)
    if (options.maxPerBackend !== undefined) {
      this.maxPerBackend = Math.max(1, options.maxPerBackend)
    }
  }

  /** Number of live surfaces, in total or for one library. */
  public count(backend?: SurfaceBackend): number {
    if (backend === undefined) return this.entries.size
    let total = 0
    for (const entry of this.entries) {
      if (entry.backend === backend) total += 1
    }
    return total
  }

  /** Live surfaces. */
  public list(): readonly Surface[] {
    return [...this.entries].map((entry) => entry.surface)
  }

  /** Current cap, exposed to the diagnostics panel. */
  public get capacity(): { max: number; maxPerBackend: number } {
    return { max: this.max, maxPerBackend: this.maxPerBackend }
  }

  /**
   * Checks that a WebGL context can be obtained.
   *
   * The probe canvas is released immediately: the only goal is to know whether
   * the platform answers, before committing to building a scene.
   */
  private supportsWebGl(): boolean {
    try {
      const probe = document.createElement('canvas')
      const context = probe.getContext('webgl2') ?? probe.getContext('webgl')
      // The probe context is released explicitly: letting it live would consume
      // one of the rare slots we are trying to preserve.
      const lose = context?.getExtension('WEBGL_lose_context') as {
        loseContext?: () => void
      } | null
      lose?.loseContext?.()
      return context !== null
    } catch {
      return false
    }
  }

  /**
   * Allocates a surface, or explains why it is refused.
   *
   * @example
   * const result = surfaceManager.acquire({ backend: 'ogl', name: 'aurora', host })
   * if (!result.ok) return <Poster />
   */
  public acquire(request: SurfaceRequest): SurfaceResult {
    if (typeof document === 'undefined') {
      return {
        ok: false,
        reason: 'outside-browser',
        message: MESSAGES['outside-browser'],
      }
    }

    if (this.count(request.backend) >= this.maxPerBackend) {
      return {
        ok: false,
        reason: 'max-per-backend',
        message: MESSAGES['max-per-backend'],
      }
    }

    if (this.entries.size >= this.max) {
      return { ok: false, reason: 'max-surfaces', message: MESSAGES['max-surfaces'] }
    }

    if (!this.supportsWebGl()) {
      return {
        ok: false,
        reason: 'webgl-unavailable',
        message: MESSAGES['webgl-unavailable'],
      }
    }

    const canvas = document.createElement('canvas')
    canvas.dataset['odoroSurface'] = request.backend
    canvas.style.display = 'block'
    canvas.style.width = '100%'
    canvas.style.height = '100%'
    request.host.appendChild(canvas)

    let alive = true

    const onLost = (event: Event): void => {
      // Without this, the browser will never emit the restoration event.
      event.preventDefault()
      alive = false
      handle.update({ state: 'lost' })
      request.onLost?.()
    }

    const onRestored = (): void => {
      alive = true
      handle.update({ state: 'alive' })
      request.onRestored?.()
    }

    canvas.addEventListener('webglcontextlost', onLost)
    canvas.addEventListener('webglcontextrestored', onRestored)

    const detach = (): void => {
      canvas.removeEventListener('webglcontextlost', onLost)
      canvas.removeEventListener('webglcontextrestored', onRestored)
      canvas.remove()
    }

    const surface: Surface = {
      canvas,
      backend: request.backend,
      name: request.name,
      get alive() {
        return alive
      },
      release: () => this.release(entry),
    }

    const entry: Entry = { surface, backend: request.backend, detach }

    const handle = registry.register({
      kind: 'surface',
      name: request.name,
      dispose: () => this.release(entry),
      detail: { backend: request.backend, state: 'alive' },
    })

    entry.detach = () => {
      handle.release()
      detach()
    }

    this.entries.add(entry)
    return { ok: true, surface }
  }

  /** Releases a surface. */
  private release(entry: Entry): void {
    if (!this.entries.has(entry)) return
    this.entries.delete(entry)
    entry.detach()
  }

  /**
   * Releases every surface.
   *
   * @returns The number of surfaces released.
   */
  public releaseAll(): number {
    const total = this.entries.size
    for (const entry of [...this.entries]) this.release(entry)
    return total
  }

  /**
   * Returns the arbiter to its initial state. Reserved for the tests.
   *
   * @internal
   */
  public reset(): void {
    this.releaseAll()
    this.max = 2
    this.maxPerBackend = 1
  }
}

/**
 * Arbiter of the page.
 *
 * @example
 * import { surfaceManager } from '@odoro-cli/engine'
 *
 * const result = surfaceManager.acquire({ backend: 'ogl', name: 'aurora', host })
 * if (result.ok) renderer.canvas = result.surface.canvas
 */
export const surfaceManager = new SurfaceManager()

/** Type of the arbiter, for the signatures that receive it. */
export type SurfaceManagerInstance = SurfaceManager
