/**
 * Compilation du registre en fichiers statiques.
 *
 * Produit un fichier JSON par entree, code source inline, plus un index. Ces
 * fichiers sont l'artefact servi en HTTP : la CLI les telecharge, les valide
 * avec le meme schema, et ecrit les sources dans le projet.
 *
 * ## Pourquoi le source est inline
 *
 * L'alternative serait de servir chaque fichier separement et de les designer
 * par URL. Cela multiplierait les allers-retours — une entree de quatre
 * fichiers en demanderait cinq — et surtout, cela rendrait possible qu'une
 * entree soit telechargee a moitie : le meta a jour, les sources encore
 * anciennes, ou l'inverse. Une entree est une unite ; elle est servie comme
 * telle.
 *
 * ## Pourquoi l'index ne contient pas le source
 *
 * L'index est demande par `odoro list` et par la recherche du site. Y inliner
 * le code ferait grossir une reponse consultee souvent avec un contenu dont
 * elle n'a pas l'usage. Il ne porte donc que ce qui sert a choisir : titre,
 * description, cout, backend.
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

/** Ce que rend une compilation reussie. */
export interface BuildReport {
  /** Chemins ecrits, relatifs au dossier de sortie. */
  readonly written: readonly string[]
  /** Nombre d'entrees publiees. */
  readonly count: number
}

/** Resultat d'une compilation. */
export type BuildResult =
  | { readonly ok: true; readonly report: BuildReport }
  | { readonly ok: false; readonly problems: readonly string[] }

/** Reduit une entree a ce que l'index en retient. */
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

/** Serialise en JSON indente, avec le saut de ligne final que git attend. */
function encode(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`
}

/**
 * Compile un registre vers un dossier de sortie.
 *
 * Le dossier est efface avant d'etre reecrit : sans cela, une entree supprimee
 * du depot resterait servie indefiniment.
 *
 * @param root Racine du registre.
 * @param outDir Dossier de sortie.
 * @param now Date de generation. Injectee pour que les tests soient stables.
 *
 * @example
 * const result = await buildRegistry('registry', 'dist/registry')
 */
export async function buildRegistry(
  root: string,
  outDir: string,
  now: Date = new Date(),
): Promise<BuildResult> {
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

    // `directory` est un detail de la mise en depot : il n'a pas de sens pour
    // un client qui recoit l'entree par HTTP.
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

  return { ok: true, report: { written, count: entries.length } }
}

/** Point d'entree du script. */
async function main(): Promise<void> {
  const root = process.argv[2] ?? 'registry'
  const outDir = process.argv[3] ?? join('dist', 'registry')

  const result = await buildRegistry(root, outDir)

  if (!result.ok) {
    console.error(`Compilation impossible — ${result.problems.length} probleme(s) :\n`)
    for (const problem of result.problems) console.error(`  · ${problem}`)
    console.error('')
    process.exitCode = 1
    return
  }

  console.log(
    `Registre compile — ${result.report.count} entree(s) et un index dans ${displayPath(outDir)}.`,
  )
}

if (isMainModule(import.meta.url)) await main()
