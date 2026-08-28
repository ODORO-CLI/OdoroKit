import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { generate, renderClassNamesModule, renderCss } from '../../scripts/generate.js'
import { ODORO_CLASS_NAMES } from './generated/classNames.js'
import { cx, variants } from './cx.js'
import { colorDark, colorLight, space, tokens } from './tokens.js'

const GENERATED_DIR = join(dirname(fileURLToPath(import.meta.url)), 'generated')

describe('cx', () => {
  it('concatene des chaines', () => {
    expect(cx('o-flex', 'o-gap-2')).toBe('o-flex o-gap-2')
  })

  it('ignore les valeurs vides', () => {
    expect(cx('o-flex', null, undefined, false, '')).toBe('o-flex')
  })

  it('retient les cles vraies d un objet', () => {
    expect(cx({ 'o-flex': true, 'o-hidden': false, 'o-p-4': 1 })).toBe('o-flex o-p-4')
  })

  it('aplatit les tableaux imbriques', () => {
    expect(cx(['o-flex', ['o-gap-2', { 'o-p-4': true }]])).toBe('o-flex o-gap-2 o-p-4')
  })

  it('accepte les nombres', () => {
    expect(cx(0, 1, 'o-flex')).toBe('0 1 o-flex')
  })

  it('retourne une chaine vide sans entree utile', () => {
    expect(cx(false, null, [])).toBe('')
  })
})

describe('variants', () => {
  const button = variants({
    base: 'o-inline-flex o-rounded-md',
    variants: {
      tone: { primary: 'o-bg-primary', ghost: 'o-bg-surface' },
      size: { sm: 'o-px-2', md: 'o-px-4' },
    },
    defaults: { tone: 'primary', size: 'md' },
  })

  it('applique les valeurs par defaut', () => {
    expect(button()).toBe('o-inline-flex o-rounded-md o-bg-primary o-px-4')
  })

  it('remplace une variante fournie', () => {
    expect(button({ tone: 'ghost' })).toBe(
      'o-inline-flex o-rounded-md o-bg-surface o-px-4',
    )
  })

  it('ajoute les classes applicatives en dernier', () => {
    expect(button({ className: 'o-w-full' })).toContain('o-w-full')
    expect(button({ className: 'o-w-full' }).endsWith('o-w-full')).toBe(true)
  })

  it('retombe sur la valeur par defaut pour null comme pour undefined', () => {
    expect(button({ tone: null })).toBe(button())
    expect(button({ tone: undefined })).toBe(button())
  })

  it('fonctionne sans variantes declarees', () => {
    expect(variants({ base: 'o-flex' })()).toBe('o-flex')
  })
})

describe('artefacts generes', () => {
  it('le CSS sur disque correspond aux tokens courants', () => {
    const onDisk = readFileSync(join(GENERATED_DIR, 'odoro.css'), 'utf8')
    // Si ce test echoue, relancer `pnpm --filter odoro-libs build:css`.
    expect(onDisk).toBe(renderCss())
  })

  it('la liste des classes sur disque correspond aux tokens courants', () => {
    const onDisk = readFileSync(join(GENERATED_DIR, 'classNames.ts'), 'utf8')
    expect(onDisk).toBe(renderClassNamesModule())
  })

  it('ne produit aucun nom de classe en double', () => {
    expect(new Set(ODORO_CLASS_NAMES).size).toBe(ODORO_CLASS_NAMES.length)
  })

  it('reste dans un ordre de grandeur maitrise', () => {
    const base = ODORO_CLASS_NAMES.filter((name) => !name.includes(':'))
    // Le budget annonce est d'environ 150 utilitaires de base : ce test sert
    // de garde-fou contre une derive silencieuse vers un framework complet.
    expect(base.length).toBeLessThanOrEqual(180)
  })
})

describe('feuille de style produite', () => {
  const { css } = generate()

  it('declare une variable pour chaque espacement', () => {
    for (const key of Object.keys(space)) {
      expect(css).toContain(`--o-space-${key.replace('.', '_')}:`)
    }
  })

  it('declare une variable pour chaque couleur semantique', () => {
    for (const key of Object.keys(colorLight)) {
      expect(css).toContain(`--o-color-${key}:`)
    }
  })

  it('couvre exactement les memes couleurs en clair et en sombre', () => {
    expect(Object.keys(colorDark).sort()).toEqual(Object.keys(colorLight).sort())
  })

  it('n utilise que des noms de variables CSS valides', () => {
    const declared = [...css.matchAll(/--o-[a-z0-9-]+(?:_[0-9]+)?(?=:)/g)].map(
      (m) => m[0],
    )
    expect(declared.length).toBeGreaterThan(0)
    for (const name of declared) {
      expect(name).toMatch(/^--o-[a-z0-9_-]+$/)
    }
  })

  it('echappe les deux-points des selecteurs a variant', () => {
    expect(css).toContain('.md\\:o-flex')
    expect(css).toContain('.hover\\:o-bg-primary')
  })

  it('genere le theme sombre en preference systeme et en choix explicite', () => {
    expect(css).toContain('@media (prefers-color-scheme: dark)')
    expect(css).toContain(':root[data-theme="dark"]')
  })

  it('neutralise les animations sous prefers-reduced-motion', () => {
    expect(css).toContain('@media (prefers-reduced-motion:reduce)')
  })

  it('ne laisse aucune valeur codee en dur dans les utilitaires de couleur', () => {
    const utility = css.slice(css.indexOf('/* Couleur de texte. */'))
    expect(utility).not.toMatch(/color:#[0-9a-f]{6}/i)
  })
})

describe('tokens', () => {
  it('regroupe les echelles sous les prefixes de variables CSS', () => {
    expect(tokens.space[4]).toBe('1rem')
    expect(tokens.color.primary).toBe(colorLight.primary)
  })
})
