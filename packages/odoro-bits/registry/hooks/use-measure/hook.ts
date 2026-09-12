/**
 * Taille et position d'un element, relevees quand elles changent.
 *
 * ## Pourquoi un observateur, et pas une boucle
 *
 * Mesurer dans la boucle de rendu donnerait une valeur toujours juste, au prix
 * d'une lecture de mise en page a chaque image — pour un nombre qui, sur une
 * page ordinaire, ne bouge pas de la minute. Le navigateur sait dire quand il
 * a change : `ResizeObserver` ne se reveille que lors d'un vrai changement de
 * boite, et il voit ce qu'un ecouteur `resize` ne voit pas — une colonne
 * voisine qui s'ouvre, une police qui arrive, un contenu qui grandit.
 *
 * ## Pourquoi un etat React ici, alors qu'ailleurs c'est une ref
 *
 * Parce que la valeur sert a **decider**, pas a animer. On mesure pour choisir
 * un nombre de colonnes, dimensionner une toile, placer un panneau : autant de
 * choses qui passent par un rendu de toute facon. Le nombre de rendus est
 * celui des changements reels, c'est-a-dire presque aucun.
 *
 * C'est la difference avec le pointeur ou le defilement, qui changent a chaque
 * image et n'ont donc rien a faire dans un etat.
 *
 * ## L'arrondi n'est pas cosmetique
 *
 * Une largeur en pourcentage vaut 341.328125 pixels, et le moindre reflow la
 * fait osciller d'un centieme. Sans arrondi, chacune de ces oscillations
 * provoque un rendu — et si ce rendu change la mise en page, l'observateur se
 * reveille a nouveau. C'est ainsi qu'on obtient la boucle que le navigateur
 * signale par « ResizeObserver loop completed with undelivered notifications ».
 *
 * ## Ce que ce crochet ne fait pas
 *
 * La position est celle du dernier releve, dans le repere de la fenetre. Elle
 * ne suit pas le defilement : le suivre demanderait une mesure par image,
 * c'est-a-dire exactement ce que ce crochet evite. Pour un element qui bouge
 * pendant qu'on defile, la progression de defilement est l'outil juste.
 *
 * @module
 */

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react'

/** Boite relevee, en pixels, dans le repere de la fenetre. */
export interface Box {
  readonly width: number
  readonly height: number
  readonly top: number
  readonly left: number
}

/** Options de `useMeasure`. */
export interface MeasureOptions {
  /**
   * Arrondir au pixel.
   *
   * Voir l'en-tete : sans arrondi, une largeur fractionnaire fait osciller la
   * mesure et provoque des rendus pour rien. A ne desactiver que pour une
   * toile, ou le sous-pixel se voit.
   *
   * @defaultValue true
   */
  arrondi?: boolean
}

/** Ce que le crochet rend. */
export interface MeasureResult<T extends Element> {
  /** A poser sur l'element a mesurer. */
  readonly ref: RefObject<T | null>
  /** Derniere boite relevee. Nulle tant que rien n'a ete mesure. */
  readonly box: Box
  /** `true` des qu'une premiere mesure a eu lieu. */
  readonly pret: boolean
  /**
   * Force un releve.
   *
   * Necessaire apres un changement que l'observateur ne voit pas : un element
   * qu'on vient de deplacer sans le redimensionner.
   */
  mesurer(): void
}

/** Boite avant toute mesure. */
const VIDE: Box = { width: 0, height: 0, top: 0, left: 0 }

/** Deux boites identiques n'ont pas a provoquer de rendu. */
function identiques(a: Box, b: Box): boolean {
  return (
    a.width === b.width && a.height === b.height && a.top === b.top && a.left === b.left
  )
}

/**
 * Mesure un element, et remesure quand il change.
 *
 * @example
 * const { ref, box, pret } = useMeasure<HTMLDivElement>()
 * return (
 *   <div ref={ref}>
 *     {pret ? <Toile largeur={box.width} hauteur={box.height} /> : null}
 *   </div>
 * )
 */
export function useMeasure<T extends Element>(
  options: MeasureOptions = {},
): MeasureResult<T> {
  const { arrondi = true } = options

  const ref = useRef<T | null>(null)
  const [etat, setEtat] = useState<{ box: Box; pret: boolean }>({
    box: VIDE,
    pret: false,
  })

  const mesurer = useCallback((): void => {
    const cible = ref.current
    if (cible === null) return

    const rect = cible.getBoundingClientRect()
    const ajuste = (valeur: number): number => (arrondi ? Math.round(valeur) : valeur)
    const releve: Box = {
      width: ajuste(rect.width),
      height: ajuste(rect.height),
      top: ajuste(rect.top),
      left: ajuste(rect.left),
    }

    setEtat((precedent) =>
      precedent.pret && identiques(precedent.box, releve)
        ? precedent
        : { box: releve, pret: true },
    )
  }, [arrondi])

  useEffect(() => {
    const cible = ref.current
    if (cible === null) return

    mesurer()

    // La fenetre en plus de l'element : un element de taille fixe change de
    // position quand la fenetre se reduit, et l'observateur ne le voit pas.
    window.addEventListener('resize', mesurer, { passive: true })

    if (typeof ResizeObserver === 'undefined') {
      // Sans observateur, la mesure initiale et le redimensionnement de la
      // fenetre valent mieux que rien : c'est le comportement d'avant, pas une
      // panne.
      return () => {
        window.removeEventListener('resize', mesurer)
      }
    }

    const observateur = new ResizeObserver(() => {
      // On remesure par `getBoundingClientRect` plutot que de lire l'entree :
      // celle-ci donne une taille, jamais une position dans la fenetre.
      mesurer()
    })
    observateur.observe(cible)

    return () => {
      observateur.disconnect()
      window.removeEventListener('resize', mesurer)
    }
  }, [mesurer])

  return { ref, box: etat.box, pret: etat.pret, mesurer }
}
