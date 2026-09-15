/**
 * Preparation of an install, without writing anything.
 *
 * Everything that can fail — unknown entry, dependency pointing into the void,
 * cycle, invalid response — fails **here**, before a single file is touched.
 * The command then only has to ask for confirmation and apply.
 *
 * It is this split that makes the install verifiable: the plan is an ordinary
 * value, which a test can inspect without a file system or a server.
 *
 * @module
 */

import { posix } from 'node:path'

import {
  describeProblem,
  resolveGraph,
  type PublishedEntry,
  type ResolvableEntry,
} from '../registry/index.js'
import { fingerprint, type InstalledEntry, type ProjectConfig } from './project.js'
import { rewriteImports } from './rewrite.js'
import { indexById, type RegistrySource } from './source.js'
import { planWrite, type PlannedWrite } from './writer.js'

/** What a preparation returns. */
export type PrepareResult =
  | {
      readonly ok: true
      /** Entries to install, dependencies first. */
      readonly entries: readonly PublishedEntry[]
      /** Entries added that had not been asked for. */
      readonly implied: readonly string[]
    }
  | { readonly ok: false; readonly problems: readonly string[] }

/**
 * Suggests the identifiers close to an unknown name.
 *
 * A rough typing is the most frequent cause of an entry not being found, and a
 * plain "unknown" forces running `odoro list` again for nothing.
 *
 * The comparison is deliberately coarse — shared substring, or same name in
 * another category. An edit distance would do better on typos, worse on partial
 * names, and nobody writes `odoro add hero/molte`: one writes
 * `odoro add molten`.
 */
export function suggest(unknown: string, known: readonly string[]): string[] {
  const needle = unknown.toLowerCase()
  const tail = needle.split('/').pop() ?? needle

  return known
    .filter((id) => {
      const candidate = id.toLowerCase()
      return candidate.includes(tail) || (candidate.split('/').pop() ?? '').includes(tail)
    })
    .slice(0, 4)
}

/**
 * Resolves the requested identifiers and downloads everything needed.
 *
 * The identifiers may be given without a category — `molten` rather than
 * `hero/molten` — as long as they are unambiguous in the index. An ambiguity is
 * reported with the candidates, rather than settled at random.
 *
 * @example
 * const prepared = await prepareInstall(registry, ['molten'])
 */
export async function prepareInstall(
  registry: RegistrySource,
  requested: readonly string[],
): Promise<PrepareResult> {
  const index = await registry.index()
  if (!index.ok) return { ok: false, problems: index.problems }

  const catalogue = indexById(index.value)
  const known = [...catalogue.keys()]

  // Step 1: bring every request down to a full identifier.
  const ids: string[] = []
  const problems: string[] = []

  for (const asked of requested) {
    if (catalogue.has(asked)) {
      ids.push(asked)
      continue
    }

    const matches = known.filter((id) => (id.split('/').pop() ?? '') === asked)
    if (matches.length === 1 && matches[0] !== undefined) {
      ids.push(matches[0])
      continue
    }
    if (matches.length > 1) {
      problems.push(`"${asked}" is ambiguous: ${matches.join(', ')}. Name the category.`)
      continue
    }

    const near = suggest(asked, known)
    problems.push(
      near.length > 0
        ? `"${asked}" was not found. Did you mean ${near.join(', ')}?`
        : `"${asked}" was not found. "odoro list" gives the catalogue.`,
    )
  }

  if (problems.length > 0) return { ok: false, problems }

  // Step 2: resolve the graph on the index, which already carries the
  // dependencies. Doing it here avoids downloading an entry only to discover
  // afterwards that its dependency does not exist.
  const resolvable = new Map<string, ResolvableEntry>(
    [...catalogue].map(([id, entry]) => [
      id,
      { id, registryDependencies: entry.registryDependencies },
    ]),
  )

  const graph = resolveGraph(ids, resolvable)
  if (!graph.ok) return { ok: false, problems: graph.problems.map(describeProblem) }

  // Step 3: download, in installation order.
  const entries: PublishedEntry[] = []
  for (const id of graph.graph.order) {
    const entry = await registry.entry(id)
    if (!entry.ok) return { ok: false, problems: entry.problems }
    entries.push(entry.value)
  }

  return { ok: true, entries, implied: graph.graph.implied }
}

/** Destination path of a file in the project. */
export function targetPath(config: ProjectConfig, target: string): string {
  return posix.join(config.aliases.directory, target)
}

/**
 * Builds the write plan of a set of entries.
 *
 * @example
 * const plan = await planInstall(root, config, entries)
 * const replaced = plan.filter((write) => write.action === 'replace')
 */
export async function planInstall(
  root: string,
  config: ProjectConfig,
  entries: readonly PublishedEntry[],
): Promise<PlannedWrite[]> {
  const plan: PlannedWrite[] = []

  for (const entry of entries) {
    for (const file of entry.files) {
      const source = entry.sources[file.path]
      if (source === undefined) continue

      plan.push(
        await planWrite(
          root,
          targetPath(config, file.target),
          rewriteImports(source, config.aliases.import, file.target),
          entry.id,
        ),
      )
    }
  }

  return plan
}

/**
 * Records in `odoro.json` what has just been written.
 *
 * The hash is that of the **delivered** content, not of the file read back:
 * that is what will later allow telling a local edit from an upstream change.
 *
 * @example
 * const installed = recordInstall(config.installed, entries, plan, new Date())
 */
export function recordInstall(
  previous: ProjectConfig['installed'],
  entries: readonly PublishedEntry[],
  plan: readonly PlannedWrite[],
  now: Date,
): ProjectConfig['installed'] {
  const installed: Record<string, InstalledEntry> = { ...previous }

  for (const entry of entries) {
    installed[entry.id] = {
      installedAt: now.toISOString(),
      files: plan
        .filter((write) => write.owner === entry.id)
        .map((write) => ({ path: write.path, hash: fingerprint(write.content) })),
    }
  }

  return installed
}
