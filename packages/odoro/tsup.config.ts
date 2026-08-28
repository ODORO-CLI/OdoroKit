import { defineConfig } from 'tsup'

/**
 * Le binaire est telecharge a chaque `npm create odoro` : son poids compte.
 * esbuild est laisse externe — c'est un binaire natif, il ne se bundle pas.
 */
export default defineConfig({
  entry: {
    cli: 'src/cli.ts',
    index: 'src/index.ts',
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
