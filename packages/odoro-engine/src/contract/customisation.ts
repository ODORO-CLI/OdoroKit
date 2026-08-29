/**
 * Le contrat de personnalisation.
 *
 * ## Cinq niveaux, et un sixieme qu'on paie
 *
 * Un composant du registre est copie dans le projet : rien n'empeche d'en
 * editer la source. C'est meme la raison d'etre de la copie. Mais chaque
 * retouche est une retouche a refaire — `odoro diff` la signalera comme telle,
 * et le jour ou l'entree amont evolue, il faudra la reporter a la main.
 *
 * Les cinq niveaux ci-dessous, eux, survivent a une reinstallation. Ils sont
 * ordonnes par la distance qu'il faut parcourir pour les atteindre, et l'on
 * ne descend d'un cran que lorsque le precedent ne suffit pas.
 *
 * 1. **Les tokens.** Changer une variable CSS modifie tous les composants a la
 *    fois. Rien a toucher dans le code.
 * 2. **Les props.** L'API documentee, celle que la table des proprietes decrit.
 * 3. **Le passe-plat.** `className`, `style`, `ref`, et les attributs DOM :
 *    poser le composant dans une mise en page, sans rien savoir de son
 *    interieur.
 * 4. **Le slot de rendu.** Remplacer ce qui est affiche en gardant la
 *    mecanique — les mesures, les abonnements, le cycle de vie.
 * 5. **`onReady`.** L'echappatoire : l'objet imperatif lui-meme, timeline ou
 *    scene, pour ce que l'API n'a pas prevu.
 *
 * ## Pourquoi le cinquieme niveau existe
 *
 * Sans echappatoire, chaque besoin non prevu devient une propriete de plus.
 * Au bout d'un an, le composant en a trente, personne ne sait plus laquelle
 * fait quoi, et la moitie ne sert qu'a un seul projet. `onReady` absorbe ces
 * cas-la sans elargir la surface documentee.
 *
 * @module
 */

import type { ComponentPropsWithRef, CSSProperties, ElementType } from 'react'

/**
 * Les props d'un composant du registre : les siennes, plus tout ce qu'un
 * element hote accepte.
 *
 * @typeParam Own Proprietes propres au composant.
 * @typeParam Host Element rendu a la racine.
 *
 * @example
 * interface AuroreProps {
 *   vitesse?: number
 * }
 *
 * function Aurore({ vitesse = 0.12, ...rest }: Customisable<AuroreProps>) { … }
 */
export type Customisable<Own, Host extends ElementType = 'div'> = Own &
  Omit<ComponentPropsWithRef<Host>, keyof Own>

/** Ce qu'un composant applique a son element racine. */
export interface Presentation {
  /** Classes, celles du composant puis celles de l'appelant. */
  readonly className: string | undefined
  /** Styles en ligne, ceux de l'appelant l'emportant. */
  readonly style: CSSProperties | undefined
}

/**
 * Fusionne l'habillage du composant et celui de l'appelant.
 *
 * Les classes sont **concatenees**, jamais remplacees : un composant qui
 * ecraserait ses propres classes par celles qu'on lui passe perdrait sa mise
 * en forme des qu'on veut seulement le decaler d'un cran.
 *
 * ## Ce que la concatenation ne fait pas
 *
 * Elle ne garantit pas que l'appelant l'emporte. L'ordre des classes dans
 * l'attribut n'a **aucun** effet sur la cascade CSS : entre deux regles de
 * meme specificite, c'est celle qui vient en dernier **dans la feuille** qui
 * gagne, pas celle qui vient en dernier dans le `class`. C'est une confusion
 * repandue, et la source de « pourquoi ma classe ne s'applique pas ».
 *
 * D'ou la place du niveau 3 dans l'echelle : il sert a **poser** le composant
 * — marges, position, largeur, ou rien ne se dispute — plutot qu'a le
 * repeindre. Pour repeindre avec certitude, il y a un token au-dessus et
 * `style` en dessous, qui, lui, l'emporte toujours.
 *
 * @example
 * const { className, style } = mergePresentation(
 *   { className: 'o-relative o-overflow-hidden' },
 *   props,
 * )
 */
export function mergePresentation(
  base: { className?: string | undefined; style?: CSSProperties | undefined },
  incoming: { className?: string | undefined; style?: CSSProperties | undefined },
): Presentation {
  const classes = [base.className, incoming.className].filter(
    (value): value is string => typeof value === 'string' && value.trim() !== '',
  )

  const hasStyle = base.style !== undefined || incoming.style !== undefined

  return {
    className: classes.length === 0 ? undefined : classes.join(' '),
    // L'appelant en dernier : en ligne, c'est la derniere ecriture qui reste,
    // et c'est le seul endroit ou l'emporter est garanti.
    style: hasStyle ? { ...base.style, ...incoming.style } : undefined,
  }
}
