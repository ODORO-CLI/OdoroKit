/**
 * Zone de depot : elle se souleve quand un fichier la survole.
 *
 * ## L'input natif fait le vrai travail
 *
 * Le glisser-deposer est une surcouche : le chemin fiable — clavier, mobile,
 * lecteurs d'ecran, gestionnaires de fichiers — est un `input type="file"`
 * ordinaire, present et focusable, simplement retire de l'ecran. La zone
 * entiere est son label : cliquer n'importe ou ouvre le selecteur.
 *
 * ## Les pointilles sont quatre degrades, pas une bordure
 *
 * `border-style: dashed` ne s'anime pas. Les pointilles sont donc peints en
 * arriere-plan — deux degrades repetes pour les bords horizontaux, deux
 * pour les verticaux — et c'est leur `background-position` qui defile. La
 * marche ne tourne que pendant le survol d'un fichier : une fourmi qui
 * defile en permanence est une distraction, pas une invitation. Sous
 * mouvement reduit, elle ne tourne jamais — la bordure reste, l'etat
 * souleve aussi.
 *
 * ## Le compteur de survol, ou pourquoi `dragleave` ment
 *
 * `dragleave` se declenche en passant sur chaque enfant de la zone. Sans
 * compteur d'entrees et de sorties, la zone clignoterait a chaque
 * traversee de texte.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useId,
  useRef,
  useState,
  type CSSProperties,
  type DragEvent,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Proprietes propres au composant. */
export interface FileDropOwnProps {
  /** Accepte plusieurs fichiers a la fois. @defaultValue true */
  multiple?: boolean
  /** Appele avec les fichiers deposes ou choisis. */
  onFiles?: (files: readonly File[]) => void
  /** Invitation affichee dans la zone. @defaultValue 'Deposez vos fichiers ici' */
  children?: ReactNode
}

/** Toutes les proprietes. */
export type FileDropProps = Customisable<FileDropOwnProps, 'label'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-file-drop'

/** Pose la zone, ses pointilles et leur marche, une fois par document. */
function ensureDropRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-drop]{',
    '--o-drop-edge:color-mix(in oklch,currentColor 35%,transparent);',
    'position:relative;display:flex;flex-direction:column;align-items:center;',
    'justify-content:center;gap:0.5rem;cursor:pointer;',
    'border-radius:1rem;padding:2.5rem 2rem;text-align:center;',
    // Quatre degrades : deux bords horizontaux, deux verticaux.
    'background-image:',
    'repeating-linear-gradient(90deg,var(--o-drop-edge) 0 8px,transparent 8px 16px),',
    'repeating-linear-gradient(90deg,var(--o-drop-edge) 0 8px,transparent 8px 16px),',
    'repeating-linear-gradient(0deg,var(--o-drop-edge) 0 8px,transparent 8px 16px),',
    'repeating-linear-gradient(0deg,var(--o-drop-edge) 0 8px,transparent 8px 16px);',
    'background-size:100% 1px,100% 1px,1px 100%,1px 100%;',
    'background-position:0 0,0 100%,0 0,100% 0;',
    'background-repeat:no-repeat;',
    'transition:transform var(--o-duration-base) var(--o-ease-standard);',
    '}',
    '[data-o-drop]:focus-within{outline:2px solid var(--o-drop-tint);outline-offset:4px}',
    '[data-o-drop][data-o-drop-over="true"]{',
    '--o-drop-edge:var(--o-drop-tint);',
    'transform:scale(1.02) translateY(-2px);',
    'animation:o-drop-march 600ms linear infinite;',
    '}',
    '@keyframes o-drop-march{',
    'to{background-position:16px 0,-16px 100%,0 -16px,100% 16px}',
    '}',
    // Mouvement reduit : la bordure s allume mais ne defile jamais, et la
    // zone ne se souleve pas.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-drop][data-o-drop-over="true"]{animation:none;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Zone de depot de fichiers, posee sur un input natif.
 *
 * @example
 * <FileDrop onFiles={televerser} />
 *
 * @example
 * // Un seul fichier, et une invitation propre au contexte.
 * <FileDrop multiple={false} onFiles={([fichier]) => ouvrir(fichier)}>
 *   Glissez votre CV ici
 * </FileDrop>
 */
export function FileDrop({
  multiple = true,
  onFiles,
  children = 'Deposez vos fichiers ici',
  ...rest
}: FileDropProps): ReactElement {
  const { reduced } = useMotionState()
  const inputId = useId()
  const [over, setOver] = useState(false)
  const [names, setNames] = useState<readonly string[]>([])
  const depth = useRef(0)
  ensureDropRules()

  const accept = (files: readonly File[]): void => {
    const kept = multiple ? files : files.slice(0, 1)
    if (kept.length === 0) return
    setNames(kept.map((file) => file.name))
    onFiles?.(kept)
  }

  const onDragEnter = (event: DragEvent<HTMLLabelElement>): void => {
    event.preventDefault()
    depth.current += 1
    setOver(true)
  }

  const onDragLeave = (): void => {
    depth.current = Math.max(0, depth.current - 1)
    if (depth.current === 0) setOver(false)
  }

  const onDrop = (event: DragEvent<HTMLLabelElement>): void => {
    event.preventDefault()
    depth.current = 0
    setOver(false)
    accept([...event.dataTransfer.files])
  }

  const { className, style } = mergePresentation({}, rest)

  return (
    <label
      {...rest}
      htmlFor={inputId}
      data-o-drop=""
      data-o-drop-over={over}
      onDragEnter={onDragEnter}
      onDragOver={(event) => {
        event.preventDefault()
      }}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={className}
      style={
        {
          ...style,
          '--o-drop-tint': 'var(--o-palette-brand-500)',
          ...(reduced ? { '--o-duration-base': '0ms' } : {}),
        } as CSSProperties
      }
    >
      <input
        id={inputId}
        type="file"
        multiple={multiple}
        className="o-sr-only"
        aria-label="Choisir des fichiers"
        onChange={(event) => {
          accept([...(event.target.files ?? [])])
          // La meme selection deux fois de suite doit redeclencher l evenement.
          event.target.value = ''
        }}
      />
      <span className="o-font-medium">{children}</span>
      <span className="o-text-sm o-opacity-70">ou cliquez pour parcourir</span>
      {names.length > 0 ? (
        <ul aria-live="polite" className="o-mt-2 o-text-sm o-opacity-70">
          {names.map((name) => (
            <li key={name}>{name}</li>
          ))}
        </ul>
      ) : null}
    </label>
  )
}
