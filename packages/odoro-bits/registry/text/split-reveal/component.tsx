/**
 * Revelation d'un titre, fragment par fragment.
 *
 * ## L'etat de depart, et le filet qui va avec
 *
 * Les fragments doivent etre invisibles avant que l'animation ne commence. Or
 * le decoupage a lieu dans un effet, apres le premier rendu : sans precaution,
 * le titre apparait en entier, puis disparait pour se recomposer. Le
 * clignotement est bref et parfaitement visible.
 *
 * L'element porte donc un attribut d'attente, pose des le rendu, qu'une regle
 * CSS traduit en opacite nulle. Jusque-la, rien d'original.
 *
 * Ce qui compte est la suite. Le decoupage peut ne jamais avoir lieu : le
 * plugin peut ne pas se charger, sur un reseau qui coupe ou derriere un
 * bloqueur. L'attente serait alors levee par personne, et le titre resterait
 * invisible — pas « sans animation », **invisible**. C'est le pire defaut
 * possible pour un composant de texte, et il ne se voit pas en developpement,
 * ou tout se charge.
 *
 * L'attente est donc levee quoi qu'il arrive : au decoupage s'il vient, sinon
 * au bout d'un delai. Le pire cas devient « le titre arrive une seconde en
 * retard » au lieu de « le titre n'arrive jamais ».
 *
 * ## Sous mouvement reduit
 *
 * Aucun decoupage, aucune attente, aucun attribut : le titre est simplement
 * la. L'animation est neutralisee, jamais l'etat final.
 *
 * @module
 */

import {
  mergePresentation,
  useMotionState,
  useOnReady,
  useSplitText,
  useTimeline,
  type Customisable,
  type ReadyCallback,
  type SplitBy,
} from '@odoro-cli/engine'
import {
  useEffect,
  useState,
  type ElementType,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Ce que l'echappatoire recoit. */
export interface SplitRevealControls {
  /** Fragments produits par le decoupage, dans l'ordre du texte. */
  readonly parts: readonly Element[]
  /** Granularite effectivement employee. */
  readonly by: SplitBy
}

/** Proprietes propres au composant. */
export interface SplitRevealOwnProps {
  /** Texte a reveler. */
  children: ReactNode
  /** Balise rendue. @defaultValue 'h2' */
  as?: ElementType
  /** Granularite du decoupage. @defaultValue 'chars' */
  by?: SplitBy
  /** Decalage entre deux fragments, en millisecondes. @defaultValue 24 */
  stagger?: number
  /** Duree d'entree d'un fragment, en millisecondes. @defaultValue 600 */
  duration?: number
  /** Hauteur de la montee, en pixels. Zero pour un simple fondu. @defaultValue 24 */
  distance?: number
  /** Echappatoire, appelee une fois le decoupage fait. */
  onReady?: ReadyCallback<SplitRevealControls>
}

/** Toutes les proprietes. */
export type SplitRevealProps = Customisable<SplitRevealOwnProps, 'div'>

/** Attribut porte pendant l'attente du decoupage. */
const PENDING = 'data-o-split-pending'

/**
 * Delai au bout duquel l'attente est levee sans decoupage, en millisecondes.
 *
 * Le decoupage a lieu dans l'effet qui suit le montage : une seconde est un
 * ordre de grandeur au-dela. La valeur n'a pas a etre juste, seulement a
 * borner le pire cas.
 */
const RESCUE_MS = 1000

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-split-reveal'

/**
 * Pose la regle d'etat de depart, une fois par document.
 *
 * Elle ne peut pas etre un style en ligne : l'attribut doit deja masquer
 * l'element au premier rendu, avant que le moindre effet ne tourne.
 */
function ensureHiddenRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = `[${PENDING}]{opacity:0}`
  document.head.append(style)
}

/**
 * Revele un texte fragment par fragment.
 *
 * @example
 * <SplitReveal as="h1" by="words" className="o-text-5xl o-font-bold">
 *   Construisez des interfaces vivantes
 * </SplitReveal>
 *
 * @example
 * // Niveau 5 : reprendre la main sur les fragments.
 * <SplitReveal
 *   onReady={({ handle }) => {
 *     handle.parts.forEach((part, index) => {
 *       part.setAttribute('data-index', String(index))
 *     })
 *   }}
 * >
 *   Un titre
 * </SplitReveal>
 */
export function SplitReveal({
  children,
  as: Tag = 'h2',
  by = 'chars',
  stagger = 24,
  duration = 600,
  distance = 24,
  onReady,
  ...rest
}: SplitRevealProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)

  ensureHiddenRule()

  const split = useSplitText<HTMLElement>({ by })

  // La timeline se reconstruit quand les reglages changent, et quand le
  // decoupage produit de nouveaux fragments — ce qui arrive au montage, puis a
  // chaque redecoupage en lignes.
  const { ref: timelineRef } = useTimeline<HTMLElement>(
    ({ timeline }) => {
      if (split.parts.length === 0) return

      timeline.from([...split.parts], {
        opacity: 0,
        y: distance,
        duration: duration / 1000,
        stagger: stagger / 1000,
        ease: 'power3.out',
      })
    },
    [split.parts, stagger, duration, distance],
    { name: 'revelation de texte' },
  )

  // Le filet. Voir l'explication en tete de module : sans lui, un plugin qui
  // ne se charge pas laisse le titre invisible pour de bon.
  useEffect(() => {
    if (host === null || reduced) return

    if (split.ready) {
      host.removeAttribute(PENDING)
      return
    }

    const timer = setTimeout(() => host.removeAttribute(PENDING), RESCUE_MS)
    return () => clearTimeout(timer)
  }, [host, reduced, split.ready])

  useOnReady(onReady, split.ready ? { parts: split.parts, by } : null, host)

  const { className, style } = mergePresentation({}, rest)

  return (
    <Tag
      {...rest}
      ref={(element: HTMLElement | null) => {
        setHost(element)
        split.ref.current = element
        timelineRef.current = element
      }}
      className={className}
      style={style}
      // L'attribut n'est pose que si une animation est attendue. Le moteur se
      // charge de l'etiquette accessible et de masquer les fragments : le
      // repeter ici ferait deux verites a maintenir.
      {...(reduced ? {} : { [PENDING]: '' })}
    >
      {children}
    </Tag>
  )
}
