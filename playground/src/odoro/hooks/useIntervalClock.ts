/**
 * Repetition a intervalle regulier, calee sur l'horloge du moteur.
 *
 * ## Ce que `setInterval` fait de travers dans une page animee
 *
 * Il continue quand l'onglet est cache. Le navigateur le ralentit — une fois
 * par seconde au mieux — mais il ne l'arrete pas : un carrousel de mots
 * revenu au premier plan a defile trois cents fois dans le vide, et la
 * batterie l'a paye. La boucle du moteur, elle, est adossee a l'affichage :
 * un onglet cache ne recoit aucune image, donc aucun battement, et la reprise
 * se fait la ou l'on s'etait arrete.
 *
 * Il derive, aussi. `setInterval(f, 1000)` appelle rarement `f` a une seconde
 * d'ecart : le delai part apres l'execution precedente, et la file de taches
 * ajoute ce qu'elle veut. Deux intervalles egaux lances ensemble se
 * desynchronisent en quelques minutes, ce qui se voit tout de suite quand ils
 * animent deux elements voisins. Ici le temps ecoule est accumule et le reste
 * est reporte : la cadence est tenue sur la duree.
 *
 * Et il ouvre un minuteur de plus. Une page qui affiche vingt compteurs ouvre
 * vingt minuteurs, que rien ne coordonne avec les images ; ici, tout passe par
 * l'unique boucle du moteur, qui les execute dans un ordre connu.
 *
 * ## Pourquoi le rattrapage est borne a un battement par image
 *
 * Apres un blocage — un onglet revenu, un script long — le temps ecoule
 * depasserait plusieurs intervalles. Les rejouer tous dans la meme image
 * produirait une rafale : un compteur qui saute de trente, une animation qui
 * clignote. Le temps en trop est donc jete, parce que ce qui compte pour une
 * repetition d'interface est la cadence a venir, pas le rattrapage du passe.
 *
 * @module
 */

import { CLOCK_PRIORITY, clock } from '@odoro-cli/engine'
import { useEffect, useRef } from 'react'

/** Options de `useIntervalClock`. */
export interface IntervalClockOptions {
  /** Duree entre deux battements, en millisecondes. @defaultValue 1000 */
  interval?: number
  /**
   * Battre ou non.
   *
   * C'est par la que passe le mouvement reduit : le crochet n'anime rien par
   * lui-meme et ne peut pas juger a la place de l'appelant. Un carrousel qui
   * defile tout seul passe `actif={!reduced}` ; un compte a rebours, qui est
   * un contenu et non un agrement, bat quand meme.
   *
   * @defaultValue true
   */
  actif?: boolean
  /**
   * Battre une premiere fois immediatement, sans attendre l'intervalle.
   *
   * @defaultValue false
   */
  immediat?: boolean
  /** Nom affiche dans le panneau de diagnostic. */
  name?: string
}

/**
 * Appelle une fonction a intervalle regulier, dans la boucle du moteur.
 *
 * @param callback Appelee a chaque battement. Sa derniere version est toujours
 * celle qui s'execute : la changer ne redemarre pas le compte.
 *
 * @example
 * const [index, setIndex] = useState(0)
 * const { reduced } = useMotionState()
 *
 * useIntervalClock(() => setIndex((n) => (n + 1) % mots.length), {
 *   interval: 2400,
 *   actif: !reduced,
 *   name: 'mots-tournants',
 * })
 */
export function useIntervalClock(
  callback: () => void,
  options: IntervalClockOptions = {},
): void {
  const { interval = 1000, actif = true, immediat = false, name = 'intervalle' } = options

  // La fonction vit dans une ref : sans cela, une fonction fabriquee au rendu
  // — le cas normal — redemarrerait le compte a chaque rendu, et l'intervalle
  // ne serait jamais atteint sur une page qui rend souvent.
  const garde = useRef(callback)
  useEffect(() => {
    garde.current = callback
  }, [callback])

  useEffect(() => {
    if (!actif || interval <= 0) return

    const periode = interval / 1000
    let accumule = 0

    if (immediat) garde.current()

    const subscription = clock.subscribe(
      ({ deltaRaw }) => {
        // Le temps reel, pas le temps lisse : une cadence se compte en
        // secondes vraies. Borne a une periode, pour qu'un blocage produise un
        // battement et non une rafale.
        accumule += deltaRaw > periode ? periode : deltaRaw
        if (accumule < periode) return
        accumule -= periode
        garde.current()
      },
      { priority: CLOCK_PRIORITY.default, name },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [interval, actif, immediat, name])
}
