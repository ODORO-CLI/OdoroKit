import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import type { RegistryIndex, RegistryMetaInput } from 'odoro/registry'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { buildRegistry } from './build-registry.js'
import { collectRegistry } from './collect.js'
import { validateRegistry } from './validate.js'

/** Root of the real registry, from the root of the package. */
const REAL_ROOT = 'registry'

let root = ''
/**
 * Compilation output, deliberately outside the registry: putting it inside
 * would have the artefacts read back as if they were components.
 */
let out = ''

beforeEach(async () => {
  const temporary = await mkdtemp(join(tmpdir(), 'odoro-registry-'))
  root = join(temporary, 'registry')
  out = join(temporary, 'dist')
  await mkdir(root, { recursive: true })
})

afterEach(async () => {
  await rm(join(root, '..'), { recursive: true, force: true })
})

/**
 * Source of a component compliant with the customisation contract.
 *
 * It accepts `className`: the validation demands it of every entry that
 * renders an element, and a fixture that did not would test a case the
 * registry refuses.
 */
const SOURCE = 'export const Demo = ({ className }) => <div className={className} />\n'

/** Minimal valid entry, to derive in each test. */
function meta(overrides: Partial<RegistryMetaInput> = {}): RegistryMetaInput {
  return {
    name: 'demo',
    category: 'text',
    title: 'Demo',
    description: 'A test entry.',
    files: [{ path: 'component.tsx', target: 'text/Demo.tsx' }],
    perf: { tier: 'light' },
    ...overrides,
  }
}

/** Writes a complete component directory into the temporary registry. */
async function writeEntry(
  category: string,
  name: string,
  value: unknown,
  files: Record<string, string> = { 'component.tsx': SOURCE },
): Promise<void> {
  const directory = join(root, category, name)
  await mkdir(directory, { recursive: true })
  await writeFile(join(directory, 'meta.json'), JSON.stringify(value, null, 2), 'utf8')
  for (const [path, content] of Object.entries(files)) {
    await writeFile(join(directory, path), content, 'utf8')
  }
}

describe('registry reading', () => {
  it('reads an entry and inlines its source', async () => {
    await writeEntry('text', 'demo', meta())

    const result = await collectRegistry(root)
    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.entries).toHaveLength(1)
    expect(result.entries[0]?.id).toBe('text/demo')
    expect(result.entries[0]?.sources['component.tsx']).toContain('export const Demo')
  })

  it('accepts an empty registry', async () => {
    const result = await collectRegistry(root)
    expect(result.ok).toBe(true)
  })

  it('reports a root that does not exist rather than throwing', async () => {
    const result = await collectRegistry(join(root, 'absent'))
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.problems[0]).toMatch(/not found/)
  })

  it('reports a directory without meta.json', async () => {
    await mkdir(join(root, 'text', 'forgotten'), { recursive: true })

    const result = await collectRegistry(root)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.problems[0]).toMatch(/no meta\.json/)
  })

  it('reports unreadable JSON without bringing the reading down', async () => {
    await mkdir(join(root, 'text', 'broken'), { recursive: true })
    await writeFile(join(root, 'text', 'broken', 'meta.json'), '{ oops', 'utf8')

    const result = await collectRegistry(root)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.problems[0]).toMatch(/unreadable JSON/)
  })

  it('gathers the problems of every entry', async () => {
    // Stopping at the first error would impose one round trip per problem.
    await writeEntry('text', 'one', meta({ name: 'one', title: '' }))
    await writeEntry('text', 'two', meta({ name: 'two', description: '' }))

    const result = await collectRegistry(root)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.problems).toHaveLength(2)
  })
})

describe('what the schema cannot see', () => {
  it('reports a file declared but absent', async () => {
    await writeEntry('text', 'demo', meta(), {})

    const result = await collectRegistry(root)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.problems[0]).toMatch(/"component\.tsx" was not found/)
  })

  it('reports a name that does not match the directory', async () => {
    // The directory is the real identifier: a gap would make the entry not to
    // be found at the address where everybody looks for it.
    await writeEntry('text', 'demo', meta({ name: 'something-else' }))

    const result = await collectRegistry(root)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.problems[0]).toMatch(/does not match the directory/)
  })

  it('reports a category that does not match the directory', async () => {
    await writeEntry('effect', 'demo', meta())

    const result = await collectRegistry(root)
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.problems.join()).toMatch(/declared category/)
  })
})

describe('complete validation', () => {
  it('reports nothing on a healthy registry', async () => {
    await writeEntry('hooks', 'use-base', meta({ name: 'use-base', category: 'hooks' }))
    await writeEntry('text', 'demo', meta({ registryDependencies: ['hooks/use-base'] }))

    const report = await validateRegistry(root)
    expect(report.problems).toEqual([])
    expect(report.count).toBe(2)
  })

  it('fails on a registry dependency that points into the void', async () => {
    await writeEntry('text', 'demo', meta({ registryDependencies: ['hooks/absent'] }))

    const report = await validateRegistry(root)
    expect(report.problems).toHaveLength(1)
    // Message produced by `odoro/registry`, out of the scope of this pass.
    expect(report.problems[0]).toMatch(/Entry not found: hooks\/absent/)
  })

  it('fails on a cycle and gives its path', async () => {
    await writeEntry(
      'text',
      'one',
      meta({ name: 'one', registryDependencies: ['text/two'] }),
    )
    await writeEntry(
      'text',
      'two',
      meta({ name: 'two', registryDependencies: ['text/one'] }),
    )

    const report = await validateRegistry(root)
    // Message produced by `odoro/registry`, out of the scope of this pass.
    expect(report.problems[0]).toMatch(/Dependency cycle: text\/(one|two) →/)
  })

  it('fails on a costly component without a fallback', async () => {
    await writeEntry(
      'hero',
      'demo',
      meta({
        category: 'hero',
        engine: { gl: 'three' },
        perf: { tier: 'heavy', backend: 'three' },
      }),
    )

    const report = await validateRegistry(root)
    // Message produced by `odoro/registry`, out of the scope of this pass.
    expect(report.problems.join()).toMatch(/visual fallback/)
    expect(report.count).toBe(0)
  })

  it('does not resolve the graph when the reading failed', async () => {
    // Otherwise the dependency of the unreadable entry would be reported as
    // not found — a second message that is only the echo of the first.
    await writeEntry(
      'text',
      'one',
      meta({ name: 'one', registryDependencies: ['text/two'] }),
    )
    await writeEntry('text', 'two', meta({ name: 'two', title: '' }))

    const report = await validateRegistry(root)
    expect(report.problems).toHaveLength(1)
  })
})

/** The catalogue the site reads: a throwaway compilation must not touch it. */
const SITE_CATALOGUE = join(
  '..',
  '..',
  'playground',
  'src',
  'docs',
  'catalogue.generated.ts',
)

describe('artefact compilation', () => {
  it('writes one file per entry and an index', async () => {
    await writeEntry('hooks', 'use-base', meta({ name: 'use-base', category: 'hooks' }))
    await writeEntry('text', 'demo', meta({ registryDependencies: ['hooks/use-base'] }))

    const result = await buildRegistry(root, out, {
      now: new Date('2026-01-01T00:00:00.000Z'),
    })

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.report.written).toEqual([
      'hooks/use-base.json',
      'text/demo.json',
      'index.json',
    ])
  })

  it('writes nothing outside the output directory unless asked', async () => {
    await writeEntry('text', 'demo', meta())

    // The drop into the playground borrows paths relative to the current
    // directory. Triggered from a test, it has already overwritten the
    // catalogue of the site with the content of a throwaway registry —
    // without any test failing, since the compiled registry, itself, was
    // correct.
    const before = await readFile(SITE_CATALOGUE, 'utf8')

    await buildRegistry(root, out)

    expect(await readFile(SITE_CATALOGUE, 'utf8')).toBe(before)
  })

  it('inlines the source in the file of the entry', async () => {
    await writeEntry('text', 'demo', meta())

    await buildRegistry(root, out)

    const published: unknown = JSON.parse(
      await readFile(join(out, 'text', 'demo.json'), 'utf8'),
    )
    expect(published).toMatchObject({
      id: 'text/demo',
      sources: { 'component.tsx': SOURCE },
    })
  })

  it('leaves no repository-layout detail in the artefact', async () => {
    await writeEntry('text', 'demo', meta())

    await buildRegistry(root, out)

    const published = JSON.parse(
      await readFile(join(out, 'text', 'demo.json'), 'utf8'),
    ) as Record<string, unknown>
    expect(published['directory']).toBeUndefined()
  })

  it('leaves the index without source code', async () => {
    // The index is consulted often; inlining the code in it would inflate a
    // response that has no use for it.
    await writeEntry('text', 'demo', meta())

    await buildRegistry(root, out, { now: new Date('2026-01-01T00:00:00.000Z') })

    const index = JSON.parse(
      await readFile(join(out, 'index.json'), 'utf8'),
    ) as RegistryIndex
    expect(index.version).toBe(1)
    expect(index.generatedAt).toBe('2026-01-01T00:00:00.000Z')
    expect(index.entries).toEqual([
      {
        id: 'text/demo',
        name: 'demo',
        category: 'text',
        title: 'Demo',
        description: 'A test entry.',
        tier: 'light',
        backend: false,
        registryDependencies: [],
      },
    ])
  })

  it('erases an entry removed from the repository', async () => {
    // Without that, it would stay served indefinitely.
    await writeEntry('text', 'demo', meta())
    await buildRegistry(root, out)

    await rm(join(root, 'text', 'demo'), { recursive: true })
    await buildRegistry(root, out)

    await expect(readFile(join(out, 'text', 'demo.json'), 'utf8')).rejects.toThrow()
  })

  it('refuses to compile an invalid registry', async () => {
    await writeEntry('text', 'demo', meta({ registryDependencies: ['hooks/absent'] }))

    const result = await buildRegistry(root, out)
    expect(result.ok).toBe(false)
    if (result.ok) return
    // Message produced by `odoro/registry`, out of the scope of this pass.
    expect(result.problems[0]).toMatch(/not found/)
  })
})

describe('the real registry', () => {
  it('is valid', async () => {
    const report = await validateRegistry(REAL_ROOT)
    expect(report.problems).toEqual([])
    expect(report.count).toBeGreaterThan(0)
  })
})
