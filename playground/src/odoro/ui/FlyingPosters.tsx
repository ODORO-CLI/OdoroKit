/**
 * Affiches volantes : une colonne d'affiches qui viennent du fond, se posent
 * de face au milieu de l'ecran, puis filent vers le lecteur.
 *
 * ## La position dans le cadre est la seule variable
 *
 * Chaque affiche mesure la distance de son centre au centre du cadre,
 * ramenee entre moins un et un. En dessous du milieu, elle arrive : elle est
 * loin, inclinee, decalee sur le cote. Au milieu, elle est de face, entiere,
 * a sa place. Au-dessus, elle repart vers l'avant et s'efface.
 *
 * Le cadre de reference est la lucarne qui defile s'il y en a une au-dessus
 * de la colonne, et la fenetre sinon. La distinction compte : dans un cadre
 * haut de trois cents pixels, mesurer contre la fenetre entiere donnerait a
 * toutes les affiches presque la meme distance, et la colonne resterait
 * inerte. L'ecoute, elle, se fait en capture sur le document — le defilement
 * ne remonte pas, et le composant n'a pas a se faire designer son conteneur.
 *
 * ## Toutes les mesures, puis toutes les ecritures
 *
 * Lire une boite apres avoir ecrit une transformation force le navigateur a
 * recalculer la mise en page, et le faire en alternance la fait recalculer
 * autant de fois qu'il y a d'affiches. Les boites sont donc relevees d'abord,
 * en une passe, et les transformations ecrites ensuite, en une autre.
 *
 * ## Une affiche par plan de fuite
 *
 * La perspective est posee sur la case, pas sur la colonne. Une perspective
 * commune a toute la colonne donnerait un point de fuite unique, tres haut ou
 * tres bas selon l'affiche, et les affiches des extremites paraitraient
 * penchees de travers. Chacune a donc son propre plan de fuite, centre sur
 * elle.
 *
 * ## Ce n'est pas la parallaxe
 *
 * La parallaxe decale sur l'axe vertical, dans le plan. Ici l'affiche
 * traverse la profondeur : elle change de taille par la perspective, pivote,
 * et passe devant le plan de l'ecran avant de disparaitre. C'est un
 * deplacement en Z, pas un decalage en Y.
 *
 * ## Mouvement reduit
 *
 * Aucun ecouteur, aucune transformation : une colonne d'affiches a plat,
 * lisibles, a leur etat final.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useEffect, useRef, type CSSProperties, type ReactElement } from 'react'

/** Une affiche de la colonne. */
export interface FlyingPostersItem {
  /** Source de l'image. */
  readonly src: string
  /** Texte de remplacement, obligatoire : c'est le contenu, pas une decoration. */
  readonly alt: string
  /** Legende affichee sous l'affiche. */
  readonly caption?: string
}

/** Proprietes propres au composant. */
export interface FlyingPostersOwnProps {
  /** Les affiches, dans l'ordre de defilement. */
  items: readonly FlyingPostersItem[]
  /** Nom de la serie pour les lecteurs d'ecran. */
  label: string
  /** Distance a laquelle l'affiche attend son tour, en pixels. @defaultValue 420 */
  depth?: number
  /** Inclinaison prise loin du milieu, en degres. @defaultValue 22 */
  tilt?: number
  /** Ecart lateral pris a l'arrivee, en pixels. @defaultValue 60 */
  drift?: number
  /** Espace entre deux affiches, en pixels. @defaultValue 96 */
  gap?: number
  /** Largeur d'une affiche, en pixels. @defaultValue 400 */
  width?: number
}

/** Toutes les proprietes. */
export type FlyingPostersProps = Customisable<FlyingPostersOwnProps, 'ul'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-flying-posters'

/**
 * Le premier ancetre qui defile reellement, ou `null` si c'est la page.
 *
 * « Qui peut defiler » ne suffit pas : un conteneur en `overflow: auto` dont
 * le contenu tient tout entier ne defile pas, et le prendre pour reference
 * figerait la colonne. La hauteur de defilement est donc verifiee aussi.
 */
function scrollingAncestor(depart: HTMLElement): HTMLElement | null {
  let noeud = depart.parentElement
  while (noeud !== null) {
    const debord = getComputedStyle(noeud).overflowY
    if (
      (debord === 'auto' || debord === 'scroll') &&
      noeud.scrollHeight > noeud.clientHeight
    ) {
      return noeud
    }
    noeud = noeud.parentElement
  }
  return null
}

/** Pose la colonne, la scene de chaque affiche et son cadre, une fois par document. */
function ensurePostersRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-fly]{',
    'display:flex;flex-direction:column;align-items:center;gap:var(--o-fly-gap);',
    'margin:0;padding:0;list-style:none;',
    '}',
    // Un plan de fuite par affiche : voir l'en-tete du module.
    '[data-o-fly-case]{width:100%;perspective:var(--o-fly-vue);perspective-origin:50% 50%}',
    '[data-o-fly-affiche]{',
    'margin:0 auto;width:min(100%,var(--o-fly-largeur));',
    'transform-origin:50% 50%;backface-visibility:hidden;',
    '}',
    '[data-o-fly-affiche] img{',
    'display:block;width:100%;aspect-ratio:3 / 4;object-fit:cover;',
    'border-radius:1rem;background:var(--o-theme-surface);',
    'box-shadow:0 0 0 1px var(--o-theme-line),0 30px 60px -40px currentColor;',
    '}',
    '[data-o-fly-affiche] figcaption{',
    'margin-top:0.7rem;text-align:center;font-size:0.8125em;color:var(--o-theme-muted);',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-fly-affiche]{transform:none;opacity:1}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Colonne d'affiches qui traversent la profondeur au defilement.
 *
 * @example
 * <FlyingPosters
 *   label="Saison 2026"
 *   items={[
 *     { src: '/saison/janvier.jpg', alt: 'Affiche de janvier, silhouette au piano', caption: 'Janvier' },
 *     { src: '/saison/mars.jpg', alt: 'Affiche de mars, danseuse de dos', caption: 'Mars' },
 *   ]}
 * />
 *
 * @example
 * // Arrivee plus lointaine, sans ecart lateral.
 * <FlyingPosters label="Serie" items={affiches} depth={700} drift={0} tilt={34} />
 */
export function FlyingPosters({
  items,
  label,
  depth = 420,
  tilt = 22,
  drift = 60,
  gap = 96,
  width = 400,
  ...rest
}: FlyingPostersProps): ReactElement {
  const { reduced } = useMotionState()
  const colonne = useRef<HTMLUListElement | null>(null)
  ensurePostersRules()

  useEffect(() => {
    // A plat, il n'y a rien a suivre : ni ecouteur, ni boucle.
    if (reduced || typeof window === 'undefined') return
    const hote = colonne.current
    if (hote === null) return

    const affiches = Array.from(
      hote.querySelectorAll<HTMLElement>('[data-o-fly-affiche]'),
    )
    const lucarne = scrollingAncestor(hote)
    let image = 0

    const peindre = (): void => {
      image = 0
      // La lucarne fait autorite quand il y en a une : dans un cadre haut de
      // trois cents pixels, mesurer contre la fenetre entiere donnerait a
      // toutes les affiches presque la meme distance, et rien ne bougerait.
      const cadre =
        lucarne === null
          ? { haut: 0, hauteur: window.innerHeight }
          : (() => {
              const boite = lucarne.getBoundingClientRect()
              return { haut: boite.top, hauteur: boite.height }
            })()
      const milieu = cadre.haut + cadre.hauteur / 2
      const demi = Math.max(1, cadre.hauteur / 2)

      // Une passe de lecture, puis une passe d'ecriture : voir l'en-tete.
      const ecarts = affiches.map((affiche) => {
        const boite = affiche.getBoundingClientRect()
        const centre = boite.top + boite.height / 2
        return Math.min(1, Math.max(-1, (centre - milieu) / demi))
      })

      for (const [index, affiche] of affiches.entries()) {
        const d = ecarts[index] ?? 0
        // Loin en arriere tant qu'elle monte ; devant le plan de l'ecran une
        // fois qu'elle l'a franchi, et moitie moins loin : passer trop pres
        // etirerait l'affiche jusqu'a l'illisible.
        const z = d >= 0 ? -d * depth : -d * depth * 0.45
        const cote = index % 2 === 0 ? 1 : -1
        const fondu = d >= 0 ? 0.5 : 0.75

        affiche.style.transform = [
          `translateX(${(d * drift * cote).toFixed(1)}px)`,
          `translateZ(${z.toFixed(1)}px)`,
          `rotateX(${(-d * tilt).toFixed(2)}deg)`,
        ].join(' ')
        affiche.style.opacity = Math.max(0, 1 - Math.abs(d) * fondu).toFixed(3)
      }
    }

    const demander = (): void => {
      if (image !== 0) return
      image = requestAnimationFrame(peindre)
    }

    peindre()
    // En capture : le defilement ne remonte pas, et l'on ne sait pas d'avance
    // lequel des ancetres defile.
    document.addEventListener('scroll', demander, { passive: true, capture: true })
    window.addEventListener('resize', demander, { passive: true })

    return () => {
      document.removeEventListener('scroll', demander, { capture: true })
      window.removeEventListener('resize', demander)
      if (image !== 0) cancelAnimationFrame(image)
    }
  }, [reduced, depth, tilt, drift, items])

  const { className, style } = mergePresentation({}, rest)

  return (
    <ul
      {...rest}
      ref={colonne}
      aria-label={label}
      data-o-fly=""
      className={className}
      style={
        {
          '--o-fly-gap': `${String(gap)}px`,
          '--o-fly-largeur': `${String(width)}px`,
          '--o-fly-vue': `${String(Math.max(600, depth * 2))}px`,
          ...style,
        } as CSSProperties
      }
    >
      {items.map((item) => (
        <li key={item.src} data-o-fly-case="">
          <figure data-o-fly-affiche="">
            <img src={item.src} alt={item.alt} loading="lazy" decoding="async" />
            {item.caption === undefined ? null : <figcaption>{item.caption}</figcaption>}
          </figure>
        </li>
      ))}
    </ul>
  )
}
