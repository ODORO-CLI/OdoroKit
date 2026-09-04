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

import { CLOCK_PRIORITY, clock } from '@odoro-cli/engine'
import { Icon } from '@odoro-cli/icons'
import { MousePointer } from '@odoro-cli/icons/filaire'
import { useEffect, useRef, useState, type ReactElement } from 'react'

import { useInView } from '@/odoro/hooks/useInView.js'
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

/* -------------------------------------------------------------------------- */
/* Entree dans le champ                                                       */
/* -------------------------------------------------------------------------- */

/**
 * Ce que cette demonstration doit prouver.
 *
 * Un crochet qui dit « c'est visible » ne se montre pas en affichant un
 * booleen. Ce qui compte est le **seuil** : a partir de quelle part visible il
 * bascule, et le fait qu'il ne rebascule pas ensuite.
 *
 * Le cadre defile donc a la main, avec une cible dont on voit la bordure
 * changer au moment precis ou elle est assez entree. Le reglage `amount` est
 * pilotable : on le monte, on refait defiler, et le basculement arrive plus
 * tard. C'est la seule facon de rendre un seuil sensible.
 */
export function InViewDemo({ amount }: { readonly amount: number }): ReactElement {
  // `once: false` ici, contrairement au defaut : une demonstration qu'on ne
  // peut jouer qu'une fois n'en est pas une.
  const { ref, vu } = useInView<HTMLDivElement>({ amount, once: false })

  return (
    <div className="o-absolute o-inset-0 o-flex o-flex-col">
      <p className="o-shrink-0 o-px-4 o-pt-3 o-text-xs o-opacity-70">
        Faites defiler le cadre : la cible s allume quand {String(Math.round(amount * 100))}
        &nbsp;% d elle est visible.
      </p>

      <div className="o-min-h-0 o-flex-1 o-overflow-y-auto o-px-4 o-py-3">
        <div className="o-h-64 o-shrink-0" aria-hidden="true" />

        <div
          ref={ref}
          className={[
            'o-flex o-h-32 o-items-center o-justify-center o-rounded-lg o-border-w-2',
            'o-transition-colors',
            vu ? 'o-border-brand-500 o-bg-brand-500/10' : 'o-border-current/20',
          ].join(' ')}
        >
          <span className="o-text-sm o-font-medium">{vu ? 'vue' : 'pas encore'}</span>
        </div>

        <div className="o-h-64 o-shrink-0" aria-hidden="true" />
      </div>
    </div>
  )
}
