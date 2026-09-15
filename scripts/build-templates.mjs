#!/usr/bin/env node
/**
 * Builds the catalogue of site templates.
 *
 * ## Why a script rather than a written list
 *
 * The list and the folders would diverge on the first addition: you copy a
 * template, you forget the line, and it shows up nowhere — without anything
 * failing, since an incomplete list is still a valid list. The folder is
 * therefore the source of truth, and the catalogue is derived from it.
 *
 * ## The order is declared, not guessed
 *
 * Alphabetical sorting would put the starting point before the finished sites,
 * which is the opposite of what we want to show. Each manifest therefore
 * carries its own `order`, and the script sorts on it. On a tie, the name
 * decides — without which the order would depend on the file system's, which
 * is not the same everywhere.
 *
 * ## What is checked
 *
 * That a manifest exists, that it carries the fields the page consumes, and
 * that the preview image it declares is actually there. A missing preview is
 * the most likely defect — it is the only piece that is not produced by
 * writing text — and the only one that would go unseen before going live.
 *
 * Usage:
 *
 *     node scripts/build-templates.mjs
 *
 * @module
 */

import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE = join(ROOT, 'templates')

/** The fields an entry must carry for the page to know how to display it. */
const REQUIRED = ['name', 'title', 'description', 'kind', 'order', 'stack', 'licence']

/** Recognised template kinds. */
const KINDS = ['site', 'starter', 'library']

/** Reads and checks a manifest. */
function read(name) {
  const path = join(SOURCE, name, 'template.json')
  if (!existsSync(path)) return { name, problems: ['no template.json'] }

  let meta
  try {
    meta = JSON.parse(readFileSync(path, 'utf8'))
  } catch (cause) {
    return { name, problems: [`unreadable template.json: ${String(cause)}`] }
  }

  const problems = []
  for (const field of REQUIRED) {
    if (meta[field] === undefined) problems.push(`missing field: ${field}`)
  }
  if (meta.name !== name) {
    problems.push(`the declared name (${String(meta.name)}) does not match the folder`)
  }
  if (meta.kind !== undefined && !KINDS.includes(meta.kind)) {
    problems.push(`unknown kind: ${String(meta.kind)}`)
  }

  // The preview is the only piece that is not written: it is photographed, and
  // it is therefore the one we forget.
  if (meta.preview !== undefined && !existsSync(join(SOURCE, name, meta.preview))) {
    problems.push(`preview declared but absent: ${String(meta.preview)}`)
  }

  return { name, meta, problems }
}

/** Renders the module the documentation consumes. */
function catalogueModule(entries) {
  return [
    '/* Genere par scripts/build-templates.mjs. Ne pas editer a la main. */',
    '',
    '/** Un template de site, tel que le catalogue le publie. */',
    'export interface TemplateEntry {',
    '  readonly name: string',
    '  readonly title: string',
    '  readonly description: string',
    "  readonly kind: 'site' | 'starter' | 'library'",
    '  readonly order: number',
    '  readonly stack: readonly string[]',
    '  readonly tags?: readonly string[]',
    '  readonly source?: string',
    '  readonly licence: string',
    '  readonly install?: string',
    '  readonly dev?: string',
    '  readonly preview?: string',
    '}',
    '',
    '/** Les templates, deja tries : les sites, le point de depart, la bibliotheque. */',
    'export const TEMPLATES: readonly TemplateEntry[] = ' +
      JSON.stringify(entries, null, 2),
    '',
  ].join('\n')
}

const folders = readdirSync(SOURCE).filter((name) =>
  statSync(join(SOURCE, name)).isDirectory(),
)

const entriesRead = folders.map(read)
const problems = entriesRead.flatMap(({ name, problems }) =>
  problems.map((p) => `${name}: ${p}`),
)

if (problems.length > 0) {
  console.error(`Invalid catalogue — ${problems.length} problem(s):\n`)
  for (const problem of problems) console.error(`  · ${problem}`)
  console.error('')
  process.exitCode = 1
} else {
  // The declared order first, the name to break the tie: without the second,
  // two templates of the same rank would be ordered by the file system.
  const entries = entriesRead
    .map(({ meta }) => meta)
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))

  writeFileSync(
    join(SOURCE, 'index.json'),
    `${JSON.stringify(entries, null, 2)}\n`,
    'utf8',
  )
  writeFileSync(
    join(ROOT, 'playground', 'src', 'docs', 'templates.generated.ts'),
    catalogueModule(entries),
    'utf8',
  )

  const withoutPreview = entries.filter((e) => e.preview === undefined).map((e) => e.name)
  console.log(`Catalogue compiled — ${entries.length} template(s).`)
  if (withoutPreview.length > 0) {
    console.log(`  Without preview: ${withoutPreview.join(', ')}.`)
  }
}
