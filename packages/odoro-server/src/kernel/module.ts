/**
 * The module contract.
 *
 * ## What a module is, and what it is not
 *
 * A module is a **declaration**: a name, what it needs, what it
 * registers, what it exposes. It does not install itself, it does not know
 * the application, and it never touches Express. It is the kernel that
 * mounts it.
 *
 * The practical consequence: enabling or disabling a module takes one line
 * in `main.ts`, and nothing else moves. A module that would install
 * itself would leave traces behind it — a route set, a listener
 * subscribed — and "disabling" would become a work of archaeology.
 *
 * ## The loading order
 *
 * `requires` declares the modules this one needs. The kernel derives from it a
 * topological order, detects the cycles, and refuses to start if a
 * dependency is missing.
 *
 * That refusal is at startup, not on the first request. An `account` module
 * that assumes `auth` mounted, on a server where `auth` was removed, must
 * fail at the instant somebody deploys it — and not the day after, on
 * the route nobody calls in staging.
 *
 * @module
 */

import type { Container } from './container.js'
import type { RouteDefinition } from './http/route.js'

/** What a module declares. */
export interface ModuleDefinition<Services = Record<never, never>> {
  /** Name, unique, used by `requires` and by the CLI. */
  readonly name: string

  /**
   * Required modules, by name.
   *
   * A missing dependency or a cycle fail the startup.
   */
  readonly requires?: readonly string[]

  /**
   * Registers the services of the module in the container.
   *
   * Called in the topological order: the services of the required modules are
   * already registered when this one runs.
   */
  readonly register?: (container: Container<Services>) => void

  /** Exposed routes. */
  readonly routes?: readonly RouteDefinition[]

  /**
   * Required database capabilities.
   *
   * A module that leans on `jsonb` or on the full text search
   * declares it here. The kernel compares to the capabilities of the current dialect and refuses
   * to start if one is missing — rather than letting the module fail
   * on use, on a rare request, with a driver error.
   */
  readonly requiresCapabilities?: readonly string[]
}

/**
 * Declares a module.
 *
 * The function only types: it exists only for the inference, and so
 * that the declaration reads as a declaration.
 *
 * @example
 * export const accountModule = defineModule({
 *   name: 'account',
 *   requires: ['auth'],
 *   register: (c) => c.register('accountService', createAccountService),
 *   routes: accountRoutes,
 * })
 */
export function defineModule<Services = Record<never, never>>(
  definition: ModuleDefinition<Services>,
): ModuleDefinition<Services> {
  return definition
}

/** Thrown when the set of modules cannot be mounted. */
export class ModuleError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ModuleError'
  }
}

/**
 * Orders the modules according to their dependencies.
 *
 * ## The traversal
 *
 * A topological sort by depth-first traversal, with three states per node:
 * never seen, being visited, done. The second is what distinguishes a
 * cycle from a plain diamond — a module reached twice by different
 * paths is normal, a module reached during its own visit is a
 * cycle.
 *
 * The alphabetical order is applied to the siblings, so that two startups of the
 * same set produce the same sequence. An order that varies makes
 * irreproducible any flaw that depends on it.
 *
 * @throws {ModuleError} On a missing name, a duplicate or a cycle.
 */
export function orderModules(
  modules: readonly ModuleDefinition<never>[],
): readonly ModuleDefinition<never>[] {
  const byName = new Map<string, ModuleDefinition<never>>()

  for (const module of modules) {
    if (byName.has(module.name)) {
      throw new ModuleError(`Two modules bear the name "${module.name}".`)
    }
    byName.set(module.name, module)
  }

  const ordered: ModuleDefinition<never>[] = []
  const done = new Set<string>()
  const visiting: string[] = []

  const visit = (name: string, requiredBy: string | undefined): void => {
    if (done.has(name)) return

    const cycleAt = visiting.indexOf(name)
    if (cycleAt !== -1) {
      throw new ModuleError(
        `Cycle between modules: ${[...visiting.slice(cycleAt), name].join(' -> ')}.`,
      )
    }

    const module = byName.get(name)
    if (module === undefined) {
      throw new ModuleError(
        requiredBy === undefined
          ? `Unknown module: "${name}".`
          : `The module "${requiredBy}" requires "${name}", which is not enabled. ` +
              `Enabled modules: ${[...byName.keys()].sort().join(', ')}.`,
      )
    }

    visiting.push(name)
    // The siblings are visited in alphabetical order: two startups of the
    // same set must produce the same sequence.
    for (const dependency of [...(module.requires ?? [])].sort()) {
      visit(dependency, name)
    }
    visiting.pop()

    done.add(name)
    ordered.push(module)
  }

  for (const module of modules) visit(module.name, undefined)

  return ordered
}

/**
 * Checks that the required capabilities are available.
 *
 * @throws {ModuleError} Naming the module, the capability and the dialect —
 *   all three are needed to know what to do with the message.
 */
export function assertCapabilities(
  modules: readonly ModuleDefinition<never>[],
  available: Readonly<Record<string, boolean>>,
  dialect: string,
): void {
  const problems: string[] = []

  for (const module of modules) {
    for (const capability of module.requiresCapabilities ?? []) {
      if (available[capability] !== true) {
        problems.push(
          `  "${module.name}" requires the capability "${capability}", absent from ${dialect}`,
        )
      }
    }
  }

  if (problems.length > 0) {
    throw new ModuleError(
      [
        `Modules incompatible with the database engine:`,
        '',
        ...problems,
        '',
        `Disable these modules, or use an engine that offers these capabilities.`,
      ].join('\n'),
    )
  }
}
