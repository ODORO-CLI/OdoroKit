/**
 * Copy and adaptation of a template into the directory of the new project.
 *
 * @module
 */

import { existsSync, readFileSync } from 'node:fs'
import { mkdir, readFile, readdir, rm, writeFile, copyFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'

import {
  DEFAULT_MODULES,
  keepsRoutes,
  packagesFor,
  variantsFor,
  type ModuleId,
} from './modules.js'
import { targetFileName, templatesRoot } from './utils.js'
import { FAMILY_VERSIONS } from './family-versions.generated.js'

/**
 * The variants directory, at the root of a template.
 *
 * It is never copied: its files are laid **over** the project once the template
 * is written, and only those of the chosen variant. Copying it would deliver
 * the three versions of `App.tsx` into the generated project.
 *
 * The name starts with an underscore like the other dotted files of the
 * template, but for a different reason: here it tells the copier to walk past.
 */
const VARIANTS_DIRECTORY = '_variants'

/** The packages of the family the creator knows how to add or remove. */
const OPTIONAL_PACKAGES = ['@odoro-cli/libs', '@odoro-cli/icons', '@odoro-cli/engine']

/**
 * The version of the CLI that is running.
 *
 * Read from its own manifest rather than frozen: a copied constant would be
 * right the day it is written, and wrong at the first version change — that is,
 * at the very next publication.
 *
 * ## The path is searched for, not counted
 *
 * `../../package.json` from `import.meta.url` is right from the sources and
 * wrong once packed: the module then lives in `dist/`, one level higher. The
 * fallback therefore fired systematically, and scaffolded projects received
 * `latest` — which works today and would install a future major version
 * tomorrow.
 *
 * The templates directory sits at the root of the package, and `templatesRoot`
 * already knows how to find it from both locations. Its parent is therefore the
 * root we are after, without counting levels.
 */
function cliVersion(): string {
  try {
    const manifest = join(dirname(templatesRoot()), 'package.json')
    const { version } = JSON.parse(readFileSync(manifest, 'utf8')) as { version: string }
    return version
  } catch {
    // A scaffolding must succeed even when the manifest cannot be found.
    // `latest` is more honest than an invented version: npm will resolve what
    // exists. This fallback must no longer fire, and a test checks it.
    return 'latest'
  }
}

/**
 * What to do with an already occupied target directory.
 *
 * The values keep their French spelling: the scaffolding test of the templates
 * names them.
 */
export type OverwriteMode = 'ecraser' | 'fusionner'

/** Scaffolding options. */
export interface ScaffoldOptions {
  /** Destination directory, absolute. */
  target: string
  /** Name of the template to copy. */
  template: string
  /** Package name written into the generated `package.json`. */
  packageName: string
  /** What to do when the target directory is not empty. */
  overwrite?: OverwriteMode
  /** Root of the templates. Injectable for the tests. */
  root?: string
  /**
   * Version to set on the Odoro packages of the manifest.
   *
   * By default the one of the scaffolding CLI — that is what guarantees that
   * the generated project asks for exactly what has just been published.
   */
  version?: string
  /**
   * The modules kept at creation time.
   *
   * The selection must have gone through `resolveModules`: the scaffolder
   * applies what it is given and corrects nothing, so that a refusal is
   * explained where it is decided rather than here, in silence.
   *
   * By default, those the catalogue ticks.
   */
  modules?: readonly ModuleId[]
}

/** Result of a scaffolding run. */
export interface ScaffoldResult {
  /** Relative paths of the written files. */
  readonly files: readonly string[]
}

/** Recursively copies a template directory, renaming the dotted files. */
async function copyDirectory(
  from: string,
  to: string,
  written: string[],
  prefix = '',
): Promise<void> {
  await mkdir(to, { recursive: true })

  for (const entry of await readdir(from, { withFileTypes: true })) {
    // At the root of the template only: a project is perfectly entitled to have
    // a directory of that name further down its tree.
    if (prefix === '' && entry.name === VARIANTS_DIRECTORY) continue

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

/** The packages of the family. */
function isOdoroPackage(name: string): boolean {
  return name === 'odoro' || name.startsWith('@odoro-cli/')
}

/**
 * The version to ask for, for a package of the family.
 *
 * ## Why it is no longer the CLI one for all
 *
 * It was, and that was right as long as the configuration kept the six
 * packages in a `fixed` group: they moved together, so the number of one was
 * good for all.
 *
 * That group was removed — a minor on the libraries dragged the engine into a
 * major. `odoro` at 1.0.3 then started asking for `@odoro-cli/libs@^1.0.3`,
 * still at 1.0.2: a version that does not exist, and an `npm install` that
 * fails as soon as the project is created.
 *
 * The numbers of the neighbours are therefore collected at build time, where
 * the six manifests sit side by side — see `scripts/family-versions.mjs`. The
 * CLI one is still read from its own manifest: it is the only one known at
 * runtime, and the only one that can serve as a fallback.
 */
function requestedVersion(name: string, cli: string): string {
  if (cli === 'latest') return 'latest'
  if (name === 'odoro') return `^${cli}`

  const collected = FAMILY_VERSIONS[name]
  // A package missing from the collection is not one of ours, or has just been
  // added without rebuilding. `latest` resolves what exists, where an invented
  // version would resolve nothing.
  return collected === undefined ? 'latest' : `^${collected}`
}

/**
 * Aligns the Odoro packages of the manifest on a given version.
 *
 * ## Why this is not written in the template
 *
 * The templates carried `^0.0.0`, the version from before the first
 * publication. A caret on `0.0.x` is the narrowest of all — `^0.0.0` matches
 * only `0.0.0` — so **every scaffolded project failed at install**, with a
 * resolution error nobody would have connected to the template.
 *
 * The version is therefore **derived** from the one of the scaffolding CLI. It
 * can no longer drift: it is the same package that writes and that will be
 * installed.
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
      next[name] = isOdoroPackage(name) ? requestedVersion(name, version) : range
    }
    aligned[field] = next
  }

  return aligned
}

/**
 * Adjusts the dependencies of the manifest to the modules kept.
 *
 * The templates declare the complete case; what was not ticked is **removed**
 * from it, and what was ticked is **added** when it was missing. Both
 * directions count: a template cannot carry every combination up front, and
 * carrying none would force rewriting the whole list here.
 *
 * `@odoro-cli/server` is never touched: it does not come from a tick box but
 * from the chosen template, and removing it would leave a server without its
 * base.
 */
function adjustModules(
  manifest: Record<string, unknown>,
  modules: readonly ModuleId[],
): Record<string, unknown> {
  const wanted = new Set(packagesFor(modules))
  const deps = { ...((manifest['dependencies'] ?? {}) as Record<string, string>) }

  for (const packageName of OPTIONAL_PACKAGES) {
    if (wanted.has(packageName)) deps[packageName] ??= 'latest'
    else delete deps[packageName]
  }

  // The keys are sorted: without that, adding a package would put it at the end
  // of the list, and two projects with the same modules would have different
  // manifests.
  return {
    ...manifest,
    dependencies: Object.fromEntries(
      Object.entries(deps).sort(([a], [b]) => a.localeCompare(b)),
    ),
  }
}

/**
 * Lays the files of a variant over the project.
 *
 * They already carry the path they must land at — `src/App.tsx` for the simple
 * template, `client/src/App.tsx` for the server one — so there is nothing to
 * translate: we copy them as they are.
 *
 * @throws {Error} When the requested variant does not exist in the template.
 */
async function layVariant(
  source: string,
  target: string,
  name: string,
): Promise<readonly string[]> {
  const root = join(source, VARIANTS_DIRECTORY, name)
  if (!existsSync(root)) {
    throw new Error(`[odoro] Template variant not found: "${name}".`)
  }

  const laid: string[] = []
  await copyDirectory(root, target, laid)
  return laid
}

/**
 * Rewrites the generated manifest: the project name, and the Odoro versions.
 *
 * The formatting of the rest of the file is preserved — the keys already exist
 * in the template, and reassigning them keeps their position.
 */
async function renamePackage(
  target: string,
  packageName: string,
  version: string,
  modules: readonly ModuleId[],
): Promise<void> {
  const file = join(target, 'package.json')
  if (!existsSync(file)) return

  const manifest = JSON.parse(await readFile(file, 'utf8')) as Record<string, unknown>
  // The modules first, the versions next: a package that has just been added
  // must receive the CLI version like the others, rather than staying on the
  // `latest` that serves as its starting value.
  const adjusted = adjustModules({ ...manifest, name: packageName }, modules)
  const renamed = alignOdoroVersions(adjusted, version)
  await writeFile(file, `${JSON.stringify(renamed, null, 2)}\n`, 'utf8')
}

/**
 * Copies a template into the target directory and adapts it to the project.
 *
 * @throws {Error} When the requested template does not exist.
 *
 * @example
 * await scaffold({
 *   target: '/tmp/my-site',
 *   template: 'react-ts',
 *   packageName: 'my-site',
 * })
 */
export async function scaffold(options: ScaffoldOptions): Promise<ScaffoldResult> {
  const root = options.root ?? templatesRoot()
  const source = join(root, options.template)

  if (!existsSync(source)) {
    throw new Error(`[odoro] Unknown template: "${options.template}".`)
  }

  if (options.overwrite === 'ecraser' && existsSync(options.target)) {
    // The directory itself is kept: the user may be sitting in it, and deleting
    // it under their feet would leave their terminal in a dead directory.
    for (const entry of await readdir(options.target)) {
      if (entry === '.git') continue
      await rm(join(options.target, entry), { recursive: true, force: true })
    }
  }

  const modules = options.modules ?? DEFAULT_MODULES

  const files: string[] = []
  await copyDirectory(source, options.target, files)

  // `router.tsx` is the only file that names the routing dependency. Without
  // the router nothing imports it, and its own import would not resolve: it
  // goes with it.
  if (!keepsRoutes(modules)) {
    for (const file of ['src/router.tsx', 'client/src/router.tsx']) {
      await rm(join(options.target, file), { force: true })
    }
  }

  // In the returned order: a variant laid later overwrites what a previous one
  // would have written at the same path.
  const laid: string[] = []
  for (const variant of variantsFor(modules)) {
    laid.push(...(await layVariant(source, options.target, variant)))
  }

  await renamePackage(
    options.target,
    options.packageName,
    options.version ?? cliVersion(),
    modules,
  )

  // What the variant laid replaces a file already counted: announcing it twice
  // would inflate the number shown at the end of the creation.
  const removed = new Set(['src/router.tsx', 'client/src/router.tsx'])
  const listed = new Set([
    ...files.filter((file) => keepsRoutes(modules) || !removed.has(file)),
    ...laid,
  ])

  return { files: [...listed].sort() }
}
