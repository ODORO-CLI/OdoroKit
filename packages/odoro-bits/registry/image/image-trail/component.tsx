/**
 * Trainee d'images : le deplacement du pointeur seme des vignettes qui
 * apparaissent au point de passage puis se resorbent.
 *
 * ## Les vignettes ne passent pas par React
 *
 * Chaque vignette vit moins d'une seconde. La monter comme composant
 * demanderait un etat de liste, un rendu par semis et un autre par retrait —
 * pour des elements que rien ne relit jamais. Elles sont donc creees en
 * imperatif, animees par `element.animate`, et retirees du document a la fin
 * de leur course. Le composant garde seulement leur trace pour nettoyer au
 * demontage.
 *
 * ## Le seuil de distance est ce qui fait la trainee
 *
 * Semer a chaque evenement de pointeur donnerait un tapis continu — des
 * dizaines de vignettes par geste, toutes au meme endroit. Une vignette ne
 * nait que lorsque le pointeur s'est eloigne du dernier semis d'une distance
 * donnee : c'est elle qui espace la trainee, et elle qui borne le cout.
 *
 * ## Sous mouvement reduit
 *
 * La zone est inerte et la premiere image s'affiche, centree et fixe : le
 * contenu — montrer ces images — reste, seul le jeu disparait.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useEffect, useRef, type ReactElement, type ReactNode } from 'react'

/** Une image de la trainee. */
export interface TrailImage {
  /** Source. */
  readonly src: string
  /** Texte de remplacement, pour l'image de repli sous mouvement reduit. */
  readonly alt: string
}

/** Proprietes propres au composant. */
export interface ImageTrailOwnProps {
  /** Les images semees, en cycle. */
  sources: readonly TrailImage[]
  /** Distance entre deux semis, en pixels. @defaultValue 80 */
  threshold?: number
  /** Duree de vie d'une vignette, en millisecondes. @defaultValue 700 */
  life?: number
  /** Cote d'une vignette, en pixels. @defaultValue 140 */
  size?: number
  /** Contenu affiche sous la trainee. */
  children?: ReactNode
}

/** Toutes les proprietes. */
export type ImageTrailProps = Customisable<ImageTrailOwnProps>

/**
 * Seme des vignettes sur le passage du pointeur.
 *
 * @example
 * <ImageTrail
 *   sources={[
 *     { src: '/un.jpg', alt: 'Premiere planche' },
 *     { src: '/deux.jpg', alt: 'Deuxieme planche' },
 *     { src: '/trois.jpg', alt: 'Troisieme planche' },
 *   ]}
 *   className="o-h-96"
 * >
 *   <h2>Nos dernieres planches</h2>
 * </ImageTrail>
 */
export function ImageTrail({
  sources,
  threshold = 80,
  life = 700,
  size = 140,
  children,
  ...rest
}: ImageTrailProps): ReactElement {
  const { reduced } = useMotionState()
  const host = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    if (reduced || sources.length === 0) return

    const zone = host.current
    if (zone === null) return

    // Les vignettes vivantes, pour ne rien laisser au demontage.
    const alive = new Set<HTMLImageElement>()
    let lastX: number | null = null
    let lastY: number | null = null
    let cursor = 0

    const sow = (x: number, y: number): void => {
      const source = sources[cursor % sources.length]
      if (source === undefined) return
      cursor += 1

      const thumb = document.createElement('img')
      thumb.src = source.src
      // La vignette est un eclat decoratif : le contenu est deja porte par
      // l'image de repli et par ce que la zone affiche.
      thumb.alt = ''
      thumb.setAttribute('aria-hidden', 'true')
      thumb.className =
        'o-absolute o-object-cover o-rounded-lg o-pointer-events-none o-select-none'
      thumb.style.width = `${String(size)}px`
      thumb.style.height = `${String(size)}px`
      thumb.style.left = `${String(x)}px`
      thumb.style.top = `${String(y)}px`

      zone.append(thumb)
      alive.add(thumb)

      const animation = thumb.animate(
        [
          { opacity: 0, transform: 'translate(-50%, -50%) scale(0.5)' },
          {
            opacity: 1,
            transform: 'translate(-50%, -50%) scale(1)',
            offset: 0.25,
          },
          { opacity: 0, transform: 'translate(-50%, -50%) scale(1.06)' },
        ],
        { duration: life, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
      )

      // L'animation finit a opacite nulle : le retrait ne se voit pas, il ne
      // fait que rendre la memoire.
      animation.onfinish = () => {
        alive.delete(thumb)
        thumb.remove()
      }
    }

    const onMove = (event: PointerEvent): void => {
      const box = zone.getBoundingClientRect()
      const x = event.clientX - box.left
      const y = event.clientY - box.top

      if (lastX !== null && lastY !== null) {
        // Le seuil espace la trainee et borne le cout : voir l'en-tete.
        if (Math.hypot(x - lastX, y - lastY) < threshold) return
      }

      lastX = x
      lastY = y
      sow(x, y)
    }

    const onLeave = (): void => {
      // Le prochain passage resemera des l'entree, sans attendre le seuil.
      lastX = null
      lastY = null
    }

    zone.addEventListener('pointermove', onMove, { passive: true })
    zone.addEventListener('pointerleave', onLeave, { passive: true })

    return () => {
      zone.removeEventListener('pointermove', onMove)
      zone.removeEventListener('pointerleave', onLeave)
      for (const thumb of alive) thumb.remove()
      alive.clear()
    }
  }, [reduced, sources, threshold, life, size])

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  const first = sources[0]

  return (
    <div {...rest} ref={host} className={className} style={style}>
      {children}

      {/* Sous mouvement reduit, la zone est inerte : la premiere image,
          centree et fixe, porte le contenu que la trainee aurait montre. */}
      {reduced && first !== undefined ? (
        <div className="o-absolute o-inset-0 o-flex o-items-center o-justify-center o-pointer-events-none">
          <img
            src={first.src}
            alt={first.alt}
            className="o-object-cover o-rounded-lg"
            style={{ width: `${String(size)}px`, height: `${String(size)}px` }}
          />
        </div>
      ) : null}
    </div>
  )
}
