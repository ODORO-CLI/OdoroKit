import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import type { PublishedEntry, RegistryIndex } from '../registry/index.js'
import { defaultAliases, guessAlias, stripJsonComments } from './aliases.js'
import { inspectEntry, previewChanges } from './inspect.js'
import { planInstall, prepareInstall, recordInstall, suggest } from './install.js'
import { fingerprint, loadProject, saveProject, type ProjectConfig } from './project.js'
import { relativeImport, isAlias, rewriteImports, usedTokens } from './rewrite.js'
import { openRegistry } from './source.js'
import { requiredPackages, weighEntries } from './weight.js'
import { applyPlan, planWrite } from './writer.js'

let root = ''
let registryDir = ''

beforeEach(async () => {
  const temporary = await mkdtemp(join(tmpdir(), 'odoro-add-'))
  root = join(temporary, 'project')
  registryDir = join(temporary, 'registry')
  await mkdir(root, { recursive: true })
})

afterEach(async () => {
  await rm(join(root, '..'), { recursive: true, force: true })
})

/** A published entry, to be derived in each test. */
function entry(overrides: Partial<PublishedEntry> = {}): PublishedEntry {
  const base: PublishedEntry = {
    id: 'text/demo',
    name: 'demo',
    category: 'text',
    title: 'Demo',
    description: 'An entry.',
    engine: { gsap: [], gl: false },
    files: [{ path: 'component.tsx', target: 'text/Demo.tsx' }],
    dependencies: [],
    registryDependencies: [],
    tokens: [],
    props: [],
    perf: { tier: 'light', backend: false },
    sources: { 'component.tsx': 'export const Demo = () => null\n' },
  }
  return { ...base, ...overrides }
}

/** Writes a complete local registry, as `registry:build` would produce it. */
async function publish(entries: readonly PublishedEntry[]): Promise<void> {
  await mkdir(registryDir, { recursive: true })

  const index: RegistryIndex = {
    version: 1,
    generatedAt: '2026-01-01T00:00:00.000Z',
    entries: entries.map((item) => ({
      id: item.id,
      name: item.name,
      category: item.category,
      title: item.title,
      description: item.description,
      tier: item.perf.tier,
      backend: item.perf.backend,
      registryDependencies: item.registryDependencies,
    })),
  }
  await writeFile(join(registryDir, 'index.json'), JSON.stringify(index), 'utf8')

  for (const item of entries) {
    await mkdir(join(registryDir, item.category), { recursive: true })
    await writeFile(join(registryDir, `${item.id}.json`), JSON.stringify(item), 'utf8')
  }
}

/** Minimal project configuration. */
function config(overrides: Partial<ProjectConfig> = {}): ProjectConfig {
  return {
    version: 1,
    registry: registryDir,
    aliases: { import: '@/odoro', directory: 'src/odoro' },
    installed: {},
    ...overrides,
  }
}

describe('reading the tsconfig', () => {
  it('removes line and block comments', () => {
    const cleaned = stripJsonComments('{ // one\n "a": 1, /* two */ "b": 2 }')
    expect(JSON.parse(cleaned)).toEqual({ a: 1, b: 2 })
  })

  it('leaves a slash inside a string alone', () => {
    // A naive regular expression would cut the URL in two.
    const cleaned = stripJsonComments('{ "url": "https://example.dev" }')
    expect(JSON.parse(cleaned)).toEqual({ url: 'https://example.dev' })
  })

  it('accepts a trailing comma', () => {
    expect(JSON.parse(stripJsonComments('{ "a": 1, }'))).toEqual({ a: 1 })
  })

  it('infers the prefix and the directory', async () => {
    await writeFile(
      join(root, 'tsconfig.json'),
      '{ "compilerOptions": { "paths": { "@/*": ["./src/*"] } } }',
      'utf8',
    )
    expect(await guessAlias(root)).toEqual({ prefix: '@', directory: 'src' })
  })

  it('keeps the shallowest alias when there are several', async () => {
    // A project that also declares `@ui/*` wants `@/*` as its general prefix.
    await writeFile(
      join(root, 'tsconfig.json'),
      '{ "compilerOptions": { "paths": { "@ui/*": ["./src/components/ui/*"], "@/*": ["./src/*"] } } }',
      'utf8',
    )
    expect((await guessAlias(root))?.prefix).toBe('@')
  })

  it('ignores a package redirection', async () => {
    await writeFile(
      join(root, 'tsconfig.json'),
      '{ "compilerOptions": { "paths": { "react": ["./vendor/react"] } } }',
      'utf8',
    )
    expect(await guessAlias(root)).toBeNull()
  })

  it('returns null when the project has no tsconfig', async () => {
    expect(await guessAlias(root)).toBeNull()
  })

  it('offers a location even without an alias', () => {
    expect(defaultAliases(null)).toEqual({ import: 'src/odoro', directory: 'src/odoro' })
  })
})

describe('rewriting the imports', () => {
  it('replaces the token by the prefix of the project', () => {
    expect(rewriteImports("from '@registre/hooks/usePoster'", '@/odoro')).toBe(
      "from '@/odoro/hooks/usePoster'",
    )
  })

  it('leaves the real packages alone', () => {
    const source = "import { clock } from '@odoro-cli/engine'\nimport gsap from 'gsap'"
    expect(rewriteImports(source, '@/odoro')).toBe(source)
  })

  it('lists what a source imports from the registry', () => {
    expect(usedTokens("a '@registre/hooks/usePoster' b '@registre/gl/Surface'")).toEqual([
      'gl/Surface',
      'hooks/usePoster',
    ])
  })
})

describe('transactional writing', () => {
  it('writes what is planned', async () => {
    const plan = [await planWrite(root, 'src/a.ts', 'one', 'x/a')]
    const report = await applyPlan(root, plan)

    expect(report.written).toEqual(['src/a.ts'])
    expect(await readFile(join(root, 'src/a.ts'), 'utf8')).toBe('one')
  })

  it('does not rewrite an identical file', async () => {
    // Rewriting it would change its modification date, which build tools watch,
    // for an identical result.
    await mkdir(join(root, 'src'), { recursive: true })
    await writeFile(join(root, 'src/a.ts'), 'one', 'utf8')

    const plan = [await planWrite(root, 'src/a.ts', 'one', 'x/a')]
    expect(plan[0]?.action).toBe('unchanged')

    const report = await applyPlan(root, plan)
    expect(report.written).toEqual([])
    expect(report.skipped).toEqual(['src/a.ts'])
  })

  it('tells a creation from a replacement', async () => {
    await mkdir(join(root, 'src'), { recursive: true })
    await writeFile(join(root, 'src/a.ts'), 'old', 'utf8')

    expect((await planWrite(root, 'src/a.ts', 'new', 'x/a')).action).toBe('replace')
    expect((await planWrite(root, 'src/b.ts', 'new', 'x/b')).action).toBe('create')
  })

  it('leaves nothing behind when a write fails', async () => {
    // The case that justifies the whole module: a plan of three files whose
    // third one is impossible to write.
    await mkdir(join(root, 'src', 'blocked'), { recursive: true })
    // A directory where a file must go: the write will fail.
    await mkdir(join(root, 'src', 'blocked', 'c.ts'), { recursive: true })

    const plan = [
      await planWrite(root, 'src/a.ts', 'one', 'x/a'),
      await planWrite(root, 'src/b.ts', 'two', 'x/b'),
      await planWrite(root, 'src/blocked/c.ts', 'three', 'x/c'),
    ]

    await expect(applyPlan(root, plan)).rejects.toThrow()

    // Neither the previous files, nor the temporaries.
    await expect(readFile(join(root, 'src/a.ts'), 'utf8')).rejects.toThrow()
    await expect(readFile(join(root, 'src/b.ts'), 'utf8')).rejects.toThrow()
    await expect(readFile(join(root, 'src/a.ts.odoro-pending'), 'utf8')).rejects.toThrow()
  })

  it('gives a replaced file its previous content back', async () => {
    await mkdir(join(root, 'src', 'blocked', 'c.ts'), { recursive: true })
    await writeFile(join(root, 'src/a.ts'), 'old', 'utf8')

    const plan = [
      await planWrite(root, 'src/a.ts', 'new', 'x/a'),
      await planWrite(root, 'src/blocked/c.ts', 'three', 'x/c'),
    ]

    await expect(applyPlan(root, plan)).rejects.toThrow()
    expect(await readFile(join(root, 'src/a.ts'), 'utf8')).toBe('old')
  })
})

describe('preparation of an install', () => {
  it('installs the registry dependencies with the entry', async () => {
    await publish([
      entry({
        id: 'text/demo',
        registryDependencies: ['hooks/use-base'],
      }),
      entry({
        id: 'hooks/use-base',
        name: 'use-base',
        category: 'hooks',
        files: [{ path: 'hook.ts', target: 'hooks/useBase.ts' }],
        sources: { 'hook.ts': 'export const useBase = () => null\n' },
      }),
    ])

    const prepared = await prepareInstall(openRegistry(registryDir, root), ['text/demo'])
    expect(prepared.ok).toBe(true)
    if (!prepared.ok) return

    expect(prepared.entries.map((item) => item.id)).toEqual([
      'hooks/use-base',
      'text/demo',
    ])
    expect(prepared.implied).toEqual(['hooks/use-base'])
  })

  it('accepts a name without a category', async () => {
    await publish([entry()])
    const prepared = await prepareInstall(openRegistry(registryDir, root), ['demo'])
    expect(prepared.ok).toBe(true)
  })

  it('refuses an ambiguous name rather than choose', async () => {
    await publish([
      entry({ id: 'text/demo' }),
      entry({ id: 'hero/demo', category: 'hero' }),
    ])

    const prepared = await prepareInstall(openRegistry(registryDir, root), ['demo'])
    expect(prepared.ok).toBe(false)
    if (prepared.ok) return
    expect(prepared.problems[0]).toMatch(/ambiguous/)
  })

  it('offers the names close to an unknown entry', async () => {
    await publish([entry({ id: 'hero/molten', name: 'molten', category: 'hero' })])

    const prepared = await prepareInstall(openRegistry(registryDir, root), ['molte'])
    expect(prepared.ok).toBe(false)
    if (prepared.ok) return
    expect(prepared.problems[0]).toMatch(/hero\/molten/)
  })

  it('reports an unreachable registry', async () => {
    const prepared = await prepareInstall(openRegistry(registryDir, root), ['demo'])
    expect(prepared.ok).toBe(false)
  })

  it('refuses an entry whose source code is missing', async () => {
    // A half-written response must not produce a half-written file.
    await publish([entry()])
    await writeFile(
      join(registryDir, 'text/demo.json'),
      JSON.stringify({ ...entry(), sources: {} }),
      'utf8',
    )

    const prepared = await prepareInstall(openRegistry(registryDir, root), ['text/demo'])
    expect(prepared.ok).toBe(false)
    if (prepared.ok) return
    expect(prepared.problems[0]).toMatch(/missing from the response/)
  })

  it('refuses an index of a version it cannot read', async () => {
    await publish([entry()])
    await writeFile(
      join(registryDir, 'index.json'),
      JSON.stringify({ version: 2, generatedAt: '', entries: [] }),
      'utf8',
    )

    const prepared = await prepareInstall(openRegistry(registryDir, root), ['demo'])
    expect(prepared.ok).toBe(false)
    if (prepared.ok) return
    expect(prepared.problems[0]).toMatch(/Update the CLI/)
  })

  it('suggests by the end of the name', () => {
    expect(suggest('poster', ['hooks/use-poster', 'text/split'])).toEqual([
      'hooks/use-poster',
    ])
  })
})

describe('plan and log', () => {
  it('writes under the configured directory, imports rewritten', async () => {
    const source = "import { usePoster } from '@registre/hooks/usePoster'\n"
    const plan = await planInstall(root, config(), [
      entry({ sources: { 'component.tsx': source } }),
    ])

    expect(plan[0]?.path).toBe('src/odoro/text/Demo.tsx')
    expect(plan[0]?.content).toContain("'@/odoro/hooks/usePoster'")
  })

  it('records the hash of what was delivered', async () => {
    const item = entry()
    const plan = await planInstall(root, config(), [item])
    const installed = recordInstall({}, [item], plan, new Date('2026-01-01'))

    expect(installed['text/demo']?.files).toEqual([
      {
        path: 'src/odoro/text/Demo.tsx',
        hash: fingerprint(item.sources['component.tsx'] ?? ''),
      },
    ])
  })

  it('gives the same hash whatever the line endings', () => {
    // Otherwise git would report a modification that never happened.
    expect(fingerprint('a\r\nb')).toBe(fingerprint('a\nb'))
  })
})

describe('announced weight', () => {
  it('counts a backend only once', () => {
    // It is only loaded once: counting it five times would be a lie, and a
    // warning one learns to ignore is of no use any more.
    const warnings = weighEntries([
      entry({
        id: 'hero/a',
        perf: { tier: 'heavy', backend: 'three', fallback: 'poster' },
      }),
      entry({
        id: 'hero/b',
        perf: { tier: 'heavy', backend: 'three', fallback: 'poster' },
      }),
    ])

    expect(warnings).toHaveLength(1)
    expect(warnings[0]?.entries).toEqual(['hero/a', 'hero/b'])
  })

  it('announces the heaviest first', () => {
    const warnings = weighEntries([
      entry({ id: 'bg/a', perf: { tier: 'medium', backend: 'ogl' } }),
      entry({
        id: 'hero/b',
        perf: { tier: 'heavy', backend: 'three', fallback: 'poster' },
      }),
    ])
    expect(warnings.map((warning) => warning.backend)).toEqual(['three', 'ogl'])
  })

  it('mentions the light alternative when a 3D scene arrives', () => {
    const warnings = weighEntries([
      entry({
        id: 'hero/b',
        perf: { tier: 'heavy', backend: 'three', fallback: 'poster' },
      }),
    ])
    expect(warnings[0]?.message).toMatch(/light backend/)
  })

  it('says nothing when nothing costs', () => {
    expect(weighEntries([entry()])).toEqual([])
  })

  it('asks for the engine, not for its own dependencies', () => {
    // gsap, ogl and three come with `@odoro-cli/engine`. Asking for them a
    // second time would produce a warning nothing resolves.
    const packages = requiredPackages([
      entry({ engine: { gsap: ['ScrollTrigger'], gl: 'three' }, dependencies: ['clsx'] }),
    ])
    // The sort places `@odoro-cli/engine` before `clsx`: the at sign precedes
    // the letters. Moving to a scope therefore changed the announced order.
    expect(packages).toEqual(['@odoro-cli/engine', 'clsx'])
  })

  it('asks for nothing from an entry that does not touch the engine', () => {
    expect(requiredPackages([entry()])).toEqual([])
  })
})

describe('comparison of the three versions', () => {
  /** Really installs an entry, then returns the up-to-date configuration. */
  async function install(item: PublishedEntry): Promise<ProjectConfig> {
    const base = config()
    const plan = await planInstall(root, base, [item])
    await applyPlan(root, plan)
    return { ...base, installed: recordInstall({}, [item], plan, new Date()) }
  }

  it('reports nothing when nothing moved', async () => {
    const item = entry()
    const report = await inspectEntry(root, await install(item), item.id, item)
    expect(report.files[0]?.state).toBe('up-to-date')
  })

  it('recognises a local edit', async () => {
    const item = entry()
    const updated = await install(item)
    await writeFile(join(root, 'src/odoro/text/Demo.tsx'), 'edited\n', 'utf8')

    const report = await inspectEntry(root, updated, item.id, item)
    expect(report.files[0]?.state).toBe('edited')
  })

  it('recognises an upstream update', async () => {
    const item = entry()
    const updated = await install(item)
    const newer = entry({
      sources: { 'component.tsx': 'export const Demo = () => <b/>\n' },
    })

    const report = await inspectEntry(root, updated, item.id, newer)
    expect(report.files[0]?.state).toBe('update-available')
  })

  it('recognises a divergence — the only case that needs an arbitration', async () => {
    const item = entry()
    const updated = await install(item)
    await writeFile(join(root, 'src/odoro/text/Demo.tsx'), 'edited\n', 'utf8')
    const newer = entry({ sources: { 'component.tsx': 'upstream\n' } })

    const report = await inspectEntry(root, updated, item.id, newer)
    expect(report.files[0]?.state).toBe('diverged')
  })

  it('reports a file recorded as installed but erased', async () => {
    const item = entry()
    const updated = await install(item)
    await rm(join(root, 'src/odoro/text/Demo.tsx'))

    const report = await inspectEntry(root, updated, item.id, item)
    expect(report.files[0]?.state).toBe('missing')
  })

  it('reports an entry the registry no longer serves', async () => {
    const item = entry()
    const report = await inspectEntry(root, await install(item), item.id, null)
    expect(report.orphan).toBe(true)
  })

  it('previews the added and removed lines', () => {
    const changes = previewChanges('one\ntwo\n', 'one\nthree\n')
    expect(changes.added).toEqual(['three'])
    expect(changes.removed).toEqual(['two'])
  })
})

describe('odoro.json file', () => {
  it('tells a missing file from a corrupt one', async () => {
    const absent = await loadProject(root)
    expect(absent.ok).toBe(false)
    if (absent.ok) return
    expect(absent.reason).toBe('absent')

    await writeFile(join(root, 'odoro.json'), '{ broken', 'utf8')
    const broken = await loadProject(root)
    expect(broken.ok).toBe(false)
    if (broken.ok) return
    expect(broken.reason).toBe('invalid')
  })

  it('reads back what it wrote', async () => {
    await saveProject(
      root,
      config({ installed: { 'text/demo': { installedAt: 'x', files: [] } } }),
    )

    const loaded = await loadProject(root)
    expect(loaded.ok).toBe(true)
    if (!loaded.ok) return
    expect(Object.keys(loaded.config.installed)).toEqual(['text/demo'])
  })

  it('sorts the installed entries', async () => {
    // Without that, every `odoro add` would produce an unreadable diff.
    await saveProject(
      root,
      config({
        installed: {
          'text/zebra': { installedAt: 'x', files: [] },
          'hooks/alpha': { installedAt: 'x', files: [] },
        },
      }),
    )

    const raw = await readFile(join(root, 'odoro.json'), 'utf8')
    expect(raw.indexOf('hooks/alpha')).toBeLessThan(raw.indexOf('text/zebra'))
  })

  it('refuses a configuration without a location', async () => {
    await writeFile(join(root, 'odoro.json'), JSON.stringify({ registry: 'x' }), 'utf8')
    const loaded = await loadProject(root)
    expect(loaded.ok).toBe(false)
  })
})

// The strict mode of Node forbids removing the write permission from yourself
// on Windows: a test depending on it would be green without proving anything.
describe.skipIf(process.platform === 'win32')('permissions', () => {
  it('leaves nothing behind on a read-only directory', async () => {
    await mkdir(join(root, 'locked'), { recursive: true })
    await chmod(join(root, 'locked'), 0o500)

    const plan = [await planWrite(root, 'locked/a.ts', 'one', 'x/a')]
    await expect(applyPlan(root, plan)).rejects.toThrow()

    await chmod(join(root, 'locked'), 0o700)
  })
})

describe('the relative imports, when the project has no alias', () => {
  it('recognises an alias by its first character', () => {
    expect(isAlias('@/odoro')).toBe(true)
    expect(isAlias('~/components/odoro')).toBe(true)
    expect(isAlias('#odoro')).toBe(true)
    expect(isAlias('src/odoro')).toBe(false)
    expect(isAlias('odoro')).toBe(false)
  })

  it('climbs to the common directory', () => {
    expect(relativeImport('text/CountUp.tsx', 'hooks/useInView')).toBe(
      '../hooks/useInView',
    )
  })

  it('prefixes a neighbour of the same directory, so it stays relative', () => {
    // Without `./`, `Other` would become a bare specifier again, looked up
    // among the packages — which is what this whole fix aims to avoid.
    expect(relativeImport('text/CountUp.tsx', 'text/Other')).toBe('./Other')
  })

  it('descends from the root of the components directory', () => {
    expect(relativeImport('CountUp.tsx', 'hooks/useInView')).toBe('./hooks/useInView')
  })

  it('climbs two levels when it has to', () => {
    expect(relativeImport('a/b/C.tsx', 'hooks/useInView')).toBe('../../hooks/useInView')
  })

  it('keeps the alias when the project has one', () => {
    expect(
      rewriteImports("from '@registre/hooks/useInView'", '@/odoro', 'text/CountUp.tsx'),
    ).toBe("from '@/odoro/hooks/useInView'")
  })

  it('writes relative when the prefix is a path', () => {
    expect(
      rewriteImports("from '@registre/hooks/useInView'", 'src/odoro', 'text/CountUp.tsx'),
    ).toBe("from '../hooks/useInView'")
  })

  it('leaves the real packages untouched', () => {
    const source =
      "import { useMotionState } from '@odoro-cli/engine'\nimport React from 'react'"
    expect(rewriteImports(source, 'src/odoro', 'text/CountUp.tsx')).toBe(source)
  })

  it('rewrites several imports in the same file', () => {
    const source = [
      "import { a } from '@registre/hooks/useA'",
      "import { b } from '@registre/text/B'",
    ].join('\n')
    expect(rewriteImports(source, 'src/odoro', 'text/C.tsx')).toBe(
      ["import { a } from '../hooks/useA'", "import { b } from './B'"].join('\n'),
    )
  })

  it('falls back on the prefix when the destination is unknown', () => {
    // `diff` and `doctor` compare sources without always knowing the
    // destination: better the former behaviour than nothing at all.
    expect(rewriteImports("from '@registre/hooks/useA'", 'src/odoro')).toBe(
      "from 'src/odoro/hooks/useA'",
    )
  })
})
