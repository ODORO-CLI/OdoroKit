/**
 * Serveur de developpement.
 *
 * Aucune compilation prealable : le navigateur demande les modules un a un,
 * en modules natifs, et chacun est compile a la demande puis mis en cache.
 * Le temps de demarrage ne depend donc pas de la taille du projet, seulement
 * de la profondeur du premier ecran.
 *
 * @module
 */

import { createReadStream, existsSync, statSync, watch } from 'node:fs'
import { readFile } from 'node:fs/promises'
import {
  type IncomingMessage,
  type ServerResponse,
  createServer,
  request,
} from 'node:http'
import { extname, join, resolve } from 'node:path'

import type { ResolvedConfig } from '../config.js'
import * as log from '../shared/logger.js'
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
  ASSET_EXTENSIONS,
  DEPS_PREFIX,
  INTERNAL_PREFIX,
  STYLE_EXTENSIONS,
  fileToUrl,
  hasExtension,
  transformModule,
  urlToFile,
  wrapAsset,
  wrapStyle,
} from './transform.js'

/** Types MIME servis. */
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
}

/** Extensions compilees comme des modules JavaScript. */
const SCRIPT_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.mjs'] as const

/** Serveur de developpement en cours d'execution. */
export interface DevServer {
  /** Adresse a ouvrir dans un navigateur. */
  readonly url: string
  /** Arrete le serveur et libere les ressources. */
  close(): Promise<void>
}

/** Retire la chaine de requete et le fragment d'une URL. */
function cleanUrl(url: string): string {
  return (url.split('?')[0] ?? url).split('#')[0] ?? url
}

/** Construit les valeurs exposees au client via `import.meta.env`. */
function buildEnv(config: ResolvedConfig): Record<string, string | boolean> {
  const env: Record<string, string | boolean> = {
    MODE: 'development',
    DEV: true,
    PROD: false,
    BASE_URL: config.base,
  }

  for (const [key, value] of Object.entries(process.env)) {
    if (key.startsWith(config.envPrefix) && value !== undefined) env[key] = value
  }

  return env
}

/**
 * Extrait des balises `<script type="module" src="...">` d'un document HTML les
 * points d'entree du projet.
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
 * Injecte le client de rechargement a chaud dans un document HTML.
 *
 * @example
 * injectClient('<html><head></head></html>')
 */
export function injectClient(html: string): string {
  const tag = `<script type="module" src="${HMR_CLIENT_PATH}"></script>`
  if (html.includes('</head>')) return html.replace('</head>', `  ${tag}\n</head>`)
  return `${tag}\n${html}`
}

/**
 * Demarre le serveur de developpement.
 *
 * @param config Configuration resolue du projet.
 *
 * @example
 * const server = await startDevServer(await loadConfig(process.cwd()))
 * console.log(server.url)
 */
export async function startDevServer(config: ResolvedConfig): Promise<DevServer> {
  const started = Date.now()
  const graph = new ModuleGraph()
  const env = buildEnv(config)
  const clients = new Set<ServerResponse>()

  const indexFile = join(config.root, 'index.html')
  if (!existsSync(indexFile)) {
    throw new Error(`[odoro] Aucun "index.html" a la racine du projet (${config.root}).`)
  }

  const entries = extractEntries(await readFile(indexFile, 'utf8'), config.root)
  const specifiers = await scanDependencies(config, entries)
  const deps = await optimizeDeps(config, specifiers)
  if (deps.rebuilt && specifiers.length > 0) {
    log.info(`${specifiers.length} dependances pre-compilees`)
  }

  /** Diffuse un message a tous les navigateurs connectes. */
  const broadcast = (message: HmrMessage): void => {
    const payload = `data: ${JSON.stringify(message)}\n\n`
    for (const client of clients) client.write(payload)
  }

  /** Ecrit une reponse texte. */
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

  /** Sert un module JavaScript compile, en le mettant en cache. */
  const serveScript = async (response: ServerResponse, file: string): Promise<void> => {
    // La meme conversion que celle qui reecrit les imports : un fichier hors
    // racine garde son URL `/@fs/`, sans quoi le client ne saurait pas le
    // recharger et retomberait sur un rechargement de page.
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
      node.code = hotPreamble(url) + code
    }

    send(response, node.code, MIME['.js'] ?? 'text/javascript')
  }

  /** Sert une feuille de style sous forme de module injecteur. */
  const serveStyle = async (
    response: ServerResponse,
    file: string,
    direct: boolean,
  ): Promise<void> => {
    const css = await readFile(file, 'utf8')
    if (direct) {
      send(response, css, MIME['.css'] ?? 'text/css')
      return
    }

    const url = fileToUrl(file, config.root)
    const node = graph.ensure(file, url)
    node.selfAccepting = true
    node.code = hotPreamble(url) + wrapStyle(url, css)
    send(response, node.code, MIME['.js'] ?? 'text/javascript')
  }

  /** Sert un fichier statique. */
  const serveFile = (response: ServerResponse, file: string): void => {
    const type = MIME[extname(file).toLowerCase()] ?? 'application/octet-stream'
    response.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache' })
    createReadStream(file).pipe(response)
  }

  /** Sert le document HTML, client de rechargement injecte. */
  const serveHtml = async (response: ServerResponse): Promise<void> => {
    const html = await readFile(indexFile, 'utf8')
    send(response, injectClient(html), MIME['.html'] ?? 'text/html')
  }

  /** Transmet une requete a une origine distante. */
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
      log.warn(`proxy indisponible : ${target}`)
      send(response, `Proxy indisponible : ${String(cause)}`, 'text/plain', 502)
    })

    incoming.pipe(proxied)
  }

  const server = createServer((incoming, response) => {
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
          const name = specifier.endsWith('.js')
            ? specifier
            : `${specifier.replace(/^@/, '').split('/').join('_')}.js`
          const file = join(deps.directory, name)
          if (existsSync(file)) {
            serveFile(response, file)
            return
          }
          send(
            response,
            `throw new Error(${JSON.stringify(
              `[odoro] Dependance non pre-compilee : "${specifier}". Relancez le serveur.`,
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
          send(response, 'Introuvable', 'text/plain', 404)
          return
        }

        const file = urlToFile(path, config.root)

        if (existsSync(file) && statSync(file).isFile()) {
          if (hasExtension(path, STYLE_EXTENSIONS)) {
            await serveStyle(response, file, url.includes('?direct'))
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
          serveFile(response, file)
          return
        }

        const publicFile = join(config.publicDir, path.replace(/^\//, ''))
        if (existsSync(publicFile) && statSync(publicFile).isFile()) {
          serveFile(response, publicFile)
          return
        }

        // Repli d'application monopage : toute route inconnue rend le document,
        // c'est le routeur client qui decide de la suite.
        if (!extname(path)) {
          await serveHtml(response)
          return
        }

        send(response, 'Introuvable', 'text/plain', 404)
      } catch (cause) {
        const message = cause instanceof Error ? cause.message : String(cause)
        log.error(`echec du traitement de ${path}`, cause)
        broadcast({ type: 'error', message, file: path })
        send(response, `Erreur : ${message}`, 'text/plain', 500)
      }
    })()
  })

  // Un seul observateur recursif suffit ; le filtrage se fait a la reception,
  // ce qui evite d'ouvrir un descripteur par dossier.
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
    // Un enregistrement declenche souvent plusieurs evenements : on attend
    // qu'ils se taisent avant de decider quoi recharger.
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
          if (graph.get(file) !== undefined) reload = true
          continue
        }
        for (const boundary of boundaries) {
          updates.push({ url: boundary.url, timestamp: boundary.timestamp })
        }
      }

      if (reload) {
        log.info('rechargement de la page')
        broadcast({ type: 'full-reload' })
      } else if (updates.length > 0) {
        log.info(
          `mise a jour a chaud : ${updates.map((update) => update.url).join(', ')}`,
        )
        broadcast({ type: 'update', updates })
      }
    }, 40)
  })

  await new Promise<void>((resolveListen, rejectListen) => {
    server.once('error', rejectListen)
    server.listen(config.server.port, config.server.host, resolveListen)
  })

  const url = `http://${config.server.host}:${config.server.port}${config.base}`
  log.success(`pret en ${log.duration(Date.now() - started)}`)
  log.info(`  ${log.colors.cyan(url)}`)

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
