import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { generate, renderClassNamesModule, renderCss } from './generateur.js'
import {
  ODORO_CLASS_NAMES,
  ODORO_CORE_CLASS_NAMES,
  ODORO_EXTENDED_CLASS_NAMES,
} from './generated/classNames.js'
import { cx, variants } from './cx.js'
import { palette, space, tokens } from './tokens.js'

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
      tone: {
        primary: 'o-bg-brand-600 dark:o-bg-brand-400',
        ghost: 'o-bg-white dark:o-bg-zinc-900',
      },
      size: { sm: 'o-px-2', md: 'o-px-4' },
    },
    defaults: { tone: 'primary', size: 'md' },
  })

  it('applique les valeurs par defaut', () => {
    expect(button()).toBe(
      'o-inline-flex o-rounded-md o-bg-brand-600 dark:o-bg-brand-400 o-px-4',
    )
  })

  it('remplace une variante fournie', () => {
    expect(button({ tone: 'ghost' })).toBe(
      'o-inline-flex o-rounded-md o-bg-white dark:o-bg-zinc-900 o-px-4',
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
  it('la feuille de base sur disque correspond aux tokens courants', () => {
    const onDisk = readFileSync(join(GENERATED_DIR, 'odoro.css'), 'utf8')
    // Si ce test echoue, relancer `pnpm --filter @odoro-cli/libs build:css`.
    expect(onDisk).toBe(renderCss('core'))
  })

  it('la feuille complete sur disque correspond aux tokens courants', () => {
    const onDisk = readFileSync(join(GENERATED_DIR, 'odoro.full.css'), 'utf8')
    expect(onDisk).toBe(renderCss('full'))
  })

  it('la liste des classes sur disque correspond aux tokens courants', () => {
    const onDisk = readFileSync(join(GENERATED_DIR, 'classNames.ts'), 'utf8')
    expect(onDisk).toBe(renderClassNamesModule())
  })

  it('ne produit aucun nom de classe en double', () => {
    expect(new Set(ODORO_CLASS_NAMES).size).toBe(ODORO_CLASS_NAMES.length)
  })

  it('separe strictement les deux paliers', () => {
    const core = new Set<string>(ODORO_CORE_CLASS_NAMES)
    for (const name of ODORO_EXTENDED_CLASS_NAMES) {
      expect(core.has(name)).toBe(false)
    }
    expect(ODORO_CLASS_NAMES.length).toBe(
      ODORO_CORE_CLASS_NAMES.length + ODORO_EXTENDED_CLASS_NAMES.length,
    )
  })

  it('garde la feuille de base sous le seuil de derive', () => {
    // Garde-fou : la feuille de base ne doit pas absorber la palette brute,
    // sans quoi la separation en deux paliers perdrait tout son sens. Le
    // palier etendu doit rester un surcout substantiel de la feuille complete.
    const core = readFileSync(join(GENERATED_DIR, 'odoro.css'), 'utf8')
    const full = readFileSync(join(GENERATED_DIR, 'odoro.full.css'), 'utf8')
    expect(core.length).toBeLessThan(1_800_000)
    expect(full.length - core.length).toBeGreaterThan(300_000)
  })
})

describe('feuille de style produite', () => {
  const { css } = generate('full')

  it('declare une variable pour chaque espacement', () => {
    for (const key of Object.keys(space)) {
      expect(css).toContain(`--o-space-${key.replace('.', '_')}:`)
    }
  })

  it('declare une variable pour chaque couleur de la palette', () => {
    for (const key of Object.keys(palette)) {
      expect(css).toContain(`--o-palette-${key}:`)
    }
  })

  it('ne declare plus aucune couleur semantique', () => {
    // La couche de roles a ete retiree : une couleur se designe par sa place
    // dans la palette, jamais par ce a quoi elle sert.
    expect(css).not.toMatch(/--o-color-[a-z]/)
  })

  it('croise le theme avec chaque etat', () => {
    // Sans variable semantique, un composant interactif ne peut avoir deux
    // themes que si `dark:` se compose avec `hover:`.
    expect(css).toContain('.dark\\:hover\\:o-bg-zinc-800')
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
    expect(css).toContain('.hover\\:o-bg-brand-600')
  })

  it('genere le theme sombre en preference systeme et en choix explicite', () => {
    expect(css).toMatch(/@media \(prefers-color-scheme: ?dark\)/)
    expect(css).toContain(':root[data-theme="dark"]')
  })

  it('neutralise les animations sous prefers-reduced-motion', () => {
    expect(css).toContain('@media (prefers-reduced-motion:reduce)')
  })

  it('habille les transitions de page, que le routeur declenche', () => {
    // Sans ces regles, le navigateur applique son fondu par defaut de 90 ms :
    // la transition a bien lieu, mais elle ne se voit pas.
    expect(css).toContain('::view-transition-old(root)')
    expect(css).toContain('::view-transition-new(root)')
    expect(css).toContain('::view-transition-old(o-page)')
    expect(css).toContain('::view-transition-new(o-page)')
  })

  it('reserve le deplacement a la zone nommee, jamais a la racine', () => {
    // L'en-tete et le pied de page restent dans le groupe racine : les voir
    // glisser alors qu'ils n'ont pas change serait un defaut.
    const root = /::view-transition-(?:old|new)\(root\)\{animation:([a-z-]+)/g
    for (const match of css.matchAll(root)) {
      expect(match[1]).not.toContain('page')
    }
  })

  it('neutralise aussi les transitions de page sous mouvement reduit', () => {
    const reduced = css.slice(css.indexOf('::view-transition-old(root)'))
    expect(reduced).toMatch(
      /@media \(prefers-reduced-motion:reduce\)\{[^}]*::view-transition-old\(root\)/,
    )
  })

  it('ne laisse aucune valeur codee en dur dans les utilitaires de couleur', () => {
    const utility = css.slice(css.indexOf('/* Palette essentielle. */'))
    expect(utility.slice(0, 4000)).not.toMatch(/color:(#|rgb)/i)
  })
})

describe('tokens', () => {
  it('regroupe les echelles sous les prefixes de variables CSS', () => {
    expect(tokens.palette['sky-500']).toBe(palette['sky-500'])
  })

  it('exprime l echelle d espacement en multiples du pas de base', () => {
    expect(tokens.spacing).toBe('0.25rem')
    expect(space[0]).toBe('0')
    expect(space['px']).toBe('1px')
    expect(space[4]).toBe('calc(var(--o-spacing) * 4)')
  })
})
