import type { RegistryMeta } from 'odoro/registry'
import { describe, expect, it } from 'vitest'

import { checkContract, stripComments, usedTokens } from './contract.js'

/** Minimal validated entry, to derive in each test. */
function meta(overrides: Partial<RegistryMeta> = {}): RegistryMeta & { id: string } {
  return {
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
    ...overrides,
  }
}

/** Source of a compliant component, to derive. */
const COMPLIANT = `
export function Demo({ className, ...rest }: Props) {
  return <div {...rest} className={className} style={{ color: 'var(--o-palette-zinc-900)' }} />
}
`

describe('token reading', () => {
  it('picks up a token consumed directly', () => {
    expect([...usedTokens('color: var(--o-palette-zinc-500)')]).toEqual([
      '--o-palette-zinc-500',
    ])
  })

  it('accepts a fallback value', () => {
    expect([...usedTokens('var( --o-ease-entrance , ease-out)')]).toEqual([
      '--o-ease-entrance',
    ])
  })

  it('picks up a token read from JavaScript', () => {
    // A shader needs three floats: it reads the token by its name, not by a
    // CSS declaration. The first version of the rule refused that case
    // nonetheless.
    expect([...usedTokens("readTokenColour('--o-palette-brand-600', host)")]).toEqual([
      '--o-palette-brand-600',
    ])
  })

  it('accepts the three kinds of quotes', () => {
    expect(usedTokens('a("--o-duration-fast") b(`--o-duration-slow`)').size).toBe(2)
  })

  it('does not count the same token twice', () => {
    expect(usedTokens("var(--o-palette-zinc-900) '--o-palette-zinc-900'").size).toBe(1)
  })
})

describe('comment stripping', () => {
  it('strips a line comment', () => {
    expect(stripComments('const a = 1 // var(--o-palette-zinc-900)')).not.toMatch(
      /--o-palette-zinc-900/,
    )
  })

  it('strips a documentation block', () => {
    expect(
      stripComments('/** example: --o-palette-fuchsia-600 */ const a = 1'),
    ).not.toMatch(/--o-palette-fuchsia-600/)
  })

  it('leaves the strings intact', () => {
    // A token read lives in a string, a shader in a template: walking through
    // them would amount to seeing nothing at all.
    expect(stripComments("read('--o-palette-zinc-900')")).toBe(
      "read('--o-palette-zinc-900')",
    )
    expect(stripComments('const s = `var(--o-bg)`')).toMatch(/--o-bg/)
  })

  it('does not take a slash inside a string for a comment', () => {
    expect(stripComments("const u = 'https://example.com'")).toBe(
      "const u = 'https://example.com'",
    )
  })

  it('respects an escaped quote', () => {
    // Without the escape being taken into account, the string would seem
    // closed too early and the rest of the line would be read as code.
    const source = String.raw`const s = 'a\'b' // x`
    expect(stripComments(source)).toBe(String.raw`const s = 'a\'b' `)
  })
})

describe('rule 1 — token coherence', () => {
  it('accepts a declaration that matches the code', () => {
    const problems = checkContract(meta({ tokens: ['--o-palette-zinc-900'] }), {
      'component.tsx': COMPLIANT,
    })
    expect(problems).toEqual([])
  })

  it('refuses a token declared but never used', () => {
    // The gap is invisible on review — both files have to be under your eyes
    // — and it misleads whoever looks for which variable to turn.
    const problems = checkContract(
      meta({ tokens: ['--o-palette-zinc-900', '--o-duration-slow'] }),
      {
        'component.tsx': COMPLIANT,
      },
    )
    expect(problems).toHaveLength(1)
    expect(problems[0]?.message).toMatch(/--o-duration-slow is declared/)
  })

  it('does not count a token quoted in an example', () => {
    // An example shows something other than the default: that is its point.
    // The first draft of this rule stumbled on exactly that.
    const problems = checkContract(meta({ tokens: ['--o-palette-zinc-900'] }), {
      'component.tsx': `/**
 * @example
 * <Background colors={['--o-palette-red-600', '--o-palette-zinc-900']} />
 */
${COMPLIANT}`,
    })
    expect(problems).toEqual([])
  })

  it('refuses a token that does not exist in the system', () => {
    // Catches the typo, which coherence alone let through as soon as it was
    // made on both sides.
    const problems = checkContract(meta({ tokens: ['--o-palette-zinc-42'] }), {
      'component.tsx': COMPLIANT,
    })
    expect(problems.map((p) => p.message).join()).toMatch(/does not exist in the system/)
  })

  it('ignores a private variable of the component', () => {
    // `--o-shine-duration` is not a token: it is a variable the component
    // gives itself. The first version of the rule demanded its declaration.
    const problems = checkContract(meta(), {
      'component.tsx': `const s = { '--o-shine-duration': '3s' }; const c = 'className'`,
    })
    expect(problems).toEqual([])
  })

  it('refuses a token used but not declared', () => {
    const problems = checkContract(meta(), { 'component.tsx': COMPLIANT })
    expect(problems[0]?.message).toMatch(/--o-palette-zinc-900 is used/)
  })

  it('looks at every file of the entry', () => {
    const problems = checkContract(meta({ tokens: ['--o-palette-fuchsia-600'] }), {
      'component.tsx': COMPLIANT.replace(
        'var(--o-palette-zinc-900)',
        'var(--o-palette-zinc-900)',
      ),
      'styles.ts': 'export const s = { background: "var(--o-palette-fuchsia-600)" }',
    })
    expect(problems.map((p) => p.message).join()).not.toMatch(/--o-palette-fuchsia-600/)
  })
})

describe('rule 2 — the pass-through', () => {
  it('refuses a component that does not mention className', () => {
    const problems = checkContract(meta(), {
      'component.tsx': 'export function Demo() { return <div /> }',
    })
    expect(problems[0]?.message).toMatch(/className/)
  })

  it('demands nothing of a hook', () => {
    // A hook renders no element: asking it for className would make no sense.
    const problems = checkContract(meta({ category: 'hooks', name: 'use-base' }), {
      'hook.ts': 'export const useBase = () => null',
    })
    expect(problems).toEqual([])
  })

  it('accepts a component that accepts it', () => {
    const problems = checkContract(meta({ tokens: ['--o-palette-zinc-900'] }), {
      'component.tsx': COMPLIANT,
    })
    expect(problems).toEqual([])
  })
})

describe('rule 3 — no hard-coded colour', () => {
  it('refuses a hexadecimal colour', () => {
    // It escapes the tokens: changing the theme will not touch it.
    const problems = checkContract(meta(), {
      'component.tsx': "export const c = { color: '#1a2b3c', className: '' }",
    })
    expect(problems[0]?.message).toMatch(/#1a2b3c/)
  })

  it('refuses a functional colour', () => {
    const problems = checkContract(meta(), {
      'component.tsx':
        "const s = { background: 'rgba(0,0,0,.5)' }; const c = 'className'",
    })
    expect(problems[0]?.message).toMatch(/rgba\(/)
  })

  it('does not confuse a shader directive with a colour', () => {
    // `#version` and `#ifdef` contain letters outside the hexadecimal
    // alphabet: the word boundary prevents a partial match.
    const problems = checkContract(meta({ category: 'hooks', name: 'use-x' }), {
      'shader.ts': 'export const S = `#version 300 es\\n#ifdef HIGH\\n#endif`',
    })
    expect(problems).toEqual([])
  })

  it('does not take an HTML entity for a colour', () => {
    // `&#8249;` is a typographic chevron. Without the exclusion, every
    // component using a character of that kind was blamed for a colour it had
    // not written.
    const problems = checkContract(meta({ category: 'hooks', name: 'use-x' }), {
      'a.ts': 'const chevrons = ["&#8249;", "&#8250;"]',
    })
    expect(problems).toEqual([])
  })

  it('quotes only the first occurrences', () => {
    const problems = checkContract(meta({ category: 'hooks', name: 'use-x' }), {
      'a.ts': "'#111' '#222' '#333' '#444' '#555'",
    })
    expect(problems).toHaveLength(1)
    expect(problems[0]?.message).toMatch(/#111, #222, #333/)
    expect(problems[0]?.message).not.toMatch(/#444/)
  })
})

describe('accumulation', () => {
  it('gathers every breach of the same entry', () => {
    const problems = checkContract(meta(), {
      'component.tsx': "export const c = '#fff'",
    })
    // No className, and a hard-coded colour.
    expect(problems).toHaveLength(2)
  })

  it('prefixes every message with the identifier', () => {
    const problems = checkContract(meta(), {
      'component.tsx': "export const c = '#fff'",
    })
    for (const problem of problems) expect(problem.message).toMatch(/^text\/demo: /)
  })
})
