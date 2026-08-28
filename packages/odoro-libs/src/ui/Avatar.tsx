/**
 * Avatar avec repli en initiales, et groupe superpose.
 *
 * @module
 */

import {
  Children,
  type CSSProperties,
  type HTMLAttributes,
  type ReactElement,
  type ReactNode,
  type Ref,
  useEffect,
  useState,
} from 'react'

import { cx } from '../styles/cx.js'

/** Taille d'un avatar. */
export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/** Gabarits : dimensions et corps de texte des initiales. */
const SIZE_CLASSES: Readonly<Record<AvatarSize, string>> = {
  xs: 'o-h-6 o-w-6 o-text-xs',
  sm: 'o-h-8 o-w-8 o-text-xs',
  md: 'o-h-10 o-w-10 o-text-sm',
  lg: 'o-h-12 o-w-12 o-text-base',
  xl: 'o-h-16 o-w-16 o-text-lg',
}

/**
 * Initiales de repli : premiere lettre des deux premiers mots du nom.
 *
 * @example
 * initialsOf('Jean Dupont') // 'JD'
 */
function initialsOf(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word.charAt(0))
    .join('')
    .toUpperCase()
}

/** Proprietes de {@link Avatar}. */
export interface AvatarProps extends Omit<HTMLAttributes<HTMLSpanElement>, 'className'> {
  /** Adresse de l'image. Sans elle, les initiales sont affichees d'emblee. */
  src?: string
  /** Texte alternatif de l'image, repris comme libelle du repli. */
  alt: string
  /** Nom dont sont tirees les initiales de repli. */
  name?: string
  /** Taille. @defaultValue 'md' */
  size?: AvatarSize
  /** Forme. @defaultValue 'circle' */
  shape?: 'circle' | 'square'
  /** Classes additionnelles. */
  className?: string
  /** Ref vers l'element conteneur. */
  ref?: Ref<HTMLSpanElement>
}

/**
 * Avatar : image si elle charge, initiales sinon.
 *
 * L'echec de chargement bascule sur les initiales sans laisser l'icone
 * d'image cassee du navigateur. Le repli porte `role="img"` et le libelle
 * `alt`, pour rester annonce comme l'image qu'il remplace.
 *
 * @example
 * <Avatar src={user.photoUrl} alt="Photo de Jean Dupont" name="Jean Dupont" />
 */
export function Avatar({
  src,
  alt,
  name,
  size = 'md',
  shape = 'circle',
  className,
  ref,
  ...rest
}: AvatarProps): ReactElement {
  const [failed, setFailed] = useState(false)

  // Une nouvelle adresse repart de zero : l'echec de la precedente ne la
  // concerne pas.
  useEffect(() => {
    setFailed(false)
  }, [src])

  const showImage = src !== undefined && !failed
  const initials = name === undefined ? '' : initialsOf(name)

  return (
    <span
      {...rest}
      ref={ref}
      className={cx(
        'o-inline-flex o-items-center o-justify-center o-shrink-0 o-select-none',
        'o-overflow-hidden o-bg-primary-soft o-text-primary o-font-medium',
        SIZE_CLASSES[size],
        shape === 'circle' ? 'o-rounded-full' : 'o-rounded-md',
        className,
      )}
      role={showImage ? undefined : 'img'}
      aria-label={showImage ? undefined : alt}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt}
          className="o-h-full o-w-full o-object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        // `aria-hidden` : le libelle est deja porte par le conteneur, les
        // initiales ne sont qu'un dessin.
        <span aria-hidden="true">{initials}</span>
      )}
    </span>
  )
}

/** Proprietes de {@link AvatarGroup}. */
export interface AvatarGroupProps extends Omit<
  HTMLAttributes<HTMLDivElement>,
  'className'
> {
  /** Avatars a superposer, du premier plan vers l'arriere. */
  children?: ReactNode
  /**
   * Nombre maximal d'avatars affiches. Au-dela, une pastille "+N" du meme
   * gabarit resume le reste.
   */
  max?: number
  /** Gabarit de la pastille "+N", a aligner sur celui des avatars. @defaultValue 'md' */
  size?: AvatarSize
  /** Classes additionnelles. */
  className?: string
}

/**
 * Rangee d'avatars superposes.
 *
 * Le chevauchement passe par un `marginInlineStart` negatif en style inline :
 * la feuille utilitaire ne fournit pas de marges negatives.
 *
 * @example
 * <AvatarGroup max={3}>
 *   <Avatar alt="Ana" name="Ana Ruiz" />
 *   <Avatar alt="Bob" name="Bob Marchand" />
 *   <Avatar alt="Chloe" name="Chloe Petit" />
 *   <Avatar alt="Dan" name="Dan Morel" />
 * </AvatarGroup>
 */
export function AvatarGroup({
  children,
  max,
  size = 'md',
  className,
  ...rest
}: AvatarGroupProps): ReactElement {
  const items = Children.toArray(children)
  const limit = max === undefined ? items.length : Math.max(0, max)
  const visible = items.slice(0, limit)
  const hidden = items.length - visible.length

  const overlap: CSSProperties = { marginInlineStart: '-0.5rem' }

  return (
    <div {...rest} className={cx('o-flex o-items-center', className)}>
      {visible.map((item, index) => (
        // Le lisere de surface detache chaque avatar de celui qu'il recouvre.
        <span
          key={index}
          className="o-inline-flex o-rounded-full o-border-w-2 o-border-surface"
          style={index === 0 ? undefined : overlap}
        >
          {item}
        </span>
      ))}
      {hidden > 0 ? (
        <span
          className={cx(
            'o-inline-flex o-items-center o-justify-center o-shrink-0 o-select-none',
            'o-rounded-full o-border-w-2 o-border-surface',
            'o-bg-surface-sunken o-text-fg-muted o-font-medium',
            SIZE_CLASSES[size],
          )}
          style={visible.length === 0 ? undefined : overlap}
        >
          +{hidden}
        </span>
      ) : null}
    </div>
  )
}
