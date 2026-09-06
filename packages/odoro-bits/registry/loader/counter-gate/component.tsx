/**
 * Rideau d'ouverture a compteur honnete.
 *
 * ## Un pourcentage doit mesurer quelque chose
 *
 * Le defaut de presque tous les prechargeurs : un `setTimeout` deguise en
 * progression. Le compteur monte de zero a cent en deux secondes, quelle que
 * soit la realite, et se trouve a 100 % alors que rien n'est pret — ou a 40 %
 * alors que tout l'est depuis longtemps.
 *
 * Ici le compteur suit `ready`. Tant que ce n'est pas vrai, il **se gare** sous
 * un plafond et y reste. Si la ressource ne vient jamais, la barre s'arrete a
 * 92 % et ne ment pas. C'est laid, et c'est exact : mieux vaut un chiffre bloque
 * qu'un chiffre faux.
 *
 * Deux vitesses, donc : une reptation lente vers le plafond pendant l'attente,
 * une course rapide vers cent une fois pret.
 *
 * ## Un plancher, et un plafond
 *
 * **Le plancher** empeche le clignotement. Sur un cache chaud, tout est pret
 * en quarante millisecondes ; sans plancher, le visiteur voit un rideau
 * apparaitre et disparaitre — une secousse, pas une entree.
 *
 * **Le plafond de duree** empeche la prison. Une ressource qui ne repond jamais
 * garderait le visiteur derriere le rideau indefiniment. Passe ce delai, on
 * ouvre : une page sans sa scene vaut mieux qu'une page qu'on ne voit pas.
 *
 * ## `onDone` part au **debut** de la sortie, pas a sa fin
 *
 * C'est le detail qui separe une ouverture reussie d'une succession de deux
 * animations. Le contenu doit entrer **a travers** le rideau qui s'en va : si
 * l'on attend que le rideau soit parti, la page reste vide un quart de seconde,
 * puis s'anime — deux gestes, la ou l'on en voulait un.
 *
 * ## Il ne retient pas le contenu, il le couvre
 *
 * Le rideau est une surcouche. La page est montee dessous des le premier rendu,
 * masquee par ses propres etats initiaux. Ne pas monter le contenu serait plus
 * simple, et couterait trois choses : les moteurs d'indexation ne le voient
 * pas, les lecteurs d'ecran non plus, et le decoupage des textes se ferait au
 * moment du reveal — donc pendant l'image ou l'on peut le moins se le
 * permettre.
 *
 * @module
 */

import { mergePresentation, useMotionState, type Customisable } from '@odoro-cli/engine'
import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

/** Proprietes propres au composant. */
export interface CounterGateOwnProps {
  /**
   * Le fond du rideau.
   *
   * Une valeur, pas un jeton de role : le systeme n'en a pas. Il ship des
   * echelles brutes, et c'est au composant de dire laquelle il prend.
   *
   * @defaultValue le plus sombre de l'echelle neutre
   */
  background?: string
  /** L'encre du rideau. @defaultValue le plus clair de l'echelle neutre */
  ink?: string
  /**
   * Ce qu'on attend vraiment.
   *
   * Passer `true` d'emblee donne un rideau de courtoisie qui tient le plancher
   * puis s'ouvre. Le brancher sur la premiere image dessinee d'une scene donne
   * un compteur qui dit la verite.
   *
   * @defaultValue true
   */
  ready?: boolean
  /** Ce qui s'affiche au centre : un nom, une marque. */
  label?: ReactNode
  /**
   * Duree minimale d'affichage, en millisecondes.
   *
   * @defaultValue 900
   */
  minVisibleMs?: number
  /**
   * Au-dela, on ouvre quoi qu'il arrive.
   *
   * @defaultValue 6000
   */
  maxMs?: number
  /**
   * Ou le compteur se gare tant que rien n'est pret, en pourcentage.
   *
   * @defaultValue 92
   */
  ceiling?: number
  /** Cache le pourcentage, et ne garde que la barre. */
  hideCount?: boolean
  /**
   * Appele au **debut** de la sortie. Voir l'en-tete du module.
   */
  onDone?: () => void
}

/** Toutes les proprietes. */
export type CounterGateProps = Customisable<CounterGateOwnProps, 'div'>

/** Identifiant de la feuille injectee. */
const STYLE_ID = 'o-counter-gate'

/** Pose les regles du rideau, une fois par document. */
function ensureCounterGateRule(): void {
  if (typeof document === 'undefined') return
  if (document.getElementById(STYLE_ID) !== null) return

  const style = document.createElement('style')
  style.id = STYLE_ID
  style.textContent = [
    '[data-o-gate]{',
    'position:fixed;inset:0;z-index:9999;',
    'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1.5rem;',
    'background:var(--o-gate-bg);color:var(--o-gate-ink);',
    'transition:transform var(--o-gate-exit) cubic-bezier(0.76,0,0.24,1);',
    '}',
    // La sortie translate le rideau plutot que de le faire disparaitre : une
    // opacite qui tombe laisse voir la page a travers, ce qui trahit le
    // montage. Un plan qui s'en va est un objet, pas un voile.
    '[data-o-gate-out]{transform:translateY(-100%)}',
    '[data-o-gate-bar]{',
    'position:relative;width:min(18rem,60vw);height:1px;',
    'background:color-mix(in oklch,currentColor 25%,transparent);',
    '}',
    '[data-o-gate-bar]::after{',
    'content:"";position:absolute;inset:0;',
    'transform-origin:left;transform:scaleX(var(--o-gate-p));',
    'background:currentColor;',
    '}',
    '[data-o-gate-count]{font-variant-numeric:tabular-nums;font-size:0.75rem;opacity:0.6}',
  ].join('')
  document.head.append(style)
}

/**
 * Couvre la page jusqu'a ce qu'elle soit prete, puis s'en va.
 *
 * @example
 * // Un rideau de courtoisie : rien a attendre, mais une vraie entree.
 * <CounterGate label="Odoro" onDone={() => { setPret(true) }} />
 *
 * @example
 * // Branche sur la premiere image d'une scene : le compteur dit la verite.
 * <CounterGate ready={sceneDessinee} onDone={ouvrir} />
 */
export function CounterGate({
  background = 'var(--o-palette-zinc-950)',
  ink = 'var(--o-palette-zinc-50)',
  ready = true,
  label,
  minVisibleMs = 900,
  maxMs = 6000,
  ceiling = 92,
  hideCount = false,
  onDone,
  ...rest
}: CounterGateProps): ReactElement | null {
  const { reduced } = useMotionState()
  const [pourcent, setPourcent] = useState(0)
  const [sortant, setSortant] = useState(false)
  const [parti, setParti] = useState(false)

  // Dans une ref : la sortie ne doit partir qu'une fois, et un rendu
  // supplementaire ne doit pas la rejouer.
  const annonce = useRef(false)
  const rappel = useRef(onDone)
  rappel.current = onDone

  ensureCounterGateRule()

  useEffect(() => {
    // Mouvement reduit : pas de rideau du tout. Ce qu'il apportait etait le
    // geste ; ce qu'il coutait serait une attente sans contrepartie.
    if (reduced) {
      if (!annonce.current) {
        annonce.current = true
        rappel.current?.()
      }
      setParti(true)
      return
    }

    const depart = performance.now()
    let image = 0
    let dernier = depart

    // La valeur vit dans une variable, pas dans l'etat : sans cela la boucle
    // provoquerait soixante rendus par seconde pour un chiffre qui n'en change
    // que cent fois. On ne remonte a React que lorsque l'entier affiche bouge.
    let valeur = 0
    let affiche = -1

    const pas = (maintenant: number) => {
      // Le pas est borne : un onglet revenu au premier plan apres une minute
      // rendrait un delta enorme et ferait sauter le compteur a cent.
      const dt = Math.min((maintenant - dernier) / 1000, 0.05)
      dernier = maintenant

      const ecoule = maintenant - depart
      const pret = ready || ecoule >= maxMs

      // Trois regimes, et le plancher est ce qui separe les deux derniers.
      // Sans lui, un cache chaud amene le compteur a cent en moins de temps que
      // la duree minimale, et la sortie partirait avant : le rideau
      // clignoterait, ce que le plancher etait cense empecher.
      const acheve = pret && ecoule >= minVisibleMs
      const cible = acheve ? 100 : pret ? 99 : ceiling
      const vitesse = pret ? 6 : 1.7

      valeur = acheve && valeur >= 99.4 ? 100 : valeur + (cible - valeur) * vitesse * dt

      const entier = Math.round(valeur)
      if (entier !== affiche) {
        affiche = entier
        setPourcent(valeur)
      }

      if (valeur >= 100) return

      image = requestAnimationFrame(pas)
    }

    image = requestAnimationFrame(pas)

    return () => {
      cancelAnimationFrame(image)
    }
  }, [ready, reduced, minVisibleMs, maxMs, ceiling])

  // La bascule vers la sortie, separee de la boucle : elle ne depend que de
  // l'etat atteint, et la melanger a la boucle la ferait dependre d'une image.
  useEffect(() => {
    if (reduced || sortant || pourcent < 100) return

    setSortant(true)

    // Ici, et pas a la fin de la transition : le contenu doit entrer a travers
    // le rideau qui s'en va.
    if (!annonce.current) {
      annonce.current = true
      rappel.current?.()
    }
  }, [pourcent, sortant, reduced])

  if (parti) return null

  const { className, style } = mergePresentation({}, rest)

  const styleRideau = {
    ...style,
    '--o-gate-p': String(Math.min(1, pourcent / 100)),
    '--o-gate-exit': '900ms',
    '--o-gate-bg': background,
    '--o-gate-ink': ink,
  } as CSSProperties

  return (
    <div
      {...rest}
      className={className}
      style={styleRideau}
      data-o-gate=""
      {...(sortant ? { 'data-o-gate-out': '' } : {})}
      // Le rideau n'est pas du contenu : il ne doit pas etre lu, et la page
      // qu'il couvre l'est deja.
      aria-hidden="true"
      onTransitionEnd={() => {
        if (sortant) setParti(true)
      }}
    >
      {label !== undefined && <div>{label}</div>}
      <div data-o-gate-bar="" />
      {!hideCount && (
        <div data-o-gate-count="">{String(Math.round(pourcent)).padStart(3, '0')}</div>
      )}
    </div>
  )
}
