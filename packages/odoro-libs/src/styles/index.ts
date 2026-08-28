/**
 * Systeme de style d'Odoro : tokens, composition de classes et variantes.
 *
 * La feuille de style elle-meme est un fichier statique, a importer une fois
 * a la racine de l'application :
 *
 * ```ts
 * import 'odoro-libs/styles.css'
 * ```
 *
 * @module
 */

export { ODORO_CLASS_NAMES, type OdoroClassName } from './generated/classNames.js'

export {
  cx,
  variants,
  type ClassName,
  type ClassValue,
  type VariantProps,
  type VariantSchema,
  type VariantsConfig,
} from './cx.js'

export {
  borderWidth,
  breakpoint,
  colorDark,
  colorLight,
  duration,
  easing,
  fontFamily,
  fontSize,
  fontWeight,
  letterSpacing,
  lineHeight,
  palette,
  radius,
  shadow,
  space,
  tokens,
  zIndex,
  type ColorToken,
  type SpaceToken,
  type Tokens,
} from './tokens.js'
