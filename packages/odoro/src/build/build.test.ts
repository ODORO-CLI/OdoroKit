/**
 * Production build, end to end.
 *
 * The project put to the test has **no dependency**: everything is plain
 * JavaScript. That is what lets this test run everywhere, without an install,
 * and therefore be run every time — where the integration test, which installs
 * a full tree, is only run on demand.
 *
 * What it checks cannot be checked otherwise: a manifest, a preload or a
 * prerendered page are produced files, and only a real build produces them.
 *
 * @module
 */

import { mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { type OdoroConfig, loadConfig } from '../config.js'
import { buildProject } from './build.js'
import type { Manifest } from './manifest.js'

/** The document of a minimal project. */
const INDEX = `<!doctype html>
<html lang="en">
  <head><meta charset="UTF-8"><title>Bench</title></head>
  <body><div id="root"></div><script type="module" src="/src/main.js"></script></body>
</html>
`

describe('buildProject', () => {
  let root: string

  const write = (path: string, content: string): void => {
    const full = join(root, path)
    mkdirSync(dirname(full), { recursive: true })
    writeFileSync(full, content, 'utf8')
  }

  const read = (path: string): string => readFileSync(join(root, path), 'utf8')

  const compile = async (overrides: OdoroConfig = {}): Promise<void> => {
    const config = await loadConfig(root, {
      ...overrides,
      build: { minify: false, sourcemap: false, prune: false, ...overrides.build },
    })
    await buildProject(config)
  }

  beforeEach(async () => {
    root = await mkdtemp(join(tmpdir(), 'odoro-build-'))
    write('index.html', INDEX)
    write('package.json', '{ "name": "bench", "private": true, "type": "module" }')
  })

  afterEach(async () => {
    await rm(root, { recursive: true, force: true })
  })

  describe('manifest', () => {
    beforeEach(() => {
      write('src/late.js', 'export const late = 1')
      write(
        'src/main.js',
        'export const p = () => import("./late.js")\ndocument.title = "x"',
      )
    })

    it('names the entry by its source, not by its hashed file', async () => {
      // A server looks for `src/main.js`: it cannot guess `main-A1B2.js`, whose
      // hash changes on every modification.
      await compile()

      const manifest = JSON.parse(read('dist/manifest.json')) as Manifest
      expect(manifest['src/main.js']?.file).toMatch(/^main-[A-Z0-9]+\.js$/)
    })

    it('marks the entry of the document', async () => {
      await compile()

      const manifest = JSON.parse(read('dist/manifest.json')) as Manifest
      expect(manifest['src/main.js']?.isEntry).toBe(true)
    })

    it('does not mark a module loaded on demand as an entry', async () => {
      // The bundler gives them an `entryPoint` because they open a chunk.
      // Taking them for entries would place one `<script>` tag per lazy page:
      // everything would be loaded up front, and splitting would have served no
      // purpose.
      await compile()

      const manifest = JSON.parse(read('dist/manifest.json')) as Manifest
      const lazy = Object.entries(manifest).filter(([key]) => key.includes('late'))

      expect(lazy.length).toBeGreaterThan(0)
      for (const [, entry] of lazy) expect(entry.isEntry).toBeUndefined()
    })

    it('tells the deferred imports from the immediate ones', async () => {
      await compile()

      const manifest = JSON.parse(read('dist/manifest.json')) as Manifest
      expect(manifest['src/main.js']?.dynamicImports).toContain('src/late.js')
    })

    it('does not write it when it is not wanted', async () => {
      await compile({ build: { manifest: false } })
      expect(() => read('dist/manifest.json')).toThrow()
    })
  })

  describe('preloading', () => {
    it('declares the shared chunks in the document', async () => {
      // Without that, the browser only discovers a chunk after reading the
      // module that imports it: one round trip per level of depth, all on the
      // critical path.
      write('src/common.js', 'export const common = "shared"')
      write('src/a.js', 'import { common } from "./common.js"\nexport const a = common')
      write('src/b.js', 'import { common } from "./common.js"\nexport const b = common')
      write(
        'src/main.js',
        'import { common } from "./common.js"\n' +
          'export const p = () => Promise.all([import("./a.js"), import("./b.js")])\n' +
          'document.title = common',
      )

      await compile()
      expect(read('dist/index.html')).toMatch(
        /<link rel="modulepreload" crossorigin href="\/assets\/chunk-[A-Z0-9]+\.js">/,
      )
    })

    it('declares nothing when it is not wanted', async () => {
      write('src/common.js', 'export const c = 1')
      write('src/a.js', 'import { c } from "./common.js"\nexport const a = c')
      write(
        'src/main.js',
        'import { c } from "./common.js"\nexport const p = () => import("./a.js")\ndocument.title = String(c)',
      )

      await compile({ build: { preload: false } })
      expect(read('dist/index.html')).not.toContain('modulepreload')
    })
  })

  describe('prerendering', () => {
    beforeEach(() => {
      write('src/main.js', 'document.body.dataset.ready = "1"')
    })

    it('writes one document per route, each in its own directory', async () => {
      write(
        'src/entry-server.js',
        'export const routes = ["/", "/about", "/blog/first"]\n' +
          'export const render = (url) => `<main>${url}</main>`',
      )

      await compile({
        build: { prerender: { entry: 'src/entry-server.js' } },
      })

      expect(read('dist/index.html')).toContain('<main>/</main>')
      expect(read('dist/about/index.html')).toContain('<main>/about</main>')
      expect(read('dist/blog/first/index.html')).toContain('<main>/blog/first</main>')
    })

    it('fills the container without touching the application tags', async () => {
      write(
        'src/entry-server.js',
        'export const routes = ["/"]\nexport const render = () => "<h1>Hello</h1>"',
      )

      await compile({ build: { prerender: { entry: 'src/entry-server.js' } } })

      const page = read('dist/index.html')
      expect(page).toContain('<div id="root"><h1>Hello</h1></div>')
      expect(page).toMatch(/<script type="module" crossorigin src="\/assets\/main-/)
    })

    it('replaces the template title instead of adding a second one', async () => {
      // The browser keeps the first `<title>`: leaving two would keep the
      // template one on every page, without anything reporting it since the
      // page still displays.
      write(
        'src/entry-server.js',
        'export const routes = ["/"]\n' +
          'export const render = () => ({ html: "x", head: "<title>Real page</title>" })',
      )

      await compile({ build: { prerender: { entry: 'src/entry-server.js' } } })

      const titles = read('dist/index.html').match(/<title>/g) ?? []
      expect(titles).toHaveLength(1)
      expect(read('dist/index.html')).toContain('<title>Real page</title>')
    })

    it('adds the other tags without removing anything', async () => {
      write(
        'src/entry-server.js',
        'export const routes = ["/"]\n' +
          'export const render = () => ({ html: "x", head: \'<meta name="description" content="here">\' })',
      )

      await compile({ build: { prerender: { entry: 'src/entry-server.js' } } })

      const page = read('dist/index.html')
      expect(page).toContain('name="description"')
      expect(page).toContain('<title>Bench</title>')
    })

    it('prefers the routes of the configuration over those of the entry', async () => {
      write(
        'src/entry-server.js',
        'export const routes = ["/ignored"]\nexport const render = (url) => `<i>${url}</i>`',
      )

      await compile({
        build: { prerender: { entry: 'src/entry-server.js', routes: ['/chosen'] } },
      })

      expect(read('dist/chosen/index.html')).toContain('<i>/chosen</i>')
      expect(() => read('dist/ignored/index.html')).toThrow()
    })

    it('no longer accepts the former French export name', async () => {
      // `render` is now the only accepted name.
      write(
        'src/entry-server.js',
        'export const routes = ["/"]\nexport const rendu = () => "<b>ok</b>"',
      )

      await expect(
        compile({ build: { prerender: { entry: 'src/entry-server.js' } } }),
      ).rejects.toThrow(/render\(url\)/)
    })

    it('says what is missing when the entry does not exist', async () => {
      // Asking for it without writing it is a project error: the build must say
      // so, rather than produce a site without HTML while letting you believe
      // prerendering happened.
      await expect(
        compile({ build: { prerender: { entry: 'src/missing.js' } } }),
      ).rejects.toThrow(/missing\.js/)
    })

    it('says what is missing when the render is not exported', async () => {
      write('src/entry-server.js', 'export const routes = ["/"]')

      await expect(
        compile({ build: { prerender: { entry: 'src/entry-server.js' } } }),
      ).rejects.toThrow(/render\(url\)/)
    })

    it('renders nothing when prerendering is not requested', async () => {
      await compile()
      expect(read('dist/index.html')).toContain('<div id="root"></div>')
    })
  })

  describe('suffixed imports', () => {
    it('returns the content of a file with ?raw', async () => {
      write('src/charter.md', '# The charter')
      write('src/main.js', 'import t from "./charter.md?raw"\ndocument.title = t')

      await compile()
      const bundle = read(`dist/assets/${bundleName(root)}`)
      expect(bundle).toContain('# The charter')
    })

    it('returns a public address with ?url, without loading the file', async () => {
      write('src/logo.svg', '<svg xmlns="http://www.w3.org/2000/svg"></svg>')
      write('src/main.js', 'import u from "./logo.svg?url"\ndocument.title = u')

      await compile()
      expect(read(`dist/assets/${bundleName(root)}`)).toMatch(
        /\/assets\/logo-[A-Z0-9]+\.svg/,
      )
    })

    it('builds a worker apart, and points at it', async () => {
      write('src/compute.js', 'self.onmessage = (e) => self.postMessage(e.data * 2)')
      write('src/main.js', 'import C from "./compute.js?worker"\nwindow.C = C')

      await compile()

      const bundle = read(`dist/assets/${bundleName(root)}`)
      const target = /\/assets\/(compute-[A-Z0-9]+\.js)/.exec(bundle)?.[1]

      expect(target).toBeDefined()
      // The worker must exist on disk: an address that leads nowhere raises no
      // error before the first construction of the worker.
      expect(read(`dist/assets/${target ?? ''}`)).toContain('postMessage')
    })
  })

  describe('environment variables', () => {
    it('exposes what carries the prefix, and nothing else', async () => {
      write('.env', 'ODORO_SEEN=exposed\nSECRET=withheld')
      write(
        'src/main.js',
        'document.title = import.meta.env.ODORO_SEEN + String(import.meta.env.SECRET)',
      )

      await compile()

      const produced = readEveryScript(root)
      expect(produced).toContain('exposed')
      expect(produced).not.toContain('withheld')
    })

    it('the mode file wins', async () => {
      write('.env', 'ODORO_SEEN=common')
      write('.env.production', 'ODORO_SEEN=production')
      write('src/main.js', 'document.title = import.meta.env.ODORO_SEEN')

      await compile()
      expect(readEveryScript(root)).toContain('production')
    })
  })

  describe('plugins', () => {
    it('transforms the source code', async () => {
      write('src/main.js', 'document.title = "before"')

      await compile({
        plugins: [
          {
            name: 'test',
            transform: (code) => code.replace('before', 'after'),
          },
        ],
      })

      expect(readEveryScript(root)).toContain('after')
    })

    it('transforms the document', async () => {
      write('src/main.js', 'document.title = "x"')

      await compile({
        plugins: [
          {
            name: 'test',
            transformIndexHtml: (html) =>
              html.replace('</head>', '<meta name="placed" content="yes"></head>'),
          },
        ],
      })

      expect(read('dist/index.html')).toContain('name="placed"')
    })

    it('places its tags only once on a prerendered page', async () => {
      // The document serves twice: written at the root, and filled per route.
      // Applying the plugins at both steps placed the same tag twice.
      write('src/main.js', 'document.title = "x"')
      write(
        'src/entry-server.js',
        'export const routes = ["/", "/other"]\nexport const render = () => "x"',
      )

      await compile({
        build: { prerender: { entry: 'src/entry-server.js' } },
        plugins: [
          {
            name: 'test',
            transformIndexHtml: (html) =>
              html.replace('</head>', '<meta name="placed" content="yes"></head>'),
          },
        ],
      })

      for (const page of ['dist/index.html', 'dist/other/index.html']) {
        expect(read(page).match(/name="placed"/g)).toHaveLength(1)
      }
    })
  })

  describe('import by pattern', () => {
    it('resolves the pattern at build time', async () => {
      write('src/pages/home.js', 'export const title = "Home"')
      write('src/pages/contact.js', 'export const title = "Contact"')
      write(
        'src/main.js',
        'const p = import.meta.glob("./pages/*.js", { eager: true, import: "title" })\n' +
          'document.title = Object.values(p).join()',
      )

      await compile()

      const produced = readEveryScript(root)
      expect(produced).toContain('Home')
      expect(produced).toContain('Contact')
    })
  })
})

/** The name of the produced entry bundle, read in the rewritten document. */
function bundleName(root: string): string {
  const html = readFileSync(join(root, 'dist', 'index.html'), 'utf8')
  const found = /\/assets\/(main-[A-Z0-9]+\.js)/.exec(html)?.[1]
  if (found === undefined) throw new Error('No entry bundle in the document.')
  return found
}

/** All the produced JavaScript, concatenated — splitting moves the code around. */
function readEveryScript(root: string): string {
  const directory = join(root, 'dist', 'assets')

  return readdirSync(directory)
    .filter((name) => name.endsWith('.js'))
    .map((name) => readFileSync(join(directory, name), 'utf8'))
    .join('\n')
}
