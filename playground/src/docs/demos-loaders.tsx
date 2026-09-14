/**
 * Les demonstrations des rideaux et du curseur.
 *
 * ## Pourquoi elles vivent a part
 *
 * Ces trois composants couvrent l'ecran. Poses tels quels dans une fiche, ils
 * couvriraient la documentation — la navigation comprise — et il faudrait
 * recharger la page pour s'en defaire.
 *
 * ## Contenir un `position: fixed` sans le modifier
 *
 * Un element `fixed` se positionne par rapport a la fenetre… sauf si un ancetre
 * porte un `transform`, un `filter` ou un `contain`. Cet ancetre devient alors
 * son bloc conteneur, et le `fixed` se resout contre lui.
 *
 * C'est la propriete qu'on emploie ici : un `translateZ(0)` sur le cadre suffit
 * a y enfermer le rideau. Le composant n'est pas modifie pour la
 * demonstration — ce qu'on montre est exactement ce qui sera installe.
 *
 * ## Un rideau ne joue qu'une fois
 *
 * C'est sa nature, et cela en fait une mauvaise demonstration : on arrive sur
 * la fiche, il est deja parti. Chaque apercu porte donc un bouton qui le
 * remonte, en changeant sa cle pour forcer un vrai remontage plutot qu'une
 * remise a zero approximative.
 *
 * @module
 */

import { useRef, useState, type ReactElement } from 'react'

import { CursorHalo } from '@/odoro/effect/CursorHalo.js'
import { CounterGate } from '@/odoro/loader/CounterGate.js'
import { CurtainWipe } from '@/odoro/loader/CurtainWipe.js'

/** Le cadre qui enferme un `fixed`, et le bouton qui rejoue. */
function Cadre({
  cle,
  onRejouer,
  children,
}: {
  readonly cle: number
  readonly onRejouer: () => void
  readonly children: ReactElement
}): ReactElement {
  return (
    <div
      className="o-absolute o-inset-0 o-overflow-hidden o-rounded-lg"
      // Le `transform` est ce qui contient le rideau. Sans lui, il couvrirait
      // la documentation entiere.
      style={{ transform: 'translateZ(0)' }}
    >
      <div key={cle}>{children}</div>

      <button
        type="button"
        onClick={onRejouer}
        className="o-absolute o-bottom-3 o-right-3 o-z-10 o-rounded-md o-border-w-1 o-border-current/20 o-bg-white/80 dark:o-bg-zinc-900/80 o-px-3 o-py-1 o-text-xs o-font-medium"
      >
        Rejouer
      </button>
    </div>
  )
}

/** Le rideau a compteur, contenu et rejouable. */
export function CounterGateDemo({
  ceiling,
  minVisibleMs,
  ready,
}: {
  readonly ceiling: number
  readonly minVisibleMs: number
  readonly ready: boolean
}): ReactElement {
  const [cle, setCle] = useState(0)

  return (
    <Cadre
      cle={cle}
      onRejouer={() => {
        setCle((v) => v + 1)
      }}
    >
      <CounterGate
        ready={ready}
        ceiling={ceiling}
        minVisibleMs={minVisibleMs}
        label={<span className="o-text-2xl o-font-semibold o-tracking-tight">Odoro</span>}
      />
    </Cadre>
  )
}

/** La plaque percee, contenue et rejouable. */
/**
 * Le cadre des rideaux plein ecran : contenu par `contained`, et rejouable.
 *
 * Un rideau ne joue qu une fois : sans le bouton, la fiche s ouvrirait sur un
 * apercu deja parti. La cle remonte le composant, ce qui rejoue la sequence
 * depuis son debut.
 *
 * A la difference de `Cadre`, il n a pas besoin de piegeer le `position:fixed`
 * par une transformation : ces rideaux acceptent `contained` et se posent alors
 * sur le premier ancetre positionne.
 */
export function CadreRideau({
  children,
}: {
  readonly children: ReactElement
}): ReactElement {
  const [cle, setCle] = useState(0)

  return (
    <div className="o-absolute o-inset-0 o-overflow-hidden o-rounded-lg">
      <div key={cle}>{children}</div>
      <button
        type="button"
        onClick={() => {
          setCle((v) => v + 1)
        }}
        className="o-absolute o-bottom-3 o-right-3 o-z-10 o-rounded-md o-border-w-1 o-border-current/20 o-bg-white/80 dark:o-bg-zinc-900/80 o-px-3 o-py-1 o-text-xs o-font-medium"
      >
        Rejouer
      </button>
    </div>
  )
}

export function CurtainWipeDemo({
  holdMs,
  wipeMs,
}: {
  readonly holdMs: number
  readonly wipeMs: number
}): ReactElement {
  const [cle, setCle] = useState(0)

  return (
    <Cadre
      cle={cle}
      onRejouer={() => {
        setCle((v) => v + 1)
      }}
    >
      <CurtainWipe
        holdMs={holdMs}
        wipeMs={wipeMs}
        label={<span className="o-text-2xl o-font-semibold o-tracking-tight">Odoro</span>}
      />
    </Cadre>
  )
}

/**
 * Le curseur, limite au cadre.
 *
 * C'est ici que la propriete `host` sert vraiment : sans elle, le curseur
 * ecouterait la fenetre entiere et se dessinerait par-dessus la documentation.
 */
export function CursorHaloDemo({
  speed,
  haloSize,
  hoverScale,
}: {
  readonly speed: number
  readonly haloSize: number
  readonly hoverScale: number
}): ReactElement {
  const cadre = useRef<HTMLDivElement | null>(null)

  return (
    <div
      ref={cadre}
      className="o-absolute o-inset-0 o-flex o-items-center o-justify-center o-gap-4 o-overflow-hidden o-rounded-lg"
      style={{ transform: 'translateZ(0)' }}
    >
      <p className="o-text-sm o-opacity-70">Promenez le pointeur ici —</p>
      <button
        type="button"
        className="o-rounded-full o-border-w-1 o-border-current o-px-5 o-py-2 o-text-sm o-font-medium"
      >
        et survolez ceci
      </button>

      <CursorHalo
        host={cadre}
        speed={speed}
        haloSize={haloSize}
        hoverScale={hoverScale}
      />
    </div>
  )
}
