/**
 * Pile d'avatars : des initiales chevauchees qui s'etalent au survol.
 *
 * ## L'etalement est une marge, pas une transformation
 *
 * Au repos, chaque pastille mord sur la precedente par une marge negative ;
 * au survol ou au focus, la marge revient a zero et la rangee s'etale. Une
 * transformation serait composee plus vite, mais elle ne pousserait pas les
 * voisines : la rangee garderait sa largeur et les pastilles se
 * recouvriraient autrement. Ici c'est bien la geometrie qui change, et la
 * marge est la propriete honnete pour le dire.
 *
 * ## Le clavier a le meme droit que la souris
 *
 * Le groupe est focusable, et `:focus-visible` declenche le meme etalement
 * que `:hover` : un utilisateur au clavier peut lire chaque nom, pas
 * seulement le premier de la pile.
 *
 * ## Les initiales ne sont pas le nom
 *
 * Chaque pastille porte le nom complet en `title` et hors ecran ; les
 * initiales, redondantes, sont retirees de l'arbre d'accessibilite.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement } from 'react'

/** Une personne de la pile. */
export interface AvatarStackItem {
  /** Nom complet, affiche en infobulle et lu par les lecteurs d'ecran. */
  readonly name: string
  /** Token de palette pour le fond, sinon le cycle par defaut. */
  readonly tone?: string
}

/** Proprietes propres au composant. */
export interface AvatarStackOwnProps {
  /** Les personnes, dans l'ordre d'affichage. */
  items: readonly AvatarStackItem[]
  /** Nombre de pastilles montrees avant le compteur de surplus. @defaultValue 5 */
  max?: number
  /** Chevauchement des pastilles au repos, en pixels. @defaultValue 12 */
  offset?: number
  /** Nom du groupe pour les lecteurs d'ecran. @defaultValue 'Equipe' */
  label?: string
}

/** Toutes les proprietes. */
export type AvatarStackProps = Customisable<AvatarStackOwnProps>

/** Cycle de teintes par defaut, une par position. */
const TONES = [
  '--o-palette-brand-500',
  '--o-palette-emerald-500',
  '--o-palette-amber-500',
  '--o-palette-rose-500',
  '--o-palette-sky-500',
] as const

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-avatar-stack'

/** Pose la pile et son etalement, une fois par document. */
function ensureStackRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-avatars]{display:inline-flex;align-items:center}',
    '[data-o-avatars] [data-o-avatar]{',
    'display:inline-flex;align-items:center;justify-content:center;',
    'width:2.5rem;height:2.5rem;border-radius:999px;',
    'background:var(--o-avatar-tone);color:var(--o-avatar-ink);',
    'font-size:0.8125rem;font-weight:600;letter-spacing:0.02em;',
    'border:2px solid color-mix(in oklch,var(--o-avatar-ink) 90%,transparent);',
    'margin-inline-start:calc(var(--o-avatars-offset) * -1);',
    'transition:margin-inline-start var(--o-duration-slow) var(--o-ease-standard);',
    '}',
    '[data-o-avatars] [data-o-avatar]:first-child{margin-inline-start:0}',
    '[data-o-avatars]:is(:hover,:focus-visible) [data-o-avatar]{margin-inline-start:0}',
    // Mouvement reduit : l etalement reste, seul le trajet disparait.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-avatars] [data-o-avatar]{transition:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Les initiales d'un nom : premiere lettre des deux premiers mots. */
function initialsOf(name: string): string {
  return name
    .split(/\s+/)
    .filter((word) => word !== '')
    .slice(0, 2)
    .map((word) => word.charAt(0).toLocaleUpperCase())
    .join('')
}

/**
 * Pile d'initiales chevauchees qui s'etale au survol ou au focus.
 *
 * @example
 * <AvatarStack
 *   items={[
 *     { name: 'Ada Lovelace' },
 *     { name: 'Grace Hopper' },
 *     { name: 'Alan Turing' },
 *   ]}
 * />
 *
 * @example
 * // Une teinte imposee, et plus de recouvrement.
 * <AvatarStack items={[{ name: 'Ada', tone: '--o-palette-sky-500' }]} offset={18} />
 */
export function AvatarStack({
  items,
  max = 5,
  offset = 12,
  label = 'Equipe',
  ...rest
}: AvatarStackProps): ReactElement {
  const { reduced } = useMotionState()
  ensureStackRules()

  const shown = items.slice(0, max)
  const surplus = items.length - shown.length

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      role="group"
      aria-label={label}
      tabIndex={0}
      data-o-avatars=""
      className={className}
      style={
        {
          ...style,
          '--o-avatars-offset': `${String(offset)}px`,
          '--o-avatar-ink': 'var(--o-palette-zinc-50)',
          ...(reduced ? { '--o-duration-slow': '0ms' } : {}),
        } as CSSProperties
      }
    >
      {shown.map((item, index) => (
        <span
          key={item.name}
          data-o-avatar=""
          title={item.name}
          style={
            {
              '--o-avatar-tone': `var(${item.tone ?? TONES[index % TONES.length] ?? TONES[0]})`,
            } as CSSProperties
          }
        >
          <span aria-hidden="true">{initialsOf(item.name)}</span>
          <span className="o-sr-only">{item.name}</span>
        </span>
      ))}
      {surplus > 0 ? (
        <span
          data-o-avatar=""
          style={
            {
              '--o-avatar-tone': 'color-mix(in oklch,currentColor 35%,transparent)',
            } as CSSProperties
          }
        >
          <span aria-hidden="true">+{surplus}</span>
          <span className="o-sr-only">{`${String(surplus)} personnes de plus`}</span>
        </span>
      ) : null}
    </div>
  )
}
