import { existsSync, readFileSync, readdirSync } from 'node:fs'
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

  it('conserve les plugins en imports dynamiques', () => {
    for (const plugin of LAZY_PLUGINS) {
      expect(bundle).toContain(`import('gsap/${plugin}')`)
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
    expect(bundle).toMatch(/^import gsap from ['"]gsap['"]/m)
  })

  it('reste sous le seuil de poids annonce', () => {
    const kilobytes = Buffer.byteLength(bundle) / 1024
    expect(kilobytes).toBeLessThan(60)
  })
})
