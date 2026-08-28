/**
 * Decalage temporel de la revelation d'une liste d'enfants.
 *
 * @module
 */

import {
  Children,
  type ComponentPropsWithoutRef,
  type ElementType,
  type ReactElement,
  type ReactNode,
  createElement,
} from 'react'

import { Reveal, type RevealTiming } from './Reveal.jsx'

/** Proprietes de {@link Stagger}. */
export interface StaggerProps extends RevealTiming, ComponentPropsWithoutRef<'div'> {
  /** Element conteneur rendu. @defaultValue 'div' */
  as?: ElementType
  /** Element enveloppant chaque enfant. @defaultValue 'div' */
  itemAs?: ElementType
  /** Enfants a reveler l'un apres l'autre. */
  children?: ReactNode
  /** Ecart entre deux enfants, en millisecondes. @defaultValue 60 */
  step?: number
  /**
   * Plafond du retard cumule, en millisecondes. Au-dela, tous les enfants
   * restants partagent le meme retard : une liste de cent elements ne doit pas
   * finir de s'afficher six secondes apres la premiere.
   *
   * @defaultValue 600
   */
  maxDelay?: number
  /** Ne joue l'animation qu'une seule fois. @defaultValue true */
  once?: boolean
  /** Desactive l'animation. */
  disabled?: boolean
  /** Proportion visible declenchant la revelation. @defaultValue 0.15 */
  threshold?: number
  /** Marge appliquee au viewport d'observation. @defaultValue '0px' */
  rootMargin?: string
}

/**
 * Revele ses enfants les uns apres les autres, chacun avec un retard croissant.
 *
 * Chaque enfant est observe individuellement : dans une longue liste, seuls
 * ceux qui entrent reellement a l'ecran s'animent.
 *
 * @example
 * <Stagger step={80} className="o-grid o-grid-cols-3 o-gap-4">
 *   {items.map((item) => <Card key={item.id} {...item} />)}
 * </Stagger>
 */
export function Stagger({
  as = 'div',
  itemAs = 'div',
  children,
  step = 60,
  maxDelay = 600,
  delay = 0,
  duration,
  easing,
  from,
  to,
  once = true,
  disabled = false,
  threshold = 0.15,
  rootMargin = '0px',
  ...rest
}: StaggerProps): ReactElement {
  const items = Children.toArray(children)

  return createElement(
    as,
    rest,
    items.map((child, index) => (
      <Reveal
        // L'index est un identifiant stable ici : `Children.toArray` conserve
        // les cles d'origine sur les enfants, et ce wrapper n'a pas d'etat.
        key={index}
        as={itemAs}
        delay={Math.min(delay + index * step, delay + maxDelay)}
        duration={duration}
        easing={easing}
        from={from}
        to={to}
        once={once}
        disabled={disabled}
        threshold={threshold}
        rootMargin={rootMargin}
      >
        {child}
      </Reveal>
    )),
  )
}
