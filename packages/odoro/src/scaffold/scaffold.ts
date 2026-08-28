/**
 * Copie et adaptation d'un template vers le dossier du nouveau projet.
 *
 * @module
 */

import { existsSync } from 'node:fs'
import { mkdir, readFile, readdir, rm, writeFile, copyFile } from 'node:fs/promises'
import { join } from 'node:path'

import { targetFileName, templatesRoot } from './utils.js'

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

/**
 * Reecrit le champ `name` du manifeste genere, en preservant la mise en forme
 * du reste du fichier.
 */
async function renamePackage(target: string, packageName: string): Promise<void> {
  const file = join(target, 'package.json')
  if (!existsSync(file)) return

  const manifest = JSON.parse(await readFile(file, 'utf8')) as Record<string, unknown>
  // La cle existe deja dans le template : la reaffecter conserve sa position
  // dans le fichier, et le manifeste genere reste lisible.
  const renamed = { ...manifest, name: packageName }
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
  await renamePackage(options.target, options.packageName)

  return { files }
}
