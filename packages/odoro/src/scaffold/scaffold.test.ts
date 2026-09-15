import { existsSync } from 'node:fs'
import { readdir, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { type ModuleId } from './modules.js'
import { scaffold } from './scaffold.js'
import { FAMILY_VERSIONS } from './family-versions.generated.js'
import {
  availableTemplates,
  detectPackageManager,
  inspectTarget,
  installCommand,
  runCommand,
  targetFileName,
  templatesRoot,
  toPackageName,
  validatePackageName,
} from './utils.js'

describe('detectPackageManager', () => {
  it.each([
    ['pnpm/10.28.2 npm/? node/v22.14.0 win32 x64', 'pnpm'],
    ['npm/10.9.0 node/v22.14.0 win32 x64', 'npm'],
    ['yarn/4.5.0 npm/? node/v22.14.0', 'yarn'],
    ['bun/1.1.30 npm/? node/v22.14.0', 'bun'],
  ])('recognises %j', (agent, expected) => {
    expect(detectPackageManager(agent)).toBe(expected)
  })

  it('falls back to npm on an unknown agent', () => {
    expect(detectPackageManager('unknown-manager/1.0.0')).toBe('npm')
    expect(detectPackageManager('')).toBe('npm')
  })

  it('falls back to npm when the environment says nothing', () => {
    // The default value reads `npm_config_user_agent`: the test therefore has
    // to control the environment, otherwise it measures the manager that
    // launched the suite rather than the behaviour of the function.
    const previous = process.env['npm_config_user_agent']
    delete process.env['npm_config_user_agent']
    try {
      expect(detectPackageManager()).toBe('npm')
    } finally {
      if (previous !== undefined) process.env['npm_config_user_agent'] = previous
    }
  })
})

describe('package manager commands', () => {
  it('produces the install command', () => {
    expect(installCommand('pnpm')).toBe('pnpm install')
    expect(installCommand('yarn')).toBe('yarn')
  })

  it('produces the script run command', () => {
    expect(runCommand('npm', 'dev')).toBe('npm run dev')
    expect(runCommand('pnpm', 'dev')).toBe('pnpm dev')
  })
})

describe('toPackageName', () => {
  it.each([
    ['My Great Site !', 'my-great-site'],
    ['  Spaces  ', 'spaces'],
    ['_private', 'private'],
    ['already-valid', 'already-valid'],
    ['---', 'odoro-app'],
  ])('turns %j into %j', (input, expected) => {
    expect(toPackageName(input)).toBe(expected)
  })
})

describe('validatePackageName', () => {
  it('accepts a valid name', () => {
    expect(validatePackageName('mon-site')).toBeUndefined()
  })

  it.each([
    ['', /empty/],
    ['Mon Site', /lowercase/],
    ['.cache', /start/],
    ['_prive', /start/],
  ])('refuses %j', (input, pattern) => {
    expect(validatePackageName(input)).toMatch(pattern)
  })

  it('refuses a name that is too long', () => {
    expect(validatePackageName('a'.repeat(215))).toMatch(/214/)
  })
})

describe('targetFileName', () => {
  it('restores dotted file names', () => {
    // npm renames `.gitignore` to `.npmignore` on publish: the file is
    // therefore stored as `_gitignore` and restored on copy.
    expect(targetFileName('_gitignore')).toBe('.gitignore')
    expect(targetFileName('_env.example')).toBe('.env.example')
  })

  it('leaves other names alone', () => {
    expect(targetFileName('package.json')).toBe('package.json')
  })
})

describe('templatesRoot', () => {
  it('resolves the templates from the module location, not the current directory', () => {
    const root = templatesRoot()
    expect(existsSync(root)).toBe(true)
    expect(availableTemplates(root).length).toBeGreaterThan(0)
  })

  it('fails clearly if the templates cannot be found', () => {
    expect(() => templatesRoot(join(tmpdir(), 'nulle-part', 'module.js'))).toThrow(
      /not found/,
    )
  })
})

describe('scaffolding', () => {
  let workspace: string
  let templates: string
  let target: string

  beforeEach(async () => {
    workspace = await mkdtemp(join(tmpdir(), 'odoro-scaffold-'))
    templates = join(workspace, 'templates')
    target = join(workspace, 'projet')

    await mkdir(join(templates, 'demo', 'src'), { recursive: true })
    await writeFile(
      join(templates, 'demo', 'package.json'),
      JSON.stringify({ name: 'odoro-app', version: '0.0.0', private: true }, null, 2),
      'utf8',
    )
    await writeFile(join(templates, 'demo', '_gitignore'), 'node_modules/\n', 'utf8')
    await writeFile(join(templates, 'demo', 'src', 'main.ts'), 'export {}\n', 'utf8')
  })

  afterEach(async () => {
    await rm(workspace, { recursive: true, force: true })
  })

  it('copies the template tree', async () => {
    const { files } = await scaffold({
      target,
      template: 'demo',
      packageName: 'mon-site',
      root: templates,
    })

    expect([...files].sort()).toEqual(['.gitignore', 'package.json', 'src/main.ts'])
    expect(existsSync(join(target, 'src', 'main.ts'))).toBe(true)
  })

  it('restores the name of dotted files', async () => {
    await scaffold({ target, template: 'demo', packageName: 'mon-site', root: templates })
    expect(existsSync(join(target, '.gitignore'))).toBe(true)
    expect(existsSync(join(target, '_gitignore'))).toBe(false)
  })

  it('rewrites the package name', async () => {
    await scaffold({ target, template: 'demo', packageName: 'mon-site', root: templates })
    const manifest = JSON.parse(await readFile(join(target, 'package.json'), 'utf8')) as {
      name: string
      private: boolean
    }
    expect(manifest.name).toBe('mon-site')
    // The rest of the manifest is preserved.
    expect(manifest.private).toBe(true)
  })

  it('fails on an unknown template', async () => {
    await expect(
      scaffold({ target, template: 'absent', packageName: 'x', root: templates }),
    ).rejects.toThrow(/Unknown template/)
  })

  it('merges into a non-empty directory', async () => {
    await mkdir(target, { recursive: true })
    await writeFile(join(target, 'NOTES.md'), 'a conserver\n', 'utf8')

    await scaffold({
      target,
      template: 'demo',
      packageName: 'mon-site',
      overwrite: 'fusionner',
      root: templates,
    })

    expect(existsSync(join(target, 'NOTES.md'))).toBe(true)
    expect(existsSync(join(target, 'package.json'))).toBe(true)
  })

  it('empties the directory before copying, keeping the git repository', async () => {
    await mkdir(join(target, '.git'), { recursive: true })
    await writeFile(join(target, 'ancien.txt'), 'a supprimer\n', 'utf8')

    await scaffold({
      target,
      template: 'demo',
      packageName: 'mon-site',
      overwrite: 'ecraser',
      root: templates,
    })

    expect(existsSync(join(target, 'ancien.txt'))).toBe(false)
    expect(existsSync(join(target, '.git'))).toBe(true)
    expect(existsSync(join(target, 'package.json'))).toBe(true)
  })
})

describe('inspectTarget', () => {
  let workspace: string

  beforeEach(async () => {
    workspace = await mkdtemp(join(tmpdir(), 'odoro-target-'))
  })

  afterEach(async () => {
    await rm(workspace, { recursive: true, force: true })
  })

  it('reports a missing directory', () => {
    expect(inspectTarget(join(workspace, 'nulle-part'))).toBe('absent')
  })

  it('reports an empty directory', () => {
    expect(inspectTarget(workspace)).toBe('empty')
  })

  it('treats a directory holding only a git repository as empty', async () => {
    await mkdir(join(workspace, '.git'), { recursive: true })
    expect(inspectTarget(workspace)).toBe('empty')
  })

  it('reports a non-empty directory', async () => {
    await writeFile(join(workspace, 'fichier.txt'), 'x', 'utf8')
    expect(inspectTarget(workspace)).toBe('occupied')
  })
})

describe('no invented version leaves the scaffolder', () => {
  it('only asks for surveyed versions, whatever the version of the CLI', async () => {
    // The bug that motivated the survey: `odoro` at 1.0.3 asked for
    // `@odoro-cli/libs@^1.0.3`, which was still at 1.0.2. The version did not
    // exist and `npm install` failed on the first command of a fresh project.
    const target = await mkdtemp(join(tmpdir(), 'odoro-inventee-'))
    await scaffold({
      target,
      template: 'react-ts',
      packageName: 'essai',
      modules: ['libs', 'router', 'icons', 'engine'],
      version: '42.0.0',
    })

    const manifest = JSON.parse(await readFile(join(target, 'package.json'), 'utf8')) as {
      dependencies: Record<string, string>
      devDependencies: Record<string, string>
    }

    for (const [name, range] of Object.entries({
      ...manifest.dependencies,
      ...manifest.devDependencies,
    })) {
      if (name === 'odoro' || !name.startsWith('@odoro-cli/')) continue
      expect(range, name).toBe(`^${FAMILY_VERSIONS[name] ?? ''}`)
      expect(range, name).not.toContain('42.0.0')
    }
  })
})

describe('the Odoro versions of the manifest', () => {
  it('put the CLI version on odoro, and the published version on the neighbours', async () => {
    // The templates carried `^0.0.0`, the version from before the first
    // publish. A caret on `0.0.x` is the narrowest of all: `^0.0.0` matches
    // only `0.0.0`. Every scaffolded project therefore failed to install, on a
    // resolution error nobody would have traced back to the template.
    const target = await mkdtemp(join(tmpdir(), 'odoro-versions-'))

    try {
      await scaffold({
        target,
        template: 'react-ts',
        packageName: 'essai',
        version: '1.2.3',
      })

      const manifest = JSON.parse(
        await readFile(join(target, 'package.json'), 'utf8'),
      ) as {
        dependencies: Record<string, string>
        devDependencies: Record<string, string>
      }

      // `odoro` is the only package whose version the CLI knows: its own.
      expect(manifest.devDependencies['odoro']).toBe('^1.2.3')

      // The neighbours take the version surveyed at build time, and not that
      // of the CLI. Since leaving the `fixed` group, the packages each move at
      // their own pace: putting the CLI number on all of them asked for a
      // version that does not exist, and the install failed at creation.
      const libs = manifest.dependencies['@odoro-cli/libs']
      expect(libs).toBe(`^${FAMILY_VERSIONS['@odoro-cli/libs'] ?? ''}`)
      expect(libs).not.toBe('^1.2.3')

      // What is not part of the family does not move.
      expect(manifest.dependencies['react']).not.toContain('1.2.3')
    } finally {
      await rm(target, { recursive: true, force: true })
    }
  })
})

describe('the default version', () => {
  it('is the one of the CLI, and never the fallback', async () => {
    // The `latest` fallback exists so that a scaffold succeeds anyway. If it
    // fires under normal conditions, projects receive `latest` — which would
    // install a future major version without anyone asking for it. That is
    // exactly what happened when the path to the manifest counted levels
    // instead of searching for them.
    const target = await mkdtemp(join(tmpdir(), 'odoro-defaut-'))

    try {
      await scaffold({ target, template: 'react-ts', packageName: 'essai' })

      const manifest = JSON.parse(
        await readFile(join(target, 'package.json'), 'utf8'),
      ) as { devDependencies: Record<string, string> }

      expect(manifest.devDependencies['odoro']).not.toBe('latest')
      expect(manifest.devDependencies['odoro']).toMatch(/^\^\d+\.\d+\.\d+/)
    } finally {
      await rm(target, { recursive: true, force: true })
    }
  })
})

describe('the modules picked change the project written', () => {
  /** Scaffolds into a throwaway directory and returns its content. */
  async function create(modules: readonly ModuleId[]): Promise<{
    readonly directory: string
    readonly files: readonly string[]
    readonly deps: Record<string, string>
    readonly app: string
  }> {
    const directory = await mkdtemp(join(tmpdir(), 'odoro-modules-'))
    const { files } = await scaffold({
      target: directory,
      template: 'react-ts',
      packageName: 'essai',
      modules,
      version: '9.9.9',
    })
    const manifest = JSON.parse(
      await readFile(join(directory, 'package.json'), 'utf8'),
    ) as { dependencies: Record<string, string> }
    return {
      directory,
      files,
      deps: manifest.dependencies,
      app: await readFile(join(directory, 'src/App.tsx'), 'utf8'),
    }
  }

  it('never ships the variants directory', async () => {
    // Copying it would drop all three versions of App.tsx into the project.
    const { files, directory } = await create(['libs', 'router', 'icons'])
    expect(files.some((f) => f.startsWith('_variants'))).toBe(false)
    expect(files.some((f) => f.startsWith('.variantes'))).toBe(false)
    expect(existsSync(join(directory, '_variants'))).toBe(false)
    expect(existsSync(join(directory, '.variantes'))).toBe(false)
  })

  it('writes the icons into the dependencies when they are ticked', async () => {
    const { deps } = await create(['libs', 'router', 'icons'])
    expect(deps['@odoro-cli/icons']).toBe(`^${FAMILY_VERSIONS['@odoro-cli/icons'] ?? ''}`)
    expect(deps['@odoro-cli/libs']).toBe(`^${FAMILY_VERSIONS['@odoro-cli/libs'] ?? ''}`)
  })

  it('removes from the dependencies what was not ticked', async () => {
    const { deps } = await create(['libs', 'router'])
    expect(deps['@odoro-cli/icons']).toBeUndefined()
    expect(deps['@odoro-cli/engine']).toBeUndefined()
    // React stays: it does not come from a checkbox.
    expect(deps['react']).toBeDefined()
  })

  it('adds the engine, which the template does not declare', async () => {
    const { deps } = await create(['libs', 'router', 'engine'])
    expect(deps['@odoro-cli/engine']).toBe(
      `^${FAMILY_VERSIONS['@odoro-cli/engine'] ?? ''}`,
    )
  })

  it('adds no dependency for the registry', async () => {
    const { deps } = await create(['libs', 'router', 'registre'])
    expect(Object.keys(deps).some((n) => n.includes('bits'))).toBe(false)
    expect(Object.keys(deps).some((n) => n.includes('registre'))).toBe(false)
  })

  it('without a router, removes router.tsx and lays down a single page', async () => {
    const { directory, app, files } = await create(['libs', 'icons'])

    // `router.tsx` is the only file that names the routing dependency: without
    // a router, nothing imports it.
    expect(existsSync(join(directory, 'src/router.tsx'))).toBe(false)
    expect(files).not.toContain('src/router.tsx')
    expect(app).not.toContain("from '@/router'")

    // The library classes stay: only the router was removed.
    expect(app).toContain('o-flex')

    // The single page carries the same sections as the routed version — that
    // is what makes the two look alike instead of being two different pages.
    for (const section of ['function Hero', 'function Pillars', 'function Closing']) {
      expect(app, section).toContain(section)
    }
  })

  it('without the libraries, lays down a bare application and removes their stylesheet', async () => {
    const { directory, app, deps } = await create([])
    expect(deps['@odoro-cli/libs']).toBeUndefined()
    expect(app).not.toContain("from '@odoro-cli/libs")
    expect(app).not.toContain('o-flex')

    const main = await readFile(join(directory, 'src/main.tsx'), 'utf8')
    expect(main).not.toContain('@odoro-cli/libs/styles.css')

    // The project stylesheet then has to carry the styles itself: with no
    // tokens and no utilities, an empty sheet would render a bare page.
    const css = await readFile(join(directory, 'src/styles.css'), 'utf8')
    expect(css).toContain('.app-shell')
    expect(css).toContain('prefers-color-scheme')
  })

  it('without the libraries, no file mentions an import that no longer exists', async () => {
    const { directory } = await create([])
    for (const relative of ['src/App.tsx', 'src/main.tsx', 'src/styles.css']) {
      const content = await readFile(join(directory, relative), 'utf8')
      expect(content, relative).not.toContain("from '@odoro-cli/libs")
      expect(content, relative).not.toContain("import '@odoro-cli/libs")
    }
  })

  it('yields the same manifest for two identical selections', async () => {
    const a = await create(['icons', 'libs', 'router'])
    const b = await create(['libs', 'router', 'icons'])
    expect(Object.keys(a.deps)).toEqual(Object.keys(b.deps))
  })

  it('keeps the complete template when nothing is specified', async () => {
    const directory = await mkdtemp(join(tmpdir(), 'odoro-defaut-'))
    await scaffold({
      target: directory,
      template: 'react-ts',
      packageName: 'essai',
      version: '9.9.9',
    })
    const app = await readFile(join(directory, 'src/App.tsx'), 'utf8')
    // The router is imported in one line, from the file that carries it.
    expect(app).toContain("from '@/router'")
    expect(existsSync(join(directory, 'src/router.tsx'))).toBe(true)
  })
})

describe('the generated tsconfig does not hide the packages', () => {
  /**
   * `baseUrl` makes bare imports resolve from the project root. An `odoro.json`
   * file — the one `odoro init` writes for the registry — is then found before
   * the `odoro` package, and `odoro.config.ts` fails to compile on a
   * `defineConfig` it cannot find.
   *
   * Building a real project showed this, not this test: it is here so that the
   * trap does not come back.
   */
  it.each(['react-ts', 'react-ts-server'])(
    'the %s template does not declare baseUrl',
    async (template) => {
      const directory = await mkdtemp(join(tmpdir(), 'odoro-tsconfig-'))
      await scaffold({
        target: directory,
        template,
        packageName: 'essai',
        version: '9.9.9',
      })

      const raw = await readFile(join(directory, 'tsconfig.json'), 'utf8')
      expect(raw).not.toContain('baseUrl')

      // The aliases must survive its removal: since TypeScript 4.1, the paths
      // in `paths` resolve against the tsconfig itself.
      expect(raw).toContain('"@/*"')
    },
  )
})

describe('the home page follows the design of the landing', () => {
  /** Scaffolds and returns the content of one file of the project. */
  async function read(modules: readonly ModuleId[], relative: string): Promise<string> {
    const directory = await mkdtemp(join(tmpdir(), 'odoro-page-'))
    await scaffold({
      target: directory,
      template: 'react-ts',
      packageName: 'essai',
      modules,
      version: '9.9.9',
    })
    return readFile(join(directory, relative), 'utf8')
  }

  it('lays down a static background when the engine is not picked', async () => {
    const background = await read(['libs', 'router', 'icons'], 'src/background.tsx')
    expect(background).not.toContain('useShaderSurface')
    expect(background).toContain('radial-gradient')
  })

  it('lays down a WebGL surface background when the engine is picked', async () => {
    const background = await read(['libs', 'router', 'engine'], 'src/background.tsx')
    expect(background).toContain('useShaderSurface')
    // The fallback stays: a refused surface must not leave a hole.
    expect(background).toContain('radial-gradient')
  })

  it('the engine background depends on no utility class', async () => {
    // It is laid down even without the libraries, where the `o-*` classes do
    // not exist: a missing class paints nothing, and the background would be
    // invisible.
    const background = await read(['engine'], 'src/background.tsx')
    expect(background).toContain('useShaderSurface')
    expect(background).not.toMatch(/className="[^"]*\bo-/)
  })

  it('gives the brand mark a size, and not an arbitrary class', async () => {
    // An arbitrary-value utility class is only emitted if the compiler saw it
    // go by: missing, it would leave an SVG with no dimensions, so invisible.
    const app = await read(['libs', 'router'], 'src/App.tsx')
    expect(app).toContain('width: size')
    expect(app).not.toContain('o-size-[')
  })

  it('writes no underlined link among the buttons', async () => {
    const app = await read(['libs', 'router'], 'src/App.tsx')
    for (const call of app.match(/<a[^>]*buttonClasses\([^)]*\)[^>]*>/g) ?? []) {
      expect(app, call).toContain('o-no-underline')
    }
  })

  it('imports the router in a single line', async () => {
    // That is the shape asked for: `App.tsx` carries the page, `router.tsx`
    // carries the routing, and the link between the two fits on one line.
    const app = await read(['libs', 'router'], 'src/App.tsx')
    const lines = app.split('\n').filter((l) => l.includes("from '@/router'"))
    expect(lines).toHaveLength(1)
  })

  it('leaves no sections directory', async () => {
    // Everything is written in `App.tsx`: a `sections/` directory would be the
    // structure that this shape replaces.
    const directory = await mkdtemp(join(tmpdir(), 'odoro-plat-'))
    await scaffold({
      target: directory,
      template: 'react-ts',
      packageName: 'essai',
      modules: ['libs', 'router', 'engine'],
      version: '9.9.9',
    })
    expect(existsSync(join(directory, 'src/sections'))).toBe(false)
    expect(existsSync(join(directory, 'src/composants'))).toBe(false)
    expect(existsSync(join(directory, 'src/routes'))).toBe(false)
  })

  it('keeps the same design without the libraries', async () => {
    // Same structure, same brand, same hue — in plain CSS.
    const css = await read([], 'src/styles.css')
    expect(css).toContain('--brand: #3b82f6')
    expect(css).toContain('.window')
    expect(css).toContain('.card')
    // About the import: the file says in a comment what the libraries would
    // have brought, and that sentence has its place.
    const app = await read([], 'src/App.tsx')
    expect(app).not.toContain("from '@odoro-cli/libs")
  })
})

describe('the templates only use classes that exist', () => {
  /**
   * The style system emits no arbitrary-value class.
   *
   * `o-h-[42rem]` produces no rule at all, and a missing class paints nothing.
   * The decorative background of the template carried six of them: its
   * container measured zero pixels tall, so did both its glows, and it was
   * nowhere to be seen — with nothing to report it, neither at build time nor
   * at runtime.
   *
   * What falls off the scale is written as a style, where it is safe.
   */
  it.each(['react-ts', 'react-ts-server'])(
    'the %s template invents no class',
    async (template) => {
      const directory = await mkdtemp(join(tmpdir(), 'odoro-classes-'))
      await scaffold({
        target: directory,
        template,
        packageName: 'essai',
        modules: ['libs', 'router', 'icons', 'engine'],
        version: '9.9.9',
      })

      const found: string[] = []
      const walk = async (root: string): Promise<void> => {
        for (const entry of await readdir(root, { withFileTypes: true })) {
          const path = join(root, entry.name)
          if (entry.isDirectory()) {
            if (entry.name === 'node_modules') continue
            await walk(path)
            continue
          }
          if (!/\.tsx?$/.test(entry.name)) continue

          // The comments are stripped before the search: several of them quote
          // the forbidden form to explain why it is forbidden, and reporting
          // them would fail the test on the documentation of its own rule.
          const source = (await readFile(path, 'utf8')).replace(
            /\/\*[\s\S]*?\*\/|\/\/.*/g,
            '',
          )

          for (const klass of source.match(/o-[a-z0-9-]+\[[^\]"' ]+\]/g) ?? []) {
            found.push(`${entry.name} : ${klass}`)
          }
        }
      }
      // The whole tree: the server template puts its application under
      // `client/`, and scanning only `src/` would have left it out.
      await walk(directory)

      expect(found).toEqual([])
    },
  )
})
