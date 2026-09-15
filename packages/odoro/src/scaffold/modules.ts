/**
 * What the creator offers to put in the project.
 *
 * ## Why a catalogue, and not a list of packages
 *
 * The three things one wants to tick are not of the same nature, and a list of
 * packages would lie about two of them:
 *
 * - **the libraries** and **the engine** really are npm packages;
 * - **the router** is not one. It lives in `@odoro-cli/libs/router`, a subpath
 *   of the libraries. Ticking it therefore installs nothing more: it **wires**
 *   the router into the generated application, and unticking it returns a
 *   single-page application;
 * - **the registry** is not one either. Its entries are copied into the project
 *   by `odoro add`, one by one, and no package carries its name. Ticking it
 *   writes `odoro.json` — destination, import prefix, registry address — and
 *   pulls in the engine, which 455 of its 461 entries import.
 *
 * Each entry therefore carries what it really does, and the creator uses that
 * rather than guessing.
 *
 * ## A box that cannot be unticked is a box that lies
 *
 * The libraries are ticked by default, and they can be unticked for good: the
 * project then starts without the Odoro stylesheet, without `o-*` classes and
 * without the router — a bare React base, with ordinary CSS. That is a
 * legitimate choice for someone bringing their own styling system, and it was
 * better to make it true than to display a locked box.
 *
 * Both constraints are common sense: without the libraries there is no router,
 * since that is where it lives; and the registry pulls in the engine, without
 * which almost none of its entries would build. `resolveModules` takes care of
 * it, and says so rather than correcting in silence.
 *
 * @module
 */

/**
 * A module offered at creation time.
 *
 * `registre` keeps its French spelling: it is the value `--modules` accepts,
 * and the scaffolding test of the templates names it.
 */
export type ModuleId = 'libs' | 'router' | 'icons' | 'engine' | 'registre'

/** What is known about a module. */
export interface Module {
  readonly id: ModuleId
  /** Label shown in the list. */
  readonly label: string
  /** Detail shown in grey, to the right of the label. */
  readonly hint: string
  /** Ticked when the list opens. */
  readonly ticked: boolean
  /**
   * The npm package to add to the dependencies, when there is one.
   *
   * Absent for `router` and `registre`: see the module header.
   */
  readonly packageName?: string
}

/**
 * The catalogue, in display order.
 *
 * The order is not alphabetical but goes from the base to the extra: what is
 * rarely unticked first, what is added now and then afterwards.
 */
export const MODULES: readonly Module[] = [
  {
    id: 'libs',
    label: 'Libraries',
    hint: 'styles, tokens, UI and motion',
    ticked: true,
    packageName: '@odoro-cli/libs',
  },
  {
    id: 'router',
    label: 'Router',
    hint: 'ships with the libraries — wires up the pages',
    ticked: true,
  },
  {
    id: 'icons',
    label: 'Icons',
    hint: 'five families, imported one by one',
    ticked: true,
    packageName: '@odoro-cli/icons',
  },
  {
    id: 'engine',
    label: 'Engine',
    hint: 'WebGL, surfaces and motion policy',
    ticked: false,
    packageName: '@odoro-cli/engine',
  },
  {
    id: 'registre',
    label: 'Component registry',
    hint: 'copied by `odoro add` — pulls in the engine',
    ticked: false,
  },
]

/** The known identifiers, to validate an input. */
export const MODULE_IDS: readonly ModuleId[] = MODULES.map((module) => module.id)

/** Those that are ticked when the list opens. */
export const DEFAULT_MODULES: readonly ModuleId[] = MODULES.filter(
  (module) => module.ticked,
).map((module) => module.id)

/** What `resolveModules` had to correct in a selection. */
export interface Resolution {
  /** The selection actually kept. */
  readonly modules: readonly ModuleId[]
  /**
   * What was removed or added, and why.
   *
   * Empty when the selection was already coherent. The creator shows it rather
   * than correcting in silence: a ticked box that produces nothing, or a
   * package appearing without explanation, are more baffling than a sentence.
   */
  readonly warnings: readonly string[]
}

/**
 * Makes the selection coherent, and says what it changed.
 *
 * Two rules: the router lives in the libraries, so it does not survive their
 * removal; the registry needs the engine, so it pulls it in.
 *
 * @example
 * resolveModules(['router', 'icons'])
 * // { modules: ['icons'], warnings: ['The router lives in the...'] }
 */
export function resolveModules(selection: readonly ModuleId[]): Resolution {
  const chosen = new Set(selection)
  const warnings: string[] = []

  if (chosen.has('router') && !chosen.has('libs')) {
    chosen.delete('router')
    warnings.push(
      'The router lives in the libraries (@odoro-cli/libs/router) — without them it is dropped.',
    )
  }

  // 455 of the 461 registry entries import the engine. Configuring the registry
  // without it would deliver a catalogue almost none of which builds: `odoro
  // add` would write the files, and the project would fail on a module that
  // cannot be found. Better to add it and say so.
  if (chosen.has('registre') && !chosen.has('engine')) {
    chosen.add('engine')
    warnings.push(
      'Almost every registry entry imports @odoro-cli/engine, so the engine was added.',
    )
  }

  // The catalogue order rather than the input order: two identical selections
  // must produce the same project, and the same manifest.
  return { modules: MODULE_IDS.filter((id) => chosen.has(id)), warnings }
}

/**
 * The packages to write into the dependencies, for a given selection.
 *
 * @example
 * packagesFor(['libs', 'router', 'icons']) // ['@odoro-cli/libs', '@odoro-cli/icons']
 */
export function packagesFor(modules: readonly ModuleId[]): readonly string[] {
  const chosen = new Set(modules)
  return MODULES.filter(
    (module) => module.packageName !== undefined && chosen.has(module.id),
  ).map((module) => module.packageName as string)
}

/**
 * The variants to lay over the template, in order.
 *
 * ## Three axes, and not a combinatorial explosion
 *
 * The home page is the same whatever is ticked: same drawing, same typography,
 * same sections. What changes fits in three places, and each has its variant:
 *
 * - **without the libraries**, everything is rendered in ordinary CSS — the
 *   drawing holds, the `o-*` classes disappear. The router is already absent
 *   there, `resolveModules` having removed it;
 * - **without the router**, the application has a single page and composes the
 *   sections itself;
 * - **with the engine**, the decorative background becomes an animated WebGL
 *   surface instead of a gradient. It replaces a single file, the background
 *   one: the rest of the page does not know where its background comes from.
 *
 * The order matters: the engine background is laid last, so it wins over what a
 * previous variant would have written.
 *
 * The returned names are the directory names under `_variants/` in the
 * templates: they stay as they are, the templates being out of scope here.
 *
 * @example
 * variantsFor(['libs', 'router'])                    // []
 * variantsFor(['libs', 'router', 'engine'])          // ['with-engine']
 * variantsFor(['libs', 'icons'])                     // ['without-router']
 * variantsFor(['icons', 'engine'])                   // ['without-libs', 'with-engine']
 */
export function variantsFor(modules: readonly ModuleId[]): readonly string[] {
  const chosen = new Set(modules)
  const variants: string[] = []

  if (!chosen.has('libs')) variants.push('without-libs')
  else if (!chosen.has('router')) variants.push('without-router')

  if (chosen.has('engine')) variants.push('with-engine')

  return variants
}

/**
 * Are the generated pages split by route?
 *
 * Without the router there is a single page, and the `routes/` directory of the
 * template no longer makes sense: leaving it would deliver files nothing
 * imports, and whose own imports would not even resolve.
 *
 * @example
 * keepsRoutes(['libs', 'router']) // true
 */
export function keepsRoutes(modules: readonly ModuleId[]): boolean {
  return modules.includes('router')
}

/**
 * Translates a `--modules` value into identifiers.
 *
 * @returns The identifiers, or the reason for the refusal.
 *
 * @example
 * readModules('libs,router') // { modules: ['libs', 'router'] }
 * readModules('none')        // { modules: [] }
 * readModules('')            // { modules: [] }
 */
export function readModules(
  value: string,
): { modules: readonly ModuleId[]; error?: undefined } | { error: string } {
  const raw = value
    .split(',')
    .map((part) => part.trim())
    .filter((part) => part !== '')

  // `--modules=` with nothing, or `--modules=none`: a bare application, which
  // is a valid choice and not an empty input to correct. `aucun` is still
  // accepted: it was documented, and removing it would break the scripts
  // written since.
  if (raw.length === 1 && (raw[0] === 'none' || raw[0] === 'aucun')) {
    return { modules: [] }
  }

  const unknown = raw.find((part) => !MODULE_IDS.includes(part as ModuleId))
  if (unknown !== undefined) {
    return {
      error: `Unknown module: "${unknown}". Available: ${MODULE_IDS.join(', ')}, or "none".`,
    }
  }

  return { modules: raw as ModuleId[] }
}
