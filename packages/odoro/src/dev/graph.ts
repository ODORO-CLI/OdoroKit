/**
 * Graph of the served modules.
 *
 * It answers a single question, but the most important one in hot development:
 * when this file changes, what has to be reloaded?
 *
 * @module
 */

/** A module known to the server. */
export interface ModuleNode {
  /** Absolute path of the file. */
  readonly file: string
  /** URL the module is served under. */
  readonly url: string
  /** Modules that import this one. */
  readonly importers: Set<string>
  /** Modules imported by this one. */
  readonly imported: Set<string>
  /**
   * `true` when the module declares that it accepts its own updates through
   * `import.meta.hot.accept()`.
   */
  selfAccepting: boolean
  /** Transformed code, or `undefined` when the module must be rebuilt. */
  code: string | undefined
  /** Timestamp of the last invalidation, used to break the cache. */
  timestamp: number
}

/**
 * Detects whether a source declares that it accepts its own updates.
 *
 * The analysis is deliberately textual. A full syntactic analysis would be
 * safer, but `import.meta.hot.accept` is too distinctive a formula to appear by
 * accident, and the cost of a false positive is limited to an update where a
 * reload would have been enough.
 *
 * @example
 * detectSelfAccepting('import.meta.hot?.accept()') // true
 */
export function detectSelfAccepting(source: string): boolean {
  return /import\s*\.\s*meta\s*\.\s*hot\s*\??\s*\.\s*accept\s*\(/.test(source)
}

/** Graph of the modules and of their import relations. */
export class ModuleGraph {
  private readonly nodes = new Map<string, ModuleNode>()

  /** Gets a module, or creates it when it is unknown. */
  public ensure(file: string, url: string): ModuleNode {
    const existing = this.nodes.get(file)
    if (existing !== undefined) return existing

    const node: ModuleNode = {
      file,
      url,
      importers: new Set(),
      imported: new Set(),
      selfAccepting: false,
      code: undefined,
      timestamp: Date.now(),
    }
    this.nodes.set(file, node)
    return node
  }

  /** Gets a module already known. */
  public get(file: string): ModuleNode | undefined {
    return this.nodes.get(file)
  }

  /** Number of known modules. */
  public get size(): number {
    return this.nodes.size
  }

  /**
   * Replaces the dependency list of a module, keeping the reverse relations up
   * to date.
   */
  public setDependencies(file: string, dependencies: readonly string[]): void {
    const node = this.nodes.get(file)
    if (node === undefined) return

    for (const previous of node.imported) {
      if (!dependencies.includes(previous)) {
        this.nodes.get(previous)?.importers.delete(file)
      }
    }

    node.imported.clear()
    for (const dependency of dependencies) {
      node.imported.add(dependency)
      const target = this.nodes.get(dependency)
      if (target !== undefined) target.importers.add(file)
    }
  }

  /**
   * Invalidates a module and climbs the chain of its importers until it finds,
   * on every branch, a module that accepts updates.
   *
   * @returns The modules to reload on the client side. An empty array means
   *   that no boundary accepts the update: the page must be reloaded.
   *
   * @example
   * const boundaries = graph.invalidate('/project/src/App.css')
   */
  public invalidate(file: string): ModuleNode[] {
    const boundaries: ModuleNode[] = []
    const seen = new Set<string>()
    const timestamp = Date.now()

    const walk = (current: string): boolean => {
      if (seen.has(current)) return true
      seen.add(current)

      const node = this.nodes.get(current)
      if (node === undefined) return false

      node.code = undefined
      node.timestamp = timestamp

      if (node.selfAccepting) {
        boundaries.push(node)
        return true
      }

      // A module nobody imports and that accepts nothing is a root: only a
      // reloaded page can reflect its change.
      if (node.importers.size === 0) return false

      let handled = true
      for (const importer of node.importers) {
        if (!walk(importer)) handled = false
      }
      return handled
    }

    return walk(file) ? boundaries : []
  }

  /** Forgets every module. */
  public clear(): void {
    this.nodes.clear()
  }
}
