/**
 * Releasing the resources of a 3D scene.
 *
 * ## Nothing is released automatically
 *
 * The JavaScript garbage collector ignores the memory of the graphics card. An
 * abandoned geometry, material, texture or render target keeps its buffers on
 * the driver side until the tab is closed.
 *
 * The symptom is not an error: it is a slow degradation. The first visit is
 * smooth, the tenth struggles, and nothing in the console explains it. It is
 * the leading cause of leaks in this kind of project, and the reason this
 * module exists separately — it must be readable, tested, and called without
 * exception.
 *
 * ## What is walked
 *
 * The whole tree of the scene, including the objects a model loader placed
 * there without us naming them. A material can carry a dozen textures under
 * different names: rather than keeping the list — which will change — each of
 * its properties is inspected and everything that looks like a texture is
 * released.
 *
 * @module
 */

import type { Material, Object3D, Texture, WebGLRenderer, WebGLRenderTarget } from 'three'

/** What was released, for the assertion of a leak test. */
export interface DisposalReport {
  /** Geometries released. */
  geometries: number
  /** Materials released. */
  materials: number
  /** Textures released. */
  textures: number
  /** Render targets released. */
  renderTargets: number
}

/** Anything that exposes a release method. */
interface Disposable {
  dispose: () => void
}

/** Recognises a releasable object. */
function isDisposable(value: unknown): value is Disposable {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Disposable).dispose === 'function'
  )
}

/** Recognises a texture, by its signature rather than by its class name. */
function isTexture(value: unknown): value is Texture {
  return (
    isDisposable(value) && 'image' in (value as object) && 'wrapS' in (value as object)
  )
}

/**
 * Releases a material and every texture it carries.
 *
 * @returns The number of textures released.
 */
export function disposeMaterial(material: Material, seen: Set<unknown>): number {
  let textures = 0

  // The names of the properties carrying a texture vary from one material to
  // the next and from one version to the next: we inspect rather than
  // enumerate.
  for (const value of Object.values(material as unknown as Record<string, unknown>)) {
    if (!isTexture(value) || seen.has(value)) continue
    seen.add(value)
    value.dispose()
    textures += 1
  }

  material.dispose()
  return textures
}

/**
 * Releases everything a tree of 3D objects holds.
 *
 * Resources shared between several objects are only released once: a material
 * reused by fifty instances must not be released fifty times, which would
 * produce warnings and would mask real anomalies.
 *
 * @example
 * const report = disposeObject(scene)
 * console.log(`${report.geometries} geometries released`)
 */
export function disposeObject(root: Object3D): DisposalReport {
  const report: DisposalReport = {
    geometries: 0,
    materials: 0,
    textures: 0,
    renderTargets: 0,
  }
  const seen = new Set<unknown>()

  root.traverse((object) => {
    const candidate = object as Object3D & {
      geometry?: Disposable
      material?: Material | Material[]
    }

    if (candidate.geometry !== undefined && !seen.has(candidate.geometry)) {
      seen.add(candidate.geometry)
      candidate.geometry.dispose()
      report.geometries += 1
    }

    const material = candidate.material
    if (material === undefined) return

    for (const entry of Array.isArray(material) ? material : [material]) {
      if (seen.has(entry)) continue
      seen.add(entry)
      report.textures += disposeMaterial(entry, seen)
      report.materials += 1
    }
  })

  // The content is detached afterwards: detaching during the walk would
  // interrupt it.
  root.clear()

  return report
}

/**
 * Releases a scene, its render targets and its renderer.
 *
 * `forceContextLoss` gives the context slot back to the browser. Without it,
 * the slot stays occupied until the canvas is collected, and a page that
 * mounts and unmounts several scenes ends up exhausting the quota — the
 * browser then silently losing the oldest one.
 *
 * @example
 * disposeScene({ scene, renderer, targets: [depthTarget] })
 */
export function disposeScene(input: {
  scene: Object3D
  renderer?: WebGLRenderer
  targets?: readonly WebGLRenderTarget[]
}): DisposalReport {
  const report = disposeObject(input.scene)

  for (const target of input.targets ?? []) {
    target.dispose()
    report.renderTargets += 1
  }

  if (input.renderer !== undefined) {
    input.renderer.dispose()
    input.renderer.forceContextLoss()
  }

  return report
}
