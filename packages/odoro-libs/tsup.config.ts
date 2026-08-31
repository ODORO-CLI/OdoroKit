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
    // Le generateur de feuille, consomme par le moteur au moment de la
    // compilation. Il sort a part parce qu'il ne sert que la, et qu'il n'a
    // aucune raison d'entrer dans un paquet expedie au navigateur.
    generateur: 'src/styles/generateur.ts',
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
  // Le paquet livre le **socle** seul : variables, preflight, images-cles.
  // Les utilitaires sont produits a la construction de chaque application,
  // pour les seules classes qu'elle emploie.
  //
  // La feuille entiere pesait 1 724 Ko — 119 Ko compresses, soit un tiers du
  // poids du paquet — et chaque projet en jetait plus de quatre-vingt-quinze
  // pour cent. Le socle en pese 30.
  //
  // Cela exige le moteur odoro 0.1.5 ou plus recent : sans lui, l'application
  // recoit les variables sans les utilitaires, et arrive sans style.
  async onSuccess() {
    await cp(join(GENERATED, 'odoro.base.css'), join(DIST, 'styles.css'))
  },
})
