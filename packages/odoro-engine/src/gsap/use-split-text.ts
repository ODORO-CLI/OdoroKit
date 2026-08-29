/**
 * Decoupage de texte pour animation.
 *
 * ## Le piege d'accessibilite, et il est serieux
 *
 * Decouper un paragraphe en une balise par caractere detruit trois choses a la
 * fois : certaines combinaisons de lecteur d'ecran et de navigateur annoncent
 * alors le texte **lettre par lettre**, la selection a la souris se fragmente,
 * et le copier-coller rend une suite de morceaux.
 *
 * La parade tient en deux attributs, et elle appartient au moteur, pas a
 * l'appelant : le conteneur porte le texte d'origine en `aria-label`, et les
 * fragments sont marques `aria-hidden`. Le lecteur d'ecran lit alors une
 * phrase, pas un alphabet.
 *
 * ## Sous mouvement reduit, on ne decoupe pas du tout
 *
 * Decouper pour ne rien animer reviendrait a payer l'integralite du cout
 * d'accessibilite sans aucun benefice. Le texte reste donc intact.
 *
 * ## Redecoupage au redimensionnement
 *
 * Un decoupage par ligne depend de la largeur disponible. Sans redecoupage,
 * les « lignes » animees cessent de correspondre aux lignes affichees des que
 * la fenetre change — et le resultat est plus etrange qu'une absence
 * d'animation. Le redecoupage n'a donc lieu que pour ce mode.
 *
 * @module
 */

import { type RefObject, useEffect, useRef, useState } from 'react'

import { motionPolicy } from '../core/motion-policy.js'
import { loadSplitText } from './setup.js'

/** Granularite du decoupage. */
export type SplitBy = 'chars' | 'words' | 'lines'

/** Options de {@link useSplitText}. */
export interface SplitTextOptions {
  /** Granularite. @defaultValue 'chars' */
  by?: SplitBy | readonly SplitBy[]
  /**
   * Redecoupe au redimensionnement. Sans effet hors du mode `lines`, ou le
   * decoupage ne depend pas de la largeur.
   *
   * @defaultValue true
   */
  resplitOnResize?: boolean
  /** Delai d'anti-rebond du redimensionnement, en millisecondes. @defaultValue 150 */
  debounce?: number
}

/** Ce que rend {@link useSplitText}. */
export interface SplitTextHandle<T extends Element> {
  /** Ref a poser sur l'element contenant le texte. */
  readonly ref: RefObject<T | null>
  /** Fragments produits, vides tant que le decoupage n'a pas eu lieu. */
  readonly parts: readonly Element[]
  /** `true` une fois le decoupage effectue. */
  readonly ready: boolean
}

/** Normalise la granularite demandee vers la forme attendue par le plugin. */
function toTypes(by: SplitBy | readonly SplitBy[]): string {
  return (Array.isArray(by) ? by : [by]).join(',')
}

/**
 * Decoupe le texte d'un element en fragments animables.
 *
 * Le DOM d'origine est integralement restaure au demontage : un texte laisse
 * decoupe casserait la selection et le copier-coller bien apres la disparition
 * de l'animation qui l'avait justifie.
 *
 * @example
 * const { ref, parts, ready } = useSplitText<HTMLHeadingElement>({ by: 'chars' })
 *
 * useEffect(() => {
 *   if (!ready) return
 *   gsap.from(parts, { y: 20, opacity: 0, stagger: 0.02 })
 * }, [ready, parts])
 *
 * return <h1 ref={ref}>Un titre revele</h1>
 */
export function useSplitText<T extends Element = HTMLElement>(
  options: SplitTextOptions = {},
): SplitTextHandle<T> {
  const { by = 'chars', resplitOnResize = true, debounce = 150 } = options

  const ref = useRef<T | null>(null)
  const [parts, setParts] = useState<readonly Element[]>([])
  const [ready, setReady] = useState(false)

  const types = toTypes(by)
  const watchesWidth = resplitOnResize && types.includes('lines')

  useEffect(() => {
    const element = ref.current
    if (element === null) return

    // Neutralise : le texte reste tel qu'il est, et l'appelant verra `ready`
    // rester faux — donc n'animera rien.
    if (motionPolicy.state.reduced) return

    let split: SplitText | undefined
    let cancelled = false
    let timer: ReturnType<typeof setTimeout> | undefined
    let observer: ResizeObserver | undefined

    /** Texte d'origine, relu avant chaque decoupage. */
    const label = element.textContent ?? ''
    const hadLabel = element.hasAttribute('aria-label')

    const apply = (SplitTextClass: typeof SplitText): void => {
      split?.revert()
      // Le decoupage n'a de sens que sur un element HTML ; la contrainte
      // generique reste `Element` pour ne pas gener l'appelant.
      split = new SplitTextClass(element as unknown as HTMLElement, { type: types })

      const produced: Element[] = [
        ...(split.chars ?? []),
        ...(types.includes('chars') ? [] : (split.words ?? [])),
        ...(types.includes('chars') || types.includes('words')
          ? []
          : (split.lines ?? [])),
      ]

      // Le lecteur d'ecran doit lire une phrase, pas un alphabet.
      element.setAttribute('aria-label', label)
      for (const part of produced) part.setAttribute('aria-hidden', 'true')

      setParts(produced)
      setReady(true)
    }

    void loadSplitText().then((SplitTextClass) => {
      if (SplitTextClass === null || cancelled || ref.current === null) return

      apply(SplitTextClass)

      if (!watchesWidth || typeof ResizeObserver === 'undefined') return

      let width = element.getBoundingClientRect().width
      observer = new ResizeObserver((entries) => {
        const next = entries[0]?.contentRect.width
        // Seule la largeur change le decoupage en lignes : ignorer les
        // variations de hauteur evite un redecoupage a chaque animation.
        if (next === undefined || Math.abs(next - width) < 1) return
        width = next

        clearTimeout(timer)
        timer = setTimeout(() => {
          if (!cancelled && ref.current !== null) apply(SplitTextClass)
        }, debounce)
      })
      observer.observe(element)
    })

    return () => {
      cancelled = true
      clearTimeout(timer)
      observer?.disconnect()
      // La restauration doit avoir lieu meme si le composant est demonte avant
      // la fin du chargement du plugin.
      split?.revert()
      if (!hadLabel) element.removeAttribute('aria-label')
      setParts([])
      setReady(false)
    }
  }, [types, watchesWidth, debounce])

  return { ref, parts, ready }
}
