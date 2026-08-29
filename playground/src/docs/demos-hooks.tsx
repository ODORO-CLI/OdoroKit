/**
 * Les demonstrations des hooks.
 *
 * ## Pourquoi elles vivent a part
 *
 * Un composant se montre en le posant dans un cadre. Un hook ne se montre
 * pas : il faut lui construire un hote, et cet hote est du code, pas une
 * ligne de table. Les mettre dans `demos.tsx` a cote des rendus d'une ligne
 * noierait la table sous des composants entiers.
 *
 * ## Ce que ces deux demonstrations doivent prouver
 *
 * Pour l'amortissement, la seule chose qui compte est **la difference** avec
 * un suivi direct. Un point qui suit le pointeur est joli et ne dit rien ; deux
 * points, dont l'un sans filtre, montrent en une seconde ce que trois
 * paragraphes expliquent mal.
 *
 * Pour le repli, ce qui compte est le **fondu** et le fait qu'il ne parte pas
 * quand la scene ne viendra jamais. Les deux etats sont donc pilotables a la
 * main : on declenche l'arrivee, on declenche le refus.
 *
 * @module
 */

import { CLOCK_PRIORITY, clock } from 'odoro-engine'
import { Icon } from 'odoro-icons'
import { MousePointer } from 'odoro-icons/filaire'
import { useEffect, useRef, useState, type ReactElement } from 'react'

import { usePointerDamped } from '@/odoro/hooks/usePointerDamped.js'
import { usePoster } from '@/odoro/hooks/usePoster.js'

/* -------------------------------------------------------------------------- */
/* Pointeur amorti                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Deux points suivent le pointeur : l'un amorti, l'autre non.
 *
 * Le point brut est pose par le meme abonnement, a partir de la position
 * lue sans filtre. Sans lui, on ne verrait qu'un point qui suit — ce que fait
 * aussi bien un `onPointerMove` de trois lignes.
 */
export function PointerDampedDemo({ speed }: { speed: number }): ReactElement {
  const [host, setHost] = useState<HTMLDivElement | null>(null)
  const amorti = useRef<HTMLDivElement | null>(null)
  const brut = useRef<HTMLDivElement | null>(null)
  const cible = useRef({ x: 0, y: 0 })

  const pointer = usePointerDamped({ host, speed, name: 'apercu-pointeur' })

  useEffect(() => {
    if (host === null) return

    // La position sans filtre, lue au meme endroit : c'est la comparaison qui
    // fait la demonstration, pas le suivi.
    const onMove = (event: PointerEvent): void => {
      const box = host.getBoundingClientRect()
      cible.current = {
        x: ((event.clientX - box.left) / Math.max(box.width, 1)) * 2 - 1,
        y: ((event.clientY - box.top) / Math.max(box.height, 1)) * 2 - 1,
      }
    }

    host.addEventListener('pointermove', onMove, { passive: true })

    const subscription = clock.subscribe(
      () => {
        const box = host.getBoundingClientRect()
        const place = (
          node: HTMLDivElement | null,
          p: { x: number; y: number },
        ): void => {
          if (node === null) return
          node.style.transform = `translate3d(${String(((p.x + 1) / 2) * box.width)}px,${String(((p.y + 1) / 2) * box.height)}px,0) translate(-50%,-50%)`
        }

        place(amorti.current, pointer.current)
        place(brut.current, cible.current)
      },
      { priority: CLOCK_PRIORITY.render, name: 'apercu-pointeur-rendu' },
    )

    return () => {
      host.removeEventListener('pointermove', onMove)
      subscription.unsubscribe()
    }
  }, [host, pointer])

  return (
    <div ref={setHost} className="o-absolute o-inset-0 o-cursor-none o-overflow-hidden">
      <div
        ref={brut}
        aria-hidden
        className="o-absolute o-left-0 o-top-0 o-size-3 o-rounded-full o-border-w-1 o-border-zinc-400 dark:o-border-zinc-500"
      />
      <div
        ref={amorti}
        aria-hidden
        className="o-absolute o-left-0 o-top-0 o-size-6 o-rounded-full o-bg-brand-600 dark:o-bg-brand-400"
      />

      <p className="o-pointer-events-none o-absolute o-inset-x-0 o-bottom-4 o-flex o-items-center o-justify-center o-gap-2 o-text-sm o-text-zinc-500 dark:o-text-zinc-400">
        <Icon icon={MousePointer} size={14} />
        Le petit cercle est la position brute ; le disque la rattrape.
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Repli visuel                                                               */
/* -------------------------------------------------------------------------- */

/** Les trois etats qu'un repli peut traverser. */
type Etat = 'attente' | 'prete' | 'refusee'

/**
 * Le repli, ses deux issues, et le fondu entre les deux.
 *
 * Le delai est ici commande a la main plutot que par un vrai chargement : une
 * scene qui arrive en trois cents millisecondes ne laisserait rien voir, et
 * une qui n'arrive jamais ne montrerait pas le fondu.
 */
export function PosterDemo({ fade }: { fade: number }): ReactElement {
  const [etat, setEtat] = useState<Etat>('attente')

  const poster = usePoster({
    ready: etat === 'prete',
    refused: etat === 'refusee' ? 'demonstration' : undefined,
    fade,
  })

  const bouton =
    'o-rounded-md o-border-w-1 o-border-zinc-300 dark:o-border-zinc-700 o-bg-white dark:o-bg-zinc-900 o-px-3 o-py-1.5 o-text-sm o-cursor-pointer hover:o-bg-zinc-50 dark:hover:o-bg-zinc-800 focus:o-ring o-transition-colors'

  return (
    <div className="o-absolute o-inset-0 o-flex o-flex-col">
      <div className="o-relative o-flex-1 o-overflow-hidden">
        {/* Ce que le repli couvre : ici un degrade, ailleurs une scene. */}
        <div className="o-absolute o-inset-0 o-bg-gradient-to-br o-from-brand-600 o-to-fuchsia-600 o-flex o-items-center o-justify-center o-text-white o-font-medium">
          La scene
        </div>

        {poster.visible ? (
          <div
            style={poster.style}
            className="o-absolute o-inset-0 o-flex o-items-center o-justify-center o-bg-zinc-100 dark:o-bg-zinc-900 o-text-zinc-500 dark:o-text-zinc-400"
          >
            {etat === 'refusee' ? 'Le repli est le rendu final' : 'Le repli, en attente'}
          </div>
        ) : null}
      </div>

      <div className="o-flex o-flex-wrap o-items-center o-justify-center o-gap-2 o-border-t o-border-zinc-200 dark:o-border-zinc-800 o-bg-white dark:o-bg-zinc-950 o-p-3">
        <button type="button" className={bouton} onClick={() => setEtat('attente')}>
          Remettre en attente
        </button>
        <button type="button" className={bouton} onClick={() => setEtat('prete')}>
          La scene est prete
        </button>
        <button type="button" className={bouton} onClick={() => setEtat('refusee')}>
          La scene est refusee
        </button>
        <span className="o-font-mono o-text-xs o-text-zinc-400 dark:o-text-zinc-500">
          visible : {String(poster.visible)}
        </span>
      </div>
    </div>
  )
}
