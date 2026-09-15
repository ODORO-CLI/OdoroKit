/**
 * The `odoro.json` file of a project.
 *
 * ## Why the project keeps a record of what it received
 *
 * The components are copied: once written, nothing tells them apart from the
 * rest of the code. That is the point. But it also removes any possibility of
 * answering three questions one inevitably asks after a few months: what comes
 * from the registry, have I modified it since, and has the upstream version
 * moved?
 *
 * A plain inventory is not enough for the second. That is why the hash of each
 * file **as it was delivered** is kept: it alone lets `odoro diff` tell "you
 * edited this file" from "the registry changed". Without it, the two cases look
 * exactly alike.
 *
 * The hash is not a signature: it protects nothing, it only dates. It is a log,
 * not a lock.
 *
 * @module
 */

import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'

import * as z from 'zod/mini'

/** Name of the configuration file, at the root of the project. */
export const CONFIG_FILE = 'odoro.json'

/** A file delivered by the registry. */
const trackedFileSchema = z.object({
  /** Path in the project, relative to its root, in forward slashes. */
  path: z.string().check(z.minLength(1)),
  /** Hash of the content **as it was delivered**. */
  hash: z.string().check(z.minLength(1)),
})

/** An installed entry. */
const installedSchema = z.object({
  /** Installation date, in ISO 8601. */
  installedAt: z.string().check(z.minLength(1)),
  /** Files written by this entry. */
  files: z.array(trackedFileSchema),
})

/** Write locations, by registry category. */
const aliasesSchema = z.object({
  /**
   * Import prefix used in the written code, without a trailing slash. For
   * example `@/components/odoro`.
   */
  import: z.string().check(z.minLength(1)),
  /**
   * Matching directory on disk, relative to the project root. For example
   * `src/components/odoro`.
   */
  directory: z.string().check(z.minLength(1)),
})

/** Shape of the `odoro.json` file. */
const projectSchema = z.object({
  /** Version of the format, so that the CLI knows whether it can read it. */
  version: z._default(z.literal(1), 1),
  /** Address of the registry: a URL, or a local path to develop it. */
  registry: z.string().check(z.minLength(1)),
  /** Where to write, and under which prefix to import. */
  aliases: aliasesSchema,
  /** What was installed, indexed by registry identifier. */
  installed: z._default(z.record(z.string(), installedSchema), {}),
})

/** Configuration of a project consuming the registry. */
export type ProjectConfig = z.infer<typeof projectSchema>

/** An installed entry, as it is recorded in `odoro.json`. */
export type InstalledEntry = z.infer<typeof installedSchema>

/** A delivered file, with its delivery hash. */
export type TrackedFile = z.infer<typeof trackedFileSchema>

/**
 * Hash of a file content.
 *
 * The line endings are normalised before the computation: on Windows, git may
 * convert on read as on write, and a hash that changed depending on the system
 * would report a modification that never happened.
 *
 * @example
 * fingerprint('const a = 1\n') // 'a1b2c3…'
 */
export function fingerprint(content: string): string {
  const normalised = content.replaceAll('\r\n', '\n')
  return createHash('sha256').update(normalised, 'utf8').digest('hex').slice(0, 16)
}

/** Path of the configuration file of a project. */
export function configPath(root: string): string {
  return join(root, CONFIG_FILE)
}

/** What reading a configuration returns. */
export type LoadResult =
  | { readonly ok: true; readonly config: ProjectConfig }
  | {
      readonly ok: false
      readonly reason: 'absent' | 'invalid'
      readonly problems: string[]
    }

/**
 * Reads the `odoro.json` of a project.
 *
 * The absence of the file is not treated as an error of the same nature as a
 * corrupt file: the first case is solved by `odoro init`, the second requires a
 * fix by hand. The two messages must therefore differ.
 *
 * @example
 * const loaded = await loadProject(process.cwd())
 * if (!loaded.ok && loaded.reason === 'absent') console.error('Run `odoro init`.')
 */
export async function loadProject(root: string): Promise<LoadResult> {
  let raw: string
  try {
    raw = await readFile(configPath(root), 'utf8')
  } catch {
    return { ok: false, reason: 'absent', problems: [] }
  }

  let value: unknown
  try {
    value = JSON.parse(raw)
  } catch (error) {
    return {
      ok: false,
      reason: 'invalid',
      problems: [`Unreadable JSON — ${(error as Error).message}`],
    }
  }

  const parsed = z.safeParse(projectSchema, value)
  if (!parsed.success) {
    return {
      ok: false,
      reason: 'invalid',
      problems: parsed.error.issues.map(
        (issue) => `${issue.path.join('.') || CONFIG_FILE} : ${issue.message}`,
      ),
    }
  }

  return { ok: true, config: parsed.data }
}

/**
 * Writes the `odoro.json` of a project.
 *
 * The installed entries are sorted: without that, the order depends on the
 * order of the installs and every `odoro add` would produce an unreadable diff
 * in version control.
 *
 * @example
 * await saveProject(root, { ...config, installed })
 */
export async function saveProject(root: string, config: ProjectConfig): Promise<void> {
  const installed = Object.fromEntries(
    Object.entries(config.installed).sort(([a], [b]) => a.localeCompare(b)),
  )
  const ordered = { ...config, installed }
  await writeFile(configPath(root), `${JSON.stringify(ordered, null, 2)}\n`, 'utf8')
}
