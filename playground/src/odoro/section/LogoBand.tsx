/**
 * Bandeau de logos.
 *
 * ## Ce que cette section ajoute, et pourquoi c'est peu
 *
 * Le defilement sans fin vient de `effect/marquee`. Cette section n'apporte
 * qu'une mise en page et un intitule — et c'est deliberement tout ce qu'elle
 * fait.
 *
 * Une section qui reimplementerait le defilement aurait deux versions de la
 * meme mecanique a maintenir, qui divergeraient au premier correctif. Le
 * registre resout la dependance et installe les deux : c'est exactement ce que
 * le graphe existe pour faire.
 *
 * ## L'intitule est un vrai titre
 *
 * Une rangee de logos sans intitule ne dit rien a qui ne voit pas les images.
 * Le titre porte donc le sens — « ils nous font confiance », « integrations
 * disponibles » — et la rangee est decrite comme une liste.
 *
 * @module
 */

import { mergePresentation, type Customisable } from 'odoro-engine'
import { Children, type ReactElement, type ReactNode } from 'react'

import { Marquee } from '@/odoro/effect/Marquee'

/** Proprietes propres au composant. */
export interface LogoBandOwnProps {
  /** Les logos. */
  children: ReactNode
  /** Intitule affiche au-dessus. */
  title?: ReactNode
  /** Vitesse du defilement. @defaultValue 40 */
  speed?: number
}

/** Toutes les proprietes. */
export type LogoBandProps = Customisable<LogoBandOwnProps, 'section'>

/**
 * Fait defiler une rangee de logos.
 *
 * @example
 * <LogoBand title="Ils nous font confiance" speed={30}>
 *   {clients.map((client) => (
 *     <img key={client.nom} src={client.logo} alt={client.nom} className="o-h-8" />
 *   ))}
 * </LogoBand>
 */
export function LogoBand({
  children,
  title,
  speed = 40,
  ...rest
}: LogoBandProps): ReactElement {
  const logos = Children.toArray(children)

  const { className, style } = mergePresentation(
    { className: 'o-flex o-flex-col o-gap-6 o-py-10' },
    rest,
  )

  return (
    <section {...rest} className={className} style={style}>
      {title === undefined ? null : (
        <h2 className="o-text-center o-text-sm o-font-medium o-tracking-wide o-text-zinc-500 dark:o-text-zinc-400">
          {title}
        </h2>
      )}

      <Marquee speed={speed} className="o-w-full">
        <ul className="o-flex o-items-center">
          {logos.map((logo, index) => (
            <li key={index} className="o-flex o-shrink-0 o-items-center o-px-8">
              {logo}
            </li>
          ))}
        </ul>
      </Marquee>
    </section>
  )
}
