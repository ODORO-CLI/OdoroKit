/**
 * Copie et adaptation d'un template vers le dossier du nouveau projet.
 *
 * @module
 */

import { existsSync, readFileSync } from 'node:fs'
import { mkdir, readFile, readdir, rm, writeFile, copyFile } from 'node:fs/promises'
import { join } from 'node:path'

import { targetFileName, templatesRoot } from './utils.js'

/**
 * La version de la CLI qui tourne.
 *
 * Lue depuis son propre manifeste plutot que figee : une constante recopiee
 * serait juste le jour ou on l'ecrit, et fausse au premier changement de
 * version — c'est-a-dire des la publication suivante.
 */
function cliVersion(): string {
  const manifeste = new URL('../../package.json', import.meta.url)
  try {
    const { version } = JSON.parse(readFileSync(manifeste, 'utf8')) as { version: string }
    return version
  } catch {
    // Un echafaudage doit aboutir meme si le manifeste est illisible. `latest`
    // est plus honnete qu'une version inventee : npm resoudra ce qui existe.
    return 'latest'
  }
}

/** Ce qu'il faut faire d'un dossier cible deja occupe. */
export type OverwriteMode = 'ecraser' | 'fusionner'

/** Options de l'echafaudage. */
export interface ScaffoldOptions {
  /** Dossier de destination, absolu. */
  target: string
  /** Nom du template a copier. */
  template: string
  /** Nom du paquet ecrit dans le `package.json` genere. */
  packageName: string
  /** Conduite a tenir si le dossier cible n'est pas vide. */
  overwrite?: OverwriteMode
  /** Racine des templates. Injectable pour les tests. */
  root?: string
  /**
   * Version a poser sur les paquets Odoro du manifeste.
   *
   * Par defaut celle de la CLI qui echafaude — c'est ce qui garantit que le
   * projet genere demande exactement ce qui vient d'etre publie.
   */
  version?: string
}

/** Resultat d'un echafaudage. */
export interface ScaffoldResult {
  /** Chemins relatifs des fichiers ecrits. */
  readonly files: readonly string[]
}

/** Copie recursivement un dossier de template, en renommant les fichiers pointes. */
async function copyDirectory(
  from: string,
  to: string,
  written: string[],
  prefix = '',
): Promise<void> {
  await mkdir(to, { recursive: true })

  for (const entry of await readdir(from, { withFileTypes: true })) {
    const source = join(from, entry.name)
    const name = targetFileName(entry.name)
    const destination = join(to, name)
    const relativePath = prefix === '' ? name : `${prefix}/${name}`

    if (entry.isDirectory()) {
      await copyDirectory(source, destination, written, relativePath)
      continue
    }

    await copyFile(source, destination)
    written.push(relativePath)
  }
}

/** Les paquets de la famille, dont la version suit celle de la CLI. */
function isOdoroPackage(name: string): boolean {
  return name === 'odoro' || name.startsWith('@odoro-cli/')
}

/**
 * Aligne les paquets Odoro du manifeste sur une version donnee.
 *
 * ## Pourquoi ce n'est pas ecrit dans le gabarit
 *
 * Les gabarits portaient `^0.0.0`, la version d'avant la premiere publication.
 * Un caret sur `0.0.x` est le plus etroit de tous — `^0.0.0` ne correspond
 * qu'a `0.0.0` — donc **chaque projet echafaude echouait a l'installation**,
 * avec une erreur de resolution que personne n'aurait rattachee au gabarit.
 *
 * La version se **deduit** donc de celle de la CLI qui echafaude. Elle ne peut
 * plus deriver : c'est le meme paquet qui ecrit et qui sera installe.
 */
function alignOdoroVersions(
  manifest: Record<string, unknown>,
  version: string,
): Record<string, unknown> {
  const aligned = { ...manifest }

  for (const field of ['dependencies', 'devDependencies', 'peerDependencies']) {
    const deps = aligned[field]
    if (typeof deps !== 'object' || deps === null) continue

    const next: Record<string, string> = {}
    for (const [name, range] of Object.entries(deps as Record<string, string>)) {
      next[name] = isOdoroPackage(name)
        ? version === 'latest'
          ? 'latest'
          : `^${version}`
        : range
    }
    aligned[field] = next
  }

  return aligned
}

/**
 * Reecrit le manifeste genere : le nom du projet, et les versions Odoro.
 *
 * La mise en forme du reste du fichier est preservee — les cles existent deja
 * dans le gabarit, et les reaffecter conserve leur position.
 */
async function renamePackage(
  target: string,
  packageName: string,
  version: string,
): Promise<void> {
  const file = join(target, 'package.json')
  if (!existsSync(file)) return

  const manifest = JSON.parse(await readFile(file, 'utf8')) as Record<string, unknown>
  const renamed = alignOdoroVersions({ ...manifest, name: packageName }, version)
  await writeFile(file, `${JSON.stringify(renamed, null, 2)}\n`, 'utf8')
}

/**
 * Copie un template vers le dossier cible et l'adapte au projet.
 *
 * @throws {Error} Si le template demande n'existe pas.
 *
 * @example
 * await scaffold({
 *   target: '/tmp/mon-site',
 *   template: 'react-ts',
 *   packageName: 'mon-site',
 * })
 */
export async function scaffold(options: ScaffoldOptions): Promise<ScaffoldResult> {
  const root = options.root ?? templatesRoot()
  const source = join(root, options.template)

  if (!existsSync(source)) {
    throw new Error(`[odoro] Template inconnu : "${options.template}".`)
  }

  if (options.overwrite === 'ecraser' && existsSync(options.target)) {
    // Le dossier lui-meme est conserve : l'utilisateur peut s'y trouver, et
    // le supprimer sous ses pieds laisserait son terminal dans un dossier mort.
    for (const entry of await readdir(options.target)) {
      if (entry === '.git') continue
      await rm(join(options.target, entry), { recursive: true, force: true })
    }
  }

  const files: string[] = []
  await copyDirectory(source, options.target, files)
  await renamePackage(
    options.target,
    options.packageName,
    options.version ?? cliVersion(),
  )

  return { files }
}
