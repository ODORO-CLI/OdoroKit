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
import { MousePointer } from '@odoro-cli/icons/outline'
import { useEffect, useRef, useState, type ReactElement } from 'react'

import { useInView } from '@/odoro/hooks/useInView.js'
import { usePointerDamped } from '@/odoro/hooks/usePointerDamped.js'
import { usePoster } from '@/odoro/hooks/usePoster.js'

import { Check, Copy } from '@odoro-cli/icons/outline'

import { useCopy } from '@/odoro/hooks/useCopy.js'
import { useIntervalClock } from '@/odoro/hooks/useIntervalClock.js'
import { useKeyboardList } from '@/odoro/hooks/useKeyboardList.js'
import { useMeasure } from '@/odoro/hooks/useMeasure.js'
import { useMediaQuery } from '@/odoro/hooks/useMediaQuery.js'
import { useScrollProgress } from '@/odoro/hooks/useScrollProgress.js'

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
        <div className="o-absolute o-inset-0 o-bg-gradient-to-br o-from-brand-700 o-to-brand-400 o-flex o-items-center o-justify-center o-text-white o-font-medium">
          La scène
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
          La scène est prête
        </button>
        <button type="button" className={bouton} onClick={() => setEtat('refusee')}>
          La scène est refusee
        </button>
        <span className="o-font-mono o-text-xs o-text-zinc-500 dark:o-text-zinc-400">
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
        Faites defiler le cadre : la cible s allume quand{' '}
        {String(Math.round(amount * 100))}
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

/* -------------------------------------------------------------------------- */
/* Avancee au defilement                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Ce que cette demonstration doit prouver.
 *
 * Deux choses, et la seconde est la vraie.
 *
 * La premiere : la course. On voit ou commence le zero et ou est atteint le un,
 * et le reglage `range` fait passer d'une carte qui traverse le champ a une
 * carte qu'on parcourt de l'interieur.
 *
 * La seconde : les deux lectures. La barre est ecrite dans la boucle, par la
 * ref, sans qu'aucun rendu React ait lieu de tout le defilement ; le
 * pourcentage passe par l'abonnement, et ne rend qu'aux paliers. Les deux
 * cotes du crochet sont donc a l'ecran en meme temps.
 */
export function ScrollProgressDemo({
  range,
}: {
  readonly range: 'traversee' | 'ancrage'
}): ReactElement {
  const [scroller, setScroller] = useState<HTMLDivElement | null>(null)
  const [cible, setCible] = useState<HTMLDivElement | null>(null)
  const barre = useRef<HTMLDivElement | null>(null)
  const [part, setPart] = useState(0)

  const { progress, subscribe } = useScrollProgress({
    target: cible,
    scroller,
    range,
    // La mesure est ce que la demonstration montre, pas une animation : elle
    // doit continuer sous mouvement reduit.
    reduced: 'suivre',
    name: 'apercu-progression',
  })

  // Le chiffre : un rendu par palier, cent sur toute la course.
  useEffect(() => subscribe(setPart), [subscribe])

  // La barre : une ecriture par image, aucun rendu React.
  useEffect(() => {
    const subscription = clock.subscribe(
      () => {
        const noeud = barre.current
        if (noeud === null) return
        noeud.style.transform = `scaleX(${String(progress.current)})`
      },
      { priority: CLOCK_PRIORITY.render, name: 'apercu-progression-rendu' },
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [progress])

  return (
    <div className="o-absolute o-inset-0 o-flex o-flex-col">
      <div className="o-flex o-shrink-0 o-items-center o-justify-between o-gap-2 o-px-4 o-pt-3 o-text-xs">
        <span className="o-opacity-70">
          {range === 'ancrage'
            ? 'ancrage : la carte est parcourue de l interieur'
            : 'traversee : la carte entre, passe, et sort'}
        </span>
        <span className="o-font-mono o-tabular-nums">
          {String(Math.round(part * 100))}&nbsp;%
        </span>
      </div>

      <div className="o-mt-2 o-h-1.5 o-w-full o-shrink-0 o-overflow-hidden o-bg-zinc-200 dark:o-bg-zinc-800">
        <div
          ref={barre}
          aria-hidden
          style={{ transform: 'scaleX(0)' }}
          className="o-h-full o-w-full o-origin-left o-bg-brand-500 o-will-change-transform"
        />
      </div>

      <div
        ref={setScroller}
        className="o-min-h-0 o-flex-1 o-overflow-y-auto o-px-4 o-py-3"
      >
        <div className="o-h-40 o-shrink-0" aria-hidden="true" />

        <div
          ref={setCible}
          className="o-flex o-h-64 o-items-center o-justify-center o-rounded-lg o-border-w-1 o-border-zinc-300 dark:o-border-zinc-700 o-text-sm"
        >
          la carte mesuree
        </div>

        <div className="o-h-40 o-shrink-0" aria-hidden="true" />
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Requete de media                                                           */
/* -------------------------------------------------------------------------- */

/**
 * Ce que cette demonstration doit prouver.
 *
 * Qu'une requete de media n'est pas une largeur. Les quatre requetes fixes
 * repondent a des questions qu'aucune mesure de `window.innerWidth` ne sait
 * poser — l'orientation, le doigt plutot que la souris, le theme du systeme,
 * la preference de mouvement — et elles basculent sans que la fenetre change
 * de taille.
 *
 * La cinquieme est celle de l'atelier : on l'ecrit, et la reponse suit.
 */
export function MediaQueryDemo({ query }: { readonly query: string }): ReactElement {
  const perso = useMediaQuery(query)
  const large = useMediaQuery('(min-width: 60rem)')
  const paysage = useMediaQuery('(orientation: landscape)')
  const grossier = useMediaQuery('(pointer: coarse)')
  const calme = useMediaQuery('(prefers-reduced-motion: reduce)')

  const lignes: readonly (readonly [string, boolean])[] = [
    [query, perso],
    ['(min-width: 60rem)', large],
    ['(orientation: landscape)', paysage],
    ['(pointer: coarse)', grossier],
    ['(prefers-reduced-motion: reduce)', calme],
  ]

  return (
    <div className="o-absolute o-inset-0 o-flex o-flex-col o-items-center o-justify-center o-gap-3 o-p-4">
      <ul className="o-w-full o-max-w-md o-list-none o-space-y-1">
        {lignes.map(([requete, reponse], rang) => (
          <li
            key={`${String(rang)}-${requete}`}
            className="o-flex o-items-center o-justify-between o-gap-3 o-rounded-md o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-px-3 o-py-2"
          >
            <code className="o-min-w-0 o-truncate o-font-mono o-text-xs">{requete}</code>
            <span className="o-inline-flex o-shrink-0 o-items-center o-gap-2 o-text-xs">
              <span
                aria-hidden
                className={`o-size-2 o-rounded-full ${
                  reponse ? 'o-bg-brand-500' : 'o-bg-zinc-300 dark:o-bg-zinc-700'
                }`}
              />
              {reponse ? 'oui' : 'non'}
            </span>
          </li>
        ))}
      </ul>

      <p className="o-text-xs o-opacity-70">
        Redimensionnez la fenêtre : la réponse ne bascule qu’une fois, pas a chaque pixel.
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Mesure d un element                                                        */
/* -------------------------------------------------------------------------- */

/**
 * Ce que cette demonstration doit prouver.
 *
 * Qu'on mesure sans boucle. La poignee de redimensionnement du navigateur est
 * ce qu'il y a de plus direct : on tire, la mesure suit, et rien ne tourne
 * entre deux mouvements.
 *
 * Le compteur de rendus est la pour l'arrondi. Sans lui, le reglage passerait
 * pour un detail d'affichage ; avec lui, on voit qu'une largeur fractionnaire
 * rend plus souvent, ce qui est exactement l'argument.
 */
export function MeasureDemo({ arrondi }: { readonly arrondi: boolean }): ReactElement {
  const { ref, box, pret } = useMeasure<HTMLDivElement>({ arrondi })

  // Un compteur de rendus, hors etat : le lire ne doit pas en provoquer un.
  const rendus = useRef(0)
  rendus.current += 1

  return (
    <div className="o-absolute o-inset-0 o-flex o-flex-col o-items-center o-justify-center o-gap-3 o-p-4">
      <div
        ref={ref}
        style={{ resize: 'both' }}
        className="o-flex o-min-h-24 o-min-w-24 o-max-h-full o-max-w-full o-items-center o-justify-center o-overflow-auto o-rounded-lg o-border-w-2 o-border-zinc-300 dark:o-border-zinc-700 o-p-4 o-text-sm o-select-none"
      >
        Tirez le coin
      </div>

      <p className="o-font-mono o-text-xs o-tabular-nums o-opacity-70">
        {pret
          ? `${String(box.width)} x ${String(box.height)} px — coin a ${String(box.left)}, ${String(box.top)}`
          : 'pas encore mesure'}
      </p>

      <p className="o-text-xs o-opacity-70">
        {arrondi ? 'arrondi au pixel' : 'sous-pixel'} — {String(rendus.current)} rendus
        depuis le montage
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Intervalle sur l horloge                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Ce que cette demonstration doit prouver.
 *
 * L'ecart, comme pour le pointeur amorti. Un compteur qui avance a cadence
 * reguliere ne dit rien : `setInterval` en fait autant en une ligne. Deux
 * compteurs lances ensemble, dont l'un sur l'horloge du moteur, disent tout —
 * il suffit de changer d'onglet dix secondes pour les voir se separer, et de
 * revenir pour constater lequel a travaille dans le vide.
 */
export function IntervalClockDemo({
  interval,
}: {
  readonly interval: number
}): ReactElement {
  const [horloge, setHorloge] = useState(0)
  const [minuteur, setMinuteur] = useState(0)

  useIntervalClock(() => setHorloge((n) => n + 1), {
    interval,
    name: 'apercu-intervalle',
  })

  // Le temoin : un `setInterval` ordinaire, que l'onglet cache n'arrete pas.
  useEffect(() => {
    const identifiant = setInterval(() => setMinuteur((n) => n + 1), interval)
    return () => {
      clearInterval(identifiant)
    }
  }, [interval])

  const carte =
    'o-flex o-flex-col o-items-center o-gap-1 o-rounded-lg o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-px-4 o-py-3'

  return (
    <div className="o-absolute o-inset-0 o-flex o-flex-col o-items-center o-justify-center o-gap-3 o-p-4">
      <div className="o-flex o-flex-wrap o-items-center o-justify-center o-gap-3">
        <div className={carte}>
          <span className="o-font-mono o-text-lg o-tabular-nums o-text-brand-600 dark:o-text-brand-400">
            {String(horloge)}
          </span>
          <span className="o-text-xs o-opacity-70">horloge du moteur</span>
        </div>

        <div className={carte}>
          <span className="o-font-mono o-text-lg o-tabular-nums">{String(minuteur)}</span>
          <span className="o-text-xs o-opacity-70">setInterval</span>
        </div>
      </div>

      <p className="o-max-w-md o-text-center o-text-xs o-opacity-70">
        Changez d’onglet dix secondes, puis revenez : seul le minuteur a compte pendant
        l’absence. Le crochet, lui, a repris ou il en etait.
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Liste au clavier                                                           */
/* -------------------------------------------------------------------------- */

/** Des etiquettes courtes : ce qui se juge est la navigation, pas le contenu. */
const TEINTES = [
  'Aurore',
  'Braise',
  'Cendre',
  'Dune',
  'Eclat',
  'Filament',
  'Givre',
  'Halo',
  'Ivoire',
  'Jade',
  'Kaolin',
  'Lisiere',
] as const

/**
 * Ce que cette demonstration doit prouver.
 *
 * Le tabindex glissant. Ce qui se voit d'abord, ce sont les fleches ; ce qui
 * compte est qu'une seule tabulation entre dans la liste et une seule en sort.
 * La phrase du bas le dit, parce que c'est invisible autrement.
 *
 * Et que le focus suit : la mise en evidence du navigateur reste sur l'element
 * actif, sans qu'on ait rien peint pour cela.
 */
export function KeyboardListDemo({
  count,
  orientation,
}: {
  readonly count: number
  readonly orientation: 'verticale' | 'horizontale'
}): ReactElement {
  const elements = TEINTES.slice(
    0,
    Math.min(Math.max(Math.round(count), 1), TEINTES.length),
  )
  const [choisi, setChoisi] = useState<string | null>(null)

  const liste = useKeyboardList({
    count: elements.length,
    orientation,
    onValider: (index) => {
      setChoisi(elements[index] ?? null)
    },
  })

  return (
    <div className="o-absolute o-inset-0 o-flex o-flex-col o-items-center o-justify-center o-gap-3 o-p-4">
      <button
        type="button"
        className="o-rounded-md o-border-w-1 o-border-zinc-300 dark:o-border-zinc-700 o-px-3 o-py-1.5 o-text-sm o-cursor-pointer focus:o-ring"
      >
        Avant la liste
      </button>

      <ul
        {...liste.listProps}
        role="listbox"
        aria-label="Teintes"
        className={`o-flex o-list-none o-gap-1.5 ${
          orientation === 'horizontale' ? 'o-flex-wrap o-justify-center' : 'o-flex-col'
        }`}
      >
        {elements.map((teinte, index) => (
          <li
            key={teinte}
            {...liste.itemProps(index)}
            role="option"
            aria-selected={teinte === choisi}
            onClick={() => {
              liste.aller(index)
              setChoisi(teinte)
            }}
            className={`o-cursor-pointer o-rounded-md o-border-w-1 o-px-3 o-py-1.5 o-text-sm o-transition-colors focus:o-ring ${
              index === liste.actif
                ? 'o-border-brand-500 o-bg-zinc-100 dark:o-bg-zinc-800'
                : 'o-border-zinc-200 dark:o-border-zinc-800'
            }`}
          >
            {teinte}
            {teinte === choisi ? ' ·' : ''}
          </li>
        ))}
      </ul>

      <p className="o-max-w-md o-text-center o-text-xs o-opacity-70">
        Une tabulation pour entrer, les fleches pour parcourir, Home et End pour les
        bouts, Entrée pour choisir — et une seule tabulation pour ressortir.
      </p>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/* Copie confirmee                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Ce que cette demonstration doit prouver.
 *
 * Que la confirmation retombe. Un bouton qui affiche « copie » se photographie
 * tres bien et ne prouve rien ; ce qui se juge ici est le retour au repos, et
 * le fait que le delai le regle.
 *
 * L'annonce vit dans un `role="status"` : la confirmation doit exister aussi
 * pour qui ne voit pas le bouton changer.
 */
export function CopyDemo({ delai }: { readonly delai: number }): ReactElement {
  const { etat, copier } = useCopy({ delai })
  const commande = 'pnpm dlx odoro add hooks/use-copy'

  const libelle = etat === 'copie' ? 'Copie' : etat === 'echec' ? 'Echec' : 'Copier'

  return (
    <div className="o-absolute o-inset-0 o-flex o-flex-col o-items-center o-justify-center o-gap-3 o-p-4">
      <div className="o-flex o-w-full o-max-w-md o-items-center o-justify-between o-gap-3 o-rounded-lg o-border-w-1 o-border-zinc-200 dark:o-border-zinc-800 o-px-3 o-py-2">
        <code className="o-min-w-0 o-truncate o-font-mono o-text-xs">{commande}</code>

        <button
          type="button"
          onClick={() => {
            void copier(commande)
          }}
          className="o-inline-flex o-shrink-0 o-cursor-pointer o-items-center o-gap-2 o-rounded-md o-border-w-1 o-border-zinc-300 dark:o-border-zinc-700 o-px-3 o-py-1.5 o-text-sm o-transition-colors focus:o-ring"
        >
          <Icon icon={etat === 'copie' ? Check : Copy} size={14} />
          {libelle}
        </button>
      </div>

      <p role="status" className="o-text-xs o-opacity-70">
        {etat === 'copie'
          ? 'Le presse-papiers a recu le texte.'
          : etat === 'echec'
            ? 'Le presse-papiers a refuse : selectionnez le texte a la main.'
            : `Etat au repos — la confirmation retombe apres ${String(delai)} ms.`}
      </p>
    </div>
  )
}
