/**
 * What an install really costs.
 *
 * ## Why warn
 *
 * An install command normally shows nothing of the weight of what it brings.
 * That is of no consequence for a utility of a few kilobytes; it is one when a
 * single component adds a hundred and thirty compressed kilobytes to the first
 * load of the page.
 *
 * The figure is not there to deter. It is there so that the decision is taken
 * **before** the install rather than three weeks later in front of a
 * performance report, when the component is already integrated and removing it
 * costs a day.
 *
 * ## The figures
 *
 * They are measured, not estimated: a minimal scene — geometry, material,
 * light, render — built and compressed. A real project will exceed these
 * values, never the other way round; they are floors.
 *
 * @module
 */

import type { PublishedEntry } from '../registry/index.js'

/** Compressed weight of a backend, in kilobytes. */
export const BACKEND_WEIGHT = {
  /** Minimal 3D scene: geometry, standard material, directional light. */
  three: 130,
  /** Full-screen render: context, program, triangle. */
  ogl: 13,
} as const

/** A warning to show before writing. */
export interface WeightWarning {
  /** Backend concerned. */
  readonly backend: keyof typeof BACKEND_WEIGHT
  /** Compressed weight added, in kilobytes. */
  readonly kilobytes: number
  /** Entries that require it. */
  readonly entries: readonly string[]
  /** Complete sentence, ready to be shown. */
  readonly message: string
}

/**
 * Computes what a set of entries adds to the first load.
 *
 * A backend is only counted once, even when required by five components: it is
 * only loaded once. Counting a hundred and thirty kilobytes five times would be
 * a lie in the other direction, and a warning one learns to ignore is of no use
 * any more.
 *
 * @example
 * const warnings = weighEntries(entries)
 * for (const warning of warnings) log.warn(warning.message)
 */
export function weighEntries(entries: readonly PublishedEntry[]): WeightWarning[] {
  const byBackend = new Map<keyof typeof BACKEND_WEIGHT, string[]>()

  for (const entry of entries) {
    const backend = entry.perf.backend
    if (backend === false) continue
    const list = byBackend.get(backend) ?? []
    list.push(entry.id)
    byBackend.set(backend, list)
  }

  const warnings: WeightWarning[] = []
  for (const [backend, ids] of byBackend) {
    const kilobytes = BACKEND_WEIGHT[backend]
    const which = ids.length === 1 ? ids[0] : `${String(ids.length)} components`

    warnings.push({
      backend,
      kilobytes,
      entries: ids,
      message:
        backend === 'three'
          ? `${String(which)} loads a 3D scene: about ${String(kilobytes)} kB compressed on the first paint. The light backend asks for ${String(BACKEND_WEIGHT.ogl)}, when a full-screen effect is enough.`
          : `${String(which)} loads the light backend: about ${String(kilobytes)} kB compressed.`,
    })
  }

  // The heaviest first: that is the one the decision bears on.
  return warnings.sort((a, b) => b.kilobytes - a.kilobytes)
}

/**
 * npm packages a project must declare to host these entries.
 *
 * ## What is not in there
 *
 * Neither `gsap`, nor `ogl`, nor `three`. They are dependencies of
 * `@odoro-cli/engine`: they come with it, and asking the host project for them
 * a second time would produce a warning nothing resolves — the person would
 * install a package they already had, or would learn to ignore the message.
 *
 * What is asked for is the engine itself as soon as an entry uses it, and what
 * the entry declares on its own side.
 *
 * The weight is counted separately: `weighEntries` speaks of what the browser
 * will download, which does not depend on who declares what.
 *
 * @example
 * requiredPackages(entries) // ['clsx', '@odoro-cli/engine']
 */
export function requiredPackages(entries: readonly PublishedEntry[]): string[] {
  const packages = new Set<string>()

  for (const entry of entries) {
    for (const dependency of entry.dependencies) packages.add(dependency)

    // A graphics backend or an orchestration plugin means the entry goes
    // through the engine. It is the engine, and only it, that the project
    // installs.
    if (entry.engine.gl !== false || entry.engine.gsap.length > 0) {
      packages.add('@odoro-cli/engine')
    }
  }

  return [...packages].sort()
}
