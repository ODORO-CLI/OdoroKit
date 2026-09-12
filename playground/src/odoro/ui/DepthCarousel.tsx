/**
 * Carrousel en profondeur : une pile d'affiches rangees en Z, celle de devant
 * de face, les autres reculant de trois quarts.
 *
 * ## La position vient du rang, pas d'une mesure
 *
 * Chaque affiche connait son ecart au cran courant — moins deux, moins un,
 * zero, un, deux — et en deduit son decalage lateral, son recul et son angle.
 * Il n'y a rien a mesurer : ni la largeur du cadre, ni la place prise par les
 * voisines. Changer de cran renumerote les ecarts, et la transition du
 * compositeur fait le trajet. Un seul rendu React par cran.
 *
 * ## Le glisser n'ecrit qu'une transformation
 *
 * Pendant le geste, c'est le plateau entier qui suit le doigt — une
 * transformation, une seule, ecrite directement sur l'element. Deplacer
 * chaque affiche pendant le glisser reviendrait a en ecrire autant qu'il y en
 * a, pour un mouvement que l'oeil lit comme un bloc. Au lacher, si le geste a
 * franchi le seuil, le cran change et le plateau reprend sa place.
 *
 * ## Ce n'est ni le carrousel, ni la galerie circulaire
 *
 * Le carrousel est un rail plat qui defile. La galerie circulaire est un
 * ruban continu que l'on pousse, sans cran ni bouton. Ici il y a une affiche
 * de devant, une seule, et deux boutons pour en changer : c'est un objet a
 * feuilleter, pas un ruban a parcourir.
 *
 * ## Ce que voit un lecteur d'ecran
 *
 * Les affiches restent toutes dans le document — un lecteur d'ecran doit
 * pouvoir parcourir la collection sans avoir a la faire tourner. Seule
 * l'affiche de devant porte `aria-current`, et les deux boutons disent ou ils
 * menent plutot que « precedent » et « suivant » dans le vide.
 *
 * ## Mouvement reduit
 *
 * Aucune transition : l'affiche choisie est en place, a son etat final. Les
 * boutons, les fleches et le glisser restent les memes.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import {
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
} from 'react'

/** Une affiche du carrousel. */
export interface DepthCarouselItem {
  /** Source de l'image. */
  readonly src: string
  /** Texte de remplacement, obligatoire : c'est le contenu, pas une decoration. */
  readonly alt: string
  /** Legende affichee sous l'affiche de devant. */
  readonly caption?: string
}

/** Proprietes propres au composant. */
export interface DepthCarouselOwnProps {
  /** Les affiches, dans l'ordre. */
  items: readonly DepthCarouselItem[]
  /** Nom du carrousel, annonce aux technologies d'assistance. */
  label: string
  /** Affiche de devant, en mode controle. */
  index?: number
  /** Affiche de devant au montage, en mode non controle. @defaultValue 0 */
  defaultIndex?: number
  /** Appele quand l'affiche de devant change. */
  onIndexChange?: (index: number) => void
  /** Largeur de l'affiche de devant, en pixels. @defaultValue 300 */
  width?: number
  /** Decalage lateral par cran d'ecart, en pixels. @defaultValue 110 */
  spread?: number
  /** Recul par cran d'ecart, en pixels. @defaultValue 140 */
  depth?: number
  /** Angle de trois quarts des affiches de cote, en degres. @defaultValue 32 */
  tilt?: number
  /** Affiches visibles de chaque cote. @defaultValue 3 */
  visible?: number
}

/** Toutes les proprietes. */
export type DepthCarouselProps = Customisable<DepthCarouselOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-depth-carousel'

/** Distance de glisser, en pixels, a partir de laquelle le cran change. */
const SEUIL = 60

/** Pose le plateau, les affiches et les commandes, une fois par document. */
function ensureDepthRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-depth]{display:flex;flex-direction:column;align-items:center;gap:1rem}',
    '[data-o-depth-scene]{',
    'position:relative;width:100%;min-height:var(--o-depth-hauteur);',
    'perspective:1100px;touch-action:pan-y;cursor:grab;',
    '}',
    '[data-o-depth-scene][data-o-depth-tire]{cursor:grabbing}',
    '[data-o-depth-scene]:focus-visible{outline:2px solid var(--o-depth-accent);outline-offset:4px;border-radius:1rem}',
    '[data-o-depth-plateau]{position:absolute;inset:0;transform-style:preserve-3d}',
    '[data-o-depth-affiche]{',
    'position:absolute;top:50%;left:50%;margin:0;width:var(--o-depth-largeur);',
    'transform-origin:50% 50%;backface-visibility:hidden;',
    'transition:transform var(--o-duration-slow) var(--o-ease-emphasized),',
    'opacity var(--o-duration-slow) linear;',
    '}',
    '[data-o-depth-affiche] img{',
    'display:block;width:100%;aspect-ratio:3 / 4;object-fit:cover;',
    'border-radius:1rem;background:var(--o-theme-surface);',
    'box-shadow:0 0 0 1px var(--o-theme-line),0 24px 48px -28px currentColor;',
    '}',
    '[data-o-depth-legende]{margin:0;font-size:0.875em;color:var(--o-theme-muted);text-align:center;min-height:1.4em}',
    '[data-o-depth-barre]{display:flex;align-items:center;gap:0.75rem}',
    '[data-o-depth-barre] button{',
    'display:inline-flex;align-items:center;justify-content:center;',
    'width:2.25rem;height:2.25rem;border-radius:999px;cursor:pointer;',
    'border:1px solid var(--o-theme-line);background:var(--o-theme-surface);',
    'font:inherit;color:inherit;',
    '}',
    '[data-o-depth-barre] button:is(:hover,:focus-visible){border-color:var(--o-depth-accent)}',
    '[data-o-depth-barre] button:focus-visible{outline:2px solid var(--o-depth-accent);outline-offset:2px}',
    '[data-o-depth-barre] button:disabled{opacity:0.35;cursor:default}',
    '[data-o-depth-rang]{font-variant-numeric:tabular-nums;font-size:0.8125em;color:var(--o-theme-muted)}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-depth-affiche]{transition:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Pile d'affiches feuilletee au bouton, a la fleche ou au glisser.
 *
 * @example
 * <DepthCarousel
 *   label="Affiches du festival"
 *   items={[
 *     { src: '/affiches/1998.jpg', alt: 'Affiche de 1998, typographie bleue', caption: 'Edition 1998' },
 *     { src: '/affiches/2004.jpg', alt: 'Affiche de 2004, photographie de nuit', caption: 'Edition 2004' },
 *   ]}
 * />
 *
 * @example
 * // Une pile serree, presque de face.
 * <DepthCarousel label="Pochettes" items={pochettes} spread={40} tilt={12} visible={2} />
 */
export function DepthCarousel({
  items,
  label,
  index,
  defaultIndex = 0,
  onIndexChange,
  width = 300,
  spread = 110,
  depth = 140,
  tilt = 32,
  visible = 3,
  ...rest
}: DepthCarouselProps): ReactElement {
  const plateau = useRef<HTMLDivElement | null>(null)
  const tirer = useRef<{ x: number; id: number } | null>(null)
  const [interne, setInterne] = useState(defaultIndex)
  ensureDepthRules()

  const dernier = Math.max(0, items.length - 1)
  const courant = Math.min(dernier, Math.max(0, index ?? interne))
  const devant = items[courant]

  const aller = (suivant: number): void => {
    const borne = Math.min(dernier, Math.max(0, suivant))
    if (borne === courant) return
    if (index === undefined) setInterne(borne)
    onIndexChange?.(borne)
  }

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const cibles: Readonly<Record<string, number | undefined>> = {
      ArrowRight: courant + 1,
      ArrowLeft: courant - 1,
      Home: 0,
      End: dernier,
    }
    const cible = cibles[event.key]
    if (cible === undefined) return
    event.preventDefault()
    aller(cible)
  }

  /** Ecrit le decalage du plateau sans passer par l'etat. */
  const glisser = (dx: number): void => {
    const cible = plateau.current
    if (cible === null) return
    cible.style.transform = dx === 0 ? '' : `translateX(${dx.toFixed(1)}px)`
  }

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (event.button !== 0 && event.pointerType === 'mouse') return
    tirer.current = { x: event.clientX, id: event.pointerId }
    event.currentTarget.setPointerCapture(event.pointerId)
    event.currentTarget.setAttribute('data-o-depth-tire', '')
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const depart = tirer.current
    if (depart === null || depart.id !== event.pointerId) return
    // La resistance du tiers rappelle que le plateau ne suit pas indefiniment :
    // le geste sert a franchir un seuil, pas a faire defiler.
    glisser((event.clientX - depart.x) / 3)
  }

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const depart = tirer.current
    tirer.current = null
    event.currentTarget.removeAttribute('data-o-depth-tire')
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    glisser(0)
    if (depart === null) return
    const dx = event.clientX - depart.x
    if (Math.abs(dx) >= SEUIL) aller(courant + (dx < 0 ? 1 : -1))
  }

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      data-o-depth=""
      className={className}
      style={
        {
          '--o-depth-accent': 'var(--o-palette-brand-500)',
          '--o-depth-largeur': `${String(width)}px`,
          '--o-depth-hauteur': `${String(Math.round((width * 4) / 3))}px`,
          ...style,
        } as CSSProperties
      }
    >
      <div
        data-o-depth-scene=""
        role="group"
        aria-roledescription="carrousel"
        aria-label={label}
        tabIndex={0}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        <div ref={plateau} data-o-depth-plateau="">
          {items.map((item, rang) => {
            const ecart = rang - courant
            const loin = Math.abs(ecart)
            const cote = Math.sign(ecart)

            return (
              <figure
                key={item.src}
                data-o-depth-affiche=""
                aria-current={ecart === 0 ? 'true' : undefined}
                style={{
                  transform: [
                    `translate(-50%,-50%)`,
                    `translateX(${String(ecart * spread)}px)`,
                    `translateZ(${String(-loin * depth)}px)`,
                    `rotateY(${String(-cote * tilt)}deg)`,
                  ].join(' '),
                  opacity: Math.max(0, 1 - loin * 0.22),
                  zIndex: items.length - loin,
                  // Au-dela des affiches visibles, plus rien n'est peint : ni
                  // pixel, ni cible de pointeur. Le contenu reste dans le
                  // document pour les lecteurs d'ecran.
                  visibility: loin > visible ? 'hidden' : undefined,
                }}
              >
                <img src={item.src} alt={item.alt} loading="lazy" decoding="async" />
              </figure>
            )
          })}
        </div>
      </div>

      <p data-o-depth-legende="">{devant?.caption ?? ''}</p>

      <div data-o-depth-barre="">
        <button
          type="button"
          aria-label="Affiche precedente"
          disabled={courant === 0}
          onClick={() => {
            aller(courant - 1)
          }}
        >
          <span aria-hidden="true">&#8249;</span>
        </button>
        <span data-o-depth-rang="">
          {courant + 1} / {items.length}
        </span>
        <button
          type="button"
          aria-label="Affiche suivante"
          disabled={courant >= dernier}
          onClick={() => {
            aller(courant + 1)
          }}
        >
          <span aria-hidden="true">&#8250;</span>
        </button>
      </div>
    </div>
  )
}
