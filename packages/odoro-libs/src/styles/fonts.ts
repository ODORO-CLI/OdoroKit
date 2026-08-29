/**
 * Chargement de polices Google Fonts par CDN.
 *
 * Les fichiers de police ne sont **jamais embarques** dans le bundle : ce
 * module construit l'URL `css2` officielle et injecte les balises `<link>`
 * dans le document — preconnexions comprises. Le navigateur telecharge alors
 * les graisses reellement utilisees, en WOFF2 decoupe par plages Unicode,
 * depuis le CDN de Google. C'est la voie la plus legere : quelques centaines
 * d'octets de CSS cote application, le reste en cache partage.
 *
 * Le registre {@link GOOGLE_FONTS} recense les familles les plus utilisees
 * pour offrir l'autocompletion et la bonne pile de repli ; **toute** famille
 * du catalogue Google Fonts reste acceptee en chaine libre.
 *
 * @example
 * import { loadGoogleFonts, applyFontFamily } from '@odoro-cli/libs/styles'
 *
 * loadGoogleFonts([
 *   { family: 'Inter', weights: [400, 500, 700] },
 *   { family: 'JetBrains Mono' },
 * ])
 * applyFontFamily('sans', 'Inter')
 *
 * @module
 */

/** Categorie typographique d'une famille, au sens du catalogue Google Fonts. */
export type GoogleFontCategory =
  'sans-serif' | 'serif' | 'display' | 'handwriting' | 'monospace'

/**
 * Familles recensees du catalogue Google Fonts, avec leur categorie.
 *
 * La categorie determine la pile de repli generee par {@link fontStack} : le
 * texte reste lisible pendant le chargement, et le reste si le CDN est
 * inaccessible.
 */
export const GOOGLE_FONTS = {
  // Sans-serif.
  Inter: 'sans-serif',
  Roboto: 'sans-serif',
  'Open Sans': 'sans-serif',
  Lato: 'sans-serif',
  Montserrat: 'sans-serif',
  Poppins: 'sans-serif',
  Nunito: 'sans-serif',
  'Nunito Sans': 'sans-serif',
  Raleway: 'sans-serif',
  'Work Sans': 'sans-serif',
  Rubik: 'sans-serif',
  'DM Sans': 'sans-serif',
  Manrope: 'sans-serif',
  Outfit: 'sans-serif',
  Sora: 'sans-serif',
  Figtree: 'sans-serif',
  Karla: 'sans-serif',
  Mulish: 'sans-serif',
  Urbanist: 'sans-serif',
  Barlow: 'sans-serif',
  Cabin: 'sans-serif',
  'Josefin Sans': 'sans-serif',
  Quicksand: 'sans-serif',
  Lexend: 'sans-serif',
  'Plus Jakarta Sans': 'sans-serif',
  'Public Sans': 'sans-serif',
  'Space Grotesk': 'sans-serif',
  'IBM Plex Sans': 'sans-serif',
  'Source Sans 3': 'sans-serif',
  'Noto Sans': 'sans-serif',
  'PT Sans': 'sans-serif',
  Oswald: 'sans-serif',
  Archivo: 'sans-serif',
  'Exo 2': 'sans-serif',
  Chivo: 'sans-serif',
  Heebo: 'sans-serif',
  Assistant: 'sans-serif',
  Jost: 'sans-serif',
  Kanit: 'sans-serif',
  Onest: 'sans-serif',
  'Albert Sans': 'sans-serif',
  'Instrument Sans': 'sans-serif',
  'Schibsted Grotesk': 'sans-serif',
  // Serif.
  'Playfair Display': 'serif',
  Merriweather: 'serif',
  Lora: 'serif',
  'PT Serif': 'serif',
  'Crimson Text': 'serif',
  'Libre Baskerville': 'serif',
  'EB Garamond': 'serif',
  'Cormorant Garamond': 'serif',
  Bitter: 'serif',
  'Source Serif 4': 'serif',
  'Noto Serif': 'serif',
  'DM Serif Display': 'serif',
  Fraunces: 'serif',
  Spectral: 'serif',
  Literata: 'serif',
  'Zilla Slab': 'serif',
  'Roboto Slab': 'serif',
  Arvo: 'serif',
  'Instrument Serif': 'serif',
  // Monospace.
  'JetBrains Mono': 'monospace',
  'Fira Code': 'monospace',
  'Source Code Pro': 'monospace',
  'IBM Plex Mono': 'monospace',
  'Roboto Mono': 'monospace',
  'Space Mono': 'monospace',
  'Ubuntu Mono': 'monospace',
  Inconsolata: 'monospace',
  'DM Mono': 'monospace',
  'Overpass Mono': 'monospace',
  'Geist Mono': 'monospace',
  // Display.
  'Bebas Neue': 'display',
  Anton: 'display',
  Righteous: 'display',
  'Alfa Slab One': 'display',
  'Abril Fatface': 'display',
  Comfortaa: 'display',
  Fredoka: 'display',
  'Baloo 2': 'display',
  'Titan One': 'display',
  Bungee: 'display',
  Orbitron: 'display',
  'Press Start 2P': 'display',
  Silkscreen: 'display',
  VT323: 'display',
  Audiowide: 'display',
  Monoton: 'display',
  Lobster: 'display',
  // Manuscrites.
  Pacifico: 'handwriting',
  'Dancing Script': 'handwriting',
  Caveat: 'handwriting',
  Satisfy: 'handwriting',
  'Great Vibes': 'handwriting',
  'Amatic SC': 'handwriting',
  'Shadows Into Light': 'handwriting',
  'Indie Flower': 'handwriting',
  'Permanent Marker': 'handwriting',
} as const satisfies Record<string, GoogleFontCategory>

/** Nom d'une famille recensee. */
export type GoogleFontName = keyof typeof GOOGLE_FONTS

/**
 * Famille acceptee par le module : une famille recensee, ou n'importe quel
 * nom du catalogue Google Fonts en chaine libre. L'union avec `string`
 * preserve l'autocompletion des familles connues.
 */
export type GoogleFontFamily = GoogleFontName | (string & Record<never, never>)

/** Demande de chargement d'une famille. */
export interface GoogleFontRequest {
  /** Nom de la famille, tel qu'il figure au catalogue. */
  family: GoogleFontFamily
  /** Graisses a charger. @defaultValue [400, 700] */
  weights?: readonly number[]
  /** Charge aussi les italiques des graisses demandees. @defaultValue false */
  italics?: boolean
}

/** Une famille seule vaut demande avec les reglages par defaut. */
export type GoogleFontInput = GoogleFontFamily | GoogleFontRequest

/** Options de {@link loadGoogleFonts} et {@link googleFontsUrl}. */
export interface GoogleFontsOptions {
  /**
   * Strategie `font-display`. `swap` affiche immediatement le texte dans la
   * police de repli, puis echange.
   *
   * @defaultValue 'swap'
   */
  display?: 'auto' | 'block' | 'swap' | 'fallback' | 'optional'
}

/** Piles de repli par categorie, alignees sur les familles de la fondation. */
const FALLBACKS: Readonly<Record<GoogleFontCategory, string>> = {
  'sans-serif':
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  serif: "ui-serif, Georgia, Cambria, 'Times New Roman', Times, serif",
  display:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif",
  handwriting: 'cursive',
  monospace:
    "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace",
}

/** Normalise une entree en demande complete. */
function toRequest(input: GoogleFontInput): Required<GoogleFontRequest> {
  const request = typeof input === 'string' ? { family: input } : input
  return {
    family: request.family,
    weights: request.weights ?? [400, 700],
    italics: request.italics ?? false,
  }
}

/** Fragment `family=` de l'URL `css2` pour une demande. */
function familyParam({ family, weights, italics }: Required<GoogleFontRequest>): string {
  const name = family.trim().replace(/ /g, '+')
  const sorted = [...new Set(weights)].sort((a, b) => a - b)

  // L'API css2 exige des tuples tries : d'abord tous les romains, puis tous
  // les italiques, chaque groupe par graisse croissante.
  const axis = italics
    ? `ital,wght@${[
        ...sorted.map((weight) => `0,${weight}`),
        ...sorted.map((weight) => `1,${weight}`),
      ].join(';')}`
    : `wght@${sorted.join(';')}`

  return `family=${name}:${axis}`
}

/**
 * Construit l'URL de feuille de style Google Fonts pour un jeu de familles.
 *
 * @example
 * googleFontsUrl(['Inter', { family: 'Lora', weights: [400], italics: true }])
 * // 'https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Lora:ital,wght@0,400;1,400&display=swap'
 */
export function googleFontsUrl(
  fonts: readonly GoogleFontInput[],
  options: GoogleFontsOptions = {},
): string {
  if (fonts.length === 0) {
    throw new Error('[odoro/styles] googleFontsUrl() exige au moins une famille.')
  }
  const params = fonts.map((input) => familyParam(toRequest(input)))
  return `https://fonts.googleapis.com/css2?${params.join('&')}&display=${options.display ?? 'swap'}`
}

/** Marqueur pose sur les balises injectees, pour l'idempotence et le retrait. */
const LINK_MARKER = 'data-odoro-fonts'

/**
 * Injecte dans `<head>` les balises de chargement d'un jeu de familles :
 * les deux preconnexions au CDN, puis la feuille de style `css2`.
 *
 * Idempotent : une URL deja presente n'est pas injectee deux fois. Sans DOM
 * (rendu serveur), la fonction ne fait rien.
 *
 * @returns Une fonction retirant la feuille injectee — les preconnexions,
 *   partagees entre tous les appels, restent en place.
 *
 * @example
 * loadGoogleFonts([{ family: 'Poppins', weights: [400, 600, 800] }])
 */
export function loadGoogleFonts(
  fonts: readonly GoogleFontInput[],
  options: GoogleFontsOptions = {},
): () => void {
  if (typeof document === 'undefined') return () => undefined

  const head = document.head

  for (const [href, crossOrigin] of [
    ['https://fonts.googleapis.com', false],
    ['https://fonts.gstatic.com', true],
  ] as const) {
    if (head.querySelector(`link[rel="preconnect"][href="${href}"]`) !== null) continue
    const preconnect = document.createElement('link')
    preconnect.rel = 'preconnect'
    preconnect.href = href
    if (crossOrigin) preconnect.crossOrigin = 'anonymous'
    preconnect.setAttribute(LINK_MARKER, '')
    head.appendChild(preconnect)
  }

  const url = googleFontsUrl(fonts, options)
  const existing = head.querySelector<HTMLLinkElement>(
    `link[rel="stylesheet"][href="${url}"]`,
  )
  if (existing !== null) return () => existing.remove()

  const stylesheet = document.createElement('link')
  stylesheet.rel = 'stylesheet'
  stylesheet.href = url
  stylesheet.setAttribute(LINK_MARKER, '')
  head.appendChild(stylesheet)

  return () => stylesheet.remove()
}

/**
 * Pile `font-family` complete pour une famille : la famille, puis la pile de
 * repli de sa categorie.
 *
 * @param category Categorie de la famille. Deduite du registre pour une
 *   famille recensee ; `sans-serif` sinon.
 *
 * @example
 * fontStack('Fira Code') // "'Fira Code', ui-monospace, ..., monospace"
 */
export function fontStack(
  family: GoogleFontFamily,
  category?: GoogleFontCategory,
): string {
  const resolved =
    category ??
    (family in GOOGLE_FONTS ? GOOGLE_FONTS[family as GoogleFontName] : 'sans-serif')
  return `'${family}', ${FALLBACKS[resolved]}`
}

/**
 * Pointe une famille de police du systeme de style (`--o-font-*`) vers une
 * famille chargee, pile de repli comprise. Tout ce qui utilise
 * `o-font-sans`, `o-font-serif` ou `o-font-mono` — le corps de page
 * en premier lieu — bascule immediatement.
 *
 * @example
 * loadGoogleFonts(['Sora'])
 * applyFontFamily('sans', 'Sora')
 */
export function applyFontFamily(
  slot: 'sans' | 'serif' | 'mono',
  family: GoogleFontFamily,
  category?: GoogleFontCategory,
): void {
  if (typeof document === 'undefined') return
  document.documentElement.style.setProperty(
    `--o-font-${slot}`,
    fontStack(family, category),
  )
}
