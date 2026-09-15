/**
 * Development server.
 *
 * No prior build: the browser asks for the modules one by one, as native
 * modules, and each is compiled on demand then cached. The start time therefore
 * does not depend on the size of the project, only on the depth of the first
 * screen.
 *
 * @module
 */

import { createReadStream, existsSync, readFileSync, statSync, watch } from 'node:fs'
import { readFile } from 'node:fs/promises'
import {
  type IncomingMessage,
  type Server,
  type ServerResponse,
  createServer,
  request,
} from 'node:http'
import { createServer as createSecureServer } from 'node:https'
import { extname, join, resolve } from 'node:path'

import { cssProviderFor } from '../build/css-provider.js'
import type { ResolvedConfig } from '../config.js'
import { type Middleware, transformHtmlWith } from '../plugins.js'
import { listen } from '../shared/listen.js'
import * as log from '../shared/logger.js'
import { openBrowser } from '../shared/open-browser.js'
import { urlModule, textModule, workerModule } from '../shared/suffixes.js'
import { assembleStylesheet } from './stylesheet.js'
import {
  HMR_CLIENT_PATH,
  HMR_CLIENT_SOURCE,
  HMR_STREAM_PATH,
  type HmrMessage,
  hotPreamble,
} from './client.js'
import { optimizeDeps, scanDependencies } from './deps.js'
import { ModuleGraph, detectSelfAccepting } from './graph.js'
import {
  REFRESH_HTML_TAG,
  REFRESH_RUNTIME_PATH,
  applyReactRefresh,
  bundleRefreshRuntime,
  hasRegisteredComponent,
  isRefreshCandidate,
  refreshEpilogue,
  refreshPreamble,
} from './refresh.js'
import {
  ASSET_EXTENSIONS,
  DEPS_PREFIX,
  INTERNAL_PREFIX,
  SOURCE_EXTENSIONS,
  STYLE_EXTENSIONS,
  depFileName,
  fileToUrl,
  hasExtension,
  transformModule,
  urlToFile,
  wrapAsset,
  isAssetRequest,
  wantsStylesheet,
  wrapJson,
  wrapStyle,
} from './transform.js'

/**
 * The utilities stylesheet of development.
 *
 * ## Why the server produces it
 *
 * The style package ships only the base — variables, reset, keyframes. The
 * utilities are produced at build time, for the classes in use alone: that is
 * what takes the stylesheet from 1.7 MB down to under 180 kB in the published
 * site.
 *
 * In development there is no build, so there was no utility at all: the
 * application opened with its variables alone, without layout or colours. The
 * server therefore produces the whole stylesheet, once at start. Nothing is
 * pruned from it, and that is deliberate: a class added during the session must
 * paint without a restart, and the weight does not matter on a local machine.
 */
const UTILITIES_PATH = `${INTERNAL_PREFIX}utilities.css`

/** MIME types served. */
const MIME: Readonly<Record<string, string>> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.txt': 'text/plain; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.markdown': 'text/markdown; charset=utf-8',
}

/** Extensions compiled as JavaScript modules. */
const SCRIPT_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs'] as const

/** Running development server. */
export interface DevServer {
  /** Address to open in a browser. */
  readonly url: string
  /** Stops the server and releases the resources. */
  close(): Promise<void>
}

/** Removes the query string and the fragment of a URL. */
function cleanUrl(url: string): string {
  return (url.split('?')[0] ?? url).split('#')[0] ?? url
}

/** Reads the suffix a URL carries, when it carries one. */
function suffixOf(url: string): 'worker' | 'raw' | 'url' | undefined {
  const query = url.split('?')[1]
  if (query === undefined) return undefined
  for (const name of ['worker', 'raw', 'url'] as const) {
    if (query.split('&').includes(name)) return name
  }
  return undefined
}

/**
 * Chains the plugin middlewares, then the handling by the engine.
 *
 * The plugins come first: that is what lets them serve a route the engine does
 * not know about — a stubbed API, a documentation render — without having to
 * slip into its routing.
 */
function chain(
  middlewares: readonly Middleware[],
  request_: IncomingMessage,
  response: ServerResponse,
  done: () => void,
): void {
  let index = 0

  const next = (): void => {
    const middleware = middlewares[index]
    index += 1
    if (middleware === undefined) {
      done()
      return
    }
    void (async () => middleware(request_, response, next))()
  }

  next()
}

/**
 * Extracts the entry points of the project from the
 * `<script type="module" src="...">` tags of an HTML document.
 */
export function extractEntries(html: string, root: string): string[] {
  const entries: string[] = []
  for (const match of html.matchAll(
    /<script[^>]*type=["']module["'][^>]*src=["']([^"']+)["']/gi,
  )) {
    const source = match[1]
    if (source === undefined || /^https?:/.test(source)) continue
    entries.push(resolve(root, source.replace(/^\//, '')))
  }
  return entries
}

/**
 * Injects the hot reloading client into an HTML document.
 *
 * @example
 * injectClient('<html><head></head></html>')
 */
export function injectClient(html: string, utilities = false): string {
  // The order matters: the refresh hook must be installed before React is
  // loaded, therefore before any module of the application.
  const tags = [
    // The stylesheet comes before everything else: the base and the application
    // styles, imported afterwards, must be able to override it.
    ...(utilities ? [`<link rel="stylesheet" href="${UTILITIES_PATH}">`] : []),
    REFRESH_HTML_TAG,
    `<script type="module" src="${HMR_CLIENT_PATH}"></script>`,
  ].join('\n    ')

  if (html.includes('</head>')) return html.replace('</head>', `  ${tags}\n</head>`)
  return `${tags}\n${html}`
}

/**
 * Starts the development server.
 *
 * @param config Resolved configuration of the project.
 *
 * @example
 * const server = await startDevServer(await loadConfig(process.cwd()))
 * console.log(server.url)
 */
export async function startDevServer(config: ResolvedConfig): Promise<DevServer> {
  const started = Date.now()
  const graph = new ModuleGraph()
  const env = config.envClient
  const clients = new Set<ServerResponse>()

  const middlewares: Middleware[] = []
  for (const plugin of config.plugins) {
    await plugin.configureServer?.({
      use: (middleware) => middlewares.push(middleware),
    })
  }

  const indexFile = join(config.root, 'index.html')
  if (!existsSync(indexFile)) {
    throw new Error(`[odoro] No "index.html" at the project root (${config.root}).`)
  }

  const refreshRuntime = await bundleRefreshRuntime()

  // The development utilities (see UTILITIES_PATH). Produced once: the
  // generation costs a second, and nothing in the session changes it. A project
  // that does not use this styling system has no provider: we then serve
  // nothing, and inject no tag.
  const provider = await cssProviderFor(config.root)
  const utilities =
    provider?.knownClasses === undefined
      ? undefined
      : provider.renderUtilitiesFor(provider.knownClasses())
  if (utilities !== undefined) {
    log.info(`development utilities: ${String(Math.round(utilities.length / 1024))} kB`)
  }

  const exposed = Object.keys(config.envClient).filter((key) =>
    key.startsWith(config.envPrefix),
  )
  if (exposed.length > 0) {
    log.info(
      `${String(exposed.length)} variable${exposed.length > 1 ? 's' : ''} exposed to ` +
        `the client: ${exposed.join(', ')}`,
    )
  }

  const entries = extractEntries(await readFile(indexFile, 'utf8'), config.root)
  const specifiers = await scanDependencies(config, entries)
  const deps = await optimizeDeps(config, specifiers)
  if (deps.rebuilt && specifiers.length > 0) {
    log.info(`${specifiers.length} dependencies prebundled`)
  }

  /** Broadcasts a message to every connected browser. */
  const broadcast = (message: HmrMessage): void => {
    const payload = `data: ${JSON.stringify(message)}\n\n`
    for (const client of clients) client.write(payload)
  }

  /** Writes a text response. */
  const send = (
    response: ServerResponse,
    body: string | Buffer,
    type: string,
    status = 200,
  ): void => {
    response.writeHead(status, {
      'Content-Type': type,
      'Cache-Control': 'no-cache',
    })
    response.end(body)
  }

  /** Serves a compiled JavaScript module, caching it. */
  const serveScript = async (response: ServerResponse, file: string): Promise<void> => {
    // The same conversion as the one that rewrites the imports: a file outside
    // the root keeps its `/@fs/` URL, otherwise the client would not know how to
    // reload it and would fall back on a page reload.
    const url = fileToUrl(file, config.root)
    const node = graph.ensure(file, url)

    if (node.code === undefined) {
      const source = await readFile(file, 'utf8')
      node.selfAccepting = detectSelfAccepting(source)

      const { code, dependencies } = await transformModule(file, config, env)
      graph.setDependencies(file, dependencies)
      for (const dependency of dependencies) {
        graph.ensure(dependency, fileToUrl(dependency, config.root)).importers.add(file)
      }

      let body = code
      if (isRefreshCandidate(file)) {
        const instrumented = await applyReactRefresh(code, file)
        if (hasRegisteredComponent(instrumented)) {
          // The module declares at least one component: it becomes a reload
          // boundary, and its state will be preserved while editing.
          body = refreshPreamble(url) + instrumented + refreshEpilogue(url)
          node.selfAccepting = true
        }
      }

      node.code = hotPreamble(url) + body
    }

    send(response, node.code, MIME['.js'] ?? 'text/javascript')
  }

  /** Serves a stylesheet as an injecting module. */
  const serveStyle = async (
    response: ServerResponse,
    file: string,
    direct: boolean,
  ): Promise<void> => {
    const { css, files } = await assembleStylesheet(file, config.root)

    if (direct) {
      send(response, css, MIME['.css'] ?? 'text/css')
      return
    }

    const url = fileToUrl(file, config.root)
    const node = graph.ensure(file, url)
    node.selfAccepting = true
    node.code = hotPreamble(url) + wrapStyle(url, css)

    // The inlined stylesheets count as dependencies: without that, modifying a
    // base stylesheet imported by ten others would repaint nothing, since no
    // module would name it.
    const imported = files.filter((one) => one !== file)
    if (imported.length > 0) {
      graph.setDependencies(file, imported)
      for (const one of imported) {
        const dependency = graph.ensure(one, fileToUrl(one, config.root))
        dependency.importers.add(file)
        dependency.selfAccepting = false
      }
    }

    send(response, node.code, MIME['.js'] ?? 'text/javascript')
  }

  /** Serves a suffixed import: a worker, a text, an address. */
  const serveSuffixed = async (
    response: ServerResponse,
    file: string,
    path: string,
    suffix: 'worker' | 'raw' | 'url',
  ): Promise<void> => {
    if (suffix === 'raw') {
      send(
        response,
        textModule(await readFile(file, 'utf8')),
        MIME['.js'] ?? 'text/javascript',
      )
      return
    }
    if (suffix === 'url') {
      send(response, urlModule(path), MIME['.js'] ?? 'text/javascript')
      return
    }
    // The worker loads the module through the ordinary server address: the
    // server compiles it like any other, and the worker resolves its own
    // imports as it reads — that is what `type: 'module'` allows.
    send(response, workerModule(path), MIME['.js'] ?? 'text/javascript')
  }

  /**
   * The index file of a directory, when it has one.
   *
   * @param directory Candidate path, which may be neither a directory nor exist.
   * @returns The path of the index, or `undefined`.
   */
  const directoryIndex = (directory: string): string | undefined => {
    if (!existsSync(directory) || !statSync(directory).isDirectory()) return undefined
    for (const name of ['index.html', 'index.md']) {
      const candidate = join(directory, name)
      if (existsSync(candidate) && statSync(candidate).isFile()) return candidate
    }
    return undefined
  }

  /** Serves a static file. */
  const serveFile = (response: ServerResponse, file: string): void => {
    const type = MIME[extname(file).toLowerCase()] ?? 'application/octet-stream'
    response.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache' })
    createReadStream(file).pipe(response)
  }

  /** Serves the HTML document, with the reload client injected. */
  const serveHtml = async (response: ServerResponse, route = '/'): Promise<void> => {
    const html = await readFile(indexFile, 'utf8')
    const rendered = await transformHtmlWith(
      config.plugins,
      injectClient(html, utilities !== undefined),
      { dev: true, route },
    )
    send(response, rendered, MIME['.html'] ?? 'text/html')
  }

  /** Forwards a request to a remote origin. */
  const forward = (
    incoming: IncomingMessage,
    response: ServerResponse,
    target: string,
  ): void => {
    const url = new URL(incoming.url ?? '/', target)
    const proxied = request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        path: `${url.pathname}${url.search}`,
        method: incoming.method,
        headers: { ...incoming.headers, host: url.host },
      },
      (upstream) => {
        response.writeHead(upstream.statusCode ?? 502, upstream.headers)
        upstream.pipe(response)
      },
    )

    proxied.on('error', (cause) => {
      log.warn(`proxy unavailable: ${target}`)
      send(response, `Proxy unavailable: ${String(cause)}`, 'text/plain', 502)
    })

    incoming.pipe(proxied)
  }

  const handle = (incoming: IncomingMessage, response: ServerResponse): void => {
    void (async () => {
      const url = incoming.url ?? '/'
      const path = cleanUrl(url)

      try {
        for (const [prefix, target] of Object.entries(config.server.proxy)) {
          if (path.startsWith(prefix)) {
            forward(incoming, response, target)
            return
          }
        }

        if (path === REFRESH_RUNTIME_PATH) {
          send(response, refreshRuntime, MIME['.js'] ?? 'text/javascript')
          return
        }

        if (path === UTILITIES_PATH) {
          if (utilities === undefined) {
            send(response, 'Not found', 'text/plain', 404)
            return
          }
          send(response, utilities, MIME['.css'] ?? 'text/css')
          return
        }

        if (path === HMR_CLIENT_PATH) {
          send(response, HMR_CLIENT_SOURCE, MIME['.js'] ?? 'text/javascript')
          return
        }

        if (path === HMR_STREAM_PATH) {
          response.writeHead(200, {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            Connection: 'keep-alive',
          })
          response.write(`data: ${JSON.stringify({ type: 'connected' })}\n\n`)
          clients.add(response)
          incoming.on('close', () => clients.delete(response))
          return
        }

        if (path.startsWith(DEPS_PREFIX)) {
          const specifier = path.slice(DEPS_PREFIX.length)
          // The served names are flat and the shared chunks live at the root of
          // the cache: keeping only the last segment is enough, and forbids at
          // the same stroke any climb out of the directory.
          const last = specifier.split('/').pop() ?? specifier
          const name = last.endsWith('.js') ? last : depFileName(last)
          const file = join(deps.directory, name)
          if (existsSync(file)) {
            serveFile(response, file)
            return
          }
          send(
            response,
            `throw new Error(${JSON.stringify(
              `[odoro] Dependency not prebundled: "${specifier}". Restart the server.`,
            )})`,
            MIME['.js'] ?? 'text/javascript',
          )
          return
        }

        if (path === '/' || path === '/index.html') {
          await serveHtml(response)
          return
        }

        if (path.startsWith(INTERNAL_PREFIX)) {
          send(response, 'Not found', 'text/plain', 404)
          return
        }

        const file = urlToFile(path, config.root)

        if (existsSync(file) && statSync(file).isFile()) {
          // The suffixes come before the extension: a `.ts?worker` is a worker,
          // not one more module, and a `.css?raw` is a text.
          const suffix = suffixOf(url)
          if (suffix !== undefined) {
            await serveSuffixed(response, file, path, suffix)
            return
          }
          if (hasExtension(path, STYLE_EXTENSIONS)) {
            await serveStyle(response, file, wantsStylesheet(incoming.headers, url))
            return
          }
          if (hasExtension(path, ASSET_EXTENSIONS)) {
            if (url.includes('?import')) {
              send(response, wrapAsset(path), MIME['.js'] ?? 'text/javascript')
            } else {
              serveFile(response, file)
            }
            return
          }
          if (hasExtension(path, SCRIPT_EXTENSIONS)) {
            await serveScript(response, file)
            return
          }
          // A JSON imported by a module must arrive **as a module**: serving it
          // as it is gives `application/json` where the browser expects
          // JavaScript, and it refuses. An ordinary request — a `fetch`, a
          // typed address — receives the file.
          if (hasExtension(path, ['.json'])) {
            if (isAssetRequest(incoming.headers) || url.includes('?import')) {
              const json = await readFile(file, 'utf8')
              send(response, wrapJson(json), MIME['.js'] ?? 'text/javascript')
            } else {
              serveFile(response, file)
            }
            return
          }
          serveFile(response, file)
          return
        }

        const publicFile = join(config.publicDir, path.replace(/^\//, ''))
        if (existsSync(publicFile) && statSync(publicFile).isFile()) {
          serveFile(response, publicFile)
          return
        }

        // A public directory returns its index.
        //
        // Without that, `/directory` fell on the single-page fallback: a tree of
        // documents dropped in `public/` was reachable only file by file, and
        // the address of the directory returned the HTML document of the
        // application. `index.md` is accepted just like `index.html`, because a
        // documentation tree has no reason to be HTML.
        const index = directoryIndex(publicFile)
        if (index !== undefined) {
          serveFile(response, index)
          return
        }

        // Single-page application fallback: any unknown route returns the
        // document, and the client router decides what comes next.
        //
        // Unless the browser announces an asset: a module, a stylesheet, an
        // image. Returning the document to them produces a "strict MIME" that
        // names neither the file nor the cause, where a 404 names both.
        if (!extname(path) && !isAssetRequest(incoming.headers)) {
          await serveHtml(response, path)
          return
        }

        send(response, 'Not found', 'text/plain', 404)
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : String(cause)
        log.error(`failed to handle ${path}`, cause)
        broadcast({ type: 'error', message, file: path })
        send(response, `Error: ${message}`, 'text/plain', 500)
      }
    })()
  }

  const listener = (incoming: IncomingMessage, response: ServerResponse): void => {
    if (middlewares.length === 0) {
      handle(incoming, response)
      return
    }
    chain(middlewares, incoming, response, () => {
      handle(incoming, response)
    })
  }

  const server: Server =
    config.server.https === undefined
      ? createServer(listener)
      : createSecureServer(
          {
            cert: readFileSync(resolve(config.root, config.server.https.cert)),
            key: readFileSync(resolve(config.root, config.server.https.key)),
          },
          listener,
        )

  // A single recursive watcher is enough; the filtering happens on reception,
  // which avoids opening one descriptor per directory.
  let pending: ReturnType<typeof setTimeout> | undefined
  const changed = new Set<string>()

  const watcher = watch(config.root, { recursive: true }, (_event, filename) => {
    if (filename === null) return
    const normalized = filename.split('\\').join('/')
    if (
      normalized.includes('node_modules/') ||
      normalized.startsWith('.git/') ||
      normalized.startsWith('dist/')
    ) {
      return
    }

    changed.add(join(config.root, filename))
    clearTimeout(pending)
    // A save often triggers several events: we wait for them to go quiet before
    // deciding what to reload.
    pending = setTimeout(() => {
      const files = [...changed]
      changed.clear()

      const updates: { url: string; timestamp: number }[] = []
      let reload = false

      for (const file of files) {
        if (file === indexFile) {
          reload = true
          continue
        }
        const boundaries = graph.invalidate(file)
        if (boundaries.length === 0) {
          if (graph.get(file) !== undefined) {
            reload = true
          } else if (SOURCE_EXTENSIONS.some((ext) => file.endsWith(ext))) {
            // A source file the graph does not know about has just appeared. A
            // module compiled before it may have failed to resolve it and kept
            // that failure in cache: the whole graph is therefore forgotten,
            // for lack of knowing who was waiting for this file. It is rare, and
            // the cost is an on-demand rebuild.
            graph.clear()
            reload = true
          }
          continue
        }
        for (const boundary of boundaries) {
          updates.push({ url: boundary.url, timestamp: boundary.timestamp })
        }
      }

      if (reload) {
        log.info('page reload')
        broadcast({ type: 'full-reload' })
      } else if (updates.length > 0) {
        log.info(`hot update: ${updates.map((update) => update.url).join(', ')}`)
        broadcast({ type: 'update', updates })
      }
    }, 40)
  })

  // `strictPort` brings it down to a single attempt: the port is then part of
  // the contract — a proxy targets it, an API key authorises it — and sliding
  // elsewhere would produce a server that runs and that nobody reaches.
  const { port, requested } = await listen(
    server,
    config.server.port,
    config.server.host,
    config.server.strictPort ? 1 : undefined,
  )

  // Say it, and do not keep quiet about it: a server opened somewhere other
  // than where it is expected makes you reload a page that will not move.
  if (requested !== undefined) {
    log.warn(`port ${String(requested)} in use — server listening on ${String(port)}`)
  }

  const protocol = config.server.https === undefined ? 'http' : 'https'
  const url = `${protocol}://${config.server.host}:${String(port)}${config.base}`
  log.success(`ready in ${log.duration(Date.now() - started)}`)
  log.info(`  ${log.colors.cyan(url)}`)

  if (config.server.open) openBrowser(url)

  return {
    url,
    async close() {
      watcher.close()
      clearTimeout(pending)
      for (const client of clients) client.end()
      clients.clear()
      graph.clear()
      await new Promise<void>((done) => server.close(() => done()))
    },
  }
}
