import { describe, expect, it } from 'vitest'

import { oklchToRgb, parseColour, readTokenColour } from './colour.js'

/** Compares two colours to the tolerance of half a quantum on 8 bits. */
function close(
  actual: readonly [number, number, number],
  expected: readonly [number, number, number],
): void {
  for (const [index, value] of actual.entries()) {
    expect(value).toBeCloseTo(expected[index] ?? 0, 2)
  }
}

describe('OKLCH conversion', () => {
  it('returns white for full lightness without chroma', () => {
    close(oklchToRgb(1, 0, 0), [1, 1, 1])
  })

  it('returns black for zero lightness', () => {
    close(oklchToRgb(0, 0, 0), [0, 0, 0])
  })

  it('returns a neutral grey without chroma', () => {
    // Without chroma, the three components must be equal whatever the hue:
    // that is the definition of a grey.
    const [r, g, b] = oklchToRgb(0.5, 0, 210)
    expect(r).toBeCloseTo(g, 4)
    expect(g).toBeCloseTo(b, 4)
  })

  it('returns a saturated red for the hue of red', () => {
    const [r, g, b] = oklchToRgb(0.628, 0.2577, 29.23)
    expect(r).toBeGreaterThan(0.9)
    expect(g).toBeLessThan(0.2)
    expect(b).toBeLessThan(0.2)
  })

  it('clamps a colour outside the sRGB gamut', () => {
    // OKLCH can designate a point that sRGB does not contain. Without
    // clamping, the shader would receive negative components, whose effect has
    // nothing to do with the requested colour.
    for (const value of oklchToRgb(0.7, 0.4, 150)) {
      expect(value).toBeGreaterThanOrEqual(0)
      expect(value).toBeLessThanOrEqual(1)
    }
  })
})

describe('reading a notation', () => {
  it('reads an oklch notation', () => {
    close(parseColour('oklch(1 0 0)') ?? [0, 0, 0], [1, 1, 1])
  })

  it('accepts an alpha component and ignores it', () => {
    // A shader receives an opaque colour: the alpha belongs to the
    // compositing, not to the hue.
    close(parseColour('oklch(1 0 0 / 0.5)') ?? [0, 0, 0], [1, 1, 1])
  })

  it('accepts a lightness as a percentage', () => {
    close(parseColour('oklch(100% 0 0)') ?? [0, 0, 0], [1, 1, 1])
  })

  it('reads an rgb notation out of 255', () => {
    close(parseColour('rgb(255 128 0)') ?? [0, 0, 0], [1, 128 / 255, 0])
  })

  it('accepts the commas of an older notation', () => {
    close(parseColour('rgba(255, 0, 0, 0.5)') ?? [0, 0, 0], [1, 0, 0])
  })

  it('refuses an unknown notation rather than inventing one', () => {
    expect(parseColour('rebeccapurple')).toBeNull()
    expect(parseColour('')).toBeNull()
    expect(parseColour('oklch()')).toBeNull()
  })
})

describe('reading a token', () => {
  it('reads the value set on an element', () => {
    const host = document.createElement('div')
    host.style.setProperty('--o-color-test', 'rgb(255 0 0)')
    document.body.append(host)

    close(readTokenColour('--o-color-test', host), [1, 0, 0])
    host.remove()
  })

  it('returns the fallback when the token does not exist', () => {
    // A background whose colour is missing must stay renderable: it is the
    // fallback that decides what is seen, not an exception on mount.
    expect(readTokenColour('--o-absent', document.body, [0.5, 0.5, 0.5])).toEqual([
      0.5, 0.5, 0.5,
    ])
  })

  it('returns the fallback when the value is unreadable', () => {
    const host = document.createElement('div')
    host.style.setProperty('--o-color-test', 'not-a-colour')
    document.body.append(host)

    expect(readTokenColour('--o-color-test', host, [1, 1, 1])).toEqual([1, 1, 1])
    host.remove()
  })
})

describe('the shapes the browser returns', () => {
  const close = (got: readonly number[], want: readonly number[]): void => {
    for (const [index, value] of want.entries()) expect(got[index]).toBeCloseTo(value, 2)
  }

  it('reads a grey whose hue is serialised as none', () => {
    // Chrome serialises `oklch(98.5% 0 0)` as `oklch(98.5% 0 none)`.
    close(parseColour('oklch(100% 0 none)') ?? [0, 0, 0], [1, 1, 1])
    expect(parseColour('oklch(0% 0 none)')).not.toBeNull()
  })

  it('reads a hexadecimal colour, short or long', () => {
    close(parseColour('#fff') ?? [0, 0, 0], [1, 1, 1])
    close(parseColour('#f97316') ?? [0, 0, 0], [249 / 255, 115 / 255, 22 / 255])
    expect(parseColour('#12')).toBeNull()
  })
})
