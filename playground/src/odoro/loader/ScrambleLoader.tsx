/**
 * Texte brouille qui se resout : un mot fait de signes qui se resout
 * caractere par caractere dans un ordre aleatoire, tient en tremblant, puis
 * se brouille de nouveau.
 *
 * ## Il ne se pose jamais tout a fait
 *
 * Le decodage de la categorie texte joue une fois, de gauche a droite, et
 * livre un titre : sa fin est le but. Un chargeur n'a pas de fin a livrer.
 * Ici la resolution se fait dans un ordre tire au sort, sans front lisible,
 * et le mot net n'est qu'un palier : pendant la tenue, un caractere au
 * hasard se rebrouille un instant et revient, comme un signal qui tient
 * mal. Puis tout se brouille et recommence. C'est un etat, pas un resultat.
 *
 * Chaque cycle tire un nouvel ordre : deux resolutions identiques a la suite
 * se liraient comme une video en boucle.
 *
 * ## Une fonte a chasse fixe, et un brouillage a cadence fixe
 *
 * Les signes du brouillage n'ont pas la largeur des lettres qu'ils
 * remplacent ; dans une fonte proportionnelle, le mot tremblerait en
 * largeur a chaque tic. La fonte mono du systeme fige chaque case a un
 * caractere. Et le brouillage change de signe vingt fois par seconde, pas a
 * chaque image : plus vite, ce n'est plus que du gris. Le tic est compte en
 * temps ecoule sur la boucle du moteur, independamment de l'ecran.
 *
 * ## Les caracteres s'ecrivent dans le DOM, pas dans l'etat
 *
 * Dix cases qui changent vingt fois par seconde feraient deux cents rendus
 * React par seconde pour des noeuds texte. Chaque case est donc ecrite par
 * reference ; l'etat resolu est un attribut que la feuille traduit en
 * pleine encre.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran.
 * Les cases sont retirees de l'arbre d'accessibilite : brouillees, elles
 * seraient lues comme une suite de signes.
 *
 * Sous mouvement reduit, le texte est net d'emblee : il se lit encore comme
 * une attente, seul le brouillage s'arrete.
 *
 * @module
 */

import { clock, mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useEffect, useRef, type CSSProperties, type ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-scramble-loader'

/** Les signes du brouillage. */
const GLYPHS = '!<>-_/[]{}=+*^?#%&@$0123456789'

/** Part de la resolution ou tout reste brouille, avant le premier caractere net. */
const SCRAMBLE_SHARE = 0.25

/** Duree de la tenue, en part de la resolution. */
const HOLD_SHARE = 0.7

/** Intervalle entre deux signes d'une case brouillee, en millisecondes. */
const TICK_MS = 48

/** Pendant la tenue : ecart entre deux tremblements, et duree d'un tremblement. */
const FLICKER_GAP_MS = 320
const FLICKER_MS = 110

/** Espace insecable : une espace ordinaire dans un bloc en ligne s'effondrerait. */
const NBSP = String.fromCharCode(160)

/** Un signe au hasard. */
function glyph(): string {
  return GLYPHS.charAt(Math.floor(Math.random() * GLYPHS.length))
}

/** Pose les cases et leurs deux etats, une fois par document. */
function ensureScrambleLoaderRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-sl]{',
    'display:inline-block;white-space:nowrap;font-weight:600;',
    'font-family:var(--o-font-mono);font-size:var(--o-sl-size);color:var(--o-sl-color);',
    '}',
    // Une case brouillee est a demi-encre ; nette, elle passe en pleine
    // encre. C'est l'attribut, pas le caractere, qui porte la difference.
    '[data-o-sl-char]{display:inline-block;min-width:1ch;text-align:center;opacity:0.45;transition:opacity 160ms}',
    '[data-o-sl-char][data-o-sl-set]{opacity:1}',
  ].join('')
  document.head.append(style)
}

/** Proprietes propres au composant. */
export interface ScrambleLoaderOwnProps {
  /** Le texte qui se resout. @defaultValue 'Chargement' */
  text?: string
  /** Corps du texte, en pixels. @defaultValue 16 */
  size?: number
  /** Duree de la resolution, du brouillage complet au texte net, en millisecondes. @defaultValue 2200 */
  speed?: number
  /** Couleur du texte. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type ScrambleLoaderProps = Customisable<ScrambleLoaderOwnProps, 'span'>

/**
 * Signale une attente par un texte qui se resout depuis un brouillage.
 *
 * @example
 * <ScrambleLoader />
 *
 * @example
 * // Un autre mot, plus lent, dans la teinte de marque.
 * <ScrambleLoader text="Connexion" speed={3000} color="var(--o-palette-brand-500)" />
 */
export function ScrambleLoader({
  text = 'Chargement',
  size = 16,
  speed = 2200,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: ScrambleLoaderProps): ReactElement {
  ensureScrambleLoaderRule()
  const { reduced } = useMotionState()
  const cells = useRef<(HTMLSpanElement | null)[]>([])
  const chars = Array.from(text)

  useEffect(() => {
    const letters = Array.from(text)
    const nodes: { node: HTMLSpanElement; char: string; fixed: boolean }[] = []
    letters.forEach((char, index) => {
      const node = cells.current[index]
      if (node === null || node === undefined) return
      // Une espace n'a rien a resoudre : elle est nette d'emblee.
      nodes.push({ node, char: char === ' ' ? NBSP : char, fixed: char === ' ' })
    })
    if (nodes.length === 0) return

    const settle = (index: number): void => {
      const cell = nodes[index]
      if (cell === undefined) return
      cell.node.textContent = cell.char
      cell.node.setAttribute('data-o-sl-set', '')
    }

    if (reduced) {
      nodes.forEach((_, index) => {
        settle(index)
      })
      return
    }

    const cycle = speed * (1 + HOLD_SHARE)
    const set = nodes.map(() => false)
    let reveal = nodes.map(() => 1)
    let elapsed = 0
    let sinceTick = 0
    let cycleIndex = -1
    let flickerIndex = -1
    let flickerAt = 0
    let flickerUntil = 0

    // Un nouvel ordre a chaque cycle ; les espaces sont nettes d'emblee.
    const plan = (): void => {
      reveal = nodes.map(() => SCRAMBLE_SHARE + Math.random() * (1 - SCRAMBLE_SHARE))
      set.fill(false)
      nodes.forEach((cell, index) => {
        if (cell.fixed) {
          set[index] = true
          settle(index)
        } else {
          cell.node.removeAttribute('data-o-sl-set')
        }
      })
      flickerIndex = -1
      flickerAt = speed + FLICKER_GAP_MS
    }

    const subscription = clock.subscribe(
      ({ delta }) => {
        const step = delta * 1000
        elapsed += step
        sinceTick += step

        const index = Math.floor(elapsed / cycle)
        if (index !== cycleIndex) {
          cycleIndex = index
          plan()
        }
        const local = elapsed - index * cycle

        // Resolution : chaque case se fige a son heure, les autres tournent.
        if (local < speed) {
          const progress = local / speed
          nodes.forEach((_, position) => {
            if (set[position] === true) return
            if (progress >= (reveal[position] ?? 1)) {
              set[position] = true
              settle(position)
            }
          })
          if (sinceTick < TICK_MS) return
          sinceTick = 0
          nodes.forEach((cell, position) => {
            if (set[position] === true) return
            cell.node.textContent = glyph()
          })
          return
        }

        // Tenue : un caractere au hasard tremble un instant, puis revient.
        if (flickerIndex >= 0) {
          const cell = nodes[flickerIndex]
          if (local >= flickerUntil) {
            settle(flickerIndex)
            flickerIndex = -1
            flickerAt = local + FLICKER_GAP_MS
          } else if (sinceTick >= TICK_MS && cell !== undefined) {
            sinceTick = 0
            cell.node.textContent = glyph()
          }
          return
        }
        if (local >= flickerAt && local < cycle - FLICKER_MS) {
          const candidates = nodes.map((cell, position) => (cell.fixed ? -1 : position)).filter((p) => p >= 0)
          const pick = candidates[Math.floor(Math.random() * candidates.length)]
          const cell = pick === undefined ? undefined : nodes[pick]
          if (pick === undefined || cell === undefined) return
          flickerIndex = pick
          flickerUntil = local + FLICKER_MS
          cell.node.removeAttribute('data-o-sl-set')
          cell.node.textContent = glyph()
        }
      },
      { name: 'scramble-loader' },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [text, speed, reduced])

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-sl-size': `${String(size)}px`,
    '--o-sl-color': color,
  } as CSSProperties

  return (
    <span {...rest} className={className} style={loaderStyle} data-o-sl="" role="status">
      <span className="o-sr-only">{label}</span>
      <span aria-hidden>
        {chars.map((char, index) => (
          <span
            key={index}
            data-o-sl-char=""
            ref={(node) => {
              cells.current[index] = node
            }}
          >
            {char === ' ' ? NBSP : char}
          </span>
        ))}
      </span>
    </span>
  )
}
