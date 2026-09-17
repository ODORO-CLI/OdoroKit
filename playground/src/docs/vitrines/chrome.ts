/**
 * La hauteur des barres que l hote pose au-dessus d une vitrine.
 *
 * ## Le bogue que ce module repare
 *
 * Les vitrines ont ete ecrites pour un seul hote : la documentation, qui pose
 * quatre-vingts pixels de barre de site et trente-sept de bandeau de retour.
 * Soixante-et-onze d entre elles calculent donc leurs pleines hauteurs en
 * `calc(100vh - 117px)`, et collent leurs barres flottantes sous ces 117
 * pixels-la.
 *
 * Dans un cadre pose sur un autre site, et dans le projet exporte, ces barres
 * n existent pas. La vitrine y reservait quand meme leur place : une bande de
 * 117 pixels en haut de la page, du fond nu, au-dessus du premier ecran — et
 * les couches fixes calees en bas laissaient exactement ce trou.
 *
 * ## Pourquoi une valeur mutable plutot qu une variable CSS
 *
 * Parce que les cent cinquante-six emplois de cette valeur ne sont pas tous du
 * CSS : il y a des `CHROME + 32`, des `CHROME / 2`, des `CHROME + rang * 18`
 * passes a des composants qui en font de l arithmetique. Une variable CSS
 * aurait demande de reecrire chacun d eux.
 *
 * La hauteur des barres est une propriete du **document**, fixee une fois pour
 * toutes a son amorcage : un document n heberge qu une vitrine. Une liaison
 * ESM vivante l exprime exactement — l hote la pose avant que le module de la
 * vitrine ne soit seulement telecharge, puisque celui-ci est charge
 * paresseusement.
 *
 * @module
 */

/**
 * Hauteur des barres au-dessus de la vitrine, en pixels.
 *
 * La valeur de depart est celle de la documentation, parce que c est l hote
 * qui ne se declare pas : un hote sans barres, lui, le dit.
 */
export let CHROME = 117

/**
 * Declare la hauteur des barres de l hote.
 *
 * A appeler a la portee du module, avant que la vitrine ne soit montee — donc
 * avant l import paresseux qui la charge. Appele plus tard, il laisserait le
 * premier rendu avec l ancienne valeur.
 *
 * @param pixels Ce que l hote occupe au-dessus de la vitrine. Zero pour un
 *   cadre pose ailleurs, ou pour un projet exporte.
 *
 * @example
 * // En tete du module d une route sans barres :
 * poserChrome(0)
 */
export function poserChrome(pixels: number): void {
  CHROME = pixels
}
