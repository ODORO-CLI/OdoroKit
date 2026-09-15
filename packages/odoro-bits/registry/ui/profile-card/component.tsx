/**
 * Profile card: portrait, name and role on a card that tilts towards the
 * pointer, with a band of sheen crossing it.
 *
 * ## What sets it apart from the tilt card
 *
 * The tilt card is an empty frame that pivots. This one has a composition: a
 * portrait, a name, a role, and whatever is wanted below. The portrait sits
 * one notch **in front of** the card in the three-dimensional scene, so that
 * on pivoting it shifts slightly against the text — it is this shift, the
 * parallax, that makes the card read as a thick object and not as a picture
 * that turns.
 *
 * The sheen is not a radial reflection: it is a slanted band that sweeps the
 * card from one edge to the other when the pointer goes from left to right,
 * like a laminated card tilted under a lamp.
 *
 * ## Everything is written from the loop
 *
 * The angles, the position of the band: the pointer hook damps into a ref, and
 * the engine loop writes the style. React renders once. The damping is
 * independent of the frame rate — `1 - exp(-speed x dt)`, computed by the
 * hook — so that the card has the same weight everywhere.
 *
 * ## What is left without motion, and on touch
 *
 * A profile card, flat and readable: the tilt carried no information. Without
 * a fine pointer there is no hover: nothing subscribes.
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
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

import { usePointerDamped } from '@registre/hooks/usePointerDamped'

/** Props specific to the component. */
export interface ProfileCardOwnProps {
  /** Displayed name. */
  name: string
  /** Subtitle: a role, a job, a place. */
  subtitle?: string
  /** Portrait: an image source, or an element (initials, icon). */
  avatar?: string | ReactNode
  /** What follows the header: a sentence, some actions. */
  children?: ReactNode
  /** Maximum tilt, in degrees. @defaultValue 10 */
  tilt?: number
  /** Speed at which the card reaches the targeted angle. @defaultValue 8 */
  speed?: number
  /** Intensity of the sheen band, from zero to one. Zero removes it. @defaultValue 0.35 */
  sheen?: number
  /** Hue of the sheen. @defaultValue brand hue */
  tint?: string
}

/** All props. */
export type ProfileCardProps = Customisable<ProfileCardOwnProps>

/** Id of the injected stylesheet. */
const STYLE_ID = 'o-profile-card'

/** Applies the scene, the card and its band, once per document. */
function ensureProfileRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-profile]{perspective:1000px}',
    // No hidden overflow here: it would flatten the scene, and the portrait
    // would lose its notch of advance. The band takes the rounding by itself.
    '[data-o-profile-inner]{',
    'position:relative;border-radius:inherit;',
    'background:var(--o-theme-surface);border:1px solid var(--o-theme-line);',
    'transform-style:preserve-3d;will-change:transform;',
    // The transition only serves the return to rest: during hover, the loop
    // writes on every frame.
    'transition:transform 480ms cubic-bezier(0.22,1,0.36,1);',
    '}',
    '[data-o-profile-on] [data-o-profile-inner]{transition:none}',
    // The band: a background, never a layer that intercepts the pointer.
    '[data-o-profile-inner]::after{',
    'content:"";position:absolute;inset:0;pointer-events:none;border-radius:inherit;',
    'background:linear-gradient(115deg,',
    'transparent calc(var(--o-profile-sx) - 22%),',
    'color-mix(in oklab,var(--o-profile-tint) var(--o-profile-sheen),transparent) var(--o-profile-sx),',
    'transparent calc(var(--o-profile-sx) + 22%));',
    'opacity:0;transition:opacity 260ms ease;',
    '}',
    '[data-o-profile-on] [data-o-profile-inner]::after{opacity:1}',
    '[data-o-profile-head]{display:flex;align-items:center;gap:0.875rem;text-align:left}',
    // The portrait is one notch in front of the card: the parallax comes from there.
    '[data-o-profile-avatar]{',
    'flex:none;display:grid;place-items:center;overflow:hidden;',
    'width:3.5rem;height:3.5rem;border-radius:999px;',
    'background:color-mix(in oklab,var(--o-profile-tint) 18%,var(--o-theme-surface));',
    'border:1px solid var(--o-theme-line);',
    'transform:translateZ(var(--o-profile-lift));',
    'font-weight:600;',
    '}',
    '[data-o-profile-avatar] img{width:100%;height:100%;object-fit:cover}',
    '[data-o-profile-name]{margin:0;font-weight:600;line-height:1.2}',
    '[data-o-profile-subtitle]{margin:0.15rem 0 0;font-size:0.85em;color:var(--o-theme-muted)}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-profile-avatar]{transform:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/**
 * A profile card that tilts towards the pointer.
 *
 * @example
 * <ProfileCard name="Lea Marchand" subtitle="Product designer" avatar="/lea.jpg" className="o-rounded-2xl o-p-6">
 *   <p>Draws the journeys and keeps them up to date.</p>
 * </ProfileCard>
 *
 * @example
 * // Initials instead of a portrait, without sheen.
 * <ProfileCard name="Nour Bensaid" subtitle="Engineer" avatar="NB" sheen={0} />
 */
export function ProfileCard({
  name,
  subtitle,
  avatar,
  children,
  tilt = 10,
  speed = 8,
  sheen = 0.35,
  tint = 'var(--o-palette-brand-500)',
  ...rest
}: ProfileCardProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  const inner = useRef<HTMLDivElement | null>(null)
  const pointer = usePointerDamped({ host, speed, name: 'profile: pointer' })
  ensureProfileRules()

  useEffect(() => {
    const card = inner.current
    if (host === null || card === null || reduced) return
    if (!window.matchMedia('(hover) and (pointer: fine)').matches) return

    let on = false

    const onEnter = (): void => {
      on = true
      host.setAttribute('data-o-profile-on', '')
    }
    const onLeave = (): void => {
      on = false
      host.removeAttribute('data-o-profile-on')
      // The return to rest is left to the transition, not to the loop.
      card.style.transform = ''
    }

    const subscription = clock.subscribe(
      () => {
        if (!on) return
        const { x, y } = pointer.current
        // The sign of X is inverted: pointing right pushes the right edge down.
        card.style.transform = `rotateX(${(-y * tilt).toFixed(2)}deg) rotateY(${(x * tilt).toFixed(2)}deg)`
        card.style.setProperty('--o-profile-sx', `${(((x + 1) / 2) * 100).toFixed(1)}%`)
      },
      { priority: CLOCK_PRIORITY.render, name: 'profile' },
    )

    host.addEventListener('pointerenter', onEnter, { passive: true })
    host.addEventListener('pointerleave', onLeave, { passive: true })

    return () => {
      host.removeEventListener('pointerenter', onEnter)
      host.removeEventListener('pointerleave', onLeave)
      subscription.unsubscribe()
      onLeave()
    }
  }, [host, reduced, tilt, pointer])

  const { className, style } = mergePresentation({}, rest)

  const portrait =
    typeof avatar === 'string' ? (
      // The name is already in the card: the image does not repeat it.
      <img src={avatar} alt="" />
    ) : (
      avatar
    )

  return (
    <div
      {...rest}
      ref={setHost}
      className={className}
      style={
        {
          ...style,
          '--o-profile-tint': tint,
          '--o-profile-sheen': `${String(sheen * 100)}%`,
          '--o-profile-sx': '50%',
          '--o-profile-lift': `${String(tilt * 2.4)}px`,
        } as CSSProperties
      }
      data-o-profile=""
    >
      <div ref={inner} data-o-profile-inner="">
        <div data-o-profile-head="">
          {portrait !== undefined && portrait !== null ? (
            <div data-o-profile-avatar="" aria-hidden="true">
              {portrait}
            </div>
          ) : null}
          <div>
            <p data-o-profile-name="">{name}</p>
            {subtitle !== undefined ? <p data-o-profile-subtitle="">{subtitle}</p> : null}
          </div>
        </div>
        {children}
      </div>
    </div>
  )
}
