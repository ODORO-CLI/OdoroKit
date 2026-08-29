import { cp } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'tsup'

const HERE = dirname(fileURLToPath(import.meta.url))
const GENERATED = join(HERE, 'src', 'styles', 'generated')
const DIST = join(HERE, 'dist')

/**
 * Une entree par sous-module : le consommateur qui n'importe que les tokens ne
 * tire ni React ni le routeur.
 *
 * React et React DOM sont externes en plus d'etre des peerDependencies. Les
 * bundler dupliquerait l'instance de React chez le consommateur, ce qui casse
 * les hooks et les contextes de facon spectaculaire et difficile a diagnostiquer.
 */
export default defineConfig({
  entry: {
    index: 'src/index.ts',
    router: 'src/router/index.ts',
    motion: 'src/motion/index.ts',
    // La politique de mouvement et les tokens sortent a part : ils sont
    // consommes par le moteur et par le registre, qui n'ont aucune raison
    // de tirer React ni la composition de classes pour lire une duree.
    'motion-policy': 'src/motion-policy/index.ts',
    tokens: 'src/styles/tokens.ts',
    ui: 'src/ui/index.ts',
    styles: 'src/styles/index.ts',
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
  // Les feuilles de style sont des artefacts deja generes : tsup n'a qu'a les
  // deposer a cote du code, sous les noms annonces par le champ `exports`.
  async onSuccess() {
    await cp(join(GENERATED, 'odoro.css'), join(DIST, 'styles.css'))
    await cp(join(GENERATED, 'odoro.full.css'), join(DIST, 'styles.full.css'))
  },
})
