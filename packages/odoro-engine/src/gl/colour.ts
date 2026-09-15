/**
 * Reading a token colour for a shader.
 *
 * ## The missing link
 *
 * The palette is in OKLCH, and that is a good choice: lightness there is
 * perceptual, which makes a scale of shades regular to the eye rather than to
 * the numbers. A shader, on the other hand, wants three floats between zero
 * and one.
 *
 * Without conversion, every animated background ends up with its colours
 * hard-coded — and then stands alone of its kind on a page that has changed
 * theme. That is exactly what level 1 of the contract exists to prevent, and
 * what the registry validation refuses.
 *
 * ## Why the conversion is done here rather than by the browser
 *
 * The browser knows how to resolve `var(--o-palette-brand-600)` into a colour,
 * but it returns it in the form in which it was written: `getComputedStyle` of
 * an OKLCH value returns an OKLCH string. There is no API that returns three
 * floats.
 *
 * The detour through a canvas — setting the colour as `fillStyle` and reading
 * it back — gives a result that depends on the browser version: some normalise
 * to `rgb()`, others keep the original notation. The mathematics, on the other
 * hand, does not change.
 *
 * @module
 */

/** A colour for a shader: three sRGB components between 0 and 1. */
export type ShaderColour = readonly [number, number, number]

/** Black, used when a colour cannot be read. */
const BLACK: ShaderColour = [0, 0, 0]

/**
 * Converts an OKLCH colour to sRGB.
 *
 * The transformation chain is the one from the specification: OKLCH to OKLab
 * by polar coordinates, OKLab to a cone space, that space to linear sRGB, then
 * the gamma encoding.
 *
 * The result is clamped to [0, 1]. An OKLCH colour can designate a point
 * outside the sRGB gamut — that is even one of its points — and the shader
 * would otherwise receive negative components, whose visual effect has nothing
 * to do with the requested colour.
 *
 * @param l Perceptual lightness, from 0 to 1.
 * @param c Chroma. Zero gives a grey.
 * @param h Hue, in degrees.
 *
 * @example
 * oklchToRgb(1, 0, 0) // [1, 1, 1]
 */
export function oklchToRgb(l: number, c: number, h: number): ShaderColour {
  const radians = (h * Math.PI) / 180
  const a = c * Math.cos(radians)
  const b = c * Math.sin(radians)

  // OKLab to the cone space. The coefficients come from the definition of the
  // space; the inverse cube roots are the cubes.
  const lCone = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const mCone = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const sCone = (l - 0.0894841775 * a - 1.291485548 * b) ** 3

  const linear: [number, number, number] = [
    4.0767416621 * lCone - 3.3077115913 * mCone + 0.2309699292 * sCone,
    -1.2684380046 * lCone + 2.6097574011 * mCone - 0.3413193965 * sCone,
    -0.0041960863 * lCone - 0.7034186147 * mCone + 1.707614701 * sCone,
  ]

  return linear.map(gammaEncode) as unknown as ShaderColour
}

/** sRGB gamma encoding, with the linear portion for dark values. */
function gammaEncode(value: number): number {
  const clamped = Math.min(1, Math.max(0, value))
  return clamped <= 0.0031308 ? clamped * 12.92 : 1.055 * clamped ** (1 / 2.4) - 0.055
}

/** Numbers of a functional notation, percentages resolved. */
function numbers(source: string): number[] {
  const inside = source.slice(source.indexOf('(') + 1, source.lastIndexOf(')'))
  // The alpha component follows a slash: it does not interest us, since a
  // shader receives an opaque colour.
  const [components] = inside.split('/')

  return (components ?? '')
    .trim()
    .split(/[\s,]+/)
    .filter((part) => part !== '')
    .map((part) =>
      part.endsWith('%') ? Number.parseFloat(part) / 100 : Number.parseFloat(part),
    )
    .filter((value) => Number.isFinite(value))
}

/**
 * Reads a colour, whatever notation is used.
 *
 * `oklch()` and `rgb()` are accepted: a project may have overridden a token
 * with a colour written differently, and refusing its notation would amount to
 * making the token unusable for an animated background.
 *
 * @returns The colour, or `null` if the notation is not recognised.
 *
 * @example
 * parseColour('oklch(0.62 0.21 259)')
 */
export function parseColour(value: string): ShaderColour | null {
  // A grey has no hue: the browser then serialises the component as `none` —
  // `oklch(98.5% 0 none)`. It counts as zero for the computation.
  const trimmed = value
    .trim()
    .toLowerCase()
    .replace(/\bnone\b/g, '0')

  if (trimmed.startsWith('#')) {
    const hex = trimmed.slice(1)
    const wide =
      hex.length === 3 || hex.length === 4 ? [...hex].map((c) => c + c).join('') : hex
    if (!/^[0-9a-f]{6}([0-9a-f]{2})?$/.test(wide)) return null
    const channel = (at: number): number => parseInt(wide.slice(at, at + 2), 16) / 255
    return [channel(0), channel(2), channel(4)]
  }

  if (trimmed.startsWith('oklch(')) {
    const [l, c, h] = numbers(trimmed)
    if (l === undefined || c === undefined || h === undefined) return null
    return oklchToRgb(l, c, h)
  }

  if (trimmed.startsWith('rgb(') || trimmed.startsWith('rgba(')) {
    const [r, g, b] = numbers(trimmed)
    if (r === undefined || g === undefined || b === undefined) return null
    // The components are given out of 255, unless written as percentages — in
    // which case `numbers` has already brought them back to unity.
    const scale = (component: number): number =>
      Math.min(1, Math.max(0, component > 1 ? component / 255 : component))
    return [scale(r), scale(g), scale(b)]
  }

  return null
}

/**
 * Reads the value of a CSS token and converts it for a shader.
 *
 * The reading is done on the host element rather than on the root: a token
 * redefined inside a container — a dark-theme section in the middle of a light
 * page — must hold for what is inside it.
 *
 * @param token Name of the variable, with its two dashes.
 * @param host Element to read from. Defaults to the root of the document.
 * @param fallback Colour returned if the token does not exist or is not
 * readable.
 *
 * @example
 * const primary = readTokenColour('--o-palette-brand-600', host)
 */
export function readTokenColour(
  token: string,
  host?: Element | null,
  fallback: ShaderColour = BLACK,
): ShaderColour {
  if (typeof window === 'undefined') return fallback

  const element = host ?? document.documentElement
  const raw = window.getComputedStyle(element).getPropertyValue(token)
  if (raw.trim() === '') return fallback

  return parseColour(raw) ?? fallback
}
