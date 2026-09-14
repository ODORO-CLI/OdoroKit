/**
 * Ligne de balayage : un faisceau parcourt une zone du haut vers le bas,
 * marque un temps, et remonte.
 *
 * ## Un faisceau a une epaisseur, pas seulement une position
 *
 * Une simple barre de deux pixels qui descend ne se lit pas comme un
 * balayage : rien ne dit dans quel sens elle va, ni qu'elle eclaire quelque
 * chose. Le faisceau est donc une bande, dont le degrade monte jusqu'a un
 * coeur net puis redescend — symetrique, pour que le trajet aller et le
 * trajet retour aient la meme allure sans avoir a retourner l'element.
 *
 * Le temps d'arret a chaque extremite fait toute la lecture : sans lui, le
 * faisceau rebondit, et un rebond raconte une balle, pas une lecture. Avec
 * lui, on lit une passe qui se termine, puis une autre qui commence.
 *
 * Les quatre equerres ne sont pas un ornement : elles disent ou s'arrete la
 * zone examinee, donc ce que la course du faisceau signifie. Le cadre
 * complet, lui, reste tres attenue — il borne sans concurrencer le faisceau.
 *
 * La course est posee en variable, calculee depuis la hauteur demandee :
 * l'animation vaut pour toutes les tailles sans qu'aucune mesure ne soit
 * lue dans le document.
 *
 * Une seule animation CSS, tenue par le compositeur, aucun JavaScript apres
 * le premier rendu.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran :
 * l'attente est une information, pas une decoration. Le cadre et le
 * faisceau sont retires de l'arbre d'accessibilite.
 *
 * Sous mouvement reduit, le faisceau est pose en bas de la zone : la passe
 * est finie, la zone entierement parcourue.
 *
 * @module
 */

import { mergePresentation, type Customisable } from '@odoro-cli/engine'
import type { CSSProperties, ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-scanner-line'

/**
 * Les quatre equerres.
 *
 * Chacune est le meme carre borde, place dans un coin, a qui l'on retire
 * les deux bords tournes vers l'interieur : une seule forme, quatre poses,
 * au lieu de quatre jeux de bordures a tenir en accord.
 */
const CORNERS: readonly { readonly key: string; readonly place: CSSProperties }[] = [
  {
    key: 'haut-gauche',
    place: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0 },
  },
  {
    key: 'haut-droite',
    place: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0 },
  },
  {
    key: 'bas-gauche',
    place: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0 },
  },
  {
    key: 'bas-droite',
    place: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0 },
  },
]

/** Pose la zone, ses equerres et le faisceau, une fois par document. */
function ensureScannerRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-scanner-line]{position:relative;display:inline-block;overflow:hidden}',
    '[data-o-scanner-frame]{position:absolute;inset:0;border:1px solid currentColor;opacity:0.22;border-radius:6px}',
    '[data-o-scanner-corner]{position:absolute;border:2px solid currentColor}',
    // Le coeur net au milieu, l'etalement de part et d'autre : le faisceau
    // se lit dans les deux sens de marche.
    '[data-o-scanner-beam]{',
    'position:absolute;left:0;right:0;top:0;height:var(--o-scanner-beam);',
    'background:linear-gradient(to bottom,transparent,',
    'color-mix(in oklab,currentColor 28%,transparent) 40%,',
    'currentColor 48%,currentColor 52%,',
    'color-mix(in oklab,currentColor 28%,transparent) 60%,transparent);',
    'animation:o-scanner-line-sweep var(--o-scanner-speed) infinite;',
    '}',
    // Descente, arret en bas, remontee, arret en haut.
    '@keyframes o-scanner-line-sweep{',
    '0%{transform:translateY(0);animation-timing-function:cubic-bezier(0.45,0,0.55,1)}',
    '44%,56%{transform:translateY(var(--o-scanner-travel));animation-timing-function:cubic-bezier(0.45,0,0.55,1)}',
    '94%,100%{transform:translateY(0)}',
    '}',
    // Faisceau pose en bas : la passe est finie.
    '@media (prefers-reduced-motion:reduce){',
    '[data-o-scanner-beam]{animation:none;transform:translateY(var(--o-scanner-travel))}',
    '}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface ScannerLineOwnProps {
  /** Largeur de la zone examinee, en pixels. @defaultValue 160 */
  size?: number
  /** Hauteur de la zone examinee, en pixels. @defaultValue 96 */
  height?: number
  /** Duree d'un aller-retour complet, en millisecondes. @defaultValue 2200 */
  speed?: number
  /** Couleur du cadre et du faisceau. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type ScannerLineProps = Customisable<ScannerLineOwnProps, 'span'>

/**
 * Signale une attente par un faisceau qui balaie une zone.
 *
 * @example
 * <ScannerLine />
 *
 * @example
 * // Une bande large et basse, plus rapide, dans la teinte de marque.
 * <ScannerLine size={280} height={64} speed={1400} color="var(--o-palette-brand-500)" />
 */
export function ScannerLine({
  size = 160,
  height = 96,
  speed = 2200,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: ScannerLineProps): ReactElement {
  ensureScannerRule()

  const { className, style } = mergePresentation({}, rest)

  // L'epaisseur du faisceau suit la zone, sans jamais l'avaler : sur une
  // bande basse, une bande fixe de vingt pixels serait la moitie du sujet.
  const beam = Math.max(8, Math.min(height * 0.2, 28))

  // Les equerres suivent la meme logique, bornees pour rester lisibles.
  const bracket = Math.max(8, Math.min(size, height) * 0.16)

  const loaderStyle = {
    ...style,
    width: `${String(size)}px`,
    height: `${String(height)}px`,
    color,
    '--o-scanner-speed': `${String(speed)}ms`,
    '--o-scanner-beam': `${String(beam)}px`,
    '--o-scanner-travel': `${String(height - beam)}px`,
  } as CSSProperties

  return (
    <span
      {...rest}
      className={className}
      style={loaderStyle}
      data-o-scanner-line=""
      role="status"
    >
      <span className="o-sr-only">{label}</span>
      <span data-o-scanner-frame="" aria-hidden />
      {CORNERS.map((corner) => (
        <span
          key={corner.key}
          data-o-scanner-corner=""
          aria-hidden
          style={{
            ...corner.place,
            width: `${String(bracket)}px`,
            height: `${String(bracket)}px`,
          }}
        />
      ))}
      <span data-o-scanner-beam="" aria-hidden />
    </span>
  )
}
