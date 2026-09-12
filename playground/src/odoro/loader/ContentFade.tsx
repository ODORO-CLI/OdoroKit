/**
 * Contenu en fondu : le vrai contenu, revele section par section, chacune
 * un peu apres la precedente.
 *
 * ## L'autre moitie du squelette
 *
 * Un squelette dit l'attente ; il ne dit rien de l'arrivee. Or c'est
 * l'arrivee qui se voit : dix blocs qui deviennent dix vrais paragraphes
 * dans la meme image, c'est un a-coup, et l'oeil ne sait plus ou il en
 * etait. Ce composant est la moitie manquante — il enveloppe le contenu
 * **reel** et le laisse paraitre dans l'ordre de la lecture.
 *
 * Rien n'est simule ici : les enfants sont dans le document des le premier
 * rendu, avec leur texte, leurs liens et leur mise en page. Seule leur
 * apparition est retardee. Un composant qui remplacerait le contenu par des
 * blocs le temps du fondu ferait sortir puis rentrer le texte de l'arbre
 * d'accessibilite pour rien.
 *
 * ## Un fondu qui ne se rejoue pas
 *
 * L'animation est declaree `forwards` et ne boucle pas : elle amene a
 * l'etat final et s'y tient. Une reprise en boucle transformerait un
 * passage en clignotement, et un contenu qui clignote se lit comme un
 * defaut, pas comme une arrivee.
 *
 * Le decalage vertical est court — quatorze pixels par defaut. Au-dela, le
 * mouvement devient une entree de scene, et une entree de scene sur un
 * paragraphe de texte se remarque plus que le paragraphe.
 *
 * ## Un statut a cote, pas autour
 *
 * Le libelle vit dans une zone `role="status"` qui lui est propre, a cote
 * du contenu et non autour : une region vivante qui contiendrait toute la
 * page ferait annoncer chaque section a mesure qu'elle parait.
 *
 * Sous mouvement reduit, tout est visible immediatement, a sa place
 * definitive : c'est l'etat final, celui vers lequel le fondu allait.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { Children, type CSSProperties, type ReactElement, type ReactNode } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-content-fade'

/** Pose le fondu des sections, une fois par document. */
function ensureContentFadeRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-cfade]{display:block;width:100%}',
    '[data-o-cfade-part]{',
    'display:block;opacity:0;transform:translateY(var(--o-cfade-shift));',
    // `forwards` : l'etat final est tenu, le fondu ne se rejoue jamais.
    'animation:o-cfade-in var(--o-cfade-speed) var(--o-ease-standard) var(--o-cfade-delay) forwards;',
    '}',
    '@keyframes o-cfade-in{to{opacity:1;transform:none}}',
    // L'etat final, tout de suite : c'est bien la ou le fondu allait.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-cfade-part]{animation:none;opacity:1;transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface ContentFadeOwnProps {
  /** Les sections a reveler, dans l'ordre ou elles doivent paraitre. */
  children?: ReactNode
  /** Duree du fondu d'une section, en millisecondes. @defaultValue 650 */
  speed?: number
  /** Ecart entre deux sections, en millisecondes. @defaultValue 140 */
  stagger?: number
  /** Attente avant la premiere section, en millisecondes. @defaultValue 0 */
  delay?: number
  /** Distance parcourue par une section en paraissant, en pixels. @defaultValue 14 */
  shift?: number
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Contenu en cours d affichage' */
  label?: string
}

/** Toutes les proprietes. */
export type ContentFadeProps = Customisable<ContentFadeOwnProps, 'div'>

/**
 * Revele du contenu reel, section par section.
 *
 * @example
 * <ContentFade>
 *   <h2>Titre</h2>
 *   <p>Premier paragraphe.</p>
 *   <p>Second paragraphe.</p>
 * </ContentFade>
 *
 * @example
 * // Une arrivee plus lente, apres une demi-seconde d'attente.
 * <ContentFade speed={900} stagger={220} delay={500}>{sections}</ContentFade>
 */
export function ContentFade({
  children,
  speed = 650,
  stagger = 140,
  delay = 0,
  shift = 14,
  label = 'Contenu en cours d affichage',
  ...rest
}: ContentFadeProps): ReactElement {
  ensureContentFadeRule()

  // `toArray` plutot que `map` : il ecarte les vides et pose des cles
  // stables, sans quoi une section conditionnelle decalerait tout le rythme.
  const parts = Children.toArray(children)

  const { className, style } = mergePresentation({}, rest)

  const hostStyle = {
    ...style,
    '--o-cfade-speed': `${String(speed)}ms`,
    '--o-cfade-shift': `${String(shift)}px`,
  } as CSSProperties

  return (
    <div {...rest} className={className} style={hostStyle} data-o-cfade="">
      <span className="o-sr-only" role="status">
        {label}
      </span>
      {parts.map((part, index) => (
        <span
          // La cle est l'index : l'ordre des sections est precisement ce qui
          // porte le rythme, et il ne se reordonne pas.
          key={index}
          data-o-cfade-part=""
          style={
            {
              '--o-cfade-delay': `${String(delay + stagger * index)}ms`,
            } as CSSProperties
          }
        >
          {part}
        </span>
      ))}
    </div>
  )
}
