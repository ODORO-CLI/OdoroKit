/**
 * Comparaison entre ce qui a ete livre, ce qui est sur le disque, et ce que le
 * registre sert aujourd'hui.
 *
 * ## Trois versions, pas deux
 *
 * Comparer le fichier local au fichier du registre ne dit presque rien : s'ils
 * different, on ne sait pas si c'est parce que l'utilisateur a retouche le
 * sien ou parce que la version amont a evolue. Ce sont pourtant deux
 * situations opposees — la premiere se garde, la seconde se recupere.
 *
 * L'empreinte notee a l'installation fournit le troisieme point de reference.
 * Avec elle, les quatre cas se distinguent sans ambiguite :
 *
 * | local vs livre | amont vs livre | verdict           |
 * | -------------- | -------------- | ----------------- |
 * | identique      | identique      | a jour            |
 * | different      | identique      | retouche localement |
 * | identique      | different      | une mise a jour existe |
 * | different      | different      | divergence        |
 *
 * Le dernier cas est le seul qui demande une decision humaine, et c'est
 * exactement celui qu'une comparaison a deux termes aurait noye dans les
 * autres.
 *
 * @module
 */

import { readFile } from 'node:fs/promises'
import { join } from 'node:path'

import type { PublishedEntry } from '../registry/index.js'
import { fingerprint, type ProjectConfig } from './project.js'
import { rewriteImports } from './rewrite.js'
import type { RegistrySource } from './source.js'

/** Etat d'un fichier installe. */
export type FileState =
  'a-jour' | 'retouche' | 'mise-a-jour' | 'divergence' | 'absent' | 'inconnu'

/** Ce qu'on a appris d'un fichier. */
export interface FileReport {
  /** Chemin dans le projet. */
  readonly path: string
  /** Verdict. */
  readonly state: FileState
  /** Contenu local, si le fichier existe. */
  readonly local: string | null
  /** Contenu servi par le registre, apres reecriture des imports. */
  readonly upstream: string | null
}

/** Ce qu'on a appris d'une entree installee. */
export interface EntryReport {
  /** Identifiant de registre. */
  readonly id: string
  /** Etat de chacun de ses fichiers. */
  readonly files: readonly FileReport[]
  /** Le registre ne sert plus cette entree. */
  readonly orphan: boolean
  /**
   * Entree telle que le registre la sert, ou `null` s'il ne la sert plus.
   *
   * Elle est conservee pour le diagnostic : le `meta` porte les paquets que
   * l'entree reclame, et l'index n'en garde pas assez pour les deduire.
   */
  readonly upstream: PublishedEntry | null
}

/** Phrase decrivant un etat, a la premiere personne du registre. */
export const STATE_LABEL: Record<FileState, string> = {
  'a-jour': 'a jour',
  retouche: 'retouche localement',
  'mise-a-jour': 'une mise a jour existe',
  divergence: 'retouche localement, et le registre a change',
  absent: 'absent du projet',
  inconnu: 'inconnu du registre',
}

/** Croise les trois versions d'un fichier. */
function verdict(
  local: string | null,
  deliveredHash: string,
  upstream: string | null,
): FileState {
  if (local === null) return 'absent'
  if (upstream === null) return 'inconnu'

  const localChanged = fingerprint(local) !== deliveredHash
  const upstreamChanged = fingerprint(upstream) !== deliveredHash

  if (!localChanged && !upstreamChanged) return 'a-jour'
  if (localChanged && !upstreamChanged) return 'retouche'
  if (!localChanged && upstreamChanged) return 'mise-a-jour'
  return 'divergence'
}

/**
 * Compare une entree installee a ce que le registre sert.
 *
 * @param upstream Entree telle qu'elle vient du registre, ou `null` si le
 * registre ne la sert plus.
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

  // Ce que le registre sert aujourd'hui, indexe par destination : c'est la
  // destination, pas le chemin d'origine, qui relie les deux cotes.
  const served = new Map<string, string>()
  if (upstream !== null) {
    for (const file of upstream.files) {
      const source = upstream.sources[file.path]
      if (source !== undefined) {
        served.set(
          join(config.aliases.directory, file.target).replaceAll('\\', '/'),
          rewriteImports(source, config.aliases.import),
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
 * Compare tout ce qui est installe.
 *
 * Une entree que le registre ne sert plus n'est pas une erreur : elle a pu
 * etre renommee, ou le projet peut pointer vers un registre local partiel. Elle
 * est signalee, pas condamnee.
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
 * Rend un apercu des lignes qui different entre deux versions.
 *
 * Ce n'est pas un algorithme de difference : c'est une liste des lignes
 * presentes d'un cote et pas de l'autre, bornee. Un vrai diff appartient a
 * `git diff`, que l'utilisateur a deja ; ce qu'il n'a pas, c'est la version du
 * registre — et cet apercu suffit a decider s'il vaut la peine de la recuperer.
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
