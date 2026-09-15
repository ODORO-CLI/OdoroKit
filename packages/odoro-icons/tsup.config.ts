import { cp } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'tsup'

const HERE = dirname(fileURLToPath(import.meta.url))

/**
 * One entry per pack.
 *
 * Gathering the packs into a single module would force every consumer to load
 * eleven thousand exports so that the bundler could prune ten thousand nine
 * hundred and ninety-seven of them. Keeping them apart makes pruning free: a
 * project that only imports `outline` never sees the others.
 *
 * `splitting` is turned off: it would factor common pieces out of packs that
 * have nothing in common, and force a consumer of a single pack to load a
 * shared chunk.
 */
export default defineConfig({
  entry: {
    index: 'src/index.ts',
    outline: 'src/packs/outline.ts',
    compact: 'src/packs/compact.ts',
    classic: 'src/packs/classic.ts',
    extended: 'src/packs/extended.ts',
    brands: 'src/packs/brands.ts',
  },
  format: ['esm'],
  target: 'es2022',
  platform: 'browser',
  dts: true,
  splitting: false,
  treeshake: true,
  sourcemap: false,
  clean: true,
  external: ['react', 'react/jsx-runtime'],
  // The catalogue is data, not code: it serves documentation search, which
  // needs the names and never the drawings.
  async onSuccess() {
    await cp(join(HERE, 'src', 'catalogue.json'), join(HERE, 'dist', 'catalogue.json'))
  },
})
