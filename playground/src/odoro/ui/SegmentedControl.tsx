/**
 * Controle segmente a glissiere : un choix parmi quelques options, dans un
 * rail creux ou une glissiere en relief vient se poser sous l'option choisie.
 *
 * ## Ce sont des boutons radio, pas des onglets
 *
 * Les onglets a pastille changent de vue : ce qu'ils montrent est ailleurs
 * dans la page, et leur semantique est `tablist`. Un controle segmente
 * choisit une valeur — un tri, une unite, une periode — et ce qu'il montre,
 * c'est son propre etat. C'est un `radiogroup`, et il en suit les regles :
 * les fleches deplacent la selection elle-meme, pas seulement le focus, et
 * une seule option est dans l'ordre de tabulation.
 *
 * ## La glissiere est un relief sur un creux
 *
 * Les onglets posent une pastille pleine, de la teinte de marque, sur une
 * barre plate. Ici le rail est creuse — un voile de l'encre courante — et la
 * glissiere est une surface de theme, posee dessus avec une ombre courte :
 * une piece qui coulisse dans une rainure. L'option choisie n'a pas besoin
 * de couleur pour se distinguer, elle est en relief.
 *
 * ## Le trajet depasse un peu sa cible
 *
 * La courbe emphatique du systeme porte un leger depassement : la glissiere
 * arrive, deborde d'un pixel ou deux, et se cale. C'est ce qui la fait
 * peser — une transition lineaire donnerait un rectangle qui se deplace,
 * pas une piece qui coulisse.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Une option du controle. */
export interface SegmentOption {
  /** Valeur rendue par `onChange`. */
  readonly value: string
  /** Libelle affiche. */
  readonly label: string
  /** Icone placee avant le libelle. */
  readonly icon?: ReactNode
  /** Option presente mais non choisissable. */
  readonly disabled?: boolean
}

/** Proprietes propres au composant. */
export interface SegmentedControlOwnProps {
  /** Les options, dans l'ordre d'affichage. */
  options: readonly SegmentOption[]
  /** Nom du groupe pour les lecteurs d'ecran. */
  label: string
  /** Option choisie, en mode controle. */
  value?: string
  /** Option choisie au montage, en mode non controle. Par defaut, la premiere. */
  defaultValue?: string
  /** Appele quand l'utilisateur choisit une option. */
  onChange?: (value: string) => void
  /** Les options se partagent la largeur a parts egales. @defaultValue false */
  full?: boolean
  /** Neutralise le groupe entier. @defaultValue false */
  disabled?: boolean
}

/** Toutes les proprietes. */
export type SegmentedControlProps = Customisable<SegmentedControlOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-segmented-control'

/** Pose le rail, la glissiere et les options, une fois par document. */
function ensureSegmentRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-seg]{',
    'position:relative;display:inline-flex;align-items:stretch;',
    'padding:3px;border-radius:0.75rem;',
    'background:color-mix(in oklab,currentColor 8%,transparent);',
    'box-shadow:inset 0 1px 2px color-mix(in oklab,currentColor 8%,transparent);',
    '}',
    '[data-o-seg][data-o-seg-full]{display:flex}',
    '[data-o-seg][data-o-seg-full] [role="radio"]{flex:1 1 0}',
    '[data-o-seg][data-o-seg-disabled]{opacity:0.5;pointer-events:none}',
    '[data-o-seg] [role="radio"]{',
    'position:relative;z-index:1;display:inline-flex;align-items:center;justify-content:center;gap:0.4em;',
    'border:0;background:none;cursor:pointer;border-radius:calc(0.75rem - 3px);',
    'font:inherit;color:inherit;white-space:nowrap;padding:0.4rem 0.9rem;opacity:0.65;',
    'transition:opacity var(--o-duration-slow) linear;',
    '}',
    '[data-o-seg] [role="radio"]:is(:hover,:focus-visible){opacity:0.85}',
    '[data-o-seg] [role="radio"][aria-checked="true"]{opacity:1}',
    '[data-o-seg] [role="radio"]:focus-visible{outline:2px solid currentColor;outline-offset:-2px}',
    '[data-o-seg] [role="radio"]:disabled{opacity:0.3;cursor:not-allowed}',
    // La glissiere : une surface en relief, posee dans le creux.
    '[data-o-seg-thumb]{',
    'position:absolute;inset-block:3px;left:0;z-index:0;width:0;',
    'border-radius:calc(0.75rem - 3px);background:var(--o-theme-surface);',
    'box-shadow:0 1px 2px color-mix(in oklab,currentColor 20%,transparent),',
    '0 0 0 1px color-mix(in oklab,currentColor 6%,transparent);',
    'transition:transform var(--o-duration-slow) var(--o-ease-emphasized),',
    'width var(--o-duration-slow) var(--o-ease-emphasized),scale 120ms linear;',
    '}',
    // La pression ecrase un peu la piece ; `scale` ne se dispute pas avec la
    // translation qui la place.
    '[data-o-seg]:has([role="radio"]:active) [data-o-seg-thumb]{scale:0.96}',
    '@media (prefers-reduced-motion:reduce){[data-o-seg-thumb]{transition:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Choix parmi quelques options, avec une glissiere.
 *
 * @example
 * <SegmentedControl
 *   label="Periode"
 *   options={[
 *     { value: 'jour', label: 'Jour' },
 *     { value: 'semaine', label: 'Semaine' },
 *     { value: 'mois', label: 'Mois' },
 *   ]}
 *   defaultValue="semaine"
 * />
 *
 * @example
 * // Mode controle, pleine largeur, une option fermee.
 * <SegmentedControl
 *   label="Livraison"
 *   options={[
 *     { value: 'standard', label: 'Standard' },
 *     { value: 'express', label: 'Express' },
 *     { value: 'retrait', label: 'Retrait', disabled: true },
 *   ]}
 *   value={mode}
 *   onChange={setMode}
 *   full
 * />
 */
export function SegmentedControl({
  options,
  label,
  value,
  defaultValue,
  onChange,
  full = false,
  disabled = false,
  ...rest
}: SegmentedControlProps): ReactElement {
  const hostRef = useRef<HTMLDivElement | null>(null)
  const thumbRef = useRef<HTMLSpanElement | null>(null)
  const [internal, setInternal] = useState<string | undefined>(defaultValue)
  ensureSegmentRules()

  const enabled = options.filter((option) => option.disabled !== true)
  const current = value ?? internal ?? enabled[0]?.value
  const currentIndex = options.findIndex((option) => option.value === current)

  const choose = (next: string): void => {
    if (next === current) return
    if (value === undefined) setInternal(next)
    onChange?.(next)
  }

  const radios = (): HTMLButtonElement[] =>
    Array.from(hostRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]') ?? [])

  /** Pose la glissiere sous l'option choisie. Sans option, elle se replie. */
  const place = (): void => {
    const thumb = thumbRef.current
    const target = radios()[currentIndex]
    if (thumb === null) return
    if (target === undefined) {
      thumb.style.width = '0px'
      return
    }
    thumb.style.width = `${String(target.offsetWidth)}px`
    thumb.style.transform = `translateX(${String(target.offsetLeft)}px)`
  }

  // Avant la peinture, pour que la glissiere soit deja sous son option au
  // premier affichage ; puis a chaque choix, et si le rail change de taille.
  useLayoutEffect(() => {
    place()
    const host = hostRef.current
    if (host === null || typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(place)
    observer.observe(host)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, options, full])

  /** Les fleches deplacent le choix lui-meme, en sautant les options fermees. */
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (enabled.length === 0) return
    const at = enabled.findIndex((option) => option.value === current)
    const last = enabled.length - 1
    const moves: Readonly<Record<string, number | undefined>> = {
      ArrowRight: at >= last ? 0 : at + 1,
      ArrowDown: at >= last ? 0 : at + 1,
      ArrowLeft: at <= 0 ? last : at - 1,
      ArrowUp: at <= 0 ? last : at - 1,
      Home: 0,
      End: last,
    }
    const target = moves[event.key]
    if (target === undefined) return
    event.preventDefault()
    const next = enabled[target]
    if (next === undefined) return
    choose(next.value)
    radios()[options.indexOf(next)]?.focus()
  }

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={hostRef}
      role="radiogroup"
      aria-label={label}
      aria-disabled={disabled ? 'true' : undefined}
      data-o-seg=""
      data-o-seg-full={full ? '' : undefined}
      data-o-seg-disabled={disabled ? '' : undefined}
      className={className}
      style={style as CSSProperties}
      onKeyDown={(event) => {
        onKeyDown(event)
        rest.onKeyDown?.(event)
      }}
    >
      <span ref={thumbRef} aria-hidden="true" data-o-seg-thumb="" />
      {options.map((option, index) => {
        const checked = index === currentIndex
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={checked}
            tabIndex={checked ? 0 : -1}
            disabled={disabled || option.disabled === true}
            onClick={() => choose(option.value)}
          >
            {option.icon !== undefined && <span aria-hidden="true">{option.icon}</span>}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
