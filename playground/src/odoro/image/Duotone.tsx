/**
 * Bichromie : l'image est rendue en deux tons, et revient en couleurs au
 * survol.
 *
 * ## Deux calques de teinte sur une image desaturee
 *
 * L'image passe d'abord en niveaux de gris, avec un contraste legerement
 * releve — une bichromie sur une image molle donne deux tons gris. Au-dessus,
 * deux calques de couleur pleins font le travail :
 *
 * - un calque **ombre** en `mix-blend-mode: screen` releve les noirs vers le
 *   ton sombre choisi — l'eclaircissement n'agit que sur les zones sombres ;
 * - un calque **lumiere** en `mix-blend-mode: multiply` rabat les blancs vers
 *   le ton clair — l'assombrissement n'agit que sur les zones claires.
 *
 * Aucun traitement d'image, aucune copie : deux `div` pleins et le
 * compositeur.
 *
 * ## Le retour en couleurs est une transition, pas un remplacement
 *
 * Au survol ou au focus, le filtre de l'image tombe et les calques
 * s'eteignent — deux proprietes animables, `filter` et `opacity`, la ou un
 * `mix-blend-mode` ne s'anime pas. L'interrupteur `hover` desactive ce
 * retour pour une bichromie permanente.
 *
 * ## Sous mouvement reduit
 *
 * La bichromie et son retour en couleurs restent : c'est un changement
 * d'etat, pas un mouvement. Seule la transition disparait — le passage est
 * instantane.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-duotone'

/**
 * Pose les regles du retour en couleurs, une fois par document.
 *
 * Elles ne peuvent pas etre des styles en ligne : elles dependent du survol
 * du cadre, pas de celui des calques.
 */
function ensureDuotoneRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-duotone]:hover img,[data-o-duotone]:focus-within img{filter:none}',
    '[data-o-duotone]:hover [data-o-duotone-tint],',
    '[data-o-duotone]:focus-within [data-o-duotone-tint]{opacity:0}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface DuotoneOwnProps {
  /** Source de l'image. */
  src: string
  /** Texte de remplacement. Chaine vide si l'image est purement decorative. */
  alt: string
  /** Rapport largeur sur hauteur. @defaultValue 1.777 */
  ratio?: number
  /** Force de la bichromie, de 0 a 1. @defaultValue 1 */
  strength?: number
  /** Revenir en couleurs au survol et au focus. @defaultValue true */
  hover?: boolean
  /**
   * Ton des ombres.
   *
   * Une valeur, pas une couleur en dur : ecrite en clair elle echapperait au
   * theme.
   *
   * @defaultValue le plus sombre des indigos
   */
  shadow?: string
  /** Ton des lumieres. @defaultValue un ambre clair */
  light?: string
}

/** Toutes les proprietes : les siennes, plus celles d'une image. */
export type DuotoneProps = Customisable<DuotoneOwnProps, 'img'>

/**
 * Rend une image en deux tons.
 *
 * @example
 * <Duotone src="/photo.jpg" alt="Vue de l atelier" />
 *
 * @example
 * // Bichromie permanente dans la teinte de marque.
 * <Duotone
 *   src="/photo.jpg"
 *   alt=""
 *   hover={false}
 *   shadow="var(--o-palette-brand-950)"
 *   light="var(--o-palette-brand-200)"
 * />
 */
export function Duotone({
  src,
  alt,
  ratio = 1.777,
  strength = 1,
  hover = true,
  shadow = 'var(--o-palette-indigo-950)',
  light = 'var(--o-palette-amber-200)',
  ...rest
}: DuotoneProps): ReactElement {
  const { reduced } = useMotionState()
  ensureDuotoneRule()

  const force = Math.min(1, Math.max(0, strength))

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  // Sous mouvement reduit le passage est instantane ; la bichromie, elle,
  // reste — c'est un etat, pas un mouvement.
  const transition = reduced
    ? undefined
    : 'filter var(--o-duration-slow) var(--o-ease-standard), opacity var(--o-duration-slow) var(--o-ease-standard)'

  const image: CSSProperties = {
    filter: `grayscale(${String(force)}) contrast(${String(1 + 0.15 * force)})`,
    transition,
  }

  const tint = (colour: string, blend: 'screen' | 'multiply'): CSSProperties => ({
    background: colour,
    mixBlendMode: blend,
    opacity: force,
    transition,
  })

  return (
    <div
      className={className}
      style={{ ...style, aspectRatio: String(ratio) }}
      data-o-duotone={hover ? '' : undefined}
    >
      <img
        {...rest}
        src={src}
        alt={alt}
        className="o-size-full o-object-cover"
        style={image}
      />

      {/* Les calques sont decoratifs et hors d'atteinte du pointeur : le
          survol appartient au cadre. */}
      <div
        aria-hidden
        data-o-duotone-tint=""
        className="o-absolute o-inset-0 o-pointer-events-none"
        style={tint(shadow, 'screen')}
      />
      <div
        aria-hidden
        data-o-duotone-tint=""
        className="o-absolute o-inset-0 o-pointer-events-none"
        style={tint(light, 'multiply')}
      />
    </div>
  )
}
