/**
 * Faisceau de liaison : un trait anime relie deux elements enfants.
 *
 * ## La geometrie est mesuree, jamais supposee
 *
 * Les deux extremites sont des enfants identifies par `data-beam="from"` et
 * `data-beam="to"`. Leurs positions sont relevees au montage puis a chaque
 * changement de taille — un `ResizeObserver` sur l'enveloppe et sur les deux
 * elements — et le chemin est retrace. La mesure ne vit pas dans la boucle :
 * un trait entre deux cartes ne bouge que quand la mise en page bouge.
 *
 * ## `pathLength` rend le flux independant de la longueur
 *
 * Le tiret qui circule est une animation CSS sur `stroke-dashoffset`. Sans
 * normalisation, la meme animation serait rapide sur un trait court et
 * paresseuse sur un long ; `pathLength=100` ramene tous les chemins a la meme
 * echelle, et une seule regle sert a toutes les liaisons de la page.
 *
 * Le trait est decoratif : il est retire de l'arbre d'accessibilite, et sous
 * mouvement reduit il reste — c'est la liaison qui compte — mais le flux
 * s'arrete.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Proprietes propres au composant. */
export interface BeamConnectOwnProps {
  /** Contenu, dont deux enfants portent data-beam="from" et data-beam="to". */
  children: ReactNode
  /** Bombement de la courbe, en pixels. @defaultValue 40 */
  curvature?: number
  /** Duree d'un cycle du flux, en millisecondes. @defaultValue 3000 */
  speed?: number
  /** Epaisseur du trait, en pixels. @defaultValue 2 */
  thickness?: number
  /** Couleur du faisceau. @defaultValue le token de marque */
  color?: string
}

/** Toutes les proprietes. */
export type BeamConnectProps = Customisable<BeamConnectOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-beam-connect'

/** Pose le flux, une fois par document. */
function ensureBeamRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // Grace a pathLength=100, ces unites valent pour tous les traits,
    // quelle que soit leur longueur reelle : voir l'en-tete du module.
    '[data-o-beam-dash]{stroke-dasharray:18 82;animation:o-beam-flow var(--o-beam-speed,3000ms) linear infinite}',
    '@keyframes o-beam-flow{to{stroke-dashoffset:-100}}',
    '@media (prefers-reduced-motion:reduce){[data-o-beam-dash]{animation:none}}',
  ].join('')
  document.head.append(style)
}

/** Ce qu'une mesure produit : la taille de la zone et le chemin. */
interface BeamGeometry {
  readonly width: number
  readonly height: number
  readonly d: string
}

/**
 * Mesure les deux extremites et trace la courbe qui les relie.
 *
 * Les ancres sont les milieux des bords qui se font face — relier les
 * centres ferait entrer le trait dans les cartes. L'axe dominant decide :
 * deux elements cote a cote se relient par leurs flancs, deux elements
 * superposes par leur haut et leur bas.
 */
function measureBeam(host: HTMLElement, curvature: number): BeamGeometry | null {
  const from = host.querySelector('[data-beam="from"]')
  const to = host.querySelector('[data-beam="to"]')
  if (from === null || to === null) return null

  const box = host.getBoundingClientRect()
  const a = from.getBoundingClientRect()
  const b = to.getBoundingClientRect()
  if (box.width === 0 || box.height === 0) return null

  const dcx = b.left + b.width / 2 - (a.left + a.width / 2)
  const dcy = b.top + b.height / 2 - (a.top + a.height / 2)

  let ax: number
  let ay: number
  let bx: number
  let by: number
  if (Math.abs(dcx) >= Math.abs(dcy)) {
    ax = (dcx >= 0 ? a.right : a.left) - box.left
    ay = a.top + a.height / 2 - box.top
    bx = (dcx >= 0 ? b.left : b.right) - box.left
    by = b.top + b.height / 2 - box.top
  } else {
    ax = a.left + a.width / 2 - box.left
    ay = (dcy >= 0 ? a.bottom : a.top) - box.top
    bx = b.left + b.width / 2 - box.left
    by = (dcy >= 0 ? b.top : b.bottom) - box.top
  }

  // Le point de controle est pousse le long de la normale au segment : la
  // courbe bombe du meme cote quelle que soit l'orientation de la liaison.
  const length = Math.max(Math.hypot(bx - ax, by - ay), 1)
  const mx = (ax + bx) / 2 - ((by - ay) / length) * curvature
  const my = (ay + by) / 2 + ((bx - ax) / length) * curvature

  return {
    width: box.width,
    height: box.height,
    d: `M ${ax.toFixed(1)} ${ay.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${bx.toFixed(1)} ${by.toFixed(1)}`,
  }
}

/**
 * Relie deux de ses enfants par un faisceau anime.
 *
 * @example
 * <BeamConnect className="o-flex o-items-center o-justify-between o-p-8">
 *   <div data-beam="from" className="o-rounded-xl o-border-w-1 o-p-4">Source</div>
 *   <div data-beam="to" className="o-rounded-xl o-border-w-1 o-p-4">Destination</div>
 * </BeamConnect>
 */
export function BeamConnect({
  children,
  curvature = 40,
  speed = 3000,
  thickness = 2,
  color = 'var(--o-palette-brand-400, currentColor)',
  ...rest
}: BeamConnectProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const [geometry, setGeometry] = useState<BeamGeometry | null>(null)
  ensureBeamRule()

  useEffect(() => {
    if (host === null) return

    const update = (): void => {
      setGeometry(measureBeam(host, curvature))
    }
    update()

    // L'enveloppe et les deux extremites : un changement de taille de
    // n'importe laquelle deplace les ancres.
    const observer = new ResizeObserver(update)
    observer.observe(host)
    const from = host.querySelector('[data-beam="from"]')
    const to = host.querySelector('[data-beam="to"]')
    if (from !== null) observer.observe(from)
    if (to !== null) observer.observe(to)

    return () => {
      observer.disconnect()
    }
  }, [host, curvature])

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={setHost}
      className={className}
      style={{ position: 'relative', ...style }}
    >
      {children}
      {geometry === null ? null : (
        <svg
          aria-hidden
          width={geometry.width}
          height={geometry.height}
          viewBox={`0 0 ${String(geometry.width)} ${String(geometry.height)}`}
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            overflow: 'visible',
          }}
        >
          {/* Le lit du faisceau : la liaison reste lisible entre deux
              passages du tiret, et c'est tout ce qui reste sous mouvement
              reduit. */}
          <path
            d={geometry.d}
            fill="none"
            stroke={color}
            strokeWidth={thickness}
            strokeLinecap="round"
            opacity={reduced ? 0.8 : 0.3}
          />
          {reduced ? null : (
            <path
              data-o-beam-dash=""
              d={geometry.d}
              fill="none"
              stroke={color}
              strokeWidth={thickness}
              strokeLinecap="round"
              pathLength={100}
              style={{ '--o-beam-speed': `${String(speed)}ms` } as CSSProperties}
            />
          )}
        </svg>
      )}
    </div>
  )
}
