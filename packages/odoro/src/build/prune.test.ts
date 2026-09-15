/**
 * Pruning, and above all what it refuses to remove.
 *
 * ## What these tests hold
 *
 * A pruner is judged on its false negatives. Keeping one rule too many costs a
 * few bytes; removing one too many breaks the display — and that flaw raises no
 * error, fails no application test, and only shows to the eye, page by page,
 * long afterwards.
 *
 * The tests therefore bear first on what must survive: the variables, the
 * reset, the semantic classes, the comma-separated selectors, and the classes
 * only the library components use.
 *
 * @module
 */

import { describe, expect, it } from 'vitest'

import { classesIn, splitSelectors, prune, wordsIn } from './prune.js'

/** Prunes and returns the CSS, to keep the tests light. */
function css(stylesheet: string, sources: string[], options = {}): string {
  return prune(stylesheet, sources, options).css
}

describe('the classes of a selector', () => {
  it('unescapes the variants', () => {
    // `.sm\:o-block` designates the class `sm:o-block`. Comparing without
    // unescaping would never find a match, and pruning would remove everything.
    expect(classesIn('.sm\\:o-block')).toEqual(['sm:o-block'])
    expect(classesIn('.o-w-1\\/2')).toEqual(['o-w-1/2'])
  })

  it('finds the multiple and descendant classes', () => {
    expect(classesIn('.o-a.o-b')).toEqual(['o-a', 'o-b'])
    expect(classesIn('.dark .o-bg-x')).toEqual(['dark', 'o-bg-x'])
  })

  it('does not mistake a decimal point for a class', () => {
    expect(classesIn(':root')).toEqual([])
    expect(classesIn('*, *::before')).toEqual([])
  })
})

describe('the splitting of selectors', () => {
  it('cuts on the top-level commas', () => {
    expect(splitSelectors('.a, .b , .c')).toEqual(['.a', '.b', '.c'])
  })

  it('does not cut inside a functional pseudo-class', () => {
    // Cutting inside `:is(a, b)` would produce two truncated selectors, hence
    // invalid ones, hence ignored by the browser — a rule lost in silence.
    expect(splitSelectors(':is(.a, .b) .c')).toEqual([':is(.a, .b) .c'])
    expect(splitSelectors('.x:not(.a, .b), .y')).toEqual(['.x:not(.a, .b)', '.y'])
  })

  it('does not cut inside an attribute or a string', () => {
    expect(splitSelectors('[data-x="a,b"], .y')).toEqual(['[data-x="a,b"]', '.y'])
  })
})

describe('what is never pruned', () => {
  it('keeps the variables', () => {
    const output = css(':root{--o-space-1:4px}\n.o-flex{display:flex}', ['nothing'])
    expect(output).toContain('--o-space-1')
  })

  it('keeps the reset', () => {
    const output = css('*,*::before{box-sizing:border-box}\n.o-flex{display:flex}', [''])
    expect(output).toContain('box-sizing')
  })

  it('keeps the semantic classes of the application', () => {
    // They do not carry the prefix: the pruner has no reason to believe it
    // generated them, and must therefore not touch them.
    const output = css('.legal__p{margin:1rem}\n.o-flex{display:flex}', [''])
    expect(output).toContain('legal__p')
  })

  it('keeps the @keyframes without walking into them', () => {
    // Their body looks like rules (`from`, `50%`) without being any: walking
    // into it would amount to pruning animation steps.
    const output = css('@keyframes o-spin{from{transform:rotate(0)}}', [''])
    expect(output).toContain('@keyframes o-spin')
    expect(output).toContain('rotate(0)')
  })

  it('keeps a rule all of whose classes are used', () => {
    expect(css('.o-a.o-b{color:red}', ['o-a o-b'])).toContain('color:red')
  })
})

describe('what is pruned', () => {
  it('removes a utility nothing uses', () => {
    const output = css('.o-flex{display:flex}\n.o-grid{display:grid}', ['o-flex'])
    expect(output).toContain('display:flex')
    expect(output).not.toContain('display:grid')
  })

  it('removes a rule as soon as a single one of its classes is missing', () => {
    // `.o-a.o-b` only applies to elements carrying both: keeping it without
    // `o-b` existing would be keeping useless weight.
    expect(css('.o-a.o-b{color:red}', ['o-a'])).not.toContain('color:red')
  })

  it('keeps only the useful selectors of a list', () => {
    const output = css('.o-flex,.o-grid{margin:0}', ['o-flex'])
    expect(output).toContain('.o-flex')
    expect(output).not.toContain('.o-grid')
  })

  it('removes the media queries that became empty', () => {
    // Without that, a pruned stylesheet would leave thousands of
    // `@media(...){}`.
    const output = css('@media (min-width:640px){.sm\\:o-grid{display:grid}}', [''])
    expect(output).not.toContain('@media')
  })

  it('keeps a media query one of whose children survives', () => {
    const output = css(
      '@media (min-width:640px){.sm\\:o-grid{display:grid}\n.sm\\:o-flex{display:flex}}',
      ['sm:o-flex'],
    )
    expect(output).toContain('@media')
    expect(output).toContain('display:flex')
    expect(output).not.toContain('display:grid')
  })
})

describe('the sources read', () => {
  it('find a class only a library component uses', () => {
    // The central trap. The application writes no utility class; its button
    // carries some. Reading the application source alone would prune away
    // everything its components need, without raising a single error.
    const producedJs = 'var Button=({size:e})=>o("button",{className:"o-h-10 o-px-4"})'
    const output = css('.o-h-10{height:2.5rem}\n.o-h-12{height:3rem}', [producedJs])

    expect(output).toContain('2.5rem')
    expect(output).not.toContain('3rem')
  })

  it('find a variant class inside a string', () => {
    const output = css('@media (min-width:640px){.sm\\:o-flex{display:flex}}', [
      'className="sm:o-flex"',
    ])
    expect(output).toContain('display:flex')
  })
})

describe('the safelist', () => {
  it('keeps a class assembled at runtime', () => {
    // `o-text-${color}` exists nowhere in its final form: no analyser can guess
    // it, and that is the accepted limit of the technique.
    const stylesheet = '.o-text-red{color:red}\n.o-text-blue{color:blue}'

    expect(css(stylesheet, [''])).toBe('')
    expect(css(stylesheet, [''], { safelist: [/^o-text-/] })).toContain('color:red')
    expect(css(stylesheet, [''], { safelist: ['o-text-blue'] })).toContain('color:blue')
  })
})

describe('the parsing holds up', () => {
  it('against a brace inside a string', () => {
    // A naive split would derail here and truncate the stylesheet in the middle
    // of a rule.
    const output = css('.o-before::before{content:"}"}\n.o-flex{display:flex}', [
      'o-before o-flex',
    ])
    expect(output).toContain('display:flex')
    expect(output).toContain('content:"}"')
  })

  it('against a brace inside a comment', () => {
    const output = css('/* } */\n.o-flex{display:flex}', ['o-flex'])
    expect(output).toContain('display:flex')
  })

  it('against nested media queries', () => {
    const output = css('@media screen{@supports (display:grid){.o-grid{display:grid}}}', [
      'o-grid',
    ])
    expect(output).toContain('display:grid')
    expect(output).toContain('@supports')
  })

  it('keeps the rules without a body', () => {
    const output = css('@charset "utf-8";\n.o-flex{display:flex}', ['o-flex'])
    expect(output).toContain('@charset')
  })
})

describe('the report', () => {
  it('counts what is kept and what goes', () => {
    const report = prune('.o-a{color:red}\n.o-b{color:blue}\n.o-c{color:green}', [
      'o-a o-b',
    ])

    expect(report.kept).toBe(2)
    expect(report.removed).toBe(1)
    expect(report.bytesAfter).toBeLessThan(report.bytesBefore)
  })
})

describe('the word extraction', () => {
  it('recognises the shapes a class can take', () => {
    const words = wordsIn('"hover:o-bg-x o-w-1/2 o-p-[3px]"')
    expect(words.has('hover:o-bg-x')).toBe(true)
    expect(words.has('o-w-1/2')).toBe(true)
    expect(words.has('o-p-[3px]')).toBe(true)
  })
})
