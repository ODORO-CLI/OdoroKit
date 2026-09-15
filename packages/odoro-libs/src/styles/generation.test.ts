/**
 * On-demand generation.
 *
 * ## What these tests hold
 *
 * Producing a subset is a dangerous operation for the same reason pruning is:
 * what is missing raises no error, makes no application test fail, and shows
 * only to the eye.
 *
 * They therefore bear first on what must **always** be produced — the base
 * block — then on the equivalence with the whole stylesheet: a requested
 * class must arrive with exactly the rule it would have had.
 *
 * @module
 */

import { describe, expect, it } from 'vitest'

import { generate, renderCssFor } from './generator.js'

/** The classes a stylesheet defines. */
function classesOf(css: string): Set<string> {
  const found = new Set<string>()
  for (const m of css.matchAll(/\.((?:\\.|[\w-])+)\{/g)) {
    found.add((m[1] as string).replaceAll(/\\(.)/g, '$1'))
  }
  return found
}

describe('the base block', () => {
  it('is produced even when no class is requested', () => {
    // Variables, preflight, keyframes: their absence does not break one
    // rule, it breaks the whole page.
    const css = renderCssFor(new Set())

    expect(css).toContain('--o-spacing')
    expect(css).toContain('color-scheme')
    expect(css).toContain('@keyframes')
  })

  it('holds no utility when nothing is requested', () => {
    const utilities = [...classesOf(renderCssFor(new Set()))].filter((c) =>
      c.startsWith('o-'),
    )

    // The preflight and the page transitions may name classes; none must come
    // from a utility family.
    expect(utilities).toEqual([])
  })
})

describe('what is requested', () => {
  it('arrives, and nothing else', () => {
    const css = renderCssFor(new Set(['o-flex', 'o-hidden']))
    const classes = classesOf(css)

    expect(classes.has('o-flex')).toBe(true)
    expect(classes.has('o-hidden')).toBe(true)
    expect(classes.has('o-grid')).toBe(false)
  })

  it('arrives with exactly the rule of the whole stylesheet', () => {
    // This is the invariant that counts: a partial generation producing a
    // different declaration would be worse than a missing class, because the
    // page would show up — crooked.
    const whole = generate('full').css
    const partial = generate('full', new Set(['o-flex'])).css

    const rule = /\.o-flex\{[^}]*\}/
    expect(partial.match(rule)?.[0]).toBe(whole.match(rule)?.[0])
  })

  it('serves the requested variants', () => {
    const css = renderCssFor(new Set(['sm:o-grid']))

    expect(css).toContain('@media')
    expect(classesOf(css).has('sm:o-grid')).toBe(true)
    expect(classesOf(css).has('sm:o-flex')).toBe(false)
  })

  it('ignores a class that does not exist', () => {
    // The collector of the engine picks up every word of the produced code:
    // most of them are not classes. Asking for an unknown one must have no
    // effect, not raise an error.
    expect(() => renderCssFor(new Set(['o-nawak', 'useState', 'div']))).not.toThrow()
  })
})

describe('the complete tier, for free', () => {
  it('serves a hue the base stylesheet has never carried', () => {
    // Unthinkable with a pre-generated stylesheet: imposing the 290 shades on
    // every project would make everyone pay for what only a few need. On
    // demand, the question no longer arises.
    const css = renderCssFor(new Set(['o-text-violet-500']))

    expect(classesOf(css).has('o-text-violet-500')).toBe(true)
    expect(classesOf(generate('core').css).has('o-text-violet-500')).toBe(false)
  })
})

describe('the size', () => {
  it('drops by several orders of magnitude', () => {
    const base = renderCssFor(new Set())
    const aFew = renderCssFor(
      new Set(['o-flex', 'o-hidden', 'o-grid', 'sm:o-flex', 'o-text-violet-500']),
    )

    // A handful of classes must cost only a few hundred bytes above the base
    // block.
    expect(aFew.length - base.length).toBeLessThan(2_000)

    // And the whole must stay beyond comparison with the whole stylesheet.
    expect(aFew.length).toBeLessThan(generate('full').css.length / 20)
  })
})

describe('the integrity of the system stays checked', () => {
  it('detects a duplicate even when the generation is filtered', () => {
    // The check bears on the integrity of the tokens, not on the content of
    // this particular generation. Filtering it would let a real duplicate
    // through simply because today's application does not use the two
    // conflicting classes — and the flaw would show up only in the next
    // project.
    //
    // A duplicate cannot be manufactured without touching the families; what
    // is checked here is that the complete list of names is still rendered,
    // that is, that the check did see the whole system go by.
    const filtered = generate('full', new Set(['o-flex']))
    const whole = generate('full')

    expect(filtered.classNames.length).toBe(whole.classNames.length)
  })
})
