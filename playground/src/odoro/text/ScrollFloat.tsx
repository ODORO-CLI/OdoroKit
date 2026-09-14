/**
 * Flottaison : les mots derivent tant que le bloc entre, puis se posent.
 *
 * ## Une amplitude pilotee par le defilement, pas une position
 *
 * Les parallaxes de texte deplacent les mots proportionnellement au
 * defilement : le mot est *ailleurs*, et il revient. Ici les mots sont
 * toujours a leur place — ce que le defilement commande est **l'amplitude**
 * d'une oscillation continue. Loin dans la page, ils flottent largement ;
 * une fois le bloc franchement entre, l'amplitude tombe a zero et le
 * paragraphe se lit comme un paragraphe.
 *
 * Chaque mot a sa propre phase, de sorte qu'ils ne montent jamais ensemble :
 * c'est ce dephasage qui donne l'impression de flottaison plutot que de houle.
 *
 * ## Une seule variable ecrite par image
 *
 * La boucle du moteur ecrit `--o-slf-p` sur le conteneur, et rien d'autre. Les
 * mots en deduisent leur amplitude et leur opacite par `calc` : aucun rendu
 * React, aucune ecriture de style par mot, quel que soit leur nombre.
 *
 * L'oscillation elle-meme est une animation CSS, composee, qui ne demande
 * jamais la main.
 *
 * ## La progression se mesure contre ce qui defile vraiment
 *
 * Contre la fenetre par defaut, mais contre le premier ancetre a defilement
 * interne s'il y en a un : pose dans un panneau, le texte doit repondre au
 * panneau. Un ecouteur de `scroll` aurait donne un rythme different de celui
 * du rafraichissement, et le tremblement qui va avec.
 *
 * ## Le repos est la valeur par defaut
 *
 * `--o-slf-p` vaut 1 dans la feuille : sans JavaScript, sans boucle, les mots
 * sont poses, nets et immobiles. La progression ne peut que *retirer* du
 * repos, jamais le donner — un texte qui ne s'allume qu'a l'execution est un
 * texte qui manque.
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
export interface ScrollFloatOwnProps {
  /** Texte a faire flotter. Une chaine : elle est decoupee en mots. */
  children: string
  /** Balise rendue. @defaultValue 'p' */
  as?: ElementType
  /** Amplitude de la derive a l'entree, en pixels. @defaultValue 26 */
  lift?: number
  /** Duree d'une oscillation complete, en millisecondes. @defaultValue 3200 */
  period?: number
  /**
   * Course du reglage, en hauteurs de fenetre.
   *
   * Plus haut, plus il faut defiler avant que les mots se posent.
   *
   * @defaultValue 0.6
   */
  course?: number
}

/** Toutes les proprietes. */
export type ScrollFloatProps = Customisable<ScrollFloatOwnProps, 'p'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-scroll-float'

/** Pose les regles de la flottaison, une fois par document. */
function ensureScrollFloatRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // Un au repos : sans boucle, le texte est pose. Voir l'en-tete.
    '[data-o-scroll-float]{--o-slf-p:1}',
    '[data-o-scroll-float-word]{',
    'display:inline-block;',
    'opacity:calc(0.15 + 0.85 * var(--o-slf-p));',
    '--o-slf-amp:calc((1 - var(--o-slf-p)) * var(--o-slf-lift));',
    'animation:o-slf-bob var(--o-slf-period) ease-in-out infinite;',
    'animation-delay:var(--o-slf-delay,0ms);',
    '}',
    // `translate` plutot que `transform` : la propriete independante laisse le
    // transform disponible a qui veut poser le sien.
    '@keyframes o-slf-bob{',
    '0%,100%{translate:0 calc(var(--o-slf-amp) * -1)}',
    '50%{translate:0 var(--o-slf-amp)}',
    '}',
    // Sans mouvement, les mots sont poses, nets : l'etat d'arrivee.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-scroll-float-word]{animation:none;opacity:1;translate:none}',
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
 * Fait deriver les mots d'un texte tant qu'il entre dans le champ.
 *
 * @example
 * <ScrollFloat as="h2" className="o-text-3xl o-font-semibold">
 *   Ce qui compte merite d etre lu
 * </ScrollFloat>
 *
 * @example
 * // Une derive ample et lente, qui met longtemps a se poser.
 * <ScrollFloat lift={48} period={5200} course={1}>Une entree en matiere</ScrollFloat>
 */
export function ScrollFloat({
  children,
  as: Tag = 'p',
  lift = 26,
  period = 3200,
  course = 0.6,
  ...rest
}: ScrollFloatProps): ReactElement {
  const { reduced } = useMotionState()
  const hote = useRef<HTMLElement | null>(null)

  ensureScrollFloatRule()

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
        const vueHauteur = defilant === null ? window.innerHeight : defilant.clientHeight
        const vueBas = vueHaut + vueHauteur

        // Zero quand le haut du bloc touche le bas du champ ; un quand il a
        // remonte de sa propre hauteur plus la course demandee.
        const parcouru = vueBas - boite.top
        const total = Math.max(1, vueHauteur * course + boite.height)
        const avance = Math.min(1, Math.max(0, parcouru / total))

        element.style.setProperty('--o-slf-p', avance.toFixed(4))
      },
      { name: 'mots flottants', priority: CLOCK_PRIORITY.input },
    )

    return () => {
      abonnement.unsubscribe()
      element.style.removeProperty('--o-slf-p')
    }
  }, [reduced, course, children])

  const { className, style } = mergePresentation({}, rest)

  const styleRacine = {
    ...style,
    '--o-slf-lift': `${String(lift)}px`,
    '--o-slf-period': `${String(period)}ms`,
  } as CSSProperties

  const mots = children.split(' ').filter((mot) => mot.length > 0)

  return (
    <Tag
      {...rest}
      ref={hote}
      className={className}
      style={styleRacine}
      data-o-scroll-float=""
    >
      {/* Le texte complet, d'un seul tenant, pour les lecteurs d'ecran. */}
      <span className="o-sr-only">{children}</span>
      <span aria-hidden>
        {mots.map((mot, index) => (
          <span key={`${mot}-${String(index)}`}>
            <span
              data-o-scroll-float-word=""
              style={
                {
                  // Un retard negatif, different pour chaque mot : ils ne
                  // montent jamais ensemble, et la derive parait libre.
                  '--o-slf-delay': `${String(-(index * period) / 7)}ms`,
                } as CSSProperties
              }
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
