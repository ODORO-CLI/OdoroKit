/**
 * Pastille de texte.
 *
 * @module
 */

import { type HTMLAttributes, type ReactElement, type ReactNode } from 'react'

import { type ClassValue, cx } from '../styles/cx.js'

/** Registre de couleur d'une pastille. */
export type BadgeTone =
  'neutral' | 'primary' | 'accent' | 'success' | 'warning' | 'danger' | 'info'

/** Rendu d'une pastille. */
export type BadgeVariant = 'soft' | 'solid' | 'outline'

/** Taille d'une pastille. */
export type BadgeSize = 'sm' | 'md'

/**
 * Couleurs par rendu puis par registre. Le ton `neutral` n'a pas de couleur
 * semantique dediee : il s'appuie sur les gris de surface et de texte.
 */
const TONE_CLASSES: Readonly<Record<BadgeVariant, Readonly<Record<BadgeTone, string>>>> =
  {
    soft: {
      neutral: 'o-bg-surface-sunken o-text-fg',
      primary: 'o-bg-primary-soft o-text-primary',
      accent: 'o-bg-accent-soft o-text-accent',
      success: 'o-bg-success-soft o-text-success',
      warning: 'o-bg-warning-soft o-text-warning',
      danger: 'o-bg-danger-soft o-text-danger',
      info: 'o-bg-info-soft o-text-info',
    },
    solid: {
      neutral: 'o-bg-fg o-text-fg-inverted',
      primary: 'o-bg-primary o-text-on-primary',
      accent: 'o-bg-accent o-text-on-accent',
      success: 'o-bg-success o-text-on-success',
      warning: 'o-bg-warning o-text-on-warning',
      danger: 'o-bg-danger o-text-on-danger',
      info: 'o-bg-info o-text-on-info',
    },
    outline: {
      neutral: 'o-border-w-1 o-border-border o-text-fg',
      primary: 'o-border-w-1 o-border-primary-border o-text-primary',
      accent: 'o-border-w-1 o-border-accent o-text-accent',
      success: 'o-border-w-1 o-border-success-border o-text-success',
      warning: 'o-border-w-1 o-border-warning-border o-text-warning',
      danger: 'o-border-w-1 o-border-danger-border o-text-danger',
      info: 'o-border-w-1 o-border-info-border o-text-info',
    },
  }

const SIZE_CLASSES: Readonly<Record<BadgeSize, string>> = {
  sm: 'o-h-5 o-px-2 o-text-xs',
  md: 'o-h-6 o-px-2 o-text-sm',
}

const BASE_CLASSES = cx(
  'o-inline-flex o-items-center o-gap-1',
  'o-rounded-full o-font-medium o-whitespace-nowrap o-select-none',
)

/** Options de {@link badgeClasses}. */
export interface BadgeClassesOptions {
  /** Registre de couleur. @defaultValue 'neutral' */
  tone?: BadgeTone
  /** Rendu. @defaultValue 'soft' */
  variant?: BadgeVariant
  /** Taille. @defaultValue 'sm' */
  size?: BadgeSize
  /** Classes additionnelles. */
  className?: ClassValue
}

/**
 * Classes de la pastille, exposees pour habiller un autre element inline.
 *
 * Fonction dediee plutot que table `variants()` : la couleur depend du couple
 * ton x rendu, une combinaison que le helper ne sait pas exprimer.
 *
 * @example
 * <span className={badgeClasses({ tone: 'success', variant: 'solid' })}>Actif</span>
 */
export function badgeClasses({
  tone = 'neutral',
  variant = 'soft',
  size = 'sm',
  className,
}: BadgeClassesOptions = {}): string {
  return cx(BASE_CLASSES, TONE_CLASSES[variant][tone], SIZE_CLASSES[size], className)
}

/** Proprietes de {@link Badge}. */
export interface BadgeProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'className'> {
  /** Registre de couleur. @defaultValue 'neutral' */
  tone?: BadgeTone
  /**
   * Rendu : `soft` pose le texte du ton sur son fond attenue, `solid` la
   * couleur pleine, `outline` un simple lisere.
   *
   * @defaultValue 'soft'
   */
  variant?: BadgeVariant
  /** Taille. @defaultValue 'sm' */
  size?: BadgeSize
  /**
   * Point colore devant le libelle. Il herite de la couleur du texte
   * (`currentColor`) et reste donc assorti quel que soit le rendu.
   *
   * @defaultValue false
   */
  dot?: boolean
  /** Libelle. */
  children?: ReactNode
  /** Classes additionnelles. */
  className?: string
}

/**
 * Pastille de statut ou d'etiquetage.
 *
 * Purement visuelle : si la pastille est la seule porteuse d'une information
 * d'etat, l'appelant doit la doubler d'un texte accessible.
 *
 * @example
 * <Badge tone="success" dot>Publie</Badge>
 */
export function Badge({
  tone = 'neutral',
  variant = 'soft',
  size = 'sm',
  dot = false,
  children,
  className,
  ...rest
}: BadgeProps): ReactElement {
  return (
    <span {...rest} className={badgeClasses({ tone, variant, size, className })}>
      {dot ? (
        <span
          aria-hidden="true"
          className="o-h-1.5 o-w-1.5 o-rounded-full o-bg-current o-shrink-0"
        />
      ) : null}
      {children}
    </span>
  )
}
