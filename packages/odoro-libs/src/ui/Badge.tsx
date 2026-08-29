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
      neutral: 'o-bg-zinc-100 dark:o-bg-zinc-950 o-text-zinc-900 dark:o-text-zinc-50',
      primary: 'o-bg-brand-50 dark:o-bg-brand-950 o-text-brand-600 dark:o-text-brand-400',
      accent:
        'o-bg-fuchsia-50 dark:o-bg-fuchsia-950 o-text-fuchsia-600 dark:o-text-fuchsia-400',
      success:
        'o-bg-emerald-50 dark:o-bg-emerald-950 o-text-emerald-600 dark:o-text-emerald-400',
      warning: 'o-bg-amber-50 dark:o-bg-amber-950 o-text-amber-600 dark:o-text-amber-400',
      danger: 'o-bg-red-50 dark:o-bg-red-950 o-text-red-600 dark:o-text-red-400',
      info: 'o-bg-sky-50 dark:o-bg-sky-950 o-text-sky-600 dark:o-text-sky-400',
    },
    solid: {
      neutral: 'o-bg-zinc-900 dark:o-bg-zinc-50 o-text-white dark:o-text-zinc-950',
      primary: 'o-bg-brand-600 dark:o-bg-brand-400 o-text-white dark:o-text-zinc-950',
      accent: 'o-bg-fuchsia-600 dark:o-bg-fuchsia-400 o-text-white dark:o-text-zinc-950',
      success: 'o-bg-emerald-600 dark:o-bg-emerald-400 o-text-white dark:o-text-zinc-950',
      warning:
        'o-bg-amber-600 dark:o-bg-amber-400 o-text-amber-950 dark:o-text-amber-950',
      danger: 'o-bg-red-600 dark:o-bg-red-400 o-text-white dark:o-text-zinc-950',
      info: 'o-bg-sky-600 dark:o-bg-sky-400 o-text-white dark:o-text-zinc-950',
    },
    outline: {
      neutral:
        'o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-text-zinc-900 dark:o-text-zinc-50',
      primary:
        'o-border-w-1 o-border-brand-200 dark:o-border-brand-800 o-text-brand-600 dark:o-text-brand-400',
      accent:
        'o-border-w-1 o-border-fuchsia-600 dark:o-border-fuchsia-400 o-text-fuchsia-600 dark:o-text-fuchsia-400',
      success:
        'o-border-w-1 o-border-emerald-200 dark:o-border-emerald-800 o-text-emerald-600 dark:o-text-emerald-400',
      warning:
        'o-border-w-1 o-border-amber-200 dark:o-border-amber-800 o-text-amber-600 dark:o-text-amber-400',
      danger:
        'o-border-w-1 o-border-red-200 dark:o-border-red-800 o-text-red-600 dark:o-text-red-400',
      info: 'o-border-w-1 o-border-sky-200 dark:o-border-sky-800 o-text-sky-600 dark:o-text-sky-400',
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
