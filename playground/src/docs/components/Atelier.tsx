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
 * L'atelier expose donc ces trois reglages pour toute preview, plus ceux que
 * la page declare pour son composant. Les valeurs sont appliquees en style en
 * ligne : c'est le seul niveau du contrat qui l'emporte toujours, et c'est
 * exactement ce qu'on veut d'un bac a sable.
 *
 * ## L'interrupteur de contenu
 *
 * Un fond juge sur cadre vide ment. Le contenu de demonstration est donc pose
 * par-dessus par defaut, et se coupe d'un clic pour voir l'effet nu.
 *
 * @module
 */

import { palette } from 'odoro-libs/styles'
import {
  useMemo,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

import { DemoContent } from './DemoContent.jsx'

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

/** Valeurs courantes des reglages, indexees par leur nom. */
export type AtelierValues = Readonly<Record<string, number | string | boolean>>

/** Etat du cadre, transmis a ce qui est presente. */
export interface AtelierFrame {
  /** Couleur de fond choisie. */
  readonly background: string
  /** Couleur de texte choisie. */
  readonly color: string
  /** Rayon des angles, en pixels. */
  readonly radius: number
  /** `true` si le contenu de demonstration est affiche. */
  readonly demo: boolean
}

/** Options de l'atelier. */
export interface AtelierProps {
  /** Reglages propres au composant. */
  readonly controls?: readonly AtelierControl[]
  /** Hauteur du cadre. @defaultValue 'o-h-80' */
  readonly height?: string
  /** Contenu de demonstration affiche par defaut. @defaultValue true */
  readonly demoByDefault?: boolean
  /** Fond de depart. @defaultValue une nuance neutre foncee */
  readonly background?: string
  /** Couleur de texte de depart. @defaultValue blanc */
  readonly color?: string
  /** Ce qui est presente. */
  readonly children: (values: AtelierValues, frame: AtelierFrame) => ReactNode
}

/** Fonds proposes : deux neutres, deux teintes, pour couvrir les cas usuels. */
const BACKGROUNDS: readonly (readonly [string, string])[] = [
  ['zinc-950', palette['zinc-950'] ?? '#09090b'],
  ['zinc-100', palette['zinc-100'] ?? '#f4f4f5'],
  ['brand-950', palette['brand-950'] ?? '#1e1b4b'],
  ['white', palette.white ?? '#ffffff'],
]

/** Couleurs de texte proposees. */
const COLORS: readonly (readonly [string, string])[] = [
  ['white', palette.white ?? '#ffffff'],
  ['zinc-900', palette['zinc-900'] ?? '#18181b'],
  ['brand-400', palette['brand-400'] ?? '#818cf8'],
  ['amber-300', palette['amber-300'] ?? '#fcd34d'],
]

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
      <span className="o-w-16 o-shrink-0 o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
        {label}
      </span>
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
        Le selecteur natif couvre ce que quatre pastilles ne peuvent pas : la
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
  background = palette['zinc-950'] ?? '#09090b',
  color = palette.white ?? '#ffffff',
  children,
}: AtelierProps): ReactElement {
  const [frameBackground, setBackground] = useState(background)
  const [frameColor, setColor] = useState(color)
  const [radius, setRadius] = useState(12)
  const [demo, setDemo] = useState(demoByDefault)

  const [values, setValues] = useState<AtelierValues>(() =>
    Object.fromEntries(controls.map((control) => [control.name, control.value])),
  )

  const frame = useMemo<AtelierFrame>(
    () => ({ background: frameBackground, color: frameColor, radius, demo }),
    [frameBackground, frameColor, radius, demo],
  )

  const surface: CSSProperties = {
    backgroundColor: frameBackground,
    color: frameColor,
    borderRadius: `${String(radius)}px`,
  }

  const set = (name: string, next: number | string | boolean): void => {
    setValues((previous) => ({ ...previous, [name]: next }))
  }

  return (
    <div className="o-flex o-flex-col o-gap-3">
      <div
        className={`o-relative o-w-full o-overflow-hidden o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 ${height}`}
        style={surface}
      >
        {children(values, frame)}
        {demo ? (
          <div className="o-absolute o-inset-0">
            <DemoContent color={frameColor} radius={radius} />
          </div>
        ) : null}
      </div>

      <div className="o-flex o-flex-col o-gap-3 o-rounded-lg o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-bg-zinc-50 dark:o-bg-zinc-900 o-p-4">
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
            <span className="o-w-16 o-shrink-0 o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
              Rayon
            </span>
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

          <label className="o-flex o-items-center o-gap-2">
            <span className="o-w-16 o-shrink-0 o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
              Demo
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={demo}
              onClick={() => setDemo(!demo)}
              className={`o-h-6 o-w-11 o-rounded-full o-border-w-1 o-cursor-pointer o-transition-colors ${
                demo
                  ? 'o-bg-brand-500 o-border-brand-500'
                  : 'o-bg-zinc-200 dark:o-bg-zinc-800 o-border-zinc-300 dark:o-border-zinc-700'
              }`}
            >
              <span
                className="o-block o-size-4 o-rounded-full o-bg-white o-transition-transform"
                style={{ transform: `translateX(${demo ? '22px' : '2px'})` }}
              />
            </button>
            <span className="o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
              {demo ? 'contenu affiche' : 'effet nu'}
            </span>
          </label>
        </div>

        {controls.length === 0 ? null : (
          <div className="o-grid o-gap-3 o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-pt-3 md:o-grid-cols-2">
            {controls.map((control) => (
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
                      onChange={(event) => set(control.name, Number(event.target.value))}
                      className="o-flex-1 o-accent-brand-500"
                    />
                    <span className="o-w-14 o-text-right o-font-mono o-text-xs o-tabular-nums">
                      {String(values[control.name] ?? control.value)}
                      {control.unit ?? ''}
                    </span>
                  </>
                ) : null}

                {control.kind === 'choice' ? (
                  <span className="o-flex o-flex-wrap o-gap-1">
                    {control.options.map((option) => (
                      <button
                        key={option}
                        type="button"
                        aria-pressed={values[control.name] === option}
                        onClick={() => set(control.name, option)}
                        className={`o-h-7 o-px-2 o-rounded-md o-border-w-1 o-text-xs o-font-mono o-cursor-pointer o-transition-colors ${
                          values[control.name] === option
                            ? 'o-border-brand-500 o-bg-brand-50 dark:o-bg-brand-950 o-text-brand-600 dark:o-text-brand-400'
                            : 'o-border-zinc-300 dark:o-border-zinc-700 o-text-zinc-500 dark:o-text-zinc-400'
                        }`}
                      >
                        {option}
                      </button>
                    ))}
                  </span>
                ) : null}

                {control.kind === 'switch' ? (
                  <button
                    type="button"
                    role="switch"
                    aria-checked={values[control.name] === true}
                    onClick={() => set(control.name, values[control.name] !== true)}
                    className={`o-h-6 o-w-11 o-rounded-full o-border-w-1 o-cursor-pointer o-transition-colors ${
                      values[control.name] === true
                        ? 'o-bg-brand-500 o-border-brand-500'
                        : 'o-bg-zinc-200 dark:o-bg-zinc-800 o-border-zinc-300 dark:o-border-zinc-700'
                    }`}
                  >
                    <span
                      className="o-block o-size-4 o-rounded-full o-bg-white o-transition-transform"
                      style={{
                        transform: `translateX(${values[control.name] === true ? '22px' : '2px'})`,
                      }}
                    />
                  </button>
                ) : null}
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
