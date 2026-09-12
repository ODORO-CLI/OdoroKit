/**
 * Reponse d'une requete de media, suivie dans le temps.
 *
 * ## Pourquoi pas une mesure de largeur
 *
 * La facon courante — un ecouteur `resize` qui range `window.innerWidth` dans
 * un etat — est fausse a trois titres. Elle provoque un rendu React par cran
 * de redimensionnement, la ou la reponse ne change qu'une fois sur tout le
 * trajet. Elle ignore tout ce qui n'est pas une largeur : l'orientation, le
 * pointeur grossier, le mouvement reduit, le mode sombre. Et elle duplique les
 * points de rupture de la feuille de style dans le JavaScript, ou ils
 * divergeront des la premiere retouche.
 *
 * `matchMedia` repond a la meme question que le CSS, avec la meme grammaire,
 * et ne previent que lorsque la reponse bascule.
 *
 * ## Pourquoi `useSyncExternalStore`
 *
 * Parce que la source est exterieure a React et peut changer **entre** le
 * rendu et l'effet qui s'abonnerait. Un `useState` plus `useEffect` laisse
 * cette fenetre ouverte : on peint une mise en page mobile sur un ecran large,
 * puis on la corrige a l'image suivante. React sait fermer cette fenetre, a
 * condition qu'on lui declare la source telle qu'elle est.
 *
 * C'est aussi ce qui rend le crochet sur au rendu serveur : la troisieme
 * fonction dit quoi repondre quand il n'y a pas de fenetre, plutot que de
 * laisser `matchMedia` lever au milieu du rendu.
 *
 * ## Pourquoi les listes sont mises en cache
 *
 * `getSnapshot` est appele plusieurs fois par rendu. Fabriquer un
 * `MediaQueryList` a chaque appel en creerait autant d'objets, et surtout
 * l'abonnement porterait sur une liste differente de celle qu'on interroge.
 * Une liste par requete, gardee pour la duree de la page : le navigateur les
 * partage de toute facon.
 *
 * @module
 */

import { useCallback, useSyncExternalStore } from 'react'

/** Options de `useMediaQuery`. */
export interface MediaQueryOptions {
  /**
   * Reponse rendue la ou `matchMedia` n'existe pas : rendu serveur, ancien
   * navigateur, environnement de test.
   *
   * Le defaut est `false`, ce qui revient a dire « la requete ne s'applique
   * pas ». C'est le choix prudent tant que les requetes sont ecrites en
   * ajout — `(min-width: 60rem)` decrit ce qu'on ajoute sur grand ecran — et
   * il faut le renverser pour une requete ecrite en retrait.
   *
   * @defaultValue false
   */
  serveur?: boolean
}

/** Listes partagees, une par requete. */
const listes = new Map<string, MediaQueryList>()

/** Liste d'une requete, ou `null` si le navigateur ne sait pas repondre. */
function liste(query: string): MediaQueryList | null {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return null
  }
  const connue = listes.get(query)
  if (connue !== undefined) return connue
  const creee = window.matchMedia(query)
  listes.set(query, creee)
  return creee
}

/**
 * Dit si une requete de media s'applique, et le redit quand cela change.
 *
 * @param query Requete, dans la grammaire du CSS.
 *
 * @example
 * const large = useMediaQuery('(min-width: 60rem)')
 * return large ? <Colonnes /> : <Pile />
 *
 * @example
 * // Une requete ecrite en retrait : le repli serveur doit etre renverse.
 * const grossier = useMediaQuery('(pointer: coarse)', { serveur: true })
 */
export function useMediaQuery(query: string, options: MediaQueryOptions = {}): boolean {
  const { serveur = false } = options

  const subscribe = useCallback(
    (notifier: () => void): (() => void) => {
      const cible = liste(query)
      if (cible === null) return () => undefined

      // `addEventListener` sur une liste de media est recent a l'echelle du
      // navigateur ; l'ancienne forme reste la seule disponible sur les
      // Safari encore en circulation.
      if (typeof cible.addEventListener === 'function') {
        cible.addEventListener('change', notifier)
        return () => {
          cible.removeEventListener('change', notifier)
        }
      }

      cible.addListener(notifier)
      return () => {
        cible.removeListener(notifier)
      }
    },
    [query],
  )

  const lire = useCallback((): boolean => liste(query)?.matches ?? serveur, [query, serveur])
  const lireServeur = useCallback((): boolean => serveur, [serveur])

  return useSyncExternalStore(subscribe, lire, lireServeur)
}
