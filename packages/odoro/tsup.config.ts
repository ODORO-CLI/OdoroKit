import { defineConfig } from 'tsup'

/**
 * The binary is downloaded on every `npm create odoro`: its weight counts.
 *
 * esbuild is left external — it is a native binary, it does not bundle.
 * The validation library, for its part, is **inlined** rather than declared as
 * a dependency: installed, it weighs close to six megabytes, while the surface
 * actually used is a tiny fraction of that.
 */
export default defineConfig({
  entry: {
    cli: 'src/cli.ts',
    index: 'src/index.ts',
    'registry/index': 'src/registry/index.ts',
  },
  format: ['esm'],
  target: 'node20',
  platform: 'node',
  dts: true,
  splitting: true,
  treeshake: true,
  clean: true,
  external: ['esbuild', '@clack/prompts', 'picocolors'],
  banner: { js: '#!/usr/bin/env node' },
})
