/**
 * Systeme de style d'Odoro : tokens, composition de classes et variantes.
 *
 * La feuille de style est un fichier statique, a importer une fois a la racine
 * de l'application. Deux paliers sont disponibles :
 *
 * ```ts
 * import '@odoro-cli/libs/styles.css'      // structure + couleurs semantiques
 * import '@odoro-cli/libs/styles.full.css' // + utilitaires sur les 290 nuances
 * ```
 *
 * La feuille complete est un sur-ensemble de la feuille de base : on importe
 * l'une **ou** l'autre, jamais les deux.
 *
 * @module
 */

// Seuls les types sont exposes : les tableaux de noms de classes pesent 195 Ko
// et ne servent qu'au generateur et a la suite de tests. L'autocompletion, elle,
// ne coute rien a l'execution.
export type {
  OdoroClassName,
  OdoroCoreClassName,
  OdoroExtendedClassName,
} from './generated/classNames.js'
export * from './cx.js'
export * from './fonts.js'
export * from './tokens.js'
