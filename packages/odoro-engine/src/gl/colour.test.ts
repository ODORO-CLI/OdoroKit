import { describe, expect, it } from 'vitest'

import { oklchToRgb, parseColour, readTokenColour } from './colour.js'

/** Compare deux couleurs a la tolerance d'un demi-quantum sur 8 bits. */
function proche(
  actual: readonly [number, number, number],
  expected: readonly [number, number, number],
): void {
  for (const [index, value] of actual.entries()) {
    expect(value).toBeCloseTo(expected[index] ?? 0, 2)
  }
}

describe('conversion OKLCH', () => {
  it('rend du blanc pour une clarte pleine sans chroma', () => {
    proche(oklchToRgb(1, 0, 0), [1, 1, 1])
  })

  it('rend du noir pour une clarte nulle', () => {
    proche(oklchToRgb(0, 0, 0), [0, 0, 0])
  })

  it('rend un gris neutre sans chroma', () => {
    // Sans chroma, les trois composantes doivent etre egales quelle que soit
    // la teinte : c'est la definition d'un gris.
    const [r, g, b] = oklchToRgb(0.5, 0, 210)
    expect(r).toBeCloseTo(g, 4)
    expect(g).toBeCloseTo(b, 4)
  })

  it('rend un rouge sature pour la teinte du rouge', () => {
    const [r, g, b] = oklchToRgb(0.628, 0.2577, 29.23)
    expect(r).toBeGreaterThan(0.9)
    expect(g).toBeLessThan(0.2)
    expect(b).toBeLessThan(0.2)
  })

  it('borne une couleur hors du gamut sRGB', () => {
    // OKLCH peut designer un point que le sRGB ne contient pas. Sans bornage,
    // le shader recevrait des composantes negatives, dont l'effet n'a rien a
    // voir avec la couleur demandee.
    for (const value of oklchToRgb(0.7, 0.4, 150)) {
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThanOrEqual(1)
    }
  })
})

describe('lecture d une notation', () => {
  it('lit une notation oklch', () => {
    proche(parseColour('oklch(1 0 0)') ?? [0, 0, 0], [1, 1, 1])
  })

  it('accepte une composante alpha et l ignore', () => {
    // Un shader recoit une couleur opaque : l'alpha appartient a la
    // composition, pas a la teinte.
    proche(parseColour('oklch(1 0 0 / 0.5)') ?? [0, 0, 0], [1, 1, 1])
  })

  it('accepte une clarte en pourcentage', () => {
    proche(parseColour('oklch(100% 0 0)') ?? [0, 0, 0], [1, 1, 1])
  })

  it('lit une notation rgb sur 255', () => {
    proche(parseColour('rgb(255 128 0)') ?? [0, 0, 0], [1, 128 / 255, 0])
  })

  it('accepte les virgules d une notation ancienne', () => {
    proche(parseColour('rgba(255, 0, 0, 0.5)') ?? [0, 0, 0], [1, 0, 0])
  })

  it('refuse une notation inconnue plutot que d inventer', () => {
    expect(parseColour('rebeccapurple')).toBeNull()
    expect(parseColour('')).toBeNull()
    expect(parseColour('oklch()')).toBeNull()
  })
})

describe('lecture d un token', () => {
  it('lit la valeur posee sur un element', () => {
    const host = document.createElement('div')
    host.style.setProperty('--o-color-test', 'rgb(255 0 0)')
    document.body.append(host)

    proche(readTokenColour('--o-color-test', host), [1, 0, 0])
    host.remove()
  })

  it('rend le repli quand le token n existe pas', () => {
    // Un fond dont la couleur manque doit rester rendable : c'est le repli
    // qui decide de ce qu'on voit, pas une exception au montage.
    expect(readTokenColour('--o-absent', document.body, [0.5, 0.5, 0.5])).toEqual([
      0.5, 0.5, 0.5,
    ])
  })

  it('rend le repli quand la valeur est illisible', () => {
    const host = document.createElement('div')
    host.style.setProperty('--o-color-test', 'pas-une-couleur')
    document.body.append(host)

    expect(readTokenColour('--o-color-test', host, [1, 1, 1])).toEqual([1, 1, 1])
    host.remove()
  })
})
