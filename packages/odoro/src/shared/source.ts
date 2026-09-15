/**
 * Passing sources through the engine transformations.
 *
 * Two paths lead to the bundler — the development server, which compiles one
 * module at a time, and the production build, which takes them all — and they
 * must see **the same code**. A pattern resolved differently here and there, or
 * a plugin that only applied in development, produces a project that works on
 * screen and breaks once published.
 *
 * This plugin is therefore hooked on both sides, with the same inputs.
 *
 * @module
 */

import { readFile } from 'node:fs/promises'
import { extname } from 'node:path'

import type { Loader, Plugin } from 'esbuild'

import { type OdoroPlugin, transformWith } from '../plugins.js'
import { hasGlob, transformGlob } from './glob.js'

/** The bundler loader matching an extension. */
const LOADERS: Readonly<Record<string, Loader>> = {
  '.ts': 'ts',
  '.tsx': 'tsx',
  '.js': 'js',
  '.jsx': 'jsx',
  '.mjs': 'js',
  '.cjs': 'js',
}

/** What the plugin needs to know. */
export interface SourceOptions {
  /** Project root, for patterns starting with `/`. */
  readonly root: string
  /** Plugins declared by the project. */
  readonly plugins: readonly OdoroPlugin[]
  /** True during development. */
  readonly dev: boolean
  /** True during a server render. */
  readonly ssr?: boolean
  /**
   * Called for each file reached by a pattern.
   *
   * The development server uses it to know that a module depends on the
   * **contents of a directory**: without it, a file added to that directory
   * would trigger no rebuild, and would only show up on restart.
   */
  readonly onMatch?: (file: string) => void
}

/**
 * The plugin that runs every source through the engine.
 *
 * ## The order, and why it is this one
 *
 * Patterns first: they produce imports, and a project plugin must be able to
 * see them. Plugins next, in the order the project declares them.
 *
 * ## What is not loaded
 *
 * A file nothing transforms is not read here: the plugin hands back control and
 * the bundler reads it itself. That is what avoids putting all of
 * `node_modules` through an extra read on every build.
 */
export function sourcePlugin(options: SourceOptions): Plugin {
  const transforms = options.plugins.some((plugin) => plugin.transform !== undefined)

  return {
    name: 'odoro-source',
    setup(builder) {
      builder.onLoad({ filter: /\.[cm]?[jt]sx?$/ }, async (args) => {
        // Installed dependencies are neither transformed nor read again: they
        // do not write patterns, and running them through here would add one
        // read per file over thousands of files.
        if (args.path.includes('node_modules')) return null

        const source = await readFile(args.path, 'utf8')
        let code = source

        if (hasGlob(code)) {
          const resolved = transformGlob(code, args.path, options.root)
          if (resolved !== undefined) {
            code = resolved.code
            for (const file of resolved.files) options.onMatch?.(file)
          }
        }

        if (transforms) {
          const rendered = await transformWith(options.plugins, code, {
            id: args.path,
            dev: options.dev,
            ssr: options.ssr ?? false,
          })
          if (rendered !== undefined) code = rendered
        }

        if (code === source) return null

        return { contents: code, loader: LOADERS[extname(args.path).toLowerCase()] }
      })
    },
  }
}
