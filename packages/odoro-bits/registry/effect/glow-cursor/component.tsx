/**
 * Halo lumineux : une lueur diffuse qui suit le pointeur, et s'etire quand il file.
 *
 * ## Une lumiere, pas un contour
 *
 * Le curseur a halo dessine un anneau : un objet, avec un bord. Celui-ci n'a
 * pas de bord du tout — c'est un degrade radial qui s'eteint avant d'atteindre
 * ses limites, donc une lumiere posee sur la page. On ne le lit pas comme un
 * curseur de remplacement mais comme un eclairage, et c'est pour cela qu'il ne
 * masque jamais le curseur du systeme.
 *
 * ## L'etirement vient de la vitesse, pas d'un ressort de plus
 *
 * La position est amortie ; la **vitesse** de cette position amortie est la
 * seule donnee supplementaire. Elle donne un angle et une longueur : la lueur
 * s'allonge dans le sens du deplacement et s'affine en travers, a volume
 * constant. Un deuxieme corps qui traine aurait donne une comete a deux
 * elements ; une seule transformation suffit, et elle se compose.
 *
 * L'etirement est plafonne. Sans plafond, un aller-retour brusque produit une
 * barre de lumiere qui traverse l'ecran — une seconde d'inattention devient un
 * artefact.
 *
 * ## Ce que la boucle ecrit
 *
 * Une transformation, et rien d'autre. La taille, la couleur et l'opacite sont
 * posees une fois : elles ne dependent que des proprietes.
 *
 * ## Ou il ne se montre pas
 *
 * Sans pointeur fin, aucun element n'est cree. Sous mouvement reduit non plus :
 * une lueur qui suit est un agrement continu, sans etat final a poser.
 *
 * @module
 */

import {
  CLOCK_PRIORITY,
  clock,
  mergePresentation,
  useMotionState,
  type Customisable,
} from '@odoro-cli/engine'
import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Proprietes propres au composant. */
export interface GlowCursorOwnProps {
  /**
   * Zone eclairee.
   *
   * Fournie, la lueur n'ecoute qu'elle et y est coupee. Absente, elle prend la
   * page entiere, en couche fixe qui n'intercepte rien.
   */
  children?: ReactNode
  /** Diametre de la lueur au repos, en pixels. @defaultValue 320 */
  size?: number
  /** Vitesse de rattrapage. Plus bas, plus la lueur traine. @defaultValue 6 */
  speed?: number
  /** Force de la lueur, de zero a un. @defaultValue 0.55 */
  intensity?: number
  /** Etirement dans le sens du deplacement, de zero a un. @defaultValue 0.5 */
  trail?: number
  /** Couleur de la lueur. Une valeur, pas un role. */
  color?: string
}

/** Toutes les proprietes. */
export type GlowCursorProps = Customisable<GlowCursorOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-glow-cursor'

/** Teinte par defaut de la lueur : la couleur de marque. */
const DEFAULT_COLOR = 'var(--o-palette-brand-500)'

/** Allongement maximal, en fraction du diametre. Voir l'en-tete. */
const MAX_STRETCH = 0.8

/** Pose les regles de la lueur, une fois par document. */
function ensureGlowCursorRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // La position de la zone vit dans une regle sans specificite : une
    // classe de l appelant — `o-absolute` pour la poser dans un cadre —
    // doit pouvoir la remplacer, ce qu'un style en ligne interdirait.
    ':where([data-o-glow-host="zone"]){position:relative;overflow:hidden}',
    ':where([data-o-glow-host="page"]){position:fixed;inset:0;z-index:9998;pointer-events:none}',
    '[data-o-glow-layer]{',
    'position:absolute;inset:0;overflow:hidden;pointer-events:none;',
    'opacity:0;transition:opacity 260ms linear;',
    '}',
    '[data-o-glow]{position:absolute;left:0;top:0;border-radius:50%;will-change:transform}',
  ].join('')
  document.head.append(style)
}

/**
 * Pose une lueur qui suit le pointeur.
 *
 * @example
 * // Sur la page entiere.
 * <GlowCursor />
 *
 * @example
 * // Sur un heros sombre : large, paresseuse, tres etiree.
 * <GlowCursor size={480} speed={3} trail={0.9}>
 *   <section className="o-p-16">…</section>
 * </GlowCursor>
 */
export function GlowCursor({
  children,
  size = 320,
  speed = 6,
  intensity = 0.55,
  trail = 0.5,
  color = DEFAULT_COLOR,
  ...rest
}: GlowCursorProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const wrapping = children !== undefined

  ensureGlowCursorRule()

  useEffect(() => {
    if (host === null || reduced) return
    if (typeof window === 'undefined') return
    // Pointeur grossier : rien a eclairer, rien n'est cree.
    if (!window.matchMedia('(pointer: fine)').matches) return

    const away = -size

    const layer = document.createElement('div')
    layer.setAttribute('data-o-glow-layer', '')
    layer.setAttribute('aria-hidden', 'true')
    host.append(layer)

    const glow = document.createElement('span')
    glow.setAttribute('data-o-glow', '')
    glow.style.width = `${String(size)}px`
    glow.style.height = `${String(size)}px`
    glow.style.margin = `${String(-size / 2)}px`
    glow.style.opacity = Math.min(1, Math.max(0, intensity)).toFixed(3)
    // La lueur s'eteint avant son bord : c'est ce qui la fait lire comme une
    // lumiere et non comme un disque flou.
    glow.style.background = `radial-gradient(circle, ${color} 0%, color-mix(in oklab, ${color} 35%, transparent) 40%, transparent 72%)`
    layer.append(glow)

    let box = host.getBoundingClientRect()
    const onFrameChange = (): void => {
      box = host.getBoundingClientRect()
    }

    let targetX = away
    let targetY = away
    let x = away
    let y = away
    let seen = false

    const onMove = (event: Event): void => {
      const pointer = event as PointerEvent
      if (pointer.pointerType === 'touch') return
      targetX = pointer.clientX - box.left
      targetY = pointer.clientY - box.top
      if (!seen) {
        x = targetX
        y = targetY
        seen = true
        layer.style.opacity = '1'
      }
    }

    const onLeave = (): void => {
      layer.style.opacity = '0'
      seen = false
    }

    const surface: HTMLElement | Window = wrapping ? host : window
    surface.addEventListener('pointermove', onMove, { passive: true })
    surface.addEventListener('pointerleave', onLeave)
    window.addEventListener('resize', onFrameChange, { passive: true })
    window.addEventListener('scroll', onFrameChange, { passive: true, capture: true })

    const subscription = clock.subscribe(
      ({ delta }) => {
        if (!seen) return
        const factor = 1 - Math.exp(-speed * delta)
        const stepX = (targetX - x) * factor
        const stepY = (targetY - y) * factor
        x += stepX
        y += stepY

        // La vitesse de l'image, ramenee au diametre : un deplacement d'un
        // demi-diametre en une image donne l'etirement maximal.
        const travelled = Math.hypot(stepX, stepY)
        const stretch = Math.min(MAX_STRETCH, (travelled / (size * 0.5)) * trail)
        const angle = (Math.atan2(stepY, stepX) * 180) / Math.PI

        glow.style.transform = [
          `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)`,
          `rotate(${angle.toFixed(1)}deg)`,
          // Volume a peu pres constant : ce qu'elle gagne en long, elle le
          // perd en large.
          `scale(${(1 + stretch).toFixed(3)},${(1 - stretch * 0.45).toFixed(3)})`,
        ].join(' ')
      },
      { name: 'glow-cursor : lueur', priority: CLOCK_PRIORITY.default },
    )

    return () => {
      surface.removeEventListener('pointermove', onMove)
      surface.removeEventListener('pointerleave', onLeave)
      window.removeEventListener('resize', onFrameChange)
      window.removeEventListener('scroll', onFrameChange, { capture: true })
      subscription.unsubscribe()
      layer.remove()
    }
  }, [host, reduced, size, speed, intensity, trail, color, wrapping])

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={setHost}
      className={className}
      style={style as CSSProperties}
      data-o-glow-host={wrapping ? 'zone' : 'page'}
    >
      {children}
    </div>
  )
}
