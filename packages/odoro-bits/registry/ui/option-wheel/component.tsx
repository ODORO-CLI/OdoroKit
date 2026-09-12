/**
 * Roue d'options : un tambour que l'on fait tourner et qui se cale sur une
 * valeur, comme la molette d'un selecteur de date.
 *
 * ## C'est un vrai defilement, pas une simulation
 *
 * La roue est une zone qui defile avec `scroll-snap-type` : la molette, le
 * doigt, la barre laterale, l'inertie du systeme et le calage sur la ligne
 * centrale sont ceux du navigateur. Reecrire cela au pointeur donnerait une
 * inertie approximative, differente sur chaque appareil, et un tambour qui
 * ignore la molette.
 *
 * ## La courbe est peinte, la valeur est posee a l'arret
 *
 * A chaque image utile, chaque ligne recoit une rotation proportionnelle a sa
 * distance au centre — ecriture directe, sans rendu React. La valeur, elle,
 * n'est publiee que lorsque le defilement s'arrete : la publier en cours de
 * route ferait clignoter tout ce qui l'ecoute pendant le geste.
 *
 * ## Les lignes ont toutes la meme hauteur
 *
 * C'est ce qui rend la position lisible : la ligne au centre est le quotient
 * du defilement par la hauteur d'une ligne. Un tambour a lignes inegales
 * demanderait une mesure par ligne a chaque image, pour un objet dont l'interet
 * est justement la regularite.
 *
 * ## Mouvement reduit
 *
 * Pas de courbe et pas de defilement anime : la roue devient une liste plate
 * qui saute a l'option choisie — son etat final.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
} from 'react'

/** Une option de la roue. */
export interface WheelOption {
  /** Valeur rendue par `onChange`. */
  readonly value: string
  /** Libelle affiche. */
  readonly label: string
}

/** Proprietes propres au composant. */
export interface OptionWheelOwnProps {
  /** Les options, dans l'ordre du tambour. */
  options: readonly WheelOption[]
  /** Nom de la roue pour les lecteurs d'ecran. */
  label: string
  /** Option choisie, en mode controle. */
  value?: string
  /** Option choisie au montage, en mode non controle. */
  defaultValue?: string
  /** Appele quand la roue se cale sur une option. */
  onChange?: (value: string) => void
  /** Nombre de lignes visibles. Un nombre impair centre la ligne choisie. @defaultValue 5 */
  visible?: number
  /** Inclinaison ajoutee par ligne d'ecart au centre. @defaultValue 18 */
  curve?: number
}

/** Toutes les proprietes. */
export type OptionWheelProps = Customisable<OptionWheelOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-option-wheel'

/** Pose le tambour, ses lignes et la fenetre centrale, une fois par document. */
function ensureWheelRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-wheel]{position:relative;isolation:isolate}',
    '[data-o-wheel-scroll]{',
    // La fenetre visible d'une zone qui defile est sa boite de remplissage :
    // sans `border-box`, les marges internes agrandiraient le tambour.
    'position:relative;box-sizing:border-box;overflow-y:auto;overscroll-behavior:contain;scrollbar-width:none;',
    'scroll-snap-type:y mandatory;perspective:600px;transform-style:preserve-3d;',
    'height:calc(var(--o-wheel-visible) * var(--o-wheel-row));',
    'padding-block:calc((var(--o-wheel-visible) - 1) / 2 * var(--o-wheel-row));',
    // Les extremites s'effacent : le tambour n'a pas de bord franc.
    '-webkit-mask-image:linear-gradient(to bottom,transparent,currentColor 35%,currentColor 65%,transparent);',
    'mask-image:linear-gradient(to bottom,transparent,currentColor 35%,currentColor 65%,transparent);',
    '}',
    '[data-o-wheel-scroll]::-webkit-scrollbar{display:none}',
    '[data-o-wheel-scroll]:focus-visible{outline:2px solid var(--o-wheel-accent);outline-offset:2px;border-radius:0.6rem}',
    '[data-o-wheel-scroll] [role="option"]{',
    'display:flex;align-items:center;justify-content:center;',
    'height:var(--o-wheel-row);scroll-snap-align:center;cursor:pointer;',
    'white-space:nowrap;backface-visibility:hidden;',
    'transition:color var(--o-duration-fast) linear;',
    '}',
    '[data-o-wheel-scroll] [role="option"][aria-selected="true"]{color:var(--o-wheel-accent);font-weight:600}',
    // La fenetre : deux filets qui marquent la ligne retenue.
    '[data-o-wheel-window]{',
    'position:absolute;left:0;right:0;top:50%;height:var(--o-wheel-row);',
    'translate:0 -50%;pointer-events:none;z-index:1;',
    'border-top:1px solid var(--o-theme-line);border-bottom:1px solid var(--o-theme-line);',
    'background:color-mix(in oklab,var(--o-wheel-accent) 7%,transparent);',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Roue d'options a defilement et calage.
 *
 * @example
 * <OptionWheel
 *   label="Duree"
 *   options={[
 *     { value: '15', label: '15 minutes' },
 *     { value: '30', label: '30 minutes' },
 *   ]}
 *   defaultValue="30"
 * />
 *
 * @example
 * // Mode controle, sept lignes visibles et une courbe plus marquee.
 * <OptionWheel label="Ville" options={villes} value={ville} onChange={setVille} visible={7} curve={26} />
 */
export function OptionWheel({
  options,
  label,
  value,
  defaultValue,
  onChange,
  visible = 5,
  curve = 18,
  ...rest
}: OptionWheelProps): ReactElement {
  const { reduced } = useMotionState()
  const scrollRef = useRef<HTMLDivElement | null>(null)
  const rowHeight = useRef(0)
  const frame = useRef(0)
  const settle = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  const mounted = useRef(false)
  const baseId = useId()
  const [internal, setInternal] = useState<string | undefined>(defaultValue)
  ensureWheelRules()

  const current = value ?? internal ?? options[0]?.value
  const currentIndex = Math.max(
    0,
    options.findIndex((option) => option.value === current),
  )

  const choose = (next: string): void => {
    if (next === current) return
    if (value === undefined) setInternal(next)
    onChange?.(next)
  }

  /** Incline chaque ligne selon sa distance a la ligne centrale. */
  const paint = (): void => {
    frame.current = 0
    const host = scrollRef.current
    const row = rowHeight.current
    if (host === null || row === 0) return
    const centre = host.scrollTop / row
    const half = Math.max(1, (visible - 1) / 2)

    for (const [index, element] of Array.from(
      host.querySelectorAll<HTMLElement>('[role="option"]'),
    ).entries()) {
      const away = index - centre
      const far = Math.min(1, Math.abs(away) / (half + 0.5))
      element.style.opacity = String(1 - far * 0.75)
      element.style.transform = reduced
        ? ''
        : `rotateX(${String(-away * curve)}deg) translateZ(${String(-Math.abs(away) * 6)}px)`
    }
  }

  const onScroll = (): void => {
    if (frame.current === 0 && typeof requestAnimationFrame === 'function') {
      frame.current = requestAnimationFrame(paint)
    }
    // Le calage est publie a l'arret : `scrollend` n'est pas partout, un
    // silence de quelques images l'est.
    clearTimeout(settle.current)
    settle.current = setTimeout(() => {
      const host = scrollRef.current
      const row = rowHeight.current
      if (host === null || row === 0) return
      const index = Math.round(host.scrollTop / row)
      const option = options[Math.min(options.length - 1, Math.max(0, index))]
      if (option !== undefined) choose(option.value)
    }, 140)
  }

  // Mesure, calage sur l'option courante, premiere peinture. Le premier
  // passage saute, les suivants glissent : arriver en glissant sur une valeur
  // que l'on n'a pas encore vue n'a aucun sens.
  useLayoutEffect(() => {
    const host = scrollRef.current
    if (host === null) return
    const first = host.querySelector<HTMLElement>('[role="option"]')
    rowHeight.current = first?.offsetHeight ?? 0
    const target = rowHeight.current * currentIndex
    if (Math.abs(host.scrollTop - target) > 1) {
      host.scrollTo({
        top: target,
        behavior: mounted.current && !reduced ? 'smooth' : 'auto',
      })
    }
    mounted.current = true
    paint()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentIndex, reduced, curve, visible, options.length])

  useLayoutEffect(
    () => () => {
      clearTimeout(settle.current)
      if (frame.current !== 0) cancelAnimationFrame(frame.current)
    },
    [],
  )

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const last = options.length - 1
    const moves: Readonly<Record<string, number | undefined>> = {
      ArrowDown: Math.min(last, currentIndex + 1),
      ArrowUp: Math.max(0, currentIndex - 1),
      Home: 0,
      End: last,
    }
    const target = moves[event.key]
    if (target === undefined) return
    event.preventDefault()
    const option = options[target]
    if (option !== undefined) choose(option.value)
  }

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      data-o-wheel=""
      className={className}
      style={
        {
          '--o-wheel-accent': 'var(--o-palette-brand-500)',
          '--o-wheel-row': '2.5rem',
          '--o-wheel-visible': visible,
          ...style,
        } as CSSProperties
      }
    >
      <div data-o-wheel-window="" aria-hidden="true" />
      <div
        ref={scrollRef}
        data-o-wheel-scroll=""
        role="listbox"
        aria-label={label}
        aria-activedescendant={`${baseId}-${String(currentIndex)}`}
        tabIndex={0}
        onScroll={onScroll}
        onKeyDown={onKeyDown}
      >
        {options.map((option, index) => (
          <div
            key={option.value}
            id={`${baseId}-${String(index)}`}
            role="option"
            aria-selected={index === currentIndex}
            onClick={() => {
              choose(option.value)
            }}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  )
}
