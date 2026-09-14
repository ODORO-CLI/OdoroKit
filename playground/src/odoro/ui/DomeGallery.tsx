/**
 * Galerie en dome : les images sont collees sur une calotte que l'on fait
 * tourner au doigt ou aux fleches.
 *
 * ## La geometrie est ecrite une fois, la rotation est le seul mouvement
 *
 * Chaque image occupe une case de la calotte : un angle de colonne, un angle
 * de rangee, puis un eloignement du centre — `rotateY`, `rotateX`,
 * `translateZ`. Cette transformation-la ne change jamais ; elle est posee au
 * rendu et le navigateur n'y revient plus.
 *
 * Ce qui bouge, c'est le dome : **un seul** element porte la rotation que la
 * boucle ecrit. Faire tourner cinquante images revient donc a ecrire une
 * chaine de caracteres par image d'ecran, quel que soit leur nombre. Ecrire
 * une transformation par image couterait cinquante fois plus, pour le meme
 * resultat.
 *
 * ## Ce qui passe derriere disparait sans qu'on le calcule
 *
 * Une image de l'autre cote du dome est retournee face contre nous.
 * `backface-visibility: hidden` la retire du rendu — pas d'opacite a
 * calculer, pas de tri en profondeur, pas de liste a tenir a jour. La
 * geometrie fait le travail que du code ferait moins bien.
 *
 * ## Ce n'est pas le menu infini
 *
 * Le menu infini est un cylindre de liens que l'on parcourt sur un seul axe,
 * et dont chaque cran est une cible a activer. Le dome est un volume : deux
 * axes, des images plutot que des liens, et rien a activer — on regarde. Le
 * clavier y tourne la vue, il n'y promene pas un focus.
 *
 * ## Ce que le pointeur ne doit pas emporter
 *
 * Le glisser est capte sur l'element, pas sur la fenetre : relacher le doigt
 * hors du cadre termine le geste proprement, grace a la capture de pointeur.
 * Sans elle, un geste rapide laisse le dome accroche au pointeur alors qu'on
 * a lache depuis longtemps.
 *
 * ## Mouvement reduit
 *
 * Plus d'amortissement : le dome est a sa position visee des qu'on la change.
 * Tourner reste possible — c'est le seul moyen de voir les images du fond.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactElement,
} from 'react'

/** Une image du dome. */
export interface DomeGalleryItem {
  /** Source de l'image. */
  readonly src: string
  /** Texte de remplacement, obligatoire : c'est le contenu, pas une decoration. */
  readonly alt: string
  /** Legende affichee sous l'image. */
  readonly caption?: string
}

/** Proprietes propres au composant. */
export interface DomeGalleryOwnProps {
  /** Les images posees sur le dome, dans l'ordre. */
  items: readonly DomeGalleryItem[]
  /** Nom de la galerie, annonce aux technologies d'assistance. */
  label: string
  /** Rayon du dome, en pixels. @defaultValue 360 */
  radius?: number
  /** Nombre d'images par rangee. @defaultValue 8 */
  columns?: number
  /** Angle entre deux rangees, en degres. @defaultValue 34 */
  pitch?: number
  /** Largeur d'une image sur le dome, en pixels. @defaultValue 180 */
  tile?: number
}

/** Toutes les proprietes. */
export type DomeGalleryProps = Customisable<DomeGalleryOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-dome-gallery'

/** Degres parcourus pour cent pixels de glisser. */
const SENSIBILITE = 0.28

/** Pose la scene, le dome et ses cases, une fois par document. */
function ensureDomeRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-dome]{',
    'position:relative;display:block;overflow:hidden;touch-action:none;cursor:grab;',
    'perspective:var(--o-dome-vue);perspective-origin:50% 50%;',
    '}',
    '[data-o-dome][data-o-dome-tire]{cursor:grabbing}',
    '[data-o-dome]:focus-visible{outline:2px solid var(--o-dome-accent);outline-offset:-2px}',
    // La scene recule le centre du dome d'un rayon : la case de devant se
    // retrouve alors dans le plan de l'ecran, a son echelle exacte. Sans ce
    // recul, elle arriverait sur l'oeil et s'etirerait a l'infini.
    '[data-o-dome-scene]{',
    'position:absolute;inset:0;transform-style:preserve-3d;',
    'transform:translateZ(var(--o-dome-recul));',
    '}',
    '[data-o-dome-calotte]{',
    'position:absolute;left:50%;top:50%;width:0;height:0;',
    'transform-style:preserve-3d;will-change:transform;',
    '}',
    '[data-o-dome-case]{',
    'position:absolute;top:0;left:0;margin:0;',
    'width:var(--o-dome-tuile);translate:-50% -50%;',
    // La face cachee retire d'elle-meme ce qui est passe derriere.
    'backface-visibility:hidden;',
    '}',
    '[data-o-dome-case] img{',
    'display:block;width:100%;aspect-ratio:4 / 3;object-fit:cover;',
    'border-radius:0.7rem;background:var(--o-theme-surface);',
    'box-shadow:0 0 0 1px var(--o-theme-line);',
    '}',
    '[data-o-dome-case] figcaption{',
    'margin-top:0.4rem;text-align:center;font-size:0.75em;color:var(--o-theme-muted);',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Dome d'images, au glisser comme au clavier.
 *
 * @example
 * <DomeGallery
 *   label="Panorama de l atelier"
 *   items={[
 *     { src: '/dome/etabli.jpg', alt: 'Etabli couvert d outils' },
 *     { src: '/dome/four.jpg', alt: 'Four a ceramique ouvert' },
 *   ]}
 *   className="o-h-96"
 * />
 *
 * @example
 * // Un dome plus serre, en dix images par rangee.
 * <DomeGallery label="Mur d images" items={photos} radius={300} columns={10} tile={140} />
 */
export function DomeGallery({
  items,
  label,
  radius = 360,
  columns = 8,
  pitch = 34,
  tile = 180,
  ...rest
}: DomeGalleryProps): ReactElement {
  const { reduced } = useMotionState()
  const calotte = useRef<HTMLDivElement | null>(null)
  /** Angle vise et angle affiche, en degres — lacet puis tangage. */
  const vise = useRef({ lacet: 0, tangage: 0 })
  const pose = useRef({ lacet: 0, tangage: 0 })
  const frame = useRef(0)
  const instant = useRef(0)
  ensureDomeRules()

  const parRangee = Math.max(1, Math.round(columns))
  const rangees = Math.max(1, Math.ceil(items.length / parRangee))
  /** Au-dela, le dome basculerait sur le dos. */
  const limite = ((rangees - 1) / 2) * pitch + 20

  /** Rapproche l'angle affiche de l'angle vise, et ecrit le dome. */
  const boucle = useCallback((): void => {
    frame.current = 0
    const cible = calotte.current
    if (cible === null) return

    const maintenant = typeof performance === 'undefined' ? 0 : performance.now()
    const dt = Math.min(0.05, (maintenant - instant.current) / 1000)
    instant.current = maintenant

    // Amortissement exponentiel : le meme mouvement quelle que soit la
    // cadence d'affichage, contrairement a un pas fixe par image.
    const k = reduced ? 1 : 1 - Math.exp(-9 * dt)
    pose.current.lacet += (vise.current.lacet - pose.current.lacet) * k
    pose.current.tangage += (vise.current.tangage - pose.current.tangage) * k

    cible.style.transform = `rotateX(${pose.current.tangage.toFixed(2)}deg) rotateY(${pose.current.lacet.toFixed(2)}deg)`

    const reste =
      Math.abs(vise.current.lacet - pose.current.lacet) +
      Math.abs(vise.current.tangage - pose.current.tangage)
    // Rien n'est ecrit quand rien ne bouge : la boucle s'arrete d'elle-meme.
    if (reste > 0.02 && typeof requestAnimationFrame === 'function') {
      frame.current = requestAnimationFrame(boucle)
    }
  }, [reduced])

  const relancer = useCallback((): void => {
    if (frame.current !== 0 || typeof requestAnimationFrame !== 'function') return
    instant.current = typeof performance === 'undefined' ? 0 : performance.now()
    frame.current = requestAnimationFrame(boucle)
  }, [boucle])

  useEffect(() => {
    relancer()
    return () => {
      if (frame.current !== 0) cancelAnimationFrame(frame.current)
      frame.current = 0
    }
  }, [relancer, radius, pitch, columns, items])

  const tirer = useRef<{ x: number; y: number; id: number } | null>(null)

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>): void => {
    if (event.button !== 0 && event.pointerType === 'mouse') return
    tirer.current = { x: event.clientX, y: event.clientY, id: event.pointerId }
    event.currentTarget.setPointerCapture(event.pointerId)
    event.currentTarget.setAttribute('data-o-dome-tire', '')
  }

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>): void => {
    const depart = tirer.current
    if (depart === null || depart.id !== event.pointerId) return
    vise.current.lacet += (event.clientX - depart.x) * SENSIBILITE
    vise.current.tangage = Math.min(
      limite,
      Math.max(-limite, vise.current.tangage - (event.clientY - depart.y) * SENSIBILITE),
    )
    depart.x = event.clientX
    depart.y = event.clientY
    relancer()
  }

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>): void => {
    tirer.current = null
    event.currentTarget.removeAttribute('data-o-dome-tire')
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  /** Les fleches tournent la vue d'une case ; Origine la remet de face. */
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    const colonne = 360 / parRangee
    const gestes: Readonly<Record<string, (() => void) | undefined>> = {
      ArrowRight: () => (vise.current.lacet -= colonne),
      ArrowLeft: () => (vise.current.lacet += colonne),
      ArrowUp: () =>
        (vise.current.tangage = Math.max(-limite, vise.current.tangage - pitch)),
      ArrowDown: () =>
        (vise.current.tangage = Math.min(limite, vise.current.tangage + pitch)),
      Home: () => {
        vise.current.lacet = 0
        vise.current.tangage = 0
      },
    }
    const geste = gestes[event.key]
    if (geste === undefined) return
    event.preventDefault()
    geste()
    relancer()
  }

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      role="group"
      aria-roledescription="galerie"
      aria-label={label}
      tabIndex={0}
      data-o-dome=""
      className={className}
      style={
        {
          '--o-dome-accent': 'var(--o-palette-brand-500)',
          '--o-dome-tuile': `${String(tile)}px`,
          '--o-dome-recul': `${String(-radius)}px`,
          '--o-dome-vue': `${String(radius * 2)}px`,
          ...style,
        } as CSSProperties
      }
      onPointerDown={(event) => {
        onPointerDown(event)
        rest.onPointerDown?.(event)
      }}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
      onKeyDown={(event) => {
        onKeyDown(event)
        rest.onKeyDown?.(event)
      }}
    >
      <div data-o-dome-scene="">
        <div ref={calotte} data-o-dome-calotte="">
          {items.map((item, index) => {
            const rangee = Math.floor(index / parRangee)
            const colonne = index % parRangee
            // La derniere rangee est souvent incomplete : elle se repartit sur
            // son propre compte plutot que de laisser un pan de dome vide.
            const dansRangee = Math.min(parRangee, items.length - rangee * parRangee)
            const lacet = colonne * (360 / Math.max(1, dansRangee))
            const tangage = (rangee - (rangees - 1) / 2) * pitch

            return (
              <figure
                key={item.src}
                data-o-dome-case=""
                style={{
                  transform: `rotateY(${String(lacet)}deg) rotateX(${String(-tangage)}deg) translateZ(${String(radius)}px)`,
                }}
              >
                <img src={item.src} alt={item.alt} loading="lazy" decoding="async" />
                {item.caption === undefined ? null : (
                  <figcaption>{item.caption}</figcaption>
                )}
              </figure>
            )
          })}
        </div>
      </div>
    </div>
  )
}
