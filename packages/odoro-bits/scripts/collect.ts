/**
 * Reading the registry from disk.
 *
 * The registry is a tree: `registry/<category>/<name>/`, containing a
 * `meta.json` and the files the CLI will copy. This module walks it and draws
 * from it either a valid catalogue, or the complete list of what is wrong.
 *
 * ## Why everything is collected before failing
 *
 * Stopping at the first error would force the validation to be run once per
 * problem. On a registry of forty components, after a format change, that
 * makes forty round trips. The problems are therefore all gathered, then
 * returned in one block.
 *
 * ## What the schema cannot check
 *
 * The schema validates the **shape** of a `meta.json`, but it knows neither
 * the disk nor the other entries. Three checks escape it and are done here:
 * that a declared file really exists, that the name and the category match
 * the directory containing them, and — in the resolution module — that a
 * registry dependency points to something.
 *
 * @module
 */

import { readdir, readFile } from 'node:fs/promises'
import { join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  entryId,
  parseMeta,
  type PublishedEntry,
  type RegistryMeta,
} from 'odoro/registry'

/** An entry read from disk. */
export interface CollectedEntry extends PublishedEntry {
  /** Component directory, relative to the registry root. */
  readonly directory: string
}

/** Result of a collection. */
export type CollectResult =
  | { readonly ok: true; readonly entries: readonly CollectedEntry[] }
  | { readonly ok: false; readonly problems: readonly string[] }

/**
 * Writes a path with forward slashes.
 *
 * The registry identifiers and messages must read the same whatever the
 * system: a `text\demo` in an error would match nothing of what the user
 * types in their command line.
 */
function posix(path: string): string {
  return path.split(sep).join('/')
}

/** Lists the direct subdirectories, ignoring the files. */
async function subdirectories(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
}

/**
 * The npm packages that the sources of an entry really import.
 *
 * ## Why they are deduced instead of being believed
 *
 * `meta.json` carries a `dependencies` field, filled in by hand. It was
 * filled in badly: 455 entries out of 461 left it empty while importing
 * `@odoro-cli/engine`. The registry therefore announced components without a
 * dependency, `odoro add` had nothing to report, and the project did not
 * compile — with a module-not-found error that nothing tied back to the
 * registry.
 *
 * A list kept by hand next to the code it describes always drifts. This one
 * is therefore read from the imports, where it cannot lie.
 *
 * ## What is not one
 *
 * Relative paths stay in the entry. `@registre/…` designates another entry,
 * not a package: those links are already declared by `registryDependencies`,
 * and the CLI rewrites them at install time to the alias of the project.
 */
function importedPackages(sources: Record<string, string>): string[] {
  const found = new Set<string>()

  for (const code of Object.values(sources)) {
    // `from '…'` covers the import and the reexport; `import '…'` covers the
    // stylesheet imported for its effect, which is a real need.
    for (const m of code.matchAll(/(?:from|import)\s+'([^']+)'/g)) {
      const specifier = m[1]
      if (specifier === undefined) continue
      if (specifier.startsWith('.')) continue
      if (specifier.startsWith('@registre/')) continue

      // The package name, without the subpath: `@odoro-cli/libs/router`
      // installs by installing `@odoro-cli/libs`.
      const parts = specifier.split('/')
      const name = specifier.startsWith('@')
        ? parts.slice(0, 2).join('/')
        : (parts[0] ?? '')
      if (name !== '') found.add(name)
    }
  }

  return [...found].sort()
}
/**
 * Reads a single entry.
 *
 * @param root Registry root.
 * @param category Name of the category directory.
 * @param name Name of the component directory.
 */
async function collectEntry(
  root: string,
  category: string,
  name: string,
  problems: string[],
): Promise<CollectedEntry | null> {
  const directory = join(category, name)
  const origin = posix(directory)
  const metaPath = join(root, directory, 'meta.json')

  let raw: string
  try {
    raw = await readFile(metaPath, 'utf8')
  } catch {
    problems.push(`${origin}: no meta.json in this directory.`)
    return null
  }

  let value: unknown
  try {
    value = JSON.parse(raw)
  } catch (error) {
    problems.push(`${origin}/meta.json: unreadable JSON — ${(error as Error).message}`)
    return null
  }

  const parsed = parseMeta(value, origin)
  if (!parsed.ok) {
    problems.push(...parsed.problems)
    return null
  }

  const meta: RegistryMeta = parsed.meta

  // The directory is the real identifier: the CLI and the index refer to it.
  // A gap between the two would give an entry not to be found at the address
  // where everybody looks for it.
  if (meta.category !== category) {
    problems.push(
      `${origin}: the declared category (${meta.category}) does not match the directory (${category}).`,
    )
  }
  if (meta.name !== name) {
    problems.push(
      `${origin}: the declared name (${meta.name}) does not match the directory (${name}).`,
    )
  }

  const sources: Record<string, string> = {}
  for (const file of meta.files) {
    try {
      const raw = await readFile(join(root, directory, file.path), 'utf8')
      // The line endings are normalised: the artefact is served to every
      // platform, and there is no reason for a component published from a
      // Windows machine to arrive different from the version published
      // elsewhere.
      sources[file.path] = raw.replaceAll('\r\n', '\n')
    } catch {
      problems.push(`${origin}: the declared file "${file.path}" was not found.`)
    }
  }

  if (Object.keys(sources).length !== meta.files.length) return null

  // Both directions are brought together: what the author declared is kept —
  // they may know a need the imports do not show — and what the imports
  // reveal is added, whether they thought of it or not.
  const dependencies = [
    ...new Set([...(meta.dependencies ?? []), ...importedPackages(sources)]),
  ].sort()

  return { ...meta, dependencies, id: entryId(meta), directory: origin, sources }
}

/**
 * Walks a registry and reads all of its entries.
 *
 * Unknown category directories are reported rather than ignored: a directory
 * named wrong would otherwise become an invisible component, present in the
 * repository but absent from everything that is published.
 *
 * @param root Registry root, containing the category directories.
 *
 * @example
 * const result = await collectRegistry('registry')
 * if (!result.ok) console.error(result.problems.join('\n'))
 */
export async function collectRegistry(root: string): Promise<CollectResult> {
  const problems: string[] = []
  const entries: CollectedEntry[] = []

  let categories: string[]
  try {
    categories = await subdirectories(root)
  } catch {
    return { ok: false, problems: [`Registry root not found: ${root}`] }
  }

  for (const category of categories) {
    for (const name of await subdirectories(join(root, category))) {
      const entry = await collectEntry(root, category, name, problems)
      if (entry !== null) entries.push(entry)
    }
  }

  // Two directories cannot produce the same identifier — but a name declared
  // crookedly could.
  const seen = new Set<string>()
  for (const entry of entries) {
    if (seen.has(entry.id)) {
      problems.push(`${entry.directory}: identifier already taken — ${entry.id}.`)
    }
    seen.add(entry.id)
  }

  if (problems.length > 0) return { ok: false, problems }
  return { ok: true, entries }
}

/** Registry path relative to the current directory, for display. */
export function displayPath(root: string): string {
  const shown = relative(process.cwd(), root)
  return shown === '' ? '.' : posix(shown)
}

/**
 * Tells whether the current module is the one Node started.
 *
 * The registry scripts are both executables and modules imported by the
 * tests. The comparison goes through `fileURLToPath`: under Windows, the URL
 * and the argument path are not written the same way.
 *
 * @example
 * if (isMainModule(import.meta.url)) await main()
 */
export function isMainModule(url: string): boolean {
  const started = process.argv[1]
  if (started === undefined) return false
  return fileURLToPath(url) === resolve(started)
}
