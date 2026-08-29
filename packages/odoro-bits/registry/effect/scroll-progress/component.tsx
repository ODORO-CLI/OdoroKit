/**
 * Barre de progression de lecture.
 *
 * ## Ce que ce composant montre
 *
 * C'est l'implementation de reference du contrat de personnalisation : les
 * cinq niveaux y sont, et dans cet ordre.
 *
 * 1. **Tokens** — la couleur et la duree viennent de `--o-palette-brand-600` et
 *    `--o-duration-fast`. Changer le theme change la barre, sans la toucher.
 * 2. **Props** — `target`, `thickness`, `position`.
 * 3. **Passe-plat** — `className`, `style` et les attributs DOM arrivent sur
 *    l'element racine, avec les classes du composant conservees.
 * 4. **Slot de rendu** — `children` recoit la progression et remplace la
 *    barre, en gardant la mesure.
 * 5. **`onReady`** — donne la lecture imperative, pour ce que rien de ce qui
 *    precede ne permet.
 *
 * ## Pourquoi la progression n'est pas un etat React
 *
 * Elle change a chaque image. La rendre comme etat provoquerait soixante
 * rendus par seconde pendant tout le defilement de la page, pour deplacer un
 * rectangle que le compositeur sait deja animer seul. La valeur est donc
 * ecrite directement dans le `transform` de la barre.
 *
 * Le slot de rendu est l'exception, et elle est assumee : quelqu'un qui veut
 * afficher un pourcentage en chiffres a besoin d'un rendu. Il n'a lieu que si
 * un slot est fourni, et sa cadence est bornee — voir `sampling`.
 *
 * @module
 */

import {
  mergePresentation,
  useOnReady,
  useScrollProgress,
  type Customisable,
  type ReadyCallback,
  type Slot,
} from 'odoro-engine'
import {
  useCallback,
  useLayoutEffect,
  useRef,
  useState,
  type ReactElement,
  type RefObject,
} from 'react'

/** Lecture imperative offerte a l'echappatoire. */
export interface ScrollProgressControls {
  /** Progression courante, de 0 a 1. */
  read(): number
  /** L'element de la barre, pour en reprendre le rendu entierement. */
  readonly bar: HTMLElement | null
}

/** Ce que le slot de rendu recoit. */
export interface ScrollProgressState {
  /** Progression courante, de 0 a 1. */
  readonly progress: number
}

/** Proprietes propres au composant. */
export interface ScrollProgressOwnProps {
  /** Element dont on suit la lecture. Par defaut, la page entiere. */
  target?: RefObject<HTMLElement | null>
  /** Epaisseur de la barre, en pixels. @defaultValue 3 */
  thickness?: number
  /** Bord auquel la barre est ancree. @defaultValue 'top' */
  position?: 'top' | 'bottom'
  /** Slot de rendu. Remplace la barre en gardant la mesure. */
  children?: Slot<ScrollProgressState>
  /** Echappatoire, appelee une fois la mesure en place. */
  onReady?: ReadyCallback<ScrollProgressControls>
}

/** Toutes les proprietes : les siennes, plus celles d'un `div`. */
export type ScrollProgressProps = Customisable<ScrollProgressOwnProps>

/**
 * Pas d'echantillonnage du slot de rendu, en centiemes.
 *
 * Sans lui, un slot provoquerait un rendu React par image. Cent paliers sont
 * plus fins que ce qu'un affichage en pourcentage peut montrer, et divisent le
 * nombre de rendus par l'ordre de grandeur qui separe une image d'un centieme
 * de course.
 */
const SAMPLING = 100

/**
 * Barre de progression de lecture.
 *
 * @example
 * // Le cas courant : rien a regler.
 * <ScrollProgress />
 *
 * @example
 * // Niveaux 3 et 4 : pose dans la mise en page, et rendu remplace.
 * <ScrollProgress className="o-z-50" position="bottom">
 *   {({ progress }) => <span>{Math.round(progress * 100)} %</span>}
 * </ScrollProgress>
 *
 * @example
 * // Niveau 5 : ce que l'API n'a pas prevu.
 * <ScrollProgress
 *   onReady={({ handle, motion }) => {
 *     if (motion.reduced) return
 *     const timer = setInterval(() => console.log(handle.read()), 1000)
 *     return () => clearInterval(timer)
 *   }}
 * />
 */
export function ScrollProgress({
  target,
  thickness = 3,
  position = 'top',
  children,
  onReady,
  ...rest
}: ScrollProgressProps): ReactElement {
  const bar = useRef<HTMLDivElement | null>(null)
  const progress = useRef(0)

  // Le slot n'existe pas la plupart du temps : l'etat n'est alors jamais
  // ecrit, et le composant ne provoque aucun rendu pendant le defilement.
  const [sampled, setSampled] = useState(0)
  const hasSlot = children !== undefined

  const onProgress = useCallback(
    (value: number) => {
      progress.current = value
      if (bar.current !== null) bar.current.style.transform = `scaleX(${String(value)})`

      if (hasSlot) {
        const step = Math.round(value * SAMPLING)
        setSampled((previous) => (previous === step ? previous : step))
      }
    },
    [hasSlot],
  )

  const { ref } = useScrollProgress<HTMLElement>(onProgress, {
    // Bornes d'une lecture, pas d'une traversee : la progression commence
    // quand le haut du contenu atteint le haut de la fenetre, et s'acheve
    // quand son bas atteint le bas. Les bornes par defaut mesureraient le
    // passage de l'element dans le champ, ce qui n'est pas la meme chose.
    start: 'top top',
    end: 'bottom bottom',
    name: 'progression de lecture',
  })

  // L'element observe est le **contenu**, jamais la barre : celle-ci fait
  // quatre pixels de haut et ne bouge pas, mesurer son defilement ne dirait
  // rien. Sans cible, c'est le document entier.
  //
  // L'affectation passe par un effet de mise en page : ceux-ci s'executent
  // avant les effets passifs, donc avant que `useScrollProgress` ne lise la
  // reference pour poser son declencheur.
  useLayoutEffect(() => {
    ref.current = target === undefined ? document.documentElement : target.current
  }, [ref, target])

  const [host, setHost] = useState<HTMLElement | null>(null)
  const controls = useRef<ScrollProgressControls>({
    read: () => progress.current,
    get bar() {
      return bar.current
    },
  })
  useOnReady(onReady, controls.current, host)

  const { className, style } = mergePresentation(
    { className: 'o-fixed o-inset-x-0 o-pointer-events-none' },
    rest,
  )

  return (
    <div
      {...rest}
      ref={setHost}
      className={className}
      style={{ [position]: 0, ...style }}
      role="progressbar"
      aria-hidden={hasSlot ? undefined : true}
    >
      {children === undefined ? (
        <div
          ref={bar}
          style={{
            height: `${String(thickness)}px`,
            background: 'var(--o-palette-brand-600)',
            transform: 'scaleX(0)',
            transformOrigin: 'left',
            // La barre suit le defilement : la transition ne sert qu'a lisser
            // les sauts, pas a animer la course elle-meme.
            transition: 'opacity var(--o-duration-fast) linear',
            willChange: 'transform',
          }}
        />
      ) : (
        children({ progress: sampled / SAMPLING })
      )}
    </div>
  )
}
