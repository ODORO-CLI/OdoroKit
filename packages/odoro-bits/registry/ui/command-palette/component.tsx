/**
 * Palette de commandes : une fenetre qui s'ouvre au-dessus de la page, filtre
 * une liste a la frappe, et lance ce qui est retenu.
 *
 * ## L'ouverture appartient a la page
 *
 * La palette ne connait pas le raccourci qui l'appelle : `open` est une
 * propriete controlee, `onOpenChange` demande la fermeture. C'est la seule
 * facon d'avoir un raccourci global, une entree de menu et un bouton qui
 * ouvrent la meme fenetre sans qu'aucun des trois n'ait a en connaitre l'etat
 * interne — et cela laisse le composant testable sans clavier.
 *
 * ## Fermee, elle n'existe pas
 *
 * Aucun noeud n'est laisse dans le document : ni le voile qui intercepte les
 * clics, ni la liste que la navigation au clavier traverserait a l'aveugle.
 *
 * ## Le champ est le seul point de focus, la liste est designee
 *
 * Les fleches ne deplacent pas le focus — elles deplacent
 * `aria-activedescendant`. C'est ce qui permet de continuer a ecrire tout en
 * parcourant les resultats, et c'est le motif `combobox` de l'ARIA. Tab est
 * retenu dans la fenetre, et le focus retourne d'ou il venait a la fermeture :
 * sans cela, on rouvre la page au debut du document.
 *
 * ## Le filtre ignore la casse et les accents
 *
 * Un mot cherche sans ses signes doit trouver le mot qui les porte : c'est
 * ainsi que l'on tape, vite et sans y penser. Les signes sont retires par
 * decomposition Unicode plutot que par une table de correspondances, qui
 * serait fausse des la premiere langue non prevue.
 *
 * ## Mouvement reduit
 *
 * La fenetre parait a sa taille et a sa place, sans montee ni voile qui
 * s'installe.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Une commande de la palette. */
export interface PaletteCommand {
  /** Identifiant, unique dans la palette. */
  readonly id: string
  /** Libelle affiche, et sur lequel porte le filtre. */
  readonly label: string
  /** Precision affichee a droite : un raccourci, un chemin. */
  readonly hint?: string
  /** Nom du groupe sous lequel ranger la commande. */
  readonly group?: string
  /** Icone posee avant le libelle. */
  readonly icon?: ReactNode
}

/** Proprietes propres au composant. */
export interface CommandPaletteOwnProps {
  /** Les commandes, dans leur ordre naturel. */
  commands: readonly PaletteCommand[]
  /** Fenetre ouverte. La page en decide, toujours. */
  open: boolean
  /** Appele quand la palette demande sa fermeture. */
  onOpenChange?: (open: boolean) => void
  /** Appele avec l'identifiant de la commande lancee. */
  onRun?: (id: string) => void
  /** Nom de la fenetre pour les lecteurs d'ecran. @defaultValue 'Commandes' */
  label?: string
  /** Texte d'attente du champ. @defaultValue 'Rechercher une commande...' */
  placeholder?: string
  /** Phrase affichee quand rien ne correspond. @defaultValue 'Aucune commande.' */
  empty?: string
}

/** Toutes les proprietes. */
export type CommandPaletteProps = Customisable<CommandPaletteOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-command-palette'

/** Pose le voile, la fenetre, le champ et la liste, une fois par document. */
function ensurePaletteRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-palette]{',
    'position:fixed;inset:0;z-index:var(--o-z-modal);',
    'display:flex;align-items:flex-start;justify-content:center;padding:12vh 1rem 1rem;',
    // Un voile est sombre dans les deux themes : c'est le seul endroit ou la
    // teinte ne bascule pas, sinon la fenetre claire s'enfoncerait dans du blanc.
    'background:color-mix(in oklab,var(--o-palette-zinc-950) 45%,transparent);',
    'animation:o-palette-veil var(--o-duration-base) linear both;',
    '}',
    '[data-o-palette-panel]{',
    'display:flex;flex-direction:column;overflow:hidden;',
    'width:min(34rem,100%);max-height:min(28rem,70vh);',
    'border-radius:0.9rem;background:var(--o-theme-surface);',
    'border:1px solid var(--o-theme-line);',
    'box-shadow:0 24px 60px color-mix(in oklab,var(--o-palette-zinc-950) 35%,transparent);',
    'animation:o-palette-in var(--o-duration-slow) var(--o-ease-emphasized) both;',
    '}',
    '[data-o-palette-field]{',
    'display:flex;align-items:center;gap:0.6rem;padding:0.85rem 1rem;',
    'border-bottom:1px solid var(--o-theme-line);',
    '}',
    '[data-o-palette-field] input{',
    'flex:1 1 auto;min-width:0;border:0;background:transparent;outline:none;',
    'font:inherit;color:inherit;font-size:1rem;',
    '}',
    '[data-o-palette-field] input::placeholder{color:inherit;opacity:0.45}',
    '[data-o-palette-list]{',
    'flex:1 1 auto;overflow-y:auto;overscroll-behavior:contain;padding:0.4rem}',
    '[data-o-palette-group]{',
    'padding:0.5rem 0.6rem 0.25rem;font-size:0.75em;text-transform:uppercase;',
    'letter-spacing:0.06em;opacity:0.5}',
    '[data-o-palette-list] [role="option"]{',
    'display:flex;align-items:center;gap:0.6rem;',
    'padding:0.5rem 0.6rem;border-radius:0.55rem;cursor:pointer;',
    'transition:background-color var(--o-duration-fast) linear;',
    '}',
    '[data-o-palette-list] [role="option"][aria-selected="true"]{',
    'background:color-mix(in oklab,var(--o-cmd-accent) 15%,transparent)}',
    '[data-o-palette-label]{flex:1 1 auto;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}',
    '[data-o-palette-hint]{flex:none;font-size:0.8125em;opacity:0.5;font-variant-numeric:tabular-nums}',
    '[data-o-palette-empty]{padding:1.5rem 1rem;text-align:center;opacity:0.6}',
    '[data-o-palette-foot]{',
    'display:flex;justify-content:space-between;gap:1rem;',
    'padding:0.5rem 1rem;border-top:1px solid var(--o-theme-line);',
    'font-size:0.75em;opacity:0.55}',
    '@keyframes o-palette-veil{from{opacity:0}to{opacity:1}}',
    '@keyframes o-palette-in{from{opacity:0;scale:0.97;translate:0 -10px}to{opacity:1;scale:1;translate:none}}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-palette],[data-o-palette-panel]{animation:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Retire les signes diacritiques et la casse, pour comparer deux textes.
 *
 * La decomposition separe la lettre de son signe ; l'intervalle retire ensuite
 * tous les signes combinants d'un coup, sans table a tenir a jour.
 */
function plain(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLocaleLowerCase()
}

/**
 * Palette de commandes, ouverte par la page.
 *
 * @example
 * const [ouverte, setOuverte] = useState(false)
 * <CommandPalette
 *   open={ouverte}
 *   onOpenChange={setOuverte}
 *   onRun={(id) => { lancer(id) }}
 *   commands={[
 *     { id: 'nouveau', label: 'Nouveau document', group: 'Fichier', hint: 'Ctrl N' },
 *     { id: 'ouvrir', label: 'Ouvrir un projet', group: 'Fichier' },
 *   ]}
 * />
 */
export function CommandPalette({
  commands,
  open,
  onOpenChange,
  onRun,
  label = 'Commandes',
  placeholder = 'Rechercher une commande...',
  empty = 'Aucune commande.',
  ...rest
}: CommandPaletteProps): ReactElement | null {
  const panelRef = useRef<HTMLDivElement | null>(null)
  const inputRef = useRef<HTMLInputElement | null>(null)
  const [query, setQuery] = useState('')
  const [at, setAt] = useState(0)
  const baseId = useId()
  ensurePaletteRules()

  const needle = plain(query.trim())
  const found = commands.filter(
    (command) =>
      needle === '' ||
      plain(command.label).includes(needle) ||
      (command.group !== undefined && plain(command.group).includes(needle)),
  )
  const active = Math.min(at, Math.max(0, found.length - 1))

  // A l'ouverture : champ vide, premier resultat, focus dans le champ. A la
  // fermeture : le focus retourne exactement d'ou il venait.
  useEffect(() => {
    if (!open) return
    const opener = document.activeElement
    setQuery('')
    setAt(0)
    inputRef.current?.focus()
    return () => {
      if (opener instanceof HTMLElement) opener.focus()
    }
  }, [open])

  if (!open) return null

  const close = (): void => {
    onOpenChange?.(false)
  }

  const run = (id: string): void => {
    onRun?.(id)
    close()
  }

  /** Retient Tab dans la fenetre : dehors, il n'y a plus de page atteignable. */
  const trap = (event: KeyboardEvent<HTMLDivElement>): void => {
    const focusable = Array.from(
      panelRef.current?.querySelectorAll<HTMLElement>(
        'input, button, [href], [tabindex]:not([tabindex="-1"])',
      ) ?? [],
    ).filter((element) => !element.hasAttribute('disabled'))
    const first = focusable[0]
    const last = focusable.at(-1)
    if (first === undefined || last === undefined) return
    event.preventDefault()
    const forward = !event.shiftKey
    const current = document.activeElement
    const index = focusable.findIndex((element) => element === current)
    const next = forward
      ? focusable[(index + 1) % focusable.length]
      : focusable[(index - 1 + focusable.length) % focusable.length]
    next?.focus()
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'Escape') {
      event.preventDefault()
      close()
      return
    }
    if (event.key === 'Tab') {
      trap(event)
      return
    }
    const last = found.length - 1
    if (last < 0) return
    const moves: Readonly<Record<string, number | undefined>> = {
      ArrowDown: active >= last ? 0 : active + 1,
      ArrowUp: active <= 0 ? last : active - 1,
      Home: 0,
      End: last,
    }
    const target = moves[event.key]
    if (target !== undefined) {
      event.preventDefault()
      setAt(target)
      panelRef.current
        ?.querySelectorAll<HTMLElement>('[role="option"]')
        [target]?.scrollIntoView({ block: 'nearest' })
      return
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      const command = found[active]
      if (command !== undefined) run(command.id)
    }
  }

  // Les resultats sont ranges par groupes consecutifs : l'ordre donne par la
  // page est conserve, et un intitule ne parait qu'au changement de groupe.
  const segments: { name?: string; items: { command: PaletteCommand; index: number }[] }[] = []
  for (const [index, command] of found.entries()) {
    const tail = segments.at(-1)
    if (tail !== undefined && tail.name === command.group) tail.items.push({ command, index })
    else segments.push({ name: command.group, items: [{ command, index }] })
  }

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      data-o-palette=""
      className={className}
      style={{ '--o-cmd-accent': 'var(--o-palette-brand-500)', ...style } as CSSProperties}
      onPointerDown={(event) => {
        // Cliquer a cote de la fenetre, c'est vouloir la fermer.
        if (event.target === event.currentTarget) close()
        rest.onPointerDown?.(event)
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        data-o-palette-panel=""
        onKeyDown={onKeyDown}
      >
        <div data-o-palette-field="">
          <svg viewBox="0 0 16 16" width="15" height="15" aria-hidden="true" fill="none"
            stroke="currentColor" strokeWidth="1.6">
            <circle cx="7" cy="7" r="4.5" />
            <path d="M10.5 10.5 L14 14" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded="true"
            aria-controls={`${baseId}-liste`}
            aria-activedescendant={
              found[active] === undefined ? undefined : `${baseId}-${String(active)}`
            }
            aria-label={label}
            autoComplete="off"
            placeholder={placeholder}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
              setAt(0)
            }}
          />
        </div>
        {found.length === 0 ? (
          <p data-o-palette-empty="">{empty}</p>
        ) : (
          <div id={`${baseId}-liste`} role="listbox" aria-label={label} data-o-palette-list="">
            {segments.map((segment) => (
              <div
                key={segment.name ?? ''}
                role="group"
                aria-label={segment.name}
                data-o-palette-segment=""
              >
                {segment.name !== undefined && (
                  <p data-o-palette-group="" aria-hidden="true">
                    {segment.name}
                  </p>
                )}
                {segment.items.map(({ command, index }) => (
                  <div
                    key={command.id}
                    id={`${baseId}-${String(index)}`}
                    role="option"
                    aria-selected={index === active}
                    onPointerEnter={() => {
                      setAt(index)
                    }}
                    onClick={() => {
                      run(command.id)
                    }}
                  >
                    {command.icon !== undefined && <span aria-hidden="true">{command.icon}</span>}
                    <span data-o-palette-label="">{command.label}</span>
                    {command.hint !== undefined && (
                      <span data-o-palette-hint="">{command.hint}</span>
                    )}
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
        <div data-o-palette-foot="">
          <span>Fleches pour parcourir, Entree pour lancer</span>
          <span>Echap pour fermer</span>
        </div>
      </div>
    </div>
  )
}
