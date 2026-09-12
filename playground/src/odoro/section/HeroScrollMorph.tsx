/**
 * Hero dont le media s'ouvre au fil du defilement.
 *
 * ## Le media ne change pas de largeur : il change de fenetre
 *
 * La version evidente anime `width`, et c'est celle qu'il faut ecarter. Une
 * largeur est une propriete de mise en page : le navigateur recalcule la
 * position de tout ce qui suit, a chaque image, pendant tout le defilement.
 * Sur une page longue, cela se sent avant meme de profiler.
 *
 * Le media garde donc sa taille, et c'est la **fenetre** par laquelle on le
 * voit qui s'ouvre — un `clip-path` en `inset`, que le navigateur traite au
 * dessin et non a la mise en page. Le resultat est le meme a l'oeil, et rien
 * ne bouge autour.
 *
 * ## La progression est lue dans la boucle, pas rendue
 *
 * Une valeur qui change a chaque image n'a rien a faire dans un etat React :
 * elle provoquerait un rendu complet par image, pour ecrire un nombre dans une
 * variable CSS. Elle est donc lue a la priorite des mesures, arrondie au
 * centieme, et n'est ecrite que lorsqu'elle change vraiment.
 *
 * ## Le champ n'est pas toujours la fenetre
 *
 * Pose dans un panneau a debordement — un apercu, un tiroir — le hero se
 * mesure par rapport a ce panneau. Le conteneur qui defile est cherche une
 * fois au montage : `getComputedStyle` par image couterait plus cher que tout
 * le reste du composant.
 *
 * ## Ce que le mouvement reduit donne
 *
 * L'etat d'arrivee : le media pleinement ouvert, la legende visible. Un hero
 * fige a son etat de depart montrerait un media rogne et une legende absente,
 * c'est-a-dire un contenu incomplet — ce qui n'est pas ce que la preference
 * demande.
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
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Proprietes propres au composant. */
export interface HeroScrollMorphOwnProps {
  /** Titre du hero. */
  title: ReactNode
  /** Le media : image, video, capture, scene. */
  children: ReactNode
  /** Phrase sous le titre. */
  subtitle?: ReactNode
  /** Legende sous le media, qui apparait a mesure que la fenetre s'ouvre. */
  caption?: ReactNode
  /**
   * Largeur visible du media au repos, en pourcentage de sa largeur pleine.
   *
   * @defaultValue 62
   */
  startWidth?: number
  /**
   * Part de la hauteur de la section sur laquelle la transformation s'acheve.
   *
   * `0.6` la termine avant que la section quitte le champ, ce qui laisse voir
   * le media ouvert. Une valeur de 1 la fait finir au moment ou l'on ne la
   * regarde plus.
   *
   * @defaultValue 0.6
   */
  travel?: number
  /** Nom de la section, annonce aux technologies d'assistance. */
  label?: string
}

/** Toutes les proprietes. */
export type HeroScrollMorphProps = Customisable<HeroScrollMorphOwnProps, 'section'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-hero-scroll-morph'

/** Pose les regles du hero, une fois par document. */
function ensureMorphRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-hsm]{--o-hsm-reste:1}',
    // Tout est exprime en « ce qu'il reste a parcourir » : a l'arrivee la
    // valeur vaut zero, et chaque calcul se lit comme « rien de plus ».
    '[data-o-hsm-media]{',
    'clip-path:inset(',
    'calc(var(--o-hsm-marge-y) * var(--o-hsm-reste))',
    'calc(var(--o-hsm-marge-x) * var(--o-hsm-reste))',
    'round calc(var(--o-radius-3xl) * var(--o-hsm-reste)));',
    'transform:scale(calc(1 - 0.05 * var(--o-hsm-reste)));',
    'will-change:clip-path,transform}',

    '[data-o-hsm-legende]{opacity:calc(1 - var(--o-hsm-reste))}',

    // L'etat d'arrivee, et non l'etat de depart : un media rogne serait un
    // contenu incomplet, pas une animation neutralisee.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-hsm]{--o-hsm-reste:0}',
    '[data-o-hsm-media]{will-change:auto}}',
  ].join('')
  document.head.append(style)
}

/**
 * Trouve le conteneur qui defile autour d'un element.
 *
 * Appele une seule fois, au montage : `getComputedStyle` force un calcul de
 * style, et le repeter par image annulerait le soin pris ailleurs.
 */
function conteneurDefilant(element: Element): HTMLElement | null {
  let parent = element.parentElement
  while (parent !== null) {
    const debordement = getComputedStyle(parent).overflowY
    if (debordement === 'auto' || debordement === 'scroll') return parent
    parent = parent.parentElement
  }
  return null
}

/**
 * Hero dont le media s'ouvre au defilement.
 *
 * @example
 * <HeroScrollMorph
 *   title="Le registre, en clair"
 *   subtitle="Des composants copies chez vous, pas lies."
 *   caption="Capture de la commande d installation"
 * >
 *   <img src="/apercu.png" alt="" className="o-size-full o-object-cover" />
 * </HeroScrollMorph>
 */
export function HeroScrollMorph({
  title,
  children,
  subtitle,
  caption,
  startWidth = 62,
  travel = 0.6,
  label,
  ...rest
}: HeroScrollMorphProps): ReactElement {
  const { reduced } = useMotionState()
  const [hote, setHote] = useState<HTMLElement | null>(null)
  const dernier = useRef(-1)

  ensureMorphRules()

  useEffect(() => {
    if (hote === null || reduced) return

    const conteneur = conteneurDefilant(hote)
    const course = Math.max(0.05, travel)

    const subscription = clock.subscribe(
      () => {
        const boite = hote.getBoundingClientRect()
        if (boite.height === 0) return

        const hautDuChamp = conteneur === null ? 0 : conteneur.getBoundingClientRect().top

        // « Combien de moi est deja passe au-dessus du champ », rapporte a la
        // course voulue. A l'arrivee de la page, la valeur vaut zero : le hero
        // demarre donc ferme, ce qui est le seul depart qui ait du sens.
        const p = Math.min(
          1,
          Math.max(0, (hautDuChamp - boite.top) / (boite.height * course)),
        )

        const centieme = Math.round(p * 100)
        if (centieme === dernier.current) return
        dernier.current = centieme
        hote.style.setProperty('--o-hsm-reste', (1 - centieme / 100).toFixed(2))
      },
      { name: 'hero au defilement', priority: CLOCK_PRIORITY.layout },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [hote, reduced, travel])

  const { className, style } = mergePresentation(
    { className: 'o-flex o-flex-col o-items-center o-gap-8 o-py-16' },
    rest,
  )

  return (
    <section
      {...rest}
      ref={setHote}
      aria-label={label}
      data-o-hsm=""
      className={className}
      style={
        {
          ...style,
          // La marge de depart se deduit de la largeur voulue : une fenetre a
          // 62 % laisse 19 % de chaque cote.
          '--o-hsm-marge-x': `${((100 - startWidth) / 2).toFixed(2)}%`,
          '--o-hsm-marge-y': `${((100 - startWidth) / 4).toFixed(2)}%`,
        } as CSSProperties
      }
    >
      <div className="o-flex o-max-w-2xl o-flex-col o-gap-4 o-px-6 o-text-center">
        <h1
          className="o-text-4xl o-font-bold o-tracking-tight o-text-balance"
          style={{ color: 'var(--o-theme-fg)' }}
        >
          {title}
        </h1>
        {subtitle !== undefined && (
          <p
            className="o-text-base o-leading-relaxed"
            style={{ color: 'var(--o-theme-muted)' }}
          >
            {subtitle}
          </p>
        )}
      </div>

      <figure className="o-m-0 o-w-full">
        <div data-o-hsm-media="" className="o-w-full">
          {children}
        </div>
        {caption !== undefined && (
          <figcaption
            data-o-hsm-legende=""
            className="o-mt-3 o-text-center o-text-xs"
            style={{ color: 'var(--o-theme-muted)' }}
          >
            {caption}
          </figcaption>
        )}
      </figure>
    </section>
  )
}
