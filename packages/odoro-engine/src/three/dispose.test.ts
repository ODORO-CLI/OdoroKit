import type { Material, Object3D, Texture, WebGLRenderer, WebGLRenderTarget } from 'three'
import { describe, expect, it, vi } from 'vitest'

import { disposeObject, disposeScene } from './dispose.js'

/**
 * Texture stub.
 *
 * Recognition is done by signature — a release method, an image, a wrap mode —
 * rather than by class name: the names change from one version to the next,
 * the shape does not.
 */
function fakeTexture(): Texture & { dispose: ReturnType<typeof vi.fn> } {
  return {
    dispose: vi.fn(),
    image: {},
    wrapS: 1000,
  } as unknown as Texture & { dispose: ReturnType<typeof vi.fn> }
}

/** Material stub, carrying the textures it is given. */
function fakeMaterial(
  textures: Record<string, Texture> = {},
): Material & { dispose: ReturnType<typeof vi.fn> } {
  return {
    dispose: vi.fn(),
    ...textures,
  } as unknown as Material & { dispose: ReturnType<typeof vi.fn> }
}

/** 3D object stub, with a minimal tree walk. */
function fakeObject(options: {
  geometry?: { dispose: ReturnType<typeof vi.fn> }
  material?: Material | Material[]
  children?: Object3D[]
}): Object3D {
  const children = options.children ?? []
  const self = {
    geometry: options.geometry,
    material: options.material,
    children,
    clear: vi.fn(),
    traverse(visit: (object: Object3D) => void) {
      visit(self as unknown as Object3D)
      for (const child of children) child.traverse(visit)
    },
  }
  return self as unknown as Object3D
}

describe('disposeObject', () => {
  it('releases geometry, material and textures', () => {
    const geometry = { dispose: vi.fn() }
    const map = fakeTexture()
    const material = fakeMaterial({ map })

    const report = disposeObject(fakeObject({ geometry, material }))

    expect(geometry.dispose).toHaveBeenCalledTimes(1)
    expect(material.dispose).toHaveBeenCalledTimes(1)
    expect(map.dispose).toHaveBeenCalledTimes(1)
    expect(report).toMatchObject({ geometries: 1, materials: 1, textures: 1 })
  })

  it('finds the textures whatever the name of their property', () => {
    // The names vary from one material to the next and from one version to the
    // next: keeping the list would amount to forgetting to keep it up to date.
    const textures = {
      map: fakeTexture(),
      normalMap: fakeTexture(),
      envMap: fakeTexture(),
      aTextureWithAnUnexpectedName: fakeTexture(),
    }
    const material = fakeMaterial(textures)

    const report = disposeObject(fakeObject({ material }))

    for (const texture of Object.values(textures)) {
      expect(texture.dispose).toHaveBeenCalledTimes(1)
    }
    expect(report.textures).toBe(4)
  })

  it('descends into the whole tree', () => {
    const child = { dispose: vi.fn() }
    const grandChild = { dispose: vi.fn() }

    const report = disposeObject(
      fakeObject({
        children: [
          fakeObject({
            geometry: child,
            children: [fakeObject({ geometry: grandChild })],
          }),
        ],
      }),
    )

    expect(child.dispose).toHaveBeenCalled()
    expect(grandChild.dispose).toHaveBeenCalled()
    expect(report.geometries).toBe(2)
  })

  it('releases an array of materials', () => {
    const first = fakeMaterial()
    const second = fakeMaterial()

    const report = disposeObject(fakeObject({ material: [first, second] }))

    expect(first.dispose).toHaveBeenCalled()
    expect(second.dispose).toHaveBeenCalled()
    expect(report.materials).toBe(2)
  })

  it('releases a shared resource only once', () => {
    // A material reused by fifty instances must not be released fifty times:
    // the warnings that would result would mask real anomalies.
    const shared = fakeMaterial({ map: fakeTexture() })
    const geometry = { dispose: vi.fn() }

    const report = disposeObject(
      fakeObject({
        geometry,
        material: shared,
        children: [
          fakeObject({ geometry, material: shared }),
          fakeObject({ geometry, material: shared }),
        ],
      }),
    )

    expect(shared.dispose).toHaveBeenCalledTimes(1)
    expect(geometry.dispose).toHaveBeenCalledTimes(1)
    expect(report).toMatchObject({ geometries: 1, materials: 1, textures: 1 })
  })

  it('detaches the content after the walk', () => {
    const root = fakeObject({})
    disposeObject(root)
    expect(
      (root as unknown as { clear: ReturnType<typeof vi.fn> }).clear,
    ).toHaveBeenCalled()
  })

  it('tolerates an object without resources', () => {
    expect(() => disposeObject(fakeObject({}))).not.toThrow()
  })
})

describe('disposeScene', () => {
  it('releases the render targets, invisible to the scene walk', () => {
    const target = { dispose: vi.fn() } as unknown as WebGLRenderTarget

    const report = disposeScene({ scene: fakeObject({}), targets: [target] })

    expect(target.dispose).toHaveBeenCalledTimes(1)
    expect(report.renderTargets).toBe(1)
  })

  it('gives the context slot back to the browser', () => {
    // Without this, the slot stays occupied until the canvas is collected, and
    // a page that mounts several scenes exhausts the quota — the browser then
    // silently losing the oldest one.
    const renderer = {
      dispose: vi.fn(),
      forceContextLoss: vi.fn(),
    } as unknown as WebGLRenderer

    disposeScene({ scene: fakeObject({}), renderer })

    expect(renderer.dispose).toHaveBeenCalledTimes(1)
    expect(renderer.forceContextLoss).toHaveBeenCalledTimes(1)
  })

  it('leaves nothing alive after a hundred cycles', () => {
    let released = 0

    for (let i = 0; i < 100; i += 1) {
      const geometry = {
        dispose: vi.fn(() => {
          released += 1
        }),
      }
      disposeScene({ scene: fakeObject({ geometry, material: fakeMaterial() }) })
    }

    expect(released).toBe(100)
  })
})
