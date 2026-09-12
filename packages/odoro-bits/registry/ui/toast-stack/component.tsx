/**
 * Pile de notifications : les nouvelles se posent devant, les anciennes
 * reculent, et le survol etale le paquet.
 *
 * ## Trois notifications a la fois, pas trente
 *
 * Une pile qui grandit sans limite finit par couvrir la page qu'elle
 * commente. Au-dela de `max`, les plus anciennes sortent du paquet — elles
 * restent dans la liste que la page tient, mais cessent d'occuper l'ecran.
 *
 * ## Les decalages sont mesures, pas devines
 *
 * Etale, chaque carte se pose au-dessus de la precedente : le decalage vaut
 * donc la somme des hauteurs reelles, qui dependent du texte. Les hauteurs
 * sont relevees apres le rendu et ecrites en variables sur les elements — pas
 * en etat React, qui redemanderait un rendu a chaque mesure, donc une mesure
 * a chaque rendu.
 *
 * ## Le compte a rebours est une animation, et il se met en pause
 *
 * La barre de vie est une animation CSS dont la duree est celle de la
 * minuterie. Survoler ou entrer au clavier met les deux en pause d'un coup :
 * on ne perd pas une notification pendant qu'on la lit.
 *
 * ## Une region d'etat, pas une alerte
 *
 * `role="status"` est poli : le lecteur d'ecran finit sa phrase avant
 * d'annoncer. `aria-atomic="false"` limite l'annonce a ce qui vient
 * d'arriver, sinon les trois cartes seraient relues a chaque nouvelle.
 *
 * ## Mouvement reduit
 *
 * Les cartes paraissent en place et la barre de vie disparait ; le retrait
 * apres delai, lui, reste — c'est un comportement, pas une animation.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
} from 'react'

/** Nature d'une notification, qui donne sa teinte au filet. */
export type ToastTone = 'info' | 'succes' | 'alerte' | 'erreur'

/** Une notification. */
export interface ToastItem {
  /** Identifiant, unique dans la pile. */
  readonly id: string
  /** Titre, lu en premier. */
  readonly title: string
  /** Precision affichee sous le titre. */
  readonly description?: string
  /** Nature de la notification. @defaultValue 'info' */
  readonly tone?: ToastTone
}

/** Proprietes propres au composant. */
export interface ToastStackOwnProps {
  /** Les notifications, de la plus ancienne a la plus recente. */
  toasts: readonly ToastItem[]
  /** Nom de la region pour les lecteurs d'ecran. @defaultValue 'Notifications' */
  label?: string
  /** Appele quand une notification se retire, d'elle-meme ou a la main. */
  onDismiss?: (id: string) => void
  /** Delai avant retrait. Zero laisse la notification jusqu'au clic. @defaultValue 4000 */
  duration?: number
  /** Nombre de notifications visibles dans le paquet. @defaultValue 3 */
  max?: number
  /** Cote ou la pile est ancree. @defaultValue 'bottom' */
  side?: 'top' | 'bottom'
}

/** Toutes les proprietes. */
export type ToastStackProps = Customisable<ToastStackOwnProps>

/** Teinte de chaque nature, en tokens de la palette. */
const TONES: Readonly<Record<ToastTone, string>> = {
  info: 'var(--o-palette-brand-500)',
  succes: 'var(--o-palette-emerald-500)',
  alerte: 'var(--o-palette-amber-500)',
  erreur: 'var(--o-palette-rose-500)',
}

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-toast-stack'

/** Pose la pile, les cartes et la barre de vie, une fois par document. */
function ensureToastRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-toasts]{position:relative;z-index:var(--o-z-toast);width:min(22rem,100%)}',
    '[data-o-toasts] ol{position:relative;margin:0;padding:0;list-style:none;height:0}',
    '[data-o-toast]{',
    'position:absolute;left:0;right:0;',
    'display:flex;align-items:flex-start;gap:0.6rem;overflow:hidden;',
    'padding:0.7rem 0.8rem;border-radius:0.8rem;text-align:left;',
    'background:var(--o-theme-surface);border:1px solid var(--o-theme-line);',
    'box-shadow:0 10px 30px color-mix(in oklab,currentColor 14%,transparent);',
    'transform:translateY(var(--o-toast-y)) scale(var(--o-toast-scale));',
    'opacity:var(--o-toast-opacity);',
    'transition:transform var(--o-duration-slow) var(--o-ease-emphasized),',
    'opacity var(--o-duration-slow) linear;',
    'animation:o-toast-in var(--o-duration-slow) var(--o-ease-emphasized) both;',
    '}',
    '[data-o-toasts][data-o-toasts-side="bottom"] [data-o-toast]{bottom:0;transform-origin:bottom center}',
    '[data-o-toasts][data-o-toasts-side="top"] [data-o-toast]{top:0;transform-origin:top center}',
    // Le filet de nature, sur la tranche gauche.
    '[data-o-toast]::before{',
    'content:"";position:absolute;inset-block:0;left:0;width:3px;background:var(--o-toast-tone)}',
    '[data-o-toast-body]{flex:1 1 auto;min-width:0;display:flex;flex-direction:column;gap:0.15rem}',
    '[data-o-toast-title]{font-weight:600;font-size:0.9375em}',
    '[data-o-toast-text]{font-size:0.875em;opacity:0.7}',
    '[data-o-toast-close]{',
    'flex:none;display:inline-grid;place-items:center;width:1.5em;height:1.5em;',
    'border:0;border-radius:999px;background:transparent;color:inherit;font:inherit;',
    'cursor:pointer;opacity:0.5;transition:opacity var(--o-duration-fast) linear;',
    '}',
    '[data-o-toast-close]:is(:hover,:focus-visible){opacity:1}',
    '[data-o-toast-close]:focus-visible{outline:2px solid var(--o-toast-tone);outline-offset:1px}',
    // La barre de vie : sa duree est celle de la minuterie, sa pause aussi.
    '[data-o-toast-life]{',
    'position:absolute;left:0;bottom:0;height:2px;width:100%;',
    'background:var(--o-toast-tone);transform-origin:left center;',
    'animation:o-toast-life var(--o-toast-duration) linear forwards;',
    '}',
    '[data-o-toasts][data-o-toasts-paused] [data-o-toast-life]{animation-play-state:paused}',
    '@keyframes o-toast-life{from{transform:scaleX(1)}to{transform:scaleX(0)}}',
    // L'entree ne touche ni a `opacity` ni a `transform` : ces deux-la portent
    // la place de la carte dans le paquet, et une animation remplie vers l'avant
    // les figerait a leur valeur d'arrivee.
    '@keyframes o-toast-in{from{scale:0.9;translate:0 14px}to{scale:1;translate:none}}',
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-toast]{animation:none;transition:none}',
    '[data-o-toast-life]{display:none}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Une carte, avec sa minuterie propre. */
function ToastCard({
  toast,
  paused,
  duration,
  onDone,
}: {
  toast: ToastItem
  paused: boolean
  duration: number
  onDone: () => void
}): ReactElement {
  const left = useRef(duration)
  const startedAt = useRef(0)
  const done = useRef(onDone)

  // La derniere fonction connue, sans relancer la minuterie pour autant : la
  // remettre a zero a chaque rendu du parent ne laisserait jamais expirer.
  useEffect(() => {
    done.current = onDone
  })

  useEffect(() => {
    if (duration <= 0 || paused || left.current <= 0) return
    startedAt.current = Date.now()
    const timer = setTimeout(() => {
      done.current()
    }, left.current)
    return () => {
      clearTimeout(timer)
      left.current = Math.max(0, left.current - (Date.now() - startedAt.current))
    }
  }, [paused, duration])

  return (
    <li
      data-o-toast=""
      data-o-toast-id={toast.id}
      style={
        {
          '--o-toast-tone': TONES[toast.tone ?? 'info'],
          '--o-toast-duration': `${String(duration)}ms`,
        } as CSSProperties
      }
    >
      <span data-o-toast-body="">
        <span data-o-toast-title="">{toast.title}</span>
        {toast.description !== undefined && (
          <span data-o-toast-text="">{toast.description}</span>
        )}
      </span>
      <button
        type="button"
        data-o-toast-close=""
        aria-label={`Fermer ${toast.title}`}
        onClick={() => {
          done.current()
        }}
      >
        <span aria-hidden="true">{'×'}</span>
      </button>
      {duration > 0 && <span data-o-toast-life="" aria-hidden="true" />}
    </li>
  )
}

/**
 * Pile de notifications empilees, retirees apres un delai.
 *
 * @example
 * <ToastStack
 *   toasts={[{ id: '1', title: 'Brouillon enregistre', tone: 'succes' }]}
 *   onDismiss={(id) => { retirer(id) }}
 * />
 *
 * @example
 * // Ancree en haut, quatre cartes visibles, sans retrait automatique.
 * <ToastStack toasts={avis} onDismiss={retirer} side="top" max={4} duration={0} />
 */
export function ToastStack({
  toasts,
  label = 'Notifications',
  onDismiss,
  duration = 4000,
  max = 3,
  side = 'bottom',
  ...rest
}: ToastStackProps): ReactElement {
  const listRef = useRef<HTMLOListElement | null>(null)
  const [retired, setRetired] = useState<readonly string[]>([])
  // Un seul etat pour deux effets : la main posee sur la pile arrete les
  // minuteries et etale le paquet. Ce sont les deux moities du meme geste.
  const [paused, setPaused] = useState(false)
  ensureToastRules()

  // Retirees a l'ecran, mais peut-etre encore dans la liste de la page : la
  // pile n'efface rien chez elle, elle cesse seulement de le montrer.
  const alive = toasts.filter((toast) => !retired.includes(toast.id))
  // Une carte de plus que le paquet n'en montre : c'est elle qui s'efface
  // derriere les autres quand une nouvelle arrive.
  const shown = alive.slice(-(max + 1))

  const dismiss = (id: string): void => {
    setRetired((previous) => [...previous.filter((entry) => entry !== id), id])
    onDismiss?.(id)
  }

  // Les identifiants disparus de la liste n'ont plus a etre retenus.
  useEffect(() => {
    setRetired((previous) => {
      const kept = previous.filter((id) => toasts.some((toast) => toast.id === id))
      return kept.length === previous.length ? previous : kept
    })
  }, [toasts])

  // Les decalages : mesures apres le rendu, ecrits sur les elements.
  useLayoutEffect(() => {
    const cards = Array.from(
      listRef.current?.querySelectorAll<HTMLLIElement>('[data-o-toast]') ?? [],
    ).reverse()
    const sign = side === 'bottom' ? -1 : 1
    let offset = 0

    for (const [depth, card] of cards.entries()) {
      // Etalee, la carte se pose derriere la precedente ; empilee, elle
      // depasse d'une lisiere et recule d'un cran.
      const shift = paused ? offset : depth * 10
      card.style.setProperty('--o-toast-y', `${String(sign * shift)}px`)
      card.style.setProperty('--o-toast-scale', String(paused ? 1 : 1 - depth * 0.05))
      card.style.setProperty('--o-toast-opacity', String(depth >= max ? 0 : 1))
      card.style.zIndex = String(cards.length - depth)
      offset += card.offsetHeight + 8
    }
  })

  const { className, style } = mergePresentation({}, rest)

  return (
    <div
      {...rest}
      role="status"
      aria-atomic="false"
      aria-label={label}
      data-o-toasts=""
      data-o-toasts-side={side}
      data-o-toasts-paused={paused ? '' : undefined}
      className={className}
      style={style as CSSProperties}
      onPointerEnter={(event) => {
        setPaused(true)
        rest.onPointerEnter?.(event)
      }}
      onPointerLeave={(event) => {
        setPaused(false)
        rest.onPointerLeave?.(event)
      }}
      onFocusCapture={(event) => {
        setPaused(true)
        rest.onFocusCapture?.(event)
      }}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setPaused(false)
        rest.onBlurCapture?.(event)
      }}
    >
      <ol ref={listRef}>
        {shown.map((toast) => (
          <ToastCard
            key={toast.id}
            toast={toast}
            paused={paused}
            duration={duration}
            onDone={() => {
              dismiss(toast.id)
            }}
          />
        ))}
      </ol>
    </div>
  )
}
