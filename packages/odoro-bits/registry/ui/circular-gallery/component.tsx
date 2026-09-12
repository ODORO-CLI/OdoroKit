/**
 * Galerie circulaire : un ruban d'images pose sur un cylindre couche, que
 * l'on fait tourner au doigt, a la molette ou aux fleches.
 *
 * ## Le geste est celui du navigateur, la courbe est a nous
 *
 * Le ruban est une zone qui defile horizontalement avec `scroll-snap-type`.
 * Le glisser, l'inertie du systeme, le defilement lateral d'un pave tactile,
 * la barre de defilement et le calage sur l'image centrale viennent tous du
 * navigateur. Les reecrire donnerait une inertie approximative, differente
 * sur chaque appareil, et un ruban sourd a la molette.
 *
 * Ce que le navigateur ne donne pas, c'est le cylindre : a chaque image
 * utile, chaque vignette recoit une rotation et un recul proportionnels a sa
 * distance au centre du cadre. Ecriture directe sur l'element, jamais par
 * l'etat : sur un ruban de vingt images, un rendu React par pixel parcouru
 * couterait plus cher que tout le reste du composant.
 *
 * ## Les positions sont mesurees une fois
 *
 * Lire la boite de chaque vignette a chaque image melerait lectures et
 * ecritures de mise en page, et la ferait recalculer vingt fois par image.
 * Les centres sont donc releves apres le rendu et au redimensionnement ; la
 * boucle, elle, ne lit qu'une seule valeur — la position de defilement.
 *
 * ## Ce n'est pas le carrousel
 *
 * Le carrousel est un rail plat, avance page par page par deux boutons.
 * Ici il n'y a ni page ni bouton : un ruban continu que l'on pousse, dont
 * l'image du centre est celle qu'on regarde, et dont les voisines fuient en
 * profondeur. Les deux repondent a des envies differentes, et le disent par
 * leur forme.
 *
 * ## Mouvement reduit
 *
 * Le cylindre s'aplatit — plus de rotation, plus de recul — et le calage aux
 * fleches se fait sans glissement. Le ruban reste un ruban : il defile, il se
 * cale, rien n'est perdu.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
} from 'react'

/** Une image du ruban. */
export interface CircularGalleryItem {
  /** Source de l'image. */
  readonly src: string
  /** Texte de remplacement, obligatoire : c'est le contenu, pas une decoration. */
  readonly alt: string
  /** Legende affichee sous l'image. */
  readonly caption?: string
}

/** Proprietes propres au composant. */
export interface CircularGalleryOwnProps {
  /** Les images du ruban, dans l'ordre. */
  items: readonly CircularGalleryItem[]
  /** Nom de la galerie, annonce aux technologies d'assistance. */
  label: string
  /** Largeur d'une image, en pixels. @defaultValue 260 */
  width?: number
  /** Hauteur d'une image, en pixels. @defaultValue 320 */
  height?: number
  /** Ecart entre deux images, en pixels. @defaultValue 24 */
  gap?: number
  /** Inclinaison ajoutee par image d'ecart au centre, en degres. @defaultValue 26 */
  curve?: number
  /** Recul ajoute par image d'ecart au centre, en pixels. @defaultValue 120 */
  depth?: number
}

/** Toutes les proprietes. */
export type CircularGalleryProps = Customisable<CircularGalleryOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-circular-gallery'

/** Pose le ruban, ses vignettes et son cylindre, une fois par document. */
function ensureGalleryRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-cgal]{',
    // `overflow-y` doit etre dit. La regle en cascade veut qu un axe a `auto`
    // force l autre a `auto` des qu il vaut `visible` : le ruban devenait
    // alors un conteneur a defilement VERTICAL, invisible parce que la barre
    // est masquee, et il avalait la molette — la page entiere se figeait sous
    // le pointeur. Le cylindre deborde en hauteur par construction, donc le
    // debordement vertical doit etre coupe, jamais parcouru.
    'position:relative;overflow-x:auto;overflow-y:hidden;overscroll-behavior-x:contain;',
    'scroll-snap-type:x mandatory;scrollbar-width:none;',
    // Les extremites s'effacent : le ruban n'a pas de bord franc.
    '-webkit-mask-image:linear-gradient(to right,transparent,currentColor 12%,currentColor 88%,transparent);',
    'mask-image:linear-gradient(to right,transparent,currentColor 12%,currentColor 88%,transparent);',
    '}',
    '[data-o-cgal]::-webkit-scrollbar{display:none}',
    '[data-o-cgal]:focus-visible{outline:2px solid var(--o-cgal-accent);outline-offset:3px;border-radius:1rem}',
    '[data-o-cgal-piste]{',
    'display:flex;align-items:center;gap:var(--o-cgal-gap);',
    'margin:0;padding-block:1.5rem;list-style:none;',
    // La moitie d'un cadre de chaque cote : sans elle, la premiere et la
    // derniere image ne pourraient jamais atteindre le centre.
    'padding-inline:calc(50% - var(--o-cgal-width) / 2);',
    'perspective:900px;',
    '}',
    '[data-o-cgal-vignette]{',
    'flex:0 0 var(--o-cgal-width);scroll-snap-align:center;',
    'transform-style:preserve-3d;backface-visibility:hidden;',
    '}',
    '[data-o-cgal-vignette]>figure{margin:0}',
    '[data-o-cgal-vignette] img{',
    'display:block;width:100%;height:var(--o-cgal-height);object-fit:cover;',
    'border-radius:1rem;background:var(--o-theme-surface);',
    '}',
    '[data-o-cgal-vignette] figcaption{',
    'margin-top:0.7rem;text-align:center;font-size:0.8125em;color:var(--o-theme-muted);',
    'opacity:0;transition:opacity var(--o-duration-base) linear;',
    '}',
    // Seule l'image calee au centre porte sa legende : trois legendes lisibles
    // a la fois, ce serait trois titres qui se disputent le regard.
    '[data-o-cgal-vignette][data-o-cgal-actif] figcaption{opacity:1}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-cgal-vignette]{transform:none}',
    '[data-o-cgal-vignette] figcaption{transition:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Ruban d'images sur un cylindre, au geste comme au clavier.
 *
 * @example
 * <CircularGallery
 *   label="Collection printemps"
 *   items={[
 *     { src: '/looks/un.jpg', alt: 'Manteau de laine ecrue', caption: 'Manteau Ostende' },
 *     { src: '/looks/deux.jpg', alt: 'Robe longue en lin', caption: 'Robe Sables' },
 *   ]}
 * />
 *
 * @example
 * // Un ruban plat, en vignettes plus petites.
 * <CircularGallery label="Miniatures" items={photos} width={160} height={200} curve={0} depth={0} />
 */
export function CircularGallery({
  items,
  label,
  width = 260,
  height = 320,
  gap = 24,
  curve = 26,
  depth = 120,
  ...rest
}: CircularGalleryProps): ReactElement {
  const { reduced } = useMotionState()
  const rail = useRef<HTMLDivElement | null>(null)
  /** Centres des vignettes dans la piste, releves apres le rendu. */
  const centres = useRef<number[]>([])
  const frame = useRef(0)
  ensureGalleryRules()

  /** Incline et recule chaque vignette selon sa distance au centre du cadre. */
  const peindre = useCallback((): void => {
    frame.current = 0
    const hote = rail.current
    if (hote === null) return

    const milieu = hote.scrollLeft + hote.clientWidth / 2
    const pas = width + gap
    const vignettes = hote.querySelectorAll<HTMLElement>('[data-o-cgal-vignette]')

    for (const [index, vignette] of Array.from(vignettes).entries()) {
      const centre = centres.current[index]
      if (centre === undefined) continue
      const ecart = (centre - milieu) / pas
      const borne = Math.min(1, Math.abs(ecart) / 2.5)

      vignette.style.transform = reduced
        ? ''
        : [
            `rotateY(${(-ecart * curve).toFixed(2)}deg)`,
            `translateZ(${(-Math.abs(ecart) * depth).toFixed(1)}px)`,
          ].join(' ')
      vignette.style.opacity = (1 - borne * 0.55).toFixed(3)
      // L'attribut porte l'etat visuel de l'image calee. Le passer par React
      // rerendrait le ruban entier a chaque pixel parcouru.
      if (Math.abs(ecart) < 0.5) vignette.setAttribute('data-o-cgal-actif', '')
      else vignette.removeAttribute('data-o-cgal-actif')
    }
  }, [curve, depth, gap, reduced, width])

  /** Releve les centres, puis repeint. A refaire des que la largeur change. */
  const mesurer = useCallback((): void => {
    const hote = rail.current
    if (hote === null) return
    centres.current = Array.from(
      hote.querySelectorAll<HTMLElement>('[data-o-cgal-vignette]'),
    ).map((vignette) => vignette.offsetLeft + vignette.offsetWidth / 2)
    peindre()
  }, [peindre])

  useLayoutEffect(() => {
    mesurer()
  }, [mesurer, items, height])

  useEffect(() => {
    const hote = rail.current
    if (hote === null || typeof ResizeObserver === 'undefined') return
    const observateur = new ResizeObserver(mesurer)
    observateur.observe(hote)
    return () => {
      observateur.disconnect()
    }
  }, [mesurer])

  useEffect(
    () => () => {
      if (frame.current !== 0) cancelAnimationFrame(frame.current)
    },
    [],
  )

  const onScroll = (): void => {
    if (frame.current !== 0 || typeof requestAnimationFrame !== 'function') return
    frame.current = requestAnimationFrame(peindre)
  }

  /** Les fleches poussent le ruban d'une image ; Origine et Fin aux bouts. */
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const hote = rail.current
    if (hote === null) return
    const pas = width + gap
    const cibles: Readonly<Record<string, number | undefined>> = {
      ArrowRight: hote.scrollLeft + pas,
      ArrowLeft: hote.scrollLeft - pas,
      Home: 0,
      End: hote.scrollWidth,
    }
    const cible = cibles[event.key]
    if (cible === undefined) return
    event.preventDefault()
    hote.scrollTo({ left: cible, behavior: reduced ? 'auto' : 'smooth' })
  }

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={rail}
      role="group"
      aria-roledescription="galerie"
      aria-label={label}
      tabIndex={0}
      data-o-cgal=""
      className={className}
      style={
        {
          '--o-cgal-accent': 'var(--o-palette-brand-500)',
          '--o-cgal-width': `${String(width)}px`,
          '--o-cgal-height': `${String(height)}px`,
          '--o-cgal-gap': `${String(gap)}px`,
          ...style,
        } as CSSProperties
      }
      onScroll={(event) => {
        onScroll()
        rest.onScroll?.(event)
      }}
      onKeyDown={(event) => {
        onKeyDown(event)
        rest.onKeyDown?.(event)
      }}
    >
      <ul data-o-cgal-piste="">
        {items.map((item) => (
          <li key={item.src} data-o-cgal-vignette="">
            <figure>
              <img src={item.src} alt={item.alt} loading="lazy" decoding="async" />
              {item.caption === undefined ? null : (
                <figcaption>{item.caption}</figcaption>
              )}
            </figure>
          </li>
        ))}
      </ul>
    </div>
  )
}
