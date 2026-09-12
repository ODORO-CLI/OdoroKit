/**
 * Carte reflechissante : un reflet metallique tourne autour de la carte en
 * suivant le pointeur, sur le filet comme sur la surface.
 *
 * ## Un angle, pas une position
 *
 * Le halo et le projecteur placent une lumiere **sur** la carte. Un metal ne
 * fait pas cela : il renvoie une lumiere qui vient **d'une direction**. Tout
 * l'effet tient donc en un seul nombre, l'angle entre le centre de la carte et
 * le pointeur, qui oriente trois degrades : un anneau conique sur le filet,
 * une bande de reflet sur la surface, et un brossage fin qui tourne avec.
 * Le brossage est ce qui fait lire la matiere comme du metal et non comme du
 * verre : sans lui, l'anneau serait un simple degrade qui tourne.
 *
 * ## La lumiere vient d'en haut a gauche au repos
 *
 * L'angle est celui du vecteur qui va d'un point de reference au pointeur,
 * et ce point est decale vers le bas et la droite, pas au centre exact. Au
 * repos le pointeur amorti revient au centre, et l'angle depuis le centre
 * serait indefini ; depuis le point decale, le vecteur pointe en haut a
 * gauche — l'eclairage par defaut de toute interface. La carte a donc un
 * reflet plausible avant meme le premier geste.
 *
 * L'angle est exprime dans la convention des degrades CSS : zero vers le
 * haut, sens horaire. Le degrade conique part de cet angle avec un clair,
 * la bande de reflet est poussee vers le cote eclaire, et le brossage lui
 * est perpendiculaire.
 *
 * ## Deux teintes tirees de l'encre, pas d'un gris en dur
 *
 * Le clair du metal est l'encre courante melangee au transparent, le sombre
 * est le filet du theme. En clair, l'encre est sombre et le metal se lit
 * comme de l'etain ; en sombre, elle est claire et le metal se lit comme du
 * chrome. La meme carte, lisible dans les deux, sans une seule couleur ecrite.
 *
 * ## Ce qui reste au doigt et sous mouvement reduit
 *
 * Le reflet a son angle de repos, fige : la carte reste metallique, elle ne
 * tourne plus. C'est l'etat final, pas l'etat vide.
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

import { usePointerDamped } from '@registre/hooks/usePointerDamped'

/** Proprietes propres au composant. */
export interface ReflectiveCardOwnProps {
  /** Contenu de la carte. */
  children: ReactNode
  /** Vitesse a laquelle le reflet rejoint le pointeur. @defaultValue 6 */
  speed?: number
  /** Intensite du reflet sur la surface, de zero a un. @defaultValue 0.12 */
  shine?: number
  /** Intensite du brossage, de zero a un. Zero le supprime. @defaultValue 0.06 */
  brush?: number
}

/** Toutes les proprietes. */
export type ReflectiveCardProps = Customisable<ReflectiveCardOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-reflective-card'

/** Angle de repos, en degres, convention CSS : une lampe en haut a gauche. */
const REST_ANGLE = -45

/** Decalage du point de reference vers le bas et la droite, en unites normalisees. */
const REFERENCE = 0.5

/** Pose la surface, l'anneau et le reflet, une fois par document. */
function ensureReflectiveRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // Pas d'overflow cache : il rognerait l'anneau, qui vit sur la bordure.
    '[data-o-reflect]{',
    'position:relative;isolation:isolate;',
    'background:var(--o-theme-surface);',
    'border:1px solid transparent;',
    '--o-reflect-hi:color-mix(in oklab,currentColor 70%,transparent);',
    '--o-reflect-lo:var(--o-theme-line);',
    '}',
    // La surface : une bande de reflet poussee vers le cote eclaire, et un
    // brossage fin perpendiculaire a la lumiere, tous deux sous le contenu.
    '[data-o-reflect]::before{',
    'content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;',
    'border-radius:inherit;',
    'background:',
    'linear-gradient(var(--o-reflect-angle),',
    'transparent 40%,',
    'color-mix(in oklab,currentColor var(--o-reflect-shine),transparent) 72%,',
    'transparent 100%),',
    'repeating-linear-gradient(calc(var(--o-reflect-angle) + 90deg),',
    'transparent 0 2px,',
    'color-mix(in oklab,currentColor var(--o-reflect-brush),transparent) 2px 3px);',
    '}',
    // L'anneau : un degrade conique qui part de l'angle de la lumiere,
    // retenu sur le filet par un masque. Deux clairs opposes, deux sombres
    // entre eux : le reflet d'une tranche de metal.
    '[data-o-reflect]::after{',
    'content:"";position:absolute;inset:-1px;pointer-events:none;',
    'border-radius:inherit;padding:1px;',
    'background:conic-gradient(from var(--o-reflect-angle),',
    'var(--o-reflect-hi) 0deg,var(--o-reflect-lo) 70deg,var(--o-reflect-lo) 110deg,',
    'var(--o-reflect-hi) 180deg,var(--o-reflect-lo) 250deg,var(--o-reflect-lo) 290deg,',
    'var(--o-reflect-hi) 360deg);',
    '-webkit-mask:linear-gradient(currentColor 0 0) content-box,linear-gradient(currentColor 0 0);',
    'mask:linear-gradient(currentColor 0 0) content-box,linear-gradient(currentColor 0 0);',
    '-webkit-mask-composite:xor;mask-composite:exclude;',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * Une carte au reflet metallique qui suit le pointeur.
 *
 * @example
 * <ReflectiveCard className="o-rounded-xl o-p-6">
 *   <h3>Une carte</h3>
 * </ReflectiveCard>
 *
 * @example
 * // Un reflet plus franc, sans brossage.
 * <ReflectiveCard shine={0.25} brush={0}>Contenu</ReflectiveCard>
 */
export function ReflectiveCard({
  children,
  speed = 6,
  shine = 0.12,
  brush = 0.06,
  ...rest
}: ReflectiveCardProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const pointer = usePointerDamped({ host, speed, name: 'reflet : pointeur' })
  ensureReflectiveRules()

  useEffect(() => {
    if (host === null || reduced) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    let last = REST_ANGLE

    const subscription = clock.subscribe(
      () => {
        // Vecteur du point de reference, decale en bas a droite, vers le
        // pointeur ; puis en convention CSS, zero vers le haut, sens horaire.
        const { x, y } = pointer.current
        const angle = (Math.atan2(x - REFERENCE, -(y - REFERENCE)) * 180) / Math.PI

        if (Math.abs(angle - last) < 0.05) return
        last = angle
        host.style.setProperty('--o-reflect-angle', `${angle.toFixed(2)}deg`)
      },
      { priority: CLOCK_PRIORITY.render, name: 'reflet' },
    )

    return () => {
      subscription.unsubscribe()
      host.style.removeProperty('--o-reflect-angle')
    }
  }, [host, reduced, pointer])

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      ref={setHost}
      className={className}
      style={
        {
          ...style,
          '--o-reflect-angle': `${String(REST_ANGLE)}deg`,
          '--o-reflect-shine': `${String(shine * 100)}%`,
          '--o-reflect-brush': `${String(brush * 100)}%`,
        } as CSSProperties
      }
      data-o-reflect=""
    >
      {children}
    </div>
  )
}
