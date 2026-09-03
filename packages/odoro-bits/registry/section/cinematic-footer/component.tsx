/**
 * Pied de page en rideau : la page glisse par-dessus, il se decouvre dessous.
 *
 * ## Comment le rideau tient
 *
 * Le pied de page est en `fixed`, et son enveloppe porte un `clip-path`. C'est
 * la seule piece du montage : un element decoupe devient bloc conteneur pour
 * ses descendants fixes, si bien que le pied de page ne se colle pas a la
 * fenetre mais reste borne a l'enveloppe. Il apparait donc a mesure que
 * l'enveloppe entre dans le champ, sans qu'aucun JavaScript ne le deplace.
 *
 * Retirer le `clip-path` casse l'effet en silence : le pied de page se colle
 * alors a la fenetre et reste visible sur toute la page.
 *
 * ## Ce qui est confie au defilement, et ce qui ne l'est pas
 *
 * Le mot de fond et le bloc central sont asservis a la progression du
 * defilement. Rien d'autre. Le rideau, lui, est de la mise en page : le confier
 * a une animation le ferait dependre d'une mesure, alors qu'il decoule de la
 * geometrie.
 *
 * Sous mouvement reduit, `useScrollScrub` applique l'etat **final** une fois :
 * le contenu est en place, sans course. Le rideau continue de fonctionner,
 * puisqu'il n'anime rien — c'est la page qui defile.
 *
 * ## Pourquoi les couleurs passent par deux variables
 *
 * Le systeme n'a pas de couche semantique : il n'existe ni `--foreground` ni
 * `--background` a interroger. Les degrades, le masque de grille et le verre
 * en ont pourtant besoin, et les ecrire en dur les figerait dans un theme.
 *
 * L'enveloppe declare donc deux variables privees, definies dans les deux
 * themes a partir de la palette. Ce sont les seules du composant, et elles ne
 * sortent pas de lui.
 *
 * @module
 */

import {
  mergePresentation,
  useMotionState,
  useScrollScrub,
  type Customisable,
} from '@odoro-cli/engine'
import { useRef, type ReactElement, type ReactNode } from 'react'

import { Magnetic } from '@registre/effect/Magnetic'
import { Marquee } from '@registre/effect/Marquee'

/** Proprietes propres au composant. */
export interface CinematicFooterOwnProps {
  /** Titre du bloc central. */
  heading?: ReactNode
  /** Mot pose en fond, derriere tout le reste. */
  word?: string
  /** Contenu du bandeau defilant. Rien n'est affiche s'il est absent. */
  banner?: ReactNode
  /** Actions principales, rendues en pastilles magnetiques. */
  actions?: ReactNode
  /** Liens secondaires, rendus en pastilles plus petites. */
  links?: ReactNode
  /** Mention de bas de page, a gauche. */
  copyright?: ReactNode
  /** Signature, au centre de la barre basse. */
  signature?: ReactNode
  /** Libelle du bouton de remontee. @defaultValue 'Revenir en haut' */
  topLabel?: string
}

/** Toutes les proprietes. */
export type CinematicFooterProps = Customisable<CinematicFooterOwnProps>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-cinematic-footer'

/**
 * Pose les regles du pied de page, une fois par document.
 *
 * Tout ce qui est ici est hors de portee des utilitaires : un contour de
 * texte, un masque de degrade, un fond de grille, une teinte melangee. Le
 * reste de l'habillage reste en classes.
 */
function ensureFooterRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const palette = [
    '[data-o-footer]{',
    '--o-footer-ink:var(--o-palette-zinc-950);',
    '--o-footer-ground:var(--o-palette-zinc-50);',
    '--o-footer-glow-a:var(--o-palette-brand-500);',
    '--o-footer-glow-b:var(--o-palette-fuchsia-500)}',
  ].join('')

  const dark = [
    '[data-o-footer]{',
    '--o-footer-ink:var(--o-palette-zinc-50);',
    '--o-footer-ground:var(--o-palette-zinc-950)}',
  ].join('')

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    palette,
    `:root[data-theme="dark"] ${dark}`,
    `@media (prefers-color-scheme:dark){:root:not([data-theme="light"]) ${dark}}`,

    // Halo : une nappe radiale qui respire lentement.
    '[data-o-footer-glow]{background:radial-gradient(circle at 50% 50%,',
    'color-mix(in oklch,var(--o-footer-glow-a) 18%,transparent) 0%,',
    'color-mix(in oklch,var(--o-footer-glow-b) 18%,transparent) 40%,transparent 70%);',
    'animation:o-footer-breathe 8s var(--o-ease-standard) infinite alternate}',
    '@keyframes o-footer-breathe{to{transform:translate(-50%,-50%) scale(1.1)}}',

    // Grille de fond, estompee aux deux extremites.
    '[data-o-footer-grid]{background-size:60px 60px;background-image:',
    'linear-gradient(to right,color-mix(in oklch,var(--o-footer-ink) 6%,transparent) 1px,transparent 1px),',
    'linear-gradient(to bottom,color-mix(in oklch,var(--o-footer-ink) 6%,transparent) 1px,transparent 1px);',
    '-webkit-mask:linear-gradient(to bottom,transparent,black 30%,black 70%,transparent);',
    'mask:linear-gradient(to bottom,transparent,black 30%,black 70%,transparent)}',

    // Mot de fond : un contour, et un degrade qui s'eteint vers le bas.
    '[data-o-footer-word]{font-size:26vw;line-height:0.75;letter-spacing:-0.05em;',
    'color:transparent;-webkit-text-stroke:1px color-mix(in oklch,var(--o-footer-ink) 10%,transparent);',
    'background:linear-gradient(180deg,color-mix(in oklch,var(--o-footer-ink) 14%,transparent) 0%,transparent 60%);',
    '-webkit-background-clip:text;background-clip:text}',

    // Verre : un fond melange, un liseré, et un flou d'arriere-plan.
    '[data-o-footer-pill]{background:linear-gradient(145deg,',
    'color-mix(in oklch,var(--o-footer-ink) 5%,transparent) 0%,',
    'color-mix(in oklch,var(--o-footer-ink) 2%,transparent) 100%);',
    'border:1px solid color-mix(in oklch,var(--o-footer-ink) 10%,transparent);',
    'box-shadow:0 10px 30px -10px color-mix(in oklch,var(--o-footer-ground) 50%,transparent);',
    '-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);',
    'transition:background var(--o-duration-slow) var(--o-ease-standard),',
    'border-color var(--o-duration-slow) var(--o-ease-standard)}',
    '[data-o-footer-pill]:hover{',
    'background:linear-gradient(145deg,',
    'color-mix(in oklch,var(--o-footer-ink) 10%,transparent) 0%,',
    'color-mix(in oklch,var(--o-footer-ink) 4%,transparent) 100%);',
    'border-color:color-mix(in oklch,var(--o-footer-ink) 22%,transparent)}',

    // Battement : la couleur vient du texte, donc d'une classe, donc d'un token.
    '[data-o-footer-beat]{animation:o-footer-beat 2s var(--o-ease-standard) infinite}',
    '@keyframes o-footer-beat{0%,100%{transform:scale(1)}15%,45%{transform:scale(1.18)}30%{transform:scale(1)}}',

    '@media (prefers-reduced-motion:reduce){',
    '[data-o-footer-glow],[data-o-footer-beat]{animation:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Pied de page decouvert par le defilement.
 *
 * @example
 * <CinematicFooter
 *   heading="On commence ?"
 *   word="ODORO"
 *   actions={<a href="/contact">Nous ecrire</a>}
 *   copyright="© 2026 Odoro"
 * />
 *
 * @example
 * // Le bandeau est un emplacement : il recoit ce que la page a a dire.
 * <CinematicFooter banner={<span className="o-px-8">Disponible en mars</span>} />
 */
export function CinematicFooter({
  heading = 'On commence ?',
  word,
  banner,
  actions,
  links,
  copyright,
  signature,
  topLabel = 'Revenir en haut',
  ...rest
}: CinematicFooterProps): ReactElement {
  const { reduced } = useMotionState()
  const wordRef = useRef<HTMLDivElement | null>(null)
  const centreRef = useRef<HTMLDivElement | null>(null)

  ensureFooterRules()

  // Une seule mesure pour les deux mouvements : deux declencheurs sur la meme
  // plage produiraient deux lectures de la meme progression.
  const { ref } = useScrollScrub<HTMLDivElement>(
    (progress) => {
      // Le nom evite celui de la prop : la fermeture la capture, et deux
      // « word » a deux lignes d'ecart se relisent mal.
      const backdrop = wordRef.current
      if (backdrop !== null) {
        backdrop.style.transform = `translate3d(-50%,${String((1 - progress) * 10)}vh,0) scale(${String(0.86 + progress * 0.14)})`
        backdrop.style.opacity = progress.toFixed(3)
      }

      const centre = centreRef.current
      if (centre !== null) {
        // Le bloc central arrive plus tard que le mot : la moitie basse de la
        // course lui suffit, et il finit en place avant la barre du bas.
        const own = Math.max(0, Math.min(1, (progress - 0.35) / 0.45))
        centre.style.transform = `translate3d(0,${String((1 - own) * 50)}px,0)`
        centre.style.opacity = own.toFixed(3)
      }
    },
    { start: 'top bottom', end: 'bottom bottom', name: 'pied-de-page' },
  )

  const { className, style } = mergePresentation(
    { className: 'o-relative o-h-screen o-w-full' },
    rest,
  )

  return (
    <div
      {...rest}
      ref={ref}
      data-o-footer
      className={className}
      style={{
        // La decoupe est ce qui borne le pied de page fixe a cette enveloppe.
        // Sans elle, il se collerait a la fenetre sur toute la page.
        clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 100%)',
        ...style,
      }}
    >
      <footer className="o-fixed o-bottom-0 o-left-0 o-flex o-h-screen o-w-full o-flex-col o-justify-between o-overflow-hidden o-bg-zinc-50 o-text-zinc-950 dark:o-bg-zinc-950 dark:o-text-zinc-50">
        <div
          aria-hidden
          data-o-footer-glow
          className="o-pointer-events-none o-absolute o-left-1/2 o-top-1/2 o-h-1/2 o-w-4/5 o-rounded-full o-blur-3xl"
          style={{ transform: 'translate(-50%,-50%)' }}
        />
        <div
          aria-hidden
          data-o-footer-grid
          className="o-pointer-events-none o-absolute o-inset-0"
        />

        {/* Le recentrage est pose des le depart : la mesure du defilement
            n'arrive qu'apres la premiere peinture, et le mot sauterait d'une
            demi-largeur entre les deux. */}
        {word === undefined ? null : (
          <div
            aria-hidden
            ref={wordRef}
            data-o-footer-word
            style={{ transform: 'translate3d(-50%,0,0)' }}
            className="o-pointer-events-none o-absolute o-bottom-0 o-left-1/2 o-select-none o-whitespace-nowrap o-font-bold"
          >
            {word}
          </div>
        )}

        {banner === undefined ? null : (
          <Marquee
            className="o-absolute o-top-12 o-w-full o-border-t o-border-b o-border-zinc-200 o-py-4 o-text-xs o-font-bold o-uppercase o-tracking-widest o-text-zinc-500 dark:o-border-zinc-800"
            style={{ transform: 'rotate(-2deg) scale(1.1)' }}
          >
            {banner}
          </Marquee>
        )}

        <div
          ref={centreRef}
          className="o-relative o-mx-auto o-flex o-flex-1 o-w-full o-max-w-5xl o-flex-col o-items-center o-justify-center o-gap-10 o-px-6"
        >
          <h2 className="o-text-center o-text-5xl o-font-bold o-tracking-tight md:o-text-7xl">
            {heading}
          </h2>

          {actions === undefined ? null : (
            <div className="o-flex o-flex-wrap o-justify-center o-gap-4">{actions}</div>
          )}

          {links === undefined ? null : (
            <div className="o-flex o-flex-wrap o-justify-center o-gap-3">{links}</div>
          )}
        </div>

        <div className="o-relative o-flex o-flex-col o-items-center o-justify-between o-gap-6 o-px-6 o-pb-8 md:o-flex-row md:o-px-12">
          <p className="o-text-xs o-uppercase o-tracking-widest o-text-zinc-500">
            {copyright}
          </p>

          {signature === undefined ? null : (
            <p
              data-o-footer-pill
              className="o-flex o-items-center o-gap-2 o-rounded-full o-px-6 o-py-3 o-text-xs o-uppercase o-tracking-widest o-text-zinc-500"
            >
              {signature}
              <span
                aria-hidden
                data-o-footer-beat={reduced ? undefined : ''}
                className="o-text-red-500"
              >
                &#10084;
              </span>
            </p>
          )}

          <Magnetic>
            <button
              type="button"
              data-o-footer-pill
              onClick={() => {
                window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
              }}
              className="o-flex o-h-12 o-w-12 o-items-center o-justify-center o-rounded-full o-text-zinc-500 hover:o-text-zinc-950 dark:hover:o-text-zinc-50"
            >
              <span className="o-sr-only">{topLabel}</span>
              <svg
                aria-hidden
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="o-h-5 o-w-5"
              >
                <path d="M12 19V5M5 12l7-7 7 7" />
              </svg>
            </button>
          </Magnetic>
        </div>
      </footer>
    </div>
  )
}
