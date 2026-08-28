/**
 * Panneau riche ancre a un declencheur.
 *
 * Contrairement a l'infobulle, le panneau est interactif : il recoit le focus,
 * se ferme au clic exterieur et sur Echap, et rend alors le focus au
 * declencheur. Le positionnement reste purement CSS, sur une enveloppe
 * distincte du panneau anime pour que `usePresence` puisse piloter `transform`
 * sans ecraser le centrage.
 *
 * @module
 */

import {
  type ReactElement,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from 'react'

import { usePresence } from '../motion/usePresence.js'
import { cx } from '../styles/cx.js'

/** Proprietes de {@link Popover}. */
export interface PopoverProps {
  /** Contenu du bouton declencheur. */
  trigger: ReactNode
  /** Contenu du panneau. */
  children?: ReactNode
  /** Cote d'apparition. @defaultValue 'bottom' */
  placement?: 'top' | 'bottom'
  /** Alignement du panneau sur le declencheur. @defaultValue 'start' */
  align?: 'start' | 'center' | 'end'
  /** Etat d'ouverture en mode controle. */
  open?: boolean
  /** Etat d'ouverture initial en mode non controle. @defaultValue false */
  defaultOpen?: boolean
  /** Appele a chaque demande d'ouverture ou de fermeture. */
  onOpenChange?: (open: boolean) => void
  /** Classes additionnelles pour le panneau. */
  className?: string
  /** Classes additionnelles pour le bouton declencheur. */
  triggerClassName?: string
}

/** Classes de placement de l'enveloppe positionnee. */
const PLACEMENT_CLASSES: Readonly<Record<'top' | 'bottom', string>> = {
  top: 'o-bottom-full o-mb-2',
  bottom: 'o-top-full o-mt-2',
}

/** Classes d'alignement de l'enveloppe positionnee. */
const ALIGN_CLASSES: Readonly<Record<'start' | 'center' | 'end', string>> = {
  start: 'o-left-0',
  center: 'o-left-1/2 o-translate-center-x',
  end: 'o-right-0',
}

/**
 * Panneau contextuel accessible.
 *
 * @example
 * <Popover trigger="Filtres" placement="bottom" align="end">
 *   <FilterForm />
 * </Popover>
 */
export function Popover({
  trigger,
  children,
  placement = 'bottom',
  align = 'start',
  open,
  defaultOpen = false,
  onOpenChange,
  className,
  triggerClassName,
}: PopoverProps): ReactElement {
  const panelId = useId()
  const [internal, setInternal] = useState(defaultOpen)
  const isOpen = open ?? internal

  const wrapperRef = useRef<HTMLDivElement | null>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  const { ref, isMounted } = usePresence<HTMLDivElement>(isOpen, {
    enter: { opacity: 0, transform: 'translateY(0.25rem) scale(0.98)' },
    duration: 'fast',
    initial: true,
  })

  const setOpen = useCallback(
    (next: boolean) => {
      if (open === undefined) setInternal(next)
      onOpenChange?.(next)
    },
    [onOpenChange, open],
  )

  const close = useCallback(
    (restoreFocus: boolean) => {
      // Le focus n'est rendu que s'il est encore dans le composant : au clic
      // exterieur, il appartient deja a l'element clique.
      if (restoreFocus || wrapperRef.current?.contains(document.activeElement) === true) {
        triggerRef.current?.focus()
      }
      setOpen(false)
    },
    [setOpen],
  )

  // Fermeture au clic exterieur et sur Echap, ou que soit le focus. Les
  // ecouteurs ne vivent que pendant l'ouverture.
  useEffect(() => {
    if (!isOpen) return

    const handlePointerDown = (event: PointerEvent) => {
      if (wrapperRef.current?.contains(event.target as Node) === true) return
      close(false)
    }
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') close(true)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [close, isOpen])

  return (
    <div ref={wrapperRef} className="o-relative o-inline-block">
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        aria-controls={isMounted ? panelId : undefined}
        onClick={() => setOpen(!isOpen)}
        className={cx('o-cursor-pointer', triggerClassName)}
      >
        {trigger}
      </button>
      {isMounted ? (
        <div
          className={cx(
            'o-absolute o-z-overlay',
            PLACEMENT_CLASSES[placement],
            ALIGN_CLASSES[align],
          )}
        >
          <div
            ref={ref}
            role="dialog"
            id={panelId}
            className={cx(
              'o-bg-surface-raised o-text-fg o-border-w-1 o-border-border',
              'o-rounded-lg o-shadow-lg o-p-4',
              className,
            )}
          >
            {children}
          </div>
        </div>
      ) : null}
    </div>
  )
}
