/**
 * Engine plugins.
 *
 * ## Why such a small surface
 *
 * A plugin system is a compatibility promise: everything it exposes will have
 * to be honoured. This one exposes only what a project really needs —
 * transform code, transform the document, add a route to the server — and
 * leaves an escape hatch towards the bundler for the rest.
 *
 * Three hooks can be replaced; thirty get dragged along.
 *
 * @module
 */

import type { Plugin as EsbuildPlugin } from 'esbuild'
import type { IncomingMessage, ServerResponse } from 'node:http'

/** What a plugin knows about the transformation under way. */
export interface TransformContext {
  /** Absolute path of the transformed file. */
  readonly id: string
  /** True during development, false in a production build. */
  readonly dev: boolean
  /** True during a server render (prerendering). */
  readonly ssr: boolean
}

/** What a plugin knows about the document it transforms. */
export interface HtmlContext {
  /** True during development. */
  readonly dev: boolean
  /** Route being rendered, during a prerender; `/` otherwise. */
  readonly route: string
}

/** A request middleware, added to the development server. */
export type Middleware = (
  request: IncomingMessage,
  response: ServerResponse,
  next: () => void,
) => void | Promise<void>

/** What a plugin receives to hook into the server. */
export interface ServerContext {
  /** Adds a middleware, called before the engine handles the request. */
  use(middleware: Middleware): void
}

/**
 * A plugin.
 *
 * @example
 * import { defineConfig, type OdoroPlugin } from 'odoro'
 *
 * const stamped: OdoroPlugin = {
 *   name: 'stamped',
 *   transformIndexHtml: (html) =>
 *     html.replace('</head>', `<meta name="build" content="${Date.now()}"></head>`),
 * }
 *
 * export default defineConfig({ plugins: [stamped] })
 */
export interface OdoroPlugin {
  /** Plugin name, shown in error messages. */
  readonly name: string
  /**
   * Transforms the code of a source file before it is compiled.
   *
   * Returning `null` or `undefined` leaves the file untouched — that is what to
   * do for everything the plugin is not concerned with, and it is cheaper than
   * returning the unchanged code.
   */
  transform?(
    code: string,
    context: TransformContext,
  ): string | null | undefined | Promise<string | null | undefined>
  /** Transforms the HTML document before it is served or written. */
  transformIndexHtml?(html: string, context: HtmlContext): string | Promise<string>
  /** Hooks middlewares into the development server. */
  configureServer?(context: ServerContext): void | Promise<void>
  /**
   * Bundler plugins, for what the hooks above do not cover.
   *
   * This is the escape hatch: it grants access to full resolution and loading,
   * at the price of coupling to the bundler.
   */
  readonly esbuild?: readonly EsbuildPlugin[]
}

/**
 * Applies the code transformations of the plugins, in declared order.
 *
 * Each plugin receives the result of the previous one: the order of the list is
 * the order of processing, like a chain of filters.
 *
 * @returns The transformed code, or `undefined` if no plugin answered.
 */
export async function transformWith(
  plugins: readonly OdoroPlugin[],
  code: string,
  context: TransformContext,
): Promise<string | undefined> {
  let current = code
  let touched = false

  for (const plugin of plugins) {
    if (plugin.transform === undefined) continue
    try {
      const rendered = await plugin.transform(current, context)
      if (rendered === null || rendered === undefined) continue
      current = rendered
      touched = true
    } catch (cause) {
      throw new Error(
        `[odoro] Plugin "${plugin.name}" failed on ${context.id}: ` +
          (cause instanceof Error ? cause.message : String(cause)),
        { cause },
      )
    }
  }

  return touched ? current : undefined
}

/** Applies the document transformations of the plugins, in declared order. */
export async function transformHtmlWith(
  plugins: readonly OdoroPlugin[],
  html: string,
  context: HtmlContext,
): Promise<string> {
  let current = html

  for (const plugin of plugins) {
    if (plugin.transformIndexHtml === undefined) continue
    try {
      current = await plugin.transformIndexHtml(current, context)
    } catch (cause) {
      throw new Error(
        `[odoro] Plugin "${plugin.name}" failed on the document: ` +
          (cause instanceof Error ? cause.message : String(cause)),
        { cause },
      )
    }
  }

  return current
}

/** Gathers the bundler plugins declared by the engine plugins. */
export function esbuildPluginsFrom(
  plugins: readonly OdoroPlugin[],
): readonly EsbuildPlugin[] {
  return plugins.flatMap((plugin) => plugin.esbuild ?? [])
}
