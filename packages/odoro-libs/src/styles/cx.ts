/**
 * Composition de noms de classes et helper de variantes.
 *
 * Equivalent minimal de `clsx` + `cva`, sans dependance. Les variantes
 * composees (`compoundVariants`) sont volontairement absentes : elles ne sont
 * pas necessaires aux composants d'`odoro-libs/ui`, et leur absence garde ce
 * module lisible d'un seul coup d'oeil.
 *
 * @module
 */

import type { OdoroClassName } from './generated/classNames.js'

/**
 * Une classe utilitaire d'Odoro, ou n'importe quelle chaine. L'union avec
 * `string` preserve l'autocompletion des classes connues tout en laissant
 * passer les classes applicatives.
 */
export type ClassName = OdoroClassName | (string & Record<never, never>)

/** Toute valeur acceptee par {@link cx}. */
export type ClassValue =
  | ClassName
  | number
  | null
  | undefined
  | false
  | readonly ClassValue[]
  | { readonly [key: string]: unknown }

/**
 * Concatene des noms de classes en ignorant les valeurs vides.
 *
 * Accepte des chaines, des nombres, des tableaux imbriques et des objets dont
 * les cles sont conservees quand la valeur est vraie.
 *
 * @example
 * cx('o-flex', condition && 'o-hidden', { 'o-p-4': padded }, ['o-gap-2'])
 * // 'o-flex o-p-4 o-gap-2'
 */
export function cx(...inputs: readonly ClassValue[]): string {
  const parts: string[] = []

  for (const input of inputs) {
    if (input === null || input === undefined || input === false || input === '') continue

    if (typeof input === 'string') parts.push(input)
    else if (typeof input === 'number') parts.push(String(input))
    else if (Array.isArray(input)) {
      const nested = cx(...(input as readonly ClassValue[]))
      if (nested !== '') parts.push(nested)
    } else {
      for (const [key, value] of Object.entries(input)) {
        if (value) parts.push(key)
      }
    }
  }

  return parts.join(' ')
}

/** Table des variantes : nom de variante -> valeur -> classes. */
export type VariantSchema = Readonly<Record<string, Readonly<Record<string, ClassValue>>>>

/** Proprietes acceptees par une fonction de variantes. */
export type VariantProps<S extends VariantSchema> = {
  [K in keyof S]?: keyof S[K] | null | undefined
} & { className?: ClassValue }

/** Configuration passee a {@link variants}. */
export interface VariantsConfig<S extends VariantSchema> {
  /** Classes appliquees quelles que soient les variantes. */
  base?: ClassValue
  /** Tables de variantes. */
  variants?: S
  /**
   * Valeur retenue pour chaque variante non fournie a l'appel. Comme dans
   * `cva`, `null` et `undefined` sont equivalents : tous deux retombent sur
   * la valeur par defaut. Une variante sans defaut et non fournie n'ajoute
   * aucune classe.
   */
  defaults?: { [K in keyof S]?: keyof S[K] }
}

/**
 * Construit une fonction qui resout un jeu de variantes en chaine de classes.
 *
 * @example
 * const button = variants({
 *   base: 'o-inline-flex o-items-center o-rounded-md',
 *   variants: {
 *     tone: { primary: 'o-bg-primary o-text-fg-inverted', ghost: 'o-bg-surface' },
 *     size: { sm: 'o-px-2 o-text-sm', md: 'o-px-4 o-text-base' },
 *   },
 *   defaults: { tone: 'primary', size: 'md' },
 * })
 *
 * button({ size: 'sm' })            // '... o-bg-primary ... o-px-2 o-text-sm'
 * button({ tone: 'ghost', className: 'o-w-full' })
 */
export function variants<S extends VariantSchema>(
  config: VariantsConfig<S>,
): (props?: VariantProps<S>) => string {
  const { base, variants: schema, defaults } = config

  return (props) => {
    const selected: ClassValue[] = []

    for (const name of Object.keys(schema ?? {}) as (keyof S)[]) {
      const chosen = props?.[name] ?? defaults?.[name]
      if (chosen === null || chosen === undefined) continue
      selected.push(schema?.[name]?.[chosen as string])
    }

    return cx(base, ...selected, props?.className)
  }
}
