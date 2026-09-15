/**
 * Inventory of live resources.
 *
 * Every timeline, every scroll trigger and every WebGL surface registers here
 * on creation and removes itself on release. The point is not bookkeeping: it
 * is what makes a leak **visible**.
 *
 * A 3D scene releases nothing automatically — neither its geometries, nor its
 * materials, nor its textures, nor its render targets. The symptom of an
 * oversight is not an error but a slow degradation, invisible in development
 * and fatal after ten navigations. An inventory that does not come back to
 * zero after unmounting turns that degradation into a test assertion.
 *
 * @module
 */

/** Nature of a tracked resource. */
export type ResourceKind = 'timeline' | 'scroll-trigger' | 'surface' | 'subscription'

/** A registered resource. */
export interface Resource {
  /** Identifier assigned on registration. */
  readonly id: string
  /** Nature of the resource. */
  readonly kind: ResourceKind
  /** Readable name, shown in the diagnostics panel. */
  readonly name: string
  /** Timestamp of the registration. */
  readonly since: number
  /** Free-form information, shown as is in the diagnostics. */
  readonly detail?: Readonly<Record<string, string | number | boolean>>
}

/** What is needed to register a resource. */
export interface ResourceInput {
  /** Nature of the resource. */
  kind: ResourceKind
  /** Readable name. */
  name: string
  /** Release of the resource. Called by `disposeAll`. */
  dispose: () => void
  /** Free-form information. */
  detail?: Record<string, string | number | boolean>
}

/** Handle returned on registration. */
export interface ResourceHandle {
  /** Assigned identifier. */
  readonly id: string
  /** Removes the resource from the inventory, **without** releasing it. */
  release(): void
  /** Updates the information shown in the diagnostics. */
  update(detail: Record<string, string | number | boolean>): void
}

interface Entry extends Resource {
  dispose: () => void
  detail: Record<string, string | number | boolean>
}

let counter = 0

class ResourceRegistry {
  private readonly entries = new Map<string, Entry>()

  /** Number of live resources, all natures together or by nature. */
  public count(kind?: ResourceKind): number {
    if (kind === undefined) return this.entries.size
    let total = 0
    for (const entry of this.entries.values()) {
      if (entry.kind === kind) total += 1
    }
    return total
  }

  /** Live resources, from the oldest to the most recent. */
  public list(kind?: ResourceKind): readonly Resource[] {
    const all = [...this.entries.values()]
    const filtered = kind === undefined ? all : all.filter((entry) => entry.kind === kind)
    return filtered
      .sort((a, b) => a.since - b.since)
      .map(({ id, kind: entryKind, name, since, detail }) => ({
        id,
        kind: entryKind,
        name,
        since,
        detail,
      }))
  }

  /**
   * Registers a resource.
   *
   * @example
   * const handle = registry.register({
   *   kind: 'surface',
   *   name: 'aurora',
   *   dispose: () => renderer.dispose(),
   *   detail: { backend: 'ogl' },
   * })
   */
  public register(input: ResourceInput): ResourceHandle {
    counter += 1
    const id = `${input.kind}-${counter}`

    this.entries.set(id, {
      id,
      kind: input.kind,
      name: input.name,
      since: Date.now(),
      dispose: input.dispose,
      detail: input.detail ?? {},
    })

    return {
      id,
      release: () => {
        this.entries.delete(id)
      },
      update: (detail) => {
        const entry = this.entries.get(id)
        if (entry === undefined) return
        Object.assign(entry.detail, detail)
      },
    }
  }

  /**
   * Releases every resource of a nature, or all of them.
   *
   * Used on page change and on close. A release that fails does not interrupt
   * the following ones: the goal is to let everything go, not to stop at the
   * first problem.
   */
  public disposeAll(kind?: ResourceKind): number {
    let released = 0

    for (const entry of [...this.entries.values()]) {
      if (kind !== undefined && entry.kind !== kind) continue
      try {
        entry.dispose()
      } catch (cause) {
        console.error(`[odoro] failed to release "${entry.name}"`, cause)
      }
      this.entries.delete(entry.id)
      released += 1
    }

    return released
  }
}

/**
 * Inventory of the page.
 *
 * @example
 * import { registry } from '@odoro-cli/engine'
 *
 * // In a leak test:
 * expect(registry.count('surface')).toBe(0)
 */
export const registry = new ResourceRegistry()

/** Type of the inventory, for the signatures that receive it. */
export type ResourceRegistryInstance = ResourceRegistry
