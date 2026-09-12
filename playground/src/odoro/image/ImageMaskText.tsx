/**
 * Image dans le texte : le mot est rempli par la photo, le reste du cadre est
 * voile, et un halo ouvre le voile la ou passe le pointeur.
 *
 * ## Trois calques, et une seule image telechargee
 *
 * L'image reelle est au fond, avec son texte de remplacement : c'est elle que
 * lisent les technologies d'assistance, et c'est elle qui reste si le
 * decoupage par le texte n'est pas supporte. Au-dessus, un voile de la
 * couleur de fond du theme la retient. Au-dessus encore, le mot — du vrai
 * texte dans le document — porte la meme source en fond et la retient dans
 * ses lettres par `background-clip: text`.
 *
 * Le navigateur ne telecharge la source qu'une fois : le fond du texte et
 * l'image partagent la meme entree de cache.
 *
 * ## Pourquoi un halo plutot qu'un voile uniforme
 *
 * Un voile plein donne un logotype : joli, mais mort. Le halo est un degrade
 * radial dont le centre est ecrit en deux variables CSS depuis l'evenement de
 * pointeur — aucun rendu React — et il rend a la photo un disque autour du
 * geste. Le mot reste lisible partout, la photo se devine autour.
 *
 * ## Ce que le repli garantit
 *
 * Sans `background-clip: text`, un texte transparent serait un texte absent.
 * Une regle `@supports` rend alors au mot l'encre du theme et lui retire son
 * fond : la composition perd son effet, jamais son contenu.
 *
 * ## Sous mouvement reduit
 *
 * Le halo est ferme et le cadre ne s'abonne a rien : il reste l'image, son
 * voile et le mot rempli par la photo — l'etat final de la composition, pas
 * son etat d'attente.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-image-mask-text'

/**
 * Pose les regles de la composition, une fois par document.
 *
 * Elles ne peuvent pas etre des styles en ligne : le decoupage prefixe et la
 * regle `@supports` n'existent pas dans l'attribut `style`.
 */
function ensureMaskTextRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // La taille du mot est exprimee en pour cent de la largeur du cadre :
    // pose dans une colonne etroite, la composition garde ses proportions.
    '[data-o-mask-text]{container-type:inline-size}',
    '[data-o-mt-ink]{',
    'background-image:var(--o-mt-src);background-size:cover;',
    'background-position:center;',
    'font-size:calc(var(--o-mt-size) * 1cqw);line-height:1;',
    '-webkit-background-clip:text;background-clip:text;',
    'color:transparent;',
    '}',
    // Voir l'en-tete : un texte transparent sans decoupage est un texte
    // absent. Le repli lui rend l'encre du theme.
    '@supports not ((-webkit-background-clip:text) or (background-clip:text)){',
    '[data-o-mt-ink]{background-image:none;color:var(--o-theme-fg)}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface ImageMaskTextOwnProps {
  /** Source de l'image. */
  src: string
  /** Texte de remplacement de l'image. */
  alt: string
  /** Le mot rempli par l'image. */
  text: string
  /** Rapport largeur sur hauteur du cadre. @defaultValue 1.777 */
  ratio?: number
  /**
   * Taille du mot, en pour cent de la largeur du cadre.
   *
   * Pas en pixels : la composition doit tenir dans sa colonne quelle qu'en
   * soit la largeur.
   *
   * @defaultValue 18
   */
  size?: number
  /** Opacite du voile pose sur l'image, de 0 a 1. @defaultValue 0.92 */
  veil?: number
  /** Rayon du halo qui ouvre le voile, en pixels. Zero le supprime. @defaultValue 190 */
  halo?: number
}

/** Toutes les proprietes : les siennes, plus celles d'une image. */
export type ImageMaskTextProps = Customisable<ImageMaskTextOwnProps, 'img'>

/**
 * Remplit un mot avec une image, sous un voile perce par le pointeur.
 *
 * @example
 * <ImageMaskText src="/atelier.jpg" alt="Vue de l atelier" text="ODORO" />
 *
 * @example
 * // Voile plus leger, sans halo : un titre pose sur la photo.
 * <ImageMaskText src="/atelier.jpg" alt="" text="2026" veil={0.6} halo={0} />
 */
export function ImageMaskText({
  src,
  alt,
  text,
  ratio = 1.777,
  size = 18,
  veil = 0.92,
  halo = 190,
  ...rest
}: ImageMaskTextProps): ReactElement {
  const { reduced } = useMotionState()
  ensureMaskTextRule()

  const cover = Math.min(1, Math.max(0, veil))
  // Le halo n'a pas de sens sans pointeur qui le promene : sous mouvement
  // reduit, le voile redevient uniforme.
  const radius = reduced ? 0 : Math.max(0, halo)

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  const hostStyle = {
    ...style,
    aspectRatio: String(ratio),
    // Les guillemets de la source sont neutralises : une apostrophe double
    // dans un nom de fichier fermerait la fonction `url` et emporterait la
    // declaration entiere.
    '--o-mt-src': `url("${src.replaceAll('"', '%22')}")`,
    '--o-mt-size': String(Math.max(1, size)),
    '--o-mt-x': '50%',
    '--o-mt-y': '50%',
  } as CSSProperties

  return (
    <div
      className={className}
      style={hostStyle}
      data-o-mask-text=""
      onPointerMove={
        radius === 0
          ? undefined
          : (event) => {
              // Le centre du halo en pourcentage du cadre : deux ecritures de
              // variable, aucun rendu React pendant le geste.
              const box = event.currentTarget.getBoundingClientRect()
              const x = ((event.clientX - box.left) / Math.max(box.width, 1)) * 100
              const y = ((event.clientY - box.top) / Math.max(box.height, 1)) * 100
              event.currentTarget.style.setProperty('--o-mt-x', `${x.toFixed(1)}%`)
              event.currentTarget.style.setProperty('--o-mt-y', `${y.toFixed(1)}%`)
            }
      }
      onPointerLeave={
        radius === 0
          ? undefined
          : (event) => {
              event.currentTarget.style.setProperty('--o-mt-x', '50%')
              event.currentTarget.style.setProperty('--o-mt-y', '50%')
            }
      }
    >
      <img
        loading="lazy"
        decoding="async"
        {...rest}
        src={src}
        alt={alt}
        className="o-size-full o-object-cover"
      />

      {/* Le voile : decoratif, hors d'atteinte du pointeur, perce par le halo
          quand il y en a un. */}
      <div
        aria-hidden
        className="o-absolute o-inset-0 o-pointer-events-none"
        style={{
          opacity: cover,
          background:
            radius === 0
              ? 'var(--o-theme-bg)'
              : `radial-gradient(${String(radius)}px circle at var(--o-mt-x) var(--o-mt-y), transparent, var(--o-theme-bg) 100%)`,
        }}
      />

      {/* Le mot : du vrai texte, lisible par les technologies d'assistance
          comme par la recherche du navigateur. */}
      <span
        data-o-mt-ink=""
        className="o-absolute o-inset-0 o-flex o-items-center o-justify-center o-text-center o-font-black o-tracking-tighter o-select-none"
      >
        {text}
      </span>
    </div>
  )
}
