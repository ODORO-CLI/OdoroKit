/**
 * Image en caracteres : la photo est echantillonnee dans un canevas hors du
 * document, puis rendue en texte monospace au-dessus d'elle.
 *
 * ## Ce qui la distingue du champ ASCII
 *
 * Le champ ASCII est un bruit calcule par un shader : il n'a pas de sujet. Ici
 * le sujet est une image reelle, et le rendu en caracteres est une **lecture**
 * de cette image. C'est aussi pourquoi rien n'est calcule par image : la
 * conversion a lieu une fois, au chargement, et son resultat est du texte.
 *
 * ## L'image reelle reste dessous
 *
 * Le `pre` est decoratif et opaque ; l'element `img` qu'il recouvre porte le
 * texte de remplacement et reste la source de verite pour les technologies
 * d'assistance. Au survol, le `pre` s'efface et rend la photo : c'est aussi le
 * repli naturel quand la conversion echoue.
 *
 * ## Pourquoi la conversion peut echouer, et ce qui arrive alors
 *
 * Lire les pixels d'une image venue d'un autre domaine sans en-tete
 * d'autorisation teinte le canevas, et la lecture leve. Le composant ne
 * l'ignore pas : il rend le `pre` vide, donc invisible, et la photo reste
 * affichee. Une image en caracteres qui manque vaut mieux qu'un cadre vide.
 *
 * ## L'encre suit le theme
 *
 * En theme clair, l'encre est sombre sur fond clair : un pixel lumineux doit
 * donc recevoir **moins** de caracteres. En theme sombre, c'est l'inverse. La
 * rampe est donc parcourue dans un sens ou dans l'autre selon le theme ; sans
 * cela, l'image apparait en negatif la moitie du temps.
 *
 * ## Sous mouvement reduit
 *
 * Rien ne change : le rendu en caracteres est un etat, pas un mouvement. Seule
 * la transition vers la photo disparait — le passage devient instantane.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useEffect, useState, type CSSProperties, type ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-ascii-image'

/**
 * Rampe d'encre, du vide au plein.
 *
 * C'est la rampe classique des convertisseurs d'images en texte : dix
 * niveaux, ce que l'oeil distingue sans hesiter a taille de glyphe.
 */
const RAMP = ' .:-=+*#%@'

/**
 * Rapport largeur sur hauteur d'une cellule de texte monospace.
 *
 * Il vaut a peu de chose pres trois cinquiemes dans toutes les polices a
 * chasse fixe. Sans lui, l'image sortirait etiree en hauteur : une cellule
 * n'est pas un carre.
 */
const CELL = 0.6

/** Pose les regles du rendu, une fois par document. */
function ensureAsciiRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    // La taille du glyphe est exprimee en pour cent de la largeur du cadre :
    // le dessin garde ses proportions dans n'importe quelle colonne.
    '[data-o-ascii]{container-type:inline-size}',
    '[data-o-ai-art]{font-size:calc(var(--o-ai-glyph) * 1cqw);line-height:1}',
    '[data-o-ascii-survol]:hover [data-o-ai-art],',
    '[data-o-ascii-survol]:focus-within [data-o-ai-art]{opacity:0}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface AsciiImageOwnProps {
  /** Source de l'image. */
  src: string
  /** Texte de remplacement. Chaine vide si l'image est purement decorative. */
  alt: string
  /** Rapport largeur sur hauteur du cadre. @defaultValue 1.777 */
  ratio?: number
  /**
   * Nombre de caracteres sur la largeur.
   *
   * Borne a deux cents : au-dela, les glyphes sont plus petits qu'un pixel et
   * la conversion coute pour rien.
   *
   * @defaultValue 90
   */
  columns?: number
  /** Contraste applique avant le choix du caractere. @defaultValue 1.3 */
  contrast?: number
  /** Retourne la rampe : l'image sort en negatif. @defaultValue false */
  invert?: boolean
  /** Rendre la photo au survol et au focus. @defaultValue true */
  hover?: boolean
}

/** Toutes les proprietes : les siennes, plus celles d'une image. */
export type AsciiImageProps = Customisable<AsciiImageOwnProps, 'img'>

/**
 * Rend une image en caracteres.
 *
 * @example
 * <AsciiImage src="/portrait.jpg" alt="Portrait de l equipe" />
 *
 * @example
 * // Plus grossier, en negatif, sans retour a la photo.
 * <AsciiImage src="/portrait.jpg" alt="" columns={48} invert hover={false} />
 */
export function AsciiImage({
  src,
  alt,
  ratio = 1.777,
  columns = 90,
  contrast = 1.3,
  invert = false,
  hover = true,
  ...rest
}: AsciiImageProps): ReactElement {
  const { reduced, theme } = useMotionState()
  const [art, setArt] = useState('')
  ensureAsciiRule()

  const cols = Math.round(Math.min(200, Math.max(16, columns)))
  // Une cellule est plus haute que large : sans ce rapport, le dessin sortirait
  // etire d'un bon tiers.
  const rows = Math.max(2, Math.round((cols * CELL) / Math.max(ratio, 0.1)))

  useEffect(() => {
    if (typeof document === 'undefined') return

    let cancelled = false
    const source = new Image()
    // Sans cet attribut, une image d'un autre domaine teinte le canevas et la
    // lecture leve ; avec lui, elle est refusee au chargement quand le serveur
    // ne l'autorise pas. Dans les deux cas la photo reste affichee.
    source.crossOrigin = 'anonymous'
    source.decoding = 'async'

    const convert = (): void => {
      if (cancelled) return

      let lignes = ''
      try {
        const canvas = document.createElement('canvas')
        canvas.width = cols
        canvas.height = rows
        const context = canvas.getContext('2d')
        if (context === null) return

        // Le canevas fait exactement la taille de la grille : le navigateur
        // fait la moyenne des pixels pour nous, et il la fait mieux qu'une
        // boucle.
        context.drawImage(source, 0, 0, cols, rows)
        const pixels = context.getImageData(0, 0, cols, rows).data

        const last = RAMP.length - 1
        // En theme sombre l'encre est claire : un pixel lumineux appelle plus
        // d'encre, pas moins. Voir l'en-tete.
        const dense = theme === 'dark' ? !invert : invert

        const out: string[] = []
        for (let y = 0; y < rows; y += 1) {
          let line = ''
          for (let x = 0; x < cols; x += 1) {
            const index = (y * cols + x) * 4
            const r = pixels[index] ?? 0
            const g = pixels[index + 1] ?? 0
            const b = pixels[index + 2] ?? 0
            const alpha = (pixels[index + 3] ?? 255) / 255

            // Luminance perceptuelle, pas une moyenne : le vert pese plus que
            // le bleu dans ce que l'oeil appelle « clair ».
            const luma = ((0.2126 * r + 0.7152 * g + 0.0722 * b) / 255) * alpha
            const pousse = Math.min(1, Math.max(0, (luma - 0.5) * contrast + 0.5))
            const level = dense ? pousse : 1 - pousse
            line += RAMP[Math.min(last, Math.max(0, Math.round(level * last)))] ?? ' '
          }
          out.push(line)
        }
        lignes = out.join('\n')
      } catch {
        // Canevas teinte : la photo reste, le dessin n'aura pas lieu.
        lignes = ''
      }

      if (!cancelled) setArt(lignes)
    }

    source.addEventListener('load', convert)
    source.src = src
    if (source.complete && source.naturalWidth > 0) convert()

    return () => {
      cancelled = true
      source.removeEventListener('load', convert)
    }
  }, [src, cols, rows, contrast, invert, theme])

  const { className, style } = mergePresentation(
    { className: 'o-relative o-overflow-hidden' },
    rest,
  )

  const hostStyle = {
    ...style,
    aspectRatio: String(ratio),
    // La largeur totale vaut le nombre de colonnes fois la chasse d'un
    // glyphe : c'est cette egalite qui donne la taille de police.
    '--o-ai-glyph': (100 / (cols * CELL)).toFixed(4),
  } as CSSProperties

  const artStyle: CSSProperties = {
    color: 'var(--o-theme-fg)',
    backgroundColor: 'var(--o-theme-bg)',
    transition: reduced
      ? undefined
      : 'opacity var(--o-duration-slow) var(--o-ease-standard)',
  }

  return (
    <div
      className={className}
      style={hostStyle}
      data-o-ascii=""
      data-o-ascii-survol={hover ? '' : undefined}
    >
      <img
        loading="lazy"
        decoding="async"
        {...rest}
        src={src}
        alt={alt}
        className="o-size-full o-object-cover"
      />

      {/* Le dessin est decoratif : tout ce qu'il dit, l'image le dit deja.
          Tant qu'il n'existe pas — image en cours de chargement, canevas
          teinte — le calque n'est pas rendu du tout : opaque et vide, il
          masquerait la photo qu'il est cense representer. */}
      {art === '' ? null : (
        <pre
          aria-hidden
          data-o-ai-art=""
          className="o-absolute o-inset-0 o-m-0 o-flex o-items-center o-justify-center o-overflow-hidden o-whitespace-pre o-font-mono o-select-none"
          style={artStyle}
        >
          {art}
        </pre>
      )}
    </div>
  )
}
