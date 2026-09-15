import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { hasGlob, transformGlob, toRegex } from './glob.js'

describe('toRegex', () => {
  it('a single star does not cross directories', () => {
    expect(toRegex('./pages/*.tsx').test('./pages/index.tsx')).toBe(true)
    expect(toRegex('./pages/*.tsx').test('./pages/blog/index.tsx')).toBe(false)
  })

  it('two stars cross them', () => {
    expect(toRegex('./pages/**/*.tsx').test('./pages/blog/index.tsx')).toBe(true)
  })

  it('two stars also match the absence of an intermediate directory', () => {
    // `a/**/b` must match `a/b`: without that, a pattern written for a deep
    // tree would miss the files placed at the root.
    expect(toRegex('./pages/**/*.tsx').test('./pages/index.tsx')).toBe(true)
  })

  it('a brace offers a choice', () => {
    const pattern = toRegex('./content/*.{md,mdx}')
    expect(pattern.test('./content/post.md')).toBe(true)
    expect(pattern.test('./content/post.mdx')).toBe(true)
    expect(pattern.test('./content/post.txt')).toBe(false)
  })

  it('a dot is a dot, not any character', () => {
    expect(toRegex('./a.tsx').test('./aXtsx')).toBe(false)
  })

  it('a question mark is worth one character', () => {
    expect(toRegex('./a?.ts').test('./ab.ts')).toBe(true)
    expect(toRegex('./a?.ts').test('./abc.ts')).toBe(false)
  })
})

describe('hasGlob', () => {
  it('recognises a call', () => {
    expect(hasGlob("import.meta.glob('./a/*.ts')")).toBe(true)
  })

  it('does not fire on ordinary code', () => {
    expect(hasGlob('const glob = 1')).toBe(false)
  })
})

describe('transformGlob', () => {
  let root: string
  let file: string

  beforeEach(() => {
    root = mkdtempSync(join(tmpdir(), 'odoro-glob-'))
    mkdirSync(join(root, 'src', 'pages'), { recursive: true })
    writeFileSync(join(root, 'src', 'pages', 'home.tsx'), 'export const a = 1')
    writeFileSync(join(root, 'src', 'pages', 'contact.tsx'), 'export const a = 2')
    writeFileSync(join(root, 'src', 'pages', 'notes.md'), '# no')
    file = join(root, 'src', 'routes.ts')
    writeFileSync(file, '')
  })

  afterEach(() => {
    rmSync(root, { recursive: true, force: true })
  })

  const transform = (code: string): string =>
    transformGlob(code, file, root)?.code ?? '(unchanged)'

  it('returns a table of import functions', () => {
    const rendered = transform("const p = import.meta.glob('./pages/*.tsx')")

    expect(rendered).toContain('"./pages/home.tsx": () => import("./pages/home.tsx")')
    expect(rendered).toContain(
      '"./pages/contact.tsx": () => import("./pages/contact.tsx")',
    )
  })

  it('only picks up what the pattern matches', () => {
    expect(transform("const p = import.meta.glob('./pages/*.tsx')")).not.toContain(
      'notes.md',
    )
  })

  it('hoists the imports when loading is eager', () => {
    const rendered = transform(
      "const p = import.meta.glob('./pages/*.tsx', { eager: true })",
    )

    // The static imports must come first: placed at the call site, they would
    // be a syntax error as soon as the call sits inside a function.
    expect(rendered.startsWith('import * as __odoro_glob_0')).toBe(true)
    expect(rendered).toContain('"./pages/contact.tsx": __odoro_glob_0')
  })

  it('exposes a single export when asked for it', () => {
    const rendered = transform(
      "const p = import.meta.glob('./pages/*.tsx', { eager: true, import: 'title' })",
    )

    expect(rendered).toContain('__odoro_glob_0["title"]')
  })

  it('unwraps the requested export in lazy loading too', () => {
    const rendered = transform(
      "const p = import.meta.glob('./pages/*.tsx', { import: 'title' })",
    )

    expect(rendered).toContain('.then((m) => m["title"])')
  })

  it('accepts an array of patterns', () => {
    const rendered = transform(
      "const p = import.meta.glob(['./pages/*.tsx', './pages/*.md'])",
    )

    expect(rendered).toContain('home.tsx')
    expect(rendered).toContain('notes.md')
  })

  it('removes what a negative pattern excludes', () => {
    const rendered = transform(
      "const p = import.meta.glob(['./pages/*.tsx', '!./pages/contact.tsx'])",
    )

    expect(rendered).toContain('home.tsx')
    expect(rendered).not.toContain('contact.tsx')
  })

  it('returns an empty object when nothing matches', () => {
    expect(transform("const p = import.meta.glob('./missing/*.tsx')")).toBe(
      'const p = {}',
    )
  })

  it('never picks itself up', () => {
    // A `./*.ts` pattern written in a file of the directory would otherwise
    // produce an immediate circular import.
    const rendered = transform("const p = import.meta.glob('./*.ts')")
    expect(rendered).not.toContain('routes.ts')
  })

  it('leaves the code untouched when there is no pattern', () => {
    expect(transformGlob('const a = 1', file, root)).toBeUndefined()
  })

  it('handles two calls in the same file', () => {
    const rendered = transform(
      "const a = import.meta.glob('./pages/*.tsx')\n" +
        "const b = import.meta.glob('./pages/*.md')",
    )

    expect(rendered).toContain('home.tsx')
    expect(rendered).toContain('notes.md')
  })

  it('orders the keys in a stable way', () => {
    // Two builds of the same source must produce the same bundle, otherwise the
    // hashes change without anything having changed.
    const first = transform("const p = import.meta.glob('./pages/*.tsx')")
    const second = transform("const p = import.meta.glob('./pages/*.tsx')")
    expect(first).toBe(second)
    expect(first.indexOf('contact')).toBeLessThan(first.indexOf('home'))
  })

  it('reports the files reached', () => {
    const resolved = transformGlob(
      "const p = import.meta.glob('./pages/*.tsx')",
      file,
      root,
    )

    expect(resolved?.files).toHaveLength(2)
    expect(resolved?.files[0]).toContain('contact.tsx')
  })

  it('accepts a pattern anchored to the project root', () => {
    const rendered = transform("const p = import.meta.glob('/src/pages/*.tsx')")
    expect(rendered).toContain('"/src/pages/home.tsx"')
  })
})
