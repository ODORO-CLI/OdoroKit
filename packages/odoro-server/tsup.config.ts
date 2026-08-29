import { defineConfig } from 'tsup'

/**
 * Un seul point d'entree.
 *
 * Le noyau n'est pas une collection de bibliotheques independantes : le
 * conteneur, les erreurs et la definition de module se referencent
 * mutuellement, et les separer en entrees distinctes dupliquerait le code
 * commun dans chaque fragment.
 */
export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: ['esm'],
  target: 'es2022',
  platform: 'node',
  dts: true,
  splitting: false,
  treeshake: true,
  sourcemap: true,
  clean: true,
  external: ['express', 'pino', 'zod'],
})
