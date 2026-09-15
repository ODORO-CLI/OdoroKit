/**
 * The application server: an assembly of modules, nothing more.
 *
 * ## This file holds no logic
 *
 * That is deliberate. Everything an application does lives in a module, and
 * this file does nothing but say which ones are active. Enabling or disabling
 * a feature then takes one line, and nothing else moves.
 *
 * A server where routes are added directly here ends up mixing the assembly
 * with the domain, and "disable authentication" becomes a piece of archaeology
 * rather than a commented line.
 *
 * ## In development and in production
 *
 * In development, this server exposes only the API: the client is served by
 * Odoro, which forwards the calls starting with `/api` to it. In production,
 * it also serves the result of the client build — a single thing to deploy.
 *
 * @module
 */

import { existsSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import {
  ConfigError,
  createApp,
  createContainer,
  createLogger,
  loadConfig,
} from '@odoro-cli/server'
import express from 'express'

import { createHealthModule } from './modules/health/index.js'

/** Root of the compiled module, to find the client next to it. */
const HERE = dirname(fileURLToPath(import.meta.url))

/**
 * Assembles the application. Exported so that tests can mount it without
 * listening.
 *
 * @returns `app` is the kernel and its modules; `express` is what has to be
 *   listened on — in production, a wrapper that serves the built client first.
 *   An API test mounts `app.express`; an end-to-end test, `express`.
 */
export function buildServer() {
  const config = loadConfig()

  const logger = createLogger({
    level: config.LOG_LEVEL,
    pretty: config.NODE_ENV === 'development',
  })

  // The configuration and the logger are in the container: a module finds them
  // there without their being handed down through three layers.
  const container = createContainer()
    .register('config', () => config)
    .register('logger', () => logger)

  const app = createApp({
    config,
    logger,
    container: container as never,
    modules: [
      createHealthModule(config),
      // The foundation modules are added here, in any order: the kernel sorts
      // them according to their dependencies.
      //
      //   authModule,
      //   accountModule,
      //   settingsModule,
    ],
  })

  // `dist/server/main.js` -> `dist/client`
  const client = resolve(HERE, '..', 'client')
  const servesTheClient = config.NODE_ENV === 'production' && existsSync(client)

  if (!servesTheClient) return { app, express: app.express, config, logger }

  // ## Why one application wrapping another
  //
  // `createApp` ends by installing the 404 handler and the error handler.
  // Anything mounted **after** it would therefore be unreachable: the request
  // would already have its answer. The client was thus never served in
  // production — with no error at startup, since the mounting succeeds; every
  // page simply came back 404.
  //
  // So the wrapper handles the files first and only hands over to the API for
  // what it has not served. The order is explicit, and the kernel stays free to
  // end with its handlers.
  const wrapper = express()
  wrapper.set('trust proxy', true)
  wrapper.disable('x-powered-by')

  // `index: false`: without it, a directory would return its `index.html` with
  // the cache header of a hashed file — one year, immutable —, and a wording
  // fix would stay invisible for a year. Those documents go through the
  // handling below, with no caching.
  //
  // `redirect: false`: prerendering drops one directory per route, and without
  // it `/about` answered with a redirect to `/about/`. One more round trip,
  // and above all an address that is not the one that was published.
  wrapper.use(
    express.static(client, {
      index: false,
      redirect: false,
      maxAge: '1y',
      immutable: true,
    }),
  )

  // A prerendered route is served as it stands; everything else falls back to
  // the document, and the client router decides what happens next.
  //
  // Without this lookup, `/about` would receive the document of the root: the
  // page would end up showing, once the script had run, but the prerendered
  // HTML — the one robots and link previews read — would be the home page's,
  // with its title and its description.
  wrapper.get(/^(?!\/api\/).*/, (request, response, next) => {
    const route = request.path.replace(/^\/+|\/+$/g, '')
    const prerendered = route === '' ? undefined : resolve(client, route, 'index.html')

    if (
      prerendered !== undefined &&
      prerendered.startsWith(client) &&
      existsSync(prerendered)
    ) {
      response.sendFile(prerendered)
      return
    }

    const document = join(client, 'index.html')
    if (!existsSync(document)) {
      // The client has not been built: the API will answer, and its 404 will
      // at least say that no route matches.
      next()
      return
    }
    response.sendFile(document)
  })

  wrapper.use(app.express)

  return { app, express: wrapper, config, logger }
}

/** Starts the server. */
function main(): void {
  let server
  try {
    server = buildServer()
  } catch (cause) {
    if (cause instanceof ConfigError) {
      // The configuration is incomplete: the message lists everything that is
      // missing, at once. There is no point starting halfway.
      console.error(cause.message)
      process.exit(1)
    }
    throw cause
  }

  // `express` and not `app.express`: it is the wrapper that serves the client
  // before handing over to the API. In development the two are the same thing.
  const { express: application, config, logger } = server

  const listener = application.listen(config.PORT, () => {
    logger.info({ port: config.PORT, environment: config.NODE_ENV }, 'server listening')
  })

  // Graceful shutdown: stop accepting, let what is in flight finish, and give
  // up past the deadline rather than hanging.
  const stop = (signal: string): void => {
    logger.info({ signal }, 'shutdown requested')
    const deadline = setTimeout(() => {
      logger.warn('deadline exceeded, forcing shutdown')
      process.exit(1)
    }, config.SHUTDOWN_TIMEOUT)
    deadline.unref()

    listener.close(() => {
      clearTimeout(deadline)
      process.exit(0)
    })
  }

  process.on('SIGTERM', () => stop('SIGTERM'))
  process.on('SIGINT', () => stop('SIGINT'))
}

main()
