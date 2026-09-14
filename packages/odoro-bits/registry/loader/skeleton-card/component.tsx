/**
 * Carte en attente : la carte est deja la — sa surface, son filet, ses
 * marges — et seul son contenu manque.
 *
 * ## Ce que la carte garde, et ce qu'elle perd
 *
 * `skeleton-lines` remplace un paragraphe : il n'y a rien autour de lui. Une
 * carte, elle, a un contenant, et ce contenant n'attend pas — il est deja
 * dessine, avec sa surface (`--o-theme-surface`) et son filet
 * (`--o-theme-line`). Ne dessiner que des blocs gris, sans carte autour,
 * ferait sauter la mise en page a l'arrivee du contenu : c'est le defaut
 * classique du squelette, promettre une hauteur et en livrer une autre.
 *
 * A l'interieur, la hierarchie est conservee : une image, un titre plus
 * epais, des lignes de texte, et un pied avec sa pastille. Un squelette qui
 * empile des barres identiques annonce « du contenu » ; celui-ci annonce
 * **ce** contenu-la.
 *
 * ## Reflet ou pulsation, sur les blocs seuls
 *
 * L'animation ne porte jamais sur la carte : un contenant qui clignote se
 * lit comme une erreur. Seuls les blocs vides bougent, en cascade avec le
 * reflet, ensemble avec la pulsation.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle ; les blocs sont retires de
 * l'arbre d'accessibilite. Sous mouvement reduit, ils restent pleins et
 * immobiles : la carte vide reste visible, elle ne s'efface pas.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-skeleton-card'

/** Largeur de la derniere ligne de texte, en pourcentage. */
const LAST_WIDTH = 58

/** Pose la carte, ses blocs et leur animation, une fois par document. */
function ensureSkeletonCardRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // La carte est un contenant reel : elle occupe deja la place que le
    // contenu prendra, filet compris.
    '[data-o-skcard]{',
    'display:block;width:100%;box-sizing:border-box;',
    'padding:1rem;border-radius:var(--o-skcard-radius);',
    'background:var(--o-theme-surface);',
    'border:1px solid var(--o-theme-line);',
    '}',
    '[data-o-skcard-body]{display:flex;flex-direction:column;gap:0.75rem}',
    '[data-o-skcard-text]{display:flex;flex-direction:column;gap:0.5rem}',
    '[data-o-skcard-foot]{display:flex;align-items:center;gap:0.6rem}',
    '[data-o-skcard-fill]{',
    'position:relative;display:block;overflow:hidden;',
    'border-radius:calc(var(--o-skcard-radius) * 0.6);',
    'background:color-mix(in oklab,var(--o-theme-line) 72%,var(--o-theme-surface));',
    '}',
    // L'image garde son rapport : c'est elle qui fixe la hauteur de la carte.
    '[data-o-skcard-media]{aspect-ratio:16/9;width:100%}',
    '[data-o-skcard-title]{height:1.1rem;width:70%}',
    '[data-o-skcard-line]{height:0.6rem}',
    '[data-o-skcard-avatar]{width:2rem;height:2rem;border-radius:50%;flex:none}',
    '[data-o-skcard-meta]{height:0.6rem;width:40%}',
    '[data-o-skcard-shimmer] [data-o-skcard-fill]::after{',
    'content:"";position:absolute;inset:0;',
    'background:linear-gradient(90deg,transparent 0 30%,color-mix(in oklab,var(--o-theme-surface) 85%,transparent) 50%,transparent 70% 100%);',
    'transform:translateX(-100%);',
    'animation:o-skcard-sweep var(--o-skcard-speed) linear infinite;',
    'animation-delay:var(--o-skcard-delay);',
    '}',
    '@keyframes o-skcard-sweep{to{transform:translateX(100%)}}',
    '[data-o-skcard-pulse] [data-o-skcard-fill]{',
    'animation:o-skcard-pulse var(--o-skcard-speed) ease-in-out infinite;',
    '}',
    '@keyframes o-skcard-pulse{0%,100%{opacity:1}50%{opacity:0.45}}',
    // La carte vide reste lisible, sans mouvement.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-skcard-fill]{animation:none;opacity:1}',
    '[data-o-skcard-shimmer] [data-o-skcard-fill]::after{animation:none;opacity:0}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface SkeletonCardOwnProps {
  /** Nombre de lignes de texte sous le titre. @defaultValue 2 */
  lines?: number
  /** Reserver la place d'une image en haut de la carte. @defaultValue true */
  media?: boolean
  /** Reserver la place d'un pied : pastille et legende. @defaultValue true */
  footer?: boolean
  /** Rayon des angles de la carte, en pixels. @defaultValue 14 */
  radius?: number
  /** Reflet qui traverse plutot qu'une pulsation d'ensemble. @defaultValue true */
  shimmer?: boolean
  /** Duree d'un passage du reflet ou d'une pulsation, en millisecondes. @defaultValue 1600 */
  speed?: number
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement de la carte' */
  label?: string
}

/** Toutes les proprietes. */
export type SkeletonCardProps = Customisable<SkeletonCardOwnProps, 'div'>

/**
 * Reserve la place d'une carte entiere pendant son chargement.
 *
 * @example
 * <SkeletonCard />
 *
 * @example
 * // Une carte de texte seul, pulsee.
 * <SkeletonCard media={false} lines={4} shimmer={false} />
 */
export function SkeletonCard({
  lines = 2,
  media = true,
  footer = true,
  radius = 14,
  shimmer = true,
  speed = 1600,
  label = 'Chargement de la carte',
  ...rest
}: SkeletonCardProps): ReactElement {
  ensureSkeletonCardRule()

  const count = Math.max(0, Math.round(lines))

  const { className, style } = mergePresentation({}, rest)

  const hostStyle = {
    ...style,
    '--o-skcard-radius': `${String(radius)}px`,
    '--o-skcard-speed': `${String(speed)}ms`,
  } as CSSProperties

  /** Retard du reflet, du haut de la carte vers son pied. */
  const delay = (rank: number): CSSProperties =>
    ({
      '--o-skcard-delay': `${String(Math.round((speed / 10) * rank))}ms`,
    }) as CSSProperties

  return (
    <div
      {...rest}
      className={className}
      style={hostStyle}
      data-o-skcard=""
      data-o-skcard-shimmer={shimmer ? '' : undefined}
      data-o-skcard-pulse={shimmer ? undefined : ''}
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-skcard-body="">
        {media ? (
          <span data-o-skcard-fill="" data-o-skcard-media="" style={delay(0)} />
        ) : null}
        <span data-o-skcard-fill="" data-o-skcard-title="" style={delay(1)} />
        {count > 0 ? (
          <span data-o-skcard-text="">
            {Array.from({ length: count }, (_, index) => (
              <span
                key={index}
                data-o-skcard-fill=""
                data-o-skcard-line=""
                style={
                  {
                    ...delay(2 + index),
                    // La derniere ligne s'arrete avant le bord : c'est ce
                    // qui fait lire un paragraphe et non un tableau.
                    width:
                      index === count - 1 && count > 1
                        ? `${String(LAST_WIDTH)}%`
                        : undefined,
                  } as CSSProperties
                }
              />
            ))}
          </span>
        ) : null}
        {footer ? (
          <span data-o-skcard-foot="">
            <span
              data-o-skcard-fill=""
              data-o-skcard-avatar=""
              style={delay(2 + count)}
            />
            <span data-o-skcard-fill="" data-o-skcard-meta="" style={delay(3 + count)} />
          </span>
        ) : null}
      </span>
    </div>
  )
}
