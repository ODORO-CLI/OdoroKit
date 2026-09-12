/**
 * Curseur elastique : le rail s'etire quand on tire au-dela de sa butee, et
 * revient en depassant un peu.
 *
 * ## Le controle reste un `input[type=range]`
 *
 * Tout ce que l'on voit est decoratif ; ce que l'on manipule est le champ
 * natif, pose par-dessus et rendu transparent. Un curseur refait en `div`
 * perd tout d'un coup : les fleches, Origine et Fin, la roulette, le pas, le
 * role et la valeur annoncee, le formulaire qui le lit. Aucun de ces points
 * ne se reecrit en quelques lignes, et l'oubli ne se voit pas a l'oeil.
 *
 * ## L'elasticite est une transformation, pas une largeur
 *
 * Au-dela de la butee, le rail est etire par `scaleX` depuis le cote oppose :
 * la matiere resiste. Le facteur est ecrit directement sur l'element, sans
 * rendu React — un rendu par pixel de trajet serait le contraire de ce que
 * l'on cherche a faire sentir. Au lacher, la transformation est retiree : la
 * transition en courbe emphatique fait le retour, avec le leger depassement
 * qui donne le ressort.
 *
 * ## La resistance est bornee et non lineaire
 *
 * L'etirement suit une racine du depassement : les premiers pixels tirent
 * beaucoup, les suivants presque plus. Un rapport lineaire donnerait un rail
 * que l'on peut etirer indefiniment, ce qui ne ressemble a aucune matiere.
 *
 * ## Mouvement reduit
 *
 * Aucun etirement : le rail reste a sa taille, c'est-a-dire a l'etat ou il
 * finit de toute facon.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useRef,
  useState,
  type CSSProperties,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Proprietes propres au composant. */
export interface ElasticSliderOwnProps {
  /** Nom du curseur pour les lecteurs d'ecran. */
  label: string
  /** Borne basse. @defaultValue 0 */
  min?: number
  /** Borne haute. @defaultValue 100 */
  max?: number
  /** Pas de la valeur. @defaultValue 1 */
  step?: number
  /** Valeur, en mode controle. */
  value?: number
  /** Valeur au montage, en mode non controle. Par defaut, le milieu. */
  defaultValue?: number
  /** Appele a chaque changement de valeur. */
  onChange?: (value: number) => void
  /** Etirement maximal du rail, en part de sa largeur. @defaultValue 0.12 */
  stretch?: number
  /** Affiche la valeur a droite du rail. @defaultValue true */
  showValue?: boolean
  /** Element pose avant le rail, une icone par exemple. */
  leading?: ReactNode
  /** Neutralise le curseur. @defaultValue false */
  disabled?: boolean
}

/** Toutes les proprietes. */
export type ElasticSliderProps = Customisable<ElasticSliderOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-elastic-slider'

/** Pose le rail, la glissiere et le champ transparent, une fois par document. */
function ensureSliderRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-eslider]{display:flex;align-items:center;gap:0.75rem}',
    '[data-o-eslider][data-o-eslider-disabled]{opacity:0.5;pointer-events:none}',
    '[data-o-eslider-rail]{position:relative;flex:1 1 auto;display:flex;align-items:center;height:1.75rem}',
    '[data-o-eslider-track]{',
    'position:absolute;inset-inline:0;height:6px;border-radius:999px;overflow:hidden;',
    'background:color-mix(in oklab,currentColor 14%,transparent);',
    'transition:transform var(--o-duration-slow) var(--o-ease-emphasized),',
    'scale var(--o-duration-base) var(--o-ease-standard);',
    '}',
    // Saisi, le rail s'epaissit : la matiere se tend avant de s'etirer.
    '[data-o-eslider][data-o-eslider-grab] [data-o-eslider-track]{scale:1 1.6}',
    '[data-o-eslider-fill]{',
    'display:block;height:100%;width:calc(var(--o-eslider-ratio) * 100%);',
    'background:var(--o-eslider-accent);',
    '}',
    '[data-o-eslider-thumb]{',
    'position:absolute;top:50%;width:1.05rem;height:1.05rem;border-radius:999px;',
    'left:calc(var(--o-eslider-ratio) * (100% - 1.05rem));translate:0 -50%;',
    'background:var(--o-theme-surface);border:1px solid var(--o-eslider-accent);',
    'box-shadow:0 1px 3px color-mix(in oklab,currentColor 25%,transparent);',
    'transition:scale var(--o-duration-base) var(--o-ease-emphasized);',
    '}',
    '[data-o-eslider][data-o-eslider-grab] [data-o-eslider-thumb]{scale:1.25}',
    // Le vrai controle : transparent, par-dessus tout, et seul a recevoir le geste.
    '[data-o-eslider-rail] input{',
    'position:absolute;inset:0;width:100%;height:100%;margin:0;opacity:0;',
    'appearance:none;-webkit-appearance:none;background:transparent;cursor:pointer;',
    '}',
    '[data-o-eslider-rail]:has(input:focus-visible) [data-o-eslider-thumb]{',
    'outline:2px solid var(--o-eslider-accent);outline-offset:2px}',
    '[data-o-eslider-value]{',
    'flex:none;min-width:3ch;text-align:right;font-variant-numeric:tabular-nums;opacity:0.7}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-eslider-track],[data-o-eslider-thumb]{transition:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Curseur dont le rail s'etire au-dela des butees.
 *
 * @example
 * <ElasticSlider label="Volume" defaultValue={60} />
 *
 * @example
 * // Mode controle, avec une echelle a soi.
 * <ElasticSlider label="Duree" min={5} max={45} step={5} value={duree} onChange={setDuree} />
 */
export function ElasticSlider({
  label,
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue,
  onChange,
  stretch = 0.12,
  showValue = true,
  leading,
  disabled = false,
  ...rest
}: ElasticSliderProps): ReactElement {
  const { reduced } = useMotionState()
  const trackRef = useRef<HTMLSpanElement | null>(null)
  const railRef = useRef<HTMLSpanElement | null>(null)
  const [internal, setInternal] = useState(defaultValue ?? Math.round((min + max) / 2))
  const [grabbing, setGrabbing] = useState(false)
  ensureSliderRules()

  const current = Math.min(max, Math.max(min, value ?? internal))
  const ratio = max === min ? 0 : (current - min) / (max - min)

  const onPointerDown = (event: ReactPointerEvent<HTMLSpanElement>): void => {
    if (disabled || event.button !== 0) return
    setGrabbing(true)

    const pull = (pointerX: number): void => {
      const track = trackRef.current
      const rail = railRef.current
      if (track === null || rail === null || reduced) return
      const rect = rail.getBoundingClientRect()
      const over =
        pointerX < rect.left
          ? rect.left - pointerX
          : pointerX > rect.right
            ? pointerX - rect.right
            : 0
      if (over === 0) {
        track.style.transform = ''
        return
      }
      // Racine : les premiers pixels tirent beaucoup, les suivants presque plus.
      const amount = Math.min(1, Math.sqrt(over / Math.max(1, rect.width)))
      track.style.transformOrigin = pointerX < rect.left ? 'right center' : 'left center'
      track.style.transform = `scaleX(${String(1 + amount * stretch)})`
    }

    const onMove = (moveEvent: PointerEvent): void => {
      pull(moveEvent.clientX)
    }

    const finish = (): void => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', finish)
      window.removeEventListener('pointercancel', finish)
      // Retirer la transformation suffit : la transition fait le retour.
      if (trackRef.current !== null) trackRef.current.style.transform = ''
      setGrabbing(false)
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerup', finish)
    window.addEventListener('pointercancel', finish)
  }

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      data-o-eslider=""
      data-o-eslider-grab={grabbing ? '' : undefined}
      data-o-eslider-disabled={disabled ? '' : undefined}
      className={className}
      style={
        {
          '--o-eslider-accent': 'var(--o-palette-brand-500)',
          '--o-eslider-ratio': ratio,
          ...style,
        } as CSSProperties
      }
    >
      {leading !== undefined && <span aria-hidden="true">{leading}</span>}
      <span ref={railRef} data-o-eslider-rail="" onPointerDown={onPointerDown}>
        <span ref={trackRef} data-o-eslider-track="" aria-hidden="true">
          <span data-o-eslider-fill="" />
        </span>
        <span data-o-eslider-thumb="" aria-hidden="true" />
        <input
          type="range"
          aria-label={label}
          min={min}
          max={max}
          step={step}
          value={current}
          disabled={disabled}
          onChange={(event) => {
            const next = Number(event.target.value)
            if (value === undefined) setInternal(next)
            onChange?.(next)
          }}
        />
      </span>
      {showValue && <span data-o-eslider-value="">{current}</span>}
    </div>
  )
}
