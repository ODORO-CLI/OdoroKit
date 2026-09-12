/**
 * Flou progressif au bord d'une zone defilante.
 *
 * ## Pourquoi plusieurs couches
 *
 * Un `backdrop-filter` prend une valeur, pas une rampe : une seule couche
 * donne un flou uniforme dont le bord interieur se voit comme un trait, et
 * masquer ce trait par un degrade d'opacite ne fait que rendre le flou
 * transparent — il reste aussi flou la ou on le voit encore.
 *
 * La rampe se fabrique donc en empilant des couches : chacune floute un peu
 * plus que la precedente, et n'est demasquee qu'a partir de sa propre tranche.
 * Le flou s'accumule vers le bord, sans aucune arete.
 *
 * ## L'effacement en fin de course
 *
 * Un voile de bas de zone dit « il y a autre chose dessous ». Le laisser en
 * place une fois le bas atteint est un mensonge, et c'est le defaut le plus
 * courant de ces bandeaux : on croit qu'il reste du texte alors qu'on est
 * arrive.
 *
 * L'opacite du voile suit donc la course restante. Elle est ecrite dans une
 * variable CSS depuis la boucle unique du moteur, jamais par un rendu React :
 * un ecouteur de defilement qui poserait un etat rendrait la page entiere a
 * chaque cran de molette.
 *
 * ## Sous mouvement reduit
 *
 * Rien ne change : le voile n'est pas du mouvement, et sa disparition suit une
 * position que la personne commande elle-meme.
 *
 * @module
 */

import {
  CLOCK_PRIORITY,
  clock,
  mergePresentation,
  type Customisable,
} from '@odoro-cli/engine'
import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Bord voile. */
export type BlurSide = 'bottom' | 'top' | 'left' | 'right'

/** Proprietes propres au composant. */
export interface GradualBlurOwnProps {
  /** Contenu de la zone. */
  children: ReactNode
  /** Bord voile. @defaultValue 'bottom' */
  side?: BlurSide
  /** Profondeur de la bande voilee, en pixels. @defaultValue 96 */
  size?: number
  /** Flou atteint tout au bord, en pixels. @defaultValue 10 */
  strength?: number
  /** Nombre de couches. @defaultValue 5 */
  layers?: number
  /** Teinte posee sur la bande, par-dessus le flou. */
  tint?: string
  /**
   * Fait de la zone un conteneur defilant, et efface le voile quand le bord
   * concerne est atteint.
   *
   * @defaultValue true
   */
  scrollable?: boolean
}

/** Toutes les proprietes. */
export type GradualBlurProps = Customisable<GradualBlurOwnProps>

/** Sens du degrade de masque, pour chaque bord. */
const MASK_DIRECTION: Readonly<Record<BlurSide, string>> = {
  bottom: 'to bottom',
  top: 'to top',
  left: 'to left',
  right: 'to right',
}

/** Position de la bande dans la zone, pour chaque bord. */
function bandBox(side: BlurSide, size: number): CSSProperties {
  const thickness = `${String(size)}px`
  if (side === 'bottom') return { left: 0, right: 0, bottom: 0, height: thickness }
  if (side === 'top') return { left: 0, right: 0, top: 0, height: thickness }
  if (side === 'left') return { top: 0, bottom: 0, left: 0, width: thickness }
  return { top: 0, bottom: 0, right: 0, width: thickness }
}

/**
 * Voile le bord d'une zone d'un flou progressif.
 *
 * @example
 * <GradualBlur className="o-h-64 o-rounded-xl">
 *   <article className="o-p-6">…</article>
 * </GradualBlur>
 *
 * @example
 * // Un flou lateral sur un rail d'images, sans conteneur defilant vertical.
 * <GradualBlur side="right" size={140} strength={16} className="o-h-40">
 *   <div className="o-flex o-gap-4">…</div>
 * </GradualBlur>
 */
export function GradualBlur({
  children,
  side = 'bottom',
  size = 96,
  strength = 10,
  layers = 5,
  tint = 'color-mix(in oklab, var(--o-theme-bg) 35%, transparent)',
  scrollable = true,
  ...rest
}: GradualBlurProps): ReactElement {
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null)
  const [veil, setVeil] = useState<HTMLDivElement | null>(null)

  useEffect(() => {
    if (!scrollable || scroller === null || veil === null) return

    const vertical = side === 'bottom' || side === 'top'
    let last = -1

    const subscription = clock.subscribe(
      () => {
        const travel = vertical
          ? scroller.scrollHeight - scroller.clientHeight
          : scroller.scrollWidth - scroller.clientWidth
        const position = vertical ? scroller.scrollTop : scroller.scrollLeft

        // La course restante du cote voile : en haut et a gauche, c'est le
        // chemin deja parcouru.
        const remaining =
          side === 'bottom' || side === 'right' ? travel - position : position

        // Le voile s'efface sur la derniere profondeur de bande : au-dela, il
        // est plein, et il ne reste rien a annoncer une fois le bord atteint.
        const next = travel <= 0 ? 0 : Math.min(1, Math.max(0, remaining / size))
        if (Math.abs(next - last) < 0.01) return
        last = next
        veil.style.setProperty('--o-blur-veil', next.toFixed(2))
      },
      // Une mesure de mise en page, avant le rendu de la meme image.
      { priority: CLOCK_PRIORITY.layout, name: 'flou de bord' },
    )

    return () => subscription.unsubscribe()
  }, [scrollable, scroller, veil, side, size])

  const count = Math.max(2, Math.round(layers))
  const direction = MASK_DIRECTION[side]

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  return (
    <div {...rest} className={className} style={style}>
      <div
        ref={setScroller}
        className={scrollable ? 'o-size-full o-overflow-auto' : 'o-size-full'}
      >
        {children}
      </div>

      <div
        aria-hidden
        ref={setVeil}
        style={{
          position: 'absolute',
          pointerEvents: 'none',
          opacity: 'var(--o-blur-veil, 1)',
          ...bandBox(side, size),
        }}
      >
        {Array.from({ length: count }, (_, index) => {
          const start = (index / count) * 100
          const end = ((index + 1) / count) * 100
          return (
            <div
              key={index}
              style={{
                position: 'absolute',
                inset: 0,
                backdropFilter: `blur(${(((index + 1) / count) * strength).toFixed(2)}px)`,
                // Chaque couche n'apparait qu'a partir de sa propre tranche :
                // les flous s'additionnent vers le bord au lieu de se
                // remplacer.
                maskImage: `linear-gradient(${direction}, transparent ${start.toFixed(1)}%, black ${end.toFixed(1)}%)`,
                WebkitMaskImage: `linear-gradient(${direction}, transparent ${start.toFixed(1)}%, black ${end.toFixed(1)}%)`,
              }}
            />
          )
        })}

        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `linear-gradient(${direction}, transparent, ${tint})`,
          }}
        />
      </div>
    </div>
  )
}
