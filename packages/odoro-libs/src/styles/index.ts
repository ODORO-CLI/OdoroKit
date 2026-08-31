/**
 * Systeme de style d'Odoro : tokens, composition de classes et variantes.
 *
 * La feuille de style est un fichier statique, a importer une fois a la racine
 * de l'application :
 *
 * ```ts
 * import '@odoro-cli/libs/styles.css'
 * ```
 *
 * Elle porte la structure et les couleurs. Les utilitaires sur les palettes
 * supplementaires ont ete retires du paquet : ils pesaient un tiers de son
 * poids pour un fichier qu'aucune application n'importait.
 *
 * @module
 */

// Seuls les types sont exposes : les tableaux de noms de classes pesent 195 Ko
// et ne servent qu'au generateur et a la suite de tests. L'autocompletion, elle,
// ne coute rien a l'execution.
export type {
  OdoroClassName,
  OdoroCoreClassName,
} from './generated/classNames.js'
export * from './cx.js'
export * from './fonts.js'
export * from './tokens.js'
