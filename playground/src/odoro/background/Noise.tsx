/**
 * Grain : un bruit de film statique, genere par un filtre SVG.
 *
 * ## Pourquoi un SVG en data-URI plutot qu'un canvas
 *
 * Le bruit est produit par `feTurbulence`, un generateur que le navigateur
 * embarque deja : le composant se contente de decrire le filtre dans un SVG
 * encode en data-URI et de le poser en image de fond. Rien ne s'execute apres
 * le premier rendu — pas de canvas a remplir pixel par pixel, pas de boucle,
 * pas de contexte graphique a reserver.
 *
 * ## Pourquoi le grain est monochrome par defaut
 *
 * `feTurbulence` produit un bruit colore, ou chaque canal tire sa propre
 * valeur. Sur une interface, ces confettis colores se remarquent ; un grain
 * desature se lit comme une matiere, pas comme un motif. Une matrice de
 * saturation nulle le neutralise, et un interrupteur rend la version colore a
 * qui la veut.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement } from 'react'

/** Proprietes propres au composant. */
export interface NoiseOwnProps {
  /** Opacite du grain, entre 0 et 1. @defaultValue 0.1 */
  opacity?: number
  /** Frequence de base du bruit. Plus haut, plus fin. @defaultValue 0.8 */
  scale?: number
  /** Desature le grain. @defaultValue true */
  monochrome?: boolean
}

/** Toutes les proprietes. */
export type NoiseProps = Customisable<NoiseOwnProps>

/**
 * Grain de fond.
 *
 * @example
 * <div className="o-relative o-min-h-screen">
 *   <Noise className="o-absolute o-inset-0" opacity={0.08} />
 *   <main className="o-relative">…</main>
 * </div>
 */
export function Noise({
  opacity = 0.1,
  scale = 0.8,
  monochrome = true,
  ...rest
}: NoiseProps): ReactElement {
  // Le SVG est reconstruit quand un reglage change : c'est une chaine, pas un
  // document, et le navigateur met l'image en cache par URI.
  const svg = [
    '<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180">',
    '<filter id="grain">',
    `<feTurbulence type="fractalNoise" baseFrequency="${String(scale)}" numOctaves="2" stitchTiles="stitch"/>`,
    monochrome ? '<feColorMatrix type="saturate" values="0"/>' : '',
    '</filter>',
    '<rect width="100%" height="100%" filter="url(#grain)"/>',
    '</svg>',
  ].join('')

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      className={className}
      style={
        {
          ...style,
          opacity,
          backgroundImage: `url("data:image/svg+xml,${encodeURIComponent(svg)}")`,
        } as CSSProperties
      }
      aria-hidden
    />
  )
}
