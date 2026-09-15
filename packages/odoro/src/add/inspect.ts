/**
 * Comparison between what was delivered, what is on disk, and what the registry
 * serves today.
 *
 * ## Three versions, not two
 *
 * Comparing the local file to the registry file says almost nothing: when they
 * differ, we do not know whether it is because the user edited theirs or
 * because the upstream version moved on. Yet these are opposite situations —
 * the first is kept, the second is picked up.
 *
 * The hash recorded at install time provides the third reference point. With
 * it, the four cases are told apart unambiguously:
 *
 * | local vs delivered | upstream vs delivered | verdict            |
 * | ------------------ | --------------------- | ------------------ |
 * | identical          | identical             | up to date         |
 * | different          | identical             | edited locally     |
 * | identical          | different             | an update exists   |
 * | different          | different             | diverged           |
 *
 * The last case is the only one that needs a human decision, and it is exactly
 * the one a two-way comparison would have drowned among the others.
 *
 * @module
 */

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import type { PublishedEntry } from '../registry/index.js'
import { fingerprint, type ProjectConfig } from './project.js'
import { rewriteImports } from './rewrite.js'
import type { RegistrySource } from './source.js'

/** State of an installed file. */
export type FileState =
  'up-to-date' | 'edited' | 'update-available' | 'diverged' | 'missing' | 'unknown'

/** What we learned about a file. */
export interface FileReport {
  /** Path in the project. */
  readonly path: string
  /** Verdict. */
  readonly state: FileState
  /** Local content, when the file exists. */
  readonly local: string | null
  /** Content served by the registry, after rewriting the imports. */
  readonly upstream: string | null
}

/** What we learned about an installed entry. */
export interface EntryReport {
  /** Registry identifier. */
  readonly id: string
  /** State of each of its files. */
  readonly files: readonly FileReport[]
  /** The registry no longer serves this entry. */
  readonly orphan: boolean
  /**
   * Entry as the registry serves it, or `null` when it no longer serves it.
   *
   * It is kept for the diagnostics: the `meta` carries the packages the entry
   * requires, and the index does not keep enough to infer them.
   */
  readonly upstream: PublishedEntry | null
}

/** Sentence describing a state, from the point of view of the registry. */
export const STATE_LABEL: Record<FileState, string> = {
  'up-to-date': 'up to date',
  edited: 'edited locally',
  'update-available': 'an update exists',
  diverged: 'edited locally, and the registry has changed',
  missing: 'missing from the project',
  unknown: 'unknown to the registry',
}

/** Crosses the three versions of a file. */
function verdict(
  local: string | null,
  deliveredHash: string,
  upstream: string | null,
): FileState {
  if (local === null) return 'missing'
  if (upstream === null) return 'unknown'

  const localChanged = fingerprint(local) !== deliveredHash
  const upstreamChanged = fingerprint(upstream) !== deliveredHash

  if (!localChanged && !upstreamChanged) return 'up-to-date'
  if (localChanged && !upstreamChanged) return 'edited'
  if (!localChanged && upstreamChanged) return 'update-available'
  return 'diverged'
}

/**
 * Compares an installed entry to what the registry serves.
 *
 * @param upstream Entry as it comes from the registry, or `null` when the
 * registry no longer serves it.
 *
 * @example
 * const report = await inspectEntry(root, config, 'hooks/use-poster', entry)
 */
export async function inspectEntry(
  root: string,
  config: ProjectConfig,
  id: string,
  upstream: PublishedEntry | null,
): Promise<EntryReport> {
  const installed = config.installed[id]
  if (installed === undefined) {
    return { id, files: [], orphan: upstream === null, upstream }
  }

  // What the registry serves today, indexed by destination: it is the
  // destination, not the original path, that links the two sides.
  const served = new Map<string, string>()
  if (upstream !== null) {
    for (const file of upstream.files) {
      const source = upstream.sources[file.path]
      if (source !== undefined) {
        served.set(
          join(config.aliases.directory, file.target).replaceAll('\\', '/'),
          rewriteImports(source, config.aliases.import, file.target),
        )
      }
    }
  }

  const files: FileReport[] = []
  for (const tracked of installed.files) {
    let local: string | null = null
    try {
      local = await readFile(join(root, tracked.path), 'utf8')
    } catch {
      local = null
    }

    const upstreamSource = served.get(tracked.path.replaceAll('\\', '/')) ?? null

    files.push({
      path: tracked.path,
      state: verdict(local, tracked.hash, upstreamSource),
      local,
      upstream: upstreamSource,
    })
  }

  return { id, files, orphan: upstream === null, upstream }
}

/**
 * Compares everything that is installed.
 *
 * An entry the registry no longer serves is not an error: it may have been
 * renamed, or the project may point at a partial local registry. It is
 * reported, not condemned.
 *
 * @example
 * const reports = await inspectAll(root, config, registry)
 */
export async function inspectAll(
  root: string,
  config: ProjectConfig,
  registry: RegistrySource,
): Promise<EntryReport[]> {
  const reports: EntryReport[] = []

  for (const id of Object.keys(config.installed).sort()) {
    const fetched = await registry.entry(id)
    reports.push(await inspectEntry(root, config, id, fetched.ok ? fetched.value : null))
  }

  return reports
}

/**
 * Returns a preview of the lines that differ between two versions.
 *
 * This is not a difference algorithm: it is a bounded list of the lines present
 * on one side and not on the other. A real diff belongs to `git diff`, which
 * the user already has; what they do not have is the registry version — and
 * this preview is enough to decide whether it is worth picking up.
 *
 * @example
 * previewChanges(local, upstream, 6)
 */
export function previewChanges(
  local: string,
  upstream: string,
  limit = 8,
): { readonly added: string[]; readonly removed: string[] } {
  const localLines = local.replaceAll('\r\n', '\n').split('\n')
  const upstreamLines = upstream.replaceAll('\r\n', '\n').split('\n')

  const localSet = new Set(localLines)
  const upstreamSet = new Set(upstreamLines)

  return {
    added: upstreamLines
      .filter((line) => line.trim() !== '' && !localSet.has(line))
      .slice(0, limit),
    removed: localLines
      .filter((line) => line.trim() !== '' && !upstreamSet.has(line))
      .slice(0, limit),
  }
}
