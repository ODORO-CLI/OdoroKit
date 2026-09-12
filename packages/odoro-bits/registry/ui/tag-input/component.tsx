/**
 * Champ a etiquettes : Entree ou virgule pose une etiquette, Retour sur un
 * champ vide arme puis retire la derniere.
 *
 * ## Retour efface en deux temps
 *
 * Effacer une etiquette d'un seul Retour, c'est perdre un mot que l'on
 * n'avait pas l'intention de perdre — le geste est le meme que celui qui
 * corrige une faute de frappe. Le premier Retour sur un champ vide marque
 * donc la derniere etiquette ; le second la retire. Ecrire une lettre, ou
 * quitter le champ, desarme.
 *
 * ## Les etiquettes sont dans l'ordre de tabulation par leur croix
 *
 * Chaque etiquette porte un bouton de retrait, nomme d'apres elle. C'est lui
 * qui recoit le focus, par Tab ou par les fleches depuis le champ, et Retour
 * ou Suppr le declenchent. L'etiquette elle-meme n'est pas interactive : il
 * n'y a rien a lui faire d'autre que la retirer.
 *
 * ## Le brouillon est un etat local, les etiquettes un etat controlable
 *
 * Ce que l'on tape n'interesse personne avant Entree : le brouillon reste
 * dans le composant. Les etiquettes, elles, sont la valeur — controlable par
 * `value` et `onChange`, ou laissee au composant avec `defaultValue`.
 *
 * ## L'entree d'une etiquette est un rebond
 *
 * Une animation d'images cles au montage, sur `transform` et `opacity` :
 * l'etiquette nait un peu petite et depasse legerement sa taille avant de
 * s'y poser. Sous mouvement reduit elle apparait en place.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import {
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
} from 'react'

/** Proprietes propres au composant. */
export interface TagInputOwnProps {
  /** Nom du champ pour les lecteurs d'ecran. */
  label: string
  /** Les etiquettes, en mode controle. */
  value?: readonly string[]
  /** Etiquettes au montage, en mode non controle. @defaultValue [] */
  defaultValue?: readonly string[]
  /** Appele a chaque ajout ou retrait. */
  onChange?: (tags: readonly string[]) => void
  /** Texte d'attente, affiche quand le champ est vide. @defaultValue 'Ajouter...' */
  placeholder?: string
  /** Nombre maximal d'etiquettes. Atteint, le champ se ferme. @defaultValue 8 */
  max?: number
  /** Accepte deux fois la meme etiquette. @defaultValue false */
  duplicates?: boolean
  /** Neutralise le champ. @defaultValue false */
  disabled?: boolean
}

/** Toutes les proprietes. */
export type TagInputProps = Customisable<TagInputOwnProps>

/** Etiquettes par defaut : aucune. */
const NONE: readonly string[] = []

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-tag-input'

/** Pose le champ, les etiquettes et leur rebond, une fois par document. */
function ensureTagRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-tags]{',
    'display:flex;flex-wrap:wrap;align-items:center;gap:6px;cursor:text;',
    'padding:6px 8px;border-radius:0.75rem;',
    'background:var(--o-theme-surface);border:1px solid var(--o-theme-line);',
    'transition:border-color var(--o-duration-slow) linear,box-shadow var(--o-duration-slow) linear;',
    '}',
    '[data-o-tags]:focus-within{border-color:var(--o-tags-accent);',
    'box-shadow:0 0 0 3px color-mix(in oklab,var(--o-tags-accent) 25%,transparent)}',
    '[data-o-tags][data-o-tags-disabled]{opacity:0.5;pointer-events:none}',
    '[data-o-tags] ul{display:contents;margin:0;padding:0;list-style:none}',
    '[data-o-tag]{',
    'display:inline-flex;align-items:center;gap:2px;',
    'padding:2px 4px 2px 10px;border-radius:999px;font-size:0.875em;line-height:1.5;',
    'background:color-mix(in oklab,currentColor 8%,transparent);',
    'border:1px solid color-mix(in oklab,currentColor 15%,transparent);',
    'transition:background-color var(--o-duration-base) linear,border-color var(--o-duration-base) linear;',
    'animation:o-tag-in var(--o-duration-slow) cubic-bezier(0.2,0,0,1.3) both;',
    '}',
    // Armee : la prochaine touche Retour la retire.
    '[data-o-tag][data-o-tag-armed]{',
    'background:color-mix(in oklab,var(--o-tags-accent) 18%,transparent);',
    'border-color:var(--o-tags-accent)}',
    '[data-o-tag] button{',
    'display:inline-grid;place-items:center;width:1.4em;height:1.4em;border-radius:999px;',
    'border:0;background:transparent;color:inherit;font:inherit;cursor:pointer;opacity:0.6;',
    '}',
    '[data-o-tag] button:is(:hover,:focus-visible){opacity:1;',
    'background:color-mix(in oklab,currentColor 12%,transparent)}',
    '[data-o-tag] button:focus-visible{outline:2px solid var(--o-tags-accent);outline-offset:1px}',
    '[data-o-tags] input{',
    'flex:1 1 6ch;min-width:6ch;border:0;background:transparent;outline:none;',
    'font:inherit;color:inherit;padding:2px 4px;',
    '}',
    '[data-o-tags] input::placeholder{color:inherit;opacity:0.5}',
    '@keyframes o-tag-in{from{transform:scale(0.7);opacity:0}to{transform:scale(1);opacity:1}}',
    '@media (prefers-reduced-motion:reduce){[data-o-tag]{animation:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Champ qui transforme ce que l'on tape en etiquettes.
 *
 * @example
 * <TagInput label="Mots-cles" defaultValue={['design', 'motion']} />
 *
 * @example
 * // Mode controle, cinq etiquettes au plus.
 * <TagInput label="Destinataires" value={tags} onChange={setTags} max={5} placeholder="Ajouter un nom" />
 */
export function TagInput({
  label,
  value,
  defaultValue = NONE,
  onChange,
  placeholder = 'Ajouter...',
  max = 8,
  duplicates = false,
  disabled = false,
  ...rest
}: TagInputProps): ReactElement {
  const [internal, setInternal] = useState<readonly string[]>(defaultValue)
  const [draft, setDraft] = useState('')
  const [armed, setArmed] = useState(false)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const hostRef = useRef<HTMLDivElement | null>(null)
  ensureTagRules()

  const tags = value ?? internal
  const full = tags.length >= max

  const commit = (next: readonly string[]): void => {
    if (value === undefined) setInternal(next)
    onChange?.(next)
  }

  /** Pose le brouillon comme etiquette, s'il en vaut une. */
  const add = (): void => {
    const text = draft.trim()
    setDraft('')
    if (text === '' || full) return
    if (!duplicates && tags.includes(text)) return
    commit([...tags, text])
  }

  const remove = (index: number): void => {
    commit(tags.filter((_, at) => at !== index))
    setArmed(false)
    inputRef.current?.focus()
  }

  const removeButtons = (): HTMLButtonElement[] =>
    Array.from(hostRef.current?.querySelectorAll<HTMLButtonElement>('[data-o-tag] button') ?? [])

  const onInputKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault()
      add()
      return
    }
    if (event.key === 'Backspace' && draft === '' && tags.length > 0) {
      event.preventDefault()
      if (armed) remove(tags.length - 1)
      else setArmed(true)
      return
    }
    if (event.key === 'ArrowLeft' && draft === '' && tags.length > 0) {
      event.preventDefault()
      removeButtons().at(-1)?.focus()
      return
    }
    // Toute autre touche desarme : on ne retire pas ce que l'on ecrit.
    if (armed) setArmed(false)
  }

  const onTagKeyDown = (index: number, event: KeyboardEvent<HTMLButtonElement>): void => {
    const buttons = removeButtons()
    if (event.key === 'Backspace' || event.key === 'Delete') {
      event.preventDefault()
      remove(index)
      return
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      buttons[Math.max(0, index - 1)]?.focus()
      return
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      if (index + 1 < buttons.length) buttons[index + 1]?.focus()
      else inputRef.current?.focus()
    }
  }

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={hostRef}
      role="group"
      aria-label={label}
      data-o-tags=""
      data-o-tags-disabled={disabled ? '' : undefined}
      className={className}
      style={{ '--o-tags-accent': 'var(--o-palette-brand-500)', ...style } as CSSProperties}
      onClick={(event) => {
        // Cliquer dans la marge du champ, c'est vouloir y ecrire.
        if (event.target === event.currentTarget) inputRef.current?.focus()
        rest.onClick?.(event)
      }}
    >
      <ul>
        {tags.map((tag, index) => (
          <li
            key={`${tag}-${String(index)}`}
            data-o-tag=""
            data-o-tag-armed={armed && index === tags.length - 1 ? '' : undefined}
          >
            {tag}
            <button
              type="button"
              aria-label={`Retirer ${tag}`}
              disabled={disabled}
              onClick={() => remove(index)}
              onKeyDown={(event) => {
                onTagKeyDown(index, event)
              }}
            >
              <span aria-hidden="true">{'\u00D7'}</span>
            </button>
          </li>
        ))}
      </ul>
      {!full && (
        <input
          ref={inputRef}
          type="text"
          value={draft}
          placeholder={tags.length === 0 ? placeholder : ''}
          aria-label={label}
          disabled={disabled}
          onChange={(event) => {
            setDraft(event.target.value)
            if (armed) setArmed(false)
          }}
          onKeyDown={onInputKeyDown}
          onBlur={() => {
            // Quitter le champ pose le brouillon et desarme.
            add()
            setArmed(false)
          }}
        />
      )}
    </div>
  )
}
