/**
 * Scaffolding utilities.
 *
 * @module
 */

import { existsSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

/** Recognised package managers. */
export const PACKAGE_MANAGERS = ['pnpm', 'npm', 'yarn', 'bun'] as const

/** A recognised package manager. */
export type PackageManager = (typeof PACKAGE_MANAGERS)[number]

/**
 * Infers the package manager the user works with.
 *
 * The `npm_config_user_agent` variable is filled in by every manager; it is
 * more reliable than inspecting the lockfiles, which do not exist yet during a
 * creation.
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
 * Dependency install command for a given manager.
 *
 * @example
 * installCommand('yarn') // 'yarn'
 */
export function installCommand(manager: PackageManager): string {
  return manager === 'yarn' ? 'yarn' : `${manager} install`
}

/**
 * Script run command for a given manager.
 *
 * @example
 * runCommand('npm', 'dev') // 'npm run dev'
 */
export function runCommand(manager: PackageManager, script: string): string {
  return manager === 'npm' ? `npm run ${script}` : `${manager} ${script}`
}

/**
 * Turns a project name into a valid npm package name.
 *
 * @example
 * toPackageName('My Great Site !') // 'my-great-site'
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
 * Checks that a name is an acceptable npm package name.
 *
 * @returns `undefined` when the name is fine, otherwise the reason for the
 *   refusal.
 *
 * @example
 * validatePackageName('My Site') // 'The name must be lowercase...'
 */
export function validatePackageName(name: string): string | undefined {
  if (name.trim() === '') return 'The project name cannot be empty.'
  if (name.length > 214) return 'The project name cannot exceed 214 characters.'
  if (/^[._]/.test(name)) return 'The project name cannot start with "." or "_".'
  if (!/^[a-z0-9\-~][a-z0-9\-._~]*$/.test(name)) {
    return 'The name must be lowercase, without spaces or special characters.'
  }
  return undefined
}

/** State of a target directory before scaffolding. */
export type TargetState = 'absent' | 'empty' | 'occupied'

/**
 * Determines the state of the target directory.
 *
 * A directory holding only `.git` is considered empty: that is the common case
 * of a repository created before the project.
 *
 * @example
 * inspectTarget('/tmp/my-site') // 'absent'
 */
export function inspectTarget(directory: string): TargetState {
  if (!existsSync(directory)) return 'absent'
  const entries = readdirSync(directory).filter((entry) => entry !== '.git')
  return entries.length === 0 ? 'empty' : 'occupied'
}

/**
 * File name to write for a template file.
 *
 * npm renames `.gitignore` to `.npmignore` at publication: the file is
 * therefore stored under the name `_gitignore` in the templates. The rule
 * applies to any file starting with a dot.
 *
 * @example
 * targetFileName('_gitignore') // '.gitignore'
 * targetFileName('_env.example') // '.env.example'
 */
export function targetFileName(name: string): string {
  return name.startsWith('_') ? `.${name.slice(1)}` : name
}

/**
 * Root of the templates, resolved from the location of the module.
 *
 * Never from `process.cwd()`: the scaffolder runs from the user directory,
 * which has nothing to do with where it is installed.
 *
 * @throws {Error} When the templates directory cannot be found.
 *
 * @example
 * const root = templatesRoot()
 */
export function templatesRoot(from: string = fileURLToPath(import.meta.url)): string {
  let directory = dirname(from)

  // The module lives in `dist/` once published, and in `src/scaffold/` during
  // development: we climb until we find the templates directory.
  for (let depth = 0; depth < 6; depth += 1) {
    const candidate = join(directory, 'templates')
    if (existsSync(candidate) && statSync(candidate).isDirectory()) return candidate
    const parent = dirname(directory)
    if (parent === directory) break
    directory = parent
  }

  throw new Error('[odoro] Templates directory not found from ' + from)
}

/**
 * Available templates, read from disk rather than hard coded: adding one then
 * requires no change to the code.
 *
 * @example
 * availableTemplates() // ['react-ts', 'react-ts-server']
 */
export function availableTemplates(root: string = templatesRoot()): string[] {
  return readdirSync(root)
    .filter((entry) => statSync(resolve(root, entry)).isDirectory())
    .sort()
}
