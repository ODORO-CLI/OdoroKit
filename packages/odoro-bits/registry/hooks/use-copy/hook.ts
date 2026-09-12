/**
 * Copie dans le presse-papiers, avec l'etat que l'interface doit montrer.
 *
 * ## Pourquoi un etat, et pas seulement un appel
 *
 * Copier ne produit aucun retour visible : rien ne bouge, aucun son, et le
 * presse-papiers ne se regarde pas. Sans confirmation, on reclique — puis on
 * va coller ailleurs pour verifier. La confirmation n'est donc pas un ornement,
 * c'est la seule preuve que l'action a eu lieu.
 *
 * Elle doit aussi s'effacer. Un « copie ! » qui reste indefiniment ne dit plus
 * rien de la derniere action, et le bouton semble bloque dans un etat.
 *
 * ## Pourquoi l'echec est un etat a part entiere
 *
 * L'API du presse-papiers echoue pour des raisons ordinaires : page servie
 * sans chiffrement, permission refusee, document sans focus. Traiter l'echec
 * comme un succes est le pire des deux mondes — on affiche « copie » et le
 * collage rend autre chose. L'appelant peut alors proposer la selection
 * manuelle, qui reste toujours possible.
 *
 * ## Pourquoi il reste un chemin de repli
 *
 * `navigator.clipboard` exige un contexte securise. En developpement sur une
 * adresse du reseau local — un telephone qui pointe vers la machine — il
 * n'existe tout simplement pas. La vieille commande d'edition, elle, marche
 * encore partout ; elle est depreciee, pas retiree, et c'est la difference
 * entre un bouton qui fonctionne et un bouton qui ne fonctionne que chez celui
 * qui l'a ecrit.
 *
 * ## Pourquoi le demontage est surveille
 *
 * La copie est asynchrone et le retour au repos est differe. Un panneau ferme
 * entre-temps — c'est le cas courant, on copie puis on ferme — verrait deux
 * ecritures d'etat sur un composant disparu : un minuteur qui survit, et une
 * promesse qui se resout dans le vide.
 *
 * @module
 */

import { useCallback, useEffect, useRef, useState } from 'react'

/** Ou en est la derniere copie. */
export type CopyState = 'repos' | 'copie' | 'echec'

/** Options de `useCopy`. */
export interface CopyOptions {
  /**
   * Delai avant le retour au repos, en millisecondes.
   *
   * @defaultValue 1600
   */
  delai?: number
}

/** Ce que le crochet rend. */
export interface CopyHandle {
  /** Etat de la derniere copie. */
  readonly etat: CopyState
  /**
   * Copie un texte.
   *
   * @returns `true` si le presse-papiers a bien recu le texte.
   */
  copier(texte: string): Promise<boolean>
}

/**
 * Ecrit dans le presse-papiers par la commande d'edition du document.
 *
 * Le champ est place hors du champ visible plutot que masque : un element
 * `display: none` ne peut pas etre selectionne, et la commande n'aurait alors
 * rien a copier.
 */
function copieDeSecours(texte: string): boolean {
  if (typeof document === 'undefined') return false

  const champ = document.createElement('textarea')
  champ.value = texte
  champ.setAttribute('readonly', '')
  champ.setAttribute('aria-hidden', 'true')
  champ.style.position = 'fixed'
  champ.style.top = '0'
  champ.style.left = '-9999px'

  document.body.append(champ)
  const focusPrecedent = document.activeElement

  try {
    champ.select()
    return document.execCommand('copy')
  } catch {
    return false
  } finally {
    champ.remove()
    // Rendre le focus : sans cela, le bouton qu'on vient de cliquer le perd,
    // et la navigation au clavier repart du debut du document.
    if (focusPrecedent instanceof HTMLElement) focusPrecedent.focus()
  }
}

/**
 * Copie dans le presse-papiers, avec un etat qui retombe seul.
 *
 * @example
 * const { etat, copier } = useCopy()
 *
 * <button type="button" onClick={() => void copier(commande)}>
 *   {etat === 'copie' ? 'Copie' : etat === 'echec' ? 'Echec' : 'Copier'}
 * </button>
 */
export function useCopy(options: CopyOptions = {}): CopyHandle {
  const { delai = 1600 } = options

  const [etat, setEtat] = useState<CopyState>('repos')
  const minuteur = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const monte = useRef(true)

  useEffect(() => {
    monte.current = true
    return () => {
      monte.current = false
      clearTimeout(minuteur.current)
    }
  }, [])

  const copier = useCallback(
    async (texte: string): Promise<boolean> => {
      let reussi = false

      try {
        if (typeof navigator !== 'undefined' && navigator.clipboard !== undefined) {
          await navigator.clipboard.writeText(texte)
          reussi = true
        } else {
          reussi = copieDeSecours(texte)
        }
      } catch {
        // Permission refusee, document sans focus, contexte non securise : la
        // vieille commande reste une chance, pas une certitude.
        reussi = copieDeSecours(texte)
      }

      if (!monte.current) return reussi

      clearTimeout(minuteur.current)
      setEtat(reussi ? 'copie' : 'echec')
      minuteur.current = setTimeout(() => {
        if (monte.current) setEtat('repos')
      }, delai)

      return reussi
    },
    [delai],
  )

  return { etat, copier }
}
