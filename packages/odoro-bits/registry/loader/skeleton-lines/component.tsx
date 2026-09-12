/**
 * Lignes en attente : un paragraphe remplace par ses lignes, la derniere
 * plus courte comme une vraie fin de texte.
 *
 * ## Un substitut, pas une encre
 *
 * Les autres chargeurs sont dessines a `currentColor` : ils empruntent
 * l'encre du texte parce qu'ils sont un signe, un symbole pose dans la page.
 * Un squelette n'est pas un signe, c'est une **surface** — la place que le
 * contenu occupera. Il se peint donc avec les variables de theme, un melange
 * de filet et de surface, et non avec l'encre : sur fond clair comme sur
 * fond sombre, il reste ce qu'il est, une zone vide un peu plus dense que
 * la page.
 *
 * La derniere ligne est raccourcie. Sans elle, le bloc se lit comme une
 * grille, pas comme du texte : c'est ce raccourci qui fait reconnaitre un
 * paragraphe avant meme qu'il arrive.
 *
 * ## Reflet ou pulsation, jamais les deux
 *
 * `shimmer` choisit entre un reflet qui traverse les lignes en cascade et
 * une pulsation d'ensemble. Le reflet donne un sens de lecture — quelque
 * chose arrive, de gauche a droite ; la pulsation dit seulement « pas
 * encore ». Les superposer produirait un scintillement que l'oeil suit au
 * lieu de lire.
 *
 * Le decalage entre les lignes est **positif**, contrairement aux chargeurs
 * a points : ici le bloc est deja visible sans son animation, aucune ligne
 * n'attend son tour pour exister. Le decalage sert la cascade, pas la
 * premiere image.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle ; les lignes sont retirees
 * de l'arbre d'accessibilite. Sous mouvement reduit, elles restent pleines
 * et immobiles : un squelette au repos reste visible, il ne s'efface pas —
 * il n'y a rien d'autre a montrer tant que le contenu n'est pas la.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-skeleton-lines'

/** Largeur de la derniere ligne, en pourcentage de la colonne. */
const LAST_WIDTH = 62

/** Pose les lignes, le reflet et la pulsation, une fois par document. */
function ensureSkeletonLinesRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // En bloc : le squelette prend la largeur de son parent, comme le
    // paragraphe qu'il remplace.
    '[data-o-sklines]{display:block;width:100%}',
    '[data-o-sklines-rows]{display:flex;flex-direction:column;gap:var(--o-sklines-gap)}',
    '[data-o-sklines-row]{',
    'position:relative;display:block;overflow:hidden;',
    'height:var(--o-sklines-height);border-radius:var(--o-sklines-radius);',
    // Le filet donne la densite, la surface l'eclaircit : le melange tient
    // en clair comme en sombre, sans jamais devenir une encre.
    'background:color-mix(in oklab,var(--o-theme-line) 72%,var(--o-theme-surface));',
    '}',
    // Le reflet est une bande de surface qui traverse la ligne.
    '[data-o-sklines-shimmer] [data-o-sklines-row]::after{',
    'content:"";position:absolute;inset:0;',
    'background:linear-gradient(90deg,transparent 0 30%,color-mix(in oklab,var(--o-theme-surface) 85%,transparent) 50%,transparent 70% 100%);',
    'transform:translateX(-100%);',
    'animation:o-sklines-sweep var(--o-sklines-speed) linear infinite;',
    'animation-delay:var(--o-sklines-delay);',
    '}',
    '@keyframes o-sklines-sweep{to{transform:translateX(100%)}}',
    '[data-o-sklines-pulse] [data-o-sklines-row]{',
    'animation:o-sklines-pulse var(--o-sklines-speed) ease-in-out infinite;',
    'animation-delay:var(--o-sklines-delay);',
    '}',
    '@keyframes o-sklines-pulse{0%,100%{opacity:1}50%{opacity:0.45}}',
    // Des lignes pleines et immobiles : la place reste dite.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-sklines-row]{animation:none;opacity:1}',
    '[data-o-sklines-shimmer] [data-o-sklines-row]::after{animation:none;opacity:0}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface SkeletonLinesOwnProps {
  /** Nombre de lignes. @defaultValue 3 */
  lines?: number
  /** Epaisseur d'une ligne, en pixels. @defaultValue 12 */
  height?: number
  /** Rayon des angles d'une ligne, en pixels. @defaultValue 6 */
  radius?: number
  /** Reflet qui traverse plutot qu'une pulsation d'ensemble. @defaultValue true */
  shimmer?: boolean
  /** Duree d'un passage du reflet ou d'une pulsation, en millisecondes. @defaultValue 1600 */
  speed?: number
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement du contenu' */
  label?: string
}

/** Toutes les proprietes. */
export type SkeletonLinesProps = Customisable<SkeletonLinesOwnProps, 'div'>

/**
 * Remplace un paragraphe par ses lignes en attente.
 *
 * @example
 * <SkeletonLines lines={4} />
 *
 * @example
 * // Pulsation plutot que reflet, lignes plus epaisses.
 * <SkeletonLines lines={2} height={16} shimmer={false} />
 */
export function SkeletonLines({
  lines = 3,
  height = 12,
  radius = 6,
  shimmer = true,
  speed = 1600,
  label = 'Chargement du contenu',
  ...rest
}: SkeletonLinesProps): ReactElement {
  ensureSkeletonLinesRule()

  const count = Math.max(1, Math.round(lines))

  const { className, style } = mergePresentation({}, rest)

  const hostStyle = {
    ...style,
    '--o-sklines-height': `${String(height)}px`,
    '--o-sklines-gap': `${String(Math.round(height * 0.85))}px`,
    '--o-sklines-radius': `${String(radius)}px`,
    '--o-sklines-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <div
      {...rest}
      className={className}
      style={hostStyle}
      data-o-sklines=""
      data-o-sklines-shimmer={shimmer ? '' : undefined}
      data-o-sklines-pulse={shimmer ? undefined : ''}
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-sklines-rows="">
        {Array.from({ length: count }, (_, index) => (
          <span
            key={index}
            data-o-sklines-row=""
            style={
              {
                // Un huitieme de cycle par ligne : la cascade se voit sans
                // que la derniere ligne attende tout un tour.
                '--o-sklines-delay': `${String(Math.round((speed / 8) * index))}ms`,
                // Seule la derniere ligne est courte : c'est elle qui fait
                // lire un paragraphe et non une grille.
                width:
                  index === count - 1 && count > 1 ? `${String(LAST_WIDTH)}%` : undefined,
              } as CSSProperties
            }
          />
        ))}
      </span>
    </div>
  )
}
