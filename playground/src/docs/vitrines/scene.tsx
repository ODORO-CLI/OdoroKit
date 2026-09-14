/**
 * La trousse de mouvement des vitrines.
 *
 * ## Ce que `marche.tsx` ne fait pas
 *
 * La trousse marketplace donne la matiere d une page : les barres, le rideau,
 * la revelation d ouverture, les etiquettes. Elle ne dit rien de ce qui se
 * passe **quand on defile**. Or c est la que se joue la difference entre une
 * page qui se lit et une page qui se vit : une photo qui derive contre le
 * defilement, un ecran qui reste fixe pendant que son contenu change, une
 * bande qu on parcourt de cote, un pied qui se decouvre.
 *
 * ## Une horloge, des transformations
 *
 * Toutes les primitives lisent le defilement par `useScrollScrub` du moteur —
 * une seule horloge, cedable — et ecrivent une transformation ou une variable
 * CSS, jamais un etat React par image. `Epingle` est l exception mesuree : elle
 * ne re-rend que quand l **acte** change, et il y en a trois ou quatre.
 *
 * ## Sous mouvement reduit
 *
 * Chaque primitive a un rendu immobile qui garde le sens : la scene epinglee
 * montre son dernier acte, le rail devient une bande qui defile au doigt, le
 * pied colle redevient un pied, les objets qui flottent se posent.
 *
 * @module
 */

import { CLOCK_PRIORITY, clock, useMotionState, useScrollScrub } from '@odoro-cli/engine'
import { useInView } from '@odoro-cli/libs/motion'
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

import { Magnetic } from '@/odoro/effect/Magnetic.jsx'
import { Marquee } from '@/odoro/effect/Marquee.jsx'

import { CHROME } from './marche.jsx'

/* ============================ La feuille =============================== */

const STYLE_SCENE = 'o-vitrine-scene'

/**
 * Les images-cles que les utilitaires n ont pas : flotter, deriver, respirer.
 * Posees une fois, coupees sous mouvement reduit.
 */
const CSS_SCENE = [
  '@keyframes o-vs-flotte{0%,100%{transform:translate3d(0,calc(var(--o-vs-amp,10px) * -1),0) rotate(var(--o-vs-rot,0deg))}50%{transform:translate3d(0,var(--o-vs-amp,10px),0) rotate(var(--o-vs-rot,0deg))}}',
  '@keyframes o-vs-derive{0%{transform:translate3d(0,0,0) scale(1)}33%{transform:translate3d(6%,-8%,0) scale(1.08)}66%{transform:translate3d(-5%,6%,0) scale(0.94)}100%{transform:translate3d(0,0,0) scale(1)}}',
  '@keyframes o-vs-respire{0%,100%{transform:scale(1);opacity:0.55}50%{transform:scale(1.18);opacity:1}}',
  '[data-o-vs-flotte]{animation:o-vs-flotte var(--o-vs-duree,6s) ease-in-out var(--o-vs-delai,0s) infinite}',
  '[data-o-vs-nappe]>span{animation:o-vs-derive var(--o-vs-duree,22s) ease-in-out var(--o-vs-delai,0s) infinite}',
  '[data-o-vs-respire]{animation:o-vs-respire var(--o-vs-duree,8s) ease-in-out infinite}',
  '@media (prefers-reduced-motion:reduce){[data-o-vs-flotte],[data-o-vs-nappe]>span,[data-o-vs-respire]{animation:none}}',
].join('')

function useFeuilleScene(): void {
  useEffect(() => {
    if (document.getElementById(STYLE_SCENE) !== null) return
    const style = document.createElement('style')
    style.id = STYLE_SCENE
    style.textContent = CSS_SCENE
    document.head.append(style)
  }, [])
}

/** La hauteur d un ecran sous les barres de la documentation. */
const ECRAN = `calc(100vh - ${String(CHROME)}px)`

/* ============================ La glisse ================================ */

/** Borne une valeur entre zero et un. */
function borne(valeur: number): number {
  return valeur < 0 ? 0 : valeur > 1 ? 1 : valeur
}

/**
 * Une progression de traversee qui **glisse**.
 *
 * ## Pourquoi elle ne suit pas le doigt
 *
 * Une parallaxe branchee directement sur la position de defilement s arrete
 * a l instant ou la molette s arrete. C est juste, et c est mort : le geste
 * n a pas de suite. Ici la position mesuree n est qu une **cible** ; la valeur
 * rendue la rattrape a chaque image, en comblant une fraction de l ecart.
 * Un cran de molette pousse donc la cible d un coup, et le decor continue de
 * couler une demi-seconde apres — la continuite demandee.
 *
 * La fraction vaut `1 - exp(-raideur x dt)`. Elle depend du temps ecoule :
 * une constante ferait glisser deux fois plus vite un ecran a cent vingt
 * images par seconde, et le meme reglage n aurait pas le meme poids chez deux
 * personnes. Basse raideur (1,5) : un decor lourd, qui derive longtemps.
 * Haute (6) : une glisse a peine perceptible.
 *
 * ## Ce qu elle ne mesure qu une fois
 *
 * La geometrie de l element est lue au montage, puis a chaque changement de
 * taille — jamais a l image. Seul `window.scrollY` est relu a chaque tour, et
 * il ne force aucun calcul de mise en page. C est ce qui permet d en poser
 * une dizaine sur une page sans la faire tomber sous les soixante images.
 *
 * @param epingle Vrai quand l element est plus haut que l ecran et sert de
 *   piste a une scene collee : la course va alors du haut de l element au
 *   moment ou son bas atteint le bas de l ecran.
 */
function useTraversee(
  hote: HTMLElement | null,
  appliquer: (valeur: number) => void,
  { raideur = 3.4, epingle = false }: { raideur?: number; epingle?: boolean } = {},
): void {
  const rendu = useRef(appliquer)
  rendu.current = appliquer
  const { reduced } = useMotionState()

  useEffect(() => {
    if (hote === null || reduced) return

    let haut = 0
    let hauteur = 0
    const mesurer = (): void => {
      const boite = hote.getBoundingClientRect()
      haut = boite.top + window.scrollY
      hauteur = boite.height
    }
    mesurer()

    // Les images arrivent apres le premier rendu et deplacent tout ce qui
    // suit : sans cette relecture, la parallaxe serait calee sur une page qui
    // n existe plus.
    const observateur = new ResizeObserver(mesurer)
    observateur.observe(document.documentElement)
    observateur.observe(hote)

    const brut = (): number => {
      const vue = window.innerHeight
      const y = window.scrollY
      return epingle
        ? borne((y - haut) / Math.max(1, hauteur - vue))
        : borne((y + vue - haut) / Math.max(1, vue + hauteur))
    }

    let courant = brut()
    rendu.current(courant)

    const abonnement = clock.subscribe(
      ({ delta }) => {
        const cible = brut()
        courant += (cible - courant) * (1 - Math.exp(-raideur * delta))
        // Sans ce plancher, la valeur approche sa cible sans jamais l atteindre
        // et la page ecrit un style a chaque image, indefiniment.
        if (Math.abs(cible - courant) < 0.00005) courant = cible
        rendu.current(courant)
      },
      { name: 'traversee glissee', priority: CLOCK_PRIORITY.input },
    )

    return () => {
      abonnement.unsubscribe()
      observateur.disconnect()
    }
  }, [hote, raideur, epingle, reduced])
}

/** La raideur qui correspond a une glisse de 0 (sec) a 1 (tres lourd). */
function raideurDe(glisse: number): number {
  return 6 - borne(glisse) * 4.5
}

/**
 * Le pointeur, normalise et amorti, pour une scene qui repond au regard.
 *
 * Sans pointeur fin — un telephone, une tablette — la valeur reste a zero :
 * le balancement est un agrement, et il n a pas d equivalent au doigt.
 */
function usePointeurDoux(appliquer: (x: number, y: number) => void, raideur = 2.4): void {
  const rendu = useRef(appliquer)
  rendu.current = appliquer
  const { reduced } = useMotionState()

  useEffect(() => {
    if (reduced || !window.matchMedia('(pointer: fine)').matches) return

    const cible = { x: 0, y: 0 }
    const courant = { x: 0, y: 0 }
    const bouger = (evenement: PointerEvent): void => {
      cible.x = (evenement.clientX / window.innerWidth) * 2 - 1
      cible.y = (evenement.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', bouger, { passive: true })

    const abonnement = clock.subscribe(
      ({ delta }) => {
        const part = 1 - Math.exp(-raideur * delta)
        courant.x += (cible.x - courant.x) * part
        courant.y += (cible.y - courant.y) * part
        rendu.current(courant.x, courant.y)
      },
      { name: 'pointeur du diorama', priority: CLOCK_PRIORITY.input },
    )

    return () => {
      window.removeEventListener('pointermove', bouger)
      abonnement.unsubscribe()
    }
  }, [raideur, reduced])
}

/* ============================ Parallaxe ================================ */

/**
 * Un contenu qui derive contre le defilement.
 *
 * `vitesse` est la part du defilement restituee : 0,2 fait glisser l element
 * d un cinquieme de sa traversee, dans le sens inverse. Negatif, il suit.
 *
 * @example
 * <Parallaxe vitesse={0.25}><img … /></Parallaxe>
 */
export function Parallaxe({
  vitesse = 0.2,
  echelle = 0,
  glisse = 0,
  as: Balise = 'div',
  className,
  style,
  children,
}: {
  readonly vitesse?: number
  /** Un leger zoom au centre de la traversee, 0,1 pour dix pour cent. */
  readonly echelle?: number
  /**
   * L inertie, de 0 a 1. A zero, l image est calee sur le defilement. Au-dela,
   * elle rattrape sa place et **continue de couler apres l arret du geste** ;
   * a 1, elle derive longtemps, comme une matiere lourde.
   */
  readonly glisse?: number
  readonly as?: 'div' | 'span' | 'figure' | 'li'
  readonly className?: string
  readonly style?: CSSProperties
  readonly children: ReactNode
}): ReactElement {
  const { reduced } = useMotionState()
  const [hote, setHote] = useState<HTMLElement | null>(null)
  const cible = useRef<HTMLDivElement>(null)
  const onProgress = useCallback(
    (p: number) => {
      const el = cible.current
      if (el === null) return
      const centre = p * 2 - 1
      const y = -centre * vitesse * 240
      const zoom = 1 + echelle * (1 - Math.abs(centre))
      el.style.transform = `translate3d(0, ${y.toFixed(1)}px, 0) scale(${zoom.toFixed(3)})`
    },
    [vitesse, echelle],
  )
  // Deux horloges possibles, une seule active : le declencheur du moteur quand
  // l image est calee, la traversee amortie quand elle glisse.
  const doux = glisse > 0 && !reduced
  useScrollScrub<HTMLElement>(doux || reduced ? () => undefined : onProgress, {
    element: hote,
    name: 'parallaxe',
  })
  useTraversee(doux ? hote : null, onProgress, { raideur: raideurDe(glisse) })
  return (
    <Balise ref={setHote} className={className} style={style}>
      <div
        ref={cible}
        className={reduced ? 'o-h-full' : 'o-h-full o-will-change-transform'}
      >
        {children}
      </div>
    </Balise>
  )
}

/* ============================ Zoom au defilement ======================= */

/**
 * L ouverture qui recule quand on defile.
 *
 * La photo (ou la scene) commence a `de` et revient a `a` quand l ouverture a
 * quitte l ecran ; un voile s assombrit dans le meme temps. Les enfants sont
 * poses par-dessus, hors de la transformation.
 */
export function ZoomDefile({
  de = 1.12,
  a = 1,
  assombrir = 0.5,
  glisse = 0,
  fond,
  className,
  style,
  children,
}: {
  readonly de?: number
  readonly a?: number
  /** Opacite du voile noir en fin de course. */
  readonly assombrir?: number
  /**
   * L inertie, de 0 a 1. Au-dela de zero, l image continue de reculer apres
   * l arret du geste — une ouverture a du poids, elle ne se fige pas au cran.
   */
  readonly glisse?: number
  /** Ce qui zoome : une image, une scene. */
  readonly fond: ReactNode
  readonly className?: string
  readonly style?: CSSProperties
  readonly children: ReactNode
}): ReactElement {
  const { reduced } = useMotionState()
  const image = useRef<HTMLDivElement>(null)
  const voile = useRef<HTMLDivElement>(null)
  const onProgress = useCallback(
    (p: number) => {
      if (image.current !== null)
        image.current.style.transform = `scale(${(de + (a - de) * p).toFixed(4)})`
      if (voile.current !== null) voile.current.style.opacity = (p * assombrir).toFixed(3)
    },
    [de, a, assombrir],
  )
  const doux = glisse > 0 && !reduced
  const [hote, setHote] = useState<HTMLElement | null>(null)
  const { ref } = useScrollScrub<HTMLDivElement>(
    doux || reduced ? () => undefined : onProgress,
    {
      start: 'top top',
      end: 'bottom top',
      name: 'zoom au defilement',
    },
  )
  useTraversee(doux ? hote : null, onProgress, {
    raideur: raideurDe(glisse),
    epingle: true,
  })
  return (
    <div
      ref={(element: HTMLDivElement | null) => {
        setHote(element)
        ref.current = element
      }}
      className={`o-relative o-isolate o-overflow-hidden ${className ?? ''}`}
      style={style}
    >
      <div
        ref={image}
        className="o-absolute o-inset-0 o-will-change-transform o-origin-center"
        style={{ transform: reduced ? undefined : `scale(${String(de)})` }}
      >
        {fond}
      </div>
      <div
        ref={voile}
        aria-hidden="true"
        className="o-pointer-events-none o-absolute o-inset-0 o-bg-black"
        style={{ opacity: 0 }}
      />
      <div className="o-relative">{children}</div>
    </div>
  )
}

/* ============================ Epingle ================================== */

/**
 * Un ecran epingle, dont le contenu change par actes.
 *
 * Le conteneur fait `ecrans` hauteurs d ecran ; la scene reste collee pendant
 * qu on les parcourt. La progression est ecrite dans `--p` (0 a 1) sur la
 * scene — un enfant peut s en servir en `calc()`. Avec `actes`, les enfants
 * sont une fonction de l acte courant, et ne re-rendent qu a son changement.
 *
 * Sous mouvement reduit, la scene n est plus collee et montre le dernier acte.
 *
 * @example
 * <Epingle ecrans={3} actes={3}>
 *   {(acte) => <h2>{TITRES[acte]}</h2>}
 * </Epingle>
 */
export function Epingle({
  ecrans = 3,
  actes,
  className,
  style,
  children,
}: {
  readonly ecrans?: number
  readonly actes?: number
  readonly className?: string
  readonly style?: CSSProperties
  readonly children: ReactNode | ((acte: number, progression: number) => ReactNode)
}): ReactElement {
  const { reduced } = useMotionState()
  const scene = useRef<HTMLDivElement>(null)
  const [acte, setActe] = useState(0)
  const nombre = actes ?? 1
  const onProgress = useCallback(
    (p: number) => {
      scene.current?.style.setProperty('--p', p.toFixed(4))
      if (actes !== undefined) {
        const a = Math.min(actes - 1, Math.floor(p * actes))
        setActe((prev) => (prev === a ? prev : a))
      }
    },
    [actes],
  )
  const { ref } = useScrollScrub<HTMLDivElement>(reduced ? () => undefined : onProgress, {
    start: 'top top',
    end: 'bottom bottom',
    name: 'epingle',
  })
  const courant = reduced ? nombre - 1 : acte
  const contenu =
    typeof children === 'function'
      ? children(courant, reduced ? 1 : acte / Math.max(1, nombre - 1))
      : children
  return (
    <div
      ref={ref}
      data-o-epingle
      className={`o-relative ${className ?? ''}`}
      style={{ height: reduced ? 'auto' : `calc(${String(ecrans)} * 100vh)`, ...style }}
    >
      <div
        ref={scene}
        data-acte={courant}
        className={
          reduced ? 'o-relative o-overflow-hidden' : 'o-sticky o-overflow-hidden'
        }
        style={
          reduced
            ? ({ minHeight: ECRAN, '--p': 1 } as CSSProperties)
            : ({ top: CHROME, height: ECRAN, '--p': 0 } as CSSProperties)
        }
      >
        {contenu}
      </div>
    </div>
  )
}

/* ============================ Rail ===================================== */

/**
 * Une bande horizontale parcourue en defilant verticalement.
 *
 * Les enfants sont posees cote a cote ; la piste glisse de toute sa largeur
 * excedentaire pendant `ecrans` hauteurs d ecran. Sous mouvement reduit, la
 * bande defile au doigt.
 */
export function Rail({
  ecrans = 2.5,
  className,
  style,
  children,
  entete,
}: {
  readonly ecrans?: number
  readonly className?: string
  readonly style?: CSSProperties
  readonly children: ReactNode
  /** Ce qui reste pose en haut de l ecran epingle. */
  readonly entete?: ReactNode
}): ReactElement {
  const { reduced } = useMotionState()
  const piste = useRef<HTMLDivElement>(null)
  const onProgress = useCallback((p: number) => {
    const el = piste.current
    const parent = el?.parentElement
    if (el === null || el === undefined || parent === null || parent === undefined) return
    const course = Math.max(0, el.scrollWidth - parent.clientWidth)
    el.style.transform = `translate3d(${(-course * p).toFixed(1)}px, 0, 0)`
  }, [])
  const { ref } = useScrollScrub<HTMLDivElement>(reduced ? () => undefined : onProgress, {
    start: 'top top',
    end: 'bottom bottom',
    name: 'rail',
  })
  if (reduced) {
    return (
      <div className={className} style={style}>
        {entete}
        <div className="o-overflow-x-auto">
          <div className="o-flex o-w-max o-items-stretch">{children}</div>
        </div>
      </div>
    )
  }
  return (
    <div
      ref={ref}
      data-o-epingle
      className={`o-relative ${className ?? ''}`}
      style={{ height: `calc(${String(ecrans)} * 100vh)`, ...style }}
    >
      <div
        className="o-sticky o-flex o-flex-col o-overflow-hidden"
        style={{ top: CHROME, height: ECRAN }}
      >
        {entete}
        <div className="o-flex o-min-h-0 o-grow o-items-center">
          <div
            ref={piste}
            className="o-flex o-w-max o-items-stretch o-will-change-transform"
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ============================ Bandeau ================================== */

/**
 * Des mots geants qui defilent sans fin.
 *
 * @example
 * <Bandeau mots={['Poireau', 'Merlan', 'Riz au lait']} separateur="·" />
 */
export function Bandeau({
  mots,
  separateur = '✦',
  vitesse = 50,
  inverse = false,
  className,
  style,
  taille = 'clamp(2.5rem, 7vw, 7rem)',
}: {
  readonly mots: readonly string[]
  readonly separateur?: string
  readonly vitesse?: number
  readonly inverse?: boolean
  readonly className?: string
  readonly style?: CSSProperties
  readonly taille?: string
}): ReactElement {
  return (
    <Marquee
      speed={vitesse}
      reverse={inverse}
      pauseOnHover={false}
      fade={0}
      className={className}
      style={style}
    >
      <span
        className="o-flex o-items-center o-whitespace-nowrap"
        style={{ fontSize: taille, lineHeight: 1 }}
      >
        {mots.map((mot, rang) => (
          <span key={`${mot}-${String(rang)}`} className="o-flex o-items-center">
            <span className="o-px-6">{mot}</span>
            <span
              aria-hidden="true"
              className="o-opacity-40"
              style={{ fontSize: '0.4em' }}
            >
              {separateur}
            </span>
          </span>
        ))}
      </span>
    </Marquee>
  )
}

/* ============================ Devoile ================================== */

/**
 * Une photographie qui se decoupe a l entree dans le champ, et derive ensuite.
 *
 * Le cadre garde son ratio ; l image y est plus grande que lui et glisse
 * contre le defilement. La decoupe part du bord indique.
 */
export function Devoile({
  src,
  alt,
  ratio = '4 / 3',
  depuis = 'bas',
  derive = 40,
  legende,
  className,
  style,
  imgClassName,
}: {
  readonly src: string
  readonly alt: string
  readonly ratio?: string
  readonly depuis?: 'bas' | 'haut' | 'gauche' | 'droite'
  /** Course de la derive, en pixels. */
  readonly derive?: number
  readonly legende?: ReactNode
  readonly className?: string
  readonly style?: CSSProperties
  readonly imgClassName?: string
}): ReactElement {
  const { reduced } = useMotionState()
  const [vu, setVu] = useState(false)
  const [entree, vuEntree] = useInView<HTMLElement>({ threshold: 0.15, once: true })
  useEffect(() => {
    if (vuEntree) setVu(true)
  }, [vuEntree])
  const image = useRef<HTMLImageElement>(null)
  const onProgress = useCallback(
    (p: number) => {
      const el = image.current
      if (el === null) return
      const centre = p * 2 - 1
      el.style.transform = `translate3d(0, ${(-centre * derive).toFixed(1)}px, 0) scale(${(1 + derive / 800).toFixed(3)})`
    },
    [derive],
  )
  const { ref } = useScrollScrub<HTMLDivElement>(reduced ? () => undefined : onProgress, {
    name: 'devoile',
  })
  const cache: Record<string, string> = {
    bas: 'inset(100% 0 0 0)',
    haut: 'inset(0 0 100% 0)',
    gauche: 'inset(0 100% 0 0)',
    droite: 'inset(0 0 0 100%)',
  }
  return (
    <figure ref={entree} className={`o-m-0 ${className ?? ''}`} style={style}>
      <div
        ref={ref}
        className="o-relative o-overflow-hidden"
        style={{
          aspectRatio: ratio,
          clipPath: reduced || vu ? 'inset(0 0 0 0)' : cache[depuis],
          transition: reduced
            ? undefined
            : 'clip-path 1200ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}
      >
        <img
          ref={image}
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          className={`o-absolute o-inset-0 o-size-full o-object-cover o-will-change-transform ${imgClassName ?? ''}`}
        />
      </div>
      {legende !== undefined && (
        <figcaption className="o-mt-2 o-font-mono o-text-xs o-uppercase o-tracking-widest o-opacity-70">
          {legende}
        </figcaption>
      )}
    </figure>
  )
}

/* ============================ Chapitre ================================= */

/**
 * Une section a etiquette collante : l indice et le titre restent poses a
 * gauche pendant que le contenu defile a droite.
 */
export function Chapitre({
  indice,
  titre,
  texte,
  id,
  className,
  style,
  children,
  largeur = 4,
}: {
  readonly indice: string
  readonly titre: ReactNode
  readonly texte?: ReactNode
  readonly id?: string
  readonly className?: string
  readonly style?: CSSProperties
  readonly children: ReactNode
  /** Colonnes (sur douze) prises par l etiquette. */
  readonly largeur?: 3 | 4 | 5
}): ReactElement {
  const gauche = { 3: 'md:o-col-span-3', 4: 'md:o-col-span-4', 5: 'md:o-col-span-5' }[
    largeur
  ]
  const droite = { 3: 'md:o-col-span-9', 4: 'md:o-col-span-8', 5: 'md:o-col-span-7' }[
    largeur
  ]
  return (
    <section
      id={id}
      className={`o-grid o-gap-8 md:o-grid-cols-12 md:o-gap-12 ${className ?? ''}`}
      style={style}
    >
      <div className={gauche}>
        <div className="md:o-sticky" style={{ top: CHROME + 32 }}>
          <p className="o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest o-opacity-60">
            {indice}
          </p>
          <div className="o-mt-4">{titre}</div>
          {texte !== undefined && (
            <div className="o-mt-4 o-max-w-sm o-text-sm o-leading-relaxed o-opacity-80">
              {texte}
            </div>
          )}
        </div>
      </div>
      <div className={`o-min-w-0 ${droite}`}>{children}</div>
    </section>
  )
}

/* ============================ Flotte, Nappe, Respire =================== */

/** Un objet qui flotte sans fin, avec une legere inclinaison. */
export function Flotte({
  amplitude = 10,
  duree = 6,
  delai = 0,
  angle = 0,
  className,
  style,
  children,
}: {
  readonly amplitude?: number
  readonly duree?: number
  readonly delai?: number
  readonly angle?: number
  readonly className?: string
  readonly style?: CSSProperties
  readonly children: ReactNode
}): ReactElement {
  useFeuilleScene()
  return (
    <div
      data-o-vs-flotte=""
      className={className}
      style={
        {
          '--o-vs-amp': `${String(amplitude)}px`,
          '--o-vs-duree': `${String(duree)}s`,
          '--o-vs-delai': `${String(delai)}s`,
          '--o-vs-rot': `${String(angle)}deg`,
          ...style,
        } as CSSProperties
      }
    >
      {children}
    </div>
  )
}

/**
 * Une nappe de degrade qui derive derriere la page : trois taches floues aux
 * couleurs demandees, en mouvement lent. Un fond anime sans canevas.
 */
export function Nappe({
  couleurs,
  opacite = 0.6,
  flou = 'o-blur-3xl',
  className,
  style,
}: {
  /** Trois couleurs CSS, du plus present au plus discret. */
  readonly couleurs: readonly [string, string, string]
  readonly opacite?: number
  readonly flou?: string
  readonly className?: string
  readonly style?: CSSProperties
}): ReactElement {
  useFeuilleScene()
  const taches = [
    { left: '-10%', top: '-10%', width: '55vw', height: '55vw', delai: 0, duree: 26 },
    { left: '45%', top: '10%', width: '50vw', height: '50vw', delai: -9, duree: 30 },
    { left: '15%', top: '55%', width: '45vw', height: '45vw', delai: -17, duree: 24 },
  ]
  return (
    <div
      data-o-vs-nappe=""
      aria-hidden="true"
      className={`o-pointer-events-none o-absolute o-inset-0 o-overflow-hidden ${className ?? ''}`}
      style={{ opacity: opacite, ...style }}
    >
      {taches.map((t, rang) => (
        <span
          key={rang}
          className={`o-absolute o-block o-rounded-full ${flou}`}
          style={
            {
              left: t.left,
              top: t.top,
              width: t.width,
              height: t.height,
              background: couleurs[rang],
              '--o-vs-delai': `${String(t.delai)}s`,
              '--o-vs-duree': `${String(t.duree)}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  )
}

/** Un cercle qui respire : s ouvre et se ferme au rythme d une inspiration. */
export function Respire({
  duree = 8,
  className,
  style,
  children,
}: {
  readonly duree?: number
  readonly className?: string
  readonly style?: CSSProperties
  readonly children?: ReactNode
}): ReactElement {
  useFeuilleScene()
  return (
    <div
      data-o-vs-respire=""
      className={className}
      style={{ '--o-vs-duree': `${String(duree)}s`, ...style } as CSSProperties}
    >
      {children}
    </div>
  )
}

/* ============================ Aimant =================================== */

/** Un bouton aimante, seulement sous un pointeur fin. */
export function Aimant({
  force = 0.35,
  className,
  children,
}: {
  readonly force?: number
  readonly className?: string
  readonly children: ReactNode
}): ReactElement {
  const [fin, setFin] = useState(false)
  useEffect(() => {
    setFin(window.matchMedia('(pointer: fine)').matches)
  }, [])
  if (!fin) return <div className={`o-inline-block ${className ?? ''}`}>{children}</div>
  return (
    <Magnetic strength={force} className={className}>
      {children}
    </Magnetic>
  )
}

/* ============================ Eclate =================================== */

/**
 * Un mot dont les lettres s ecartent au defilement — Aerra.
 *
 * Les lettres de rang pair montent haut, les impaires moins ; la course suit
 * le defilement de l ouverture qui les porte. Le mot reste un seul texte pour
 * les lecteurs d ecran.
 */
export function Eclate({
  mot,
  haut = 160,
  bas = 60,
  as: Balise = 'p',
  className,
  style,
}: {
  readonly mot: string
  readonly haut?: number
  readonly bas?: number
  readonly as?: 'p' | 'h1' | 'h2' | 'span'
  readonly className?: string
  readonly style?: CSSProperties
}): ReactElement {
  const { reduced } = useMotionState()
  const [hote, setHote] = useState<HTMLElement | null>(null)
  const onProgress = useCallback(
    (p: number) => {
      hote?.style.setProperty('--p', p.toFixed(4))
    },
    [hote],
  )
  useScrollScrub<HTMLElement>(reduced ? () => undefined : onProgress, {
    element: hote,
    start: 'top top',
    end: 'bottom top',
    name: 'lettres eclatees',
  })
  return (
    <Balise
      ref={setHote}
      className={className}
      style={{ '--p': 0, ...style } as CSSProperties}
      aria-label={mot}
    >
      {[...mot].map((lettre, rang) => (
        <span
          key={`${lettre}-${String(rang)}`}
          aria-hidden="true"
          className="o-inline-block o-will-change-transform"
          style={{
            transform: reduced
              ? undefined
              : `translate3d(0, calc(var(--p) * ${String(-(rang % 2 === 0 ? haut : bas))}px), 0)`,
            opacity: reduced ? 1 : `calc(1 - var(--p) * 0.6)`,
          }}
        >
          {lettre === ' ' ? ' ' : lettre}
        </span>
      ))}
    </Balise>
  )
}

/* ============================ Pied colle =============================== */

/**
 * Un pied fixe derriere la page, decouvert quand on arrive en bas.
 *
 * Le conteneur decoupe (`clip-path`) devient le bloc de reference de son
 * enfant fixe : le pied ne bouge pas, la page glisse dessus. Sous mouvement
 * reduit, un pied ordinaire.
 */
export function PiedColle({
  hauteur = 520,
  className,
  style,
  children,
}: {
  readonly hauteur?: number
  readonly className?: string
  readonly style?: CSSProperties
  readonly children: ReactNode
}): ReactElement {
  const { reduced } = useMotionState()
  if (reduced) {
    return (
      <div className={className} style={style}>
        {children}
      </div>
    )
  }
  return (
    <div
      className={`o-relative ${className ?? ''}`}
      style={{ height: hauteur, clipPath: 'inset(0 0 0 0)', ...style }}
    >
      <div className="o-fixed o-bottom-0 o-left-0 o-w-full" style={{ height: hauteur }}>
        {children}
      </div>
    </div>
  )
}

/* ============================ Le diorama =============================== */

/** Ce qu une couche a besoin de savoir de la scene qui la porte. */
interface Decor {
  readonly sens: 'y' | 'x'
  readonly course: number
}

const DecorContexte = createContext<Decor>({ sens: 'y', course: 120 })

/**
 * Un diorama : une scene collee, des couches qui coulent a leur profondeur.
 *
 * ## Le defilement devient le jeu
 *
 * Ce n est plus une page qu on parcourt, c est un decor qu on traverse. La
 * scene reste collee pendant `ecrans` hauteurs d ecran, et chaque `Couche`
 * s y deplace selon sa profondeur : le fond ne bouge pas, le premier plan
 * traverse tout l ecran. L ecart entre les vitesses **est** la sensation de
 * volume — c est le procede du decor peint de theatre, et celui des jeux a
 * defilement lateral.
 *
 * La progression est **amortie** ({@link useTraversee}) : un cran de molette
 * pousse la cible, et le decor continue de couler apres l arret du geste.
 * C est ce qui donne envie de relancer, et c est ce qui fait le jeu.
 *
 * ## Ce que la scene ecrit, et ce que les couches en font
 *
 * La scene n ecrit que trois variables — `--p` (la traversee, de 0 a 1),
 * `--px` et `--py` (le pointeur, de -1 a 1) — depuis une seule horloge. Les
 * couches, elles, sont du CSS pur : leur transformation est un `calc()` sur
 * ces variables. Une scene de douze couches ne coute donc qu un abonnement,
 * et le compositeur fait le reste.
 *
 * ## Sous mouvement reduit
 *
 * Rien n est colle, rien ne coule : les variables restent a zero, les couches
 * se posent a leur place d origine, et les actes se lisent les uns sous les
 * autres. Le decor devient une illustration, et le texte reste entier.
 *
 * @example
 * <Profondeur ecrans={5} actes={4} hud={(acte) => <Palier rang={acte} />}>
 *   <Couche profondeur={0}><Ciel /></Couche>
 *   <Couche profondeur={0.35} derive={14}><Collines /></Couche>
 *   <Couche profondeur={1} derive={40}><Herbe /></Couche>
 * </Profondeur>
 */
export function Profondeur({
  ecrans = 4,
  actes,
  acteDe,
  course = 120,
  sens = 'y',
  glisse = 0.7,
  pointeur = true,
  surProgression,
  hud,
  className,
  style,
  children,
}: {
  /** Hauteurs d ecran parcourues pendant que la scene reste collee. */
  readonly ecrans?: number
  /** Nombre d etapes ; `hud` est alors appele a chaque changement. */
  readonly actes?: number
  /**
   * Comment la progression se traduit en acte, quand la division egale ne
   * convient pas — une descente qui accelere, une carte qui n avance pas au
   * meme rythme que le regard. Par defaut, `actes` tranches egales.
   */
  readonly acteDe?: (progression: number) => number
  /** Course de la couche de premier plan, en centiemes d ecran. */
  readonly course?: number
  /** Sens de la traversee : verticale par defaut, laterale pour un decor qui defile. */
  readonly sens?: 'y' | 'x'
  /** L inertie, de 0 a 1. */
  readonly glisse?: number
  /** Vrai pour que la scene se balance sous le pointeur. */
  readonly pointeur?: boolean
  /** Appele a chaque image avec la progression amortie : pour un compteur. */
  readonly surProgression?: (progression: number) => void
  /** Ce qui se pose par-dessus le decor, et change avec l acte. */
  readonly hud?: (acte: number) => ReactNode
  readonly className?: string
  readonly style?: CSSProperties
  readonly children: ReactNode
}): ReactElement {
  const { reduced } = useMotionState()
  const [hote, setHote] = useState<HTMLElement | null>(null)
  const scene = useRef<HTMLDivElement>(null)
  const [acte, setActe] = useState(0)

  const rapport = useRef(surProgression)
  rapport.current = surProgression

  const decoupe = useRef(acteDe)
  decoupe.current = acteDe

  const avancer = useCallback(
    (p: number) => {
      scene.current?.style.setProperty('--p', p.toFixed(4))
      rapport.current?.(p)
      if (actes !== undefined) {
        const brut =
          decoupe.current === undefined ? Math.floor(p * actes) : decoupe.current(p)
        const rang = Math.min(actes - 1, Math.max(0, brut))
        setActe((precedent) => (precedent === rang ? precedent : rang))
      }
    },
    [actes],
  )

  const balancer = useCallback((x: number, y: number) => {
    const el = scene.current
    if (el === null) return
    el.style.setProperty('--px', x.toFixed(3))
    el.style.setProperty('--py', y.toFixed(3))
  }, [])

  useTraversee(hote, avancer, { raideur: raideurDe(glisse), epingle: true })
  usePointeurDoux(pointeur ? balancer : () => undefined)

  const decor = (
    <div
      ref={scene}
      data-acte={acte}
      className={`o-relative o-isolate o-overflow-hidden ${className ?? ''}`}
      style={
        {
          height: reduced ? ECRAN : ECRAN,
          '--p': 0,
          '--px': 0,
          '--py': 0,
          ...style,
        } as CSSProperties
      }
    >
      <DecorContexte.Provider value={{ sens, course }}>{children}</DecorContexte.Provider>
      {!reduced && hud !== undefined && (
        <div className="o-absolute o-inset-0 o-z-30">{hud(acte)}</div>
      )}
    </div>
  )

  // Sans mouvement, la scene est une illustration et les actes se lisent a la
  // suite : rien de ce qui etait dans le decor ne se perd.
  if (reduced) {
    return (
      <div>
        {decor}
        {hud !== undefined &&
          Array.from({ length: actes ?? 1 }, (_, rang) => (
            <div key={rang} className="o-relative o-px-6 o-py-12">
              {hud(rang)}
            </div>
          ))}
      </div>
    )
  }

  return (
    <div
      ref={setHote}
      data-o-epingle
      className="o-relative"
      style={{ height: `calc(${String(ecrans)} * 100vh)` }}
    >
      <div className="o-sticky" style={{ top: CHROME }}>
        {decor}
      </div>
    </div>
  )
}

/**
 * Une couche du diorama.
 *
 * `profondeur` vaut 0 pour l horizon — immobile — et 1 pour le premier plan,
 * qui traverse toute la course de la scene. Entre les deux, tout est permis :
 * ce sont les ecarts qui font le volume, pas les valeurs.
 */
export function Couche({
  profondeur,
  zoom = 0,
  derive = 0,
  className,
  style,
  children,
}: {
  readonly profondeur: number
  /** Grossissement au fil de la traversee : 0,2 pour vingt pour cent. */
  readonly zoom?: number
  /** Balancement lateral sous le pointeur, en pixels. */
  readonly derive?: number
  readonly className?: string
  readonly style?: CSSProperties
  readonly children: ReactNode
}): ReactElement {
  const { sens, course } = useContext(DecorContexte)
  const parcours = (-course * profondeur).toFixed(2)
  const lateral = derive.toFixed(1)
  const glissement =
    sens === 'y'
      ? `translate3d(calc(var(--px, 0) * ${lateral}px), calc(var(--p, 0) * ${parcours}vh), 0)`
      : `translate3d(calc(var(--p, 0) * ${parcours}vw + var(--px, 0) * ${lateral}px), calc(var(--py, 0) * ${(derive * 0.35).toFixed(1)}px), 0)`

  return (
    <div
      className={`o-absolute o-inset-0 o-will-change-transform ${className ?? ''}`}
      style={{
        transform: `${glissement} scale(calc(1 + var(--p, 0) * ${zoom.toFixed(3)}))`,
        ...style,
      }}
    >
      {children}
    </div>
  )
}
