/**
 * Compilation of the registry into static files.
 *
 * Produces one JSON file per entry, source code inline, plus an index. These
 * files are the artefact served over HTTP: the CLI downloads them, validates
 * them with the same schema, and writes the sources into the project.
 *
 * ## Why the source is inline
 *
 * The alternative would be to serve each file separately and to designate
 * them by URL. That would multiply the round trips — an entry of four files
 * would ask for five — and above all, it would make it possible for an entry
 * to be downloaded by halves: the meta up to date, the sources still old, or
 * the other way round. An entry is a unit; it is served as such.
 *
 * ## Why the index does not contain the source
 *
 * The index is asked for by `odoro list` and by the search of the site.
 * Inlining the code in it would inflate a response consulted often with
 * content it has no use for. It therefore carries only what serves to choose:
 * title, description, cost, backend.
 *
 * @module
 */

import { mkdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

import {
  describeProblem,
  toCatalogue,
  validateCatalogue,
  type IndexEntry,
  type PublishedEntry,
  type RegistryIndex,
} from 'odoro/registry'

import { collectRegistry, displayPath, isMainModule } from './collect.js'

/** What a successful compilation returns. */
export interface BuildReport {
  /** Paths written, relative to the output directory. */
  readonly written: readonly string[]
  /** Number of published entries. */
  readonly count: number
}

/** Result of a compilation. */
export type BuildResult =
  | { readonly ok: true; readonly report: BuildReport }
  | { readonly ok: false; readonly problems: readonly string[] }

/** Reduces an entry to what the index keeps of it. */
function toIndexEntry(entry: PublishedEntry): IndexEntry {
  return {
    id: entry.id,
    name: entry.name,
    category: entry.category,
    title: entry.title,
    description: entry.description,
    tier: entry.perf.tier,
    backend: entry.perf.backend,
    registryDependencies: entry.registryDependencies,
  }
}

/** Serialises to indented JSON, with the trailing newline git expects. */
function encode(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`
}

/**
 * Compiles a registry into an output directory.
 *
 * The directory is erased before being rewritten: without that, an entry
 * removed from the repository would stay served indefinitely.
 *
 * ## The drop into the playground is an effect of the script, not of the function
 *
 * Compiling a registry writes into the output directory it is given, and
 * nowhere else. The two drops into the playground are paths **relative to the
 * current directory**: triggered from a test, they overwrite the catalogue of
 * the site with the content of a throwaway registry — two fake entries, or
 * none.
 *
 * It happened. The site ended up with an empty catalogue, without any test
 * failing: the compiled registry, itself, was perfectly correct.
 *
 * The drop is therefore conditional, and only the entry point of the script
 * turns it on.
 *
 * @param root Registry root.
 * @param outDir Output directory.
 * @param options.now Generation date. Injected so that the tests are stable.
 * @param options.publish Also drops the index and the catalogue into the
 *   playground. False by default.
 *
 * @example
 * const result = await buildRegistry('registry', 'dist/registry')
 */
export async function buildRegistry(
  root: string,
  outDir: string,
  options: { readonly now?: Date; readonly publish?: boolean } = {},
): Promise<BuildResult> {
  const { now = new Date(), publish = false } = options
  const collected = await collectRegistry(root)
  if (!collected.ok) return { ok: false, problems: collected.problems }

  const problems = validateCatalogue(toCatalogue(collected.entries)).map(describeProblem)
  if (problems.length > 0) return { ok: false, problems }

  const entries = [...collected.entries].sort((a, b) => a.id.localeCompare(b.id))

  await rm(outDir, { recursive: true, force: true })
  await mkdir(outDir, { recursive: true })

  const written: string[] = []

  for (const entry of entries) {
    const relativePath = `${entry.category}/${entry.name}.json`
    const target = join(outDir, relativePath)
    await mkdir(dirname(target), { recursive: true })

    // `directory` is a detail of the repository layout: it has no meaning for
    // a client that receives the entry over HTTP.
    const { directory: _directory, ...published } = entry
    await writeFile(target, encode(published satisfies PublishedEntry), 'utf8')
    written.push(relativePath)
  }

  const index: RegistryIndex = {
    version: 1,
    generatedAt: now.toISOString(),
    entries: entries.map(toIndexEntry),
  }
  await writeFile(join(outDir, 'index.json'), encode(index), 'utf8')
  written.push('index.json')

  if (publish) {
    await publishCatalogue(index, entries)
    await publishCatalogueModule(entries)
  }

  return { ok: true, report: { written, count: entries.length } }
}

/**
 * Drops the index where the documentation site can read it.
 *
 * ## Why the site does not read the sources
 *
 * The catalogue must list what is **published**, not what lies around in the
 * tree. Reading the sources would let through an entry written but never
 * compiled, and the site would announce a component the CLI would not know
 * how to install.
 *
 * It therefore consumes the artefact, through the same URL as a client — it
 * is the only way for the page not to be able to lie.
 *
 * The write is silent when the directory does not exist: a third-party
 * registry taking this script up has no playground.
 */
async function publishCatalogue(
  index: RegistryIndex,
  entries: readonly (PublishedEntry & { directory: string })[],
): Promise<void> {
  const target = join('..', '..', 'playground', 'public', 'registre')

  try {
    await mkdir(target, { recursive: true })
    await writeFile(join(target, 'index.json'), encode(index), 'utf8')

    // The complete entries, with their code. The page of a component
    // downloads them **on demand**, when the code is asked for — never on the
    // first render. That is the reason they are not in the module of the
    // catalogue: the source weighs ten times the rest, and most visits do not
    // look at it.
    for (const entry of entries) {
      const { directory: _directory, ...published } = entry
      const file = join(target, entry.category, `${entry.name}.json`)
      await mkdir(dirname(file), { recursive: true })
      await writeFile(file, encode(published satisfies PublishedEntry), 'utf8')
    }
  } catch {
    // See the note above.
  }
}

/**
 * Drops the complete metadata as a TypeScript module.
 *
 * ## Why a module rather than a file to download
 *
 * The side navigation lists one entry per component. It must therefore know
 * the catalogue **on the first render**: downloading it would make a column
 * appear empty, then fill in.
 *
 * The source code is removed — it weighs ten times the rest, and a
 * documentation page has no use for it.
 */
async function publishCatalogueModule(
  entries: readonly (PublishedEntry & { directory: string })[],
): Promise<void> {
  // The complete identifier stays in the data: the documentation finds an
  // entry by it, and recomposing it at each read would leave it wrong the day
  // a category is renamed.
  const metas = entries.map(
    ({ sources: _sources, directory: _directory, ...meta }) => meta,
  )

  // The module dropped into the playground stays in French: the playground is
  // out of scope, and its text is the one the site displays.
  const source = [
    '/* Genere par scripts/build-registry.ts. Ne pas editer a la main. */',
    '',
    "import type { RegistryMeta } from 'odoro/registry'",
    '',
    '/** Une entree du registre, sans son code source. */',
    'export type CatalogueEntry = RegistryMeta & { readonly id: string }',
    '',
    '/** Tout ce que le registre publie, dans l ordre alphabetique.',
    ' *',
    ' * La documentation en derive sa navigation, ses pages et ses reglages : une',
    ' * liste ecrite a cote deriverait au premier ajout, sans que rien ne casse.',
    ' */',
    'export const CATALOGUE: readonly CatalogueEntry[] = ' +
      JSON.stringify(metas, null, 2),
    '',
  ].join('\n')

  try {
    await writeFile(
      join('..', '..', 'playground', 'src', 'docs', 'catalogue.generated.ts'),
      source,
      'utf8',
    )
  } catch {
    // A third-party registry has no playground.
  }
}

/** Entry point of the script. */
async function main(): Promise<void> {
  const root = process.argv[2] ?? 'registry'
  const outDir = process.argv[3] ?? join('dist', 'registry')

  const result = await buildRegistry(root, outDir, { publish: true })

  if (!result.ok) {
    console.error(`Compilation impossible — ${result.problems.length} problem(s):\n`)
    for (const problem of result.problems) console.error(`  · ${problem}`)
    console.error('')
    process.exitCode = 1
    return
  }

  console.log(
    `Registry compiled — ${result.report.count} entries and an index in ${displayPath(outDir)}.`,
  )
}

if (isMainModule(import.meta.url)) await main()
