/**
 * Path alias resolution, on the build side.
 *
 * It is shared by the main build, the prerender and the side builds — that of a
 * worker, for instance. All three must resolve `@/App` to the same file: an
 * alias that only held in one of the three produces a project that builds and a
 * worker that finds nothing.
 *
 * @module
 */

import type { Plugin } from 'esbuild'

import type { ResolvedConfig } from '../config.js'
import { applyAlias, isBareSpecifier } from '../dev/transform.js'

/** The plugin that applies the aliases of the configuration. */
export function aliasPlugin(config: ResolvedConfig): Plugin {
  return {
    name: 'odoro-alias',
    setup(builder) {
      builder.onResolve({ filter: /.*/ }, (args) => {
        if (args.kind === 'entry-point') return null
        const aliased = applyAlias(args.path, config)
        if (aliased === args.path || isBareSpecifier(aliased)) return null
        return builder.resolve(aliased, {
          kind: 'import-statement',
          resolveDir: args.resolveDir,
          importer: args.importer,
          pluginData: { aliased: true },
        })
      })
    },
  }
}
