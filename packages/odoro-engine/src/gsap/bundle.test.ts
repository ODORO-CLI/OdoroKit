import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..', '..')
const SOURCE = join(ROOT, 'src')
const DIST = join(ROOT, 'dist')

/** Plugins qui ne doivent jamais entrer dans le bundle initial. */
const LAZY_PLUGINS = ['ScrollTrigger', 'SplitText', 'Observer', 'ScrollSmoother'] as const

/** Fichiers TypeScript du moteur, hors tests. */
function sourceFiles(directory: string): string[] {
  const found: string[] = []
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name)
    if (entry.isDirectory()) {
      found.push(...sourceFiles(path))
    } else if (/\.tsx?$/.test(entry.name) && !entry.name.includes('.test.')) {
      found.push(path)
    }
  }
  return found
}

describe('chargement a la demande', () => {
  it('n importe aucun plugin de facon statique', () => {
    // Un seul import statique suffirait a faire entrer 130 Ko de code de
    // plugin dans le bundle initial d'un projet qui n'anime que du texte.
    const offenders: string[] = []

    for (const file of sourceFiles(SOURCE)) {
      const code = readFileSync(file, 'utf8')
      for (const plugin of LAZY_PLUGINS) {
        // Un import dynamique s'ecrit `import('gsap/X')` ; un import statique
        // porte le mot-cle `from`.
        const statique = new RegExp(`from\\s*['"]gsap/${plugin}['"]`)
        if (statique.test(code)) {
          offenders.push(`${file.replace(ROOT, '')} importe statiquement ${plugin}`)
        }
      }
    }

    expect(offenders).toEqual([])
  })

  it('conserve des imports dynamiques dans la source', () => {
    const setup = readFileSync(join(SOURCE, 'gsap', 'setup.ts'), 'utf8')
    for (const plugin of LAZY_PLUGINS) {
      expect(setup).toContain(`import('gsap/${plugin}')`)
    }
  })
})

describe.runIf(existsSync(join(DIST, 'index.js')))('bundle produit', () => {
  const bundle = readFileSync(join(DIST, 'index.js'), 'utf8')

  it('ne fait entrer aucun moteur de rendu 3D dans l entree principale', () => {
    // Le moteur de rendu 3D pese un ordre de grandeur de plus que le backend
    // leger. Un site qui n'affiche qu'une animation de texte ne doit pas en
    // telecharger une ligne : la garantie se verifie, elle ne s'affirme pas.
    expect(bundle).not.toContain('three')
    expect(bundle).not.toContain('WebGLRenderer')
  })

  it('conserve le backend leger en import dynamique', () => {
    expect(bundle).toContain("import('ogl')")
  })

  it('conserve les plugins en imports dynamiques', () => {
    // Le decoupage peut deplacer ce code dans un fragment partage entre les
    // deux entrees : c'est l'ensemble du bundle qui doit etre inspecte, pas la
    // seule entree principale.
    const all = readdirSync(DIST)
      .filter((entry) => entry.endsWith('.js'))
      .map((entry) => readFileSync(join(DIST, entry), 'utf8'))
      .join('\n')

    for (const plugin of LAZY_PLUGINS) {
      expect(all).toContain(`import('gsap/${plugin}')`)
    }
  })

  it('n inline le code d aucun plugin', () => {
    // Des marqueurs propres a l'implementation des plugins : leur presence
    // signifierait que le code a ete recopie dans l'entree.
    for (const marker of ['_scrollers', 'refreshInits', 'linesClass']) {
      expect(bundle).not.toContain(marker)
    }
  })

  it('laisse la bibliotheque de base externe', () => {
    // Sa licence interdit d'en retirer les notices de propriete, ce qui exclut
    // de l'inliner dans un paquet publie.
    //
    // La liaison locale n'est pas fixee : des que deux modules du paquet
    // importent gsap, l'empaqueteur renomme l'une des deux pour eviter la
    // collision. Ce qui compte est que l'import reste, et qu'aucune ligne de
    // gsap ne soit recopiee.
    expect(bundle).toMatch(/^import \w+ from ['"]gsap['"]/m)
    expect(bundle).not.toContain('Copyright 2008-')
  })

  it('reste sous le seuil de poids annonce', () => {
    const kilobytes = Buffer.byteLength(bundle) / 1024
    expect(kilobytes).toBeLessThan(60)
  })
})

describe.runIf(existsSync(join(DIST, 'three', 'index.js')))(
  'entree du backend 3D',
  () => {
    const bundle = readFileSync(join(DIST, 'three', 'index.js'), 'utf8')

    it('charge le moteur de rendu dynamiquement', () => {
      // La separation d'entree ne suffit pas : sans import dynamique, importer
      // ce module ferait entrer le moteur de rendu dans le fragment initial de
      // l'appelant.
      expect(bundle).toContain("import('three')")
      expect(bundle).not.toMatch(/^import .* from ['"]three['"]/m)
    })

    it('n inline pas le moteur de rendu', () => {
      // La comparaison de taille est la preuve la plus honnete : chercher des
      // noms comme `WebGLRenderer` echouerait sur un simple site d'appel.
      const upstream = resolve(
        ROOT,
        '..',
        '..',
        'node_modules',
        'three',
        'build',
        'three.core.js',
      )

      if (!existsSync(upstream)) return

      const ratio = Buffer.byteLength(bundle) / statSync(upstream).size
      expect(ratio).toBeLessThan(0.05)
    })

    it('reste minuscule', () => {
      // Cette entree ne contient que la logique du moteur : le poids reel est
      // paye a l'import dynamique, et seulement par qui l'utilise.
      const kilobytes = Buffer.byteLength(bundle) / 1024
      expect(kilobytes).toBeLessThan(30)
    })
  },
)
