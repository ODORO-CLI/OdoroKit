/**
 * The stylesheet provider of the project.
 *
 * ## Why the engine does not depend on the library
 *
 * `odoro` is a build tool; `@odoro-cli/libs` is an interface library. Making
 * the former depend on the latter would invert the relation — a project that
 * does not use the library could no longer be built without installing it
 * anyway — and would create a cycle as soon as the library wanted to build
 * itself with the engine.
 *
 * The engine therefore looks for the generator **in the dependencies of the
 * project**, and does without it when it is not there. A project without the
 * library builds as before; a project with it gets a stylesheet cut to its
 * measure.
 *
 * ## Why the resolution is written by hand
 *
 * The obvious way — `createRequire(...).resolve('@odoro-cli/libs/generator')`
 * — fails, and it took a real deployment to notice: it applies the **CommonJS**
 * resolution, which looks for a `require` condition in the `exports` field. A
 * pure ESM package declares none, and the call throws
 * `ERR_PACKAGE_PATH_NOT_EXPORTED` — that is, exactly the same symptom as a
 * missing package. The engine therefore fell back silently on pruning,
 * believing no generator was installed.
 *
 * `import.meta.resolve` is no better suited: its two-argument form, the only
 * one able to resolve from a directory other than the caller's, is not stable.
 *
 * So we resolve the `package.json` of the package — always exported, and
 * without a condition — then read its `exports` field ourselves.
 *
 * ## A contract, not an import
 *
 * The engine knows one thing about the generator: it returns the utilities
 * matching a set of classes. Any package exposing that function under that name
 * will do.
 *
 * @module
 */

import { readFile } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

/** What the engine expects from a stylesheet provider. */
export interface CssProvider {
  /**
   * The rules matching these classes, **without** variables or reset.
   *
   * Without the base, because the produced CSS bundle already carries it: it
   * arrived through the application import. Adding it again would duplicate it.
   *
   * The name is the one `@odoro-cli/libs` publishes: it is a cross-package
   * contract, and renaming it here would break the resolution.
   */
  renderUtilitiesFor(classes: ReadonlySet<string>): string

  /**
   * Every class the system can produce, when it can enumerate them.
   *
   * Serves **development**: the build only emits the classes in use, but the
   * development server does not scan the sources — it therefore serves
   * everything, and leaves pruning to the build.
   *
   * Optional: an older provider does not expose it, and the server does
   * without.
   */
  readonly knownClasses?: () => ReadonlySet<string>
}

/** The package consulted, and the expected subpath. */
const PACKAGE = '@odoro-cli/libs'
const SUBPATH = './generator'

/** What an `exports` field may hold for one entry. */
type Entry = string | { readonly import?: string; readonly default?: string }

/**
 * The ESM file behind an entry of the `exports` field.
 *
 * We do not reimplement the full Node resolution — nested conditions, patterns,
 * fallbacks. We read the simple case, and give up on everything else: giving up
 * falls back on pruning, which works, where an approximate resolution would
 * point at the wrong file.
 */
function fileFor(entry: Entry | undefined): string | undefined {
  if (entry === undefined) return undefined
  if (typeof entry === 'string') return entry
  return entry.import ?? entry.default
}

/**
 * Looks for the generator in the dependencies of the project.
 *
 * @param root Root of the project being built — that is where the resolution
 *   must start from, and not from the engine directory: the engine may be
 *   installed globally, or linked from another repository, and resolving from
 *   its own place would find its own version rather than the project one.
 *
 * @returns The provider, or `undefined` when it is not installed — which is not
 *   an error: the engine then falls back on pruning.
 *
 * @example
 * const provider = await cssProviderFor(config.root)
 */
export async function cssProviderFor(root: string): Promise<CssProvider | undefined> {
  try {
    // `package.json` is exported by every package, without a condition: it is
    // the only subpath whose CommonJS resolution is sure to succeed.
    const require_ = createRequire(join(root, 'package.json'))
    const manifest = require_.resolve(`${PACKAGE}/package.json`)
    const directory = dirname(manifest)

    const content = JSON.parse(await readFile(manifest, 'utf8')) as {
      readonly exports?: Readonly<Record<string, Entry>>
    }

    const relativePath = fileFor(content.exports?.[SUBPATH])
    if (relativePath === undefined) return undefined

    const module_ = (await import(
      pathToFileURL(resolve(directory, relativePath)).href
    )) as Partial<
      CssProvider & {
        generate: (tier?: string) => { readonly classNames: readonly string[] }
      }
    >

    // Present but without the expected function: that is too old a version. We
    // treat it as an absence, and pruning takes over — rather than throwing and
    // breaking a build that worked yesterday.
    if (typeof module_.renderUtilitiesFor !== 'function') return undefined

    const generate = module_.generate
    return {
      renderUtilitiesFor: module_.renderUtilitiesFor,
      // `generate` enumerates the classes of the current tier. Absent from an
      // older package: the field then stays undefined, and development falls
      // back on the stylesheet as it ships.
      ...(typeof generate === 'function'
        ? {
            knownClasses: (): ReadonlySet<string> => new Set(generate('core').classNames),
          }
        : {}),
    }
  } catch {
    // Absent, unresolvable, or unreadable. None of these situations is a build
    // error: the project simply does not use this styling system.
    return undefined
  }
}
