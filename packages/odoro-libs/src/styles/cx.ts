/**
 * Class name composition and variant helper.
 *
 * Minimal equivalent of `clsx` + `cva`, with no dependency. Compound variants
 * (`compoundVariants`) are deliberately absent: they are not needed by the
 * components of `@odoro-cli/libs/ui`, and leaving them out keeps this module
 * readable at a single glance.
 *
 * @module
 */

import type { OdoroClassName } from './generated/classNames.js'

/**
 * An Odoro utility class, or any string at all. The union with `string`
 * preserves autocompletion of the known classes while still letting
 * application classes through.
 */
export type ClassName = OdoroClassName | (string & Record<never, never>)

/** Any value accepted by {@link cx}. */
export type ClassValue =
  | ClassName
  | number
  | null
  | undefined
  | false
  | readonly ClassValue[]
  | { readonly [key: string]: unknown }

/**
 * Concatenates class names, ignoring empty values.
 *
 * Accepts strings, numbers, nested arrays and objects whose keys are kept
 * when the value is truthy.
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

/** Variant table: variant name -> value -> classes. */
export type VariantSchema = Readonly<Record<string, Readonly<Record<string, ClassValue>>>>

/** Properties accepted by a variant function. */
export type VariantProps<S extends VariantSchema> = {
  [K in keyof S]?: keyof S[K] | null | undefined
} & { className?: ClassValue }

/** Configuration passed to {@link variants}. */
export interface VariantsConfig<S extends VariantSchema> {
  /** Classes applied whatever the variants are. */
  base?: ClassValue
  /** Variant tables. */
  variants?: S
  /**
   * Value kept for every variant not supplied at the call site. As in `cva`,
   * `null` and `undefined` are equivalent: both fall back on the default
   * value. A variant with no default and not supplied adds no class at all.
   */
  defaults?: { [K in keyof S]?: keyof S[K] }
}

/**
 * Builds a function that resolves a set of variants into a class string.
 *
 * @example
 * const button = variants({
 *   base: 'o-inline-flex o-items-center o-rounded-md',
 *   variants: {
 *     tone: { primary: 'o-bg-brand-600 dark:o-bg-brand-400 o-text-white dark:o-text-zinc-950', ghost: 'o-bg-white dark:o-bg-zinc-900' },
 *     size: { sm: 'o-px-2 o-text-sm', md: 'o-px-4 o-text-base' },
 *   },
 *   defaults: { tone: 'primary', size: 'md' },
 * })
 *
 * button({ size: 'sm' })            // '... o-bg-brand-600 dark:o-bg-brand-400 ... o-px-2 o-text-sm'
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
