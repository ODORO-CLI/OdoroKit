/**
 * Chiffres qui se figent : un code dont les chiffres defilent tous, puis se
 * verrouillent un a un de gauche a droite, tiennent, et repartent.
 *
 * ## Le verrouillage est la seule information
 *
 * Des chiffres qui defilent sans fin sont du bruit : rien n'y avance. Ce qui
 * fait de ce code un chargeur, c'est le verrou. Chaque case cesse de tourner
 * a son tour, de gauche a droite, et le regard suit le front qui progresse
 * comme il suivrait une barre. Le code complet tient un moment, le temps
 * d'etre lu comme un resultat, puis tout repart : c'est une boucle, et elle
 * ne pretend pas mesurer.
 *
 * Le defilement change de chiffre a cadence fixe, pas a chaque image : a
 * soixante changements par seconde, l'oeil ne voit qu'un gris ; a vingt, il
 * voit des chiffres qui passent. Le tic est compte en temps ecoule sur la
 * boucle du moteur, ce qui le rend independant de la cadence de l'ecran.
 *
 * ## Les chiffres s'ecrivent dans le DOM, pas dans l'etat
 *
 * Six cases qui changent vingt fois par seconde feraient cent vingt rendus
 * React par seconde pour des noeuds texte. Chaque case est donc ecrite par
 * reference, et le verrou est un attribut pose sur la case, que la feuille
 * traduit en pleine encre.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran.
 * Le code est retire de l'arbre d'accessibilite : ses chiffres n'ont pas de
 * sens, et dans une region de statut chacun serait annonce.
 *
 * Sous mouvement reduit, le code est verrouille d'emblee : la figure se lit
 * encore comme un chargeur, seul le defilement s'arrete.
 *
 * @module
 */

import { clock, mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useEffect, useRef, type CSSProperties, type ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-matrix-digits'

/** Part du cycle ou tout defile, avant le premier verrou. */
const SPIN_SHARE = 0.3

/** Part du cycle sur laquelle les verrous se posent, de gauche a droite. */
const LOCK_SHARE = 0.45

/** Intervalle entre deux chiffres d'une case qui defile, en millisecondes. */
const TICK_MS = 50

/** Pose le code et sa legende, une fois par document. */
function ensureMatrixDigitsRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-md]{',
    'display:inline-flex;flex-direction:column;align-items:center;gap:0.5em;',
    'line-height:1;font-size:var(--o-md-size);color:var(--o-md-color);',
    '}',
    '[data-o-md-code]{',
    'display:inline-flex;gap:0.2em;font-family:var(--o-font-mono);font-size:1.5em;font-weight:600;',
    '}',
    // Une case qui tourne est a demi-encre sur un fond leger ; verrouillee,
    // elle passe en pleine encre et son fond se renforce.
    '[data-o-md-slot]{',
    'display:inline-block;min-width:1ch;text-align:center;padding:0.2em 0.12em;border-radius:0.15em;',
    'opacity:0.4;background:color-mix(in oklab,currentColor 8%,transparent);',
    'transition:opacity 120ms,background-color 120ms;',
    '}',
    '[data-o-md-slot][data-o-md-locked]{opacity:1;background:color-mix(in oklab,currentColor 16%,transparent)}',
    '[data-o-md-text]{font-size:0.7em;letter-spacing:0.18em;text-transform:uppercase;opacity:0.6}',
  ].join('')
  document.head.append(style)
}

/** Un chiffre au hasard, different du precedent pour que chaque tic se voie. */
function nextDigit(previous: number): number {
  const candidate = Math.floor(Math.random() * 9)
  return candidate >= previous ? candidate + 1 : candidate
}

/** Proprietes propres au composant. */
export interface MatrixDigitsOwnProps {
  /** La legende sous le code. Chaine vide pour ne garder que le code. @defaultValue 'Chargement' */
  text?: string
  /** Nombre de chiffres du code. @defaultValue 6 */
  digits?: number
  /** Corps de reference, en pixels ; les chiffres en font une fois et demie. @defaultValue 16 */
  size?: number
  /** Duree d'un cycle, defilement, verrouillage et tenue, en millisecondes. @defaultValue 2600 */
  speed?: number
  /** Couleur des chiffres et de la legende. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type MatrixDigitsProps = Customisable<MatrixDigitsOwnProps, 'span'>

/**
 * Signale une attente par un code de chiffres qui se verrouillent.
 *
 * @example
 * <MatrixDigits />
 *
 * @example
 * // Un code court, plus vif, dans la teinte de marque.
 * <MatrixDigits digits={4} speed={1800} color="var(--o-palette-brand-500)" />
 */
export function MatrixDigits({
  text = 'Chargement',
  digits = 6,
  size = 16,
  speed = 2600,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: MatrixDigitsProps): ReactElement {
  ensureMatrixDigitsRule()
  const { reduced } = useMotionState()
  const count = Math.max(1, Math.round(digits))
  const slots = useRef<(HTMLSpanElement | null)[]>([])

  useEffect(() => {
    const nodes: HTMLSpanElement[] = []
    for (let index = 0; index < count; index += 1) {
      const node = slots.current[index]
      if (node !== null && node !== undefined) nodes.push(node)
    }
    if (nodes.length === 0) return

    const shown = nodes.map(() => 0)
    let targets = nodes.map(() => Math.floor(Math.random() * 10))

    const lock = (index: number): void => {
      const node = nodes[index]
      const target = targets[index]
      if (node === undefined || target === undefined) return
      shown[index] = target
      node.textContent = String(target)
      node.setAttribute('data-o-md-locked', '')
    }

    if (reduced) {
      nodes.forEach((_, index) => {
        lock(index)
      })
      return
    }

    const locked = nodes.map(() => false)
    let elapsed = 0
    let sinceTick = 0
    let cycleIndex = 0

    const subscription = clock.subscribe(
      ({ delta }) => {
        const step = delta * 1000
        elapsed += step
        sinceTick += step

        // Nouveau cycle : nouveau code, tous les verrous sautent.
        const cycle = Math.floor(elapsed / speed)
        if (cycle !== cycleIndex) {
          cycleIndex = cycle
          targets = nodes.map(() => Math.floor(Math.random() * 10))
          locked.fill(false)
          for (const node of nodes) node.removeAttribute('data-o-md-locked')
        }

        const local = (elapsed - cycle * speed) / speed
        nodes.forEach((_, index) => {
          if (locked[index] === true) return
          const at = SPIN_SHARE + ((index + 1) / nodes.length) * LOCK_SHARE
          if (local >= at) {
            locked[index] = true
            lock(index)
          }
        })

        if (sinceTick < TICK_MS) return
        sinceTick = 0
        nodes.forEach((node, index) => {
          if (locked[index] === true) return
          const digit = nextDigit(shown[index] ?? 0)
          shown[index] = digit
          node.textContent = String(digit)
        })
      },
      { name: 'matrix-digits' },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [count, speed, reduced])

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-md-size': `${String(size)}px`,
    '--o-md-color': color,
  } as CSSProperties

  return (
    <span {...rest} className={className} style={loaderStyle} data-o-md="" role="status">
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-md-code="">
        {Array.from({ length: count }, (_, index) => (
          <span
            key={index}
            data-o-md-slot=""
            ref={(node) => {
              slots.current[index] = node
            }}
          >
            0
          </span>
        ))}
      </span>
      {text.length > 0 && (
        <span aria-hidden data-o-md-text="">
          {text}
        </span>
      )}
    </span>
  )
}
