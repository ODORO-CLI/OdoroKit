import { defineConfig } from 'tsup'

/**
 * React et React DOM sont externes en plus d'etre des peerDependencies : les
 * bundler dupliquerait l'instance de React chez le consommateur.
 *
 * GSAP reste externe et declare en dependance : sa licence interdit d'en
 * retirer les notices de propriete, et l'inliner reviendrait a le vendorer.
 */
export default defineConfig({
  entry: { index: 'src/index.ts', 'three/index': 'src/three/index.ts' },
  format: ['esm'],
  target: 'es2022',
  platform: 'browser',
  dts: true,
  splitting: true,
  treeshake: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'react/jsx-runtime', 'gsap', 'ogl', 'three'],
})
