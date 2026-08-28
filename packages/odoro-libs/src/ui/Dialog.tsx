/**
 * Boite de dialogue modale.
 *
 * Batie sur l'element `<dialog>` natif ouvert en mode modal. Le navigateur
 * fournit alors le piegeage du focus, la fermeture par Echap, l'inertie du
 * reste de la page et la couche superieure — quatre comportements qu'une
 * reimplementation en JavaScript rate presque toujours dans un cas limite.
 *
 * La seule chose que le natif ne sait pas faire est de retarder la fermeture
 * le temps d'une animation de sortie : c'est le role de `usePresence`.
 *
 * @module
 */

import {
  type HTMLAttributes,
  type MouseEvent,
  type ReactElement,
  type ReactNode,
  type SyntheticEvent,
  useCallback,
  useEffect,
  useId,
  useRef,
} from 'react'

import { usePresence } from '../motion/usePresence.js'
import { cx } from '../styles/cx.js'

/** Proprietes de {@link Dialog}. */
export interface DialogProps extends Omit<
  HTMLAttributes<HTMLDialogElement>,
  'className' | 'title'
> {
  /** Etat d'ouverture, pilote par l'application. */
  open: boolean
  /**
   * Appele lorsque l'utilisateur demande la fermeture : bouton, touche Echap,
   * ou clic sur l'arriere-plan.
   */
  onClose: () => void
  /**
   * Titre de la boite. Relie a l'element par `aria-labelledby` : c'est ce que
   * les lecteurs d'ecran annoncent a l'ouverture.
   */
  title: ReactNode
  /** Description facultative, annoncee apres le titre. */
  description?: ReactNode
  /** Contenu. */
  children?: ReactNode
  /** Pied de la boite, typiquement des boutons d'action. */
  footer?: ReactNode
  /** Ferme la boite au clic sur l'arriere-plan. @defaultValue true */
  closeOnBackdrop?: boolean
  /** Classes additionnelles appliquees a l'element `<dialog>`. */
  className?: string
}

/**
 * Boite de dialogue modale accessible.
 *
 * @example
 * <Dialog
 *   open={open}
 *   onClose={() => setOpen(false)}
 *   title="Supprimer le projet"
 *   description="Cette action est irreversible."
 *   footer={<Button tone="danger" onClick={remove}>Supprimer</Button>}
 * />
 */
export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  closeOnBackdrop = true,
  className,
  ...rest
}: DialogProps): ReactElement | null {
  const { ref, isMounted } = usePresence<HTMLDialogElement>(open, {
    enter: { opacity: 0, transform: 'translateY(0.5rem) scale(0.98)' },
    duration: 'fast',
  })

  const titleId = useId()
  const descriptionId = useId()
  const closeRef = useRef(onClose)
  closeRef.current = onClose

  // `showModal()` ne peut etre appele qu'une fois l'element dans le document.
  useEffect(() => {
    const dialog = ref.current
    if (dialog === null || !isMounted) return
    if (typeof dialog.showModal !== 'function') return
    if (!dialog.open) dialog.showModal()
    return () => {
      if (dialog.open) dialog.close()
    }
  }, [ref, isMounted])

  // La touche Echap declenche l'evenement `cancel` du natif : on l'intercepte
  // pour passer par l'etat applicatif, sinon la boite se fermerait sans
  // animation et sans que l'application le sache.
  const handleCancel = useCallback((event: SyntheticEvent<HTMLDialogElement>) => {
    event.preventDefault()
    closeRef.current()
  }, [])

  const handleClick = useCallback(
    (event: MouseEvent<HTMLDialogElement>) => {
      if (!closeOnBackdrop) return
      // Un clic sur l'arriere-plan a pour cible le `<dialog>` lui-meme : le
      // contenu est dans un enfant, donc tout clic interieur a une autre cible.
      if (event.target === ref.current) closeRef.current()
    },
    [closeOnBackdrop, ref],
  )

  if (!isMounted) return null

  return (
    <dialog
      {...rest}
      ref={ref}
      aria-labelledby={titleId}
      aria-describedby={description === undefined ? undefined : descriptionId}
      onCancel={handleCancel}
      onClick={handleClick}
      className={cx(
        'o-w-full o-max-w-md o-rounded-lg o-border-w-1 o-border-border',
        'o-bg-surface-raised o-text-fg o-shadow-lg o-p-0',
        className,
      )}
    >
      <div className="o-flex o-flex-col o-gap-4 o-p-6">
        <div className="o-flex o-flex-col o-gap-1">
          <h2 id={titleId} className="o-text-lg o-font-semibold">
            {title}
          </h2>
          {description === undefined ? null : (
            <p id={descriptionId} className="o-text-sm o-text-fg-muted">
              {description}
            </p>
          )}
        </div>

        {children}

        {footer === undefined ? null : (
          <div className="o-flex o-justify-end o-gap-2">{footer}</div>
        )}
      </div>
    </dialog>
  )
}
