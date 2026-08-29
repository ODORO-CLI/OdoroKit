/**
 * Preparation d'une installation, sans rien ecrire.
 *
 * Tout ce qui peut echouer — entree inconnue, dependance dans le vide, cycle,
 * reponse invalide — echoue **ici**, avant que le moindre fichier ne soit
 * touche. La commande n'a plus ensuite qu'a demander confirmation et appliquer.
 *
 * C'est ce decoupage qui rend l'installation verifiable : le plan est une
 * valeur ordinaire, qu'un test peut inspecter sans systeme de fichiers ni
 * serveur.
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

/** Ce que rend une preparation. */
export type PrepareResult =
  | {
      readonly ok: true
      /** Entrees a installer, dependances d'abord. */
      readonly entries: readonly PublishedEntry[]
      /** Entrees ajoutees qui n'avaient pas ete demandees. */
      readonly implied: readonly string[]
    }
  | { readonly ok: false; readonly problems: readonly string[] }

/**
 * Suggere les identifiants proches d'un nom inconnu.
 *
 * Une frappe approximative est le cas le plus frequent d'entree introuvable, et
 * « inconnu » tout court oblige a relancer `odoro list` pour rien.
 *
 * La comparaison est volontairement grossiere — sous-chaine commune, ou meme
 * nom dans une autre categorie. Une distance d'edition ferait mieux sur les
 * fautes de frappe, moins bien sur les noms partiels, et personne n'ecrit
 * `odoro add hero/molte` : on ecrit `odoro add molten`.
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
 * Resout les identifiants demandes et telecharge tout ce qu'il faut.
 *
 * Les identifiants peuvent etre donnes sans categorie — `molten` plutot que
 * `hero/molten` — tant qu'ils sont sans ambiguite dans l'index. Une ambiguite
 * est signalee avec les candidats, plutot que tranchee au hasard.
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

  // Etape 1 : ramener chaque demande a un identifiant complet.
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
      problems.push(
        `"${asked}" est ambigu : ${matches.join(', ')}. Precisez la categorie.`,
      )
      continue
    }

    const near = suggest(asked, known)
    problems.push(
      near.length > 0
        ? `"${asked}" est introuvable. Vouliez-vous dire ${near.join(', ')} ?`
        : `"${asked}" est introuvable. "odoro list" donne le catalogue.`,
    )
  }

  if (problems.length > 0) return { ok: false, problems }

  // Etape 2 : resoudre le graphe sur l'index, qui porte deja les dependances.
  // Le faire ici evite de telecharger une entree pour decouvrir ensuite que sa
  // dependance n'existe pas.
  const resolvable = new Map<string, ResolvableEntry>(
    [...catalogue].map(([id, entry]) => [
      id,
      { id, registryDependencies: entry.registryDependencies },
    ]),
  )

  const graph = resolveGraph(ids, resolvable)
  if (!graph.ok) return { ok: false, problems: graph.problems.map(describeProblem) }

  // Etape 3 : telecharger, dans l'ordre d'installation.
  const entries: PublishedEntry[] = []
  for (const id of graph.graph.order) {
    const entry = await registry.entry(id)
    if (!entry.ok) return { ok: false, problems: entry.problems }
    entries.push(entry.value)
  }

  return { ok: true, entries, implied: graph.graph.implied }
}

/** Chemin de destination d'un fichier dans le projet. */
export function targetPath(config: ProjectConfig, target: string): string {
  return posix.join(config.aliases.directory, target)
}

/**
 * Construit le plan d'ecriture d'un ensemble d'entrees.
 *
 * @example
 * const plan = await planInstall(root, config, entries)
 * const remplaces = plan.filter((write) => write.action === 'remplacement')
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
          rewriteImports(source, config.aliases.import),
          entry.id,
        ),
      )
    }
  }

  return plan
}

/**
 * Note dans `odoro.json` ce qui vient d'etre ecrit.
 *
 * L'empreinte est celle du contenu **livre**, pas du fichier relu : c'est ce
 * qui permettra plus tard de distinguer une retouche locale d'un changement
 * amont.
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
