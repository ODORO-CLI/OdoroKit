import { describe, expect, it } from 'vitest'

import {
  describeProblem,
  resolveGraph,
  toCatalogue,
  validateCatalogue,
  type ResolvableEntry,
} from './resolve.js'
import { entryId, parseMeta, type RegistryMetaInput } from './schema.js'

/** Minimal valid entry, to be derived in each test. */
function meta(overrides: Partial<RegistryMetaInput> = {}): RegistryMetaInput {
  return {
    name: 'split-reveal',
    category: 'text',
    title: 'Split Reveal',
    description: 'Reveals a text character by character.',
    files: [{ path: 'component.tsx', target: 'text/SplitReveal.tsx' }],
    perf: { tier: 'light' },
    ...overrides,
  }
}

/** Builds a catalogue from identifier / dependencies pairs. */
function catalogue(entries: Record<string, string[]>): Map<string, ResolvableEntry> {
  return new Map(
    Object.entries(entries).map(([id, deps]) => [id, { id, registryDependencies: deps }]),
  )
}

describe('validation of the format', () => {
  it('accepts a minimal entry and applies the default values', () => {
    const result = parseMeta(meta(), 'text/split-reveal')

    expect(result.ok).toBe(true)
    if (!result.ok) return

    expect(result.meta.dependencies).toEqual([])
    expect(result.meta.registryDependencies).toEqual([])
    expect(result.meta.engine).toEqual({ gsap: [], gl: false })
    expect(result.meta.perf.backend).toBe(false)
    expect(entryId(result.meta)).toBe('text/split-reveal')
  })

  it('refuses a name that is not lowercase with dashes', () => {
    const result = parseMeta(meta({ name: 'SplitReveal' }), 'text/x')
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.problems.join()).toMatch(/lowercase/)
  })

  it('refuses an unknown category', () => {
    const result = parseMeta(
      meta({ category: 'nonexistent' as RegistryMetaInput['category'] }),
      'x/y',
    )
    expect(result.ok).toBe(false)
  })

  it('requires at least one file', () => {
    const result = parseMeta(meta({ files: [] }), 'text/x')
    expect(result.ok).toBe(false)
  })

  it('names the path of the offending field', () => {
    // A message that says only "invalid" forces you to go looking.
    const result = parseMeta(meta({ perf: { tier: 'unknown' } as never }), 'text/x')
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.problems[0]).toContain('text/x → perf.tier')
  })
})

describe('write destinations', () => {
  it('refuses an absolute destination', () => {
    // The CLI writes into the user project: an unbounded path would be an open
    // door there.
    const result = parseMeta(
      meta({ files: [{ path: 'a.tsx', target: '/etc/passwd' }] }),
      'text/x',
    )
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.problems.join()).toMatch(/relative/)
  })

  it('refuses a climb up the tree', () => {
    const result = parseMeta(
      meta({ files: [{ path: 'a.tsx', target: '../../elsewhere.tsx' }] }),
      'text/x',
    )
    expect(result.ok).toBe(false)
  })

  it('refuses two files aiming at the same destination', () => {
    // The second would erase the first without anything reporting it.
    const result = parseMeta(
      meta({
        files: [
          { path: 'a.tsx', target: 'text/Same.tsx' },
          { path: 'b.tsx', target: 'text/Same.tsx' },
        ],
      }),
      'text/x',
    )
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.problems.join()).toMatch(/same destination/)
  })
})

describe('coherence of the cost', () => {
  it('requires a fallback for an expensive component', () => {
    // Without a fallback, the screen stays empty while loading, on slow devices
    // and in reduced motion.
    const result = parseMeta(
      meta({ engine: { gl: 'three' }, perf: { tier: 'heavy', backend: 'three' } }),
      'hero/x',
    )
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.problems.join()).toMatch(/visual fallback/)
  })

  it('accepts an expensive component that declares its fallback', () => {
    const result = parseMeta(
      meta({
        category: 'hero',
        engine: { gl: 'three' },
        perf: { tier: 'heavy', backend: 'three', fallback: 'poster' },
      }),
      'hero/x',
    )
    expect(result.ok).toBe(true)
  })

  it('refuses a backend declared in two different ways', () => {
    const result = parseMeta(
      meta({
        engine: { gl: 'ogl' },
        perf: { tier: 'heavy', backend: 'three', fallback: 'poster' },
      }),
      'background/x',
    )
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.problems.join()).toMatch(/does not match/)
  })

  it('refuses a 3D scene classed as anything but expensive', () => {
    // Classing it light would disable the safeguards of the CLI and of the
    // surface arbiter.
    const result = parseMeta(
      meta({
        engine: { gl: 'three' },
        perf: { tier: 'light', backend: 'three', fallback: 'poster' },
      }),
      'hero/x',
    )
    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.problems.join()).toMatch(/high cost/)
  })
})

describe('resolution of the graph', () => {
  it('installs the dependencies before what requires them', () => {
    const result = resolveGraph(
      ['text/split-reveal'],
      catalogue({ 'text/split-reveal': ['hooks/use-in-view'], 'hooks/use-in-view': [] }),
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.graph.order).toEqual(['hooks/use-in-view', 'text/split-reveal'])
  })

  it('reports what was added without having been asked for', () => {
    const result = resolveGraph(
      ['text/split-reveal'],
      catalogue({ 'text/split-reveal': ['hooks/use-in-view'], 'hooks/use-in-view': [] }),
    )
    if (!result.ok) return
    expect(result.graph.implied).toEqual(['hooks/use-in-view'])
  })

  it('resolves a deep graph without duplicates', () => {
    const result = resolveGraph(
      ['a/one', 'a/two'],
      catalogue({
        'a/one': ['b/common'],
        'a/two': ['b/common'],
        'b/common': ['c/base'],
        'c/base': [],
      }),
    )

    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.graph.order).toEqual(['c/base', 'b/common', 'a/one', 'a/two'])
  })

  it('reports an entry that cannot be found, and who required it', () => {
    const result = resolveGraph(['a/one'], catalogue({ 'a/one': ['b/absent'] }))

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.problems[0]).toEqual({
      kind: 'missing',
      id: 'b/absent',
      requiredBy: 'a/one',
    })
  })

  it('detects a cycle and gives its path', () => {
    // An error that says only "cycle detected" forces you to look for it by
    // hand across the whole registry.
    const result = resolveGraph(
      ['a/one'],
      catalogue({ 'a/one': ['b/two'], 'b/two': ['c/three'], 'c/three': ['a/one'] }),
    )

    expect(result.ok).toBe(false)
    if (result.ok) return
    expect(result.problems[0]).toMatchObject({ kind: 'cycle' })
    expect(describeProblem(result.problems[0]!)).toBe(
      'Dependency cycle: a/one → b/two → c/three → a/one',
    )
  })

  it('detects a direct cycle', () => {
    const result = resolveGraph(['a/one'], catalogue({ 'a/one': ['a/one'] }))
    expect(result.ok).toBe(false)
  })

  it('does not loop forever on a cycle', () => {
    const result = resolveGraph(
      ['a/one'],
      catalogue({ 'a/one': ['b/two'], 'b/two': ['a/one'] }),
    )
    expect(result.ok).toBe(false)
  })

  it('accepts an empty request', () => {
    const result = resolveGraph([], catalogue({}))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.graph.order).toEqual([])
  })
})

describe('integrity of a whole catalogue', () => {
  it('reports nothing on a sound catalogue', () => {
    expect(validateCatalogue(catalogue({ 'a/one': ['b/two'], 'b/two': [] }))).toEqual([])
  })

  it('reports a dependency pointing into the void', () => {
    const problems = validateCatalogue(catalogue({ 'a/one': ['b/absent'] }))
    expect(problems).toHaveLength(1)
    expect(describeProblem(problems[0]!)).toMatch(/not found/)
  })

  it('builds a catalogue from complete entries', () => {
    const parsed = parseMeta(meta({ registryDependencies: ['hooks/use-in-view'] }), 'x')
    expect(parsed.ok).toBe(true)
    if (!parsed.ok) return

    const built = toCatalogue([{ ...parsed.meta, id: entryId(parsed.meta) }])
    expect(built.get('text/split-reveal')?.registryDependencies).toEqual([
      'hooks/use-in-view',
    ])
  })
})
