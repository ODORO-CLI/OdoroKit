/**
 * Barre a loupe : les elements grossissent a l'approche du pointeur.
 *
 * ## Ce que la distance decide
 *
 * Chaque element regarde l'ecart entre son centre et le pointeur, sur l'axe
 * horizontal seulement. En dessous d'un rayon, il grandit ; au-dela, il reste
 * a sa taille. Le profil est une cosinusoide relevee plutot qu'une rampe
 * lineaire : la bosse est arrondie a son sommet et se raccorde a plat sur les
 * bords, si bien que le voisin du voisin ne sursaute pas quand le pointeur
 * franchit sa limite.
 *
 * ## L'agrandissement pousse ses voisins vers le haut, jamais sur les cotes
 *
 * Faire grossir un element dans un flux horizontal deplace tous les suivants,
 * et la barre entiere se met a respirer — ce qui rend le survol imprevisible :
 * la cible bouge pendant qu'on la vise.
 *
 * L'echelle est donc appliquee **depuis le bas** (`transform-origin: bottom`),
 * et la largeur de la boite ne change jamais. L'element grandit vers le haut,
 * ses voisins restent ou ils sont, et l'on clique ou l'on croyait cliquer.
 *
 * ## Aucun rendu React pendant le mouvement
 *
 * Les echelles sont ecrites directement dans le style de chaque element depuis
 * la boucle. Les passer par l'etat provoquerait un rendu de la barre entiere a
 * chaque pixel parcouru par la souris.
 *
 * ## Ce qui reste quand on retire le mouvement
 *
 * Une barre. Sous `prefers-reduced-motion`, plus rien ne grossit — et rien
 * n'est perdu, parce que l'agrandissement n'a jamais porte d'information : les
 * libelles sont la, les cibles sont a leur taille de repos, qui est une vraie
 * taille cliquable.
 *
 * Au doigt, meme chose : il n'y a pas de survol sur un ecran tactile, et une
 * barre dont les elements ne grossissent jamais est exactement ce qu'il faut.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useRef,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Proprietes propres au composant. */
export interface MagnifyDockOwnProps {
  /** Les elements de la barre. Chacun doit rester cliquable au repos. */
  children: ReactNode
  /**
   * Echelle maximale, atteinte quand le pointeur est sur l'element.
   *
   * @defaultValue 1.6
   */
  scale?: number
  /**
   * Rayon d'influence, en pixels.
   *
   * Au-dela, un element ne bouge plus. Trop large, toute la barre gonfle et
   * l'effet se perd ; trop etroit, il devient nerveux.
   *
   * @defaultValue 130
   */
  radius?: number
}

/** Toutes les proprietes. */
export type MagnifyDockProps = Customisable<MagnifyDockOwnProps, 'div'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-magnify-dock'

/** Pose les regles de la barre, une fois par document. */
function ensureDockRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-dock]{display:flex;align-items:flex-end;gap:0.5rem}',
    '[data-o-dock]>*{',
    // Depuis le bas : c'est ce qui fait grandir vers le haut sans pousser les
    // voisins de cote.
    'transform-origin:bottom center;',
    'will-change:transform;',
    // La transition ne sert qu'au retour au repos, quand le pointeur quitte la
    // barre : pendant le survol, c'est la boucle qui ecrit, image par image.
    'transition:transform 260ms cubic-bezier(0.22,1,0.36,1);',
    '}',
    '[data-o-dock-actif]>*{transition:none}',
  ].join('')
  document.head.append(style)
}

/**
 * Une barre dont les elements grossissent a l'approche du pointeur.
 *
 * @example
 * <MagnifyDock>
 *   <button type="button">Accueil</button>
 *   <button type="button">Travaux</button>
 *   <button type="button">Contact</button>
 * </MagnifyDock>
 *
 * @example
 * // Plus ample, et sur un rayon plus etroit.
 * <MagnifyDock scale={2} radius={90}>…</MagnifyDock>
 */
export function MagnifyDock({
  children,
  scale = 1.6,
  radius = 130,
  ...rest
}: MagnifyDockProps): ReactElement {
  const { reduced } = useMotionState()
  const barre = useRef<HTMLDivElement | null>(null)

  ensureDockRule()

  useEffect(() => {
    // Rien a faire sans pointeur fin : pas de survol sur un ecran tactile, et
    // une boucle qui tourne pour un effet qui ne peut pas se produire.
    if (reduced || typeof window === 'undefined') return
    if (window.matchMedia('(pointer: coarse)').matches) return

    const hote = barre.current
    if (hote === null) return

    let x: number | undefined
    let image = 0

    const surEntree = (evenement: PointerEvent) => {
      x = evenement.clientX
      hote.setAttribute('data-o-dock-actif', '')
    }

    const surSortie = () => {
      x = undefined
      hote.removeAttribute('data-o-dock-actif')

      // Le repos est ecrit une fois, et la transition CSS s'en charge : y
      // revenir image par image ferait un retour qu'on ne peut pas courber.
      for (const enfant of hote.children) {
        if (enfant instanceof HTMLElement) enfant.style.transform = ''
      }
    }

    const pas = () => {
      if (x !== undefined) {
        for (const enfant of hote.children) {
          if (!(enfant instanceof HTMLElement)) continue

          const boite = enfant.getBoundingClientRect()
          const centre = boite.left + boite.width / 2
          const ecart = Math.abs(x - centre)

          // Cosinusoide relevee : plate aux bords, arrondie au sommet. Une
          // rampe lineaire produirait une cassure visible au moment ou un
          // element entre dans le rayon.
          const t = Math.min(1, ecart / radius)
          const facteur = (Math.cos(t * Math.PI) + 1) / 2
          const k = 1 + (scale - 1) * facteur

          enfant.style.transform = `scale(${String(k)})`
        }
      }

      image = requestAnimationFrame(pas)
    }

    hote.addEventListener('pointermove', surEntree, { passive: true })
    hote.addEventListener('pointerleave', surSortie, { passive: true })
    image = requestAnimationFrame(pas)

    return () => {
      hote.removeEventListener('pointermove', surEntree)
      hote.removeEventListener('pointerleave', surSortie)
      cancelAnimationFrame(image)
      surSortie()
    }
  }, [reduced, scale, radius])

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={barre}
      className={className}
      style={style as CSSProperties}
      data-o-dock=""
    >
      {children}
    </div>
  )
}
