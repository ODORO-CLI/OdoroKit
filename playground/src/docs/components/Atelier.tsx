/**
 * L'atelier : un cadre de preview reglable.
 *
 * ## Pourquoi tout est reglable
 *
 * Une preview figee ne repond qu'a une question — « a quoi ca ressemble ? » —
 * et jamais a celle qu'on se pose vraiment : « est-ce que ca marche chez
 * moi ? ». Le fond de la page n'est pas celui du catalogue, la couleur du
 * texte non plus, et le rayon des angles suit une charte.
 *
 * ## Le contenu de demonstration est un reglage, pas un interrupteur
 *
 * Un fond ne porte pas toujours un hero. L'atelier propose donc plusieurs
 * maquettes — hero, cartes, formulaire, chiffres, article — et « aucun » pour
 * juger l'effet nu. Chacune pose une question differente au composant.
 *
 * ## Les couleurs du composant
 *
 * Quand une entree declare ses tokens de couleur, l'atelier les expose : un
 * emplacement par token, et le nuancier complet de la palette pour le
 * remplacer. C'est la reponse a la vraie question — « et dans ma teinte ? » —
 * sans quitter la page.
 *
 * @module
 */

import { palette } from '@odoro-cli/libs/styles'
import {
  useMemo,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

import { DemoContent, type DemoVariant } from './DemoContent.jsx'

/** Un reglage propre au composant presente. */
export type AtelierControl =
  | {
      readonly kind: 'range'
      readonly name: string
      readonly label: string
      readonly min: number
      readonly max: number
      readonly step: number
      readonly value: number
      readonly unit?: string
    }
  | {
      readonly kind: 'choice'
      readonly name: string
      readonly label: string
      readonly options: readonly string[]
      readonly value: string
    }
  | {
      readonly kind: 'switch'
      readonly name: string
      readonly label: string
      readonly value: boolean
    }
  | {
      readonly kind: 'colors'
      readonly name: string
      readonly label: string
      /** Tokens de depart, un par emplacement. */
      readonly value: readonly string[]
    }

/** Valeurs courantes des reglages, indexees par leur nom. */
export type AtelierValues = Readonly<
  Record<string, number | string | boolean | readonly string[]>
>

/** Etat du cadre, transmis a ce qui est presente. */
export interface AtelierFrame {
  /** Couleur de fond choisie. */
  readonly background: string
  /** Couleur de texte choisie. */
  readonly color: string
  /** Rayon des angles, en pixels. */
  readonly radius: number
  /** `true` si une maquette de contenu est affichee. */
  readonly demo: boolean
  /** Maquette de contenu affichee. */
  readonly demoVariant: DemoVariant
}

/** Options de l'atelier. */
export interface AtelierProps {
  /** Reglages propres au composant. */
  readonly controls?: readonly AtelierControl[]
  /** Hauteur du cadre. @defaultValue 'o-h-80' */
  readonly height?: string
  /** Contenu de demonstration affiche par defaut. @defaultValue true */
  readonly demoByDefault?: boolean
  /** Maquette de depart quand le contenu est affiche. @defaultValue 'hero' */
  readonly demoVariant?: DemoVariant
  /** Fond de depart. @defaultValue le fond du theme courant */
  readonly background?: string
  /** Couleur de texte de depart. @defaultValue l'encre du theme courant */
  readonly color?: string
  /**
   * Rend la preview differee, derriere un interrupteur.
   *
   * Un composant qui telecharge cent trente kilo-octets ne doit pas se monter
   * parce qu'on a fait defiler la page jusqu'a lui. L'interrupteur vit dans le
   * panneau, jamais dans le cadre : le contenu de demonstration se pose
   * par-dessus la preview, et recouvrirait tout ce qu'on y placerait.
   */
  readonly deferred?: { readonly label: string; readonly hint: string }
  /** Ce qui est presente. */
  readonly children: (values: AtelierValues, frame: AtelierFrame) => ReactNode
}

/** Fonds proposes : le theme courant d'abord, puis trois neutres, deux teintes, le blanc. */
const BACKGROUNDS: readonly (readonly [string, string])[] = [
  ['theme', 'var(--o-theme-bg)'],
  ['zinc-950', palette['zinc-950'] ?? '#09090b'],
  ['zinc-900', palette['zinc-900'] ?? '#18181b'],
  ['brand-950', palette['brand-950'] ?? '#1e1b4b'],
  ['zinc-100', palette['zinc-100'] ?? '#f4f4f5'],
  ['brand-50', palette['brand-50'] ?? '#eef2ff'],
  ['white', palette.white ?? '#ffffff'],
]

/** Couleurs de texte proposees : le theme courant d'abord. */
const COLORS: readonly (readonly [string, string])[] = [
  ['theme', 'var(--o-theme-fg)'],
  ['white', palette.white ?? '#ffffff'],
  ['zinc-900', palette['zinc-900'] ?? '#18181b'],
  ['brand-400', palette['brand-400'] ?? '#818cf8'],
  ['amber-300', palette['amber-300'] ?? '#fcd34d'],
]

/** Les maquettes de contenu proposees, dans l'ordre d'affichage. */
const VARIANTS: readonly (readonly [DemoVariant, string])[] = [
  ['aucun', 'Aucun'],
  ['hero', 'Hero'],
  ['cartes', 'Cartes'],
  ['formulaire', 'Formulaire'],
  ['stats', 'Chiffres'],
  ['article', 'Article'],
]

/** Teintes de la palette, dans l'ordre du nuancier. */
const HUES = [
  'brand',
  'red',
  'orange',
  'amber',
  'yellow',
  'lime',
  'green',
  'emerald',
  'teal',
  'cyan',
  'sky',
  'blue',
  'indigo',
  'violet',
  'purple',
  'fuchsia',
  'pink',
  'rose',
  'slate',
  'gray',
  'zinc',
  'stone',
] as const

const SHADES = [
  '50',
  '100',
  '200',
  '300',
  '400',
  '500',
  '600',
  '700',
  '800',
  '900',
  '950',
] as const

/** Les variables de theme, dans l'ordre du nuancier. */
const THEME_KEYS = ['bg', 'surface', 'fg', 'muted', 'line'] as const

/**
 * Couleur CSS d'un token (`--o-palette-sky-500` -> sa valeur).
 *
 * Une variable de theme n'a pas de valeur fixe : elle est lue sur le document,
 * dans le theme du moment.
 */
function tokenColour(token: string): string {
  if (token.startsWith('--o-theme-') && typeof document !== 'undefined') {
    const live = getComputedStyle(document.documentElement).getPropertyValue(token).trim()
    if (live !== '') return live
  }
  const key = token.replace('--o-palette-', '')
  return (palette as Readonly<Record<string, string>>)[key] ?? '#888888'
}

/** Nom court d'un token (`--o-palette-sky-500` -> `sky-500`, `--o-theme-bg` -> `theme-bg`). */
function tokenLabel(token: string): string {
  return token.replace('--o-palette-', '').replace('--o-theme-', 'theme-')
}

/** Etiquette d'un groupe du panneau. */
function GroupLabel({ children }: { children: ReactNode }): ReactElement {
  return (
    <p className="o-text-xs o-font-semibold o-uppercase o-tracking-wider o-text-zinc-400 dark:o-text-zinc-500">
      {children}
    </p>
  )
}

/** Etiquette de rang, a largeur fixe pour aligner les reglages. */
function RowLabel({ children }: { children: ReactNode }): ReactElement {
  return (
    <span className="o-w-20 o-shrink-0 o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
      {children}
    </span>
  )
}

/** Un rang de pastilles de couleur. */
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
    <label className="o-flex o-items-center o-gap-2">
      <RowLabel>{label}</RowLabel>
      <span className="o-flex o-gap-1.5">
        {options.map(([name, colour]) => (
          <button
            key={name}
            type="button"
            title={name}
            aria-label={name}
            aria-pressed={value === colour}
            onClick={() => onChange(colour)}
            className={`o-size-6 o-rounded-full o-border-w-1 o-cursor-pointer o-transition-transform hover:o-scale-110 ${
              value === colour
                ? 'o-border-brand-500 o-scale-110'
                : 'o-border-zinc-300 dark:o-border-zinc-700'
            }`}
            style={{ backgroundColor: colour }}
          />
        ))}
      </span>
      {/*
        Le selecteur natif couvre ce que six pastilles ne peuvent pas : la
        couleur exacte d'une charte. Il n'y a pas de classe pour cela, et il
        n'y en aura pas — une feuille statique ne peut pas contenir tous les
        hexadecimaux.
      */}
      <input
        type="color"
        value={value.startsWith('#') ? value : '#000000'}
        onChange={(event) => onChange(event.target.value)}
        aria-label={`${label} — couleur libre`}
        className="o-size-6 o-cursor-pointer o-rounded-full o-border-w-1 o-border-zinc-300 dark:o-border-zinc-700 o-bg-transparent"
      />
    </label>
  )
}

/** Interrupteur du panneau. */
function PanelSwitch({
  checked,
  onToggle,
  label,
}: {
  checked: boolean
  onToggle: () => void
  label?: string
}): ReactElement {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      {...(label === undefined ? {} : { 'aria-label': label })}
      onClick={onToggle}
      className={`o-h-6 o-w-11 o-shrink-0 o-rounded-full o-border-w-1 o-cursor-pointer o-transition-colors ${
        checked
          ? 'o-bg-brand-500 o-border-brand-500'
          : 'o-bg-zinc-200 dark:o-bg-zinc-800 o-border-zinc-300 dark:o-border-zinc-700'
      }`}
    >
      <span
        className="o-block o-size-4 o-rounded-full o-bg-white o-transition-transform"
        style={{ transform: `translateX(${checked ? '22px' : '2px'})` }}
      />
    </button>
  )
}

/** Rang de boutons a choix unique. */
function ChoiceRow({
  options,
  value,
  onChange,
}: {
  options: readonly (readonly [string, string])[]
  value: string
  onChange: (next: string) => void
}): ReactElement {
  return (
    <span className="o-flex o-flex-wrap o-gap-1">
      {options.map(([option, label]) => (
        <button
          key={option}
          type="button"
          aria-pressed={value === option}
          onClick={() => onChange(option)}
          className={`o-h-7 o-px-2 o-rounded-md o-border-w-1 o-text-xs o-cursor-pointer o-transition-colors ${
            value === option
              ? 'o-border-brand-500 o-bg-brand-50 dark:o-bg-brand-950 o-text-brand-600 dark:o-text-brand-400'
              : 'o-border-zinc-300 dark:o-border-zinc-700 o-text-zinc-500 dark:o-text-zinc-400 hover:o-text-zinc-900 dark:hover:o-text-zinc-100'
          }`}
        >
          {label}
        </button>
      ))}
    </span>
  )
}

/**
 * Reglage des couleurs du composant : un emplacement par token, et le
 * nuancier complet de la palette pour remplacer celui qui est ouvert.
 */
function ColourSlots({
  label,
  tokens,
  onChange,
}: {
  label: string
  tokens: readonly string[]
  onChange: (next: readonly string[]) => void
}): ReactElement {
  const [openSlot, setOpenSlot] = useState<number | null>(null)

  const pick = (shadeToken: string): void => {
    if (openSlot === null) return
    const next = tokens.map((token, index) => (index === openSlot ? shadeToken : token))
    onChange(next)
    setOpenSlot(null)
  }

  return (
    <div className="o-flex o-flex-col o-gap-2 md:o-col-span-2">
      <div className="o-flex o-items-center o-gap-2">
        <RowLabel>{label}</RowLabel>
        <span className="o-flex o-flex-wrap o-gap-1.5">
          {tokens.map((token, index) => (
            <button
              key={index}
              type="button"
              aria-expanded={openSlot === index}
              title={tokenLabel(token)}
              onClick={() => setOpenSlot(openSlot === index ? null : index)}
              className={`o-inline-flex o-items-center o-gap-1.5 o-rounded-md o-border-w-1 o-py-1 o-pl-1.5 o-pr-2 o-text-xs o-font-mono o-cursor-pointer o-transition-colors ${
                openSlot === index
                  ? 'o-border-brand-500 o-text-brand-600 dark:o-text-brand-400'
                  : 'o-border-zinc-300 dark:o-border-zinc-700 o-text-zinc-500 dark:o-text-zinc-400'
              }`}
            >
              <span
                className="o-size-4 o-rounded-sm o-border-w-1 o-border-zinc-300 dark:o-border-zinc-700"
                style={{ backgroundColor: tokenColour(token) }}
              />
              {tokenLabel(token)}
            </button>
          ))}
        </span>
      </div>

      {openSlot === null ? null : (
        <div className="o-flex o-flex-col o-gap-1 o-rounded-md o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-950 o-p-2">
          {/* Les variables de theme d'abord : c'est ce qu'un fond lit pour
              suivre la bascule clair / sombre. */}
          <div className="o-flex o-items-center o-gap-1 o-pb-1 o-mb-1 o-border-b o-border-zinc-100 dark:o-border-zinc-900">
            <span className="o-w-14 o-shrink-0 o-text-right o-pr-1 o-font-mono o-text-xs o-text-zinc-400 dark:o-text-zinc-600">
              theme
            </span>
            {THEME_KEYS.map((key) => {
              const token = `--o-theme-${key}`
              const selected = tokens[openSlot] === token
              return (
                <button
                  key={key}
                  type="button"
                  title={`theme-${key}`}
                  aria-label={`theme-${key}`}
                  aria-pressed={selected}
                  onClick={() => pick(token)}
                  className={`o-h-4 o-w-12 o-cursor-pointer o-rounded-sm o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-transition-transform hover:o-scale-110 ${
                    selected ? 'o-ring' : ''
                  }`}
                  style={{ backgroundColor: tokenColour(token) }}
                />
              )
            })}
          </div>
          {HUES.map((hue) => (
            <div key={hue} className="o-flex o-items-center o-gap-1">
              <span className="o-w-14 o-shrink-0 o-text-right o-pr-1 o-font-mono o-text-xs o-text-zinc-400 dark:o-text-zinc-600">
                {hue}
              </span>
              {SHADES.map((shade) => {
                const token = `--o-palette-${hue}-${shade}`
                const selected = tokens[openSlot] === token
                return (
                  <button
                    key={shade}
                    type="button"
                    title={`${hue}-${shade}`}
                    aria-label={`${hue}-${shade}`}
                    aria-pressed={selected}
                    onClick={() => pick(token)}
                    className={`o-h-4 o-flex-1 o-cursor-pointer o-rounded-sm o-transition-transform hover:o-scale-110 ${
                      selected ? 'o-ring' : ''
                    }`}
                    style={{ backgroundColor: tokenColour(token) }}
                  />
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * Cadre de preview reglable.
 *
 * @example
 * <Atelier controls={[{ kind: 'range', name: 'speed', label: 'Vitesse', min: 0, max: 1, step: 0.01, value: 0.12 }]}>
 *   {(values, frame) => <Aurora speed={values.speed as number} className="o-absolute o-inset-0" />}
 * </Atelier>
 */
export function Atelier({
  controls = [],
  height = 'o-h-80',
  demoByDefault = true,
  demoVariant: initialVariant = 'hero',
  // Le cadre suit le theme du visiteur : un fond qui lit ses tokens doit se
  // montrer clair en clair, et le texte de demonstration rester lisible.
  background = 'var(--o-theme-bg)',
  color = 'var(--o-theme-fg)',
  deferred,
  children,
}: AtelierProps): ReactElement {
  const [mounted, setMounted] = useState(false)
  const [frameBackground, setBackground] = useState(background)
  const [frameColor, setColor] = useState(color)
  const [radius, setRadius] = useState(12)
  const [variant, setVariant] = useState<DemoVariant>(
    demoByDefault ? initialVariant : 'aucun',
  )

  const [values, setValues] = useState<AtelierValues>(() =>
    Object.fromEntries(controls.map((control) => [control.name, control.value])),
  )

  const frame = useMemo<AtelierFrame>(
    () => ({
      background: frameBackground,
      color: frameColor,
      radius,
      demo: variant !== 'aucun',
      demoVariant: variant,
    }),
    [frameBackground, frameColor, radius, variant],
  )

  const surface: CSSProperties = {
    backgroundColor: frameBackground,
    color: frameColor,
    borderRadius: `${String(radius)}px`,
  }

  const set = (name: string, next: AtelierValues[string]): void => {
    setValues((previous) => ({ ...previous, [name]: next }))
  }

  return (
    <div className="o-flex o-flex-col o-gap-3">
      <div
        data-o-atelier-frame=""
        className={`o-relative o-w-full o-overflow-hidden o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 ${height}`}
        style={surface}
      >
        {deferred === undefined || mounted ? (
          children(values, frame)
        ) : (
          <div className="o-absolute o-inset-0 o-flex o-items-center o-justify-center o-p-8">
            <p className="o-max-w-sm o-text-center o-text-sm o-opacity-70">
              {deferred.hint}
            </p>
          </div>
        )}
        {variant === 'aucun' ? null : (
          // Le contenu de demonstration est decoratif : il ne doit jamais
          // intercepter un clic destine a la preview.
          <div className="o-absolute o-inset-0 o-pointer-events-none">
            <DemoContent variant={variant} color={frameColor} radius={radius} />
          </div>
        )}
      </div>

      <div className="o-flex o-flex-col o-gap-3 o-rounded-lg o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-zinc-50 dark:o-bg-zinc-900 o-p-4">
        <GroupLabel>Cadre</GroupLabel>
        <div className="o-grid o-gap-3 md:o-grid-cols-2">
          <Swatches
            label="Fond"
            options={BACKGROUNDS}
            value={frameBackground}
            onChange={setBackground}
          />
          <Swatches
            label="Texte"
            options={COLORS}
            value={frameColor}
            onChange={setColor}
          />

          <label className="o-flex o-items-center o-gap-2">
            <RowLabel>Rayon</RowLabel>
            <input
              type="range"
              min={0}
              max={40}
              step={1}
              value={radius}
              onChange={(event) => setRadius(Number(event.target.value))}
              className="o-flex-1 o-accent-brand-500"
            />
            <span className="o-w-12 o-text-right o-font-mono o-text-xs o-tabular-nums">
              {radius} px
            </span>
          </label>

          {deferred === undefined ? null : (
            <label className="o-flex o-items-center o-gap-2">
              <RowLabel>{deferred.label}</RowLabel>
              <PanelSwitch checked={mounted} onToggle={() => setMounted(!mounted)} />
              <span className="o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
                {mounted ? 'montee' : 'non montee'}
              </span>
            </label>
          )}

          <div className="o-flex o-items-center o-gap-2 md:o-col-span-2">
            <RowLabel>Contenu</RowLabel>
            <ChoiceRow
              options={VARIANTS}
              value={variant}
              onChange={(next) => setVariant(next as DemoVariant)}
            />
          </div>
        </div>

        {controls.length === 0 ? null : (
          <>
            <div className="o-border-t o-border-zinc-200 dark:o-border-zinc-800" />
            <GroupLabel>Composant</GroupLabel>
            <div className="o-grid o-gap-3 md:o-grid-cols-2">
              {controls.map((control) => {
                if (control.kind === 'colors') {
                  const current = values[control.name]
                  return (
                    <ColourSlots
                      key={control.name}
                      label={control.label}
                      tokens={Array.isArray(current) ? current : control.value}
                      onChange={(next) => set(control.name, next)}
                    />
                  )
                }

                return (
                  <label key={control.name} className="o-flex o-items-center o-gap-2">
                    <span className="o-w-24 o-shrink-0 o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
                      {control.label}
                    </span>

                    {control.kind === 'range' ? (
                      <>
                        <input
                          type="range"
                          min={control.min}
                          max={control.max}
                          step={control.step}
                          value={Number(values[control.name] ?? control.value)}
                          onChange={(event) =>
                            set(control.name, Number(event.target.value))
                          }
                          className="o-flex-1 o-accent-brand-500"
                        />
                        <span className="o-w-14 o-text-right o-font-mono o-text-xs o-tabular-nums">
                          {String(values[control.name] ?? control.value)}
                          {control.unit ?? ''}
                        </span>
                      </>
                    ) : null}

                    {control.kind === 'choice' ? (
                      <ChoiceRow
                        options={control.options.map((option) => [option, option])}
                        value={String(values[control.name] ?? control.value)}
                        onChange={(next) => set(control.name, next)}
                      />
                    ) : null}

                    {control.kind === 'switch' ? (
                      <PanelSwitch
                        checked={values[control.name] === true}
                        onToggle={() => set(control.name, values[control.name] !== true)}
                      />
                    ) : null}
                  </label>
                )
              })}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
