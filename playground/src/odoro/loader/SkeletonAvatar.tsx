/**
 * Avatar en attente : un disque et ses lignes a cote, le motif d'une
 * identite qui n'est pas encore arrivee.
 *
 * ## Le disque d'abord, et pourquoi il est rond
 *
 * C'est la forme qui fait reconnaitre le motif : un rond suivi de deux
 * lignes se lit « quelqu'un » avant qu'aucun nom ne soit la. Les blocs
 * rectangulaires de `skeleton-lines` ne le disent pas, et une carte entiere
 * en dit trop. Ce squelette-ci est celui d'un en-tete d'auteur, d'un fil de
 * commentaires, d'une liste de membres.
 *
 * La premiere ligne est plus courte et plus epaisse que la seconde : un nom
 * puis un role, pas deux phrases. Sans cette difference, le motif redevient
 * un paragraphe.
 *
 * ## Plusieurs lignes de la liste, un seul rythme
 *
 * `rows` repete le motif : une liste de personnes en attente. Le retard du
 * reflet suit la lecture, de haut en bas et de gauche a droite, pour que la
 * liste se parcoure comme une liste et non comme un clignotement collectif.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle ; les blocs sont retires de
 * l'arbre d'accessibilite. Sous mouvement reduit, ils restent pleins et
 * immobiles : la place reste tenue, elle ne s'efface pas.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-skeleton-avatar'

/** Largeurs des lignes, de la premiere a la derniere, en pourcentage. */
const WIDTHS = [45, 70, 60, 52] as const

/** Pose le disque, ses lignes et leur animation, une fois par document. */
function ensureSkeletonAvatarRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-skav]{display:flex;flex-direction:column;gap:1rem;width:100%}',
    // Le disque ne se comprime jamais : c'est lui qui porte le motif.
    '[data-o-skav-row]{display:flex;align-items:center;gap:0.85rem}',
    '[data-o-skav-stack]{display:flex;flex-direction:column;gap:0.5rem;flex:1 1 auto;min-width:0}',
    '[data-o-skav-fill]{',
    'position:relative;display:block;overflow:hidden;',
    'background:color-mix(in oklab,var(--o-theme-line) 72%,var(--o-theme-surface));',
    '}',
    '[data-o-skav-disc]{',
    'flex:none;border-radius:50%;',
    'width:var(--o-skav-size);height:var(--o-skav-size);',
    '}',
    '[data-o-skav-line]{',
    'height:var(--o-skav-line);border-radius:var(--o-skav-radius);',
    '}',
    // La premiere ligne porte le nom : plus epaisse que les suivantes.
    '[data-o-skav-stack] [data-o-skav-line]:first-child{height:calc(var(--o-skav-line) * 1.35)}',
    '[data-o-skav-shimmer] [data-o-skav-fill]::after{',
    'content:"";position:absolute;inset:0;',
    'background:linear-gradient(90deg,transparent 0 30%,color-mix(in oklab,var(--o-theme-surface) 85%,transparent) 50%,transparent 70% 100%);',
    'transform:translateX(-100%);',
    'animation:o-skav-sweep var(--o-skav-speed) linear infinite;',
    'animation-delay:var(--o-skav-delay);',
    '}',
    '@keyframes o-skav-sweep{to{transform:translateX(100%)}}',
    '[data-o-skav-pulse] [data-o-skav-fill]{',
    'animation:o-skav-pulse var(--o-skav-speed) ease-in-out infinite;',
    'animation-delay:var(--o-skav-delay);',
    '}',
    '@keyframes o-skav-pulse{0%,100%{opacity:1}50%{opacity:0.45}}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-skav-fill]{animation:none;opacity:1}',
    '[data-o-skav-shimmer] [data-o-skav-fill]::after{animation:none;opacity:0}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface SkeletonAvatarOwnProps {
  /** Nombre de personnes en attente. @defaultValue 1 */
  rows?: number
  /** Nombre de lignes a cote du disque. @defaultValue 2 */
  lines?: number
  /** Diametre du disque, en pixels. @defaultValue 44 */
  size?: number
  /** Rayon des angles des lignes, en pixels. @defaultValue 6 */
  radius?: number
  /** Reflet qui traverse plutot qu'une pulsation d'ensemble. @defaultValue true */
  shimmer?: boolean
  /** Duree d'un passage du reflet ou d'une pulsation, en millisecondes. @defaultValue 1600 */
  speed?: number
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement du profil' */
  label?: string
}

/** Toutes les proprietes. */
export type SkeletonAvatarProps = Customisable<SkeletonAvatarOwnProps, 'div'>

/**
 * Reserve la place d'un avatar et de son identite.
 *
 * @example
 * <SkeletonAvatar />
 *
 * @example
 * // Une liste de membres, en pulsation.
 * <SkeletonAvatar rows={4} size={36} shimmer={false} />
 */
export function SkeletonAvatar({
  rows = 1,
  lines = 2,
  size = 44,
  radius = 6,
  shimmer = true,
  speed = 1600,
  label = 'Chargement du profil',
  ...rest
}: SkeletonAvatarProps): ReactElement {
  ensureSkeletonAvatarRule()

  const rowCount = Math.max(1, Math.round(rows))
  const lineCount = Math.max(1, Math.round(lines))

  const { className, style } = mergePresentation({}, rest)

  const hostStyle = {
    ...style,
    '--o-skav-size': `${String(size)}px`,
    // Les lignes sont dimensionnees par le disque : le motif tient a ses
    // proportions, pas a deux reglages qui pourraient diverger.
    '--o-skav-line': `${String(Math.round(size * 0.18))}px`,
    '--o-skav-radius': `${String(radius)}px`,
    '--o-skav-speed': `${String(speed)}ms`,
  } as CSSProperties

  /** Retard du reflet, dans l'ordre de lecture de la liste. */
  const delay = (rank: number): CSSProperties =>
    ({ '--o-skav-delay': `${String(Math.round((speed / 10) * rank))}ms` }) as CSSProperties

  return (
    <div
      {...rest}
      className={className}
      style={hostStyle}
      data-o-skav=""
      data-o-skav-shimmer={shimmer ? '' : undefined}
      data-o-skav-pulse={shimmer ? undefined : ''}
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      {Array.from({ length: rowCount }, (_, row) => (
        <span key={row} aria-hidden data-o-skav-row="">
          <span
            data-o-skav-fill=""
            data-o-skav-disc=""
            style={delay(row * (lineCount + 1))}
          />
          <span data-o-skav-stack="">
            {Array.from({ length: lineCount }, (_, line) => (
              <span
                key={line}
                data-o-skav-fill=""
                data-o-skav-line=""
                style={
                  {
                    ...delay(row * (lineCount + 1) + line + 1),
                    width: `${String(WIDTHS[line % WIDTHS.length] ?? 60)}%`,
                  } as CSSProperties
                }
              />
            ))}
          </span>
        </span>
      ))}
    </div>
  )
}
