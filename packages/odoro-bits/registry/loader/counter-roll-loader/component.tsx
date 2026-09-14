/**
 * Rouleaux de chiffres : des colonnes qui roulent sans fin, un cran a la
 * fois, chacune a sa phase, comme un compteur qui ne s'arrete pas.
 *
 * ## Un cran, puis un arret : c'est ce qui fait le rouleau
 *
 * Une colonne qui glisse en continu est un ruban, pas un compteur : on ne
 * lit aucun chiffre. Le rouleau avance d'un chiffre en un mouvement bref,
 * puis s'arrete dessus, dix fois par tour. Les images-cles sont donc au
 * nombre de vingt, deux par chiffre — le depart et l'arrivee du cran — et
 * chaque cran a sa propre acceleration. Un unique `steps(10)` donnerait les
 * arrets, mais des sauts secs entre eux ; c'est le mouvement entre deux
 * arrets qui fait le mecanisme.
 *
 * Chaque rouleau porte onze chiffres, de 0 a 9 puis 0 de nouveau : la
 * derniere image du tour montre le meme chiffre que la premiere, et la
 * boucle ne se voit pas.
 *
 * Les rouleaux ne sont pas synchrones : un delai negatif, different par
 * colonne, les decale d'une fraction de tour. Trois colonnes qui roulent
 * ensemble ressembleraient a un seul bloc qui saute.
 *
 * L'odometre de la categorie texte roule jusqu'a une valeur et s'arrete ;
 * celui-ci ne s'arrete jamais, et c'est le point.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran.
 * Les rouleaux sont retires de l'arbre d'accessibilite : un lecteur d'ecran
 * y trouverait onze chiffres par colonne.
 *
 * Sous mouvement reduit, chaque rouleau est a l'arret sur un chiffre, pas
 * tous sur le meme : la figure se lit encore comme un compteur, seul le
 * roulement s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-counter-roll-loader'

/** Hauteur d'une ligne de rouleau, en em. */
const LINE = 1.3

/** Part de chaque cran passee en mouvement, le reste etant l'arret. */
const MOVE_SHARE = 0.55

/** Les onze chiffres d'un rouleau : le dernier repete le premier. */
const STRIP = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0] as const

/** Les vingt images-cles d'un tour : depart et arrivee de chaque cran. */
function rollKeyframes(): string {
  const stops: string[] = []
  for (let digit = 0; digit < 10; digit += 1) {
    const start = digit * 10
    const end = start + MOVE_SHARE * 10
    stops.push(`${String(start)}%{transform:translateY(${(-digit * LINE).toFixed(2)}em)}`)
    stops.push(
      `${end.toFixed(1)}%{transform:translateY(${(-(digit + 1) * LINE).toFixed(2)}em)}`,
    )
  }
  stops.push(`100%{transform:translateY(${(-10 * LINE).toFixed(2)}em)}`)
  return `@keyframes o-crl-roll{${stops.join('')}}`
}

/** Pose les rouleaux et leur tour, une fois par document. */
function ensureCounterRollLoaderRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-crl]{',
    'display:inline-flex;flex-direction:column;align-items:center;gap:0.5em;',
    'line-height:1;font-size:var(--o-crl-size);color:var(--o-crl-color);',
    '}',
    '[data-o-crl-drum]{',
    'display:inline-flex;gap:0.15em;font-family:var(--o-font-mono);font-size:1.5em;font-weight:600;',
    '}',
    // La fenetre a la hauteur d'une ligne : elle ne montre qu'un chiffre, et
    // les voisins n'apparaissent que pendant le cran.
    '[data-o-crl-col]{',
    `display:block;height:${String(LINE)}em;overflow:hidden;padding:0 0.14em;border-radius:0.15em;`,
    'background:color-mix(in oklab,currentColor 10%,transparent);',
    '}',
    '[data-o-crl-strip]{',
    'display:block;',
    'animation:o-crl-roll var(--o-crl-speed) cubic-bezier(0.4,0,0.2,1) infinite;',
    'animation-delay:var(--o-crl-delay);',
    '}',
    `[data-o-crl-strip]>span{display:block;height:${String(LINE)}em;line-height:${String(LINE)}em;text-align:center}`,
    rollKeyframes(),
    '[data-o-crl-text]{font-size:0.7em;letter-spacing:0.18em;text-transform:uppercase;opacity:0.6}',
    '@media (prefers-reduced-motion:reduce){',
    `[data-o-crl-strip]{animation:none;transform:translateY(calc(var(--o-crl-rest) * ${String(-LINE)}em))}`,
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface CounterRollLoaderOwnProps {
  /** La legende sous les rouleaux. Chaine vide pour ne garder que les rouleaux. @defaultValue 'Chargement' */
  text?: string
  /** Nombre de rouleaux. @defaultValue 3 */
  digits?: number
  /** Corps de reference, en pixels ; les chiffres en font une fois et demie. @defaultValue 16 */
  size?: number
  /** Duree d'un tour complet de rouleau, en millisecondes. @defaultValue 2000 */
  speed?: number
  /** Couleur des chiffres et de la legende. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type CounterRollLoaderProps = Customisable<CounterRollLoaderOwnProps, 'span'>

/**
 * Signale une attente par des rouleaux de chiffres qui tournent sans fin.
 *
 * @example
 * <CounterRollLoader />
 *
 * @example
 * // Cinq rouleaux, plus lents, dans la teinte de marque.
 * <CounterRollLoader digits={5} speed={3000} color="var(--o-palette-brand-500)" />
 */
export function CounterRollLoader({
  text = 'Chargement',
  digits = 3,
  size = 16,
  speed = 2000,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: CounterRollLoaderProps): ReactElement {
  ensureCounterRollLoaderRule()

  const { className, style } = mergePresentation({}, rest)
  const count = Math.max(1, Math.round(digits))

  const loaderStyle = {
    ...style,
    '--o-crl-size': `${String(size)}px`,
    '--o-crl-speed': `${String(speed)}ms`,
    '--o-crl-color': color,
  } as CSSProperties

  return (
    <span {...rest} className={className} style={loaderStyle} data-o-crl="" role="status">
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-crl-drum="">
        {Array.from({ length: count }, (_, column) => (
          <span key={column} data-o-crl-col="">
            <span
              data-o-crl-strip=""
              style={
                {
                  // Une fraction de tour irrationnelle par colonne : les
                  // rouleaux ne retombent jamais en phase.
                  '--o-crl-delay': `${String(-Math.round(speed * ((column * 0.37) % 1)))}ms`,
                  // Au repos, chaque rouleau montre un chiffre different.
                  '--o-crl-rest': String((column * 3) % 10),
                } as CSSProperties
              }
            >
              {STRIP.map((digit, index) => (
                <span key={index}>{digit}</span>
              ))}
            </span>
          </span>
        ))}
      </span>
      {text.length > 0 && (
        <span aria-hidden data-o-crl-text="">
          {text}
        </span>
      )}
    </span>
  )
}
