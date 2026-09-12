/**
 * Bandeau d'appel a l'action.
 *
 * ## Un appel, pas deux
 *
 * Le bandeau accepte une action principale et, au plus, une secondaire — et
 * elles ne se ressemblent pas. Deux boutons de meme poids ne posent pas une
 * question, ils la reportent : la personne choisit de ne rien faire, ce qui
 * est le seul choix qui ne demande pas de trancher.
 *
 * ## Un lien reste un lien, un bouton reste un bouton
 *
 * L'action porte une adresse ou une fonction, jamais les deux au hasard. Ce
 * n'est pas une coquetterie de balisage : un lien s'ouvre dans un nouvel
 * onglet, se copie, s'annonce comme « lien » ; un bouton fait quelque chose ici
 * et maintenant. Un `<div onClick>` ne fait ni l'un ni l'autre, et se voit tout
 * de suite au clavier.
 *
 * ## Le reflet passe une fois
 *
 * Il balaie le bandeau a l'entree dans le champ, puis s'arrete. Une brillance
 * en boucle sur un appel a l'action attire l'oeil en permanence sur un objet
 * qui n'a plus rien a dire une fois lu : c'est ce qui fait qu'on cesse de le
 * voir. Sous mouvement reduit, il ne passe pas du tout.
 *
 * ## Le titre est un vrai titre
 *
 * Le bandeau ouvre un niveau de titre, parce qu'il en est un dans le plan de la
 * page. Ecrit en gros texte, il serait invisible dans le sommaire qu'un lecteur
 * d'ecran fabrique — et c'est ainsi que l'on navigue quand on n'y voit pas.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import { type CSSProperties, type ReactElement, type ReactNode } from 'react'

import { useInView } from '@/odoro/hooks/useInView'

/** Une action du bandeau. */
export interface CtaAction {
  /** Ce qui est ecrit dessus. */
  readonly label: string
  /** Adresse : l'action est alors un lien. */
  readonly href?: string
  /** Fonction : l'action est alors un bouton. */
  readonly onClick?: () => void
}

/** Proprietes propres au composant. */
export interface CtaBandOwnProps {
  /** Ce qu'on propose, en une phrase. */
  title: ReactNode
  /** L'action principale. */
  primary: CtaAction
  /** Une precision sous le titre. */
  body?: ReactNode
  /** Une seconde action, discrete. */
  secondary?: CtaAction
  /** Niveau de titre rendu. @defaultValue 'h2' */
  headingLevel?: 'h2' | 'h3'
  /** Nom de la section, annonce aux technologies d'assistance. */
  label?: string
}

/** Toutes les proprietes. */
export type CtaBandProps = Customisable<CtaBandOwnProps, 'section'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-cta-band'

/** Pose les regles du bandeau, une fois par document. */
function ensureCtaRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-cta]{position:relative;overflow:hidden;isolation:isolate}',
    '[data-o-cta-reflet]{',
    'position:absolute;inset:0;pointer-events:none;z-index:-1;',
    'transform:translateX(-100%);opacity:0}',
    // `forwards` retient l'etat de fin : sans lui, le reflet reviendrait a sa
    // position de depart et clignoterait a la derniere image.
    '[data-o-cta-vu] [data-o-cta-reflet]{',
    'animation:o-cta-balayage 1.4s var(--o-ease-standard) 0.15s forwards}',
    '@keyframes o-cta-balayage{',
    '0%{transform:translateX(-100%);opacity:0}',
    '25%{opacity:1}',
    '100%{transform:translateX(100%);opacity:0}}',

    '[data-o-cta-corps]{',
    'opacity:0;transform:translateY(12px);',
    'transition:opacity var(--o-duration-slower) var(--o-ease-entrance),',
    'transform var(--o-duration-slower) var(--o-ease-entrance)}',
    '[data-o-cta-vu] [data-o-cta-corps]{opacity:1;transform:none}',

    '@media (prefers-reduced-motion:reduce){',
    '[data-o-cta-reflet]{display:none}',
    '[data-o-cta-corps]{opacity:1;transform:none;transition:none}}',
  ].join('')
  document.head.append(style)
}

/** Rend une action, en lien ou en bouton selon ce qu'elle porte. */
function Action({
  action,
  principale,
}: {
  action: CtaAction
  principale: boolean
}): ReactElement {
  const classes = [
    'o-inline-flex o-items-center o-justify-center o-rounded-lg o-px-5 o-py-2.5',
    'o-text-sm o-font-medium focus:o-ring',
  ].join(' ')

  const habillage: CSSProperties = principale
    ? {
        backgroundColor: 'var(--o-palette-brand-600)',
        color: 'var(--o-palette-white)',
        textDecoration: 'none',
        border: '1px solid transparent',
        cursor: 'pointer',
      }
    : {
        backgroundColor: 'transparent',
        color: 'var(--o-theme-fg)',
        textDecoration: 'none',
        border: '1px solid var(--o-theme-line)',
        cursor: 'pointer',
      }

  if (action.href !== undefined) {
    return (
      <a href={action.href} className={classes} style={habillage}>
        {action.label}
      </a>
    )
  }

  return (
    <button type="button" onClick={action.onClick} className={classes} style={habillage}>
      {action.label}
    </button>
  )
}

/**
 * Un bandeau d'appel a l'action.
 *
 * @example
 * <CtaBand
 *   title="Installez la premiere entree en une commande"
 *   body="Le code est copie chez vous : il vous appartient des la premiere seconde."
 *   primary={{ label: 'Commencer', href: '/installation' }}
 *   secondary={{ label: 'Lire le contrat', href: '/contrat' }}
 * />
 */
export function CtaBand({
  title,
  primary,
  body,
  secondary,
  headingLevel = 'h2',
  label,
  ...rest
}: CtaBandProps): ReactElement {
  const { ref, vu } = useInView<HTMLElement>({ amount: 0.25 })
  const Titre = headingLevel

  ensureCtaRules()

  const { className, style } = mergePresentation(
    { className: 'o-rounded-2xl o-px-8 o-py-12' },
    rest,
  )

  return (
    <section
      {...rest}
      ref={ref}
      aria-label={label}
      data-o-cta=""
      data-o-cta-vu={vu ? '' : undefined}
      className={className}
      style={
        {
          ...style,
          backgroundColor:
            'color-mix(in oklab, var(--o-palette-brand-500) 10%, var(--o-theme-surface))',
          border:
            '1px solid color-mix(in oklab, var(--o-palette-brand-500) 35%, transparent)',
        } as CSSProperties
      }
    >
      <span
        aria-hidden
        data-o-cta-reflet=""
        style={{
          backgroundImage:
            'linear-gradient(100deg, transparent 30%, color-mix(in oklab, var(--o-palette-brand-400) 45%, transparent) 50%, transparent 70%)',
        }}
      />

      <div
        data-o-cta-corps=""
        className="o-flex o-flex-col o-items-center o-gap-6 o-text-center"
      >
        <div className="o-flex o-max-w-2xl o-flex-col o-gap-3">
          <Titre
            className="o-text-2xl o-font-bold o-tracking-tight o-text-balance"
            style={{ color: 'var(--o-theme-fg)' }}
          >
            {title}
          </Titre>
          {body !== undefined && (
            <p
              className="o-text-sm o-leading-relaxed"
              style={{ color: 'var(--o-theme-muted)' }}
            >
              {body}
            </p>
          )}
        </div>

        <div className="o-flex o-flex-wrap o-items-center o-justify-center o-gap-3">
          <Action action={primary} principale />
          {secondary !== undefined && <Action action={secondary} principale={false} />}
        </div>
      </div>
    </section>
  )
}
