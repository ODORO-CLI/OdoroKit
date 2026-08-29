/**
 * Module d'icones Odoro.
 *
 * ## Cinq jeux, un contrat
 *
 * Chaque jeu vit dans son propre sous-module : `odoro-icons/filaire`,
 * `/compact`, `/classique`, `/etendu`, `/marques`. Aucun n'est reexporte ici —
 * un index qui les rassemblerait tous ferait entrer onze mille exports dans le
 * graphe du bundler pour en afficher trois.
 *
 * ## Choisir un jeu, et s'y tenir
 *
 * Les jeux ne partagent ni grille, ni epaisseur, ni style de dessin. Melanger
 * une icone au trait de vingt-quatre et un glyphe plein de cinq cent douze
 * dans la meme barre d'outils se voit immediatement, meme sans savoir
 * pourquoi.
 *
 * Le seul melange qui se defende est un jeu principal plus `marques`, puisque
 * les logos n'ont de toute facon aucun style commun avec le reste.
 *
 * @example
 * import { Icon } from 'odoro-icons'
 * import { Download, Search } from 'odoro-icons/filaire'
 *
 * <Icon icon={Download} />
 * <Icon icon={Search} size={20} label="Rechercher" />
 *
 * @module
 */

export { Icon, type IconProps } from './Icon.jsx'
export type { IconData, IconNode, PackInfo } from './types.js'
