/**
 * Systeme de style d'Odoro : tokens, composition de classes et variantes.
 *
 * Le paquet livre un **socle**, a importer une fois a la racine de
 * l'application :
 *
 * ```ts
 * import '@odoro-cli/libs/styles.css'
 * ```
 *
 * Variables, preflight, images-cles : trente kilooctets, et aucun utilitaire.
 * Ceux-ci sont produits a la construction, pour les seules classes employees.
 *
 * Cela exige le moteur `odoro` 0.1.5 ou plus recent. Sans lui, l'application
 * recoit les variables sans les utilitaires et arrive sans style — sans erreur
 * pour le signaler, puisque du CSS absent ne casse rien, il ne peint rien.
 *
 * @module
 */

// Seuls les types sont exposes : les tableaux de noms de classes pesent 195 Ko
// et ne servent qu'au generateur et a la suite de tests. L'autocompletion, elle,
// ne coute rien a l'execution.
export type { OdoroClassName, OdoroCoreClassName } from './generated/classNames.js'
export * from './cx.js'
export * from './fonts.js'
export * from './tokens.js'
