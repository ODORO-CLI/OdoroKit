/**
 * Liste que l'on reordonne a la souris comme au clavier, sans dependance.
 *
 * ## Le clavier n'est pas un rattrapage
 *
 * Un reordonnancement au glisser seul ferme la liste a qui n'a pas de souris,
 * et il n'existe aucune facon de simuler un glisser au clavier. La poignee
 * porte donc un second mode, explicite : Espace saisit, les fleches deplacent,
 * Espace depose, Echap remet en place. Chaque etape est ecrite dans une zone
 * `role="status"` — sans elle, l'ordre change sans que rien ne le dise.
 *
 * ## Le glisser ne reordonne rien avant le lacher
 *
 * Pendant le trajet, l'ordre reel ne bouge pas : seules des translations sont
 * ecrites sur les elements. La ligne saisie suit le pointeur, les lignes
 * franchies reculent d'un cran — d'un cran qui vaut la hauteur de la ligne
 * saisie, quelle que soit la leur. Reordonner a chaque franchissement
 * couterait un rendu React par pixel parcouru, et deplacerait le noeud sous le
 * pointeur au milieu de son propre geste.
 *
 * ## Les hauteurs sont mesurees a la saisie
 *
 * Une liste dont les lignes ont des hauteurs differentes reste juste : la
 * cible se decide en comparant le trajet a la somme des hauteurs franchies,
 * pas a un multiple d'une hauteur supposee.
 *
 * ## Le deplacement au clavier glisse quand meme
 *
 * L'ordre change vraiment, donc les noeuds bougent : une transition CSS ne
 * verrait rien. Les positions d'avant sont relevees, et chaque ligne est
 * animee depuis son ecart — la technique FLIP, en quelques lignes. Sous
 * mouvement reduit, rien n'est anime : l'ordre est simplement le nouveau.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
} from 'react'

/** Une ligne de la liste. */
export interface SortableItem {
  /** Identifiant, unique dans la liste. */
  readonly id: string
  /** Libelle affiche, et lu dans les annonces. */
  readonly label: string
  /** Precision affichee en sourdine. */
  readonly hint?: string
}

/** Proprietes propres au composant. */
export interface SortableListOwnProps {
  /** Les lignes, indexees par identifiant. */
  items: readonly SortableItem[]
  /** Nom de la liste pour les lecteurs d'ecran. */
  label: string
  /** Ordre des identifiants, en mode controle. */
  value?: readonly string[]
  /** Ordre au montage, en mode non controle. Par defaut, celui d'`items`. */
  defaultValue?: readonly string[]
  /** Appele avec le nouvel ordre, a chaque deplacement termine. */
  onChange?: (order: readonly string[]) => void
  /** Neutralise la liste. @defaultValue false */
  disabled?: boolean
}

/** Toutes les proprietes. */
export type SortableListProps = Customisable<SortableListOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-sortable-list'

/** Pose les lignes, la poignee et l'etat souleve, une fois par document. */
function ensureSortRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-sort] ol{display:flex;flex-direction:column;gap:6px;margin:0;padding:0;list-style:none}',
    '[data-o-sort][data-o-sort-disabled]{opacity:0.5;pointer-events:none}',
    '[data-o-sort-row]{',
    'display:flex;align-items:center;gap:0.6rem;padding:0.55rem 0.8rem;',
    'border-radius:0.7rem;border:1px solid var(--o-theme-line);background:var(--o-theme-surface);',
    'transition:transform var(--o-duration-base) var(--o-ease-standard),',
    'box-shadow var(--o-duration-base) linear,border-color var(--o-duration-base) linear;',
    '}',
    // La ligne saisie est soulevee : elle suit le pointeur, donc sans transition.
    '[data-o-sort-row][data-o-sort-lift]{',
    'transition:box-shadow var(--o-duration-base) linear;position:relative;z-index:1;',
    'border-color:var(--o-sort-accent);',
    'box-shadow:0 8px 20px color-mix(in oklab,currentColor 18%,transparent);',
    '}',
    '[data-o-sort-handle]{',
    'display:inline-grid;place-items:center;flex:none;width:1.6em;height:1.6em;',
    'border:0;border-radius:0.4rem;background:transparent;color:inherit;',
    'cursor:grab;opacity:0.5;touch-action:none;',
    'transition:opacity var(--o-duration-fast) linear,background-color var(--o-duration-fast) linear;',
    '}',
    '[data-o-sort-handle]:is(:hover,:focus-visible){opacity:1;',
    'background:color-mix(in oklab,currentColor 10%,transparent)}',
    '[data-o-sort-handle]:focus-visible{outline:2px solid var(--o-sort-accent);outline-offset:1px}',
    '[data-o-sort-handle][aria-pressed="true"]{opacity:1;cursor:grabbing;',
    'background:color-mix(in oklab,var(--o-sort-accent) 20%,transparent)}',
    '[data-o-sort-label]{flex:1 1 auto;min-width:0}',
    '[data-o-sort-hint]{opacity:0.55;font-size:0.875em;white-space:nowrap}',
    '[data-o-sort-live]{margin:0.6rem 0 0;font-size:0.8125em;opacity:0.7;min-height:1.4em}',
    '@media (prefers-reduced-motion:reduce){[data-o-sort-row]{transition:none}}',
  ].join('')
  document.head.append(style)
}

/** Deplace un element d'une position a une autre, sans muter la source. */
function move(order: readonly string[], from: number, to: number): readonly string[] {
  const next = [...order]
  const [taken] = next.splice(from, 1)
  if (taken === undefined) return order
  next.splice(to, 0, taken)
  return next
}

/**
 * Liste reordonnable, a la souris et au clavier.
 *
 * @example
 * <SortableList
 *   label="Ordre des etapes"
 *   items={[
 *     { id: 'brief', label: 'Brief' },
 *     { id: 'maquette', label: 'Maquette' },
 *     { id: 'recette', label: 'Recette' },
 *   ]}
 * />
 *
 * @example
 * // Mode controle : l'ordre vit dans la page.
 * <SortableList label="Colonnes" items={colonnes} value={ordre} onChange={setOrdre} />
 */
export function SortableList({
  items,
  label,
  value,
  defaultValue,
  onChange,
  disabled = false,
  ...rest
}: SortableListProps): ReactElement {
  const { reduced } = useMotionState()
  const listRef = useRef<HTMLOListElement | null>(null)
  const [internal, setInternal] = useState<readonly string[]>(
    () => defaultValue ?? items.map((item) => item.id),
  )
  const [grabbed, setGrabbed] = useState<string | null>(null)
  const [dragging, setDragging] = useState<string | null>(null)
  const [message, setMessage] = useState('')
  ensureSortRules()

  const order = value ?? internal
  // Une ligne absente d'`items` a disparu de la page : on ne la rend pas, et
  // une ligne nouvelle est posee a la fin plutot que perdue.
  const known = new Map(items.map((item) => [item.id, item]))
  const rows = [
    ...order.filter((id) => known.has(id)),
    ...items.filter((item) => !order.includes(item.id)).map((item) => item.id),
  ]

  /**
   * L'ordre des lignes, en une chaine.
   *
   * C'est ce que l'animation compare : deux rendus dont les lignes sont dans le
   * meme ordre ne doivent rien rejouer, meme si le tableau est neuf.
   */
  const ordre = rows.join(',')

  /** Positions d'avant, pour l'animation FLIP ; nulles pendant un glisser. */
  const before = useRef<Map<string, number> | null>(null)
  /**
   * Poignee a refocaliser apres un deplacement.
   *
   * Deplacer un noeud dans le document lui retire le focus : sans ce relais,
   * la premiere fleche ferait perdre la poignee que l'on tient.
   */
  const keepFocus = useRef<string | null>(null)

  const rowElements = (): HTMLLIElement[] =>
    Array.from(listRef.current?.querySelectorAll<HTMLLIElement>('[data-o-sort-row]') ?? [])

  const commit = (next: readonly string[]): void => {
    if (value === undefined) setInternal(next)
    onChange?.(next)
  }

  const say = (id: string, at: number, verb: string): void => {
    const item = known.get(id)
    setMessage(
      `${item?.label ?? id} ${verb} en position ${String(at + 1)} sur ${String(rows.length)}.`,
    )
  }

  // FLIP : les positions relevees avant le rendu servent de point de depart.
  // C'est aussi ici que la poignee deplacee retrouve son focus.
  useLayoutEffect(() => {
    const back = keepFocus.current
    keepFocus.current = null
    if (back !== null) {
      listRef.current
        ?.querySelector<HTMLButtonElement>(
          `[data-o-sort-id="${back}"] [data-o-sort-handle]`,
        )
        ?.focus()
    }

    const previous = before.current
    before.current = null
    if (previous === null || reduced) return

    for (const element of rowElements()) {
      const id = element.dataset['oSortId']
      const from = id === undefined ? undefined : previous.get(id)
      if (from === undefined || typeof element.animate !== 'function') continue
      const delta = from - element.getBoundingClientRect().top
      if (Math.abs(delta) < 1) continue
      element.animate(
        [{ transform: `translateY(${String(delta)}px)` }, { transform: 'none' }],
        { duration: 220, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
      )
    }
    // Nommee plutot qu'ecrite dans le tableau : une expression y est opaque
    // au verificateur, qui ne peut alors plus dire si la liste est juste. La
    // comparaison porte bien sur le contenu des lignes, pas sur l'identite du
    // tableau — c'est ce qu'on veut, et c'est maintenant verifiable.
  }, [ordre, reduced])

  /** Releve les positions courantes, pour que le prochain rendu les rejoue. */
  const snapshot = (): void => {
    before.current = new Map(
      rowElements().map((element) => [
        element.dataset['oSortId'] ?? '',
        element.getBoundingClientRect().top,
      ]),
    )
  }

  // --- Glisser -------------------------------------------------------------

  const onPointerDown = (id: string, event: ReactPointerEvent<HTMLButtonElement>): void => {
    if (disabled || event.button !== 0) return
    const elements = rowElements()
    const from = rows.indexOf(id)
    const held = elements[from]
    if (held === undefined || elements.length < 2) return

    event.preventDefault()
    event.currentTarget.setPointerCapture(event.pointerId)
    event.currentTarget.focus()
    setGrabbed(null)
    setDragging(id)

    // Le pas d'une ligne, ecart compris : c'est de lui que reculent les lignes
    // franchies, et il vaut celui de la ligne saisie, pas la leur.
    const rects = elements.map((element) => element.getBoundingClientRect())
    const first = rects[0]
    const second = rects[1]
    const gap =
      first === undefined || second === undefined ? 0 : second.top - first.top - first.height
    const steps = rects.map((rect) => rect.height + gap)
    const heldStep = steps[from] ?? 0
    const startY = event.clientY
    let target = from

    const place = (dy: number): void => {
      // Cible : la derniere ligne dont on a franchi la moitie.
      let next = from
      let travelled = 0
      if (dy > 0) {
        for (let index = from + 1; index < steps.length; index += 1) {
          const step = steps[index] ?? 0
          if (dy <= travelled + step / 2) break
          travelled += step
          next = index
        }
      } else {
        for (let index = from - 1; index >= 0; index -= 1) {
          const step = steps[index] ?? 0
          if (-dy <= travelled + step / 2) break
          travelled += step
          next = index
        }
      }
      target = next

      for (const [index, element] of elements.entries()) {
        if (index === from) {
          element.style.transform = `translateY(${String(dy)}px)`
        } else if (next > from && index > from && index <= next) {
          element.style.transform = `translateY(${String(-heldStep)}px)`
        } else if (next < from && index >= next && index < from) {
          element.style.transform = `translateY(${String(heldStep)}px)`
        } else {
          element.style.transform = ''
        }
      }
    }

    const onMove = (moveEvent: PointerEvent): void => {
      place(moveEvent.clientY - startY)
    }

    const finish = (): void => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', finish)
      window.removeEventListener('pointercancel', finish)
      for (const element of elements) element.style.transform = ''
      setDragging(null)
      if (target === from) return
      // Les lignes sont deja a leur place a l'ecran : rejouer le FLIP les
      // ferait revenir en arriere pour repartir.
      before.current = null
      commit(move(rows, from, target))
      say(id, target, 'deplacee')
    }

    window.addEventListener('pointermove', onMove, { passive: true })
    window.addEventListener('pointerup', finish)
    window.addEventListener('pointercancel', finish)
  }

  // --- Clavier -------------------------------------------------------------

  const restore = useRef<readonly string[] | null>(null)

  const onHandleKeyDown = (id: string, event: KeyboardEvent<HTMLButtonElement>): void => {
    const at = rows.indexOf(id)
    if (at < 0) return

    if (event.key === ' ' || event.key === 'Enter') {
      event.preventDefault()
      if (grabbed === id) {
        setGrabbed(null)
        restore.current = null
        say(id, at, 'deposee')
      } else {
        setGrabbed(id)
        restore.current = rows
        setMessage(
          `${known.get(id)?.label ?? id} saisie, position ${String(at + 1)} sur ${String(rows.length)}. Les fleches deplacent, Espace depose.`,
        )
      }
      return
    }

    if (event.key === 'Escape' && grabbed === id) {
      event.preventDefault()
      const initial = restore.current
      setGrabbed(null)
      restore.current = null
      if (initial !== null) {
        snapshot()
        keepFocus.current = id
        commit(initial)
      }
      setMessage('Deplacement annule.')
      return
    }

    if (grabbed !== id) return
    const to = event.key === 'ArrowUp' ? at - 1 : event.key === 'ArrowDown' ? at + 1 : null
    if (to === null) return
    event.preventDefault()
    if (to < 0 || to >= rows.length) return
    snapshot()
    keepFocus.current = id
    commit(move(rows, at, to))
    say(id, to, 'deplacee')
  }

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      role="group"
      aria-label={label}
      data-o-sort=""
      data-o-sort-disabled={disabled ? '' : undefined}
      className={className}
      style={{ '--o-sort-accent': 'var(--o-palette-brand-500)', ...style } as CSSProperties}
    >
      <ol ref={listRef}>
        {rows.map((id) => {
          const item = known.get(id)
          if (item === undefined) return null
          const held = grabbed === id || dragging === id
          return (
            <li
              key={id}
              data-o-sort-row=""
              data-o-sort-id={id}
              data-o-sort-lift={held ? '' : undefined}
            >
              <button
                type="button"
                data-o-sort-handle=""
                aria-label={`Deplacer ${item.label}`}
                aria-pressed={grabbed === id}
                disabled={disabled}
                onPointerDown={(event) => {
                  onPointerDown(id, event)
                }}
                onKeyDown={(event) => {
                  onHandleKeyDown(id, event)
                }}
                onBlur={() => {
                  // Un deplacement retire le focus le temps d'un rendu : ce
                  // n'est pas un abandon, et la poignee revient juste apres.
                  if (keepFocus.current === null && grabbed === id) setGrabbed(null)
                }}
              >
                <svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true" fill="currentColor">
                  <circle cx="6" cy="4" r="1.3" />
                  <circle cx="10" cy="4" r="1.3" />
                  <circle cx="6" cy="8" r="1.3" />
                  <circle cx="10" cy="8" r="1.3" />
                  <circle cx="6" cy="12" r="1.3" />
                  <circle cx="10" cy="12" r="1.3" />
                </svg>
              </button>
              <span data-o-sort-label="">{item.label}</span>
              {item.hint !== undefined && <span data-o-sort-hint="">{item.hint}</span>}
            </li>
          )
        })}
      </ol>
      <p role="status" data-o-sort-live="">
        {message}
      </p>
    </div>
  )
}
