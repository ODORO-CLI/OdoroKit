import { cp } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'tsup'

const HERE = dirname(fileURLToPath(import.meta.url))

/**
 * Une entree par jeu.
 *
 * Rassembler les jeux dans un seul module obligerait chaque consommateur a
 * charger onze mille exports pour que le bundler en elague dix mille neuf
 * cent quatre-vingt-dix-sept. La separation rend l'elagage gratuit : un projet
 * qui n'importe que `filaire` ne voit jamais les autres.
 *
 * `splitting` est desactive : il factoriserait des morceaux communs entre des
 * jeux qui n'ont rien en commun, et forcerait un consommateur d'un seul jeu a
 * charger un fragment partage.
 */
export default defineConfig({
  entry: {
    index: 'src/index.ts',
    filaire: 'src/jeux/filaire.ts',
    compact: 'src/jeux/compact.ts',
    classique: 'src/jeux/classique.ts',
    etendu: 'src/jeux/etendu.ts',
    marques: 'src/jeux/marques.ts',
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
  // Le catalogue est une donnee, pas du code : il sert la recherche de la
  // documentation, qui a besoin des noms et jamais des traces.
  async onSuccess() {
    await cp(join(HERE, 'src', 'catalogue.json'), join(HERE, 'dist', 'catalogue.json'))
  },
})
