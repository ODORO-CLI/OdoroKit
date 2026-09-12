/**
 * Palettes : chaque caractere defile sur des demi-cartes articulees.
 *
 * ## Deux moities, deux volets
 *
 * Une cellule est faite de quatre calques superposes : la moitie haute fixe,
 * la moitie basse fixe, et deux volets qui pivotent. Un battement se joue en
 * deux temps. Le volet du haut porte le caractere en place et tombe vers
 * l'avant, decouvrant derriere lui la moitie haute qui affiche deja le
 * caractere suivant ; a mi-course, le volet du bas repart de l'horizontale
 * avec ce meme caractere suivant et vient se plaquer sur la moitie basse, qui
 * ne prend le nouveau caractere qu'a la toute fin.
 *
 * C'est ce decalage qui fait la carte : a aucun moment on ne voit un
 * caractere se substituer a un autre, on voit un panneau retomber.
 *
 * ## Une echeance par cellule, pas un minuteur par cellule
 *
 * Chaque cellule sait la date de son prochain battement. La boucle du moteur
 * compare, et declenche celles qui sont a l'heure. Une vingtaine de
 * comparaisons par image coutent moins que vingt minuteurs qui se reveillent
 * chacun de leur cote, et le decalage entre cellules reste juste quelle que
 * soit la cadence de l'ecran.
 *
 * Le battement lui-meme est confie au compositeur : deux rotations par carte
 * tournee, rien d'anime en JavaScript.
 *
 * ## Le texte juste est l'etat de depart
 *
 * Les faces sont rendues avec le caractere final. C'est le code du battage
 * qui les remet a la carte vierge avant de faire defiler : si ce code ne
 * tourne jamais, le tableau affiche deja ce qu'il doit afficher.
 *
 * ## Le decoupage est un artifice d'affichage
 *
 * Le texte complet figure une fois, d'un seul tenant ; les cellules sont
 * retirees de l'arbre d'accessibilite. Les espaces ne sont pas des cartes :
 * un tableau de gare separe ses mots par du vide, pas par une palette qui
 * tourne.
 *
 * ## Mouvement reduit
 *
 * Aucune cellule, aucun battement : le texte est rendu tel quel. C'est l'etat
 * d'arrivee.
 *
 * @module
 */

import {
  CLOCK_PRIORITY,
  clock,
  mergePresentation,
  useMotionState,
  type Customisable,
} from '@odoro-cli/engine'
import { useEffect, type CSSProperties, type ElementType, type ReactElement } from 'react'

import { useInView } from '@registre/hooks/useInView'

/** Ce qui declenche le battage. */
export type SplitFlapDeclenchement = 'montage' | 'vue' | 'survol'

/** Proprietes propres au composant. */
export interface SplitFlapOwnProps {
  /** Texte a afficher. */
  children: string
  /** Balise rendue. @defaultValue 'span' */
  as?: ElementType
  /**
   * Caracteres du rouleau, dans l'ordre ou les cartes defilent.
   *
   * Le premier est la carte vierge : c'est de lui que part chaque cellule.
   * Tout caractere du texte absent de cette liste y est ajoute, sans quoi il
   * serait injoignable.
   */
  alphabet?: string
  /** Duree d'un battement, en millisecondes. @defaultValue 90 */
  interval?: number
  /** Retard de depart entre deux cellules, en millisecondes. @defaultValue 60 */
  step?: number
  /** Largeur minimale d'une carte, en cadratins. @defaultValue 0.72 */
  largeur?: number
  /**
   * Quand battre.
   *
   * `vue` attend l'entree dans le champ, `montage` part tout de suite,
   * `survol` rejoue a chaque entree du pointeur.
   *
   * @defaultValue 'vue'
   */
  declenchement?: SplitFlapDeclenchement
}

/** Toutes les proprietes. */
export type SplitFlapProps = Customisable<SplitFlapOwnProps, 'span'>

/** Espace insecable : une espace ordinaire s'ecrase dans un bloc en ligne. */
const NBSP = ' '

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-split-flap'

/**
 * Rouleau par defaut : la carte vierge, puis les capitales, les chiffres et
 * la ponctuation d'un tableau de depart.
 */
const ALPHABET = ' ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789.,:;!?-'

/** Distance de fuite : assez courte pour que le volet ait une epaisseur. */
const FUITE = '380px'

/** Pose la mecanique des cartes, une fois par document. */
function ensureFlapRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-flap]{display:inline-block}',
    '[data-o-flap-cell]{',
    'position:relative;display:inline-block;text-align:center;',
    'min-width:var(--o-flap-largeur);perspective:var(--o-flap-fuite);',
    '}',
    // La ligne de partage passe au-dessus de tout : c'est la ou la carte se
    // coupe, y compris quand un volet est en train de tomber devant.
    '[data-o-flap-cell]::after{',
    'content:"";position:absolute;left:0;right:0;top:50%;height:1px;z-index:3;',
    'background-color:color-mix(in oklab, currentColor 30%, transparent);',
    '}',
    // La reserve donne a la cellule sa largeur et sa hauteur : les quatre
    // calques sont absolus et ne mesurent rien.
    '[data-o-flap-sizer]{visibility:hidden}',
    '[data-o-flap-half],[data-o-flap-leaf]{',
    'position:absolute;left:0;right:0;height:50%;overflow:hidden;',
    'backface-visibility:hidden;',
    'background-color:color-mix(in oklab, currentColor 7%, transparent);',
    '}',
    '[data-o-flap-half]{z-index:1}',
    '[data-o-flap-leaf]{z-index:2;opacity:0}',
    '[data-o-flap-half="haut"],[data-o-flap-leaf="haut"]{top:0;transform-origin:50% 100%}',
    '[data-o-flap-half="bas"],[data-o-flap-leaf="bas"]{top:50%;transform-origin:50% 0%}',
    // Le glyphe occupe la hauteur entiere de la cellule dans chaque moitie :
    // c'est la fenetre qui en montre le haut ou le bas, jamais deux dessins
    // differents qu'il faudrait faire coincider.
    '[data-o-flap-glyphe]{',
    'position:absolute;left:0;right:0;top:0;height:200%;',
    'display:flex;align-items:center;justify-content:center;',
    '}',
    '[data-o-flap-half="bas"] [data-o-flap-glyphe],',
    '[data-o-flap-leaf="bas"] [data-o-flap-glyphe]{top:-100%}',
  ].join('')
  document.head.append(style)
}

/** Ce qu'une cellule retient entre deux battements. */
interface Cellule {
  /** Glyphe de la moitie haute fixe. Il porte aussi la carte visee. */
  readonly haut: HTMLElement
  /** Glyphe de la moitie basse fixe. */
  readonly bas: HTMLElement
  /** Volet superieur. */
  readonly voletHaut: HTMLElement
  /** Glyphe du volet superieur. */
  readonly glypheHaut: HTMLElement
  /** Volet inferieur. */
  readonly voletBas: HTMLElement
  /** Glyphe du volet inferieur. */
  readonly glypheBas: HTMLElement
  /** Position courante sur le rouleau. */
  rang: number
  /** Battements qui restent a jouer. */
  restant: number
  /** Date du prochain battement. */
  echeance: number
  /** Animations en cours, pour pouvoir les annuler. */
  animations: Animation[]
}

/** Lit un calque d'une cellule. */
function partie(cellule: Element, selecteur: string): HTMLElement | null {
  return cellule.querySelector<HTMLElement>(selecteur)
}

/**
 * Affiche un texte comme un tableau de departs a palettes.
 *
 * @example
 * <SplitFlap as="h1" className="o-text-5xl o-font-bold">
 *   Odoro
 * </SplitFlap>
 *
 * @example
 * // Rouleau de chiffres seuls, battement rapide, rejoue au survol.
 * <SplitFlap alphabet=" 0123456789" interval={60} declenchement="survol">
 *   1842
 * </SplitFlap>
 */
export function SplitFlap({
  children,
  as: Tag = 'span',
  alphabet = ALPHABET,
  interval = 90,
  step = 60,
  largeur = 0.72,
  declenchement = 'vue',
  ...rest
}: SplitFlapProps): ReactElement {
  const { reduced } = useMotionState()
  const { ref, vu } = useInView<HTMLElement>({
    immediat: declenchement === 'montage',
  })

  ensureFlapRule()

  // Le texte affiche est en capitales : c'est la convention du tableau, et
  // elle evite d'avoir a doubler le rouleau. Le texte annonce, lui, garde sa
  // casse d'origine.
  const affiche = children.toLocaleUpperCase()

  // Tout caractere du texte absent du rouleau y est ajoute : sans cela la
  // cellule tournerait sans fin sans jamais tomber sur sa carte.
  const rouleau = [...alphabet]
  for (const caractere of affiche) {
    if (caractere !== ' ' && !rouleau.includes(caractere)) rouleau.push(caractere)
  }
  const rouleauTexte = rouleau.join('')

  useEffect(() => {
    const element = ref.current
    if (element === null || reduced) return

    const cartes = [...rouleauTexte]
    const total = cartes.length
    if (total < 2) return

    const vierge = cartes[0] ?? NBSP

    const cellules: Cellule[] = []
    for (const noeud of element.querySelectorAll('[data-o-flap-cell]')) {
      const haut = partie(noeud, '[data-o-flap-half="haut"] [data-o-flap-glyphe]')
      const bas = partie(noeud, '[data-o-flap-half="bas"] [data-o-flap-glyphe]')
      const voletHaut = partie(noeud, '[data-o-flap-leaf="haut"]')
      const voletBas = partie(noeud, '[data-o-flap-leaf="bas"]')
      const glypheHaut = partie(noeud, '[data-o-flap-leaf="haut"] [data-o-flap-glyphe]')
      const glypheBas = partie(noeud, '[data-o-flap-leaf="bas"] [data-o-flap-glyphe]')
      if (
        haut === null ||
        bas === null ||
        voletHaut === null ||
        voletBas === null ||
        glypheHaut === null ||
        glypheBas === null
      ) {
        continue
      }
      cellules.push({
        haut,
        bas,
        voletHaut,
        glypheHaut,
        voletBas,
        glypheBas,
        rang: 0,
        restant: 0,
        echeance: 0,
        animations: [],
      })
    }
    if (cellules.length === 0) return

    let abonnement: { unsubscribe(): void } | null = null

    const arreter = (): void => {
      abonnement?.unsubscribe()
      abonnement = null
      for (const cellule of cellules) {
        for (const animation of cellule.animations) animation.cancel()
        cellule.animations = []
        cellule.restant = 0
      }
    }

    /** Joue un battement : le volet du haut tombe, celui du bas se plaque. */
    const battre = (cellule: Cellule): void => {
      const suivant = (cellule.rang + 1) % total
      const enPlace = cartes[cellule.rang] ?? vierge
      const aVenir = cartes[suivant] ?? vierge

      // La moitie haute prend tout de suite le caractere a venir : c'est ce
      // que le volet decouvre en tombant.
      cellule.haut.textContent = aVenir
      cellule.glypheHaut.textContent = enPlace
      cellule.glypheBas.textContent = aVenir

      const demi = Math.max(1, interval / 2)

      const chute = cellule.voletHaut.animate(
        [
          { transform: 'rotateX(0deg)', opacity: 1 },
          { transform: 'rotateX(-90deg)', opacity: 1 },
        ],
        { duration: demi, easing: 'ease-in', fill: 'none' },
      )
      const pose = cellule.voletBas.animate(
        [
          { transform: 'rotateX(90deg)', opacity: 1 },
          { transform: 'rotateX(0deg)', opacity: 1 },
        ],
        { duration: demi, delay: demi, easing: 'ease-out', fill: 'forwards' },
      )
      // Le volet tient sa pose jusqu'a ce que la moitie basse ait pris le
      // relais : sans ce recouvrement, une image montrerait l'ancien
      // caractere revenu.
      pose.onfinish = (): void => {
        cellule.bas.textContent = aVenir
        pose.cancel()
      }

      cellule.animations = [chute, pose]
      cellule.rang = suivant
    }

    const jouer = (): void => {
      arreter()

      const depart = performance.now()
      cellules.forEach((cellule, index) => {
        const vise = cartes.indexOf(cellule.haut.dataset['oFlapCible'] ?? '')
        const cible = vise < 0 ? 0 : vise

        cellule.rang = 0
        cellule.haut.textContent = vierge
        cellule.bas.textContent = vierge
        cellule.glypheHaut.textContent = vierge
        cellule.glypheBas.textContent = vierge

        // Une cellule deja sur sa carte ferait un tour complet plutot que de
        // rester immobile pendant que ses voisines tournent.
        cellule.restant = cible === 0 ? total : cible
        cellule.echeance = depart + index * step
      })

      abonnement = clock.subscribe(
        () => {
          const maintenant = performance.now()
          let reste = 0
          for (const cellule of cellules) {
            if (cellule.restant <= 0) continue
            reste += 1
            if (maintenant < cellule.echeance) continue
            battre(cellule)
            cellule.restant -= 1
            cellule.echeance = maintenant + interval
          }
          // Le tableau s'est pose : plus rien a comparer.
          if (reste === 0) {
            abonnement?.unsubscribe()
            abonnement = null
          }
        },
        { name: 'palettes', priority: CLOCK_PRIORITY.layout },
      )
    }

    if (declenchement === 'survol') {
      const entrer = (): void => {
        jouer()
      }
      element.addEventListener('pointerenter', entrer)
      return () => {
        element.removeEventListener('pointerenter', entrer)
        arreter()
      }
    }

    if (!vu) {
      // Les cartes vierges sont posees ici, pas dans le rendu : voir
      // l'en-tete. Sans cela, le tableau afficherait son texte puis se
      // viderait d'un coup en entrant dans le champ.
      for (const cellule of cellules) {
        cellule.haut.textContent = vierge
        cellule.bas.textContent = vierge
      }
      return
    }

    jouer()
    return arreter
  }, [ref, reduced, vu, affiche, rouleauTexte, interval, step, declenchement])

  const { className, style } = mergePresentation({}, rest)

  // Mouvement reduit : le texte est la, pose, sans cellules.
  if (reduced) {
    return (
      <Tag {...rest} className={className} style={style}>
        {children}
      </Tag>
    )
  }

  const styleRacine = {
    ...style,
    '--o-flap-largeur': `${String(largeur)}em`,
    '--o-flap-fuite': FUITE,
  } as CSSProperties

  const caracteres = [...affiche]

  return (
    <Tag {...rest} ref={ref} className={className} style={styleRacine} data-o-flap="">
      {/* Le texte complet, d'un seul tenant, pour les lecteurs d'ecran. */}
      <span className="o-sr-only">{children}</span>
      <span aria-hidden>
        {caracteres.map((caractere, index) =>
          caractere === ' ' ? (
            <span key={`espace-${String(index)}`}>{NBSP}</span>
          ) : (
            <span key={`${caractere}-${String(index)}`} data-o-flap-cell="">
              <span data-o-flap-sizer="">{caractere}</span>
              <span data-o-flap-half="haut">
                {/* La carte visee voyage sur le noeud : le battage la relit au
                    depart, sans redescendre dans le rendu React. */}
                <span data-o-flap-glyphe="" data-o-flap-cible={caractere}>
                  {caractere}
                </span>
              </span>
              <span data-o-flap-half="bas">
                <span data-o-flap-glyphe="">{caractere}</span>
              </span>
              <span data-o-flap-leaf="haut">
                <span data-o-flap-glyphe="">{caractere}</span>
              </span>
              <span data-o-flap-leaf="bas">
                <span data-o-flap-glyphe="">{caractere}</span>
              </span>
            </span>
          ),
        )}
      </span>
    </Tag>
  )
}
