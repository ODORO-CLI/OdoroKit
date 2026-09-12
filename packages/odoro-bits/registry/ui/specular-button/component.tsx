/**
 * Bouton a reflet speculaire : un point de lumiere suit le pointeur sur la
 * surface, et le bord s'eclaire du cote d'ou vient la lumiere.
 *
 * ## Ce qui le distingue d'un lisere tournant ou d'une nacre
 *
 * Le lisere tournant anime son contour tout seul ; la nacre est un volume
 * fixe. Ici rien ne bouge sans le pointeur : la lumiere est un point que la
 * main deplace, et la surface repond comme un objet verni — le reflet se
 * pose sous le curseur, le bord oppose s'eteint, le bord voisin s'allume.
 *
 * ## La position est un nombre, pas une longueur
 *
 * Le reflet a besoin de la position en pourcentage, pour le degrade ; le bord
 * a besoin d'un decalage en pixels, pour l'ombre interne. Une seule paire de
 * variables sert aux deux : deux nombres de zero a un, enregistres par
 * `@property`, que chaque regle multiplie par ce qu'il lui faut. L'ombre
 * interne n'accepte pas de pourcentage, c'est tout le probleme ; un nombre
 * nu s'ecrit dans les deux.
 *
 * Enregistrees, ces variables s'interpolent : la transition que le
 * compositeur applique dessus est le retard du reflet sur la main, et il
 * n'y a pas de boucle a ouvrir pour l'obtenir.
 *
 * ## Le repos est un eclairage, pas une absence
 *
 * Quand le pointeur s'en va, la lumiere ne s'eteint pas : elle revient en
 * haut a gauche, la ou une interface pose sa source par convention. Un
 * bouton eclaire au repos garde son volume ; un bouton eteint aurait l'air
 * inactif.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useState,
  type CSSProperties,
  type ElementType,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Proprietes propres au composant. */
export interface SpecularButtonOwnProps {
  /** Libelle du bouton. */
  children: ReactNode
  /** Cible du lien. Avec elle, le bouton est rendu comme un lien. */
  href?: string
  /**
   * Tokens du corps, du libelle et de la lumiere.
   *
   * Trois, dans cet ordre. La lumiere sert au reflet et au bord eclaire.
   */
  colors?: readonly [string, string, string]
  /** Diametre du reflet, en pourcentage de la largeur du bouton. @defaultValue 120 */
  size?: number
  /** Intensite du reflet, de zero a un. @defaultValue 0.55 */
  strength?: number
  /** Retard du reflet sur le pointeur, en millisecondes. @defaultValue 180 */
  lag?: number
}

/** Toutes les proprietes. */
export type SpecularButtonProps = Customisable<SpecularButtonOwnProps, 'button'>

/** Tokens employes par defaut. */
const DEFAULT_TOKENS = [
  '--o-palette-brand-600',
  '--o-palette-zinc-50',
  '--o-palette-white',
] as const

/** Position de repos de la lumiere : en haut a gauche. */
const REST_X = 0.3
const REST_Y = 0.2

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-specular-button'

/** Pose la surface, le reflet et le bord, une fois par document. */
function ensureSpecularRules(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // Deux nombres, pas deux longueurs : voir l'en-tete du module.
    '@property --o-spec-x{syntax:"<number>";initial-value:0.3;inherits:false}',
    '@property --o-spec-y{syntax:"<number>";initial-value:0.2;inherits:false}',

    '[data-o-spec]{',
    'position:relative;isolation:isolate;overflow:hidden;cursor:pointer;',
    'display:inline-flex;align-items:center;justify-content:center;gap:0.5em;',
    'border:0;font:inherit;text-decoration:none;',
    'background:var(--o-spec-body);color:var(--o-spec-ink);',
    'transition:--o-spec-x var(--o-spec-lag) linear,--o-spec-y var(--o-spec-lag) linear,',
    'box-shadow var(--o-spec-lag) linear;',
    // Le bord : une ombre interne dont le decalage suit la lumiere. Elle est
    // tiree vers le point lumineux, donc claire du cote eclaire.
    'box-shadow:inset calc((var(--o-spec-x) - 0.5) * 6px) calc((var(--o-spec-y) - 0.5) * 6px) 8px -3px ',
    'color-mix(in oklab,var(--o-spec-light) 55%,transparent),',
    'inset 0 0 0 1px color-mix(in oklab,var(--o-spec-light) 18%,transparent);',
    '}',
    '[data-o-spec]:focus-visible{outline:2px solid var(--o-spec-body);outline-offset:3px}',
    '[data-o-spec]:active{scale:0.98}',
    '[data-o-spec]:disabled,[data-o-spec][aria-disabled="true"]{',
    'opacity:0.5;cursor:not-allowed;pointer-events:none}',

    // Le reflet : un disque de lumiere centre sur la position.
    '[data-o-spec]::before{',
    'content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;',
    'background:radial-gradient(var(--o-spec-size) circle at ',
    'calc(var(--o-spec-x) * 100%) calc(var(--o-spec-y) * 100%),',
    'var(--o-spec-light) 0%,transparent 60%);',
    'opacity:var(--o-spec-strength);',
    '}',
    // Le vernis : un voile clair en haut, qui donne la courbure.
    '[data-o-spec]::after{',
    'content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;',
    'background:linear-gradient(to bottom,color-mix(in oklab,var(--o-spec-light) 22%,transparent),transparent 55%);',
    '}',
    '[data-o-spec]>span{position:relative;z-index:1}',

    '@media (prefers-reduced-motion:reduce){[data-o-spec]{transition:none}}',
  ].join('')
  document.head.append(style)
}

/**
 * Bouton dont la lumiere suit le pointeur.
 *
 * @example
 * <SpecularButton onClick={commander}>Commander</SpecularButton>
 *
 * @example
 * // Un lien, corps sombre et reflet plus discret, qui colle au curseur.
 * <SpecularButton
 *   href="/tarifs"
 *   colors={['--o-palette-zinc-900', '--o-palette-zinc-50', '--o-palette-zinc-50']}
 *   strength={0.3}
 *   lag={0}
 * >
 *   Voir les tarifs
 * </SpecularButton>
 */
export function SpecularButton({
  children,
  href,
  colors = DEFAULT_TOKENS,
  size = 120,
  strength = 0.55,
  lag = 180,
  ...rest
}: SpecularButtonProps): ReactElement {
  const { reduced } = useMotionState()
  const [host, setHost] = useState<HTMLElement | null>(null)
  ensureSpecularRules()

  useEffect(() => {
    // Sous mouvement reduit la lumiere reste au repos : le suivi est un
    // agrement, l'eclairage est le contenu.
    if (host === null || reduced) return
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return

    const onMove = (event: PointerEvent): void => {
      const box = host.getBoundingClientRect()
      const x = (event.clientX - box.left) / Math.max(box.width, 1)
      const y = (event.clientY - box.top) / Math.max(box.height, 1)
      host.style.setProperty('--o-spec-x', x.toFixed(3))
      host.style.setProperty('--o-spec-y', y.toFixed(3))
    }

    const onLeave = (): void => {
      host.style.setProperty('--o-spec-x', String(REST_X))
      host.style.setProperty('--o-spec-y', String(REST_Y))
    }

    host.addEventListener('pointermove', onMove, { passive: true })
    host.addEventListener('pointerleave', onLeave)
    return () => {
      host.removeEventListener('pointermove', onMove)
      host.removeEventListener('pointerleave', onLeave)
    }
  }, [host, reduced])

  const { className, style } = mergePresentation(
    { className: 'o-rounded-full o-px-6 o-py-3 o-font-medium' },
    rest,
  )

  // Un lien quand il y a une cible, un bouton sinon : le meme habillage sur
  // les deux, et la semantique qui convient a chacun.
  const Tag = (href === undefined ? 'button' : 'a') as ElementType
  const { disabled, type, ...attributes } = rest

  return (
    <Tag
      {...(href === undefined
        ? { type: type ?? 'button', disabled }
        : { href, 'aria-disabled': disabled === true ? 'true' : undefined })}
      {...attributes}
      ref={setHost}
      data-o-spec=""
      className={className}
      style={
        {
          '--o-spec-body': `var(${colors[0]})`,
          '--o-spec-ink': `var(${colors[1]})`,
          '--o-spec-light': `var(${colors[2]})`,
          '--o-spec-size': `${String(size)}%`,
          '--o-spec-strength': String(strength),
          '--o-spec-lag': `${String(reduced ? 0 : lag)}ms`,
          ...style,
        } as CSSProperties
      }
    >
      <span>{children}</span>
    </Tag>
  )
}
