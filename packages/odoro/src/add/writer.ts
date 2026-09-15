/**
 * Transactional writing of the files of a component.
 *
 * ## Why all or nothing
 *
 * An install writes several files, sometimes for several entries at once. When
 * the third write fails — disk full, permission denied, interruption — a naive
 * write leaves a half-served project: two files present, one missing, and
 * nothing to say which. The user can neither carry on nor go back, because they
 * do not know what was touched.
 *
 * The writing therefore happens in two phases. First each file is written next
 * to its destination, under a temporary name; at that stage, nothing observable
 * has changed. Only then are the files put in place, by renaming. If anything
 * fails before that, the temporaries are erased and the project is exactly in
 * the state it was found.
 *
 * ## What this guarantee does not cover
 *
 * The renaming itself is not atomic **across several files**: the system offers
 * nothing of the kind. If the second rename fails, the first has already
 * happened. The previous contents are therefore kept in memory and put back —
 * which remains a repair, not a transaction.
 *
 * That is acceptable here: renaming a file already written on the same volume
 * fails very rarely, while the writing itself — the one that fills the disk and
 * meets the permissions — is fully covered. The trade-off is named rather than
 * implied.
 *
 * @module
 */

import { mkdir, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

/** What will become of a file. */
export type FileAction = 'create' | 'replace' | 'unchanged'

/** A planned write. */
export interface PlannedWrite {
  /** Path in the project, relative to its root, in forward slashes. */
  readonly path: string
  /** Content to write. */
  readonly content: string
  /** What the write will do. */
  readonly action: FileAction
  /** Identifier of the registry entry this file comes from. */
  readonly owner: string
}

/**
 * Prepares a write by comparing it to what is already on disk.
 *
 * A file whose content is identical is marked `unchanged` rather than
 * `replace`: rewriting it would change its modification date, which build tools
 * watch, for a strictly identical result.
 *
 * @example
 * const write = await planWrite(root, 'src/odoro/hooks/usePoster.ts', source, 'hooks/use-poster')
 */
export async function planWrite(
  root: string,
  path: string,
  content: string,
  owner: string,
): Promise<PlannedWrite> {
  let existing: string | null = null
  try {
    existing = await readFile(join(root, path), 'utf8')
  } catch {
    existing = null
  }

  const action: FileAction =
    existing === null
      ? 'create'
      : existing.replaceAll('\r\n', '\n') === content.replaceAll('\r\n', '\n')
        ? 'unchanged'
        : 'replace'

  return { path, content, action, owner }
}

/** What applying a plan did. */
export interface ApplyReport {
  /** Files actually written. */
  readonly written: readonly string[]
  /** Files left as they were because identical. */
  readonly skipped: readonly string[]
}

/** Suffix of the temporary files. */
const PENDING = '.odoro-pending'

/**
 * Applies a write plan, entirely or not at all.
 *
 * @param root Project root.
 * @param plan Planned writes. Those marked `unchanged` are skipped.
 *
 * @throws When the write fails. The project is then left in its initial state,
 * and the original error is propagated as it is: hiding it behind a generic
 * message would remove the only useful information.
 *
 * @example
 * const report = await applyPlan(root, plan)
 */
export async function applyPlan(
  root: string,
  plan: readonly PlannedWrite[],
): Promise<ApplyReport> {
  const todo = plan.filter((entry) => entry.action !== 'unchanged')
  const skipped = plan
    .filter((entry) => entry.action === 'unchanged')
    .map((entry) => entry.path)

  /** Temporaries written, to erase when the first phase fails. */
  const pending: string[] = []
  /** Previous contents, to repair when putting in place fails. */
  const previous = new Map<string, string | null>()

  try {
    // First phase: write everything alongside. Nothing observable changes.
    for (const entry of todo) {
      const target = join(root, entry.path)
      await mkdir(dirname(target), { recursive: true })

      if (entry.action === 'replace') {
        previous.set(entry.path, await readFile(target, 'utf8'))
      } else {
        previous.set(entry.path, null)
      }

      const temporary = `${target}${PENDING}`
      await writeFile(temporary, entry.content, 'utf8')
      pending.push(temporary)
    }
  } catch (cause) {
    await Promise.all(pending.map((file) => rm(file, { force: true })))
    throw cause
  }

  const placed: string[] = []
  try {
    // Second phase: putting in place.
    for (const entry of todo) {
      const target = join(root, entry.path)
      await rename(`${target}${PENDING}`, target)
      placed.push(entry.path)
    }
  } catch (cause) {
    await restore(root, placed, previous)
    await Promise.all(pending.map((file) => rm(file, { force: true })))
    throw cause
  }

  return { written: todo.map((entry) => entry.path), skipped }
}

/**
 * Puts the already placed files back in their previous state.
 *
 * Repair failures are deliberately ignored: we are already on the error path,
 * and hiding the initial cause behind a cleanup error would make the real
 * problem impossible to find.
 */
async function restore(
  root: string,
  placed: readonly string[],
  previous: ReadonlyMap<string, string | null>,
): Promise<void> {
  for (const path of placed) {
    const target = join(root, path)
    const before = previous.get(path)
    try {
      if (before === null || before === undefined) {
        await rm(target, { force: true })
      } else {
        await writeFile(target, before, 'utf8')
      }
    } catch {
      // See the note above.
    }
  }
}
