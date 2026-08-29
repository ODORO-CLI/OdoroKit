/**
 * Repli visuel d'un composant couteux.
 *
 * ## Pourquoi le repli est affiche d'abord
 *
 * Un moteur de rendu 3D pese plus de cent kilo-octets compresses. Entre
 * l'arrivee de la page et la premiere image de la scene, il s'ecoule un delai
 * qui se compte en centaines de millisecondes sur une connexion ordinaire.
 * Monter la scene d'abord et le repli ensuite reviendrait a afficher un
 * rectangle vide pendant tout ce temps — a l'endroit le plus visible de la
 * page.
 *
 * Le repli est donc rendu **immediatement**, dans le document, et ne
 * disparait qu'une fois la scene prete. Il sert aussi lorsque la scene ne
 * viendra jamais : sans WebGL, sous mouvement reduit, ou quand l'arbitre de
 * surfaces refuse.
 *
 * ## Pourquoi il n'est pas simplement retire
 *
 * Un retrait sec fait clignoter la transition entre deux images tres proches
 * mais pas identiques. Le fondu, lui, masque l'ecart. Sa duree vient des
 * tokens : elle suit le reglage du projet plutot que d'imposer le sien.
 *
 * @module
 */

import { useEffect, useRef, useState, type CSSProperties } from 'react'

/** Options de `usePoster`. */
export interface PosterOptions {
  /** Passe a vrai quand la scene a rendu sa premiere image. */
  ready: boolean
  /**
   * Motif pour lequel la scene ne sera jamais montee. Sa presence maintient le
   * repli indefiniment.
   */
  refused?: string | undefined
  /** Duree du fondu, en millisecondes. @defaultValue 320 */
  fade?: number
}

/** Ce que rend `usePoster`. */
export interface PosterHandle {
  /** `true` tant que le repli doit rester dans le document. */
  readonly visible: boolean
  /** Styles a appliquer au repli. */
  readonly style: CSSProperties
}

/**
 * Pilote l'affichage et la disparition d'un repli.
 *
 * Le repli reste monte pendant toute la duree du fondu : le retirer des le
 * debut ferait apparaitre la scene d'un coup, ce que le fondu existe
 * precisement pour eviter.
 *
 * @example
 * const { ref, ready, refused } = useScene({ ... })
 * const poster = usePoster({ ready, refused })
 *
 * return (
 *   <div className="o-relative">
 *     <div ref={ref} className="o-absolute o-inset-0" />
 *     {poster.visible ? (
 *       <div style={poster.style} className="o-absolute o-inset-0 o-bg-surface-sunken" />
 *     ) : null}
 *   </div>
 * )
 */
export function usePoster(options: PosterOptions): PosterHandle {
  const { ready, refused, fade = 320 } = options

  const [visible, setVisible] = useState(true)
  const [opacity, setOpacity] = useState(1)
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  useEffect(() => {
    // La scene ne viendra pas : le repli est le rendu final, pas une attente.
    if (refused !== undefined) {
      setVisible(true)
      setOpacity(1)
      return
    }

    if (!ready) return

    setOpacity(0)
    timer.current = setTimeout(() => setVisible(false), fade)

    return () => clearTimeout(timer.current)
  }, [ready, refused, fade])

  return {
    visible,
    style: {
      opacity,
      transition: `opacity ${fade}ms var(--o-ease-entrance, ease-out)`,
      // Le repli s'efface, mais il ne doit intercepter aucun clic entre-temps.
      pointerEvents: 'none',
    },
  }
}
