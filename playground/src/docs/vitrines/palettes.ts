/**
 * Les palettes interchangeables des vitrines.
 *
 * ## Le probleme qu elles resolvent
 *
 * Une vitrine qui ecrit `o-bg-teal-600` est une vitrine turquoise pour
 * toujours. Un modele, lui, doit se reteinter : c est la premiere chose qu on
 * fait d un gabarit quand on l adopte. Chaque vitrine expose donc son accent
 * par onze variables — `--o-vitrine-50` a `--o-vitrine-950` — et n ecrit jamais
 * une teinte en dur pour ce qui releve de sa couleur propre.
 *
 * ## Ce que la barre reteinte
 *
 * Poser une palette sur le conteneur d une vitrine reecrit deux choses :
 *
 * 1. les onze `--o-vitrine-*`, que la vitrine emploie pour ses accents ;
 * 2. les onze `--o-palette-brand-*`, que les pieces de la librairie emploient
 *    pour les leurs — bouton plein, onglet actif, anneau de focus. Sans cela,
 *    une vitrine repeinte en emeraude garderait des boutons oranges.
 *
 * Les neutres ne bougent pas : ils viennent des variables de theme, et c est ce
 * qui permet a une vitrine de suivre le theme clair ou sombre du visiteur quelle
 * que soit la palette choisie.
 *
 * @module
 */

import { type CSSProperties } from 'react'

/** Les nuances d une echelle, dans l ordre du systeme. */
const NUANCES = [
  '50',
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900',
  '950',
] as const

/**
 * Les trois couleurs d une vitrine, telles que la barre les montre.
 *
 * La premiere est l accent : c est elle qui donne l echelle complete. Les deux
 * autres sont des couleurs d appoint, employees telles quelles.
 */
export type Couleurs = readonly [string, string, string]

/**
 * L echelle complete deduite d une seule couleur.
 *
 * Un choix de couleur donne une valeur, pas une gamme. Les nuances claires sont
 * obtenues en melangeant vers le blanc, les foncees vers le noir, dans l espace
 * `oklab` — ou un melange garde sa teinte au lieu de virer au gris.
 *
 * ## Pourquoi le melange est calcule ici, et non laisse a `color-mix`
 *
 * `color-mix(...)` serait plus court, mais il ne produit pas une couleur : il
 * produit une expression que seul un moteur de style sait resoudre. Or les
 * fonds du registre lisent leurs jetons en JavaScript, et leur analyseur ne
 * connait que `#rrggbb`, `rgb()` et `oklch()` — une nuance en `color-mix` leur
 * revient donc comme du noir. Les onze nuances sont donc calculees et ecrites
 * en clair : elles valent pour le style comme pour un shader.
 */
const MELANGES: Readonly<Record<string, number>> = {
  // Part de blanc (valeurs negatives) ou de noir (positives) melangee.
  '50': -0.92,
  '100': -0.84,
  '200': -0.68,
  '300': -0.48,
  '400': -0.24,
  '500': 0,
  '600': 0.14,
  '700': 0.3,
  '800': 0.46,
  '900': 0.6,
  '950': 0.76,
}

/** Composantes lineaires d une couleur ecrite en `#rrggbb`. */
function versLineaire(hexadecimal: string): [number, number, number] {
  const propre = hexadecimal.replace('#', '')
  const lire = (a: number): number => {
    const canal = Number.parseInt(propre.slice(a, a + 2), 16) / 255
    return canal <= 0.04045 ? canal / 12.92 : ((canal + 0.055) / 1.055) ** 2.4
  }
  return [lire(0), lire(2), lire(4)]
}

/** Passage du lineaire a `oklab`. */
function versOklab(rvb: [number, number, number]): [number, number, number] {
  const [r, v, b] = rvb
  const l = Math.cbrt(0.4122214708 * r + 0.5363325363 * v + 0.0514459929 * b)
  const m = Math.cbrt(0.2119034982 * r + 0.6806995451 * v + 0.1073969566 * b)
  const s = Math.cbrt(0.0883024619 * r + 0.2817188376 * v + 0.6299787005 * b)
  return [
    0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s,
    1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s,
    0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s,
  ]
}

/** Retour d `oklab` vers `#rrggbb`. */
function versHexadecimal(oklab: [number, number, number]): string {
  const [L, a, b] = oklab
  const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3
  const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3
  const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3
  const lineaires = [
    4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
    -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
    -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
  ]
  const deux = (canal: number): string => {
    const clair = canal <= 0.0031308 ? canal * 12.92 : 1.055 * canal ** (1 / 2.4) - 0.055
    const octet = Math.round(Math.min(1, Math.max(0, clair)) * 255)
    return octet.toString(16).padStart(2, '0')
  }
  return `#${lineaires.map(deux).join('')}`
}

/**
 * Une nuance de l accent.
 *
 * @param base Couleur choisie, en `#rrggbb`.
 * @param part Part melangee : negative vers le blanc, positive vers le noir.
 */
function nuance(base: string, part: number): string {
  if (part === 0) return base
  const depart = versOklab(versLineaire(base))
  const vers: [number, number, number] =
    part < 0 ? versOklab([1, 1, 1]) : versOklab([0, 0, 0])
  const poids = Math.abs(part)
  const melange = depart.map(
    (valeur, i) => valeur * (1 - poids) + (vers[i] ?? 0) * poids,
  ) as [number, number, number]
  return versHexadecimal(melange)
}

/**
 * Les fonds sur lesquels une encre d accent doit tenir.
 *
 * Ce ne sont pas les fonds de page mais les **surfaces** : `--o-theme-surface`
 * est plus sombre que le fond en theme clair et plus clair en theme sombre,
 * donc c est elle qui exige le plus d une encre teintee. Tenir sur la surface,
 * c est tenir partout. Valeurs relevees une fois sur les jetons du systeme.
 */
const FOND_CLAIR = '#ffffff'
const FOND_SOMBRE = '#18181b'

/** Clarte relative d une couleur ecrite en `#rrggbb`. */
function clarte(hexadecimal: string): number {
  const [r, v, b] = versLineaire(hexadecimal)
  return 0.2126 * r + 0.7152 * v + 0.0722 * b
}

/** Rapport de contraste entre deux couleurs, au sens des regles d accessibilite. */
function contraste(a: string, b: string): number {
  const x = clarte(a)
  const y = clarte(b)
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05)
}

/**
 * La premiere nuance qui tient sur un fond donne.
 *
 * ## Pourquoi ce n est pas une nuance fixe
 *
 * Ecrire « l accent, c est la 700 en clair et la 300 en sombre » marche pour un
 * bleu et casse pour un jaune : mesure faite sur mille quatre cents couleurs,
 * la 700 tombe a 2,7 pour un jaune pale, et la 300 a 2,7 pour un accent
 * presque noir. La barre laissant choisir **n importe quelle** couleur, la
 * nuance ne peut pas etre decidee a l avance : on descend l echelle jusqu a ce
 * que le contraste passe. Quand meme l extremite ne suffit pas — un accent
 * blanc sur fond clair — c est elle qu on garde, faute de mieux dans l echelle.
 *
 * @param base Couleur choisie, en `#rrggbb`.
 * @param fond Fond sur lequel l encre doit tenir.
 * @param sens `1` pour foncer l accent, `-1` pour l eclaircir.
 */
function nuanceLisible(base: string, fond: string, sens: 1 | -1): string {
  const echelle =
    sens === 1
      ? ['500', '600', '700', '800', '900', '950']
      : ['500', '400', '300', '200', '100', '50']
  let dernier = base
  for (const cle of echelle) {
    dernier = nuance(base, MELANGES[cle] ?? 0)
    if (contraste(dernier, fond) >= 4.5) return dernier
  }
  return dernier
}

/**
 * La couleur choisie, ramenee a la clarte d une nuance 500 ordinaire.
 *
 * ## Pourquoi l echelle de marque ne peut pas etre l echelle brute
 *
 * Les classes de la librairie tiennent leur contraste d une convention : la
 * 700 est foncee, donc lisible sur papier ; la 300 est claire, donc lisible sur
 * encre. C est vrai des couleurs du systeme, dont la 500 se tient toujours
 * vers le milieu de l echelle des clartes. Rien ne l impose a la couleur que le
 * visiteur choisit : prise blanche, sa 700 vaut un gris a 2,7 de contraste, et
 * `o-text-brand-700` devient illisible sur toute la page.
 *
 * La teinte et la saturation sont donc gardees telles quelles, et seule la
 * clarte est ramenee dans l intervalle ou la convention tient. L accent propre
 * de la vitrine — `--o-vitrine-*` — n est pas touche : lui reste fidele au
 * choix, parce que la vitrine sait ou elle le pose.
 */
function clarteCanonique(base: string): string {
  const [L, a, b] = versOklab(versLineaire(base))
  const tenu = Math.min(0.72, Math.max(0.45, L))
  return tenu === L ? base : versHexadecimal([tenu, a, b])
}

/** L encre qui tient le mieux sur un aplat : blanc ou noir d encre. */
function encreSurAplat(aplat: string): string {
  return contraste('#ffffff', aplat) >= contraste(FOND_SOMBRE, aplat)
    ? '#ffffff'
    : FOND_SOMBRE
}

/**
 * Les variables a poser sur le conteneur d une vitrine.
 *
 * Outre les onze nuances, quatre roles calcules : l encre d accent et l aplat
 * plein, chacun dans sa version claire et sombre. Ils existent parce qu une
 * vitrine ne peut pas choisir elle-meme une nuance sure — cela depend de la
 * couleur que le visiteur vient de prendre, que seul ce calcul connait.
 *
 * @param couleurs Les trois couleurs choisies dans la barre.
 *
 * @example
 * <div style={variablesDePalette(['#0d9488', '#fbbf24', '#fafaf9'])}>…</div>
 */
export function variablesDePalette(couleurs: Couleurs): CSSProperties {
  const [accentBrut, seconde, tierce] = couleurs
  const base = /^#[0-9a-f]{6}$/i.test(accentBrut) ? accentBrut : '#888888'
  const variables: Record<string, string> = {
    '--o-vitrine-seconde': seconde,
    '--o-vitrine-tierce': tierce,
  }
  const pourLaMarque = clarteCanonique(base)
  for (const cle of NUANCES) {
    variables[`--o-vitrine-${cle}`] = nuance(base, MELANGES[cle] ?? 0)
    // Les pieces de la librairie peignent leurs accents avec l echelle de
    // marque : la reteinter ici evite a chaque vitrine de le refaire.
    variables[`--o-palette-brand-${cle}`] = nuance(pourLaMarque, MELANGES[cle] ?? 0)
  }

  // En theme clair il faut foncer l accent pour qu il tienne, en theme sombre
  // l eclaircir. L aplat plein reprend la meme couleur : elle est deja assez
  // eloignee du fond pour se lire comme une forme.
  const encreClaire = nuanceLisible(base, FOND_CLAIR, 1)
  const encreSombre = nuanceLisible(base, FOND_SOMBRE, -1)
  variables['--o-vitrine-encre-clair'] = encreClaire
  variables['--o-vitrine-encre-sombre'] = encreSombre
  variables['--o-vitrine-aplat-clair'] = encreClaire
  variables['--o-vitrine-aplat-sombre'] = encreSombre
  variables['--o-vitrine-sur-aplat-clair'] = encreSurAplat(encreClaire)
  variables['--o-vitrine-sur-aplat-sombre'] = encreSurAplat(encreSombre)

  return variables as CSSProperties
}

/**
 * L accent en tant qu **encre**, lisible quelle que soit la couleur choisie.
 *
 * C est ce qu il faut employer pour un texte, une icone ou un filet appuye —
 * pas une nuance ecrite a la main. `light-dark()` choisit la version qui
 * convient au theme : la librairie pose `color-scheme` sur la racine, donc la
 * fonction suit la bascule clair / sombre sans regle supplementaire.
 *
 * @example
 * style={{ color: encre() }}
 */
export function encre(): string {
  return 'light-dark(var(--o-vitrine-encre-clair), var(--o-vitrine-encre-sombre))'
}

/**
 * L accent en encre sur une bande **toujours sombre**.
 *
 * Certaines vitrines posent une ardoise, une nuit, un bandeau noir qui ne
 * suivent pas le theme : une carte de restaurant, un pied de page. Sur eux,
 * {@link encre} choisirait la version claire quand le visiteur est en theme
 * clair — donc une encre foncee sur du noir. C est la version sombre qu il
 * faut, et elle seule, quel que soit le theme.
 *
 * @example
 * <div className="o-bg-stone-900"><span style={{ color: encreSurSombre() }}>34 EUR</span></div>
 */
export function encreSurSombre(): string {
  return 'var(--o-vitrine-encre-sombre)'
}

/**
 * L aplat plein de l accent, avec l encre qui va dessus.
 *
 * Pour un bouton principal, un onglet actif, une pastille pleine. Les deux
 * valeurs vont ensemble : poser le fond sans l encre rend un bouton illisible
 * des que le visiteur choisit une couleur claire.
 *
 * @example
 * style={aplat()}
 */
export function aplat(): CSSProperties {
  return {
    backgroundColor:
      'light-dark(var(--o-vitrine-aplat-clair), var(--o-vitrine-aplat-sombre))',
    color:
      'light-dark(var(--o-vitrine-sur-aplat-clair), var(--o-vitrine-sur-aplat-sombre))',
  }
}

/**
 * L accent d une vitrine, a la nuance demandee.
 *
 * A employer partout ou une vitrine posait une classe de teinte en dur.
 *
 * @example
 * style={{ backgroundColor: accent(600), color: accent(50) }}
 */
export function accent(nuance: (typeof NUANCES)[number] | number): string {
  return `var(--o-vitrine-${String(nuance)})`
}

/**
 * Un accent adouci, melange au fond du theme.
 *
 * Sert aux aplats de section et aux filets : une nuance pleine y serait trop
 * forte, et un melange suit le theme sans qu on ait a ecrire deux valeurs.
 *
 * @param nuance Nuance de depart.
 * @param part Part de l accent, en pourcentage.
 */
export function accentDoux(
  nuance: (typeof NUANCES)[number] | number,
  part: number,
): string {
  return `color-mix(in oklab, var(--o-vitrine-${String(nuance)}) ${String(part)}%, var(--o-theme-bg))`
}
