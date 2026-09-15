/**
 * Access to the registry, over HTTP or from a local directory.
 *
 * ## The two sources
 *
 * The common case is a URL: the registry is published, the CLI downloads. The
 * local case — `--registry ../odoro-bits/dist/registry` — serves the
 * development of the registry itself, and the internal use of a studio keeping
 * its components to itself.
 *
 * It is not a degraded mode: both go through the same validation. A component
 * that installs from a local directory and not from a URL would be a trap,
 * since it is locally that one tries it.
 *
 * ## What is checked on arrival
 *
 * Everything. The meta goes back through the schema, and the sources announced
 * by `files` must be present. The reason is simple: what arrives here will be
 * written into someone's project, and the server that sends it is not
 * necessarily the one you think.
 *
 * @module
 */

import { readFile } from 'node:fs/promises'
import { isAbsolute, join, resolve } from 'node:path'

import {
  parseMeta,
  type IndexEntry,
  type PublishedEntry,
  type RegistryIndex,
} from '../registry/index.js'

/** What reading the registry returns. */
export type FetchResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly problems: readonly string[] }

/** An open registry, whatever its nature. */
export interface RegistrySource {
  /** Printable description of the location. */
  readonly location: string
  /** Reads the index. */
  index(): Promise<FetchResult<RegistryIndex>>
  /** Reads a complete entry, source code included. */
  entry(id: string): Promise<FetchResult<PublishedEntry>>
}

/** Tells whether an address designates a remote registry. */
export function isRemote(location: string): boolean {
  return /^https?:\/\//.test(location)
}

/** Reads a JSON document, wherever it comes from. */
async function readDocument(
  location: string,
  relativePath: string,
): Promise<FetchResult<unknown>> {
  if (isRemote(location)) {
    const url = `${location.replace(/\/$/, '')}/${relativePath}`
    let response: Response
    try {
      response = await fetch(url)
    } catch (error) {
      return {
        ok: false,
        problems: [`${url} : unreachable — ${(error as Error).message}`],
      }
    }
    if (!response.ok) {
      return { ok: false, problems: [`${url} : response ${String(response.status)}.`] }
    }
    try {
      return { ok: true, value: await response.json() }
    } catch {
      return { ok: false, problems: [`${url} : the response is not JSON.`] }
    }
  }

  const file = join(location, relativePath)
  let raw: string
  try {
    raw = await readFile(file, 'utf8')
  } catch {
    return { ok: false, problems: [`${file} : not found.`] }
  }
  try {
    return { ok: true, value: JSON.parse(raw) }
  } catch (error) {
    return {
      ok: false,
      problems: [`${file} : unreadable JSON — ${(error as Error).message}`],
    }
  }
}

/** Checks that a document really has the shape of an index. */
function asIndex(value: unknown, origin: string): FetchResult<RegistryIndex> {
  const candidate = value as Partial<RegistryIndex>
  if (candidate.version !== 1) {
    return {
      ok: false,
      problems: [
        `${origin} : format version ${String(candidate.version)} not recognised. Update the CLI.`,
      ],
    }
  }
  if (!Array.isArray(candidate.entries)) {
    return {
      ok: false,
      problems: [`${origin} : the index holds no list of entries.`],
    }
  }
  return { ok: true, value: candidate as RegistryIndex }
}

/** Checks that a document really has the shape of a published entry. */
function asEntry(value: unknown, id: string): FetchResult<PublishedEntry> {
  const parsed = parseMeta(value, id)
  if (!parsed.ok) return { ok: false, problems: parsed.problems }

  const sources = (value as { sources?: unknown }).sources
  if (typeof sources !== 'object' || sources === null) {
    return { ok: false, problems: [`${id} : the entry carries no source code.`] }
  }

  const record = sources as Record<string, unknown>
  const problems: string[] = []
  for (const file of parsed.meta.files) {
    if (typeof record[file.path] !== 'string') {
      problems.push(
        `${id} : the announced file "${file.path}" is missing from the response.`,
      )
    }
  }
  if (problems.length > 0) return { ok: false, problems }

  return {
    ok: true,
    value: { ...parsed.meta, id, sources: record as Record<string, string> },
  }
}

/**
 * Opens a registry.
 *
 * @param location URL or local path. Relative paths are resolved from `root`,
 * not from the current directory: the value is recorded in `odoro.json` and
 * must stay right when the command is run somewhere else.
 *
 * @example
 * const registry = openRegistry('https://register.odoro.dev', process.cwd())
 */
export function openRegistry(location: string, root: string): RegistrySource {
  const resolved = isRemote(location)
    ? location
    : isAbsolute(location)
      ? location
      : resolve(root, location)

  return {
    location: resolved,

    async index() {
      const document = await readDocument(resolved, 'index.json')
      if (!document.ok) return document
      return asIndex(document.value, `${resolved}/index.json`)
    },

    async entry(id: string) {
      const document = await readDocument(resolved, `${id}.json`)
      if (!document.ok) return document
      return asEntry(document.value, id)
    },
  }
}

/** Returns the index as a catalogue indexed by identifier. */
export function indexById(index: RegistryIndex): Map<string, IndexEntry> {
  return new Map(index.entries.map((entry) => [entry.id, entry]))
}
