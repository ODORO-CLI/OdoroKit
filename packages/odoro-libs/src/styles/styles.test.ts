import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

import { describe, expect, it } from 'vitest'

import { generate, renderClassNamesModule, renderCss } from './generator.js'
import {
  ODORO_CLASS_NAMES,
  ODORO_CORE_CLASS_NAMES,
  ODORO_EXTENDED_CLASS_NAMES,
} from './generated/classNames.js'
import { cx, variants } from './cx.js'
import { palette, space, tokens } from './tokens.js'

const GENERATED_DIR = join(dirname(fileURLToPath(import.meta.url)), 'generated')

describe('cx', () => {
  it('concatenates strings', () => {
    expect(cx('o-flex', 'o-gap-2')).toBe('o-flex o-gap-2')
  })

  it('ignores empty values', () => {
    expect(cx('o-flex', null, undefined, false, '')).toBe('o-flex')
  })

  it('keeps the truthy keys of an object', () => {
    expect(cx({ 'o-flex': true, 'o-hidden': false, 'o-p-4': 1 })).toBe('o-flex o-p-4')
  })

  it('flattens nested arrays', () => {
    expect(cx(['o-flex', ['o-gap-2', { 'o-p-4': true }]])).toBe('o-flex o-gap-2 o-p-4')
  })

  it('accepts numbers', () => {
    expect(cx(0, 1, 'o-flex')).toBe('0 1 o-flex')
  })

  it('returns an empty string with no useful input', () => {
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

  it('applies the default values', () => {
    expect(button()).toBe(
      'o-inline-flex o-rounded-md o-bg-brand-600 dark:o-bg-brand-400 o-px-4',
    )
  })

  it('replaces a supplied variant', () => {
    expect(button({ tone: 'ghost' })).toBe(
      'o-inline-flex o-rounded-md o-bg-white dark:o-bg-zinc-900 o-px-4',
    )
  })

  it('adds the application classes last', () => {
    expect(button({ className: 'o-w-full' })).toContain('o-w-full')
    expect(button({ className: 'o-w-full' }).endsWith('o-w-full')).toBe(true)
  })

  it('falls back on the default value for null as for undefined', () => {
    expect(button({ tone: null })).toBe(button())
    expect(button({ tone: undefined })).toBe(button())
  })

  it('works with no declared variant', () => {
    expect(variants({ base: 'o-flex' })()).toBe('o-flex')
  })
})

describe('generated artifacts', () => {
  it('the base stylesheet on disk matches the current tokens', () => {
    const onDisk = readFileSync(join(GENERATED_DIR, 'odoro.css'), 'utf8')
    // If this test fails, run `pnpm --filter @odoro-cli/libs build:css` again.
    expect(onDisk).toBe(renderCss('core'))
  })

  it('the complete stylesheet on disk matches the current tokens', () => {
    const onDisk = readFileSync(join(GENERATED_DIR, 'odoro.full.css'), 'utf8')
    expect(onDisk).toBe(renderCss('full'))
  })

  it('the class list on disk matches the current tokens', () => {
    const onDisk = readFileSync(join(GENERATED_DIR, 'classNames.ts'), 'utf8')
    expect(onDisk).toBe(renderClassNamesModule())
  })

  it('produces no duplicate class name', () => {
    expect(new Set(ODORO_CLASS_NAMES).size).toBe(ODORO_CLASS_NAMES.length)
  })

  it('keeps the two tiers strictly apart', () => {
    const core = new Set<string>(ODORO_CORE_CLASS_NAMES)
    for (const name of ODORO_EXTENDED_CLASS_NAMES) {
      expect(core.has(name)).toBe(false)
    }
    expect(ODORO_CLASS_NAMES.length).toBe(
      ODORO_CORE_CLASS_NAMES.length + ODORO_EXTENDED_CLASS_NAMES.length,
    )
  })

  it('keeps the base stylesheet under the drift threshold', () => {
    // Guard rail: the base stylesheet must not absorb the raw palette, or
    // the split into two tiers would lose all of its point. The extended tier
    // must stay a substantial surcharge of the complete stylesheet.
    const core = readFileSync(join(GENERATED_DIR, 'odoro.css'), 'utf8')
    const full = readFileSync(join(GENERATED_DIR, 'odoro.full.css'), 'utf8')
    expect(core.length).toBeLessThan(1_800_000)
    expect(full.length - core.length).toBeGreaterThan(300_000)
  })
})

describe('produced stylesheet', () => {
  const { css } = generate('full')

  it('declares a variable for every spacing step', () => {
    for (const key of Object.keys(space)) {
      expect(css).toContain(`--o-space-${key.replace('.', '_')}:`)
    }
  })

  it('declares a variable for every color of the palette', () => {
    for (const key of Object.keys(palette)) {
      expect(css).toContain(`--o-palette-${key}:`)
    }
  })

  it('declares no semantic color any more', () => {
    // The role layer has been removed: a color is named by its place in the
    // palette, never by what it is used for.
    expect(css).not.toMatch(/--o-color-[a-z]/)
  })

  it('crosses the theme with every state', () => {
    // With no semantic variable, an interactive component can have two
    // themes only if `dark:` composes with `hover:`.
    expect(css).toContain('.dark\\:hover\\:o-bg-zinc-800')
  })

  it('uses valid CSS variable names only', () => {
    const declared = [...css.matchAll(/--o-[a-z0-9-]+(?:_[0-9]+)?(?=:)/g)].map(
      (m) => m[0],
    )
    expect(declared.length).toBeGreaterThan(0)
    for (const name of declared) {
      expect(name).toMatch(/^--o-[a-z0-9_-]+$/)
    }
  })

  it('escapes the colons of the variant selectors', () => {
    expect(css).toContain('.md\\:o-flex')
    expect(css).toContain('.hover\\:o-bg-brand-600')
  })

  it('generates the dark theme as a system preference and as an explicit choice', () => {
    expect(css).toMatch(/@media \(prefers-color-scheme: ?dark\)/)
    expect(css).toContain(':root[data-theme="dark"]')
    // The theme variables switch with the document.
    expect(css).toContain('--o-theme-bg: var(--o-palette-zinc-50)')
    expect(css).toContain('--o-theme-bg:var(--o-palette-zinc-950)')
  })

  it('neutralizes the animations under prefers-reduced-motion', () => {
    expect(css).toContain('@media (prefers-reduced-motion:reduce)')
  })

  it('dresses the page transitions that the router triggers', () => {
    // Without these rules, the browser applies its default 90 ms fade: the
    // transition does happen, but it cannot be seen.
    expect(css).toContain('::view-transition-old(root)')
    expect(css).toContain('::view-transition-new(root)')
    expect(css).toContain('::view-transition-old(o-page)')
    expect(css).toContain('::view-transition-new(o-page)')
  })

  it('reserves the move for the named region, never for the root', () => {
    // The header and the footer stay in the root group: seeing them slide
    // when they have not changed would be a flaw.
    const root = /::view-transition-(?:old|new)\(root\)\{animation:([a-z-]+)/g
    for (const match of css.matchAll(root)) {
      expect(match[1]).not.toContain('page')
    }
  })

  it('neutralizes the page transitions under reduced motion too', () => {
    const reduced = css.slice(css.indexOf('::view-transition-old(root)'))
    expect(reduced).toMatch(
      /@media \(prefers-reduced-motion:reduce\)\{[^}]*::view-transition-old\(root\)/,
    )
  })

  it('leaves no hard-coded value in the color utilities', () => {
    const utility = css.slice(css.indexOf('/* Essential palette. */'))
    expect(utility.slice(0, 4000)).not.toMatch(/color:(#|rgb)/i)
  })
})

describe('tokens', () => {
  it('groups the scales under the CSS variable prefixes', () => {
    expect(tokens.palette['sky-500']).toBe(palette['sky-500'])
  })

  it('expresses the spacing scale in multiples of the base step', () => {
    expect(tokens.spacing).toBe('0.25rem')
    expect(space[0]).toBe('0')
    expect(space['px']).toBe('1px')
    expect(space[4]).toBe('calc(var(--o-spacing) * 4)')
  })
})
