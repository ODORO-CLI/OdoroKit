/**
 * Interrupteur jour nuit : un soleil qui devient lune.
 *
 * ## Decoratif, et honnete sur ce point
 *
 * Ce composant ne touche pas au theme du site : il expose un etat et le
 * signale, c'est tout. Brancher la bascule sur un vrai changement de theme
 * est le travail de la page — un composant du registre qui ecrirait sur
 * `document.documentElement` prendrait une decision qui ne lui appartient
 * pas.
 *
 * ## Un `role="switch"`, pas une case a cocher
 *
 * L'element est un bouton avec `role="switch"` et `aria-checked` : les
 * lecteurs d'ecran annoncent « active / desactive », le vocabulaire exact
 * d'un interrupteur. Une case a cocher annoncerait « coche », ce qui decrit
 * un formulaire, pas une bascule d'ambiance.
 *
 * ## Le soleil et la lune sont deux dessins superposes
 *
 * Chacun tourne et s'estompe en croisant l'autre : le morphing est une
 * rotation plus un fondu, deux proprietes composees. Les etoiles ne sont
 * que des points dont l'opacite suit l'etat nuit, avec un leger decalage
 * pour qu'elles s'allument apres l'arrivee de la lune.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useState, type CSSProperties, type ReactElement } from 'react'

/** Proprietes propres au composant. */
export interface ThemeSwitchOwnProps {
  /** Etat nuit, en mode controle. */
  checked?: boolean
  /** Etat au montage, en mode non controle. @defaultValue false */
  defaultChecked?: boolean
  /** Appele quand l'utilisateur bascule. */
  onCheckedChange?: (checked: boolean) => void
  /** Hauteur de l'interrupteur, en pixels. @defaultValue 32 */
  size?: number
  /** Nom de la bascule pour les lecteurs d'ecran. @defaultValue 'Mode nuit' */
  label?: string
}

/** Toutes les proprietes. */
export type ThemeSwitchProps = Customisable<ThemeSwitchOwnProps, 'button'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-theme-switch'

/** Pose la piste, le disque et les etoiles, une fois par document. */
function ensureSwitchRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-daynight]{',
    'position:relative;display:inline-flex;align-items:center;cursor:pointer;',
    'width:calc(var(--o-daynight-size) * 1.875);height:var(--o-daynight-size);',
    'border-radius:999px;border:0;padding:0;',
    'background:var(--o-daynight-day);',
    'transition:background-color var(--o-duration-slow) var(--o-ease-standard);',
    '}',
    '[data-o-daynight][aria-checked="true"]{background:var(--o-daynight-night)}',

    // Le disque porte les deux dessins et glisse d un bord a l autre.
    '[data-o-daynight-thumb]{',
    'position:absolute;top:10%;left:5%;height:80%;aspect-ratio:1;',
    'transform:translateX(0);',
    'transition:transform var(--o-duration-slow) var(--o-ease-standard);',
    '}',
    '[data-o-daynight][aria-checked="true"] [data-o-daynight-thumb]{',
    'transform:translateX(calc(var(--o-daynight-size) * 0.875));',
    '}',
    '[data-o-daynight-thumb] svg{',
    'position:absolute;inset:0;width:100%;height:100%;',
    'transition:transform var(--o-duration-slow) var(--o-ease-standard),',
    'opacity var(--o-duration-slow) linear;',
    '}',
    // Rotation croisee : chaque astre arrive en tournant, part en tournant.
    '[data-o-daynight-sun]{color:var(--o-daynight-sunlight);opacity:1;transform:rotate(0deg)}',
    '[data-o-daynight-moon]{color:var(--o-daynight-moonlight);opacity:0;transform:rotate(-90deg)}',
    '[data-o-daynight][aria-checked="true"] [data-o-daynight-sun]{opacity:0;transform:rotate(90deg)}',
    '[data-o-daynight][aria-checked="true"] [data-o-daynight-moon]{opacity:1;transform:rotate(0deg)}',

    // Les etoiles s allument apres l arrivee de la lune.
    '[data-o-daynight-star]{',
    'position:absolute;border-radius:999px;background:var(--o-daynight-moonlight);',
    'width:calc(var(--o-daynight-size) * 0.08);height:calc(var(--o-daynight-size) * 0.08);',
    'opacity:0;transform:scale(0.4);',
    'transition:opacity var(--o-duration-slow) linear,',
    'transform var(--o-duration-slow) var(--o-ease-standard);',
    '}',
    '[data-o-daynight][aria-checked="true"] [data-o-daynight-star]{',
    'opacity:0.9;transform:scale(1);transition-delay:calc(var(--o-duration-slow) / 2);',
    '}',

    // Mouvement reduit : la bascule est instantanee, l etat reste lisible.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-daynight],[data-o-daynight-thumb],[data-o-daynight-thumb] svg,',
    '[data-o-daynight-star]{transition:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Positions des trois etoiles, en pourcentage de la piste. */
const STARS = [
  { left: '18%', top: '25%' },
  { left: '30%', top: '58%' },
  { left: '42%', top: '32%' },
] as const

/**
 * Interrupteur decoratif entre jour et nuit.
 *
 * @example
 * <ThemeSwitch defaultChecked={false} />
 *
 * @example
 * // Mode controle : la page ecoute, et applique son theme elle-meme.
 * <ThemeSwitch checked={nuit} onCheckedChange={setNuit} size={40} />
 */
export function ThemeSwitch({
  checked,
  defaultChecked = false,
  onCheckedChange,
  size = 32,
  label = 'Mode nuit',
  ...rest
}: ThemeSwitchProps): ReactElement {
  const { reduced } = useMotionState()
  const [internal, setInternal] = useState(defaultChecked)
  ensureSwitchRules()

  const isNight = checked ?? internal

  const toggle = (): void => {
    const next = !isNight
    if (checked === undefined) setInternal(next)
    onCheckedChange?.(next)
  }

  const { className, style } = mergePresentation({}, rest)

  return (
    <button
      type="button"
      {...rest}
      role="switch"
      aria-checked={isNight}
      aria-label={label}
      onClick={toggle}
      data-o-daynight=""
      className={className}
      style={
        {
          ...style,
          '--o-daynight-size': `${String(size)}px`,
          '--o-daynight-day': 'var(--o-palette-sky-400)',
          '--o-daynight-night': 'var(--o-palette-indigo-950)',
          '--o-daynight-sunlight': 'var(--o-palette-amber-400)',
          '--o-daynight-moonlight': 'var(--o-palette-zinc-50)',
          ...(reduced ? { '--o-duration-slow': '0ms' } : {}),
        } as CSSProperties
      }
    >
      <span data-o-daynight-thumb="" aria-hidden="true">
        <svg data-o-daynight-sun="" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="12" r="5" />
          <g stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="12" y1="2" x2="12" y2="4" />
            <line x1="12" y1="20" x2="12" y2="22" />
            <line x1="2" y1="12" x2="4" y2="12" />
            <line x1="20" y1="12" x2="22" y2="12" />
            <line x1="4.9" y1="4.9" x2="6.3" y2="6.3" />
            <line x1="17.7" y1="17.7" x2="19.1" y2="19.1" />
            <line x1="4.9" y1="19.1" x2="6.3" y2="17.7" />
            <line x1="17.7" y1="6.3" x2="19.1" y2="4.9" />
          </g>
        </svg>
        <svg data-o-daynight-moon="" viewBox="0 0 24 24" fill="currentColor">
          <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
        </svg>
      </span>
      {STARS.map((star) => (
        <span
          key={star.left}
          data-o-daynight-star=""
          aria-hidden="true"
          style={{ left: star.left, top: star.top }}
        />
      ))}
    </button>
  )
}
