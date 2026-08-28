/**
 * Revelation d'un texte mot a mot ou lettre a lettre.
 *
 * @module
 */

import {
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactElement,
  createElement,
  useEffect,
  useMemo,
  useRef,
} from 'react'

import { usePrefersReducedMotion } from '../shared/motionPreference.js'
import { type MotionKeyframe, applyStyles, clearStyles } from './keyframes.js'
import {
  type DurationInput,
  type EasingInput,
  resolveDuration,
  resolveEasing,
} from './tokens.js'

/** Proprietes de {@link TextReveal}. */
export interface TextRevealProps extends Omit<
  ComponentPropsWithoutRef<'span'>,
  'children'
> {
  /** Element conteneur rendu. @defaultValue 'span' */
  as?: ElementType
  /** Texte revele. Une chaine, pas un arbre : le decoupage l'exige. */
  children: string
  /** Unite de decoupage. @defaultValue 'word' */
  by?: 'word' | 'char'
  /** Ecart entre deux unites, en millisecondes. @defaultValue 40 */
  step?: number
  /** Retard avant la premiere unite, en millisecondes. @defaultValue 0 */
  delay?: number
  /** Duree de chaque unite : nom de token ou millisecondes. @defaultValue 'slow' */
  duration?: DurationInput
  /** Courbe. @defaultValue 'entrance' */
  easing?: EasingInput
  /** Etat de depart de chaque unite. @defaultValue opacite nulle et remontee */
  from?: MotionKeyframe
  /** Proportion visible declenchant la revelation. @defaultValue 0.3 */
  threshold?: number
  /** Ne joue l'animation qu'une seule fois. @defaultValue true */
  once?: boolean
}

const DEFAULT_FROM: MotionKeyframe = { opacity: 0, transform: 'translateY(0.4em)' }

/** Decoupe un texte en unites, en preservant les espaces d'origine. */
function split(text: string, by: 'word' | 'char'): string[] {
  if (by === 'word') return text.split(/(\s+)/).filter((part) => part !== '')
  return [...text]
}

/**
 * Revele un texte par vagues, mot a mot ou lettre a lettre.
 *
 * Chaque unite est rendue dans un `span` en bloc en ligne et animee avec un
 * retard croissant a l'entree du texte dans le viewport. Les lecteurs d'ecran
 * recoivent le texte entier d'un bloc : le decoupage visuel est masque par
 * `aria-hidden`, le texte complet reste present pour l'accessibilite.
 *
 * Sous `prefers-reduced-motion`, le texte est rendu tel quel, sans decoupage.
 *
 * @example
 * <h1 className="o-text-5xl o-font-bold">
 *   <TextReveal by="word" step={60}>Construisez des interfaces vivantes</TextReveal>
 * </h1>
 */
export function TextReveal({
  as = 'span',
  children,
  by = 'word',
  step = 40,
  delay = 0,
  duration = 'slow',
  easing = 'entrance',
  from = DEFAULT_FROM,
  threshold = 0.3,
  once = true,
  ...rest
}: TextRevealProps): ReactElement {
  const ref = useRef<HTMLElement | null>(null)
  const reduced = usePrefersReducedMotion()
  const parts = useMemo(() => split(children, by), [children, by])

  useEffect(() => {
    const container = ref.current
    if (container === null || reduced) return

    const targets = Array.from(
      container.querySelectorAll<HTMLElement>('[data-o-text-part]'),
    )
    if (targets.length === 0) return

    for (const target of targets) applyStyles(target, from)

    const show = (): void => {
      for (const target of targets) clearStyles(target, from)
    }

    if (typeof IntersectionObserver === 'undefined') {
      show()
      return
    }

    const animations: Animation[] = []

    const reveal = (): void => {
      let index = 0
      for (const target of targets) {
        const animation = target.animate(
          [{ ...from }, { opacity: 1, transform: 'none', filter: 'none' }],
          {
            duration: resolveDuration(duration),
            easing: resolveEasing(easing),
            delay: delay + index * step,
            fill: 'both',
          },
        )
        animations.push(animation)
        index += 1
      }
      // Une fois la vague terminee, l'etat naturel est relache : aucune
      // animation figee ne retient de couche de composition.
      void Promise.allSettled(animations.map((animation) => animation.finished)).then(
        () => {
          show()
          for (const animation of animations) animation.cancel()
          animations.length = 0
        },
      )
    }

    const hide = (): void => {
      for (const animation of animations) animation.cancel()
      animations.length = 0
      for (const target of targets) applyStyles(target, from)
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            reveal()
            if (once) observer.disconnect()
          } else if (!once) {
            hide()
          }
        }
      },
      { threshold },
    )

    observer.observe(container)

    return () => {
      observer.disconnect()
      for (const animation of animations) animation.cancel()
      show()
    }
    // `from` est un litteral cote appelant : le comparer par identite
    // relancerait l'effet a chaque rendu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced, parts, by, step, delay, duration, easing, threshold, once])

  if (reduced) {
    return createElement(as, { ...rest, ref }, children)
  }

  return createElement(
    as,
    { ...rest, ref },
    <>
      <span className="o-sr-only">{children}</span>
      <span aria-hidden="true">
        {parts.map((part, index) =>
          /^\s+$/.test(part) ? (
            part
          ) : (
            <span
              key={index}
              data-o-text-part=""
              className="o-inline-block o-whitespace-pre"
            >
              {part}
            </span>
          ),
        )}
      </span>
    </>,
  )
}
