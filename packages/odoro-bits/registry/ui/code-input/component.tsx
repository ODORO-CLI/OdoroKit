/**
 * Champ de code : une case par caractere, la saisie avance toute seule.
 *
 * ## Un input par case, pas un champ decoupe en apparence
 *
 * Chaque case est un vrai `input` : le focus, la selection, le clavier
 * virtuel et les gestionnaires de mots de passe fonctionnent sans
 * simulation. Le composant orchestre seulement le passage de l'une a
 * l'autre — avancer a la saisie, reculer sur Backspace vide.
 *
 * ## Le collage remplit tout
 *
 * Un code recu par message se colle en entier : l'evenement de collage est
 * intercepte sur n'importe quelle case, reparti caractere par caractere, et
 * le focus se pose sur la case qui suit le dernier caractere ecrit. Sans
 * cela, coller ne remplirait que la case courante — le cas d'usage le plus
 * frequent serait le plus penible.
 *
 * ## L'anneau de la case active respire
 *
 * Une animation d'ombre portee, sur la seule case qui a le focus. Sous
 * mouvement reduit l'anneau reste, fixe : l'information — c'est ici qu'on
 * ecrit — est dans l'anneau, pas dans sa respiration.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useRef,
  useState,
  type ClipboardEvent,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
} from 'react'

/** Proprietes propres au composant. */
export interface CodeInputOwnProps {
  /** Nombre de cases. @defaultValue 6 */
  length?: number
  /** Masque les caracteres saisis. @defaultValue false */
  masked?: boolean
  /** Appele quand toutes les cases sont remplies. */
  onComplete?: (code: string) => void
  /** Appele a chaque changement, avec le code partiel. */
  onValueChange?: (code: string) => void
  /** Nom du groupe pour les lecteurs d'ecran. @defaultValue 'Code de verification' */
  label?: string
}

/** Toutes les proprietes. */
export type CodeInputProps = Customisable<CodeInputOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-code-input'

/** Pose les cases et l'anneau, une fois par document. */
function ensureCodeRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-code] input{',
    'width:2.75rem;height:3.25rem;text-align:center;',
    'font:inherit;font-size:1.25rem;font-weight:600;color:inherit;',
    'background:transparent;border-radius:0.75rem;',
    'border:1px solid color-mix(in oklch,currentColor 30%,transparent);',
    'transition:border-color var(--o-duration-fast) linear;',
    'caret-color:var(--o-code-ring);',
    '}',
    '[data-o-code] input:focus-visible{',
    'outline:none;border-color:var(--o-code-ring);',
    'animation:o-code-breathe 1200ms ease-in-out infinite;',
    '}',
    '@keyframes o-code-breathe{',
    '0%,100%{box-shadow:0 0 0 3px color-mix(in oklch,var(--o-code-ring) 35%,transparent)}',
    '50%{box-shadow:0 0 0 6px color-mix(in oklch,var(--o-code-ring) 15%,transparent)}',
    '}',
    // Mouvement reduit : l anneau reste, sa respiration s arrete.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-code] input:focus-visible{animation:none;',
    'box-shadow:0 0 0 3px color-mix(in oklch,var(--o-code-ring) 35%,transparent)}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Champ de code a cases, avec avancee automatique et collage reparti.
 *
 * @example
 * <CodeInput onComplete={verifier} />
 *
 * @example
 * // Quatre cases masquees, comme un code de carte.
 * <CodeInput length={4} masked onComplete={valider} />
 */
export function CodeInput({
  length = 6,
  masked = false,
  onComplete,
  onValueChange,
  label = 'Code de verification',
  ...rest
}: CodeInputProps): ReactElement {
  const { reduced } = useMotionState()
  const [values, setValues] = useState<readonly string[]>(() => Array(length).fill(''))
  const inputsRef = useRef<(HTMLInputElement | null)[]>([])
  ensureCodeRules()

  // Un changement de longueur remet le champ a neuf.
  const cells = values.length === length ? values : Array<string>(length).fill('')

  const commit = (next: readonly string[]): void => {
    setValues(next)
    const code = next.join('')
    onValueChange?.(code)
    if (code.length === length) onComplete?.(code)
  }

  const focusCell = (index: number): void => {
    const input = inputsRef.current[Math.max(0, Math.min(length - 1, index))]
    input?.focus()
    input?.select()
  }

  const onCellChange = (index: number, raw: string): void => {
    // Seul le dernier caractere compte : ecraser une case pleine la remplace.
    const char = raw.slice(-1)
    const next = cells.map((cell, at) => (at === index ? char : cell))
    commit(next)
    if (char !== '') focusCell(index + 1)
  }

  const onCellKeyDown = (index: number, event: KeyboardEvent<HTMLInputElement>): void => {
    if (event.key === 'Backspace' && cells[index] === '' && index > 0) {
      // La case est deja vide : c est la precedente que l on efface.
      event.preventDefault()
      const next = cells.map((cell, at) => (at === index - 1 ? '' : cell))
      commit(next)
      focusCell(index - 1)
    }
    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      focusCell(index - 1)
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault()
      focusCell(index + 1)
    }
  }

  const onPaste = (event: ClipboardEvent<HTMLDivElement>): void => {
    const text = event.clipboardData.getData('text').replace(/\s/g, '').slice(0, length)
    if (text === '') return
    event.preventDefault()
    const next = cells.map((cell, at) => text.charAt(at) || cell)
    commit(next)
    focusCell(text.length)
  }

  const { className, style } = mergePresentation(
    { className: 'o-inline-flex o-gap-2' },
    rest,
  )

  return (
    <div
      {...rest}
      role="group"
      aria-label={label}
      data-o-code=""
      onPaste={onPaste}
      className={className}
      style={
        {
          ...style,
          '--o-code-ring': 'var(--o-palette-brand-500)',
          ...(reduced ? { '--o-duration-fast': '0ms' } : {}),
        } as CSSProperties
      }
    >
      {cells.map((cell, index) => (
        <input
          key={index}
          ref={(node) => {
            inputsRef.current[index] = node
          }}
          type={masked ? 'password' : 'text'}
          inputMode="text"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={2}
          value={cell}
          aria-label={`Caractere ${String(index + 1)} sur ${String(length)}`}
          onChange={(event) => {
            onCellChange(index, event.target.value)
          }}
          onKeyDown={(event) => {
            onCellKeyDown(index, event)
          }}
          onFocus={(event) => {
            event.target.select()
          }}
        />
      ))}
    </div>
  )
}
