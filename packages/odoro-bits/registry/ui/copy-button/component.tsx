/**
 * Bouton copier : la valeur part au presse-papiers, l'icone devient une coche.
 *
 * ## Le morphing est un fondu croise, pas un remplacement
 *
 * Les deux icones occupent la meme case ; la copie tourne l'une vers zero
 * pendant que l'autre arrive en grandissant. Remplacer le noeud SVG au meme
 * moment ferait le meme effet visuel en apparence, mais toute interruption
 * — un second clic pendant le retour — sauterait d'une image a l'autre.
 * Deux transitions d'opacite et d'echelle, elles, repartent toujours de
 * l'etat courant.
 *
 * ## L'etat est annonce, pas seulement montre
 *
 * Une region `aria-live="polite"` hors ecran recoit « Copie » au succes :
 * un lecteur d'ecran l'annonce sans etre interrompu. L'icone seule serait
 * muette, et changer le libelle du bouton pendant qu'il a le focus est
 * annonce de facon incoherente selon les lecteurs.
 *
 * ## L'echec ne pretend pas
 *
 * `navigator.clipboard` peut refuser — page non securisee, permission
 * retiree. Dans ce cas le bouton ne passe pas a la coche : montrer un
 * succes qui n'a pas eu lieu serait pire que ne rien faire.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
} from 'react'

/** Proprietes propres au composant. */
export interface CopyButtonOwnProps {
  /** Texte copie dans le presse-papiers. */
  value: string
  /** Libelle du bouton au repos. @defaultValue 'Copier' */
  label?: string
  /** Temps avant le retour a l'etat de repos, en millisecondes. @defaultValue 2000 */
  delay?: number
}

/** Toutes les proprietes. */
export type CopyButtonProps = Customisable<CopyButtonOwnProps, 'button'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-copy-button'

/** Pose le croisement des deux icones, une fois par document. */
function ensureCopyRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-copy]{',
    'display:inline-flex;align-items:center;cursor:pointer;',
    'background:transparent;color:inherit;font:inherit;',
    'border:1px solid color-mix(in oklch,currentColor 25%,transparent);',
    '}',
    '[data-o-copy-icons]{position:relative;width:1em;height:1em}',
    '[data-o-copy-icons] svg{',
    'position:absolute;inset:0;width:100%;height:100%;',
    'transition:opacity var(--o-duration-base) linear,',
    'transform var(--o-duration-base) var(--o-ease-emphasized);',
    '}',
    '[data-o-copy-plain]{opacity:1;transform:scale(1)}',
    '[data-o-copy-done]{opacity:0;transform:scale(0.4);color:var(--o-copy-tint)}',
    '[data-o-copy][data-o-copy-state="done"] [data-o-copy-plain]{opacity:0;transform:scale(0.4)}',
    '[data-o-copy][data-o-copy-state="done"] [data-o-copy-done]{opacity:1;transform:scale(1)}',
    // Mouvement reduit : le remplacement est instantane.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-copy-icons] svg{transition:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Copie une valeur au clic et le montre — et l'annonce — le temps d'un delai.
 *
 * @example
 * <CopyButton value="pnpm dlx odoro add ui/copy-button" />
 *
 * @example
 * // Un libelle propre au contexte, un retour plus court.
 * <CopyButton value={adresse} label="Copier l adresse" delay={1200} />
 */
export function CopyButton({
  value,
  label = 'Copier',
  delay = 2000,
  ...rest
}: CopyButtonProps): ReactElement {
  const { reduced } = useMotionState()
  const [copied, setCopied] = useState(false)
  const timer = useRef<number | null>(null)
  ensureCopyRules()

  // Une minuterie encore en vol au demontage annoncerait dans le vide.
  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current)
    },
    [],
  )

  const copy = (): void => {
    navigator.clipboard
      .writeText(value)
      .then(() => {
        setCopied(true)
        if (timer.current !== null) window.clearTimeout(timer.current)
        timer.current = window.setTimeout(() => {
          setCopied(false)
        }, delay)
      })
      .catch(() => {
        // Voir l'en-tete du module : pas de coche sans copie reelle.
      })
  }

  const { className, style } = mergePresentation(
    { className: 'o-rounded-lg o-px-3 o-py-2 o-text-sm o-font-medium o-gap-2' },
    rest,
  )

  return (
    <button
      type="button"
      {...rest}
      data-o-copy=""
      data-o-copy-state={copied ? 'done' : 'idle'}
      onClick={copy}
      className={className}
      style={
        {
          ...style,
          '--o-copy-tint': 'var(--o-palette-emerald-500)',
          ...(reduced ? { '--o-duration-base': '0ms' } : {}),
        } as CSSProperties
      }
    >
      <span data-o-copy-icons="" aria-hidden="true">
        <svg
          data-o-copy-plain=""
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect x="9" y="9" width="12" height="12" rx="2" />
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
        </svg>
        <svg
          data-o-copy-done=""
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M4 12.5 9.5 18 20 6.5" />
        </svg>
      </span>
      <span>{label}</span>
      <span aria-live="polite" className="o-sr-only">
        {copied ? 'Copie' : ''}
      </span>
    </button>
  )
}
