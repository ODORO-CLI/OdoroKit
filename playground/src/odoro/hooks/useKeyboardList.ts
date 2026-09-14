/**
 * Navigation clavier d'une liste : fleches, Home, End.
 *
 * ## Pourquoi ce n'est pas un detail qu'on ajoute apres
 *
 * Une liste d'options faite de `div` cliquables est inatteignable au clavier.
 * Le reflexe est alors de rendre chaque element focusable — et l'on obtient
 * une liste de vingt arrets de tabulation, qu'il faut tous traverser pour
 * atteindre le bouton suivant. Les deux defauts sont courants et le second est
 * le pire, parce qu'il a l'air corrige.
 *
 * La bonne forme s'appelle le **tabindex glissant** : la liste entiere est un
 * seul arret de tabulation, et les fleches deplacent le focus a l'interieur.
 * C'est ce que font une liste d'options, un menu, un jeu d'onglets — et c'est
 * ce que ce crochet pose, sans rien decider de l'apparence.
 *
 * ## Pourquoi le focus est deplace, et pas seulement l'index
 *
 * Un index actif purement visuel laisse le focus du navigateur derriere lui :
 * un lecteur d'ecran continue d'annoncer le premier element pendant qu'on en
 * regarde le cinquieme. Deplacer le focus reel garde l'annonce, la mise en
 * evidence du navigateur et le rendu visuel sur le meme element.
 *
 * ## Ce que le crochet ne decide pas
 *
 * Le role. Une liste d'options, un menu et un jeu d'onglets ont la meme
 * navigation et trois roles ARIA differents ; les confondre produirait une
 * annonce fausse. Le role, la selection et l'apparence restent a l'appelant.
 *
 * @module
 */

import { useCallback, useRef, useState, type KeyboardEvent } from 'react'

/** Sens de la liste. */
export type ListOrientation = 'verticale' | 'horizontale'

/** Options de `useKeyboardList`. */
export interface KeyboardListOptions {
  /** Nombre d'elements. */
  count: number
  /** Sens de la liste. @defaultValue 'verticale' */
  orientation?: ListOrientation
  /**
   * Repartir au debut apres le dernier element.
   *
   * Vrai pour un menu, ou l'on cherche une entree. Faux pour une liste ou la
   * position compte — un jeu d'etapes, un choix ordonne — parce que le retour
   * silencieux au debut y passe pour un saut inexplique.
   *
   * @defaultValue true
   */
  boucle?: boolean
  /** Element actif au montage. @defaultValue 0 */
  initial?: number
  /** Appelee sur Entree ou Espace, avec l'index actif. */
  onValider?: (index: number) => void
}

/** A poser sur le conteneur de la liste. */
export interface KeyboardListProps {
  onKeyDown: (event: KeyboardEvent<HTMLElement>) => void
  'aria-orientation': 'vertical' | 'horizontal'
}

/** A poser sur chaque element. */
export interface KeyboardItemProps {
  ref: (node: HTMLElement | null) => void
  tabIndex: number
  onFocus: () => void
  'data-actif': '' | undefined
}

/** Ce que le crochet rend. */
export interface KeyboardListResult {
  /** Index actif. Vaut -1 si la liste est vide. */
  readonly actif: number
  /** Deplace l'element actif, et le focus avec lui. */
  aller(index: number): void
  /** A etaler sur le conteneur. */
  readonly listProps: KeyboardListProps
  /** A etaler sur l'element d'indice donne. */
  itemProps(index: number): KeyboardItemProps
}

/**
 * Pose la navigation clavier d'une liste.
 *
 * @example
 * const liste = useKeyboardList({ count: options.length, onValider: choisir })
 *
 * <ul role="listbox" {...liste.listProps}>
 *   {options.map((option, index) => (
 *     <li key={option} role="option" aria-selected={index === liste.actif}
 *         {...liste.itemProps(index)}>
 *       {option}
 *     </li>
 *   ))}
 * </ul>
 */
export function useKeyboardList(options: KeyboardListOptions): KeyboardListResult {
  const {
    count,
    orientation = 'verticale',
    boucle = true,
    initial = 0,
    onValider,
  } = options

  const [brut, setBrut] = useState(initial)

  // La liste peut raccourcir entre deux rendus — un filtre qui se resserre.
  // Borner ici plutot que dans un effet evite l'image ou l'index designe un
  // element qui n'existe plus.
  const actif = count === 0 ? -1 : Math.min(Math.max(brut, 0), count - 1)

  const noeuds = useRef(new Map<number, HTMLElement>())
  const poseurs = useRef(new Map<number, (node: HTMLElement | null) => void>())

  const aller = useCallback((index: number): void => {
    setBrut(index)
    // Voir l'en-tete : le focus reel suit, sans quoi l'annonce et le rendu se
    // separent.
    noeuds.current.get(index)?.focus()
  }, [])

  const onKeyDown = useCallback(
    (event: KeyboardEvent<HTMLElement>): void => {
      if (count === 0) return

      const avant = orientation === 'verticale' ? 'ArrowDown' : 'ArrowRight'
      const arriere = orientation === 'verticale' ? 'ArrowUp' : 'ArrowLeft'

      const pas = (sens: number): void => {
        const vise = actif + sens
        const borne = boucle
          ? (vise + count) % count
          : Math.min(Math.max(vise, 0), count - 1)
        aller(borne)
      }

      switch (event.key) {
        case avant:
          // Sans cela, la page defile sous la liste pendant qu'on la parcourt.
          event.preventDefault()
          pas(1)
          return
        case arriere:
          event.preventDefault()
          pas(-1)
          return
        case 'Home':
          event.preventDefault()
          aller(0)
          return
        case 'End':
          event.preventDefault()
          aller(count - 1)
          return
        case 'Enter':
        case ' ':
          if (onValider === undefined) return
          event.preventDefault()
          onValider(actif)
          return
        default:
          // Les autres touches ne sont pas a nous : les fleches de l'autre axe
          // doivent continuer de faire defiler la page.
          return
      }
    },
    [count, orientation, boucle, actif, aller, onValider],
  )

  const itemProps = useCallback(
    (index: number): KeyboardItemProps => {
      let poseur = poseurs.current.get(index)
      if (poseur === undefined) {
        // Un poseur par indice, garde d'un rendu a l'autre : une fonction
        // fabriquee a chaque rendu ferait detacher puis rattacher la ref, donc
        // perdre le noeud le temps d'une image.
        poseur = (node: HTMLElement | null): void => {
          if (node === null) noeuds.current.delete(index)
          else noeuds.current.set(index, node)
        }
        poseurs.current.set(index, poseur)
      }

      return {
        ref: poseur,
        // Le tabindex glissant : un seul arret de tabulation pour la liste.
        tabIndex: index === actif ? 0 : -1,
        // Un clic ou une tabulation entrante deplace le focus sans passer par
        // les fleches : l'index doit suivre, sinon les deux divergent.
        onFocus: () => setBrut(index),
        'data-actif': index === actif ? '' : undefined,
      }
    },
    [actif],
  )

  return {
    actif,
    aller,
    listProps: {
      onKeyDown,
      'aria-orientation': orientation === 'verticale' ? 'vertical' : 'horizontal',
    },
    itemProps,
  }
}
