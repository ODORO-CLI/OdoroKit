/**
 * Groupe bouton et champ : un champ et son bouton soudes dans une meme
 * pilule, avec une confirmation qui glisse dans le bouton apres l'envoi.
 *
 * ## Pas de formulaire dans le composant
 *
 * Un champ avec un bouton d'envoi appelle un `form`. Mais ce groupe se pose
 * le plus souvent dans un formulaire qui existe deja — une inscription au
 * pied d'une page, une recherche dans un en-tete — et deux formulaires
 * imbriques sont invalides. Le groupe est donc un `role="group"`, et Entree
 * dans le champ fait ce que le bouton fait ; le formulaire, s'il y en a un,
 * reste celui de la page.
 *
 * ## Le bouton a deux faces
 *
 * Le libelle de repos et la confirmation sont deux lignes superposees dans
 * un bouton qui n'en montre qu'une. A l'envoi, la pile glisse d'une ligne :
 * le libelle monte, la confirmation arrive par le bas. La largeur du bouton
 * est celle de la plus longue des deux, mesuree par le navigateur — le
 * bouton ne change pas de taille en cours de route.
 *
 * ## Une promesse tient le bouton occupe
 *
 * Si `onSubmit` rend une promesse, la confirmation attend sa fin, et le
 * bouton est marque occupe entre-temps : on ne confirme pas ce qui n'est
 * pas parti. Un rejet ramene le bouton au repos sans confirmer.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Proprietes propres au composant. */
export interface ButtonGroupInputOwnProps {
  /** Nom du champ pour les lecteurs d'ecran. */
  label: string
  /** Texte du champ, en mode controle. */
  value?: string
  /** Texte au montage, en mode non controle. @defaultValue '' */
  defaultValue?: string
  /** Appele a chaque frappe. */
  onChange?: (value: string) => void
  /** Appele a l'envoi. Une promesse tient le bouton occupe jusqu'a sa fin. */
  onSubmit?: (value: string) => void | Promise<unknown>
  /** Texte d'attente du champ. */
  placeholder?: string
  /** Libelle du bouton au repos. @defaultValue 'Envoyer' */
  buttonLabel?: string
  /** Libelle glisse dans le bouton apres l'envoi. @defaultValue 'Envoye' */
  doneLabel?: string
  /** Ce qui precede le champ dans la pilule : une icone, un prefixe d'adresse. */
  prefix?: ReactNode
  /** Type du champ. @defaultValue 'text' */
  type?: 'text' | 'email' | 'url' | 'search'
  /** Temps pendant lequel la confirmation reste affichee, en millisecondes. @defaultValue 1800 */
  hold?: number
  /** Neutralise le champ et le bouton. @defaultValue false */
  disabled?: boolean
  /** Nom du champ, transmis a l'input pour un formulaire englobant. */
  name?: string
}

/** Toutes les proprietes. */
export type ButtonGroupInputProps = Customisable<ButtonGroupInputOwnProps>

/** Ou en est le bouton. */
type Phase = 'idle' | 'busy' | 'done'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-button-group-input'

/** Pose la pilule, le champ et les deux faces du bouton, une fois par document. */
function ensureGroupRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-bgi]{',
    'position:relative;display:inline-flex;align-items:stretch;padding:4px;border-radius:999px;',
    'background:var(--o-theme-surface);border:1px solid var(--o-theme-line);',
    'transition:border-color var(--o-duration-slow) linear,box-shadow var(--o-duration-slow) linear;',
    '}',
    // Le focus est celui de la pilule entiere : c'est elle que l'on remplit.
    '[data-o-bgi]:focus-within{border-color:var(--o-bgi-accent);',
    'box-shadow:0 0 0 3px color-mix(in oklab,var(--o-bgi-accent) 25%,transparent)}',
    '[data-o-bgi][data-o-bgi-disabled]{opacity:0.5;pointer-events:none}',
    '[data-o-bgi-live]{position:absolute;width:1px;height:1px;overflow:hidden;',
    'clip-path:inset(50%);white-space:nowrap}',
    '[data-o-bgi-prefix]{display:inline-flex;align-items:center;padding-inline:0.9rem 0;opacity:0.6}',
    '[data-o-bgi] input{',
    'min-width:0;flex:1 1 auto;border:0;background:transparent;outline:none;',
    'font:inherit;color:inherit;padding:0.5rem 0.9rem;',
    '}',
    '[data-o-bgi] input::placeholder{color:inherit;opacity:0.5}',
    // Le bouton : une fenetre d'une ligne sur une pile de deux.
    '[data-o-bgi-button]{',
    'position:relative;overflow:hidden;cursor:pointer;flex:0 0 auto;',
    'display:inline-grid;align-items:center;padding:0.5rem 1.1rem;border:0;border-radius:999px;',
    'font:inherit;font-weight:500;color:var(--o-bgi-ink);background:var(--o-bgi-accent);',
    'transition:background-color var(--o-duration-slow) linear,transform var(--o-duration-slow) linear;',
    '}',
    '[data-o-bgi-button]:focus-visible{outline:2px solid var(--o-bgi-accent);outline-offset:2px}',
    '[data-o-bgi-button]:active{transform:scale(0.97)}',
    '[data-o-bgi-button][data-o-bgi-phase="busy"]{cursor:progress}',
    '[data-o-bgi-button][data-o-bgi-phase="done"]{background:var(--o-bgi-done)}',
    // Les deux faces occupent la meme cellule de grille : la largeur est
    // celle de la plus longue, et la pile glisse d'une ligne.
    '[data-o-bgi-face]{',
    'grid-area:1/1;white-space:nowrap;text-align:center;',
    'transition:transform var(--o-duration-slow) cubic-bezier(0.2,0,0,1),opacity var(--o-duration-slow) linear;',
    '}',
    '[data-o-bgi-face="done"]{transform:translateY(120%);opacity:0}',
    '[data-o-bgi-button][data-o-bgi-phase="busy"] [data-o-bgi-face="idle"]{opacity:0.5}',
    '[data-o-bgi-button][data-o-bgi-phase="done"] [data-o-bgi-face="idle"]{transform:translateY(-120%);opacity:0}',
    '[data-o-bgi-button][data-o-bgi-phase="done"] [data-o-bgi-face="done"]{transform:translateY(0);opacity:1}',
    '@media (prefers-reduced-motion:reduce){[data-o-bgi-face]{transition:opacity 0ms linear}}',
  ].join('')
  document.head.append(style)
}

/**
 * Champ et bouton dans une meme pilule.
 *
 * @example
 * <ButtonGroupInput
 *   label="Adresse de courriel"
 *   type="email"
 *   placeholder="vous@exemple.fr"
 *   buttonLabel="S'inscrire"
 *   doneLabel="Inscrit"
 *   onSubmit={inscrire}
 * />
 *
 * @example
 * // Mode controle, avec un prefixe d'adresse.
 * <ButtonGroupInput
 *   label="Nom du site"
 *   prefix="https://"
 *   value={site}
 *   onChange={setSite}
 *   buttonLabel="Verifier"
 *   doneLabel="Verifie"
 *   onSubmit={verifier}
 * />
 */
export function ButtonGroupInput({
  label,
  value,
  defaultValue = '',
  onChange,
  onSubmit,
  placeholder,
  buttonLabel = 'Envoyer',
  doneLabel = 'Envoye',
  prefix,
  type = 'text',
  hold = 1800,
  disabled = false,
  name,
  ...rest
}: ButtonGroupInputProps): ReactElement {
  const { reduced } = useMotionState()
  const [internal, setInternal] = useState(defaultValue)
  const [phase, setPhase] = useState<Phase>('idle')
  const timer = useRef<number | undefined>(undefined)
  const mounted = useRef(true)
  ensureGroupRules()

  const text = value ?? internal

  useEffect(() => {
    mounted.current = true
    return () => {
      mounted.current = false
      if (timer.current !== undefined) window.clearTimeout(timer.current)
    }
  }, [])

  const edit = (next: string): void => {
    if (value === undefined) setInternal(next)
    onChange?.(next)
  }

  /** Apres la confirmation, le bouton revient au repos. */
  const settle = (): void => {
    if (timer.current !== undefined) window.clearTimeout(timer.current)
    timer.current = window.setTimeout(() => {
      if (mounted.current) setPhase('idle')
    }, hold)
  }

  const submit = (): void => {
    if (disabled || phase !== 'idle') return
    const result = onSubmit?.(text)
    if (result instanceof Promise) {
      setPhase('busy')
      result.then(
        () => {
          if (!mounted.current) return
          setPhase('done')
          settle()
        },
        () => {
          if (mounted.current) setPhase('idle')
        },
      )
      return
    }
    setPhase('done')
    settle()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key !== 'Enter') return
    event.preventDefault()
    submit()
  }

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      role="group"
      aria-label={label}
      data-o-bgi=""
      data-o-bgi-disabled={disabled ? '' : undefined}
      className={className}
      style={
        {
          '--o-bgi-accent': 'var(--o-palette-brand-500)',
          '--o-bgi-done': 'var(--o-palette-emerald-500)',
          '--o-bgi-ink': 'var(--o-palette-zinc-50)',
          ...(reduced ? { '--o-duration-slow': '0ms' } : {}),
          ...style,
        } as CSSProperties
      }
    >
      {prefix !== undefined && <span data-o-bgi-prefix="">{prefix}</span>}
      <input
        type={type}
        name={name}
        value={text}
        placeholder={placeholder}
        aria-label={label}
        disabled={disabled}
        onChange={(event) => {
          edit(event.target.value)
        }}
        onKeyDown={onKeyDown}
      />
      <button
        type="button"
        data-o-bgi-button=""
        data-o-bgi-phase={phase}
        aria-busy={phase === 'busy' ? 'true' : undefined}
        disabled={disabled}
        onClick={submit}
      >
        <span data-o-bgi-face="idle">{buttonLabel}</span>
        <span data-o-bgi-face="done" aria-hidden="true">
          {doneLabel}
        </span>
      </button>
      {/* La confirmation est annoncee quand elle arrive, par une zone vive
          hors ecran : les deux faces visibles sont du decor. */}
      <span data-o-bgi-live="" role="status">
        {phase === 'done' ? doneLabel : ''}
      </span>
    </div>
  )
}
