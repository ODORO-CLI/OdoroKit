/**
 * Acces au registre, par HTTP ou depuis un dossier local.
 *
 * ## Les deux sources
 *
 * Le cas courant est une URL : le registre est publie, la CLI telecharge.
 * Le cas local — `--registry ../odoro-bits/dist/registry` — sert a developper
 * le registre lui-meme, et a l'usage interne d'un studio qui garde ses
 * composants pour lui.
 *
 * Ce n'est pas un mode degrade : les deux passent par la meme validation. Un
 * composant qui s'installe depuis un dossier local et pas depuis une URL
 * serait un piege, puisque c'est en local qu'on l'essaie.
 *
 * ## Ce qui est verifie a l'arrivee
 *
 * Tout. Le meta est repasse dans le schema, et les sources annoncees par
 * `files` doivent etre presentes. La raison est simple : ce qui arrive ici
 * sera ecrit dans le projet de quelqu'un, et le serveur qui l'envoie n'est pas
 * forcement celui qu'on croit.
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

/** Ce que rend une lecture de registre. */
export type FetchResult<T> =
  | { readonly ok: true; readonly value: T }
  | { readonly ok: false; readonly problems: readonly string[] }

/** Un registre ouvert, quelle que soit sa nature. */
export interface RegistrySource {
  /** Description affichable de l'emplacement. */
  readonly location: string
  /** Lit l'index. */
  index(): Promise<FetchResult<RegistryIndex>>
  /** Lit une entree complete, code source compris. */
  entry(id: string): Promise<FetchResult<PublishedEntry>>
}

/** Indique si une adresse designe un registre distant. */
export function isRemote(location: string): boolean {
  return /^https?:\/\//.test(location)
}

/** Lit un document JSON, d'ou qu'il vienne. */
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
        problems: [`${url} : injoignable — ${(error as Error).message}`],
      }
    }
    if (!response.ok) {
      return { ok: false, problems: [`${url} : reponse ${String(response.status)}.`] }
    }
    try {
      return { ok: true, value: await response.json() }
    } catch {
      return { ok: false, problems: [`${url} : la reponse n'est pas du JSON.`] }
    }
  }

  const file = join(location, relativePath)
  let raw: string
  try {
    raw = await readFile(file, 'utf8')
  } catch {
    return { ok: false, problems: [`${file} : introuvable.`] }
  }
  try {
    return { ok: true, value: JSON.parse(raw) }
  } catch (error) {
    return {
      ok: false,
      problems: [`${file} : JSON illisible — ${(error as Error).message}`],
    }
  }
}

/** Verifie qu'un document a bien la forme d'un index. */
function asIndex(value: unknown, origin: string): FetchResult<RegistryIndex> {
  const candidate = value as Partial<RegistryIndex>
  if (candidate.version !== 1) {
    return {
      ok: false,
      problems: [
        `${origin} : version de format ${String(candidate.version)} non reconnue. Mettez la CLI a jour.`,
      ],
    }
  }
  if (!Array.isArray(candidate.entries)) {
    return {
      ok: false,
      problems: [`${origin} : l'index ne contient aucune liste d'entrees.`],
    }
  }
  return { ok: true, value: candidate as RegistryIndex }
}

/** Verifie qu'un document a bien la forme d'une entree publiee. */
function asEntry(value: unknown, id: string): FetchResult<PublishedEntry> {
  const parsed = parseMeta(value, id)
  if (!parsed.ok) return { ok: false, problems: parsed.problems }

  const sources = (value as { sources?: unknown }).sources
  if (typeof sources !== 'object' || sources === null) {
    return { ok: false, problems: [`${id} : l'entree ne porte aucun code source.`] }
  }

  const record = sources as Record<string, unknown>
  const problems: string[] = []
  for (const file of parsed.meta.files) {
    if (typeof record[file.path] !== 'string') {
      problems.push(`${id} : le fichier annonce "${file.path}" est absent de la reponse.`)
    }
  }
  if (problems.length > 0) return { ok: false, problems }

  return {
    ok: true,
    value: { ...parsed.meta, id, sources: record as Record<string, string> },
  }
}

/**
 * Ouvre un registre.
 *
 * @param location URL ou chemin local. Les chemins relatifs sont resolus
 * depuis `root`, pas depuis le dossier courant : la valeur est notee dans
 * `odoro.json` et doit rester juste quand la commande est lancee ailleurs.
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

/** Rend l'index sous forme de catalogue indexe par identifiant. */
export function indexById(index: RegistryIndex): Map<string, IndexEntry> {
  return new Map(index.entries.map((entry) => [entry.id, entry]))
}
