import { cp } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'tsup'

const HERE = dirname(fileURLToPath(import.meta.url))
const GENERATED = join(HERE, 'src', 'styles', 'generated')
const DIST = join(HERE, 'dist')

/**
 * One entry per submodule: the consumer that imports only the tokens pulls in
 * neither React nor the router.
 *
 * React and React DOM are external on top of being peerDependencies. Bundling
 * them would duplicate the React instance on the consumer side, which breaks
 * hooks and contexts in a spectacular and hard to diagnose way.
 */
export default defineConfig({
  entry: {
    index: 'src/index.ts',
    router: 'src/router/index.ts',
    motion: 'src/motion/index.ts',
    // The motion policy and the tokens ship apart: they are consumed by the
    // engine and by the registry, which have no reason to pull in React nor
    // class composition just to read a duration.
    'motion-policy': 'src/motion-policy/index.ts',
    tokens: 'src/styles/tokens.ts',
    ui: 'src/ui/index.ts',
    styles: 'src/styles/index.ts',
    // The stylesheet generator, consumed by the engine at build time. It
    // ships apart because it serves only there, and because it has no reason
    // to enter a bundle shipped to the browser.
    generator: 'src/styles/generator.ts',
  },
  format: ['esm'],
  target: 'es2022',
  platform: 'browser',
  dts: true,
  splitting: true,
  treeshake: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom', 'react/jsx-runtime'],
  // The package ships the **base** alone: variables, preflight, keyframes.
  // The utilities are produced when each application is built, for the sole
  // classes it uses.
  //
  // The whole stylesheet weighed 1 724 Ko — 119 Ko compressed, that is a
  // third of the weight of the bundle — and every project threw more than
  // ninety-five percent of it away. The base weighs 30.
  //
  // This requires the odoro engine 0.1.5 or newer: without it, the
  // application gets the variables without the utilities, and comes up
  // unstyled.
  async onSuccess() {
    await cp(join(GENERATED, 'odoro.base.css'), join(DIST, 'styles.css'))
  },
})
