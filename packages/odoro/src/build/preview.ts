/**
 * Serveur de previsualisation du build de production.
 *
 * Il ne compile rien : il sert le dossier de sortie tel quel, avec le meme
 * repli d'application monopage qu'un hebergeur statique. C'est le dernier
 * filet avant un deploiement.
 *
 * @module
 */

import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'

import type { ResolvedConfig } from '../config.js'
import * as log from '../shared/logger.js'

/** Types MIME servis. */
const MIME: Readonly<Record<string, string>> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.map': 'application/json; charset=utf-8',
}

/** Serveur de previsualisation en cours d'execution. */
export interface PreviewServer {
  /** Adresse a ouvrir dans un navigateur. */
  readonly url: string
  /** Arrete le serveur. */
  close(): Promise<void>
}

/**
 * Demarre le serveur de previsualisation.
 *
 * @param config Configuration resolue du projet.
 * @param port Port d'ecoute. Par defaut, celui du serveur de developpement
 *   augmente de un, pour pouvoir faire tourner les deux.
 *
 * @example
 * const preview = await startPreviewServer(config)
 */
export async function startPreviewServer(
  config: ResolvedConfig,
  port = config.server.port + 1,
): Promise<PreviewServer> {
  if (!existsSync(config.outDir)) {
    throw new Error(`[odoro] Rien a previsualiser : lancez "odoro build" d'abord.`)
  }

  const server = createServer((incoming, response) => {
    const path = (incoming.url ?? '/').split('?')[0] ?? '/'
    // `normalize` resout les remontees `..` : le serveur ne doit jamais sortir
    // du dossier de sortie. Le decoupage qui suit retire les separateurs de
    // tete, quel que soit le systeme de fichiers.
    const relativePath = normalize(decodeURIComponent(path))
      .split(/[\\/]/)
      .filter(Boolean)
      .join('/')
    const candidate = join(config.outDir, relativePath)

    const file =
      existsSync(candidate) && statSync(candidate).isFile()
        ? candidate
        : join(config.outDir, 'index.html')

    if (!file.startsWith(config.outDir)) {
      response.writeHead(403, { 'Content-Type': 'text/plain' })
      response.end('Interdit')
      return
    }

    const type = MIME[extname(file).toLowerCase()] ?? 'application/octet-stream'
    const immutable = relativePath.startsWith('assets/')
    response.writeHead(200, {
      'Content-Type': type,
      'Cache-Control': immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
    })
    createReadStream(file).pipe(response)
  })

  await new Promise<void>((done, fail) => {
    server.once('error', fail)
    server.listen(port, config.server.host, done)
  })

  const url = `http://${config.server.host}:${port}${config.base}`
  log.success('previsualisation du build de production')
  log.info(`  ${log.colors.cyan(url)}`)

  return {
    url,
    close: () => new Promise<void>((done) => server.close(() => done())),
  }
}
