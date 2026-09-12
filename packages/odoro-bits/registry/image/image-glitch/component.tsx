/**
 * Image glitchee : deux fantomes teintes se decalent par tranches au-dessus
 * de la photo, comme une transmission qui decroche.
 *
 * ## Ce qui la distingue du glitch au survol
 *
 * L'effet generique enveloppe n'importe quel contenu et tire une rafale unique
 * a l'entree du pointeur. Ici l'entree connait son sujet : c'est une image, et
 * la separation des couches est faite avec l'image elle-meme, teintee par
 * melange de fond. Le decrochage boucle tant que le pointeur reste, au lieu de
 * partir une fois — le desordre continu est ce qui fait lire un signal
 * defaillant plutot qu'un accident.
 *
 * ## Deux fantomes, aucune troisieme copie
 *
 * Chaque fantome est un calque dont le fond est la meme source que l'element
 * `img` — donc rien de plus a telecharger. Sa couleur est melangee a l'image
 * par `background-blend-mode: multiply`, puis le calque est compose sur la
 * photo par `mix-blend-mode: screen` : c'est exactement ce que fait une frange
 * chromatique, un canal separe et rendu a nouveau. Le blanc n'est jamais
 * ecrit : les deux teintes viennent de la palette.
 *
 * ## Pourquoi des paliers, et une animation deja declaree
 *
 * Le decrochage est fait de sauts, pas de glissements : la fonction de
 * temporisation est un palier unique, et chaque etape tient jusqu'a la
 * suivante. L'animation est declaree une fois pour le document et reste en
 * pause ; le survol ne fait que la remettre en marche. Rien n'est cree au
 * moment du geste, et aucun rendu React n'a lieu.
 *
 * ## Sous mouvement reduit
 *
 * Les fantomes ne sont pas rendus du tout et rien n'ecoute : la photo, nette,
 * est le seul etat. Un decrochage n'a pas d'etat final a preserver.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-image-glitch'

/** Pose les regles et les deux animations, une fois par document. */
function ensureGlitchRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  /** Tranche fermee : le fantome existe sans rien montrer. */
  const closed = 'opacity:0;clip-path:inset(0 0 100% 0);transform:none'

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-ig-copy]{',
    'position:absolute;inset:0;pointer-events:none;border-radius:inherit;',
    'background-image:var(--o-ig-src);background-size:cover;background-position:center;',
    // Le fond teinte est melange a l'image dans le calque, puis le calque est
    // compose sur la photo : deux melanges, une seule copie.
    'background-blend-mode:multiply;mix-blend-mode:screen;',
    'animation-duration:var(--o-ig-duration);animation-timing-function:steps(1,end);',
    'animation-iteration-count:infinite;animation-play-state:paused;',
    'opacity:0;',
    '}',
    '[data-o-ig-copy="a"]{animation-name:o-ig-a}',
    '[data-o-ig-copy="b"]{animation-name:o-ig-b}',
    // Le survol ne cree rien : il remet en marche ce qui attendait deja.
    '[data-o-glitch-continu] [data-o-ig-copy],',
    '[data-o-glitch-survol]:hover [data-o-ig-copy],',
    '[data-o-glitch-survol]:focus-within [data-o-ig-copy]{animation-play-state:running}',
    '@keyframes o-ig-a{',
    `0%,100%{${closed}}`,
    '6%{opacity:0.9;clip-path:inset(8% 0 74% 0);transform:translate3d(calc(var(--o-ig-shift) * -1),0,0)}',
    '12%{opacity:0.9;clip-path:inset(42% 0 38% 0);transform:translate3d(var(--o-ig-shift),0,0)}',
    `18%{${closed}}`,
    '54%{opacity:0.9;clip-path:inset(70% 0 12% 0);transform:translate3d(calc(var(--o-ig-shift) * -0.6),0,0)}',
    `60%{${closed}}`,
    '}',
    '@keyframes o-ig-b{',
    `0%,100%{${closed}}`,
    '8%{opacity:0.85;clip-path:inset(28% 0 52% 0);transform:translate3d(var(--o-ig-shift),0,0)}',
    '14%{opacity:0.85;clip-path:inset(60% 0 22% 0);transform:translate3d(calc(var(--o-ig-shift) * -1),0,0)}',
    `20%{${closed}}`,
    '62%{opacity:0.85;clip-path:inset(16% 0 66% 0);transform:translate3d(calc(var(--o-ig-shift) * 0.5),0,0)}',
    `68%{${closed}}`,
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface ImageGlitchOwnProps {
  /** Source de l'image. */
  src: string
  /** Texte de remplacement. Chaine vide si l'image est purement decorative. */
  alt: string
  /** Rapport largeur sur hauteur du cadre. @defaultValue 1.777 */
  ratio?: number
  /** Decalage des tranches, en pixels. @defaultValue 10 */
  intensity?: number
  /** Duree d'un cycle de decrochage, en millisecondes. @defaultValue 1400 */
  duration?: number
  /** Ne decrocher qu'au survol et au focus. Sinon, en continu. @defaultValue true */
  hover?: boolean
  /**
   * Teinte du premier fantome.
   *
   * Une valeur, pas une couleur en dur : ecrite en clair elle echapperait au
   * theme.
   *
   * @defaultValue un cyan clair
   */
  cool?: string
  /** Teinte du second fantome. @defaultValue un rose vif */
  warm?: string
}

/** Toutes les proprietes : les siennes, plus celles d'une image. */
export type ImageGlitchProps = Customisable<ImageGlitchOwnProps, 'img'>

/**
 * Fait decrocher une image en tranches teintees.
 *
 * @example
 * <ImageGlitch src="/photo.jpg" alt="Vue de l atelier" />
 *
 * @example
 * // Decrochage permanent, plus large et plus lent.
 * <ImageGlitch src="/photo.jpg" alt="" hover={false} intensity={18} duration={2200} />
 */
export function ImageGlitch({
  src,
  alt,
  ratio = 1.777,
  intensity = 10,
  duration = 1400,
  hover = true,
  cool = 'var(--o-palette-cyan-400)',
  warm = 'var(--o-palette-rose-500)',
  ...rest
}: ImageGlitchProps): ReactElement {
  const { reduced } = useMotionState()
  ensureGlitchRule()

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden o-isolate' },
    rest,
  )

  const hostStyle = {
    ...style,
    aspectRatio: String(ratio),
    // Les guillemets de la source sont neutralises : une apostrophe double
    // dans un nom de fichier fermerait la fonction `url`.
    '--o-ig-src': `url("${src.replaceAll('"', '%22')}")`,
    '--o-ig-shift': `${String(Math.max(0, intensity))}px`,
    '--o-ig-duration': `${String(Math.max(200, duration))}ms`,
  } as CSSProperties

  /** Le fond teinte du fantome, melange a l'image dans son propre calque. */
  const ghost = (colour: string): CSSProperties => ({ backgroundColor: colour })

  return (
    <div
      className={className}
      style={hostStyle}
      data-o-glitch-survol={hover ? '' : undefined}
      data-o-glitch-continu={hover ? undefined : ''}
    >
      <img
        loading="lazy"
        decoding="async"
        {...rest}
        src={src}
        alt={alt}
        className="o-size-full o-object-cover"
      />

      {/* Les fantomes sont decoratifs : ils ne montrent rien que la photo ne
          montre deja, et sont hors d'atteinte du pointeur. */}
      {reduced ? null : (
        <>
          <div aria-hidden data-o-ig-copy="a" style={ghost(cool)} />
          <div aria-hidden data-o-ig-copy="b" style={ghost(warm)} />
        </>
      )}
    </div>
  )
}
