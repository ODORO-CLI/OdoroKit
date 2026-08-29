/**
 * Aire de jeu d'un composant : un apercu vivant pilote par un panneau de
 * reglages, et l'extrait de code correspondant, regenere a chaque changement.
 *
 * @module
 */

import { Icon } from '@odoro/icons'
import { ChevronRight } from '@odoro/icons/filaire'
import { type ReactElement, type ReactNode, useMemo, useState } from 'react'

import { CodeBlock } from './CodeBlock.jsx'

/** Valeur d'un reglage. */
export type ControlValue = string | number | boolean

/** Un reglage du panneau. */
export interface Control {
  /** Nom de la prop pilotee. */
  readonly name: string
  /** Libelle affiche. @defaultValue le nom */
  readonly label?: string
  /** Type de champ. */
  readonly type: 'select' | 'boolean' | 'text' | 'number'
  /** Valeurs proposees (type `select`). */
  readonly options?: readonly string[]
  /** Valeur initiale. */
  readonly defaultValue: ControlValue
  /** Bornes et pas (type `number`). */
  readonly min?: number
  readonly max?: number
  readonly step?: number
}

/** Proprietes de {@link PlaygroundBlock}. */
export interface PlaygroundBlockProps {
  /** Reglages proposes. */
  controls: readonly Control[]
  /** Rendu de l'apercu pour un jeu de valeurs. */
  render: (values: Record<string, ControlValue>) => ReactNode
  /** Extrait de code pour un jeu de valeurs. */
  code: (values: Record<string, ControlValue>) => string
  /** Hauteur minimale de l'apercu, en classes. @defaultValue 'o-min-h-0' */
  previewClassName?: string
}

/**
 * Construit la chaine d'attributs JSX d'un jeu de valeurs, en omettant celles
 * restees a leur defaut : l'extrait montre ce qui a ete change, rien de plus.
 *
 * Les valeurs `undefined` sont ignorees : l'acces indexe a un
 * `Record<string, ControlValue>` produit `ControlValue | undefined` sous
 * `noUncheckedIndexedAccess`, et les pages n'ont pas a s'en soucier.
 *
 * @example
 * jsxProps({ tone: 'danger', block: true }, { tone: 'primary', block: false })
 * // ' tone="danger" block'
 */
export function jsxProps(
  values: Record<string, ControlValue | undefined>,
  defaults: Record<string, ControlValue>,
): string {
  let result = ''
  for (const [name, value] of Object.entries(values)) {
    if (value === undefined || value === defaults[name]) continue
    if (typeof value === 'boolean') result += value ? ` ${name}` : ` ${name}={false}`
    else if (typeof value === 'number') result += ` ${name}={${value}}`
    else result += ` ${name}="${value}"`
  }
  return result
}

/** Champ d'un reglage. */
function ControlField({
  control,
  value,
  onChange,
}: {
  control: Control
  value: ControlValue
  onChange: (value: ControlValue) => void
}): ReactElement {
  const label = control.label ?? control.name
  const inputClass =
    'o-w-full o-h-8 o-px-2 o-text-sm o-rounded-md o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-900 o-text-zinc-900 dark:o-text-zinc-50 hover:o-border-zinc-300 dark:hover:o-border-zinc-700 o-transition-colors'

  if (control.type === 'boolean') {
    return (
      <label className="o-flex o-items-center o-justify-between o-gap-2 o-text-sm o-text-zinc-900 dark:o-text-zinc-50 o-cursor-pointer">
        <span className="o-font-mono o-text-xs">{label}</span>
        <input
          type="checkbox"
          checked={value === true}
          onChange={(event) => onChange(event.target.checked)}
          className="o-accent-brand-600 dark:o-accent-brand-400 o-size-4"
        />
      </label>
    )
  }

  return (
    <label className="o-flex o-flex-col o-gap-1 o-text-sm o-text-zinc-900 dark:o-text-zinc-50">
      <span className="o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
        {label}
      </span>
      {control.type === 'select' ? (
        <select
          value={String(value)}
          onChange={(event) => onChange(event.target.value)}
          className={`${inputClass} o-cursor-pointer`}
        >
          {(control.options ?? []).map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      ) : control.type === 'number' ? (
        <input
          type="number"
          value={Number(value)}
          min={control.min}
          max={control.max}
          step={control.step}
          onChange={(event) => onChange(Number(event.target.value))}
          className={inputClass}
        />
      ) : (
        <input
          type="text"
          value={String(value)}
          onChange={(event) => onChange(event.target.value)}
          className={inputClass}
        />
      )}
    </label>
  )
}

/**
 * Apercu interactif : panneau de reglages a droite, apercu au centre, code
 * genere en dessous.
 */
export function PlaygroundBlock({
  controls,
  render,
  code,
  previewClassName,
}: PlaygroundBlockProps): ReactElement {
  const defaults = useMemo(
    () =>
      Object.fromEntries(controls.map((control) => [control.name, control.defaultValue])),
    [controls],
  )
  const [values, setValues] = useState<Record<string, ControlValue>>(defaults)
  const [showCode, setShowCode] = useState(true)

  return (
    <div className="o-flex o-flex-col o-gap-3">
      <div className="o-grid o-grid-cols-1 lg:o-grid-cols-3 o-rounded-lg o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-overflow-hidden">
        <div
          className={`lg:o-col-span-2 o-flex o-items-center o-justify-center o-p-8 o-bg-zinc-50 dark:o-bg-zinc-900 o-overflow-x-auto ${previewClassName ?? ''}`}
        >
          {render(values)}
        </div>
        <div className="o-flex o-flex-col o-gap-3 o-p-4 o-border-t lg:o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-900 lg:o-border-l">
          <p className="o-text-xs o-font-medium o-uppercase o-tracking-wider o-text-zinc-400 dark:o-text-zinc-500">
            Reglages
          </p>
          {controls.map((control) => (
            <ControlField
              key={control.name}
              control={control}
              value={values[control.name] ?? control.defaultValue}
              onChange={(value) =>
                setValues((current) => ({ ...current, [control.name]: value }))
              }
            />
          ))}
          <button
            type="button"
            onClick={() => setValues(defaults)}
            className="o-self-start o-text-xs o-text-zinc-500 dark:o-text-zinc-400 hover:o-text-zinc-900 dark:hover:o-text-zinc-50 o-underline o-underline-offset-2 o-cursor-pointer o-transition-colors"
          >
            Reinitialiser
          </button>
        </div>
      </div>

      <div className="o-flex o-items-center o-gap-2">
        <button
          type="button"
          onClick={() => setShowCode((current) => !current)}
          aria-expanded={showCode}
          className="o-text-sm o-text-zinc-500 dark:o-text-zinc-400 hover:o-text-zinc-900 dark:hover:o-text-zinc-50 o-cursor-pointer o-transition-colors o-inline-flex o-items-center o-gap-1"
        >
          <Icon
            icon={ChevronRight}
            size={14}
            className={`o-transition-transform ${showCode ? 'o-rotate-90' : ''}`}
          />
          Code
        </button>
      </div>
      {showCode ? <CodeBlock code={code(values)} /> : null}
    </div>
  )
}
