/**
 * Prerendering: the routes become HTML at build time.
 *
 * ## Why this is the missing piece
 *
 * A single-page application ships an empty document and a script. A visitor
 * does not see it — the script runs in a few dozen milliseconds — but a robot
 * does: a search engine that does not run the script, a link preview that reads
 * only the tags of the document, a screen reader that starts before hydration.
 * For them, a marketing site published as a single page is a blank page.
 *
 * ## Why at build time, and not on demand
 *
 * Rendering on every request would require a Node process in production, hence
 * a host that keeps one, hence monitoring, memory, a restart. Rendering at
 * build time produces files: the site stays served by any static server, and
 * prerendering costs nothing after the build.
 *
 * The price is that the routes must be known up front. That is the case of a
 * marketing site, which is what this command serves.
 *
 * @module
 */

import { existsSync } from 'node:fs'
import { mkdir, rm, writeFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'

import { build as esbuild } from 'esbuild'

import type { ResolvedConfig } from '../config.js'
import { applyAlias, isBareSpecifier } from '../dev/transform.js'
import { esbuildPluginsFrom, transformHtmlWith } from '../plugins.js'
import { sourcePlugin } from '../shared/source.js'
import { type AssetOptions, assetsPlugin } from './assets.js'
import * as log from '../shared/logger.js'

/** What a server entry may return. */
export type RouteRender =
  | string
  | {
      /** The HTML placed in the application container. */
      html: string
      /** Tags added to `<head>` — title, description, preview. */
      head?: string
    }

/** What a server entry must export. */
interface ServerEntry {
  /** Renders a route. */
  render?: (url: string) => RouteRender | Promise<RouteRender>
  /** The routes to render, when the configuration gives none. */
  routes?: readonly string[]
}

/**
 * The application container in the document.
 *
 * We look for an **empty** tag: that is the signature of the container of a
 * single-page application, and it avoids writing into a block the document
 * already fills.
 */
const CONTAINER = /(<div\b[^>]*\bid=["']([^"']+)["'][^>]*>)(\s*)(<\/div>)/i

/** A document title. */
const TITLE = /[ \t]*<title\b[^>]*>[\s\S]*?<\/title>\n?/i

/**
 * Places the tags of a route in the head of the document.
 *
 * ## Why the title is a case apart
 *
 * The template document already carries a `<title>` — the one seen in
 * development. Adding the route title without removing the other leaves two,
 * and the browser keeps **the first**: the rendered page would keep the
 * template title, which is precisely what prerendering was meant to fix, and
 * nothing would report it since the page still displays.
 *
 * The route title therefore replaces the document one. The other tags are
 * added: several `<meta>` do not get in each other's way.
 */
function applyHead(page: string, head: string): string {
  if (head === '') return page

  const document = /<title\b/i.test(head) ? page.replace(TITLE, '') : page

  if (!document.includes('</head>')) return `${head}\n${document}`
  return document.replace('</head>', `  ${head}\n  </head>`)
}

/**
 * Builds the server entry and imports it.
 *
 * The intermediate file is written inside the project, like the configuration
 * one, and for the same reason: its dependencies — React, the library — stay
 * external, and Node could not resolve them from a system temporary directory.
 */
async function loadEntry(
  config: ResolvedConfig,
  assets: AssetOptions,
): Promise<{
  module: ServerEntry
  cleanup: () => Promise<void>
}> {
  const settings = config.build.prerender
  if (settings === undefined) throw new Error('[odoro] Prerendering not requested.')

  if (!existsSync(settings.entry)) {
    throw new Error(
      `[odoro] Prerendering requested, but "${settings.entry}" does not exist. ` +
        'This file must export `render(url)`, and may export `routes`.',
    )
  }

  const directory = join(config.root, 'node_modules', '.odoro')
  const output = join(directory, `entry-server.${Date.now().toString(36)}.mjs`)
  await mkdir(directory, { recursive: true })

  const result = await esbuild({
    entryPoints: [settings.entry],
    bundle: true,
    format: 'esm',
    platform: 'node',
    target: 'node20',
    write: false,
    jsx: 'automatic',
    logLevel: 'silent',
    absWorkingDir: config.root,
    // Packages stay external: React must be **the one of the project**,
    // otherwise two copies coexist and the render fails on invalid hooks.
    packages: 'external',
    define: {
      'import.meta.env': JSON.stringify({ ...config.envClient, SSR: true }),
      'process.env.NODE_ENV': JSON.stringify('production'),
      ...config.define,
    },
    plugins: [
      {
        name: 'odoro-server',
        setup(builder) {
          // A stylesheet imported by a component makes no sense outside the
          // browser: it becomes an empty module, rather than a resolution error
          // that would stop the whole prerender.
          builder.onResolve({ filter: /\.css$/ }, () => ({
            path: 'odoro-empty',
            namespace: 'odoro-empty',
          }))
          builder.onLoad({ filter: /.*/, namespace: 'odoro-empty' }, () => ({
            contents: 'export default ""',
            loader: 'js',
          }))

          // An image, on the other hand, keeps **the address the client build
          // gave it**. Emptying it would produce a `src=""` in the prerendered
          // HTML: a broken image until hydration, so exactly in front of the
          // people the prerender is for.
          builder.onResolve(
            { filter: /\.(svg|png|jpe?g|gif|webp|avif|ico|woff2?|mp4|webm)$/ },
            async (args) => {
              if (args.kind === 'entry-point') return null
              const target = await builder.resolve(applyAlias(args.path, config), {
                kind: 'import-statement',
                resolveDir: args.resolveDir,
                importer: args.importer,
              })
              if (target.errors.length > 0) return null
              return { path: target.path, namespace: 'odoro-static-url' }
            },
          )
          builder.onLoad({ filter: /.*/, namespace: 'odoro-static-url' }, (args) => ({
            contents: `export default ${JSON.stringify(
              assets.urls?.get(args.path) ?? '',
            )}`,
            loader: 'js',
          }))

          builder.onResolve({ filter: /.*/ }, (args) => {
            if (args.kind === 'entry-point') return null
            const alias = applyAlias(args.path, config)
            if (alias === args.path || isBareSpecifier(alias)) return null
            return builder.resolve(alias, {
              kind: 'import-statement',
              resolveDir: args.resolveDir,
              importer: args.importer,
            })
          })
        },
      },
      assetsPlugin(config, { ...assets, ssr: true }),
      sourcePlugin({
        root: config.root,
        plugins: config.plugins,
        dev: false,
        ssr: true,
      }),
      ...esbuildPluginsFrom(config.plugins),
    ],
  })

  const code = result.outputFiles[0]?.text
  if (code === undefined) {
    throw new Error(`[odoro] "${settings.entry}" produced no code.`)
  }

  await writeFile(output, code, 'utf8')

  return {
    module: (await import(pathToFileURL(output).href)) as ServerEntry,
    cleanup: () => rm(output, { force: true }),
  }
}

/** The path of the file to write for a route. */
function fileFor(route: string, outDir: string): string {
  const clean = route.split('?')[0]?.split('#')[0] ?? route
  const trimmed = clean.replace(/^\/+/, '').replace(/\/+$/, '')
  // Every route returns an `index.html` in its own directory: that is the only
  // form a static server, an object host and a preview server all serve
  // identically.
  return trimmed === '' ? join(outDir, 'index.html') : join(outDir, trimmed, 'index.html')
}

/** What the prerender produced. */
export interface PrerenderOutput {
  /** The files written, relative to the output directory. */
  readonly pages: readonly string[]
}

/**
 * Renders the configured routes and writes one document per route.
 *
 * @param config Resolved configuration of the project.
 * @param document The document already rewritten towards the hashed files.
 * @param assets The addresses the client build assigned, so that the rendered
 *   HTML points at the same files.
 *
 * @example
 * await prerender(config, html)
 */
export async function prerender(
  config: ResolvedConfig,
  document: string,
  assets: AssetOptions = { outputs: new Set() },
): Promise<PrerenderOutput> {
  const settings = config.build.prerender
  if (settings === undefined) return { pages: [] }

  const { module, cleanup } = await loadEntry(config, assets)

  try {
    const render = module.render
    if (typeof render !== 'function') {
      throw new Error(`[odoro] "${settings.entry}" must export a "render(url)" function.`)
    }

    const routes = settings.routes.length > 0 ? settings.routes : (module.routes ?? ['/'])

    if (!CONTAINER.test(document)) {
      throw new Error(
        '[odoro] No empty container in "index.html": the prerender does not know ' +
          'where to write. Expected a tag such as <div id="root"></div>.',
      )
    }

    const pages: string[] = []

    for (const route of routes) {
      const output = await render(route)
      const html = typeof output === 'string' ? output : output.html
      const head = typeof output === 'string' ? undefined : output.head

      let page = document.replace(
        CONTAINER,
        (_whole, opening: string, _id, _blank, closing: string) =>
          `${opening}${html}${closing}`,
      )

      if (head !== undefined) page = applyHead(page, head)

      page = await transformHtmlWith(config.plugins, page, { dev: false, route })

      const file = fileFor(route, config.outDir)
      await mkdir(dirname(file), { recursive: true })
      await writeFile(file, page, 'utf8')

      pages.push(resolve(file))
    }

    log.info(
      `  ${log.colors.dim('prerendered')} ${String(pages.length)} route${
        pages.length > 1 ? 's' : ''
      } — ${routes.join(', ')}`,
    )

    return { pages }
  } finally {
    await cleanup()
  }
}
