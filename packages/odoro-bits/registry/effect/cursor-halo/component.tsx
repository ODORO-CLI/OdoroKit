/**
 * Curseur maison : un point exact, un halo qui le rattrape.
 *
 * ## Le retard est tout l'effet
 *
 * Un curseur dessine qui suit le pointeur au pixel pres n'apporte rien : il
 * remplace une fleche par un rond. Ce qui donne l'impression d'une matiere,
 * c'est **l'ecart** — le point est exact, le halo arrive un dixieme de seconde
 * plus tard, et cet ecart se creuse quand on va vite.
 *
 * L'amortissement est independant de la frequence d'images :
 *
 *     k = 1 - exp(-vitesse * dt)
 *
 * Un `lerp` a coefficient fixe irait deux fois plus vite sur un ecran a 120 Hz
 * que sur un ecran a 60 — le meme composant n'aurait pas le meme poids selon la
 * machine. Ici la constante de temps est une duree, pas un nombre d'images.
 *
 * ## Il ne re-rend jamais
 *
 * Les positions sont ecrites directement dans le style des deux elements,
 * depuis la boucle. Les faire passer par l'etat de React declencherait un rendu
 * de l'arbre a chaque mouvement de souris — c'est-a-dire le plus souvent
 * possible, pour deux `transform`.
 *
 * `translate3d` et non `left`/`top` : la premiere forme est composee, la
 * seconde declenche une mise en page.
 *
 * ## Il disparait au doigt
 *
 * Sur un ecran tactile il n'y a pas de pointeur a suivre, et un halo colle
 * quelque part serait un objet mort a l'ecran. `(pointer: coarse)` le retire
 * entierement — pas seulement le cache : le composant ne s'abonne meme pas.
 *
 * ## En mouvement reduit, il perd son retard, pas son existence
 *
 * Le halo colle au point. On retire le mouvement superflu ; on ne retire pas un
 * repere que la personne suit des yeux.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useEffect, useRef, type CSSProperties, type ReactElement } from 'react'

/** Proprietes propres au composant. */
export interface CursorHaloOwnProps {
  /** Diametre du point, en pixels. @defaultValue 6 */
  dotSize?: number
  /** Diametre du halo au repos, en pixels. @defaultValue 34 */
  haloSize?: number
  /**
   * Vitesse a laquelle le halo rejoint le point.
   *
   * Une constante de temps inverse : plus c'est haut, plus il colle. Autour de
   * 8, l'ecart se sent sans trainer.
   *
   * @defaultValue 8
   */
  speed?: number
  /**
   * De combien le halo grossit au survol d'un element interactif.
   *
   * @defaultValue 1.8
   */
  hoverScale?: number
  /**
   * Ce qui compte comme interactif.
   *
   * @defaultValue 'a, button, [role="button"], input, select, textarea, summary'
   */
  interactive?: string
  /**
   * Limiter le curseur a une zone.
   *
   * Absent, il vaut pour la fenetre entiere — le cas courant. Fourni, il
   * n'ecoute que cet element : c'est ainsi qu'on donne un curseur propre a un
   * heros sans l'imposer au reste de la page.
   */
  host?: { readonly current: HTMLElement | null }
  /**
   * Cacher le curseur natif.
   *
   * Faux par defaut, et c'est deliberé : le curseur du systeme change de forme
   * selon ce qu'il survole — texte, lien, redimensionnement — et le remplacer
   * prive de tous ces signaux. On ne le cache que quand le halo les reprend.
   *
   * @defaultValue false
   */
  hideNative?: boolean
}

/** Toutes les proprietes. */
export type CursorHaloProps = Customisable<CursorHaloOwnProps, 'div'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-cursor-halo'

/** Pose les regles du curseur, une fois par document. */
function ensureCursorRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-cursor]{position:fixed;inset:0;z-index:9998;pointer-events:none}',
    '[data-o-cursor-dot],[data-o-cursor-ring]{',
    'position:fixed;top:0;left:0;border-radius:9999px;',
    // `will-change` sur les deux : ils bougent a chaque image, et sans lui le
    // navigateur les repromeut a chaque fois.
    'will-change:transform;pointer-events:none;',
    '}',
    '[data-o-cursor-dot]{background:currentColor}',
    '[data-o-cursor-ring]{',
    'border:1px solid currentColor;',
    'transition:width 220ms ease,height 220ms ease,opacity 220ms ease;',
    '}',
    '[data-o-cursor-hide]{cursor:none}',
    // Au doigt, rien. Le composant ne s'abonne pas non plus — la regle n'est
    // qu'une seconde barriere.
    '@media (pointer:coarse){[data-o-cursor]{display:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Remplace le curseur par un point et son halo.
 *
 * A poser une seule fois, au niveau de la page.
 *
 * @example
 * <CursorHalo />
 *
 * @example
 * // Colle davantage, grossit plus, et prend la main sur le curseur natif.
 * <CursorHalo speed={14} hoverScale={2.4} hideNative />
 */
export function CursorHalo({
  dotSize = 6,
  haloSize = 34,
  speed = 8,
  hoverScale = 1.8,
  interactive = 'a, button, [role="button"], input, select, textarea, summary',
  host,
  hideNative = false,
  ...rest
}: CursorHaloProps): ReactElement {
  const { reduced } = useMotionState()
  const refPoint = useRef<HTMLDivElement | null>(null)
  const refHalo = useRef<HTMLDivElement | null>(null)

  ensureCursorRule()

  useEffect(() => {
    // Pas de pointeur fin : on ne s'abonne a rien. Verifier ici plutot que de
    // se contenter de la regle CSS evite une boucle d'images qui tourne pour un
    // element invisible.
    if (typeof window === 'undefined') return
    if (window.matchMedia('(pointer: coarse)').matches) return

    const point = refPoint.current
    const halo = refHalo.current
    if (point === null || halo === null) return

    // Hors de l'ecran au depart : sans cela, les deux elements apparaissent
    // dans le coin superieur gauche jusqu'au premier mouvement.
    let x = -100
    let y = -100
    let hx = -100
    let hy = -100
    let vu = false

    const surSouris = (evenement: PointerEvent) => {
      // Un ancetre porteur d'un `transform` devient le bloc conteneur des
      // descendants `fixed` : les coordonnees de la fenetre ne s'y appliquent
      // plus, et il faut retrancher l'origine de la zone. Sans cela le curseur
      // suit juste dans une page ordinaire et derive de la hauteur du cadre
      // dans une page de documentation.
      const cadre = host?.current?.getBoundingClientRect()
      x = evenement.clientX - (cadre?.left ?? 0)
      y = evenement.clientY - (cadre?.top ?? 0)

      if (!vu) {
        // Le halo se pose sur le point au tout premier mouvement, faute de quoi
        // il traverserait l'ecran en diagonale depuis son point de depart.
        hx = x
        hy = y
        vu = true
        point.style.opacity = '1'
        halo.style.opacity = '1'
      }
    }

    const surCible = (evenement: Event) => {
      const cible = evenement.target
      const dessus = cible instanceof Element && cible.closest(interactive) !== null
      halo.style.width = `${String(dessus ? haloSize * hoverScale : haloSize)}px`
      halo.style.height = `${String(dessus ? haloSize * hoverScale : haloSize)}px`
    }

    const surface: HTMLElement | Window = host?.current ?? window
    surface.addEventListener('pointermove', surSouris as EventListener, { passive: true })
    surface.addEventListener('pointerover', surCible, { passive: true })

    let image = 0
    let dernier = performance.now()

    const pas = (maintenant: number) => {
      const dt = Math.min((maintenant - dernier) / 1000, 0.1)
      dernier = maintenant

      // Amortissement independant de la frequence d'images : voir l'en-tete.
      const k = reduced ? 1 : 1 - Math.exp(-speed * dt)
      hx += (x - hx) * k
      hy += (y - hy) * k

      point.style.transform = `translate3d(${String(x)}px,${String(y)}px,0) translate(-50%,-50%)`
      halo.style.transform = `translate3d(${String(hx)}px,${String(hy)}px,0) translate(-50%,-50%)`

      image = requestAnimationFrame(pas)
    }

    image = requestAnimationFrame(pas)

    return () => {
      surface.removeEventListener('pointermove', surSouris as EventListener)
      surface.removeEventListener('pointerover', surCible)
      cancelAnimationFrame(image)
    }
  }, [reduced, speed, haloSize, hoverScale, interactive, host])

  // La classe qui masque le curseur natif vit sur la racine du document : la
  // poser sur cet element ne couvrirait que sa propre surface, qui est vide.
  useEffect(() => {
    if (!hideNative || typeof document === 'undefined') return
    document.documentElement.setAttribute('data-o-cursor-hide', '')
    return () => {
      document.documentElement.removeAttribute('data-o-cursor-hide')
    }
  }, [hideNative])

  const { className, style } = mergePresentation({}, rest)

  return (
    <div {...rest} className={className} style={style as CSSProperties} data-o-cursor="">
      <div
        ref={refPoint}
        data-o-cursor-dot=""
        style={{ width: dotSize, height: dotSize, opacity: 0 } as CSSProperties}
      />
      <div
        ref={refHalo}
        data-o-cursor-ring=""
        style={{ width: haloSize, height: haloSize, opacity: 0 } as CSSProperties}
      />
    </div>
  )
}
