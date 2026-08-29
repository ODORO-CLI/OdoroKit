/**
 * Lecture d'une couleur de token pour un shader.
 *
 * ## Le chainon manquant
 *
 * La palette est en OKLCH, et c'est un bon choix : la clarte y est perceptuelle,
 * ce qui rend une echelle de nuances reguliere a l'oeil plutot qu'aux nombres.
 * Un shader, lui, veut trois flottants entre zero et un.
 *
 * Sans conversion, tout fond anime finit avec ses couleurs ecrites en dur — et
 * reste alors seul de son espece dans une page qui a change de theme. C'est
 * exactement ce que le niveau 1 du contrat existe pour empecher, et ce que la
 * validation du registre refuse.
 *
 * ## Pourquoi la conversion est faite ici plutot que par le navigateur
 *
 * Le navigateur sait resoudre `var(--o-palette-brand-600)` en une couleur, mais il
 * la rend sous la forme ou elle a ete ecrite : `getComputedStyle` d'une valeur
 * OKLCH rend une chaine OKLCH. Il n'existe pas d'API qui rende trois flottants.
 *
 * Le detour par un canevas — poser la couleur en `fillStyle` et relire — donne
 * un resultat qui depend de la version du navigateur : certains normalisent en
 * `rgb()`, d'autres conservent la notation d'origine. La mathematique, elle, ne
 * change pas.
 *
 * @module
 */

/** Une couleur pour un shader : trois composantes sRGB entre 0 et 1. */
export type ShaderColour = readonly [number, number, number]

/** Noir, employe quand une couleur ne peut pas etre lue. */
const BLACK: ShaderColour = [0, 0, 0]

/**
 * Convertit une couleur OKLCH en sRGB.
 *
 * La chaine de transformation est celle de la specification : OKLCH vers
 * OKLab par coordonnees polaires, OKLab vers un espace de cones, cet espace
 * vers le sRGB lineaire, puis l'encodage gamma.
 *
 * Le resultat est borne a [0, 1]. Une couleur OKLCH peut designer un point
 * hors du gamut sRGB — c'est meme l'un de ses interets — et le shader recevrait
 * sinon des composantes negatives, dont l'effet visuel n'a rien a voir avec la
 * couleur demandee.
 *
 * @param l Clarte perceptuelle, de 0 a 1.
 * @param c Chroma. Zero donne un gris.
 * @param h Teinte, en degres.
 *
 * @example
 * oklchToRgb(1, 0, 0) // [1, 1, 1]
 */
export function oklchToRgb(l: number, c: number, h: number): ShaderColour {
  const radians = (h * Math.PI) / 180
  const a = c * Math.cos(radians)
  const b = c * Math.sin(radians)

  // OKLab vers l'espace des cones. Les coefficients viennent de la definition
  // de l'espace ; les racines cubiques inverses sont les cubes.
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

/** Encodage gamma du sRGB, avec la portion lineaire des valeurs sombres. */
function gammaEncode(value: number): number {
  const clamped = Math.min(1, Math.max(0, value))
  return clamped <= 0.0031308 ? clamped * 12.92 : 1.055 * clamped ** (1 / 2.4) - 0.055
}

/** Nombres d'une notation fonctionnelle, pourcentages resolus. */
function numbers(source: string): number[] {
  const inside = source.slice(source.indexOf('(') + 1, source.lastIndexOf(')'))
  // La composante alpha suit une barre oblique : elle ne nous interesse pas,
  // un shader recevant une couleur opaque.
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
 * Lit une couleur, quelle que soit la notation employee.
 *
 * `oklch()` et `rgb()` sont acceptees : un projet peut avoir surcharge un token
 * avec une couleur ecrite autrement, et refuser sa notation reviendrait a
 * rendre le token inutilisable pour un fond anime.
 *
 * @returns La couleur, ou `null` si la notation n'est pas reconnue.
 *
 * @example
 * parseColour('oklch(0.62 0.21 259)')
 */
export function parseColour(value: string): ShaderColour | null {
  const trimmed = value.trim().toLowerCase()

  if (trimmed.startsWith('oklch(')) {
    const [l, c, h] = numbers(trimmed)
    if (l === undefined || c === undefined || h === undefined) return null
    return oklchToRgb(l, c, h)
  }

  if (trimmed.startsWith('rgb(') || trimmed.startsWith('rgba(')) {
    const [r, g, b] = numbers(trimmed)
    if (r === undefined || g === undefined || b === undefined) return null
    // Les composantes sont donnees sur 255, sauf ecrites en pourcentage —
    // auquel cas `numbers` les a deja ramenees a l'unite.
    const scale = (component: number): number =>
      Math.min(1, Math.max(0, component > 1 ? component / 255 : component))
    return [scale(r), scale(g), scale(b)]
  }

  return null
}

/**
 * Lit la valeur d'un token CSS et la convertit pour un shader.
 *
 * La lecture se fait sur l'element hote plutot que sur la racine : un token
 * redefini dans un conteneur — une section en theme sombre au milieu d'une page
 * claire — doit valoir pour ce qui s'y trouve.
 *
 * @param token Nom de la variable, avec ses deux tirets.
 * @param host Element ou lire. Par defaut, la racine du document.
 * @param fallback Couleur rendue si le token n'existe pas ou n'est pas lisible.
 *
 * @example
 * const primaire = readTokenColour('--o-palette-brand-600', host)
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
