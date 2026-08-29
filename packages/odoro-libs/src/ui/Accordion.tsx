/**
 * Accordeon a sections repliables.
 *
 * Suit le motif APG : chaque en-tete est un `<button>` dans un titre `<h3>`,
 * relie a sa region par `aria-controls` et `aria-expanded`. L'ouverture est
 * animee en hauteur a partir de la valeur mesuree — `height: auto` n'est pas
 * animable, il faut passer par `scrollHeight` comme le fait l'indicateur de
 * `Tabs`.
 *
 * @module
 */

import {
  type ReactElement,
  type ReactNode,
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from 'react'

import { motionDuration, motionEasing } from '../motion/tokens.js'
import { usePrefersReducedMotion } from '../shared/motionPreference.js'
import { cx } from '../styles/cx.js'

/** Une section de l'accordeon. */
export interface AccordionItem {
  /** Identifiant unique de la section. */
  readonly id: string
  /** Titre affiche dans l'en-tete cliquable. */
  readonly title: ReactNode
  /** Contenu de la region depliee. */
  readonly content: ReactNode
  /** Rend la section inactivable. */
  readonly disabled?: boolean
}

/** Proprietes de {@link Accordion}. */
export interface AccordionProps {
  /** Sections, dans l'ordre d'affichage. */
  items: readonly AccordionItem[]
  /**
   * `'single'` n'autorise qu'une section ouverte a la fois ; `'multiple'`
   * laisse chaque section independante.
   *
   * @defaultValue 'single'
   */
  type?: 'single' | 'multiple'
  /** Sections ouvertes initialement, en mode non controle. */
  defaultValue?: string | readonly string[]
  /**
   * Sections ouvertes en mode controle. Toujours exprimees en tableau
   * d'identifiants, meme en mode `single`, pour que le type ne depende pas du
   * mode.
   */
  value?: string | readonly string[]
  /** Appele a chaque changement, avec la liste des sections ouvertes. */
  onValueChange?: (value: readonly string[]) => void
  /**
   * En mode `single`, autorise a refermer la section ouverte pour que tout
   * soit clos.
   *
   * @defaultValue true
   */
  collapsible?: boolean
  /** Classes additionnelles pour le conteneur. */
  className?: string
}

/** Normalise une valeur simple ou multiple en tableau d'identifiants. */
function toIds(value: string | readonly string[] | undefined): readonly string[] {
  if (value === undefined) return []
  return typeof value === 'string' ? [value] : value
}

/** Chevron d'en-tete. Purement decoratif : l'etat est porte par `aria-expanded`. */
function Chevron({ open }: { open: boolean }): ReactElement {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      aria-hidden="true"
      focusable="false"
      className={cx('o-shrink-0 o-transition-transform', open && 'o-rotate-180')}
    >
      <path
        d="M6 9l6 6 6-6"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Proprietes de {@link Region}. */
interface RegionProps {
  open: boolean
  id: string
  labelId: string
  children: ReactNode
}

/**
 * Region depliable d'une section.
 *
 * Le contenu reste monte pendant l'animation de fermeture : le demontage n'a
 * lieu qu'une fois la hauteur revenue a zero, sinon il n'y aurait plus rien a
 * animer.
 */
function Region({ open, id, labelId, children }: RegionProps): ReactElement | null {
  const ref = useRef<HTMLDivElement | null>(null)
  const animationRef = useRef<Animation | null>(null)
  const isFirstRun = useRef(true)
  const reduced = usePrefersReducedMotion()
  const [isMounted, setIsMounted] = useState(open)

  // Le montage doit preceder l'animation d'entree, comme dans `usePresence`.
  useLayoutEffect(() => {
    if (open) setIsMounted(true)
  }, [open])

  useLayoutEffect(() => {
    const element = ref.current
    const first = isFirstRun.current
    isFirstRun.current = false

    if (element === null || !isMounted) return
    // L'etat initial est rendu tel quel : animer au premier rendu ferait
    // clignoter les sections ouvertes par defaut.
    if (first) return

    animationRef.current?.cancel()
    animationRef.current = null

    if (reduced || typeof element.animate !== 'function') {
      if (!open) setIsMounted(false)
      return
    }

    const height = `${element.scrollHeight}px`
    const animation = element.animate(
      open ? [{ height: '0px' }, { height }] : [{ height }, { height: '0px' }],
      {
        duration: motionDuration.base,
        easing: open ? motionEasing.entrance : motionEasing.exit,
        fill: 'both',
      },
    )
    animationRef.current = animation

    void animation.finished.then(
      () => {
        if (animationRef.current !== animation) return
        // La hauteur naturelle reprend la main : on relache l'animation
        // plutot que de la laisser figer une hauteur mesuree.
        animation.cancel()
        animationRef.current = null
        if (!open) setIsMounted(false)
      },
      () => undefined,
    )
  }, [open, isMounted, reduced])

  if (!isMounted) return null

  return (
    <div
      ref={ref}
      role="region"
      id={id}
      aria-labelledby={labelId}
      className="o-overflow-hidden"
    >
      <div className="o-pb-4 o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
        {children}
      </div>
    </div>
  )
}

/**
 * Accordeon accessible a une ou plusieurs sections ouvertes.
 *
 * @example
 * <Accordion
 *   items={[
 *     { id: 'compte', title: 'Compte', content: <AccountForm /> },
 *     { id: 'facturation', title: 'Facturation', content: <BillingForm /> },
 *   ]}
 *   defaultValue="compte"
 * />
 */
export function Accordion({
  items,
  type = 'single',
  defaultValue,
  value,
  onValueChange,
  collapsible = true,
  className,
}: AccordionProps): ReactElement {
  const baseId = useId()
  const [internal, setInternal] = useState<readonly string[]>(() => toIds(defaultValue))
  const openIds = value === undefined ? internal : toIds(value)

  const toggle = useCallback(
    (id: string) => {
      const isOpen = openIds.includes(id)
      // En mode single non repliable, refermer la seule section ouverte
      // laisserait tout clos : on ignore la demande.
      if (type === 'single' && isOpen && !collapsible) return

      const next: readonly string[] =
        type === 'single'
          ? isOpen
            ? []
            : [id]
          : isOpen
            ? openIds.filter((openId) => openId !== id)
            : [...openIds, id]

      if (value === undefined) setInternal(next)
      onValueChange?.(next)
    },
    [collapsible, onValueChange, openIds, type, value],
  )

  return (
    <div className={cx('o-flex o-flex-col', className)}>
      {items.map((item) => {
        const open = openIds.includes(item.id)
        const headerId = `${baseId}-header-${item.id}`
        const regionId = `${baseId}-region-${item.id}`
        return (
          <div
            key={item.id}
            className="o-border-b o-border-zinc-200 dark:o-border-zinc-800"
          >
            <h3 className="o-m-0">
              <button
                type="button"
                id={headerId}
                aria-expanded={open}
                aria-controls={regionId}
                aria-disabled={item.disabled || undefined}
                onClick={() => {
                  if (item.disabled !== true) toggle(item.id)
                }}
                className={cx(
                  'o-flex o-w-full o-items-center o-justify-between o-gap-2',
                  'o-py-3 o-text-left o-text-base o-font-medium o-text-zinc-900 dark:o-text-zinc-50 o-transition',
                  item.disabled === true
                    ? 'o-opacity-50 o-cursor-not-allowed'
                    : 'o-cursor-pointer hover:o-text-zinc-900 dark:hover:o-text-zinc-50',
                )}
              >
                {item.title}
                <Chevron open={open} />
              </button>
            </h3>
            <Region open={open} id={regionId} labelId={headerId}>
              {item.content}
            </Region>
          </div>
        )
      })}
    </div>
  )
}
