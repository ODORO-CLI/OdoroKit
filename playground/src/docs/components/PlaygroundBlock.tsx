/**
 * Aire de jeu d'un composant : un apercu vivant pilote par un panneau de
 * reglages, et l'extrait de code correspondant, regenere a chaque changement.
 *
 * ## Le cadre est reglable aussi
 *
 * Un composant ne vit jamais sur le fond du catalogue : il vit sur celui du
 * projet. Le panneau expose donc, au-dessus des reglages du composant, la
 * couleur de fond et de texte de l'apercu — quelques pastilles pour les cas
 * usuels, un selecteur libre pour la charte exacte.
 *
 * ## Les variantes sous l'apercu
 *
 * Une aire de jeu montre UNE configuration a la fois ; les variantes en
 * montrent plusieurs d'un coup d'oeil. Chaque carte est un exemple nomme :
 * celles qui portent un jeu de valeurs s'appliquent a l'aire de jeu d'un
 * clic, celles qui portent une structure libre montrent un usage que les
 * reglages seuls ne savent pas exprimer.
 *
 * @module
 */

import { palette } from '@odoro-cli/libs/styles'
import { Icon } from '@odoro-cli/icons'
import { ChevronRight } from '@odoro-cli/icons/outline'
import {
  type CSSProperties,
  type ReactElement,
  type ReactNode,
  useMemo,
  useState,
} from 'react'

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

/**
 * Une variante presentee sous l'aire de jeu.
 *
 * Deux formes :
 * - `values` : la variante est un jeu de reglages du composant mere. Sa carte
 *   est rendue par la meme fonction `render` que l'apercu, et un clic
 *   l'applique a l'aire de jeu.
 * - `node` : la variante est une structure libre (icones, groupes,
 *   compositions) que les reglages ne savent pas exprimer. Sa carte n'est pas
 *   cliquable.
 */
export interface PlaygroundVariant {
  /** Nom court affiche sous la carte. */
  readonly title: string
  /** Detail d'une ligne, facultatif. */
  readonly description?: string
  /** Jeu de reglages applique au clic et rendu dans la carte. */
  readonly values?: Readonly<Record<string, ControlValue>>
  /** Structure libre, quand `values` ne suffit pas. */
  readonly node?: ReactNode
}

/** Proprietes de {@link PlaygroundBlock}. */
export interface PlaygroundBlockProps {
  /** Reglages proposes. */
  controls: readonly Control[]
  /** Rendu de l'apercu pour un jeu de valeurs. */
  render: (values: Record<string, ControlValue>) => ReactNode
  /** Extrait de code pour un jeu de valeurs. */
  code: (values: Record<string, ControlValue>) => string
  /** Variantes presentees sous l'aire de jeu. */
  variants?: readonly PlaygroundVariant[]
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

/** Reglage « suivre la page » : aucun style en ligne n'est pose. */
const AUTO = 'auto'

/** Fonds proposes pour le cadre. */
const FONDS: readonly (readonly [string, string])[] = [
  ['page', AUTO],
  ['white', palette.white ?? '#ffffff'],
  ['zinc-100', palette['zinc-100'] ?? '#f4f4f5'],
  ['zinc-900', palette['zinc-900'] ?? '#18181b'],
  ['zinc-950', palette['zinc-950'] ?? '#09090b'],
  ['brand-950', palette['brand-950'] ?? '#1e1b4b'],
]

/** Couleurs de texte proposees pour le cadre. */
const TEXTES: readonly (readonly [string, string])[] = [
  ['page', AUTO],
  ['zinc-900', palette['zinc-900'] ?? '#18181b'],
  ['white', palette.white ?? '#ffffff'],
  ['brand-400', palette['brand-400'] ?? '#818cf8'],
  ['amber-300', palette['amber-300'] ?? '#fcd34d'],
]

/** Etiquette d'un groupe du panneau. */
function GroupLabel({ children }: { children: ReactNode }): ReactElement {
  return (
    <p className="o-text-xs o-font-medium o-uppercase o-tracking-wider o-text-zinc-500 dark:o-text-zinc-400">
      {children}
    </p>
  )
}

/** Un rang de pastilles de couleur, avec le selecteur libre en bout. */
function Swatches({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: readonly (readonly [string, string])[]
  value: string
  onChange: (next: string) => void
}): ReactElement {
  return (
    <div className="o-flex o-flex-col o-gap-1">
      <span className="o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
        {label}
      </span>
      <span className="o-flex o-items-center o-gap-1.5">
        {options.map(([name, colour]) => (
          <button
            key={name}
            type="button"
            title={name}
            aria-label={`${label} : ${name}`}
            aria-pressed={value === colour}
            onClick={() => onChange(colour)}
            className={`o-size-6 o-shrink-0 o-rounded-full o-border-w-1 o-cursor-pointer o-transition-transform hover:o-scale-110 ${
              value === colour
                ? 'o-border-brand-500 o-scale-110'
                : 'o-border-zinc-300 dark:o-border-zinc-700'
            }`}
            style={
              colour === AUTO
                ? {
                    // La pastille « suivre la page » : un rond barre.
                    background:
                      'linear-gradient(135deg, transparent 44%, currentColor 44%, currentColor 56%, transparent 56%)',
                  }
                : { backgroundColor: colour }
            }
          />
        ))}
        {/*
          Le selecteur natif couvre ce que les pastilles ne peuvent pas : la
          couleur exacte d'une charte. Aucune classe ne peut le faire — une
          feuille statique ne contient pas tous les hexadecimaux.
        */}
        <input
          type="color"
          value={value.startsWith('#') ? value : '#888888'}
          onChange={(event) => onChange(event.target.value)}
          aria-label={`${label} — couleur libre`}
          className="o-size-6 o-shrink-0 o-cursor-pointer o-rounded-full o-border-w-1 o-border-zinc-300 dark:o-border-zinc-700 o-bg-transparent"
        />
      </span>
    </div>
  )
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
 * Apercu interactif : apercu au centre, panneau de reglages a droite —
 * cadre puis composant —, code genere en dessous, variantes en galerie.
 */
export function PlaygroundBlock({
  controls,
  render,
  code,
  variants,
  previewClassName,
}: PlaygroundBlockProps): ReactElement {
  const defaults = useMemo(
    () =>
      Object.fromEntries(controls.map((control) => [control.name, control.defaultValue])),
    [controls],
  )
  const [values, setValues] = useState<Record<string, ControlValue>>(defaults)
  const [showCode, setShowCode] = useState(true)
  const [fond, setFond] = useState(AUTO)
  const [texte, setTexte] = useState(AUTO)

  const frameStyle: CSSProperties = {
    ...(fond === AUTO ? {} : { backgroundColor: fond }),
    ...(texte === AUTO ? {} : { color: texte }),
  }

  const applyVariant = (variant: PlaygroundVariant): void => {
    if (variant.values === undefined) return
    setValues({ ...defaults, ...variant.values })
  }

  return (
    <div className="o-flex o-flex-col o-gap-3">
      <div className="o-grid o-grid-cols-1 lg:o-grid-cols-3 o-rounded-lg o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-overflow-hidden">
        <div
          className={`lg:o-col-span-2 o-flex o-items-center o-justify-center o-p-8 o-bg-zinc-50 dark:o-bg-zinc-900 o-overflow-x-auto o-transition-colors ${previewClassName ?? ''}`}
          style={frameStyle}
        >
          {render(values)}
        </div>
        <div className="o-flex o-flex-col o-gap-3 o-p-4 o-border-t lg:o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-900 lg:o-border-l">
          <GroupLabel>Cadre</GroupLabel>
          <Swatches label="fond" options={FONDS} value={fond} onChange={setFond} />
          <Swatches label="texte" options={TEXTES} value={texte} onChange={setTexte} />

          <div className="o-border-t o-border-zinc-200 dark:o-border-zinc-800" />
          <GroupLabel>Composant</GroupLabel>
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
            onClick={() => {
              setValues(defaults)
              setFond(AUTO)
              setTexte(AUTO)
            }}
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

      {variants === undefined || variants.length === 0 ? null : (
        <VariantGrid
          variants={variants}
          frameStyle={frameStyle}
          renderValues={(overrides) => render({ ...defaults, ...overrides })}
          onApply={applyVariant}
        />
      )}
    </div>
  )
}

/** Proprietes de {@link VariantGrid}. */
export interface VariantGridProps {
  /** Variantes presentees. */
  variants: readonly PlaygroundVariant[]
  /** Style pose sur la zone d'apercu de chaque carte. */
  frameStyle?: CSSProperties
  /** Rend une carte a valeurs. Sans lui, seules les cartes `node` s'affichent. */
  renderValues?: (values: Readonly<Record<string, ControlValue>>) => ReactNode
  /** Applique une variante a valeurs. Sans lui, les cartes ne sont pas cliquables. */
  onApply?: (variant: PlaygroundVariant) => void
}

/**
 * Galerie de variantes : une carte par exemple nomme.
 *
 * Employee par {@link PlaygroundBlock} sous son aire de jeu, et directement
 * par les pages dont la demonstration principale est a etat (boites de
 * dialogue, tiroirs, notifications) — leurs variantes sont alors des
 * structures libres (`node`), presentees sans aire de jeu.
 */
export function VariantGrid({
  variants,
  frameStyle,
  renderValues,
  onApply,
}: VariantGridProps): ReactElement {
  return (
    <div className="o-flex o-flex-col o-gap-2 o-pt-2">
      <p className="o-text-xs o-font-medium o-uppercase o-tracking-wider o-text-zinc-500 dark:o-text-zinc-400">
        {variants.length} variante{variants.length > 1 ? 's' : ''}
      </p>
      <div className="o-grid o-grid-cols-1 sm:o-grid-cols-2 lg:o-grid-cols-3 o-gap-3">
        {variants.map((variant) => {
          const clickable = variant.values !== undefined && onApply !== undefined
          const preview = (
            <>
              <span
                className="o-flex o-min-h-32 o-flex-1 o-items-center o-justify-center o-p-5 o-bg-zinc-50 dark:o-bg-zinc-900 o-overflow-hidden o-transition-colors"
                style={frameStyle}
              >
                {variant.node ??
                  (variant.values !== undefined ? renderValues?.(variant.values) : null)}
              </span>
              <span className="o-flex o-flex-col o-gap-0.5 o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-900 o-px-3 o-py-2 o-text-left">
                <span className="o-text-sm o-font-medium o-text-zinc-900 dark:o-text-zinc-50">
                  {variant.title}
                </span>
                {variant.description === undefined ? null : (
                  <span className="o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
                    {variant.description}
                  </span>
                )}
              </span>
            </>
          )

          const cardClass =
            'o-flex o-flex-col o-rounded-lg o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-overflow-hidden o-transition-all'

          // Une carte a valeurs s'applique d'un clic ; une carte a structure
          // libre est un exemple fige, pas un bouton.
          return clickable ? (
            <button
              key={variant.title}
              type="button"
              onClick={() => onApply(variant)}
              aria-label={`Appliquer la variante ${variant.title}`}
              className={`${cardClass} o-cursor-pointer o-text-left hover:o-border-brand-500 dark:hover:o-border-brand-400 hover:o-shadow-md hover:o-lift-sm`}
            >
              {preview}
            </button>
          ) : (
            <div key={variant.title} className={cardClass}>
              {preview}
            </div>
          )
        })}
      </div>
    </div>
  )
}
