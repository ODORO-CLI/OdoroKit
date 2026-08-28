/**
 * Systeme de style d'Odoro : tokens, composition de classes et variantes.
 *
 * La feuille de style est un fichier statique, a importer une fois a la racine
 * de l'application. Deux paliers sont disponibles :
 *
 * ```ts
 * import 'odoro-libs/styles.css'      // structure + couleurs semantiques
 * import 'odoro-libs/styles.full.css' // + utilitaires sur les 290 nuances
 * ```
 *
 * La feuille complete est un sur-ensemble de la feuille de base : on importe
 * l'une **ou** l'autre, jamais les deux.
 *
 * @module
 */

export * from './generated/classNames.js'
export * from './cx.js'
export * from './tokens.js'
