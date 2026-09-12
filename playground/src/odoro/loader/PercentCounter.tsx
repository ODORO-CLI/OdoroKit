/**
 * Compteur en pourcentage : un chiffre qui monte de zero a cent avec une
 * acceleration douce, tient, et repart ; ou qui rejoint la valeur qu'on lui
 * donne.
 *
 * ## Deux regimes, et lequel est honnete
 *
 * Sans `value`, le compteur boucle : c'est un signe d'activite, pas une
 * mesure, et il ne pretend pas en etre une — il repasse par zero, ce qu'un
 * vrai pourcentage ne fait jamais. Avec `value`, il rejoint la valeur donnee
 * et s'y arrete : chaque changement est rattrape en douceur depuis le chiffre
 * affiche, sans repartir de zero. C'est la version a brancher sur une vraie
 * progression ; la premiere est celle qui attend sans savoir combien.
 *
 * La montee est acceleree puis freinee : un chiffre lineaire se lit comme un
 * chronometre, et un chronometre promet une fin qu'on peut calculer.
 *
 * ## Le chiffre s'ecrit dans le DOM, pas dans l'etat
 *
 * Le compteur avance a chaque image de la boucle du moteur. En passer par
 * l'etat React declencherait un rendu par image pour un chiffre qui ne
 * change qu'une centaine de fois par cycle. Le noeud texte est donc ecrit
 * directement, par reference, et seulement quand l'entier affiche bouge.
 *
 * La boucle du moteur plutot qu'un minuteur : un intervalle fixe bat contre
 * la cadence de l'ecran et produit un chiffre qui saute par a-coups.
 *
 * ## Un statut, pas un dessin
 *
 * L'element porte `role="status"` et un libelle pour les lecteurs d'ecran.
 * Le chiffre est retire de l'arbre d'accessibilite : dans une region de
 * statut, chacun de ses changements serait annonce.
 *
 * Sous mouvement reduit, le chiffre est fige : sur la valeur donnee, ou a
 * zero quand il n'y en a pas. Un compteur fige a cent dirait que c'est
 * termine ; a zero, il dit encore l'attente.
 *
 * @module
 */

import { clock, mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import { useEffect, useRef, type CSSProperties, type ReactElement } from 'react'

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-percent-counter'

/** Part de la montee ajoutee en tenue a cent, avant de repartir. */
const HOLD_SHARE = 0.3

/** Pose le chiffre et sa legende, une fois par document. */
function ensurePercentCounterRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-pc]{',
    'display:inline-flex;flex-direction:column;align-items:center;gap:0.45em;',
    'line-height:1;font-size:var(--o-pc-size);color:var(--o-pc-color);',
    '}',
    // Des chiffres a chasse fixe, et une largeur minimale de trois : le
    // passage de 9 a 10 ne decale rien.
    '[data-o-pc-figure]{',
    'display:inline-flex;align-items:baseline;justify-content:flex-end;min-width:3.2ch;',
    'font-size:2.5em;font-weight:600;letter-spacing:-0.03em;font-variant-numeric:tabular-nums;',
    '}',
    '[data-o-pc-unit]{font-size:0.4em;margin-left:0.12em;opacity:0.55}',
    '[data-o-pc-text]{font-size:0.7em;letter-spacing:0.18em;text-transform:uppercase;opacity:0.6}',
  ].join('')
  document.head.append(style)
}

/** Acceleration puis freinage, pour une montee qui ne se lit pas comme un chronometre. */
function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
}

/** Freinage seul, pour rejoindre une valeur sans la depasser. */
function easeOut(t: number): number {
  return 1 - Math.pow(1 - t, 3)
}

/** Proprietes propres au composant. */
export interface PercentCounterOwnProps {
  /** La legende sous le chiffre. Chaine vide pour ne garder que le chiffre. @defaultValue 'Chargement' */
  text?: string
  /**
   * Progression reelle, de 0 a 100.
   *
   * Sans elle, le compteur boucle et ne pretend pas mesurer. Avec elle, il
   * rejoint la valeur et s'y arrete.
   */
  value?: number
  /** Corps de reference, en pixels ; le chiffre en fait deux fois et demie. @defaultValue 16 */
  size?: number
  /** Duree d'une montee de zero a cent, ou d'un rattrapage, en millisecondes. @defaultValue 2400 */
  speed?: number
  /** Couleur du chiffre et de la legende. @defaultValue la couleur du texte */
  color?: string
  /** Libelle annonce aux lecteurs d'ecran. @defaultValue 'Chargement' */
  label?: string
}

/** Toutes les proprietes. */
export type PercentCounterProps = Customisable<PercentCounterOwnProps, 'span'>

/**
 * Signale une attente par un pourcentage qui monte.
 *
 * @example
 * // Sans valeur : le compteur boucle, signe d'activite.
 * <PercentCounter />
 *
 * @example
 * // Branche sur une vraie progression : il la rejoint et s'y arrete.
 * <PercentCounter value={avancement} text="Envoi" color="var(--o-palette-brand-500)" />
 */
export function PercentCounter({
  text = 'Chargement',
  value,
  size = 16,
  speed = 2400,
  color = 'currentColor',
  label = 'Chargement',
  ...rest
}: PercentCounterProps): ReactElement {
  ensurePercentCounterRule()
  const { reduced } = useMotionState()
  const figure = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const node = figure.current
    if (node === null) return

    // On n'ecrit que lorsque l'entier affiche change : une ecriture par
    // image pour la meme chaine serait un travail de mise en page inutile.
    let shown = -1
    const write = (amount: number): void => {
      const whole = Math.round(amount)
      if (whole === shown) return
      shown = whole
      node.textContent = String(whole)
    }

    const target = value === undefined ? undefined : Math.max(0, Math.min(100, value))

    if (reduced) {
      write(target ?? 0)
      return
    }

    // Le rattrapage part du chiffre affiche, pas de zero : un changement de
    // valeur est une suite, pas un nouveau depart.
    const from = Number(node.textContent ?? '') || 0
    let elapsed = 0

    const subscription = clock.subscribe(
      ({ delta }) => {
        elapsed += delta * 1000

        if (target !== undefined) {
          const progress = Math.min(1, elapsed / speed)
          write(from + (target - from) * easeOut(progress))
          if (progress >= 1) subscription.unsubscribe()
          return
        }

        const cycle = speed * (1 + HOLD_SHARE)
        const local = elapsed % cycle
        write(easeInOut(Math.min(1, local / speed)) * 100)
      },
      { name: 'percent-counter' },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [value, speed, reduced])

  const { className, style } = mergePresentation({}, rest)

  const loaderStyle = {
    ...style,
    '--o-pc-size': `${String(size)}px`,
    '--o-pc-color': color,
  } as CSSProperties

  return (
    <span {...rest} className={className} style={loaderStyle} data-o-pc="" role="status">
      <span className="o-sr-only">{label}</span>
      <span aria-hidden data-o-pc-figure="">
        <span ref={figure}>0</span>
        <span data-o-pc-unit="">%</span>
      </span>
      {text.length > 0 && (
        <span aria-hidden data-o-pc-text="">
          {text}
        </span>
      )}
    </span>
  )
}
