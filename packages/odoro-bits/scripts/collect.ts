/**
 * Lecture du registre depuis le disque.
 *
 * Le registre est une arborescence : `registry/<categorie>/<nom>/`, contenant
 * un `meta.json` et les fichiers que la CLI copiera. Ce module la parcourt et
 * en tire soit un catalogue valide, soit la liste complete de ce qui cloche.
 *
 * ## Pourquoi tout collecter avant d'echouer
 *
 * S'arreter a la premiere erreur obligerait a relancer la validation une fois
 * par probleme. Sur un registre de quarante composants, apres un changement de
 * format, cela fait quarante allers-retours. Les problemes sont donc tous
 * rassembles, puis rendus d'un bloc.
 *
 * ## Ce que le schema ne peut pas verifier
 *
 * Le schema valide la **forme** d'un `meta.json`, mais il ne connait ni le
 * disque ni les autres entrees. Trois verifications lui echappent et sont
 * faites ici : qu'un fichier declare existe reellement, que le nom et la
 * categorie correspondent au dossier qui les contient, et — dans le module de
 * resolution — qu'une dependance de registre pointe vers quelque chose.
 *
 * @module
 */

import { readdir, readFile } from 'node:fs/promises'
import { join, relative, resolve, sep } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  entryId,
  parseMeta,
  type PublishedEntry,
  type RegistryMeta,
} from 'odoro/registry'

/** Une entree lue sur le disque. */
export interface CollectedEntry extends PublishedEntry {
  /** Dossier du composant, relatif a la racine du registre. */
  readonly directory: string
}

/** Resultat d'une collecte. */
export type CollectResult =
  | { readonly ok: true; readonly entries: readonly CollectedEntry[] }
  | { readonly ok: false; readonly problems: readonly string[] }

/**
 * Ecrit un chemin avec des barres obliques.
 *
 * Les identifiants et les messages du registre doivent se lire pareil quel que
 * soit le systeme : un `text\demo` dans une erreur ne correspondrait a rien de
 * ce que l'utilisateur ecrit dans sa ligne de commande.
 */
function posix(path: string): string {
  return path.split(sep).join('/')
}

/** Liste les sous-dossiers directs, en ignorant les fichiers. */
async function subdirectories(directory: string): Promise<string[]> {
  const entries = await readdir(directory, { withFileTypes: true })
  return entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort()
}

/**
 * Lit une entree unique.
 *
 * @param root Racine du registre.
 * @param category Nom du dossier de categorie.
 * @param name Nom du dossier du composant.
 */
async function collectEntry(
  root: string,
  category: string,
  name: string,
  problems: string[],
): Promise<CollectedEntry | null> {
  const directory = join(category, name)
  const origin = posix(directory)
  const metaPath = join(root, directory, 'meta.json')

  let raw: string
  try {
    raw = await readFile(metaPath, 'utf8')
  } catch {
    problems.push(`${origin} : aucun meta.json dans ce dossier.`)
    return null
  }

  let value: unknown
  try {
    value = JSON.parse(raw)
  } catch (error) {
    problems.push(`${origin}/meta.json : JSON illisible — ${(error as Error).message}`)
    return null
  }

  const parsed = parseMeta(value, origin)
  if (!parsed.ok) {
    problems.push(...parsed.problems)
    return null
  }

  const meta: RegistryMeta = parsed.meta

  // Le dossier est l'identifiant reel : la CLI et l'index s'y referent. Un
  // ecart entre les deux donnerait une entree introuvable a l'adresse ou tout
  // le monde la cherche.
  if (meta.category !== category) {
    problems.push(
      `${origin} : la categorie declaree (${meta.category}) ne correspond pas au dossier (${category}).`,
    )
  }
  if (meta.name !== name) {
    problems.push(
      `${origin} : le nom declare (${meta.name}) ne correspond pas au dossier (${name}).`,
    )
  }

  const sources: Record<string, string> = {}
  for (const file of meta.files) {
    try {
      const raw = await readFile(join(root, directory, file.path), 'utf8')
      // Les fins de ligne sont normalisees : l'artefact est servi a toutes les
      // plateformes, et il n'y a aucune raison qu'un composant publie depuis
      // une machine Windows arrive different de la version publiee ailleurs.
      sources[file.path] = raw.replaceAll('\r\n', '\n')
    } catch {
      problems.push(`${origin} : le fichier declare "${file.path}" est introuvable.`)
    }
  }

  if (Object.keys(sources).length !== meta.files.length) return null

  return { ...meta, id: entryId(meta), directory: origin, sources }
}

/**
 * Parcourt un registre et en lit toutes les entrees.
 *
 * Les dossiers de categorie inconnus sont signales plutot qu'ignores : un
 * dossier mal nomme deviendrait autrement un composant invisible, present dans
 * le depot mais absent de tout ce qui est publie.
 *
 * @param root Racine du registre, contenant les dossiers de categorie.
 *
 * @example
 * const result = await collectRegistry('registry')
 * if (!result.ok) console.error(result.problems.join('\n'))
 */
export async function collectRegistry(root: string): Promise<CollectResult> {
  const problems: string[] = []
  const entries: CollectedEntry[] = []

  let categories: string[]
  try {
    categories = await subdirectories(root)
  } catch {
    return { ok: false, problems: [`Racine de registre introuvable : ${root}`] }
  }

  for (const category of categories) {
    for (const name of await subdirectories(join(root, category))) {
      const entry = await collectEntry(root, category, name, problems)
      if (entry !== null) entries.push(entry)
    }
  }

  // Deux dossiers ne peuvent pas produire le meme identifiant — mais un nom
  // declare de travers, lui, le pourrait.
  const seen = new Set<string>()
  for (const entry of entries) {
    if (seen.has(entry.id)) {
      problems.push(`${entry.directory} : identifiant deja pris — ${entry.id}.`)
    }
    seen.add(entry.id)
  }

  if (problems.length > 0) return { ok: false, problems }
  return { ok: true, entries }
}

/** Chemin du registre par rapport au dossier courant, pour l'affichage. */
export function displayPath(root: string): string {
  const shown = relative(process.cwd(), root)
  return shown === '' ? '.' : posix(shown)
}

/**
 * Indique si le module courant est celui que Node a demarre.
 *
 * Les scripts du registre sont a la fois des executables et des modules
 * importes par les tests. La comparaison passe par `fileURLToPath` : sous
 * Windows, l'URL et le chemin d'argument ne s'ecrivent pas pareil.
 *
 * @example
 * if (isMainModule(import.meta.url)) await main()
 */
export function isMainModule(url: string): boolean {
  const started = process.argv[1]
  if (started === undefined) return false
  return fileURLToPath(url) === resolve(started)
}
