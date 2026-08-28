import { defineConfig } from 'tsup'

/**
 * Le paquet est telecharge a chaque `npm create odoro` : il doit rester
 * minuscule. Le moteur est une dependance, jamais un contenu embarque.
 */
export default defineConfig({
  entry: { index: 'src/index.ts' },
  format: ['esm'],
  target: 'node20',
  platform: 'node',
  dts: false,
  clean: true,
  external: ['odoro'],
  banner: { js: '#!/usr/bin/env node' },
})
