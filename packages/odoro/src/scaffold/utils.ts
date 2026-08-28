/**
 * Utilitaires de l'echafaudage.
 *
 * @module
 */

import { existsSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Gestionnaires de paquets reconnus. */
export const PACKAGE_MANAGERS = ['pnpm', 'npm', 'yarn', 'bun'] as const

/** Un gestionnaire de paquets reconnu. */
export type PackageManager = (typeof PACKAGE_MANAGERS)[number]

/**
 * Deduit le gestionnaire de paquets employe par l'utilisateur.
 *
 * La variable `npm_config_user_agent` est renseignee par tous les
 * gestionnaires ; elle est plus fiable que l'inspection des fichiers de
 * verrouillage, qui n'existent pas encore lors d'une creation.
 *
 * @example
 * detectPackageManager('pnpm/10.28.2 npm/? node/v22.14.0') // 'pnpm'
 */
export function detectPackageManager(
  userAgent: string | undefined = process.env['npm_config_user_agent'],
): PackageManager {
  if (userAgent === undefined) return 'npm'
  const name = userAgent.split(' ')[0]?.split('/')[0]
  return PACKAGE_MANAGERS.find((candidate) => candidate === name) ?? 'npm'
}

/**
 * Commande d'installation des dependances pour un gestionnaire donne.
 *
 * @example
 * installCommand('yarn') // 'yarn'
 */
export function installCommand(manager: PackageManager): string {
  return manager === 'yarn' ? 'yarn' : `${manager} install`
}

/**
 * Commande d'execution d'un script pour un gestionnaire donne.
 *
 * @example
 * runCommand('npm', 'dev') // 'npm run dev'
 */
export function runCommand(manager: PackageManager, script: string): string {
  return manager === 'npm' ? `npm run ${script}` : `${manager} ${script}`
}

/**
 * Transforme un nom de projet en nom de paquet npm valide.
 *
 * @example
 * toPackageName('Mon Super Site !') // 'mon-super-site'
 */
export function toPackageName(input: string): string {
  return (
    input
      .trim()
      .toLowerCase()
      .replace(/^[._]+/, '')
      .replace(/[^a-z0-9\-~]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 214) || 'odoro-app'
  )
}

/**
 * Verifie qu'un nom est un nom de paquet npm acceptable.
 *
 * @returns `undefined` si le nom convient, sinon le motif du refus.
 *
 * @example
 * validatePackageName('Mon Site') // 'Le nom doit etre en minuscules...'
 */
export function validatePackageName(name: string): string | undefined {
  if (name.trim() === '') return 'Le nom du projet ne peut pas etre vide.'
  if (name.length > 214) return 'Le nom du projet ne peut pas depasser 214 caracteres.'
  if (/^[._]/.test(name)) return 'Le nom du projet ne peut pas commencer par "." ou "_".'
  if (!/^[a-z0-9\-~][a-z0-9\-._~]*$/.test(name)) {
    return 'Le nom doit etre en minuscules, sans espace ni caractere special.'
  }
  return undefined
}

/** Etat d'un dossier cible avant echafaudage. */
export type TargetState = 'absent' | 'vide' | 'occupe'

/**
 * Determine l'etat du dossier cible.
 *
 * Un dossier ne contenant que `.git` est considere comme vide : c'est le cas
 * courant d'un depot cree avant le projet.
 *
 * @example
 * inspectTarget('/tmp/mon-site') // 'absent'
 */
export function inspectTarget(directory: string): TargetState {
  if (!existsSync(directory)) return 'absent'
  const entries = readdirSync(directory).filter((entry) => entry !== '.git')
  return entries.length === 0 ? 'vide' : 'occupe'
}

/**
 * Nom de fichier a ecrire pour un fichier de template.
 *
 * npm renomme `.gitignore` en `.npmignore` a la publication : le fichier est
 * donc stocke sous le nom `_gitignore` dans les templates. La regle vaut pour
 * tout fichier commencant par un point.
 *
 * @example
 * targetFileName('_gitignore') // '.gitignore'
 * targetFileName('_env.example') // '.env.example'
 */
export function targetFileName(name: string): string {
  return name.startsWith('_') ? `.${name.slice(1)}` : name
}

/**
 * Racine des templates, resolue depuis l'emplacement du module.
 *
 * Jamais depuis `process.cwd()` : le scaffolder est execute depuis le dossier
 * de l'utilisateur, qui n'a aucun rapport avec l'endroit ou il est installe.
 *
 * @throws {Error} Si le dossier des templates est introuvable.
 *
 * @example
 * const root = templatesRoot()
 */
export function templatesRoot(from: string = fileURLToPath(import.meta.url)): string {
  let directory = dirname(from)

  // Le module vit dans `dist/` une fois publie, et dans `src/scaffold/` en
  // developpement : on remonte jusqu'a trouver le dossier des templates.
  for (let depth = 0; depth < 6; depth += 1) {
    const candidate = join(directory, 'templates')
    if (existsSync(candidate) && statSync(candidate).isDirectory()) return candidate
    const parent = dirname(directory)
    if (parent === directory) break
    directory = parent
  }

  throw new Error('[odoro] Dossier des templates introuvable depuis ' + from)
}

/**
 * Templates disponibles, lus depuis le disque plutot que codes en dur : en
 * ajouter un ne demande alors aucune modification du code.
 *
 * @example
 * availableTemplates() // ['react-ts', 'react-ts-express']
 */
export function availableTemplates(root: string = templatesRoot()): string[] {
  return readdirSync(root)
    .filter((entry) => statSync(resolve(root, entry)).isDirectory())
    .sort()
}
