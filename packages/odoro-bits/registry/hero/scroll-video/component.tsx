/**
 * Heros video : le defilement fait avancer la video, image par image.
 *
 * ## Le verrou de page a ete retire, et c'est le point important
 *
 * L'implementation d'origine posait `position: fixed` sur `document.body` et
 * captait la molette pour la detourner vers `video.currentTime`. Son propre
 * commentaire l'assumait : « aucune soupape dans un sens ni dans l'autre ».
 *
 * Cela produit un cul-de-sac. Une page ainsi verrouillee ne se quitte pas au
 * clavier — ni `Page suivante`, ni `Fin`, ni `Tab` ne font quoi que ce soit,
 * puisque la page ne defile plus. Un lecteur d'ecran n'a plus de document a
 * parcourir. Une tablette sans molette n'a que le geste tactile, lui aussi
 * capte. Et la barre de defilement disparait, donc rien n'indique qu'il se
 * passe quelque chose.
 *
 * Le meme rendu s'obtient sans rien verrouiller : une enveloppe haute de
 * plusieurs hauteurs de fenetre, une scene collante a l'interieur, et la
 * progression du defilement — reelle — qui pilote la video. Le defilement
 * clavier fonctionne, la barre indique ou l'on en est, et quitter la section
 * consiste a continuer de defiler.
 *
 * ## La file d'attente des recherches
 *
 * `currentTime` ne se pose pas a chaque image : une recherche en cours ignore
 * les suivantes, et les demandes s'empilent jusqu'a ce que la video parte en
 * arriere. La derniere valeur demandee est donc retenue, et appliquee au
 * `seeked` suivant — une recherche a la fois, toujours vers la position la plus
 * recente. C'est la seule facon d'obtenir un defilement fluide, et elle vient
 * de l'implementation d'origine.
 *
 * ## Ce que la video doit etre
 *
 * Une video ordinaire ne se parcourt pas image par image : sans images cles
 * rapprochees, chaque recherche decode depuis la precedente, et le rendu
 * saccade. Un encodage a intervalle court — une image cle toutes les dix a
 * quinze images — est ce qui fait la difference entre l'effet et son echec.
 *
 * @module
 */

import {
  CLOCK_PRIORITY,
  clock,
  mergePresentation,
  useMotionState,
  useScrollScrub,
  type Customisable,
} from '@odoro-cli/engine'
import { useEffect, useRef, useState, type ReactElement, type ReactNode } from 'react'

/** Proprietes propres au composant. */
export interface ScrollVideoOwnProps {
  /** Source de la video. Obligatoire : le registre n'en embarque aucune. */
  src: string
  /** Image affichee tant que la video n'est pas decodable. */
  poster?: string
  /** Titre, efface a mesure que la video avance. */
  title?: ReactNode
  /** Phrase revelee a la fin de la course. */
  tagline?: ReactNode
  /** Invitation a defiler, effacee au premier mouvement. @defaultValue 'Defiler' */
  hint?: ReactNode
  /**
   * Longueur de la course, en hauteurs de fenetre. Trois signifie qu'il faut
   * trois ecrans de defilement pour parcourir la video entiere.
   *
   * @defaultValue 3
   */
  range?: number
  /**
   * Vitesse de rattrapage de la position visee. Plus haut, plus sec.
   *
   * @defaultValue 6
   */
  ease?: number
  /** Texte de remplacement de la video, pour ce qui ne peut pas la lire. */
  description?: string
}

/** Toutes les proprietes. */
export type ScrollVideoProps = Customisable<ScrollVideoOwnProps, 'section'>

/** Borne une valeur entre zero et un. */
function unit(value: number): number {
  return Math.min(1, Math.max(0, value))
}

/**
 * Heros dont la video avance avec le defilement.
 *
 * @example
 * <ScrollVideo
 *   src="/videos/ville.mp4"
 *   poster="/videos/ville.jpg"
 *   title="La ville s ouvre"
 *   tagline="Chaque porte est deja ouverte."
 * />
 *
 * @example
 * // Une course plus longue laisse plus de defilement pour la meme video.
 * <ScrollVideo src="/videos/atelier.mp4" range={5} />
 */
export function ScrollVideo({
  src,
  poster,
  title,
  tagline,
  hint = 'Defiler',
  range = 3,
  ease = 6,
  description,
  ...rest
}: ScrollVideoProps): ReactElement {
  const { reduced } = useMotionState()
  const video = useRef<HTMLVideoElement | null>(null)
  const titleRef = useRef<HTMLDivElement | null>(null)
  const taglineRef = useRef<HTMLDivElement | null>(null)
  const hintRef = useRef<HTMLDivElement | null>(null)
  const barRef = useRef<HTMLDivElement | null>(null)

  const [loaded, setLoaded] = useState(false)

  /** Position visee, ecrite par le defilement, lue par la boucle. */
  const target = useRef(0)
  /** Position affichee, rapprochee de la cible a chaque image. */
  const shown = useRef(0)

  const { ref } = useScrollScrub<HTMLDivElement>(
    (progress) => {
      target.current = progress
      // Sous mouvement reduit, la progression arrive une fois, a un : il n'y a
      // pas de boucle pour la reprendre, donc elle est appliquee ici meme.
      if (reduced) {
        shown.current = progress
        paint(progress)
      }
    },
    { start: 'top top', end: 'bottom bottom', name: 'video-defilee' },
  )

  /**
   * Applique une progression a tout ce qui en depend.
   *
   * Declaree comme fonction du composant plutot que memorisee : elle ne lit que
   * des refs, et ne referme donc sur aucune valeur qui vieillirait.
   */
  function paint(progress: number): void {
    const element = video.current
    if (element !== null) {
      element.style.transform = `scale(${String(1 + progress * 0.06)})`
    }

    const heading = titleRef.current
    if (heading !== null) {
      const t = 1 - unit(progress / 0.35)
      heading.style.opacity = t.toFixed(3)
      heading.style.transform = `translate3d(0,${String((1 - t) * -24)}px,0)`
    }

    const end = taglineRef.current
    if (end !== null) {
      const t = unit((progress - 0.82) / 0.18)
      end.style.opacity = t.toFixed(3)
      end.style.transform = `translate3d(0,${String((1 - t) * 20)}px,0)`
    }

    const invitation = hintRef.current
    if (invitation !== null) {
      invitation.style.opacity = progress > 0.01 ? '0' : '1'
    }

    const bar = barRef.current
    if (bar !== null) bar.style.transform = `scaleX(${progress.toFixed(4)})`
  }

  // La recherche, et la boucle qui l'alimente.
  useEffect(() => {
    const element = video.current
    if (element === null) return

    let seeking = false
    let waiting: number | null = null

    /**
     * Demande une position. Une seule recherche a la fois ; la derniere
     * demandee pendant qu'une autre court est appliquee des sa fin.
     */
    const seek = (time: number): void => {
      if (seeking) {
        waiting = time
        return
      }
      seeking = true
      element.currentTime = time
    }

    const onSeeked = (): void => {
      seeking = false
      if (waiting === null) return
      const next = waiting
      waiting = null
      seek(next)
    }

    const onLoaded = (): void => {
      setLoaded(true)
      // La duree n'etait pas connue quand la premiere progression est arrivee :
      // on la rejoue, sans quoi la video resterait sur son image de depart.
      if (reduced) seek((element.duration || 0) * 0.92)
      paint(shown.current)
    }

    element.addEventListener('seeked', onSeeked)
    element.addEventListener('loadeddata', onLoaded)

    if (reduced) {
      return () => {
        element.removeEventListener('seeked', onSeeked)
        element.removeEventListener('loadeddata', onLoaded)
      }
    }

    const subscription = clock.subscribe(
      ({ delta }) => {
        // Rattrapage exponentiel exprime en fonction du temps ecoule : une
        // fraction constante irait deux fois plus vite sur un ecran a cent
        // vingt images par seconde.
        const factor = 1 - Math.exp(-ease * delta)
        shown.current += (target.current - shown.current) * factor

        const duration = element.duration
        if (Number.isFinite(duration) && duration > 0) {
          seek(shown.current * duration)
        }
        paint(shown.current)
      },
      { name: 'video-defilee', priority: CLOCK_PRIORITY.default },
    )

    return () => {
      subscription.unsubscribe()
      element.removeEventListener('seeked', onSeeked)
      element.removeEventListener('loadeddata', onLoaded)
    }
    // `paint` ne figure pas dans les dependances : elle ne lit que des refs, et
    // ne referme donc sur aucune valeur qui vieillirait entre deux rendus.
  }, [ease, reduced])

  const { className, style } = mergePresentation({ className: 'o-relative' }, rest)

  return (
    <section
      {...rest}
      ref={ref}
      className={className}
      // La hauteur de l'enveloppe **est** la longueur de la course : c'est elle
      // que le declencheur mesure, et elle seule.
      style={{ height: `${String(Math.max(1, range + 1) * 100)}vh`, ...style }}
    >
      <div className="o-sticky o-top-0 o-h-screen o-w-full o-overflow-hidden o-bg-zinc-950">
        <video
          ref={video}
          src={src}
          poster={poster}
          muted
          playsInline
          preload="auto"
          aria-label={description}
          className="o-absolute o-inset-0 o-h-full o-w-full o-object-cover o-will-change-transform"
          style={{
            opacity: loaded ? 1 : 0,
            transition: 'opacity var(--o-duration-slower) var(--o-ease-entrance)',
          }}
        />

        <div
          aria-hidden
          className="o-pointer-events-none o-absolute o-inset-0 o-bg-gradient-to-b o-from-zinc-950 o-via-transparent o-to-zinc-950"
        />

        {title === undefined ? null : (
          <div
            ref={titleRef}
            className="o-pointer-events-none o-absolute o-inset-0 o-flex o-items-center o-justify-center o-px-8 o-text-center"
          >
            <h1 className="o-text-5xl o-font-bold o-tracking-tight o-text-zinc-50 md:o-text-8xl">
              {title}
            </h1>
          </div>
        )}

        {tagline === undefined ? null : (
          <div
            ref={taglineRef}
            style={{ opacity: 0 }}
            className="o-pointer-events-none o-absolute o-inset-0 o-flex o-items-center o-justify-center o-px-10 o-text-center"
          >
            <p className="o-text-2xl o-font-medium o-text-zinc-50 md:o-text-4xl">
              {tagline}
            </p>
          </div>
        )}

        <div
          ref={hintRef}
          aria-hidden
          className="o-pointer-events-none o-absolute o-bottom-10 o-left-1/2 o-flex o-flex-col o-items-center o-gap-2 o-text-xs o-font-semibold o-uppercase o-tracking-widest o-text-zinc-300"
          style={{
            transform: 'translateX(-50%)',
            transition: 'opacity var(--o-duration-slow) var(--o-ease-exit)',
          }}
        >
          <span>{hint}</span>
          <svg
            viewBox="0 0 14 18"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="o-h-4 o-w-4"
          >
            <path d="M7 1v16M2 12l5 5 5-5" />
          </svg>
        </div>

        {/* Le fil de progression : la seule indication de l'avancee dans la
            video, la barre du navigateur mesurant la page et non la course. */}
        <div aria-hidden className="o-absolute o-bottom-0 o-h-0.5 o-w-full o-bg-zinc-800">
          <div
            ref={barRef}
            className="o-h-full o-w-full o-bg-zinc-50"
            style={{ transform: 'scaleX(0)', transformOrigin: 'left center' }}
          />
        </div>
      </div>
    </section>
  )
}
