/**
 * Nappe figee : quatre taches de couleur, sans shader et sans mouvement.
 *
 * ## Ce que la version figee garde de la nappe animee
 *
 * La nappe en shader melange ses taches en continu ; celle-ci les pose une fois
 * pour toutes, aux tiers du cadre, la ou une composition les attend. Pour une
 * page qui n'a pas besoin de mouvement — ou qui a deja depense sa surface
 * graphique ailleurs — le resultat au repos est indiscernable, et le cout tombe
 * a quatre degrades radiaux.
 *
 * ## Pourquoi la couche interne deborde du cadre
 *
 * Le flou est un filtre : il rend translucides les bords de ce qu'il floute.
 * Applique a une couche exactement ajustee, il ferait apparaitre un lisere du
 * fond tout autour. La couche interne deborde donc du rayon de flou de chaque
 * cote, et l'element racine recadre le surplus.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement } from 'react'

/** Proprietes propres au composant. */
export interface MeshStaticOwnProps {
  /** Intensite des taches, entre 0 et 1. @defaultValue 0.5 */
  strength?: number
  /** Rayon du flou, en pixels. Zero pour des taches nettes. @defaultValue 24 */
  blur?: number
  /** Couleur de la premiere tache. */
  color?: string
  /** Couleur de la deuxieme tache. */
  accent?: string
  /** Couleur de la troisieme tache. */
  tint?: string
  /** Couleur du fond. */
  background?: string
}

/** Toutes les proprietes. */
export type MeshStaticProps = Customisable<MeshStaticOwnProps>

/**
 * Nappe figee de fond.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <MeshStatic className="o-absolute o-inset-0" strength={0.4} />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function MeshStatic({
  strength = 0.5,
  blur = 24,
  color = 'var(--o-palette-brand-500, oklch(59.8% 0.198 275))',
  accent = 'var(--o-palette-fuchsia-500, oklch(66.7% 0.295 322.15))',
  tint = 'var(--o-palette-sky-500, oklch(68.5% 0.169 237.323))',
  background = 'var(--o-theme-bg, oklch(98.5% 0 0))',
  ...rest
}: MeshStaticProps): ReactElement {
  const mix = (base: string, portion: number): string =>
    `color-mix(in oklab, ${base} ${String(Math.round(strength * portion))}%, transparent)`

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  return (
    <div
      {...rest}
      className={className}
      style={{ ...style, backgroundColor: background } as CSSProperties}
      aria-hidden
    >
      <div
        style={{
          position: 'absolute',
          inset: `${String(-blur * 2)}px`,
          filter: blur > 0 ? `blur(${String(blur)}px)` : undefined,
          backgroundImage: [
            `radial-gradient(circle at 30% 32%, ${mix(color, 100)}, transparent 45%)`,
            `radial-gradient(circle at 70% 28%, ${mix(accent, 85)}, transparent 45%)`,
            `radial-gradient(circle at 30% 72%, ${mix(tint, 80)}, transparent 45%)`,
            `radial-gradient(circle at 70% 70%, ${mix(color, 55)}, transparent 42%)`,
          ].join(','),
        }}
      />
    </div>
  )
}
