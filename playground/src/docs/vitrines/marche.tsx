/**
 * La trousse « marketplace » des vitrines.
 *
 * Elle materialise la charte (`CHARTE.md`) : ce que douze templates Framer et
 * treize layers GetLayers ont en commun, reduit a des pieces qu une vitrine
 * compose. Elle ne dicte aucun ordre de page — le milieu de chaque vitrine
 * reste son mecanisme — mais elle fournit **la voix** (polices), **le rideau**
 * d ouverture, **la revelation** gardee par ce rideau, les trois barres, le
 * titre-objet, et les sections de vocabulaire : manifeste, liste numerotee,
 * chiffres, logos, verre, appel final, pied.
 *
 * ## Le rideau et la revelation, ensemble
 *
 * La regle la plus constante des references : le contenu de l ouverture est
 * **monte cache et se revele a travers le rideau qui part**, jamais apres son
 * repos. `Porte` pose le rideau et bascule un contexte au debut de la sortie ;
 * `Surgit` et `TitreVague` lisent ce contexte et n animent qu a ce moment. Les
 * revelations sous le pli, elles, restent a l entree dans le champ.
 *
 * ## Les polices
 *
 * Aucune reference n emploie une pile systeme. `usePolices` charge une voix
 * — une famille d affichage, une de corps, une mono — par le CDN Google Fonts
 * que la librairie sait deja invoquer, et **la pose sur la racine de la
 * vitrine seulement** : le reste de la documentation garde ses polices.
 *
 * @module
 */

import { useMotionState } from '@odoro-cli/engine'
import { fontStack, loadGoogleFonts, type GoogleFontInput } from '@odoro-cli/libs/styles'
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactElement,
  type ReactNode,
} from 'react'

import { Noise } from '@/odoro/background/Noise.jsx'
import { Marquee } from '@/odoro/effect/Marquee.jsx'
import { CounterGate } from '@/odoro/loader/CounterGate.jsx'
import { CurtainWipe } from '@/odoro/loader/CurtainWipe.jsx'
import { IrisOpen } from '@/odoro/loader/IrisOpen.jsx'
import { LettersGate } from '@/odoro/loader/LettersGate.jsx'
import { ZoomGate } from '@/odoro/loader/ZoomGate.jsx'

import { aplat, encre, encreSurSombre } from './palettes.js'

/* ============================ Les voix ================================= */

/** Une voix : trois familles, et les graisses qu on charge vraiment. */
export interface Voix {
  readonly affichage: GoogleFontInput
  readonly corps: GoogleFontInput
  readonly mono: GoogleFontInput
  /** Un serif pour le mot d accent en italique, s il y en a un. */
  readonly accent?: GoogleFontInput
}

/**
 * Les voix retenues, nommees par ce qu elles disent.
 *
 * Chacune est choisie d apres une reference : Sentira et Miles parlent en
 * Inter Display leger ; Spector et Gallary en grotesque condensee lourde ;
 * Vesper et Flowstate en Onest ; Salonix en Rethink ; Nordframe en mono.
 */
export const VOIX = {
  /** Inter serree, 300 ou 800 : la voix la plus repandue du marketplace. */
  inter: {
    affichage: { family: 'Inter Tight', weights: [300, 500, 800] },
    corps: { family: 'Inter', weights: [400, 500] },
    mono: { family: 'JetBrains Mono', weights: [400, 500] },
    accent: { family: 'Instrument Serif', weights: [400], italics: true },
  },
  /** Onest : la voix de Vesper et Flowstate, ronde et technique. */
  onest: {
    affichage: { family: 'Onest', weights: [300, 600, 800] },
    corps: { family: 'Onest', weights: [400, 500] },
    mono: { family: 'IBM Plex Mono', weights: [400, 500] },
  },
  /** Manrope, la voix de Rescale et des produits clairs. */
  manrope: {
    affichage: { family: 'Manrope', weights: [300, 500, 800] },
    corps: { family: 'Manrope', weights: [400, 500] },
    mono: { family: 'DM Mono', weights: [400, 500] },
  },
  /** Plus Jakarta, la voix de Spector : geometrique, ferme. */
  jakarta: {
    affichage: { family: 'Plus Jakarta Sans', weights: [300, 700, 800] },
    corps: { family: 'Plus Jakarta Sans', weights: [400, 500] },
    mono: { family: 'Fragment Mono', weights: [400] },
  },
  /** Archivo noir condense : la voix des affiches, Gallary et Nordframe. */
  affiche: {
    affichage: { family: 'Archivo Black', weights: [400] },
    corps: { family: 'Archivo', weights: [400, 500] },
    mono: { family: 'Space Mono', weights: [400, 700] },
  },
  /** Bricolage : une grotesque a caractere, pour les studios et les labels. */
  bricolage: {
    affichage: { family: 'Bricolage Grotesque', weights: [300, 600, 800] },
    corps: { family: 'Figtree', weights: [400, 500] },
    mono: { family: 'JetBrains Mono', weights: [400] },
  },
  /** Space Grotesk : la voix des produits techniques et des conferences. */
  grotesk: {
    affichage: { family: 'Space Grotesk', weights: [300, 500, 700] },
    corps: { family: 'Space Grotesk', weights: [400, 500] },
    mono: { family: 'Space Mono', weights: [400, 700] },
  },
  /** Fraunces : le serif optique des maisons — parfum, joaillerie, hotel. */
  fraunces: {
    affichage: { family: 'Fraunces', weights: [300, 400, 600], italics: true },
    corps: { family: 'Inter', weights: [400, 500] },
    mono: { family: 'JetBrains Mono', weights: [400] },
  },
  /** Cormorant : le serif haut contraste, en titre seulement. */
  cormorant: {
    affichage: { family: 'Cormorant Garamond', weights: [300, 400, 500], italics: true },
    corps: { family: 'Work Sans', weights: [400, 500] },
    mono: { family: 'IBM Plex Mono', weights: [400] },
  },
  /** Syne : large, etrange, pour les galeries et la scene. */
  syne: {
    affichage: { family: 'Syne', weights: [400, 700, 800] },
    corps: { family: 'DM Sans', weights: [400, 500] },
    mono: { family: 'DM Mono', weights: [400, 500] },
  },
  /** Unbounded : la voix ronde et pleine des marques grand public. */
  unbounded: {
    affichage: { family: 'Unbounded', weights: [300, 500, 800] },
    corps: { family: 'Sora', weights: [400, 500] },
    mono: { family: 'JetBrains Mono', weights: [400] },
  },
  /** Oswald : la condensee des salles de sport et des festivals. */
  oswald: {
    affichage: { family: 'Oswald', weights: [300, 500, 700] },
    corps: { family: 'Barlow', weights: [400, 500] },
    mono: { family: 'Space Mono', weights: [400] },
  },
} as const satisfies Readonly<Record<string, Voix>>

/** Un nom de voix. */
export type NomDeVoix = keyof typeof VOIX

/**
 * Charge une voix et rend les variables a poser sur la racine de la vitrine.
 *
 * Les liens sont injectes une fois par montage et retires au demontage ; le
 * navigateur garde les fichiers en cache, donc revenir sur la vitrine ne
 * recharge rien.
 */
export function usePolices(nom: NomDeVoix): CSSProperties {
  const voix: Voix = VOIX[nom]
  useEffect(() => {
    const demandes: GoogleFontInput[] = [voix.affichage, voix.corps, voix.mono]
    if (voix.accent !== undefined) demandes.push(voix.accent)
    return loadGoogleFonts(demandes)
  }, [voix])

  return useMemo(() => {
    const famille = (f: GoogleFontInput): string => (typeof f === 'string' ? f : f.family)
    const vars: Record<string, string> = {
      '--o-font-sans': fontStack(famille(voix.corps)),
      '--o-font-mono': fontStack(famille(voix.mono), 'monospace'),
      '--o-vitrine-affichage': fontStack(famille(voix.affichage)),
    }
    if (voix.accent !== undefined) vars['--o-font-serif'] = fontStack(famille(voix.accent), 'serif')
    return vars as CSSProperties
  }, [voix])
}

/* ============================ Le titre-objet =========================== */

/** Les corps d affichage, en `clamp` : le titre est l objet de la page. */
const CORPS = {
  /** 56 a 96 px : un titre de section forte. */
  m: 'clamp(2.25rem, 6vw, 6rem)',
  /** 72 a 150 px : l accroche d ouverture. */
  l: 'clamp(3rem, 9vw, 9.5rem)',
  /** 96 a 220 px : le mot-marque. */
  xl: 'clamp(3.5rem, 14vw, 14rem)',
  /** 120 a 320 px : le mot-marque qui remplit la largeur. */
  xxl: 'clamp(2.75rem, 19vw, 20rem)',
} as const

/**
 * Le style d un titre d affichage.
 *
 * @param corps La taille, voir {@link CORPS}.
 * @param graisse 300 (Sentira, Miles, Vesper) ou 800 (Gallary, Spector, Fuel).
 *   Jamais entre les deux : c est la graisse du corps de texte.
 */
export function affiche(corps: keyof typeof CORPS, graisse: 300 | 400 | 500 | 700 | 800 = 300): CSSProperties {
  return {
    fontFamily: 'var(--o-vitrine-affichage, var(--o-font-sans))',
    fontSize: CORPS[corps],
    fontWeight: graisse,
    letterSpacing: graisse >= 700 ? '-0.04em' : '-0.035em',
    lineHeight: corps === 'm' ? 1 : 0.92,
    textWrap: 'balance',
  } as CSSProperties
}

/** Le mot d accent en serif italique, dans un titre. */
export function Accent({ children, couleur }: { readonly children: ReactNode; readonly couleur?: string }): ReactElement {
  return (
    <em className="o-font-serif o-italic o-font-normal" style={{ color: couleur, letterSpacing: '-0.01em' }}>
      {children}
    </em>
  )
}

/** Le mot d accent dans une gelule bordee, comme « Smart AI » chez Rescale. */
export function Encadre({ children }: { readonly children: ReactNode }): ReactElement {
  return (
    <span
      className="o-inline-block o-rounded-full o-border-w-1 o-align-middle"
      style={{ borderColor: 'currentcolor', padding: '0 0.28em', lineHeight: 1.15, fontWeight: 300 }}
    >
      {children}
    </span>
  )
}

/* ============================ Le rideau ================================ */

const PretContexte = createContext<boolean>(true)

/** Vrai des que le rideau commence a partir. Sans `Porte`, toujours vrai. */
export function usePret(): boolean {
  return useContext(PretContexte)
}

/* ============================ La molette ============================== */

/**
 * La molette au-dessus d une bande qui defile de cote.
 *
 * ## Le defaut qu elle corrige
 *
 * Une bande horizontale — un rail de cartes, une rangee de gelules, un tableau
 * large — ne reagit pas a la molette : le navigateur n envoie de defilement
 * lateral qu avec la touche majuscule ou un pave tactile a deux doigts. Sur une
 * souris, la bande parait **bloquee**, et c est exactement ce qu on nous a
 * signale.
 *
 * ## Ce qu elle ne fait pas
 *
 * Elle ne detourne pas la page. Le detournement est le defaut inverse, et il
 * est pire : une bande qui avale la molette immobilise le visiteur des qu il
 * la survole. Ici, la bande ne prend la main **que tant qu elle peut encore
 * avancer** dans le sens demande ; arrivee au bout, elle rend la molette a la
 * page, et le defilement reprend sans un a-coup.
 *
 * Elle ne s applique qu a une molette **verticale pure** : un pave tactile qui
 * envoie deja du lateral sait ce qu il fait, et un geste en diagonale n est pas
 * une demande de defilement lateral.
 *
 * ## Pourquoi elle est ici, et pas dans chaque page
 *
 * Vingt-quatre vitrines ont au moins une bande de ce genre, et il en naitra
 * d autres. Un ecouteur unique, pose par le rideau que toutes traversent, les
 * couvre toutes — et une bande ajoutee demain en herite sans qu on y pense.
 */
function useMoletteLaterale(): void {
  useEffect(() => {
    /** La premiere bande qui defile de cote au-dessus du pointeur. */
    const bandeSous = (depart: EventTarget | null): HTMLElement | null => {
      let noeud = depart instanceof HTMLElement ? depart : null
      while (noeud !== null && noeud !== document.body) {
        const style = getComputedStyle(noeud)
        // Un conteneur qui defile verticalement a la priorite : c est lui que
        // la molette vise, et le traverser serait un detournement.
        if (
          (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
          noeud.scrollHeight - noeud.clientHeight > 1
        ) {
          return null
        }
        if (
          (style.overflowX === 'auto' || style.overflowX === 'scroll') &&
          noeud.scrollWidth - noeud.clientWidth > 1
        ) {
          return noeud
        }
        noeud = noeud.parentElement
      }
      return null
    }

    const surMolette = (evenement: WheelEvent): void => {
      if (evenement.ctrlKey || evenement.defaultPrevented) return
      if (Math.abs(evenement.deltaY) <= Math.abs(evenement.deltaX)) return

      const bande = bandeSous(evenement.target)
      if (bande === null) return

      const course = bande.scrollWidth - bande.clientWidth
      const pas = evenement.deltaMode === 1 ? evenement.deltaY * 16 : evenement.deltaY
      const vise = bande.scrollLeft + pas
      // Au bout, la bande rend la main : c est ce qui empeche le blocage.
      if ((pas < 0 && bande.scrollLeft <= 0) || (pas > 0 && bande.scrollLeft >= course - 1)) return

      bande.scrollLeft = Math.max(0, Math.min(course, vise))
      evenement.preventDefault()
    }

    window.addEventListener('wheel', surMolette, { passive: false })
    return () => {
      window.removeEventListener('wheel', surMolette)
    }
  }, [])
}

/**
 * Le rideau d ouverture, et le contexte qu il bascule.
 *
 * `onDone` de chaque rideau est appele **au debut** de sa sortie : c est la
 * que `pret` passe a vrai, et que `Surgit` part — a travers le rideau.
 */
export function Porte({
  forme,
  marque,
  sombre = true,
  pret: pretExterne = true,
  children,
}: {
  readonly forme: 'compteur' | 'iris' | 'trou' | 'lettres' | 'zoom'
  readonly marque: string
  /** Vrai pour un rideau noir a encre claire. */
  readonly sombre?: boolean
  /** Ce qu on attend vraiment — la premiere image d une scene, par exemple. */
  readonly pret?: boolean
  readonly children: ReactNode
}): ReactElement {
  const [ouvert, setOuvert] = useState(false)
  const { reduced } = useMotionState()
  useMoletteLaterale()
  const fond = sombre ? 'var(--o-palette-zinc-950)' : 'var(--o-palette-zinc-50)'
  const ink = sombre ? 'var(--o-palette-zinc-50)' : 'var(--o-palette-zinc-950)'
  const finir = (): void => {
    setOuvert(true)
  }
  const tenue = reduced ? 300 : 1100

  const label = (
    <span className="o-font-mono o-text-xs o-uppercase o-tracking-widest" style={{ color: ink }}>
      {marque}
    </span>
  )

  let rideau: ReactElement
  switch (forme) {
    case 'compteur':
      rideau = (
        <CounterGate background={fond} ink={ink} ready={pretExterne} label={label} minVisibleMs={tenue} onDone={finir} />
      )
      break
    case 'iris':
      rideau = <IrisOpen background={fond} ink={ink} label={label} holdMs={tenue} onDone={finir} />
      break
    case 'lettres':
      rideau = <LettersGate background={fond} ink={ink} word={marque.toUpperCase()} holdMs={reduced ? 200 : 500} onDone={finir} />
      break
    case 'zoom':
      rideau = <ZoomGate background={fond} ink={ink} label={label} holdMs={tenue} onDone={finir} />
      break
    default:
      rideau = <CurtainWipe background={fond} ink={ink} label={label} holdMs={tenue} onDone={finir} />
  }

  return (
    <PretContexte.Provider value={ouvert}>
      {rideau}
      {children}
    </PretContexte.Provider>
  )
}

/**
 * Une revelation gardee par le rideau.
 *
 * Montee cachee, elle part quand `pret` bascule : flou et montee, l opacite
 * pleine des le premier tiers. Sous mouvement reduit, l opacite seule.
 */
export function Surgit({
  delai = 0,
  duree = 900,
  distance = 28,
  as: Balise = 'div',
  className,
  style,
  children,
}: {
  readonly delai?: number
  readonly duree?: number
  readonly distance?: number
  readonly as?: 'div' | 'span' | 'p' | 'h1' | 'h2' | 'li'
  readonly className?: string
  readonly style?: CSSProperties
  readonly children: ReactNode
}): ReactElement {
  const pret = usePret()
  const { reduced } = useMotionState()
  const cache: CSSProperties = reduced
    ? { opacity: 0 }
    : { opacity: 0, transform: `translate3d(0, ${String(distance)}px, 0)`, filter: 'blur(10px)' }
  const visible: CSSProperties = { opacity: 1, transform: 'none', filter: 'blur(0)' }
  const courbe = 'cubic-bezier(0.16, 1, 0.3, 1)'
  return (
    <Balise
      className={className}
      style={{
        ...(pret ? visible : cache),
        transition: reduced
          ? `opacity ${String(Math.min(duree, 400))}ms ease ${String(delai)}ms`
          : `opacity ${String(Math.round(duree * 0.45))}ms ${courbe} ${String(delai)}ms, transform ${String(duree)}ms ${courbe} ${String(delai)}ms, filter ${String(duree)}ms ${courbe} ${String(delai)}ms`,
        willChange: pret ? undefined : 'opacity, transform, filter',
        ...style,
      }}
    >
      {children}
    </Balise>
  )
}

/**
 * Un titre revele mot a mot a travers le rideau.
 *
 * Le texte est decoupe en mots, chacun dans son propre `Surgit` ; le dernier
 * mot part a `delai + cadence x (n - 1)`. Le titre reste une seule chaine pour
 * les lecteurs d ecran, et la coupe des lignes est celle du navigateur.
 */
export function TitreVague({
  children,
  as: Balise = 'h1',
  delai = 0,
  cadence = 70,
  className,
  style,
}: {
  readonly children: string
  readonly as?: 'h1' | 'h2' | 'p' | 'span'
  readonly delai?: number
  readonly cadence?: number
  readonly className?: string
  readonly style?: CSSProperties
}): ReactElement {
  const mots = children.split(' ')
  return (
    <Balise className={className} style={style} aria-label={children}>
      {mots.map((mot, rang) => (
        <Surgit
          key={`${mot}-${String(rang)}`}
          as="span"
          delai={delai + rang * cadence}
          distance={22}
          className="o-inline-block"
          style={{ marginRight: '0.24em' }}
        >
          <span aria-hidden="true">{mot}</span>
        </Surgit>
      ))}
    </Balise>
  )
}

/* ============================ Les barres =============================== */

/** Hauteur des barres de la documentation au-dessus d une vitrine, en pixels. */
export const CHROME = 101

/** Un lien de barre. */
export type Lien = readonly [href: string, mot: string]

/** La gelule flottante centree, en verre — Nubo, Rescale, Soda, Stackside. */
export function BarreGelule({
  marque,
  liens,
  action,
  sombre = true,
}: {
  readonly marque: ReactNode
  readonly liens: readonly Lien[]
  readonly action?: readonly [href: string, mot: string]
  readonly sombre?: boolean
}): ReactElement {
  const texte = sombre ? 'o-text-zinc-200' : 'o-text-zinc-700'
  const survol = sombre ? 'hover:o-text-white' : 'hover:o-text-zinc-950'
  return (
    // La documentation pose 101 px de barres au-dessus de la vitrine : la gelule
    // flotte en dessous, la ou un site seul la mettrait au bord.
    <div className="o-pointer-events-none o-fixed o-inset-x-0 o-z-40 o-flex o-justify-center o-px-4" style={{ top: `calc(${String(CHROME)}px + 1rem)` }}>
      <nav
        aria-label="Navigation"
        className={`o-pointer-events-auto o-flex o-items-center o-gap-1 o-rounded-full o-border-w-1 o-p-1.5 o-pl-4 o-backdrop-blur-xl ${
          sombre ? 'o-border-white-10 o-bg-black-70' : 'o-border-black-10 o-bg-white-70 dark:o-border-zinc-800 dark:o-bg-zinc-950'
        }`}
      >
        <span className={`o-mr-3 o-text-sm o-font-semibold o-tracking-tight ${sombre ? 'o-text-white' : 'o-text-zinc-950 dark:o-text-zinc-50'}`}>
          {marque}
        </span>
        {liens.map(([href, mot]) => (
          <a
            key={href}
            href={href}
            className={`o-hidden o-rounded-full o-px-3 o-py-1.5 o-text-sm o-no-underline o-transition-colors sm:o-inline-block ${texte} ${survol} focus:o-ring`}
          >
            {mot}
          </a>
        ))}
        {action !== undefined && (
          <a
            href={action[0]}
            className="o-ml-2 o-inline-flex o-items-center o-rounded-full o-px-4 o-py-1.5 o-text-sm o-font-semibold o-no-underline o-transition-opacity hover:o-opacity-85 focus:o-ring"
            style={aplat()}
          >
            {action[1]}
          </a>
        )}
      </nav>
    </div>
  )
}

/** La barre a filet : marque a gauche, liens au centre, action a droite. */
export function BarreFilet({
  marque,
  liens,
  action,
  sombre = true,
}: {
  readonly marque: ReactNode
  readonly liens: readonly Lien[]
  readonly action?: readonly [href: string, mot: string]
  readonly sombre?: boolean
}): ReactElement {
  const texte = sombre ? 'o-text-zinc-300 hover:o-text-white' : 'o-text-zinc-600 hover:o-text-zinc-950 dark:o-text-zinc-400 dark:hover:o-text-zinc-50'
  return (
    <header
      className={`o-relative o-z-30 o-border-b ${sombre ? 'o-border-white-10' : 'o-border-black-10 dark:o-border-zinc-800'}`}
    >
      <div className="o-mx-auto o-grid o-max-w-7xl o-grid-cols-2 o-items-center o-gap-4 o-px-6 o-py-5 md:o-grid-cols-3">
        <span className={`o-text-base o-font-semibold o-tracking-tight ${sombre ? 'o-text-white' : 'o-text-zinc-950 dark:o-text-zinc-50'}`}>
          {marque}
        </span>
        <nav aria-label="Navigation" className="o-hidden o-justify-center o-gap-7 md:o-flex">
          {liens.map(([href, mot]) => (
            <a key={href} href={href} className={`o-text-sm o-no-underline o-transition-colors ${texte} focus:o-ring`}>
              {mot}
            </a>
          ))}
        </nav>
        <div className="o-flex o-justify-end">
          {action !== undefined && (
            <a
              href={action[0]}
              className={`o-inline-flex o-items-center o-gap-2 o-rounded-full o-border-w-1 o-px-4 o-py-2 o-text-sm o-font-medium o-no-underline o-transition-colors focus:o-ring ${
                sombre ? 'o-border-white-20 o-text-white hover:o-bg-white-10' : 'o-border-black-20 o-text-zinc-950 hover:o-bg-black-10 dark:o-text-zinc-50 dark:hover:o-bg-zinc-800'
              }`}
            >
              {action[1]}
            </a>
          )}
        </div>
      </div>
    </header>
  )
}

/** Les coins en mono — Nordframe, Miles, Fuel, Forma. */
export function BarreCoins({
  marque,
  liens,
  droite,
  sombre = true,
}: {
  readonly marque: ReactNode
  readonly liens: readonly Lien[]
  /** Ce qui tient le coin droit : une action, une heure, une ville. */
  readonly droite?: ReactNode
  readonly sombre?: boolean
}): ReactElement {
  const texte = sombre ? 'o-text-zinc-300 hover:o-text-white' : 'o-text-zinc-600 hover:o-text-zinc-950 dark:o-text-zinc-400 dark:hover:o-text-zinc-50'
  return (
    <header className="o-relative o-z-30 o-flex o-items-center o-justify-between o-gap-6 o-px-6 o-py-5 o-font-mono o-text-xs o-uppercase o-tracking-widest md:o-px-8">
      <span className={sombre ? 'o-text-white' : 'o-text-zinc-950 dark:o-text-zinc-50'}>{marque}</span>
      <nav aria-label="Navigation" className="o-hidden o-gap-8 md:o-flex">
        {liens.map(([href, mot]) => (
          <a key={href} href={href} className={`o-no-underline o-transition-colors ${texte} focus:o-ring`}>
            {mot}
          </a>
        ))}
      </nav>
      <span className={sombre ? 'o-text-zinc-300' : 'o-text-zinc-600 dark:o-text-zinc-400'}>{droite}</span>
    </header>
  )
}

/* ============================ Les petites pieces ======================= */

/** L etiquette en gelule au-dessus du titre : « Welcome to a new era ». */
export function Etiquette({
  children,
  sombre = true,
  point = true,
}: {
  readonly children: ReactNode
  readonly sombre?: boolean
  readonly point?: boolean
}): ReactElement {
  return (
    <span
      className={`o-inline-flex o-items-center o-gap-2 o-rounded-full o-border-w-1 o-px-3 o-py-1 o-font-mono o-text-xs o-uppercase o-tracking-widest ${
        sombre ? 'o-border-white-20 o-bg-white-10 o-text-zinc-100' : 'o-border-black-10 o-bg-black-10 o-text-zinc-800 dark:o-border-zinc-800 dark:o-bg-zinc-900 dark:o-text-zinc-100'
      }`}
    >
      {point && <span aria-hidden="true" className="o-size-1.5 o-rounded-full" style={{ backgroundColor: sombre ? encreSurSombre() : encre() }} />}
      {children}
    </span>
  )
}

/** L autocollant : une gelule inclinee, comme chez Creatie. */
export function Autocollant({
  children,
  angle = -6,
  className = '',
}: {
  readonly children: ReactNode
  readonly angle?: number
  readonly className?: string
}): ReactElement {
  return (
    <span
      className={`o-inline-flex o-items-center o-gap-2 o-rounded-full o-px-4 o-py-2 o-text-sm o-font-semibold o-shadow-lg ${className}`}
      style={{ ...aplat(), transform: `rotate(${String(angle)}deg)` }}
    >
      {children}
    </span>
  )
}

/** Les deux gelules d action : une pleine, une fantome. */
export function Actions({
  pleine,
  fantome,
  sombre = true,
}: {
  readonly pleine: readonly [href: string, mot: ReactNode]
  readonly fantome?: readonly [href: string, mot: ReactNode]
  readonly sombre?: boolean
}): ReactElement {
  return (
    <div className="o-flex o-flex-wrap o-items-center o-gap-3">
      <a
        href={pleine[0]}
        className="o-inline-flex o-items-center o-gap-2 o-rounded-full o-px-6 o-py-3 o-text-sm o-font-semibold o-no-underline o-transition-transform hover:o-scale-105 focus:o-ring"
        style={aplat()}
      >
        {pleine[1]}
      </a>
      {fantome !== undefined && (
        <a
          href={fantome[0]}
          className={`o-inline-flex o-items-center o-gap-2 o-rounded-full o-border-w-1 o-px-6 o-py-3 o-text-sm o-font-semibold o-no-underline o-backdrop-blur-md o-transition-colors focus:o-ring ${
            sombre ? 'o-border-white-20 o-bg-white-10 o-text-white hover:o-bg-white-20' : 'o-border-black-20 o-text-zinc-950 hover:o-bg-black-10 dark:o-text-zinc-50 dark:hover:o-bg-zinc-800'
          }`}
        >
          {fantome[1]}
        </a>
      )}
    </div>
  )
}

/** Les classes d une carte de verre. */
export function verre(sombre = true): string {
  return sombre
    ? 'o-rounded-2xl o-border-w-1 o-border-white-10 o-bg-white-10 o-backdrop-blur-xl'
    : 'o-rounded-2xl o-border-w-1 o-border-black-10 o-bg-white-60 o-backdrop-blur-xl dark:o-border-zinc-800 dark:o-bg-zinc-900'
}

/** Le grain de film, a poser en dernier enfant d un fond sombre. */
export function Grain({ opacite = 0.06 }: { readonly opacite?: number }): ReactElement {
  return <Noise className="o-pointer-events-none o-absolute o-inset-0 o-z-10" opacity={opacite} scale={0.9} />
}

/** Quatre croix aux coins d un cadre, comme chez Fuel. */
export function Croix({ sombre = true }: { readonly sombre?: boolean }): ReactElement {
  const c = sombre ? 'o-text-white' : 'o-text-zinc-950 dark:o-text-zinc-50'
  return (
    <>
      {(['o-left-4 o-top-4', 'o-right-4 o-top-4', 'o-bottom-4 o-left-4', 'o-bottom-4 o-right-4'] as const).map((pos) => (
        <span key={pos} aria-hidden="true" className={`o-pointer-events-none o-absolute o-z-10 o-font-mono o-text-sm o-opacity-60 ${pos} ${c}`}>
          +
        </span>
      ))}
    </>
  )
}

/** Une metadonnee de coin, en mono : deux lignes au plus. */
export function Coin({
  children,
  position,
  sombre = true,
}: {
  readonly children: ReactNode
  readonly position: 'bg' | 'bd' | 'hg' | 'hd'
  readonly sombre?: boolean
}): ReactElement {
  const pos = { bg: 'o-bottom-6 o-left-6 o-text-left', bd: 'o-bottom-6 o-right-6 o-text-right', hg: 'o-top-24 o-left-6', hd: 'o-top-24 o-right-6 o-text-right' }[position]
  return (
    <p className={`o-pointer-events-none o-absolute o-z-20 o-m-0 o-font-mono o-text-xs o-uppercase o-leading-relaxed o-tracking-widest ${pos} ${sombre ? 'o-text-zinc-400' : 'o-text-zinc-500 dark:o-text-zinc-400'}`}>
      {children}
    </p>
  )
}

/** L heure locale en direct, comme chez Gallary. */
export function Horloge({ ville = 'Paris', fuseau = 'Europe/Paris' }: { readonly ville?: string; readonly fuseau?: string }): ReactElement {
  const [heure, setHeure] = useState('')
  useEffect(() => {
    const format = new Intl.DateTimeFormat('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit', timeZone: fuseau })
    const tic = (): void => {
      setHeure(format.format(new Date()))
    }
    tic()
    const id = window.setInterval(tic, 1000)
    return () => {
      window.clearInterval(id)
    }
  }, [fuseau])
  return (
    <span className="o-tabular-nums">
      {ville} {heure}
    </span>
  )
}

/** L indice d une section, en mono : « (04) — Le parc ». */
export function Indice({ rang, children, sombre = true }: { readonly rang: string; readonly children: ReactNode; readonly sombre?: boolean }): ReactElement {
  return (
    <p className={`o-m-0 o-flex o-items-center o-gap-3 o-font-mono o-text-xs o-uppercase o-tracking-widest ${sombre ? 'o-text-zinc-400' : 'o-text-zinc-500 dark:o-text-zinc-400'}`}>
      <span style={{ color: sombre ? encreSurSombre() : encre() }}>({rang})</span>
      <span aria-hidden="true" className={`o-h-px o-w-6 ${sombre ? 'o-bg-white-20' : 'o-bg-black-20 dark:o-bg-zinc-800'}`} />
      {children}
    </p>
  )
}

/* ============================ Les sections de vocabulaire ============== */

/**
 * Le manifeste : une phrase de 40-64 px dont la premiere moitie est eteinte.
 *
 * @param eteint La partie grisee, qui prepare ; `children` est ce qui tombe.
 */
export function Manifeste({
  eteint,
  children,
  sombre = true,
  className = '',
}: {
  readonly eteint: ReactNode
  readonly children: ReactNode
  readonly sombre?: boolean
  readonly className?: string
}): ReactElement {
  return (
    <p
      className={`o-m-0 o-max-w-5xl o-text-balance ${className}`}
      style={{ ...affiche('m', 300), fontSize: 'clamp(1.75rem, 3.6vw, 3.75rem)', lineHeight: 1.1 }}
    >
      <span className={sombre ? 'o-text-zinc-500' : 'o-text-zinc-500 dark:o-text-zinc-500'}>{eteint} </span>
      <span className={sombre ? 'o-text-white' : 'o-text-zinc-950 dark:o-text-zinc-50'}>{children}</span>
    </p>
  )
}

/** Une ligne de liste numerotee. */
export interface Numero {
  readonly titre: ReactNode
  readonly texte: ReactNode
  /** Un media a droite : image, rendu, maquette. */
  readonly media?: ReactNode
}

/** La liste numerotee : `01 02 03` en 120 px a gauche — Fuel, Salonix. */
export function Numerotee({ lignes, sombre = true }: { readonly lignes: readonly Numero[]; readonly sombre?: boolean }): ReactElement {
  const filet = sombre ? 'o-border-white-10' : 'o-border-black-10 dark:o-border-zinc-800'
  return (
    <ol className={`o-m-0 o-list-none o-border-t o-p-0 ${filet}`}>
      {lignes.map((ligne, rang) => (
        <li key={rang} className={`o-grid o-items-center o-gap-6 o-border-b o-py-8 md:o-grid-cols-12 md:o-gap-10 ${filet}`}>
          <span
            aria-hidden="true"
            className={`o-tabular-nums md:o-col-span-3 ${sombre ? 'o-text-white' : 'o-text-zinc-950 dark:o-text-zinc-50'}`}
            style={affiche('l', 300)}
          >
            {String(rang + 1).padStart(2, '0')}
          </span>
          <div className={ligne.media === undefined ? 'md:o-col-span-9' : 'md:o-col-span-5'}>
            <h3 className={`o-m-0 o-text-2xl o-font-medium o-tracking-tight ${sombre ? 'o-text-white' : 'o-text-zinc-950 dark:o-text-zinc-50'}`}>
              <span className="o-sr-only">{String(rang + 1).padStart(2, '0')} — </span>
              {ligne.titre}
            </h3>
            <p className={`o-mt-3 o-max-w-md o-text-base o-leading-relaxed ${sombre ? 'o-text-zinc-400' : 'o-text-zinc-600 dark:o-text-zinc-400'}`}>{ligne.texte}</p>
          </div>
          {ligne.media !== undefined && <div className="o-min-w-0 md:o-col-span-4">{ligne.media}</div>}
        </li>
      ))}
    </ol>
  )
}

/** Un chiffre de la barre. */
export interface Nombre {
  readonly valeur: string
  readonly quoi: string
}

/** La barre de chiffres : quatre nombres en 64-96 px sur filets. */
export function Chiffres({
  nombres,
  sombre = true,
  verre: enVerre = false,
}: {
  readonly nombres: readonly Nombre[]
  readonly sombre?: boolean
  /** Vrai pour la barre en verre de l ouverture (Altitude, Stackside). */
  readonly verre?: boolean
}): ReactElement {
  const filet = sombre ? 'o-border-white-10' : 'o-border-black-10 dark:o-border-zinc-800'
  return (
    <dl
      className={`o-m-0 o-grid o-grid-cols-2 o-gap-px lg:o-grid-cols-4 ${enVerre ? `${verre(sombre)} o-overflow-hidden o-p-1` : `o-border-t ${filet}`}`}
    >
      {nombres.map((n, rang) => (
        <Surgit key={n.quoi} delai={200 + rang * 90} as="div" className={enVerre ? 'o-px-5 o-py-4' : `o-py-6 o-pr-6 ${rang > 0 ? `lg:o-border-l lg:o-pl-6 ${filet}` : ''}`}>
          <dt className={`o-tabular-nums o-tracking-tighter ${sombre ? 'o-text-white' : 'o-text-zinc-950 dark:o-text-zinc-50'}`} style={{ ...affiche('m', 300), fontSize: enVerre ? 'clamp(1.75rem, 3vw, 2.75rem)' : 'clamp(2.5rem, 5vw, 5rem)' }}>
            {n.valeur}
          </dt>
          <dd className={`o-m-0 o-mt-2 o-font-mono o-text-xs o-uppercase o-tracking-widest ${sombre ? 'o-text-zinc-400' : 'o-text-zinc-500 dark:o-text-zinc-400'}`}>{n.quoi}</dd>
        </Surgit>
      ))}
    </dl>
  )
}

/** La bande de logos : des mots-marques en gris, fondus aux bords. */
export function Logos({ marques, titre, sombre = true }: { readonly marques: readonly string[]; readonly titre?: ReactNode; readonly sombre?: boolean }): ReactElement {
  return (
    <div className="o-py-8">
      {titre !== undefined && (
        <p className={`o-mb-5 o-text-center o-font-mono o-text-xs o-uppercase o-tracking-widest ${sombre ? 'o-text-zinc-500' : 'o-text-zinc-500 dark:o-text-zinc-400'}`}>{titre}</p>
      )}
      <Marquee speed={70} fade={14}>
        {marques.map((m) => (
          <span key={m} className={`o-shrink-0 o-px-10 o-text-xl o-font-semibold o-tracking-tight ${sombre ? 'o-text-zinc-500' : 'o-text-zinc-500 dark:o-text-zinc-500'}`}>
            {m}
          </span>
        ))}
      </Marquee>
    </div>
  )
}

/** L appel final : « On commence ? » en 120 px, une gelule. */
export function Appel({
  titre,
  texte,
  action,
  sombre = true,
}: {
  readonly titre: string
  readonly texte?: ReactNode
  readonly action: readonly [href: string, mot: ReactNode]
  readonly sombre?: boolean
}): ReactElement {
  return (
    <section className="o-relative o-isolate o-overflow-hidden o-px-6 o-py-24 o-text-center md:o-py-36">
      <h2 className={`o-m-0 ${sombre ? 'o-text-white' : 'o-text-zinc-950 dark:o-text-zinc-50'}`} style={affiche('xl', 300)}>
        {titre}
      </h2>
      {texte !== undefined && <p className={`o-mx-auto o-mt-6 o-max-w-xl o-text-lg o-leading-relaxed ${sombre ? 'o-text-zinc-400' : 'o-text-zinc-600 dark:o-text-zinc-400'}`}>{texte}</p>}
      <div className="o-mt-10 o-flex o-justify-center">
        <Actions pleine={action} sombre={sombre} />
      </div>
    </section>
  )
}

/** Une colonne du pied. */
export interface ColonnePied {
  readonly titre: string
  readonly liens: readonly Lien[]
}

/** Le pied : mot-marque geant, colonnes en mono, `© 2026`. */
export function Pied({
  marque,
  colonnes,
  mention,
  sombre = true,
}: {
  readonly marque: string
  readonly colonnes: readonly ColonnePied[]
  readonly mention: ReactNode
  readonly sombre?: boolean
}): ReactElement {
  const filet = sombre ? 'o-border-white-10' : 'o-border-black-10 dark:o-border-zinc-800'
  const doux = sombre ? 'o-text-zinc-400 hover:o-text-white' : 'o-text-zinc-600 hover:o-text-zinc-950 dark:o-text-zinc-400 dark:hover:o-text-zinc-50'
  return (
    <footer className={`o-relative o-overflow-hidden o-border-t o-px-6 o-pt-14 ${filet}`}>
      <div className="o-mx-auto o-grid o-max-w-7xl o-gap-10 sm:o-grid-cols-2 lg:o-grid-cols-4">
        {colonnes.map((col) => (
          <div key={col.titre}>
            <p className={`o-m-0 o-font-mono o-text-xs o-uppercase o-tracking-widest ${sombre ? 'o-text-zinc-500' : 'o-text-zinc-500 dark:o-text-zinc-400'}`}>{col.titre}</p>
            <ul className="o-m-0 o-mt-4 o-flex o-list-none o-flex-col o-gap-2 o-p-0">
              {col.liens.map(([href, mot]) => (
                <li key={`${href}-${mot}`}>
                  <a href={href} className={`o-text-sm o-no-underline o-transition-colors ${doux} focus:o-ring`}>
                    {mot}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <p
        aria-hidden="true"
        className={`o-m-0 o-mt-16 o-select-none o-whitespace-nowrap o-text-center o-leading-tight ${sombre ? 'o-text-white' : 'o-text-zinc-950 dark:o-text-zinc-50'}`}
        style={{ ...affiche('xxl', 800), fontSize: 'clamp(3rem, 17.5vw, 19rem)', lineHeight: 0.82 }}
      >
        {marque}
      </p>
      <div className={`o-mx-auto o-flex o-max-w-7xl o-flex-wrap o-items-center o-justify-between o-gap-4 o-border-t o-py-6 o-font-mono o-text-xs o-uppercase o-tracking-widest ${filet} ${sombre ? 'o-text-zinc-500' : 'o-text-zinc-500 dark:o-text-zinc-400'}`}>
        <span>{mention}</span>
        <span>© 2026 {marque}</span>
      </div>
    </footer>
  )
}
