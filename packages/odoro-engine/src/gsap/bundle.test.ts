import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const SOURCE = join(ROOT, 'src')
const DIST = join(ROOT, 'dist')

/** Plugins that must never enter the initial bundle. */
const LAZY_PLUGINS = ['ScrollTrigger', 'SplitText', 'Observer', 'ScrollSmoother'] as const

/** TypeScript files of the engine, excluding tests. */
function sourceFiles(directory: string): string[] {
  const found: string[] = []
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      found.push(...sourceFiles(path))
    } else if (/\.tsx?$/.test(entry.name) && !entry.name.includes('.test.')) {
      found.push(path)
    }
  }
  return found
}

describe('on-demand loading', () => {
  it('imports no plugin statically', () => {
    // A single static import would be enough to pull 130 KB of plugin code into
    // the initial bundle of a project that only animates text.
    const offenders: string[] = []

    for (const file of sourceFiles(SOURCE)) {
      const code = readFileSync(file, 'utf8')
      for (const plugin of LAZY_PLUGINS) {
        // A dynamic import is written `import('gsap/X')`; a static import
        // carries the `from` keyword.
        const isStatic = new RegExp(`from\\s*['"]gsap/${plugin}['"]`)
        if (isStatic.test(code)) {
          offenders.push(`${file.replace(ROOT, '')} statically imports ${plugin}`)
        }
      }
    }

    expect(offenders).toEqual([])
  })

  it('keeps dynamic imports in the source', () => {
    const setup = readFileSync(join(SOURCE, 'gsap', 'setup.ts'), 'utf8')
    for (const plugin of LAZY_PLUGINS) {
      expect(setup).toContain(`import('gsap/${plugin}')`)
    }
  })
})

describe.runIf(existsSync(join(DIST, 'index.js')))('produced bundle', () => {
  const bundle = readFileSync(join(DIST, 'index.js'), 'utf8')

  it('pulls no 3D renderer into the main entry', () => {
    // The 3D renderer weighs an order of magnitude more than the light backend.
    // A site that only shows a text animation must not download a single line
    // of it: the guarantee is checked, not asserted.
    //
    // What is looked for is a **reference to the package**, not the word. The
    // check used to be a plain substring, and any comment saying "three" made
    // it fail — a shader explaining that it stacks three layers was enough. A
    // guard that cries wolf over prose gets disabled, and then guards nothing.
    expect(bundle).not.toMatch(/from\s*['"]three(\/[^'"]*)?['"]/)
    expect(bundle).not.toMatch(/import\(\s*['"]three(\/[^'"]*)?['"]\s*\)/)
    expect(bundle).not.toMatch(/require\(\s*['"]three(\/[^'"]*)?['"]\s*\)/)

    // And two symbols that only the renderer defines: they would betray an
    // inlined copy, which no import statement would reveal.
    expect(bundle).not.toContain('WebGLRenderer')
    expect(bundle).not.toContain('PerspectiveCamera')
  })

  it('keeps the light backend as a dynamic import', () => {
    expect(bundle).toContain("import('ogl')")
  })

  it('keeps the plugins as dynamic imports', () => {
    // Code splitting can move this code into a chunk shared between the two
    // entries: it is the whole bundle that must be inspected, not the main
    // entry alone.
    const all = readdirSync(DIST)
      .filter((entry) => entry.endsWith('.js'))
      .map((entry) => readFileSync(join(DIST, entry), 'utf8'))
      .join('\n')

    for (const plugin of LAZY_PLUGINS) {
      expect(all).toContain(`import('gsap/${plugin}')`)
    }
  })

  it('inlines the code of no plugin', () => {
    // Markers specific to the implementation of the plugins: their presence
    // would mean the code was copied into the entry.
    for (const marker of ['_scrollers', 'refreshInits', 'linesClass']) {
      expect(bundle).not.toContain(marker)
    }
  })

  it('leaves the base library external', () => {
    // Its licence forbids removing the proprietary notices, which rules out
    // inlining it in a published package.
    //
    // The local binding is not fixed: as soon as two modules of the package
    // import gsap, the bundler renames one of the two to avoid the collision.
    // What matters is that the import stays, and that no line of gsap is
    // copied.
    expect(bundle).toMatch(/^import \w+ from ['"]gsap['"]/m)
    expect(bundle).not.toContain('Copyright 2008-')
  })

  it('stays under the announced weight threshold', () => {
    const kilobytes = Buffer.byteLength(bundle) / 1024
    expect(kilobytes).toBeLessThan(60)
  })
})

describe.runIf(existsSync(join(DIST, 'three', 'index.js')))('3D backend entry', () => {
  const bundle = readFileSync(join(DIST, 'three', 'index.js'), 'utf8')

  it('loads the renderer dynamically', () => {
    // The entry separation is not enough: without a dynamic import,
    // importing this module would pull the renderer into the initial chunk of
    // the caller.
    expect(bundle).toContain("import('three')")
    expect(bundle).not.toMatch(/^import .* from ['"]three['"]/m)
  })

  it('does not inline the renderer', () => {
    // The size comparison is the most honest proof: looking for names like
    // `WebGLRenderer` would fail on a mere call site.
    const upstream = resolve(
      ROOT,
      '..',
      '..',
      'node_modules',
      'three',
      'build',
      'three.core.js',
    )

    if (!existsSync(upstream)) return

    const ratio = Buffer.byteLength(bundle) / statSync(upstream).size
    expect(ratio).toBeLessThan(0.05)
  })

  it('stays tiny', () => {
    // This entry contains only the logic of the engine: the real weight is
    // paid at the dynamic import, and only by whoever uses it.
    const kilobytes = Buffer.byteLength(bundle) / 1024
    expect(kilobytes).toBeLessThan(30)
  })
})
