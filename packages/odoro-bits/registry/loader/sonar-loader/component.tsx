/**
 * Balayage radar : un faisceau tourne sur un cadran gradue et rallume deux
 * echos a chaque passage.
 *
 * ## Une traine faite de couches, faute de degrade angulaire
 *
 * Le SVG ne connait pas le degrade conique : on ne peut pas demander a une
 * couleur de s'eteindre le long d'un angle. La traine est donc faite de
 * huit secteurs empiles, tous a la meme opacite tres faible, chacun
 * couvrant un arc plus long que le precedent depuis le bord d'attaque. La
 * ou les huit se recouvrent — juste derriere le faisceau — l'encre est a
 * son maximum ; plus loin, il en reste sept, puis six, et ainsi de suite
 * jusqu'a rien. La decroissance est donc reguliere, et surtout sans
 * couture : chaque frontiere ne fait entrer ou sortir qu'une seule couche.
 *
 * Huit couches d'un peu plus de onze degres donnent une traine d'un quart
 * de tour, ce qui laisse les trois quarts du cadran sombres — assez pour
 * que le faisceau se lise comme un objet qui passe, pas comme un secteur
 * qui tourne.
 *
 * ## Le cadran et les echos
 *
 * Trois cercles de portee et une croix restent visibles en permanence, tres
 * discrets : ils donnent au faisceau quelque chose a traverser. Sans eux,
 * la rotation n'aurait aucun repere et l'oeil ne mesurerait plus sa vitesse.
 *
 * Les deux echos ne sont pas decoratifs : leur delai est calcule depuis
 * leur propre angle, de sorte qu'ils s'allument exactement quand le
 * faisceau les atteint, puis s'eteignent lentement — la remanence d'un
 * ecran de veille. C'est ce qui separe ce chargeur d'ondes concentriques :
 * ici quelque chose cherche, et trouve.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Le dessin est retire
 * de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, le faisceau reste arrete en travers du cadran et
 * les echos restent allumes : la figure se lit encore comme un radar, seul
 * le balayage s'arrete.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-sonar-loader'

/** Portee du cadran, en unites de la vue. */
const REACH = 46

/** Nombre de couches de la traine. */
const LAYERS = 8

/** Ouverture totale de la traine, en degres. */
const TAIL = 90

/** Angle d'arret sous mouvement reduit, en degres. */
const RESTING = 40

/** Les deux echos : un angle depuis le haut, une distance, un rayon. */
const ECHOES = [
  { angle: 58, distance: 32, radius: 3.4 },
  { angle: 214, distance: 21, radius: 2.6 },
] as const

/** Un point du cadran, l'angle compte en degres depuis le haut. */
function point(angle: number, distance: number): { x: number; y: number } {
  const radians = ((angle - 90) * Math.PI) / 180
  return {
    x: 50 + distance * Math.cos(radians),
    y: 50 + distance * Math.sin(radians),
  }
}

/** Le meme point, ecrit pour un trace. */
function pen(angle: number, distance: number): string {
  const { x, y } = point(angle, distance)
  return `${x.toFixed(2)} ${y.toFixed(2)}`
}

/**
 * Secteur allant du bord d'attaque jusqu'a un arc en arriere.
 *
 * Le bord d'attaque est en haut, a zero degre ; la traine s'etend vers les
 * angles negatifs, c'est-a-dire derriere le faisceau puisque celui-ci
 * tourne dans le sens des aiguilles.
 */
function sector(span: number): string {
  return [
    'M 50 50',
    `L ${pen(0, REACH)}`,
    // L'arc revient vers l'arriere : sens trigonometrique a l'ecran, donc
    // drapeau de balayage nul, et moins d'un demi-tour.
    `A ${String(REACH)} ${String(REACH)} 0 0 0 ${pen(-span, REACH)}`,
    'Z',
  ].join(' ')
}

/** Pose le cadran, la traine et les echos, une fois par document. */
function ensureSonarRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-sonar-loader]{display:inline-block;line-height:0}',
    '[data-o-sonar-loader] svg{display:block}',
    '[data-o-sonar-sweep]{',
    'transform-box:view-box;transform-origin:50px 50px;',
    'animation:o-sonar-loader-turn var(--o-sonar-speed) linear infinite;',
    '}',
    '@keyframes o-sonar-loader-turn{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}',
    '[data-o-sonar-echo]{',
    'animation:o-sonar-loader-fade var(--o-sonar-speed) linear infinite;',
    'animation-delay:var(--o-sonar-delay);',
    '}',
    // L'echo s'allume d'un coup au passage, puis s'eteint sur les deux
    // tiers du tour : au-dela, il ne reste rien a voir avant le retour.
    '@keyframes o-sonar-loader-fade{',
    '0%{opacity:1}',
    '65%,100%{opacity:0}',
    '}',
    '@media (prefers-reduced-motion:reduce){',
    `[data-o-sonar-sweep]{animation:none;transform:rotate(${String(RESTING)}deg)}`,
    '[data-o-sonar-echo]{animation:none;opacity:0.85}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface SonarLoaderOwnProps {
  /** Cote du cadran, en pixels. @defaultValue 72 */
  size?: number
  /** Duree d'un tour de faisceau, en millisecondes. @defaultValue 2400 */
  speed?: number
  /** Couleur du cadran, du faisceau et des echos. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type SonarLoaderProps = Customisable<SonarLoaderOwnProps, 'span'>

/**
 * Signale une attente par un faisceau de radar qui balaie un cadran.
 *
 * @example
 * <SonarLoader />
 *
 * @example
 * // Plus grand, plus lent, dans la teinte de marque.
 * <SonarLoader size={112} speed={3600} color="var(--o-palette-brand-500)" />
 */
export function SonarLoader({
  size = 72,
  speed = 2400,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: SonarLoaderProps): ReactElement {
  ensureSonarRule()

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(size)}px`,
    color,
    '--o-sonar-speed': `${String(speed)}ms`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-sonar-loader=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <svg aria-hidden viewBox="0 0 100 100" width="100%" height="100%">
        <g stroke="currentColor" strokeWidth={1} opacity={0.2} fill="none">
          {[REACH, REACH * 0.66, REACH * 0.33].map((radius) => (
            <circle key={radius} cx="50" cy="50" r={radius.toFixed(2)} />
          ))}
          <line x1={50 - REACH} y1="50" x2={50 + REACH} y2="50" />
          <line x1="50" y1={50 - REACH} x2="50" y2={50 + REACH} />
        </g>
        {ECHOES.map((echo) => (
          <circle
            key={echo.angle}
            data-o-sonar-echo=""
            cx={point(echo.angle, echo.distance).x.toFixed(2)}
            cy={point(echo.angle, echo.distance).y.toFixed(2)}
            r={echo.radius}
            fill="currentColor"
            style={
              {
                // L'echo s'allume quand le faisceau l'atteint : son delai
                // est sa part de tour, en negatif pour que la remanence soit
                // deja en place a la premiere image.
                '--o-sonar-delay': `${String(Math.round((echo.angle / 360 - 1) * speed))}ms`,
              } as CSSProperties
            }
          />
        ))}
        <g data-o-sonar-sweep="">
          {Array.from({ length: LAYERS }, (_, index) => (
            <path
              key={index}
              d={sector(((index + 1) * TAIL) / LAYERS)}
              fill="currentColor"
              fillOpacity={0.07}
            />
          ))}
          <line
            x1="50"
            y1="50"
            x2="50"
            y2={50 - REACH}
            stroke="currentColor"
            strokeWidth={1.6}
            strokeLinecap="round"
            opacity={0.9}
          />
        </g>
      </svg>
    </span>
  )
}
