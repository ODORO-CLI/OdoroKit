/**
 * Graphe des modules servis.
 *
 * Il repond a une seule question, mais la plus importante du developpement a
 * chaud : quand ce fichier change, que faut-il recharger ?
 *
 * @module
 */

/** Un module connu du serveur. */
export interface ModuleNode {
  /** Chemin absolu du fichier. */
  readonly file: string
  /** URL sous laquelle le module est servi. */
  readonly url: string
  /** Modules qui importent celui-ci. */
  readonly importers: Set<string>
  /** Modules importes par celui-ci. */
  readonly imported: Set<string>
  /**
   * `true` si le module declare accepter ses propres mises a jour via
   * `import.meta.hot.accept()`.
   */
  selfAccepting: boolean
  /** Code transforme, ou `undefined` si le module doit etre recompile. */
  code: string | undefined
  /** Horodatage de la derniere invalidation, servant a casser le cache. */
  timestamp: number
}

/**
 * Detecte si une source declare accepter ses propres mises a jour.
 *
 * L'analyse est volontairement textuelle. Une analyse syntaxique complete
 * serait plus sure, mais `import.meta.hot.accept` est une formule trop
 * distinctive pour apparaitre par accident, et le cout d'un faux positif se
 * limite a une mise a jour la ou un rechargement aurait suffi.
 *
 * @example
 * detectSelfAccepting('import.meta.hot?.accept()') // true
 */
export function detectSelfAccepting(source: string): boolean {
  return /import\s*\.\s*meta\s*\.\s*hot\s*\??\s*\.\s*accept\s*\(/.test(source)
}

/** Graphe des modules et de leurs relations d'import. */
export class ModuleGraph {
  private readonly nodes = new Map<string, ModuleNode>()

  /** Recupere un module, ou le cree s'il est inconnu. */
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

  /** Recupere un module deja connu. */
  public get(file: string): ModuleNode | undefined {
    return this.nodes.get(file)
  }

  /** Nombre de modules connus. */
  public get size(): number {
    return this.nodes.size
  }

  /**
   * Remplace la liste des dependances d'un module, en tenant a jour les
   * relations inverses.
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
   * Invalide un module et remonte la chaine de ses importateurs jusqu'a
   * trouver, sur chaque branche, un module qui accepte les mises a jour.
   *
   * @returns Les modules a recharger cote client. Un tableau vide signifie
   *   qu'aucune frontiere n'accepte la mise a jour : il faut recharger la page.
   *
   * @example
   * const boundaries = graph.invalidate('/projet/src/App.css')
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

      // Un module que personne n'importe et qui n'accepte rien est une racine :
      // seule une page rechargee peut refleter son changement.
      if (node.importers.size === 0) return false

      let handled = true
      for (const importer of node.importers) {
        if (!walk(importer)) handled = false
      }
      return handled
    }

    return walk(file) ? boundaries : []
  }

  /** Oublie tous les modules. */
  public clear(): void {
    this.nodes.clear()
  }
}
