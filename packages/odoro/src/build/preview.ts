/**
 * Preview server for the production build.
 *
 * It builds nothing: it serves the output directory as it is, with the same
 * single-page application fallback a static host uses. This is the last safety
 * net before a deployment.
 *
 * @module
 */

import { existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { extname, join, normalize } from 'node:path'

import type { ResolvedConfig } from '../config.js'
import { isAssetRequest } from '../dev/transform.js'
import { listen } from '../shared/listen.js'
import { sendFile } from '../shared/static-file.js'
import * as log from '../shared/logger.js'
import { openBrowser } from '../shared/open-browser.js'

/** Running preview server. */
export interface PreviewServer {
  /** Address to open in a browser. */
  readonly url: string
  /** Stops the server. */
  close(): Promise<void>
}

/**
 * Starts the preview server.
 *
 * @param config Resolved configuration of the project.
 * @param port Port to listen on. By default, the development server port plus
 *   one, so that both can run.
 *
 * @example
 * const preview = await startPreviewServer(config)
 */
export async function startPreviewServer(
  config: ResolvedConfig,
  port = config.server.port + 1,
): Promise<PreviewServer> {
  if (!existsSync(config.outDir)) {
    throw new Error(`[odoro] Nothing to preview: run "odoro build" first.`)
  }

  const server = createServer((incoming, response) => {
    const path = (incoming.url ?? '/').split('?')[0] ?? '/'
    // `normalize` resolves the `..` climbs: the server must never leave the
    // output directory. The split that follows removes the leading separators,
    // whatever the file system.
    const relativePath = normalize(decodeURIComponent(path))
      .split(/[\\/]/)
      .filter(Boolean)
      .join('/')
    const candidate = join(config.outDir, relativePath)

    // A directory returns its index — `index.html`, or `index.md` for a tree of
    // documents — before the fallback on the application document.
    const inDirectory = ['index.html', 'index.md']
      .map((name) => join(candidate, name))
      .find((path) => existsSync(path) && statSync(path).isFile())

    const existing =
      existsSync(candidate) && statSync(candidate).isFile() ? candidate : inDirectory

    // An asset announced as such is never a route: returning the document to it
    // produces a silent "strict MIME".
    //
    // A path carrying an extension likewise designates a file, not a route.
    //
    // Without this distinction, everything missing fell on the single-page
    // fallback: an absent stylesheet — or simply a misnamed one — came back as
    // a 200 with HTML, and the browser refused it on a "strict MIME checking"
    // that says nothing about the cause. A 404 names it.
    //
    // That is what the development server already does; the preview must hold
    // to it, since it is supposed to show what a static host will return.
    if (
      existing === undefined &&
      (extname(relativePath) !== '' || isAssetRequest(incoming.headers))
    ) {
      response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
      response.end(`Not found: /${relativePath}`)
      return
    }

    const file = existing ?? join(config.outDir, 'index.html')

    if (!file.startsWith(config.outDir)) {
      response.writeHead(403, { 'Content-Type': 'text/plain' })
      response.end('Forbidden')
      return
    }

    // L apercu est le dernier filet avant un deploiement : il doit repondre
    // comme un hebergement statique, donc aux plages d octets aussi. Une
    // video scrubee au defilement les demande avant tout le reste.
    const immutable = relativePath.startsWith('assets/')
    sendFile(response, file, {
      cacheControl: immutable ? 'public, max-age=31536000, immutable' : 'no-cache',
      range: incoming.headers.range,
      headOnly: incoming.method === 'HEAD',
    })
  })

  const { port: obtained, requested } = await listen(
    server,
    port,
    config.server.host,
    config.server.strictPort ? 1 : undefined,
  )

  if (requested !== undefined) {
    log.warn(
      `port ${String(requested)} in use — preview listening on ${String(obtained)}`,
    )
  }

  const url = `http://${config.server.host}:${String(obtained)}${config.base}`
  log.success('preview of the production build')
  log.info(`  ${log.colors.cyan(url)}`)

  if (config.server.open) openBrowser(url)

  return {
    url,
    close: () => new Promise<void>((done) => server.close(() => done())),
  }
}
