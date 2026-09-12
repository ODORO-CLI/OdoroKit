/**
 * Lecture au defilement : une tete de lecture allume les mots un a un.
 *
 * ## Une revelation qui suit le doigt, pas un declencheur
 *
 * `blur-reveal` part une fois, a l'entree dans le champ, et se joue jusqu'au
 * bout quoi qu'il arrive ensuite. Ici l'avancement **est** la position de
 * defilement : remonter d'un cran eteint les derniers mots, redescendre les
 * rallume. Le texte est une jauge autant qu'une animation, et c'est ce qui en
 * fait un bloc de citation ou de manifeste plutot qu'un titre.
 *
 * ## Une seule variable ecrite par image
 *
 * La boucle du moteur ecrit `--o-srv-p` sur le conteneur. Chaque mot en
 * deduit son propre avancement par `calc` et `clamp` : la tete de lecture
 * n'est pas une position calculee en JavaScript et distribuee mot par mot,
 * c'est la meme valeur lue avec un decalage different par chacun.
 *
 * Consequence directe : un paragraphe de deux cents mots coute exactement le
 * meme travail par image qu'un de cinq.
 *
 * ## La progression se mesure contre ce qui defile vraiment
 *
 * Contre la fenetre par defaut, contre le premier ancetre a defilement
 * interne s'il y en a un. Un ecouteur de `scroll` aurait donne un rythme
 * different du rafraichissement, et le tremblement qui va avec.
 *
 * ## Le texte allume est la valeur par defaut
 *
 * `--o-srv-p` vaut 1 dans la feuille : sans JavaScript, sans boucle, le
 * paragraphe est entierement lisible. Un texte qui ne s'allume qu'a
 * l'execution est un texte qui manque.
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
import {
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type ReactElement,
} from 'react'

/** Proprietes propres au composant. */
export interface ScrollRevealOwnProps {
  /** Texte a reveler. Une chaine : elle est decoupee en mots. */
  children: string
  /** Balise rendue. @defaultValue 'p' */
  as?: ElementType
  /** Opacite d'un mot pas encore atteint, de 0 a 1. @defaultValue 0.18 */
  dim?: number
  /** Flou d'un mot pas encore atteint, en pixels. @defaultValue 4 */
  blur?: number
  /**
   * Course du reglage, en hauteurs de fenetre.
   *
   * Plus haut, plus il faut defiler pour allumer le dernier mot.
   *
   * @defaultValue 0.7
   */
  course?: number
}

/** Toutes les proprietes. */
export type ScrollRevealProps = Customisable<ScrollRevealOwnProps, 'p'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-scroll-reveal'

/** Pose les regles de la tete de lecture, une fois par document. */
function ensureScrollRevealRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // Un au repos : sans boucle, tout le texte est allume. Voir l'en-tete.
    '[data-o-scroll-reveal]{--o-srv-p:1}',
    '[data-o-scroll-reveal-word]{',
    'display:inline-block;',
    // La tete de lecture avance de `span` crans quand la progression va de
    // zero a un ; chaque mot ne retient que le cran qui le concerne.
    '--o-srv-t:clamp(0,calc(var(--o-srv-p) * var(--o-srv-span) - var(--o-srv-i)),1);',
    'opacity:calc(var(--o-srv-dim) + (1 - var(--o-srv-dim)) * var(--o-srv-t));',
    'filter:blur(calc((1 - var(--o-srv-t)) * var(--o-srv-blur)));',
    '}',
    // Sans mouvement, le paragraphe est allume d'un bloc : l'etat d'arrivee.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-scroll-reveal-word]{opacity:1;filter:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Premier ancetre dont le contenu defile reellement, ou rien : la page sert. */
function ancetreDefilant(element: HTMLElement): HTMLElement | null {
  let noeud = element.parentElement
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

/**
 * Allume les mots d'un texte au fil du defilement.
 *
 * @example
 * <ScrollReveal as="p" className="o-text-2xl">
 *   Un composant qu on ne peut pas modifier n est pas a vous.
 * </ScrollReveal>
 *
 * @example
 * // Presque eteint au depart, sans flou, sur une longue course.
 * <ScrollReveal dim={0.05} blur={0} course={1.4}>Lentement</ScrollReveal>
 */
export function ScrollReveal({
  children,
  as: Tag = 'p',
  dim = 0.18,
  blur = 4,
  course = 0.7,
  ...rest
}: ScrollRevealProps): ReactElement {
  const { reduced } = useMotionState()
  const hote = useRef<HTMLElement | null>(null)

  ensureScrollRevealRule()

  useEffect(() => {
    const element = hote.current
    if (element === null || reduced) return

    // L'ancetre est cherche une fois : il ne change pas pendant la vie du
    // composant, et le chercher a chaque image couterait pour rien.
    const defilant = ancetreDefilant(element)

    const abonnement = clock.subscribe(
      () => {
        const boite = element.getBoundingClientRect()
        const vueHaut = defilant === null ? 0 : defilant.getBoundingClientRect().top
        const vueHauteur =
          defilant === null ? window.innerHeight : defilant.clientHeight
        const vueBas = vueHaut + vueHauteur

        // Zero quand le haut du bloc touche le bas du champ ; un quand il a
        // remonte de sa propre hauteur plus la course demandee.
        const parcouru = vueBas - boite.top
        const total = Math.max(1, vueHauteur * course + boite.height)
        const avance = Math.min(1, Math.max(0, parcouru / total))

        element.style.setProperty('--o-srv-p', avance.toFixed(4))
      },
      { name: 'revelation au defilement', priority: CLOCK_PRIORITY.input },
    )

    return () => {
      abonnement.unsubscribe()
      element.style.removeProperty('--o-srv-p')
    }
  }, [reduced, course, children])

  const { className, style } = mergePresentation({}, rest)

  const mots = children.split(' ').filter((mot) => mot.length > 0)

  const styleRacine = {
    ...style,
    '--o-srv-dim': Math.min(1, Math.max(0, dim)),
    '--o-srv-blur': `${String(blur)}px`,
    // Un cran de plus que de mots : le dernier finit d'arriver avant que la
    // progression atteigne un, plutot qu'exactement dessus.
    '--o-srv-span': mots.length + 1,
  } as CSSProperties

  return (
    <Tag
      {...rest}
      ref={hote}
      className={className}
      style={styleRacine}
      data-o-scroll-reveal=""
    >
      {/* Le texte complet, d'un seul tenant, pour les lecteurs d'ecran. */}
      <span className="o-sr-only">{children}</span>
      <span aria-hidden>
        {mots.map((mot, index) => (
          <span key={`${mot}-${String(index)}`}>
            <span
              data-o-scroll-reveal-word=""
              style={{ '--o-srv-i': index } as CSSProperties}
            >
              {mot}
            </span>
            {index < mots.length - 1 ? ' ' : null}
          </span>
        ))}
      </span>
    </Tag>
  )
}
