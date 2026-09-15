/**
 * Transformation of the modules served in development.
 *
 * The browser can read neither TypeScript, nor JSX, nor bare import specifiers
 * (`import React from 'react'`). Every requested module is therefore compiled
 * on the fly and its imports are rewritten into URLs the server knows how to
 * resolve.
 *
 * The rewriting is not done with regular expressions — a string containing the
 * word `import` would be enough to defeat it. We lean on the resolver of the
 * bundler itself: every import is resolved then **marked external**, so that
 * nothing is inlined but all the paths come out rewritten, with the same
 * accuracy as a full build.
 *
 * @module
 */

import { relative, resolve } from 'node:path'

import { type Plugin, build } from 'esbuild'

import type { ResolvedConfig } from '../config.js'
import { esbuildPluginsFrom } from '../plugins.js'
import { sourcePlugin } from '../shared/source.js'
import { readSuffix } from '../shared/suffixes.js'

/** Prefix of the URLs serving the prebundled dependencies. */
export const DEPS_PREFIX = '/@deps/'

/** Prefix of the URLs internal to the engine. */
export const INTERNAL_PREFIX = '/@odoro/'

/**
 * Extensions of a module compiled by the server.
 *
 * They serve to recognise the appearance of a source file, which the graph
 * cannot know about since it did not exist yet.
 */
export const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs'] as const

/** Extensions handled as stylesheets. */
export const STYLE_EXTENSIONS = ['.css'] as const

/** Extensions handled as importable static assets. */
export const ASSET_EXTENSIONS = [
  '.svg',
  '.png',
  '.jpg',
  '.jpeg',
  '.gif',
  '.webp',
  '.avif',
  '.ico',
  '.woff',
  '.woff2',
  '.mp4',
  '.webm',
] as const

/**
 * Compiled file name matching a dependency specifier.
 *
 * The name is **flattened**: that is what makes the served URL free of any
 * directory segment. A module served under `/@deps/react-dom/client` would
 * resolve its own `import './chunk-X.js'` to `/@deps/react-dom/chunk-X.js`,
 * whereas the chunk is dropped at the root of the cache.
 *
 * @example
 * depFileName('react-dom/client') // 'react-dom_client.js'
 * depFileName('@scope/package')   // 'scope_package.js'
 */
export function depFileName(specifier: string): string {
  return `${specifier.replace(/^@/, '').split('/').join('_')}.js`
}

/** Tells whether a specifier designates a package rather than a file. */
export function isBareSpecifier(specifier: string): boolean {
  return (
    !specifier.startsWith('.') &&
    !specifier.startsWith('/') &&
    !specifier.startsWith('\\') &&
    !/^[a-zA-Z]:[\\/]/.test(specifier) &&
    !specifier.startsWith('data:') &&
    !specifier.startsWith('http:') &&
    !specifier.startsWith('https:')
  )
}

/** Tells whether a path carries one of the given extensions. */
export function hasExtension(path: string, extensions: readonly string[]): boolean {
  const clean = path.split('?')[0] ?? path
  return extensions.some((extension) => clean.toLowerCase().endsWith(extension))
}

/**
 * Converts an absolute file path into a URL served by the server.
 *
 * A file inside the root becomes a URL relative to it; a file outside — the
 * case of a workspace-linked dependency — goes through the `/@fs/` prefix,
 * which carries its absolute path.
 */
export function fileToUrl(file: string, root: string): string {
  const relativePath = relative(root, file).split('\\').join('/')
  if (!relativePath.startsWith('..')) return `/${relativePath}`
  return `/@fs/${file.split('\\').join('/').replace(/^\//, '')}`
}

/** Converts a URL served by the server into an absolute file path. */
export function urlToFile(url: string, root: string): string {
  const path = (url.split('?')[0] ?? url).split('#')[0] ?? url
  if (path.startsWith('/@fs/')) {
    const absolute = path.slice('/@fs/'.length)
    return /^[a-zA-Z]:/.test(absolute) ? absolute : `/${absolute}`
  }
  return resolve(root, `.${path}`)
}

/** Applies the configuration aliases to a specifier. */
export function applyAlias(specifier: string, config: ResolvedConfig): string {
  for (const [prefix, target] of Object.entries(config.alias)) {
    if (specifier === prefix || specifier.startsWith(`${prefix}/`)) {
      return resolve(
        config.root,
        target,
        specifier.slice(prefix.length).replace(/^\//, ''),
      )
    }
  }
  return specifier
}

/** Result of a module transformation. */
export interface TransformResult {
  /** JavaScript code ready to be served. */
  code: string
  /** Files this module depends on directly, as absolute paths. */
  dependencies: string[]
}

/**
 * Plugin that externalises every import after resolving it, rewriting its path
 * into a URL.
 */
function externalizeImports(config: ResolvedConfig, dependencies: Set<string>): Plugin {
  return {
    name: 'odoro-externalize',
    setup(builder) {
      builder.onResolve({ filter: /.*/ }, async (args) => {
        if (args.kind === 'entry-point') return null

        // Second pass: we let the native resolver do its work.
        if (
          (args.pluginData as { resolving?: boolean } | undefined)?.resolving === true
        ) {
          return null
        }

        if (args.path.startsWith(INTERNAL_PREFIX) || args.path.startsWith(DEPS_PREFIX)) {
          return { path: args.path, external: true }
        }

        // A suffixed import keeps its suffix in the URL: it is what tells the
        // server what to return — a worker, a text, an address — for a file
        // which, without it, would be served as an ordinary module.
        const suffixed = readSuffix(args.path)
        if (suffixed !== undefined) {
          const target = await builder.resolve(applyAlias(suffixed.path, config), {
            kind: 'import-statement',
            resolveDir: args.resolveDir,
            importer: args.importer,
            pluginData: { resolving: true },
          })
          if (target.errors.length === 0) {
            dependencies.add(target.path)
            return {
              path: `${fileToUrl(target.path, config.root)}?${suffixed.suffix}`,
              external: true,
            }
          }
        }

        const aliased = applyAlias(args.path, config)

        // A stylesheet or an asset imported from a package
        // (`@odoro-cli/libs/styles.css`) must be served as a file, not looked up
        // in the dependency cache, which holds only JavaScript.
        const isFileLike =
          hasExtension(aliased, STYLE_EXTENSIONS) ||
          hasExtension(aliased, ASSET_EXTENSIONS)

        if (isBareSpecifier(aliased) && !isFileLike) {
          return { path: `${DEPS_PREFIX}${depFileName(aliased)}`, external: true }
        }

        const resolved = await builder.resolve(aliased, {
          kind: 'import-statement',
          resolveDir: args.resolveDir,
          importer: args.importer,
          pluginData: { resolving: true },
        })

        if (resolved.errors.length > 0) {
          // An unresolvable import must not bring down the whole page: the
          // browser will report the failure on that single module.
          return { path: args.path, external: true }
        }

        dependencies.add(resolved.path)
        const url = fileToUrl(resolved.path, config.root)
        return {
          path: hasExtension(url, ASSET_EXTENSIONS) ? `${url}?import` : url,
          external: true,
        }
      })
    },
  }
}

/**
 * Compiles a module and rewrites its imports.
 *
 * @param file Absolute path of the source file.
 * @param config Resolved configuration of the project.
 * @param env Values exposed to the client through `import.meta.env`.
 *
 * @example
 * const { code } = await transformModule('/project/src/main.tsx', config, env)
 */
export async function transformModule(
  file: string,
  config: ResolvedConfig,
  env: Record<string, string | boolean>,
): Promise<TransformResult> {
  const dependencies = new Set<string>()

  // A file reached by a pattern is a dependency of the module like any other:
  // without that, adding a post to the directory of a blog would trigger
  // nothing, and it would only show up on a server restart.
  const onMatch = (matched: string): void => {
    dependencies.add(matched)
  }

  const result = await build({
    entryPoints: [file],
    bundle: true,
    write: false,
    format: 'esm',
    platform: 'browser',
    target: 'es2022',
    sourcemap: 'inline',
    jsx: 'automatic',
    jsxDev: true,
    logLevel: 'silent',
    absWorkingDir: config.root,
    define: {
      'import.meta.env': JSON.stringify(env),
      'process.env.NODE_ENV': JSON.stringify('development'),
      ...config.define,
    },
    plugins: [
      externalizeImports(config, dependencies),
      sourcePlugin({
        root: config.root,
        plugins: config.plugins,
        dev: true,
        onMatch,
      }),
      ...esbuildPluginsFrom(config.plugins),
    ],
  })

  const code = result.outputFiles[0]?.text
  if (code === undefined) {
    throw new Error(`[odoro] The build of "${file}" produced no code.`)
  }

  return { code, dependencies: [...dependencies] }
}

/**
 * Wraps a stylesheet in a JavaScript module that injects it, and replaces it
 * hot on an update.
 *
 * A stylesheet replaced without a reload is the most immediate gain of hot
 * development: the state of the application is entirely preserved.
 *
 * @example
 * const module = wrapStyle('/src/App.css', 'body { margin: 0 }')
 */
/** An identifier that can be exported by its name. */
const IDENTIFIER = /^[A-Za-z_$][A-Za-z0-9_$]*$/

/**
 * The words the language reserves: they cannot name an export.
 *
 * The list is complete, strict mode included — a module always is one. It is
 * complete because an omission does not show on reading: a `package.json`
 * carries a `private` key, and `export const private` is a syntax error that
 * breaks the whole module, hence the page.
 */
const RESERVED = new Set([
  'arguments',
  'await',
  'break',
  'case',
  'catch',
  'class',
  'const',
  'continue',
  'debugger',
  'default',
  'delete',
  'do',
  'else',
  'enum',
  'eval',
  'export',
  'extends',
  'false',
  'finally',
  'for',
  'function',
  'if',
  'implements',
  'import',
  'in',
  'instanceof',
  'interface',
  'let',
  'new',
  'null',
  'package',
  'private',
  'protected',
  'public',
  'return',
  'static',
  'super',
  'switch',
  'this',
  'throw',
  'true',
  'try',
  'typeof',
  'var',
  'void',
  'while',
  'with',
  'yield',
])

/**
 * Returns a JSON file as a module.
 *
 * ## Why it has to be wrapped
 *
 * `import { dependencies } from './package.json'` is a common form, which the
 * build resolves: esbuild inlines the JSON and derives named exports from it.
 *
 * The development server, for its part, served the file as it was. A module
 * cannot load JSON without an import attribute, and the browser fails on
 *
 *     Failed to load module script: Expected a JavaScript-or-Wasm module script
 *     but the server responded with a MIME type of "application/json".
 *
 * The page stays blank, and the message does not say which import is at fault.
 *
 * ## The named exports, and why not all of them are there
 *
 * A key that is not an identifier — `lint:fix`, `@odoro-cli/libs` — cannot name
 * an export. It stays reachable through the default export, which carries the
 * whole object: that is exactly what the build does.
 *
 * @example
 * wrapJson('{"a":1,"b-c":2}')
 * // export default {"a":1,"b-c":2}
 * // export const a = 1
 */
export function wrapJson(json: string): string {
  let value: unknown
  try {
    value = JSON.parse(json)
  } catch {
    // Unreadable JSON stays a project error: we let it reach the browser in a
    // shape it knows how to display, rather than serve a module that would fail
    // further on, with no apparent connection.
    return 'throw new SyntaxError("unreadable JSON")'
  }

  const lines = ['export default ' + json.trim()]

  if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
    for (const [key, content] of Object.entries(value)) {
      if (!IDENTIFIER.test(key) || RESERVED.has(key)) continue
      lines.push('export const ' + key + ' = ' + JSON.stringify(content))
    }
  }

  return lines.join('\n')
}

/**
 * What the browser announces when it is going to make the resource something
 * other than a page.
 *
 * A navigation carries `document`. Everything else below is a resource the
 * document asks for, and to which returning HTML makes no sense.
 */
const ASSET_DESTINATIONS = new Set([
  'script',
  'style',
  'image',
  'font',
  'audio',
  'video',
  'track',
  'manifest',
  'worker',
  'sharedworker',
  'serviceworker',
])

/**
 * Does the request target an asset, and not a page?
 *
 * ## Why the question arises
 *
 * The single-page application fallback returns the document for any unknown
 * route: that is what lets the client router decide what comes next. It did so
 * as soon as the path had no extension — which is the case of a route, but also
 * of a module imported through a path that carries none.
 *
 * A `<script type="module">` that receives HTML fails on:
 *
 *     Failed to load module script: Expected a JavaScript module script but
 *     the server responded with a MIME type of "text/html".
 *
 * The message names neither the file nor the reason. A 404 names both.
 *
 * ## What tells them apart
 *
 * The browser says so: `Sec-Fetch-Dest` is `document` for a navigation and
 * `script`, `style`, `image`… for an asset. When absent — a `curl`, an old
 * client — we do not decide: the fallback stays, since that is the behaviour a
 * hand-typed address expects.
 *
 * @example
 * isAssetRequest({ 'sec-fetch-dest': 'script' })   // true
 * isAssetRequest({ 'sec-fetch-dest': 'document' }) // false
 * isAssetRequest({})                               // false
 */
export function isAssetRequest(
  headers: Readonly<Record<string, string | string[] | undefined>>,
): boolean {
  const destination = headers['sec-fetch-dest']
  return typeof destination === 'string' && ASSET_DESTINATIONS.has(destination)
}

/**
 * Does the request ask for the stylesheet for itself?
 *
 * ## Two uses, a single address
 *
 * `import './a.css'` expects a **module** that injects the stylesheet: that is
 * what allows replacing it hot without reloading the page.
 *
 * `<link rel="stylesheet" href="./a.css">` expects the **stylesheet**. Serving
 * the module in its place gives it JavaScript where it expects CSS, and the
 * browser refuses with a "strict MIME checking" that does not name the cause.
 * That was the fate of every stylesheet linked by a tag, the library ones
 * included.
 *
 * ## What tells them apart
 *
 * The browser says so: `Sec-Fetch-Dest` is `style` for a tag and `script` for
 * an import. The header is sent by every browser that applies this check —
 * therefore by all of those the question concerns.
 *
 * `?direct` is still accepted: it is the hand-written convention, and pages
 * already use it.
 *
 * @example
 * wantsStylesheet({ 'sec-fetch-dest': 'style' }, '/a.css')  // true
 * wantsStylesheet({ 'sec-fetch-dest': 'script' }, '/a.css') // false
 * wantsStylesheet({}, '/a.css?direct')                      // true
 */
export function wantsStylesheet(
  headers: Readonly<Record<string, string | string[] | undefined>>,
  url: string,
): boolean {
  if (url.includes('?direct')) return true
  if (headers['sec-fetch-dest'] === 'style') return true

  // Fallback for clients without `Sec-Fetch-Dest` — a `curl`, an old browser:
  // we read what they accept.
  const accepted = headers['accept']
  return typeof accepted === 'string' && accepted.includes('text/css')
}

export function wrapStyle(url: string, css: string): string {
  return `const id = ${JSON.stringify(`odoro-style:${url}`)}
const css = ${JSON.stringify(css)}

let element = document.querySelector(\`style[data-odoro-id="\${id}"]\`)
if (element === null) {
  element = document.createElement('style')
  element.setAttribute('data-odoro-id', id)
  document.head.appendChild(element)
}
element.textContent = css

import.meta.hot?.accept()
import.meta.hot?.dispose(() => {
  // The next stylesheet will recreate the element: removing it avoids stacking
  // dead rules on every reload.
  element?.remove()
})
`
}

/**
 * Produces the JavaScript module representing an imported static asset.
 *
 * @example
 * wrapAsset('/src/logo.svg') // 'export default "/src/logo.svg"'
 */
export function wrapAsset(url: string): string {
  return `export default ${JSON.stringify(url)}\n`
}
