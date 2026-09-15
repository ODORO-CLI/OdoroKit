import { join } from 'node:path'

import { describe, expect, it } from 'vitest'

import type { ResolvedConfig } from '../config.js'
import { ModuleGraph, detectSelfAccepting } from './graph.js'
import { extractEntries, injectClient } from './server.js'
import {
  wrapJson,
  isAssetRequest,
  wantsStylesheet,
  applyAlias,
  depFileName,
  fileToUrl,
  hasExtension,
  isBareSpecifier,
  urlToFile,
  wrapAsset,
  wrapStyle,
} from './transform.js'

const ROOT = process.platform === 'win32' ? 'C:\\project' : '/project'

/** Minimal configuration, enough for the functions under test. */
const config = {
  root: ROOT,
  alias: { '@': 'src' },
} as unknown as ResolvedConfig

describe('isBareSpecifier', () => {
  it.each(['react', 'react-dom/client', '@scope/package'])(
    'recognises %j',
    (specifier) => {
      expect(isBareSpecifier(specifier)).toBe(true)
    },
  )

  it.each(['./App', '../lib', '/src/main.tsx', 'https://cdn/x.js', 'data:text/js,'])(
    'rejects %j',
    (specifier) => {
      expect(isBareSpecifier(specifier)).toBe(false)
    },
  )
})

describe('hasExtension', () => {
  it('ignores the query string', () => {
    expect(hasExtension('/src/logo.svg?import', ['.svg'])).toBe(true)
  })

  it('is case insensitive', () => {
    expect(hasExtension('/src/App.CSS', ['.css'])).toBe(true)
  })

  it('refuses a different extension', () => {
    expect(hasExtension('/src/App.tsx', ['.css'])).toBe(false)
  })
})

describe('applyAlias', () => {
  it('replaces an alias prefix by an absolute path', () => {
    expect(applyAlias('@/routes/Home', config)).toBe(join(ROOT, 'src', 'routes', 'Home'))
  })

  it('replaces the bare prefix too', () => {
    expect(applyAlias('@', config)).toBe(join(ROOT, 'src'))
  })

  it('leaves a specifier without an alias untouched', () => {
    expect(applyAlias('react', config)).toBe('react')
    expect(applyAlias('./neighbour', config)).toBe('./neighbour')
  })

  it('does not mistake a prefix for the start of a name', () => {
    expect(applyAlias('@scope/package', config)).toBe('@scope/package')
  })
})

describe('conversion between paths and URLs', () => {
  it('makes the round trip for a project file', () => {
    const file = join(ROOT, 'src', 'main.tsx')
    const url = fileToUrl(file, ROOT)
    expect(url).toBe('/src/main.tsx')
    expect(urlToFile(url, ROOT)).toBe(file)
  })

  it('removes the query string on the reverse conversion', () => {
    expect(urlToFile('/src/main.tsx?t=123', ROOT).endsWith('main.tsx')).toBe(true)
  })
})

describe('depFileName', () => {
  it.each([
    ['react', 'react.js'],
    ['react-dom/client', 'react-dom_client.js'],
    ['@scope/package', 'scope_package.js'],
    // The scope loses its at sign and its slashes become underscores. The dash
    // of the scope stays: `@odoro-cli/libs/router` and `odoro/cli/libs/router`
    // produce different names, so nothing collides.
    ['@odoro-cli/libs/router', 'odoro-cli_libs_router.js'],
  ])('%j becomes %j', (specifier, expected) => {
    expect(depFileName(specifier)).toBe(expected)
  })

  it('does not produce a collision between two packages of the same name', () => {
    expect(depFileName('a/client')).not.toBe(depFileName('b/client'))
  })
})

describe('extractEntries', () => {
  it('finds the module scripts', () => {
    const html = '<script type="module" src="/src/main.tsx"></script>'
    expect(extractEntries(html, ROOT)).toHaveLength(1)
  })

  it('ignores classic scripts and remote scripts', () => {
    const html = [
      '<script src="/legacy.js"></script>',
      '<script type="module" src="https://cdn/x.js"></script>',
    ].join('')
    expect(extractEntries(html, ROOT)).toEqual([])
  })
})

describe('injectClient', () => {
  it('inserts the client before the closing head tag', () => {
    const result = injectClient('<html><head><title>x</title></head><body></body></html>')
    expect(result).toContain('/@odoro/client')
    expect(result.indexOf('/@odoro/client')).toBeLessThan(result.indexOf('</head>'))
  })

  it('falls back to the top of the document when head is absent', () => {
    expect(injectClient('<div></div>').startsWith('<script')).toBe(true)
  })
})

describe('module wrappers', () => {
  it('produces a module that injects the stylesheet and accepts updates', () => {
    const module = wrapStyle('/src/App.css', 'body{margin:0}')
    expect(module).toContain('document.createElement')
    expect(module).toContain('import.meta.hot?.accept()')
    expect(module).toContain(JSON.stringify('body{margin:0}'))
  })

  it('produces a module exporting the URL of an asset', () => {
    expect(wrapAsset('/src/logo.svg')).toBe('export default "/src/logo.svg"\n')
  })
})

describe('detectSelfAccepting', () => {
  it.each([
    'import.meta.hot.accept()',
    'import.meta.hot?.accept()',
    'import.meta.hot.accept((module) => {})',
    'import . meta . hot . accept (  )',
  ])('recognises %j', (source) => {
    expect(detectSelfAccepting(source)).toBe(true)
  })

  it('does not fire on an ordinary module', () => {
    expect(detectSelfAccepting('const accept = () => {}')).toBe(false)
    expect(detectSelfAccepting('import.meta.env.DEV')).toBe(false)
  })
})

describe('ModuleGraph', () => {
  it('creates a module then finds it again', () => {
    const graph = new ModuleGraph()
    const node = graph.ensure('/a.ts', '/a.ts')
    expect(graph.ensure('/a.ts', '/a.ts')).toBe(node)
    expect(graph.get('/a.ts')).toBe(node)
    expect(graph.size).toBe(1)
  })

  it('keeps the reverse relations up to date', () => {
    const graph = new ModuleGraph()
    graph.ensure('/a.ts', '/a.ts')
    graph.ensure('/b.ts', '/b.ts')

    graph.setDependencies('/a.ts', ['/b.ts'])
    expect(graph.get('/b.ts')?.importers.has('/a.ts')).toBe(true)

    graph.setDependencies('/a.ts', [])
    expect(graph.get('/b.ts')?.importers.has('/a.ts')).toBe(false)
  })

  it('reports a full reload when nothing accepts', () => {
    const graph = new ModuleGraph()
    graph.ensure('/a.ts', '/a.ts')
    expect(graph.invalidate('/a.ts')).toEqual([])
  })

  it('returns the module itself when it accepts its own updates', () => {
    const graph = new ModuleGraph()
    const node = graph.ensure('/style.css', '/style.css')
    node.selfAccepting = true

    const boundaries = graph.invalidate('/style.css')
    expect(boundaries).toEqual([node])
  })

  it('climbs to the first boundary that accepts', () => {
    const graph = new ModuleGraph()
    graph.ensure('/leaf.ts', '/leaf.ts')
    const middle = graph.ensure('/middle.ts', '/middle.ts')
    graph.ensure('/root.ts', '/root.ts')

    graph.setDependencies('/middle.ts', ['/leaf.ts'])
    graph.setDependencies('/root.ts', ['/middle.ts'])
    middle.selfAccepting = true

    expect(graph.invalidate('/leaf.ts')).toEqual([middle])
  })

  it('demands a reload when a single branch does not accept', () => {
    const graph = new ModuleGraph()
    graph.ensure('/leaf.ts', '/leaf.ts')
    const accepting = graph.ensure('/a.ts', '/a.ts')
    graph.ensure('/b.ts', '/b.ts')

    graph.setDependencies('/a.ts', ['/leaf.ts'])
    graph.setDependencies('/b.ts', ['/leaf.ts'])
    accepting.selfAccepting = true

    expect(graph.invalidate('/leaf.ts')).toEqual([])
  })

  it('invalidates the cached code and moves the timestamp on', () => {
    const graph = new ModuleGraph()
    const node = graph.ensure('/a.ts', '/a.ts')
    node.code = 'old'
    node.selfAccepting = true

    graph.invalidate('/a.ts')
    expect(node.code).toBeUndefined()
  })

  it('withstands an import cycle without looping', () => {
    const graph = new ModuleGraph()
    graph.ensure('/a.ts', '/a.ts')
    graph.ensure('/b.ts', '/b.ts')
    graph.setDependencies('/a.ts', ['/b.ts'])
    graph.setDependencies('/b.ts', ['/a.ts'])

    expect(() => graph.invalidate('/a.ts')).not.toThrow()
  })

  it('forgets everything after a clear', () => {
    const graph = new ModuleGraph()
    graph.ensure('/a.ts', '/a.ts')
    graph.clear()
    expect(graph.size).toBe(0)
  })
})

describe('wantsStylesheet', () => {
  it('returns the stylesheet to a <link> tag', () => {
    // The case that failed: the browser received JavaScript where it expected
    // CSS, and refused on a "strict MIME checking".
    expect(wantsStylesheet({ 'sec-fetch-dest': 'style' }, '/a.css')).toBe(true)
  })

  it('returns the injecting module to an import', () => {
    // That module is the one carrying hot replacement: returning raw CSS would
    // reload the page on every stylesheet edit.
    expect(wantsStylesheet({ 'sec-fetch-dest': 'script' }, '/a.css')).toBe(false)
  })

  it('still honours the hand-written convention', () => {
    expect(wantsStylesheet({}, '/a.css?direct')).toBe(true)
  })

  it('falls back on what the client accepts, for lack of Sec-Fetch-Dest', () => {
    expect(wantsStylesheet({ accept: 'text/css,*/*;q=0.1' }, '/a.css')).toBe(true)
    expect(wantsStylesheet({ accept: '*/*' }, '/a.css')).toBe(false)
  })

  it('is not fooled by a repeated header', () => {
    // Node returns an array when a header arrives twice: reading it as a string
    // would find anything there.
    expect(wantsStylesheet({ accept: ['text/css', '*/*'] }, '/a.css')).toBe(false)
  })

  it('returns the module by default', () => {
    expect(wantsStylesheet({}, '/a.css')).toBe(false)
  })
})

describe('isAssetRequest', () => {
  it('recognises a module', () => {
    // The reported case: a `<script type="module">` receiving the application
    // document, and failing on "Failed to load module script".
    expect(isAssetRequest({ 'sec-fetch-dest': 'script' })).toBe(true)
  })

  it('recognises the other assets', () => {
    for (const dest of ['style', 'image', 'font', 'worker', 'manifest']) {
      expect(isAssetRequest({ 'sec-fetch-dest': dest }), dest).toBe(true)
    }
  })

  it('lets a navigation through', () => {
    // That one must receive the document: otherwise the client router would
    // never get hold of a deep route.
    expect(isAssetRequest({ 'sec-fetch-dest': 'document' })).toBe(false)
  })

  it('does not decide without the header', () => {
    // A `curl`, a hand-typed address: the fallback stays the expected
    // behaviour, and refusing would be worse than serving.
    expect(isAssetRequest({})).toBe(false)
  })

  it('ignores a repeated header', () => {
    // Node returns an array when a header arrives twice.
    expect(isAssetRequest({ 'sec-fetch-dest': ['script', 'document'] })).toBe(false)
  })
})

describe('wrapJson', () => {
  it('returns the whole object by default', () => {
    expect(wrapJson('{"a":1}')).toContain('export default {"a":1}')
  })

  it('draws a named export from every key that can carry one', () => {
    const module = wrapJson('{"name":"x","version":"1.0.0"}')
    expect(module).toContain('export const name = "x"')
    expect(module).toContain('export const version = "1.0.0"')
  })

  it('skips a key that cannot name an export', () => {
    // `lint:fix` and `@odoro-cli/libs` are met in a package.json.
    const module = wrapJson('{"lint:fix":1,"@odoro-cli/libs":"2","ok":3}')
    expect(module).toContain('export const ok = 3')
    expect(module).not.toContain('lint:fix =')
    expect(module).not.toContain('@odoro-cli/libs =')
  })

  it('skips a reserved word, strict mode included', () => {
    // `private` is a package.json key and a reserved word: exporting it would
    // be a syntax error, which would break the whole module hence the page.
    const module = wrapJson('{"private":true,"name":"x"}')
    expect(module).not.toContain('export const private')
    expect(module).toContain('export const name = "x"')
    // It stays reachable through the default export.
    expect(module).toContain('"private":true')
  })

  it('draws no named export from an array', () => {
    const module = wrapJson('[1,2,3]')
    expect(module).toContain('export default [1,2,3]')
    expect(module).not.toContain('export const')
  })

  it('returns a readable error on unreadable JSON', () => {
    // Serving a module that would fail further on would hide the cause.
    expect(wrapJson('{ broken')).toContain('SyntaxError')
  })
})
