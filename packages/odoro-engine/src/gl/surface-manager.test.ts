import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { registry } from '../core/registry.js'
import { surfaceManager } from './surface-manager.js'

/**
 * Installs a fake WebGL context.
 *
 * jsdom implements no graphics context: without this stub, the arbiter would
 * refuse every allocation and we would only be testing its failure path.
 */
function installWebGl(available = true): void {
  HTMLCanvasElement.prototype.getContext = vi.fn(function (
    this: HTMLCanvasElement,
    type: string,
  ) {
    if (!available) return null
    if (type !== 'webgl2' && type !== 'webgl') return null
    return {
      canvas: this,
      getExtension: () => ({ loseContext: () => undefined }),
    } as unknown as WebGLRenderingContext
  }) as unknown as HTMLCanvasElement['getContext']
}

let host: HTMLElement

beforeEach(() => {
  installWebGl(true)
  host = document.createElement('div')
  document.body.appendChild(host)
})

afterEach(() => {
  surfaceManager.reset()
  registry.disposeAll()
  host.remove()
})

describe('allocation', () => {
  it('allocates a surface and inserts its canvas', () => {
    const result = surfaceManager.acquire({ backend: 'ogl', name: 'aurora', host })

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.surface.backend).toBe('ogl')
    expect(result.surface.alive).toBe(true)
    expect(host.querySelector('canvas')).toBe(result.surface.canvas)
    expect(result.surface.canvas.dataset['odoroSurface']).toBe('ogl')
  })

  it('records the surface in the inventory', () => {
    surfaceManager.acquire({ backend: 'ogl', name: 'aurora', host })
    expect(registry.count('surface')).toBe(1)
    expect(registry.list('surface')[0]?.detail).toMatchObject({ backend: 'ogl' })
  })

  it('gives a distinct canvas to each backend', () => {
    // Two libraries each assume they are the sole master of the state machine:
    // sharing a context produces non-deterministic faults.
    const ogl = surfaceManager.acquire({ backend: 'ogl', name: 'background', host })
    const three = surfaceManager.acquire({ backend: 'three', name: 'hero', host })

    expect(ogl.ok && three.ok).toBe(true)
    if (!ogl.ok || !three.ok) return
    expect(ogl.surface.canvas).not.toBe(three.surface.canvas)
  })
})

describe('caps', () => {
  it('refuses a second surface of the same library', () => {
    surfaceManager.acquire({ backend: 'ogl', name: 'first', host })
    const second = surfaceManager.acquire({ backend: 'ogl', name: 'second', host })

    expect(second.ok).toBe(false)
    if (second.ok) return
    expect(second.reason).toBe('max-per-backend')
    // A refusal is an actionable answer: the caller displays its fallback.
    expect(second.message).toMatch(/only one/i)
  })

  it('refuses beyond the global cap', () => {
    surfaceManager.configure({ max: 1, maxPerBackend: 1 })
    surfaceManager.acquire({ backend: 'ogl', name: 'first', host })

    const second = surfaceManager.acquire({ backend: 'three', name: 'second', host })

    expect(second.ok).toBe(false)
    if (second.ok) return
    expect(second.reason).toBe('max-surfaces')
  })

  it('frees a slot on release', () => {
    const first = surfaceManager.acquire({ backend: 'ogl', name: 'first', host })
    expect(first.ok).toBe(true)
    if (!first.ok) return

    first.surface.release()

    const second = surfaceManager.acquire({ backend: 'ogl', name: 'second', host })
    expect(second.ok).toBe(true)
  })

  it('accepts a higher cap', () => {
    surfaceManager.configure({ max: 4, maxPerBackend: 2 })
    expect(surfaceManager.acquire({ backend: 'ogl', name: 'a', host }).ok).toBe(true)
    expect(surfaceManager.acquire({ backend: 'ogl', name: 'b', host }).ok).toBe(true)
    expect(surfaceManager.acquire({ backend: 'ogl', name: 'c', host }).ok).toBe(false)
  })

  it('exposes its capacity', () => {
    surfaceManager.configure({ max: 3, maxPerBackend: 2 })
    expect(surfaceManager.capacity).toEqual({ max: 3, maxPerBackend: 2 })
  })

  it('never goes below one surface', () => {
    surfaceManager.configure({ max: 0, maxPerBackend: 0 })
    expect(surfaceManager.capacity).toEqual({ max: 1, maxPerBackend: 1 })
  })
})

describe('absence of WebGL', () => {
  it('refuses cleanly rather than failing', () => {
    installWebGl(false)
    const result = surfaceManager.acquire({ backend: 'ogl', name: 'aurora', host })

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.reason).toBe('webgl-unavailable')
    // No dead canvas must be left in the document.
    expect(host.querySelector('canvas')).toBeNull()
  })
})

describe('context loss', () => {
  it('reports the loss and prevents the default behaviour', () => {
    const onLost = vi.fn()
    const result = surfaceManager.acquire({
      backend: 'ogl',
      name: 'aurora',
      host,
      onLost,
    })
    expect(result.ok).toBe(true)
    if (!result.ok) return

    const event = new Event('webglcontextlost', { cancelable: true })
    result.surface.canvas.dispatchEvent(event)

    // Without `preventDefault`, the browser will never emit the restoration.
    expect(event.defaultPrevented).toBe(true)
    expect(onLost).toHaveBeenCalledTimes(1)
    expect(result.surface.alive).toBe(false)
  })

  it('reports the restoration', () => {
    const onRestored = vi.fn()
    const result = surfaceManager.acquire({
      backend: 'ogl',
      name: 'aurora',
      host,
      onRestored,
    })
    if (!result.ok) return

    result.surface.canvas.dispatchEvent(
      new Event('webglcontextlost', { cancelable: true }),
    )
    result.surface.canvas.dispatchEvent(new Event('webglcontextrestored'))

    expect(onRestored).toHaveBeenCalledTimes(1)
    expect(result.surface.alive).toBe(true)
  })

  it('reflects the state in the inventory', () => {
    const result = surfaceManager.acquire({ backend: 'ogl', name: 'aurora', host })
    if (!result.ok) return

    result.surface.canvas.dispatchEvent(
      new Event('webglcontextlost', { cancelable: true }),
    )
    expect(registry.list('surface')[0]?.detail).toMatchObject({ state: 'lost' })
  })
})

describe('release', () => {
  it('removes the canvas and the inventory entry', () => {
    const result = surfaceManager.acquire({ backend: 'ogl', name: 'aurora', host })
    if (!result.ok) return

    result.surface.release()

    expect(host.querySelector('canvas')).toBeNull()
    expect(surfaceManager.count()).toBe(0)
    expect(registry.count('surface')).toBe(0)
  })

  it('tolerates a repeated release', () => {
    const result = surfaceManager.acquire({ backend: 'ogl', name: 'aurora', host })
    if (!result.ok) return

    result.surface.release()
    expect(() => result.surface.release()).not.toThrow()
    expect(surfaceManager.count()).toBe(0)
  })

  it('releases everything and returns the count', () => {
    surfaceManager.configure({ max: 4, maxPerBackend: 2 })
    surfaceManager.acquire({ backend: 'ogl', name: 'a', host })
    surfaceManager.acquire({ backend: 'three', name: 'b', host })

    expect(surfaceManager.releaseAll()).toBe(2)
    expect(surfaceManager.count()).toBe(0)
    expect(host.querySelectorAll('canvas').length).toBe(0)
  })

  it('leaves no surface after a hundred cycles', () => {
    // A context slot that is not given back is lost for the whole page: it is
    // the most expensive leak of all.
    for (let i = 0; i < 100; i += 1) {
      const result = surfaceManager.acquire({ backend: 'ogl', name: `cycle-${i}`, host })
      expect(result.ok).toBe(true)
      if (result.ok) result.surface.release()
    }

    expect(surfaceManager.count()).toBe(0)
    expect(registry.count('surface')).toBe(0)
    expect(document.querySelectorAll('canvas').length).toBe(0)
  })
})
