/**
 * Carrousel : un rail de diapositives.
 *
 * ## Le defilement natif fait le travail
 *
 * Un carrousel pilote a la main — transformations calculees, gestes captes,
 * inertie simulee — represente plusieurs centaines de lignes, et il est
 * toujours moins bon que celui du navigateur. Il ne connait pas l'inertie du
 * systeme, ignore le defilement horizontal d'un pave tactile, et se comporte
 * differemment sur chaque appareil.
 *
 * Le rail est donc un conteneur a defilement, avec accrochage. Le navigateur
 * apporte gratuitement le geste, l'inertie, la molette, le clavier, et le
 * respect des reglages systeme.
 *
 * ## Ce qui reste a notre charge
 *
 * L'accessibilite, qu'aucun defilement ne donne : un role de groupe, un nom,
 * des diapositives numerotees, et des commandes qui disent ou elles menent.
 * C'est precisement ce que la plupart des carrousels oublient.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import {
  Children,
  useCallback,
  useEffect,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Proprietes propres au composant. */
export interface CarouselOwnProps {
  /** Les diapositives. */
  children: ReactNode
  /** Nom du carrousel, annonce aux technologies d'assistance. */
  label: string
  /** Diapositives visibles a la fois. @defaultValue 1 */
  perView?: number
  /** Ecart entre deux diapositives, en pixels. @defaultValue 16 */
  gap?: number
  /** Revient au debut apres la derniere. @defaultValue false */
  loop?: boolean
}

/** Toutes les proprietes. */
export type CarouselProps = Customisable<CarouselOwnProps>

/** Un bouton de commande, place hors du rail. */
function Control({
  label,
  disabled,
  onClick,
  children,
}: {
  label: string
  disabled: boolean
  onClick: () => void
  children: ReactNode
}): ReactElement {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      className="o-inline-flex o-size-9 o-items-center o-justify-center o-rounded-full o-border-w-1 o-border-current o-bg-transparent o-cursor-pointer disabled:o-opacity-30 disabled:o-cursor-default o-transition-opacity"
    >
      {children}
    </button>
  )
}

/**
 * Rail de diapositives, au geste comme au clavier.
 *
 * @example
 * <Carousel label="Nos realisations" perView={3}>
 *   {projets.map((projet) => (
 *     <article key={projet.id}>…</article>
 *   ))}
 * </Carousel>
 */
export function Carousel({
  children,
  label,
  perView = 1,
  gap = 16,
  loop = false,
  ...rest
}: CarouselProps): ReactElement {
  const slides = Children.toArray(children)
  const [rail, setRail] = useState<HTMLElement | null>(null)
  const [index, setIndex] = useState(0)

  const pages = Math.max(1, slides.length - perView + 1)

  useEffect(() => {
    if (rail === null) return

    // L'index suit le defilement reel plutot que l'inverse : c'est le
    // navigateur qui fait autorite, y compris quand l'utilisateur fait glisser
    // le rail a la main.
    const onScroll = (): void => {
      const step = rail.scrollWidth / Math.max(slides.length, 1)
      setIndex(Math.round(rail.scrollLeft / Math.max(step, 1)))
    }

    rail.addEventListener('scroll', onScroll, { passive: true })
    return () => rail.removeEventListener('scroll', onScroll)
  }, [rail, slides.length])

  const goTo = useCallback(
    (next: number) => {
      if (rail === null) return
      const wrapped = loop
        ? (next + pages) % pages
        : Math.min(Math.max(next, 0), pages - 1)
      const step = rail.scrollWidth / Math.max(slides.length, 1)
      rail.scrollTo({ left: wrapped * step, behavior: 'smooth' })
    },
    [rail, loop, pages, slides.length],
  )

  const { className, style } = mergePresentation(
    { className: 'o-flex o-flex-col o-gap-3' },
    rest,
  )

  return (
    <div {...rest} className={className} style={style}>
      <div
        ref={setRail}
        role="group"
        aria-roledescription="carrousel"
        aria-label={label}
        tabIndex={0}
        className="o-flex o-snap-x o-snap-mandatory o-overflow-x-auto o-scroll-smooth"
        style={{ gap: `${String(gap)}px`, scrollbarWidth: 'none' } as CSSProperties}
      >
        {slides.map((slide, position) => (
          <div
            key={position}
            role="group"
            aria-roledescription="diapositive"
            aria-label={`${String(position + 1)} sur ${String(slides.length)}`}
            className="o-snap-start o-shrink-0"
            style={{
              width: `calc((100% - ${String(gap * (perView - 1))}px) / ${String(perView)})`,
            }}
          >
            {slide}
          </div>
        ))}
      </div>

      <div className="o-flex o-items-center o-gap-2">
        <Control
          label="Diapositive precedente"
          disabled={!loop && index === 0}
          onClick={() => goTo(index - 1)}
        >
          <span aria-hidden>&#8249;</span>
        </Control>
        <Control
          label="Diapositive suivante"
          disabled={!loop && index >= pages - 1}
          onClick={() => goTo(index + 1)}
        >
          <span aria-hidden>&#8250;</span>
        </Control>
        <span className="o-ml-1 o-font-mono o-text-xs o-tabular-nums o-opacity-70">
          {Math.min(index + 1, pages)} / {pages}
        </span>
      </div>
    </div>
  )
}
